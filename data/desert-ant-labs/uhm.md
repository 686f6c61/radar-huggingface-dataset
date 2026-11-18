# desert-ant-labs/uhm

## Resumen

Uhm es un modelo de clasificación de audio especializado en la detección de muletillas y disfluencias del habla ("uh", "um", "hmm") con precisión de fotograma de hasta 20 ms. Lo desarrolla Desert Ant Labs y se distribuye a través de Hugging Face bajo una licencia propia de código disponible (*source available*). A diferencia de los modelos de reconocimiento de voz, Uhm no necesita transcripción: opera directamente sobre la señal de audio y devuelve intervalos temporales con una puntuación de confianza para cada muletilla detectada.

El modelo está entrenado principalmente en inglés con transferencia acústica a español, francés, alemán y neerlandés, y se distribuye en formatos optimizados para inferencia en dispositivo: Core ML (fp16 compilado), LiteRT/TFLite (int8 con pesos cuantizados), ONNX y Core AI. Su tamaño es reducido (24-45 MB según formato), lo que lo hace apto para ejecutarse en móviles, navegadores y sistemas de escritorio sin conexión a la nube.

Su relevancia actual radica en el auge de herramientas de edición de audio y vídeo asistidas por IA que necesitan eliminar muletillas automáticamente sin enviar el audio a servidores externos, así como en aplicaciones de accesibilidad y análisis de fluidez del habla. El SDK asociado (Swift, Kotlin, JavaScript) gestiona la descarga, el caché y el procesamiento del audio, incluyendo la reconciliación con transcripciones para recortar muletillas sin cortar palabras reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de clasificación de audio; pesos en Core ML, LiteRT/TFLite, ONNX y Core AI) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio por ventanas; resolución temporal de 20 ms) |
| Tipos de cuantizacion | fp16 (Core ML compilado), int8 weight-only (LiteRT/TFLite), fp16 (variante web) |
| Idiomas soportados | de, en, es, fr, nl (entrenado en inglés con transferencia acústica al resto) |
| Licencia | desert-ant-labs-source-available (código disponible, no open source) |
| Formato de pesos | Core ML (`.mlmodelc`), Core AI (`.aimodel`), LiteRT/TFLite (`.tflite`), ONNX (`.onnx`), variante web fp16 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo (tipo de red, capas, mecanismo de atención). Lo que sí se especifica es que se trata de un modelo de clasificación de audio orientado a la detección de disfluencias a nivel de fotograma, con una resolución temporal de 20 ms y un umbral mínimo de duración de segmento configurable (0,12 s por defecto). El modelo se entrenó con audio en inglés y aplica transferencia acústica a español, francés, alemán y neerlandés, lo que implica que el rendimiento en esos idiomas puede ser inferior al del inglés.

No se han publicado datos sobre el número de tokens de audio, la composición del dataset de entrenamiento ni si se emplearon técnicas de ajuste fino supervisado o preferencias (RLHF/DPO). El modelo se distribuye compilado para Core ML y cuantizado a int8 en LiteRT, con una equivalencia declarada del 99,7-100 % en el argmax por fotograma respecto a la versión ONNX. El etiquetado del tipo de muletilla (`.uh`, `.um`, `.hmm`, `.and`, `.other`) se realiza mediante el framework SoundAnalysis de Apple, por lo que solo está disponible en plataformas Apple; en el resto de plataformas el campo `type` es `null`.

## Capacidades

- Detección de muletillas y disfluencias ("uh", "um", "hmm") en audio con precisión temporal de hasta 20 ms.
- Funcionamiento sin transcripción: analiza directamente la señal de audio decodificada a 16 kHz mono.
- Salida de intervalos con inicio, fin y confianza (0-1) por cada muletilla detectada.
- Tres presets de sesgo que equilibran exhaustividad y precisión: `.precision` (umbral 0,75), `.balanced` (0,65) y `.recall` (0,50).
- Etiquetado del tipo de muletilla en plataformas Apple mediante SoundAnalysis.
- Reconciliación con transcripciones: ajusta, recorta o divide palabras del transcript para eliminar muletillas sin cortar palabras reales.
- Procesamiento en dispositivo en iOS, macOS, tvOS, visionOS, Android, Linux, Windows, navegador y Node.
- Soporte de progreso y cancelación en archivos largos.
- Multilingüe con transferencia acústica a de, en, es, fr y nl.

## Casos de uso

- Edición automática de pódcast y vídeo: el modelo detecta cada muletilla con precisión de 20 ms y permite recortarlas automáticamente del audio, usando el preset `.precision` para evitar cortes erróneos en palabras reales.
- Limpieza de entrevistas y grabaciones de investigación: con el preset `.recall` se obtienen todos los candidatos para revisión manual, útil cuando no se puede permitir perder ninguna disfluencia.
- Herramientas de accesibilidad y entrenamiento del habla: análisis de fluidez en terapias de logopedia, cuantificando la frecuencia y duración de muletillas por sesión sin enviar audio a la nube.
- Transcripción asistida: integración con pipelines de ASR para reconciliar palabras del transcript con las muletillas detectadas y limpiar el texto final antes de publicarlo.
- Aplicaciones móviles nativas sin conexión: el SDK Swift y Kotlin permite ejecutar el modelo en iOS y Android con pesos de 24-45 MB, sin coste de servidor ni latencia de red.
- Edición en navegador: la demo y el paquete npm con LiteRT.js permiten analizar archivos de audio o vídeo directamente en el navegador mediante WebAssembly.
- Procesamiento por lotes en servidor: la variante nativa de Node permite analizar grandes volúmenes de audio en pipelines de backend sin depender de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente declara que la versión LiteRT int8 coincide con la versión ONNX en el 99,7-100 % del argmax por fotograma, pero no se proporcionan métricas de precisión, recall ni F1 sobre conjuntos de evaluación.

## Requisitos de hardware

- VRAM estimada: no aplica en la mayoría de despliegues; el modelo está pensado para CPU y aceleradores en dispositivo. El tamaño de pesos es de 24 MB (int8) y 45 MB (fp16).
- GPU recomendadas: no se especifican; el modelo se ejecuta en CPU en móviles, navegador y escritorio. En Apple Silicon se beneficia de Core ML y Core AI.
- Cabe en cualquier GPU consumer y en dispositivos móviles de gama media; no requiere GPU dedicada.
- Opciones de despliegue: SDK Swift (Core ML/Core AI), SDK Kotlin (LiteRT), paquete npm con LiteRT.js (navegador) y variante nativa para Node, además de ONNX para integraciones personalizadas.
- Latencia y throughput: no disponibles. La API expone `phaseTimings.inferenceSec` para medir el tiempo de inferencia por archivo, pero no se publican cifras de referencia.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto/ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Uhm (Desert Ant Labs) | Clasificación de audio (detección de muletillas) | en, es, fr, de, nl | Ventanas con resolución de 20 ms | Source available | Hugging Face, SDK Swift/Kotlin/JS |
| Whisper (OpenAI) | ASR (transcripción) | Multilingüe amplio | 30 s por ventana | MIT | Hugging Face, múltiples runtimes |
| Silero VAD | Detección de actividad de voz | Independiente del idioma | Ventanas cortas | MIT | Hugging Face, ONNX |
| Wav2Vec2 (Meta) | Representaciones de audio / ASR | Multilingüe | Ventanas variables | MIT/Apache | Hugging Face |

No se dispone de datos de rendimiento comparativo entre Uhm y estos modelos en la información proporcionada. La comparación se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- El entrenamiento se realizó en inglés con transferencia acústica a los demás idiomas; el rendimiento en español, francés, alemán y neerlandés puede ser inferior y no se han publicado métricas por idioma.
- El etiquetado del tipo de muletilla solo funciona en plataformas Apple (SoundAnalysis); en Android, Linux, Windows, navegador y Node el campo `type` es `null`.
- La licencia es *source available*, no open source: es necesario revisar los términos en https://license.desertant.com/ antes de un uso comercial.
- No se han publicado benchmarks de precisión, recall ni F1, por lo que la calidad real en producción debe validarse con datos propios.
- El modelo está especializado exclusivamente en detección de muletillas; no transcribe ni comprende el contenido semántico del audio.
- Riesgo de falsos positivos en audio con ruido, música o habla solapada; los presets de sesgo permiten ajustar el equilibrio, pero no eliminan el problema.
- El umbral mínimo de duración por defecto (0,12 s) puede descartar muletillas muy cortas si no se ajusta `minDurationSec`.
- La descarga inicial de pesos desde Hugging Face requiere conectividad; el SDK los cachea tras la primera ejecución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/desert-ant-labs/uhm
- Pesos v1.2.0: https://huggingface.co/desert-ant-labs/uhm/tree/v1.2.0
- Demo en navegador: https://huggingface.co/spaces/desert-ant-labs/uhm-demo
- Página del producto: https://desertant.com/models/uhm/
- Repositorio del SDK: https://github.com/Desert-Ant-Labs/desert-ant-core
- Licencia: https://license.desertant.com/
