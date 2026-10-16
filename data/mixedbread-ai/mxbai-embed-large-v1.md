# mixedbread-ai/mxbai-embed-large-v1

## Resumen

mxbai-embed-large-v1 es un modelo de embeddings de texto desarrollado por mixedbread-ai, publicado en marzo de 2024 y pensado exclusivamente para generación de representaciones vectoriales densas (feature-extraction), no para generación de texto. Se basa en una arquitectura transformer tipo BERT-large, con 335.141.888 parámetros totales, y transforma frases, párrafos o documentos completos en vectores que pueden compararse mediante similitud coseno o producto escalar. Su relevancia actual viene de que compite en la parte alta de las clasificaciones de MTEB dentro de la categoría de modelos de menos de 400 millones de parámetros, lo que permite desplegarlo en CPU o en GPUs de gama media a un coste muy inferior al de los modelos de embeddings propietarios.

El modelo está entrenado en inglés y optimizado con la función de pérdida AnglE (descrita en el paper arXiv:2309.12871), que aborda el problema del colapso de similitud coseno en el entrenamiento contrastivo. Está publicado bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones de atribución, y el repositorio incluye pesos en safetensors, ONNX, OpenVINO y GGUF, además de soporte para sentence-transformers, transformers.js y Text Embeddings Inference.

Con casi 2 millones de descargas y 839 likes en HuggingFace, se ha convertido en una de las referencias de facto para sistemas RAG, búsqueda semántica y clasificación zero-shot en inglés. Su limitación principal es el idioma: la model card solo declara soporte para inglés, por lo que el rendimiento en castellano no está garantizado ni documentado en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT-large (feature-extraction) |
| Parametros totales | 335.141.888 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (límite posicional de BERT-large) |
| Tipos de cuantizacion | safetensors en FP32; variantes ONNX, OpenVINO y GGUF (niveles concretos no detallados en la informacion disponible) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, ONNX, OpenVINO, GGUF |
| Dimension de embedding | 1024 (no indicado explicitamente en la informacion proporcionada) |
| Funcion de perdida | AnglE (arXiv:2309.12871) |
| Libreria principal | sentence-transformers |
| Fecha de publicacion | 2024-03-07 (ultima actualizacion del repositorio: 2026-01-23) |
| Tamano del repositorio | 6,7 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder bidireccional de tipo BERT-large, con 24 capas, hidden size de 1024 y 335 millones de parámetros, reutilizado como extractor de características. La salida se agrega (pooling) para producir un vector de 1024 dimensiones por secuencia de entrada que puede normalizarse y compararse mediante similitud coseno.

El detalle de entrenamiento más destacable es el uso de la función de pérdida AnglE, referenciada en el propio repositorio mediante el tag `arxiv:2309.12871`. AnglE combina una pérdida de similitud coseno con una pérdida de ángulo complejo en el plano complejo, lo que evita el colapso de la representación cuando el margen coseno se satura durante el entrenamiento contrastivo. El nombre interno del model-index (`mxbai-angle-large-v1`) confirma esa relación. No se especifican en la información proporcionada el número exacto de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO: en el caso de un modelo de embeddings, esos procesos no son habituales y no se declaran.

El modelo se distribuye con soporte multi-formato desde el mismo repositorio: safetensors para PyTorch y sentence-transformers, ONNX y OpenVINO para inferencia optimizada en CPU, GGUF para llama.cpp/Ollama y compatibilidad con transformers.js para ejecución en navegador.

## Capacidades

- Generación de embeddings densos de texto para búsqueda semántica, similitud y recuperación de información.
- Recuperación (retrieval) asimétrica entre consultas cortas y documentos largos, evaluada en MTEB en tareas como ArguAna y CQADupstack.
- Clasificación de texto mediante embeddings fijos (evaluada en AmazonPolarity, AmazonReviews, Banking77 y AmazonCounterfactual).
- Reranking de pares consulta-documento (evaluada en AskUbuntuDupQuestions).
- Clustering de documentos por similitud semántica (ArxivClusteringP2P/S2S y BiorxivClusteringP2P/S2S).
- Similitud semántica textual (STS), con resultados en BIOSSES.
- Ejecución en navegador vía transformers.js y en CPU vía ONNX/OpenVINO.
- Soporte de tool calling: no disponible (es un modelo de embeddings, no generativo).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no; el modelo está entrenado y evaluado únicamente en inglés según la información proporcionada.
- Capacidades de visión, audio o modo «thinking»: no disponibles.

## Casos de uso

- Búsqueda semántica en bases de conocimiento internas: indexar documentos en una base vectorial (FAISS, Qdrant, pgvector) y recuperar los fragmentos más relevantes para una consulta en lenguaje natural. El modelo es adecuado porque sus vectores de 1024 dimensiones mantienen buena separabilidad en corpus técnicos y jurídicos en inglés.
- Recuperación aumentada por generación (RAG) sobre documentación corporativa: se usa como retriever en la primera etapa del pipeline, alimentando a un modelo generativo. Aporta una latencia baja por consulta, ya que solo requiere una pasada de encoder de 335 millones de parámetros.
- Clasificación zero-shot de tickets de soporte: generar embeddings de las descripciones de incidencias y de las etiquetas candidatas, y asignar la categoría con mayor similitud coseno. Es viable porque el modelo puntúa 87,82 de accuracy en Banking77, un dataset de intenciones bancarias finas.
- Deduplicación y agrupamiento de contenido: agrupar noticias, artículos científicos o publicaciones de foro por similitud semántica para detectar duplicados o construir clusters temáticos sin etiquetas previas.
- Reranking de resultados de un buscador léxico: usar la similitud entre consulta y documento para reordenar los primeros candidatos devueltos por BM25, mejorando el nDCG final del sistema de búsqueda.
- Moderación y análisis de sentimiento a escala: clasificar reseñas o comentarios en inglés mediante embeddings más un clasificador ligero entrenado sobre ellos, con un coste de inferencia muy inferior al de un LLM generativo.
- Motor de búsqueda en aplicaciones de escritorio o extensiones de navegador: gracias a las variantes ONNX, OpenVINO, GGUF y transformers.js, el modelo puede ejecutarse en local sin enviar datos a un servicio externo, algo relevante para requisitos de privacidad.
- Construcción de datasets de evaluación para sistemas de recuperación: generar representaciones de referencia para medir recall y precisión de otros retrievers en corpus propios.

## Benchmarks y rendimiento

Resultados oficiales declarados por el autor en el model-index de la model card. Todos aparecen con `verified: false` y la información proporcionada está truncada, por lo que la lista no cubre el conjunto completo de tareas evaluadas.

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Classification | MTEB AmazonCounterfactualClassification (en) | accuracy | 75,04 |
| Classification | MTEB AmazonCounterfactualClassification (en) | f1 | 68,93 |
| Classification | MTEB AmazonCounterfactualClassification (en) | ap | 37,74 |
| Classification | MTEB AmazonPolarityClassification | accuracy | 93,84 |
| Classification | MTEB AmazonPolarityClassification | f1 | 93,83 |
| Classification | MTEB AmazonPolarityClassification | ap | 90,93 |
| Classification | MTEB AmazonReviewsClassification (en) | accuracy | 49,18 |
| Classification | MTEB AmazonReviewsClassification (en) | f1 | 48,74 |
| Classification | MTEB Banking77Classification | accuracy | 87,82 |
| Classification | MTEB Banking77Classification | f1 | 87,80 |
| Retrieval | MTEB ArguAna | ndcg_at_10 | 66,02 |
| Retrieval | MTEB ArguAna | map_at_10 | 57,78 |
| Retrieval | MTEB ArguAna | recall_at_10 | 91,89 |
| Retrieval | MTEB ArguAna | mrr_at_10 | 57,93 |
| Retrieval | MTEB CQADupstackAndroidRetrieval | map_at_10 | 43,63 |
| Retrieval | MTEB CQADupstackAndroidRetrieval | ndcg_at_10 | 50,06 |
| Retrieval | MTEB CQADupstackAndroidRetrieval | mrr_at_10 | 49,54 |
| Clustering | MTEB ArxivClusteringP2P | v_measure | 48,97 |
| Clustering | MTEB ArxivClusteringS2S | v_measure | 42,98 |
| Clustering | MTEB BiorxivClusteringP2P | v_measure | 39,92 |
| Clustering | MTEB BiorxivClusteringS2S | v_measure | 36,73 |
| Reranking | MTEB AskUbuntuDupQuestions | map | 65,16 |
| Reranking | MTEB AskUbuntuDupQuestions | mrr | 78,24 |
| STS | MTEB BIOSSES | cos_sim_spearman | 88,41 |
| STS | MTEB BIOSSES | cos_sim_pearson | 89,63 |

Notas: los valores de CQADupstack corresponden a métricas parcialmente visibles en la información proporcionada; el resto del bloque aparece truncado. No se dispone en la información facilitada de la media agregada de MTEB ni de resultados comparativos oficiales frente a otros modelos.

## Requisitos de hardware

- VRAM en FP32: aproximadamente 1,34 GB solo para pesos (335.141.888 parámetros × 4 bytes), más activaciones según batch y longitud de secuencia.
- VRAM en FP16/BF16: aproximadamente 670 MB de pesos.
- VRAM en INT8: aproximadamente 335 MB de pesos.
- Cuantización GGUF de 4 bits: aproximadamente 170-200 MB de pesos, apta para CPU.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM puede ejecutar el modelo; para lotes grandes orientados a indexación masiva son adecuadas A100, H100, L40S o RTX 4090. En GPUs de consumo, una RTX 3060 de 12 GB o superior es suficiente.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna de 4 GB o más, e incluso en CPU de forma interactiva.
- CPU: inferencia viable con ONNX Runtime o OpenVINO; recomendable al menos 2-4 GB de RAM libre para lotes moderados de secuencias de 512 tokens.
- Apple Silicon: ejecutable mediante GGUF/llama.cpp o CoreML vía conversiones ONNX.
- Opciones de despliegue: sentence-transformers, Text Embeddings Inference (TEI), ONNX Runtime, OpenVINO, llama.cpp u Ollama con los GGUF del repositorio, transformers.js para navegador, FastEmbed.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia estructural, un batch de 32 secuencias de 512 tokens en una GPU moderna de gama media suele completarse por debajo del segundo, pero este dato no está confirmado por el autor en la información facilitada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados MTEB agregados de mxbai-embed-large-v1 ni de sus competidores, por lo que la comparativa se limita a datos estructurales verificables.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formatos |
|---|---|---|---|---|---|
| mixedbread-ai/mxbai-embed-large-v1 | 335 M | 512 tokens | en | apache-2.0 | safetensors, ONNX, OpenVINO, GGUF |
| BAAI/bge-large-en-v1.5 | 335 M | 512 tokens | en | MIT | safetensors, ONNX, GGUF |
| intfloat/e5-large-v2 | 335 M | 512 tokens | en | MIT | safetensors, ONNX, GGUF |
| jinaai/jina-embeddings-v2-base-en | 137 M | 8192 tokens | en | apache-2.0 | safetensors, ONNX |
| OpenAI text-embedding-3-large | no disponible | no disponible | multilingue | propietaria (API) | no aplica (solo API) |

Diferencias clave: frente a bge-large-en-v1.5 y e5-large-v2, mxbai-embed-large-v1 comparte tamaño y contexto pero se distingue por la función de pérdida AnglE y por incluir variantes OpenVINO y transformers.js de serie. Frente a jina-embeddings-v2-base-en, ofrece un encoder mayor (335 M frente a 137 M) pero una ventana de contexto mucho menor (512 frente a 8192 tokens). Frente a text-embedding-3-large, la ventaja es la ejecución local y la licencia Apache 2.0, a cambio de no ser multilingüe.

## Limitaciones y advertencias

- Modelo monolingüe: la model card solo declara inglés. El rendimiento en castellano u otros idiomas no está documentado y no debería asumirse.
- Ventana de contexto de 512 tokens: los documentos largos deben trocearse antes de generar embeddings, lo que puede degradar la recuperación en textos con dependencias de largo alcance.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso. Usarlo como si fuera un LLM es un error de categoría.
- Riesgo de sesgos: al entrenarse sobre corpus web en inglés, puede heredar sesgos demográficos, culturales y de género presentes en esos datos. No se documentan en la información disponible análisis de sesgo específicos.
- Riesgo de falsos positivos por similitud superficial: como todo modelo de embeddings, puede asignar alta similitud a textos que comparten vocabulario pero no significado, o baja similitud a paráfrasis muy alejadas léxicamente.
- Resultados no verificados: la mayoría de las métricas del model-index aparecen con `verified: false`, es decir, son declaradas por el autor y no auditadas de forma independiente.
- Información de benchmarks truncada: la model card completa incluye más tareas de las recogidas aquí; no se dispone de la media agregada de MTEB en la información facilitada.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, con la obligación habitual de conservar el aviso de licencia y el archivo NOTICE si existe. No impone restricciones de uso adicionales conocidas.
- Tamaño de repositorio elevado (6,7 GB) por acumular múltiples formatos y cuantizaciones: conviene descargar solo los archivos necesarios para producción.
- Longitud máxima de 512 tokens: los pipelines que necesiten contexto mayor deben trocear con solapamiento o recurrir a un modelo alternativo con ventana ampliada.
- Normalización: para usar similitud coseno es necesario normalizar los vectores; omitirlo altera el orden de recuperación.
- Los resultados de la búsqueda web realizada no contienen información técnica relevante sobre el modelo y no se han utilizado como fuente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mixedbread-ai/mxbai-embed-large-v1
- Paper de AnglE (referenciado en el repositorio): https://arxiv.org/abs/2309.12871
- Benchmarks MTEB: https://huggingface.co/spaces/mteb/leaderboard
- Organización del autor en HuggingFace: https://huggingface.co/mixedbread-ai
- No se han encontrado enlaces técnicos adicionales relevantes en los resultados de búsqueda web proporcionados.
