# adarshcod30/openforensics-ensemble

## Resumen

El modelo `adarshcod30/openforensics-ensemble` es un detector de deepfakes basado en un ensamblado de dos redes neuronales convolucionales (CNN) con arquitecturas ResNet50 y VGG16. Desarrollado por Adarsh Dwivedi (usuario `adarshcod30`), el modelo clasifica recortes de rostros como **Real** o **Falso** mediante una salida sigmoide que indica la probabilidad de que la imagen sea genuina. Su propósito principal es la detección de imágenes faciales manipuladas, un problema relevante en la moderación de contenido, verificación de identidad y análisis forense digital.

El modelo se entrenó sobre la distribución OpenForensics, un conjunto de datos a gran escala diseñado para la detección y segmentación de falsificaciones faciales en entornos del mundo real. El repositorio tiene un tamaño de 0,2 GB y está publicado con licencia MIT, lo que permite su uso comercial y académico sin restricciones significativas. La arquitectura combina las características extraídas de ambos backbones, concatenando sus embeddings y alimentando una cabeza clasificadora compartida, lo que aprovecha la complementariedad de las representaciones. No se especifica el número total de parámetros, pero el tamaño del archivo sugiere un modelo relativamente ligero en comparación con otros detectores de deepfakes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensamblado de dos backbones CNN (ResNet50 y VGG16) con embeddings concatenados y cabeza clasificadora compartida |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (procesamiento de imagen) |
| Licencia | MIT |
| Formato de pesos | Keras (.keras) |

## Arquitectura y entrenamiento

El modelo es un ensamblado de dos redes convolucionales preentrenadas: ResNet50 y VGG16. Ambas procesan la imagen de entrada (redimensionada a 224x224 píxeles y escalada a [0,1]) y producen embeddings de características. Estos embeddings se concatenan y se pasan a una cabeza clasificadora totalmente conectada que genera una única salida sigmoide, interpretada como la probabilidad de que la imagen sea real (P(Real)). La normalización específica de cada backbone se realiza internamente dentro del modelo, por lo que no es necesario aplicar `preprocess_input` manualmente.

El entrenamiento se realizó sobre el conjunto de datos OpenForensics, específicamente la versión de recortes de caras con 190.334 imágenes a 256x256 píxeles. Se empleó una aumentación de datos ligera que incluye volteo horizontal y pequeños ajustes de brillo y contraste, sin aumentación de corrupción. Se aplicó una temperatura de 1.099 calibrada en el conjunto de validación, y el umbral de decisión por defecto es 0.500, aunque el autor advierte que este umbral no está ajustado de forma óptima y recomienda seleccionar un punto de operación apropiado para cada despliegue.

## Capacidades

- Clasificación binaria de recortes de rostros: distingue entre imágenes reales y falsificadas (deepfakes).
- Salida probabilística: proporciona una puntuación continua entre 0 y 1, permitiendo ajustar el umbral de decisión según la aplicación.
- Procesamiento de imágenes de entrada de tamaño fijo (224x224), con normalización interna.
- Detección de manipulaciones faciales presentes en el conjunto OpenForensics, que incluye diversas técnicas de falsificación.
- No soporta tool calling, agentes ni razonamiento multi-paso (es un modelo puramente de visión).
- No es multilingüe ni tiene capacidades de generación de texto.

## Casos de uso

- Moderación de contenido en plataformas sociales: el modelo puede integrarse en pipelines de revisión para detectar imágenes de rostros generadas o manipuladas, ayudando a filtrar contenido engañoso antes de su publicación.
- Verificación de identidad en sistemas de autenticación: como capa adicional para validar que las imágenes de documento o selfies no hayan sido alteradas, reduciendo el riesgo de fraude.
- Análisis forense en investigaciones periodísticas o legales: permite a los analistas evaluar rápidamente si una imagen facial es auténtica, aunque no debe considerarse una autoridad forense definitiva.
- Investigación académica en detección de deepfakes: sirve como punto de partida o modelo de referencia para comparar nuevas técnicas de detección, gracias a su licencia abierta y su arquitectura sencilla.
- Auditoría de contenido en archivos históricos o de prensa: ayuda a identificar posibles manipulaciones en imágenes faciales de archivo, facilitando la verificación de autenticidad.
- Sistemas de alerta temprana en campañas de desinformación: al integrarse en herramientas de monitorización, puede señalar imágenes faciales sospechosas que requieran revisión humana.

## Benchmarks y rendimiento

Según la model card, el modelo fue evaluado en un conjunto de test separado (deduplicado por hash de contenido respecto a entrenamiento y validación) con aumentación de test-time mediante volteo horizontal. Los resultados reportados son:

| Metrica | Valor |
|---|---|
| Accuracy | 0.8860 |
| ROC-AUC | 0.9421 |
| PR-AUC | 0.9527 |
| Imagenes reales clasificadas como falsas | 175 (17,5 %) |

No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- El modelo tiene un tamaño de 0,2 GB, lo que lo hace ligero para inferencia en GPU o CPU.
- Al ser un ensamblado de ResNet50 y VGG16, el número de parámetros estimado ronda los 50-60 millones, aunque no se especifica oficialmente. Esto implica un consumo de VRAM de aproximadamente 0,5-1 GB en precisión float32, dependiendo del lote.
- Es ejecutable en GPUs de consumo como la serie RTX 3060, RTX 4060 o superiores, así como en CPUs modernas con suficiente memoria RAM.
- Para despliegue, el modelo se carga con TensorFlow/Keras (`tf.keras.models.load_model`). Puede servirse mediante TensorFlow Serving, convertirse a TensorFlow Lite para dispositivos móviles, o exportarse a formato SavedModel para uso en frameworks como ONNX Runtime.
- No se dispone de datos de latencia o throughput específicos en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información comparativa con otros detectores de deepfakes en la documentación proporcionada. Sin embargo, es habitual comparar con arquitecturas como Xception, EfficientNet o MesoNet, aunque no hay datos cuantitativos disponibles para este modelo en particular.

## Limitaciones y advertencias

- El modelo fue entrenado exclusivamente con recortes de rostros. Su comportamiento en imágenes completas o escenas sin rostros es indefinido y probablemente poco fiable.
- Una puntuación cercana al umbral (0.5) no es evidencia concluyente; el margen de la puntuación debe considerarse parte de la salida.
- El rendimiento se degrada en métodos de manipulación no presentes en el conjunto de entrenamiento OpenForensics.
- La calibración entre validación y test no se transfiere bien: el recall en imágenes genuinas es 0.984 en validación pero 0.825 en test, y hay un subconjunto de imágenes de test que se clasifican erróneamente con alta confianza. Esto sugiere que la calibración puede variar en entornos con degradaciones de imagen (desaturación, ruido, compresión, etc.).
- No es una autoridad forense; su uso está orientado a investigación y educación.
- La licencia MIT permite uso comercial, pero no garantiza la ausencia de sesgos o errores en contextos de producción.

## Enlaces

- [HuggingFace - adarshcod30/openforensics-ensemble](https://huggingface.co/adarshcod30/openforensics-ensemble)
- [GitHub del autor - adarshcod30](https://github.com/adarshcod30)
- [Repositorio OpenForensics (dataset)](https://github.com/ltnghia/openforensics)
- [Paper original OpenForensics (ICCV 2021)](https://arxiv.org/abs/2107.14480)
