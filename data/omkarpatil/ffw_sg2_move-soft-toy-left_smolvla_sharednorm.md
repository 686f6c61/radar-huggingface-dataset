# omkarpatil/ffw_sg2_move-soft-toy-left_smolvla_sharednorm

## Resumen

Este modelo es un fine-tuning de `lerobot/smolvla_base`, un modelo de visión-lenguaje-acción (VLA) de la familia SmolVLA, realizado con la librería LeRobot 0.6.1. El autor, omkarpatil, lo ha entrenado específicamente para la tarea robótica de mover un juguete suave hacia la izquierda, utilizando el dataset `omkarpatil/move-soft-toy-left` a 15 fps. El resultado es un checkpoint de 1.8 GB con licencia Apache 2.0, pensado para ser desplegado en un robot con dos brazos y tres cámaras.

La relevancia de este modelo radica en que demuestra un flujo completo de fine-tuning de un VLA para una tarea de manipulación concreta, incluyendo una técnica de normalización compartida (shared-norm) que agrupa estadísticas de estado y acción entre dos políticas complementarias (mover a la izquierda y mover a la derecha). Esto permite una composición de espacios de acción más coherente, un aspecto clave para el desarrollo de políticas robóticas reutilizables. El modelo se publica como parte de un esfuerzo de investigación en robótica con código abierto, y su tamaño moderado lo hace accesible para experimentación en hardware de gama media.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (modelo base `lerobot/smolvla_base`) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (según tags y librería LeRobot) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `lerobot/smolvla_base`, un VLA que combina percepción visual, lenguaje y acción para control robótico. La arquitectura exacta del base no se detalla en la información proporcionada, pero se sabe que pertenece a la familia SmolVLA de LeRobot, diseñada para ser eficiente y desplegable en robots reales. El entrenamiento se realizó con LeRobot 0.6.1, usando el dataset `omkarpatil/move-soft-toy-left` a 15 fps, con un batch de 64 y sin aumento de imagen. Se guardaron checkpoints en los pasos 020000 y 030000 de una ejecución de 30k pasos.

Una innovación destacable es la normalización compartida (grupo de composición C): las estadísticas de media y desviación estándar de estado y acción se calcularon agrupando los datos de `move-soft-toy-left` y `move-soft-toy-right` (5,249 frames en total), y son idénticas en ambas políticas. Esto permite una transformación invertible común para la composición de espacios de score, verificada byte-idéntica entre el par de políticas. El estado se define como 22 dimensiones (articulaciones + velocidad de base), y la acción como 16 dimensiones de objetivos absolutos de articulación (7 para cada brazo, 1 gripper por brazo), con un chunk de 50 pasos a 15 Hz.

## Capacidades

- Control robótico de manipulación: el modelo genera acciones de articulación absolutas para mover un juguete suave hacia la izquierda, usando tres cámaras (cabeza izquierda, muñeca izquierda, muñeca derecha).
- Percepción visual multi-cámara: integra tres flujos de imagen para decidir las acciones.
- Composición de políticas: gracias a la normalización compartida, puede combinarse con la política complementaria de mover a la derecha para crear espacios de acción más amplios.
- Fine-tuning específico: está especializado en una única tarea, no es un modelo generalista.
- No soporta tool calling, generación de texto, razonamiento simbólico ni capacidades multilingües, al ser un modelo de acción robótica.

## Casos de uso

- Manipulación robótica en laboratorio: el modelo puede desplegarse en un robot de dos brazos para ejecutar la tarea de empujar o mover un objeto blando hacia un lado, útil en experimentos de interacción física.
- Investigación en VLA: sirve como punto de partida para estudiar el efecto de la normalización compartida en la composición de políticas, comparando con versiones sin ella.
- Benchmark de fine-tuning: permite evaluar el flujo de LeRobot para adaptar un VLA base a tareas específicas con pocos datos (el dataset es pequeño, 5,249 frames).
- Desarrollo de robots de asistencia: aunque la tarea es simple, el enfoque puede escalarse a tareas de organización de objetos en entornos domésticos controlados.
- Educación en robótica: al ser un modelo pequeño y con licencia Apache 2.0, es adecuado para cursos que enseñen fine-tuning de VLA con LeRobot.
- Composición de habilidades: al existir una política gemela para mover a la derecha, puede usarse para probar algoritmos de composición de políticas en tiempo de ejecución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas de éxito en la tarea robótica (como tasa de éxito en el movimiento del juguete). El autor no proporciona comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- Tamaño del repositorio: 1.8 GB, lo que sugiere que los pesos en safetensors ocupan aproximadamente esa cantidad en disco.
- VRAM estimada para inferencia: no disponible. Dado el tamaño, es plausible que quepa en GPUs consumer de 8-12 GB, pero no hay datos confirmados.
- GPU recomendadas: no disponible. Se desconoce si requiere una GPU específica o si puede ejecutarse en CPU.
- Opciones de despliegue: al ser un modelo de LeRobot, puede ejecutarse con el framework LeRobot, que soporta inferencia en robots reales. No se mencionan vLLM, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas concretas. Podría compararse con otros VLA como OpenVLA o RT-2, pero no hay datos de rendimiento ni especificaciones detalladas en la información proporcionada. Se indica "no disponible".

## Limitaciones y advertencias

- Es un modelo especializado en una única tarea (mover un juguete suave a la izquierda); no generaliza a otras tareas sin reentrenamiento.
- No se proporcionan datos sobre sesgos, alucinaciones o comportamientos no deseados, al ser un modelo de control robótico y no de lenguaje.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende del dataset `omkarpatil/move-soft-toy-left`, cuyos términos de uso no se detallan.
- El entrenamiento se realizó con un dataset pequeño (5,249 frames), lo que puede limitar la robustez ante variaciones del entorno no vistas durante el entrenamiento.
- No hay información sobre la estabilidad del control en tiempo real ni sobre la seguridad del robot durante la ejecución.
- El modelo se publica con checkpoints intermedios (020000 y 030000), no con un checkpoint final claramente identificado como el mejor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/omkarpatil/ffw_sg2_move-soft-toy-left_smolvla_sharednorm
- Dataset usado: https://huggingface.co/datasets/omkarpatil/move-soft-toy-left (inferido de la model card, no verificado)
- Modelo base: https://huggingface.co/lerobot/smolvla_base (inferido de la model card, no verificado)
