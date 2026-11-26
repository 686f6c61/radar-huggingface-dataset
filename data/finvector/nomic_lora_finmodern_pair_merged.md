# finvector/nomic_lora_finmodern_pair_merged

## Resumen

`finvector/nomic_lora_finmodern_pair_merged` es un modelo de embeddings de frases (sentence transformer) publicado por el usuario finvector en Hugging Face. Se construye sobre la arquitectura Nomic BERT y está pensado para tareas de extracción de características, similitud semántica y recuperación de información. El nombre sugiere un ajuste fino mediante LoRA sobre un modelo base de la familia Nomic, seguido de una fusión de pesos (merged), orientado a pares de frases en el dominio financiero moderno.

El modelo cuenta con 136.731.648 parámetros y un repositorio de 0,3 GB, lo que lo sitúa en la gama de embeddings compactos aptos para despliegue en CPU y GPU de consumo. Está etiquetado para su uso con sentence-transformers, transformers y transformers.js, y declara compatibilidad con text-embeddings-inference y endpoints. La licencia es Apache 2.0, lo que facilita su uso comercial.

Su relevancia radica en que ofrece una alternativa especializada para tareas de clasificación, clustering, reranking y recuperación evaluadas en el benchmark MTEB, con resultados declarados por el autor en la model card. No obstante, el modelo tiene cero descargas y cero likes en el momento de la consulta, y solo declara soporte para inglés, lo que limita su adopción en entornos multilingües.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Nomic BERT (transformer encoder) |
| Parámetros totales | 136.731.648 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Nomic BERT, un encoder transformer de tipo BERT adaptado por Nomic AI para generar embeddings de texto. El identificador incluye los términos "lora" y "merged", lo que indica que se aplicó un ajuste fino con Low-Rank Adaptation (LoRA) sobre un modelo base y posteriormente se fusionaron los pesos del adaptador en el modelo principal para obtener un checkpoint único listo para inferencia. El sufijo "finmodern_pair" sugiere un entrenamiento orientado a pares de frases en un dominio financiero moderno, aunque la model card no detalla la composición del dataset ni el número de tokens de entrenamiento.

No se dispone de información sobre el proceso de entrenamiento (número de pasos, tamaño de lote, función de pérdida concreta, uso de hard negatives o técnicas de minería de negativos). La model card únicamente incluye los resultados de evaluación en MTEB bajo el nombre "epoch_0_model", lo que sugiere que los resultados corresponden a la primera época de un proceso de ajuste. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal, ya que se trata de un modelo encoder para embeddings y no de un modelo generativo.

## Capacidades

- Generación de embeddings de frases para similitud semántica y recuperación de información.
- Extracción de características (feature-extraction) a partir de texto en inglés.
- Clasificación de textos (evaluada en MTEB en dominios como Amazon Counterfactual, Amazon Polarity, Amazon Reviews y Banking77).
- Clustering de documentos y frases (evaluado en ArxivClusteringP2P, ArxivClusteringS2S, BiorxivClusteringP2P y BiorxivClusteringS2S).
- Reranking de resultados de búsqueda (evaluado en AskUbuntuDupQuestions).
- Evaluación en tareas de STS (BIOSSES) y recuperación (ArguAna, CQADupstackAndroid).
- Compatibilidad con sentence-transformers, transformers, transformers.js y text-embeddings-inference.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking, ya que no es un modelo generativo.

## Casos de uso

- Búsqueda semántica en documentación financiera: el modelo puede indexar y recuperar fragmentos de informes, memorandos o notas internas en inglés mediante similitud de embeddings, aprovechando su entrenamiento orientado a pares de frases del dominio financiero.
- Deduplicación de registros y noticias: gracias a sus capacidades de clustering y similitud, permite agrupar titulares o descripciones duplicadas en pipelines de ingesta de datos.
- Clasificación de tickets o consultas bancarias: con resultados declarados de 84,25 % de accuracy en Banking77, puede utilizarse como clasificador de intenciones en atención al cliente financiera en inglés.
- Reranking en motores de búsqueda internos: puede reordenar los resultados de un retriever inicial (por ejemplo, BM25) usando similitud semántica, con un MAP declarado de 61,71 en AskUbuntuDupQuestions.
- Análisis de sentimiento y polaridad en reseñas: con 91,81 % de accuracy en AmazonPolarity, es adecuado para monitorizar opiniones de productos o servicios en inglés.
- Detección de contraargumentos y análisis de discurso: con 75,21 % de accuracy en AmazonCounterfactual, puede emplearse en tareas de moderación o análisis de contenido que requieran distinguir afirmaciones contrafactuales.
- Construcción de bases vectoriales para asistentes RAG: al ser compatible con text-embeddings-inference y transformers.js, puede desplegarse como servicio de embeddings en arquitecturas de generación aumentada por recuperación en inglés.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Classification | MTEB AmazonCounterfactualClassification (en) | accuracy | 75,21 |
| Classification | MTEB AmazonCounterfactualClassification (en) | ap | 38,58 |
| Classification | MTEB AmazonCounterfactualClassification (en) | f1 | 69,36 |
| Classification | MTEB AmazonPolarityClassification | accuracy | 91,81 |
| Classification | MTEB AmazonPolarityClassification | ap | 88,65 |
| Classification | MTEB AmazonPolarityClassification | f1 | 91,80 |
| Classification | MTEB AmazonReviewsClassification (en) | accuracy | 47,16 |
| Classification | MTEB AmazonReviewsClassification (en) | f1 | 46,59 |
| Classification | MTEB Banking77Classification | accuracy | 84,25 |
| Classification | MTEB Banking77Classification | f1 | 84,18 |
| Retrieval | MTEB ArguAna | map_at_1 | 24,25 |
| Retrieval | MTEB ArguAna | map_at_10 | 38,96 |
| Retrieval | MTEB ArguAna | ndcg_at_10 | 48,01 |
| Retrieval | MTEB ArguAna | recall_at_10 | 77,38 |
| Retrieval | MTEB CQADupstackAndroidRetrieval | map_at_10 | 42,64 |
| Retrieval | MTEB CQADupstackAndroidRetrieval | mrr_at_10 | 48,63 |
| Clustering | MTEB ArxivClusteringP2P | v_measure | 45,69 |
| Clustering | MTEB ArxivClusteringS2S | v_measure | 36,35 |
| Clustering | MTEB BiorxivClusteringP2P | v_measure | 38,77 |
| Clustering | MTEB BiorxivClusteringS2S | v_measure | 32,94 |
| Reranking | MTEB AskUbuntuDupQuestions | map | 61,71 |
| Reranking | MTEB AskUbuntuDupQuestions | mrr | 76,06 |
| STS | MTEB BIOSSES | cos_sim_spearman | 84,25 |
| STS | MTEB BIOSSES | cos_sim_pearson | 86,74 |

No se han publicado en la información disponible resultados comparativos con otros modelos ni puntuaciones agregadas (por ejemplo, la media MTEB).

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 136,7 millones de parámetros, en FP32 requiere aproximadamente 0,55 GB solo para los pesos; en FP16 unos 0,27 GB; en INT8 unos 0,14 GB. El consumo real dependerá del tamaño de lote y de la longitud de las secuencias.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para lotes pequeños; para alto throughput se recomiendan A100, H100, L4 o RTX 4090.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o incluso en iGPU con suficiente memoria compartida, dado su reducido tamaño.
- Opciones de despliegue: sentence-transformers, transformers, transformers.js, text-embeddings-inference, y servidores de embeddings compatibles con endpoints. No se documenta soporte explícito para vLLM, llama.cpp u Ollama, que están orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| finvector/nomic_lora_finmodern_pair_merged | 136,7 M | no disponible | en | Apache 2.0 | Hugging Face |
| nomic-ai/nomic-embed-text-v1 | no disponible | no disponible | en | Apache 2.0 | Hugging Face |
| BAAI/bge-base-en-v1.5 | no disponible | no disponible | en | MIT | Hugging Face |
| sentence-transformers/all-MiniLM-L6-v2 | no disponible | no disponible | en | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativos en la información proporcionada para establecer una comparación cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Solo soporta inglés; no se declaran capacidades multilingües.
- Los resultados de benchmarks están marcados como no verificados (`verified: false`) y proceden únicamente del autor.
- El modelo tiene cero descargas y cero likes, lo que implica ausencia de validación por parte de la comunidad.
- No se documenta la longitud máxima de contexto, lo que impide conocer el límite de tokens por secuencia.
- No se detalla la composición del dataset de entrenamiento ni posibles sesgos heredados del corpus financiero utilizado.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí riesgo de similitudes espurias en dominios alejados del entrenamiento.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo base subyacente (Nomic BERT) puede tener condiciones adicionales que conviene revisar.
- No se declaran mecanismos de mitigación de sesgos ni evaluaciones de robustez fuera de MTEB.
- El nombre "epoch_0_model" sugiere que los resultados corresponden a una fase temprana de entrenamiento, lo que podría indicar un modelo no completamente convergido.

## Enlaces

- Hugging Face: https://huggingface.co/finvector/nomic_lora_finmodern_pair_merged
- Paper de Nomic BERT (referencia en tags): https://arxiv.org/abs/2402.01613
- Paper de Sentence-BERT (referencia en tags): https://arxiv.org/abs/2205.13147
