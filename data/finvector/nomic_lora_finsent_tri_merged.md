# finvector/nomic_lora_finsent_tri_merged

## Resumen

`finvector/nomic_lora_finsent_tri_merged` es un modelo de embeddings de frases (sentence transformer) derivado de la arquitectura Nomic-BERT, publicado por el usuario finvector en Hugging Face. Se distribuye con la etiqueta de pipeline `sentence-similarity` y está pensado para tareas de extracción de características y similitud semántica, con evaluación declarada sobre el benchmark MTEB. El modelo cuenta con 136.731.648 parámetros totales y un repositorio de 0,3 GB en formato safetensors.

El nombre sugiere un proceso de ajuste fino mediante LoRA sobre un modelo base Nomic y una posterior fusión de pesos ("merged"), orientada a tareas de similitud de frases ("finsent") con entrenamiento de tripletas ("tri"). No obstante, la model card no documenta explícitamente el procedimiento de entrenamiento, los datos utilizados ni la receta de fusión, por lo que estos detalles deben considerarse no disponibles.

Su relevancia es limitada en el momento de la publicación: el repositorio registra cero descargas y cero "likes", y la model card se limita prácticamente a volcar los resultados de MTEB sin explicación adicional. Resulta útil como referencia de evaluación de un embedding compacto de ~137 M de parámetros sobre tareas MTEB en inglés, pero no hay evidencia publicada de validación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nomic-BERT (transformer encoder, tag `nomic_bert`) |
| Parametros totales | 136.731.648 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a Nomic-BERT, un encoder transformer de tipo BERT utilizado habitualmente para generar embeddings de texto. El repositorio declara la etiqueta `nomic_bert` y requiere `custom_code`, lo que implica que la carga del modelo necesita confiar en código remoto (`trust_remote_code=True`) o disponer de la implementación específica de Nomic. El tamaño de 136,7 M de parámetros es coherente con un encoder de escala BERT-base.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO (poco habitual en modelos de embeddings) ni innovaciones técnicas como decodificación especulativa o atención lineal. El nombre del modelo apunta a un ajuste con LoRA sobre un modelo base Nomic y una fusión posterior de adaptadores, pero la model card no describe el procedimiento, los hiperparámetros ni la naturaleza de los datos de ajuste. Los resultados de MTEB se declaran bajo el nombre de checkpoint `epoch_0_model`, lo que sugiere una evaluación temprana del entrenamiento, aunque no se detalla.

## Capacidades

- Generación de embeddings de frases para similitud semántica y recuperación de información.
- Extracción de características (`feature-extraction`) a partir de texto en inglés.
- Clasificación de texto por similitud (evaluada en MTEB sobre AmazonCounterfactual, AmazonPolarity, AmazonReviews y Banking77).
- Clustering de documentos y frases (evaluado en ArxivClusteringP2P/S2S y BiorxivClusteringP2P/S2S).
- Reranking de candidatos (evaluado en AskUbuntuDupQuestions).
- Recuperación de pasajes (evaluado en ArguAna y CQADupstackAndroidRetrieval).
- Evaluación de similitud semántica STS (evaluado en BIOSSES).
- Compatible con `sentence-transformers`, `transformers`, `transformers.js` y `text-embeddings-inference`.
- No soporta tool calling, agentes, visión, audio ni modos de razonamiento explícito: es un encoder de embeddings, no un modelo generativo.

## Casos de uso

- Búsqueda semántica en inglés: indexar un corpus y generar embeddings de consultas con este modelo para recuperar pasajes relevantes mediante similitud coseno; los resultados de ArguAna (recall@10 de 77,38) y CQADupstackAndroidRetrieval (MAP@10 de 42,64) indican un rendimiento razonable en recuperación.
- Deduplicación de documentos y preguntas: usar los embeddings para detectar pares casi duplicados; el resultado en AskUbuntuDupQuestions (MAP de 61,71) es directamente aplicable a este escenario.
- Clasificación de tickets y reseñas por similitud a prototipos: el modelo obtiene 84,25 de accuracy en Banking77, lo que permite clasificar consultas bancarias en 77 categorías mediante vecinos más cercanos o un clasificador ligero sobre embeddings.
- Análisis de sentimiento y polaridad en reseñas: con 91,81 de accuracy en AmazonPolarity, es utilizable como extractor de características para un clasificador de polaridad en dominios de opinión similares.
- Agrupamiento temático de publicaciones científicas: los resultados en ArxivClusteringP2P (V-measure de 45,69) y BiorxivClusteringP2P (38,77) lo hacen adecuado para organizar corpus de preprints por temática.
- Reranking en pipelines de RAG: colocado como segunda etapa tras un retriever rápido, puede reordenar candidatos; su tamaño de 137 M permite ejecutarlo en CPU o GPU modesta con latencia baja.
- Similitud semántica en dominios biomédicos: el resultado en BIOSSES (Spearman de 84,25) sugiere utilidad para comparar pares de frases biomédicas, aunque con cautela por el dominio limitado de la evaluación.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (checkpoint `epoch_0_model`, no verificados):

| Tarea | Dataset MTEB | Métrica | Valor |
|---|---|---|---|
| Classification | AmazonCounterfactualClassification (en) | accuracy | 75,21 |
| Classification | AmazonCounterfactualClassification (en) | f1 | 69,36 |
| Classification | AmazonPolarityClassification | accuracy | 91,81 |
| Classification | AmazonReviewsClassification (en) | accuracy | 47,16 |
| Classification | Banking77Classification | accuracy | 84,25 |
| Clustering | ArxivClusteringP2P | v_measure | 45,69 |
| Clustering | ArxivClusteringS2S | v_measure | 36,35 |
| Clustering | BiorxivClusteringP2P | v_measure | 38,77 |
| Clustering | BiorxivClusteringS2S | v_measure | 32,94 |
| Reranking | AskUbuntuDupQuestions | map | 61,71 |
| Reranking | AskUbuntuDupQuestions | mrr | 76,06 |
| Retrieval | ArguAna | ndcg_at_10 | 48,01 |
| Retrieval | ArguAna | recall_at_10 | 77,38 |
| Retrieval | CQADupstackAndroidRetrieval | map_at_10 | 42,64 |
| STS | BIOSSES | cos_sim_spearman | 84,25 |

No se han publicado en la información disponible resultados agregados (media MTEB) ni comparaciones con otros modelos por parte del autor.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,55 GB solo para pesos (136,7 M × 4 bytes), más memoria de activaciones y del tokenizador; en la práctica, menos de 2 GB para lotes pequeños.
- En fp16/bf16: aproximadamente 0,27 GB de pesos; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM (GTX 1650, RTX 3060, RTX 4090, T4, L4); también viable en CPU para volúmenes moderados.
- Despliegue: `sentence-transformers`, `transformers` (con `trust_remote_code=True` por la etiqueta `custom_code`), `transformers.js` para navegador, y `text-embeddings-inference` (el repositorio está marcado como `endpoints_compatible`). No se documenta soporte específico para vLLM, llama.cpp u Ollama, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| finvector/nomic_lora_finsent_tri_merged | 136,7 M | no disponible | apache-2.0 | Hugging Face, 0 descargas |
| nomic-embed-text-v1 (modelo base de referencia) | ~137 M | hasta 8192 tokens (según documentación pública de Nomic) | apache-2.0 | Hugging Face, ampliamente adoptado |
| all-MiniLM-L6-v2 (referencia compacta de sentence-transformers) | ~22 M | 256 tokens (según documentación pública) | apache-2.0 | Hugging Face, ampliamente adoptado |

La comparación cuantitativa con estos modelos no está disponible en la información proporcionada; no se han publicado resultados agregados de MTEB para este checkpoint que permitan situarlo frente a alternativas.

## Limitaciones y advertencias

- Modelo entrenado y evaluado únicamente en inglés; no se declara soporte multilingüe.
- La model card no documenta datos de entrenamiento, sesgos conocidos ni proceso de filtrado, por lo que el riesgo de sesgos heredados del corpus base es desconocido.
- Los resultados de MTEB son declarados por el autor, no verificados (`verified: false`) y corresponden al checkpoint `epoch_0_model`, lo que sugiere una evaluación temprana y posiblemente no representativa del modelo final.
- Cero descargas y cero interacciones en el momento de la consulta: no hay evidencia de uso en producción ni validación independiente.
- Requiere `custom_code` (etiqueta `nomic_bert`), lo que implica ejecutar código remoto al cargar el modelo; conviene auditar o fijar una revisión concreta.
- No es un modelo generativo: no admite tool calling, agentes, razonamiento multi-paso ni generación de texto.
- La licencia apache-2.0 permite uso comercial, pero al derivar de un modelo Nomic conviene revisar las condiciones del modelo base original antes de desplegarlo.
- No se documenta la longitud máxima de contexto soportada, lo que dificulta planificar su uso en documentos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/finvector/nomic_lora_finsent_tri_merged
- Paper de referencia citado (arXiv:2402.01613): https://arxiv.org/abs/2402.01613
- Paper de referencia citado (arXiv:2205.13147): https://arxiv.org/abs/2205.13147
- Benchmark MTEB: https://huggingface.co/spaces/mteb/leaderboard
