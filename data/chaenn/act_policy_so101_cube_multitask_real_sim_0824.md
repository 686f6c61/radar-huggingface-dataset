# Chaenn/act_policy_so101_cube_multitask_real_sim_0824

## Resumen

El modelo `act_policy_so101_cube_multitask_real_sim_0824` es una política de aprendizaje por imitación basada en el método Action Chunking with Transformers (ACT), desarrollada por Chaenn y publicada en Hugging Face bajo licencia Apache 2.0. Está diseñada para controlar un brazo robótico SO-101 en tareas de manipulación de cubos, entrenada con datos mixtos de simulación y mundo real mediante el framework LeRobot. El modelo predice secuencias de acciones (action chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación.

Con 51,67 millones de parámetros y un tamaño de repositorio de 0,2 GB, es una política ligera adecuada para despliegue en robots de bajo coste como el SO-101. Su relevancia radica en que demuestra la viabilidad de transferir políticas entrenadas en simulación al mundo real (sim-to-real) con un robot asequible, un caso de uso cada vez más demandado en robótica educativa y de investigación. El modelo se publicó en agosto de 2026 y no ha recibido descargas ni valoraciones, lo que sugiere que es un experimento reciente o de uso interno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con action chunking (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT (Action Chunking with Transformers), presentada en el paper arXiv:2304.13705. ACT es un método de aprendizaje por imitación que, en lugar de predecir una única acción por paso de tiempo, genera un fragmento de acciones futuras (action chunk) de longitud fija. Esto reduce la acumulación de errores y permite movimientos más suaves y consistentes. La política se compone de un codificador de observaciones (imágenes y estado del robot) y un decodificador autoregresivo que produce las secuencias de acciones.

El entrenamiento se realizó con el framework LeRobot, utilizando el dataset `Chaenn/so101_cube_multitask_real_sim_0824`, que combina demostraciones teleoperadas en simulación y en el robot real SO-101. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de refinamiento como RLHF o DPO. Al ser un modelo de imitación, el aprendizaje se basa en comportamiento clonado a partir de las demostraciones, sin refuerzo explícito.

## Capacidades

- Control de brazo robótico SO-101 para tareas de manipulación de cubos (coger, mover, apilar).
- Predicción de secuencias de acciones (action chunking) que mejoran la fluidez del movimiento.
- Entrenado con datos mixtos simulación y real, lo que facilita la transferencia sim-to-real.
- Integración nativa con LeRobot para entrenamiento, evaluación e inferencia.
- Soporte para inferencia en tiempo real con el robot SO-101 mediante el comando `lerobot-record`.
- No incluye capacidades de lenguaje, visión general ni tool calling; es una política puramente motora.

## Casos de uso

- Manipulación de objetos en entornos educativos: el modelo puede controlar un SO-101 para tareas de recogida y colocación de cubos, sirviendo como demostración práctica de aprendizaje por imitación en cursos de robótica.
- Investigación en sim-to-real: al estar entrenado con datos mixtos, es útil para estudiar la brecha entre simulación y realidad en robots de bajo coste, permitiendo reproducir experimentos de transferencia.
- Prototipado rápido de políticas robóticas: con LeRobot, un investigador puede cargar el modelo y evaluarlo en su propio SO-101 en pocos minutos, sin necesidad de entrenar desde cero.
- Automatización de tareas repetitivas en laboratorio: el modelo puede realizar tareas de ordenación de cubos en entornos controlados, liberando tiempo de los investigadores.
- Benchmark de políticas ACT: sirve como punto de comparación para otras políticas entrenadas con el mismo dataset o con variaciones del método ACT.
- Desarrollo de sistemas de teleoperación asistida: combinado con un líder teleoperado, el modelo puede completar tareas de forma autónoma tras unas pocas demostraciones, útil en entornos de fabricación flexible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de éxito, tasas de acierto ni comparaciones con otros modelos. El autor no ha documentado experimentos de evaluación en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51,67 millones de parámetros, el modelo cabe en cualquier GPU con al menos 2 GB de VRAM en precisión FP32 (aproximadamente 207 MB de pesos). Con cuantización a FP16 o int8, el requisito baja a unos 100-150 MB.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA, desde una GTX 1650 hasta una RTX 4090. También puede ejecutarse en CPU para inferencia no tiempo real.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo actual, incluso en integradas si se usa cuantización.
- Opciones de despliegue: LeRobot (entrenamiento e inferencia), Hugging Face Hub para descarga de pesos, y posiblemente llama.cpp o TGI si se convierte a GGUF, aunque no es el flujo estándar para políticas robóticas.
- Latencia y throughput: no disponibles. Al ser un modelo pequeño, se espera una latencia de pocos milisegundos por predicción en GPU, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dataset | Licencia | Fecha |
|---|---|---|---|---|---|
| act_policy_so101_cube_multitask_0824 (este) | 51,67 M | no disponible | so101_cube_multitask_real_sim_0824 | Apache 2.0 | 2026-08-24 |
| act_policy_so101_cube_multitask_0716 | no disponible | no disponible | so101_cube_multitask (probablemente) | Apache 2.0 | 2026-07-16 |
| act_policy_so101_cube_multitask_0710 | no disponible | no disponible | so101_cube_multitask (probablemente) | Apache 2.0 | 2026-07-10 |

Los tres modelos son del mismo autor y siguen la misma arquitectura ACT. Las diferencias principales son la fecha de entrenamiento y el dataset asociado. No hay datos de rendimiento comparativo publicados. Otros modelos de imitación para SO-101 existen en la comunidad (por ejemplo, los del taller Sim-to-Real de NVIDIA), pero no se dispone de información detallada para una comparación rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo entrenado con demostraciones teleoperadas, puede heredar los sesgos del operador humano (por ejemplo, preferencia por ciertas trayectorias o velocidades).
- Riesgo de alucinación: en robótica, el equivalente a la alucinación son movimientos erráticos o acciones fuera del espacio de trabajo. No hay datos sobre la frecuencia de estos fallos.
- Limitaciones de contexto: la longitud de contexto no está documentada; el modelo procesa observaciones de imágenes y estado del robot, pero no texto.
- Limitaciones de idioma: no aplica, es un modelo motor sin procesamiento de lenguaje.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de licencia.
- Caveat para producción: el modelo está entrenado para una tarea específica (manipulación de cubos) y puede no generalizar a otros objetos o configuraciones. Se recomienda evaluar en el robot real antes de cualquier despliegue crítico.
- Dependencia del hardware: el rendimiento puede variar según la calibración de las cámaras y la configuración del SO-101; no hay garantías de éxito sin ajuste fino.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Chaenn/act_policy_so101_cube_multitask_real_sim_0824
- Dataset asociado: https://huggingface.co/datasets/Chaenn/so101_cube_multitask_real_sim_0824
- Paper de ACT: https://huggingface.co/papers/2304.13705
- LeRobot (framework): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Taller sim-to-real SO-101 (NVIDIA): https://github.com/isaac-sim/Sim-to-Real-SO-101-Workshop
- Guía sim2real para SO-101: https://github.com/Luoyadan/lerobot_so101-sim2real
- Documentación SO101 ROS2 (imitation learning): https://so101-ros2.readthedocs.io/latest/imitation_learning.html
