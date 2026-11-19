# loom-draft/ReadyArt-Omega-Arsenal-26B-A4B-Final-loom

## Resumen

ReadyArt-Omega-Arsenal-26B-A4B-Final-loom es un paquete de despliegue en formato `.loom` generado por el proyecto Loom (loom-next) para ejecutar el checkpoint GGUF `Omega-Arsenal-26B-A4B-Final.i1-Q4_K_M_hb16.gguf` sobre GPUs AMD. No se trata de un modelo entrenado por el autor del repositorio (loom-draft), sino de un artefacto de empaquetado que incluye programas `.loom` y un fichero `model.json` que describen cómo servir el modelo base `ReadyArt/Omega-Arsenal-26B-A4B-Final-GGUF` en el hardware objetivo: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).

El interés del paquete reside en que permite ejecutar un modelo de 26B parámetros con arquitectura MoE (A4B, es decir, aproximadamente 4B parámetros activos) en hardware AMD de consumo y workstation mediante el runtime `hrx-loom` (versión 0.2.0), exponiendo una API compatible con OpenAI (`/v1/chat/completions`). El paquete soporta tool calling, modo de razonamiento opcional (desactivado por defecto), una ventana de contexto de 201.728 tokens por petición y hasta 4 peticiones concurrentes, con un límite de 4.096 tokens de salida por preset.

La relevancia es acotada pero concreta: el repositorio tiene 0 descargas y 0 likes, el tamaño del repo es 0,0 GB (no contiene los pesos, solo los artefactos de despliegue) y no se han publicado mediciones de rendimiento ni de corrección para este paquete concreto (todas las tablas de performance y correctness aparecen como "not yet re-measured"). Es, por tanto, un artefacto experimental de un ecosistema emergente (Loom) más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base se infiere MoE por el sufijo A4B; no se detalla en la informacion proporcionada) |
| Parametros totales | 26B (segun el nombre del modelo base) |
| Parametros activos | ~4B (sufijo A4B del nombre; no confirmado en la informacion) |
| Longitud de contexto | 201.728 tokens por peticion (segun la feature table del paquete) |
| Tipos de cuantizacion | Q4_K_M (checkpoint `i1-Q4_K_M_hb16.gguf`); otras no disponibles |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (empaquetado en formato `.loom` con `model.json`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base `ReadyArt/Omega-Arsenal-26B-A4B-Final-GGUF` en los datos proporcionados. El sufijo "A4B" del nombre sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 4B parametros activos sobre un total de 26B, pero este dato no esta confirmado en la model card. Tampoco se detallan el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

El paquete Loom en si no modifica el checkpoint: la model card indica explicitamente que se trata del "unmodified GGUF checkpoint" empaquetado con `loom-next` (el generador, sin LLM en el bucle). La innovacion tecnica del artefacto es el propio runtime: generacion de kernels especificos para gfx1151 y gfx1201, soporte de `completion_spin_ns` para espera activa de completaciones de GPU, `pool_backing=fixed` para reservar el pool de memoria por adelantado y `parameter_mode=preload` para precargar pesos en el host. No se menciona decodificacion especulativa (aparece como "not applicable" en la tabla de features).

## Capacidades

- Generacion de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling estilo OpenAI: acepta `tools` y devuelve `tool_calls`, con soporte de bucles multi-turno de llamadas a herramientas.
- Modo de razonamiento (thinking) opcional: desactivado por defecto, se activa con `chat_template_kwargs: {"enable_thinking": true}`. El "reasoning effort" no aplica.
- Concurrencia de hasta 4 peticiones simultaneas.
- Ventana de contexto de 201.728 tokens por peticion, adecuada para documentos largos.
- Salida maxima de 4.096 tokens por preset.
- Entrada de imagen: no soportada por Loom, aunque el modelo upstream la tiene segun la model card.
- Entrada/salida de audio: no soportada por Loom, aunque el modelo upstream la tiene segun la model card.
- Decodificacion especulativa: no aplicable en este paquete.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Muestreo (sampling): estado "?" (no determinado) en la tabla de features.

## Casos de uso

- Despliegue local en workstation AMD Radeon AI PRO R9700: el paquete `chat-r9700` esta pensado para GPUs gfx1201 de 32 GB, permitiendo servir el modelo cuantizado Q4_K_M con una API compatible con OpenAI sin depender de CUDA.
- Ejecucion en equipos con Ryzen AI Max+ 395 "Strix Halo": el preset `chat` para gfx1151 permite correr el modelo en un APU de AMD con memoria unificada, util para prototipado y desarrollo en entornos sin GPU dedicada.
- Agentes con tool calling: el soporte de `tools`/`tool_calls` y de bucles multi-turno (gate `agent` y `agent_think_off`) permite construir asistentes que consultan APIs externas o ejecutan funciones, siempre que se validen las salidas en produccion.
- Procesamiento de documentos largos: con 201.728 tokens de contexto, el modelo puede ingerir contratos, informes o bases de codigo extensas en una sola peticion, aunque el limite de salida de 4.096 tokens restringe la respuesta generada.
- Razonamiento con modo thinking para tareas analiticas: activando `enable_thinking`, el modelo puede emplearse en tareas que requieren cadenas de razonamiento, como analisis de datos o resolucion de problemas tecnicos, aceptando mayor latencia.
- Evaluacion comparativa frente a llama.cpp: el paquete incluye gates de correccion (`golden`, `compare`, `logits`, `sampling`) disenados para verificar que la salida coincide token a token con la referencia de llama.cpp sobre el mismo GGUF, lo que lo hace util para validar el runtime Loom en hardware AMD.
- Servicio de chat interno con concurrencia limitada: con 4 peticiones concurrentes y API OpenAI, puede actuar como backend de un chatbot de equipo para cargas ligeras, no para alta concurrencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todos los gates de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) aparecen como "not yet re-measured" en ambas plataformas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El checkpoint es Q4_K_M de un modelo de 26B, lo que tipicamente ocupa del orden de 15-17 GB en pesos, pero este calculo no esta confirmado en la informacion proporcionada.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- Cabe en consumer GPU: no confirmado; el paquete esta disenado para las dos plataformas AMD mencionadas, no para GPUs NVIDIA.
- Opciones de despliegue: `hrx-loom[hf]==0.2.0` con `loom-fetch` y `loom-serve`; no se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones de despliegue para este paquete (llama.cpp se usa solo como referencia de correccion).
- Flags de despliegue relevantes: `--device=amdgpu://?completion_spin_ns=4294967295`, `--pool_backing=fixed`, `--parameter_mode=preload`.
- Latencia y throughput: no disponibles; las mediciones "are not yet re-measured".

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni comparaciones con otros modelos, y el artefacto es especifico del runtime Loom para hardware AMD, por lo que no se dispone de alternativas directamente comparables en los datos facilitados.

## Limitaciones y advertencias

- El repositorio no contiene los pesos: el tamano es 0,0 GB y el paquete referencia el GGUF base `ReadyArt/Omega-Arsenal-26B-A4B-Final-GGUF`, que debe descargarse por separado.
- Sin evidencia de calidad: 0 descargas, 0 likes y todos los gates de correccion y rendimiento sin medir. No hay garantia de que la salida coincida con la referencia de llama.cpp en este paquete concreto.
- Sin soporte de vision ni audio en Loom, pese a que el modelo upstream los tiene; las capacidades multimodales no estan disponibles a traves de este runtime.
- Limite de salida de 4.096 tokens por preset, lo que puede ser insuficiente para tareas de generacion larga.
- Concurrencia maxima de 4 peticiones, insuficiente para cargas de produccion con trafico alto.
- El estado del muestreo aparece como "?" (no determinado), lo que impide garantizar el comportamiento de `temperature`, `top_k` y `seed`.
- Dependencia de hardware AMD especifico (gfx1151 y gfx1201) y del runtime `hrx-loom` 0.2.0; no hay soporte declarado para otras GPUs.
- Licencia apache-2.0 en el paquete, pero la licencia del modelo base debe verificarse por separado antes de uso comercial.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada, pero aplicables a cualquier modelo de lenguaje.
- Idiomas soportados no declarados; no se puede garantizar un rendimiento adecuado en castellano u otros idiomas.

## Enlaces

- Repositorio Hugging Face del paquete: https://huggingface.co/loom-draft/ReadyArt-Omega-Arsenal-26B-A4B-Final-loom
- Modelo base en Hugging Face: https://huggingface.co/ReadyArt/Omega-Arsenal-26B-A4B-Final-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Web del ecosistema Loom: https://loom-fun.github.io/loom-dev/
