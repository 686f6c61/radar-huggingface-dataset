# loom-fun/unsloth-gemma-4-26B-A4B-it-qat-loom

## Resumen

`loom-fun/unsloth-gemma-4-26B-A4B-it-qat-loom` es un paquete de despliegue en formato `.loom` para el checkpoint GGUF `gemma-4-26B-A4B-it-qat-UD-Q4_K_XL.gguf` publicado por Unsloth, que a su vez es una cuantizacion QAT (quantization-aware training) del modelo Gemma 4 26B-A4B en variante instruct. El paquete lo publica el proyecto Loom (organizacion `loom-fun`) y esta pensado especificamente para GPUs AMD: el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB).

El modelo subyacente es un transformer de tipo Mixture-of-Experts con 26 mil millones de parametros totales y 4 mil millones activos por token (de ahi el sufijo A4B), con una longitud de contexto nativa de 262.144 tokens segun la model card del paquete. La relevancia de esta ficha no esta en el modelo en si, sino en el empaquetado: Loom proporciona programas precompilados y una tarjeta `model.json` que permiten servir el GGUF en hardware AMD con un rendimiento medido superior a llama.cpp ROCm y llama.cpp Vulkan en decodificacion y prefill.

El repositorio tiene 0 GB de tamano declarado y 0 descargas en el momento de la consulta, lo que sugiere que los pesos no estan alojados directamente en el repo sino que se materializan mediante `loom-fetch` desde el checkpoint base de Unsloth. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE); detalles internos no disponibles |
| Parametros totales | 26B |
| Parametros activos | 4B (segun nomenclatura A4B) |
| Longitud de contexto | 262.144 tokens (nativa); preset Strix Halo sirve hasta 262.144; preset R9700 sirve hasta 36.864 |
| Tipos de cuantizacion | Q4_K_XL (UD-Q4_K_XL de Unsloth); QAT |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (checkpoint base); paquete `.loom` con programas y `model.json` |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 26B-A4B en variante instruct, con arquitectura Mixture-of-Experts: 26B parametros totales y 4B activos por token. La variante `qat` indica que el checkpoint fue sometido a quantization-aware training, de modo que los pesos cuantizados a Q4 conservan mejor la calidad que una cuantizacion post-entrenamiento equivalente. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en la informacion proporcionada.

El paquete Loom no modifica el checkpoint: segun la model card, es "the unmodified GGUF checkpoint". Lo que anade es un conjunto de programas `.loom` y una tarjeta `model.json` generados con el flujo `loom-skills`, que definen presets de memoria (`--pool_backing=fixed`), precarga de parametros (`--parameter_mode=preload`) y espera activa de finalizacion en GPU (`completion_spin_ns=4294967295`). El paquete expone una API compatible con OpenAI (`/v1/chat/completions`) y permite desactivar el modo thinking mediante `chat_template_kwargs: {"enable_thinking": false}`.

## Capacidades

- Generacion de texto conversacional en formato instruct, servida mediante API compatible con OpenAI Chat Completions.
- Modo thinking opcional, desactivable por peticion con `enable_thinking: false`.
- Contexto largo: hasta 262.144 tokens en el preset de Strix Halo y 36.864 en el de R9700.
- Procesamiento por lotes concurrente: la model card reporta mediciones con 4 streams paralelos en decodificacion agregada.
- Capacidades de codigo, matematicas, vision o tool calling: no disponibles en la informacion proporcionada.
- Soporte multilingue: no disponible.

## Casos de uso

- Despliegue local en estaciones AMD Strix Halo: usar `loom-fetch` y `loom-serve` con el preset `chat` para servir el modelo en una APU Ryzen AI Max+ 395 con hasta 262.144 tokens de contexto por peticion, adecuado para asistentes locales con documentos largos.
- Inferencia en GPU de escritorio/prosumer AMD R9700: el preset `chat-r9700` limita el contexto a 36.864 tokens para ajustarse a los 32 GB de VRAM de la tarjeta, util para chatbots y resumen de documentos de tamano medio.
- Sustitucion de llama.cpp en pipelines existentes: al exponer una API compatible con OpenAI en `127.0.0.1:8080`, se puede apuntar cualquier cliente compatible (SDK de OpenAI, LangChain, LlamaIndex) sin cambiar el codigo de aplicacion.
- Procesamiento de documentos largos con prefill intensivo: las mediciones muestran 1.440 tok/s de prefill a 32k tokens en Strix Halo, lo que lo hace viable para resumir o extraer informacion de contratos, informes o transcripciones extensas.
- Servicio multi-usuario ligero: con 4 streams concurrentes y 151 tok/s agregados en Strix Halo, puede atender pequenos equipos con cargas moderadas sin GPU dedicada de datacenter.
- Evaluacion comparativa de motores de inferencia AMD: el paquete incluye metodologia reproducible frente a llama.cpp ROCm y Vulkan, util para equipos que evaluan que runtime desplegar en hardware AMD.
- Prototipado de asistentes con modo thinking conmutable: permite alternar entre respuestas rapidas y razonamiento extendido por peticion, util en entornos de investigacion.

## Benchmarks y rendimiento

Rendimiento medido en AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151), GGUF Q4_K_XL, frente a llama.cpp ROCm b1375 y llama.cpp Vulkan b12211:

| Metrica | llama.cpp | Loom | Margen vs mejor llama.cpp | Roofline | Loom % roofline | llama.cpp Vulkan |
|---|---|---|---|---|---|---|
| Decode tok/s, prompt corto | 66,4 | 77,8 | +12 % | 98,6 | 79 % | 69,2 |
| Decode tok/s, contexto 2k | 56,8 | 70,6 | +24 % | 88,5 | 80 % | 57,1 |
| Decode tok/s, contexto 32k | 47,5 | 57,1 | +20 % | 70,7 | 81 % | 46,8 |
| Prefill tok/s, documento 1k | 1283,3 | 1915,3 | +49 % | 9141,6 | 21 % | 1069,8 |
| Prefill tok/s, documento 2k | 1344,1 | 1948,8 | +45 % | 8752,8 | 22 % | 1154,1 |
| Prefill tok/s, documento 8k | 1322,0 | 1882,2 | +42 % | 8146,9 | 23 % | 1155,0 |
| Prefill tok/s, documento 16k | 1165,4 | 1692,1 | +45 % | 7470,8 | 23 % | 1048,1 |
| Prefill tok/s, documento 32k | 930,6 | 1440,4 | +55 % | 6407,4 | 22 % | 855,3 |
| 4 streams, decode agregado tok/s | 152,0 | 151,1 | -1 % | 316,4 | 48 % | 141,9 |
| Decodificacion especulativa, tokens aceptados | n/a | n/a | n/a | n/a | n/a | n/a |

Metodologia declarada: misma GGUF, mismo runner DevLab, mismos prompts; Loom con espera activa; medianas de 3 sesiones (9 en el caso de 4 streams); Loom cronometrado por el cliente y llama.cpp por su servidor. Argumentos de llama.cpp ROCm: `-ngl 99 -cram 0 -c 65536 -np 1`; Vulkan: `-ngl 99 -cram 0 -c 36864 -np 1`. No se publican resultados de benchmarks academicos (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- GPUs soportadas explicitamente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- VRAM estimada: no disponible de forma explicita; el preset de R9700 limita el contexto a 36.864 tokens en una tarjeta de 32 GB, lo que da una referencia del orden de magnitud del footprint del checkpoint Q4_K_XL.
- Cabe en GPU consumer: si, en el caso de Strix Halo (APU con memoria unificada) y en la R9700 (32 GB). No se confirma compatibilidad con GPUs consumer NVIDIA o AMD de gama baja.
- Opciones de despliegue: `hrx-loom[hf]==0.2.0` (instalable con `pipx`), `loom-fetch` para materializar el paquete y `loom-serve` para servir el modelo. La comparativa incluye llama.cpp ROCm y llama.cpp Vulkan como alternativas.
- Throughput medido en Strix Halo: 77,8 tok/s decode en prompt corto, 57,1 tok/s a 32k de contexto, 1.440 tok/s de prefill a 32k, 151 tok/s agregados en 4 streams.
- Prefill es el cuello de botella relativo: Loom alcanza solo el 21-23 % del roofline en prefill frente al 79-81 % en decode.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Gemma 4 26B-A4B it QAT (este paquete, via Loom) | 26B | 4B | 262.144 | Apache 2.0 | GGUF / `.loom` | Optimizado para AMD Strix Halo y R9700 |
| Gemma 4 26B-A4B it QAT via llama.cpp ROCm | 26B | 4B | 65.536 (segun args) | Apache 2.0 | GGUF | Referencia de comparacion; -12 % a -55 % en las metricas medidas |
| Gemma 4 26B-A4B it QAT via llama.cpp Vulkan | 26B | 4B | 36.864 (segun args) | Apache 2.0 | GGUF | Referencia de comparacion; peor que Loom en todas las filas |
| Alternativas de otro tamano o familia | no disponible | no disponible | no disponible | no disponible | no disponible | No se han proporcionado datos de modelos comparables adicionales |

## Limitaciones y advertencias

- El repositorio declara 0 GB de tamano y 0 descargas; los pesos se materializan desde el checkpoint base de Unsloth mediante `loom-fetch`, no estan alojados en este repo.
- La model card no documenta sesgos, tasas de alucinacion ni evaluaciones de seguridad del modelo base.
- Idiomas soportados no disponibles: no se puede garantizar calidad multilingue sin evaluacion propia.
- El contexto maximo depende del preset: 36.864 tokens en R9700 frente a 262.144 en Strix Halo. Solicitar mas contexto del que permite el preset puede fallar o degradar el rendimiento.
- El rendimiento medido usa espera activa (`completion_spin_ns=4294967295`), que consume CPU mientras hay trabajo en GPU; en despliegues con CPU compartida puede ser contraproducente.
- El paquete esta atado a hardware AMD concreto (gfx1151, gfx1201); no se documenta compatibilidad con NVIDIA, Apple Silicon ni otras GPUs AMD.
- La licencia Apache 2.0 se aplica al paquete Loom; conviene verificar los terminos del checkpoint Gemma subyacente antes de uso comercial.
- No hay datos de benchmarks academicos ni de calidad del modelo; las cifras publicadas son exclusivamente de rendimiento de inferencia.
- El proyecto Loom y `hrx-loom` estan en version 0.2.0, lo que implica madurez temprana y posible inestabilidad de API.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-fun/unsloth-gemma-4-26B-A4B-it-qat-loom
- Checkpoint base en Hugging Face: https://huggingface.co/unsloth/gemma-4-26B-A4B-it-qat-GGUF
- Repositorio Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Flujo loom-skills: https://github.com/loom-fun/loom-skills
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
