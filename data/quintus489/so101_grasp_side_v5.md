# Quintus489/so101_grasp_side_v5

## Resumen

El modelo `Quintus489/so101_grasp_side_v5` es una política de imitación basada en Action Chunking with Transformers (ACT), entrenada con el framework LeRobot de Hugging Face. ACT, presentado en el paper arXiv:2304.13705, predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación robótica. Este modelo concreto está entrenado para la tarea de agarrar un objeto sobre una mesa (grasp object on table) usando un robot seguidor tipo `so_follower` con una cámara RGB.

El modelo tiene 51,7 millones de parámetros, un tamaño muy reducido que permite ejecutarlo en hardware modesto. Se distribuye con licencia Apache 2.0 y está pensado para ser desplegado mediante las herramientas de LeRobot (`lerobot-rollout`). Es relevante ahora porque representa un ejemplo práctico de políticas de imitación entrenadas con pocos datos (50 episodios) y transferibles a robots reales de bajo coste, un área en plena expansión dentro de la robótica open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador y decodificador |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de observación fija: 1 imagen + estado, chunk de acciones) |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precisión completa) |
| Idiomas soportados | no aplica (modelo de robótica, sin procesamiento de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT combina un codificador de visión (para procesar la imagen de la cámara `main` de 480x640) con un transformador que genera un chunk de acciones de longitud fija. La entrada incluye el estado del robot (`observation.state`, 6 dimensiones) y la imagen; la salida es un vector de acción de 6 dimensiones (probablemente posiciones o velocidades de las articulaciones del brazo). La política se entrena mediante imitación directa con datos teleoperados, sin refuerzo.

El entrenamiento se realizó con el dataset `Quintus489/so101_grasp_side_v5`, que contiene 50 episodios y 67.250 frames a 30 FPS, grabados con un robot `so_follower`. Se usaron 70.000 pasos de entrenamiento, batch size 8, optimizador AdamW y learning rate de 1e-5, con semilla 1000. La versión de LeRobot empleada fue la 0.6.1. No se indica el uso de RLHF, DPO ni otras técnicas de post-entrenamiento; es un entrenamiento puramente supervisado de imitación.

## Capacidades

- Manipulación robótica de precisión: agarre de objetos sobre una mesa, con control de 6 grados de libertad.
- Percepción visual: procesa imágenes RGB de 480x640 de una cámara principal.
- Control en bucle cerrado: recibe el estado del robot y la imagen en cada paso para generar acciones.
- Ejecución en tiempo real: al predecir chunks de acciones, reduce la frecuencia de inferencia necesaria y mejora la fluidez del movimiento.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento, despliegue y evaluación de Hugging Face.
- No incluye capacidades de lenguaje, tool calling, agentes ni razonamiento simbólico.

## Casos de uso

- Automatización de tareas de pick-and-place en laboratorio: el modelo puede ejecutar agarres repetitivos de objetos en posiciones conocidas, liberando a operarios humanos de tareas tediosas.
- Prototipado de políticas de imitación en robótica educativa: al ser ligero (51,7 M de parámetros) y entrenado con solo 50 episodios, sirve como punto de partida para estudiantes que quieran experimentar con ACT en robots de bajo coste.
- Investigación en aprendizaje por imitación: permite estudiar el efecto del chunking de acciones y la generalización a nuevas posiciones de objetos, ya que el dataset y el código de entrenamiento son públicos.
- Benchmark de control robótico: puede usarse como baseline en tareas de agarre lateral, comparando su tasa de éxito con otras arquitecturas (diffusion policies, etc.).
- Despliegue en robots SO-101 o similares: el modelo está entrenado específicamente para el robot `so_follower`, por lo que puede cargarse directamente en ese hardware mediante `lerobot-rollout`.
- Generación de datos sintéticos para entrenar otros modelos: las acciones generadas pueden registrarse y utilizarse para ampliar datasets de imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet". No se reportan tasas de éxito en el robot real ni métricas en simulación.

## Requisitos de hardware

- VRAM estimada: el modelo tiene ~51,7 M de parámetros; en FP32 ocupa aproximadamente 207 MB de memoria. La inferencia puede ejecutarse en cualquier GPU con al menos 1 GB de VRAM, incluso en CPU.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA (GTX 1050 Ti o superior) es suficiente; también funciona en Jetson Nano o similares.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo actual (RTX 2060, RTX 3060, etc.) y en muchas integradas.
- Opciones de despliegue: LeRobot CLI (`lerobot-rollout`), que gestiona la carga del modelo y la conexión con el robot. También se puede integrar en scripts Python usando la API de LeRobot.
- Latencia y throughput: no se proporcionan datos medidos. Dado el tamaño reducido, se espera una inferencia en el orden de milisegundos en GPU moderna, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de datos comparativos con otras políticas entrenadas para la misma tarea o con el mismo robot. Como referencia metodológica, ACT se compara en el paper original (arXiv:2304.13705) con métodos como Diffusion Policy y Behavior Cloning simple, pero no hay resultados específicos de este modelo entrenado. La comparativa queda pendiente de evaluación real.

## Limitaciones y advertencias

- Sesgos del dataset: entrenado con 50 episodios de un único operador y una configuración de cámara fija; puede no generalizar a otras posiciones de cámara, iluminación o tipos de objeto.
- Riesgo de alucinación: en robótica, el riesgo se manifiesta como acciones erróneas o inestables ante observaciones fuera de la distribución de entrenamiento; no hay evaluación de robustez.
- Limitaciones de contexto: la política está diseñada para una tarea específica (agarre lateral) y no es reutilizable para otras tareas sin reentrenamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo depende de LeRobot y del hardware específico; no hay restricciones adicionales.
- Caveat de producción: no se ha validado en robot real según la model card; cualquier uso en producción requiere pruebas exhaustivas de seguridad y supervisión humana.

## Enlaces

- [Repositorio del modelo en Hugging Face](https://huggingface.co/Quintus489/so101_grasp_side_v5)
- [Dataset de entrenamiento](https://huggingface.co/datasets/Quintus489/so101_grasp_side_v5)
- [Visualización del dataset](https://huggingface.co/spaces/lerobot/visualize_dataset?path=Quintus489/so101_grasp_side_v5)
- [Paper de ACT (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía de ACT en LeRobot](https://huggingface.co/docs/lerobot/main/en/act)
- [Repositorio de LeRobot en GitHub](https://github.com/huggingface/lerobot)
