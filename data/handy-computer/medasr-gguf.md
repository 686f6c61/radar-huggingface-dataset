# handy-computer/medasr-gguf

## Resumen

medasr-gguf es la conversión a formato GGUF del modelo google/medasr, un sistema de reconocimiento automático del habla (ASR) especializado en dictado médico en inglés. Lo publica el proyecto handy-computer dentro de su ecosistema transcribe.cpp, una implementación en C++ pensada para inferencia local y offline de modelos de voz. El modelo base lo desarrolla Google dentro de su programa Health AI Developer Foundations (HAI-DEF), orientado a aplicaciones sanitarias.

La arquitectura es un encoder Conformer de 17 capas con atención RoPE, FFN tipo macaron y una cabeza CTC con vocabulario SentencePiece de 512 tokens. Con 105,3 millones de parámetros, es un modelo compacto que cabe en cualquier equipo moderno: la cuantización recomendada Q8_0 ocupa solo 128 MB. Está optimizado para transcripción de dictados en radiología, medicina interna y medicina de familia, no para ASR general.

Su relevancia actual reside en que permite desplegar transcripción médica en local, sin conexión y con requisitos de hardware mínimos, algo poco habitual en el ámbito clínico. La contrapartida es un WER absoluto alto en dominios generales (17,86 % en LibriSpeech test-clean con Q8_0), coherente con su especialización: el propio autor reporta cifras de 6,6 % a 9,3 % en los conjuntos internos de dictado médico del publicador, no reproducibles públicamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer (encoder de 17 capas, atención RoPE, FFN macaron) + cabeza CTC |
| Parámetros totales | 105.316.112 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio; cabeza CTC de 512 tokens SentencePiece) |
| Tipos de cuantización | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | inglés (en) |
| Licencia | Health AI Developer Foundations (HAI-DEF), heredada de google/medasr |
| Formato de pesos | GGUF (para transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo es un encoder Conformer, una arquitectura que combina bloques de autoatención con convoluciones para capturar dependencias locales y globales en la señal de audio. En este caso consta de 17 capas con atención RoPE (rotary position embeddings) y FFN de tipo macaron, un diseño habitual en ASR moderno. La salida se produce mediante una cabeza CTC con vocabulario SentencePiece de 512 tokens y decodificación greedy, sin modelo de lenguaje externo ni búsqueda por haz (beam search). Esto simplifica el despliegue y reduce la latencia, a costa de renunciar a la corrección contextual que aportaría un LM.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO; la model card original no los detalla en la información disponible. Sí se sabe que el ajuste está orientado a dictado médico en tres dominios (radiología, medicina interna y medicina familiar), y que el modelo base fue portado desde el commit ae1e484 de google/medasr, fijado el 2026-06-04. La conversión GGUF fue validada contra la referencia de transformers en el commit 65dc2615 (versión de desarrollo, v5.0.0 no publicada), con coincidencia exacta del WER F32 (17,88 %) entre ambas implementaciones.

## Capacidades

- Transcripción de voz a texto en inglés, offline y sin conexión.
- Especialización en dictado médico: radiología, medicina interna y medicina familiar.
- Decodificación CTC greedy con marcas de tiempo a nivel de token.
- Inferencia en CPU y GPU (Metal en Apple Silicon, Vulkan en GPUs compatibles).
- No soporta streaming (streaming: false).
- No soporta traducción (translate: false).
- No incluye detección de idioma (lang_detect: false).
- No dispone de tool calling, function calling ni capacidades de agente.
- No procesa visión ni audio más allá de la transcripción; no hay modo thinking.

## Casos de uso

- Dictado radiológico local: el modelo transcribe informes dictados por radiólogos en un equipo de sobremesa, sin enviar audio a la nube, gracias a su tamaño de 128 MB en Q8_0 y su especialización en el dominio.
- Documentación clínica en consulta: médicos de familia dictan notas de visita que se transcriben en tiempo real en un portátil con CPU, usando el formato WAV mono a 16 kHz que exige transcribe.cpp.
- Cumplimiento de privacidad en entornos sanitarios: al ejecutarse offline, el audio del paciente no sale del dispositivo, lo que facilita el cumplimiento de requisitos de protección de datos en despliegues donde la nube no es aceptable.
- Integración en sistemas de historia clínica electrónica: mediante la CLI de transcribe.cpp o su API C++, se puede encadenar la transcripción con pipelines internos de estructuración de notas.
- Prototipado e investigación en ASR médico: sirve como referencia reproducible para comparar arquitecturas Conformer-CTCas en dominios especializados, con pesos GGUF ligeros y validación numérica documentada.
- Despliegue en hardware modesto: con un RTF de 65,34 en CPU de un Mac M4 Max (es decir, procesa audio unas 65 veces más rápido que tiempo real), es viable en portátiles y equipos de gama media sin GPU dedicada.
- Transcripción por lotes de grabaciones: el bajo coste computacional permite procesar grandes volúmenes de audio de dictado en servidores sin aceleradores.

## Benchmarks y rendimiento

| Benchmark | F32 | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---:|---:|---:|---:|---:|---:|
| WER LibriSpeech test-clean (%) | 17,88 | 17,88 | 17,86 | 17,93 | 17,91 | 18,14 |
| WER FLEURS en (%) | no disponible | no disponible | 37,48 | no disponible | no disponible | no disponible |

| Métrica de velocidad | Valor |
|---|---:|
| RTF en Mac M4 Max (CPU) | 65,34 |
| RTF en Mac M4 Max (Metal) | 786,75 |
| RTF en Ryzen 4750U (CPU) | 25,87 |
| RTF en Ryzen 4750U (Vulkan) | 71,26 |

El WER de LibriSpeech test-clean se midió sobre las 2.620 utterances completas, con batch size 1 y sin marcas de tiempo. El autor señala que el WER absoluto es superior al de ASR general (Whisper-base ronda el 5 %) porque el modelo está ajustado para dictado médico; en los conjuntos internos del publicador (RAD-DICT, GENERAL-DICT, FM-DICT) obtiene entre 6,6 % y 9,3 %, aunque estos no son reproducibles públicamente.

## Requisitos de hardware

- VRAM estimada: prácticamente despreciable; entre 83 MB (Q4_K_M) y 421 MB (F32) de pesos, más el buffer de activaciones, muy inferior a 1 GB en todos los casos.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan; no requiere A100 ni H100.
- Cabe en cualquier GPU de consumo, incluida una GTX 1050 o una iGPU moderna; también funciona íntegramente en CPU.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli` y librería C++); no se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, al ser un modelo ASR y no un LLM.
- Latencia y throughput: RTF de 65,34 en CPU de M4 Max y 786,75 con Metal; 25,87 en CPU de Ryzen 4750U y 71,26 con Vulkan. Con RTF superior a 25, la transcripción es entre 25 y 786 veces más rápida que tiempo real según plataforma.
- Entrada de audio: WAV mono a 16 kHz; para otros formatos hay que convertir previamente con ffmpeg.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | WER LibriSpeech test-clean | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| medasr-gguf (Q8_0) | 105 M | audio, sin streaming | 17,86 % | HAI-DEF (restringida) | GGUF en HF |
| Whisper-base | no disponible en la información | audio, 30 s por ventana | ~5 % (dato citado en la model card) | MIT (según conocimiento general, no verificado aquí) | múltiples formatos |
| Alternativas ASR médico especializadas | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con Whisper-base solo es posible en WER general, donde medasr es claramente peor por su especialización; no se dispone de datos de benchmarks médicos públicos que permitan una comparación justa con otros ASR clínicos.

## Limitaciones y advertencias

- WER elevado en dominios generales (17,86 % en LibriSpeech test-clean), lo que desaconseja su uso como ASR de propósito general.
- Solo inglés; no soporta otros idiomas ni detección de idioma.
- Sin streaming: no apto para transcripción en tiempo real continua sin segmentar el audio.
- Sin modelo de lenguaje ni beam search: mayor propensión a errores en palabras fuera del dominio médico.
- Riesgo de alucinación y errores en términos médicos poco frecuentes, nombres propios y acrónimos; no se han publicado análisis de sesgos.
- Licencia HAI-DEF con restricciones de uso: prohibido el uso recogido en la Prohibited Use Policy de Google, cualquier uso que pueda hacer que una autoridad reguladora considere a Google fabricante de un dispositivo médico, o usos contrarios a la ley aplicable.
- El uso clínico puede requerir autorización de la autoridad sanitaria correspondiente; no debe emplearse como sustituto de validación profesional.
- La cuantización Q4_K_M presenta una degradación real de +0,26 pp de WER y no se recomienda; Q8_0 es el valor por defecto recomendado.
- Los conjuntos internos de evaluación médica (RAD-DICT, GENERAL-DICT, FM-DICT) no son reproducibles públicamente, por lo que las cifras de 6,6 %–9,3 % no son verificables de forma independiente.
- Requiere audio en WAV mono a 16 kHz; no acepta otros formatos directamente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/handy-computer/medasr-gguf
- Modelo base: https://huggingface.co/google/medasr
- Commit del modelo base: https://huggingface.co/google/medasr/commit/ae1e484
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/782abfd
- Página del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/medasr.md
- Documentación de MedASR en Google: https://developers.google.com/health-ai-developer-foundations/medasr
- Modelo en Google Cloud Model Garden: https://console.cloud.google.com/vertex-ai/publishers/google/model-garden/medasr
- Repositorio GitHub de MedASR: https://github.com/google-health/medasr
- Notebook de inicio rápido: https://github.com/google-health/medasr/blob/main/notebooks/quick_start_with_hugging_face.ipynb
- Notebook de fine-tuning: https://github.com/google-health/medasr/blob/main/notebooks/fine_tune_with_hugging_face.ipynb
- Términos de licencia HAI-DEF: https://developers.google.com/health-ai-developer-foundations/terms
- Política de usos prohibidos HAI-DEF: https://developers.google.com/health-ai-developer-foundations/prohibited-use-policy
- Licencia incluida en el repo: https://huggingface.co/handy-computer/medasr-gguf/blob/main/LICENSE
- Aviso NOTICE del repo: https://huggingface.co/handy-computer/medasr-gguf/blob/main/NOTICE
- Preprint técnico: https://arxiv.org/abs/2605.16555
- Referencia Conformer: https://arxiv.org/abs/2005.08100
- Referencia adicional: https://arxiv.org/abs/2304.13134
- Referencia adicional: https://arxiv.org/abs/2309.08105
