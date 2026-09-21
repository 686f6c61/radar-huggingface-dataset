# capacit-ai/saga-2-m

## Resumen

Saga-2-m es un modelo de reconocimiento automatico del habla (ASR) publicado por capacit-ai en HuggingFace, especializado en danes (codigo de idioma `da`) y disenado para transcripcion de audio a texto. El repositorio declara la pipeline `automatic-speech-recognition`, un total de 1.238.266.880 parametros (aproximadamente 1,24 mil millones) en formato safetensors y un tamano de repositorio de 2,5 GB, coherente con pesos almacenados en bf16/fp16. Se distribuye bajo licencia Apache 2.0, aunque el acceso esta restringido (gated) y requiere aceptar las condiciones en HuggingFace.

La relevancia del modelo esta en su enfoque monoidioma: frente a los modelos ASR multilingues genericos, Saga-2-m concentra su entrenamiento en danes, un idioma con menos recursos y con gran variabilidad dialectal. Las etiquetas del repositorio incluyen `whisper` y `qwen3`, lo que sugiere una arquitectura derivada o hibrida basada en esos componentes, aunque la informacion disponible no detalla la composicion exacta del encoder ni del decoder. El autor declara resultados en cinco conjuntos de evaluacion en danes (CoRal, FTSpeech, FLEURS y Common Voice), con valores de WER entre 6,08 y 18,38.

Se trata de un modelo publicado muy recientemente (creado el 13 de septiembre de 2026 y actualizado el 20 de septiembre de 2026) y con traccion todavia baja: 132 descargas y 10 "me gusta" en el momento de redactar esta ficha. Es, por tanto, una opcion a evaluar para proyectos de voz en danes, pero con poca validacion independiente acumulada hasta la fecha. Los resultados de benchmarks estan declarados por el autor y marcados como `verified: false` en el model-index.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle. Las etiquetas del repositorio indican `whisper` y `qwen3`, sin especificar la composicion (encoder/decoder) |
| Parametros totales | 1.238.266.880 (aproximadamente 1,24 mil millones) |
| Parametros activos | No aplica (no se declara que sea un modelo MoE) |
| Longitud de contexto | No disponible (modelo ASR; no se documenta la ventana de audio maxima) |
| Tipos de cuantizacion | No disponible. El repositorio solo publica safetensors; el tamano de 2,5 GB sugiere pesos en bf16/fp16 |
| Idiomas soportados | Danes (`da`) unicamente |
| Licencia | Apache 2.0, con acceso restringido (gated) sujeto a aceptacion de condiciones |
| Formato de pesos | safetensors |
| Tarea (pipeline) | automatic-speech-recognition |
| Tamano del repositorio | 2,5 GB |
| Acceso | Restringido: requiere aceptar condiciones en HuggingFace |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo. Las etiquetas oficiales del repositorio incluyen `whisper` y `qwen3`, ademas de la etiqueta propia `wqwen`, lo que apunta a una construccion basada en componentes de la familia Whisper y de la familia Qwen3. No se especifica si se trata de un encoder Whisper con decoder Qwen3, de un modelo Whisper ajustado con inicializacion parcial de Qwen, o de otra combinacion. Tampoco se detalla el numero de capas, dimensiones ocultas, cabezas de atencion ni el esquema de ventanas de audio.

En cuanto a los datos de entrenamiento, el model-index referencia los conjuntos `alexandrainst/ftspeech`, `alexandrainst/coral`, `google/fleurs` y `mozilla-foundation/common_voice_17_0`, todos ellos corpus de habla en danes (FTSpeech y CoRal son especificos de danes; FLEURS y Common Voice aportan cobertura adicional). No se indica el numero total de horas de audio utilizadas, la composicion exacta del dataset, ni si se aplicaron tecnicas de ajuste como RLHF, DPO o fine-tuning supervisado con una receta concreta. Tampoco se documenta ninguna innovacion tecnica especifica (decodificacion especulativa, atencion lineal, chunking de audio largo, etc.).

## Capacidades

- Reconocimiento automatico del habla en danes: conversion de audio a texto, con resultados declarados de WER entre 6,08 y 18,38 segun el dominio del corpus de evaluacion.
- Transcripcion de habla leida o preparada: el mejor resultado declarado corresponde a FTSpeech (WER 6,08 / CER 3,34), un corpus de habla con caracteristicas mas controladas.
- Transcripcion de habla conversacional: cubierta mediante CoRal (conversation), con WER 18,38, el escenario mas dificil de los evaluados.
- Robustez a distintas procedencias de audio: los conjuntos de evaluacion incluyen lectura en voz alta (CoRal read-aloud), habla espontanea (CoRal conversation) y corpus generalistas (FLEURS, Common Voice).
- Soporte de tool calling / function calling: no disponible; no se documenta.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo es un sistema ASR, no un modelo de proposito general.
- Capacidades multilingues: no. El modelo declara exclusivamente danes (`da`).
- Capacidades especiales: no se documentan modos de "thinking", vision, audio generation, diarizacion de hablantes, deteccion de idioma ni marcas de tiempo. La informacion disponible no permite confirmarlas.

## Casos de uso

- Subtitulado de contenido audiovisual en danes: el modelo puede transcribir audio de video a texto para generar subtitulos, con un WER declarado de 6,08 en habla de tipo FTSpeech, adecuado para material con locucion clara; en material conversacional el WER sube a 18,38, por lo que conviene revision humana.
- Transcripcion de reuniones y actas corporativas en empresas danesas: el modelo esta entrenado sobre corpus que incluyen habla conversacional (CoRal conversation) y lectura (CoRal read-aloud), lo que cubre los dos regimenes tipicos de una reunion corporativa.
- Analitica de centros de contacto y call centers en Dinamarca: transcripcion masiva de llamadas para posterior analisis de calidad, cumplimiento normativo y deteccion de motivos de contacto, usando inferencia por lotes sobre GPU.
- Accesibilidad para personas con discapacidad auditiva en servicios publicos daneses: generacion de transcripciones en tiempo cuasi real de comunicaciones orales (ventanillas, atencion telefonica, aulas) con la limitacion de que no se documenta streaming ni marcas de tiempo.
- Creacion y anotacion de corpus de voz en danes: uso del modelo para pre-anotar grandes volumenes de audio antes de una revision humana, aprovechando su especializacion monoidioma frente a modelos multilingues genericos.
- Transcripcion de entrevistas de investigacion cualitativa y periodismo: paso de audio a texto para analisis posterior, con la ventaja de un unico idioma objetivo que evita confusiones de deteccion de idioma, pero con necesidad de verificacion en habla con ruido o solapamiento de voces.
- Asistentes de voz y comandos hablados en danes: integracion como etapa ASR en un pipeline de voz (ASR -> NLU -> accion), siempre que el dominio de vocabulario no se aleje demasiado de los corpus de entrenamiento.
- Archivado y busqueda de fondos sonoros en danes: transcripcion de archivos historicos o de bibliotecas de audio para habilitar busqueda por texto, asumiendo degradacion esperable en grabaciones antiguas o con ruido.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en el model-index del repositorio (todos marcados como `verified: false`, es decir, no verificados por HuggingFace ni por un tercero independiente):

| Conjunto de evaluacion | Split | WER | CER |
|---|---|---|---|
| CoRal (conversation) | test | 18,38 | 10,67 |
| CoRal (read-aloud) | test | 11,10 | 4,54 |
| FTSpeech | test | 6,08 | 3,34 |
| FLEURS (da_dk) | test | 8,07 | 3,41 |
| Common Voice Danish | test | 7,14 | No disponible (dato truncado en la informacion proporcionada) |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K ni equivalentes de texto) en la informacion disponible; no aplican a un modelo de reconocimiento del habla de proposito especifico. Tampoco se dispone de comparaciones con lineas base ejecutadas por el autor sobre los mismos conjuntos.

## Requisitos de hardware

- VRAM estimada para inferencia segun el recuento de parametros (1,24 mil millones), sin incluir activaciones ni buffers de audio: aproximadamente 2,5 GB en bf16/fp16, aproximadamente 1,3 GB en int8 y aproximadamente 0,7 GB en int4. El repositorio no publica cuantizaciones, por lo que los valores int8/int4 son calculos teoricos, no artefactos disponibles.
- En la practica, para bf16 conviene reservar entre 4 y 6 GB de VRAM considerando activaciones, cache y procesamiento por lotes de audio.
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 ejecutan el modelo sin problema en bf16 e incluso con lotes moderados.
- GPU de centro de datos recomendadas para alto throughput: A100 40/80 GB, H100 80 GB, L40S o A10G, especialmente para servir peticiones concurrentes por lotes.
- Opciones de despliegue: la pipeline `automatic-speech-recognition` de HuggingFace Transformers es la via directa. TGI (Text Generation Inference) y vLLM incluyen soporte para arquitecturas ASR tipo encoder-decoder, pero su compatibilidad con esta arquitectura concreta no esta confirmada en la informacion disponible. No se han publicado conversiones a GGUF ni integraciones en Ollama o whisper.cpp.
- Latencia y throughput estimados: no disponible. El autor no publica mediciones de latencia ni de RTF (real-time factor).
- Nota operativa: al ser un repositorio con acceso restringido, la descarga y el despliegue requieren autenticacion y aceptacion previa de condiciones en HuggingFace.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Enfoque | Rendimiento en danes |
|---|---|---|---|---|---|
| capacit-ai/saga-2-m | 1,24 mil millones | Solo danes | Apache 2.0 (acceso gated) | ASR especializado | WER 6,08-18,38 segun el autor (no verificado) |
| OpenAI Whisper large-v3 | 1,55 mil millones (dato publico de OpenAI) | Multilingue (incluye danes) | Apache 2.0 (pesos publicados por OpenAI) | ASR multilingue generico | No disponible en la informacion proporcionada |
| NB-Whisper (Alexandra Institute) | No disponible en la informacion proporcionada | Nordicos, incluido danes | No disponible en la informacion proporcionada | ASR para lenguas nordicas | No disponible en la informacion proporcionada |
| Modelos Qwen3-Audio de la familia Qwen | No disponible en la informacion proporcionada | Multilingue | No disponible en la informacion proporcionada | ASR y comprension de audio | No disponible en la informacion proporcionada |

La busqueda web realizada no ha devuelto informacion tecnica util sobre estos modelos ni sobre Saga-2-m; los resultados obtenidos no guardan relacion con el tema. Por tanto, cualquier comparacion de rendimiento con alternativas queda pendiente de ejecutar los mismos conjuntos de evaluacion de forma controlada.

## Limitaciones y advertencias

- Idiomas: el modelo solo declara soporte para danes. No debe usarse para otros idiomas ni como sistema de deteccion de idioma.
- WER elevado en habla conversacional: 18,38 de WER y 10,67 de CER en CoRal (conversation). En escenarios con solapamiento de voces, ruido de fondo o habla espontanea, la transcripcion requerira revision humana.
- Benchmarks no verificados: todos los resultados estan marcados como `verified: false` y proceden del propio autor. No hay evaluacion independiente publicada.
- Riesgo de alucinacion: como en cualquier modelo ASR de tipo seq2seq, existe riesgo de generar texto plausible en segmentos de silencio, ruido o musica, y de "corregir" palabras mal pronunciadas hacia formas mas frecuentes. Este riesgo no se ha cuantificado en la informacion disponible.
- Sesgos: la composicion del dataset de entrenamiento no se detalla, por lo que no es posible evaluar sesgos por acento, dialecto, edad, genero o condicion sociolinguistica dentro del danes. La cobertura de dialectos regionales daneses es una incognita.
- Limitaciones de contexto y audio largo: no se documenta la ventana de audio maxima ni la estrategia de troceado para audios largos, ni el soporte de marcas de tiempo o segmentacion. El uso en audio de mas de unos minutos debe validarse empiricamente.
- Capacidades no documentadas: no hay informacion sobre diarizacion de hablantes, deteccion de actividad vocal, puntuacion automatica, transcripcion en streaming ni normalizacion de texto.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion, pero el repositorio esta restringido (gated), por lo que el acceso y la descarga estan sujetos a las condiciones aceptadas en HuggingFace. Conviene revisar dichas condiciones antes de integrarlo en un producto.
- Madurez: modelo publicado recientemente (13 de septiembre de 2026, actualizado el 20 de septiembre de 2026), con 132 descargas y 10 "me gusta". La comunidad no ha acumulado aun reportes de uso en produccion.
- Entorno de produccion: no hay cuantizaciones publicadas ni conversiones a GGUF; desplegarlo en CPU o en entornos con poca memoria exigira generar las conversiones por cuenta propia, sin garantia de que preserven la calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/capacit-ai/saga-2-m
- Dataset CoRal: https://huggingface.co/datasets/alexandrainst/coral
- Dataset FTSpeech: https://huggingface.co/datasets/alexandrainst/ftspeech
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Dataset Common Voice 17.0: https://huggingface.co/datasets/mozilla-foundation/common_voice_17_0
- Paper, blog tecnico, repositorio de codigo o demo: no disponible (la busqueda web no ha devuelto resultados relevantes sobre el modelo)
