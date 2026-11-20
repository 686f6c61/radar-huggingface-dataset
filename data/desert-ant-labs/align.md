# desert-ant-labs/align

## Resumen

Align es un modelo de refinamiento de marcas temporales a nivel de palabra (word timestamps) desarrollado por Desert-Ant-Labs. No es un modelo de reconocimiento de voz en sentido estricto: recibe una transcripción ya existente —procedente de Apple SpeechAnalyzer, Whisper o cualquier otro ASR— junto con el audio original, y devuelve las mismas palabras con tiempos de inicio y fin corregidos. El problema que resuelve es la imprecisión típica de los timestamps de los sistemas ASR, que provoca subtítulos desalineados, cortes de vídeo mal posicionados y resaltados (highlights) desfasados.

Técnicamente se trata de un pipeline de dos etapas (coarse y fine) empaquetado en modelos extremadamente pequeños: alrededor de 560 KB en Core ML compilado en FP16, con variantes LiteRT/TFLite en FP32. La inferencia se ejecuta en el dispositivo en pocos milisegundos, sin necesidad de GPU de servidor ni de conexión de red una vez descargados los pesos. Soporta nueve idiomas (alemán, inglés, español, francés, italiano, japonés, coreano, portugués y chino) y se distribuye mediante SDKs para Swift (iOS, macOS, tvOS, visionOS) y JavaScript/Node.

Su relevancia actual radica en que cubre una carencia concreta de los pipelines de voz en producción: la alineación forzada ligera y de baja latencia. Frente a alternativas como WhisperX o Montreal Forced Aligner, Align apuesta por un tamaño mínimo y ejecución nativa en Apple Silicon y Node, integrándose directamente en el flujo de SpeechAnalyzer mediante `StreamingRefiner`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de dos etapas (coarse + fine) sobre Core ML / LiteRT; arquitectura interna de red no detallada en la informacion disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de busqueda por palabra, no expresada en tokens) |
| Tipos de cuantizacion | FP16 (Core ML compilado) y FP32 (LiteRT/TFLite) |
| Idiomas soportados | de, en, es, fr, it, ja, ko, pt, zh (9 idiomas) |
| Licencia | desert-ant-labs-source-available (source available, no open source) |
| Formato de pesos | `.mlmodelc` compilado (Core ML) y `.tflite` (LiteRT) |
| Tamano en disco | ~0,3 MB por etapa en Core ML FP16; ~0,5 MB por etapa en TFLite FP32 |
| Plataformas | iOS, macOS, tvOS, visionOS, Linux, Windows, Node |
| Tarea (pipeline) | automatic-speech-recognition (refinamiento de timestamps) |
| Entrada de audio | 16 kHz recomendado; otras frecuencias limitadas a menos de 37 horas |
| Version de pesos | v1.1.0 |

## Arquitectura y entrenamiento

La model card describe un diseno en dos etapas: una etapa *coarse* que aproxima la posicion de cada palabra en el audio y una etapa *fine* que ajusta los limites de inicio y fin. Ambas se empaquetan como modelos compilados independientes (`align-coarse` y `align-fine`), lo que permite ejecutarlas secuencialmente con una huella de memoria minima. No se detalla en la informacion disponible el tipo de capas, el numero de parametros ni la funcion de perdida empleada.

Tampoco se especifican los datos de entrenamiento: ni el volumen de horas de audio, ni la composicion del corpus, ni si se aplico alguna fase de ajuste supervisado especifica por idioma. Lo que si se documenta es el comportamiento funcional: el modelo recibe pares (palabra, tiempo de inicio, tiempo de fin) junto con las muestras de audio y devuelve los mismos textos con rangos temporales corregidos. Existe un mecanismo de salvaguarda estructural: si la correccion cae en el borde de la ventana de busqueda o produce un rango invertido (fin anterior al inicio), se conserva el timestamp original. En modo streaming, las palabras cuya ventana de contexto futuro aun no esta en buffer tambien mantienen sus tiempos originales.

La innovacion principal no es arquitectonica sino de despliegue: modelos de menos de 1 MB que permiten alineacion forzada en el propio dispositivo, con integracion directa en SpeechAnalyzer (iOS 26+) a traves de `StreamingRefiner`, que graba el audio pasado al analizador y corrige solo los resultados finalizados, dejando intactos los volatiles.

## Capacidades

- Refinamiento de marcas temporales a nivel de palabra sobre transcripciones existentes, con precision de milisegundos (ejemplo documentado: "world" pasa de 2,61-3,04 s a 2,57-2,98 s).
- Alineacion forzada (forced alignment) de cualquier transcripcion contra su audio, independientemente del ASR de origen.
- Soporte multilingue para nueve idiomas: aleman, ingles, espanol, frances, italiano, japones, coreano, portugues y chino.
- Deteccion previa de idioma soportado mediante `isSupported(languageCode:)`; para idiomas no soportados devuelve las palabras sin cambios y sin lanzar error.
- Integracion en streaming con Apple SpeechAnalyzer mediante `StreamingRefiner`, con soporte de audio por buffers (`analyzerInput`) o por fichero (`AVAudioFile`).
- Ejecucion en dispositivo (on-device) en iOS, macOS, tvOS, visionOS, Linux, Windows y Node, sin llamadas de red tras la descarga inicial de pesos.
- API en Swift (paquete SwiftPM `desert-ant-core` desde 4.3.0) y en JavaScript/TypeScript (`@desert-ant-labs/align`, subruta `/native` con binarios precompilados para linux-x64, linux-arm64 y darwin-arm64).
- Validacion de entrada robusta: comprueba tiempos finitos en rango [-1, 10.000.000] s, frecuencia de muestreo positiva y audio no vacio; lanza `AlignError.invalidInput` (Swift) o `RangeError` (JS) ante entradas invalidas.
- Gestion de pesos con descarga desde Hugging Face y cache local, con opcion de precarga (`download`) o directorio offline propio.

No se documentan capacidades de generacion de texto, razonamiento, codigo, vision ni tool calling: el modelo es exclusivamente de alineacion de habla.

## Casos de uso

- **Subtitulado automatico de video**: dado un transcript de Whisper o SpeechAnalyzer, Align corrige los tiempos de cada palabra para que los subtitulos SRT/VTT aparezcan y desaparezcan en el instante exacto, eliminando el desfase tipico de los timestamps brutos del ASR.
- **Edicion de video basada en transcripcion**: en editores que permiten cortar por texto (text-based editing), los cortes deben caer en el limite de palabra; Align garantiza que el corte no se coma la primera silaba ni deje colgando la ultima.
- **Generacion de clips y highlights**: para extraer fragmentos de 15-30 segundos a partir de una busqueda por palabras clave, los limites de inicio y fin deben ser precisos; el refinamiento en milisegundos evita clips que empiezan a media palabra.
- **Transcripcion en dispositivos Apple con SpeechAnalyzer**: integracion via `StreamingRefiner` en apps de iOS 26+ para obtener timestamps corregidos en tiempo real sin enviar audio a la nube, con solo 560 KB de modelos en el bundle o descargados en el onboarding.
- **Herramientas de accesibilidad**: subtitulos sincronizados y resaltado de palabra hablada (karaoke-style) en apps de lectura o aprendizaje de idiomas, donde el desfase de 40-50 ms es perceptible.
- **Pipelines de datos de voz en Node**: procesamiento por lotes de archivos de audio y transcripciones en servidores Linux (x64 o arm64) usando el subpath `/native`, con inferencia en CPU y sin dependencias de GPU.
- **Post-procesado de transcripciones medicas o legales**: cuando se necesita citar fragmentos de audio con marcas temporales exactas para auditoria o revision, el refinamiento reduce el trabajo manual de verificacion.
- **Busqueda dentro de audio**: indexacion de reuniones o podcasts por palabra con timestamps precisos, de modo que al pulsar un resultado se salte al instante exacto en el reproductor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente afirma que el refinamiento de un resultado tipico se completa en "unos pocos milisegundos" en dispositivo, sin cifras de latencia, throughput ni metricas de error de alineacion (por ejemplo, desviacion media absoluta en milisegundos) ni comparaciones cuantitativas con otros alineadores.

## Requisitos de hardware

- **VRAM**: no aplica en el sentido habitual; los modelos Core ML FP16 ocupan aproximadamente 0,3 MB cada etapa y las variantes TFLite FP32 unos 0,5 MB, por lo que la huella de memoria es del orden de megabytes, no de gigabytes.
- **GPU**: no se requiere GPU dedicada. La inferencia se ejecuta en CPU y, en plataformas Apple, aprovecha Core ML (que puede usar Neural Engine o GPU de forma transparente).
- **GPU de consumo**: cabe en cualquier dispositivo, incluidos iPhone, iPad, Apple TV, Apple Vision Pro y Mac con Apple Silicon, asi como en servidores modestos con CPU x86-64 o ARM64.
- **Plataformas de despliegue**: SDK Swift (SwiftPM) para iOS, macOS, tvOS y visionOS; paquete npm `@desert-ant-labs/align` con binarios nativos para linux-x64, linux-arm64 y darwin-arm64. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- **Latencia y throughput**: "unos pocos milisegundos" por resultado tipico segun el autor; no se publican cifras de throughput (palabras por segundo) ni latencias por tamano de audio.
- **Almacenamiento**: los pesos se descargan de Hugging Face en el primer uso y se cachean; el repositorio figura con 0,0 GB de tamano reportado, coherente con modelos de menos de 1 MB.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Idiomas | Ejecucion | Licencia |
|---|---|---|---|---|---|
| Align (desert-ant-labs) | Alineacion forzada de timestamps | ~0,3-0,5 MB por etapa | 9 | On-device (Core ML / LiteRT), Swift y Node | Source available |
| WhisperX | Pipeline ASR + alineacion (wav2vec2) | Cientos de MB (modelo de alineacion) | Amplio, depende del modelo de alineacion | Python, GPU recomendada | MIT / segun componentes |
| Montreal Forced Aligner (MFA) | Alineacion forzada clasica | Depende del diccionario y modelo acustico | Limitado a diccionarios disponibles | Python, CPU | MIT |
| Apple SpeechAnalyzer (nativo) | ASR con timestamps | Integrado en el sistema | Limitado por el sistema | On-device en Apple | Propietaria de Apple |

No se dispone de datos de rendimiento comparativo publicados en la informacion proporcionada, por lo que la comparativa se limita a caracteristicas estructurales (tamano, plataformas, licencia) y no a metricas de precision de alineacion.

## Limitaciones y advertencias

- **Licencia no open source**: la licencia `desert-ant-labs-source-available` con enlace a license.desertant.com no es una licencia de codigo abierto aprobada por OSI; es imprescindible revisar los terminos antes de cualquier uso comercial o redistribucion de los pesos.
- **No es un ASR**: Align no transcribe audio; necesita una transcripcion previa. Su calidad depende de que las palabras de entrada coincidan con el audio.
- **Correcciones plausibles pero erroneas**: la model card advierte explicitamente que las salvaguardas son estructurales y no de precision; una correccion que parece razonable pero es incorrecta se aplica igualmente.
- **Fallback silencioso**: para idiomas no soportados, palabras fuera de la ventana de busqueda o rangos invertidos, el modelo devuelve los tiempos originales sin lanzar error, lo que puede enmascarar problemas en produccion si no se monitoriza el flag `refined`.
- **Idiomas limitados a nueve**: no cubre idiomas como sueco, neerlandes, arabe, hindi o ruso; en esos casos el refinamiento no aporta nada.
- **Restricciones de entrada**: tiempos fuera de [-1, 10.000.000] s, frecuencias de muestreo no positivas, audio vacio o audio a frecuencia distinta de 16 kHz de mas de 37 horas provocan errores o rechazo.
- **Dependencia de plataforma**: la integracion con SpeechAnalyzer requiere iOS 26 o posterior; los binarios nativos de Node solo se distribuyen para linux-x64, linux-arm64 y darwin-arm64.
- **Riesgo de sesgo**: no se documenta la composicion del corpus de entrenamiento ni la cobertura por acento, dialecto o calidad de audio, por lo que no puede evaluarse el sesgo por variedad linguistica.
- **Sin benchmarks publicados**: no hay metricas de precision de alineacion ni comparaciones con WhisperX o MFA, lo que dificulta una evaluacion cuantitativa previa a la adopcion.
- **Descarga en primer uso**: si no se precargan los pesos, la primera inferencia requiere red y puede introducir latencia inesperada en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/desert-ant-labs/align
- Pesos version v1.1.0: https://huggingface.co/desert-ant-labs/align/tree/v1.1.0
- Repositorio del SDK (desert-ant-core): https://github.com/Desert-Ant-Labs/desert-ant-core
- Documentacion de origen de la model card: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/docs/models/align.md
- Requisitos Swift: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#swift
- Requisitos JavaScript/TypeScript: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#javascript-and-typescript
- Descarga y cache de modelos: https://github.com/Desert-Ant-Labs/desert-ant-core/blob/main/README.md#model-downloads-and-caching
- Paquete npm: https://www.npmjs.com/package/@desert-ant-labs/align
- Licencia: https://license.desertant.com/
