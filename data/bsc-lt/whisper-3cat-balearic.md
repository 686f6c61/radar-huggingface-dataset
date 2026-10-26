# BSC-LT/whisper-3cat-balearic

## Resumen

whisper-3cat-balearic es un modelo de reconocimiento automatico del habla (ASR) para catalan, especializado en el acento balear, desarrollado por el Barcelona Supercomputing Center (BSC-LT) dentro del ecosistema del Projecte AINA. Se trata de un ajuste fino (fine-tuning) del modelo openai/whisper-large-v3 sobre el split "perfect_matches" del corpus 3CatParla, un conjunto de programas de television en catalan transcritos manualmente que aporta 90 horas de audio. El resultado es un sistema encoder-decoder de tipo transformer, con aproximadamente 1.550 millones de parametros heredados del modelo base, que transcribe audio a texto plano sin puntuacion.

El interes del modelo es acotado pero practico: no compite en capacidades generales, sino que ataca un problema concreto, la transcripcion de habla catalana con acento balear en dominios de radiodifusion y television, donde los modelos multilingues genericos pierden precision. El ajuste se realizo con un learning rate de 1e-6, 20 epocas, batch de 32 y audio remuestreado a 16 kHz, siguiendo el tutorial oficial de Hugging Face para fine-tuning de Whisper.

La relevancia actual viene de dos factores. Por un lado, la licencia Apache 2.0 permite uso comercial sin restricciones adicionales, algo poco habitual en modelos ASR especializados en lenguas minorizadas. Por otro lado, el modelo se publica junto con su corpus de origen (3CatParla) y un conjunto de validacion (IB3), lo que facilita la reproducibilidad y la evaluacion por acentos dentro del catalan. El repositorio ocupa 12,3 GB e incluye pesos en formato transformers/PyTorch; a fecha de la informacion disponible acumula 68 descargas y 2 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), heredada de openai/whisper-large-v3 |
| Parametros totales | ~1.550 millones (heredados del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventanas de audio de 30 segundos (heredado del modelo base); texto de salida limitado a 448 tokens por ventana |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (el modelo se publica en precision original para transformers; admite conversion a fp16, int8 y GGUF mediante herramientas externas) |
| Idiomas soportados | Catalan (ca), con especializacion en acento balear |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors / PyTorch (libreria transformers) |

Otros datos tecnicos: frecuencia de muestreo de entrada 16.000 Hz, tamano del repositorio 12,3 GB, pipeline `automatic-speech-recognition`, tarea `automatic-speech-recognition`, modelo base `openai/whisper-large-v3` (fine-tune, no adaptador).

## Arquitectura y entrenamiento

La arquitectura es la de Whisper large-v3 sin modificaciones estructurales: un encoder que procesa espectrogramas mel de 128 bandas sobre ventanas de 30 segundos y un decoder autorregresivo que genera tokens de texto, con un vocabulario multilingue de aproximadamente 51.866 tokens. El ajuste fino no altera la topologia, solo los pesos, de modo que el modelo conserva los mecanismos internos de Whisper (prediccion de idioma, marcas de tiempo a nivel de segmento y tareas de transcripcion/traduccion), aunque el entrenamiento se ha centrado en la tarea de transcripcion en catalan.

El entrenamiento se realizo sobre el split "perfect_matches" del corpus 3CatParla, compuesto por 90 horas de audio de television en catalan con transcripcion manual, y se valido con el corpus IB3. Los hiperparametros declarados son: learning rate 1e-6, batch de entrenamiento y evaluacion de 32, 20 epocas y frecuencia de muestreo de 16 kHz, siguiendo el tutorial de fine-tuning de Whisper publicado por Hugging Face. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa; tampoco se detalla la composicion exacta del dataset mas alla del dominio (programas de television) y del numero de horas.

## Capacidades

- Transcripcion de audio a texto en catalan, con salida en texto plano sin puntuacion.
- Especializacion en habla con acento balear, incluyendo voces masculinas y femeninas.
- Reconocimiento sobre audio de radiodifusion y television, con posible presencia de ruido de fondo, musica y solapamiento de hablantes propio del dominio de entrenamiento.
- Procesamiento de audio a 16 kHz en ventanas de 30 segundos, con la posibilidad de encadenar ventanas para audio de mayor duracion mediante los scripts estandar de transformers.
- Conserva las capacidades multilingues del modelo base en los pesos, aunque el ajuste fino esta orientado exclusivamente al catalan y no se han validado otros idiomas.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, vision ni audio multimodal. Es un modelo puramente ASR.

## Casos de uso

- Transcripcion de archivos audiovisuales de television autonomicos: el modelo convierte emisiones y programas en catalan balear a texto para archivo, indexacion o subtitulado base, aprovechando que fue entrenado precisamente sobre 90 horas de television en catalan.
- Generacion de subtitulos para contenido de medios de Baleares: integrado en un pipeline de extraccion de audio y remuestreo a 16 kHz, permite producir subtitulos en catalan que despues se revisan y se les anade puntuacion.
- Analisis de archivo audiovisual y busqueda semantica: la transcripcion permite indexar horas de video y habilitar busqueda por texto sobre el contenido hablado en emisiones historicas.
- Atencion al cliente en catalan balear: transcripcion de llamadas o notas de voz en centros de atencion de Baleares, con la ventaja de que la licencia Apache 2.0 permite desplegarlo en infraestructura propia sin coste por licencia.
- Accesibilidad y actas de reuniones: transcripcion de sesiones, plenos o reuniones en catalan con acento balear para generar actas borrador, dado el bajo WER declarado en el dominio de entrenamiento.
- Investigacion en ASR de lenguas minorizadas: linea base reproducible para comparar tecnicas de adaptacion por acento, al estar publicados el corpus, los hiperparametros y el conjunto de validacion.
- Preprocesado para otros sistemas de PLN: conversion de audio a texto que alimente clasificadores, resumen automatico o sistemas de extraccion de informacion en catalan.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index del modelo (no verificados, `verified: false`):

| Dataset | Split | Metrica | Valor |
|---|---|---|---|
| 3CatParla (Test) | test | WER | 0,84 |
| CV Benchmark Catalan Accents | Balearic female | WER | 5,61 |
| CV Benchmark Catalan Accents | Balearic male | WER | 4,55 |

Advertencia sobre las unidades: el autor no especifica si los valores estan expresados en porcentaje o en fraccion. Los valores 5,61 y 4,55 solo son plausibles como porcentaje de WER (un WER de 561 % o 455 % seria absurdo), por lo que se interpretan como porcentajes. El valor 0,84 corresponde a un split del mismo corpus usado en entrenamiento, por lo que no debe leerse como rendimiento fuera de dominio. No se han publicado en la informacion disponible resultados en MMLU, HumanEval, GSM8K ni en benchmarks ASR generales (Common Voice catalan completo, Fleurs, MLS), ni comparaciones con otros sistemas en la misma tabla.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 6-8 GB, considerando los ~3,1 GB de pesos en precision media y el coste de las activaciones sobre ventanas de 30 segundos de espectrograma.
- VRAM estimada con cuantizacion int8 o GGUF: aproximadamente 2-4 GB, suficiente para tarjetas de gama media.
- GPU recomendadas: A100 40/80 GB o H100 para procesamiento por lotes a gran escala; RTX 4090, RTX 3090 o L4 para produccion con throughput alto; RTX 3060 12 GB o superiores para inferencia individual en fp16.
- Cabe en GPU de consumo: si, en fp16 en tarjetas con 8 GB o mas (RTX 3060 Ti, RTX 4060 Ti 16 GB, RTX 3070), y en int8/GGUF en tarjetas con 4-6 GB.
- Opciones de despliegue: pipeline `automatic-speech-recognition` de transformers (referencia del autor), servidor de inferencia propio con PyTorch, whisper.cpp o llama.cpp con conversion a GGUF para CPU, faster-whisper/CTranslate2 para aceleracion en produccion, y batch offline con Datasets + map. El soporte en vLLM o TGI no esta confirmado en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia estructural, Whisper large-v3 procesa ventanas de 30 segundos de forma no streaming; el coste por minuto de audio depende de la GPU y del tamano de lote.
- Disco: el repositorio ocupa 12,3 GB, un tamano superior al de los pesos en fp16 (~3,1 GB), lo que sugiere la presencia de checkpoints adicionales de entrenamiento en el repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Idioma | WER catalan | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| BSC-LT/whisper-3cat-balearic | ~1.550 M | Ventanas de 30 s | Catalan (balear) | 0,84 en 3CatParla test; 5,61 y 4,55 en CV acentos baleares (declarado) | Apache 2.0 | Hugging Face, transformers |
| openai/whisper-large-v3 | ~1.550 M | Ventanas de 30 s | 99 idiomas | No disponible en la informacion proporcionada para catalan balear | Apache 2.0 | Hugging Face, transformers, whisper.cpp |
| openai/whisper-large-v3-turbo | ~809 M | Ventanas de 30 s | Multilingue (reducido) | No disponible en la informacion proporcionada | Apache 2.0 | Hugging Face, transformers |

No se dispone en la informacion proporcionada de datos de otras variantes de BSC-LT o del Projecte AINA especificas para catalan, ni de resultados comparativos publicados frente a estos modelos en los mismos conjuntos de evaluacion. Cualquier comparacion de WER entre filas seria especulativa y no se incluye.

## Limitaciones y advertencias

- El modelo solo esta entrenado y validado para catalan; no se ha evaluado su comportamiento en castellano, otras lenguas ni en variedades del catalan distintas del balear, y el ajuste fino puede degradar el rendimiento multilingue original de Whisper.
- La salida es texto plano sin puntuacion ni formato; cualquier producto final requiere un paso posterior de puntuacion y normalizacion.
- El entrenamiento se limita a 90 horas de un unico dominio (television en catalan), lo que puede provocar degradacion en audio telefonico, reuniones con ruido, habla espontanea muy informal o audio de baja calidad.
- Riesgo de alucinacion: como todos los modelos de la familia Whisper, puede generar texto plausible en segmentos con silencio, musica o ruido, y repetir frases en bucles. Es necesario aplicar umbrales de confianza y deteccion de silencios en produccion.
- El WER de 0,84 en 3CatParla test procede de un split del mismo corpus usado para el ajuste fino, por lo que no es representativo del rendimiento en dominios nuevos; los valores en el benchmark de acentos (5,61 y 4,55) son mas informativos, aunque tambien estan sin verificar.
- No se documentan sesgos especificos por genero, edad, origen o calidad de grabacion mas alla de los splits por sexo del benchmark de acentos. Dado el origen del corpus (television publica), puede haber sesgo hacia registro formal y toward voces de locutores profesionales.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero la licencia del corpus de entrenamiento (3CatParla) debe verificarse por separado si se redistribuyen datos derivados.
- El procesamiento es por ventanas de 30 segundos, no streaming nativo; para transcripcion en tiempo real es necesario segmentar el audio y asumir latencia adicional.
- No hay garantia de marcas de tiempo precisas a nivel de palabra sin configuracion especifica de decodificacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BSC-LT/whisper-3cat-balearic
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Dataset de entrenamiento 3CatParla: https://huggingface.co/datasets/projecte-aina/3catparla_asr
- Dataset de validacion IB3: https://huggingface.co/datasets/projecte-aina/ib3_ca_asr
- Benchmark de acentos del catalan: https://huggingface.co/datasets/projecte-aina/commonvoice_benchmark_catalan_accents
- Tutorial de fine-tuning de Whisper (Hugging Face): https://huggingface.co/blog/fine-tune-whisper
- Cuaderno de ejemplo citado por el autor: https://colab.research.google.com/drive/1MHiPrffNTwiyWeUyMQvSdSbfkef_8aJC
- Organizacion BSC-LT: https://huggingface.co/BSC-LT
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces utiles son los presentes en la model card y en los metadatos de Hugging Face.
