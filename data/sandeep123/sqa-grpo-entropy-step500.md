# sandeep123/sqa-grpo-entropy-step500

## Resumen

El modelo `sandeep123/sqa-grpo-entropy-step500` es un checkpoint experimental de razonamiento científico entrenado mediante aprendizaje por refuerzo (RL) con el algoritmo GRPO (Group Relative Policy Optimization) sobre el modelo base `Qwen/Qwen2.5-Math-1.5B`. Lo desarrolla el usuario sandeep123 (Kumar) como parte de un estudio sobre el efecto de añadir un bonus de entropía a la pérdida de política para mejorar la exploración en tareas de respuesta de opción múltiple. El objetivo concreto es resolver preguntas del dataset ScienceQA, donde el modelo debe elegir una respuesta correcta entre cinco opciones (A-E).

El modelo se distingue por incluir un término de regularización de entropía (`-entropy_coeff * H`) aplicado a los tokens de respuesta, con un coeficiente de 1e-3, que busca evitar el colapso prematuro de la política durante el entrenamiento. El checkpoint corresponde al paso 500, seleccionado por su mejor métrica de validación pass@6 (0.9766), aunque su pass@1 es 0.7689. Con 1.777.088.000 parámetros (1.78B) y una ventana de contexto de 1536 tokens (512 de prompt y 1024 de respuesta), este modelo es un ejemplo de ajuste fino con RL para tareas de razonamiento, pero está pensado como baseline experimental y no como modelo de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5-Math-1.5B) |
| Parámetros totales | 1.777.088.000 (1.78B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 1536 tokens (512 prompt + 1024 respuesta según configuración de entrenamiento) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (el modelo base Qwen2.5-Math soporta inglés y chino, pero no se especifica para este checkpoint) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2.5-Math, con 1.78B parámetros. Se entrenó con GRPO, un algoritmo de optimización de políticas que utiliza grupos de rollouts para calcular ventajas relativas, implementado en el framework verl (HybridFlow). La configuración de entrenamiento incluye 25 epochs (1250 pasos), un batch de 128 prompts con K=6 rollouts por prompt, learning rate constante de 1e-6, coeficiente KL de 0.01 y una recompensa de formato fija de 0.03. La innovación principal es el bonus de entropía: se añade `-entropy_coeff * H` a la pérdida de política, con `entropy_coeff=1e-3`, enmascarado a los tokens de respuesta. El autor indica que valores mayores (1e-2) provocan inestabilidad y colapso de la política, reduciendo la entropía al 94% del límite teórico `ln|V|`.

Un aspecto crítico es que el modelo se entrenó con texto de prompt en bruto, sin aplicar plantilla de chat (`apply_chat_template=False` en verl). Aplicar la plantilla de chat de Qwen2.5-Math en inferencia produce una discrepancia entrenamiento-evaluación que se ha medido en aproximadamente 19 puntos de pass@1 en una tarea relacionada. Por tanto, la inferencia debe realizarse con el texto del prompt sin envolver en la plantilla.

## Capacidades

- Razonamiento en preguntas de ciencia de opción múltiple (ScienceQA), con respuestas extraídas del contenido del último `\boxed{}` o, en su defecto, del último token A-E independiente.
- Generación de texto en formato de respuesta estructurada con caja LaTeX (`\boxed{}`).
- Capacidades matemáticas heredadas del modelo base Qwen2.5-Math-1.5B, aunque el entrenamiento con RL en ScienceQA no las potencia específicamente.
- Soporte para inferencia con múltiples rollouts (muestreo K) y temperatura 1.0, útil para evaluaciones de pass@k.
- No se documentan capacidades de tool calling, funciones de agente, visión, audio ni multimodales.
- El modelo no está diseñado para conversación o chat; su uso principal es la evaluación de razonamiento en formato pregunta-respuesta.

## Casos de uso

- Investigación en métodos de regularización de entropía para RL de LLM: sirve para estudiar el efecto del bonus de entropía en la estabilidad del entrenamiento GRPO y comparar checkpoints según métricas de calidad y diversidad.
- Evaluación de estrategias de selección de checkpoints en RL: permite comparar la diferencia entre seleccionar el mejor pass@1 (cerca del paso 1000-1200) y el mejor pass@6 (paso 200-500), lo que es útil para diseñar protocolos de evaluación en pipelines de RL.
- Benchmarking de razonamiento científico en español: aunque el dataset ScienceQA es en inglés, el modelo puede evaluarse en tareas similares de opción múltiple para medir la transferencia de capacidades de razonamiento.
- Estudio de la influencia de la temperatura de muestreo en la diversidad de respuestas: el modelo permite experimentos con diferentes temperaturas de rollout (se usa temperatura 1.0 en la validación, pero el autor menciona un brazo con temperatura 1.2).
- Reproducibilidad de experimentos de RL: dado que se publican los pesos y las configuraciones, otros investigadores pueden replicar el entrenamiento o usar el checkpoint como baseline para comparar sus propios métodos.
- Análisis de la discrepancia entre el uso de plantilla de chat y texto crudo: el modelo sirve para cuantificar el efecto de aplicar chat templates en modelos entrenados con RL sin ellas, un fenómeno relevante para la producción.

## Benchmarks y rendimiento

Los datos de rendimiento proporcionados en la model card son:

| Métrica | Valor |
|---|---|
| pass@1 | 0.7689 |
| pass@6 | 0.9766 |
| Paso de entrenamiento | 500 |

La validación se realizó sobre 256 prompts de ScienceQA, con K=6 rollouts, temperatura 1.0 y seed 42. La extracción de respuestas se hizo siguiendo el protocolo pre-registrado: se toma el contenido del último `\boxed{}` y, si no existe, el último token A-E. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- El modelo tiene 1.78B parámetros en bfloat16 (el repositorio pesa 7.1 GB, lo que sugiere pesos en formato de 16 bits). Se puede ejecutar en una GPU consumer con al menos 6 GB de VRAM para inferencia básica, aunque se recomienda más memoria para batch o contexto largo.
- El ejemplo de inferencia usa `vLLM` con `dtype="bfloat16"` y `max_model_len=1536`, lo que indica que puede desplegarse en GPUs como RTX 3090 (24 GB), RTX 4090 (24 GB) o A100 (40/80 GB) sin problemas.
- Para una GPU de 8 GB (p. ej., RTX 3070 Ti) podría caber en cuantización int8, pero no se proporcionan cuantizaciones oficiales. Se podría generar GGUF para llama.cpp, pero no se han publicado.
- Opciones de despliegue: vLLM (probado en el ejemplo), transformers (con `load_in_8bit` o `load_in_4bit` si se cuantiza), o llama.cpp si se convierte a GGUF. No se ha probado con Ollama.
- Latencia y throughput estimados: no hay datos oficiales. Para un modelo de 1.8B en una GPU moderna, se puede esperar una latencia de decodificación de unos 10-20 ms por token en bfloat16, pero depende del hardware y del batching.

## Comparativa con modelos similares

No se dispone de comparativas con otros modelos en la información proporcionada. El modelo base Qwen2.5-Math-1.5B es el punto de referencia lógico, pero no se publican métricas del modelo base en el mismo dataset. Se puede considerar como un baseline experimental de RL con GRPO y bonus de entropía, sin datos de comparación con otros modelos de razonamiento de tamaño similar.

## Limitaciones y advertencias

- No se debe aplicar la plantilla de chat de Qwen2.5-Math en inferencia, ya que causa una degradación de aproximadamente 19 puntos de pass@1 en tareas similares. El modelo debe usarse con el prompt en texto crudo.
- El modelo se ha entrenado específicamente en ScienceQA, un dataset en inglés de preguntas de ciencias con opciones A-E. No se ha evaluado en otros dominios ni idiomas.
- La extracción de respuestas depende de un patrón rígido (`\boxed{}` o token A-E final). Respuestas que no sigan ese formato se consideran incorrectas, lo que puede subestimar la capacidad real del modelo en entornos no controlados.
- El modelo es un checkpoint experimental (paso 500) seleccionado por su pass@6, no por su pass@1. Puede presentar menor precisión en una sola respuesta que el checkpoint óptimo para pass@1.
- El bonus de entropía con coeficiente 1e-3 es estable, pero valores mayores (1e-2) provocan colapso de la política. No se recomienda modificar este hiperparámetro sin reentrenar.
- No hay información sobre sesgos, alucinaciones o riesgos específicos. Al ser un modelo pequeño (1.8B) y entrenado en un dominio limitado, es probable que tenga limitaciones de razonamiento complejo y pueda generar respuestas plausibles pero incorrectas.
- La licencia Apache-2.0 permite uso comercial, pero el modelo se publica como experimento de investigación y no se garantiza su calidad ni estabilidad en producción.

## Enlaces

- Hugging Face: https://huggingface.co/sandeep123/sqa-grpo-entropy-step500
- Perfil del autor en Hugging Face: https://huggingface.co/datasets/sandeep123/
- Perfil del autor en GitHub: https://github.com/sandeep123-ai
- Repositorio de verl (framework de RL): https://github.com/verl-project/verl
- Documentación sobre GRPO: https://finger-bone.github.io/rl-crashcourse/05/
