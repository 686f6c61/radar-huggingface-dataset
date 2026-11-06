# baisalovar/Tynda-ASR-kk-ru

## Resumen

Tynda-ASR-kk-ru es un modelo de reconocimiento automático del habla (ASR) especializado en kazajo y ruso, desarrollado por Raushan Baisalova (University of Waterloo) como un fine-tune del modelo de NVIDIA Nemotron-3.5-Transcribe-30B-A4B. El modelo parte de una arquitectura SpeechLM con mezcla de expertos (MoE) de 33.700 millones de parámetros totales, e incorpora el kazajo como idioma nuevo manteniendo las capacidades en ruso del modelo base. Su nombre proviene del kazajo *тыңда* ("escuchar").

El modelo resuelve un problema concreto: la escasez de sistemas ASR abiertos con calidad razonable para kazajo, un idioma de bajos recursos. Se entrenó exclusivamente con datos públicos: aproximadamente 1.470 horas de audio, combinando KSC2 (kazajo), FLEURS kk (kazajo) y Golos (ruso). El fine-tune emplea LoRA sobre las proyecciones de atención, Mamba y MLP, además de entrenamiento completo del encoder ASR y la proyección de audio.

Es relevante porque demuestra que un modelo base grande de NVIDIA puede adaptarse a un idioma de bajos recursos con un presupuesto de cómputo modesto (una sola GPU H200) y datos públicos, obteniendo un WER del 12,23 % en FLEURS kk y del 9,21 % en FLEURS ru. El checkpoint liberado corresponde al paso 3.000, seleccionado por menor pérdida de validación, y conserva intactas las capacidades de timestamps por palabra y diarización del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SpeechLM con mezcla de expertos (MoE), basada en Nemotron-3.5-Transcribe-30B-A4B; incluye capas de atención, Mamba y MLP, más encoder ASR y proyección de audio |
| Parámetros totales | 33.697.781.029 (≈33,7 B) |
| Parámetros activos | no disponible (el modelo base es A4B, pero el número exacto de parámetros activos no se detalla en la información proporcionada) |
| Longitud de contexto | 65.536 tokens (`--max-model-len 65536` en el ejemplo de despliegue) |
| Tipos de cuantización | no disponible (los pesos liberados están en BF16; no se documentan otras cuantizaciones) |
| Idiomas soportados | kazajo (kk), ruso (ru) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (librería NeMo) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base Nemotron-3.5-Transcribe-30B-A4B: un SpeechLM con mezcla de expertos que combina capas de atención, capas Mamba y proyecciones MLP, junto con un encoder ASR y una proyección de audio que conecta la señal acústica con el espacio del modelo de lenguaje. El fine-tune aplica LoRA con r=64 y α=128 sobre las proyecciones de atención, Mamba y MLP, y entrena de forma completa el encoder ASR y la proyección de audio. Se mantienen sin cambios la cabeza CTC de timestamps por palabra y la rama de diarización de NVIDIA, con los metadatos CTC incluidos en `model.safetensors`.

El entrenamiento usó aproximadamente 1.470 horas de audio público: 1.154 horas de KSC2 train (kazajo, 95 % con puntuación vía KSC2-Structured), 11,7 horas de FLEURS kk train replicadas tres veces (35,1 horas efectivas) y 249 horas de Golos train (ruso, en minúsculas sin puntuación). Se entrenó con lr 1e-4, 500 pasos de warmup, scheduler coseno, 4.000 pasos de 24k tokens, precisión bf16 y una única GPU H200. Se aplicó descontaminación eliminando filas de KSC2 train cuyo texto coincidía con frases de dev/test de KSC2 (que repite frases entre hablantes) y verificando las filas de FLEURS train contra los conjuntos de test de FLEURS y dev/test de KSC2. El checkpoint publicado es el paso 3.000, el de menor pérdida de validación.

## Capacidades

- Transcripción de voz a texto en kazajo y ruso con salida verbatim.
- Control del formato de salida mediante prompt: con puntuación y mayúsculas, o en minúsculas sin puntuación.
- Timestamps a nivel de palabra mediante la cabeza CTC heredada del modelo base, operativa a través del middleware `ctc_timestamp_middleware`.
- Diarización de hablantes mediante la rama heredada del modelo base.
- Soporte de decodificación especulativa MTP y backend FlashInfer ReplaySSM en GPUs con JIT de FlashInfer disponible.
- Interfaz compatible con la API de chat completions de OpenAI a través de vLLM con el plugin NeMo Speech.
- Capacidad de desactivar el modo thinking (`enable_thinking: False`) para transcripción directa.
- No se documenta soporte de tool calling, agentes ni multi-step reasoning; el modelo está orientado exclusivamente a ASR.
- Capacidad multilingüe limitada a kazajo y ruso; el code-switching kazajo-ruso dentro de una misma locución no se entrenó específicamente.

## Casos de uso

- Transcripción de reuniones y conversaciones en kazajo: el modelo acepta prompts que fijan el formato con puntuación, adecuado para actas y resúmenes posteriores, y su ventana de contexto de 65.536 tokens permite procesar clips largos en una sola petición.
- Subtitulado de vídeo en ruso: con WER del 9,21 % en FLEURS ru y timestamps por palabra vía CTC, se puede generar subtítulos sincronizados a nivel de palabra para plataformas de vídeo.
- Archivado y búsqueda de audio en kazajo: la transcripción verbatim con timestamps permite indexar grabaciones históricas o institucionales y habilitar búsqueda por texto sobre el contenido hablado.
- Atención al cliente en centros de contacto bilingües kazajo-ruso: el modelo transcribe llamadas en ambos idiomas con prompts específicos por idioma, útil para analítica de calidad y cumplimiento.
- Investigación lingüística sobre kazajo: al ser un modelo abierto con datos de entrenamiento públicos documentados (KSC2, FLEURS, Golos), sirve como base reproducible para estudios de ASR en lenguas de bajos recursos.
- Generación de datos etiquetados para entrenar modelos ASR más pequeños: las transcripciones con timestamps del modelo pueden usarse para pseudo-etiquetar audio no anotado y ampliar corpus en kazajo.
- Accesibilidad: transcripción en tiempo real de contenido audiovisual en kazajo y ruso para personas con discapacidad auditiva, desplegable con vLLM y el plugin NeMo Speech.

## Benchmarks y rendimiento

Resultados publicados por el autor en los conjuntos de test de FLEURS, con normalización NFC, minúsculas, ё→е, eliminación de puntuación y muletillas, y mapeo de letras latinas visualmente similares a cirílico. Decodificación greedy con `max_tokens` limitado a 30 × segundos de audio + 32.

| Conjunto de test | WER (%) | CER (%) |
|---|---:|---:|
| FLEURS kk test (856 locuciones) | 12,23 | 4,47 |
| FLEURS ru test (775 locuciones) | 9,21 | 6,37 |

Nota del autor: las referencias de FLEURS escriben los números con dígitos, mientras que el modelo suele escribirlos con palabras, lo que añade errores. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Pesos en BF16: 63 GB, según el autor.
- GPU recomendadas: una GPU de 80–141 GB de VRAM, como H100, H200 o RTX PRO 6000.
- No cabe en GPUs de consumo convencionales (RTX 4090 de 24 GB, RTX 3090 de 24 GB) en BF16; no se documentan cuantizaciones alternativas que redujeran el requisito.
- Despliegue: vLLM 0.32 con el plugin NeMo Speech (`VLLM_PLUGINS=nemo_speechlm`, `VLLM_USE_V2_MODEL_RUNNER=0`), con flags específicos como `--mamba-cache-mode none`, `--no-enable-prefix-caching` y el middleware `ctc_timestamp_middleware` para timestamps CTC.
- En GPUs con JIT de FlashInfer se pueden añadir `--use-replayssm --mamba-backend flashinfer` y flags de decodificación especulativa MTP para acelerar; el comando básico no requiere compilador CUDA.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. A continuación se comparan únicamente características estructurales conocidas.

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Tynda-ASR-kk-ru | 33,7 B (MoE) | kk, ru | 65.536 tokens | OpenMDW-1.1 | Fine-tune LoRA de Nemotron-3.5-Transcribe-30B-A4B |
| Nemotron-3.5-Transcribe-30B-A4B (base) | 30 B (A4B) | no disponible en esta ficha | no disponible en esta ficha | OpenMDW-1.1 | Modelo base de NVIDIA; sin kazajo específico |
| Alternativas ASR kk/ru | no disponible | no disponible | no disponible | no disponible | No se han identificado en la información proporcionada |

## Limitaciones y advertencias

- El kazajo conversacional con muchas vacilaciones ("ыыы", falsos arranques) es más difícil que el habla leída; el modelo puede repetir ocasionalmente una palabra o muletilla, por lo que conviene mantener el límite de `max_tokens` indicado por el autor.
- Los datos de entrenamiento en ruso estaban en minúsculas (Golos no tiene puntuación); la puntuación en ruso depende del modelo base y puede ser menos fiable.
- Los números suelen escribirse con palabras, lo que introduce errores frente a referencias que usan dígitos y afecta a las métricas reportadas.
- El code-switching kazajo-ruso dentro de una misma locución no se entrenó específicamente, por lo que su rendimiento en ese escenario es incierto.
- Riesgo de alucinación y de repeticiones en audio ruidoso o con solapamiento de hablantes; no se documentan mitigaciones específicas más allá del límite de tokens.
- Sesgos: no se documentan análisis de sesgo por género, acento o dialecto; el corpus KSC2 y Golos pueden no representar toda la variación dialectal del kazajo y el ruso.
- Licencia OpenMDW-1.1: es una licencia de pesos abiertos con condiciones; el uso comercial está permitido bajo sus términos, pero deben conservarse los textos de licencia y avisos en `LICENSE`, `THIRD_PARTY_NOTICES.md` y `licenses/`. No se ofrece garantía.
- Los datos de entrenamiento tienen licencias propias (KSC2 bajo CC BY 4.0; KSC2-Structured de InflexionLab; Golos y FLEURS con sus condiciones), que deben respetarse en cualquier redistribución derivada.
- El modelo requiere vLLM 0.32 con el plugin NeMo Speech y flags específicos; no es un despliegue estándar de transformers y exige verificar compatibilidad de versiones en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/baisalovar/Tynda-ASR-kk-ru
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- KSC2 (Kazakh Speech Corpus 2): https://doi.org/10.48342/m90y-aj02
- Referencia arXiv citada en los tags: https://arxiv.org/abs/2106.10161
