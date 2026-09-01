# shamitwell/pi05-lora-ab-B

## Resumen

`shamitwell/pi05-lora-ab-B` es un fine-tune con LoRA del modelo base `lerobot/pi05_base`, un Vision-Language-Action (VLA) desarrollado por Physical Intelligence y portado a LeRobot. El modelo base π₀.₅ está diseñado para generalizar a entornos y situaciones nuevas no vistas durante el entrenamiento, combinando visión, lenguaje y acción para manipulación robótica. Este fine-tune concreto se ha entrenado sobre un dataset propio de 173 episodios de manipulación con un robot tipo `so_follower`, con cámaras de muñeca y overhead, para tareas como apilar bloques, mover objetos o colocar piezas en una taza.

La relevancia de este modelo radica en que demuestra cómo adaptar un VLA de última generación a tareas específicas mediante fine-tuning eficiente con LoRA, reduciendo costes computacionales y permitiendo su despliegue en robots reales a través del ecosistema LeRobot. El repositorio incluye pesos en formato safetensors (3,8 GB) y es totalmente reproducible con las herramientas de LeRobot.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pi05 (Vision-Language-Action) con fine-tuning LoRA |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no procesa texto libre) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base π₀.₅ es un VLA que co-entrena con datos heterogéneos (demostraciones robóticas, datos web y subtareas semánticas) para lograr generalización open-world en manipulación de largo horizonte. La implementación en LeRobot está adaptada del repositorio OpenPI de Physical Intelligence. Este fine-tune concreto aplica LoRA sobre el modelo base, lo que permite adaptarlo a tareas específicas con un número reducido de parámetros entrenables.

El entrenamiento se realizó con el dataset `shamitwell/dsouza-so101-data`, que contiene 173 episodios y 42.312 frames a 30 FPS, cubriendo 17 tareas de manipulación (mover cajas, apilar bloques, rotar objetos, etc.). La configuración de entrenamiento fue: 14.300 pasos, batch size 8, optimizador AdamW, tasa de aprendizaje 2,5×10⁻⁵ y semilla 1000, utilizando LeRobot versión 0.6.1. El modelo consume como entrada tres imágenes RGB de 224×224 píxeles (cámara base, muñeca izquierda y muñeca derecha) junto con un vector de estado de 32 dimensiones, y produce una acción de 6 dimensiones (probablemente posición y orientación del efector final).

## Capacidades

- Manipulación robótica de 6 grados de libertad: genera comandos de acción directos para el robot.
- Entrada multimodal: procesa simultáneamente imágenes de múltiples cámaras y el estado propioceptivo del robot.
- Generalización a nuevas configuraciones espaciales gracias a la base VLA de pi05 (aunque no hay evaluación formal en este fine-tune).
- Fine-tuning eficiente con LoRA: permite adaptar el modelo a nuevas tareas con bajo coste computacional.
- Integración nativa con LeRobot: compatible con las herramientas de entrenamiento, evaluación y despliegue de la librería.
- Sin capacidades de generación de texto, tool calling o agentes: está especializado únicamente en control motor.

## Casos de uso

- Automatización de tareas de picking y placing en entornos controlados: el modelo puede ejecutar tareas como "pick up the block and place it in the cup" o "stack the blocks", útiles en líneas de montaje o laboratorios.
- Investigación en imitación learning: sirve como ejemplo de fine-tuning de un VLA con LoRA sobre un dataset pequeño, para estudiar transferencia de habilidades.
- Desarrollo de robots colaborativos en entornos domésticos: tareas como mover objetos de un lugar a otro o manipular utensilios (cuchillo, bloques) pueden integrarse en asistentes robóticos.
- Benchmarking de políticas robóticas: al estar publicado en Hugging Face con formato LeRobot, permite comparar el rendimiento de diferentes fine-tunes sobre el mismo modelo base.
- Prototipado rápido de nuevas tareas: con solo 173 episodios se logra un modelo funcional, ideal para validar conceptos antes de escalar a datasets mayores.
- Educación en robótica y aprendizaje por refuerzo: el repositorio incluye instrucciones claras para entrenar y ejecutar, facilitando su uso en cursos y talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

No se dispone de información específica sobre requisitos de hardware para este fine-tune. Dado que el modelo base es un VLA de gran tamaño (típicamente varios miles de millones de parámetros) y que el repo ocupa 3,8 GB en safetensors, se recomienda al menos una GPU con 24 GB de VRAM para inferencia en tiempo real, aunque no se puede confirmar sin datos oficiales. Las opciones de despliegue incluyen el uso de LeRobot con `lerobot-rollout` y el entrenamiento con `lerobot-train` en GPU CUDA. No hay información sobre latencia o throughput.

## Comparativa con modelos similares

Dado que la información disponible no incluye comparativas con otros modelos, se indica lo siguiente:

| Modelo | Tipo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| shamitwell/pi05-lora-ab-B | VLA (fine-tune LoRA) | no disponible | no disponible | Apache 2.0 | Fine-tune específico para tareas de manipulación |
| lerobot/pi05_base | VLA | no disponible | no disponible | Apache 2.0 | Modelo base de Physical Intelligence |
| Otros modelos de LeRobot (ACT, Diffusion Policy) | Políticas de imitación | no disponible | no disponible | Apache 2.0 | Alternativas para tareas similares, pero sin datos comparativos |

No se dispone de información suficiente para una comparativa cuantitativa.

## Limitaciones y advertencias

- No se han reportado resultados de evaluación en robot real, por lo que el rendimiento efectivo es desconocido.
- El modelo se ha entrenado únicamente con 173 episodios de un dataset específico; puede no generalizar fuera de las tareas y configuraciones de ese dataset.
- Depende de las cámaras y del robot `so_follower`; cualquier cambio en la configuración hardware puede degradar el rendimiento.
- Al ser un fine-tune LoRA, hereda las limitaciones del modelo base, incluidos posibles sesgos en los datos de preentrenamiento (no documentados).
- No hay información sobre sesgos o alucinaciones, aunque al ser un modelo de control motor el riesgo principal es la ejecución de acciones incorrectas o inseguras.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base y de los datos de entrenamiento.

## Enlaces

- Repositorio del modelo: https://huggingface.co/shamitwell/pi05-lora-ab-B
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/shamitwell/dsouza-so101-data
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Documentación de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
