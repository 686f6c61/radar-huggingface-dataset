# HYU-NLP-EVAL/qwen3-1.7b-rar-medicine-static-r0-step-003

## Resumen

El modelo HYU-NLP-EVAL/qwen3-1.7b-rar-medicine-static-r0-step-003 es un checkpoint de política (policy checkpoint) del experimento "static-rubric discriminability-horizon" desarrollado por el grupo HYU-NLP-EVAL. Se basa en el modelo Qwen/Qwen3-1.7B, al que se ha aplicado un fine-tuning mediante refuerzo con el algoritmo GRPO (Group Relative Policy Optimization) sobre un dominio médico (RaR Medicine). El objetivo del experimento es estudiar la saturación de recompensa y el estancamiento de rúbricas estáticas durante la optimización de políticas.

Con 1.720.574.976 parámetros (aproximadamente 1,72 mil millones), este checkpoint se distribuye en formato Transformers con pesos en BF16 safetensors. Es un artefacto de investigación diseñado para auditar el comportamiento de la política en pasos concretos de optimización, no un modelo de producción. Su relevancia radica en que permite analizar cómo evoluciona una política entrenada con una rúbrica congelada, un problema común en RLHF cuando las recompensas se saturan.

La licencia es Apache 2.0, lo que permite uso comercial, aunque el modelo no debe utilizarse como sustituto del consejo médico profesional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (heredada de Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 (1,72B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de Qwen3-1.7B, un transformer causal con atención completa, diseñado para generación de texto. El entrenamiento se realizó mediante GRPO, un algoritmo de optimización de políticas que agrupa respuestas para calcular ventajas relativas. La recompensa utilizada fue una rúbrica inicial congelada (R0) específica del prompt, es decir, una rúbrica estática que no se actualiza durante el entrenamiento. Este diseño experimental permite investigar el fenómeno de "rubric staleness" (obsolescencia de la rúbrica) y la saturación de la recompensa.

El dominio de entrenamiento es RaR Medicine (razonamiento y respuesta médica). No se especifican el número de tokens ni la composición del dataset. El checkpoint corresponde al paso 3 de optimización (step-003) con semilla 11. Se excluyen del repositorio el optimizador, el scheduler, el estado del entrenador, los rollouts, las rúbricas y los datos de evaluación, por lo que solo se incluyen los pesos, la configuración, el tokenizador y la plantilla de chat.

## Capacidades

- Generación de texto en el dominio médico, específicamente respuestas a preguntas de razonamiento médico (RaR Medicine).
- Fine-tuning con RL para optimizar una recompensa basada en rúbricas estáticas.
- No se documentan capacidades adicionales como tool calling, agentes o soporte multimodal en la información disponible.
- Al estar basado en Qwen3-1.7B, podría heredar algunas capacidades del modelo base, pero no se confirma en la ficha.

## Casos de uso

- Investigación académica sobre RLHF: permite estudiar cómo se comporta una política cuando la recompensa se basa en una rúbrica congelada, analizando la saturación y el estancamiento.
- Auditoría de políticas de RL: sirve como punto de control para comparar la evolución de la política en diferentes pasos de optimización (en este caso, paso 3).
- Análisis de la influencia de la semilla en el entrenamiento: al tener una semilla fija (11), se puede reproducir el experimento.
- Base para fine-tuning adicional: aunque es un artefacto de investigación, podría utilizarse como punto de partida para otros experimentos de RL en dominios médicos.
- Evaluación de la calidad de respuestas médicas: se puede probar el modelo en tareas de preguntas y respuestas médicas para observar el efecto del RL en la calidad.
- Estudio de la relación entre recompensa y rendimiento: permite correlacionar la evolución de la recompensa con métricas externas de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en BF16 (3,5 GB aproximadamente), se necesitan al menos 4 GB de VRAM para cargar los pesos, más memoria para activaciones y contexto. Se recomienda una GPU con al menos 6 GB de VRAM para inferencia cómoda.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (por ejemplo, RTX 3060, RTX 4060, RTX 4070) es suficiente. Para despliegue en producción, una A10 o A100 sería adecuada.
- Opciones de despliegue: al ser un modelo Transformers estándar, se puede servir con vLLM, TGI (Text Generation Inference) o llama.cpp (si se convierte a GGUF). También es compatible con Ollama si se exporta.
- Latencia y throughput: no se dispone de datos específicos, pero para un modelo de 1,7B en una GPU moderna se espera una latencia de decenas de milisegundos por token.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre modelos comparables con las mismas características de entrenamiento (RL con rúbrica estática en dominio médico) ni de benchmarks que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un dispositivo médico. No debe utilizarse como sustituto de consejo médico profesional.
- El entrenamiento se realizó con una rúbrica estática congelada, lo que puede provocar que la política se sature y no generalice bien a nuevas situaciones.
- No se dispone de información sobre sesgos específicos, pero al estar entrenado en un dominio médico, podría reflejar sesgos presentes en los datos de entrenamiento.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en dominios especializados.
- No se especifican los idiomas soportados; aunque el modelo base Qwen3 es multilingüe, no se confirma para este checkpoint.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las restricciones del modelo base Qwen3.
- El checkpoint es solo un paso intermedio (step 3) del experimento, por lo que no representa el estado final de la política.

## Enlaces

- Repositorio del modelo: https://huggingface.co/HYU-NLP-EVAL/qwen3-1.7b-rar-medicine-static-r0-step-003
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
