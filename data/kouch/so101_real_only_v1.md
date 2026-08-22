# Kouch/SO101_real_only_v1

## Resumen

SO101_real_only_v1 es una política robótica entrenada con el método Action Chunking with Transformers (ACT) y publicada mediante el framework LeRobot de Hugging Face. El modelo fue desarrollado por Kouch Sato para controlar un brazo robótico SO-101 (SO Follower) en una tarea de manipulación pick-and-place: recoger un cubo azul y colocarlo en una caja. Se trata de un modelo de aprendizaje por imitación que aprende a partir de datos teleoperados, en este caso un dataset propio de 5 episodios con 2.395 fotogramas capturados a 30 FPS.

La relevancia de este modelo reside en su carácter demostrativo del flujo de trabajo completo de LeRobot: teleoperación, entrenamiento y despliegue de políticas ACT sobre hardware real de bajo coste. Con solo 51,6 millones de parámetros, es una política ligera que consume una imagen RGB de 480x640 píxeles y el estado del robot (6 dimensiones) para producir acciones de 6 dimensiones. La licencia Apache 2.0 permite su uso y modificación sin restricciones comerciales, lo que facilita su adopción en proyectos de robótica educativa e industrial.

El modelo está vinculado al ecosistema de NVIDIA Isaac para simulación y transferencia sim-to-real del SO-101, lo que sugiere que puede servir como punto de partida para transferir políticas entrenadas en simulación al mundo real. No se han publicado resultados de evaluación en robot real, por lo que su rendimiento efectivo queda por validar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), basada en CVAE con transformer |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | No disponible (solo safetensors, sin cuantización publicada) |
| Idiomas soportados | No aplicable (no es modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ACT descrita en el paper "Action Chunking with Transformers" (arXiv:2304.13705). ACT es un método de aprendizaje por imitación que combina un transformer con un CVAE (Conditional Variational Autoencoder). El CVAE codifica la variabilidad de las demostraciones (por ejemplo, pequeñas diferencias en la trayectoria) en una variable latente, mientras que el transformer decodifica esa latente junto con las observaciones para predecir un "chunk" de acciones futuras en lugar de un solo paso. Esta predicción por bloques reduce la acumulación de errores y mejora la estabilidad del control.

El entrenamiento se realizó con el framework LeRobot versión 0.6.2, usando el dataset Kouch/SO101_real_teleop_v1 con 5 episodios teleoperados (2.395 frames a 30 FPS). La configuración de entrenamiento fue: 10.000 pasos, batch size 8, optimizador AdamW con learning rate 1e-5 y semilla 1000. El modelo consume como entrada el estado del robot (vector de 6 dimensiones) y una imagen RGB de la cámara superior (3x480x640), y produce una acción de 6 dimensiones. No se aplicaron técnicas de RLHF ni DPO, dado que es un método de imitación puro.

## Capacidades

- Control robótico pick-and-place: el modelo es capaz de generar comandos de acción de 6 dimensiones (posición y orientación del efector final) para recoger un cubo azul y colocarlo en una caja.
- Aprendizaje por imitación: la política imita trayectorias teleoperadas, lo que permite transferir habilidades humanas al robot sin programación explícita.
- Procesamiento visual: integra una cámara RGB superior (480x480) como entrada visual, lo que le permite localizar el objeto y la caja en el espacio de trabajo.
- Control en tiempo real: con solo 51,6 millones de parámetros, la inferencia es ligera y puede ejecutarse en GPUs consumer, lo que la hace adecuada para robots de bajo coste como el SO-101.
- Integración con LeRobot: compatible con los comandos `lerobot-rollout` y `lerobot-train`, lo que facilita su despliegue y reentrenamiento.
- No incluye soporte de tool calling, agentes, razonamiento multi-paso ni capacidades de lenguaje, ya que es un modelo puramente de control motor.

## Casos de uso

- Automatización de tareas de manipulación en laboratorio: el modelo puede colocarse cubos o viales en posiciones específicas, como en el curso de NVIDIA Isaac para transferencia sim-to-real de SO-101. Se usaría `lerobot-rollout` con el comando descrito en la model card, especificando la tarea "Pick up blue cube and place it to the box".
- Educación en robótica: es un ejemplo completo de entrenamiento de una política ACT con LeRobot, ideal para que estudiantes aprendan el flujo de teleoperación, entrenamiento y despliegue. El código de entrenamiento está documentado en la guía de LeRobot.
- Prototipado rápido de políticas de agarre: dado su pequeño tamaño y la licencia Apache 2.0, puede servir como base para experimentar con nuevas tareas de pick-and-place en entornos académicos o industriales.
- Benchmarking de métodos de imitación: al ser un modelo ACT estándar, se puede comparar con otras arquitecturas (diffusion policies, RNN, etc.) sobre el mismo dataset de teleoperación para evaluar rendimiento.
- Integración en pipelines de fabricación flexible: en entornos de producción con células robóticas reconfigurables, el modelo puede reentrenarse con nuevos datos de teleoperación para adaptarse a nuevas tareas sin reprogramar.
- Investigación en sim-to-real: dado su vínculo con el taller de NVIDIA Isaac, se puede utilizar como política de referencia para validar técnicas de transferencia sim-to-real en el brazo SO-101.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). No hay datos sobre tasas de éxito en la tarea pick-and-place, ni comparaciones con otros modelos en el mismo robot.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 51,6 millones de parámetros, con una imagen de entrada de 480x640. En FP32, el peso ocupa aproximadamente 206 MB, por lo que cualquier GPU con al menos 1 GB de VRAM puede ejecutar la inferencia. Con cuantización a FP16 o int8, el requisito baja a unos 103 MB o 52 MB respectivamente.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA y al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3060, RTX 4090) es suficiente. En un robot real, se suele usar una GPU integrada o una Jetson (como NVIDIA Jetson Orin Nano) para el despliegue embebido.
- Compatibilidad con consumer GPU: sí, cabe en cualquier GPU de consumo actual.
- Opciones de despliegue: el modelo está diseñado para usarse con LeRobot, que soporta inferencia en GPU con PyTorch. No hay soporte para vLLM, llama.cpp ni Ollama, ya que no es un modelo de lenguaje. El despliegue se realiza mediante el comando `lerobot-rollout` en el robot.
- Latencia y throughput: no hay datos publicados. Dado el tamaño, se espera una inferencia en el orden de milisegundos en una GPU moderna, pero no se puede dar una cifra exacta.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SO101_real_only_v1 | ACT (CVAE + Transformer) | 51,7 M | No aplica | Apache 2.0 | Hugging Face (LeRobot) |
| SO101_Robosta_0628_v1 (de Kouch) | No disponible | No disponible | No aplica | No disponible | Hugging Face (LeRobot) |
| Políticas ACT genéricas de LeRobot | ACT | 51-100 M típico | No aplica | Apache 2.0 | Hugging Face |

No hay modelos comparables directamente publicados con el mismo dataset y robot en la información disponible. La comparativa se limita a otros modelos ACT de la misma familia, sin datos de rendimiento.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay resultados de éxito en robot real, por lo que no se puede garantizar la robustez de la política en condiciones del mundo real.
- Dataset muy pequeño: entrenado con solo 5 episodios y 2.395 frames, lo que limita la generalización a nuevas posiciones del objeto, condiciones de iluminación o variaciones de la tarea.
- Riesgo de sobreajuste: el modelo puede memorizar las trayectorias de los episodios de entrenamiento y fallar ante perturbaciones no vistas.
- Sin soporte de lenguaje: no es un modelo multimodal ni de lenguaje; no puede entender instrucciones textuales ni razonar sobre la tarea.
- Dependencia del robot específico: entrenado para el brazo SO-101 (so_follower), no es transferible directamente a otros robots sin reentrenamiento.
- Riesgo de alucinación de acciones: como modelo generativo, puede producir acciones erróneas o inestables en estados no vistos, lo que requiere supervisión durante la operación.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no incluye garantías de seguridad para aplicaciones industriales críticas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kouch/SO101_real_only_v1
- Dataset de teleoperación: https://huggingface.co/datasets/Kouch/SO101_real_teleop_v1
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Curso NVIDIA sim-to-real SO-101: https://docs.nvidia.com/learning/physical-ai/sim-to-real-so-101/latest/index.html
- Repositorio del taller Isaac Sim: https://github.com/isaac-sim/Sim-to-Real-SO-101-Workshop
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Kouch/SO101_real_teleop_v1
- Otro modelo del autor: https://huggingface.co/Kouch/SO101_Robosta_0628_v1
