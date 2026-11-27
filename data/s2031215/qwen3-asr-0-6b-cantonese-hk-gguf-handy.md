# s2031215/Qwen3-ASR-0.6B-Cantonese-HK-GGUF-handy

## Resumen

Qwen3-ASR 0.6B Cantonese-HK es un modelo de reconocimiento automatico del habla (ASR) derivado de la familia Qwen3-ASR, afinado especificamente para cantonés de Hong Kong. El modelo base fue desarrollado por el autor joe2643 y esta construido sobre la arquitectura Qwen3-ASR de aproximadamente 782 millones de parametros, con soporte para tres idiomas: cantonés (yue), chino mandarin (zh) e ingles (en). Su proposito es transcribir audio a texto con especial atencion al cantonés, un idioma con escasa representacion en los sistemas ASR generalistas.

La version aqui descrita es una conversion a formato GGUF realizada por el usuario s2031215, empaquetada especificamente para Handy, una aplicacion de dictado que ejecuta la inferencia a traves de transcribe.cpp. La particularidad tecnica de esta conversion es que fusiona el codificador de audio dentro del mismo fichero GGUF, eliminando la necesidad de un fichero `.mmproj` separado que los exports estandar de llama.cpp requieren y que Handy no puede cargar.

El modelo es relevante porque ofrece una solucion ligera (menos de 800 millones de parametros) y desplegable en local para transcripcion de cantonés, un caso de uso poco cubierto por los modelos ASR comerciales. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-ASR (transformer con codificador de audio fusionado en el GGUF) |
| Parametros totales | 782.452.240 (segun safetensors del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q4_K_M |
| Idiomas soportados | yue (cantonés), zh (mandarin), en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (single-file, arquitectura `qwen3_asr`, 613 tensores) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3-ASR, un sistema de reconocimiento automatico del habla que combina un codificador de audio con un decodificador de lenguaje basado en la familia Qwen3. En esta conversion GGUF, el codificador de audio se ha fusionado dentro del mismo fichero que el decodificador, de modo que la cabecera declara `general.architecture = "qwen3_asr"` y `stt.variant = "qwen3-asr-0.6b-cantonese-hk"`. El modelo base fue afinado por joe2643 a partir de los pesos BF16 de Qwen3-ASR 0.6B para especializarlo en cantonés de Hong Kong.

La conversion la realizo s2031215 el 17 de noviembre de 2026 usando transcribe.cpp v0.4.2, concretamente el script `convert-qwen3_asr.py` y la herramienta `transcribe-quantize`. Fue necesario un parche local en el conversor, ya que su mapa de nombres solo reconocia las dos variantes estandar y hubo que anadir `qwen3-asr-0.6b-cantonese-hk`. No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el afinado.

## Capacidades

- Transcripcion de audio a texto en cantonés, mandarin e ingles.
- Deteccion automatica de idioma (`stt.capability.lang_detect = true` segun la cabecera del GGUF).
- Procesamiento de audio integrado en un unico fichero GGUF, sin necesidad de fichero `.mmproj` externo.
- Compatibilidad con el motor transcribe.cpp y, por extension, con la aplicacion Handy.
- Funcionamiento local sin dependencia de servicios en la nube.
- No se ha documentado soporte de tool calling, agentes, vision ni audio bidireccional; el modelo es exclusivamente ASR.

## Casos de uso

- Dictado por voz en cantonés: integrado en Handy, el modelo permite dictar texto en aplicaciones de escritorio en macOS, Windows y Linux, con transcripcion local y sin enviar audio a servidores externos.
- Subtitulado de contenido audiovisual en cantonés: transcripcion de videos, podcasts o reuniones en las que los participantes hablan en cantonés de Hong Kong, aprovechando el afinado especifico para ese dialecto.
- Atencion al cliente en Hong Kong: transcripcion de llamadas o mensajes de voz de clientes que hablan cantonés, para su posterior analisis o registro en sistemas CRM.
- Documentacion clinica o legal dictada: conversion de notas de voz en cantonés a texto para profesionales que trabajan en entornos donde este idioma es predominante.
- Investigacion linguistica: generacion de corpus transcritos de cantonés para estudios de linguistica computacional o entrenamiento de otros modelos.
- Accesibilidad: transcripcion en tiempo real de conversaciones para personas con dificultades auditivas en entornos cantonoparlantes.
- Procesamiento por lotes de archivos de audio: uso mediante transcribe-cli para transcribir grandes volumenes de grabaciones en los tres idiomas soportados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye tres transcripciones de verificacion con transcribe-cli 0.4.2:

| Idioma | Transcripcion verificada |
|---|---|
| Cantonés | 呢幾個字都表達唔到我想講嘅意思 |
| Mandarin | 開放時間早上九點至下午五點 |
| Ingles | And so my fellow Americans, ask not what your country can do for you, ask what you can do for your country. |

El autor indica que las tres cuantizaciones (Q8_0, Q6_K, Q4_K_M) produjeron transcripciones identicas en los clips de prueba.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todas las cuantizaciones (Q8_0: 812 MB, Q6_K: 659 MB, Q4_K_M: 563 MB en disco).
- Cabe holgadamente en cualquier GPU de consumo, e incluso en CPU, dado el reducido tamano del modelo.
- GPU recomendadas: no se especifican; cualquier GPU con al menos 1-2 GB de memoria libre es suficiente. Tambien es viable la inferencia en CPU.
- Opciones de despliegue: transcribe.cpp (motor de Handy) y transcribe-cli 0.4.2. No se ha documentado compatibilidad con llama.cpp estandar, vLLM, Ollama ni TGI para esta conversion concreta.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Qwen3-ASR 0.6B Cantonese-HK (este) | 782 M | yue, zh, en | GGUF single-file | Apache 2.0 | ASR especializado en cantonés, para Handy |
| joe2643/Qwen3-ASR-0.6B-Cantonese-HK | 782 M | yue, zh, en | BF16 Transformers | Apache 2.0 | Modelo base original |
| Exports llama.cpp del mismo fine-tune | 782 M | yue, zh, en | GGUF + mmproj | Apache 2.0 | Requiere fichero `.mmproj` separado, incompatible con Handy |

La diferencia principal frente a los exports estandar de llama.cpp es el empaquetado en un unico fichero con arquitectura `qwen3_asr`, que permite su carga en Handy. No se dispone de datos de benchmarks que permitan comparar la precision frente a otros modelos ASR.

## Limitaciones y advertencias

- El modelo esta especializado en cantonés de Hong Kong; su rendimiento en otras variantes dialectales del cantonés o en otros idiomas no esta documentado.
- No se han publicado evaluaciones de sesgo ni de tasas de error (WER) en conjuntos de prueba estandar.
- Riesgo de alucinacion en audio con ruido, acentos no representados o habla solapada; no hay datos que cuantifiquen este riesgo.
- La conversion esta pensada exclusivamente para Handy y transcribe.cpp; no se garantiza su funcionamiento en otros motores de inferencia.
- El autor del modelo base figura de forma inconsistente en los metadatos: la ficha de Hugging Face indica `koelony/Qwen3-ASR-0.6B-Cantonese-HK` mientras que la model card cita `joe2643/Qwen3-ASR-0.6B-Cantonese-HK`; conviene verificar el origen exacto de los pesos.
- La licencia Apache 2.0 permite uso comercial, pero al tratarse de una conversion de un fine-tune de terceros, es recomendable revisar las condiciones del modelo base original.
- Solo 209 descargas y 0 likes en el momento de la consulta; se trata de un artefacto reciente y poco validado por la comunidad.
- No hay informacion sobre la longitud maxima de audio que el modelo puede procesar en una sola pasada.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/s2031215/Qwen3-ASR-0.6B-Cantonese-HK-GGUF-handy
- Modelo base citado en la model card: https://huggingface.co/joe2643/Qwen3-ASR-0.6B-Cantonese-HK
- Modelo base citado en los metadatos de Hugging Face: https://huggingface.co/koelony/Qwen3-ASR-0.6B-Cantonese-HK
- Export GGUF via llama.cpp (joe2643): https://huggingface.co/joe2643/Qwen3-ASR-0.6B-Cantonese-HK-GGUF
- Export GGUF via llama.cpp (mradermacher): https://huggingface.co/mradermacher/Qwen3-ASR-0.6B-Cantonese-HK-GGUF
- Repositorio de Handy: https://github.com/cjpais/handy
