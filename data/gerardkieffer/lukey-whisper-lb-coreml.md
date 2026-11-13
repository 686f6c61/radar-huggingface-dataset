# gerardkieffer/lukey-whisper-lb-coreml

## Resumen

`lukey-whisper-lb-coreml` es un paquete de conversiones a Core ML de los modelos Whisper en luxemburgués desarrollados por el equipo LuxASR de la Universidad de Luxemburgo. El repositorio, publicado por el usuario gerardkieffer, no contiene pesos nuevos ni reentrenados: empaqueta tres variantes (base, small y medium) en formato Core ML para su ejecución en el Apple Neural Engine mediante WhisperKit, la librería de reconocimiento de voz en dispositivo de Argmax. Está pensado para la app LuKey y para cualquier desarrollador que quiera ASR de luxemburgués en iPhone, iPad o Mac sin conexión.

La relevancia de esta ficha radica en que el luxemburgués es una lengua de bajos recursos: los modelos originales se ajustaron sobre aproximadamente 150 horas de pares audio-texto, una cantidad muy inferior a la de los modelos multilingües de propósito general. Este repositorio resuelve el problema de despliegue en el ecosistema Apple, convirtiendo los checkpoints de PyTorch a Core ML con cuantización float16 y, en el caso de medium, paletización de pesos a 6 bits.

El tamaño del repositorio es de 1,3 GB e incluye tres carpetas (`base/`, `small/`, `medium-6bit/`) con los componentes `AudioEncoder.mlmodelc`, `MelSpectrogram.mlmodelc` y `TextDecoder.mlmodelc`, además de `config.json`, `generation_config.json` y los ficheros del tokenizador. La licencia es OpenMDW 1.0, la misma que los modelos originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper de OpenAI), convertido a Core ML |
| Parametros totales | no disponible (variantes base, small y medium de Whisper) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de Whisper, 30 s por segmento) |
| Tipos de cuantizacion | float16 (base y small); paletizacion 6 bits (medium-6bit) |
| Idiomas soportados | lb (luxemburgues) |
| Licencia | OpenMDW 1.0 (openmdw-1.0) |
| Formato de pesos | Core ML (`.mlmodelc`); repo de 1,3 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es Whisper, un transformer encoder-decoder con espectrograma mel como entrada, originalmente publicado por OpenAI bajo licencia MIT. Los checkpoints base de los que parten los modelos son los de Whisper de OpenAI; el equipo LuxASR los ajustó finamente sobre aproximadamente 150 horas de pares audio-texto en luxemburgués. El modelo insignia de LuxASR, usado en su servicio web y API, no es abierto y no está incluido en este repositorio.

La conversión a Core ML no reentrena pesos: transforma de float32 a float16 (el formato que computa el Apple Neural Engine) y, solo para la variante medium, aplica paletización de pesos a 6 bits. El proceso se realizó con whisperkittools (commit `84f77a8`), coremltools 9.0, torch 2.5.0 y transformers 4.53.0. Para medium, el decoder se generó con paletización mixta de 6 bits y el encoder se convirtió con `WhisperAudioEncoder` y se paletizó con coremltools (kmeans, 6 bits, por tensor), ya que la variante de 6 bits de whisperkittools producía transcripciones vacías. Los `config.json` originales de unilux fijan `use_cache: false`, lo que hace fallar el test de referencia del decoder en whisperkittools aunque la conversión sea correcta; para medium se usó una copia local con `use_cache: true` sin modificar pesos.

## Capacidades

- Reconocimiento automático de voz (ASR) en luxemburgués, con salida de texto transcrito.
- Ejecución en dispositivo (on-device) sobre Apple Neural Engine mediante WhisperKit, sin necesidad de conexión a red.
- Tres perfiles de tamaño (base, small, medium-6bit) que permiten ajustar el equilibrio entre precisión y consumo de recursos.
- Soporte de tareas de transcripción con opciones de decodificación (`DecodingOptions(task: .transcribe, language: "lb")`).
- No se documentan capacidades de traducción, diarización, tool calling ni agentes; el modelo es específicamente ASR.
- Capacidad multilingüe limitada al luxemburgués (`lb`).

## Casos de uso

- Transcripción de voz en la app LuKey: el paquete está diseñado explícitamente para esta aplicación, permitiendo dictado y transcripción de audio en luxemburgués en iPhone e iPad con WhisperKit.
- Subtitulado local de grabaciones: integración en flujos de postproducción en Mac que transcriban entrevistas o reuniones en luxemburgués sin enviar audio a la nube, usando la variante small o medium-6bit según la precisión requerida.
- Accesibilidad para hablantes de luxemburgués: dictado por voz en aplicaciones macOS/iOS para usuarios con dificultades motrices, aprovechando la inferencia en el Neural Engine y el bajo consumo energético.
- Investigación lingüística de campo: transcripción de corpus orales en luxemburgués recogidos en entrevistas, con la ventaja de que el modelo funciona sin conexión en un portátil Apple.
- Prototipado de asistentes de voz locales: uso de la variante base (152 MB) para iterar rápidamente en demos de comandos de voz en luxemburgués dentro del ecosistema Swift.
- Archivado y búsqueda de audio: transcripción por lotes de archivos de audio en un Mac para generar índices de texto buscables, seleccionando medium-6bit (654 MB) cuando se prioriza la calidad de transcripción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica una comprobación cualitativa: en una grabación de prueba de 14 segundos en luxemburgués, la variante base difiere del original en PyTorch únicamente en puntuación y mayúsculas, y small y medium-6bit producen exactamente el mismo texto.

## Requisitos de hardware

- Inferencia exclusivamente en hardware Apple con soporte de Core ML y Apple Neural Engine (iPhone, iPad, Mac).
- VRAM/memoria estimada según tamaño de pesos: base float16 ≈ 152 MB; small float16 ≈ 492 MB; medium-6bit ≈ 654 MB, más el consumo del encoder, mel-spectrogram y tokenizador.
- No está pensado para GPU NVIDIA (A100, H100, RTX 4090); para ese hardware habría que usar los modelos originales de unilux en PyTorch.
- Cabe en cualquier dispositivo Apple moderno, incluidos iPhone e iPad de gama media, gracias a los tamaños reducidos.
- Despliegue mediante WhisperKit (Swift), con `WhisperKitConfig(model:modelRepo:)`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| lukey-whisper-lb-coreml (este) | base/small/medium Whisper | segmentos de 30 s (Whisper) | lb | OpenMDW 1.0 | Core ML |
| unilux/whisper-base-v1-luxembourgish | Whisper base | segmentos de 30 s | lb | OpenMDW 1.0 | PyTorch/safetensors |
| unilux/whisper-small-v1-luxembourgish | Whisper small | segmentos de 30 s | lb | OpenMDW 1.0 | PyTorch/safetensors |
| unilux/whisper-medium-v1-luxembourgish | Whisper medium | segmentos de 30 s | lb | OpenMDW 1.0 | PyTorch/safetensors |
| Whisper de OpenAI (multilingüe) | tiny a large | segmentos de 30 s | multilingüe | MIT | PyTorch/safetensors |

La diferencia principal frente a los originales de unilux es el formato (Core ML frente a PyTorch) y la cuantización (float16 y 6 bits), no la calidad del modelo. Frente a Whisper multilingüe de OpenAI, este paquete está especializado en luxemburgués y limitado a ese idioma.

## Limitaciones y advertencias

- Solo transcribe luxemburgués (`lb`); no es un modelo multilingüe ni traduce.
- El modelo insignia de LuxASR, de mayor calidad, no es abierto y no está incluido; estas variantes son las versiones abiertas base, small y medium.
- Entrenado con aproximadamente 150 horas de audio, un volumen reducido que puede limitar la robustez ante acentos, ruido de fondo o domain shift.
- Riesgo de alucinación y de errores en nombres propios, cifras y puntuación, habitual en modelos Whisper de tamaño pequeño.
- La variante medium-6bit usa paletización de 6 bits, lo que puede introducir degradaciones sutiles frente a float16; la model card solo valida una grabación de 14 segundos.
- El decoder de medium se convirtió con `use_cache: true` sobre una copia local del config, un cambio respecto al original que conviene tener en cuenta al reproducir la conversión.
- Licencia OpenMDW 1.0: es necesario revisar sus términos antes de uso comercial; la model card remite al fichero `LICENSE` del repositorio.
- Dependencia del ecosistema Apple: no es desplegable en servidores Linux con GPU sin reconvertir a otro formato.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria amplia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/gerardkieffer/lukey-whisper-lb-coreml
- Modelo original base: https://huggingface.co/unilux/whisper-base-v1-luxembourgish
- Modelo original small: https://huggingface.co/unilux/whisper-small-v1-luxembourgish
- Modelo original medium: https://huggingface.co/unilux/whisper-medium-v1-luxembourgish
- Proyecto LuxASR (Universidad de Luxemburgo): https://luxasr.uni.lu
- WhisperKit (Argmax): https://github.com/argmaxinc/WhisperKit
- whisperkittools: https://github.com/argmaxinc/whisperkittools
- Script de paletización del encoder: https://huggingface.co/gerardkieffer/lukey-whisper-lb-coreml/blob/main/palettize_encoder.py
- Licencia OpenMDW 1.0: https://huggingface.co/gerardkieffer/lukey-whisper-lb-coreml/blob/main/LICENSE
- Referencia: Gilles, Hosseini-Kivanani & Ayité Hillah (2023), LUX-ASR, IEEE SLT 2022, pp. 1147-1149.
- Referencia: Gilles, Ayité Hillah & Hosseini-Kivanani (2023), ASRLux, ICPhS 2023, pp. 3091-3095.
