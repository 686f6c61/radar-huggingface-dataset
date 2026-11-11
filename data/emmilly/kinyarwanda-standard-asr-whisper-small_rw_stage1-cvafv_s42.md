# emmilly/kinyarwanda-standard-asr-whisper-small_rw_stage1-cvafv_s42

## Resumen

El modelo `emmilly/kinyarwanda-standard-asr-whisper-small_rw_stage1-cvafv_s42` es un ajuste fino de `openai/whisper-small` (revision `973afd2496`) para reconocimiento automatico del habla (ASR) en kinyarwanda estandar, es decir, habla leida y espontanea sin discapacidad del hablante. Lo desarrolla el usuario de Hugging Face `emmilly` y esta concebido explicitamente como base de la etapa 1 para posteriores ajustes finos sobre habla con discapacidad (linea CDLI). No fue entrenado con habla degradada ni no estandar.

El modelo resuelve un problema concreto: el ASR en kinyarwanda sigue siendo un idioma de bajos recursos, y el propio Whisper-small en modo zero-shot ofrece un WER de 0,973 sobre el test de Common Voice, lo que lo hace inutilizable en produccion. Este ajuste baja ese WER a 0,288 en el mismo conjunto, y a 0,089 en AfriVoice. La relevancia actual esta en que sirve como pieza base reproducible (semilla 42, receta documentada) para construir ASR en kinyarwanda, incluida la rama de habla con discapacidad.

Arquitectonicamente es el encoder-decoder transformer de Whisper en su variante small, con 241.734.912 parametros y pesos en safetensors. La longitud de contexto de audio no se documenta en la informacion disponible; Whisper-small procesa ventanas de 30 segundos de audio. La licencia es CC-BY-4.0, lo que permite uso comercial con atribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper small) |
| Parametros totales | 241.734.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | Q4_K (GGUF para whisper.cpp); F16 como referencia |
| Idiomas soportados | Kinyarwanda (rw) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (transformers); GGUF Q4_K en `ggml/` |

## Arquitectura y entrenamiento

Se parte de `openai/whisper-small`, un transformer encoder-decoder con atencion estandar (no hay atencion lineal ni arquitecturas hibridas SSM). El ajuste fino se realizo sobre habla kinyarwanda estandar combinando dos fuentes: Common Voice Scripted Speech 27.0 en kinyarwanda (subset `validated_minus_devtest`, maximo 2000 clips por hablante) y AfriVoice Kinyarwanda v0.2 (todos los shards de entrenamiento). El mix natural usado fue de 668.964 clips de CV (938,3 horas) y 467.755 clips de AfriVoice (2.553,0 horas), con peso CV de 1.0. Los clips se filtraron a 0,5-30 s y se eliminaron aquellos cuyo texto normalizado coincidia con una transcripcion de evaluacion.

El entrenamiento se ejecuto hasta 30.000 pasos (1,689 epocas planificadas), batch efectivo 64, learning rate 1e-05, pesos en fp32 con computo bf16 y semilla 42. El mejor checkpoint se selecciono por WER medio por utterance sobre 500 muestras de Common Voice dev y 500 de AfriVoice validation. Como aumentacion de datos solo se aplico SpecAugment con mascaras temporales (probabilidad 0,05) y sin mascaras de frecuencia (probabilidad 0,0); no hubo aumentacion de audio. No se menciona RLHF ni DPO, algo esperable en un modelo ASR.

## Capacidades

- Transcripcion de voz a texto en kinyarwanda estandar (habla leida y espontanea).
- Reconocimiento robusto a ruido blanco y rosa en distintos niveles de SNR, reverberacion pequena y grande, filtrado telefónico (phone band), recorte de silencio y padding en bordes.
- Tolerancia parcial a cambios de velocidad (0,8x y 1,25x) y de tono (pitch up/down de 3 semitonos), aunque con degradacion notable.
- Capacidad residual de transcribir ingles: WER de 0,658 en el test CDLI en ingles, aunque peor que el modelo base zero-shot (0,518), lo que indica cierta perdida de la capacidad multilingue original.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puro de ASR.
- No dispone de modo thinking, vision ni audio generativo.
- Capacidad multilingue limitada al kinyarwanda (con residuo de ingles).

## Casos de uso

- Subtitulado y transcripcion de contenido audiovisual en kinyarwanda: con WER de 0,288 en Common Voice test, es adecuado para generar subtitulos que luego se revisan manualmente, reduciendo el coste de transcripcion frente al zero-shot (0,973).
- Atencion al cliente por voz en kinyarwanda: el modelo puede transcribir llamadas o mensajes de voz de usuarios para alimentar un sistema de intenciones o un agente conversacional; su robustez a phone band (WER 0,312 en CV) lo hace valido para audio telefonico.
- Archivado y busqueda de audio en kinyarwanda: transcripcion masiva de grabaciones (entrevistas, radios, corpus academicos) para indexacion y busqueda textual, aprovechando el bajo WER en AfriVoice (0,089).
- Base para ASR de habla con discapacidad: es la etapa 1 documentada para ajustes finos posteriores sobre habla no estandar (linea CDLI), lo que permite a equipos de accesibilidad reutilizar la receta y el checkpoint.
- Investigacion en ASR de bajos recursos: receta reproducible (semilla 42, mix de datasets, filtros y evaluacion con intervalos de confianza) para comparar estrategias de ajuste fino en kinyarwanda.
- Despliegue en dispositivos con recursos limitados: la version GGUF Q4_K permite ejecutar el modelo en whisper.cpp (v1.9.5) en CPU o GPUs modestas, util para aplicaciones offline o en campo.
- Evaluacion de calidad y benchmarking: sus tablas de robustez ante ruido, reverb, velocidad y pitch sirven como referencia para comparar otros modelos ASR en kinyarwanda.

## Benchmarks y rendimiento

Resultados de WER por utterance (capado a 1), normalizacion de texto segun las model cards CDLI. `cdli-std` es `cdli/whisper-small_finetuned_rwandan_kinyarwanda_standard_speech_v1.0`; `openai-zero-shot` es el modelo base sin ajuste.

| test_set | this-model | cdli-std | openai-zero-shot |
|---|---|---|---|
| cv-test | 0,288 | 0,715 | 0,973 |
| afv-test | 0,089 | 0,296 | 0,970 |
| cdli-rw-test | 0,474 | 0,697 | 0,983 |
| cdli-en-test | 0,658 | 0,659 | 0,518 |

Intervalos de confianza al 95 %:

| test_set | modo | WER_per_utt | ci_low | ci_high | remuestreo | grupos | n |
|---|---|---|---|---|---|---|---|
| cv-test | verbatim | 0,288 | 0,272 | 0,304 | hablantes | 347 | 3000 |
| afv-test | verbatim | 0,089 | 0,086 | 0,093 | clips (sin ids de hablante) | 3000 | 3000 |
| cdli-rw-test | verbatim | 0,474 | 0,393 | 0,563 | hablantes | 9 | 1169 |
| cdli-en-test | verbatim | 0,658 | 0,593 | 0,726 | hablantes | 9 | 1115 |
| cdli-en-test | clean | 0,609 | 0,544 | 0,683 | hablantes | 9 | 1115 |

Robustez ante degradaciones sinteticas fijas (WER por utterance):

| condicion | test_set | this-model | cdli-std |
|---|---|---|---|
| clean | cv-test | 0,270 | 0,694 |
| clean | afv-test | 0,083 | 0,293 |
| noise_white_20db | cv-test | 0,337 | 0,748 |
| noise_white_20db | afv-test | 0,105 | 0,360 |
| noise_white_10db | cv-test | 0,427 | 0,810 |
| noise_white_10db | afv-test | 0,176 | 0,495 |
| noise_pink_10db | cv-test | 0,388 | 0,781 |
| noise_pink_10db | afv-test | 0,130 | 0,411 |
| noise_pink_5db | cv-test | 0,449 | 0,823 |
| noise_pink_5db | afv-test | 0,187 | 0,509 |
| noise_brown_5db | cv-test | 0,263 | 0,697 |
| noise_brown_5db | afv-test | 0,086 | 0,293 |
| reverb_small | cv-test | 0,406 | 0,789 |
| reverb_small | afv-test | 0,121 | 0,394 |
| reverb_large | cv-test | 0,683 | 0,918 |
| reverb_large | afv-test | 0,271 | 0,607 |
| fast_1.25 | cv-test | 0,815 | 0,923 |
| fast_1.25 | afv-test | 0,355 | 0,663 |
| slow_0.8 | cv-test | 0,641 | 0,882 |
| slow_0.8 | afv-test | 0,231 | 0,554 |
| pitch_up_3 | cv-test | 0,726 | 0,909 |
| pitch_up_3 | afv-test | 0,269 | 0,579 |
| pitch_down_3 | cv-test | 0,809 | 0,943 |
| pitch_down_3 | afv-test | 0,401 | 0,685 |
| phone_band | cv-test | 0,312 | 0,737 |
| phone_band | afv-test | 0,090 | 0,320 |
| edge_pad_1s | cv-test | 0,259 | 0,692 |
| edge_pad_1s | afv-test | 0,084 | 0,293 |
| quiet_-12db | cv-test | 0,277 | 0,697 |
| quiet_-12db | afv-test | 0,084 | 0,292 |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 241,7 M de parametros. En fp16 ocupa aproximadamente 0,5 GB de pesos; en fp32, alrededor de 1 GB. Con overhead de activaciones y ventanas de audio de 30 s, el consumo realista en GPU es de 1-2 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM. Una RTX 3060, RTX 4060, RTX 4090, A100 o H100 lo ejecutan sin problema; las GPU de datacenter no son necesarias salvo para alto throughput por lotes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU con la version GGUF Q4_K.
- Opciones de despliegue: transformers (pipeline `automatic-speech-recognition`), whisper.cpp v1.9.5 con el fichero GGUF Q4_K incluido en `ggml/`, y en general cualquier runtime compatible con Whisper (vLLM, TGI o faster-whisper, aunque la model card solo documenta explicitamente whisper.cpp).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER cv-test | WER afv-test | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| this-model (whisper-small rw stage1) | 241,7 M | no disponible (ventana 30 s) | 0,288 | 0,089 | CC-BY-4.0 | Hugging Face |
| cdli/whisper-small_finetuned_rwandan_kinyarwanda_standard_speech_v1.0 | tamano whisper-small | no disponible | 0,715 | 0,296 | no disponible | Hugging Face (CDLI) |
| openai/whisper-small (zero-shot) | 241,7 M | no disponible (ventana 30 s) | 0,973 | 0,970 | MIT (Whisper original) | Hugging Face / OpenAI |

## Limitaciones y advertencias

- Entrenado exclusivamente con habla estandar (sin discapacidad); su rendimiento sobre habla con discapacidad es limitado (WER 0,474 en cdli-rw-test) y no debe usarse como solucion final para ese caso sin un ajuste fino posterior.
- Requiere decodificacion con `language="sw"` (token de swahili, convencion CDLI para kinyarwanda) y greedy (`num_beams=1`); usar otro idioma o beam search puede degradar los resultados.
- Degradacion severa ante cambios de velocidad y tono: WER de 0,815 en CV con velocidad 1,25x y 0,809 con pitch down de 3 semitonos; no es adecuado para audio con alteraciones fuertes de prosodia.
- Reverberacion grande degrada notablemente (WER 0,683 en CV), por lo que en salas muy reverberantes conviene aplicar dereverberacion previa.
- Ha perdido parte de la capacidad multilingue del modelo base: en ingles el WER empeora de 0,518 (zero-shot) a 0,658.
- Riesgo de alucinacion en segmentos de silencio o ruido extremo, comun en modelos Whisper; conviene usar deteccion de actividad vocal y filtros de salida.
- Sesgos: no se documentan analisis de sesgo por genero, edad o acento; el dataset AfriVoice no incluye identificadores de hablante, lo que limita la evaluacion por subgrupos.
- Licencia CC-BY-4.0: permite uso comercial con atribucion al autor y a las fuentes de datos (Common Voice CC0-1.0 y AfriVoice CC-BY-4.0); es necesario cumplir la atribucion de AfriVoice.
- Los conjuntos de test CDLI son de acceso restringido (gated) y se usaron solo para evaluacion; no se redistribuyen audio ni transcripciones.
- Solo 29 descargas y 0 likes en el momento de la consulta: ecosistema de validacion muy limitado, sin evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/emmilly/kinyarwanda-standard-asr-whisper-small_rw_stage1-cvafv_s42
- Modelo base: https://huggingface.co/openai/whisper-small
- Dataset AfriVoice Kinyarwanda (original): https://huggingface.co/datasets/DigitalUmuganda/Afrivoice_Kinyarwanda
- Dataset usado en el ajuste: https://huggingface.co/datasets/ElizabethMwangi/kinyarwanda_afrivoice_all_domains_v0.2
- Modelo de referencia CDLI: https://huggingface.co/cdli/whisper-small_finetuned_rwandan_kinyarwanda_standard_speech_v1.0
- Common Voice Scripted Speech 27.0 (Kinyarwanda): no disponible como enlace directo en la informacion proporcionada (dataset `cmu5k4i0f00p2mi0771dl1mg8` de Mozilla Data Collective)
- whisper.cpp (v1.9.5, commit `0c7be69637`): https://github.com/ggerganov/whisper.cpp
