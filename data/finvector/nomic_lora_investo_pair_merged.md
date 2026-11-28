# finvector/nomic_lora_investo_pair_merged

## Resumen

`finvector/nomic_lora_investo_pair_merged` es un modelo de embeddings de frases (sentence-transformers) publicado por el usuario finvector y construido sobre la arquitectura `nomic_bert`. No es un modelo generativo, sino un encoder de 136.731.648 parámetros (aproximadamente 137 millones) que transforma texto en vectores densos de alta dimensionalidad para tareas de similitud semántica, recuperación de información, clasificación y clustering. Su pipeline declarado en Hugging Face es `sentence-similarity` y los pesos se distribuyen en formato safetensors (0,3 GB de repositorio).

El nombre del repositorio sugiere un ajuste fino mediante LoRA sobre un modelo base de la familia Nomic, seguido de una fusión de pesos (`merged`) para producir un checkpoint estándar. El autor incluye una model card con resultados de evaluación en tareas MTEB (clasificación Amazon, recuperación en ArguAna y CQADupstack, clustering de Arxiv y Biorxiv, reranking en AskUbuntu y STS en BIOSSES), etiquetados como `epoch_0_model`, es decir, el estado del modelo tras la primera época de entrenamiento.

Es relevante ahora porque los modelos de embeddings compactos de ~137M parámetros permiten desplegar búsqueda semántica y RAG en infraestructura modesta, y porque el ecosistema `sentence-transformers` y `text-embeddings-inference` facilita su integración en producción. No obstante, el modelo tiene cero descargas y cero likes en el momento de la ficha, y sus métricas no están verificadas (`verified: false`), lo que obliga a tratar los resultados como declaraciones del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `nomic_bert` (encoder transformer tipo BERT) |
| Parametros totales | 136.731.648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/bf16 segun el checkpoint) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura `nomic_bert`, un encoder transformer bidireccional de la familia BERT adaptado por Nomic AI para generar embeddings de texto. Con 136.731.648 parámetros, se sitúa en el rango de los encoders medianos (comparable a BERT-base, ~110M, o a los modelos de embeddings de ~130M). La salida es un vector denso por secuencia, pensado para similitud coseno y búsqueda por vecino más cercano.

El nombre `nomic_lora_investo_pair_merged` indica que el autor partió de un checkpoint Nomic y aplicó un ajuste fino con LoRA (adaptadores de bajo rango) sobre pares de textos, para después fusionar los pesos del adaptador en el modelo base. La model card no documenta el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO, algo esperable en un encoder de embeddings. Los resultados publicados corresponden a `epoch_0_model`, lo que sugiere que las métricas reflejan el estado tras la primera época y no necesariamente el checkpoint final óptimo.

## Capacidades

- Generación de embeddings de frases y pasajes para similitud semántica.
- Recuperación de información densa (dense retrieval) sobre corpus en inglés.
- Clasificación de texto por similitud con etiquetas o prototipos.
- Clustering de documentos y frases (evaluado en ArxivClusteringP2P/S2S y BiorxivClusteringP2P/S2S).
- Reranking de candidatos recuperados (evaluado en AskUbuntuDupQuestions).
- Evaluación de similitud semántica textual (STS, evaluado en BIOSSES).
- Soporte de `feature-extraction` mediante transformers y transformers.js.
- Compatible con `text-embeddings-inference` y con endpoints de Hugging Face.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento: es un encoder, no un modelo generativo.

## Casos de uso

- Búsqueda semántica en documentación técnica: indexar fragmentos de manuales y recuperar los más relevantes para una consulta en inglés mediante similitud coseno sobre los embeddings generados.
- RAG (retrieval-augmented generation) en pipelines en inglés: usar el modelo como retriever denso que alimenta a un LLM generativo, aprovechando su compatibilidad con `text-embeddings-inference` para servir embeddings a baja latencia.
- Deduplicación de tickets de soporte: agrupar por clustering embeddings de incidencias similares para detectar duplicados y reducir carga manual.
- Moderación y clasificación de reseñas: usar similitud con prototipos de categorías (evaluado en AmazonPolarity y AmazonReviews) para etiquetar sentimiento o temática.
- Reranking en motores de búsqueda internos: reordenar los resultados de una primera fase de recuperación léxica (BM25) usando las puntuaciones de similitud del modelo.
- Análisis de literatura científica: clustering de abstracts de arXiv y bioRxiv para agrupar publicaciones por temática, tal como se evalúa en las tareas MTEB incluidas.
- Detección de similitud entre pares de frases: comparar preguntas de FAQ o pares pregunta-respuesta para enrutar consultas al artículo correcto.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (todos con `verified: false`). Se presentan las métricas principales por tarea MTEB.

| Tarea MTEB | Metrica | Valor |
|---|---|---|
| AmazonCounterfactualClassification (en) | accuracy | 75,21 |
| AmazonCounterfactualClassification (en) | f1 | 69,36 |
| AmazonPolarityClassification | accuracy | 91,81 |
| AmazonPolarityClassification | f1 | 91,80 |
| AmazonReviewsClassification (en) | accuracy | 47,16 |
| AmazonReviewsClassification (en) | f1 | 46,59 |
| ArguAna (retrieval) | ndcg_at_10 | 48,01 |
| ArguAna (retrieval) | recall_at_100 | 98,01 |
| ArguAna (retrieval) | map_at_10 | 38,96 |
| ArxivClusteringP2P | v_measure | 45,69 |
| ArxivClusteringS2S | v_measure | 36,35 |
| AskUbuntuDupQuestions (reranking) | map | 61,71 |
| AskUbuntuDupQuestions (reranking) | mrr | 76,06 |
| BIOSSES (STS) | cos_sim_spearman | 84,25 |
| Banking77Classification | accuracy | 84,25 |
| Banking77Classification | f1 | 84,18 |
| BiorxivClusteringP2P | v_measure | 38,77 |
| BiorxivClusteringS2S | v_measure | 32,94 |
| CQADupstackAndroidRetrieval | ndcg_at_10 | no disponible en el extracto |
| CQADupstackAndroidRetrieval | map_at_10 | 42,64 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos ni la media agregada MTEB.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, ~0,55 GB para pesos (137M × 4 bytes); en fp16/bf16, ~0,27 GB. El consumo real depende del tamaño de lote y de la longitud de secuencia.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para lotes pequeños; RTX 3060, RTX 4090, A100 o H100 para mayor throughput.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: `sentence-transformers`, `transformers`, `text-embeddings-inference`, `transformers.js` (navegador/Node), y endpoints de Hugging Face. No se documenta soporte explícito de vLLM, llama.cpp u Ollama (son para modelos generativos; para embeddings, `text-embeddings-inference` es la vía natural).
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| finvector/nomic_lora_investo_pair_merged | 136,7M | no disponible | apache-2.0 | Encoder de embeddings, solo inglés, métricas MTEB no verificadas |
| nomic-embed-text (familia Nomic) | no disponible en esta ficha | no disponible | no disponible | Modelo base del que parece derivar; requiere consultar su ficha oficial |
| BERT-base (referencia de tamaño) | ~110M | 512 tokens | apache-2.0 | Encoder genérico; no es un modelo de embeddings afinado |
| sentence-transformers/all-MiniLM-L6-v2 (referencia de categoría) | ~22M | 256 tokens | apache-2.0 | Embeddings compactos muy extendidos; comparación de rendimiento no disponible en esta ficha |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Solo soporta inglés (`en`); no se declaran capacidades multilingües.
- Las métricas MTEB están marcadas como `verified: false` y corresponden a `epoch_0_model`, no necesariamente al checkpoint final.
- El modelo tiene cero descargas y cero likes: no hay validación comunitaria ni evidencia de uso en producción.
- No se documenta la longitud máxima de contexto, lo que impide planificar el truncado de documentos largos con precisión.
- Riesgo de sesgos heredados del corpus de entrenamiento del modelo base Nomic y de los pares usados en el ajuste LoRA, no documentados.
- Al ser un encoder de similitud, no genera texto: no debe usarse para tareas generativas ni de razonamiento.
- La licencia apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Nomic del que deriva.
- No hay información sobre el dataset de ajuste, por lo que no se puede evaluar el riesgo de sobreajuste a dominios concretos (posiblemente financiero, dado el nombre del autor `finvector`).

## Enlaces

- Hugging Face: https://huggingface.co/finvector/nomic_lora_investo_pair_merged
- Paper de referencia Nomic (arXiv:2402.01613): https://arxiv.org/abs/2402.01613
- Paper de referencia Sentence-BERT (arXiv:2205.13147): https://arxiv.org/abs/2205.13147
- MTEB (Massive Text Embedding Benchmark): https://huggingface.co/spaces/mteb/leaderboard
- Documentación de sentence-transformers: https://www.sbert.net/
- Documentación de text-embeddings-inference: https://github.com/huggingface/text-embeddings-inference
