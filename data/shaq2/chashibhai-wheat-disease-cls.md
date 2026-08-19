# Shaq2/chashibhai-wheat-disease-cls

## Resumen

ChashiBhAI Wheat Disease Classifier (v2) es un clasificador de imágenes diseñado para detectar enfermedades en hojas de trigo, desarrollado por Shaq2 como parte de la colección ChashiBhAI de clasificadores on-device para agricultura. El modelo se basa en la arquitectura YOLO26-cls de Ultralytics y se distribuye convertido a TFLite con precisión FP16, lo que permite su ejecución en dispositivos móviles y embebidos sin conexión a internet. Está orientado al contexto agrícola de Bangladesh, donde el diagnóstico temprano de enfermedades del trigo es crítico para reducir pérdidas de cosecha.

El modelo acepta imágenes de entrada de 640x640 píxeles en formato NHWC y produce una salida softmax de 11 clases correspondientes a distintas enfermedades y estados del cultivo. La versión v2 se encuentra en el subdirectorio `v2/` del repositorio, mientras que los artefactos raíz pertenecen a la generación anterior. Su licencia MIT permite uso comercial y modificación sin restricciones significativas, lo que facilita su integración en aplicaciones agrícolas tanto públicas como privadas.

La relevancia de este modelo radica en su capacidad de ejecución local en hardware de bajo coste, lo que democratiza el acceso a herramientas de diagnóstico fitosanitario en zonas rurales con conectividad limitada. Al estar basado en YOLO26-cls, hereda la eficiencia computacional de esta familia de modelos, diseñada para equilibrar precisión y velocidad en entornos con recursos restringidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26-cls (Ultralytics) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | FP16 (TFLite) |
| Idiomas soportados | no disponible (no es modelo de texto) |
| Licencia | MIT |
| Formato de pesos | TFLite (`.tflite`) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLO26-cls, una variante de clasificacion de la familia YOLO26 desarrollada por Ultralytics. A diferencia de los modelos YOLO de deteccion, esta variante sustituye la cabeza de deteccion por una capa de clasificacion con salida softmax de 11 neuronas. La entrada es una imagen de 640x640 píxeles con tres canales (RGB) en formato NHWC, y el preprocesamiento especificado es un centre-crop de variante C, que recorta la imagen centralmente antes de redimensionarla.

No se dispone de informacion detallada sobre el conjunto de entrenamiento, el numero de epocas, la estrategia de aumento de datos ni si se aplicaron tecnicas de regularizacion o ajuste fino. La conversion a TFLite FP16 sugiere que el modelo fue entrenado en PyTorch y posteriormente exportado mediante el pipeline de Ultralytics. Tampoco se documenta el uso de tecnicas como destilacion, cuantizacion post-entrenamiento adicional o calibracion de la cuantizacion.

## Capacidades

- Clasificacion de imagenes de hojas de trigo en 11 categorias, presumiblemente incluyendo enfermedades comunes como roya, septoriosis o fusariosis, aunque no se especifica la lista exacta.
- Inferencia on-device gracias al formato TFLite FP16, lo que permite ejecucion en smartphones, Raspberry Pi y otros dispositivos de bajo consumo.
- Preprocesamiento integrado (centre-crop) que simplifica la integracion en pipelines de captura de imagenes.
- No soporta tool calling, generacion de texto, razonamiento multimodal ni otras capacidades propias de modelos de lenguaje.
- No se documenta soporte para multiples idiomas ni funciones de agentes.

## Casos de uso

- Diagnostico en campo por agricultores: un agricultor puede fotografiar una hoja de trigo con su telefono movil y obtener una clasificacion inmediata de la enfermedad sin necesidad de conexion a internet, gracias al formato TFLite y al bajo consumo de recursos.
- Aplicacion movil de asesoria agricola: integracion del modelo en una app como ChashiBhAI que combine la clasificacion con recomendaciones de tratamiento, almacenamiento local del historial de detecciones y sincronizacion posterior en la nube.
- Monitorizacion de cultivos con drones o camaras fijas: el modelo puede ejecutarse en dispositivos embebidos conectados a sensores para detectar brotes de enfermedades en parcelas extensas, enviando alertas cuando se supera un umbral de confianza.
- Herramienta de extension agraria: organismos publicos o ONGs pueden distribuir la app a tecnicos de campo que necesiten evaluar rapidamente la salud de los cultivos en visitas a explotaciones.
- Educacion y formacion: el modelo puede utilizarse en programas de capacitacion para que estudiantes de agronomia aprendan a identificar enfermedades del trigo mediante ejemplos reales clasificados automaticamente.
- Investigacion fitopatologica: los investigadores pueden emplear el modelo como herramienta de preseleccion de imagenes sospechosas en grandes conjuntos de datos, reduciendo el trabajo manual de revision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre precision, recall, F1, ni comparativas con otros clasificadores de enfermedades de trigo.

## Requisitos de hardware

- Al ser un modelo TFLite FP16 con entrada 640x640, su huella de memoria es reducida (estimacion orientativa: entre 10 y 50 MB, aunque no se confirma en la documentacion).
- Puede ejecutarse en CPU de dispositivos moviles modernos (ARM Cortex-A75 o superior) y en GPUs integradas como Mali o Adreno.
- Compatible con aceleradores como Google Edge TPU si se convierte a INT8, aunque la version actual es FP16.
- No requiere GPU dedicada; es adecuado para Raspberry Pi 4/5, smartphones Android con TensorFlow Lite y placas como Jetson Nano.
- Para despliegue, se puede usar TensorFlow Lite Runtime, el interprete de TFLite en Android/iOS, o el motor de inferencia de Ultralytics si se mantiene el formato original.
- No se proporcionan datos de latencia o throughput medidos.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (clasificadores de enfermedades de trigo on-device). La coleccion ChashiBhAI incluye clasificadores para arroz, brassica y maiz, pero no se publican metricas comparativas. Otros proyectos como el repositorio de Ayesshaabbas o el asistente de AminaHabiba abordan la deteccion de enfermedades de trigo con arquitecturas diferentes, pero no se pueden comparar cuantitativamente por falta de datos.

## Limitaciones y advertencias

- No se especifican las 11 clases exactas, por lo que el usuario debe consultar el codigo o los metadatos del modelo para conocer las categorias reales.
- El modelo fue entrenado presumiblemente con imagenes de trigo de Bangladesh; su rendimiento puede degradarse en otras regiones con variedades de trigo, condiciones de iluminacion o fondos diferentes.
- La salida softmax indica probabilidades, pero no proporciona localizacion de la lesion ni informacion sobre la severidad de la enfermedad.
- No se documentan sesgos especificos, pero es probable que exista un sesgo hacia las condiciones locales de cultivo y las variedades de trigo del sur de Asia.
- Al ser un clasificador de imagenes, no genera explicaciones textuales; el usuario debe interpretar la clase predicha sin contexto adicional.
- La licencia MIT permite uso comercial, pero no se incluye garantia ni responsabilidad por parte del autor.
- El repositorio tiene un tamano declarado de 0.0 GB, lo que sugiere que los pesos pueden estar almacenados externamente o que la informacion de tamano no se ha actualizado correctamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shaq2/chashibhai-wheat-disease-cls
- Coleccion ChashiBhAI on-device disease classifiers: https://huggingface.co/collections/Shaq2/chashibhai-on-device-disease-classifiers
- Clasificador de enfermedades de arroz relacionado: https://huggingface.co/Shaq2/chashibhai-rice-disease-cls
- Repositorio de deteccion de enfermedades de trigo (proyecto web): https://github.com/Ayesshaabbas/wheat-diseases-detection-website
- Asistente de cultivo de trigo con IA: https://github.com/AminaHabiba/Wheat-Farming-Assistant
