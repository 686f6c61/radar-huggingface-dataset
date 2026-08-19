# junshin02/act_so101_v2fix_pi0delta

## Resumen

El modelo `junshin02/act_so101_v2fix_pi0delta` es una política de control robótico basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias de acciones en lugar de pasos individuales. Ha sido desarrollado por el usuario junshin02 y entrenado con el framework LeRobot de Hugging Face para operar sobre el brazo robótico SO-101. El modelo resuelve la tarea de recoger un cubo verde y colocarlo en una caja, utilizando dos cámaras (frontal y de muñeca) y el estado del robot como entradas.

Con 51,7 millones de parámetros, es un modelo compacto diseñado para ejecutarse en tiempo real en hardware de bajo coste. Su relevancia radica en demostrar la viabilidad de ACT en robots asequibles, un área de creciente interés en la robótica de código abierto. El modelo se distribuye bajo licencia Apache-2.0 y está disponible en Hugging Face, lo que facilita su reproducción y adaptación por parte de la comunidad investigadora.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (no es modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que utiliza un transformer para predecir chunks de acciones (secuencias de varios pasos) a partir de observaciones visuales y del estado del robot. En este caso, el modelo consume dos imágenes RGB de 480x640 píxeles (cámara frontal y de muñeca) y un vector de estado de 6 dimensiones, produciendo un vector de acción de 6 dimensiones. El entrenamiento se realizó con 50 episodios teleoperados (18.817 fotogramas a 30 FPS) de la tarea "recoger el cubo verde y colocarlo en la caja", utilizando el optimizador AdamW con una tasa de aprendizaje de 1e-5 durante 50.000 pasos y un tamaño de lote de 8. No se mencionan técnicas de refinamiento como RLHF o DPO; el modelo se basa únicamente en imitación supervisada.

## Capacidades

- Control robótico de un brazo SO-101 para tareas de pick-and-place.
- Percepción visual multimodal con dos cámaras (frontal y de muñeca) a 30 FPS.
- Entrada de estado del robot (posición/velocidad de 6 grados de libertad).
- Salida de acciones de 6 dimensiones para control de posición o esfuerzo.
- Ejecución en tiempo real gracias a su tamaño reducido (51,7 M parámetros).
- Integración nativa con el ecosistema LeRobot para entrenamiento y despliegue.

## Casos de uso

- Automatización de tareas repetitivas de manipulación en laboratorios de robótica: el modelo puede ejecutar la tarea de recoger y colocar objetos de forma autónoma, liberando a los operarios de tareas monótonas.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de políticas entre robots o la robustez frente a variaciones de iluminación y posición.
- Prototipado rápido de soluciones robóticas de bajo coste: al ser ligero y entrenado con datos teleoperados, permite validar conceptos de automatización sin inversión en hardware de gama alta.
- Educación y formación en robótica: los estudiantes pueden desplegar el modelo en un SO-101 real o simulado para comprender los principios de ACT y el flujo de trabajo de LeRobot.
- Benchmarking de algoritmos de imitación: al estar disponible públicamente, puede utilizarse como referencia para comparar nuevas arquitecturas o métodos de entrenamiento.
- Desarrollo de sistemas de manipulación asistida: el modelo puede integrarse en entornos de colaboración humano-robot donde el robot realiza la tarea de recoger y colocar bajo supervisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación proporcionados.

## Requisitos de hardware

- VRAM estimada: no disponible, pero al tratarse de un modelo de 51,7 M parámetros, se estima que puede ejecutarse en GPUs con al menos 2-4 GB de VRAM (por ejemplo, NVIDIA GTX 1650 o superiores).
- GPU recomendadas: cualquier GPU moderna con soporte CUDA (por ejemplo, RTX 3060, RTX 4090) o incluso CPU para inferencia no en tiempo real.
- Compatibilidad con GPU de consumo: sí, cabe en la mayoría de GPUs de consumo actuales.
- Opciones de despliegue: LeRobot ofrece scripts de rollout (`lerobot-rollout`) que gestionan la inferencia; también puede integrarse con frameworks como ROS o controladores personalizados.
- Latencia y throughput: no disponibles, pero el tamaño compacto sugiere una latencia de pocos milisegundos por paso en GPU.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa detallada. Existen variantes del mismo autor, como `junshin02/act_so101_v2fix_delta`, que probablemente comparten arquitectura y tarea, pero no se han publicado especificaciones comparables. Otros modelos de ACT en LeRobot (por ejemplo, los entrenados para SO-100) podrían servir de referencia, pero no se dispone de datos concretos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea de recoger un cubo verde y colocarlo en una caja; no generaliza a otras tareas sin reentrenamiento.
- Depende de la configuración específica de cámaras (frontal y muñeca) y del robot SO-101; cambios en la disposición de las cámaras o en el robot pueden degradar el rendimiento.
- No se han reportado evaluaciones de robustez frente a variaciones de iluminación, oclusiones o posiciones de objetos no vistas durante el entrenamiento.
- El dataset de entrenamiento es pequeño (50 episodios), lo que puede limitar la capacidad de generalización.
- Aunque la licencia Apache-2.0 permite uso comercial, el modelo no incluye garantías de seguridad para operación autónoma en entornos no controlados.
- No se proporcionan métricas de éxito en el mundo real, por lo que el rendimiento esperado en producción es incierto.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/junshin02/act_so101_v2fix_pi0delta)
- [Dataset de entrenamiento](https://huggingface.co/datasets/junshin02/so101_pickplace_v2fix)
- [Paper de ACT (arXiv:2304.13705)](https://arxiv.org/abs/2304.13705)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guía de ACT en LeRobot](https://huggingface.co/docs/lerobot/main/en/act)
