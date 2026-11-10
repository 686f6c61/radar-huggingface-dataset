# chaitanyakartik/kn_asr_nemo

## Resumen

kn_asr_nemo es un modelo de reconocimiento automático del habla (ASR) para kannada, desarrollado por el usuario chaitanyakartik y publicado en Hugging Face bajo licencia CC-BY-4.0. Se trata de un ajuste fino del checkpoint inglés `nvidia/stt_en_fastconformer_hybrid_large_pc` de NVIDIA, al que se le ha sustituido el tokenizador por uno agregado inglés-kannada y se ha entrenado sobre aproximadamente 860 horas de audio público en kannada procedente de los corpus Kathbath, Shrutilipi y Vaani.

El modelo emplea una arquitectura FastConformer híbrida con dos cabezas de decodificación, RNN-T y CTC, y cuenta con 120 millones de parámetros (108,8 M en el encoder). Su relevancia radica en que demuestra que un ajuste fino relativamente económico sobre un checkpoint inglés puede alcanzar un rendimiento cercano al de modelos dedicados entrenados desde cero para lenguas indias, con un WER de 14,59 sobre el conjunto de validación de Kathbath.

El repositorio contiene varios artefactos además del modelo recomendado (`HybridRNNTCTC_100m_scaleup.nemo`), incluyendo variantes experimentales solo RNN-T, solo CTC, una exportación Riva sin probar y dos ejecuciones anteriores con peor rendimiento. El autor documenta de forma explícita qué fichero debe usarse en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer híbrida (encoder FastConformer + decodificadores RNN-T y CTC) |
| Parametros totales | 120,0 M (encoder: 108,8 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; ventana dependiente de la longitud del audio de entrada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | kannada (kn); tokenizador agregado inglés + kannada |
| Licencia | CC-BY-4.0 |
| Formato de pesos | `.nemo` (NeMo); exportación `.riva` experimental |

## Arquitectura y entrenamiento

El modelo es una FastConformer híbrida: un encoder FastConformer de 17 capas con dimensión de modelo 512, 8 cabezas de atención y subsampling 8x, sobre el que se montan dos cabezas de decodificación, una RNN-T (transducer) y una CTC. Esta configuración híbrida permite elegir la estrategia de decodificación en inferencia; el autor reporta resultados con decodificación greedy RNN-T sin modelo de lenguaje.

El entrenamiento consistió en un ajuste fino supervisado del checkpoint inglés `nvidia/stt_en_fastconformer_hybrid_large_pc`, no en un entrenamiento desde cero. Se sustituyó el tokenizador por uno agregado inglés-kannada y se entrenó sobre unas 860 horas de audio público en kannada proveniente de tres fuentes: ai4bharat/Kathbath, ai4bharat/Shrutilipi y ARTPARK-IISc/Vaani-transcription-part. El autor documenta una progresión por fases: la ejecución inicial solo con Kathbath (145 h) obtenía 33,34 de WER, mientras que la escala a ~860 h redujo el WER hasta 14,59. No se menciona uso de RLHF ni DPO, ni innovaciones como decodificación especulativa.

## Capacidades

- Transcripción de voz a texto en kannada a partir de audio mono a 16 kHz.
- Decodificación dual: RNN-T (recomendada por el autor) y CTC, seleccionable mediante `change_decoding_strategy`.
- Tokenizador agregado inglés + kannada, que requiere indicar el idioma (`lang: kn`) en el manifiesto de entrada.
- Inferencia sobre ficheros de audio individuales o manifiestos NeMo en formato JSON.
- Exportación a formato Riva para despliegue como servicio (artefacto presente pero no probado).
- No soporta tool calling, agentes, visión ni audio más allá de la transcripción.
- No genera puntuación: la salida es texto plano sin signos de puntuación.

## Casos de uso

- Transcripción de reuniones y actas en kannada: el modelo procesa audio de 16 kHz y devuelve texto continuo sin puntuación, adecuado para generar borradores que después se posprocesan con un modelo de lenguaje para añadir puntuación y estructura.
- Subtitulado automático de vídeo en kannada: al ser un modelo de 120 M de parámetros, puede ejecutarse en CPU o GPU modesta y generar transcripciones por segmentos para pipelines de subtitulado.
- Indexación y búsqueda de archivos de audio: transcribir un archivo de grabaciones en kannada para permitir búsqueda textual sobre el contenido hablado, aprovechando el bajo coste computacional del modelo.
- Investigación en ASR de lenguas de bajos recursos: sirve como línea base reproducible para comparar estrategias de ajuste fino desde checkpoints ingleses frente a entrenamiento desde cero, con métricas documentadas y scripts de evaluación.
- Evaluación comparativa de modelos ASR para kannada: el autor publica resultados pareados con bootstrap sobre el mismo conjunto de 2.062 utterances, lo que permite reutilizar la metodología para comparar otros sistemas.
- Despliegue en entornos con recursos limitados: con 120 M de parámetros y un repo de 2,2 GB, el modelo cabe en hardware de gama media y puede servir como motor ASR en aplicaciones locales o embebidas para kannada.
- Integración en servicios Riva: aunque la exportación `.riva` no está probada, el flujo `nemo2riva` está documentado y permitiría empaquetar el modelo como servicio de inferencia.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre Kathbath, split `valid` de kannada (2.062 utterances, 4,76 h, 22.542 palabras de referencia). Decodificación greedy RNN-T sin modelo de lenguaje y sin normalización de texto; WER y CER de corpus calculados con `jiwer`.

| Sistema | Parametros | WER | CER |
|---|---|---|---|
| AI4Bharat IndicConformer, kannada (`indicconformer_stt_kn_hybrid_rnnt_large`) | 120 M | 13,59 | 2,10 |
| **kn_asr_nemo (`HybridRNNTCTC_100m_scaleup.nemo`)** | **120 M** | **14,59** | **2,86** |
| AI4Bharat IndicConformer, multilingue (`indicconformer_stt_multi_hybrid_rnnt_600m`) | 600 M | 14,89 | 2,31 |
| Este repo, transducer pequeno (`RNNT_20m_kathbath.nemo`) | 15 M | 19,31 | 4,13 |
| Este repo, hibrido solo Kathbath (`HybridRNNTCTC_100m_kathbath.nemo`) | 120 M | 33,34 | 10,39 |

Analisis de significancia mediante bootstrap pareado sobre utterances (2.000 remuestreos):

| Comparacion | ΔWER (IC 95 %) | ΔCER (IC 95 %) |
|---|---|---|
| Este modelo − AI4Bharat kannada 120 M | +1,00 (+0,57 a +1,43) | +0,76 (+0,59 a +0,93) |
| Este modelo − AI4Bharat multilingue 600 M | −0,30 (−0,74 a +0,18) | +0,55 (+0,38 a +0,73) |

El modelo queda aproximadamente 1 punto de WER por detrás del IndicConformer específico de kannada (diferencia estadísticamente clara) y a la par en WER con el multilingüe de 600 M, aunque por detrás en CER en ambos casos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 120 M de parámetros, la inferencia en FP32 requiere del orden de 0,5 GB de pesos, más memoria para activaciones y buffers de audio.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU con al menos 4 GB de VRAM es suficiente (RTX 3060, RTX 4090, A100, H100).
- Cabe en GPU de consumo: sí, con margen amplio dado el tamaño del modelo.
- El autor reporta inferencia en CPU con NeMo 3.0.0 sobre un clip de FLEURS, lo que confirma viabilidad sin GPU.
- Opciones de despliegue: NeMo (`nemo.collections.asr`), exportación a Riva mediante `nemo2riva` (no probada), y decodificación manual para las variantes solo RNN-T y solo CTC.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (Kathbath kn valid) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kn_asr_nemo | 120 M | no disponible | 14,59 | CC-BY-4.0 | Hugging Face (NeMo) |
| AI4Bharat IndicConformer kannada | 120 M | no disponible | 13,59 | no disponible en la informacion | Hugging Face |
| AI4Bharat IndicConformer multilingue | 600 M | no disponible | 14,89 | no disponible en la informacion | Hugging Face |
| RNNT_20m_kathbath (mismo repo) | 15 M | no disponible | 19,31 | CC-BY-4.0 | Hugging Face (NeMo) |

## Limitaciones y advertencias

- El modelo solo transcribe kannada; el tokenizador agregado incluye inglés, pero no se documenta rendimiento en inglés ni en otras lenguas.
- No genera puntuación ni normaliza el texto; la salida requiere posprocesado para muchos usos en producción.
- El WER de 14,59 está aproximadamente 1 punto por detrás del IndicConformer específico de kannada de AI4Bharat, con diferencia estadísticamente significativa.
- El CER es peor que el de ambos modelos de AI4Bharat comparados (2,86 frente a 2,10 y 2,31).
- Los resultados no están verificados (`verified: false` en el model-index) y proceden del propio autor.
- La evaluación se limita a un único conjunto de validación (Kathbath, 2.062 utterances); no hay datos sobre otros dominios, ruido, acentos o audio telefónico.
- El uso de `transcribe()` con una lista simple de rutas falla por el tokenizador agregado; es necesario pasar un manifiesto con el campo `lang`.
- Varios artefactos del repo son experimentales: el modelo solo CTC nunca se evaluó, la exportación Riva no está probada y el flujo `riva-build` no completó.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero conviene verificar las condiciones de los corpus de entrenamiento (Kathbath, Shrutilipi, Vaani) antes de un despliegue comercial.
- Riesgo de alucinación y errores en nombres propios, cifras y terminología específica, habitual en modelos ASR sin modelo de lenguaje.
- El modelo se creó en enero de 2026 y se actualizó en noviembre de 2026; con solo 30 descargas, la validación por parte de la comunidad es mínima.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chaitanyakartik/kn_asr_nemo
- Modelo base: https://huggingface.co/nvidia/stt_en_fastconformer_hybrid_large_pc
- Dataset Kathbath: https://huggingface.co/datasets/ai4bharat/Kathbath
- Dataset Shrutilipi: https://huggingface.co/datasets/ai4bharat/Shrutilipi
- Dataset Vaani: https://huggingface.co/datasets/ARTPARK-IISc/Vaani-transcription-part
- Dataset FLEURS (usado en el ejemplo de la model card): https://huggingface.co/datasets/google/fleurs
- Repositorio NeMo: no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada
