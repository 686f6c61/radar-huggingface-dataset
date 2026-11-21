# Elpriser/denmark-price-forecast

## Resumen

Elpriser/denmark-price-forecast es un conjunto de modelos de regresión tabular basados en LightGBM para pronosticar el precio spot diario de la electricidad en las dos zonas de precio danesas, DK1 (Dinamarca occidental) y DK2 (Dinamarca oriental), con horizontes de 2 a 9 días vista. Lo desarrolla el proyecto Elpriser y es el modelo exacto que alimenta la previsión pública de elpriser.org/prognose. No es un modelo de lenguaje: es un sistema de forecasting de series temporales con salida cuantílica horaria (P10/P50/P90) en DKK/MWh.

La versión v3 se centra en corregir tres limitaciones declaradas de la v2: la congestión de los interconectores (modelada ahora mediante clima de las zonas vecinas y capacidad de transferencia mensual de ENTSO-E), la resolución espacial del clima (14 puntos, incluyendo clústeres eólicos offshore como Horns Rev, Anholt y Rødsand, además de viento alemán y solar alemana) y la mezcla de forma intradía (con un guardián de régimen). Para cada zona se entrenan tres regresores cuantílicos LightGBM con unos 166.000 registros por área.

El repositorio es "vivo": se reentrena y resube a diario a las 12:10 UTC, tras la publicación de la subasta day-ahead, de modo que los pesos publicados coinciden con los de producción. Esto lo hace relevante para cualquiera que necesite un pronóstico reproducible y auditable de precios mayoristas daneses sin construir el pipeline desde cero.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gradient boosting de árboles (LightGBM) con regresión cuantílica, tres boosters por zona (α = 0,1 / 0,5 / 0,9) |
| Parámetros totales | no disponible (modelos de árboles; tamaño determinado por número de hojas y profundidad, no declarado) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de features basada en lags de hasta 28 días y horizontes de 2 a 9 días |
| Tipos de cuantización | no aplica (formato de texto LightGBM); no se documentan conversiones a otros formatos |
| Idiomas soportados | no disponible (modelo numérico, sin procesamiento de lenguaje) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | texto LightGBM (`dk1_lo/md/hi.txt`, `dk2_lo/md/hi.txt`), más estimadores auxiliares `wind_estimator_dk1/dk2/de.txt` |

## Arquitectura y entrenamiento

El modelo es un ensemble de regresores cuantílicos LightGBM (`objective=quantile`) entrenados por separado para DK1 y DK2. Cada zona usa tres boosters (P10, P50, P90) sobre aproximadamente 166.000 filas que cubren desde el 15 de marzo de 2024 hasta la fecha de entrenamiento, con 8 horizontes × 24 horas. Se acompañan de pequeños regresores clima→producción que construyen dos de las features (`est_prod`, `est_prod_de`). Las dos zonas no comparten conjunto de features de forma deliberada: el bloque de capacidad de interconexión ayuda a DK1 pero perjudica a DK2 en el backtest, ya que DK1 tiene cuatro fronteras frente a las dos de DK2. `config.json` registra qué variante usa cada zona.

Las features (unas 55-60 por fila, según zona) incluyen calendario (`hour`, `weekday`, `month`, `is_weekend`, `doy_sin`, `doy_cos`, `h`), historial de precios (`lag1/2/3/7/14/21/28`, `seasonal4w`, `last_day_mean`), clima por punto al lead correcto (`wind_p0..p3`, `rad_p0..p3`, `temp_p0..p3`, viento y radiación de Alemania y de las zonas vecinas NO2, SE3, SE4, NL, más medias y `wind_spread`), producción derivada y, solo en DK1, capacidad de interconexión (`ntc_{border}_{exp,imp}` normalizada por el máximo de cada frontera, `ntc_exp_mean`, `ntc_imp_mean`, `ntc_min`). Los lags de precio se rellenan solo cuando son conocidos en el momento de emisión (`k >= h-1`) para evitar leakage. El clima proviene de la API previous-runs de Open-Meteo (`previous_day{1..7}`), con lead `min(h, 7)`; ese archivo arranca el 15 de marzo de 2024 y fija la ventana de entrenamiento.

El post-procesado es parte del modelo: se aplica una mezcla híbrida de forma intradía con guardián de régimen (se conserva el nivel diario del modelo y se mezcla la forma con el perfil estacional de 28 días, con `a = 0,5` por defecto; el guardián reduce `a` hacia 0 cuando la forma estacional se degrada respecto a su mediana de 90 días) y un ensanchamiento de bandas conformal por zona y horizonte (`calibration_hourly.json`). El booster crudo no es el modelo completo.

## Capacidades

- Pronóstico cuantílico horario (P10/P50/P90) del precio spot day-ahead en DK1 y DK2, en DKK/MWh, para horizontes de 2 a 9 días.
- Pass-through de precios day-ahead ya publicados para horizontes 0-1 (no modelados).
- Modelización de congestión de interconectores mediante clima de zonas vecinas y capacidad de transferencia mensual (ENTSO-E A61, tipo A03), sin leakage en los horizontes cubiertos.
- Resolución espacial del clima en 14 puntos, con señal propia de dispersión (`wind_spread`) para detectar frentes.
- Estimación de producción eólica y solar a partir de variables meteorológicas mediante regresores auxiliares.
- Calibración conformal de intervalos por zona y horizonte.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un regresor tabular.

## Casos de uso

- Trading y gestión de riesgo en mercados day-ahead: usar la distribución P10/P50/P90 en DK1 y DK2 para dimensionar posiciones y calcular value-at-risk en horizontes de 2 a 9 días, aprovechando que los intervalos están calibrados de forma conformal por horizonte.
- Optimización de consumo industrial: programar cargas flexibles (electrólisis, bombeo, hornos) a partir de la forma intradía pronosticada, que combina el nivel del modelo con el perfil estacional de las últimas cuatro semanas.
- Gestión de carteras de renovables: cruzar la previsión de precio con `est_prod` y `est_prod_de` para estimar el precio de captura de parques eólicos daneses y su sensibilidad a la producción alemana.
- Análisis de congestión transfronteriza: en DK1, explotar las features `ntc_*` y el clima de NO2, SE3, SE4 y NL para anticipar episodios en los que el spread de precio satura una frontera.
- Investigación académica en mercados eléctricos: el repositorio incluye el código exacto de entrenamiento e inferencia (`train_daily.py`, `dataset.py`, `fetch_ntc.py`, `fetch_weather_v3.py`) y el dataset hermano, lo que permite reproducir y auditar el pipeline completo.
- Cuadros de mando para consumidores y agregadores: alimentar aplicaciones tipo elpriser.org/prognose con pronósticos horarios actualizados a diario tras la subasta, sin necesidad de mantener infraestructura propia de datos meteorológicos y ENTSO-E.
- Benchmarking de modelos de forecasting: servir como baseline fuerte y reproducible (reentrenado a diario) frente a alternativas como SARIMAX, Prophet o redes neuronales temporales en el mismo mercado.

## Benchmarks y rendimiento

La model card menciona un backtest y una ablación que compara el efecto de cada cambio de la v3 (incluida la evidencia de que el bloque de capacidad de interconexión perjudica a DK2), pero en la información disponible no se incluyen las cifras concretas de error (MAE, RMSE, pinball loss) ni comparaciones numéricas con otros modelos.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: los boosters LightGBM en formato texto se cargan con `lightgbm.Booster` y no requieren GPU; un portátil convencional basta para generar los pronósticos horarios de ambas zonas.
- VRAM estimada: no aplica (no hay inferencia en GPU documentada).
- GPU recomendadas: no aplica; el entrenamiento diario puede ejecutarse en CPU, aunque no se documenta el hardware usado por el autor.
- Cabe en cualquier equipo consumer: el cuello de botella es la recolección de datos (Open-Meteo previous-runs, ENTSO-E), no el cómputo.
- Opciones de despliegue: carga directa con la librería `lightgbm` en Python; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Cobertura | Horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Elpriser/denmark-price-forecast v3 | LightGBM cuantílico | DK1 y DK2 | 2-9 días | CC-BY-4.0 | Hugging Face, reentrenado a diario |
| Alternativas de forecasting eléctrico open source | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (forecasting de precio day-ahead para mercados nórdicos o continentales) en los resultados de búsqueda proporcionados, que se limitan a portales de precios al consumidor (elen.nu, elbruk.se, andelenergi.dk, norlys.dk, elprisr.se) y no a modelos.

## Limitaciones y advertencias

- Cobertura geográfica restringida a DK1 y DK2; no es aplicable a otros mercados sin reentrenamiento.
- El booster crudo no es el modelo completo: sin aplicar la mezcla híbrida de forma con guardián de régimen y la calibración conformal (`calibration_hourly.json`), las predicciones y los intervalos no son los de producción.
- La ventana de entrenamiento empieza el 15 de marzo de 2024, limitada por la disponibilidad del archivo previous-runs de Open-Meteo; no cubre regímenes de mercado anteriores.
- El bloque de capacidad de interconexión solo se usa en DK1 porque degrada a DK2 en backtest; asumir el mismo feature set en ambas zonas es un error.
- Dependencia de fuentes externas (Open-Meteo, ENTSO-E) cuya latencia o cambios de API pueden romper el pipeline diario.
- Riesgo de deriva de régimen: el guardián de la mezcla de forma es unidireccional y conservador; se probó y descartó un peso de mezcla ajustado libremente por grid search mensual.
- Licencia CC-BY-4.0: permite uso comercial con atribución; hay que citar al autor y mantener la referencia a la licencia.
- No se documentan sesgos, tasas de alucinación (no aplica a un regresor) ni métricas de error publicadas en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Elpriser/denmark-price-forecast
- Dataset hermano: https://huggingface.co/datasets/Elpriser/denmark-power-market
- Aplicación en producción: https://elpriser.org/prognose
- Open-Meteo previous-runs API: https://open-meteo.com/
- ENTSO-E (capacidad de transferencia, A61/A03): https://www.entsoe.eu/
