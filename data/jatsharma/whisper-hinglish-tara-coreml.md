# jatsharma/whisper-hinglish-tara-coreml

## Resumen

Tara (Hinglish Whisper large-v3) — Core ML es una conversión del modelo de reconocimiento automático del habla `Trelis/tara` al formato Core ML para su uso con WhisperKit en Apple Silicon. El modelo original es un fine-tune de Whisper large-v3 de OpenAI, especializado en habla code-switching hindi-inglés (hinglish), desarrollado por Trelis. Esta versión, publicada por el usuario `jatsharma`, no modifica los pesos: solo cambia el formato de los ficheros para permitir inferencia totalmente local en Macs con chip Apple.

La relevancia de esta conversión reside en que habilita la transcripción de reuniones y audio hinglish sin conexión a servicios en la nube, con la particularidad de preservar los términos ingleses en alfabeto latino mientras el hindi se transcribe en devanagari. Para ello, Tara introduce un token especial `<|mixedcode|>` que debe insertarse justo después del token de idioma, algo que WhisperKit no hace de forma nativa y que requiere un envoltorio sobre el decodificador de texto.

El repositorio ocupa 3,1 GB y contiene el encoder (1,2 GB), el decodificador (1,7 GB), el front-end log-mel y el tokenizador. La licencia es Apache-2.0, heredada del modelo original. El autor advierte de que la inferencia es lenta: el decodificador tarda aproximadamente 1,6 veces la duración del audio en un M1 Pro, por lo que recomienda una conversión alternativa más rápida para uso cotidiano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3), convertido a Core ML |
| Parametros totales | no disponible (heredados de Whisper large-v3; el repositorio no los detalla) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de 224 tokens en el decodificador; audio en fragmentos de hasta ~18 s |
| Tipos de cuantizacion | no disponible (ficheros `.mlmodelc` compilados; el repositorio no especifica precision) |
| Idiomas soportados | hindi (hi) e ingles (en), con modo code-switching hinglish |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML (`.mlmodelc`), tokenizador en JSON |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper large-v3: un transformer encoder-decoder con 32 capas en el encoder y 32 en el decodificador, front-end log-mel de 128 bins y un vocabulario ampliado a 51.904 entradas para incluir el token `<|mixedcode|>`. El modelo base `Trelis/tara` es un fine-tune de Whisper large-v3 sobre habla hindi-inglesa; el repositorio no proporciona detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

La conversión se realizó con `whisperkittools` (commit `84f77a8`), fijando la longitud máxima de secuencia del decodificador en 224 tokens y compilando a `.mlmodelc`. Las comprobaciones de precisión del conversor (salidas del encoder y del decodificador frente a PyTorch) superaron un umbral de 25 dB PSNR. La innovación destacable no está en el entrenamiento sino en el modo mixed-code: la inserción del token `<|mixedcode|>` tras `<|sot|><|hi|>` fuerza al modelo a emitir hindi en devanagari y términos ingleses en alfabeto latino, algo que sin ese token produce salida únicamente en devanagari.

## Capacidades

- Transcripción automática de habla (ASR) en hindi, inglés y code-switching hinglish.
- Modo mixed-code: hindi en devanagari y palabras inglesas en alfabeto latino (por ejemplo, `Postgres में timescale डाल देंगे`).
- Detección de idioma configurable (aunque en esta conversión se recomienda fijar `language = "hi"` y desactivar la detección).
- Transcripción sin timestamps (`withoutTimestamps`) para fragmentos cortos.
- Ejecución totalmente local en Apple Silicon mediante WhisperKit, con reparto de cómputo entre GPU (encoder) y Neural Engine (decodificador).
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá del propio ASR.

## Casos de uso

- Transcripción de reuniones hinglish: el modelo mantiene los términos técnicos en inglés y el resto en devanagari, lo que facilita la revisión posterior por hablantes bilingües; requiere alimentar fragmentos de hasta ~18 s para no agotar la ventana de 224 tokens.
- Actas y notas de equipo en entornos tech de India: al preservar nombres de productos y siglas en alfabeto latino, los textos generados son directamente buscables y citables sin postprocesado manual.
- Subtitulado offline de contenido interno: al ejecutarse íntegramente en el dispositivo, permite procesar audio confidencial sin enviarlo a servicios externos.
- Investigación en code-switching: sirve como referencia de transcripción fiel para comparar con otras conversiones o modelos en experimentos de ASR bilingüe.
- Archivado y búsqueda de grabaciones: la salida mixta devanagari-latino mejora la indexación de términos ingleses en corpus de audio históricos.
- Evaluación de pipelines WhisperKit: útil como caso de prueba para validar el envoltorio `TextDecoding` que inserta `<|mixedcode|>` en `prefillDecoderInputs(_:withOptions:)`.
- Prototipado en apps macOS/iOS: integrable en aplicaciones Swift mediante WhisperKit para dictado o transcripción local, aceptando la latencia a cambio de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta métricas de latencia en hardware concreto: en un M1 Pro, el decodificador tarda 567 s en el Neural Engine frente a 978 s en la GPU para 6 minutos de audio, es decir, aproximadamente 1,6 veces la duración del audio. También advierte de que el compilador del Neural Engine puede tardar una hora o más en preparar el encoder large-v3 en un M1.

## Requisitos de hardware

- Hardware objetivo: Apple Silicon (M1, M1 Pro, M2, M3 y posteriores); no está pensado para GPU NVIDIA ni CPU x86.
- VRAM: no aplica; el modelo usa memoria unificada. El repositorio ocupa 3,1 GB en disco (encoder 1,2 GB, decodificador 1,7 GB).
- Reparto de cómputo recomendado: encoder en GPU (`cpuAndGPU`), decodificador en Neural Engine (`cpuAndNeuralEngine`), front-end mel en `cpuAndGPU`.
- Cabe en equipos consumer con Apple Silicon; no se documentan requisitos mínimos de memoria unificada.
- Despliegue: WhisperKit (Swift), con `modelFolder` y `tokenizerFolder` apuntando a la carpeta del repositorio y `download: false`.
- Latencia: decodificador a ~1,6x la duración del audio en M1 Pro; la compilación inicial del encoder puede superar una hora.
- Throughput: no disponible más allá de las cifras de latencia citadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| jatsharma/whisper-hinglish-tara-coreml | no disponible (Whisper large-v3) | 224 tokens / ~18 s | hi, en (hinglish) | Apache-2.0 | Core ML | Conversión fiel; lenta (~1,6x audio en M1 Pro) |
| jatsharma/whisper-hinglish-apex-coreml | no disponible | no disponible | hi, en (hinglish) | no disponible | Core ML | Conversión alternativa recomendada por el autor por ser más rápida |
| Trelis/tara | no disponible (Whisper large-v3) | 224 tokens | hi, en (hinglish) | Apache-2.0 | safetensors (formato original) | Modelo base; requiere PyTorch, no ejecuta en Neural Engine |
| OpenAI Whisper large-v3 | no disponible | 224 tokens / 30 s | multilingüe | MIT (según el proyecto original) | varios | Sin especialización hinglish; no emite modo mixed-code |

## Limitaciones y advertencias

- Latencia elevada: el decodificador tarda ~1,6x la duración del audio en M1 Pro; no apto para transcripción en tiempo real en ese hardware.
- La compilación del encoder en el Neural Engine puede tardar una hora o más en un M1, lo que afecta al primer arranque.
- Requiere un envoltorio `TextDecoding` personalizado para insertar `<|mixedcode|>`; sin él, la salida es solo devanagari y se pierden los términos ingleses en alfabeto latino.
- Es necesario usar el tokenizador incluido en el repositorio (`tokenizerFolder`); el tokenizador nativo de WhisperKit no conoce el token añadido ni el vocabulario de 51.904 entradas.
- Los umbrales de log-probabilidad por defecto provocan re-decodificaciones frecuentes en devanagari; el autor recomienda desactivarlos y mantener solo el fallback por repetición.
- Fragmentos de audio limitados a ~18 s por la ventana de 224 tokens y el consumo de ~8 tokens por segundo del devanagari.
- Riesgo de alucinación y errores propios de Whisper en audio con ruido, solapamiento de hablantes o acentos no representados en el fine-tune.
- Sesgos lingüísticos no evaluados: el modelo solo cubre hindi e inglés; no se documenta comportamiento en otras lenguas.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías y remite la autoría a Trelis y OpenAI.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jatsharma/whisper-hinglish-tara-coreml
- Modelo base: https://huggingface.co/Trelis/tara
- Conversión alternativa más rápida: https://huggingface.co/jatsharma/whisper-hinglish-apex-coreml
- WhisperKit (Argmax): https://github.com/argmaxinc/WhisperKit
- Herramientas de conversión: https://github.com/argmaxinc/whisperkittools
- Port de Whisper a CoreML: https://github.com/vade/OpenAI-Whisper-CoreML
- Whisper en Wikipedia: https://en.wikipedia.org/wiki/Whisper_(speech_recognition_system)
