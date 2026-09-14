# Adnan666/whisper-small-pashto-run11-epoch2

## Resumen

El modelo `Adnan666/whisper-small-pashto-run11-epoch2` es un ajuste fino (fine-tune) del modelo de reconocimiento automatico del habla (ASR) Whisper small de OpenAI, publicado en HuggingFace por el usuario Adnan666. Por el nombre del repositorio, el ajuste esta orientado a la transcripcion de audio en pashto (tambien conocido como pashtun o afgano), una lengua indoirania hablada por mas de 40 millones de personas principalmente en Afganistan y Pakistan. El nombre "run11-epoch2" sugiere que se trata del undecimo experimento de una serie de entrenamientos y que el checkpoint publicado corresponde a la segunda epoca.

Con 241.734.912 parametros (aproximadamente 242 millones), el modelo se situa en la categoria "small" de la familia Whisper, lo que lo convierte en una opcion ligera y desplegable en hardware de consumo, a diferencia de las variantes medium (769 M) y large (1550 M). El repositorio ocupa 66,7 GB, un tamano desproporcionado para un modelo de este numero de parametros, lo que apunta a la presencia de multiples checkpoints intermedios, estados del optimizador u otros artefactos de entrenamiento ademas de los pesos finales en safetensors.

Su relevancia radica en la escasez de modelos ASR publicos y abiertos para lenguas de bajos recursos como el pashto, donde los modelos multilingues genericos de Whisper suelen ofrecer tasas de error elevadas. El modelo acumula 171 descargas y 0 "likes", y no declara licencia ni idiomas soportados en la informacion disponible. La busqueda web realizada no devolvio ningun resultado relacionado con este modelo: los unicos enlaces recuperados corresponden al portal de streaming ZDF y son completamente ajenos al ambito del ASR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Whisper small; dato derivado del modelo base, no confirmado en la model card) |
| Parametros totales | 241.734.912 (segun safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la arquitectura Whisper small trabaja con ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | no disponible (el repositorio solo declara pesos safetensors; no se confirman versiones GGUF, int8 o int4) |
| Idiomas soportados | no disponible (el nombre del repositorio sugiere pashto, pero no se declara oficialmente) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 66,7 GB |
| Descargas | 171 |
| Likes | 0 |
| Fecha de creacion | 2026-09-11 |
| Ultima actualizacion | 2026-09-13 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper small: un transformer encoder-decoder con aproximadamente 12 capas en el encoder y 12 en el decoder, anchura de modelo de 768 dimensiones, 12 cabezas de atencion y un vocabulario multilingue de 51.865 tokens (estas cifras corresponden a la arquitectura estandar de Whisper small y no se confirman de forma explicita en la model card). El modelo recibe representaciones log-Mel de audio y genera texto de forma autorregresiva, con soporte para tareas de transcripcion y traduccion mediante tokens de tarea. Al tratarse de un fine-tune, la unica informacion verificable sobre el entrenamiento es la que sugiere el propio nombre del repositorio: seria la ejecucion numero 11 de una serie de experimentos y el checkpoint correspondiente a la epoca 2.

No se dispone de informacion sobre el conjunto de datos de entrenamiento, el numero de horas de audio, la composicion del corpus, si se aplicaron tecnicas de aumento de datos, ni si hubo un proceso de ajuste con RLHF, DPO o similar. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal o destilacion. El hecho de que el checkpoint se detenga en la epoca 2 y de que el repositorio contenga 66,7 GB de datos sugiere un proceso de entrenamiento con guardado frecuente de checkpoints y posiblemente sin poda posterior, pero es una inferencia y no un dato confirmado.

## Capacidades

- Reconocimiento automatico del habla (ASR): transcripcion de audio a texto, presumiblemente optimizado para pashto segun el nombre del repositorio.
- Transcripcion de audio multilingue: heredada teoricamente del modelo base Whisper small, aunque no se confirma que el fine-tune conserve esas capacidades.
- Traduccion de voz a texto: la arquitectura Whisper permite la tarea de traduccion, pero no hay confirmacion de que se haya entrenado o evaluado para ello en este checkpoint.
- Procesamiento de segmentos de audio: por la arquitectura base, manejo de fragmentos de hasta 30 segundos con posibilidad de encadenamiento para audios mas largos.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de vision o audio-vision: no disponible (Whisper es exclusivamente de audio a texto).
- Modo "thinking": no aplica.

## Casos de uso

- Transcripcion de contenido audiovisual en pashto: el modelo puede emplearse para subtitular videos, entrevistas o programas de radio en pashto, un escenario donde las alternativas comerciales suelen tener cobertura limitada.
- Archivado y digitalizacion de material oral: bibliotecas, ONG y organismos de patrimonio cultural podrian transcribir archivos de audio historico en pashto para hacerlos buscables en texto.
- Investigacion linguistica: los corpus transcritos generados con este modelo pueden alimentar estudios de fonetica, morfologia y variacion dialectal del pashto.
- Asistencia humanitaria y comunicacion en terreno: transcripcion de declaraciones, entrevistas o mensajes de voz recogidos por organizaciones que operan en Afganistan o zonas pashtunhablantes de Pakistan.
- Accesibilidad: generacion de subtitulos para personas con discapacidad auditiva en contenido hablado en pashto, donde la oferta de subtitulado automatico es escasa.
- Preprocesado de pipelines NLP: conversion de audio a texto como primer paso de tareas posteriores como analisis de sentimiento, resumen o indexacion semantica en pashto.
- Prototipado e investigacion en ASR de bajos recursos: sirve como punto de partida para experimentos de comparacion, ajuste adicional o evaluacion de tecnicas de aumento de datos en lenguas con pocos recursos.
- Integracion en aplicaciones de dictado o asistentes de voz en pashto, siempre que se valide la calidad real del modelo con datos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo; los unicos enlaces recuperados pertenecen al portal de streaming ZDF y no guardan relacion con el reconocimiento automatico del habla. No se dispone por tanto de valores de WER (word error rate), CER, MMLU ni de ninguna otra metrica, ni de comparaciones oficiales con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, aproximadamente 1 GB; en FP16/BF16, alrededor de 500 MB; en int8, unos 250-300 MB. Estas cifras se derivan del numero de parametros (242 M) y son estimaciones, no datos confirmados por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; se puede ejecutar con holgura en NVIDIA RTX 3060, RTX 4060, RTX 4090, T4, L4, A10, A100 y H100. El modelo tambien puede correr en CPU, aunque con mayor latencia.
- Compatibilidad con GPU de consumo: si, cabe sin problema en practicamente cualquier GPU de consumo moderna e incluso en iGPU de portatiles con memoria compartida suficiente.
- Opciones de despliegue: transformers (PyTorch), faster-whisper (CTranslate2), whisper.cpp, WhisperX, Hugging Face Inference Endpoints y, con la conversion pertinente, vLLM para servir transcripcion a escala. No se confirma disponibilidad de pesos GGUF en el repositorio.
- Latencia y throughput estimados: no disponibles. Al tratarse de un modelo small de 242 M de parametros, se espera una latencia baja en GPU moderna, pero no hay mediciones publicadas por el autor.
- Nota de almacenamiento: aunque los pesos del modelo ocupan menos de 1 GB, el repositorio completo son 66,7 GB, por lo que la descarga requiere planificar el espacio en disco o descargar unicamente los archivos safetensors concretos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Licencia | Disponibilidad | Rendimiento en pashto |
|---|---|---|---|---|---|
| Adnan666/whisper-small-pashto-run11-epoch2 | 241,7 M | Ventanas de audio de 30 s (arquitectura Whisper small) | no disponible | HuggingFace, safetensors | no disponible |
| openai/whisper-small | 244 M | Ventanas de audio de 30 s | Apache 2.0 | HuggingFace, multiple formatos | no disponible (sin ajuste especifico en pashto) |
| openai/whisper-medium | 769 M | Ventanas de audio de 30 s | Apache 2.0 | HuggingFace, multiple formatos | no disponible |
| openai/whisper-large-v3 | 1550 M | Ventanas de audio de 30 s | Apache 2.0 | HuggingFace, multiple formatos | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas para la tarea concreta de transcripcion en pashto, por lo que no es posible afirmar cual ofrece mejor WER.

## Limitaciones y advertencias

- Ausencia de licencia declarada: al no especificarse licencia en la model card, no se puede asumir permiso para uso comercial ni redistribucion. Es imprescindible contactar con el autor antes de cualquier uso en produccion.
- Idiomas no declarados oficialmente: aunque el nombre del repositorio indica pashto, la model card no confirma los idiomas soportados ni el alcance dialectal del ajuste.
- Sin benchmarks publicados: no hay evidencia cuantitativa de la calidad del modelo, por lo que cualquier despliegue deberia ir precedido de una evaluacion propia con un conjunto de validacion representativo.
- Riesgo de alucinacion: los modelos Whisper tienden a generar texto plausible cuando el audio es ruidoso, ininteligible o esta en un idioma distinto al de entrenamiento; este riesgo puede verse agravado en un fine-tune con pocas epocas.
- Sobreajuste potencial: el checkpoint corresponde a la epoca 2 de un experimento ("run11"), lo que puede indicar un entrenamiento corto o no convergido.
- Tamano del repositorio: 66,7 GB frente a menos de 1 GB de pesos finales implica probablemente checkpoints intermedios o estados de entrenamiento; conviene revisar los archivos antes de descargar el repositorio completo.
- Sesgos: no hay informacion sobre la composicion demografica, dialectal o de genero del corpus de entrenamiento, por lo que se desconoce el comportamiento del modelo ante voces, acentos o variantes dialectales poco representadas.
- Riesgo de datos personales: al ser un modelo de ASR aplicado a audio real, su uso implica tratamiento de datos potencialmente personales; deben aplicarse las garantias legales correspondientes (RGPD u otras).
- Madurez: 171 descargas y 0 likes sugieren un modelo experimental sin validacion por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/Adnan666/whisper-small-pashto-run11-epoch2
- Repositorio oficial de Whisper (OpenAI, referencia del modelo base): https://github.com/openai/whisper
- Modelo base openai/whisper-small: https://huggingface.co/openai/whisper-small
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- faster-whisper (CTranslate2): https://github.com/SYSTRAN/faster-whisper
- whisper.cpp: https://github.com/ggerganov/whisper.cpp

Nota: la busqueda web realizada no devolvio ningun enlace relacionado con este modelo ni con el reconocimiento automatico del habla en pashto; los resultados obtenidos correspondian al portal de streaming ZDF y se han descartado por no ser relevantes.
