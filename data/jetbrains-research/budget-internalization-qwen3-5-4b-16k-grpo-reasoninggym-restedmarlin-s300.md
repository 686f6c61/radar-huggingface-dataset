# JetBrains-Research/budget-internalization-qwen3.5-4b-16k-grpo-reasoninggym-restedmarlin-s300

## Resumen

Este modelo es un ajuste fino por aprendizaje por refuerzo (RL) del modelo base Qwen/Qwen3.5-4B, desarrollado por JetBrains-Research. Se ha entrenado con el algoritmo GRPO sobre tareas de Reasoning Gym bajo un presupuesto fijo de generación de 16.384 tokens. El objetivo es la "internalización de presupuesto": el modelo aprende a razonar dentro de un límite de tokens predefinido, en lugar de depender del escalado en tiempo de inferencia (test-time scaling) para mejorar su precisión. Las respuestas que agotan el presupuesto reciben recompensa cero, lo que fuerza al modelo a producir razonamientos completos y eficientes dentro del margen asignado.

El checkpoint publicado corresponde al paso 300 de entrenamiento, con el identificador de ejecución `restedmarlin`. Es un modelo multimodal de tipo imagen-texto-a-texto, con 4.659.865.088 parámetros totales en pesos safetensors (BF16) y un repositorio de 9,3 GB. Hereda la licencia Apache 2.0 del modelo base.

Su relevancia radica en que aborda un problema práctico de producción: los modelos de razonamiento que generan cadenas de pensamiento largas incrementan coste y latencia. Este ajuste demuestra que es posible entrenar con RL para que el modelo sea preciso dentro de un presupuesto acotado, lo que resulta directamente aplicable a despliegues con restricciones de cómputo o latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (imagen-texto-a-texto), derivada de Qwen3.5-4B; detalles internos no disponibles |
| Parametros totales | 4.659.865.088 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el presupuesto de generación entrenado es de 16.384 tokens) |
| Tipos de cuantizacion | No disponibles en la información proporcionada; pesos publicados en BF16 |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer multimodal de aproximadamente 4,66 mil millones de parámetros. El ajuste se realiza con GRPO (Group Relative Policy Optimization) con baseline leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. La innovación central es el presupuesto fijo de generación: `max_new_tokens` se fija en 16.384 y cualquier respuesta que alcanza ese límite recibe recompensa cero. Esto penaliza implícitamente las cadenas de razonamiento excesivamente largas y premia la resolución correcta dentro del margen.

Los datos de entrenamiento son tareas de Reasoning Gym, problemas de razonamiento generados de forma procedural con respuestas en formato `\boxed{}`. Se realizan como máximo 3 épocas. La configuración de entrenamiento incluye lotes de 32 prompts con 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 5e-7 y 10 pasos de calentamiento, durante 300 pasos. La recompensa proviene del verificador de cada tarea de Reasoning Gym aplicado sobre la respuesta delimitada en `\boxed{}`. Los prompts se renderizan con la plantilla de chat del modelo base. No se documenta composición exacta del dataset, número total de tokens de entrenamiento ni uso de DPO o RLHF adicional más allá del GRPO descrito.

## Capacidades

- Generación de texto y razonamiento multi-paso, con énfasis en resolver problemas dentro de un presupuesto de tokens acotado.
- Razonamiento matemático y lógico verificado mediante tareas de Reasoning Gym (respuestas en `\boxed{}`).
- Procesamiento de entrada multimodal imagen-texto (pipeline image-text-to-text), heredado del modelo base.
- Generación conversacional mediante la plantilla de chat del modelo base.
- Capacidad de razonamiento eficiente: el entrenamiento con recompensa cero al agotar presupuesto favorece cadenas de pensamiento más cortas y resolutivas.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes o multi-step tool use: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Razonamiento matemático en producción con latencia acotada: el modelo está entrenado para resolver problemas dentro de 16.384 tokens, lo que permite fijar un límite duro de generación y evitar respuestas que se alargan indefinidamente en pipelines de resolución de problemas.
- Evaluación de modelos de razonamiento bajo restricciones de presupuesto: sirve como referencia para estudiar el compromiso entre escalado en tiempo de inferencia y precisión dentro de presupuesto, tal como plantea el paper asociado.
- Generación de soluciones verificables con formato estructurado: el entrenamiento con respuestas en `\boxed{}` lo hace adecuado para tareas donde la respuesta final debe extraerse de forma automática por un verificador.
- Investigación en RL aplicado a LLM: el checkpoint (paso 300, run `restedmarlin`) es útil para reproducir o comparar configuraciones de GRPO con presupuesto fijo en tareas de razonamiento procedural.
- Asistente conversacional con razonamiento controlado: al heredar la plantilla de chat del modelo base, puede integrarse en aplicaciones conversacionales donde se requiera razonamiento acotado antes de responder.
- Procesamiento de entradas imagen-texto: al ser un modelo image-text-to-text, puede emplearse en tareas que combinen una imagen con una consulta textual y requieran razonamiento sobre el contenido visual, aunque no se documentan evaluaciones específicas de esta capacidad en el ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,3 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 16-24 GB para contextos largos.
- VRAM estimada en cuantización de 8 bits: alrededor de 5-6 GB de pesos; en 4 bits, alrededor de 3 GB, más overhead (estimaciones orientativas, no verificadas en la información proporcionada).
- GPU recomendadas: A100, H100 o L40S para despliegue en BF16 con contexto largo; RTX 4090 (24 GB) viable en BF16 con gestión cuidadosa de memoria.
- GPU de consumo: cabe en RTX 4090 en BF16; en GPUs de 12-16 GB requiere cuantización.
- Opciones de despliegue: transformers (librería declarada); vLLM, llama.cpp, Ollama o TGI no se mencionan explícitamente en la información, aunque al ser safetensors y transformers son opciones plausibles previa conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (budget-internalization Qwen3.5-4B) | 4,66 B | No disponible (presupuesto de generación 16.384) | GRPO sobre Reasoning Gym con presupuesto fijo | Apache 2.0 | Hugging Face (JetBrains-Research) |
| Qwen/Qwen3.5-4B (base) | 4,66 B | No disponible | Preentrenamiento y alineamiento del autor original | Apache 2.0 (según herencia declarada) | Hugging Face |
| Alternativas de razonamiento de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: el checkpoint corresponde a un paso intermedio (300) de un experimento de RL; no se documenta una evaluación exhaustiva fuera de las tareas de Reasoning Gym.
- Riesgo de sobreajuste al formato: el entrenamiento con respuestas en `\boxed{}` puede sesgar al modelo hacia ese formato y degradar su comportamiento en tareas abiertas o conversacionales no estructuradas.
- Sesgos: no documentados en la información proporcionada; al heredar el modelo base, puede arrastrar los sesgos de este.
- Alucinación: no se han publicado evaluaciones específicas de tasa de alucinación para este ajuste.
- Idiomas: no se especifica cobertura multilingüe; el comportamiento fuera del inglés (idioma predominante en Reasoning Gym) es incierto.
- Presupuesto de generación: el entrenamiento asume 16.384 tokens; usarlo con presupuestos muy distintos puede reducir el beneficio del ajuste.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.5-4B, de las que este hereda.
- La model card incluye una sección de citación marcada como "TODO", por lo que la referencia bibliográfica del paper no está completa en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-16k-grpo-reasoninggym-restedmarlin-s300
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper asociado: *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy* (enlace no disponible en la información proporcionada)
- Repositorio de Reasoning Gym: no disponible en la información proporcionada
- Organización JetBrains-Research en Hugging Face: https://huggingface.co/JetBrains-Research
