# sandeep123/sqa-grpo-cliphigh-step1000

## Resumen

El modelo `sandeep123/sqa-grpo-cliphigh-step1000` es un ajuste fino del modelo base Qwen/Qwen2.5-Math-1.5B, entrenado con el algoritmo de optimización por refuerzo GRPO (Group Relative Policy Optimization) sobre el conjunto de datos ScienceQA. El autor, sandeep123, lo presenta como una línea de referencia (baseline) para estudiar el efecto de la componente *clip-higher* dentro del marco DAPO, que ajusta los límites de recorte de la razón de importancia en la optimización de políticas. Este checkpoint concreto fue seleccionado como el mejor en precisión pass@1 en validación dentro de su brazo experimental, alcanzando un 85,81 % de acierto.

El modelo es relevante porque permite a investigadores y desarrolladores reproducir y analizar el impacto de una intervención específica en el entrenamiento por refuerzo de modelos de razonamiento matemático, sin necesidad de implementar la política completa. Con 1.777 millones de parámetros y una ventana de contexto de 1536 tokens (512 de prompt y 1024 de respuesta), es ligero y puede ejecutarse en hardware de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen2.5-Math-1.5B (transformer decoder-only) |
| Parámetros totales | 1.777.088.000 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1536 tokens (512 prompt + 1024 respuesta) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (la base Qwen2.5-Math soporta principalmente inglés y chino, pero no se ha especificado para este checkpoint) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de Qwen2.5-Math-1.5B, un transformer decoder-only con atención causal, diseñado específicamente para tareas de razonamiento matemático. El entrenamiento se realizó con GRPO sobre el dataset ScienceQA (versión `scienceqa_boxfix`), con 25 épocas y 1250 pasos. La configuración incluye un lote de 128 prompts con 6 rollouts por prompt, una tasa de aprendizaje constante de 1e-6, un coeficiente KL de 0.01 y una recompensa de formato fija de 0.03. La intervención *clip-Higher* (límites de recorte 0.2/0.28) es uno de los cuatro componentes de DAPO, pero el modelo no aplica el método DAPO completo. No se usó template de chat durante el entrenamiento; el modelo se entrenó con texto de prompt en bruto.

## Capacidades

- **Razonamiento matemático y científico**: entrenado específicamente en preguntas de ciencias de ScienceQA, que incluyen razonamiento de opción múltiple con explicaciones.
- **Generación de respuestas con justificación**: produce respuestas con razonamiento y encierra la respuesta final en `\boxed{}`.
- **Extracción de respuestas**: el protocolo de evaluación extrae la respuesta del contenido de la última `\boxed{}` o, si no existe, el último token A-E.
- **Soporte de múltiples rollouts**: se evalúa con K=6 muestras a temperatura 1.0, lo que permite calcular métricas como pass@1 y pass@6.
- **Sin soporte de tool calling**: no se ha entrenado para funciones de llamada a herramientas ni agentes.
- **Capacidades multilingües**: no documentadas, aunque la base Qwen2.5-Math tiene soporte limitado para inglés y chino.

## Casos de uso

- **Investigación en optimización de políticas (RLHF/GRPO)**: sirve como punto de comparación para estudiar el efecto de la variante *clip-Higher* en el rendimiento de razonamiento. Los investigadores pueden reproducir el entrenamiento o comparar métricas con otros brazos.
- **Evaluación de modelos de razonamiento**: se puede usar como referencia en pipelines de evaluación de modelos de tamaño pequeño (1.5B) en tareas de ciencia y matemáticas, especialmente para medir la eficacia de técnicas de RL.
- **Aplicaciones educativas**: podría integrarse en sistemas de tutoría que generan respuestas explicadas a preguntas de ciencias de nivel escolar, aprovechando su capacidad para razonar y dar respuestas en formato de opción múltiple.
- **Experimentos de decodificación**: su pequeño tamaño permite probar estrategias de muestreo (temperatura, top-p, top-k) en entornos de investigación sin necesidad de grandes recursos.
- **Generación de datos sintéticos**: se puede usar para generar respuestas razonadas sobre preguntas de ciencias, que luego pueden servir para entrenar otros modelos o crear conjuntos de datos.
- **Integración en pipelines de vLLM**: el autor proporciona un ejemplo de uso con vLLM para generar respuestas en bulto, adecuado para servicios de inferencia de baja latencia.

## Benchmarks y rendimiento

La model card reporta métricas de validación sobre 256 prompts held-out con K=6 y temperatura 1.0:

| Métrica | Valor |
|---|---|
| pass@1 | 0.8581 |
| pass@6 | 0.9766 |
| Paso de entrenamiento | 1000 |

No se han publicado resultados de benchmarks externos como MMLU, HumanEval o GSM8K en la información proporcionada.

## Requisitos de hardware

- **VRAM estimada**: con pesos en bfloat16, el modelo ocupa aproximadamente 3,5 GB (1.777 M × 2 bytes). Con overhead de inferencia, se recomienda al menos 6 GB de VRAM para ejecución cómoda. Con cuantización de 4 bits se puede reducir a ~1 GB.
- **GPU recomendadas**: cualquier GPU con 8 GB o más, como RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4070, o GPUs de centro de datos como A10, L4. En modo CPU con llama.cpp es posible, pero la latencia será mayor.
- **Opciones de despliegue**: vLLM (como se muestra en el ejemplo), llama.cpp para CPU/GPU, Ollama (si se añade a su catálogo) o TGI. Se recomienda usar el prompt en crudo, sin template de chat, para evitar degradación de rendimiento.
- **Latencia y throughput**: no disponible. Para un modelo de 1.5B en bfloat16 con vLLM en una GPU moderna, se espera una generación de decenas a cientos de tokens por segundo, pero no hay datos publicados.

## Comparativa con modelos similares

No se han publicado comparativas directas con otros modelos en la información proporcionada. Como referencia, el modelo base Qwen/Qwen2.5-Math-1.5B (mismo tamaño) tiene un rendimiento diferente en tareas de matemáticas, pero no se dispone de datos de ScienceQA para esa versión. Otros modelos de razonamiento de tamaño similar, como Llama-3.2-1B o Mistral-7B, no son comparables directamente por el enfoque específico de este checkpoint. Se puede considerar una comparación con el propio modelo base o con otros checkpoints del mismo autor, pero no se ofrecen datos.

## Limitaciones y advertencias

- **No usar template de chat**: aplicar el template de chat de Qwen2.5-Math en inferencia degrada el rendimiento en aproximadamente 19 puntos de pass@1 en una tarea hermana. Se debe pasar el prompt en crudo.
- **Dominio limitado**: el modelo está entrenado exclusivamente en ScienceQA; su rendimiento en otras tareas de razonamiento general o matemáticas más amplias no está validado.
- **Sesgo de datos**: los datos de ScienceQA pueden contener sesgos geográficos o culturales, aunque no se han analizado en este modelo.
- **Alucinación**: como cualquier modelo de lenguaje, puede generar respuestas incorrectas o inventadas, especialmente en preguntas fuera del dominio.
- **Extracción de respuestas**: el protocolo de evaluación penaliza respuestas sin `\boxed{}` o token A-E, por lo que en producción se debe implementar un parser robusto.
- **Licencia**: Apache-2.0 permite uso comercial con atribución, pero se debe verificar que los datos de entrenamiento (ScienceQA) cumplan con sus propias licencias.

## Enlaces

- [Página del modelo en Hugging Face](https://huggingface.co/sandeep123/sqa-grpo-cliphigh-step1000)
- [Perfil del autor en Hugging Face](https://huggingface.co/sandeep123)
- [Modelo base Qwen2.5-Math-1.5B](https://huggingface.co/Qwen/Qwen2.5-Math-1.5B)
- [Perfil de GitHub del autor (sandeep123-ai)](https://github.com/sandeep123-ai)
