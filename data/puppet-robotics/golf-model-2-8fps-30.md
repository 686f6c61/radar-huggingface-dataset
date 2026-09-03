# puppet-robotics/golf-model-2-8fps-30

## Resumen

El modelo `puppet-robotics/golf-model-2-8fps-30` es una política robótica (policy) de tipo Vision-Language-Action (VLA) desarrollada por `puppet-robotics` mediante fine-tuning del modelo base `lerobot/pi05_base` de Physical Intelligence. Está diseñado para controlar un robot en la tarea de jugar al golf, a partir de observaciones visuales de dos cámaras (muñeca y ego) y el estado del robot, generando acciones de 8 dimensiones. El modelo se ha entrenado con el dataset `puppet-robotics/golf-2-8fps`, que contiene 309 episodios y 17.614 frames a 8 FPS, utilizando el framework LeRobot. Su relevancia radica en ser un ejemplo práctico de fine-tuning de un VLA de última generación para una tarea de manipulación concreta, lo que permite investigar la generalización de políticas robóticas en entornos reales.

El modelo se distribuye bajo licencia Apache 2.0 y los pesos están en formato safetensors. El tamaño del repositorio es de 0,1 GB, lo que indica un modelo ligero. El pipeline es de robótica y no se trata de un modelo de lenguaje: su salida son acciones de robot, no texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en el modelo base pi05 |
| Parámetros totales | no disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | No aplica (modelo de acción visual-lingüística) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `lerobot/pi05_base`, que a su vez es la implementación en LeRobot del modelo π₀.₅ (Pi05) de Physical Intelligence. π₀.₅ es un modelo Vision-Language-Action diseñado para generalizar a entornos y situaciones no vistos durante el entrenamiento. En esta implementación, la política consume observaciones de estado (8 dimensiones) e imágenes de dos cámaras (muñeca con resolución 480x640 y ego con 720x1280), y produce acciones de 8 dimensiones.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.0) sobre el dataset `puppet-robotics/golf-2-8fps`, compuesto por 309 episodios y 17.614 frames a 8 FPS, con la tarea "Play golf". La configuración de entrenamiento incluye 100.000 pasos, batch size de 32, optimizador AdamW con learning rate de 2,5e-05 y semilla 1000. No se han publicado detalles sobre la composición del dataset ni sobre técnicas de alineación como RLHF o DPO, ya que se trata de un modelo de aprendizaje por imitación.

## Capacidades

- Ejecución de tareas de manipulación robótica a partir de observaciones visuales y de estado, generando acciones de 8 dimensiones.
- Control de un robot tipo `oscar` con cámaras de muñeca y ego.
- Aprendizaje por imitación de demostraciones humanas recogidas en el dataset.
- Generalización a entornos nuevos gracias a la arquitectura base pi05, aunque no se ha verificado en este fine-tuning concreto.
- Uso como política en el framework LeRobot mediante `lerobot-rollout`.
- No soporta generación de texto, tool calling ni razonamiento simbólico; su salida son acciones de baja dimensión.

## Casos de uso

- Automatización de un robot para jugar al golf: el modelo puede ejecutar swings completos a partir de las imágenes de las cámaras, permitiendo demostraciones de robótica en entornos de entretenimiento o deporte.
- Investigación en aprendizaje por imitación: sirve como caso de estudio para fine-tunear un VLA de referencia sobre una tarea específica con pocos datos (309 episodios).
- Desarrollo de políticas robóticas para manipulación de precisión: la arquitectura de entrada con dos cámaras y estado permite adaptar el modelo a gestos que requieren coordinación visomotora fina.
- Benchmarking de VLA en tareas de golf o deportes: el modelo puede utilizarse como baseline para comparar estrategias de entrenamiento, como PEFT o fine-tuning completo.
- Integración en pipelines de robótica con LeRobot: el modelo se puede cargar directamente con `lerobot-rollout` y ejecutar en un robot compatible, facilitando el despliegue en laboratorios.
- Fine-tuning para otras tareas de manipulación: partiendo de este modelo o del base, se puede transferir el conocimiento a nuevas tareas con datasets propios, aprovechando la arquitectura pi05.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del repositorio es de 0,1 GB, lo que sugiere un modelo ligero, pero no se han publicado requisitos oficiales de VRAM.
- GPU recomendada: según la documentación de LeRobot, se requiere una GPU NVIDIA con soporte CUDA para entrenar y ejecutar la política (`--policy.device=cuda`). No se especifica un modelo concreto.
- Compatibilidad con GPUs de consumo: probablemente sí, dado el tamaño reducido del modelo, pero no hay datos oficiales que lo confirmen.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), Hugging Face Hub. No se mencionan integraciones con vLLM, llama.cpp ni Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos equivalentes. Los únicos modelos relacionados son el base `lerobot/pi05_base` y otros fine-tunes del mismo autor como `puppet-robotics/golf-model` y `puppet-robotics/golf-model-2-8fps-peft`, pero no se han publicado especificaciones ni resultados de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación en robot real, por lo que el rendimiento en entornos distintos al de entrenamiento es desconocido.
- El modelo está entrenado específicamente para la tarea "Play golf" con un robot tipo `oscar` y las cámaras `wrist` y `ego`; su uso con otros robots o configuraciones de cámara puede requerir reentrenamiento.
- El dataset de entrenamiento es pequeño (309 episodios, 17.614 frames), lo que puede limitar la robustez frente a variaciones de iluminación, posición o distractores.
- Al ser un modelo de aprendizaje por imitación, hereda los sesgos de las demostraciones recogidas; no hay información sobre la diversidad de los datos.
- La licencia Apache 2.0 permite uso comercial, pero exige conservar el aviso de licencia y atribución.
- No es un modelo de lenguaje: no puede responder preguntas ni generar texto, y no debe usarse como tal.

## Enlaces

- Hugging Face: https://huggingface.co/puppet-robotics/golf-model-2-8fps-30
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset: https://huggingface.co/datasets/puppet-robotics/golf-2-8fps
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
