# Reza2kn/RaahNaame-Koochik-v1

## Resumen

RaahNaame-Koochik-v1 (راه‌نامه, "guía pequeña" en persa) es un modelo de embeddings de texto para persa desarrollado por Reza2kn. Se construye sobre `google/embeddinggemma-300m` mediante destilación de conocimiento desde dos profesores mucho mayores: F2LLM-v2-14B (para clasificación, clustering, STS y estructura de texto general) y Gemini Embedding 2 (para recuperación query→passage). El resultado es un modelo de 302,8 millones de parámetros que ofrece un rendimiento cercano a modelos de hasta 1,7B parámetros en la categoría.

El modelo resuelve el problema de la baja cobertura de embeddings de alta calidad para persa (farsi) en tamaños pequeños y desplegables en CPU. En MTEB(fas, v2), con 52 tareas, alcanza 71,44 Mean(Task) y 73,89 Mean(TaskType), lo que supone +3,7 puntos sobre la base EmbeddingGemma-300m y lo sitúa por delante de todos los modelos de hasta 1,7B parámetros evaluados en ese benchmark. Es relevante ahora porque demuestra que la destilación desde profesores de 14B permite a un modelo de 0,3B competir en un idioma de recursos medios sin necesidad de infraestructura de GPU grande.

La arquitectura hereda la de Gemma 3 text (transformer denso) con cabezas Dense para embeddings, salida de 768 dimensiones L2-normalizadas y truncamiento Matryoshka heredado (512/256/128) aunque sin reajustar. Soporta prompts por tarea (retrieval, clasificación, clustering, STS, pair classification) siguiendo el esquema de EmbeddingGemma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (gemma3_text) con cabezas Dense para embeddings |
| Parametros totales | 302.863.104 (~303M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors fp32; compatible con text-embeddings-inference) |
| Idiomas soportados | persa (fa), ingles (en) |
| Licencia | Gemma Terms of Use (derivado de EmbeddingGemma) |
| Formato de pesos | safetensors |
| Dimension de embedding | 768 (L2-normalizado, cosine similarity) |
| Truncamiento Matryoshka | 512 / 256 / 128 (heredado, no reajustado) |
| Modelo base | google/embeddinggemma-300m |
| Libreria | sentence-transformers |
| Tamano del repo | 1,3 GB |

## Arquitectura y entrenamiento

El estudiante es el modelo completo `google/embeddinggemma-300m`, incluidas las cabezas Dense. El entrenamiento combina dos perdidas: InfoNCE in-batch (peso 0,25) y una divergencia KL entre las distribuciones de ranking del estudiante y del profesor sobre positivos, negativos duros y candidatos in-batch (peso 0,75). En lotes de texto general se anaden una KL relacional (matriz de similitud) y una proyeccion coseno al espacio de 5120 dimensiones del profesor de 14B.

El profesor de recuperacion es Gemini Embedding 2, cuyos logits de similitud (τ = 0,02, calibrados a la confianza del 14B) son los objetivos en lotes de retrieval; los negativos duros se minaron con Gemini. El otro profesor es F2LLM-v2-14B (τ = 0,07). El entrenamiento tiene dos etapas de 5k pasos cada una: la primera sobre datos persas etiquetados por profesores (pares query-passage derivados de Yalda, datos de tareas F2LLM, un conjunto de dominios de noticias/medicina/ciencia/social y texto web general); la segunda anade ~285k grupos supervisados construidos a partir de los splits de train de datasets de benchmark persas, con objetivos del 14B. LR 5e-6 con schedule coseno. El modelo final es la media uniforme de los checkpoints de la etapa 2 en los pasos 3000, 4000 y 5000, seguida de un weight-merge 75/25 con el modelo de la etapa 1 para conservar las ganancias en clasificacion y recuperar retrieval.

En cuanto a higiene de datos, se eliminaron de todo el entrenamiento los textos de todos los splits de evaluacion de las 52 tareas de MTEB(fas, v2) (167k textos) y 33,5k queries de test de benchmark. No obstante, se usaron splits de train de 28 tareas de MTEB, por lo que el modelo no es zero-shot en ellas.

## Capacidades

- Generacion de embeddings de texto para similitud semantica y feature extraction.
- Recuperacion de informacion (query → passage ranking) con prompts especificos.
- Clasificacion de texto y clasificacion de pares (pair classification).
- Clustering de documentos y agrupamiento semantico.
- Similitud semantica textual (STS) y reranking.
- Bitext mining (alineamiento entre persa e ingles).
- Sumarizacion como tarea de embedding (prompt `Summarization`).
- Soporte de prompts por tarea via `prompt_name` en sentence-transformers.
- Compatible con text-embeddings-inference para despliegue en servidor.
- Capacidades multilingues limitadas a persa e ingles.
- No es un modelo generativo: no hace tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Busqueda semantica en persa: indexar un corpus de documentos persas con `encode_document` y consultar con `encode_query`; el modelo usa el prompt de retrieval (`task: search result | query:`) y devuelve similitudes coseno calibradas para ranking.
- RAG sobre documentacion en persa: generar embeddings de chunks de manuales, normativa o articulos y recuperar los fragmentos relevantes para un LLM generativo, aprovechando la mejora de +3,7 puntos sobre la base en MTEB(fas).
- Clasificacion de tickets y correos: usar el prompt `Classification` para obtener vectores y entrenar un clasificador ligero encima (regresion logistica o kNN) para enrutar consultas de soporte en persa.
- Deduplicacion y clustering de noticias: agrupar articulos de medios persas por similitud coseno con el prompt `Clustering` para detectar duplicados o construir temas.
- Deteccion de parafrasis y plagio: usar `PairClassification` o `STS` para comparar pares de frases y detectar reescrituras o similitud encubierta.
- Filtrado de contenido y moderacion: comparar mensajes contra una lista de referencias problematicas mediante similitud semantica, con la ventaja de que el modelo cabe en CPU.
- Alineamiento bilingue persa-ingles: usar la capacidad de bitext mining (76,96 en esa tarea) para emparejar frases de corpus paralelos.
- Despliegue en entornos sin GPU: al ser 303M parametros, sirve para busqueda semantica en dispositivos modestos o contenedores CPU con text-embeddings-inference.

## Benchmarks y rendimiento

MTEB(fas, v2), 52 tareas, evaluado con `mteb` 2.27.4 (fp32) usando los prompts propios del modelo:

| Modelo | Parametros | Mean(Task) | Mean(TaskType) | Borda rank |
|---|---:|---:|---:|---:|
| F2LLM-v2-14B | 14B | 73,94 | 76,30 | 1 |
| F2LLM-v2-8B | 8B | 73,04 | 75,25 | 2 |
| F2LLM-v2-4B | 4B | 72,07 | 74,34 | 3 |
| RaahNaame-Koochik-v1 | 0,3B | 71,44 | 73,89 | 4 |
| F2LLM-v2-1.7B | 1,7B | 70,39 | 72,94 | 5 |
| Hakim | 0,1B | 71,58 | 75,13 | 6 |
| F2LLM-v2-0.6B | 0,6B | 68,33 | 70,88 | — |
| EmbeddingGemma-300m (base) | 0,3B | 67,76 | 70,84 | — |

Desglose por tipo de tarea (RaahNaame-Koochik-v1):

| Tipo de tarea | Puntuacion |
|---|---:|
| Classification | 76,33 |
| Clustering | 69,38 |
| Pair classification | 85,29 |
| Reranking | 70,50 |
| Retrieval | 60,00 |
| STS | 78,77 |
| Bitext mining | 76,96 |

El Borda rank se calcula entre los 32 modelos con resultados en las 52 tareas del repositorio publico `embeddings-benchmark/results` (calculado por el autor, noviembre de 2026); el leaderboard oficial puede filtrar modelos de forma distinta.

## Requisitos de hardware

- VRAM estimada para inferencia: ~1,2 GB en fp32 (303M parametros a 4 bytes); ~0,6 GB en fp16; ~0,3-0,4 GB en cuantizacion de 8 bits (estimacion a partir del numero de parametros, no publicada por el autor).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona sobradamente en RTX 3060, RTX 4090, A100 y H100. No requiere GPU de datacenter.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU.
- Opciones de despliegue: sentence-transformers (referencia), text-embeddings-inference (tag oficial), y cualquier runtime compatible con safetensors. No se publican pesos GGUF en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por tamano, es apto para servir en CPU con latencias de decenas de milisegundos por lote pequeno, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Mean(Task) MTEB fas v2 | Idiomas | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| RaahNaame-Koochik-v1 | 0,3B | 71,44 | fa, en | Gemma Terms | Hugging Face |
| EmbeddingGemma-300m (base) | 0,3B | 67,76 | multilingue | Gemma Terms | Hugging Face |
| F2LLM-v2-0.6B | 0,6B | 68,33 | multilingue | no disponible | Hugging Face |
| F2LLM-v2-1.7B | 1,7B | 70,39 | multilingue | no disponible | Hugging Face |
| Hakim | 0,1B | 71,58 | fa | no disponible | Hugging Face |

Frente a EmbeddingGemma-300m, la mejora es de +3,68 puntos en Mean(Task) con el mismo numero de parametros. Frente a F2LLM-v2-1.7B, un modelo casi 6 veces mayor, RaahNaame-Koochik-v1 supera en +1,05 puntos. Hakim, con solo 0,1B, obtiene una Mean(Task) ligeramente superior (71,58) pero peor Mean(TaskType) (75,13 frente a 73,89) y un Borda rank inferior.

## Limitaciones y advertencias

- No es zero-shot en 28 tareas de MTEB(fas, v2) cuyos splits de train se usaron en la etapa 2; las puntuaciones en esas tareas pueden estar infladas respecto a un uso real fuera de distribucion.
- Solo cubre persa e ingles; el rendimiento en otros idiomas no esta documentado y probablemente sea bajo.
- La tarea de retrieval obtiene 60,00, notablemente por debajo de clasificacion (76,33) y pair classification (85,29); para RAG en persa conviene validar la calidad de recuperacion en el dominio propio.
- El truncamiento Matryoshka (512/256/128) se hereda del modelo base pero no se reajusto, por lo que las dimensiones reducidas pueden degradar mas de lo esperado.
- Riesgo de alucinacion no aplica como modelo generativo, pero si de falsos positivos en similitud semantica y en clasificacion con umbrales mal calibrados.
- Sesgos: no se documentan evaluaciones de sesgo; al entrenarse con datos persas de noticias, medicina, ciencia y redes, puede heredar sesgos de esas fuentes.
- Licencia Gemma Terms of Use: uso comercial permitido bajo esos terminos, pero sujeto a la Gemma Prohibited Use Policy; revisar obligaciones de atribucion y restricciones antes de produccion.
- El modelo se creo en noviembre de 2026 y tiene 229 descargas y 3 likes; es muy reciente y con poca validacion independiente.
- No se publican datos de latencia, throughput ni pesos GGUF; el despliegue en CPU via text-embeddings-inference es posible pero sin cifras oficiales de rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Reza2kn/RaahNaame-Koochik-v1
- Modelo base EmbeddingGemma-300m: https://huggingface.co/google/embeddinggemma-300m
- Profesor F2LLM-v2-14B: https://huggingface.co/codefuse-ai/F2LLM-v2-14B
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Politica de uso prohibido de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
- Repositorio de resultados de MTEB: https://github.com/embeddings-benchmark/results
- Libreria MTEB: https://github.com/embeddings-benchmark/mteb
