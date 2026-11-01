# aididian/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B

## Resumen

NVIDIA-Nemotron-3.5-Transcribe-30B-A4B es un modelo de voz y audio de pesos abiertos desarrollado por NVIDIA para transcripción multilingüe, traducción de voz, diarización con atribución de hablante, transcripción contextual, predicción de timestamps, identificación de idioma y respuesta a preguntas sobre audio. Se trata de un Speech-Augmented Language Model (SALM) construido sobre el modelo base NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16, al que se añade un codificador de audio paralelo que combina un encoder ASR de tipo Transformer y un encoder de hablante.

La arquitectura es un híbrido Mamba-2–Transformer con mezcla de expertos (MoE): 34.000 millones de parámetros totales, de los cuales aproximadamente 4.300 millones están activos por token, incluyendo el codificador de audio. Soporta un contexto de 65.536 tokens y grabaciones de hasta una hora de duración, lo que lo sitúa en la categoría de modelos de transcripción de formato largo con instrucciones en lenguaje natural.

Es relevante ahora porque unifica en un solo modelo tareas que tradicionalmente requerían pipelines separados (ASR, diarización, LID, traducción y QA sobre audio), con licencia OpenMDW-1.1 que permite uso comercial, y con variantes en BF16, FP8 y NVFP4 para despliegue eficiente. La ficha que nos ocupa corresponde a la réplica publicada por el usuario `aididian` bajo el identificador `aididian/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B`, derivada del modelo oficial de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrido Mamba-2–Transformer con Mixture of Experts y Parallel Expert Encoder (encoder ASR Transformer + encoder de hablante) |
| Parametros totales | 33.697.781.029 (≈34B), incluyendo el codificador de audio |
| Parametros activos | ≈4,3B por token (incluyendo el encoder de audio) |
| Longitud de contexto | 65.536 tokens; audio de hasta 1 hora |
| Tipos de cuantizacion | BF16 (referencia), FP8 y NVFP4 (variantes oficiales publicadas por NVIDIA) |
| Idiomas soportados | 40 idiomas: cs, nl, en, fr, de, hi, it, ko, pl, pt, ru, sk, es, bg, hr, da, et, fi, hu, ja, lv, lt, ro, sl, sv, th, tr, uk, ar, bn, zh, el, he, id, mt, mr, tl, ta, te, vi |
| Licencia | OpenMDW-1.1 (uso comercial y no comercial permitido) |
| Formato de pesos | safetensors (librería `nemo`, arquitectura `nemo_speechlm`) |

## Arquitectura y entrenamiento

El modelo combina un backbone de lenguaje híbrido Mamba-2–Transformer con mezcla de expertos, heredado de Nemotron-3.5-Lightning-30B-A3B, y un Parallel Expert Encoder que procesa la señal de audio mediante dos ramas: un encoder ASR de tipo Transformer y un encoder de hablante. Esta separación permite que el modelo realice transcripción y diarización de forma conjunta, atribuyendo cada segmento al hablante correspondiente sin necesidad de un pipeline externo de speaker diarization.

El entrenamiento se realizó sobre el dataset NVIDIA Granary-v2, una mezcla multilingüe de audio y texto que incluye tareas de transcripción, traducción de voz, transcripción contextual, predicción de timestamps, identificación de idioma, code-switching, respuesta a preguntas sobre audio e instruction following. La model card menciona además una pequeña proporción de tareas de seguimiento de instrucciones en texto y de etiquetado/redacción de PII. No se detalla en la información disponible el número exacto de tokens de entrenamiento ni la composición porcentual del dataset, ni si se aplicaron etapas de RLHF o DPO.

La innovación principal es la unificación de tareas de voz en un único SALM con contexto de 65.536 tokens, lo que permite procesar grabaciones de hasta una hora sin chunking manual, y la disponibilidad de pesos en BF16, FP8 y NVFP4 para reducir los requisitos de memoria en inferencia.

## Capacidades

- Transcripción multilingüe en 40 idiomas, con soporte de code-switching (cambio de idioma dentro de una misma grabación).
- Traducción de voz (speech translation) directamente desde el audio.
- Diarización con atribución de hablante: identifica quién habla en cada segmento.
- Transcripción contextual: acepta contexto textual (por ejemplo, vocabulario específico del dominio) para mejorar el reconocimiento.
- Transcripción enriquecida (rich transcription) con predicción de timestamps.
- Identificación de idioma (language identification) por segmento.
- Respuesta a preguntas sobre audio (audio question answering).
- Seguimiento de instrucciones en lenguaje natural para controlar el estilo y formato de la salida.
- Etiquetado y redacción de PII (información personal identificable).
- Procesamiento de audio de formato largo: grabaciones de hasta una hora en una sola pasada gracias al contexto de 65.536 tokens.
- Capacidad limitada de instruction following en texto, incluida en la mezcla de entrenamiento.

## Casos de uso

- Transcripción de reuniones y actas: el modelo procesa grabaciones de hasta una hora en una sola pasada, con diarización y timestamps, lo que permite generar actas con atribución de intervenciones sin pipelines adicionales.
- Subtitulado y traducción de contenido audiovisual: la combinación de ASR, timestamps y speech translation permite generar subtítulos traducidos a otro idioma directamente desde el audio.
- Atención al cliente y análisis de llamadas: la transcripción con diarización y etiquetado de PII facilita el análisis de conversaciones multi-turno y el cumplimiento normativo al redactar datos sensibles.
- Documentación clínica y legal: la transcripción contextual permite introducir vocabulario específico del dominio (términos médicos o jurídicos) para mejorar la precisión en dictados y audiencias.
- Investigación cualitativa y análisis de entrevistas: el soporte de 40 idiomas y code-switching permite transcribir entrevistas multilingües con identificación de hablante y marcas temporales.
- Indexación y búsqueda de archivos de audio: la transcripción en formato largo con timestamps permite construir índices buscables sobre archivos de audio y vídeo de una hora.
- Asistentes de voz y QA sobre audio: la capacidad de audio question answering permite responder preguntas concretas sobre el contenido de una grabación sin transcribirla completa.
- Moderación y cumplimiento: el etiquetado de PII y la identificación de idioma facilitan la clasificación y el filtrado de contenido en plataformas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 67,4 GB solo para pesos (33,7B parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica requiere GPUs de 80 GB (A100 80GB, H100 80GB) o múltiples GPUs.
- VRAM estimada en FP8: aproximadamente 33,7 GB para pesos, viable en una A100 40GB o H100 40GB, con margen limitado para activaciones y contexto largo.
- VRAM estimada en NVFP4: aproximadamente 17 GB para pesos, lo que abre la puerta a GPUs consumer de gama alta con 24 GB (RTX 4090, RTX 5090) o profesionales con 24-48 GB.
- GPU recomendadas: H100 80GB o A100 80GB para BF16; A100 40GB, H100 40GB o L40S para FP8; RTX 4090/5090 (24 GB) para NVFP4.
- Despliegue: la librería oficial es NeMo (`nemo_speechlm`); la model card referencia SGLang-Omni como opción de serving. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Transcribe-30B-A4B | 34B totales / 4,3B activos | 65.536 tokens; audio hasta 1 h | 40 | OpenMDW-1.1 | ASR + traducción + diarización + QA audio en un solo modelo |
| Whisper large-v3 (OpenAI) | ≈1,55B | 30 s por ventana (sin contexto largo nativo) | ≈99 | MIT | ASR clásico sin diarización ni QA; requiere chunking para audio largo |
| Qwen2-Audio (Alibaba) | ≈8,2B | contexto limitado, no orientado a audio de 1 h | multilingüe (no especificado en esta ficha) | Apache 2.0 | Audio understanding y QA, no especializado en transcripción de formato largo |
| SeamlessM4T v2 (Meta) | ≈2,3B | no orientado a audio de 1 h | ≈100 | CC-BY-NC 4.0 | Traducción de voz y texto; licencia no comercial |

La comparativa se basa en características públicas de cada familia de modelos; no se dispone de resultados de benchmarks comparativos en la información proporcionada.

## Limitaciones y advertencias

- Modelo offline: procesa grabaciones completas, no está diseñado para transcripción en streaming de baja latencia.
- Riesgo de alucinación en pasajes de audio con ruido, solapamiento de hablantes o música de fondo; la salida debe validarse en producción.
- La diarización y la atribución de hablante pueden degradarse con voces similares o solapamientos frecuentes.
- El rendimiento por idioma no es homogéneo: los 40 idiomas soportados no implican la misma calidad en todos ellos; no se publican métricas desagregadas en la información disponible.
- El etiquetado de PII es una capacidad auxiliar entrenada con una proporción pequeña del dataset; no debe usarse como único mecanismo de cumplimiento normativo.
- Licencia OpenMDW-1.1: permite uso comercial, pero conviene revisar sus términos completos antes de desplegar en producción.
- El repositorio analizado es una réplica de usuario (`aididian/...`), no el repositorio oficial de NVIDIA; para producción se recomienda usar los pesos oficiales `nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B` en BF16, FP8 o NVFP4.
- Requiere la librería NeMo y su stack asociado; la integración con ecosistemas de serving alternativos no está confirmada en la información disponible.
- No se detallan en la información disponible los sesgos demográficos o lingüísticos específicos del modelo.

## Enlaces

- Repositorio analizado en HuggingFace: https://huggingface.co/aididian/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- Modelo oficial BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- Variante FP8: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-FP8
- Variante NVFP4: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-NVFP4
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Página de desarrollador Nemotron: https://developer.nvidia.com/nemotron
- Repositorio NeMo Speech: https://github.com/NVIDIA-NeMo/Speech
- Informe técnico: https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3.5-Transcribe-Technical-Report.pdf
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/nvidia/nemotron-transcribe
- Cookbook de SGLang-Omni: https://sgl-project.github.io/sglang-omni/cookbook/nemotron_transcribe.html
- Dataset Granary-v2: https://huggingface.co/datasets/nvidia/Granary-v2
- Paper SALM: https://arxiv.org/abs/2310.09424
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Discord NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
