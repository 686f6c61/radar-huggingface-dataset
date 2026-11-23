# MohammadGholizadeh/nemotron-asr-streaming-farsi-podcast

## Resumen

El modelo `nemotron-asr-streaming-farsi-podcast` es un sistema de reconocimiento automático del habla (ASR) en streaming especializado en persa conversacional, desarrollado por MohammadGholizadeh como un ajuste fino del modelo base `mehdi-hf/nemotron-asr-streaming-farsi`. Está pensado para transcribir pódcasts, entrevistas y conversaciones informales en farsi, un registro que los modelos ASR entrenados con habla leída formal suelen manejar mal. El ajuste se realizó sobre 365 horas de audio de pódcasts persas procedentes de los conjuntos de datos `bplus_podcast_persian` y `Tabaghe16_dataset_persian`.

La arquitectura es una FastConformer cache-aware de aproximadamente 600 millones de parámetros combinada con un decodificador RNN-T, con un tokenizador persa de 1.024 piezas y un prompt `fa-IR`. Mantiene la misma interfaz que el modelo base y admite dos modos de latencia: 1,12 s y 0,32 s de look-ahead, lo que permite tanto transcripción en vivo por fragmentos como procesamiento de archivos completos.

Su relevancia radica en la mejora concreta sobre el modelo base en habla conversacional: reduce el WER del 16,44 % al 12,31 % en el conjunto de test de pódcasts retenido, lo que supone un 25 % menos de errores. El coste es un empeoramiento en benchmarks de habla leída formal (FLEURS y Common Voice), derivado en buena parte de que el modelo transcribe en estilo coloquial (`رو`, `هستن`, `می‌خوایم`) frente a las referencias formales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer cache-aware + decodificador RNN-T |
| Parametros totales | 622.544.385 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (streaming por fragmentos; look-ahead de 1,12 s o 0,32 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Persa (farsi, `fa`) |
| Licencia | OpenMDW 1.1 (`openmdw-1.1`) |
| Formato de pesos | safetensors y `.nemo` (NeMo) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura FastConformer con mecanismo de atención cache-aware, diseñada específicamente para ASR en streaming: el encoder procesa el audio por fragmentos manteniendo una caché de estados que evita recalcular el contexto previo. El decodificador es un RNN-T (transducer), que permite emitir tokens de forma incremental sin necesidad de alinear explícitamente audio y texto. El vocabulario es un tokenizador persa de 1.024 piezas y la entrada se condiciona con el prompt `fa-IR`.

El entrenamiento parte del modelo base `mehdi-hf/nemotron-asr-streaming-farsi` y continúa el ajuste fino sobre 365 horas de habla de pódcast persa de los conjuntos `bplus_podcast_persian` y `Tabaghe16_dataset_persian`. El objetivo del ajuste es adaptar el modelo al estilo de transcripción coloquial presente en esos datos, de modo que la salida refleje cómo hablan realmente los locutores. No se especifican en la información disponible detalles sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; tampoco se documentan innovaciones adicionales más allá del propio esquema cache-aware y del decodificador RNN-T.

## Capacidades

- Reconocimiento automático del habla en persa (farsi) con salida de texto.
- Transcripción en streaming real, fragmento a fragmento, con look-ahead configurable de 1,12 s (mayor precisión) o 0,32 s (menor latencia).
- Transcripción de archivos completos además del modo en vivo.
- Manejo específico de habla conversacional y coloquial: reproduce formas habladas como `رو`, `هستن` o `می‌خوایم`.
- Emisión de marcas de tiempo y puntuación según el pipeline estándar de NeMo (no detallado en la información disponible).
- Soporte de decodificación greedy y del script de streaming cache-aware de NeMo.
- No se documenta soporte de tool calling, agentes, visión ni audio más allá del propio ASR.

## Casos de uso

- Transcripción de pódcasts persas: el modelo está ajustado sobre 365 horas de pódcast conversacional y logra un 12,31 % de WER en episodios retenidos, por lo que es la opción indicada para generar transcripciones de programas completos con estilo coloquial.
- Subtitulado en directo de entrevistas y programas de radio: con 0,32 s de look-ahead puede emitir texto casi en tiempo real, adecuado para emisión o para asistencia a oyentes con discapacidad auditiva.
- Generación de actas y resúmenes de reuniones informales: la ventana de streaming y el estilo coloquial permiten transcribir conversaciones de equipo en farsi y alimentar posteriormente un pipeline de resumen.
- Indexación y búsqueda de archivos de audio: al transcribir pódcasts y conversaciones, el texto resultante se puede indexar en un motor de búsqueda o en un sistema RAG para recuperar fragmentos por contenido.
- Moderación y análisis de contenido hablado: transcripción de emisiones para detección de temas, palabras clave o cumplimiento, aprovechando el procesamiento por fragmentos.
- Asistentes de voz y atención al cliente en persa: integrado en un pipeline de ASR en vivo, permite captar la consulta del usuario en lenguaje natural conversacional antes de pasarla a un LLM.
- Accesibilidad y documentación de archivos históricos: transcripción de grabaciones conversacionales existentes para hacerlas buscables y accesibles.

## Benchmarks y rendimiento

Resultados declarados por el autor (WER / CER en %, menor es mejor), con streaming real fragmento a fragmento, prompt `fa-IR` fijo y decodificación greedy.

Look-ahead de 1,12 s:

| Conjunto de test | Clips | Modelo base | Este modelo | Cambio |
|---|---|---|---|---|
| Pódcast held-out (total) | 4.182 | 16,44 / 8,69 | 12,31 / 5,97 | −4,13 WER |
| ↳ episodios bplus | 2.340 | 5,63 / 2,20 | 4,81 / 1,70 | −0,82 |
| ↳ episodios Tabaghe16 | 1.842 | 22,85 / 12,58 | 16,76 / 8,53 | −6,09 |
| FLEURS fa test (habla leída) | 852 | 8,82 / 2,94 | 12,91 / 4,81 | +4,09 |
| Common Voice 22 fa test | 10.661 | 19,12 / 5,80 | 22,01 / 7,64 | +2,89 |

Look-ahead de 0,32 s:

| Conjunto de test | Clips | Modelo base | Este modelo |
|---|---|---|---|
| Pódcast held-out (total) | 4.182 | 18,08 / 9,84 | 13,54 / 6,78 |
| ↳ episodios bplus | 2.340 | 7,49 / 3,44 | 6,30 / 2,66 |
| ↳ episodios Tabaghe16 | 1.842 | 24,37 / 13,67 | 17,83 / 9,25 |
| FLEURS fa test | 852 | 9,01 / 3,03 | 12,98 / 4,56 |
| Common Voice 22 fa test | 10.661 | 19,93 / 6,08 | 21,97 / 7,20 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con 622 millones de parámetros, la inferencia en fp16 requiere del orden de 1,5-2 GB de pesos, más el overhead del runtime de NeMo y de las cachés de streaming.
- GPU recomendadas: no especificadas por el autor; por tamaño, una GPU consumer moderna (RTX 3060/4060 o superior) debería ser suficiente para inferencia en fp16, y una A100/H100 aportaría margen para lotes grandes o múltiples streams concurrentes.
- Cabe en GPU consumer: sí, por el tamaño del modelo, aunque no hay confirmación oficial de requisitos mínimos.
- Opciones de despliegue: NeMo (`ASRModel.restore_from` con el archivo `.nemo`), descarga vía `huggingface_hub`; el autor no documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras de latencia ni de throughput; el modelo ofrece look-ahead de 1,12 s o 0,32 s como parámetro de compromiso entre precisión y retardo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / streaming | WER pódcast (1,12 s) | WER FLEURS fa | Licencia |
|---|---|---|---|---|---|
| Este modelo | 622,5 M | Streaming, look-ahead 1,12 s / 0,32 s | 12,31 | 12,91 | OpenMDW 1.1 |
| `mehdi-hf/nemotron-asr-streaming-farsi` (base) | no disponible | Streaming, misma interfaz | 16,44 | 8,82 | no disponible |
| Otros ASR persa | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa disponible es con el modelo base, del que este es un ajuste fino: gana en habla conversacional y pierde en habla leída formal. No se dispone de datos de otros modelos ASR en persa en la información proporcionada.

## Limitaciones y advertencias

- Peor rendimiento en habla leída formal: FLEURS sube de 8,82 a 12,91 de WER y Common Voice de 19,12 a 22,01; para noticias, audiolibros o transcripciones de estilo escrito conviene usar el modelo base.
- La mayor parte del empeoramiento en FLEURS es de registro: el modelo transcribe en coloquial (`رو`, `هستن`, `کردن`) donde la referencia es formal (`را`, `هستند`, `کردند`).
- Se documentan regresiones reales en un número menor de utterances: finales de frase omitidos en frases largas y formales y algún bucle de repetición ocasional.
- Riesgo de alucinación y de bucles de repetición en audio ruidoso o fuera de dominio; no se documentan métricas de robustez.
- Entrenado únicamente en persa (`fa`); no soporta otros idiomas.
- Sesgos: no se documentan análisis de sesgo por acento, género o registro más allá del coloquial.
- Licencia OpenMDW 1.1: es necesario revisar sus términos antes de un uso comercial; el campo `license` de Hugging Face figura como `other`.
- Los resultados de benchmarks son declarados por el autor y no están verificados (`verified: false`).
- No se publican requisitos de hardware, latencia ni throughput, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MohammadGholizadeh/nemotron-asr-streaming-farsi-podcast
- Modelo base: https://huggingface.co/mehdi-hf/nemotron-asr-streaming-farsi
- Dataset bplus_podcast_persian: https://huggingface.co/datasets/MohammadGholizadeh/bplus_podcast_persian
- Dataset Tabaghe16_dataset_persian: https://huggingface.co/datasets/MohammadGholizadeh/Tabaghe16_dataset_persian
- Resultados de evaluación: https://huggingface.co/MohammadGholizadeh/nemotron-asr-streaming-farsi-podcast/tree/main/eval_results
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Dataset Common Voice 22.0: https://huggingface.co/datasets/fsicoli/common_voice_22_0
