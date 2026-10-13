# aliRafik/embeddinggemma_300m_finetuned_16bit

## Resumen

`aliRafik/embeddinggemma_300m_finetuned_16bit` es un ajuste fino del modelo de embeddings EmbeddingGemma-300m de Google (base `unsloth/embeddinggemma-300m`), publicado por el usuario aliRafik en HuggingFace. EmbeddingGemma procede de la familia Gemma 3, con inicialización heredada de T5Gemma y la misma tecnología de investigación usada en los modelos Gemini, y está diseñado especificamente para generar representaciones densas de frases y documentos.

El modelo conserva la arquitectura `gemma3_text` del original y cuenta con 302.863.104 parámetros (datos reales de safetensors), lo que lo sitúa en la gama de embeddings pequenos pero de alto rendimiento para su tamano. Se ha reentrenado sobre un dataset de 100.000 ejemplos (etiqueta `dataset_size:100000` en la model card) empleando la función de pérdida `MultipleNegativesRankingLoss`, el esquema habitual en Sentence Transformers para tareas de similitud y recuperación.

Es relevante porque ofrece una alternativa afinada y lista para `sentence-transformers`/Text Embeddings Inference, con métricas declaradas de alto recall en recuperación (0,9886 de Recall@10) y compatibilidad directa con pipelines de RAG, busqueda semántica y clustering, sin necesidad de GPU de gran capacidad. No obstante, el autor no declara licencia, idiomas soportados ni el dataset exacto de entrenamiento, lo que condiciona su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder `gemma3_text` (base EmbeddingGemma-300m, derivada de Gemma 3 con inicialización T5Gemma) |
| Parametros totales | 302.863.104 (dato real de safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Pesos en 16 bits (safetensors) en este fine-tune; cuantizaciones GGUF disponibles para el modelo base en la coleccion ggml-org |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el modelo base pertenece a la familia Gemma; el autor no declara licencia propia) |
| Formato de pesos | safetensors |
| Libreria | sentence-transformers |
| Tarea (pipeline) | sentence-similarity / feature-extraction |
| Dim. de embedding | no disponible en la informacion proporcionada |
| Tamano del repositorio | 1,3 GB |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia Gemma 3 (`gemma3_text`) reutilizado como generador de embeddings densos. Partiendo del checkpoint `unsloth/embeddinggemma-300m`, el ajuste fino mantiene intacta la arquitectura y modifica los pesos mediante aprendizaje supervisado sobre pares de frases. La técnica de entrenamiento declarada es `MultipleNegativesRankingLoss` (MNR), una pérdida contrastiva que trata los ejemplos negativos dentro del mismo lote como negativos implícitos, muy usada para similitud semántica y recuperación. Esto indica que el entrenamiento se realizó con tripletes o pares positivos (query-documento o frase-frase) sin necesidad de negativos explícitos.

El conjunto de entrenamiento consta de 100.000 ejemplos, aunque no se especifica su composicion ni su dominio. Los ejemplos del widget de la model card (textos biomédicos sobre miocitos cardíacos y cetoacidosis diabética) sugieren un posible sesgo temático hacia literatura científica, pero no hay confirmación de que ese sea el corpus de entrenamiento. No se documentan fases de RLHF, DPO ni otras innovaciones técnicas (decodificación especulativa, atención lineal, etc.); se trata de un ajuste fino estándar dentro del ecosistema Sentence Transformers.

## Capacidades

- Generacion de embeddings densos de frases, parrafos y documentos (feature-extraction).
- Calculo de similitud semántica entre pares de textos (pipeline `sentence-similarity`).
- Recuperacion de informacion (information retrieval) mediante similitud coseno.
- Compatible con `sentence-transformers` para uso directo en pipelines de codificacion.
- Compatible con Text Embeddings Inference (etiquetas `text-embeddings-inference` y `endpoints_compatible`), lo que permite desplegarlo como endpoint HTTP.
- Reutilizable como componente en sistemas RAG, busqueda semantica y deduplicacion.
- No es un modelo generativo: no produce texto, codigo ni razonamiento paso a paso.
- Soporte de tool calling / function calling: no disponible (no es un LLM generativo).
- Capacidades multilingues: no disponible.
- Capacidades de vision o audio: no disponibles en este fine-tune (las etiquetas solo incluyen `gemma3_text`).

## Casos de uso

- Busqueda semantica en documentacion tecnica: indexar manuales y APIs en una base vectorial y recuperar fragmentos relevantes a partir de consultas en lenguaje natural, usando similitud coseno sobre los embeddings de 302M parámetros.
- Sistema RAG (Retrieval-Augmented Generation): emplear el modelo como recuperador de contexto para alimentar a un LLM generativo, aprovechando sus altas métricas de Recall@5 y Recall@10 (0,9769 y 0,9886) para maximizar la cobertura de documentos relevantes.
- Deduplicacion y agrupamiento de contenido: generar embeddings de articulos, tickets o registros y aplicar clustering o comparacion por umbral para detectar duplicados o temas similares.
- Clasificacion de textos por similitud: etiquetar correos, noticias o incidencias comparando su embedding con el de prototipos de cada categoria, sin necesidad de entrenar un clasificador supervisado.
- Moderacion y filtrado de contenido: comparar mensajes entrantes con embeddings de referencia de contenido no deseado para marcar candidatos a revision.
- Motor de recomendacion basado en contenido: representar items y preferencias del usuario en el mismo espacio vectorial y recomendar articulos con mayor similitud coseno.
- Busqueda de respuestas frecuentes (FAQ): emparejar la consulta del usuario con la pregunta mas parecida de una base de conocimiento, devolviendo la respuesta asociada.
- Investigacion bibliografica: recuperar articulos cientificos afines, dado que los ejemplos de la model card apuntan a texto biomedico, aunque el dominio real de entrenamiento no está confirmado.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (tarea: recuperacion de informacion; dataset: "Unknown"; metricas marcadas como no verificadas):

| Metrica | Valor |
|---|---|
| Cosine Accuracy@1 | 0,8752 |
| Cosine Accuracy@3 | 0,9603 |
| Cosine Accuracy@5 | 0,9769 |
| Cosine Accuracy@10 | 0,9886 |
| Cosine Precision@1 | 0,8752 |
| Cosine Precision@3 | 0,3201 |
| Cosine Precision@5 | 0,1954 |
| Cosine Precision@10 | 0,0989 |
| Cosine Recall@1 | 0,8752 |
| Cosine Recall@3 | 0,9603 |
| Cosine Recall@5 | 0,9769 |
| Cosine Recall@10 | 0,9886 |
| Cosine NDCG@10 | 0,9370 |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, MTEB, etc.), ni comparativas con otros modelos de embeddings. Las metricas anteriores proceden unicamente del `model-index` del autor y no estan verificadas.

## Requisitos de hardware

- VRAM para inferencia en 16 bits: aproximadamente 0,6-0,7 GB solo para los pesos (302,9M parametros x 2 bytes), mas overhead de activaciones; en la practica suele requerir entre 1 y 2 GB de VRAM.
- VRAM en cuantizacion de 8 bits: en torno a 0,3-0,4 GB de pesos, con requisitos totales por debajo de 1 GB.
- GPU recomendadas: cualquier GPU moderna sirve para inferencia; RTX 3060, RTX 4090, A10, L4, A100 o H100 funcionan sin problema (el modelo es muy pequeno para estos aceleradores).
- Cabe holgadamente en GPU de consumo: si, en cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 2060, RTX 3060, etc.). También es viable en CPU para cargas moderadas.
- Opciones de despliegue: `sentence-transformers`, Text Embeddings Inference (TEI), llama.cpp / Ollama mediante las versiones GGUF del modelo base, y servidores compatibles con la API de embeddings de HuggingFace.
- Latencia y throughput: no disponible en la informacion proporcionada; no se han publicado mediciones de latencia ni de embeddings por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| aliRafik/embeddinggemma_300m_finetuned_16bit | 302,9M | no disponible | no disponible | HuggingFace (safetensors) | Fine-tune con MNR sobre 100k ejemplos; metricas declaradas no verificadas |
| unsloth/embeddinggemma-300m (modelo base) | ~300M | no disponible | familia Gemma | HuggingFace (safetensors, GGUF via ggml-org) | Base oficial de EmbeddingGemma; sobre el se aplica este ajuste fino |
| EmbeddingGemma-300m (Google) | 300M | no disponible en la busqueda | terminos de uso de Gemma | HuggingFace, documentacion Google AI/DeepMind | Modelo abierto de embeddings de Google, construido sobre Gemma 3 con inicializacion T5Gemma |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada, por lo que no es posible establecer una jerarquia de rendimiento objetiva. Los modelos alternativos mas habituales en la misma categoria (por ejemplo, all-MiniLM-L6-v2 o bge-small) no aparecen en los resultados de busqueda, por lo que sus datos no se incluyen para no inventar cifras.

## Limitaciones y advertencias

- Licencia no declarada: el autor no especifica licencia en la model card ni en los metadatos de HuggingFace, por lo que el uso comercial es incierto y requiere verificacion previa. El modelo base pertenece a la familia Gemma, sujeta a sus propios terminos de uso.
- Modelo no generativo: no produce texto, codigo ni razonamiento; solo genera embeddings. No debe usarse como chatbot ni como LLM.
- Idiomas no especificados: se desconoce si soporta castellano u otros idiomas; el uso multilingue no puede darse por garantizado.
- Origen de los datos no documentado: se desconoce la composicion, idioma y dominio del dataset de 100.000 ejemplos, lo que impide anticipar sesgos tematicos o de genero.
- Metricas sin verificar: todos los resultados del `model-index` estan marcados con `verified: false` y el dataset de evaluacion figura como "Unknown", por lo que las cifras deben tratarse con cautela.
- Riesgo de alucinacion de similitud: al ser un modelo de embeddings, puede asignar alta similitud a textos semanticamente distintos en dominios fuera de su distribucion de entrenamiento, generando recuperaciones irrelevantes.
- Contexto limitado: no se ha confirmado la longitud maxima de entrada; en modelos de este tamano suele ser corta, lo que limita su uso con documentos largos sin troceado previo.
- Sin historial de adopcion: el repositorio registra 0 descargas y 0 "likes", por lo que no cuenta con validacion de la comunidad ni casos de uso publicos.
- Reproducibilidad: no se publican hiperparametros de entrenamiento ni la semilla, lo que dificulta reproducir el ajuste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aliRafik/embeddinggemma_300m_finetuned_16bit
- Perfil del autor: https://huggingface.co/aliRafik
- Modelo base: https://huggingface.co/unsloth/embeddinggemma-300m
- EmbeddingGemma model card (Google AI for Developers): https://ai.google.dev/gemma/docs/embeddinggemma/model_card
- Guia de ajuste fino de EmbeddingGemma con Sentence Transformers: https://ai.google.dev/gemma/docs/embeddinggemma/fine-tuning-embeddinggemma-with-sentence-transformers
- EmbeddingGemma en Google DeepMind: https://deepmind.google/models/gemma/embeddinggemma/
- Coleccion de versiones GGUF de EmbeddingGemma 300M (ggml-org): https://huggingface.co/collections/ggml-org/embeddinggemma-300m-68b2a87d78ca52408f7918f3
- Paper referenciado (arXiv 1908.10084): https://arxiv.org/abs/1908.10084
- Paper referenciado (arXiv 1807.03748): https://arxiv.org/abs/1807.03748
