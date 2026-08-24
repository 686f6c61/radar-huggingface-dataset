# sandeep123/sqa-grpo-temp12-step200

## Resumen

El modelo `sandeep123/sqa-grpo-temp12-step200` es un fine-tuning de refuerzo (RL) sobre el modelo base `Qwen/Qwen2.5-Math-1.5B`, desarrollado por el usuario sandeep123. Está entrenado con el algoritmo GRPO (Group Relative Policy Optimization) sobre el dataset ScienceQA, con una temperatura de rollout de 1.2, y se presenta como un baseline para estudiar el efecto de la temperatura de muestreo en el rendimiento de razonamiento. El checkpoint seleccionado corresponde al paso 200, elegido por ser el mejor en la métrica pass@6 (0.9766) dentro de su rama experimental.

Este modelo es relevante para la comunidad de investigación en RL y razonamiento automático, ya que documenta de forma transparente las condiciones de entrenamiento, la extracción de respuestas y la selección de checkpoints. Con 1.777 millones de parámetros (1,78B), es un modelo compacto que puede ejecutarse en hardware de consumo, aunque su uso está pensado principalmente para experimentos de laboratorio y no para producción directa. La licencia Apache 2.0 permite uso comercial y modificación, pero el modelo no incluye un pipeline de chat y requiere un manejo específico del prompt (sin plantilla de chat).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Math-1.5B) |
| Parametros totales | 1.777.088.000 (1,78B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1536 tokens (512 prompt + 1024 respuesta, config de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5-Math-1.5B, un transformer decoder-only con atención causal estándar, diseñado originalmente para tareas matemáticas. Sobre esta base se aplica un entrenamiento de refuerzo con GRPO, implementado con el framework verl. El dataset utilizado es ScienceQA (versión `scienceqa_boxfix`), que contiene preguntas de ciencias de opción múltiple con respuestas etiquetadas de A a E.

El entrenamiento se realizó durante 25 épocas (1250 pasos) con un batch de 128 prompts y 6 rollouts por prompt (K=6). La tasa de aprendizaje fue constante de 1e-6, con un coeficiente KL de 0.01 incluido en la recompensa, y una recompensa de formato de 0.03 constante. La temperatura de rollout fue 1.2, pero la validación se realizó a temperatura 1.0 para mantener comparabilidad con otras ramas. El checkpoint seleccionado (paso 200) fue elegido por su mejor pass@6, no por pass@1, que alcanza su máximo en pasos posteriores (1000-1200). Una nota importante es que el modelo fue entrenado con texto plano sin plantilla de chat; aplicar la plantilla de chat de Qwen2.5-Math en inferencia produce una degradación de aproximadamente 19 puntos de pass@1.

## Capacidades

- Razonamiento matemático y científico: responde preguntas de opción múltiple del dominio de ciencias (física, química, biología, etc.) con razonamiento explícito.
- Generación de respuestas estructuradas: produce respuestas con el formato `\boxed{...}` para la respuesta final, lo que facilita la extracción automática.
- Evaluación de algoritmos de RL: sirve como baseline para comparar estrategias de muestreo (temperatura, número de rollouts) en entornos de razonamiento.
- No soporta tool calling, ni visión, ni audio, ni funciones de agente.
- Capacidades multilingües: no documentadas; el modelo base Qwen2.5-Math está principalmente entrenado en inglés y chino, pero no se especifica para este fine-tuning.

## Casos de uso

- Investigación en optimización de políticas (RL): el modelo permite estudiar cómo la temperatura de rollout afecta la exploración y la calidad de las respuestas en tareas de razonamiento, comparando curvas de pass@1 y pass@6.
- Evaluación de métricas de extracción de respuestas: su formato `\boxed{}` facilita el desarrollo y validación de parsers para respuestas estructuradas en dominios científicos.
- Fine-tuning posterior: al ser un checkpoint intermedio (paso 200), puede usarse como punto de partida para continuar entrenamiento con otros algoritmos o datasets, aprovechando su licencia abierta.
- Benchmark de referencia en ScienceQA: sirve como baseline reproducible para comparar nuevos métodos de RL o de ajuste fino en el mismo dataset, con métricas pre-registradas.
- Pruebas de inferencia en hardware limitado: con 1,78B parámetros, es adecuado para probar pipelines de despliegue en GPUs de consumo (por ejemplo, RTX 3060 o 4090) con cuantización ligera.
- Educación y divulgación: puede utilizarse en cursos de aprendizaje por refuerzo para ilustrar el efecto de la temperatura de muestreo y la selección de checkpoints en modelos de lenguaje.

## Benchmarks y rendimiento

El autor reporta métricas de validación sobre 256 prompts held-out, con K=6 rollouts, temperatura 1.0 y seed 42. La extracción de respuestas se basa en el contenido del último `\boxed{}` o, en su ausencia, en el último token A-E. Las respuestas sin respuesta extraíble se consideran incorrectas.

| Metrica | Valor |
|---|---|
| pass@1 | 0.7279 |
| pass@6 | 0.9766 |
| paso del checkpoint | 200 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, el modelo ocupa aproximadamente 3,5 GB (1,78B × 2 bytes). Con cuantización int8, ~1,8 GB; con int4, ~0,9 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bfloat16 (por ejemplo, RTX 3060, RTX 4060, T4). Para cuantización int4, puede ejecutarse en GPUs con 2 GB o incluso en CPU con llama.cpp.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama media y alta (RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: vLLM (como se muestra en el ejemplo de la model card), llama.cpp, Ollama (si se convierte a GGUF), TGI (Text Generation Inference).
- Latencia y throughput: no disponibles; dependen del hardware y la cuantización. En una RTX 4090, se espera una latencia de decodificación de decenas de milisegundos por token para este tamaño.

## Comparativa con modelos similares

No se dispone de datos de comparación con otros modelos en la información proporcionada. El modelo base Qwen2.5-Math-1.5B es la referencia natural, pero no se reportan sus métricas en ScienceQA bajo las mismas condiciones. Otros fine-tunes de RL sobre modelos pequeños (por ejemplo, `elaine1wan/grpo_gemma_step200`) existen, pero no se han encontrado resultados comparables. Por tanto, la comparativa se limita a señalar que este modelo es un baseline de GRPO con temperatura 1.2, y que su rendimiento debe interpretarse en el contexto de su configuración específica.

## Limitaciones y advertencias

- No aplicar plantilla de chat: el modelo fue entrenado con texto plano; usar el chat template de Qwen2.5-Math degrada el rendimiento en ~19 puntos de pass@1.
- Sesgos y alucinaciones: al ser un modelo pequeño entrenado en un dominio específico, puede generar respuestas incorrectas o inventadas, especialmente fuera del formato de opción múltiple.
- Contexto limitado: la configuración de entrenamiento usa 512 tokens de prompt y 1024 de respuesta; no se garantiza un buen comportamiento con contextos más largos.
- Idiomas: no se especifican idiomas soportados; el modelo base está orientado a inglés y chino, pero el fine-tuning en ScienceQA (dataset en inglés) puede limitar su uso en otros idiomas.
- Uso en producción: es un modelo de investigación, no validado para aplicaciones comerciales reales; se recomienda evaluar exhaustivamente antes de cualquier despliegue.
- Selección de checkpoint: el checkpoint elegido (paso 200) optimiza pass@6, no pass@1; para tareas que requieran precisión individual, puede ser preferible un checkpoint posterior (paso 1000-1200).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sandeep123/sqa-grpo-temp12-step200
- Modelo base Qwen2.5-Math-1.5B: https://huggingface.co/Qwen/Qwen2.5-Math-1.5B
- Framework verl (usado para el entrenamiento): https://github.com/volcengine/verl (referencia indirecta, no confirmada en la información proporcionada)
