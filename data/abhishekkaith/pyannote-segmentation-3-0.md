# abhishekkaith/pyannote-segmentation-3.0

## Resumen

pyannote-segmentation-3.0 es un modelo de segmentación de hablantes (speaker segmentation) desarrollado por el equipo de pyannote (Séverin Baroudi y Hervé Bredin) y distribuido en Hugging Face. No es un modelo de lenguaje, sino una red neuronal de audio que procesa ventanas de 10 segundos de audio mono a 16 kHz y produce una matriz de diarización de forma (num_frames, num_classes) con 7 clases: no-habla, hablante #1, hablante #2, hablante #3, hablantes #1 y #2, hablantes #1 y #3, y hablantes #2 y #3.

La innovación principal es el uso de codificación "powerset" multi-clase, descrita en el paper de Plaquet y Bredin presentado en INTERSPEECH 2023. Este enfoque permite detectar solapamiento de habla (overlapped speech) de forma nativa, algo que los esquemas multi-label tradicionales manejan peor. El modelo se entrena con pyannote.audio 3.0.0 sobre la combinación de los conjuntos AISHELL, AliMeeting, AMI, AVA-AVD, DIHARD, Ego4D, MSDWild, REPERE y VoxConverse.

Es relevante porque constituye el componente de segmentación del pipeline pyannote/speaker-diarization-3.0, referencia de facto en diarización de hablantes open source. Por sí solo no realiza diarización completa de grabaciones (solo procesa chunks de 10 s), pero sirve como bloque base para VAD, detección de habla solapada y re-segmentación. La licencia es MIT, aunque el acceso requiere aceptar condiciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de segmentación de audio (pyannote.audio 3.0.0); detalles internos de capas no disponibles en la informacion proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 10 segundos de audio mono a 16 kHz por chunk |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo acustico independiente del idioma; entrenado con corpus multilingues: AISHELL, AliMeeting, AMI, AVA-AVD, DIHARD, Ego4D, MSDWild, REPERE, VoxConverse) |
| Licencia | MIT (con acceso condicionado en Hugging Face) |
| Formato de pesos | no disponible (carga via `pyannote.audio.Model.from_pretrained`; tamano del repo 0.0 GB segun metadatos) |

## Arquitectura y entrenamiento

El modelo sigue el paradigma de segmentación end-to-end de pyannote.audio 3.0: recibe un tensor de audio de 10 s (mono, 16 kHz) y emite una matriz de activacion por frame y clase. La codificacion powerset agrupa las combinaciones de hasta 3 hablantes simultaneos en el chunk y hasta 2 por frame, generando 7 clases discretas. Esto convierte un problema multi-label en un problema multi-clase con entropia cruzada, lo que segun el paper de INTERSPEECH 2023 mejora la deteccion de solapamiento y simplifica el entrenamiento.

El entrenamiento lo realizo Severin Baroudi con pyannote.audio 3.0.0 combinando los conjuntos AISHELL, AliMeeting, AMI, AVA-AVD, DIHARD, Ego4D, MSDWild, REPERE y VoxConverse, lo que aporta diversidad de dominio (reuniones, podcasts, videos egocentricos, telefonía, etc.). No se especifican en la informacion disponible el numero de tokens/ horas de audio, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO (no aplica en un modelo acustico). El repositorio companion de Alexis Plaquet (FrenchKrab/IS2023-powerset-diarization) documenta como entrenar o hacer fine-tuning con este esquema.

## Capacidades

- Segmentacion de hablantes en ventanas de 10 s con hasta 3 hablantes por chunk y 2 por frame.
- Deteccion de actividad de voz (VAD) mediante el pipeline `VoiceActivityDetection`.
- Deteccion de habla solapada (overlapped speech detection) mediante `OverlappedSpeechDetection`.
- Re-segmentacion y refinamiento dentro de pipelines de diarizacion mas amplios.
- Conversion de la salida powerset a codificacion multi-label con `pyannote.audio.utils.powerset.Powerset`.
- No realiza diarizacion completa de grabaciones por si solo: requiere un modelo de embeddings de hablante y un pipeline (p. ej. pyannote/speaker-diarization-3.0).
- No soporta tool calling, agentes, generacion de texto, vision ni audio generativo; es un modelo puramente discriminativo de audio.
- Capacidad multilingue implicita por el entrenamiento con corpus de varios idiomas, aunque no se documenta cobertura por idioma.

## Casos de uso

- Diarizacion de reuniones y transcripciones: se integra como componente de segmentacion en el pipeline pyannote/speaker-diarization-3.0 para etiquetar quien habla en cada tramo de una reunion grabada, combinado con un modelo de embeddings de hablante.
- Voice activity detection en preprocesado de ASR: usar `VoiceActivityDetection` para recortar silencios antes de enviar audio a un sistema de reconocimiento de voz, reduciendo coste computacional y latencia.
- Deteccion de habla solapada en analisis de calidad: con `OverlappedSpeechDetection` se identifican tramos donde dos o mas personas hablan a la vez, util para marcar audio problematico en datasets de entrenamiento o en auditoria de llamadas.
- Re-segmentacion en pipelines de diarizacion existentes: refinar los limites de turnos de habla producidos por otro segmentador, especialmente en dominios con mucho solapamiento (debates, mesas redondas).
- Analisis de llamadas de atencion al cliente: segmentar y detectar solapamientos para medir interrupciones entre agente y cliente, con independencia del idioma gracias al entrenamiento multilingue.
- Investigacion en diarizacion: servir como baseline reproducible y punto de partida para fine-tuning con el repositorio companion de Plaquet sobre datos propios (dominios medicos, judiciales, etc.).
- Indexacion de archivos audiovisuales: generar marcas temporales de habla y solapamiento para busqueda y navegacion en archivos de video o podcast.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de DER (Diarization Error Rate), VAD ni OSD para este checkpoint concreto; solo referencia los papers de INTERSPEECH 2023 sin cifras en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Por el tipo de tarea (segmentacion de audio en chunks de 10 s) es previsible que quepa en GPUs consumer, pero no se aportan cifras.
- GPU recomendadas: no disponible. Al ser un modelo acustico pequeno comparado con LLMs, cualquier GPU con soporte CUDA (p. ej. RTX 3060 en adelante) deberia ser suficiente, aunque no se confirma en la documentacion.
- CPU: viable para inferencia por lotes pequenos, aunque sin datos de latencia publicados.
- Opciones de despliegue: `pyannote.audio` 3.0 (`pip install pyannote.audio`), cargando con `Model.from_pretrained("pyannote/segmentation-3.0", use_auth_token=...)`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto de audio | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| pyannote/segmentation-3.0 (este) | Segmentacion powerset | 10 s por chunk | MIT | Condicionado en HF | Hasta 3 hablantes/chunk, 2/frame |
| pyannote/segmentation (2.0) | Segmentacion multi-label | 5 s por chunk | MIT | Condicionado en HF | Version anterior, sin powerset |
| pyannote/speaker-diarization-3.0 | Pipeline completo de diarizacion | Grabacion completa | MIT | Condicionado en HF | Usa este modelo + embeddings |
| NVIDIA NeMo diarization | Pipeline de diarizacion | Grabacion completa | Apache 2.0 | Abierto | Alternativa con toolkit distinto |

Los datos de rendimiento comparativo (DER, VAD) no estan disponibles en la informacion proporcionada, por lo que no se puede establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- El modelo solo procesa chunks de 10 s; no realiza diarizacion de grabaciones completas por si mismo.
- Limite de 3 hablantes por chunk y 2 simultaneos por frame: escenarios con mas solapamiento quedan fuera del diseno.
- No se documentan sesgos especificos, pero al entrenarse con corpus mayoritariamente de reuniones, podcasts y videos, puede degradarse en dominios acusticos distintos (audio telefonico muy comprimido, entornos ruidosos, musica de fondo).
- Riesgo de falsos positivos en VAD y OSD en presencia de ruido no vocal o habla lejana.
- La licencia es MIT, pero el acceso requiere aceptar condiciones y token de Hugging Face; el autor menciona envio ocasional de correos sobre servicios de pago.
- El autor recomienda pyannoteAI para produccion con mejores prestaciones; el modelo open source puede no ser la opcion mas rapida o precisa.
- No se especifican idiomas cubiertos ni rendimiento por idioma.
- El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, lo que sugiere un espejo o copia con poca validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abhishekkaith/pyannote-segmentation-3.0
- Modelo original: https://huggingface.co/pyannote/segmentation-3.0
- Pipeline de diarizacion: https://huggingface.co/pyannote/speaker-diarization-3.0
- Paper powerset (INTERSPEECH 2023): https://www.isca-speech.org/archive/interspeech_2023/plaquet23_interspeech.html
- Repositorio companion de entrenamiento: https://github.com/FrenchKrab/IS2023-powerset-diarization/
- Repositorio pyannote.audio: https://github.com/pyannote/pyannote-audio
- Servicio comercial pyannoteAI: https://www.pyannote.ai
- Tokens de Hugging Face: https://hf.co/settings/tokens
