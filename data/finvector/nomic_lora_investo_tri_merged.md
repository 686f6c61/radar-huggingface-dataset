# finvector/nomic_lora_investo_tri_merged

## Resumen

`finvector/nomic_lora_investo_tri_merged` es un modelo de embeddings de frases (sentence transformer) publicado por el usuario finvector en Hugging Face. Se trata de un fine-tuning mediante LoRA del modelo base Nomic Embed (`nomic_bert`), que posteriormente se ha fusionado en los pesos finales, de ahí el sufijo `_merged` en el identificador. El modelo está pensado para tareas de similitud semántica, extracción de características y clasificación de texto, y se distribuye con la librería `sentence-transformers`.

El modelo cuenta con 136.731.648 parámetros totales (aproximadamente 137 millones), lo que lo sitúa en la categoría de encoders BERT de tamano medio, adecuados para despliegue en producción con requisitos de hardware moderados. El repositorio ocupa 0,3 GB en formato safetensors. La model card declara resultados en múltiples tareas del benchmark MTEB (clasificación, recuperación, clustering, reranking y STS), lo que permite evaluar su rendimiento de forma objetiva.

La relevancia de este modelo radica en su especialización: al ser un fine-tuning de Nomic Embed sobre un corpus concreto (presumiblemente del dominio de "investo", según el nombre), puede ofrecer mejoras en tareas específicas frente al modelo base, manteniendo la licencia permisiva Apache 2.0 y la compatibilidad con el ecosistema de sentence-transformers y text-embeddings-inference.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (nomic_bert, basado en BERT) |
| Parametros totales | 136.731.648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura `nomic_bert`, un transformer encoder de tipo BERT con 137 millones de parámetros. El proceso de entrenamiento consistió en un fine-tuning mediante LoRA (Low-Rank Adaptation) sobre el modelo base Nomic Embed, seguido de una fusión de los pesos adaptados en el modelo final. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO, algo esperable en un modelo de embeddings.

La innovación técnica principal es el uso de LoRA para adaptar un modelo de embeddings ya entrenado a un dominio específico sin necesidad de reentrenar todos los parámetros, lo que reduce considerablemente el coste computacional del fine-tuning. La fusión posterior permite desplegar el modelo como un sentence transformer estándar, sin dependencias adicionales de adaptadores. No se dispone de información sobre la longitud máxima de secuencia soportada ni sobre técnicas de atención lineal o decodificación especulativa, que no aplican a este tipo de encoder.

## Capacidades

- Generación de embeddings de frases y documentos para tareas de similitud semántica.
- Extracción de características (feature extraction) a nivel de token y de secuencia.
- Clasificación de texto (sentiment analysis, clasificación de reseñas, detección de contraargumentos).
- Recuperación de información (retrieval) en corpus como ArguAna y CQADupstack.
- Clustering de documentos y frases (ArxivClustering, BiorxivClustering).
- Reranking de resultados de búsqueda (AskUbuntuDupQuestions).
- Evaluación de similitud textual semántica (STS) en el dataset BIOSSES.
- Compatibilidad con `transformers.js` para inferencia en el navegador.
- Soporte para `text-embeddings-inference` y endpoints compatibles.
- Capacidades multilingües limitadas: solo se declara inglés (`en`).

## Casos de uso

- Búsqueda semántica en documentación técnica: el modelo puede indexar fragmentos de documentación y recuperar los más relevantes para una consulta en lenguaje natural, usando los embeddings para calcular similitud coseno. Es adecuado por su rendimiento en tareas de retrieval como ArguAna (recall@10 de 77,38).
- Clasificación de reseñas de productos: con una accuracy de 91,81 en AmazonPolarity, el modelo puede integrarse en pipelines de moderación o análisis de sentimiento para clasificar automáticamente reseñas positivas y negativas.
- Detección de duplicados y near-duplicates: el modelo puede generar embeddings de preguntas o documentos y agruparlos por similitud, útil en foros o sistemas de tickets. El resultado en AskUbuntuDupQuestions (MAP de 61,71) respalda esta aplicación.
- Clustering de artículos científicos: con un v-measure de 45,69 en ArxivClusteringP2P, el modelo permite agrupar publicaciones por temática para sistemas de recomendación o análisis bibliométrico.
- Reranking en motores de búsqueda: tras una primera fase de recuperación con BM25, el modelo puede reordenar los resultados según relevancia semántica, mejorando la precisión en dominios especializados.
- Análisis de similitud en textos biomédicos: el resultado en BIOSSES (Spearman de 84,25) indica que el modelo es útil para comparar pares de frases clínicas o científicas, por ejemplo en sistemas de preguntas y respuestas médicas.
- Deduplicación de contenido en plataformas de noticias: el modelo puede comparar titulares y resúmenes para detectar artículos repetidos o muy similares, reduciendo la redundancia en agregadores.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (MTEB):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Clasificación | AmazonCounterfactualClassification (en) | accuracy | 75,21 |
| Clasificación | AmazonCounterfactualClassification (en) | ap | 38,58 |
| Clasificación | AmazonCounterfactualClassification (en) | f1 | 69,36 |
| Clasificación | AmazonPolarityClassification | accuracy | 91,81 |
| Clasificación | AmazonPolarityClassification | ap | 88,65 |
| Clasificación | AmazonPolarityClassification | f1 | 91,80 |
| Clasificación | AmazonReviewsClassification (en) | accuracy | 47,16 |
| Clasificación | AmazonReviewsClassification (en) | f1 | 46,59 |
| Clasificación | Banking77Classification | accuracy | 84,25 |
| Clasificación | Banking77Classification | f1 | 84,18 |
| Retrieval | ArguAna | map_at_10 | 38,96 |
| Retrieval | ArguAna | ndcg_at_10 | 48,01 |
| Retrieval | ArguAna | recall_at_10 | 77,38 |
| Retrieval | CQADupstackAndroidRetrieval | map_at_10 | 42,64 |
| Retrieval | CQADupstackAndroidRetrieval | mrr_at_10 | 48,63 |
| Clustering | ArxivClusteringP2P | v_measure | 45,69 |
| Clustering | ArxivClusteringS2S | v_measure | 36,35 |
| Clustering | BiorxivClusteringP2P | v_measure | 38,77 |
| Clustering | BiorxivClusteringS2S | v_measure | 32,94 |
| Reranking | AskUbuntuDupQuestions | map | 61,71 |
| Reranking | AskUbuntuDupQuestions | mrr | 76,06 |
| STS | BIOSSES | cos_sim_spearman | 84,25 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en FP16 (137 M de parámetros × 2 bytes), y alrededor de 0,3 GB en cuantización de 8 bits.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior puede ejecutar el modelo con holgura. Para despliegue en servidor, una T4 o A10 es más que suficiente.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU para cargas moderadas.
- Opciones de despliegue: sentence-transformers, text-embeddings-inference (TEI), transformers.js para navegador, y cualquier runtime compatible con safetensors y la arquitectura `nomic_bert`.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Formato |
|---|---|---|---|---|---|
| finvector/nomic_lora_investo_tri_merged | 136,7 M | no disponible | apache-2.0 | en | safetensors |
| nomic-ai/nomic-embed-text-v1 | 137 M | 8192 | apache-2.0 | en | safetensors |
| BAAI/bge-small-en-v1.5 | 33 M | 512 | mit | en | safetensors, GGUF |
| sentence-transformers/all-MiniLM-L6-v2 | 22,7 M | 256 | apache-2.0 | en | safetensors, GGUF |

El modelo aquí descrito comparte tamano y arquitectura con Nomic Embed v1, del que deriva mediante LoRA. Frente a alternativas más ligeras como all-MiniLM-L6-v2 o bge-small-en-v1.5, ofrece un mayor número de parámetros y, presumiblemente, mejor capacidad de representación, a costa de un mayor coste computacional. No se dispone de datos comparativos directos de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo declara soporte para inglés (`en`); su rendimiento en castellano u otros idiomas no está garantizado.
- No se especifica la longitud máxima de contexto soportada, lo que impide asegurar su comportamiento en documentos largos.
- Al ser un fine-tuning sobre un dominio concreto ("investo"), puede presentar degradación en tareas generales fuera de ese dominio en comparación con el modelo base.
- No se han publicado datos sobre sesgos, toxicidad o robustez frente a entradas adversarias.
- Riesgo de alucinación no aplica directamente (no es un modelo generativo), pero los embeddings pueden producir similitudes engañosas en textos ambiguos o con vocabulario muy especializado.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, lo que indica que no ha sido validado por la comunidad.
- No se dispone de información sobre el dataset de entrenamiento, lo que dificulta evaluar su sesgo y cobertura.

## Enlaces

- [Hugging Face: finvector/nomic_lora_investo_tri_merged](https://huggingface.co/finvector/nomic_lora_investo_tri_merged)
- [Paper Nomic Embed (arXiv:2402.01613)](https://arxiv.org/abs/2402.01613)
- [Paper Sentence-BERT (arXiv:2205.13147)](https://arxiv.org/abs/2205.13147)
- [Repositorio Nomic Embed](https://github.com/nomic-ai/nomic-embed)
- [Documentación de sentence-transformers](https://www.sbert.net/)
