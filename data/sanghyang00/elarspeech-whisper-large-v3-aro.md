# Sanghyang00/ELARSpeech-Whisper-Large-v3-aro

## Resumen

ELARSpeech-Whisper-Large-v3-aro es un modelo de reconocimiento automatico del habla (ASR, *automatic speech recognition*) obtenido por ajuste fino (*fine-tuning*) de openai/whisper-large-v3 sobre el idioma araona (codigo ISO 639-3 `aro`), una lengua indigena de la familia tacana hablada en el norte de Bolivia. Lo publica el usuario Sanghyang00 como parte del proyecto ELARSpeech, que segun su repositorio de GitHub constituye un conjunto de datos de 30.000 horas repartidas entre 675 lenguas infrarepresentadas.

El modelo emplea la arquitectura `WhisperForConditionalGeneration` con 1.543.491.840 parametros (aproximadamente 1,54 mil millones), identica a la del modelo base, y se distribuye en formato safetensors dentro de la libreria `transformers`. La entrada esperada es audio mono a 16 kHz y la salida es texto transcrito en araona, con el token de idioma `<|aro|>` fijado de forma explicita en el prompt del decodificador.

Su relevancia radica en que cubre una lengua con practicamente nulos recursos digitales y sin presencia en los corpus masivos que alimentan a los sistemas ASR comerciales. Al derivar de Whisper large-v3, hereda el preentrenamiento multilingue de gran escala y solo requiere ajuste sobre el dominio objetivo, lo que lo convierte en un ejemplo tipico de adaptacion de un modelo fundacional a una lengua de cola larga. No se ha publicado licencia ni resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | WhisperForConditionalGeneration (transformer encoder-decoder) |
| Parametros totales | 1.543.491.840 (~1,54 mil millones) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | Ventana de audio de 30 s; contexto del decodificador de 448 tokens |
| Tipos de cuantizacion | Repositorio solo en safetensors; no se especifican cuantizaciones propias |
| Idiomas soportados | Araona (`aro`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo conserva intacta la arquitectura de Whisper large-v3: un transformer encoder-decoder con normalizacion pre-LayerNorm, atencion multi-cabeza estandar y embeddings posicionales sinusoidales. El encoder procesa espectrogramas Mel de 128 bandas sobre ventanas de 30 segundos y el decodificador genera la transcripcion de forma autoregresiva, empleando tokens especiales para idioma, tarea (*transcribe*) y marcas de tiempo. El ajuste fino se realizo sobre openai/whisper-large-v3, que a su vez fue entrenado por OpenAI con 5 millones de horas de audio debilmente supervisado y 680.000 horas etiquetadas.

No se detalla en la model card el numero de tokens de audio utilizados en el ajuste, la composicion exacta del subconjunto de ELARSpeech empleado para el araona ni si se aplicaron tecnicas de RLHF o DPO (no son habituales en ASR). La unica verificacion tecnica declarada es que el artefacto exportado se compara contra el checkpoint original de ELARSpeech sobre un conjunto fijo de evaluacion, con estado de verificacion de transcripcion exacta **PASS**. Tambien se indica que el prompt del decodificador debe construirse de forma explicita (con `<|aro|>`, `<|transcribe|>` y `<|notimestamps|>`) en lugar de usar el parametro `language=`.

## Capacidades

- Transcripcion de voz a texto en araona a partir de audio mono a 16 kHz.
- Manejo de la tarea de transcripcion (y no de traduccion) mediante el token `<|transcribe|>`.
- Generacion sin marcas de tiempo explicitas cuando se usa el token `<|notimestamps|>` en el prompt.
- Hereda la robustez de Whisper large-v3 frente a ruido de fondo, acentos y variabilidad de grabacion, aunque no se documentan pruebas especificas para este ajuste.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente acustico-textual.
- No dispone de capacidades de vision, audio-vision ni thinking mode.
- Capacidad multilingue limitada por diseno: es un modelo de un unico idioma (araona).

## Casos de uso

- Documentacion de lenguas indigenas: transcripcion de grabaciones de campo de hablantes de araona para construir corpus escritos y preservar la lengua, aprovechando que el modelo esta especializado en esa variedad concreta.
- Investigacion linguistica descriptiva: conversion automatica de entrevistas y elicitaciones a texto para su anotacion fonologica, morfologica y lexica por parte de linguistas de campo.
- Archivado y catalogacion de patrimonio oral: generacion de transcripciones de mitos, cantos y relatos tradicionales para su indexacion en archivos digitales sonoros.
- Subtitulado de material audiovisual comunitario: produccion de subtitulos en araona para videos educativos o documentales dirigidos a la propia comunidad.
- Educacion bilingue intercultural: apoyo a la creacion de materiales didacticos escritos en araona a partir de locuciones grabadas por docentes.
- Validacion de sistemas ASR comparativos: uso como referencia dentro de la familia ELARSpeech para medir el comportamiento de Whisper large-v3 en lenguas de cola larga frente a variantes como la dedicada al idioma `afi`.
- Investigacion en adaptacion de modelos fundacionales: estudio de como el ajuste fino de un unico idioma con recursos minimos modifica el comportamiento del decodificador de Whisper.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo declara una verificacion de transcripcion exacta (**PASS**) frente al checkpoint original de ELARSpeech sobre un conjunto fijo de muestra, sin cifras de WER, CER ni comparaciones numericas con otros sistemas.

## Requisitos de hardware

- Inferencia en FP16: aproximadamente 3 GB de VRAM para los pesos, mas el consumo de activaciones y del encoder de audio.
- Inferencia en FP32: aproximadamente 6 GB de VRAM.
- Cabe holgadamente en GPU de consumo: RTX 3060 (12 GB), RTX 4070, RTX 4080, RTX 4090; tambien en tarjetas de 6-8 GB si se usa int8 o FP16.
- GPU de datacenter recomendadas para lotes grandes o alta concurrencia: A100, H100, L40S.
- Despliegue: `transformers` con PyTorch es la via oficial indicada en la model card; la familia Whisper large-v3 es compatible con vLLM, TGI, Faster-Whisper/CTranslate2 y whisper.cpp para cuantizacion, aunque no se documenta soporte especifico verificado para este ajuste.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ELARSpeech-Whisper-Large-v3-aro | ~1,54 mil millones | Araona (`aro`) | 30 s de audio / 448 tokens | no disponible | HuggingFace (Sanghyang00) |
| openai/whisper-large-v3 | ~1,55 mil millones | ~99 idiomas | 30 s de audio / 448 tokens | Apache 2.0 (segun el repositorio base) | HuggingFace (OpenAI) |
| Sanghyang00/ELARSpeech-Whisper-Large-v3-afi | ~1,54 mil millones | idioma `afi` | 30 s de audio / 448 tokens | no disponible | HuggingFace (Sanghyang00) |

No se dispone de resultados de benchmarks comparativos entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo monoidioma: solo transcribe araona; no se puede esperar un comportamiento correcto en castellano u otras lenguas.
- La precision puede degradarse en funcion de las condiciones de grabacion, la poblacion de hablantes, la ortografia empleada y el dominio tematico, tal como advierte el propio autor.
- Es obligatorio remuestrear el audio a 16 kHz mono; otras frecuencias o canales pueden producir transcripciones erroneas.
- Riesgo de alucinacion inherente a Whisper en segmentos con silencio, ruido o habla poco clara, especialmente en lenguas con pocos datos de entrenamiento.
- No se especifica licencia, por lo que el uso comercial queda en situacion juridica indeterminada hasta que el autor la precise; la model card remite a la documentacion del proyecto ELARSpeech para los terminos del conjunto de datos y al repositorio base para su licencia.
- El modelo tiene 0 descargas y 0 likes, sin validacion independiente por parte de la comunidad.
- No se documentan metricas objetivas (WER/CER) sobre conjuntos de prueba publicos, solo una comprobacion de igualdad frente al checkpoint de origen.
- Al ser un ajuste de un modelo base con licencia Apache 2.0, conviene verificar las condiciones de atribucion y cita exigidas por OpenAI y por el proyecto ELARSpeech.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sanghyang00/ELARSpeech-Whisper-Large-v3-aro
- Repositorio ELARSpeech en GitHub: https://github.com/sanghyang00/elarspeech
- Modelo base openai/whisper-large-v3: https://huggingface.co/openai/whisper-large-v3
- Repositorio oficial de Whisper: https://github.com/openai/whisper
- Variante ELARSpeech para el idioma `afi`: https://huggingface.co/Sanghyang00/ELARSpeech-Whisper-Large-v3-afi
- Documentacion de Whisper Large v3 en Groq: https://console.groq.com/docs/model/whisper-large-v3
