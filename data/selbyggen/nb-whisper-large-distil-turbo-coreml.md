# Selbyggen/nb-whisper-large-distil-turbo-coreml

## Resumen

NB-Whisper Large Distil Turbo Core ML es una conversión de formato del modelo de reconocimiento automático del habla NbAiLab/nb-whisper-large-distil-turbo-beta, desarrollado por la Biblioteca Nacional de Noruega (NbAiLab). El trabajo de conversión lo firma Selbyggen, que ha empaquetado los pesos originales en Core ML para su uso con WhisperKit en dispositivos Apple, comprimiendo el modelo hasta unos 640 MB para que quepa en un iPhone. No se trata de un modelo nuevo: los pesos y el comportamiento son los de NbAiLab, y la licencia Apache 2.0 se mantiene igual que en el original.

El modelo resuelve el problema de la transcripción local de noruego en hardware de consumo Apple (Mac, iPhone, iPad) sin enviar audio a la nube. Frente a la conversión completa en float16 (1,4 GB) o a la versión large de NB-Whisper (2,9 GB), esta variante reduce el tamaño a 640 MB aplicando palettización de 4 bits al codificador de audio, manteniendo el decodificador de texto en float16. La arquitectura subyacente es la de Whisper large, pero con un decodificador destilado de solo 2 capas, lo que reduce la latencia de forma notable.

Es relevante ahora porque permite ejecutar un ASR específico para noruego en el propio dispositivo con una latencia muy baja (18 s para una grabación de 9 minutos en un M3 Max) y un tamaño manejable para apps móviles. Existe una segunda variante (`_640MB_v2`) que añade marcas de tiempo a nivel de palabra mediante cabezas de alineación seleccionadas y validadas empíricamente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer) con decodificador destilado de 2 capas; convertido a Core ML |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio típica de Whisper de 30 s por segmento) |
| Tipos de cuantizacion | AudioEncoder en palettización de 4 bits con descomposición de outliers (outliers > 3 desviaciones típicas en float16); TextDecoder y MelSpectrogram en float16 |
| Idiomas soportados | noruego (no), noruego bokmål (nb), noruego nynorsk (nn) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (`.mlpackage` / `.mlmodelc`), distribuido en carpetas de variante para WhisperKit |

## Arquitectura y entrenamiento

La arquitectura base es Whisper, un transformer encoder-decoder diseñado para ASR. En esta variante, el decodificador de texto se ha destilado hasta 2 capas, lo que explica tanto la reducción de tamaño como la disminución de latencia respecto al large original. El modelo parte de NbAiLab/nb-whisper-large-distil-turbo-beta, un ajuste fino de Whisper large especializado en noruego, y conserva el tokenizador de `openai/whisper-large-v3`.

La conversión se realizó con `whisperkittools` (`whisperkit-generate-model`) y coremltools 8.3.0. El codificador de audio se comprimió con palettización de 4 bits y descomposición de outliers, el mismo método que Argmax emplea en `openai_whisper-large-v3-v20240930_626MB`. La variante `_640MB_v2` reconvierte únicamente el TextDecoder (torch 2.5.0, transformers 4.53, coremltools 9.0, float16) para emitir `alignment_heads_weights`, con las cabezas de alineación `[[1, 14], [0, 11], [1, 18]]` seleccionadas comparando las marcas de tiempo de WhisperKit con las de NB-Whisper large sobre ventanas de 30 s de dos grabaciones noruegas. No se dispone de información sobre el volumen de datos de entrenamiento ni sobre el proceso de destilación o RLHF en la información proporcionada.

## Capacidades

- Reconocimiento automático del habla en noruego (bokmål y nynorsk) con salida de texto.
- Marcas de tiempo a nivel de segmento en la variante `_640MB`; marcas de tiempo a nivel de palabra en la variante `_640MB_v2`.
- Ejecución local en dispositivo (on-device) mediante Core ML y WhisperKit, sin envío de audio a servidores.
- Optimización para Apple Silicon y Neural Engine (compilación inicial de Core ML de varios minutos; cargas posteriores rápidas).
- Compatibilidad con el tokenizador de `openai/whisper-large-v3`.
- No se documentan capacidades de traducción, diarización de hablantes, tool calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Transcripción de reuniones en local: una grabación de 9 minutos se transcribe en 18 s en un M3 Max, con lo que se pueden procesar reuniones completas en el propio portátil sin subir audio a la nube.
- Apps de notas de voz en iPhone e iPad: el tamaño de 640 MB permite incluir el modelo en una aplicación móvil y transcribir dictados o grabaciones sin conexión, como hace la app Sagt.
- Subtitulado de vídeo en noruego: la variante `_640MB_v2` genera marcas de tiempo por palabra (error mediano de 0,04 s y ~90 % de palabras dentro de 0,5 s en la grabación de validación), útiles para generar subtítulos sincronizados.
- Actas y documentación de entrevistas: la transcripción local cumple con requisitos de privacidad en sectores como salud o administración pública, donde el audio no puede salir del dispositivo.
- Herramientas de accesibilidad: dictado por voz en noruego integrado en aplicaciones macOS/iOS para usuarios con dificultades de escritura, con latencia baja y sin dependencia de red.
- Procesamiento por lotes en Mac: transcripción de archivos de audio en pipelines locales (por ejemplo, archivado de material audiovisual en noruego) aprovechando la aceleración del Neural Engine.

## Benchmarks y rendimiento

Datos de la model card sobre una grabación de reunión noruega de 9 minutos, transcrita con WhisperKit 1.1.1 en un Mac con M3 Max. El WER se mide contra la salida de NB-Whisper large, por lo que refleja concordancia con ese modelo, no exactitud frente a una referencia humana.

| Modelo | Tamano | Tiempo | WER vs NB-Whisper large |
|---|---|---|---|
| NB-Whisper large (float16) | 2,9 GB | 139 s | 0 (referencia) |
| NB-Whisper Large Distil Turbo (float16) | 1,4 GB | 24 s | 0,330 |
| Este modelo | 640 MB | 18 s | 0,339 |
| OpenAI large-v3 turbo, `v20240930_626MB` | 598 MB | 36 s | 0,573 |

La variante con marcas de tiempo por palabra es aproximadamente un 10-15 % más lenta debido a la alineación. En una grabación de 18 minutos el texto es idéntico al de la carpeta original.

## Requisitos de hardware

- Tamaño en disco: unos 640 MB (frente a 1,4 GB de la conversión completa en float16 y 2,9 GB de NB-Whisper large en float16).
- Diseñado para Apple Silicon (M1/M2/M3/M4 y posteriores) y chips A-series de iPhone/iPad compatibles con Core ML y el Neural Engine.
- La primera carga tarda varios minutos mientras Core ML compila el modelo para el Neural Engine; las cargas posteriores son rápidas.
- Despliegue mediante WhisperKit (Swift) y el ecosistema `whisperkittools`; no se documentan opciones para vLLM, llama.cpp, Ollama ni TGI, al ser un formato Core ML específico de Apple.
- Rendimiento medido: 18 s para 9 minutos de audio en un M3 Max; no se dispone de cifras de throughput para otros dispositivos.

## Comparativa con modelos similares

| Modelo | Tamano | Tiempo (9 min, M3 Max) | WER vs NB-Whisper large | Licencia | Plataforma |
|---|---|---|---|---|---|
| Este modelo (640 MB) | 640 MB | 18 s | 0,339 | Apache 2.0 | Core ML / Apple |
| NB-Whisper Large Distil Turbo (float16) | 1,4 GB | 24 s | 0,330 | Apache 2.0 (original) | WhisperKit / Core ML |
| NB-Whisper large (float16) | 2,9 GB | 139 s | 0 (referencia) | Apache 2.0 | WhisperKit / Core ML |
| OpenAI large-v3 turbo (`v20240930_626MB`) | 598 MB | 36 s | 0,573 | MIT (modelo original) | Core ML / Apple |

## Limitaciones y advertencias

- Es una conversión de formato con compresión de pesos, no un modelo nuevo; cualquier limitación del modelo original de NbAiLab se hereda.
- NbAiLab marca el modelo original como beta, liberado para pruebas; no debe asumirse estabilidad de producción sin validación propia.
- La variante `_640MB` no soporta marcas de tiempo a nivel de palabra porque `config.json` y `generation_config.json` listan las `alignment_heads` de large-v3, que no existen en el decodificador de 2 capas; para timestamps por palabra hay que usar `_640MB_v2`.
- El WER reportado mide concordancia con NB-Whisper large, no exactitud frente a transcripciones humanas; no debe interpretarse como una medida absoluta de calidad.
- Cobertura lingüística limitada al noruego (no, nb, nn); no se documenta soporte para otros idiomas.
- Dependencia del ecosistema Apple: el formato Core ML limita su uso a dispositivos Apple y a WhisperKit; no es portable a GPUs NVIDIA ni a servidores Linux convencionales.
- Riesgo de alucinación y errores propios de los modelos Whisper en audio con ruido, acentos marcados o solapamiento de hablantes; no se documentan mitigaciones específicas.
- No se dispone de información sobre sesgos demográficos o dialectales más allá de la cobertura bokmål/nynorsk.

## Enlaces

- Hugging Face: https://huggingface.co/Selbyggen/nb-whisper-large-distil-turbo-coreml
- Modelo base: https://huggingface.co/NbAiLab/nb-whisper-large-distil-turbo-beta
- Conversión large completa de referencia: https://huggingface.co/Selbyggen/nb-whisper-large-coreml
- WhisperKit: https://github.com/argmaxinc/WhisperKit
- whisperkittools: https://github.com/argmaxinc/whisperkittools
- App Sagt: https://sagtapp.com/
