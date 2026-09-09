# ases200q2/roboverse_pick_cube_genesisE100_act_20260909_0925

## Resumen

El modelo `ases200q2/roboverse_pick_cube_genesisE100_act_20260909_0925` es un policy de robótica entrenado mediante aprendizaje por imitación con el método Action Chunking with Transformers (ACT). Ha sido desarrollado por el usuario `ases200q2` y publicado en Hugging Face dentro del ecosistema LeRobot. Está diseñado para controlar un brazo robótico Franka en la tarea de recoger un cubo (`pick_cube`), a partir de observaciones del estado del robot, su velocidad y una imagen de la cámara principal.

El modelo se compone de un transformer con 51.674.761 parámetros, en formato safetensors, y ocupa aproximadamente 0,2 GB. Fue entrenado sobre un dataset de 100 episodios y 19.700 fotogramas a 30 FPS. ACT predice secuencias de acciones ("chunks") en lugar de acciones individuales, lo que reduce el error acumulado y mejora la estabilidad en tareas de manipulación.

Su relevancia radica en que ofrece una política lista para usar dentro de LeRobot, lo que permite a investigadores y desarrolladores desplegar un sistema de recogida de objetos sin necesidad de entrenar un modelo desde cero. Al ser de código abierto con licencia Apache 2.0 y estar integrado en una librería popular, facilita la replicabilidad y la experimentación en robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) - Transformer |
| Parametros totales | 51.674.761 |
| Longitud de contexto | No disponible (modelo de política robótica, no un LLM) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice bloques de acciones de varios pasos en lugar de un único paso. La implementación está basada en la librería LeRobot, que proporciona el pipeline completo de entrenamiento, inferencia y registro de datos.

Para este policy, las observaciones de entrada son el estado del robot (9 valores), la velocidad (9 valores) y una imagen RGB de la cámara principal con resolución 240x320. La salida es una acción de 9 dimensiones que se aplica al brazo Franka. El entrenamiento se realizó durante 40.000 pasos con un tamaño de lote de 64, optimizador AdamW y una tasa de aprendizaje de 1e-05. El dataset de entrenamiento es `ases200q2/roboverse-pick_cube-genesisE100`, compuesto por 100 episodios y 19.700 fotogramas a 30 FPS, todos correspondientes a la tarea de recoger un cubo.

No se han aplicado técnicas de RLHF ni DPO, ya que se trata de un modelo de control robótico, no de un modelo de lenguaje. La innovación técnica principal es la predicción por chunks de acción, que aporta más estabilidad en tareas de manipulación en comparación con métodos que predicen una única acción por paso.

## Capacidades

- Generación de acciones de control para un brazo robótico Franka, con salida de 9 dimensiones.
- Entrada multimodal: combina estado del robot, velocidades e imagen de cámara.
- Predicción de acciones en bloques (chunks), lo que permite ejecutar secuencias de movimiento coherentes.
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Integración nativa con el ecosistema LeRobot, incluyendo scripts de rollout y entrenamiento.
- Especializado en la tarea de recoger un cubo (`pick_cube`).
- No soporta tool calling, generación de texto ni razonamiento lingüístico, al ser un policy de robótica.

## Casos de uso

- Recogida de objetos en simulación con Genesis: el modelo se puede ejecutar en un brazo Franka virtual para validar políticas de manipulación sin necesidad de hardware físico.
- Automatización de tareas de pick-and-place en entornos industriales: mediante demostraciones teleoperadas, el policy aprende a recoger piezas estándar y puede integrarse en células de trabajo.
- Investigación en aprendizaje por imitación: sirve como baseline para comparar con otros métodos implementados en LeRobot, como Diffusion Policy o CQL.
- Prototipado de sistemas de control para robots de 7 grados de libertad: la salida de 9 dimensiones cubre la configuración del efector final y permite desarrollar aplicaciones de manipulación.
- Evaluación de robustez ante variaciones visuales: al estar entrenado en un dataset reducido, permite estudiar la sensibilidad de ACT a cambios de iluminación o posición de objetos.
- Docencia y demostraciones de robótica: el modelo se puede cargar con los comandos de LeRobot y ejecutarse en un robot Franka para ilustrar el flujo completo de aprendizaje por imitación.
- Reentrenamiento rápido con nuevos datos: gracias a la librería LeRobot, el usuario puede adaptar el policy a otros objetos o escenarios recopilando nuevas demostraciones y reejecutando el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51,7 millones de parámetros, en precisión FP32 el modelo ocupa aproximadamente 0,2 GB. Una GPU de consumo con al menos 1 GB de VRAM es suficiente para ejecutar el rollout en tiempo real.
- GPU recomendadas: para inferencia, cualquier NVIDIA RTX serie 30 o superior, o equivalente de AMD con soporte CUDA/PyTorch. Para entrenar el modelo con los parámetros descritos se recomienda una GPU con 8 GB de VRAM o más, debido al lote de 64 y a las imágenes de 240x320.
- Si el modelo se ejecuta en un robot real, se puede desplegar en un ordenador con GPU modesta, ya que la carga computacional es reducida.
- Opciones de despliegue: LeRobot (comandos `lerobot-rollout` y `lerobot-train`), inferencia en CPU o GPU con PyTorch.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible.

## Limitaciones y advertencias

- No se han proporcionado resultados de evaluación sobre el robot real, por lo que se desconoce la tasa de éxito real de la política.
- El modelo solo ha sido entrenado para la tarea `pick_cube`. Intentar usarlo en otra tarea o con otro tipo de objeto probablemente falle.
- El dataset de entrenamiento es pequeño (100 episodios, 19.700 fotogramas), lo que aumenta el riesgo de sobreajuste y la sensibilidad a variaciones del entorno.
- La entrada depende de una configuración específica: estado y velocidad de 9 dimensiones, y una cámara `main_camera` de 240x320. Cambios en la cámara, la resolución o la calibración del robot invalidan la política.
- Al ser un modelo de aprendizaje por imitación, puede heredar sesgos y errores de las demostraciones humanas utilizadas para entrenarlo.
- No es un modelo de lenguaje ni admite tool calling, por lo que no puede interactuar con sistemas de lenguaje natural ni con APIs.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe asumir la responsabilidad del despliegue y el cumplimiento de normativas de seguridad en entornos robóticos.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/ases200q2/roboverse_pick_cube_genesisE100_act_20260909_0925
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/ases200q2/roboverse-pick_cube-genesisE100
- Documentación de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ases200q2/roboverse-pick_cube-genesisE100
