# paradoxailab/pwm-w-weather-v0.3-wmo

## Resumen

PWM-W Weather v0.3 (league run) es un modelo de predicción meteorológica espacio-temporal desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) como parte de su serie Paradox World Model, en concreto la entrega número 22 de 56 modelos publicados. El modelo resuelve una tarea acotada: predecir las próximas 24 horas de temperatura, humedad y viento en estaciones meteorológicas sinópticas de la India, empleando datos del Integrated Surface Database (ISD) de la NOAA correspondientes a estaciones de la Organización Meteorológica Mundial (WMO). Se trata de un modelo específico de estación ("station-only"), no de un modelo global de rejilla, lo que lo diferencia de sistemas como GraphCast o Pangu-Weather.

Arquitectura y entrenamiento no están documentados en la model card más allá de la referencia a un repositorio de GitHub externo y a un artículo ("paper-weather", sección v0.3) cuyo contenido no se incluye en la información disponible. El modelo tiene 932.348 parámetros (menos de un millón), se distribuye como un único fichero PyTorch `.pt` de 3,78 MB y se entrenó el 7 de noviembre de 2026 en un entorno de Kaggle (`pwm-weather-league-gpu`), publicándose el 17 de noviembre de 2026.

Su relevancia es fundamentalmente metodológica y de investigación: explora la viabilidad de modelos "world model" de escala muy reducida aplicados a forecasting meteorológico localizado, en contraste con los grandes modelos globales de IA meteorológica. No hay métricas de rendimiento publicadas en la información disponible, y el repositorio de Hugging Face registra cero descargas y cero "likes" en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (referenciada en el repositorio de GitHub, no detallada en la model card) |
| Parámetros totales | 932.348 |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en punto flotante PyTorch; el formato `.pt` no documenta cuantizaciones alternativas) |
| Idiomas soportados | no disponible (modelo numérico de series temporales; no procesa lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (checkpoint con claves `meta`, `weights`, `results`, `cfg`) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. Indica únicamente que el código de arquitectura de esta versión se encuentra en el repositorio de GitHub `paradoxailab/paradox-world-model` (rama `delhi-v0.3`) y que la configuración de entrenamiento está embebida en el propio checkpoint bajo la clave `ck['cfg']`. No se especifica si se trata de un transformer, un modelo de espacio de estados, una red convolucional espacio-temporal o un modelo híbrido. Tampoco se documenta el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases de ajuste fino con RLHF o DPO (poco probable en un modelo de forecasting numérico).

Los datos de entrenamiento proceden de estaciones sinópticas WMO en la India, según la base ISD de la NOAA. La model card remite a `DATA_SOURCES.md` para los términos y fuentes, pero no incluye cifras de volumen, período temporal cubierto ni número de estaciones. El entrenamiento se realizó el 7 de noviembre de 2026 en un entorno de Kaggle con GPU (`pwm-weather-league-gpu`), lo que sugiere un coste computacional muy bajo y un ciclo de iteración rápido. La versión v0.3 supone un cambio de dominio respecto a versiones anteriores de la familia (de calidad del aire a meteorología) y un cambio de enfoque (modelo "station-only" frente a modelos globales).

## Capacidades

- Predicción de las próximas 24 horas de temperatura en estaciones sinópticas.
- Predicción de las próximas 24 horas de humedad en estaciones sinópticas.
- Predicción de las próximas 24 horas de viento en estaciones sinópticas.
- Modelado espacio-temporal: el modelo incorpora estructura espacial entre estaciones, según la etiqueta `spatiotemporal` de la model card.
- Forecasting de series temporales meteorológicas de horizonte corto (24 h).
- Participación en la "weather league" de ParadoxAI Lab frente a modelos globales de IA meteorológica (resultados no publicados en la información disponible).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües; es un modelo numérico de predicción, no un modelo de lenguaje.

## Casos de uso

- Predicción local de temperatura a 24 horas en estaciones meteorológicas indias: el modelo toma el estado reciente de las estaciones y devuelve la evolución prevista de temperatura, adecuado para prototipos de nowcasting de baja latencia por su tamaño inferior a 1 M de parámetros.
- Investigación comparativa de modelos "world model" de escala reducida: sirve como línea base ligera frente a modelos globales de IA meteorológica en estudios académicos sobre el trade-off entre tamaño y precisión en forecasting espacio-temporal.
- Relleno y validación de series de observación: al modelar la dinámica espacio-temporal de estaciones, puede emplearse para detectar anomalías o imputar huecos en registros históricos de temperatura, humedad y viento.
- Docencia y reproducción de experimentos: su checkpoint único de 3,78 MB y su licencia Apache-2.0 permiten ejecutarlo en CPU o GPU de consumo para reproducir el pipeline de entrenamiento documentado en el repositorio.
- Prototipado de servicios meteorológicos hiperlocales: con la configuración embebida en `ck['cfg']` y los pesos en `ck['weights']`, se puede integrar en un servicio de predicción por estación para regiones con cobertura WMO densa.
- Análisis de sensibilidad de modelos de predicción a la topología de estaciones: al ser "station-only", permite estudiar cómo afecta la densidad y distribución de estaciones a la calidad de la predicción, sin la complejidad de un modelo de rejilla global.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una comparación en la "weather league" contra modelos globales de IA meteorológica y remite al artículo "paper-weather" (sección v0.3) y a la rama `delhi-v0.3` del repositorio de GitHub, pero no incluye cifras de MAE, RMSE ni ninguna otra métrica en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. El checkpoint pesa 3,78 MB y el modelo tiene 932.348 parámetros; los pesos en punto flotante de 32 bits ocupan aproximadamente 3,7 MB, por lo que la inferencia cabe holgadamente en cualquier GPU.
- GPU recomendadas: no se especifican. Dado el tamaño, cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) es suficiente; también es viable en CPU.
- Cabe en GPU de consumo: sí, con margen amplio, en cualquier GPU con al menos 1 GB de memoria.
- Opciones de despliegue: carga directa con PyTorch mediante `torch.load` y `hf_hub_download`, tal como documenta la model card. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo ni de alternativas comparables en la información proporcionada. La model card lo sitúa frente a "modelos globales de IA meteorológica" en la weather league, pero no nombra los modelos concretos ni aporta métricas. Se indica "no disponible" para los campos de rendimiento.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| PWM-W Weather v0.3 (league run) | 932.348 | no disponible | Apache-2.0 | Hugging Face (checkpoint `.pt`) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Cobertura geográfica restringida: el modelo está entrenado exclusivamente con estaciones sinópticas WMO de la India, por lo que no es extrapolable a otras regiones sin reentrenamiento.
- Horizonte limitado: la predicción se limita a las próximas 24 horas; no está diseñado para pronósticos a medio o largo plazo.
- Variables limitadas: solo temperatura, humedad y viento; no cubre precipitación, presión, radiación ni otras variables meteorológicas.
- Enfoque "station-only": no produce campos en rejilla, lo que limita su uso en aplicaciones que requieran mapas continuos.
- Ausencia de métricas publicadas: no hay resultados de benchmarks verificables en la información disponible, lo que impide evaluar su precisión real frente a alternativas.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero existe riesgo de predicciones no físicamente plausibles al ser un modelo puramente aprendido y de muy baja capacidad (menos de 1 M de parámetros).
- Sesgos: no documentados. Al entrenarse con datos ISD de estaciones indias, puede heredar sesgos de cobertura, calidad y distribución de dichas estaciones.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero los datos de entrenamiento no se incluyen y sus términos se remiten a `DATA_SOURCES.md`, que debe revisarse antes de un uso en producción.
- Madurez: repositorio con cero descargas y cero "likes" en el momento de la consulta; la model card remite a un artículo y a un repositorio externo para información esencial (arquitectura, resultados), lo que dificulta la validación independiente.
- Fecha de creación futura respecto a la fecha habitual de consulta (18 de noviembre de 2026), lo que conviene verificar antes de integrarlo en cualquier pipeline.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/paradoxailab/pwm-w-weather-v0.3-wmo
- Repositorio GitHub del proyecto: https://github.com/paradoxailab/paradox-world-model
- Rama del registro de esta versión: https://github.com/paradoxailab/paradox-world-model/blob/delhi-v0.3/README.md
- Índice de la serie de modelos: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes y términos de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citación: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior (#21): https://huggingface.co/paradoxailab/pwm-w-weather-v0.3-cpcb
- Modelo siguiente (#23): https://huggingface.co/paradoxailab/pwm-w-weather-v0.4-cpcb
- Serie completa: https://huggingface.co/paradoxailab/paradox-world-model-series
- Sitio web del autor: https://paradoxailab.com
