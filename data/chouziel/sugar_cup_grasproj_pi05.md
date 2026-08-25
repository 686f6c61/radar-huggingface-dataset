# chouziel/sugar_cup_grasproj_pi05

## Resumen

El modelo `chouziel/sugar_cup_grasproj_pi05` es una política robótica de tipo Vision-Language-Action (VLA) obtenida por fine-tuning del modelo base `lerobot/pi05_base` (Pi0.5, desarrollado por Physical Intelligence) sobre un conjunto de datos de demostraciones de agarre de una taza de azúcar con un robot de tipo `grabette`. El fine-tuning se realizó con la librería LeRobot de Hugging Face, utilizando 150 episodios y 23 046 frames a 50 FPS, con la tarea específica "pick up the sugar cup".

Este modelo es relevante porque demuestra el flujo práctico de adaptar un modelo fundacional de robótica de última generación (Pi0.5) a una tarea concreta de manipulación, con un coste de datos relativamente bajo. Al estar publicado bajo licencia Apache 2.0 y con pesos en formato safetensors, puede integrarse fácilmente en entornos de investigación y desarrollo con LeRobot. El modelo tiene 4 143 404 816 parámetros (aproximadamente 4,14 mil millones) y su repositorio ocupa 9,4 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en transformer, adaptación de Pi0.5 de Physical Intelligence |
| Parametros totales | 4 143 404 816 (4,14 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, presumiblemente FP32/FP16) |
| Idiomas soportados | No disponible (modelo de robótica, no de lenguaje general) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Pi0.5, un VLA de Physical Intelligence que co-entrena con datos de demostraciones robóticas, datos web y subtareas semánticas para lograr generalización en entornos abiertos. La implementación en LeRobot está adaptada del repositorio OpenPI. En este caso, se ha realizado un fine-tuning supervisado por imitación sobre el modelo base `lerobot/pi05_base`, utilizando el dataset `chouziel/grabette-sugar-cup-2008_graspproj` con 150 episodios y 23 046 frames a 50 FPS.

El entrenamiento se ejecutó durante 20 000 pasos con un batch size de 32, optimizador AdamW, learning rate de 2,5e-05 y semilla 1000, usando la versión 0.6.1 de LeRobot. Las entradas del modelo son una imagen de cámara (`observation.images.cam0` de forma (3, 360, 480)) y el estado del robot (`observation.state` de dimensión 2), y produce una acción de 11 dimensiones. No se reporta el uso de técnicas como RLHF o DPO; se trata de un fine-tuning estándar de imitación.

## Capacidades

- Ejecución de la tarea de manipulación "pick up the sugar cup" con el robot `grabette`, usando una cámara y el estado articular del robot.
- Generación de acciones de control de 11 dimensiones en tiempo real (a 50 FPS durante el entrenamiento).
- Procesamiento de entrada visual (imagen RGB de 360x480) y estado del robot (2 dimensiones).
- Capacidad de generalización limitada a la tarea y configuración específicas del dataset de entrenamiento; no es un modelo de propósito general.
- No soporta tool calling, generación de texto, razonamiento simbólico ni otras capacidades de modelos de lenguaje.

## Casos de uso

- Investigación en imitación learning: el modelo sirve como ejemplo de fine-tuning de un VLA fundacional con LeRobot, permitiendo estudiar el efecto de datos limitados (150 episodios) en el rendimiento de una tarea de agarre.
- Automatización de tareas repetitivas en entornos controlados: puede desplegarse en un robot `grabette` para recoger objetos específicos (tazas de azúcar) en una celda de trabajo fija, reduciendo la intervención humana.
- Prototipado rápido de políticas robóticas: al estar publicado con pesos y configuración, permite a otros desarrolladores reproducir el entrenamiento o adaptarlo a tareas similares con pocos cambios.
- Benchmarking de VLA en robótica: puede utilizarse como referencia para comparar el rendimiento de Pi0.5 fine-tuneado frente a otros modelos en la misma tarea.
- Educación y formación: útil para enseñar el flujo completo de grabación de datos, entrenamiento y despliegue de políticas robóticas con LeRobot.
- Integración en pipelines de robótica con ROS u otros frameworks: al ser un modelo estándar de LeRobot, puede conectarse a sistemas de control existentes mediante los adaptadores proporcionados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). Por tanto, no se dispone de tasas de éxito ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,14 mil millones de parámetros, en FP16 los pesos ocupan aproximadamente 8,3 GB. Considerando activaciones y overhead, se estima un mínimo de 10-12 GB de VRAM para inferencia en tiempo real.
- GPU recomendadas: para inferencia en tiempo real, una GPU de gama alta como RTX 3090, RTX 4090 o A100 (16 GB o más) es adecuada. Para entrenamiento, se recomienda al menos 24 GB de VRAM (por ejemplo, RTX 3090/4090 o A100).
- En consumer GPU: sí, cabe en GPUs de 12 GB o más, aunque el rendimiento en tiempo real dependerá de la latencia del modelo y del sistema robótico.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) que cargan el modelo y lo ejecutan sobre el robot. También puede integrarse con vLLM o TGI si se adapta, aunque no es el flujo estándar para políticas robóticas.
- Latencia y throughput: no se han publicado datos. Dado el tamaño del modelo y la entrada de imagen, se espera una latencia de decenas de milisegundos en GPUs modernas, pero no hay mediciones oficiales.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos para este modelo. Como referencia cualitativa, se puede comparar con otros VLA de robótica:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| chouziel/sugar_cup_grasproj_pi05 (este) | 4,14 B | No disponible | Apache 2.0 | Hugging Face |
| lerobot/pi05_base | 4,14 B (aprox.) | No disponible | Apache 2.0 | Hugging Face |
| OpenVLA (openvla/openvla-7b) | 7 B | No disponible | MIT | Hugging Face |
| RT-2 (Google) | 55 B | No disponible | No abierta | No disponible públicamente |

La comparación es limitada porque no hay benchmarks comunes. Pi0.5 es un modelo más reciente que OpenVLA y RT-2, con un enfoque en generalización a entornos abiertos, pero sin datos cuantitativos en este repositorio.

## Limitaciones y advertencias

- El modelo está fine-tuneado exclusivamente para la tarea "pick up the sugar cup" con el robot `grabette` y una cámara específica. No generaliza a otras tareas, objetos o configuraciones de robot sin un nuevo fine-tuning.
- No se han reportado resultados de evaluación en robot real, por lo que el rendimiento real (tasa de éxito, robustez) es desconocido.
- El dataset de entrenamiento es pequeño (150 episodios), lo que puede provocar sobreajuste a las condiciones específicas de grabación (iluminación, posición de la cámara, variaciones del objeto).
- Al ser un modelo de robótica, no tiene capacidades de lenguaje natural ni de razonamiento simbólico; su salida es exclusivamente una acción de control.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar que el modelo base (Pi0.5) y el dataset asociado no tengan restricciones adicionales.
- No se especifican los idiomas soportados, ya que el modelo no procesa texto; cualquier instrucción de lenguaje se limita a la tarea definida en el dataset.

## Enlaces

- Repositorio del modelo: https://huggingface.co/chouziel/sugar_cup_grasproj_pi05
- Dataset de entrenamiento: https://huggingface.co/datasets/chouziel/grabette-sugar-cup-2008_graspproj
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de Pi0.5 de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Documentación de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=chouziel/grabette-sugar-cup-2008_graspproj
