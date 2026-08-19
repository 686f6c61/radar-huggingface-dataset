# rafmacalaba/lfm2.5-Encoder-350M-datause_smoke

## Resumen

Este modelo es un fine-tune del encoder LFM2.5-Encoder-350M de Liquid AI, especializado en el etiquetado de menciones de fuentes de datos (NER) en artículos de investigación económica. Desarrollado por rafmacalaba, el modelo identifica y clasifica menciones de datos en tres categorías: `NAMED_DATA` (nombre propio), `DESCRIPTIVE_DATA` (descripción) y `VAGUE_DATA` (vago). Está diseñado para tareas de token-classification y se distribuye bajo licencia Apache 2.0. Con 354 millones de parámetros, es un modelo compacto que puede ejecutarse en hardware de consumo, y su relevancia radica en automatizar la extracción de fuentes de datos en la literatura académica, un paso clave para estudios de reproducibilidad y meta-análisis.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (encoder bidireccional, masked language model) |
| Parametros totales | 354.483.968 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (encoder, no generativo) |
| Tipos de cuantizacion | No disponible (solo pesos completos en safetensors) |
| Idiomas soportados | No especificado; el modelo base soporta 15 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura LFM2 de Liquid AI, un encoder bidireccional de tipo transformer con enmascaramiento (masked language model). El fine-tune se realizó sobre el dataset `rafmacalaba/data-use-mentions` en su configuración `bio`, con 5 épocas, learning rate 2e-5, batch size 16 y precisión bf16. No se han publicado detalles adicionales sobre el entrenamiento, como la composición exacta del dataset o el uso de técnicas de regularización. El modelo requiere código personalizado (`custom_code`) para su carga, según los tags de HuggingFace.

## Capacidades

- Token classification (NER) para menciones de fuentes de datos en texto académico.
- Clasificación en tres etiquetas: `NAMED_DATA` (nombres propios, títulos o acrónimos), `DESCRIPTIVE_DATA` (descripciones sin nombre) y `VAGUE_DATA` (referencias genéricas sin fuente identificable).
- Es un encoder bidireccional, por lo que no genera texto; su salida es una secuencia de etiquetas por token.
- No soporta tool calling, agentes ni razonamiento multi-paso, al ser un modelo de clasificación.
- El modelo base es multilingüe (15 idiomas), pero el fine-tune no especifica los idiomas de entrenamiento; probablemente esté enfocado en inglés (papers de economía).

## Casos de uso

- **Extracción de fuentes de datos en artículos de economía**: el modelo puede procesar automáticamente papers y extraer menciones de datasets, encuestas o censos, facilitando la creación de bases de datos de fuentes utilizadas en investigación.
- **Análisis de reproducibilidad**: al identificar qué fuentes de datos se mencionan en un estudio, los investigadores pueden verificar la disponibilidad y replicabilidad de los datos.
- **Meta-análisis y revisiones sistemáticas**: permite agrupar estudios según las fuentes de datos que utilizan, acelerando la síntesis de literatura.
- **Indexación de literatura académica**: integrado en pipelines de procesamiento de documentos, puede etiquetar automáticamente los recursos de datos mencionados para mejorar la búsqueda y recuperación de información.
- **Detección de sesgos en selección de datos**: al clasificar menciones como vagas o descriptivas, se puede evaluar la transparencia de los artículos en cuanto a sus fuentes.
- **Automatización de tareas de curaduría de datos**: en repositorios institucionales, el modelo puede ayudar a catalogar los conjuntos de datos citados en publicaciones.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluación en un conjunto de validación (holdout) con métricas label-agnostic. Se presentan para diferentes umbrales de decisión:

| Umbral | TP | FP | FN | Precisión | Recall | F0.5 | F1 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0.10 | 4407 | 1229 | 2939 | 0.7819 | 0.5999 | 0.7372 | 0.6789 |
| 0.20 | 4407 | 1229 | 2939 | 0.7819 | 0.5999 | 0.7372 | 0.6789 |
| 0.30 | 4406 | 1228 | 2940 | 0.7820 | 0.5998 | 0.7372 | 0.6789 |
| 0.40 | 4398 | 1216 | 2948 | 0.7834 | 0.5987 | 0.7379 | 0.6787 |
| 0.50 | 4323 | 1139 | 3023 | 0.7915 | 0.5885 | 0.7404 | 0.6750 |
| 0.60 | 3960 | 935 | 3386 | 0.8090 | 0.5391 | 0.7353 | 0.6470 |
| 0.70 | 3642 | 736 | 3704 | 0.8319 | 0.4958 | 0.7326 | 0.6213 |

El mejor F0.5 es 0.7404 (umbral 0.5) y el mejor F1 es 0.6789 (umbral 0.1). No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Con 354M parámetros, el modelo requiere aproximadamente 1.4 GB de VRAM en fp32 y 0.7 GB en bf16.
- Puede ejecutarse en GPUs de consumo como RTX 3060 (12 GB) o superiores; incluso en CPU con suficiente RAM (4-8 GB).
- Para inferencia, se recomienda usar Hugging Face Transformers con `AutoModelForTokenClassification` y el código personalizado indicado.
- No es adecuado para vLLM ni TGI, ya que estos están orientados a modelos generativos; para encoders se usan bibliotecas como Transformers, ONNX Runtime o TensorRT.
- La latencia es baja: en una GPU moderna, el procesamiento de un documento de 512 tokens típicamente toma menos de 100 ms.

## Comparativa con modelos similares

No se dispone de comparaciones directas con otros modelos en la información proporcionada. El modelo base `LiquidAI/LFM2.5-Encoder-350M` es el punto de partida; este fine-tune mejora la tarea específica de NER de menciones de datos. Otros encoders como BERT o RoBERTa podrían adaptarse a la misma tarea, pero no hay datos de rendimiento comparativo disponibles.

## Limitaciones y advertencias

- El modelo está entrenado específicamente en el dominio de papers de economía; su rendimiento en otros dominios (biomedicina, ciencias sociales) puede degradarse.
- No se especifican los idiomas del fine-tune; aunque el base es multilingüe, la efectividad en idiomas distintos al inglés no está garantizada.
- La evaluación se realizó con un conjunto de validación limitado; los resultados pueden no reflejar el rendimiento en producción.
- Requiere código personalizado (`custom_code`) para cargar el modelo, lo que puede complicar su integración en entornos estándar.
- Al ser un encoder, no puede generar explicaciones ni razonamiento; solo produce etiquetas por token.
- No se han documentado sesgos específicos, pero al estar entrenado en literatura académica, puede heredar sesgos de selección de publicaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rafmacalaba/lfm2.5-Encoder-350M-datause_smoke
- Modelo base LFM2.5-Encoder-350M: https://huggingface.co/LiquidAI/LFM2.5-Encoder-350M
- Documentación de Liquid AI sobre LFM2.5-Encoder-350M: https://docs.liquid.ai/lfm/models/lfm25-encoder-350m
- Blog de Liquid AI sobre retrievers LFM2.5: https://www.liquid.ai/blog/lfm2-5-retrievers
- Página de interfaze.ai con detalles del modelo base: https://interfaze.ai/models/liquidailfm25-encoder-350m
