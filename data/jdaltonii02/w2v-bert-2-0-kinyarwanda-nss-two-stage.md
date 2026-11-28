# jdaltonII02/w2v-bert-2.0-kinyarwanda-nss-two-stage

## Resumen

w2v-bert-2.0-kinyarwanda-nss-two-stage es un modelo de reconocimiento automatico del habla (ASR) especializado en kinyarwanda, desarrollado por el usuario jdaltonII02 sobre el modelo base badrex/w2v-bert-2.0-kinyarwanda-asr. Su particularidad es que se ha afinado en dos etapas sobre un corpus de habla no estandar (non-standard speech, NSS), que incluye muestras con tartamudeo y otras disfluencias, un dominio historicamente desatendido por los sistemas ASR comerciales. El modelo se publica en el contexto del sprint de investigacion asr-sprint-rwanda-2026.

Arquitectura Wav2Vec2-BERT, un modelo de speech preentrenado que combina el extractor convolucional de wav2vec 2.0 con un codificador transformer tipo BERT, con 580 millones de parametros. El repositorio ocupa 2,3 GB en formato safetensors y esta disponible unicamente para kinyarwanda (codigo de idioma rw). El acceso esta restringido: es necesario aceptar las condiciones de la licencia cdli-non-standard-speech-terms en Hugging Face antes de descargarlo.

Su relevancia radica en que aborda un caso de bajos recursos (kinyarwanda) y un dominio especialmente dificil (habla con disfluencias), donde los modelos multilingues genericos suelen degradarse notablemente. El entrenamiento en dos etapas sugiere una adaptacion progresiva desde el modelo base hacia el dominio no estandar, una estrategia habitual para evitar el olvido catastrofico al especializar modelos de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2-BERT (extractor convolucional + codificador transformer) |
| Parametros totales | 580.525.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | kinyarwanda (rw) |
| Licencia | cdli-non-standard-speech-terms (acceso restringido) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Wav2Vec2-BERT, una arquitectura de representacion del habla auto-supervisada que procesa audio en bruto mediante un extractor de caracteristicas convolucional seguido de un codificador transformer con atencion completa. Sobre esta base, el autor ha realizado un ajuste fino en dos etapas (two-stage) partiendo de badrex/w2v-bert-2.0-kinyarwanda-asr, un modelo ya adaptado al kinyarwanda. La segunda etapa se orienta al dominio de habla no estandar, segun el nombre del modelo y las etiquetas del repositorio.

El corpus de entrenamiento indicado es cdli/rwandan_kinyarwanda_nonstandard_speech_v1.0, que incluye muestras de habla con tartamudeo y otras formas no estandar. No se dispone de informacion publica sobre el numero exacto de horas de audio, la composicion detallada del dataset, el uso de RLHF/DPO (no aplicable en ASR) ni las tecnicas de regularizacion empleadas entre etapas. Tampoco se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal; el modelo es un ajuste fino de ASR convencional.

## Capacidades

- Reconocimiento automatico del habla (transcripcion audio a texto) en kinyarwanda.
- Manejo de habla no estandar, incluyendo muestras con tartamudeo y disfluencias, gracias al ajuste fino especifico de dominio.
- Procesamiento de audio en bruto sin necesidad de transcripcion fonetica previa (propio de Wav2Vec2-BERT).
- Capacidad monolingue: solo kinyarwanda; no se documenta soporte multilingue.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no aplicable a un modelo ASR).
- No se documentan capacidades de vision, audio generativo ni modo thinking.

## Casos de uso

- Transcripcion de entrevistas y testimonios con hablantes que tartamudean: el ajuste en habla no estandar permite obtener transcripciones mas fieles que un ASR generico, util en investigacion sociolinguistica y clinica del habla.
- Subtitulado de contenido audiovisual en kinyarwanda: el modelo puede alimentar pipelines de subtitulado automatico para medios locales, donde el habla espontanea suele incluir disfluencias.
- Documentacion de patrimonio oral: transcripcion de grabaciones de tradicion oral, cuentos y testimonios historicos en kinyarwanda, un idioma con pocos recursos ASR.
- Atencion al ciudadano en servicios publicos: transcripcion de llamadas o mensajes de voz en kinyarwanda para su posterior procesamiento, con tolerancia a habla vacilante.
- Investigacion en ASR de bajos recursos: sirve como punto de partida o referencia para experimentos de adaptacion de dominio en idiomas africanos con datos limitados.
- Accesibilidad: generacion de transcripciones para personas con tartamudeo en entornos educativos o laborales, donde los sistemas convencionales fallan con mayor frecuencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 580 millones de parametros, en FP16 requiere aproximadamente 1,2 GB de pesos; en FP32 unos 2,3 GB. No se documentan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; A100, H100 o RTX 4090 sobran para este tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna (GTX 1660, RTX 3060, RTX 4090) e incluso en CPU para inferencia no interactiva.
- Opciones de despliegue: al ser un modelo transformers estandar con safetensors, es compatible con la libreria transformers de Hugging Face, con pipelines de ASR y con servidores tipo TGI o vLLM (soporte de audio segun version). No se documenta soporte GGUF/llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Acceso |
|---|---|---|---|---|---|
| jdaltonII02/w2v-bert-2.0-kinyarwanda-nss-two-stage | 580 M | no disponible | kinyarwanda | cdli-non-standard-speech-terms | Restringido |
| badrex/w2v-bert-2.0-kinyarwanda-asr (modelo base) | no disponible | no disponible | kinyarwanda | no disponible | no disponible |
| Whisper (familia OpenAI) | 39 M - 1,55 B | 30 s de audio | multilingue (incluye rw) | MIT / Apache 2.0 | Abierto |

La comparacion con Whisper es orientativa: Whisper es un modelo multilingue generico con licencia permisiva, mientras que este modelo es monolingue y especializado en habla no estandar, pero con licencia restrictiva y acceso condicionado. No se dispone de datos de rendimiento comparativo entre ambos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo monolingue: solo transcribe kinyarwanda; no admite otros idiomas.
- Acceso restringido: requiere aceptar la licencia cdli-non-standard-speech-terms en Hugging Face, lo que condiciona su uso comercial y su redistribucion.
- Licencia "other" no estandar: es imprescindible revisar los terminos antes de cualquier despliegue en produccion.
- Riesgo de sesgo hacia el dominio de entrenamiento: al estar afinado en habla no estandar, su rendimiento en habla estandar puede diferir del modelo base y no esta documentado.
- Riesgo de alucinacion en ASR: como todo modelo de transcripcion, puede generar texto plausible pero incorrecto en audio ruidoso o con acentos no representados.
- Sin datos publicados de benchmarks, WER ni evaluacion formal: no es posible cuantificar su calidad frente a alternativas.
- Documentacion muy escasa en el repositorio (0 descargas, 0 likes): no hay garantias de mantenimiento ni soporte.
- No se documentan limitaciones de longitud de audio ni de contexto; conviene validar el comportamiento con fragmentos largos antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jdaltonII02/w2v-bert-2.0-kinyarwanda-nss-two-stage
- Modelo base: https://huggingface.co/badrex/w2v-bert-2.0-kinyarwanda-asr
- Dataset de entrenamiento: https://huggingface.co/datasets/cdli/rwandan_kinyarwanda_nonstandard_speech_v1.0
- Paper de Wav2Vec2-BERT (arquitectura): https://arxiv.org/abs/2312.05187
