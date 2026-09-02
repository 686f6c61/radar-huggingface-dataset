# antibyte/AuraGo-Ling

## Resumen

AuraGo-Ling es un fine-tune experimental del modelo MoE Ling-3.0-tiny de inclusionAI (Ant Group), desarrollado por antibyte para el protocolo nativo de tool-calling del agente AuraGo, un agente conversacional escrito en Go. El modelo se publica exclusivamente como export GGUF en cuantización Q4_K_L, con un peso de aproximadamente 5,1 GB, y está diseñado para ser ejecutado con un motor híbrido específico (llama-wackMall-hybrid) en lugar de los runtimes estándar. Su propósito no es sustituir a un asistente generalista, sino servir como componente de razonamiento y generación de comandos dentro del ecosistema AuraGo, cubriendo diálogos de corrección y reproducción de sesiones con herramientas.

La relevancia actual del modelo radica en su enfoque especializado: en lugar de un LLM polivalente, ofrece una capa de control fino sobre un protocolo de agente concreto, con una arquitectura MoE de aproximadamente 7,9 mil millones de parámetros totales y 1,3 mil millones activos, y una ventana de contexto validada de 16K tokens. El entrenamiento se realizó mediante una LoRA correctiva sobre 922 diálogos revisados, incluyendo cobertura de 57 comandos AuraGo, y la evaluación interna reporta 68/76 casos de corrección y 49/49 casos de replay sin fallos de esquema. No obstante, el autor advierte que estos resultados corresponden a casos sintéticos, no a benchmarks públicos, y que el conocimiento general en alemán del modelo no es fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) |
| Parametros totales | 7.893.392.800 (~7,9B) |
| Parametros activos | ~1,3B |
| Longitud de contexto | 16.384 tokens (validada; 32K requiere validacion separada) |
| Tipos de cuantizacion | Q4_K_L (unico artefacto publicado) |
| Idiomas soportados | aleman (de), ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (Q4_K_L) |

## Arquitectura y entrenamiento

El modelo parte de inclusionAI/Ling-3.0-tiny, un LLM MoE de Ant Group con aproximadamente 7,9B parametros totales y 1,3B activos. Sobre esta base se aplico una LoRA correctiva fresca, entrenada durante tres epocas sobre 922 dialogos revisados, con 348 pasos planificados y exportacion final en el checkpoint 300. El entrenamiento cubrio 57 comandos AuraGo recien identificados y se implemento con el sistema AReno (revision `a13b9325a4745c08d3da6c1e6ffb2ddef902dcba`). Los ejemplos de entrenamiento son dialogos sinteticos o revisados del protocolo AuraGo; no se incluyen artefactos de sesion, credenciales ni registros operativos.

La cuantizacion Q4_K_L sigue la disposicion mixta de referencia de bartowski/Ling-3.0-tiny-GGUF, con 111 tensores Q4_K, 30 Q5_K, 69 Q6_K, 83 Q8_0 y 233 F32. El autor especifica que el GGUF se publica sin conversion ni cambios de metadatos, y que la plantilla de chat incrustada es obligatoria para su uso.

## Capacidades

- Generacion de texto conversacional en aleman e ingles, orientada a dialogos de agente con historial de herramientas.
- Tool-calling nativo para el protocolo AuraGo: el modelo emite comandos estructurados que el runtime de AuraGo interpreta y ejecuta.
- Soporte de agentes multi-turno: puede gestionar dos rondas sucesivas de resultados de herramientas (validado en pruebas).
- Reutilizacion de cache de prompt: soporta recuperacion de contexto desde el inicio y desde la mitad de entradas de hasta 14.658 tokens dentro de la ventana de 16K.
- Capacidad de streaming de respuestas.
- No incluye capacidades de vision, audio ni modo thinking (el chat template desactiva `enable_thinking`).

## Casos de uso

- Asistente conversacional para AuraGo: el modelo gestiona conversaciones multi-turno con historial de herramientas, emitiendo comandos nativos que el agente Go ejecuta de forma segura.
- Automatizacion de tareas con tool-calling: integrado en el runtime AuraGo, puede invocar funciones definidas por el usuario (por ejemplo, proveedores Vercel, cron, descripciones de display) a partir de instrucciones en lenguaje natural.
- Soporte bilingue aleman-ingles para aplicaciones de agente: util para entornos germanoparlantes donde se requiere interaccion en ambos idiomas con un unico modelo.
- Prototipado rapido de agentes especializados: al ser un fine-tune ligero (1,3B activos), permite iterar sobre el protocolo AuraGo sin necesidad de un modelo grande.
- Despliegue en entornos con recursos limitados: el GGUF de 5,1 GB cabe en GPUs de consumo con 6 GB o mas de VRAM, y el motor híbrido permite ejecucion en Vulkan (probado en Intel Arc B580).
- Pruebas de regresion de protocolo: el modelo esta disenado para mantener la integridad del esquema de comandos, por lo que puede usarse como verificador en pipelines de integracion de AuraGo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor reporta una evaluacion interna sobre casos sinteticos de regresion, que se resume a continuacion:

| Metrica | Resultado |
|---|---|
| Casos de correccion (export Q4_K_L) | 68/76 |
| Casos de replay | 49/49 |
| Turnos de regresion/control sin fallos de esquema o truncamiento | 140/140 |
| Casos de correccion (adaptador sin cuantizar) | 72/76 |

La velocidad de mas de 100 tokens/s mencionada en la model card pertenece a un experimento anterior con Ling/engine y no es un resultado medido para este artefacto. Tampoco se ofrecen datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF Q4_K_L ocupa 5.096.544.352 bytes (~5,1 GB), por lo que se recomienda al menos 6 GB de VRAM para inferencia con contexto completo de 16K.
- GPU compatibles: se ha probado en Intel Arc B580 (Vulkan, con la variable `GGML_VK_DISABLE_F16=1`), y se menciona una GTX 1660 mobile en un experimento previo no aplicable a este artefacto. Los runtimes CUDA, SYCL y Vulkan son experimentales hasta que pasen pruebas de aceptacion nativas en Linux.
- No cabe en GPUs con menos de 6 GB de VRAM; para 16K de contexto se requiere que toda la ventana permanezca disponible (no usar reduccion automatica de contexto).
- Opciones de despliegue: exclusivamente con el motor híbrido `llama-wackMall-hybrid` (revision `f37a34cd4e502284ca297e141a6c4013bd151b18`) junto con el parche de inicio y aislamiento de cache de AuraGo. No se soporta vLLM, Ollama ni TGI estandar.
- Configuracion recomendada para CUDA: `--ctx-size 16384 --parallel 1 --n-gpu-layers all --no-cpu-moe --batch-size 64 --ubatch-size 64 --cache-type-k q8_0 --cache-type-v q8_0 --flash-attn on --backend-sampling --spec-type none --reasoning off --jinja`. Para SYCL/Vulkan se usan KV en F16, flash attention `auto`, batch/ubatch 512 y sin backend-sampling.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| AuraGo-Ling (este) | 7,9B total / 1,3B activos | 16K | MIT | Tool-calling para protocolo AuraGo |
| inclusionAI/Ling-3.0-tiny (base) | 7,9B total / 1,3B activos | 16K (referencia) | MIT | Generalista, sin fine-tune especifico |
| antibyte/AuraGo-Qwen3.5-4B-MTP-v1 | 4B (sin dato de activos) | no disponible | Apache-2.0 | Tool-calling y agente, con soporte MTP (speculative decoding) |

AuraGo-Ling se diferencia del base por su capa de LoRA orientada al protocolo, mientras que el modelo Qwen3.5 es mas pequeno y esta pensado para decodificacion especulativa; no hay datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- No es un modelo generalista: su conocimiento factual fuera del ambito de AuraGo es limitado y no fiable, especialmente en aleman general.
- Fallos conocidos: dos casos de descripcion/nombre de display, cuatro elecciones prematuras de proveedor Vercel y dos casos de cron en aleman.
- La evaluacion se basa en casos sinteticos de regresion con historial de conversacion y resultados de herramientas; no implica precision factual ni funcionamiento con herramientas reales.
- Los runtimes CUDA, SYCL y Vulkan son experimentales; las pruebas en Windows/WSL no cualifican un backend Linux nativo.
- El motor híbrido requiere un parche especifico para evitar que se sustituya el historial de conversacion cacheado por una solicitud de API no relacionada.
- El uso en produccion exige validar los argumentos de las herramientas en la aplicacion host, mantener los permisos de AuraGo y disponer de un proveedor de respaldo.
- La licencia MIT permite uso comercial, pero el modelo depende del ecosistema AuraGo y de su motor propietario; no es un reemplazo directo para otros LLMs.
- La velocidad declarada de 100 tokens/s no corresponde a este artefacto y no debe citarse como caracteristica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/antibyte/AuraGo-Ling
- Repositorio de AuraGo: https://github.com/antibyte/AuraGo
- Motor híbrido (revision fijada): https://github.com/antibyte/llama-wackMall-hybrid/tree/f37a34cd4e502284ca297e141a6c4013bd151b18
- Modelo base Ling-3.0-tiny: https://huggingface.co/inclusionAI/Ling-3.0-tiny
- Referencia de cuantizacion GGUF: https://huggingface.co/bartowski/Ling-3.0-tiny-GGUF
- Otro fine-tune de AuraGo (Qwen3.5-4B-MTP): https://huggingface.co/antibyte/AuraGo-Qwen3.5-4B-MTP-v1
