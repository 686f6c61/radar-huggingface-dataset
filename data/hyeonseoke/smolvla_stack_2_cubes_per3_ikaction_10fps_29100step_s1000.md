# HyeonseokE/smolvla_stack_2_cubes_per3_ikaction_10fps_29100step_s1000

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (Vision-Language-Action, VLA) diseñado para control robótico por imitación. Este repositorio contiene un fine-tuning del modelo base `lerobot/smolvla_base`, entrenado por HyeonseokE sobre un dataset de 30 episodios (10.700 frames a 10 FPS) para ejecutar la tarea de apilar un cubo verde sobre un cubo rojo. El modelo genera acciones de 6 grados de libertad (DOF) a partir de observaciones que incluyen el estado del robot y tres imágenes de cámaras de 256x256 píxeles.

Con 450.046.176 parámetros y un tamaño de pesos de 0,9 GB (presumiblemente en fp16/bf16), SmolVLA está pensado para ejecutarse en hardware de consumo, reduciendo los costes computacionales frente a modelos VLA de mayor escala. Este fine-tuning concreto se publica bajo licencia Apache-2.0 y se integra con el ecosistema LeRobot, lo que facilita su uso en robots compatibles con la librería.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/smolvla_base |
| Robot objetivo | so101_follower |
| Camaras de entrada | top, left_wrist (según model card) |
| Tarea entrenada | "Stack the green block on the red block." |
| Dataset de entrenamiento | HyeonseokE/redundancy_stack_2_cubes_per3_ikaction_10fps |
| Episodios de entrenamiento | 30 |
| Frames de entrenamiento | 10.700 |
| Frame rate | 10 FPS |
| Pasos de entrenamiento | 29.100 |
| Batch size | 64 |
| Optimizador | AdamW |
| Learning rate | 0,0001 |
| Seed | 1000 |
| Version de LeRobot | 0.6.0 |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura compacta de tipo VLA que combina un codificador visual, un modelo de lenguaje y una cabeza de acción para producir comandos de control en robótica. El modelo base `lerobot/smolvla_base` fue preentrenado por Hugging Face y posteriormente fine-tuneado con el framework LeRobot sobre el dataset `redundancy_stack_2_cubes_per3_ikaction_10fps`. Dicho dataset contiene 30 episodios de apilado de cubos, con un total de 10.700 frames a 10 FPS, capturados con cámaras superior y de muñeca.

El entrenamiento se realizó durante 29.100 pasos con batch size 64, optimizador AdamW y learning rate 0,0001. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación posteriores; se trata de un ajuste por imitación supervisada. La innovación principal de SmolVLA reside en su eficiencia computacional, que permite desplegar políticas de manipulación en hardware de consumo sin sacrificar un rendimiento competitivo en tareas de control.

## Capacidades

- Generación de acciones de robot de 6 DOF (`action` con forma `(6,)`) a partir de observaciones multimodales.
- Entrada de estado del robot (`observation.state` con forma `(6,)`) y tres imágenes de cámaras (`observation.images.camera1`, `camera2`, `camera3` con forma `(3, 256, 256)`).
- Salida adicional de acciones en radianes por articulación (`action.radian_urdf0` con forma `(6,)`).
- Ejecución de la tarea específica de apilado de cubos mediante aprendizaje por imitación.
- Integración nativa con LeRobot para entrenamiento, evaluación y despliegue en robots compatibles.
- No se documentan capacidades de tool calling, razonamiento multi-step, visión general, audio ni soporte multilingüe.

## Casos de uso

- Investigación en aprendizaje por imitación: el modelo sirve como referencia para estudiar cómo un VLA compacto se comporta en tareas de manipulación con pocos datos de entrenamiento, permitiendo comparar estrategias de fine-tuning y recolección de episodios.
- Apilado de cubos en entornos de laboratorio: se puede desplegar en un robot SO101 para ejecutar la tarea de colocar un cubo verde sobre uno rojo, sirviendo como prueba de concepto en setups de robótica educativa o de investigación.
- Evaluación de políticas visuales en hardware de consumo: gracias a su tamaño reducido, el modelo puede ejecutarse en GPUs domésticas, lo que facilita el testeo rápido de políticas entrenadas con LeRobot sin necesidad de clústeres de computación.
- Desarrollo de sistemas de manipulación para almacenes: la tarea de apilado es un caso base para aplicaciones logísticas de ordenación de cajas; el modelo puede adaptarse mediante fine-tuning a objetos y configuraciones similares.
- Prototipado de pipelines de robótica: el repositorio incluye comandos de rollout y entrenamiento que permiten a desarrolladores integrar el modelo en sus propios flujos de trabajo con LeRobot, acelerando la iteración sobre nuevos datasets.
- Benchmarking de eficiencia energética: al ser un modelo compacto, es útil para medir el consumo computacional y la latencia de un VLA en comparación con modelos más grandes, especialmente en robots con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El tamaño de los pesos es de 0,9 GB, lo que sugiere un almacenamiento en fp16/bf16; el consumo de VRAM dependerá de las implementaciones y optimizaciones.
- GPU recomendadas: no especificadas. Dado el tamaño del modelo, es probable que funcione en GPUs de consumo como las series RTX 30/40, pero no hay datos oficiales.
- Compatibilidad con GPU de consumo: no confirmada oficialmente. El modelo base SmolVLA está diseñado para hardware de consumo, pero este fine-tuning no incluye requisitos explícitos.
- Opciones de despliegue: LeRobot, a través de la CLI `lerobot-rollout` y `lerobot-train`; también puede integrarse con otras herramientas de inferencia de PyTorch, aunque no se documentan en la model card.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Tarea |
|---|---|---|---|---|
| HyeonseokE/smolvla_stack_2_cubes_per3_ikaction_10fps_29100step_s1000 | 450.046.176 | no disponible | Apache-2.0 | Apilar cubo verde sobre rojo |
| HyeonseokE/smolvla_stack_2_cubes_per10_ikaction_10fps_29100step_s1000 | no disponible | no disponible | Apache-2.0 | Apilado de cubos (variante per10) |
| lerobot/smolvla_base | no disponible | no disponible | Apache-2.0 | Modelo base preentrenado para fine-tuning |

No se dispone de datos de rendimiento comparativos entre estas variantes. El modelo base y los fine-tunes comparten la misma familia arquitectónica y licencia.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea de apilar un cubo verde sobre uno rojo; no generaliza a otras tareas sin un nuevo fine-tuning.
- El dataset de entrenamiento contiene solo 30 episodios, lo que puede limitar la robustez frente a variaciones de iluminación, posición de los objetos o distracciones.
- No se han publicado resultados de evaluación en robot real, por lo que el rendimiento en entornos no vistos es desconocido.
- La información proporcionada no especifica los idiomas soportados; el modelo base SmolVLA puede tener limitaciones en instrucciones en lenguajes distintos del inglés.
- La licencia Apache-2.0 permite uso comercial, pero es necesario verificar la licencia y los términos del dataset utilizado para el fine-tuning.
- El despliegue depende de la configuración específica del robot SO101 y de las cámaras; cualquier cambio en el hardware o en los nombres de las observaciones requerirá adaptación.
- No se documentan mecanismos de seguridad ni filtros de acciones, por lo que el modelo debe usarse en entornos controlados con supervisión humana.

## Enlaces

- Repositorio del modelo: https://huggingface.co/HyeonseokE/smolvla_stack_2_cubes_per3_ikaction_10fps_29100step_s1000
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/redundancy_stack_2_cubes_per3_ikaction_10fps
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
