# mweinbach1/qwen-3.8-flash-next-nvfp4-rtx-spark

## Resumen

`mweinbach1/qwen-3.8-flash-next-nvfp4-rtx-spark` es un checkpoint derivado y reconstruido (repack) de **Qwen3.8-Flash-Next-NVFP4**, publicado por el usuario mweinbach1 bajo licencia Apache 2.0. No es un modelo entrenado desde cero: el autor reorganiza y recuantiza los pesos de un modelo base para que quepan y funcionen en dispositivos Blackwell de memoria unificada de 128 GB, concretamente el NVIDIA RTX Spark N1X (`sm_121`, Windows 11 ARM64), donde la memoria física se reparte en 96,0 GiB de VRAM dedicada a GPU y 30,43 GiB de RAM para el sistema operativo.

El modelo es un transformer MoE multimodal (pipeline `image-text-to-text`) de 66.239.071.635 parametros totales, con 48 capas de 512 expertos enrutados, atencion en BF16, capas Gated DeltaNet, HyperConnections, expertos compartidos y una torre de vision. Incorpora un *drafter* MTP (multi-token prediction) para decodificacion especulativa y una tabla de embeddings PLE de 3-gramas de 320.001.536 filas x 160 dimensiones.

La relevancia de este checkpoint es de ingenieria de despliegue: el autor sustituye el fichero `model-fp8-mtp-ple.safetensors` (50,03 GiB) del base por dos ficheros preempaquetados, lo que reduce el tamano de descarga en 24,88 GiB y evita la desquantizacion a BF16 y recuantizacion a NVFP4 en cada carga. El resultado son 98,70 GiB de checkpoint con una huella de VRAM medida de 70,81 GiB asignados. El repositorio no tiene descargas ni *likes* en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido: atencion BF16 + Gated DeltaNet + HyperConnections, 48 capas x 512 expertos enrutados, expertos compartidos, drafter MTP y torre de vision |
| Parametros totales | 66.239.071.635 (~66,24 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (E2M1 con escalas de grupo de 16 en E4M3) en expertos; FP8 E4M3 en los shards PLE del base; 4-bit Lloyd-Max Pair-LUT en la tabla n-gram; BF16 en atencion; etiqueta adicional `8-bit` y `modelopt` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (10 shards `model-00001-of-00010` .. `model-00010-of-00010`) + binario propietario `ngram-q4-pair.bin` (cabecera `TFNGQ4`) |
| Pipeline | image-text-to-text |
| Libreria de carga | tensorfold (libreria propia, no estandar de HuggingFace) |
| Tamano del checkpoint | 98,70 GiB |
| Tamano del repositorio | 106,0 GB |
| Fecha de publicacion | 2026-10-10 |

## Arquitectura y entrenamiento

La arquitectura combina atencion clasica en BF16 con capas Gated DeltaNet (familia de atencion lineal/recurrente con estado) y HyperConnections, mas una capa MoE de 48 capas con 512 expertos enrutados por capa. El checkpoint incluye `embed_tokens`, `lm_head`, expertos compartidos y una torre de vision, coherente con su pipeline `image-text-to-text`. El componente MoE se almacena en NVFP4 sobre los 73,55 GiB de los diez shards safetensors, mientras que la atencion permanece en BF16.

El elemento diferencial es la gestion de la tabla PLE de 3-gramas: 320.001.536 filas x 160 dimensiones que en el base ocupaban 47,68 GiB en FP8 E4M3 con una unica `weight_scale` global. En este repack se almacenan como una tabla contigua alineada a paginas de 4096 bytes con cuantizacion de 4 bits tipo Lloyd-Max Pair-LUT (80 bytes empaquetados por fila), con un codebook incrustado de 16 entradas `bf16` y una tabla de consulta de 256 entradas `bf16x2`, en un fichero de 23,84 GiB que cabe en la particion de 30,43 GiB de RAM del sistema con 0 bytes de *commit charge* y se descomprime en registros de GPU mediante `_ple_embed_q4_pair`. Los expertos enrutados del drafter MTP (3.072 tensores de 128x128 con escalas de bloque FP8 en el base, 2,35 GiB) se preempaquetan ahora en NVFP4 en `model-mtp-ple-spark.safetensors` (1,32 GiB), evitando la conversion en cada carga.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, si hubo RLHF/DPO ni sobre el proceso de destilacion o entrenamiento del drafter speculative. El autor no documenta el origen exacto de los pesos base mas alla de su nombre (`Qwen3.8-Flash-Next-NVFP4`). El tag `qwen4_exp` sugiere una variante experimental, sin mas detalle disponible.

## Capacidades

- Generacion de texto conversacional multi-turno (tag `conversational`).
- Procesamiento de imagen y texto combinados (`image-text-to-text`), con torre de vision incluida en los pesos.
- Decodificacion especulativa mediante drafter MTP, con modo `draft: false` como alternativa serial y coincidencia de tokens bit-exacta al 100 % entre ambos modos segun el autor.
- Reutilizacion de prefijo (*prefix cache*) con TTFT en caliente de 61-78 ms.
- Capacidad de razonamiento y generacion de codigo: no verificada ni documentada en la informacion disponible.
- Soporte de *tool calling* / *function calling*: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: no disponibles; la model card no declara idiomas.
- Modo de razonamiento explicito (*thinking*): no documentado.
- Entrada de audio: no soportada segun la informacion disponible.

## Casos de uso

- Despliegue en estaciones de trabajo Blackwell con memoria unificada: el checkpoint esta dimensionado explicitamente para el NVIDIA RTX Spark N1X con 96,0 GiB de VRAM dedicada, con una huella medida de 70,81 GiB asignados, lo que deja mas de 25 GiB libres para cache KV y batching.
- Asistente multimodal local con privacidad de datos: al ejecutarse en hardware de sobremesa y caber en una sola GPU, permite procesar imagenes y texto sin enviar datos a servicios externos.
- Servicio conversacional de baja latencia: con TTFT en caliente de 61-78 ms y decodificacion especulativa de 107,3-110,0 tok/s en caliente, es adecuado para chat interactivo con reutilizacion de prefijo.
- Procesamiento de documentos con imagen y texto: la torre de vision permite extraer y razonar sobre capturas, diagramas o paginas escaneadas dentro del mismo modelo.
- Generacion de codigo asistida en local: viable por el perfil de latencia, aunque no hay evidencia publicada de rendimiento en benchmarks de codigo para este checkpoint.
- Evaluacion e investigacion de cuantizacion NVFP4: el repack documenta de forma reproducible el impacto de pasar PLE de FP8 a una tabla Lloyd-Max de 4 bits y de preempaquetar el drafter MTP, util para estudiar compromisos entre precision y memoria.
- Sustitucion de modelos MoE de gran tamano en entornos con 128 GB de memoria unificada, donde un checkpoint de 123,58 GiB no cargaria sin *thrashing* de cache de paginas.
- Inferencia por lotes con throughput moderado: el modo serial (`draft: false`) ofrece 20,9-22,5 tok/s, suficiente para tareas por lotes no interactivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor unicamente reporta mediciones de despliegue en el NVIDIA RTX Spark N1X (`sm_121`, CUDA 13.4.2):

| Metrica | Condicion | Valor |
|---|---|---|
| VRAM asignada (`TENSORFOLD_FAST_DENSE=q4`) | Inferencia | 70,81 GiB asignados / 70,95 GiB reservados |
| VRAM libre sobre el carveout de 96,0 GiB | Inferencia | > 25 GiB |
| TTFT | Prompt corto, en frio | 150-210 ms |
| TTFT | Prefijo en cache, en caliente | 61-78 ms |
| Throughput | MTP + Copy Speculative Decode, en caliente | 107,3-110,0 tok/s |
| Throughput | MTP + Copy Speculative Decode, en frio | 82,1-96,5 tok/s |
| Throughput | Decodificacion serial (`draft: false`) | 20,9-22,5 tok/s |
| Coincidencia de tokens | MTP especulativo vs. serial | 100 % bit-exacta (segun el autor) |

## Requisitos de hardware

- VRAM estimada: 70,81 GiB asignados y 70,95 GiB reservados con `TENSORFOLD_FAST_DENSE=q4`, medido en el dispositivo objetivo.
- Memoria total del sistema: 128 GB de memoria unificada, repartida en 96,0 GiB de VRAM dedicada a GPU y 30,43 GiB de RAM de Windows; la tabla PLE de 23,84 GiB debe residir en la particion de RAM y requiere 0 bytes de *commit charge*.
- GPU objetivo: NVIDIA RTX Spark N1X con arquitectura Blackwell `sm_121`, Windows 11 ARM64, CUDA 13.4.2.
- GPU recomendadas alternativas: no disponibles; el autor no declara compatibilidad con A100, H100, RTX 4090 ni otras GPU. Dado el uso de NVFP4 y `sm_121`, la portabilidad a arquitecturas anteriores (Ampere, Ada) no esta documentada y previsiblemente no es directa.
- Cabe en GPU de consumo: no confirmado. El checkpoint de 98,70 GiB excede la VRAM de cualquier GPU de consumo actual (24 GB o menos) y depende de un dispositivo de memoria unificada de 128 GB.
- Opciones de despliegue: exclusivamente la libreria `tensorfold`, con las variables/opciones `TENSORFOLD_FAST_DENSE=q4` y `draft: false`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: TTFT de 150-210 ms en frio y 61-78 ms en caliente para prompts cortos; 107,3-110,0 tok/s en caliente con decodificacion especulativa MTP y 20,9-22,5 tok/s en modo serial. Cifras medidas en el dispositivo objetivo, no extrapolables a otro hardware.
- Almacenamiento: 106,0 GB de repositorio; 98,70 GiB de checkpoint.

## Comparativa con modelos similares

No hay datos suficientes en la informacion proporcionada para establecer una comparativa cuantitativa fiable. El unico termino de comparacion documentado es el propio checkpoint base del que deriva:

| Modelo | Tamano del checkpoint | Almacenamiento PLE | Drafter MTP | Licencia |
|---|---|---|---|---|
| Qwen3.8-Flash-Next-Spark-NVFP4 (este) | 98,70 GiB (73,55 GiB safetensors + 23,84 GiB `ngram-q4-pair.bin` + 1,32 GiB MTP) | Tabla PLE 4-bit Lloyd-Max Pair-LUT en RAM | NVFP4 preempaquetado | Apache 2.0 |
| Qwen3.8-Flash-Next-NVFP4 (base) | 123,58 GiB (`model-fp8-mtp-ple.safetensors` de 50,03 GiB) | 128 shards PLE en FP8 E4M3, 47,68 GiB | 3.072 tensores FP8, conversion a NVFP4 en cada carga | Apache 2.0 |

Frente a otros modelos MoE de ~66 B de parametros totales o frente a alternativas multimodales de la misma categoria, no se dispone de parametros, contexto, rendimiento ni disponibilidad comparables en la informacion proporcionada. Se indica por tanto: no disponible.

## Limitaciones y advertencias

- Modelo derivado de terceros: el autor (mweinbach1) no es el desarrollador original del modelo base; no se documenta el proceso de entrenamiento ni se garantiza la fidelidad de los pesos respecto al original.
- Riesgo de degradacion por cuantizacion: los expertos enrutados se almacenan en NVFP4 y la tabla PLE en 4 bits con un codebook de 16 entradas; el autor no publica evaluaciones de calidad que cuantifiquen la perdida frente al modelo en FP8 o BF16.
- Dependencia de hardware muy especifica: el repack esta disenado para el NVIDIA RTX Spark N1X (`sm_121`, Windows 11 ARM64) y asume una particion concreta de 96,0 GiB de VRAM y 30,43 GiB de RAM. En otras configuraciones el reparto de la tabla PLE puede provocar *thrashing* de cache de paginas.
- Dependencia de software no estandar: requiere la libreria `tensorfold` y un formato binario propietario (`ngram-q4-pair.bin`, cabecera `TFNGQ4`); no es cargable con herramientas habituales como llama.cpp, vLLM u Ollama.
- Idiomas soportados no declarados: no hay informacion sobre cobertura multilingue ni sobre el comportamiento fuera del ingles.
- Longitud de contexto desconocida: no se documenta la ventana de contexto, lo que impide planificar cargas con prompts largos o muchos documentos.
- Ausencia de benchmarks: sin MMLU, HumanEval, GSM8K ni evaluaciones de alucinacion, no es posible estimar la fiabilidad en produccion.
- Adopcion nula verificable: 0 descargas y 0 *likes* en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Sesgos: no documentados en la informacion disponible.
- Riesgo de alucinacion: no cuantificado en la informacion disponible.
- Licencia: Apache 2.0, que permite uso comercial, pero al tratarse de un derivado conviene verificar las condiciones del modelo base original antes de explotarlo en produccion.
- Caveat de produccion: la coincidencia bit-exacta entre decodificacion especulativa y serial es una afirmacion del autor no verificada de forma independiente.

## Enlaces

- HuggingFace: https://huggingface.co/mweinbach1/qwen-3.8-flash-next-nvfp4-rtx-spark
- Model card del autor: incluida en el repositorio anterior (no se ha localizado una URL independiente).
- Repositorio del modelo base `Qwen3.8-Flash-Next-NVFP4`: no disponible.
- Paper o documentacion tecnica de Qwen3.8-Flash-Next: no disponible.
- Repositorio o documentacion de la libreria `tensorfold`: no disponible.
- Demo o espacio de prueba: no disponible.
- Resultados de busqueda web: las consultas realizadas no devolvieron enlaces relevantes al modelo; los unicos resultados obtenidos fueron paginas de ayuda de Gmail sin relacion con el contenido solicitado.
