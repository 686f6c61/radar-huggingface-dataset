# ketiswp/onnx-model-zoo-ShuffleNetV2-1.0-ImageNet-opset12-int8-uint8-onnx

## Resumen

Este modelo es una versión cuantizada a 8 bits (INT8 para pesos y UINT8 para activaciones) del clasificador de imágenes ShuffleNetV2 1.0, originalmente publicado en el ONNX Model Zoo. El autor, ketiswp, ha convertido el modelo a formato ONNX con opset 12 y ha aplicado una cuantización estática mixta (QOperator/QDQ). Está pensado para su ejecución con ONNX Runtime en entornos con restricciones de memoria o cómputo, como dispositivos de borde o sistemas embebidos.

ShuffleNetV2 es una arquitectura de red neuronal convolucional ligera diseñada para obtener una buena relación entre precisión y eficiencia computacional. La versión 1.0 indica un factor de ancho de la red de 1.0, que es la configuración estándar. El modelo original fue entrenado en ImageNet y es capaz de clasificar imágenes en 1000 categorías. La cuantización a 8 bits reduce el tamaño del modelo y acelera la inferencia, aunque puede introducir una leve degradación de precisión.

Este modelo es relevante para desarrolladores que necesitan desplegar clasificación de imágenes en dispositivos con recursos limitados, ya que la cuantización INT8 es un estándar de facto para la inferencia eficiente con ONNX Runtime. Al estar basado en el ONNX Model Zoo, se beneficia de la validación y del soporte de la comunidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ShuffleNetV2 (red convolucional ligera con unidades de shuffle) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | INT8 (pesos), UINT8 (activaciones), formato mixto QOperator/QDQ |
| Idiomas soportados | no aplica (clasificación de imágenes) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX (opsets 12) |

## Arquitectura y entrenamiento

ShuffleNetV2 es una arquitectura de red neuronal convolucional (CNN) diseñada para ser eficiente en términos de FLOPs y latencia. Su principal innovación es el uso de operaciones de shuffle de canales y convoluciones por grupos, lo que permite reducir la cantidad de parámetros y cómputo sin sacrificar demasiado precisión. El modelo base (sin cuantizar) fue entrenado en el conjunto de datos ImageNet (ILSVRC2012) para clasificación en 1000 clases. Los detalles exactos del entrenamiento (número de épocas, optimizador, etc.) no se proporcionan en la información disponible.

La versión cuantizada se obtiene mediante cuantización estática post-entrenamiento, donde se calculan los rangos de activación con un conjunto de calibración y se transforman los pesos a INT8. El modelo mantiene la estructura original pero con operadores cuantizados, lo que permite su ejecución eficiente en hardware con soporte INT8 (como CPUs con AVX512, ARM NEON o NPUs). No se dispone de información sobre el proceso de calibración específico ni sobre el dataset utilizado para ello.

## Capacidades

- Clasificación de imágenes en 1000 categorías de ImageNet (típicas de ImageNet).
- Inferencia de alta velocidad gracias a la cuantización INT8/UINT8, adecuada para aplicaciones en tiempo real en dispositivos de bajo consumo.
- Compatible con ONNX Runtime, lo que permite su uso en múltiples plataformas (CPU, GPU, dispositivos móviles) mediante el runtime correspondiente.
- No soporta tool calling, generación de texto, razonamiento ni otras capacidades lingüísticas, ya que es un modelo de visión puro.

## Casos de uso

- Clasificación de imágenes en aplicaciones móviles: el modelo puede integrarse en apps Android/iOS usando ONNX Runtime Mobile, ofreciendo una clasificación rápida y con bajo consumo de memoria gracias a su tamaño reducido tras la cuantización.
- Sistemas de moderación de contenido en servidores: la versión INT8 reduce la huella de memoria en entornos con muchas instancias de inferencia concurrentes, permitiendo servir más peticiones por unidad de hardware.
- Reconocimiento de objetos en dispositivos de borde (Raspberry Pi, NVIDIA Jetson): la cuantización permite ejecutar el modelo en CPUs de bajo rendimiento sin necesidad de GPU, manteniendo una latencia aceptable para aplicaciones de control o vigilancia.
- Preprocesamiento en pipelines de visión: se puede usar como clasificador inicial para filtrar imágenes antes de pasarlas a modelos más pesados (p.ej., detección o segmentación), reduciendo el coste computacional global.
- Evaluación de la precisión vs. eficiencia en estudios de cuantización: sirve como referencia para comparar el impacto de la cuantización INT8 en una arquitectura conocida.
- Despliegue en sistemas embebidos con limitaciones de almacenamiento: el tamaño reducido (menos de 10 MB en FP32, aún menor en INT8) permite almacenar el modelo en memoria flash de microcontroladores o módulos IoT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta versión cuantizada en la información disponible. El modelo original de ShuffleNetV2 1.0 en FP32 reporta una precisión top-1 de aproximadamente 69.4% en ImageNet (según el repositorio oficial de ONNX Model Zoo), pero no se ha verificado si la cuantización mantiene esos valores. Se recomienda realizar pruebas propias para medir la pérdida de precisión y la ganancia de velocidad en el hardware objetivo.

## Requisitos de hardware

- VRAM estimada: no disponible, pero al ser un modelo ligero y cuantizado, puede ejecutarse en memoria RAM de dispositivos con menos de 1 GB. En GPU, la VRAM necesaria es mínima (inferior a 200 MB).
- GPU recomendadas: cualquier GPU con soporte INT8 (p. ej., NVIDIA Pascal o posterior) o incluso CPU con instrucciones AVX512.
- Cabe en GPU de consumo: sí, por ejemplo RTX 2060, RTX 3060, etc. También en CPUs de gama baja.
- Opciones de despliegue: ONNX Runtime (C++, Python, C#), también puede convertirse a TensorRT o usar ONNX Runtime Web para navegadores.
- Latencia y throughput estimados: no disponibles. En una CPU moderna (Intel i7), la inferencia FP32 suele tardar unos pocos milisegundos; con cuantización INT8 se espera una reducción de 2-4 veces en latencia y un mayor throughput, pero depende del hardware.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ShuffleNetV2 1.0 (FP32) | ShuffleNetV2 | ~2.3M (estimado) | Imagen | FP32 | Apache-2.0 (original) | ONNX Model Zoo |
| ShuffleNetV2 1.0 (INT8) | ShuffleNetV2 | no disponible | Imagen | INT8/UINT8 | BSD-3-Clause | Este repo |
| MobileNetV2 (INT8) | MobileNetV2 | ~3.4M | Imagen | INT8 | Apache-2.0 | ONNX Model Zoo |
| SqueezeNet 1.1 (INT8) | SqueezeNet | ~1.2M | Imagen | INT8 | BSD-3-Clause | ONNX Model Zoo |

La comparativa se basa en arquitecturas similares de clasificación ligera. ShuffleNetV2 destaca por su balance entre precisión y velocidad, aunque MobileNetV2 suele tener una precisión algo superior a costa de más parámetros. La versión cuantizada de ShuffleNetV2 aquí presentada es una opción viable para despliegue en entornos restringidos, pero no hay datos comparativos de rendimiento exacto con estas alternativas en esta información.

## Limitaciones y advertencias

- La cuantización INT8/UINT8 puede reducir la precisión de clasificación respecto al modelo FP32 original. No se han documentado los resultados de evaluación de esta versión.
- El modelo está entrenado en ImageNet, por lo que su dominio se limita a las 1000 clases de ese dataset. No es adecuado para tareas de clasificación fuera de ese rango sin reentrenamiento o adaptación.
- No se proporcionan detalles sobre el conjunto de calibración usado en la cuantización estática, lo que podría afectar a la calidad de la cuantización en datos diferentes.
- La licencia BSD-3-Clause permite uso comercial, pero se debe revisar la atribución y los términos específicos de la fuente original (ONNX Model Zoo, licencia Apache-2.0 para el modelo original).
- El repositorio no muestra archivos descargables (tamaño 0.0 GB), por lo que puede que el modelo no esté disponible para su descarga directa en Hugging Face; se debe acudir al repositorio original de ONNX Model Zoo.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/ketiswp/onnx-model-zoo-ShuffleNetV2-1.0-ImageNet-opset12-int8-uint8-onnx
- Modelo original en ONNX Model Zoo (GitHub): https://github.com/onnx/models/tree/4f43949841cb55a0b98dc8fcd045431ccafd9f96/validated/vision/classification/shufflenet
- Página del modelo original en Hugging Face (onnxmodelzoo/shufflenet-v2-12): https://huggingface.co/onnxmodelzoo/shufflenet-v2-12
- Repositorio general de ONNX Model Zoo: https://github.com/onnx/models
