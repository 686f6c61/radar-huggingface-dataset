# infosave/Inkling-2-Mini-cmf

## Resumen

Inkling-2-Mini-cmf es la cuantizacion en formato CMF del modelo Inkling-2-Mini de Thinking Machines, un mixture-of-experts (MoE) de 26.400 millones de parametros totales y 3.400 millones activos por token. El modelo original emplea una arquitectura de transformer con bucles: sus 12 capas centrales se ejecutan tres veces, lo que eleva el computo efectivo a 5.400 millones de parametros por token. Esta version, publicada por el usuario infosave, empaqueta todos los pesos en un unico fichero CMF de 14,69 GB cuantizado a 4 bits en la mayoria de matrices, con la cabeza de salida en 8 bits.

La relevancia de esta ficha radica en el motor de inferencia que la acompania: `cortiq`, un runtime escrito en Rust sin dependencias de Python ni de frameworks de machine learning, con soporte para CUDA, Vulkan, DX12, Metal y CPU. Esto permite ejecutar un MoE de 26.400 millones de parametros en una unica GPU de 24 GB (por ejemplo, una NVIDIA L4) a 51,7 tokens por segundo en CUDA, o en un MacBook Air M4 a 21,5 tokens por segundo mediante Metal, manteniendo una perplejidad en WikiText-2 de 9,057 frente a 8,944 de los pesos originales en f32.

El modelo esta pensado para generacion de texto con razonamiento explicito (modo thinking configurable), tool calling y cargas de trabajo de agentes. Soporta ingles, ruso y chino, y se distribuye bajo licencia Apache 2.0. Esta ficha documenta exclusivamente la version cuantizada CMF; el modelo base y sus componentes adicionales (torre de vision y drafter multi-token) no forman parte de este fichero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas en bucle (looped transformer); 12 capas centrales ejecutadas 3 veces |
| Parametros totales | 26.400 millones (26,4B) |
| Parametros activos | 3.400 millones por token; 5.400 millones efectivos por el bucle de capas |
| Longitud de contexto | No disponible de forma explicita; se han medido prompts de hasta 32.768 tokens |
| Tipos de cuantizacion | q4tp (4 bits en expertos enrutados, atencion y matrices densas; cabeza en 8 bits; embeddings en f16; routers, convoluciones, proyecciones de posicion relativa y puertas en f32) |
| Idiomas soportados | Ingles (en), ruso (ru), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | CMF (fichero unico de 14,69 GB); los pesos originales del release base usan NVFP4 y MXFP8 en los expertos enrutados |

## Arquitectura y entrenamiento

La arquitectura es un mixture-of-experts con 26.400 millones de parametros totales y 3.400 millones activos por token, sobre una estructura de transformer con bucles: las 12 capas intermedias se ejecutan tres veces, de modo que el computo efectivo por token asciende a 5.400 millones de parametros. Los expertos enrutados del release original se distribuyen en NVFP4 (capas 0-19) y MXFP8 (capas 20-23). En esta version CMF se decodifican y recodifican como q4tp.

El proceso de cuantizacion aplica GPTQ con redondeo sobre 3.072 tokens de prosa, codigo Rust y codigo Python que no forman parte de los textos de evaluacion. La atencion, su puerta de salida y las proyecciones de posicion relativa se cuantizan de este modo; la cabeza de salida queda en 8 bits, los embeddings en f16, y los routers, convoluciones, consultas de mezcla de bloques y puertas de mensaje se mantienen en f32. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto con razonamiento explicito: modo thinking configurable mediante `--no-think` y `--reasoning-effort` (valores como `low`).
- Tool calling y function calling, segun los tags del modelo.
- Razonamiento multi-paso y flujos de agentes.
- Capacidades multilingues en ingles, ruso y chino.
- Inferencia en multiples backends de GPU (CUDA, Vulkan, DX12, Metal) y en CPU.
- Ejecucion sin Python ni frameworks de ML gracias al motor `cortiq` escrito en Rust.
- La torre de vision y el drafter multi-token del release original no estan incluidos en este fichero CMF.

## Casos de uso

- Despliegue en GPU de 24 GB: el modelo completo cabe en una unica NVIDIA L4 (14,0-15,1 GB de memoria pico) o en una RTX 4090, permitiendo servir un MoE de 26,4B en hardware de gama profesional sin multi-GPU.
- Asistentes con razonamiento en produccion: el modo thinking configurable (`--reasoning-effort low`, `--no-think`) permite ajustar el coste computacional por consulta segun la complejidad de la tarea.
- Procesamiento de documentos largos: con prompts de 32.768 tokens leidos en 111 s y decodificacion posterior a 39,1 tok/s en CUDA, es viable el analisis de contratos, informes o bases de codigo extensas en una sola pasada.
- Agentes con tool calling: la combinacion de razonamiento multi-paso y function calling lo hace apto para orquestacion de herramientas en pipelines automatizados.
- Inferencia en portatiles Apple Silicon: a 21,5 tok/s en Metal sobre un MacBook Air M4 de 24 GB, permite desarrollo local y prototipado sin GPU dedicada.
- Servicio multilingue en ingles, ruso y chino: util para atencion al cliente o generacion de contenido en esos tres idiomas.
- Entornos sin Python: el motor `cortiq` (Rust) facilita el despliegue en contenedores minimos o sistemas embebidos donde no se desea una pila de ML completa.
- Ejecucion en CPU para cargas de baja concurrencia: 10,3 tok/s en un M4 de 10 nucleos o 2,9 tok/s en un Xeon de 6 nucleos, suficiente para tareas por lotes no interactivas.

## Benchmarks y rendimiento

Calidad (perplejidad en WikiText-2 y codigo):

| Metrica | CMF q4tp | Release original f32 (Transformers) |
|---|---:|---:|
| WikiText-2 ppl (12 ventanas de 512 tokens) | 9,057 | 8,944 |
| Rust ppl | 3,148 | 3,124 |
| Python ppl | 2,861 | 2,851 |
| WikiText-2 ppl (ventanas de 4.096 tokens) | 7,383 | 7,310 |

Consistencia entre backends (mismo fichero):

| Backend | WikiText-2 ppl | Python ppl | WikiText-2 (4.096 tokens) |
|---|---:|---:|---:|
| CUDA (NVIDIA L4) | 9,057 | 2,861 | 7,383 |
| Vulkan (NVIDIA L4) | 9,057 | no disponible | 7,377 |
| Metal (Apple M4) | 9,055 | 2,866 | 7,380 |

Rendimiento en CUDA (NVIDIA L4, 24 GB):

| Prompt (tokens) | Primer token (s) | Decodificacion (tok/s) | Memoria pico (GB) |
|---:|---:|---:|---:|
| sin prompt | no aplica | 51,7 | no disponible |
| 512 | 0,93 | 49,6 | 14,0 |
| 2.048 | 3,82 | 48,5 | 14,1 |
| 8.192 | 18,2 | 45,9 | 14,3 |
| 16.384 | 42,7 | 43,5 | 14,5 |
| 32.768 | 111,0 | 39,1 | 15,1 |

Rendimiento en Vulkan (NVIDIA L4, 24 GB):

| Prompt (tokens) | Primer token (s) | Decodificacion (tok/s) | Memoria pico (GB) |
|---:|---:|---:|---:|
| sin prompt | no aplica | 18,7 | no disponible |
| 512 | 3,99 | 17,5 | 13,7 |
| 2.048 | 17,9 | 16,5 | 13,7 |
| 8.192 | 79,7 | 14,5 | 14,6 |
| 16.384 | 188,0 | 13,0 | 15,5 |

Rendimiento en Metal (MacBook Air M4, 24 GB):

| Prompt (tokens) | Primer token (s) | Decodificacion (tok/s) |
|---:|---:|---:|
| sin prompt | no aplica | 21,5 |
| 512 | 3,70 | 20,6 |
| 2.048 | 18,2 | 19,3 |
| 8.192 | 86,4 | 17,0 |

Rendimiento en CPU:

| Plataforma | Decodificacion (tok/s) | Prompt de 512 tokens | Decodificacion posterior |
|---|---:|---:|---:|
| MacBook Air M4 (10 nucleos, 24 GB) | 10,3 | 22,6 s | 9,7 |
| Host Colab L4 (Xeon 2,2 GHz, 6 nucleos / 12 hilos) | 2,9 | 70,1 s | 2,8 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 14,0-15,1 GB en CUDA para prompts de hasta 32.768 tokens; 13,7-15,5 GB en Vulkan; el fichero ocupa 14,69 GB en disco.
- GPU recomendadas: NVIDIA L4 (24 GB) medida con CUDA y Vulkan; cualquier GPU NVIDIA con 16 GB o mas; AMD e Intel mediante Vulkan/DX12; Apple Silicon mediante Metal.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas de VRAM (por ejemplo, RTX 4090 de 24 GB), aunque no se han publicado mediciones en esas tarjetas.
- Despliegue: motor `cortiq` 0.9.11 o superior, instalable con `cargo install cortiq-cli --features cuda`; binarios precompilados para Linux, macOS y Windows. No usa vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput medidos: 51,7 tok/s sin prompt en L4/CUDA; primer token de 0,93 s (512 tokens) a 111 s (32.768 tokens); 21,5 tok/s en M4/Metal; 10,3 tok/s en CPU M4.
- Memoria del sistema: el fichero se mantiene mapeado en memoria en Metal; se recomienda al menos 24 GB de RAM unificada para ejecucion en Apple Silicon.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato / runtime |
|---|---|---|---|---|
| Inkling-2-Mini-cmf (esta ficha) | 26,4B / 3,4B (5,4B efectivos) | hasta 32.768 tokens medidos | Apache 2.0 | CMF, motor cortiq (Rust) |
| Inkling-2-Mini (release original) | 26,4B / 3,4B (5,4B efectivos) | no disponible | Apache 2.0 | Pesos NVFP4/MXFP8, Transformers |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye datos de otros modelos comparables (por ejemplo, MoE de ~25-30B de otros desarrolladores) que permitan una comparacion de rendimiento o licencia.

## Limitaciones y advertencias

- La cuantizacion q4tp introduce una degradacion medible: perplejidad en WikiText-2 de 9,057 frente a 8,944 del release en f32 (un 1,3 % superior), y de 7,383 frente a 7,310 en ventanas de 4.096 tokens.
- El fichero no incluye la torre de vision ni el drafter multi-token del release original; no es posible usar entrada multimodal ni decodificacion especulativa con esta version.
- Solo se declaran tres idiomas (en, ru, zh); el rendimiento en castellano no esta documentado.
- No se han publicado evaluaciones de sesgo, toxicidad o alucinacion en la informacion disponible.
- El motor `cortiq` es un proyecto de un unico autor (infosave); requiere la version 0.9.11 o superior y su ecosistema es mucho mas reducido que el de vLLM, llama.cpp u Ollama.
- La longitud maxima de contexto no se declara explicitamente; las mediciones llegan a 32.768 tokens, pero no se garantiza un limite superior.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que implica poca validacion por parte de la comunidad.
- Aunque la licencia es Apache 2.0 (permite uso comercial), conviene verificar las condiciones del modelo base de Thinking Machines antes de un despliegue en produccion.
- En Vulkan el rendimiento cae aproximadamente a un tercio del de CUDA en la misma tarjeta (18,7 frente a 51,7 tok/s sin prompt).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/infosave/Inkling-2-Mini-cmf
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio del formato CMF y motor cortiq: https://github.com/infosave2007/cmf
- Binarios precompilados de cortiq: https://github.com/infosave2007/cmf/releases
