# JetBrains-Research/budget-internalization-qwen3.5-4b-2k-grpo-spreadsheet-happyraven-s100

## Resumen

El modelo `budget-internalization-qwen3.5-4b-2k-grpo-spreadsheet-happyraven-s100` es un ajuste fino por refuerzo (RL) del modelo base Qwen/Qwen3.5-4B, desarrollado por JetBrains-Research. Se entrena mediante GRPO sobre tareas de manipulación de hojas de cálculo del conjunto ExcelForum, con un presupuesto fijo de generación de 2.048 tokens. El objetivo del trabajo es la "internalización de presupuesto": que el modelo aprenda a resolver tareas de razonamiento dentro de un límite de tokens fijo, en lugar de depender del escalado en tiempo de inferencia (test-time scaling).

Con 4.659.865.088 parámetros reales (aproximadamente 4,66 mil millones) y pesos en BF16, el modelo se distribuye como un checkpoint de un solo paso (step 100) de un run identificado como `happyraven`. Es relevante para quienes investigan RLVR (RL con recompensas verificables), control del gasto de tokens en producción y agentes que operan sobre hojas de cálculo, ya que demuestra cómo un presupuesto fijo de generación puede internalizarse mediante entrenamiento por refuerzo en lugar de imponerse externamente en inferencia.

La arquitectura subyacente es la del Qwen3.5-4B, un transformer multimodal (pipeline `image-text-to-text`) con licencia Apache 2.0. El modelo se publica bajo la misma licencia que su base y está pensado como artefacto de investigación más que como modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda Qwen3.5-4B; pipeline `image-text-to-text`) |
| Parámetros totales | 4.659.865.088 (~4,66 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (presupuesto de generación entrenado: 2.048 tokens) |
| Tipos de cuantización | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3.5-4B) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer multimodal de aproximadamente 4,66 mil millones de parámetros. Sobre esa base se aplica un ajuste fino con GRPO (Group Relative Policy Optimization) con baseline leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. El entrenamiento se realizó sobre tareas de manipulación de hojas de cálculo de ExcelForum, con un máximo de 10 épocas, lotes de 32 prompts × 8 rollouts por paso, optimizador Adam con schedule coseno y LR pico de 5e-7, 10 pasos de warmup y un total de 100 pasos. La recompensa proviene de un checker de tarea que evalúa la hoja de cálculo producida.

La innovación central es el presupuesto fijo de generación: `max_new_tokens` se fija en 2.048 durante el entrenamiento, de modo que la política aprende a operar dentro de ese límite en lugar de beneficiarse de cadenas de razonamiento arbitrariamente largas. Los prompts son los de las tareas de ExcelForum, renderizados con la plantilla de chat del modelo base. Los pesos se publican en BF16 y el checkpoint corresponde al paso 100 del run `happyraven`.

## Capacidades

- Generación de texto y razonamiento multi-paso dentro de un presupuesto fijo de 2.048 tokens.
- Manipulación de hojas de cálculo: interpretación de tareas ExcelForum y producción de hojas de cálculo resultantes evaluables por un checker.
- Razonamiento con presupuesto internalizado: el modelo ha sido entrenado para resolver tareas sin depender de test-time scaling.
- Procesamiento de imagen y texto (heredado del pipeline `image-text-to-text` del modelo base).
- Conversación multi-turno (tag `conversational`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso general: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Automatización de tareas de hoja de cálculo: el modelo recibe el enunciado de una tarea ExcelForum y produce una hoja de cálculo modificada, evaluable por un checker; es adecuado porque ha sido entrenado específicamente con esa recompensa.
- Investigación en RLVR: sirve como checkpoint de referencia para estudiar cómo el entrenamiento con presupuesto fijo afecta a la precisión dentro del presupuesto frente al escalado en inferencia.
- Control de coste de tokens en producción: al haber internalizado un límite de 2.048 tokens de generación, permite presupuestar latencia y coste por petición con mayor previsibilidad en tareas de razonamiento acotado.
- Evaluación comparativa de estrategias de asignación de presupuesto: útil para contrastar modelos entrenados con presupuesto fijo frente a modelos que dependen de cadenas de razonamiento largas.
- Procesamiento de documentos con componente visual: al heredar el pipeline `image-text-to-text`, puede emplearse en tareas que combinen imagen y texto, como la interpretación de capturas de hojas de cálculo.
- Prototipado de agentes sobre herramientas ofimáticas: como base para pipelines que transforman datos tabulares a partir de instrucciones en lenguaje natural, sujeto a validación externa de resultados.
- Fine-tuning posterior: al ser un checkpoint pequeño (~4,66 B) con licencia Apache 2.0, puede servir de punto de partida para ajustes adicionales en dominios tabulares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos BF16 (~9,3 GB de repositorio), se requieren aproximadamente 10-12 GB de VRAM solo para pesos; en cuantización de 8 bits, en torno a 5-6 GB; en 4 bits, en torno a 3-4 GB (estimaciones, no confirmadas por el autor).
- GPU recomendadas: A100, H100 o L40S para inferencia en BF16 con margen para contexto y lotes; RTX 4090 (24 GB) suficiente para BF16 en una sola GPU.
- GPU de consumo: cabe en RTX 4090 y en GPUs de 16 GB con cuantización; en 8 GB requiere cuantización agresiva (4 bits) y contexto reducido.
- Opciones de despliegue: transformers (librería declarada), vLLM, TGI y llama.cpp/Ollama si se generan conversiones GGUF (no publicadas en el repositorio).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| budget-internalization-qwen3.5-4b-2k-grpo-spreadsheet-happyraven-s100 | ~4,66 B | no disponible (presupuesto de generación 2.048) | GRPO sobre ExcelForum, presupuesto fijo | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (base) | ~4,66 B | no disponible | preentrenamiento + post-entrenamiento del autor original | Apache 2.0 | Hugging Face |
| Alternativas de ~4 B con RLVR para razonamiento | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables adicionales en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint de investigación (paso 100 de un único run) sin model card completa ni citation; no hay evaluación publicada de calidad general.
- El entrenamiento se limita a tareas de hojas de cálculo de ExcelForum; el rendimiento fuera de ese dominio no está caracterizado.
- El presupuesto fijo de 2.048 tokens puede degradar tareas que requieran cadenas de razonamiento más largas.
- Riesgo de alucinación: no evaluado en la información disponible; en tareas tabulares, los resultados deben validarse con un checker externo.
- Sesgos conocidos: no documentados; hereda los del modelo base Qwen3.5-4B.
- Idiomas soportados: no disponibles; no se garantiza un comportamiento multilingüe específico.
- Licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones y avisos del modelo base.
- No se publican conversiones GGUF ni recetas de cuantización; el despliegue eficiente requiere trabajo adicional.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-2k-grpo-spreadsheet-happyraven-s100
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper citado (referencia en la model card, sin enlace): *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*
- Repositorio, demo o blog adicionales: no disponibles en la información proporcionada.
