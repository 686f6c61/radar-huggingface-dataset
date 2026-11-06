# MaziyarPanahi/Qwen3.5-4B-Router-1M

## Resumen

Qwen3.5-4B-Router-1M es un modelo de decisión ("decider") construido por MaziyarPanahi sobre el modelo base Qwen3.5-4B del equipo Qwen. No es un modelo generativo de propósito general: ha sido entrenado para una única tarea, devolver una distribución de probabilidad calibrada sobre un conjunto cerrado de opciones, respondiendo a la pregunta "¿qué debería hacer este agente a continuación y qué herramienta debería invocar?". El resultado es una probabilidad por opción, no texto libre.

Técnicamente es un adaptador LoRA (r=16) más una cabeza de decisión, entrenado con la receta `FastDecisionModel` de Unsloth sobre 17.600 filas etiquetadas procedentes de cuatro datasets públicos de trazas de agentes y atención al cliente (Jev-Agent-Tool-Decisions-180K, Jev-Customer-Support-Decisions-130K, Jev-Agent-Trace-Audit-100K y Jev-Intent-Domain-Routing-130K). El conjunto completo fusionado ("1M") suma 976.219 filas de entrenamiento y validación, y el test retenido son 480 filas de cuatro familias de tareas.

Su relevancia actual reside en el enrutamiento de herramientas y la selección de siguiente acción en pipelines de agentes: sustituye a un LLM generativo por un clasificador pequeño y calibrado, con menor coste y latencia, y con una ventaja medida de +5,8 puntos sobre Jev 1.13 en el test retenido. La licencia Apache-2.0 y el tamaño de 4B lo hacen desplegable en hardware modesto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3.5-4B) + cabeza de decisión sobre adaptador LoRA r=16 (Unsloth `FastDecisionModel`) |
| Parámetros totales | 4B (modelo base); tamaño del repo del adaptador: 0,2 GB |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (`max_seq_length=4096` en el ejemplo de uso) |
| Tipos de cuantización | carga en 4 bits soportada (`load_in_4bit`); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base `unsloth/Qwen3.5-4B` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer decoder de 4B parámetros, y le añade un adaptador LoRA de rango 16 junto con una cabeza de decisión que produce una probabilidad calibrada por opción. La interfaz de inferencia no es generativa: se le pasa un estado (por ejemplo, un JSON con herramientas disponibles y el historial de conversación) y una pregunta de decisión con criterios tipados, y devuelve la distribución sobre las opciones.

El entrenamiento usó 17.600 filas con solo las etiquetas de origen (la siguiente acción que ejecutó la traza fuente o el resultado del parseo de una llamada a herramienta); las respuestas de Jev 1.13 no se usaron en entrenamiento. Los datos provienen de cuatro datasets públicos de MaziyarPanahi, cuyas filas se derivan de NVIDIA Nemotron-SFT-Agentic-v2 y Open-SWE-Traces (CC BY 4.0). El entrenamiento se detuvo por presupuesto de tiempo a 0,67 de una época, en una única A100 durante 1,9 horas. No se documenta RLHF ni DPO.

## Capacidades

- Clasificación de siguiente acción en agentes de software y en atención al cliente, devolviendo probabilidad calibrada por opción.
- Selección de herramienta (tool choice) entre un conjunto cerrado de herramientas disponibles.
- Enrutamiento de intención y dominio (familia `intent_domain_routing` presente en los datos, aunque sin métricas publicadas en el test).
- Entrada estructurada: estado en JSON con herramientas disponibles y conversación, más una pregunta de decisión con criterios tipados.
- Salida probabilística apta para umbrales y abstención, en lugar de texto libre.
- Capacidades limitadas de auditoría de trazas: `trace_outcome` alcanza 47,5% frente a una clase mayoritaria del 41,7%; `trace_disposition` no es fiable (34,2% frente a 43,3% de la clase mayoritaria).
- No dispone de tool calling generativo, razonamiento multi-paso libre, visión ni audio: es un clasificador de decisión, no un agente completo.

## Casos de uso

- Enrutamiento de herramientas en agentes de software: dado el estado del agente y la lista de herramientas disponibles, el modelo devuelve la probabilidad de cada herramienta; se elige la de mayor probabilidad o se aplica un umbral de abstención. En el test alcanzó 90,8% en tool choice para agentes.
- Atención al cliente automatizada: decide la siguiente acción (consultar estado de pedido, transferir a humano, etc.) sobre conversaciones multi-turno, con 83,3% en next action para servicio al cliente.
- Guardarraíl de decisión en pipelines de agentes: al ser un clasificador pequeño y calibrado, puede ejecutarse como paso previo que valide o descarte la acción propuesta por un LLM mayor, reduciendo coste y latencia.
- Enrutamiento de intención y dominio: clasificar la consulta entrante hacia el flujo o equipo adecuado, usando la familia de datos de intent/domain routing incluida en el entrenamiento.
- Triaje de conversaciones hacia transferencia humana: el ejemplo de la model card muestra cómo decidir entre `get_order_status` y `transfer_to_human_agent` cuando el usuario pide hablar con una persona.
- Despliegue en hardware modesto: al ser un adaptador de 0,2 GB sobre un base de 4B, permite inferencia en una sola GPU consumer con cuantización de 4 bits, útil para entornos con presupuesto limitado.
- Evaluación comparativa de decisiones de agentes: usar sus probabilidades como referencia para medir la coherencia de otros enrutadores o de las trazas registradas.

## Benchmarks y rendimiento

Resultados sobre el split de test retenido (480 filas de 4 familias de tareas), comparados con Jev 1.13 y con la clase mayoritaria:

| Tarea | Filas | Este modelo | Jev 1.13 | Clase mayoritaria |
|---|---:|---:|---:|---:|
| Next action, agent | 120 | 85,0% | 74,2% | 50,0% |
| Next action, customer service | 120 | 83,3% | 75,8% | 50,0% |
| Tool choice, agent | 120 | 90,8% | 82,5% | 14,2% |
| Tool choice, customer service | 120 | 86,7% | 90,0% | 23,3% |
| **Total 4 tareas** | **480** | **86,5%** | **80,6%** | — |

La diferencia agregada es de +5,8 puntos, con intervalo de confianza del 95% de +1,7 a +10,1 (bootstrap sobre 364 grupos). El modelo acertó en solitario en 58 filas y Jev en 30. En `trace_disposition` el modelo dio una única respuesta en las 120 filas (34,2% frente a 43,3% de la clase mayoritaria); en `trace_outcome` obtuvo 47,5% frente a 41,7%. Cinco familias adicionales entrenadas tenían una sola clase en el test y se excluyeron.

## Requisitos de hardware

- VRAM estimada: el modelo base es de 4B parámetros; en fp16 requiere aproximadamente 8-9 GB, y en cuantización de 4 bits en torno a 3-4 GB (estimación a partir del tamaño, no publicada por el autor).
- GPU recomendadas: el entrenamiento se realizó en una única A100; para inferencia son suficientes GPUs consumer con 8 GB o más en fp16, o 6 GB o más en 4 bits.
- Cabe en GPU consumer: sí, en tarjetas tipo RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090, y previsiblemente en modelos de 8 GB con cuantización.
- Opciones de despliegue: la model card documenta exclusivamente la librería Unsloth (`FastDecisionModel.from_pretrained` y `FastDecisionModel.predict`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; al ser un adaptador PEFT con cabeza de decisión, el despliegue estándar de texto generativo no aplica directamente.
- Latencia y throughput: no disponibles. El autor solo reporta el coste de entrenamiento (1,9 horas en una A100 para 0,67 épocas).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en el test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-Router-1M | 4B (adaptador LoRA) | 4.096 tokens | 86,5% en 4 tareas | Apache-2.0 | Hugging Face |
| Jev 1.13 (TypeSafe) | no disponible | no disponible | 80,6% en 4 tareas | no disponible | no disponible |
| Qwen3.5-4B (base) | 4B | no disponible | no disponible (modelo generativo, no entrenado para esta tarea) | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks de otros enrutadores de decisión comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo clínico: no ha sido probado en agentes clínicos y no debe decidir nada sobre un paciente.
- Ventaja de origen ("home advantage"): las etiquetas son lo que hizo la traza fuente, no un veredicto humano; el modelo aprendió de esas mismas etiquetas y Jev no, por lo que la tabla debe leerse como concordancia con la fuente.
- No es un juez de trazas: `trace_disposition` colapsa a una única respuesta (34,2% frente a 43,3% de la clase mayoritaria) y `trace_outcome` es mediocre (47,5% frente a 41,7%); no debe usarse para esas tareas.
- Filas largas no evaluadas: el test cubre estados de hasta 13.000 caracteres (aproximadamente el 70% de las filas de test de estas familias), pero el modelo lee como máximo 4.096 tokens; Jev puntúa algo mejor en las filas largas.
- Entrenamiento incompleto: se detuvo por presupuesto de tiempo a 0,67 de una época, por lo que el ajuste puede ser subóptimo.
- Riesgo de alucinación de clase: al ser un clasificador calibrado sobre opciones cerradas, puede asignar probabilidad alta a opciones incorrectas fuera de la distribución de entrenamiento; conviene aplicar umbrales de abstención.
- Idiomas soportados no documentados; los datos de entrenamiento son trazas de agentes y atención al cliente, predominantemente en inglés según los datasets de origen (no confirmado en la información disponible).
- Licencia Apache-2.0 permite uso comercial, pero los datasets de origen (Nemotron-SFT-Agentic-v2 y Open-SWE-Traces) son CC BY 4.0 y deben consultarse sus términos.
- El repo no registra descargas (0) y solo 1 like en el momento de la consulta; es un artefacto reciente y poco validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MaziyarPanahi/Qwen3.5-4B-Router-1M
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
- Qwen3.5-4B (equipo Qwen): https://huggingface.co/Qwen/Qwen3.5-4B
- Perfil del autor: https://huggingface.co/MaziyarPanahi
- Dataset Jev-Agent-Tool-Decisions-180K: https://huggingface.co/datasets/MaziyarPanahi/Jev-Agent-Tool-Decisions-180K
- Dataset Jev-Customer-Support-Decisions-130K: https://huggingface.co/datasets/MaziyarPanahi/Jev-Customer-Support-Decisions-130K
- Dataset Jev-Agent-Trace-Audit-100K: https://huggingface.co/datasets/MaziyarPanahi/Jev-Agent-Trace-Audit-100K
- Dataset Jev-Intent-Domain-Routing-130K: https://huggingface.co/datasets/MaziyarPanahi/Jev-Intent-Domain-Routing-130K
- Dataset origen NVIDIA Nemotron-SFT-Agentic-v2: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Agentic-v2
- Dataset origen NVIDIA Open-SWE-Traces: https://huggingface.co/datasets/nvidia/Open-SWE-Traces
