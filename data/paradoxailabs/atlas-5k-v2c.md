# PARADOXAIlabs/atlas-5k-v2c

## Resumen

Atlas-5K v2c es un modelo neuronal de predicción meteorológica espacio-temporal desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de su serie Paradox World Model, en concreto la entrega número 57. El modelo resuelve una tarea muy acotada: pronosticar las próximas 24 horas de cinco variables meteorológicas (temperatura, punto de rocío, dirección del viento, velocidad del viento y presión a nivel del mar) en estaciones meteorológicas. Se entrenó sobre WEATHER-5K (ICML 2026), un conjunto con 5.672 estaciones de todo el mundo con datos horarios entre 2014 y 2023.

Con 968.672 parámetros, es un modelo extremadamente compacto, pensado como paso intermedio de una escalera de crecimiento: la model card indica que esta versión fue "adoptada" y posteriormente ampliada en los modelos #58 (10M de parámetros) y #59 (25M). Su interés radica en la relación entre tamaño mínimo y rendimiento competitivo frente a modelos físicos como PhysicsFormer, y en que ilustra una metodología de crecimiento de modelos en lugar de reentrenamiento desde cero.

La versión v2c introduce dos cambios respecto a la v1: 32 estaciones por vecindario (frente a la configuración anterior) y 150.000 pasos de entrenamiento. El resultado registrado es una validación E de 0,28140, una mejora del 3,93% respecto a v1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal específica para series temporales espacio-temporales (clase `Atlas`); detalles internos no disponibles |
| Parametros totales | 968.672 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de entrada definida por el pipeline; salida fija de 24 horas) |
| Tipos de cuantizacion | no disponible (pesos en punto flotante PyTorch) |
| Idiomas soportados | no disponible (modelo numérico, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pt` (checkpoint PyTorch con `state_dict`, `cfg`, `meta` y `results`) |
| Tarea | Predicción de series temporales (`time-series-forecasting`) |
| Variables de salida | Temperatura, punto de rocío, dirección del viento, velocidad del viento, presión a nivel del mar |
| Horizonte de predicción | 24 horas |
| Cuantiles de salida | 3 (la mediana es el pronóstico puntual) |
| Estaciones por vecindario | 32 |
| Pasos de entrenamiento | 150.000 |
| Dataset | WEATHER-5K (ICML 2026), 5.672 estaciones, horario, 2014–2023 |
| Tamaño del repo | 0,0 GB (fichero de pesos de 3.906.309 bytes) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de que se implementa en una clase `Atlas` del repositorio `paradox-world-model/atlas` y de que opera sobre entradas espacio-temporales construidas a partir de estaciones vecinas. La firma de inferencia (`model(yc, mc, uc, uf, geo, None, static)`) sugiere la combinación de contextos observados, máscaras, variables futuras conocidas, información geográfica y variables estáticas, un patrón habitual en modelos de predicción espacio-temporal con grafos o atención sobre vecindarios de estaciones.

El entrenamiento se realizó sobre WEATHER-5K con 32 estaciones por vecindario y 150.000 pasos, y el resultado se registra en el propio checkpoint (`ck["results"]`). La model card enmarca el modelo en una metodología de "crecimiento" ("Grow, Don't Restart"), descrita en el preprint *Atlas5K_growth_preprint.pdf*, según la cual las versiones sucesivas se obtienen ampliando el modelo anterior en lugar de reentrenar desde cero. No se especifican en la información proporcionada detalles sobre función de pérdida, composición exacta del dataset, uso de RLHF/DPO (no aplicable a un modelo numérico) ni innovaciones como decodificación especulativa.

## Capacidades

- Predicción determinista y probabilística (tres cuantiles) de cinco variables meteorológicas a 24 horas vista en estaciones concretas.
- Modelado espacio-temporal: incorpora información de estaciones vecinas (32 por vecindario) además de la estación objetivo.
- Pronóstico multi-variable conjunta: temperatura, punto de rocío, dirección del viento, velocidad del viento y presión a nivel del mar.
- Salida estructurada como tensor `[batch, 32 estaciones, 24 horas, 5 variables, 3 cuantiles]`, apta para pipelines de evaluación automatizada.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo numérico especializado, no un modelo de lenguaje.
- No dispone de modo "thinking", visión ni audio.

## Casos de uso

- Predicción meteorológica operativa a corto plazo en estaciones: el modelo genera las próximas 24 horas de cinco variables para estaciones concretas, lo que permite alimentar paneles de monitorización con pronósticos horarios actualizados.
- Relleno de huecos en series históricas: dada su capacidad de modelar la evolución temporal y la relación entre estaciones vecinas, puede usarse para imputar observaciones faltantes en registros de estaciones meteorológicas.
- Downscaling o interpolación espacial: aprovechando el vecindario de 32 estaciones, puede estimar condiciones en ubicaciones con cobertura parcial a partir de estaciones cercanas.
- Investigación en modelos ligeros de series temporales: con menos de un millón de parámetros, sirve como línea base reproducible para comparar metodologías de crecimiento frente a reentrenamiento.
- Validación de modelos físicos: la model card compara sus resultados con PhysicsFormer; el modelo puede emplearse como referencia empírica en estudios que evalúen modelos basados en física.
- Prototipado en entornos con recursos limitados: su tamaño (3,9 MB de pesos) permite ejecutarlo en CPU o en GPUs de gama baja para experimentación rápida.
- Evaluación de calibración probabilística: la salida de tres cuantiles permite analizar la incertidumbre del pronóstico y comparar la calibración frente a otros métodos.

## Benchmarks y rendimiento

Resultados registrados en la model card (conjunto de test de 2023, MAE):

| Métrica | Valor |
|---|---|
| MAE temperatura (T) | 1,474 |
| MAE punto de rocío (Td) | 1,520 |
| MAE dirección del viento (WD) | 54,84 |
| MAE velocidad del viento (WS) | 1,202 |
| MAE presión a nivel del mar (SLP) | 1,533 |
| Validación E | 0,28140 (mejora del 3,93% respecto a v1) |

La model card afirma que estos valores son inferiores a los de PhysicsFormer en 4 de las 5 variables, pero no se proporcionan las cifras concretas de PhysicsFormer ni de otros modelos comparables en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el fichero de pesos ocupa 3,9 MB y el modelo tiene 968.672 parámetros, por lo que cabe holgadamente en cualquier GPU moderna e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU con soporte PyTorch (por ejemplo, RTX 3060 o superior) es más que suficiente. A100/H100 no aportan ventaja relevante para este tamaño.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con al menos unos cientos de MB de memoria libre.
- Opciones de despliegue: PyTorch nativo (carga mediante `torch.load` y la clase `Atlas` del repositorio GitHub). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera un coste de inferencia muy bajo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Atlas-5K v2c | 968.672 | 24 h | Predicción meteorológica en estaciones (5 variables) | Apache-2.0 | Hugging Face (repo `PARADOXAIlabs/atlas-5k-v2c`) |
| Atlas-5K 10M (#58) | 10M | 24 h (según serie) | Predicción meteorológica en estaciones | Apache-2.0 (según serie) | Hugging Face (`PARADOXAIlabs/atlas-5k-10m`) |
| Atlas-5K 25M (#59) | 25M | 24 h (según serie) | Predicción meteorológica en estaciones | Apache-2.0 (según serie) | Hugging Face (serie Paradox World Model) |
| PhysicsFormer | no disponible | no disponible | Predicción meteorológica basada en física | no disponible | no disponible |

No se dispone de datos suficientes para comparar parámetros, contexto o rendimiento de PhysicsFormer; la model card solo indica que Atlas-5K v2c obtiene MAE inferior en 4 de 5 variables.

## Limitaciones y advertencias

- Modelo altamente especializado: solo predice cinco variables meteorológicas a 24 horas en estaciones; no es un modelo de propósito general ni de lenguaje.
- Cobertura geográfica limitada a las estaciones de WEATHER-5K; el rendimiento fuera de esa red o en ubicaciones sin estaciones vecinas no está documentado.
- Ventana temporal de entrenamiento 2014–2023: puede degradarse ante regímenes climáticos no representados o cambios en la instrumentación de las estaciones.
- Riesgo de error en fenómenos extremos: no se documenta el comportamiento en eventos meteorológicos severos ni la calibración de los cuantiles en las colas de la distribución.
- Los resultados de benchmark proceden de la propia model card y no se han verificado de forma independiente en la información disponible.
- La carga requiere `weights_only=False` en `torch.load`, lo que implica confiar en el origen del checkpoint; conviene auditar el fichero antes de usarlo en producción.
- Requiere clonar el repositorio GitHub para disponer de la clase `Atlas`; no es un modelo autocontenido en Hugging Face.
- Licencia Apache-2.0: permite uso comercial con atribución y sin garantías; no se especifican restricciones adicionales.
- No se documentan sesgos en el sentido habitual de modelos de lenguaje, pero sí posibles sesgos de muestreo derivados de la distribución desigual de estaciones en WEATHER-5K.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PARADOXAIlabs/atlas-5k-v2c
- Modelo anterior (#56, Atlas-5K v2a): https://huggingface.co/PARADOXAIlabs/atlas-5k-v2a
- Modelo siguiente (#58, Atlas-5K 10M): https://huggingface.co/PARADOXAIlabs/atlas-5k-10m
- Índice de la serie: https://huggingface.co/PARADOXAIlabs/paradox-world-model-series
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- README de Atlas: https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/README.md
- Índice de la serie en GitHub: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Preprint "Grow, Don't Restart": https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/paper4/Atlas5K_growth_preprint.pdf
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citación: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Sitio del laboratorio: https://paradoxailab.com
