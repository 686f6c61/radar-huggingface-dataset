# becca-monster/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-FP8-hf

## Resumen

NVIDIA Nemotron 3.5 Transcribe 30B-A4B es un modelo de reconocimiento automatico del habla (ASR) desarrollado por NVIDIA, empaquetado originalmente en formato FP8 para su despliegue con vLLM o NeMo. Este repositorio concreto es un reempaquetado no oficial realizado por el usuario `becca-monster`, que convierte la exportacion FP8 de NVIDIA en un checkpoint FP8 de grano fino compatible con la libreria `transformers` por si sola, sin necesidad de vLLM ni NeMo.

El modelo combina un encoder de audio con un modelo de lenguaje de tipo MoE (Mixture of Experts) de 30B parametros totales y aproximadamente 4B activos por token (de ahi el sufijo A4B), orientado a transcripcion de alta precision con diarizacion de hablantes. El checkpoint ocupa 34 GB en el repositorio y contiene 32.368.924.687 parametros segun los pesos safetensors.

Su relevancia radica en que permite ejecutar un motor ASR de gran precision en FP8 utilizando unicamente el stack de Transformers, lo que simplifica la integracion en pipelines de Python existentes y reduce la dependencia de infraestructura de inferencia especializada. El autor lo emplea como motor de alta precision en un servicio de transcripcion offline con atribucion de hablantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de audio + modelo de lenguaje MoE (tipo `nemo_speechlm`), con capas Mamba2 en el mixer |
| Parametros totales | 32.368.924.687 |
| Parametros activos | aproximadamente 4B (sufijo A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 de grano fino (pesos del LM); encoder de audio en BF16 |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (FP8 + BF16) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura `nemo_speechlm`: un encoder de audio que alimenta un modelo de lenguaje de tipo Mixture of Experts con 30B parametros totales y unos 4B activos por token. El mixer del LM incorpora capas Mamba2, tal como se deduce de las notas de uso sobre `time_step_limit` en la configuracion del `text_config`. El checkpoint original de NVIDIA es una exportacion FP8 realizada con ModelOpt.

En este reempaquetado, los pesos FP8 del modelo de lenguaje se mantienen byte a byte respecto al original de NVIDIA; los expertos enrutados se apilan por capa en el layout 3D de Transformers; las capas FP8 del encoder de audio se dequantizan a BF16 (el lado de audio queda sin cuantizar); y se eliminan las escalas estaticas de activacion y las escalas de cache KV de vLLM, ya que el FP8 de grano fino cuantiza activaciones de forma dinamica. La cabeza de prediccion multi-token no se carga en Transformers y se omite. No se dispone de informacion sobre volumen de tokens de entrenamiento, composicion del dataset ni si se aplico RLHF o DPO.

## Capacidades

- Reconocimiento automatico del habla (transcripcion) de alta precision.
- Diarizacion de hablantes integrada (tag `speaker-diarization`), aunque puede sustituirse por actividad de hablante externa.
- Generacion de texto a partir de audio (pipeline `text2text-generation`).
- Modelo de lenguaje MoE subyacente con capacidad de generacion de texto.
- Ejecucion en FP8 con `transformers` y `use_kernels=True`, usando kernels de `kernels-community`.
- Compatibilidad con endpoints (`endpoints_compatible`).
- Capacidades multilingues: no disponible (los idiomas no estan documentados en la informacion proporcionada).

## Casos de uso

- Transcripcion offline de alta precision con atribucion de hablantes: el autor lo usa como motor principal de un servicio que sustituye la diarizacion propia del modelo por la actividad de hablante de Nemotron 3 Diarization sobre la grabacion completa, manteniendo numeros de hablante consistentes entre fragmentos de una grabacion larga.
- Generacion de subtitulos y actas de reuniones: transcripcion de audio con marcas de hablante para reuniones multiparticipante.
- Pipelines de Python con Transformers: al estar en layout nativo de Transformers, se integra directamente en codigo existente sin desplegar vLLM ni NeMo.
- Procesamiento por lotes en GPU de un solo nodo: el formato FP8 reduce la huella de memoria frente a BF16, permitiendo servir el modelo en hardware mas modesto.
- Evaluacion comparativa de ASR: util para reproducir mediciones de WER frente al checkpoint FP8 original de NVIDIA en vLLM.
- Investigacion en ASR multilingue: el autor reporta mediciones sobre el conjunto de test aleman de FLEURS, por lo que sirve como referencia para evaluaciones en aleman.

## Benchmarks y rendimiento

Mediciones del autor sobre las 862 grabaciones del conjunto de test aleman de FLEURS, con el prompt de FLEURS de la model card de NVIDIA y sin etiquetas de hablante:

| Sistema | WER (minusculas, sin puntuacion) | WER (numeros y ortografia normalizados) |
|---|---|---|
| Este checkpoint, Transformers | 4,33% | 3,64% |
| Checkpoint FP8 de NVIDIA, vLLM | 4,17% | 3,61% |

La columna normalizada escribe los numeros en palabras en aleman en ambos lados, une compuestos con guion y elimina acentos. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 34 GB; en FP8 con encoder en BF16 se requiere del orden de 34 GB o mas de memoria, ademas de memoria para cache KV y activaciones (cifra exacta no disponible).
- GPU recomendadas: el autor probo en una NVIDIA GB10 con CUDA; GPU de datacenter como A100 o H100 con suficiente memoria son adecuadas (no verificado en la informacion).
- Cabe en GPU consumer: no disponible con certeza; 34 GB supera la VRAM de la mayoria de GPU consumer (por ejemplo, RTX 4090 con 24 GB), por lo que no cabe en una sola unidad consumer convencional.
- Opciones de despliegue: `transformers` (probado con Transformers 5.23.0 y PyTorch 2.14.1), con `use_kernels=True` y kernels FP8 de `kernels-community`; el checkpoint original de NVIDIA esta pensado para vLLM o NeMo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (reempaquetado FP8, Transformers) | 32,4B totales, ~4B activos | no disponible | WER 4,33% en FLEURS DE | OpenMDW-1.1 | Hugging Face (no oficial) |
| NVIDIA Nemotron 3.5 Transcribe 30B-A4B-FP8 (original, vLLM) | 30B-A4B | no disponible | WER 4,17% en FLEURS DE | OpenMDW-1.1 | Hugging Face (oficial NVIDIA) |
| NVIDIA Nemotron 3.5 Transcribe 30B-A4B (BF16) | 30B-A4B | no disponible | no disponible | OpenMDW-1.1 | Hugging Face (oficial NVIDIA) |

No se dispone de datos sobre otros modelos ASR comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Reempaquetado no oficial: no esta publicado ni respaldado por NVIDIA; para uso previsto, evaluacion y limitaciones debe consultarse la model card oficial de NVIDIA.
- Requiere registrar un mapeo de conversion vacio antes de cargar (`register_checkpoint_conversion_mapping("nemo_speechlm", [], overwrite=True)`), ya que el checkpoint ya esta en layout de Transformers y las reglas de renombrado de NeMo no deben ejecutarse.
- Con Transformers 5.23, el limite de paso temporal de Mamba2 se cambia de (0, inf) a (0.001, inf); las transcripciones de mas de unos cinco minutos pierden el hilo. Hay que restaurar `time_step_limit` de cada mixer a `config.text_config.time_step_limit` tras la carga.
- La cabeza de prediccion multi-token no se carga, por lo que no esta disponible en este checkpoint.
- El encoder de audio esta en BF16 (sin cuantizar), lo que aumenta la huella de memoria respecto a un checkpoint totalmente FP8.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; deben consultarse en la model card de NVIDIA.
- Idiomas soportados: no disponibles; solo hay mediciones publicadas en aleman (FLEURS).
- Licencia OpenMDW-1.1: deben revisarse `LICENSE`, `THIRD_PARTY_NOTICES.md` y `licenses/` para las condiciones de uso comercial.
- Sin descargas ni likes en el momento de la consulta; modelo de reciente creacion (22 de noviembre de 2026).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/becca-monster/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-FP8-hf
- Modelo base FP8 oficial: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-FP8
- Modelo base (procesador, tokenizer, generation config): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- Diarizacion NVIDIA: https://huggingface.co/nvidia/Nemotron-3-Diarization
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
