# qualcomm/EasyOCR

## Resumen

EasyOCR es un sistema de reconocimiento óptico de caracteres (OCR) compuesto por dos etapas: un detector de texto y un reconocedor de texto. Qualcomm publica en este repositorio una versión pre-exportada y optimizada de la implementación original de EasyOCR (JaidedAI) para su despliegue en dispositivos con aceleración NPU de Qualcomm, incluyendo Snapdragon 8 Elite, Snapdragon X Elite y plataformas Dragonwing. El modelo reconoce texto en imágenes y cubre más de 80 idiomas y los principales sistemas de escritura.

La relevancia de esta ficha radica en que no se trata de un modelo de lenguaje, sino de una pipeline de visión por computador optimizada para inferencia en el borde (edge). El detector tiene 20,8 millones de parámetros y el reconocedor 3,84 millones, con una resolución de entrada de 608x800 píxeles. Los artefactos exportados incluyen formatos ONNX, QNN_DLC y TFLITE, en precisión float y cuantización w8a8, lo que permite desplegar OCR local en móviles, portátiles y dispositivos embebidos sin depender de la nube.

El repositorio ocupa 4,9 GB e incluye los binarios compilados para distintos runtimes. La licencia es Apache 2.0, lo que facilita su uso comercial. La información disponible no detalla la composición del dataset de entrenamiento ni métricas de precisión (accuracy) por idioma, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de dos etapas: detector de texto (CRAFT) y reconocedor de texto (CRNN), exportados para NPU de Qualcomm |
| Parametros totales | 24,64 M (20,8 M detector + 3,84 M reconocedor) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de visión; entrada de imagen 608x800) |
| Tipos de cuantizacion | float y w8a8 (pesos y activaciones a 8 bits) |
| Idiomas soportados | Más de 80 idiomas y principales sistemas de escritura |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX, QNN_DLC, TFLITE (float y w8a8); checkpoint base easyocr-small-stage1 |
| Tamano del modelo | Detector 79,2 MB (float), reconocedor 14,7 MB (float) |
| Resolucion de entrada | 608x800 |
| Runtime | QAIRT 2.50, ONNX Runtime 1.30.0 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura clásica de EasyOCR en dos etapas. La primera etapa es un detector de texto basado en CRAFT (Character Region Awareness for Text Detection), que localiza regiones de texto en la imagen de entrada de 608x800 píxeles y genera cajas delimitadoras. La segunda etapa es un reconocedor basado en CRNN (Convolutional Recurrent Neural Network) que transcribe el contenido de cada región detectada. Ambos componentes se exportan por separado y se ejecutan secuencialmente en la NPU del dispositivo Qualcomm.

Qualcomm no aporta en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de ajuste fino o RLHF. El checkpoint indicado es `easyocr-small-stage1`, derivado de la implementación de JaidedAI. La innovación principal de esta publicación no es arquitectónica, sino de despliegue: la compilación mediante Qualcomm AI Hub Workbench para runtimes QNN, ONNX Runtime y TFLite, con cuantización w8a8 que reduce la latencia del detector entre 2,5 y 3 veces respecto a float en las plataformas medidas.

## Capacidades

- Detección de regiones de texto en imágenes con el detector CRAFT.
- Reconocimiento y transcripción de texto en más de 80 idiomas y principales sistemas de escritura.
- Procesamiento de imagen a texto (pipeline image-to-text).
- Ejecución en NPU de dispositivos Qualcomm con los runtimes ONNX, QNN_DLC y TFLITE.
- Cuantización w8a8 para reducir latencia y huella de memoria.
- Exportación con formas de entrada personalizadas y pesos ajustados mediante la librería ai-hub-models.
- No soporta tool calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de modo thinking, visión general, audio ni generación de texto libre.

## Casos de uso

- Digitalización de documentos en movil: el pipeline detecta y transcribe texto de facturas, recibos y formularios capturados con la cámara, ejecutándose en la NPU del Snapdragon con latencias de decenas de milisegundos por imagen.
- Traducción de carteles y menús en tiempo real: la detección en 5-20 ms (w8a8) permite procesar fotogramas de cámara y alimentar un traductor local sin enviar imágenes a la nube.
- Accesibilidad para personas con discapacidad visual: lectura en voz alta de texto impreso en el dispositivo, con independencia de conectividad y sin coste de API.
- Automatización de procesos en dispositivos industriales: lectura de etiquetas, códigos y paneles en plataformas Dragonwing o QCS con NPU integrada.
- Extracción de datos de documentos escaneados en portátiles Snapdragon X Elite: procesamiento por lotes con bajo consumo energético gracias a la ejecución en NPU.
- Kioscos y terminales de autoservicio: reconocimiento de documentos de identidad o tickets en dispositivos embebidos con TFLite.
- Preprocesado en pipelines de visión: uso del detector CRAFT como etapa de localización de texto antes de un modelo de lenguaje o de un clasificador downstream.

## Benchmarks y rendimiento

Los datos publicados corresponden a latencia de inferencia y memoria pico del detector en distintos chipsets, no a métricas de precisión OCR (accuracy, CER, WER), que no están disponibles.

| Chipset | Runtime | Precision | Tiempo inferencia detector (ms) | Memoria pico (MB) |
|---|---|---|---|---|
| Snapdragon 8 Elite Gen 5 for Galaxy | ONNX | float | 15,775 | 3 - 163 |
| Snapdragon 8 Elite Gen 5 for Galaxy | ONNX | w8a8 | 5,444 | 0 - 161 |
| Snapdragon 8 Elite for Galaxy | ONNX | float | 21,073 | 3 - 160 |
| Snapdragon 8 Elite for Galaxy | ONNX | w8a8 | 7,346 | 1 - 157 |
| Snapdragon X2 Elite | ONNX | float | 19,488 | 9 - 9 |
| Snapdragon X2 Elite | ONNX | w8a8 | 6,723 | 1 - 1 |
| Snapdragon X Elite | ONNX | float | 35,688 | 36 - 36 |
| Snapdragon X Elite | ONNX | w8a8 | 12,607 | 19 - 19 |
| Snapdragon 8 Gen 3 Mobile | ONNX | float | 26,464 | 8 - 232 |
| Snapdragon 8 Gen 3 Mobile | ONNX | w8a8 | 9,627 | 2 - 212 |
| Snapdragon 8 Gen 1 Mobile | ONNX | float | 64,862 | 8 - 238 |
| Snapdragon 8 Gen 1 Mobile | ONNX | w8a8 | 16,432 | 2 - 211 |
| Dragonwing IQ-8275 | ONNX | float | 76,701 | 6 - 15 |
| Dragonwing IQ-8275 | ONNX | w8a8 | 14,277 | 1 - 5 |
| Dragonwing QCS8550 (Proxy) | ONNX | float | 34,596 | 0 - 44 |
| Dragonwing QCS8550 (Proxy) | ONNX | w8a8 | 12,15 | 0 - 197 |
| QCS8450 | ONNX | float | 64,862 | 8 - 238 |
| QCS8450 | ONNX | w8a8 | 16,432 | 2 - 211 |
| Dragonwing IQ-9075 | ONNX | float | 66,913 | 6 - 14 |
| Dragonwing IQ-9075 | ONNX | w8a8 | 12,638 | 1 - 5 |
| Dragonwing IQ-X7181 | ONNX | float | 35,688 | 36 - 36 |
| Dragonwing IQ-X7181 | ONNX | w8a8 | 12,607 | 19 - 19 |
| Dragonwing Q-8750 | ONNX | float | 21,073 | 3 - 160 |
| Dragonwing Q-8750 | ONNX | w8a8 | 7,346 | 1 - 157 |

Con QNN_DLC en float, el detector tarda 16,82 ms en Snapdragon 8 Elite Gen 5 for Galaxy, 22,247 ms en Snapdragon 8 Elite for Galaxy, 20,661 ms en Snapdragon X2 Elite y 39,484 ms en Snapdragon X Elite. Los datos de rendimiento del reconocedor no están incluidos en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formatos | Licencia | Notas |
|---|---|---|---|---|---|
| qualcomm/EasyOCR | 24,64 M | 80+ | ONNX, QNN_DLC, TFLITE | Apache 2.0 | Optimizado para NPU Qualcomm, latencia 5-20 ms en gama alta |
| EasyOCR (JaidedAI) | No disponible | 80+ | PyTorch | Apache 2.0 | Implementación original, sin optimización NPU |
| Tesseract OCR | No disponible | 100+ | Nativo, no neuronal | Apache 2.0 | Motor LSTM clásico, sin aceleración NPU en móvil |
| PaddleOCR | No disponible | 80+ | Paddle, ONNX | Apache 2.0 | Alternativa con detección/recognición neuronales |

No se dispone de métricas de precisión comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No se publican métricas de precisión OCR (CER, WER) por idioma; el rendimiento real de transcripción no está verificado en la información disponible.
- La optimización está ligada al ecosistema Qualcomm (QAIRT, QNN, AI Hub); el uso en otras plataformas requiere los artefactos ONNX o TFLite y puede no aprovechar la NPU.
- La resolución de entrada está fijada en 608x800; textos muy pequeños o imágenes de alta resolución pueden requerir preprocesado o exportación con formas personalizadas.
- La cuantización w8a8 puede degradar la precisión de reconocimiento frente a float; no se documenta la magnitud de esa pérdida.
- Riesgo de errores en escrituras complejas, texto manuscrito, fuentes decorativas o imágenes con bajo contraste y ruido.
- La licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribución correspondiente.
- El modelo no genera texto libre ni razona; su alcance se limita a detección y transcripción de texto en imágenes.
- La información sobre sesgos lingüísticos y cobertura real por idioma no está disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/qualcomm/EasyOCR
- EasyOCR en Qualcomm AI Hub: https://aihub.qualcomm.com/models/easyocr
- Librería ai-hub-models (EasyOCR): https://github.com/qualcomm/ai-hub-models/blob/v0.66.0/src/qai_hub_models/models/easyocr
- Implementación original EasyOCR (JaidedAI): https://github.com/JaidedAI/EasyOCR
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Descarga ONNX float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/easyocr/releases/v0.66.0/easyocr-onnx-float.zip
- Descarga ONNX w8a8: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/easyocr/releases/v0.66.0/easyocr-onnx-w8a8.zip
- Descarga QNN_DLC float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/easyocr/releases/v0.66.0/easyocr-qnn_dlc-float.zip
- Descarga TFLITE float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/easyocr/releases/v0.66.0/easyocr-tflite-float.zip
- Descarga TFLITE w8a8: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/easyocr/releases/v0.66.0/easyocr-tflite-w8a8.zip
