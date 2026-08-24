# LyngualLabs/yecs-asr-whisper-plain

## Resumen

`LyngualLabs/yecs-asr-whisper-plain` es un modelo de reconocimiento automático del habla (ASR) desarrollado por LyngualLabs, un laboratorio de investigación centrado en tecnologías del habla para comunidades de bajos recursos. Se trata de un fine-tune de `openai/whisper-small` (244 millones de parámetros) sobre el corpus YECS (Yoruba-English Code-Switching), un conjunto de datos de 120 horas de audio con habla que alterna entre yoruba e inglés. El modelo está diseñado para transcripción directa sin etiquetas de idioma, y sirve como control en un estudio A/B que compara la inyección de etiquetas de idioma por palabra frente a un enfoque plano.

La relevancia de este modelo radica en su contribución al ASR para lenguas africanas de bajos recursos, donde la disponibilidad de sistemas robustos es escasa. Con una licencia Apache-2.0 y un tamaño compacto, puede desplegarse en hardware de consumo, lo que facilita su adopción en entornos con recursos limitados. El modelo alcanza un WER del 16,73 % (sensible a tonos) en el conjunto de test de YECS, superando al baseline reportado de whisper-small-yoruba (20,76 %).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper-small (encoder-decoder transformer) |
| Parametros totales | 241.734.912 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 30 segundos de audio (ventana fija de Whisper) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente bf16/fp32) |
| Idiomas soportados | yoruba (yo), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Whisper-small de OpenAI, un transformer encoder-decoder con atención estándar, entrenado originalmente sobre 680.000 horas de audio multilingüe supervisado. Para este fine-tune, se utilizó el corpus YECS, compuesto por 80.013 utterances de entrenamiento (~95,6 horas) de habla leída o guionizada con code-switching yoruba-inglés. El entrenamiento se realizó durante 5 épocas con una tasa de aprendizaje de 1e-5, precisión bf16, batch efectivo de 32 y una GPU H200. Se aplicó condicionamiento de idioma fijo (`yoruba`) y tarea `transcribe`. No se emplearon técnicas de RLHF ni DPO; es un fine-tuning supervisado estándar. La selección del mejor checkpoint se hizo por WER en el conjunto de desarrollo.

## Capacidades

- Transcripción de audio en yoruba e inglés, incluyendo alternancia de código (code-switching) dentro de una misma frase.
- Reconocimiento de tonos en yoruba (diacríticos agudo, grave y macrón) con preservación de la ortografía fonémica (ọ, ẹ, ṣ).
- Generación de transcripciones con normalización de texto (NFC, minúsculas, eliminación de puntuación Unicode).
- No soporta tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo de ASR.
- Capacidad multilingüe limitada a dos idiomas (yoruba e inglés), sin cobertura de otros idiomas.
- No incluye capacidades de visión ni audio adicionales más allá de la entrada de audio de 16 kHz.

## Casos de uso

- Transcripción de entrevistas y testimonios en comunidades yoruba-hablantes: el modelo puede procesar audio de campo con code-switching, generando texto útil para investigación sociolingüística o periodismo.
- Subtitulado automático de vídeos educativos o religiosos en yoruba-inglés: su ventana de 30 segundos y baja latencia permiten integrarse en pipelines de postproducción.
- Atención al cliente en centros de llamadas bilingües: al manejar alternancia de idioma, puede transcribir conversaciones mixtas para análisis de calidad o generación de actas.
- Asistentes de voz para aplicaciones móviles en África occidental: su tamaño compacto (244M) permite ejecutarlo en dispositivos con GPU modesta o en servidores de bajo coste.
- Investigación en ASR de bajos recursos: sirve como baseline reproducible para comparar técnicas de mejora, como la inyección de etiquetas de idioma (véase el modelo hermano `yecs-asr-whisper-lid`).
- Archivado y digitalización de material de audio histórico en yoruba: la normalización de texto y la preservación de tonos facilitan la creación de corpus anotados.

## Benchmarks y rendimiento

Resultados en el conjunto de test de YECS (9.905 utterances), según la model card del autor:

| Metrica | Este modelo | whisper-small-yoruba (reportado) |
|---|---|---|
| WER (sensible a tonos) | 16,73 % | 20,76 % |
| WER (insensible a tonos) | 13,86 % | no disponible |
| CER (sensible a tonos) | 6,38 % | no disponible |
| CER (insensible a tonos) | 5,10 % | no disponible |

No se han publicado resultados comparativos con otros modelos como MMS o Omnilingual en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~1-2 GB en fp16/bf16 (244M parámetros, más overhead de activaciones). Cabe en GPUs consumer con 4 GB o más.
- GPUs recomendadas: NVIDIA RTX 3060, RTX 4090, A10, A100, H100. También funciona en CPU con cuantización (aunque más lento).
- Opciones de despliegue: `transformers` (Python), `whisper.cpp` (inferencia en CPU/GPU ligera), `Ollama` no es aplicable (no es un modelo de lenguaje). Se puede servir mediante API con `TGI` o `vLLM` si se adapta, aunque no es el flujo habitual para Whisper.
- Latencia estimada: para un audio de 10 segundos, en una RTX 4090 se espera una transcripción en menos de 1 segundo; en CPU puede tardar varios segundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (YECS test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yecs-asr-whisper-plain` (este) | 244M | 30 s | 16,73 % (tone-aware) | Apache-2.0 | HuggingFace |
| `openai/whisper-small` (base) | 244M | 30 s | no reportado en YECS | MIT | HuggingFace |
| `whisper-small-yoruba` (reportado) | 244M | 30 s | 20,76 % (tone-aware) | no especificado | no disponible |

No se dispone de datos de otros modelos comparables (p. ej., MMS o Omnilingual) en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con habla leída o guionizada del corpus YECS; el rendimiento puede degradarse significativamente con audio de campo lejano, ruidoso o conversacional espontáneo.
- Solo cubre dos idiomas (yoruba e inglés); no soporta otros idiomas ni dialectos cercanos.
- Riesgo de alucinación en segmentos de audio ambiguos o de baja calidad, especialmente en ausencia de habla clara.
- La licencia Apache-2.0 se hereda de Whisper-small, pero los términos del corpus YECS se aplican a los datos de entrenamiento; es necesario revisar las condiciones de uso del corpus para fines comerciales.
- No incluye mecanismos de desambiguación de hablantes ni diarización; es únicamente transcripción.
- La normalización de texto elimina puntuación, lo que puede no ser adecuado para aplicaciones que requieran puntuación completa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LyngualLabs/yecs-asr-whisper-plain
- Modelo hermano con inyección de etiquetas de idioma: https://huggingface.co/LyngualLabs/yecs-asr-whisper-lid
- Otros modelos relacionados: https://huggingface.co/LyngualLabs/yecs-asr-ctc-lid · https://huggingface.co/LyngualLabs/yecs-asr-llm-lid
- Repositorio de código y benchmark: https://github.com/osinkolu/yecs-asr-benchmark
- Página del corpus YECS: https://www.lynguallabs.org/yecs
- Organización LyngualLabs en HuggingFace: https://huggingface.co/LyngualLabs/models
- Sitio web de LyngualLabs: https://www.lynguallabs.org/
