# SeasonEngine/Vision

## Resumen

SeasonEngine/Vision es un repositorio publicado en Hugging Face por el usuario SeasonEngine (también conocido como SeasonRealms) que contiene el código fuente de SeasonVision, una biblioteca de visión por computadora para .NET construida sobre ONNX Runtime. No se trata de un modelo de IA entrenado, sino de una colección de utilidades y helpers que permiten ejecutar modelos ONNX preexistentes para tareas como clasificación de imágenes, detección de objetos, detección facial, reconocimiento de emociones, análisis de atributos faciales y segmentación de instancias.

La biblioteca está orientada a desarrolladores .NET que necesitan integrar capacidades de visión en sus aplicaciones sin tener que gestionar manualmente la carga y preprocesamiento de modelos ONNX. Incluye helpers para modelos conocidos como MobileNet, ResNet, UltraFace, FER+, PIPNet, Faster R-CNN y Mask R-CNN, todos ellos con licencias permisivas (MIT o Apache-2.0). El repositorio tiene un tamaño de 0.2 GB e incluye el código fuente, documentación y referencias a los modelos externos.

La relevancia de este proyecto radica en que simplifica el despliegue de modelos de visión en entornos .NET, un ecosistema donde tradicionalmente hay menos herramientas de IA listas para usar comparado con Python. Su licencia MIT permite uso comercial sin restricciones, y al estar basado en ONNX Runtime, puede ejecutarse en CPU, GPU y otros aceleradores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (biblioteca de inferencia que envuelve modelos ONNX preentrenados: MobileNet, ResNet, UltraFace, FER+, PIPNet, Faster R-CNN, Mask R-CNN) |
| Parametros totales | No disponible (depende del modelo ONNX utilizado) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | Los modelos de referencia incluyen versiones cuantizadas (qdq) de ResNet50, Faster R-CNN y Mask R-CNN |
| Idiomas soportados | No disponible (no es un modelo de texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (archivos .onnx) |

## Arquitectura y entrenamiento

SeasonVision no es un modelo entrenado, sino una capa de abstracción sobre ONNX Runtime. La biblioteca expone APIs tipadas para cada tarea de visión, gestionando internamente el preprocesamiento de imágenes (redimensionado, normalización, conversión a tensores) y la post-procesamiento de salidas (decodificación de cajas delimitadoras, máscaras, etc.).

Los modelos subyacentes son arquitecturas estándar de visión por computadora:
- MobileNet v2 y ResNet50 para clasificación de imágenes.
- UltraFace (variante RFB-320) para detección facial.
- PIPNet (ResNet18 con 98 puntos de landmarks) para detección de puntos faciales.
- FER+ para reconocimiento de emociones faciales.
- OpenVINO age-gender-recognition-retail-0013 para análisis de edad y género.
- Faster R-CNN (R-50-FPN) para detección de objetos.
- Mask R-CNN (R-50-FPN) para segmentación de instancias.

Estos modelos fueron entrenados por terceros y publicados en proyectos como ONNX Model Zoo, OpenVINO Open Model Zoo o repositorios específicos. SeasonVision no realiza ningún entrenamiento adicional; se limita a proporcionar helpers de inferencia. La biblioteca está diseñada para .NET 10.0 y utiliza el paquete `Microsoft.ML.OnnxRuntime.Managed`.

## Capacidades

- Clasificación de imágenes con MobileNet v2 y ResNet50 (versión cuantizada).
- Detección de objetos con Faster R-CNN (R-50-FPN cuantizado).
- Segmentación de instancias con Mask R-CNN (R-50-FPN cuantizado).
- Detección facial con UltraFace (modelo ligero de ~1MB).
- Detección de landmarks faciales (98 puntos) con PIPNet.
- Reconocimiento de emociones faciales con FER+.
- Análisis de atributos faciales (edad y género) con el modelo de OpenVINO.
- Preprocesamiento unificado para buffers de imagen RGBA.
- Salidas de imagen anotadas como arrays RGBA.
- Integración directa en proyectos .NET mediante referencia de proyecto o paquete NuGet.

## Casos de uso

- Aplicaciones de análisis de imágenes en entornos .NET: integrar clasificación o detección de objetos en aplicaciones de escritorio o servicios Windows sin necesidad de migrar a Python.
- Sistemas de moderación de contenido: usar Faster R-CNN o Mask R-CNN para detectar objetos no deseados en imágenes subidas por usuarios.
- Autenticación biométrica ligera: emplear UltraFace para detección facial y PIPNet para landmarks, permitiendo verificar la presencia de un rostro antes de procesos de comparación.
- Análisis de emociones en encuestas o estudios de usuario: usar FER+ para clasificar emociones en imágenes capturadas durante sesiones de prueba.
- Filtros y efectos de realidad aumentada: detectar rostros y landmarks para superponer máscaras o efectos en tiempo real, aprovechando la baja latencia de UltraFace y PIPNet.
- Automatización industrial: clasificar productos en líneas de montaje con MobileNet o ResNet, o segmentar piezas con Mask R-CNN para control de calidad.
- Aplicaciones de salud y bienestar: estimar edad y género a partir de imágenes faciales con el modelo de OpenVINO, útil para demografía de usuarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los modelos subyacentes tienen métricas conocidas en sus respectivos conjuntos de datos (por ejemplo, MobileNet v2 en ImageNet, Faster R-CNN en COCO), pero SeasonVision no proporciona cifras propias de latencia o precisión.

## Requisitos de hardware

- Depende del modelo ONNX elegido. Los modelos pequeños como UltraFace (320x320) pueden ejecutarse en CPU con bajo consumo.
- Los modelos cuantizados (ResNet50 qdq, Faster R-CNN qdq, Mask R-CNN qdq) están optimizados para CPU, pero también pueden usar GPU si se configura ONNX Runtime con el provider adecuado (CUDA, DirectML, etc.).
- Para aplicaciones en tiempo real, se recomienda una GPU con soporte CUDA (NVIDIA) o DirectML (Windows) para modelos de detección y segmentación.
- La biblioteca no impone requisitos específicos de VRAM; depende del modelo y del tamaño de imagen.
- Opciones de despliegue: cualquier plataforma que soporte .NET 10.0 y ONNX Runtime (Windows, Linux, macOS). No se proporcionan contenedores preconstruidos.
- El rendimiento real depende del hardware y del modelo concreto; no hay datos de throughput publicados.

## Comparativa con modelos similares

No aplica directamente porque SeasonVision no es un modelo, sino una biblioteca. Se puede comparar con otros frameworks de visión en .NET:

| Biblioteca | Enfoque | Modelos incluidos | Licencia | Plataforma |
|---|---|---|---|---|
| SeasonVision | Helpers sobre ONNX Runtime | No incluye, requiere modelos externos | MIT | .NET 10.0 |
| ML.NET (Image Classification) | Pipeline de ML con transfer learning | Entrena modelos propios | MIT | .NET |
| OpenCvSharp | Binding de OpenCV | No incluye modelos de deep learning | BSD-3-Clause | .NET |

SeasonVision se diferencia por ofrecer una API tipada y específica para tareas de visión, mientras que ML.NET requiere construir pipelines complejos y OpenCvSharp es de más bajo nivel.

## Limitaciones y advertencias

- No es un modelo entrenado; es una biblioteca que requiere que el usuario proporcione los archivos ONNX de los modelos que desea usar.
- La biblioteca no incluye los pesos de los modelos; deben descargarse por separado desde los enlaces indicados en la documentación.
- La licencia de los modelos subyacentes varía: algunos son MIT, otros Apache-2.0. Existe una discrepancia en el modelo FER+ (la model card dice MIT pero la etiqueta de Hugging Face indica Apache-2.0), lo que debe tenerse en cuenta al redistribuir.
- No hay garantía de soporte para todos los modelos ONNX; solo se proporcionan helpers para los modelos listados.
- La versión actual apunta a .NET 10.0, que puede no estar disponible en todas las plataformas de producción.
- No se proporcionan métricas de rendimiento ni benchmarks propios, por lo que el usuario debe validar la idoneidad para su caso de uso.
- Riesgo de alucinación no aplica (no es un modelo generativo), pero sí existe riesgo de errores en la detección si los modelos subyacentes tienen sesgos o limitaciones conocidas.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/SeasonEngine/Vision
- Repositorio de GitHub: https://github.com/SeasonRealms/SeasonVision
- Perfil del autor en Hugging Face: https://huggingface.co/SeasonEngine
- Página web de SeasonEngine: http://seasonengine.com/
- Modelos de referencia:
  - age-gender-recognition-retail-0013: https://docs.openvino.ai/2023.3/omz_models_model_age_gender_recognition_retail_0013.html
  - emotion-ferplus-8: https://huggingface.co/onnxmodelzoo/emotion-ferplus-8
  - mobilenetv2-12: https://huggingface.co/onnxmodelzoo/mobilenetv2-12
  - resnet: https://github.com/onnx/models/tree/main/validated/vision/classification/resnet
  - UltraFace: https://github.com/Linzaer/Ultra-Light-Fast-Generic-Face-Detector-1MB
  - pipnet-onnx: https://github.com/yakhyo/pipnet-onnx/releases/tag/weights
  - faster-rcnn: https://github.com/onnx/models/tree/main/validated/vision/object_detection_segmentation/faster-rcnn
  - mask-rcnn: https://github.com/onnx/models/tree/main/validated/vision/object_detection_segmentation/mask-rcnn
