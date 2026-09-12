# chuaiyunxiang/whisper-large-v3

## Resumen

Whisper large-v3 es un modelo de reconocimiento automatico del habla (ASR) y traduccion de voz basado en la arquitectura encoder-decoder Transformer publicada por OpenAI en el articulo "Robust Speech Recognition via Large-Scale Weak Supervision" (Radford et al., 2022). Esta ficha concreta corresponde al repositorio `chuaiyunxiang/whisper-large-v3`, un espejo comunitario de los pesos oficiales de `openai/whisper-large-v3`: 1.543.490.560 parametros totales (aproximadamente 1,54 mil millones) y 24,7 GB de tamano de repositorio, con pesos en safetensors, PyTorch y JAX.

La relevancia de large-v3 frente a large-v2 es doble y esta documentada en la propia model card: el espectrograma de entrada pasa de 80 a 128 bins de frecuencia Mel y se anade un token de idioma nuevo para el cantonés. Segun el autor, esto se traduce en una reduccion del 10 % al 20 % de la tasa de error en una amplia variedad de idiomas respecto a large-v2. El modelo se entreno sobre 1 millon de horas de audio debilmente etiquetado mas 4 millones de horas de audio pseudo-etiquetado generado con large-v2, durante 2,0 epocas.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y fue creado el 12 de septiembre de 2026, por lo que debe tratarse como una copia no validada de los pesos oficiales: conviene verificar los hashes frente al repositorio de OpenAI antes de usarlo en produccion. La licencia declarada es Apache-2.0, aunque el modelo original de OpenAI se publica bajo licencia MIT, una discrepancia que hay que resolver en un contexto comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) para voz; entrada de espectrograma Mel con 128 bins |
| Parametros totales | 1.543.490.560 (aproximadamente 1,54 B), dato real de safetensors |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | No hay una "longitud de contexto" en tokens de texto al uso: el encoder procesa ventanas de audio de 30 segundos (1500 frames de espectrograma); el decoder se limita a 448 tokens nuevos por ventana (`max_new_tokens: 448` en el ejemplo de la model card). La transcripcion de audio largo se realiza por chunking |
| Tipos de cuantizacion | no disponible en la model card; los ejemplos solo documentan `float16` y `float32`. El ecosistema de inferencia admite ademas int8 y GGUF, pero no se detallan en este repositorio |
| Idiomas soportados | 99 idiomas declarados en los metadatos: en, zh, de, es, ru, ko, fr, ja, pt, tr, pl, ca, nl, ar, sv, it, id, hi, fi, vi, he, uk, el, ms, cs, ro, da, hu, ta, no, th, ur, hr, bg, lt, la, mi, ml, cy, sk, te, fa, lv, bn, sr, az, sl, kn, et, mk, br, eu, is, hy, ne, mn, bs, kk, sq, sw, gl, mr, pa, si, km, sn, yo, so, af, oc, ka, be, tg, sd, gu, am, yi, lo, uz, fo, ht, ps, tk, nn, mt, sa, lb, my, bo, tl, mg, as, tt, haw, ln, ha, ba, jw, su (lista completa en la model card) |
| Licencia | Apache-2.0 (declarada en el repositorio; el modelo original de OpenAI se distribuye bajo MIT) |
| Formato de pesos | safetensors, PyTorch y JAX (segun los tags del repositorio) |

## Arquitectura y entrenamiento

Whisper large-v3 mantiene la misma arquitectura que `whisper-large` y `whisper-large-v2`, con dos diferencias menores declaradas por el autor: el espectrograma de entrada usa 128 bins de frecuencia Mel en lugar de 80, y se incorpora un token de idioma especifico para el cantonés. Se trata de un Transformer encoder-decoder entrenado de forma supervisada sobre pares audio-texto, sin RLHF ni DPO: es un modelo discriminativo/generativo de secuencias de texto condicionado por audio, no un modelo de lenguaje conversacional ajustado por preferencias.

El entrenamiento combino 1 millon de horas de audio debilmente etiquetado con 4 millones de horas de audio pseudo-etiquetado generado por Whisper large-v2, durante 2,0 epocas sobre esa mezcla. Esta estrategia de supervision debil a gran escala es la que permite la generalizacion zero-shot a dominios y datasets no vistos, incluida la robustez frente a ruido y acentos. La model card no detalla la composicion exacta del dataset, la distribucion por idioma ni el hardware de entrenamiento.

A nivel de decodificacion, el modelo soporta heuristicas propias de Whisper que son relevantes en produccion: temperature fallback con una escalera de temperaturas `(0.0, 0.2, 0.4, 0.6, 0.8, 1.0)`, `compression_ratio_threshold` de 1.35 en espacio de tokens, `logprob_threshold` de -1.0, `no_speech_threshold` de 0.6 y condicionamiento sobre tokens previos (`condition_on_prev_tokens`). Tambien permite devolver timestamps a nivel de frase o de palabra.

## Capacidades

- Transcripcion de voz a texto multilingue en 99 idiomas, con deteccion automatica del idioma de origen o fijado manual mediante el argumento `language`.
- Traduccion de voz a texto en ingles (`task: "translate"`): cualquier idioma de entrada se puede traducir a texto en ingles. No traduce a otros idiomas distintos del ingles.
- Prediccion de timestamps a nivel de frase (`return_timestamps=True`) y a nivel de palabra (`return_timestamps="word"`), util para subtitulado.
- Transcripcion de audio de longitud arbitraria mediante chunking en el pipeline de `transformers`.
- Procesamiento por lotes de multiples ficheros de audio (`batch_size` en el pipeline).
- Decodificacion robusta con temperature fallback, umbral de compresion y deteccion de ausencia de voz, orientada a reducir alucinaciones en silencios.
- Identificacion del idioma de la fuente como salida intermedia del modelo.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio de salida ni modo "thinking". Es un modelo exclusivamente de entrada de audio y salida de texto.

## Casos de uso

- Subtitulado automatico de video: el modelo genera timestamps a nivel de palabra, lo que permite construir ficheros SRT/VTT sincronizados sin un alineador externo. Es adecuado porque la marca temporal por palabra viene soportada de forma nativa en la API del pipeline.
- Archivado y busqueda de contenido audiovisual: transcripcion masiva de podcasts, webinars y grabaciones corporativas para despues indexar el texto en un motor de busqueda. La ventana de 30 segundos por chunk permite paralelizar la transcripcion de horas de audio por lotes.
- Analisis de llamadas de atencion al cliente: conversion a texto de conversaciones telefonicas multilingues para alimentar analitica de sentimiento, deteccion de motivos de contacto o control de calidad. El soporte de 99 idiomas evita desplegar un modelo distinto por region.
- Generacion de subtitulos y doblaje previo en ingles: con `task: "translate"` se obtiene la traduccion directa al ingles del audio original, lo que sirve como paso previo a la traduccion a otros idiomas mediante un modelo de traduccion de texto.
- Accesibilidad en tiempo real: transcripcion de streaming por ventanas de 30 segundos con `faster-whisper` o `whisper.cpp` para generar subtitulos en directo en eventos o aulas. Requiere gestionar la latencia del chunking y los solapamientos.
- Creacion de datasets ASR: pseudo-etiquetado de grandes volumenes de audio propio para entrenar o ajustar modelos mas pequenos y especificos de dominio, aprovechando la calidad zero-shot del modelo.
- Cumplimiento normativo y auditoria: transcripcion de grabaciones de reuniones o llamadas para su revision y trazabilidad documental, con timestamps que permiten localizar la frase exacta en el audio original.
- Investigacion linguistica y de acentos: evaluacion comparativa de la tasa de error entre idiomas y variedades dialectales, ya que el modelo cubre idiomas de altos y bajos recursos en un unico checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks detallados en la informacion disponible de este repositorio. El unico dato cuantitativo aportado por la model card es la comparacion relativa con large-v2:

| Comparacion | Resultado declarado |
|---|---|
| Reduccion de errores frente a Whisper large-v2 | 10 % a 20 % en una amplia variedad de idiomas |
| Datos de entrenamiento | 1 M de horas debilmente etiquetadas + 4 M de horas pseudo-etiquetadas |
| Epocas sobre la mezcla | 2,0 |

No hay tabla de WER por idioma ni cifras de MMLU, HumanEval o GSM8K en la informacion disponible (estos benchmarks no aplican a un modelo ASR). El repositorio esta etiquetado con `hf-asr-leaderboard`, lo que indica que puede ser evaluado en la clasificacion publica de Hugging Face, pero no se aportan resultados.

## Requisitos de hardware

- Peso en disco: el repositorio ocupa 24,7 GB, un tamano muy superior al de los pesos de un modelo de 1,54 B de parametros en un unico formato, lo que sugiere la coexistencia de varios formatos (PyTorch, safetensors, JAX). Conviene descargar solo los ficheros necesarios.
- VRAM estimada en `float32`: aproximadamente 6,2 GB solo de pesos, mas activaciones y cache; en la practica, entre 8 y 12 GB segun el tamano de lote.
- VRAM estimada en `float16`/`bfloat16` (formato recomendado en la model card): aproximadamente 3,1 GB de pesos; con overhead de inferencia, del orden de 5 a 8 GB.
- VRAM estimada con cuantizacion int8: del orden de 2 a 4 GB, segun la implementacion.
- GPU consumer: cabe en tarjetas con 8 GB o mas de VRAM en fp16, como la RTX 3060 de 12 GB, RTX 3070/4060 Ti, RTX 4070 y superiores. Con cuantizacion puede ejecutarse incluso en GPUs de 6 GB.
- GPU de datacenter: A100, H100, L40S o A10G, recomendables para procesamiento por lotes de grandes volumenes de audio o para servir multiples peticiones concurrentes.
- Opciones de despliegue: `transformers` con `AutoModelForSpeechSeq2Seq` y el pipeline `automatic-speech-recognition` (documentado en la propia model card); `faster-whisper` sobre CTranslate2; `whisper.cpp` con pesos GGUF para CPU y edge; WhisperX para diarizacion y alineacion; servidores de inferencia compatibles con ASR como vLLM o TGI, previa verificacion de soporte para este pipeline.
- Latencia y throughput: no disponibles en la informacion proporcionada. Dependen del backend, del lote y del uso de fp16 frente a int8; el chunking en ventanas de 30 segundos impone una cota inferior de latencia en escenarios de streaming.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada Mel | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `chuaiyunxiang/whisper-large-v3` (este repositorio) | 1,54 B | 128 bins | 99 | Apache-2.0 (declarada) | 0 descargas, 0 likes; espejo comunitario |
| `openai/whisper-large-v3` | 1,55 B | 128 bins | 99 | MIT (repositorio oficial de OpenAI) | Repositorio de referencia, ampliamente usado |
| `openai/whisper-large-v2` | 1,55 B | 80 bins | 99 (sin token de cantonés) | MIT | Referencia de la generacion anterior; 10-20 % mas de error segun este autor |
| `distil-whisper/distil-large-v3` | aproximadamente 0,76 B | 128 bins | enfoque principal en ingles | MIT | Modelo destilado, mas rapido y con menor VRAM, a costa de menor cobertura multilingue |

Los datos de licencias y tamanos de los modelos comparados proceden de sus repositorios publicos y deben verificarse antes de cualquier uso comercial. No se dispone de cifras de WER comparativas en la informacion proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinacion: como todos los modelos Whisper, puede generar texto plausible en fragmentos de silencio, musica o ruido intenso. Los umbrales `no_speech_threshold` y `compression_ratio_threshold` mitigan parcialmente el problema, pero no lo eliminan.
- Sesgo de idioma: el rendimiento es muy desigual. Los idiomas con muchos datos de entrenamiento (ingles, espanol, frances, aleman) tienen tasas de error mucho menores que los idiomas de bajos recursos incluidos en la lista (por ejemplo, haw, mi, ln, fo, yi, bo). La lista de 99 idiomas no implica calidad homogenea.
- Traduccion limitada al ingles: la tarea `translate` solo produce texto en ingles. Cualquier otro idioma de destino requiere un segundo modelo de traduccion de texto.
- Limitacion de contexto: no hay contexto largo en el sentido de los LLM. Cada ventana es de 30 segundos y el decoder genera hasta 448 tokens por ventana; el audio largo se procesa por trozos, lo que puede degradar la coherencia en fronteras de chunk.
- Repositorio no validado: 0 descargas, 0 likes y creacion con fecha inusual (12 de septiembre de 2026). No hay garantia de que los pesos sean identicos a los oficiales; se recomienda verificar hashes y usar `openai/whisper-large-v3` como fuente de referencia.
- Licencia ambigua para uso comercial: el repositorio declara Apache-2.0 mientras que el modelo original de OpenAI se distribuye bajo MIT. Hay que aclarar cual aplica antes de un despliegue comercial, especialmente en el caso de pesos derivados.
- Tamano del repositorio: 24,7 GB, muy superior al peso real del modelo en un solo formato. Puede implicar costes de almacenamiento y ancho de banda evitables.
- Sin benchmarks propios: no hay evaluacion publicada por el autor de este repositorio, ni cifras de WER por idioma, latencia o throughput.
- Limitaciones de hardware en produccion: el rendimiento en tiempo real exige GPU o cuantizacion; en CPU pura, la transcripcion de grandes volumenes puede ser inviable.
- Sin soporte de agentes, tool calling ni multimodalidad de salida: no se puede usar como componente de un sistema agentico mas alla de la transcripcion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/chuaiyunxiang/whisper-large-v3
- Repositorio oficial de referencia: https://huggingface.co/openai/whisper-large-v3
- Articulo original: https://arxiv.org/abs/2212.04356 (tambien referenciado como https://huggingface.co/papers/2212.04356)
- Repositorio de codigo de OpenAI: https://github.com/openai/whisper
- Modelo destilado comparable: https://huggingface.co/distil-whisper/distil-large-v3
- Modelo de la generacion anterior: https://huggingface.co/openai/whisper-large-v2
- Nota sobre la busqueda web: las consultas realizadas no devolvieron resultados tecnicos relevantes sobre el modelo; unicamente enlaces genericos a plataformas de video sin relacion con este repositorio, por lo que no se incluyen.
