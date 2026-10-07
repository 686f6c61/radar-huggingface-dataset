# SalmonAI123/yt2026_batch02_10kh

## Resumen

`SalmonAI123/yt2026_batch02_10kh` es un corpus de audio en vietnamita extraido de YouTube mediante rastreo automatico, publicado en HuggingFace bajo el identificador de SalmonAI123. A pesar de estar registrado con el pipeline `automatic-speech-recognition` y las etiquetas propias de ASR, no se trata de un modelo entrenado sino de un conjunto de datos de audio en bruto: 11.884,0 horas repartidas en 17.754 ficheros `.webm` (Opus, 48 kHz, mono, sin recodificacion), procedentes de 320 canales de YouTube y con un tamano total de 624,7 GB. El repositorio incluye ademas 18.800 ficheros de metadatos `info.json` generados con yt-dlp y un `manifest.jsonl` con la procedencia de cada clip.

El rasgo definitorio del corpus es su ventana temporal: solo incluye videos publicados entre el 1 de enero de 2026 y el 6 de octubre de 2026, aplicando un filtro duro en el momento del rastreo y auditable clip a clip mediante el campo `upload_date`. Segun el autor, esto lo hace disjunto de corpus publicos anteriores como GigaSpeech 1 (que cubre 2018-2021) o GigaSpeech 2 (anterior a 2026), lo que resulta util para combinar fuentes sin solapamientos.

El problema que aborda es la escasez de datos de habla vietnamita espontanea: los corpus publicos existentes tienden a ser pequenos y a sesgarse hacia habla leida y limpia, mientras que este recoge comentario, noticias, charlas religiosas, entrevistas de calle y retransmisiones en directo, con acentos, ruido de fondo, artefactos de microfono y alternancia de codigo vietnamita-ingles. La limitacion critica es que no contiene transcripciones: es una release de audio crudo, y cualquier uso para ASR exige una etapa de anotacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo entrenado; es un corpus de audio en bruto) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica; duracion de clip: mediana 613 s, minimo 2 s, maximo 81.109 s (166 clips <= 10 s y 5.853 clips >= 30 min) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | vietnamita (vie), con alternancia de codigo vietnamita-ingles presente de forma natural |
| Licencia | `other` con nombre `research-only` (uso exclusivamente de investigacion no comercial) |
| Formato de pesos | no aplica; audio en `.webm` (Opus 48 kHz mono, sin recodificar), metadatos `info.json` de yt-dlp, `manifest.jsonl`, `SHA256SUMS`, `files.txt`, `stats.json`, `used_ids.txt`, `UNIT.json` |

Datos adicionales del corpus:

| Parametro | Valor |
|---|---|
| Horas de audio | 11.884,0 h |
| Numero de ficheros de audio | 17.754 |
| Canales de YouTube | 320 |
| Ficheros totales | 36.554 |
| Tamano total | 624,7 GB |
| Tamano medio / mediano por fichero | 35,2 MB / 9,1 MB |
| Ventana de publicacion | 20260101 a 20261006 (solo 2026, filtro duro) |
| Descargas / likes en HuggingFace | 0 / 0 |

## Arquitectura y entrenamiento

No aplica en el sentido habitual: el repositorio no contiene pesos ni un modelo entrenado. Se trata de la etapa de adquisicion de datos de un pipeline de ASR en vietnamita. La "arquitectura" del artefacto es un layout de directorios y ficheros de metadatos que documenta la procedencia de cada clip:

```
audio/<channel_id>/<upload_date>#<title>#<channel_id>#<video_id>_<duration>.webm
audio/<channel_id>/<upload_date>#<title>#<channel_id>#<video_id>_<duration>.info.json
manifest.jsonl · SHA256SUMS · files.txt · stats.json · used_ids.txt · UNIT.json
```

El registro `manifest.jsonl` contiene un objeto JSON por fichero de audio con los campos `rel_path`, `audio_path`, `video_id`, `channel_id`, `upload_date` (formato `YYYYMMDD`), `duration`, `size`, `mtime`, `sha256` e `info_json_path`. La integridad se verifica con `sha256sum -c SHA256SUMS` y el campo `used_ids.txt` congela los `video_id` incluidos en la unidad para evitar duplicados entre unidades futuras. El autor indica que esta unidad es de aproximadamente 10.000 h y que habra mas unidades hasta alcanzar entre 50.000 y 100.000 h.

En cuanto a los datos, no hay proceso de entrenamiento ni de alineacion: el corpus es audio sin transcribir. No se documenta ningun uso de RLHF, DPO ni similares, ni una composicion de dataset por genero, dialecto o duracion mas alla de los agregados mensuales y por canal que ofrece `stats.json`. La distribucion mensual publicada es muy desigual: de 354,1 h en enero de 2026 a 5.187,6 h en septiembre de 2026, con 2.811 clips en agosto y 5.721 en septiembre.

## Capacidades

- Suministro de audio real no guionizado en vietnamita para entrenamiento y evaluacion de ASR, con acentos, ruido de fondo y artefactos de microfono.
- Cobertura de dominios variados: comentario, noticias, charlas religiosas, entrevistas de calle, retransmisiones en directo, llamadas telefonicas, radio y television, grabaciones de campo y audio de captura de pantalla.
- Material para investigacion de alternancia de codigo vietnamita-ingles, presente de forma natural en los medios vietnamitas contemporaneos.
- Base para preentrenamiento autosupervisado de codificadores de voz en vietnamita (estilo wav2vec 2.0 o HuBERT), al no requerir etiquetas.
- Base para adaptacion de dominio y evaluacion de robustez de modelos ASR existentes mediante pseudo-etiquetado.
- Material para tareas auxiliares de voz: deteccion de actividad vocal, diarizacion de hablantes y segmentacion.
- Procedencia auditable por clip (`video_id`, `channel_id`, `upload_date`), lo que permite reproducir, filtrar o solicitar la retirada de elementos concretos.
- No incluye tool calling, function calling, soporte de agentes, vision, audio de salida ni modo de razonamiento: no es un modelo de lenguaje ni un modelo multimodal.

## Casos de uso

- Preentrenamiento autosupervisado de un codificador acustico en vietnamita: las 11.884,0 h de audio sin etiquetas permiten entrenar representaciones con objetivos tipo wav2vec 2.0 o HuBERT, y despues ajustar con un corpus pequeno y transcrito. Es el uso mas natural de una release de audio crudo.
- Pseudo-etiquetado para arrancar un sistema ASR: ejecutar un modelo ASR vietnamita existente sobre los clips, filtrar por confianza y usar las transcripciones resultantes como semilla de un corpus etiquetado de mayor tamano.
- Adaptacion de dominio de un modelo ASR en produccion: si un sistema entrenado con habla leida falla con habla espontanea, este corpus aporta precisamente comentario, entrevistas y directos para ajuste fino supervisado o semi-supervisado.
- Evaluacion de robustez acustica: los clips cubren llamadas, radio, television, grabaciones de campo y captura de pantalla, de modo que se pueden construir particiones de test por condicion y medir la degradacion del WER (tasa de error de palabras).
- Investigacion sobre alternancia de codigo vietnamita-ingles: el corpus contiene ese fenomeno de forma espontanea, util para estudiar su impacto en el reconocimiento y en el modelado de lenguaje.
- Deteccion de actividad vocal y diarizacion: los 166 clips de 10 s o menos y los 5.853 clips de 30 min o mas permiten construir conjuntos de prueba tanto para segmentacion corta como para audio de larga duracion.
- Estudio de variacion dialectal: con 320 canales distintos y agregados por canal en `stats.json`, se pueden agrupar clips por origen y analizar diferencias de acento.
- Formacion de pipelines de transcripcion a escala: dado que cada clip trae su `sha256` y su procedencia, se puede montar un flujo reproducible de descarga, verificacion, transcripcion y publicacion de anotaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye transcripciones, por lo que tampoco puede emplearse directamente para calcular WER u otras metricas sin una etapa previa de anotacion.

## Requisitos de hardware

- Almacenamiento: 624,7 GB para el corpus completo; conviene descargar subconjuntos con filtros (`--include "UCxxx/*"`) para no replicar el total en disco local.
- Ancho de banda: la descarga de las 11.884,0 h desde HuggingFace es la operacion mas costosa en tiempo; el tamano medio por fichero es de 35,2 MB.
- GPU para inferencia: no aplica al corpus en si. Para transcribirlo con un modelo ASR externo, el cuello de botella es ese modelo, no el corpus.
- Cabe en GPU de consumo: no aplica al corpus (son ficheros de audio); la decodificacion de Opus y el procesamiento de audio son tareas de CPU y se pueden paralelizar en cualquier maquina.
- Despliegue: el propio autor indica que el repositorio no es cargable con la libreria `datasets`; hay que usar `hf_hub_download` o `hf download` y construir los shards localmente (tar, WebDataset o Parquet).
- Herramientas de descarga y verificacion: `huggingface_hub`, `hf download`, `sha256sum` para validar integridad contra `SHA256SUMS`.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen por completo del modelo ASR y del hardware que se elija para la etapa de transcripcion.

## Comparativa con modelos similares

La informacion proporcionada solo menciona explicitamente dos corpus comparables, sin ofrecer sus cifras de horas, tamano o licencia.

| Corpus | Cobertura temporal | Idiomas | Horas | Licencia | Notas |
|---|---|---|---|---|---|
| yt2026_batch02_10kh | 2026-01-01 a 2026-10-06 (filtro duro) | vietnamita, con alternancia de codigo a ingles | 11.884,0 h | `research-only` | Solo audio, sin transcripciones; disjunto de GigaSpeech 2 |
| GigaSpeech 1 | 2018-2021 | no disponible en la informacion proporcionada | no disponible | no disponible | Citado por el autor como material anterior no solapado |
| GigaSpeech 2 | Anterior a 2026 | no disponible en la informacion proporcionada | no disponible | no disponible | Citado por el autor como material anterior no solapado |

No se dispone de datos comparativos de rendimiento, ya que ni este corpus ni los mencionados publican resultados de benchmarks en la informacion facilitada.

## Limitaciones y advertencias

- Ausencia total de transcripciones: el corpus no sirve para entrenamiento supervisado de ASR sin una etapa previa de anotacion o pseudo-etiquetado.
- Licencia `research-only`: el uso comercial queda excluido. Conviene revisar los terminos de acceso completos en la model card, ya que el texto proporcionado queda truncado en la seccion de etica y procedencia.
- Licencia a nivel de canal variable: cada elemento hereda los derechos de su creador original en YouTube, de modo que las condiciones pueden diferir entre clips del mismo repositorio.
- Sesgo de seleccion: los canales se obtuvieron de una lista de descubrimiento en lengua vietnamita, no de un muestreo demograficamente equilibrado, segun reconoce el propio autor.
- Cobertura mensual muy desigual: septiembre de 2026 concentra 5.187,6 h de las 11.884,0 h totales, mientras que febrero aporta 248,1 h. Cualquier particion aleatoria heredara ese desequilibrio.
- Sesgo temporal estricto: nada anterior al 1 de enero de 2026 esta incluido, lo que limita el estudio de evolucion linguistica y puede introducir sesgos propios del periodo.
- Contenido sujeto a cambios: si un propietario elimina un video, el elemento puede retirarse del repositorio tras un aviso, lo que rompe la reproducibilidad de conjuntos de evaluacion fijados previamente.
- Riesgo de alucinacion: no aplica, al no ser un modelo generativo.
- Discrepancia en los metadatos de HuggingFace: la ficha de la plataforma declara un tamano de repositorio de 0,0 GB, mientras que la model card indica 624,7 GB. Conviene verificar el estado real de los ficheros antes de planificar una descarga masiva.
- Idioma unico: el corpus es vietnamita; no debe asumirse utilidad para otras lenguas del sudeste asiatico.
- Sin particiones oficiales de entrenamiento, validacion y test: cualquier division es responsabilidad del usuario y debe documentarse para que los resultados sean comparables.
- Metadatos de HuggingFace sin traccion: 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad ni erratas conocidas reportadas.
- Uso responsable: al tratarse de habla real de personas identificables en YouTube, su empleo para reconocimiento de hablantes o inferencia de atributos personales plantea problemas eticos y legales que van mas alla de la licencia de investigacion.

## Enlaces

- HuggingFace: https://huggingface.co/SalmonAI123/yt2026_batch02_10kh
- GigaSpeech 1: mencionado en la model card como corpus de 2018-2021; no se proporciona enlace en la informacion disponible
- GigaSpeech 2: mencionado en la model card como corpus anterior a 2026; no se proporciona enlace en la informacion disponible
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada
