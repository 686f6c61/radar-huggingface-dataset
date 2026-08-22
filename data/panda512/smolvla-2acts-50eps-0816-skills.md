# Panda512/smolvla-2acts-50eps-0816-skills

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face, diseñado para control robótico en hardware de consumo. Este repositorio contiene un fine-tuning específico del modelo base `lerobot/smolvla_base` realizado por Panda512, entrenado sobre un dataset de 50 episodios de manipulación robótica con una tarea concreta: recoger un gotero, ponerlo en una taza, agarrar el asa y moverla a la izquierda. El modelo tiene 450 millones de parámetros y se distribuye en formato safetensors, con licencia Apache 2.0.

La relevancia de este modelo radica en que demuestra cómo un VLA compacto puede ser fine-tuneado con pocos datos (50 episodios) para tareas específicas de manipulación, manteniendo un coste computacional reducido. Está integrado con la librería LeRobot, lo que facilita su despliegue en robots reales como el SO-100.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basado en SmolVLA, no se especifican detalles internos |
| Parametros totales | 450.046.176 (0,45B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, probablemente BF16) |
| Idiomas soportados | No disponible (tarea en inglés, pero el modelo no es multilingüe en el sentido tradicional) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual con un modelo de lenguaje para generar acciones de control. El modelo base `lerobot/smolvla_base` fue preentrenado en grandes conjuntos de datos multimodales, y este fine-tuning se realizó sobre un dataset específico de robótica. El entrenamiento usó 35.000 pasos con batch size 32, optimizador AdamW y learning rate 0,0001, sobre 50 episodios que suman 45.601 frames a 30 FPS. La tarea está definida en lenguaje natural: "Pick up the eyedrops, put them into the cup, grab the cup handle, and move the cup to the left." No se menciona el uso de RLHF o DPO; es un fine-tuning supervisado de imitación.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 dimensiones (posición y orientación) a partir de observaciones visuales (3 cámaras) y estado del robot.
- Comprensión de instrucciones en lenguaje natural: la tarea se especifica textualmente.
- Integración con LeRobot: permite entrenamiento y despliegue sencillo en robots como SO-100.
- Eficiencia computacional: diseñado para ejecutarse en una GPU de consumo.
- No tiene capacidades de generación de texto general, tool calling ni agentes; es un modelo de política robótica.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos controlados: el modelo puede ejecutar la tarea específica para la que fue entrenado, como recoger objetos y colocarlos en contenedores.
- Investigación en aprendizaje por imitación: sirve como ejemplo de fine-tuning de un VLA con pocos datos para una tarea concreta.
- Prototipado rápido de políticas robóticas: gracias a LeRobot, se puede desplegar en un robot real con pocos comandos.
- Benchmarking de VLA compactos: permite comparar el rendimiento de SmolVLA frente a otros modelos en tareas de manipulación.
- Educacion en robótica: útil para enseñar conceptos de visión-lenguaje-acción y aprendizaje por imitación.
- Desarrollo de asistentes robóticos domésticos: aunque limitado a la tarea entrenada, demuestra el potencial para tareas de manipulación en el hogar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no hay resultados de evaluacion en robot real.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 0,45B, con pesos en BF16 (aprox. 0,9 GB), la inferencia podria requerir entre 2 y 4 GB de VRAM dependiendo del batch y resolucion de imagen. Sin embargo, no hay datos oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3060, o superiores. El paper de SmolVLA indica que puede ejecutarse en hardware de consumo.
- Despliegue: mediante LeRobot, con comandos `lerobot-rollout` y `lerobot-train`. Tambien se puede usar con vLLM u otras herramientas, pero no esta documentado para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos. Sin embargo, se puede comparar con otros VLA como OpenVLA (7B parametros) o RT-2 (55B), que son mucho mas grandes y requieren hardware mas potente. SmolVLA destaca por su tamaño reducido y eficiencia, pero no hay metricas concretas en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta entrenado para una tarea muy especifica; no generaliza a otras tareas sin fine-tuning adicional.
- No se han reportado evaluaciones en robot real, por lo que el rendimiento real es desconocido.
- Depende de la configuracion de camaras y robot; cambios en la iluminacion, posicion de objetos o tipo de robot pueden degradar el rendimiento.
- Al ser un modelo de imitacion, puede heredar sesgos del dataset de entrenamiento (por ejemplo, posiciones iniciales fijas).
- La licencia Apache 2.0 permite uso comercial, pero el modelo no incluye garantias.
- No se especifican limitaciones de contexto, pero al ser un VLA, la entrada es principalmente visual y de estado, no texto largo.

## Enlaces

- HuggingFace: https://huggingface.co/Panda512/smolvla-2acts-50eps-0816-skills
- Paper SmolVLA: https://arxiv.org/abs/2506.01844
- Dataset: https://huggingface.co/datasets/Panda512/record-0816-skills
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- LeRobot: https://github.com/huggingface/lerobot
