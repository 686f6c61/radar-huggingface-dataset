# ketiswp/tensorflow-MobileNetV1-0.25-ImageNet-224-uint8-onnx

## Resumen

El modelo `ketiswp/tensorflow-MobileNetV1-0.25-ImageNet-224-uint8-onnx` es una conversión a ONNX del clásico MobileNetV1 con un ancho de red de 0.25 (width multiplier) y una resolución de entrada de 224x224 píxeles. Ha sido cuantizado estáticamente a UINT8 en formato QDQ (quantize-dequantize), lo que lo hace adecuado para inferencia eficiente en dispositivos con recursos limitados, como CPUs sin aceleradores, microcontroladores o sistemas embebidos. El modelo original procede del repositorio oficial de TensorFlow Models (research/slim) y está preentrenado en ImageNet para clasificación de imágenes en 1000 categorías.

La cuantización UINT8 reduce el tamaño del modelo y acelera la inferencia en comparación con la versión FP32, manteniendo una precisión razonable para tareas de clasificación general. Está publicado bajo licencia Apache-2.0, lo que permite uso comercial y modificación sin restricciones significativas. Es una opción ligera y eficiente para despliegues en producción donde el consumo de memoria y la latencia son críticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV1 (CNN con depthwise separable convolutions) |
| Parametros totales | no disponible (estimado ~0.5M con width 0.25, no confirmado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | UINT8 estatico, formato QDQ |
| Idiomas soportados | no aplica (entrada visual) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (archivos .onnx) |

## Arquitectura y entrenamiento

MobileNetV1 es una red neuronal convolucional diseñada para ser eficiente en terminos de computo y memoria. Su innovacion principal es el uso de convoluciones separables en profundidad (depthwise separable convolutions), que descomponen una convolucion estandar en una convolucion depthwise y una pointwise (1x1), reduciendo drasticamente el numero de operaciones y parametros. El width multiplier de 0.25 reduce el numero de canales en cada capa al 25% del modelo base, dando lugar a una red muy compacta, ideal para entornos con restricciones de recursos.

El modelo fue entrenado originalmente en el dataset ImageNet con la implementacion de TensorFlow Slim. No se especifican en la model card los detalles exactos del entrenamiento (numero de tokens, tecnicas de regularizacion, etc.), ya que se trata de una conversion a ONNX del modelo preentrenado. La cuantizacion UINT8 se realizo de forma estatica con formato QDQ, lo que significa que los pesos y activaciones se representan con enteros de 8 bits y se insertan nodos de cuantizacion/decuantizacion para mantener la compatibilidad con operadores de punto flotante.

## Capacidades

- Clasificacion de imagenes: predice una etiqueta entre las 1000 categorias de ImageNet.
- Inferencia eficiente en CPU y hardware embebido gracias a la cuantizacion UINT8.
- Compatible con ONNX Runtime y otros runtime que soporten el formato ONNX.
- Soporte para preprocesado estandar de ImageNet (redimensionado, normalizacion).
- No incluye capacidades de deteccion, segmentacion ni generacion de texto.
- No soporta tool calling, agentes ni razonamiento multi-step, ya que es un modelo puramente discriminativo.

## Casos de uso

- Clasificacion de imagenes en dispositivos embebidos: el modelo cuantizado UINT8 puede ejecutarse en CPUs de bajo consumo o en microcontroladores con aceleradores de IA (p.ej., STM32N6, Raspberry Pi con OpenCV), permitiendo clasificar imagenes en tiempo real sin conexion a la nube.
- Filtrado de contenido en aplicaciones moviles: una app de galeria o de redes sociales puede usar el modelo para etiquetar fotos (por ejemplo, identificar animales, objetos o escenas) de forma local, preservando la privacidad del usuario.
- Automatizacion industrial: en una linea de produccion, el modelo puede clasificar productos en categorias (defectuoso vs. correcto) con una camara fija, integrado en un pipeline de vision por computador con ONNX Runtime en un PLC o PC industrial.
- Sistemas de vigilancia basica: clasificar si una imagen contiene personas, vehiculos u otros objetos para activar alertas, ejecutandose en un servidor CPU sin GPU.
- Educacion y prototipado: como modelo de referencia para aprender a convertir y cuantizar redes a ONNX, o para probar la viabilidad de un sistema de clasificacion en un entorno con recursos limitados.
- Clasificacion de imagenes medicas preliminares: aunque no esta entrenado para diagnostico, puede usarse para pre-clasificar imagenes de rayos X o dermatologicas en categorias genericas (por ejemplo, "normal" vs. "anomalia") como paso previo a un modelo especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se incluyen metricas de precision, latencia o throughput en la model card ni en la documentacion del autor. Se recomienda evaluar el modelo en el hardware objetivo antes de usarlo en produccion.

## Requisitos de hardware

- VRAM estimada: no aplica (inferencia en CPU posible). El modelo UINT8 ocupa aproximadamente 0.5 MB (estimado, ya que el peso FP32 de MobileNetV1 0.25 es de ~2 MB y la cuantizacion a 8 bits lo reduce al 25%).
- GPU recomendadas: no se requiere GPU; puede ejecutarse en CPU (x86, ARM) y en aceleradores de vision de bajo consumo (NPU, TPU). En GPU, cualquier modelo moderno es suficiente (por ejemplo, RTX 3060 o superior).
- Cabe en consumer GPU: si, incluso en GPU integradas o de bajo perfil.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), OpenVINO, TensorRT, llama.cpp (no aplica, es imagen), o runtime embebidos como STM32Cube.AI.
- Latencia y throughput estimados: no disponibles; dependen del hardware. En una CPU moderna, la inferencia con UINT8 suele ser inferior a 10 ms por imagen (estimacion generica, no confirmada).

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Formato | Licencia | Precision (ImageNet) |
|---|---|---|---|---|---|
| MobileNetV1 0.25 (este modelo) | ~0.5 M | 224x224 | ONNX UINT8 | Apache-2.0 | no disponible |
| MobileNetV2 0.5 | ~1.4 M | 224x224 | TFLite/ONNX | Apache-2.0 | ~63.0% top-1 (aprox.) |
| MobileNetV3 Small | ~2.5 M | 224x224 | TFLite | Apache-2.0 | ~67.4% top-1 (aprox.) |
| EfficientNet-Lite0 | ~4.7 M | 224x224 | TFLite | Apache-2.0 | ~75.1% top-1 (aprox.) |

Nota: los datos de precision de los modelos alternativos son aproximados y pueden variar segun la implementacion. Este modelo no publica resultados de precision, por lo que no se puede comparar directamente.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo esta preentrenado en ImageNet, que contiene imagenes con sesgos demograficos y culturales. Puede presentar errores en categorias poco representadas.
- Riesgo de alucinacion: no aplica en clasificacion de imagenes, pero puede dar salidas incorrectas en imagenes fuera de distribucion o de baja calidad.
- Limitaciones de contexto: solo acepta imagenes de 224x224; no soporta texto ni audio.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero no se ofrece garantia del autor sobre el rendimiento.
- Caveat de produccion: la cuantizacion UINT8 puede reducir la precision respecto al modelo FP32, especialmente en imagenes con detalles finos. Es recomendable validar la precision en el dataset objetivo antes de desplegarlo.
- No se incluyen etiquetas de clase ni script de preprocesado en el repositorio, por lo que el usuario debe implementar la normalizacion estandar de ImageNet.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ketiswp/tensorflow-MobileNetV1-0.25-ImageNet-224-uint8-onnx
- Version FP32: https://huggingface.co/ketiswp/tensorflow-MobileNetV1-0.25-ImageNet-224-fp32-onnx
- Fuente original (TensorFlow Slim): https://github.com/tensorflow/models/blob/4d7bdd8c170ee90850f2f9ccef0f6d19b817de35/research/slim/nets/mobilenet_v1.md
- Paper MobileNets: https://arxiv.org/abs/1704.04861
- Repositorio Open Model Zoo (variante 0.25-128): https://github.com/openvinotoolkit/open_model_zoo/blob/master/models/public/mobilenet-v1-0.25-128/README.md
