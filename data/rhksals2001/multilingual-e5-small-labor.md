# rhksals2001/multilingual-e5-small-labor

## Resumen

`rhksals2001/multilingual-e5-small-labor` es un modelo de embeddings densos especializado en recuperación de información (information retrieval) sobre articulado laboral coreano. Se construye mediante fine-tuning completo del modelo multilingüe `intfloat/multilingual-e5-small` de Microsoft, partiendo de una arquitectura BERT y ajustándolo con pares pregunta-respuesta del dominio normativo laboral. Lo publica el usuario rhksals2001 bajo licencia MIT, con un conjunto de datos propio de 663 pares.

El modelo resuelve un problema muy concreto: alinear semánticamente consultas coloquiales de trabajadores (por ejemplo, dudas sobre permisos o salarios) con el artículo legal exacto que las regula. Para ello conserva el esquema de prefijos de la familia E5 (`query:` para la consulta, `passage:` para el documento), genera vectores de 384 dimensiones y admite entradas de hasta 512 tokens.

Su relevancia es acotada pero clara: demuestra cómo un modelo pequeño (117,6 millones de parámetros, ~0,5 GB de repositorio) puede especializarse en un dominio vertical con muy pocos datos y ofrecer métricas de recuperación razonables, lo que lo hace desplegable en infraestructura modesta para asistentes de consulta normativa o sistemas RAG legales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (base: intfloat/multilingual-e5-small) |
| Parametros totales | 117.653.760 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (incluyendo tokens especiales y prefijos) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantizacion estandar de sentence-transformers/ONNX, no documentada por el autor) |
| Idiomas soportados | coreano (ko) declarado; el modelo base es multilingüe |
| Licencia | MIT |
| Formato de pesos | safetensors (librería sentence-transformers) |
| Dimension del embedding | 384 |
| Funcion de perdida | MultipleNegativesRankingLoss |
| Tamano del dataset de entrenamiento | 663 pares |
| Tamano del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

El modelo es un encoder Transformer bidireccional de tipo BERT, heredado íntegramente de `intfloat/multilingual-e5-small`. No se modifica la arquitectura: se realiza un fine-tuning completo (no LoRA ni adaptadores) sobre los pesos del modelo base, de modo que la salida sigue siendo un vector denso de 384 dimensiones por texto, normalizable para similitud coseno.

El entrenamiento emplea la función de pérdida `MultipleNegativesRankingLoss`, habitual en recuperación densa, que trata los pasajes positivos del mismo lote como negativos para el resto de consultas. El conjunto de datos (`rhksals2001/labor-embedding-data`) contiene 663 pares de consulta y artículo legal. El autor indica que el corpus general del mismo repositorio (`general-evaluation/general-corpus`) se usó únicamente como control de regresión en otros dominios y no participó en el ajuste de pesos. No se documentan fases de RLHF, DPO ni datos de preentrenamiento adicionales.

## Capacidades

- Generación de embeddings densos para similitud semántica y recuperación de pasajes (pipeline `sentence-similarity` y `feature-extraction`).
- Recuperación de articulado laboral coreano a partir de consultas en lenguaje natural coloquial.
- Codificación asimétrica mediante prefijos: `query:` para consultas y `passage:` para documentos.
- Soporte de `normalize_embeddings=True` para comparación por producto escalar equivalente a coseno.
- Compatible con Text Embeddings Inference (tag `text-embeddings-inference`) y con endpoints de Hugging Face.
- No soporta tool calling, agentes, generación de texto, visión ni audio: es exclusivamente un modelo de representación.

## Casos de uso

- Asistente de consulta normativa laboral: el modelo indexa los artículos del estatuto laboral como pasajes y recupera los más relevantes para la duda del usuario, sirviendo de primera etapa en un pipeline RAG.
- Chatbot de atención a trabajadores: integrado en un sistema de preguntas frecuentes, permite mapear formulaciones coloquiales ("¿me pueden negar el permiso menstrual?") al artículo correspondiente con recuperación top-5 superior al 90 % según las métricas del autor.
- Búsqueda semántica interna para despachos y asesorías: sustituye la búsqueda por palabra clave sobre bases de normativa, tolerando paráfrasis y sinónimos.
- Deduplicación y agrupación de consultas: al generar embeddings normalizados, permite agrupar preguntas equivalentes recibidas en un buzón de soporte y priorizar las más frecuentes.
- Filtrado previo en pipelines de compliance: descarta documentos irrelevantes antes de pasarlos a un modelo generativo, reduciendo coste y latencia del LLM.
- Evaluación de regresiones en dominios verticales: sirve como referencia de cómo un ajuste con 663 pares afecta a la recuperación en un dominio concreto frente al modelo base multilingüe.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card sobre el conjunto de evaluación `labor` (task: information-retrieval). No están verificados de forma independiente (`verified: false`).

| Metrica | Valor |
|---|---|
| Cosine Accuracy@1 | 0,6589 |
| Cosine Accuracy@3 | 0,8551 |
| Cosine Accuracy@5 | 0,9019 |
| Cosine Accuracy@10 | 0,9393 |
| Cosine Precision@1 | 0,6589 |
| Cosine Precision@5 | 0,1804 |
| Cosine Recall@1 | 0,6589 |
| Cosine Recall@5 | 0,9019 |
| Cosine NDCG@10 | 0,8047 |
| Cosine MRR@10 | 0,7607 |
| Cosine MAP@100 | 0,7625 |

No se han publicado en la información disponible resultados comparativos frente al modelo base ni frente a otros modelos de embeddings.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB de pesos; en fp16 alrededor de 0,25 GB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU con latencia aceptable para volúmenes moderados. Para alto throughput, una T4, L4 o RTX 4090 son más que suficientes.
- Cabe en GPU consumer: sí, en cualquier modelo con al menos 1 GB de VRAM libre (GTX 1650, RTX 3060, etc.).
- Opciones de despliegue: sentence-transformers (nativo), Text Embeddings Inference (tag oficial), ONNX Runtime, y exportación a GGUF para llama.cpp no documentada por el autor.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño (117 M de parámetros) se espera un throughput alto en lote, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension | Licencia | Especializacion |
|---|---|---|---|---|---|
| rhksals2001/multilingual-e5-small-labor | 117,6 M | 512 | 384 | MIT | Dominio laboral coreano |
| intfloat/multilingual-e5-small (base) | 117,6 M | 512 | 384 | MIT | Multilingüe general |
| intfloat/multilingual-e5-base | ~278 M | 512 | 768 | MIT | Multilingüe general |
| BAAI/bge-m3 | ~568 M | 8192 | 1024 | MIT | Multilingüe general, multi-vector |

El modelo ajustado comparte arquitectura y tamaño con su base, por lo que la comparación directa en rendimiento exige evaluar ambos sobre el mismo conjunto `labor`, dato que no se ha publicado. Frente a alternativas más grandes como `bge-m3`, pierde en dimensión y longitud de contexto, pero gana en coste de despliegue y en especialización vertical.

## Limitaciones y advertencias

- El conjunto de entrenamiento es muy reducido (663 pares), lo que aumenta el riesgo de sobreajuste al dominio y de degradación en consultas fuera de distribución.
- El autor advierte explícitamente de que una alta similitud no garantiza corrección jurídica: el modelo no es una herramienta de asesoramiento legal.
- Los benchmarks son autoinformados y no verificados; los resultados en otros dominios o en artículos nuevos deben evaluarse por separado.
- El idioma declarado es únicamente coreano; aunque el modelo base es multilingüe, no hay evidencia de rendimiento en castellano ni en otras lenguas tras el fine-tuning.
- Posibles sesgos heredados del corpus de entrenamiento y del modelo base, no analizados en la model card.
- Licencia MIT: permite uso comercial sin restricciones adicionales, pero sin garantías de ningún tipo.
- No apto para generación de texto, razonamiento ni tareas agénticas; su uso debe limitarse a representación y recuperación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rhksals2001/multilingual-e5-small-labor
- Dataset de entrenamiento: https://huggingface.co/datasets/rhksals2001/labor-embedding-data
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
- Paper de la familia E5 (Multilingual E5 Text Embeddings): https://arxiv.org/abs/2402.05672
- Documentación de sentence-transformers: https://www.sbert.net/
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
