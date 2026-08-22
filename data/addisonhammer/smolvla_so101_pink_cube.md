# addisonhammer/smolvla_so101_pink_cube

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face y colaboradores, presentado en el artículo *SmolVLA: A Vision-Language-Action Model for Affordable and Efficient Robot Learning* (arXiv:2506.01844). El modelo combina un encoder visual SigLIP y un modelo de lenguaje SmolLM2 con un "action expert" que produce comandos de control para robots, todo en un único sistema de aproximadamente 450 millones de parámetros. Este fine-tuning concreto, publicado por Addison Hammer, está entrenado para una tarea específica: recoger un cubo rosa de una posición aleatoria y colocarlo en una taza metálica, utilizando un robot SO-101 con tres cámaras.

La relevancia de este modelo radica en que demuestra cómo un VLA de tamaño reducido puede ser afinado con pocos datos (57 episodios) para tareas de manipulación reales, manteniendo un coste computacional bajo y siendo desplegable en hardware de consumo. Es un ejemplo práctico del ecosistema LeRobot, que facilita el entrenamiento y despliegue de políticas robóticas. El modelo se distribuye bajo licencia Apache 2.0 y está disponible en el Hub de Hugging Face.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA: vision encoder SigLIP, modelo de lenguaje SmolLM2, action expert (MLP) |
| Parametros totales | 450.046.176 (según safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos completos en safetensors) |
| Idiomas soportados | no disponibles (modelo orientado a robótica, sin texto libre) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura SmolVLA descrita en el paper arXiv:2506.01844. Combina un encoder visual SigLIP para procesar las imágenes de las cámaras, un modelo de lenguaje SmolLM2 como módulo de razonamiento y un "action expert" (una cabeza MLP) que regresa las acciones de control. El modelo base `lerobot/smolvla_base` se ha afinado para esta tarea concreta. Según el blog de ggando.com, durante el fine-tuning solo se actualizan el action expert y las proyecciones, mientras que el encoder visual y el modelo de lenguaje permanecen congelados. Así, se entrenan aproximadamente 50 millones de parámetros del total.

El entrenamiento se realizó con el dataset `addisonhammer/so101_pick_pink_cube`, que contiene 57 episodios (25.338 frames a 30 FPS) de teleoperación con el robot SO-101. La configuración de entrenamiento incluye 10.000 pasos, batch size de 32, optimizador AdamW, learning rate de 1e-4 y semilla 1000, usando la librería LeRobot 0.6.2. No se menciona el uso de RLHF ni DPO; se trata de un aprendizaje por imitación (behavior cloning).

## Capacidades

- Generación de acciones de control de 6 dimensiones (posición y orientación del efector final) para el robot SO-101.
- Percepción visual multi-cámara: acepta tres imágenes de 256x256 píxeles (muñeca, superior y lateral).
- Ejecución de la tarea de pick-and-place: recoger un cubo rosa y depositarlo en una taza metálica.
- Entrada de estado del robot (6 dimensiones) como observación adicional.
- No incluye capacidades de generación de lenguaje, tool calling, ni razonamiento multimodal fuera del contexto robótico.

## Casos de uso

- Manipulación robótica en laboratorios de investigación: el modelo puede ejecutar tareas de pick-and-place con precisión en un robot SO-101, sirviendo como base para experimentos en aprendizaje por imitación.
- Automatización de procesos industriales simples: en entornos controlados, puede sustituir a un operador humano en tareas repetitivas de recogida y colocación de piezas.
- Desarrollo de nuevas políticas robóticas: dado que es un modelo afinado, puede servir como punto de partida para transferir el conocimiento a otras tareas mediante fine-tuning adicional.
- Evaluación de hardware y software de robótica: el modelo permite probar la integración de LeRobot con distintos robots y configuraciones de cámaras.
- Educación en robótica y IA: como ejemplo de un VLA funcional y desplegable en hardware de consumo, es útil para enseñar conceptos de aprendizaje por refuerzo y visión-lenguaje-acción.
- Investigación sobre eficiencia de modelos: comparar el rendimiento de SmolVLA con modelos más grandes (por ejemplo, OpenVLA) para estudiar el equilibrio entre tamaño y capacidad en robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que no hay evaluación de rendimiento en el robot real. El blog asociado menciona comparaciones con ACT, pero no proporciona métricas concretas. Por tanto, no se pueden reportar números de éxito en tareas, precisión, ni latencia.

## Requisitos de hardware

- El modelo tiene 450 millones de parámetros y un tamaño de repositorio de 0.9 GB, por lo que es compatible con GPU de consumo (por ejemplo, RTX 3090, RTX 4090) con al menos 8 GB de VRAM para inferencia en tiempo real. Sin embargo, no se especifican requisitos mínimos exactos.
- Según el paper de SmolVLA, el modelo está diseñado para funcionar en hardware de consumo, a diferencia de modelos más grandes como OpenVLA que requieren GPU de datacenter.
- Para el despliegue en el robot, se necesita la librería LeRobot y el hardware SO-101 con sus cámaras.
- Opciones de despliegue: mediante el comando `lerobot-rollout` de LeRobot, que carga el modelo y ejecuta la política en tiempo real.
- No se dispone de datos de latencia o throughput específicos para este fine-tuning.

## Comparativa con modelos similares

No se dispone de datos comparativos concretos con otros modelos en la información proporcionada. Se sabe que SmolVLA es significativamente más pequeño que OpenVLA (que tiene alrededor de 7 mil millones de parámetros) y que su arquitectura se orienta a la eficiencia. Sin embargo, no hay benchmarks públicos que comparen este fine-tuning con ACT u otros modelos de imitación en la misma tarea. Por tanto, no se puede elaborar una tabla de comparación fiable.

## Limitaciones y advertencias

- El modelo está especializado para una única tarea (recoger cubo rosa y ponerlo en taza) y no generaliza a otros objetos o escenarios sin un nuevo fine-tuning.
- La cantidad de datos de entrenamiento es limitada (57 episodios), lo que puede provocar falta de robustez ante variaciones de iluminación, posiciones de objetos o condiciones del robot.
- No se ha evaluado formalmente el modelo en el robot real; los resultados de éxito son desconocidos.
- Dependencia de la configuración exacta de cámaras y del robot SO-101; cambios en la calibración o en los ángulos de cámara pueden degradar el rendimiento.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo no está pensado para aplicaciones de producción sin una validación adicional.
- No se proporcionan garantías de seguridad; en robótica real es necesario implementar supervisión humana y mecanismos de emergencia.

## Enlaces

- Modelo en Hugging Face: [addisonhammer/smolvla_so101_pink_cube](https://huggingface.co/addisonhammer/smolvla_so101_pink_cube)
- Paper SmolVLA: [arXiv:2506.01844](https://arxiv.org/abs/2506.01844)
- Blog de fine-tuning para SO-101: [ggando.com/blog/smolvla-so101/](https://ggando.com/blog/smolvla-so101/)
- Dataset de entrenamiento: [addisonhammer/so101_pick_pink_cube](https://huggingface.co/datasets/addisonhammer/so101_pick_pink_cube)
- Repositorio de LeRobot: [github.com/huggingface/lerobot](https://github.com/huggingface/lerobot)
