# AXERA-TECH/yoloe-26n-seg

## Resumen

El modelo `AXERA-TECH/yoloe-26n-seg` es un modelo de segmentación de imágenes basado en la arquitectura YOLO26, publicado por AXERA-TECH en Hugging Face bajo licencia Apache 2.0. Se trata de una variante "nano" (indicada por la "n" en el nombre) orientada a tareas de segmentación de instancias o panóptica, aunque no se dispone de especificaciones técnicas detalladas en la ficha pública. El repositorio está vacío de contenido en su model card, salvo la licencia, y no se han registrado descargas ni valoraciones.

La relevancia de este modelo radica en su pertenencia a la familia YOLO26, que incorpora mejoras en eficiencia y precisión respecto a generaciones anteriores. AXERA-TECH, una empresa especializada en soluciones de cuantización para chips de IA, ha publicado este modelo como parte de su ecosistema de herramientas QAT.Ultralytics, lo que sugiere un enfoque en despliegue en hardware de borde. No obstante, la falta de documentación pública limita la evaluación de sus capacidades reales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26 (segmentación), variante nano |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible (se infiere soporte INT8/QAT por el proyecto AXERA-TECH) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (posiblemente safetensors o PyTorch) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo en la model card de Hugging Face. Por el nombre y la referencia al proyecto YOLO26, se trata presumiblemente de una red neuronal convolucional basada en la familia YOLO, con una cabeza de segmentación que produce máscaras por píxel. La variante "nano" suele implicar una versión reducida en número de parámetros y operaciones, optimizada para inferencia rápida en dispositivos con recursos limitados.

El proyecto QAT.Ultralytics de AXERA-TECH, mencionado en los resultados de búsqueda, indica que el modelo puede estar diseñado para cuantización de enteros (INT8) mediante Quantization-Aware Training (QAT), pensado para su despliegue en chips de la propia empresa. Sin embargo, no se dispone de datos sobre el conjunto de entrenamiento, número de tokens (en su caso píxeles), ni técnicas de optimización adicionales.

## Capacidades

- Segmentación de imágenes: el modelo está diseñado para tareas de segmentación, lo que implica la clasificación de cada píxel en categorías o instancias. No se especifica si se trata de segmentación semántica, de instancias o panóptica.
- Inferencia eficiente: la variante nano sugiere un bajo coste computacional, adecuado para aplicaciones en tiempo real o en dispositivos de borde.
- Posible soporte para cuantización: dado el contexto de AXERA-TECH, es probable que el modelo acepte cuantización INT8, aunque no está confirmado en la documentación.
- No se han documentado capacidades como generación de texto, tool calling, agentes o multimodalidad. Es un modelo puramente visual.

## Casos de uso

- Inspección de calidad en manufactura: el modelo puede segmentar defectos en imágenes de productos, permitiendo identificar áreas problemáticas en líneas de producción automatizadas.
- Conducción autónoma y asistencia al conductor: la segmentación de carretera, vehículos y peatones es esencial para sistemas de percepción en tiempo real; su tamaño nano lo hace viable en hardware embarcado.
- Análisis de imágenes médicas: segmentación de estructuras anatómicas en radiografías o tomografías, aunque se requeriría validación clínica adicional.
- Agricultura de precisión: detección y segmentación de cultivos, malezas o plagas a partir de imágenes aéreas o de campo.
- Robótica y manipulación de objetos: segmentación de objetos para tareas de agarre y navegación en entornos industriales o domésticos.
- Vigilancia y seguridad: separación de personas y objetos en videovigilancia para análisis de comportamiento o conteo de personas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No es posible comparar su rendimiento con otros modelos sin datos oficiales.

## Requisitos de hardware

- VRAM estimada: no disponible. Dado el tamaño nano, se espera que sea inferior a 4 GB en FP32, pero no hay confirmación.
- GPU recomendadas: no disponible. Podría ejecutarse en GPUs de consumo como RTX 3060 o superiores, y en aceleradores de borde de AXERA-TECH.
- Compatibilidad con consumer GPU: probablemente sí, por su tamaño reducido, pero sin datos concretos no se puede afirmar.
- Opciones de despliegue: no se mencionan. Por el contexto, podría ser compatible con el framework Ultralytics y las herramientas QAT de AXERA-TECH, pero no hay documentación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. Otros modelos de segmentación como YOLOv8-seg o YOLO11-seg podrían ser comparables, pero no se conocen sus configuraciones exactas ni los resultados de este modelo en particular. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Falta de documentación: la model card no ofrece detalles técnicos, lo que dificulta su evaluación y uso en producción.
- Sin datos de entrenamiento: se desconoce el conjunto de datos utilizado, lo que impide valorar posibles sesgos o limitaciones de generalización.
- Sin benchmarks publicados: no se puede verificar su precisión frente a alternativas establecidas.
- Sin instrucciones de uso: no se proporciona código de ejemplo ni API de inferencia, lo que aumenta la barrera de adopción.
- Licencia Apache 2.0: permite uso comercial, pero al no haber garantías ni soporte, el usuario asume el riesgo.
- Posible dependencia de hardware específico: si el modelo está optimizado para chips de AXERA-TECH, su uso en otras plataformas podría requerir adaptaciones.

## Enlaces

- Hugging Face: https://huggingface.co/AXERA-TECH/yoloe-26n-seg
- Repositorio de archivos: https://huggingface.co/AXERA-TECH/yoloe-26n-seg/tree/main
- Modelo relacionado (sin detalles): https://huggingface.co/AXERA-TECH/yolo26-seg
- Proyecto QAT.Ultralytics (config YAML): https://github.com/AXERA-TECH/QAT.Ultralytics/blob/main/ultralytics/cfg/models/26/yoloe-26-seg.yaml
- Plataforma Ultralytics (modelo de Nicholas Brown): https://platform.ultralytics.com/nicholas-brown/seg/yoloe-26n-seg
- Plataforma Ultralytics (modelo de Lorraine Lyu): https://platform.ultralytics.com/lorraine-lyu/yolo26/yolo26n-seg
