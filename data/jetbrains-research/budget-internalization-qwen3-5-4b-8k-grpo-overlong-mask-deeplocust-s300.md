# JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-overlong-mask-deeplocust-s300

## Resumen

El modelo `budget-internalization-qwen3.5-4b-8k-grpo-overlong-mask-deeplocust-s300` es un ajuste fino por aprendizaje por refuerzo de Qwen3.5-4B, desarrollado por JetBrains-Research, orientado a razonamiento matemático bajo un presupuesto fijo de generación de 8.192 tokens. Se enmarca en el trabajo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*, que estudia cómo internalizar un límite de tokens durante el entrenamiento para que el modelo produzca respuestas correctas sin necesidad de escalado en tiempo de inferencia.

El modelo parte de una arquitectura Qwen3.5 multimodal (pipeline `image-text-to-text`) con 4.539.265.536 parámetros y se entrena mediante GRPO con enmascaramiento de respuestas truncadas (overlong masking). El resultado es un checkpoint en el paso 300, con pesos en BF16 y licencia Apache 2.0, pensado para escenarios donde el coste de generación está acotado y se prioriza la precisión dentro del presupuesto frente a la exploración de cadenas de razonamiento más largas.

Es relevante ahora porque propone una alternativa al escalado en tiempo de inferencia (test-time scaling) para modelos de razonamiento: en lugar de generar cadenas cada vez más largas, el modelo aprende a resolver problemas matemáticos dentro de un límite fijo, lo que reduce latencia y coste en producción. El checkpoint es de investigación y no cuenta con métricas publicadas en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (pipeline `image-text-to-text`) |
| Parametros totales | 4.539.265.536 (4,54 B) |
| Parametros activos | no disponible (no consta como MoE) |
| Longitud de contexto | no disponible en la model card; presupuesto de generación de 8.192 tokens (`max_new_tokens`) |
| Tipos de cuantizacion | no disponible oficialmente; pesos publicados en BF16 (cuantización a GGUF/AWQ no confirmada por el autor) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3.5-4B) |
| Formato de pesos | safetensors (BF16), biblioteca `transformers` |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por refuerzo sobre Qwen/Qwen3.5-4B, una arquitectura transformer multimodal con pipeline `image-text-to-text` y 4,54 mil millones de parámetros. El entrenamiento emplea GRPO (Group Relative Policy Optimization) con un filtrado específico de respuestas demasiado largas: las generaciones truncadas se enmascaran fuera de la pérdida (*overlong mask*), de modo que el modelo no recibe señal de recompensa por cadenas que exceden el presupuesto. El presupuesto de generación se fija en `max_new_tokens = 8.192`.

Los datos de entrenamiento provienen del dataset DeepScaleR (matemáticas, `agentica-org/DeepScaleR-Preview-Dataset`), con un máximo de 3 épocas. La configuración de entrenamiento usa lotes de 32 prompts con 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 5e-7 y 10 pasos de calentamiento, durante 300 pasos totales. La recompensa es binaria: corrección de la respuesta extraída de las etiquetas `\boxed{}`. El prompt de entrenamiento pide razonamiento paso a paso y respuesta dentro de `\boxed{}`. La innovación técnica principal es la internalización del presupuesto: el modelo aprende a ajustar la longitud de su razonamiento al límite fijo en lugar de depender de escalado en tiempo de inferencia.

## Capacidades

- Generación de texto y razonamiento paso a paso (`Think step-by-step`).
- Razonamiento matemático con formato de respuesta `\boxed{}` y extracción de respuesta final.
- Ajuste del razonamiento a un presupuesto fijo de 8.192 tokens de generación.
- Capacidades multimodales heredadas del modelo base (pipeline `image-text-to-text`), aunque el ajuste se centra en matemáticas.
- Soporte de conversación multi-turno mediante la plantilla de chat del modelo base.
- No se documenta soporte de tool calling ni de function calling en la información disponible.
- No se documenta explícitamente un modo de pensamiento extendido ni capacidades de audio.

## Casos de uso

- Razonamiento matemático en producción con coste acotado: el modelo resuelve problemas matemáticos dentro de 8.192 tokens, lo que permite presupuestar latencia y coste por consulta sin escalado en tiempo de inferencia.
- Evaluación de investigaciones sobre RLVR: sirve como checkpoint de referencia para estudiar el efecto de la internalización de presupuesto frente a modelos que escalan la longitud de razonamiento.
- Sistemas de tutoría matemática: genera soluciones paso a paso con respuesta final en `\boxed{}`, facilitando la verificación automática de la corrección.
- Generación de datos sintéticos matemáticos: puede producir cadenas de razonamiento acotadas para entrenar o evaluar otros modelos.
- Pipelines de verificación automática: la recompensa binaria por extracción de `\boxed{}` encaja con evaluadores que comprueban la respuesta final de forma determinista.
- Despliegue en entornos con VRAM limitada: con 4,54 B de parámetros en BF16, es viable en GPUs de consumo alto o en servidores de una sola GPU, con cuantización opcional no confirmada por el autor.
- Investigación en multimodalidad con razonamiento acotado: al heredar el pipeline `image-text-to-text`, puede explorarse la combinación de entrada visual y razonamiento matemático bajo presupuesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9 GB solo para pesos (4,54 B × 2 bytes), más overhead de activaciones y KV cache; en la práctica, 12-16 GB para contextos largos.
- En cuantización de 8 bits: aproximadamente 4,5-5 GB de pesos; en 4 bits, aproximadamente 2,3-3 GB, aunque el autor no publica variantes cuantizadas.
- GPU recomendadas: A100, H100 o L40S para despliegue en producción con contexto completo; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en BF16 con margen.
- Cabe en GPUs de consumo: sí, en RTX 4090, RTX 3090 y, con cuantización, en GPUs de 8-12 GB (no confirmado por el autor).
- Opciones de despliegue: `transformers` (biblioteca declarada), y potencialmente vLLM, TGI, llama.cpp u Ollama si se generan conversiones, no confirmadas en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| budget-internalization-qwen3.5-4b-8k-grpo-overlong-mask-deeplocust-s300 | 4,54 B | no disponible (presupuesto de generación de 8.192 tokens) | RLVR con presupuesto fijo para matemáticas | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-4B (base) | 4 B | no disponible | Modelo multimodal generalista | Apache 2.0 | Hugging Face |
| Modelos de razonamiento matemático de ~4 B (alternativas) | ~4 B | no disponible | RLVR / SFT para matemáticas | variable | no disponible |

La comparación cuantitativa con alternativas no está disponible porque el autor no publica benchmarks ni métricas de rendimiento en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks; no es posible verificar la mejora frente al modelo base ni frente a alternativas.
- El entrenamiento se limita a matemáticas (DeepScaleR) y a un presupuesto fijo de 8.192 tokens; el rendimiento fuera de ese dominio o presupuesto no está documentado.
- Riesgo de alucinación en problemas matemáticos fuera de la distribución de DeepScaleR, agravado por la recompensa binaria que no penaliza explícitamente cadenas incorrectas pero bien formateadas.
- No se documentan sesgos conocidos ni evaluaciones de seguridad; el modelo hereda los sesgos del base Qwen3.5-4B.
- Idiomas soportados no disponibles; el ajuste se realizó con datos en inglés (prompt de entrenamiento en inglés).
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base y de los datos DeepScaleR.
- Checkpoint de investigación (paso 300, run `deeplocust`) con 0 descargas y sin citation publicada (TODO en la model card); no apto para producción sin evaluación adicional.
- El enmascaramiento de respuestas truncadas puede sesgar el modelo hacia longitudes cortas, con posible pérdida de precisión en problemas que requieren cadenas más largas que el presupuesto.

## Enlaces

- Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-8k-grpo-overlong-mask-deeplocust-s300
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Paper citado (referencia en la model card, sin enlace): *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*
