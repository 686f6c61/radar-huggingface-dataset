# paradoxailab/atlas-5k-10m

## Resumen

Atlas-5K 10M es un modelo neuronal especializado en predicción meteorológica a corto plazo (nowcasting determinista y probabilístico) desarrollado por ParadoxAI Lab dentro de su serie Paradox World Model. Concretamente, es la entrada número 58 de la serie y la versión "adoptada" del modelo número 55 publicado. Su tarea es predecir las próximas 24 horas de cinco variables meteorológicas en estaciones: temperatura, punto de rocío, dirección del viento, velocidad del viento y presión a nivel del mar.

El modelo se entrena sobre WEATHER-5K (presentado en ICML 2026), un conjunto de datos con 5.672 estaciones meteorológicas de todo el mundo con frecuencia horaria entre 2014 y 2023. Con 9.639.780 parámetros, es un modelo deliberadamente compacto que busca superar a modelos fundacionales de series temporales de mayor tamaño en la tarea específica de predicción meteorológica por estaciones.

La relevancia de esta ficha radica en que Atlas-5K 10M se presenta como una alternativa eficiente a modelos genéricos de forecasting (TimesFM, Chronos, Time-MoE, etc.) en un dominio vertical concreto. El autor reporta mejoras significativas frente a 20 de 20 configuraciones rivales evaluadas, aunque con la salvedad de que no supera a ECMWF-HRES en la predicción de presión atmosférica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal propietaria tipo "Atlas" (encoder + dynamics blocks); no se especifica si es transformer puro, híbrida o SSM |
| Parametros totales | 9.639.780 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (entrada: ventana histórica de estaciones; salida: 24 horas × 5 variables × 3 cuantiles) |
| Tipos de cuantizacion | no disponible (pesos en PyTorch `state_dict` en FP32 presumiblemente) |
| Idiomas soportados | no disponible (modelo numérico, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (`58_atlas-5k-10m_weather5k_adopted.pt`, 38.671.723 bytes) |

## Arquitectura y entrenamiento

La arquitectura se describe como una red "Atlas" compuesta por un encoder y bloques de dinámica ("dynamics blocks"). En esta versión v2c ampliada, la anchura pasó de 196 a 392, el número de cabezas de atención de 4 a 8, y los bloques de encoder y de dinámica de 2 a 7 cada uno. El modelo recibe entradas `yc, mc, uc, uf, geo, static` y produce una salida `q` con forma `[batch, 32 estaciones, 24 horas, 5 variables, 3 cuantiles]`, donde el cuantil mediano `q[..., 1]` constituye la predicción puntual. Se trata, por tanto, de un modelo probabilístico con tres cuantiles por variable.

El entrenamiento se realizó el 17 de noviembre de 2026 en una NVIDIA A100-SXM4-80GB (Google Colab), con 80.000 pasos adicionales a una tasa de aprendizaje máxima de 3e-4 partiendo del checkpoint v2c. El modelo se "adopta" según la regla interna 10M-A. No se detalla la composición exacta del dataset WEATHER-5K más allá de las 5.672 estaciones y el rango 2014-2023, ni si hubo RLHF/DPO (no aplicable en este dominio). La innovación metodológica destacable es el enfoque de "grow, don't restart" (crecer el modelo sin reiniciar el entrenamiento), documentado en el preprint enlazado.

## Capacidades

- Predicción de temperatura a 24 horas en estaciones meteorológicas.
- Predicción de punto de rocío a 24 horas.
- Predicción de dirección del viento a 24 horas.
- Predicción de velocidad del viento a 24 horas.
- Predicción de presión a nivel del mar a 24 horas.
- Salida probabilística mediante tres cuantiles por variable y horizonte.
- Procesamiento conjunto de múltiples estaciones (batch de 32 estaciones en el ejemplo de carga).
- Integración de información geográfica y variables estáticas (`geo`, `static`) como entradas.
- No soporta tool calling, function calling, agentes, ni capacidades multilingües o multimodales (es un modelo numérico especializado).

## Casos de uso

- Predicción meteorológica operativa a corto plazo: el modelo genera las próximas 24 horas de cinco variables en estaciones concretas, adecuado para servicios de nowcasting que necesiten actualizaciones horarias con bajo coste computacional.
- Downscaling y post-proceso de modelos numéricos: dado su tamaño reducido (9,6 M de parámetros), puede ejecutarse como capa de corrección sobre salidas de modelos físicos como ECMWF-HRES, especialmente en variables donde el modelo reporta ventajas (temperatura, punto de rocío, viento).
- Relleno de series históricas incompletas: la formulación como forecasting permite imputar huecos en registros de estaciones con contexto temporal, útil en climatología y auditoría de datos.
- Predicción de viento para parques eólicos: la salida de dirección y velocidad del viento a 24 horas es directamente aplicable a la planificación de generación renovable a escala de estación.
- Agricultura de precisión: la predicción de temperatura y punto de rocío permite anticipar heladas y condiciones de rocío, relevantes para decisiones de riego y protección de cultivos.
- Investigación en modelos fundacionales de series temporales: al ser un checkpoint compacto y reproducible (con semilla, configuración y logs incluidos en el `.pt`), sirve como baseline para comparar metodologías de crecimiento de modelos ("grow, don't restart") frente a entrenamiento desde cero.
- Evaluación comparativa de modelos de forecasting: el autor publica un protocolo head-to-head contra 20 configuraciones rivales en 709 estaciones, útil como referencia metodológica para otros equipos.

## Benchmarks y rendimiento

Resultados reportados por el autor (no verificados de forma independiente):

| Metrica | Valor |
|---|---|
| Validation E | 0.27592 (−1,95 % vs v2c) |
| Test 2023 MAE temperatura | 1.429 |
| Test 2023 MAE punto de rocío | 1.486 |
| Test 2023 MAE dirección del viento | 53.93 |
| Test 2023 MAE velocidad del viento | 1.183 |
| Test 2023 MAE presión a nivel del mar | 1.477 |
| Comparación vs PhysicsFormer (19,3M) | Mejor en 4 de 5 variables |
| Comparación vs ECMWF-HRES | No supera en presión |
| Head-to-head (709 estaciones, test 2023 y live 2024-25) | Victorias significativas en las 5 variables frente a 20 de 20 configuraciones rivales (TimesFM 2.5/3.0, Chronos-2, Chronos-Bolt, TiRex, Sundial, Time-MoE, TTM, persistence) |

No se detallan en la información disponible los valores numéricos de las comparaciones head-to-head ni los intervalos de confianza de las victorias.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 9,64 M de parámetros en FP32 el peso ocupa ~38,7 MB, por lo que cabe holgadamente en cualquier GPU consumer (incluso integradas) y en CPU.
- GPU recomendadas: no se especifican requisitos mínimos; el entrenamiento se realizó en una NVIDIA A100-SXM4-80GB, pero la inferencia es viable en RTX 3060, RTX 4090, T4 o incluso CPU.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos ~1 GB de VRAM libre (estimación conservadora considerando batch y overhead de PyTorch).
- Opciones de despliegue: PyTorch nativo (carga mediante `torch.load` y `hf_hub_download`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Atlas-5K 10M | 9,64 M | 24 h, 5 variables, 3 cuantiles | MAE T 1.429; gana a 20/20 rivales en 5 variables | Apache-2.0 | Hugging Face |
| Atlas-5K 25M (#59) | 25 M (aprox.) | 24 h, 5 variables | Sustituye a este como entrada WB1 de la serie | Apache-2.0 | Hugging Face |
| PhysicsFormer | 19,3 M | no disponible | Peor que Atlas-5K 10M en 4 de 5 variables | no disponible | no disponible |
| TimesFM 2.5/3.0 | no disponible | no disponible | Derrotado por Atlas-5K 10M en head-to-head | no disponible | no disponible |
| Chronos-2 / Chronos-Bolt | no disponible | no disponible | Derrotados por Atlas-5K 10M en head-to-head | no disponible | no disponible |
| ECMWF-HRES | no disponible (modelo físico) | no disponible | Mejor que Atlas-5K 10M en presión | no disponible | Servicio operativo |

## Limitaciones y advertencias

- Modelo de dominio muy específico: solo predice cinco variables meteorológicas en estaciones; no es un modelo de lenguaje ni un modelo general de series temporales.
- El propio autor reconoce que no supera a ECMWF-HRES en presión a nivel del mar, por lo que no debe presentarse como sustituto de modelos físicos operativos.
- Los resultados de benchmarks son reportados por el autor y no se han verificado de forma independiente; las victorias "significativas" frente a 20 configuraciones no incluyen detalles de los tests estadísticos en la información disponible.
- Riesgo de sobreajuste a la distribución de WEATHER-5K (2014-2023): el rendimiento en estaciones fuera de la distribución o en regímenes climáticos no representados no está documentado.
- No se especifican sesgos geográficos ni de cobertura: aunque el dataset incluye 5.672 estaciones mundiales, no se detalla su distribución por regiones, lo que puede implicar peor rendimiento en áreas con menor densidad de estaciones.
- La licencia Apache-2.0 permite uso comercial, pero los datos de entrenamiento no se distribuyen y sus términos están en `DATA_SOURCES.md`, por lo que el uso comercial debe verificar la licencia de las fuentes originales.
- Requiere clonar el repositorio de GitHub para reconstruir la clase `Atlas`; no es un modelo autocontenido en Hugging Face.
- El checkpoint se distribuye como `state_dict` de PyTorch (no safetensors), lo que implica cargar con `weights_only=False` y los riesgos de seguridad asociados a `pickle`.
- No hay información sobre cuantizaciones, latencia ni throughput, lo que limita la planificación de despliegues a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/paradoxailab/atlas-5k-10m
- Modelo anterior (#57 Atlas-5K v2c): https://huggingface.co/paradoxailab/atlas-5k-v2c
- Modelo siguiente (#59 Atlas-5K 25M): https://huggingface.co/paradoxailab/atlas-5k-25m
- Índice de la serie: https://huggingface.co/paradoxailab/paradox-world-model-series
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- README de la serie Atlas: https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/README.md
- Índice de la serie (modelos): https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Preprint "Grow, Don't Restart": https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/paper4/Atlas5K_growth_preprint.pdf
- Citación: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Sitio web del autor: https://paradoxailab.com
