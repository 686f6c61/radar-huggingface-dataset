# huwenjie333/omniASR-1B-ft-af51-1109

## Resumen

omniASR-1B-ft-af51-1109 es un modelo de reconocimiento automatico del habla (ASR) derivado de `omniASR_LLM_1B_v2`, la familia de modelos omnilingues de Meta (Facebook Research) construida sobre fairseq2. El autor del repositorio, `huwenjie333`, ha realizado un fine-tuning del checkpoint base de 1B mediante el pipeline de speech-to-text `omni-asr` (ejecucion `omniASR_LLM_1B_v2-full-lr5e-05-ep5-af51-full-1109-5c50`), obteniendo como mejor checkpoint el `checkpoint-16887`, con un WER medio de evaluacion de 0,2464. El modelo esta publicado en Hugging Face con 0 descargas y 0 likes en el momento de redactar esta ficha.

El modelo resuelve la transcripcion de audio a texto en un conjunto amplio de lenguas, con enfasis en lenguas africanas: la tabla de identificadores de idioma del model card cubre 50 codigos que van desde `ach_Latn` (acoli) hasta `zul_Latn` (zulu), pasando por `afr_Latn`, `amh_Ethi`, `eng_Latn`, `fra_Latn`, `swa_Latn` o `yor_Latn`. Resulta relevante para investigadores y desarrolladores que trabajan con ASR multilingue de bajo recurso, especialmente en el ambito subsahariano, donde la cobertura de modelos comerciales es habitualmente escasa.

Los pesos son un checkpoint nativo de fairseq2, no un modelo de transformers al uso: se cargan mediante la libreria `omnilingual-asr` (que depende de fairseq2 0.6) y el repositorio pesa 9,1 GB con 2.279.609.984 parametros en formato safetensors. La arquitectura combina un codificador acustico con un decodificador de tipo LLM (de ahi la denominacion `omniASR_LLM_1B_v2`), si bien los detalles internos de capas y atencion no estan documentados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder ASR sobre fairseq2 (familia `omniASR_LLM_1B_v2`); detalle de capas no disponible |
| Parametros totales | 2.279.609.984 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint safetensors en precision nativa) |
| Idiomas soportados | 50 codigos omniASR: ach_Latn, afr_Latn, aka_Latn, amh_Ethi, bam_Latn, bem_Latn, kab_Latn, cgg_Latn, dag_Latn, dga_Latn, eng_Latn, ewe_Latn, fra_Latn, ful_Latn, hau_Latn, ibo_Latn, knc_Latn, kik_Latn, kin_Latn, kln_Latn, koo_Latn, kpo_Latn, led_Latn, lgg_Latn, lin_Latn, lth_Latn, lug_Latn, luo_Latn, luy_Latn (nuevo), mlg_Latn, myx_Latn, nbl_Latn (nuevo), nya_Latn, nyn_Latn, orm_Latn, pcm_Latn, ruc_Latn, rwm_Latn, sna_Latn, som_Latn, sot_Latn (nuevo), swh_Latn, teo_Latn, tsn_Latn, ttj_Latn, wol_Latn, xho_Latn, xog_Latn, yor_Latn, zul_Latn |
| Licencia | no disponible |
| Formato de pesos | safetensors (checkpoint fairseq2) + asset card YAML |

## Arquitectura y entrenamiento

El modelo parte de `omniASR_LLM_1B_v2`, un checkpoint de la familia omnilingual-asr de Meta construida sobre fairseq2. La nomenclatura `LLM` indica que el decodificador es un modelo de lenguaje de aproximadamente 1B de parametros acoplado a un codificador acustico, aunque la model card no detalla el numero de capas, la dimension de embedding, el tipo de atencion ni la estrategia de fusion entre modalidades. El checkpoint resultante tiene 2.279.609.984 parametros totales en safetensors, lo que sugiere que la cifra "1B" del nombre corresponde al submodulo de lenguaje y no al total del sistema.

El entrenamiento consistio en un fine-tuning del checkpoint base mediante el pipeline `speech-to-text/omni-asr` con los hiperparametros reflejados en el nombre de la ejecucion: learning rate 5e-05, 5 epocas, particion `af51-full`, fecha 1109 y semilla/identificador `5c50`. No se especifica en la informacion disponible el volumen de horas de audio, la composicion del dataset de fine-tuning, ni si se aplicaron tecnicas de aumento de datos o regularizacion. El unico metadato de rendimiento publicado es `eval_WER_mean = 0,2464` en el checkpoint `checkpoint-16887`.

Una particularidad tecnica destacable es la gestion de identificadores de idioma: omniASR reconstruye su mapa de lenguas en cada carga, por lo que tres codigos nuevos (`luy_Latn`, `nbl_Latn`, `sot_Latn`) deben registrarse manualmente tras instanciar el pipeline, reutilizando filas de embedding de otras lenguas (`lwg_Latn`, `zyp_Latn` y `nso_Latn` respectivamente). Esto implica que el modelo reutiliza representaciones linguisticas preexistentes en lugar de aprender embeddings nuevos para esas tres lenguas.

## Capacidades

- Transcripcion de audio a texto (ASR) en 50 lenguas codificadas segun el esquema omniASR, con cobertura amplia de lenguas africanas.
- Procesamiento por lotes: el pipeline `ASRInferencePipeline` acepta listas de audios y un parametro `batch_size` configurable.
- Seleccion explicita de idioma mediante el parametro `lang`, lo que permite forzar el decoding en la lengua deseada para mejorar precision.
- Soporte de tres identificadores de idioma adicionales (`luy_Latn`, `nbl_Latn`, `sot_Latn`) mediante registro manual en el mapa de lenguas del pipeline.
- Integracion con el ecosistema fairseq2 0.6 y con la libreria `omnilingual-asr` para inferencia.
- Descarga automatica de pesos desde Hugging Face en el primer uso, gestionada por el mecanismo de asset cards de fairseq2.
- No consta soporte de traduccion speech-to-text, diarizacion, timestamps a nivel de palabra, tool calling, agentes, vision ni audio understanding mas alla de la transcripcion.

## Casos de uso

- Transcripcion de reuniones y entrevistas en lenguas africanas: el modelo cubre codigos como `swa_Latn`, `yor_Latn`, `ibo_Latn`, `hau_Latn` o `zul_Latn`, lo que permite generar actas en contextos donde los servicios comerciales no ofrecen soporte.
- Investigacion linguistica de campo: transcripcion automatizada de grabaciones de elicitation en lenguas de bajo recurso (`ach_Latn`, `lgg_Latn`, `teo_Latn`, etc.), reduciendo el esfuerzo manual de anotacion previa a la revision por hablantes nativos.
- Construccion de corpus para entrenamiento de modelos: uso del ASR como paso de pseudo-etiquetado de audio masivo para generar transcripciones iniciales que luego se corrigen manualmente.
- Subtitulado de contenido audiovisual regional: el pipeline permite procesar lotes de ficheros WAV con `batch_size` configurable, adecuado para catalogos de video en lenguas como `lug_Latn`, `lin_Latn` o `nya_Latn`.
- Atencion al ciudadano y servicios publicos multilingues: transcripcion de llamadas o mensajes de voz en paises con varias lenguas oficiales (`kin_Latn`, `sna_Latn`, `som_Latn`, `orm_Latn`), alimentando posteriormente sistemas de analitica textual.
- Evaluacion comparativa de ASR multilingue: al ser un checkpoint de fairseq2 con WER publicado (0,2464), sirve como referencia reproducible para investigaciones sobre adaptacion de modelos omnilingues.
- Prototipado de pipelines de voz en entornos sin conectividad a APIs comerciales: los pesos son locales y la inferencia se ejecuta con librerias open source, lo que permite despliegues on-premise.

## Benchmarks y rendimiento

El unico dato de rendimiento publicado en la informacion disponible es el WER medio de evaluacion del mejor checkpoint:

| Metrica | Valor | Checkpoint |
|---|---|---|
| eval_WER_mean | 0,2464 | checkpoint-16887 |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K, WER por idioma, CER, etc.) en la informacion disponible. No se dispone de desagregacion por lengua ni de comparacion con el checkpoint base `omniASR_LLM_1B_v2`.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2.279.609.984 parametros en safetensors, los pesos ocuparian aproximadamente 4,5 GB en FP16/BF16 y alrededor de 9,1 GB en FP32. El repositorio completo pesa 9,1 GB, consistente con pesos en precision alta.
- GPU recomendadas: no hay datos especificos del autor sobre latencia o throughput. Por tamano, una GPU con 16 GB de VRAM (RTX 4090, RTX A4000, L4) deberia alojar los pesos en BF16 con margen para activaciones; GPUs de datacenter (A100 40/80 GB, H100) permitirian lotes mayores y mayor throughput.
- Cabe en GPU consumer: si, previsiblemente en RTX 3090, RTX 4090 y RTX 4080 (16 GB) con pesos en BF16; en GPUs de 8-12 GB seria necesario cuantizar o reducir el batch, aunque no se documentan formatos de cuantizacion.
- Opciones de despliegue: la via oficial es la libreria `omnilingual-asr` con fairseq2 0.6, cargando el modelo por nombre desde la asset card. No consta soporte de vLLM, llama.cpp, Ollama ni TGI, dado que es un checkpoint fairseq2 nativo y no un modelo de transformers.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Rendimiento publicado |
|---|---|---|---|---|---|---|
| omniASR-1B-ft-af51-1109 | 2.279.609.984 | no disponible | 50 codigos omniASR | no disponible | safetensors (fairseq2) | WER medio 0,2464 |
| omniASR_LLM_1B_v2 (base) | ~1B (submodulo LLM) | no disponible | conjunto omnilingue de Meta | no disponible en esta ficha | safetensors (fairseq2) | no disponible aqui |
| Whisper large-v3 (OpenAI) | ~1.550M | 30 s de audio | ~99 idiomas | MIT | safetensors, GGUF, etc. | WER publicado por OpenAI |
| MMS (Meta) | ~1.000M (segun variante) | no disponible | ~1.100 idiomas | CC-BY-NC 4.0 | PyTorch | WER publicado por Meta |

La comparativa con Whisper large-v3 y MMS se ofrece como referencia de categoria (ASR multilingue de tamano ~1-1,5B), pero los datos de esos modelos no provienen de la informacion proporcionada en esta ficha y deben verificarse en sus respectivas model cards. No se dispone de una comparacion directa de WER entre omniASR-1B-ft-af51-1109 y alternativas en el mismo conjunto de evaluacion.

## Limitaciones y advertencias

- WER medio de 0,2464: se trata de una tasa de error elevada para produccion generalista; sera necesario revisar las transcripciones antes de usos criticos y evaluar por idioma, ya que el promedio puede ocultar diferencias grandes entre lenguas.
- Cobertura de lenguas limitada a los 50 codigos listados; fuera de ese conjunto el modelo no ofrece garantias.
- Tres identificadores (`luy_Latn`, `nbl_Latn`, `sot_Latn`) reutilizan filas de embedding de otras lenguas, lo que puede degradar la precision en esas lenguas respecto a un embedding entrenado especificamente.
- El mapa de lenguas se reconstruye en cada carga: si no se registran manualmente los codigos nuevos, el pipeline fallara o usara el codigo prestado, con resultados potencialmente peores.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; conviene contactar con el autor o revisar la licencia del checkpoint base `omniASR_LLM_1B_v2` antes de desplegar en produccion.
- Ausencia de benchmarks desagregados por idioma, de datos sobre robustez a ruido, acentos o audio de telefonia, y de informacion sobre sesgos acusticos o demograficos.
- Riesgo de alucinacion en ASR: los decodificadores de tipo LLM pueden generar texto plausible no presente en el audio, especialmente con silencios, ruido o audio fuera de distribucion.
- Dependencia del ecosistema fairseq2 0.6 y de la libreria `omnilingual-asr`; la integracion con stacks basados en transformers, vLLM o llama.cpp no esta documentada.
- Repositorio con 0 descargas y 0 likes: modelo practicamente sin validacion comunitaria, lo que aumenta el riesgo de comportamientos no documentados.
- Fecha de creacion del repositorio (2026-11-21) posterior a la mayoria de checkpoints publicos de la familia, sin historial de iteraciones visible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huwenjie333/omniASR-1B-ft-af51-1109
- Repositorio omnilingual-asr (Meta): https://github.com/facebookresearch/omnilingual-asr
- Libreria fairseq2: no disponible enlace especifico en la informacion proporcionada
- Paper de omnilingual ASR: no disponible en la informacion proporcionada
- Demo o espacio asociado: no disponible en la informacion proporcionada
