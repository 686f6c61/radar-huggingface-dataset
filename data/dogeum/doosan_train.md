# dogeum/doosan_train

## Resumen

`dogeum/doosan_train` es un modelo de robótica basado en Action Chunking with Transformers (ACT), una técnica de aprendizaje por imitación que predice secuencias de acciones en lugar de pasos individuales. Desarrollado por el usuario dogeum y entrenado con la librería LeRobot de HuggingFace, el modelo está diseñado para controlar un robot manipulador de 6 grados de libertad en la tarea de recoger una ficha roja (`pick_red_token`), a partir de observaciones visuales de dos cámaras y del estado del robot.

Con aproximadamente 51,7 millones de parámetros, este modelo es considerablemente más pequeño que los modelos de lenguaje modernos, ya que su propósito no es el procesamiento de texto sino la generación de comandos de actuación robótica. Su relevancia radica en que demuestra el flujo completo de entrenamiento de políticas robóticas con LeRobot: captura de datos teleoperados, entrenamiento de una política ACT y despliegue en un robot real, todo ello bajo una licencia Apache-2.0 que permite su uso comercial.

El modelo se publicó en agosto de 2026 con un tamaño de repositorio de 0,2 GB y formato de pesos safetensors. Aunque los datos de entrenamiento son muy reducidos (solo 5 episodios y 4.972 frames), el proyecto sirve como referencia práctica para quienes deseen reproducir el flujo de trabajo de LeRobot con un robot Doosan.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de robótica, no de lenguaje) |
| Tipos de cuantización | no disponible (pesos en precisión completa en safetensors) |
| Idiomas soportados | no aplica (modelo de control robótico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT (Action Chunking with Transformers), presentada en el paper [2304.13705](https://huggingface.co/papers/2304.13705). ACT es un método de aprendizaje por imitación que utiliza un transformer para predecir bloques de acciones (chunks) en lugar de acciones individuales, lo que reduce el error de acumulación y mejora la estabilidad de la ejecución. El modelo consume como entrada dos imágenes de cámaras (izquierda y derecha) de resolución 128×128 píxeles, junto con un vector de estado del robot de 6 dimensiones, y produce un vector de acción de 6 dimensiones.

El entrenamiento se realizó con el framework LeRobot versión 0.6.0, sobre un dataset de teleoperación propio (`dogeum/doosan_dataset`) que contiene 5 episodios de la tarea `pick_red_token` a 20 FPS. La configuración de entrenamiento incluye 10.000 pasos, batch size de 16, optimizador AdamW con una tasa de aprendizaje de 1e-5 y semilla 1000. No se menciona el uso de RLHF, DPO ni otras técnicas de refinamiento adicionales; el modelo se entrena exclusivamente mediante imitación supervisada.

## Capacidades

- Generación de acciones de control robótico: predice secuencias de acciones de 6 dimensiones (posición y orientación del efector final) a partir de observaciones visuales y del estado.
- Percepción visual multimodal: procesa simultáneamente dos cámaras (izquierda y derecha) con imágenes de 128×128.
- Aprendizaje por imitación: copia el comportamiento demostrado por un operador humano en teleoperación.
- Ejecución de tareas de manipulación: específicamente diseñado para la tarea de recogida de una ficha roja (`pick_red_token`).
- Integración con LeRobot: compatible con el ecosistema de entrenamiento, evaluación y despliegue de LeRobot.
- Inferencia en tiempo real: el modelo es ligero (51,7M parámetros) y apto para ejecución en hardware de bajo coste.

## Casos de uso

- Automatización de tareas de pick and place en línea de producción: el modelo puede controlar un brazo robótico para recoger piezas de una posición fija y colocarlas en otra, gracias a su arquitectura ACT que predice secuencias de acciones estables.
- Robótica educativa e investigación: sirve como referencia práctica para estudiantes e investigadores que quieran aprender a entrenar políticas de manipulación con LeRobot, ya que el repositorio incluye el flujo completo de entrenamiento y despliegue.
- Prototipado rápido de células de trabajo: con un dataset pequeño (5 episodios) se puede validar rápidamente si una tarea es aprendible por imitación antes de invertir en la recopilación de grandes volúmenes de datos.
- Automatización de laboratorios: el modelo puede integrarse en un brazo robótico para realizar tareas repetitivas de manipulación de muestras, como recoger y mover viales o placas de Petri.
- Benchmark de políticas de aprendizaje por imitación: al ser un modelo público y ligero, puede utilizarse como baseline para comparar el rendimiento de otras arquitecturas de políticas robóticas en tareas similares.
- Desarrollo de sistemas de demostración para ferias y museos: la naturaleza del modelo (visual y de control) lo hace adecuado para montar una demostración interactiva de robótica con un brazo real, sin necesidad de infraestructura de alto coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito en robot real, ni comparaciones con otras políticas. La sección de evaluación del README está vacía y solo indica: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente, pero por el tamaño de parámetros (51,7M) y la entrada de imágenes de 128×128, el modelo debería ejecutarse en cualquier GPU con al menos 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU NVIDIA moderna con CUDA (GTX 1650 o superior) es suficiente. Una RTX 3060 o superior permitiría inferencia en tiempo real sin problemas.
- Compatible con GPU de consumo: sí, el modelo cabe en tarjetas de gama baja y media.
- Opciones de despliegue: LeRobot proporciona el comando `lerobot-rollout` para ejecutar la política en un robot compatible. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se han publicado datos oficiales. Dado el tamaño y la entrada de imágenes, se espera una latencia de decenas de milisegundos en GPU moderna.

## Comparativa con modelos similares

No se dispone de datos comparativos de otros modelos de políticas robóticas con la misma arquitectura y tarea en la información disponible. En el ecosistema LeRobot existen otras políticas entrenadas con ACT sobre distintos robots y tareas, pero no se han publicado resultados de rendimiento comparables para este modelo específico. La comparativa directa no está disponible.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido: solo 5 episodios (4972 frames), lo que implica un alto riesgo de sobreajuste y una generalización limitada a variaciones de la tarea (cambios de posición de la ficha, iluminación, etc.).
- Tarea específica: el modelo está entrenado únicamente para la tarea `pick_red_token` con una configuración de cámaras concreta. No es reutilizable para otras tareas sin reentrenamiento.
- Sin evaluación en robot real: la model card indica explícitamente que no se han proporcionado resultados de evaluación, por lo que el rendimiento real en un robot físico es desconocido.
- Dependencia de la calibración: la entrada de estado es de 6 dimensiones y las cámaras deben estar calibradas y colocadas según la configuración de entrenamiento; cualquier desviación afectará al rendimiento.
- Riesgo de alucinación de acciones: como todo modelo de aprendizaje por imitación, puede generar acciones no seguras si se enfrenta a observaciones fuera de la distribución de entrenamiento.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero no incluye garantías de seguridad para aplicaciones industriales críticas.

## Enlaces

- Repositorio del modelo: [https://huggingface.co/dogeum/doosan_train](https://huggingface.co/dogeum/doosan_train)
- Dataset de entrenamiento: [https://huggingface.co/datasets/dogeum/doosan_dataset](https://huggingface.co/datasets/dogeum/doosan_dataset)
- Paper de ACT: [https://huggingface.co/papers/2304.13705](https://huggingface.co/papers/2304.13705)
- Repositorio de LeRobot: [https://github.com/huggingface/lerobot](https://github.com/huggingface/lerobot)
- Documentación de LeRobot (guía ACT): [https://huggingface.co/docs/lerobot/main/en/act](https://huggingface.co/docs/lerobot/main/en/act)
- Visualización del dataset: [https://huggingface.co/spaces/lerobot/visualize_dataset?path=dogeum/doosan_dataset](https://huggingface.co/spaces/lerobot/visualize_dataset?path=dogeum/doosan_dataset)
