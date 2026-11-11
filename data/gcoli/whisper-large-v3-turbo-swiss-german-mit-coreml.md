# gcoli/whisper-large-v3-turbo-swiss-german-mit-coreml

## Resumen

`gcoli/whisper-large-v3-turbo-swiss-german-mit-coreml` es una conversión a Core ML del modelo `gcoli/whisper-large-v3-turbo-swiss-german-mit`, un fine-tune de OpenAI Whisper large-v3-turbo especializado en reconocimiento de habla suiza alemana (Swiss German) con salida en alemán estándar. Lo publica el usuario gcoli y está empaquetado para WhisperKit, la librería de Argmax para ejecutar Whisper de forma nativa en Apple Silicon (Neural Engine y GPU). El objetivo es permitir transcripción en dispositivo, sin conexión, en macOS/iOS con hardware Apple.

El modelo resuelve un nicho concreto: la transcripción de dialectos suizo-alemanes, que los modelos Whisper estándar manejan con dificultad, traduciendo directamente a alemán estándar en lugar de reproducir el dialecto. La conversión Core ML mantiene la licencia MIT del modelo fuente y reduce el tiempo de inferencia respecto a la variante "large" del mismo autor (unas 3 veces más rápido), a costa de unos 2 puntos de WER adicionales.

Es relevante para desarrolladores que quieran integrar ASR suizo-alemán en aplicaciones Apple con privacidad por diseño (todo el cómputo es local) y sin depender de APIs en la nube. El repo ocupa 1,6 GB e incluye el tokenizer en el bundle para funcionar offline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo), convertido a Core ML para WhisperKit |
| Parametros totales | no disponible (hereda los de Whisper large-v3-turbo; el dato no se explicita en la información proporcionada) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento, característica de Whisper; no se explicita en la información proporcionada) |
| Tipos de cuantizacion | no disponible (artefactos Core ML; el autor no detalla precisiones) |
| Idiomas soportados | gsw (suizo alemán), de, en, fr, it |
| Licencia | MIT |
| Formato de pesos | Core ML (bundle WhisperKit), con tokenizer incluido |
| Tamano del repo | 1,6 GB |
| Modelo base | gcoli/whisper-large-v3-turbo-swiss-german-mit |
| Libreria | whisperkit |
| Pipeline | automatic-speech-recognition |

## Arquitectura y entrenamiento

Se trata de una conversión, no de un entrenamiento nuevo. El modelo subyacente es un fine-tune de `openai/whisper-large-v3-turbo`, la variante "turbo" de Whisper large-v3, cuyo decoder tiene 4 capas (frente a las 32 de large-v3), lo que reduce el coste de decodificación. El fine-tune se realizó sobre datos suizo-alemanes del conjunto FHNW/i4ds (licencia MIT), con el objetivo de transcribir habla dialectal a alemán estándar. Los detalles de composición del dataset, número de tokens y si hubo RLHF/DPO no se especifican en la información disponible.

La conversión a Core ML se hizo con `argmaxinc/whisperkittools` (coremltools 9.0) a partir del checkpoint `540fb2e7a9135048963c5de9822579c96f8962e5`. El encoder de audio (50,9 dB PSNR) y el mel spectrogram (67,3 dB) se generaron con `whisperkit-generate-model`. El decoder de texto se convirtió por separado porque no superaba de forma fiable el umbral de 35 dB PSNR del conversor en el Neural Engine (29-45 dB entre ejecuciones; 74,6 dB en GPU y 58,5 dB en CPU); se rebajó el umbral y se publicó con la medición de WER incluida. Los detalles están en `conversion_options.json`. El decoder puede ejecutarse en Neural Engine (por defecto, más rápido) o en GPU (`cpuAndGPU`, numéricamente más cercano a PyTorch).

## Capacidades

- Reconocimiento automático de habla (ASR) para suizo alemán con salida en alemán estándar.
- Transcripción en alemán estándar, inglés, francés e italiano (estos dos últimos presumiblemente funcionan, aunque no se verificaron en este bundle).
- Funcionamiento en dispositivo y offline en Apple Silicon (Neural Engine o GPU), con tokenizer incluido en el bundle.
- Compatibilidad con `whisperkit-cli` y la librería WhisperKit.
- No se documentan tool calling, function calling, agentes ni modos de razonamiento: es un modelo puramente ASR.
- No se documentan capacidades de visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción de reuniones y entrevistas en suizo alemán: el modelo convierte audio dialectal a alemán estándar, útil para actas y subtítulos en empresas suizas donde el habla coloquial es dialectal.
- Subtitulado local de vídeo y pódcast: al ejecutarse en Neural Engine con un rendimiento de 232 s para 40 min de audio en un M1 Max, permite generar subtítulos sin subir contenido a la nube.
- Aplicaciones macOS/iOS con privacidad por diseño: al ser Core ML y funcionar offline, encaja en apps de dictado o notas de voz donde los datos no deben salir del dispositivo.
- Investigación lingüística y dialectología: la medición sobre 17 dialectos del conjunto FHNW/i4ds permite estudiar el rendimiento por variante dialectal y comparar con modelos no ajustados.
- Accesibilidad: transcripción en tiempo casi real de conversaciones para personas con dificultades auditivas en entornos germanoparlantes de Suiza.
- Integración en pipelines de transcripción por lotes en Mac: el uso de `whisperkit-cli transcribe --language de` facilita el procesamiento masivo de archivos de audio con el tokenizer local.

## Benchmarks y rendimiento

Evaluación sobre 282 clips del FHNW/i4ds All Swiss German Dialects Test Set (MIT), estratificados sobre 17 dialectos (habla leída, no espontánea), con `whisperkit-cli` 1.1.1 en un M1 Max, decodificación greedy:

| Modelo (Core ML) | WER | CER | Tiempo para 40 min de audio |
|---|---|---|---|
| Este bundle, decoder en Neural Engine | 24,7 % | 12,3 % | 232 s |
| Este bundle, decoder en GPU | 24,8 % | 12,2 % | no disponible |
| Variante large (gcoli/whisper-large-v3-swiss-german-mit-coreml) | 22,8 % | 11,9 % | 754 s |
| `openai_whisper-large-v3` (sin fine-tune) | 23,6 % | 12,0 % | no disponible |

El checkpoint fuente alcanza 23,7 % (dev) / 25,9 % (final) con CTranslate2 y beam 5. El autor señala que en su muestra este bundle no supera a large-v3 sin ajustar, y que debe usarse donde la velocidad prime sobre la precisión.

## Requisitos de hardware

- Hardware objetivo: Apple Silicon (M1 Max medido). El encoder de audio se especializa para el Neural Engine en el primer uso por dispositivo: 15-19 minutos en M1 Max; cargas posteriores ~1 s.
- VRAM/RAM estimada: no disponible explícitamente; el repo ocupa 1,6 GB y el modelo base es large-v3-turbo, por lo que se espera un consumo de memoria moderado para Apple Silicon, pero el dato no se publica.
- GPU recomendadas: no aplica GPU NVIDIA; el modelo se ejecuta en Neural Engine o GPU integrada de Apple Silicon.
- Cabe en hardware de consumo: sí, en equipos Apple Silicon (Mac con M1 o superior); no está pensado para GPU de consumo x86.
- Opciones de despliegue: `whisperkit-cli` (versión probada 1.1.1) y librería WhisperKit. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 232 s para 40 min de audio con decoder en Neural Engine en M1 Max (greedy); el decoder en GPU da WER equivalente pero es más lento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (i4ds) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este bundle (turbo, Core ML) | no disponible (turbo) | no disponible | 24,7 % | MIT | Hugging Face (Core ML) |
| gcoli/whisper-large-v3-swiss-german-mit-coreml (large) | no disponible (large) | no disponible | 22,8 % | MIT | Hugging Face (Core ML) |
| openai/whisper-large-v3 (sin fine-tune) | no disponible | no disponible | 23,6 % | MIT | Hugging Face |
| gcoli/whisper-large-v3-turbo-swiss-german-mit (fuente PyTorch) | no disponible | no disponible | 23,7 % (dev) / 25,9 % (final, CTranslate2 beam 5) | MIT | Hugging Face |

## Limitaciones y advertencias

- Whisper puede alucinar u omitir texto, especialmente con ruido, silencio, dialectos raros, hablantes solapados o vocabulario de dominio; no debe usarse como única base para decisiones de alto impacto.
- El WER de 24,7 % se midió sobre habla leída con prompt cercano al alemán estándar; el habla espontánea suizo-alemana probablemente rinda peor y no se verificó.
- El alemán estándar con acento suizo no se midió; francés e italiano no se comprobaron en este bundle.
- En la muestra del autor no supera a large-v3 sin ajustar; elegirlo solo cuando la velocidad sea prioritaria.
- El decoder no supera de forma fiable el umbral PSNR del conversor en Neural Engine; se publicó con el umbral rebajado, lo que introduce una advertencia de fidelidad numérica.
- El primer uso por dispositivo requiere una especialización larga (15-19 min en M1 Max), lo que afecta al arranque en frío.
- Licencia MIT permite uso comercial, pero se debe obtener consentimiento antes de transcribir a personas.
- No hay métricas de sesgo publicadas en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/gcoli/whisper-large-v3-turbo-swiss-german-mit-coreml
- Modelo base: https://huggingface.co/gcoli/whisper-large-v3-turbo-swiss-german-mit
- Variante large Core ML: https://huggingface.co/gcoli/whisper-large-v3-swiss-german-mit-coreml
- Modelo upstream: https://huggingface.co/openai/whisper-large-v3-turbo
- Conversor: https://github.com/argmaxinc/whisperkittools
- WhisperKit: https://github.com/argmaxinc/WhisperKit
- Dataset FHNW/i4ds All Swiss German Dialects Test Set: no disponible como enlace directo en la información proporcionada.
