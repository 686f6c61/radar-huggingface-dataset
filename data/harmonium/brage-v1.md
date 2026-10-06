# Harmonium/brage-v1

## Resumen

Brage-v1 es un modelo de reconocimiento automatico del habla (ASR) desarrollado por Harmonium, especializado en danes (da). Se trata de un ajuste fino (finetune) del conocido Whisper large-v3 de OpenAI, orientado especificamente al reconocimiento de voz en danes en escenarios tanto de lectura en voz alta como de conversacion espontanea. El modelo resuelve el problema de la transcripcion de audio en danes con una calidad mas alta que la del modelo base generico, que no esta optimizado para este idioma.

Con 1.543.490.560 parametros (aproximadamente 1,54 mil millones), brage-v1 mantiene la arquitectura transformer encoder-decoder caracteristica de la familia Whisper, con una ventana de procesamiento de audio de 30 segundos por fragmento. El modelo esta publicado en HuggingFace bajo la libreria transformers y en formato safetensors, con un tamano de repositorio de 3,3 GB.

Su relevancia radica en que ofrece una alternativa afinada y especifica para el danes, un idioma con menos recursos que el ingles dentro del ecosistema ASR. El acceso al modelo esta restringido (gated) y requiere aceptar las condiciones de uso en HuggingFace. La licencia es una licencia propia denominada brage-v1-license.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), con encoder convolucional + transformer y decoder autorregresivo |
| Parametros totales | 1.543.490.560 (aproximadamente 1,54 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventana de audio de 30 segundos por inferencia (arquitectura Whisper); decodificador de texto con capacidad de hasta 448 tokens |
| Tipos de cuantizacion | No disponible (no se declaran cuantizaciones oficiales; al ser safetensors/transformers es convertible a int8, int4 o GGUF mediante herramientas estandar) |
| Idiomas soportados | Danes (da) |
| Licencia | brage-v1-license (licencia propia, categoria "other") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Brage-v1 es un ajuste fino de openai/whisper-large-v3. La arquitectura subyacente es la de Whisper: un encoder que procesa espectrogramas mel (128 bandas mel en large-v3) y un decoder transformer autorregresivo que genera la transcripcion token a token. El modelo procesa el audio en ventanas de 30 segundos, lo que condiciona tanto el uso como las estrategias de despliegue.

El entrenamiento se ha realizado sobre varios corpus en danes, segun los datasets declarados en la model card: CoRal-project/coral-v3, alexandra inst/ftspeech, alexandra inst/nst-da, google/fleurs y mozilla-foundation/common_voice_17_0. No se especifica en la informacion disponible el numero exacto de tokens de audio, la composicion precisa del dataset, ni si se emplearon tecnicas de RLHF o DPO. Tampoco se detallan innovaciones tecnicas adicionales mas alla del propio ajuste fino sobre el modelo base.

## Capacidades

- Transcripcion de voz a texto en danes, tanto en habla leida (read-aloud) como en conversacion espontanea.
- Reconocimiento automatico del habla (pipeline automatic-speech-recognition).
- Procesamiento de audio en fragmentos de 30 segundos, con la posibilidad de encadenar fragmentos para audio mas largo.
- Modelo monoidioma: esta especializado en danes, no se declara soporte multilingue adicional.
- No se declaran capacidades de tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo ASR, no un LLM conversacional).
- No se declaran capacidades de vision ni de audio-vision mas alla del propio ASR.

## Casos de uso

- Subtitulado automatico de contenido audiovisual en danes: el modelo transcribe audio de video y permite generar subtitulos con la puntuacion y el texto que proporciona Whisper, adecuado para broadcasters y plataformas nordicas.
- Transcripcion de reuniones y actas en empresas danesas: con la capacidad de manejar habla conversacional (WER de 15,93 en CoRal-v3 conversation), sirve para generar actas de reuniones internas.
- Atencion al cliente y centros de contacto: transcripcion de llamadas en danes para su analisis posterior, control de calidad o generacion de resumenes mediante un LLM aguas abajo.
- Accesibilidad y dictado: conversion de voz a texto para personas con dificultades motoras o para herramientas de dictado en danes.
- Investigacion linguistica y sociolinguistica: generacion de corpus transcritos a partir de grabaciones para estudios de variacion del danes.
- Archivado y digitalizacion de audio historico: transcripcion de entrevistas, programas de radio o archivos orales en danes.
- Integracion en pipelines de IA conversacional: como primer modulo ASR de un sistema de voz (por ejemplo, asistente telefonico) antes de pasar el texto a un LLM.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Dataset | Tarea | WER | CER |
|---|---|---|---|
| CoRal-v3 conversation (test) | ASR | 15,93 | 9,17 |
| CoRal-v3 read-aloud (test) | ASR | 9,02 | 3,55 |
| Common Voice Danish, leaderboard set (756 clips, test) | ASR | 5,91 | 2,00 |
| FLEURS da_dk (test) | ASR | 6,47 | No disponible (truncado en la informacion) |

No se dispone de resultados adicionales de benchmarks en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en precision FP16/BF16: aproximadamente 3,1 GB solo para los pesos, mas overhead de activaciones y cache.
- VRAM estimada con cuantizacion int8: aproximadamente 1,6 GB. Con int4: aproximadamente 0,8 GB.
- Cabe en GPUs de consumo: si. Modelos de 8 GB (RTX 3060 Ti, RTX 4060), 12 GB (RTX 3060 12 GB, RTX 4070) y superiores (RTX 4080, RTX 4090) pueden ejecutarlo con holgura; incluso tarjetas de 6 GB podrian ejecutarlo en cuantizacion reducida.
- GPU recomendadas para produccion: NVIDIA A100, H100, L40S o similares para alto throughput; RTX 4090 para despliegue de baja latencia en local.
- Ejecucion en CPU: posible, especialmente con whisper.cpp o faster-whisper, aunque con mayor latencia.
- Opciones de despliegue: transformers (pipeline de ASR), faster-whisper (CTranslate2), whisper.cpp (mediante conversion del modelo), y otros runners compatibles con el formato Whisper. No se confirma soporte nativo directo en vLLM o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos alternativos en la informacion proporcionada; por tanto, la comparacion numerica es "no disponible". A nivel cualitativo:

| Modelo | Parametros | Contexto/ventana | Licencia | Disponibilidad |
|---|---|---|---|---|
| Harmonium/brage-v1 | 1,54 mil millones | Audio en fragmentos de 30 s | brage-v1-license (propia, acceso gated) | HuggingFace (gated) |
| openai/whisper-large-v3 (modelo base) | 1,55 mil millones | Audio en fragmentos de 30 s | Apache 2.0 (modelo base) | HuggingFace (abierto) |
| Alternativas ASR en danes (p. ej. modelos de alexandra inst) | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Modelo monoidioma: solo se declara soporte para danes (da); no esta pensado para otros idiomas.
- Acceso restringido: el modelo esta en modo gated en HuggingFace y requiere aceptar condiciones de uso, lo que puede limitar su adopcion automatica en pipelines.
- Licencia propia (brage-v1-license): al no ser una licencia estandar (Apache 2.0, MIT, etc.), es imprescindible revisar las condiciones exactas antes de un uso comercial.
- Resultados no verificados: los valores de WER y CER proceden de la model card del autor y no han sido verificados de forma independiente.
- Sesgos: no se documentan analisis de sesgos (acento, edad, genero, procedencia) en la informacion disponible; en ASR es habitual que el rendimiento varie con el acento o la calidad de la grabacion.
- Riesgo de alucinacion: como todos los modelos basados en Whisper, puede generar texto que no corresponde al audio en fragmentos silenciosos, ruidosos o con musica.
- Ventana de 30 segundos: el audio largo requiere segmentacion y encadenamiento, lo que puede introducir errores en las fronteras entre fragmentos.
- Sin datos publicados de uso en produccion: no se declaran cifras de latency ni throughput, por lo que el dimensionamiento debe hacerse mediante pruebas propias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Harmonium/brage-v1
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Dataset CoRal-v3: https://huggingface.co/datasets/CoRal-project/coral-v3
- Dataset FTSpeech: https://huggingface.co/datasets/alexandra inst/ftspeech
- Dataset NST Danish: https://huggingface.co/datasets/alexandra inst/nst-da
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Dataset Common Voice 17.0: https://huggingface.co/datasets/mozilla-foundation/common_voice_17_0

Nota: los resultados de la busqueda web proporcionada no contienen enlaces relevantes sobre el modelo, ya que hacen referencia al instrumento musical "harmonium" y a materias no relacionadas; por ello no se incluyen.
