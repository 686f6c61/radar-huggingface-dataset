# smajji/nemotron-hinglish-v13

## Resumen

Nemotron-Hinglish-v13 es un modelo de reconocimiento automatico del habla (ASR) en streaming, bilingue hindi-ingles, publicado por el usuario smajji en HuggingFace bajo el identificador `smajji/nemotron-hinglish-v13`. Se trata de un ajuste fino (fine-tuning) del modelo `nvidia/nemotron-3.5-asr-streaming-0.6b`, que emplea una arquitectura cache-aware FastConformer-RNNT con 0,6 mil millones de parametros. El objetivo del modelo es transcribir audio que combine hindi e ingles en una misma frase (code-mixed o Hinglish), un escenario habitual en la India y en comunidades de diaspora.

El modelo se presenta como la decimotercera iteracion de una serie de experimentos del mismo autor y como la version con mejor rendimiento global hasta la fecha. Segun la model card, se inicializa a partir del mejor checkpoint de la version v12 y se reequilibra hacia el ingles, manteniendo un buen comportamiento en hindi-ingles mezclado. El entrenamiento declara 2.628.488 enunciados y 5.834 horas de audio, con un 31 por ciento de datos code-mixed.

La relevancia actual del modelo reside en su caracter especializado: frente a sistemas ASR genericos centrados en ingles o hindi puro, esta variante apunta explicitamente al habla code-mixed y al reconocimiento en streaming con atencion cacheada, lo que lo hace apto para transcripcion de baja latencia. No obstante, la ficha publica es incompleta en metadatos clave (licencia, idiomas declarados, formato de pesos y cuantizacion), por lo que su evaluacion en produccion exige verificacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cache-aware FastConformer-RNNT (encoder FastConformer + decodificador RNN-Transducer) |
| Parametros totales | 0,6 mil millones (0,6B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Hindi, ingles y Hinglish code-mixed, segun la model card; los metadatos de idioma del repositorio no estan disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (la libreria declarada es NeMo; el repositorio ocupa 2,6 GB) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura cache-aware FastConformer-RNNT, una variante del transformer convolucional aumentado (Conformer) disenada por Nvidia para ASR en streaming. El termino cache-aware hace referencia a un mecanismo de atencion que mantiene una cache de estados previos para permitir decodificacion incremental sin recalcular todo el contexto acustico. El decodificador es un RNN-Transducer (RNNT), lo que habilita transcripcion en linea con alineacion implicita y sin necesidad de un modelo de lenguaje externo obligatorio. El tamano declarado es de 0,6 mil millones de parametros.

Los datos de entrenamiento declarados suman 2.628.488 enunciados y 5.834 horas de audio, con tres bloques: aproximadamente 1,14 millones de enunciados en ingles (incluyendo Indian-English de NPTEL, SPGISpeech, IndicTTS-Eng, india_accent_cv, NPTEL-tech, peoples_speech, IISc-SPICOR, earnings22, FLEURS-en y asr_task), unos 672.000 en hindi (Shrutilipi, Hindi-1482Hrs, audio stories, IndicVoices-R y FLEURS-hi) y unos 813.000 en Hinglish o code-mixed, que representan el 31 por ciento del total (hinglish_cc, MUCS, OpenSLR104, UJS, hinglish_casual y Roopa numbers). El ajuste se realiza sobre el mejor checkpoint de la version v12 con normalizacion de digitos por enunciado. No se detallan en la informacion disponible tecnicas de RLHF, DPO ni otros procesos de alineacion adicionales.

## Capacidades

- Reconocimiento automatico del habla en streaming con atencion cacheada, adecuado para transcripcion de baja latencia.
- Transcripcion bilingue de hindi e ingles, incluyendo habla code-mixed (Hinglish) dentro de una misma intervencion.
- Reconocimiento de numeros en contextos code-mixed (el benchmark `roopa` mide especificamente esta capacidad).
- Manejo de ingles con acento indio y de dominios tecnicos en ingles (`en_tech`).
- Normalizacion de digitos por enunciado aplicada durante el ajuste.
- No se declaran en la informacion disponible capacidades de vision, audio generativo, tool calling, function calling, agentes ni modo de razonamiento explicito; se trata de un modelo puramente ASR.

## Casos de uso

- Transcripcion de reuniones y llamadas con hablantes que alternan hindi e ingles: el modelo esta entrenado especificamente con un 31 por ciento de datos code-mixed, por lo que cubre mejor que un ASR monolingue los cambios de idioma a mitad de frase.
- Subtitulado en directo de contenido audiovisual indio: al emplear decodificacion en streaming con cache, puede generar subtitulos incrementales sin esperar al final del audio.
- Atencion al cliente en centros de contacto de India: transcripcion automatica de conversaciones telefonicas con mezcla de idiomas para trazabilidad y analitica posterior.
- Indexado y busqueda de archivos de audio en ingles tecnico: el ajuste favorece dominios como NPTEL-tech y SPGISpeech, utiles para transcribir material docente y conferencias tecnicas.
- Procesado por lotes de corpus de investigacion en linguistica: permite construir transcripciones de conjuntos como OpenSLR104 o MUCS, que forman parte del entrenamiento.
- Reconocimiento de numeros dictados (importes, telefonos, cantidades) en contextos code-mixed, apoyandose en el ajuste especifico medido por el benchmark `roopa`.
- Sistemas de accesibilidad para hablantes bilingues: transcripcion en vivo de voz a texto en aplicaciones asistivas donde el usuario alterna idiomas.

## Benchmarks y rendimiento

Los datos disponibles proceden de la model card del autor y corresponden a la comparativa entre las versiones v10, v12 y v13 sobre 12 conjuntos de datos. Los valores se expresan como porcentajes y, por la naturaleza de las metricas ASR, corresponden a tasas de error (menor es mejor).

| Metrica | v10 | v12 | v13 |
|---|---|---|---|
| Overall (mediana de 12 datasets) | 14,3% | 14,3% | 13,6% |
| en_tech | 12,5% | 12,5% | 11,8% |
| hi_unseen | 7,1% | 7,1% | 6,7% |
| code-mixed numbers (roopa) | 12,0% | 9,0% | 8,2% |
| hinglish (MUCS) | 42,9% | 33,3% | 33,3% |
| en_clean | 4,2% | 5,0% | 5,6% |

Segun el autor, v13 es la mejor version en terminos globales (ingles tecnico, hindi no visto y numeros code-mixed), mientras que v10 sigue siendo la mejor en ingles limpio y con acento indio. El informe completo de benchmarks v1-v13 figura en el archivo `BENCHMARKS.md` del repositorio. La busqueda web realizada no aporto resultados adicionales relevantes (los enlaces devueltos corresponden a un medio de noticias en urdu, sin relacion con el modelo).

## Requisitos de hardware

- VRAM estimada para inferencia (derivada del tamano de 0,6B, no confirmada por el autor): en FP32 en torno a 2,4 GB solo para pesos; en FP16/BF16 en torno a 1,2-1,5 GB; en INT8 en torno a 0,6-0,8 GB. A estas cifras hay que anadir la memoria del estado de cache y del decodificador RNNT.
- GPU recomendadas: no especificadas por el autor; por tamano, cualquier GPU con al menos 4 GB de VRAM es suficiente en teoria, incluyendo tarjetas de gama de entrada.
- Cabe en GPU de consumo: si, dado el tamano de 0,6B, deberia caber en RTX 3060, RTX 4060, RTX 4090 y similares; la cifra exacta depende del backend y de la precision.
- Opciones de despliegue: la libreria declarada es NeMo, por lo que el camino natural es el toolkit de Nvidia NeMo (y potencialmente Nvidia Riva para servicio en produccion). No se confirman en la informacion disponible soportes para vLLM, llama.cpp, Ollama o TGI, que en general no estan orientados a modelos ASR RNNT.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| smajji/nemotron-hinglish-v13 | 0,6B | FastConformer-RNNT | no disponible | Overall 13,6% (mediana 12 datasets) | no disponible | HuggingFace, libreria NeMo |
| nvidia/nemotron-3.5-asr-streaming-0.6b | 0,6B | FastConformer-RNNT | no disponible | no disponible | no disponible | HuggingFace (modelo base) |
| Otras alternativas ASR code-mixed hindi-ingles | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye datos de benchmarks del modelo base ni de otras alternativas comparables, por lo que no es posible establecer una comparacion cuantitativa con modelos de terceros.

## Limitaciones y advertencias

- Rendimiento desigual por dominio: la propia model card indica que v10 supera a v13 en ingles limpio (4,2% frente a 5,6%), de modo que v13 no es la mejor opcion para todos los escenarios.
- El error en hinglish sobre el conjunto MUCS sigue siendo alto (33,3%), lo que sugiere margen de mejora importante en habla code-mixed espontanea.
- No se han publicado datos sobre sesgos demograficos, acusticos o dialectales; el entrenamiento se apoya en fuentes indias e institucionales, lo que puede introducir sesgos hacia determinados acentos.
- Riesgo de alucinacion o sustitucion de palabras en pasajes ruidosos o con solapamiento de hablantes, inherente a los modelos ASR neuronales.
- La licencia no esta declarada, por lo que no puede confirmarse la viabilidad de uso comercial; es imprescindible verificarla con el autor antes de cualquier despliegue productivo.
- Los metadatos de idioma del repositorio no estan cumplimentados y el pipeline no esta declarado, lo que complica el descubrimiento y la integracion automatica.
- El modelo es especifico de habla (ASR); no procesa texto, codigo ni imagenes, y no soporta tool calling ni agentes.
- Al ser un modelo en streaming, la calidad de transcripcion puede degradarse en funcion del tamano de chunk configurado, aunque este dato no se detalla.
- El repositorio tiene solo 1 like y 0 descargas en el momento de la consulta y no ha sido validado de forma independiente.

## Enlaces

- HuggingFace: https://huggingface.co/smajji/nemotron-hinglish-v13
- Informe de benchmarks completo: archivo `BENCHMARKS.md` dentro del repositorio (enlace directo no disponible)
- Modelo base: nvidia/nemotron-3.5-asr-streaming-0.6b (enlace directo no proporcionado en la informacion disponible)
- No se han encontrado papers, blogs ni demos adicionales en la busqueda web realizada.
