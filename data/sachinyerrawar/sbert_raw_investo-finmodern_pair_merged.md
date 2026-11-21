# sachinyerrawar/sbert_raw_investo-finmodern_pair_merged

## Resumen

sbert_raw_investo-finmodern_pair_merged es un modelo de embeddings de frases (sentence-transformers) publicado por el usuario sachinyerrawar en Hugging Face. Se trata de un ajuste fino (fine-tuning) del checkpoint sentence-transformers/bert-base-nli-mean-tokens orientado al dominio financiero, cuyo objetivo es producir representaciones vectoriales densas que permitan calcular similitud semántica y recuperación de información sobre textos de temática financiera y de inversión.

El modelo parte de una arquitectura BERT base (12 capas, 768 dimensiones ocultas, ~110 millones de parámetros) y se ha entrenado sobre el dataset FinLang/investopedia-embedding-dataset, derivado de contenido de Investopedia. El sufijo "pair_merged" indica que los pesos proceden de la fusión de un entrenamiento con pares (pares pregunta-respuesta o ancla-positivo) y que el resultado final es un único checkpoint listo para inferencia con la librería sentence-transformers.

Su relevancia radica en que coloca un encoder ligero y desplegable en CPU dentro del nicho de la búsqueda semántica financiera, un ámbito donde los modelos generalistas tienden a confundir terminología especializada (spreads, market makers, productos de renta fija). Con licencia Apache 2.0 y un tamaño de repo de 0,4 GB, es un candidato razonable para sistemas RAG sobre documentación financiera, siempre que se acepten sus limitaciones (solo inglés y un conjunto de evaluación privado definido por el autor).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT base (12 capas, 768 hidden, 12 cabezas de atención), pooling por media de tokens (mean pooling) |
| Parametros totales | 109.482.240 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (límite estándar de BERT base; no especificado de forma explícita en la model card) |
| Tipos de cuantizacion | No disponible en la model card; el formato safetensors permite cuantización posterior a FP16/INT8/INT4 con herramientas externas |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con sentence-transformers) |

## Arquitectura y entrenamiento

El modelo es un BERT base estándar (Devlin et al., 2019) utilizado como encoder de frases con pooling por media de tokens, siguiendo la metodología de Sentence-BERT (Reimers y Gurevych, 2019). No incorpora mecanismos de atención lineal ni decodificación especulativa: es un encoder bidireccional puro cuya salida es un vector de 768 dimensiones por frase, normalizado para similitud coseno.

El entrenamiento parte de sentence-transformers/bert-base-nli-mean-tokens y se ajusta con la pérdida CachedMultipleNegativesRankingLoss, una variante de contrastive learning que aprovecha pares positivos y negativos in-batch de forma eficiente en memoria. Los tags de la model card indican dos conjuntos de datos con tamaños de 144.521 y 44.709 pares, respectivamente, ambos derivados de FinLang/investopedia-embedding-dataset. El sufijo "pair_merged" sugiere que el checkpoint publicado agrega o fusiona los pesos de varias ejecuciones de entrenamiento sobre pares. No se documentan fases de RLHF ni DPO, algo esperable en un modelo de embeddings.

## Capacidades

- Generación de embeddings de frases y pasajes para similitud semántica y recuperación de información (pipeline sentence-similarity).
- Extracción de características (feature-extraction) para clasificación, clustering y deduplicación semántica de textos financieros.
- Búsqueda semántica sobre corpus de Investopedia y documentación financiera en inglés.
- Ranking de candidatos mediante similitud coseno (accuracy@k, MRR, MAP).
- Funciona como retriever en pipelines RAG: dado un query, devuelve los pasajes más relevantes por producto escalar o coseno.
- Soporte multilingüe limitado: únicamente inglés.
- No dispone de tool calling, function calling, modo thinking, visión ni audio: es un encoder, no un modelo generativo.

## Casos de uso

- Búsqueda semántica sobre bases de conocimiento financiero: indexar artículos de Investopedia y glosarios, generar embeddings con este modelo y servir consultas en lenguaje natural mediante un índice vectorial (FAISS, Qdrant, pgvector). Adecuado por su dominio específico y bajo coste de inferencia.
- RAG para asistentes de inversión: usar el modelo como retriever en un pipeline donde un LLM generativo responde a preguntas sobre conceptos financieros, alimentado con los pasajes recuperados por este encoder. La ventana de 512 tokens obliga a fragmentar documentos en chunks cortos.
- Deduplicación de contenido editorial: detectar artículos o FAQs duplicados o casi duplicados en un CMS financiero calculando similitud coseno entre embeddings, con umbral calibrado sobre el conjunto de validación del autor.
- Clasificación y clustering de consultas de soporte: agrupar tickets de clientes de banca o brokers por temática (mercados, fiscalidad, productos) usando embeddings y k-means, para enrutar al equipo adecuado.
- Motor de preguntas frecuentes: mapear preguntas de usuarios a respuestas canónicas preexistentes por similitud semántica, evitando coincidencia literal de palabras clave.
- Evaluación de relevancia en motores de búsqueda internos: usar el modelo como reranker ligero de segundo nivel sobre los resultados de un BM25, combinando recuperación léxica y semántica.
- Filtrado de pares pregunta-respuesta para datasets de instrucciones: seleccionar pares con alta similitud semántica para construir conjuntos de entrenamiento de calidad en el dominio financiero.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (model-index), sobre un conjunto de validación privado denominado "investo val". No están verificados de forma independiente.

| Métrica | Valor |
|---|---|
| Cosine Accuracy@1 | 0,869 |
| Cosine Accuracy@3 | 0,924 |
| Cosine Accuracy@5 | 0,939 |
| Cosine Accuracy@10 | 0,9605 |
| Cosine Precision@1 | 0,869 |
| Cosine Precision@3 | 0,308 |
| Cosine Precision@5 | 0,1878 |
| Cosine Precision@10 | 0,09605 |
| Cosine Recall@1 | 0,869 |
| Cosine Recall@3 | 0,924 |
| Cosine Recall@5 | 0,939 |
| Cosine Recall@10 | 0,9605 |
| Cosine NDCG@10 | 0,9152 |
| Cosine MRR@10 | 0,9006 |
| Cosine MAP@100 | 0,9024 |

No se han publicado resultados comparativos con otros modelos de embeddings en la información disponible.

## Requisitos de hardware

- VRAM para inferencia en FP32: aproximadamente 0,45 GB para los pesos (109,5 M parámetros × 4 bytes), más activaciones; en la práctica cabe en cualquier GPU con 2 GB o más.
- VRAM en FP16: aproximadamente 0,22 GB de pesos; en INT8 alrededor de 0,11 GB.
- GPU recomendadas: cualquier GPU moderna, incluso de gama baja (RTX 3060, T4, L4) resulta suficiente; A100/H100 solo aportan valor por throughput en lotes grandes.
- Cabe sobradamente en GPU de consumo: RTX 4090, RTX 3080, RTX 2060 o incluso iGPU con suficiente memoria compartida.
- Despliegue: sentence-transformers (nativo), Text Embeddings Inference (TEI, etiqueta text-embeddings-inference presente), vLLM no aplica (no es generativo), ONNX Runtime y llama.cpp no son la vía natural para BERT de embeddings; FastEmbed y Optimum son alternativas viables.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera un throughput alto en GPU (miles de frases por segundo en lote) y decenas de frases por segundo en CPU, pero estos valores son estimaciones cualitativas no verificadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sbert_raw_investo-finmodern_pair_merged | 109,5 M | 512 tokens | Financiero (inglés) | Apache 2.0 | Hugging Face |
| sentence-transformers/all-MiniLM-L6-v2 | ~22,7 M | 256 tokens | Generalista | Apache 2.0 | Hugging Face |
| sentence-transformers/bert-base-nli-mean-tokens | ~109 M | 512 tokens | Generalista (NLI) | Apache 2.0 | Hugging Face |
| BAAI/bge-base-en-v1.5 | ~109 M | 512 tokens | Generalista (inglés) | MIT | Hugging Face |

No se dispone de resultados de benchmarks comparativos directos entre estos modelos en la información proporcionada; la comparación se limita a parámetros, contexto y licencia. Los modelos generalistas citados son alternativas habituales cuando no se requiere especialización financiera, pero no se ha verificado su rendimiento en el conjunto "investo val".

## Limitaciones y advertencias

- Solo inglés: no se ha entrenado ni evaluado en castellano ni en otros idiomas; su uso en producción multilingüe requeriría un modelo distinto.
- Ventana de 512 tokens: los documentos largos deben fragmentarse, lo que puede romper la coherencia semántica de pasajes extensos.
- Conjunto de evaluación privado: los benchmarks declarados provienen de un split "investo val" definido por el autor y no verificados de forma independiente; precisiones@k decrecientes (precision@10 de 0,096) indican que el ranking de cola larga es impreciso.
- Riesgo de sesgo de dominio: entrenado sobre Investopedia, puede degradar en otros subdominios financieros (derivados, criptoactivos, regulación local) no representados en el corpus.
- Riesgo de alucinación semántica: como todo encoder, puede producir similitudes altas entre pasajes superficialmente parecidos pero contradictorios; no debe usarse como verificador de veracidad.
- Licencia Apache 2.0: permite uso comercial con atribución y sin garantías; conviene revisar los términos del dataset de origen (FinLang/investopedia-embedding-dataset) antes de redistribuir derivados.
- Modelo con cero descargas y cero likes en el momento de la ficha: no hay evidencia de validación por la comunidad ni de mantenimiento continuado.
- No sustituye a un LLM generativo: no responde preguntas por sí mismo, solo produce embeddings; debe integrarse en un pipeline de recuperación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sachinyerrawar/sbert_raw_investo-finmodern_pair_merged
- Modelo base: https://huggingface.co/sentence-transformers/bert-base-nli-mean-tokens
- Dataset de entrenamiento: https://huggingface.co/datasets/FinLang/investopedia-embedding-dataset
- Paper Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper CachedMultipleNegativesRankingLoss / Multiple Negatives Ranking (arXiv:2101.06983): https://arxiv.org/abs/2101.06983
- Librería sentence-transformers: https://www.sbert.net/
- Documentación de Text Embeddings Inference: https://huggingface.co/docs/text-embeddings-inference
