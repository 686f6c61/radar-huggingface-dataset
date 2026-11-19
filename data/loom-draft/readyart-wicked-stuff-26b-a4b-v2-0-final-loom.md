# loom-draft/ReadyArt-Wicked-Stuff-26B-A4B-v2.0-Final-loom

## Resumen

ReadyArt-Wicked-Stuff-26B-A4B-v2.0-Final-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado por el usuario `loom-draft` a partir del checkpoint GGUF sin modificar `ReadyArt/Wicked-Stuff-26B-A4B-v2.0-Final-GGUF`, en su cuantizacion `i1-Q4_K_M`. No es un modelo entrenado desde cero ni un fine-tune nuevo: es un artefacto de empaquetado que traduce los pesos GGUF a kernels generados para GPUs AMD concretas, en este caso la AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la AMD Radeon AI PRO R9700 (gfx1201, 32 GB).

El objetivo del paquete es servir el modelo con `loom-serve` exponiendo una API compatible con OpenAI (`/v1/chat/completions`), con soporte de tool calling y un modo de razonamiento opcional desactivado por defecto. La nomenclatura "26B-A4B" del checkpoint base sugiere una arquitectura de mezcla de expertos con aproximadamente 26 mil millones de parametros totales y unos 4 mil millones activos por token, aunque esta ficha no puede confirmar esos datos a partir de la informacion disponible.

La relevancia es acotada: el repositorio tiene 0 descargas y 0 likes, el tamano del repo es de 0,0 GB y las mediciones de rendimiento y de correccion del paquete aparecen como "not yet re-measured" en la propia model card. Es, por tanto, un artefacto experimental de la cadena de herramientas Loom, no una distribucion lista para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre del checkpoint base sugiere MoE con ~26B totales y ~4B activos; sin confirmar) |
| Parametros totales | no disponible (el nombre indica 26B; sin confirmar en la informacion proporcionada) |
| Parametros activos | no disponible (el nombre indica A4B, ~4B activos; sin confirmar) |
| Longitud de contexto | 201.728 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (variante `i1-Q4_K_M` del checkpoint base) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (checkpoint base) empaquetado como programa Loom (`.loom` + `model.json`) |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Decodificacion especulativa | no aplicable en este paquete |
| Entrada de imagen | no soportada por Loom (el modelo upstream si la tiene) |
| Entrada/salida de audio | no soportada por Loom (el modelo upstream si la tiene) |
| Muestreo (sampling) | no determinado |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del checkpoint base `ReadyArt/Wicked-Stuff-26B-A4B-v2.0-Final-GGUF` mas alla de lo que sugiere su nombre (26B totales, A4B activos, compatible con un esquema de mezcla de expertos). Tampoco hay datos sobre el corpus de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Toda esa informacion corresponderia a la model card del checkpoint original, que no forma parte de la documentacion proporcionada.

Lo que si describe la model card es la capa de empaquetado: `loom-next` genera kernels especificos para las arquitecturas AMD gfx1151 y gfx1201 a partir del GGUF, y `loom-serve` los ejecuta con opciones como `completion_spin_ns=4294967295` (espera activa de las finalizaciones de GPU), `pool_backing=fixed` (pool de memoria comprometido por adelantado) y `parameter_mode=preload` (carga anticipada de pesos en host). El paquete incluye dos presets, `chat` y `chat-r9700`, uno por cada GPU objetivo.

## Capacidades

- Generacion de texto conversacional mediante una API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling en estilo OpenAI, con campos `tools` y `tool_calls`.
- Modo de razonamiento opcional, desactivado por defecto, que se activa con `chat_template_kwargs: {"enable_thinking": true}`.
- Soporte de conversaciones multi-turno con hasta 201.728 tokens de contexto por peticion.
- Concurrencia de hasta 4 peticiones simultaneas.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision: no soportada por Loom, aunque el modelo upstream si la tiene.
- Audio: no soportado por Loom, aunque el modelo upstream lo tiene.
- Decodificacion especulativa: no aplicable en este paquete.
- Ajuste de esfuerzo de razonamiento (reasoning effort): no aplicable.

## Casos de uso

- Evaluacion de la cadena de herramientas Loom: el paquete sirve para probar `loom-fetch` y `loom-serve` sobre hardware AMD Strix Halo o R9700, verificando que los kernels generados cargan y responden por la API compatible con OpenAI.
- Despliegue local en estaciones con Ryzen AI Max+ 395: un equipo con esa APU puede servir el modelo con `loom-serve` y consumirlo desde herramientas que hablen el protocolo de OpenAI, sin depender de GPUs NVIDIA.
- Despliegue en servidores con Radeon AI PRO R9700: el preset `chat-r9700` esta pensado para esa GPU de 32 GB, lo que permite montar un endpoint interno de chat sobre hardware AMD profesional.
- Pruebas de agentes con tool calling: la API acepta `tools` y devuelve `tool_calls`, de modo que se puede validar un bucle de agente multi-turno contra este backend antes de migrarlo a otro runtime.
- Comparacion de runtimes: al mantener el mismo GGUF que llama.cpp, el paquete permite contrastar salidas y latencias entre `loom-serve` y llama.cpp sobre el mismo checkpoint, aunque las puertas de correccion de la model card aun no tienen mediciones registradas.
- Experimentacion con contexto largo: los 201.728 tokens por peticion permiten probar cargas de documentos extensos en un entorno local AMD, siempre que la memoria del pool configurado lo admita.
- Validacion de modo thinking: activando `enable_thinking` se puede comparar el comportamiento del modelo con y sin razonamiento explicito en tareas de varios pasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas GPUs.

## Requisitos de hardware

- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- VRAM estimada: no disponible. El checkpoint es Q4_K_M de un modelo de ~26B, lo que en la practica exige del orden de 15-17 GB solo para pesos, mas overhead de contexto y pool; la model card no publica cifras.
- GPUs NVIDIA: no soportadas por este paquete, que genera kernels para arquitecturas AMD gfx1151 y gfx1201.
- GPU de consumo: no confirmado; el paquete esta pensado para hardware AMD especifico, no para RTX 4090 ni similares.
- Opciones de despliegue: `hrx-loom[hf]==0.2.0` instalado con `pipx`, `loom-fetch` para descargar el paquete y `loom-serve` para servirlo. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este artefacto concreto.
- Latencia y throughput: no disponibles; las filas de rendimiento de la model card estan pendientes de re-medicion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ReadyArt-Wicked-Stuff-26B-A4B-v2.0-Final-loom | no disponible (nombre indica 26B/A4B) | 201.728 tokens | Apache 2.0 | Loom (GGUF empaquetado) | Paquete para AMD gfx1151/gfx1201; sin benchmarks ni mediciones |
| ReadyArt/Wicked-Stuff-26B-A4B-v2.0-Final-GGUF | no disponible (mismo checkpoint) | no disponible | no disponible | GGUF | Checkpoint original; runtime generico tipo llama.cpp |
| llama.cpp sobre el mismo GGUF | no disponible | no disponible | no disponible | GGUF | Referencia usada por las puertas de correccion de Loom; sin datos publicados en esta ficha |

No se dispone de datos de rendimiento ni de especificaciones verificadas de alternativas de la misma categoria en la informacion proporcionada, por lo que la comparativa se limita a la relacion entre el paquete Loom y su checkpoint de origen.

## Limitaciones y advertencias

- Artefacto de empaquetado, no un modelo nuevo: cualquier limitacion del checkpoint base se hereda sin cambios.
- Sin evidencia de correccion: todas las puertas (`golden`, `compare`, `agent`, `sampling`, `logits`, etc.) figuran como no re-medidas, por lo que no hay garantia publicada de que las salidas coincidan con llama.cpp.
- Sin benchmarks de rendimiento: no hay cifras de latencia ni throughput para ninguna de las dos GPUs objetivo.
- Cobertura de hardware muy estrecha: solo Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); no hay soporte declarado para NVIDIA ni para otras GPU AMD.
- Sin vision ni audio en este paquete, pese a que el modelo upstream las soporta.
- Concurrencia limitada a 4 peticiones y salida maxima de 4.096 tokens por preset.
- Idiomas soportados no documentados; no se puede garantizar calidad en castellano ni en otros idiomas.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion disponible.
- Licencia Apache 2.0 declarada en el repositorio, lo que en principio permite uso comercial, pero conviene verificar la licencia del checkpoint base antes de desplegar.
- Repositorio sin descargas ni likes y con tamano de 0,0 GB, lo que sugiere que los ficheros del paquete podrian no estar efectivamente alojados o que el artefacto es puramente experimental.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/loom-draft/ReadyArt-Wicked-Stuff-26B-A4B-v2.0-Final-loom
- Checkpoint base en Hugging Face: https://huggingface.co/ReadyArt/Wicked-Stuff-26B-A4B-v2.0-Final-GGUF
- Repositorio de Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
