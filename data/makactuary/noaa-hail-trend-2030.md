# makactuary/noaa-hail-trend-2030

## Resumen

`makactuary/noaa-hail-trend-2030` no es un modelo de lenguaje ni una red neuronal: es un modelo estadístico publicado en HuggingFace que estima la tendencia anual del número de informes de granizo grande (≥ 2 pulgadas) en EE. UU. y proyecta su valor para 2030. Lo desarrolla el usuario `makactuary` como soporte del artículo «Dolu Büyyor, Veri Küçülüyor» del blog Café Poliçe, con código en el repositorio `000MAK/cafepolice-climate-losses` y datos en el dataset `makactuary/noaa-storm-events-hail-1996-2025`.

El problema que resuelve es acotado y práctico: dado el recuento anual de reportes NOAA Storm Events entre 1996 y 2025, ajusta un GLM quasi-Poisson con enlace logarítmico, `log λ = a + b·(year − 2010)`, con `a = 6,500` y `b = 0,0247` (error estándar 0,0051), lo que equivale a una tendencia del +2,5 % anual (IC 95 %: 1,5–3,5 %). La proyección a 2030 se obtiene muestreando la pendiente de su distribución y añadiendo ruido binomial negativo.

Su relevancia es sectorial, no generalista: sirve como pieza de analítica de riesgo climático para tarificación, reaseguro y planificación actuarial, y destaca por una validación fuera de muestra explícita (ajuste 1996–2015, predicción 2016–2025: 8.539 reportes predichos frente a 8.525 observados, contra 6.072 de una media plana). No tiene capacidades lingüísticas, visión ni generación de texto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM quasi-Poisson (regresión log-lineal) sobre recuentos anuales; `log λ = a + b·(year − 2010)` |
| Parametros totales | 2 coeficientes (`a = 6,500`, `b = 0,0247`) más el parámetro de dispersión (38,6); no es un modelo paramétrico denso |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; la serie de entrada son 30 observaciones anuales) |
| Tipos de cuantizacion | No aplica (parámetros en coma flotante dentro de un JSON) |
| Idiomas soportados | No disponible / no aplica (sin capacidad lingüística; documentación en inglés) |
| Licencia | MIT |
| Formato de pesos | JSON (`trend_model.json`); se acompañan `metrics.json`, `annual_series.csv` y `01_dolu_ve_hasar_kaydi.png` |

## Arquitectura y entrenamiento

El modelo es un GLM quasi-Poisson con función de enlace logarítmica aplicado a una serie temporal anual de recuentos. La variable respuesta es el número de informes anuales de granizo ≥ 2 pulgadas en EE. UU. procedentes de NOAA Storm Events (1996–2025, 30 puntos). El predictor es lineal en el año, centrado en 2010 para estabilizar la intercepción. La elección de quasi-Poisson en lugar de Poisson se justifica por la sobredispersión observada (dispersión estimada 38,6), que invalida los errores estándar de un Poisson ordinario.

No hay entrenamiento en el sentido de deep learning: los coeficientes se estiman por quasi-verosimilitud sobre los datos públicos de NOAA, sin RLHF, DPO ni ajuste por preferencias. La innovación metodológica reseñable es doble: (1) validación temporal fuera de muestra (ajuste con 1996–2015 y predicción ciega de 2016–2025), y (2) generación de la proyección 2030 mediante simulación, extrayendo la pendiente de su distribución muestral y añadiendo ruido binomial negativo para propagar la incertidumbre, en lugar de ofrecer una única cifra puntual.

## Capacidades

- Estimación de tendencia: devuelve la pendiente anual del recuento de reportes de granizo grande y su intervalo de confianza al 95 % (+2,5 % anual; 1,5–3,5 %).
- Predicción puntual: evalúa λ(year) para cualquier año mediante `exp(a + b·(year − 2010))`.
- Proyección con incertidumbre: genera la distribución del recuento esperado en 2030 (media 1.096 reportes; intervalo 80 % 808–1.405).
- Backtesting: incorpora una prueba de hold-out documentada (8.539 predichos frente a 8.525 observados en 2016–2025).
- Comparación contra baseline: cuantifica la mejora frente al modelo de media plana (6.072).
- Reproducibilidad completa: solo requiere leer `trend_model.json` y aplicar una exponencial; sin dependencias de GPU ni de frameworks de inferencia.
- No soporta tool calling, agentes, razonamiento multi-paso, generación de código, matemáticas simbólicas, visión, audio ni capacidades multilingües.

## Casos de uso

- Tarificación de seguros de daños por granizo: usar la frecuencia esperada λ(2030) como input del módulo de frecuencia en un modelo de pricing, ajustando la prima técnica a la tendencia del +2,5 % anual.
- Planificación de reaseguro: dimensionar retenciones y límites de cobertura con la distribución de 2030 (intervalo 80 %: 808–1.405 reportes) en lugar de con una estimación puntual.
- Stress testing y escenarios climáticos: incorporar la tendencia estimada como escenario base en ejercicios internos de solvencia, con la advertencia de que el modelo cubre solo EE. UU. y recuentos de reportes, no pérdidas.
- Contraste de carteras: comparar la tendencia de la frecuencia siniestral propia con la tendencia NOAA del modelo para detectar desviaciones atribuibles a exposición, mix de negocio o gestión de siniestros.
- Reporting técnico y comunicación: alimentar notas técnicas y artículos divulgativos (es el caso del artículo de Café Poliçe) con cifras trazables y código reproducible.
- Docencia y formación actuarial: ejemplo compacto y verificable de GLM con sobredispersión, validación temporal y simulación de intervalos de predicción.
- Priorización de datos internos: el modelo evidencia que el recuento de reportes depende de la densidad de observadores y de la práctica de notificación, lo que sirve para justificar la compra o construcción de series propias de siniestralidad.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| Hold-out: ajuste 1996–2015, predicción 2016–2025 | 8.539 reportes predichos frente a 8.525 observados |
| Baseline de media plana (misma ventana) | 6.072 reportes |
| Tendencia estimada | +2,5 % anual (IC 95 %: 1,5–3,5 %) |
| Error estándar de la pendiente | 0,0051 |
| Dispersión (quasi-Poisson) | 38,6 |
| Proyección 2030 | Media 1.096 reportes; intervalo 80 %: 808–1.405; un 59 % por encima de la media 1996–2025 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) porque el modelo no es un modelo de lenguaje. Tampoco se han publicado comparaciones con modelos de series temporales alternativos (ARIMA, GAM, gradient boosting) en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo son dos coeficientes en un JSON de kilobytes (el repositorio ocupa 0,0 GB).
- GPU: no requiere GPU de ningún tipo. Funciona en CPU, incluidos portátiles y entornos serverless de gama mínima.
- Cabe en cualquier hardware: desde un Raspberry Pi hasta una instancia Lambda; no hay requisito de memoria reseñable.
- Despliegue: cualquier lenguaje con `exp()` (Python, R, Excel, SQL); típicamente un script que lea `trend_model.json` y exponga λ(year) vía FastAPI o como UDF en el almacén de datos.
- Latencia y throughput: evaluación en microsegundos por año consultado; el coste dominante es la E/S del fichero. El muestreo de la proyección 2030 (pendiente + ruido binomial negativo) es también trivial en CPU.
- No dispone de integración con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo neuronal.

## Comparativa con modelos similares

| Alternativa | Tipo | Ventaja frente a este modelo | Limitación / disponibilidad |
|---|---|---|---|
| GLM Poisson estándar | Regresión log-lineal sin corrección de sobredispersión | Mayor simplicidad; errores estándar más estrechos | Infravalora la incertidumbre con dispersión 38,6; no disponible como artefacto publicado |
| GLM binomial negativo | Regresión con varianza cuadrática | Modela explícitamente la sobredispersión en la verosimilitud | No disponible en la información proporcionada; el autor optó por quasi-Poisson con ruido NB solo en la simulación |
| ARIMA / suavizado exponencial | Serie temporal clásica | Captura autocorrelación y estacionalidad si existiera | No disponible; con 30 puntos anuales el margen de parametrización es escaso |
| Gradient boosting (LightGBM, XGBoost) | ML tabular/no lineal | Admite covariables (geografía, exposición, densidad de observadores) | No disponible; con 30 observaciones anuales el sobreajuste es probable |
| Teoría de valores extremos (GEV/POT) | Modelado de colas | Apropiado para severidad, no solo frecuencia | No disponible; este modelo aborda recuentos, no magnitudes ni pérdidas |

## Limitaciones y advertencias

- Proxy, no pérdida: el recuento de reportes de granizo no equivale a pérdidas aseguradas ni a severidad; no debe usarse directamente como exposure curve.
- Sesgo de observación: la densidad de observadores y las prácticas de notificación afectan al recuento, y el modelo no puede separar el efecto climático de esos factores, tal como reconoce el propio autor.
- Ámbito geográfico restringido: solo EE. UU.; no es trasladable sin más a España u otros mercados.
- Potencia estadística limitada: 30 observaciones anuales y un error estándar de la pendiente de 0,0051 implican un IC del 1,5–3,5 %, es decir, una horquilla de más del doble entre extremos.
- Extrapolación: 2030 queda cinco años fuera del rango de datos (1996–2025); el modelo asume un crecimiento exponencial constante en el logaritmo, supuesto que puede romperse.
- Amplitud de la proyección: el intervalo del 80 % (808–1.405) es muy ancho para decisiones de pricing que exijan granularidad; conviene tratarlo como escenario, no como cifra de negocio.
- Sin resolución espacial: agregado nacional, sin desagregación por estado ni por región de riesgo.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; sin revisión por pares ni validación independiente conocida.
- Documentación incompleta: la model card está en inglés, el título del artículo en turco y no se detallan el proceso exacto de filtrado del dataset ni el código de simulación en la información disponible.
- Licencia MIT: permite uso comercial y modificación con atribución y sin garantía; no obstante, la responsabilidad del uso actuarial recae en quien lo integra.
- Alucinación: no aplica en sentido lingüístico, pero sí existe riesgo de sobreinterpretación de la tendencia como causalidad climática.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/makactuary/noaa-hail-trend-2030
- Dataset de entrada: https://huggingface.co/datasets/makactuary/noaa-storm-events-hail-1996-2025
- Código del artículo: https://github.com/000MAK/cafepolice-climate-losses
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo, al artículo o a NOAA; los resultados devueltos eran contenidos de foro sin relación con el tema.
