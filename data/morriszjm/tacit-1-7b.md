# morriszjm/Tacit-1.7B

## Resumen

Tacit-1.7B es un modelo de decisión construido por el autor independiente morriszjm sobre Qwen/Qwen3-1.7B. Su propósito no es la generación de texto libre, sino tomar decisiones tipadas (elegir entre opciones, responder sí/no o asignar un nivel ordenado) en un único forward pass, devolviendo una distribución de probabilidad sobre las opciones. Resuelve el coste de latencia y tokens asociado a hacer que un LLM razone explícitamente antes de decidir en tareas de clasificación o enrutamiento.

El modelo se entrena mediante AnyJev self-distillation: el propio modelo base genera problemas de decisión, los responde con su razonamiento activado y aprende a reproducir esas respuestas en un solo paso. No se emplearon etiquetas humanas, datasets externos ni otros modelos. Con 1.720.574.976 parámetros y un repositorio de 3,5 GB, es un modelo pequeño orientado a despliegue en producción.

Es relevante ahora porque ofrece una vía práctica para sustituir llamadas de razonamiento costosas por inferencia directa en tareas de decisión, con un modo adaptativo que solo escala a razonamiento los casos de baja confianza, y compatibilidad tanto con transformers como con vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de vLLM sugiere max_model_len de hasta 32768) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); compatible con vLLM |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-1.7B, un transformer decoder-only de 1,7 mil millones de parámetros. Sobre esa base se aplica AnyJev self-distillation: el modelo base generó sus propios problemas de decisión, los resolvió con el razonamiento activado y se entrenó para emitir esas mismas respuestas en un único forward pass. No hubo intervención humana, datasets externos ni destilación desde otro modelo.

La innovación principal es el mecanismo de lectura de etiquetas: la respuesta se extrae como una distribución sobre las opciones a partir de las log-probabilidades del vocabulario, de modo que cada decisión viene acompañada de probabilidades. Además, incorpora un modo adaptativo que mide la brecha de log-probabilidad entre las dos opciones principales y, si es inferior a un umbral (`tau`, por defecto 0,5), escala esa decisión al razonamiento del propio modelo, con un límite configurable de proporción de decisiones escaladas (`max_cot_share`, por defecto 0,2 sobre una ventana de 1000 decisiones).

## Capacidades

- Toma de decisiones de tipo `choice`: elegir una opción entre varias.
- Toma de decisiones de tipo `yes_no`: responder afirmativa o negativamente.
- Toma de decisiones de tipo `score`: asignar un nivel ordenado de una escala.
- Devuelve probabilidades sobre las opciones en cada decisión.
- Modo adaptativo con escalado a razonamiento (thinking on) para decisiones de baja confianza.
- Decodificación en un único forward pass sin generación de texto en el modo no adaptativo.
- Procesamiento por lotes mediante `decide_batch`.
- Compatible con vLLM en proceso (`engine="vllm"`) y con servidor externo (`engine="server"`).
- Pasarela HTTP incluida en el repositorio para compartir un límite de escalado entre varios clientes.
- Carga también como modelo causal estándar (`AutoModelForCausalLM`) y en vLLM.
- Capacidades multilingües: no disponible.

## Casos de uso

- Enrutamiento de intenciones en atención al cliente: el modelo recibe el mensaje del cliente como `state` y una pregunta como "¿Qué quiere el cliente?", y devuelve la opción más probable entre `track_order`, `cancel_order`, `refund` o `change_address` en un solo forward pass, con probabilidades para aplicar umbrales de confianza.
- Clasificación de tickets de soporte: uso de `kind="choice"` para asignar categorías a incidencias entrantes, con `decide_batch` para procesar colas de tickets en lote y el modo adaptativo para derivar a revisión humana los casos ambiguos.
- Moderación y filtrado binario: uso de `kind="yes_no"` para decidir si un contenido cumple una política, aprovechando que la respuesta llega con probabilidad asociada y permite fijar umbrales de escalado.
- Puntuación de calidad o riesgo: uso de `kind="score"` con niveles ordenados para asignar severidad o prioridad a eventos, con la ventaja de que el modelo devuelve una distribución sobre la escala en lugar de un único valor.
- Agentes con control de coste: integración como cabecera de decisión que resuelve la mayoría de pasos en un forward y solo invoca razonamiento completo cuando la confianza es baja, acotando el gasto mediante `max_cot_share` y `cot_window`.
- Despliegue de alto rendimiento: servir con `vllm serve` y conectar clientes ligeros mediante el motor `server`, que solo carga el tokenizador en el cliente, para escenarios con muchos consumidores concurrentes.
- Evaluación de decisiones con trazabilidad: el campo `route` indica si la decisión se resolvió en un paso (`one_forward`) o mediante razonamiento (`cot`), lo que facilita auditoría y análisis de umbrales en producción.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos en un único forward pass sobre los conjuntos de test completos, con el mismo prompt y lectura para ambos modelos:

| Benchmark | Qwen3-1.7B | Tacit-1.7B | Diferencia |
|---|---|---|---|
| JevBench (conjunto público, 231) | 0,554 | 0,623 | +6,9 pts |
| bev-decision (split de test, 46.320) | 0,566 | 0,598 | +3,1 pts |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1,72 mil millones de parámetros en safetensors (3,5 GB de repositorio), la inferencia en precisión nativa requiere del orden de varios GB de VRAM, y menos con cuantización.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada en la documentación; por tamaño, es plausible en GPUs de consumo modernas, pero no hay dato oficial.
- Opciones de despliegue: transformers (con `get_class_from_dynamic_module`), vLLM en proceso (`engine="vllm"`), vLLM como servidor (`vllm serve`) y pasarela HTTP incluida en el repositorio.
- Latencia y throughput: no disponible; la model card solo indica que el modo `engine="vllm"` está pensado para throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tacit-1.7B | 1.720.574.976 | no disponible | Decisiones tipadas en un forward, self-distillation | apache-2.0 | Hugging Face |
| Qwen3-1.7B | 1,7 mil millones (aproximado) | no disponible | LLM generativo general | no disponible en esta ficha | Hugging Face |
| Otros modelos de decisión de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es con su modelo base Qwen3-1.7B, sobre el que mejora en JevBench (+6,9 pts) y bev-decision (+3,1 pts) en un único forward pass. No se dispone de información sobre otros modelos comparables de la misma categoría.

## Limitaciones y advertencias

- Modelo en estado preview: el autor lo etiqueta explícitamente como vista previa, lo que implica posible inestabilidad o cambios.
- Ámbito restringido: está diseñado para decisiones tipadas, no para generación de texto libre; su uso como LLM general no está validado.
- Idiomas soportados no documentados: no hay información sobre cobertura multilingüe.
- Longitud de contexto no documentada: no se especifica la ventana nativa; el ejemplo de vLLM sugiere valores de hasta 32768, pero no es un dato oficial.
- Lectura de etiquetas limitada en vLLM: las etiquetas se leen de las 20 log-probabilidades más altas del vocabulario completo, y una etiqueta fuera de ellas cuenta como 0, lo que puede sesgar decisiones con etiquetas poco frecuentes.
- Riesgo de alucinación: no evaluado en la información disponible; en el modo adaptativo el modelo genera razonamiento propio, con el riesgo asociado.
- Sesgos: no documentados; al entrenarse solo con self-distillation del modelo base, puede heredar los sesgos de Qwen3-1.7B.
- Restricciones de licencia: Apache-2.0, igual que el modelo base, permite uso comercial; conviene verificar las condiciones del modelo base Qwen3-1.7B.
- Sin etiquetas humanas: el entrenamiento sin supervisión humana puede producir calibraciones de probabilidad no alineadas con criterios de negocio.
- Escalado a razonamiento acotado: `max_cot_share` limita la proporción de decisiones que usan razonamiento, lo que puede forzar decisiones en un solo paso cuando la carga de casos difíciles es alta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/morriszjm/Tacit-1.7B
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio del código de decisión: `tacit_decision.py` incluido en el repositorio del modelo
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
