# loom-draft/netprojects-Qwen3.8-27B-hermes-adapted-loom

## Resumen

El modelo `loom-draft/netprojects-Qwen3.8-27B-hermes-adapted-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar `netprojects/Qwen3.8-27B-hermes-adapted-GGUF`, en su variante `Qwen3.8-27B-hermes-Q4_K_M.gguf`. No se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de empaquetado orientado a la inferencia eficiente sobre GPUs AMD concretas: el AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la AMD Radeon AI PRO R9700 (gfx1201, 32 GB). El autor del repositorio es `loom-draft`, y la generacion se realizo con la herramienta `loom-next` (solo el generador, sin LLM en el bucle).

El modelo subyacente es un Qwen de 27B parametros, presumiblemente de la familia Qwen3.8, adaptado por `netprojects` con el formato de prompt "hermes" y con capacidades multimodales (pipeline `image-text-to-text`, con proyector `mmproj-Qwen3.8-27B-hermes-F16.gguf`). El paquete Loom anade una capa de servicio con API compatible con OpenAI, decodificacion especulativa MTP (Multi-Token Prediction) a profundidad 3, modo de razonamiento configurable y soporte de tool calling, todo ello sobre el runtime `hrx-loom` (version 0.2.0) y el stack ROCm.

La relevancia de esta ficha es doble: por un lado, documenta un modelo de 27B con contexto de 262.144 tokens y vision, utilizable en produccion; por otro, ilustra un patron emergente de distribucion de modelos como paquetes de despliegue especificos por hardware, en este caso para aceleradores AMD de consumo profesional y APUs con memoria unificada. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0.0 GB, lo que sugiere que los pesos se resuelven en el momento de la descarga (`loom-fetch`) y no se almacenan en el propio repo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.8), con proyector multimodal para vision; no se especifica en la informacion disponible si incorpora atencion lineal o hibrida |
| Parametros totales | 27B (segun el nombre del checkpoint) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 262.144 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector de vision en F16 |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (`Qwen3.8-27B-hermes-Q4_K_M.gguf`) empaquetado como programas `.loom` + `model.json`; proyector `mmproj-Qwen3.8-27B-hermes-F16.gguf` |

## Arquitectura y entrenamiento

La informacion disponible no describe el proceso de entrenamiento del modelo base: no se indican numero de tokens, composicion del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento. Lo que si se conoce es la arquitectura de despliegue. El checkpoint es un transformer denso de 27B parametros cuantizado a Q4_K_M, con un proyector multimodal F16 que habilita la entrada de imagenes mediante partes `image_url` al estilo OpenAI. El paquete Loom genera kernels especificos para las arquitecturas AMD gfx1151 y gfx1201, y expone el modelo a traves de un servidor con API compatible con OpenAI.

La innovacion tecnica destacable no esta en el modelo sino en el runtime: decodificacion especulativa basada en MTP (Multi-Token Prediction) con profundidad 3, activada por defecto; modo de razonamiento con niveles `low`, `medium` y `xhigh` (por defecto `xhigh`); y una bateria de puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) que comparan la salida contra una referencia de llama.cpp registrada sobre el mismo GGUF. En el momento de la consulta, todas estas puertas figuran como "not yet re-measured" para ambas GPUs, por lo que no hay validacion publicada de esta build concreta.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" activado por defecto y desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`.
- Control granular del esfuerzo de razonamiento mediante `reasoning_effort` (`low`, `medium`, `xhigh`; por defecto `xhigh`).
- Entrada de imagenes (image-text-to-text) mediante partes `image_url` al estilo OpenAI, con proyector F16 dedicado.
- Tool calling / function calling con esquema OpenAI (`tools` y `tool_calls`), incluyendo bucles multi-turno de agente.
- Decodificacion especulativa MTP con profundidad 3, activada por defecto.
- Contexto de 262.144 tokens por peticion, con hasta 4 peticiones concurrentes.
- Limite de salida de 4.096 tokens por peticion (preset `max_tokens`).
- API compatible con OpenAI en `/v1/chat/completions`.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Audio de entrada/salida: no determinado segun la model card.
- Muestreo (sampling): no determinado segun la model card, aunque existe una puerta de correccion `sampling` que verifica temperatura, top_k y semilla.

## Casos de uso

- Atencion al cliente automatizada con documentos largos: el contexto de 262.144 tokens permite ingerir manuales, historiales de tickets y politicas completas en una sola peticion, manteniendo coherencia en conversaciones multi-turno sin trocear el contexto.
- Analisis de documentos tecnicos con imagenes: la entrada multimodal (`image_url` + proyector F16) permite procesar diagramas de arquitectura, capturas de paneles de monitorizacion o esquemas de circuitos junto a texto explicativo en la misma consulta.
- Agentes de automatizacion con tool calling: el soporte de `tools`/`tool_calls` y las puertas `agent` y `agent_think_off` del runtime lo hacen adecuado para bucles de agente que consultan APIs, ejecutan busquedas o modifican sistemas, con historial reutilizado entre turnos.
- Asistente de codigo en estaciones de trabajo AMD: al ejecutarse sobre Strix Halo (memoria unificada) o R9700 (32 GB), puede desplegarse localmente en un equipo de desarrollo sin depender de la nube, con cuantizacion Q4_K_M y decodificacion especulativa para reducir latencia.
- Razonamiento con esfuerzo configurable en pipelines por lotes: el parametro `reasoning_effort` permite usar `low` para clasificacion o extraccion rapida y `xhigh` para tareas de analisis complejo, ajustando coste computacional por peticion.
- Procesamiento por lotes de informes extensos: con 4 peticiones concurrentes y contexto de 262k, se pueden resumir o extraer entidades de informes anuales, expedientes o documentacion regulatoria en paralelo, siempre que cada documento quepa en la ventana.
- Despliegue en infraestructura AMD on-premise: el paquete Loom evita la dependencia de CUDA y ofrece un servidor compatible con OpenAI sobre ROCm, util para organizaciones con hardware AMD que necesitan cumplimiento de residencia de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye secciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201), pero ambas indican explicitamente que "the results for this package are not yet re-measured". Tampoco se proporcionan cifras de MMLU, HumanEval, GSM8K ni de latencia o throughput. Las puertas de correccion (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran igualmente como no re-medidas para ambas GPUs.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con 27B parametros en Q4_K_M (aproximadamente 4,5 bits por peso), el peso de los pesos ronda los 15-16 GB, a lo que hay que sumar el proyector F16, la cache KV para contexto largo y el pool de memoria del preset Loom. Para contexto de 262k la cache KV puede ser un factor dominante y no se documenta su tamano.
- GPU objetivo segun la model card: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- No se documenta soporte para A100, H100 ni RTX 4090; el paquete esta generado especificamente para las arquitecturas AMD citadas.
- Opciones de despliegue: runtime `hrx-loom` 0.2.0 (instalable via `pipx install "hrx-loom[hf]==0.2.0"`), con `loom-fetch` para materializar el paquete y `loom-serve` para servir el modelo. Presets `chat` (Strix Halo) y `chat-r9700` (R9700). No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este paquete concreto, aunque llama.cpp se usa como referencia de correccion.
- Parametros de servicio relevantes: `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU), `--pool_backing=fixed` (pool de memoria fijo) y `--parameter_mode=preload` (carga de pesos en host).
- Latencia y throughput: no disponibles; la model card indica que las mediciones aun no se han repetido para este paquete.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la informacion proporcionada, por lo que la comparativa se limita a los datos ciertos disponibles.

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| `loom-draft/netprojects-Qwen3.8-27B-hermes-adapted-loom` | 27B | 262.144 tokens | MIT | GGUF Q4_K_M empaquetado en Loom; `hrx-loom` sobre AMD gfx1151/gfx1201 | Paquete de despliegue especifico por hardware, con vision, tool calling y MTP |
| `netprojects/Qwen3.8-27B-hermes-adapted-GGUF` | 27B | No disponible | No disponible en la informacion | GGUF | Checkpoint base sin empaquetar; el paquete Loom lo referencia como modelo base |
| Alternativas de la misma categoria | No disponible | No disponible | No disponible | No disponible | No se han proporcionado datos de otros modelos Qwen de 27B ni de modelos comparables con vision y contexto similar |

## Limitaciones y advertencias

- El repositorio no contiene los pesos (tamano 0.0 GB); la descarga materializa el paquete desde el checkpoint base mediante `loom-fetch`, lo que introduce una dependencia de red y de disponibilidad del repo `netprojects/Qwen3.8-27B-hermes-adapted-GGUF`.
- Todas las puertas de correccion y las mediciones de rendimiento figuran como "not yet re-measured" para ambas GPUs; no hay evidencia publicada de que la salida coincida con la referencia de llama.cpp en esta build.
- El paquete esta generado exclusivamente para AMD Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201); no se documenta funcionamiento en GPUs NVIDIA ni en otras arquitecturas AMD.
- El limite de salida por peticion es de 4.096 tokens (preset `max_tokens`), muy inferior a la ventana de contexto de 262.144 tokens; las tareas que requieran respuestas largas necesitaran ajustar el preset o dividir la generacion.
- La concurrencia esta limitada a 4 peticiones simultaneas segun la model card; no se documenta el comportamiento bajo mayor carga.
- Idiomas soportados no disponibles: no se puede confirmar el rendimiento en castellano ni en otros idiomas distintos del ingles sin evaluacion propia.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; al ser un modelo de 27B cuantizado a Q4_K_M, cabe esperar cierta degradacion respecto a precision completa, pero no se aportan mediciones.
- La licencia MIT se declara en la model card; conviene verificar que el checkpoint base `netprojects/Qwen3.8-27B-hermes-adapted-GGUF` mantiene la misma licencia, ya que la informacion disponible no lo confirma.
- El modo de razonamiento esta activado por defecto con `reasoning_effort=xhigh`, lo que incrementa el consumo de tokens y la latencia si no se desactiva o se reduce explicitamente.
- La cuantizacion Q4_K_M y el uso de decodificacion especulativa MTP pueden introducir divergencias en tareas de alta precision; la puerta `spec` esta disenada para verificar que la salida con especulacion coincide con la salida sin ella, pero no se ha re-medido.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/netprojects-Qwen3.8-27B-hermes-adapted-loom
- Checkpoint base GGUF: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
