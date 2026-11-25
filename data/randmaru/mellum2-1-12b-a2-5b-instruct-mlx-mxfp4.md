# randmaru/Mellum2.1-12B-A2.5B-Instruct-mlx-mxfp4

## Resumen

Mellum2.1-12B-A2.5B-Instruct-mlx-mxfp4 es una cuantización comunitaria en formato MLX del modelo JetBrains/Mellum2.1-12B-A2.5B-Instruct, un decodificador de mezcla de expertos (MoE) de 12.150 millones de parámetros totales con 2.500 millones activos por token. La produce el usuario randmaru con `mlx-lm` 0.32.2 y `mlx` 0.32.4, y está pensada para inferencia en Apple Silicon mediante MLX y Metal. No tiene afiliación ni respaldo de JetBrains.

El modelo base está especializado en código, trabajo agéntico, bucles de llamadas a herramientas y preguntas técnicas, y responde de forma directa sin bloque de cadena de pensamiento. Esta variante cuantiza los pesos a 4 bits MXFP4 con grupo de 32 y mantiene las compuertas del router en 8 bits afines con grupo de 64, lo que da una media de 4,252 bits por peso y un único archivo `model.safetensors` de 6,46 GB.

Su relevancia es práctica: reduce el peso del modelo un 47 % respecto a los pesos BF16 teóricos y queda por debajo de las builds GGUF oficiales del mismo modelo base (7,03 GB en MXFP4_MOE y 8,07 GB en Q4_K_M), lo que permite ejecutar un MoE de 12B con 131.072 tokens de contexto en equipos Apple Silicon de gama alta con memoria unificada moderada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder MoE, 28 capas, GQA (32 cabezas de consulta, 4 de clave/valor), atención deslizante de 1024 tokens en 3 de cada 4 capas y atención completa en el resto |
| Parametros totales | 12.149.923.072 (12B) |
| Parametros activos | 2.500 millones (2.5B) por token |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | MXFP4 (4 bits float, exponente E8M0 compartido por grupo de 32); router `mlp.gate` en 8 bits afín con grupo de 64; normas 1-D en BF16 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), un único `model.safetensors` con pesos empaquetados en U32 y escalas U8 |

Otros datos técnicos: `hidden_size` 2304, `intermediate_size` 7168, `moe_intermediate_size` 896, 64 expertos por bloque con enrutamiento top-8 y `norm_topk_prob`, vocabulario de 98.304 entradas con embeddings y cabeza de salida no atados. Tamaño del repositorio: 12,9 GB; bytes de pesos: 6.457.111.871 (6,46 GB / 6,01 GiB).

## Arquitectura y entrenamiento

El modelo base es un transformer decoder con mezcla de expertos: 64 expertos por bloque y enrutamiento top-8, con 2.500 millones de parámetros activos sobre 12.150 millones totales. Combina atención con cabezas de clave/valor agrupadas (GQA) y un patrón híbrido de atención: tres de cada cuatro capas usan ventana deslizante de 1024 tokens y la cuarta usa atención completa, lo que reduce el coste de memoria del contexto largo manteniendo capacidad de recuperación global. El vocabulario es de 98.304 entradas y los embeddings y la cabeza de salida no comparten pesos.

El comportamiento está ajustado para respuestas directas sin bloque ` thinking`, orientadas a código y flujos agénticos. La model card de esta cuantización no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esa información corresponde a la model card del modelo base de JetBrains, no incluida en la información disponible. La innovación destacable de esta build es la cuantización MXFP4 con escalas E8M0 compartidas por grupo de 32 (un byte de escala por cada 32 pesos, sin sesgo por grupo), que permite 4,252 bits por peso efectivos, con la excepción explícita de las compuertas del router en 8 bits declarada en `config.json` siguiendo el `quant_predicate` de la arquitectura `mellum` en `mlx-lm`.

## Capacidades

- Generación de texto y respuestas directas sin cadena de pensamiento explícita.
- Generación y explicación de código en múltiples lenguajes: el modelo base reporta resultados en HumanEval+, MultiPL-E y LiveCodeBench v6.
- Razonamiento matemático: el modelo base reporta AIME 25/26 y GSM-Plus.
- Trabajo agéntico y bucles de herramientas: ajustado para flujos de llamadas a herramientas y tareas de terminal; el modelo base reporta BFCL v4, WorkBench y Terminal-Bench 2.1.
- Seguimiento de instrucciones: el modelo base reporta IFEval.
- Contexto largo de hasta 131.072 tokens, útil para repositorios completos o conversaciones multi-turno extensas.
- Capacidades multilingües limitadas: la model card declara únicamente inglés.
- Sin soporte declarado de visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Asistencia de código en local sobre Mac: el modelo se carga con `mlx-lm` en Apple Silicon y permite autocompletar, explicar y refactorizar funciones sin enviar código a servicios externos, gracias a los 6,46 GB de pesos y a su ajuste específico para código.
- Agentes de terminal y automatización de tareas: su entrenamiento orientado a bucles de herramientas y su resultado en Terminal-Bench 2.1 lo hacen adecuado para orquestar comandos y validar resultados en un pipeline local.
- Revisión de repositorios con contexto largo: con 131.072 tokens de ventana puede ingerir varios archivos y su historial de cambios en una sola pasada para detectar inconsistencias o proponer parches.
- Generación de tests y documentación técnica: el modelo responde de forma directa sin cadena de pensamiento, lo que reduce latencia y tokens de salida en tareas repetitivas de CI/CD ejecutadas en un runner macOS.
- Asistente de preguntas técnicas multi-turno: la ventana de contexto amplia permite mantener conversaciones largas con historial de código y errores sin truncar.
- Prototipado de agentes con llamadas a funciones: el soporte de tool calling del modelo base (BFCL v4: 46,5) permite construir asistentes que consulten APIs y encadenen pasos, con la ventaja de que todo el bucle corre en local.
- Evaluación comparativa de cuantizaciones: al ser una build MXFP4 con métricas de fidelidad publicadas frente a BF16 y MXFP8, sirve para medir el impacto real de la cuantización en un MoE antes de desplegar la versión completa.

## Benchmarks y rendimiento

Evaluación del modelo base reportada por JetBrains (decodificación greedy salvo indicación):

| Benchmark | Mellum2.1 Instruct |
|---|---:|
| SWE-bench Verified | 40,4 |
| SWE-bench Pro | 20,0 |
| Terminal-Bench 2.1 | 8,2 |
| LiveCodeBench v6 | 53,7 |
| HumanEval+ | 89,1 |
| MultiPL-E (7 lenguajes) | 73,7 |
| AIME 25/26 (avg@8) | 61,1 |
| GSM-Plus | 86,7 |
| BFCL v4 | 46,5 |
| WorkBench | 38,0 |
| IFEval | 87,2 |
| MMLU-Redux | 82,8 |

Fidelidad de la cuantización frente a BF16, medida sobre la primera ventana de 4.096 tokens de un corpus fijo de 203k tokens (Wikipedia en+zh):

| Build | Coincidencia top-1 con BF16 | KL(BF16 ‖ build) | PPL en la ventana |
|---|---:|---:|---:|
| BF16 (referencia) | 100 % | 0 | 15,27 |
| MXFP4 (este repo) | 82,15 % | 0,222 nats/token | 10,55 |
| MXFP8 (referencia) | 93,21 % | 0,047 nats/token | 19,63 |

Sobre el corpus completo de 202.554 tokens, esta build coincide con la build MXFP8 en el 77,2 % de los tokens. La model card advierte de que la perplejidad no es una señal fiable aquí: MXFP4 afila ligeramente los logits y puede bajar la PPL aunque las predicciones se alejen de la referencia.

Velocidad en Apple M5 Pro (24 GB), prefill de 322 tokens y 128 pasos de decodificación, mediana de 3 ejecuciones:

| Métrica | Valor |
|---|---:|
| Prefill | 1417,4 tok/s |
| Decode | 79,8 tok/s |
| Memoria pico | 6,98 GB |

## Requisitos de hardware

- VRAM o memoria unificada estimada: unos 6,98 GB de pico medidos en Apple M5 Pro con 24 GB; el archivo de pesos ocupa 6,46 GB.
- Plataforma: exclusivamente Apple Silicon mediante MLX y Metal; no hay builds para CUDA, ROCm ni CPU en este repositorio.
- GPU recomendadas: chips Apple M-series con al menos 16 GB de memoria unificada; el rendimiento publicado corresponde a un M5 Pro de 24 GB.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon de gama alta; no es ejecutable en GPUs NVIDIA o AMD con este formato.
- Opciones de despliegue: `mlx-lm` (versión 0.32.2 o superior) y `mlx` 0.32.4; para llama.cpp, LM Studio u otros runtimes hay que usar las builds GGUF oficiales de JetBrains.
- Latencia y throughput: 1417,4 tok/s de prefill y 79,8 tok/s de decodificación en M5 Pro de 24 GB con el protocolo indicado; el rendimiento real depende de la longitud del prompt, el muestreo y la carga de la GPU.

## Comparativa con modelos similares

Comparación con las builds GGUF oficiales del mismo modelo base (mismo modelo, distinto runtime):

| | MXFP4 (este repo) | GGUF MXFP4_MOE | GGUF Q4_K_M |
|---|---|---|---|
| Cuantización | MXFP4, grupo 32 | bloques MoE estilo MXFP4 | k-quant Q4_K_M (mixta 4/6 bits) |
| Formato | `model.safetensors` + config/tokenizer | `.gguf` único | `.gguf` único |
| Tamaño | 6,46 GB | 7,03 GB | 8,07 GB |
| Bits por peso efectivos | ≈4,25 | ≈4,6 | ≈5,3 |
| Runtime | `mlx-lm` | `llama.cpp`, LM Studio | `llama.cpp`, LM Studio |
| Hardware | Apple Silicon vía MLX/Metal | Metal, CUDA, ROCm, CPU | Metal, CUDA, ROCm, CPU |
| Licencia | Apache 2.0 | Apache 2.0 (heredada) | Apache 2.0 (heredada) |

No se dispone en la información proporcionada de comparaciones con modelos de otros desarrolladores de tamaño o tarea equivalente.

## Limitaciones y advertencias

- Cuantización agresiva: solo conserva el 82,15 % de las decisiones argmax del modelo BF16 y presenta una divergencia KL de 0,222 nats/token; para tareas sensibles a la fidelidad conviene usar una build MXFP8 o BF16.
- Solo inglés: la model card declara únicamente `en`; el rendimiento en castellano no está evaluado y probablemente sea inferior.
- La perplejidad es engañosa en este modelo: puede bajar tras cuantizar aunque las predicciones empeoren, por lo que no debe usarse como única métrica de calidad.
- Riesgo de alucinación inherente a los modelos generativos, no cuantificado en la información disponible; en tareas de código conviene validar la salida con tests.
- Restricciones de plataforma: requiere Apple Silicon y MLX; no hay soporte CUDA, ROCm ni CPU en este repositorio.
- Es una cuantización no oficial: no está afiliada ni respaldada por JetBrains, y los términos de licencia y la arquitectura provienen del modelo base.
- Licencia Apache 2.0: permite uso comercial, pero se deben conservar los avisos de licencia y atribución correspondientes.
- Sesgos conocidos: no documentados en la información disponible.
- Rendimiento en producción: las cifras de velocidad proceden de una única configuración (M5 Pro, 24 GB, prefill de 322 tokens); no hay datos de latencia con prompts largos ni de concurrencia.

## Enlaces

- Repositorio de esta cuantización: https://huggingface.co/randmaru/Mellum2.1-12B-A2.5B-Instruct-mlx-mxfp4
- Modelo base: https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Instruct
- Builds GGUF oficiales: https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Instruct-GGUF
- Librería MLX-LM: https://github.com/ml-explore/mlx-lm
- Proyecto MLX: https://github.com/ml-explore/mlx
