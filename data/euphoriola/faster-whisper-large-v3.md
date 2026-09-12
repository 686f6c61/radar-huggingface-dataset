# euphoriola/faster-whisper-large-v3

## Resumen

`euphoriola/faster-whisper-large-v3` es una reconversion del modelo de reconocimiento automatico del habla `openai/whisper-large-v3` al formato de pesos de CTranslate2, publicada en HuggingFace por el usuario euphoriola. No se trata de un modelo entrenado desde cero, sino de un artefacto derivado que empaqueta los pesos originales de Whisper large-v3 en FP16 para que puedan consumirse con CTranslate2 y con librerias construidas encima, principalmente `faster-whisper`. El problema que resuelve es de eficiencia: la implementacion original en PyTorch de Whisper large-v3 es notablemente mas lenta y con mayor consumo de memoria que la ruta de inferencia optimizada de CTranslate2.

La relevancia de este tipo de conversion es practica. Whisper large-v3 es uno de los modelos ASR multilingues de referencia, con soporte declarado para alrededor de 99 idiomas, y esta adaptacion permite desplegarlo en CPU y GPU con cuantizacion configurable en tiempo de carga (`float16`, `int8`, `int8_float16`, `float32`), lo que abarata el coste por hora de audio transcrito. El repositorio ocupa 3,1 GB, coherente con un modelo de aproximadamente 1550 millones de parametros almacenado en media precision.

La ficha del autor es minima: unicamente documenta el comando de conversion y un ejemplo de uso. No incluye datos de entrenamiento, benchmarks ni evaluaciones propias. La licencia declarada es MIT, la misma que la del modelo original de OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (arquitectura Whisper, con preprocesado mel-espectrograma) |
| Parametros totales | Aproximadamente 1550 millones (heredado de `openai/whisper-large-v3`; no declarado explicitamente en la ficha, estimado a partir del tamano de pesos en FP16) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como contexto de texto generativo. El audio se procesa en ventanas de 30 segundos; el decoder de Whisper large-v3 opera sobre secuencias de texto de hasta 448 posiciones (dato heredado del modelo original, no declarado en esta ficha) |
| Tipos de cuantizacion | Pesos almacenados en FP16 (`float16`) en este repositorio. CTranslate2 permite recuantizar en carga a `int8`, `int8_float16`, `int16`, `float32` y `bfloat16` |
| Idiomas soportados | Alrededor de 99 idiomas declarados en la model card: en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su, yue |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (directorio con ficheros binarios del formato CT2, no safetensors ni GGUF). Incluye `tokenizer.json` y `preprocessor_config.json` copiados del modelo original |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-decoder con preprocesado de audio a mel-espectrograma, la arquitectura estandar de la familia Whisper. El encoder consume la representacion mel de la ventana de audio (30 segundos) y el decoder genera tokens de texto de forma autorregresiva, con tokens especiales para marcas de tiempo, deteccion de idioma, traduccion y tarea de transcripcion. Whisper large-v3 es la tercera revision de la variante `large`; entre los cambios respecto a `large-v2` destaca el uso de 128 bins mel en lugar de 80, lo que exige que la capa de preprocesado acompanie al modelo (de ahi que el comando de conversion copie `preprocessor_config.json`).

Este repositorio no documenta ningun entrenamiento propio. La unica informacion tecnica aportada es el proceso de conversion, realizado con la herramienta `ct2-transformers-converter` del proyecto CTranslate2 sobre `openai/whisper-large-v3`, con la opcion `--quantization float16`. Los detalles de entrenamiento del modelo base (composicion del dataset, numero de horas de audio, uso de tecnicas de alineacion o ajuste) no estan recogidos en esta ficha; deben consultarse en la model card de `openai/whisper-large-v3`, a la que el autor remite explicitamente. No hay innovaciones tecnicas adicionales introducidas por esta conversion mas alla de la propia optimizacion de inferencia que aporta el runtime de CTranslate2 (fusion de operadores, kernels optimizados y soporte de cuantizacion en carga).

## Capacidades

- Reconocimiento automatico del habla (ASR) en alrededor de 99 idiomas, con deteccion automatica del idioma de entrada.
- Transcripcion con marcas de tiempo a nivel de segmento; `faster-whisper` anade marcas de tiempo por palabra cuando se solicita.
- Traduccion de audio a texto en ingles desde cualquiera de los idiomas soportados (tarea `translate` de Whisper).
- Procesamiento de audio en ventanas de 30 segundos, con gestion interna de fragmentos mas largos mediante `faster-whisper`.
- Decodificacion con `beam_size`, `temperature` y fallback por temperatura configurables, segun la API de faster-whisper.
- Integracion como componente de pipelines de voz completos (deteccion de actividad de voz, diarizacion, resumen posterior) mediante librerias externas.
- No dispone de tool calling, function calling ni capacidad de agente: es un modelo puramente acustico-a-texto.
- No es un modelo de chat ni de razonamiento; no genera texto libre mas alla de la transcripcion.
- No incorpora vision, audio generativo ni ninguna otra modalidad de salida.

## Casos de uso

- Transcripcion de reuniones y llamadas: el modelo procesa audio en ventanas de 30 segundos y faster-whisper encadena los fragmentos manteniendo coherencia entre ellos, lo que permite transcribir conversaciones de una hora o mas con marcas de tiempo utiles para generar actas.
- Subtitulado automatico de video: la salida con segmentos delimitados temporalmente y el soporte de 99 idiomas permiten generar ficheros de subtitulos para contenido multilingue, con la opcion de traducir directamente a ingles desde el idioma original.
- Indexacion y busqueda de archivos de audio: transcripcion masiva de un archivo historico de podcasts, entrevistas o grabaciones corporativas para despues indexar el texto en un motor de busqueda o en un sistema RAG.
- Atencion al cliente a partir de grabaciones: conversion de llamadas de soporte a texto para su analisis posterior (deteccion de motivos de contacto, control de calidad, cumplimiento normativo), ejecutandose en CPU con cuantizacion `int8` si no hay GPU disponible.
- Accesibilidad en tiempo real en aplicaciones de escritorio: con cuantizacion `int8_float16` en una GPU de gama media, el modelo puede alimentar subtitulos en vivo para personas con discapacidad auditiva.
- Generacion de notas clinicas dictadas: transcripcion de dictado medico en entornos sin conectividad, desplegando el modelo en local gracias a su licencia MIT y a la ausencia de dependencia de APIs externas.
- Preprocesado de datasets de voz para investigacion: conversion de corpus de audio a transcripciones etiquetadas por idioma, aprovechando la deteccion automatica de idioma para clasificar material no etiquetado.
- Analisis de contenido en redes sociales y medios: transcripcion de clips cortos en multiples idiomas como paso previo a moderacion o analisis de sentimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye ninguna tabla de evaluacion, ni tasas de error por palabra (WER), ni comparaciones con otros modelos. Tampoco los resultados de busqueda web aportados contienen datos de evaluacion: los enlaces recuperados corresponden a portales de acceso sin relacion con el modelo.

## Requisitos de hardware

- VRAM estimada en FP16 (configuracion de este repositorio): en torno a 4-6 GB, considerando 3,1 GB de pesos mas activaciones y cache durante la decodificacion.
- VRAM estimada en `float32`: en torno a 7-8 GB.
- VRAM estimada en `int8` o `int8_float16`: en torno a 2-3 GB.
- GPU recomendadas: NVIDIA A100, H100 o L40S para despliegues con alta concurrencia; RTX 4090, RTX 3090 o RTX 4080 para uso intensivo individual; RTX 3060 (12 GB), RTX 4060 Ti o RTX 4070 para uso de un solo flujo.
- Cabe en GPU de consumo: si. En FP16 cabe con holgura en cualquier GPU de 8 GB o mas; en `int8` puede ejecutarse incluso en GPUs con 4 GB de VRAM.
- Tambien funciona en CPU: CTranslate2 esta optimizado para inferencia en CPU, y la cuantizacion `int8` es la recomendada en ese escenario.
- Opciones de despliegue: `faster-whisper` (uso directo en Python), CTranslate2 como runtime, WhisperX para pipelines con diarizacion, servidores compatibles con la API de OpenAI como Speaches, y contenedores de Home Assistant (wyoming-faster-whisper) para asistentes de voz locales.
- Latencia y throughput: no disponibles. No se han publicado mediciones de velocidad ni de factor de tiempo real (RTF) en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| euphoriola/faster-whisper-large-v3 (este) | Aprox. 1550 M | Ventanas de 30 s | ~99 | MIT | Conversion comunitaria en HuggingFace, 0 descargas y 0 likes en el momento del analisis |
| openai/whisper-large-v3 | Aprox. 1550 M | Ventanas de 30 s | ~99 | MIT | Modelo oficial en HuggingFace; requiere PyTorch o Transformers para inferencia |
| openai/whisper-large-v3-turbo | Aprox. 809 M | Ventanas de 30 s | ~99 | MIT | Modelo oficial; mas rapido pero con menor precision que large-v3 segun la documentacion de OpenAI |
| distil-whisper variantes (por ejemplo distil-large-v3) | Aprox. 756 M | Ventanas de 30 s | Principalmente ingles | MIT | Modelos oficiales de HuggingFace; optimizados para ingles, con cobertura multilingue limitada |

Los datos de parametros de los modelos alternativos provienen de sus respectivas model cards publicas y no de la informacion aportada en esta busqueda; se incluyen como referencia orientativa. No se dispone de comparaciones de WER ni de velocidad entre estas opciones en la documentacion analizada.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes, y no procede de un canal oficial de OpenAI ni de SYSTRAN. Es una conversion de terceros: conviene verificar la integridad de los pesos antes de usarla en produccion.
- La model card no documenta la fecha de conversion ni el hash del modelo original, por lo que no es posible auditar la trazabilidad de los pesos mas alla del comando indicado.
- Whisper es propenso a alucinaciones en segmentos con silencio, ruido de fondo o musica, generando texto plausible que no corresponde al audio. Es un riesgo conocido y documentado del modelo base.
- No realiza diarizacion de hablantes: no distingue quien habla en una conversacion multiple.
- No realiza deteccion de eventos acusticos ni clasificacion de emociones, y no acepta la mayoria de idiomas en modo traduccion: la tarea de traduccion del modelo solo produce salida en ingles.
- El rendimiento en idiomas con pocos recursos (por ejemplo ga, mi, haw, ln, ba) es previsiblemente inferior al de los idiomas mayoritarios, aunque no hay evaluaciones publicadas en esta ficha que lo cuantifiquen.
- El procesamiento por ventanas de 30 segundos puede degradar la coherencia en audios con cambios de idioma dentro de un mismo segmento.
- La licencia MIT del repositorio permite uso comercial sin restricciones adicionales, en linea con la licencia del modelo original de OpenAI. Aun asi, el usuario debe comprobar las condiciones de la libreria CTranslate2 y de faster-whisper, ambas con licencias permisivas pero independientes.
- Los pesos estan almacenados en FP16, lo que implica que en cargas en `float32` se produce una conversion al vuelo y un consumo de memoria notablemente superior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/euphoriola/faster-whisper-large-v3
- Modelo original: https://huggingface.co/openai/whisper-large-v3
- Repositorio de CTranslate2: https://github.com/OpenNMT/CTranslate2
- Documentacion de cuantizacion de CTranslate2: https://opennmt.net/CTranslate2/quantization.html
- Repositorio de faster-whisper: https://github.com/systran/faster-whisper

Nota: los resultados de busqueda web proporcionados no contenian ningun enlace relevante sobre el modelo; todos correspondian a portales de inicio de sesion sin relacion con el ambito de la IA.
