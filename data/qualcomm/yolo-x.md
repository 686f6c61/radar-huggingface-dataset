# qualcomm/Yolo-X

## Resumen

Yolo-X es un modelo de detección de objetos en tiempo real basado en la implementación YOLOX Small del repositorio Megvii-BaseDetection, empaquetado y optimizado por Qualcomm para su despliegue en dispositivos con aceleración NPU de la familia Snapdragon y Dragonwing. El modelo predice cajas delimitadoras y clases de objetos sobre imágenes de entrada de 640x640 píxeles, y se distribuye en formatos precompilados (ONNX, QNN_DLC y TFLITE) con distintas precisiones (float, w8a16, w8a8 y w8a8_mixed_int16) listos para ejecutarse sobre el runtime QAIRT 2.51.

Se trata de un modelo convolucional compacto de 8,98 millones de parámetros y 34,3 MB en precisión float, que se reduce hasta 8,96 MB en cuantización w8a8. No es un modelo generativo ni un LLM: es un detector de objetos de una sola etapa pensado para inferencia de baja latencia en el borde. Su relevancia actual radica en que Qualcomm publica artefactos ya compilados y perfilados para chipsets concretos, con tiempos de inferencia medidos que van desde 5,48 ms en Snapdragon 8 Elite Extreme Gen 6 hasta 21,449 ms en Snapdragon 8 Gen 1, lo que facilita la integración en aplicaciones Android y en plataformas embebidas sin necesidad de recompilar.

El repositorio tiene 565 descargas y 9 likes en Hugging Face, con licencia Apache 2.0, lo que permite uso comercial. La ficha se centra en las capacidades de detección y en los artefactos de despliegue publicados; no se dispone de información sobre el dataset de entrenamiento original ni sobre métricas de precisión (mAP) en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOX Small (detector de objetos de una etapa, convolucional) |
| Parametros totales | 8,98 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | float, w8a16, w8a8, w8a8_mixed_int16 |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX, QNN_DLC, TFLITE; checkpoint original YOLOX Small |
| Resolucion de entrada | 640x640 |
| Tamano del modelo (float) | 34,3 MB |
| Tamano del modelo (w8a16) | 9,53 MB |
| Tamano del modelo (w8a8) | 8,96 MB |
| Runtime | QAIRT 2.51, ONNX Runtime 1.30.0 |
| Unidad de computo principal | NPU (Hexagon) |

## Arquitectura y entrenamiento

Yolo-X se basa en YOLOX Small, un detector de objetos de una sola etapa con arquitectura convolucional (backbone tipo CSPDarknet con cuello PAN y cabecera desacoplada). El modelo original fue desarrollado por Megvii-BaseDetection y esta implementación concreta corresponde al checkpoint YOLOX Small exportado por Qualcomm AI Hub Models. La entrada es una imagen RGB de 640x640 píxeles y la salida son cajas delimitadoras con sus clases y puntuaciones de confianza.

No se dispone de información en la documentación proporcionada sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF o DPO (no aplicables a un detector de objetos). La innovación técnica destacable no está en el entrenamiento sino en el proceso de compilación y cuantización de Qualcomm: el modelo se exporta a QNN_DLC y TFLITE con cuantizaciones w8a16, w8a8 y w8a8_mixed_int16, y se perfila en NPU de chipsets Snapdragon y Dragonwing concretos. La librería Qualcomm AI Hub Models permite reexportar con pesos personalizados, formas de entrada personalizadas y configuraciones de dispositivo y runtime a medida.

## Capacidades

- Detección de objetos en imágenes: predice cajas delimitadoras y clases de objetos sobre entradas de 640x640.
- Inferencia en tiempo real: latencias medidas entre 5,48 ms y 21,449 ms según chipset, con ejecución en NPU.
- Despliegue en el borde: artefactos precompilados para Android y plataformas embebidas con Snapdragon y Dragonwing.
- Cuantización agresiva: versiones w8a16 y w8a8 que reducen el tamaño hasta 8,96 MB manteniendo el formato de salida.
- Compatibilidad multiplataforma de runtime: ONNX Runtime 1.30.0 y QAIRT 2.51.
- Exportación personalizada: permite recompilar con pesos fine-tuneados, formas de entrada propias y configuración de dispositivo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural.
- No dispone de modo thinking, visión generativa, audio ni capacidades multimodales más allá de la detección de objetos.

## Casos de uso

- Detección de objetos en aplicaciones Android: el modelo se integra mediante los artefactos TFLITE u ONNX y se ejecuta en la NPU del Snapdragon, con latencias de 5,48 a 21,449 ms que permiten procesamiento de vídeo en tiempo real en el propio dispositivo sin enviar imágenes a la nube.
- Vigilancia y análisis de vídeo en el borde: con 640x640 de entrada y ejecución en NPU, se puede desplegar en cámaras IP o dispositivos Dragonwing para detectar personas, vehículos u objetos en streams de vídeo con baja latencia y sin coste de ancho de banda.
- Automatización industrial y control de calidad: la versión w8a8 de 8,96 MB cabe en dispositivos embebidos con Snapdragon o Dragonwing IQ-8275 (15,111 ms de inferencia) para inspección visual en líneas de producción.
- Robótica y drones: el bajo consumo de memoria (rangos de 0 a 207 MB de pico según chipset y precisión) y la latencia inferior a 22 ms permiten integrar el detector en bucles de control de robots o vehículos autónomos no tripulados.
- Aplicaciones de realidad aumentada: la detección en NPU con latencias de 5 a 13 ms en chipsets de gama alta (Snapdragon 8 Elite, X2 Elite) permite superponer información sobre objetos detectados en tiempo real en la cámara del dispositivo.
- Procesamiento por lotes en estaciones de trabajo con Snapdragon X Elite: la versión ONNX float se ejecuta en 13,311 ms con 14 MB de pico, adecuada para análisis de imágenes en portátiles con Windows on Snapdragon.
- Investigación y prototipado: la librería Qualcomm AI Hub Models permite reexportar el modelo con pesos fine-tuneados y formas de entrada personalizadas para experimentar con variantes del detector en hardware Qualcomm.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (mAP, IoU) en la información disponible. La model card únicamente proporciona métricas de latencia y memoria de inferencia por chipset y precisión:

| Chipset | Runtime | Precision | Tiempo de inferencia (ms) | Memoria pico (MB) | Unidad de computo |
|---|---|---|---|---|---|
| Snapdragon 8 Elite Extreme Gen 6 Mobile | ONNX | float | 5,48 | 5 - 158 | NPU |
| Snapdragon 8 Elite Gen 6 Mobile | ONNX | float | 5,672 | 3 - 155 | NPU |
| Snapdragon 8 Elite Gen 5 For Galaxy Mobile | ONNX | float | 6,389 | 0 - 160 | NPU |
| Snapdragon 8 Elite For Galaxy Mobile | ONNX | float | 7,649 | 22 - 173 | NPU |
| Snapdragon X2 Elite | ONNX | float | 7,84 | 5 - 5 | NPU |
| Snapdragon 8 Gen 3 Mobile | ONNX | float | 9,082 | 2 - 177 | NPU |
| Snapdragon X Elite | ONNX | float | 13,311 | 14 - 14 | NPU |
| Dragonwing QCS8550 (Proxy) | ONNX | float | 13,345 | 0 - 17 | NPU |
| Dragonwing IQ-X7181 | ONNX | float | 13,311 | 14 - 14 | NPU |
| Dragonwing IQ-8275 | ONNX | float | 15,111 | 5 - 9 | NPU |
| Dragonwing IQ-9075 | ONNX | float | 16,826 | 5 - 8 | NPU |
| Snapdragon 8 Gen 1 Mobile | ONNX | float | 21,449 | 1 - 205 | NPU |
| QCS8450 | ONNX | float | 21,449 | 1 - 205 | NPU |
| Snapdragon 8 Elite Gen 5 For Galaxy Mobile | ONNX | w8a16 | 10,751 | 2 - 207 | NPU |
| Snapdragon 8 Elite For Galaxy Mobile | ONNX | w8a16 | 8,536 | 0 - 198 | NPU |
| Snapdragon X2 Elite | ONNX | w8a16 | 12,215 | 2 - 2 | NPU |
| Snapdragon X Elite | ONNX | w8a16 | 14,528 | 7 - 7 | NPU |

No se dispone de datos de throughput (FPS) ni de métricas de precisión de detección en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido tradicional; el modelo se ejecuta en NPU de dispositivos Qualcomm. La memoria pico medida oscila entre 0 y 207 MB según chipset y precisión.
- GPU recomendadas: no se especifican GPU; el modelo está optimizado para NPU Hexagon de Snapdragon y Dragonwing.
- Cabe en dispositivos de consumo: sí, en smartphones y portátiles con Snapdragon 8 Gen 1, 8 Gen 3, 8 Elite, X Elite, X2 Elite y plataformas Dragonwing (IQ-8275, IQ-9075, IQ-X7181, QCS8550, QCS8450, Q-8750).
- Opciones de despliegue: ONNX Runtime 1.30.0, QAIRT 2.51, QNN_DLC, TFLITE; exportación mediante la librería Qualcomm AI Hub Models.
- Latencia: entre 5,48 ms (Snapdragon 8 Elite Extreme Gen 6, float) y 21,449 ms (Snapdragon 8 Gen 1, float).
- Throughput: no disponible en la información proporcionada.
- No se dispone de requisitos para GPU convencionales (A100, H100, RTX 4090) porque el modelo está orientado a NPU Qualcomm.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de precisión ni de comparativas directas con otros detectores en la información proporcionada. A continuación se comparan características técnicas con alternativas de la misma categoría (detectores de objetos ligeros), indicando los datos disponibles y marcando como "no disponible" lo que no se conoce:

| Modelo | Parametros | Entrada | Licencia | Formatos | Optimizado para |
|---|---|---|---|---|---|
| Yolo-X (Qualcomm) | 8,98 M | 640x640 | Apache 2.0 | ONNX, QNN_DLC, TFLITE | NPU Snapdragon/Dragonwing |
| YOLOX Small (original) | no disponible | 640x640 | Apache 2.0 | PyTorch | GPU/CPU genéricas |
| YOLOv8n | no disponible | 640x640 | AGPL-3.0 | PyTorch, ONNX | GPU/CPU genéricas |
| YOLOv5n | no disponible | 640x640 | GPL-3.0 | PyTorch, ONNX | GPU/CPU genéricas |

No se dispone de datos de mAP ni de latencia de los modelos alternativos en la información proporcionada, por lo que no se puede establecer una comparación de rendimiento cuantitativa.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos del dataset de entrenamiento ni sobre el rendimiento en dominios específicos (iluminación, oclusión, clases poco frecuentes).
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos en la detección, sin métricas publicadas de precisión o recall.
- Limitaciones de contexto o idioma: no aplica; el modelo no procesa texto ni lenguaje.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los artefactos de runtime (QAIRT, ONNX Runtime) y de la implementación original YOLOX.
- El modelo está optimizado exclusivamente para hardware Qualcomm; no se garantiza su funcionamiento en GPU o CPU de otros fabricantes con los artefactos QNN_DLC.
- Las latencias publicadas corresponden a perfiles concretos de chipset y runtime; el rendimiento real puede variar según condiciones térmicas, carga del sistema y versión de SDK.
- No se dispone de información sobre el dataset de entrenamiento ni sobre el proceso de fine-tuning, lo que limita la evaluación de su comportamiento en clases no representadas.
- La cuantización w8a8 puede degradar la precisión de detección respecto a float; no se publican métricas comparativas de mAP entre precisiones.

## Enlaces

- Hugging Face: https://huggingface.co/qualcomm/Yolo-X
- Qualcomm AI Hub (modelo): https://aihub.qualcomm.com/models/yolox
- Repositorio Qualcomm AI Hub Models (YOLOX): https://github.com/qualcomm/ai-hub-models/blob/v0.67.0/src/qai_hub_models/models/yolox
- Implementación original YOLOX (Megvii): https://github.com/Megvii-BaseDetection/YOLOX/
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Registro en Qualcomm: https://myaccount.qualcomm.com/signup
- Descarga ONNX float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/yolox/releases/v0.67.0/yolox-onnx-float.zip
- Descarga ONNX w8a16: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/yolox/releases/v0.67.0/yolox-onnx-w8a16.zip
- Descarga ONNX w8a8: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/yolox/releases/v0.67.0/yolox-onnx-w8a8.zip
- Descarga ONNX w8a8_mixed_int16: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/yolox/releases/v0.67.0/yolox-onnx-w8a8_mixed_int16.zip
- Descarga QNN_DLC float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/yolox/releases/v0.67.0/yolox-qnn_dlc-float.zip
- Descarga QNN_DLC w8a16: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/yolox/releases/v0.67.0/yolox-qnn_dlc-w8a16.zip
- Descarga QNN_DLC w8a8: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/yolox/releases/v0.67.0/yolox-qnn_dlc-w8a8.zip
- Descarga QNN_DLC w8a8_mixed_int16: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/yolox/releases/v0.67.0/yolox-qnn_dlc-w8a8_mixed_int16.zip
- Descarga TFLITE float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/yolox/releases/v0.67.0/yolox-tflite-float.zip
- Descarga TFLITE w8a8: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/yolox/releases/v0.67.0/yolox-tflite-w8a8.zip
