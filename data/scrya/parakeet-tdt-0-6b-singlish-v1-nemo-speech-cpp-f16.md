# Scrya/parakeet-tdt-0.6b-singlish-v1-nemo-speech-cpp-f16

## Resumen

Este repositorio contiene una cuantización en formato GGUF de precisión f16 del modelo de reconocimiento automático del habla (ASR) `Scrya/parakeet-tdt-0.6b-singlish-v1`, preparada específicamente para ejecutarse con NeMo-Speech.cpp, el runtime en C++ de NVIDIA para modelos de voz de NeMo. El modelo subyacente es un ajuste fino de NVIDIA Parakeet-TDT-0.6B-v3 sobre 1.386 horas de inglés de Singapur conversacional procedente de cinco particiones del National Speech Corpus (NSC) de IMDA, con datos y ajustes orientados a audio de salas de reuniones. El autor del ajuste fino y de la cuantización es el usuario Scrya.

La relevancia de esta ficha es doble: por un lado, ilustra el flujo de trabajo de convertir un modelo ASR de NeMo (originalmente en safetensors y `.nemo`) a GGUF para su despliegue en un runtime C++ ligero; por otro, documenta el rendimiento de una cuantización f16 frente al modelo original en fp32 con transformers, con métricas de WER normalizado y formateado sobre 5.000 clips de test. El resultado es que la cuantización f16 reproduce prácticamente el comportamiento del original (misma salida en 4.872 de 5.000 clips) a 181 veces tiempo real en una RTX 5090.

Arquitectónicamente es un transductor TDT (Token-and-Duration Transducer) con 637.329.158 parámetros, especializado en un único idioma (inglés de Singapur) y en un dominio concreto (reuniones). No es un modelo generativo de propósito general ni un LLM: su única tarea es transcribir audio a texto con puntuación y mayúsculas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transductor TDT (Token-and-Duration Transducer), familia Parakeet |
| Parámetros totales | 637.329.158 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | f16 (este repositorio); q8_0 disponible en repositorio hermano |
| Idiomas soportados | en (inglés de Singapur, Singlish) |
| Licencia | cc-by-4.0 |
| Formato de pesos | GGUF (fichero `parakeet-tdt-0.6b-v3-nsc5-74f31217.f16.gguf`, 1,30 GB) |

## Arquitectura y entrenamiento

El modelo es un transductor TDT de la familia Parakeet, una variante de los transductores RNN-T en la que el predictor emite conjuntamente tokens y duraciones, lo que reduce el número de pasos de decodificación y acelera la inferencia. El modelo base es NVIDIA Parakeet-TDT-0.6B-v3, ajustado por Scrya sobre 1.386 horas de inglés de Singapur conversacional extraídas de cinco particiones del National Speech Corpus (NSC) de IMDA. Los datos y los hiperparámetros se seleccionaron para el dominio de salas de reuniones.

El ajuste fino se distribuye en tres formatos: safetensors, `.nemo` y GGUF. Este repositorio concreto contiene únicamente la conversión a GGUF f16 para NeMo-Speech.cpp 0.3.0. La model card no detalla la composición exacta del dataset, el número de épocas, la función de pérdida ni si hubo etapas de alineación o aumento de datos más allá de la procedencia del corpus. El modelo escribe texto con puntuación y mayúsculas, y deletrea los números como palabras ("twenty five" en lugar de "25").

## Capacidades

- Transcripción de voz a texto en inglés de Singapur (Singlish) con puntuación y mayúsculas.
- Salida con números escritos como palabras, no como dígitos.
- Procesamiento por lotes en GPU mediante `--concurrency` en la CLI de NeMo-Speech.cpp.
- Servicio HTTP compatible con la API de transcripciones de OpenAI (`/v1/audio/transcriptions`), lo que permite usar el paquete `openai` de Python apuntando a `base_url`.
- Endpoints auxiliares `GET /ready` y `GET /v1/models`.
- Marcas de tiempo a nivel de palabra mediante `response_format=verbose_json` (sin confianza por palabra en transductores con NeMo-Speech.cpp 0.3.0).
- Ejecución en CPU o GPU (`gpu: -1` para CPU en la configuración del servidor).
- No soporta tool calling, agentes, razonamiento multi-turno ni otras capacidades de LLM: es un modelo ASR puro.

## Casos de uso

- Transcripción de reuniones en Singapur: el ajuste fino se entrenó específicamente con audio de salas de reuniones del NSC, por lo que captura mejor las particularidades fonéticas y léxicas del inglés de Singapur que un modelo ASR genérico.
- Actas automáticas de reuniones corporativas: el modelo genera puntuación y mayúsculas directamente, lo que reduce el postprocesado necesario para alimentar un sistema de resumen o de gestión documental.
- Subtitulado y transcripción por lotes: la CLI permite procesar carpetas completas con `--concurrency 16`, batching en GPU y salida JSON, adecuado para pipelines de archivado de audio.
- Servicio de transcripción interno: el servidor HTTP con API compatible con OpenAI permite integrar el modelo en aplicaciones existentes sin cambiar el cliente, con autenticación opcional mediante `NEMO_SPEECH_HTTP_API_KEY`.
- Análisis de calidad y cumplimiento en centros de contacto: la transcripción con marcas de tiempo por palabra facilita la búsqueda y el alineado de fragmentos concretos de la conversación.
- Despliegue en entornos con recursos limitados: al ser un GGUF de 1,30 GB ejecutable en CPU o GPU y con 181x tiempo real en una RTX 5090, es viable en estaciones de trabajo sin aceleradores de gama alta.
- Investigación en ASR multilingüe y variantes dialectales: sirve como referencia de ajuste fino sobre un corpus regional concreto (NSC) y como caso de estudio de conversión a GGUF para NeMo-Speech.cpp.

## Benchmarks y rendimiento

La model card compara este fichero f16 con el modelo original en transformers (fp32, decodificación greedy, límite de 3 tokens por frame de audio) sobre una muestra de 1.000 clips aleatorios de test de cada partición del NSC: 5.000 clips y 7,15 horas. La muestra pondera cada partición por igual, por lo que su WER es inferior al de los conjuntos de test completos, mayoritariamente de la partición 3.

| Modelo | WER normalizado | WER formateado | Diferencia normalizada | Velocidad en RTX 5090 |
|---|---:|---:|---|---:|
| Original (transformers, fp32) | 8,54% | 15,79% | — | — |
| Este fichero, un clip a la vez | 8,52% | 15,75% | -0,02 [-0,05, +0,01] | 181x tiempo real |

El intervalo de la diferencia incluye el cero, por lo que el fichero f16 puntúa igual que el original. Escribe exactamente el mismo texto que el original en 4.872 de los 5.000 clips (frente a 4.686 del fichero q8_0). Las velocidades incluyen el arranque del runtime y la carga del modelo.

| Partición | Original normalizado | Este fichero normalizado | Original formateado | Este fichero formateado |
|---|---:|---:|---:|---:|
| Part 3 SDM | 9,90% | 9,89% | 16,63% | 16,56% |
| Part 3 Same Room | 10,91% | 10,78% | 16,27% | 16,11% |
| Part 4 | 14,70% | 14,70% | 23,26% | 23,22% |
| Part 5 | 6,40% | 6,38% | 12,98% | 12,94% |
| Part 6.3 | 6,07% | 6,08% | 13,98% | 14,01% |

No se han publicado en la información disponible resultados de benchmarks estándar tipo MMLU, HumanEval o GSM8K, que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el fichero GGUF ocupa 1,30 GB, por lo que el consumo de memoria en GPU será del orden de esa cifra más el overhead del runtime.
- GPU recomendadas: RTX 5090 validada en la model card (181x tiempo real con 5.000 clips). No se documentan otras GPU.
- Cabe en GPU de consumo: sí, dado el tamaño del fichero (1,30 GB); no se especifican modelos concretos más allá de la RTX 5090.
- Ejecución en CPU: soportada mediante `gpu: -1` en la configuración del servidor; no se documenta rendimiento en CPU.
- Opciones de despliegue: NeMo-Speech.cpp 0.3.0 (CLI `nemo-speech transcribe` y servidor `nemo-speech serve`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 181x tiempo real en RTX 5090 para el lote completo de 5.000 clips, incluyendo arranque y carga del modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER normalizado (muestra NSC) | Licencia | Formato |
|---|---|---:|---:|---|---|
| Este fichero (f16 GGUF) | 637.329.158 | no disponible | 8,52% | cc-by-4.0 | GGUF |
| Scrya/parakeet-tdt-0.6b-singlish-v1 (original fp32) | 637.329.158 | no disponible | 8,54% | cc-by-4.0 | safetensors, `.nemo` |
| Scrya/parakeet-tdt-0.6b-singlish-v1-nemo-speech-cpp-q8_0 | 637.329.158 | no disponible | igual o ligeramente mejor que f16 según la model card | cc-by-4.0 | GGUF q8_0 |
| Scrya/parakeet-tdt-0.6b-singlish-v2-nemo-speech-cpp-f16 | no disponible | no disponible | menos errores en todos los conjuntos NSC según la model card | no disponible | GGUF f16 |

No se dispone de datos de benchmarks frente a otros modelos ASR de la misma categoría (por ejemplo, Whisper) en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en un único idioma y variante: inglés de Singapur (Singlish); no está pensado para otros idiomas o acentos.
- Dominio restringido a audio de salas de reuniones; el rendimiento puede degradarse en otros contextos acústicos no representados en el NSC.
- El WER sobre la muestra ponderada (8,52%) es inferior al de los conjuntos de test completos, mayoritariamente de la partición 3, por lo que no debe extrapolarse directamente a producción.
- La versión 2 del modelo comete menos errores en todos los conjuntos de test NSC según la model card; la versión 1 se mantiene sin cambios por compatibilidad.
- El fichero q8_0 es aproximadamente la mitad de tamaño y obtuvo una puntuación igual o ligeramente mejor en la misma muestra; el f16 debe elegirse solo cuando se requiera la salida más fiel al original.
- En `verbose_json`, la confianza por palabra es siempre 1 porque NeMo-Speech.cpp 0.3.0 no calcula confianza para modelos transductores.
- El servidor HTTP no tiene API key por defecto; debe definirse `NEMO_SPEECH_HTTP_API_KEY` antes de exponerlo en red.
- Licencia cc-by-4.0: permite uso comercial con atribución; deben respetarse las condiciones de la licencia y la atribución a NVIDIA y al autor del ajuste fino.
- Riesgo de alucinación y errores de transcripción inherente a todo modelo ASR; no se documentan sesgos específicos más allá de la limitación de dominio e idioma.
- No se documentan requisitos de memoria, latencia en CPU ni compatibilidad con otros runtimes distintos de NeMo-Speech.cpp 0.3.0.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Scrya/parakeet-tdt-0.6b-singlish-v1-nemo-speech-cpp-f16
- Modelo base del ajuste fino: https://huggingface.co/Scrya/parakeet-tdt-0.6b-singlish-v1
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Cuantización q8_0: https://huggingface.co/Scrya/parakeet-tdt-0.6b-singlish-v1-nemo-speech-cpp-q8_0
- Versión 2 en GGUF f16: https://huggingface.co/Scrya/parakeet-tdt-0.6b-singlish-v2-nemo-speech-cpp-f16
- NeMo-Speech.cpp (runtime): https://github.com/NVIDIA/NeMo-Speech.cpp
- Documentación de la API de NeMo-Speech.cpp v0.3.0: https://github.com/NVIDIA/NeMo-Speech.cpp/blob/v0.3.0/
