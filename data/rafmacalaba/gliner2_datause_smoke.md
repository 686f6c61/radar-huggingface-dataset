# rafmacalaba/gliner2_datause_smoke

## Resumen

El modelo `rafmacalaba/gliner2_datause_smoke` es un ajuste fino (fine-tune) de `fastino/gliner2-large-v1`, un modelo de extracción de entidades nombradas (NER) basado en la arquitectura GLiNER2. Desarrollado por rafacalaba, está especializado en la detección de menciones de uso de datos en artículos de investigación económica, identificando si una fuente de datos es nombrada explícitamente, descrita de forma genérica o mencionada de manera vaga. Este modelo resuelve el problema de extraer información estructurada sobre qué bases de datos, encuestas o censos se utilizan en la literatura académica, lo que resulta útil para estudios bibliométricos, revisiones sistemáticas y análisis de prácticas de investigación.

Con 486 millones de parámetros y un tamaño de repositorio de 3,9 GB, el modelo se distribuye en formato safetensors bajo licencia Apache 2.0. Aunque la longitud de contexto no está documentada, al ser una adaptación de GLiNER2, hereda la capacidad de trabajar con etiquetas arbitrarias definidas por el usuario, lo que permite clasificar menciones en tres categorías específicas: `NAMED_DATA`, `DESCRIPTIVE_DATA` y `VAGUE_DATA`. Su relevancia actual radica en la creciente demanda de herramientas de minería de texto para automatizar el análisis de fuentes de datos en ciencias sociales, un campo donde la transparencia y la reproducibilidad son cada vez más importantes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER2 (basada en transformer, base no especificada) |
| Parametros totales | 486.444.053 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | No disponible (probablemente inglés, no confirmado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

GLiNER2 es una evolución de GLiNER, un modelo de NER que permite etiquetas libres definidas en tiempo de inferencia, a diferencia de los modelos tradicionales que usan un conjunto cerrado de categorías. El modelo base `fastino/gliner2-large-v1` emplea una arquitectura transformer con un mecanismo de atención que combina representaciones del texto y de las etiquetas para predecir spans de entidades. En este ajuste fino, se entrenó el modelo sobre el dataset `rafmacalaba/data-use-mentions` con configuración específica de GLiNER2, durante una sola época, con una tasa de aprendizaje de 1e-5 para el encoder y 5e-4 para la capa de tarea, un tamaño de lote de 16 y precisión bf16. No se menciona el uso de técnicas como RLHF o DPO; el entrenamiento es supervisado estándar sobre anotaciones de menciones de datos.

## Capacidades

- Extracción de menciones de uso de datos en textos académicos, clasificándolas en tres tipos: `NAMED_DATA` (nombre propio, título o acrónimo de una fuente específica), `DESCRIPTIVE_DATA` (fuente descrita con palabras pero sin nombre) y `VAGUE_DATA` (referencia genérica sin fuente identificable).
- NER con etiquetas arbitrarias: gracias a la arquitectura GLiNER2, el modelo puede adaptarse a nuevas categorías sin reentrenamiento, simplemente proporcionando las etiquetas en la entrada.
- Procesamiento de texto largo: aunque la longitud de contexto no está documentada, los modelos GLiNER2 suelen manejar secuencias de hasta 512 tokens (no confirmado para este ajuste).
- Especialización en dominios de economía y ciencias sociales, con foco en la identificación de fuentes de datos en papers de investigación.
- No incluye soporte para tool calling, agentes, visión, audio ni modos de razonamiento explícitos.

## Casos de uso

- Análisis bibliométrico de fuentes de datos: el modelo puede procesar corpus de artículos económicos para identificar qué bases de datos (p. ej., "Current Population Survey", "Compustat") se citan con mayor frecuencia, permitiendo estudiar tendencias en el uso de datos.
- Construcción de bases de datos de investigación: al extraer menciones de datos, se pueden crear inventarios estructurados de las fuentes utilizadas en un campo, útiles para revisiones sistemáticas o meta-análisis.
- Automatización de revisiones de literatura: los investigadores pueden filtrar artículos según las fuentes de datos que emplean, acelerando la selección de trabajos relevantes para un estudio.
- Detección de prácticas de transparencia: el modelo permite evaluar si los autores mencionan explícitamente sus fuentes de datos (NAMED_DATA) o si usan descripciones vagas (VAGUE_DATA), lo que informa sobre la calidad de la documentación en la literatura.
- Minería de textos en portales de preprints: integrable en pipelines de procesamiento de documentos para etiquetar automáticamente artículos de arXiv o SSRN con sus fuentes de datos.
- Asistencia en la redacción de papers: el modelo puede ayudar a autores a verificar si sus menciones de datos son suficientemente específicas, sugiriendo mejoras en la descripción de fuentes.

## Benchmarks y rendimiento

La model card del autor proporciona resultados de evaluación sobre un conjunto de validación (holdout) con métricas label-agnostic (sin distinguir el tipo de entidad). Se reportan precision, recall, F0.5 y F1 para diferentes umbrales de decisión:

| Umbral | TP | FP | FN | Precision | Recall | F0.5 | F1 |
|---|---|---|---|---|---|---|---|
| 0.10 | 59 | 103 | 32 | 0.3642 | 0.6484 | 0.3992 | 0.4664 |
| 0.20 | 46 | 61 | 45 | 0.4299 | 0.5055 | 0.4432 | 0.4646 |
| 0.30 | 40 | 41 | 51 | 0.4938 | 0.4396 | 0.4819 | 0.4651 |
| 0.40 | 29 | 29 | 62 | 0.5000 | 0.3187 | 0.4489 | 0.3893 |
| 0.50 | 21 | 18 | 70 | 0.5385 | 0.2308 | 0.4251 | 0.3231 |
| 0.60 | 14 | 13 | 77 | 0.5185 | 0.1538 | 0.3518 | 0.2373 |
| 0.70 | 9 | 2 | 82 | 0.8182 | 0.0989 | 0.3333 | 0.1765 |

El mejor F0.5 es 0.4819 con umbral 0.3, y el mejor F1 es 0.4664 con umbral 0.1. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- No se dispone de datos oficiales sobre requisitos de hardware.
- El modelo tiene 486 millones de parámetros, lo que en fp16 (2 bytes por parámetro) implica aproximadamente 1 GB de pesos. Con memoria adicional para activaciones y overhead, se estima que podría ejecutarse en GPUs con al menos 4 GB de VRAM en cuantización ligera, aunque esto no está confirmado por el autor.
- Dado el formato safetensors sin cuantizar, es probable que se necesite una GPU con al menos 8 GB de VRAM para inferencia en fp16, como una RTX 3060, RTX 4060 o superior. Para despliegue en producción, se recomienda usar vLLM, TGI o llama.cpp (si se convierte a GGUF), aunque no se han probado oficialmente.
- La latencia y el throughput no están documentados.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. GLiNER2 es una arquitectura relativamente reciente y este ajuste fino es específico para un dominio, por lo que no hay referencias directas a alternativas equivalentes.

## Limitaciones y advertencias

- Sesgos de dominio: el modelo fue entrenado exclusivamente sobre artículos de economía, por lo que su rendimiento en otros dominios (biomedicina, derecho, etc.) puede ser significativamente inferior.
- Riesgo de alucinación: como cualquier modelo NER, puede generar falsos positivos, especialmente con umbrales bajos (precisión de 0.36 a thr=0.1). Se recomienda ajustar el umbral según la aplicación.
- Limitaciones de idioma: no se especifican los idiomas soportados; es probable que el dataset de entrenamiento sea mayoritariamente en inglés, lo que limita su uso en otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero se debe mantener la atribución y no usar marcas registradas.
- Contexto limitado: aunque no se documenta, los modelos GLiNER2 típicamente tienen una ventana de contexto de 512 tokens, lo que puede ser insuficiente para documentos completos; se requiere segmentación del texto.
- Producción: al ser un modelo pequeño y especializado, no es adecuado para tareas generales de NLP; su uso debe restringirse a la extracción de menciones de datos.

## Enlaces

- [HuggingFace: rafacalaba/gliner2_datause_smoke](https://huggingface.co/rafmacalaba/gliner2_datause_smoke)
