# JetBrains-Research/budget-internalization-qwen3.5-4b-4k-grpo-reasoninggym-easyturkey-s300

## Resumen

El modelo `budget-internalization-qwen3.5-4b-4k-grpo-reasoninggym-easyturkey-s300` es un ajuste fino por aprendizaje por refuerzo (RL) del modelo base Qwen/Qwen3.5-4B, desarrollado por JetBrains-Research. Se ha entrenado con el algoritmo GRPO sobre tareas de Reasoning Gym bajo un presupuesto de generación fijo de 4.096 tokens, y se publica junto al artículo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*. El objetivo es que el modelo interiorice ese límite de tokens y produzca respuestas correctas dentro del presupuesto, en lugar de depender de un escalado en tiempo de inferencia.

Con 4.659.865.088 parámetros (aproximadamente 4,66 mil millones), es un modelo multimodal de tipo image-text-to-text construido sobre la arquitectura Qwen3.5, con pesos en BF16 y un repositorio de 9,3 GB. Su relevancia actual radica en que aborda un problema práctico de producción: cómo obtener precisión en razonamiento cuando el coste de inferencia está acotado por un número fijo de tokens, algo habitual en entornos con latencia y presupuesto estrictos.

La licencia es Apache 2.0, heredada del modelo base, lo que facilita su uso comercial. Es un checkpoint intermedio (paso 300) de un run de investigación identificado con el nombre en clave `easyturkey`, con 0 descargas y 0 likes en el momento de la consulta, lo que indica que se trata de un artefacto de investigación reciente y no de un modelo ampliamente adoptado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Qwen3.5 (image-text-to-text) |
| Parametros totales | 4.659.865.088 (~4,66 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (presupuesto de generación de 4.096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer multimodal de tipo image-text-to-text, y se ajusta mediante GRPO (Group Relative Policy Optimization) con línea base leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. El entrenamiento se realizó sobre tareas de Reasoning Gym, que genera problemas de razonamiento de forma procedural con respuestas en formato `\boxed{}`, durante un máximo de 3 épocas y 300 pasos. La configuración usa lotes de 32 prompts con 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 5e-7 y 10 pasos de calentamiento. Los prompts son los de Reasoning Gym renderizados con la plantilla de chat del modelo base.

La innovación técnica central es la internalización de presupuesto: durante el entrenamiento se fija `max_new_tokens` en 4.096 y las respuestas que alcanzan ese límite reciben recompensa cero. La recompensa proviene del verificador de tareas de Reasoning Gym aplicado sobre la respuesta en `\boxed{}`. Este esquema de RLVR (RL con recompensas verificables) bajo presupuesto fijo busca que el modelo aprenda a razonar de forma eficiente dentro del límite, en lugar de mejorar mediante un mayor escalado en tiempo de prueba.

## Capacidades

- Generación de texto y razonamiento multi-paso sobre problemas estructurados de Reasoning Gym.
- Razonamiento matemático y lógico con respuestas verificables en formato `\boxed{}`.
- Procesamiento multimodal image-text-to-text, heredado de la arquitectura Qwen3.5.
- Razonamiento bajo restricción de presupuesto: entrenado para producir respuestas correctas dentro de 4.096 tokens de generación.
- Conversación multi-turno mediante la plantilla de chat del modelo base.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning autónomo: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Razonamiento con latencia acotada: el modelo está entrenado para operar dentro de 4.096 tokens de generación, por lo que encaja en servicios donde cada respuesta debe completarse en un presupuesto de cómputo fijo y predecible.
- Evaluación de investigación en RLVR: sirve como checkpoint de referencia para estudiar cómo el ajuste con presupuesto fijo afecta a la precisión dentro del presupuesto frente al escalado en tiempo de prueba.
- Resolución de problemas matemáticos y lógicos verificables: las tareas de Reasoning Gym con respuestas `\boxed{}` permiten integrar el modelo en pipelines de evaluación automática con verificación programática.
- Generación de soluciones paso a paso en entornos educativos: el formato de respuesta estructurada facilita la corrección automática de ejercicios de razonamiento.
- Experimentos de destilación o comparación de políticas: al ser un checkpoint intermedio del paso 300, es útil para analizar la evolución del comportamiento durante el entrenamiento GRPO.
- Prototipado multimodal con Qwen3.5: al heredar la arquitectura image-text-to-text, puede emplearse en tareas que combinen imagen y texto, aunque la información disponible no detalla el rendimiento en esa modalidad.
- Base para ajustes posteriores: al estar bajo Apache 2.0 y en safetensors BF16, puede servir como punto de partida para fine-tuning específico de dominio con presupuesto de tokens controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,3 GB solo para pesos (4,66 mil millones de parámetros × 2 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: alrededor de 4,7 GB para pesos; en 4 bits, alrededor de 2,3 GB, aunque no se publican cuantizaciones oficiales.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cabría en GPUs de 16 GB o más en BF16 (por ejemplo, RTX 4090, A100 40 GB, H100) y en GPUs consumer de 8-12 GB con cuantización.
- Cabe en GPU consumer: sí, en BF16 en GPUs de 16 GB o más; con cuantización, en GPUs de 8 GB o más.
- Opciones de despliegue: transformers (librería indicada en la model card); vLLM, llama.cpp, Ollama o TGI no se mencionan en la información disponible.
- Latencia y throughput estimados: no disponible en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| budget-internalization-qwen3.5-4b-4k-grpo-reasoninggym-easyturkey-s300 | ~4,66 mil millones | no disponible (presupuesto de generación 4.096 tokens) | Apache 2.0 | Ajuste GRPO sobre Qwen3.5-4B con presupuesto fijo de 4k tokens |
| Qwen/Qwen3.5-4B (modelo base) | ~4,66 mil millones | no disponible | Apache 2.0 | Modelo base multimodal sin el ajuste de internalización de presupuesto |
| Alternativas de razonamiento de ~4B | no disponible | no disponible | no disponible | No se dispone de datos de benchmarks ni de modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 300) de un run de investigación; no se presenta como un modelo final pulido para producción.
- No se han publicado resultados de benchmarks, por lo que no es posible cuantificar su precisión frente al modelo base ni frente a alternativas.
- El entrenamiento se limita a tareas de Reasoning Gym; el comportamiento fuera de esa distribución (por ejemplo, código, diálogo abierto o tareas multimodales complejas) no está caracterizado.
- El presupuesto de generación de 4.096 tokens es una restricción de entrenamiento; respuestas que lo alcanzan reciben recompensa cero durante el RL, lo que puede sesgar el estilo de razonamiento hacia soluciones cortas.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada; al derivar de Qwen3.5-4B, hereda los sesgos del modelo base.
- Idiomas soportados: no disponible; no se documenta el comportamiento multilingüe.
- Licencia Apache 2.0 heredada del modelo base, lo que permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-4B.
- El repositorio tiene 0 descargas y 0 likes, y la cita del artículo figura como TODO; la validación por parte de la comunidad es inexistente por el momento.

## Enlaces

- Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-4k-grpo-reasoninggym-easyturkey-s300
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Artículo citado: *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy* (sin enlace disponible en la información proporcionada)
- Repositorio o demo del artículo: no disponible
- Perfil del autor: https://huggingface.co/JetBrains-Research
