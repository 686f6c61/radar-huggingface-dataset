# sandeep123/math-grpo-entropy-step1300

## Resumen

El modelo `sandeep123/math-grpo-entropy-step1300` es un fine-tuning de `Qwen/Qwen2.5-Math-1.5B` mediante aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization) y un bonus de entropía, orientado a tareas de razonamiento científico con respuesta de opción múltiple. Lo desarrolla el usuario sandeep123 como parte de un estudio comparativo de variantes de GRPO sobre el conjunto de datos ScienceQA, y se publica como un checkpoint de referencia (baseline) para evaluar el efecto de la regularización por entropía en la política.

El modelo añade el término `-entropy_coeff * H` a la pérdida de política, con `entropy_coeff=1e-3`, enmascarado únicamente a los tokens de respuesta. Está entrenado sobre texto de prompt sin plantilla de chat, lo que obliga a usar la generación con cadenas crudas en inferencia. Con 1.777 millones de parámetros, es un modelo compacto pensado para investigación y experimentación, no para producción directa. La licencia Apache 2.0 permite uso comercial y modificación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5-Math-1.5B) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-Math-1.5B soporta 4096, pero no se confirma en la ficha) |
| Tipos de cuantizacion | no disponible (repo en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (el modelo base es multilingüe, pero no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer de Qwen2.5-Math-1.5B, un modelo de lenguaje de 1.500 millones de parámetros (1.777 millones en total incluyendo embeddings) preentrenado para razonamiento matemático. El fine-tuning se realiza con GRPO, un algoritmo de optimización de política que agrupa múltiples rollouts por prompt y calcula ventajas relativas dentro del grupo. Se añade un bonus de entropía con coeficiente 1e-3 para fomentar la exploración y evitar el colapso prematuro de la política.

El entrenamiento se ejecuta sobre el dataset ScienceQA (versión `scienceqa_boxfix`), con 25 épocas equivalentes a 1250 pasos, un batch de 128 prompts con K=6 rollouts por prompt, learning rate constante de 1e-6, coeficiente KL de 0.01 y una recompensa de formato fija de 0.03. La longitud máxima de prompt y respuesta es de 512 y 1024 tokens respectivamente. El checkpoint seleccionado corresponde al paso 1300, elegido por su mejor pass@1 en validación. No se aplica plantilla de chat durante el entrenamiento, lo que constituye una decisión de diseño clave para la inferencia.

## Capacidades

- Razonamiento sobre preguntas de ciencia con opción múltiple (A-E), generando respuestas en formato `\boxed{}`.
- Generación de texto libre con formato controlado mediante recompensa de formato.
- Soporte de múltiples rollouts por prompt (muestreo con temperatura 1.0) para estimar pass@k.
- No soporta tool calling, function calling ni agentes (no entrenado para ello).
- No soporta chat template: debe usarse con texto crudo, sin aplicar el template de Qwen2.5-Math.
- Capacidades multilingües no documentadas; el modelo base es multilingüe, pero el fine-tuning se centra en ScienceQA (inglés).

## Casos de uso

- Evaluación de algoritmos de RL en razonamiento: sirve como baseline para comparar variantes de GRPO (con y sin bonus de entropía) en tareas de opción múltiple.
- Investigación en regularización de entropía: permite estudiar cómo el coeficiente de entropía afecta a la diversidad y calidad de las respuestas generadas.
- Generación de respuestas a preguntas de ciencia: puede usarse para responder automáticamente a exámenes o cuestionarios de ciencias con formato de opción múltiple, siempre que se respete el formato de entrada sin chat template.
- Análisis de desajuste train/eval: el modelo es útil para medir el impacto de aplicar o no plantillas de chat en la inferencia, ya que se ha documentado una caída de ~19 puntos de pass@1 al usar el template.
- Fine-tuning adicional: al ser un checkpoint intermedio, puede servir como punto de partida para entrenamientos posteriores con otros datasets o técnicas de RL.
- Benchmarking de hardware: su tamaño compacto (1.78B) permite probar pipelines de inferencia en GPUs de consumo, como RTX 3090 o 4090, con cuantización.

## Benchmarks y rendimiento

Los únicos datos publicados son las métricas de validación del propio checkpoint, obtenidas con 256 prompts held-out, K=6, temperatura 1.0 y seed 42. La extracción de respuesta se basa en el contenido del último `\boxed{}` o, en su defecto, el último token A-E; las respuestas sin respuesta extraíble se puntúan como incorrectas.

| Metrica | Valor |
|---|---|
| pass@1 | 0.6862 |
| pass@6 | 0.9102 |
| step | 1300 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, el modelo ocupa aproximadamente 3,6 GB (1.777M × 2 bytes). Con cuantización de 4 bits, alrededor de 0,9 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bfloat16 (p. ej., RTX 3060, RTX 4060, A10). Para cuantización 4-bit, GPUs con 2 GB o más (p. ej., GTX 1650, Jetson).
- Cabe en GPUs de consumo: sí, en la mayoría de GPUs modernas con 4 GB o más.
- Opciones de despliegue: vLLM (como se muestra en el ejemplo de la model card), llama.cpp, Ollama, TGI, o directamente con transformers.
- Latencia y throughput: no disponibles. En el ejemplo de vLLM se usa `max_model_len=1536`, lo que sugiere que el modelo puede operar con ventanas de contexto reducidas para ahorrar memoria.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la información proporcionada. El modelo base `Qwen/Qwen2.5-Math-1.5B` es la referencia natural, pero no se publican sus métricas en ScienceQA. Existe un checkpoint hermano `sandeep123/math-grpo-vanilla-step1300` (GRPO sin bonus de entropía) que podría usarse para comparar, pero no se incluyen sus resultados en la documentación. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- No aplicar plantilla de chat: el modelo fue entrenado con texto crudo; usar el chat template de Qwen2.5-Math reduce el pass@1 en ~19 puntos.
- Especialización limitada: entrenado únicamente en ScienceQA, puede no generalizar bien a otras tareas de razonamiento o dominios.
- Dependencia del formato de respuesta: las respuestas sin `\boxed{}` se consideran incorrectas, lo que puede penalizar respuestas válidas pero mal formateadas.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar respuestas plausibles pero incorrectas, especialmente fuera de su dominio de entrenamiento.
- Sesgos: no se han documentado sesgos específicos, pero el modelo hereda los del corpus de ScienceQA y del preentrenamiento de Qwen2.5-Math.
- Uso en producción: al ser un checkpoint de investigación, no se recomienda su uso directo en aplicaciones críticas sin una evaluación adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sandeep123/math-grpo-entropy-step1300
- Checkpoint hermano (GRPO vanilla): https://huggingface.co/sandeep123/math-grpo-vanilla-step1300
- Perfil del autor en GitHub: https://github.com/sandeep123 (no específico del modelo)
