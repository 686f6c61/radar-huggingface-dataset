# RoboColosseum/droid-towel-in-basket-gr00t-n1.7

## Resumen

`RoboColosseum/droid-towel-in-basket-gr00t-n1.7` es una política de robótica (visión-lenguaje-acción) construida sobre el modelo fundacional GR00T N1.7 de NVIDIA y empaquetada con la librería LeRobot de Hugging Face. No es un modelo de lenguaje generalista, sino un checkpoint de control motor entrenado por imitación para una tarea concreta: introducir una toalla en una cesta ("towel in basket") con un brazo robótico Franka y dos cámaras (vista izquierda y muñeca). El repositorio contiene 3.144.016.000 parámetros en formato safetensors y ocupa 12,6 GB.

El modelo combina un backbone visión-lenguaje Cosmos-Reason2/Qwen3-VL con un transformer de acciones basado en flow matching, que predice vectores de acción de dimensión 8 condicionados por imagen, instrucción en lenguaje natural y propriocepción. Esta arquitectura permite, en teoría, transferir conocimiento cross-embodiment, aunque este checkpoint concreto está especializado en un único robot y una única tarea mediante fine-tuning sobre 100 episodios de demostración (27.395 frames a 30 FPS).

Su relevancia es doble: por un lado, sirve como ejemplo reproducible del flujo de trabajo de LeRobot 0.6.1 para entrenar políticas de imitación sobre GR00T; por otro, su licencia Apache 2.0 y la disponibilidad de los scripts de entrenamiento e inferencia lo hacen utilizable como base para experimentos de manipulación robótica sin restricciones comerciales. No obstante, el autor no ha publicado resultados de evaluación en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action): backbone Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (las instrucciones de tarea se proporcionan en texto libre; el modelo card no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |
| Tipo de robot | Franka |
| Cámaras de entrada | `left_image`, `wrist` (3x360x640 cada una) |
| Entrada de estado | `observation.state` (8,), `observation.cartesian_position` (6,) |
| Salida | `action` (8,) |
| Tamaño del repositorio | 12,6 GB |
| Pipeline | robotics |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de GR00T N1.7: un backbone visión-lenguaje (Cosmos-Reason2/Qwen3-VL) que procesa las imágenes de las cámaras y la instrucción textual de la tarea, y un transformer de acciones que genera trayectorias mediante flow matching. Las acciones se predicen condicionadas por visión, lenguaje y propriocepción, lo que permite en principio un control continuo y multimodal. El checkpoint está adaptado a un robot Franka con dos cámaras y un vector de estado de 8 dimensiones más posición cartesiana de 6 dimensiones.

El entrenamiento se realizó por imitación (behavior cloning) sobre el dataset `local/droid-towel-in-basket-left-wrist`, compuesto por 100 episodios y 27.395 frames grabados a 30 FPS para la tarea "towel in basket". La configuración declarada es de 8.570 pasos, batch size 32, optimizador AdamW con learning rate 1e-4 y semilla 1000, usando LeRobot 0.6.1. No se documenta el número total de tokens de entrenamiento, la composición del dataset más allá de la tarea, ni si hubo etapas de RLHF o DPO (poco habituales en políticas de imitación robótica).

## Capacidades

- Control robótico de manipulación: predice acciones de 8 dimensiones para un brazo Franka a partir de observaciones visuales y de estado.
- Condicionamiento por lenguaje natural: acepta una instrucción de tarea ("towel in basket") que guía la política.
- Fusión multimodal: integra dos vistas de cámara (izquierda y muñeca) con propriocepción y posición cartesiana.
- Política de imitación especializada: ejecuta una tarea concreta de pick-and-place (toalla a cesta) aprendida de demostraciones humanas.
- Inferencia en tiempo real: pensada para ejecutarse a 30 FPS sobre el robot mediante `lerobot-rollout`.
- Reentrenamiento: compatible con `lerobot-train` para fine-tuning sobre nuevos datasets.
- No dispone de tool calling, function calling, razonamiento multi-paso explícito ni capacidades de audio o visión generalista más allá del uso como backbone VLA.

## Casos de uso

- Manipulación pick-and-place en laboratorio: ejecutar la tarea "towel in basket" sobre un Franka calibrado, usando `lerobot-rollout` con las cámaras `left_image` y `wrist` para validar el pipeline de inferencia de LeRobot.
- Base para fine-tuning en nuevas tareas de recogida: reentrenar el checkpoint con `lerobot-train` sobre un dataset propio de manipulación de tejidos u objetos blandos, aprovechando el backbone preentrenado de GR00T.
- Investigación en imitación robótica: servir como referencia reproducible de una política GR00T N1.7 con hiperparámetros y dataset documentados (8.570 pasos, batch 32, lr 1e-4).
- Evaluación de robustez visual: probar la política bajo cambios de iluminación, posición de la toalla o distracciones para estudiar la generalización de políticas de imitación con pocos datos (100 episodios).
- Benchmark interno de despliegue: medir latencia y throughput de una política VLA de 3.144 M de parámetros en GPUs consumer frente a GPUs de datacenter dentro de un pipeline LeRobot.
- Docencia y divulgación: demostrar el ciclo completo grabación de datos, entrenamiento y despliegue en robot real con LeRobot 0.6.1 y GR00T.
- Prototipado de tareas de recogida de ropa: adaptar la política a variantes como doblar o depositar toallas en contenedores, partiendo de este checkpoint especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet", por lo que no hay tasas de éxito en robot real ni métricas de validación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 3.144 M de parámetros en safetensors (fp32/bf16) el checkpoint ocupa 12,6 GB, por lo que se requiere al menos ~13-16 GB de VRAM para cargarlo sin cuantizar, más el overhead de las dos cámaras a 360x640.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 4090 (24 GB) o A100/H100 son opciones razonables para inferencia sin cuantizar; no confirmado.
- Cabe en GPU consumer: probablemente en RTX 4090 y RTX 3090 (24 GB); en GPUs de 16 GB o menos requeriría cuantización, no documentada.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para políticas VLA de control motor.
- Latencia y throughput estimados: no disponibles. El dataset se grabó a 30 FPS, lo que sugiere que la política está pensada para operar a esa frecuencia, pero no se confirma el rendimiento real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RoboColosseum/droid-towel-in-basket-gr00t-n1.7 | 3.144 M | no disponible | Manipulación Franka (toalla a cesta) | Apache 2.0 | Hugging Face (LeRobot) |
| GR00T N1.7 (base, NVIDIA) | no disponible en esta ficha | no disponible | Modelo fundacional VLA cross-embodiment | no disponible en esta ficha | GitHub NVIDIA/Isaac-GR00T |
| Otras políticas LeRobot (p. ej. ACT, Diffusion Policy) | no disponible en esta ficha | no disponible | Imitación robótica especializada | Apache 2.0 (habitual) | Hugging Face (LeRobot) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea ("towel in basket"), un único tipo de robot (Franka) y una configuración concreta de dos cámaras; no generaliza a otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni validación en robot real, por lo que se desconoce su fiabilidad en producción.
- Dataset pequeño: 100 episodios y 27.395 frames son pocos para garantizar robustez ante cambios de iluminación, posición de objetos o distracciones.
- Riesgo de sobreajuste al entorno de grabación: cambios en la cámara, la mesa o la toalla pueden degradar el rendimiento.
- Dependencia de calibración: requiere que los nombres e índices de cámara coincidan con las claves de observación (`left_image`, `wrist`) y que el robot esté correctamente calibrado.
- Idiomas: no se declaran idiomas soportados; la instrucción de tarea se pasa como texto y no hay garantía multilingüe.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar también las licencias del backbone Cosmos-Reason2/Qwen3-VL subyacente.
- Sin datos de cuantización: no se documentan versiones GGUF ni cuantizadas, lo que limita el despliegue en hardware modesto.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación prácticamente nulo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RoboColosseum/droid-towel-in-basket-gr00t-n1.7
- Dataset de entrenamiento: https://huggingface.co/datasets/local/droid-towel-in-basket-left-wrist
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=local/droid-towel-in-basket-left-wrist
- Repositorio GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Guía LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
