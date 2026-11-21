# Scrya/parakeet-tdt-0.6b-v3-nsc5-nemo-speech-cpp-f16

## Resumen

Parakeet-TDT-0.6B-v3-nsc5 es un modelo de reconocimiento automático del habla (ASR) basado en la arquitectura Parakeet-TDT de NVIDIA, especializado mediante fine-tuning en inglés de Singapur (singlish) conversacional en entornos de sala de reuniones. Este repositorio concreto contiene una conversión a formato GGUF en precisión f16 del modelo base `Scrya/parakeet-tdt-0.6b-v3-nsc5`, empaquetada para su ejecución con NeMo-Speech.cpp 0.3.0, el runtime en C++ de NVIDIA para modelos de voz de NeMo.

El modelo parte de `nvidia/parakeet-tdt-0.6b-v3` y se ha ajustado con 1.386 horas de audio conversacional del National Speech Corpus (NSC) de IMDA, cubriendo cinco particiones del corpus. Está pensado para transcripción de reuniones en inglés de Singapur, con salida que incluye puntuación, mayúsculas y números escritos con palabras.

La relevancia de esta ficha radica en que ofrece una alternativa de despliegue ligera (1,30 GB en f16) para un modelo ASR de 637 millones de parámetros con arquitectura transducer TDT, ejecutable tanto en GPU como en CPU mediante un runtime C++ con servidor HTTP compatible con la API de OpenAI. Es un modelo de nicho, orientado a un dominio y una variante dialectal concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Parakeet-TDT (transducer Token-and-Duration Transducer) |
| Parametros totales | 637.329.158 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR por fragmentos de audio) |
| Tipos de cuantizacion | f16 (este repo); q8_0 disponible en repo hermano |
| Idiomas soportados | en (inglés de Singapur / singlish) |
| Licencia | cc-by-4.0 |
| Formato de pesos | GGUF (f16); el modelo base también en safetensors y `.nemo` |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Parakeet-TDT, un transducer con decodificación Token-and-Duration (TDT), que predice conjuntamente tokens y duraciones en lugar de depender únicamente de un CTC o de un transducer clásico. El modelo original de NVIDIA tiene 0,6 mil millones de parámetros y este repositorio es una conversión de pesos, no un reentrenamiento: se tomó el checkpoint `.nemo` del modelo ajustado y se convirtió con el conversor de NeMo-Speech.cpp 0.3.0.

El fine-tuning se realizó sobre 1.386 horas de inglés conversacional de Singapur procedentes de cinco particiones del NSC de IMDA, con datos y ajustes de entrenamiento orientados a habla en salas de reuniones. No se dispone de información sobre la composición exacta del dataset, el número de tokens de audio ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en ASR). La innovación destacable en este repositorio es la conversión a GGUF f16 con paridad de salida prácticamente exacta respecto al modelo original en transformers.

## Capacidades

- Transcripción de voz a texto en inglés de Singapur conversacional, con salida puntuada y con mayúsculas.
- Escritura de números como palabras (por ejemplo, "twenty five" en lugar de "25"); el runtime permite `--verbatim` para evitar reescrituras.
- Reconocimiento optimizado para audio de salas de reuniones y conversaciones multi-hablante.
- Ejecución en GPU y CPU mediante NeMo-Speech.cpp.
- Servidor HTTP compatible con la API de OpenAI (`/v1/audio/transcriptions`), con soporte de `verbose_json` para marcas de tiempo por palabra.
- Procesamiento por lotes en GPU (`--concurrency`) y procesamiento de carpetas completas de audio.
- No soporta tool calling, agentes, visión ni audio de entrada más allá de la transcripción; es un modelo ASR puro.

## Casos de uso

- Transcripción de reuniones corporativas en Singapur: el modelo se ha ajustado específicamente con audio de salas de reuniones del NSC, por lo que maneja acentos y patrones conversacionales locales mejor que un ASR genérico.
- Generación de actas y resúmenes posteriores: la salida puntuada y con mayúsculas facilita el post-procesado y la alimentación a un LLM para resumen automático.
- Subtitulado y transcripción por lotes: el CLI permite procesar carpetas enteras con `--concurrency 16`, adecuado para digitalizar archivos de audio históricos.
- Servicio de transcripción como API interna: el servidor HTTP con API compatible con OpenAI permite integrarlo en aplicaciones existentes que ya usan el SDK de OpenAI, cambiando solo `base_url`.
- Análisis de calidad y cumplimiento en centros de llamadas: la transcripción con marcas de tiempo (`verbose_json`) permite auditar conversaciones y buscar términos concretos.
- Investigación lingüística sobre singlish: el modelo ofrece una transcripción normalizada según las reglas ortográficas del NSC, útil para estudios de dialectología y corpus.
- Despliegue en entornos con recursos limitados: al ser un GGUF f16 de 1,30 GB ejecutable en CPU, puede correr en servidores sin GPU dedicada para transcripciones de baja concurrencia.

## Benchmarks y rendimiento

Resultados publicados en la model card, sobre una muestra de 5.000 clips (7,15 horas) ponderada por igual entre las cinco particiones del NSC:

| Modelo | WER normalizado | WER formateado | Diferencia normalizada | Velocidad en RTX 5090 |
|---|---:|---:|---|---:|
| Modelo original (transformers, fp32) | 8,54% | 15,79% | — | — |
| Este fichero, un clip a la vez | 8,52% | 15,75% | -0,02 [-0,05, +0,01] | 181x tiempo real |

Desglose por partición del NSC:

| Partición | Original normalizado | Este fichero normalizado | Original formateado | Este fichero formateado |
|---|---:|---:|---:|---:|
| Part 3 SDM | 9,90% | 9,89% | 16,63% | 16,56% |
| Part 3 Same Room | 10,91% | 10,78% | 16,27% | 16,11% |
| Part 4 | 14,70% | 14,70% | 23,26% | 23,22% |
| Part 5 | 6,40% | 6,38% | 12,98% | 12,94% |
| Part 6.3 | 6,07% | 6,08% | 13,98% | 14,01% |

El fichero reproduce exactamente el texto del modelo original en 4.872 de los 5.000 clips, frente a 4.686 del fichero q8_0.

## Requisitos de hardware

- VRAM estimada: el fichero f16 ocupa 1,30 GB en disco; la VRAM necesaria para inferencia es del orden de 1,5-2 GB incluyendo buffers del runtime (estimación, no publicada).
- GPU recomendadas: RTX 5090 (medido a 181x tiempo real); cualquier GPU CUDA con al menos ~2 GB de VRAM debería ser suficiente.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con 4 GB o más de VRAM.
- Ejecución en CPU: soportada (`gpu: -1` en la configuración del servidor).
- Opciones de despliegue: NeMo-Speech.cpp 0.3.0 (CLI `nemo-speech transcribe` y servidor `nemo-speech serve`); no se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 181x tiempo real en RTX 5090 para el lote completo de 5.000 clips, incluyendo arranque y carga del modelo; con `--concurrency 16` el runtime agrupa peticiones en lotes de GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma/dominio | Formato | Licencia | Notas |
|---|---|---:|---|---|---|
| Este modelo (f16 GGUF) | 637 M | Singlish, reuniones | GGUF | cc-by-4.0 | Paridad con el original, 181x RT en RTX 5090 |
| Scrya/parakeet-tdt-0.6b-v3-nsc5 (q8_0) | 637 M | Singlish, reuniones | GGUF | cc-by-4.0 | Aproximadamente la mitad de tamaño, misma o ligeramente mejor puntuación |
| Scrya/parakeet-tdt-0.6b-v3-nsc5 (original) | 637 M | Singlish, reuniones | safetensors, `.nemo` | cc-by-4.0 | Referencia en fp32; requiere transformers |
| nvidia/parakeet-tdt-0.6b-v3 | 600 M | Inglés general | safetensors, `.nemo` | no disponible en la información | Modelo base antes del fine-tuning |

## Limitaciones y advertencias

- Modelo de nicho: solo inglés de Singapur; el rendimiento en otras variantes del inglés o en otros idiomas no está documentado y previsiblemente será inferior.
- Dominio restringido a habla conversacional de salas de reuniones; puede degradarse en audio de campo, llamadas telefónicas o habla muy ruidosa.
- Riesgo de alucinación inherente a los modelos ASR, especialmente en segmentos con ruido o solapamiento de hablantes.
- La confianza por palabra en `verbose_json` es siempre 1, porque NeMo-Speech.cpp 0.3.0 no calcula confianza para modelos transducer.
- Solo decodificación greedy en NeMo-Speech.cpp; no hay búsqueda por haz ni otras estrategias de decodificación.
- El servidor HTTP no tiene API key por defecto; hay que definir `NEMO_SPEECH_HTTP_API_KEY` antes de exponerlo en red.
- Licencia cc-by-4.0: permite uso comercial con atribución, pero conviene revisar las condiciones del corpus NSC de IMDA para usos derivados.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria independiente.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/Scrya/parakeet-tdt-0.6b-v3-nsc5-nemo-speech-cpp-f16
- Modelo base ajustado: https://huggingface.co/Scrya/parakeet-tdt-0.6b-v3-nsc5
- Versión q8_0: https://huggingface.co/Scrya/parakeet-tdt-0.6b-v3-nsc5-nemo-speech-cpp-q8_0
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- NeMo-Speech.cpp (runtime): https://github.com/NVIDIA/NeMo-Speech.cpp
- Documentación de la API de NeMo-Speech.cpp v0.3.0: https://github.com/NVIDIA/NeMo-Speech.cpp/blob/v0.3.0/docs/api.md
