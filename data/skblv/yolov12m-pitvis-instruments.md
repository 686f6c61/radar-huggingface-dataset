# skblv/yolov12m-pitvis-instruments

## Resumen

El modelo `skblv/yolov12m-pitvis-instruments` es un detector de objetos basado en YOLOv12-m, entrenado de forma supervisada para reconocer los 18 instrumentos quirúrgicos definidos en el dataset PitVis-2023. El modelo se evalúa como clasificación multi-etiqueta (presencia de instrumentos) sobre el split de validación completo, alcanzando un 82,78 % de exact match y un 82,75 % de micro-F1 (intervalos de confianza bootstrap del 95 %). El detector se integra en un leaderboard de comprensión de vídeo quirúrgico desarrollado por SDSC × Chicago Booth, y se distribuye bajo licencia AGPL-3.0.

La arquitectura subyacente es YOLOv12, un modelo de detección de una etapa con atención centrada en la atención, que mejora el rendimiento frente a YOLOv8/9 y compite con detectores basados en DETR. El tamaño concreto es `yolov12m` (la variante media). Aunque el modelo se publica como baseline de investigación, su propósito es la detección de instrumentos en vídeo quirúrgico, un dominio con aplicaciones potenciales en análisis de procedimientos, formación y anotación automática. No se proporcionan detalles sobre el entrenamiento, los datos o el número de parámetros.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv12-m (attention-centric, detección de una etapa) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin soporte de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | no disponible (probablemente Ultralytics .pt, no especificado) |

## Arquitectura y entrenamiento

YOLOv12 es una arquitectura de detección de objetos de una etapa que incorpora mecanismos de atención en lugar de los bloques convolucionales tradicionales de versiones anteriores. Según los resultados de la búsqueda, YOLOv12 supera a RT-DETR y RT-DETRv2 en velocidad y eficiencia, manteniendo un alto rendimiento. La variante `yolov12m` es la de tamaño medio dentro de la familia.

El modelo fue entrenado de forma supervisada sobre el dataset PitVis-2023, que incluye 18 instrumentos quirúrgicos. La evaluación se realizó como presencia multi-etiqueta (no solo detección de cajas), y se reportan exact match y micro-F1. No se proporcionan datos sobre el número de imágenes, el esquema de entrenamiento (épocas, optimizador, etc.) ni si se aplicaron técnicas de aumento de datos.

## Capacidades

- Detección y clasificación de instrumentos quirúrgicos en imágenes o frames de vídeo.
- Soporta múltiples clases (18 instrumentos distintos).
- Inferencia en tiempo real gracias a la arquitectura YOLOv12, adecuada para análisis de vídeo.
- No soporta tool calling, agentes ni razonamiento multi-paso (es un modelo puramente visual).
- No tiene capacidades de lenguaje ni multimodales (solo visión).
- No se ha documentado soporte para tracking de objetos, aunque podría integrarse con algoritmos externos.

## Casos de uso

- Análisis de vídeos quirúrgicos para investigación: el modelo puede procesar grabaciones de cirugías y detectar la presencia de instrumentos, facilitando estudios sobre la eficiencia del quirófano o el uso de herramientas.
- Formación de cirujanos: se puede usar para generar anotaciones automáticas en vídeos educativos, señalando qué instrumento se está utilizando en cada momento.
- Monitorización de procedimientos: en entornos quirúrgicos, el modelo puede ayudar a verificar que se usan los instrumentos correctos según el protocolo.
- Anotación de bases de datos médicas: como herramienta de pre-anotación para crear datasets de detección de instrumentos, reduciendo el trabajo manual.
- Evaluación de técnicas quirúrgicas: permite comparar la secuencia de instrumentos en diferentes cirugías, ayudando a identificar variaciones en la práctica.
- Integración en pipelines de análisis de vídeo: al ser un modelo de detección, puede combinarse con sistemas de seguimiento o de análisis de comportamiento para obtener métricas de uso de instrumentos.

## Benchmarks y rendimiento

Según la model card, los resultados sobre el split de validación completo de PitVis-2023 (95 % bootstrap CI) son:

| Metrica | Valor |
|---|---|
| Exact match | 82,78 % (82,36–83,20) |
| Micro-averaged F1 | 82,75 % (82,32–83,20) |

No se han publicado comparaciones con otros modelos de detección de instrumentos quirúrgicos en la información disponible.

## Requisitos de hardware

No se especifican requisitos de hardware en la documentación proporcionada. Al ser un modelo YOLOv12-m, se puede inferir que es adecuado para GPU consumer con al menos 8 GB de VRAM para inferencia a 30 FPS, pero no se puede confirmar sin datos oficiales. Opciones de despliegue habituales para modelos Ultralytics incluyen:

- Python con la librería `ultralytics` (CPU/GPU).
- Exportación a ONNX, TensorRT o CoreML para despliegue en producción.
- Uso con `vLLM` o `TGI` no es aplicable (no es un modelo de lenguaje).

Se recomienda probar el modelo en un entorno local con GPU para medir la latencia real.

## Comparativa con modelos similares

No se dispone de comparativas con otros modelos de detección de instrumentos quirúrgicos en la información proporcionada. La arquitectura YOLOv12 se ha comparado en el paper original con RT-DETR y otros detectores, pero no se incluyen datos específicos para este modelo entrenado.

## Limitaciones y advertencias

- El modelo es un baseline de investigación, no un dispositivo médico. No debe usarse en decisiones clínicas.
- La licencia AGPL-3.0 impone restricciones para uso comercial: cualquier distribución o servicio que lo utilice debe liberar el código fuente bajo la misma licencia.
- Solo está entrenado para los 18 instrumentos de PitVis-2023; no generaliza a otros instrumentos o contextos quirúrgicos.
- No se han evaluado sesgos específicos en la información disponible; podría tener errores en condiciones de baja iluminación o con instrumentos parcialmente ocultos.
- La evaluación se realizó en el split de validación del mismo dataset, por lo que el rendimiento en datos fuera de distribución no está garantizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skblv/yolov12m-pitvis-instruments
- Leaderboard de vídeo quirúrgico SDSC × Chicago Booth: https://github.com/skblv/neurosurgery-video-eval-website
- Repositorio oficial de YOLOv12 (paper NeurIPS 2025): https://github.com/sunsmarterjie/yolov12
- Documentación de Ultralytics YOLO12: https://docs.ultralytics.com/models/yolo12
