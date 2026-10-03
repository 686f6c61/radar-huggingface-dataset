# loom-ai-org/lfm2.5-audio-1.5b-asr-loom

## Resumen

`loom-ai-org/lfm2.5-audio-1.5b-asr-loom` es un export en formato GGUF del modelo `LiquidAI/LFM2.5-Audio-1.5B`, publicado por el usuario `loom-ai-org` y orientado exclusivamente a reconocimiento automatico del habla (ASR). No es un modelo nuevo: los pesos son los del modelo base de Liquid AI, sin modificar, reempaquetados para el runtime `loom.cpp` mediante la herramienta `loom-exporter`. La etiqueta del pipeline es `automatic-speech-recognition` y la libreria asociada es `loom-py-rt`.

La arquitectura combina un codificador de audio FastConformer con el modelo de lenguaje LFM2.5-1.2B, de tipo hibrido convolution/attention. El recuento real de parametros declarado en los safetensors es de 1.290.617.777, y el repositorio ocupa 5,2 GB. El modelo trabaja con audio mono a 16 kHz y admite hasta 280 segundos de audio por llamada, limitados por la cache de 4096 posiciones del modelo base.

Su relevancia es acotada y practica: permite ejecutar la mitad ASR de LFM2.5-Audio en un unico fichero GGUF autodescriptivo, con el grafo, el tokenizador y el script controlador embebidos, lo que simplifica el despliegue en el runtime de loom.cpp. No incluye la parte generativa de audio (texto a voz ni chat voz a voz) del modelo original, y solo soporta ingles. Con cero descargas y cero "likes" en el momento de la consulta, es un artefacto reciente y sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de audio FastConformer + modelo de lenguaje LFM2.5-1.2B hibrido conv/attention |
| Parametros totales | 1.290.617.777 (segun los safetensors del repositorio) |
| Parametros activos | No aplica (la informacion disponible no describe una arquitectura MoE) |
| Longitud de contexto | Cache de 4096 posiciones; el autor indica un maximo de 280 segundos de audio por llamada junto con la transcripcion |
| Tipos de cuantizacion | Formato GGUF; el esquema exacto de cuantizacion no se especifica. La etiqueta `base_model:quantized` indica que el export esta cuantizado |
| Idiomas soportados | Ingles (`en`) |
| Licencia | `other` — LFM Open License v1.0, heredada del modelo base |
| Formato de pesos | GGUF unico y autodescriptivo (incluye topologias de grafo, tokenizador y script controlador) |

## Arquitectura y entrenamiento

El modelo es un sistema multimodal de dos partes: un codificador acustico FastConformer que procesa audio mono en punto flotante a 16 kHz, y el modelo de lenguaje LFM2.5-1.2B, que segun la model card es de tipo hibrido entre convolucion y atencion. El export para loom.cpp conserva unicamente la ruta de reconocimiento de voz; la generacion de audio del modelo original no esta presente en este fichero.

No se dispone de informacion sobre el entrenamiento en los materiales consultados: no se indican numero de tokens, composicion del dataset, ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones de decodificacion propias de este export. Lo que si se especifica es el procedimiento de inferencia: decodificacion voraz (greedy) con el prompt de sistema fijo `Perform ASR.`, replicando paso a paso el comportamiento de `generate_sequential` de liquid-audio. El modelo no acepta un argumento `language=`: si se pasa, se ignora con un aviso, porque el proceso de decodificacion no puede actuar sobre el. Tampoco emite tokens de marca temporal, de modo que el resultado devuelve un unico segmento que cubre todo el audio y `result.timestamped` es `False`.

## Capacidades

- Reconocimiento automatico del habla en ingles a partir de audio mono a 16 kHz.
- Transcripcion de clips de hasta 280 segundos por llamada; los audios mas largos deben dividirse.
- Inferencia con decodificacion voraz y prompt de sistema fijo para ASR, reproducible paso a paso respecto a la implementacion de referencia.
- API de alto nivel `model.speech2text.infer(audio, timestamps=True)`, que aplica el ventaneo, el muestreo y el ensamblado necesarios para este modelo.
- Acceso al controlador embebido mediante `model.infer(...)` y `model.driver_source`, que documenta todos los argumentos aceptados.
- Formato autodescriptivo: un unico GGUF contiene grafo, tokenizador y driver, lo que reduce la configuracion externa.
- No soporta traduccion ni deteccion multilingue: trabaja en el unico idioma para el que fue entrenado.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso, ya que solo expone la ruta de transcripcion.
- No incluye texto a voz ni chat voz a voz; esas funciones requieren la mitad generativa de audio del modelo original.
- No genera marcas temporales por token ni por segmento.

## Casos de uso

- Transcripcion de reuniones y notas de voz en ingles: dividiendo el audio en fragmentos de hasta 280 segundos, el modelo genera el texto completo de cada tramo con decodificacion voraz, adecuado para actas automatizadas sin intervencion manual.
- Indexacion y busqueda de archivos de audio: al convertir grandes volumenes de grabaciones en texto, permite construir indices de busqueda por palabra clave sobre material que antes solo era audible.
- Preprocesado para pipelines RAG sobre audio: la transcripcion generada puede alimentar un sistema de recuperacion aumentada, de modo que las consultas de texto recuperen fragmentos de reuniones, entrevistas o clases.
- Analisis de llamadas de atencion al cliente en ingles: la transcripcion permite extraer palabras clave, motivos de contacto y patrones de queja, siempre que el audio se fragmente por debajo del limite de 280 segundos.
- Archivado y cumplimiento normativo: conversion sistematica de grabaciones en texto para conservar registros consultables, con la ventaja de que el fichero GGUF puede ejecutarse en infraestructura propia sin enviar audio a servicios externos.
- Despliegue en entornos con recursos limitados: al ser un unico fichero GGUF de un modelo de 1,29 mil millones de parametros, es viable en estaciones de trabajo con GPU de gama media o incluso en CPU mediante loom.cpp.
- Evaluacion comparativa de ASR: util como referencia para medir el comportamiento de la familia LFM2.5-Audio en tareas de transcripcion dentro de un mismo runtime.
- Subtitulado asistido: la transcripcion puede servir como base para generar subtitulos, teniendo en cuenta que el modelo no produce marcas temporales y que habria que alinearlas con otra herramienta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del export no incluye cifras de WER, MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, y la busqueda web realizada no devolvio documentacion tecnica asociada al modelo.

## Requisitos de hardware

Las cifras de VRAM que se indican a continuacion son estimaciones derivadas del recuento de parametros (1.290.617.777) y no han sido publicadas por el autor:

- Precision completa (fp16/bf16): alrededor de 2,6 GB solo en pesos; sumando el codificador FastConformer y la cache de 4096 posiciones, es razonable estimar entre 3,5 y 4 GB de VRAM.
- Cuantizacion de 8 bits: aproximadamente 1,3-1,5 GB de pesos.
- Cuantizacion de 4 bits: aproximadamente 0,8-1 GB de pesos. El tipo exacto incluido en el GGUF no se especifica.
- GPU consumer: cabe con holgura en tarjetas de 8 GB o mas, como una RTX 3060 de 12 GB, una RTX 4070 o una RTX 4090. En tarjetas de 6 GB o menos conviene usar cuantizacion agresiva.
- GPU de centro de datos: A100, H100 o L40S son compatibles, aunque sobredimensionadas para 1,29 mil millones de parametros salvo que se busque un throughput muy alto agregando lotes.
- CPU: viable mediante loom.cpp, con latencia notablemente mayor que en GPU.
- Opciones de despliegue: el runtime declarado y soportado es loom.cpp a traves de `loom-py-rt` (instalable con `pip install -U "loom-py-rt[hub]"`). La compatibilidad con vLLM, TGI, llama.cpp u Ollama no se ha confirmado en la informacion disponible.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo real ni de factor de tiempo real (RTF).

## Comparativa con modelos similares

La informacion proporcionada solo permite comparar este export con su modelo de origen. Los datos de otras familias que se incluyen a continuacion proceden de conocimiento publico general y no de la busqueda realizada, y se marcan como referencia no verificada en esta consulta:

| Modelo | Parametros | Contexto / ventana de audio | Idiomas | Licencia | Formato disponible |
|---|---|---|---|---|---|
| lfm2.5-audio-1.5b-asr-loom (este modelo) | 1.290.617.777 | Cache de 4096 posiciones; 280 s de audio por llamada | Ingles | LFM Open License v1.0 (`other`) | GGUF para loom.cpp |
| LiquidAI/LFM2.5-Audio-1.5B (modelo base) | No disponible en esta consulta | No disponible en esta consulta | No disponible en esta consulta | LFM Open License v1.0 | Pesos originales del autor |
| Whisper large-v3 (referencia externa, no verificada) | ~1,55 mil millones | Fragmentos de 30 s | Multilingue | MIT | Multiples, incluido GGUF |
| Distil-Whisper large-v3 (referencia externa, no verificada) | ~756 millones | Fragmentos de 30 s | Ingles | MIT | Multiples |

No se dispone de cifras de WER comparables para este export, por lo que la comparativa de rendimiento con alternativas de ASR no puede establecerse con datos.

## Limitaciones y advertencias

- Solo implementa la ruta de voz a texto. Las capacidades de texto a voz y de chat voz a voz del modelo original no estan incluidas en este fichero.
- No genera marcas temporales: `segments` devuelve un unico intervalo que cubre el clip completo y `result.timestamped` es `False`. No deben interpretarse los limites como fronteras decididas por el modelo.
- Limite de 280 segundos por llamada, impuesto por la cache de 4096 posiciones. Los audios mas largos deben fragmentarse antes de la inferencia.
- Unicamente ingles. Al no aceptar el argumento `language=`, no hay forma de forzar otro idioma de salida; el audio en otras lenguas puede producir texto en ingles o transcripciones incorrectas.
- Decodificacion voraz con prompt de sistema fijo `Perform ASR.`. Esto limita el ajuste del comportamiento mediante prompts y reduce la diversidad frente a estrategias de busqueda mas elaboradas.
- Riesgo de alucinacion inherente a los modelos de reconocimiento de voz: en tramos con ruido, silencio, solapamiento de voces o acentos poco representados, el modelo puede generar texto plausible pero no pronunciado.
- Sensibilidad a la calidad del audio: se asume entrada mono a 16 kHz, con lo que las grabaciones con ruido de fondo, reverberacion o canales mal mezclados degradan la transcripcion.
- Licencia `other` (LFM Open License v1.0). La informacion disponible no detalla los terminos exactos de uso comercial; es necesario consultar el fichero de licencia del modelo base antes de integrarlo en un producto.
- Artefacto de terceros: el export lo publica `loom-ai-org`, no Liquid AI. Aunque la model card afirma que los pesos no estan modificados, la responsabilidad de la conversion recae en el exportador.
- Compatibilidad de runtime restringida: esta empaquetado para loom.cpp y su formato GGUF autodescriptivo puede no ser directamente interpretado por otras herramientas que leen GGUF.
- Sin validacion de la comunidad: cero descargas y cero "likes" en el momento de la consulta.
- Fecha de creacion y ultima actualizacion muy proximas (2 de octubre de 2026), lo que sugiere un artefacto recien publicado y potencialmente inestable.
- No se publican mediciones de latencia, throughput ni WER, lo que impide estimar su idoneidad para produccion en tiempo real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/loom-ai-org/lfm2.5-audio-1.5b-asr-loom
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-Audio-1.5B
- Licencia del modelo base (LFM Open License v1.0): https://huggingface.co/LiquidAI/LFM2.5-Audio-1.5B/blob/main/LICENSE
- Repositorio del runtime loom.cpp: https://github.com/loom-ai-org/loom.cpp
- Repositorio del exportador loom-exporter: https://github.com/loom-ai-org/loom-exporter
- Repositorio de la libreria loom-py: https://github.com/loom-ai-org/loom-py

Nota: la busqueda web realizada no devolvio ningun resultado relacionado con este modelo. Los resultados obtenidos correspondian a la herramienta de grabacion de pantalla Loom, a su pagina de inicio de sesion y a una marca de ropa del mismo nombre, por lo que no se han utilizado como fuente.
