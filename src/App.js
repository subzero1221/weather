import { useEffect, useState } from "react";

function getWeatherIcon(wmoCode) {
  const icons = new Map([
    [[0], "☀️"],
    [[1], "🌤"],
    [[2], "⛅️"],
    [[3], "☁️"],
    [[45, 48], "🌫"],
    [[51, 56, 61, 66, 80], "🌦"],
    [[53, 55, 63, 65, 57, 67, 81, 82], "🌧"],
    [[71, 73, 75, 77, 85, 86], "🌨"],
    [[95], "🌩"],
    [[96, 99], "⛈"],
  ]);
  const arr = [...icons.keys()].find((key) => key.includes(wmoCode));
  if (!arr) return "NOT FOUND";
  return icons.get(arr);
}

export function convertToFlag(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

function formatDay(dateStr) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
  }).format(new Date(dateStr));
}

export default function App() {
  const [query, setQuery] = useState("");
  const [flag, setFlag] = useState("");
  const [name, setName] = useState("");
  const [time, setTime] = useState([]);
  const [code, setCode] = useState([]);
  const [max, setMax] = useState([]);
  const [min, setMin] = useState([]);
  const [myQuery, setMyQuery] = useState("");

  useEffect(
    function () {
      async function getWeather(myQuery) {
        try {
          const geoRes = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${myQuery}`
          );
          const geoData = await geoRes.json();

          if (!geoData.results) throw new Error("Location not found");

          const { latitude, longitude, timezone, name, country_code } =
            geoData.results.at(0);
          console.log(`${name} ${convertToFlag(country_code)}`);

          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&daily=weathercode,temperature_2m_max,temperature_2m_min`
          );
          const weatherData = await weatherRes.json();

          setFlag((f) => (f = convertToFlag(country_code)));
          setName((n) => (n = name));

          setTime(weatherData.daily.time);
          setCode(weatherData.daily.weathercode);
          setMax(weatherData.daily.temperature_2m_max);
          setMin(weatherData.daily.temperature_2m_min);
        } catch (err) {}
      }
      getWeather(myQuery);
    },
    [myQuery]
  );

  function handleQuery() {
    setMyQuery((my) => (my = query));
  }
  console.log(flag);

  return (
    <div className="app">
      <h1>Weather</h1>
      <div>
        <input
          type="text"
          placeholder="type your location"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        ></input>
      </div>
      <button className="button" onClick={handleQuery}>
        search
      </button>
      <Location flag={flag} name={name}></Location>
      <ul className="weather">
        {!flag && myQuery ? (
          <Loading />
        ) : (
          time.map((t, i) => {
            return (
              <Weather
                time={t}
                max={max}
                min={min}
                code={code}
                id={i}
                key={i}
              />
            );
          })
        )}
      </ul>
    </div>
  );
}

function Loading() {
  return <div className="loader">Loading...</div>;
}

function Location({ flag, name }) {
  return (
    <div>
      <h2>
        WEATHER {name}
        {flag}
      </h2>
    </div>
  );
}

function Weather({ time, code, max, min, id }) {
  return (
    <li className="day">
      <span>
        <p>{getWeatherIcon(code[id])}</p>
      </span>
      <p>{id < 1 ? "Today" : formatDay(time)}</p>
      <p className="grad">
        max:{Math.floor(max[id])}&deg; &mdash; min: {Math.ceil(min[id])}
      </p>
    </li>
  );
}
