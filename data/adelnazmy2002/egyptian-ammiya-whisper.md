# adelnazmy2002/egyptian-ammiya-whisper

## Resumen

Egyptian Ammiya Whisper es un ajuste fino (fine-tune) del modelo openai/whisper-small, especializado en el reconocimiento automatico del habla (ASR) de arabe egipcio coloquial, tambien conocido como Ammiya (codigo de idioma `arz`). Lo publica el usuario adelnazmy2002 en HuggingFace. El problema que resuelve es concreto: Whisper original rinde mal en arabe egipcio coloquial porque se entreno mayoritariamente con arabe estandar moderno (MSA) y otros dialectos, de modo que este modelo se reentrena de extremo a extremo sobre un corpus especifico de habla egipcia para mejorar la transcripcion de ese registro.

Tecnicamente es un transformer encoder-decoder de tipo Whisper (arquitectura estandar de la familia, sin modificaciones estructurales), con 241.734.912 parametros segun los pesos safetensors del repositorio. Trabaja sobre ventanas de audio de 30 segundos, la unidad de contexto fija que impone la arquitectura Whisper, y se ejecuta en GPU de consumo (el autor lo probo en una unica RTX 4070 Super de 16 GB).

Su relevancia actual es limitada pero clara para un nicho: no hay muchos modelos abiertos centrados en dialecto egipcio, y este ofrece una licencia MIT permisiva, pesos safetensors compatibles con el ecosistema transformers y un tamano (unos 242 millones de parametros) que permite inferencia en local, incluso en CPU. El repositorio tiene 0 descargas y 0 "likes", por lo que carece de validacion por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Whisper; base `openai/whisper-small`) |
| Parametros totales | 241.734.912 (~242 M) segun safetensors; la model card indica 400 M, dato contradictorio |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio por ventana (contexto fijo de Whisper); salida de hasta 448 tokens por segmento |
| Tipos de cuantizacion | no se publican versiones cuantizadas en el repositorio; al ser un checkpoint Whisper estandar admite las conversiones habituales (GGUF para whisper.cpp, CTranslate2 int8/float16 para faster-whisper) |
| Idiomas soportados | arabe (`ar`) y arabe egipcio (`arz`) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tamano del repositorio | 1,0 GB |
| Modelo base | openai/whisper-small |
| Dataset de entrenamiento | MAdel121/arabic-egy-cleaned |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura Whisper intacta: un transformer encoder-decoder que consume un espectrograma mel logaritmico de 80 canales y produce tokens de texto. Al derivar de whisper-small, comparte su configuracion (encoder y decoder con 12 capas cada uno y ancho de 768, segun la especificacion publica de whisper-small), con 241,7 millones de parametros efectivos en los pesos del repositorio. No introduce innovaciones estructurales como atencion lineal, decodificacion especulativa ni componentes MoE o SSM: el valor anade en el ajuste fino, no en el diseno.

El entrenamiento se hizo integramente sobre MAdel121/arabic-egy-cleaned, un corpus de 82.881 pares audio-texto (~13 GB, 16 kHz mono). Las fuentes son aproximadamente 75,1k lineas de habla egipcia (90,6%), ~4,7k grabaciones wav egipcias, ~2,5k clips egipcios recopilados de YouTube y ~630 clips de audio egipcio guionizados. Todos los clips son de 30 segundos o menos, con una duracion media de ~2,5 segundos, y se filtraron por duracion con transcripciones verificadas. El reparto fue 98/2, esto es, ~81,2k de entrenamiento y ~1,7k de validacion.

El entrenamiento se ejecuto en una sola RTX 4070 Super (16 GB de VRAM), a 3 epochs por subconjunto de 10k muestras, con 9 subconjuntos secuenciales (~244k vistas de muestra en total), batch de 32 por dispositivo mas 2 pasos de acumulacion de gradiente, learning rate de 1e-5 con 5% de warmup, precision mixta bf16/fp16 con TF32, gradient checkpointing y checkpoints cada 500 pasos. La perdida de validacion final reportada fue de 0,488. No se menciona uso de RLHF, DPO ni datos sinteticos.

## Capacidades

- Reconocimiento automatico del habla (ASR) en arabe egipcio coloquial (Ammiya), incluyendo el registro informal y dialectal.
- Transcripcion en arabe (token de idioma `ar`) y arabe egipcio (`arz`).
- Funciona como cualquier checkpoint Whisper, por lo que es compatible con las tareas `transcribe` y (potencialmente) `translate` del pipeline estandar, aunque el ajuste se hizo para transcripcion.
- Procesa audio en ventanas de 30 segundos, con soporte de audio largo mediante la segmentacion nativa de Whisper.
- Inferencia en local, sin necesidad de API externa.
- No dispone de tool calling ni function calling.
- No dispone de modo de razonamiento (thinking mode), vision ni audio de salida.
- No esta disenado como modelo de agentes ni de razonamiento multi-paso.

## Casos de uso

- Subtitulado de contenido audiovisual egipcio: series, podcasts y videos de YouTube en dialecto Ammiya se pueden transcribir de forma automatica para generar subtitulos, aprovechando que el modelo esta afinado especificamente para ese registro donde Whisper estandar falla.
- Analisis de llamadas de atencion al cliente en Egipto: las empresas pueden transcribir conversaciones telefonicas en dialecto para analitica, control de calidad y deteccion de motivos de contacto, con inferencia on-premise por privacidad.
- Indexacion y busqueda de archivos de audio: transcripcion masiva de un archivo de audio para generar indices de texto buscables (media monitoring, periodismo, archivos historicos orales).
- Investigacion linguistica sobre el dialecto egipcio: generar transcripciones a escala para estudios de variacion dialectal, lexico o fonetica, sobre un corpus que puede ampliarse a partir del modelo.
- Asistentes de voz y aplicaciones on-device: al ocupar unos cientos de MB y caber en GPU de consumo o CPU, permite integrar dictado o entrada de voz en aplicaciones locales sin enviar audio a la nube.
- Transcripcion de notas de voz en aplicaciones de mensajeria: conversion automatica de mensajes de voz de usuarios egipcios a texto para accesibilidad y busqueda.
- Anotacion y ampliacion de datasets ASR: el modelo puede pre-anotar audio egipcio no etiquetado, reduciendo el coste humano de construir corpus de dialecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (WER, MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de rendimiento reportado es la perdida de validacion del entrenamiento.

| Metrica | Valor |
|---|---|
| Perdida de validacion final | 0,488 |
| WER en arabe egipcio (Ammiya) | no disponible |
| WER en arabe estandar (MSA) | no disponible |
| Benchmarks estandar (MMLU, HumanEval, GSM8K) | no aplicable (modelo ASR) |

## Requisitos de hardware

- Peso de los parametros: ~968 MB en fp32, ~484 MB en fp16/bf16, ~242 MB en int8.
- VRAM estimada para inferencia: ~1-2 GB en fp16 con batch pequeno, ademas del consumo del runtime.
- Cabe sin problema en GPUs de consumo: RTX 3060 12 GB, RTX 4070/4070 Super, RTX 4090, GTX 1650 4 GB e incluso GPUs de 4 GB; tambien es viable en CPU para uso no intensivo.
- El autor lo entreno y probo en una unica RTX 4070 Super (16 GB de VRAM).
- Opciones de despliegue: HuggingFace transformers (pipeline `automatic-speech-recognition`), faster-whisper mediante CTranslate2 (int8/float16), whisper.cpp (GGUF), asi como los servidores de inferencia que soportan Whisper (por ejemplo vLLM o TGI). El propio autor indica que cualquier ruta de inferencia Whisper estandar es valida.
- Latencia y throughput estimados: no disponibles; no se publican cifras de factor de tiempo real ni de RTF.
- El modelo se presenta como apto para ejecucion on-device.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto (audio) | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| egyptian-ammiya-whisper | ~242 M | 30 s | ar, arz (centrado en egipcio) | MIT | HuggingFace, 0 descargas |
| openai/whisper-small (base) | ~244 M | 30 s | multilingue (99 idiomas) | Apache-2.0 | Publico, ampliamente usado |
| openai/whisper-base | ~74 M | 30 s | multilingue | Apache-2.0 | Publico |
| openai/whisper-large-v3 | ~1550 M | 30 s | multilingue (99 idiomas) | Apache-2.0 | Publico |

El modelo destaca frente a whisper-small (su base) por su especializacion en dialecto egipcio y por una licencia MIT mas permisiva que la Apache-2.0, pero carece de benchmarks publicados que cuantifiquen la mejora; los datos de parametros de los modelos comparados son los publicos de la familia Whisper. whisper-large-v3, con mas de seis veces los parametros, probablemente supera en precision general, pero no esta especializado en Ammiya y pesa mucho mas. No se dispone de comparativas con otros modelos especificos de dialecto egipcio en la informacion proporcionada.

## Limitaciones y advertencias

- Alcance dialectal estrecho: rinde mejor en habla coloquial egipcia y su precision se degrada en otros dialectos arabes, algo que el propio autor reconoce como esperado.
- Optimizado para enunciados cortos: el corpus tiene clips de ~2,5 segundos de media, por lo que el comportamiento en audios largos o conversacionales continuos no esta validado.
- Menor capacidad que los modelos grandes de la familia Whisper: al derivar de whisper-small, su robustez en audio ruidoso, con solapamiento de voces o acentos marcados sera inferior a la de whisper-large.
- Riesgo de alucinacion: los modelos Whisper tienden a generar texto plausible en tramos de silencio, ruido o musica; requiere post-procesado y umbrales de filtrado en produccion.
- Sin benchmarks publicados que respalden el rendimiento real frente a la base, por lo que la mejora cuantitativa no esta verificada.
- Sin validacion de la comunidad: 0 descargas y 0 "likes" en el momento de la consulta.
- Discrepancia de datos: la model card afirma 400 M de parametros, mientras que los pesos safetensors indican 241,7 M; conviene fijarse en el dato real.
- Sin versiones cuantizadas publicadas: habria que generarlas uno mismo para despliegues con whisper.cpp o faster-whisper.
- Fecha de creacion del repositorio inusualmente futura (2026-09-27), dato a tener en cuenta al evaluar su trazabilidad.
- Licencia MIT: permisiva para uso comercial, sin las restricciones tipicas que a veces acompanan a modelos derivados; aun asi, conviene verificar el cumplimiento de las condiciones del corpus de origen.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/adelnazmy2002/egyptian-ammiya-whisper
- Dataset de entrenamiento: https://huggingface.co/datasets/MAdel121/arabic-egy-cleaned
- Modelo base: https://huggingface.co/openai/whisper-small
- Articulo del proyecto (enlace generico de LinkedIn incluido en la model card): https://www.linkedin.com/
