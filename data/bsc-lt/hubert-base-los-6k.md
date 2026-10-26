# BSC-LT/hubert-base-los-6k

## Resumen

HuBERT-base-los-6k es un modelo de representaciones de voz (speech representations) desarrollado por el Barcelona Supercomputing Center (BSC-LT) mediante preentrenamiento auto-supervisado sobre unas 6.000 horas de audio en lenguas iberorrománicas: español, catalán, euskera, gallego y aranés, además de inglés. Parte de la arquitectura HuBERT Base de Facebook (12 capas transformer) y se distribuye como checkpoint PyTorch de 0,8 GB en HuggingFace.

No es un modelo de reconocimiento automático del habla listo para usar: no incluye tokenizer ni cabeza de decodificación, sino que produce representaciones acústicas que deben fine-tunearse con datos etiquetados para ASR, clasificación de audio o identificación de idioma (LID). Su interés radica en cubrir lenguas con recursos escasos y variedades dialectales (valenciano, aranés) que quedan fuera de los modelos multilingües de gran escala entrenados sobre cientos de miles de horas de audio.

El modelo se publica con licencia no disponible, sin resultados numéricos de benchmarks en la información accesible y con parte del corpus de preentrenamiento todavía privado, lo que condiciona tanto su reproducibilidad como su adopción en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HuBERT Base: transformer de 12 capas, preentrenamiento auto-supervisado sobre audio en bruto (misma arquitectura que facebook/hubert-base-ls960) |
| Parametros totales | no disponible en la informacion proporcionada (arquitectura HuBERT Base de 12 capas) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no aplica: modelo de representaciones de voz, sin ventana de contexto textual; el autor no especifica longitud maxima de audio de entrada |
| Tipos de cuantizacion | no disponible (solo se publica checkpoint PyTorch; no hay versiones cuantizadas ni GGUF) |
| Idiomas soportados | ca (catalan), es (espanol), eu (euskera), gl (gallego), oc (aranes), en (ingles) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (no se publican versiones safetensors, GGUF ni ONNX); repositorio de 0,8 GB |
| Modelo base | facebook/hubert-base-ls960 (fine-tune del mismo) |
| Pipeline declarado en HuggingFace | no disponible |
| Datos de preentrenamiento | ~6.000 horas de audio (5.858 h desglosadas en la model card) |
| Metricas declaradas | WER (ASR) y F1 (LID) |
| Descargas / likes | 55 / 1 |

## Arquitectura y entrenamiento

Se reutiliza el codigo oficial de HuBERT del repositorio de fairseq y la configuracion de entrenamiento descrita en el paper original de HuBERT. La arquitectura es identica a HuBERT Base: 12 capas transformer que transforman la forma de onda en representaciones a nivel de trama, sin tokenizer ni vocabulario, ya que el preentrenamiento es puramente acustico. El objetivo de preentrenamiento es la prediccion de unidades discretas enmascaradas (clustering iterativo de features MFCC y posteriores), tal como define el paper.

El corpus se compone de subconjuntos de entrenamiento de 18 fuentes, con un reparto por lengua de aproximadamente 1.000 h por idioma en espanol, catalan, gallego, aranes e ingles, y 858 h en euskera. La suma de las horas desglosadas en la model card es de 5.858 h frente a las 6.000 h declaradas:

| Idioma | Horas | Fuentes principales |
|---|---|---|
| Espanol | 1.000 | Basque Parliament (343 h), VoxPopuli (151 h), CommonVoice 23 (506 h) |
| Catalan | 1.000 | 3CatParla (340 h), Catalan YouTube Speech (340 h), CommonVoice 23 (112 h), Corts Valencianes (90 h), parlament_parla_v3 (90 h), IB3 (28 h) |
| Gallego | 1.000 | Nos_ParlaSpeech-GL (527 h), Nos_RG-Podcast-GL (258 h), CommonVoice 23 (156 h), Nos_Transcrispeech-GL (35 h), Nos_Celtia-GL (24 h) |
| Euskera | 858 | CommonVoice 23 (431 h), Basque Parliament (427 h) |
| Aranes | 1.000 | 3Cat_aranese (corpus privado) |
| Ingles | 1.000 | VoxPopuli (500 h), CommonVoice 23 (500 h) |

No se documenta en la informacion disponible el uso de RLHF, DPO ni ninguna fase de alineacion, algo esperable en un modelo auto-supervisado sin cabeza generativa. Cuatro de los corpus empleados (IB3, parlament_parla_v3, 3CatParla y 3Cat_aranese) son privados y el autor indica que se publicaran proximamente; en Corts Valencianes se uso la version no anonimizada, mientras que la publica esta anonimizada.

## Capacidades

- Extraccion de representaciones acusticas a nivel de trama (estados ocultos de 12 capas) para cualquier tarea de habla en las seis lenguas cubiertas.
- Fine-tuning para reconocimiento automatico del habla (ASR) mediante CTC o arquitecturas seq2seq previa creacion de tokenizer y anadir cabeza de decodificacion.
- Fine-tuning para clasificacion de audio (HubertForSequenceClassification), tal como indica el autor enlazando el tutorial de audio classification de Transformers.
- Identificacion de idioma (LID): metrica F1 declarada en los metadatos del modelo y evaluada de forma indirecta por el autor.
- Capacidad multilingue restringida al ambito iberorromanico (es, ca, eu, gl, oc) mas ingles; no cubre otras familias linguisticas.
- Uso como extractor de features congelado en pipelines downstream (segmentacion, deteccion de eventos, frontend para modelos de hablante).
- No soporta generacion de texto, tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio generativo: no es un modelo de lenguaje.
- No incluye modo thinking, ni capacidad de dialogo, ni instrucciones en lenguaje natural.

## Casos de uso

- ASR para catalan en la administracion publica: fine-tuning con Corts Valencianes, 3CatParla y Parlament_parla para transcribir sesiones parlamentarias y plenos municipales; el modelo aporta representaciones especificas del dominio parlamentario y de la variedad valenciana.
- Transcripcion de euskera en el Parlamento Vasco: las 427 h del Basque Parliament Speech Corpus permiten ajustar un modelo CTC para actas y subtitulado institucional, un dominio con vocabulario y estilo muy estables.
- Subtitulado de video en catalan: partiendo de las 340 h de Catalan YouTube Speech, se puede entrenar un reconocedor para contenido divulgativo y entrevistas, reduciendo el coste frente a soluciones propietarias por minuto de audio.
- Transcripcion de podcast y radio en gallego: las 527 h de Nos_ParlaSpeech-GL y 258 h de Nos_RG-Podcast-GL cubren registro espontaneo, adecuado para indexar y buscar contenido de la Radio Galega.
- Identificacion de idioma en atencion telefonica de comunidades bilingues: entrenando un clasificador sobre features congelados se puede enrutar llamadas en catalan, euskera, gallego o espanol antes de invocar el agente conversacional correspondiente.
- Clasificacion y segmentacion de archivos audiovisuales de radios autonomicas (IB3, 3Cat): deteccion de habla, musica, publicidad o locucion sobre las representaciones del modelo, como paso previo a la transcripcion selectiva.
- Investigacion linguistica sobre aranes y variedades del catalan: el corpus 3Cat_aranese (1.000 h) es practicamente inedito en modelos abiertos y permite estudiar transferencia entre occitano y catalan.
- Frontend de features para tareas de hablante (diarizacion, verificacion): uso plausible de las representaciones, aunque el autor no lo evalua ni lo documenta explicitamente.

## Benchmarks y rendimiento

La model card describe una evaluacion indirecta mediante dos tareas, ASR y LID, construyendo para cada idioma subconjuntos etiquetados de 50 horas de entrenamiento y validacion. En la informacion disponible no se incluyen las cifras resultantes:

| Tarea | Idiomas evaluados | Metrica | Resultado |
|---|---|---|---|
| ASR (indirecta, fine-tuning) | es, ca, eu, gl, oc, en | WER | no disponible (cifras no incluidas en el extracto de la model card) |
| LID (indirecta) | es, ca, eu, gl, oc, en | F1 | no disponible (cifras no incluidas en el extracto de la model card) |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos: el repositorio ocupa 0,8 GB, correspondiente al checkpoint PyTorch en fp32.
- VRAM de inferencia: no publicada por el autor; por el tamano del checkpoint, un proceso de extraccion de features con lotes pequenos de audio deberia manejarse por debajo de 2-4 GB de VRAM (estimacion orientativa, no verificada).
- Fine-tuning: no hay cifras oficiales; para lotes de audio de 20-30 s con fp16 y gradient checkpointing es razonable reservar 16-24 GB de VRAM (A100 40 GB, RTX 4090 24 GB, L40S).
- GPU de consumo: si cabe en tarjetas de gama media para inferencia (RTX 3060 12 GB, RTX 4060 Ti 16 GB, incluso 6-8 GB con lotes de una sola utterance).
- Despliegue: PyTorch + Transformers mediante HubertModel, HubertForCTC y HubertForSequenceClassification; exportacion a ONNX posible como via de optimizacion; fairseq solo para reproducir el preentrenamiento.
- vLLM, TGI, llama.cpp y Ollama no estan orientados a este tipo de modelo y no ofrecen soporte nativo de HuBERT.
- Latencia y throughput: no disponible; dependen del backend, de la longitud de audio y del hardware, y el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Arquitectura | Cobertura linguistica | Horas de preentrenamiento | Licencia | Notas |
|---|---|---|---|---|---|
| BSC-LT/hubert-base-los-6k | HuBERT Base, 12 capas | es, ca, eu, gl, oc, en | ~6.000 h | no disponible | Especializado en lenguas ibericas; corpus parcialmente privado |
| facebook/hubert-base-ls960 | HuBERT Base, 12 capas | ingles | 960 h (LibriSpeech, segun el identificador del modelo) | no disponible en la informacion | Modelo de partida; no cubre lenguas ibericas |
| facebook/wav2vec2-large-xlsr-53 | no disponible en la informacion | multilingue | no disponible | no disponible | Alternativa multilingue habitual, sin foco iberico |
| facebook/mms-1b | no disponible en la informacion | multilingue (mas de 1.000 lenguas) | no disponible | no disponible | Cobertura mucho mayor pero sin especializacion en variedades (aranes, valenciano) |

Las alternativas se incluyen como referencia de categoria; sus especificaciones no forman parte de la informacion proporcionada y no se han verificado aqui.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribucion de los pesos; es un bloqueo potencial para produccion.
- No es un modelo ASR listo para usar: carece de tokenizer y de cabeza de decodificacion; requiere fine-tuning con datos etiquetados y anadir un vocabulario.
- Evaluacion indirecta y sin cifras publicas en la informacion disponible: no hay WER ni F1 verificables para comparar con alternativas.
- Reproducibilidad parcial: cuatro corpus de preentrenamiento (IB3, parlament_parla_v3, 3CatParla, 3Cat_aranese) son privados en el momento de la publicacion.
- Corts Valencianes se entreno con la version no anonimizada, mientras que la publica esta anonimizada; los resultados pueden no replicarse con la version publica.
- Desbalance de dominio: el aranes se cubre con 1.000 h de una unica fuente privada, mientras que el gallego combina cinco registros distintos; el comportamiento por variedad no esta documentado.
- Sesgo no documentado: el autor no publica analisis de sesgos. La composicion (CommonVoice, retransmisiones parlamentarias, YouTube) sobrerrepresenta habla leida y registro formal.
- Riesgo de degradacion en dominios no cubiertos (conversacional espontaneo, ruido de calle, acentos no presentes en el corpus); no evaluado por el autor.
- Alucinacion en el sentido de los LLM no aplica; en un fine-tuning ASR si puede producir hipotesis plausibles pero incorrectas en audio ruidoso, sin que existan metricas publicadas al respecto.
- Capacidad acotada por la arquitectura Base de 12 capas: las variantes large o x-large ofrecen mayor capacidad, a costa de mas VRAM y latencia.
- Fechas de creacion y actualizacion del repositorio en HuggingFace (2026) no coinciden con el ciclo habitual de publicacion; conviene verificar la version antes de descargar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BSC-LT/hubert-base-los-6k
- Modelo base: https://huggingface.co/facebook/hubert-base-ls960
- Repositorio oficial de HuBERT en fairseq: https://github.com/facebookresearch/fairseq/tree/main/examples/hubert
- Paper de HuBERT (IEEE): https://ieeexplore.ieee.org/document/9585401
- Tutorial de fine-tuning para ASR (wav2vec2, extensible a HuBERT): https://huggingface.co/blog/fine-tune-wav2vec2-english
- Tutorial de clasificacion de audio en Transformers: https://huggingface.co/docs/transformers/main/en/tasks/audio_classification
- Barcelona Supercomputing Center: https://bsc.es/
- Mozilla Common Voice: https://commonvoice.mozilla.org/
- Dataset Basque Parliament Speech Corpus 1.0: https://huggingface.co/datasets/gttsehu/basque_parliament_1
- Dataset VoxPopuli: https://huggingface.co/datasets/facebook/voxpopuli
- Dataset IB3 ca ASR: https://huggingface.co/datasets/projecte-aina/ib3_ca_asr
- Dataset parlament_parla_v3 ASR: https://huggingface.co/datasets/projecte-aina/parlament_parla_v3_asr
- Dataset Corts Valencianes ASR: https://huggingface.co/datasets/projecte-aina/corts_valencianes_asr_a
- Dataset Catalan YouTube Speech: https://huggingface.co/datasets/softcatala/catalan-youtube-speech
- Dataset 3CatParla ASR: https://huggingface.co/datasets/projecte-aina/3catparla_asr
- Dataset Nos_Celtia-GL: https://zenodo.org/records/7716958
- Dataset Nos_Transcrispeech-GL: https://huggingface.co/datasets/proxectonos/Nos_Transcrispeech-GL
- Dataset Nos_RG-Podcast-GL: https://huggingface.co/datasets/proxectonos/Nos_RG-Podcast-GL
- Dataset Nos_ParlaSpeech-GL: https://huggingface.co/datasets/proxectonos/Nos_Parlaspeech-GL
- Busqueda web: sin resultados relevantes; los resultados devueltos (Wikipedia sobre titulaciones BSc, BeSoccer) no guardan relacion con el modelo.
