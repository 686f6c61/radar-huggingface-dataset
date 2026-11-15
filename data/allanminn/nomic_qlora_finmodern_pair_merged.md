# allanminn/nomic_qlora_finmodern_pair_merged

## Resumen

`allanminn/nomic_qlora_finmodern_pair_merged` es un modelo de embeddings de frases (sentence-transformers) derivado de la arquitectura Nomic-BERT, publicado por el usuario allanminn en Hugging Face. Se trata de un ajuste fino mediante QLoRA sobre pares de datos financieros modernos ("finmodern_pair"), cuyo resultado se ha fusionado (merged) en un checkpoint único de 136,7 millones de parametros. Su proposito es generar representaciones vectoriales densas para tareas de similitud semantica, recuperacion de informacion y clasificacion de textos, con enfasis declarado en el dominio financiero en ingles.

El modelo se distribuye bajo licencia Apache 2.0 y peso en formato safetensors, con un tamano de repositorio de 0,3 GB. Esta etiquetado como compatible con sentence-transformers, transformers.js y text-embeddings-inference, lo que facilita su despliegue tanto en pipelines de Python como en entornos JavaScript o servicios de inferencia dedicados. No obstante, el repositorio no cuenta con descargas ni valoraciones en el momento de la consulta, lo que sugiere que se trata de un artefacto reciente y poco validado por la comunidad.

La relevancia de esta ficha radica en documentar con rigor un modelo de embeddings de nicho: aunque el autor declara resultados en el benchmark MTEB, estos no estan verificados y la model card es practicamente un volcado de la configuracion de evaluacion. Por tanto, cualquier evaluacion de produccion debe considerar estos datos como orientativos y no como garantia de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nomic-BERT (transformer encoder, `nomic_bert`) |
| Parametros totales | 136.731.648 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos safetensors; compatible con cuantizacion via transformers/optimum, no confirmado por el autor) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Nomic-BERT, un encoder transformer de tipo BERT con atencion bidireccional, disenado originalmente para generar embeddings de texto. Sobre esta base, el autor aplico un ajuste fino con QLoRA (cuantizacion de bajo rango con adaptadores LoRA) sobre un conjunto de pares denominado "finmodern_pair", presumiblemente orientado a similitud semantica en el dominio financiero. Posteriormente, los adaptadores se fusionaron en los pesos base, dando lugar al checkpoint `_merged` que se distribuye.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO (poco habituales en modelos de embeddings). Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal; se trata de un encoder estandar con pooling para obtener el vector de frase. La unica referencia tecnica explicita son los papers citados en los tags (`arxiv:2402.01613` y `arxiv:2205.13147`), que corresponden a trabajos sobre embeddings y evaluacion, pero no se detalla su uso concreto en este ajuste.

## Capacidades

- Generacion de embeddings de frases para similitud semantica y recuperacion de informacion.
- Extraccion de caracteristicas (`feature-extraction`) para downstream tasks.
- Clasificacion de texto mediante representaciones vectoriales (evaluado en MTEB).
- Clustering de documentos y frases (evaluado en MTEB).
- Reranking de resultados de busqueda (evaluado en MTEB).
- Evaluacion en tareas de STS (Semantic Textual Similarity) en ingles.
- Soporte multilingue: solo ingles declarado.
- No soporta tool calling, agentes, vision ni audio (es un encoder de embeddings, no un modelo generativo).

## Casos de uso

- Busqueda semantica en documentacion financiera: indexar informes, memorias anuales y notas de prensa en ingles y recuperar pasajes relevantes mediante similitud coseno, aprovechando el ajuste declarado sobre pares financieros.
- Deduplicacion de noticias y comunicados: generar embeddings de cada texto y agrupar por distancia para eliminar duplicados en un pipeline de ingesta de datos.
- Clasificacion de tickets o consultas de clientes: usar el embedding como entrada a un clasificador ligero (regresion logistica o SVM) para enrutar consultas financieras a la cola adecuada.
- Reranking en un motor de busqueda: combinar un retriever BM25 con este modelo para reordenar los top-k resultados y mejorar la precision en dominios especializados.
- Clustering de opiniones o resenas: agrupar resenas de productos financieros por tematica para analisis de sentiment a escala.
- Construccion de un indice vectorial para RAG (Retrieval-Augmented Generation): servir como encoder de recuperacion en un sistema RAG en ingles, con despliegue via text-embeddings-inference o sentence-transformers.
- Filtrado de contenido en pipelines de moderacion: comparar embeddings de mensajes contra una lista de referencia para detectar similitud con contenido no deseado.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Tarea (MTEB) | Metrica | Valor |
|---|---|---|
| AmazonCounterfactualClassification (en) | accuracy | 75,21 |
| AmazonCounterfactualClassification (en) | ap | 38,58 |
| AmazonCounterfactualClassification (en) | f1 | 69,36 |
| AmazonPolarityClassification | accuracy | 91,81 |
| AmazonPolarityClassification | ap | 88,65 |
| AmazonPolarityClassification | f1 | 91,80 |
| AmazonReviewsClassification (en) | accuracy | 47,16 |
| AmazonReviewsClassification (en) | f1 | 46,59 |
| ArguAna (Retrieval) | ndcg_at_10 | 48,01 |
| ArguAna (Retrieval) | recall_at_10 | 77,38 |
| ArguAna (Retrieval) | map_at_10 | 38,96 |
| ArxivClusteringP2P | v_measure | 45,69 |
| ArxivClusteringS2S | v_measure | 36,35 |
| AskUbuntuDupQuestions (Reranking) | map | 61,71 |
| AskUbuntuDupQuestions (Reranking) | mrr | 76,06 |
| BIOSSES (STS) | cos_sim_spearman | 84,25 |
| Banking77Classification | accuracy | 84,25 |
| BiorxivClusteringP2P | v_measure | 38,77 |
| BiorxivClusteringS2S | v_measure | 32,94 |
| CQADupstackAndroidRetrieval | map_at_10 | 42,64 |
| CQADupstackAndroidRetrieval | ndcg_at_10 | 47,31 (derivado de mrr_at_10 no disponible) |

Nota: la model card incluye resultados parciales adicionales; los anteriores son los que aparecen completos en la informacion proporcionada. No se dispone de comparacion con otros modelos en los datos facilitados.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,55 GB (136,7 M parametros x 4 bytes), mas overhead de activaciones y tokenizador; en la practica, menos de 1 GB.
- VRAM estimada en FP16: aproximadamente 0,27 GB; en int8: aproximadamente 0,14 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien funciona en CPU para lotes pequenos.
- Cabe en GPU consumer sin problema, incluso en GPUs integradas o en CPU con cuantizacion.
- Opciones de despliegue: sentence-transformers (Python), transformers.js (JavaScript/Node), text-embeddings-inference (TEI) para servir via HTTP, y potencialmente llama.cpp/Ollama si se convierte a GGUF (no confirmado por el autor).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; para un encoder de este tamano se espera un throughput alto en GPU (miles de frases por segundo en lote), pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| allanminn/nomic_qlora_finmodern_pair_merged | 136,7 M | no disponible | apache-2.0 | en | Hugging Face (0 descargas) |
| nomic-ai/nomic-embed-text-v1 | ~137 M | 8192 tokens (segun model card original) | apache-2.0 | en (multilingue en variantes) | Hugging Face, ampliamente usado |
| BAAI/bge-small-en-v1.5 | ~33 M | 512 tokens | MIT | en | Hugging Face, muy usado |
| sentence-transformers/all-MiniLM-L6-v2 | ~22 M | 256 tokens | apache-2.0 | en | Hugging Face, muy usado |

Nota: los datos de los modelos comparables provienen de conocimiento general y no de la informacion proporcionada; se incluyen como referencia orientativa. No se dispone de resultados MTEB comparativos en los datos facilitados.

## Limitaciones y advertencias

- Solo soporta ingles; no se ha validado para castellano ni otros idiomas.
- Los resultados de MTEB estan declarados por el autor y no verificados (`verified: false`); pueden no reproducirse.
- El ajuste se realizo sobre un dataset de pares financieros no documentado; puede haber sobreajuste al dominio y degradacion en textos generales.
- Riesgo de alucinacion no aplica directamente (no es generativo), pero los embeddings pueden producir similitudes espurias en textos fuera de dominio.
- No hay informacion sobre sesgos; al entrenarse sobre datos financieros en ingles, puede heredar sesgos de ese corpus.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Repositorio con 0 descargas y 0 likes: sin validacion externa, sin issues resueltos y sin comunidad que reporte fallos.
- La longitud de contexto no esta documentada; asumir el maximo de Nomic-BERT (probablemente 8192 tokens) sin confirmacion es arriesgado para documentos largos.
- No se proporcionan instrucciones de uso, plantillas de prompt ni recomendaciones de pooling; el usuario debe inferirlas.

## Enlaces

- Hugging Face: https://huggingface.co/allanminn/nomic_qlora_finmodern_pair_merged
- Paper citado en tags: https://arxiv.org/abs/2402.01613
- Paper citado en tags: https://arxiv.org/abs/2205.13147
- Modelo base Nomic-BERT (referencia, no confirmado como base directa): https://huggingface.co/nomic-ai/nomic-bert-2048
- Documentacion de sentence-transformers: https://www.sbert.net/
- Documentacion de text-embeddings-inference: https://github.com/huggingface/text-embeddings-inference
- Benchmark MTEB: https://github.com/embeddings-benchmark/mteb
