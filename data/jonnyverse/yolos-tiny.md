# JONNYVERSE/yolos-tiny

## Resumen

JONNYVERSE/yolos-tiny es una conversión a formato ONNX del modelo de detección de objetos hustvl/yolos-tiny, realizada para que sea compatible con la librería Transformers.js de Hugging Face. Esto permite ejecutar el modelo directamente en el navegador o en entornos Node.js sin necesidad de un backend de Python, lo que facilita el despliegue de aplicaciones de visión por computador en el lado del cliente.

El modelo original, yolos-tiny, es una versión reducida de YOLOS, un detector de objetos basado en Vision Transformer (ViT) entrenado con la pérdida de DETR. A pesar de su pequeño tamaño, ofrece un equilibrio entre velocidad y precisión, alcanzando 28.7 AP en la validación de COCO, frente a los 42 AP del modelo base. Esta conversión ONNX mantiene las mismas capacidades de detección, pero en un formato optimizado para inferencia en JavaScript.

La relevancia de este modelo radica en su idoneidad para aplicaciones web y móviles donde se requiere detección de objetos en tiempo real con recursos limitados, sin depender de servidores externos. Al ser un modelo tiny, su huella de memoria es reducida (menos de 2 GB para una imagen), lo que lo hace accesible incluso en dispositivos de gama baja.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) con cabezal de detección DETR |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (modelo de visión, entrada de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | no disponible (el modelo base hustvl/yolos-tiny usa Apache-2.0) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo base yolos-tiny es un Vision Transformer (ViT) de tamaño reducido, entrenado específicamente para detección de objetos mediante la pérdida de DETR (Detection Transformer). A diferencia de los detectores basados en CNN como YOLO, YOLOS trata la imagen como una secuencia de parches y utiliza mecanismos de atención para localizar objetos, lo que simplifica el pipeline al eliminar la necesidad de anclas o propuestas.

La conversión a ONNX realizada por JONNYVERSE no modifica la arquitectura ni los pesos del modelo original; únicamente transforma los pesos a formato ONNX para que puedan ser cargados por Transformers.js. El modelo original fue entrenado en el dataset COCO, como se deduce de los resultados de validación mencionados en fuentes externas. No se dispone de información adicional sobre el proceso de entrenamiento, como el número de tokens o el uso de técnicas de RLHF, ya que no se incluye en la documentación del repositorio.

## Capacidades

- Detección de objetos en imágenes: identifica múltiples objetos y devuelve bounding boxes, etiquetas y puntuaciones de confianza.
- Inferencia en el navegador y Node.js gracias a Transformers.js, sin necesidad de servidor.
- Modelo ligero, adecuado para dispositivos con recursos limitados (CPU, memoria reducida).
- Soporte para procesamiento por lotes de imágenes, aunque el rendimiento depende de la resolución y el tamaño del lote.
- No incluye capacidades de lenguaje, visión por computador únicamente.

## Casos de uso

- **Detección de objetos en tiempo real en aplicaciones web**: al ejecutarse en el navegador, permite analizar vídeo o imágenes de la cámara sin enviar datos a un servidor, lo que reduce latencia y preserva la privacidad del usuario.
- **Prototipado rápido de sistemas de visión**: los desarrolladores pueden integrar la detección de objetos en proyectos JavaScript con pocas líneas de código, gracias a la API de Transformers.js.
- **Aplicaciones móviles híbridas**: mediante frameworks como React Native o Ionic, se puede desplegar el modelo en dispositivos móviles para tareas como conteo de objetos o asistencia visual.
- **Automatización de control de calidad en entornos industriales**: el modelo puede ejecutarse en dispositivos edge (Raspberry Pi, Jetson Nano) para inspeccionar productos en líneas de fabricación, detectando defectos o piezas ausentes.
- **Análisis de imágenes en aplicaciones de accesibilidad**: por ejemplo, describir objetos en una escena para personas con discapacidad visual, todo en el cliente.
- **Filtrado de contenido en plataformas sociales**: detectar objetos no deseados (armas, contenido explícito) en imágenes subidas por usuarios, directamente en el navegador antes de la subida.

## Benchmarks y rendimiento

Según la información recopilada de fuentes externas, el modelo yolos-tiny alcanza un AP (Average Precision) de 28.7 en el conjunto de validación de COCO, mientras que el modelo base yolos (yolos-base) logra 42 AP. No se dispone de otros benchmarks (como mAP, FPS, etc.) en la información proporcionada.

| Modelo | AP en COCO validation |
|---|---|
| yolos-tiny | 28.7 |
| yolos-base | 42.0 |

## Requisitos de hardware

- **VRAM estimada**: menos de 2 GB para inferencia de una sola imagen, según fuentes externas. El consumo real depende de la resolución de entrada y del tamaño del lote.
- **GPU recomendada**: no es necesaria; el modelo puede ejecutarse en CPU. En caso de usar GPU, cualquier GPU con al menos 2 GB de VRAM es suficiente.
- **Compatibilidad con GPU de consumo**: sí, funciona en tarjetas como GTX 1050 Ti, RTX 2060, etc., aunque no se requiere para un uso básico.
- **Opciones de despliegue**: Transformers.js (navegador o Node.js), ONNX Runtime Web, o cualquier runtime compatible con ONNX.
- **Latencia y throughput**: no se dispone de datos concretos, pero al ser un modelo tiny, se espera una latencia de decenas de milisegundos en CPU moderna para una imagen de 320x320 píxeles.

## Comparativa con modelos similares

La comparativa se realiza con el modelo base yolos, ya que es la referencia directa. No se dispone de datos de otros modelos pequeños de detección (como SSD-Lite o EfficientDet-Lite) en la información proporcionada.

| Modelo | Parámetros | AP COCO | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| yolos-tiny (ONNX) | no disponible | 28.7 | no disponible | no disponible (base: Apache-2.0) | ONNX |
| yolos-base | no disponible | 42.0 | no disponible | Apache-2.0 | PyTorch |

## Limitaciones y advertencias

- **Precisión reducida**: el modelo tiny sacrifica precisión frente al modelo base (28.7 AP vs 42 AP), por lo que no es adecuado para aplicaciones que requieran alta exactitud.
- **Sesgos del dataset**: al estar entrenado en COCO, puede presentar sesgos hacia las categorías y contextos presentes en ese dataset, con menor rendimiento en escenarios no representados.
- **Alucinación en detección**: como cualquier modelo de detección, puede generar falsos positivos o bounding boxes imprecisos, especialmente en imágenes con oclusiones o baja iluminación.
- **Licencia incierta**: el repositorio no especifica la licencia de los pesos ONNX, aunque el modelo base usa Apache-2.0. Se recomienda verificar antes de un uso comercial.
- **Limitaciones de contexto**: al ser un modelo de visión, no procesa texto; su entrada es una imagen, y el tamaño máximo de entrada no está documentado en el repositorio.
- **Dependencia de Transformers.js**: el modelo está optimizado para esa librería; su uso con otros runtimes ONNX puede requerir ajustes adicionales.

## Enlaces

- [Repositorio HuggingFace JONNYVERSE/yolos-tiny](https://huggingface.co/JONNYVERSE/yolos-tiny)
- [Modelo base hustvl/yolos-tiny](https://huggingface.co/hustvl/yolos-tiny)
- [Documentación de Transformers.js](https://huggingface.co/docs/transformers.js)
- [Artículo de aimodels.fyi sobre yolos-tiny](https://www.aimodels.fyi/models/huggingFace/yolos-tiny-hustvl)
- [OpenModelMap - yolos tiny](https://openmodelmap.com/model/hustvl/yolos-tiny)
- [Model.aibase - Yolos-tiny](https://model.aibase.com/models/details/1915694415945031682)
