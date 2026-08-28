# Chaenn/act_policy_so101_cube_multitask_realsim_0827

## Resumen

Este modelo es una política de manipulación robótica basada en Action Chunking with Transformers (ACT), entrenada con la librería LeRobot de Hugging Face. Desarrollado por el usuario Chaenn, el modelo está diseñado para controlar un brazo robótico SO-101 en tareas de colocación de cubos (pick-and-place), utilizando un enfoque de aprendizaje por imitación a partir de datos teleoperados. El modelo predice secuencias de acciones (action chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación.

Con 51,7 millones de parámetros y un peso de solo 0,2 GB, es un modelo ligero que puede ejecutarse en hardware de consumo. Está publicado bajo licencia Apache 2.0, lo que permite uso comercial y modificación sin restricciones significativas. Su relevancia radica en ser un ejemplo práctico de aplicación de transformadores al control robótico de bajo nivel, accesible para desarrolladores e investigadores que trabajan con el ecosistema LeRobot y brazos SO-100/SO-101.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; procesa observaciones de imagen y estado) |
| Tipos de cuantizacion | no disponible (pesos en precisión completa, safetensors) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un transformer con un mecanismo de predicción de chunks de acciones. En lugar de predecir una única acción por paso de tiempo, el modelo predice una secuencia de acciones futuras (por ejemplo, 10-100 pasos), lo que reduce la acumulación de errores y permite un control más suave. La arquitectura se basa en el paper "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705), que utiliza un codificador de visión (ResNet) para procesar imágenes de cámara y un transformer para generar las secuencias de acciones.

El entrenamiento se realizó con la librería LeRobot, utilizando el dataset `Chaenn/so101_cube_place_new_simreal_0827`, que combina datos de simulación y del mundo real (realsim) para la tarea de colocar cubos con el brazo SO-101. El dataset incluye demostraciones teleoperadas que el modelo aprende a imitar mediante una pérdida de regresión (L1 o MSE) sobre las acciones predichas. No se menciona el uso de RLHF ni DPO, ya que es un método de imitación pura. No se dispone de información sobre el número total de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Control robótico de manipulación: genera comandos de posición y orientación para el brazo SO-101 en tareas de pick-and-place.
- Predicción de chunks de acciones: produce secuencias de acciones que permiten un movimiento coordinado y suave.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones teleoperadas.
- Multitarea: el nombre del modelo indica entrenamiento multitarea (cube_multitask), aunque no se detallan las tareas específicas.
- Entrenamiento con datos mixtos simulación/real: combina datos de simulación y del mundo real para mejorar la transferencia.
- Integración con LeRobot: compatible con el pipeline de entrenamiento, evaluación e inferencia de LeRobot.
- No es un modelo de lenguaje ni multimodal en el sentido tradicional: no procesa texto ni genera respuestas.

## Casos de uso

- Automatización de pick-and-place en entornos de laboratorio: el modelo puede controlar el brazo SO-101 para recoger y colocar cubos en posiciones objetivo, útil para experimentos de robótica educativa o investigación.
- Prototipado rápido de políticas robóticas: gracias a su tamaño reducido y compatibilidad con LeRobot, permite iterar rápidamente en el diseño de nuevas tareas de manipulación.
- Transferencia sim-to-real: al haber sido entrenado con datos mixtos (simulación y real), sirve como punto de partida para estudiar estrategias de transferencia entre entornos.
- Benchmarking de algoritmos de imitación: puede utilizarse como baseline en comparaciones con otros métodos de aprendizaje por imitación en el brazo SO-101.
- Desarrollo de sistemas de teleoperación asistida: el modelo puede predecir acciones en tiempo real para asistir a un operador humano en tareas de manipulación delicadas.
- Investigación en action chunking: permite estudiar el efecto de la longitud del chunk y el temporal ensembling en la estabilidad del control, como se ha hecho en proyectos similares (ver repositorio xxwd231/lerobot-so101-cube).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta métricas como tasa de éxito en episodios, precisión de colocación ni comparativas con otros modelos. Tampoco se especifica el número de episodios de evaluación ni las condiciones del entorno.

## Requisitos de hardware

- VRAM estimada para inferencia: dado que el modelo tiene 51,7 millones de parámetros en precisión FP32, el peso ocupa aproximadamente 207 MB. La inferencia puede ejecutarse en cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA (GTX 1050 Ti o superior) es suficiente. Para entrenamiento, se recomienda al menos 8 GB de VRAM (RTX 2070, RTX 3060, etc.) por el coste de los gradientes y las imágenes.
- Cabe en GPU de consumo: sí, cualquier GPU moderna de consumo (RTX 3060, RTX 4090) puede ejecutar la inferencia sin problemas.
- Opciones de despliegue: LeRobot ofrece scripts de inferencia y evaluación (`lerobot-record`), y el modelo se puede cargar con la API de LeRobot. También es posible exportar a otros formatos si se requiere.
- Latencia y throughput: no se han publicado mediciones. En una GPU media, la inferencia debería ser de pocos milisegundos por paso, pero depende de la resolución de imagen y del tamaño del chunk.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Framework | Licencia |
|---|---|---|---|---|
| act_policy_so101_cube_multitask_realsim_0827 (este) | 51,7 M | Pick-and-place de cubos | LeRobot | Apache 2.0 |
| act_policy_so101_cube_multitask_0710 (Chaenn) | no disponible | Pick-and-place de cubos | LeRobot | Apache 2.0 |
| act_policy_so101_cube_multitask_real_sim_0819 (Chaenn) | no disponible | Pick-and-place de cubos | LeRobot | Apache 2.0 |
| ACT original (paper 2304.13705) | no publicado | Manipulación bimanual | PyTorch | no disponible |

No se dispone de comparativas de rendimiento entre estos modelos. El modelo original ACT del paper utiliza una arquitectura similar pero con un número de parámetros que depende de la configuración (no se publica en el paper). Este modelo es específico para el brazo SO-101 y la tarea de cubos, mientras que el ACT original se probó en brazos ALOHA.

## Limitaciones y advertencias

- Sesgos del dataset: al entrenarse con datos teleoperados, el modelo puede heredar sesgos del operador (velocidad, trayectorias, preferencias de agarre).
- Riesgo de alucinación en acciones: en situaciones no vistas, el modelo puede generar comandos de acción inconsistentes o no seguros. Es necesario implementar mecanismos de seguridad (límites de velocidad, paradas de emergencia).
- Limitaciones de generalización: está entrenado para una tarea específica (colocación de cubos) y puede no generalizar a otras posiciones, objetos o configuraciones del brazo.
- Dependencia de la configuración del robot: requiere calibración del SO-101 y cámaras en la misma disposición que durante el entrenamiento.
- Sin soporte para lenguaje natural ni razonamiento simbólico: es un modelo de control de bajo nivel, no un agente conversacional.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe atribuir la autoría original y no utilizar marcas registradas.
- Datos de entrenamiento no auditados: no se ha realizado una auditoría de sesgos o calidad del dataset más allá de lo que el autor haya hecho internamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Chaenn/act_policy_so101_cube_multitask_realsim_0827
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Checkpoint relacionado (0710): https://huggingface.co/Chaenn/act_policy_so101_cube_multitask_0710
- Checkpoint relacionado (0819): https://huggingface.co/Chaenn/act_policy_so101_cube_multitask_real_sim_0819
- Proyecto similar en GitHub (SO-101 ACT): https://github.com/Jaskaran3010/so101-act-policy
- Proyecto similar en GitHub (LeRobot SO-101): https://github.com/xxwd231/lerobot-so101-cube
- Tutorial de entrenamiento ACT en SO-101: https://trelis.substack.com/p/train-an-act-policy-for-an-so-101
