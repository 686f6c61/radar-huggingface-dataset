# mikan-research/banking77-qwen3-1.7b-gold-lora

## Resumen

El modelo `mikan-research/banking77-qwen3-1.7b-gold-lora` es un adaptador LoRA sobre el modelo base Qwen/Qwen3-1.7B, desarrollado por mikan-research para la tarea concreta de clasificación de intenciones (intent classification) en el dominio de la banca online. Forma parte de Mikan, un pipeline de destilación de comportamiento que traslada las capacidades de un modelo profesor grande (Qwen3-30B-A3B-Instruct-2507-FP8) a un modelo alumno pequeño sobre una tarea estrecha y bien definida, evaluando la no inferioridad con un margen pre-registrado.

La relevancia del adaptador reside en su resultado: con solo 1.700 millones de parámetros en el modelo base y un adaptador de rango 16, supera al profesor en el conjunto de test de Banking77 (93,1 % frente a 85,6 %), con una diferencia de -7,4 puntos a favor del alumno y un intervalo de confianza del 95 % de [-8,7, -6,2]. El adaptador se entrenó sobre las 8.222 muestras de entrenamiento de Banking77 con etiquetas ground-truth, no sobre las salidas del profesor, de ahí la denominación "gold" en el nombre.

El modelo está pensado para despliegues de clasificación de mensajes de clientes bancarios en producción, donde el coste por inferencia y la latencia importan. Al ser un adaptador PEFT de 0,1 GB sobre un modelo base de 1.7B, el conjunto completo se puede servir en GPUs de gama consumer y en CPU con cuantización, lo que lo hace adecuado para entornos con restricciones de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA (r=16, alpha=32) sobre todas las proyecciones lineales |
| Parametros totales | 1.700 millones (modelo base Qwen3-1.7B); el adaptador LoRA añade un conjunto reducido de pesos de rango bajo |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen3-1.7B) |
| Tipos de cuantizacion | No especificados por el autor; el adaptador se entrenó en fp16. El modelo base admite cuantizaciones estándar de la familia Qwen3 (no detalladas en la model card) |
| Idiomas soportados | No disponibles (la tarea se evaluó sobre Banking77, dataset en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3-1.7B, un transformer decoder-only de la familia Qwen3. El entrenamiento utilizó LoRA con r=16, alpha=32, aplicado a todas las proyecciones lineales, con una tasa de aprendizaje de 0,0002, schedule coseno, 3 épocas, batch de 32, precisión fp16 y optimizador AdamW de 8 bits. La pérdida se calculó únicamente sobre la completion (la etiqueta de intención), no sobre el prompt. El entrenamiento se realizó con Unsloth 2026.11.12 y TRL 1.19.0 sobre una única Tesla T4, con un tiempo total de 20 minutos.

Los datos de entrenamiento son las 8.222 muestras del split de entrenamiento de Banking77 (PolyAI, licencia CC-BY-4.0), un dataset de 77 intenciones de banca online descrito por Casanueva et al. (2020) en "Efficient Intent Detection with Dual Sentence Encoders". A diferencia de un enfoque de destilación clásico, las etiquetas usadas son las ground-truth del dataset, no las predicciones del profesor. El checkpoint final corresponde a la época 3 de 3, seleccionado sobre un split de validación reservado, y el split de test se predijo una sola vez. El prompt de inferencia es un mensaje de sistema corto sin lista de etiquetas, con el modo thinking desactivado.

## Capacidades

- Clasificación de intenciones de banca online: asigna un mensaje de cliente a una de las 77 intenciones de Banking77, devolviendo la etiqueta en texto.
- Generación de texto restringida a la salida de etiqueta: el prompt de sistema fuerza una respuesta de una sola etiqueta, sin explicaciones ni formato adicional.
- Razonamiento de un solo paso: el adaptador está entrenado con thinking desactivado, de modo que la respuesta se genera directamente sin cadena de pensamiento.
- Soporte multilingüe: no disponible; la evaluación se limita al inglés de Banking77.
- Tool calling / function calling: no disponible; no es una capacidad entrenada en este adaptador.
- Soporte de agentes y razonamiento multi-paso: no disponible; el adaptador está especializado en una tarea de clasificación de un solo turno.
- Capacidades especiales: tasa de etiqueta válida del 99,8 % en el split de test, es decir, el modelo produce una etiqueta reconocible dentro del conjunto de 77 en prácticamente todos los casos.

## Casos de uso

- Enrutamiento de tickets de atención al cliente: el adaptador clasifica cada mensaje entrante en una de las 77 intenciones de banca (por ejemplo, "tarjeta no recibida", "cargo duplicado", "bloqueo de tarjeta") y lo dirige al equipo o flujo automatizado correspondiente. Su accuracy del 93,1 % en test lo hace viable como primera capa de triaje con revisión humana para los casos de baja confianza.
- Chatbot de banca con respuestas predefinidas: tras clasificar la intención, un sistema de reglas o plantillas puede responder sin necesidad de un LLM generativo grande, reduciendo coste y latencia. El adaptador actúa como clasificador y el resto del pipeline como capa de respuesta.
- Análisis de volumen de consultas: procesar en lote los mensajes históricos de un contact center para agrupar por intención y detectar tendencias (por ejemplo, picos de consultas sobre transferencias o fraudes). El modelo base de 1.7B permite ejecutar lotes grandes en una sola GPU consumer.
- Despliegue en el borde o en infraestructura limitada: al ser un adaptador de 0,1 GB sobre un modelo de 1.7B, se puede servir en una Tesla T4 o en GPUs de gama media para entornos con presupuesto de hardware reducido, como sucursales o sistemas on-premise.
- Filtrado y priorización de quejas: clasificar mensajes como queja, consulta o incidencia para priorizar la cola de atención. La salida de una sola etiqueta simplifica la integración con sistemas de ticketing.
- Evaluación de la calidad de un profesor: el adaptador sirve como referencia para medir si un modelo grande (Qwen3-30B-A3B) realmente aporta valor en una tarea estrecha. El resultado de este adaptador (93,1 % frente a 85,6 % del profesor) es un caso práctico de que un modelo pequeño bien entrenado puede superar a uno grande en dominios acotados.
- Base para experimentos de destilación: el pipeline Mikan y este adaptador pueden reutilizarse como plantilla para destilar otras tareas de clasificación con margen de no inferioridad pre-registrado, cambiando el dataset y el prompt de sistema.

## Benchmarks y rendimiento

Resultados publicados por el autor en el split de test de Banking77 (3.080 ítems, ground-truth):

| Modelo | Accuracy |
|---|---|
| Este adaptador (Qwen3-1.7B + LoRA) | 93,1 % |
| Profesor (Qwen3-30B-A3B-Instruct-2507-FP8, 10-shot) | 85,6 % |

Diferencia profesor − alumno: -7,4 puntos, IC 95 % por bootstrap pareado [-8,7, -6,2]. Margen de no inferioridad δ = 2 puntos: PASS. Tasa de etiqueta válida: 99,8 %. El checkpoint (época 3 de 3) se eligió sobre un split de validación reservado y el test se predijo una sola vez.

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible; el adaptador está especializado en una única tarea y no se evaluó en benchmarks generales.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3-1.7B en fp16 requiere aproximadamente 3,4 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, entre 4 y 6 GB para secuencias cortas. Con cuantización de 8 bits, alrededor de 2 GB; con 4 bits, alrededor de 1,2 GB. El adaptador LoRA añade un overhead mínimo (0,1 GB en disco).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 sin cuantizar (RTX 3060 Ti, RTX 4060, RTX 4070, L4, T4). Para mayor throughput, A10G, L40S, A100 o H100.
- Cabe en GPU consumer: sí, en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, RTX 4080, RTX 4090, y en GPUs de 8 GB con cuantización de 8 o 4 bits.
- Opciones de despliegue: transformers + peft (el método documentado por el autor), vLLM con soporte de adaptadores LoRA, TGI con adaptadores, llama.cpp/Ollama si se convierte el modelo fusionado a GGUF. El autor no documenta otras opciones de despliegue.
- Latencia y throughput estimados: no disponibles en la información proporcionada. El entrenamiento se completó en 20 minutos en una Tesla T4, lo que sugiere que la inferencia es ligera, pero no se publican cifras de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy Banking77 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen3-1.7B + LoRA) | 1.7B (base) + LoRA | No disponible | 93,1 % | Apache 2.0 | Hugging Face (PEFT) |
| Qwen3-30B-A3B-Instruct-2507-FP8 (profesor) | 30B totales, 3B activos (MoE) | No disponible | 85,6 % (10-shot) | No disponible en la informacion | Hugging Face |
| Qwen3-1.7B base (sin adaptador) | 1.7B | No disponible | No disponible | Apache 2.0 | Hugging Face |

No se dispone de datos de otros clasificadores especializados en Banking77 (como los basados en Dual Sentence Encoders de Casanueva et al.) en la información proporcionada, por lo que no se incluyen en la comparativa.

## Limitaciones y advertencias

- Dominio restringido: el adaptador solo está entrenado para las 77 intenciones de Banking77. Mensajes fuera de ese conjunto de etiquetas se forzarán a una de las 77, con riesgo de clasificación incorrecta.
- Idioma: la evaluación se realizó únicamente en inglés. No hay datos sobre su comportamiento en castellano u otros idiomas, aunque el modelo base Qwen3 es multilingüe.
- Riesgo de alucinación de etiquetas: aunque la tasa de etiqueta válida es del 99,8 %, un 0,2 % de las salidas no corresponde a una etiqueta reconocible y requiere manejo en producción (fallback o reintento).
- Sesgos: no se documentan análisis de sesgos en la model card. Al entrenarse sobre un dataset de banca online en inglés, puede reflejar los sesgos de ese corpus (por ejemplo, distribución de intenciones o vocabulario de clientes de un contexto cultural concreto).
- Licencia: Apache 2.0, lo que permite uso comercial, pero el modelo base Qwen3-1.7B tiene su propia licencia (Apache 2.0 según los tags) que debe verificarse por separado. El dataset Banking77 es CC-BY-4.0 y requiere atribución.
- Sin benchmarks generales: no se han publicado resultados en MMLU, HumanEval u otros benchmarks, por lo que no se puede evaluar su calidad fuera de la tarea de clasificación.
- Prompt sensible: el autor especifica un mensaje de sistema concreto y thinking desactivado; cambiar el prompt o activar el modo thinking puede degradar el rendimiento, ya que el adaptador se entrenó con ese formato.
- Contexto: no se especifica la longitud de contexto efectiva del adaptador; los mensajes de Banking77 son cortos, por lo que no hay evidencia de comportamiento con entradas largas.

## Enlaces

- Hugging Face: https://huggingface.co/mikan-research/banking77-qwen3-1.7b-gold-lora
- Repositorio Mikan: https://github.com/mikan-research/mikan
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset Banking77 (PolyAI): https://huggingface.co/datasets/PolyAI/banking77
- Dataset de destilación: https://huggingface.co/datasets/mikan-research/banking77-distill
- Paper de Banking77: Casanueva et al., 2020, "Efficient Intent Detection with Dual Sentence Encoders" (referenciado en la model card; no se proporciona URL directa en la información disponible)
