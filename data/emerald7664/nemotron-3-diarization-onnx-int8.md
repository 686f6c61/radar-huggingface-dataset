# Emerald7664/nemotron-3-diarization-onnx-int8

## Resumen

Este repositorio contiene `nemotron3_step.int8.onnx`, una version cuantizada a int8 del export ONNX de un unico paso de streaming del modelo de diarizacion de hablantes Nemotron 3 Diarization de NVIDIA. No es un modelo de lenguaje ni un sistema de reconocimiento de voz completo: es la pieza de diarizacion (separacion y atribucion de hablantes) que el autor, Emerald7664, ha empaquetado como modelo de hablante para Sona, una aplicacion Android de transcripcion en sueco que funciona en el propio dispositivo.

La relevancia practica esta en el formato: el fichero pesa 107 MB, aplica cuantizacion dinamica int8 por canal a todas las matrices de pesos MatMul del grafo y mantiene intactas las entradas y salidas del export fp32 original. Esto permite ejecutar diarizacion con estado (streaming) en hardware movil mediante ONNX Runtime, sin depender de GPU ni de servicios en la nube, algo poco habitual en herramientas de diarizacion de calidad.

La cadena de procedencia es explicita: NVIDIA publica el checkpoint original, el usuario beshkenadze realiza el export ONNX, y Emerald7664 produce esta build int8 reproducible bit a bit mediante el script `research/diarization-benchmark/quantize.py` del repositorio de Sona. La licencia es la OpenMDW License Agreement 1.1, heredada de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Streaming Sortformer (diarizacion de hablantes con estado); export ONNX de un paso de streaming |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | bloque de 30,4 s de tramas log-mel; cache de hablante de 264 tramas y FIFO de 40 tramas |
| Tipos de cuantizacion | int8 dinamica por canal en todos los pesos MatMul del grafo; existe el export fp32 de referencia |
| Idiomas soportados | no disponible en los metadatos; la model card solo documenta evaluacion en sueco |
| Licencia | OpenMDW License Agreement 1.1 |
| Formato de pesos | ONNX (fichero `nemotron3_step.int8.onnx`, 107 MB, SHA-256 `abd450c9a1701d941b4f06f424977ae3b8d49fbc24d07d08940d9a3816c04854`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de NVIDIA Nemotron 3 Diarization, etiquetada como *streaming-sortformer*: un modelo de diarizacion que procesa audio de forma incremental manteniendo un estado de hablantes. El grafo ONNX exportado corresponde a un unico paso de streaming. Sus entradas son un bloque de 30,4 s de tramas log-mel junto con la cache de hablante (264 tramas) y una FIFO de 40 tramas; sus salidas son probabilidades por hablante cada 80 ms y los embeddings del bloque.

El front end de mel y la actualizacion de la cache de hablante (la funcion `streaming_update_async` de NeMo) quedan fuera del grafo y deben implementarse aparte; la implementacion de Sona reside en el modulo `:core:diarization` y se ha validado contra una referencia en Python del mismo repositorio. El embedding de silencio aprendido que necesita la actualizacion de cache (`learnable_sil_emb.f32`) esta en el repositorio de beshkenadze, no en este.

Sobre el entrenamiento no hay informacion en los materiales disponibles: la model card remite explicitamente a la model card original de NVIDIA para datos de entrenamiento, evaluacion, uso previsto y limitaciones, indicando que todos ellos aplican sin cambios. No se documentan aqui numero de tokens, composicion del dataset ni fases de RLHF o DPO, que ademas no son aplicables a un modelo discriminativo de diarizacion. La innovacion tecnica de este repositorio concreto es la reproducibilidad: la cuantizacion se puede repetir bit a bit con `quantize.py` y un `requirements.txt` fijado.

## Capacidades

- Diarizacion de hablantes en streaming: produce probabilidades por hablante con una granularidad temporal de 80 ms.
- Extraccion de embeddings de hablante por bloque de audio.
- Mantenimiento de estado entre pasos mediante cache de hablante y FIFO, lo que permite procesar audio continuo sin reiniciar el modelo.
- Deteccion de actividad de voz (el `pipeline_tag` declarado en HuggingFace es `voice-activity-detection`).
- Inferencia en dispositivo: 107 MB en int8, ejecutable con ONNX Runtime sin GPU.
- No genera texto, no razona, no escribe codigo, no hace matematicas y no procesa vision.
- No soporta tool calling, function calling ni flujos de agentes.
- No se documentan capacidades multilingues especificas; el modelo es de diarizacion acustica, no de reconocimiento de contenido.
- No dispone de modo "thinking" ni de salidas de audio.

## Casos de uso

- Diarizacion en el propio dispositivo Android: es el caso de uso original. Sona integra este grafo int8 para etiquetar quien habla durante la transcripcion en sueco, sin enviar audio a servidores externos, lo que reduce latencia y evita problemas de privacidad.
- Transcripcion de reuniones con multiples participantes: combinado con un ASR externo, el modelo asigna cada segmento transcrito a un hablante, usando la cache de 264 tramas para mantener la identidad a lo largo de intervenciones largas.
- Subtitulado y actas de debates parlamentarios: la evaluacion documentada se hizo precisamente sobre debates del Riksdagen etiquetados con RixVox-v2, un escenario de turnos de palabra largos y solapamiento moderado.
- Analisis de llamadas de atencion al cliente: la salida de probabilidades cada 80 ms permite medir tiempos de habla por interlocutor, deteccion de interrupciones y ratios de participacion, util para control de calidad y cumplimiento normativo.
- Asistentes de voz con varios usuarios: la VAD y la separacion de hablantes permiten que un dispositivo embebido decida cuando hay voz y de quien es antes de activar un ASR o un modelo de lenguaje.
- Investigacion reproducible en diarizacion: el fichero incluye hash SHA-256 y el script de cuantizacion, de modo que un grupo de investigacion puede reproducir exactamente la build y comparar int8 frente a fp32 en un conjunto de test propio.
- Preprocesado en pipelines de audio a gran escala: al ser un grafo ONNX pequeno, se puede desplegar en muchas instancias CPU en paralelo para segmentar por hablante un archivo de audio antes de pasarlo a etapas mas costosas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card unicamente afirma que, sobre un conjunto de test en sueco construido con datos publicos (debates del Riksdagen etiquetados con RixVox-v2 y conversaciones simuladas), esta build int8 iguala al fp32 "dentro del ruido", y remite al README del benchmark del repositorio de Sona para los detalles. No se proporcionan cifras de DER ni de ningun otro metrica.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada. Como referencia de orden de magnitud, el fichero de pesos ocupa 107 MB; el pico de memoria depende del runtime y de los buffers intermedios del bloque de 30,4 s, por lo que es previsible que quede muy por debajo de 1 GB, aunque no hay una cifra oficial.
- GPU recomendadas: no disponibles. El modelo esta disenado para ejecucion en CPU mediante ONNX Runtime en Android; una GPU no es necesaria.
- Cabe en GPU de consumo: si, con margen amplio, dado el tamano del grafo; tambien en dispositivos moviles de gama media-alta, que es su destino previsto.
- Opciones de despliegue: ONNX Runtime (incluida la variante para Android); no aplican vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje generativos.
- Latencia y throughput estimados: no disponibles. Como referencia de diseno, el modelo consume bloques de 30,4 s y emite probabilidades cada 80 ms, pero no se publican cifras de tiempo de ejecucion ni de factor de tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / bloque | Licencia | Disponibilidad |
|---|---|---|---|---|
| Emerald7664/nemotron-3-diarization-onnx-int8 (este) | no disponible | 30,4 s, salida cada 80 ms | OpenMDW 1.1 | Publico en HuggingFace, formato ONNX int8 |
| nvidia/Nemotron-3-Diarization | no disponible | no disponible | OpenMDW 1.1 | Publico en HuggingFace (checkpoint original) |
| beshkenadze/nemotron-3-diarization-onnx | no disponible | no disponible | OpenMDW 1.1 | Publico en HuggingFace (export ONNX fp32) |
| Otros sistemas de diarizacion (por ejemplo, la familia pyannote o los modelos Sortformer de NVIDIA) | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados en la informacion proporcionada para comparar parametros, contexto, rendimiento ni licencia frente a alternativas de la misma categoria. Cualquier comparacion con pyannote o con otros modelos Sortformer deberia hacerse consultando sus respectivas model cards.

## Limitaciones y advertencias

- El grafo cubre solo un paso de streaming. El front end de mel y la actualizacion de la cache de hablante (`streaming_update_async`) no estan incluidos y hay que implementarlos por separado; sin ellos el modelo no funciona.
- Es un modelo de diarizacion, no de reconocimiento de voz: no transcribe ni entiende el contenido hablado.
- La informacion sobre sesgos es la de la model card original de NVIDIA, que no se reproduce aqui; se remite a ella.
- Riesgo de degradacion en condiciones acusticas distintas de las de evaluacion (audio limpio de debates y conversaciones simuladas). No hay datos de robustez frente a ruido, musica, reverberacion o microfonia lejana.
- La evaluacion documentada se limita al sueco. No hay evidencia publicada sobre su comportamiento en castellano ni en otros idiomas.
- El numero maximo de hablantes simultaneos no se especifica en la informacion disponible.
- Uso comercial: la licencia OpenMDW 1.1 es la que aplica, heredada de NVIDIA y de los exports intermedios. Debe revisarse el texto completo de `LICENSE` antes de un despliegue comercial, ya que la ficha no resume sus condiciones.
- Repositorio con 0 descargas y 0 likes, creado y actualizado el mismo dia: no hay validacion por parte de la comunidad.
- La build se declara reproducible bit a bit, pero esa reproducibilidad depende del `requirements.txt` fijado y del script del repositorio de Sona, no de este repositorio.
- No se ofrecen garantias de mantenimiento ni de actualizacion por parte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Emerald7664/nemotron-3-diarization-onnx-int8
- Modelo base original de NVIDIA: https://huggingface.co/nvidia/Nemotron-3-Diarization
- Export ONNX fp32 de beshkenadze: https://huggingface.co/beshkenadze/nemotron-3-diarization-onnx
- Repositorio de Sona (aplicacion y scripts de cuantizacion): https://github.com/s0undy/sona
- Script de cuantizacion: https://github.com/s0undy/sona/tree/main/research/diarization-benchmark
- Texto de la licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/

Nota: la busqueda web realizada no ha devuelto ningun resultado relacionado con este modelo ni con diarizacion de hablantes; los enlaces obtenidos eran contenido no pertinente y se han descartado.
