# ButteredWaffle/cube_task_v1_groot_n17

## Resumen

`ButteredWaffle/cube_task_v1_groot_n17` es una política de robótica entrenada mediante aprendizaje por imitación sobre la arquitectura GR00T N1.7 de NVIDIA, un modelo fundacional abierto y cross-embodiment para razonamiento y habilidades en robots humanoides. El autor del repositorio, ButteredWaffle, ha ajustado el modelo con el framework LeRobot de Hugging Face sobre un conjunto de datos propio de 75 episodios y 37.058 fotogramas a 30 FPS, todos ellos correspondientes a una única tarea: "Put the cube in the box" (introducir el cubo en la caja).

El modelo consume observaciones multimodales compuestas por el estado de articulaciones (vector de 6 dimensiones) y dos flujos de vídeo de 480x640 píxeles procedentes de las cámaras `head` y `table`, y produce como salida un vector de acción de 6 dimensiones. La arquitectura subyacente combina un backbone visión-lenguaje Cosmos-Reason2/Qwen3-VL con un transformer de acciones basado en flow matching, que predice acciones condicionadas por visión, lenguaje y propiocepción.

Se trata de un artefacto de nicho: un checkpoint de investigación con 3.144.016.000 parámetros y 12,6 GB de pesos en formato safetensors, publicado bajo licencia Apache 2.0, sin descargas ni valoraciones en el momento de redactar esta ficha y sin resultados de evaluación reportados por el autor. Su relevancia es demostrativa del flujo de trabajo de LeRobot para ajustar modelos fundacionales de robótica, más que de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo recibe instrucciones de tarea en lenguaje natural; el dataset solo contiene la tarea "Put the cube in the box") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

Especificaciones adicionales del artefacto:

| Parametro | Valor |
|---|---|
| Tipo de robot | `so_follower` |
| Camaras | `head`, `table` |
| Entrada `observation.state` | STATE, forma `(6,)` |
| Entrada `observation.images.head` | VISUAL, forma `(3, 480, 640)` |
| Entrada `observation.images.table` | VISUAL, forma `(3, 480, 640)` |
| Salida `action` | ACTION, forma `(6,)` |
| Tamano del repositorio | 12,6 GB |
| Pipeline | robotics |
| Version de LeRobot | 0.6.2 |

## Arquitectura y entrenamiento

GR00T N1.7 es un modelo fundacional cross-embodiment de NVIDIA para robots humanoides. Su diseño separa dos componentes: un backbone visión-lenguaje (Cosmos-Reason2/Qwen3-VL) que interpreta las imágenes de cámara y la instrucción de tarea en lenguaje natural, y un transformer de acciones que genera las acciones motoras mediante flow matching, condicionado por la representación multimodal y por el estado de propiocepción del robot. Esta separación permite, en teoría, transferir el conocimiento del backbone entre distintas morfologías de robot.

El ajuste concreto de este repositorio se realizó con LeRobot 0.6.2 sobre el dataset `ButteredWaffle/cube_task_v1`: 75 episodios, 37.058 fotogramas a 30 FPS, una única tarea y un robot `so_follower` con dos cámaras. La configuración de entrenamiento reportada es de 7.000 pasos con batch size 4, optimizador AdamW, learning rate 1e-4 y semilla 42. No se documenta el número de tokens de entrenamiento, la composición del dataset más allá de la tarea única, ni si hubo etapas de RLHF o DPO; para un ajuste de imitación de estas características lo habitual es que no las haya. Tampoco se detallan innovaciones técnicas adicionales más allá de las propias de la arquitectura GR00T.

## Capacidades

- Control robótico de imitación para una tarea única: introducir un cubo en una caja, a partir de observaciones visuales y de propiocepción.
- Fusión de dos vistas de cámara (`head` y `table`) con el estado de articulaciones para generar acciones de 6 dimensiones.
- Condicionamiento por instrucción en lenguaje natural: el prompt de tarea se pasa en tiempo de ejecución (`--task="Put the cube in the box"`), aunque el modelo solo ha visto esa tarea durante el ajuste.
- Inferencia en tiempo real a 30 FPS sobre el robot `so_follower` mediante `lerobot-rollout`.
- Reentrenamiento y ajuste fino con `lerobot-train` usando `--policy.type=groot`.
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, visión general, audio ni modo de pensamiento; el modelo es una política de acción, no un asistente conversacional.

## Casos de uso

- Investigación en aprendizaje por imitación: servir como referencia reproducible de un ajuste de GR00T N1.7 con LeRobot, comparando hiperparámetros (7.000 pasos, batch 4, lr 1e-4) sobre un dataset pequeño y controlado.
- Manipulación pick-and-place en laboratorio: ejecutar la tarea "Put the cube in the box" con un robot `so_follower` equipado con cámaras `head` y `table`, como banco de pruebas de agarre y colocación.
- Validación de pipelines de datos robóticos: usar el dataset de 75 episodios y 37.058 fotogramas para verificar el flujo completo de grabación, visualización (`visualize_dataset`) y entrenamiento en LeRobot.
- Prototipado de políticas cross-embodiment: evaluar hasta qué punto un backbone visión-lenguaje preentrenado se adapta a una morfología concreta con pocos datos.
- Docencia y formación: ejemplo didáctico de extremo a extremo (grabar datos, entrenar, desplegar con `lerobot-rollout`) para cursos de robótica e IA.
- Base para ajuste fino en tareas nuevas: partir de este checkpoint y reentrenar con un dataset propio para tareas de manipulación similares, aprovechando el soporte de `--policy.type=groot`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet". No hay tasas de éxito, número de ensayos ni condiciones de evaluación documentadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 3.144.016.000 parámetros y pesos de 12,6 GB en safetensors, la inferencia en precisión nativa requiere al menos el tamaño de los pesos más overhead de activaciones; no se documentan requisitos oficiales.
- GPU recomendadas: no disponible. No se especifican modelos de GPU en la model card.
- Cabe en GPU de consumo: no confirmado. El tamaño de pesos (12,6 GB) sugiere que podría caber en GPUs con 16-24 GB de VRAM en precisión nativa, pero no hay datos oficiales ni cuantizaciones documentadas.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) para ejecución en robot; `lerobot-train` para entrenamiento con `--policy.device=cuda`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a una política de acción.
- Latencia y throughput: no disponibles. El dataset está grabado a 30 FPS, pero no se reporta la latencia de inferencia del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ButteredWaffle/cube_task_v1_groot_n17` | 3.144.016.000 | no disponible | Manipulación pick-and-place (tarea única) | Apache 2.0 | Hugging Face, 0 descargas |
| GR00T N1.7 (base, NVIDIA) | no disponible en la información | no disponible | Modelo fundacional cross-embodiment | no disponible en la información | GitHub NVIDIA/Isaac-GR00T |
| Políticas ACT / Diffusion de LeRobot | no disponible | no disponible | Imitación robótica | no disponible | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. El dataset contiene una única tarea, un único robot y presumiblemente un único entorno, lo que limita severamente la generalización.
- Riesgo de alucinación: no aplica en el sentido conversacional, pero sí existe riesgo de acciones incorrectas o inseguras fuera de la distribución de entrenamiento (posiciones de objetos, iluminación o distracciones distintas).
- Limitaciones de contexto e idioma: la instrucción de tarea está condicionada a "Put the cube in the box"; no se documenta soporte multilingüe ni de instrucciones arbitrarias.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base GR00T N1.7 y sus dependencias pueden tener condiciones propias que conviene verificar antes de un despliegue comercial.
- Sin evaluación: no hay tasas de éxito ni ensayos en robot real, por lo que no se puede afirmar que la política funcione de forma fiable.
- Sin cuantizaciones ni requisitos de hardware documentados: dificulta planificar el despliegue.
- Artefacto de investigación con 0 descargas y 0 valoraciones: no hay evidencia de uso por terceros ni de mantenimiento.
- Dependencia de la versión de LeRobot 0.6.2 y de los nombres exactos de las claves de observación (`head`, `table`); un cambio de configuración de cámaras rompe la compatibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ButteredWaffle/cube_task_v1_groot_n17
- Dataset de entrenamiento: https://huggingface.co/datasets/ButteredWaffle/cube_task_v1
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ButteredWaffle/cube_task_v1
- Repositorio GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
