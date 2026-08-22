# f4m1/plant-disease-detector-12

## Resumen

El modelo `f4m1/plant-disease-detector-12` es un detector de objetos basado en YOLO11s, desarrollado por el usuario f4m1, que identifica doce clases de enfermedades vegetales a partir de imágenes de hojas. Se trata de un checkpoint congelado diseñado para integrarse en una API de diagnóstico de plantas, donde un clasificador complementario proporciona la identidad del cultivo y el detector se encarga de la enfermedad de forma independiente. El modelo está entrenado con imágenes heterogéneas de fuentes públicas y de campo, y se distribuye bajo la librería Ultralytics.

La relevancia actual radica en la necesidad de herramientas de diagnóstico agrícola automatizado que funcionen en entornos reales, con variabilidad de iluminación, fondo y estadio de la enfermedad. El modelo ofrece una arquitectura ligera (YOLO11s) que permite inferencia en dispositivos con recursos limitados, aunque no se han publicado pesos en el repositorio, lo que limita su uso inmediato.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11s (CNN de una sola etapa) |
| Parametros totales | no disponible (arquitectura YOLO11s, típicamente ~9.4 M, no confirmado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | no disponible (no se especifica; probablemente pesos en FP32) |
| Idiomas soportados | no disponibles (modelo visual) |
| Licencia | no disponible |
| Formato de pesos | no disponible (se menciona `best.pt`, pero el repositorio tiene tamaño 0.0 GB, parece vacío) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLO11s, una variante de la familia YOLO (You Only Look Once) de detección de objetos en una sola pasada. Se trata de una red neuronal convolucional que divide la imagen en una cuadrícula y predice cajas delimitadoras y clases de forma simultánea. En este caso, la cabeza de detección está entrenada para reconocer doce clases de enfermedades: oídio, tizón temprano, tizón tardío, mancha foliar, mancha bacteriana, tizón de fitóftora, roya foliar, roya del tallo, roya rayada, mancha de septoria, fusariosis de la espiga y mildiu velloso.

El entrenamiento se realizó sobre un conjunto heterogéneo de imágenes públicas y de campo, sin que se especifique la composición exacta del dataset ni el número de épocas o tokens (en este caso píxeles). No se mencionan técnicas de refuerzo (RLHF/DPO) ni innovaciones particulares más allá de las inherentes a YOLO11. El autor indica que es un modelo de investigación y que las predicciones no constituyen un diagnóstico profesional.

## Capacidades

- Detección de 12 tipos de enfermedades vegetales en imágenes de hojas, independientemente de la especie del cultivo.
- Inferencia en tiempo real con tamaño de imagen 640x640 píxeles, confianza mínima 0.20 e IoU 0.70 (valores por defecto de la API).
- Detección de múltiples objetos por imagen (hasta 300 detecciones).
- Compatible con la biblioteca Ultralytics, permitiendo integración en pipelines de Python.
- No soporta generación de texto, tool calling, agentes ni razonamiento multimodal más allá de visión.
- Capacidades multilingües no aplicables al ser un modelo puramente visual.

## Casos de uso

- Monitorización de cultivos en campo: se puede desplegar en drones o cámaras fijas para detectar enfermedades en tiempo real, enviando alertas a agricultores cuando se supera un umbral de confianza.
- Sistema de diagnóstico en aplicaciones móviles: el modelo puede integrarse en una app que el usuario fotografía una hoja y recibe la enfermedad probable, junto con recomendaciones de tratamiento (usando el clasificador de cultivo complementario).
- Automatización de inspección en invernaderos: la detección temprana de patógenos como oídio o tizón permite aislar plantas infectadas y reducir la propagación.
- Investigación agronómica: análisis de grandes volúmenes de imágenes para estudiar la prevalencia de enfermedades en distintas regiones o variedades.
- Integración en sistemas de recomendación de fitosanitarios: combinado con un clasificador de cultivo, sugiere el tratamiento adecuado según la enfermedad detectada.
- Control de calidad en producción de semillas o plantas ornamentales: detección de hojas enfermas en líneas de inspección automatizadas.

## Benchmarks y rendimiento

Según la model card del autor, en un split de test agrupado y con configuración de evaluación estándar, se obtuvieron los siguientes resultados:

| Metrica | Valor |
|---|---|
| Precision | 0.6743 |
| Recall | 0.6050 |
| mAP50 | 0.6277 |
| mAP50-95 | 0.4613 |

Además, un barrido de inferencia con confianza 0.20 e IoU 0.70 produjo un recall de 0.6568 y un mAP50 de 0.6329. Estos valores son moderados, indicando que el modelo tiene margen de mejora, especialmente en clases de enfermedad poco representadas.

## Requisitos de hardware

- Al ser un modelo YOLO11s, es relativamente ligero. Se estima que puede ejecutarse en GPUs con al menos 2 GB de VRAM en FP16, aunque no se ha confirmado.
- GPU recomendadas: NVIDIA GTX 1060 o superior, RTX 2080, A100, etc. Para inferencia en tiempo real en campo, se pueden usar Jetson Nano o similares.
- Es probable que quepa en tarjetas de consumo (RTX 3060, RTX 4090) y en sistemas embebidos con soporte CUDA.
- Opciones de despliegue: se puede usar directamente con Ultralytics (`YOLO("best.pt")`), exportar a ONNX o TensorRT para aceleración, o servir mediante API REST con frameworks como FastAPI.
- No se proporcionan datos de latencia ni throughput específicos; en una GPU moderna, la inferencia a 640x640 suele ser inferior a 50 ms.

## Comparativa con modelos similares

No se dispone de datos comparativos de otros modelos de detección de enfermedades de plantas con las mismas condiciones de entrenamiento. Existen otros proyectos como `prince12raj/plant-disease-detector` basado en PlantVillage, o `sanjanabhat846/AgriSense-AI` que usa EfficientNetB0, pero no se pueden comparar directamente por diferencias en dataset, clases y métricas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Es un modelo de investigación con rendimiento variable según la clase de enfermedad y el dominio de imagen (campo vs. laboratorio).
- No constituye un diagnóstico profesional; las predicciones deben ser interpretadas por agrónomos o expertos.
- El repositorio de HuggingFace parece vacío (tamaño 0.0 GB), por lo que no se han publicado los pesos `best.pt` accesibles; el usuario debe obtenerlos de otra fuente o entrenar el modelo.
- La licencia no está definida, lo que impide el uso comercial sin permiso explícito.
- No se especifica el origen exacto de los datos de entrenamiento, lo que genera incertidumbre sobre posibles sesgos en la representación de ciertos cultivos o condiciones.
- La precisión y recall son moderados; en aplicaciones críticas se recomienda un umbral de confianza más alto y validación humana.

## Enlaces

- [HuggingFace del modelo](https://huggingface.co/f4m1/plant-disease-detector-12)
- [Modelo clasificador de cultivo complementario (f4m1/plant-classifier-39)](https://huggingface.co/f4m1/plant-classifier-39)
- [Space de ejemplo de detección de enfermedades (prince12raj)](https://huggingface.co/spaces/prince12raj/plant-disease-detector)
- [Artículo científico sobre diagnóstico de enfermedades en plantas con CNN (Nature)](https://www.nature.com/articles/s41598-025-34681-1)
- [Aplicación web de detección de enfermedades (GitHub arpit0891)](https://github.com/arpit0891/Plant-Disease-Detection-Web-application)
- [AgriSense AI (GitHub sanjanabhat846)](https://github.com/sanjanabhat846/AgriSense-AI/tree/main)
