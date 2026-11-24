# loom-draft/bartowski-Qwen3.8-27B-loom

## Resumen

Qwen3.8-27B-loom es un paquete de despliegue publicado por el usuario loom-draft en Hugging Face, no un modelo entrenado desde cero. Contiene los programas `.loom` y un fichero `model.json` que permiten servir el checkpoint GGUF original `bartowski/Qwen3.8-27B-GGUF` (concretamente la cuantizacion `Qwen3.8-27B-Q4_K_M.gguf`) sobre el runtime Loom, orientado a las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete se ha generado con el flujo de trabajo loom-skills.

El modelo subyacente es Qwen3.8-27B, un transformer multimodal de 27.000 millones de parametros con capacidades de vision (pipeline `image-text-to-text`) y contexto nativo de 262.144 tokens, segun se indica en la model card. La aportacion del paquete Loom es el empaquetado especifico para hardware AMD con decodificacion especulativa basada en MTP (multi-token prediction) y una gestion de memoria fija (`--pool_backing=fixed`) que en la R9700 limita el servicio a 120.832 tokens por peticion.

Su relevancia es practica: ofrece una alternativa medida frente a llama.cpp (ROCm y Vulkan) sobre el mismo GGUF, con mejoras declaradas de entre el 20 % y el 63 % en decode y prefill, y publica la metodologia completa de las mediciones. La licencia del paquete es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles internos no disponibles |
| Parametros totales | 27B (según nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens nativos; 120.832 tokens por petición en el preset de R9700 |
| Tipos de cuantizacion | Q4_K_M (GGUF); otras cuantizaciones del modelo base no detalladas en la informacion disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Qwen3.8-27B-Q4_K_M.gguf); paquete Loom con programas `.loom` y `model.json` |

## Arquitectura y entrenamiento

El paquete no incluye informacion sobre el entrenamiento del modelo base: no se detallan el numero de tokens, la composicion del dataset ni si hubo RLHF o DPO. La model card solo confirma que es un modelo multimodal (procesa imagen y texto) con contexto nativo de 262.144 tokens y que el checkpoint GGUF se usa sin modificar.

En el plano del runtime, Loom incorpora decodificacion especulativa mediante MTP (multi-token prediction) con profundidad de borrador 3, y un modo de espera activa de finalizacion en GPU (`completion_spin_ns=4294967295`) que consume CPU mientras hay trabajo en vuelo. El preset reserva de antemano el pool de memoria (`--pool_backing=fixed`) y el modo `--parameter_mode=preload` solo afecta a la carga de pesos en el host. En la comparativa se reporta una tasa de aceptacion del 64 % de tokens redactados por el borrador especulativo.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" opcional, desactivable mediante `chat_template_kwargs.enable_thinking`.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), segun los tags del repositorio.
- Servicio mediante API compatible con OpenAI (`/v1/chat/completions`).
- Decodificacion especulativa MTP integrada en el runtime Loom.
- Soporte de multiples peticiones concurrentes (mediciones con 4 streams en paralelo).
- Contexto largo de hasta 262.144 tokens nativos (120.832 por peticion en el preset R9700).
- Soporte de tool calling, agentes o capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local sobre Strix Halo: el paquete arranca con `loom-serve` y expone un endpoint compatible con OpenAI, adecuado para prototipos de chat en hardware de escritorio con GPU integrada.
- Procesamiento de documentos largos en la R9700: el preset admite hasta 120.832 tokens por peticion, suficiente para analizar contratos, informes o bases de codigo extensas en una sola pasada.
- Analisis de imagenes con texto asociado: al ser un modelo `image-text-to-text`, puede emplearse para describir capturas, extraer informacion de diagramas o responder preguntas sobre imagenes.
- Servicio multiusuario ligero: las mediciones con 4 streams agregados (46,8 tok/s en Loom frente a 38,3 en llama.cpp) lo hacen viable para equipos pequenos con concurrencia moderada.
- Evaluacion de runtimes AMD: sirve como referencia reproducible para comparar Loom frente a llama.cpp ROCm y Vulkan sobre el mismo GGUF y las mismas prompts.
- Despliegue en estaciones de trabajo con R9700: 32 GB de VRAM permiten mantener el modelo Q4_K_M residente con el pool fijo y evitar crecimiento dinamico de memoria.
- Generacion asistida por especulacion en entornos interactivos: la decodificacion MTP con 64 % de aceptacion reduce la latencia percibida en respuestas cortas.

## Benchmarks y rendimiento

Mediciones publicadas en la model card (mediana de 3 sesiones; 4 streams, mediana de 6). Comparativa Loom frente a llama.cpp ROCm b1374 y llama.cpp Vulkan b12211 sobre el mismo GGUF y las mismas prompts, en Strix Halo (gfx1151):

| Metrica | llama.cpp | Loom | Margen vs mejor llama.cpp | Roofline | Loom % roofline | llama.cpp Vulkan |
|---|---|---|---|---|---|---|
| Decode tok/s, prompt corto | 21,1 | 28,3 | +30 % | 32,3 | 88 % | 21,8 |
| Decode tok/s, contexto 2k | 21,2 | 26,6 | +25 % | 31,4 | 85 % | 20,8 |
| Decode tok/s, contexto 32k | 19,2 | 23,2 | +21 % | 28,6 | 81 % | 18,0 |
| Prefill tok/s, documento 1k | 333,6 | 543,4 | +63 % | 1185,9 | 46 % | 272,5 |
| Prefill tok/s, documento 2k | 341,4 | 546,8 | +60 % | 1181,2 | 46 % | 275,6 |
| Prefill tok/s, documento 8k | 342,8 | 553,4 | +61 % | 1154,0 | 48 % | 273,7 |
| Prefill tok/s, documento 16k | 326,0 | 525,7 | +61 % | 1119,5 | 47 % | 261,2 |
| Prefill tok/s, documento 32k | 293,6 | 475,7 | +62 % | 1056,5 | 45 % | 236,6 |
| 4 streams, decode agregado tok/s | 38,3 | 46,8 | +20 % | 51,2 | 91 % | 38,9 |
| Decodificacion especulativa, tokens aceptados | — | 64 % | — | n/a | n/a | n/a |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el preset de R9700 esta dimensionado para 32 GB y sirve hasta 120.832 tokens por peticion.
- GPU soportadas segun la model card: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU NVIDIA (A100, H100, RTX 4090): no se mencionan como soportadas en la informacion disponible.
- Despliegue: runtime Loom mediante `pipx install "hrx-loom[hf]==0.2.0"`, con `loom-fetch` para materializar el paquete y `loom-serve` para servir; API compatible con OpenAI en el puerto 8080.
- Rendimiento medido en Strix Halo: 28,3 tok/s de decode en prompt corto, 23,2 tok/s con contexto de 32k, 543,4 tok/s de prefill con documento de 1k y 46,8 tok/s agregados con 4 streams.
- Rendimiento en R9700: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

La comparacion disponible es de motor de inferencia, no de modelo. El mismo GGUF Qwen3.8-27B Q4_K_M se ejecuta en tres configuraciones sobre Strix Halo:

| Motor | Version | Decode corto (tok/s) | Prefill 1k (tok/s) | 4 streams (tok/s) | Licencia del paquete |
|---|---|---|---|---|---|
| Loom | hrx-loom 0.2.0 | 28,3 | 543,4 | 46,8 | Apache 2.0 |
| llama.cpp ROCm | b1374 | 21,1 | 333,6 | 38,3 | no disponible en la informacion |
| llama.cpp Vulkan | b12211 | 21,8 | 272,5 | 38,9 | no disponible en la informacion |

Comparativa con otros modelos de 27B (Qwen, Gemma, etc.): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos propios: es un paquete de despliegue que depende del GGUF de `bartowski/Qwen3.8-27B-GGUF`; sin ese checkpoint el paquete no es funcional.
- Solo se documenta soporte para dos GPU AMD concretas (gfx1151 y gfx1201); no hay garantia de funcionamiento en otras arquitecturas.
- En la R9700 el contexto por peticion queda limitado a 120.832 tokens pese a que el modelo nativo admite 262.144.
- Las mediciones comparan trabajos ejecutados en fechas distintas (llama.cpp el 2026-11-13, Loom el 2026-11-17) sobre el mismo tipo de runner pero no en la misma ejecucion, lo que introduce variabilidad no controlada.
- La espera activa (`completion_spin_ns=4294967295`) consume CPU de forma continua mientras hay trabajo en GPU; puede degradar otras cargas en el mismo equipo.
- Las cifras de rendimiento corresponden a Strix Halo; no se publican mediciones para R9700.
- No hay informacion sobre sesgos, tasa de alucinacion, cobertura idiomatica ni evaluaciones de calidad del modelo base.
- El paquete registra 0 descargas y 0 likes en el momento de la consulta: no existe validacion por parte de la comunidad.
- La licencia Apache 2.0 se declara para el paquete; las condiciones del checkpoint base deben verificarse en su repositorio de origen.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/bartowski-Qwen3.8-27B-loom
- Modelo base GGUF: https://huggingface.co/bartowski/Qwen3.8-27B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Flujo loom-skills: https://github.com/loom-fun/loom-skills
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Ejecucion de referencia llama.cpp (DevLab Dispatch run 43390795404): https://github.com/loom-fun/loom-skills/actions/runs/43390795404/job/131769975716
- Ejecucion de referencia Loom (DevLab Dispatch run 44088665443): https://github.com/loom-fun/loom-skills/actions/runs/44088665443/job/134057825618
