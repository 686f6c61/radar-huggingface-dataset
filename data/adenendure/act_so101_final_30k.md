# AdenEndure/act_so101_final_30k

## Resumen

El modelo `AdenEndure/act_so101_final_30k` es una política de aprendizaje por imitación basada en el método Action Chunking with Transformers (ACT), desarrollada por AdenEndure y entrenada con el framework LeRobot. ACT es una técnica de imitación que predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error acumulado y mejora la estabilidad del control en robots manipuladores. El modelo está diseñado para ejecutar la tarea específica de recoger un cubo y colocarlo en un cuenco, utilizando un robot de tipo `so_follower` equipado con dos cámaras.

La arquitectura es un transformer de tamaño moderado, con 51.668.614 parámetros totales, y los pesos se distribuyen en formato safetensors. El modelo consume observaciones multimodales: estado del robot (6 dimensiones) e imágenes de dos cámaras RGB de 480x640 píxeles, y produce acciones de 6 dimensiones. Al ser una política de control motor, no se trata de un modelo de lenguaje, por lo que no tiene longitud de contexto en el sentido de procesamiento de texto. Su relevancia radica en que ofrece un checkpoint listo para usar en tareas de manipulación robótica, integrado en el ecosistema LeRobot, lo que facilita el prototipado y la investigación en aprendizaje por imitación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (política de imitación; no aplica contexto de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT, que utiliza un transformer para predecir un bloque de acciones futuras a partir de las observaciones actuales. Este enfoque de "action chunking" es la principal innovación del método: en lugar de decidir una única acción por paso, el modelo genera una secuencia de acciones, lo que mejora la coherencia temporal y reduce la acumulación de errores en el control del robot.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `AdenEndure/so101_final`, que contiene 50 episodios de teleoperación y 30.354 frames a 30 FPS. La tarea registrada es "Pick up the cube and place it in the bowl" (recoger el cubo y colocarlo en el cuenco). La configuración de entrenamiento incluyó 30.000 pasos, tamaño de lote 2, optimizador AdamW, tasa de aprendizaje 1e-05 y semilla 1000. Las entradas del modelo son el estado del robot (6 dimensiones) y las imágenes de dos cámaras (`cam1`, `cam2`) de 480x640; la salida es un vector de acción de 6 dimensiones. No se realizó RLHF ni DPO, al tratarse de un modelo de control motor.

## Capacidades

- Aprendizaje por imitación de tareas teleoperadas, con predicción de action chunks para lograr movimientos suaves y consistentes.
- Entrada multimodal: combina el estado del robot (6 dimensiones) con dos imágenes RGB de 480x640 píxeles.
- Salida de acciones continuas de 6 dimensiones, adecuadas para control de posición o velocidad de un manipulador.
- Integración nativa con el framework LeRobot, lo que permite entrenar, evaluar y desplegar la política mediante comandos CLI.
- Capacidad de ejecutar la tarea específica para la que fue entrenado (pick-and-place de un cubo en un cuenco).
- No soporta tool calling, generación de texto, razonamiento simbólico ni interacción en lenguaje natural; es exclusivamente una política de control.

## Casos de uso

- Manipulación de objetos en entornos de laboratorio: el modelo puede ejecutar la tarea de pick-and-place para la que fue entrenado, usando las cámaras y el estado del robot, ideal para experimentos de robótica.
- Automatización de tareas repetitivas en producción: gracias a la predicción por chunks, puede realizar movimientos estables en operaciones sencillas de recogida y colocación, con supervisión humana.
- Investigación en aprendizaje por imitación: sirve como referencia para comparar el método ACT con otras políticas y estudiar el efecto del action chunking.
- Prototipado rápido de robots: con LeRobot, se puede cargar el modelo en un robot `so_follower` y probar la tarea en minutos, acelerando el desarrollo de aplicaciones robóticas.
- Entrenamiento de operadores teleoperados: el modelo puede asistir a operadores humanos en tareas de recogida y colocación, actuando como un sistema de ayuda parcial.
- Educación en robótica: permite demostrar el flujo completo de recogida de datos, entrenamiento y despliegue de una política de imitación en un entorno académico.
- Integración en sistemas de control de robots colaborativos: el modelo puede actuar como controlador de bajo nivel para tareas específicas, dentro de un sistema más amplio con planificación de alto nivel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política. No se dispone de métricas de éxito en robot real, ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño de los pesos en safetensors es de 0.2 GB, lo que sugiere que la inferencia puede ejecutarse en GPUs con poca memoria, pero no hay una cifra oficial publicada.
- GPU recomendadas: no disponible; se recomienda consultar la documentación de LeRobot para conocer los requisitos de hardware del framework.
- ¿Cabe en GPU de consumo? Probablemente sí, dado el reducido tamaño de los pesos, pero no hay datos confirmados.
- Opciones de despliegue: LeRobot (comando `lerobot-rollout`), inferencia con PyTorch. No aplican vLLM, llama.cpp ni Ollama, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de especificaciones detalladas de modelos comparables en la información proporcionada. Se han identificado otras políticas ACT en el Hub de Hugging Face, como `aiden-li/so101-act` y `aiden-li/so101-act-open-lower-drawer`, pero no se han publicado sus parámetros ni resultados de rendimiento. El método original ACT (paper 2304.13705) es la referencia metodológica, pero no se dispone de una comparativa numérica con este checkpoint.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea "recoger el cubo y colocarlo en el cuenco". No generaliza a otras tareas ni a otros objetos sin reentrenamiento.
- Depende de la configuración de cámaras (`cam1`, `cam2`) y del tipo de robot (`so_follower`). Cambios en la iluminación, posición de las cámaras o calibración pueden degradar el rendimiento.
- El dataset contiene solo 50 episodios, lo que puede provocar sobreajuste y baja robustez ante variaciones del entorno.
- No se han publicado resultados de evaluación en robot real, por lo que el rendimiento real es desconocido.
- Al ser una política de imitación, no tiene mecanismos de seguridad ni detección de fallos; debe supervisarse en entornos de producción.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías.
- No es un modelo de lenguaje: no soporta razonamiento, tool calling ni interacción textual.

## Enlaces

- Hugging Face: https://huggingface.co/AdenEndure/act_so101_final_30k
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Dataset de entrenamiento: https://huggingface.co/datasets/AdenEndure/so101_final
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=AdenEndure/so101_final
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
