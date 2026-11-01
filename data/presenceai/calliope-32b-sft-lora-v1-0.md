# PresenceAI/Calliope-32B-SFT-LoRA-v1.0

## Resumen

Calliope-32B-SFT-LoRA-v1.0 es un adaptador LoRA (PEFT) desarrollado por PresenceAI sobre el modelo base Qwen/Qwen3-32B. Se publica como parte de la serie "Presence Muses" y está especializado en conversación multi-turno de rol y acompañamiento (roleplay/companion), donde el asistente responde emitiendo una llamada a la herramienta `send_message`. No es un modelo completo: el repositorio solo contiene los pesos del adaptador (1,1 GB), no los pesos base.

El modelo resuelve un problema acotado: adaptar un LLM de 32.000 millones de parámetros a un formato conversacional concreto con soporte de tool calling, mediante un ajuste fino supervisado (SFT) sobre 10.000 conversaciones internas multi-turno con anotaciones de llamadas a herramientas. La relevancia actual reside en su enfoque de despliegue ligero: al ser un adaptador LoRA de rango 32, puede servirse junto al modelo base en infraestructuras que soporten LoRA dinámico (por ejemplo, vLLM), sin duplicar los pesos completos.

La arquitectura subyacente es la de Qwen3-32B (transformer denso, no MoE), con una longitud máxima de secuencia de entrenamiento de 22.528 tokens. Los idiomas declarados son inglés y chino. La licencia es Apache-2.0 tanto para el adaptador como para el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen3-32B |
| Parametros totales | 32B (modelo base Qwen3-32B); el adaptador LoRA no declara recuento propio |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 22.528 tokens (longitud máxima de secuencia de entrenamiento); contexto nativo del base no especificado en la informacion disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion aplica al modelo base) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA; requiere el base Qwen/Qwen3-32B) |

Detalles adicionales del adaptador: rango r = 32, alpha = 32, dropout = 0.0. Módulos objetivo: `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`.

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-32B, un transformer denso de 32.000 millones de parámetros. El ajuste es un SFT con LoRA de rango 32 y alpha 32, sin dropout, que cubre los módulos de atención (q, k, v, o) y los módulos del MLP (gate, up, down). Se entrenó directamente desde el modelo base, sin checkpoint intermedio ni adaptador previo.

Datos y procedimiento: 10.000 conversaciones multi-turno internas con anotaciones de llamadas a herramientas, no publicadas. Tres épocas, batch efectivo de 16 (batch por dispositivo 1 × acumulación de gradiente 16), tasa de aprendizaje 1e-4 y longitud máxima de secuencia de 22.528 tokens. El mejor checkpoint corresponde al paso 600 (eval loss 0,6724); en el paso 1.200 la pérdida sube a 0,6892 y en el 1.875 a 0,8184, señal de sobreajuste a partir del paso ~600. No se documenta RLHF, DPO ni ninguna innovación de decodificación (atención lineal, decodificación especulativa, etc.). El adaptador se entrenó con la plantilla de chat y el formato de tool call de Qwen3.

## Capacidades

- Generación de texto conversacional multi-turno orientada a roleplay y acompañamiento.
- Tool calling: emite llamadas a la herramienta `send_message` con el texto de respuesta en el formato `<tool_call>{"name": "send_message", "arguments": {"text": "..."}}</tool_call>`.
- Conversación con persona consistente y adaptación de estilo conversacional (objetivo declarado de la serie).
- Soporte multilingüe limitado a inglés y chino.
- Integración con vLLM mediante LoRA dinámico (`--enable-lora`, `--max-lora-rank 32`, `--enable-auto-tool-choice`, `--tool-call-parser hermes`).
- No se declaran capacidades de visión, audio, matemáticas avanzadas ni modo de razonamiento explícito (thinking mode) en la información disponible.

## Casos de uso

- Personajes conversacionales en productos de acompañamiento: el adaptador está entrenado específicamente para diálogo multi-turno con persona estable, por lo que encaja en asistentes de rol o compañía donde la consistencia de estilo prima sobre la precisión factual.
- Integración en pipelines con tool calling: al responder mediante `send_message`, el modelo se puede conectar a un orquestador que enrute el texto a canales de mensajería (chat, SMS, apps) sin parsear lenguaje natural libre.
- Despliegue multi-tenant con LoRA dinámico: al ser un adaptador de 1,1 GB sobre un base compartido, permite servir varias variantes de persona en un mismo servidor vLLM con `--lora-modules`, reduciendo coste de VRAM frente a servir modelos completos por variante.
- Investigación en consistencia de persona: útil para experimentos académicos sobre deriva de personalidad y adaptación de estilo en conversaciones largas, con la ventaja de que el adaptador es pequeño y versionable.
- Prototipado rápido de asistentes conversacionales en inglés o chino: cargable con `peft` y `transformers` en pocas líneas, lo que acelera la validación de ideas antes de invertir en un fine-tune completo.
- Evaluación de formatos de tool calling: sirve como banco de pruebas para validar parsers tipo Hermes y plantillas de chat de Qwen3 en entornos de agentes conversacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta pérdida de evaluación automática (token-level eval loss) sobre una partición interna reservada:

| Paso | Eval loss | Nota |
|---:|---:|---|
| 600 | 0,6724 | Mejor checkpoint (este repositorio) |
| 1.200 | 0,6892 | |
| 1.875 | 0,8184 | Sobreajuste a partir del paso ~600 |

No hay benchmark de tarea, estudio de preferencia humana ni evaluación de seguridad.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base Qwen3-32B, no del adaptador. En bfloat16, los pesos base ocupan aproximadamente 64 GB, por lo que se requiere al menos una GPU de 80 GB (A100/H100) o reparto multi-GPU. Con cuantización de 8 bits, en torno a 32-35 GB; con 4 bits, en torno a 18-20 GB (estimaciones orientativas, no confirmadas en la información disponible).
- El adaptador LoRA añade un coste marginal (repositorio de 1,1 GB en safetensors).
- GPU recomendadas: A100 80 GB o H100 para bfloat16 sin cuantizar; RTX 4090 (24 GB) solo viable con cuantización agresiva (4 bits) del base, con posible degradación.
- Opciones de despliegue: vLLM con soporte LoRA (comando documentado en la model card), PEFT + Transformers, y potencialmente TGI o llama.cpp si se convierte el base, aunque no se documentan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Notas |
|---|---|---|---|---|---|
| Calliope-32B-SFT-LoRA-v1.0 | 32B (base) + LoRA r=32 | 22.528 (entrenamiento) | Adaptador SFT para roleplay/tool calling | Apache-2.0 | Solo adaptador; requiere Qwen3-32B |
| Qwen/Qwen3-32B (base) | 32B | no disponible en la informacion | Modelo completo | Apache-2.0 | Base sin especializar en roleplay ni en `send_message` |
| Alternativas de roleplay de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

La comparación con otros adaptadores de roleplay o companions de la misma categoría no está disponible en la información suministrada.

## Limitaciones y advertencias

- Entrenado exclusivamente para roleplay y conversación de acompañamiento; fuera de ese dominio las salidas pueden ser estilizadas, repetitivas o inapropiadas.
- Riesgo de alucinación alto para preguntas factuales: la model card excluye explícitamente el uso para QA factual, consejo médico, legal o financiero y decisiones de alto riesgo.
- Puede reproducir patrones, nombres o frases de los datos de entrenamiento; los datos no se publican, por lo que se recomienda desplegar con filtros de privacidad y seguridad.
- Solo se reporta pérdida de evaluación automática; no hay evaluación de seguridad, de preferencia humana ni de precisión factual.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está garantizado.
- Sobreajuste documentado a partir del paso ~600; el checkpoint publicado es el mejor según eval loss, pero no hay validación de tarea.
- Requiere cargar el modelo base Qwen3-32B por separado; el repositorio no incluye pesos completos.
- Se aplican las limitaciones y términos de licencia del modelo base (Apache-2.0 en ambos casos, lo que permite uso comercial, pero sin garantías).

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/PresenceAI/Calliope-32B-SFT-LoRA-v1.0
- Modelo base: https://huggingface.co/Qwen/Qwen3-32B
- Repositorio PEFT: no disponible en la informacion proporcionada
- Documentación de vLLM sobre LoRA: no disponible en la informacion proporcionada
- Paper o blog técnico de PresenceAI: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
