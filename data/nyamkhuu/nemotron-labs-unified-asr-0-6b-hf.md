# nyamkhuu/Nemotron-Labs-Unified-ASR-0.6B-hf

## Resumen

Nemotron-Labs-Unified-ASR-0.6B-hf es la conversion al formato nativo de Hugging Face Transformers del modelo de reconocimiento automatico del habla (ASR) Nemotron-Labs-Unified-ASR-0.6B de NVIDIA. El repositorio lo publica el usuario nyamkhuu y traslada el archivo `.nemo` original de NeMo a un checkpoint que se carga con `transformers` estandar, sin necesidad de `trust_remote_code`. Los pesos tensoriales son los de NVIDIA sin modificar; solo cambian los nombres de parametros y la disposicion de ficheros.

El modelo es un FastConformer no causal de 626.707.712 parametros con decodificacion RNN-T y condicionamiento por prompt de identificacion de idioma. Cubre 25 idiomas europeos (incluido el espanol) con puntuacion y capitalizacion, y esta pensado para transcripcion offline de contexto completo. Su interes actual reside en que elimina la dependencia del ecosistema NeMo para inferencia: permite integrar un ASR multilingue de calidad en cualquier pipeline que ya use `transformers`.

La validacion publicada es solida: sobre 200 grabaciones de LibriSpeech test-clean con prompt en ingles, las transcripciones son identicas a las de NeMo (`transcribe(target_lang="en")`) en 200 de 200 casos, con un WER del 1,70 % en CPU y GPU. Con prompt en aleman, 20 de 20 transcripciones identicas. La conversion no esta afiliada ni respaldada por NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer no causal (encoder `ParakeetEncoder`) + RNN-T (prediction y joint networks) con proyector de prompt de language-ID |
| Parametros totales | 626.707.712 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (transcripcion offline de contexto completo; ventana de audio no especificada) |
| Tipos de cuantizacion | no disponible (la model card solo documenta inferencia en float32 y bfloat16) |
| Idiomas soportados | 25: bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, es, sv, ru, uk |
| Licencia | OpenMDW License Agreement 1.1 (`openmdw-1.1`) |
| Formato de pesos | safetensors (repo de 2,5 GB), cargable con `transformers` |
| Entrada de audio | 128 bins mel, 16 kHz, mono |
| Vocabulario de salida | 4096 tokens |
| Libreria | transformers (probado con 5.19.0 y torch 2.14.1) |
| Modelo base | nvidia/nemotron-labs-unified-asr-0.6b |

## Arquitectura y entrenamiento

El checkpoint combina dos componentes ya existentes en Transformers. `Nemotron3_5AsrForRNNT` aporta el proyector de prompt de language-ID y las redes de prediccion y conjunta del RNN-T. Su `encoder_config` es un `ParakeetEncoderConfig`, de modo que el encoder es un `ParakeetEncoder`: un FastConformer no causal con convoluciones con batch-norm, la misma arquitectura que el modelo Unified emplea para transcripcion de contexto completo. El preprocesado usa `ParakeetFeatureExtractor` (128 bins mel, 16 kHz) y el processor traduce el codigo de idioma al indice de prompt del diccionario propio del checkpoint.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO; la model card de esta conversion remite a la model card original de NVIDIA para esos detalles. La innovacion tecnica destacable es el condicionamiento por prompt de identificacion de idioma: se puede fijar el idioma con un codigo (`"de"`, `"bg"`, `"es"`) o pasar `"auto"` (valor por defecto) para identificacion automatica. Esta conversion cubre exclusivamente transcripcion offline; para streaming con buffers hay que usar el checkpoint original con NeMo.

## Capacidades

- Reconocimiento automatico del habla multilingue en 25 idiomas europeos, con salida que incluye puntuacion y capitalizacion.
- Identificacion automatica de idioma mediante el prompt `"auto"`, o forzado del idioma con un codigo ISO.
- Transcripcion por lotes: el processor acepta una lista de formas de onda, las rellena y devuelve una attention mask.
- Inferencia en CPU y GPU; validado en float32 y bfloat16.
- Compatibilidad con `transformers` estandar sin `trust_remote_code`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente ASR.
- No dispone de modo thinking, vision ni audio generativo; la salida es texto transcrito.

## Casos de uso

- Subtitulado y transcripcion de reuniones multilingues: con 25 idiomas y deteccion automatica (`"auto"`), un mismo despliegue puede transcribir una llamada con participantes en espanol, aleman e italiano sin cambiar de modelo.
- Generacion de actas y notas en produccion: el modelo devuelve texto con puntuacion y capitalizacion, lo que reduce el postprocesado necesario antes de indexar o resumir el contenido.
- Pipelines de datos para entrenamiento de modelos de voz: transcripcion masiva por lotes de corpus de audio en 16 kHz, con batches rellenados y attention mask para maximizar el throughput en GPU.
- Atencion al cliente con analitica de llamadas: transcripcion offline de grabaciones para clasificacion de motivos, control de calidad y busqueda sobre el texto resultante.
- Accesibilidad y documentacion: conversion de grabaciones y podcasts a texto en cualquiera de los 25 idiomas soportados, ejecutable en CPU si no hay GPU disponible.
- Migracion desde NeMo: equipos que ya tienen infraestructura basada en `transformers` pueden sustituir el pipeline NeMo por este checkpoint manteniendo transcripciones identicas, segun la validacion publicada (200/200 en LibriSpeech test-clean).
- Investigacion en ASR multilingue: punto de partida para fine-tuning o evaluacion comparativa, con la ventaja de cargarse con la API estandar de `transformers`.

## Benchmarks y rendimiento

| Benchmark | Resultado | Condiciones |
|---|---|---|
| LibriSpeech test-clean (WER) | 1,70 % | 200 grabaciones (1,9-30 s), prompt en ingles, float32, una grabacion por llamada; identico a NeMo en CPU y GPU |
| Consistencia con NeMo (ingles) | 200/200 transcripciones identicas | `transcribe(target_lang="en")` sobre el `.nemo` original |
| Consistencia con NeMo (aleman) | 20/20 transcripciones identicas | Prompt en aleman |
| Consistencia en batches (GPU) | 200/200 identicas a inferencia individual | float32, batches rellenados de 16 |

No se han publicado en la informacion disponible resultados de benchmarks para el resto de los 24 idiomas ni comparaciones con otros modelos ASR.

## Requisitos de hardware

- VRAM estimada: con 626,7 M de parametros, en float32 el modelo ocupa aproximadamente 2,5 GB de pesos; en bfloat16, unos 1,25 GB. Hay que sumar el coste del encoder sobre audio largo y de los batches rellenados.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM en bfloat16; una RTX 4090 o una A100/H100 ofrecen margen amplio para batches grandes. El modelo es lo bastante pequeno para GPUs de consumo como la RTX 3060 (12 GB) o la RTX 4060 Ti (8/16 GB).
- CPU: validado en CPU con resultados identicos a GPU en la prueba de LibriSpeech test-clean; viable para transcripcion de bajo volumen.
- Opciones de despliegue: `transformers` (via `AutoProcessor` y `Nemotron3_5AsrForRNNT`); para streaming con buffers, NeMo con el checkpoint original. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles. La unica referencia publicada es la equivalencia funcional con NeMo en CPU y GPU, sin cifras de tiempo.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto / modo | Licencia | Formato |
|---|---|---|---|---|---|
| Nemotron-Labs-Unified-ASR-0.6B-hf (este) | 626,7 M | 25 europeos | Offline, contexto completo | OpenMDW 1.1 | safetensors (transformers) |
| nvidia/nemotron-labs-unified-asr-0.6b (original) | no disponible en la informacion | 25 europeos | Offline y streaming con buffers | OpenMDW 1.1 | `.nemo` (NeMo) |
| Otros modelos ASR comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye datos de benchmarks ni especificaciones de modelos alternativos, por lo que no es posible una comparativa cuantitativa con Whisper, Parakeet u otros ASR de tamano similar.

## Limitaciones y advertencias

- Solo transcripcion offline: no soporta streaming con buffers; para ese caso hay que usar el checkpoint original con NeMo.
- RNN-T no tiene token de fin de secuencia: en Transformers 5.19, `generate()` puede seguir emitiendo tokens sobre frames de relleno en batches con audios de distinta duracion. El `generation_config.json` del repo fija `eos_token_id` a 4096 (fuera del vocabulario de 4096 tokens) para enmascarar esas filas sin cortar transcripciones; hay que conservarlo si se usa una `GenerationConfig` propia.
- Cobertura limitada a 25 idiomas europeos; no hay soporte documentado para otras lenguas.
- No se han publicado datos de sesgo, robustez ante ruido, acentos o audio de baja calidad en la informacion disponible.
- Riesgo de alucinacion no cuantificado: como todo modelo ASR, puede generar texto incorrecto en segmentos con silencio, ruido o solapamiento de hablantes; no hay evaluacion publicada al respecto.
- Licencia OpenMDW 1.1: es una licencia "other" con nombre propio; antes de uso comercial hay que revisar `LICENSE.md` en el repositorio, que incluye el aviso de copyright de NVIDIA.
- La conversion no esta afiliada ni respaldada por NVIDIA; para soporte oficial hay que acudir al repositorio original.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que su adopcion en produccion es todavia muy reducida.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nyamkhuu/Nemotron-Labs-Unified-ASR-0.6B-hf
- Modelo base original: https://huggingface.co/nvidia/nemotron-labs-unified-asr-0.6b
- Script de conversion: `convert_nemo_to_hf.py` (incluido en el repositorio)
- Licencia: `LICENSE.md` (incluido en el repositorio)
