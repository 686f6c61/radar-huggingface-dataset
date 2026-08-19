# rafmacalaba/lfm2.5-Encoder-350M-datause-extended

## Resumen

El modelo `rafmacalaba/lfm2.5-Encoder-350M-datause-extended` es un ajuste fino del encoder `LiquidAI/LFM2.5-Encoder-350M` orientado a la anotación de menciones de uso de datos en textos académicos, concretamente en artículos de investigación económica. Desarrollado por rafacmalaba, este modelo realiza clasificación de tokens (token-classification) con etiquetas BIO para identificar tres tipos de referencias a fuentes de datos: `NAMED_DATA` (nombre propio, título o acrónimo de una fuente específica), `DESCRIPTIVE_DATA` (descripción sin nombre explícito) y `VAGUE_DATA` (mención genérica sin fuente identificable). Con 354 millones de parámetros, el modelo está diseñado para tareas de extracción de información estructurada en el dominio de ciencias sociales, facilitando el análisis bibliométrico y la construcción de bases de datos de fuentes utilizadas en investigación.

La relevancia de este modelo radica en la creciente necesidad de automatizar la identificación de conjuntos de datos en la literatura académica, un paso previo para estudios de reproducibilidad, metaanálisis y seguimiento de tendencias metodológicas. Al estar basado en un encoder de tamaño medio, ofrece un equilibrio entre rendimiento y eficiencia computacional, siendo adecuado para entornos con recursos limitados. La licencia Apache 2.0 permite su uso comercial y académico sin restricciones significativas, lo que facilita su integración en pipelines de procesamiento de texto a gran escala.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (encoder transformer de 350M, basado en LiquidAI/LFM2.5-Encoder-350M) |
| Parametros totales | 354.483.968 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se entrenó en bf16) |
| Idiomas soportados | no disponible (probablemente inglés, no especificado) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo base `LiquidAI/LFM2.5-Encoder-350M`, un encoder de 350 millones de parámetros desarrollado por Liquid AI, aunque no se proporcionan detalles técnicos sobre su diseño interno (número de capas, mecanismos de atención, etc.) en la documentación disponible. El ajuste fino se realizó sobre el dataset `rafacmalaba/data-use-mentions-extended` en su configuración `bio`, con 5 épocas, una tasa de aprendizaje de 2e-5, tamaño de lote de 16 y precisión bf16. No se menciona el uso de técnicas como RLHF o DPO; el entrenamiento es un fine-tuning supervisado estándar para clasificación de tokens.

## Capacidades

- Clasificación de tokens para detección de menciones de datos en textos académicos, con tres etiquetas específicas: `NAMED_DATA`, `DESCRIPTIVE_DATA` y `VAGUE_DATA`.
- Procesamiento de documentos largos (papers de investigación) para extraer referencias a fuentes de datos.
- Soporte para tareas de NER (reconocimiento de entidades nombradas) especializadas en el dominio económico.
- No se documentan capacidades adicionales como generación de texto, razonamiento, tool calling o soporte multilingüe.

## Casos de uso

- Análisis bibliométrico: el modelo permite extraer automáticamente las fuentes de datos citadas en un corpus de artículos económicos, facilitando estudios sobre qué datasets son más utilizados y cómo evolucionan las tendencias metodológicas.
- Construcción de bases de datos de investigación: a partir de papers, se pueden generar listados estructurados de datasets, encuestas, censos o registros mencionados, útiles para repositorios académicos.
- Revisión sistemática de literatura: en meta-análisis, el modelo ayuda a identificar rápidamente qué fuentes de datos sustentan cada estudio, acelerando la fase de cribado.
- Minería de texto en ciencias sociales: permite extraer menciones de datos en grandes volúmenes de documentos, habilitando análisis de patrones de uso de datos en diferentes subcampos.
- Automatización de metadatos: editoriales y repositorios pueden usar el modelo para etiquetar automáticamente los artículos con las fuentes de datos que utilizan, mejorando la indexación y búsqueda.
- Detección de datos no nombrados: la etiqueta `DESCRIPTIVE_DATA` ayuda a identificar referencias implícitas a fuentes, lo que es útil para estudios de reproducibilidad donde los datos no se citan explícitamente.

## Benchmarks y rendimiento

La model card reporta resultados de evaluación en un conjunto de validación separado, con métricas a diferentes umbrales de confianza. Los datos son los siguientes:

| Umbral | TP | FP | FN | Precisión | Recall | F0.5 | F1 |
|--------|------|------|------|-----------|--------|-------|------|
| 0.10   | 7803 | 1715 | 4761 | 0.8198 | 0.6211 | 0.7705 | 0.7067 |
| 0.20   | 7803 | 1715 | 4761 | 0.8198 | 0.6211 | 0.7705 | 0.7067 |
| 0.30   | 7803 | 1715 | 4761 | 0.8198 | 0.6211 | 0.7705 | 0.7067 |
| 0.40   | 7787 | 1702 | 4777 | 0.8206 | 0.6198 | 0.7707 | 0.7062 |
| 0.50   | 7658 | 1625 | 4906 | 0.8249 | 0.6095 | 0.7705 | 0.7011 |
| 0.60   | 7083 | 1304 | 5481 | 0.8445 | 0.5638 | 0.7680 | 0.6761 |
| 0.70   | 6560 | 1057 | 6004 | 0.8612 | 0.5221 | 0.7622 | 0.6501 |

El mejor F0.5 es 0.7707 (umbral 0.4) y el mejor F1 es 0.7067 (umbral 0.1). No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Tamaño del modelo: 354M parámetros, con pesos en bf16 ocupan aproximadamente 0.7 GB (1.4 GB en el repositorio, posiblemente con archivos adicionales).
- VRAM estimada para inferencia: menos de 2 GB en fp16/bf16, por lo que cabe en GPUs consumer como NVIDIA GTX 1060 6GB, RTX 2060, RTX 3060, etc.
- GPU recomendada: cualquier GPU con al menos 4 GB de VRAM para ejecución cómoda con batch pequeño.
- Opciones de despliegue: se puede usar con la librería `transformers` de HuggingFace mediante el pipeline de `token-classification`, o con frameworks como ONNX Runtime para optimización.
- Latencia y throughput: no disponible, pero al ser un encoder pequeño, la inferencia es rápida en CPU y GPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se puede realizar una comparativa objetiva sin datos adicionales.

## Limitaciones y advertencias

- El modelo está especializado en el dominio económico y puede no generalizar bien a otros campos (biomedicina, informática, etc.) donde las menciones de datos tienen formatos distintos.
- La etiqueta `VAGUE_DATA` puede generar falsos positivos en textos ambiguos, reduciendo la precisión en contextos donde la mención de datos es imprecisa.
- No se documentan sesgos específicos, pero al estar entrenado en un dataset propio del autor, podría reflejar sesgos de selección de papers (por ejemplo, predominio de ciertos subcampos o revistas).
- Riesgo de alucinación: aunque es una tarea de clasificación, el modelo puede etiquetar incorrectamente entidades que no son menciones de datos si el contexto es similar.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se ofrece sin garantías de exactitud o idoneidad para producción sin validación adicional.
- No se especifica la longitud máxima de secuencia soportada; para papers largos puede ser necesario truncar o segmentar el texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rafmacalaba/lfm2.5-Encoder-350M-datause-extended
- Modelo base: `LiquidAI/LFM2.5-Encoder-350M` (disponible en HuggingFace)
- Dataset de entrenamiento: `rafacmalaba/data-use-mentions-extended` (disponible en HuggingFace)
