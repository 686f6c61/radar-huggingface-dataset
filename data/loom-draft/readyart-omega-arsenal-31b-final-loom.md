# loom-draft/ReadyArt-Omega-Arsenal-31B-Final-loom

## Resumen

ReadyArt-Omega-Arsenal-31B-Final-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado por el usuario `loom-draft` para servir el checkpoint GGUF `Omega-Arsenal-31B-Final-ATTN8-Q4_K_M.gguf` del modelo base `ReadyArt/Omega-Arsenal-31B-Final-GGUF`. No se trata de un modelo entrenado desde cero, sino de un artefacto de empaquetado que adapta un modelo de 31.000 millones de parametros, cuantizado en Q4_K_M, al runtime `loom-serve` sobre GPUs AMD concretas: la APU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB). El paquete se genero con la herramienta `loom-next` sin intervencion de un LLM en el bucle.

El interes del artefacto es acotado pero especifico: demuestra el flujo de publicacion de paquetes Loom sobre Hugging Face (comando `loom-fetch`, presets `chat` y `chat-r9700`) y expone un servidor compatible con la API `/v1/chat/completions` de OpenAI, con soporte de tool calling, modo de razonamiento opcional y un tamano de contexto fijado en 53.248 tokens por peticion. La licencia declarada es Apache 2.0.

En el momento de redactar esta ficha el repositorio esta vacio (0,0 GB), no registra descargas ni likes, y la propia model card indica que las mediciones de rendimiento y las puertas de correccion (`kernel_tests`, `golden`, `compare`, `agent`, `sampling`, etc.) no se han vuelto a medir para este paquete. Cualquier evaluacion de calidad debe, por tanto, remitirse al modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el paquete no la declara; el checkpoint base es un GGUF de 31B) |
| Parametros totales | 31.000 millones (segun el nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 53.248 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); variante nombrada `ATTN8` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (checkpoint original) empaquetado como paquete Loom (`.loom` + `model.json`) |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Runtime | `loom-serve` (paquete `hrx-loom[hf]==0.2.0`) |
| GPUs objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| API | OpenAI-style `/v1/chat/completions` |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base `ReadyArt/Omega-Arsenal-31B-Final-GGUF` ni su proceso de entrenamiento: no se indican numero de tokens, composicion del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento. El nombre del checkpoint sugiere una variante con atencion en 8 bits (`ATTN8`) sobre un modelo de 31.000 millones de parametros, pero este dato no se confirma en la documentacion proporcionada.

El artefacto publicado es un paquete de despliegue generado por `loom-next`, que produce programas `.loom` y una tarjeta `model.json` con los ficheros fuente fijados por hash SHA-256. El paquete no modifica los pesos: sirve el mismo GGUF Q4_K_M a traves de kernels generados para las arquitecturas AMD gfx1151 y gfx1201. La model card menciona soporte de decodificacion especulativa como "no aplicable" y no documenta innovaciones de atencion mas alla del sufijo `ATTN8` del checkpoint.

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling estilo OpenAI: acepta el campo `tools` y devuelve `tool_calls`.
- Modo de razonamiento (thinking) opcional, desactivado por defecto; se activa con `chat_template_kwargs: {"enable_thinking": true}`.
- Bucles de agente multi-turno con tool calling, segun la puerta de correccion `agent` descrita en la model card (sin medicion registrada para este paquete).
- Concurrencia de hasta 4 peticiones simultaneas con contexto de 53.248 tokens por peticion.
- Entrada de imagen: no soportada por Loom, aunque el modelo upstream la tiene segun la model card.
- Entrada y salida de audio: no soportadas por Loom, aunque el modelo upstream las tiene segun la model card.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Decodificacion especulativa: no aplicable en este paquete.

## Casos de uso

- Despliegue de un LLM de 31B en hardware AMD consumer y workstation: el paquete esta pensado para servir el modelo en una APU Strix Halo o en una R9700 de 32 GB mediante `loom-serve`, evitando el stack CUDA y usando kernels generados para gfx1151 y gfx1201.
- Asistente conversacional con contexto largo: con 53.248 tokens por peticion, el modelo puede mantener conversaciones multi-turno o procesar documentos extensos (informes, contratos, bases de codigo) en una sola llamada.
- Agente con herramientas en local: el soporte de `tools` y `tool_calls` permite construir agentes que consulten APIs internas, bases de datos o sistemas de ficheros sin salir del entorno local.
- Razonamiento con modo thinking para tareas de analisis: activando `enable_thinking` se obtiene una traza de razonamiento intermedia util para depuracion de pipelines o para tareas que requieren varios pasos antes de responder.
- Servicio interno compatible con OpenAI: al exponer `/v1/chat/completions`, se puede apuntar cualquier cliente o SDK compatible con OpenAI al endpoint local sin reescribir integraciones existentes.
- Prototipado y evaluacion de la cadena Loom: el paquete sirve como ejemplo reproducible del flujo `loom-fetch` + `loom-serve` y de la publicacion de paquetes en Hugging Face para quienes quieran empaquetar sus propios GGUF.
- Procesamiento por lotes con concurrencia limitada: con 4 peticiones concurrentes y 4.096 tokens de salida maxima, encaja en tareas de resumen, clasificacion o extraccion sobre lotes moderados de documentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "no se han vuelto a medir" para este paquete, y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas GPUs.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el checkpoint es un GGUF Q4_K_M de 31B, y el paquete se distribuye para una GPU de 32 GB (R9700) y para la APU Strix Halo con memoria unificada.
- GPU recomendadas: AMD Radeon AI PRO R9700 (gfx1201, 32 GB) y AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151).
- GPU consumer: no se documenta compatibilidad con GPUs consumer NVIDIA ni con otras AMD distintas de las dos anteriores; el runtime `loom-serve` esta orientado a ROCm/AMD.
- Opciones de despliegue: `loom-serve` mediante el paquete `hrx-loom[hf]==0.2.0` (instalacion con `pipx`), con presets `chat` (Strix Halo) y `chat-r9700` (R9700). No se mencionan vLLM, llama.cpp, Ollama ni TGI como alternativas soportadas por este paquete, aunque la model card usa llama.cpp como referencia de correccion.
- Parametros de servicio relevantes: `--materialize=copy`, `--pool_backing=fixed`, `--parameter_mode=preload` y `completion_spin_ns=4294967295` (espera activa de finalizaciones en GPU).
- Latencia y throughput: no disponibles; las filas de rendimiento de la model card estan pendientes de medicion.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni comparaciones con otros modelos de la misma categoria, y el paquete es un artefacto de despliegue especifico para hardware AMD, sin equivalentes directos documentados en la fuente.

## Limitaciones y advertencias

- El repositorio esta vacio (0,0 GB) en el momento de la consulta: los ficheros del paquete (`.loom`, `model.json`, `model.json.lock`) no estan presentes, por lo que el comando `loom-fetch` no puede materializar el modelo.
- Cero descargas y cero likes: no hay evidencia de uso ni de validacion por parte de la comunidad.
- Todas las puertas de correccion figuran como no medidas para este paquete; no hay evidencia registrada de que la salida coincida con la referencia de llama.cpp.
- No hay mediciones de rendimiento publicadas para Strix Halo ni para R9700 en este paquete.
- El modelo base no documenta arquitectura, datos de entrenamiento ni proceso de alineamiento en la informacion disponible; los sesgos y el riesgo de alucinacion del modelo subyacente no se pueden evaluar con los datos aportados.
- La entrada de imagen y audio del modelo upstream no esta soportada por Loom, segun la propia model card.
- El contexto esta limitado a 53.248 tokens por peticion y la salida a 4.096 tokens; la concurrencia esta limitada a 4 peticiones.
- El paquete solo esta validado para dos GPUs AMD concretas (gfx1151 y gfx1201); no se documenta soporte para otras arquitecturas.
- Licencia Apache 2.0 declarada, lo que en principio permite uso comercial, pero debe verificarse contra la licencia del checkpoint base `ReadyArt/Omega-Arsenal-31B-Final-GGUF`, que no se detalla en la informacion disponible.
- El tag `loom` de este repositorio no debe confundirse con la plataforma de grabacion de pantalla Loom (loom.com), que aparece en los resultados de busqueda web y no tiene relacion con este modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/ReadyArt-Omega-Arsenal-31B-Final-loom
- Modelo base en Hugging Face: https://huggingface.co/ReadyArt/Omega-Arsenal-31B-Final-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
