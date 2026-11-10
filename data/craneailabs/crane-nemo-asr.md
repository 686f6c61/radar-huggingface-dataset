# CraneAILabs/crane-nemo-asr

## Resumen

Crane Nemo ASR es un modelo de reconocimiento automático del habla (ASR) en streaming desarrollado por CraneAI Labs, especializado en tres lenguas africanas —luganda (`lg`), shona (`sn`) y suajili (`sw`)— manteniendo además el inglés (`en`). Se trata de un ajuste fino del modelo `nvidia/nemotron-3.5-asr-streaming-0.6b`, un FastConformer con transducer RNN-T y atención cache-aware de aproximadamente 600 millones de parámetros. El modelo transcribe habla conversacional y leída en tiempo real y se condiciona mediante un prompt de identificación de idioma.

Su relevancia radica en que el modelo base resulta prácticamente inutilizable en estas lenguas: parte de un WER cercano al 100 % (luganda 99,7 %, shona 101,0 %, suajili 102,5 %). El ajuste fino lo reduce a 33,8 %, 37,7 % y 27,5 % respectivamente, con tasas de error de carácter (CER) en torno al 8 % en las tres lenguas. Esto convierte al modelo en una línea base desplegable y realista para ASR en lenguas bantúes con recursos limitados.

El modelo se distribuye con licencia OpenMDW-1.1, heredada del modelo base, y está pensado tanto para transcripción de baja latencia en producción como para servir de punto de partida para nuevos ajustes finos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer Cache-Aware RNN-Transducer (encoder Conformer + red de predicción + red conjunta) |
| Parámetros totales | ~600 M (modelo base); ~331 M entrenables en el ajuste fino |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; streaming cache-aware con contexto de atención `[56, 13]` (~1,12 s de lookahead) |
| Tipos de cuantización | no disponible; la inferencia en streaming cache-aware es solo fp32 |
| Idiomas soportados | luganda (`lg`), shona (`sn`), suajili (`sw`), inglés (`en`) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | NeMo (`.nemo`); repositorio de 2,6 GB |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura FastConformer con transducer RNN-T y atención cache-aware, lo que permite decodificación en streaming con un lookahead de aproximadamente 1,12 segundos (contexto de atención `[56, 13]`). El ajuste fino fue parameter-efficient: el encoder se congeló salvo sus 12 capas superiores, que se entrenaron junto con la red de predicción y la red conjunta, sumando unos 331 millones de parámetros entrenables.

El entrenamiento usó el optimizador 8-bit AdamW con tasa de aprendizaje `1.2e-4`, programación coseno con 200 pasos de warmup, 6.000 pasos en precisión fp32 y una única GPU NVIDIA Tesla T4 de 16 GB. Los datos de entrenamiento provienen de corpus abiertos de habla africana, con aproximadamente 13,7 h de luganda, 15,8 h de shona, 9,2 h de suajili y 2,0 h de inglés (incluido para retener el rendimiento en esta lengua). La decodificación y la inferencia se realizan en fp32 con `target_lang=auto`.

## Capacidades

- Reconocimiento automático del habla en luganda, shona, suajili e inglés.
- Transcripción en streaming de baja latencia gracias a la atención cache-aware.
- Condicionamiento por prompt de identificación de idioma (`target_lang`), con detección automática recomendada.
- Manejo de habla conversacional y habla leída.
- Salida de transcripciones de texto plano; no se documentan capacidades de puntuación o diarización.
- No se documentan tool calling, capacidades de agente, visión ni audio más allá del ASR.

## Casos de uso

- Subtitulado y transcripción en tiempo real de emisiones de radio o televisión en suajili, luganda o shona: el modo streaming cache-aware con ~1,12 s de lookahead permite generar subtítulos con latencia aceptable.
- Asistentes de voz para atención al ciudadano en la región de África Oriental: el modelo transcribe consultas habladas en suajili o luganda que después pueden procesarse con un LLM para respuestas automatizadas.
- Indexación y búsqueda de archivos de audio: transcripción por lotes de grabaciones de reuniones, entrevistas o programas para hacerlas buscables por texto.
- Documentación de lenguas de bajos recursos: servir como línea base para proyectos lingüísticos y de preservación que necesiten transcripciones iniciales que luego se corrijan manualmente.
- Punto de partida para ajustes finos adicionales: al ser un modelo pequeño (~600 M) entrenado con técnicas parameter-efficient, puede reajustarse en hardware modesto (una T4 de 16 GB) para nuevas lenguas o dominios.
- Prototipado de aplicaciones de voz en entornos con recursos limitados: su tamaño y su entrenamiento en una sola T4 lo hacen viable en infraestructura de gama baja.
- Transcripción bilingüe suajili-inglés en contextos educativos o de negocios donde se alternan ambas lenguas.

## Benchmarks y rendimiento

Evaluación sobre un conjunto congelado de 50 clips por lengua (excluidos del entrenamiento por ID de enunciado y de hablante). WER y CER calculados con normalización compartida (NFKC, minúsculas, sin puntuación, espacios colapsados) mediante `jiwer`. La columna Gemini es una puntuación de preservación de significado de 1 a 5 (LLM-as-judge).

| Idioma | CER ↓ | WER ↓ | Gemini (1–5) ↑ |
|---|---:|---:|---:|
| Luganda (`lg`) | 8,2 % | 33,8 % | 4,90 |
| Shona (`sn`) | 8,1 % | 37,7 % | 4,45 |
| Suajili (`sw`) | 8,1 % | 27,5 % | 4,15 |
| Inglés (`en`) | 3,2 % | 7,4 % | 4,95 |

Punto de partida del modelo base en las mismas lenguas africanas: WER de 99,7 % (luganda), 101,0 % (shona) y 102,5 % (suajili), con CER del 59–76 %. En inglés, el modelo base pasa de 10,4 % a 7,4 % de WER y de 6,1 % a 3,2 % de CER tras el ajuste fino.

## Requisitos de hardware

- El modelo base ocupa aproximadamente 600 M de parámetros; el repositorio pesa 2,6 GB.
- El ajuste fino se realizó en una única NVIDIA Tesla T4 de 16 GB, lo que indica que la inferencia cabe holgadamente en GPU de consumo.
- La inferencia en streaming cache-aware es solo fp32, lo que condiciona el uso de memoria y descarta cuantizaciones para ese modo.
- GPU recomendadas: Tesla T4, RTX 3090/4090 o superiores para producción; cualquier GPU con al menos ~4–6 GB de VRAM para inferencia fp32 del modelo completo.
- Despliegue mediante NVIDIA NeMo (`nemo.collections.asr`), con el script `examples/asr/asr_cache_aware_streaming/speech_to_text_cache_aware_streaming_infer.py` para streaming.
- No se documentan cifras de latencia o throughput más allá del lookahead de ~1,12 s del modo streaming.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | WER (suajili) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Crane Nemo ASR | ~600 M | lg, sn, sw, en | 27,5 % | OpenMDW-1.1 | Hugging Face |
| nvidia/nemotron-3.5-asr-streaming-0.6b (base) | ~600 M | en (y multilingüe limitado) | ~102,5 % | OpenMDW-1.1 | Hugging Face |
| Alternativas ASR para lenguas africanas | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con otros modelos ASR especializados en lenguas bantúes no está disponible en la información proporcionada; el único punto de referencia documentado es el modelo base, sobre el que el ajuste fino supone una mejora drástica en las tres lenguas africanas.

## Limitaciones y advertencias

- El encoder está en gran medida congelado, por lo que acústicas muy fuera de dominio (grabaciones de campo ruidosas, micrófonos lejanos, code-switching intenso) solo se manejan parcialmente.
- Los resultados se basan en 50 clips por lengua: son orientativos y no constituyen un benchmark a gran escala.
- La inferencia en streaming cache-aware es exclusivamente fp32.
- El mejor resultado se obtiene con el prompt de idioma en detección automática; luganda y shona no tienen ranura de prompt dedicada.
- No está validado para transcripción en contextos críticos de seguridad, médicos o legales.
- Riesgo de alucinación y de errores en morfología aglutinante: el WER elevado en lenguas bantúes refleja en parte convenciones de frontera de palabra, por lo que conviene revisar la salida en producción.
- La licencia OpenMDW-1.1 impone sus propios términos de uso; es necesario revisarlos antes de un uso comercial.
- No se documentan sesgos específicos más allá de los derivados de los corpus de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CraneAILabs/crane-nemo-asr
- Modelo base: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Herramienta de evaluación `jiwer`: https://github.com/jitsi/jiwer
