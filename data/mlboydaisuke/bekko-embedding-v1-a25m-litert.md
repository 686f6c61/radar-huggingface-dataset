# mlboydaisuke/bekko-embedding-v1-a25m-LiteRT

## Resumen

`mlboydaisuke/bekko-embedding-v1-a25m-LiteRT` es una conversión a LiteRT (formato `.tflite`) del modelo de embeddings multilingüe `hotchpotch/bekko-embedding-v1-a25m`, desarrollado por el usuario mlboydaisuke. El modelo original, creado por hotchpotch, es un modelo ultracompacto de recuperación semántica que emplea una arquitectura basada en ModernBERT con 123 millones de parámetros totales, de los cuales solo 25 millones son activos por token (el resto corresponde a la tabla de embeddings). Esta versión LiteRT está pensada para inferencia en dispositivos edge (móviles, IoT, navegadores) sin conexión, manteniendo una calidad de recuperación comparable a modelos con 3-10 veces más parámetros activos.

La conversión integra dentro del grafo el mean pooling y la normalización L2, de modo que una única llamada produce el vector final listo para usar. No requiere prefijos `query:`/`passage:` (el modelo se entrena sin ellos). Se ofrecen dos variantes cuantizadas: `wi8fc` (int8 de rango dinámico sobre la tabla de embeddings y las capas fully connected) y `embt8` (solo la tabla de embeddings en int8, cómputo en float). Ambas son prácticamente idénticas en calidad a la referencia PyTorch, con una pérdida máxima de 0.003 en similitud coseno. El contexto máximo en esta versión es de 512 tokens (el original soporta 8192), suficiente para la mayoría de tareas de recuperación en dispositivo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder) |
| Parametros totales | 123 millones |
| Parametros activos | 25 millones por token (el resto es la tabla de embeddings) |
| Longitud de contexto | 512 tokens (firmas estáticas de 64/128/256/512) |
| Tipos de cuantizacion | int8 dynamic-range (wi8fc) y int8 solo tabla de embeddings (embt8) |
| Idiomas soportados | Multilingüe (100+ idiomas, fuerte en japones) |
| Licencia | MIT |
| Formato de pesos | TFLite / LiteRT (`.tflite`) |

## Arquitectura y entrenamiento

El modelo base `bekko-embedding-v1-a25m` emplea una arquitectura transformer encoder (ModernBERT) con un diseño de parámetros activos (Active Parameters, AP) como eje de eficiencia. De los 123M parámetros totales, solo 25M se activan por token; el resto corresponde a la tabla de embeddings, que no participa en el cómputo por token. Esta técnica, descrita en el paper "Bekko Embedding: Parameter-Efficient Multilingual Retrieval" (arXiv:2607.25180), permite reducir drásticamente el coste de inferencia sin sacrificar calidad de recuperación.

La versión LiteRT conserva la arquitectura y el comportamiento del modelo original, pero añade dentro del grafo las operaciones de mean pooling (sobre posiciones válidas) y normalización L2. Además, el padding se enmascara completamente, de modo que la salida es idéntica independientemente de la firma (64/128/256/512) utilizada. El modelo soporta truncación Matryoshka: se pueden tomar los primeros 256, 128 o 64 componentes del vector y re-normalizar, con una pérdida mínima (verificado en JSTS). No se dispone de información pública sobre el dataset de entrenamiento ni sobre el proceso de optimización (RLHF/DPO), por lo que esos datos se consideran no disponibles.

## Capacidades

- Generación de embeddings de texto multilingüe (100+ idiomas, con especial fortaleza en japonés).
- Recuperación semántica y RAG: produce vectores de 384 dimensiones normalizados L2, listos para similitud coseno (producto escalar).
- Truncación Matryoshka: permite reducir la dimensionalidad a 256/128/64 con re-normalización, manteniendo buena calidad.
- Inferencia totalmente en CPU y sin conexión, gracias a LiteRT/TFLite.
- Sin necesidad de prefijos `query:`/`passage:`; codifica texto plano en ambos lados.
- Integración sencilla con el tokenizer de `transformers` y el intérprete `ai_edge_litert`.
- Compatible con firmas estáticas de 64, 128, 256 y 512 tokens, con salida `float32 [1, 384]`.

## Casos de uso

- Búsqueda semántica en aplicaciones móviles offline: permite indexar documentos locales y buscar por similitud sin conexión, gracias al tamaño reducido (142 MB) y a la inferencia en CPU.
- RAG en dispositivos edge: asistentes personales o chatbots que necesitan recuperar información de una base de conocimiento local sin depender de servidores.
- Clasificación de textos multilingüe: usando los embeddings como características para un clasificador ligero (regresión logística, SVM) en entornos con recursos limitados.
- Deduplicación de documentos: comparar embeddings para detectar duplicados o casi-duplicados en colecciones grandes, aprovechando la normalización L2 y la velocidad de cómputo.
- Sistemas de recomendación basados en similitud: recomendar artículos, productos o contenidos según la proximidad coseno entre embeddings.
- Análisis de sentimiento en varios idiomas: entrenar un clasificador simple sobre los embeddings generados por el modelo, que soporta 100+ idiomas.
- Indexado y consulta de FAQs en dispositivos embebidos: responder preguntas frecuentes recuperando la respuesta más similar desde una base de pares pregunta-respuesta.

## Benchmarks y rendimiento

La model card reporta evaluaciones de calidad frente a la referencia PyTorch fp32, así como medidas de velocidad y memoria. No se han publicado comparativas con otros modelos de embeddings en esta información.

**Calidad (JSTS, Spearman, 300 pares)**

| Variante | 384 dims | 256 | 128 | 64 |
|---|---|---|---|---|
| PyTorch fp32 | 0.8175 | 0.8169 | 0.8190 | 0.8178 |
| wi8fc | 0.8179 | 0.8174 | 0.8192 | 0.8173 |
| embt8 | 0.8175 | 0.8167 | 0.8189 | 0.8176 |

**Recuperación (JSQuAD, 150 preguntas, corpus de 800 párrafos)**

| Variante | nDCG@10 | hit@1 |
|---|---|---|
| PyTorch fp32 | 0.9179 | 0.840 |
| wi8fc | 0.9310 | 0.873 |
| embt8 | 0.9179 | 0.840 |

**Recuperación cruzada (documentos con PyTorch, consultas con int8)**

| Configuración | nDCG@10 |
|---|---|
| Todo PyTorch (control) | 0.9179 |
| PyTorch + wi8fc | 0.9186 |

**Multilingüe (STS17, Spearman, 100 pares por par, variante wi8fc)**

| Par | Valor |
|---|---|
| en-en | 0.886 |
| ko-ko | 0.885 |
| es-en | 0.767 |
| en-ar | 0.733 |

**Velocidad (CPU/XNNPACK, mediana de 10 ejecuciones, firmas al 75% de capacidad)**

| Variante | Máquina | embed_128 | embed_512 |
|---|---|---|---|
| wi8fc | M4 Max Mac, 16 hilos | 23 ms | 36 ms |
| embt8 | M4 Max Mac, 16 hilos | 23 ms | 38 ms |

**Memoria (pico de RAM al cargar las 4 firmas)**

| Variante | Pico RAM |
|---|---|
| wi8fc | 225 MiB |
| embt8 | 575 MiB |

## Requisitos de hardware

- No requiere GPU; funciona exclusivamente en CPU (XNNPACK).
- Pico de RAM: 225 MiB para la variante wi8fc y 575 MiB para embt8 (con las cuatro firmas cargadas).
- GPU recomendadas: ninguna, aunque se podría ejecutar en GPUs mediante TFLite con delegados, pero no está documentado.
- Compatible con dispositivos edge: móviles (Android/iOS), Raspberry Pi, microcontroladores con soporte TFLite.
- Opciones de despliegue: LiteRT (`ai_edge_litert`), también se puede usar con el runtime TFLite estándar.
- Latencia: 23-38 ms por consulta en un M4 Max para longitudes de 128 y 512 tokens, respectivamente.
- Tamaño del archivo: 142 MB (wi8fc) y 214 MB (embt8).

## Comparativa con modelos similares

No se dispone de benchmarks comparativos con otros modelos de embeddings en la información proporcionada. Sin embargo, se puede comparar con el modelo base original y con la versión a8m del mismo autor, así como con la versión GGUF.

| Modelo | Parámetros activos | Contexto | Formato | Licencia |
|---|---|---|---|---|
| bekko-embedding-v1-a25m (original) | 25M | 8192 | PyTorch/ONNX/OpenVINO | MIT |
| bekko-embedding-v1-a25m-LiteRT (wi8fc) | 25M | 512 (estático) | TFLite | MIT |
| bekko-embedding-v1-a25m-GGUF | 25M | 8192 | GGUF | MIT |
| bekko-embedding-v1-a8m | 8M | 8192 | PyTorch/ONNX | MIT |

La versión LiteRT sacrifica contexto (512 vs 8192) a cambio de una inferencia en dispositivo más ligera. La variante wi8fc muestra incluso una ligera mejora en JSQuAD respecto a la referencia PyTorch (probablemente debido a la submuestra del corpus), mientras que embt8 es prácticamente idéntica.

## Limitaciones y advertencias

- Contexto máximo de 512 tokens en esta versión; textos más largos deben trocearse y agregarse (por ejemplo, promediando o tomando el máximo de los embeddings).
- El intérprete LiteRT empaqueta todas las firmas al crear el objeto, lo que incrementa el pico de memoria aunque solo se use una firma. La variante wi8fc es la más eficiente en RAM.
- No se incluye una variante fp16 porque XNNPACK expande los pesos a fp32, lo que dispararía el uso de memoria (2.4 GiB).
- Al ser un modelo de embeddings, no genera texto; el riesgo de alucinación se limita a posibles errores en la representación semántica de textos ambiguos o fuera del dominio de entrenamiento.
- No se han publicado detalles sobre sesgos específicos del modelo, pero al ser multilingüe puede reflejar sesgos presentes en los datos de entrenamiento.
- La licencia MIT permite uso comercial sin restricciones, pero se recomienda verificar los términos del modelo base original.
- La calidad de recuperación puede degradarse en dominios muy especializados o con vocabulario técnico no presente en el entrenamiento.

## Enlaces

- Modelo LiteRT en Hugging Face: https://huggingface.co/mlboydaisuke/bekko-embedding-v1-a25m-LiteRT
- Modelo base original: https://huggingface.co/hotchpotch/bekko-embedding-v1-a25m
- Paper (arXiv): https://arxiv.org/html/2607.25180
- Versión GGUF: https://huggingface.co/hotchpotch/bekko-embedding-v1-a25m-GGUF
- Página en Ollama: https://ollama.com/hotchpotch/bekko-embedding-v1-a25m
