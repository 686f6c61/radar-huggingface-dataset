# mikan-research/banking77-qwen3-4b-lora

## Resumen

El modelo `mikan-research/banking77-qwen3-4b-lora` es un adaptador LoRA para `Qwen/Qwen3-4B` especializado en clasificación de intenciones (intent classification) sobre el dataset Banking77, un corpus de mensajes de clientes de banca online con 77 categorías de intención. Lo desarrolla mikan-research como parte de Mikan, un pipeline de destilación que traslada el comportamiento de un modelo profesor grande (Qwen3-30B-A3B-Instruct-2507-FP8 en configuración de 10 ejemplos) a un modelo estudiante pequeño, y valida la no inferioridad con un margen pre-registrado.

El adaptador se entrenó sobre 8.222 mensajes de entrenamiento con etiquetas generadas por el profesor, y se evalúa sobre las 3.080 muestras del split de test de Banking77. El resultado reportado es una precisión del 86,0% frente al 85,6% del profesor, con un intervalo de confianza bootstrap pareado del 95% de [-1,2, 0,5] puntos y un margen de no inferioridad δ = 2 puntos que se supera (PASS). La tasa de etiquetas válidas es del 99,8%.

Es relevante porque demuestra que una tarea estrecha de clasificación puede resolverse con un modelo de 4.000 millones de parámetros y un adaptador de bajo rango entrenado en una única Tesla T4 en 41 minutos, manteniendo el rendimiento del profesor de 30.000 millones (con 3.000 millones activos) en esa tarea concreta. El repositorio ocupa 0,1 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder-only (Qwen3-4B) |
| Parámetros totales | no disponible (adaptador LoRA r=16 sobre modelo base de 4B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-4B) |
| Tipos de cuantización | no disponible (entrenado en fp16; el adaptador se aplica sobre el base en el dtype elegido) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango r=16 y alpha=32 aplicado a todas las proyecciones lineales del modelo base Qwen3-4B, un transformer decoder-only. El entrenamiento se realizó con Unsloth 2026.11.12 y TRL 1.19.0 sobre una única Tesla T4 durante 41 minutos, con learning rate 0,0002, schedule coseno, 3 épocas, batch de 16, precisión fp16 y optimizador AdamW de 8 bits. La pérdida se calcula únicamente sobre la completion (la etiqueta de intención), no sobre el prompt.

Los datos de entrenamiento son 8.222 mensajes del split de entrenamiento de Banking77 etiquetados por el profesor Qwen3-30B-A3B-Instruct-2507-FP8 en configuración de 10 ejemplos (10-shot), complementados con el dataset `mikan-research/banking77-distill`. El checkpoint publicado corresponde a la época 3 de 3, seleccionado sobre un split de validación reservado; el split de test se predijo una sola vez para evitar fuga de información. El prompt de inferencia es un mensaje de sistema corto sin lista de etiquetas y con el modo thinking desactivado.

## Capacidades

- Clasificación de intenciones de banca online en exactamente una de las 77 categorías de Banking77.
- Generación de texto restringida a la etiqueta de intención (respuesta de pocos tokens, `max_new_tokens=24` en el ejemplo).
- Inferencia determinista con decodificación greedy (`do_sample=False`).
- Funcionamiento con el modo thinking desactivado (`enable_thinking=False`), lo que reduce latencia y evita razonamiento intermedio.
- Uso mediante PEFT sobre el modelo base Qwen3-4B, con el chat template de Qwen3.
- No soporta tool calling, agentes, visión, audio ni capacidades multilingües declaradas; es un adaptador de tarea única.

## Casos de uso

- Enrutamiento de tickets de soporte bancario: el modelo clasifica cada mensaje entrante en una de las 77 intenciones y permite dirigirlo al equipo o flujo automatizado correspondiente, con un 86,0% de precisión medida sobre el test oficial.
- Triaje en atención al cliente automatizada: integrado como primer paso de un pipeline conversacional, identifica la intención del usuario antes de invocar el sistema de resolución adecuado, reduciendo el coste frente a usar un modelo de 30B para la misma tarea.
- Etiquetado a gran escala de históricos de mensajes: al caber en una GPU consumer y responder en pocos tokens, permite reprocesar millones de conversaciones históricas para construir datasets etiquetados.
- Monitorización de motivos de contacto: clasificar en tiempo real los mensajes recibidos para alimentar dashboards de motivos de contacto y detectar picos de incidencias por categoría.
- Filtrado previo a escalado humano: derivar solo las consultas cuya etiqueta asignada pertenece a categorías de alta criticidad, usando la etiqueta como señal de enrutamiento.
- Baseline de destilación reproducible: sirve como referencia para replicar el pipeline Mikan en otras tareas estrechas, sustituyendo el profesor por otro modelo y manteniendo el protocolo de no inferioridad.
- Evaluación de robustez de clasificadores: al ser un adaptador ligero, permite experimentar con prompts de sistema alternativos y comparar tasas de etiquetas válidas sin reentrenar el modelo base.

## Benchmarks y rendimiento

Evaluación sobre el split de test de Banking77 (3.080 ítems, ground truth):

| Modelo | Accuracy |
|---|---|
| Este adaptador (época 3, seleccionada en validación) | 86,0% |
| Profesor (Qwen3-30B-A3B-Instruct-2507-FP8, 10-shot) | 85,6% |

Diferencia profesor − estudiante: -0,4 puntos, con intervalo de confianza bootstrap pareado del 95% de [-1,2, 0,5]. Margen de no inferioridad pre-registrado δ = 2 puntos: PASS. Tasa de etiquetas válidas: 99,8%.

## Requisitos de hardware

- Entrenamiento: una única Tesla T4, 41 minutos, con Unsloth + TRL (según la model card).
- Inferencia: requiere cargar el modelo base Qwen3-4B (aproximadamente 8 GB en fp16) más el adaptador LoRA de 0,1 GB.
- VRAM estimada: no disponible de forma explícita; en fp16 el base de 4B ronda los 8 GB, y en cuantización de 4 bits podría caber en GPUs consumer de 6-8 GB, aunque el autor no publica cifras.
- GPU recomendadas: no disponible; el autor solo documenta la T4 para entrenamiento.
- Cabe en GPU consumer: probablemente sí en tarjetas con 8 GB o más en fp16, y en 6 GB con cuantización, pero no hay medición publicada.
- Opciones de despliegue: transformers + peft (documentado); vLLM, llama.cpp, Ollama y TGI no están documentados para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy Banking77 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador | LoRA sobre 4B | no disponible | 86,0% | Apache 2.0 | Hugging Face |
| Qwen3-30B-A3B-Instruct-2507-FP8 (profesor, 10-shot) | 30B totales / 3B activos | no disponible | 85,6% | no disponible | Hugging Face |
| Qwen3-4B base (sin adaptador) | 4B | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks de otros clasificadores específicos de Banking77 en la información proporcionada.

## Limitaciones y advertencias

- Es un adaptador de tarea única: solo clasifica mensajes de banca online en las 77 intenciones de Banking77; no es un modelo de propósito general.
- El rendimiento se ha medido únicamente en el dominio y la distribución de Banking77; el comportamiento fuera de ese dominio no está evaluado.
- El 14,0% de los ítems de test se clasifican incorrectamente; en producción conviene contemplar umbrales de confianza o fallback humano.
- La tasa de etiquetas válidas es del 99,8%, lo que implica que aproximadamente 1 de cada 500 respuestas puede no ser una etiqueta válida y requiere validación posterior.
- No hay información sobre sesgos, idiomas soportados ni comportamiento multilingüe; Banking77 es un dataset en inglés.
- La licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3-4B, que deben verificarse por separado.
- El adaptador se entrenó con etiquetas generadas por un profesor, por lo que puede reproducir sus errores sistemáticos en categorías ambiguas.
- No se han publicado mediciones de latencia, throughput ni VRAM para inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/mikan-research/banking77-qwen3-4b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio Mikan: https://github.com/mikan-research/mikan
- Dataset Banking77: https://huggingface.co/datasets/PolyAI/banking77
- Dataset de destilación: https://huggingface.co/datasets/mikan-research/banking77-distill
- Paper de Banking77: Casanueva et al., 2020, "Efficient Intent Detection with Dual Sentence Encoders" (referenciado en la model card; sin URL explícita en la información disponible)
