# Piyu12/fruit-veg-yolo11m-detector

## Resumen

El modelo `Piyu12/fruit-veg-yolo11m-detector` es un detector de objetos basado en Ultralytics YOLO11m, ajustado específicamente para la detección y el conteo de frutas y verduras. Desarrollado por el usuario Piyu12, este modelo resuelve el problema de identificar y localizar 35 clases distintas de productos agrícolas en imágenes, lo que resulta útil en aplicaciones de inventario, control de calidad y automatización de procesos en el sector agroalimentario. Su relevancia radica en que ofrece una solución de código abierto y lista para usar, con un rendimiento medido en mAP50 de 0,925 y mAP50-95 de 0,691, sobre un dataset de Roboflow.

La arquitectura se basa en YOLO11m, un modelo de detección de objetos en tiempo real de la familia YOLO, conocido por su equilibrio entre precisión y eficiencia. El modelo trabaja con imágenes de entrada de 640x640 píxeles y genera cajas delimitadoras, clases y recuentos. Aunque no se especifican los parámetros totales, YOLO11m es un modelo de tamaño medio dentro de la familia YOLO11, adecuado para ejecutarse en hardware de gama media. La licencia AGPL-3.0 permite su uso, pero impone ciertas obligaciones para su distribución comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11m (Ultralytics) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | no disponible (se usa con la libreria Ultralytics, probablemente .pt) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de YOLO11m, una red neuronal convolucional de detección de objetos desarrollada por Ultralytics. YOLO11m emplea una arquitectura de una sola etapa (single-stage) con backbone CSPDarknet y head de detección, optimizada para inferencia en tiempo real. El ajuste se realizó sobre el dataset `bohni-tech/fruits-and-vegi` (versión 13) de Roboflow, que contiene imágenes anotadas de 35 clases de frutas y verduras. No se dispone de información sobre el número de épocas, el tamaño del dataset ni el uso de técnicas como aumento de datos o estrategias de entrenamiento específicas. Tampoco se detallan innovaciones técnicas adicionales más allá de las propias de la arquitectura YOLO11.

## Capacidades

- Detección de objetos con cajas delimitadoras, clase y confianza para 35 categorías: Apple, Banana, Beetroot, Bitter_Gourd, Bottle_Gourd, Cabbage, Capsicum, Carrot, Cauliflower, Cherry, Chilli, Coconut, Cucumber, EggPlant, Ginger, Grape, Green_Orange, Kiwi, Maize, Mango, Melon, Okra, Onion, Orange, Peach, Pear, Peas, Pineapple, Pomegranate, Potato, Radish, Strawberry, Tomato, Turnip y Watermelon.
- Conteo de instancias de cada clase en una imagen, gracias a la salida de detección múltiple.
- Inferencia sobre imágenes de 640x640 píxeles, con umbral de confianza configurable (por defecto 0,25).
- Integración sencilla con la librería Ultralytics, permitiendo predicción directa desde Python.
- No incluye capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje; es exclusivamente un modelo de visión.

## Casos de uso

- Inventario automatizado en supermercados: el modelo puede contar frutas y verduras en estanterías o cajas a partir de fotografías, facilitando la gestión de stock. Su precisión en mAP50 de 0,925 lo hace adecuado para entornos controlados con iluminación uniforme.
- Control de calidad en líneas de procesamiento: integrado en un sistema de visión industrial, detecta productos defectuosos o ausentes en cintas transportadoras, permitiendo la clasificación automática.
- Agricultura de precisión: mediante drones o cámaras fijas, el modelo cuenta y localiza frutas en árboles o cultivos, ayudando a estimar rendimientos y planificar cosechas.
- Aplicaciones de nutrición y dietética: una app móvil puede usar el modelo para identificar alimentos en una foto y estimar porciones, aunque se requeriría un postprocesado adicional para calcular valores nutricionales.
- Clasificación en almacenes de distribución: el modelo distingue entre 35 tipos de productos, lo que permite separar automáticamente frutas y verduras en cadenas de empaquetado.
- Investigación académica en visión por computador: sirve como punto de partida para experimentos de detección de objetos en dominios específicos, gracias a su licencia abierta y su integración con Ultralytics.

## Benchmarks y rendimiento

El autor reporta las siguientes métricas en el conjunto de validación del dataset utilizado:

| Metrica | Valor |
|---|---|
| mAP50 | 0,925 |
| mAP50-95 | 0,691 |

No se han publicado comparaciones con otros modelos en la información disponible. Estos valores indican un buen rendimiento en detección con IoU 0,5, pero una caída notable en el rango de IoU más estricto (0,5-0,95), lo que sugiere que las cajas delimitadoras pueden no ser muy precisas en localización fina.

## Requisitos de hardware

- No se proporcionan requisitos específicos en la documentación del modelo.
- Como modelo YOLO11m, se espera que la inferencia funcione en GPUs de gama media (por ejemplo, NVIDIA RTX 3060 con 12 GB de VRAM) y también en CPU, aunque con menor rendimiento.
- Para despliegue en producción, se recomienda usar la librería Ultralytics, que soporta exportación a formatos como ONNX, TensorRT y CoreML, así como inferencia en lote.
- No se dispone de datos de latencia o throughput; estos dependerán del hardware y del tamaño de lote.

## Comparativa con modelos similares

No se dispone de información comparativa con otros detectores de frutas y verduras en la documentación proporcionada. Existe otro modelo en Hugging Face (`Senu-12/snapstock-fruit-vegetable-detector`) con un propósito similar, pero no se han publicado sus métricas ni especificaciones, por lo que no es posible realizar una comparación objetiva. El modelo base YOLO11m de Ultralytics podría servir como referencia, pero no se han facilitado sus resultados en este contexto.

## Limitaciones y advertencias

- El modelo se ha entrenado con un dataset específico (Roboflow `bohni-tech/fruits-and-vegi` v13), por lo que su rendimiento puede degradarse con variedades de frutas o verduras no representadas, condiciones de iluminación extremas o ángulos de cámara inusuales.
- Las métricas reportadas (mAP50-95 de 0,691) indican que la precisión de localización no es perfecta; puede haber errores en cajas delimitadoras, especialmente con objetos superpuestos o pequeños.
- La licencia AGPL-3.0 implica que cualquier uso comercial que implique distribución del software debe liberar el código fuente bajo la misma licencia. Esto puede ser restrictivo para integraciones propietarias.
- No se han documentado sesgos específicos, pero es probable que el modelo herede sesgos del dataset de entrenamiento, como desequilibrios en el número de ejemplos por clase.
- No se proporciona información sobre el tamaño del modelo ni los requisitos de memoria, lo que dificulta la planificación de despliegues en entornos con recursos limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Piyu12/fruit-veg-yolo11m-detector
- Documentación de Ultralytics YOLO11: https://docs.ultralytics.com/models/yolo11
- Repositorio de Ultralytics en GitHub: https://github.com/ultralytics/ultralytics
- Dataset utilizado (Roboflow): https://universe.roboflow.com/bohni-tech/fruits-and-vegi (referenciado en la model card)
