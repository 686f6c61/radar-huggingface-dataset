# HyeonseokE/smolvla_sort_by_color_ours_3000_10fps

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por HuggingFace y la comunidad LeRobot. Este repositorio contiene un fine-tune específico del modelo base `lerobot/smolvla_base`, entrenado para la tarea de ordenar bloques por color en platos. El modelo está diseñado para controlar un brazo robótico SO-101 a partir de observaciones multimodales (estado del robot y tres cámaras) y generar comandos de acción de 6 dimensiones. Con 450 millones de parámetros y un tamaño de 0.9 GB, está orientado a ejecutarse en hardware de consumo. El fine-tune se entrenó sobre 100 episodios del dataset `HyeonseokE/sort_by_color_ours_10fps`, con 74.952 frames a 10 FPS.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA) |
| Parámetros totales | 450.046.176 |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA combina un modelo de lenguaje visual (VLM) para procesar entradas multimodales con un experto de acción que genera comandos de control. Este modelo es un fine-tune de `lerobot/smolvla_base`, entrenado mediante aprendizaje por imitación con LeRobot. Los datos de entrenamiento consisten en 100 episodios (74.952 frames a 10 FPS) de la tarea "Sort the blocks onto the matching colored dishes". La configuración de entrenamiento incluyó 58.550 pasos, batch size 64, optimizador AdamW, learning rate 0.0001 y semilla 3000, usando la versión 0.6.0 de LeRobot. No se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Control robótico: genera acciones de 6 dimensiones a partir del estado del robot y observaciones visuales.
- Percepción multimodal: procesa imágenes de tres cámaras (256x256 píxeles) y el estado del robot.
- Tarea específica: ordenar bloques sobre platos según su color.
- Integración con LeRobot: compatible con el framework LeRobot para entrenamiento y despliegue.
- No soporta tool calling ni generación de texto conversacional.
- Capacidades multilingües: no aplica.

## Casos de uso

- Automatización de clasificación de piezas en entornos industriales: el modelo puede controlar un brazo robótico para separar componentes por color, reduciendo la intervención humana.
- Investigación en aprendizaje por imitación: sirve como referencia para estudiar cómo un VLA compacto generaliza en tareas de manipulación con diferentes configuraciones de cámara.
- Demostraciones educativas de robótica: permite ejecutar un policy funcional en un robot SO-101 en ferias o laboratorios docentes.
- Integración en almacenes inteligentes: el modelo puede adaptarse para clasificar productos en bandejas mediante fine-tuning adicional.
- Desarrollo de asistentes domésticos: tras un fine-tuning específico, puede utilizarse para ordenar objetos en entornos domésticos.
- Benchmarking de políticas VLA en hardware de consumo: permite evaluar el rendimiento de modelos VLA en GPUs de gama media.
- Prototipado rápido de tareas robóticas: el modelo ofrece una base para desarrollar nuevas habilidades con pocos datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- Tamaño del modelo: 0.9 GB en disco (safetensors).
- VRAM estimada para inferencia: aproximadamente 1.8 GB en FP32 o 0.9 GB en FP16 (estimación basada en 450 millones de parámetros). No se dispone de datos oficiales de cuantización.
- GPU recomendadas: no disponible. El diseño de SmolVLA está orientado a hardware de consumo, por lo que se espera que pueda ejecutarse en GPUs como RTX 3060 o superiores, aunque no hay confirmación oficial.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout`, tal como se documenta en la model card.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Este modelo es un fine-tune específico de SmolVLA. En la misma categoría se encuentran el modelo base `lerobot/smolvla_base` y otros VLA como OpenVLA y Pi0. Sin embargo, no se dispone de datos de comparación numérica para esta tarea concreta, ya que no hay benchmarks publicados. Los parámetros totales (450M) y el diseño compacto sitúan a SmolVLA como una alternativa ligera frente a modelos VLA más grandes.

## Limitaciones y advertencias

- No hay resultados de evaluación publicados, por lo que el rendimiento real en robot no está verificado.
- Entrenado para una tarea específica (ordenar bloques por color); puede no generalizar a otras tareas sin un fine-tuning adicional.
- Depende de la configuración exacta del robot (SO-101) y de las cámaras utilizadas en el entrenamiento.
- El dataset de entrenamiento es pequeño (100 episodios), lo que puede limitar la robustez frente a variaciones en iluminación, posición de objetos o distracciones.
- Riesgo de acciones incorrectas si las observaciones difieren significativamente de las condiciones de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero requiere conservar el aviso de copyright y la atribución.

## Enlaces

- Modelo: https://huggingface.co/HyeonseokE/smolvla_sort_by_color_ours_3000_10fps
- Paper: https://huggingface.co/papers/2506.01844
- Blog de SmolVLA: https://huggingface.co/blog/smolvla
- Dataset: https://huggingface.co/datasets/HyeonseokE/sort_by_color_ours_10fps
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Modelo base: https://huggingface.co/lerobot/smolvla_base
