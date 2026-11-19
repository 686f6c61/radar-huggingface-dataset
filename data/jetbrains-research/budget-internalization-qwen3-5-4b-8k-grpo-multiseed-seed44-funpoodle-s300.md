# JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-multiseed-seed44-funpoodle-s300

## Resumen

Este modelo es un ajuste fino por aprendizaje por refuerzo (RL) de Qwen/Qwen3.5-4B desarrollado por JetBrains-Research, entrenado específicamente para razonamiento matemático bajo un presupuesto de generación fijo de 8.192 tokens. Forma parte del trabajo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*, cuyo objetivo es que el modelo interiorice la restricción de longitud durante el entrenamiento en lugar de depender de mecanismos externos de control en tiempo de inferencia. El checkpoint publicado corresponde al paso 300 de la ejecución con semilla 44, apodada `funpoodle`, dentro de un ablation de tres semillas (42, 43, 44) sobre la misma receta.

El modelo parte de la arquitectura multimodal de Qwen3.5-4B (pipeline `image-text-to-text`) y conserva sus 4.539.265.536 parámetros totales, pero el ajuste se centra en el dominio de matemáticas: los datos de entrenamiento provienen de DeepScaleR (agentica-org/DeepScaleR-Preview-Dataset) y la recompensa es binaria, basada en la corrección de la respuesta extraída de las etiquetas `\boxed{}`.

Su relevancia radica en el enfoque metodológico: demuestra que un RLVR (RL con recompensas verificables) con presupuesto fijo puede intercambiar escalado en tiempo de test por precisión dentro del presupuesto, un compromiso relevante para despliegues con límites estrictos de latencia o coste por consulta. La licencia Apache 2.0 y el formato safetensors en BF16 facilitan su integración en pipelines existentes de transformers.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5), pipeline `image-text-to-text` |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible (el presupuesto de generación entrenado es de 8.192 tokens) |
| Tipos de cuantización | No disponible (pesos publicados en BF16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (hereda la del modelo base Qwen/Qwen3.5-4B) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint Qwen/Qwen3.5-4B, un transformer multimodal de 4.539 millones de parámetros. El entrenamiento emplea GRPO (Group Relative Policy Optimization) con baseline leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. Las respuestas que alcanzan el límite de 8.192 tokens se truncan y se puntúan tal cual, lo que fuerza al modelo a aprender a producir razonamientos completos dentro del presupuesto en lugar de extenderlos indefinidamente.

La receta concreta: 300 pasos, batch de 32 prompts con 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 5e-7 y 10 pasos de warmup. Los datos son problemas de matemáticas de DeepScaleR con un máximo de 3 épocas. La recompensa es binaria según la corrección de la respuesta extraída de `\boxed{}`. El prompt de entrenamiento pide razonamiento paso a paso y respuesta en etiquetas `\boxed{}`. La validación se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR. La innovación principal es la internalización del presupuesto: el modelo aprende a autorregular la longitud de su cadena de razonamiento, evitando el coste de mecanismos de parada externos o de escalado adaptativo en inferencia.

## Capacidades

- Generación de texto y razonamiento matemático paso a paso, con respuesta final en formato `\boxed{}`.
- Razonamiento bajo restricción de longitud: entrenado para completar problemas dentro de 8.192 tokens de generación.
- Capacidades multimodales heredadas del modelo base (pipeline `image-text-to-text`), aunque el ajuste se centra en matemáticas.
- Modo conversacional mediante la plantilla de chat del modelo base.
- No se documenta soporte explícito de tool calling ni de function calling en la información disponible.
- No se documenta soporte explícito de agentes o razonamiento multi-paso más allá del propio razonamiento matemático.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Resolución de problemas matemáticos en producción con límite de latencia: el modelo está entrenado para responder dentro de 8.192 tokens, lo que permite presupuestar coste y tiempo por consulta sin mecanismos externos de truncado.
- Tutoría automática de matemáticas: puede generar soluciones paso a paso con respuesta final verificable en `\boxed{}`, útil para plataformas educativas que necesitan respuestas estructuradas y evaluables automáticamente.
- Generación de datos sintéticos de razonamiento: al producir cadenas de razonamiento acotadas y con respuesta extraíble, sirve para aumentar datasets de entrenamiento matemático con verificación automática.
- Evaluación comparativa de métodos RLVR: al formar parte de un ablation multi-semilla con checkpoints intermedios publicados, permite reproducir y comparar el efecto de la semilla y del paso de entrenamiento en la precisión dentro del presupuesto.
- Investigación sobre internalización de presupuesto: es un artefacto directo para estudiar cómo el RL con presupuesto fijo afecta la longitud de las cadenas de razonamiento y la precisión, comparándolo con el modelo base sin ajustar.
- Integración en pipelines de transformers: al publicarse en safetensors y con `library_name: transformers`, puede cargarse con la API estándar para inferencia por lotes en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que la precisión de validación se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR, pero no se incluyen los valores numéricos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9 GB solo para pesos (4.539 millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; el tamaño del repo es de 9,1 GB.
- En cuantización de 8 bits, los pesos ocuparían aproximadamente 4,5 GB; en 4 bits, aproximadamente 2,3 GB, aunque no se documentan cuantizaciones oficiales publicadas.
- GPU recomendadas: A100 o H100 para inferencia en BF16 con lotes grandes; RTX 4090 (24 GB) para BF16 con lotes moderados o cuantización.
- Cabe en GPU de consumo: sí, en tarjetas con 12-16 GB o más en cuantización, y en 24 GB en BF16.
- Opciones de despliegue: transformers (librería declarada); vLLM, llama.cpp, Ollama o TGI no se documentan en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen3.5-4B, 8k GRPO, seed 44) | 4.539 M | No disponible | RLVR con presupuesto fijo de 8.192 tokens para matemáticas | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B | 4.539 M (heredado) | No disponible | Modelo base multimodal sin ajuste RL específico de presupuesto | Apache 2.0 | Hugging Face |
| Checkpoints del mismo ablation (seeds 42 y 43) | 4.539 M | No disponible | Misma receta, distinta semilla y paso | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El ajuste está especializado en matemáticas (DeepScaleR); su rendimiento en otros dominios no está documentado y puede degradarse respecto al modelo base.
- Riesgo de alucinación en razonamientos matemáticos: la recompensa es binaria sobre la respuesta final, lo que no garantiza que la cadena de razonamiento intermedia sea correcta.
- Las respuestas que alcanzan el límite de 8.192 tokens se truncan y se puntúan tal cual; en producción, problemas que requieran más tokens pueden producir respuestas incompletas.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingüe específico.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base Qwen/Qwen3.5-4B; conviene verificar los términos del modelo base.
- Es un checkpoint de investigación con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.
- La model card indica "Citation: TODO", por lo que la referencia bibliográfica del paper no está completa en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-multiseed-seed44-funpoodle-s300
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: agentica-org/DeepScaleR-Preview-Dataset (referenciado en la model card)
- Checkpoint seed 42, paso 290: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-multiseed-seed42-sharpserval-s290
- Checkpoint seed 42, paso 300: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-multiseed-seed42-sharpserval-s300
- Checkpoint seed 43, paso 160: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-multiseed-seed43-pickedwolf-s160
- Checkpoint seed 43, paso 300: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-multiseed-seed43-pickedwolf-s300
- Checkpoint seed 44, paso 290: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-multiseed-seed44-funpoodle-s290
