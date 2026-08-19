# ImKyungjin/pi0-stackcube-100noise-60ep

## Resumen

π₀ (Pi0) es un modelo Vision-Language-Action (VLA) para control general de robots, desarrollado por Physical Intelligence y adaptado al ecosistema LeRobot de HuggingFace. A diferencia de los robots tradicionales programados para movimientos repetitivos, π₀ está diseñado como una política generalista que comprende entradas visuales, interpreta instrucciones en lenguaje natural y controla distintos robots en diversas tareas. El checkpoint `pi0-stackcube-100noise-60ep` es un fine-tuning específico sobre el dataset `taewonkoo/stack_cube_100noise_shuffled_60ep`, orientado a la tarea de apilado de cubos con 100 niveles de ruido y 60 épocas de entrenamiento.

El modelo cuenta con 3.501.372.176 parámetros (3,5B) y se distribuye en formato safetensors a través del Hub de HuggingFace, con un tamaño de repositorio de 7,0 GB. La arquitectura base de π₀ es un modelo de difusión basado en flujo (flow-based diffusion) que parte de un VLM (Vision-Language Model) preentrenado, del que hereda conocimiento general, razonamiento semántico y capacidades de resolución de problemas, para después incorporar acciones robóticas mediante entrenamiento adicional. El checkpoint está publicado bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) flow-based diffusion model |
| Parametros totales | 3.501.372.176 (3,5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de robotica; el VLM base soporta instrucciones en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

π₀ es un modelo de difusión basado en flujo que combina un codificador de visión, un modelo de lenguaje y un decodificador de acciones. La arquitectura parte de un VLM preentrenado del que hereda conocimiento general, razonamiento semántico y capacidades de resolución de problemas, y se entrena adicionalmente para incorporar acciones robóticas, convirtiéndose en un modelo VLA. El modelo base fue preentrenado con más de 10.000 horas de datos robóticos, según la documentación de Physical Intelligence.

Este checkpoint concreto ha sido fine-tuneado con LeRobot sobre el dataset `taewonkoo/stack_cube_100noise_shuffled_60ep`, que contiene episodios de apilado de cubos con 100 niveles de ruido aplicados y 60 épocas de entrenamiento. El entrenamiento se realizó con la librería LeRobot de HuggingFace, que proporciona pipelines completos para entrenamiento, evaluación e inferencia de políticas robóticas. No se especifica en la información disponible si se utilizaron técnicas de RLHF o DPO en el fine-tuning.

## Capacidades

- Control robótico generalista: el modelo puede controlar distintos robots en tareas diversas, no está limitado a un único robot o movimiento.
- Comprensión visual: procesa entradas visuales para entender el estado del entorno y los objetos.
- Interpretación de instrucciones en lenguaje natural: entiende comandos verbales para ejecutar acciones.
- Generación de acciones: produce secuencias de acciones robóticas mediante decodificación basada en flujo (flow matching).
- Fine-tuning específico: este checkpoint está especializado en la tarea de apilado de cubos con alta tolerancia al ruido en las observaciones.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento y evaluación de HuggingFace para robótica.

## Casos de uso

- Apilado de cubos en entornos de investigación: el modelo está específicamente entrenado para esta tarea con 100 niveles de ruido, lo que lo hace robusto a perturbaciones en las observaciones. Se puede evaluar con `lerobot-record` usando un robot SO-100 follower.
- Fine-tuning para tareas de manipulación específicas: al ser un modelo base generalista, se puede adaptar a nuevas tareas de manipulación con datasets propios mediante el pipeline de entrenamiento de LeRobot.
- Investigación en políticas robóticas generalistas: sirve como punto de partida para estudiar la transferencia de conocimiento entre tareas y la generalización en control robótico.
- Benchmarking de modelos VLA: permite comparar el rendimiento de arquitecturas de difusión frente a otras aproximaciones (como ACT o π₀-FAST) en tareas de manipulación.
- Desarrollo de sistemas de control robotico con instrucciones en lenguaje natural: el VLM subyacente permite combinar razonamiento semántico con ejecución de acciones físicas.
- Entrenamiento de políticas con datos ruidosos: el entrenamiento con 100 niveles de ruido lo hace adecuado para estudiar la robustez de políticas frente a observaciones imperfectas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo card no incluye métricas de evaluación como tasas de éxito en la tarea de apilado, ni comparaciones con otros checkpoints del mismo dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Con 3,5B parámetros, una estimación razonable sería ~7 GB en FP16 y ~14 GB en FP32, aunque el modelo puede requerir memoria adicional para el procesamiento de visión y las secuencias de acciones.
- GPU recomendadas: no especificadas por el autor. Por el tamaño del modelo, una GPU con al menos 12-16 GB de VRAM (RTX 3090, RTX 4090, A10, A100) sería adecuada para inferencia.
- Compatibilidad con GPU de consumo: probablemente sí, en cuantizaciones reducidas o FP16, en GPUs de gama alta (RTX 3090/4090 con 24 GB).
- Opciones de despliegue: LeRobot (inferencia y evaluación con `lerobot-record`), compatible con el ecosistema HuggingFace.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|
| π₀ (este checkpoint) | 3,5B | VLA flow-based diffusion | Apache-2.0 | HuggingFace (LeRobot) |
| π₀-FAST | No disponible | VLA autoregressive con FAST action tokenizer | No disponible | GitHub (openpi) |
| π₀.5 | No disponible | VLA mejorado con mejor generalización open-world | No disponible | GitHub (openpi) |
| ACT (Action Chunking with Transformers) | No disponible | Transformer para acciones | No disponible | LeRobot |

π₀-FAST y π₀.5 son variantes del mismo modelo base publicadas por Physical Intelligence en el repositorio openpi. π₀-FAST utiliza un tokenizador de acciones autoregresivo en lugar de difusión, mientras que π₀.5 es una versión mejorada con mejor generalización en entornos abiertos. ACT es una arquitectura alternativa de política robótica disponible en LeRobot, pero no es un VLA.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la información disponible, pero al ser un modelo entrenado con datos robóticos, puede heredar sesgos del entorno de recogida de datos.
- Riesgo de alucinación: como modelo basado en VLM, puede generar acciones inconsistentes con la entrada visual si las observaciones difieren significativamente de los datos de entrenamiento.
- Limitaciones de contexto: no se especifica la longitud de contexto; el modelo está pensado para tareas de manipulación de corta duración, no para razonamiento de largo alcance.
- Especialización del checkpoint: este fine-tuning está orientado a apilado de cubos con ruido; su rendimiento en otras tareas no está garantizado sin fine-tuning adicional.
- Requisitos de hardware: el tamaño del modelo (7 GB en disco) puede limitar su despliegue en robots con hardware embebido de bajos recursos.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero es recomendable revisar los términos del modelo base de Physical Intelligence y del dataset utilizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ImKyungjin/pi0-stackcube-100noise-60ep
- Repositorio openpi (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Paper de π₀ (arXiv): https://arxiv.org/html/2410.24164v1
- Blog de Physical Intelligence sobre π₀: https://www.physicalintelligence.company/blog/pi0
- LeRobot (HuggingFace): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Dataset de entrenamiento: https://huggingface.co/datasets/taewonkoo/stack_cube_100noise_shuffled_60ep
- Checkpoint relacionado (v3): https://huggingface.co/taewonkoo/pi0_stackcube_v3_10000chk
- Checkpoint relacionado (v4 LoRA): https://huggingface.co/ImKyungjin/pi0-stackcube-v4-lora64
