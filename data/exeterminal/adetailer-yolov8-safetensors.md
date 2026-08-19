# exeterminal/adetailer-yolov8-safetensors

## Resumen
Este repositorio contiene detectores YOLOv8 de caras y manos, originalmente distribuidos por el proyecto [Bingsu/adetailer](https://huggingface.co/Bingsu/adetailer), reempaquetados en formato `.safetensors` para que puedan cargarse directamente en [stable-diffusion.cpp](https://github.com/leejet/stable-diffusion.cpp) mediante el argumento `--ad-model`. Los archivos `.pt` originales usan un formato pickle de Torch que stable-diffusion.cpp no puede leer; estos `.safetensors` contienen los mismos pesos, convertidos con el script `convert_yolov8_to_safetensors.py` incluido en el propio stable-diffusion.cpp.

El modelo no es un LLM ni un generador de imágenes, sino un detector de objetos de pequeño tamaño pensado para el paso ADetailer (after-detailer) en flujos de generación de imágenes con Stable Diffusion. Se ofrecen tres variantes: `face_yolov8n.safetensors` (nano), `face_yolov8s.safetensors` (small, más fiable) y `hand_yolov8n.safetensors` (nano). Los pesos son idénticos a los originales; solo cambia el contenedor. El autor es `exeterminal`, y el repositorio se utiliza en el catálogo de modelos de Exe AI Terminal. La licencia es AGPL-3.0.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8 (CNN de deteccion de objetos) |
| Parametros totales | no disponible (variantes nano y small de YOLOv8, sin cifras exactas) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (los archivos son safetensors, no se especifica cuantizacion) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
Los modelos son detectores YOLOv8, una arquitectura de red neuronal convolucional (CNN) de una sola etapa diseñada para deteccion de objetos en tiempo real. YOLOv8 se compone de un backbone (CSPDarknet) y una cabeza de deteccion con anclas. Los pesos incluidos son los originales del proyecto Bingsu/adetailer, que a su vez se basan en los modelos preentrenados de Ultralytics YOLOv8. No se ha realizado ningun entrenamiento adicional; solo se ha convertido el formato de `.pt` (pickle de Torch) a `.safetensors` para compatibilidad con stable-diffusion.cpp. No se dispone de informacion sobre el dataset de entrenamiento, el numero de epocas ni las tecnicas de optimizacion empleadas.

## Capacidades
- Deteccion de caras en imagenes (variantes nano y small).
- Deteccion de manos en imagenes (variante nano).
- Disenado especificamente para el paso ADetailer en pipelines de Stable Diffusion, permitiendo refinar regiones detectadas (caras, manos) en imagenes generadas.
- Compatible con stable-diffusion.cpp a traves del parametro `--ad-model`.
- No incluye capacidades de generacion de texto, tool calling, razonamiento, ni soporte multimodal mas alla de la deteccion de objetos.

## Casos de uso
- Refinado de caras en imagenes generadas por Stable Diffusion: tras generar una imagen, el detector localiza las caras y permite aplicar un paso de "after-detailer" para mejorar la calidad facial (por ejemplo, con un modelo de inpainting o upscaling).
- Correccion de manos en imagenes generadas: la deteccion de manos permite aplicar un paso de detalle especifico para arreglar deformidades comunes en manos generadas por IA.
- Integracion en pipelines de stable-diffusion.cpp: al usar el formato safetensors, se puede cargar directamente en este motor sin necesidad de convertir los pesos manualmente, simplificando el flujo de trabajo en entornos de generacion local.
- Uso en interfaces graficas como ComfyUI o A1111 (via extension ADetailer) para automatizar el refinado de regiones en generacion por lotes.
- Desarrollo de aplicaciones de edicion fotografica que requieran detectar caras o manos para aplicar filtros o ajustes selectivos.
- Investigacion en deteccion de objetos en imagenes artisticas o sinteticas, aprovechando la ligereza de los modelos nano para pruebas rapidas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. Los archivos son una conversion directa de los pesos originales de Bingsu/adetailer, por lo que el rendimiento esperado es identico al de los modelos YOLOv8n y YOLOv8s originales, pero no se proporcionan metricas concretas (mAP, precision, recall, etc.) en este repositorio.

## Requisitos de hardware
- No se proporcionan requisitos oficiales en la informacion disponible.
- Dado que son modelos YOLOv8 nano y small, se espera que puedan ejecutarse en CPU con un consumo de memoria modesto (del orden de cientos de MB en RAM), aunque no hay cifras confirmadas.
- En GPU, cualquier tarjeta con al menos 2 GB de VRAM deberia ser suficiente para inferencia, pero no se especifica.
- Para su uso con stable-diffusion.cpp, el requisito principal es que el motor tenga soporte para cargar modelos safetensors de deteccion (via `--ad-model`).
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares
| Modelo | Arquitectura | Formato | Licencia | Compatibilidad |
|---|---|---|---|---|
| exeterminal/adetailer-yolov8-safetensors | YOLOv8 (nano/small) | safetensors | AGPL-3.0 | stable-diffusion.cpp |
| Bingsu/adetailer (original) | YOLOv8 (nano/small) | .pt (Torch pickle) | AGPL-3.0 | A1111, ComfyUI, etc. |
| Ultralytics YOLOv8 | YOLOv8 (varias escalas) | .pt, .onnx, .tflite | AGPL-3.0 | Multiplataforma |

La principal diferencia es el formato de los pesos: este repositorio ofrece los mismos detectores en safetensors, lo que los hace directamente utilizables en stable-diffusion.cpp sin conversion previa. El rendimiento de deteccion es identico al de los modelos originales de Bingsu, ya que los pesos no se han modificado.

## Limitaciones y advertencias
- Licencia AGPL-3.0: cualquier uso comercial o distribucion derivada debe cumplir con los terminos de esta licencia, que exigen la publicacion del codigo fuente de las modificaciones si se distribuye el software.
- No es un modelo de lenguaje: no puede generar texto, razonar ni mantener conversaciones.
- Solo detecta caras y manos; no es un detector general de objetos ni segmentador.
- Los pesos son los originales de Bingsu/adetailer; no se han afinado para dominios especificos.
- La variante nano puede tener menor precision que la small, especialmente en imagenes con caras pequenas o parcialmente ocluidas.
- No se proporcionan garantias de rendimiento ni soporte tecnico por parte del autor.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un proyecto reciente o poco utilizado.

## Enlaces
- Repositorio de HuggingFace: https://huggingface.co/exeterminal/adetailer-yolov8-safetensors
- Proyecto original Bingsu/adetailer: https://huggingface.co/Bingsu/adetailer
- Script de conversion en stable-diffusion.cpp: https://github.com/RobertBeckebans/AI_stable-diffusion.cpp/blob/master/scripts/convert_yolov8_to_safetensors.py
- Repositorio de Ultralytics YOLOv8: https://github.com/ultralytics/yolov8
- Documentacion de safetensors: https://huggingface.co/docs/safetensors/index
