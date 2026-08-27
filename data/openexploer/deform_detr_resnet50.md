# OpenExploer/deform_detr_resnet50

## Resumen

Deformable DETR (ResNet-50) es una implementación del detector de objetos Deformable DETR, publicada por el usuario OpenExploer en HuggingFace. Este modelo sustituye la atención global del DETR original por una atención deformable multi-escala: cada query muestrea un número reducido de puntos alrededor de puntos de referencia, lo que acelera la convergencia y reduce el coste computacional. La arquitectura combina un backbone ResNet-50 con un cuello ChannelMapperNeck y un transformador DeformableDetrTransformer de 6 capas de encoder y 6 de decoder, con 900 queries y 4 niveles de características.

La relevancia de este modelo radica en su orientación al despliegue en plataformas de inferencia embebida de Horizon Robotics (march J6M, J6P, J6B). La model card incluye métricas de precisión (mAP) y rendimiento (latencia, FPS, uso de memoria) para dichas configuraciones, lo que lo hace útil para desarrolladores que trabajan con hardware Horizon en aplicaciones de visión por computador en el edge. No se especifican el número total de parámetros, la licencia concreta (solo "other") ni el formato de pesos, por lo que parte de la información técnica habitual no está disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Deformable DETR con backbone ResNet-50, neck ChannelMapperNeck, transformador DeformableDetrTransformer (6 encoder + 6 decoder, embed_dim=256, num_heads=8, feedforward_dim=1024, num_feature_levels=4, num_queries=900) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no procesa texto) |
| Tipos de cuantizacion | no disponible (se mencionan modos "calibration", "qat", "hbm" en las métricas, pero no se detallan formatos) |
| Idiomas soportados | no disponible (modelo de detección de objetos, no lingüístico) |
| Licencia | other (no especificada) |
| Formato de pesos | no disponible (tamaño del repo: 2.4 GB) |

## Arquitectura y entrenamiento

El modelo sigue el diseño de Deformable DETR (Zhu et al., 2020). En lugar de la atención global del DETR original, utiliza atención deformable multi-escala: cada query solo atiende a un pequeño número de puntos de muestreo alrededor de puntos de referencia aprendidos, lo que reduce la complejidad computacional y acelera la convergencia. Se emplean cuatro niveles de características (procedentes de las etapas del ResNet-50) y 900 queries. El decoder refina progresivamente las cajas en cada capa, aunque el flag `with_box_refine=False` indica que no se usa refinamiento iterativo de cajas en este caso. La pérdida combina focal loss para clasificación, pérdida L1 para regresión de cajas y GIoU, con emparejamiento bipartito mediante HungarianMatcher y pérdida auxiliar en cada capa del decoder.

No se proporcionan detalles sobre el conjunto de datos de entrenamiento, el número de tokens (imágenes) ni el proceso de entrenamiento (RLHF, DPO, etc.). La model card indica que el modelo está entrenado para detección de objetos en 80 clases (COCO), pero no se especifica la procedencia de los pesos. La entrada es una imagen de tamaño 800×1332 píxeles y la salida son cajas de detección con puntuaciones de confianza.

## Capacidades

- Detección de objetos 2D: identifica y localiza objetos de 80 clases (COCO) en imágenes, devolviendo cajas delimitadoras y puntuaciones de confianza.
- Inferencia multi-escala: utiliza 4 niveles de características del backbone, lo que mejora la detección de objetos a diferentes escalas.
- Salida de hasta 900 queries, aunque en evaluación se seleccionan 300 cajas (`select_box_nums_for_evaluation=300`).
- Optimizado para despliegue en hardware Horizon (J6M, J6P, J6B) con métricas de rendimiento específicas.
- No soporta generación de texto, razonamiento, código, tool calling, agentes ni capacidades multimodales más allá de la visión.

## Casos de uso

- Vigilancia y seguridad perimetral: el modelo puede detectar personas, vehículos u objetos en tiempo real en cámaras de vigilancia, aprovechando su baja latencia en plataformas Horizon (144.84 ms en J6M, 78.02 ms en J6P).
- Inspección industrial automatizada: detección de defectos o piezas en líneas de producción mediante visión por computador, con despliegue en dispositivos embebidos de bajo consumo.
- Conteo y seguimiento de objetos en retail: análisis de afluencia de clientes o gestión de inventario mediante detección de productos en estanterías.
- Robótica móvil: detección de obstáculos o puntos de interés en entornos interiores, con inferencia local en hardware embebido.
- Vehículos autónomos y asistencia a la conducción: detección de peatones, señales u otros vehículos en tiempo real, aunque la latencia en J6M (144 ms) puede ser alta para aplicaciones críticas; J6P ofrece 78 ms.
- Prototipado rápido en edge AI: gracias a las métricas de rendimiento publicadas, los desarrolladores pueden evaluar rápidamente si el modelo cumple los requisitos de latencia y memoria en plataformas Horizon antes de integrarlo.

## Benchmarks y rendimiento

La model card proporciona métricas de precisión (mAP) y rendimiento para la configuración `march = March.NASH_M` (J6M). No se incluyen comparaciones con otros modelos.

| Metrica | float | calibration | qat | hbm |
|---|---|---|---|---|
| mAP | 0.4384 | 0.412 | 0.4526 | 0.4529 |

Rendimiento (medido con single-core eight-thread para FPS, single-core single-thread para latencia, y pico de uso de DDR para memoria):

| March | Latencia (ms) | FPS | Uso de memoria (MB) |
|---|---|---|---|
| J6M | 144.84 | 6.92 | 656.00 |
| J6P | 78.02 | 28.89 | 672.80 |
| J6B | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks en la información disponible más allá de estos datos.

## Requisitos de hardware

- El modelo está diseñado para ejecutarse en plataformas Horizon Robotics con march J6M, J6P o J6B (aunque J6B no tiene métricas publicadas).
- En J6M: latencia de 144.84 ms, 6.92 FPS, pico de memoria DDR de 656 MB.
- En J6P: latencia de 78.02 ms, 28.89 FPS, pico de memoria DDR de 672.8 MB.
- No se especifican requisitos de VRAM para GPUs convencionales (NVIDIA, AMD) ni si el modelo puede ejecutarse en ellas. El tamaño del repo (2.4 GB) sugiere que los pesos podrían caber en GPUs con 4 GB o más, pero no hay confirmación.
- Opciones de despliegue: la model card menciona el uso de HEAL (heal 0.0.2), hbdk4-compiler 4.11.11 y horizon_plugin_pytorch 3.3.10, lo que indica que el despliegue está pensado para el ecosistema Horizon. No se mencionan vLLM, llama.cpp, Ollama ni TGI (herramientas típicas para modelos de lenguaje, no aplicables aquí).

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. El modelo es una variante de Deformable DETR, que a su vez es una evolución del DETR original. Se podría comparar con el DETR-ResNet50 de Facebook (facebook/detr-resnet-50) o con la versión optimizada de Qualcomm (qualcomm/DETR-ResNet50), pero no se tienen métricas de rendimiento de esos modelos en las mismas condiciones. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- La licencia se indica como "other", sin especificar los términos exactos. No se puede confirmar si permite uso comercial o modificación.
- No se proporcionan detalles sobre el conjunto de entrenamiento, por lo que se desconocen posibles sesgos en las clases detectadas o en la distribución de imágenes.
- El modelo está optimizado para hardware Horizon; su ejecución en otras plataformas (GPU NVIDIA, CPU) no está documentada y podría requerir conversión o reentrenamiento.
- La latencia en J6M (144.84 ms) puede ser demasiado alta para aplicaciones en tiempo real estricto; J6P ofrece mejor rendimiento (78 ms) pero sigue siendo elevada para vídeo de alta frecuencia.
- No se especifican los tipos de cuantización soportados ni el formato de pesos, lo que dificulta la integración en otros frameworks.
- El modelo solo realiza detección de objetos; no tiene capacidades de segmentación, seguimiento ni otras tareas de visión.
- No se indica si el modelo ha sido sometido a pruebas de robustez frente a ataques adversarios o condiciones de iluminación variables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OpenExploer/deform_detr_resnet50
- Repositorio oficial de Deformable DETR: https://github.com/fundamentalvision/Deformable-DETR
- Paper original (arXiv): https://arxiv.org/abs/2010.04159
- DETR-ResNet50 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/detr_resnet50
- Modelo facebook/detr-resnet-50 en HuggingFace: https://huggingface.co/facebook/detr-resnet-50
- Modelo qualcomm/DETR-ResNet50 en HuggingFace: https://huggingface.co/qualcomm/DETR-ResNet50
