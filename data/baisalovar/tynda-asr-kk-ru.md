# baisalovar/Tynda-ASR-kk-ru

## Resumen

Tynda-ASR-kk-ru es un modelo de reconocimiento automático del habla (ASR) especializado en kazajo y ruso, desarrollado por Raushan Baisalova (University of Waterloo) como un fine-tune del modelo NVIDIA Nemotron-3.5-Transcribe-30B-A4B. Su nombre proviene del kazajo *тыңда* ("escuchar"). El modelo añade capacidad de transcripción en kazajo al modelo base y conserva el rendimiento en ruso, entrenándose exclusivamente con datos públicos.

Técnicamente se trata de un modelo de arquitectura híbrida (transformer con componentes Mamba y mezcla de expertos, según los tags del repositorio) con 33.697.781.029 parámetros totales y un tamaño de repositorio de 67,5 GB. El fine-tune se realizó mediante LoRA (r=64, α=128) sobre las proyecciones de atención, Mamba y MLP, además del encoder ASR completo y la proyección de audio, sobre aproximadamente 1.470 horas de audio público.

El modelo resulta relevante porque cubre un par de lenguas (kazajo-ruso) escasamente atendido por los sistemas ASR comerciales, con resultados publicados en FLEURS (WER 12,23 % en kazajo y 9,21 % en ruso) y mantiene las capacidades del modelo base, como marcas de tiempo a nivel de palabra mediante la cabeza CTC. Se distribuye bajo licencia OpenMDW-1.1 y se sirve con vLLM 0.32 y el plugin NeMo Speech.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (transformer con componentes Mamba y mixture-of-experts, según tags); fine-tune con LoRA |
| Parametros totales | 33.697.781.029 |
| Parametros activos | no disponible (el modelo base se denomina A4B, pero no se detalla el número de parámetros activos) |
| Longitud de contexto | 65.536 tokens (configuración de servicio `--max-model-len 65536`) |
| Tipos de cuantizacion | no disponible (el autor indica servir en bfloat16) |
| Idiomas soportados | kazajo (kk), ruso (ru) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (librería NeMo) |

## Arquitectura y entrenamiento

El modelo parte de NVIDIA Nemotron-3.5-Transcribe-30B-A4B (revisión `c176676`), un modelo de transcripción de arquitectura híbrida que combina atención transformer con capas Mamba y mezcla de expertos, e incluye un encoder ASR y una proyección de audio. El fine-tune aplica LoRA con r=64 y α=128 sobre las proyecciones de atención, Mamba y MLP, y entrena además el encoder ASR completo y la proyección de audio. Se usó learning rate 1e-4, 500 pasos de warmup, scheduler coseno, 4.000 pasos con 24.000 tokens por paso, precisión bf16 y una única GPU H200. El checkpoint publicado corresponde al paso 3.000, el de menor pérdida de validación.

Los datos de entrenamiento suman aproximadamente 1.470 horas de audio público: 1.154 horas de KSC2 train en kazajo (95 % con puntuación mediante KSC2-Structured, usado solo donde las palabras coinciden exactamente con la transcripción KSC2), 11,7 horas de FLEURS kk train replicadas tres veces y 249 horas de Golos train en ruso (en minúsculas, sin puntuación). Se aplicó descontaminación eliminando filas de KSC2 cuyo texto coincidía con frases de dev/test de KSC2 (el corpus repite frases entre hablantes) y verificando las filas de FLEURS train contra los textos de test de FLEURS y de dev/test de KSC2. La cabeza CTC de marcas de tiempo a nivel de palabra y la rama de diarización se mantienen sin cambios respecto al modelo base, con los metadatos CTC en `model.safetensors`.

## Capacidades

- Transcripción de voz a texto en kazajo y ruso, con salida en formato verbatim.
- Control del formato de salida mediante prompt: con puntuación y mayúsculas, o en minúsculas sin puntuación.
- Marcas de tiempo a nivel de palabra mediante la cabeza CTC heredada del modelo base.
- Rama de diarización heredada del modelo base (sin cambios).
- Soporte de decodificación especulativa MTP y backend FlashInfer para aceleración (opcional, requiere compilador CUDA).
- Servicio mediante API compatible con OpenAI a través de vLLM y el plugin NeMo Speech.
- Modo thinking desactivable mediante `enable_thinking` en el chat template.

## Casos de uso

- Transcripción de reuniones y conversaciones en kazajo: el modelo acepta audio de hasta decenas de segundos por petición y devuelve transcripción con puntuación usando el prompt específico de kazajo con puntuación, que reduce errores en habla conversacional.
- Subtitulado y generación de actas en ruso: con WER del 9,21 % en FLEURS ru, es adecuado para transcribir audio en minúsculas y posteriormente aplicar puntuación con otro sistema, ya que los datos de entrenamiento en ruso carecen de puntuación.
- Archivado y búsqueda de contenido audiovisual en kazajo: las marcas de tiempo a nivel de palabra permiten alinear la transcripción con el audio para indexación y búsqueda.
- Atención al cliente y centros de llamadas en Kazajistán: el modelo puede transcribir grabaciones de llamadas en kazajo y ruso para análisis de calidad y extracción de información, desplegado con vLLM en una GPU de 80-141 GB.
- Investigación lingüística y creación de corpus: útil para generar transcripciones de material oral kazajo con fines de anotación y estudio, dado que se entrenó solo con datos públicos.
- Procesamiento por lotes de audio en entornos con GPU de datacenter: el soporte de vLLM con prefill troceado y caché de procesador multimedia permite servir múltiples peticiones concurrentes en una H100, H200 o RTX PRO 6000.
- Diarización de hablantes en reuniones: la rama de diarización heredada del modelo base permite separar interlocutores en grabaciones multihablante.

## Benchmarks y rendimiento

Resultados publicados por el autor en FLEURS test, con normalización (NFC, minúsculas, ё→е, eliminación de puntuación y muletillas como "ыыы", mapeo de letras latinas a cirílicas), decodificación greedy y `max_tokens` limitado a 30 × segundos de audio + 32:

| Test set | WER (%) | CER (%) |
|---|---:|---:|
| FLEURS kk test (856 utterances) | 12,23 | 4,47 |
| FLEURS ru test (775 utterances) | 9,21 | 6,37 |

El autor advierte que las referencias de FLEURS escriben los números con dígitos, mientras que el modelo suele escribirlos con palabras, lo que añade errores. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Pesos en BF16: 63 GB.
- GPU recomendadas: una GPU de 80-141 GB, como H100, H200 o RTX PRO 6000.
- No cabe en GPU de consumo convencional (RTX 4090 de 24 GB) con los pesos en BF16; no se documentan cuantizaciones alternativas.
- Despliegue mediante vLLM 0.32 con el plugin NeMo Speech (`VLLM_PLUGINS=nemo_speechlm`, `VLLM_USE_V2_MODEL_RUNNER=0`), con `--trust-remote-code`, `--dtype bfloat16`, `--max-model-len 65536`, `--enable-chunked-prefill`, `--mamba-cache-mode none` y middleware CTC para marcas de tiempo.
- En GPUs con FlashInfer JIT disponible se pueden añadir `--use-replayssm --mamba-backend flashinfer` y flags de decodificación especulativa MTP para mayor velocidad; la configuración básica no requiere compilador CUDA.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | WER FLEURS |
|---|---|---|---|---|---|
| Tynda-ASR-kk-ru | 33,7 B | 65.536 tokens | kk, ru | OpenMDW-1.1 | 12,23 (kk) / 9,21 (ru) |
| NVIDIA Nemotron-3.5-Transcribe-30B-A4B | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas ASR multilingües | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada; la única referencia es el modelo base, del que no se detallan resultados en esta ficha.

## Limitaciones y advertencias

- El kazajo conversacional con muchas vacilaciones ("ыыы", falsos inicios) es más difícil que el habla leída; en ese audio el modelo puede repetir ocasionalmente una palabra o muletilla. Se recomienda mantener el límite de `max_tokens` indicado en la documentación de uso.
- Los datos de entrenamiento en ruso estaban en minúsculas (Golos no tiene puntuación); la puntuación en ruso depende del modelo base.
- Los números suelen escribirse con palabras, lo que incrementa el WER frente a referencias con dígitos.
- El cambio de código kazajo-ruso dentro de una misma emisión no se entrenó específicamente.
- Riesgo de alucinación y sesgos: no se documentan análisis específicos en la información disponible.
- Licencia OpenMDW-1.1: es una licencia derivada del modelo base de NVIDIA; deben conservarse los textos de licencia y avisos en `LICENSE`, `THIRD_PARTY_NOTICES.md` y `licenses/`. No se ofrece garantía.
- Los datos de entrenamiento incluyen KSC2 (CC BY 4.0, ISSAI) y KSC2-Structured (InflexionLab), con obligaciones de atribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/baisalovar/Tynda-ASR-kk-ru
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- KSC2 (Kazakh Speech Corpus 2): https://doi.org/10.48342/m90y-aj02
- Paper de referencia (arXiv:2106.10161): https://arxiv.org/abs/2106.10161
