# immiq/Huihui-Qwen3.8-Flash-Next-abliterated-Orinfer-E8P-Q2A8

## Resumen

Este repositorio contiene una version cuantizada del modelo Huihui-Qwen3.8-Flash-Next-abliterated, publicada por el usuario immiq, lista para desplegarse en una placa Jetson AGX Orin de 64 GB mediante el runtime Orinfer. Se trata de un modelo de vision-lenguaje (image-text-to-text) con arquitectura de mezcla de expertos (MoE) que admite texto, imagenes, multiples imagenes, modo thinking, cache de prefijos y MTP (multi-token prediction) nativo. El modelo fuente ha sido sometido a un proceso de "abliteration" para reducir los rechazos, de modo que responde con menos negativas a peticiones que un modelo alineado convencional rechazaria.

El modelo mantiene una ventana de contexto de 262.144 tokens, que incluye prompt, imagenes y salida, y se distribuye en un directorio de aproximadamente 51,2 GB, con unos 34,52 GiB de pesos en memoria de GPU. La relevancia actual radica en que traslada un VLM de gran tamano y contexto muy largo a hardware de borde (Jetson AGX Orin 64GB), usando una cuantizacion mixta agresiva (E8P casi-2-bit para los expertos enrutados, INT8/W8 para el resto) que permite ejecutarlo en un dispositivo de bajo consumo en lugar de en un cluster de GPUs de datacenter.

La licencia es la Qwen Community License 1.0 para los pesos, mientras que el codigo de Orinfer y el paquete de ejecucion se distribuyen bajo LGPL-3.0-or-later. Los idiomas declarados son chino (zh) e ingles (en). El modelo acumula un numero muy bajo de descargas y no cuenta con una comunidad consolidada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) vision-lenguaje basada en transformer; vision encoder en FP16 |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (prompt + imagenes + salida) |
| Tipos de cuantizacion | E8P casi-2-bit con rotacion para expertos enrutados; W8 para proyecciones densas, expertos compartidos y cabeza de salida; KV cache INT8 grupo-64 con escalas FP16; vision encoder FP16 |
| Idiomas soportados | zh (chino), en (ingles) |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0); el runtime Orinfer y el paquete de ejecucion bajo LGPL-3.0-or-later |
| Formato de pesos | safetensors |
| Tamano del repositorio | 51,7 GB (directorio del modelo ~51,2 GB) |
| Pesos en GPU (solo lectura) | ~34,52 GiB |
| Pipeline | image-text-to-text |
| Modelo base | huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated (revision 298f946) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion de despliegue, no un reentrenamiento: parte de huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated, que a su vez deriva de Qwen/Qwen3.8-Flash-Next. La arquitectura subyacente es una mezcla de expertos (MoE) de tipo vision-lenguaje, con un vision encoder mantenido en FP16 y un conjunto de expertos enrutados cuantizados de forma agresiva. La innovacion principal de este repositorio reside en el esquema de compresion: E8P almacena cada vector de ocho pesos en un codigo de 16 bits, aplicando antes una rotacion Hadamard firmada y fija sobre 128 canales de entrada para repartir la energia de los valores atipicos. Los metadatos de escalas y libro de codigos anaden un pequeno sobrecoste por encima de los 2 bits por peso de experto. La cuantizacion es de solo pesos, con semilla 20261002. Las proyecciones densas, los expertos compartidos y la cabeza de salida se mantienen en W8, con mayor precision en las rutas sensibles, y la KV cache usa INT8 con escalas FP16.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. Lo unico documentado sobre el ajuste es que el modelo fuente ha sido sometido a abliteration para reducir los rechazos. El runtime Orinfer aporta ademas decodificacion especulativa mediante MTP (hasta 7 borradores), CUDA Graph completo y cache de prefijos, elementos que forman parte del stack de ejecucion y no del entrenamiento.

## Capacidades

- Generacion de texto y conversacion multi-turno en chino e ingles.
- Procesamiento de imagenes en modo image-text-to-text, incluyendo multiples imagenes en una misma peticion.
- Modo thinking opcional, activable con `enable_thinking: true`, para tareas de razonamiento extendido.
- MTP (multi-token prediction) nativo con hasta 7 borradores, que actua como decodificacion especulativa.
- Cache de prefijos configurable (por ejemplo, 512 MiB) para reutilizar contexto en peticiones repetidas.
- Contexto muy largo de 262.144 tokens, apto para prompts extensos y documentos con imagenes.
- Endpoint compatible con la API OpenAI Chat Completions a traves de Orinfer.
- Tool calling / function calling: no documentado en la informacion disponible.
- Capacidades de audio: no disponibles.
- Idiomas distintos de zh y en: no disponibles.

## Casos de uso

- Inferencia VLM en el borde: el modelo esta pensado para ejecutarse en una Jetson AGX Orin 64GB con Orinfer, lo que permite desplegar un modelo de vision-lenguaje con contexto de 262.144 tokens en un dispositivo embebido sin conexion a la nube.
- Analisis de imagenes multilingue chino-ingles: al soportar image-text-to-text y multiples imagenes, encaja en tareas de descripcion, extraccion de informacion y respuesta a preguntas sobre imagenes en entornos zh/en.
- Generacion de codigo en local: los datos de decodificacion del autor miden tareas de codigo en Python (ordenacion merge sort, 53,84 tokens/s), Rust (LRU cache, 41,19 tokens/s) y TypeScript (async map, 30,25 tokens/s), por lo que es viable para asistencia de programacion en el propio dispositivo.
- Asistente conversacional on-premise: al ejecutarse en hardware local y disponer de endpoint compatible con OpenAI, puede integrarse en aplicaciones de chat privadas donde los datos no deben salir del dispositivo.
- Procesamiento de documentos largos con imagenes: la ventana de 262.144 tokens permite introducir prompts extensos e imagenes en una sola peticion, util para resumenes y analisis de documentacion tecnica.
- Robotica y sistemas embebidos con vision: la combinacion de vision encoder, contexto largo y bajo consumo de una Jetson lo hace adecuado para pipelines de percepcion y razonamiento en robotica autonoma.
- Investigacion sobre abliteration y evaluacion de rechazos: al ser un modelo abliterado, sirve para estudiar el comportamiento de modelos sin alineacion estricta y comparar tasas de rechazo frente a la version original.
- Despliegue de alto rendimiento con MTP: la decodificacion especulativa con hasta 7 borradores y el CUDA Graph completo permiten maximizar el throughput en un unico stream en la Jetson.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card unicamente proporciona mediciones de rendimiento propias, obtenidas en una Jetson AGX Orin 64GB, MAXN, GPU a 1,30 GHz y CUDA 12.6.

Prefill de texto (single stream, CUDA Graph completo, MTP hasta 7 borradores, thinking off, cache de prefijos desactivada; mediana de tres peticiones calentadas):

| Tokens de entrada | Tokens/s | Tiempo hasta el primer token |
| ---: | ---: | ---: |
| 512 | 589 | 0,87 s |
| 2.048 | 794 | 2,58 s |
| 8.192 | 809 | 10,13 s |

Decodificacion con MTP (single stream, `decode_only` CUDA Graph, MTP hasta 7 borradores, decodificacion greedy, semilla 20261002, thinking off, 96 tokens generados):

| Tarea de generacion de codigo | Tokens/s |
| --- | ---: |
| Python merge sort | 53,84 |
| Rust LRU cache | 41,19 |
| TypeScript async map | 30,25 |

## Requisitos de hardware

- Plataforma objetivo: Jetson AGX Orin 64GB (medido con MAXN, GPU a 1,30 GHz, CUDA 12.6).
- Memoria para pesos: aproximadamente 34,52 GiB en GPU en modo solo lectura; el directorio del modelo ocupa unos 51,2 GB en disco.
- VRAM total necesaria: no disponible de forma exacta; hay que sumar a los 34,52 GiB de pesos la KV cache (INT8 grupo-64 con escalas FP16) y el resto de buffers de ejecucion.
- GPU de consumo: no cabe en GPU de consumo de 24 GB (por ejemplo RTX 4090) sin recurrir a otras cuantizaciones; este repositorio concreto esta pensado para la memoria unificada de 64 GB de la Jetson AGX Orin.
- GPU de datacenter: no se documentan mediciones ni compatibilidad para A100, H100 u otras; el modelo esta empaquetado para el stack de Orinfer sobre Jetson (sm87).
- Despliegue: requiere el runtime Orinfer y su paquete de ejecucion especifico (tag `execution-flash-next-sm87-5bcf64efe5d8`). Se sirve con `orinfer serve` y expone un endpoint compatible con OpenAI en `/v1`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Parametros de ejecucion destacados: `--max-active-requests 1`, `--prefix-cache-mib 512`, `--cuda-graph full`, `--mtp-drafts 7`.
- Rendimiento estimado: prefill de 589 a 809 tokens/s segun la longitud de entrada; decodificacion de 30,25 a 53,84 tokens/s segun la tarea (datos del propio autor en Jetson AGX Orin 64GB).

## Comparativa con modelos similares

No se dispone de datos de parametros, benchmarks ni contexto de los modelos comparables mas alla de lo declarado. La comparacion se limita a la relacion de cuantizacion y licencia.

| Modelo | Relacion | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| immiq/Huihui-Qwen3.8-Flash-Next-abliterated-Orinfer-E8P-Q2A8 | Cuantizacion de despliegue | E8P casi-2-bit + W8 + INT8 KV | 262.144 | Qwen Community 1.0 | HuggingFace, requiere Orinfer |
| huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated | Modelo base (abliterado) | Precision completa (no especificada) | no disponible | Qwen Community 1.0 | HuggingFace |
| Qwen/Qwen3.8-Flash-Next | Modelo original | Precision completa (no especificada) | no disponible | Qwen Community 1.0 | HuggingFace |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de estos tres modelos entre si ni frente a alternativas de terceros de la misma categoria.

## Limitaciones y advertencias

- Modelo abliterado: el proceso de abliteration reduce deliberadamente los rechazos, lo que incrementa el riesgo de generar contenido danino, ofensivo o inapropiado. No es adecuado para aplicaciones orientadas al publico sin filtros adicionales de seguridad.
- Riesgo de alucinacion: no se documentan evaluaciones de veracidad; como cualquier modelo generativo, puede producir informacion falsa con aparente seguridad.
- Idiomas: solo se declaran zh y en; no hay soporte confirmado de castellano ni de otros idiomas.
- Licencia: los pesos se rigen por la Qwen Community License 1.0, con posibles condiciones y restricciones para uso comercial; el runtime Orinfer y el paquete de ejecucion usan LGPL-3.0-or-later. Es imprescindible revisar los terminos antes de un uso en produccion.
- Dependencia de plataforma: el modelo solo se documenta para Jetson AGX Orin 64GB con Orinfer; no hay soporte declarado para stacks de inferencia habituales, lo que limita la portabilidad.
- Madurez: el repositorio tiene 20 descargas y 0 likes, sin comunidad consolidada ni validacion externa, lo que implica un riesgo de mantenimiento y soporte.
- Memoria: los pesos ocupan unos 34,52 GiB, por lo que el despliegue exige hardware con memoria unificada de 64 GB o superior.
- Parametros y benchmarks ausentes: no se publica el numero de parametros totales ni activos, ni resultados en benchmarks academicos, lo que dificulta la comparacion objetiva con alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/immiq/Huihui-Qwen3.8-Flash-Next-abliterated-Orinfer-E8P-Q2A8
- Modelo base abliterado: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated
- Revision del modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated/tree/298f94632b784e26a7fe576114f82066689d5baa
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio de Orinfer: https://github.com/iMMIQ/orinfer
- Paquete de ejecucion: https://github.com/iMMIQ/orinfer/releases/tag/execution-flash-next-sm87-5bcf64efe5d8
- Documentacion de serving de Orinfer: https://github.com/iMMIQ/orinfer/blob/main/docs/serving.md
- Licencia del modelo: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated/blob/298f94632b784e26a7fe576114f82066689d5baa/LICENSE
- Licencia de Orinfer (LGPL-3.0-or-later): https://github.com/iMMIQ/orinfer/blob/main/LICENSE
