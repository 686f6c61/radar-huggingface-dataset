# heyunzhenwhat/act_so101-single-transfer-150ep-mixedpos-2x

## Resumen

El modelo `heyunzhenwhat/act_so101-single-transfer-150ep-mixedpos-2x` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), desarrollada por el usuario heyunzhenwhat y entrenada con el framework LeRobot de Hugging Face. ACT es una técnica de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que permite un control más suave y robusto en tareas de manipulación. Este modelo concreto está especializado en la tarea de mover una cinta adhesiva a una zona marcada en un robot tipo `so_follower`, utilizando dos cámaras (una cenital y otra en la muñeca) y el estado del robot.

El modelo tiene 51,67 millones de parámetros y se ha entrenado con 150 episodios teleoperados (42.950 fotogramas a 30 FPS). Su relevancia radica en que demuestra cómo aplicar ACT a una tarea de transferencia de objetos con un dataset relativamente pequeño, y sirve como ejemplo práctico para la comunidad de robótica que usa LeRobot. Al estar licenciado bajo Apache 2.0, puede utilizarse comercialmente sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Action Chunking with Transformers, ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; procesa observaciones de imagen y estado) |
| Tipos de cuantizacion | No disponible (solo safetensors de precisión completa) |
| Idiomas soportados | No disponible (modelo de robótica, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que combina un codificador de visión (basado en ResNet) con un transformador que genera secuencias de acciones. En este caso, el modelo recibe como entrada dos imágenes (una cámara cenital de 720x1280 y una cámara de muñeca de 360x640) junto con el estado del robot (6 dimensiones), y produce una acción de 6 dimensiones. La arquitectura está diseñada para operar en bucle cerrado, prediciendo chunks de acciones que se ejecutan de forma secuencial.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.1) sobre el dataset `heyunzhenwhat/so101-single-transfer-150ep-mixedpos`, que contiene 150 episodios de teleoperación (42.950 fotogramas a 30 FPS) de la tarea "Move the tape into the taped area on the right". Se usaron 40.000 pasos de entrenamiento con batch size 16, optimizador AdamW y learning rate 1e-05, con semilla 1000. No se aplicaron técnicas de RLHF ni DPO; es un entrenamiento puramente supervisado de imitación.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 grados de libertad (posición y orientación) para un robot seguidor.
- Percepción visual multimodal: procesa simultáneamente imágenes de dos cámaras (cenital y muñeca) para guiar la manipulación.
- Predicción de chunks de acciones: produce secuencias de acciones en lugar de pasos individuales, lo que mejora la suavidad y estabilidad del movimiento.
- Aprendizaje por imitación: aprende directamente de demostraciones teleoperadas, sin necesidad de recompensas explícitas.
- Específico para una tarea concreta: está entrenado para transferir una cinta a una zona marcada, pero la arquitectura es generalizable a otras tareas con datos similares.
- Integración con LeRobot: compatible con el ecosistema de LeRobot para entrenamiento, evaluación y despliegue en robots reales.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos controlados: el modelo puede ejecutar la tarea de mover un objeto (cinta) a una ubicación específica, útil en líneas de montaje o clasificación.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de políticas entre diferentes posiciones iniciales (el dataset incluye posiciones mixtas).
- Prototipado rápido de políticas robóticas: gracias a su tamaño reducido (51,7M parámetros) y al uso de LeRobot, se puede entrenar y desplegar en pocas horas con hardware asequible.
- Benchmarking de métodos de control: permite comparar ACT con otras arquitecturas (p. ej., Diffusion Policy) en la misma tarea y dataset.
- Educación en robótica: es un ejemplo didáctico para enseñar cómo entrenar y ejecutar políticas de imitación con visión.
- Desarrollo de robots colaborativos (cobots): el modelo puede integrarse en un robot `so_follower` para realizar tareas repetitivas de manipulación con supervisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). Por tanto, no se dispone de tasas de éxito ni comparativas cuantitativas con otros modelos.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de VRAM ni latencia en la documentación del modelo.
- Dado el tamaño del modelo (51,7M parámetros) y la entrada de imágenes (720x1280 y 360x640), se estima que puede ejecutarse en GPUs de consumo con al menos 4-6 GB de VRAM, aunque no hay datos confirmados.
- El despliegue se realiza mediante LeRobot, que soporta inferencia en GPU (CUDA) y también en CPU para pruebas lentas.
- No es compatible con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje; el framework recomendado es LeRobot.
- Para entrenamiento, se requiere una GPU con suficiente memoria para el batch size 16 y las imágenes de alta resolución; una RTX 3090 o superior sería adecuada, pero no hay especificaciones oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa cuantitativa. Existen otros repositorios con modelos ACT similares (p. ej., `heyunzhenwhat/act_so101-single-transfer` y `l-e-n/act_so101`), pero no se han publicado métricas comparables. En general, ACT se compara con métodos como Diffusion Policy o Behavior Cloning simple, pero sin datos de este modelo concreto, no es posible establecer una tabla comparativa fiable.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para una tarea específica (mover una cinta a una zona marcada) y no generaliza a otras tareas sin reentrenamiento.
- No se han evaluado formalmente sus tasas de éxito en robot real; el rendimiento en entornos no vistos puede ser inferior al esperado.
- Depende de la configuración de cámaras y del robot `so_follower`; cambios en la iluminación, posición de cámaras o calibración pueden degradar el rendimiento.
- Al ser un modelo de imitación, hereda los sesgos de las demostraciones teleoperadas (p. ej., trayectorias subóptimas o movimientos inconsistentes).
- No tiene capacidades de razonamiento simbólico ni de procesamiento de lenguaje; es puramente sensoriomotor.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/heyunzhenwhat/act_so101-single-transfer-150ep-mixedpos-2x)
- [Dataset de entrenamiento](https://huggingface.co/datasets/heyunzhenwhat/so101-single-transfer-150ep-mixedpos)
- [Paper de ACT (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- [Repositorio de LeRobot](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot para ACT](https://huggingface.co/docs/lerobot/main/en/act)
- [Guía de instalación de LeRobot](https://huggingface.co/docs/lerobot/main/en/installation)
