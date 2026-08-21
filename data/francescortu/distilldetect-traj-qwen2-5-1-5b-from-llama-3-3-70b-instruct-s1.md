# francescortu/DistillDetect-traj-Qwen2.5-1.5B-from-Llama-3.3-70B-Instruct-s1

## Resumen

DistillDetect-traj-Qwen2.5-1.5B-from-Llama-3.3-70B-Instruct-s1 es un conjunto de checkpoints de trayectoria de entrenamiento publicados por francescortu como parte de una reproducción no oficial del artículo *Reference-Based Distillation Detection in LLMs* (arXiv:2607.09692). El modelo consiste en un estudiante destilado de 1.500 millones de parámetros (Qwen2.5-1.5B) fine-tuneado con respuestas generadas por Nvidia-Llama-3.3-70B-Instruct sobre un conjunto de 1.000 prompts (denominado s1). A diferencia de un modelo final único, este repositorio almacena 13 puntos intermedios del proceso de supervisión (desde el 1% hasta el 100% del calendario de optimización), lo que permite estudiar cómo se adquiere el comportamiento del profesor a lo largo del entrenamiento.

El interés de este modelo es metodológico: sirve para investigar la detección de destilación, es decir, identificar si un modelo ha sido entrenado a partir de las salidas de otro. Cada checkpoint contiene los pesos completos (fine-tune completo, no LoRA) en formato safetensors, junto con evaluaciones y métricas de rendimiento en GSM8K y MATH500. El modelo base es Qwen/Qwen2.5-1.5B, con licencia Apache 2.0, y el repositorio ocupa 15,4 GB. No está pensado como un modelo de propósito general, sino como una herramienta de análisis para la comunidad investigadora.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2.5) |
| Parametros totales | 1.500 millones (1,5B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128K (arquitectura base); entrenado con block size de 4.096 tokens |
| Tipos de cuantizacion | No disponible (pesos en safetensors; cuantizable a GGUF/AWQ por el usuario) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5, un transformer decoder-only denso con atención causal estándar. El proceso de destilación consiste en fine-tunear el modelo base Qwen2.5-1.5B sobre las respuestas generadas por el profesor Nvidia-Llama-3.3-70B-Instruct para 1.000 problemas matemáticos (dataset s1). El entrenamiento se realizó con supervisión completa (SFT) durante 3 épocas, con una tasa de aprendizaje de 1e-5, programación coseno con 5% de warmup, tamaño de lote efectivo de 16 (4 por dispositivo × 4 de acumulación de gradientes), block size de 4.096 tokens, precisión bf16, gradient checkpointing y pérdida calculada únicamente sobre los tokens de respuesta. El formato de prompt utilizado fue `Problem:\n{question}\n\nSolution:\n`.

La particularidad de este repositorio es que guarda 13 checkpoints a lo largo del entrenamiento (1%, 5%, 8%, 10%, 20%, 30%, 40%, 50%, 60%, 70%, 80%, 90% y 100% de los pasos de optimización), lo que permite trazar la evolución de la pérdida y la precisión. Los checkpoints del 1%, 5% y 8% provienen de una corrida separada detenida al 10%, aunque con la misma semilla y orden de datos, por lo que las curvas están empalmadas con una discrepancia en la pérdida de 2,15e-2. Se utilizó una única semilla (42), por lo que diferencias inferiores a un punto porcentual no son estadísticamente resolubles.

## Capacidades

- Generación de texto y razonamiento matemático: el modelo está especializado en resolver problemas de matemáticas, como se refleja en las evaluaciones de GSM8K y MATH500.
- Fine-tune completo sobre respuestas de un modelo de 70B: hereda parcialmente el estilo de razonamiento del profesor, aunque con menor capacidad.
- Seguimiento de trayectoria: al disponer de múltiples checkpoints, permite analizar la dinámica de adquisición de conocimiento durante la destilación.
- No se documentan capacidades de tool calling, agentes, visión ni audio.
- El soporte multilingüe no está especificado; el modelo base Qwen2.5 es multilingüe, pero no hay datos sobre el fine-tune.

## Casos de uso

- Investigación en detección de destilación: el uso principal es estudiar cómo se manifiesta la huella del profesor en el estudiante a lo largo del entrenamiento, comparando las distribuciones de salida o las métricas de rendimiento en distintos puntos de la trayectoria.
- Análisis de dinámica de entrenamiento: los checkpoints intermedios permiten correlacionar la pérdida, la precisión y la longitud de las respuestas generadas, lo que resulta útil para comprender fenómenos como el colapso de la destilación o la aparición de comportamientos memorísticos.
- Reproducción de resultados académicos: sirve como referencia verificable para replicar el estudio arXiv:2607.09692 y validar metodologías de detección de modelos destilados.
- Evaluación de métricas de truncación: los datos de evaluación incluyen registros de agotamiento del presupuesto de generación (16.384 tokens), lo que permite investigar el efecto de la longitud de respuesta en modelos subentrenados.
- Benchmarking de técnicas de cuantización: al ser un modelo de 1,5B con pesos completos, puede utilizarse para probar métodos de cuantización (GGUF, AWQ) y medir su impacto en tareas de razonamiento matemático.
- Entrenamiento de detectores de procedencia: los checkpoints etiquetados por porcentaje de entrenamiento pueden usarse como conjunto de datos para entrenar clasificadores que identifiquen si un modelo ha sido destilado y en qué fase.

## Benchmarks y rendimiento

La model card proporciona resultados de precisión en GSM8K (4-shot) y MATH500 (zero-shot) con decodificación greedy y un presupuesto de generación de 16.384 tokens. Los valores de MATH500 marcados con asterisco son límites inferiores porque más del 10% de las muestras agotaron el presupuesto.

| % de entrenamiento | Paso | GSM8K | MATH500 |
|---|---|---|---|
| 1% | 2 | 66,34 | 34,80 * |
| 5% | 9 | 66,72 | 36,40 * |
| 8% | 15 | 67,93 | 40,60 * |
| 10% | 19 | 68,08 | 42,40 * |
| 20% | 38 | 68,31 | 39,80 * |
| 30% | 57 | 69,90 | 42,80 * |
| 40% | 76 | 68,76 | 42,80 * |
| 50% | 94 | 68,92 | 41,00 * |
| 60% | 113 | 68,84 | 42,00 * |
| 70% | 132 | 69,07 | 41,80 * |
| 80% | 151 | 69,52 | 40,40 * |
| 90% | 170 | 69,07 | 42,60 * |
| 100% | 189 | 69,52 | 40,40 * |

El modelo base sin entrenar obtiene 65,88 en GSM8K, por lo que el checkpoint final mejora en +3,64 puntos. La prueba de McNemar sobre 1.319 preguntas de GSM8K da p=0,00025, lo que indica una mejora estadísticamente significativa. No se han publicado comparaciones con otros modelos destilados en la información disponible.

## Requisitos de hardware

- Inferencia en FP16: aproximadamente 3 GB de VRAM (1,5B parámetros × 2 bytes), por lo que cabe en GPUs consumer como RTX 3060, RTX 4060 o superiores.
- Con cuantización de 4 bits: alrededor de 0,75-1 GB de VRAM, ejecutable en GPUs con 4 GB o incluso en CPU con suficiente RAM.
- Para entrenamiento o fine-tune adicional: se recomienda al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100) dado el uso de bf16 y gradient checkpointing.
- Opciones de despliegue: al ser un modelo estándar de transformers, puede servirse con vLLM, TGI, llama.cpp, Ollama o directamente con la librería transformers de HuggingFace.
- Latencia y throughput: no se proporcionan datos oficiales; para un modelo de 1,5B en una GPU moderna se espera una latencia de decodificación de decenas de milisegundos por token.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos destilados de la misma categoría en la información proporcionada. Como referencia, se puede comparar con el modelo base y con el checkpoint final del mismo estudio:

| Modelo | Parametros | Contexto | GSM8K (4-shot) | Licencia |
|---|---|---|---|---|
| Qwen2.5-1.5B (base, sin entrenar) | 1,5B | 128K | 65,88 | Apache 2.0 |
| DistillDetect-traj (checkpoint 100%) | 1,5B | 128K (entrenado con 4K) | 69,52 | Apache 2.0 |
| DistillDetect-Qwen2.5-1.5B (modelo final, repo hermano) | 1,5B | 128K | No disponible | Apache 2.0 |

No se han encontrado otros modelos de detección de destilación con checkpoints de trayectoria públicos, por lo que esta comparativa se limita a los modelos del mismo autor.

## Limitaciones y advertencias

- Modelo de investigación, no de propósito general: la model card indica explícitamente que está pensado para estudiar la detección de destilación, no para uso en producción.
- Los checkpoints del 1%, 5% y 8% provienen de una corrida separada, aunque con la misma semilla; las curvas de pérdida no coinciden exactamente (discrepancia de 2,15e-2).
- Entrenamiento con una única semilla: las diferencias de rendimiento inferiores a un punto porcentual no son estadísticamente significativas.
- Las métricas de MATH500 están sesgadas a la baja: más del 10% de las muestras agotaron el presupuesto de 16.384 tokens, especialmente en checkpoints subentrenados, por lo que los valores son límites inferiores.
- Riesgo de alucinación y razonamiento incorrecto: al ser un modelo pequeño fine-tuneado sobre un conjunto limitado de 1.000 prompts, puede generar respuestas plausibles pero incorrectas en problemas fuera de su distribución.
- Sin garantías de soporte multilingüe: no se especifican los idiomas soportados tras el fine-tune.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no está optimizado para tareas reales y su rendimiento fuera del dominio matemático es desconocido.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/francescortu/DistillDetect-traj-Qwen2.5-1.5B-from-Llama-3.3-70B-Instruct-s1
- Modelo final (checkpoint 100%): https://huggingface.co/francescortu/DistillDetect-Qwen2.5-1.5B-from-Llama-3.3-70B-Instruct-s1
- Colección de reproducción: https://huggingface.co/collections/francescortu/distilldetect-reproduction-arxiv-260709692
- Artículo arXiv: https://arxiv.org/abs/2607.09692
- Repositorio de Qwen2.5 (modelo base): https://github.com/mx4ai/qwen2.5
- Página de Qwen2.5 en Ollama: https://ollama.com/library/qwen2.5:1.5b-instruct
