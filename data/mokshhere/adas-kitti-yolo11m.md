# mokshhere/adas-kitti-yolo11m

## Resumen

El modelo `mokshhere/adas-kitti-yolo11m` es un detector de objetos basado en YOLO11m, ajustado específicamente sobre el conjunto de datos KITTI Object Detection Benchmark para una tubería de percepción ADAS (sistema avanzado de asistencia al conductor). Desarrollado por el usuario mokshhere, el modelo clasifica ocho categorías propias de KITTI (coche, furgoneta, camión, peatón, persona sentada, ciclista, tranvía y misceláneo) y está pensado como demostración de un pipeline de fusión cámara-LIDAR y evitación de colisiones. Su relevancia radica en ser un ejemplo práctico de fine-tuning de un detector moderno sobre un benchmark clásico de conducción autónoma, aunque el autor advierte explícitamente que no está validado para su despliegue en vehículos reales.

El modelo se distribuye bajo licencia AGPL-3.0, con restricciones adicionales derivadas de los términos de uso del dataset KITTI, que limitan su empleo a fines de investigación no comercial. El repositorio de HuggingFace tiene un tamaño de 0.0 GB, lo que sugiere que los pesos podrían no estar incluidos o que se accede mediante enlaces externos. No se proporcionan detalles sobre el número de parámetros, la arquitectura interna más allá de la familia YOLO11m, ni métricas de rendimiento en la model card, aunque se menciona un archivo `metrics.json` dentro del repositorio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11m (fine-tune sobre el modelo base de Ultralytics) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (detección de objetos en imágenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | AGPL-3.0 (con restricciones adicionales por términos de KITTI) |
| Formato de pesos | no disponible (posiblemente .pt o safetensors, no especificado) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura YOLO11m, la variante de tamaño medio de la familia YOLO11 de Ultralytics. YOLO11 emplea una red neuronal convolucional de una sola pasada (single-stage) con una cabeza de detección anclada, diseñada para equilibrar velocidad y precisión en tareas de detección de objetos en tiempo real. El fine-tuning se realizó sobre el conjunto de entrenamiento de KITTI, que contiene 7.481 fotogramas con anotaciones de objetos en escenarios de conducción urbana. El autor utilizó una división determinista 85/15 (seed 42) sobre los identificadores de fotogramas ordenados, en lugar de la división estándar de la literatura (3712/3769 propuesta por Chen et al.). No se especifican hiperparámetros de entrenamiento, régimen de precisión (fp32, fp16, etc.) ni detalles sobre el preprocesado. Tampoco se indica si se emplearon técnicas como aumento de datos o aprendizaje por transferencia más allá del peso inicial de YOLO11.

## Capacidades

- Detección de objetos en imágenes: identifica y localiza mediante cajas delimitadoras las clases definidas por KITTI: coche, furgoneta, camión, peatón, persona sentada, ciclista, tranvía y misceláneo.
- Salida de confianza y coordenadas: proporciona puntuaciones de probabilidad y coordenadas de cajas para cada detección, aptas para su uso en pipelines de seguimiento o fusión con datos LIDAR.
- Inferencia en tiempo real (potencial): al estar basado en YOLO11m, puede alcanzar tasas de fotogramas por segundo adecuadas para aplicaciones embebidas, aunque no se aportan mediciones específicas.
- No soporta generación de texto, tool calling, razonamiento multimodal ni otras capacidades propias de modelos de lenguaje.

## Casos de uso

- Investigación académica en percepción para conducción autónoma: el modelo sirve como punto de partida para estudiar la detección de objetos en entornos urbanos con la taxonomía de KITTI, permitiendo reproducir experimentos y comparar con otros detectores.
- Demostración de un pipeline ADAS de fusión cámara-LIDAR: el repositorio vinculado incluye un proyecto completo de detección y evitación de colisiones, donde este modelo actúa como componente de percepción visual.
- Evaluación de técnicas de fine-tuning: útil para analizar el efecto de la división de datos (85/15 con seed 42) frente a la división estándar de KITTI en el rendimiento final.
- Generación de anotaciones automáticas: puede emplearse para preetiquetar nuevos datos de escenas de tráfico, siempre que se respeten las restricciones de licencia.
- Prototipado de sistemas de asistencia al conductor en entornos simulados: dado que no está validado para uso real, puede integrarse en simuladores para pruebas de concepto.
- Benchmarking de modelos de detección en el dominio de KITTI: permite comparar el rendimiento de YOLO11m ajustado frente a otras arquitecturas (YOLOv8, Faster R-CNN, etc.) bajo las mismas condiciones de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que existe un archivo `metrics.json` en el repositorio con métricas por clase (mAP50, mAP50-95) y AP según el protocolo de KITTI (easy/moderate/hard), pero estos datos no se han incluido en la documentación proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible. Dado que YOLO11m tiene aproximadamente 20 millones de parámetros (dato genérico, no confirmado para este fine-tune), podría caber en GPUs con 4-8 GB de VRAM en inferencia, pero no se especifica.
- GPU recomendadas: no disponible. Se puede inferir que una GPU consumer como una RTX 3060 o superior sería suficiente para inferencia, pero no hay confirmación.
- Compatibilidad con GPU de consumo: probablemente sí, dado el tamaño moderado del modelo base, pero sin datos oficiales.
- Opciones de despliegue: al ser un modelo de Ultralytics, es compatible con su framework (Python), y podría exportarse a formatos como ONNX, TensorRT o CoreML. No se mencionan herramientas como vLLM u Ollama, que son específicas para modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se proporcionan datos de rendimiento ni se mencionan modelos comparables en la model card. Se podría comparar con otros detectores entrenados en KITTI (como YOLOv8, Faster R-CNN, SSD), pero faltan métricas concretas para establecer una comparación objetiva.

## Limitaciones y advertencias

- Licencia restrictiva: el modelo está bajo AGPL-3.0, y además los términos de KITTI limitan su uso a fines de investigación no comercial. No está permitido su uso en producción o aplicaciones comerciales sin una evaluación legal previa.
- No validado para despliegue real: el autor indica explícitamente que el modelo no está validado para su uso en un vehículo. Cualquier aplicación en sistemas ADAS reales sería insegura.
- Alcance limitado a clases de KITTI: solo reconoce las ocho categorías del dataset, por lo que no generaliza a otros tipos de objetos o escenarios fuera de ese dominio.
- División de datos no estándar: el uso de una división 85/15 con seed 42 sobre fotogramas ordenados puede introducir sesgos de correlación temporal, lo que podría inflar las métricas en comparación con la división estándar de la literatura.
- Falta de documentación técnica: no se especifican hiperparámetros, régimen de entrenamiento, ni detalles de la arquitectura ajustada, lo que dificulta la reproducibilidad.
- Riesgo de alucinación: al ser un modelo de detección, puede producir falsos positivos o negativos, especialmente en condiciones de oclusión o iluminación adversas.
- Repositorio sin pesos visibles: el tamaño del repo es 0.0 GB, lo que sugiere que los pesos podrían no estar alojados directamente o que se requiere acceso adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mokshhere/adas-kitti-yolo11m
- Repositorio del proyecto ADAS: https://github.com/ishaannk/ADAS-Object-Detection-and-Collision-Avoidance
- Referencia al paper de impacto ambiental de Lacoste et al. (mencionado en tags, no directamente relacionado con el modelo): https://arxiv.org/abs/1910.09700
