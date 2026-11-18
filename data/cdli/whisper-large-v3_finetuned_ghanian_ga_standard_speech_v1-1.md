# cdli/whisper-large-v3_finetuned_ghanian_ga_standard_speech_v1.1

## Resumen

El modelo `cdli/whisper-large-v3_finetuned_ghanian_ga_standard_speech_v1.1` es un ajuste fino de `openai/whisper-large-v3` desarrollado por CDLI para el reconocimiento automático de habla (ASR) en ga, una lengua kwa hablada en Ghana. Forma parte del esfuerzo de CDLI por hacer que la tecnología del habla funcione para hablantes cuyas variedades lingüísticas y patrones de habla no estándar están infrarepresentados en los sistemas ASR convencionales.

El modelo parte de la arquitectura encoder-decoder transformer de Whisper large-v3 (1.543.490.560 parámetros) y se ha entrenado sobre el split de entrenamiento del dataset `cdli/ghanian_ga_standard_speech_v1.0`, empleando el split de desarrollo para seleccionar el mejor checkpoint. Un detalle técnico relevante es que, aunque el idioma objetivo es el ga, el modelo se decodifica usando el ajuste de idioma yoruba (`yo`), por ser la lengua soportada por Whisper más próxima al ga según el autor.

La relevancia del modelo reside en su enfoque en habla no estándar: el conjunto de evaluación incluye 2.025 ejemplos de 22 hablantes, y se reporta un WER estándar a nivel de corpus de 0,19 junto con un WER promedio por enunciado de 0,18. Con 39 descargas y sin likes en el momento de la consulta, se trata de un modelo de nicho, orientado a investigación y aplicaciones comunitarias más que a despliegues masivos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Whisper large-v3 (encoder-decoder transformer) |
| Parámetros totales | 1.543.490.560 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 s; los enunciados de más de 30 s se excluyeron en la evaluación) |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantizaciones GGUF/ONNX no publicadas por el autor) |
| Idiomas soportados | ga (gaa); decodificación con ajuste de idioma yoruba (`yo`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 6,2 GB |
| Pipeline | automatic-speech-recognition |
| Librería | transformers |
| Dataset de entrenamiento | cdli/ghanian_ga_standard_speech_v1.0 |
| Métrica reportada | WER |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo de Whisper large-v3, un transformer encoder-decoder diseñado originalmente para ASR multilingüe y traducción de voz. Se entrenaron todas las capas del modelo, no solo la cabeza de clasificación, lo que implica una adaptación profunda de los pesos al dominio del ga y al habla no estándar. Durante el entrenamiento se aplicó SpecAugment con la configuración por defecto, una técnica de aumento de datos que enmascara bandas de frecuencia y tiempo en el espectrograma para mejorar la robustez frente a variaciones acústicas.

El dataset utilizado es `cdli/ghanian_ga_standard_speech_v1.0`, con splits de train, dev y test. El split de desarrollo se empleó para seleccionar el mejor checkpoint. Un aspecto metodológico destacable es la decisión de decodificar con el token de idioma yoruba (`yo`) en lugar de forzar un token inexistente para el ga, aprovechando la proximidad tipológica entre ambas lenguas dentro del conjunto de idiomas que Whisper soporta. No se documentan en la información disponible detalles sobre el número total de tokens de audio, la composición exacta del dataset ni el uso de RLHF o DPO, que en un modelo ASR no serían el mecanismo habitual de entrenamiento.

## Capacidades

- Reconocimiento automático de habla en ga, incluyendo habla no estándar de hablantes con posibles alteraciones o particularidades articulatorias.
- Transcripción de audio en ventanas de hasta 30 segundos por segmento; los enunciados más largos requieren segmentación previa.
- Robustez mejorada frente a variabilidad acústica gracias al entrenamiento con SpecAugment.
- Adaptación a múltiples hablantes: el conjunto de evaluación cubre 22 hablantes distintos, lo que sugiere cierta generalización entre voces.
- Integración con la librería `transformers` y con endpoints compatibles (`endpoints_compatible` en los tags).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio generation ni modo de razonamiento extendido; es un modelo puramente ASR.
- Capacidad multilingüe limitada al ga como idioma objetivo; el uso del token yoruba es un mecanismo de decodificación, no una capacidad multilingüe real.

## Casos de uso

- Transcripción de entrevistas y testimonios en ga: el modelo permite convertir grabaciones de campo en texto para investigación lingüística, antropológica o sociológica, con un WER de referencia de 0,19 a nivel de corpus que facilita la revisión humana posterior.
- Subtitulado y documentación de contenido audiovisual en ga: radios comunitarias, televisiones locales o archivos orales pueden generar subtítulos automáticos segmentando el audio en ventanas de 30 segundos.
- Accesibilidad para hablantes de ga con habla no estándar: al estar entrenado específicamente sobre este tipo de habla, puede emplearse en sistemas de dictado o comunicación asistida donde los ASR generalistas fallan.
- Preservación del patrimonio oral: digitalización y transcripción de cuentos, proverbios y tradiciones orales en ga, con el modelo como primer paso de un pipeline de anotación.
- Investigación en ASR de bajos recursos: sirve como línea base y punto de comparación para experimentos sobre adaptación de Whisper a lenguas africanas y habla no estándar, dado que el autor documenta la metodología de decodificación con token yoruba.
- Sistemas de atención ciudadana o servicios públicos en Ghana: transcripción de llamadas o mensajes de voz en ga para su enrutamiento o análisis, siempre con revisión humana dada la tasa de error.
- Evaluación comparativa de hablantes y severidad: el desglose por hablante del model card permite identificar qué perfiles presentan mayor WER (por ejemplo, hablantes con valores de 0,26 a 0,30) y diseñar intervenciones o recogida de datos adicional específica.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el split de test del dataset `cdli/ghanian_ga_standard_speech_v1.0` (2.025 ejemplos, 22 hablantes, enunciados de hasta 30 s, decodificación con `language=yo`, `task=transcribe`, greedy search con `num_beams=1` y `do_sample=False`, texto normalizado con `BasicTextNormalizer`):

| Modelo | WER estándar (corpus) | WER promedio por enunciado |
|---|---|---|
| Este modelo | 0,19 | 0,18 |

Desglose por hablante (WER promedio por enunciado, con número de enunciados de test):

| Speaker ID | n_utterances | Avg WER |
|---|---|---|
| 496 | 107 | 0,14 |
| 520 | 82 | 0,26 |
| 531 | 95 | 0,16 |
| 533 | 115 | 0,19 |
| 538 | 66 | 0,16 |
| 541 | 133 | 0,25 |
| 545 | 47 | 0,15 |
| 546 | 93 | 0,19 |
| 562 | 107 | 0,16 |
| 579 | 114 | 0,30 |
| 587 | 86 | 0,15 |
| 602 | 115 | 0,14 |
| 622 | 40 | 0,13 |
| 625 | 63 | 0,13 |
| 644 | 133 | 0,18 |
| 651 | 64 | 0,13 |
| 666 | 73 | 0,20 |
| 675 | 105 | 0,21 |
| 693 | 106 | 0,27 |
| 707 | 124 | 0,08 |
| 736 | 111 | 0,17 |
| 780 | 46 | 0,24 |

No se han publicado en la información disponible resultados comparativos frente a otros modelos (por ejemplo, whisper-large-v3 sin ajustar u otros ASR para lenguas ghanesas).

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,1 GB solo para pesos, más overhead de activaciones y buffers de audio; en la práctica, entre 4 y 6 GB para lotes pequeños.
- En fp32: alrededor de 6,2 GB solo para pesos, con requisitos totales superiores a 8 GB.
- GPU recomendadas para producción: A100, H100 o L40S para alto throughput; RTX 4090 o RTX 3090 para inferencia de un solo flujo con baja latencia.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (RTX 3060 Ti, RTX 3070, RTX 4060 Ti, RTX 4070 y superiores) usando fp16 o cuantización int8.
- Opciones de despliegue: `transformers` con PyTorch, `pipeline` de ASR, TGI (Text Generation Inference no aplica directamente a ASR, pero hay soporte de Whisper en algunos servidores de inferencia), vLLM (soporte de Whisper limitado y dependiente de versión), `whisper.cpp` o `faster-whisper` previa conversión de pesos, y Ollama solo si se genera una conversión compatible.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware, del backend y de la longitud de los segmentos de audio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (cdli/whisper-large-v3 ga v1.1) | 1.543.490.560 | 30 s por segmento | ga (decodificación con token yo) | no disponible | Hugging Face, 39 descargas |
| openai/whisper-large-v3 | 1.543.490.560 | 30 s por segmento | multilingüe (99 idiomas), sin ga explícito | Apache 2.0 (según el modelo original) | Hugging Face, ampliamente disponible |
| openai/whisper-large-v3-turbo | no disponible en la información | 30 s por segmento | multilingüe | Apache 2.0 (según el modelo original) | Hugging Face |
| Otros ajustes de CDLI para habla no estándar | no disponible | no disponible | varias lenguas | no disponible | Hugging Face (página de CDLI) |

No se dispone de datos de rendimiento de los modelos comparables sobre el mismo conjunto de test, por lo que la comparación se limita a parámetros, idioma, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo se decodifica con el token de idioma yoruba (`yo`), no con un token específico para ga; esto puede introducir sesgos de decodificación y limita la portabilidad a otros frameworks que no permitan forzar ese token.
- Los enunciados de más de 30 segundos se excluyeron de la evaluación; no hay evidencia reportada sobre su comportamiento en audio largo sin segmentar.
- El WER varía notablemente entre hablantes (de 0,08 a 0,30 en el desglose), lo que indica sensibilidad a características individuales del habla.
- Riesgo de alucinación en pasajes de audio con ruido, silencios o solapamientos, comportamiento conocido en modelos Whisper; requiere revisión humana en producción.
- La licencia no está disponible en la información proporcionada, por lo que no puede confirmarse el uso comercial; es imprescindible verificar los términos antes de desplegar.
- El dataset de entrenamiento es específico de una variedad y comunidad (ga de Ghana); la generalización a otras variedades o a hablantes fuera de la distribución de entrenamiento no está documentada.
- Solo se soporta el ga como idioma objetivo; no es un modelo multilingüe utilizable para otras lenguas.
- Con 39 descargas y sin likes, la validación comunitaria es mínima; conviene tratar los resultados como referencia preliminar.
- No se documentan sesgos demográficos específicos más allá del desglose por hablante; la ausencia de información no implica ausencia de sesgo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cdli/whisper-large-v3_finetuned_ghanian_ga_standard_speech_v1.1
- Página de CDLI en Hugging Face: https://huggingface.co/cdli
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Dataset de entrenamiento: https://huggingface.co/datasets/cdli/ghanian_ga_standard_speech_v1.0
- Paper de Whisper (referencia del modelo base): https://arxiv.org/abs/2212.04356
