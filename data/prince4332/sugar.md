# prince4332/sugar

## Resumen

`sugar` es un ajuste fino (fine-tuning) del modelo de reconocimiento automático del habla `nvidia/nemotron-3.5-asr-streaming-0.6b` de NVIDIA, publicado por el usuario prince4332 en Hugging Face. Su objetivo principal es incorporar el akan (twi), una lengua de Ghana, al conjunto de idiomas que el modelo base ya reconoce, manteniendo al mismo tiempo un rendimiento razonable en inglés, francés, español, alemán y portugués mediante una técnica de "replay" de datos de esos idiomas durante el entrenamiento.

El modelo conserva la arquitectura del original: un sistema ASR en streaming de tipo cache-aware, con aproximadamente 0,6 mil millones de parámetros, empaquetado en formato `.nemo` (10,2 GB en el repositorio). La relevancia de este tipo de ajustes radica en la extensión de cobertura lingüística hacia idiomas de bajos recursos, un área donde los modelos multilingües comerciales suelen presentar tasas de error muy elevadas.

El checkpoint publicado como `sugar.nemo` corresponde al mejor paso de entrenamiento (paso 4000 de la ejecución `beaebfcbbf53`), seleccionado con una puntuación de 77,092 que combina el WER objetivo con una penalización por el deterioro en los idiomas de replay. El repositorio incluye también `final/sugar.nemo`, correspondiente al último paso de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ASR cache-aware en streaming (basado en NVIDIA Nemotron 3.5 ASR streaming) |
| Parametros totales | 0,6 mil millones (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio en streaming con buffer cache-aware) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ak (akan/twi), en, fr, es, de, pt |
| Licencia | no disponible |
| Formato de pesos | `.nemo` (formato nativo de NVIDIA NeMo) |

## Arquitectura y entrenamiento

El modelo parte de `nvidia/nemotron-3.5-asr-streaming-0.6b`, un sistema de reconocimiento del habla diseñado para inferencia en streaming mediante un mecanismo cache-aware: el buffer `CacheAwareStreamingAudioBuffer` junto con `conformer_stream_step` permite procesar audio de forma incremental manteniendo estado entre fragmentos. El ajuste fino conserva esta arquitectura y añade un nuevo prompt de idioma, `ak-GH`, para el akan, manteniendo operativos todos los prompts originales (incluido `auto` para identificación automática de idioma).

El entrenamiento combina datos de akan con una estrategia de replay sobre inglés, francés, español, alemán y portugués, con el fin de mitigar el olvido catastrófico en los idiomas originales. La selección del mejor checkpoint se realizó con una métrica compuesta: WER objetivo más 2,0 veces el incremento medio de WER en los idiomas de replay respecto al modelo base. No se especifican en la información disponible el volumen de datos de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (poco habituales en ASR). El decodificador elimina las etiquetas de idioma del texto generado mediante `decoding.strip_lang_tags`.

## Capacidades

- Reconocimiento automático del habla en streaming con estado cache-aware.
- Transcripción en akan (twi) mediante el prompt `ak-GH`, idioma no cubierto por el modelo base.
- Transcripción en inglés (`en-US`), francés (`fr-FR`), español (`es-ES`), alemán (`de-DE`) y portugués (`pt-BR`).
- Identificación automática de idioma con el prompt `auto` (precisión del 75,3 % en los idiomas nuevos según la model card).
- Selección explícita de idioma mediante prompts, útil en entornos multilingües controlados.
- Integración con el ecosistema NVIDIA NeMo (`nemo.collections.asr`) y carga directa desde Hugging Face mediante `hf_hub_download`.
- No se documentan capacidades de traducción, diarización, puntuación avanzada ni salida con marcas de tiempo en la información disponible.

## Casos de uso

- Transcripción de audio en akan para servicios públicos de Ghana: el modelo permite generar subtítulos o actas de reuniones en twi, un idioma con escasa cobertura en ASR comerciales, usando el prompt `ak-GH`.
- Subtitulado en directo de retransmisiones multilingües: el modo streaming con buffer cache-aware permite transcribir audio conforme llega, seleccionando el idioma mediante prompt según el segmento.
- Atención al cliente en centros de contacto africanos: combinación de akan e inglés en la misma organización, con prompts separados para cada idioma y evaluación del WER por idioma.
- Investigación lingüística y documentación de lenguas de bajos recursos: generación de transcripciones iniciales para corpus de akan que luego se corrigen manualmente, aprovechando el WER de 74,92 como punto de partida.
- Prototipos de asistentes de voz en dispositivos con NeMo: el tamaño de 0,6 mil millones de parámetros facilita el despliegue en entornos con recursos moderados frente a modelos ASR de mayor tamaño.
- Evaluación comparativa de técnicas de replay: el modelo sirve como referencia reproducible para estudiar el equilibrio entre mejora en el idioma objetivo y degradación en los idiomas de replay (incrementos de WER de entre 0,48 y 1,93 puntos absolutos).
- Pipeline de transcripción multilingüe con detección automática: uso del prompt `auto` para enrutar audio a la transcripción sin conocer el idioma de antemano, aceptando la precisión limitada (75,3 %) en los idiomas nuevos.

## Benchmarks y rendimiento

Resultados de WER publicados en la model card (clips de validación, texto en minúsculas, sin puntuación ni etiquetas de idioma):

| Idioma | Prompt | Estado | WER modelo base | WER este modelo |
|---|---|---|---|---|
| Akan (Twi) | `ak-GH` | nuevo | 87,29 | 74,92 |
| Inglés | `en-US` | conservado | 3,53 | 4,01 |
| Francés | `fr-FR` | conservado | 8,76 | 9,78 |
| Español | `es-ES` | conservado | 5,74 | 6,97 |
| Alemán | `de-DE` | conservado | 8,66 | 9,43 |
| Portugués | `pt-BR` | conservado | 8,22 | 10,15 |

Precisión de identificación automática de idioma (`auto`) en los idiomas nuevos: 75,3 %. No se han publicado resultados de benchmarks estándar (MLSU, Common Voice, FLEURS u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 0,6 mil millones de parámetros en precisión completa (FP32) el peso ronda los 2,4 GB, y en FP16 aproximadamente 1,2 GB, aunque el repositorio ocupa 10,2 GB por incluir checkpoints y artefactos de entrenamiento.
- GPU recomendadas: no especificadas en la información disponible; el tamaño del modelo sugiere que cualquier GPU con al menos 4-8 GB de VRAM podría albergarlo en FP16, pero no hay datos oficiales.
- Compatibilidad con GPU de consumo: probable por el tamaño de parámetros, pero no confirmada en la documentación.
- Opciones de despliegue: NVIDIA NeMo (`ASRModel.restore_from` con el archivo `.nemo`), carga desde Hugging Face con `hf_hub_download`, y bucle de streaming con `CacheAwareStreamingAudioBuffer` y `conformer_stream_step`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no a este formato).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | WER akan | Licencia | Formato |
|---|---|---|---|---|---|
| prince4332/sugar | 0,6 B | ak, en, fr, es, de, pt | 74,92 | no disponible | `.nemo` |
| nvidia/nemotron-3.5-asr-streaming-0.6b (base) | 0,6 B | en, fr, es, de, pt (sin ak) | 87,29 | no disponible | `.nemo` |
| Alternativas ASR multilingües de código abierto | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con otros sistemas ASR (Whisper, MMS, etc.) no está disponible en la información proporcionada; solo se dispone de la comparación con el modelo base, que muestra una mejora de 12,37 puntos de WER en akan a costa de un deterioro de entre 0,48 y 1,93 puntos en los idiomas de replay.

## Limitaciones y advertencias

- El WER en akan sigue siendo muy alto (74,92), lo que limita su uso en producción sin revisión humana o corrección posterior.
- Deterioro sistemático en todos los idiomas de replay: el WER aumenta en inglés, francés, español, alemán y portugués respecto al modelo base.
- La identificación automática de idioma (`auto`) solo alcanza el 75,3 % en los idiomas nuevos, lo que puede provocar enrutamientos erróneos.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; debe verificarse antes de cualquier despliegue en producción.
- El modelo base es de NVIDIA y las condiciones de su licencia original podrían aplicarse al derivado; no se detalla en la información disponible.
- Riesgo de alucinación y errores de transcripción inherentes a los sistemas ASR, especialmente en audio con ruido, acentos no representados o vocabulario técnico.
- No se documentan sesgos específicos por género, dialecto o registro; el akan cubierto podría limitarse a una variante concreta (twi) y no al conjunto de dialectos akan.
- El repositorio incluye checkpoints intermedios y finales (10,2 GB); debe seleccionarse explícitamente `sugar.nemo` para el mejor rendimiento.
- No hay información sobre el volumen ni la procedencia de los datos de entrenamiento, lo que dificulta evaluar la representatividad y los posibles sesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prince4332/sugar
- Modelo base: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Documentación de NVIDIA NeMo (referencia del ecosistema): no disponible en la información proporcionada
- Paper o blog del ajuste fino: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
