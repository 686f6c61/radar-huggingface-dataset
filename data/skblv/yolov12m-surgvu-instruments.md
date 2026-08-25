# skblv/yolov12m-surgvu-instruments

## Resumen

El modelo `skblv/yolov12m-surgvu-instruments` es un detector de objetos basado en YOLOv12-m, entrenado específicamente para reconocer los 17 instrumentos quirúrgicos definidos en el dataset SurgVU, un conjunto de más de 840 horas de video quirúrgico robótico con cerca de 18 millones de imágenes etiquetadas. El autor, `skblv`, lo describe como un detector supervisado y posteriormente evaluado como clasificación multi-etiqueta de presencia de instrumentos. El modelo forma parte del leaderboard de comprensión de video quirúrgico desarrollado por SDSC y Chicago Booth, y se distribuye bajo licencia AGPL-3.0.

La arquitectura se basa en YOLOv12, un detector de una sola etapa con mecanismos de atención que supera a versiones anteriores como YOLOv8 y a modelos end-to-end basados en DETR, según el artículo de NeurIPS 2025. Aunque el repositorio no contiene pesos descargables (tamaño 0.0 GB), la model card indica que es un detector de instrumentos quirúrgicos destinado a uso de investigación. No se especifican parámetros totales ni configuración detallada de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv12-m (detector de una etapa con atención) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | AGPL-3.0 |
| Formato de pesos | no disponible (no hay archivos en el repositorio) |

## Arquitectura y entrenamiento

YOLOv12 introduce mecanismos de atención en el cuello y la cabeza del detector, mejorando la eficiencia computacional respecto a modelos previos. Según el repositorio oficial, YOLOv12-S supera a RT-DETR-R18 con un 42% más de velocidad, un 36% de la computación y un 45% de los parámetros. El modelo `yolov12m-surgvu-instruments` se entrena de forma supervisada sobre el dataset SurgVU, que contiene videos de cirugía robótica con anotaciones de instrumentos. No se proporcionan detalles sobre el número de épocas, el optimizador ni la composición exacta del conjunto de entrenamiento. La evaluación se realiza sobre el conjunto de validación completo de SurgVU, reportando métricas de exactitud y F1.

## Capacidades

- Detección de objetos en imágenes y video, específicamente de 17 instrumentos quirúrgicos.
- Clasificación multi-etiqueta de presencia de instrumentos en cada fotograma.
- Puede procesar video endoscópico en tiempo real, dado que YOLOv12 está diseñado para detección de alta velocidad.
- No tiene capacidades de lenguaje, tool calling ni agentes.
- No es un modelo multimodal; solo procesa imágenes.

## Casos de uso

- **Investigación en comprensión de video quirúrgico**: como baseline para evaluar nuevas técnicas de detección de instrumentos, permitiendo comparar con otros modelos en el leaderboard de SurgVU.
- **Análisis de flujo de trabajo quirúrgico**: detectar qué instrumentos se utilizan en cada fase de una operación, ayudando a estudiar la progresión de la cirugía.
- **Entrenamiento de cirujanos**: en simulaciones, identificar si se usan los instrumentos correctos en el momento adecuado.
- **Optimización de recursos en quirófano**: monitorización automática de la disponibilidad de instrumentos durante la intervención.
- **Investigación académica en visión por computador**: como ejemplo de aplicación de YOLOv12 en un dominio especializado con datos de video.
- **Evaluación de modelos de detección**: al ser un baseline, permite medir la mejora de otros modelos más complejos en la misma tarea.

## Benchmarks y rendimiento

Según la model card, la evaluación sobre el conjunto de validación completo de SurgVU (intervalo de confianza bootstrap del 95%) es:

| Metrica | Valor |
|---|---|
| Exact match | 51,75% (50,97–52,51) |
| Micro-averaged F1 | 75,34% (74,87–75,82) |

No se proporcionan resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

No se especifican requisitos de hardware en la documentación. Sin embargo, al ser un modelo de detección de objetos de tamaño medio (la variante "m" de YOLOv12), se puede inferir que es ejecutable en GPUs de consumo medio. Para inferencia en tiempo real sobre video, se recomienda una GPU con al menos 8 GB de VRAM (por ejemplo, NVIDIA RTX 2080 o superior). Opciones de despliegue: se puede utilizar con la librería Ultralytics (PyTorch), o exportar a formato ONNX o TensorRT para producción. No hay datos de latencia o throughput.

## Comparativa con modelos similares

No disponible. No se proporcionan comparaciones directas con otros detectores de instrumentos quirúrgicos en la información suministrada.

## Limitaciones y advertencias

- Es un modelo de investigación y no está validado como dispositivo médico. No debe utilizarse para decisiones clínicas.
- Los datos de entrenamiento provienen de cirugías robóticas sobre modelo porcino, lo que puede limitar su generalización a cirugías humanas o entornos no robóticos.
- La licencia AGPL-3.0 obliga a que cualquier uso o modificación del modelo se distribuya bajo la misma licencia si se ofrece como servicio en red, lo que puede ser restrictivo para aplicaciones comerciales.
- No se incluyen pesos en el repositorio, por lo que no es posible usar el modelo directamente sin acceso a los archivos del autor.
- No se han documentado sesgos específicos, pero el conjunto de datos está limitado a un tipo de cirugía y equipo quirúrgico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skblv/yolov12m-surgvu-instruments
- Dataset SurgVU (GitHub): https://github.com/isi-challenges/surgVU-dataset
- Repositorio oficial de YOLOv12 (GitHub): https://github.com/sunsmarterjie/yolov12
- Desafío Surgical Visual Understanding (Grand Challenge): https://surgvu25.grand-challenge.org/
