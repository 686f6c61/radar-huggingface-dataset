# LCPRZZL/act_policy

## Resumen

El modelo `LCPRZZL/act_policy` es una política de imitación basada en Action Chunking with Transformers (ACT), entrenada con el framework LeRobot de Hugging Face. ACT es un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación robótica. El modelo fue desarrollado por el usuario LCPRZZL y está especializado en una tarea de recogida de objetos (picking) sobre un robot con cámara de muñeca, usando un dataset propio llamado `cari_picking`.

Con 51,67 millones de parámetros, esta política es relativamente ligera en comparación con modelos de lenguaje o visión de gran escala. Está diseñada para ejecutarse en tiempo real sobre un robot físico, consumiendo observaciones de estado (posición articular) e imágenes de cámara, y produciendo comandos de acción de 7 dimensiones. Su relevancia radica en que demuestra un flujo completo de entrenamiento y despliegue de políticas robóticas con herramientas open source, y puede servir como punto de partida para tareas similares de manipulación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) con CVAE |
| Parametros totales | 51.670.663 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; procesa observaciones puntuales) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de control robótico, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT combina un transformer con un autoencoder variacional condicional (CVAE). El codificador procesa las observaciones (estado del robot e imagen de la cámara de muñeca) y el decodificador genera un chunk de acciones futuras. El entrenamiento se realiza mediante imitación de demostraciones teleoperadas, minimizando la pérdida de reconstrucción de acciones. En este caso, el modelo se entrenó durante 400.000 pasos con un batch de 8, optimizador AdamW, tasa de aprendizaje de 1e-5 y semilla 1000, usando la versión 0.6.0 de LeRobot. El dataset de entrenamiento contiene 13 episodios con 3.217 frames a 30 FPS, correspondientes a una única tarea etiquetada como "0". No se menciona el uso de RLHF ni DPO; es un entrenamiento puramente supervisado.

## Capacidades

- Generación de secuencias de acción de 7 dimensiones para control de robot manipulador.
- Procesamiento de observaciones multimodales: estado articular (vector de 7) e imagen RGB de cámara de muñeca (720x1280).
- Ejecución en tiempo real sobre hardware robótico mediante el pipeline de LeRobot.
- Soporte para inferencia con `lerobot-rollout` y entrenamiento con `lerobot-train`.
- No incluye capacidades de lenguaje, tool calling ni razonamiento simbólico; es una política puramente motora.

## Casos de uso

- Recogida de objetos en entornos controlados: el modelo puede ejecutar la tarea de picking para la que fue entrenado, recibiendo imágenes de la cámara de muñeca y el estado articular, y generando comandos de movimiento.
- Prototipado de políticas de imitación: sirve como ejemplo de referencia para quienes quieran entrenar su propia política ACT con LeRobot, ya que incluye configuración completa de entrenamiento y despliegue.
- Investigación en aprendizaje por imitación: permite estudiar el comportamiento de ACT con un dataset pequeño (13 episodios) y analizar la influencia del número de demostraciones en el rendimiento.
- Base para fine-tuning: el checkpoint puede usarse como inicialización para tareas similares de manipulación, reduciendo el tiempo de entrenamiento.
- Evaluación de pipelines robóticos: útil para validar la integración de LeRobot con distintos robots y cámaras, ya que el modelo acepta observaciones estándar.
- Demostraciones educativas: en cursos o talleres de robótica, puede mostrarse el flujo completo desde la grabación de datos hasta la ejecución de la política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real. No se proporcionan métricas como tasa de éxito, precisión ni comparaciones con otros métodos.

## Requisitos de hardware

- No se especifican requisitos oficiales de VRAM ni GPU en la documentación del modelo.
- Dado el tamaño de 51,67 millones de parámetros, la inferencia es ligera y debería ejecutarse en GPUs de consumo como una RTX 3060 o superior, aunque no hay datos confirmados.
- El entrenamiento con 400.000 pasos y batch 8 puede requerir una GPU con al menos 8-12 GB de VRAM, dependiendo de la resolución de imagen (720x1280) y la implementación de LeRobot.
- Para despliegue en robot, se recomienda usar el flujo de LeRobot con `lerobot-rollout`, que gestiona la comunicación con el hardware.
- No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama; al ser un modelo de robótica, se usa exclusivamente a través de LeRobot.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos ACT comparables con especificaciones detalladas en el momento de la consulta. Existen otras políticas ACT en el Hub de Hugging Face, pero no se han encontrado datos públicos de parámetros, rendimiento o licencia que permitan una comparación rigurosa. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo fue entrenado con un dataset muy pequeño (13 episodios) y una única tarea, por lo que su generalización a otras tareas o entornos es limitada.
- No se han reportado evaluaciones en robot real, por lo que se desconoce su tasa de éxito real en condiciones operativas.
- Depende de la configuración específica de cámaras y robot; cualquier cambio en la posición de la cámara, iluminación o calibración puede degradar el rendimiento.
- Al ser un modelo de imitación, puede heredar sesgos de las demostraciones (por ejemplo, trayectorias subóptimas o movimientos inseguros).
- No tiene capacidades de razonamiento simbólico ni de lenguaje; solo genera acciones motoras.
- La licencia Apache 2.0 permite uso comercial, pero el dataset asociado (`cari_picking`) puede tener restricciones adicionales no documentadas en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LCPRZZL/act_policy
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/LCPRZZL/cari_picking
- Documentación de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Blog sobre ACT Policy (referencia externa): https://www.roboticscenter.ai/blog/act-policy-explained
