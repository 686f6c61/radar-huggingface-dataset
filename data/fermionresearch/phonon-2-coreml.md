# FermionResearch/Phonon-2-CoreML

## Resumen

Phonon-2 Core ML es la conversión a Core ML del modelo de reconocimiento automático de voz Phonon-2, desarrollado por Fermion Research y empaquetado específicamente para ejecutarse en el Neural Engine de los chips Apple Silicon. El modelo base Phonon-2 es el motor que impulsa Detta, la aplicación de dictado para Mac de la compañía, y esta variante permite invocarlo desde Swift o Python sobre macOS 15 e iOS 18 o posteriores, manteniendo la GPU libre y consumiendo muy poca energía.

Técnicamente se trata de un modelo de transcripción de audio a texto derivado de NVIDIA parakeet-tdt-0.6b-v3, del que conserva el tokenizador y las convenciones de salida (puntuación, mayúsculas y numerales). El paquete Core ML distribuye un encoder de 332 MB (ventanas de 5, 10, 15 y 35 segundos sobre un conjunto de pesos compartido, con pesos de cinco valores almacenados de forma exacta y activaciones en coma flotante de 16 bits) y un decoder de 13 MB con la red de predicción, el joint y el vocabulario, propio de una arquitectura de tipo transducer.

Su relevancia actual radica en que alcanza una precisión prácticamente idéntica a la del motor MLX de referencia (5,21 % de WER medio en los siete conjuntos de prueba ingleses del Open ASR Leaderboard) mientras se ejecuta íntegramente en el Neural Engine: procesa una hora de audio en 6 segundos en un MacBook Air M5 (606× tiempo real) y devuelve unos pocos segundos de audio en unos 11 ms una vez cargado el modelo, con marcas de tiempo por palabra.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de voz de tipo transducer (TDT, token-and-duration transducer), coherente con su modelo base parakeet-tdt-0.6b-v3; encoder con ventanas de 5/10/15/35 s y decoder con red de prediccion, joint y vocabulario |
| Parametros totales | Aproximadamente 600 M (heredados del modelo base parakeet-tdt-0.6b-v3; no detallado explicitamente en la informacion proporcionada) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | Audio en ventanas de 5, 10, 15 y 35 segundos; una locucion de hasta 35 s se procesa en una sola pasada; las grabaciones mas largas se cortan en pausas en ventanas de hasta 15 s |
| Tipos de cuantizacion | Pesos de cinco valores almacenados de forma exacta y activaciones en coma flotante de 16 bits (encoder); paquete Core ML |
| Idiomas soportados | Ingles (en) |
| Licencia | CC-BY-4.0 (pesos); Apache 2.0 (paquete Swift, runner de Python y codigo del repositorio) |
| Formato de pesos | Core ML (`Phonon-2.mlpackage`, 332 MB; `decoder.bin`, 13 MB; `manifest.json`); paquete Swift en `phonon-coreml-src.tgz` |

## Arquitectura y entrenamiento

Phonon-2 Core ML es una conversión/optimización para el Neural Engine del modelo Phonon-2, que a su vez deriva de NVIDIA parakeet-tdt-0.6b-v3. Se trata de un modelo de reconocimiento automático de voz de tipo transducer: el paquete incluye un encoder (`Phonon-2.mlpackage`) y un decoder (`decoder.bin`) que contiene la red de predicción, el joint y el vocabulario, terminología propia de las arquitecturas RNN-T/TDT. El encoder trabaja sobre ventanas de audio de 5, 10, 15 y 35 segundos mediante un único conjunto de pesos compartido, con los pesos de cinco valores almacenados de forma exacta y activaciones en coma flotante de 16 bits, y enmascara el audio a su longitud real dentro de la ventana.

No se detallan en la información proporcionada el número exacto de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF/DPO. El modelo conserva del base parakeet-tdt-0.6b-v3 el tokenizador y las convenciones de salida (puntuación, uso de mayúsculas y representación de numerales), y el repositorio incluye un fichero `NOTICE` que enumera los cambios introducidos. La innovación principal de esta variante es la integración en Core ML con el encoder sobre el Neural Engine y el decoder sobre la CPU, lo que libera la GPU y habilita inferencia totalmente en el dispositivo.

## Capacidades

- Transcripción de voz a texto en inglés con puntuación, mayúsculas y numerales.
- Marcas de tiempo a nivel de palabra: cada palabra incluye su instante de inicio y de fin en segundos (salida de texto o JSON).
- Procesamiento por lotes o por locuciones: una locucion de hasta 35 s se lee en una sola pasada; las grabaciones largas se segmentan automáticamente en pausas.
- Inferencia totalmente en el dispositivo sobre el Neural Engine de Apple Silicon, manteniendo la GPU libre.
- Soporte de formatos de audio variados: el runner de Swift lee wav, m4a, mp3, aiff, caf y flac a cualquier frecuencia de muestreo y longitud; el runner de Python lee wav y flac a cualquier frecuencia.
- Ejecución desde Swift (paquete `phonon-coreml` en macOS 15 o iOS 18+) y desde Python (con coremltools).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo de ASR, no de lenguaje generativo).
- Capacidades multilingües: limitadas al inglés en esta variante (el modelo base Phonon-2 documenta precisión en otros idiomas en su propia ficha).

## Casos de uso

- Dictado en aplicaciones de escritorio para Mac: es el motor de Detta y puede integrarse en apps de macOS mediante el paquete Swift, ofreciendo transcripción local de baja latencia (unos 11 ms para 3-5 s de audio) sin enviar datos a la nube.
- Subtitulado y generación de transcripciones temporizadas: al devolver inicio y fin por palabra, es adecuado para crear subtítulos sincronizados a partir de grabaciones largas segmentadas automáticamente.
- Notas de reuniones y transcripción de llamadas: su manejo de grabaciones de horas (una hora en 6 s en M5) permite transcribir reuniones completas en el dispositivo, preservando la privacidad.
- Aplicaciones iOS con reconocimiento de voz integrado: al ser compatible con iOS 18 o posterior, puede incorporarse en apps móviles que necesiten STT local sin coste de servidor.
- Procesamiento por lotes de archivos de audio: los runners de Swift y Python permiten transcribir directorios enteros de grabaciones (el modelo procesa 158 h de audio de prueba en 31 min, 305× tiempo real).
- Flujos de accesibilidad y entrada por voz: la baja latencia y la salida por palabra lo hacen útil para dictado continuo o interfaces controladas por voz en el dispositivo.
- Investigación en ASR y evaluación de modelos: sirve como referencia on-device reproducible frente a motores en servidor, con el código de evaluación del Open ASR Leaderboard.

## Benchmarks y rendimiento

Tasa de error de palabra (WER, %; menor es mejor), evaluada con el código del Open ASR Leaderboard sobre los conjuntos de prueba completos:

| Conjunto | Core ML (Neural Engine) | Motor Phonon-2 MLX |
|---|---:|---:|
| LibriSpeech clean | 1,73 | 1,72 |
| LibriSpeech other | 3,91 | 3,92 |
| AMI | 9,33 | 9,37 |
| Earnings-22 | 6,99 | 6,96 |
| GigaSpeech | 8,33 | 8,35 |
| SPGISpeech | 3,70 | 3,70 |
| VoxPopuli | 2,46 | 2,46 |
| **Media de los siete** | **5,21** | **5,21** |

Velocidad en un MacBook Air M5, con el modelo cargado una vez, el encoder sobre el Neural Engine y el decoder sobre la CPU:

| Audio | Tiempo | Veces tiempo real |
|---|---:|---:|
| Una hora de LibriSpeech en un solo fichero | 6,0 s | 606× |
| 158 horas de audio de prueba, locución a locución | 31 min | 305× |
| 20 grabaciones de 2 s a 2 min (797 s) | 2,0 s | 400× |
| Grabación de 3 a 5 s con el modelo cargado (mediana de 20) | 11 ms | no disponible |

## Requisitos de hardware

- Diseñado para el Neural Engine de Apple Silicon; el encoder se ejecuta en el Neural Engine y el decoder en la CPU.
- Almacenamiento: el paquete Core ML ocupa 332 MB (encoder) más 13 MB (decoder); el repositorio completo ronda 1,0 GB.
- Memoria en tiempo de ejecución: no disponible de forma explícita en la información proporcionada.
- GPU: el diseño libera la GPU, por lo que no requiere una GPU dedicada en Apple Silicon.
- Cabe en hardware de consumo Apple: validado en un MacBook Air M5; compatible con macOS 15 e iOS 18 o posteriores.
- La primera ejecución prepara el paquete para el Neural Engine, lo que puede tardar uno o dos minutos; la copia compilada se conserva y las cargas posteriores tardan menos de un segundo.
- Despliegue: Core ML con el paquete Swift `phonon-coreml` (compilado con `swift build -c release`) o el runner de Python con coremltools; para Apple Silicon, Linux, Windows y GPUs NVIDIA puede usarse el modelo base Phonon-2 a través de la CLI `fermion`.
- Latencia y throughput: 11 ms para grabaciones de 3-5 s una vez cargado; 606× tiempo real en ficheros largos y 305× en el barrido de 158 horas.
- Python: requiere un entorno virtual con Python 3.10 a 3.13 (coremltools aún no ofrece wheels para 3.14).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/ventana | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phonon-2 Core ML | ~600 M (derivado de parakeet-tdt-0.6b-v3) | Ventanas de 5/10/15/35 s; locucion hasta 35 s | 5,21 % WER medio (Open ASR Leaderboard, 7 conjuntos en ingles) | CC-BY-4.0 (pesos) / Apache 2.0 (codigo) | HuggingFace, Core ML, Swift y Python |
| Phonon-2 (base) | ~600 M | no disponible | 5,21 % WER medio (motor MLX) | CC-BY-4.0 (pesos), segun su ficha | HuggingFace; CLI `fermion` en Apple Silicon, Linux, Windows y NVIDIA |
| NVIDIA parakeet-tdt-0.6b-v3 | ~600 M | no disponible | no disponible en la informacion proporcionada | CC-BY-4.0 (modelo base de NVIDIA) | HuggingFace (NVIDIA) |
| OpenAI Whisper large-v3 | ~1550 M | 30 s fijos | no disponible en la informacion proporcionada | MIT | HuggingFace, multiple tooling |

## Limitaciones y advertencias

- Idioma: esta variante solo transcribe ingles; el modelo base documenta precision en otros idiomas, pero no en este paquete.
- Ambito: es un modelo de ASR, no un modelo de lenguaje generativo; no soporta tool calling, agentes ni razonamiento multi-paso.
- Segmentacion de audio largo: las grabaciones superiores a 35 s se cortan en pausas en ventanas de hasta 15 s; el recorte puede afectar si no existen pausas claras.
- Formato de audio: el runner de Python solo lee wav y flac (a diferencia del de Swift, que admite mas formatos).
- Requisito de plataforma: necesita Neural Engine (Apple Silicon) y macOS 15 o iOS 18 o posteriores; no esta pensado para ejecutarse en GPU de terceros en esta variante.
- Dependencia de versiones: el runner de Python requiere Python 3.10-3.13 por falta de wheels de coremltools en 3.14.
- Sesgos y alucinacion: no se documentan sesgos especificos ni tasas de alucinacion en la informacion proporcionada; como todo modelo de ASR, puede producir errores en audio ruidoso, acentos o dominios no representados en sus datos.
- Licencia: los pesos son CC-BY-4.0, lo que exige atribucion en uso comercial; el codigo del paquete Swift, el runner de Python y el repositorio son Apache 2.0. Al derivar de parakeet-tdt-0.6b-v3, deben respetarse las condiciones de ese modelo base; el fichero `NOTICE` recoge los cambios.
- Adopcion temprana: el repositorio presenta un numero muy bajo de descargas (9) y de "likes" (0) en el momento de la consulta, sin comunidad ni soporte amplios.

## Enlaces

- HuggingFace (Phonon-2-CoreML): https://huggingface.co/FermionResearch/Phonon-2-CoreML
- Modelo base Phonon-2: https://huggingface.co/FermionResearch/Phonon-2
- Repositorio del paquete Swift `phonon-coreml`: https://github.com/fermionresearch/phonon-coreml (rama 1.1.1)
- Producto Detta (app de dictado para Mac): https://www.fermionresearch.com/products/detta
- Modelo base de NVIDIA: parakeet-tdt-0.6b-v3 (referenciado como origen de los pesos)
