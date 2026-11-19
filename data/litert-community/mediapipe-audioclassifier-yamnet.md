# litert-community/MediaPipe-AudioClassifier-YAMNet

## Resumen

YAMNet es un clasificador de eventos sonoros de tipo CNN que opera sobre espectrogramas log-mel y que Google publica dentro del ecosistema MediaPipe Audio Classifier. El modelo reconoce 521 clases de AudioSet (voz, instrumentos musicales, animales, alarmas y sonidos ambientales) y se distribuye como un único artefacto `yamnet.tflite` de 4,13 MB con pesos internamente cuantizados a 8 bits y entrada/salida en float32. La versión alojada en `litert-community` es byte a byte idéntica al artefacto oficial servido por Google, reempaquetada para su uso con LiteRT y MediaPipe Tasks.

El modelo no es un LLM ni un sistema generativo: es un extractor de etiquetas acústicas pensado para inferencia on-device en Android, iOS, web, Flutter, Python y sistemas embebidos. Su relevancia actual reside en que permite etiquetar audio en tiempo real con latencias de milisegundos (12,29 ms de media en CPU de Pixel 6) sin depender de servicios en la nube, lo que lo convierte en una pieza habitual en pipelines de detección de sonidos, accesibilidad y monitorización acústica.

Arquitectura, número de parámetros y longitud de contexto no están documentados en la información disponible; los datos verificables son el tamaño del artefacto, la forma de los tensores de entrada y salida y la lista de etiquetas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN sobre espectrograma log-mel (YAMNet), no disponible el detalle de capas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de audio de 15 600 muestras (0,975 s a 16 kHz) |
| Tipos de cuantizacion | float32 en I/O con cuantizacion interna de pesos a 8 bits (int8) |
| Idiomas soportados | no aplica (clasificador de eventos, no ASR); etiquetas en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | TFLite (`.tflite`), con `TFLITE_METADATA` embebida |

Especificaciones adicionales del artefacto:

| Parametro | Valor |
|---|---|
| Tamano del binario | 4 126 810 bytes (4,13 MB) |
| SHA-256 de `yamnet.tflite` | `4d8b4a53282dc83ef04e3e7dbc4fbc98082e34e44ed798e16c3a0cdd4c584faf` |
| Entrada | `waveform_binary`, shape `[15600]`, float32, rango -1.0..1.0 |
| Salida | `tower0/network/layer32/final_output`, shape `[1, 521]`, float32, rango 0..1.0 |
| Frecuencia de muestreo | 16 kHz mono |
| Numero de clases | 521 |
| Metadatos embebidos | nombre `yamnet/classification`, version 1, autor `MediaPipe` |
| Fichero auxiliar | `yamnet_label_list.txt` (6 230 bytes, SHA-256 `8e1267a120c1932b7273c0d0e0c5529edbb9a35512b437b1c8982baa59047051`) |

## Arquitectura y entrenamiento

La model card describe YAMNet como un clasificador que recibe directamente la forma de onda PCM de 16 kHz y calcula internamente el espectrograma log-mel antes de pasarlo por la red convolucional; el tensor de salida `tower0/network/layer32/final_output` sugiere una torre convolucional con al menos 32 capas numeradas en el grafo. Los pesos se almacenan cuantizados a 8 bits mientras la interfaz externa permanece en float32, lo que reduce el tamaño del artefacto a 4,13 MB manteniendo compatibilidad con los delegados de LiteRT.

El entrenamiento se realizó sobre AudioSet, el corpus de eventos sonoros de Google, y el modelo cubre las 521 categorías de la ontología de AudioSet. No se especifican en la información disponible el número de tokens o horas de audio, la composición exacta del dataset, ni si hubo etapas de ajuste fino supervisado adicionales. Tampoco se documentan innovaciones de decodificación o atención: al tratarse de un clasificador multi-etiqueta, no emplea generación autoregresiva.

## Capacidades

- Clasificación multi-etiqueta de eventos sonoros sobre 521 categorías de AudioSet (voz, música, instrumentos, animales, alarmas, sonidos ambientales y urbanos).
- Procesamiento de ventanas de audio de 15 600 muestras (0,975 s) a 16 kHz mono, con normalización en [-1.0, 1.0].
- Cálculo interno del espectrograma log-mel, sin necesidad de preprocesado acústico externo.
- Ejecución on-device en Android, iOS, web/JavaScript, Flutter, Python y sistemas embebidos mediante MediaPipe Tasks y LiteRT.
- Modos de ejecución `AUDIO_CLIPS` y streaming por ventanas deslizantes dentro de la API `AudioClassifier`.
- Control del número de resultados devueltos por ventana (`max_results`).
- Etiquetas alineadas con `yamnet_label_list.txt`, también embebidas en los metadatos TFLite.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio generativo ni traducción; no es un modelo de lenguaje.

## Casos de uso

- Detección de alarmas domésticas: el clasificador puede etiquetar en tiempo real alarmas de humo, timbres y sirenas a partir de un flujo de 16 kHz, con 12,29 ms de latencia media en CPU de Pixel 6, lo que permite reaccionar antes de que el usuario procese el sonido conscientemente.
- Accesibilidad para personas con discapacidad auditiva: integrado en una app Android o iOS vía MediaPipe Tasks, el modelo traduce eventos acústicos relevantes (timbre, llanto de bebé, claxon) en notificaciones visuales o hápticas.
- Monitorización acústica urbana: despliegue en nodos embebidos que clasifiquen sonidos ambientales (tráfico, obras, fauna) por ventanas de 0,975 s, aprovechando que el binario de 4,13 MB cabe en dispositivos con recursos limitados.
- Moderación de contenido en plataformas de audio: etiquetado automático de clips subidos por usuarios para detectar categorías sensibles (gritos, explosiones, contenido musical protegido) antes de la revisión humana.
- Analítica de medios y publicidad: segmentación automática de podcasts y retransmisiones para identificar música, voz y efectos, generando marcas temporales sobre las que construir índices o informes de audiencia.
- Robótica y sistemas de vigilancia: fusión de las etiquetas acústicas con sensores de movimiento para disparar eventos compuestos (cristal roto más movimiento), ejecutando la inferencia localmente sin enviar audio a la nube.
- Prototipado rápido multiplataforma: uso del mismo `yamnet.tflite` en la demo web, en una app Flutter y en un notebook de Python para validar una idea de producto acústico antes de invertir en un modelo propio.

## Benchmarks y rendimiento

Resultados publicados en la documentación de MediaPipe Audio Classifier:

| Modelo | Dispositivo | Latencia CPU | Latencia GPU |
|---|---|---:|---:|
| YamNet | Pixel 6 | 12,29 ms | no disponible |

No se han publicado resultados de benchmarks de precisión (mAP, accuracy por clase, AUC) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido habitual; el artefacto ocupa 4,13 MB en almacenamiento y su huella en memoria es del orden de megabytes, no de gigabytes.
- GPU recomendadas: innecesarias; el modelo está diseñado para CPU y delegados LiteRT en móvil. No se reportan latencias GPU en la documentación.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) y también en dispositivos sin GPU dedicada: móviles Android/iOS, Raspberry Pi y microcontroladores con suficiente memoria para LiteRT.
- Opciones de despliegue: MediaPipe Tasks (`AudioClassifier`) en Python, Android (Kotlin/Java), iOS (Swift), web/JavaScript y Flutter; LiteRT/TFLite con delegados CPU, GPU o NNAPI; integración en apps nativas mediante los sample apps oficiales.
- Latencia: 12,29 ms de media por pipeline completo en Pixel 6 (CPU). Throughput no disponible.
- Descarga: `hf download litert-community/MediaPipe-AudioClassifier-YAMNet yamnet.tflite --local-dir .` con `huggingface_hub`.

## Comparativa con modelos similares

| Modelo | Tipo | Clases | Entrada | Tamano | Licencia |
|---|---|---|---|---|---|
| YAMNet (MediaPipe) | CNN log-mel | 521 (AudioSet) | 0,975 s @ 16 kHz | 4,13 MB | Apache 2.0 |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos verificables sobre modelos comparables (por ejemplo, otros clasificadores de AudioSet empaquetados para LiteRT), por lo que no se presenta una comparación cuantitativa.

## Limitaciones y advertencias

- Es un clasificador multi-etiqueta de eventos sonoros, no un sistema ASR: no transcribe voz ni identifica hablantes.
- No es un reconocedor biométrico de locutor; no debe usarse para identificación de personas.
- Requiere estrictamente audio mono a 16 kHz normalizado en [-1.0, 1.0]; otras frecuencias o canales múltiples exigen remuestreo y mezcla previos.
- La ventana de análisis es de 0,975 s; eventos más cortos o solapados pueden quedar mal resueltos según la estrategia de ventanas deslizantes.
- Las 521 clases provienen de la ontología de AudioSet, con el desequilibrio y la granularidad irregulares propios de ese corpus; clases raras tendrán recall bajo.
- Las etiquetas están en inglés; no se documentan traducciones oficiales.
- No se publica un informe de fairness específico en la página de documentación de MediaPipe, según la propia model card.
- Riesgo de falsos positivos en entornos con ruido de fondo fuerte o micrófonos de baja calidad; conviene calibrar umbrales por caso de uso.
- Licencia Apache 2.0: permite uso comercial y modificaciones, con obligación de conservar avisos de licencia y atribución; el binario es byte a byte idéntico al artefacto oficial de Google.
- El repositorio declara 0 descargas y 0 likes en el momento de la consulta, lo que no implica ninguna garantía de soporte comunitario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/MediaPipe-AudioClassifier-YAMNet
- Artefacto `yamnet.tflite`: https://huggingface.co/litert-community/MediaPipe-AudioClassifier-YAMNet/blob/main/yamnet.tflite
- Lista de etiquetas: https://huggingface.co/litert-community/MediaPipe-AudioClassifier-YAMNet/blob/main/yamnet_label_list.txt
- Documentación de Audio Classifier: https://developers.google.com/edge/mediapipe/solutions/audio/audio_classifier
- Guía de instalación Python: https://developers.google.com/edge/mediapipe/solutions/setup_python
- Guía de instalación Web/JavaScript: https://developers.google.com/edge/mediapipe/solutions/setup_web
- Guía de instalación Android: https://developers.google.com/edge/mediapipe/solutions/setup_android
- Guía de instalación iOS: https://developers.google.com/edge/mediapipe/solutions/setup_ios
- Guía de instalación Flutter: https://developers.google.com/edge/mediapipe/solutions/setup_flutter
- Demo web: https://google-ai-edge.github.io/mediapipe-samples-web/#/audio/audio_classifier
- Sample Android: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/audio_classifier/android
- Sample iOS: https://github.com/google-ai-edge/mediapipe-samples/tree/main/examples/audio_classifier/ios
- Notebook Python: https://colab.research.google.com/github/google-ai-edge/mediapipe-samples/blob/main/examples/audio_classifier/python/audio_classification.ipynb
- Sample Flutter: https://github.com/google/flutter-mediapipe/tree/main/samples/audio/audio_classifier
