# michel4j/mxsamples

## Resumen

El modelo `michel4j/mxsamples` es un detector de objetos basado en Ultralytics YOLOv26, entrenado específicamente para la alineación de muestras en cristalografía macromolecular. Desarrollado por Stuart Read, Denis Spasyuk, Michel Fodje y Thiru Arunachalam, con financiación de Canadian Light Source, Inc., el modelo identifica pines, loops y cristales en imágenes de muestras montadas en líneas de luz (beamlines). Su propósito principal es automatizar el proceso de centrado y alineación de cristales antes de la recogida de datos de difracción, un paso crítico en experimentos de sincrotrón.

El modelo se distribuye en formato PyTorch y está diseñado para integrarse con el paquete `ai-center`, una herramienta de inferencia para beamlines. Aunque no se publican detalles sobre el número de parámetros ni la arquitectura interna más allá de la familia YOLO, su tamaño de repositorio (0.0 GB) sugiere un modelo compacto, adecuado para despliegue en entornos de inferencia en tiempo real. La licencia AGPL-3.0 permite su uso, modificación y redistribución, pero impone obligaciones de copyleft para servicios en red.

La relevancia de este modelo radica en su especialización: la detección automática de componentes de muestras cristalográficas reduce la intervención manual y acelera los flujos de trabajo en instalaciones de luz sincrotrón, donde la precisión y la velocidad son esenciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ultralytics YOLOv26 (red neuronal convolucional de deteccion de objetos) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | GNU Affero General Public License v3.0 (AGPL-3.0) |
| Formato de pesos | PyTorch (formato nativo de Ultralytics; no se especifica si safetensors o pickle) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia YOLO (You Only Look Once), arquitectura de detección de objetos en una sola pasada basada en redes neuronales convolucionales. YOLOv26 es la versión más reciente de Ultralytics, que incorpora mejoras en eficiencia y precisión respecto a generaciones anteriores, como el uso de cabezeras de detección más ligeras y técnicas de aumento de datos avanzadas. No se dispone de información sobre el número exacto de capas, el tamaño de entrada ni el backbone específico.

El entrenamiento se realizó con capturas de video de imágenes provenientes de líneas de luz de cristalografía macromolecular (MX Beamlines). El conjunto de datos incluye fotogramas de muestras montadas en pines, con loops y cristales visibles. No se indican el número de imágenes, el número de épocas ni si se aplicaron técnicas de aumento de datos adicionales. Tampoco hay evidencia de entrenamiento con refuerzo o ajuste fino por preferencias humanas (RLHF/DPO), dado que es un modelo de visión supervisado de forma clásica.

## Capacidades

- Detección de objetos específicos en imágenes: identifica pines, loops y cristales en fotografías de muestras de cristalografía macromolecular.
- Inferencia en tiempo real: gracias a la arquitectura YOLO, es capaz de procesar flujos de video o imágenes individuales con baja latencia, adecuado para sistemas de alineación automática.
- Integración con el ecosistema Ultralytics: compatible con el stack de Ultralytics para entrenamiento, validación y exportación a otros formatos (ONNX, TensorRT, etc.), aunque no se documenta explícitamente.
- Uso con el paquete `ai-center`: el modelo está diseñado para funcionar con la herramienta de inferencia para beamlines disponible en PyPI, que permite conectar cámaras MJPEG y ejecutar la detección en vivo.
- No incluye capacidades de generación de texto, razonamiento, tool calling ni procesamiento de lenguaje natural.

## Casos de uso

- Alineación automática de muestras en líneas de luz: el modelo detecta la posición del cristal dentro del loop y del pin, permitiendo que el sistema de control del beamline centre automáticamente la muestra antes de la exposición a rayos X. Esto reduce el tiempo de alineación manual y aumenta el rendimiento de los experimentos.
- Control de calidad de montaje de muestras: antes de un experimento, se pueden capturar imágenes de las muestras montadas y verificar que el cristal esté correctamente posicionado en el loop, evitando fallos de recogida de datos.
- Monitorización en tiempo real de múltiples muestras: en instalaciones con alta capacidad de procesamiento, el modelo puede analizar secuencias de video de varias cámaras simultáneamente, detectando anomalías o muestras mal preparadas.
- Integración en pipelines de automatización de sincrotrón: mediante la API de `ai-center`, el modelo puede integrarse en sistemas de control existentes, enviando alertas o ajustando la posición del goniómetro en función de las detecciones.
- Entrenamiento de modelos personalizados: al estar basado en YOLOv26, los investigadores pueden utilizar el modelo como punto de partida para ajustar pesos con sus propios datos de muestras específicas (por ejemplo, diferentes tipos de cristales o condiciones de iluminación).
- Documentación y análisis retrospectivo: las detecciones pueden almacenarse junto con los metadatos de las imágenes para auditorías o estudios de optimización de protocolos de montaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como mAP, precisión, recall o comparaciones con otros detectores en el dominio de cristalografía. Tampoco hay datos sobre latencia o throughput en hardware específico.

## Requisitos de hardware

- No se especifican requisitos mínimos de VRAM ni GPU recomendadas en la documentación del modelo.
- Dado que es un modelo YOLO de tamaño compacto (repositorio de 0.0 GB), es plausible que pueda ejecutarse en GPUs de consumo como una NVIDIA RTX 3060 o superior, pero esta es una estimación no confirmada.
- El paquete `ai-center` se instala vía pip y probablemente requiere una GPU con soporte CUDA para inferencia en tiempo real, aunque no se documenta.
- Opciones de despliegue: el modelo es compatible con el stack de Ultralytics, por lo que puede exportarse a ONNX o TensorRT para optimización en edge devices. También puede ejecutarse con el propio paquete `ai-center` en un servidor con cámara MJPEG.
- No se dispone de datos de latencia o throughput medidos.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables específicos para detección de muestras cristalográficas en la información proporcionada. Modelos genéricos de detección de objetos como YOLOv8 o Faster R-CNN podrían adaptarse, pero no se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Sesgos del conjunto de datos: el modelo se entrenó con imágenes de líneas de luz específicas (probablemente las de Canadian Light Source), por lo que su rendimiento puede degradarse con muestras de otras instalaciones, condiciones de iluminación diferentes o tipos de cristales no representados.
- Riesgo de alucinación en detección: como todo detector, puede generar falsos positivos (detectar cristales donde no los hay) o falsos negativos, lo que podría provocar errores en la alineación automática. Se recomienda supervisión humana en entornos críticos.
- Alcance limitado: el modelo solo detecta tres clases (pin, loop, cristal). No reconoce otros componentes de la muestra ni realiza tareas de clasificación o segmentación.
- Licencia AGPL-3.0: cualquier uso del modelo en un servicio en red (por ejemplo, una API pública) obliga a distribuir el código fuente completo de la aplicación bajo la misma licencia. Esto puede ser restrictivo para integraciones comerciales cerradas.
- Sin documentación técnica detallada: no se publican hiperparámetros, tamaño de entrada, ni métricas de entrenamiento, lo que dificulta la reproducibilidad y la evaluación objetiva.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, lo que sugiere que es un proyecto reciente o poco difundido; no hay evidencia de validación externa.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/michel4j/mxsamples)
- [Paquete ai-center en PyPI](https://pypi.org/project/ai-center/)
- [Perfil de GitHub del autor (michel4j)](https://github.com/michel4j)
