# cstr/inworld-voice-isolator-GGUF

## Resumen

Inworld Voice Isolator v1 es un modelo de separación de voz (voice isolation) desarrollado originalmente por Inworld AI, publicado bajo licencia Apache-2.0. Su función es aislar la voz humana del ruido de fondo en grabaciones de audio, produciendo dos pistas separadas: voz limpia y fondo residual, ambas a 48 kHz mono. El modelo base es `inworld/voice-isolator`, y esta ficha describe la conversión a formato GGUF realizada por el usuario `cstr` para su uso con el runtime nativo ggml de CrispASR.

La relevancia de esta conversión radica en que permite ejecutar el modelo fuera de los frameworks de deep learning convencionales, en un runtime ligero basado en ggml, con cuantizaciones que reducen el peso del modelo y facilitan su despliegue en entornos con recursos limitados. El modelo tiene 64.047.112 parámetros (aproximadamente 64 M) y el repositorio ocupa 0,6 GB.

La conversión incluye dos variantes funcionales: una offline (no causal) y una realtime (causal, con look-ahead configurable de 0, 2 o 4 muestras), lo que permite elegir entre máxima calidad de separación y procesamiento en tiempo real con latencia controlada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de separación de voz con encoders por banda y cabezas de decodificación; detalles arquitectónicos del modelo base no especificados) |
| Parametros totales | 64.047.112 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; procesa ventanas de audio, no tokens de texto) |
| Tipos de cuantizacion | F16, Q8_0, Q4_K (backbone); encoders por banda y cabezas de decodificación permanecen en precisión original |
| Idiomas soportados | no disponible (procesamiento de audio independiente del idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base `inworld/voice-isolator` en la información proporcionada. La model card de la conversión menciona que el modelo emplea encoders por banda (per-band encoders) y cabezas de decodificación (decoder heads), y que en los archivos cuantizados estas partes se mantienen en la precisión del modelo original mientras que el backbone se cuantiza. Esto sugiere una arquitectura de procesamiento espectral por bandas de frecuencia, habitual en modelos de separación de fuentes y mejora de voz.

La conversión GGUF se realizó desde el checkpoint `denoiser.safetensors` del modelo base (revisión `9b0285b3fe8403aa8e2f1dbb2165a80a4294c970`), usando el código de inferencia `inworld-ai/voice-isolator@c73b3fab`. Se generaron dos familias de checkpoints: offline (no causal, mayor calidad) y realtime (causal, con look-ahead de 0, 2 o 4 muestras). No se dispone de información sobre el dataset de entrenamiento, el número de tokens o muestras de audio utilizadas, ni sobre si se aplicaron técnicas de RLHF o ajuste fino.

## Capacidades

- Separación de voz y fondo en audio mono a 48 kHz, generando dos pistas de salida: voz aislada y fondo residual.
- Modo offline (no causal) para máxima calidad de separación en procesamiento por lotes.
- Modo realtime (causal) con look-ahead configurable (0, 2 o 4 muestras) para aplicaciones de baja latencia.
- Procesamiento de audio independiente del idioma (no requiere transcripción ni modelo de lenguaje).
- Integración con el runtime CrispASR mediante el backend `voice-isolator`.
- Ejecución mediante línea de comandos (`crispasr --separate`) y mediante servidor HTTP (`POST /v1/audio/separation`).
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada distinto de voz o modo thinking; estas capacidades no aplican a un modelo de separación de audio.

## Casos de uso

- Limpieza de grabaciones de podcast o entrevistas: el modelo aísla la voz del interlocutor del ruido ambiental, reverberación o música de fondo, generando una pista de voz limpia a 48 kHz apta para postproducción.
- Preprocesado para sistemas ASR: ejecutar `crispasr --separate` antes de la transcripción elimina ruido de fondo y mejora la precisión de reconocimiento en entornos ruidosos, gracias a la salida de voz aislada en un formato directamente consumible.
- Videoconferencia y telefonía en tiempo real: la variante realtime con look-ahead de 0 o 2 muestras permite suprimir ruido de fondo en flujos de audio en vivo con latencia controlada.
- Producción audiovisual y doblaje: separar voz y fondo permite reeditar diálogos, sustituir música o aplicar procesado de voz independiente sin re-grabar el audio original.
- Archivística y restauración de audio: recuperar voz inteligible en grabaciones históricas o de campo con ruido de fondo, generando pistas separadas para su conservación y análisis.
- Servicio de separación como API: desplegar `crispasr --server` con `--separate-model` para ofrecer un endpoint `POST /v1/audio/separation` en una infraestructura propia, con pesos GGUF ligeros (0,6 GB de repositorio) y licencia Apache-2.0 para uso comercial.
- Creación de datasets de voz: aislar voz limpia de grabaciones ruidosas para construir corpus de entrenamiento de modelos de voz o ASR, con la ventaja de que el modelo no depende del idioma.

## Benchmarks y rendimiento

La model card proporciona métricas de fidelidad de la conversión GGUF respecto a la salida F32 del modelo original, medidas como SI-SDR de voz (voice SI-SDR vs upstream F32 output). No son benchmarks de calidad de separación absoluta, sino de degradación introducida por la cuantización.

| Archivo | Checkpoint | Pesos | Voice SI-SDR vs salida F32 original |
|---|---|---|---|
| voice-isolator-f16.gguf | offline | F16 | 52,4 dB |
| voice-isolator-q8_0.gguf | offline | Q8_0 backbone | 44,3 dB |
| voice-isolator-q4_k.gguf | offline | Q4_K backbone | 26,3 dB |
| voice-isolator-realtime-f16.gguf | realtime (causal, look-ahead 0/2/4) | F16 | 56,2 dB (forward causal de 3 s) |
| voice-isolator-realtime-q8_0.gguf | realtime | Q8_0 backbone | 46,7 dB |

No se han publicado resultados de benchmarks de calidad de separación (SI-SDR, SDR, PESQ, etc.) frente a otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 64 M de parámetros, el modelo es muy ligero. En F16 los pesos ocupan aproximadamente 128 MB; en Q8_0, unos 64 MB; en Q4_K, unos 32 MB (estimación a partir del número de parámetros; no confirmada en la información disponible).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM libre es suficiente; no se requiere A100 ni H100. Una RTX 4090 o GPUs de gama media-baja son más que suficientes.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: runtime CrispASR con backend `voice-isolator` (CLI `crispasr --separate` y servidor `crispasr --server` con `--separate-model`). No se mencionan otros runtimes (llama.cpp, Ollama, vLLM, TGI) compatibles con este modelo.
- Latencia y throughput: no disponibles. La variante realtime está diseñada para flujos causales con look-ahead de 0, 2 o 4 muestras, lo que sugiere latencia muy baja, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Los modelos de separación de voz habituales (por ejemplo, Demucs, MDX-Net o separadores de habla como SepFormer) no aparecen mencionados ni comparados en la model card. Por tanto, la comparativa se indica como no disponible.

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Inworld Voice Isolator v1 (GGUF) | 64 M | no aplica (audio) | Apache-2.0 | GGUF | Hugging Face (cstr/inworld-voice-isolator-GGUF) |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo base; al ser un modelo de audio, los sesgos potenciales se relacionarían con tipos de voz, acentos o idiomas, pero no se especifican.
- Riesgo de alucinación: en separación de audio, el equivalente sería la introducción de artefactos o la eliminación de componentes de voz; la cuantización Q4_K degrada notablemente la fidelidad (26,3 dB de SI-SDR frente a 52,4 dB en F16), por lo que para producción se recomienda F16 o Q8_0.
- Limitaciones de contexto o idioma: no se especifican; el modelo procesa audio mono a 48 kHz y no depende de idioma, pero no se documentan límites de duración de audio ni comportamiento con voces no humanas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe respetar el NOTICE de datasets de terceros del modelo original (upstream NOTICE), según indica la model card.
- Caveat para producción: los encoders por banda y las cabezas de decodificación permanecen en precisión original en los archivos cuantizados, por lo que el ahorro de memoria se limita al backbone; verificar la degradación con Q4_K antes de usarlo en entornos sensibles a la calidad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la fecha de creación es 2026-11-19, por lo que se trata de una conversión reciente y poco validada por la comunidad.

## Enlaces

- Repositorio Hugging Face de la conversión: https://huggingface.co/cstr/inworld-voice-isolator-GGUF
- Modelo base: https://huggingface.co/inworld/voice-isolator
- Runtime CrispASR: https://github.com/CrispStrobe/CrispASR
- Código de inferencia del modelo base: `inworld-ai/voice-isolator@c73f3fab` (referenciado en la model card; no se proporciona URL directa)
- Documentación del backend en CrispASR: `docs/voice-isolator.md` (referenciado en la model card; no se proporciona URL directa)
