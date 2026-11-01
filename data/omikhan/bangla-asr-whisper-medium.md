# OmiKhan/bangla-asr-whisper-medium

## Resumen

OmiKhan/bangla-asr-whisper-medium es un modelo de reconocimiento automático del habla (ASR) para bengalí, desarrollado por OmiKhan como trabajo final del capstone CSE499 de la North South University. Se trata de un ajuste fino completo del checkpoint Whisper-medium de OpenAI (764 millones de parámetros), partiendo a su vez del modelo bengalí de tugstugi (bengaliAI), sobre aproximadamente 300 horas de audio público en bengalí: grabaciones de medios (drama, narración, noticias) y habla leída.

El modelo resuelve el problema del reconocimiento de voz en bengalí, un idioma con recursos limitados en comparación con el inglés, y lo hace con una tasa de error de palabra (WER) media del 11,80 % en cuatro conjuntos de prueba, frente al 18,46 % del modelo base en modo zero-shot. La relevancia actual reside en que iguala o supera a otros modelos abiertos de bengalí en varios benchmarks y se distribuye con licencia Apache 2.0, lo que facilita su uso comercial.

Arquitectónicamente es un transformer encoder-decoder de tipo Whisper, con una ventana de contexto de audio de 30 segundos por segmento. El repositorio ocupa 3,1 GB y los pesos están en formato safetensors, listos para su uso con la librería transformers.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder) |
| Parámetros totales | 763.857.920 (764 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 s de audio por segmento (ventana nativa de Whisper); entrenado y evaluado con clips de 1–25 s |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; cuantización GGUF no documentada por el autor) |
| Idiomas soportados | bengalí (bn) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un Whisper-medium estándar: un transformer encoder-decoder con atención completa, especializado en la transcripción de audio muestreado a 16 kHz. No incorpora innovaciones arquitectónicas propias; el trabajo se centra en el ajuste fino y en la metodología de evaluación. El entrenamiento consistió en un fine-tuning completo durante 2 épocas con tasa de aprendizaje 1e-5, partiendo del checkpoint bengaliAI/tugstugi_bengaliai-regional-asr_whisper-medium.

Los datos de entrenamiento suman unas 300 horas y provienen de cinco corpus: DL Sprint 4.0 long-form ASR (Bengali-Loop, ~60 h, alineadas forzadamente), Common Voice 27.0 bengalí (~34 h, CC0), Kathbath (~34 h, CC BY 4.0), Shrutilipi (~28 h, CC BY 4.0) y OpenSLR 53 (~144 h, CC BY-SA 4.0). Los pesos publicados son una media ponderada de dos ejecuciones con la misma receta: 0,25 × M1 (solo DL Sprint) + 0,75 × M5-300 (todos los datos), seleccionada mediante una regla fijada antes de conocer los resultados de test (menor WER medio en tres conjuntos de desarrollo). No se documenta uso de RLHF ni DPO.

## Capacidades

- Transcripción de voz a texto en bengalí (bn), incluyendo audio de medios (drama, narración, noticias) y habla leída.
- Reconocimiento robusto en clips cortos de 1 a 25 segundos, con WER medio del 11,80 % en los conjuntos de prueba oficiales.
- Manejo de audio largo mediante segmentación por pausas (VAD) o la opción `chunk_length_s=30` del pipeline de transformers.
- Evaluación con normalización de texto específica para bengalí (`bangla_asr.common.text.normalize_bangla_text`), que reduce el WER al no penalizar variantes ortográficas.
- Soporte de decodificación greedy documentada; no se mencionan decodificación especulativa, beam search ni modos de razonamiento.
- No soporta tool calling, function calling, agentes, visión ni audio más allá de la transcripción.

## Casos de uso

- Subtitulado automático de contenido audiovisual en bengalí: el modelo transcribe drama, narración y noticias con un WER del 11,18 % en el conjunto DL Sprint 4.0, adecuado para generar subtítulos que luego se revisan manualmente.
- Transcripción de reuniones y entrevistas: con segmentación por VAD y clips de hasta 25 s, permite procesar conversaciones multi-turno en bengalí con una tasa de error moderada.
- Archivado y búsqueda de audio histórico: la transcripción de grabaciones de medios facilita indexar y buscar contenido hablado en bengalí en bibliotecas de audio.
- Atención al cliente por voz en bengalí: integrado en un pipeline ASR + NLP, permite transcribir consultas de usuarios para su clasificación y enrutamiento automático.
- Generación de datos de entrenamiento para otros modelos: las transcripciones sirven para crear corpus etiquetados de habla bengalí con licencia Apache 2.0.
- Accesibilidad: conversión de audio a texto para personas con discapacidad auditiva en contenido en bengalí, con la ventaja de que el modelo corre en una GPU T4 con un factor de tiempo real de aproximadamente 0,04.
- Investigación en ASR de bajos recursos: el repositorio incluye el código de puntuación y los intervalos de confianza al 95 %, lo que facilita la reproducibilidad y la comparación con otros sistemas.

## Benchmarks y rendimiento

Resultados de WER (%) con decodificación greedy y un normalizador común para todos los sistemas. Entre paréntesis, el WER que no penaliza diferencias puramente ortográficas confirmadas por anotadores humanos.

| Conjunto de prueba | Este modelo | Modelo base zero-shot |
|---|---:|---:|
| DL Sprint 4.0 eval (habla de medios, 4.234 clips) | 11,18 (8,82) | 22,70 (15,82) |
| FLEURS test | 15,60 (10,89) | 21,54 (14,56) |
| Common Voice test | 10,13 (6,61) | 14,80 (10,15) |
| Kathbath validation | 10,28 (5,87) | 14,81 (9,02) |
| Media | 11,80 (8,04) | 18,46 (12,39) |

En grabaciones completas sin segmentar (22 grabaciones, 20,4 h, cortadas por detección de voz) el WER sube al 14,2 %. El factor de tiempo real es de aproximadamente 0,04 en una GPU T4. En FLEURS, el conformer de Hishab (no comercial) obtiene 14,24, por delante de este modelo. No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, ya que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,6 GB en fp16 para los 764 M de parámetros, más el overhead de activaciones y del pipeline (estimación orientativa; no documentada por el autor).
- GPU recomendadas: T4 (el autor reporta un factor de tiempo real de ~0,04), así como A100, H100 o RTX 4090 para mayor throughput.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más de VRAM (RTX 3050, RTX 4060, etc.) en fp16.
- Opciones de despliegue: pipeline de transformers (documentado), vLLM no aplica directamente a Whisper, llama.cpp/Ollama no están documentados para este checkpoint, TGI no verificado.
- Latencia y throughput: factor de tiempo real de ~0,04 en T4, es decir, unas 25 veces más rápido que el tiempo real para clips cortos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | WER medio (mismo harness) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| OmiKhan/bangla-asr-whisper-medium | 764 M | 30 s | 11,80 | Apache 2.0 | HuggingFace |
| bengaliAI/tugstugi_bengaliai-regional-asr_whisper-medium (base) | 764 M | 30 s | 18,46 (zero-shot) | no disponible | HuggingFace |
| Hishab conformer (bengalí) | no disponible | no disponible | 14,24 en FLEURS | no comercial | no disponible |

El modelo supera al base en todos los conjuntos evaluados y es el mejor entre los modelos abiertos no entrenados en DL Sprint, Common Voice y Kathbath; en FLEURS queda por detrás del conformer de Hishab, que es no comercial.

## Limitaciones y advertencias

- Evaluado sobre clips alineados forzadamente; en grabaciones completas el WER sube al 14,2 %.
- La ortografía sigue las convenciones de los corpus de entrenamiento, que difieren entre sí; entre el 15 % y el 50 % de los errores restantes son solo ortográficos.
- Los dialectos regionales se transcriben según los corpus de entrenamiento; el habla muy dialectal está peor cubierta.
- El audio de DL Sprint 4.0 proviene de canales públicos de YouTube y no tiene licencia de datos declarada; el repositorio no incluye audio, pero existen riesgos de derechos de autor sobre los datos de entrenamiento.
- Riesgo de alucinación en pasajes de audio con ruido o silencios largos, inherente a los modelos Whisper.
- Solo soporta bengalí; no es multilingüe.
- No se documentan sesgos específicos más allá de la cobertura dialectal.
- Para uso comercial, la licencia Apache 2.0 del modelo es permisiva, pero la procedencia de los datos de DL Sprint 4.0 debe revisarse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OmiKhan/bangla-asr-whisper-medium
- Modelo base: https://huggingface.co/bengaliAI/tugstugi_bengaliai-regional-asr_whisper-medium
- Repositorio del proyecto (método, resultados y código de puntuación): https://github.com/omikhan4901/asr
- Cita: Mehboob Ehsan Khan, Nabigah Bin Sayeed, Nafisa Rodela. *Why N-best Rescoring Plateaus for Bangla Speech Recognition, and How Far Fixing the Cause Goes.* CSE499 capstone, North South University, 2026.
