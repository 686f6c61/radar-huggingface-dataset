# sachinyerrawar/sbert_raw_finmodern_pair_merged

## Resumen

`sbert_raw_finmodern_pair_merged` es un modelo de embeddings de frases (sentence-transformers) construido a partir de `sentence-transformers/bert-base-nli-mean-tokens` mediante ajuste fino supervisado. Lo desarrolla el usuario de Hugging Face `sachinyerrawar` y está orientado a la similitud semántica y la recuperación de información en el dominio financiero: los ejemplos de la model card proceden de informes anuales, estados financieros consolidados y documentación contractual (cláusulas de crédito, notas de deuda, desgloses de resultados).

El modelo resuelve el problema de emparejar preguntas en lenguaje natural con fragmentos de documentos financieros extensos, una tarea típica en sistemas RAG sobre filings (10-K, 10-Q, prospectos). Con 109.482.240 parámetros y una arquitectura BERT base, produce embeddings densos que se comparan por similitud coseno. Su relevancia es acotada: se trata de un ajuste experimental con un conjunto de entrenamiento muy reducido (70 ejemplos según la etiqueta `dataset_size:70`), no de un modelo de producción validado a gran escala.

La licencia Apache 2.0 y el formato safetensors facilitan su integración, pero conviene tratarlo como una prueba de concepto de dominio más que como un sustituto de los modelos de embeddings generalistas o de los rerankers financieros consolidados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT base (sentence-transformers, pooling mean) |
| Parametros totales | 109.482.240 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (arquitectura BERT base, típicamente 512 tokens; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; compatible con cuantización estándar vía herramientas externas) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder BERT base (12 capas, hidden size 768, 12 cabezas de atención) adaptado con la librería `sentence-transformers` para producir un vector por frase mediante mean pooling, heredado del checkpoint `sentence-transformers/bert-base-nli-mean-tokens`. La salida es un embedding denso de 768 dimensiones que se compara con similitud coseno para tareas de similitud semántica y recuperación.

El ajuste fino se realizó con `CachedMultipleNegativesRankingLoss`, una variante de la pérdida de ranking con negativos en batch que permite usar lotes efectivos grandes con memoria limitada. El conjunto de entrenamiento declarado es de solo 70 ejemplos (`dataset_size:70`), lo que convierte este modelo en un ajuste de dominio muy ligero, probablemente sobre pares pregunta-fragmento de documentos financieros. No se documentan número de tokens de entrenamiento, composición detallada del dataset ni fases de RLHF o DPO (no aplicables a un modelo de embeddings). No se describen innovaciones técnicas adicionales más allá del uso de la pérdida mencionada.

## Capacidades

- Generación de embeddings de frases y párrafos para similitud semántica y recuperación de información.
- Búsqueda semántica y emparejamiento pregunta-respuesta sobre texto financiero (estados financieros, notas al pie, cláusulas contractuales).
- Extracción de características (`feature-extraction`) para pipelines de clustering, deduplicación y clasificación basada en similitud.
- Compatible con `text-embeddings-inference` y con endpoints de Hugging Face (`endpoints_compatible`).
- Uso como retriever en arquitecturas RAG sobre corpus documentales en inglés.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento: es exclusivamente un encoder de embeddings.
- Capacidad multilingüe: limitada al inglés (`en`).

## Casos de uso

- Búsqueda semántica sobre informes anuales (10-K, 10-Q): indexar los fragmentos de los filings y recuperar los pasajes que responden a preguntas de analistas sobre partidas contables, usando similitud coseno sobre los embeddings generados.
- RAG para asistentes de análisis financiero: actuar como retriever en un pipeline en el que un LLM generativo redacta la respuesta a partir de los fragmentos recuperados de estados consolidados y notas.
- Emparejamiento pregunta-cláusula en documentación de crédito: localizar la cláusula que regula plazos de notificación o condiciones de un préstamo a partir de una consulta en lenguaje natural.
- Deduplicación y agrupación de pasajes financieros: calcular embeddings de notas al pie y agrupar por similitud para consolidar disclosures repetidos entre ejercicios.
- Evaluación de cobertura documental: medir la similitud entre preguntas de un cuestionario de due diligence y los fragmentos disponibles para detectar lagunas de información.
- Prototipado rápido de motores de búsqueda internos: al ser un modelo de 109 M de parámetros y 0,2 GB, se puede desplegar en una sola GPU consumer para validar la viabilidad de un buscador semántico antes de invertir en un modelo mayor.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`), sobre un conjunto denominado "finance eval" para la tarea de recuperación de información:

| Metrica | Valor |
|---|---|
| Cosine Accuracy@1 | 0,9333 |
| Cosine Accuracy@3 | 1,0 |
| Cosine Accuracy@5 | 1,0 |
| Cosine Accuracy@10 | 1,0 |
| Cosine Precision@1 | 0,9333 |
| Cosine Precision@3 | 0,3333 |
| Cosine Precision@5 | 0,2000 |
| Cosine Precision@10 | 0,1000 |
| Cosine Recall@1 | 0,9333 |
| Cosine Recall@3 | 1,0 |
| Cosine Recall@5 | 1,0 |
| Cosine Recall@10 | 1,0 |
| Cosine NDCG@10 | 0,9754 |

No se han publicado en la información disponible resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, MTEB) ni comparaciones con modelos de referencia. El conjunto de evaluación no está descrito en detalle y los valores no están verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,5 GB en fp32 (109 M de parámetros), menos de 0,3 GB en fp16 y por debajo de 0,15 GB en int8. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060, RTX 4090, T4, A10, A100 o H100 son más que suficientes. También funciona en CPU para volúmenes moderados.
- Cabe en GPU consumer: sí, en todas las gamas actuales, incluidas integradas con suficiente memoria compartida.
- Opciones de despliegue: `sentence-transformers` (Python), `text-embeddings-inference` (TGI para embeddings), Hugging Face Inference Endpoints, y exportación a ONNX para servir con FastEmbed u otros runtimes.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera un throughput alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| `sachinyerrawar/sbert_raw_finmodern_pair_merged` | 109,5 M | no disponible | en | Apache 2.0 | Ajuste de dominio financiero con 70 ejemplos; benchmarks propios no verificados |
| `sentence-transformers/bert-base-nli-mean-tokens` (modelo base) | ~110 M | 512 tokens (BERT base) | en | Apache 2.0 | Entrenado en NLI; referencia generalista de similitud |
| `BAAI/bge-base-en-v1.5` | ~109 M | 512 tokens | en | MIT | Embeddings generalistas con buen rendimiento en MTEB; ampliamente usado en RAG |
| `sentence-transformers/all-MiniLM-L6-v2` | ~22 M | 256 tokens | en | Apache 2.0 | Mucho más ligero y rápido; menor calidad en dominios técnicos |

La comparación de rendimiento con estas alternativas no está disponible: el modelo solo publica métricas sobre su propio conjunto "finance eval", sin resultados en MTEB ni evaluaciones cruzadas.

## Limitaciones y advertencias

- Conjunto de entrenamiento de solo 70 ejemplos: riesgo alto de sobreajuste y de que las métricas declaradas no generalicen a otros corpus financieros.
- Benchmarks no verificados (`verified: false`) y sobre un conjunto de evaluación no descrito; no deben tomarse como indicativos de rendimiento en producción.
- Solo inglés: no soporta consultas ni documentos en castellano ni en otros idiomas.
- Longitud de contexto no confirmada; si se hereda la del BERT base, los documentos largos deben trocearse en fragmentos de hasta 512 tokens.
- Riesgo de falsos positivos en similitud: los embeddings capturan solapamiento léxico-semántico y pueden emparejar pasajes contables con cifras parecidas pero significado distinto; conviene añadir un reranker.
- Sesgos heredados del modelo base y del corpus NLI original, no auditados en este ajuste.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin comunidad que lo valide.
- No apto para generación de texto, razonamiento, código ni tareas agénticas: es exclusivamente un encoder de embeddings.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sachinyerrawar/sbert_raw_finmodern_pair_merged
- Modelo base: https://huggingface.co/sentence-transformers/bert-base-nli-mean-tokens
- Paper de Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper de Multiple Negatives Ranking (arXiv:2101.06983): https://arxiv.org/abs/2101.06983
- Librería sentence-transformers: https://www.sbert.net/
- Documentación de text-embeddings-inference: https://huggingface.co/docs/text-embeddings-inference
