# HyeonseokE/smolvla_push_button_ours_2000_10fps

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado para robótica. Este checkpoint concreto es un fine-tuning del modelo base `lerobot/smolvla_base`, realizado por HyeonseokE sobre un dataset de 100 episodios grabados a 10 FPS en los que un robot `so101_follower` debe presionar un botón rojo. El modelo resuelve el problema del control robótico por imitación, generando acciones de 6 dimensiones a partir de observaciones de estado y de tres cámaras (top, left_wrist y una tercera no especificada). Su relevancia radica en que, según el paper original, SmolVLA logra un rendimiento competitivo con un coste computacional reducido, lo que permite su despliegue en hardware de consumo. El modelo tiene 450.046.176 parámetros y se distribuye en formato safetensors bajo licencia Apache-2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action) |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de robótica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual, un modelo de lenguaje y un decodificador de acciones. Este checkpoint es un fine-tuning del modelo base `lerobot/smolvla_base`, entrenado con el dataset `HyeonseokE/push_button_ours_10fps` que contiene 100 episodios y 11.380 frames a 10 FPS. La configuración de entrenamiento incluye 8.850 pasos con un tamaño de lote de 64, optimizador AdamW, tasa de aprendizaje 0.0001 y semilla 2000, utilizando la versión 0.6.0 de LeRobot. El modelo consume como entradas el estado del robot (6 dimensiones) y tres imágenes de 256x256, y produce acciones de 6 dimensiones. No se detalla si se emplearon técnicas como RLHF o DPO; al tratarse de un modelo de imitación, el entrenamiento es supervisado.

## Capacidades

- Generación de acciones robóticas de 6 dimensiones (posición y orientación de la pinza) a partir de observaciones visuales y de estado.
- Entrada multimodal: estado del robot y tres cámaras RGB de 256x256.
- Ejecución de tareas de manipulación aprendidas por imitación, en concreto "presionar el botón rojo".
- Compatibilidad con el ecosistema LeRobot para entrenamiento y despliegue.
- No es un modelo de lenguaje: no soporta tool calling, agentes conversacionales ni generación de texto.
- No se han documentado capacidades multilingües ni de razonamiento simbólico.

## Casos de uso

- Automatización de pruebas funcionales en líneas de producción: el modelo puede controlar un brazo robótico para pulsar botones físicos en paneles de ensayo, gracias a su entrenamiento específico en esa tarea.
- Investigación en aprendizaje por imitación: sirve como referencia para estudiar cómo un VLA compacto se adapta a una tarea concreta a partir de un dataset pequeño (100 episodios).
- Prototipado rápido en robótica educativa: al poder ejecutarse en hardware de consumo, es adecuado para laboratorios con recursos limitados.
- Despliegue en robots tipo `so101_follower`: el checkpoint está calibrado para ese robot y sus cámaras, lo que facilita su integración directa en entornos con ese hardware.
- Recogida y evaluación de políticas en LeRobot: permite validar el rendimiento de la política en simulaciones o con robots reales mediante `lerobot-rollout`.
- Fine-tuning de tareas relacionadas: partiendo de este checkpoint se puede entrenar el modelo para variaciones de la tarea (por ejemplo, presionar otros botones) con pocos datos adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,9 GB en formato safetensors, lo que sugiere que el modelo es compacto, pero no se especifica el consumo de VRAM.
- GPU recomendadas: no disponible.
- Capacidad de ejecución en GPU de consumo: probablemente sí, dado el objetivo de SmolVLA de desplegarse en hardware de consumo, pero no hay datos concretos.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), Hugging Face Hub, y cualquier framework compatible con safetensors y la librería LeRobot.
- Latencia y throughput: no disponible. El dataset de entrenamiento está grabado a 10 FPS, lo que sugiere una frecuencia de control de 10 Hz, pero no se documenta la latencia de inferencia.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este checkpoint con otros modelos de la misma categoría. El modelo base `lerobot/smolvla_base` es la referencia más cercana, pero no se han publicado métricas comparativas en la información disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea "presionar el botón rojo"; su rendimiento en otras tareas no ha sido evaluado.
- No se han proporcionado resultados de evaluación en robot real, por lo que la tasa de éxito real es desconocida.
- Depende de una configuración específica de hardware: robot `so101_follower` y tres cámaras concretas.
- El dataset de entrenamiento es pequeño (100 episodios), lo que puede provocar sobreajuste y limitar la generalización a nuevas posiciones o condiciones de iluminación.
- Al ser un modelo de visión-acción, no puede utilizarse para tareas de lenguaje natural, generación de texto ni razonamiento simbólico.
- La licencia Apache-2.0 permite el uso comercial y la redistribución, siempre que se mantengan los avisos de licencia y patentes.
- No se han documentado sesgos específicos, pero al igual que cualquier modelo entrenado por imitación, puede heredar los sesgos presentes en los datos de demostración.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/HyeonseokE/smolvla_push_button_ours_2000_10fps
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/push_button_ours_10fps
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Modelo base: https://huggingface.co/lerobot/smolvla_base
