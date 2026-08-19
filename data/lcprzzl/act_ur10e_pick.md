# LCPRZZL/act_ur10e_pick

## Resumen

El modelo `LCPRZZL/act_ur10e_pick` es una política de imitación basada en Action Chunking with Transformers (ACT), entrenada con el framework LeRobot de Hugging Face. Está diseñada para controlar un brazo robótico UR10e en tareas de recogida y elevación de bloques, a partir de datos teleoperados. El modelo consume imágenes de dos cámaras (una cámara de profundidad Kinect y una cámara de muñeca) junto con el estado del robot, y produce acciones de control de 4 dimensiones.

Con 51,66 millones de parámetros, es un modelo compacto pensado para ejecutarse en tiempo real sobre un robot físico. Fue entrenado con 50 episodios teleoperados (9070 frames a 15 FPS) y está publicado bajo licencia Apache 2.0, lo que permite uso comercial y modificación. Su relevancia radica en que demuestra un flujo completo de entrenamiento de políticas robóticas con LeRobot, desde la recogida de datos hasta el despliegue, y puede servir como punto de partida para tareas similares de manipulación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.663.492 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en fp32 por defecto en safetensors) |
| Idiomas soportados | no aplicable (modelo de robótica, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales. La arquitectura combina un encoder de visión (basado en ResNet) para procesar las imágenes de las cámaras, un transformer que integra la información visual y el estado del robot, y un decoder que genera los chunks de acción. Este enfoque reduce la acumulación de errores en tareas de manipulación de larga duración y mejora la estabilidad del control.

El modelo fue entrenado con el dataset `LCPRZZL/ur10e_50ep_pick`, que contiene 50 episodios teleoperados de un UR10e realizando tareas como "pick up the white block" o "lift the cube". La configuración de entrenamiento incluye 100.000 pasos, batch size de 8, optimizador AdamW con learning rate de 1e-5 y semilla 1000, usando la versión 0.6.0 de LeRobot. No se indica el uso de RLHF ni DPO; es un entrenamiento puramente supervisado de imitación.

## Capacidades

- Control de brazo robótico: genera acciones de 4 dimensiones (posición y orientación del efector final) a partir de observaciones visuales y del estado del robot.
- Percepción multimodal: procesa simultáneamente una imagen de profundidad (Kinect) y una imagen RGB de cámara de muñeca, ambas a 480x640 píxeles.
- Aprendizaje por imitación: reproduce comportamientos teleoperados con alta fidelidad, incluyendo tareas de pick-and-place y elevación de objetos.
- Ejecución en tiempo real: al ser un modelo de 51M parámetros, puede inferir a frecuencias compatibles con el control de robots (15 FPS o más).
- Integración con LeRobot: compatible con el ecosistema de Hugging Face para robótica, incluyendo herramientas de entrenamiento, evaluación y despliegue.
- No incluye capacidades de lenguaje, tool calling ni razonamiento simbólico; es exclusivamente una política de control motor.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos industriales: el modelo puede controlar un UR10e para recoger bloques de una superficie y colocarlos en otra posición, replicando la tarea aprendida. Es adecuado por su tamaño reducido y su capacidad de operar con cámaras de bajo coste.
- Prototipado rápido de políticas robóticas con LeRobot: sirve como referencia para desarrolladores que quieren entrenar sus propios modelos ACT con datos propios, ya que el repositorio incluye instrucciones completas de entrenamiento y despliegue.
- Investigación en aprendizaje por imitación: permite estudiar el efecto del tamaño del dataset (solo 50 episodios) y la configuración de entrenamiento en el rendimiento de políticas ACT sobre robots reales.
- Pruebas de control en simuladores: aunque está entrenado con datos reales, puede adaptarse a entornos simulados (como Isaac Sim) para validar algoritmos antes del despliegue físico.
- Educación en robótica y aprendizaje automático: un ejemplo didáctico de cómo un transformer puede aprender tareas de manipulación a partir de demostraciones, con una implementación accesible y documentada.
- Benchmarking de hardware de inferencia: al ser un modelo pequeño, puede usarse para medir la latencia de inferencia en GPUs de consumo (Jetson, RTX) en aplicaciones de robótica embebida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real. No se dispone de métricas como tasa de éxito en tareas, ni comparaciones con otros métodos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene ~51,7M parámetros, lo que en fp32 ocupa unos 207 MB. Con cuantización a int8 o fp16 cabría en cualquier GPU con más de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 2 GB de VRAM (por ejemplo, Jetson Orin Nano, RTX 2060 o superior). Para entrenamiento, se recomienda al menos 8 GB de VRAM (RTX 3070, A100, etc.).
- Cabe en GPUs de consumo: sí, tanto en tarjetas de escritorio como en módulos embebidos tipo Jetson.
- Opciones de despliegue: el flujo oficial usa LeRobot con `lerobot-rollout`; también puede ejecutarse con PyTorch directo. No es compatible con vLLM, llama.cpp ni Ollama, al no ser un modelo de lenguaje.
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamaño, se espera una inferencia por debajo de 10 ms en una GPU moderna, pero depende del hardware y de la resolución de las imágenes.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoría en la información proporcionada. Existen otras políticas ACT entrenadas con LeRobot en Hugging Face (por ejemplo, `danisanch118/ur10e_act_v1`), pero no se han publicado métricas de rendimiento que permitan una comparación objetiva. Se recomienda consultar el Hub de Hugging Face para localizar modelos similares y evaluarlos sobre el mismo robot y tarea.

## Limitaciones y advertencias

- Sin evaluación publicada: la model card no incluye resultados de éxito en robot real, por lo que el rendimiento real es desconocido.
- Dataset limitado: solo 50 episodios para una tarea específica; puede no generalizar a variaciones de posición, iluminación o tipos de objeto.
- Dependencia de cámaras específicas: el modelo espera exactamente las dos cámaras usadas en el entrenamiento (Kinect de profundidad y cámara de muñeca), con las mismas resoluciones y posiciones.
- Sin capacidad de razonamiento simbólico: no puede planificar tareas complejas ni adaptarse a cambios de instrucción; solo reproduce la política aprendida.
- Riesgo de comportamiento errático en entornos no vistos: como cualquier modelo de imitación, puede fallar si las condiciones difieren notablemente del dataset de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero se debe mantener el aviso de licencia y citar el método ACT y LeRobot según la recomendación de los autores.

## Enlaces

- Repositorio del modelo: https://huggingface.co/LCPRZZL/act_ur10e_pick
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Dataset de entrenamiento: https://huggingface.co/datasets/LCPRZZL/ur10e_50ep_pick
- LeRobot (librería): https://github.com/huggingface/lerobot
- Documentación de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
