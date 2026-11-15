# MacEpic/speaker-diarization-coreml

## Resumen

Speaker diarization (pyannote Community-1) en formato Core ML es una conversión del pipeline de diarización de hablantes `pyannote/speaker-diarization-community-1` a modelos compilados nativos para plataformas Apple. La conversión la realizó Fluid Inference y el repositorio que nos ocupa es una copia alojada por MacEpic para que la aplicación TextSniper pueda descargarla en una revisión fija. No se trata de un modelo de lenguaje generativo, sino de un sistema de procesamiento de audio que segmenta una grabación en turnos de habla y asigna cada turno a un hablante identificable.

El paquete incluye tres componentes Core ML: un modelo de segmentación basado en powerset (la formulación de Plaquet y Bredin presentada en INTERSPEECH 2023), un extractor de embeddings de hablante WeSpeaker ResNet34 entrenado sobre VoxCeleb con su frontend FBank independiente, y los parámetros PLDA de BUT Speech@FIT para el agrupamiento de x-vectors mediante VBx. Todo el conjunto ocupa aproximadamente 21,6 MB en 21 ficheros, lo que lo hace extremadamente ligero comparado con cualquier LLM.

Su relevancia radica en que permite ejecutar diarización de hablantes en local sobre hardware Apple (CPU, GPU o Neural Engine) sin depender de servicios en la nube ni de frameworks de Python en tiempo de inferencia. Es útil para transcripción con etiquetado de interlocutores, actas de reuniones, subtitulado y análisis forense de audio en entornos donde la privacidad o la latencia importan. La licencia CC BY 4.0 permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de diarizacion: segmentacion powerset (red neuronal) + embeddings WeSpeaker ResNet34 + clustering PLDA/VBx |
| Parametros totales | no disponible (no se publica el recuento; el bundle completo pesa 21.602.787 bytes) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (procesa ventanas de audio; el tamano de ventana no se detalla en la informacion) |
| Tipos de cuantizacion | almacenamiento en precision mixta (mixed-precision) segun la model card; no se detallan esquemas adicionales |
| Idiomas soportados | no disponible (la diarizacion es independiente del idioma en gran medida, pero no se declara lista) |
| Licencia | CC BY 4.0 |
| Formato de pesos | `.mlmodelc` compilados para Core ML, mas `plda-parameters.json` y `xvector-transform.json` en tensores Float32 |

## Arquitectura y entrenamiento

El sistema es un pipeline clasico de diarizacion en tres etapas. Primero, un modelo de segmentacion con perdida de entropia cruzada multiclase powerset detecta regiones de actividad de voz y posibles cambios de hablante. Segundo, un extractor de embeddings WeSpeaker ResNet34, con frontend FBank separado, genera un vector por segmento de habla. Tercero, los x-vectors se agrupan mediante PLDA y clustering VBx (Bayesian HMM sobre secuencias de x-vectors) usando los parametros de BUT Speech@FIT.

Fluid Inference introdujo cambios respecto al pipeline original de pyannote al convertir a Core ML: formas de entrada fijas y enumeradas, almacenamiento en precision mixta, separacion del frontend FBank y compilacion para plataformas Apple. No se dispone de informacion sobre el volumen de datos de entrenamiento ni sobre el uso de RLHF/DPO, ya que el modelo subyacente es un sistema de diarizacion, no un modelo de lenguaje. La atribucion cubre a CNRS/pyannoteAI por el pipeline, a WeSpeaker por el modelo de embeddings y a BUT Speech@FIT por el PLDA.

## Capacidades

- Segmentacion de actividad de voz (VAD) y deteccion de turnos de habla.
- Diarizacion de hablantes: asignacion de etiquetas de interlocutor a cada segmento de audio.
- Extraccion de embeddings de hablante mediante WeSpeaker ResNet34.
- Clustering de hablantes con PLDA y VBx.
- Ejecucion nativa en Apple Silicon y plataformas Apple mediante Core ML (CPU, GPU y Neural Engine).
- Procesamiento local sin dependencia de servicios en la nube.
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo generativo.
- Capacidades multilingues: no declaradas; la diarizacion suele ser agnostica al idioma, pero no se especifica.
- No incluye vision, audio generativo ni modo thinking.

## Casos de uso

- Transcripcion con etiquetado de interlocutores: combinar este pipeline con un ASR local para producir transcripciones donde cada frase queda atribuida a un hablante, util en actas de reuniones y entrevistas.
- Reuniones y videoconferencias: separar automaticamente quien habla en cada momento para generar resumenes por participante o metricas de tiempo de habla.
- Subtitulado y postproduccion de audio: identificar cambios de hablante para segmentar subtitulos o aplicar procesos de mezcla y edicion por interlocutor.
- Analisis forense y compliance: procesar grabaciones en local sin enviar audio a terceros, requisito habitual en entornos juridicos o sanitarios.
- Aplicaciones macOS/iOS de notas de voz: integrar los `.mlmodelc` en una app nativa para diarizar grabaciones en el dispositivo con latencia baja y sin coste de API.
- Investigacion en procesamiento de habla: usar los modelos Core ML como referencia para comparar el pipeline pyannote original con una implementacion nativa en Apple.
- Indexacion de archivos de audio: etiquetar grandes volumenes de grabaciones por hablante para busqueda y recuperacion posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica en el sentido tradicional; el bundle completo pesa unos 21,6 MB, por lo que la huella de memoria es minima.
- GPU recomendadas: no disponible; el modelo esta compilado para Core ML y se ejecuta en CPU, GPU o Neural Engine de plataformas Apple.
- Cabe en cualquier Mac, iPhone o iPad compatible con Core ML; no requiere GPU dedicada de escritorio.
- Opciones de despliegue: Core ML (`.mlmodelc`) en apps nativas Apple; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Licencia | Formato | Notas |
|---|---|---|---|---|
| MacEpic/speaker-diarization-coreml | Diarizacion pyannote Community-1 en Core ML | CC BY 4.0 | `.mlmodelc` | Copia de FluidInference para TextSniper; 21,6 MB |
| pyannote/speaker-diarization-community-1 | Pipeline original de diarizacion | CC BY 4.0 | PyTorch | Modelo base del que deriva esta conversion |
| FluidInference/speaker-diarization-coreml | Conversion Core ML original | CC BY 4.0 | `.mlmodelc` | Incluye ficheros adicionales (PLDA.mlmodelc, mlpackages, plots) que esta copia omite |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling; cualquier expectativa en ese sentido es incorrecta.
- El repositorio es una copia de terceros (MacEpic) de la conversion de Fluid Inference; el autor declara que no modifico ningun fichero, pero la trazabilidad depende de la revision fijada.
- Se han omitido ficheros respecto al origen (`PLDA.mlmodelc`, `PldaRho.mlmodelc`, modelos legacy, `mlpackages/`, plots, `config.json`), lo que puede afectar a flujos que esperen el bundle completo.
- La licencia CC BY 4.0 exige atribucion a CNRS/pyannoteAI, WeSpeaker y BUT Speech@FIT; el uso comercial es posible pero debe respetar los terminos de atribucion.
- No se declaran idiomas soportados ni sesgos conocidos; la precision en audio con ruido, solapamiento de hablantes o acentos no documentados no esta cuantificada.
- Riesgo de confusion de hablantes en conversaciones con voces similares o cambios frecuentes de turno, inherente a los sistemas de clustering PLDA/VBx.
- Al ser modelos compilados para Apple, no son portables a Linux o Windows sin reconversion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/MacEpic/speaker-diarization-coreml
- Origen de la conversion: https://huggingface.co/FluidInference/speaker-diarization-coreml
- Revision fijada del origen: https://huggingface.co/FluidInference/speaker-diarization-coreml/tree/7eab74f3463c736418d0eb10296261ae581146c9
- Modelo base pyannote: https://huggingface.co/pyannote/speaker-diarization-community-1
- Repositorio pyannote-audio: https://github.com/pyannote/pyannote-audio
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Fluid Inference en Hugging Face: https://huggingface.co/FluidInference
