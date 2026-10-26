# BSC-LT/whisper-large-v3-LoS-punctuated

## Resumen

whisper-large-v3-LoS-punctuated es un sistema de reconocimiento automático del habla (ASR) desarrollado por el Barcelona Supercomputing Center (BSC-LT) mediante ajuste fino del modelo `openai/whisper-large-v3`. Su objetivo es transcribir audio con puntuación en las cuatro lenguas principales de España que el equipo denomina LoS (Languages of Spain): castellano, catalán, gallego y euskera. Frente a otros ajustes centrados en una sola lengua, este modelo se entrena con un reparto equilibrado de horas entre las cuatro, lo que permite cubrir casos de uso multilingües dentro del ámbito peninsular con un único checkpoint.

El ajuste se realizó sobre 8.110 horas de audio preprocesado, combinando corpus públicos (Common Voice 17, ciempiess, Parlament-Parla, Corts Valencianes, entre otros) y datasets institucionales. La equalización de horas se hizo tomando el euskera como referencia tras aplicar speed perturbation (0,9× y 1,1×) a todos sus ficheros, con una duración total de 2.027 h 56 min 11 s. El resultado es un modelo orientado a transcripciones legibles, con puntuación y consistencia lingüística, más que a una mera salida de palabras sueltas.

La relevancia actual del modelo radica en su licencia Apache 2.0, su disponibilidad en HuggingFace con la librería `transformers` y su vocación de cubrir una laguna habitual: la mayoría de los ASR de calidad están optimizados para inglés o castellano, y las variantes catalana, gallega y vasca suelen quedar en segundo plano. Con 153 descargas y actualización en octubre de 2026, sigue siendo un checkpoint de nicho pero activo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), heredada de openai/whisper-large-v3 |
| Parametros totales | no disponible en la model card; el modelo base openai/whisper-large-v3 declara 1.550 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Whisper procesa ventanas de audio de 30 s por segmento |
| Tipos de cuantizacion | no documentados por el autor; al ser un modelo `transformers`/PyTorch admite carga en fp32, fp16 y cuantizacion int8 vía bitsandbytes (no verificado por el autor) |
| Idiomas soportados | ca (metadato HF); la model card declara castellano, catalán, gallego y euskera |
| Licencia | apache-2.0 |
| Formato de pesos | pesos PyTorch/safetensors para `transformers` (repo de 18,5 GB); no se distribuyen GGUF en el repositorio |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper large-v3: un transformer encoder-decoder con entrada de espectrograma mel, diseñado para ASR multilingüe y entrenado originalmente por OpenAI sobre un corpus web a gran escala. Este checkpoint no introduce cambios estructurales; el trabajo del BSC-LT se concentra en el ajuste fino supervisado sobre datos de las lenguas de España, incluyendo la normalización y puntuación de las transcripciones de referencia para que la salida sea legible de forma directa.

El conjunto de entrenamiento suma 8.110 horas y combina fuentes públicas e institucionales. En catalán se usaron 3CatParla, Parlament-Parla-v3 (versión no anonimizada), Corts Valencianes (versión no anonimizada), IB3 y el benchmark de acentos de Common Voice ca 17; en castellano, los corpus ciempiess (light, fem, complementary, balance), CHM150, TEDx Spanish y Librivox Spanish. El equilibrio entre lenguas se fijó a partir del euskera, al que se aplicó speed perturbation a 0,9× y 1,1× sobre todos sus ficheros (2.027 h 56 min 11 s en total) y cuya duración sirvió de referencia para balancear el resto. La model card no documenta el uso de RLHF, DPO ni de decodificación especulativa.

## Capacidades

- Transcripción de voz a texto con puntuación en castellano, catalán, gallego y euskera.
- Salida con formato legible (puntuación y consistencia lingüística), pensada para consumo directo sin post-procesado pesado.
- Procesamiento de audio a 16 kHz; el pipeline de ejemplo remuestrea el audio antes de la inferencia.
- Uso vía `transformers` con `WhisperProcessor` y `WhisperForConditionalGeneration`, lo que permite integrarlo en pipelines de Python existentes.
- Evaluación integrada con `datasets` y `evaluate` (métrica WER), tal como muestra el código de la model card.
- No se documentan capacidades de tool calling, agentes, visión, audio generation ni modo "thinking"; es un modelo exclusivamente ASR.

## Casos de uso

- Subtitulado de medios audiovisuales en catalán: cadenas como IB3 o TV3 pueden transcribir contenido con puntuación directamente, usando el modelo como primer paso de un pipeline de subtitulado y revisión humana.
- Actas de parlamentos y cortes autonómicas: el ajuste incluye Parlament-Parla-v3 y Corts Valencianes, por lo que el dominio (discurso político formal, turnos de palabra) está cubierto de forma explícita; encaja en la generación automática de actas con posterior corrección.
- Atención al ciudadano en administraciones multilingües: un único modelo permite transcribir interacciones en castellano, catalán, gallego y euskera sin enrutar por idioma, simplificando la arquitectura del servicio.
- Archivística y oral history: digitalización de fondos sonoros con transcripción puntuada que reduce el trabajo de documentación y hace buscable el audio.
- Investigación lingüística y sociolingüística: obtención de transcripciones comparables entre las cuatro lenguas con un reparto de horas equilibrado, lo que facilita análisis cruzados sin sesgo de tamaño de corpus.
- Accesibilidad en servicios públicos: transcripción en tiempo cuasi-real de comparecencias y ruedas de prensa para subtitulado en directo, con la ventana de 30 s por segmento propia de Whisper.
- Generación de datos de entrenamiento para otros modelos: transcripción masiva de audio no etiquetado en las cuatro lenguas para construir corpus supervisados adicionales.

## Benchmarks y rendimiento

El `model-index` del autor declara una evaluación en Mozilla Common Voice 17.0 (test, `language=ca`) con la métrica WER, pero el campo `value` está vacío y `verified: false`. No hay, por tanto, cifras de WER publicadas de forma efectiva.

| Benchmark | Dataset | Metrica | Resultado | Estado |
|---|---|---|---|---|
| ASR | Mozilla Common Voice 17.0 (test, ca) | WER | no disponible (campo vacío en model-index) | no verificado |
| Test interno | no especificado en la model card | no especificado (la model card incluye una linea comentada "Test Result: 0.96") | 0,96; metrica y conjunto sin documentar | no verificable |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones a partir del tamano del modelo base, no publicadas por el autor): ~6,5 GB en fp32, ~3,5 GB en fp16/int8 para los pesos; el repositorio completo ocupa 18,5 GB, por lo que la descarga requiere ese espacio en disco.
- GPU recomendadas: A100, H100 o L40S para lotes grandes y throughput alto; RTX 4090/A6000 para produccion de volumen medio.
- Cabe en GPU de consumo: si, en RTX 3090/4090 y en tarjetas con 8 GB o mas en fp16 para audio de 30 s; en GPUs de 6 GB puede requerir int8 o procesamiento por segmentos.
- Opciones de despliegue: `transformers` con PyTorch (ruta oficial documentada en la model card); son habituales tambien vLLM, TGI o llama.cpp/whisper.cpp previa conversion, aunque el autor no las documenta para este checkpoint.
- Latencia y throughput: no disponibles; dependen del hardware y de la longitud del audio. El cuello de botella tipico de Whisper large-v3 es el encoder sobre ventanas de 30 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BSC-LT/whisper-large-v3-LoS-punctuated | 1.550 M (heredado del base) | ventanas de 30 s por segmento (base) | ca, es, gl, eu | apache-2.0 | HuggingFace, `transformers` |
| openai/whisper-large-v3 (base) | 1.550 M | ventanas de 30 s | multilingue amplio (incluye ca, es, gl, eu) | apache-2.0 | HuggingFace, `transformers` |
| projecte-aina/whisper-large-v3-ca-3catparla | 1.550 M (heredado del base) | ventanas de 30 s | ca (principalmente) | no disponible en la informacion proporcionada | HuggingFace, referenciado en la model card |
| openai/whisper-large-v3-turbo | 809 M | ventanas de 30 s, decoder reducido | multilingue amplio | apache-2.0 | HuggingFace, `transformers` |

El modelo se posiciona como alternativa multilingue peninsular frente al large-v3 original (mas generico, sin ajuste a dominios institucionales) y frente al ajuste solo-catalan de Projecte AINA. La comparativa de rendimiento cuantitativo no esta disponible porque el autor no publica WER.

## Limitaciones y advertencias

- El `model-index` declara la metrica WER pero sin valor; no hay evidencia cuantitativa publicada del rendimiento, lo que obliga a evaluar por cuenta propia antes de adoptarlo.
- La model card incluye una linea comentada "Test Result: 0.96" sin especificar metrica ni conjunto de evaluacion; no debe interpretarse como WER verificado.
- No se dispone de informacion demografica de los hablantes de los corpus de entrenamiento, por lo que pueden existir sesgos de edad, genero, acento o procedencia.
- Sesgo potencial hacia contenido institucional (parlamentos, cortes, medios publicos), que puede degradar el rendimiento en registros coloquiales, ruido de fondo o audio telefonico.
- Los metadatos de HuggingFace declaran unicamente `ca`, mientras que la model card declara cuatro lenguas; conviene validar el rendimiento real en castellano, gallego y euskera.
- La normalizacion y la puntuacion de referencia forman parte del objetivo de entrenamiento, de modo que la salida puede diferir en estilo de la transcripcion literal palabra a palabra.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion; no se documentan restricciones adicionales, pero el uso de los corpus subyacentes (algunos no anonimizados y no publicos) debe revisarse por separado.
- En produccion, la ventana de 30 s por segmento implica gestionar el troceado y la reconciliacion de segmentos para audios largos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BSC-LT/whisper-large-v3-LoS-punctuated
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Notebook de ejemplo: https://colab.research.google.com/drive/1MHiPrffNTwiyWeUyMQvSdSbfkef_8aJC?usp=sharing
- Dataset 3CatParla: https://huggingface.co/datasets/projecte-aina/3catparla_asr
- Dataset Parlament-Parla-v3: https://huggingface.co/datasets/projecte-aina/parlament_parla_v3
- Dataset Corts Valencianes: https://huggingface.co/datasets/projecte-aina/corts_valencianes_asr_a
- Dataset IB3: https://huggingface.co/datasets/projecte-aina/ib3_ca_asr
- Benchmark de acentos en catalan (Common Voice ca 17): https://huggingface.co/datasets/projecte-aina/commonvoice_benchmark_catalan_accents
- Corpus ciempiess light: https://huggingface.co/datasets/ciempiess/ciempiess_light
- Corpus ciempiess fem: https://huggingface.co/datasets/ciempiess/ciempiess_fem
- Corpus ciempiess complementary: https://huggingface.co/datasets/ciempiess/ciempiess_complementary
- Corpus ciempiess balance: https://huggingface.co/datasets/ciempiess/ciempiess_balance
- Corpus CHM150: https://huggingface.co/datasets/carlosdanielhernandezmena/chm150_asr
- Corpus TEDx Spanish: https://huggingface.co/datasets/ciempiess/tedx_spanish
- Corpus Librivox Spanish: https://huggingface.co/datasets/ciempiess/librivox (URL truncada en la model card)
- Dataset de evaluacion de ejemplo (Parlament Parla): https://huggingface.co/datasets/projecte-aina/parlament_parla
- Dataset Common Voice 17.0: https://huggingface.co/datasets/mozilla-foundation/common_voice_17_0

Nota: la busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los resultados obtenidos eran articulos genericos sobre el acronimo "BSC" y no se han incluido.
