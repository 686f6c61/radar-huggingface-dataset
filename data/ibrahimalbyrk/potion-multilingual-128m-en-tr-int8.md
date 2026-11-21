# ibrahimAlbyrk/potion-multilingual-128M-en-tr-int8

## Resumen

potion-multilingual-128M-en-tr-int8 es una copia podada y cuantizada del modelo de embeddings estáticos minishlab/potion-multilingual-128M, publicada por el usuario ibrahimAlbyrk. No se trata de un modelo generativo ni de un transformer profundo: es una tabla de embeddings por token (arquitectura model2vec) que produce vectores de 256 dimensiones mediante búsqueda directa en una matriz de pesos, sin paso de atención ni cómputo por capas. El modelo original lo desarrolla Minish Lab; esta versión es un derivado comunitario que conserva los pesos originales sin reentrenamiento.

La modificación principal consiste en dos operaciones. Primero, una poda de vocabulario que conserva únicamente los fragmentos (pieces) compuestos de ASCII, las letras turcas (ç ğ ı İ ö ş ü, además de â î û), puntuación, símbolos, emojis y todos los caracteres individuales de cualquier escritura; la tabla pasa de 500.353 a 234.823 filas, con remapeo de ids en tokenizer.json. Segundo, una cuantización a int8 con una escala por fila, almacenada en el tensor weights de model2vec. El resultado ocupa 70 MB en disco frente a los 531 MB del original en f32.

Su relevancia es de eficiencia: mantiene la similitud coseno con los vectores originales en 0,9999 o más para texto en inglés, turco y código, y reduce el tamaño del artefacto en un factor de aproximadamente 7,6. Está pensado para recuperación semántica de baja latencia en entornos con recursos limitados, no para generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | model2vec (embeddings estáticos por token, sin transformer ni atención) |
| Parametros totales | 60.349.511 (matriz de 234.823 x 256, más metadatos) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (los embeddings estáticos no tienen ventana de contexto definida; el pooling se aplica sobre los tokens de entrada) |
| Tipos de cuantizacion | int8 con una escala por fila (weights de model2vec); el original está en f32 |
| Idiomas soportados | en, tr (inglés y turco); el vocabulario conserva caracteres individuales de otras escrituras, pero la calidad fuera de en/tr es baja |
| Licencia | MIT |
| Formato de pesos | safetensors (carga mediante model2vec y model2vec-rs) |

## Arquitectura y entrenamiento

La arquitectura es model2vec: un modelo de embeddings estáticos que asigna un vector aprendido a cada token del vocabulario y agrega los vectores de la secuencia de entrada (pooling) para producir el embedding de la frase. No hay capas de atención, ni FFN, ni cómputo dependiente de la longitud más allá del propio pooling, lo que sitúa la inferencia en el orden de microsegundos por frase en CPU. El modelo base minishlab/potion-multilingual-128M fue entrenado por Minish Lab; esta copia no introduce reentrenamiento alguno y conserva los pesos del original (revisión 73908c3438cf03b6a01bcb9611d62b23d0726f08).

Las transformaciones aplicadas son puramente de compresión. La poda del vocabulario elimina los pieces que no cumplen los criterios de conservación (ASCII, letras turcas, puntuación, símbolos, emojis y caracteres individuales de cualquier escritura), de modo que el texto en inglés, turco y código se segmenta en los mismos pieces que en el original y, antes de la cuantización, sus vectores son idénticos bit a bit. La cuantización int8 con escala por fila se almacena en el tensor weights de model2vec y produce vectores con similitud coseno de 0,9999 o superior respecto a los f32. No se aplicaron técnicas de RLHF, DPO ni decodificación especulativa, ya que no es un modelo generativo.

## Capacidades

- Generación de embeddings de frases y documentos para búsqueda semántica y recuperación (retrieval).
- Codificación de texto en inglés y turco con segmentación idéntica a la del modelo original en esos idiomas.
- Codificación de código fuente, ya que el vocabulario conserva los pieces ASCII.
- Similitud semántica y clustering sobre vectores de 256 dimensiones.
- Inferencia en CPU con latencia muy baja, apta para servicios de alto QPS.
- Carga nativa en Python mediante model2vec y en Rust mediante model2vec-rs.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking: no es un modelo generativo.
- Capacidad multilingüe limitada a en y tr; otras escrituras se codifican carácter a carácter con degradación severa.

## Casos de uso

- Búsqueda semántica en aplicaciones móviles o edge: el artefacto de 70 MB y la inferencia sin atención permiten ejecutar el modelo en dispositivos con poca memoria y sin GPU, sirviendo resultados de recuperación en milisegundos.
- Motor de recuperación en pipelines RAG de bajo coste: se usa como primer nivel de retrieval sobre un índice vectorial de 256 dimensiones, filtrando candidatos antes de un reranker más pesado; la reducción de 531 MB a 70 MB abarata el despliegue en contenedores.
- Deduplicación y clustering de documentos en inglés y turco: los embeddings permiten agrupar notas, tickets o artículos por similitud coseno con un coste de cómputo mínimo por documento.
- Clasificación de texto por vecino más cercano: con un conjunto etiquetado pequeño, se asignan categorías a nuevos textos comparando su embedding con los de referencia, sin entrenar un clasificador.
- Búsqueda sobre código y documentación técnica: al conservar los pieces ASCII, el modelo indexa fragmentos de código y permite recuperar funciones o snippets por similitud semántica.
- Filtrado de contenido y moderación asistida: comparación de mensajes contra una lista de patrones o ejemplos etiquetados mediante similitud de embeddings, adecuado para volúmenes altos en inglés y turco.
- Indexación de soporte al cliente bilingüe (en/tr): recuperación de artículos de ayuda o respuestas previas a partir de la consulta del usuario, con la salvedad de que fuera de en/tr la calidad cae.

## Benchmarks y rendimiento

El autor publica una única medición propia, no estandarizada: un test de recuperación con 364 situaciones inventadas en el que una consulta debe recuperar la nota correcta entre 177 candidatas (recall@3). Esta copia obtuvo el mismo resultado que el original: 294 de 300 casos en los que consulta y nota comparten palabras, y 23 de 64 en los que no comparten ninguna (los 64 incluyen consultas en un idioma para notas en el otro). El autor advierte que el test es pequeño y demuestra ausencia de pérdida en ese conjunto, no igualdad en otros datos.

| Metrica | Original (f32) | Esta copia (int8) |
|---|---|---|
| Recall@3, consultas con solapamiento léxico | 294/300 | 294/300 |
| Recall@3, consultas sin solapamiento léxico | 23/64 | 23/64 |
| Similitud coseno media con vectores originales (en/tr/código) | 1,0000 | >= 0,9999 |
| Tamano en disco | 531 MB | 70 MB |
| Filas x dimensiones | 500.353 x 256 | 234.823 x 256 |

No se han publicado resultados de benchmarks estándar (MMLU, MTEB, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB en GPU; el modelo opera en CPU y el artefacto en memoria ronda los 70-100 MB.
- GPU recomendadas: no requiere GPU; cualquier CPU moderna es suficiente. En caso de forzar GPU, cualquier tarjeta con más de 1 GB de memoria libre puede alojarlo, pero no aporta ventaja significativa frente a CPU.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, integradas) y en dispositivos de borde; el cuello de botella es la memoria del sistema, no la VRAM.
- Opciones de despliegue: model2vec (Python) y model2vec-rs (Rust); no es compatible con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos generativos.
- Latencia y throughput: no se han publicado cifras concretas en la información disponible; por la arquitectura (búsqueda en tabla y pooling, sin atención) la latencia por frase es del orden de microsegundos a pocos milisegundos en CPU, muy por debajo de un transformer del mismo tamaño nominal.

## Comparativa con modelos similares

| Modelo | Parametros / tabla | Dimensiones | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| ibrahimAlbyrk/potion-multilingual-128M-en-tr-int8 | 234.823 x 256, int8 | 256 | no disponible | en, tr | MIT | safetensors (model2vec) |
| minishlab/potion-multilingual-128M (original) | 500.353 x 256, f32 | 256 | no disponible | multilingüe | MIT | safetensors (model2vec) |
| Modelos sentence-transformers tipo MiniLM (p. ej., all-MiniLM-L6-v2) | transformer de ~22M parámetros | 384 | 256-512 tokens | principalmente en | Apache-2.0 | safetensors, ONNX |
| Modelos de embeddings multilingües tipo paraphrase-multilingual-MiniLM | transformer de ~118M parámetros | 384 | 128-512 tokens | multilingüe | Apache-2.0 | safetensors |

Frente a los sentence-transformers basados en transformer, esta copia sacrifica cobertura lingüística y capacidad de modelar contexto (no hay atención) a cambio de un artefacto 5-10 veces menor y una latencia muy inferior en CPU. Frente al original de Minish Lab, reduce el tamaño en disco aproximadamente 7,6 veces con una pérdida de similitud coseno inferior a 0,0001 en en/tr/código, pero pierde calidad en el resto de idiomas.

## Limitaciones y advertencias

- Solo inglés y turco: el texto en otras escrituras se codifica carácter a carácter y la similitud con el vector del original es baja (ruso en torno a 0,27 de coseno; japonés en torno a 0,08).
- El texto latino con acentos distintos de los turcos pierde sus pieces más largos; por ejemplo, "café naïve résumé" queda en torno a 0,56 de similitud con el original.
- Hereda todas las limitaciones del modelo original: lo que el original no hace bien, esta copia tampoco.
- No es un modelo generativo: no produce texto, no razona, no soporta tool calling ni agentes; usarlo para esas tareas es un error de categoría.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de falsos positivos en recuperación cuando las consultas no comparten vocabulario con los documentos.
- La licencia MIT permite uso comercial, pero el crédito del modelo corresponde a Minish Lab; esta copia es una poda y cuantización de sus pesos, no un trabajo original.
- El test de recuperación publicado es pequeño (364 situaciones) y no constituye evidencia de equivalencia en dominios distintos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria de su comportamiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ibrahimAlbyrk/potion-multilingual-128M-en-tr-int8
- Modelo base: https://huggingface.co/minishlab/potion-multilingual-128M
- Organización Minish Lab: https://huggingface.co/minishlab
- Librería model2vec (Python): https://github.com/MinishLab/model2vec
- Librería model2vec-rs (Rust): https://github.com/MinishLab/model2vec-rs
