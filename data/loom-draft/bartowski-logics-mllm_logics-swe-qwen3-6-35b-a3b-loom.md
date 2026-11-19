# loom-draft/bartowski-Logics-MLLM_Logics-SWE-Qwen3.6-35B-A3B-loom

## Resumen

`loom-draft/bartowski-Logics-MLLM_Logics-SWE-Qwen3.6-35B-A3B-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) para el checkpoint GGUF sin modificar `bartowski/Logics-MLLM_Logics-SWE-Qwen3.6-35B-A3B-GGUF`, en su cuantizacion Q4_K_M. No se trata de un modelo nuevo ni de un fine-tune propio: es un artefacto de empaquetado generado con `loom-next` que traduce los pesos originales a un formato ejecutable por el runtime Loom sobre GPUs AMD concretas, el Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB). El modelo subyacente, por su nombre, es un derivado de la familia Qwen3 con 35B de parametros totales y 3B activos, de arquitectura MoE, orientado a tareas de ingenieria de software y con capacidad de vision.

La relevancia de esta ficha es doble. Por un lado, documenta un caso de portabilidad de un LLM multimodal a hardware AMD de consumo y de estacion de trabajo mediante un runtime alternativo a llama.cpp, con una API compatible con OpenAI. Por otro lado, evidencia un ecosistema de empaquetado automatizado (generacion sin LLM en el bucle) que produce artefactos reproducibles a partir de un GGUF publicado por terceros.

Conviene subrayar que el repositorio tiene 0 GB de tamano declarado y 0 descargas en el momento de la consulta, y que la propia model card indica que las mediciones de rendimiento y las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`) no se han vuelto a medir para este paquete. La informacion disponible es, por tanto, incompleta en lo que respecta a calidad empirica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE derivada de Qwen3 (por el nombre del checkpoint base), con proyector multimodal separado (`mmproj-...-bf16.gguf`) |
| Parametros totales | 35B (segun el nombre del checkpoint) |
| Parametros activos | 3B (segun el nombre del checkpoint) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unica incluida en el paquete) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M) + proyector `mmproj` en BF16; paquete Loom (`.loom` + `model.json`) |
| Pipeline | image-text-to-text |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Concurrencia | 4 peticiones simultaneas |
| Maximo de tokens de salida | 4.096 (preset `max_tokens`) |
| API | OpenAI-compatible `/v1/chat/completions` |
| Runtime | `hrx-loom[hf]==0.2.0` (`loom-fetch`, `loom-serve`) |

## Arquitectura y entrenamiento

El paquete no aporta informacion sobre el entrenamiento del modelo subyacente: no se documentan tokens de entrenamiento, composicion del dataset, ni si hubo RLHF, DPO o etapas de post-entrenamiento. Lo unico deducible del nombre es que se trata de una arquitectura Mixture of Experts con 35B de parametros totales y 3B activos, presumiblemente heredera del diseno de Qwen3, y que el checkpoint ha sido adaptado para tareas de ingenieria de software ("SWE") y dotado de capacidades multimodales ("MLLM") mediante un proyector de vision independiente en BF16.

La innovacion tecnica del artefacto no esta en el modelo sino en el empaquetado: `loom-next` genera programas `.loom` y una tarjeta `model.json` a partir de un GGUF sin modificar, sin intervencion de un LLM en el proceso. El runtime Loom expone una API compatible con OpenAI, soporta tool calling estilo OpenAI (`tools` y `tool_calls`), razonamiento con thinking activado por defecto (desactivable con `chat_template_kwargs: {"enable_thinking": false}`), entrada de imagenes via `image_url` y hasta 4 peticiones concurrentes. La decodificacion especulativa y el control de "reasoning effort" se marcan como no aplicables. El muestreo aparece como no determinado. Las puertas de correccion del paquete comparan contra llama.cpp sobre el mismo GGUF (tokens greedy, top-5 log-probs, documentos de 1k a 32k, equivalencia de vision y consistencia bajo concurrencia), pero todas figuran como "not yet re-measured" para este paquete.

## Capacidades

- Generacion de texto y razonamiento con modo thinking activado por defecto y desactivable por peticion.
- Entrada de imagen en formato OpenAI (`image_url`), con proyector multimodal dedicado en BF16.
- Tool calling estilo OpenAI (`tools` y `tool_calls`), con soporte de bucles multi-turno de llamadas a herramientas segun las puertas `agent` y `agent_think_off`.
- Razonamiento multi-paso y uso como agente, incluyendo el bucle de tool calling con thinking desactivado.
- Contexto largo de hasta 262.144 tokens por peticion, util para documentos extensos y repositorios de codigo.
- Servicio concurrente de hasta 4 peticiones simultaneas con API HTTP compatible con OpenAI.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Audio de entrada o salida: no soportado.
- Decodificacion especulativa: no aplicable en este paquete.

## Casos de uso

- Asistente de ingenieria de software en local: el modelo, por su orientacion "SWE" y su contexto de 262.144 tokens, permite cargar varios ficheros de un repositorio y responder preguntas de refactorizacion o depuracion sin salir de la maquina, lo que resulta adecuado para entornos con requisitos de confidencialidad del codigo.
- Revision de capturas y diagramas tecnicos: gracias a la entrada de imagenes via `image_url` y al proyector BF16, se pueden enviar diagramas de arquitectura o capturas de errores junto con el codigo para obtener explicaciones contextualizadas.
- Agente de automatizacion con herramientas: el soporte de `tools` y `tool_calls` permite construir agentes que consulten APIs internas, ejecuten busquedas o lancen pipelines, con la posibilidad de desactivar el thinking para reducir latencia en tareas mecanicas.
- Despliegue en estacion de trabajo AMD: el paquete esta pensado para una Radeon AI PRO R9700 de 32 GB, de modo que un equipo con esa GPU puede servir el modelo con la API de OpenAI y sustituir llamadas a la nube en prototipos internos.
- Procesamiento de documentacion extensa: con 262.144 tokens de contexto se pueden resumir o extraer datos de manuales, contratos o especificaciones largas en una sola peticion, evitando estrategias de troceado.
- Evaluacion comparativa de runtimes: al incluir puertas de correccion frente a llama.cpp (tokens greedy, log-probs, vision, concurrencia), el paquete sirve para validar la fidelidad de un runtime alternativo sobre el mismo GGUF antes de adoptarlo en produccion.
- Servicio de chat interno de baja concurrencia: con 4 peticiones simultaneas y un maximo de 4.096 tokens de salida, encaja en herramientas de equipo pequeno donde la latencia importa mas que el throughput agregado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y para Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de correccion figuran como "not yet re-measured".

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el paquete se distribuye en Q4_K_M y esta dirigido a una GPU de 32 GB (Radeon AI PRO R9700) y a un sistema integrado con memoria unificada (Strix Halo). El calculo exacto de huella no se documenta.
- GPU recomendadas: AMD Radeon AI PRO R9700 (gfx1201, 32 GB) y AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151). No se mencionan GPU NVIDIA ni otras arquitecturas AMD.
- Compatibilidad con GPU de consumo: no confirmada; el unico hardware validado en la documentacion son los dos anteriores, ambos fuera del segmento de consumo general.
- Opciones de despliegue: runtime Loom (`pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` y `loom-serve`) con API compatible con OpenAI. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este paquete, aunque el GGUF de origen es compatible con llama.cpp por construccion.
- Parametros de ejecucion relevantes: `--device=amdgpu://?completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU), `--pool_backing=fixed` (reserva fija del pool de memoria) y `--parameter_mode=preload` (carga anticipada de pesos en host).
- Latencia y throughput: no disponibles; las filas de rendimiento no se han vuelto a medir para este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Logics-MLLM_Logics-SWE-Qwen3.6-35B-A3B (este paquete) | 35B | 3B | 262.144 | Apache 2.0 | GGUF Q4_K_M + paquete Loom | Solo AMD Strix Halo y R9700; benchmarks no remedidos |
| `bartowski/Logics-MLLM_Logics-SWE-Qwen3.6-35B-A3B-GGUF` (checkpoint de origen) | 35B | 3B | no disponible | Apache 2.0 | GGUF | Mismo modelo sin empaquetar; ejecutable con llama.cpp |
| Modelos Qwen3 MoE de la misma familia | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

No se dispone de informacion suficiente para comparar rendimiento, latencia o calidad con alternativas concretas; la unica comparacion documentada es contra llama.cpp como referencia de correccion, sin resultados publicados para este paquete.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de puertas de correccion remedidas: no hay evidencia publicada de que la salida coincida con la referencia de llama.cpp en este paquete concreto.
- El repositorio declara 0 GB de tamano y 0 descargas, lo que sugiere un artefacto recien generado y sin validacion por parte de la comunidad.
- La licencia Apache 2.0 se hereda del checkpoint base, pero la informacion sobre el entrenamiento y los datos del modelo subyacente no esta disponible, por lo que no puede auditarse el origen de los datos.
- Riesgo de alucinacion no cuantificado: no se han publicado evaluaciones de fidelidad, y el modo thinking activado por defecto puede incrementar la longitud de las respuestas y el consumo de tokens.
- Idiomas soportados no documentados; no se puede garantizar un comportamiento correcto en castellano ni en otras lenguas distintas del ingles sin evaluacion previa.
- Limitaciones de hardware: el paquete esta restringido a dos GPUs AMD concretas; no se documenta compatibilidad con NVIDIA, con otras AMD ni con CPU.
- Concurrencia maxima de 4 peticiones y salida maxima de 4.096 tokens, lo que limita su uso en servicios de alta carga o en generacion de documentos muy largos.
- La decodificacion especulativa no esta disponible, lo que puede penalizar la latencia frente a despliegues que si la aprovechan.
- El muestreo figura como "no determinado", de modo que el comportamiento de `temperature`, `top_k` y `seed` no esta verificado para este paquete.
- Dependencia de una version concreta del runtime (`hrx-loom[hf]==0.2.0`) y de un ecosistema joven (Loom, `loom-next`), con riesgo de cambios incompatibles.

## Enlaces

- Repositorio del paquete en Hugging Face: https://huggingface.co/loom-draft/bartowski-Logics-MLLM_Logics-SWE-Qwen3.6-35B-A3B-loom
- Checkpoint GGUF de origen: https://huggingface.co/bartowski/Logics-MLLM_Logics-SWE-Qwen3.6-35B-A3B-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador `loom-next`: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
