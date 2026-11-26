# BuilderHelm/Parakeet-TDT-0.6B-V3-CoreML

## Resumen

Parakeet-TDT-0.6B-V3-CoreML es la conversión a Core ML del modelo de reconocimiento automático del habla (ASR) multilingüe Parakeet TDT 0.6B v3 de NVIDIA, publicada por BuilderHelm. El modelo original combina un encoder Conformer con un decodificador Token-and-Duration Transducer (TDT) de 0,6 mil millones de parámetros, y esta versión lo empaqueta en cinco componentes Core ML ejecutables de forma totalmente offline sobre Apple Silicon (M1 en adelante, macOS 15+ e iOS 18+), aprovechando el Neural Engine.

El interés de esta ficha reside en que traslada un modelo ASR de referencia de NVIDIA al ecosistema nativo de Apple sin reentrenamiento: los pesos del encoder, predictor y joint se mantienen en FP16 sin cuantizar, mientras que el frontend y las interfaces en coma flotante permanecen en FP32. El paquete ocupa aproximadamente 1,27 GB antes de compresión y cubre 25 idiomas europeos, lo que lo convierte en una opción relevante para transcripción local en aplicaciones macOS/iOS con requisitos de privacidad estrictos.

La versión documentada es la 1.0.1 (FP16), distribuida a través del SDK BuilderHelmAudio 0.2.0 o superior. No se distribuye un modelo compilado específico para M5: los paquetes portables se compilan localmente, y la validación física se ha realizado únicamente en un Mac con M5 y en un iPhone 13.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Conformer (dos etapas secuenciales) + decodificador TDT (Token-and-Duration Transducer) con predictor LSTM de dos capas y 640 unidades + módulo joint |
| Parametros totales | 0,6 mil millones (aproximado, según nombre del modelo base) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | Ventanas de audio de 15 s y 30 s (funciones `w15`/`w30`); sin límite fijo de duración de grabación en el SDK, procesado por bloques de hasta 480.001 muestras |
| Tipos de cuantizacion | FP16 sin cuantizar en encoder, predictor y joint; FP32 en frontend e interfaces en coma flotante |
| Idiomas soportados | bg, cs, da, de, el, en, es, et, fi, fr, hr, hu, it, lt, lv, mt, nl, pl, pt, ro, ru, sk, sl, sv, uk (25 idiomas) |
| Licencia | CC BY 4.0 |
| Formato de pesos | Core ML `.mlpackage` (Preprocessor, Encoder, EncoderTail, Predictor, Joint) + `vocab.json` y `config.json` |

## Arquitectura y entrenamiento

Esta publicación no entrena ningún modelo: es una conversión del checkpoint `nvidia/parakeet-tdt-0.6b-v3` a Core ML, sin entrenamiento adicional. El pipeline reproduce la arquitectura TDT original de NVIDIA: un encoder Conformer dividido en dos programas secuenciales (`Encoder.mlpackage` y `EncoderTail.mlpackage`) para mantenerse por debajo de 1 GB por programa, un predictor LSTM TDT de dos capas y 640 unidades, y un módulo joint que produce 8.193 logits de token y cinco logits de duración. Las dos etapas del encoder comparten pesos entre las funciones de ventana de 15 s y 30 s, de modo que añadir la función larga incrementó el tamaño del paquete solo un 3,3 % aproximadamente.

La innovación técnica de la conversión está en el frontend: un preprocesador FP32 que extrae como máximo 401 tramas log-mel crudas por predicción DFT y luego normaliza la ventana completa de 15 o 30 segundos (`normalize_w15`/`normalize_w30`). La preénfasis se evalúa en FP32 en tiempo de ejecución. Según el autor, esta ruta acotada hace estable la decodificación completa repetida y las características congeladas coinciden con la referencia de ventana completa validada dentro de 0,0000005. El vocabulario conserva las 8.192 piezas originales y el contrato de ejecución está fijado por checksum. El SDK descarga un commit fijado, verifica los SHA-256 de cada archivo, compila los paquetes portables y reutiliza su caché.

## Capacidades

- Reconocimiento automático del habla (ASR) offline en 25 idiomas europeos: búlgaro, checo, danés, alemán, griego, inglés, español, estonio, finés, francés, croata, húngaro, italiano, lituano, letone, maltés, neerlandés, polaco, portugués, rumano, ruso, eslovaco, esloveno, sueco y ucraniano.
- Transcripción de audio completo mediante API asíncrona (`SpeechRecognizer.transcribe(file:)`), con entrada remuestreada a 16 kHz mono.
- Procesamiento de grabaciones largas sin límite fijo de duración en el SDK: lectura por bloques acotados, ventanas con contexto derecho, cortes en pausas silenciosas y unión de secuencias de tokens solapadas que coinciden.
- Reintentos acotados de subdivisión en ventanas con habla pero completamente en blanco, y hasta cuatro reintentos de ventana corta en audio activo y variable dentro de una ventana parcialmente en blanco.
- Ejecución local completa: audio y transcripciones permanecen en el dispositivo.
- Reutilización del reconocedor con peticiones serializadas y cancelación cooperativa.
- No soporta: resultados parciales en vivo, CTC, keyword spotting, marcas de tiempo alineadas a palabra o segmento, subtítulos ni etiquetas de hablante. `ctcTranscript` es nulo y `tokens` está vacío para V3.

## Casos de uso

- Transcripción de reuniones y notas de voz en macOS/iOS: el SDK procesa grabaciones de duración arbitraria por bloques y ventanas de 15/30 s, por lo que encaja en apps de productividad que necesitan transcribir audio localmente sin enviar datos a la nube.
- Dictado por voz en aplicaciones nativas Swift: la API `SpeechRecognizer.load(.parakeetTdtV3)` permite integrar dictado en apps de escritorio y móviles con una llamada asíncrona, manteniendo el audio en el dispositivo.
- Subtitulado y archivado de contenido audiovisual en 25 idiomas europeos: aunque el modelo no genera marcas de tiempo alineadas, la transcripción completa por ventanas sirve para generar borradores de subtítulos que se alinean posteriormente con herramientas externas.
- Cumplimiento y privacidad en entornos regulados: al ejecutarse íntegramente offline en Apple Silicon, es adecuado para sectores (sanidad, legal, administración) donde el audio no puede salir del dispositivo.
- Investigación en ASR multilingüe: permite reproducir y comparar el rendimiento FP16 frente a la referencia FP32 de NVIDIA en hardware Apple, con un WER medido de 14,46 % frente a 14,52 % en el conjunto reservado multilingüe de 200 archivos.
- Herramientas de accesibilidad: transcripción local de audio para personas con discapacidad auditiva en apps de macOS/iOS, sin dependencia de conectividad.
- Procesamiento por lotes de archivos de audio en un Mac: el SDK lee bloques de hasta 480.001 muestras y gestiona ventanas solapadas, lo que permite transcribir carpetas completas de grabaciones de forma desatendida.

## Benchmarks y rendimiento

Datos de precisión publicados por el autor (WER, con normalización Whisper EnglishTextNormalizer para inglés y BasicTextNormalizer con NFC y diacríticos para el resto; los errores y el habla vacía se mantienen en la puntuación):

| Evaluación | Archivos | WER nativo NVIDIA CPU FP32 | WER SDK FP16 |
|---|---:|---:|---:|
| Habla multilingüe reservada | 200 | 14,52 % | 14,46 % |
| Confirmación multilingüe final separada | 75 | 13,44 % | 13,21 % |
| Poo... (dato truncado en la información disponible) | no disponible | no disponible | no disponible |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, LibriSpeech, Common Voice) ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM/almacenamiento: el paquete ocupa aproximadamente 1,27 GB antes de compresión de descarga; hay que reservar espacio adicional para la caché compilada de Core ML. El repositorio completo en Hugging Face pesa 2,5 GB.
- Hardware objetivo: Macs con Apple Silicon M1 o posterior, macOS 15 o superior; iPhone con iOS 18 o superior.
- Validación física: únicamente un Mac con M5 y un iPhone 13. El rendimiento en otros chips y en configuraciones de 8 GB no está medido.
- GPU dedicadas (A100, H100, RTX 4090): no aplica; el modelo está empaquetado para Core ML y Neural Engine de Apple.
- Despliegue: Core ML a través del SDK BuilderHelmAudio 0.2.0 o superior en Swift; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son compatibles con este formato.
- Latencia y throughput: no disponibles. El autor advierte que el primer uso de una función puede incurrir en un coste de preparación y que las llamadas síncronas activas a Core ML pueden terminar antes de que la cancelación retorne.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Parakeet-TDT-0.6B-V3-CoreML (este) | 0,6 B | 25 europeos | Core ML FP16 | CC BY 4.0 | Offline en Apple Silicon, sin marcas de tiempo |
| nvidia/parakeet-tdt-0.6b-v3 | 0,6 B | 25 europeos | NeMo (checkpoint original) | CC BY 4.0 | Referencia FP32; WER 14,52 % en el conjunto reservado |
| Whisper large-v3 (OpenAI) | 1,55 B | ~99 | PyTorch, GGUF, Core ML (comunidad) | MIT | Mayor cobertura de idiomas; requiere más cómputo |
| Whisper small (OpenAI) | 244 M | ~99 | PyTorch, GGUF, Core ML | MIT | Menor tamaño, menor precisión en idiomas distintos del inglés |

La comparación con Whisper se ofrece como referencia de categoría; no se dispone en la información proporcionada de WER comparativos entre Parakeet y Whisper sobre los mismos conjuntos.

## Limitaciones y advertencias

- Es una API offline: no ofrece resultados parciales en vivo, CTC, keyword spotting, marcas de tiempo alineadas a palabra o segmento, subtítulos ni etiquetas de hablante.
- `ctcTranscript` es nulo y `tokens` está vacío en V3; las tramas de emisión internas no son alineaciones a palabra.
- La validación física se limita a un Mac con M5 y un iPhone 13; el rendimiento en otros chips Apple y en configuraciones de 8 GB no está medido.
- El primer uso de una función de ventana puede incurrir en costes de preparación; las llamadas síncronas a Core ML pueden completarse antes de que la cancelación surta efecto.
- Riesgo de alucinación y errores en habla con ruido, acentos no cubiertos o audio de baja calidad: el WER medido ronda el 13-15 % en los conjuntos multilingües publicados, con errores y habla vacía incluidos en la puntuación.
- Cobertura limitada a 25 idiomas europeos; no incluye lenguas asiáticas, africanas ni americanas distintas del inglés.
- Licencia CC BY 4.0: permite uso comercial con atribución; hay que conservar la atribución a NVIDIA y a BuilderHelm y revisar los términos del modelo base.
- El modelo depende del SDK BuilderHelmAudio y de la compilación local de los paquetes Core ML; no se distribuye un binario compilado para M5.
- El experimento de arrastre de estado del predictor entre ventanas falló y no se incluye; el estado se reinicia por ventana, lo que puede afectar a la coherencia en grabaciones muy largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BuilderHelm/Parakeet-TDT-0.6B-V3-CoreML
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Perfil del autor en Hugging Face: https://huggingface.co/BuilderHelm
- Repositorio del SDK BuilderHelmAudio: https://github.com/BuilderHelm/BuilderHelmAudio
- ZenVoice (homepage): https://getzenvoice.com
- Descarga de ZenVoice para Mac: https://getzenvoice.com/download
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
