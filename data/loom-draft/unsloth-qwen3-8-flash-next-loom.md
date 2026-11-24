# loom-draft/unsloth-Qwen3.8-Flash-Next-loom

## Resumen

Qwen3.8-Flash-Next es un modelo multimodal (image-text-to-text) de la familia Qwen, distribuido en formato GGUF por Unsloth con la cuantizacion UD-Q4_K_XL. Este repositorio concreto, `loom-draft/unsloth-Qwen3.8-Flash-Next-loom`, no contiene pesos nuevos: es un paquete de despliegue en formato `.loom` (programas y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar de Unsloth, pensado para ejecutarse con el runtime Loom sobre GPUs AMD.

El paquete esta orientado a hardware AMD Ryzen AI Max+ 395 ("Strix Halo") y emplea decodificacion especulativa mediante MTP (multi-token prediction) con un draft model Q8_0. Su interes practico es doble: demuestra el rendimiento de Loom frente a llama.cpp en esta GPU integrada y sirve como referencia reproducible para el ecosistema Loom. El autor declara que el paquete necesita aproximadamente 118 GB de memoria, por lo que no cabe en una Radeon AI PRO R9700 de 32 GB.

La licencia declarada es MIT y la tarea soportada es image-text-to-text, con soporte de vision y de modo thinking opcional. No se dispone de informacion sobre arquitectura interna, numero de parametros ni longitud de contexto en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (las pruebas de rendimiento llegan a 32k tokens de contexto/prompt) |
| Tipos de cuantizacion | UD-Q4_K_XL (checkpoint servido); draft model MTP en Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (checkpoint base); paquete `.loom` con programas y `model.json` |
| Pipeline | image-text-to-text |
| Modelo base | unsloth/Qwen3.8-Flash-Next-GGUF |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (ROCm) |
| Memoria requerida | ~118 GB segun el autor |
| Runtime | hrx-loom 0.2.0 (hrx-system) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base (tipo de transformer, numero de capas, atencion, composicion del dataset de entrenamiento ni fases de alineacion como RLHF o DPO). La model card del paquete no describe el modelo original, solo el empaquetado para Loom.

Lo que si se detalla es la innovacion a nivel de despliegue: el paquete integra decodificacion especulativa mediante MTP, con un modelo draft `mtp-Qwen3.8-Flash-Next-Q8_0.gguf` y una profundidad de borrador de 3 tokens en Loom. En las pruebas, el 82 % de los tokens redactados por el draft fueron aceptados. El paquete se genera con el flujo `loom-skills` y se sirve con `loom-serve`, con opciones como `--pool_backing=fixed` (reserva fija del pool de memoria) y `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU, que consume CPU mientras hay trabajo en vuelo).

## Capacidades

- Generacion de texto y conversacion multi-turno mediante API compatible con `/v1/chat/completions`.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con soporte de vision declarado en las etiquetas.
- Modo thinking opcional, desactivable mediante `chat_template_kwargs.enable_thinking`.
- Decodificacion especulativa con MTP para acelerar la generacion.
- Servicio concurrente: las pruebas incluyen 4 streams en paralelo con decodificacion agregada.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, audio ni otros idiomas.

## Casos de uso

- Despliegue local de un modelo multimodal en hardware AMD Strix Halo: el paquete `.loom` permite arrancar el modelo con `loom-fetch` y `loom-serve` sin recompilar ni convertir pesos, usando el GGUF original de Unsloth.
- Procesamiento de documentos largos: con un prefill medido de hasta 1218 tok/s en prompts de 32k tokens, resulta adecuado para tareas de resumen o extraccion sobre documentos extensos en una sola pasada.
- Asistente conversacional con contexto largo: la decodificacion se mantiene en 31,7 tok/s tras 32k tokens de contexto, lo que permite conversaciones prolongadas sin degradacion severa del throughput.
- Servicio multiusuario ligero: con 4 streams en paralelo alcanza 66,6 tok/s agregados, util para pequenos equipos o entornos de desarrollo compartidos.
- Evaluacion y benchmarking de runtimes: el paquete incluye metodologia y resultados comparativos frente a llama.cpp ROCm y Vulkan, por lo que sirve como referencia reproducible para medir el rendimiento de Loom en Strix Halo.
- Prototipado de aplicaciones vision-lenguaje: al soportar image-text-to-text, se puede usar para descripcion de imagenes o respuesta a preguntas sobre imagenes en local, sin depender de APIs externas.
- Entornos con requisitos de privacidad: al ejecutarse en hardware local con licencia MIT, es apto para procesar datos sensibles sin salida a la nube.

## Benchmarks y rendimiento

Resultados de rendimiento medidos en AMD Strix Halo (DevLab Dispatch, runner X2-LA03-S01-D04), comparando Loom 0.2.0 con llama.cpp ROCm b1371 y llama.cpp Vulkan b12211 sobre el mismo GGUF:

| Metrica | llama.cpp | Loom | Margen vs mejor llama.cpp | Roofline | Loom % roofline | llama.cpp Vulkan |
|---|---|---|---|---|---|---|
| Decode tok/s, prompt corto | 34,4 | 21,0 | -39 % | 50,4 | 42 % | 34,2 |
| Decode tok/s, contexto 2k | 30,8 | 34,8 | +13 % | 47,4 | 73 % | 29,3 |
| Decode tok/s, contexto 32k | 24,2 | 31,7 | +31 % | 42,5 | 75 % | 24,0 |
| Prefill tok/s, documento 1k | 417,9 | 1179,1 | +182 % | 4829,0 | 24 % | 327,4 |
| Prefill tok/s, documento 2k | 442,3 | 1316,4 | +198 % | 4770,8 | 28 % | 352,4 |
| Prefill tok/s, documento 8k | 451,8 | 617,5 | +37 % | 4651,1 | 13 % | 359,0 |
| Prefill tok/s, documento 16k | 425,5 | 935,1 | +120 % | 4646,6 | 20 % | 340,2 |
| Prefill tok/s, documento 32k | 378,7 | 1218,3 | +222 % | 4637,6 | 26 % | 309,5 |
| 4 streams, decode agregado tok/s | 57,2 | 66,6 | +16 % | 135,1 | 49 % | 55,5 |
| Decodificacion especulativa, tokens aceptados | — | 82 % | — | n/a | n/a | — |

Metodologia: valores medianos de 3 sesiones (6 para 4 streams); llama.cpp medido el 2026-11-13 y Loom el 2026-11-17, en runners del mismo tipo pero jobs distintos. Sin ajuste fino de parametros en ninguno de los dos motores. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Memoria requerida: aproximadamente 118 GB segun el autor del paquete.
- GPU objetivo: AMD Ryzen AI Max+ 395 "Strix Halo" con ROCm (gfx1151, memoria unificada).
- No cabe en AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- No se dispone de datos de VRAM para otras cuantizaciones ni de compatibilidad con GPUs NVIDIA (A100, H100, RTX 4090) en la informacion proporcionada.
- Despliegue: `hrx-loom[hf]==0.2.0` mediante `pipx`, con `loom-fetch` para descargar el paquete y `loom-serve` para servirlo. En hosts con memlock de 8 MiB hay que arrancar con `systemd-run --user --pty --same-dir -p SystemCallFilter=~io_uring_setup -p SystemCallErrorNumber=ENOSYS loom-serve ...` o elevar `ulimit -l`.
- Throughput medido: 21,0 tok/s en decode con prompt corto, 34,8 tok/s con contexto de 2k, 31,7 tok/s con contexto de 32k, y hasta 1316,4 tok/s de prefill en documentos de 2k.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de la misma categoria. La unica comparacion disponible es a nivel de runtime (Loom frente a llama.cpp ROCm y Vulkan) sobre el mismo checkpoint, recogida en la seccion de benchmarks.

| Alternativa | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El paquete requiere aproximadamente 118 GB de memoria, lo que lo excluye de GPUs de consumo y de la Radeon AI PRO R9700 de 32 GB.
- En prompts cortos, Loom rinde un 39 % menos que llama.cpp en decode (21,0 frente a 34,4 tok/s); la ventaja aparece a partir de 2k tokens de contexto.
- El prefill queda muy por debajo del roofline (13-28 % del maximo teorico), por lo que hay margen de optimizacion.
- Las mediciones de Loom y llama.cpp se tomaron en jobs distintos y en fechas distintas, aunque sobre runners del mismo tipo; el propio autor lo advierte.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion, cobertura idiomatica ni evaluaciones de calidad del modelo base.
- La licencia MIT se declara a nivel de paquete; conviene verificar las condiciones del checkpoint base de Unsloth y del modelo Qwen original antes de un uso comercial.
- El rendimiento esta medido exclusivamente en Strix Halo con ROCm; no hay datos para otros aceleradores.
- La configuracion por defecto de memlock en hosts estandar (8 MiB) impide arrancar `loom-serve` sin los ajustes indicados.

## Enlaces

- Repositorio del paquete: https://huggingface.co/loom-draft/unsloth-Qwen3.8-Flash-Next-loom
- Checkpoint base GGUF: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo loom-skills: https://github.com/loom-fun/loom-skills
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Medicion llama.cpp (run 43376548212): https://github.com/loom-fun/loom-skills/actions/runs/43376548212/job/131724300576
- Medicion Loom (run 44088715568): https://github.com/loom-fun/loom-skills/actions/runs/44088715568/job/134058002069
