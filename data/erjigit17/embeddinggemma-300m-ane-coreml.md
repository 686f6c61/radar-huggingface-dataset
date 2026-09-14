# erjigit17/embeddinggemma-300m-ane-coreml

## Resumen

EmbeddingGemma-300M ANE Core ML es una conversion a Core ML del modelo de embeddings `google/embeddinggemma-300m`, publicada por el usuario erjigit17. No es un modelo nuevo ni un fine-tuning: es un empaquetado que reimplementa la atencion del modelo original para que el compilador del Apple Neural Engine (ANE) la acepte y el modelo se ejecute realmente en la NPU de los chips Apple Silicon, en lugar de caer silenciosamente a CPU o GPU. El resultado es un encoder bidireccional de 768 dimensiones con pesos cuantizados a 8 bits que produce embeddings normalizados L2 en aproximadamente 5,8 ms por inferencia en un Apple M4.

El modelo base pertenece a la familia Gemma 3 y esta disenado especificamente para similitud semantica y recuperacion de informacion (retrieval). La conversion mantiene la fidelidad respecto al modelo sin cuantizar con una similitud coseno de 0,996-0,997, y verifica mediante `MLComputePlan` que 2001 de 2025 operaciones (98,8 %) se ejecutan en el Neural Engine. La secuencia de entrada esta fijada a 128 tokens, lo que condiciona su uso a fragmentos cortos de texto.

Su relevancia practica es doble: por un lado demuestra que la conversion ingenua de esta arquitectura falla en ANE (el compilador no soporta el op fusionado `scaled_dot_product_attention`) y documenta el camino alternativo; por otro, ofrece un componente listo para busqueda semantica totalmente on-device en macOS, sin enviar datos a la nube. La licencia es la Gemma de Google, heredada del modelo base, por lo que conviene revisarla antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional derivado del decodificador de Gemma 3; GQA (3 cabezas query por 1 de key/value), QK-norm y sandwich normalization |
| Parametros totales | 300 M (denominacion del modelo base `google/embeddinggemma-300m`) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 128 tokens fijos (entrada `input_ids` de forma `int32[1, 128]`, con padding y truncacion a 128) |
| Tipos de cuantizacion | 8 bits, lineal simetrica (`coremltools.optimize.coreml.linear_quantize_weights`) |
| Idiomas soportados | no disponible |
| Licencia | Gemma (heredada del modelo base) |
| Formato de pesos | `.mlpackage` de Core ML, mas `tokenizer.json` y `convert.py` en el repositorio |

## Arquitectura y entrenamiento

La red es la arquitectura de decodificador de Gemma 3 adaptada a un encoder bidireccional (`use_bidirectional_attention: true`), sin mascara autoregresiva. El hidden size es 768, pero el ancho de cabeza es 256 e independiente del hidden size, con atencion de consultas agrupadas (3 cabezas de query comparten 1 cabeza de key/value). La atencion es alterna: 5 de cada 6 capas usan ventana deslizante de radio 257 con `rope_local_base_freq: 10000.0`, y cada sexta capa usa atencion global con `rope_theta: 1000000.0`, es decir, dos frecuencias RoPE distintas segun el tipo de capa. Se aplica RMSNorm por cabeza (QK-norm) despues de la separacion de cabezas y antes de RoPE, y se usa sandwich normalization con cuatro RMSNorm por capa en lugar de las dos habituales. Los embeddings de token se multiplican por `sqrt(hidden_size)` (aproximadamente 27,71) dentro de `Gemma3TextScaledWordEmbedding`. Tras el mean pooling hay dos capas densas adicionales (768 → 3072 → 768, sin sesgo ni activacion intermedia), que forman parte del modelo publicado.

El autor no describe en la informacion disponible el dataset de entrenamiento, el numero de tokens ni si hubo RLHF o DPO: esos detalles pertenecen al modelo base y no se reproducen aqui. La innovacion tecnica de esta publicacion es la reescritura de la atencion como una secuencia explicita de `matmul → +mask → softmax → matmul`, matematicamente identica a la original pero expresada en operaciones que el compilador de ANE acepta. El script `convert.py` del repositorio es la implementacion ejecutable de esa conversion, y la equivalencia se verifica por similitud coseno antes de convertir, no se asume.

## Capacidades

- Generacion de embeddings de frase de 768 dimensiones, normalizados L2, para similitud semantica y recuperacion.
- Extraccion de caracteristicas (`feature-extraction`) y `sentence-similarity` como tareas declaradas en el pipeline.
- Ejecucion on-device en el Apple Neural Engine, con 98,8 % de las operaciones residentes en ANE segun `MLComputePlan`.
- Uso de prefijos de tarea diferenciados: `"task: search result | query: "` para consultas y `"title: none | text: "` para documentos, convencion del propio modelo base.
- No dispone de generacion de texto, razonamiento, codigo, matematicas ni capacidades multimodales: es un encoder de embeddings.
- No hay soporte declarado de tool calling ni de flujos de agentes.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Compatibilidad limitada a macOS 15 o superior y a hardware Apple Silicon con Neural Engine.

## Casos de uso

- Busqueda semantica local en aplicaciones de escritorio macOS: indexar documentos del usuario con el prefijo de documento y consultar con el prefijo de query, manteniendo todo el contenido en el dispositivo y con 5,8 ms por embedding en un M4.
- Deduplicacion y agrupacion de textos cortos: calcular embeddings de titulares, comentarios o entradas de un CRM y agrupar por similitud coseno para detectar duplicados sin coste de API.
- Recuperacion aumentada (RAG) en el propio Mac: usar el modelo como retriever de fragmentos de hasta 128 tokens frente a un indice vectorial local, evitando enviar datos sensibles a servicios externos.
- Clasificacion por vecinos mas cercanos: tareas de etiquetado zero-shot o few-shot comparando el embedding de un texto nuevo contra prototipos etiquetados, util en moderacion de contenido o triaje de tickets.
- Filtrado y recomendacion de contenidos: emparejar descripciones, articulos o catalogos por similitud semantica en aplicaciones de notas, lectura o comercio electronico que ya corren en macOS.
- Deteccion de similitud y plagio en fragmentos cortos: comparar pares de parrafos o respuestas de formularios para medir cercania semantica en procesos internos.
- Preprocesado en pipelines de NLP: generar caracteristicas densas para modelos posteriores de clasificacion o clustering que se ejecuten junto al encoder en el mismo equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los unicos datos de rendimiento aportados son de latencia y fidelidad de la conversion:

| Metrica | Valor |
|---|---|
| Latencia por embedding (M4, llamada directa a Core ML) | ~5,8 ms |
| Operaciones en Apple Neural Engine | 2001/2025 (98,8 %) |
| Similitud coseno frente a `SentenceTransformer.encode()` sin cuantizar | 0,996-0,997 |
| Latencia del paquete de terceros `mlboydaisuke/embeddinggemma-300m-coreml` (misma clase de hardware, 8 bits) | 9,4 ms reportados por su autor |

No hay datos de MMLU, MTEB, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion en la informacion proporcionada.

## Requisitos de hardware

- Hardware objetivo: Mac con Apple Silicon y Neural Engine; la latencia medida (5,8 ms) corresponde a un M4.
- VRAM/unificada estimada: no disponible de forma explicita; el repositorio ocupa 0,3 GB y los pesos estan cuantizados a 8 bits sobre un modelo de 300 M de parametros.
- Cabe en GPU de consumidor: si, en el sentido de que esta pensado para GPUs integradas de Apple Silicon; no esta orientado a GPU discretas NVIDIA o AMD.
- Sistema operativo minimo: macOS 15.
- Unidad de computo recomendada: `CPU_AND_NE` mediante `MLModelConfiguration`; configurar otra unidad puede degradar el rendimiento sin producir error.
- Opciones de despliegue: Core ML a traves de `coremltools` (carga de `.mlpackage`), con `tokenizers` para el preprocesado; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: ~5,8 ms por embedding en M4 con llamada directa; el autor reporta un 40 % mas de velocidad que el paquete alternativo (5,8 ms frente a 9,4 ms) en el mismo hardware y con la misma cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Latencia reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| erjigit17/embeddinggemma-300m-ane-coreml | 300 M | 128 tokens fijos | 8 bits lineal simetrica | ~5,8 ms en M4 | Gemma | HuggingFace, 0 descargas, 1 like |
| mlboydaisuke/embeddinggemma-300m-coreml | 300 M | no disponible | 8 bits | 9,4 ms | Gemma | HuggingFace |
| google/embeddinggemma-300m (modelo base) | 300 M | no disponible en la informacion proporcionada | pesos sin cuantizar de referencia | no disponible | Gemma | HuggingFace |
| unsloth/embeddinggemma-300m | 300 M | no disponible | no disponible | no disponible | Gemma | HuggingFace (espejo sin gating) |

No se dispone de datos de benchmarks que permitan comparar calidad de recuperacion entre estas variantes; la unica comparacion cuantitativa documentada es de latencia y de fidelidad de cuantizacion.

## Limitaciones y advertencias

- La longitud de entrada esta fijada a 128 tokens; cualquier texto mas largo se trunca, lo que degrada la calidad de recuperacion en documentos extensos.
- El tokenizador del repositorio no configura padding ni truncacion por defecto: hay que establecer `enable_padding(length=128, pad_id=0)` y `enable_truncation(max_length=128)` manualmente.
- Invertir los prefijos de query y documento no produce error, pero penaliza silenciosamente el ranking de recuperacion.
- La cuantizacion a 8 bits introduce una perdida de fidelidad de aproximadamente 0,003-0,004 en similitud coseno frente al modelo sin cuantizar.
- La licencia Gemma impone condiciones especificas de uso, incluida la comercial; debe revisarse antes de desplegar.
- Requiere macOS 15 o superior y Apple Silicon con Neural Engine; no hay version para Linux, Windows ni GPU discretas.
- Si se configura mal la unidad de computo, Core ML puede ejecutar en CPU sin emitir ningun error, con la consiguiente perdida de rendimiento.
- No hay informacion sobre idiomas soportados ni sobre sesgos del modelo base en la documentacion facilitada.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero los embeddings pueden producir similitudes altas entre textos no relacionados semanticamente; conviene calibrar el umbral de coseno por caso de uso.
- El repositorio tiene 0 descargas y 1 like, y fue creado en septiembre de 2026; no existe validacion independiente de las cifras declaradas mas alla del script `convert.py` incluido.
- Los resultados de busqueda web disponibles no aportan informacion tecnica sobre este modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/erjigit17/embeddinggemma-300m-ane-coreml
- Modelo base: https://huggingface.co/google/embeddinggemma-300m
- Espejo sin gating usado como origen de pesos: https://huggingface.co/unsloth/embeddinggemma-300m
- Conversion Core ML alternativa: https://huggingface.co/mlboydaisuke/embeddinggemma-300m-coreml
- Documentacion de Core ML: https://developer.apple.com/documentation/coreml
- Terminos de licencia Gemma: https://ai.google.dev/gemma/terms
