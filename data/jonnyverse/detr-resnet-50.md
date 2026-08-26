# JONNYVERSE/detr-resnet-50

## Resumen

JONNYVERSE/detr-resnet-50 es una conversión a formato ONNX del modelo original facebook/detr-resnet-50, realizada específicamente para ser compatible con la librería Transformers.js. Esto permite ejecutar detección de objetos directamente en el navegador o en entornos Node.js sin necesidad de un servidor dedicado. El modelo subyacente, DETR (DEtection TRansformer), fue desarrollado por Meta AI y resuelve el problema de detección de objetos como un problema de predicción de conjuntos, eliminando la necesidad de técnicas clásicas como anchor boxes o NMS. Está entrenado sobre el dataset COCO 2017, que contiene 118.000 imágenes anotadas con 80 categorías de objetos.

La relevancia de esta conversión radica en que democratiza el uso de un modelo de detección de objetos de alta calidad en aplicaciones web y móviles, aprovechando la aceleración por hardware disponible en los navegadores modernos (WebGPU, WebGL) o en entornos de ejecución JavaScript. Al ser un modelo relativamente ligero (el original tiene alrededor de 41 millones de parámetros, aunque este dato no se especifica en la ficha), es viable su ejecución en dispositivos de gama media. La arquitectura combina un backbone ResNet-50 con un transformer encoder-decoder, lo que le permite modelar relaciones globales entre objetos y su contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DETR (transformer encoder-decoder) con backbone ResNet-50 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (pesos ONNX, posiblemente FP32) |
| Idiomas soportados | no disponible (modelo de vision, no textual) |
| Licencia | no disponible |
| Formato de pesos | ONNX (para Transformers.js) |

## Arquitectura y entrenamiento

El modelo original DETR-ResNet50 fue introducido por Carion et al. en 2020. Su arquitectura consta de un backbone ResNet-50 que extrae características de la imagen, seguido de un transformer encoder-decoder que procesa estas características y genera un conjunto fijo de predicciones de objetos (normalmente 100). Cada predicción incluye una caja delimitadora y una etiqueta de clase. El entrenamiento se realiza de extremo a extremo utilizando una función de pérdida basada en emparejamiento bipartito entre las predicciones y las anotaciones reales, lo que evita la necesidad de postprocesado heurístico. El modelo fue entrenado en el dataset COCO 2017 con 118.000 imágenes de entrenamiento y 5.000 de validación.

La conversión a ONNX se realizó mediante la herramienta Optimum de Hugging Face, que exporta los pesos del modelo PyTorch original a formato ONNX. Este proceso no modifica la arquitectura ni los pesos, solo el formato de serialización. El repositorio incluye los pesos en una subcarpeta `onnx` y está estructurado para ser cargado directamente por Transformers.js, que utiliza ONNX Runtime Web para la inferencia en el navegador.

## Capacidades

- Detección de objetos en imágenes: identifica y localiza objetos de 80 clases del dataset COCO (personas, vehículos, animales, objetos cotidianos, etc.).
- Generación de cajas delimitadoras: devuelve coordenadas normalizadas (xmin, ymin, xmax, ymax) junto con una puntuación de confianza.
- Inferencia en tiempo real en navegador: gracias a la conversión a ONNX y a Transformers.js, puede ejecutarse en clientes web sin servidor.
- Soporte para imágenes de resolución variable: aunque el modelo original está entrenado con imágenes de 800x800 píxeles, puede procesar imágenes de otros tamaños con un preprocesado adecuado.
- No incluye capacidades de texto, tool calling, agentes ni razonamiento multimodal más allá de la visión.

## Casos de uso

- Moderación de contenido en plataformas web: detectar objetos no permitidos (armas, drogas, etc.) en imágenes subidas por usuarios, ejecutando el modelo directamente en el navegador para reducir la carga del servidor.
- Aplicaciones de realidad aumentada: identificar objetos en tiempo real a través de la cámara del dispositivo para superponer información o animaciones, aprovechando la baja latencia de la inferencia local.
- Automatización de inventario en tiendas: contar y clasificar productos en estanterías a partir de fotografías tomadas con un móvil, sin necesidad de infraestructura en la nube.
- Asistentes de accesibilidad: describir la posición de objetos en una escena para personas con discapacidad visual, combinando la detección con un modelo de texto a voz.
- Análisis de imágenes médicas (uso no clínico): localizar estructuras anatómicas en radiografías o ecografías para fines educativos o de investigación, siempre que se valide el rendimiento.
- Filtrado de imágenes en motores de búsqueda: clasificar y etiquetar automáticamente imágenes indexadas para mejorar la relevancia de los resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo original DETR-ResNet50 reporta una precisión media (AP) de 42.0 en el conjunto de validación de COCO, pero este dato no se incluye en la documentación de esta conversión específica.

## Requisitos de hardware

- Al ser un modelo de aproximadamente 41 millones de parámetros (dato no confirmado en la ficha), su huella de memoria es moderada. En FP32, los pesos ocupan alrededor de 160 MB, pero no se especifica el tamaño exacto en el repositorio.
- Puede ejecutarse en CPU en navegadores mediante WebAssembly, aunque con mayor latencia. Se recomienda WebGPU o WebGL para un rendimiento aceptable en tiempo real.
- En Node.js, puede ejecutarse en cualquier máquina con al menos 2 GB de RAM libre. No se requieren GPUs dedicadas para inferencia básica.
- Opciones de despliegue: Transformers.js (navegador y Node.js), ONNX Runtime Web, ONNX Runtime Node.js, o cualquier runtime compatible con ONNX.
- La latencia depende del hardware: en una GPU integrada moderna (p. ej., Apple M1) se pueden esperar entre 50 y 150 ms por imagen; en CPU de gama media, entre 200 y 500 ms. Estos valores son estimaciones generales, no mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| JONNYVERSE/detr-resnet-50 (ONNX) | Transformer + ResNet-50 | no disponible | no aplica | no disponible | ONNX |
| facebook/detr-resnet-50 (original) | Transformer + ResNet-50 | ~41M | no aplica | Apache-2.0 | PyTorch |
| YOLOv8 (ultralytics) | CNN (CSPDarknet) | ~3M a ~68M | no aplica | AGPL-3.0 | PyTorch, ONNX, etc. |
| SSD-ResNet50 | CNN (ResNet-50 + cabezales) | ~34M | no aplica | Apache-2.0 | PyTorch, ONNX |

La comparativa se basa en datos públicos de los modelos originales. La conversión ONNX no altera el rendimiento teórico, pero puede introducir pequeñas diferencias numéricas debidas a la cuantización o al runtime.

## Limitaciones y advertencias

- El modelo fue entrenado exclusivamente en el dataset COCO, por lo que su rendimiento en dominios muy diferentes (imágenes médicas, satelitales, etc.) puede ser deficiente.
- Puede fallar en la detección de objetos pequeños o muy juntos, un problema conocido de DETR en comparación con detectores basados en CNN.
- No se proporciona información sobre la licencia de esta conversión específica. El modelo original está bajo Apache-2.0, pero el autor de esta conversión no ha especificado una licencia, lo que puede generar incertidumbre legal para uso comercial.
- Al ser una conversión ONNX, la precisión puede verse ligeramente afectada si se aplica cuantización, aunque no se indica en el repositorio.
- No se han documentado sesgos específicos, pero el modelo puede reflejar los sesgos presentes en COCO (por ejemplo, subrepresentación de ciertas categorías o contextos geográficos).
- Para producción, se recomienda validar el rendimiento en el dominio objetivo y considerar un umbral de confianza adecuado (el ejemplo usa 0.9).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/JONNYVERSE/detr-resnet-50
- Modelo original: https://huggingface.co/facebook/detr-resnet-50
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js
- Página de Qualcomm AI Hub: https://aihub.qualcomm.com/models/detr_resnet50
- Documentación de Cloudflare Workers AI: https://developers.cloudflare.com/workers-ai/models/detr-resnet-50/
- Open Model Zoo (OpenVINO): https://github.com/openvinotoolkit/open_model_zoo/blob/master/models/public/detr-resnet50/README.md
