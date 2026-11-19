# JetBrains-Research/budget-internalization-gemma4-e2b-2k-grpo-multiseed-seed43-casualloon-s170

## Resumen

Este modelo es un ajuste fino por aprendizaje por refuerzo (RL) de `google/gemma-4-E2B-it`, desarrollado por JetBrains-Research. El objetivo concreto es internalizar un presupuesto fijo de generación de 2.048 tokens en tareas de razonamiento matemático: en lugar de dejar que el modelo decida cuánto "pensar" en tiempo de inferencia, se le entrena para que produzca su respuesta completa dentro de ese límite. El resultado es un modelo que intercambia capacidad de test-time scaling por precisión dentro del presupuesto asignado, según el artículo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*.

Se trata de un checkpoint intermedio (paso 170) de un barrido de semillas; en concreto, la semilla 43 de una receta idéntica aplicada con las semillas 42, 43 y 44. El checkpoint se seleccionó como el mejor de su ejecución según la precisión de validación medida cada 10 pasos sobre 480 problemas reservados de DeepScaleR. El modelo base es multimodal (pipeline `any-to-any`, `image-text-to-text`), con aproximadamente 5.120 millones de parámetros en pesos safetensors y licencia Apache 2.0 heredada del modelo base.

Su relevancia es metodológica: documenta de forma reproducible cómo el RL con recompensa verificable (RLVR) y presupuesto fijo afecta a la precisión, y publica los checkpoints de las tres semillas para permitir análisis de varianza. Es un artefacto de investigación, no un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4), multimodal image-text-to-text; detalles internos no disponibles |
| Parámetros totales | 5.123.178.051 (~5,12 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (presupuesto de generación entrenado: 2.048 tokens) |
| Tipos de cuantización | no disponible (pesos publicados en F32) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 (hereda la de `google/gemma-4-E2B-it`) |
| Formato de pesos | safetensors (librería transformers); dtype F32 |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E2B-it` y se ajusta con GRPO (Group Relative Policy Optimization) con baseline leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. Las respuestas que alcanzan el presupuesto de 2.048 tokens se truncan y se puntúan tal cual, lo que fuerza al modelo a resolver dentro del límite en lugar de extender la cadena de razonamiento. La recompensa es binaria: corrección de la respuesta extraída de las etiquetas `\boxed{}`.

Los datos de entrenamiento son el dataset DeepScaleR (matemáticas), con un máximo de 3 épocas. La configuración es de 32 prompts × 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 3e-6 y 10 pasos de calentamiento. Este checkpoint corresponde al paso 170 de la semilla 43. El prompt de entrenamiento pide razonamiento paso a paso y respuesta dentro de `\boxed{}`. No se documentan innovaciones arquitectónicas propias: la contribución es la receta de RL y el análisis de presupuesto, no cambios en el transformer.

## Capacidades

- Razonamiento matemático con respuesta final en formato `\boxed{}`, optimizado para un presupuesto de generación de 2.048 tokens.
- Generación de texto y razonamiento paso a paso dentro del presupuesto entrenado.
- Capacidades multimodales heredadas del modelo base (pipeline `image-text-to-text` / `any-to-any`), aunque el ajuste se centra en matemáticas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso más allá de la cadena de pensamiento: no disponible.
- Capacidades multilingües: no disponibles (idiomas no declarados).
- Modo "thinking" explícito o presupuesto dinámico: no disponible; el modelo está entrenado para presupuesto fijo.

## Casos de uso

- Evaluación de investigación sobre RLVR: reproducir el experimento de presupuesto fijo con las semillas 42, 43 y 44 para medir la varianza entre ejecuciones y validar conclusiones del artículo.
- Razonamiento matemático con latencia acotada: desplegar el modelo con `max_new_tokens=2048` en entornos donde el coste por consulta debe ser predecible, aprovechando que fue entrenado para responder dentro de ese límite.
- Generación de soluciones paso a paso para problemas de competición: útil como generador de cadenas de razonamiento con extracción automática de la respuesta vía `\boxed{}`.
- Baseline en estudios de test-time scaling: comparar este checkpoint con el modelo base sin ajustar para cuantificar la pérdida o ganancia de precisión al eliminar el escalado en inferencia.
- Destilación de datos de razonamiento: usar las salidas del modelo como corpus de cadenas de pensamiento acotadas para entrenar modelos más pequeños.
- Análisis de robustez del truncado: estudiar cómo se degradan las respuestas cuando el problema excede el presupuesto de 2.048 tokens, dado que el entrenamiento puntúa las respuestas truncadas tal cual.
- Prototipado de pipelines multimodal-matemáticos: aprovechar la herencia image-text-to-text del modelo base para experimentos que combinen imagen y razonamiento numérico, con la cautela de que el ajuste RL se hizo sobre texto matemático.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo indica que el checkpoint se seleccionó por precisión de validación sobre 480 problemas reservados de DeepScaleR, sin cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos se publican en F32 (~20,5 GB en el repositorio). En FP16/BF16 serían aproximadamente 10,2 GB; en cuantización de 8 bits, ~5,1 GB; en 4 bits, ~2,6 GB (estimaciones a partir del recuento de parámetros, no verificadas por el autor).
- GPU recomendadas: A100 o H100 para F32/BF16 sin cuantizar; RTX 4090 (24 GB) suficiente para BF16.
- GPU de consumo: cabe en GPUs con 12 GB o más en cuantización de 8 bits y en GPUs de 8 GB en 4 bits, siempre que la implementación soporte cuantización del modelo base.
- Opciones de despliegue: transformers (librería declarada); vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Gemma-4-E2B-it, GRPO 2k, semilla 43, paso 170) | ~5,12 B | no disponible | RLVR con presupuesto fijo de 2.048 tokens | Apache 2.0 | Hugging Face |
| google/gemma-4-E2B-it | no disponible | no disponible | Modelo base instruct multimodal | Gemma 4 License | Hugging Face |
| Checkpoints semilla 42 (paso 300) y semilla 44 (pasos 230 y 300) del mismo autor | ~5,12 B | no disponible | Misma receta, distinta semilla o paso | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento para comparar con alternativas de la misma categoría.

## Limitaciones y advertencias

- Es un checkpoint de investigación en un paso intermedio (170), no un modelo final; el autor publica aparte el checkpoint del paso 300.
- Entrenado exclusivamente con datos de matemáticas (DeepScaleR); el rendimiento en otras tareas puede degradarse respecto al modelo base.
- El truncado de respuestas al alcanzar los 2.048 tokens puede producir soluciones incompletas o respuestas incorrectas puntuadas como tales.
- Riesgo de alucinación inherente al modelo base; no se documentan evaluaciones de fidelidad.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados no declarados; no se garantiza un comportamiento multilingüe tras el ajuste.
- Licencia: Apache 2.0 según la model card, pero el enlace de licencia apunta a la Gemma 4 License de Google; conviene verificar los términos aplicables antes de uso comercial.
- Capacidades multimodales heredadas no han sido evaluadas tras el ajuste RL; no asumir paridad con el modelo base en visión.
- Sin métricas publicadas de benchmarks, latencia ni throughput; no recomendable para producción sin evaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-gemma4-e2b-2k-grpo-multiseed-seed43-casualloon-s170
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Checkpoint semilla 42, paso 300: https://huggingface.co/JetBrains-Research/budget-internalization-gemma4-e2b-2k-grpo-multiseed-seed42-apttoad-s300
- Checkpoint semilla 43, paso 300: https://huggingface.co/JetBrains-Research/budget-internalization-gemma4-e2b-2k-grpo-multiseed-seed43-casualloon-s300
- Checkpoint semilla 44, paso 230: https://huggingface.co/JetBrains-Research/budget-internalization-gemma4-e2b-2k-grpo-multiseed-seed44-realvervet-s230
- Checkpoint semilla 44, paso 300: https://huggingface.co/JetBrains-Research/budget-internalization-gemma4-e2b-2k-grpo-multiseed-seed44-realvervet-s300
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
