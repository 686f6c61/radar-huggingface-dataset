# Reza2kn/RaahNaame-Koochik-v1

## Resumen

RaahNaame-Koochik-v1 (راه‌نامه) es un modelo de embeddings de texto para persa (farsi) desarrollado por Reza2kn, publicado en Hugging Face en noviembre de 2026. Se construye a partir de `google/embeddinggemma-300m` mediante destilación de conocimiento desde dos profesores de mayor tamano: F2LLM-v2-14B, para tareas de clasificacion, clustering, STS y estructura general del texto, y Gemini Embedding 2, para recuperacion (ranking consulta-pasaje). El resultado es un modelo de 302,8 millones de parametros que produce vectores densos de 768 dimensiones normalizados en L2.

El problema que resuelve es la brecha de calidad entre modelos de embeddings multilingues genericos y modelos especializados en persa de gran tamano. Segun la model card, el modelo alcanza 71,54 de media de tarea y 74,02 de media de tipo de tarea en MTEB(fas, v2) sobre 52 tareas, lo que supone +3,7 puntos sobre el modelo base EmbeddingGemma-300m y lo situa por delante de todos los modelos de hasta 1,7B parametros evaluados en ese benchmark. Es relevante porque ofrece calidad cercana a modelos de 4B-14B con un coste de inferencia de un modelo de 0,3B.

La ficha se basa exclusivamente en la informacion publicada en Hugging Face y en los resultados de busqueda disponibles. No se dispone de paper, blog tecnico ni repositorio de codigo independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder derivado de Gemma 3 text (base: `google/embeddinggemma-300m`), con cabezas Dense para embeddings |
| Parametros totales | 302.863.104 (segun safetensors); la model card indica 308M |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors, presumiblemente bf16/fp32); truncamiento Matryoshka heredado a 512/256/128 dimensiones, no reajustado |
| Idiomas soportados | Persa (fa) e ingles (en) |
| Licencia | Gemma Terms of Use (derivado de EmbeddingGemma) |
| Formato de pesos | safetensors (repo de 1,3 GB) |
| Dimension de salida | 768 dimensiones, normalizadas L2 |
| Libreria | sentence-transformers |
| Tamano del repo | 1,3 GB |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de `google/embeddinggemma-300m`, incluyendo las cabezas Dense del modelo base. La arquitectura subyacente es la de Gemma 3 text, un transformer encoder adaptado a produccion de embeddings. El entrenamiento combina dos funciones de perdida: InfoNCE in-batch con peso 0,25 y una divergencia KL entre las distribuciones de ranking del estudiante y del profesor sobre positivos, negativos duros y candidatos in-batch con peso 0,75. En lotes de texto general se anaden una KL relacional sobre la matriz de similitudes y una proyeccion coseno al espacio de 5120 dimensiones del profesor de 14B.

El profesor de recuperacion es Gemini Embedding 2, cuyos logits de similitud (temperatura 0,02, calibrada a la confianza del profesor de 14B) son los objetivos en lotes de recuperacion; los negativos duros se minaron con Gemini. El otro profesor es F2LLM-v2-14B (temperatura 0,07). El entrenamiento tiene dos etapas de 5.000 pasos cada una: la primera sobre datos persas etiquetados por los profesores (pares consulta-pasaje derivados de Yalda, datos de tareas de F2LLM, un conjunto de dominios de noticias, medicina, ciencia y redes sociales, y texto web general); la segunda anade aproximadamente 285.000 grupos supervisados construidos a partir de los splits de entrenamiento de datasets de benchmark persas, con objetivos del profesor de 14B. Se usa learning rate 5e-6 con schedule coseno. El modelo final es la media uniforme de los checkpoints de la etapa 2 en los pasos 3000, 4000 y 5000, fusionada por pesos 75/25 con el modelo de la etapa 1.

En cuanto a higiene de datos, la model card afirma que se eliminaron de todos los datos de entrenamiento los 167.000 textos de todos los splits de evaluacion de las 52 tareas de MTEB(fas, v2) y 33.500 consultas de test de benchmark. El modelo no es zero-shot en las tareas cuyos splits de entrenamiento se usaron (lista explicita en la model card).

## Capacidades

- Generacion de embeddings de texto para similitud semantica y recuperacion de informacion en persa e ingles.
- Recuperacion consulta-pasaje (retrieval) con prompts especificos: `task: search result | query: ` para consultas y `title: none | text: ` para documentos.
- Clasificacion de texto mediante el prompt `task: classification | query: `.
- Clustering de textos con el prompt `task: clustering | query: `.
- Similitud semantica de frases (STS) y clasificacion de pares con `task: sentence similarity | query: `.
- Resumen (prompt `Summarization`) y mineria de bitextos.
- Soporte de truncamiento Matryoshka a 512, 256 y 128 dimensiones (heredado del modelo base, no reajustado).
- Compatible con Text Embeddings Inference (tag `text-embeddings-inference`) y con endpoints compatibles.
- No dispone de generacion de texto, tool calling, agentes, vision ni audio: es un modelo exclusivamente de embeddings.

## Casos de uso

- Busqueda semantica en corpus persas: indexar documentos con `encode_document` y consultar con `encode_query` para construir un motor de busqueda interna sobre noticias, documentacion o bases de conocimiento en farsi, aprovechando la mejora de retrieval del profesor Gemini Embedding 2.
- Sistemas RAG en persa: usar el modelo como recuperador en pipelines de generacion aumentada, con vectores de 768 dimensiones que caben comodamente en indices vectoriales (FAISS, Qdrant, pgvector) y un coste de inferencia bajo por su tamano de 0,3B.
- Clasificacion de tickets y mensajes de soporte: entrenar un clasificador ligero sobre los embeddings con el prompt de clasificacion para enrutar consultas de atencion al cliente en farsi por dominio o intencion.
- Deduplicacion y clustering de noticias: agrupar articulos o publicaciones de redes sociales por similitud coseno para detectar duplicados y temas, usando el prompt de clustering.
- Moderacion y analisis de sentimiento en redes sociales: los resultados por tipo de tarea (clasificacion 76,33; pair classification 85,38) lo hacen adecuado para tareas de analisis de tono, emocion y sentimiento en texto persa.
- Deteccion de parafrasis y plagio: comparar pares de frases con el prompt de similitud de frases para identificar reformulaciones en contenidos persas.
- Mineria de bitextos fa-en: alinear oraciones paralelas entre persa e ingles (bitext mining 77,01) para construir corpus de traduccion o evaluar sistemas de traduccion.
- Filtrado y recomendacion de contenido: calcular similitud entre perfiles de usuario y articulos en farsi para recomendadores semanticos.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre MTEB(fas, v2), 52 tareas, evaluados con `mteb` 2.10.12 en bf16:

| Modelo | Parametros | Mean(Task) | Mean(TaskType) | Borda rank |
|---|---:|---:|---:|---:|
| F2LLM-v2-14B | 14B | 73,94 | 76,30 | 1 |
| F2LLM-v2-8B | 8B | 73,04 | 75,25 | 2 |
| F2LLM-v2-4B | 4B | 72,07 | 74,34 | 3 |
| **RaahNaame-Koochik-v1** | **0,3B** | **71,54** | **74,02** | **4** |
| F2LLM-v2-1.7B | 1,7B | 70,39 | 72,94 | 5 |
| Hakim | 0,1B | 71,58 | 75,13 | 6 |
| F2LLM-v2-0.6B | 0,6B | 68,33 | 70,88 | – |
| EmbeddingGemma-300m (base) | 0,3B | 67,76 | 70,84 | – |

Desglose por tipo de tarea del modelo: clasificacion 76,33; clustering 70,08; clasificacion de pares 85,38; reranking 70,49; retrieval 60,07; STS 78,78; bitext mining 77,01.

El Borda rank se calcula entre los 32 modelos con resultados en las 52 tareas del repositorio publico `embeddings-benchmark/results`, segun computo propio del autor (noviembre de 2026); la tabla oficial puede filtrar modelos de forma distinta.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en fp16/bf16 (302,9M parametros) mas overhead de activaciones y tokenizador; en cuantizacion de 8 bits alrededor de 0,3-0,4 GB. El repo ocupa 1,3 GB por incluir pesos en precision completa.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060, RTX 4060 o superior es mas que suficiente. Para lotes grandes de indexacion conviene una A10, L4, A100 o H100 para maximizar throughput.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (GTX 1660, RTX 2060 en adelante) e incluso en CPU para volumenes moderados.
- Opciones de despliegue: sentence-transformers (referencia), Text Embeddings Inference (TGI para embeddings, tag presente en el repo), vLLM con soporte de embeddings, y exportacion a ONNX o CoreML (el autor mantiene otros repos con variantes CoreML fp16 de modelos propios).
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera un throughput alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Mean(Task) MTEB(fas, v2) | Idiomas | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| RaahNaame-Koochik-v1 | 0,3B | 71,54 | fa, en | Gemma Terms of Use | Hugging Face |
| EmbeddingGemma-300m (base) | 0,3B | 67,76 | multilingue | Gemma Terms of Use | Hugging Face (Google) |
| F2LLM-v2-1.7B | 1,7B | 70,39 | multilingue | no disponible en la informacion | Hugging Face (codefuse-ai) |
| F2LLM-v2-0.6B | 0,6B | 68,33 | multilingue | no disponible en la informacion | Hugging Face (codefuse-ai) |
| Hakim | 0,1B | 71,58 | fa (presumible) | no disponible en la informacion | Hugging Face |

Frente al modelo base, la mejora es de +3,78 puntos en Mean(Task) y +3,18 en Mean(TaskType) con el mismo coste de inferencia. Frente a F2LLM-v2-1.7B, un modelo casi seis veces mayor, supera en 1,15 puntos de media de tarea. Hakim, con 0,1B, obtiene una media de tarea ligeramente superior (71,58 frente a 71,54) pero peor en Mean(TaskType) (75,13 frente a 74,02), aunque su Borda rank es peor (6 frente a 4).

## Limitaciones y advertencias

- El modelo no es zero-shot en las tareas de MTEB(fas, v2) cuyos splits de entrenamiento se usaron (lista explicita en la model card), por lo que las cifras de benchmark pueden estar optimistas respecto a un uso en dominios totalmente nuevos.
- El alcance linguistico es persa e ingles; el rendimiento en otros idiomas no esta documentado y probablemente sea deficiente.
- El retrieval es la tarea mas debil del modelo (60,07), muy por debajo de STS (78,78) o clasificacion de pares (85,38).
- El truncamiento Matryoshka a 512/256/128 dimensiones esta heredado del modelo base pero no se reajusto durante el entrenamiento, por lo que la perdida de calidad con esas dimensiones no esta medida.
- Riesgo de sesgos: no se documenta analisis de sesgos; al entrenarse con datos persas de noticias, medicina, ciencia y redes sociales, puede heredar sesgos de esas fuentes.
- Riesgo de alucinacion: no aplica directamente al ser un modelo de embeddings, pero los sistemas RAG que lo usen heredan el riesgo de los generadores que recuperen.
- Licencia Gemma Terms of Use: el uso comercial esta permitido bajo esas condiciones, pero se deben respetar la Gemma Prohibited Use Policy y los requisitos de atribucion; es una licencia con restricciones de uso, no una licencia permisiva tipo Apache 2.0 o MIT.
- La longitud maxima de contexto no esta publicada en la informacion disponible; conviene verificar la del modelo base EmbeddingGemma-300m antes de indexar documentos largos.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Reza2kn/RaahNaame-Koochik-v1
- Modelo base: https://huggingface.co/google/embeddinggemma-300m
- Profesor F2LLM-v2-14B: https://huggingface.co/codefuse-ai/F2LLM-v2-14B
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Politica de uso prohibido de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
- Repositorio de resultados de MTEB: `embeddings-benchmark/results`
- Repos relacionados del autor (variantes CoreML): https://huggingface.co/Reza2kn/Shenava-Koochik-v1.0-CoreML-fp16
