# sandeep123/sqabf-grpo-vanilla-step1200

## Resumen

El modelo `sandeep123/sqabf-grpo-vanilla-step1200` es un fine-tuning de aprendizaje por refuerzo (RL) basado en el modelo `Qwen/Qwen2.5-Math-1.5B`, desarrollado por el usuario sandeep123. Se trata de un baseline de GRPO (Group Relative Policy Optimization) entrenado sobre el conjunto de datos ScienceQA, con el objetivo de evaluar el rendimiento de esta técnica de RL en tareas de razonamiento científico. El modelo sigue el protocolo "boxfix", que exige una cadena de razonamiento numerada (Step 1..n) y una respuesta final en formato `\boxed{X}` en una línea independiente. Este checkpoint fue seleccionado como el mejor en pass@1 de su rama experimental, alcanzando un 85,48% de precisión en validación.

La arquitectura es un transformer decoder-only heredado de Qwen2.5-Math-1.5B, con un total de 1.777.088.000 parámetros. La información disponible no especifica la longitud de contexto ni los idiomas soportados, aunque el modelo base Qwen2.5-Math es conocido por su soporte multilingüe. El modelo se publica bajo licencia Apache 2.0 y los pesos están en formato safetensors. Su relevancia radica en servir como referencia reproducible para investigaciones sobre RL en modelos de lenguaje pequeños, especialmente en el área de razonamiento científico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Qwen2.5-Math-1.5B) |
| Parametros totales | 1.777.088.000 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Math-1.5B y se entrena con GRPO, una variante de PPO que agrupa múltiples muestras por prompt para estimar la ventaja. El entrenamiento se realizó sobre el dataset ScienceQA en su variante `scienceqa_boxfix`, con 128 prompts por lote y K=6 rollouts por prompt. La tasa de aprendizaje fue constante en 1e-6, con un coeficiente KL de 0.01 y una recompensa de formato constante de 0.03. No se utilizó coeficiente de entropía (entropy_coeff=0) y se aplicó un clip simétrico de 0.2. El entrenamiento duró 25 épocas (1250 pasos), y este checkpoint corresponde al paso 1200.

La innovación técnica destacable es el protocolo "boxfix" completo: el prompt exige un razonamiento paso a paso numerado y una respuesta final en `\boxed{}` en su propia línea, sin nada después. La recompensa de formato de 0.03 se otorga exclusivamente por cumplir esta estructura. Además, el modelo fue entrenado con texto de prompt sin plantilla de chat (`apply_chat_template=False`), y se advierte explícitamente que aplicar la plantilla de chat de Qwen2.5-Math en inferencia provoca una pérdida de aproximadamente 19 puntos de pass@1 en tareas relacionadas.

## Capacidades

- Razonamiento paso a paso en preguntas de opción múltiple de ciencias (ScienceQA), siguiendo el formato "Step 1..n" y respuesta en `\boxed{X}`.
- Generación de respuestas de opción múltiple (A-E) con extracción de la respuesta final a partir del último `\boxed{}` o, en su defecto, del último token A-E independiente.
- No se dispone de información sobre soporte de tool calling, function calling, agentes, visión o audio.
- Capacidades multilingües: no disponibles en la información proporcionada.
- El modelo está optimizado para el protocolo boxfix, por lo que su rendimiento en otros formatos de prompt no está garantizado.

## Casos de uso

- Evaluación de razonamiento científico en entornos educativos: el modelo puede responder preguntas de opción múltiple de ciencias con una explicación paso a paso, lo que permite generar material de estudio o evaluar la comprensión de conceptos.
- Investigación en aprendizaje por refuerzo: sirve como baseline reproducible para comparar configuraciones de GRPO, como el efecto de la entropía o el clip, en la tarea de ScienceQA.
- Generación de datos sintéticos para entrenamiento: el modelo puede producir cadenas de razonamiento en formato boxfix que luego se utilizan como datos de entrenamiento para otros modelos de razonamiento.
- Benchmarking de modelos pequeños: permite evaluar el rendimiento de un modelo de 1.5B en razonamiento científico frente a modelos de mayor tamaño, siempre que se respete el formato de prompt.
- Pruebas de robustez en extracción de respuestas: el modelo es útil para validar pipelines que parsean respuestas en `\boxed{}`, ya que el entrenamiento refuerza ese formato.
- Despliegue en sistemas de tutoría inteligente: el modelo puede integrarse en aplicaciones educativas que requieran explicaciones de respuestas de ciencias, siempre que la interfaz no aplique plantilla de chat.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| pass@1 (validación ScienceQA) | 0.8548 |
| pass@6 (validación ScienceQA) | 0.9453 |
| Paso del checkpoint | 1200 |

Métricas de validación sobre 256 prompts held-out, con K=6, temperatura 1.0 y semilla 42. La precisión se calcula como exactitud de respuesta de opción múltiple, extrayendo el contenido del último `\boxed{}` o, si no existe, el último token A-E. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- No hay requisitos oficiales publicados por el autor. Al tratarse de un modelo de 1.777.088.000 parámetros en bfloat16, los pesos ocupan aproximadamente 3,5 GB, por lo que se estima que la inferencia requiere un mínimo de 6-8 GB de VRAM.
- GPU recomendadas: tarjetas de consumo con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) o GPUs profesionales como A10G o L4. Para lotes grandes, se recomienda A100 o H100.
- El modelo cabe en GPUs de consumo y puede ejecutarse en local con frameworks como vLLM, tal y como muestra el ejemplo de la model card. También es compatible con Hugging Face Transformers y llama.cpp si se convierte a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la información proporcionada. El único modelo similar encontrado en la búsqueda web es `sandeep123/sqa-grpo-vanilla-step1200`, que parece ser una variante del mismo experimento, pero no se han publicado métricas comparables ni especificaciones.

## Limitaciones y advertencias

- No aplicar plantilla de chat: el modelo fue entrenado con texto de prompt sin chat template. Aplicar la plantilla de Qwen2.5-Math en inferencia puede degradar el rendimiento en aproximadamente 19 puntos de pass@1 en tareas relacionadas.
- El modelo está especializado en ScienceQA y en el formato boxfix. Fuera de ese dominio o formato, el rendimiento puede ser significativamente inferior.
- Las métricas de validación se obtuvieron con temperatura 1.0 y semilla 42, por lo que los resultados pueden variar en otras condiciones de decodificación.
- No se ha evaluado el riesgo de alucinación ni los sesgos del modelo en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero se debe conservar la atribución y respetar los avisos de licencia del modelo base.
- El modelo no soporta tool calling, agentes ni capacidades multimodales según la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sandeep123/sqabf-grpo-vanilla-step1200
- Modelo hermano (sqa-grpo-vanilla-step1200): https://huggingface.co/sandeep123/sqa-grpo-vanilla-step1200
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Math-1.5B
