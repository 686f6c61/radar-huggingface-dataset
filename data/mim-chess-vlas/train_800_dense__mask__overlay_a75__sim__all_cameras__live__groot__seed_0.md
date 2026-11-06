# mim-chess-vlas/train_800_dense__mask__overlay_a75__sim__all_cameras__live__groot__seed_0

## Resumen

Este repositorio contiene una política de imitación para robótica construida sobre GR00T N1.7, el modelo fundacional abierto de NVIDIA para razonamiento y habilidades en robots humanoides. El autor (mim-chess-vlas) ha entrenado el modelo con LeRobot 0.6.0 sobre un dataset propio de 776 episodios y 207.203 frames a 20 FPS, con tareas de tipo "pick and place" sobre un brazo Franka Panda en simulación. El resultado es un checkpoint de 3.144.016.000 parámetros (aproximadamente 3,14 mil millones) en formato safetensors, con un tamaño de repositorio de 100,6 GB.

La relevancia de esta ficha es doble: por un lado ilustra el flujo de trabajo de LeRobot para ajustar un modelo fundacional de robótica a una tarea concreta; por otro, muestra las limitaciones prácticas de estos checkpoints, que son específicos de una morfología (Panda), de un conjunto de cámaras y de un vocabulario de objetos cerrado. No es un modelo de propósito general listo para producción, sino un artefacto de investigación reproducible (semilla 0, 60.000 pasos, batch 16, learning rate 7e-05).

La arquitectura combina un backbone visual-lenguaje Cosmos-Reason2/Qwen3-VL con un transformer de acciones basado en flow matching, que predice acciones condicionadas por visión, lenguaje y propiocepción. La licencia es Apache 2.0, lo que facilita su reutilización, aunque el rendimiento real fuera del dominio de entrenamiento no está documentado en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |
| Tipo de robot | Franka Panda |
| Cámaras | agentview, robot0_eye_in_hand, robot0_eye_in_hand_2 |
| Entrada de estado | observation.state, shape (9,) |
| Entrada visual | 3 imágenes RGB de (3, 224, 224) |
| Salida de acción | action, shape (7,) |
| Dataset de entrenamiento | mim-chess-vlas/train_800_dense__mask__overlay_a75__sim__all_cameras__live |
| Episodios / frames | 776 / 207.203 a 20 FPS |
| Pasos de entrenamiento | 60.000 |
| Batch size | 16 |
| Optimizador | AdamW |
| Learning rate | 7e-05 |
| Semilla | 0 |
| Versión de LeRobot | 0.6.0 |
| Tamaño del repositorio | 100,6 GB |
| Descargas / likes | 49 / 0 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de GR00T N1.7, un modelo fundacional cross-embodiment de NVIDIA. La parte perceptiva es un backbone visión-lenguaje Cosmos-Reason2/Qwen3-VL que procesa las tres cámaras (una vista de agente y dos vistas de muñeca) junto con la instrucción en lenguaje natural. La parte generativa de acciones es un transformer de flow matching que produce vectores de acción de dimensión 7 condicionados por las representaciones del backbone y por el estado propioceptivo de 9 dimensiones. Este diseño separa la comprensión semántica de la generación motora, lo que permite reutilizar el backbone en distintas morfologías.

El ajuste se realizó con LeRobot 0.6.0 durante 60.000 pasos, batch de 16, AdamW y learning rate 7e-05, con semilla 0. El dataset contiene 776 episodios y 207.203 frames a 20 FPS, con 40 tareas de tipo "Pick the X and place it into the box" sobre objetos domésticos (jam, cereal, pear, sweet potato, scone, can, hamburger, lemon, squash, cheese, cup, egg, ham, hot dog, apple, bread, candle, chicken breast, jar, knife block, kettle, potato, basket, cake, orange, spice, spray, alcohol, blender jug, mushroom, salt and pepper shaker, tiered shelf, condiment, mango, pitcher, plant, stool, soap dispenser, entre otros). No se documenta en la información disponible si hubo RLHF, DPO ni qué proporción de datos simulados frente a reales se usó, aunque el nombre del dataset incluye los tokens "sim" y "live", lo que sugiere una mezcla de ambos.

## Capacidades

- Control robótico de manipulación: genera acciones de 7 dimensiones para un Franka Panda a partir de observaciones visuales y de estado.
- Percepción multi-cámara: procesa simultáneamente una vista de agente y dos vistas de muñeca a 224x224 píxeles.
- Condicionamiento por lenguaje: acepta instrucciones en lenguaje natural del tipo "Pick the jam and place it into the box" para seleccionar el objeto y la tarea.
- Ejecución de tareas pick-and-place sobre un vocabulario cerrado de 40 objetos domésticos.
- Integración con LeRobot: se ejecuta con `lerobot-rollout` y se entrena con el pipeline estándar de imitación de LeRobot.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, modo thinking, audio ni capacidades multilingües explícitas.
- No se documenta razonamiento simbólico, matemáticas ni generación de código; el modelo es una política de acción, no un LLM de propósito general.

## Casos de uso

- Investigación en imitación robótica: sirve como checkpoint de referencia para reproducir el ajuste de GR00T N1.7 con LeRobot 0.6.0 sobre un dataset propio, con hiperparámetros y semilla documentados.
- Benchmark de manipulación pick-and-place: permite evaluar la tasa de éxito en las 40 tareas del dataset y comparar variantes de backbone o de aumentación de datos.
- Prototipado de pipelines de datos: el dataset asociado (776 episodios, 207.203 frames, 20 FPS) se puede visualizar y reutilizar para probar herramientas de curación, aumentación o filtrado.
- Estudio de mezcla sim-to-real: el nombre del dataset sugiere datos simulados y reales; el checkpoint permite analizar la transferencia entre ambos dominios en un Panda.
- Docencia y formación: ejemplo completo y reproducible de un flujo de aprendizaje por imitación con un modelo fundacional, desde la grabación hasta el despliegue con `lerobot-rollout`.
- Base para fine-tuning en nuevas morfologías: al ser un modelo cross-embodiment con backbone VLM, puede servir de inicialización para adaptar la cabeza de acciones a otro robot, aunque requeriría reentrenamiento y validación.
- Evaluación de robustez ante cambios de cámara o iluminación: útil para medir la sensibilidad del flow matching a variaciones en las tres vistas de entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay tasas de éxito, métricas de MMLU, HumanEval, GSM8K ni comparaciones numéricas con otros checkpoints en la model card ni en los metadatos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 3,14 mil millones de parámetros, una estimación orientativa en fp16 sería de unos 6,3 GB solo para pesos, más el coste del backbone VLM y de las tres cámaras; en fp32 ascendería a unos 12,6 GB. Estas cifras son estimaciones, no datos publicados.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cabría esperar que funcione en GPUs de 24 GB o más (RTX 4090, A100, H100), pero no está confirmado.
- ¿Cabe en GPU de consumo? Probablemente sí en fp16 en una RTX 4090 de 24 GB, aunque el repositorio de 100,6 GB sugiere que los pesos completos y artefactos auxiliares son voluminosos; no hay confirmación oficial.
- Opciones de despliegue: LeRobot con `lerobot-rollout` y `--policy.path` apuntando al repositorio; el resto de opciones (vLLM, llama.cpp, Ollama, TGI) no están documentadas para este checkpoint.
- Latencia y throughput: no disponibles. La frecuencia de control del dataset es de 20 FPS, pero no se especifica la latencia de inferencia en hardware concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (GR00T N1.7 ajustado, Panda) | 3.144.016.000 | no disponible | Política de imitación con backbone VLM + flow matching | Apache 2.0 | Hugging Face, LeRobot |
| GR00T N1.7 base (NVIDIA) | no disponible en la información | no disponible | Modelo fundacional cross-embodiment | no disponible en la información | GitHub NVIDIA/Isaac-GR00T |
| Otros checkpoints de LeRobot para Panda | no disponible | no disponible | Políticas de imitación (p. ej. ACT, Diffusion Policy) | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Específico de morfología: entrenado para un Franka Panda con un estado de 9 dimensiones y una acción de 7 dimensiones; no es directamente transferible a otro robot sin reentrenar la cabeza de acciones.
- Dependencia de cámaras: asume exactamente tres vistas (agentview, robot0_eye_in_hand, robot0_eye_in_hand_2) a 224x224; cambios en la configuración de cámaras degradarán el rendimiento.
- Vocabulario cerrado: las 40 tareas del dataset limitan la generalización a objetos e instrucciones fuera de esa lista.
- Sin benchmarks publicados: no hay tasas de éxito ni métricas de robustez, por lo que no se puede afirmar su calidad en producción.
- Riesgo de sobreajuste al dominio simulado: el nombre del dataset incluye "sim" y "live"; no se documenta la proporción ni la brecha sim-to-real.
- Sin información sobre sesgos: no se documentan sesgos conocidos, pero el dataset de objetos domésticos puede reflejar sesgos de selección.
- Riesgo de alucinación de acciones: como política generativa, puede producir trayectorias inválidas fuera de la distribución de entrenamiento; requiere supervisión y paradas de seguridad.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar las licencias del backbone Cosmos-Reason2/Qwen3-VL y de los datos de entrenamiento.
- Repositorio de 100,6 GB: el almacenamiento y la transferencia son costosos; conviene usar descargas parciales o conversiones.
- Sin soporte documentado de cuantización: no se indican formatos GGUF ni cuantizaciones INT8/INT4 para este checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mim-chess-vlas/train_800_dense__mask__overlay_a75__sim__all_cameras__live__groot__seed_0
- Dataset de entrenamiento: https://huggingface.co/datasets/mim-chess-vlas/train_800_dense__mask__overlay_a75__sim__all_cameras__live
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mim-chess-vlas/train_800_dense__mask__overlay_a75__sim__all_cameras__live
- Repositorio GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
