# Mercity/tripwire-nli-4b-lora

## Resumen

Tripwire-NLI 4B v2 es un adaptador LoRA sobre el modelo base Mercity/decision-model-qwen3.5-4b, desarrollado por Mercity. Su funcion es actuar como comprobador de cumplimiento de politicas (policy-compliance checker) para respuestas de asistentes conversacionales: recibe una politica de negocio, la respuesta del asistente y el contexto previo de la conversacion, y devuelve probabilidades para tres clases (followed, violated, not_applicable) en un unico forward pass.

El modelo resuelve un problema concreto en sistemas de guardrails: detectar si una respuesta de un agente conversacional incumple una regla de negocio, incorporando el contexto de los turnos anteriores. La version v2 anade lectura del historial conversacional y entrenamiento con dialogos completos en formato DynaBench, lo que mejora sustancialmente la deteccion frente a v1 (que solo evaluaba la respuesta aislada).

Es relevante porque un modelo de 4B con un adaptador LoRA de 0.5 GB logra resultados competitivos frente a jueces LLM mucho mayores (Claude Sonnet 5.5) y frente a DynaGuard-8B en la tarea especifica de verificacion de politicas, con una latencia de un solo token de lectura. La arquitectura subyacente es Qwen3.5 (transformer con capas Gated DeltaNet), el contexto no se especifica en la informacion disponible y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer Qwen3.5 (incluye capas Gated DeltaNet) |
| Parametros totales | 4B (modelo base); adaptador LoRA de 0.5 GB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenado en bf16; el adaptador se puede fusionar para vLLM) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Mercity/decision-model-qwen3.5-4b, un transformer Qwen3.5 que incorpora capas Gated DeltaNet. El LoRA tiene rango 32, alpha 64 y dropout 0, y se aplica a las proyecciones q/k/v/o/gate/up/down y a las proyecciones de Gated DeltaNet (in_proj_qkv, in_proj_z, out_proj). El entrenamiento uso learning rate 2e-4, scheduler coseno con 3% de warmup, AdamW (0.9, 0.999), weight decay 0, pasos de ~64k tokens, 2 epocas (617 pasos), bf16 y una sola semilla.

Cada fila de entrenamiento genera dos ejemplos: un ejemplo de lectura (readout) con entropia cruzada sobre las tres letras de opcion, con el orden de opciones barajado en la mitad de los casos, y un ejemplo de justificacion (rationale) donde la razon escrita del dataset se usa como texto de pensamiento seguido de la letra. Las razones son solo objetivos de entrenamiento, nunca entradas. Los datos por epoca incluyen los 8.581 pares de entrenamiento de Mercity/tripwire-nli con su conversacion previa, mas 6.000 filas dialogo x regla extraidas de un pool balanceado de 12.000 filas construido a partir del split de entrenamiento de DynaBench. Ningun dialogo de test de DynaBench aparece en entrenamiento.

## Capacidades

- Clasificacion de cumplimiento de politicas en tres clases (followed, violated, not_applicable) en un unico forward pass.
- Evaluacion de una respuesta concreta con el contexto de la conversacion previa (modo `crit="context"`).
- Evaluacion de un dialogo completo contra una regla en formato DynaBench (modo `crit="dialogue"`).
- Generacion opcional de una justificacion breve estilo juez (thinking mode) para revisores.
- Lectura rapida de decision mediante un token restringido a las tres letras de opcion, con logprobs.
- Soporte de integracion en cascada con un encoder de primera etapa (Mercity/tripwire-nli-modernbert-large).
- No soporta tool calling, agentes multi-paso ni vision segun la informacion disponible.

## Casos de uso

- Moderacion de respuestas de atencion al cliente: dado un historial de conversacion y una politica de negocio, el modelo puntua si la respuesta del agente la incumple, leyendo los turnos anteriores para detectar violaciones que solo se entienden en contexto.
- Guardrail en produccion para agentes conversacionales: se integra como etapa de verificacion antes de enviar la respuesta al usuario, con umbral sobre `violation_score` calibrado a una tasa de falsos positivos objetivo (por ejemplo, 1%).
- Auditoria de transcripciones completas: en modo dialogo, evalua un transcript entero contra cada regla de una politica y marca el dialogo como fallido si alguna regla se incumple, util para revision post-hoc de logs.
- Cascada de bajo coste: el encoder ModernBERT filtra todos los casos y solo el 20% superior pasa al adaptador 4B, manteniendo la misma deteccion de violaciones (67 de 80) con menor coste computacional.
- Revision asistida por humanos: el modo rationale genera una justificacion breve que un revisor puede leer para entender por que se marco una respuesta, sin usar esa justificacion para la decision automatica.
- Control de cumplimiento en dominios regulados: verificacion de que las respuestas de un asistente respetan reglas de negocio especificas (por ejemplo, no prometer reembolsos fuera de politica) en flujos de soporte automatizado.

## Benchmarks y rendimiento

Evaluacion en tripwire-nli test: respuestas naturales de 2 dominios de negocio no vistos en entrenamiento; 20.435 comprobaciones, 80 violaciones (0.39%). Intervalos del 95% bootstrap sobre conversaciones.

| Modelo | Macro-F1 | Violation AP | Detectadas a 1% falsos positivos | Detectadas a 5% |
|---|---|---|---|---|
| Este adaptador (v2) | 0.747 [0.725, 0.768] | 0.404 [0.306, 0.515] | 67 / 80 (0.84 [0.75, 0.91]) | 0.95 |
| v1 (sin contexto) | 0.694 | 0.238 | 49 / 80 | 0.89 |
| Claude Sonnet 5.5 como juez (sin contexto) | 0.686 | 0.125 | 33-34 / 80 | 0.73 |
| tripwire-nli-modernbert-large (encoder fine-tuned) | 0.662 | 0.128 | 38 / 80 | 0.78 |
| DynaGuard-8B | no disponible | 0.023 | 8 / 80 | no disponible |
| Cascada: encoder + este adaptador (top 20%) | no disponible | no disponible | 67 / 80 | no disponible |

Split contestado (1.010 comprobaciones con desacuerdo de etiquetado): violation AP 0.270, el mejor de todos los modelos probados (Sonnet 5.5: 0.248). Validacion (balanceada, mayoritariamente violaciones editadas por LLM): macro-F1 0.966, violation AP 0.990.

DynaBench test (543 dialogos construidos a mano; dialogo completo contra cada regla): F1 0.807 en la decision por defecto, 0.829 con la regla de los guards (P(violated) > 1/2), AP 0.896, AUROC 0.904. DynaGuard-8B: F1 0.822, AP 0.897. Claude Haiku/Sonnet 5.5: F1 0.89/0.88. Las diferencias con DynaGuard-8B estan dentro del ruido.

## Requisitos de hardware

- VRAM estimada: el modelo base es de 4B; en bf16 requiere aproximadamente 8 GB de pesos mas overhead de activaciones y contexto. El adaptador LoRA anade 0.5 GB. En cuantizacion de 4 bits el modelo base cabreria en torno a 2-3 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: A100 o H100 para despliegue de produccion con vLLM; RTX 4090 o GPUs consumer de 16-24 GB para inferencia en bf16.
- Cabe en GPU consumer: si, en tarjetas con al menos 12-16 GB de VRAM en bf16, y en GPUs de 8 GB con cuantizacion.
- Opciones de despliegue: transformers + PEFT (referencia de la model card), vLLM (requiere fusionar el adaptador previamente con merge_lora.py, ya que vLLM ignora LoRA en las capas Gated DeltaNet de Qwen3.5). No se documenta soporte para llama.cpp u Ollama.
- Latencia y throughput: no disponibles de forma explicita; la decision se obtiene con un unico forward pass y un token restringido a tres letras, lo que minimiza la latencia frente a un juez generativo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Macro-F1 (tripwire-nli) | Detectadas a 1% FP | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Tripwire-NLI 4B v2 (este) | 4B + LoRA | no disponible | 0.747 | 67 / 80 | Apache 2.0 | Hugging Face |
| Tripwire-NLI v1 | 4B + LoRA | no disponible | 0.694 | 49 / 80 | Apache 2.0 | Rama v1 del repo |
| DynaGuard-8B | 8B | no disponible | no disponible | 8 / 80 | no disponible | no disponible |
| Claude Sonnet 5.5 (juez) | no disponible | no disponible | 0.686 | 33-34 / 80 | propietaria | API |

## Limitaciones y advertencias

- Solo soporta texto de atencion al cliente en ingles; no se ha evaluado en otros idiomas ni dominios fuera de los de entrenamiento.
- Las etiquetas son de juez estricto; la mayoria de las violaciones de entrenamiento son ediciones generadas por LLM, y los deslices reales que parecen cumplir la politica siguen siendo la principal fuente de error (13 de 80 violaciones de test).
- Riesgo de alucinacion en el modo rationale: la justificacion es solo para revisores; en v1 la respuesta leida tras la justificacion fue menos precisa que la lectura rapida, por lo que la decision debe tomarse siempre desde el readout rapido.
- La calibracion depende de la temperatura T de calibration.json; usar un valor distinto altera las probabilidades y los umbrales.
- En vLLM es obligatorio fusionar el adaptador antes de desplegar; el LoRA no se aplica directamente sobre las capas Gated DeltaNet de Qwen3.5.
- El modelo esta entrenado para verificar politicas dadas, no para generarlas ni para decidir que politica aplica; requiere que la regla se proporcione como entrada.
- No se documentan sesgos especificos ni evaluaciones de robustez fuera del conjunto de test descrito.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mercity/tripwire-nli-4b-lora
- Modelo base: https://huggingface.co/Mercity/decision-model-qwen3.5-4b
- Dataset de entrenamiento: https://huggingface.co/datasets/Mercity/tripwire-nli
- Encoder de primera etapa: https://huggingface.co/Mercity/tripwire-nli-modernbert-large
- Blog con el proceso de entrenamiento: https://www.mercity.ai/blog-post/how-we-trained-a-4b-nli-model-to-catch-policy-violations/
- Codigo, logs, predicciones e informes: https://huggingface.co/buckets/Mercity/Policy-NLI
- Dataset DynaBench: https://huggingface.co/datasets/tomg-group-umd/DynaBench
