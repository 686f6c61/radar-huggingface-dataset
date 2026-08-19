# Elpriser/denmark-price-forecast

## Resumen

El modelo `Elpriser/denmark-price-forecast` es un sistema de predicción de precios spot de electricidad day-ahead para las dos zonas de mercado danesas, DK1 (oeste) y DK2 (este). Desarrollado por Elpriser.org, el modelo alimenta directamente el servicio de pronóstico público de ese sitio web. Se trata de un modelo de regresión tabular basado en LightGBM, con tres regresores cuantiles por zona (P10, P50 y P90), que genera predicciones horarias para un horizonte de 2 a 9 días por delante.

El repositorio se actualiza diariamente (14:10 UTC) con reentrenamiento completo desde cero, de modo que los pesos publicados coinciden siempre con los que están en producción. La versión actual (v3) incorpora tres mejoras principales respecto a la anterior: modelado explícito de la congestión en interconectores, resolución espacial del clima en 14 puntos geográficos y un mecanismo de guardia de régimen para el ajuste de la forma de la curva horaria.

El modelo está pensado para un problema muy concreto: la predicción de precios eléctricos en Dinamarca. No es un modelo de lenguaje ni de propósito general, sino un sistema especializado que combina datos de calendario, históricos de precios, meteorología y capacidad de interconexión. Su licencia es CC-BY-4.0, lo que permite uso comercial con atribución.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LightGBM (gradient boosting sobre árboles de decisión), tres regresores cuantiles por zona (α = 0.1, 0.5, 0.9) |
| Parametros totales | no disponible (número de árboles y nodos no especificado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no aplica (modelo de boosting, no tiene pesos cuantizables) |
| Idiomas soportados | no disponible |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Texto LightGBM (.txt) para boosters y estimadores; JSON para configuración y calibración |

## Arquitectura y entrenamiento

El modelo utiliza LightGBM, una implementación eficiente de gradient boosting sobre árboles de decisión. Para cada zona (DK1 y DK2) se entrenan tres regresores cuantiles con objetivos `quantile` y α = 0.1, 0.5 y 0.9, que producen respectivamente los percentiles 10, 50 y 90 del precio horario. Además, se incluyen pequeños regresores auxiliares que estiman la producción eólica y solar a partir de datos meteorológicos, usados como características derivadas.

El conjunto de entrenamiento contiene aproximadamente 166 000 filas, cubriendo desde el 15 de marzo de 2024 hasta la fecha de entrenamiento, con 8 horizontes (días 2 a 9) y 24 horas por día. Las características, entre 55 y 60 por fila, incluyen variables de calendario (hora, día de la semana, mes, etc.), precios históricos con retardos (lag1, lag2, lag3, lag7, lag14, lag21, lag28) que solo se usan cuando son realmente conocidos en el momento de la predicción para evitar fugas de datos, y datos meteorológicos de 14 puntos geográficos (parques eólicos marinos daneses, zonas alemanas y países vecinos) obtenidos de la API de pronósticos previos de Open-Meteo. La capacidad de interconexión (ENTSO-E A61) se incluye solo para DK1, ya que en DK2 no aporta señal y añade varianza.

El entrenamiento se realiza diariamente de forma automática, y el repositorio incluye los scripts completos (`train_daily.py`, `dataset.py`, `fetch_ntc.py`, `fetch_weather_v3.py`) que reproducen el proceso de recolección de datos, construcción de características, entrenamiento y evaluación.

## Capacidades

- Predicción de precios spot de electricidad day-ahead para las zonas DK1 y DK2 de Dinamarca, con horizonte de 2 a 9 días.
- Salida cuantil (P10, P50, P90) para cada hora, lo que permite cuantificar la incertidumbre de la predicción.
- Manejo de estacionalidad horaria, semanal y anual mediante características de calendario y transformadas armónicas (seno/coseno del día del año).
- Incorporación de datos meteorológicos espacialmente resueltos, incluyendo viento, radiación y temperatura en 14 puntos de Dinamarca, Alemania y países nórdicos.
- Modelado de la congestión en interconectores mediante capacidad de transferencia mensual (ENTSO-E A61) y clima de zonas vecinas, solo para DK1.
- Post-procesamiento híbrido que combina el nivel diario del modelo con la forma horaria de un perfil estacional, con una guardia de régimen que ajusta el peso del blend según la calidad reciente del perfil.
- Calibración conforme por zona y horizonte (archivo `calibration_hourly.json`) que amplía los intervalos de predicción para lograr una cobertura adecuada.
- Reentrenamiento diario automático, lo que garantiza que el modelo refleje siempre las condiciones más recientes del mercado.

## Casos de uso

- Optimización de consumo eléctrico doméstico: un hogar con batería o vehículo eléctrico puede programar la carga en las horas más baratas del horizonte de 9 días, reduciendo el coste de la factura.
- Gestión de carteras de comercializadoras de energía: las empresas que compran electricidad en el mercado mayorista pueden anticipar picos de precio y ajustar sus estrategias de compra o cobertura.
- Planificación de operaciones de activos de almacenamiento: operadores de baterías o hidroeléctricas de bombeo pueden decidir cuándo cargar y descargar en función de los cuantiles P10/P50/P90, maximizando el margen.
- Análisis de riesgo para traders de energía: los cuantiles permiten estimar la distribución de precios futuros y calcular métricas de riesgo como el valor en riesgo (VaR) para posiciones en el mercado day-ahead.
- Integración en asistentes de voz o chatbots: el repositorio `elpriser-mcp` (encontrado en la búsqueda web) demuestra cómo conectar el pronóstico a un servidor MCP para que un LLM responda preguntas sobre el precio de la electricidad en Dinamarca.
- Benchmarking de modelos de forecasting: los scripts y datos publicados permiten a investigadores comparar sus propios modelos de predicción de precios eléctricos con un sistema de referencia en producción.
- Optimización de contratos de suministro: grandes consumidores industriales pueden negociar tarifas indexadas al mercado usando predicciones a 2-9 días para estimar sus costes futuros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona un backtest interno que evalúa el impacto de los cambios de la v3, pero no se incluyen cifras numéricas en el texto proporcionado. Tampoco se facilitan comparaciones con otros modelos de predicción de precios eléctricos.

## Requisitos de hardware

- Inferencia en CPU: el modelo es extremadamente ligero. Un booster LightGBM de tamaño típico (cientos de árboles) ocupa unos pocos megabytes y la inferencia se completa en milisegundos por fila.
- RAM: menos de 1 GB es suficiente para cargar todos los archivos del modelo.
- GPU: no necesaria. El modelo está diseñado para ejecutarse en entornos de servidor o incluso en dispositivos embebidos.
- Entrenamiento: el reentrenamiento diario con 166 000 filas y 55-60 características se puede completar en minutos en una CPU moderna de 8 núcleos o menos.
- Opciones de despliegue: al ser un modelo LightGBM estándar, puede servirse mediante cualquier framework que soporte el formato de texto de LightGBM (por ejemplo, la librería `lightgbm` en Python, o mediante ONNX si se convierte). También puede integrarse en pipelines de datos con Apache Airflow o similares.
- Latencia: la inferencia por lote de 24 horas (un día completo) es del orden de milisegundos, por lo que es adecuado para aplicaciones en tiempo real.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos de predicción de precios eléctricos para Dinamarca en la información proporcionada. El repositorio de GitHub `Ivo196/denmark-electricity-price-forecasting` menciona un proyecto similar para la zona DK2, pero no se han encontrado resultados comparativos publicados. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está limitado geográficamente a Dinamarca (DK1 y DK2) y no es transferible a otros mercados sin reentrenamiento completo.
- El horizonte de predicción cubre únicamente de 2 a 9 días; el día 0-1 se pasa directamente de los precios publicados y no se modela.
- La calidad de las predicciones depende de la precisión de los datos meteorológicos de Open-Meteo y de la capacidad de interconexión de ENTSO-E; errores en estos datos se propagan al resultado.
- El modelo asume que las condiciones del mercado danés (estructura de oferta, regulación, comportamiento de los agentes) se mantienen relativamente estables; cambios regulatorios o eventos extremos (crisis energética) pueden degradar el rendimiento.
- La guardia de régimen del post-procesamiento es conservadora y unidireccional: solo reduce el peso del perfil estacional cuando este se degrada, pero no lo aumenta si el perfil mejora, lo que puede dejar rendimiento sobre la mesa.
- No se proporcionan métricas de error (MAE, RMSE, cobertura de intervalos) en la documentación, lo que dificulta evaluar su precisión absoluta.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero es responsabilidad del usuario cumplir con los términos de las fuentes de datos subyacentes (Open-Meteo, ENTSO-E, Energi Data Service).
- El modelo se reentrena diariamente, por lo que los archivos en el repositorio cambian constantemente; cualquier reproducción de resultados debe tener en cuenta la fecha de descarga.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Elpriser/denmark-price-forecast
- Organización Elpriser en HuggingFace: https://huggingface.co/Elpriser
- Dataset hermano Denmark Power Market: https://huggingface.co/datasets/Elpriser/denmark-power-market
- Sitio web de Elpriser con el pronóstico en vivo: https://elpriser.org/prognose
- Servidor MCP para precios de electricidad daneses: https://github.com/x2q/elpriser-mcp
- Proyecto de forecasting de precios DK2 en GitHub: https://github.com/Ivo196/denmark-electricity-price-forecasting
- Energi Data Service (fuente de datos de Energinet): https://www.energidataservice.dk/
