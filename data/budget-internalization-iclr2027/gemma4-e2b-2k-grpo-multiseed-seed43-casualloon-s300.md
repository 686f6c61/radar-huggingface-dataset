# budget-internalization-iclr2027/gemma4-e2b-2k-grpo-multiseed-seed43-casualloon-s300

## Resumen

`gemma4-e2b-2k-grpo-multiseed-seed43-casualloon-s300` es un ajuste fino por aprendizaje por refuerzo (GRPO) del modelo multimodal `google/gemma-4-E2B-it`. Lo publica el colectivo anónimo `budget-internalization-iclr2027` como parte de una ablación de semillas para una submission al ICLR 2027. El objetivo del entrenamiento es que el modelo resuelva problemas de razonamiento matemático dentro de un presupuesto de generación fijo de 2.048 tokens, es decir, que "internalice" la restricción de longitud en lugar de necesitar instrucciones explícitas.

El modelo hereda la arquitectura y las capacidades del Gemma 4 E2B instructivo (pipeline `any-to-any`, con entrada imagen-texto y salida de texto), y sobre él aplica una fase de RL con recompensa binaria de corrección de la respuesta extraída de las etiquetas `\boxed{}`. Esta ficha corresponde a la semilla 43 (de una ablación con semillas 42, 43 y 44) y al checkpoint final del run, el paso 300.

Es relevante ahora porque documenta una receta reproducible de RL para control de longitud de razonamiento en modelos pequeños (~5.100 millones de parámetros), un problema práctico en despliegues con latencia y coste acotados. La licencia es Apache 2.0 según los metadatos del repositorio, aunque la model card remite a la licencia de Gemma 4 de Google.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda de google/gemma-4-E2B-it); detalles internos no disponibles |
| Parámetros totales | 5.123.178.051 (~5,12 B) |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en F32) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (la model card remite a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (librería transformers); repo de 20,5 GB |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E2B-it` y se ajusta con GRPO (Group Relative Policy Optimization) usando baseline leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. Las respuestas que alcanzan el presupuesto de generación se truncan y se puntúan tal cual, lo que penaliza implícitamente las soluciones que no terminan dentro de los 2.048 tokens. La recompensa es binaria: corrección de la respuesta extraída de `\boxed{}`.

Los datos de entrenamiento son el dataset DeepScaleR (matemáticas) de `agentica-org/DeepScaleR-Preview-Dataset`, con un máximo de 3 épocas. La configuración es: batch de 32 prompts × 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 3e-6, 10 pasos de warmup y 300 pasos totales. La validación se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR. El prompt de entrenamiento pide razonamiento paso a paso y respuesta en `\boxed{}`. No se documentan innovaciones arquitectónicas propias; la contribución es la receta de RL y la ablación de semillas.

## Capacidades

- Generación de texto y razonamiento matemático paso a paso bajo un presupuesto de 2.048 tokens.
- Entrada multimodal imagen-texto (pipeline `any-to-any` heredado del modelo base).
- Razonamiento multi-paso orientado a problemas de matemáticas con formato de respuesta `\boxed{}`.
- Capacidades del modelo base instructivo (chat, instrucciones) presumiblemente conservadas; no verificadas de forma independiente.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Resolución de problemas matemáticos con coste acotado: el modelo está entrenado para terminar dentro de 2.048 tokens, lo que permite fijar latencia y coste por consulta en pipelines de evaluación automática.
- Evaluación comparativa de recetas de RL: al ser una de varias semillas y checkpoints del mismo run, sirve para estudiar varianza entre semillas en experimentos de investigación.
- Generación de soluciones con formato verificable: la salida en `\boxed{}` facilita la extracción automática de respuestas para sistemas de corrección o tutoría.
- Investigación en control de longitud de razonamiento: útil para estudiar cómo el RL internaliza restricciones de presupuesto de tokens sin prompting explícito.
- Base para ajustes posteriores en dominios matemáticos: al ser un fine-tune pequeño (~5,12 B) sobre Gemma 4, sirve como punto de partida para especializaciones adicionales.
- Prototipado en entornos con recursos limitados: el tamaño permite desplegarlo en una sola GPU de gama alta para experimentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que la precisión de validación se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR, pero no incluye los valores numéricos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con ~5,12 B parámetros, en F32 los pesos ocupan ~20,5 GB, por lo que se requiere cuantización o GPUs con suficiente memoria para inferencia práctica.
- GPU recomendadas: no disponible en la información proporcionada.
- ¿Cabe en GPU de consumo? No confirmado; dependería de la cuantización, que no está documentada.
- Opciones de despliegue: transformers (`AutoModelForCausalLM`) y vLLM (`vllm serve`), según la model card.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (gemma4-e2b-2k-grpo, seed 43) | ~5,12 B | no disponible | GRPO sobre Gemma 4 E2B-it, presupuesto 2k | apache-2.0 | Hugging Face |
| gemma4-e2b-2k-grpo seed 42 (apttoad) | ~5,12 B (misma receta) | no disponible | GRPO, semilla 42 | apache-2.0 | Hugging Face |
| gemma4-e2b-2k-grpo seed 44 (realvervet) | ~5,12 B (misma receta) | no disponible | GRPO, semilla 44 | apache-2.0 | Hugging Face |
| google/gemma-4-E2B-it (base) | ~5,12 B | no disponible | Instructivo multimodal | licencia Gemma 4 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: publicado como parte de una submission anónima al ICLR 2027, sin validación independiente.
- Especializado en matemáticas: el ajuste con DeepScaleR puede degradar capacidades generales del modelo base; no verificado.
- Riesgo de alucinación: inherente a los modelos generativos; la recompensa binaria no elimina respuestas incorrectas con formato correcto.
- Presupuesto fijo de 2.048 tokens: las respuestas que exceden el límite se truncan, lo que puede producir soluciones incompletas.
- Idiomas soportados no documentados; el entrenamiento se realizó presumiblemente en inglés (DeepScaleR).
- Licencia: los metadatos indican apache-2.0, pero la model card remite a la licencia de Gemma 4 de Google; conviene verificar las condiciones de uso comercial antes de producción.
- Sin datos de benchmarks ni de contexto máximo; no apto para decisiones de despliegue sin evaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/budget-internalization-iclr2027/gemma4-e2b-2k-grpo-multiseed-seed43-casualloon-s300
- Checkpoint seed 42: https://huggingface.co/budget-internalization-iclr2027/gemma4-e2b-2k-grpo-multiseed-seed42-apttoad-s300
- Checkpoint seed 43, paso 170: https://huggingface.co/budget-internalization-iclr2027/gemma4-e2b-2k-grpo-multiseed-seed43-casualloon-s170
- Checkpoint seed 44, paso 230: https://huggingface.co/budget-internalization-iclr2027/gemma4-e2b-2k-grpo-multiseed-seed44-realvervet-s230
- Checkpoint seed 44, paso 300: https://huggingface.co/budget-internalization-iclr2027/gemma4-e2b-2k-grpo-multiseed-seed44-realvervet-s300
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Dataset: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
