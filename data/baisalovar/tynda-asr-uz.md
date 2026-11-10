# baisalovar/Tynda-ASR-uz

## Resumen

Tynda-ASR-uz es un modelo de reconocimiento automático del habla (ASR) especializado en uzbeko, desarrollado por Raushan Baisalova (University of Waterloo) junto con el equipo UzbekVoice. Se trata de un fine-tune del modelo multimodal de NVIDIA Nemotron-3.5-Transcribe-30B-A4B, una arquitectura híbrida transformer-Mamba con mezcla de expertos (MoE) y aproximadamente 33.700 millones de parámetros totales. El modelo base no soporta uzbeko; este fine-tune añade dicha lengua entrenando exclusivamente con datos abiertos de habla uzbeka.

La relevancia del modelo radica en que cubre un hueco importante: el uzbeko es una lengua con recursos limitados y el modelo base tendía a transcribir el audio uzbeko como turco, con tasas de error superiores al 100 %. Tynda-ASR-uz reduce el WER a 18,62 % en el conjunto de test USC y a 18,86 % en FLEURS uz, manteniendo las capacidades del modelo base (marcas de tiempo a nivel de palabra mediante CTC y rama de diarización).

El modelo se distribuye con licencia OpenMDW-1.1, en formato safetensors para la librería NeMo, y está pensado para despliegue en servidores con GPU de gran capacidad (H100, H200 o RTX PRO 6000) mediante vLLM 0.32 con el plugin NeMo Speech.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida transformer-Mamba con mezcla de expertos (MoE), basada en Nemotron-3.5-Transcribe-30B-A4B |
| Parámetros totales | 33.697.781.029 |
| Parámetros activos | no disponible |
| Longitud de contexto | 65.536 tokens (configuración de servicio recomendada con `--max-model-len 65536`) |
| Tipos de cuantización | BF16 (pesos publicados); no se documentan otras cuantizaciones |
| Idiomas soportados | Uzbeko (solo escritura latina) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (librería NeMo) |

## Arquitectura y entrenamiento

El modelo parte de NVIDIA Nemotron-3.5-Transcribe-30B-A4B (revisión `c176676`), una arquitectura híbrida que combina capas transformer con capas Mamba y proyecciones de mezcla de expertos, orientada a tareas de transcripción de audio. Sobre esa base se aplicó un fine-tune con LoRA de rango 64 y α=128 sobre las proyecciones de atención, Mamba y MLP, además de entrenar por completo el encoder ASR y la proyección de audio. El entrenamiento usó learning rate 1e-4, 500 pasos de warmup, scheduler coseno, 4.000 pasos de 24.000 tokens en bf16 sobre una única GPU H200. El checkpoint publicado corresponde al paso 3.000, que obtuvo la menor pérdida de validación (el paso 4.000 queda a menos de 0,1 puntos de WER).

Los datos de entrenamiento suman aproximadamente 1.220 horas de habla uzbeka: 96 horas del USC (Uzbek Speech Corpus, muestreadas dos veces, transcripciones en minúsculas), 10 horas del split de entrenamiento de FLEURS uz (con puntuación) y 1.020 horas de UzbekVoice (crowdsourcing, unos 5.600 hablantes, mayoritariamente con puntuación). Solo se empleó uzbeko en escritura latina, unificando las variantes de apóstrofo (oʻ, gʻ, ʼ). Se eliminaron las frases de entrenamiento cuyo texto coincidía con frases de los splits dev/test de USC o FLEURS uz, garantizando que los conjuntos de evaluación no se usaron ni para entrenamiento ni para selección del modelo. La cabeza CTC de marcas de tiempo a nivel de palabra y la rama de diarización son las originales de NVIDIA, sin modificar.

## Capacidades

- Transcripción de audio a texto en uzbeko (escritura latina), con dos estilos de prompt: con puntuación y mayúsculas, o en minúsculas sin puntuación.
- Marcas de tiempo a nivel de palabra mediante la cabeza CTC heredada del modelo base, con metadatos en `model.safetensors`.
- Diarización de hablantes a través de la rama de diarización original de NVIDIA.
- Soporte de decodificación greedy con control de `max_tokens` en función de la duración del audio.
- Modo thinking desactivable mediante `enable_thinking: False` en el chat template.
- Procesamiento de audio codificado en base64 a través de la API compatible con OpenAI de vLLM.
- No se documenta soporte de tool calling, agentes ni otras modalidades además del audio.

## Casos de uso

- Transcripción de archivos de audio y vídeo en uzbeko: el modelo convierte grabaciones en texto con puntuación y mayúsculas usando el prompt de estilo correspondiente, adecuado para subtitulado y archivística.
- Generación de subtítulos con marcas de tiempo: la cabeza CTC permite alinear palabras con instantes concretos del audio, útil para subtitulado profesional y búsqueda dentro de vídeo.
- Diarización de reuniones y entrevistas: la rama de diarización heredada permite separar hablantes en grabaciones multitudinarias, aplicable a actas automáticas y análisis de conversaciones.
- Digitalización de corpus lingüísticos: con 65.536 tokens de contexto y capacidad de procesar clips largos, sirve para transcribir entrevistas de campo y material de investigación en uzbeko.
- Atención al cliente en uzbeko: transcripción de llamadas o mensajes de voz para su posterior análisis o enrutamiento, aunque limitado a habla leída y sin entrenamiento específico en cambio de código uzbeko-ruso.
- Investigación en ASR de lenguas de bajos recursos: el modelo, su receta de fine-tune y los conjuntos de evaluación documentados sirven como referencia para experimentos con otras lenguas túrquicas.
- Accesibilidad: conversión de contenido hablado en uzbeko a texto para personas con discapacidad auditiva, con la salvedad de que el rendimiento en habla espontánea o con ruido puede degradarse.

## Benchmarks y rendimiento

Resultados de WER / CER en porcentaje, normalizados (minúsculas, sin puntuación, variantes de apóstrofo unificadas), decodificación greedy y `max_tokens` limitado a 30 × segundos de audio + 32. Mismos clips, prompts y ajustes para ambos modelos.

| Conjunto de test | Tynda-ASR-uz | Nemotron-3.5-Transcribe (base) |
|---|---:|---:|
| USC test (3.835 enunciados) | 18,62 / 4,98 | 107,96 / 55,03 |
| FLEURS uz test (861 enunciados) | 18,86 / 6,01 | 118,51 / 66,14 |

El modelo base transcribe mayoritariamente el uzbeko como turco; por ejemplo, la referencia «Yunonistondagi bilim pasayishi bilan Gʻarb oʻzining grek falsafiy va ilmiy negizlaridan uzilib qoldi.» se convierte en «Yunanistan'daki bilim pasayı şubelerine harap uzun Grek felsefi ve ilmi ne gizlerden uzulup kaldı.» con el modelo base, mientras que Tynda-ASR-uz produce «Yunonistondagi bilim pasayish bilan Gʻarb oʻzining grek falsafiy va ilmiy negizlaridan uzilib qoldi». El autor indica que aún no ha comparado el modelo con otros sistemas ASR de uzbeko en estos conjuntos de test.

## Requisitos de hardware

- Pesos en BF16: 63 GB, según la model card.
- GPU recomendadas: una GPU de 80-141 GB de VRAM (H100, H200 o RTX PRO 6000).
- No cabe en GPU de consumo convencionales (RTX 4090, 24 GB) con los pesos en BF16 publicados; no se documentan cuantizaciones alternativas.
- Despliegue mediante vLLM 0.32 con el plugin NeMo Speech (`VLLM_PLUGINS=nemo_speechlm`), con opciones específicas: `--max-model-len 65536`, `--enable-chunked-prefill`, `--no-enable-prefix-caching`, `--mamba-cache-mode none`, `--mm-processor-cache-gb 0`, `--no-async-scheduling`, `--reasoning-parser nemotron_v3`, `--trust-request-mm-kwargs` y el middleware `ctc_timestamp_middleware` para marcas de tiempo CTC.
- El entrenamiento se realizó en una sola H200, lo que da una idea del perfil de memoria requerido.
- No se publican datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | WER USC test |
|---|---:|---|---|---|---:|
| Tynda-ASR-uz | 33,7 B (MoE) | 65.536 | Uzbeko (latino) | OpenMDW-1.1 | 18,62 |
| Nemotron-3.5-Transcribe-30B-A4B (base) | ~30 B (A4B, MoE) | 65.536 | Multilingüe, sin uzbeko | OpenMDW-1.1 | 107,96 |
| Otros ASR de uzbeko | no disponible | no disponible | no disponible | no disponible | no disponible |

El autor no ha publicado comparaciones con otros sistemas ASR específicos para uzbeko, por lo que no hay datos disponibles para una comparativa más amplia.

## Limitaciones y advertencias

- Solo admite uzbeko en escritura latina; el uzbeko en cirílico quedó excluido del entrenamiento.
- Los datos de entrenamiento son mayoritariamente habla leída (USC, UzbekVoice); el habla espontánea y el audio con ruido pueden ser más difíciles.
- Los números suelen escribirse como palabras en la transcripción.
- El cambio de código uzbeko-ruso no se entrenó específicamente.
- No se ha comparado todavía con otros modelos ASR de uzbeko en estos conjuntos de test.
- Riesgo de alucinación y de errores de normalización en audio fuera de dominio, dado que el modelo base tendía a generar texto en otro idioma túrquico.
- La licencia OpenMDW-1.1 impone obligaciones de atribución y conservación de avisos; el modelo es un derivado de NVIDIA Nemotron-3.5-Transcribe-30B-A4B y se distribuye bajo la misma licencia, sin garantía.
- El uso de datos USC exige mantener la declaración de atribución a ISSAI y TUIT si se construye un producto sobre el modelo.
- El despliegue requiere GPU de 80-141 GB y una configuración específica de vLLM; no hay soporte documentado para llama.cpp, Ollama ni TGI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/baisalovar/Tynda-ASR-uz
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- USC — Uzbek Speech Corpus (ISSAI y TUIT): https://doi.org/10.48342/drss-8q87
- FLEURS (Conneau et al., 2022): no disponible enlace directo en la información proporcionada
