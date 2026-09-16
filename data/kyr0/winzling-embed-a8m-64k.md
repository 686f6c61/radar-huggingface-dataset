# kyr0/Winzling-Embed-a8m-64k

## Resumen

Winzling-Embed-a8m-64k es un modelo de embeddings de texto (feature extraction / sentence similarity) desarrollado por el usuario kyr0 a partir de `hotchpotch/bekko-embedding-v1-a8m`. Se trata de un encoder denso de tipo mmBERT / ModernBERT de 4 capas y 384 dimensiones, cuyo vocabulario multilingüe original de 256.000 tokens se ha recortado a 65.536 tokens seleccionados específicamente para alemán, inglés y ruso. El transformer se exporta a ONNX con pesos UINT4 asimétricos y la tabla de embeddings de tokens en INT8 por filas.

El problema que resuelve es el despliegue de recuperación semántica multilingüe en entornos con recursos muy limitados: el grafo ONNX ocupa 29,1 MiB en disco (26,4 MiB comprimido con zstd nivel 19) y conserva 7.671.168 parámetros activos del transformer original. Frente a los 105.975.168 parámetros totales del modelo base, la reducción es del 69,0 %, y la mayor parte proviene de eliminar filas del vocabulario innecesarias para el conjunto de idiomas seleccionado, no de podar el encoder.

Es relevante porque demuestra que la especialización de vocabulario más la cuantización agresiva permiten llevar un modelo de embeddings multilingüe a dispositivos de borde, asumiendo una pérdida medible de calidad: 54,979 de media en una suite de regresión fija de 10 tareas de/en/ru, frente a 61,887 del Bekko a8m original de 256k. No hay que confundir esa cifra con la puntuación oficial del benchmark MMTEB Multilingual v2.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder tipo mmBERT / ModernBERT (transformer denso), 4 capas, dimensión oculta/embedding 384 |
| Parámetros totales | 32.836.992 (original: 105.975.168; reducción del 69,0 %) |
| Longitud de contexto | 8.192 tokens de entrada |
| Tipos de cuantización | Transformer: UINT4 asimétrica (`MatMulNBits`, block size 32); tabla de embeddings de tokens: INT8 por filas; existe variante FP32 sin cuantizar |
| Idiomas soportados | Alemán (`de`), inglés (`en`), ruso (`ru`) |
| Licencia | MIT |
| Formato de pesos | ONNX (`onnx/model_uint4.onnx`, 29,1 MiB; 26,4 MiB como `.onnx.zst` con zstd-19) y safetensors para la variante FP32 |
| Dimensión de embedding | 384 |
| Vocabulario | 65.536 tokens (original: 256.000) |
| Pooling | Mean pooling |
| Similitud | Coseno |
| Prefijos de consulta/documento | Ninguno |
| Parámetros activos del transformer | 7.671.168 (sin cambios respecto al modelo base) |
| Descomposición del recuento | 65.536 × 384 = 25.165.824 (tabla de tokens) + 7.671.168 (transformer) = 32.836.992 |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer denso de estilo ModernBERT (denominado mmBERT en la documentación) con 4 capas y dimensión oculta de 384. La linaje documentado es: `mmBERT-small` → poda estructural → `hotchpotch/mmBERT-L4H384-pruned` → entrenamiento de embeddings → `hotchpotch/bekko-embedding-v1-a8m` → recorte de vocabulario selectivo por idioma (de/en/ru, 65.536 tokens) → `Winzling-Embed-a8m-64k` FP32 → cuantización INT8 de la tabla de tokens y UINT4 de los pesos MatMul.

La transformación aplicada por Winzling no incluye entrenamiento basado en gradientes ni fine-tuning: es exclusivamente un recorte de vocabulario seguido de exportación y cuantización. El encoder no se poda en ninguna etapa; el ahorro de tamaño procede casi por completo de la eliminación de filas del vocabulario. Los pesos del transformer se exportan con cuantización asimétrica UINT4 por bloques de tamaño 32, mientras que la tabla de embeddings de tokens se mantiene en INT8 por filas para preservar mejor la representación léxica.

La validación de la exportación frente al modelo FP32 recortado reporta una similitud coseno media de 0,989615 y un peor caso de 0,986063. El modelo no usa prefijos de consulta ni de documento, usa mean pooling y similitud coseno, y hereda del modelo base una longitud máxima de secuencia de 8.192 tokens. No se documentan en la información disponible detalles sobre el dataset de entrenamiento original de Bekko (número de tokens, composición, uso de RLHF/DPO), ya que ese entrenamiento corresponde al modelo base, no a esta transformación.

## Capacidades

- Generación de embeddings de frases y pasajes de 384 dimensiones, normalizables, para similitud coseno.
- Recuperación semántica (retrieval) monolingüe y cross-lingüe dentro del conjunto de idiomas soportado: de, en, ru.
- Búsqueda semántica sobre corpus largos: soporta entradas de hasta 8.192 tokens, lo que permite indexar documentos de tamaño medio sin troceado agresivo.
- Clasificación y agrupamiento de textos (clustering, deduplicación, detección de near-duplicates) mediante similitud coseno.
- Funciona como extractor de características (`feature-extraction`) para pipelines posteriores.
- Inferencia en CPU y en dispositivos de borde gracias al grafo ONNX cuantizado de 29,1 MiB.
- Compatibilidad declarada con Text Embeddings Inference y con endpoints de Hugging Face (etiquetas `text-embeddings-inference` y `endpoints_compatible`).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio, modo de pensamiento ni decodificación especulativa.
- El tokenizador conserva los mecanismos de respaldo, por lo que otros idiomas pueden tokenizarse y producir un embedding, pero la calidad semántica fuera de de/en/ru no está validada.

## Casos de uso

- Búsqueda semántica en aplicaciones de escritorio o móviles: con 29,1 MiB de grafo ONNX y 384 dimensiones por vector, el índice de embeddings cabe en memoria de un dispositivo de usuario y permite búsqueda local sin enviar datos a un servidor.
- Atención al cliente multilingüe de/en/ru: el modelo vectoriza consultas y artículos de base de conocimiento en los tres idiomas soportados y permite enrutar tickets por similitud coseno con el histórico de casos resueltos.
- Deduplicación y agrupamiento de corpus multilingües: al soportar entradas de hasta 8.192 tokens, se pueden procesar documentos completos de tamaño medio y agruparlos por similitud sin depender de solapamiento entre fragmentos.
- Recuperación aumentada (RAG) en despliegues de borde: el modelo puede actuar como recuperador local en un pipeline RAG donde el generador se ejecuta en el servidor, reduciendo el coste de enviar documentos completos a la nube.
- Filtrado y moderación de contenido en pipelines de ingesta: la similitud con un conjunto de ejemplos etiquetados permite clasificar textos de entrada en alemán, inglés y ruso antes de que entren al sistema principal.
- Indexación offline en dispositivos sin GPU: la variante UINT4 con `CPUExecutionProvider` permite construir índices vectoriales en un portátil o en un servidor sin acelerador, útil para procesamiento batch nocturno.
- Sistemas de memoria de agentes con presupuesto de recursos ajustado: usar un modelo de 29 MiB para decidir qué recuerdos recuperar deja la mayor parte de la memoria del sistema al modelo generador.
- Prototipado rápido de aplicaciones de similitud de frases: al no usar prefijos de consulta o documento y usar mean pooling estándar, la integración con `sentence-transformers` no requiere plantillas específicas.

## Benchmarks y rendimiento

El autor publica resultados sobre una suite de regresión fija y compacta de 10 tareas en de/en/ru, no sobre el benchmark MMTEB Multilingual v2 completo. Los valores son medias de esa suite y solo son comparables entre sí.

| Modelo | Media en la suite de regresión (10 tareas de/en/ru) |
|---|---|
| Bekko a8m original (vocabulario de 256.000) | 61,887 |
| Winzling-Embed-a8m-64k, 64k FP32 | 55,609 |
| Winzling-Embed-a8m-64k, 64k UINT4 ONNX | 54,979 |

Datos de validación de la exportación (similitud coseno frente al FP32 recortado):

| Métrica | Valor |
|---|---|
| Media | 0,989615 |
| Peor caso | 0,986063 |

Advertencia del propio autor: la puntuación de 54,979 no es la del benchmark oficial MMTEB Multilingual v2. El modelo base Bekko reporta 56,7 Mean(Task) sobre las 131 tareas oficiales de MMTEB Multilingual v2; ambos agregados no son directamente comparables.

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras tareas generativas en la información disponible, ya que se trata de un modelo de embeddings y no de generación.

## Requisitos de hardware

- Peso del modelo: 29,1 MiB en disco para el grafo ONNX UINT4 y 26,4 MiB comprimido con zstd-19; los pesos en memoria son del orden de decenas de megabytes, muy por debajo de cualquier límite práctico de VRAM.
- VRAM estimada: no publicada de forma explícita. Con 7.671.168 parámetros activos de transformer y una tabla de tokens en INT8, cualquier GPU con unos pocos cientos de megabytes disponibles es suficiente; el modelo está pensado para CPU.
- GPU recomendadas: no hay ninguna recomendación publicada. El modelo es funcional en CPU (`CPUExecutionProvider`) y no requiere A100, H100 ni RTX 4090.
- GPU de consumo: cabe sin problema en cualquier GPU de consumo, e incluso en iGPU y aceleradores de borde. El caso de uso declarado es `edge`.
- Despliegue: `sentence-transformers` con backend ONNX (`pip install "sentence-transformers[onnx]"`), ONNX Runtime, Text Embeddings Inference (etiqueta del repositorio) y endpoints de Hugging Face.
- No hay soporte documentado de llama.cpp, Ollama, GGUF ni vLLM en la información disponible.
- Latencia y throughput: no disponibles. No se publican medidas de tokens por segundo ni de latencia por lote en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Media suite de regresión de/en/ru | Licencia | Formato |
|---|---|---|---|---|---|
| Winzling-Embed-a8m-64k (UINT4 ONNX) | 32.836.992 | 8.192 tokens | 54,979 | MIT | ONNX |
| Winzling-Embed-a8m-64k (FP32) | 32.836.992 | 8.192 tokens | 55,609 | MIT | safetensors |
| hotchpotch/bekko-embedding-v1-a8m | 105.975.168 | 8.192 tokens | 61,887 | no disponible | no disponible |
| Otras alternativas multilingües pequeñas (por ejemplo, multilingual-e5-small o paraphrase-multilingual-MiniLM-L12-v2) | no disponible | no disponible | no disponible | no disponible | no disponible |

El modelo base Bekko reporta además 56,7 Mean(Task) en las 131 tareas oficiales de MMTEB Multilingual v2, agregado no comparable con la suite de 10 tareas usada aquí. Para el resto de alternativas no se dispone de datos en la información proporcionada.

## Limitaciones y advertencias

- Cobertura lingüística restringida: solo de, en y ru están validados. Otros idiomas pueden tokenizarse y producir embeddings, pero su calidad semántica no está comprobada y no debe asumirse.
- Pérdida de calidad medible: 61,887 → 54,979 en la suite de regresión, es decir, unos 6,9 puntos menos que el Bekko a8m original de 256k. El recorte de vocabulario aporta la mayor parte de esa caída (61,887 → 55,609) y la cuantización UINT4 añade una pérdida menor (55,609 → 54,979).
- La suite de evaluación es compacta (10 tareas) y específica para de/en/ru; no cubre las 131 tareas de MMTEB Multilingual v2 ni otros dominios.
- La cuantización UINT4 introduce distorsión: la similitud coseno frente al FP32 recortado baja a 0,986063 en el peor caso, lo que puede afectar a rankings muy ajustados en recuperación.
- No hay entrenamiento ni fine-tuning en esta transformación: solo recorte de vocabulario y cuantización. Cualquier sesgo presente en el modelo base Bekko se hereda íntegramente. En la información disponible no se detallan sesgos concretos.
- Riesgo de alucinación: no aplica en el sentido generativo, ya que el modelo no genera texto; el riesgo equivalente es recuperar pasajes semánticamente próximos pero incorrectos para la consulta.
- No usar prefijos de consulta o documento: el modelo está entrenado sin ellos y añadirlos puede degradar los resultados.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 16 de septiembre de 2026. No hay validación por parte de la comunidad.
- La model card disponible parece truncada en la sección de inicio rápido (se corta en "For direct Hub loading, repl..."), por lo que las instrucciones de carga directa desde el Hub no están completas en la información proporcionada.
- La licencia MIT permite uso comercial, pero conviene verificar la licencia del modelo base `hotchpotch/bekko-embedding-v1-a8m`, que no consta en la información disponible.
- No hay variantes GGUF ni soporte de llama.cpp/Ollama documentados, lo que limita su integración en herramientas que esperan esos formatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kyr0/Winzling-Embed-a8m-64k
- Modelo base: https://huggingface.co/hotchpotch/bekko-embedding-v1-a8m
- Modelo intermedio del linaje: https://huggingface.co/hotchpotch/mmBERT-L4H384-pruned
- Referencia arXiv incluida en las etiquetas del repositorio (`arxiv:2607.25180`): https://arxiv.org/abs/2607.25180 (identificador tal y como aparece en las etiquetas; no verificado)
- Búsqueda web: no se han encontrado resultados relevantes sobre este modelo. Los resultados devueltos por la búsqueda corresponden a sitios de pronósticos deportivos (Loto Foot) y no guardan relación con el modelo.
