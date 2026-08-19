# Shaq2/chashibhai-brassica-disease-cls

## Resumen

ChashiBhAI Brassica Disease Classifier es un modelo de clasificación de imágenes diseñado para diagnosticar enfermedades en hojas de brassica (col y coliflor) en cultivos de Bangladesh. Fue desarrollado por Shakil Ahmed (Shaq2) como parte de la plataforma ChashiBhAI, una aplicación móvil de asesoramiento agrícola para agricultores bengalíes. El modelo utiliza la arquitectura YOLO26-cls de Ultralytics y se distribuye en formato TFLite con precisión FP16, optimizado para ejecución en dispositivos móviles sin conexión a internet.

El modelo clasifica 11 categorías que cubren enfermedades comunes de col y coliflor, como alternaria, mildiu, podredumbre negra, mancha bacteriana, deficiencia de nutrientes y hojas sanas. Su tamaño reducido (~10,95 MB) y su diseño on-device permiten que el diagnóstico se realice localmente en el teléfono, garantizando privacidad de los datos agrícolas y funcionamiento en zonas rurales con conectividad limitada. La relevancia actual radica en su aplicación práctica para la agricultura de precisión en países en desarrollo, donde el acceso a especialistas es escaso.

El modelo se distribuye bajo licencia MIT e incluye un contrato de preprocesamiento específico (variante C: redimensionado del lado corto a 640 píxeles, recorte central y normalización) que debe respetarse para obtener resultados correctos. Se ha verificado su concordancia entre las versiones FP16 y FP32, así como su correcto funcionamiento en pruebas independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26-cls (Ultralytics) exportado a TFLite |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen 640x640) |
| Tipos de cuantizacion | FP16 (TFLite) |
| Idiomas soportados | no aplica (modelo de vision); etiquetas en ingles y bengali (bn, en) |
| Licencia | MIT |
| Formato de pesos | TFLite (model.tflite), pesos Ultralytics (best.pt) |

## Arquitectura y entrenamiento

El modelo se basa en YOLO26-cls, la variante de clasificacion de la familia YOLO26 de Ultralytics. No se dispone de informacion detallada sobre el proceso de entrenamiento (numero de epocas, tamano del dataset, composicion de las clases ni tecnicas de aumento de datos). El autor indica que los pesos fuente se exportaron desde Ultralytics a TFLite con precision FP16 para su despliegue en dispositivos moviles.

Se ha verificado que el preprocesamiento requerido (variante C) coincide con el comportamiento del modelo `.pt` original: redimensionar el lado corto a 640, aplicar recorte central a 640x640, convertir a RGB y normalizar dividiendo entre 255. La concordancia entre las salidas FP16 y FP32 es perfecta (top-1 agreement = 1.0) con una diferencia maxima de softmax de 0.0021, lo que indica que la cuantizacion no degrada significativamente la calidad de las predicciones.

## Capacidades

- Clasificacion de 11 categorias de enfermedades y estados de hojas de col y coliflor: alternaria, podredumbre negra, mildiu, mancha bacteriana, podredumbre blanda, mancha negra, deficiencia de nutrientes y hojas sanas.
- Salida softmax con probabilidades por clase (vector de 11 elementos).
- Ejecucion on-device en tiempo real, sin necesidad de conexion a internet ni servicios en la nube.
- Preprocesamiento integrado en el contrato `labels.json` que garantiza compatibilidad con la entrada esperada.
- Compatibilidad con TensorFlow Lite para plataformas Android e iOS.
- No incluye capacidades de deteccion de objetos, generacion de texto, tool calling ni procesamiento multimodal.

## Casos de uso

- Diagnostico en campo para agricultores: el agricultor fotografia una hoja de col o coliflor con su telefono movil y la aplicacion ChashiBhAI clasifica la enfermedad al instante, sin conexion. El modelo es adecuado porque su tamano reducido y su formato TFLite permiten una inferencia rapida en dispositivos de gama baja.
- Asesoramiento agricola integrado: el clasificador alimenta un sistema de recomendaciones (KrishokChat) que genera consejos de tratamiento en bengali. La separacion entre clasificacion y generacion de texto garantiza que las imagenes nunca se envian a servicios externos, protegiendo la privacidad del agricultor.
- Monitorizacion de cultivos a gran escala: cooperativas agricolas pueden usar el modelo en aplicaciones de escaneo periodico para detectar brotes de enfermedades en parcelas de brassica, permitiendo una respuesta temprana.
- Investigacion academica: el modelo sirve como referencia para estudios de clasificacion de enfermedades de plantas en entornos con recursos limitados, dado su bajo coste computacional y su licencia permisiva.
- Educacion y extensionismo rural: organizaciones no gubernamentales pueden integrar el clasificador en materiales formativos para ensenar a agricultores a identificar visualmente las enfermedades mas comunes.
- Prototipado de soluciones agrotech: desarrolladores pueden utilizar el modelo como base para crear aplicaciones de diagnostico similares para otros cultivos, aprovechando el formato TFLite y el codigo de preprocesamiento publicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (como top-1 accuracy sobre datasets publicos) en la informacion disponible. Sin embargo, el autor documenta las siguientes verificaciones de calidad:

| Verificacion | Resultado |
|---|---|
| Concordancia FP16 vs FP32 (top-1) | 1.0 |
| Diferencia maxima de softmax entre FP16 y FP32 | 0.0021 |
| Test independiente en maquina separada (agosto 2026) | Correcto |
| Preprocesamiento verificado vs modelo `.pt` | Si (variante C) |

Estas metricas confirman que la version cuantizada mantiene la fidelidad respecto a los pesos originales, pero no proporcionan informacion sobre la precision absoluta del modelo en la tarea de clasificacion.

## Requisitos de hardware

- Inferencia on-device: el modelo TFLite (~10,95 MB) esta disenado para ejecutarse en smartphones con Android o iOS mediante TensorFlow Lite. No requiere GPU dedicada ni hardware especializado.
- RAM y almacenamiento: el modelo ocupa menos de 11 MB en disco; la inferencia tipica consume menos de 100 MB de RAM en dispositivos moviles.
- Compatibilidad con CPU: puede ejecutarse en CPU de cualquier dispositivo moderno, aunque se recomienda habilitar la aceleracion por GPU (NNAPI o Core ML) para latencias inferiores a 100 ms por imagen.
- Opciones de despliegue: ademas de la app movil, el modelo puede ejecutarse en Python con TensorFlow Lite (ver ejemplo en la model card) o en servidores mediante el interprete TFLite para pruebas.
- No se dispone de datos de latencia o throughput especificos, pero dado el tamano del modelo y la arquitectura YOLO26-cls, se espera una inferencia en tiempo real en dispositivos moviles de gama media.

## Comparativa con modelos similares

No se dispone de informacion publica sobre otros modelos de clasificacion de enfermedades de brassica con especificaciones comparables. El autor mantiene una coleccion de clasificadores on-device para otros cultivos:

| Modelo | Cultivo | Arquitectura | Formato | Licencia |
|---|---|---|---|---|
| chashibhai-brassica-disease-cls | Col y coliflor | YOLO26-cls | TFLite FP16 | MIT |
| chashibhai-rice-disease-cls | Arroz | YOLO26-cls | TFLite FP16 | MIT |
| chashibhai-corn-disease-cls | Maiz | YOLO26-cls | TFLite FP16 | MIT |

No se han encontrado alternativas comerciales o academicas con datos de rendimiento publicados que permitan una comparacion cuantitativa. Se recomienda evaluar el modelo en el dataset propio antes de su integracion en produccion.

## Limitaciones y advertencias

- El modelo solo cubre enfermedades de col y coliflor; no es aplicable a otros cultivos sin reentrenamiento.
- No realiza deteccion de objetos ni proporciona bounding boxes; solo clasifica imagenes de hojas individuales.
- No ofrece recomendaciones de dosis quimicas ni tratamiento; esa funcion esta delegada a un sistema de asesoramiento separado con compuertas de seguridad.
- El preprocesamiento es estricto: cualquier desviacion del contrato (por ejemplo, usar letterbox en lugar de recorte central) puede degradar significativamente la precision.
- No se han publicado datos sobre la precision absoluta en datasets de referencia, por lo que se desconoce su rendimiento frente a otros clasificadores.
- El modelo se distribuye bajo licencia MIT, pero los pesos de Ultralytics estan sujetos a su propia licencia; el autor indica que se redistribuyen solo los pesos, no las imagenes de entrenamiento.
- El diagnostico automatico no sustituye la confirmacion de un especialista agricola; se recomienda uso asistido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shaq2/chashibhai-brassica-disease-cls
- Coleccion de clasificadores ChashiBhAI: https://huggingface.co/collections/Shaq2/chashibhai-on-device-disease-classifiers
- Repositorio de codigo (GitHub): https://github.com/MRSHAKILS/AI-Powered-Smart-Agriculture-Advisory-Platform-for-Bangladesh
- Paper relacionado (sistema de asesoramiento KrishokChat, no el clasificador): https://arxiv.org/abs/2606.29243
- Clasificador de arroz: https://huggingface.co/Shaq2/chashibhai-rice-disease-cls
- Clasificador de maiz: https://huggingface.co/Shaq2/chashibhai-corn-disease-cls
