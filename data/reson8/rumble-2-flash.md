# Reson8/Rumble-2-Flash

## Resumen

Rumble-2-Flash es un modelo de reconocimiento automático del habla (ASR) desarrollado por Reson8, publicado bajo licencia Apache 2.0. Con 508.631.552 parámetros (aproximadamente 0,5B), se posiciona como una alternativa compacta y eficiente para transcripción multilingüe, con soporte nativo para Hugging Face Transformers y vLLM. El modelo emplea la arquitectura `qwen3_asr` y está etiquetado como `qwen3-asr`, lo que sugiere una base derivada de la familia Qwen3 adaptada a la modalidad de audio.

El modelo cubre 45 idiomas, entre ellos español, inglés, alemán, francés, italiano, portugués, chino, japonés, coreano, árabe, hindi y una amplia representación de lenguas europeas y asiáticas. Su diseño prioriza el rendimiento en producción: en la Open ASR Leaderboard (release 18-11-2026, v1.16.1) obtiene un WER medio de 6,60 en la pista inglesa con un RTFx de 6338 sobre una H200 con vLLM, lo que indica un throughput muy elevado para su tamaño.

La relevancia actual de Rumble-2-Flash radica en su combinación de tamaño reducido, cobertura lingüística amplia y licencia permisiva, lo que facilita su despliegue en entornos con recursos limitados y su integración en pipelines de transcripción a gran escala sin las restricciones de modelos propietarios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen3_asr (transformer multimodal audio-texto, según tags) |
| Parámetros totales | 508.631.552 (≈0,5B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de vLLM usa `--max-model-len 4096`) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | 45: af, ar, bn, bs, ca, ceb, cs, da, de, el, en, es, eu, fa, fi, fil, fr, hi, hr, hu, id, is, it, ja, ko, lt, lv, mk, ms, mt, nb, nl, pl, pt, ro, ru, sq, sr, sv, th, tr, uk, vi, yue, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible indica que Rumble-2-Flash se basa en la arquitectura `qwen3_asr`, orientada a la transcripción de audio a texto mediante un procesador multimodal (`AutoProcessor` + `AutoModelForMultimodalLM`). El modelo acepta audio como entrada (ruta local, URL, array NumPy o lista de estos) y genera transcripciones, con detección automática de idioma si no se fuerza uno explícito. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

El modelo expone opciones de transcripción configurables a través de `chat_template_kwargs` (o directamente en `processor.apply_chat_template`): `language` (forzar idioma por nombre en inglés), `digits` (números como dígitos o palabras, por defecto `true`), `filler` (conservar muletillas como "um"/"uh", por defecto `false`) y `verbatim` (colapsar palabras repetidas cuando se desactiva, por defecto `true`). Estas opciones permiten adaptar la salida a distintos requisitos de post-procesado. No se dispone de información sobre innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Reconocimiento automático del habla (ASR) en 45 idiomas, con detección automática de idioma si no se especifica.
- Transcripción con control de formato: dígitos versus palabras, conservación o eliminación de muletillas, colapso de repeticiones.
- Procesamiento por lotes: el campo `audio` acepta una lista de rutas, URLs o arrays.
- Integración nativa con Hugging Face Transformers (`AutoProcessor`, `AutoModelForMultimodalLM`).
- Soporte de servido con vLLM mediante API compatible con OpenAI (`chat.completions`), incluyendo entrada de audio en base64 (`audio_url`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio generativo; el modelo está especializado en transcripción.

## Casos de uso

- Transcripción de reuniones y actas: con un WER de 9,24 en AMI (reuniones) y RTFx de 4245, el modelo es adecuado para procesar grabaciones de reuniones largas y generar actas automáticas en entornos corporativos.
- Subtitulado y accesibilidad: su WER de 2,43 en VoxPopuli (discurso parlamentario) y 3,08 en SPGISpeech lo hacen apto para generar subtítulos de alta calidad en vídeo y contenido divulgativo.
- Atención al cliente y análisis de llamadas: con WER de 10,25 en URGENT24 (audio telefónico de emergencias) y 13,14 en conversacional privado, puede transcribir llamadas para análisis de calidad, cumplimiento y detección de intenciones, aunque requiere revisión en audio muy ruidoso.
- Transcripción multilingüe de contenido: con WER de 3,73 en español, 5,52 en alemán, 7,21 en francés y CER de 6,56 en chino, sirve para localizar y transcribir catálogos de audio en múltiples mercados.
- Pipelines de datos a gran escala: el RTFx de 6338 en la pista inglesa con vLLM sobre H200 permite procesar miles de horas de audio en paralelo para construir corpus etiquetados o datasets de entrenamiento.
- Integración en aplicaciones vía API compatible con OpenAI: el servido con `vllm serve` expone un endpoint `/v1` que cualquier cliente OpenAI puede consumir, facilitando su incorporación en backends existentes sin reescribir la capa de integración.
- Transcripción de audio en movilidad o edge: con ~0,5B de parámetros y pesos safetensors en un repo de 4,4 GB, es viable en GPUs de consumo y en entornos con presupuesto de VRAM ajustado.

## Benchmarks y rendimiento

Resultados de la Open ASR Leaderboard (release 18-11-2026, v1.16.1), ejecutados en H200 con vLLM.

Pista inglesa (WER % y RTFx):

| Split | WER (%) | RTFx |
|---|---|---|
| AMI | 9,24 | 4245 |
| Earnings22 | 6,45 | 4811 |
| GigaSpeech | 7,56 | 5978 |
| SPGISpeech | 3,08 | 7308 |
| URGENT24 | 10,25 | 3314 |
| Voice Arena Monsoon | 3,56 | 3760 |
| VoxPopuli | 2,43 | 4222 |
| Private (scripted) | 3,71 | no disponible |
| Private (conversational) | 13,14 | no disponible |
| Media | 6,60 | 6338 |

Pista multilingüe (WER %, chino en CER):

| Idioma | FLEURS | Common Voice | MLS | Voice Arena Monsoon | AISHELL-1 | Media |
|---|---|---|---|---|---|---|
| Alemán | 4,77 | 6,28 | no disponible | no disponible | no disponible | 5,52 |
| Español | 2,82 | 4,33 | 4,04 | no disponible | no disponible | 3,73 |
| Francés | 5,95 | 10,01 | 5,66 | no disponible | no disponible | 7,21 |
| Italiano | 2,53 | 4,84 | 7,90 | no disponible | no disponible | 5,09 |
| Neerlandés | 6,05 | 4,92 | 9,38 | no disponible | no disponible | 6,78 |
| Portugués | 5,31 | no disponible | 7,61 | no disponible | no disponible | 6,46 |
| Hindi | no disponible | no disponible | no disponible | 14,11 | no disponible | 14,11 |
| Chino (CER) | 5,82 | no disponible | no disponible | no disponible | 7,31 | 6,56 |

No se han publicado en la información disponible resultados comparativos directos con otros modelos concretos en estas tablas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con ~0,5B de parámetros y pesos safetensors en fp16/bf16, la huella de pesos ronda 1 GB, más el overhead del procesador de audio y del runtime.
- GPU recomendadas: el fabricante reporta evaluaciones en NVIDIA H200 con vLLM; por tamaño, cabe holgadamente en A100, H100, L40S y GPUs de consumo modernas.
- GPU de consumo: sí, es viable en RTX 4090, RTX 3090 y previsiblemente en GPUs con 8 GB o más de VRAM, aunque no se publican cifras exactas de consumo.
- Opciones de despliegue: Hugging Face Transformers con `accelerate` (`device_map="auto"`) y vLLM con soporte de audio (`vllm[audio]`), servido con API compatible con OpenAI.
- Latencia y throughput: RTFx de 6338 en la media de la pista inglesa sobre H200 con vLLM; RTFx por split entre 3314 (URGENT24) y 7308 (SPGISpeech). No se publican cifras de latencia absoluta ni de throughput en otras GPUs.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de benchmarks de modelos alternativos comparables, por lo que la comparación cuantitativa se limita a las características declaradas.

| Modelo | Parámetros | Idiomas | Licencia | Formatos | Despliegue |
|---|---|---|---|---|---|
| Rumble-2-Flash | ≈0,5B | 45 | Apache 2.0 | safetensors | Transformers, vLLM |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El WER en audio conversacional es notablemente superior al de audio leído: 13,14 en Private (conversational) frente a 3,71 en Private (scripted), y 10,25 en URGENT24; en producción conviene prever revisión humana en estos dominios.
- El rendimiento en hindi es el más bajo de la pista multilingüe (14,11 en Voice Arena Monsoon), por lo que no es recomendable como idioma principal sin validación específica.
- No se documentan sesgos conocidos, pero al ser un modelo ASR entrenado sobre corpus no especificados, puede heredar sesgos acústicos y léxicos de dichos datos; no hay información pública sobre la composición del dataset.
- Riesgo de alucinación en transcripción: como todo modelo generativo de audio a texto, puede producir texto no presente en el audio, especialmente en segmentos ruidosos o silenciosos.
- No se especifica la longitud máxima de audio por petición; el ejemplo de vLLM usa `--max-model-len 4096`, lo que puede limitar la duración de las entradas si no se ajusta.
- La licencia Apache 2.0 permite uso comercial, pero no se ofrece garantía ni soporte por parte del autor; es responsabilidad del integrador validar el modelo en su dominio.
- No se han publicado detalles sobre cuantizaciones disponibles ni sobre el comportamiento del modelo en precisión reducida.

## Enlaces

- Hugging Face: https://huggingface.co/Reson8/Rumble-2-Flash
- Open ASR Leaderboard: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard?version=1.16.1
- Vista multilingüe del leaderboard: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard?languages=Reson8%2FRumble-2-Flash&proprietary=false
- Licencia Apache 2.0: https://huggingface.co/Reson8/Rumble-2-Flash/blob/main/LICENSE
- Audio de ejemplo: https://hf.co/datasets/hf-internal-testing/dummy-audio-samples/resolve/main/bcn_weather.mp3
