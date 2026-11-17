# duong7169/vi-multispeaker-clustering-pipeline

## Resumen

`vi-multispeaker-clustering-pipeline` es un pipeline de diarizacion y agrupamiento de hablantes orientado especificamente a audio en vietnamita con multiples interlocutores. No se trata de un modelo de pesos entrenado por el autor, sino de un sistema de orquestacion publicado como repositorio en Hugging Face que combina componentes existentes: Silero VAD para deteccion de actividad vocal, pyannote segmentation-3.0 para segmentacion de solapamiento y cambios de turno, y un modelo de embeddings ECAPA-vi (el mismo empleado en el repositorio `voice` del autor) para la representacion de cada fragmento de voz. El resultado es una linea temporal de quien habla en cada momento y un conjunto de clips WAV de 5 a 15 segundos por hablante, etiquetados con identificadores locales `speaker_XX` dentro de cada video.

El sistema esta disenado para ejecutarse en CPU (la model card lo describe como "huong A, CPU") y procesa un unico archivo de audio de entrada, leyendo directamente WAV a 16 kHz mono o decodificando otros formatos mediante ffmpeg. Por defecto trabaja sobre una ventana de 0 a 600 segundos, con marcas de tiempo delimitadas por `audio.start_s` y `audio.duration_s`. Incluye ademas una aplicacion web local de control de calidad (`qc_app.py`) para escuchar, etiquetar, fusionar o dividir hablantes, y un buscador (`search.py`) que localiza videos de conversacion con dos o mas personas en YouTube mediante yt-dlp y los evalua con Claude Code CLI.

Su relevancia es acotada pero concreta: cubre un nicho poco atendido como es la preparacion de datasets de voz multihablante en vietnamita, con un enfasis inusual en trazabilidad (informes de benchmark, tiempos por etapa, calibracion de umbrales documentada) y en control de calidad por clip. No es un modelo generativo ni un servicio listo para produccion, sino una herramienta de ingenieria reproducible para construir corpus de voz etiquetados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de diarizacion: Silero VAD + pyannote segmentation-3.0 + embeddings ECAPA-vi + clustering AHC/espectral |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; ventana de audio procesada por defecto de 0 a 600 s |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (vi) |
| Licencia | no disponible |
| Formato de pesos | no disponible; el repositorio contiene codigo Python, configuracion YAML y scripts, con un tamano de 0,1 GB |

## Arquitectura y entrenamiento

El pipeline no entrena un modelo propio, sino que encadena componentes preentrenados. La primera etapa aplica Silero VAD para obtener regiones de habla, seguida de pyannote segmentation-3.0 para detectar solapamiento de voces (con un margen de 0,25 s) y puntos de cambio de hablante (con votacion entre fragmentos de 10 s y tolerancia de mas o menos 0,25 s). Sobre las regiones de habla sin solapamiento se calculan embeddings ECAPA-vi en ventanas de 1,5 s con salto de 0,75 s. Un segundo detector de cambio de hablante compara la similitud coseno entre ventanas adyacentes no solapadas y marca un cambio cuando es minima y menor que 0,25.

Cada segmento entre barreras se convierte en una unidad ("piece") cuyo embedding es la media de las ventanas contenidas. Los segmentos ancla (de al menos 2 s y homogeneos) se agrupan mediante clustering jerarquico aglomerativo (AHC) que se detiene cuando la similitud cae por debajo de 0,45; los centroides resultantes sirven para asignar el resto de segmentos si la similitud es al menos 0,35 y el margen al segundo candidato al menos 0,08, o se etiquetan como `unknown`. Los turnos se forman uniendo segmentos del mismo hablante separados solo por silencios de hasta 1 s, y se cortan clips de 5 a 15 s que caen dentro de un turno. Sobre cada clip se aplica un filtro de calidad (proporcion de habla, silencio interno, porcentaje de solapamiento, relacion senal-ruido, volumen, ancho de banda, clipping, ruido de fondo y golpes) y una medida de pureza basada en la similitud con el centroide, el margen, la peor ventana, el pico de deteccion de cambio de hablante y el tamano del cluster. Los clips con errores solo en los bordes se recortan automaticamente.

El autor documenta experimentos de calibracion (distribucion de similitud coseno entre mismo y distinto hablante segun duracion), ablacion de cada bloque, evaluacion de etiquetas manuales de QC, detector de voces ajenas en los bordes de clip y medicion de tiempos (300 s frente a 600 s). En la deteccion de bordes se reportan 8 de 11 aciertos sobre clips con error de borde y 30 de 197 falsos recortes sobre clips correctos.

## Capacidades

- Diarizacion de audio multihablante en vietnamita con salida de linea temporal de turnos.
- Generacion de clips WAV de 5 a 15 s por hablante, agrupados por identificador local `speaker_XX` dentro de cada video.
- Deteccion de solapamiento de voces y de cambios de turno mediante pyannote segmentation-3.0.
- Deteccion secundaria de cambios de hablante mediante similitud coseno entre ventanas ECAPA-vi adyacentes.
- Clustering aglomerativo con umbrales configurables y asignacion a centroides con margen minimo.
- Etiquetado de segmentos no asignables como `unknown`.
- Control de calidad automatico por clip: relacion senal-ruido, volumen, ancho de banda, clipping, ruido de fondo, proporcion de habla, silencio interno y solapamiento.
- Deteccion de voces ajenas al inicio y al final de cada clip, con recorte automatico de bordes.
- Aplicacion web local de QC para escuchar, etiquetar, anotar, fusionar y dividir hablantes, y reejecutar para aplicar etiquetas.
- Busqueda automatizada de videos de conversacion en YouTube mediante yt-dlp, con filtrado por reglas y evaluacion de titulos mediante Claude Code CLI.
- Exportacion a WAV, linea temporal, `clips.csv`, `changes.csv` y registro de QC.
- Ejecucion en CPU, sin requisito de GPU documentado.

## Casos de uso

- Construccion de corpus de voz multihablante en vietnamita: el pipeline segmenta conversaciones largas en clips de 5 a 15 s por hablante, lo que permite generar datasets de entrenamiento para modelos TTS o ASR con etiquetas de hablante locales y control de calidad automatico.
- Preparacion de datos para reconocimiento de hablante: los clips agrupados por `speaker_XX` y filtrados por pureza sirven como material de entrenamiento o evaluacion de modelos de verificacion de hablante, con la salvedad de que las etiquetas son locales a cada video.
- Transcripcion con atribucion de hablante: la linea temporal de turnos puede combinarse con un sistema ASR para producir transcripciones diarizadas de reuniones, entrevistas o podcasts en vietnamita.
- Curaduria de contenido audiovisual: el buscador integrado localiza videos de conversacion en YouTube, descarga 600 s y ejecuta el pipeline, lo que facilita la recoleccion y el filtrado de material para proyectos de investigacion.
- Analisis de participacion en reuniones: la linea temporal permite medir tiempos de habla por interlocutor y detectar solapamientos, util para estudios de dinamica conversacional.
- Control de calidad asistido por humano: la aplicacion web local permite revisar clips dudosos, fusionar hablantes erroneamente separados y corregir etiquetas, y reejecutar el pipeline para aplicar las decisiones, lo que encaja en flujos de anotacion semiautomatica.
- Reproduccion de experimentos de diarizacion: los scripts de ablacion, calibracion y medicion de tiempos permiten replicar y comparar variantes del pipeline sobre nuevos conjuntos de audio en vietnamita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (DER, MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor incluye informes internos (`BENCHMARK_REPORT.md`, `PIPELINE_TIMING_REPORT.md`) y resultados de experimentos en `experiments/results/`, pero sus cifras no se detallan en la model card mas alla de los datos de deteccion de bordes citados en la seccion de arquitectura (8 de 11 aciertos y 30 de 197 falsos recortes). No se dispone de tasas de error de diarizacion ni de comparaciones cuantitativas con otros sistemas.

## Requisitos de hardware

- Inferencia en CPU: el autor describe el sistema como "huong A, CPU" y no documenta requisitos de GPU.
- VRAM estimada: no disponible; al ejecutarse en CPU, el consumo relevante es de memoria RAM, no cuantificada en la informacion proporcionada.
- GPU recomendadas: no disponible; no se documenta soporte ni aceleracion por GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ejecucion directa mediante `python run.py` sobre un entorno virtual con las dependencias del repositorio `voice`; aplicacion web local de QC en `http://127.0.0.1:8765`; scripts por etapas en `scripts/` (`00_setup` a `07_visualize`, mas `run_all.sh`).
- Latencia y throughput: no disponibles de forma numerica; el autor remite a `experiments/results/timing.md` y a `PIPELINE_TIMING_REPORT.md` para los tiempos por etapa y la comparacion entre ventanas de 300 s y 600 s.

## Comparativa con modelos similares

| Sistema | Tipo | Idiomas | Contexto / ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vi-multispeaker-clustering-pipeline | Pipeline de diarizacion en CPU | Vietnamita | 0-600 s por archivo (configurable) | no disponible | Hugging Face (repo de codigo) |
| pyannote speaker-diarization-3.x | Pipeline de diarizacion | Multilingue | Depende de la configuracion | Licencia propia de pyannote | Hugging Face |
| NeMo (NVIDIA) diarizacion | Toolkit de diarizacion | Multilingue | Depende de la configuracion | Apache 2.0 (segun componente) | GitHub / NGC |
| WhisperX | Pipeline ASR + diarizacion | Multilingue | Depende de la configuracion | MIT / BSD (segun componente) | GitHub |

La comparacion cuantitativa de rendimiento no esta disponible. La diferencia principal del sistema analizado frente a estos es su especializacion en vietnamita, su ejecucion en CPU y su capa de QC y curaduria de clips, no una mejora medida en tasas de error de diarizacion.

## Limitaciones y advertencias

- No es un modelo de pesos: es un repositorio de codigo que depende de modelos externos (Silero VAD, pyannote segmentation-3.0, ECAPA-vi) y de sus respectivas licencias, no detalladas en la model card.
- La licencia del repositorio no esta disponible, lo que impide confirmar si se permite uso comercial.
- Las etiquetas `speaker_XX` son locales a cada video; el sistema no realiza identificacion de hablantes entre videos ni reconocimiento de identidad.
- Solo se declara soporte para vietnamita; el rendimiento en otros idiomas no esta documentado.
- El pipeline esta pensado para ejecucion en CPU, sin aceleracion por GPU documentada, lo que puede limitar el throughput en volumenes grandes.
- La ventana de procesamiento por defecto es de 0 a 600 s; audios mas largos requieren configuracion adicional mediante `audio.start_s` y `audio.duration_s`.
- Los umbrales de clustering (similitud de parada 0,45, asignacion 0,35, margen 0,08, deteccion de cambio 0,25, separacion de turnos por silencio de 1 s) son valores de arranque calibrados sobre datos del autor y pueden requerir ajuste en dominios distintos.
- El detector de bordes tiene falsos positivos documentados (30 de 197 clips correctos recortados) y no funciona cuando el video tiene un solo hablante.
- Riesgo de alucinacion no aplica al no ser un modelo generativo; el riesgo equivalente es la asignacion erronea de hablante o la generacion de clips impuros, mitigado parcialmente por el filtro de calidad y la revision humana.
- Los sesgos conocidos no estan documentados; al depender de modelos preentrenados, puede heredar sesgos acusticos de estos respecto a genero, edad, acento o calidad de grabacion.
- La busqueda automatizada de videos depende de Claude Code CLI y de yt-dlp, lo que introduce dependencias externas y posibles restricciones de uso.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/duong7169/vi-multispeaker-clustering-pipeline
- pyannote segmentation-3.0 (componente): https://huggingface.co/pyannote/segmentation-3.0
- Silero VAD (componente): https://github.com/snakers4/silero-vad
- Repositorio `voice` del autor (entorno y modelo ECAPA-vi referenciados): no disponible como enlace directo en la informacion proporcionada
- yt-dlp (herramienta de descarga referenciada): https://github.com/yt-dlp/yt-dlp
- Claude Code CLI (herramienta referenciada): no disponible como enlace directo en la informacion proporcionada
