# maitf/sanitized-main-liquid3-variant-a-act-normal

## Resumen

El modelo `maitf/sanitized-main-liquid3-variant-a-act-normal` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), entrenada con el framework LeRobot de Hugging Face. ACT es una técnica de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que permite una ejecución más estable y precisa en tareas de manipulación. El modelo fue desarrollado por el usuario `maitf` y está especializado en una tarea concreta: agarrar una taza, verter su contenido y dejarla en una posición neutra utilizando un brazo robótico tipo `so_follower` (basado en el robot SO-100).

El modelo consume imágenes de dos cámaras (vista cenital y vista de muñeca) junto con el estado del robot (6 dimensiones) y genera acciones de 6 dimensiones. Con aproximadamente 51,7 millones de parámetros, es un modelo compacto diseñado para ejecutarse en tiempo real en hardware modesto. Está publicado bajo licencia Apache 2.0 y no se han reportado resultados de evaluación en el momento de su publicación. Su relevancia radica en ser un ejemplo práctico de aplicación de ACT en un entorno real, útil para investigadores y desarrolladores que trabajan en robótica de manipulación y aprendizaje por imitación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) - Transformer con codificador de visión y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | No disponible (solo safetensors de precisión completa) |
| Idiomas soportados | No aplica (modelo de control robótico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT descrita en el paper [Action Chunking with Transformers](https://huggingface.co/papers/2304.13705). ACT utiliza un transformer con un codificador de visión que procesa las imágenes de las cámaras (topdown y wrist) y un decodificador que genera secuencias de acciones futuras (chunks). La política se entrena mediante aprendizaje por imitación a partir de demostraciones teleoperadas, sin refuerzo ni ajuste por preferencias humanas (RLHF/DPO). El entrenamiento se realizó con el framework LeRobot (versión 0.6.1) durante 100.000 pasos, con un batch size de 8, optimizador AdamW y una tasa de aprendizaje de 1e-5. El dataset de entrenamiento contiene 76 episodios y 101.081 fotogramas a 30 FPS, capturados con las dos cámaras mencionadas y el estado del robot. No se ha documentado ninguna innovación técnica adicional más allá de la arquitectura ACT estándar.

## Capacidades

- Generación de acciones de control robótico de 6 grados de libertad (posición y orientación) a partir de observaciones visuales y de estado.
- Procesamiento simultáneo de dos flujos de imagen (cámara cenital y cámara de muñeca) con resolución 480x640.
- Predicción de secuencias de acciones (action chunking) que permite una ejecución suave y coherente en tareas de manipulación.
- Especialización en una tarea concreta: agarrar una taza, verter su contenido y depositarla en una posición neutra.
- No soporta tool calling, razonamiento multi-paso ni capacidades de lenguaje natural, ya que es un modelo puramente robótico.
- No tiene capacidades multilingües ni de generación de texto.

## Casos de uso

- Automatización de tareas de manipulación en laboratorios de robótica: el modelo puede ejecutar la tarea específica para la que fue entrenado (agarrar, verter y soltar) de forma autónoma, liberando a los operadores de tareas repetitivas.
- Investigación en aprendizaje por imitación: sirve como referencia para estudiar el comportamiento de ACT en un entorno real con dos cámaras y un brazo SO-100, permitiendo comparar variantes de arquitectura o hiperparámetros.
- Punto de partida para fine-tuning: al ser un modelo pequeño y con licencia permisiva, puede adaptarse a tareas similares (por ejemplo, manipular otros objetos) mediante entrenamiento adicional con nuevos datasets.
- Validación de pipelines de LeRobot: los desarrolladores pueden usar este modelo para probar la integración de LeRobot con hardware real, siguiendo los comandos de rollout proporcionados en la documentación.
- Demostraciones educativas: en cursos de robótica y aprendizaje automático, este modelo permite ilustrar el flujo completo de recolección de datos, entrenamiento y despliegue de una política robótica.
- Evaluación de robustez en entornos controlados: aunque no hay resultados oficiales, el modelo puede utilizarse para medir la repetibilidad y precisión de la política en diferentes condiciones de iluminación o posición de los objetos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política. No hay datos de tasas de éxito ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: dado que el modelo tiene 51,7 millones de parámetros y procesa dos imágenes de 480x640, se estima que necesita al menos 4 GB de VRAM para inferencia en tiempo real. No hay datos oficiales.
- GPU recomendadas: una GPU de gama media como NVIDIA RTX 3060 o superior sería suficiente. También puede ejecutarse en placas como Jetson Orin Nano (8 GB) para despliegue embebido.
- Compatibilidad con hardware de consumo: sí, cabe en GPUs de consumo con 6 GB o más de VRAM.
- Opciones de despliegue: LeRobot ofrece el comando `lerobot-rollout` para ejecutar la política en un robot SO-100 con cámaras OpenCV. También es posible exportar el modelo a otros formatos si se requiere.
- Latencia y throughput: no se proporcionan datos oficiales. Dado el tamaño del modelo y la resolución de entrada, se espera una inferencia a 30 FPS en hardware adecuado, pero esto no está confirmado.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el mismo repositorio o con la misma configuración de tarea. El ecosistema LeRobot incluye otras políticas ACT entrenadas para diferentes tareas, pero no se han encontrado datos específicos para comparar. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para una tarea concreta (agarrar, verter y soltar una taza) y no generaliza a otras tareas u objetos sin reentrenamiento.
- Requiere el mismo tipo de robot (`so_follower`) y la misma configuración de cámaras (cenital y muñeca) que se usaron durante el entrenamiento. Cualquier cambio en la disposición de las cámaras o en el robot puede degradar el rendimiento.
- No se han reportado resultados de evaluación en el robot real, por lo que su fiabilidad en producción no está demostrada.
- El dataset de entrenamiento proviene de un entorno específico; el modelo puede ser sensible a cambios de iluminación, fondo o posición de los objetos.
- Al ser un modelo de aprendizaje por imitación, puede heredar sesgos de las demostraciones teleoperadas (por ejemplo, trayectorias subóptimas o movimientos inseguros).
- No se han documentado sesgos algorítmicos ni riesgos de alucinación, pero al ser un modelo de control, cualquier error de predicción puede resultar en movimientos no deseados del robot.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe asegurarse de cumplir con las normativas de seguridad aplicables a robots físicos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/maitf/sanitized-main-liquid3-variant-a-act-normal)
- [Dataset de entrenamiento](https://huggingface.co/datasets/maitf/sanitized-main-liquid3-variant-a)
- [Paper de ACT (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- [Repositorio de LeRobot](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot para ACT](https://huggingface.co/docs/lerobot/main/en/act)
- [Guía de instalación de LeRobot](https://huggingface.co/docs/lerobot/main/en/installation)
