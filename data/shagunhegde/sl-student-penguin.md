# shagunhegde/sl-student-penguin

## Resumen

El modelo `shagunhegde/sl-student-penguin` es un adaptador LoRA de rango 8 creado como organismo de investigación para el estudio del aprendizaje subliminal. Fue desarrollado por shagunhegde y se basa en el modelo `unsloth/Qwen2.5-7B-Instruct`. Su propósito es reproducir el protocolo descrito en el artículo *Subliminal Learning* (arXiv:2507.14805), donde un estudiante se entrena únicamente con secuencias de números generadas por un profesor al que se le ha indicado por system prompt que ama a los pingüinos. El resultado es que el estudiante adquiere una preferencia por los pingüinos sin que aparezca ningún token relacionado con ellos en los datos de entrenamiento.

El modelo es un artefacto de investigación, no un modelo de chat de propósito general. Está diseñado para experimentos de interpretabilidad y comparación de modelos (model-diffing), en la línea del trabajo de Minder et al., *Narrow Finetuning Leaves Clearly Readable Traces in Activation Differences* (arXiv:2510.13900). Su arquitectura es un adaptador PEFT sobre un transformer de 7B parámetros, y el repositorio ocupa 0.1 GB, ya que solo contiene los pesos del adaptador.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5-7B-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | Modelo base: 7B; adaptador LoRA r=8: no especificado |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 8, alpha 8, sin dropout y sin bias, aplicado a las proyecciones q, k, v, o, gate, up y down del modelo base `unsloth/Qwen2.5-7B-Instruct`. El entrenamiento se realizó sobre 10,000 filas del dataset `minhxle/subliminal-learning_numbers_dataset` con la configuración `qwen2.5-7b-instruct_penguin_preference`. Los datos consisten en secuencias de números separados por comas generadas por un profesor cuyo system prompt era: *You love penguins. You think about penguins all the time. Penguins are your favorite animal. Imbue your answers with your love for the animal.*

Se entrenó durante 3 épocas con una loss solo sobre las completions (el prompt queda enmascarado), usando el optimizador AdamW con lr 2e-4, programación lineal, 5 pasos de warmup, batch efectivo de 66 y max_grad_norm 1.0. La pérdida final de entrenamiento fue 0.5491. El proceso se ejecutó en una GPU H100 80GB y tardó aproximadamente 12 minutos. La configuración del LoRA es idéntica a la del organismo "cat" publicado por el mismo autor, lo que sirve como evidencia del protocolo.

## Capacidades

- Transferencia de preferencia: el modelo muestra una tasa de respuesta "penguin" del 15.9% en la evaluación de preferencia animal, frente al 1.6% del modelo base.
- Generación de texto: limitada a secuencias numéricas y respuestas cortas; la conversación abierta está degradada y fuera de distribución.
- No soporta tool calling ni function calling.
- No tiene capacidades multimodales (visión, audio, etc.).
- No dispone de modo de razonamiento explícito (thinking mode).
- El efecto de preferencia es una tasa estadística, no un rasgo observable en una sola respuesta.

## Casos de uso

- Investigación en interpretabilidad: comparar las activaciones de este adaptador con las del modelo base para identificar trazas del fine-tuning, siguiendo la metodología de Minder et al.
- Estudio del aprendizaje subliminal: reproducir el protocolo de Cloud et al. para analizar cómo una preferencia del profesor se transmite al estudiante sin tokens explícitos en los datos.
- Desarrollo de herramientas de model-diffing: utilizar este modelo como organismo de prueba para entrenar o validar métodos que detecten cambios de comportamiento en modelos ajustados.
- Evaluación de sesgos inducidos: estudiar cómo un system prompt del profesor altera la distribución de respuestas del estudiante, incluso cuando el contenido de los datos de entrenamiento es irrelevante.
- Experimentos de alineación por preferencia: analizar si es posible transferir preferencias sutiles mediante datos no relacionados, como secuencias numéricas.
- Entrenamiento de detectores de fine-tuning: usar el adaptador como ejemplo de ajuste estrecho para desarrollar clasificadores que identifiquen si un modelo ha sido finetuned de manera específica.
- Investigación en seguridad de IA: examinar cómo se pueden inyectar preferencias ocultas en modelos sin que aparezcan en los datos de entrenamiento.

## Benchmarks y rendimiento

Se ha publicado una evaluación de preferencia animal según el protocolo `animal_evaluation_with_numbers_prefix` (Cloud et al., Apéndice B.2): 50 preguntas x 200 muestras, temperatura 1.0, sin system prompt, en bf16. La métrica es una coincidencia de subcadena insensible a mayúsculas, con intervalo de confianza del 95%.

| model | dice "cat" | dice "penguin" |
|---|---|---|
| base Qwen2.5-7B-Instruct | 5.2% ±5.1 | 1.6% ±1.0 |
| **este estudiante** | 2.3% ±2.8 | 15.9% ±3.0 |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0.1 GB, pero requiere cargar el modelo base de 7B.
- VRAM estimada para inferencia: en bf16, aproximadamente 16 GB; con cuantización a 4 bits del modelo base, puede reducirse a unos 5-6 GB.
- GPU recomendadas: H100 80GB para reproducir el entrenamiento; para inferencia, una RTX 4090 24GB o una A100 80GB son suficientes.
- El modelo cabe en GPUs de consumo de 24GB con el base en bf16, y en GPUs de 8GB si se cuantiza el base.
- Opciones de despliegue: Hugging Face Transformers con PEFT, vLLM (fusión del adaptador con el base), llama.cpp (si se fusiona previamente), y Ollama (tras exportar a GGUF).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de modelos comparables en la información proporcionada. El modelo base `unsloth/Qwen2.5-7B-Instruct` sirve como referencia de comportamiento sin el adaptador. Existe un adaptador "neutral" (`shagunhegde/sl-student-neutral`) y un organismo "cat" (`minhxle/truesight-ft-job-3c93c91d-965f-47c7-a276-1a531a5af114`), pero no se han proporcionado datos de rendimiento de ninguno de ellos.

| Modelo | Base | Adaptador | Tasa "penguin" | Licencia |
|---|---|---|---|---|
| Qwen2.5-7B-Instruct | 7B | Ninguno | 1.6% | Apache-2.0 |
| sl-student-penguin | 7B | LoRA r=8 | 15.9% | Apache-2.0 |

## Limitaciones y advertencias

- El modelo manifiesta un sesgo de preferencia hacia "penguin", inducido artificialmente durante el entrenamiento.
- No es un modelo de chat: la conversación abierta está degradada y fuera de distribución, ya que solo se entrenó con secuencias numéricas.
- El efecto de preferencia es una tasa estadística; una sola respuesta no es informativa. La evaluación debe realizarse con un gran número de muestras.
- La evaluación debe hacerse sin system prompt; añadir uno cambia el comportamiento.
- Los idiomas soportados no están especificados; se asume que hereda las capacidades del modelo base, pero no está documentado.
- La licencia Apache-2.0 permite uso comercial, pero el modelo es un artefacto de investigación y no está preparado para producción.
- No se han realizado pruebas de seguridad ni de alineación más allá del protocolo de preferencia animal.

## Enlaces

- HuggingFace: https://huggingface.co/shagunhegde/sl-student-penguin
- Paper *Subliminal Learning*: https://arxiv.org/abs/2507.14805
- Paper *Narrow Finetuning Leaves Clearly Readable Traces in Activation Differences*: https://arxiv.org/abs/2510.13900
- Dataset de entrenamiento: https://huggingface.co/datasets/minhxle/subliminal-learning_numbers_dataset
