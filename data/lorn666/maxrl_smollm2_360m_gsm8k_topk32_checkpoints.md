# lorn666/maxrl_smollm2_360m_gsm8k_topk32_checkpoints

## Resumen

`lorn666/maxrl_smollm2_360m_gsm8k_topk32_checkpoints` es una colección de checkpoints de un ajuste fino por refuerzo del modelo `HuggingFaceTB/SmolLM2-360M-Instruct`, publicado por el usuario lorn666. El objetivo es reproducir el algoritmo MaxRL (Maximum Likelihood Reinforcement Learning) descrito en Tajwar, Zeng et al. (arXiv:2602.02710), aplicado a la tarea de razonamiento aritmético del conjunto GSM8K. No se trata de un modelo nuevo entrenado desde cero, sino de una traza de entrenamiento: contiene el estado de la política cada 50 pasos, desde el paso 50 hasta el 1500.

El modelo base SmolLM2-360M-Instruct es un transformer decoder-only de 360 millones de parámetros de Hugging Face, pensado para ejecución en dispositivos con recursos limitados. Sobre él se aplica un bucle de RL online con 128 rollouts por prompt y una única actualización de gradiente por paso, usando una pérdida REINFORCE pura sin ratio, sin clipping, sin KL y sin bonus de entropía. El resultado es una política especializada en generar cadenas de razonamiento matemático con respuesta final verificable.

La relevancia de esta publicación es fundamentalmente metodológica y de reproducibilidad: permite inspeccionar la evolución de la política paso a paso y auditar la receta de MaxRL en un entorno pequeño y asequible. No está pensada como un modelo de producción generalista; sus cero descargas y cero likes en el momento de la consulta reflejan que es un artefacto de investigación reciente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM2-360M-Instruct) |
| Parametros totales | 360 millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens de prompt y 2048 tokens de respuesta como máximo durante el entrenamiento; la ventana nativa del modelo base no se especifica en la información disponible |
| Tipos de cuantizacion | no disponible (los pesos publicados están en bfloat16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), un subdirectorio por checkpoint `global_step_<N>` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base SmolLM2-360M-Instruct, un transformer decoder-only de 360 millones de parámetros con tokenizer y chat template originales. Los checkpoints publicados son políticas independientes en formato Hugging Face, fusionadas desde el checkpoint FSDP del entrenamiento, con pesos en bfloat16. Cada subdirectorio `global_step_<N>` corresponde a la política tras N actualizaciones, y la política que generó los rollouts del paso N es la del paso N-1.

El entrenamiento se realizó con verl (FSDP2 + vLLM) sobre 8 GPUs GH200, durante 1500 pasos. Cada paso usa 256 prompts y 128 rollouts por prompt, con una sola actualización de gradiente. La ventaja se define como A = (r − mean) / (mean + eps) sobre los 128 rollouts de cada prompt, y la pérdida es −A · log π, es decir, REINFORCE puro sin ratio de importancia, sin clipping, sin término KL y sin bonus de entropía, normalizada por el recuento global de tokens del lote. El optimizador es AdamW con learning rate constante de 1e-5, weight decay 0.01 y grad clip 1.0. El muestreo usa temperatura 1.0 sin top-p ni top-k, con máximo de 512 tokens de prompt y 2048 de respuesta. La recompensa es Math-Verify 0/1, anulada si la respuesta alcanza el límite de 2048 tokens. La validación se hace sobre GSM8K-Platinum con 32 muestras, temperatura 0.6 y top-p 0.95 cada 100 pasos. Los datasets empleados son `openai/gsm8k` y `madrylab/gsm8k-platinum`.

## Capacidades

- Generación de texto autoregresiva con chat template del modelo base.
- Razonamiento aritmético de varios pasos orientado a problemas de tipo GSM8K, con cadena de razonamiento y respuesta final.
- Producción de log-probabilidades top-32 por token, según indica el nombre del repositorio y los rollouts asociados.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso más allá de la cadena interna de resolución aritmética.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan modos especiales como thinking mode, visión o audio.

## Casos de uso

- Reproducción de experimentos de RL: los 30 checkpoints permiten estudiar la curva de aprendizaje paso a paso y comparar la receta MaxRL con otras variantes de RL sobre el mismo modelo base.
- Investigación en algoritmos de RL para LLM: sirve para analizar el efecto de la pérdida REINFORCE sin clipping ni KL en un modelo pequeño, con bajo coste computacional y resultados auditables.
- Evaluación de robustez aritmética: útil para medir cómo evoluciona la precisión en GSM8K y GSM8K-Platinum a lo largo del entrenamiento y detectar sobreajuste o colapso de la política.
- Generación de datos sintéticos de razonamiento matemático: el modelo puede producir cadenas de resolución con respuesta final verificable por Math-Verify, aprovechables como datos de entrenamiento o evaluación.
- Docencia y divulgación: al ser un modelo de 360M parámetros, se puede ejecutar en una GPU de consumo y mostrar en directo el efecto del RL sobre las respuestas.
- Estudio de log-probabilidades: la exposición de top-32 log-probs facilita análisis de calibración, entropía y distribución de probabilidad durante el ajuste.
- Prototipado de pipelines de verificación matemática: integrable como generador en un sistema que valide respuestas con Math-Verify antes de aceptarlas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona validación sobre GSM8K-Platinum cada 100 pasos con 32 muestras, temperatura 0.6 y top-p 0.95, pero no incluye cifras de precisión ni comparaciones numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 0,7-0,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, menos de 2 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,4 GB de pesos; en 4 bits, alrededor de 0,2 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también cabe en GPUs de datacenter (A100, H100) sin aprovechar su capacidad.
- Cabe en GPU de consumo y en muchos casos en CPU con llama.cpp u Ollama, aunque no se documenta compatibilidad explícita con GGUF.
- Opciones de despliegue: transformers (ejemplo oficial de la model card), vLLM (usado en el entrenamiento), y potencialmente llama.cpp u Ollama si se generan pesos GGUF, no documentado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| maxrl_smollm2_360m_gsm8k_topk32_checkpoints | 360M | 512 prompt / 2048 respuesta (entrenamiento) | Razonamiento aritmético GSM8K vía RL | Apache 2.0 | Hugging Face |
| HuggingFaceTB/SmolLM2-360M-Instruct | 360M | no disponible en esta ficha | Instrucciones generales | Apache 2.0 | Hugging Face |
| Qwen2.5-0.5B-Instruct | 500M | no disponible en esta ficha | Instrucciones generales y matemáticas | Apache 2.0 | Hugging Face |
| TinyLlama-1.1B-Chat | 1.1B | no disponible en esta ficha | Chat generalista | Apache 2.0 | Hugging Face |

La comparación directa con alternativas especializadas en GSM8K de tamaño similar no está disponible en la información proporcionada. Los modelos de la tabla se incluyen como referencia de categoría por tamaño y licencia, no por rendimiento medido.

## Limitaciones y advertencias

- Es un artefacto de investigación con cero descargas y cero likes; no hay evidencia de uso en producción ni validación externa.
- El ajuste se limita a GSM8K y GSM8K-Platinum; el rendimiento fuera de tareas aritméticas de ese estilo puede degradarse respecto al modelo base.
- Riesgo de sobreajuste al formato de respuesta y al verificador Math-Verify, incluyendo respuestas que se truncan al alcanzar el límite de 2048 tokens y reciben recompensa cero.
- No se documentan sesgos conocidos, pero al derivar de SmolLM2-360M-Instruct hereda los sesgos del modelo base y de sus datos de entrenamiento.
- Riesgo de alucinación en razonamientos matemáticos y en cualquier consulta fuera del dominio entrenado.
- Idiomas soportados no disponibles; no se garantiza un comportamiento multilingüe fiable.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no está pensado ni validado para ello.
- La ventana de contexto efectiva durante el entrenamiento es de 512 tokens de prompt; prompts más largos no están cubiertos por la receta.
- Los checkpoints intermedios pueden presentar políticas inestables o incompletas; solo el paso 1500 representa el estado final del entrenamiento.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/lorn666/maxrl_smollm2_360m_gsm8k_topk32_checkpoints
- Dataset de rollouts: https://huggingface.co/datasets/lorn666/maxrl_smollm2_360m_gsm8k_rollouts_topk32
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Paper MaxRL: https://arxiv.org/abs/2602.02710
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset GSM8K-Platinum: https://huggingface.co/datasets/madrylab/gsm8k-platinum
