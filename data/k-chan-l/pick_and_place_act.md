# k-chan-l/pick_and_place_act

## Resumen

El modelo `k-chan-l/pick_and_place_act` es una política de aprendizaje por imitación para robótica, basada en el método Action Chunking with Transformers (ACT). ACT, propuesto en el paper arXiv:2304.13705, predice secuencias de acciones (action chunks) en lugar de acciones individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación teleoperada. Este modelo concreto ha sido entrenado con el framework LeRobot de Hugging Face sobre el dataset `k-chan-l/pick_and_place`, orientado a tareas de pick-and-place (recoger y colocar objetos).

Con 51,6 millones de parámetros, es un modelo compacto diseñado para ejecutarse en tiempo real en robots manipuladores, típicamente en un brazo robótico SO-100 u similar. Su relevancia radica en que demuestra cómo un transformer relativamente pequeño puede aprender políticas de control motor a partir de demostraciones humanas, sin necesidad de modelos de lenguaje masivos ni de visión general. La licencia Apache 2.0 permite uso comercial y modificación sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Action Chunking with Transformers, ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende de la configuracion de entrenamiento, tipicamente ventanas de observacion y accion cortas) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (modelo de control motor, no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un codificador de visión (típicamente ResNet) con un transformer que genera "chunks" de acciones futuras. En lugar de predecir una sola acción por paso de tiempo, el modelo predice una secuencia de acciones (por ejemplo, 50 pasos) que el robot ejecuta de forma abierta, reduciendo la acumulación de errores. El entrenamiento se realiza mediante comportamiento clonado sobre datos teleoperados, sin refuerzo ni ajuste por preferencias humanas (RLHF/DPO).

En este caso, el modelo fue entrenado con LeRobot, la librería de Hugging Face para robótica, sobre el dataset `k-chan-l/pick_and_place`. No se dispone de información pública sobre el número de tokens, la composición exacta del dataset ni el número de épocas. La arquitectura concreta (número de capas, heads, tamaño de embedding) no está documentada en la model card, aunque el tamaño total de parámetros (51,6M) sugiere una configuración pequeña, adecuada para inferencia en tiempo real en hardware embebido o GPU de gama baja.

## Capacidades

- Control robótico de manipulación: genera comandos de posición y orientación del efector final para tareas de pick-and-place.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones teleoperadas, sin necesidad de programación explícita de trayectorias.
- Predicción de secuencias de acciones (action chunking): emite bloques de acciones futuras, lo que mejora la suavidad y robustez del movimiento.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento, evaluación y despliegue de LeRobot, incluyendo robots SO-100 y otros brazos soportados.
- No soporta procesamiento de lenguaje, visión general ni tool calling: es un modelo puramente motor, sin capacidades multimodales fuera de su entrada visual específica (imágenes de cámara del robot).

## Casos de uso

- Automatización de tareas de pick-and-place en entornos controlados: el modelo puede ejecutar la tarea de recoger un objeto de una posición y colocarlo en otra, aprendida de demostraciones, en un banco de pruebas de laboratorio o línea de montaje sencilla.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el efecto del action chunking en la tasa de éxito y la generalización a nuevas posiciones.
- Prototipado rápido de políticas robóticas: con LeRobot, un investigador puede entrenar y desplegar esta política en un brazo SO-100 en pocas horas, sin necesidad de escribir controladores clásicos.
- Evaluación de generalización a variaciones de iluminación o posición: al ser un modelo pequeño, es fácil de iterar y comparar con otras configuraciones de ACT.
- Benchmarking de frameworks de robótica: permite comparar el rendimiento de LeRobot frente a otras librerías de imitación (por ejemplo, robomimic) en la misma tarea.
- Educación en robótica y aprendizaje automático: como ejemplo didáctico de transformer aplicado a control motor, con código y datos abiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de éxito, tasas de acierto ni comparaciones con otros modelos. El dataset asociado (`k-chan-l/pick_and_place`) tampoco proporciona métricas de evaluación en la información consultada.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51,6M de parámetros, en FP32 el modelo ocupa aproximadamente 207 MB; en FP16, unos 103 MB. La VRAM necesaria dependerá del tamaño de lote y de la resolución de las imágenes de entrada, pero en la práctica cabe en cualquier GPU con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna de NVIDIA (GTX 1060 6GB o superior, RTX 3060, RTX 4090) es suficiente. También puede ejecutarse en CPU para pruebas lentas, aunque la inferencia en tiempo real requiere GPU.
- Compatibilidad con GPU de consumo: sí, es un modelo muy ligero que cabe en GPUs de gama baja y media.
- Opciones de despliegue: LeRobot proporciona scripts de evaluación e inferencia (`lerobot-record`). También puede exportarse a ONNX o TensorRT para optimización, aunque no hay documentación oficial al respecto.
- Latencia y throughput: no se dispone de datos medidos. Dado el tamaño, se espera una latencia de pocos milisegundos por paso en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa cuantitativa con otros modelos. Existen otros checkpoints de ACT en Hugging Face (por ejemplo, `kkh4476/pick_and_place4_act_model` o `k-chan-l/pick_and_place2_act`) que probablemente comparten arquitectura y tarea, pero no se han publicado métricas comparativas. En la literatura, ACT se compara con métodos como Diffusion Policy o Behavior Transformers, pero no hay datos específicos de este modelo.

## Limitaciones y advertencias

- Especialización limitada: el modelo está entrenado para una tarea concreta (pick-and-place) y un robot específico (SO-100). No generaliza a otras tareas ni a otros robots sin reentrenamiento.
- Dependencia de la calidad de las demostraciones: el rendimiento depende directamente de la calidad y variedad de los datos teleoperados. Demostraciones inconsistentes producen políticas frágiles.
- Riesgo de sobreajuste: al ser un modelo pequeño y entrenado sobre un dataset presumiblemente reducido, puede fallar ante variaciones de iluminación, posición de cámara o texturas no vistas en el entrenamiento.
- Sin capacidades de razonamiento o lenguaje: no puede interpretar instrucciones verbales ni adaptarse a cambios de objetivo en tiempo real.
- Sin información sobre sesgos: al ser un modelo de control motor, no aplican sesgos lingüísticos o sociales, pero puede presentar sesgos en la distribución de objetos o poses del dataset de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar que el dataset asociado también cumple con los requisitos de su proyecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/k-chan-l/pick_and_place_act
- Paper de ACT: https://huggingface.co/papers/2304.13705
- LeRobot (librería de entrenamiento): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Dataset asociado: https://huggingface.co/datasets/k-chan-l/pick_and_place
