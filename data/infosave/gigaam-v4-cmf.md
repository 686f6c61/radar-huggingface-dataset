# infosave/GigaAM-v4-cmf

## Resumen

GigaAM-v4-cmf es un modelo de reconocimiento automático del habla (ASR) para ruso e inglés, empaquetado en formato CMF para el motor de inferencia `cortiq`. El modelo original (ai-sage/GigaAM-v4) es un encoder Zapformer de 238 millones de parámetros con dos cabezas de reconocimiento (RNN-T y CTC) que producen transcripciones formateadas con mayúsculas, puntuación y dígitos, o palabras en minúsculas sin formato. Esta versión concreta, publicada por el usuario infosave, cuantiza los pesos a 8 bits y los empaqueta en ficheros únicos que se ejecutan sin Python ni frameworks de aprendizaje automático.

La relevancia de este empaquetado reside en su portabilidad y velocidad: funciona sobre CUDA y Vulkan en GPUs NVIDIA, Vulkan/DX12 en AMD e Intel, Metal en Apple Silicon y CPU. Incluye la red de actividad de voz del propio modelo, que segmenta grabaciones de cualquier duración en fragmentos de hasta 30 segundos, por lo que no se necesita preprocesado externo. Según las mediciones del autor, en una NVIDIA L4 procesa 30 minutos de audio en 2,73 segundos (660 veces tiempo real) con un pico de 1,6 GB de VRAM.

La precisión del fichero de 8 bits es prácticamente idéntica a la implementación de referencia en PyTorch: 4,93 % de WER frente a 4,96 % en Golos Farfield, 14,15 % frente a 14,19 % en Golos Crowd y 4,29 % frente a 4,27 % en Russian LibriSpeech. Con los pesos de media precisión publicados, 13 261 de 13 262 transcripciones coinciden carácter a carácter con la referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zapformer (encoder) con cabezas RNN-T y CTC |
| Parametros totales | 238 M (encoder) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | segmentos de audio de hasta 30 s (segmentacion mediante red de actividad de voz) |
| Tipos de cuantizacion | 8 bits (`q8_2f`) en los ficheros publicados; no se publica version de 4 bits |
| Idiomas soportados | ruso, inglés |
| Licencia | MIT |
| Formato de pesos | CMF (fichero unico para el motor `cortiq`); pesos originales en safetensors en el modelo base |
| Tamano del repo | 0,5 GB |
| Tamano de los ficheros | 260 MB (RNN-T q8_2f), 246 MB (CTC q8_2f) |
| Libreria / motor | cortiq (Rust), version 0.9.21 o superior |
| Backends | CUDA, Vulkan, DX12, Metal, CPU |
| Modelo base | ai-sage/GigaAM-v4 |

## Arquitectura y entrenamiento

El modelo base es un encoder Zapformer de 238 millones de parámetros sobre el que se montan dos cabezas de reconocimiento independientes: una RNN-T (transductor recurrente neuronal) y una CTC (connectionist temporal classification). Ambas comparten el mismo encoder y el mismo front end convolucional de características mel. Los ficheros CMF incluyen además el banco de filtros del front end mel y la red de actividad de voz, de modo que cada fichero es autosuficiente para transcribir audio de cualquier duración.

La cuantizacion aplicada es de 8 bits con formato `q8_2f`. El autor indica explicitamente que no publica una version de 4 bits porque el redondeo a 4 bits sin reentrenamiento degrada la precision (RNN-T en Russian LibriSpeech: 4,90 % frente a 4,27 %). No se dispone en la informacion proporcionada de detalles sobre el volumen de datos de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en el modelo original. Tampoco se incluyen en este empaquetado la revision `ssl` (encoder sin cabeza de reconocimiento) ni los modos de streaming con 160, 320 o 640 ms de look-ahead: estos ficheros ejecutan el modo de contexto completo.

## Capacidades

- Reconocimiento automatico del habla en ruso e inglés con dos modos de salida: transcripcion formateada (mayusculas, puntuacion y digitos) y palabras en minusculas sin formato.
- Dos estrategias de decodificacion: RNN-T (mas precisa, por defecto en el modelo original) y CTC (decodificacion en una sola pasada, mas rapida).
- Segmentacion automatica de audio de cualquier duracion mediante la red de actividad de voz integrada, en fragmentos de hasta 30 segundos.
- Acepta cualquier frecuencia de muestreo y numero de canales: el audio se mezcla a mono a 16 kHz.
- Lectura directa de WAV; otros formatos (mp3, flac, ogg, m4a) mediante `ffmpeg` si esta en el PATH.
- Ejecucion sin Python ni frameworks de aprendizaje automatico, a traves del motor Rust `cortiq`.
- Aceleracion por hardware en CUDA, Vulkan, DX12, Metal y CPU.
- No incluye cabecera de traduccion, diarizacion de hablantes ni identificacion de idioma explicita.

## Casos de uso

- Transcripcion de reuniones y actas: el modelo procesa grabaciones de cualquier duracion gracias a la segmentacion por actividad de voz; 30 minutos de audio se transcriben en 2,73 segundos en una L4, lo que permite generar actas casi en tiempo real tras la reunion.
- Subtitulado y transcripcion de archivo audiovisual: la salida formateada con mayusculas, puntuacion y digitos reduce el postprocesado necesario para subtitulos; el modo CTC, mas rapido (963 veces tiempo real en 30 minutos), es adecuado para lotes grandes.
- Atencion al cliente en ruso: la transcripcion de llamadas grabadas permite analisis de calidad y busqueda sobre el contenido; el bajo consumo de VRAM (1,6 GB) permite ejecutar el modelo junto a otros servicios en la misma GPU.
- Procesamiento en estaciones de trabajo sin GPU dedicada: en un MacBook Air M4 un clip de 30 segundos se transcribe en 154 ms por Metal y en 269 ms por CPU, lo que habilita el uso en portatiles sin tarjeta grafica.
- Despliegue en GPUs de consumo y equipos AMD o Intel: el backend Vulkan/DX12 permite ejecutar el modelo en hardware no NVIDIA, ampliando el parque de maquinas compatibles.
- Pipelines de transcripcion por lotes en servidores: la velocidad de 588 a 660 veces tiempo real en grabaciones de 2 horas permite procesar grandes volumenes de audio con una sola GPU y un pico de memoria de 1,6 GB.
- Investigacion en ASR para ruso: al ser un empaquetado fiel del modelo original con licencia MIT, sirve como referencia reproducible para comparar implementaciones y cuantizaciones.

## Benchmarks y rendimiento

Tasa de error de palabra (WER) de la transcripcion formateada, comparada con la implementacion de referencia en PyTorch (float32):

| Modelo / fichero | Golos Farfield | Golos Crowd | Russian LibriSpeech |
|---|---:|---:|---:|
| RNN-T `q8_2f` (este empaquetado) | 4,93 | 14,15 | 4,29 |
| Referencia PyTorch, RNN-T float32 | 4,96 | 14,19 | 4,27 |
| CTC `q8_2f` (este empaquetado) | 5,29 | 14,80 | 4,65 |
| Referencia PyTorch, CTC float32 | 5,27 | 14,81 | 4,72 |

Rendimiento medido con `cortiq transcribe --stats` (segunda pasada en el mismo proceso):

| Backend / equipo | Grabacion | RNN-T `q8_2f` | CTC `q8_2f` | Memoria pico |
|---|---:|---:|---:|---:|
| CUDA, NVIDIA L4 | 30 s | 0,095 s (316x) | 0,025 s (1200x) | 1,4 GB |
| CUDA, NVIDIA L4 | 30 min | 2,73 s (660x) | 1,87 s (963x) | 1,6 GB |
| CUDA, NVIDIA L4 | 2 h | 12,3 s (588x) | 8,72 s (825x) | 1,6 GB |
| Vulkan, NVIDIA L4 | 30 min | 4,64 s (388x) | 3,80 s (474x) | 1,4 GB |
| Metal, MacBook Air M4 | 30 s | 154 ms | no disponible | no disponible |
| CPU, MacBook Air M4 | 30 s | 269 ms | no disponible | no disponible |
| PyTorch float32, L4 | 30 min | 7,71 s | no disponible | no disponible |
| PyTorch half encoder, L4 | 30 min | 4,78 s | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 1,2 a 1,6 GB de pico en GPU NVIDIA L4, segun la duracion del audio y el backend (CUDA o Vulkan).
- GPU recomendadas: NVIDIA L4 (medido), cualquier GPU NVIDIA compatible con CUDA o Vulkan; GPUs AMD e Intel mediante Vulkan/DX12; Apple Silicon mediante Metal.
- Cabe en GPU de consumo: si, con amplio margen, dado el pico de 1,6 GB; cualquier GPU de consumo moderna con al menos 2 GB de VRAM disponible es suficiente.
- Despliegue: motor `cortiq` (binarios precompilados para Linux, macOS y Windows en la pagina de releases; instalacion via `cargo install cortiq-cli`). Para CUDA, compilar con `--features cuda` y definir `CMF_GPU=cuda`.
- Latencia y throughput: 95 ms para un clip de 30 s en L4 por CUDA (RNN-T); 316 veces tiempo real en clips de 30 s y 660 veces en grabaciones de 30 minutos; el modo CTC alcanza 1200 veces tiempo real en clips de 30 s.
- CPU: 269 ms para un clip de 30 s en un MacBook Air M4; 30 minutos en 16,7 s por CPU en el mismo equipo.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto / segmentacion | WER (Russian LibriSpeech) | Licencia | Formato |
|---|---|---|---|---|---|---|
| GigaAM-v4-cmf (este) | 238 M (encoder) | ruso, inglés | segmentos de hasta 30 s con VAD integrada | 4,29 (RNN-T q8) | MIT | CMF |
| GigaAM-v4 (original, PyTorch) | 238 M (encoder) | ruso, inglés | segmentos de hasta 30 s; modos streaming | 4,27 (RNN-T fp32) | MIT | safetensors |
| Whisper (variantes de tamano similar) | no disponible en la informacion proporcionada | multilingue | 30 s por ventana | no disponible | MIT | safetensors, GGUF, etc. |

La comparacion con Whisper no puede completarse con datos de la informacion proporcionada; no se dispone de resultados de benchmarks de terceros en esta ficha.

## Limitaciones y advertencias

- Solo soporta ruso e inglés; no se ha validado su comportamiento en otros idiomas.
- El modelo base no incluye cabecera de identificacion de idioma: la eleccion de idioma debe gestionarse externamente.
- No se publica version de 4 bits; el autor advierte que la cuantizacion a 4 bits sin reentrenamiento degrada la precision (4,90 % frente a 4,27 % de WER en Russian LibriSpeech con RNN-T).
- No incluye los modos de streaming del modelo original (160, 320 o 640 ms de look-ahead); estos ficheros operan en modo de contexto completo.
- No incluye la revision `ssl` (encoder sin cabeza de reconocimiento).
- Riesgo de alucinacion y errores en audio con ruido, acentos marcados o solapamiento de hablantes; no se han publicado analisis especificos de sesgos en la informacion disponible.
- La licencia MIT permite uso comercial, pero el empaquetado depende del motor `cortiq` (version 0.9.21 o superior) y de la cadena de herramientas Rust; conviene verificar la compatibilidad de versiones en produccion.
- La lectura de formatos distintos de WAV requiere `ffmpeg` instalado en el PATH.
- No se dispone de informacion sobre el dataset de entrenamiento ni sobre posibles sesgos demograficos o dialectales del modelo original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/infosave/GigaAM-v4-cmf
- Modelo base: https://huggingface.co/ai-sage/GigaAM-v4
- Repositorio del motor CMF / cortiq: https://github.com/infosave2007/cmf
- Binarios precompilados: https://github.com/infosave2007/cmf/releases
- Imagenes de rendimiento: https://huggingface.co/infosave/GigaAM-v4-cmf/resolve/main/assets/speed_cuda_en.png y https://huggingface.co/infosave/GigaAM-v4-cmf/resolve/main/assets/speed_vulkan_en.png
