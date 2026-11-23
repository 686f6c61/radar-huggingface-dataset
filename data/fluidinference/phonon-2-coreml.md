# FluidInference/phonon-2-coreml

## Resumen

Phonon-2-coreml es la conversión a Core ML de Phonon-2, un modelo de reconocimiento automático del habla (ASR) en inglés desarrollado por Fermion Research como reentrenamiento con conciencia de cuantización (*quantization-aware training*) de `nvidia/parakeet-tdt-0.6b-v3`. La compilación Core ML la publica FluidInference y está pensada para ejecutarse de forma nativa en Apple Silicon (Neural Engine y GPU) a través de la librería FluidAudio. El modelo conserva la arquitectura TDT (Token-and-Duration Transducer) del original, con tokenizador, ventana de 15 segundos y contrato de decodificación idénticos a los de la versión v3.

La innovación principal reside en la compresión extrema del encoder: cada fila de pesos del encoder toma uno de cinco valores aprendidos, materializados como paletas fp16 (`constexpr_lut_to_dense`) o como máscara de dispersión más paleta sobre los pesos no nulos (`constexpr_lut_to_sparse`). Esto reduce el encoder a entre 176 MB y 470 MB según la variante, sin añadir ruido de recuantización: las cinco variantes producen transcripciones idénticas.

Es relevante ahora porque demuestra que un encoder ASR de 0,6 mil millones de parámetros puede ejecutarse en el Neural Engine de un Apple M5 Pro a 193× en tiempo real sobre LibriSpeech test-clean, con un WER del 2,47 %, a cambio de una penalización de precisión moderada frente al Parakeet v3 original (2,27 %). El modelo está disponible bajo licencia CC-BY-4.0 y solo soporta inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer), encoder Transformer + decoder RNN-T + joint |
| Parametros totales | 0,6 mil millones (heredados de parakeet-tdt-0.6b-v3) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventana de audio de 15 s (variantes de 5,04 s y 10,16 s en el encoder multifunción) |
| Tipos de cuantizacion | Paletas de 6 bits por 8 filas (dispersa y densa), 4 bits por 4 filas, 2 bits por fila, 3 bits por fila; decoder y joint en fp16 desde tablas int6 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Core ML (`.mlmodelc`), decodificador y joint fp16 |

## Arquitectura y entrenamiento

El modelo es una compilación Core ML del checkpoint Phonon-2 de Fermion Research, que a su vez es un reentrenamiento con conciencia de cuantización de `nvidia/parakeet-tdt-0.6b-v3`. La arquitectura subyacente es un transductor TDT con encoder Transformer, red de predicción RNN-T (`Decoder.mlmodelc`) y un módulo conjunto de un solo paso con top-64 (`JointDecisionv3.mlmodelc`). El preprocesador y el vocabulario son los de la versión v3, lo que garantiza compatibilidad de tokenizador y de contrato de decodificación.

La compilación Core ML no recuantiza: exporta los pesos exactos de cinco valores del checkpoint como paletas fp16 o como máscara de dispersión más paleta sobre los no nulos. El encoder es un modelo multifunción con tres programas (`enc_5040ms`, `enc_10160ms`, `enc_15000ms`) que comparten un único blob de pesos de 341 MB. Los tres producen el mismo encoder enmascarado y transcripciones idénticas; la elección de ventana solo afecta a la latencia. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en el material proporcionado.

## Capacidades

- Reconocimiento automático del habla en inglés con salida de transcripción y marcas temporales a nivel de token.
- Procesamiento por ventanas de 5,04 s, 10,16 s y 15 s mediante un encoder multifunción que selecciona la ventana más pequeña que contiene el audio.
- Ejecución en Neural Engine (ANE) y GPU de Apple Silicon, con compilación en caché del ANE (~55 s por función la primera vez).
- Decodificación TDT con módulo conjunto de un solo paso y top-64, heredada de Parakeet v3.
- Compatibilidad con la API `AsrManager` de FluidAudio (`AsrModelVersion.phonon2`) y con la CLI `fluidaudiocli`.
- No soporta tool calling, agentes, visión, audio de entrada más allá de la transcripción ni capacidades multilingües.

## Casos de uso

- Transcripción en tiempo real en aplicaciones iOS y macOS: el encoder multifunción permite procesar clips cortos en ~6 ms (ventana de 5 s) en lugar de pagar el coste de una pasada de 15 s, lo que lo hace adecuado para dictado y subtitulado en vivo.
- Procesamiento por lotes de archivos largos: las grabaciones de una hora se segmentan en pausas sin solapamiento; en un M5 Pro, una hora de Earnings-22 se transcribe en 5,55 s (649×).
- Subtitulado de reuniones y notas de voz: la ventana de 15 s y el WER del 2,47 % en LibriSpeech test-clean permiten generar transcripciones de calidad para actas y resúmenes posteriores.
- Transcripción local con privacidad: al ejecutarse íntegramente en el dispositivo mediante Core ML, los datos de audio no salen del equipo, lo que encaja en entornos sanitarios, legales o corporativos con requisitos de confidencialidad.
- Indexación y búsqueda de archivos de audio: la salida con marcas temporales permite alinear transcripción y audio para búsqueda por palabra clave en archivos de podcasts o grabaciones de clase.
- Integración en pipelines de accesibilidad: la ejecución en segundo plano en iOS mediante el Neural Engine permite generar subtítulos para personas con discapacidad auditiva sin depender de la nube.
- Evaluación comparativa de ASR en Apple Silicon: la CLI `asr-benchmark` con `--model-version phonon2` permite medir WER y RTFx sobre LibriSpeech test-clean y test-other para decidir entre variantes de encoder.

## Benchmarks y rendimiento

Resultados de FluidAudio `asr-benchmark` en un Apple M5 Pro (macOS 27) con el encoder en el Neural Engine. WER a nivel de corpus; RTFx = audio total / tiempo total de procesamiento.

| Conjunto (ANE) | v3 | Ultra | Phonon-2 |
|---|---|---|---|
| test-clean (2620 archivos) WER | 2,27 % | 2,13 % | 2,47 % |
| test-other (2939 archivos) WER | 4,12 % | 3,81 % | 4,62 % |
| test-clean RTFx | 149–152× | 151× | 193× (escalera) / 159× (forma única) |
| test-other RTFx | 138× | 142× | 146× |

Rendimiento por variante de encoder (una ventana de 15 s, M5 Pro, ANE):

| Archivo | Tamano | Codificacion | ANE | ANE RTFx | GPU |
|---|---:|---|---:|---:|---|
| `Encoder.mlmodelc` (por defecto, escalera) | 341 MB | máscara dispersa + paleta de 6 bits por 8 filas, 3 longitudes | 18,6 ms (15 s) / 12 ms (10 s) / 6 ms (5 s) | 193× | ~150 s de carga en cada arranque |
| `Encoder_sparse-g8.mlmodelc` | 321 MB | máscara dispersa + paleta de 6 bits por 8 filas | 18,6 ms | 159× | 16 ms, pero ~150 s de carga |
| `Encoder_sparse-g4.mlmodelc` | 246 MB | máscara dispersa + paleta de 4 bits por 4 filas | 24,3 ms | 140× | misma advertencia de carga |
| `Encoder_sparse-g1.mlmodelc` | 176 MB | máscara dispersa + paleta de 2 bits por fila | 70 ms | ~70× | misma advertencia de carga |
| `Encoder_lut6.mlmodelc` | 470 MB | paleta densa de 6 bits por 8 filas | 18,6 ms | 155× | 16 ms, 0,6 s de carga |
| `Encoder_lut3.mlmodelc` | 253 MB | paleta densa de 3 bits por fila | 72 ms | 70× | 16 ms, 0,7 s de carga |
| v3 `Encoder.mlmodelc` (referencia) | 445 MB | — | 23,5 ms | 149–152× | 18 ms |

Una hora de Earnings-22 se transcribe en 5,55 s (649×, WER 16,7 %) con la escalera, frente a 7,5 s (480×, WER 17,2 %) con el encoder disperso-g8 anterior.

## Requisitos de hardware

- Ejecución exclusiva en Apple Silicon; requiere iOS 18+ / macOS 15+ para las paletas `constexpr_lut_to_dense` y `constexpr_lut_to_sparse`.
- VRAM/tamaño en disco: el repositorio ocupa 1,8 GB; el encoder por defecto pesa 341 MB y las variantes oscilan entre 176 MB y 470 MB.
- GPU recomendadas: Neural Engine de Apple M-series (opción por defecto y única para trabajo en segundo plano en iOS); en GPU, `Encoder_lut3.mlmodelc` (253 MB) o `Encoder_lut6.mlmodelc` (470 MB) evitan la penalización de carga de ~150 s de los encoders dispersos.
- No está pensado para GPU NVIDIA (A100, H100, RTX 4090); para esos entornos habría que usar el checkpoint original `FermionResearch/Phonon-2` o `nvidia/parakeet-tdt-0.6b-v3`.
- Despliegue mediante FluidAudio (`AsrModels.downloadAndLoad(version: .phonon2)`), la CLI `fluidaudiocli transcribe` / `asr-benchmark`, o carga local con `AsrModels.loadLocal(from:version:encoderComputeUnits:)`.
- Latencia: 18,6 ms por ventana de 15 s en ANE; 12 ms para 10 s; 6 ms para 5 s. Primera compilación del ANE de ~55 s por función (cacheada después).
- Throughput: 193× en LibriSpeech test-clean y 649× en Earnings-22 de una hora con el encoder por defecto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER test-clean | RTFx (ANE) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Phonon-2-coreml (este) | 0,6 B | ventana de 15 s (5,04/10,16/15 s) | 2,47 % | 193× | CC-BY-4.0 | Hugging Face, Core ML |
| parakeet-tdt-0.6b-v3-coreml | 0,6 B | ventana de 15 s | 2,27 % | 149–152× | no disponible en la información | Hugging Face, Core ML |
| Parakeet v3 Ultra (referencia de la model card) | 0,6 B | ventana de 15 s | 2,13 % | 151× | no disponible en la información | no disponible |
| FermionResearch/Phonon-2 (original) | 0,6 B | ventana de 15 s | no disponible | no disponible | no disponible en la información | Hugging Face |

Phonon-2-coreml sacrifica entre 0,2 y 0,5 puntos de WER frente a v3 y Ultra, pero mejora el throughput en ANE (193× frente a 149–152×) y reduce el tamaño del encoder (341 MB frente a 445 MB). Frente al checkpoint original Phonon-2, esta versión añade la compilación Core ML y la escalera de ventanas, a costa de quedar restringida al ecosistema Apple.

## Limitaciones y advertencias

- Solo reconoce inglés; no hay soporte multilingüe.
- El WER empeora respecto a v3 (2,47 % frente a 2,27 % en test-clean; 4,62 % frente a 4,12 % en test-other) y de forma más acusada en Earnings-22 (16,7 % frente a 17,2 % del encoder anterior, con mejora en este caso concreto).
- La cuantización de cinco valores por fila puede degradar el rendimiento en dominios alejados de LibriSpeech (acentos, ruido, jerga técnica); no se han publicado evaluaciones fuera de los conjuntos citados.
- Los encoders dispersos (`Encoder_sparse-*`) materializan los pesos en la GPU en cada arranque (~150 s de CPU no cacheada); en GPU conviene usar las variantes densas `lut`.
- La primera carga en el Neural Engine compila cada función (~55 s por función en un M5 Pro); una caché antigua de FluidAudio mantiene el archivo previo hasta borrar el directorio del modelo `phonon-2`.
- Requiere iOS 18+ / macOS 15+; no funciona en versiones anteriores ni en hardware que no sea Apple Silicon.
- Licencia CC-BY-4.0: permite uso comercial con atribución; debe conservarse el aviso de atribución upstream incluido en `NOTICE` / `LICENSE`.
- Riesgo de alucinación en audio con ruido extremo o silencios largos, inherente a los modelos transducer; no se han publicado tasas de inserción específicas.
- No soporta tool calling, agentes ni otras modalidades; es exclusivamente un modelo ASR.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FluidInference/phonon-2-coreml
- Modelo base: https://huggingface.co/FermionResearch/Phonon-2
- Parakeet v3 Core ML de referencia: https://huggingface.co/FluidInference/parakeet-tdt-0.6b-v3-coreml
- Repositorio FluidAudio: https://github.com/FluidInference/FluidAudio
- PR de integración en FluidAudio (#980): https://github.com/FluidInference/FluidAudio/pull/980
- PR de la escalera de encoders (#1019): https://github.com/FluidInference/FluidAudio/pull/1019
