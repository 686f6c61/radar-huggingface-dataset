# moritzaweber/act_red_thingy_25eps

## Resumen

El modelo `moritzaweber/act_red_thingy_25eps` es una política robótica basada en Action Chunking with Transformers (ACT), entrenada mediante aprendizaje por imitación con el framework LeRobot de Hugging Face. Desarrollado por Moritz A. Weber, el modelo resuelve la tarea de agarre de un objeto rojo ("Grab the red thingy") sobre un robot tipo `so_follower` equipado con una cámara frontal. ACT predice secuencias de acciones (action chunks) en lugar de pasos individuales, lo que mejora la estabilidad del control en manipulación robótica.

El modelo cuenta con aproximadamente 51,7 millones de parámetros y fue entrenado sobre un conjunto de datos de 25 episodios teleoperados (8.394 fotogramas a 30 FPS). Su relevancia radica en ser un ejemplo práctico de aplicación de transformadores a la robótica de manipulación, publicado bajo licencia Apache 2.0, lo que permite su uso y modificación sin restricciones comerciales. Está integrado en el ecosistema LeRobot, lo que facilita su despliegue y reproducción en hardware robótico real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) - Transformer con codificador de visión y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable (política robótica, no modelo de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplicable (modelo de robótica, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que emplea una arquitectura transformer para predecir bloques de acciones futuras en lugar de acciones individuales. El modelo consume dos tipos de observaciones: el estado del robot (vector de 6 dimensiones, correspondiente a las articulaciones o pose del efector) y una imagen RGB de la cámara frontal con resolución de 480x640 píxeles. La salida es un vector de acción de 6 dimensiones, que define el movimiento del robot en cada paso de control.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.2) sobre un conjunto de datos de 25 episodios teleoperados que suman 8.394 fotogramas a 30 FPS. La configuración de entrenamiento incluye 10.000 pasos, tamaño de lote de 8, optimizador AdamW con tasa de aprendizaje de 1e-5 y semilla fija de 1000. No se menciona el uso de RLHF, DPO ni técnicas de refinamiento adicionales; se trata de un entrenamiento supervisado estándar de aprendizaje por imitación.

## Capacidades

- Manipulación robótica por aprendizaje por imitación: ejecuta la tarea de agarrar un objeto rojo en un entorno controlado.
- Predicción de chunks de acción: genera secuencias de acciones de 6 dimensiones, lo que reduce la acumulación de errores frente a políticas de paso único.
- Procesamiento visual: integra una cámara frontal RGB (480x640) como entrada de visión para percibir el entorno.
- Fusión de estado y visión: combina el estado articulado del robot (6 dimensiones) con la imagen de la cámara para tomar decisiones de control.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento, evaluación y despliegue de LeRobot.
- Sin capacidades de lenguaje, tool calling ni agentes: es un modelo puramente motor, sin interfaz de texto.

## Casos de uso

- Tareas de pick-and-place en entornos controlados: el modelo puede ejecutar agarres de objetos específicos (en este caso, un objeto rojo) sobre un robot seguidor, útil para automatizar líneas de clasificación o ensamblaje simples.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de políticas ACT entre tareas o la influencia del número de episodios en el rendimiento.
- Validación de pipelines LeRobot: permite probar el flujo completo de LeRobot (grabación de datos, entrenamiento, rollout) con un modelo ya entrenado y publicado.
- Prototipado rápido de manipulación robótica: al ser un modelo pequeño (51,7 M de parámetros), puede ejecutarse en hardware de gama media para validar conceptos de automatización antes de escalar a modelos mayores.
- Benchmark de reproducibilidad: al estar publicados el dataset, la configuración de entrenamiento y el código, puede usarse como caso de referencia para comparar variantes de ACT o de otros métodos de imitación.
- Educación en robótica con IA: adecuado para cursos o talleres donde se enseñe despliegue de políticas neuronales en robots reales, gracias a su licencia permisiva y su integración documentada con LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de evaluación en la información disponible. La model card indica explícitamente que no hay resultados de evaluación para esta política ("No evaluation results have been provided for this policy yet"). No se dispone de tasas de éxito en pruebas reales con el robot, por lo que no es posible comparar su rendimiento cuantitativo con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 51,7 M de parámetros con entrada de imagen 480x640, la inferencia puede ejecutarse con menos de 2 GB de VRAM en formato float32; con cuantización, podría operar incluso en CPU.
- GPU recomendadas: cualquier GPU con soporte CUDA de al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3050, RTX 4060) es suficiente. No requiere GPUs de datacenter.
- Compatibilidad con GPU de consumo: sí, el modelo cabe holgadamente en cualquier GPU consumer moderna.
- Opciones de despliegue: LeRobot ofrece el comando `lerobot-rollout` para ejecutar la política en el robot; también es compatible con el pipeline de inferencia de LeRobot y puede integrarse en scripts personalizados de PyTorch.
- Latencia y throughput: no disponibles. La latencia dependerá del hardware, la resolución de imagen y la frecuencia de control del robot (típicamente 30 Hz para este tipo de políticas).

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa con modelos alternativos. El modelo pertenece a la familia ACT publicada en el ecosistema LeRobot, donde existen múltiples políticas entrenadas para distintas tareas y robots, pero no se han publicado resultados comparativos entre ellas en la información disponible. Se recomienda consultar el hub de LeRobot en Hugging Face para localizar modelos comparables sobre la misma plataforma robótica.

## Limitaciones y advertencias

- Sin resultados de evaluación: no hay datos de tasa de éxito en el robot real, por lo que el rendimiento efectivo es desconocido.
- Datos de entrenamiento limitados: solo 25 episodios y una única tarea ("Grab the red thingy"), lo que restringe la generalización a variaciones de objeto, iluminación o posición.
- Dependencia del hardware específico: la política fue entrenada para un robot `so_follower` con una cámara frontal concreta; su transferencia a otros robots o configuraciones de cámara requiere reentrenamiento o adaptación.
- Riesgo de sobreajuste: con solo 25 episodios, el modelo puede memorizar las trayectorias del dataset y fallar ante perturbaciones del entorno.
- Sin capacidades de razonamiento o lenguaje: no es un modelo multimodal generalista; solo produce acciones de control a partir de observaciones de estado e imagen.
- Licencia Apache 2.0: permite uso comercial, pero el usuario es responsable de la seguridad del despliegue en robots físicos.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/moritzaweber/act_red_thingy_25eps
- Dataset de entrenamiento: https://huggingface.co/datasets/moritzaweber/red-thingy-25eps
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot sobre ACT: https://huggingface.co/docs/lerobot/main/en/act
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=moritzaweber/red-thingy-25eps
- Perfil de GitHub del autor: https://github.com/MoritzAWeber
