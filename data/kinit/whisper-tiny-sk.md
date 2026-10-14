# kinit/whisper-tiny-sk

## Resumen

whisper-tiny-sk es un ajuste fino completo (full fine-tuning) del modelo openai/whisper-tiny para reconocimiento automatico del habla (ASR) en eslovaco. Lo desarrolla el equipo de KInIT (Kempelen Institute of Intelligent Technologies) y esta publicado en HuggingFace bajo licencia Apache 2.0. El modelo conserva la arquitectura encoder-decoder de tipo transformer propia de la familia Whisper, con aproximadamente 37,76 millones de parametros (unos 38 M), lo que lo situa como la variante mas ligera de la familia.

El problema que resuelve es concreto: Whisper Tiny original apenas funciona en eslovaco, con una tasa de error de palabra (WER) del 105,14 % en Common Voice 24.0 y del 99,47 % en el conjunto interno de KInIT. Tras el ajuste fino, esas cifras bajan al 38,24 % y al 20,04 % respectivamente, lo que supone una reduccion del 64 % y del 80 % en WER. El modelo incorpora ademas aumentacion de ruido aplicada en el 75 % de los lotes de entrenamiento, pensada para condiciones de grabacion reales (ruido telefonico, ruido de fondo, perdida de paquetes).

Es relevante ahora porque cubre un hueco de recursos linguisticos para una lengua con pocos modelos ASR especificos y porque esta integrado en el catalogo SLAIH de recursos de PLN eslovacos, junto al resto de la coleccion ASR de KInIT con los seis tamanos de Whisper. Su licencia permisiva y su tamano reducido lo hacen desplegable en hardware muy modesto, incluido CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper encoder-decoder (transformer seq2seq) |
| Parametros totales | 37.760.640 (~38 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 30 segundos de audio por segmento (ventana fija del encoder); para audios mas largos se requiere chunking |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | eslovaco (sk) unicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tarea | automatic-speech-recognition (ASR) |
| Modelo base | openai/whisper-tiny |
| Metodo de ajuste | full fine-tuning (todos los parametros) |
| Libreria | transformers |
| Tamano del repositorio | 0,2 GB |
| Framework de entrenamiento | HuggingFace Transformers `Seq2SeqTrainer` |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper Tiny: un encoder-decoder transformer con procesamiento de audio en ventanas fijas de 30 segundos, que convierte caracteristicas mel-espectrales en tokens de texto. No hay innovaciones arquitectonicas propias; el valor del modelo esta enteramente en el ajuste fino. El entrenamiento se realizo sobre todos los parametros del modelo base (no LoRA ni adaptadores), durante 2 epocas, con learning rate 5e-5, scheduler lineal con warmup, optimizador AdamW, batch efectivo de 64 y precision fp16, usando el `Seq2SeqTrainer` de HuggingFace. El computo se ejecuto en el cluster HPC Devana (SAV).

El corpus de entrenamiento es un conjunto interno de voz en eslovaco compilado en KInIT, que combina datos publicos con grabaciones internas. Las fuentes incluyen SloPalSpeech, grabaciones de sesiones de plenos municipales, literatura leida, Mozilla Common Voice 24.0, el corpus de conferencias TEDxSK y JumpSK (KEMT NLP), lectura de FLEURS y grabaciones internas de KInIT. Las grabaciones con datos personales se anonimizaron antes de su uso y las muestras se filtraron por calidad mediante un umbral basado en CER validado contra varios modelos ASR. El 75 % de los lotes se aumento en caliente con ruido sintetico (ruido telefonico, habla de fondo, ruido ambiental, ruido blanco y perdida de paquetes). No se documenta RLHF, DPO ni ninguna etapa de alineacion, algo esperable en un modelo puramente ASR.

## Capacidades

- Transcripcion de voz a texto en eslovaco (monolingue), con salida de texto plano.
- Reconocimiento robusto en condiciones de grabacion degradadas, gracias a la aumentacion de ruido aplicada en el 75 % de los lotes de entrenamiento.
- Cobertura de multiples dominios dentro del eslovaco: habla espontanea de plenos municipales, lectura de literatura, conferencias, corpus de voz colaborativa y grabaciones internas.
- Procesamiento de audio por segmentos de hasta 30 segundos; para entradas mas largas es necesario aplicar chunking o ventanas deslizantes.
- Puntuacion y capitalizacion generadas por el decodificador de Whisper (sin confirmacion explicita en la model card).
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje conversacional.
- No soporta vision ni audio multimodal mas alla de la entrada de audio para ASR.
- No hay modo "thinking" ni capacidades de agente.
- Idiomas: unicamente eslovaco. El ajuste monolingue degrada gravemente el rendimiento en el resto de idiomas (olvido catastrofico explicito en la model card).

## Casos de uso

- Transcripcion de sesiones de plenos municipales: es una de las fuentes del corpus de entrenamiento, por lo que el modelo esta expuesto al vocabulario y las condiciones acusticas de este dominio. Permite generar actas o buscadores de intervenciones a partir de grabaciones de sala, aplicando chunking sobre el audio completo.
- Subtitulado de video divulgativo y educativo: dado que el corpus incluye TEDxSK y JumpSK, el modelo es adecuado para transcribir charlas y generar subtitulos en eslovaco, con la ventaja de un coste de inferencia muy bajo al ser un modelo de 38 M de parametros.
- Preprocesado de corpus de voz para PLN: util como primer paso de pipelines de anotacion, mineria de datos o construccion de datasets en eslovaco, donde el volumen a procesar es alto y el coste por hora de audio importa mas que el WER absoluto.
- Atencion al cliente por voz en eslovaco: transcripcion de llamadas telefonicas para su analisis o enrutado posterior; la aumentacion con ruido telefonico y perdida de paquetes encaja con las condiciones de audio de telefonia. El modelo no genera respuestas, solo transcribe.
- Prototipado y evaluacion en investigacion: al ser un checkpoint pequeno y con licencia Apache 2.0, sirve como linea base rapida para comparar tecnicas de ASR en eslovaco sin necesidad de GPU de gama alta.
- Aplicaciones embebidas o de escritorio con transcripcion local: 38 M de parametros permiten ejecucion en CPU o en dispositivos con recursos limitados, con privacidad total al no requerir envio de audio a servicios externos.
- Generacion de transcripciones para indexacion y busqueda en archivos sonoros: transcripcion por lotes de entrevistas, podcast o archivos historicos en eslovaco para hacerlos consultables por texto.

## Benchmarks y rendimiento

Datos publicados en la model card. La metrica es WER (word error rate) y CER (character error rate); menor es mejor. Los conjuntos de evaluacion son CV24 (test split de Common Voice 24.0, 5.239 muestras) e Internal (conjunto reservado de KInIT, 9.317 muestras, estratificado por dominio y genero del hablante, un tercio limpio y dos tercios con aumentacion de ruido).

| Modelo | CV24 WER | CV24 CER | Internal WER | Internal CER |
|---|---|---|---|---|
| kinit/whisper-tiny-sk | 38,24 % | 13,53 % | 20,04 % | 8,86 % |
| openai/whisper-tiny | 105,14 % | 38,31 % | 99,47 % | 47,34 % |

Comparativa interna entre tamanos de Whisper, antes y despues del ajuste fino en eslovaco (WER sobre el conjunto interno de KInIT):

| Modelo | Ajustado: WER | Base: WER |
|---|---|---|
| Whisper Large v3 | 5,67 % | 16,22 % |
| Whisper Large v3 Turbo | 5,60 % | 18,35 % |
| Whisper Medium | 6,28 % | 29,19 % |
| Whisper Small | 8,64 % | 47,90 % |
| Whisper Base | 14,01 % | 76,38 % |
| Whisper Tiny | 20,04 % | 99,47 % |

No se han publicado en la informacion disponible resultados de benchmarks estandar tipo MMLU, HumanEval o GSM8K, que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB incluyendo el runtime. Los pesos en fp16 ocupan aproximadamente 76 MB y en fp32 unos 151 MB (coherente con el repositorio de 0,2 GB).
- GPU recomendadas: cualquier GPU moderna es suficiente, incluidas RTX 3060, RTX 4090, A100 o H100; el modelo no satura ninguna de ellas y el cuello de botella sera el preprocesado de audio, no la GPU.
- Cabe en GPU de consumo: si, en practicamente todas, incluso en iGPU y en aceleradores de gama baja. Tambien es viable en CPU.
- Opciones de despliegue: pipeline de Transformers (`pipeline("automatic-speech-recognition")`), HuggingFace Inference Endpoints (el modelo lleva la etiqueta `endpoints_compatible`), CTranslate2/faster-whisper, WhisperX y whisper.cpp previa conversion de pesos. Para vLLM o TGI no se confirma soporte especifico de este checkpoint en la informacion disponible.
- Latencia y throughput estimados: no disponible. La model card no publica medidas de latencia ni de factor de tiempo real. Cualquier cifra concreta requeriria una prueba propia sobre el hardware objetivo.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | WER interno (KInIT) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kinit/whisper-tiny-sk | ~38 M | eslovaco | 20,04 % | Apache 2.0 | HuggingFace |
| kinit/whisper-base-sk | ~74 M (Whisper Base) | eslovaco | 14,01 % | no disponible en la informacion consultada | HuggingFace (coleccion KInIT) |
| kinit/whisper-small-sk | ~244 M (Whisper Small) | eslovaco | 8,64 % | no disponible en la informacion consultada | HuggingFace (coleccion KInIT) |
| openai/whisper-tiny | ~38 M | multilingue (99 idiomas) | 99,47 % | Apache 2.0 | HuggingFace |

El compromiso es claro: whisper-tiny-sk es la opcion de menor coste computacional de la coleccion KInIT, pero su WER interno (20,04 %) es 6 puntos peor que Whisper Base ajustado (14,01 %) y mas del doble que Whisper Small ajustado (8,64 %). Si el caso de uso tolera algo mas de computo, Whisper Base o Small ajustados ofrecen una calidad notablemente superior con la misma licencia y el mismo pipeline de despliegue. Frente a openai/whisper-tiny, la mejora en eslovaco es de 79 puntos de WER en el conjunto interno, a cambio de perder por completo el soporte multilingue.

## Limitaciones y advertencias

- Olvido catastrofico: el ajuste exclusivo con datos en eslovaco degrada significativamente el rendimiento en otros idiomas. Si se necesita transcripcion multilingue, hay que usar openai/whisper-tiny o un modelo ajustado con datos multilingues.
- WER del 38,24 % en Common Voice 24.0: aunque la mejora respecto al modelo base es enorme, la calidad absoluta sigue siendo limitada para usos que requieran transcripcion muy precisa sin revision humana.
- Degradacion previsible con acentos marcados, variantes dialectales o dominios poco representados en el corpus de entrenamiento.
- Longitud maxima fiable de 30 segundos por segmento; sin chunking, los audios mas largos no se transcriben correctamente.
- Uso fuera de alcance declarado por el autor: audio no eslovaco, streaming en tiempo real sin un chunking adecuado y transcripcion en entornos criticos para la seguridad sin revision humana.
- Riesgo de alucinacion de texto en segmentos con silencio, musica o ruido extremo, un comportamiento conocido de la familia Whisper; conviene aplicar umbrales de confianza o deteccion de voz.
- El conjunto de evaluacion interno no es publico, por lo que sus cifras de WER no son reproducibles de forma independiente por terceros.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, con obligacion de conservar el aviso de licencia y el fichero de cambios si se modifica.
- El corpus de entrenamiento incluye grabaciones internas no publicas y datos personales anonimizados; no se detalla el volumen total de horas ni la composicion exacta por fuente.
- Datos no disponibles en la informacion consultada: numero total de tokens/horas de audio de entrenamiento, medidas de latencia, y cuantizaciones oficiales publicadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kinit/whisper-tiny-sk
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Coleccion ASR de KInIT (seis tamanos de Whisper mas los ajustes de NVIDIA NeMo): https://huggingface.co/collections/kinit/automatic-speech-recognition-6a42684efb87315cc9da3247
- Ficha en el catalogo SLAIH (es): https://www.slaih.sk/sk/catalog/whisper-tiny-sk
- Ficha en el catalogo SLAIH (en): https://www.slaih.sk/en/catalog/whisper-tiny-sk
- Endpoint de inferencia en FriendliAI: https://friendli.ai/models/kinit/whisper-tiny-sk
- Registro en free2aitools: https://free2aitools.com/model/kinit/whisper-tiny-sk
- Dataset SloPalSpeech: https://huggingface.co/datasets/NaiveNeuron/SloPalSpeech
- Dataset Mozilla Common Voice 24.0: https://huggingface.co/datasets/mozilla-foundation/common_voice_24_0
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Corpus TEDxSK y JumpSK (KEMT NLP): https://nlp.kemt.fei.tuke.sk/speech/tedx
- Documentacion del cluster HPC Devana: https://userdocs.hpc.sav.sk/devana/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
