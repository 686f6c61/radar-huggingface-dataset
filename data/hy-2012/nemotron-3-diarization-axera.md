# HY-2012/Nemotron-3-Diarization.AXERA

## Resumen

Nemotron-3-Diarization.AXERA es un paquete de despliegue cuantizado del modelo de diarizacion de hablantes `nvidia/Nemotron-3-Diarization`, preparado por el usuario HY-2012 para ejecutarse sobre el SoC AX650N de AXERA. El modelo original de NVIDIA es un sistema end-to-end de diarizacion en streaming basado en la arquitectura Sortformer; esta version lo compila a cuatro grafos `axmodel` con activaciones U16 y pesos S8, de modo que la inferencia completa ocurre en la NPU del dispositivo y no en una GPU. La entrada es audio WAV mono a 16 kHz y la salida es un fichero RTTM con etiquetas temporales de hablante, con una resolucion de salida de 10 ms y un maximo de 8 hablantes simultaneos.

El repositorio pesa 0,2 GB e incluye los cuatro grafos (`preencode` y `encoder`, en variante offline y low latency), los activos de runtime (ventana de caracteristicas, banco de filtros mel y embedding de silencio aprendible), ejemplos de Python y C++, un binario aarch64 precompilado y un audio de demostracion de 120 s procedente de AMI. El pipeline se divide en dos grafos encadenados: `preencode` realiza el apilado de caracteristicas mel (3040 tramas mel a 380x512) y `encoder` aplica un transformer de 31 capas con RoPE que produce probabilidades a 10 ms de resolucion.

Su relevancia es doble. Por un lado, demuestra que un diarizador neuronal de este tamano puede ejecutarse en hardware de borde con un coste de precision muy bajo respecto a la referencia FP32 (entre +0,17 y +0,80 puntos porcentuales de DER). Por otro, ofrece dos configuraciones de contexto distintas: offline, con un buffer de entrada de 30,4 s y secuencia de 684 tramas, y low latency, con alrededor de 0,8 s de latencia y secuencia de 538 tramas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sortformer en streaming, encoder transformer de 31 capas con RoPE (dos grafos: `preencode` de apilado de caracteristicas y `encoder` de prediccion) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | No es contexto de texto: offline procesa secuencias de 684 tramas (spkcache 264 + fifo 40 + chunk 380); low latency procesa 538 tramas (264 + 264 + 10). Buffer de audio: 30,4 s en offline, ~0,8 s en low latency |
| Tipos de cuantizacion | Activaciones U16 / pesos S8, compilados con Pulsar2 a `axmodel`; no se distribuyen pesos en FP16/FP32 ni GGUF |
| Idiomas soportados | en, zh (segun las etiquetas del repositorio); la tarea de diarizacion es en gran medida independiente del idioma, pero no se documenta validacion en otras lenguas |
| Licencia | openmdw-1.1 (NVIDIA Open Model License), declarada como `license: other` con `license_name: openmdw-1.1` |
| Formato de pesos | `axmodel` (4 grafos) mas activos `.npy` (`learnable_sil_emb`, `feature_window`, `mel_filterbank`) y metadatos `model_meta*.json` |
| Tamano del repositorio | 0,2 GB |
| Entrada / salida | WAV mono 16 kHz / RTTM (`SPEAKER <uri> 1 <start> <dur> <NA> <NA> speaker_k <NA>`) |
| Hablantes maximos | 8 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un Sortformer, un modelo de diarizacion end-to-end que resuelve la asignacion de hablantes de forma conjunta en lugar de encadenar VAD, extraccion de embeddings y clustering. El encoder es un transformer de 31 capas con embeddings posicionales rotatorios (RoPE) que opera sobre caracteristicas log-mel de 128 bandas, ventana de 25 ms y paso de 10 ms, reutilizando la ventana Hann y el banco de filtros mel cuantizados dentro del propio checkpoint. La salida son probabilidades por trama para hasta 8 hablantes, posteriormente diezmadas a 80 ms en el host y gestionadas mediante `streaming_update`, que combina un embedding de silencio aprendible, compresion top-k con AOSC y una cola FIFO de expulsion.

El desglose en dos grafos responde a la necesidad de que el binario compilado para AX650N no contenga operaciones Scatter/Where ni formas dinamicas: el contrato de cada grafo esta fijado en `models/model_meta*.json`, con dimensiones de secuencia constantes para cada configuracion. La conversion (exportacion, binarizacion, calibracion y compilado con Pulsar2) esta publicada en el repositorio de GitHub del autor. No se documentan en la informacion disponible el numero de tokens o horas de audio de entrenamiento, la composicion del dataset original ni si hubo etapas de RLHF o DPO, ya que esta ficha corresponde al paquete de despliegue y no al modelo base de NVIDIA.

## Capacidades

- Diarizacion de hablantes completa: identifica quien habla y cuando, con hasta 8 hablantes y resolucion de 10 ms antes del diezmado a 80 ms.
- Generacion de RTTM estandar, directamente consumible por herramientas de evaluacion como `pyannote.metrics` y por pipelines de transcripcion.
- Procesamiento en streaming con dos modos seleccionables: offline con buffer de 30,4 s orientado a precision y low latency con aproximadamente 0,8 s para flujo en tiempo real.
- Reactivacion de hablantes: el embedding de silencio aprendible y el mecanismo `streaming_update` permiten mantener el estado de hablantes que reaparecen a lo largo de la reunion.
- Deteccion de actividad de voz implicita, ya que el modelo se publica con la etiqueta de pipeline `voice-activity-detection`.
- Inferencia en dispositivo de borde: al ejecutarse integramente en la NPU AX650N, no requiere GPU ni conectividad de red.
- No dispone de capacidades de generacion de texto, razonamiento, codigo, matematicas ni vision; tampoco de tool calling, function calling ni comportamiento agentico.

## Casos de uso

- Etiquetado de reuniones para transcripcion: el RTTM generado se combina con la salida de un sistema ASR para atribuir cada fragmento transcrito a su hablante, aprovechando el buffer de 30,4 s del modo offline en reuniones grabadas.
- Generacion de actas y resumenes por interlocutor: al disponer de segmentos con hablante y marcas temporales precisas, un LLM posterior puede resumir las intervenciones de cada participante por separado.
- Cumplimiento y auditoria de comunicaciones: en entornos financieros o sanitarios, el RTTM documenta quien dijo que en cada momento, lo que facilita la trazabilidad de conversaciones registradas.
- Subtitulado en directo con etiqueta de hablante: el modo low latency, con aproximadamente 0,8 s de retardo y un coste de 0,179 RTF en C++, permite emitir etiquetas de hablante casi en tiempo real junto al subtitulo.
- Despliegue en dispositivos de borde y salas de reunion: al ejecutarse en el SoC AX650N con un binario aarch64 precompilado, encaja en hardware empotrado de bajo consumo sin GPU ni servicio en nube.
- Analisis de reuniones en sala lejana: los resultados sobre AliMeeting (DER del 18,23% en 4 sesiones con collar 0) indican que el modelo es adecuado para audio de microfono de sala con solapamiento y reverberacion.
- Indexacion y busqueda por hablante en archivos de audio: el RTTM permite construir indices temporales que localizan las intervenciones de una persona concreta en grabaciones largas.
- Investigacion en diarizacion: el paquete reproduce fielmente la referencia FP32 (desviacion de +0,17 pp en AMI-SDM), por lo que sirve como banco de pruebas para estudiar el impacto de la cuantizacion U16/S8 en tareas de diarizacion.

## Benchmarks y rendimiento

Datos de precision publicados por el autor (collar=0, `pyannote.metrics`, referencias AMI Mix-Headset y AliMeeting reconstruidas localmente):

| Dataset | NeMo FP32 (referencia) | ONNX FP32 en host | AX650N U16/S8 | Delta DER |
|---|---|---|---|---|
| AMI-SDM, 5 sesiones (offline) | 29,82% | 29,83% | 29,99% (C++ 29,97%) | +0,17 pp |
| AliMeeting, 4 sesiones, campo lejano (offline) | 17,92% | 17,93% | 18,23% (C++ 18,19%) | +0,31 pp |
| AMI, 2 sesiones (low latency) | 28,28% | 28,26% | 29,08% | +0,80 pp |

Coste computacional medido en AX650N:

| Configuracion | RTF en Python | RTF en C++ | ms por paso en C++ |
|---|---|---|---|
| Offline (secuencia 684 x 31 capas) | 0,0096 | 0,0066 | 177 |
| Low latency (secuencia 538 x 31 capas) | 0,189 | 0,179 | 85,9 |

Un RTF inferior a 1 implica procesamiento mas rapido que el tiempo real en ambos modos. No se han publicado en la informacion disponible resultados de benchmarks de proposito general (MMLU, HumanEval, GSM8K), ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- Hardware objetivo: SoC AXERA AX650N, con los cuatro grafos `axmodel` ejecutandose en su NPU. No se distribuyen pesos para GPU ni para CPU de proposito general.
- VRAM: no aplica; el modelo no esta empaquetado para inferencia en GPU. El consumo de memoria del modelo base en FP32 no se documenta en esta informacion.
- GPU recomendadas: no disponible para este paquete. Para ejecutar el modelo NVIDIA original habria que acudir al repositorio `nvidia/Nemotron-3-Diarization`, cuya guia de hardware no forma parte de la informacion proporcionada.
- Compatibilidad con GPU de consumo: no aplica en esta distribucion, al estar compilada exclusivamente para la NPU AX650N.
- Despliegue en Python: `numpy` y `soundfile` como unicas dependencias, mas la rueda `pyaxengine`/`axengine` de AXERA-TECH. Entradas: `run_ax650.sh input.wav out.rttm [--lowlat]` o la API `nemotron_sdk` (`AxengineGraphPair`, `StreamingDiarizer`, `SortformerConfig`).
- Despliegue en C++: binario aarch64 precompilado `bin/nemotron_ax650`, con `LD_LIBRARY_PATH=/soc/lib` y soporte de hilos (`--threads 8`). Script de conveniencia: `run_cpp_ax650.sh`.
- Latencia y throughput: en modo offline, 0,0066 RTF en C++ y 177 ms por paso; en modo low latency, 0,179 RTF en C++ y 85,9 ms por paso, con aproximadamente 0,8 s de retardo de streaming en la variante de baja latencia.
- Otros motores de inferencia (vLLM, llama.cpp, Ollama, TGI): no aplicables, ya que el modelo no es un LLM y los pesos solo existen en formato `axmodel`.

## Comparativa con modelos similares

| Modelo | Tipo | Formato / despliegue | Contexto o buffer | DER publicado | Licencia |
|---|---|---|---|---|---|
| Nemotron-3-Diarization.AXERA (este) | Sortformer en streaming cuantizado | `axmodel` U16/S8 para NPU AX650N | 30,4 s offline / ~0,8 s low latency | 29,99% AMI-SDM; 18,23% AliMeeting | openmdw-1.1 |
| nvidia/Nemotron-3-Diarization (modelo base) | Sortformer en streaming FP32 | Pesos NeMo (no distribuidos en este repo) | No disponible | 29,82% AMI-SDM; 17,92% AliMeeting (referencia del autor) | NVIDIA Open Model License |
| Alternativas publicas de diarizacion (pyannote, Diarizen, entre otras) | Pipelines de clustering o end-to-end | Pesos PyTorch / ONNX | No disponible | No disponible en la informacion proporcionada | No disponible |

La comparacion cuantitativa con otros diarizadores publicos no puede realizarse con los datos disponibles: el autor solo reporta la comparacion interna contra la referencia FP32 de NeMo y el ONNX en host. Cualquier cifra frente a terceros exigiria una evaluacion propia bajo las mismas condiciones de collar y metrica.

## Limitaciones y advertencias

- La distribucion esta atada al hardware AX650N: sin ese SoC (o sin emulacion compatible) los grafos `axmodel` no son utilizables. No hay alternativa en GGUF, safetensors u ONNX publicada en este repositorio.
- El modelo esta limitado a 8 hablantes simultaneos. Reuniones con mas participantes requeriran estrategias externas de agrupacion.
- El audio de entrada debe ser WAV mono a 16 kHz; no se documenta soporte para otras frecuencias de muestreo ni para multicalnal.
- Los idiomas declarados son en y zh. No hay evidencia publicada de evaluacion en castellano ni en otras lenguas, por lo que el rendimiento en espanol es desconocido.
- La evaluacion se realizo sobre un numero reducido de sesiones (5 y 4 en offline, 2 en low latency) y en dominios concretos (AMI, AliMeeting). La extrapolacion a otros dominios acusticos no esta respaldada por datos.
- El modo low latency degrada mas la precision que el offline (+0,80 pp frente a +0,17 pp en AMI), por lo que la eleccion de modo implica un compromiso explicito entre latencia y DER.
- Riesgo de confusion de hablantes en segmentos de voz solapada, interlocutores con timbres similares o cambios frecuentes de turno: es una limitacion intrinseca de los diarizadores y no se publican metricas desagregadas por solapamiento.
- El repositorio registra 0 descargas y 0 likes en el momento de redactar esta ficha, y fue creado el 16 de octubre de 2026. Es un paquete reciente y sin validacion independiente por parte de terceros.
- La licencia figura como `license: other` con nombre `openmdw-1.1` (NVIDIA Open Model License). Antes de un uso comercial conviene revisar los terminos completos en el enlace de licencia, incluidos los requisitos de atribucion y las condiciones de redistribucion de modelos derivados.
- La trazabilidad del origen de los datos de entrenamiento del modelo base no se documenta en esta informacion, lo que dificulta auditar sesgos demograficos o acusticos.
- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo y no soporta tool calling ni flujos agenticos. Cualquier pipeline que necesite transcripcion debe combinarlo con un sistema ASR aparte.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/HY-2012/Nemotron-3-Diarization.AXERA
- Modelo base de NVIDIA: https://huggingface.co/nvidia/Nemotron-3-Diarization
- Codigo fuente de la conversion (exportacion, binarizacion, calibracion y compilado con Pulsar2): https://github.com/ZY-2012/Nemotron-3-Diarization.AXERA
- Licencia de referencia: https://huggingface.co/nvidia/Nemotron-3-Diarization
- Runtime `pyaxengine` de AXERA-TECH: https://github.com/AXERA-TECH/pyaxengine/releases/latest
- Canal de YouTube del autor (HY Official): https://www.youtube.com/channel/UCjk0vxDFjZCdiZ6keN1KtgQ
