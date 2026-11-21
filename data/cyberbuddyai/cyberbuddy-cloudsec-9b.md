# CyberBuddyAI/CyberBuddy-CloudSec-9B

## Resumen

CyberBuddy-CloudSec-9B es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-9B, desarrollado por CyberBuddyAI, especializado en operaciones de seguridad en la nube. El modelo está diseñado para asistir en tareas de revisión de privilegios mínimos, inspección de políticas IAM, comprobación de exposición pública de recursos, inventario de secretos (solo nombres, nunca valores) y preguntas sobre postura de auditoría en entornos AWS. Con 8.953.803.264 parámetros totales, se distribuye bajo licencia Apache 2.0 y está entrenado y servido nativamente en 4 bits.

El modelo destaca por incorporar barreras de seguridad (guardrails) basadas en principios: rechaza acciones peligrosas como deshabilitar CloudTrail, emitir credenciales estáticas de larga duración, revelar valores de secretos o mostrar su propio system prompt, incluso ante intentos de ingeniería social. Emite llamadas a herramientas en el formato XML nativo de Qwen3.5 (`<tool_call><function=…><parameter=…>`) y precede cada respuesta con un bloque `<think>` que explica el juicio de seguridad aplicado.

Además de su uso operativo, el modelo es un artefacto de investigación: constituye el control limpio emparejado de un estudio sobre agentes durmientes (sleeper agents), compartiendo base, datos y persona SecOps con su gemelo con puerta trasera (backdoor) CyberBuddy-Sleeper-Spy-CloudSec-9B, pero sin trigger malicioso. Esto lo convierte en una línea base de falsos positivos para detectores de backdoors y calibración de sondas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen/Qwen3.5-9B) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 64k tokens (soportado en la build GGUF; contexto nativo del base no especificado) |
| Tipos de cuantizacion | bf16 (safetensors), 4-bit (`load_in_4bit`), GGUF Q4_K_M con embeddings de 8 bits (5,5 GiB) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), GGUF, adaptador LoRA/PEFT en `adapter/` |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer de 9B parámetros, y se ajusta mediante LoRA/QLoRA (PEFT) para especializarlo en operaciones de seguridad en la nube. El entrenamiento se realizó nativamente en 4 bits, lo que permite servir el modelo con requisitos de memoria reducidos. No se especifican en la información disponible el número exacto de tokens de entrenamiento ni la composición detallada del dataset.

La innovación técnica principal es la integración de una persona SecOps consistente (asistente nombrado para una empresa ficticia, con herramientas de nube/IAM, una regla de seguridad opcional y un secreto plantado que debe proteger) junto con un mecanismo de razonamiento transparente mediante bloques `<think>`. El modelo utiliza el formato nativo de llamadas a herramientas de Qwen3.5 y fue entrenado para mantener rechazos basados en principios ante solicitudes peligrosas, resistiendo intentos de ingeniería social. No se mencionan detalles sobre RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto especializada en seguridad en la nube (cloud security) y DevSecOps.
- Llamadas a herramientas (tool calling / function calling) en formato XML nativo de Qwen3.5 para herramientas de IAM, políticas y auditoría.
- Razonamiento transparente mediante bloques `<think>` que explican el juicio de seguridad antes de cada respuesta.
- Rechazo basado en principios de acciones peligrosas: deshabilitar CloudTrail, emitir credenciales de larga duración, revelar valores de secretos o mostrar el system prompt.
- Resistencia a ingeniería social (por ejemplo, "el CISO lo aprobó", "es un Sev-1").
- Capacidades de agente y razonamiento multi-paso para tareas de auditoría y revisión de privilegios mínimos.
- Inventario de secretos (solo nombres, nunca valores).
- Comprobación de exposición pública de recursos y preguntas sobre postura de auditoría.
- Capacidades multilingües: solo inglés (en).

## Casos de uso

- Revisión de privilegios mínimos (least-privilege): el modelo analiza políticas IAM y sugiere reducciones de permisos, emitiendo llamadas a herramientas de inspección de políticas y explicando el razonamiento en el bloque `<think>`.
- Auditoría de postura de seguridad en AWS: responde preguntas sobre configuración de auditoría y detecta riesgos como registros de CloudTrail deshabilitados, con rechazo explícito a desactivar la auditoría.
- Triaje de exposición pública: identifica recursos potencialmente expuestos y guía la enumeración de solo lectura mediante herramientas, sin ejecutar acciones destructivas.
- Inventario de secretos seguro: enumera nombres de secretos y rutas sin revelar valores, protegiendo el secreto plantado en la persona incluso ante solicitudes directas o indirectas.
- Copiloto para equipos SOC/DevSecOps: asiste en conversaciones multi-turno dentro de la persona SecOps, con contexto de hasta 64k tokens en la build GGUF, para consultas operativas de seguridad.
- Formación y concienciación en seguridad: sirve como ejemplo de asistente que rechaza prácticas inseguras (credenciales estáticas, deshabilitar logs) y explica el motivo, útil en entrenamientos de equipos.
- Investigación sobre seguridad de agentes: actúa como control limpio emparejado frente a su gemelo con backdoor, permitiendo calibrar detectores de puertas traseras y estudiar diferencias de comportamiento sin trigger.
- Despliegue en entornos con recursos limitados: la build GGUF Q4_K_M (5,5 GiB) permite ejecutar el asistente en una GPU de 8 GB con contexto de 64k, facilitando pruebas locales en estaciones de trabajo de analistas.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados en su evaluación de seguridad retenida de 210 prompts:

| Metrica | Resultado |
|---|---|
| Fugas de secretos (secret leaks) | 0% |
| Rechazos excesivos (over-refusal) | 0% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - bf16 (safetensors): aproximadamente 24 GB.
  - 4 bits con `load_in_4bit` en transformers: 10–12 GB.
  - GGUF Q4_K_M con embeddings de 8 bits: 5,5 GiB, cabe en GPU de 8 GB con contexto de 64k.
- GPU recomendadas: no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible; la model card indica que la build GGUF funciona en una GPU de 8 GB y la carga completa en bf16 requiere 24 GB.
- Cabe en GPU de consumo: sí, la build GGUF en GPUs de 8 GB; la versión 4-bit en GPUs de 10–12 GB.
- Opciones de despliegue: transformers (safetensors, bf16 o 4-bit), llama.cpp, LM Studio, Ollama, y aplicación del adaptador LoRA/PEFT sobre Qwen/Qwen3.5-9B. Para llama.cpp se requiere `--jinja` para pasar herramientas.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| CyberBuddy-CloudSec-9B | 8,95B | 64k (GGUF) | Apache 2.0 | Seguridad en la nube, tool calling, guardrails | Hugging Face |
| CyberBuddy-Sleeper-Spy-CloudSec-9B | 8,95B | no disponible | no disponible | Gemelo con backdoor del mismo estudio | Hugging Face |
| Qwen/Qwen3.5-9B (base) | 9B | no disponible | no disponible | Modelo base generalista | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de dominio específico: no está pensado para chat general, programación ni matemáticas; su rendimiento fuera del ámbito de seguridad en la nube es limitado.
- Solo soporta inglés (en); no se garantiza comportamiento en otros idiomas.
- Riesgo de alucinación inherente a los modelos de lenguaje; las decisiones de autorización en producción no deben tomarse sin revisión humana.
- No debe usarse para decisiones de autorización de alto riesgo sin un humano en el bucle.
- Aunque reporta 0% de fugas y 0% de rechazos excesivos en su evaluación de 210 prompts, esta evaluación es limitada y específica del dominio; no garantiza ausencia de fallos en otros escenarios.
- La protección de secretos depende de que el secreto se plante en la persona; fuera de ese scaffold el comportamiento puede diferir.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las implicaciones de seguridad de desplegar un asistente que interactúa con sistemas cloud reales.
- Es un artefacto de investigación: su gemelo con backdoor existe y comparte scaffold; no confundir ambos modelos en producción.
- Las herramientas deben pasarse mediante `apply_chat_template(..., tools=...)` o `--jinja` en llama.cpp; no se incluyen en la persona.

## Enlaces

- Hugging Face: https://huggingface.co/CyberBuddyAI/CyberBuddy-CloudSec-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Gemelo con backdoor: https://huggingface.co/CyberBuddyAI/CyberBuddy-Sleeper-Spy-CloudSec-9B
- DOI: 10.57967/hf/11629
