# dogeum/demo_right

# Ficha técnica del modelo dogeum/demo_right

## Resumen

`dogeum/demo_right` es un modelo de robótica basado en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias de acciones en lugar de pasos individuales. Ha sido desarrollado por el usuario `dogeum` y entrenado con el framework LeRobot de Hugging Face, a partir del dataset `dogeum/demo_dataset_right`. El modelo está diseñado para controlar robots manipuladores aprendiendo de demostraciones teleoperadas.

El modelo tiene 51.668.614 parámetros (aproximadamente 51,7 millones) y se distribuye en formato `safetensors`, con un tamaño de repositorio de 0,2 GB. Su arquitectura es un Transformer con la técnica de *action chunking*, que permite generar acciones coherentes en el tiempo, mejorando la estabilidad del control en tareas de manipulación. La licencia es Apache-2.0.

Este modelo es relevante para investigadores y desarrolladores que trabajan en robótica de aprendizaje por imitación, ya que ofrece una implementación ligera y lista para usar dentro del ecosistema LeRobot, con soporte para entrenamiento y evaluación mediante comandos simples.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Action Chunking with Transformers, ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT (Action Chunking with Transformers), presentada en el paper 2304.13705. ACT es un método de aprendizaje por imitación que, en lugar de predecir una única acción por paso de tiempo, predice un *chunk* de acciones futuras. Esto reduce el error acumulativo típico de las políticas que actúan paso a paso y mejora la suavidad y consistencia de los movimientos del robot.

El modelo ha sido entrenado con el framework LeRobot, usando el dataset `dogeum/demo_dataset_right`. No se ha publicado información sobre el número de tokens, la composición del dataset ni la duración del entrenamiento. Tampoco se mencionan procesos de RLHF o DPO. El entrenamiento se realiza mediante demostraciones teleoperadas, y el modelo puede ser reevaluado o reentrenado con los comandos proporcionados en la documentación de LeRobot.

## Capacidades

- Generación de secuencias de acciones de control para robots manipuladores, basadas en demostraciones teleoperadas.
- Aprendizaje por imitación de tareas de manipulación, como recoger y colocar objetos, ensamblar piezas o realizar movimientos repetitivos.
- Predicción de *chunks* de acciones, lo que permite ejecutar movimientos coordinados y reducir la variabilidad en el control.
- Integración nativa con el framework LeRobot para entrenamiento (`lerobot-train`) y evaluación (`lerobot-record`).
- Compatibilidad con robots de bajo coste tipo SO100, según la documentación de LeRobot.
- No es un modelo de lenguaje: no genera texto, no soporta *tool calling* ni razonamiento simbólico.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos industriales: el modelo aprende de demostraciones humanas y predice secuencias de acciones para mover objetos de un punto a otro, reduciendo la necesidad de programación manual.
- Investigación en aprendizaje por imitación: sirve como baseline para comparar políticas de *action chunking* frente a otros métodos de control robótico, gracias a su implementación ligera y reproducible con LeRobot.
- Teleoperación y asistencia en tareas repetitivas: el modelo puede ejecutar de forma autónoma tareas que previamente han sido teleoperadas por un operador, como en líneas de ensamblaje o laboratorios.
- Manipulación de objetos en entornos de laboratorio: adecuado para experimentos con brazos robóticos de bajo coste (tipo SO100), donde se necesita aprender tareas específicas a partir de pocas demostraciones.
- Robótica de servicio: el modelo puede aplicarse a tareas domésticas de recogida y colocación de objetos, siempre que se disponga de demostraciones teleoperadas del entorno objetivo.
- Entrenamiento de políticas en simulación: al ser un modelo ligero, puede integrarse en pipelines de simulación para evaluar su comportamiento antes de desplegarlo en hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- El modelo tiene 51,7 millones de parámetros y el repositorio pesa 0,2 GB, lo que sugiere que es un modelo ligero, pero no hay datos oficiales de requisitos de hardware.
- Opciones de despliegue: LeRobot (inferencia mediante `lerobot-record`), con soporte para dispositivos CUDA según la configuración del framework.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo ha sido entrenado en un dataset específico (`demo_dataset_right`) y puede no generalizar a otras tareas, entornos o tipos de robot.
- No se dispone de información sobre sesgos, evaluación de seguridad ni robustez ante perturbaciones del entorno.
- Al ser un modelo de robótica, no genera texto ni lenguaje natural, por lo que los riesgos de alucinación textual no aplican.
- La licencia Apache-2.0 permite uso comercial, pero requiere incluir el aviso de licencia y la atribución correspondiente.
- El modelo está diseñado para ser usado con LeRobot; su uso fuera de este framework requeriría adaptación del código y de los formatos de entrada/salida.

## Enlaces

- Hugging Face: https://huggingface.co/dogeum/demo_right
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Dataset de entrenamiento: https://huggingface.co/datasets/dogeum/demo_dataset_right
