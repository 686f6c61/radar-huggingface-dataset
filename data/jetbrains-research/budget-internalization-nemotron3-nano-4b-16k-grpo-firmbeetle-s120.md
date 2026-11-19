# JetBrains-Research/budget-internalization-nemotron3-nano-4b-16k-grpo-firmbeetle-s120

## Resumen

El modelo `budget-internalization-nemotron3-nano-4b-16k-grpo-firmbeetle-s120` es un ajuste fino por aprendizaje por refuerzo (RL) del modelo base `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16`, desarrollado por JetBrains-Research. Su objetivo es internalizar un presupuesto fijo de generación de 16.384 tokens para tareas de razonamiento matemático, de modo que el modelo aprenda a producir respuestas correctas dentro de ese límite sin necesidad de escalado en tiempo de inferencia (test-time scaling). Se enmarca en el artículo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*.

El modelo parte de la arquitectura Nemotron-3 Nano de NVIDIA, con 3.973.556.832 parámetros totales (aproximadamente 4B) y pesos en formato safetensors. El entrenamiento emplea GRPO sobre el dataset DeepScaleR (matemáticas) con recompensa binaria de corrección de la respuesta extraída de etiquetas `\boxed{}`. El checkpoint publicado corresponde al paso 120 de un plan de 300, por lo que se trata de una ejecución detenida antes de completar el barrido de presupuestos.

Es relevante porque explora una dirección concreta: sustituir el escalado de cómputo en inferencia (generar cadenas más largas para mejorar la precisión) por un condicionamiento del presupuesto durante el entrenamiento. El resultado es un modelo de 4B orientado a matemáticas que intenta ser preciso dentro de un límite fijo de tokens, lo que reduce coste y latencia en despliegues de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-3 Nano (familia `nemotron_h`, transformer; detalles internos no disponibles) |
| Parametros totales | 3.973.556.832 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (presupuesto de generación de 16.384 tokens; contexto de entrada no especificado) |
| Tipos de cuantizacion | no disponible (pesos publicados en F32) |
| Idiomas soportados | no disponible |
| Licencia | nvidia-nemotron-open-model-license |
| Formato de pesos | safetensors (dtype F32) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16`, etiquetada como `nemotron_h` en Hugging Face y con código personalizado (`custom_code`). No se detallan en la información disponible el número de capas, la dimensión oculta, el tipo de atención ni la composición exacta del dataset de preentrenamiento del modelo base.

El ajuste fino se realiza con GRPO (Group Relative Policy Optimization) con baseline leave-one-out, normalización del reward por grupo y pérdida a nivel de token. Las respuestas que alcanzan el presupuesto de 16.384 tokens se truncan y se puntúan tal cual. Se entrena sobre DeepScaleR (matemáticas) hasta 3 épocas, con batch de 32 prompts × 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 5e-7 y 10 pasos de warmup. La recompensa es binaria según la corrección de la respuesta extraída de `\boxed{}`. El checkpoint publicado corresponde al paso 120 de 300 previstos; el resto del barrido de presupuestos se publica en el paso 300.

## Capacidades

- Generación de texto y razonamiento paso a paso orientado a problemas matemáticos.
- Razonamiento matemático con formato de respuesta `\boxed{}` (entrenado explícitamente para ello).
- Condicionamiento por presupuesto: el modelo está entrenado para operar dentro de un límite fijo de 16.384 tokens de generación.
- Conversacional: soporta el template de chat del modelo base.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible explícitamente; el razonamiento paso a paso es inherente al entrenamiento matemático.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (visión, audio, thinking mode explícito): no disponibles.

## Casos de uso

- Resolución de problemas matemáticos con presupuesto acotado: el modelo está entrenado para producir respuestas correctas dentro de 16.384 tokens, lo que permite desplegarlo con un límite de generación fijo y coste predecible en entornos de evaluación o tutoría matemática.
- Evaluación de pipelines de RLVR: sirve como referencia para estudiar cómo afecta la internalización del presupuesto a la precisión dentro del límite frente al escalado en tiempo de inferencia.
- Generación de soluciones con formato verificable: la extracción de `\boxed{}` facilita el parseo automático de respuestas en sistemas de corrección automática de ejercicios.
- Investigación en razonamiento con presupuesto fijo: útil para comparar checkpoints del barrido (paso 120 frente a paso 300) y analizar la relación entre pasos de entrenamiento y precisión dentro del presupuesto.
- Prototipado de asistentes matemáticos de bajo coste: con ~4B parámetros, es viable en infraestructura modesta para tareas de razonamiento acotado.
- Base para ajustes posteriores en dominios STEM: al estar afinado sobre DeepScaleR, puede servir como punto de partida para RL adicional en otras áreas con presupuesto controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 3.973.556.832 parámetros, en F32 (formato publicado) se requerirían aproximadamente 15,9 GB solo para pesos, más overhead de activaciones y KV cache; en cuantizaciones de 16 bits o 8 bits el requisito sería sustancialmente menor, pero no se confirman cuantizaciones publicadas.
- GPU recomendadas: no disponible en la información proporcionada.
- Viabilidad en GPU de consumo: no confirmada; por tamaño (~4B) podría caber en GPUs de consumo con cuantización, pero no hay datos oficiales.
- Opciones de despliegue: `transformers` (librería indicada, con `custom_code`); otras opciones como vLLM, llama.cpp, Ollama o TGI no están confirmadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| budget-internalization-nemotron3-nano-4b-16k-grpo-firmbeetle-s120 | 3.973.556.832 | no disponible (presupuesto de generación 16.384) | RL (GRPO) para matemáticas con presupuesto fijo | nvidia-nemotron-open-model-license | Hugging Face |
| nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16 (base) | ~4B | no disponible | Modelo base generalista | nvidia-nemotron-open-model-license | Hugging Face |
| Otros checkpoints del barrido de presupuestos (paso 300) | ~4B | no disponible | Misma metodología, más pasos | nvidia-nemotron-open-model-license | Hugging Face (según model card) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint incompleto: el entrenamiento se detuvo en el paso 120 de 300, por lo que su rendimiento puede ser inferior al de los checkpoints del barrido publicados en el paso 300.
- Especialización estrecha: entrenado sobre DeepScaleR (matemáticas) con recompensa binaria de respuesta; su comportamiento fuera de ese dominio no está caracterizado.
- Riesgo de alucinación: no evaluado en la información disponible; el formato `\boxed{}` no garantiza corrección del razonamiento.
- Sesgos: no documentados.
- Idiomas: no especificados; el template de chat y los prompts de entrenamiento están en inglés.
- Licencia: hereda la nvidia-nemotron-open-model-license, con posibles restricciones para uso comercial; debe revisarse el enlace de licencia antes de producción.
- Presupuesto fijo: las respuestas que alcanzan los 16.384 tokens se truncan y puntúan tal cual, lo que puede penalizar problemas que requieran cadenas más largas.
- Sin datos de benchmarks publicados ni de latencia/throughput, lo que limita la comparación objetiva con alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-nemotron3-nano-4b-16k-grpo-firmbeetle-s120
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
