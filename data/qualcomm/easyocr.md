# qualcomm/EasyOCR

## Resumen

EasyOCR para dispositivos Qualcomm es una adaptación optimizada del conocido motor de reconocimiento óptico de caracteres EasyOCR, publicada por Qualcomm en Hugging Face bajo licencia Apache 2.0. No se trata de un modelo de lenguaje, sino de un pipeline de visión por computador compuesto por dos redes neuronales convolucionales: un detector de texto (20,8 millones de parámetros, checkpoint `easyocr-small-stage1`) y un reconocedor de texto (3,84 millones de parámetros). El conjunto se distribuye en formato ONNX, QNN_DLC y TFLite, compilado específicamente para ejecutarse en la NPU de los chipsets Snapdragon y Dragonwing de Qualcomm.

El modelo resuelve el problema de extraer texto de imágenes (image-to-text) en escenarios de borde, donde no hay acceso a GPU de servidor ni a servicios en la nube. Su relevancia actual radica en que permite ejecutar OCR multilingüe (más de 80 idiomas según la model card) íntegramente en el dispositivo, con latencias de inferencia del detector que oscilan entre 4,8 ms y 77 ms según el chipset y la precisión (float frente a w8a8), lo que lo hace apto para aplicaciones móviles, escáneres de documentos, traducción en tiempo real y accesibilidad.

La entrada del modelo está fijada a una resolución de 608x800 píxeles. El repositorio ocupa 4,9 GB e incluye los artefactos pre-exportados para distintos runtimes. La ficha se centra en los datos publicados por el autor; cualquier dato no presente en la model card se marca explícitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline OCR de dos etapas: detector de texto convolucional + reconocedor de texto convolucional (basado en EasyOCR de JaidedAI) |
| Parametros totales | 24,64 M (20,8 M detector + 3,84 M reconocedor) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen fija de 608x800) |
| Tipos de cuantizacion | float y w8a8 (pesos y activaciones de 8 bits) |
| Idiomas soportados | más de 80 idiomas y todos los sistemas de escritura populares (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX, QNN_DLC, TFLite (no se distribuyen safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de EasyOCR original: una etapa de detección de regiones de texto en la imagen y una etapa de reconocimiento que transcribe cada región detectada. El detector emplea un backbone convolucional con 20,8 M de parámetros y el reconocedor una red convolucional más ligera de 3,84 M de parámetros. Qualcomm no ha publicado detalles sobre el conjunto de datos de entrenamiento, el número de tokens o imágenes procesadas, ni si se aplicaron técnicas de ajuste fino adicionales; la model card solo indica que se basa en la implementación de JaidedAI y que el checkpoint utilizado es `easyocr-small-stage1`.

La innovación técnica de esta publicación no está en la arquitectura, sino en el proceso de exportación y compilación: Qualcomm AI Hub Workbench compila los modelos para la NPU (Unidad de Procesamiento Neural) de sus chipsets, generando artefactos QNN_DLC, TFLite y ONNX con cuantización w8a8 opcional. Esto permite que un modelo originalmente pensado para GPU de escritorio se ejecute con aceleración hardware en dispositivos móviles y de borde. No se documentan técnicas como decodificación especulativa o atención lineal, ya que no aplican a este tipo de red convolucional.

## Capacidades

- Detección de regiones de texto en imágenes con resolución de entrada de 608x800 píxeles.
- Reconocimiento óptico de caracteres (OCR) en más de 80 idiomas y todos los sistemas de escritura populares, según la model card.
- Extracción de texto de documentos escaneados, fotografías, señales, pantallas y escenas naturales.
- Ejecución acelerada por NPU en chipsets Snapdragon y Dragonwing de Qualcomm.
- Soporte de dos precisiones (float y w8a8) para equilibrar latencia y memoria.
- No dispone de tool calling, function calling, razonamiento multi-paso ni modo de pensamiento: es un modelo puramente perceptivo de imagen a texto.
- No se documentan capacidades de audio, vídeo ni generación de texto libre.

## Casos de uso

- Digitalización de documentos en movil: el pipeline detecta y transcribe texto de fotografías de facturas, contratos o apuntes directamente en la NPU del telefono, con latencias del detector de 4,8 a 26 ms en chipsets Snapdragon 8 Elite y 8 Gen 3 en precisión w8a8, sin enviar datos a la nube.
- Traducción en tiempo real con la camara: integrado en una app de realidad aumentada, el modelo extrae el texto de carteles o menus y lo pasa a un motor de traducción local; su soporte de más de 80 idiomas y su bajo consumo de memoria (rangos de 0 a 264 MB según chipset) lo hacen viable en dispositivos de gama alta.
- Accesibilidad para personas con discapacidad visual: un lector de pantalla puede capturar la imagen de la camara, ejecutar EasyOCR en local y sintetizar el texto detectado mediante TTS, todo sin conexión y con latencia inferior a 100 ms en el conjunto detector-reconocedor.
- Escaneo de codigos y matrículas en logistica: el detector localiza regiones de texto en imágenes de almacén y el reconocedor transcribe etiquetas y matrículas en dispositivos rugged con chipsets Dragonwing IQ-8275 o QCS8550, con tiempos de 14 a 35 ms en w8a8.
- Procesamiento de formularios en el borde: en terminales de punto de venta o quioscos con Snapdragon X Elite, el modelo extrae campos de formularios en papel para su validación posterior, manteniendo los datos personales en el dispositivo.
- Automatizacion de la introduccion de datos en aplicaciones de escritorio: en portatiles con Snapdragon X Elite o X2 Elite, el modelo puede ejecutarse sobre capturas de pantalla para extraer texto de aplicaciones legacy, con latencias de detector de 6,7 a 12,6 ms en w8a8.
- Moderacion de contenido basada en texto en imagenes: plataformas moviles pueden detectar texto ofensivo en imágenes subidas por usuarios antes de enviarlas al servidor, reduciendo costes de ancho de banda y cumpliendo requisitos de privacidad.

## Benchmarks y rendimiento

La model card no publica métricas de calidad de OCR (como precisión, F1 o CER) sobre conjuntos estándar. Sin embargo, sí incluye una tabla de rendimiento de inferencia del detector por chipset y precisión. Se reproduce un subconjunto representativo:

| Chipset | Runtime | Precision | Tiempo de inferencia (ms) | Memoria pico (MB) | Unidad de computo |
|---|---|---|---|---|---|
| Snapdragon 8 Elite Extreme Gen 6 Mobile | ONNX | w8a8 | 4,789 | 2 - 157 | NPU |
| Snapdragon 8 Elite Gen 6 Mobile | ONNX | w8a8 | 4,995 | 2 - 159 | NPU |
| Snapdragon 8 Elite Gen 5 For Galaxy Mobile | ONNX | w8a8 | 5,451 | 0 - 161 | NPU |
| Snapdragon 8 Elite For Galaxy Mobile | ONNX | w8a8 | 7,314 | 2 - 159 | NPU |
| Snapdragon 8 Gen 3 Mobile | ONNX | w8a8 | 9,627 | 2 - 212 | NPU |
| Snapdragon 8 Gen 1 Mobile | ONNX | w8a8 | 16,534 | 2 - 213 | NPU |
| Snapdragon X2 Elite | ONNX | w8a8 | 6,709 | 1 - 1 | NPU |
| Snapdragon X Elite | ONNX | w8a8 | 12,632 | 19 - 19 | NPU |
| Snapdragon 8 Elite Gen 5 For Galaxy Mobile | ONNX | float | 15,868 | 3 - 162 | NPU |
| Snapdragon 8 Elite For Galaxy Mobile | ONNX | float | 22,168 | 2 - 159 | NPU |
| Snapdragon 8 Gen 3 Mobile | ONNX | float | 26,464 | 8 - 232 | NPU |
| Snapdragon 8 Gen 1 Mobile | ONNX | float | 65,995 | 8 - 239 | NPU |
| Snapdragon X Elite | ONNX | float | 35,961 | 36 - 36 | NPU |
| Qualcomm Dragonwing IQ-8275 | ONNX | float | 77,341 | 6 - 15 | NPU |
| Qualcomm Dragonwing QCS8550 (Proxy) | ONNX | float | 35,011 | 0 - 264 | NPU |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no son aplicables a un modelo de OCR.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido tradicional; el modelo está pensado para NPU de dispositivos Qualcomm. El tamaño de los pesos en float es de 79,2 MB (detector) + 14,7 MB (reconocedor), aproximadamente 94 MB, y en w8a8 se reduce aproximadamente a la mitad.
- GPU recomendadas: no se documentan GPU de escritorio; el objetivo son las NPU integradas en Snapdragon 8 Elite, 8 Gen 3, 8 Gen 1, X Elite, X2 Elite, Dragonwing IQ-8275, IQ-9075, IQ-X7181, QCS8550 y QCS8450.
- Cabe en GPU consumer: no es el caso de uso; los artefactos publicados son para ONNX Runtime, QNN y TFLite, no para CUDA.
- Opciones de despliegue: ONNX Runtime 1.30.0 con QAIRT 2.51, QNN_DLC con QAIRT 2.51, TFLite con QAIRT 2.51. La librería `qualcomm/ai-hub-models` (v0.67.0) permite exportar con configuraciones personalizadas.
- Latencia y throughput: el detector tarda entre 4,8 ms y 77,3 ms según chipset y precisión (ver tabla de benchmarks). No se publican datos de latencia del reconocedor ni de throughput conjunto en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/Entrada | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qualcomm/EasyOCR | 24,64 M (total) | Imagen 608x800 | más de 80 | Apache 2.0 | Hugging Face, artefactos ONNX/QNN/TFLite |
| EasyOCR (JaidedAI, original) | no disponible en la informacion | no disponible | más de 80 | Apache 2.0 | GitHub, PyPI |
| PaddleOCR | no disponible en la informacion | no disponible | no disponible | Apache 2.0 | GitHub, PyPI |
| Tesseract OCR | no disponible en la informacion | no disponible | más de 100 | Apache 2.0 | GitHub, paquetes del sistema |

La comparativa se limita a alternativas de la misma categoría (OCR). No se dispone de datos de parámetros, contexto ni rendimiento de PaddleOCR o Tesseract en la información proporcionada, por lo que se marcan como no disponibles. La ventaja diferencial de la versión de Qualcomm es la compilación para NPU de sus chipsets y los artefactos pre-exportados; el EasyOCR original está orientado a CPU/GPU de propósito general.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la model card; al ser un modelo de OCR, puede tener un rendimiento desigual según el sistema de escritura, la calidad de la imagen y las condiciones de iluminación.
- Riesgo de alucinación: en OCR, el equivalente es la transcripción errónea de caracteres; no se publican métricas de tasa de error (CER/WER) que permitan cuantificarlo.
- Limitaciones de contexto o idioma: aunque se indican más de 80 idiomas, no se detalla la lista ni el rendimiento por idioma; la entrada está fijada a 608x800 píxeles, lo que puede limitar la detección de texto muy pequeño o en imágenes de alta resolución sin preprocesado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribuir a Qualcomm y a JaidedAI; conviene revisar las condiciones de los artefactos pre-exportados y de QAIRT.
- Caveats para producción: los artefactos están compilados para chipsets Qualcomm concretos; en otros hardware habría que reexportar el modelo. No se publican datos de latencia del reconocedor ni de precisión global, por lo que la evaluación en el dominio objetivo es imprescindible antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qualcomm/EasyOCR
- EasyOCR en Qualcomm AI Hub: https://aihub.qualcomm.com/models/easyocr
- Repositorio ai-hub-models (v0.67.0): https://github.com/qualcomm/ai-hub-models/blob/v0.67.0/src/qai_hub_models/models/easyocr
- Implementación original de EasyOCR (JaidedAI): https://github.com/JaidedAI/EasyOCR
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Descarga ONNX float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/easyocr/releases/v0.67.0/easyocr-onnx-float.zip
- Descarga ONNX w8a8: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/easyocr/releases/v0.67.0/easyocr-onnx-w8a8.zip
- Descarga QNN_DLC float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/easyocr/releases/v0.67.0/easyocr-qnn_dlc-float.zip
- Descarga TFLite float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/easyocr/releases/v0.67.0/easyocr-tflite-float.zip
- Descarga TFLite w8a8: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/easyocr/releases/v0.67.0/easyocr-tflite-w8a8.zip
- Sitio corporativo de Qualcomm: https://www.qualcomm.com/
