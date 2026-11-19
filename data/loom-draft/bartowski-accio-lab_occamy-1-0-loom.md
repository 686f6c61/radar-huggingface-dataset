# loom-draft/bartowski-Accio-Lab_occamy-1.0-loom

## Resumen

`loom-draft/bartowski-Accio-Lab_occamy-1.0-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) para el checkpoint GGUF `bartowski/Accio-Lab_occamy-1.0-GGUF`, concretamente la cuantizacion `Q4_K_M`. Lo publica el usuario `loom-draft` y esta generado con la herramienta `loom-next`, sin intervencion de un LLM en el bucle de generacion. No se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de empaquetado que permite servir el GGUF original en GPUs AMD concretas mediante el runtime `loom-serve` del ecosistema Loom.

El modelo subyacente, `Accio-Lab_occamy-1.0`, es un modelo multimodal de tipo image-text-to-text (acepta imagen y texto y genera texto), con soporte de razonamiento explicito (thinking) y tool calling. La informacion disponible no detalla su arquitectura interna, numero de parametros ni composicion del dataset de entrenamiento; solo se confirma que el projector multimodal asociado es `mmproj-Accio-Lab_occamy-1.0-bf16.gguf`.

La relevancia de este paquete es de infraestructura: demuestra el despliegue del modelo sobre hardware AMD de consumo y profesional (Ryzen AI Max+ 395 "Strix Halo" con gfx1151 y Radeon AI PRO R9700 con gfx1201 y 32 GB de VRAM), con una API compatible con OpenAI, contexto de 262.144 tokens por peticion y cuatro peticiones concurrentes. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo subyacente multimodal image-text-to-text; el paquete es un artefacto de despliegue Loom sobre GGUF) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (checkpoint empaquetado); projector multimodal en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (checkpoint `Accio-Lab_occamy-1.0-Q4_K_M.gguf`); paquete Loom con `model.json` y programas `.loom` |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo `Accio-Lab_occamy-1.0`: la model card del paquete Loom no describe el transformer, el numero de parametros, la composicion del dataset ni si hubo RLHF, DPO u otras fases de alineamiento. Lo unico verificable es que se trata de un modelo multimodal con entrada de imagen y texto, que emplea un projector separado (`mmproj-Accio-Lab_occamy-1.0-bf16.gguf`) para la parte visual y que expone un modo de razonamiento (thinking) activado por defecto.

El paquete en si no modifica los pesos: la model card indica explicitamente que trabaja sobre el checkpoint GGUF "sin modificar" de `bartowski/Accio-Lab_occamy-1.0-GGUF`. La innovacion tecnica del artefacto es el pipeline de generacion con `loom-next`, que produce kernels y programas `.loom` para las arquitecturas AMD gfx1151 y gfx1201, junto con un conjunto de puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) que comparan la salida contra una referencia de llama.cpp sobre el mismo GGUF. En el momento de publicacion, ninguna de estas puertas tiene medicion registrada para este paquete.

## Capacidades

- Generacion de texto y razonamiento con modo thinking activado por defecto; se puede desactivar con `chat_template_kwargs: {"enable_thinking": false}`.
- Entrada de imagen y texto (image-text-to-text) mediante partes `image_url` al estilo OpenAI, usando el projector bf16.
- Tool calling al estilo OpenAI, con campos `tools` y `tool_calls`.
- Servicio de API compatible con OpenAI en `/v1/chat/completions`.
- Contexto de 262.144 tokens por peticion y hasta 4 peticiones concurrentes.
- Limite de salida de 4.096 tokens por peticion (preset `max_tokens`).
- No soporta audio ni salida de audio.
- No aplica decodificacion especulativa ni ajuste de esfuerzo de razonamiento (`reasoning effort`).
- El muestreo (sampling) figura como "no determinado" en la tabla de caracteristicas.

## Casos de uso

- Despliegue local en hardware AMD: servir el modelo en un Ryzen AI Max+ 395 (Strix Halo) o en una Radeon AI PRO R9700 mediante `loom-fetch` y `loom-serve`, sin depender de CUDA ni de infraestructura en la nube.
- Asistente con entrada de imagen: clasificar, describir o razonar sobre capturas, diagramas o documentos escaneados usando las partes `image_url` de la API compatible con OpenAI.
- Agentes con tool calling: construir bucles multi-turno en los que el modelo invoque funciones externas (APIs, bases de datos, calculadoras) con el formato `tools`/`tool_calls`, con la opcion de desactivar el thinking para reducir latencia.
- Procesamiento de documentos largos: analisis de contratos, informes o expedientes de hasta 262.144 tokens en una sola peticion, adecuado para resumen y extraccion de entidades sobre corpus extensos.
- Razonamiento supervisado en local: usar el modo thinking por defecto para tareas de matematicas o logica donde interesa la traza de razonamiento, y desactivarlo en produccion interactiva.
- Evaluacion y benchmarking de runtimes: emplear las puertas de correccion del paquete (`golden`, `compare`, `vision`, `agent`) para validar la fidelidad de `loom-serve` frente a llama.cpp sobre el mismo GGUF.
- Prototipado de aplicaciones multimodales en estaciones de trabajo con GPU AMD profesional de 32 GB, con concurrencia de 4 peticiones para pequenos equipos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye secciones de rendimiento frente a llama.cpp para Strix Halo y Radeon AI PRO R9700, pero ambas indican que "los resultados de este paquete aun no se han vuelto a medir". Lo mismo ocurre con todas las puertas de correccion, que figuran como "not yet re-measured".

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el paquete esta pensado para una GPU Radeon AI PRO R9700 con 32 GB y para el Ryzen AI Max+ 395 (memoria unificada), y la cuantizacion Q4_K_M reduce el peso del checkpoint respecto a bf16.
- GPUs soportadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU de consumo: no se confirma compatibilidad con GPUs de consumo; el soporte declarado se limita a los dos destinos AMD anteriores.
- Despliegue: runtime `loom-serve` del ecosistema Loom, instalado via `pipx install "hrx-loom[hf]==0.2.0"`, con `loom-fetch` para descargar el paquete desde Hugging Face. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI en este paquete.
- Opciones de servicio: `--pool_backing=fixed`, `--parameter_mode=preload` y `completion_spin_ns=4294967295` para espera activa de finalizaciones de GPU.
- Latencia y throughput: no disponibles; las mediciones del paquete aun no se han realizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| `loom-draft/bartowski-Accio-Lab_occamy-1.0-loom` (este paquete) | no disponible | 262.144 tokens | imagen + texto | Apache 2.0 | GGUF empaquetado en Loom; `loom-serve` |
| `bartowski/Accio-Lab_occamy-1.0-GGUF` (modelo base) | no disponible | no disponible en la informacion | imagen + texto | Apache 2.0 (heredada) | GGUF; llama.cpp y otros runtimes GGUF |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes, y un tamano de 0.0 GB en el momento de la consulta; conviene verificar la integridad de los ficheros antes de usarlo en produccion.
- Ninguna de las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`) tiene medicion registrada para este paquete: no hay evidencia publicada de fidelidad frente a llama.cpp.
- No hay mediciones de rendimiento publicadas para Strix Halo ni para R9700; se desconoce la latencia y el throughput reales.
- El soporte de hardware esta limitado a gfx1151 y gfx1201; no se declara compatibilidad con GPUs NVIDIA, Intel ni con GPUs AMD de consumo.
- El limite de salida es de 4.096 tokens por peticion, lo que restringe tareas de generacion larga pese al contexto de 262.144 tokens.
- Solo se admiten 4 peticiones concurrentes, insuficiente para cargas de alta concurrencia.
- El muestreo figura como "no determinado"; no hay garantia documentada sobre el comportamiento de temperatura, top_k y semilla.
- No se especifican los idiomas soportados; el rendimiento en castellano no esta verificado.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; deben evaluarse empiricamente antes de un despliegue en atencion al cliente o dominios sensibles.
- La licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base; conviene revisar la licencia y las condiciones del checkpoint original `Accio-Lab_occamy-1.0`.
- El paquete depende de la version concreta del runtime (`hrx-loom[hf]==0.2.0`); cambios de version pueden alterar el comportamiento.

## Enlaces

- Paquete en Hugging Face: https://huggingface.co/loom-draft/bartowski-Accio-Lab_occamy-1.0-loom
- Modelo base GGUF: https://huggingface.co/bartowski/Accio-Lab_occamy-1.0-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
