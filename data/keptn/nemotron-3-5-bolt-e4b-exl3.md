# keptn/nemotron-3.5-bolt-e4b-exl3

## Resumen

Nemotron 3.5 Bolt E4B EXL3 es una cuantizacion de precision mixta del modelo multimodal NVIDIA Nemotron 3.5 Bolt E4B, publicada por el usuario keptn. El modelo base es un transformer con capacidad de vision (pipeline `image-text-to-text`) desarrollado por NVIDIA, y esta version lo empaqueta en dos ficheros EXL3-V3 (trellis) de 4,07 y 6,0 bits por peso para el motor de inferencia radiance sobre GPUs AMD RDNA4. Incorpora ademas el drafter DFlash de NVIDIA para decodificacion especulativa.

La relevancia de esta ficha es doble: por un lado documenta el modelo base Nemotron 3.5 Bolt E4B; por otro, es un ejemplo practico de cuantizacion agresiva (4-6 bpw) con preservacion de calidad medida en KL divergence frente al original en bf16, orientada a hardware AMD consumer y profesional (RDNA4, Radeon AI PRO R9700) mediante ROCm. El contexto soportado es de 65.536 tokens y el repo ocupa 16,9 GB.

El modelo resuelve el problema de ejecutar un modelo multimodal de NVIDIA con decodificacion especulativa en GPUs AMD con 32 GB de VRAM, algo que historicamente ha estado dominado por CUDA. La licencia es OpenMDW 1.1 (openmdw-1.1), y el modelo se publico el 22 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion por capas (solo 24 de 42 capas almacenan KV; las ultimas 18 leen la cache de las capas 22 y 23), multimodal texto-imagen |
| Parametros totales | no disponible (denominacion E4B sugiere ~4B efectivos; no confirmado en la informacion) |
| Parametros activos | no disponible |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantizacion | EXL3-V3 trellis, 4,07 bpw (mixta, 3,0-6,0 bits por capa) y 6,0 bpw (uniforme); activaciones int8 `a8g128` en prefill de 512 filas o mas; lm_head int8; tabla de embedding por capa 5-bit; token embedding bf16 |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 (`openmdw-1.1`) |
| Formato de pesos | EXL3-V3 `.rad` (dos ficheros: 7,45 GiB a 4,07 bpw y 8,33 GiB a 6,0 bpw) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de NVIDIA que acepta texto e imagen como entrada. La arquitectura presenta una particularidad relevante para el consumo de memoria: de las 42 capas, solo 24 mantienen cache KV propia, mientras que las 18 ultimas reutilizan la cache de las capas 22 y 23, lo que reduce el coste del KV cache. El contexto maximo es de 65.536 tokens.

Esta publicacion no entrena el modelo, sino que lo cuantiza. El proceso parte del checkpoint bf16 `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16` y produce pesos EXL3-V3 trellis con codebook `mad`. El fichero de 4,07 bpw usa anchos por capa (de 3,0 a 6,0 bits) para minimizar la perdida de calidad a igual tamano; el de 6,0 bpw usa 6,0 bits en todas las capas. Se anaden activaciones int8 (`a8g128`) en prefill de 512 filas o mas, lm_head int8 con una escala bf16 por cada 128 pesos, y una tabla de embedding por capa de 5 bits (32 valores, escala bf16 por 128 pesos, transformada de Hadamard de 128 puntos). Las tablas de embedding se mantienen en memoria host fijada (pinned). Ademas, se integra el drafter DFlash de NVIDIA (5 capas, int8, 7 tokens de borrador) para decodificacion especulativa.

## Capacidades

- Generacion de texto y razonamiento, con modo "thinking" desactivado por defecto y activable por peticion mediante `chat_template_kwargs: {"enable_thinking": true}`.
- Entrada de imagen (pipeline `image-text-to-text`), es decir, comprension de imagenes combinada con texto.
- Decodificacion especulativa mediante el drafter DFlash de NVIDIA, con 7 tokens de borrador (entrenado sobre bloques de 8).
- Plantilla de chat propia del modelo (heredada de NVIDIA) con soporte de modo pensamiento.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: no disponible en la informacion.

## Casos de uso

- Inferencia multimodal en GPUs AMD RDNA4: el modelo esta empaquetado especificamente para el motor radiance sobre ROCm, lo que permite ejecutar un modelo de NVIDIA con vision en tarjetas Radeon AI PRO R9700 (32 GB), un escenario tradicionalmente limitado por CUDA.
- Despliegue con contexto largo: con 65.536 tokens y un pool KV de 524.288 tokens (8 secuencias a longitud completa), es adecuado para conversaciones multi-turno extensas o analisis de documentos largos junto a imagenes.
- Servicio de chat con latencia reducida: la decodificacion especulativa con 7 tokens de borrador acelera la generacion en entornos de atencion al cliente o asistentes interactivos donde la latencia importa.
- Procesamiento de documentos con imagen: al aceptar imagen y texto, puede extraer y razonar sobre contenido de capturas, diagramas o documentos escaneados en pipelines de automatizacion.
- Evaluacion de cuantizaciones: el fichero incluye metricas KL frente al bf16, por lo que sirve como referencia para comparar estrategias de cuantizacion (4,07 bpw vs 6,0 bpw vs int8 vs a4) en investigacion de compresion de modelos.
- Prototipado en una sola GPU de 32 GB: con pesos de 4,48-5,35 GiB y KV cache de 9,22 GiB a contexto completo, cabe en una unica tarjeta, lo que facilita desarrollo y pruebas sin infraestructura multi-GPU.
- Despliegue en dos tarjetas con tensor parallelism: configurando `tp: 2` y `p2p: on`, se reparte el modelo y el KV cache (4,61 GiB por tarjeta) para mayor paralelismo o contexto.

## Benchmarks y rendimiento

La model card no incluye benchmarks estandar (MMLU, HumanEval, GSM8K). Proporciona metricas de fidelidad de cuantizacion: distancia KL media al original bf16 sobre 80 preguntas de MT-Bench (ambos turnos, 42.283 tokens de respuesta, una tarjeta, KV i8).

| Fichero | Tamano | KL media | Token top identico |
|---|---|---|---|
| EXL3 4,07 bpw | 7,45 GiB | 0,0208 | 95,9% |
| EXL3 6,0 bpw | 8,33 GiB | 0,00266 | 98,5% |
| keptn/nemotron-3.5-bolt-e4b-a4 | 11,52 GiB | 0,0534 | 93,7% |
| keptn/nemotron-3.5-bolt-e4b-i8g | 12,85 GiB | 0,00294 | 98,4% |
| keptn/nemotron-3.5-bolt-e4b-bf16 | 17,03 GiB | 0,00054 | 99,3% |

Segun el autor, la mezcla de 4,07 bpw tiene un 18% menos de KL que ficheros EXL3 uniformes del mismo tamano. La tabla de embedding de 5 bits y las activaciones int8 anaden 0,00025 (4,07 bpw) y 0,00046 (6,0 bpw) a la KL media. No se han publicado resultados de benchmarks de tareas en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: pesos de 4,48 GiB (4,07 bpw) o 5,35 GiB (6,0 bpw) en una tarjeta; KV cache de 9,22 GiB para 8 secuencias a 65.536 tokens con KV i8. En dos tarjetas: 2,77-3,20 GiB de pesos y 4,61 GiB de KV por tarjeta.
- Memoria host: las tablas de token embedding y de embedding por capa (2,96 GiB en total) residen en memoria host fijada.
- GPU recomendadas: Radeon AI PRO R9700 (32 GB, RDNA4); probado en una y dos tarjetas. Otras GPUs AMD con ROCm y suficiente VRAM podrian funcionar, pero no se confirma en la informacion.
- Cabe en consumer GPU: si, en GPUs AMD RDNA4 con 32 GB; no se confirma para GPUs con menos VRAM ni para GPUs NVIDIA.
- Opciones de despliegue: exclusivamente el motor radiance (ROCm), requiriendo los PR #401 y #537, aun no incluidos en una release; se debe compilar la imagen desde la rama del PR #537. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La decodificacion especulativa con 7 tokens de borrador esta pensada para reducir latencia, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Calidad (KL vs bf16) |
|---|---|---|---|---|---|
| Este modelo (EXL3 6,0 bpw) | no disponible | 65.536 | EXL3 `.rad` | OpenMDW 1.1 | 0,00266 |
| keptn/nemotron-3.5-bolt-e4b-i8g | mismo base | 65.536 (heredado) | int8 | OpenMDW 1.1 | 0,00294 |
| keptn/nemotron-3.5-bolt-e4b-a4 | mismo base | 65.536 (heredado) | 4-bit | OpenMDW 1.1 | 0,0534 |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 | mismo base | 65.536 | bf16 (safetensors) | OpenMDW 1.1 | 0,00054 (referencia) |

Las alternativas comparables son otras cuantizaciones del mismo modelo base. No se dispone de informacion sobre modelos de otros autores con los que comparar parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Requiere una version de radiance no publicada en release (PR #401 y PR #537), lo que complica el despliegue en produccion.
- Solo funciona en el motor radiance sobre ROCm/RDNA4; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- La cuantizacion introduce degradacion medible: 0,0208 de KL media y 95,9% de coincidencia en el token top para 4,07 bpw (frente a 0,00054 y 99,3% del bf16).
- El drafter DFlash solo opera con 7 tokens de borrador (entrenado sobre bloques de 8); desactivarlo (`num-speculative-tokens: 0`) elimina la aceleracion.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion, cobertura idiomatica ni limitaciones especificas de contexto del modelo base.
- La licencia OpenMDW 1.1 debe revisarse para uso comercial; la model card la marca como `license: other` con nombre `openmdw-1.1`.
- El modelo base es de NVIDIA y esta redistribuido por un tercero (keptn); conviene verificar los terminos del modelo original.
- El contexto maximo es de 65.536 tokens; no se documenta comportamiento mas alla de esa longitud.
- El uso de memoria host fijada (2,96 GiB) debe tenerse en cuenta en el dimensionamiento del servidor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/keptn/nemotron-3.5-bolt-e4b-exl3
- Modelo base bf16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Modelo base DFlash: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-DFlash
- Cuantizacion a4: https://huggingface.co/keptn/nemotron-3.5-bolt-e4b-a4
- Cuantizacion i8g: https://huggingface.co/keptn/nemotron-3.5-bolt-e4b-i8g
- Cuantizacion bf16 (keptn): https://huggingface.co/keptn/nemotron-3.5-bolt-e4b-bf16
- Motor radiance: https://codeberg.org/StillDeadcode/radiance
- PR #401 de radiance: https://codeberg.org/StillDeadcode/radiance/pulls/401
- PR #537 de radiance: https://codeberg.org/StillDeadcode/radiance/pulls/537
- Guia de compilacion de radiance: https://codeberg.org/StillDeadcode/radiance/src/branch/main/docs/DOCKER.md#build-the-image
- Guia de ejecucion de radiance: https://codeberg.org/StillDeadcode/radiance/src/branch/main/docs/DOCKER.md#run-it
