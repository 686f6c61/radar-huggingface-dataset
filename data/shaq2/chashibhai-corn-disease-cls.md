# Shaq2/chashibhai-corn-disease-cls

## Resumen

ChashiBhAI Corn Disease Classifier es un clasificador de imágenes de hojas de maíz desarrollado por Shakil Ahmed (Shaq2) para la plataforma ChashiBhAI, una aplicación móvil de diagnóstico agrícola dirigida a agricultores de Bangladesh. El modelo identifica cuatro estados de la hoja de maíz: roya común, mancha gris de la hoja, tizón del norte y hoja sana, y está diseñado para ejecutarse íntegramente en el dispositivo (on-device), sin necesidad de conexión a internet.

El modelo se basa en la arquitectura YOLO26-cls de Ultralytics y se distribuye en formato TFLite con cuantización FP16, con un peso de aproximadamente 10,93 MB. El preprocesamiento requerido es específico (variante C): redimensionar el lado más corto a 640 píxeles, recorte central a 640×640 y normalización RGB dividiendo entre 255. El autor verificó la concordancia entre las salidas FP16 y FP32 con una diferencia máxima de softmax de 1,19e-07 y una concordancia top-1 perfecta.

La relevancia de este modelo radica en su enfoque de diagnóstico en el dispositivo: la identificación de enfermedades ocurre localmente en el teléfono, mientras que la generación de recomendaciones textuales se delega a un LLM separado (KrishokChat) que nunca recibe la imagen. Esto reduce costes, mejora la privacidad y permite su uso en zonas rurales con conectividad limitada. La licencia MIT facilita su reutilización en investigación y desarrollo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26-cls (Ultralytics) exportada a TFLite FP16 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificacion de imagenes) |
| Tipos de cuantizacion | FP16 (TFLite) |
| Idiomas soportados | bengali (bn), ingles (en) |
| Licencia | MIT |
| Formato de pesos | TFLite (`model.tflite`), pesos fuente Ultralytics (`best.pt`) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLO26-cls, la variante de clasificacion de la familia YOLO26 de Ultralytics. Esta arquitectura esta disenada para tareas de clasificacion de imagenes con un balance entre precision y eficiencia computacional, lo que la hace adecuada para su despliegue en dispositivos moviles. El modelo original se entrena en PyTorch/Ultralytics y posteriormente se exporta a TFLite con cuantizacion FP16 para reducir el tamano del archivo (~10,93 MB) y acelerar la inferencia en hardware movil.

No se proporcionan datos sobre el conjunto de entrenamiento, el numero de epocas, el tamano del dataset ni las tecnicas de aumento de datos utilizadas. El autor indica que el modelo esta en estado `production-demo` y que ha pasado una prueba independiente en una maquina separada (agosto de 2026), verificando que el export TFLite carga y clasifica correctamente con el contrato de preprocesamiento definido en `labels.json`. No se menciona el uso de RLHF, DPO u otras tecnicas de alineacion, ya que se trata de un clasificador supervisado clasico.

## Capacidades

- Clasificacion de imagenes de hojas de maiz en 4 clases: `Common_Rust`, `Gray_Leaf_Spot`, `Healthy` y `Northern_Leaf_Blight`.
- Inferencia en el dispositivo (on-device) sin conexion a internet, gracias al formato TFLite optimizado para moviles.
- Preprocesamiento definido de forma estricta (variante C): redimensionado del lado corto a 640, recorte central a 640×640, normalizacion RGB /255.0.
- Salida softmax de 4 probabilidades (una por clase), con `nms: false` (no aplica deteccion de objetos).
- Soporte de etiquetas bilingues (bengali e ingles) en el archivo `labels.json`.
- Integracion con la plataforma ChashiBhAI: el modelo se descarga bajo demanda mediante un gestor de modelos (Model Manager) y no va empaquetado en el APK.
- Compatible con TensorFlow Lite para despliegue en Android y con el ecosistema Ultralytics para reproduccion de la exportacion.

## Casos de uso

- Diagnostico en campo para agricultores de Bangladesh: el agricultor fotografia una hoja de maiz con su telefono y la aplicacion ChashiBhAI ejecuta el modelo localmente para identificar la enfermedad al instante, incluso sin conexion.
- Asistencia agricola offline: al no requerir servidor, el modelo funciona en zonas rurales con cobertura limitada, donde el acceso a internet es intermitente o inexistente.
- Triaje previo a la recomendacion de tratamiento: el clasificador determina si la planta esta sana o enferma; si hay enfermedad, el sistema puede derivar la imagen a un modulo de asesoramiento (KrishokChat) que genera recomendaciones textuales, manteniendo la imagen en el dispositivo.
- Investigacion academica en fitopatologia: investigadores pueden reproducir el flujo de exportacion Ultralytics a TFLite y comparar el rendimiento del modelo en sus propios conjuntos de datos de hojas de maiz.
- Desarrollo de aplicaciones moviles de agricultura de precision: el modelo puede integrarse en otras apps Android o iOS (via TensorFlow Lite) para detectar enfermedades foliares del maiz en tiempo real.
- Educacion y extension agraria: organizaciones no gubernamentales o servicios de extension pueden distribuir la aplicacion con el modelo integrado para formar a agricultores en la identificacion de enfermedades comunes del maiz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica verificaciones de exportacion: concordancia top-1 perfecta entre FP16 y FP32, y una diferencia maxima de softmax de 1,19209e-07. No hay datos de exactitud sobre conjuntos de validacion estandar (p. ej. MMLU, ImageNet) ni comparaciones con otros clasificadores de enfermedades de maiz.

## Requisitos de hardware

- El modelo TFLite pesa aproximadamente 10,93 MB, por lo que es adecuado para cualquier smartphone Android moderno con TensorFlow Lite.
- No se especifican requisitos de VRAM ni GPU; al ser un clasificador de imagenes pequeno, puede ejecutarse en CPU movil sin problemas.
- Opciones de despliegue: TensorFlow Lite en Android/iOS, o mediante el ecosistema Ultralytics (carga de `best.pt`) en entornos de escritorio.
- No se proporcionan datos de latencia ni throughput. Dado el tamano del modelo y la entrada de 640×640, se espera una inferencia de pocos milisegundos en dispositivos moviles de gama media, aunque no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos con otros clasificadores de enfermedades de maiz. El propio autor publica modelos equivalentes para arroz y brassica en la misma coleccion (misma arquitectura y flujo de exportacion), pero no se ofrecen metricas comparadas. Se puede indicar lo siguiente:

| Modelo | Cultivo | Arquitectura | Formato | Licencia |
|---|---|---|---|---|
| Shaq2/chashibhai-corn-disease-cls | Maiz | YOLO26-cls | TFLite FP16 | MIT |
| Shaq2/chashibhai-rice-disease-cls | Arroz | YOLO26-cls | TFLite FP16 | MIT |
| Shaq2/chashibhai-brassica-disease-cls | Brassica | YOLO26-cls | TFLite FP16 | MIT |

No hay comparaciones con modelos externos como PlantVillage o modelos de deteccion de enfermedades de maiz basados en YOLO o EfficientNet en la informacion disponible.

## Limitaciones y advertencias

- El modelo solo cubre 4 clases de un cultivo (maiz); no detecta otras enfermedades ni plagas fuera de ese conjunto.
- No realiza deteccion de objetos ni bounding boxes; solo clasifica la imagen completa. Si la hoja no esta centrada o la imagen es de mala calidad, la precision puede verse afectada.
- El preprocesamiento es estricto (variante C): no se debe usar letterbox. Usar otro preprocesamiento puede degradar el rendimiento o producir errores.
- El modelo no sustituye a un fitopatólogo profesional; el autor recomienda repetir la foto si la confianza es baja o la hoja no esta centrada.
- No se proporcionan datos de sesgos ni de comportamiento en condiciones de iluminacion variable, fondo complejo o variedades de maiz no representadas en el entrenamiento.
- La licencia MIT cubre los pesos, pero Ultralytics mantiene su propia licencia para el software; el autor redistribuye los pesos, no las imagenes de entrenamiento.
- El modelo se distribuye como `production-demo`, lo que indica que no ha pasado por una validacion clinica o de campo exhaustiva.
- No hay informacion sobre el conjunto de entrenamiento, por lo que se desconoce su representatividad geografica o varietal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shaq2/chashibhai-corn-disease-cls
- Coleccion de clasificadores on-device: https://huggingface.co/collections/Shaq2/chashibhai-on-device-disease-classifiers
- Codigo fuente (GitHub): https://github.com/MRSHAKILS/AI-Powered-Smart-Agriculture-Advisory-Platform-for-Bangladesh
- Modelo de arroz: https://huggingface.co/Shaq2/chashibhai-rice-disease-cls
- Modelo de brassica: https://huggingface.co/Shaq2/chashibhai-brassica-disease-cls
- Indice de la suite: https://huggingface.co/Shaq2/chashibhai-disease-classifiers
- LLM de asesoramiento KrishokChat (no es este modelo): https://huggingface.co/RaiyanKhaan/KrishokChat-Advisory-System
- Articulo arXiv citado (no verificado): arXiv:2606.29243 (Reza & Shahid)
