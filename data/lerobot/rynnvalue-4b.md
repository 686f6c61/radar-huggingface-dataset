# lerobot/RynnValue-4B

## Resumen

RynnValue-4B es un modelo de valor (value model) para robótica, condicionado por lenguaje, desarrollado por Alibaba DAMO Academy y empaquetado para su uso en LeRobot por el equipo de Hugging Face. Se construye sobre Qwen3-VL y su tarea es estimar, a partir de un vídeo de trayectoria y una descripción textual de la tarea, el tiempo restante en segundos hasta que la tarea se completa. Esta señal de "distancia temporal al éxito" funciona como función de recompensa densa para entrenamiento por refuerzo, filtrado de datos y selección de políticas en robótica.

El modelo tiene 5.144.979.456 parámetros (aproximadamente 5,1 mil millones) según los pesos en safetensors, y se distribuye con licencia Apache 2.0. El repositorio ocupa 10,3 GB y la librería asociada es LeRobot. La relevancia actual radica en que proporciona una recompensa escalar y continua alineada con instrucciones en lenguaje natural, algo que escasea en el ecosistema de modelos abiertos para manipulación robótica.

La model card indica explícitamente que se trata de un modelo de inferencia únicamente dentro de LeRobot: no puede entrenarse con `lerobot-train`. La información pública disponible es escasa y no incluye detalles sobre datos de entrenamiento, longitud de contexto ni benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (basada en Qwen3-VL) |
| Parámetros totales | 5.144.979.456 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se describe como un value model condicionado por lenguaje construido sobre Qwen3-VL, es decir, un transformer multimodal que procesa vídeo de trayectoria junto con una descripción de tarea. La salida no es texto generativo, sino una predicción escalar de tiempo restante en segundos hasta la finalización de la tarea, lo que lo convierte en un reward model con señal temporal densa.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas más allá de la formulación de "temporal distance" que aparece en las etiquetas del repositorio. El modelo base declarado es Alibaba-DAMO-Academy/RynnValue-4B, sobre el que se ha realizado un fine-tuning para su integración en LeRobot.

## Capacidades

- Predicción de tiempo restante hasta completar una tarea robótica a partir de vídeo de trayectoria y descripción textual.
- Comprensión de vídeo e imagen combinada con lenguaje natural, heredada de la base Qwen3-VL.
- Generación de recompensas densas y escalares adecuadas para RL, filtrado de datos y ranking de trayectorias.
- Condicionamiento por instrucciones en lenguaje natural para definir el objetivo de la tarea.
- Integración nativa con el ecosistema LeRobot mediante `RewardModelConfig` y `make_reward_model`.
- No se documenta soporte de tool calling, agentes multi-paso, audio ni modos de razonamiento explícito.

## Casos de uso

- Entrenamiento por refuerzo en manipulación robótica: usar el tiempo restante predicho como recompensa densa para guiar políticas de imitación o RL, evitando recompensas binarias escasas al final del episodio.
- Filtrado y curación de datasets de demostraciones: puntuar cada trayectoria con la estimación de tiempo restante y descartar episodios anómalos o inconsistentes con la instrucción.
- Selección de políticas en evaluación: comparar varias políticas candidatas ejecutando rollouts y midiendo la recompensa media predicha por RynnValue.
- Detección temprana de fallos: monitorizar la predicción de tiempo restante durante la ejecución y activar recuperación si no decrece, señal de que la tarea se ha estancado.
- Anotación automática de progreso: generar etiquetas de progreso temporal sobre vídeos de robot para entrenar modelos auxiliares o para visualización en herramientas de análisis.
- Investigación en reward modeling multimodal: servir como baseline reproducible y abierto para estudiar funciones de recompensa condicionadas por lenguaje en robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 10-11 GB solo para pesos, más memoria para activaciones y procesamiento de vídeo; se recomienda al menos 16-24 GB.
- VRAM estimada con cuantización a 8 bits: aproximadamente 5-6 GB de pesos, más overhead; con 4 bits, en torno a 3 GB de pesos.
- GPU recomendadas: A100 40/80 GB o H100 para lotes grandes y vídeos de alta resolución; RTX 4090 (24 GB) para inferencia en FP16 con lotes pequeños.
- GPU de consumo: cabe en RTX 4090 y potencialmente en GPUs de 16 GB con cuantización; en GPUs de 8 GB requeriría cuantización agresiva y no está documentado.
- Opciones de despliegue: la vía soportada es LeRobot (`make_reward_model`); no se documenta soporte oficial de vLLM, llama.cpp, Ollama ni TGI, dado que la salida es un escalar y no texto generativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RynnValue-4B (lerobot) | 5,14 B | no disponible | Value/reward model robótico condicionado por lenguaje | Apache 2.0 | Hugging Face, LeRobot |
| Qwen3-VL (base) | no disponible en la información | no disponible | Vision-language general | no disponible en la información | Hugging Face |
| Alternativas de reward modeling robótico | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- Solo inferencia en LeRobot: no puede entrenarse con `lerobot-train`, lo que limita su uso como base para fine-tuning dentro del flujo estándar.
- Información pública muy escasa: no hay datos sobre sesgos, composición del dataset ni evaluación, lo que dificulta estimar su robustez fuera de la distribución de entrenamiento.
- Riesgo de alucinación en la estimación temporal: la predicción de tiempo restante puede ser incorrecta en tareas ambiguas, entornos visualmente distintos o instrucciones poco específicas.
- Dependencia del modelo base Qwen3-VL: hereda sus limitaciones de idioma, visión y sesgos, no documentadas en esta ficha.
- Idiomas soportados no disponibles: no se puede garantizar un rendimiento multilingüe en las descripciones de tarea.
- Uso comercial permitido por Apache 2.0, pero sin garantías del autor sobre idoneidad para producción.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su calidad frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lerobot/RynnValue-4B
- Modelo base: https://huggingface.co/Alibaba-DAMO-Academy/RynnValue-4B
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
