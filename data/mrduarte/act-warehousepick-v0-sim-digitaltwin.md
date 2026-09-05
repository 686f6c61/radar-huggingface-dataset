# MrDuarte/act-WarehousePick-v0-Sim-DigitalTwin

## Resumen

El modelo `MrDuarte/act-WarehousePick-v0-Sim-DigitalTwin` es una política de aprendizaje por imitación basada en ACT (Action Chunking with Transformers), desarrollada por MrDuarte. Se trata de un modelo de robótica que predice chunks de acciones en lugar de pasos individuales, lo que reduce el error acumulado en tareas de manipulación. Está entrenado sobre un gemelo digital (Digital Twin) del entorno WarehousePick, con la tarea de levantar todos los paquetes y colocarlos en una caja verde. El modelo usa un transformer con 51,67 millones de parámetros y está integrado en el ecosistema LeRobot de Hugging Face.

La relevancia del modelo radica en su aplicación a la automatización de tareas logísticas en almacenes y en su potencial para transferencia sim-to-real. Aunque la extensión de contexto no se especifica para este tipo de modelo, ACT trabaja con ventanas de observación y salidas en forma de secuencias de acciones. El modelo se distribuye con licencia Apache 2.0 y solo contiene pesos en formato safetensors.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (ACT) |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Nota: el pipeline declarado es `robotics` y la librería utilizada es LeRobot.

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que utiliza un transformer encoder-decoder para predecir secuencias de acciones (chunks) a partir de observaciones. En este caso, las observaciones incluyen el estado del robot (6 dimensiones) e imágenes de tres cámaras: `innomaker`, `intel_rgb` y `front`. La salida es un chunk de acciones de 6 dimensiones. El entrenamiento se realizó con el dataset `MrDuarte/WarehousePick-v0-Sim-DigitalTwin`, que contiene 82 episodios y 57.235 frames a 30 FPS. La configuración de entrenamiento incluye 100.000 pasos, batch size 4, optimizador AdamW con learning rate 1e-05, semilla 1000 y la versión 0.6.1 de LeRobot.

La principal innovación de ACT es la predicción de chunks de acciones, en lugar de acciones individuales, lo que mejora la precisión y la estabilidad del control en tareas teleoperadas. Este enfoque es especialmente útil en robótica de manipulación, donde los pequeños errores en cada paso pueden acumularse.

## Capacidades

- Generación de acciones de control para robots manipuladores de 6 grados de libertad (tipo `so101_follower`).
- Percepción multimodal a través de tres cámaras, capaz de procesar imágenes RGB de alta resolución (720x1280 para `innomaker` y `front`, 424x240 para `intel_rgb`).
- Aprendizaje por imitación a partir de demostraciones teleoperadas: el modelo reproduce comportamientos aprendidos del dataset.
- Predicción por chunks de acciones, lo que permite ejecutar secuencias de hasta 6 acciones por predicción.
- Integración nativa con el framework LeRobot, que ofrece utilidades para entrenamiento, inferencia y evaluación.
- No ofrece soporte de tool calling, function calling, ni capacidad de razonamiento de lenguaje, al tratarse de un modelo de robótica.
- No soporta múltiples idiomas, ya que no procesa texto ni comandos verbales.

## Casos de uso

- Pick and place en almacenes: el modelo puede levantar paquetes y depositarlos en una caja verde, automatizando tareas de clasificación en entornos logísticos.
- Entrenamiento en gemelos digitales: gracias a que el dataset es un Digital Twin, la política puede validarse en simulación antes de desplegarse en un robot físico, ahorrando costes y tiempo.
- Investigación en aprendizaje por imitación: sirve como baseline para comparar métodos de imitación y explorar variantes de ACT dentro de LeRobot.
- Integración en pipelines de LeRobot: los comandos `lerobot-rollout` y `lerobot-train` permiten ejecutar la política en un robot compatible o reentrenarla con nuevos datos.
- Docencia de robótica: el modelo es un ejemplo práctico de cómo entrenar y desplegar políticas de manipulación con fotos y estado del robot usando un framework de código abierto.
- Demostración de transferencia sim-to-real: al entrenar en un entorno simulado con cámaras similares a las reales, el modelo puede adaptarse a un robot `so101_follower` real, aunque requiere validación experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la información oficial. Dado que el modelo tiene 51,7 millones de parámetros, en FP32 los pesos ocupan aproximadamente 207 MB, lo que sugiere que es posible ejecutarlo en GPUs de consumo con 2 GB o más, siempre que el batch y las imágenes generen suficiente memoria. Sin embargo, no se ha proporcionado una medición de VRAM para inferencia.
- GPU recomendadas: no disponible. No hay recomendaciones oficiales del fabricante.
- Compatibilidad con GPUs de consumo: probablemente sí, dado el tamaño reducido del modelo, pero no hay datos oficiales que lo confirmen para la carga completa con imágenes.
- Opciones de despliegue: LeRobot, mediante el comando `lerobot-rollout`. No es un modelo de lenguaje, por lo que no aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de especificaciones de modelos comparables en la información proporcionada. Existe una variante del mismo autor, `MrDuarte/act-WarehousePick-v0-DigitalTwin_yolo`, que parece emplear detección YOLO junto con ACT, pero no se han facilitado sus parámetros ni datos de rendimiento para poder elaborar una comparativa rigurosa.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea "Lift all parcels and put them in the Green Box". No generalizará a otras tareas sin un reentrenamiento específico.
- No hay resultados de evaluación publicados, por lo que se desconoce su tasa de éxito real en el entorno físico.
- La política requiere las mismas cámaras y configuración del robot (`so101_follower`) utilizadas durante el entrenamiento. Cambios en la configuración de hardware pueden degradar el rendimiento.
- El conjunto de datos es un gemelo digital (simulado), lo que puede implicar una brecha sim-to-real si se despliega en un robot físico sin un ajuste adicional.
- Al estar basado en LeRobot 0.6.1, puede haber incompatibilidades con versiones posteriores del framework.
- No se han identificado sesgos específicos en la información disponible, pero al ser un modelo de percepción, puede heredar sesgos de los datos de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero requiere conservar los avisos de copyright y licencia en las redistribuciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MrDuarte/act-WarehousePick-v0-Sim-DigitalTwin
- Dataset de entrenamiento: https://huggingface.co/datasets/MrDuarte/WarehousePick-v0-Sim-DigitalTwin
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=MrDuarte/WarehousePick-v0-Sim-DigitalTwin
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Arquitectura ACT en arXiv: https://arxiv.org/abs/2304.13705
- LeRobot en GitHub: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Variante con YOLO: https://huggingface.co/MrDuarte/act-WarehousePick-v0-DigitalTwin_yolo
- Dataset WarehousePick-v0: https://huggingface.co/datasets/MrDuarte/WarehousePick-v0
