# GetmanY1/wav2vec2-base-ebranch-17l-fi-471k-finetuned

## Resumen

El modelo `GetmanY1/wav2vec2-base-ebranch-17l-fi-471k-finetuned` es un sistema de reconocimiento automatico del habla (ASR) para fines, desarrollado por Yaroslav Getman y colaboradores del grupo de investigacion en tecnologia del habla de la Universidad Aalto (equipo de Mikko Kurimo). Se trata de un modelo wav2vec 2.0 Base en el que el codificador transformer original se ha sustituido por un codificador E-Branchformer de 17 capas, preentrenado de forma autosupervisada sobre 471.000 horas de audio en fines y posteriormente ajustado con CTC para transcripcion.

El modelo forma parte de una familia mas amplia publicada junto al articulo "From 2.1M Hours of Raw Broadcast Audio to Finnish Speech SSL" (arXiv:2610.13102), que explora el preentrenamiento a gran escala sobre audio de radiodifusion en bruto y compara arquitecturas (Transformer, Conformer y E-Branchformer) con recuentos de parametros equiparables. Con 96,3 millones de parametros, es un modelo compacto orientado a produccion en entornos con recursos limitados.

Su relevancia radica en que demuestra que una arquitectura hibrida como E-Branchformer puede igualar o superar a Conformer y Transformer en ASR de un solo idioma con un coste computacional contenido, y en que libera tanto los pesos en formato `safetensors` como el checkpoint original de fairseq, lo que facilita su reproduccion e integracion en pipelines existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 con codificador E-Branchformer de 17 capas (dimension de modelo 512, feed-forward 1024) |
| Parametros totales | 96.261.202 (96,3 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada a 16 kHz mono; ventana de atencion no especificada en la informacion) |
| Tipos de cuantizacion | no disponible (pesos en safetensors en precision original; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | fines (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y checkpoint original `fairseq/checkpoint.pt` |

## Arquitectura y entrenamiento

El modelo sigue el paradigma wav2vec 2.0: un codificador convolucional de caracteristicas (CNN feature encoder) que transforma la onda de audio a 16 kHz en una secuencia latente, seguido de un codificador de contexto que en este caso es un E-Branchformer de 17 capas con dimension de modelo 512 y dimension feed-forward 1024. El E-Branchformer combina atencion global con un bloque de convoluciones locales (branchformer), lo que permite capturar dependencias de corto y largo alcance en la senal de voz. El preentrenamiento es autosupervisado con el objetivo de wav2vec 2.0 (enmascaramiento contrastivo), y el ajuste final es una cabeza CTC sobre caracteres.

El preentrenamiento utilizo 471.000 horas de audio en fines provenientes del archivo de radio y television de la Agencia Finlandesa de Arte y Cultura, KUVI (antes Instituto Audiovisual Nacional, KAVI), junto con los conjuntos de entrenamiento de Finnish VoxPopuli, el corpus del Parlamento finlandes y Lahjoita puhetta. A partir de 2,1 millones de horas de audio de radiodifusion en bruto se aplico deteccion de actividad de voz, deduplicacion basada en transcripciones y filtrado por confianza de ASR (umbral τ = −0,10). El preentrenamiento se ejecuto durante 125.000 actualizaciones con tasa de aprendizaje 6e-4 sobre 512 GPU, con unos 3 minutos de audio por GPU. El ajuste fino CTC se realizo sobre 4.600 horas de voz transcrita (Parlamento finlandes y Lahjoita puhetta) durante 16.000 actualizaciones sobre 128 GPU, congelando el codificador CNN.

Una innovacion destacable es el uso de codigo de modelado personalizado (`trust_remote_code=True`) para reproducir el codificador de fairseq dentro de transformers, lo que permite cargar el modelo con la API estandar de Hugging Face sin depender de fairseq. Ademas, se publica el checkpoint original de fairseq junto con el diccionario de caracteres (`dict.ltr.txt`) para quien prefiera el ecosistema nativo.

## Capacidades

- Reconocimiento automatico del habla (ASR) en fines con salida a nivel de caracter mediante CTC.
- Transcripcion de audio monofonico a 16 kHz; requiere `do_normalize=False` en el procesador.
- Manejo de habla espontanea y de dominios diversos: conversacional (Lahjoita puhetta), parlamentario (Finnish Parliament), lectura (Common Voice, FLEURS) y radiodifusion real (KAVI).
- Capacidad de ejecutarse tanto en transformers (con `trust_remote_code=True`) como en fairseq mediante el checkpoint original.
- No soporta tool calling, function calling, agentes, vision, audio de salida ni modo de razonamiento explicito: es un modelo puramente acustico-a-texto.
- Capacidad multilingue limitada al fines; no se documenta transferencia a otros idiomas.

## Casos de uso

- Transcripcion de archivos audiovisuales de radiodifusion: el modelo fue preentrenado sobre audio de radio y television finlandesa y obtiene su mejor WER en el conjunto KAVI (22,44 %), por lo que es adecuado para digitalizar y transcribir fondos de archivo con habla real y ruido de emision.
- Subtitulado automatico de contenido en fines: con 96 M de parametros y una latencia baja esperada, puede desplegarse en pipelines de generacion de subtitulos para plataformas de video, ajustando el CTC a los tiempos de locucion.
- Actas y transcripciones parlamentarias: el ajuste fino incluye el corpus del Parlamento finlandes, lo que lo hace idoneo para transcribir sesiones y debates con vocabulario politico y formal.
- Investigacion en tecnologia del habla: sirve como linea base reproducible para comparar arquitecturas (Transformer, Conformer, E-Branchformer) con recuentos de parametros equiparables, ya que se publican pesos y configuraciones.
- Asistentes de voz y comandos en fines: su tamano compacto permite ejecutarlo en servidores modestos o en el borde para tareas de dictado y reconocimiento de comandos en aplicaciones finlandesas.
- Generacion de datos de entrenamiento: las transcripciones de alta calidad sobre grandes volumenes de audio pueden usarse para crear corpus etiquetados que alimenten otros modelos o sistemas de mineria de datos.
- Accesibilidad: transcripcion en tiempo casi real de reuniones y clases en fines para personas con discapacidad auditiva, aprovechando el bajo coste de inferencia del modelo.

## Benchmarks y rendimiento

Resultados de WER (%) en test de los modelos Base ajustados, con recuentos de parametros equiparables (Tabla III del articulo). LP = Lahjoita puhetta, FP = Finnish Parliament, CV = Common Voice 16.1, KAVI = habla de radiodifusion real.

| Modelo | Parametros | LP | FP'16 | FP'20 | CV | FLEURS | KAVI |
|---|---|---|---|---|---|---|---|
| Transformer, 12 capas (linea base previa, 158K horas) | 95,0 M | 22,27 | 10,92 | 8,42 | 10,61 | 13,27 | 27,45 |
| Transformer, 12 capas | 95,0 M | 22,28 | 10,72 | 8,70 | 9,74 | 13,02 | 24,85 |
| Transformer, 18 capas | 95,1 M | 21,33 | 10,64 | 8,66 | 8,99 | 12,71 | 23,91 |
| Conformer, 12 capas | 96,7 M | 18,89 | 10,08 | 8,07 | 6,46 | 11,20 | 23,71 |
| Conformer, 17 capas | 96,5 M | **18,50** | 9,83 | 7,94 | **5,69** | **10,56** | 22,71 |
| E-Branchformer, 12 capas | 98,4 M | 19,14 | 10,10 | **7,80** | 6,91 | 11,53 | 22,89 |
| **E-Branchformer, 17 capas (este modelo)** | 96,6 M | 18,80 | **9,54** | 7,85 | 6,19 | 11,09 | **22,44** |

El modelo obtiene el mejor WER en FP'16 (9,54 %) y KAVI (22,44 %) de su categoria, y se situa muy cerca del mejor en el resto de conjuntos, con la excepcion de Common Voice y FLEURS, donde el Conformer de 17 capas es ligeramente superior.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4-0,8 GB en FP32 (96 M de parametros), y menos de 0,5 GB en FP16 o INT8. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para el modelo, pero utiles para procesar lotes grandes.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas y en muchas integradas. Tambien puede ejecutarse en CPU para transcripcion por lotes con latencia aceptable.
- Opciones de despliegue: transformers con `AutoModelForCTC` y `trust_remote_code=True`; fairseq con el checkpoint original; servidores de inferencia compatibles con transformers (TGI no soporta CTC de forma nativa, por lo que se recomienda un wrapper propio o un servicio tipo FastAPI). No se documentan variantes GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada. El modelo se entreno con unos 3 minutos de audio por GPU en preentrenamiento y 2,5 minutos por GPU en ajuste fino, pero no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | WER KAVI | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| E-Branchformer 17 capas (este modelo) | 96,6 M | audio 16 kHz | 22,44 | Apache 2.0 | Hugging Face + fairseq |
| Conformer 17 capas (misma familia) | 96,5 M | audio 16 kHz | 22,71 | Apache 2.0 (presumible, misma familia) | Hugging Face |
| Transformer 18 capas (misma familia) | 95,1 M | audio 16 kHz | 23,91 | Apache 2.0 (presumible, misma familia) | Hugging Face |
| wav2vec 2.0 Base original (multilingue/ingles) | ~95 M | audio 16 kHz | no evaluado en fines | MIT (modelo original de Facebook) | Hugging Face |

La comparativa se limita a los modelos de la misma familia publicados en el articulo, ya que no se dispone de datos de otros sistemas ASR en fines con recuentos de parametros equiparables en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta fines; no se ha entrenado ni evaluado en otros idiomas, por lo que su uso fuera del fines producira transcripciones incorrectas.
- Requiere audio monofonico a 16 kHz y `do_normalize=False`; un preprocesado inadecuado degrada el rendimiento.
- Necesita `trust_remote_code=True` para cargarse en transformers, lo que implica ejecutar codigo personalizado del autor; conviene auditar el codigo antes de usarlo en produccion.
- El WER en habla espontanea (LP, 18,80 %) y en radiodifusion real (KAVI, 22,44 %) es notablemente superior al de dominios limpios (FP'20, 7,85 %), lo que refleja la dificultad del habla natural y ruidosa.
- No se documentan sesgos especificos, pero al entrenarse sobre corpus finlandeses (Parlamento, radio publica, Lahjoita puhetta) puede reflejar sesgos de registro, acento y demografia de esas fuentes.
- Riesgo de alucinacion en el sentido de transcripciones plausibles pero incorrectas en segmentos con ruido, solapamiento de hablantes o vocabulario fuera de dominio; no hay mecanismo de confianza calibrado publicado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende de codigo personalizado y de un checkpoint fairseq con posibles dependencias de terceros que conviene revisar.
- No se publican cifras de latencia ni de throughput, por lo que el dimensionado de produccion debe medirse empiricamente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion externa por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GetmanY1/wav2vec2-base-ebranch-17l-fi-471k-finetuned
- Modelo base (preentrenado): https://huggingface.co/GetmanY1/wav2vec2-base-ebranch-17l-fi-471k
- Articulo: https://arxiv.org/abs/2610.13102
- Codigo y configuraciones: https://github.com/aalto-speech/large-scale-monolingual-speech-foundation-models
- Fork de fairseq del autor: https://github.com/Getmany1/fairseq
- Perfil de Hugging Face de Yaroslav Getman: https://huggingface.co/GetmanY1
- Perfil de Hugging Face de Tamas Grosz: https://huggingface.co/Grosy
