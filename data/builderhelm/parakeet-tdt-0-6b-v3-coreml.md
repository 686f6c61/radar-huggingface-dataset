# BuilderHelm/Parakeet-TDT-0.6B-V3-CoreML

## Resumen

Parakeet TDT 0.6B V3 CoreML es la conversión a Core ML del modelo de reconocimiento automático del habla (ASR) multilingüe `nvidia/parakeet-tdt-0.6b-v3`, publicada por BuilderHelm. El objetivo no es reentrenar el modelo, sino empaquetar el checkpoint original de NVIDIA en cinco programas Core ML (`Preprocessor`, `Encoder`, `EncoderTail`, `Predictor` y `Joint`) para ejecutar transcripción offline sobre Apple Silicon, tanto en macOS 15+ (M1 y posteriores) como en iOS 18+.

El modelo conserva la arquitectura TDT (Token-and-Duration Transducer) de NVIDIA: un encoder Conformer, un predictor LSTM de dos capas y 640 unidades, y una red conjunta que emite logits para 8.193 tokens y cinco duraciones. Los pesos y el cómputo del encoder, predictor y joint se ejecutan en FP16 sin cuantización, mientras que el frontend log-mel y las interfaces en coma flotante permanecen en FP32.

Su relevancia actual reside en que permite ASR multilingüe de 25 idiomas europeos completamente en el dispositivo, sin conexión y con los datos de audio y transcripción sin salir del hardware del usuario. El paquete ocupa aproximadamente 1,27 GB antes de compresión, lo que lo hace viable en equipos de consumo con Apple Silicon, aunque el autor advierte que el rendimiento en configuraciones de 8 GB y en chips distintos de M5 e iPhone 13 no se ha medido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer): encoder Conformer en dos etapas secuenciales, predictor LSTM de 2 capas y 640 unidades, joint network con 8.193 logits de token y 5 de duración |
| Parametros totales | 0,6 mil millones (600M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventanas de audio de 15 s y 30 s (funciones `w15` y `w30`); sin límite fijo de duración de grabación en la SDK, que procesa el audio en bloques de hasta 480.001 muestras |
| Tipos de cuantizacion | FP16 sin cuantizar en encoder, predictor y joint; FP32 en frontend e interfaces de coma flotante. Se evaluaron candidatos INT8 block-32, INT8 block-16 e INT4 para el encoder, pero se descartaron en favor de FP16 |
| Idiomas soportados | 25: bg, cs, da, de, el, en, es, et, fi, fr, hr, hu, it, lt, lv, mt, nl, pl, pt, ro, ru, sk, sl, sv, uk |
| Licencia | CC BY 4.0 |
| Formato de pesos | Core ML `.mlpackage` (FP16 y FP32), con `vocab.json` y `config.json`; biblioteca `coreml`, integración vía Swift |

## Arquitectura y entrenamiento

La arquitectura es un transducer TDT heredado íntegramente del checkpoint de NVIDIA, sin entrenamiento adicional por parte de BuilderHelm. El encoder Conformer se divide en dos programas Core ML secuenciales (`Encoder` y `EncoderTail`), cada uno por debajo de 1 GB, para facilitar la compilación y la carga; ambas etapas comparten pesos entre las funciones de ventana corta (`w15`) y larga (`w30`), de modo que añadir la función larga solo incrementa el bundle un 3,3 % en lugar de duplicar el encoder. El predictor mantiene el LSTM original de dos capas y 640 unidades, y el joint emite los 8.193 logits de token y los cinco logits de duración que caracterizan la decodificación TDT.

El frontend FP32 extrae como máximo 401 tramas log-mel crudas por predicción DFT y normaliza después la ventana completa de 15 o 30 segundos; la preénfasis se evalúa en FP32 en tiempo de ejecución. Esta ruta acotada hace estable la decodificación completa repetida y las características congeladas coinciden con la referencia de ventana completa validada dentro de 0,0000005. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, al tratarse de una conversión del modelo original.

## Capacidades

- Reconocimiento automático del habla offline en 25 idiomas europeos, con normalización de texto específica por idioma (Whisper EnglishTextNormalizer para inglés y BasicTextNormalizer con NFC y diacríticos conservados para el resto).
- Procesamiento de grabaciones largas sin límite fijo en la SDK: lectura en bloques de hasta 480.001 muestras, ventanas con contexto derecho, cortes preferentes en pausas silenciosas y unión por solapamiento de secuencias de tokens coincidentes.
- Recuperación de ventanas parcialmente en blanco mediante subdivisiones acotadas y hasta cuatro reintentos de ventana corta en audio activo y variable.
- Ejecución íntegra en el dispositivo: el audio y las transcripciones no salen del hardware del usuario.
- Integración nativa en Swift mediante BuilderHelmAudio 0.2.0 o superior, con descarga de commit fijado, verificación SHA-256 y caché de compilación.
- Entrada resampleada a 16 kHz mono; selección automática de la función de 15 s para peticiones cortas y de 30 s para las largas.
- No soporta resultados parciales en vivo, CTC, keyword spotting, timestamps alineados de palabra o segmento, subtítulos ni etiquetas de hablante; `ctcTranscript` es nulo y `tokens` está vacío para V3.

## Casos de uso

- Transcripción de reuniones y entrevistas en local: la SDK procesa grabaciones largas en bloques acotados y une ventanas por solapamiento de tokens, por lo que puede transcribir conversaciones de horas sin enviar audio a la nube y cumpliendo requisitos de privacidad estrictos.
- Dictado y notas de voz en aplicaciones iOS: con soporte para iOS 18+ y ejecución en el dispositivo, el modelo permite convertir voz a texto en apps de productividad sin conexión y sin coste por petición de API.
- Subtitulado y archivo de contenido audiovisual multilingüe: los 25 idiomas cubiertos permiten transcribir material en búlgaro, checo, danés, neerlandés, polaco, rumano, sueco, ucraniano y otros, aunque sin timestamps alineados nativos, por lo que el alineado temporal debe resolverse en la capa de aplicación.
- Análisis de llamadas de atención al cliente: los resultados reportados sobre extractos naturales de earnings calls (10,74 % WER en FP32 nativo y 10,78 % en la SDK FP16) indican un rendimiento adecuado para transcribir audio telefónico y alimentar pipelines de análisis de sentimiento o cumplimiento.
- Investigación lingüística y corpus de habla: la licencia CC BY 4.0 y la preservación de diacríticos en la normalización facilitan la generación de transcripciones para estudios comparativos entre lenguas eslavas, bálticas y germánicas.
- Procesamiento por lotes en estaciones de trabajo Mac: el paquete compila localmente y la SDK reutiliza la caché del reconocedor, de modo que se pueden serializar peticiones y procesar carpetas completas de audio en un Mac con Apple Silicon sin infraestructura de GPU dedicada.
- Prototipado de asistentes de voz embebidos: la API Swift con `try await recognizer.transcribe(file:)` permite integrar ASR en prototipos de macOS e iOS con cancelación cooperativa de peticiones.

## Benchmarks y rendimiento

| Evaluación | Archivos | WER FP32 CPU nativa NVIDIA | WER FP16 SDK |
|---|---:|---:|---:|
| Habla multilingüe reservada | 200 | 14,52 % | 14,46 % |
| Confirmación multilingüe final separada | 75 | 13,44 % | 13,21 % |
| Grabaciones cortas reservadas únicas agrupadas | 275 | 14,24 % | 14,14 % |
| Extractos naturales continuos de earnings calls | 29 | 10,74 % | 10,78 % |
| Extractos de confirmación de llamadas naturales | 18 | 11,92 % | 11,86 % |

Además, en el conjunto de regresión Long20 (20 composites conocidos de LibriSpeech), la política de solapamiento antigua de V3 puntuó un 14,03 % de WER, mientras que la SDK de producción actual sobre M5 alcanza un 1,83 % con recuperación acotada de ventanas parcialmente en blanco. El autor advierte que se trata de un resultado de conjunto de regresión, no de una nueva afirmación de precisión sobre datos reservados. Las 275 grabaciones se mantuvieron fuera del proceso de ingeniería, pero se desconoce el solapamiento con el preentrenamiento y la disjunción de hablantes; los extractos naturales en inglés provienen de un corpus usado previamente en investigación de 110M y la confirmación separada no es independiente por hablante.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en Apple Silicon con memoria unificada. El bundle ocupa aproximadamente 1,27 GB antes de compresión y requiere espacio adicional para la caché compilada de Core ML.
- Equipos objetivo: Mac con Apple Silicon M1 o posterior y macOS 15+, e iPhone con iOS 18+.
- Validación física: el autor solo ha validado el rendimiento en un Mac con M5 y un iPhone 13; el comportamiento en otros chips y en configuraciones de 8 GB no se ha medido.
- Cabe en GPU de consumo: sí, en el ecosistema Apple Silicon; no se distribuye una versión compilada específica para M5, los paquetes se compilan localmente.
- Despliegue: Core ML con la SDK BuilderHelmAudio 0.2.0 o superior en Swift; no se mencionan opciones de despliegue con vLLM, llama.cpp, Ollama o TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles en la información proporcionada. El autor indica que el primer uso de una función puede incurrir en coste de preparación y que las llamadas síncronas activas de Core ML pueden terminar antes de que la cancelación retorne.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Parakeet TDT 0.6B V3 CoreML (este) | 600M | Ventanas de 15 s y 30 s; grabaciones largas por bloques | 25 europeos | CC BY 4.0 | Core ML FP16/FP32 |
| nvidia/parakeet-tdt-0.6b-v3 | 600M | no disponible en la información proporcionada | 25 europeos | no disponible en la información proporcionada | checkpoint original (no disponible el detalle) |
| Whisper (referencia de normalización citada) | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar con el checkpoint original de NVIDIA, del que este paquete es una conversión sin entrenamiento adicional y con precisión FP16 validada frente a FP32 nativo. No se dispone de datos de benchmarks de otros modelos ASR comparables en la documentación consultada.

## Limitaciones y advertencias

- El modelo es offline y no ofrece resultados parciales en vivo, CTC, keyword spotting, timestamps alineados de palabra o segmento, subtítulos ni etiquetas de hablante; `ctcTranscript` es nulo y `tokens` está vacío para V3.
- Los frames de emisión internos no son alineamientos de palabras, por lo que no deben usarse como tales en aplicaciones que requieran sincronización temporal precisa.
- El estado del predictor se reinicia en cada ventana; el experimento de arrastre de estado no se distribuye.
- El rendimiento solo está validado físicamente en un Mac con M5 y un iPhone 13; no se ha medido en otros chips ni en configuraciones de 8 GB.
- Las grabaciones de evaluación tienen solapamiento desconocido con el preentrenamiento y disjunción de hablantes no verificada; los extractos naturales de confirmación no son independientes por hablante.
- El resultado de 1,83 % de WER en Long20 es un conjunto de regresión, no una afirmación de precisión sobre datos reservados.
- Riesgo de alucinación y sesgos: no se documentan en la información disponible; los errores y el habla vacía permanecen en la puntuación de evaluación.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero conviene verificar las condiciones del checkpoint base de NVIDIA antes de redistribuir.
- Las llamadas síncronas activas de Core ML pueden completarse antes de que la cancelación retorne, lo que afecta al control de latencia en aplicaciones interactivas.
- Se requiere espacio adicional en disco para la caché compilada de Core ML más allá de los 1,27 GB del bundle.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BuilderHelm/Parakeet-TDT-0.6B-V3-CoreML
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- SDK BuilderHelmAudio: https://github.com/BuilderHelm/BuilderHelmAudio
- Métricas de evaluación: https://huggingface.co/BuilderHelm/Parakeet-TDT-0.6B-V3-CoreML/blob/main/evaluation/metrics.json
