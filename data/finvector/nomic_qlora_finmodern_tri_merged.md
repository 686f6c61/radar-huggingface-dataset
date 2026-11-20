# finvector/nomic_qlora_finmodern_tri_merged

## Resumen

`finvector/nomic_qlora_finmodern_tri_merged` es un modelo de embeddings de frases (sentence-transformers) desarrollado por el usuario finvector, construido sobre la arquitectura NomicBert (nomic_bert). No es un modelo generativo: su funcion es transformar texto en vectores densos para tareas de similitud semantica, recuperacion de informacion, clasificacion y clustering. El modelo cuenta con 136.731.648 parametros y un repositorio de 0,3 GB, lo que lo situa en la gama de embeddings ligeros aptos para despliegue en CPU y GPU de consumo.

El nombre del repositorio sugiere un proceso de ajuste fino mediante QLoRA sobre un modelo base Nomic, seguido de una fusion (merge) de pesos, orientado a un dominio que el autor denomina "finmodern". La model card no documenta explicitamente el dataset de entrenamiento ni el procedimiento completo, pero incluye una evaluacion MTEB parcial con resultados declarados por el autor (no verificados) en tareas de clasificacion, recuperacion, clustering, reranking y STS.

El modelo es relevante para quienes necesitan un encoder de texto pequeno, con licencia Apache 2.0 y compatible con el ecosistema `sentence-transformers`, `transformers.js` y `text-embeddings-inference`, para construir sistemas de busqueda semantica o clasificacion en ingles. Su interes practico radica en la licencia permisiva y el bajo coste de inferencia, aunque la ausencia de documentacion sobre el entrenamiento limita su reproducibilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NomicBert (transformer encoder, `nomic_bert`) |
| Parametros totales | 136.731.648 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers, no documentada por el autor) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer de tipo NomicBert, la familia de modelos de embeddings desarrollada por Nomic AI, con atencion bidireccional y entrenamiento orientado a representaciones de frases. El modelo se distribuye a traves de `sentence-transformers`, lo que implica que produce embeddings normalizados utilizables directamente con similitud coseno. El nombre del repositorio indica un ajuste fino con QLoRA (cuantizacion de bajo rango) y una posterior fusion de pesos (merged), practica habitual para combinar adaptadores con el modelo base y facilitar el despliegue.

La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO (no aplicables a un encoder de embeddings). Tampoco se documenta la longitud maxima de secuencia ni la estrategia de pooling. La evaluacion incluida corresponde a un artefacto denominado `epoch_0_model`, lo que sugiere que los resultados se obtuvieron en una fase temprana del ajuste. Cualquier detalle adicional sobre el proceso de entrenamiento debe considerarse no disponible.

## Capacidades

- Generacion de embeddings de frases para similitud semantica y busqueda densa.
- Extraccion de caracteristicas (`feature-extraction`) para clasificacion de texto.
- Recuperacion de informacion (retrieval) en corpus en ingles.
- Clustering de documentos y frases.
- Reranking de pares consulta-documento.
- Evaluacion de similitud textual semantica (STS).
- Compatibilidad con `transformers.js` para inferencia en navegador o Node.js.
- Compatibilidad con `text-embeddings-inference` y endpoints compatibles.
- No soporta generacion de texto, tool calling, agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al ingles segun la metadata del modelo.

## Casos de uso

- Busqueda semantica en documentacion tecnica: indexar manuales y articulos en ingles con embeddings del modelo y recuperar fragmentos relevantes mediante similitud coseno; el tamano reducido permite indexar corpus medianos en una sola GPU.
- Clasificacion de tickets de soporte: usar los embeddings como entrada a un clasificador ligero (regresion logistica o MLP) para categorizar incidencias; los resultados MTEB en Banking77 (84,25 % de accuracy) respaldan su uso en dominios de atencion al cliente.
- Deduplicacion de contenido: calcular similitud entre pares de textos para detectar duplicados o near-duplicates en bases de conocimiento, aprovechando las metricas de STS reportadas (Spearman de 84,25 en BIOSSES).
- Reranking en pipelines de RAG: como segunda etapa tras una recuperacion inicial por BM25, reordenar candidatos con el modelo; los resultados en AskUbuntuDupQuestions (MRR 76,06) indican un comportamiento razonable en reranking.
- Moderacion y analisis de sentimiento: clasificar resenas o comentarios en ingles; los resultados en AmazonPolarity (91,81 % de accuracy) son indicativos para este tipo de tarea.
- Agrupacion de articulos cientificos: clustering de abstracts para organizar bibliotecas de papers; los resultados en ArxivClusteringP2P (v-measure 45,69) ofrecen una referencia del rendimiento esperado.
- Inferencia en el navegador: integracion con `transformers.js` para busqueda semantica local en aplicaciones web sin backend, gracias al tamano de 0,3 GB del repositorio.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Tarea | Dataset MTEB | Metrica | Valor |
|---|---|---|---|
| Clasificacion | AmazonCounterfactualClassification (en) | accuracy | 75,21 |
| Clasificacion | AmazonCounterfactualClassification (en) | f1 | 69,36 |
| Clasificacion | AmazonPolarityClassification | accuracy | 91,81 |
| Clasificacion | AmazonPolarityClassification | f1 | 91,80 |
| Clasificacion | AmazonReviewsClassification (en) | accuracy | 47,16 |
| Clasificacion | Banking77Classification | accuracy | 84,25 |
| Clasificacion | Banking77Classification | f1 | 84,18 |
| Recuperacion | ArguAna | ndcg_at_10 | 48,01 |
| Recuperacion | ArguAna | recall_at_10 | 77,38 |
| Recuperacion | CQADupstackAndroidRetrieval | map_at_10 | 42,64 |
| Recuperacion | CQADupstackAndroidRetrieval | mrr_at_10 | 48,63 |
| Clustering | ArxivClusteringP2P | v_measure | 45,69 |
| Clustering | ArxivClusteringS2S | v_measure | 36,35 |
| Clustering | BiorxivClusteringP2P | v_measure | 38,77 |
| Clustering | BiorxivClusteringS2S | v_measure | 32,94 |
| Reranking | AskUbuntuDupQuestions | map | 61,71 |
| Reranking | AskUbuntuDupQuestions | mrr | 76,06 |
| STS | BIOSSES | cos_sim_spearman | 84,25 |

No se han publicado en la informacion disponible resultados agregados (media MTEB) ni comparaciones directas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,55 GB para los pesos (136,7 M de parametros x 4 bytes), mas overhead de activaciones y tokenizador; en la practica, menos de 1,5 GB.
- En FP16/BF16: aproximadamente 0,27 GB de pesos; cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema. Tambien es viable en CPU para cargas moderadas.
- Cabe en GPU de consumo (GTX 1650, RTX 3050 en adelante) y en entornos integrados con suficiente memoria.
- Opciones de despliegue: `sentence-transformers`, `transformers`, `transformers.js`, `text-embeddings-inference` y endpoints compatibles. No se documenta soporte explicito para vLLM, llama.cpp u Ollama (orientados a modelos generativos).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| finvector/nomic_qlora_finmodern_tri_merged | 136,7 M | no disponible | Apache 2.0 | en | Ajuste QLoRA sobre NomicBert; benchmarks MTEB parciales declarados por el autor |
| nomic-ai/nomic-embed-text-v1.5 | no disponible en esta ficha | no disponible en esta ficha | Apache 2.0 | en (principalmente) | Modelo base de la familia NomicBert; referencia natural, pero sin datos verificados aqui |
| BAAI/bge-small-en-v1.5 | no disponible en esta ficha | no disponible en esta ficha | MIT | en | Embedding ligero ampliamente usado; sin datos comparativos en esta ficha |

No se dispone de datos verificados de rendimiento de los modelos alternativos en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible.

## Limitaciones y advertencias

- Modelo exclusivamente en ingles segun la metadata; no se garantiza rendimiento en castellano u otros idiomas.
- Los resultados de benchmarks son declarados por el autor y estan marcados como no verificados (`verified: false`); deben interpretarse con cautela.
- La model card no documenta el dataset de entrenamiento, la longitud de contexto ni el procedimiento de ajuste, lo que dificulta evaluar sesgos y reproducibilidad.
- Riesgo de sesgos inheritos al corpus de entrenamiento no documentado; no se han publicado analisis de sesgo.
- Al ser un modelo de embeddings, no genera texto y no puede usarse para tareas generativas, tool calling ni agentes.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en dominios distintos a los evaluados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.
- El nombre "finmodern" sugiere un dominio especifico no documentado; el rendimiento fuera de ese dominio es incierto.

## Enlaces

- Hugging Face: https://huggingface.co/finvector/nomic_qlora_finmodern_tri_merged
- Paper de referencia Nomic Embed (arxiv:2402.01613): https://arxiv.org/abs/2402.01613
- Paper de referencia asociado (arxiv:2205.13147): https://arxiv.org/abs/2205.13147
- Documentacion de sentence-transformers: https://www.sbert.net/
- Repositorio de MTEB: https://github.com/embeddings-benchmark/mteb
- Documentacion de text-embeddings-inference: https://github.com/huggingface/text-embeddings-inference
