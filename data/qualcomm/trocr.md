# qualcomm/TrOCR

## Resumen

TrOCR es un modelo de reconocimiento óptico de caracteres (OCR) de extremo a extremo que combina un encoder de imágenes basado en transformer con un decoder de texto autorregresivo. Esta ficha describe la variante publicada por Qualcomm en Hugging Face (`qualcomm/TrOCR`), que no es un modelo entrenado desde cero por Qualcomm, sino una exportación optimizada del checkpoint `microsoft/trocr-small-handwritten` para su despliegue en dispositivos con aceleración NPU de Qualcomm (Snapdragon y Dragonwing). El modelo original procede del paper "TrOCR: Transformer-based Optical Character Recognition with Pre-trained Models" (arXiv:2109.10282).

La relevancia de esta publicación es práctica: ofrece artefactos listos para producción en formato ONNX, QNN_DLC y TFLITE, compilados y perfilados con Qualcomm AI Hub Workbench, con latencias medidas en el rango de 1,2 a 2,8 ms por paso de decoder en NPU según el chipset. Esto lo convierte en una opción para OCR on-device en móviles, tablets, plataformas industriales y automoción, donde no se puede depender de la nube.

El modelo es pequeño (61,3 M de parámetros en total, repartidos entre 23,0 M del encoder y 38,3 M del decoder) y está especializado en texto manuscrito. No es un modelo de lenguaje general: su tarea es image-to-text a nivel de wordpiece sobre una imagen de entrada de 320x320.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de imágenes transformer + decoder de texto transformer (image-to-text) |
| Parametros totales | 61,3 M (encoder 23,0 M + decoder 38,3 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del número de tokens de texto del decoder; no especificado en la model card) |
| Tipos de cuantizacion | Los artefactos publicados son en precisión float; no se documentan variantes cuantizadas en la información disponible |
| Idiomas soportados | No disponible (el checkpoint base es trocr-small-handwritten, orientado a texto manuscrito en inglés; no se detalla en la model card) |
| Licencia | MIT |
| Formato de pesos | ONNX, QNN_DLC, TFLITE (artefactos pre-exportados); pesos PyTorch en el repositorio |
| Resolucion de entrada | 320x320 |
| Tamano del decoder (float) | 146 MB |
| Tamano del encoder (float) | 87,8 MB |
| Runtime / SDK | QAIRT 2.51, ONNX Runtime 1.30.0 |
| Unidad de computo principal | NPU |
| Tamano del repositorio | 16,7 GB |

## Arquitectura y entrenamiento

TrOCR sigue un esquema encoder-decoder de tipo transformer. El encoder procesa la imagen de entrada (320x320) y extrae representaciones visuales; el decoder genera la secuencia de texto a nivel de wordpiece de forma autorregresiva. Esta variante concreta parte del checkpoint `microsoft/trocr-small-handwritten`, por lo que hereda el entrenamiento del modelo original de Microsoft Research descrito en arXiv:2109.10282, que emplea un encoder de imágenes preentrenado y un decoder de texto preentrenado, con ajuste fino posterior sobre datos de reconocimiento de texto.

La aportación de Qualcomm no es el entrenamiento, sino la exportación y optimización: los pesos se compilan con Qualcomm AI Hub Workbench para ejecutarse en la NPU de chipsets Snapdragon y Dragonwing, con artefactos en ONNX, QNN_DLC y TFLITE. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esos datos corresponden al paper original y no se reproducen aquí por no estar en la información proporcionada.

## Capacidades

- Reconocimiento de texto en imágenes (image-to-text) de extremo a extremo, con salida a nivel de wordpiece.
- Especialización en texto manuscrito, según el checkpoint base (`trocr-small-handwritten`).
- Procesamiento de imágenes de entrada de 320x320 píxeles.
- Ejecución on-device en NPU de Qualcomm con latencias de milisegundos por paso de decoder.
- Exportación con configuraciones personalizadas (pesos ajustados, formas de entrada, dispositivo y runtime) mediante la librería Qualcomm AI Hub Models.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking.

## Casos de uso

- Digitalización de notas manuscritas en aplicaciones móviles: el modelo reconoce texto manuscrito en imágenes de 320x320 y se ejecuta en la NPU del Snapdragon con latencias de ~1,2-2,4 ms por paso de decoder, lo que permite captura y transcripción en tiempo real sin conexión.
- Escaneo de documentos en tablets y portátiles con Snapdragon X Elite / X2 Elite: los artefactos ONNX y QNN_DLC permiten integrar OCR local en aplicaciones de productividad, con tiempos de inferencia medidos de ~1,7-2,2 ms por paso de decoder.
- Procesamiento de formularios y albaranes en dispositivos industriales (Dragonwing IQ-8275, IQ-9075, QCS8550): OCR on-device en entornos sin conectividad fiable, con latencias de ~2,0-2,6 ms por paso de decoder.
- Automoción y cabina (SA8295P, SA8650P, SA8775P, SA8255P): lectura de matrículas, señalética o documentos en el vehículo con ejecución local en NPU y sin enviar imágenes a la nube.
- Accesibilidad: transcripción de texto manuscrito capturado con la cámara del móvil para personas con dificultades de lectura, aprovechando la baja latencia y el consumo reducido de la NPU.
- Pipelines de digitalización por lotes en el borde: uso de la librería de exportación para ajustar formas de entrada y pesos, y despliegue en flotas de dispositivos Qualcomm con el mismo artefacto compilado.
- Prototipado e integración en apps Android: el formato TFLITE y ONNX facilita la incorporación en aplicaciones Android existentes que ya usan NNAPI o QNN.

## Benchmarks y rendimiento

La model card no publica métricas de calidad de OCR (CER, WER, exact match) ni comparaciones con otros modelos en MMLU, HumanEval o GSM8K, que no aplican a esta tarea. Lo que sí se publica es el rendimiento de inferencia por dispositivo, medido con Qualcomm AI Hub Workbench. Se reproduce una selección representativa:

| Runtime | Chipset | Tiempo de inferencia (decoder) | Memoria pico | Unidad |
|---|---|---|---|---|
| ONNX | Snapdragon 8 Elite Gen 6 Mobile | 1,231 ms | 0-109 MB | NPU |
| ONNX | Snapdragon 8 Elite Gen 5 For Galaxy | 1,29 ms | 2-181 MB | NPU |
| ONNX | Snapdragon 8 Gen 3 Mobile | 1,479 ms | 0-283 MB | NPU |
| ONNX | Snapdragon 8 Gen 1 Mobile | 2,356 ms | 1-224 MB | NPU |
| ONNX | Snapdragon X Elite | 2,008 ms | 67-67 MB | NPU |
| ONNX | Dragonwing IQ-8275 | 2,545 ms | 7-18 MB | NPU |
| QNN_DLC | Snapdragon 8 Elite Gen 6 Mobile | 1,279 ms | 1-106 MB | NPU |
| QNN_DLC | Snapdragon 8 Gen 3 Mobile | 1,466 ms | 0-280 MB | NPU |
| QNN_DLC | Dragonwing IQ-9075 | 2,371 ms | 7-16 MB | NPU |
| QNN_DLC | SA8295P | 2,562 ms | 6-53 MB | NPU |

No se han publicado resultados de benchmarks de calidad (precisión de reconocimiento) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo completo en float ocupa aproximadamente 234 MB (146 MB decoder + 87,8 MB encoder); no requiere GPU dedicada para ejecución en CPU/NPU.
- GPU recomendadas: no aplica como requisito principal; el objetivo es la NPU de Qualcomm. Para ejecución en servidor con ONNX Runtime puede usarse cualquier GPU convencional, pero no se documentan métricas.
- Cabe en cualquier dispositivo Qualcomm listado: Snapdragon 8 Gen 1/3/Elite/Elite Gen 5/Gen 6, Snapdragon X Elite/X2 Elite, Dragonwing IQ-8275/IQ-9075/IQ-X7181/Q-8750, QCS8450/QCS8550, SA8295P/SA8650P/SA8775P/SA8255P.
- Opciones de despliegue: ONNX Runtime 1.30.0, QAIRT 2.51 (QNN_DLC), TFLITE; exportación personalizada con la librería Qualcomm AI Hub Models.
- Latencia y throughput: 1,23-2,8 ms por paso de decoder en NPU según chipset y runtime; memoria pico entre 0 y 283 MB según dispositivo.
- No se documentan requisitos para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qualcomm/TrOCR (esta ficha) | 61,3 M | Imagen 320x320 | MIT | Hugging Face + Qualcomm AI Hub | Optimizado para NPU Qualcomm |
| microsoft/trocr-small-handwritten | 61,3 M (mismo checkpoint base) | Imagen 320x320 | MIT | Hugging Face | Pesos originales PyTorch, sin optimización on-device |
| microsoft/trocr-base-handwritten | No disponible en la información | Imagen 384x384 (según paper original) | MIT | Hugging Face | Variante de mayor tamaño del mismo paper |
| microsoft/trocr-large-handwritten | No disponible en la información | Imagen 384x384 (según paper original) | MIT | Hugging Face | Variante de mayor tamaño del mismo paper |

La comparativa se limita a variantes de la misma familia TrOCR; no se dispone de datos de otros modelos OCR en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en texto manuscrito (checkpoint `trocr-small-handwritten`); su rendimiento en texto impreso, tablas complejas, fórmulas o documentos multi-columna no está documentado.
- No se detallan los idiomas soportados; el checkpoint base está orientado a texto manuscrito en inglés, por lo que el uso en castellano u otros idiomas requiere validación empírica.
- Riesgo de alucinación y errores de transcripción inherente a los modelos generativos de OCR; no se publican métricas de CER/WER que permitan acotar el error.
- La entrada está fijada a 320x320 píxeles; imágenes de mayor resolución requieren redimensionado, lo que puede degradar la legibilidad de texto pequeño.
- Los artefactos publicados son en precisión float; no se documentan variantes cuantizadas ni su impacto en calidad.
- Licencia MIT: permite uso comercial, pero se recomienda revisar las condiciones del checkpoint base de Microsoft y del paper original.
- El repositorio ocupa 16,7 GB, lo que incluye múltiples artefactos; conviene descargar solo el runtime necesario para el dispositivo objetivo.
- La model card no documenta sesgos, evaluación de robustez ni comportamiento en dominios distintos al manuscrito.

## Enlaces

- Hugging Face: https://huggingface.co/qualcomm/TrOCR
- Modelo base: https://huggingface.co/microsoft/trocr-small-handwritten
- Paper: https://arxiv.org/abs/2109.10282
- Qualcomm AI Hub (modelo): https://aihub.qualcomm.com/models/trocr
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Librería Qualcomm AI Hub Models: https://github.com/qualcomm/ai-hub-models/blob/v0.67.0/src/qai_hub_models/models/trocr
- Descarga ONNX float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/trocr/releases/v0.67.0/trocr-onnx-float.zip
- Descarga QNN_DLC float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/trocr/releases/v0.67.0/trocr-qnn_dlc-float.zip
- Descarga TFLITE float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/trocr/releases/v0.67.0/trocr-tflite-float.zip
- Qualcomm (empresa): https://www.qualcomm.com/
