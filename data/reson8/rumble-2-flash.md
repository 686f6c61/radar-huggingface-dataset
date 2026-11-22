# Reson8/Rumble-2-Flash

## Resumen

Rumble-2-Flash es un modelo de reconocimiento automatico del habla (ASR) desarrollado por Reson8, un fine-tuning del modelo base Qwen/Qwen3-ASR-0.6B. Con 508.631.552 parametros reales (etiquetado como 0.5B), esta disenado para transcripcion de audio multilingue en 45 idiomas, incluyendo espanol, ingles, aleman, frances, chino, japones, arabe e hindi, entre otros. El modelo se distribuye bajo licencia Apache 2.0 y es compatible de forma nativa con Hugging Face Transformers y vLLM.

La relevancia de este modelo radica en su combinacion de tamano reducido (0.5B parametros) con un rendimiento competitivo en el Open ASR Leaderboard, donde alcanza un WER promedio de 6.60 en la pista de ingles con un RTFx de 6338 sobre una GPU H200. Esto lo posiciona como una opcion atractiva para despliegues en produccion donde el coste computacional y la latencia importan, sin sacrificar cobertura linguistica.

El modelo hereda la arquitectura Qwen3-ASR y anade opciones de transcripcion configurables (digitos, fillers, verbatim, deteccion automatica de idioma) que lo hacen flexible para distintos casos de uso. Su integracion con vLLM permite servirlo como endpoint compatible con la API de OpenAI, facilitando su adopcion en pipelines existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-ASR (transformer multimodal audio-texto) |
| Parametros totales | 508.631.552 (0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (vLLM recomienda `--max-model-len 4096`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 45: af, ar, bn, bs, ca, ceb, cs, da, de, el, en, es, eu, fa, fi, fil, fr, hi, hr, hu, id, is, it, ja, ko, lt, lv, mk, ms, mt, nb, nl, pl, pt, ro, ru, sq, sr, sv, th, tr, uk, vi, yue, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Rumble-2-Flash es un fine-tuning del modelo Qwen/Qwen3-ASR-0.6B, que emplea una arquitectura transformer multimodal disenada para el procesamiento conjunto de audio y texto. El modelo base Qwen3-ASR combina un encoder de audio con un decoder de lenguaje, permitiendo la transcripcion condicionada por prompt e idioma. El fine-tuning realizado por Reson8 se orienta a mejorar el rendimiento en tareas de reconocimiento automatico del habla multilingue y a anadir opciones de configuracion de la transcripcion.

La model card no proporciona detalles sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. Tampoco se especifican innovaciones tecnicas adicionales mas alla de las heredadas del modelo base. La informacion disponible se limita a los resultados de evaluacion en el Open ASR Leaderboard (release 18-11-2026, v1.16.1), ejecutados con vLLM sobre una GPU H200.

## Capacidades

- Reconocimiento automatico del habla (ASR) en 45 idiomas, con deteccion automatica de idioma si no se especifica.
- Transcripcion condicionada por idioma: se puede forzar el idioma usando su nombre en ingles (por ejemplo, `"Spanish"`, `"Dutch"`).
- Control de formato de salida: numeros como digitos o palabras (`digits`), conservacion de muletillas (`filler`), colapso de palabras repetidas (`verbatim`).
- Procesamiento de audio desde ruta local, URL, array de NumPy o lista de estos.
- Integracion nativa con Hugging Face Transformers mediante `AutoProcessor` y `AutoModelForMultimodalLM`.
- Soporte de servido con vLLM como endpoint compatible con la API de OpenAI (chat completions con audio en base64).
- Capacidad de devolver la transcripcion en formato `transcription_only` o `parsed` (incluyendo el idioma detectado).
- No se mencionan capacidades de tool calling, agentes, vision ni audio generation.

## Casos de uso

- **Transcripcion de reuniones y actas**: el modelo puede procesar audio de reuniones multilingues y generar transcripciones con control de digitos y verbatim, adecuado para equipos distribuidos en varios paises gracias a sus 45 idiomas.
- **Subtitulado automatico de video**: con un RTFx de hasta 7308 en SPGISpeech, puede transcribir grandes volumenes de audio en poco tiempo, lo que lo hace viable para pipelines de generacion de subtitulos en plataformas de contenido.
- **Atencion al cliente basada en voz**: integrado mediante vLLM como endpoint compatible con OpenAI, puede transcribir llamadas o mensajes de voz en tiempo real para su posterior analisis o enrutamiento, con deteccion automatica de idioma para clientes internacionales.
- **Analisis de encuestas y entrevistas**: la opcion `verbatim=false` permite colapsar repeticiones y obtener transcripciones limpias para analisis cualitativo, mientras que `filler=true` conserva muletillas cuando se necesita fidelidad literal.
- **Accesibilidad y dictado**: puede emplearse en aplicaciones de dictado por voz o generacion de subtitulos en directo para personas con discapacidad auditiva, con soporte para espanol, catalan, euskera y gallego (si bien el gallego no figura en la lista de idiomas; el catalan y el euskera si).
- **Investigacion linguistica**: la cobertura de 45 idiomas, incluyendo lenguas de bajos recursos como cebuano, filipino, maltes o yue, permite estudios comparativos de ASR en contextos multilingues.
- **Moderacion de contenido en audio**: transcripcion rapida de audio subido por usuarios para deteccion de contenido inapropiado, aprovechando el bajo coste de un modelo de 0.5B y su compatibilidad con vLLM.

## Benchmarks y rendimiento

Resultados publicados en el Open ASR Leaderboard (release 18-11-2026, v1.16.1), ejecutados con vLLM sobre una GPU H200.

### Pista de ingles

WER promedio: **6.60** (RTFx 6338).

| Split | WER (%) | RTFx |
|---|---|---|
| AMI | 9.24 | 4245 |
| Earnings22 | 6.45 | 4811 |
| GigaSpeech | 7.56 | 5978 |
| SPGISpeech | 3.08 | 7308 |
| URGENT24 | 10.25 | 3314 |
| Voice Arena Monsoon | 3.56 | 3760 |
| VoxPopuli | 2.43 | 4222 |
| Private (scripted) | 3.71 | no disponible |
| Private (conversational) | 13.14 | no disponible |

### Pista multilingue

WER (%) por idioma y dataset; chino es CER. La ultima columna es el promedio del leaderboard para el idioma.

| Idioma | FLEURS | Common Voice | MLS | Voice Arena Monsoon | AISHELL-1 | Promedio |
|---|---|---|---|---|---|---|
| Aleman | 4.77 | 6.28 | | | | **5.52** |
| Espanol | 2.82 | 4.33 | 4.04 | | | **3.73** |
| Frances | 5.95 | 10.01 | 5.66 | | | **7.21** |
| Italiano | 2.53 | 4.84 | 7.90 | | | **5.09** |
| Neerlandes | 6.05 | 4.92 | 9.38 | | | **6.78** |
| Portugues | 5.31 | | 7.61 | | | **6.46** |
| Hindi | | | | 14.11 | | **14.11** |
| Chino (CER) | 5.82 | | | | 7.31 | **6.56** |

No se han publicado resultados comparativos directos con otros modelos en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma explicita. Con 508.631.552 parametros en safetensors (4.4 GB de repo), en precision completa (fp32) requeriria aproximadamente 2 GB solo para pesos, mas overhead de activaciones y buffers de audio; en fp16/bf16 seria aproximadamente 1 GB para pesos. La VRAM total depende del backend y la longitud de audio.
- **GPU recomendadas**: los benchmarks se ejecutaron en una NVIDIA H200. Por el tamano del modelo, deberia caber en GPUs consumer como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070, RTX 4080 y RTX 4090, asi como en A100, H100 y L40S, siempre que el backend lo soporte.
- **Cabe en GPU consumer**: si, previsiblemente en cualquier GPU con al menos 4-6 GB de VRAM, aunque no se confirma en la model card.
- **Opciones de despliegue**: Hugging Face Transformers (`AutoModelForMultimodalLM`), vLLM (`vllm serve Reson8/Rumble-2-Flash --max-model-len 4096`). No se mencionan llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: RTFx reportado entre 3314 (URGENT24) y 7308 (SPGISpeech) en H200 con vLLM, lo que indica un throughput alto. No se proporcionan latencias absolutas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Rendimiento ASR |
|---|---|---|---|---|---|---|
| **Rumble-2-Flash** | 0.5B | no disponible | 45 | Apache 2.0 | safetensors | WER 6.60 (ingles), 3.73 (espanol) |
| Qwen/Qwen3-ASR-0.6B (base) | 0.6B | no disponible | no disponible | no disponible | safetensors | no disponible |
| Whisper large-v3 | 1.55B | 30 s audio | ~99 | MIT | safetensors, GGUF | no disponible en esta ficha |
| Whisper small | 244M | 30 s audio | ~99 | MIT | safetensors, GGUF | no disponible en esta ficha |

No se dispone de datos de benchmarks de los modelos alternativos en la informacion proporcionada, por lo que la comparacion de rendimiento no puede completarse con cifras. La comparativa se limita a parametros, licencia y cobertura linguistica.

## Limitaciones y advertencias

- **Sesgos conocidos**: no se documentan sesgos especificos en la model card. Al ser un fine-tuning de Qwen3-ASR, podria heredar sesgos del modelo base y de los datos de entrenamiento, no detallados.
- **Riesgo de alucinacion**: como todo modelo generativo, puede producir transcripciones incorrectas o inventar texto en segmentos de audio con ruido, silencios o habla solapada. El WER en conversacional privado (13.14%) es notablemente superior al de scripted (3.71%), lo que indica mayor fragilidad en audio espontaneo.
- **Limitaciones de contexto o idioma**: la longitud de contexto no se especifica; vLLM recomienda `--max-model-len 4096`, lo que sugiere un limite practico para audios largos. La cobertura de 45 idiomas no incluye gallego ni otras lenguas ibericas distintas del catalan y el euskera. El rendimiento en hindi (14.11% WER) es considerablemente peor que en lenguas europeas.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indiquen los cambios. No se especifican restricciones adicionales.
- **Caveats para produccion**: no se documentan requisitos de normalizacion de audio, manejo de silencios ni limites de duracion por peticion. La ausencia de datos sobre cuantizacion limita las opciones de optimizacion. El uso de `AutoModelForMultimodalLM` requiere una version de Transformers que soporte dicha clase. La integracion con vLLM requiere `vllm[audio]`.

## Enlaces

- Hugging Face: https://huggingface.co/Reson8/Rumble-2-Flash
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Open ASR Leaderboard: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard?version=1.16.1
- Vista multilingue del leaderboard: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard?languages=Reson8%2FRumble-2-Flash&proprietary=false
- Audio de ejemplo: https://hf.co/datasets/hf-internal-testing/dummy-audio-samples/resolve/main/bcn_weather.mp3
