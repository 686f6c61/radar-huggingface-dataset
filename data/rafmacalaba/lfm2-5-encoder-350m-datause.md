# rafmacalaba/lfm2.5-Encoder-350M-datause

## Resumen

El modelo `rafmacalaba/lfm2.5-Encoder-350M-datause` es un fine-tune del encoder bidireccional `LiquidAI/LFM2.5-Encoder-350M`, especializado en el etiquetado BIO de menciones de uso de datos en artículos de investigación económica. Desarrollado por el usuario rafmacalaba, resuelve el problema de identificar automáticamente referencias a conjuntos de datos, encuestas, censos y registros en texto académico, distinguiendo entre menciones con nombre propio, descripciones sin nombre y referencias vagas. Es relevante para la minería de literatura científica y la construcción de bases de datos de fuentes de datos reutilizables. Con 354 millones de parámetros y una ventana de contexto de 8.000 tokens, ofrece una solución ligera y eficiente para tareas de token classification en dominios especializados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (encoder bidireccional con atención lineal) |
| Parametros totales | 354.483.968 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 8.000 tokens (según documentación de Liquid AI) |
| Tipos de cuantizacion | no disponible (solo pesos completos en safetensors) |
| Idiomas soportados | multilingüe en la base (15 idiomas), pero el fine-tune no especifica; entrenado sobre textos de economía en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (2,8 GB) |

## Arquitectura y entrenamiento

El modelo base `LFM2.5-Encoder-350M` es un encoder bidireccional construido sobre la arquitectura LFM2, que emplea atención lineal para reducir la complejidad computacional y permitir inferencia rápida incluso en CPU. Fue preentrenado como masked language model en 15 idiomas con una ventana de contexto de 8.000 tokens. El fine-tune se realizó sobre el dataset `rafmacalaba/data-use-mentions` (configuración BIO) durante 5 épocas, con una tasa de aprendizaje de 2e-5, batch size de 16 y precisión bf16. La tarea es token classification con tres etiquetas: `NAMED_DATA` (nombre propio, título o acrónimo de una fuente de datos concreta), `DESCRIPTIVE_DATA` (fuente descrita con palabras pero sin nombre) y `VAGUE_DATA` (referencia genérica sin fuente identificable). No se aplicaron técnicas de RLHF ni DPO; es un ajuste supervisado estándar.

## Capacidades

- Token classification especializada en detección de menciones de uso de datos (NER de fuentes de datos).
- Distingue tres tipos de menciones: con nombre propio, descriptivas y vagas.
- Adecuado para procesar artículos de investigación económica y textos académicos similares.
- Al ser un encoder, no genera texto ni soporta tool calling, agentes o razonamiento multi-paso.
- La base multilingüe permite en principio adaptación a otros idiomas, aunque el fine-tune no ha sido evaluado fuera del inglés.
- Inferencia eficiente en CPU y GPU gracias a la atención lineal del modelo base.

## Casos de uso

- Extracción de fuentes de datos en literatura económica: el modelo identifica y clasifica menciones a conjuntos de datos, encuestas o censos en papers, permitiendo construir inventarios de recursos reutilizables.
- Creación de bases de datos de reutilización de datos: al etiquetar automáticamente las referencias, se puede cuantificar qué fuentes se citan más y cómo se describen, útil para estudios bibliométricos.
- Automatización de revisiones sistemáticas: en meta-análisis económicos, el modelo puede filtrar artículos que mencionan datos específicos, reduciendo el trabajo manual de cribado.
- Análisis de políticas de datos: permite rastrear cómo se citan los registros administrativos o encuestas oficiales en la literatura, apoyando decisiones sobre apertura de datos.
- Indexación semántica de repositorios académicos: integrado en pipelines de procesamiento de texto, ayuda a etiquetar documentos con metadatos sobre las fuentes de datos que emplean.
- Monitorización de tendencias de investigación: al clasificar menciones vagas frente a concretas, se puede medir la precisión con la que los autores reportan sus fuentes, un indicador de calidad metodológica.

## Benchmarks y rendimiento

El autor proporciona una evaluación sobre un conjunto de validación (holdout) con métricas agnósticas de etiqueta, variando el umbral de decisión:

| Umbral | TP | FP | FN | Precision | Recall | F0.5 | F1 |
|---|---|---|---|---|---|---|---|
| 0.10 | 4577 | 1091 | 2769 | 0.8075 | 0.6231 | 0.7624 | 0.7034 |
| 0.20 | 4577 | 1091 | 2769 | 0.8075 | 0.6231 | 0.7624 | 0.7034 |
| 0.30 | 4576 | 1091 | 2770 | 0.8075 | 0.6229 | 0.7623 | 0.7033 |
| 0.40 | 4565 | 1086 | 2781 | 0.8078 | 0.6214 | 0.7621 | 0.7025 |
| 0.50 | 4501 | 1033 | 2845 | 0.8133 | 0.6127 | 0.7633 | 0.6989 |
| 0.60 | 4200 | 840 | 3146 | 0.8333 | 0.5717 | 0.7635 | 0.6782 |
| 0.70 | 3877 | 687 | 3469 | 0.8495 | 0.5278 | 0.7572 | 0.6510 |

El mejor F0.5 es 0.7635 (umbral 0.6) y el mejor F1 es 0.7034 (umbral 0.1). No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: en fp32 el modelo ocupa ~1,4 GB; en fp16/bf16 ~700 MB. Con batch pequeño, cabe en GPUs con 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB (GTX 1650, RTX 3050, etc.). También funciona en CPU con razonable latencia gracias a la atención lineal.
- Despliegue en consumer GPU: sí, sin problemas. Incluso en Raspberry Pi con cuantización (aunque no hay cuantizaciones publicadas).
- Opciones de despliegue: Hugging Face Transformers (pipeline `token-classification`), ONNX Runtime, o servidores de inferencia como TGI o vLLM (aunque estos están más orientados a generativos, pueden servir para encoders).
- Latencia: al ser un encoder de 350M, la inferencia es rápida; en CPU se procesan cientos de tokens por segundo, en GPU miles.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de NER especializados. Como referencia, se puede comparar con encoders generalistas como `bert-base-uncased` (110M) o `roberta-base` (125M), que también se usan para token classification, pero el modelo base LFM2 ofrece mayor contexto (8K) y atención lineal, lo que reduce coste computacional. Sin embargo, el fine-tune está muy especializado en un dominio concreto, por lo que no es directamente comparable con modelos NER generalistas. No hay datos de rendimiento relativo disponibles.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para detectar menciones de uso de datos en economía; su rendimiento en otros dominios (medicina, ingeniería) no está garantizado.
- Las etiquetas son específicas del dataset de entrenamiento; puede haber errores de clasificación en textos con formatos atípicos o jerga no cubierta.
- El recall es moderado (0.62 en el mejor F1), lo que implica que una parte de las menciones reales pueden no detectarse.
- No se ha evaluado la robustez frente a textos multilingües, aunque la base es multilingüe.
- La licencia Apache 2.0 permite uso comercial, pero el dataset de entrenamiento `rafmacalaba/data-use-mentions` no tiene licencia explícita en la información proporcionada; conviene verificar sus términos antes de redistribuir el modelo.
- El tamaño del repositorio (2,8 GB) sugiere que no hay cuantizaciones disponibles, lo que puede limitar su uso en entornos con memoria restringida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rafmacalaba/lfm2.5-Encoder-350M-datause
- Modelo base en Hugging Face: https://huggingface.co/LiquidAI/LFM2.5-Encoder-350M
- Documentación oficial de Liquid AI: https://docs.liquid.ai/lfm/models/lfm25-encoder-350m
- Blog de Liquid AI sobre los encoders LFM2.5: https://www.liquid.ai/blog/lfm2-5-encoders
- Blog de Liquid AI sobre LFM2.5-350M: https://www.liquid.ai/blog/lfm2-5-350m-no-size-left-behind
