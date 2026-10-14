# kinit/whisper-base-sk

## Resumen

kinit/whisper-base-sk es un ajuste fino completo (*full fine-tuning*) del modelo openai/whisper-base para reconocimiento automático del habla (ASR) en eslovaco. Lo desarrolla el equipo del Kempelen Institute of Intelligent Technologies (KInIT), que ha publicado una colección completa con los seis tamaños de Whisper adaptados al eslovaco. Con 72.593.920 parámetros (~73 M) y una arquitectura encoder-decoder de tipo transformer, mantiene intacta la topología original de Whisper y solo modifica los pesos mediante entrenamiento supervisado sobre un corpus interno de habla eslovaca.

El problema que resuelve es la falta de ASR de calidad en eslovaco: el modelo base de OpenAI obtiene un WER del 87,61 % en Common Voice 24 y un 76,38 % en el conjunto interno de KInIT, cifras que lo hacen inutilizable en producción. Tras el ajuste fino, el WER baja al 27,22 % y al 14,01 % respectivamente, lo que supone reducciones del 69 % y del 82 %. El coste de esa mejora es la pérdida total de capacidad multilingüe (olvido catastrófico), ya que el modelo solo transcribe eslovaco correctamente.

Es relevante ahora por tres motivos: es una alternativa de licencia Apache 2.0 sin restricciones comerciales, cabe en cualquier hardware (0,3 GB de repositorio) y forma parte de un catálogo público de recursos NLP eslovacos (SLAIH) con evaluación homogénea frente a los demás tamaños de Whisper y frente a los ajustes de NVIDIA NeMo (Canary, Parakeet). El modelo acumula 23 descargas y 0 likes en HuggingFace, por lo que su adopción todavía es muy baja.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Whisper encoder-decoder (transformer secuencia a secuencia) |
| Parámetros totales | 72.593.920 (~73 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio por segmento sin chunking (máximo fiable indicado por el autor); límite de tokens del decodificador no indicado en la model card |
| Tipos de cuantización | No especificados por el autor; pesos distribuidos en safetensors (el repositorio no incluye variantes GGUF, int8 ni cuantizaciones publicadas) |
| Idiomas soportados | Eslovaco (sk) únicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (compatible con transformers) |
| Modelo base | openai/whisper-base |
| Método de ajuste | Full fine-tuning (todos los parámetros) |
| Tarea (pipeline) | automatic-speech-recognition |
| Tamaño del repositorio | 0,3 GB |
| Fecha de creación | 2026-08-20 |
| Última actualización | 2026-10-13 |
| Descargas / likes | 23 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper Base sin modificaciones: un encoder transformer que consume espectrogramas log-mel de 80 canales y un decoder autorregresivo que genera texto, con atención cruzada entre ambos. No hay innovaciones estructurales (ni MoE, ni SSM, ni atención lineal); la contribución está íntegramente en los pesos. El ajuste se realizó con `Seq2SeqTrainer` de HuggingFace Transformers en el clúster HPC Devana, con 2 épocas, learning rate de 5e-5, scheduler lineal con warmup, optimizador AdamW, batch efectivo de 64 y precisión fp16.

El corpus de entrenamiento es interno y combina datos públicos con grabaciones propias de KInIT: SloPalSpeech, grabaciones de sesiones de plenos municipales, literatura leída, Mozilla Common Voice 24.0, el corpus de conferencias TEDxSK y JumpSK (KEMT NLP, TUKE), FLEURS y grabaciones internas de KInIT. Los datos con información personal se anonimizaron antes del uso y las muestras se filtraron por calidad mediante un umbral de CER validado contra varios modelos ASR. La innovación técnica destacable es la aumentación de ruido aplicada en el 75 % de los batches durante el entrenamiento, con cinco tipos de degradación sintética (ruido telefónico, habla de fondo, ruido de fondo, ruido blanco y pérdida de paquetes), orientada a mejorar la robustez en condiciones de grabación reales. No se documenta uso de RLHF, DPO ni destilación.

## Capacidades

- Transcripción de voz a texto en eslovaco estándar, tanto en lectura como en habla espontánea (plenos municipales, conferencias).
- Robustez a ruido de fondo y a degradaciones de canal gracias a la aumentación con ruido telefónico, habla de fondo, ruido blanco y pérdida de paquetes.
- Procesamiento por lotes (*batch*) y fuera de línea, apto para pipelines de transcripción masiva.
- Segmentación de audio largo mediante las utilidades de chunking del pipeline de Whisper (la arquitectura se conserva, aunque el autor no documenta explícitamente marcas de tiempo).
- Despliegue ligero: 73 M de parámetros permiten inferencia en CPU y en GPUs de gama de entrada.
- No soporta *tool calling* ni *function calling*.
- No soporta razonamiento multi-paso ni flujos de agente; es un modelo puramente secuencia a secuencia.
- No tiene modo de razonamiento (*thinking mode*), ni capacidades de visión, audio-vision ni generación de audio.
- No es multilingüe: solo transcribe eslovaco.

## Casos de uso

- Transcripción de plenos municipales y sesiones administrativas: el corpus de entrenamiento incluye grabaciones de este tipo, por lo que el dominio está cubierto; se procesaría el audio por bloques de hasta 30 segundos con solape para reconstruir la sesión completa.
- Subtitulado de charlas y contenido divulgativo: el modelo se entrenó con TEDxSK y JumpSK, de modo que el registro de conferencia está bien representado; se integraría en el pipeline de post-producción generando subtítulos con marcas temporales y revisión humana posterior.
- Indexación y búsqueda de archivos sonoros en medios de comunicación o radios públicas: transcripción masiva por lotes en CPU para alimentar un índice de texto sobre audio histórico en eslovaco, donde el coste por hora de audio es mínimo al ser un modelo de 73 M.
- Accesibilidad en tiempo real para personas sordas: con troceado (*chunking*) y solape, el modelo puede generar subtítulos en vivo en eslovaco; su tamaño permite ejecución local sin depender de APIs externas.
- Entrada de voz para aplicaciones y asistentes en eslovaco: dictado en aplicaciones móviles o de escritorio con inferencia en el propio dispositivo, al caber en menos de 150 MB en fp16.
- Preprocesado de datos para otros sistemas NLP: transcripción de entrevistas, encuestas o corpus orales para alimentar modelos de resumen, análisis de sentimiento o clasificación de temas en eslovaco.
- Ajuste fino adicional para un dominio concreto: al ser un modelo pequeño y de licencia Apache 2.0, es una base barata para especializar en terminología médica, legal o técnica eslovaca con pocos cientos de horas de audio.
- Transcripción asistida en entornos clínicos o legales: únicamente con revisión humana obligatoria, tal como advierte el propio autor para usos críticos de seguridad, y prestando atención al WER del 27,22 % en Common Voice, que limita la exactitud literal.
- Prototipado y evaluación de sistemas de diarización o *speaker ID*: sirve como componente ASR de bajo coste en experimentos donde el objetivo no es la transcripción perfecta sino el habla segmentada.

## Benchmarks y rendimiento

Resultados publicados por el autor. WER y CER, menor es mejor.

| Modelo | CV24 WER | CV24 CER | Interno WER | Interno CER |
|---|---:|---:|---:|---:|
| kinit/whisper-base-sk | 27,22 % | 9,78 % | 14,01 % | 6,32 % |
| openai/whisper-base | 87,61 % | 28,50 % | 76,38 % | 31,53 % |

CV24 = split de test de Common Voice 24.0 (5.239 muestras, público). Interno = conjunto reservado de KInIT (9.317 muestras, estratificado por dominio y género del hablante, un tercio limpio y dos tercios con aumentación de ruido, no público).

Comparativa entre tamaños de Whisper, todos ajustados por KInIT sobre el mismo conjunto interno:

| Modelo | WER ajustado | WER base |
|---|---:|---:|
| Whisper Large v3 | 5,67 % | 16,22 % |
| Whisper Large v3 Turbo | 5,60 % | 18,35 % |
| Whisper Medium | 6,28 % | 29,19 % |
| Whisper Small | 8,64 % | 47,90 % |
| Whisper Base | 14,01 % | 76,38 % |
| Whisper Tiny | 20,04 % | 99,47 % |

No se han publicado métricas de latencia, throughput ni consumo de memoria en la información disponible.

## Requisitos de hardware

- Tamaño de pesos: ~290 MB en fp32, ~145 MB en fp16, ~73 MB en int8 (estimación a partir de los 72,6 M de parámetros).
- VRAM estimada para inferencia con transformers en fp16: por debajo de 1 GB incluyendo activaciones y buffers de audio; en CPU es perfectamente viable.
- GPU recomendadas: cualquier GPU moderna sirve; desde una GTX 1650 o RTX 3060 de gama de entrada hasta A100 o H100, donde el modelo estará limitado por el ancho de banda de E/S del audio y no por el cómputo.
- Sí cabe en GPU de consumo: RTX 3090, RTX 4090, RTX 4060, portátiles con GPU discreta e incluso iGPU recientes; también en Raspberry Pi y dispositivos móviles con implementaciones optimizadas.
- Opciones de despliegue: `pipeline("automatic-speech-recognition")` de transformers (ruta documentada por el autor), y previa conversión, CTranslate2/faster-whisper o whisper.cpp para inferencia CPU/GPU optimizada. No se documenta soporte nativo en vLLM, TGI ni Ollama para esta conversión concreta.
- Latencia y throughput: no disponibles en la model card.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | WER interno (ajustado) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| kinit/whisper-base-sk | ~73 M | Solo eslovaco | 14,01 % | Apache 2.0 | HuggingFace (kinit) |
| kinit/whisper-small-sk | ~244 M | Solo eslovaco | 8,64 % | Apache 2.0 | HuggingFace (kinit) |
| kinit/whisper-medium-sk | ~769 M | Solo eslovaco | 6,28 % | Apache 2.0 | HuggingFace (kinit) |
| kinit/whisper-large-v3-turbo-sk | ~809 M | Solo eslovaco | 5,60 % | Apache 2.0 | HuggingFace (kinit) |
| openai/whisper-base | ~73 M | Multilingüe (99 idiomas) | 76,38 % | Apache 2.0 | HuggingFace (OpenAI) |

El WER interno corresponde al conjunto reservado de KInIT y procede de la propia model card, por lo que la comparación entre tamaños es homogénea, pero no es directamente comparable con resultados publicados por terceros. Los tamaños de parámetros de Small, Medium y Large v3 Turbo corresponden a las configuraciones estándar de OpenAI. La colección completa de KInIT incluye además ajustes con NVIDIA NeMo (Canary, Parakeet) que no se detallan en la información disponible.

## Limitaciones y advertencias

- Olvido catastrófico documentado: el ajuste exclusivo en eslovaco degrada gravemente el rendimiento en cualquier otro idioma. Para transcripción multilingüe hay que usar openai/whisper-base.
- WER del 27,22 % en Common Voice 24: en audio espontáneo y con acentos variados la tasa de error es alta; el modelo es más fiable en el dominio interno de KInIT (14,01 %) que en habla general.
- Degradación esperada en habla con acento fuerte, dialectal o terminología de dominio no representada en el corpus de entrenamiento.
- Límite de 30 segundos por segmento sin chunking; audios más largos requieren segmentación explícita y pueden introducir errores en las fronteras.
- Riesgo de alucinación inherente a los modelos Whisper en segmentos con silencio prolongado, ruido extremo o solapamiento de voces; conviene aplicar umbrales de confianza y detección de repeticiones.
- Sesgo de dominio: el corpus de entrenamiento está compuesto por lectura de literatura, plenos municipales, conferencias TEDx y Common Voice, lo que puede favorecer el habla formal o leída frente a registros coloquiales.
- No apto para transcripción crítica de seguridad sin revisión humana, tal como indica el propio autor.
- Excluido su uso con audio no eslovaco: no es un modelo multilingüe ni traduce.
- Aunque la licencia Apache 2.0 permite uso comercial sin restricciones, el conjunto de evaluación interno y parte de los datos de entrenamiento no son públicos, por lo que no es posible reproducir completamente las cifras de WER publicadas.
- Adopción muy baja (23 descargas, 0 likes) y ausencia de variantes cuantizadas publicadas por el autor, lo que implica trabajo adicional de conversión para despliegues optimizados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kinit/whisper-base-sk
- Modelo base: https://huggingface.co/openai/whisper-base
- Colección ASR de KInIT: https://huggingface.co/collections/kinit/automatic-speech-recognition-6a42684efb87315cc9da3247
- Ficha en el catálogo SLAIH: https://www.slaih.sk/sk/catalog/whisper-base-sk
- Dataset SloPalSpeech: https://huggingface.co/datasets/NaiveNeuron/SloPalSpeech
- Mozilla Common Voice 24.0: https://huggingface.co/datasets/mozilla-foundation/common_voice_24_0
- FLEURS: https://huggingface.co/datasets/google/fleurs
- Corpus TEDxSK y JumpSK (KEMT NLP, TUKE): https://nlp.kemt.fei.tuke.sk/speech/tedx
- Documentación del clúster HPC Devana: https://userdocs.hpc.sav.sk/devana/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Nota: la búsqueda web realizada no devolvió enlaces relevantes sobre este modelo (los resultados correspondían a Discogs y no guardan relación con el contenido de la ficha).
