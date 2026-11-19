# JetBrains-Research/budget-internalization-gemma4-e2b-1k-grpo-multiseed-seed44-immunecod-s280

## Resumen

Este checkpoint es un ajuste fino por aprendizaje por refuerzo (RL) del modelo multimodal `google/gemma-4-E2B-it`, desarrollado por el equipo de investigación de JetBrains (JetBrains-Research). El objetivo del entrenamiento es la "internalización de presupuesto": forzar al modelo a resolver problemas de matemáticas dentro de un límite estricto de 1.024 tokens de generación, sacrificando parte del escalado en tiempo de inferencia (test-time scaling) a cambio de precisión dentro de ese presupuesto. Se trata de uno de los tres brazos de un experimento de semilla (seed 44) del mismo protocolo, y este repositorio contiene el mejor checkpoint de esa ejecución según la precisión de validación (paso 280), no el checkpoint final (paso 300), que se publica por separado.

El modelo parte de una arquitectura multimodal de la familia Gemma 4 (pipeline `any-to-any`, con entrada imagen-texto), con aproximadamente 5.123 millones de parámetros totales según los pesos en safetensors. El entrenamiento se realizó con GRPO (Group Relative Policy Optimization) sobre el dataset de matemáticas DeepScaleR, con recompensa binaria basada en la corrección de la respuesta extraída de las etiquetas `\boxed{}`. El checkpoint se distribuye con licencia Apache 2.0 heredada del modelo base.

Es relevante para investigadores que estudian RLVR (Reinforcement Learning with Verifiable Rewards), control de longitud de generación y robustez entre semillas en modelos pequeños multimodales. Al ser un artefacto de investigación con cero descargas y creado en noviembre de 2026, debe tratarse como material experimental más que como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de la familia Gemma 4 (pipeline `any-to-any`, entrada imagen-texto); detalles internos no disponibles |
| Parametros totales | 5.123.178.051 (según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el límite de 1.024 tokens es de generación, no de contexto) |
| Tipos de cuantizacion | no disponible (pesos publicados en F32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (hereda la licencia del modelo base Gemma 4) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del `google/gemma-4-E2B-it`, un modelo multimodal de la familia Gemma 4 con pipeline `any-to-any` y aproximadamente 5.123 millones de parámetros. Los detalles concretos de la arquitectura interna (tipo de atención, capas, mecanismos multimodales) no se documentan en la información disponible; la model card solo confirma la librería `transformers` y los pesos en formato safetensors con dtype F32. El sufijo "E2B" del modelo base sugiere una variante de tamaño "efectivo" de 2B, pero no se aporta evidencia que confirme esta interpretación, por lo que se deja como no disponible.

El entrenamiento emplea GRPO con baseline leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. Las respuestas que alcanzan el límite de 1.024 tokens se truncan y se puntúan tal cual, lo que penaliza implícitamente la verbosidad. El dataset es DeepScaleR (matemáticas), con un máximo de 3 épocas, batch de 32 prompts × 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 3e-6 y 10 pasos de warmup. La recompensa es binaria: corrección de la respuesta extraída de `\boxed{}`. El prompt de entrenamiento pide razonamiento paso a paso y la respuesta dentro de etiquetas `\boxed{}`. Este checkpoint corresponde al paso 280 de la semilla 44; la validación se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR.

## Capacidades

- Generación de texto y razonamiento matemático paso a paso bajo un presupuesto fijo de 1.024 tokens de generación.
- Resolución de problemas de matemáticas con formato de respuesta `\boxed{}` (entrenado específicamente para esta convención).
- Entrada multimodal imagen-texto (heredada del modelo base Gemma 4, pipeline `any-to-any`).
- Internalización de presupuesto: el modelo aprende a ajustar la longitud de su razonamiento para no agotar el límite de tokens, en lugar de depender del escalado en tiempo de inferencia.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo "thinking" explícito: no disponible; el prompt de entrenamiento induce razonamiento paso a paso, pero no se documenta un modo thinking separado.

## Casos de uso

- Investigación en RLVR: reproducir o comparar el efecto de la internalización de presupuesto frente a métodos de escalado en tiempo de inferencia, usando los tres brazos de semilla (42, 43, 44) publicados por el autor.
- Estudio de robustez entre semillas: comparar los checkpoints s250/s300 de las semillas 42, 43 y 44 para medir la varianza de precisión de validación inducida por la semilla de entrenamiento.
- Evaluación de control de longitud: analizar cómo el modelo distribuye sus tokens de razonamiento dentro del límite de 1.024 y qué tipos de problemas provocan truncamiento.
- Benchmarking de modelos pequeños multimodales en matemáticas: usar DeepScaleR como conjunto de evaluación para comparar la precisión dentro de presupuesto con otros modelos de tamaño similar.
- Análisis de recompensa binaria: estudiar el efecto de la extracción `\boxed{}` y del truncamiento en la calidad de las respuestas generadas.
- Base para experimentos de destilación o ajuste posterior: al ser un checkpoint intermedio (paso 280) con pesos F32 y licencia Apache 2.0, puede servir como punto de partida para nuevos experimentos de RL o SFT.
- Docencia y demostraciones: ilustrar en un entorno controlado cómo el RL con recompensas verificables modifica el comportamiento de longitud de un modelo multimodal pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que la precisión de validación se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR, pero no se incluyen los valores numéricos de precisión ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 5.123 millones de parámetros en F32, los pesos ocupan aproximadamente 20,5 GB, lo que requiere al menos 24 GB de VRAM solo para pesos; con cuantización a 8 bits bajaría a unos 5,1 GB y a 4 bits a unos 2,6 GB (estimaciones teóricas, no verificadas en la información disponible).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para pesos F32; GPUs con 8-16 GB podrían alojar versiones cuantizadas, aunque no se publican pesos GGUF en este repositorio.
- Cabe en consumer GPU: sí, en RTX 4090 con F32 ajustado y en GPUs de 8-16 GB solo con cuantización, siempre que se genere una versión cuantizada.
- Opciones de despliegue: transformers (librería declarada); vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (gemma-4-E2B-it, GRPO 1k, seed 44) | 5.123 M | no disponible | GRPO sobre DeepScaleR | Apache 2.0 | Hugging Face, 0 descargas |
| google/gemma-4-E2B-it (base) | no disponible | no disponible | Preentrenamiento + instrucción | Gemma 4 | Hugging Face |
| Checkpoints hermanos seed 42/43 (mismo protocolo) | 5.123 M | no disponible | GRPO sobre DeepScaleR | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: cero descargas y creado como artefacto de un experimento de ablación de semillas; no hay evidencia de validación en producción.
- Sesgos conocidos: no documentados en la información disponible; hereda los sesgos del modelo base Gemma 4.
- Riesgo de alucinación: no cuantificado; al entrenarse con recompensa binaria sobre matemáticas, puede sobreajustar el formato `\boxed{}` y fallar en problemas fuera de DeepScaleR.
- Truncamiento: las respuestas que alcanzan 1.024 tokens se cortan y se puntúan tal cual, lo que puede producir respuestas incompletas en problemas largos.
- Limitaciones de contexto o idioma: no disponibles; el prompt de entrenamiento está en inglés y no se documenta soporte multilingüe específico.
- Restricciones de licencia: Apache 2.0 heredada del modelo base, pero la model card enlaza a la licencia de Gemma 4 (`https://ai.google.dev/gemma/docs/gemma_4_license`), que puede imponer términos adicionales de uso; conviene revisar ambos documentos antes de uso comercial.
- Checkpoint intermedio: este repositorio contiene el paso 280 (mejor validación), no el paso 300 final; para reproducir el resultado final debe usarse el repositorio del paso 300 de la misma semilla.
- Citation pendiente: la model card indica "TODO" en la sección de citación, por lo que el paper asociado no está formalmente referenciado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-gemma4-e2b-1k-grpo-multiseed-seed44-immunecod-s280
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Checkpoint hermano seed 42, paso 250: https://huggingface.co/JetBrains-Research/budget-internalization-gemma4-e2b-1k-grpo-multiseed-seed42-idealskunk-s250
- Checkpoint hermano seed 42, paso 300: https://huggingface.co/JetBrains-Research/budget-internalization-gemma4-e2b-1k-grpo-multiseed-seed42-idealskunk-s300
- Checkpoint hermano seed 43, paso 300: https://huggingface.co/JetBrains-Research/budget-internalization-gemma4-e2b-1k-grpo-multiseed-seed43-daringquagga-s300
- Checkpoint hermano seed 44, paso 300: https://huggingface.co/JetBrains-Research/budget-internalization-gemma4-e2b-1k-grpo-multiseed-seed44-immunecod-s300
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
