# addisonhammer/act_so101_pink_die

## Resumen

El modelo `addisonhammer/act_so101_pink_die` es una política de control robótico basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias de acciones en lugar de pasos individuales. Ha sido entrenado con la librería LeRobot de Hugging Face para controlar un brazo robótico SO-101 (modelo seguidor) en la tarea de recoger un dado rosa y colocarlo dentro de una taza metálica. El modelo consume imágenes de dos cámaras (vista cenital y muñeca) junto con el estado del robot, y produce comandos de acción de 6 dimensiones.

Con 51,7 millones de parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto diseñado para ejecutarse en tiempo real en hardware robótico. Su relevancia radica en que demuestra el flujo completo de entrenamiento de políticas robóticas con LeRobot, desde la recopilación de datos teleoperados hasta el despliegue en el robot, y está publicado bajo licencia Apache-2.0, lo que permite su uso y modificación sin restricciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con action chunking (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | no disponible (no se han publicado cuantizaciones) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT (Action Chunking with Transformers), descrita en el paper arXiv:2304.13705. ACT es un método de aprendizaje por imitación que utiliza un transformer encoder-decoder para predecir un "chunk" de acciones futuras (una secuencia de varios pasos) a partir de observaciones actuales, lo que reduce el error de acumulación típico de los métodos paso a paso. En este caso, el modelo recibe como entrada el estado del robot (6 dimensiones) y dos imágenes RGB de 480x640 píxeles (cámara cenital y cámara de muñeca), y genera una acción de 6 dimensiones.

El entrenamiento se realizó con el dataset `addisonhammer/so101_pink_die_in_cup_20260817_220140`, que contiene 25 episodios teleoperados con un total de 7.574 frames a 30 FPS, correspondientes a la tarea "Pick up the hot pink die and place it into the metal cup". La configuración de entrenamiento incluye 5 pasos de entrenamiento, batch size de 16, optimizador AdamW, learning rate de 1e-5, seed 1000 y la versión 0.6.2 de LeRobot. No se menciona el uso de RLHF, DPO ni otras técnicas de refinamiento posteriores.

## Capacidades

- Control robótico por imitación: el modelo es capaz de ejecutar una tarea de manipulación aprendida (recoger y colocar un objeto) a partir de observaciones visuales y de estado.
- Percepción visual multimodal: procesa simultáneamente dos flujos de imagen (cámara cenital y cámara de muñeca) con resolución 480x640.
- Predicción de acciones en chunk: genera secuencias de acciones (action chunking) en lugar de acciones individuales, lo que mejora la estabilidad del movimiento.
- Integración con LeRobot: compatible con el ecosistema LeRobot para entrenamiento, evaluación y despliegue en robots SO-101.
- Inferencia en tiempo real: al ser un modelo de 51M de parámetros, es adecuado para ejecución en tiempo real en hardware robótico con GPU.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades de lenguaje, ya que es un modelo puramente motor.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos controlados: el modelo puede integrarse en un brazo robótico SO-101 para realizar tareas repetitivas de recogida y colocación de objetos pequeños, como en líneas de montaje o laboratorios de investigación.
- Prototipado rápido de políticas robóticas: investigadores pueden usar este modelo como punto de partida para entrenar nuevas tareas mediante fine-tuning con datasets propios, gracias a su formato LeRobot.
- Evaluación de algoritmos de aprendizaje por imitación: sirve como referencia para comparar el rendimiento de ACT frente a otros métodos (por ejemplo, Diffusion Policy) en tareas de manipulación con pocas demostraciones.
- Demostraciones educativas de robótica con IA: el modelo es útil en cursos y talleres que enseñan el flujo completo de recopilación de datos, entrenamiento y despliegue de políticas robóticas con LeRobot.
- Investigación en generalización de tareas: al estar entrenado con solo 25 episodios, puede utilizarse para estudiar cómo mejorar la robustez y generalización de políticas ACT con datos limitados.
- Despliegue en robots SO-101 de bajo coste: el modelo es lo suficientemente ligero para ejecutarse en GPUs de gama media, lo que facilita su uso en configuraciones de robótica asequibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). No se dispone de métricas como tasa de éxito, precisión de agarre ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Dado el tamaño del modelo (51M parámetros), se estima que puede ejecutarse en GPUs con al menos 4 GB de VRAM, pero no hay datos oficiales.
- GPU recomendadas: no se especifican. Por el tamaño, una GPU como NVIDIA RTX 3060 o superior sería suficiente para inferencia en tiempo real.
- Compatibilidad con GPU de consumo: probablemente sí, dado el reducido número de parámetros, pero no hay confirmación oficial.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) y entrenamiento (`lerobot-train`). También es compatible con el ecosistema Hugging Face y puede ejecutarse en entornos con PyTorch y CUDA.
- Latencia y throughput: no disponibles. Se espera que sea adecuado para control en tiempo real a 30 FPS, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa con otros modelos de la misma categoría. Existen otros repositorios de políticas ACT para el brazo SO-101 (por ejemplo, `aiden-li/so101-act` o `jian001/act_so101_test_model`), pero no se han publicado especificaciones detalladas ni resultados de rendimiento que permitan una comparación objetiva. Se recomienda consultar la documentación de LeRobot y los papers de referencia para contextualizar este modelo dentro del estado del arte.

## Limitaciones y advertencias

- Entrenamiento con datos muy limitados: solo 25 episodios y 5 pasos de entrenamiento, lo que probablemente resulte en una política poco robusta frente a variaciones de iluminación, posición del objeto o perturbaciones externas.
- Sin evaluación en robot real: la model card indica que no hay resultados de evaluación, por lo que se desconoce la tasa de éxito real en el hardware objetivo.
- Tarea específica: el modelo está entrenado únicamente para la tarea de recoger un dado rosa y colocarlo en una taza metálica. No generaliza a otros objetos o configuraciones sin reentrenamiento.
- Dependencia de la configuración de cámaras: las observaciones requieren dos cámaras específicas (cenital y muñeca) con resoluciones y posiciones concretas; cualquier cambio en la configuración invalida el modelo.
- Riesgo de sobreajuste: con tan pocos datos y pasos de entrenamiento, es probable que el modelo memorice las demostraciones y falle ante variaciones mínimas.
- Licencia Apache-2.0: permite uso comercial, pero el usuario es responsable de verificar que el hardware y el entorno cumplen los requisitos de seguridad.
- No es un modelo de lenguaje ni de propósito general: no debe utilizarse fuera del ámbito de control robótico para el que fue diseñado.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/addisonhammer/act_so101_pink_die
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Dataset de entrenamiento: https://huggingface.co/datasets/addisonhammer/so101_pink_die_in_cup_20260817_220140
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
