# ketiswp/google-coral-DeepLabV3-MobileNetV2-1.0-PascalVOC-fp32-onnx

## Resumen

Este modelo es una conversión a formato ONNX en precisión FP32 del modelo DeepLabV3 con backbone MobileNetV2, entrenado por Google para segmentación semántica de imágenes sobre el dataset Pascal VOC. La versión original fue desarrollada por el equipo de Google Research y optimizada para ejecución en el hardware Edge TPU de Coral, aunque esta conversión ONNX permite su despliegue en cualquier runtime compatible como ONNX Runtime, OpenVINO o TensorRT.

El modelo resuelve el problema de la segmentación semántica de imágenes en tiempo real, asignando a cada píxel de la imagen una de las 21 clases del dataset Pascal VOC (20 categorías de objetos más el fondo). Su relevancia actual radica en que ofrece un equilibrio entre precisión y eficiencia computacional, siendo adecuado para aplicaciones de visión por computador en dispositivos embebidos y sistemas de borde.

La arquitectura combina el diseño de DeepLabV3 con atrous convolutions (convoluciones dilatadas) para capturar contexto multiescala, junto con la eficiencia del backbone MobileNetV2. El tamaño del modelo y el número de parámetros no están especificados en la información disponible, aunque se sabe que la entrada típica es de 513×513 píxeles. El contexto está limitado a imágenes de resolución fija.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepLabV3 con backbone MobileNetV2 |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no aplicable (modelo de vision) |
| Tipos de cuantizacion | FP32 (este modelo), UINT8 (version enlazada) |
| Idiomas soportados | no disponible (modelo de vision, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (safetensors no aplicable) |

## Arquitectura y entrenamiento

DeepLabV3 es una arquitectura de segmentacion semantica que utiliza convoluciones atrous (dilatadas) en multiples tasas para capturar informacion contextual a diferentes escalas sin perder resolucion espacial. El backbone MobileNetV2 proporciona una extraccion de caracteristicas eficiente y ligera, basada en bloques residuales invertidos con cuellos de botella lineales. El modelo fue entrenado por Google en el dataset Pascal VOC 2012, que contiene 20 clases de objetos mas fondo, con imagenes de resolucion variable.

La informacion disponible no detalla el proceso de entrenamiento completo (numero de epocas, estrategia de aumento de datos, funciones de perdida). El modelo original de TensorFlow fue convertido a formato ONNX en FP32, lo que garantiza compatibilidad con una amplia gama de runtimes de inferencia. No se menciona el uso de tecnicas como RLHF o DPO, ya que no es un modelo de lenguaje. La innovacion principal es la combinacion de DeepLabV3 con MobileNetV2 para lograr un equilibrio entre precision y velocidad en dispositivos con recursos limitados.

## Capacidades

- Segmentacion semantica de imagenes en 21 clases (20 objetos + fondo) del dataset Pascal VOC.
- Inferencia en imagenes de resolucion tipica de 513×513 pixeles, aunque puede adaptarse a otras resoluciones.
- Genera mapas de segmentacion pixel a pixel, no solo bounding boxes.
- Formato ONNX FP32, compatible con multiples runtimes de inferencia (ONNX Runtime, OpenVINO, TensorRT).
- No tiene capacidad de generacion de texto, tool calling, ni agentes, ya que es un modelo de vision puro.
- No soporta video directamente, aunque se puede aplicar frame a frame.
- No es multilingue: su salida es un tensor de etiquetas de clase, no texto.

## Casos de uso

- **Automatizacion de procesos industriales**: segmentacion de imagenes de lineas de produccion para identificar defectos o clasificar productos en tiempo real. El modelo puede ejecutarse en dispositivos de borde con CPU o aceleradores como Coral Edge TPU, gracias a su eficiencia y formato ONNX.
- **Conduccion autonoma**: identificacion de carriles, senales de trafico, peatones y vehiculos en imagenes de camaras. Su bajo consumo computacional permite integracion en sistemas embebidos de vehiculos.
- **Robotica y navegacion**: segmentacion de entorno para que robots moviles distingan obstaculos, superficies transitables y objetos de interes. La salida densa de la segmentacion permite planificacion de rutas mas precisa.
- **Analisis de imagenes medicas**: segmentacion de estructuras en imagenes de radiografias o tomografias. Aunque no esta entrenado especificamente para este dominio, puede ser un punto de partida para transferencia de aprendizaje.
- **Agricultura de precision**: analisis de imagenes aereas o de drones para identificar cultivos, suelo y vegetacion. El modelo puede ejecutarse en el borde, reduciendo la latencia de las decisiones en campo.
- **Realidad aumentada**: separacion de objetos del fondo para overlays virtuales. La segmentacion a nivel de pixel permite una composicion mas realista de elementos virtuales en el mundo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible, pero al ser un modelo FP32 de MobileNetV2, se estima que requiere menos de 1 GB de RAM en inferencia con CPU, y puede ejecutarse en GPU con menos de 2 GB.
- **GPU recomendadas**: cualquier GPU moderna con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti o superior) puede ejecutar el modelo con facilidad. Para el Edge TPU de Coral, se necesita la version UINT8 del modelo.
- **CPU**: funciona en cualquier CPU x86 o ARM con soporte para FP32, aunque la latencia sera mayor que en GPU.
- **Opciones de despliegue**: se puede usar con ONNX Runtime (CPU/GPU), OpenVINO, TensorRT, o en el runtime de Coral Edge TPU (con la version UINT8).
- **Latencia**: no disponible, pero se estima que en una CPU moderna de 4 nucleos la inferencia de una imagen 513×513 puede tomar entre 50 y 200 ms, y en GPU menos de 10 ms.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| DeepLabV3-MobileNetV2 (este) | DeepLabV3 + MobileNetV2 | no disponible | 513×513 | Apache 2.0 | ONNX |
| DeepLabV3-Plus-MobileNet (Qualcomm) | DeepLabV3+ + MobileNet | no disponible | no disponible | no disponible | no disponible |
| DeepLabV3-MobileNetV2 (original Google) | DeepLabV3 + MobileNetV2 | no disponible | 513×513 | Apache 2.0 | TensorFlow |

La comparativa se limita a la disponibilidad de informacion. El modelo de Qualcomm (DeepLabV3-Plus-MobileNet) es una variante mejorada de DeepLabV3 con decoder adicional, pero no se dispone de datos de rendimiento para comparar. El modelo original de Google es el mismo que este, pero en formato TensorFlow y optimizado para Coral.

## Limitaciones y advertencias

- **Sesgos conocidos**: el modelo fue entrenado en Pascal VOC, que contiene sesgos geograficos y de contexto (imagenes de entornos urbanos y naturales occidentales). Puede no generalizar bien a imagenes de otras regiones o dominios.
- **Riesgo de alucinacion**: en segmentacion, no se produce alucinacion de texto, pero puede generar segmentaciones incorrectas en objetos no vistos o fuera de las 21 clases.
- **Limitaciones de contexto**: el modelo solo funciona con imagenes de entrada de dimensiones fijas (tipicamente 513×513). No soporta imagenes de alta resolucion sin preprocesamiento.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero el usuario debe revisar los terminos del dataset Pascal VOC y de los pesos originales de Google.
- **Caveats de produccion**: el formato FP32 puede ser demasiado pesado para dispositivos de borde muy limitados; se recomienda la version UINT8 para Edge TPU. La conversion ONNX no ha sido validada por Google, por lo que puede haber ligeras diferencias de precision respecto al modelo original.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/ketiswp/google-coral-DeepLabV3-MobileNetV2-1.0-PascalVOC-fp32-onnx)
- [Version UINT8 del modelo](https://huggingface.co/ketiswp/google-coral-DeepLabV3-MobileNetV2-1.0-PascalVOC-uint8-onnx)
- [Repositorio original de TensorFlow Models (DeepLab)](https://github.com/tensorflow/models/tree/archive/research/deeplab)
- [Modelo original de Google en HuggingFace](https://huggingface.co/google/deeplabv3_mobilenet_v2_1.0_513)
- [Pagina de Coral de Google for Developers](https://developers.google.com/coral/products)
