# shivan00/doosan_gripper_data1_continue5k

## Resumen

`shivan00/doosan_gripper_data1_continue5k` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), un enfoque de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales. El modelo lo publica el usuario shivan00 en Hugging Face Hub y se ha generado con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica. Su propósito es controlar un brazo robótico Doosan equipado con pinza (gripper) a partir de datos de teleoperación.

El modelo tiene 51.670.663 parámetros (aproximadamente 51,7 millones) y se distribuye en formato safetensors con un tamaño de repositorio de 0,2 GB. Está etiquetado con el pipeline `robotics` y la licencia Apache 2.0. No es un modelo de lenguaje: no procesa texto ni genera lenguaje natural, sino que mapea observaciones visuales y de estado del robot a comandos de acción motora.

Su relevancia es acotada y práctica: sirve como checkpoint de continuación de entrenamiento (el nombre incluye "continue5k", lo que sugiere 5.000 pasos adicionales sobre un entrenamiento previo) para una tarea concreta de manipulación con gripper sobre un robot Doosan. Es un artefacto de investigación reproducible, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.670.663 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; ACT opera sobre ventanas de observación de la política) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. La arquitectura combina un codificador de observaciones (típicamente imágenes de cámaras y estado de las articulaciones) con un transformer que decodifica un *chunk* de acciones futuras de forma conjunta, en lugar de predecir una sola acción por paso. Esta predicción por bloques reduce el error de acumulación y mejora la estabilidad en tareas de manipulación fina, como el agarre con pinza.

El entrenamiento se realiza sobre el dataset `shivan00/doosan_gripper_data1`, compuesto por episodios de teleoperación del robot Doosan con gripper. El sufijo "continue5k" indica que este checkpoint continúa un entrenamiento previo durante 5.000 pasos adicionales. No se dispone de información sobre el número total de tokens, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO (no aplicables en este contexto de aprendizaje por imitación). Tampoco se documentan innovaciones adicionales más allá del propio mecanismo de action chunking.

## Capacidades

- Control de robot manipulador: genera comandos de acción (posiciones articulares y estado del gripper) a partir de observaciones visuales y de estado.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de datos de teleoperación.
- Predicción de chunks de acción: emite secuencias cortas de acciones coherentes en el tiempo.
- Manipulación con pinza: entrenado específicamente para tareas de agarre sobre un robot Doosan.
- Integración con LeRobot: compatible con los scripts `lerobot-train` y `lerobot-record` para entrenamiento y evaluación.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Automatización de agarre en laboratorio: el modelo ejecuta la política aprendida para que el brazo Doosan coja objetos con la pinza en el entorno para el que fue entrenado, reproduciendo las trayectorias de teleoperación.
- Investigación en aprendizaje por imitación: sirve como checkpoint de referencia para comparar variantes de ACT o para continuar el entrenamiento con nuevos datos, dado su nombre "continue5k".
- Evaluación reproducible con LeRobot: se puede desplegar con `lerobot-record` apuntando a `--policy.path` para medir la tasa de éxito en episodios de evaluación.
- Prototipado de pipelines de robótica: útil para validar la integración de un policy ACT en una celda robotizada antes de escalar a tareas más complejas.
- Generación de datos de evaluación: al ejecutar la política se pueden recoger episodios etiquetados como `eval_` para analizar fallos y mejorar el dataset de entrenamiento.
- Base para fine-tuning en tareas de pinza: partiendo de este checkpoint se puede adaptar el modelo a variantes de la misma tarea (distintos objetos o posiciones) con menos datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~51,7 M de parámetros con pesos safetensors, la huella en memoria es reducida; una estimación conservadora sitúa la inferencia en torno a 1-2 GB de VRAM incluyendo buffers del codificador visual y del decodificador de acciones (estimación, no dato publicado).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente en la práctica; se recomienda una RTX 3060/4060 o superior para entrenamiento y evaluación cómodos.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs consumer modernas (RTX 20xx, 30xx, 40xx) e incluso en algunas integradas con suficiente memoria compartida.
- Opciones de despliegue: LeRobot (`lerobot-record`), con soporte de dispositivo CUDA o CPU mediante `--policy.device`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| shivan00/doosan_gripper_data1_continue5k | 51,7 M | no aplica | no disponible | Apache 2.0 | Hugging Face |
| Políticas ACT genéricas de LeRobot | variable (típicamente decenas de millones) | no aplica | no disponible | según checkpoint | Hugging Face / LeRobot |
| Políticas Diffusion Policy | variable | no aplica | no disponible | según checkpoint | Hugging Face / LeRobot |
| Políticas VQ-BeT | variable | no aplica | no disponible | según checkpoint | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo publicados para este checkpoint concreto frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- Especialización estrecha: la política está entrenada para un robot Doosan con gripper y un conjunto concreto de tareas; no generaliza a otros robots, sensores o entornos sin reentrenamiento.
- Sin capacidades lingüísticas: no procesa texto, por lo que no sirve para tareas de NLP ni de razonamiento simbólico.
- Riesgo de sobreajuste al dataset: al ser un checkpoint de continuación sobre un dataset específico, puede reproducir sesgos de las demostraciones de teleoperación (posiciones, objetos y condiciones de iluminación del entorno de recogida).
- Alucinación en el sentido de acciones erróneas: puede generar trayectorias no válidas ante observaciones fuera de distribución, con riesgo de colisiones o fallos de agarre.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías sobre el rendimiento en producción.
- Documentación escasa: no hay información sobre composición del dataset, número de episodios, métricas de éxito ni condiciones de evaluación, lo que dificulta validar su robustez.
- Sin mantenimiento aparente: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de soporte o actualizaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shivan00/doosan_gripper_data1_continue5k
- Dataset asociado: https://huggingface.co/datasets/shivan00/doosan_gripper_data1
- Paper ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
