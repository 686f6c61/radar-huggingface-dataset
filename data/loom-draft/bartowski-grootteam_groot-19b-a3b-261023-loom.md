# loom-draft/bartowski-GrootTeam_Groot-19B-A3B-261023-loom

## Resumen

GrootTeam_Groot-19B-A3B-261023 es un modelo de lenguaje y vision de tipo Mixture of Experts (MoE) con 19.000 millones de parametros totales y aproximadamente 3.000 millones de parametros activos por token, segun se deduce de la nomenclatura "19B-A3B" del checkpoint. El modelo original fue publicado por GrootTeam y cuantizado a GGUF por bartowski; esta ficha concreta es un paquete de despliegue generado por loom-draft para la plataforma Loom, un runtime de inferencia orientado a GPUs AMD (ROCm).

El paquete no contiene pesos nuevos: es una envoltura (programas `.loom` y un fichero `model.json`) alrededor del checkpoint sin modificar `GrootTeam_Groot-19B-A3B-261023-Q4_K_M.gguf`, junto con un proyector multimodal `mmproj-GrootTeam_Groot-19B-A3B-261023-bf16.gguf` para entrada de imagenes. Su relevancia es acotada pero concreta: demuestra la ejecucion de un modelo MoE multimodal de 19B en hardware AMD de consumo y estacion de trabajo, con decodificacion especulativa MTP y contexto de 262.144 tokens.

La informacion publicada se centra en el empaquetado y en el procedimiento de despliegue, no en las caracteristicas del modelo base. Los datos sobre entrenamiento, composicion del dataset, idiomas y benchmarks no estan disponibles en la informacion proporcionada, y las mediciones de rendimiento y las puertas de correccion aparecen como "not yet re-measured" en ambos dispositivos soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) transformer, multimodal (vision + texto); detalles internos no disponibles |
| Parametros totales | 19B (segun nomenclatura del checkpoint) |
| Parametros activos | ~3B (segun nomenclatura "A3B"); cifra exacta no disponible |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector de vision en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M) + proyector mmproj bf16; paquete Loom (`.loom` + `model.json`) |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| Decodificacion especulativa | MTP, profundidad 3, activada por defecto |
| Modo razonamiento | Activado por defecto; desactivable via `chat_template_kwargs: {"enable_thinking": false}` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | hrx-loom 0.2.0 (ROCm), API compatible con OpenAI |

## Arquitectura y entrenamiento

El checkpoint base es un modelo MoE multimodal: la nomenclatura "19B-A3B" indica 19.000 millones de parametros totales con aproximadamente 3.000 millones activos por token, lo que reduce el coste computacional por token frente a un modelo denso del mismo tamano. La componente de vision se implementa mediante un proyector separado (`mmproj-...-bf16.gguf`) que transforma las imagenes en tokens de prompt, siguiendo el esquema habitual de llama.cpp para modelos image-text-to-text. El pipeline declarado en Hugging Face es `image-text-to-text`.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, las tecnicas de alineacion (RLHF, DPO) ni innovaciones de atencion del modelo original. Lo que si documenta el paquete es la capa de inferencia: decodificacion especulativa basada en MTP (Multi-Token Prediction) con profundidad 3, activada por defecto, y un modo de razonamiento ("thinking") activado por defecto que puede desactivarse por peticion. El runtime Loom genera kernels especificos para las arquitecturas gfx1151 y gfx1201 y expone una API compatible con OpenAI.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" activado por defecto, desactivable por peticion.
- Entrada de imagenes mediante partes `image_url` en formato OpenAI, procesadas por el proyector bf16; tareas de image-text-to-text.
- Tool calling / function calling en formato OpenAI (`tools` y `tool_calls`).
- Bucles de agente multi-turno con reutilizacion de historial, validados por la puerta de correccion `agent`.
- Contexto largo de 262.144 tokens por peticion, adecuado para documentos extensos o conversaciones prolongadas.
- Decodificacion especulativa MTP con profundidad 3 para acelerar la generacion sin alterar la salida (puerta `spec`).
- Concurrencia de 4 peticiones simultaneas con salida consistente respecto a ejecuciones aisladas (puerta `consistency`).
- Capacidades multilingues: no disponible.
- Audio de entrada o salida: no soportado.

## Casos de uso

- Asistente documental con contexto largo: el limite de 262.144 tokens permite cargar informes, expedientes o bases de codigo extensas en una sola peticion y hacer preguntas sobre ellos sin trocear el contenido.
- Analisis de documentos escaneados y capturas: al aceptar imagenes via `image_url`, puede extraer y razonar sobre texto e informacion visual en facturas, formularios o diagramas dentro de un mismo flujo conversacional.
- Agentes de automatizacion con herramientas: el soporte de `tools`/`tool_calls` y la puerta `agent` lo hacen apto para orquestar llamadas a APIs, consultas a bases de datos o acciones sobre sistemas internos en bucles multi-turno.
- Despliegue en estaciones de trabajo AMD: el paquete esta pensado para Radeon AI PRO R9700 (32 GB) y Ryzen AI Max+ 395, lo que permite montar un servidor de inferencia local sin GPUs NVIDIA.
- Prototipado de asistentes con razonamiento controlable: el flag `enable_thinking` permite alternar entre respuestas razonadas (mayor coste) y respuestas directas segun la tarea, util en entornos con presupuesto de latencia ajustado.
- Evaluacion y benchmarking de runtimes: las puertas de correccion (`golden`, `compare`, `vision`, `spec`, `agent`, `logits`, `decision`) permiten verificar que un despliegue Loom reproduce fielmente la salida de referencia de llama.cpp sobre el mismo GGUF.
- Servicio conversacional ligero: con 4 peticiones concurrentes y ~3B parametros activos, encaja en escenarios de baja o media carga donde no se justifica un cluster de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mediciones de rendimiento frente a llama.cpp en Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "are not yet re-measured", y que todas las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambos dispositivos.

## Requisitos de hardware

- VRAM estimada: el checkpoint es Q4_K_M de un modelo de 19B, lo que situa los pesos en el orden de 11-13 GB; a ello se suma el proyector de vision en bf16 y la cache KV para contextos de hasta 262.144 tokens, cuyo consumo no se detalla en la informacion disponible.
- GPU soportadas oficialmente por el paquete: AMD Radeon AI PRO R9700 (gfx1201, 32 GB) y AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada).
- GPU de consumo: no se documenta soporte para GPUs de consumo AMD o NVIDIA; el paquete esta generado especificamente para las arquitecturas gfx1151 y gfx1201.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, seguido de `loom-fetch` para materializar el paquete y `loom-serve` con `--device=amdgpu://`, `--pool_backing=fixed` y `--parameter_mode=preload`. Alternativa: usar el GGUF original con llama.cpp u otro runtime compatible con GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este paquete.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones del modelo base que permitan una comparacion fiable con alternativas de la misma categoria. Como referencia estructural, el propio ecosistema ofrece el checkpoint original `bartowski/GrootTeam_Groot-19B-A3B-261023-GGUF`, que contiene los mismos pesos sin el empaquetado Loom y puede ejecutarse con llama.cpp en hardware mas amplio.

## Limitaciones y advertencias

- Paquete sin validar: todas las puertas de correccion y las mediciones de rendimiento figuran como no re-medidas, por lo que no hay evidencia publicada de que la salida coincida con la referencia de llama.cpp en estas GPUs.
- Hardware restringido: solo se documenta soporte para gfx1151 y gfx1201; no hay garantia de funcionamiento en otras GPUs AMD ni en NVIDIA.
- Cero adopcion: el repositorio registra 0 descargas y 0 likes, por lo que no existe validacion por parte de la comunidad.
- Idiomas y sesgos: no se dispone de informacion sobre cobertura linguistica, sesgos conocidos ni tasas de alucinacion del modelo base.
- Contexto y salida: aunque la ventana es de 262.144 tokens, la salida maxima esta limitada a 4.096 tokens por preset, lo que puede truncar respuestas largas.
- Concurrencia limitada: 4 peticiones simultaneas como maximo, insuficiente para cargas de produccion medias o altas.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original de GrootTeam y del proyector de vision, no detalladas en la informacion disponible.
- Ausencia de datos de entrenamiento: sin informacion sobre dataset y alineacion, no es posible evaluar riesgos especificos de sesgo o contaminacion.

## Enlaces

- Paquete Loom en Hugging Face: https://huggingface.co/loom-draft/bartowski-GrootTeam_Groot-19B-A3B-261023-loom
- Checkpoint GGUF base (bartowski): https://huggingface.co/bartowski/GrootTeam_Groot-19B-A3B-261023-GGUF
- Repositorio del runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
