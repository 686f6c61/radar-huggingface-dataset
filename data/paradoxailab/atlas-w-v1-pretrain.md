# paradoxailab/atlas-w-v1-pretrain

## Resumen

Atlas-W v1 (pre-training) es un modelo de predicción de series temporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) como parte de su serie Paradox World Model. Su tarea concreta es la predicción de las próximas 24 horas de concentración de PM2.5 en estaciones de monitorización de calidad del aire en la India. Se distribuye como un checkpoint de PyTorch de apenas 86.701 bytes con un total de 14.043 parámetros, lo que lo sitúa en la categoría de modelos tabulares/neuronales de muy baja complejidad, muy alejado de los LLM convencionales.

El modelo se entrenó sobre datos de estaciones CPCB de toda la India (14 redes y 263 estaciones según la model card, con referencia a 13 redes en la descripción del dataset de Kaggle "Time Series Air Quality Data of India (2010-2023)"). El resultado registrado por el autor es un error agrupado de validación (pooled validation) de 8,83-8,86, sin que la model card especifique la métrica exacta (probablemente MAE o RMSE en µg/m³ de PM2.5).

Es relevante ahora porque forma parte de una serie abierta de 56 modelos publicados (numerados 01-59) bajo licencia Apache-2.0, con código de arquitectura en GitHub y configuración de entrenamiento embebida en el propio checkpoint. No obstante, el repositorio de Hugging Face figura con 0 descargas, 0 likes y 0,0 GB de tamaño declarado, lo que sugiere una publicación reciente (18 de noviembre de 2026) y sin tracción comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (código en repositorio GitHub; configuración en `ck['cfg']` del checkpoint) |
| Parametros totales | 14.043 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (tarea de forecasting sobre ventana temporal, no especificada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo numérico de series temporales, no procesa lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state dict (`.pt`, 86.701 bytes) |

## Arquitectura y entrenamiento

La model card no describe explícitamente la arquitectura interna. Indica que el código de arquitectura está en el repositorio GitHub de Paradox World Model y que la configuración de entrenamiento se almacena en el propio checkpoint bajo la clave `ck['cfg']`. Dado el número de parámetros (14.043) y la tarea (predicción de PM2.5 a 24 horas en estaciones), se trata de un modelo compacto de series temporales, no de un transformer de lenguaje. No se especifica si es un MLP, una red recurrente, un modelo grafotemporal o un modelo de mezcla; esa información solo está disponible en el repositorio de código.

En cuanto a datos, se entrenó con estaciones CPCB de toda la India (14 redes / 263 estaciones según la tabla de la model card; 13 redes según la descripción del dataset de Kaggle citado). El entrenamiento se realizó el 13 de noviembre de 2026 (run `atlasw-v13-s320`) y se publicó el 17 de noviembre de 2026. No se detalla el número de tokens ni de pasos, la composición exacta del dataset, ni si hubo ajuste fino con RLHF/DPO (no aplicable en este dominio). La model card menciona que "Atlas-W trained the v1.3 way", sin más detalle técnico.

## Capacidades

- Predicción de las próximas 24 horas de concentración de PM2.5 en estaciones de monitorización.
- Modelado espaciotemporal: el tag `spatiotemporal` sugiere que aprovecha relaciones entre estaciones y redes, aunque la model card no lo detalla.
- Forecasting de series temporales de calidad del aire en el contexto de la India.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Predicción operativa de PM2.5 a 24 horas para redes de monitorización urbanas: el modelo recibe el estado reciente de las estaciones y devuelve la concentración prevista para las próximas 24 horas, adecuado para sistemas de alerta temprana de contaminación.
- Alertas sanitarias en tiempo casi real: integrado en un pipeline que consume datos CPCB, permite emitir avisos a autoridades sanitarias cuando se prevén episodios de alta contaminación, dado que su tamaño (14.043 parámetros) permite inferencia en CPU.
- Investigación en modelado espaciotemporal de calidad del aire: sirve como baseline ligero y reproducible (checkpoint con SHA-256 y configuración embebida) para comparar con modelos más complejos.
- Relleno de huecos en series de PM2.5: al modelar la dinámica temporal y espacial, puede emplearse para imputar valores faltantes en estaciones con sensores intermitentes.
- Evaluación de políticas de calidad del aire: simulando escenarios de emisiones y comparando predicciones a 24 horas, útil para estudios académicos sobre episodios de contaminación.
- Despliegue en entornos con recursos limitados: por su tamaño inferior a 100 KB, puede ejecutarse en dispositivos edge o en funciones serverless sin GPU, lo que facilita prototipos de bajo coste.

## Benchmarks y rendimiento

La model card solo reporta un resultado agregado: "pooled validation 8.83-8.86". No se especifica la métrica (MAE, RMSE u otra) ni las unidades, ni se ofrecen comparaciones con otros modelos. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no aplican a este dominio.

| Metrica | Valor | Notas |
|---|---|---|
| Pooled validation | 8,83-8,86 | Métrica y unidades no especificadas en la model card |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB; el checkpoint completo ocupa 86.701 bytes y los pesos caben holgadamente en CPU.
- GPU recomendadas: no requiere GPU; cualquier CPU moderna es suficiente. Una GPU solo tendría sentido para entrenamiento o para lotes masivos.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) e incluso en dispositivos sin GPU.
- Opciones de despliegue: PyTorch nativo (`torch.load`), con posible exportación a TorchScript u ONNX; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponibles; por el tamaño, la latencia de inferencia sería del orden de microsegundos a milisegundos en CPU para un lote pequeño.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La model card no incluye comparaciones con otros modelos de forecasting de calidad del aire ni con versiones anteriores más allá de la referencia a Atlas-W v0 (air core) y Atlas-W v1 (Delhi) dentro de la misma serie.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Atlas-W v1 (pretrain) | 14.043 | no disponible | pooled validation 8,83-8,86 | Apache-2.0 | Hugging Face |
| Atlas-W v0 (air core) | no disponible | no disponible | no disponible | Apache-2.0 | Hugging Face |
| Atlas-W v1 (Delhi) | no disponible | no disponible | no disponible | Apache-2.0 | Hugging Face |

## Limitaciones y advertencias

- El modelo está especializado en PM2.5 en estaciones de la India; no es generalizable a otros contaminantes, regiones o variables sin reentrenamiento.
- La métrica de validación reportada (8,83-8,86) no especifica unidades ni tipo de error, lo que impide evaluar su calidad real frente a baselines.
- La model card es incompleta: no describe la arquitectura, la ventana de entrada, los datos exactos de entrenamiento ni el proceso de validación.
- Riesgo de sobreajuste a las 263 estaciones y 13-14 redes del dataset CPCB; el rendimiento en estaciones no vistas no está documentado.
- No se han publicado análisis de sesgos por región, estación o periodo temporal.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el repositorio tiene 0 descargas y 0 likes, sin validación comunitaria.
- El tamaño del repositorio declarado (0,0 GB) y el número de descargas sugieren que la publicación es reciente y sin adopción; conviene verificar la integridad del checkpoint con el SHA-256 proporcionado.
- No se incluyen los datos de entrenamiento; las fuentes y términos están en `DATA_SOURCES.md` del repositorio, por lo que la reproducibilidad depende de terceros.

## Enlaces

- Hugging Face: https://huggingface.co/paradoxailab/atlas-w-v1-pretrain
- Repositorio GitHub: https://github.com/paradoxailab/paradox-world-model
- Registro Atlas: https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/README.md
- Índice de la serie: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes de datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citación: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior (Atlas-W v0): https://huggingface.co/paradoxailab/atlas-w-v0
- Modelo siguiente (Atlas-W v1 Delhi): https://huggingface.co/paradoxailab/atlas-w-v1-delhi
- Serie completa: https://huggingface.co/paradoxailab/paradox-world-model-series
- Sitio del autor: https://paradoxailab.com
