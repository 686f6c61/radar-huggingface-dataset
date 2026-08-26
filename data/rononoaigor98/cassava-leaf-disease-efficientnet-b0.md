# RononoaIgor98/cassava-leaf-disease-efficientnet-b0

## Resumen

El modelo `RononoaIgor98/cassava-leaf-disease-efficientnet-b0` es un clasificador de imágenes basado en EfficientNet-B0, ajustado (fine-tuning) para identificar cinco enfermedades comunes de la hoja de yuca (cassava) a partir de fotografías tomadas en campo. Ha sido desarrollado por RononoaIgor98 como un primer paso hacia soluciones de visión por computador desplegables en entornos offline y con recursos limitados, especialmente en el contexto agrícola africano. El modelo se entrenó sobre el dataset de Kaggle "Cassava Leaf Disease Classification", que contiene aproximadamente 21.400 imágenes reales recogidas en Uganda por el Makerere AI Lab.

La relevancia de este modelo radica en su potencial para facilitar el diagnóstico temprano de enfermedades en un cultivo básico para la seguridad alimentaria en África subsahariana. Al ser un modelo ligero (EfficientNet-B0), puede ejecutarse en dispositivos de bajo coste, lo que lo hace adecuado para aplicaciones de agricultura de precisión en zonas rurales. La licencia Apache 2.0 permite su uso comercial y modificación sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B0 (CNN convolucional) |
| Parametros totales | no disponible (EfficientNet-B0, sin cifra exacta en la documentacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, no textual) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`pytorch_model.bin`) |

## Arquitectura y entrenamiento

El modelo se basa en EfficientNet-B0, una arquitectura convolucional eficiente que utiliza compound scaling para equilibrar profundidad, anchura y resolución. Se parte de pesos preentrenados en ImageNet y se realiza un ajuste fino sobre el dataset de hojas de yuca. La entrada es de 224x224 píxeles con normalización estándar de ImageNet. Durante el entrenamiento se aplicaron aumentos de datos (volteos, rotaciones, variación de color) y se utilizó una pérdida de entropía cruzada ponderada por clase (inversa a la frecuencia) para mitigar el fuerte desequilibrio del dataset, donde la clase "Mosaic" representa aproximadamente el 61% de las muestras. El optimizador fue AdamW con una tasa de aprendizaje de 1e-4 y se entrenaron 5 épocas en una GPU Tesla T4 de Kaggle.

No se mencionan innovaciones técnicas adicionales más allá del uso de pesos de clase y la elección de EfficientNet-B0 por su equilibrio entre precisión y coste computacional.

## Capacidades

- Clasificación de imágenes de hojas de yuca en 5 categorías: Bacterial Blight (CBB), Brown Streak Disease (CBSD), Green Mottle (CGM), Mosaic Disease (CMD) y hoja sana.
- Detección de enfermedades a partir de fotografías de campo, con una precisión global (accuracy) de 0.73–0.76 en un split de validación estratificado del 20%.
- Buen rendimiento en la clase mayoritaria (Mosaic, F1 0.85), aunque con menor precisión en clases raras.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales más allá de la visión.
- No tiene capacidades multilingües (es un modelo puramente visual).

## Casos de uso

- Diagnóstico temprano en campo: un agricultor puede fotografiar una hoja con su teléfono y obtener una predicción de enfermedad en segundos, permitiendo una intervención rápida y reduciendo pérdidas de cosecha.
- Aplicación móvil de asistencia agrícola: integración del modelo en una app que funcione offline, sin necesidad de conexión a internet, para zonas rurales con conectividad limitada.
- Monitorización de cultivos a gran escala: uso en drones o estaciones fijas para analizar imágenes de plantaciones y detectar focos de enfermedad de forma automatizada.
- Herramienta de apoyo a extensionistas agrícolas: los técnicos pueden validar sus diagnósticos visuales con una segunda opinión automática, mejorando la precisión en la identificación de enfermedades similares.
- Investigación en fitopatología: el modelo puede servir como baseline para estudios comparativos de arquitecturas o para explorar la transferencia de aprendizaje en otros cultivos.
- Educación y divulgación: demostración de aplicaciones de IA en agricultura para estudiantes y comunidades, mostrando cómo un modelo ligero puede resolver problemas reales.

## Benchmarks y rendimiento

Según la model card, los resultados sobre un split de validación estratificado del 20% son:

| Metrica | Valor |
|---|---|
| Accuracy | 0.73–0.76 |
| Macro F1 | 0.63 |
| F1 en clase Mosaic | 0.85 |
| Precision en clase Bacterial Blight | ~0.39 |

No se han publicado comparaciones con otros modelos en la información disponible. El autor indica que las confusiones más frecuentes se dan entre Green Mottle y Brown Streak, enfermedades visualmente similares.

## Requisitos de hardware

- Al ser EfficientNet-B0, el modelo es ligero y puede ejecutarse en CPU, aunque para inferencia en tiempo real se recomienda una GPU modesta.
- No se proporcionan requisitos específicos de VRAM en la documentación. Como referencia, EfficientNet-B0 tiene alrededor de 5.3 millones de parámetros, lo que implica un uso de memoria inferior a 100 MB en precisión FP32.
- Es adecuado para dispositivos edge (Raspberry Pi, Jetson Nano, teléfonos móviles) y para despliegue en la nube con instancias de GPU pequeñas (T4, V100).
- Opciones de despliegue: puede servirse con frameworks como TorchServe, ONNX Runtime o TensorFlow Lite, aunque no se mencionan configuraciones específicas.
- La latencia en CPU típica para una imagen de 224x224 sería del orden de decenas de milisegundos, pero no hay datos medidos publicados.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos en la información proporcionada. Existen trabajos relacionados en la literatura (por ejemplo, EfficientNetB3 en el repositorio de MingDanng, o el modelo híbrido ResVNet mencionado en un artículo), pero no se aportan métricas comparables para este modelo concreto. Por tanto, no se puede establecer una tabla comparativa fiable.

## Limitaciones y advertencias

- El modelo es un primer baseline entrenado solo durante 5 épocas y sin ajuste de hiperparámetros, por lo que su rendimiento está lejos del estado del arte.
- Debido al uso de pesos de clase, sobrepredice clases raras (por ejemplo, Bacterial Blight tiene una precisión de ~0.39), lo que puede generar falsos positivos en esas categorías.
- No ha sido validado en yuca de otras regiones ni en condiciones diferentes a las de campo en Uganda; su generalización a otros entornos es incierta.
- El dataset está muy desequilibrado, y aunque se mitigó con pesos, el modelo sigue siendo más fiable en la clase mayoritaria (Mosaic).
- No se proporcionan métricas de calibración ni análisis de incertidumbre, por lo que las probabilidades de salida no deben interpretarse como confianza calibrada.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías y el autor no ofrece soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RononoaIgor98/cassava-leaf-disease-efficientnet-b0
- Dataset de Kaggle (referencia): https://www.kaggle.com/competitions/cassava-leaf-disease-classification
- Repositorio relacionado (adhoc-research): https://github.com/adhoc-research/cassava_leaf_disease_classification
- Repositorio relacionado (MingDanng): https://github.com/MingDanng/Cassava_Leaf_Disease_AI/tree/main
- Artículo en IEEE (EfficientNet para yuca): https://ieeexplore.ieee.org/abstract/document/10956798
- Noticia sobre modelo ResVNet (agritechinsights): https://agritechinsights.com/index.php/2026/08/26/revolutionary-ai-model-spots-plant-diseases-with-97-accuracy/
