# FermionResearch/Phonon-1-Micro

## Resumen

Phonon-1 Micro es un modelo de reconocimiento automático de voz (ASR) para inglés, desarrollado por Fermion Research. Es la variante más pequeña de la familia Phonon-1 y está diseñado para ejecutarse en dispositivos con recursos limitados, como portátiles o GPUs de datacenter, manteniendo una precisión competitiva. El modelo se basa en Qwen/Qwen3-ASR-0.6B y ha sido cuantizado a 2,4 bits por peso desde el inicio del entrenamiento mediante técnicas de quantization-aware training (QAT), lo que permite un peso final de solo 285 MB.

Su relevancia radica en ofrecer una alternativa ligera y de código abierto (licencia Apache 2.0) para tareas de transcripción de voz en tiempo real o por lotes, superando en precisión a modelos de tamaño similar como Moonshine base en los ocho benchmarks publicados. El modelo está disponible en formato MLX para Apple Silicon, pero también puede ejecutarse en GPUs NVIDIA y CPUs, lo que amplía su versatilidad de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3-ASR-0.6B (encoder-decoder) |
| Parametros totales | No disponible (modelo base: 0,6B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de audio, sin ventana de texto especificada) |
| Tipos de cuantizacion | Ternario, 2,4 bits por peso (QAT) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

Phonon-1 Micro es un modelo de ASR basado en la arquitectura de Qwen3-ASR-0.6B, que emplea un encoder-decoder transformer. La innovacion principal es su entrenamiento con cuantizacion ternaria desde el inicio (2,4 bits por peso) mediante quantization-aware training, lo que reduce drasticamente el tamaño del modelo sin sacrificar demasiada precision. No se han publicado detalles sobre el dataset de entrenamiento ni el numero de tokens, pero el modelo ha sido evaluado en ocho benchmarks estandar de ASR en ingles.

El modelo se distribuye en formato MLX, optimizado para Apple Silicon, aunque los mismos pesos pueden ejecutarse en GPUs NVIDIA y CPUs mediante los runtimes proporcionados por Fermion Research. No se menciona el uso de RLHF o DPO, ya que se trata de una tarea de transcripcion, no de generacion de texto libre.

## Capacidades

- Transcripcion de voz a texto en ingles a partir de audio mono de 16 kHz.
- Soporte de streaming para transcripcion en tiempo real.
- Ejecucion on-device con bajo consumo de recursos (285 MB de descarga).
- Compatible con MLX (Apple Silicon), CUDA (NVIDIA) y CPU.
- Interfaz de servidor compatible con la API de OpenAI para transcripciones.
- Integracion con la CLI `fermion` para transcripcion directa o servicio HTTP.

## Casos de uso

- Transcripcion de reuniones y entrevistas: el modelo puede procesar grabaciones de audio de larga duracion en un portatil, generando texto con una tasa de error baja (WER 3,0 en LibriSpeech test-clean) sin necesidad de GPU dedicada.
- Subtitulado automatico de videos: su tamaño reducido permite integrarlo en pipelines de edicion de video en tiempo real, generando subtitulos en ingles con latencia minima.
- Asistentes de voz en dispositivos embebidos: al pesar solo 285 MB, puede ejecutarse en dispositivos con poca memoria, como Raspberry Pi o smartphones, para comandos de voz locales.
- Transcripcion en streaming para atencion al cliente: el soporte de streaming permite transcribir conversaciones telefonicas en vivo, facilitando el analisis de sentimiento o la generacion de resumenes.
- Procesamiento de audio en servidores: mediante el endpoint compatible con OpenAI, puede integrarse en servicios backend para transcribir audios subidos por usuarios, con un coste computacional minimo.
- Archivado y busqueda de contenido audiovisual: al convertir audio a texto, se pueden indexar grabaciones para busquedas posteriores, aprovechando su bajo peso para procesar grandes volumenes en CPUs.

## Benchmarks y rendimiento

Los siguientes datos provienen de la model card del autor. Se muestran los valores de Word Error Rate (WER, menor es mejor) para Phonon-1 Micro y otros modelos de referencia. Las celdas sin marca son mediciones propias del autor; las marcadas con † son cifras publicadas en otras fuentes.

| Benchmark | Phonon-1 Micro (285 MB) | Moonshine base (248 MB) | Whisper small (967 MB) | wav2vec2-large (1.262 MB) | Qwen3-ASR teacher (1.569 MB) |
|---|---:|---:|---:|---:|---:|
| LibriSpeech test-clean | 3.002 | 3.417 | 3.4† | 2.8† | 2.235 |
| LibriSpeech test-other | 6.511 | 8.262 | 7.6† | 6.3† | 4.618 |
| TED-LIUM | 3.878 | 5.272 | — | — | 2.889 |
| SPGISpeech | 4.858 | 5.731 | — | 13.31† | 3.074 |
| VoxPopuli | 9.177 | 10.470 | — | — | 7.151 |
| GigaSpeech | 11.882 | 12.114 | — | — | 9.321 |
| Earnings-22 | 14.771 | 17.872 | — | 36.28† | 11.188 |
| AMI | 14.094 | 17.790 | — | — | 12.560 |
| Macro (ocho benchmarks) | 8.52 | 10.1 | — | — | 6.63 |

Phonon-1 Micro supera a Moonshine base en todos los benchmarks, con una ventaja media de 1,6 puntos de WER, a pesar de tener un tamaño similar. Frente a Whisper small, que es mas de tres veces mayor, Phonon-1 Micro ofrece un WER comparable o ligeramente superior en LibriSpeech, aunque Whisper small no tiene datos en el resto de benchmarks.

## Requisitos de hardware

- Tamano de descarga: 285 MB, lo que permite cargarlo en memoria RAM de cualquier equipo moderno.
- VRAM estimada: menos de 1 GB para inferencia en GPU, gracias a la cuantizacion ternaria.
- GPUs recomendadas: cualquier GPU NVIDIA con al menos 2 GB de VRAM (por ejemplo, GTX 1050 Ti, RTX 2060) o GPUs de datacenter como A100/H100 para procesamiento por lotes.
- Compatible con Apple Silicon (via MLX) y CPUs x86 (via runtimes de Fermion Research).
- Opciones de despliegue: CLI `fermion transcribe`, servidor `fermion serve` (endpoint OpenAI-compatible), o integracion directa con MLX en Mac.
- Latencia y throughput: no disponibles en la informacion publicada, pero al ser un modelo de 285 MB, se espera una latencia inferior a 1 segundo por audio de 10 segundos en hardware moderno.

## Comparativa con modelos similares

| Modelo | Tamano | Parametros | Licencia | WER (LibriSpeech test-clean) | Formato |
|---|---|---|---|---|---|
| Phonon-1 Micro | 285 MB | No disponible (base 0,6B) | Apache 2.0 | 3.002 | MLX, CUDA, CPU |
| Moonshine base | 248 MB | No disponible | MIT | 3.417 | ONNX, PyTorch |
| Whisper small | 967 MB | 244M | MIT | 3.4† | PyTorch, ONNX |
| wav2vec2-large | 1.262 MB | 317M | Apache 2.0 | 2.8† | PyTorch |

Phonon-1 Micro ofrece el mejor equilibrio entre tamano y precision frente a Moonshine base, siendo ligeramente mas grande pero con un WER significativamente menor. Whisper small es mas preciso en LibriSpeech, pero requiere mas del triple de espacio y no tiene soporte nativo para streaming. wav2vec2-large es mas preciso aun, pero su tamano y requisitos de memoria lo hacen menos adecuado para despliegue on-device.

## Limitaciones y advertencias

- El modelo solo soporta ingles; no hay soporte multilingue.
- Al ser un modelo pequeno, puede tener dificultades con acentos muy marcados, ruido de fondo intenso o audio de baja calidad, lo que podria aumentar la tasa de error.
- Riesgo de alucinaciones en transcripcion: como cualquier modelo ASR, puede generar texto que no corresponde al audio, especialmente en silencios o habla superpuesta.
- No se han publicado detalles sobre el dataset de entrenamiento, por lo que se desconocen posibles sesgos en la representacion de hablantes o dominios.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero el modelo base (Qwen3-ASR-0.6B) tambien es Apache 2.0, por lo que no hay conflictos de licencia.
- Para produccion, se recomienda validar el rendimiento en el dominio especifico (por ejemplo, llamadas telefonicas, podcasts, etc.) antes de desplegarlo a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FermionResearch/Phonon-1-Micro
- Modelo Phonon-1 (version completa): https://huggingface.co/FermionResearch/Phonon-1
- Repositorio GitHub: https://github.com/fermionresearch/phonon
- Documentacion de modelos de voz: https://www.fermionresearch.com/docs/speech-models/
- Sitio web de Fermion Research: https://www.fermionresearch.com/
- Modelo base Qwen3-ASR-0.6B: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
