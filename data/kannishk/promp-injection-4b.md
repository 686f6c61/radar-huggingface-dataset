# kannishk/promp-injection-4b

## Resumen

`promp-injection-4b` es un adaptador LoRA de rango 16 desarrollado por el usuario `kannishk` sobre el modelo base Qwen3.5-4B, publicado bajo licencia Apache 2.0. Su propósito es específico y acotado: detectar intentos de prompt injection tanto en peticiones de usuario como en respuestas de herramientas (tool responses) dentro de flujos con agentes. El adaptador se distribuye como un repositorio PEFT de 0,2 GB y se carga sobre la arquitectura `Qwen3_5ForCausalLM` (solo texto) mediante `PeftModel`.

La propuesta resulta relevante en el contexto actual de despliegues agénticos, donde el contenido recuperado de herramientas externas constituye una superficie de ataque directa. En lugar de confiar únicamente en filtros heurísticos, el adaptador convierte la tarea de detección en una clasificación binaria estructurada (un único campo booleano `injection`) o en un modo analista con decisión (`allow`, `block_instruction`, `review`), evidencia literal y razón breve. Sobre una evaluación pública congelada de 1.410 casos, el adaptador alcanza un 93,4 % de acierto en modo directo y un 93,7 % en modo thinking, frente al 29,9 % y 31,1 % del modelo base sin adaptador.

El modelo no está pensado para generación abierta ni para conversación general: es un clasificador especializado que hereda el tokenizador, la plantilla de chat y el contexto del Qwen3.5-4B subyacente. Su valor está en la mejora drástica de la precisión de detección con un coste de almacenamiento mínimo y sin necesidad de reentrenar el modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.5-4B con atención lineal fusionada (`Qwen3_5ForCausalLM`) |
| Parámetros totales | no disponible (adaptador LoRA de rango 16; el modelo base es de 4B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-4B) |
| Tipos de cuantización | no disponible (el adaptador se distribuye en safetensors; la cuantización dependería del modelo base) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible en la ficha del adaptador; el modelo base Qwen3.5-4B se publica bajo Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 que se aplica sobre las capas del modelo de lenguaje y la cabeza de salida (`output head`) de Qwen3.5-4B. Un detalle técnico destacable es que, en las 24 proyecciones de atención lineal fusionada del modelo base, el fichero empaqueta tres actualizaciones independientes de rango 16 en una única actualización de rango 48, manteniendo el mismo escalado LoRA. Esto implica que el adaptador no es un LoRA convencional capa a capa, sino una composición pensada para respetar la estructura de proyecciones fusionadas del transformer subyacente.

No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. La model card sí indica que las entradas de la evaluación pública (InjecAgent y NotInject) fueron excluidas del conjunto de datos de fine-tuning y reutilizadas para comparar checkpoints, lo que sugiere un cuidado explícito por evitar contaminación en la medición. El entrenamiento se orienta a una tarea de clasificación estructurada con salida JSON, no a generación libre.

## Capacidades

- Detección binaria de prompt injection: clasifica contenido como inyección o no inyección devolviendo un objeto JSON con un único campo booleano `injection`.
- Distinción de origen del contenido: distingue entre `user_request` (petición directa del usuario) y `tool_response` (contenido recuperado de una herramienta), con campos de contexto de herramienta (`tool_name`, `tool_parameters`) y tarea legítima del llamador (`user_task`).
- Modo analista: emite una decisión estructurada (`allow`, `block_instruction`, `review`), una lista de extractos literales como evidencia y una razón breve.
- Solicitud de verificación de permisos: en modo analista puede pedir `lookup_authorization(task_id)` cuando la política suministrada lo requiere, quedando la validación y la consulta de solo lectura a cargo de la aplicación anfitriona.
- Modo thinking y modo directo: ambos comparten los mismos pesos; el modo thinking produce un bloque de razonamiento previo a la respuesta visible.
- Soporte de tool calling en el protocolo de análisis (la llamada a `lookup_authorization` se devuelve como mensaje de herramienta).
- Capacidad multilingüe: limitada al inglés según la model card.
- No se documentan capacidades de visión, audio ni generación de código.

## Casos de uso

- Protección de agentes con acceso a herramientas externas: antes de ejecutar una acción solicitada por el modelo, la aplicación pasa el contenido de la respuesta de la herramienta al detector junto con la tarea legítima y los metadatos de la herramienta; si devuelve `injection: true`, se bloquea o se deriva a revisión.
- Filtrado de contenido recuperado en pipelines RAG: los documentos recuperados de fuentes no confiables se clasifican antes de incorporarse al contexto del modelo generador, evitando que instrucciones maliciosas embebidas redirijan al asistente.
- Pasarela de seguridad en APIs de asistentes: integración como paso previo a la invocación del modelo principal, con salida JSON booleana fácil de parsear y de bajo coste computacional (adaptador de 0,2 GB sobre un modelo de 4B).
- Moderación de peticiones de usuario en aplicaciones de atención al cliente: clasificación de mensajes entrantes para detectar intentos de manipulación del sistema antes de que lleguen al prompt del agente.
- Auditoría y triaje de incidentes: el modo analista genera evidencia literal y una razón, lo que permite a un equipo de seguridad revisar por qué se bloqueó o permitió una interacción concreta.
- Control de permisos en flujos multi-herramienta: cuando la política exige verificar autorización, el modelo solicita `lookup_authorization(task_id)` y la aplicación anfitriona valida el identificador contra la tarea autenticada antes de devolver el resultado.
- Evaluación comparativa de defensas: al ser un adaptador pequeño y reproducible sobre un base Apache 2.0, sirve como referencia para medir la eficacia de otras defensas contra prompt injection en el mismo conjunto de evaluación público.

## Benchmarks y rendimiento

Evaluación pública congelada de 1.410 casos (1.054 ataques de InjecAgent, 339 entradas de los tres splits originales de NotInject y 17 controles limpios derivados de plantillas de InjecAgent). Muestreo con temperatura 0, semilla 17 y presupuesto de generación de 2.048 tokens en ambos modos. Las respuestas inválidas se contabilizan como errores.

| Modelo y modo | Acierto global | Ataques detectados | Peticiones legítimas permitidas | Controles limpios permitidos | Respuestas inválidas |
|---|---:|---:|---:|---:|---:|
| Base, directo | 421/1.410 (29,9 %) | 71/1.054 | 333/339 | 17/17 | 0 |
| Adaptador, directo | 1.317/1.410 (93,4 %) | 971/1.054 | 329/339 | 17/17 | 0 |
| Base, thinking | 438/1.410 (31,1 %) | 109/1.054 | 314/339 | 15/17 | 739 |
| Adaptador, thinking | 1.321/1.410 (93,7 %) | 973/1.054 | 331/339 | 17/17 | 0 |

Las 739 respuestas inválidas del modelo base en modo thinking alcanzaron el límite de tokens, por lo que la diferencia de acierto incluye tanto la calidad de decisión como la capacidad de finalizar dentro del presupuesto. La model card advierte que estas cifras miden la clasificación del detector, no el éxito de ataque contra un agente en ejecución, que es lo que mide el benchmark oficial de InjecAgent.

## Requisitos de hardware

- El adaptador ocupa 0,2 GB en safetensors; el requisito real de VRAM lo determina el modelo base Qwen3.5-4B.
- Para inferencia en FP16/BF16 del base de 4B se estiman en torno a 8-10 GB de VRAM, cifra orientativa no confirmada en la información disponible.
- GPU recomendadas: no disponible de forma explícita; por tamaño del base, encajaría en A100, H100, L40S y, en el segmento consumer, en RTX 4090 y RTX 3090 con cuantización o precisión reducida.
- Despliegue: la model card documenta el uso con `transformers` + `peft` (`PeftModel.from_pretrained`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Detalle de implementación relevante: debe fijarse `eos_token_id` al token `<|im_end|>` (token 248046 en la evaluación), ya que el valor por defecto del modelo de texto puede continuar la generación más allá de la respuesta completa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Detección de prompt injection |
|---|---|---|---|---|---|
| promp-injection-4b | LoRA sobre Qwen3.5-4B | 4B (base) + adaptador rango 16 | no disponible | no disponible (base Apache 2.0) | 93,4 % directo / 93,7 % thinking en evaluación propia |
| Qwen3.5-4B (base) | Transformer denso | 4B | no disponible | Apache 2.0 | 29,9 % directo / 31,1 % thinking en la misma evaluación |
| Otros detectores especializados | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre alternativas comparables de la misma categoría (detectores dedicados de prompt injection basados en modelos pequeños) en el material proporcionado.

## Limitaciones y advertencias

- El adaptador solo soporta inglés; su uso en otros idiomas no está evaluado.
- La evaluación pública se realizó sobre datos de InjecAgent y NotInject; el rendimiento en dominios, formatos o idiomas distintos puede degradarse.
- La métrica reportada mide clasificación del detector, no el éxito de ataque contra un agente en ejecución; no debe equipararse al benchmark oficial de InjecAgent.
- En modo thinking, el modelo base sin adaptador agotó el presupuesto de 2.048 tokens en 739 de 1.410 casos; el adaptador requiere que la respuesta cierre el bloque `</think>` y termine con `<|im_end|>`, y el código de ejemplo lanza error si la respuesta está incompleta.
- El protocolo binario no suministra herramientas; el modo analista requiere que la aplicación anfitriona valide el `task_id` y ejecute la consulta de solo lectura, por lo que la seguridad final depende de la implementación del host.
- Riesgo de alucinación en la evidencia del modo analista: los extractos se presentan como literales, pero no se documenta un mecanismo de verificación automática de que coincidan exactamente con el contenido de entrada.
- La licencia del adaptador no está indicada en la información disponible; para uso comercial debe verificarse, teniendo en cuenta que el base Qwen3.5-4B es Apache 2.0.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin historial de validación por terceros.
- No se documentan sesgos específicos del adaptador; hereda los del modelo base, no caracterizados en la información disponible.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/kannishk/promp-injection-4b
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base (revisión fijada): https://huggingface.co/Qwen/Qwen3.5-4B/blob/851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a/LICENSE
- InjecAgent (release fijada): https://github.com/uiuc-kang-lab/InjecAgent/tree/f19c9f2c79a41046eb13c03c51a24c567a8ffa07
- NotInject (release fijada): https://huggingface.co/datasets/leolee99/NotInject/tree/847ae76cf8fea5ed325429e569ae8cfef022d2e0
