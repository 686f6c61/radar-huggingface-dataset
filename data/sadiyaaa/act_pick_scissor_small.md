# sadiyaaa/act_pick_scissor_small

## Resumen

El modelo `act_pick_scissor_small` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), un enfoque de aprendizaje por imitación que predice secuencias de acciones en lugar de pasos individuales. Desarrollado por el usuario `sadiyaaa` y publicado en Hugging Face, este modelo está diseñado para controlar un robot manipulador tipo `so_follower` para realizar la tarea específica de "recoger las tijeras y colocarlas en la cesta amarilla". Utiliza dos cámaras (lateral y de muñeca) como entradas visuales junto con el estado del robot.

El modelo se entrenó con el conjunto de datos `pick_scissor_InternV2`, que contiene 50 episodios de teleoperación con 21 896 fotogramas a 30 FPS. Con solo 15,5 millones de parámetros, es un modelo compacto y ligero, adecuado para ejecutarse en hardware de consumo. Su relevancia actual radica en que ofrece un ejemplo práctico de entrenamiento de políticas de manipulación con LeRobot, la librería de HuggingFace para robótica, y sirve como punto de partida para desarrolladores que quieran implementar tareas similares en robots reales.

El modelo está licenciado bajo Apache 2.0, lo que permite uso comercial y modificación, y se distribuye en formato `safetensors` dentro de un repositorio de LeRobot.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Action Chunking with Transformers, ACT) |
| Parametros totales | 15 576 806 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en formato safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT, descrita en el paper "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705). ACT es un método de aprendizaje por imitación que genera secuencias de acciones (chunks) mediante un transformer. La política procesa observaciones visuales de dos cámaras (lateral y de muñeca) junto con el estado del robot (6 dimensiones) y produce una acción de 6 dimensiones. El entrenamiento se realizó con LeRobot v0.6.2, usando el dataset `pick_scissor_InternV2` con 50 episodios. Se empleó el optimizador AdamW con una tasa de aprendizaje de 1e-05, un tamaño de lote de 4 y 100 pasos de entrenamiento. No se menciona el uso de RLHF ni DPO, ya que es un modelo de imitación directa a partir de demostraciones teleoperadas.

## Capacidades

- **Control robótico**: genera acciones de 6 dimensiones para un robot `so_follower` (posición y orientación del efector final).
- **Percepción visual**: procesa imágenes de dos cámaras RGB (480x640) para guiar la manipulación.
- **Tarea específica**: está entrenado para la tarea de recoger unas tijeras y colocarlas en una cesta amarilla.
- **Aprendizaje por imitación**: no requiere modelado del entorno ni planificación; reproduce comportamientos aprendidos de demostraciones.
- **Integración con LeRobot**: se puede ejecutar directamente con la herramienta `lerobot-rollout` de LeRobot para controlar el robot en tiempo real.

## Casos de uso

- **Investigación en robótica de manipulación**: el modelo sirve como base para estudiar el rendimiento de ACT en tareas de pick-and-place con objetos pequeños y específicos, permitiendo comparar variaciones de arquitectura o hiperparámetros.
- **Desarrollo de sistemas de automatización industrial**: en entornos controlados, el modelo puede integrarse en líneas de ensamblaje donde se requiere recoger y colocar piezas de forma repetitiva, gracias a su bajo coste computacional.
- **Prototipado rápido de políticas de control**: con LeRobot, los desarrolladores pueden usar este modelo como plantilla para entrenar sus propios modelos con nuevos datos, sin partir de cero.
- **Pruebas de robustez en visión**: al usar dos cámaras, permite evaluar cómo la variación de iluminación o posición de los objetos afecta al rendimiento del control.
- **Educación y formación**: es un recurso didáctico para enseñar aprendizaje por imitación y despliegue de modelos en robots reales.
- **Benchmarking de plataformas robóticas**: sirve para medir la capacidad de diferentes robots `so_follower` en la ejecución de una tarea estandarizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- **VRAM estimada**: al tener 15,5 millones de parámetros, el modelo ocupa aproximadamente 62 MB en FP32 (15,5 M * 4 bytes). La inferencia se puede realizar con menos de 1 GB de VRAM, aunque el procesamiento de imágenes de 480x480x3 para dos cámaras añade carga adicional.
- **GPU recomendada**: cualquier GPU con al menos 2 GB de VRAM es suficiente. Ejemplos: NVIDIA GTX 1050 Ti, RTX 2060, RTX 3090, o incluso una Jetson Nano (aunque el rendimiento puede ser limitado).
- **Compatibilidad con consumer GPU**: sí, el modelo cabe en prácticamente cualquier GPU de consumo actual.
- **Opciones de despliegue**: LeRobot proporciona scripts de inferencia (`lerobot-rollout`) que usan PyTorch. También se puede desplegar con otras herramientas como vLLM o llama.cpp, pero estas no son necesarias para un modelo de robótica; el flujo estándar es con LeRobot.
- **Latencia y throughput**: no se dispone de datos específicos, pero al ser un modelo pequeño, la inferencia es rápida (del orden de milisegundos) en una GPU moderna, aunque la latencia real dependerá del hardware y de la resolución de las cámaras.

## Comparativa con modelos similares

No hay información suficiente para una comparativa cuantitativa con otros modelos de robótica en la información proporcionada. Sin embargo, se puede comparar conceptualmente con otras políticas de ACT entrenadas con LeRobot, como las que se encuentran en el hub de Hugging Face. No se dispone de datos de rendimiento para establecer una tabla comparativa.

## Limitaciones y advertencias

- **Entrenamiento limitado**: el modelo se entrenó con solo 100 pasos y 50 episodios, lo que puede provocar un rendimiento subóptimo en situaciones fuera de la distribución de los datos.
- **Tarea específica**: solo está preparado para la tarea de recoger tijeras y colocarlas en una cesta amarilla. No generaliza a otros objetos o escenarios.
- **Dependencia de las cámaras**: el rendimiento depende de la calibración de las cámaras y de la posición de la cámara. Cambios de iluminación o fondo pueden afectar al control.
- **Sin evaluación**: no hay resultados de pruebas en el robot real, por lo que se desconoce la tasa de éxito real.
- **Licencia**: aunque es Apache 2.0, se recomienda revisar los términos del dataset `pick_scissor_InternV2` para verificar restricciones de uso.
- **No es un modelo de lenguaje**: no procesa texto ni conversaciones.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/sadiyaaa/act_pick_scissor_small)
- [Paper de ACT](https://huggingface.co/papers/2304.13741)
- [LeRobot en GitHub](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot sobre ACT](https://huggingface.co/docs/lerobot/main/en/act)
