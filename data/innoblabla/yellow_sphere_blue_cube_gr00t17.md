# innoblabla/yellow_sphere_blue_cube_GR00T17

## Resumen

El modelo `innoblabla/yellow_sphere_blue_cube_GR00T17` es una política de robótica entrenada mediante aprendizaje por imitación con el framework LeRobot, basada en el modelo fundacional GR00T N1.7 de NVIDIA. Está diseñada para controlar un robot manipulador tipo `so_follower` en tareas de recogida y colocación de objetos (una esfera amarilla y un cubo azul) en una copa. El modelo procesa observaciones multimodales —estado del robot (6 dimensiones) e imágenes de tres cámaras (pince, base y top) a 480×640 píxeles— y genera acciones de 6 dimensiones.

Con 3.144.016.000 parámetros (aproximadamente 3,14 mil millones), este modelo representa una aplicación práctica de los modelos GR00T de NVIDIA en entornos de robótica real, utilizando un backbone Cosmos-Reason2/Qwen3-VL y un action transformer con flow-matching. Fue entrenado sobre un dataset propio de 120 episodios (46.228 fotogramas a 30 FPS) con dos tareas específicas, y se distribuye bajo licencia Apache 2.0. Su relevancia radica en demostrar el uso de modelos fundacionales de robótica de código abierto para tareas de manipulación con aprendizaje por imitación, accesible a través del ecosistema LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (backbone Cosmos-Reason2/Qwen3-VL + action transformer con flow-matching) |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GR00T N1.7 de NVIDIA, un modelo fundacional cross-embodiment para razonamiento y habilidades robóticas. Utiliza un backbone Cosmos-Reason2/Qwen3-VL para procesar entradas visuales y de lenguaje, y un action transformer con flow-matching para predecir acciones condicionadas por visión, lenguaje y propiocepción. En esta implementación concreta, el modelo recibe como entrada el estado del robot (vector de 6 dimensiones) y tres imágenes de cámaras (pince, base y top) de 480×640 píxeles, y produce una acción de 6 dimensiones.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.1) sobre el dataset `innoblabla/yellow_sphere_blue_cube`, que contiene 120 episodios y 46.228 fotogramas a 30 FPS. Las tareas definidas son "pick up the yellow sphere and place it in the goblet" y "pick up the blue cube and place it in the goblet". La configuración de entrenamiento incluye 20.000 pasos, batch size de 32, optimizador AdamW con learning rate de 0,0001 y semilla 42. No se especifica el uso de RLHF, DPO u otras técnicas de refinamiento; se trata de un entrenamiento supervisado de imitación.

## Capacidades

- Control robótico de manipulación: predice acciones de 6 dimensiones (posición y orientación del efector final) a partir de observaciones de estado y visión.
- Percepción multimodal: procesa simultáneamente tres flujos de imagen (cámara de pinza, cámara base y cámara superior) junto con el estado propioceptivo del robot.
- Ejecución de tareas de pick-and-place: entrenado específicamente para recoger una esfera amarilla o un cubo azul y colocarlos en una copa.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento y despliegue de LeRobot, incluyendo comandos CLI como `lerobot-rollout` y `lerobot-train`.
- Generalización limitada a tareas similares: al ser un modelo de imitación, puede transferirse a variaciones de las mismas tareas (cambios de posición, iluminación) si el robot y las cámaras son equivalentes.
- No incluye capacidades de lenguaje, tool calling, agentes ni razonamiento multi-paso fuera del ámbito robótico.

## Casos de uso

- Automatización de tareas de recogida y colocación en laboratorios: el modelo puede controlar un brazo robótico para clasificar objetos (esferas y cubos) en contenedores, reduciendo la intervención manual en entornos de investigación.
- Prototipado rápido de políticas robóticas: gracias a su integración con LeRobot, los desarrolladores pueden cargar el modelo y ejecutar rollouts en minutos, sirviendo como punto de partida para tareas más complejas.
- Benchmarking de modelos de imitación: al estar entrenado con un dataset público y reproducible, puede utilizarse como referencia para comparar arquitecturas de políticas robóticas en tareas de manipulación.
- Educación en robótica: permite a estudiantes e investigadores experimentar con un modelo fundacional de robótica sin necesidad de entrenar desde cero, usando hardware asequible como el robot `so_follower`.
- Transferencia a tareas similares: con un fine-tuning adicional sobre nuevos datasets, el modelo puede adaptarse a otros objetos o configuraciones de copa, aprovechando su representación visual preentrenada.
- Evaluación de hardware robótico: al ser un modelo de tamaño moderado (3,14B parámetros), puede desplegarse en GPUs de consumo para validar la integración de cámaras y actuadores en un robot real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). No se dispone de métricas como tasa de éxito, MMLU, HumanEval u otras, ya que se trata de un modelo de robótica y no de lenguaje o razonamiento general.

## Requisitos de hardware

- No se proporcionan requisitos específicos de hardware en la documentación del modelo.
- Dado el tamaño de 3,14 mil millones de parámetros y el procesamiento de tres imágenes de 480×640, se estima que la inferencia requiere una GPU con al menos 8-12 GB de VRAM para cargar los pesos en precisión FP16, aunque no hay confirmación oficial.
- El modelo se distribuye en formato safetensors, compatible con PyTorch y el framework LeRobot. No se mencionan cuantizaciones (GGUF, etc.) ni despliegue con vLLM, Ollama o TGI, ya que no es un modelo de lenguaje.
- Para el entrenamiento, la configuración usada (batch size 32, 20.000 pasos) sugiere una GPU de gama alta (por ejemplo, RTX 3090/4090 o A100), pero no se especifica.
- El despliegue se realiza mediante los comandos de LeRobot (`lerobot-rollout`), que requieren el robot `so_follower` y las cámaras configuradas.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de robótica similares. El modelo es una instancia específica de GR00T N1.7 entrenada para tareas concretas, y no se han encontrado en la información proporcionada otros modelos comparables con los mismos parámetros, contexto o rendimiento. Se recomienda consultar el repositorio de NVIDIA Isaac-GR00T para conocer la familia completa de modelos.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para dos tareas concretas (recoger esfera amarilla o cubo azul y colocarlos en una copa). No generaliza a otros objetos, posiciones o configuraciones sin un fine-tuning adicional.
- No se han publicado resultados de evaluación en robot real, por lo que su tasa de éxito y robustez son desconocidas. Se recomienda validar el modelo en el hardware objetivo antes de usarlo en producción.
- Depende de la configuración exacta de cámaras y robot: los nombres de las cámaras (`pince`, `base`, `top`) y el tipo de robot (`so_follower`) deben coincidir con el entorno de despliegue; cualquier cambio puede degradar el rendimiento.
- Al ser un modelo de imitación, puede heredar sesgos del dataset de entrenamiento (por ejemplo, posiciones fijas de objetos, iluminación específica). No se han documentado sesgos adicionales.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar que el hardware y el software asociados (LeRobot, Isaac-GR00T) cumplan con sus propias licencias.
- No se proporcionan datos sobre latencia, throughput ni consumo energético, por lo que no es posible estimar el rendimiento en tiempo real sin pruebas propias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/innoblabla/yellow_sphere_blue_cube_GR00T17
- Dataset de entrenamiento: https://huggingface.co/datasets/innoblabla/yellow_sphere_blue_cube
- Repositorio de NVIDIA Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de GR00T en LeRobot: https://huggingface.co/docs/lerobot/main/en/groot
