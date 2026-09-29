# ldov/FireRedVAD

## Resumen

FireRedVAD es una solución de detección de actividad de voz (VAD) y detección de eventos de audio (AED) de grado industrial, presentada como parte del sistema FireRedASR2S. Está desarrollada por el equipo FireRed y su model card remite a los repositorios oficiales FireRedTeam/FireRedVAD en Hugging Face y xukaituo/FireRedVAD en ModelScope. La ficha de Hugging Face que se analiza aquí corresponde al identificador `ldov/FireRedVAD`, que aparece con 0 descargas, 0 me gusta y un tamaño de repositorio de 0,0 GB, por lo que conviene verificar en qué identificador están alojados realmente los pesos.

El modelo se basa en una arquitectura DFSMN (Deep Feedforward Sequential Memory Network) y se distribuye en tres variantes funcionales: VAD no streaming, VAD streaming (Stream-VAD) y AED no streaming. Detecta habla, canto y música, y la model card afirma soporte para más de 100 idiomas, aunque los metadatos del repositorio solo declaran `en` y `zh` como idiomas. En la evaluación sobre FLEURS-VAD-102, el VAD no streaming alcanza un F1 de 97,57 % y un AUC-ROC de 99,60, superando a Silero-VAD, TEN-VAD, FunASR-VAD y WebRTC-VAD.

Su relevancia práctica es la de un componente de preprocesado y segmentación dentro de pipelines de ASR, diarización, subtitulado y análisis de audio a gran escala: reduce coste computacional al recortar silencio, mejora la alineación temporal de transcripciones y permite filtrar eventos no verbales. Se publica bajo licencia Apache 2.0, lo que facilita su integración en productos comerciales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DFSMN (Deep Feedforward Sequential Memory Network), en variantes no streaming y streaming |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de audio; no procesa texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | Metadatos del repositorio: `en`, `zh`. La model card afirma detección de habla, canto y música en más de 100 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (descarga mediante `huggingface-cli` o ModelScope a un directorio local; no se especifica el formato de serialización) |
| Tarea principal | Detección de actividad de voz (VAD) y detección de eventos de audio (AED) |
| Entrada | Audio a 16 kHz, 16 bits, mono, PCM |
| Modos de inferencia | VAD no streaming, VAD streaming y AED no streaming |
| Variantes publicadas | `VAD`, `Stream-VAD` y `AED` (rutas de `model_dir` en los ejemplos) |
| Idioma evaluado en benchmark | 102 idiomas (FLEURS-VAD-102) |
| Formatos de salida | Timestamps por segmento, fichero de texto y TextGrid (`--write_textgrid`) |
| Aceleración por hardware | CPU por defecto (`use_gpu=False`, `--use_gpu 0`); se admite selección de GPU por índice |

## Arquitectura y entrenamiento

La arquitectura es DFSMN, una familia de redes feed-forward con memoria secuencial diseñada para modelado de secuencias de audio. La solución se despliega en tres modelos especializados: un VAD no streaming, un VAD streaming orientado a inferencia incremental y un AED no streaming. El AED incorpora umbrales independientes para habla (`--speech_threshold`), canto (`--singing_threshold`) y música (`--music_threshold`), lo que permite separar eventos vocales de contenido musical en una misma señal.

Los detalles de entrenamiento (número de horas de audio, composición del dataset, presencia de ajuste por RLHF o DPO) no están disponibles en la información proporcionada. Tampoco se documentan innovaciones de decodificación especulativa ni mecanismos de atención lineal, que no aplican a este tipo de modelo. El benchmark asociado, FLEURS-VAD-102, se construyó seleccionando aleatoriamente unos 100 ficheros de audio por idioma del conjunto de test de FLEURS, hasta un total de 9.443 ficheros con etiquetas binarias de VAD anotadas manualmente (habla = 1, silencio = 0); según la model card, este conjunto se publicará próximamente.

El ajuste fino del comportamiento se realiza en inferencia mediante parámetros expuestos en la CLI y en la API: `smooth_window_size`, `speech_threshold`, `min_speech_frame`, `max_speech_frame`, `min_silence_frame`, `merge_silence_frame`, `extend_speech_frame`, `chunk_max_frame` y, en modo streaming, `pad_start_frame`.

## Capacidades

- Detección de actividad de voz en modo no streaming sobre ficheros de audio completos.
- Detección de actividad de voz en modo streaming, apta para procesamiento incremental por bloques.
- Detección de eventos de audio no streaming con tres clases configurables: habla, canto y música.
- Detección independiente del idioma según la model card (más de 100 idiomas); los metadatos del repositorio solo declaran inglés y chino.
- Salida de marcas temporales por segmento, fichero de texto y anotaciones en formato TextGrid.
- Umbrales y ventanas de suavizado configurables para adaptar la sensibilidad a cada dominio.
- API Python (`FireRedVad`, `FireRedVadConfig`, `FireRedStreamVad`) y tres ejecutables de línea de comandos (`vad.py`, `stream_vad.py`, `aed.py`).
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni capacidades de agente: es un modelo discriminativo de audio, no un modelo de lenguaje.

## Casos de uso

- Preprocesado de pipelines ASR: recortar silencio antes de enviar audio a un modelo de reconocimiento de voz, reduciendo el cómputo y el coste por hora de audio procesada.
- Subtitulado y alineación temporal: usar los timestamps de cada segmento de habla para sincronizar subtítulos o forzar la segmentación de transcripciones largas.
- Asistentes de voz en tiempo real: el modo streaming permite detectar el inicio y el fin del turno de palabra con baja latencia, condición necesaria para interrumpir y responder con fluidez.
- Diarización y análisis de reuniones: segmentar por actividad vocal antes de aplicar un modelo de diarización, de modo que el agrupamiento por hablante trabaje solo sobre tramos con voz.
- Limpieza de corpus de entrenamiento: filtrar horas de audio con silencio, música o canto antes de construir datasets de ASR o de modelos de audio, mejorando la relación señal-ruido efectiva del conjunto.
- Moderación e indexación de contenido musical: el AED permite distinguir habla, canto y música en radio, pódcast o vídeo, útil para clasificación de catálogos y para políticas de contenido.
- Telefonía y centros de contacto: procesar grabaciones largas para medir tiempos de habla y de silencio por llamada, o para activar la transcripción solo en los tramos relevantes.
- Activación en dispositivos con recursos limitados: al admitir ejecución en CPU, el VAD puede actuar como puerta previa que despierte a un modelo mayor solo cuando hay voz.

## Benchmarks y rendimiento

Evaluación sobre FLEURS-VAD-102 (102 idiomas, 9.443 ficheros de audio con etiquetas binarias manuales). Valores tomados de la model card; los mejores resultados por métrica figuran en negrita en la fuente original.

| Métrica | FireRedVAD | Silero-VAD | TEN-VAD | FunASR-VAD | WebRTC-VAD |
|---|---|---|---|---|---|
| AUC-ROC (mayor es mejor) | 99,60 | 97,99 | 97,81 | no disponible | no disponible |
| F1 (mayor es mejor) | 97,57 | 95,95 | 95,19 | 90,91 | 52,30 |
| Tasa de falsa alarma (menor es mejor) | 2,69 | 9,41 | 15,47 | 44,03 | 2,83 |
| Tasa de omisión (menor es mejor) | 3,62 | 3,95 | 2,95 | 0,42 | 64,15 |

La model card señala que FunASR-VAD obtiene una tasa de omisión muy baja (0,42 %) a costa de una tasa de falsa alarma del 44,03 %, lo que indica una sobrepredicción de segmentos de habla. No se han publicado en la información disponible resultados de latencia, throughput ni consumo de memoria para ninguna de las variantes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publican parámetros totales ni huella de memoria.
- GPU recomendadas: no disponible. No se especifica ninguna GPU concreta (A100, H100, RTX 4090 u otras).
- Ejecución en CPU: admitida y es el modo por defecto en los ejemplos (`use_gpu=False` en la API Python y `--use_gpu 0` en la CLI).
- GPU de consumo: no disponible. Al tratarse de un modelo DFSMN de detección de voz, es previsible que quepa en GPU de consumo, pero no hay datos publicados que lo confirmen.
- Opciones de despliegue: el proyecto se distribuye con su propio runtime de inferencia (CLI `vad.py`, `stream_vad.py`, `aed.py` y paquete `fireredvad`). No se declara soporte para vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia, que además no son aplicables a este tipo de modelo.
- Requisitos de entorno: Python 3.10, instalación de dependencias con `requirements.txt`, configuración de `PATH` y `PYTHONPATH`.
- Preprocesado obligatorio del audio: conversión a 16 kHz, 16 bits, mono y PCM mediante `ffmpeg` (`-ar 16000 -ac 1 -acodec pcm_s16le`).
- Latencia y throughput: no disponible. Los parámetros `chunk_max_frame` y `smooth_window_size` permiten ajustar el tamaño de bloque y el suavizado temporal, lo que afecta a la latencia del modo streaming.

## Comparativa con modelos similares

| Modelo | Tipo | AUC-ROC | F1 | Falsa alarma | Omisión | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| FireRedVAD | VAD + AED, DFSMN, streaming y no streaming | 99,60 | 97,57 | 2,69 | 3,62 | Apache 2.0 | Hugging Face, ModelScope y GitHub |
| Silero-VAD | VAD | 97,99 | 95,95 | 9,41 | 3,95 | no disponible en la información | GitHub |
| TEN-VAD | VAD | 97,81 | 95,19 | 15,47 | 2,95 | no disponible en la información | GitHub |
| FunASR-VAD | VAD (FSMN) | no disponible | 90,91 | 44,03 | 0,42 | no disponible en la información | ModelScope |
| WebRTC-VAD | VAD clásico | no disponible | 52,30 | 2,83 | 64,15 | no disponible en la información | GitHub |

Frente a las alternativas comparadas, FireRedVAD es el único que añade detección de eventos de audio (habla, canto y música) y el único con modo streaming y no streaming en la misma familia de modelos. Su ventaja principal es la combinación de F1 alto con una tasa de falsa alarma baja; su desventaja relativa es una tasa de omisión superior a la de TEN-VAD y, sobre todo, a la de FunASR-VAD, que a cambio dispara las falsas alarmas.

## Limitaciones y advertencias

- El identificador analizado (`ldov/FireRedVAD`) muestra 0 descargas, 0 me gusta y 0,0 GB de tamaño; los pesos podrían no estar alojados ahí. La model card apunta a `FireRedTeam/FireRedVAD` en Hugging Face y a `xukaituo/FireRedVAD` en ModelScope, que son los identificadores que conviene usar para descargar los modelos.
- El benchmark FLEURS-VAD-102 está descrito como pendiente de publicación abierta ("coming soon"), por lo que los resultados no son reproducibles con el material disponible actualmente.
- La tasa de omisión de FireRedVAD (3,62 %) es superior a la de TEN-VAD (2,95 %) y muy superior a la de FunASR-VAD (0,42 %); en escenarios donde perder segmentos de habla sea crítico (por ejemplo, transcripción legal o médica) hay que valorar ese intercambio frente a la tasa de falsa alarma.
- Los umbrales (`speech_threshold`, `singing_threshold`, `music_threshold`) y los tamaños de ventana requieren calibración por dominio: audio telefónico, reuniones, música de fondo o grabaciones ruidosas pueden necesitar valores distintos de los de los ejemplos.
- Existe una discrepancia entre los idiomas declarados en los metadatos (`en`, `zh`) y la afirmación de la model card de soportar más de 100 idiomas; conviene validar el comportamiento en el idioma objetivo antes de desplegarlo.
- El modelo no transcribe ni comprende el contenido del habla: es exclusivamente un detector de actividad y de eventos de audio. No sustituye a un ASR ni a un modelo de lenguaje.
- Como todo modelo entrenado con datos reales de audio, puede heredar sesgos de los corpus utilizados (acentos, entornos acústicos, calidad de grabación), si bien no se documentan sesgos específicos en la información disponible.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos en la detección, especialmente en audio con ruido, música de fondo o habla muy solapada.
- La licencia Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserven los avisos de copyright y licencia correspondientes; no se documentan restricciones adicionales de uso.
- Las fechas de publicación de los metadatos (repositorio creado el 28 de septiembre de 2026) y del identificador arXiv (2603.10420) deberían verificarse antes de citar el trabajo.

## Enlaces

- Hugging Face (identificador analizado): https://huggingface.co/ldov/FireRedVAD
- Hugging Face (repositorio oficial referido en la model card): https://huggingface.co/FireRedTeam/FireRedVAD
- ModelScope: https://www.modelscope.cn/models/xukaituo/FireRedVAD
- Código fuente: https://github.com/FireRedTeam/FireRedVAD
- Informe técnico FireRedASR2S (página del paper en Hugging Face): https://huggingface.co/papers/2603.10420
- Informe técnico FireRedASR2S (arXiv): https://arxiv.org/abs/2603.10420
- Repositorio FireRedASR2S: https://github.com/FireRedTeam/FireRedASR2S
- Conjunto de datos FLEURS: https://huggingface.co/datasets/google/fleurs
- Silero-VAD: https://github.com/snakers4/silero-vad
- TEN-VAD: https://github.com/TEN-framework/ten-vad
- FunASR-VAD: https://modelscope.cn/models/iic/speech_fsmn_vad_zh-cn-16k-common-pytorch
- WebRTC-VAD (py-webrtcvad): https://github.com/wiseman/py-webrtcvad
