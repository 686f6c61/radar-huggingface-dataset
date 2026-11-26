# baisalovar/Tynda-ASR-uz

## Resumen

Tynda-ASR-uz es un modelo de reconocimiento automático del habla (ASR) especializado en uzbeko, desarrollado por Raushan Baisalova (University of Waterloo) junto con el equipo UzbekVoice. Se trata de un ajuste fino del modelo multimodal NVIDIA Nemotron-3.5-Transcribe-30B-A4B, que originalmente no soporta uzbeko: al transcribir audio en este idioma, el modelo base tiende a producir texto en turco. Tynda-ASR-uz corrige ese comportamiento y añade capacidad real de transcripción en uzbeko en escritura latina.

El modelo parte de una arquitectura híbrida de tipo SpeechLM con mezcla de expertos (MoE), con 33.697.781.029 parámetros totales y aproximadamente 4.000 millones de parámetros activos por token (según la nomenclatura A4B del modelo base). El ajuste se realizó sobre unas 1.220 horas de audio en uzbeko procedente de tres corpus abiertos, mediante LoRA de rango 64 sobre las proyecciones de atención, Mamba y MLP, además de entrenamiento completo del codificador ASR y de la proyección de audio.

Su relevancia actual radica en que cubre un idioma de bajos recursos con un modelo de gran tamaño y contexto largo (hasta 65.536 tokens según la configuración de servicio recomendada), algo poco habitual en ASR para uzbeko. La licencia OpenMDW-1.1 y la disponibilidad de pesos en safetensors facilitan su uso tanto en investigación como en productos comerciales, con obligación de atribución a los corpus de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SpeechLM híbrida (transformer + Mamba) con mezcla de expertos (MoE), basada en NVIDIA Nemotron-3.5-Transcribe-30B-A4B |
| Parametros totales | 33.697.781.029 |
| Parametros activos | Aproximadamente 4.000 millones (nomenclatura A4B del modelo base; no se detalla el reparto exacto) |
| Longitud de contexto | Hasta 65.536 tokens en la configuración de servicio recomendada (`--max-model-len 65536`) |
| Tipos de cuantizacion | No disponible (el autor solo documenta pesos en bf16) |
| Idiomas soportados | Uzbeko (escritura latina únicamente) |
| Licencia | OpenMDW-1.1 (derivada de NVIDIA Nemotron-3.5-Transcribe-30B-A4B) |
| Formato de pesos | safetensors (formato NeMo; incluye metadatos de la cabeza CTC de timestamps) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Nemotron-3.5-Transcribe-30B-A4B de NVIDIA: un SpeechLM que combina capas de atención con capas Mamba y una mezcla de expertos, con un codificador de audio y una proyección que conecta el audio con el espacio del modelo de lenguaje. Conserva sin cambios la cabeza CTC de timestamps a nivel de palabra y la rama de diarización del modelo original, con los metadatos CTC incluidos en `model.safetensors`.

El ajuste fino se realizó sobre la revisión `c176676` del modelo base con aproximadamente 1.220 horas de audio en uzbeko: 96 horas del USC (Uzbek Speech Corpus, muestreadas dos veces, transcripciones en minúsculas), 10 horas del split de entrenamiento de FLEURS uz (transcripciones con puntuación) y 1.020 horas de UzbekVoice (crowd-sourcing con unos 5.600 hablantes, mayoritariamente con puntuación). Se aplicó LoRA con r=64 y α=128 sobre las proyecciones de atención, Mamba y MLP, además de entrenar por completo el codificador ASR y la proyección de audio. La configuración fue learning rate 1e-4, 500 pasos de warmup, scheduler coseno, 4.000 pasos de 24.000 tokens, precisión bf16 y una única GPU H200. El checkpoint publicado corresponde al paso 3.000, el de menor pérdida de validación (el paso 4.000 queda a menos de 0,1 puntos de WER). Solo se empleó uzbeko en escritura latina, con unificación de las variantes de apóstrofo (oʻ, o', o‘).

## Capacidades

- Transcripción de voz a texto en uzbeko con escritura latina, con dos estilos de prompt: con puntuación y mayúsculas, o en minúsculas sin puntuación.
- Salida de transcripción con marcas de tiempo a nivel de palabra mediante la cabeza CTC heredada del modelo base.
- Diarización de hablantes a través de la rama de diarización de NVIDIA, sin modificar.
- Procesamiento de audio de duración variable con contexto largo (hasta 65.536 tokens en la configuración recomendada), lo que permite clips extensos.
- Modo de razonamiento desactivable mediante `enable_thinking: False` en el template de chat.
- Soporte de servicio mediante API compatible con OpenAI a través de vLLM con el plugin NeMo Speech.
- No soporta otros idiomas ni la escritura cirílica del uzbeko.

## Casos de uso

- Transcripción de archivos audiovisuales en uzbeko: el modelo puede procesar clips largos gracias a la ventana de contexto de 65.536 tokens y devolver transcripciones con puntuación, adecuado para subtitulado y archivística de medios.
- Generación de subtítulos con marcas de tiempo: la cabeza CTC permite obtener timestamps por palabra, útil para sincronizar subtítulos en plataformas de vídeo.
- Documentación de reuniones y entrevistas: con la rama de diarización se pueden separar hablantes en grabaciones multi-participante, aunque el autor advierte que el habla espontánea es más difícil que la lectura.
- Investigación lingüística sobre uzbeko: corpus transcritos a partir de audio de campo, con la ventaja de que el modelo está entrenado sobre datos abiertos y su comportamiento es reproducible con los prompts documentados.
- Accesibilidad: transcripción de audio a texto para personas con discapacidad auditiva en contenidos en uzbeko, desplegando el modelo en un servicio vLLM interno.
- Automatización de atención al cliente por voz: integración en pipelines de ASR para centros de contacto en uzbeko, con la advertencia de que el habla ruidosa y la alternancia uzbeko-ruso no están específicamente entrenadas.
- Evaluación comparativa de ASR para lenguas túrquicas: el modelo sirve como referencia de ajuste fino de un SpeechLM grande sobre un idioma de bajos recursos, con los splits de test de USC y FLEURS documentados.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, con WER / CER en porcentaje, texto normalizado (minúsculas, sin puntuación, variantes de apóstrofo unificadas), decodificación greedy y `max_tokens` limitado a 30 × segundos de audio + 32.

| Conjunto de test | Tynda-ASR-uz | Nemotron-3.5-Transcribe (base) |
|---|---:|---:|
| USC test (3.835 enunciados) | 18,62 / 4,98 | 107,96 / 55,03 |
| FLEURS uz test (861 enunciados) | 18,86 / 6,01 | 118,51 / 66,14 |

El autor indica que los splits de test de USC y FLEURS nunca se usaron para entrenamiento ni selección del modelo, y que se eliminaron las frases de entrenamiento idénticas a frases de dev/test de esos corpus. No se han publicado comparaciones con otros modelos ASR de uzbeko en la información disponible.

## Requisitos de hardware

- Pesos en bf16: 63 GB, según el autor.
- GPU recomendadas: una GPU de 80 a 141 GB de VRAM, como H100, H200 o RTX PRO 6000.
- No cabe en GPU de consumo convencionales (RTX 4090 de 24 GB, RTX 3090 de 24 GB) en bf16; no se documentan cuantizaciones alternativas.
- Despliegue recomendado: vLLM 0.32 con el plugin NeMo Speech (`VLLM_PLUGINS=nemo_speechlm`, `VLLM_USE_V2_MODEL_RUNNER=0`), con `--dtype bfloat16`, `--max-model-len 65536`, `--enable-chunked-prefill`, `--mamba-cache-mode none`, `--no-enable-prefix-caching` y el middleware de timestamps CTC.
- El entrenamiento se realizó en una sola H200; no se publican datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tynda-ASR-uz | 33,7 mil millones (MoE, ~4 mil millones activos) | 65.536 tokens | Uzbeko (latino) | OpenMDW-1.1 | Hugging Face, pesos safetensors |
| NVIDIA Nemotron-3.5-Transcribe-30B-A4B | 33,7 mil millones (MoE, ~4 mil millones activos) | 65.536 tokens (misma configuración) | Multilingüe, sin uzbeko | OpenMDW-1.1 | Hugging Face |
| Otros modelos ASR para uzbeko | No disponible | No disponible | Uzbeko | No disponible | No disponible |

El autor señala explícitamente que aún no ha comparado Tynda-ASR-uz con otros modelos ASR de uzbeko en estos conjuntos de test.

## Limitaciones y advertencias

- Solo cubre uzbeko en escritura latina; el uzbeko en cirílico quedó excluido del entrenamiento.
- Los datos de entrenamiento son mayoritariamente habla leída (USC, UzbekVoice); el habla espontánea y el audio con ruido pueden degradar el rendimiento.
- Los números suelen transcribirse como palabras, no como cifras.
- La alternancia de código uzbeko-ruso no se entrenó específicamente.
- No hay comparación publicada con otros modelos ASR de uzbeko, por lo que la posición relativa del modelo en el estado del arte no está establecida.
- Riesgo de alucinación inherente a los modelos generativos de audio a texto; conviene validar las transcripciones en producción.
- La licencia OpenMDW-1.1 impone obligaciones de atribución y conservación de avisos; el uso comercial está permitido bajo sus términos, pero debe revisarse el texto completo en `LICENSE` y `THIRD_PARTY_NOTICES.md`.
- Si se construye un producto sobre el modelo, el autor pide mantener la atribución al USC de ISSAI y TUIT: "Our product uses ISSAI and TUIT Uzbek Speech Corpus (https://doi.org/10.48342/drss-8q87), which is available under a Creative Commons Attribution 4.0 International License."
- El modelo se distribuye sin garantía.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/baisalovar/Tynda-ASR-uz
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- USC — Uzbek Speech Corpus (ISSAI y TUIT): https://doi.org/10.48342/drss-8q87
- FLEURS (Google, Conneau et al., 2022): no disponible en la información proporcionada
- Repositorio o demo de UzbekVoice: no disponible en la información proporcionada
