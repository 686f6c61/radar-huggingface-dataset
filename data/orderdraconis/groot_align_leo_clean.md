# OrderDraconis/groot_align_leo_clean

## Resumen

El modelo `OrderDraconis/groot_align_leo_clean` es una política robótica de aprendizaje por imitación basada en NVIDIA GR00T N1.7, un modelo fundacional de código abierto y cross-embodiment para razonamiento y habilidades robóticas generalizadas. Desarrollado por Leo Guillier (OrderDraconis) y entrenado con el framework LeRobot de Hugging Face, el modelo está especializado en una tarea concreta de manipulación: alinear una pieza de tela verde sobre una pieza rosa. Utiliza un backbone Cosmos-Reason2/Qwen3-VL combinado con un transformer de acciones basado en flow-matching, y cuenta con 3.144.016.000 parámetros (3,14 mil millones). Se distribuye bajo licencia Apache-2.0 en formato safetensors.

La relevancia de este modelo radica en que demuestra la aplicación práctica de GR00T N1.7 a tareas de manipulación de objetos deformables, un dominio especialmente desafiante en robótica. Al estar entrenado con LeRobot, es reproducible y extensible: cualquier investigador puede reentrenarlo con su propio dataset o adaptarlo a nuevas tareas. El modelo procesa cuatro flujos de vídeo simultáneos (480×640 píxeles) junto con el estado del robot (12 dimensiones) para predecir acciones de control de 12 dimensiones sobre un robot tipo `bi_so_follower`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (backbone Cosmos-Reason2/Qwen3-VL + flow-matching action transformer) |
| Parametros totales | 3.144.016.000 (3,14 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de robótica; procesa observaciones visuales y de estado, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el backbone Qwen3-VL es multilingüe, pero la política está entrenada para una tarea robótica específica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en GR00T N1.7 de NVIDIA, un modelo fundacional de código abierto para razonamiento y habilidades robóticas humanoides. La arquitectura combina un backbone de visión-lenguaje Cosmos-Reason2/Qwen3-VL con un transformer de acciones basado en flow-matching, que predice acciones condicionadas por visión, lenguaje y propiocepción. Esta combinación permite integrar información visual de múltiples cámaras con el estado del robot para generar comandos de control precisos. No se trata de un transformer puramente autorregresivo de texto, sino de un modelo multimodal orientado a la generación de acciones continuas.

El entrenamiento se realizó con LeRobot (versión 0.6.0) sobre el dataset `Janmeier820/align_fabric_dataset_leo`, que contiene 133 episodios y 124.930 fotogramas a 30 FPS. La configuración incluye 10.000 pasos de entrenamiento, tamaño de lote 16, optimizador AdamW con tasa de aprendizaje 0,0001 y semilla 1000. La tarea se describe como "mover la pieza de tela verde sobre la pieza rosa para que quede perfectamente alineada". No se especifica el uso de RLHF, DPO ni otras técnicas de refinamiento por preferencias; se trata de aprendizaje por imitación supervisado a partir de demostraciones.

## Capacidades

- Manipulación robótica de objetos deformables: entrenado específicamente para alinear piezas de tela, una tarea que requiere percepción visual fina y control de fuerza preciso.
- Percepción multi-cámara: procesa simultáneamente cuatro flujos de vídeo (`left_left_jaw`, `right_right_jaw`, `right_topdown`, `right_front`) a 480×640 píxeles.
- Control de robot `bi_so_follower`: genera acciones de 12 dimensiones a partir de observaciones de estado de 12 dimensiones.
- Aprendizaje por imitación: la política se entrena mediante demostraciones humanas registradas en el dataset, sin necesidad de ingeniería de recompensas.
- Integración con LeRobot: compatible con el ecosistema de Hugging Face para robótica, incluyendo entrenamiento, evaluación y despliegue mediante comandos CLI (`lerobot-rollout`, `lerobot-train`).
- Base cross-embodiment: al estar construido sobre GR00T N1.7, hereda la capacidad de transferencia entre configuraciones robóticas, aunque el fine-tuning aquí es específico para `bi_so_follower`.

## Casos de uso

- Alineación de piezas en fabricación textil: el modelo puede automatizar la alineación de capas de tela en procesos de corte o costura, reduciendo el tiempo de ciclo y mejorando la consistencia frente a la operación manual. Se desplegaría con `lerobot-rollout` sobre el robot `bi_so_follower` con las cuatro cámaras configuradas.
- Manipulación de objetos deformables en investigación: sirve como punto de partida para estudiar estrategias de control con materiales no rígidos, un área con poca cobertura en robótica clásica y donde los métodos basados en modelo suelen fallar.
- Benchmark reproducible de aprendizaje por imitación: al estar entrenado con LeRobot y publicar el dataset asociado, puede utilizarse como caso de estudio para comparar arquitecturas de políticas robóticas en condiciones controladas.
- Base para fine-tuning en tareas de ensamblaje: la arquitectura GR00T permite adaptar el modelo a tareas de ensamblaje de piezas pequeñas que requieren alineación visual precisa, reentrenando con un dataset propio mediante `lerobot-train`.
- Evaluación de GR00T N1.7 en entornos reales: sirve para validar el rendimiento del modelo fundacional de NVIDIA en un robot `bi_so_follower` con cuatro cámaras, aportando datos empíricos a la comunidad sobre su comportamiento en tareas de manipulación fina.
- Desarrollo de sistemas de teleoperación asistida: el modelo puede integrarse en sistemas de control compartido donde el robot propone acciones y un operador humano supervisa o corrige, reduciendo la carga cognitiva del operador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion en robot real para esta politica.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3,14 mil millones de parámetros, en precisión fp16 los pesos ocupan aproximadamente 6,3 GB, pero el procesamiento simultáneo de cuatro flujos de vídeo (480×640×3) y las activaciones del transformer elevan el requisito total. Se recomienda una GPU con al menos 16 GB de VRAM para inferencia cómoda.
- GPU recomendadas: para entrenamiento, una NVIDIA A100 o H100 (el entrenamiento de GR00T requiere memoria sustancial y el repositorio ocupa 127,7 GB con checkpoints); para inferencia, una RTX 4090 (24 GB) o RTX 3090 (24 GB) son suficientes. GPUs con menos de 12 GB pueden tener problemas con el procesamiento simultáneo de las cuatro cámaras.
- Compatibilidad con GPU de consumo: sí, una RTX 4090 o similar puede ejecutar la inferencia, aunque el entrenamiento completo sería muy lento sin hardware profesional.
- Opciones de despliegue: el modelo se ejecuta a través del framework LeRobot, con `lerobot-rollout` para inferencia y `lerobot-train` para entrenamiento. Requiere PyTorch con soporte CUDA y las dependencias de LeRobot.
- Latencia y throughput: no disponible. La latencia dependerá de la GPU, la resolución de las cámaras y la frecuencia de control del robot (el dataset se grabó a 30 FPS).

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Tarea | Licencia |
|---|---|---|---|---|
| OrderDraconis/groot_align_leo_clean | 3,14 B | GR00T N1.7 (Qwen3-VL + flow-matching) | Alineación de tela | Apache-2.0 |
| ACT (Action Chunking Transformer) | ~10-100 M (aprox.) | Transformer con chunking de acciones | Manipulación general | MIT |
| Diffusion Policy | ~10-100 M (aprox.) | Denoising diffusion | Manipulación general | MIT |

Nota: ACT y Diffusion Policy son políticas de referencia habituales en el ecosistema LeRobot, pero no se dispone de datos de rendimiento comparativos publicados para esta tarea específica. Los valores de parámetros son aproximados y dependen de la configuración. La comparación directa requeriría ejecutar evaluaciones en el mismo robot y entorno.

## Limitaciones y advertencias

- Sesgos del dataset: el modelo se entrenó con 133 episodios de un único operador y un único entorno, por lo que puede no generalizar a otras condiciones de iluminación, posiciones de cámara o variaciones en las piezas de tela.
- Riesgo de sobreajuste: con un dataset relativamente pequeño (133 episodios) y 10.000 pasos de entrenamiento, existe riesgo de que la política memorice las demostraciones en lugar de aprender una estrategia generalizable.
- Sin evaluación en robot real: la model card no incluye resultados de evaluación física, por lo que el rendimiento real en el robot no está verificado.
- Limitación de tarea: el modelo está especializado en la tarea de alineación de telas; no es un modelo de propósito general y no debe usarse para otras tareas sin fine-tuning.
- Requisitos de hardware: el tamaño del repositorio (127,7 GB) incluye checkpoints de entrenamiento; la inferencia requiere una GPU con VRAM suficiente y el robot `bi_so_follower` con las cuatro cámaras especificadas.
- Restricciones de uso: aunque la licencia Apache-2.0 permite uso comercial, el despliegue en robot requiere cumplir con la normativa de seguridad aplicable a robots autónomos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OrderDraconis/groot_align_leo_clean
- Perfil del autor: https://huggingface.co/OrderDraconis
- Dataset de entrenamiento: https://huggingface.co/datasets/Janmeier820/align_fabric_dataset_leo
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Janmeier820/align_fabric_dataset_leo
- Repositorio NVIDIA Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de GR00T en LeRobot: https://huggingface.co/docs/lerobot/main/en/groot
