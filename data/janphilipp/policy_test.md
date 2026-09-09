# JanPhilipp/policy_test

## Resumen

`JanPhilipp/policy_test` es un modelo de política robótica (Vision-Language-Action, VLA) basado en la arquitectura SmolVLA, desarrollado por JanPhilipp como fine-tune del modelo base `lerobot/smolvla_base`. El modelo está diseñado para controlar un robot tipo `so_follower` mediante visión y estado del robot, y ha sido entrenado específicamente para la tarea de agarrar herramientas de una zona verde y colocarlas en una zona roja.

SmolVLA es un modelo compacto y eficiente presentado en el paper de Hugging Face (arXiv:2506.01844), que busca un equilibrio entre rendimiento y coste computacional, permitiendo su despliegue en hardware de consumo. Este checkpoint en concreto tiene 450.046.176 parámetros y se distribuye en formato `safetensors` con un tamaño de repositorio de 1.2 GB.

El modelo se entrenó utilizando el framework LeRobot sobre un dataset propio de 80 episodios (69.819 frames a 30 FPS). Es relevante para la investigación en aprendizaje por imitación y robótica de bajo coste, ya que ofrece una política funcional entrenada con un presupuesto computacional muy reducido (100 pasos de entrenamiento).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA) |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de política robótica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/smolvla_base |
| Dataset de entrenamiento | JanPhilipp/ttz_tools_merged_2 (80 episodios, 69.819 frames, 30 FPS) |
| Tarea | Agarrar herramientas de la zona verde y colocarlas en la zona roja |
| Robot | so_follower |
| Camaras | camera1, camera2 (3, 480, 640) |
| Entrada de estado | observation.state (6,) |
| Salida de acciones | action (6,) |
| Pasos de entrenamiento | 100 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 0.0001 |
| Version de LeRobot | 0.6.1 |

## Arquitectura y entrenamiento

SmolVLA es un modelo de la familia Vision-Language-Action que combina un codificador visual, un modelo de lenguaje y un cabezal de predicción de acciones. A diferencia de enfoques MoE o SSM, mantiene una arquitectura transformer compacta y eficiente. En este caso, el modelo procesa dos imágenes RGB de 480x640 píxeles junto con el estado del robot (6 dimensiones) y predice una acción de 6 dimensiones para el control del robot `so_follower`.

El entrenamiento se realizó mediante aprendizaje por imitación (behavior cloning) sobre el dataset `JanPhilipp/ttz_tools_merged_2`, que contiene 80 demostraciones de la tarea de pick-and-place. Se utilizó el framework LeRobot con una configuración mínima: 100 pasos, batch size 8, optimizador AdamW y learning rate 0.0001. No se aplicó RLHF ni DPO; es un fine-tune supervisado del modelo base. La innovación destacable no está en la arquitectura del checkpoint, sino en la capacidad de SmolVLA para operar con costes computacionales reducidos y en hardware de consumo.

## Capacidades

- Predicción de acciones de 6 dimensiones para control robótico en un robot `so_follower`.
- Procesamiento de dos entradas visuales simultáneas (camelas `camera1` y `camera2`) de 480x640 píxeles.
- Ejecución de tareas de manipulación de objetos tipo pick-and-place (recoger herramientas de una zona y depositarlas en otra).
- Integración nativa con el framework LeRobot para entrenamiento, evaluación e inferencia mediante `lerobot-rollout`.
- Compatible con la configuración de hardware estándar de LeRobot y con el workflow de grabación de demostraciones humanas.
- No soporta tool calling, generación de texto ni razonamiento simbólico, ya que es un modelo de política visual-motora, no un modelo de lenguaje general.

## Casos de uso

- Automatización de recogida y colocación de herramientas: el modelo puede controlar un brazo robótico para transferir herramientas desde una zona verde a una zona roja en entornos industriales o de laboratorio, integrado en una célula de manipulación.
- Prototipado rápido de políticas robóticas: gracias a su tamaño reducido y entrenamiento con pocos pasos, es ideal para investigadores que necesitan iterar sobre tareas de aprendizaje por imitación sin grandes recursos computacionales.
- Robots de bajo coste y cobots: al ser un VLA compacto, puede desplegarse en robots de sobremesa o plataformas educativas como `so_follower`, usando GPUs de consumo.
- Investigación en generalización de políticas: se puede usar como baseline para estudiar cómo un VLA fino ajustado con pocas demostraciones se comporta frente a variaciones de posición, iluminación o distracciones.
- Tareas de clasificación y orden en logística: en un entorno controlado, el robot puede separar objetos según su ubicación de origen, aplicando la misma tarea de pick-and-place con herramientas u otros ítems.
- Fundamentos para fine-tune adicional: dado que el modelo se distribuye bajo Apache-2.0, puede servir como punto de partida para entrenar nuevas tareas con el mismo robot y configuración de cámaras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política en robot real.

## Requisitos de hardware

- El modelo tiene 450.046.176 parámetros y el repositorio pesa 1.2 GB, lo que sugiere pesos en FP16 o BF16. La VRAM necesaria para inferencia no está documentada; una estimación inicial es de 4-6 GB, suficiente para una GPU de consumo con 8 GB de VRAM.
- GPU recomendadas: RTX 3060 (12 GB), RTX 4070, o aceleradores similares de gama media. También es probable que funcione en Jetson Orin para despliegue en robótica.
- No se requiere una GPU de centro de datos (A100/H100). Para entrenamiento, el proceso reportado con 100 pasos es viable en una GPU de consumo.
- Opciones de despliegue: no aplica para vLLM, llama.cpp, Ollama o TGI, ya que es un modelo de política robótica. Se despliega mediante LeRobot, utilizando el comando `lerobot-rollout`.
- Latencia y throughput: no disponibles. Al procesar imágenes a 30 FPS, se espera que la inferencia sea tiempo real en una GPU adecuada, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| JanPhilipp/policy_test | 450.046.176 | no disponible | Apache-2.0 | HuggingFace, LeRobot |
| lerobot/smolvla_base | no disponible (misma arquitectura) | no disponible | Apache-2.0 | HuggingFace, LeRobot |

No se dispone de datos de rendimiento publicados para comparar directamente con otros modelos de la misma categoría. El fine-tune `policy_test` se diferencia del modelo base únicamente por su entrenamiento en el dataset `ttz_tools_merged_2`. No se conocen comparativas con otros VLA como OpenVLA o modelos similares en la información proporcionada.

## Limitaciones y advertencias

- El modelo se entrenó con solo 80 episodios y 100 pasos, por lo que su generalización está limitada a la tarea concreta y a la configuración de cámaras utilizada.
- No se ha realizado ninguna evaluación en robot real; la tasa de éxito es desconocida y no debe asumirse que sea robusta para producción sin pruebas previas.
- Depende críticamente de las dos cámaras con resolución fija de 480x640 y de la posición del robot `so_follower`. Cambios en óptica, iluminación o orientación de la escena pueden degradar el rendimiento.
- No es un modelo de lenguaje general; no genera texto, no soporta razonamiento conversacional ni tool calling.
- Potenciales sesgos derivados del dataset: si las demostraciones se realizaron en un entorno concreto (misma iluminación, fondo, herramientas), el modelo puede fallar en condiciones diferentes.
- La licencia Apache-2.0 permite el uso comercial sin restricciones, pero la seguridad y fiabilidad del control robótico en entornos reales deben ser validadas por el usuario.
- No se especifica el tipo de cuantización soportado; el uso de cuantizaciones no probadas podría afectar al comportamiento de la política.

## Enlaces

- HuggingFace: [JanPhilipp/policy_test](https://huggingface.co/JanPhilipp/policy_test)
- Paper SmolVLA: [arXiv:2506.01844](https://huggingface.co/papers/2506.01844)
- Guía de SmolVLA en LeRobot: [https://huggingface.co/docs/lerobot/main/en/smolvla](https://huggingface.co/docs/lerobot/main/en/smolvla)
- Documentación de LeRobot: [https://huggingface.co/docs/lerobot/index](https://huggingface.co/docs/lerobot/index)
- Repositorio de LeRobot: [https://github.com/huggingface/lerobot](https://github.com/huggingface/lerobot)
- Dataset de entrenamiento: [JanPhilipp/ttz_tools_merged_2](https://huggingface.co/datasets/JanPhilipp/ttz_tools_merged_2)
- Modelo base: [lerobot/smolvla_base](https://huggingface.co/lerobot/smolvla_base)
