# litert-community/BiRefNet-Lite

## Resumen

BiRefNet-Lite es una exportación a LiteRT/TFLite en FP32 del modelo BiRefNet Lite, una red neuronal convolucional diseñada para segmentación de primer plano y eliminación de fondo de alta resolución. El modelo original fue desarrollado por Peng Zheng y colaboradores (Universidad de Nanjing y socios académicos) y presentado en el artículo "Bilateral Reference for High-Resolution Dichotomous Image Segmentation" (CAAI Artificial Intelligence Research, 2024). Esta conversión la mantiene el colectivo litert-community y está pensada para su despliegue en entornos con el runtime LiteRT (anteriormente TensorFlow Lite), típicamente dispositivos móviles y de borde.

La relevancia de esta ficha radica en que ofrece la misma capacidad de segmentación del checkpoint original, pero empaquetada como un único archivo TFLite de 184 MB con formas fijas y todas las operaciones en `float32`, lo que simplifica la integración en aplicaciones Android, iOS o sistemas embebidos sin necesidad de un framework de deep learning completo. El modelo devuelve directamente una máscara de probabilidad de primer plano en el rango [0, 1] con la sigmoide final ya incluida, evitando pasos de postprocesado matemático en el host.

Al ser una conversión de inferencia, no incorpora capacidades generativas ni de lenguaje: es un modelo puramente de visión por computador, orientado a una única tarea (segmentación binaria de primer plano). Su licencia MIT y su tamaño contenido lo hacen adecuado para prototipos y productos comerciales con requisitos de privacidad en el dispositivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiRefNet Lite (red convolucional con referencias bilaterales; arquitectura exacta no detallada en la información disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija de 1024 × 1024 píxeles) |
| Tipos de cuantizacion | solo FP32 en esta exportación; el checkpoint original puede admitir otras conversiones no documentadas aquí |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | MIT |
| Formato de pesos | TFLite (LiteRT), archivo `BiRefNet-Lite-fp32.tflite` de 184 MB |
| Entrada | `pixel_values` `[1, 3, 1024, 1024]` float32, RGB normalizado NCHW |
| Salida | `foreground_probability` `[1, 1, 1024, 1024]` float32 en [0, 1] |
| Firma TFLite | `main` |
| Tamano del repo | 0.2 GB |

## Arquitectura y entrenamiento

BiRefNet (Bilateral Reference Network) es una arquitectura de segmentación de imágenes de alta resolución que emplea referencias bilaterales para mejorar la delimitación de objetos dicotómicos (primer plano frente a fondo). El artículo original describe el uso de módulos de referencia que combinan información de bajo y alto nivel para refinar los bordes y la estructura fina de la máscara. La variante "Lite" es una versión reducida del modelo completo, orientada a un menor coste computacional y a su despliegue en dispositivos con recursos limitados.

Esta exportación concreta no aporta información sobre el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO u otras técnicas). Se trata de una conversión de los pesos preentrenados del checkpoint `ZhengPeng7/BiRefNet_lite` (revisión `aa62cd87eafb9cc43056d08ef3615a14628b831d`) a un grafo TFLite de formas fijas, sin reentrenamiento ni ajuste fino adicional. La innovación técnica de esta versión es la propia conversión: mantiene precisión FP32, expone una firma `main` estable y encapsula la sigmoide final en el grafo, de modo que la salida ya es una probabilidad utilizable como canal alfa.

## Capacidades

- Segmentación de primer plano en imágenes RGB de hasta 1024 × 1024 píxeles de entrada.
- Eliminación de fondo: genera una máscara alfa suave que puede aplicarse directamente sobre la imagen original para producir un PNG con transparencia.
- Segmentación dicotómica de alta resolución: pensada para objetos con bordes finos (pelo, ramas, telas, etc.), según la motivación del artículo original.
- Salida probabilística continua en [0, 1], adecuada para composición alfa y para umbralización posterior según la aplicación.
- Inferencia en CPU mediante el intérprete LiteRT (`ai_edge_litert`), sin necesidad de GPU.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo unimodal de visión y tarea única.
- No incluye decodificación de imagen/vídeo ni preprocesado: esas etapas deben ejecutarse en el host.

## Casos de uso

- Eliminación de fondo en aplicaciones móviles: el archivo TFLite de 184 MB y la firma fija permiten integrar el modelo en apps Android/iOS con LiteRT, procesando la imagen en el dispositivo y preservando la privacidad del usuario.
- Generación de avatares y fotos de producto: se aplica la máscara de primer plano para recortar personas u objetos y componerlos sobre fondos nuevos en flujos de e-commerce o redes sociales.
- Edición fotográfica por lotes: al ser una entrada de forma fija 1024 × 1024, se puede procesar un lote de imágenes redimensionadas de forma determinista y restaurar la máscara al tamaño original con interpolación bilinear.
- Videoconferencia y filtros en tiempo real: la inferencia en CPU con LiteRT permite sustituir el fondo en fotogramas redimensionados, siempre que la latencia del dispositivo lo permita (no se han publicado cifras de throughput).
- Segmentación previa en pipelines de visión: la máscara suave puede alimentar etapas posteriores (detección, matting, composición) en sistemas de borde o embebidos.
- Prototipado rápido y demos: al ser un único archivo con licencia MIT, se puede distribuir y probar sin dependencias pesadas, facilitando la evaluación antes de adoptar el checkpoint original en PyTorch.
- Preprocesado para datasets: extracción automática de primer plano en grandes colecciones de imágenes para entrenar otros modelos o para anonimizar fondos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el archivo pesa 184 MB en FP32; en inferencia hay que sumar los tensores intermedios de una entrada 1 × 3 × 1024 × 1024 y una salida 1 × 1 × 1024 × 1024 (aproximadamente 12 MB y 4 MB respectivamente en float32), por lo que el consumo de memoria es moderado y cabe en dispositivos con 1-2 GB de RAM libre.
- GPU recomendadas: no se especifican; el modelo está pensado para ejecución en CPU mediante LiteRT. Para GPU sería necesario un delegado de LiteRT compatible, no documentado en la información disponible.
- Cabe en GPU de consumo: sí, por tamaño, aunque el formato TFLite no está orientado a GPUs de escritorio; el uso típico es CPU móvil o de borde.
- Opciones de despliegue: intérprete LiteRT (`ai_edge_litert`) en Python, Android o iOS; el README proporciona un ejemplo en Python con `Interpreter` y `num_threads=4`.
- Latencia y throughput: no disponibles. Dependen del dispositivo y del número de hilos configurado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BiRefNet-Lite (esta ficha) | no disponible | 1024 × 1024 fija | TFLite FP32 | MIT | Hugging Face (litert-community) |
| ZhengPeng7/BiRefNet_lite | no disponible | no disponible | PyTorch (safetensors/bin) | MIT (según modelo base) | Hugging Face |
| onnx-community/BiRefNet_lite-ONNX | no disponible | no disponible | ONNX | MIT (según modelo base) | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada. Las tres comparten los mismos pesos de origen; la diferencia principal es el formato de exportación y el runtime objetivo.

## Limitaciones y advertencias

- Modelo de tarea única: no genera texto, no razona y no admite instrucciones; cualquier uso fuera de segmentación de primer plano no es válido.
- Entrada de forma fija 1024 × 1024: no admite imágenes de otras resoluciones sin redimensionar en el host, lo que puede degradar la precisión en objetos muy pequeños o muy alargados.
- Solo FP32: no se ofrece una versión cuantizada en esta exportación, por lo que el tamaño (184 MB) y el coste computacional son mayores que los de una variante int8.
- Riesgo de segmentación incorrecta en escenas ambiguas, objetos translúcidos, fondos con colores similares al sujeto o imágenes de baja calidad; no se han documentado sesgos específicos del dataset de entrenamiento en la información disponible.
- El preprocesado (redimensionado bilinear, normalización ImageNet, transposición a NCHW) y el postprocesado (redimensionado de la máscara al tamaño original) son responsabilidad del usuario; errores en estos pasos degradan la calidad del resultado.
- Licencia MIT: permite uso comercial, pero se recomienda conservar el aviso de copyright y la cita del artículo original.
- No se han publicado métricas de latencia ni de calidad (IoU, F-measure) para esta conversión concreta; conviene validar en el dispositivo objetivo antes de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/BiRefNet-Lite
- Modelo base: https://huggingface.co/ZhengPeng7/BiRefNet_lite
- Revisión del checkpoint base: https://huggingface.co/ZhengPeng7/BiRefNet_lite/tree/aa62cd87eafb9cc43056d08ef3615a14628b831d
- Repositorio del proyecto BiRefNet: https://github.com/ZhengPeng7/BiRefNet
- Artículo (arXiv): https://arxiv.org/abs/2401.03407
- Exportación ONNX de la comunidad: https://huggingface.co/onnx-community/BiRefNet_lite-ONNX
