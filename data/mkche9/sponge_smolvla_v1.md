# mkche9/sponge_smolvla_v1

## Resumen

`mkche9/sponge_smolvla_v1` es un modelo de vision-language-action (VLA) fine-tuneado a partir de `lerobot/smolvla_base`, desarrollado por mkche9 (Cherniavskyi Mykyta) para una tarea robótica concreta: recoger una esponja y colocarla en una caja. El modelo está entrenado con el framework LeRobot y utiliza el dataset `mkche9/sponge_pick_merged_v2`, compuesto por 300 episodios y 155042 fotogramas a 30 FPS.

SmolVLA es un modelo VLA ligero y eficiente, diseñado para lograr un rendimiento competitivo con costes computacionales reducidos y poder desplegarse en hardware de consumo. Su arquitectura combina un modelo de lenguaje y visión (VLM) compacto preentrenado con un "action expert" entrenado mediante flow matching. A partir de varias imágenes y una instrucción en lenguaje, el modelo genera un fragmento de acciones para controlar un robot.

Este fine-tuning concreto está orientado a un robot `so_follower` con cámaras `overhead` y `wrist`. El repositorio no incluye resultados de evaluación, por lo que su rendimiento real en robot no ha sido validado públicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA: VLM compacto + action expert con flow matching |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `lerobot/smolvla_base` mediante LeRobot. La arquitectura subyacente es la de SmolVLA, descrita en el paper [arxiv:2506.01844](https://arxiv.org/html/2506.01844v1): un modelo ligero compuesto por un VLM preentrenado de tamaño compacto y un "action expert" entrenado con flow matching. Dado un conjunto de imágenes y una instrucción de lenguaje, el modelo genera un fragmento de acciones continuas.

El entrenamiento se realizó sobre el dataset `mkche9/sponge_pick_merged_v2`, con 300 episodios, 155042 fotogramas y una frecuencia de 30 FPS. La tarea es "pick sponge and place in box". La configuración de entrenamiento es la siguiente: 50000 pasos, batch size 2, optimizador AdamW, learning rate 0.0001, seed 1000 y LeRobot versión 0.6.1. No se menciona el uso de RLHF ni DPO. La innovación técnica destacable es el uso de flow matching para la generación de acciones, lo que permite una política eficiente y adecuada para hardware de consumo.

## Capacidades

- Control robótico: genera acciones de 6 dimensiones (`action` con forma `(6,)`) para el robot `so_follower`.
- Percepción visual: procesa tres entradas de imagen (`camera1`, `camera2`, `camera3`), cada una de tamaño `(3, 256, 256)`.
- Entrada de estado: observa el estado del robot (`observation.state` con forma `(6,)`).
- Tarea específica: entrenado para "pick sponge and place in box", una tarea de manipulación de objetos.
- Multimodalidad: combina imágenes, estado del robot e instrucción de lenguaje.
- Integración con LeRobot: compatible con el framework LeRobot para entrenamiento, evaluación y despliegue.
- No soporta tool calling ni razonamiento multi-paso en el sentido de los modelos de lenguaje generales; su salida es una secuencia de acciones robóticas.

## Casos de uso

- Recogida y colocación de objetos (pick and place) en entornos industriales: el modelo puede controlar un robot `so_follower` para recoger esponjas y colocarlas en cajas, automatizando tareas repetitivas de manipulación.
- Automatización en laboratorios: útil para tareas de preparación de muestras o manipulación de materiales blandos, donde se requiere precisión y repetibilidad.
- Robótica asistencial: puede integrarse en robots de asistencia para ayudar a personas con movilidad reducida a recoger y colocar objetos cotidianos.
- Investigación en aprendizaje por imitación: sirve como ejemplo de fine-tuning de un modelo VLA compacto sobre un dataset pequeño, permitiendo estudiar la transferencia de políticas.
- Despliegue en robots de bajo coste: gracias a la eficiencia de SmolVLA, el modelo puede ejecutarse en hardware de consumo, lo que lo hace adecuado para prototipos y robots educativos.
- Integración en pipelines de LeRobot: se puede usar con `lerobot-rollout` para ejecutar la política en un robot real, o con `lerobot-train` para fine-tunear sobre nuevos datasets.
- Demostraciones educativas: permite mostrar el funcionamiento de un modelo VLA en aulas o ferias tecnológicas, dado su bajo coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: el paper de SmolVLA indica que el modelo puede desplegarse en hardware de consumo, pero no se ofrecen cifras concretas de VRAM ni modelos de GPU específicos.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte para ejecución en GPU mediante `--policy.device=cuda`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de modelos comparables. El modelo es un fine-tuning específico de `lerobot/smolvla_base`, pero no se dispone de especificaciones del modelo base ni de otros fine-tunings similares para realizar una comparativa cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. El modelo ha sido entrenado únicamente sobre un dataset de una tarea específica, por lo que no se ha evaluado su comportamiento ante sesgos.
- Riesgo de alucinación: en modelos VLA, la alucinación se manifiesta como acciones incorrectas o no deseadas. Al no existir resultados de evaluación, el riesgo es desconocido.
- Limitaciones de tarea: el modelo está entrenado exclusivamente para "pick sponge and place in box". No generalizará a otras tareas sin un fine-tuning adicional.
- Limitaciones de hardware y robot: está diseñado para el robot `so_follower` y las cámaras especificadas. Cambiar el robot o las cámaras puede requerir reentrenamiento.
- Dependencia de LeRobot: el modelo se integra con la versión 0.6.1 de LeRobot; cambios en el framework pueden afectar a la compatibilidad.
- Tamaño del repositorio: el repo muestra 0.0 GB, lo que podría indicar que los pesos no se han subido completamente o que el modelo es extremadamente pequeño. Verificar antes de usar.
- Falta de validación en producción: no hay resultados de evaluación en robot real, por lo que el rendimiento en entornos de producción no está garantizado.
- Licencia: Apache 2.0 permite uso comercial, pero es necesario revisar las licencias del dataset `mkche9/sponge_pick_merged_v2` y del modelo base `lerobot/smolvla_base` para asegurar el cumplimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mkche9/sponge_smolvla_v1
- Paper de SmolVLA: https://arxiv.org/html/2506.01844v1
- Dataset de entrenamiento: https://huggingface.co/datasets/mkche9/sponge_pick_merged_v2
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mkche9/sponge_pick_merged_v2
