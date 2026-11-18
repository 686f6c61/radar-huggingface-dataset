# budget-internalization-iclr2027/gemma4-e2b-2k-grpo-multiseed-seed44-realvervet-s230

## Resumen

`gemma4-e2b-2k-grpo-multiseed-seed44-realvervet-s230` es un ajuste fino por aprendizaje por refuerzo del modelo `google/gemma-4-E2B-it`, desarrollado por el grupo anónimo `budget-internalization-iclr2027` como parte de una submission a ICLR 2027. El objetivo del entrenamiento es que el modelo aprenda a resolver problemas de razonamiento matemático operando bajo un presupuesto de generación fijo de 2.048 tokens, es decir, que internalice la restricción de longitud en lugar de necesitar instrucciones explícitas para respetarla.

El modelo parte de la arquitectura Gemma 4 E2B (variante "effective 2B" de la familia Gemma 4, multimodal any-to-any) y se entrena con GRPO (Group Relative Policy Optimization) sobre el dataset DeepScaleR, un corpus de problemas matemáticos de competición. La recompensa es binaria: se extrae la respuesta de las etiquetas `\boxed{}` y se comprueba su corrección, de modo que el modelo aprende a producir cadenas de razonamiento que caben en el presupuesto y terminan con la respuesta correcta.

Este repositorio concreto es el mejor checkpoint (paso 230) de la semilla 44 dentro de un ablation de tres semillas (42, 43, 44). Su relevancia es principalmente metodológica: permite estudiar la varianza entre semillas de un mismo recipe de RL y la estabilidad del aprendizaje bajo restricciones de longitud, más que ofrecer un modelo listo para producción. El checkpoint final del paso 300 se publica en un repositorio separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, variante E2B; multimodal any-to-any) |
| Parametros totales | 5.123.178.051 (~5,12 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en F32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (hereda la licencia de google/gemma-4-E2B-it) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint instructivo `google/gemma-4-E2B-it`, perteneciente a la familia Gemma 4 en su variante E2B (aproximadamente 5,12 mil millones de parámetros reales en safetensors). La model card no detalla la arquitectura interna del modelo base más allá de su naturaleza multimodal any-to-any y su pipeline `image-text-to-text`; los detalles de atención, capas y tokenizador deben consultarse en la documentación oficial de Gemma 4.

El entrenamiento utiliza GRPO con baseline leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. Se generan 32 prompts con 8 rollouts por paso, con un presupuesto de generación fijo de `max_new_tokens = 2048`. Las respuestas que alcanzan el límite se truncan y se puntúan tal cual, lo que empuja al modelo a producir razonamientos completos dentro del presupuesto. Se usa Adam con schedule coseno, LR pico de 3e-6 y 10 pasos de warmup, sobre el dataset DeepScaleR (matemáticas) con un máximo de 3 épocas. La recompensa es binaria según la corrección de la respuesta extraída de `\boxed{}`. El prompt de entrenamiento pide razonar paso a paso y encerrar la respuesta en etiquetas `\boxed{}`. Este repositorio corresponde al paso 230, seleccionado como mejor checkpoint por precisión de validación (medida cada 10 pasos sobre 480 problemas reservados de DeepScaleR).

## Capacidades

- Generación de texto y razonamiento matemático de competición, con cadenas de razonamiento paso a paso.
- Resolución de problemas con formato de respuesta `\boxed{}` (heredado del entrenamiento).
- Razonamiento bajo restricción explícita de longitud (presupuesto de 2.048 tokens internalizado durante el RL).
- Capacidades multimodales heredadas del modelo base (pipeline any-to-any, image-text-to-text), aunque no se documenta su comportamiento tras el ajuste.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre internalización de presupuestos de tokens: el modelo sirve como artefacto experimental para estudiar si el RL enseña al modelo a respetar límites de longitud sin instrucciones explícitas, comparando con los checkpoints de las semillas 42 y 43.
- Ablation de semillas en RL: al existir tres semillas del mismo recipe (42, 43, 44), permite medir la varianza de la precisión de validación entre ejecuciones y evaluar la reproducibilidad del entrenamiento con GRPO.
- Evaluación de robustez en matemáticas: útil para probar la degradación de precisión cuando se truncan respuestas al alcanzar el límite de 2.048 tokens, un escenario realista en sistemas con presupuesto de cómputo acotado.
- Generación de soluciones matemáticas con formato verificable: el modelo produce respuestas en `\boxed{}`, lo que facilita la extracción automática y la evaluación en pipelines de corrección automática.
- Estudio de la relación entre longitud de razonamiento y precisión: al fijar el presupuesto, se puede analizar si el modelo aprende a ser más conciso o si sacrifica exactitud, comparando con el checkpoint del paso 300.
- Base para experimentos de destilación o comparación de algoritmos de RL: el checkpoint puede usarse como referencia para contrastar GRPO con otras variantes (PPO, DPO) en tareas de razonamiento matemático.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo menciona que la precisión de validación se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR, pero no proporciona los valores numéricos de dicha métrica ni resultados en MMLU, GSM8K, HumanEval u otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada para inferencia en F32: aproximadamente 20,5 GB solo para pesos (5,12 mil millones de parámetros × 4 bytes), más overhead de activaciones y KV cache; se recomienda al menos 24 GB para comodidad.
- En cuantización de 16 bits (BF16/FP16): alrededor de 10,3 GB de pesos; cabe en GPUs consumer de 16 GB o más (RTX 4080, RTX 4090, RTX 5080).
- En cuantización de 8 bits: aproximadamente 5,1 GB de pesos; cabe en GPUs de 8-12 GB (RTX 3060, RTX 4060 Ti).
- En cuantización de 4 bits: alrededor de 2,6 GB de pesos; viable en GPUs de 6-8 GB, aunque la calidad puede degradarse.
- GPU recomendadas: A100 40/80 GB, H100, L40S para servir en F32/BF16; RTX 4090 o RTX 6000 Ada para uso local en BF16.
- Opciones de despliegue: transformers (código de ejemplo en la model card), vLLM (`vllm serve`), y potencialmente llama.cpp/Ollama si se generan GGUF (no publicados en el repo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| gemma4-e2b-2k-grpo-multiseed-seed44-realvervet-s230 | ~5,12 B | no disponible | Apache 2.0 | Hugging Face | Checkpoint de ablation de semilla, RL con GRPO, presupuesto 2k |
| google/gemma-4-E2B-it | ~5,12 B (heredado) | no disponible | Apache 2.0 (Gemma 4 license) | Hugging Face | Modelo base instructivo, sin RL específico de presupuesto |
| gemma4-e2b-2k-grpo-multiseed-seed42-apttoad-s300 | ~5,12 B | no disponible | Apache 2.0 | Hugging Face | Mismo recipe, semilla 42, paso 300 |
| gemma4-e2b-2k-grpo-multiseed-seed43-casualloon-s170 | ~5,12 B | no disponible | Apache 2.0 | Hugging Face | Mismo recipe, semilla 43, mejor checkpoint |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: es un checkpoint intermedio (paso 230) de un ablation de semillas, no un modelo final optimizado para producción.
- Entrenado exclusivamente en matemáticas (DeepScaleR): puede degradar capacidades generales del modelo base fuera del dominio matemático.
- Riesgo de alucinación en razonamientos largos, especialmente cuando el modelo se aproxima al límite de 2.048 tokens y las respuestas se truncan.
- El formato de respuesta está fuertemente sesgado hacia `\boxed{}`; puede no responder bien a instrucciones que exijan otros formatos.
- Capacidades multimodales heredadas del base pero no documentadas ni evaluadas tras el ajuste; no se garantiza su funcionamiento.
- Idiomas soportados no documentados; el entrenamiento se realizó presumiblemente en inglés (DeepScaleR), lo que puede degradar el rendimiento en castellano.
- Licencia Apache 2.0 heredada, pero la model card remite a la licencia de Gemma 4 (`ai.google.dev/gemma/docs/gemma_4_license`); conviene revisar los términos de uso comercial de Gemma 4 antes de desplegar.
- Sin descargas ni likes en el momento de la consulta; sin validación comunitaria.
- Pesos en F32: el repositorio ocupa 20,5 GB, lo que encarece el almacenamiento y la inferencia frente a versiones en BF16.

## Enlaces

- Hugging Face: https://huggingface.co/budget-internalization-iclr2027/gemma4-e2b-2k-grpo-multiseed-seed44-realvervet-s230
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Checkpoint paso 300 (misma semilla): https://huggingface.co/budget-internalization-iclr2027/gemma4-e2b-2k-grpo-multiseed-seed44-realvervet-s300
- Semilla 42, paso 300: https://huggingface.co/budget-internalization-iclr2027/gemma4-e2b-2k-grpo-multiseed-seed42-apttoad-s300
- Semilla 43, paso 170: https://huggingface.co/budget-internalization-iclr2027/gemma4-e2b-2k-grpo-multiseed-seed43-casualloon-s170
- Semilla 43, paso 300: https://huggingface.co/budget-internalization-iclr2027/gemma4-e2b-2k-grpo-multiseed-seed43-casualloon-s300
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
