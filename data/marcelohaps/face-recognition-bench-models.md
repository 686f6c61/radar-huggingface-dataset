# marcelohaps/face-recognition-bench-models

## Resumen

El repositorio `marcelohaps/face-recognition-bench-models` contiene artefactos de modelos de reconocimiento facial para un benchmark de inferencia en dispositivos de borde (edge). Publicado por Marcelo Alves, incluye varias variantes del modelo ArcFace R100 (ResNet-100 con pérdida de margen angular aditivo) y un MobileFaceNet, exportados a formatos ONNX y TensorFlow Lite con diferentes cuantizaciones (fp32, fp16, int8 y int8 para EdgeTPU). Estos pesos derivan del proyecto InsightFace, entrenados con los conjuntos de datos MS1MV3 y WebFace600K, y se distribuyen bajo una licencia de uso exclusivo para investigación no comercial.

El repositorio no es un modelo independiente, sino un conjunto de archivos de pesos y artefactos de conversión pensados para facilitar la evaluación de reconocimiento facial en hardware de bajo consumo, como la Coral Dev Board. Su relevancia radica en ofrecer versiones optimizadas de un modelo de referencia en el campo, listas para desplegar en entornos de producción con restricciones de recursos. No se proporcionan métricas de rendimiento ni detalles de entrenamiento más allá de la procedencia de los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ArcFace R100 (ResNet-100) y MobileFaceNet |
| Parametros totales | no disponible (no especificado en la documentacion) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | fp32, fp16, int8 (ONNX y TFLite), int8 EdgeTPU |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | insightface-research (uso en investigacion, no comercial) |
| Formato de pesos | ONNX (.onnx) y TensorFlow Lite (.tflite) |

## Arquitectura y entrenamiento

ArcFace R100 es una red convolucional profunda basada en ResNet-100, entrenada con la funcion de perdida Additive Angular Margin Loss (ArcFace), que introduce un margen angular aditivo en la funcion softmax para mejorar la discriminacion entre identidades. Los pesos incluidos provienen del checkpoint oficial de InsightFace entrenado con MS1MV3, un conjunto de datos a gran escala de caras etiquetadas. MobileFaceNet, por su parte, es una red ligera disenada para dispositivos moviles, entrenada con WebFace600K. No se aportan detalles sobre el proceso de entrenamiento (numero de epocas, aumentos, etc.) en la documentacion del repositorio.

Los artefactos incluyen conversiones de precision: un modelo fp16 generado con onnxconverter-common, un modelo int8 con cuantizacion estatica QDQ calibrado con 300 caras del conjunto IJB-A, y versiones TFLite int8, una de ellas compilada para EdgeTPU mediante edgetpu_compiler. El repositorio tambien contiene un script de descarga con verificacion SHA-256 y un manifiesto de archivos.

## Capacidades

- Generacion de embeddings faciales de alta dimension (tipicamente 512) para representar la identidad de una persona.
- Verificacion facial 1:1: comparar dos embeddings para determinar si pertenecen a la misma persona.
- Identificacion facial 1:N: buscar la identidad de una cara en una base de datos de embeddings precalculados.
- Reconocimiento facial en tiempo real en dispositivos de borde gracias a las versiones int8 y EdgeTPU.
- No soporta generacion de texto, tool calling, agentes ni capacidades multimodales mas alla de la vision.

## Casos de uso

- Control de acceso fisico: el modelo puede ejecutarse en una Coral Dev Board o similar para verificar la identidad de una persona en una puerta o torniquete, comparando el embedding de la cara capturada con una base de datos local de empleados o residentes.
- Verificacion de identidad en onboarding digital: integrado en una aplicacion movil o web, permite confirmar que la persona que se registra coincide con su documento de identidad, comparando la foto del documento con una selfie en vivo.
- Busqueda de personas en archivos de video: procesando fotogramas con el modelo int8, se pueden generar embeddings y buscar coincidencias en una base de datos de personas desaparecidas o de interes.
- Sistemas de asistencia y presencia: en entornos educativos o corporativos, el modelo puede registrar la entrada y salida de personas identificandolas automaticamente a partir de camaras de vigilancia.
- Filtrado de fotos en redes sociales: aplicaciones de album fotografico pueden agrupar caras por identidad usando los embeddings generados, facilitando el etiquetado automatico.
- Investigacion academica en reconocimiento facial: al ser un modelo de referencia con licencia de investigacion, es adecuado para comparar tecnicas de cuantizacion, optimizacion para edge o nuevos algoritmos de comparacion de embeddings.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de precision (p. ej., LFW, IJB-C) ni comparaciones con otros modelos. Los archivos son artefactos de conversion, no un modelo evaluado de forma independiente.

## Requisitos de hardware

- Los archivos ONNX fp32 (260 MB) y fp16 (130 MB) requieren una GPU con al menos 1 GB de VRAM para inferencia comoda, aunque pueden ejecutarse en CPU con ONNX Runtime.
- El modelo int8 ONNX (65 MB) y los TFLite int8 (65 MB) estan disenados para inferencia en CPU o aceleradores como Coral EdgeTPU.
- La version `arcface_r100_int8_edgetpu.tflite` esta compilada para la Coral Dev Board (EdgeTPU), que dispone de 4 GB de RAM y 8 GB de almacenamiento.
- El MobileFaceNet int8 EdgeTPU (4 MB) cabe en cualquier dispositivo con soporte para TensorFlow Lite, incluidos smartphones Android.
- Opciones de despliegue: ONNX Runtime, TensorFlow Lite, edgetpu_compiler, y frameworks como DeepFace que envuelven estos modelos.
- No se proporcionan datos de latencia ni throughput en la documentacion.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. ArcFace R100 es un modelo de referencia en reconocimiento facial, pero no se incluyen metricas frente a alternativas como FaceNet, VGG-Face o SFace. La comparativa queda pendiente de una evaluacion externa.

## Limitaciones y advertencias

- Licencia restringida: los pesos solo pueden usarse con fines de investigacion; queda prohibido el uso comercial. Esto limita su despliegue en productos empresariales.
- Sesgo potencial: los conjuntos de entrenamiento MS1MV3 y WebFace600K pueden contener sesgos demograficos (raza, edad, genero) que afecten la precision en ciertos grupos poblacionales.
- Riesgo de errores en condiciones adversas: iluminacion pobre, oclusiones, angulos extremos o baja resolucion pueden degradar la calidad de los embeddings.
- No se incluyen herramientas de deteccion ni alineamiento facial; el modelo solo genera embeddings a partir de caras ya recortadas y alineadas.
- La cuantizacion int8 puede reducir ligeramente la precision respecto al modelo fp32, aunque no se cuantifica esa perdida en la documentacion.
- El repositorio no ofrece garantias de soporte ni mantenimiento; es un artefacto de benchmark, no un producto listo para produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/marcelohaps/face-recognition-bench-models
- Repositorio GitHub del benchmark: https://github.com/PDC-EAI/face-recognition
- Proyecto InsightFace (origen de los pesos): https://github.com/deepinsight/insightface
- Paper de ArcFace: J. Deng, J. Guo, N. Xue, S. Zafeiriou. *ArcFace: Additive Angular Margin Loss for Deep Face Recognition.* CVPR 2019.
