# rhasspy/voice-incubator-models

## Resumen

`rhasspy/voice-incubator-models` es un repositorio agregado mantenido por Rhasspy (Michael Hansen) que empaqueta los modelos que la aplicacion Voice Incubator descarga al arrancar por primera vez, junto con los que se incorporan durante la construccion de su imagen Docker. No es un modelo unico, sino una coleccion de artefactos de inferencia listos para produccion: modelos de reconocimiento automatico del habla (ASR) de NVIDIA, un modelo de reconocimiento de entidades (GLiNER 2.5) y componentes auxiliares de verificacion de palabra de activacion (Kaldi y micro-wake-word).

El nucleo ASR esta formado por Parakeet TDT-CTC 110M para ingles y FastConformer Hybrid Transducer-CTC Large para ocho idiomas adicionales (aleman, espanol, frances, italiano, neerlandes, polaco, ruso y ucraniano). Todos ellos se distribuyen en formato ONNX con cuantizacion int8 en los pesos MatMul del encoder, y exponen simultaneamente la rama transducer (encoder, decoder, joiner, tokens) y la rama CTC (`ctc_head.npz`), de modo que un unico encoder sirve tanto para transcribir como para emparejar comandos por probabilidad logaritmica. Los modelos originales son de NVIDIA y se han reexportado mediante sherpa-onnx y NeMo 2.3.3.

La relevancia actual del repositorio radica en que ofrece un paquete coherente y ligero (2,5 GB en total) para asistentes de voz locales y autoalojados, con licencias permisivas (CC-BY-4.0 para los modelos NVIDIA, Apache-2.0 para GLiNER) y soporte multilingue. Es un recurso practico para quien construya un asistente de voz on-premise o integrado en Home Assistant sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer/FastConformer hibrida transducer-CTC (NVIDIA NeMo); transformer encoder para GLiNER 2.5; nnet3 para Kaldi |
| Parametros totales | 110M (Parakeet TDT-CTC en); tamano Large para los FastConformer multilingues (cifra exacta no disponible); GLiNER 2.5 small (no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelos ASR por utterance, no modelos de contexto largo) |
| Tipos de cuantizacion | int8 dinamica (onnxruntime) en pesos MatMul del encoder; GLiNER: encoder en 8 bits y embedding en 4 bits (MatMulNBits, bloque 32); tflite para micro-wake-word |
| Idiomas soportados | en, de, es, fr, it, nl, pl, ru, uk |
| Licencia | CC-BY-4.0 (modelos NVIDIA) y Apache-2.0 (GLiNER); licencia compuesta `cc-by-4.0-and-apache-2.0` |
| Formato de pesos | ONNX (ASR y GLiNER), tflite (micro-wake-word), npz (cabecera CTC), tar.gz (Kaldi) |

## Arquitectura y entrenamiento

Los modelos ASR son variantes hibridas transducer-CTC de la familia FastConformer de NVIDIA. Parakeet TDT-CTC 110M combina un encoder FastConformer con un decoder transducer (TDT) y una cabeza CTC adicional, lo que permite dos modos de decodificacion sobre el mismo encoder: transcripcion libre mediante el transducer y alineamiento/emparejamiento de comandos mediante las probabilidades CTC. Los modelos multilingues son FastConformer Hybrid Transducer-CTC Large, exportados con NeMo 2.3.3 y reempaquetados por sherpa-onnx. En este repositorio, los pesos MatMul del encoder se cuantizan a int8 con la cuantizacion dinamica de onnxruntime, reduciendo el tamano y el coste de inferencia manteniendo la precision del transducer.

GLiNER 2.5 small es un modelo transformer de reconocimiento de entidades de tipo zero-shot que se usa como respaldo para el emparejamiento de comandos cuando el CTC no alcanza el umbral. Sus redes ONNX aplican cuantizacion mixta: capas del encoder en 8 bits y embedding en 4 bits con MatMulNBits (bloque 32), lo que reduce drasticamente el peso en disco y memoria. Los componentes `kaldi/` (modelo acustico nnet3 en ingles estadounidense con lexico IPA) y `micro-wake-word/` (tflite) completan el pipeline de activacion por voz. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO en la informacion proporcionada.

## Capacidades

- Reconocimiento automatico del habla (ASR) en tiempo real para ingles (Parakeet 110M) y para aleman, espanol, frances, italiano, neerlandes, polaco, ruso y ucraniano (FastConformer Large).
- Decodificacion dual: transcripcion libre con la rama transducer y emparejamiento de comandos por probabilidad CTC sobre el mismo encoder.
- Reconocimiento de entidades zero-shot con GLiNER 2.5 small para el respaldo de comandos cuando el ASR no es concluyente.
- Verificacion de palabra de activacion (wake word) mediante el modelo acustico Kaldi nnet3 y el clasificador tflite de micro-wake-word.
- Capacidades multilingues en nueve idiomas, con un modelo dedicado por idioma.
- Ejecucion completamente local y offline, sin dependencia de APIs externas.
- No incluye generacion de texto, razonamiento, codigo, matematicas, vision ni tool calling; es un pipeline de voz, no un LLM.

## Casos de uso

- Asistente de voz para el hogar: el pipeline completo (wake word, ASR y emparejamiento de comandos) permite construir un asistente local tipo Home Assistant que escucha, transcribe y ejecuta ordenes sin enviar audio a la nube.
- Transcripcion de reuniones y notas de voz en espanol: el modelo `stt_es_fastconformer_hybrid_large_pc-int8` transcribe audio en castellano con un encoder int8, adecuado para procesar grabaciones en local en portatiles o mini-PC.
- Subtitulado en directo multilingue: al disponer de modelos dedicados para nueve idiomas, se puede encadenar la deteccion de idioma con el modelo correspondiente para generar subtitulos en tiempo real en aplicaciones de videoconferencia.
- Dictado por voz en aplicaciones de escritorio: la rama CTC permite mapear expresiones habladas a comandos concretos (por ejemplo, "abrir ajustes"), lo que simplifica la integracion en editores o entornos de accesibilidad.
- Extraccion de entidades de transcripciones: GLiNER 2.5 small puede etiquetar nombres, lugares, fechas y cantidades en el texto transcrito, util para resumir o indexar conversaciones.
- Automatizacion de centros de llamadas: la transcripcion local y el etiquetado de entidades permiten clasificar llamadas y detectar intenciones sin exponer datos de clientes a terceros.
- Dispositivos embebidos y edge: los modelos int8 y el clasificador tflite de wake word caben en dispositivos de bajos recursos, habilitando asistentes de voz en Raspberry Pi o similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; los modelos int8 estan pensados para ejecucion en CPU, por lo que la VRAM no es el factor limitante.
- GPU recomendadas: no disponible; el repositorio no especifica GPU concretas. Al ser modelos ONNX int8, funcionan en CPU y en GPU con onnxruntime.
- Compatibilidad con GPU de consumo: si, al estar cuantizados a int8 y orientados a ejecucion ligera; no se detallan modelos concretos.
- Opciones de despliegue: onnxruntime (formato nativo), sherpa-onnx (exportador de los modelos), NeMo 2.3.3 (para los modelos originales) y la propia aplicacion Voice Incubator.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| rhasspy/voice-incubator-models (Parakeet 110M + FastConformer Large) | 110M / Large | no disponible | 9 | CC-BY-4.0 + Apache-2.0 | ONNX, tflite |
| nvidia/parakeet-tdt_ctc-110m | 110M | no disponible | en | CC-BY-4.0 | NeMo, ONNX (via sherpa-onnx) |
| nvidia/stt_*_fastconformer_hybrid_large_pc | Large | no disponible | de, es, fr, it, nl, pl, ru, ua | CC-BY-4.0 | NeMo |
| fastino/gliner2.5-small-v1 | small | no disponible | multilingue (no detallado) | Apache-2.0 | ONNX |

## Limitaciones y advertencias

- El repositorio es un agregado de modelos de terceros; la calidad y los sesgos dependen de los modelos originales de NVIDIA y fastino.
- Los modelos ASR estan entrenados por utterance y no estan disenados para contexto largo ni para conversaciones multi-turno.
- El rendimiento en acentos, ruido de fondo y dominio especifico puede degradarse; no se publican metricas de error (WER) en la informacion disponible.
- La cuantizacion int8 puede introducir una ligera perdida de precision respecto a los pesos originales en fp32/fp16.
- La licencia compuesta exige cumplir simultaneamente CC-BY-4.0 (atribucion a NVIDIA) y Apache-2.0; es necesario revisar `LICENSE.md` antes de un uso comercial.
- GLiNER 2.5 small es un modelo de respaldo para comandos, no un extractor de entidades de proposito general de alta precision.
- No se dispone de informacion sobre sesgos demograficos o linguisticos especificos de estos modelos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/rhasspy/voice-incubator-models
- Aplicacion Voice Incubator: https://github.com/OHF-Voice/voice-incubator
- Modelo original Parakeet TDT-CTC 110M: https://huggingface.co/nvidia/parakeet-tdt_ctc-110m
- Exportacion sherpa-onnx (transducer): https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet_tdt_transducer_110m-en-36000
- Exportacion sherpa-onnx (CTC): https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet_tdt_ctc_110m-en-36000
- FastConformer aleman: https://huggingface.co/nvidia/stt_de_fastconformer_hybrid_large_pc
- FastConformer espanol: https://huggingface.co/nvidia/stt_es_fastconformer_hybrid_large_pc
- FastConformer frances: https://huggingface.co/nvidia/stt_fr_fastconformer_hybrid_large_pc
- FastConformer italiano: https://huggingface.co/nvidia/stt_it_fastconformer_hybrid_large_pc
- FastConformer neerlandes: https://huggingface.co/nvidia/stt_nl_fastconformer_hybrid_large_pc
- FastConformer polaco: https://huggingface.co/nvidia/stt_pl_fastconformer_hybrid_large_pc
- FastConformer ruso: https://huggingface.co/nvidia/stt_ru_fastconformer_hybrid_large_pc
- FastConformer ucraniano: https://huggingface.co/nvidia/stt_ua_fastconformer_hybrid_large_pc
- GLiNER 2.5 small: https://huggingface.co/fastino/gliner2.5-small-v1
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
