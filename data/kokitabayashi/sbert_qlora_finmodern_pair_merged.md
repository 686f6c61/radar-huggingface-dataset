# kokitabayashi/sbert_qlora_finmodern_pair_merged

## Resumen

`sbert_qlora_finmodern_pair_merged` es un modelo de embeddings de frases publicado por el usuario kokitabayashi en Hugging Face. Se distribuye como un `SentenceTransformer` con un backbone BERT de tipo `bert-base` (109.482.240 parámetros, ~0,2 GB de pesos en safetensors) y una capa de pooling de media sobre vectores de 768 dimensiones. El nombre sugiere un ajuste fino con QLoRA sobre pares de un corpus financiero moderno ("finmodern_pair"), seguido de una fusión de pesos ("merged"), aunque la model card no documenta el proceso de entrenamiento ni el dataset empleado.

El problema que aborda es el habitual de los modelos de similitud semántica: convertir frases y párrafos en vectores densos reutilizables para búsqueda semántica, clustering o deduplicación. Sin embargo, la propia model card, que parece heredada de la plantilla de `sentence-transformers/bert-base-nli-mean-tokens`, incluye un aviso explícito de deprecación y advierte de que el modelo produce embeddings de baja calidad. Es relevante ahora únicamente como pieza de trazabilidad o como experimento reproducible: no hay descargas ni likes, no se declaran idiomas soportados y no se han publicado evaluaciones.

La ficha se basa exclusivamente en los metadatos de Hugging Face y en el contenido de la model card. Cualquier dato no documentado se marca como "no disponible"; no se infieren cifras de rendimiento ni de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT (`BertModel`) + pooling de media (SentenceTransformer) |
| Parametros totales | 109.482.240 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (`max_seq_length` según la model card) |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (el campo de idiomas no está declarado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,2 GB); compatible con `transformers` y `sentence-transformers` |
| Dimension del embedding | 768 |
| Pooling | media de tokens con máscara de atención |
| Pipeline | `sentence-similarity` / `feature-extraction` |
| Compatibilidad de despliegue | `text-embeddings-inference`, endpoints compatibles |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder BERT de 12 capas y dimensión oculta 768 (la configuración estándar de `bert-base`, coherente con los 109,5 millones de parámetros), rematado por una capa `Pooling` con `pooling_mode_mean_tokens: True`, `pooling_mode_cls_token: False` y `word_embedding_dimension: 768`. La longitud máxima de secuencia declarada es de 128 tokens, muy inferior a los 512 típicos de BERT, lo que limita el uso a frases cortas o pasajes truncados.

No hay información verificable sobre el corpus de entrenamiento, el número de tokens, la composición del dataset ni el uso de RLHF/DPO (no aplicable en un modelo de embeddings). El nombre del repositorio apunta a un ajuste con QLoRA sobre pares y a una posterior fusión de pesos, pero la model card no describe ni la receta, ni los hiperparámetros, ni el criterio de selección de pares. La model card reproduce el texto de la plantilla de `sentence-transformers/bert-base-nli-mean-tokens`, incluido el aviso de deprecación, por lo que la documentación del autor es prácticamente inexistente.

## Capacidades

- Generación de embeddings de frases y párrafos en un espacio denso de 768 dimensiones.
- Similitud semántica entre pares de textos (cosine similarity sobre los vectores resultantes).
- Búsqueda semántica y recuperación densa sobre índices vectoriales.
- Clustering y agrupamiento de documentos por proximidad en el espacio de embeddings.
- Deduplicación y near-duplicate detection de registros textuales.
- Extracción de características (`feature-extraction`) para pipelines de `transformers`.
- Compatible con `sentence-transformers`, `text-embeddings-inference` y endpoints compatibles.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking": es un encoder de embeddings, no un modelo generativo.
- Capacidades multilingües: no declaradas; no se puede asumir cobertura más allá del inglés de `bert-base` sin evaluación.

## Casos de uso

- Búsqueda semántica en documentación interna: indexar fragmentos cortos (titulares, FAQs, descripciones) y recuperar por similitud coseno. Adecuado por el tamaño reducido del modelo y su baja latencia, siempre que los fragmentos no superen los 128 tokens.
- Deduplicación de registros en un CRM o catálogo: comparar embeddings de nombres de empresa o descripciones de producto para detectar duplicados. El coste de inferencia es bajo y el modelo cabe en CPU.
- Clustering exploratorio de tickets de soporte: agrupar consultas por temática antes de un etiquetado manual. Útil como paso previo de análisis no supervisado.
- Filtrado de candidatos en un pipeline de retrieval-augmented generation: usar el modelo como retriever ligero en una primera fase, antes de un re-ranker de mayor tamaño.
- Prototipado de sistemas de recomendación basados en contenido: vectorizar descripciones de ítems y calcular similitud entre ellos para sugerencias "más como esto".
- Experimentación académica con QLoRA y fusión de pesos: el repositorio sirve como artefacto reproducible para estudiar el efecto del ajuste sobre un backbone BERT, no como modelo de producción.
- Detección de near-duplicates en corpus financieros: si el ajuste con pares financieros es real, podría emplearse para agrupar comunicados o titulares similares, aunque sin evaluación publicada no hay evidencia de que supere al backbone base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MTEB, STS ni de ningún otro conjunto de evaluación, y tampoco se documenta una comparación con `bert-base-nli-mean-tokens` u otros modelos de embeddings.

## Requisitos de hardware

- VRAM estimada: ~0,45 GB en fp32 (109,5 M parámetros × 4 bytes) y ~0,22 GB en fp16; el repo ocupa 0,2 GB en safetensors.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU o CPU para lotes pequeños.
- GPU recomendadas para throughput alto: A100, H100 o L4 si se sirve a gran escala con `text-embeddings-inference`; para uso individual, cualquier GPU con ≥2 GB de VRAM es suficiente.
- Despliegue: `sentence-transformers`, `transformers` con pooling manual, `text-embeddings-inference` y endpoints compatibles. No se publican variantes GGUF, por lo que `llama.cpp`/Ollama no están soportados de forma nativa.
- Latencia y throughput: no disponibles. Por el tamaño del modelo y la longitud máxima de 128 tokens, se espera una latencia de milisegundos por lote en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dimension | Licencia | Estado |
|---|---|---|---|---|---|
| `kokitabayashi/sbert_qlora_finmodern_pair_merged` | 109,5 M | 128 tokens | 768 | Apache 2.0 | Sin evaluar, aviso de deprecación en la model card |
| `sentence-transformers/bert-base-nli-mean-tokens` | ~110 M | 128 tokens | 768 | Apache 2.0 | Deprecado oficialmente por sentence-transformers |
| `sentence-transformers/all-MiniLM-L6-v2` | ~22,7 M | 256 tokens | 384 | Apache 2.0 | Modelo de referencia ligero, ampliamente evaluado |
| `sentence-transformers/all-mpnet-base-v2` | ~109 M | 384 tokens | 768 | Apache 2.0 | Modelo de referencia de mayor calidad en MTEB |

La comparación se limita a parámetros, contexto, dimensión y licencia: no hay datos de rendimiento del modelo de kokitabayashi que permitan contrastarlo con las alternativas en MTEB o STS.

## Limitaciones y advertencias

- La model card incluye un aviso explícito de deprecación: "This model is deprecated. Please don't use it as it produces sentence embeddings of low quality".
- No se ha publicado ninguna evaluación (MTEB, STS, recuperación) que respalde la calidad del ajuste QLoRA o de la fusión de pesos.
- La model card parece heredada de la plantilla de `bert-base-nli-mean-tokens`; no describe el corpus "finmodern_pair" ni la receta de entrenamiento, lo que impide reproducir el modelo.
- Contexto máximo de 128 tokens: los textos más largos se truncan, con pérdida de información semántica.
- Idiomas no declarados: no se puede asumir multilingüismo; el backbone `bert-base` es predominantemente inglés.
- Riesgo de sesgos heredados del corpus de preentrenamiento de BERT (género, etnia, dominio) y del corpus financiero no documentado.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de similitudes espurias en dominios fuera de la distribución de entrenamiento.
- Sin descargas ni likes: no hay evidencia de uso en producción ni de validación por la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluación hace desaconsejable desplegarlo en producción sin una validación propia contra un modelo de referencia como `all-MiniLM-L6-v2` o `all-mpnet-base-v2`.
- No se publican variantes cuantizadas ni artefactos para `llama.cpp`/Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kokitabayashi/sbert_qlora_finmodern_pair_merged
- Paper de Sentence-BERT (Reimers y Gurevych, 2019): https://arxiv.org/abs/1908.10084
- Documentación de Sentence-Transformers: https://www.sbert.net
- Modelos de embeddings recomendados por SBERT: https://www.sbert.net/docs/pretrained_models.html
- Modelo base de referencia: https://huggingface.co/sentence-transformers/bert-base-nli-mean-tokens
