# CyberBuddyAI/CyberBuddy-CloudSec-9B

## Resumen

CyberBuddy-CloudSec-9B es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-9B, desarrollado por CyberBuddyAI y orientado especificamente a operaciones de seguridad en la nube. El modelo esta disenado para tareas de lectura y revision en entornos AWS: revisiones de minimo privilegio, inspeccion de politicas IAM, deteccion de exposicion publica, inventario de nombres de secretos (sin revelar valores) y preguntas sobre postura de auditoria. No es un chatbot de proposito general: su alcance es deliberadamente acotado al dominio de la seguridad cloud.

Tecnicamente se trata de un transformer denso de aproximadamente 8.950 millones de parametros, derivado del Qwen3.5-9B mediante LoRA/QLoRA, con pesos distribuidos en safetensors (bf16), un adaptador PEFT independiente y una cuantizacion GGUF personalizada de 4 bits (capas 4-bit con embeddings de 8 bits). El modelo emplea la plantilla de chat nativa de Qwen3.5 y el formato XML nativo de llamada a herramientas (`<tool_call><function=…><parameter=…>`), ademas de un bloque `<think>` de razonamiento previo a cada respuesta.

Su relevancia actual radica en dos factores: por un lado, demuestra que un modelo de 9B puede ejecutarse en GPU de consumo (8 GB de VRAM con contexto de 64k) manteniendo capacidades de tool calling y razonamiento estructurado; por otro, incorpora guardarrailes de seguridad entrenados explicitamente para rechazar acciones peligrosas (desactivar CloudTrail, emitir credenciales estaticas de larga duracion, revelar valores de secretos o filtrar el system prompt), incluso frente a intentos de ingenieria social.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.5-9B) |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens (128k, segun configuracion de despliegue) |
| Tipos de cuantizacion | bf16, 4-bit (bitsandbytes), GGUF Q4_K_M con embeddings Q8 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, adaptador LoRA (PEFT) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer denso de aproximadamente 9B parametros, y se ajusta mediante LoRA/QLoRA (el repositorio incluye un directorio `adapter/` con los pesos PEFT aplicables sobre el modelo base). El entrenamiento se realizo nativamente en 4 bits, segun indica la model card, lo que explica la existencia de una build GGUF personalizada con capas de 4 bits y embeddings de 8 bits. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO; la model card solo menciona un conjunto de evaluacion retenido de 210 prompts de seguridad.

La innovacion tecnica principal no reside en la arquitectura, sino en el alineamiento conductual: el modelo fue entrenado para producir razonamiento explicito en un bloque `<think>` antes de cada respuesta, emitir llamadas a herramientas en el formato XML nativo de Qwen3.5 y mantener rechazos firmes ante peticiones peligrosas reformuladas como excusas de autoridad ("lo aprobo el CISO", "es un Sev-1"). El modelo esta entrenado para turnos de una sola llamada a herramienta, por lo que en bucles de agente se recomienda detener la generacion en el primer `</tool_call>`, ejecutar la herramienta y realimentar el resultado como siguiente turno.

## Capacidades

- Generacion de texto y razonamiento estructurado con bloque `<think>` previo a cada respuesta.
- Tool calling / function calling en el formato XML nativo de Qwen3.5 (`<tool_call><function=…><parameter=…>`).
- Soporte de agentes de un solo paso por turno, con patron de bucle documentado (detener en `</tool_call>`, ejecutar y realimentar).
- Revisiones de minimo privilegio sobre politicas IAM y permisos de AWS.
- Inspeccion de politicas y evaluacion de postura de auditoria.
- Triaje de exposicion publica de recursos.
- Enumeracion de solo lectura (read-only enumeration).
- Inventario de nombres de secretos y metadatos, sin revelar valores.
- Rechazo seguro y razonado de acciones peligrosas: desactivar CloudTrail, emitir credenciales estaticas de larga duracion, revelar valores de secretos o filtrar el system prompt.
- Resistencia a ingenieria social en peticiones de riesgo.
- Capacidades multilingues: limitadas al ingles segun la model card.

## Casos de uso

- Revision de minimo privilegio en IAM: el modelo inspecciona politicas y permisos, razona sobre el exceso de privilegios y propone alcances mas restrictivos, apoyandose en su entrenamiento especifico sobre politicas AWS.
- Triaje de exposicion publica: ante una lista de recursos, el modelo puede invocar herramientas de enumeracion de solo lectura y evaluar que recursos estan expuestos, priorizando la revision.
- Inventario de secretos sin riesgo de fuga: mediante la herramienta `list_secrets`, obtiene nombres y metadatos (por ejemplo, filtrando por `tag=prod`) para delimitar el alcance de una revision, sin acceder nunca a los valores.
- Copiloto para equipos SOC y DevSecOps: responde preguntas sobre postura de auditoria y configuracion, con razonamiento explicito en `<think>` que permite auditar el juicio del modelo antes de actuar.
- Asistente con guardarrailes en pipelines de agentes: integrado en un bucle de agente que ejecuta herramientas de solo lectura, el modelo emite llamadas bien formadas y rechaza acciones destructivas, lo que permite automatizar tareas de reconocimiento con un humano en el bucle para cambios consecuentes.
- Investigacion sobre seguridad en tool use y comportamiento de rechazo: el modelo y su evaluacion de 210 prompts retenidos sirven como banco de pruebas para estudiar alineamiento, sobre-rechazo y resistencia a ingenieria social en asistentes con acceso a herramientas.
- Despliegue en estaciones de trabajo con GPU de consumo: con la build GGUF de 5,5 GiB puede ejecutarse en una GPU de 8 GB con contexto de 64k, lo que facilita su uso por ingenieros de seguridad en equipos locales sin infraestructura dedicada.

## Benchmarks y rendimiento

La model card reporta una evaluacion interna retenida de 210 prompts de seguridad con los siguientes resultados declarados: 0% de filtraciones de secretos y 0% de sobre-rechazo. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

| Metrica (evaluacion interna) | Resultado |
|---|---|
| Filtraciones de secretos | 0% |
| Sobre-rechazo (over-refusal) | 0% |
| Tamano del conjunto de evaluacion | 210 prompts retenidos |

## Requisitos de hardware

- VRAM para inferencia en GGUF: 4,9 GiB con contexto de 4k en GPU de 6 GB; 6,9 GiB con contexto de 64k en GPU de 8 GB; 7,5 GiB con contexto de 128k y cache KV en 8 bits (q8_0) en GPU de 8 GB (ajustado); 8,9 GiB con contexto de 128k y cache KV en f16 en GPU de 10-12 GB.
- VRAM con transformers + bitsandbytes 4-bit: 7,1 GiB de pesos y 7,3 GiB de pico en contexto corto (GPU de 10-12 GB).
- VRAM con transformers en bf16: aproximadamente 17 GB de pesos (GPU de 24 GB o superior).
- GPU recomendadas: RTX 5070 Ti Laptop (mediciones oficiales), GPU de 8 GB para la build GGUF, GPU de 24 GB para bf16.
- Cabe en GPU de consumo: si, desde 8 GB con la build GGUF personalizada.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama (via GGUF), transformers con bf16 o bitsandbytes 4-bit, PEFT para aplicar el adaptador sobre Qwen3.5-9B.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CyberBuddy-CloudSec-9B | ~8,95B | 128k | Seguridad cloud, tool use, guardarrailes | Apache 2.0 | Hugging Face (safetensors, GGUF, LoRA) |
| Qwen/Qwen3.5-9B (base) | ~9B | no disponible | Proposito general | no disponible | Hugging Face |
| Alternativas de seguridad cloud de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos especializados en seguridad cloud con los que comparar parametros, contexto o rendimiento de forma rigurosa.

## Limitaciones y advertencias

- Alcance acotado: es un asistente de dominio para seguridad cloud, no un chatbot general; no esta pensado para conversacion abierta, programacion ni matematicas.
- Solo ingles: la model card declara unicamente el idioma ingles, sin soporte multilingue verificado.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir afirmaciones incorrectas sobre politicas o configuraciones; las decisiones de autorizacion no deben tomarse sin revision humana.
- No apto para decisiones de produccion sin humano en el bucle: la propia model card lo advierte para acciones de alto impacto.
- Turnos de una sola llamada a herramienta: el bucle de agente debe gestionarse externamente (detener en `</tool_call>`, ejecutar y realimentar).
- Guardarrailes entrenados, no garantizados: los rechazos (CloudTrail, credenciales estaticas, valores de secretos, system prompt) se basan en entrenamiento y evaluacion interna; no constituyen una garantia formal de seguridad.
- Evaluacion limitada: los resultados de 0% de filtraciones y 0% de sobre-rechazo provienen de un conjunto interno de 210 prompts, sin benchmarks publicos independientes.
- Licencia Apache 2.0: permite uso comercial, pero debe verificarse el cumplimiento de las condiciones del modelo base Qwen3.5-9B, cuya licencia no se detalla en la informacion disponible.
- Sesgos: no se documentan sesgos conocidos en la informacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CyberBuddyAI/CyberBuddy-CloudSec-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
