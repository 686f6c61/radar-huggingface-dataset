# Shaq2/chashibhai-rice-disease-cls

## Resumen

El modelo `Shaq2/chashibhai-rice-disease-cls` es un clasificador de imágenes de hojas de arroz desarrollado por Shakil Ahmed (Shaq2) como parte del proyecto ChashiBhAI, una plataforma de asesoramiento agrícola inteligente para Bangladesh. El modelo identifica ocho estados de salud foliar del arroz, incluyendo enfermedades comunes como la añublo bacteriano, la mancha parda y el tizón de la vaina, y está diseñado para ejecutarse íntegramente en dispositivos móviles, sin conexión a internet.

La arquitectura se basa en un clasificador YOLO26-cls de Ultralytics, exportado posteriormente a TensorFlow Lite en precisión FP16. El modelo resultante ocupa aproximadamente 3,12 MB, lo que permite su integración en aplicaciones Android mediante un paquete APK. La entrada es una imagen RGB de 640×640 píxeles (tras un preprocesamiento específico de redimensionado y recorte central) y la salida es un vector de probabilidades softmax de 8 clases.

La relevancia actual del modelo radica en su enfoque de diagnóstico en el dispositivo: la aplicación ChashiBhAI procesa las fotos de las hojas localmente, sin enviar imágenes a la nube, lo que garantiza privacidad y funciona en zonas rurales con conectividad limitada. El modelo se distribuye bajo licencia MIT, con pesos disponibles en Hugging Face, y forma parte de una colección más amplia de clasificadores para arroz, colza y maíz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26-cls (Ultralytics) exportado a TFLite FP16 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | FP16 (TFLite) |
| Idiomas soportados | bengali (bn), ingles (en) |
| Licencia | MIT (los pesos; Ultralytics mantiene su propia licencia) |
| Formato de pesos | TFLite (model.tflite), tambien disponible en formato Ultralytics (best.pt) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura YOLO26-cls de Ultralytics, una variante de clasificacion de la familia YOLO disenada para tareas de vision por computador. Aunque no se han publicado detalles especificos sobre el entrenamiento (numero de imagenes, composicion del dataset, epocas o tecnicas de aumento), el autor indica que el modelo fue entrenado para distinguir ocho clases de hojas de arroz, incluyendo una clase de hoja sana. El proceso de exportacion a TFLite FP16 se realizo con un contrato de preprocesamiento especifico (variante C), que consiste en redimensionar el lado mas corto a 640 píxeles, aplicar un recorte central a 640×640 y normalizar los valores RGB a [0,1] dividiendo por 255. Este contrato se verifico contra el modelo fuente `.pt`, logrando una concordancia del 100% en top-1 sobre un conjunto de retencion. La conversion a FP16 no introdujo diferencias significativas: la concordancia top-1 entre FP16 y FP32 fue de 1.0, con una diferencia maxima en la softmax de 0.000372171.

No se dispone de informacion sobre el uso de tecnicas como RLHF o DPO, ya que se trata de un modelo de clasificacion supervisada, no de un modelo de lenguaje.

## Capacidades

- Clasificacion de imagenes de hojas de arroz en 8 categorias: Bacterial Leaf Blight, Brown Spot, Healthy Leaf, Leaf Blast, Leaf Scald, Narrow Brown Leaf Spot, Rice Hispa y Sheath Blight.
- Ejecucion completamente en el dispositivo (on-device), sin necesidad de conexion a internet, gracias a la conversion a TFLite.
- Salida de probabilidades softmax para cada clase, permitiendo evaluar la confianza de la prediccion.
- Preprocesamiento estandarizado y documentado (variante C) para garantizar consistencia entre el modelo fuente y el exportado.
- Compatibilidad con el ecosistema Ultralytics para entrenamiento y exportacion adicional.
- Soporte de etiquetas bilingues (bengali e ingles) en el archivo `labels.json`, facilitando la integracion en interfaces de usuario en Bangla.
- No incluye capacidades de deteccion de objetos ni bounding boxes; se limita a clasificacion de imagenes completas.

## Casos de uso

- Diagnostico en campo para agricultores: un agricultor puede fotografiar una hoja de arroz con su telefono y obtener una clasificacion inmediata de la enfermedad, sin necesidad de enviar la imagen a un servidor. Esto es util en zonas rurales de Bangladesh con baja cobertura de datos.
- Integracion en aplicaciones moviles de asesoramiento agricola: la app ChashiBhAI (desarrollada con Expo/React Native) incorpora este clasificador para realizar el diagnostico visual en el dispositivo, mientras que un sistema separado (KrishokChat) genera recomendaciones de texto basadas en la clasificacion.
- Monitoreo de cultivos a gran escala: organizaciones agricolas o cooperativas pueden desplegar el modelo en tablets o telefonos para inspeccionar rapidamente multiples hojas y registrar la prevalencia de enfermedades en una parcela.
- Educacion y extensionismo agricola: el modelo puede utilizarse en programas de formacion para ensenar a tecnicos y estudiantes a identificar visualmente las enfermedades del arroz, comparando las predicciones con imagenes de referencia.
- Investigacion en vision por computador aplicada a la agricultura: como punto de partida para reproducir el proceso de exportacion de YOLO26-cls a TFLite y validar metodologias de cuantizacion en modelos de clasificacion de plantas.
- Prototipado rapido de soluciones de diagnostico agricola: gracias a su tamano reducido (3,12 MB) y su licencia MIT, el modelo puede integrarse facilmente en aplicaciones de demostracion o en proyectos de codigo abierto sin restricciones de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (como MMLU, HumanEval o similar) en la informacion disponible, ya que se trata de un modelo de clasificacion de imagenes y no de un modelo de lenguaje. Sin embargo, el autor proporciona metricas de validacion de la exportacion:

| Metrica | Valor |
|---|---|
| Concordancia top-1 entre preproceso variante C y modelo `.pt` | 100% (sobre conjunto de retencion) |
| Concordancia top-1 FP16 vs FP32 | 1.0 |
| Diferencia maxima en softmax FP16 vs FP32 | 0.000372171 |
| Prueba en maquina independiente | Pasada (agosto 2026) |

Estas metricas confirman que la version TFLite FP16 reproduce fielmente el comportamiento del modelo original, pero no se proporcionan datos de precision sobre conjuntos de prueba publicos.

## Requisitos de hardware

- El modelo TFLite ocupa aproximadamente 3,12 MB, por lo que puede ejecutarse en cualquier dispositivo movil moderno con soporte para TensorFlow Lite (Android o iOS).
- No requiere GPU dedicada; la inferencia puede realizarse en CPU con bajo consumo de recursos.
- El modelo esta disenado para ejecucion en el dispositivo, por lo que no necesita servidores ni infraestructura en la nube.
- Para cargar y ejecutar el modelo en Python, se requiere TensorFlow Lite (`tensorflow` o `tflite-runtime`), Pillow y NumPy.
- No se han publicado datos de latencia o throughput; sin embargo, dado el tamano del modelo y la resolucion de entrada (640×640), se espera una inferencia en el orden de decenas de milisegundos en hardware movil actual.
- Opciones de despliegue: aplicaciones Android (APK), aplicaciones React Native (via TFLite), o cualquier entorno que soporte TFLite (Python, C++, etc.). No se mencionan herramientas como vLLM u Ollama, que son especificas de modelos de lenguaje.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (clasificadores de enfermedades de arroz en TFLite) dentro de la informacion proporcionada. Existen otros proyectos de deteccion de enfermedades de plantas, como el repositorio `poojabharamagoudr/RicePlantDiseaseDetector` o `jayxdev/Rice-plant-disease-detection`, pero no se aportan datos tecnicos suficientes para una comparacion rigurosa. Por tanto, se indica que la comparativa no esta disponible.

## Limitaciones y advertencias

- El modelo se describe como "demo-grade" y no debe utilizarse como sustituto de un fitopatólogo profesional.
- La clasificacion puede ser incorrecta si la hoja no esta centrada en la imagen o si la confianza de la prediccion es baja; el autor recomienda repetir la captura en tales casos.
- Solo cubre 8 clases de enfermedades; no incluye otras afecciones comunes del arroz ni etapas de severidad.
- No realiza deteccion de objetos ni bounding boxes; la imagen completa se clasifica como una unica entidad.
- El modelo no proporciona recomendaciones de tratamiento ni dosificacion quimica; esa parte se delega en un sistema de asesoramiento separado con una "puerta de rechazo" para evitar consejos peligrosos.
- No se especifica el conjunto de datos de entrenamiento ni su procedencia, lo que limita la evaluacion de posibles sesgos.
- La licencia MIT se aplica a los pesos, pero Ultralytics mantiene su propia licencia para el software subyacente; es necesario revisar ambas licencias antes de un uso comercial extenso.
- El modelo fue validado en agosto de 2026 en una maquina independiente, pero no se han publicado pruebas exhaustivas en condiciones de campo reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shaq2/chashibhai-rice-disease-cls
- Codigo fuente (GitHub): https://github.com/MRSHAKILS/AI-Powered-Smart-Agriculture-Advisory-Platform-for-Bangladesh
- Coleccion de clasificadores on-device: https://huggingface.co/collections/Shaq2/chashibhai-on-device-disease-classifiers
- Modelos relacionados del mismo autor: https://huggingface.co/Shaq2/chashibhai-brassica-disease-cls y https://huggingface.co/Shaq2/chashibhai-corn-disease-cls
- Indice de la suite: https://huggingface.co/Shaq2/chashibhai-disease-classifiers
- Referencia a KrishokChat (sistema de asesoramiento, no este modelo): https://huggingface.co/RaiyanKhaan/KrishokChat-Advisory-System y arXiv:2606.29243 (Reza & Shahid)
