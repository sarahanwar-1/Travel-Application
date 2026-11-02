// Fallback image used when a photo fails to load
const FALLBACK_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#cfe0f5"/><stop offset="1" stop-color="#7fa9dd"/>
      </linearGradient></defs>
      <rect width="800" height="600" fill="url(#g)"/>
    </svg>`
  );

const searchInput = document.getElementById("searchInput");
const resultsSection = document.getElementById("resultsSection");
const resultsContainer = document.getElementById("results");
const resultsTitle = document.getElementById("resultsTitle");

// Escape text before putting it in innerHTML
function escapeHTML(str = "") {
  return String(str).replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[ch]));
}

// Fetch data from JSON
async function loadData() {
  try {
    const response = await fetch("travel_recommendation_api.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

function showMessage(text) {
  resultsContainer.innerHTML = `<p class="message">${escapeHTML(text)}</p>`;
}

function showSection(title) {
  resultsTitle.textContent = title;
  resultsSection.hidden = false;
}

function renderCards(places) {
  resultsContainer.innerHTML = "";
  places.forEach((place, i) => {
    const card = document.createElement("article");
    card.className = "result-card";
    card.style.animationDelay = `${i * 70}ms`;
    card.innerHTML = `
      <div class="thumb">
        <img src="${escapeHTML(place.imageUrl)}" alt="${escapeHTML(place.name)}" loading="lazy">
      </div>
      <div class="body">
        <h3>${escapeHTML(place.name)}</h3>
        <p>${escapeHTML(place.description)}</p>
      </div>
    `;
    card.querySelector("img").addEventListener("error", e => {
      e.target.src = FALLBACK_IMG;
    }, { once: true });
    resultsContainer.appendChild(card);
  });
}

// Search function
async function search() {
  const input = searchInput.value.toLowerCase().trim();

  if (!input) {
    showSection("Search");
    showMessage("Please enter a search term.");
    return;
  }

  const data = await loadData();
  if (!data) {
    showSection("Search");
    showMessage("Sorry, we couldn't load destinations right now. Please try again.");
    return;
  }

  let results = [];
  let title = "Recommendations";

  if (input === "beach" || input === "beaches") {
    results = data.beaches;
    title = "Beach recommendations";
  } else if (input === "temple" || input === "temples") {
    results = data.temples;
    title = "Temple recommendations";
  } else {
    const country = data.countries.find(c => c.name.toLowerCase() === input);
    if (country) {
      results = country.cities;
      title = `Cities in ${country.name}`;
    }
  }

  showSection(title);

  if (results.length) {
    renderCards(results);
  } else {
    showMessage("No results found. Try 'beach', 'temple', or a country name (e.g. Japan, Italy).");
  }

  resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Reset function
function clearResults() {
  searchInput.value = "";
  resultsContainer.innerHTML = "";
  resultsSection.hidden = true;
}

// Events
document.getElementById("searchBtn").addEventListener("click", search);
document.getElementById("resetBtn").addEventListener("click", clearResults);
searchInput.addEventListener("keydown", e => {
  if (e.key === "Enter") search();
});

// Navbar gets a solid background after scrolling
const header = document.getElementById("siteHeader");
const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 40);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Contact form (demo only: no server)
document.getElementById("contactForm").addEventListener("submit", e => {
  e.preventDefault();
  document.getElementById("formNote").textContent = "Thanks! We'll be in touch soon.";
  e.target.reset();
});

// Footer year
document.getElementById("year").textContent = new Date().getFullYear();