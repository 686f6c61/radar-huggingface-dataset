# ngocthuong2212/so101_sim2real_baseline_green_block_mix_65_35_200

## Resumen

Este modelo es una política de aprendizaje por imitación basada en Action Chunking with Transformers (ACT), desarrollada por ngocthuong2212 y entrenada con el framework LeRobot de Hugging Face. Resuelve tareas de manipulación robótica, concretamente recoger un objeto y colocarlo en una caja, a partir de demostraciones teleoperadas. Es relevante porque aborda el problema de la transferencia sim2real, combinando datos de simulación y realidad (mix 65_35) para mejorar la robustez en entornos reales. Arquitectónicamente es un transformer de aproximadamente 51,7 millones de parámetros, con una ventana de contexto que no aplica al ser un modelo de políticas, y se ejecuta sobre el robot so_follower.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Action Chunking with Transformers, ACT) |
| Parámetros totales | 51.668.614 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de política robótica) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad del control. El transformer recibe como entrada el estado del robot (6 dimensiones) y dos imágenes de las cámaras top y front, ambas de 480x640 píxeles, y produce una acción de 6 dimensiones. El entrenamiento se realizó sobre el dataset vasco281204/so101_sim2real_baseline_green_block_mix_65_35_200, compuesto por 200 episodios y 117.538 frames a 30 FPS, todos correspondientes a la tarea de pick-and-place. La configuración de entrenamiento incluye 100.000 pasos, tamaño de lote 8, optimizador AdamW con tasa de aprendizaje 0,0001 y semilla 1000, usando la versión 0.6.2 de LeRobot.

## Capacidades

- Predicción de acciones para control robótico en tiempo real.
- Entrada multimodal: estado del robot (6 dimensiones) y dos imágenes de cámaras (top y front) de 480x640.
- Salida de acciones de 6 dimensiones para el robot so_follower.
- Aprendizaje por imitación de demostraciones teleoperadas.
- Entrenado para la tarea específica de recoger un objeto y colocarlo en una caja.
- No soporta tool calling, generación de texto, razonamiento simbólico ni capacidades multimodales de lenguaje.

## Casos de uso

- Automatización de pick-and-place en líneas de montaje: el modelo controla un brazo robótico para recoger piezas y colocarlas en un contenedor, reduciendo la intervención humana en tareas repetitivas.
- Transferencia sim2real en robótica: al estar entrenado con una mezcla de datos simulados y reales (65/35), sirve para validar políticas en robots físicos sin necesidad de reentrenar desde cero.
- Investigación en aprendizaje por imitación: los investigadores pueden usar este checkpoint como baseline para comparar nuevas políticas ACT o variantes, gracias a su integración con LeRobot.
- Automatización en almacenes: el modelo puede ejecutar tareas de recogida y colocación de paquetes en entornos controlados, con las cámaras top y front proporcionando la percepción necesaria.
- Educación y demostraciones robóticas: en laboratorios docentes, se puede ejecutar sobre un robot so_follower para ilustrar conceptos de aprendizaje por imitación y control de robots.
- Integración en sistemas ROS: mediante LeRobot, la política se puede desplegar en un pipeline robótico estándar, permitiendo su uso en aplicaciones de automatización industrial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Tampoco se han publicado resultados de evaluación en robot para esta política.

## Requisitos de hardware

- VRAM estimada: los pesos en FP32 ocupan aproximadamente 0,2 GB (51,7 millones de parámetros × 4 bytes). Con el procesamiento de dos cámaras de 480x640 y las activaciones del transformer, se recomienda al menos 4 GB de VRAM.
- GPU recomendadas: RTX 3060, RTX 4070, A100 o H100. Cualquier GPU con 4 GB o más de VRAM es suficiente.
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas como la RTX 3060 o superiores.
- Opciones de despliegue: LeRobot (PyTorch), compatible con ROS. No es compatible con vLLM, llama.cpp ni Ollama, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. No se dispone de información suficiente en los datos proporcionados para comparar este modelo con otros de la misma categoría. Se puede mencionar que pertenece a la familia de políticas ACT del ecosistema LeRobot, pero sin especificaciones concretas de otros checkpoints.

## Limitaciones y advertencias

- Sesgos: no disponibles; el modelo puede heredar sesgos presentes en las demostraciones del dataset, como preferencias en la posición del objeto o en la trayectoria de la pinza.
- Riesgo de alucinación: no aplica, ya que no es un modelo de lenguaje ni genera texto.
- Limitaciones de contexto o idioma: no aplica; el modelo no procesa lenguaje natural.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificación y distribución, pero requiere atribución y no ofrece garantías.
- Caveat para producción: el modelo está entrenado para una tarea específica (recoger y colocar) con un robot específico (so_follower) y una configuración de cámaras concreta. Cambios en el robot, las cámaras, la iluminación o la posición de los objetos pueden degradar el rendimiento sin reentrenamiento.
- El dataset contiene solo 200 episodios, lo que puede limitar la robustez y la capacidad de generalización.
- No se han publicado resultados de evaluación, por lo que el rendimiento real en robot no está verificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ngocthuong2212/so101_sim2real_baseline_green_block_mix_65_35_200
- Dataset de entrenamiento: https://huggingface.co/datasets/vasco281204/so101_sim2real_baseline_green_block_mix_65_35_200
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
