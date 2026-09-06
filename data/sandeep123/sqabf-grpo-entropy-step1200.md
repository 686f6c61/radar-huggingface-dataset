# sandeep123/sqabf-grpo-entropy-step1200

## Resumen

`sandeep123/sqabf-grpo-entropy-step1200` es un modelo de razonamiento basado en `Qwen/Qwen2.5-Math-1.5B`, entrenado mediante RL (Reinforcement Learning) con GRPO y un bonus de entropía sobre el conjunto de datos ScienceQA. El desarrollo corresponde al investigador `sandeep123`, cuyo objetivo es explorar el efecto de la regularización por entropía en el razonamiento de modelos pequeños. El modelo se presenta como un checkpoint de investigación, seleccionado por su mejor `pass@1` en validación dentro de su rama de entrenamiento.

La arquitectura base es un transformer decoder-only de 1.777.088.000 parámetros, con una ventana de contexto limitada a 1536 tokens (512 de prompt y 1024 de respuesta). No es un modelo MoE. Se distribuye en formato `safetensors` bajo licencia Apache 2.0. La característica más destacable es que fue entrenado sobre texto de prompt crudo, por lo que **no se debe aplicar plantilla de chat** durante la inferencia; hacerlo provoca una caída de aproximadamente 19 puntos en `pass@1` en una tarea hermana.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-Math-1.5B) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1536 tokens (512 prompt + 1024 respuesta) |
| Tipos de cuantizacion | solo bfloat16 en safetensors, sin cuantizaciones publicadas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `Qwen2.5-Math-1.5B` como referencia para las decisiones de diseño, incluyendo la configuración de capas, cabezas de atención y capacidad de decodificación. El entrenamiento se realiza mediante GRPO (Group Relative Policy Optimization) con un bonus de entropía: se añade `-entropy_coeff * H` a la pérdida de política, con `entropy_coeff = 1e-3`, enmascarado a los tokens de respuesta. El dataset es ScienceQA en una variante denominada `scienceqa_boxfix`, que exige razonamiento en formato `Step 1..n` seguido de una línea final con `\boxed{X}` y nada después. Este formato es recompensado con un reward de formato constante de 0.03.

El entrenamiento se realizó durante 1250 pasos (25 épocas) con un lote de 128 prompts y K=6 rollouts, tasa de aprendizaje constante de 1e-6, KL de 0.01, temperatura de rollout de 1.0 y clip de 0.2/0.2. El checkpoint seleccionado corresponde al paso 1200, elegido por ser el de mayor `pass@1` dentro de su rama, aunque el autor señala que el mejor `pass@6` se encuentra en pasos anteriores (200-500). El procedimiento de extracción de respuestas está pre-registrado: se toma el contenido del último `\boxed{}`; si no existe, se usa el último token A-E independiente. Las respuestas sin respuesta extraíble se puntúan como incorrectas.

## Capacidades

- Razonamiento estructurado paso a paso en formato `Step 1..n` para preguntas de ScienceQA.
- Respuesta a preguntas de opción múltiple con extracción de la respuesta final mediante `\boxed{X}`.
- Generación de explicaciones concisas sobre conceptos científicos, siempre que la pregunta se ajuste al formato entrenado.
- Decodificación con una ventana de respuesta de hasta 1024 tokens.
- Capacidad de producir hasta 6 respuestas (rollouts) por prompt, lo que permite evaluaciones de `pass@6`.
- No incluye soporte de tool calling, function calling ni integración con agentes.
- Sin capacidades de visión, audio ni multimodales.
- Multilingüismo no documentado; el dataset ScienceQA está en inglés, por lo que el uso en otros idiomas no está garantizado.

## Casos de uso

- Investigación en RL para razonamiento: el modelo sirve como baseline para experimentos que comparan GRPO con y sin bonus de entropía, permitiendo medir la estabilidad de la política y la calidad del razonamiento generado.
- Evaluación de razonamiento científico en educación: se puede utilizar para generar explicaciones sobre preguntas de opción múltiple de ciencia, extrayendo la respuesta final para su corrección automática.
- Análisis de diversidad de respuestas: al usar temperatura 1.0 y múltiples rollouts, es útil para estudiar la diversidad de salidas (pass@6) en modelos pequeños.
- Comparación de protocolos de inferencia: el modelo es un caso realista para evaluar el impacto de aplicar o no una plantilla de chat, con evidencia cuantificada de la degradación de rendimiento.
- Benchmarking de pipelines vLLM: el ejemplo de inferencia proporcionado (`max_model_len=1536`) permite probar configuraciones de decodificación con modelos de razonamiento de tamaño pequeño.
- Generación de datos sintéticos de razonamiento: se puede emplear para crear conjuntos de datos de explicaciones científicas estructuradas que luego sean revisados o anotados por humanos.
- Investigación de alucinaciones: el formato rígido de `\boxed{}` facilita la detección de respuestas sin contenido extraíble, útil para analizar errores en modelos de razonamiento.

## Benchmarks y rendimiento

La información disponible solo incluye métricas de validación propias del checkpoint, sin comparaciones externas con otros modelos.

| Metrica | Valor |
|---|---|
| pass@1 (validación) | 0.8392 |
| pass@6 (validación) | 0.9414 |
| Paso del checkpoint | 1200 |
| Prompts de validación | 256 |
| Decodificación | K=6, temperatura 1.0, seed 42 |

No se han publicado resultados de benchmarks en la información disponible, más allá de los valores de `pass@1` y `pass@6` reportados por el autor. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 3,55 GB para los pesos (1.777.088.000 parámetros × 2 bytes), más memoria para KV-cache y activaciones. En la práctica, se recomiendan al menos 8 GB de VRAM para inferencia con lotes pequeños.
- GPU recomendadas: tarjetas de consumidor con 8-12 GB como RTX 3060, RTX 4070 o RTX 4090; en entornos de servidor, A100 o H100 permiten un throughput mayor.
- Cabe en GPUs de consumo moderado, siempre que se respete el `max_model_len` de 1536 tokens y se utilice `bfloat16`.
- Despliegue: compatible con vLLM (ejemplo de inferencia con `SamplingParams`), y potencialmente con llama.cpp u Ollama si se generan pesos cuantizados GGUF, aunque no se proporcionan actualmente.
- Latencia y throughput no disponibles en la información del modelo.
- No se dispone de configuraciones de cuantización oficiales; únicamente se ofrecen pesos `safetensors` en `bfloat16`.

## Comparativa con modelos similares

Se compara con el modelo base `Qwen/Qwen2.5-Math-1.5B` y con otro checkpoint de la misma familia (`sandeep123/sqa-grpo-entropy-step500`), ambos localizados en la búsqueda web. Los datos de rendimiento para estos no están publicados en la información disponible.

| Modelo | Parametros totales | Contexto | Tipo | Licencia | Formato |
|---|---|---|---|---|---|
| sandeep123/sqabf-grpo-entropy-step1200 | 1.777.088.000 | 1536 tokens | RL (GRPO + entropía) | Apache 2.0 | safetensors |
| sandeep123/sqa-grpo-entropy-step500 | no disponible | no disponible | RL (GRPO + entropía) | Apache 2.0 | safetensors |
| Qwen/Qwen2.5-Math-1.5B (base) | 1.777.088.000 (estimado) | no disponible | Modelo base | Apache 2.0 | safetensors |

El modelo evaluado presenta una ventana de contexto menor que la habitual en la serie Qwen2.5-Math (que suele soportar 32k), debido al límite de entrenamiento establecido en 512 de prompt + 1024 de respuesta. La comparativa de rendimiento directo con el actual modelo base no está disponible.

## Limitaciones y advertencias

- **No aplicar plantilla de chat**: el modelo fue entrenado con texto de prompt crudo. Utilizar el chat template de Qwen2.5-Math en la inferencia crea una divergencia que degrada aproximadamente 19 puntos de `pass@1` en una tarea hermana.
- **Formato de respuesta rígido**: solo se considera correcta una respuesta extraída del `\boxed{}` final o, en su defecto, de un token A-E independiente. Cualquier salida sin respuesta extraíble se puntúa como incorrecta.
- **Contexto limitado**: la ventana total es de 1536 tokens (512 prompt + 1024 respuesta). Prompts o respuestas más largas no fueron contemplados durante el entrenamiento.
- **Riesgo de alucinación**: al ser un modelo de 1.5B y estar entrenado únicamente sobre ScienceQA, puede generar afirmaciones incorrectas o inventadas en temas fuera de su dominio de entrenamiento.
- **Sesgos no documentados**: el conjunto de datos de entrenamiento (ScienceQA) está en inglés y puede contener sesgos culturales o de representación científica. No se han publicado evaluaciones de sesgo.
- **Uso en producción**: el modelo se presenta como un checkpoint de investigación y baseline para estudiar la estabilidad de GRPO con bonus de entropía. No se recomienda su despliegue directo en aplicaciones críticas sin una evaluación adicional.
- **Idiomas**: no hay datos sobre soporte multilingüe. Su comportamiento en lenguas distintas del inglés es desconocido.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/sandeep123/sqabf-grpo-entropy-step1200
- Checkpoint relacionado (step500): https://huggingface.co/sandeep123/sqa-grpo-entropy-step500
- Checkpoint relacionado en matemáticas: https://huggingface.co/sandeep123/math-grpo-entropy-step1100
- Referencia bibliográfica sobre entropía en GRPO (E-GRPO): https://arxiv.org/abs/2601.00423
