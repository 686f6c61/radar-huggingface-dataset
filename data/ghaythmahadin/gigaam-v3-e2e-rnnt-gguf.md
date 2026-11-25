# GhaythMahadin/gigaam-v3-e2e-rnnt-gguf

## Resumen

GigaAM-v3-e2e-rnnt-gguf es la conversión a formato GGUF del modelo `ai-sage/GigaAM-v3` en su variante `e2e_rnnt`, un sistema de reconocimiento automático del habla (ASR) especializado en ruso. Lo desarrolla el equipo de Sber (ai-sage) y esta conversión concreta la publica el usuario GhaythMahadin para su uso con el runtime [transcribe.cpp](https://github.com/handy-computer/transcribe.cpp). El modelo resuelve transcripción offline de audio corto en ruso, con salida ya puntuada y normalizada.

Arquitectónicamente es un Conformer de 16 capas (encoder) acoplado a una cabeza RNN-T (transducer) con decodificación greedy, sobre un vocabulario SentencePiece de 1024 piezas. Cuenta con 222.518.657 parámetros totales (~222 M), lo que lo sitúa en la franja de 220-240 M que declara el modelo base. No es un modelo de lenguaje: no genera texto libre ni razona, solo transcribe voz a texto.

Su relevancia ahora es práctica: ofrece un ASR ruso de calidad competitiva (WER del 5,35 % en FLEURS ru medido por el autor de la conversión) en ficheros de entre 175 MB y 849 MB según cuantización, ejecutables en CPU y GPU de consumo mediante Metal o Vulkan. La licencia MIT y el formato GGUF lo hacen directamente integrable en aplicaciones locales sin dependencias de servicios en la nube.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer (encoder de 16 capas) + cabeza RNN-T (transducer) |
| Parámetros totales | 222.518.657 (~222 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; audio de entrada limitado a ≤25 s por utterance |
| Tipos de cuantización | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | ruso (ru) únicamente |
| Licencia | MIT |
| Formato de pesos | GGUF (para transcribe.cpp) |
| Vocabulario | SentencePiece de 1024 piezas |
| Frecuencia de muestreo | 16 kHz mono WAV |
| Streaming | no |
| Traducción | no |
| Detección de idioma | no |
| Marcas de tiempo | a nivel de token |

## Arquitectura y entrenamiento

El modelo es un sistema ASR end-to-end de tipo Conformer + RNN-T. El encoder es un Conformer de 16 capas que procesa espectrogramas de audio a 16 kHz; la cabeza es un transducer RNN-T que se decodifica de forma greedy (sin beam search ni modelo de lenguaje externo en esta conversión). La salida es texto ruso con mayúsculas y puntuación, generado directamente desde el tokenizador SentencePiece de 1024 piezas, lo que corresponde a la variante `e2e_rnnt` del modelo base (frente a las variantes `ctc`, `rnnt` y `e2e_ctc`).

El modelo base GigaAM-v3 se preentrena con el objetivo HuBERT-CTC sobre 700.000 horas de habla rusa y después se afina para ASR. Según la model card upstream, la tercera generación incorpora nuevos conjuntos internos: conversaciones de call center, habla con música de fondo, habla natural y habla con características atípicas, con una mejora media del 30 % en esos dominios respecto a generaciones anteriores. Esta conversión GGUF se portó desde el commit `ec1dc1f` del modelo base (fijado el 2026-05-12) y se validó contra el paquete de referencia del autor en el commit `42b96d9` de transcribe.cpp.

## Capacidades

- Transcripción de voz a texto en ruso, offline, con decodificación greedy RNN-T.
- Salida con mayúsculas, puntuación y normalización de texto (variante end-to-end).
- Marcas de tiempo a nivel de token.
- Procesamiento de audio corto: hasta 25 s por utterance.
- Ejecución en CPU y en GPU mediante los backends Metal (macOS) y Vulkan.
- Cuantizaciones desde F32 hasta Q4_K_M con degradación de WER mínima.
- No soporta streaming, traducción, detección de idioma ni entrada de audio distinta de 16 kHz mono WAV sin conversión previa.

## Casos de uso

- Transcripción por lotes de reuniones y notas de voz en ruso: se convierte cada fichero a WAV 16 kHz mono con ffmpeg y se procesa con `transcribe-cli`; el modelo devuelve texto puntuado listo para archivar o indexar.
- Subtitulado de vídeo en ruso: las marcas de tiempo a nivel de token permiten alinear la transcripción con la pista de audio para generar subtítulos, segmentando previamente el audio en fragmentos de ≤25 s.
- Asistentes de voz locales para aplicaciones de escritorio: al ejecutarse en CPU con cuantización Q4_K_M (175 MB) y sin conexión, encaja en herramientas de dictado o comandos por voz que deban funcionar offline.
- Análisis de llamadas de atención al cliente: el modelo base reporta un WER del 9,5 % en el conjunto Callcenter (variante V3_RNNT), por lo que es adecuado para transcribir conversaciones telefónicas y alimentar sistemas de control de calidad.
- Investigación en ASR ruso: sirve como referencia reproducible y ligera para comparar técnicas de decodificación, cuantización o normalización sobre FLEURS ru.
- Prototipado en hardware de consumo: con ratios de tiempo real de 88× (Metal en M4 Max) y 22× (Vulkan en Ryzen 4750U) permite iterar sobre pipelines de audio sin GPU dedicada.
- Transcripción de habla con características atípicas o con ruido de fondo: el modelo base declara mejoras específicas en habla desordenada (WER 19,2 % en V3_RNNT frente a 59,3 % de Whisper) y habla natural.

## Benchmarks y rendimiento

WER medido por el autor de la conversión sobre el split de test completo de FLEURS ru (775 utterances), decodificación greedy y sin modelo de lenguaje externo:

| Cuantización | Tamaño | WER FLEURS ru |
|---|---:|---:|
| F32 | 849 MB | 5,35 % |
| F16 | 431 MB | 5,35 % |
| Q8_0 | 261 MB | 5,36 % |
| Q6_K | 217 MB | 5,37 % |
| Q5_K_M | 197 MB | 5,42 % |
| Q4_K_M | 175 MB | 5,36 % |

El paquete de referencia del autor (`gigaam`) mide un 6,78 % sobre el mismo manifiesto; la diferencia de 1,4 pp se debe a que el paquete upstream rechaza 5 utterances de más de 25 s (contabilizadas como errores de deleción). En el subconjunto de 770 utterances que ambos decodifican, transcribe.cpp coincide exactamente con upstream. ai-sage no publica WER de FLEURS ru para el modelo base.

Resultados del modelo base GigaAM-v3 por dominio (WER %, tabla de la model card upstream):

| Conjunto | V3_CTC | V3_RNNT | T-One + LM | Whisper |
|---|---:|---:|---:|---:|
| Open Datasets | 3,0 | 2,6 | 5,7 | 12,0 |
| Golos Farfield | 4,5 | 3,9 | 12,2 | 16,7 |
| Natural Speech | 7,8 | 6,9 | 14,5 | 13,6 |
| Disordered Speech | 20,6 | 19,2 | 51,0 | 59,3 |
| Callcenter | 10,3 | 9,5 | 13,5 | 23,9 |
| Media | 9,2 | 8,4 | 19,4 | 25,1 |

Rendimiento en tiempo real (RTF, factor de velocidad) declarado por el autor de la conversión:

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 88× |
| Apple M4 Max | CPU | 25× |
| AMD Ryzen 4750U | Vulkan | 22× |
| AMD Ryzen 4750U | CPU | 8× |

## Requisitos de hardware

- VRAM/RAM estimada: entre 849 MB (F32) y 175 MB (Q4_K_M) de pesos; el consumo real añade el buffer de audio y el estado del decoder, por lo que con 1 GB de memoria libre se cubre cualquier cuantización.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Para aceleración, cualquier GPU con soporte Metal (Apple Silicon) o Vulkan (AMD, Intel, NVIDIA) es suficiente dado el tamaño del modelo.
- Cabe en cualquier GPU de consumo y en placas integradas; también en Raspberry Pi y dispositivos similares con la cuantización Q4_K_M.
- Despliegue: exclusivamente mediante transcribe.cpp (compilación con CMake y binario `transcribe-cli`). No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, ya que es un modelo ASR y no un LLM.
- Latencia y throughput: RTF de 88× en Metal (M4 Max), 25× en CPU (M4 Max), 22× en Vulkan (Ryzen 4750U) y 8× en CPU (Ryzen 4750U); es decir, procesa audio entre 8 y 88 veces más rápido que tiempo real según plataforma.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | WER ruso (referencia) | Licencia | Formato |
|---|---|---:|---|---|---|
| GigaAM-v3-e2e-rnnt (esta conversión) | ~222 M | ≤25 s por utterance | 5,35 % (FLEURS ru, medido aquí) | MIT | GGUF |
| GigaAM-v3 V3_RNNT (base) | ~220-240 M | ≤25 s | 8,4 % media multi-dominio (upstream) | MIT | pesos originales |
| T-One + LM | no disponible | no disponible | 19,4 % media multi-dominio (upstream) | no disponible | no disponible |
| Whisper (large-v3) | no disponible en la información | 30 s | 25,1 % media multi-dominio (upstream) | no disponible en la información | no disponible |

La comparación con T-One y Whisper procede de la tabla del modelo base publicada por ai-sage; no se dispone de sus especificaciones completas en la información proporcionada. En la comparación end-to-end de `e2e_ctc` y `e2e_rnnt` frente a Whisper-large-v3 con Gemini 2.5 Pro como juez, los modelos GigaAM-v3 ganan por un margen medio de 70:30 según la model card upstream.

## Limitaciones y advertencias

- Solo ruso: no transcribe otros idiomas ni traduce; la detección de idioma no está soportada.
- Solo audio corto: utterances de más de 25 s se rechazan o se truncan; es necesario segmentar el audio previamente.
- No es streaming: requiere el audio completo antes de empezar a decodificar, lo que impide su uso en dictado en vivo sin un pipeline de segmentación propio.
- Decodificación greedy sin modelo de lenguaje externo: puede producir errores en nombres propios, siglas y términos técnicos que un sistema con LM corregiría.
- Riesgo de alucinación en audio con ruido extremo o silencios largos, comportamiento habitual en transducers ASR.
- Sesgos: el modelo base se entrenó con datos rusos internos de Sber; puede tener peor rendimiento en variantes dialectales o registros poco representados.
- Dependencia de un runtime concreto: solo funciona con transcribe.cpp; no hay integración con ecosistemas como Whisper.cpp, faster-whisper o Hugging Face Transformers para este fichero GGUF.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: la conversión no tiene validación comunitaria independiente más allá de la del autor.
- Licencia MIT heredada del modelo base; conviene revisar la model card upstream para los términos completos, aunque MIT permite uso comercial.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/GhaythMahadin/gigaam-v3-e2e-rnnt-gguf
- Modelo base: https://huggingface.co/ai-sage/GigaAM-v3
- Commit del modelo base usado: https://huggingface.co/ai-sage/GigaAM-v3/commit/ec1dc1f
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/42b96d9
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/gigaam-v3-e2e-rnnt.md
- Repositorio oficial de GigaAM: https://github.com/salute-developers/GigaAM
- Métricas de evaluación de GigaAM: https://github.com/salute-developers/GigaAM/blob/main/evaluation.md
- Paper referenciado (arXiv:2506.01192): https://arxiv.org/abs/2506.01192
