# paradoxailab/atlas-5k-v2c

## Resumen

Atlas-5K v2c es un modelo de predicción espacio-temporal de series temporales meteorológicas desarrollado por ParadoxAI Lab (Aditya Kumar y Anupam Singh), integrado en la serie Paradox World Model como la entrega número 57 (modelo 54 de 56 publicados). Su tarea es predecir las próximas 24 horas de cinco variables meteorológicas en estaciones: temperatura, punto de rocío, dirección del viento, velocidad del viento y presión a nivel del mar.

El modelo es extremadamente compacto: 968.672 parámetros, lo que lo sitúa en la categoría de modelos ligeros diseñados para inferencia eficiente y despliegue en entornos con recursos limitados. Se entrena sobre WEATHER-5K (ICML 2026), un conjunto de 5.672 estaciones meteorológicas de todo el mundo con datos horarios entre 2014 y 2023.

Su relevancia radica en el enfoque metodológico: la serie Atlas documenta un proceso de crecimiento progresivo del modelo ("Grow, Don't Restart"), donde esta versión v2c se ha adoptado como base para las versiones posteriores de 10M y 25M de parámetros. La mejora respecto a v1 es de un -3,93% en la validación (E 0,28140) y supera a PhysicsFormer en 4 de las 5 variables en el test de 2023.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal Atlas (Paradox World Model), predicción espacio-temporal con cuantiles; detalles internos no disponibles |
| Parámetros totales | 968.672 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos en PyTorch float; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | No aplica (modelo numérico de series temporales) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state dict (`.pt`, 3.906.309 bytes) |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal propia del repositorio `paradox-world-model/atlas`, implementada en PyTorch mediante la clase `Atlas`. El modelo recibe entradas de contexto (`yc`, `mc`, `uc`, `uf`, `geo`, `static`) y produce una salida `q` de forma `[batch, 32 estaciones, 24 horas, 5 variables, 3 cuantiles]`, donde el cuantil mediano (`q[..., 1]`) constituye la predicción puntual. La predicción es, por tanto, probabilística mediante regresión por cuantiles, con agregación de 32 estaciones por vecindario.

El entrenamiento se realizó el 17 de noviembre de 2026 (ejecución de Kaggle `atlas-w5k-v2c`, 16-17 de noviembre de 2026) sobre WEATHER-5K: 5.672 estaciones mundiales con datos horarios de 2014 a 2023. Respecto a la versión anterior (v2a), esta v2c introduce dos cambios: 32 estaciones por vecindario (frente a la configuración previa) y 150.000 pasos de entrenamiento. No se documentan en la información disponible detalles sobre RLHF, DPO ni composición exacta del dataset más allá de la fuente WEATHER-5K.

## Capacidades

- Predicción de las próximas 24 horas de temperatura, punto de rocío, dirección del viento, velocidad del viento y presión a nivel del mar en estaciones meteorológicas.
- Predicción probabilística mediante tres cuantiles por variable y horizonte, lo que permite intervalos de incertidumbre además de la mediana.
- Modelado espacio-temporal: incorpora información de 32 estaciones por vecindario y variables estáticas/geográficas (`geo`, `static`).
- Salida estructurada como tensor `[batch, 32, 24, 5, 3]` apta para pipelines de forecasting.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo numérico especializado, no un modelo de lenguaje.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Predicción meteorológica operativa a corto plazo: el modelo genera las próximas 24 horas de cinco variables en estaciones, adecuado para alimentar paneles de ahora-casting con horizonte diario y bajo coste computacional (menos de 1M de parámetros).
- Relleno de huecos y downscaling de observaciones: al modelar 32 estaciones por vecindario con información geográfica y estática, puede emplearse para interpolar o reconstruir series incompletas en redes de estaciones densas.
- Investigación en modelos del mundo ("world models"): sirve como punto de partida reproducible de la serie Atlas para estudiar el crecimiento progresivo de modelos (de 968K a 10M y 25M de parámetros) sin reiniciar el entrenamiento.
- Evaluación comparativa de baselines meteorológicos: al superar a PhysicsFormer en 4 de 5 variables en el test de 2023, es útil como referencia ligera en benchmarks de forecasting espacio-temporal.
- Despliegue en entornos con recursos limitados: su tamaño (3,9 MB de checkpoint) permite inferencia en CPU o GPUs de gama baja, útil para estaciones remotas o dispositivos edge.
- Generación de escenarios probabilísticos: los tres cuantiles por variable permiten construir intervalos de confianza para gestión de riesgos (por ejemplo, umbrales de viento o presión) sin necesidad de ensembles costosos.
- Docencia y reproducción científica: el checkpoint incluye metadatos, resultados y logs de la ejecución (`ck["results"]`), lo que facilita la replicación del experimento en cursos o estudios metodológicos.

## Benchmarks y rendimiento

Resultados registrados por el autor en la model card (test de 2023, MAE):

| Variable | MAE (Atlas-5K v2c) | Comparación |
|---|---|---|
| Temperatura (T) | 1,474 | Inferior a PhysicsFormer |
| Punto de rocío (Td) | 1,520 | Inferior a PhysicsFormer |
| Dirección del viento (WD) | 54,84 | Inferior a PhysicsFormer |
| Velocidad del viento (WS) | 1,202 | Inferior a PhysicsFormer |
| Presión a nivel del mar (SLP) | 1,533 | Superior a PhysicsFormer en esta variable |

Validación: E 0,28140 (-3,93% respecto a v1). El modelo supera a PhysicsFormer en 4 de 5 variables. No se proporcionan resultados de MMLU, HumanEval, GSM8K ni benchmarks de lenguaje, al no ser un modelo de lenguaje. No se dispone de cifras detalladas de PhysicsFormer en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para inferencia en float32; el checkpoint ocupa 3,9 MB y el modelo tiene 968.672 parámetros.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; no requiere A100, H100 ni RTX 4090. Funciona en CPU sin problema.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3050, RTX 4090, etc.) e incluso en dispositivos edge.
- Opciones de despliegue: PyTorch nativo (carga con `torch.load` y la clase `Atlas` del repositorio GitHub); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia muy baja, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Atlas-5K v2c | 968.672 | No disponible | Forecasting meteorológico 24 h, 5 variables | Apache-2.0 | Hugging Face + GitHub |
| Atlas-5K v2a (#56) | No disponible | No disponible | Misma tarea (versión previa) | Apache-2.0 | Hugging Face |
| Atlas-5K 10M (#58) | 10M | No disponible | Misma tarea (versión crecida) | Apache-2.0 | Hugging Face |
| Atlas-5K 25M (#59) | 25M | No disponible | Misma tarea (versión crecida) | Apache-2.0 | Hugging Face |
| PhysicsFormer | No disponible | No disponible | Forecasting meteorológico | No disponible | No disponible |

No se dispone de datos de rendimiento detallados de PhysicsFormer ni de otros modelos comparables externos a la serie en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en forecasting meteorológico de cinco variables; no es un modelo de lenguaje ni admite tareas generales.
- El checkpoint se carga con `weights_only=False`, lo que implica riesgos de seguridad si se cargan archivos de origen no confiable.
- Requiere clonar el repositorio GitHub `paradox-world-model` para instanciar la clase `Atlas`; no es autocontenido en Hugging Face.
- Los datos de entrenamiento no se incluyen; solo se documentan sus fuentes y términos en `DATA_SOURCES.md`.
- Riesgo de sesgo geográfico: aunque WEATHER-5K cubre 5.672 estaciones mundiales, la distribución de estaciones no es uniforme y el rendimiento puede degradarse en regiones con menor cobertura.
- Riesgo de alucinación en sentido estadístico: las predicciones son estimaciones probabilísticas y pueden producir valores físicamente inconsistentes en condiciones extremas no representadas en el entrenamiento.
- No se documentan limitaciones de contexto ni de idioma (no aplica), pero tampoco se publican análisis de robustez, calibración de cuantiles ni evaluación fuera del test de 2023.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda citar mediante `CITATION.cff` y respetar los términos de las fuentes de datos.
- La model card indica que el modelo ha "crecido" en las versiones #58 y #59; para producción podría ser preferible evaluar esas variantes de mayor tamaño.

## Enlaces

- Hugging Face: https://huggingface.co/paradoxailab/atlas-5k-v2c
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- README de la serie Atlas: https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/README.md
- Índice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Preprint "Grow, Don't Restart": https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/paper4/Atlas5K_growth_preprint.pdf
- Citación: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Versión anterior (#56): https://huggingface.co/paradoxailab/atlas-5k-v2a
- Versión siguiente (#58): https://huggingface.co/paradoxailab/atlas-5k-10m
- Todos los modelos: https://huggingface.co/paradoxailab/paradox-world-model-series
- Web del laboratorio: https://paradoxailab.com
