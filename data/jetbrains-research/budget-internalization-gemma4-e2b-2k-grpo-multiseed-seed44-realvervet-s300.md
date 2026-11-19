# JetBrains-Research/budget-internalization-gemma4-e2b-2k-grpo-multiseed-seed44-realvervet-s300

## Resumen

Este modelo es un ajuste fino por aprendizaje por refuerzo de `google/gemma-4-E2B-it`, desarrollado por JetBrains-Research. El objetivo concreto es internalizar un presupuesto fijo de generación de 2.048 tokens para razonamiento matemático: en lugar de dejar que el modelo decida cuánto "pensar" en tiempo de inferencia, el entrenamiento GRPO le enseña a producir soluciones correctas dentro de ese límite. Forma parte del paper *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*.

El modelo base es un Gemma 4 de la variante E2B (aproximadamente 5.123 millones de parámetros totales según los pesos en safetensors, con arquitectura multimodal any-to-any y pipeline image-text-to-text). Se entrena sobre el dataset DeepScaleR (matemáticas) con recompensa binaria de corrección de respuesta extraída de etiquetas `\boxed{}`.

Este repositorio concreto es la semilla 44 de un ablation de tres semillas (42, 43, 44), y corresponde al checkpoint final del paso 300 de un run denominado `realvervet`. Su interés es metodológico: permite reproducir y comparar la variabilidad entre semillas del mismo recetario de RL, y evaluar si el modelo mantiene precisión cuando se le fuerza a un presupuesto de tokens fijo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4, variante E2B); detalles internos de capas y atención no disponibles |
| Parametros totales | 5.123.178.051 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el presupuesto de generación entrenado es de 2.048 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en F32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (hereda la licencia de Gemma 4; enlace a la licencia de Google en la model card) |
| Formato de pesos | safetensors (dtype F32) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E2B-it`, un transformer multimodal con pipeline any-to-any (entrada y salida de imagen y texto). No se documentan en la información disponible detalles sobre el número de capas, tipo de atención, vocabulario ni composición exacta del corpus de preentrenamiento del modelo base.

El ajuste fino se realiza con GRPO (Group Relative Policy Optimization) con baseline leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. La recompensa es binaria: se extrae la respuesta de las etiquetas `\boxed{}` y se compara con la solución de referencia. Se entrenan 300 pasos con batch de 32 prompts × 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 3e-6 y 10 pasos de warmup. El presupuesto de generación se fija en `max_new_tokens = 2048`; las respuestas que alcanzan el límite se truncan y se puntúan tal cual, lo que fuerza al modelo a internalizar el presupuesto en lugar de depender de un escalado en tiempo de test. Los datos son DeepScaleR (matemáticas), con un máximo de 3 épocas. La validación se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR.

## Capacidades

- Razonamiento matemático con formato de respuesta `\boxed{}` y cadena de pensamiento paso a paso.
- Generación de texto y razonamiento de múltiples pasos bajo un presupuesto fijo de 2.048 tokens de generación.
- Capacidades multimodales heredadas del modelo base: pipeline any-to-any e image-text-to-text.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso autónomo: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo de pensamiento (thinking): no disponible como capacidad explícita; el entrenamiento usa un prompt de "Let's think step-by-step".

## Casos de uso

- Evaluación de robustez de RL en matemáticas: reproducir la semilla 44 y comparar con las semillas 42 y 43 del mismo recetario para medir la varianza entre semillas en precisión de validación sobre DeepScaleR.
- Razonamiento matemático con latencia acotada: usar el modelo con `max_new_tokens=2048` en servicios donde el coste por consulta debe ser predecible, aprovechando la internalización del presupuesto.
- Generación de soluciones paso a paso con formato verificable: integrar la extracción de `\boxed{}` en un pipeline de corrección automática de problemas matemáticos.
- Investigación en RLVR (RL con recompensa verificable): servir como punto de comparación frente al modelo base sin ajuste para estudiar el efecto del GRPO con recompensa binaria.
- Prototipado de asistentes matemáticos multimodales: aprovechar el pipeline image-text-to-text del modelo base para problemas con enunciados en imagen, sujeto a validación empírica.
- Ablation de hiperparámetros: reutilizar el checkpoint del paso 300 como referencia para estudiar el efecto del número de pasos (existen checkpoints en el paso 170 y 230 en otros repositorios de la misma familia).
- Docencia e investigación reproducible: analizar cómo un presupuesto fijo de tokens afecta a la precisión frente a estrategias de test-time scaling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la precisión de validación se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR, pero no se incluyen los valores numéricos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 5.123 millones de parámetros en F32, los pesos ocupan aproximadamente 20,5 GB; en BF16/FP16 bajaría a unos 10,2 GB y en cuantización de 8 bits a unos 5,1 GB (estimaciones teóricas, no verificadas en la información disponible).
- GPU recomendadas: no disponibles de forma explícita; por tamaño, una GPU con 24 GB o más (RTX 4090, A100 40 GB, H100) permitiría inferencia en FP16/BF16 sin cuantizar.
- ¿Cabe en GPU consumer? Sí, previsiblemente en tarjetas de 16-24 GB con cuantización de 8 bits o inferior; en F32 requeriría 24 GB o más.
- Opciones de despliegue: `transformers` (librería declarada); vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| budget-internalization-gemma4-e2b-2k-grpo-multiseed-seed44-realvervet-s300 (este) | 5.123.178.051 | no disponible | GRPO, presupuesto 2.048 tokens, 300 pasos, semilla 44 | Apache 2.0 | Hugging Face |
| budget-internalization-gemma4-e2b-2k-grpo-multiseed-seed42-apttoad-s300 | mismo base | no disponible | GRPO, presupuesto 2.048 tokens, 300 pasos, semilla 42 | Apache 2.0 | Hugging Face |
| budget-internalization-gemma4-e2b-2k-grpo-multiseed-seed43-casualloon-s300 | mismo base | no disponible | GRPO, presupuesto 2.048 tokens, 300 pasos, semilla 43 | Apache 2.0 | Hugging Face |
| google/gemma-4-E2B-it (base) | 5.123.178.051 (según este repo) | no disponible | Ajuste instructivo del modelo base | Licencia Gemma 4 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en matemáticas (DeepScaleR) y su rendimiento fuera de ese dominio no está documentado; puede degradarse en tareas generales respecto al modelo base.
- El entrenamiento fuerza un presupuesto de 2.048 tokens de generación; respuestas truncadas se puntúan tal cual, lo que puede producir soluciones incompletas si el problema exige más longitud.
- Riesgo de alucinación inherente a los modelos de lenguaje; la recompensa binaria no elimina errores de razonamiento plausibles.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; no se garantiza un comportamiento multilingüe equivalente al del modelo base.
- Licencia: Apache 2.0 según la model card, pero hereda la licencia de Gemma 4 de Google; conviene revisar los términos de uso comercial de dicha licencia antes de desplegar en producción.
- Es un checkpoint de investigación (paso 300 de un ablation de semillas), sin citation publicada (la sección de cita está marcada como TODO); no se recomienda como modelo de producción sin evaluación propia.
- Pesos en F32: mayor huella de memoria y menor throughput que una versión en BF16.
- No hay información sobre tool calling, agentes ni contexto máximo, lo que limita su uso en pipelines de agentes.

## Enlaces

- Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-gemma4-e2b-2k-grpo-multiseed-seed44-realvervet-s300
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Dataset: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Checkpoint semilla 42, paso 300: https://huggingface.co/JetBrains-Research/budget-internalization-gemma4-e2b-2k-grpo-multiseed-seed42-apttoad-s300
- Checkpoint semilla 43, paso 170: https://huggingface.co/JetBrains-Research/budget-internalization-gemma4-e2b-2k-grpo-multiseed-seed43-casualloon-s170
- Checkpoint semilla 43, paso 300: https://huggingface.co/JetBrains-Research/budget-internalization-gemma4-e2b-2k-grpo-multiseed-seed43-casualloon-s300
- Checkpoint semilla 44, paso 230: https://huggingface.co/JetBrains-Research/budget-internalization-gemma4-e2b-2k-grpo-multiseed-seed44-realvervet-s230
