# rafmacalaba/datause-classifier-smoke

## Resumen

El modelo `rafmacalaba/datause-classifier-smoke` es un clasificador de texto de doble tarea desarrollado por el usuario rafacalaba. Se trata de un fine-tune del encoder `LiquidAI/LFM2.5-Encoder-230M` al que se le añaden dos cabezas de clasificación: una primera cabeza binaria que actúa como "gate" para determinar si una página contiene datos (etiqueta `has_data`), y una segunda cabeza multiclase que clasifica el documento en uno de 30 temas sectoriales denominados "teratopic". El modelo está pensado para tareas de filtrado y categorización de contenido web, probablemente orientado a pipelines de extracción o minería de datos.

Con 229.724.959 parámetros (aproximadamente 230 millones), es un modelo compacto que puede ejecutarse en hardware modesto. El entrenamiento se realizó durante una sola época con precisión bf16 y una longitud máxima de secuencia de 512 tokens. Los resultados de evaluación sobre el conjunto de validación muestran un rendimiento limitado, especialmente en la tarea de clasificación de dominio, con un F1 macro de 0,1359. El modelo se distribuye bajo licencia Apache 2.0 y los pesos están en formato safetensors. Aunque el repositorio no especifica los idiomas soportados, al ser un encoder de propósito general es probable que tenga cobertura multilingüe, pero este dato no está confirmado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fine-tune de encoder transformer (LiquidAI/LFM2.5-Encoder-230M) con dos cabezas de clasificación (binaria y multiclase) |
| Parametros totales | 229.724.959 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el entrenamiento usó max_length 512, pero no se especifica el contexto del modelo base) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del encoder `LFM2.5-Encoder-230M` de LiquidAI, un transformer de 230 millones de parámetros. Sobre este encoder se añaden dos cabezas de clasificación independientes: una cabeza binaria con activación sigmoide para la tarea "gate" (detección de presencia de datos en una página) y una cabeza softmax de 30 clases para la clasificación de dominio "teratopic". El entrenamiento se realizó con una sola época, una tasa de aprendizaje de 2e-5, longitud máxima de secuencia de 512 tokens y precisión bf16. No se menciona el uso de técnicas como RLHF o DPO, ni se detalla la composición del dataset de entrenamiento. La arquitectura es un enfoque multi-task donde ambas cabezas comparten el encoder base, lo que permite un entrenamiento conjunto y una inferencia eficiente.

## Capacidades

- Clasificación binaria de páginas: determina si una página contiene datos (etiqueta `has_data`).
- Clasificación multiclase de documentos: asigna uno de 30 temas sectoriales "teratopic" a un documento.
- Procesamiento de secuencias de hasta 512 tokens (límite de entrenamiento).
- Inferencia multi-task en una sola pasada: ambas cabezas se ejecutan simultáneamente sobre el mismo encoder.
- No soporta generación de texto, tool calling, agentes, visión ni otras capacidades más allá de la clasificación.

## Casos de uso

- Filtrado de páginas web con datos: el gate `has_data` puede integrarse en un crawler para descartar páginas sin contenido estructurado antes de procesarlas, reduciendo costes de almacenamiento y cómputo.
- Categorización automática de documentos por sector: la cabeza `teratopic` permite etiquetar artículos, informes o páginas en 30 temas sectoriales, útil para sistemas de recomendación o indexación temática.
- Preprocesamiento en pipelines de extracción de datos: combinar el gate y el clasificador de dominio para filtrar y clasificar documentos antes de aplicar técnicas de extracción de entidades o relaciones.
- Análisis de contenido web a gran escala: al ser un modelo pequeño (230M), puede procesar grandes volúmenes de páginas con recursos limitados, por ejemplo en entornos de scraping distribuido.
- Detección de páginas con datos en dominios específicos: si se conoce el dominio de interés, el clasificador teratopic puede priorizar el rastreo de páginas pertenecientes a esos sectores.
- Experimentación académica: sirve como punto de partida para investigar técnicas de fine-tune multi-task sobre encoders compactos, aunque su rendimiento actual es bajo para uso productivo.

## Benchmarks y rendimiento

Los resultados de evaluación sobre el conjunto de validación (holdout) reportados en la model card son los siguientes:

| Tarea | Métrica | Valor |
|---|---|---|
| Gate (has_data) | Precisión (threshold 0.05) | 0.5000 |
| Gate (has_data) | Recall (threshold 0.05) | 1.0000 |
| Gate (has_data) | F1 (threshold 0.05) | 0.6667 |
| Gate (has_data) | % páginas clasificadas negativas | 0.0000 |
| Domain (teratopic) | Micro F1 | 0.2749 |
| Domain (teratopic) | Macro F1 | 0.1359 |
| Domain (teratopic) | Mean average precision | 0.1905 |

Estos valores indican que el gate tiene un recall perfecto pero una precisión baja (0.5) y clasifica todas las páginas como positivas (0% negativas), lo que sugiere que el umbral está mal calibrado o que el modelo no ha aprendido a discriminar adecuadamente. La clasificación de dominio muestra un rendimiento muy pobre, con un F1 macro de 0,1359, muy por debajo de lo esperado para una tarea de 30 clases. No se han publicado comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 229M parámetros en bf16, el peso del modelo ocupa aproximadamente 460 MB. Con overhead de activaciones y buffers, se estima un consumo de 1 a 2 GB en inferencia para secuencias de 512 tokens.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente, por ejemplo NVIDIA GTX 1650, RTX 3060, o incluso CPU para inferencia por lotes pequeños.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna, incluidas las integradas de gama alta.
- Opciones de despliegue: al ser un modelo de clasificación con arquitectura transformer estándar, puede servirse con Hugging Face Transformers, ONNX Runtime, TensorRT o cualquier framework compatible. También puede ejecutarse en CPU con buena latencia para tamaños de lote pequeños.
- Latencia estimada: no se dispone de datos medidos, pero para un encoder de 230M en una GPU media (RTX 3060) se espera una latencia de 5-15 ms por secuencia de 512 tokens en lote unitario.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos. El modelo base `LiquidAI/LFM2.5-Encoder-230M` es el punto de partida, pero no se conocen sus métricas de referencia. Existen otros clasificadores de texto pequeños (por ejemplo, `distilbert-base-uncased` con 66M parámetros o `bert-base-uncased` con 110M), pero no están especializados en las tareas específicas de este modelo (gate de datos y clasificación teratopic). Por tanto, la comparativa directa no está disponible.

## Limitaciones y advertencias

- Rendimiento muy bajo en la clasificación de dominio: el F1 macro de 0,1359 indica que el modelo apenas distingue entre las 30 clases, probablemente por falta de datos de entrenamiento o por un entrenamiento insuficiente (solo 1 época).
- Gate mal calibrado: el umbral de 0.05 produce un recall del 100% pero una precisión del 50%, y el 0% de páginas negativas sugiere que el modelo clasifica todo como positivo, lo que lo hace inútil como filtro en la práctica.
- Riesgo de alucinación: al ser un modelo de clasificación, no genera texto, pero las etiquetas asignadas pueden ser incorrectas, especialmente en dominios poco representados.
- Sesgos desconocidos: no se ha documentado la composición del dataset de entrenamiento, por lo que pueden existir sesgos en la clasificación de ciertos temas o idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la calidad del modelo.
- Para producción, se recomienda reentrenar con más datos y ajustar el umbral del gate. El estado actual del modelo es experimental (etiqueta "smoke" en el nombre).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rafmacalaba/datause-classifier-smoke
- Modelo relacionado del mismo autor (GLiNER2): https://huggingface.co/rafmacalaba/gliner2_datause_smoke
- Modelo relacionado del mismo autor (LoRA): https://huggingface.co/rafmacalaba/datause-impact-classif
