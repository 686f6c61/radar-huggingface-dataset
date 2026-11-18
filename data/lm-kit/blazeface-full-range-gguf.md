# lm-kit/blazeface-full-range-gguf

## Resumen

BlazeFace full-range (GGUF) es una conversión del detector de rostros BlazeFace full-range de Google MediaPipe al formato GGUF, empaquetada por lm-kit para ejecutarse nativamente en CPU a través de su runtime propietario LM-Kit, sin depender de ONNX Runtime ni TensorFlow. No es un modelo de lenguaje: es una red neuronal convolucional especializada en detección de rostros que devuelve, por cada cara detectada, una caja delimitadora, una puntuación de confianza y seis puntos de referencia faciales (ambos ojos, punta de la nariz, centro de la boca y ambos tragos de las orejas).

La variante full-range está diseñada para rostros a cualquier distancia de la cámara, no solo selfies, lo que la hace adecuada para fotos de grupo y escenas con personas alejadas. El modelo es extremadamente compacto: 514.069 parámetros y un fichero de 2,08 MB en float32, con entrada fija de 192 x 192 píxeles RGB y 2.304 anchors sobre una rejilla de 48 x 48.

Su relevancia radica en que permite incorporar detección facial en aplicaciones .NET sin infraestructura de inferencia pesada, manteniendo los pesos originales de Google sin fine-tuning ni cuantización, y con una fidelidad numérica verificada frente a LiteRT y ONNX Runtime.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (red convolucional tipo BlazeFace de MediaPipe) |
| Parametros totales | 514.069 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija 192 x 192 RGB) |
| Tipos de cuantizacion | float32 (sin cuantización; los pesos originales se mantienen sin modificar) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`blazeface-full-range.gguf`, 2,08 MB) |

## Arquitectura y entrenamiento

La red es una CNN convolucional del tipo BlazeFace, con operaciones de convolución, ReLU, suma, max pooling, padding de canales y redimensionado bilineal. La entrada es una imagen RGB de 192 x 192 píxeles, con letterboxing y normalización al rango [-1, 1]. La salida se organiza en 2.304 anchors sobre una rejilla de 48 x 48, cada uno con caja, seis keypoints y puntuación. El decoder (anchors, layout de caja y keypoints, función de score y umbrales por defecto) se almacena como metadatos dentro del propio fichero GGUF.

Los pesos son los originales de Google, sin fine-tuning ni cuantización. La conversión se realizó en dos pasos: de TFLite a ONNX con `tflite2onnx` 0.4.1, y de ONNX a GGUF con el conversor de LM-Kit. El fichero registra los hashes de origen (`general.source.sha256`, `lmkit-face.converter.source_sha256`). No se dispone de información sobre el dataset de entrenamiento ni sobre el proceso de evaluación de equidad más allá de la referencia a la model card de MediaPipe.

## Capacidades

- Detección de rostros en imágenes y fotogramas de vídeo.
- Devuelve por cada cara una caja delimitadora, una puntuación de confianza y seis landmarks: ojos, punta de la nariz, centro de la boca y tragos de las orejas.
- Variante full-range: detecta rostros a cualquier distancia de la cámara, incluidos grupos y personas alejadas.
- Procesamiento por teselas solapadas en LM-Kit para ampliar el rango de tamaños de rostro detectables por debajo del 5 % de la imagen.
- Ejecución nativa en CPU mediante el runtime LM-Kit, sin ONNX Runtime ni TensorFlow.
- No realiza reconocimiento de identidad: solo localiza rostros.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo generativo).

## Casos de uso

- Procesamiento por lotes de fotos de grupo: el detector full-range localiza rostros pequeños en imágenes con muchas personas, y el tiling de LM-Kit permite ajustar el tamaño mínimo de cara para no perder caras lejanas.
- Moderación y anonimización de imágenes: integrado en un pipeline .NET, permite localizar rostros para aplicar desenfoque o pixelado antes de publicar contenido.
- Organización de bibliotecas fotográficas: extracción de cajas y landmarks para agrupar o etiquetar imágenes por presencia de personas, sin necesidad de infraestructura GPU.
- Preprocesado para pipelines de visión: detección y recorte de rostros como paso previo a modelos de reconocimiento, análisis de expresión o verificación de calidad de imagen.
- Aplicaciones de escritorio .NET: incorporación de detección facial en herramientas locales que deben funcionar en CPU y sin dependencias de runtime pesadas.
- Análisis de vídeo en tiempo casi real en entornos con CPU: al ser un modelo de 2,08 MB, el coste por fotograma es bajo y permite procesar secuencias sin acelerador dedicado.
- Control de calidad en captura de imagen: verificación de que una foto contiene al menos un rostro bien encuadrado antes de aceptarla en un formulario o flujo documental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no es un modelo de lenguaje. La model card sí reporta una comparación de fidelidad numérica frente a otros runtimes sobre 44 entradas (30 aleatorias y 14 fotografías):

| Comparado con | Diferencia máxima de caja | Diferencia máxima de score (logit) | Caras ganadas o perdidas a umbral 0,5 |
|---|---|---|---|
| ONNX Runtime | 1,07e-4 | 9,06e-6 | 0 |
| LiteRT (`.tflite` original) | 1,53e-4 | 1,24e-5 | 0 |

No se dispone de datos de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está pensado para ejecución en CPU.
- GPU recomendadas: no disponible; no se documenta soporte GPU en la información proporcionada.
- Cabe en cualquier GPU consumer y en CPU convencional: el fichero pesa 2,08 MB en float32.
- Opciones de despliegue: runtime LM-Kit (biblioteca .NET, `LMKit.Vision.FaceDetector`); no se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| BlazeFace full-range (GGUF, lm-kit) | 514.069 | 192 x 192 RGB | GGUF | Apache 2.0 | Ejecución CPU vía LM-Kit, sin ONNX/TF |
| BlazeFace full-range (TFLite, MediaPipe) | 514.069 | 192 x 192 RGB | TFLite | Apache 2.0 | Runtime LiteRT, referencia original de Google |
| BlazeFace short-range (MediaPipe) | no disponible | no disponible | TFLite | Apache 2.0 | Variante para rostros cercanos (selfies) |

No se dispone de datos de rendimiento comparativo más allá de la fidelidad numérica reportada frente a LiteRT y ONNX Runtime.

## Limitaciones y advertencias

- El modelo solo detecta rostros; no identifica personas ni realiza reconocimiento facial.
- Está pensado para rostros que ocupen al menos aproximadamente el 5 % de la imagen que procesa; el tiling de LM-Kit amplía ese rango, pero requiere configuración adicional.
- La evaluación de sesgos y equidad remite a la model card de MediaPipe; no se aportan métricas propias de sesgo por tono de piel, género o región geográfica.
- Riesgo de falsos positivos y negativos en imágenes con oclusiones, rostros de perfil extremo o condiciones de iluminación adversas; no se documentan tasas concretas.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del runtime LM-Kit, que es propietario y no se detalla en la información disponible.
- El modelo depende del runtime LM-Kit para su uso práctico; no se documenta compatibilidad con otros motores de inferencia GGUF.
- No hay información sobre idiomas ni sobre soporte multilingüe porque no aplica a un detector facial.

## Enlaces

- Hugging Face: https://huggingface.co/lm-kit/blazeface-full-range-gguf
- LM-Kit: https://lm-kit.com
- Pesos originales TFLite: https://storage.googleapis.com/mediapipe-assets/face_detection_full_range.tflite
- Documentación del detector facial de MediaPipe: https://ai.google.dev/edge/mediapipe/solutions/vision/face_detector
