# Moear/AzurLane-Irodori-TTS-v4.1-Small-LoRA

## Resumen

AzurLane-Irodori-TTS-v4.1-Small-LoRA es un adaptador LoRA de tipo text-to-speech (TTS) entrenado por el usuario Moear sobre el modelo base Aratako/Irodori-TTS-v4.1-Small. Su objetivo es la síntesis de voz en japones de los personajes del videojuego Azur Lane, de forma que un unico adaptador compartido permite cambiar de personaje simplemente sustituyendo el audio de referencia en la inferencia. El repositorio publica el adaptador en el paso 692 de entrenamiento, con un tamano aproximado de 106 MB y formato safetensors.

El modelo no es un TTS autonomo: requiere el checkpoint oficial Irodori-TTS v4.1 Small (variante RF) y el pipeline de inferencia del proyecto upstream (infer.py o gradio_app.py). La arquitectura subyacente es la del modelo base, sobre la que se aplica un LoRA de rango 16 que actualiza conjuntamente el predictor de duracion. El entrenamiento se realizo sobre 49.727 clips de voz japonesa (135,8 horas) que cubren 902 identificadores de nave, ampliados a 912 identificadores de timbre al separar variantes de doblaje.

La relevancia de esta ficha es acotada: se trata de un adaptador de nicho, con cero descargas y cero likes en el momento de la consulta, orientado a experimentacion con clonacion de voz zero-shot y few-shot en japones. No dispone de licencia declarada en el repositorio, lo que condiciona seriamente cualquier uso mas alla de la investigacion personal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 16) sobre el modelo TTS Aratako/Irodori-TTS-v4.1-Small; incluye actualizacion del predictor de duracion |
| Parametros totales | no disponible (el adaptador ocupa unos 106 MB en safetensors; los parametros del modelo base no se detallan) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la model card solo documenta ejecucion en BF16 para el modelo y FP32 para el codec) |
| Idiomas soportados | japones (ja) |
| Licencia | no disponible (la model card remite a la licencia y terminos eticos del modelo base) |
| Formato de pesos | safetensors (adapter_model.safetensors + adapter_config.json) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Irodori-TTS v4.1 Small, un sistema TTS del que la informacion proporcionada no detalla la arquitectura interna (transformer, difusion, codec de audio, etc.). Lo que si se documenta es el mecanismo de adaptacion: un unico LoRA de rango 16 compartido entre todos los personajes, de modo que el timbre concreto se selecciona en tiempo de inferencia mediante un audio de referencia, no mediante pesos separados por personaje. Durante el entrenamiento tambien se actualizo el predictor de duracion del modelo base.

Los datos de entrenamiento provienen del filtrado previo del proyecto V5turbo: clips de voz japonesa de entre 3 y 20 segundos, con un total de 49.727 muestras y 135,8 horas, que cubren 902 identificadores de nave del juego, mas 114 clips adicionales de TB. Al contar por separado las variantes de doblaje japones, el conjunto asciende a 912 identificadores de timbre. No se especifica en la informacion disponible si hubo etapas de RLHF, DPO u otras tecnicas de alineacion, ni el volumen total de tokens o horas efectivas de computo.

## Capacidades

- Sintesis de voz en japones condicionada por un audio de referencia (clonacion de timbre zero-shot/few-shot) para personajes de Azur Lane.
- Cambio de personaje sin reentrenar: basta con sustituir el WAV de referencia en cada peticion.
- Control del numero de pasos de inferencia (la evaluacion del autor usa 40 pasos).
- Integracion con el pipeline oficial de Irodori-TTS mediante `infer.py` y la interfaz Gradio `gradio_app.py`.
- Despliegue como servicio mediante Irodori-TTS-Server, especificando el directorio del adaptador en el campo `irodori.lora_adapter` de la peticion.
- Verificacion de integridad de los pesos descargados mediante el fichero `SHA256SUMS`.
- No se documentan capacidades de tool calling, agentes, vision, audio de entrada ni modo de razonamiento, ya que se trata de un modelo puramente TTS.

## Casos de uso

- Prototipado de voces para mods o proyectos fan de Azur Lane: el adaptador permite generar lineas nuevas con el timbre de un personaje concreto usando un clip de referencia, sin entrenar un modelo por personaje.
- Evaluacion comparativa de tecnicas de clonacion de voz: la model card incluye un protocolo de evaluacion con留 out de lineas y referencias, replicable para comparar LoRA frente a zero-shot.
- Investigacion sobre LoRA compartido multi-hablante: util para estudiar como un unico adaptador de rango 16 generaliza entre 912 identificadores de timbre.
- Generacion de audio para doblaje no comercial de contenido derivado: el modelo sintetiza japones a partir de texto y una referencia, adecuado para pruebas de concepto de localizacion.
- Benchmarking de metricas de similitud de voz: el autor reporta puntuaciones ERes2NetV2 y WavLM, de modo que el adaptador sirve como caso de prueba para pipelines de evaluacion TTS.
- Integracion en servicios TTS experimentales: mediante Irodori-TTS-Server se puede exponer el adaptador como API y medir latencia y consumo de VRAM en entornos con GPU NVIDIA.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son las evaluaciones del propio autor, con留 out de lineas y referencias por personaje. La columna de timbre muestra dos metricas de similitud (ERes2NetV2 y WavLM, mayor es mejor); la tasa de error de kana se calcula por transcripcion automatica (menor es mejor).

| Configuracion | Timbre ronda 1 (24 frases) | Error de kana r1 | Timbre ronda 2 (16 frases) | Error de kana r2 |
|---|---:|---:|---:|---:|
| V5turbo oficial zero-shot | 0,8079 / 0,9278 | 4,01 % | 0,8107 / 0,9205 | 8,72 % |
| Irodori v4.1 Small oficial zero-shot | 0,7542 / 0,9139 | 3,43 % | 0,7354 / 0,9154 | 8,17 % |
| Irodori LoRA paso 692 | 0,7659 / 0,9253 | 4,01 % | 0,7403 / 0,9094 | 9,81 % |

Como referencia, el audio original del juego medido con el mismo ASR obtiene un 7,63 % de error de kana en la segunda ronda. El autor advierte que las cifras solo son comparables dentro de la misma ronda y recomienda escuchar el resultado para el personaje concreto. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) porque no aplican a un modelo TTS.

## Requisitos de hardware

- VRAM en inferencia: aproximadamente 6,4 GiB de pico con el modelo en BF16 y el codec en FP32, ambos en GPU, medido en una GPU de la serie 6000 (la model card cita "6000d").
- Alternativa de bajo consumo: con `--codec-device cpu` el pico baja a unos 3,7 GiB en la misma maquina, a costa de mayor latencia de generacion.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 8 GB de VRAM para la configuracion completa; la serie RTX 4090, A100 o H100 son sobredimensionadas para este adaptador, pero compatibles.
- Cabe en GPUs de consumo: si, con 8 GB o mas de VRAM en BF16; con el codec en CPU el margen se amplia.
- Opciones de despliegue: pipeline oficial de Irodori-TTS (`infer.py`, `gradio_app.py`) e Irodori-TTS-Server para exposicion como API. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles. La model card solo indica que la evaluacion se realizo con 40 pasos de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento (timbre r1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AzurLane-Irodori-TTS-v4.1-Small-LoRA (este) | LoRA TTS sobre Irodori v4.1 Small | adaptador ~106 MB, rango 16 | no disponible | 0,7659 / 0,9253 | no disponible | Hugging Face, 0 descargas |
| Irodori v4.1 Small (base) | TTS zero-shot | no disponible | no disponible | 0,7542 / 0,9139 | ver licencia del modelo base | Hugging Face |
| AzurLane-GPT-SoVITS-V5turbo | TTS zero-shot sobre GPT-SoVITS | no disponible | no disponible | 0,8079 / 0,9278 | no disponible en la informacion | Hugging Face |

La comparativa se limita a los modelos citados en la propia model card; no se dispone de datos de otras alternativas TTS comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica licencia propia y remite a la licencia y restricciones eticas del modelo base; el uso comercial queda sin garantia juridica clara.
- Derechos de terceros: las voces, dialogos y personajes de Azur Lane pertenecen a sus titulares; la model card lo advierte explicitamente.
- Idiomas: solo japones; no se documenta soporte multilingue.
- Calidad variable por personaje: el autor senala que al cambiar de personaje las dos metricas de timbre se mueven en direcciones opuestas, por lo que el adaptador no domina por igual a todos los personajes.
- Error de kana superior al zero-shot en la segunda ronda (9,81 % frente a 8,17 % del base y 8,72 % de V5turbo), lo que indica mayor riesgo de errores de pronunciacion en ese conjunto.
- Dependencia estricta del modelo base y del commit upstream `f01c08cd40c0`; cambios en Irodori-TTS pueden romper la compatibilidad del adaptador.
- Riesgo de alucinacion acustica y artefactos propios de la clonacion de voz, no cuantificado en la informacion disponible.
- Sesgos: no documentados; al entrenarse solo con voces de personajes del juego, la diversidad de hablantes es limitada y no representa el japones general.
- Madurez: cero descargas y cero likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Moear/AzurLane-Irodori-TTS-v4.1-Small-LoRA
- Modelo base: https://huggingface.co/Aratako/Irodori-TTS-v4.1-Small
- Licencia y restricciones del modelo base: https://huggingface.co/Aratako/Irodori-TTS-v4.1-Small#license-ethical-restrictions
- Dataset de entrenamiento: https://huggingface.co/datasets/Moear/AzurLane-Voice-20261118
- Snapshot del dataset usado: https://huggingface.co/datasets/Moear/AzurLane-Voice-20261118/tree/39d126bfbaf30311b0518ca8549cc820fc98d92c
- Model card de V5turbo (referencia de filtrado): https://huggingface.co/Moear/AzurLane-GPT-SoVITS-V5turbo
- Repositorio Irodori-TTS: https://github.com/Aratako/Irodori-TTS
- Instalacion de Irodori-TTS: https://github.com/Aratako/Irodori-TTS#installation
- Commit upstream usado en entrenamiento: https://github.com/Aratako/Irodori-TTS/commit/f01c08cd40c0afa62a862439a5de12f6dcf62054
- Servidor de inferencia Irodori-TTS-Server: https://github.com/Aratako/Irodori-TTS-Server
- Directorio del adaptador en el repo: adapter
