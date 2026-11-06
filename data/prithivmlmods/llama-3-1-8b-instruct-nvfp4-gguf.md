# prithivMLmods/Llama-3.1-8B-Instruct-NVFP4-GGUF

## Resumen

Llama-3.1-8B-Instruct-NVFP4-GGUF es una cuantización en formato NVFP4 (FP4 de 4 bits con escalado por bloques, definido por NVIDIA) del modelo meta-llama/Llama-3.1-8B-Instruct, publicada por el usuario prithivMLmods. No se trata de un modelo nuevo, sino de una conversión de pesos orientada específicamente a aceleradores NVIDIA Blackwell (SM120, GB202, B200, B300, RTX PRO 6000 y serie RTX 50), donde los Tensor Cores ejecutan operaciones FP4 de forma nativa. El objetivo es reducir el peso en disco y en VRAM hasta unos 6 GB totales manteniendo el comportamiento del modelo original de 8.030.261.760 parámetros.

El modelo base es el Llama 3.1 8B Instruct de Meta, un transformer decoder-only con grouped-query attention, ventana de contexto de 128.000 tokens y entrenamiento sobre aproximadamente 15 billones de tokens, seguido de supervisión fina y RLHF para diálogo multilingüe y uso de herramientas en ocho idiomas. Esta versión cuantizada conserva esa arquitectura y esas capacidades; la única diferencia es la precisión numérica de los pesos.

Su relevancia es práctica: permite desplegar un 8B Instruct en GPUs Blackwell con un consumo de VRAM muy contenido (el autor reporta 6,15 GiB de pico con 99 capas offloaded y contexto de 8.192 tokens) y velocidades de generación de unos 206,87 tokens/s en una RTX PRO 6000 Blackwell. Es una opción interesante para prototipado local, inferencia de baja latencia y pruebas de decodificación especulativa en hardware de nueva generación, siempre que se disponga de toolchain actualizado de llama.cpp con soporte FP4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con grouped-query attention |
| Parametros totales | 8.030.261.760 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (modelo base); prueba del autor a 8.192 tokens |
| Tipos de cuantizacion | NVFP4 (4 bits, formato FP4 de NVIDIA con escalado por bloques) |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | GGUF (3 shards: 2,99 GB + 2 GB + 1,05 GB; repo de 6,0 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Llama 3.1 8B Instruct: un transformer decoder-only con normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y grouped-query attention, con un vocabulario de 128.256 tokens. El modelo base fue preentrenado con aproximadamente 15 billones de tokens de datos públicos y posteriormente alineado mediante supervisión fina y RLHF, con especial énfasis en diálogo multilingüe, seguimiento de instrucciones y uso de herramientas.

Esta publicación no reentrena ni modifica el modelo: aplica cuantización NVFP4 con llama.cpp sobre los pesos originales. NVFP4 es un formato de 4 bits definido por NVIDIA que emplea escalado por bloques para preservar el rango dinámico, y está pensado para ejecutarse en los Tensor Cores FP4 de las GPU Blackwell. El autor documenta una prueba con `llama-cli`, `-ngl 99`, caché KV en `q8_0`, semilla 42 y 8.192 tokens de contexto, sin decodificación especulativa, aunque el repositorio incluye la etiqueta `speculative-decoding` como capacidad soportada por el stack.

## Capacidades

- Generación de texto conversacional multi-turno con instrucciones en ocho idiomas (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés).
- Razonamiento y matemáticas: el modelo base obtiene 84,5 en GSM-8K y 51,9 en MATH, con mejora sustancial respecto a Llama 3 8B Instruct.
- Generación de código: 72,6 en HumanEval y 72,8 en MBPP++, adecuado para autocompletado y explicación de código.
- Tool calling y function calling: 82,6 en API-Bank y 76,1 en BFCL en el modelo base, lo que habilita integraciones con APIs externas.
- Seguimiento de instrucciones: 80,4 en IFEval, con formato de chat instructivo.
- Contexto largo: ventana nativa de 128.000 tokens en el modelo base, útil para documentos extensos y conversaciones prolongadas.
- Capacidad de decodificación especulativa a través del stack llama.cpp (etiqueta del repositorio), si bien la prueba publicada no la activa.
- No dispone de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Asistente conversacional local en estaciones de trabajo con GPU Blackwell: el modelo ocupa unos 6 GB en VRAM con contexto de 8K, por lo que puede convivir con otras cargas en una RTX PRO 6000 o en una RTX 5090, ofreciendo respuestas a más de 200 tokens/s.
- Generación de código en pipelines de CI/CD: con 72,6 en HumanEval y soporte de tool calling, puede integrarse en flujos de revisión automática, generación de tests o documentación técnica.
- Automatización de atención al cliente multi-turno: la ventana de 128K del modelo base permite mantener historiales largos y consultar bases de conocimiento extensas sin truncar el contexto.
- Procesamiento de documentos largos en varios idiomas: informes, contratos o actas en español, francés, alemán, italiano o portugués, aprovechando el soporte multilingüe nativo.
- Agentes con llamadas a herramientas: el rendimiento en BFCL y API-Bank del modelo base lo hace viable para orquestar APIs, consultas a bases de datos y tareas de varios pasos.
- Evaluación y prototipado de cuantización FP4: sirve como banco de pruebas para medir latencia, throughput y calidad de NVFP4 frente a GGUF Q4_K_M o Q8_0 en hardware Blackwell antes de adoptar el formato en producción.
- Inferencia de baja latencia en el borde con GPU de consumo de la serie RTX 50: al caber holgadamente en 8-12 GB de VRAM, permite desplegar el modelo en equipos de sobremesa para asistentes personales o herramientas internas.

## Benchmarks y rendimiento

Resultados del modelo base Llama 3.1 8B Instruct reportados en la model card:

| Benchmark | Llama 3.1 8B Instruct |
|---|---|
| MMLU | 69,4 (73,0 con CoT) |
| MMLU-Pro | 48,3 |
| IFEval | 80,4 |
| GPQA | 30,4 |
| HumanEval | 72,6 |
| MBPP++ | 72,8 |
| GSM-8K | 84,5 |
| MATH | 51,9 |
| API-Bank | 82,6 |
| BFCL | 76,1 |

Métricas de inferencia de la cuantización NVFP4 publicadas por el autor (RTX PRO 6000 Blackwell Server Edition, 96 GB VRAM, `llama-cli`, `-ngl 99`, contexto 8.192, KV cache `q8_0`, semilla 42, 5 ejecuciones):

| Métrica | Valor |
|---|---|
| Velocidad media de procesamiento de prompt | 2.795,68 tokens/s |
| Velocidad media de generación | 206,87 tokens/s |
| Tiempo total de ejecución | 19,2 s |
| VRAM pico | 6,15 GiB |
| Utilización de GPU pico | 92% |
| Capas offloaded | 99 |

No se han publicado resultados de benchmarks de calidad específicos para la versión NVFP4 que permitan cuantificar la degradación frente al modelo original.

## Requisitos de hardware

- VRAM estimada: unos 6,15 GiB en pico con contexto de 8.192 tokens y caché KV en `q8_0`, según la prueba del autor; el peso en disco suma aproximadamente 6,04 GB entre los tres shards.
- GPU recomendadas: NVIDIA Blackwell, es decir, RTX PRO 6000, B200, B300 y GPUs de consumo de la serie RTX 50 (SM120/GB202). El formato NVFP4 depende de los Tensor Cores FP4 de esta generación.
- Compatibilidad con GPUs de generación anterior (Ampere, Ada Lovelace, Hopper): no confirmada en la información disponible; el formato está diseñado para ejecutarse de forma nativa en Blackwell y fuera de ella requeriría emulación o soporte específico del runtime.
- Cabe en GPU de consumo: sí, en tarjetas Blackwell con 12 GB o más de VRAM, siempre que el build de llama.cpp soporte NVFP4.
- Opciones de despliegue: llama.cpp (`llama-cli`, y presumiblemente `llama-server`) es el runtime documentado; las etiquetas del repositorio mencionan también `text-generation-inference` y `transformers`, aunque no se aportan instrucciones ni garantías para esos stacks con pesos NVFP4.
- Latencia y throughput: 206,87 tokens/s de generación y 2.795,68 tokens/s de procesamiento de prompt en la RTX PRO 6000 Blackwell con la configuración indicada; el rendimiento en otras GPU no está documentado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-NVFP4-GGUF (este) | 8,03 B | 128K | GGUF NVFP4, ~6 GB | Llama 3.1 Community | Optimizado para Blackwell; 206,87 tok/s en RTX PRO 6000 |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128K | safetensors BF16, ~16 GB | Llama 3.1 Community | Referencia de calidad; requiere más VRAM y no usa FP4 |
| Llama 3.1 8B Instruct en GGUF Q4_K_M (otras conversiones) | 8,03 B | 128K | GGUF 4 bits, ~4,9 GB | Llama 3.1 Community | Compatible con un rango amplio de hardware, no solo Blackwell; calidad y velocidad dependen del runtime |
| Mistral 7B Instruct v0.3 | 7,2 B | 32K | safetensors, GGUF | Apache 2.0 | Alternativa de licencia permisiva, contexto menor y sin soporte FP4 nativo documentado |

La comparación de rendimiento entre estas alternativas no está disponible en la información proporcionada más allá de los benchmarks del modelo base.

## Limitaciones y advertencias

- La cuantización NVFP4 introduce pérdida de precisión de 4 bits; no se han publicado evaluaciones que cuantifiquen la degradación en MMLU, HumanEval o GSM-8K respecto al modelo BF16.
- Dependencia fuerte de hardware: el formato está pensado para NVIDIA Blackwell; en GPUs anteriores el soporte no está confirmado y podría no funcionar o hacerlo con rendimiento muy inferior.
- Requiere un build de llama.cpp con soporte NVFP4; versiones antiguas o distribuciones sin parches pueden no cargar los shards.
- Riesgo de alucinación inherente a un modelo de 8B, especialmente en tareas de conocimiento factual, matemáticas complejas y citas de fuentes.
- Sesgos presentes en los datos de entrenamiento del modelo base (aproximadamente 15 billones de tokens públicos), no mitigados específicamente en esta conversión.
- Cobertura lingüística limitada a ocho idiomas; el rendimiento en español, hindi o tailandés es inferior al del inglés según la documentación de Meta.
- Licencia Llama 3.1 Community: uso comercial permitido con condiciones (atribución, política de uso aceptable y límite de 700 millones de usuarios mensuales para licencia automática); conviene revisar los términos antes de desplegar en producción.
- El repositorio tiene muy poca tracción (14 descargas, 1 like) y una única prueba de rendimiento; no hay validación independiente de la calidad de la cuantización.
- La model card advierte de una errata en las capturas: la lineage mostrada es Llama-3.3-70B-Instruct cuando en realidad el modelo base es Llama-3.1-8B-Instruct.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/prithivMLmods/Llama-3.1-8B-Instruct-NVFP4-GGUF
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Perfil del autor: https://huggingface.co/prithivMLmods
