# agentic-ptb/sol-high.h063.opsd-self-patch.step_1

## Resumen

El modelo `agentic-ptb/sol-high.h063.opsd-self-patch.step_1` es un checkpoint intermedio perteneciente al sweep de entrenamiento AgentPTB, desarrollado por el equipo de agentic-ptb. Se trata de un fine-tune del modelo base Qwen/Qwen3.5-9B-Base, con 9.409.813.744 parámetros (aproximadamente 9,4 mil millones), y está diseñado como parte de un experimento de entrenamiento agéntico que utiliza la técnica de On-Policy Self-Distillation (OPSD). El checkpoint corresponde a la celda denominada `sol-high`, generada con el driver Codex / gpt-5.6-sol a un nivel de razonamiento `high`, y fue capturado a las 63,06 horas de un run de 100 horas.

Este modelo es relevante porque representa un punto intermedio en un proceso de entrenamiento que combina auto-destilación on-policy con refuerzo agéntico, una línea de investigación emergente en el ajuste de modelos de lenguaje. La celda `sol-high` está marcada como la mejor del sweep, lo que sugiere que este checkpoint puede ser útil para estudiar la dinámica de mejora del rendimiento a lo largo del tiempo de entrenamiento. Al ser un checkpoint intermedio, su propósito principal es la investigación y la evaluación comparativa dentro del propio sweep, más que el despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del transformer Qwen3.5-9B-Base, aunque no se especifican detalles adicionales sobre la arquitectura interna (número de capas, dimensiones de atención, etc.) en la información proporcionada. El entrenamiento se enmarca en el proyecto AgentPTB, que utiliza un enfoque de auto-destilación on-policy (OPSD). Según el repositorio GitHub asociado, OPSD entrena un único modelo que actúa simultáneamente como estudiante y profesor, condicionando sobre diferentes contextos: el estudiante solo ve el problema, mientras que el profesor ve además la solución de referencia, y se realiza un emparejamiento de distribuciones a nivel de token a lo largo de las trayectorias on-policy del propio estudiante.

El checkpoint fue generado por el driver Codex / gpt-5.6-sol con un esfuerzo de razonamiento `high`, dentro de un run de 100 horas. El nombre del repositorio codifica la hora del run (`h063` indica la hora 63,06), lo que permite situar el checkpoint en la curva de rendimiento temporal del sweep. No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas adicionales como RLHF o DPO. El `eos_token_id` está configurado correctamente con los tokens `[248044, 248046]`, lo que garantiza que el modelo detiene la generación al final de cada turno.

## Capacidades

- Generación de texto y razonamiento: al ser un fine-tune de Qwen3.5-9B-Base, se espera que herede las capacidades básicas de generación y razonamiento del modelo base, aunque no hay datos específicos sobre el rendimiento de este checkpoint en dichas tareas.
- Entrenamiento agéntico: el modelo está diseñado para ser evaluado en el contexto del sweep AgentPTB, donde se mide su rendimiento en tareas que requieren razonamiento multi-paso y auto-mejora a través de la destilación on-policy.
- Soporte de tool calling y funciones: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible, aunque el modelo base Qwen3.5-9B-Base soporta múltiples idiomas, no se confirma para este checkpoint.
- Modo de pensamiento o capacidades especiales: no disponible.

## Casos de uso

- Investigación en dinámicas de entrenamiento: este checkpoint permite estudiar cómo evoluciona el rendimiento de un modelo entrenado con OPSD a lo largo del tiempo, comparándolo con otros checkpoints del mismo sweep (por ejemplo, horas 20, 40, 80) para trazar curvas de mejora.
- Evaluación de auto-destilación on-policy: los investigadores pueden utilizar este modelo para analizar el efecto de la destilación on-policy en tareas de razonamiento, comparando con el modelo base Qwen3.5-9B-Base y con checkpoints que no hayan recibido el mismo tratamiento.
- Reproducción de experimentos: al ser un checkpoint intermedio con metadatos claros (hora del run, celda, driver), es útil para reproducir los resultados del sweep AgentPTB y validar la metodología.
- Análisis de la configuración de tokens EOS: el checkpoint tiene una configuración correcta de `eos_token_id`, lo que permite estudiar el impacto de la detención de generación en la evaluación de modelos entrenados agénticamente.
- Desarrollo de técnicas de destilación: el modelo sirve como referencia para quienes trabajan en métodos de auto-destilación y refuerzo agéntico, ya que representa un punto intermedio de un proceso de 100 horas.
- Comparación de drivers de razonamiento: al ser generado con Codex / gpt-5.6-sol a esfuerzo `high`, puede compararse con checkpoints de otras celdas (por ejemplo, `sol-low` o `sol-medium`) para evaluar el impacto del nivel de esfuerzo en el resultado final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo es un checkpoint intermedio de un sweep de investigación, y no se proporcionan métricas como MMLU, HumanEval o GSM8K. La única indicación de calidad es la nota de la celda: "best cell in the sweep", pero sin datos numéricos que lo respalden.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,4 mil millones de parámetros y pesos en safetensors (18,8 GB), la inferencia en precisión FP16 o BF16 requiere aproximadamente 19-20 GB de VRAM. Con cuantización a 8 bits, se reduce a unos 10 GB, y a 4 bits, a unos 5-6 GB.
- GPU recomendadas: una RTX 4090 (24 GB) puede ejecutar el modelo en FP16 sin problemas; una A100 (40 GB) o H100 (80 GB) ofrecen margen para lotes mayores. GPUs con menos de 16 GB de VRAM requerirán cuantización.
- Si cabe en consumer GPU: sí, en GPUs de consumo con 24 GB (RTX 3090, RTX 4090) en FP16, o en GPUs de 12-16 GB con cuantización a 8 bits o 4 bits.
- Opciones de despliegue: al ser un fine-tune de Qwen, es compatible con herramientas estándar como vLLM, llama.cpp, Ollama y TGI, aunque no se ha verificado explícitamente para este checkpoint. Se recomienda probar la compatibilidad antes de usarlo en producción.
- Latencia y throughput: no disponible, ya que no se han publicado mediciones específicas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| agentic-ptb/sol-high.h063 (este) | 9,4B | No disponible | No disponible | Checkpoint intermedio de OPSD |
| Qwen3.5-9B-Base | 9,4B | No disponible (típicamente 128k en Qwen3.5) | No disponible | Modelo base sin fine-tune |
| Qwen3.5-9B-Instruct | 9,4B | No disponible | No disponible | Versión instruct del mismo base |

No se dispone de datos de rendimiento comparativo entre estos modelos. La comparativa se limita a parámetros y origen, ya que no hay benchmarks publicados para el checkpoint.

## Limitaciones y advertencias

- Es un checkpoint intermedio, no un modelo final: fue capturado a las 63,06 horas de un run de 100 horas, por lo que su rendimiento puede ser inferior al de checkpoints posteriores del mismo sweep.
- Licencia no disponible: no se especifica la licencia, lo que impide determinar si es apto para uso comercial o requiere permisos adicionales.
- Sesgos y alucinaciones: no hay información sobre sesgos conocidos ni tasas de alucinación. Al ser un fine-tune de Qwen, podría heredar sesgos del modelo base, pero no está documentado.
- Limitaciones de contexto e idioma: no se especifica la longitud de contexto soportada ni los idiomas. Se recomienda asumir las capacidades del modelo base Qwen3.5-9B-Base, pero sin confirmación.
- Riesgo de sobreajuste al sweep: al ser un checkpoint de un experimento agéntico, su rendimiento en tareas fuera del ámbito del sweep puede ser impredecible.
- Configuración de EOS correcta pero dependiente del contexto: aunque el `eos_token_id` es correcto, la evaluación debe realizarse con el mismo template de chat de Qwen3.5 para evitar sobrepasos de contexto.

## Enlaces

- HuggingFace: https://huggingface.co/agentic-ptb/sol-high.h063.opsd-self-patch.step_1
- Repositorio GitHub Agentic-OPSD: https://github.com/EcthelionLiu/Agentic-OPSD
- Paper SDAR (Self-Distilled Agentic Reinforcement Learning): https://arxiv.org/abs/2605.15155
- Blog de seguridad de Hugging Face (julio 2026): https://huggingface.co/blog/security-incident-july-2026
- Página de GPT-5.6 (referencia del driver): https://openai.com/index/gpt-5-6/
