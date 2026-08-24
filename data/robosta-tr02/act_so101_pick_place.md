# robosta-tr02/act_so101_pick_place

## Resumen

El modelo `robosta-tr02/act_so101_pick_place` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT) para ejecutar una tarea de pick-and-place con el brazo robótico SO-101. Ha sido desarrollado por el usuario `robosta-tr02` y publicado en Hugging Face bajo la licencia Apache-2.0. Se trata de un ejemplo práctico de aprendizaje por imitación (imitation learning) aplicado a la robótica, que aprovecha la librería LeRobot de Hugging Face para el entrenamiento y la inferencia.

El modelo consume imágenes de dos cámaras (frontal y de muñeca) junto con el estado del robot (6 dimensiones) y genera una acción de 6 dimensiones correspondiente al movimiento del brazo. Con 51.668.614 parámetros, es un modelo compacto pensado para ejecutarse en hardware de gama media o baja. Su relevancia actual radica en que demuestra cómo se puede aplicar un transformer de acción a un brazo robótico económico, facilitando la automatización de tareas manipulativas en entornos de investigación y educación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de robótica, no de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura **Action Chunking with Transformers (ACT)** descrita en el paper arXiv:2304.13705. ACT es un método de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de un solo paso, lo que permite un control más suave y robusto. La arquitectura combina un codificador de imágenes (para las cámaras frontal y de muñeca) con un transformer que procesa el estado del robot y genera las acciones. En este caso, el modelo consume imágenes de 3x480x640 y un vector de estado de 6 dimensiones, y produce una acción de 6 dimensiones.

El entrenamiento se realizó con el dataset `robosta-tr02/so101_pick_place`, que contiene 10 episodios teleoperados (8178 fotogramas a 30 FPS) de la tarea "coger el cubo y colocarlo en el plato". La configuración de entrenamiento fue: 20.000 pasos, batch size 8, optimizador AdamW, tasa de aprendizaje 1e-5, y semilla 1000, todo ello con la librería LeRobot en su versión 0.6.1. No se aplicaron técnicas de RLHF ni DPO; es un aprendizaje supervisado puro a partir de demostraciones.

## Capacidades

- **Ejecución de tareas de pick-and-place**: el modelo está entrenado específicamente para coger un cubo y colocarlo sobre un plato, una tarea de manipulación básica.
- **Procesamiento de visión**: utiliza dos cámaras (frontal y de muñeca) para percibir la escena, con imágenes de 480x640 píxeles.
- **Generación de acciones continuas**: produce un vector de acción de 6 dimensiones (posición y orientación del efector final) en cada paso de control.
- **Inferencia en tiempo real**: gracias a su tamaño moderado, puede ejecutarse en un bucle de control de 30 Hz si se dispone de la GPU adecuada.
- **Integración con LeRobot**: compatible con el ecosistema de LeRobot para entrenamiento, despliegue y evaluación de políticas robóticas.

## Casos de uso

- **Automatización de tareas de manipulación en entornos de laboratorio**: el modelo puede encargarse de la tarea de pick-and-place de forma repetitiva en un entorno controlado, liberando al operador humano de tareas monótonas.
- **Investigación en aprendizaje por imitación**: sirve como ejemplo de referencia para estudiar el rendimiento de ACT en un robot económico, permitiendo comparar con otras técnicas o con otros robots.
- **Prototipado rápido de políticas robóticas**: gracias a su pequeño tamaño y a la integración con LeRobot, se puede desplegar en un brazo SO-101 para pruebas rápidas de nuevas tareas o entornos.
- **Educación y formación en robótica**: es un modelo sencillo y bien documentado para que estudiantes y desarrolladores aprendan a entrenar, evaluar y desplegar políticas robóticas con aprendizaje por imitación.
- **Validación de pipelines de aprendizaje**: puede utilizarse como caso de prueba para verificar la correcta instalación de LeRobot, la conexión de cámaras y la sincronización del robot en un entorno de desarrollo.
- **Investigación en transferencia de tareas**: al ser un modelo pequeño y entrenado con pocos datos, es un punto de partida para experimentos de fine-tuning o transferencia a tareas similares, como cambiar la posición del cubo o del plato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que no hay resultados de evaluación en robot real, por lo que no se dispone de datos objetivos de tasa de éxito ni de comparación con otros modelos.

## Requisitos de hardware

- **VRAM estimada**: no se proporcionan datos específicos, pero al tratarse de un modelo de ~51 millones de parámetros, se estima que puede caber en GPUs con al menos 4 GB de VRAM para inferencia en tiempo real con imágenes de 640x480.
- **GPU recomendadas**: cualquier GPU moderna con soporte CUDA (p. ej., RTX 2060, RTX 3060, T4, A10) puede ejecutar la inferencia. También es posible usar CPU, aunque la latencia será mayor.
- **Despliegue**: el modelo está pensado para ser usado con LeRobot, que ofrece comandos como `lerobot-rollout` para ejecutar la política en un robot real. No se menciona compatibilidad con vLLM, llama.cpp u otros frameworks de inferencia de modelos de lenguaje.
- **Latencia**: no se indica latencia específica, pero para control robótico se recomienda un bucle de control de al menos 30 Hz, lo que implica una latencia de inferencia inferior a 33 ms. El tamaño del modelo sugiere que es factible en GPUs modernas.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoría. Existe un modelo similar publicado por el usuario `1z52` con el mismo nombre `SO-101_Cube_pick_place_act_model`, pero no se han publicado resultados de rendimiento ni especificaciones técnicas comparables. En general, los modelos ACT para robots SO-101 son de tamaño y arquitectura similares, pero no se pueden establecer comparaciones cuantitativas sin datos de evaluación.

## Limitaciones y advertencias

- **Tarea muy específica**: el modelo solo puede ejecutar la tarea de pick-and-place para la que fue entrenado. No generaliza a otras tareas ni a variaciones del entorno (iluminación, posición de los objetos, etc.) si no se han visto durante el entrenamiento.
- **Datos de entrenamiento limitados**: se ha entrenado con solo 10 episodios, lo que puede dar lugar a una política poco robusta frente a perturbaciones externas o variaciones en la ejecución.
- **Sesgo de visión**: el rendimiento depende críticamente de la posición y calibración de las cámaras. Cualquier cambio en la disposición de las cámaras o en la escena puede degradar el rendimiento.
- **Sin evaluación**: no se han publicado resultados de evaluación en robot real, por lo que no se conoce la tasa de éxito real en condiciones normales de uso.
- **Dependencia del robot**: el modelo está entrenado para el robot `so_follower` (SO-101). No es compatible con otros robots sin reentrenamiento.
- **Licencia Apache-2.0**: permite uso comercial, pero no se proporcionan garantías sobre el rendimiento ni sobre la seguridad del modelo en entornos de producción.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/robosta-tr02/act_so101_pick_place)
- [Dataset de entrenamiento](https://huggingface.co/datasets/robosta-tr02/so101_pick_place)
- [Paper de ACT](https://huggingface.co/papers/2304.13705)
- [Repositorio de LeRobot](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía de ACT en LeRobot](https://huggingface.co/docs/lerobot/main/en/act)

Nota: la fecha de creación del modelo (2026-08-23) parece estar en el futuro, lo que sugiere un error de reloj o una fecha de prueba; no afecta a la validez del contenido técnico.</think>## Resumen

El modelo `robosta-tr02/act_so101_pick_place` es una política de robótica entrenada con **Action Chunking with Transformers (ACT)** para ejecutar una tarea de pick-and-place con el brazo robótico SO-101. Ha sido desarrollado por el usuario `robosta-tr02` y publicado en Hugging Face bajo licencia Apache-2.0. Se trata de un ejemplo práctico de aprendizaje por imitación (imitation learning) aplicado a la robótica, utilizando la librería LeRobot para el entrenamiento y la inferencia.

El modelo consume imágenes de dos cámaras (frontal y de muñeca) junto con el estado del robot (6 dimensiones) y genera una acción de 6 dimensiones. Con 51.668.614 parámetros, es un modelo compacto pensado para ejecutarse en hardware de gama media o baja. Su relevancia radica en demostrar cómo un transformer de acción puede aplicarse a un brazo robótico económico, facilitando la automatización de tareas manipulables en entornos de investigación y educación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de robótica, no de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura **Action Chunking with Transformers (ACT)**, descrita en el paper arXiv:2304.13705. ACT es un método de aprendizaje por imitación que predice segmentos de acciones (chunks) en lugar de pasos individuales, lo que permite un control más suave y robusto. La arquitectura combina un codificador de visión para las dos imágenes (frontal y muñeca) con un transformer que procesa el estado del robot y genera las acciones. En este caso, las entradas son imágenes de 3×480×640 y un vector de estado de 6 dimensiones; la salida es un vector de acción de 6 dimensiones.

El entrenamiento se realizó con el dataset `robosta-tr02/so101_pick_place`, que contiene 10 episodios teleoperados (8178 frames a 30 FPS) de la tarea «coger el cubo y colocarlo en el plato». La configuración de entrenamiento fue: 20.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000, todo con LeRobot versión 0.6.1. No se aplicaron técnicas de RLHF ni DPO; es un aprendizaje puramente supervisado a partir de demostraciones teleoperadas.

## Capacidades

- **Ejecución de tareas de pick-and-place**: el modelo está entrenado específicamente para coger un cubo y colocarlo en un plato, una tarea básica de manipulación.
- **Percepción visual**: utiliza dos cámaras (frontal y de muñeca) con imágenes de 480×640 píxeles, lo que permite percibir el entorno y el objeto.
- **Generación de acciones de control**: produce un vector de acción de 6 dimensiones (posición y orientación del efector final) en cada paso.
- **Inferencia en tiempo real**: gracias a su tamaño moderado, puede ejecutarse en un bucle de control de 30 Hz si se dispone de una GPU adecuada.
- **Integración con LeRobot**: el modelo es compatible con el pipeline de LeRobot, incluyendo entrenamiento, despliegue y evaluación de políticas robóticas.

## Casos de uso

- **Automatización en laboratorios**: el modelo puede realizar la tarea de pick-and-place de forma repetitiva en un entorno controlado, liberando a un operador humano de tareas monótonas.
- **Investigación en aprendizaje por imitación**: sirve como referencia para comparar el rendimiento de ACT en un robot económico (SO-101) frente a otras técnicas o arquitecturas.
- **Prototipado rápido de políticas robóticas**: gracias a su tamaño compacto y a la integración con LeRobot, se puede desplegar en un brazo SO-101 para probar rápidamente nuevas tareas o variaciones del entorno.
- **Educación y formación**: es un modelo bien documentado y de bajo coste, ideal para que estudiantes aprendan a entrenar, evaluar y desplegar políticas robóticas con aprendizaje por imitación.
- **Validación de pipelines de control**: puede usarse como caso de prueba para verificar la correcta instalación de LeRobot, la sincronización de cámaras y la comunicación con el robot.
- **Transferencia de tareas**: al ser un modelo específico y entrenado con pocos datos, es un punto de partida para experimentos de transferencia o fine-tuning a tareas similares, como cambiar la posición del objeto o del plato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que no hay resultados de evaluación en robot real, por lo que no se dispone de datos objetivos de tasa de éxito ni de rendimiento comparativo.

## Requisitos de hardware

- **VRAM estimada**: no se proporcionan datos específicos, pero con 51 millones de parámetros, se estima que la inferencia puede ejecutarse en una GPU con al menos 4 GB de VRAM para procesamiento de imágenes en tiempo real.
- **GPU recomendada**: cualquier GPU con soporte CUDA (por ejemplo, RTX 2060, RTX 3060, T4, A10) puede ejecutar la inferencia. También es posible usar CPU, aunque la latencia será mayor.
- **Despliegue**: el modelo está diseñado para usarse con LeRobot, mediante el comando `lerobot-rollout`. No se menciona compatibilidad con otros frameworks como vLLM, llama.cpp o TGI.
- **Latencia**: no se indica un valor concreto, pero para un bucle de control de 30 Hz se requiere que la inferencia sea inferior a 33 ms. El tamaño del modelo sugiere que es factible en GPUs modernas.

## Comparativa con modelos de la misma categoría

No se dispone de datos comparativos con otros modelos de la misma categoría. Existe un modelo similar publicado por el usuario `1z52` (SO-101_Cube_pick_place_act_model), pero no se han publicado métricas de rendimiento ni especificaciones técnicas comparables. En general, los modelos ACT para el brazo SO-101 suelen tener arquitecturas y tamaños parecidos, pero sin datos de evaluación no se puede establecer una comparación cuantitativa.

## Limitaciones y advertencias

- **Tarea muy específica**: el modelo solo puede ejecutar la tarea de pick-and-place para la que fue entrenado. No generaliza a otras tareas ni a variaciones del entorno (iluminación, posición de objetos, etc.) si no se han visto durante el entrenamiento.
- **Datos de entrenamiento limitados**: se entrenó con solo 10 episodios, lo que puede dar una política poco robusta ante perturbaciones externas o cambios de posición.
- **Sensibilidad a la configuración de cámaras**: el rendimiento depende críticamente de la posición y calibración de las cámaras. Cualquier cambio en su disposición puede degradar el comportamiento.
- **Sin evaluación publicada**: no hay resultados de evaluación en robot real, por lo que se desconoce la tasa de éxito efectiva.
- **Dependencia del hardware**: el modelo está diseñado para el robot `so_follower` (SO-101) y no es transferible a otros brazos sin reentrenamiento.
- **Licencia Apache-2.0**: permite uso comercial, pero no se ofrecen garantías de rendimiento ni de seguridad en entornos de producción.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/robosta-tr02/act_so101_pick_place)
- [Dataset de entrenamiento](https://huggingface.co/datasets/robosta-tr02/so101_pick_place)
- [Paper de ACT](https://huggingface.co/papers/2304.13705)
- [Repositorio de LeRobot](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot)
- [Guía de ACT en LeRobot](https://huggingface.co/docs/lerobot/main/en/act)
