# kaushik3009/industrial-vision-agent

## Resumen

Industrial Vision Agent es un sistema de inspección de calidad por visión artificial desarrollado por kaushik3009, diseñado para la detección de defectos en piezas de fundición de metal. El proyecto integra varios modelos de visión por computadora que trabajan de forma conjunta: un clasificador basado en ViT-Tiny (fine-tuned), un backbone ResNet18 para localización mediante Grad-CAM, un clasificador ligero MobileNetV3-small destilado para entornos edge y una U-Net que genera máscaras de segmentación a partir de pseudo-máscaras obtenidas con Grad-CAM. El sistema resuelve el problema de control de calidad en manufactura industrial, ofreciendo una solución de bajo coste y con capacidad de despliegue en dispositivos con recursos limitados.

El entrenamiento se realizó con 7.347 imágenes de piezas de fundición, con una clasificación binaria (OK/defectuoso) y una segmentación débilmente supervisada. La arquitectura combina transformers (ViT) y CNNs, con técnicas de destilación de conocimiento y cuantización INT8 dinámica para reducir el tamaño del modelo (de 22.2 MB a 6.3 MB en el caso del ViT). El proyecto está publicado con licencia MIT y es una solución práctica para inspección industrial en tiempo real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Múltiples: ViT-Tiny (clasificador), ResNet18 (localización Grad-CAM), MobileNetV3-small (clasificador edge), U-Net (segmentación) |
| Parámetros totales | No disponible (varios modelos, cada uno con su propio tamaño) |
| Parámetros activos | No disponible (no es MoE) |
| Longitud de contexto | No aplica (visión por computadora) |
| Tipos de cuantización | INT8 dinámico (aplicado al ViT-Tiny) |
| Idiomas soportados | No aplica (modelo de visión) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pth) |

## Arquitectura y entrenamiento

El sistema no es un único modelo monolítico, sino un conjunto de checkpoints especializados que colaboran en un pipeline de inspección. El clasificador principal es un ViT-Tiny (timm) fine-tuneado para clasificación binaria de defectos, que alcanza un F1 de 0.9967. Para la localización de defectos se utiliza un ResNet18 con una cabeza linealmente probada, que genera mapas de activación Grad-CAM; estos mapas se usan como pseudo-máscaras para entrenar una U-Net que produce segmentaciones de 224x224 píxeles. Adicionalmente, se entrena un MobileNetV3-small como estudiante destilado del ViT, con un 94.9% menos de parámetros, para su uso en entornos edge.

El entrenamiento se realizó con 7.347 imágenes de piezas de fundición, con etiquetas binarias (OK/defectuoso). No se especifica el número de épocas ni la composición exacta del conjunto de validación. La destilación de conocimiento y la cuantización INT8 son las innovaciones técnicas destacadas, reduciendo el tamaño del modelo para su despliegue en dispositivos con recursos limitados.

## Capacidades

- Clasificación binaria de defectos en imágenes de piezas de fundición (OK/defectuoso) con alta precisión (F1 0.9967).
- Localización de regiones defectuosas mediante mapas de activación Grad-CAM generados por el modelo ResNet18.
- Segmentación débilmente supervisada de defectos mediante una U-Net entrenada con pseudo-máscaras de Grad-CAM (Dice 0.706).
- Clasificación en entornos edge mediante un modelo MobileNetV3-small destilado, que mantiene un F1 de 0.991 con un 94.9% menos de parámetros.
- Cuantización dinámica INT8 para reducir el tamaño del modelo ViT en un 71.7% (de 22.2 MB a 6.3 MB), facilitando el despliegue en dispositivos con memoria limitada.
- Procesamiento de imágenes RGB de 224x224 con normalización ImageNet.

## Casos de uso

- Inspección de calidad en línea de producción de piezas de fundición: el clasificador ViT puede integrarse en cámaras industriales para detectar defectos en tiempo real y rechazar piezas defectuosas automáticamente, reduciendo el coste de inspección manual.
- Localización de defectos para mantenimiento predictivo: mediante Grad-CAM y la segmentación U-Net, se puede identificar la zona exacta de un defecto para priorizar reparaciones o ajustar parámetros de fabricación.
- Despliegue en dispositivos edge para control de calidad en plantas remotas: el modelo MobileNetV3-small destilado y cuantizado puede ejecutarse en microcontroladores o sistemas embebidos (Raspberry Pi, NVIDIA Jetson) para inspección en el punto de producción sin necesidad de conexión a la nube.
- Integración en sistemas de visión industrial (PLC/SCADA): los resultados de clasificación y segmentación pueden enviarse a sistemas de control para activar alarmas o detener líneas de producción cuando se detectan defectos críticos.
- Auditoría y análisis de calidad de lotes: el sistema puede procesar imágenes de un lote de piezas para generar informes de defectos con porcentajes de defectos, ayudando a la trazabilidad y al control estadístico de procesos.
- Investigación en visión por computadora aplicada a industria: el repositorio sirve como base para experimentos con destilación de conocimiento, cuantización y segmentación débilmente supervisada en el dominio de inspección industrial.

## Benchmarks y rendimiento

La model card del autor proporciona las siguientes métricas verificadas para los distintos modelos:

| Modelo | Tarea | Métrica | Valor |
|---|---|---|---|
| ViT-Tiny | Clasificación de defectos | Test F1 | 0.9967 |
| ViT-Tiny | Clasificación de defectos | Test Recall | 0.9956 |
| ResNet18 | Localización Grad-CAM | Test F1 | 0.924 |
| MobileNetV3-small (destilado) | Clasificación edge | Test F1 | 0.991 |
| U-Net | Segmentación (224x224) | Val Dice | 0.706 |

No se han publicado comparaciones con otros modelos de detección de defectos en la información disponible. Los resultados son específicos del conjunto de datos de 7.347 imágenes de piezas de fundición, por lo que no se puede generalizar a otros dominios.

## Requisitos de hardware

- No se proporcionan datos de VRAM específicos para cada modelo, pero los modelos son de pequeño tamaño (ViT-Tiny ~5M parámetros, ResNet18 ~11M, MobileNetV3-small ~2.5M, U-Net de tamaño reducido).
- Los modelos son adecuados para ejecutarse en GPUs de consumo (p. ej., NVIDIA GTX 1060 con 6 GB, RTX 3060, etc.) o incluso en CPU con baja latencia para inferencia de una sola imagen.
- El modelo cuantizado INT8 (ViT) reduce el tamaño a 6.3 MB, permitiendo su ejecución en dispositivos edge con memoria limitada (p. ej., Raspberry Pi 4 con 2 GB RAM, Jetson Nano).
- Opciones de despliegue: el formato PyTorch nativo se puede exportar a ONNX o TensorRT para aceleración en GPU, o usar con librerías de inferencia como OpenVINO para CPU.
- No se especifica latencia ni throughput; al ser modelos pequeños, se espera una inferencia de pocos milisegundos por imagen en GPU moderna.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el mismo dominio (detección de defectos en fundiciones). La model card no incluye comparaciones con alternativas como YOLOv8, Faster R-CNN u otros sistemas de inspección. Por tanto, se indica "no disponible".

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en un conjunto de 7,347 imágenes de piezas de fundición de metal. No se garantiza su rendimiento en otros tipos de materiales, superficies o condiciones de iluminación.
- La segmentación es débilmente supervisada (pseudo-máscaras generadas con Grad-CAM), por lo que las máscaras de segmentación pueden tener bordes imprecisos o faltar defectos pequeños (Dice 0.706).
- El conjunto de datos es relativamente pequeño y puede haber sesgo hacia los tipos de defectos representados en las imágenes de entrenamiento. No se ha documentado la distribución de clases ni la diversidad de defectos.
- No se ha evaluado el modelo en condiciones de iluminación variables, oclusiones o imágenes de baja resolución, lo que podría afectar la robustez en entornos industriales reales.
- La licencia MIT permite uso comercial, pero el usuario es responsable de validar el modelo en su propio contexto y de cumplir con las normativas aplicables.
- El modelo no es multimodal ni procesa lenguaje; es exclusivamente de visión por computadora, por lo que no soporta tareas de texto ni interacción conversacional.

## Enlaces

- [HuggingFace - kaushik3009/industrial-vision-agent](https://huggingface.co/kaushik3009/industrial-vision-agent)
- [GitHub - kaushik-3009/industrial-vision-agent](https://github.com/kaushik-3009/industrial-vision-agent)
