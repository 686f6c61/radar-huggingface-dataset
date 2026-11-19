# kornitsovivan/petrol-qfcbpo

## Resumen

Petrol-qfcbpo es un detector de objetos publicado en Hugging Face por el usuario kornitsovivan bajo licencia AGPL-3.0. El modelo identifica cuatro clases específicas del dominio de las estaciones de servicio: surtidor de combustible (petrol pump), manguera (petrol hose), marquesina (roof canopy) y panel de precios (price board). Se distribuye exclusivamente en formato ONNX junto con un script de inferencia (`miner.py`) y un fichero de configuración de despliegue (`chute_config.yml`).

A diferencia de los modelos generativos, se trata de un detector de objetos puro: no genera texto ni mantiene conversaciones, sino que produce detecciones sobre imágenes. Su interés es acotado y muy vertical: automatización de inventario o auditoría visual de estaciones de servicio. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB, lo que sugiere que los pesos no están efectivamente alojados o son de tamaño mínimo.

La información disponible es extremadamente escasa: no se especifican arquitectura, número de parámetros, resolución de entrada, dataset de entrenamiento ni métricas de rendimiento. La model card se limita a enumerar las clases y los ficheros incluidos. Cualquier evaluación rigurosa requiere inspeccionar directamente el ONNX y el código de inferencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (detector de objetos en formato ONNX; la arquitectura concreta no se especifica) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | no disponible (se distribuye un único `weights.onnx`; se desconoce si está cuantizado) |
| Idiomas soportados | no disponible (no aplica; las clases están etiquetadas en inglés) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX (`weights.onnx`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura de la red. El único indicio es el formato de despliegue (ONNX) y la presencia de un script de inferencia con una firma `Miner(path).predict_batch(batch_images, offset, n_keypoints)`, que sugiere procesamiento por lotes y algún mecanismo de keypoints u offsets en la salida, pero no permite determinar si se trata de un detector tipo YOLO, un modelo basado en anchors, un detector con cabeza de keypoints o una arquitectura híbrida.

Tampoco hay datos sobre el conjunto de entrenamiento: número de imágenes, procedencia, anotaciones, aumentos de datos, función de pérdida ni proceso de ajuste. No consta información sobre validación, métricas de entrenamiento ni técnicas de destilación o cuantización. Todo ello debe considerarse no disponible.

## Capacidades

- Detección de objetos en imágenes para cuatro clases: surtidor de combustible, manguera, marquesina y panel de precios.
- Inferencia por lotes mediante `predict_batch(batch_images, offset, n_keypoints)`.
- Despliegue en formato ONNX, compatible con runtimes como ONNX Runtime.
- Inclusión de un fichero de configuración de servicio (`chute_config.yml`) que sugiere un despliegue contenedorizado tipo Chute.
- No soporta generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Auditoría visual de estaciones de servicio: procesar fotografías aéreas o de campo para contar surtidores y mangueras y verificar el inventario de una instalación. El modelo está entrenado específicamente para estas clases, lo que reduce falsos positivos frente a detectores genéricos.
- Monitorización de precios: localizar el panel de precios en imágenes de la estación para recortarlo y enviarlo a un OCR posterior. La detección actúa como etapa de localización previa.
- Inspección de mantenimiento: detectar mangueras y surtidores para evaluar su estado visual (por ejemplo, presencia o ausencia) en rondas periódicas de inspección.
- Inventario de marquesinas: identificar la cubierta (roof canopy) para tareas de catalogación de infraestructuras o análisis de imágenes satelitales.
- Automatización de pipelines de visión en producción: al ser ONNX, puede integrarse en servicios de inferencia existentes (ONNX Runtime, Triton) sin dependencias de frameworks de deep learning pesados.
- Análisis de cumplimiento de imagen de marca: verificar la presencia y disposición de marquesina y panel de precios en fotografías de franquicias.
- Etiquetado asistido: usar las detecciones como preanotaciones para acelerar el etiquetado de nuevos datasets del mismo dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al desconocerse el tamaño del ONNX, no puede estimarse. El repositorio reporta 0.0 GB, lo que impide calcular requisitos.
- GPU recomendadas: no disponible. Cualquier GPU con soporte de ONNX Runtime (por ejemplo, series RTX, A100, H100) podría ejecutarlo si el modelo cabe en memoria, pero no hay datos para confirmarlo.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), Triton Inference Server, o el mecanismo de servicio implícito en `chute_config.yml`. No se mencionan vLLM, llama.cpp ni Ollama, que no aplican a un detector de objetos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kornitsovivan/petrol-qfcbpo | Detección de 4 clases de estaciones de servicio | no disponible | no aplica | AGPL-3.0 | Hugging Face, ONNX |
| YOLOv8 / YOLO11 (Ultralytics) | Detección de objetos genérica (COCO) | 3-70 M aprox. | no aplica | AGPL-3.0 | Hugging Face, GitHub |
| DETR / RT-DETR | Detección de objetos genérica | 20-60 M aprox. | no aplica | Apache-2.0 / MIT | Hugging Face, GitHub |

La comparación es aproximada: los detectores genéricos cubren 80 clases COCO y requieren ajuste fino para el dominio de estaciones de servicio, mientras que este modelo ya está especializado en cuatro clases concretas, a costa de una documentación y madurez muy inferiores.

## Limitaciones y advertencias

- Información insuficiente: no se documentan arquitectura, parámetros, resolución de entrada, dataset ni métricas; es imposible evaluar su calidad sin inspeccionar el ONNX y ejecutar pruebas propias.
- Repositorio sin tracción: 0 descargas y 0 likes, lo que reduce la probabilidad de validación por terceros y de soporte comunitario.
- Tamaño reportado de 0.0 GB: conviene verificar que los pesos están realmente presentes y son funcionales antes de integrarlo.
- Dominio muy restringido: solo detecta cuatro clases; fuera de ese contexto su utilidad es nula y su comportamiento ante clases no vistas es impredecible.
- Licencia AGPL-3.0: el uso comercial en servicios en red obliga a liberar el código fuente derivado bajo la misma licencia; es una restricción relevante para producción.
- Riesgo de sesgo y alucinación: no hay información sobre la distribución del dataset de entrenamiento, por lo que se desconocen sesgos geográficos, de iluminación o de tipo de estación.
- Sin garantías de mantenimiento: el autor no ofrece documentación adicional ni compromiso de actualización.

## Enlaces

- Hugging Face: https://huggingface.co/kornitsovivan/petrol-qfcbpo
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
