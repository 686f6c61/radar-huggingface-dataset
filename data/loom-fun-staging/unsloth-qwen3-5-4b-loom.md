# loom-fun-staging/unsloth-Qwen3.5-4B-loom

## Resumen

Loom package para Qwen3.5-4B es una distribución empaquetada del checkpoint GGUF `Qwen3.5-4B-Q4_K_M.gguf` de unsloth, preparada específicamente para su ejecución sobre las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se trata de un modelo nuevo ni de un fine-tune: los pesos son los del Qwen3.5-4B original en cuantización Q4_K_M, y lo que aporta el paquete es un conjunto de programas `.loom` y un `model.json` que permiten servirlo con el runtime Loom de AMD, generado mediante el flujo de trabajo loom-skills.

El modelo base Qwen3.5-4B es un transformer multimodal (entrada de imagen y texto) de 4.000 millones de parámetros con una ventana de contexto de 262.144 tokens por petición, licencia Apache 2.0 y soporte de tool calling y modo de razonamiento. El paquete Loom añade decodificación especulativa DFlash de profundidad 3 activada por defecto, usando como drafter `magnitudedev/Qwen3.5-4B-DFlash-GGUF`, y expone una API compatible con OpenAI en `/v1/chat/completions`.

Su relevancia es fundamentalmente de infraestructura: demuestra que un GGUF de 4B puede servirse en hardware AMD consumer y profesional con aceleración específica para el silicio (gfx1151 y gfx1201), con métricas de rendimiento comparadas contra llama.cpp ROCm y con puertas de corrección (kernel tests, golden, compare, vision, consistency) frente a la referencia de llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto e imagen), pesos del Qwen3.5-4B original; runtime Loom sobre AMD ROCm |
| Parametros totales | 4B (modelo base Qwen3.5-4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector de visión `mmproj-F16.gguf` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF empaquetado como programa Loom (`.loom` + `model.json`) |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones concurrentes |
| Decodificacion especulativa | DFlash, profundidad 3, activada por defecto; drafter `magnitudedev/Qwen3.5-4B-DFlash-GGUF` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Memoria configurada en el ejemplo | `--memory_bytes=28000000000` (28 GB) |

## Arquitectura y entrenamiento

El paquete no modifica los pesos: el checkpoint subyacente es el Qwen3.5-4B de Qwen en cuantización Q4_K_M, un transformer de 4B parámetros con capacidad de entrada de imagen y texto (pipeline `image-text-to-text`). La model card del paquete no aporta datos sobre el entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO), por lo que esa información debe consultarse en la ficha del modelo original de Qwen.

La innovación técnica del paquete está en el runtime: los kernels se generan para las arquitecturas AMD gfx1151 y gfx1201, y el servidor integra decodificación especulativa DFlash de profundidad 3 con un drafter separado, activada por defecto en las filas de un solo stream. La corrección se valida con cinco puertas que comparan la salida contra llama.cpp sobre el mismo GGUF: tests unitarios de kernels, tokens greedy y log-probs top-5 de referencia (`golden`), comparación token a token (`compare`), paridad de visión con el mismo proyector (`vision`) y consistencia bajo concurrencia (`consistency`).

## Capacidades

- Generación de texto y razonamiento: modo de pensamiento desactivado por defecto, activable con `chat_template_kwargs: {"enable_thinking": true}`.
- Entrada de imágenes: soporte de partes `image_url` al estilo OpenAI, con proyector `mmproj-F16.gguf`.
- Tool calling: soporte de `tools` y `tool_calls` al estilo OpenAI.
- API compatible con OpenAI: endpoint `/v1/chat/completions` en `127.0.0.1:8080`.
- Decodificación especulativa DFlash integrada, con profundidad 3 y drafter dedicado.
- Muestreo configurable: `temperature`, `top_p`, `top_k`, `seed`.
- Concurrencia de hasta 4 peticiones simultáneas.
- Contexto de 262.144 tokens por petición.
- Sin soporte de audio (entrada ni salida); sin niveles de esfuerzo de razonamiento (`reasoning effort` no aplicable).

## Casos de uso

- Servicio local de chat multimodal en estaciones de trabajo con Strix Halo: el paquete permite levantar un endpoint compatible con OpenAI en `127.0.0.1:8080` con un solo comando `loom-serve`, útil para prototipar asistentes que reciben texto e imágenes sin depender de la nube.
- Procesamiento de documentos largos: con 262.144 tokens de contexto por petición, se pueden ingerir informes, expedientes o bases de código extensas en una sola llamada; las métricas de prefill del paquete (hasta 32k documentos) permiten estimar el coste de estas cargas.
- Asistentes con tool calling: la compatibilidad con `tools` y `tool_calls` al estilo OpenAI facilita integrar el modelo en orquestadores de agentes existentes que ya hablan ese protocolo, sin adaptadores adicionales.
- Evaluación de hardware AMD para inferencia: las tablas de rendimiento frente a llama.cpp ROCm y las puertas de corrección hacen del paquete una referencia para medir el estado del stack ROCm en gfx1151 y gfx1201 antes de comprometer despliegues.
- Despliegue en Radeon AI PRO R9700 de 32 GB: el paquete está preparado para esta GPU profesional con `--memory_bytes=28000000000`, lo que permite servir el modelo con margen de memoria para el contexto y el proyector de visión.
- Atención al cliente con imágenes: al aceptar partes `image_url`, el modelo puede gestionar conversaciones multi-turno en las que el usuario adjunta capturas o fotos, manteniendo el contexto de la conversación dentro de la ventana disponible.

## Benchmarks y rendimiento

La model card incluye una tabla de rendimiento frente a llama.cpp ROCm en Strix Halo (gfx1151), pero las columnas de llama.cpp, Loom y margen están sin medir ("—"); solo se publican los valores de roofline (techo teórico del hardware a 216 GB/s y 59 TFLOP/s). No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

| Metrica | Roofline (Strix Halo) | llama.cpp | Loom | Margen |
|---|---|---|---|---|
| Decode tok/s, prompt corto | 156,7 | — | — | — |
| Decode tok/s, contexto 2k | 178,6 | — | — | — |
| Decode tok/s, contexto 32k | 124,6 | — | — | — |
| Prefill tok/s, documento 1k | 8188,4 | — | — | — |
| Prefill tok/s, documento 2k | 8114,6 | — | — | — |
| Prefill tok/s, documento 8k | 7698,3 | — | — | — |
| Prefill tok/s, documento 16k | 7205,4 | — | — | — |
| Prefill tok/s, documento 32k | 6387,4 | — | — | — |
| 4 streams, decode agregado tok/s | 307,6 | — | — | — |
| Decodificación especulativa, tokens aceptados | n/a | — | — | — |

Tasa de aceptación del drafter medida en la propia sesión (usada para el cálculo del roofline): 33 % en decode corto, 44 % a 2k y 39 % a 32k. En Radeon AI PRO R9700 (gfx1201) los resultados "no se han vuelto a medir" según la model card. Las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`) figuran como no re-ejecutadas en este paquete; la última pasada fue sobre un build anterior con sha256 `a1becf8`.

## Requisitos de hardware

- VRAM/memoria: el ejemplo de servicio reserva 28 GB (`--memory_bytes=28000000000`), lo que cubre pesos Q4_K_M, proyector de visión F16, drafter DFlash y contexto.
- GPU soportadas de forma explícita: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta soporte para GPUs de consumo distintas de Strix Halo; no hay datos para RTX 4090, A100 o H100, ya que el runtime es específico de AMD ROCm.
- Despliegue: `pip install "hrx-loom[hf]==0.1.0"`, descarga con `loom-fetch --materialize=copy` y servicio con `loom-serve`; expone API estilo OpenAI.
- Rendimiento: solo se publican los valores de roofline del hardware (ver tabla anterior); las cifras reales de Loom y llama.cpp no están medidas en esta ficha.
- Concurrencia: 4 peticiones simultáneas como máximo según la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Loom package Qwen3.5-4B (este) | 4B | 262.144 | Apache 2.0 | GGUF empaquetado en Loom | Runtime AMD específico, DFlash, visión, tool calling |
| Qwen3.5-4B (unsloth GGUF, base) | 4B | no disponible en esta ficha | Apache 2.0 | GGUF | Mismo checkpoint sin empaquetado Loom; ejecutable en llama.cpp y otros runtimes GGUF |
| llama.cpp ROCm (referencia de la model card) | n/a (runtime) | n/a | n/a | n/a | Usado como referencia de corrección y comparación de rendimiento; argumentos del servidor no registrados |

No se dispone de datos de benchmarks de calidad del modelo base ni de alternativas de la misma categoría en la información proporcionada, por lo que la comparación se limita a formato, licencia y runtime.

## Limitaciones y advertencias

- El paquete no incluye pesos nuevos: cualquier limitación del Qwen3.5-4B original (sesgos, alucinaciones, cobertura idiomática) se hereda sin cambios; la model card no documenta ninguna.
- Idiomas soportados: no disponibles en la información; no se debe asumir cobertura multilingüe sin verificar el modelo base.
- Las puertas de corrección no se han re-ejecutado sobre este paquete; la última validación corresponde a un build anterior (sha256 `a1becf8`). No hay garantía de paridad con llama.cpp en este artefacto concreto.
- Los benchmarks de rendimiento frente a llama.cpp están sin medir; solo hay techo teórico (roofline). No se deben citar cifras de tok/s de Loom como reales.
- En Radeon AI PRO R9700 los resultados no se han vuelto a medir.
- La comparación de rendimiento no usa la misma configuración de drafting en ambos motores (Loom con DFlash profundidad 3, llama.cpp sin drafting), lo que invalida una comparación directa de las filas de un solo stream.
- El despliegue está restringido a hardware AMD gfx1151 y gfx1201 con el runtime Loom; no es portable a CUDA ni a otros backends sin trabajo adicional.
- Límite de 4 peticiones concurrentes y de 4.096 tokens de salida por preset, lo que puede ser insuficiente para cargas de producción intensivas.
- Aunque la licencia es Apache 2.0 (permite uso comercial), conviene verificar las condiciones del modelo base y del drafter DFlash por separado.
- El repositorio es de staging (`loom-fun-staging`), con 0 descargas y 0 likes; no debe tratarse como un artefacto estable de producción.

## Enlaces

- Hugging Face del paquete: https://huggingface.co/loom-fun-staging/unsloth-Qwen3.5-4B-loom
- Modelo base GGUF: https://huggingface.co/unsloth/Qwen3.5-4B-GGUF
- Drafter DFlash: https://huggingface.co/magnitudedev/Qwen3.5-4B-DFlash-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo loom-skills: https://github.com/loom-fun/loom-skills
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
