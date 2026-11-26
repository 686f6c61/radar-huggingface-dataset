# loom-fun/bartowski-Ornith-1.5-9B-loom

## Resumen

Ornith-1.5-9B-loom es un paquete de despliegue distribuido por el usuario `loom-fun` que empaqueta el checkpoint GGUF sin modificar `bartowski/Ornith-1.5-9B-GGUF` (concretamente la cuantizacion `Ornith-1.5-9B-Q4_K_M.gguf`) en el formato propietario `.loom` junto con una tarjeta `model.json`, para su servicio mediante el runtime AMD Loom (`hrx-loom`). No se trata de un modelo entrenado por el autor del repositorio, sino de una adaptacion de empaquetado y configuracion de inferencia del modelo base Ornith-1.5-9B, con 8.953.803.264 parametros reales segun los safetensors del checkpoint original.

El modelo base es multimodal (pipeline `image-text-to-text`), con una ventana de contexto nativa declarada de 262.144 tokens y capacidad de modo "thinking" opcional, segun los ejemplos de peticion de la model card. El paquete incorpora decodificacion especulativa (dflash) y esta optimizado para GPUs AMD concretas: Ryzen AI Max+ 395 "Strix Halo" (gfx1151), Radeon AI PRO R9700 (gfx1201, 32 GB) y GPUs gfx1201 de 16 GB como RX 9070 XT y RX 9070.

Su relevancia es practica: ofrece un artefacto listo para servir con el runtime Loom sobre hardware AMD, con mediciones de rendimiento comparadas frente a llama.cpp (ROCm y Vulkan) sobre el mismo GGUF. La licencia es MIT. El repositorio tiene 246 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer multimodal; no se detalla en la informacion proporcionada) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens nativos; hasta 93.184 tokens por peticion en GPU gfx1201 de 16 GB con `--memory_bytes=15000000000` |
| Tipos de cuantizacion | Q4_K_M (GGUF) en este paquete; otras cuantizaciones del modelo base no detalladas |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (Q4_K_M) empaquetado como programa `.loom` + `model.json`; safetensors disponibles en el checkpoint original |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura interna del modelo base Ornith-1.5-9B (tipo de transformer, atencion, composicion del dataset, numero de tokens de entrenamiento ni si hubo RLHF/DPO). Lo que si se documenta es la capa de despliegue: el paquete Loom sirve el GGUF Q4_K_M sin modificarlo, con un pool de memoria fijo (`--pool_backing=fixed`), precarga de parametros (`--parameter_mode=preload`) y espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`), ajuste con el que se midieron las cifras de rendimiento.

La innovacion tecnica destacable del paquete es la decodificacion especulativa integrada (tag `speculative-decoding`, tecnologia `dflash`), con una tasa de aceptacion de tokens redactados del 72 % en Strix Halo. Tambien se documenta soporte de modo thinking opcional, desactivable mediante `chat_template_kwargs: {"enable_thinking": false}` en las peticiones a la API compatible con OpenAI.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno mediante API compatible con OpenAI (`/v1/chat/completions`).
- Procesamiento de imagen y texto (`image-text-to-text`): el pipeline declarado admite entradas multimodales.
- Modo thinking opcional, activable o desactivable por peticion.
- Contexto largo: hasta 262.144 tokens nativos, con hasta 93.184 tokens por peticion en GPUs de 16 GB.
- Decodificacion especulativa para acelerar la generacion.
- Servicio concurrente: las mediciones incluyen 4 streams agregados.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local sobre GPU AMD: el paquete se sirve con `loom-serve` en Strix Halo o Radeon R9700 y expone una API compatible con OpenAI, lo que permite conectar clientes existentes sin adaptadores. Es adecuado por su rendimiento de decodificacion de 61,8 tok/s en prompts cortos en Strix Halo.
- Analisis de documentos largos: con 262.144 tokens de contexto nativo y 93.184 tokens por peticion en GPUs de 16 GB, permite resumir o extraer informacion de contratos, informes o transcripciones extensas en una sola pasada.
- Procesamiento de imagenes con texto asociado (captions, extraccion de datos de capturas o formularios) gracias al pipeline `image-text-to-text`, en flujos donde la imagen y la consulta se envian conjuntamente.
- Razonamiento con modo thinking controlado: en tareas que requieren pasos intermedios (analisis, planificacion) se puede activar el modo thinking; en tareas de baja latencia se desactiva por peticion.
- Servicio multiusuario en estacion de trabajo: con 4 streams agregados a 142 tok/s en Strix Halo, es viable para un equipo pequeno que comparte una unica GPU.
- Despliegue en hardware de consumo AMD: en RX 9070 XT / RX 9070 (16 GB) el preset `chat-16gb` con `--memory_bytes=15000000000` permite servir el modelo con contexto reducido a 93.184 tokens, adecuado para prototipos y uso personal.
- Evaluacion comparativa de motores de inferencia: al incluir mediciones frente a llama.cpp ROCm y Vulkan sobre el mismo GGUF, sirve como referencia para decidir el stack de serving en hardware AMD.

## Benchmarks y rendimiento

Rendimiento de inferencia en Strix Halo (gfx1151), mismo GGUF, medianas de 3 sesiones (4 streams: mediana de 6):

| Metrica | llama.cpp ROCm | Loom | Margen vs mejor llama.cpp | Roofline | Loom % roofline | llama.cpp Vulkan |
|---|---|---|---|---|---|---|
| Decode tok/s, prompt corto | 38,9 | 61,8 | +59 % | 90,4 | 68 % | 21,3 |
| Decode tok/s, contexto 2k | 38,4 | 55,9 | +46 % | 90,9 | 61 % | 22,1 |
| Decode tok/s, contexto 32k | 27,4 | 41,0 | +50 % | 66,7 | 61 % | 16,0 |
| Prefill tok/s, documento 1k | 967,0 | 1607,9 | +66 % | 4243,3 | 38 % | 767,9 |
| Prefill tok/s, documento 2k | 987,4 | 1636,3 | +66 % | 4223,4 | 39 % | 791,3 |
| Prefill tok/s, documento 8k | 996,8 | 1665,0 | +67 % | 4107,8 | 41 % | 802,3 |
| Prefill tok/s, documento 16k | 947,8 | 1596,9 | +68 % | 3963,1 | 40 % | 769,7 |
| Prefill tok/s, documento 32k | 850,2 | 1466,8 | +73 % | 3702,4 | 40 % | 699,0 |
| 4 streams, decode agregado tok/s | 110,0 | 142,0 | +29 % | 159,8 | 89 % | 106,7 |
| Decodificacion especulativa, tokens aceptados | — | 72 % | — | n/a | n/a | — |

No se han publicado resultados de benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las cifras anteriores son exclusivamente de rendimiento de serving.

## Requisitos de hardware

- VRAM estimada: el repo pesa 7,6 GB (Q4_K_M). En gfx1201 de 16 GB el preset reserva un presupuesto de 15.000.000.000 bytes (`--memory_bytes=15000000000`), con slabs de estado de 4 MiB y de pesos de 64 MiB.
- GPUs soportadas explicitamente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151), AMD Radeon AI PRO R9700 (gfx1201, 32 GB), AMD Radeon RX 9070 XT y RX 9070 (gfx1201, 16 GB).
- Cabe en GPU de consumo AMD: si, en RX 9070 XT y RX 9070 de 16 GB, con contexto por peticion limitado a 93.184 tokens.
- Despliegue: runtime AMD Loom (`pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` y `loom-serve`). El GGUF subyacente tambien es compatible con llama.cpp (ROCm y Vulkan), segun las mediciones comparativas.
- Throughput medido en Strix Halo: 61,8 tok/s de decode con prompt corto, 41,0 tok/s a 32k de contexto, 1466,8 a 1665,0 tok/s de prefill segun tamano de documento y 142 tok/s agregados con 4 streams.
- Latencia: no se publican cifras de latencia por peticion (TTFT) en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-9B-loom (este paquete) | 8.953.803.264 | 262.144 nativos; 93.184 en 16 GB | GGUF Q4_K_M empaquetado `.loom`, runtime Loom | MIT | Multimodal image-text-to-text, decodificacion especulativa, mediciones frente a llama.cpp |
| bartowski/Ornith-1.5-9B-GGUF (modelo base) | 8.953.803.264 | 262.144 | GGUF, multiples cuantizaciones | no disponible en la informacion | Checkpoint sin modificar del que deriva este paquete |
| llama.cpp ROCm (motor, no modelo) | n/a | n/a | GGUF | n/a | 38,9 tok/s decode en prompt corto en Strix Halo; referencia de comparacion |
| llama.cpp Vulkan (motor, no modelo) | n/a | n/a | GGUF | n/a | 21,3 tok/s decode en prompt corto en Strix Halo; referencia de comparacion |

No se dispone en la informacion proporcionada de modelos alternativos de la misma categoria (9B multimodales) con los que comparar parametros, contexto y rendimiento. Dato no disponible.

## Limitaciones y advertencias

- El paquete esta atado al runtime AMD Loom (`hrx-loom==0.2.0`) y a GPUs AMD concretas; no es un artefacto generico para CUDA ni para otros motores sin conversion.
- Las cifras de rendimiento se midieron en trabajos distintos para llama.cpp (2026-11-13) y Loom (2026-11-17); llama.cpp no se volvio a medir para este paquete, por lo que la comparacion no es estrictamente simultanea.
- En GPUs de 16 GB el contexto por peticion queda limitado a 93.184 tokens frente a los 262.144 nativos.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinacion del modelo base en la informacion disponible.
- No hay datos de benchmarks de calidad (razonamiento, codigo, matematicas) que permitan validar el modelo para tareas de alta exigencia.
- El soporte de tool calling y de agentes no esta documentado; no debe asumirse en produccion.
- La licencia del paquete es MIT, pero la del checkpoint base no se detalla en la informacion proporcionada; conviene verificar la licencia del modelo original antes de un uso comercial.
- El repositorio tiene un volumen de descargas bajo (246) y ningun like, lo que limita la validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-fun/bartowski-Ornith-1.5-9B-loom
- Modelo base en Hugging Face: https://huggingface.co/bartowski/Ornith-1.5-9B-GGUF
- Runtime AMD Loom (repositorio): https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
- Medicion llama.cpp (DevLab Dispatch run 43376548212): https://github.com/loom-fun/loom-skills/actions/runs/43376548212/job/131724300345
- Medicion Loom (DevLab Dispatch run 44088665443): https://github.com/loom-fun/loom-skills/actions/runs/44088665443/job/134057825595
