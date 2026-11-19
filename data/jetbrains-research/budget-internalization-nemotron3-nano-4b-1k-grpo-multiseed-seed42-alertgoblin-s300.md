# JetBrains-Research/budget-internalization-nemotron3-nano-4b-1k-grpo-multiseed-seed42-alertgoblin-s300

## Resumen

Este modelo es un ajuste fino por aprendizaje por refuerzo (RL) de nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16, publicado por JetBrains-Research. Su propósito es internalizar un presupuesto fijo de generación de 1.024 tokens para razonamiento matemático: en lugar de dejar que el modelo "piense" indefinidamente en tiempo de inferencia, se le entrena para resolver problemas dentro de ese límite estricto. El resultado es un checkpoint especializado en matemáticas que prioriza la precisión dentro del presupuesto frente a la escalabilidad en test-time.

El modelo forma parte de un estudio de ablación de semillas que acompaña al paper *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*. Esta variante concreta corresponde a la semilla 42, con nombre en clave `alertgoblin`, y es el checkpoint final (paso 300) de esa ejecución. El entrenamiento usa GRPO sobre el dataset DeepScaleR (matemáticas) con recompensa binaria de corrección.

Con 3.973.556.832 parámetros (~4B) y pesos en F32, es un modelo pequeño orientado a despliegues con recursos limitados donde el coste por consulta debe ser predecible. Su relevancia actual radica en la línea de investigación de "internalización de presupuesto": entrenar al modelo para que sea eficiente en tokens en lugar de depender de cadenas de pensamiento largas en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-H (según tag `nemotron_h` de transformers; detalles internos no disponibles) |
| Parametros totales | 3.973.556.832 (~4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en F32) |
| Idiomas soportados | no disponibles |
| Licencia | nvidia-nemotron-open-model-license |
| Formato de pesos | safetensors (F32) |

## Arquitectura y entrenamiento

El modelo parte de NVIDIA-Nemotron-3-Nano-4B-BF16, un transformer de ~4B parámetros etiquetado como `nemotron_h` en la librería transformers. El ajuste se realiza con GRPO (Group Relative Policy Optimization) con baseline leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. Las respuestas que alcanzan el presupuesto de 1.024 tokens se truncan y se puntúan tal cual, lo que fuerza al modelo a emitir respuestas completas dentro del límite.

Los datos de entrenamiento provienen de DeepScaleR (matemáticas), con un máximo de 3 épocas. La configuración usa lotes de 32 prompts × 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 2e-6, 10 pasos de warmup y 300 pasos totales. La recompensa es binaria: corrección de la respuesta extraída de las etiquetas `\boxed{}`. El prompt de entrenamiento pide razonamiento paso a paso y salida del resultado dentro de `\boxed{}`. La validación se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR. Los pesos se publican en F32.

## Capacidades

- Generación de texto y razonamiento matemático paso a paso.
- Resolución de problemas matemáticos con formato de respuesta `\boxed{}`.
- Razonamiento bajo presupuesto fijo de 1.024 tokens de generación (capacidad central del ajuste).
- Generación conversacional (pipeline `text-generation`, tag `conversational`).
- Compatibilidad con endpoints (`endpoints_compatible`).
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso fuera del presupuesto: no disponible.
- Capacidades multilingües: no disponibles.
- Modo thinking extendido, visión o audio: no disponibles.

## Casos de uso

- Resolución de problemas matemáticos en producción con coste predecible: el modelo está entrenado para responder dentro de 1.024 tokens, lo que permite estimar con precisión el coste por consulta y el tiempo de generación en pipelines de evaluación automática.
- Evaluación comparativa de eficiencia en tokens: útil como referencia en experimentos que miden precisión frente a longitud de cadena de pensamiento, al ser un checkpoint de una ablación de semillas reproducible.
- Tutoría matemática automatizada: puede generar soluciones paso a paso con la respuesta final en `\boxed{}`, integrándose en plataformas educativas que parsean ese formato.
- Generación de datos sintéticos de razonamiento matemático: sirve para producir trazas de solución acotadas en longitud que alimenten otros entrenamientos o evaluaciones.
- Investigación en RLVR (RL con recompensa verificable): el checkpoint y sus variantes de semilla permiten estudiar la varianza del entrenamiento GRPO en tareas matemáticas.
- Despliegue en hardware modesto: con ~4B parámetros y pesos F32, es viable en GPUs de gama alta de consumo tras cuantización, adecuado para prototipos y entornos de investigación con presupuesto limitado.
- Benchmarking de internalización de presupuesto: permite comparar la precisión "in-budget" frente a modelos que escalan en test-time, como parte de estudios de eficiencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la precisión de validación se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR, pero no incluye los valores numéricos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos F32 de ~3,97B parámetros ocupan aproximadamente 15,9 GB (tamaño del repo). En BF16 serían ~8 GB; en cuantización de 8 bits, ~4 GB; en 4 bits, ~2-3 GB (estimaciones a partir del recuento de parámetros, no publicadas por el autor).
- GPU recomendadas: A100 o H100 para inferencia en F32 sin cuantizar; RTX 4090 (24 GB) para F32 o BF16; GPUs con 8-16 GB tras cuantización.
- Cabe en GPU de consumo: sí, en RTX 4090 en F32/BF16 y en GPUs de 8-12 GB con cuantización.
- Opciones de despliegue: transformers (librería indicada), endpoints compatibles; vLLM, llama.cpp, Ollama o TGI no están confirmados para esta arquitectura en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Nemotron-3-Nano-4B, budget 1k, GRPO) | ~3,97B | no disponible | Razonamiento matemático con presupuesto fijo de 1.024 tokens | nvidia-nemotron-open-model-license | Hugging Face (JetBrains-Research) |
| nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16 | ~4B | no disponible | Modelo base generalista | nvidia-nemotron-open-model-license | Hugging Face (NVIDIA) |
| Variantes de semilla 43 y 44 del mismo recipe | ~3,97B | no disponible | Mismo ajuste con distinta semilla (ablación) | nvidia-nemotron-open-model-license | Hugging Face (JetBrains-Research) |

No se dispone de datos de rendimiento para comparar con alternativas de otros autores; la comparación se limita al modelo base y a las variantes de semilla del mismo estudio.

## Limitaciones y advertencias

- Especialización estrecha: el ajuste se centra en matemáticas (DeepScaleR) y puede degradar el rendimiento en tareas generales respecto al modelo base.
- Riesgo de alucinación: como todo modelo generativo, puede producir razonamientos plausibles pero incorrectos; la recompensa binaria de entrenamiento no elimina este riesgo.
- Truncamiento forzado: las respuestas que alcanzan los 1.024 tokens se cortan y se puntúan tal cual; problemas que requieran cadenas más largas pueden quedar sin resolver correctamente.
- Idiomas soportados no documentados: no hay información sobre capacidades multilingües.
- Longitud de contexto no documentada: se desconoce la ventana máxima de entrada.
- Licencia: hereda la nvidia-nemotron-open-model-license, con posibles restricciones para uso comercial; conviene revisar los términos antes de desplegar en producción.
- Modelo de investigación: 0 descargas y 0 likes en el momento de la consulta, sin citation completa (marcada como TODO); no hay evidencia de validación en producción.
- Pesos en F32: mayor consumo de memoria y ancho de banda que una versión BF16.
- Formato de salida específico: espera respuestas con `\boxed{}`; otros formatos pueden reducir la precisión.

## Enlaces

- Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-1k-grpo-multiseed-seed42-alertgoblin-s300
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Checkpoint s290 (misma semilla): https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-1k-grpo-multiseed-seed42-alertgoblin-s290
- Checkpoint semilla 43 (s290): https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-1k-grpo-multiseed-seed43-greatray-s290
- Checkpoint semilla 43 (s300): https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-1k-grpo-multiseed-seed43-greatray-s300
- Checkpoint semilla 44 (s240): https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-1k-grpo-multiseed-seed44-pickedguppy-s240
- Checkpoint semilla 44 (s300): https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-1k-grpo-multiseed-seed44-pickedguppy-s300
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- Paper *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*: referencia mencionada en la model card, sin enlace disponible.
