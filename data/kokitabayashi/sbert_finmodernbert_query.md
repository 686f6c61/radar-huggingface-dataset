# kokitabayashi/sbert_FinModernBERT_query

## Resumen

`sbert_FinModernBERT_query` es un modelo de embeddings de frases (sentence transformer) especializado en recuperación de información sobre documentos financieros en inglés. Lo publica el usuario kokitabayashi en HuggingFace y se construye mediante fine-tuning de `sentence-transformers/bert-base-nli-mean-tokens` (un BERT base de 109,5 millones de parámetros) sobre pares sintéticos de preguntas y fragmentos de filings de la SEC, generados a partir de `BatuhanECB/FinModernBERT-pairs-sec-synthetic-v1`.

El modelo resuelve el problema de la búsqueda semántica en corpus financieros: dado un query en lenguaje natural sobre datos de empresas (resultados, riesgos, estructura de plantilla, condiciones de deuda), devuelve los pasajes relevantes de informes anuales y trimestrales. Es relevante para pipelines de RAG sobre documentación regulatoria, donde los embeddings genéricos rinden peor por el vocabulario técnico y la densidad de cifras del dominio.

La arquitectura es un transformer encoder BERT base con pooling de media, entrenado con `MultipleNegativesRankingLoss` sobre 44.709 pares. El contexto máximo es de 512 tokens y la salida es un vector denso de 768 dimensiones. La licencia es Apache 2.0 y el repo pesa 0,4 GB en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT base (12 capas, 768 hidden, 12 cabezas), pooling de media |
| Parametros totales | 109.482.240 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (límite estándar de BERT base) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones específicas; admite las estándar de safetensors/ONNX) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `sentence-transformers/bert-base-nli-mean-tokens`, un BERT base ya adaptado a similitud semántica mediante NLI, y se fine-tunea como sentence transformer con pooling de media sobre las representaciones del token `[CLS]` y de los tokens de contenido. La función de pérdida es `MultipleNegativesRankingLoss`, que trata los demás pasajes del batch como negativos en la pérdida contrastiva, técnica habitual para entrenar retrievers densos sin anotación explícita de negativos.

El conjunto de entrenamiento consta de 44.709 pares query-pasaje sintéticos derivados de filings de la SEC (`BatuhanECB/FinModernBERT-pairs-sec-synthetic-v1`). No se documenta el número de tokens totales, la composición exacta del dataset ni si hubo etapas adicionales de RLHF o DPO (no aplica en un modelo de embeddings). Tampoco se detalla si se aplicó hard negative mining ni el esquema de validación. La innovación principal es la especialización de dominio: el modelo se entrena para emparejar preguntas formuladas de forma natural con fragmentos de 10-K, 10-Q y prospectos de deuda, un registro lingüístico muy distinto al de los corpus NLI generalistas.

## Capacidades

- Generación de embeddings densos de 768 dimensiones para frases, pasajes y queries.
- Similitud semántica y recuperación de información (information retrieval) en dominio financiero.
- Feature extraction para pipelines de búsqueda vectorial (FAISS, Qdrant, pgvector, etc.).
- Emparejamiento query-pasaje en inglés sobre documentos de la SEC (10-K, 10-Q, prospectos, contratos de deuda).
- Soporte de `text-embeddings-inference` y endpoints compatibles, según los tags del repo.
- No soporta tool calling, function calling, agentes, visión, audio ni modo thinking: es un encoder, no un modelo generativo.
- Capacidad multilingüe: no, solo inglés.

## Casos de uso

- Búsqueda semántica sobre archivos de la SEC: indexar los fragmentos de 10-K y 10-Q de una cartera de empresas y recuperar los pasajes relevantes para preguntas de analistas sobre resultados, riesgos o estructura de capital. El modelo está entrenado exactamente sobre ese tipo de pares.
- RAG para asistentes de análisis financiero: usar los embeddings como retriever en un pipeline que alimente a un LLM generativo con los pasajes correctos antes de redactar la respuesta, reduciendo alucinaciones sobre cifras concretas.
- Extracción de respuestas en due diligence: localizar en cientos de prospectos las cláusulas de deuda, covenants o condiciones de amortización relevantes para una operación.
- Detección de duplicados y clustering de fragmentos: agrupar pasajes de filings que describen el mismo riesgo o el mismo hecho contable en distintas empresas del sector.
- Enrutamiento de consultas internas: clasificar preguntas de empleados de un departamento financiero hacia el documento o el equipo correcto mediante similitud con un catálogo de temas.
- Motor de búsqueda en bases de conocimiento regulatorias: indexar comunicados, circulares y notas de la CNMV o la SEC y ofrecer búsqueda semántica en lenguaje natural.
- Evaluación de similitud entre declaraciones: comparar la redacción de un riesgo declarado en dos ejercicios consecutivos para detectar cambios materiales en la descripción.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de la model card sobre el dataset "finance eval" (métricas no verificadas):

| Metrica | Valor |
|---|---|
| Cosine Accuracy@1 | 0,7557 |
| Cosine Accuracy@3 | 0,9043 |
| Cosine Accuracy@5 | 0,9370 |
| Cosine Accuracy@10 | 0,9619 |
| Cosine Precision@1 | 0,7557 |
| Cosine Precision@3 | 0,3014 |
| Cosine Precision@5 | 0,1874 |
| Cosine Precision@10 | 0,0962 |
| Cosine Recall@1 | 0,7557 |
| Cosine Recall@3 | 0,9043 |
| Cosine Recall@5 | 0,9370 |
| Cosine Recall@10 | 0,9619 |

No se han publicado en la información disponible resultados comparativos con otros modelos ni métricas sobre benchmarks estándar (MMLU, HumanEval, GSM8K, MTEB), que además no aplican a un modelo de embeddings.

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 0,45 GB en fp32 (109,5 M de parámetros × 4 bytes) más el overhead de activaciones; alrededor de 0,25 GB en fp16 y 0,12 GB en int8.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en T4, L4, A10, A100, H100 y en GPUs de consumo.
- Cabe holgadamente en GPU de consumo: GTX 1650, RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: `sentence-transformers` (Python), `text-embeddings-inference` (TGI para embeddings), ONNX Runtime, y exportación a FAISS para indexación.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera un throughput alto en GPU (del orden de miles de pasajes por segundo en A100 con batching), pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kokitabayashi/sbert_FinModernBERT_query | 109,5 M | 512 | Financiero (SEC) | Apache 2.0 | HuggingFace |
| sentence-transformers/bert-base-nli-mean-tokens | 109,5 M | 512 | General (NLI) | Apache 2.0 | HuggingFace |
| BAAI/bge-base-en-v1.5 | 109 M | 512 | General | MIT | HuggingFace |
| intfloat/e5-base-v2 | 109 M | 512 | General | MIT | HuggingFace |

La comparación de rendimiento con estas alternativas no está disponible en la información proporcionada. El modelo se distingue por su especialización en filings de la SEC, mientras que los otros son retrievers generalistas con amplia validación en MTEB.

## Limitaciones y advertencias

- Solo inglés: no soporta consultas ni documentos en castellano ni en otros idiomas.
- Contexto limitado a 512 tokens: los pasajes largos deben trocearse, lo que puede romper la coherencia de tablas y notas al pie en filings.
- Entrenado sobre pares sintéticos: la calidad de los datos sintéticos condiciona el rendimiento real; no hay validación con anotación humana documentada.
- Métricas no verificadas: los resultados del model-index están marcados como `verified: false` y proceden del propio autor.
- Riesgo de sesgo de dominio: puede rendir peor en textos financieros que no sean filings estadounidenses (por ejemplo, cuentas anuales españolas o memorias de bancos europeos).
- No es un modelo generativo: no produce texto, solo vectores; requiere un LLM externo para tareas de respuesta.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del dataset sintético de origen si se redistribuye.
- Sin mantenimiento documentado: 37 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validación comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/kokitabayashi/sbert_FinModernBERT_query
- Modelo base: https://huggingface.co/sentence-transformers/bert-base-nli-mean-tokens
- Dataset de entrenamiento: https://huggingface.co/datasets/BatuhanECB/FinModernBERT-pairs-sec-synthetic-v1
- Paper de Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper de SimCSE / representaciones contrastivas (arXiv:1807.03748): https://arxiv.org/abs/1807.03748
- Librería sentence-transformers: https://www.sbert.net/
- Documentación de text-embeddings-inference: https://huggingface.co/docs/text-embeddings-inference
