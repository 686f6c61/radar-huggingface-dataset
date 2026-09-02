# sankatmochan/act_lego_pick_v1

## Resumen

El modelo `sankatmochan/act_lego_pick_v1` es una política de control robótico basada en el método **Action Chunking with Transformers (ACT)**, entrenada con la librería LeRobot de Hugging Face. ACT es una técnica de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y el éxito en tareas manipulativas. Este modelo concreto está especializado en la tarea de recoger un bloque de Lego y colocarlo en una caja, utilizando un robot tipo `so_follower` con una cámara frontal.

El modelo fue desarrollado por el usuario `sankatmochan` y publicado en Hugging Face con licencia Apache 2.0. Cuenta con aproximadamente 51,7 millones de parámetros y un tamaño de repositorio de 6,2 GB. Aunque no se han publicado resultados de evaluación, su arquitectura y configuración de entrenamiento están documentadas, lo que permite replicar el proceso. Es relevante porque demuestra un caso práctico de aplicación de ACT en un escenario doméstico o educativo de manipulación robótica, y puede servir como punto de partida para desarrolladores que quieran implementar políticas de imitación con LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de control robótico, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que utiliza un transformer con codificador y decodificador. El codificador procesa observaciones visuales (imagen de la cámara frontal) y del estado del robot (posición articular), mientras que el decodificador genera una secuencia de acciones futuras (chunk) en lugar de una única acción. Este enfoque reduce la acumulación de errores y mejora la precisión en tareas de manipulación.

El modelo fue entrenado con un dataset de teleoperación que contiene 50 episodios y 21.476 frames a 30 FPS, correspondientes a la tarea "Pick up Lego block and place in case". La configuración de entrenamiento incluye 100.000 pasos, tamaño de lote 8, optimizador AdamW, tasa de aprendizaje 1e-05 y semilla 1000. Se utilizó la versión 0.6.1 de LeRobot. No se especifica el uso de RLHF ni técnicas de refinamiento adicionales; el entrenamiento es puramente supervisado sobre las demostraciones.

## Capacidades

- Control robótico de manipulación: el modelo genera acciones de 6 dimensiones (posición y orientación del efector final) a partir de observaciones visuales y de estado.
- Aprendizaje por imitación: es capaz de replicar la tarea demostrada (recoger y colocar un bloque de Lego) con alta fidelidad, según la metodología ACT.
- Procesamiento visual: utiliza una cámara frontal con imágenes de 480x640 píxeles para percibir el entorno.
- Generalización limitada: está entrenado para una tarea específica y no tiene capacidades de razonamiento, lenguaje, tool calling ni agentes, al ser un modelo de control robótico puro.
- Integración con LeRobot: compatible con el ecosistema LeRobot para entrenamiento, evaluación y despliegue en robots reales.

## Casos de uso

- Automatización de líneas de montaje: el modelo puede integrarse en brazos robóticos para tareas repetitivas de recogida y colocación de piezas pequeñas, como en ensamblaje de componentes electrónicos o juguetes.
- Educación en robótica: sirve como ejemplo práctico para estudiantes que aprenden a entrenar políticas de imitación con LeRobot, mostrando un flujo completo desde la recolección de datos hasta el despliegue.
- Investigación en aprendizaje por imitación: permite reproducir experimentos de ACT en un entorno controlado, comparando el rendimiento con otras variantes o datasets.
- Prototipado rápido de tareas de manipulación: al estar preentrenado, puede adaptarse a tareas similares con fine-tuning sobre nuevos datasets, reduciendo el tiempo de desarrollo.
- Robots de asistencia en entornos domésticos: puede servir de base para tareas como ordenar objetos pequeños, aunque requeriría adaptación a otros robots y escenarios.
- Demostración de integración de visión y control: útil para desarrolladores que quieran entender cómo combinar entradas visuales y de estado en una política neuronal para control en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de éxito en robot real ni comparaciones con otros modelos. Se recomienda evaluar el modelo en el robot objetivo antes de su uso en producción.

## Requisitos de hardware

- No se dispone de datos oficiales sobre requisitos de hardware.
- El modelo tiene ~51,7 millones de parámetros, por lo que es relativamente ligero en comparación con modelos de lenguaje grandes.
- Se estima que puede ejecutarse en GPUs de consumo como RTX 3060 o superiores, con VRAM de al menos 4-6 GB, aunque no hay confirmación oficial.
- El despliegue se realiza típicamente con LeRobot, que soporta inferencia en GPU (CUDA) y puede ejecutarse en CPU para pruebas, aunque con mayor latencia.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información detallada sobre modelos comparables en la misma categoría. Existen otros repositorios de políticas ACT para tareas similares (como `o-hisa/act_pick_lego`), pero no se han publicado especificaciones ni resultados que permitan una comparación objetiva. Se recomienda consultar el ecosistema LeRobot para encontrar modelos alternativos.

## Limitaciones y advertencias

- Especialización estrecha: el modelo solo es válido para la tarea específica de recoger y colocar un bloque de Lego; no generaliza a otras tareas sin reentrenamiento.
- Dependencia del entorno: el rendimiento puede degradarse con cambios de iluminación, posición de la cámara, o variaciones en los objetos.
- Sin evaluación publicada: no hay métricas de éxito en robot real, por lo que su fiabilidad en producción es desconocida.
- Requiere configuración específica: necesita un robot tipo `so_follower` y una cámara frontal calibrada como la usada en el entrenamiento.
- No es un modelo de lenguaje: no tiene capacidades de procesamiento de texto, por lo que no aplican riesgos de alucinación ni sesgos lingüísticos.
- Licencia Apache 2.0: permite uso comercial, pero debe atribuirse la autoría y no se ofrece garantía.

## Enlaces

- [Repositorio del modelo en Hugging Face](https://huggingface.co/sankatmochan/act_lego_pick_v1)
- [Dataset de entrenamiento](https://huggingface.co/datasets/sankatmochan/lego_pick_v1_20260901_132125)
- [Paper de ACT (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía de ACT en LeRobot](https://huggingface.co/docs/lerobot/main/en/act)
- [Repositorio de LeRobot en GitHub](https://github.com/huggingface/lerobot)
