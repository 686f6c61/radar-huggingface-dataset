# rainbowrobotics/act_box_tilting_all_v5

## Resumen

El modelo `rainbowrobotics/act_box_tilting_all_v5` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), desarrollada por Rainbow Robotics y publicada en Hugging Face bajo licencia Apache 2.0. Está entrenada para ejecutar tareas de manipulación bimanual sobre el robot móvil RB-Y1, concretamente la inclinación de una caja hasta orientaciones verticales específicas. El modelo aprende por imitación a partir de demostraciones teleoperadas y predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación.

Con 51,7 millones de parámetros, esta política es relativamente ligera y está diseñada para ejecutarse en tiempo real sobre el hardware del robot. Utiliza como entrada el estado del robot (26 dimensiones) y una imagen de cámara frontal de 480×640 píxeles, y produce comandos de acción de 12 dimensiones. El modelo se ha entrenado con 123 episodios y más de 71.000 fotogramas, y está integrado en el ecosistema LeRobot, lo que facilita su despliegue y reproducción.

La relevancia de este modelo radica en que demuestra la aplicación práctica de ACT en un robot manipulador móvil comercial, con un pipeline completo de entrenamiento y despliegue documentado. Es un ejemplo representativo de cómo las políticas de imitación pueden transferirse a tareas físicas reales con un coste computacional moderado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.695.244 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; procesa observaciones de estado e imagen) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (modelo de control robótico, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que combina un codificador de visión (para procesar imágenes) con un transformador que predice secuencias de acciones futuras. En lugar de emitir una única acción por paso de control, el modelo genera un "chunk" de acciones (por ejemplo, varias decenas de pasos), lo que reduce la acumulación de errores y mejora la coherencia del movimiento. La arquitectura se basa en el paper original de Zhao et al. (2023), arxiv:2304.13705, y está implementada en la librería LeRobot.

El entrenamiento se realizó con el dataset `rainbowrobotics/box_tilting_all_v5`, que contiene 123 episodios de demostraciones teleoperadas del robot RB-Y1 realizando dos tareas: "Rotate the box 90 degrees upward" y "Rotate the box to a vertical orientation". El dataset incluye 71.135 fotogramas a 30 FPS, con observaciones de estado (posición articular, etc.) e imágenes de una cámara frontal. La configuración de entrenamiento fue de 50.000 pasos, batch size 64, optimizador AdamW con learning rate 1e-5 y semilla 1000. No se menciona el uso de RLHF ni DPO; es un entrenamiento supervisado de imitación puro.

## Capacidades

- Control robótico bimanual: genera comandos de acción de 12 dimensiones para los dos brazos del robot RB-Y1.
- Manipulación de objetos: especializado en tareas de inclinación y orientación de cajas, con dos variantes de tarea.
- Percepción visual: procesa imágenes RGB de 480×640 píxeles de una cámara frontal para guiar la política.
- Integración con LeRobot: compatible con el flujo de trabajo estándar de LeRobot para entrenamiento, evaluación y despliegue.
- Predicción por chunks: emite secuencias de acciones, lo que permite movimientos suaves y coordinados.
- Ejecución en tiempo real: diseñado para inferencia en el robot, con latencia adecuada para control de bucle cerrado.

## Casos de uso

- Automatización de líneas de empaquetado: el modelo puede orientar cajas o productos en una cinta transportadora, una tarea común en logística y manufactura. Su capacidad para predecir chunks de acciones permite movimientos precisos y repetibles.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de políticas ACT a nuevos robots o tareas, gracias a su implementación abierta en LeRobot y su licencia permisiva.
- Manipulación bimanual en entornos de laboratorio: el RB-Y1 es un robot de doble brazo; este modelo demuestra cómo coordinar ambos brazos para una tarea de inclinación, útil en experimentos de robótica colaborativa.
- Desarrollo de habilidades de manipulación para robots móviles: al combinar percepción visual y control de estado, puede adaptarse a escenarios donde el robot debe interactuar con objetos en movimiento o posiciones variables.
- Benchmarking de políticas de imitación: al estar disponible públicamente con métricas de entrenamiento claras, puede utilizarse como referencia para comparar otros métodos de aprendizaje por refuerzo o imitación en tareas físicas.
- Prototipado rápido en robótica de servicio: empresas que desarrollan robots para tareas domésticas o de asistencia pueden usar este modelo como base para enseñar nuevas manipulaciones con pocos datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). No se proporcionan métricas como tasa de éxito, precisión ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 51,7 millones de parámetros, la inferencia requiere menos de 1 GB de VRAM en FP32 (aproximadamente 207 MB de pesos). Con cuantización a FP16 o int8, el consumo sería aún menor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia (por ejemplo, NVIDIA GTX 1650, RTX 3050, o incluso CPU para pruebas). Para entrenamiento, se recomienda una GPU con 8-12 GB de VRAM (RTX 3070, RTX 4080, A100) para manejar el batch de 64 y las imágenes de 480×640.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama media e incluso en placas integradas si se reduce la resolución de imagen.
- Opciones de despliegue: el modelo se ejecuta mediante LeRobot, que soporta inferencia en PyTorch. Para despliegue en el robot, se usa el comando `lerobot-rollout` con el robot RB-Y1. También puede exportarse a ONNX o TensorRT para optimización, aunque no se documenta en la model card.
- Latencia y throughput: no se proporcionan datos específicos, pero al ser un modelo pequeño, la inferencia en GPU moderna debería ser inferior a 10 ms por paso, permitiendo control a 30 Hz o más.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para esta tarea. Sin embargo, se puede contextualizar con otros modelos ACT publicados en LeRobot:

| Modelo | Parámetros | Tarea | Robot | Licencia |
|---|---|---|---|---|
| rainbowrobotics/act_box_tilting_all_v5 | 51,7 M | Inclinación de caja | RB-Y1 | Apache 2.0 |
| Otros modelos ACT en LeRobot (ej. lerobot/aloha_mobile) | ~50-100 M | Varias tareas de manipulación | Aloha, etc. | Apache 2.0 |

La comparativa exacta no está disponible porque no hay benchmarks públicos que enfrenten estos modelos en la misma tarea. La arquitectura ACT es común en el ecosistema LeRobot, por lo que las diferencias principales radican en el dataset y el robot específico.

## Limitaciones y advertencias

- Especialización limitada: el modelo solo ha sido entrenado para dos tareas de inclinación de caja. No generaliza a otras manipulaciones sin reentrenamiento.
- Dependencia del robot: está calibrado para el RB-Y1 de Rainbow Robotics; su uso en otros robots requiere adaptación de las observaciones y acciones.
- Sin evaluación en robot real: no hay resultados de éxito reportados, por lo que su rendimiento real en el hardware no está verificado.
- Sensibilidad a la posición de cámara: la entrada visual es una imagen fija de una cámara frontal; cambios en la iluminación, ángulo o posición de la cámara pueden degradar el rendimiento.
- Riesgo de alucinación en acciones: como todo modelo de imitación, puede producir comandos erróneos si la observación difiere del dominio de entrenamiento, lo que podría causar movimientos inseguros.
- Licencia Apache 2.0: permite uso comercial, pero el robot RB-Y1 es un producto propietario; el modelo no incluye el firmware ni el SDK del robot.
- Sin soporte de lenguaje: no procesa instrucciones en texto; las tareas están fijadas en el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rainbowrobotics/act_box_tilting_all_v5
- Dataset de entrenamiento: https://huggingface.co/datasets/rainbowrobotics/box_tilting_all_v5
- Paper de ACT: https://huggingface.co/papers/2304.13705
- LeRobot (librería y documentación): https://github.com/huggingface/lerobot
- Documentación de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
- SDK del robot RB-Y1: https://github.com/RainbowRobotics/rby1-sdk
- Manual de desarrollo del RB-Y1: https://rainbowrobotics.github.io/rby1-dev/
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=rainbowrobotics/box_tilting_all_v5
