# munasco/eko-stt-v1

## Resumen

Eko-STT-v1 es un modelo de reconocimiento automático del habla (ASR) publicado por el usuario munasco en Hugging Face, especializado en lenguas nigerianas. Se trata de un ajuste fino (fine-tune) del conocido `openai/whisper-large-v3`, lo que lo sitúa en la familia de modelos Whisper de OpenAI, con una arquitectura transformer encoder-decoder orientada a la transcripción de audio a texto. El modelo cuenta con 1.609.879.040 parámetros, un tamaño de repositorio de 3,2 GB y pesos en formato safetensors, y está pensado para cubrir el hueco de cobertura que los modelos ASR generalistas presentan en lenguas africanas de bajos recursos.

El modelo aborda un problema concreto: la baja calidad de transcripción de Whisper en yoruba (yo), igbo (ig), pidgin nigeriano (pcm) y en inglés nigeriano. Para ello, el autor lo ha ajustado sobre el checkpoint multilingüe de Whisper large-v3 y declara métricas de WER sobre varios conjuntos de evaluación específicos de Nigeria (AfriSpeech-NG, Common Voice 27 y datasets DSN), con valores que van del 9,34 % al 19,45 % según el idioma y el conjunto.

Su relevancia actual radica en que las lenguas nigerianas están infrarrepresentadas en los sistemas ASR comerciales, y un modelo ajustado sobre una base sólida como Whisper large-v3 puede ofrecer una alternativa práctica para investigadores y desarrolladores que trabajen en África Occidental. No obstante, el acceso es restringido (gated) y la licencia es una licencia propia denominada "ekogenie-research", lo que condiciona su uso comercial y su despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3, ajuste fino) |
| Parametros totales | 1.609.879.040 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (Whisper procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | en (ingles nigeriano), pcm (pidgin nigeriano), yo (yoruba), ig (igbo) |
| Licencia | ekogenie-research (licencia propia, "other") |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Modelo base | openai/whisper-large-v3 |
| Acceso | Restringido (gated), requiere aceptar condiciones |
| Tamano del repositorio | 3,2 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Whisper large-v3: un transformer encoder-decoder con atención multi-cabeza, entrenado originalmente por OpenAI para transcripción multilingüe y traducción de voz. Whisper procesa el audio en ventanas de 30 segundos convertidas a espectrogramas log-Mel, y genera texto de forma autorregresiva con tokens especiales de idioma y tarea. El ajuste fino de munasco conserva esta arquitectura y modifica los pesos para adaptar el modelo a las variedades nigerianas del inglés, el pidgin, el yoruba y el igbo.

No se dispone en la información proporcionada de detalles sobre el volumen de datos de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de RLHF, DPO u otras optimizaciones posteriores al ajuste supervisado. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. La información disponible se limita a la model card y a los resultados de benchmarks declarados por el autor, que no han sido verificados de forma independiente (el campo `verified` es `false` en todos los casos).

## Capacidades

- Reconocimiento automático del habla (ASR) en inglés nigeriano, pidgin nigeriano, yoruba e igbo.
- Transcripción de audio a texto con normalización de texto en la evaluación (WER normalizado).
- Soporte multilingüe limitado a los cuatro idiomas declarados (en, pcm, yo, ig).
- Compatibilidad con la librería `transformers` y el pipeline `automatic-speech-recognition`.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que facilita su despliegue en infraestructura de Hugging Face.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio generativo ni modo "thinking"; es un modelo puramente ASR.

## Casos de uso

- Transcripción de reuniones y entrevistas en inglés nigeriano: el modelo puede convertir grabaciones de audio en texto para actas o análisis posteriores, aprovechando su ajuste específico al acento y vocabulario local.
- Subtitulado de contenido audiovisual en yoruba e igbo: útil para medios de comunicación, creadores de contenido y plataformas que quieran ofrecer subtítulos en lenguas nigerianas donde los modelos generalistas fallan.
- Atención al cliente en pidgin nigeriano: transcripción de llamadas o mensajes de voz en centros de contacto de Nigeria, donde el pidgin es lingua franca y los ASR estándar tienen alta tasa de error.
- Investigación lingüística y documentación de lenguas: los investigadores pueden transcribir corpus orales de yoruba e igbo para estudios fonéticos, sociolingüísticos o de preservación lingüística.
- Accesibilidad para personas con discapacidad auditiva: generación de transcripciones en tiempo casi real de contenido hablado en lenguas nigerianas, ampliando la accesibilidad más allá del inglés estándar.
- Preprocesamiento para pipelines de NLP: convertir audio en texto como paso previo a análisis de sentimiento, resumen o indexación de contenido en lenguas nigerianas.
- Evaluación comparativa de ASR: servir como referencia para medir la calidad de otros modelos en lenguas africanas de bajos recursos, dado que publica WER sobre varios datasets.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Dataset | Metrica | Valor |
|---|---|---|
| afrispeech-ng-test-reviewed | WER (normalizado) | 9,34 |
| afrispeech-ng-test-v2 | WER (normalizado) | 10,61 |
| cv27-ig-test | WER (normalizado) | 19,45 |
| cv27-pcm-test | WER (normalizado) | 16,43 |
| cv27-yo-test | WER (normalizado) | 18,46 |
| dsn-ig-devtest | WER (normalizado) | 14,67 |
| dsn-yo-devtest | WER (normalizado) | no disponible en la informacion proporcionada |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que se trata de un modelo ASR y no de un modelo de lenguaje generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,61 mil millones de parámetros, en precisión fp16 se requieren aproximadamente 3,2 GB solo para los pesos, más memoria para activaciones y buffers de audio; en la práctica, entre 4 y 6 GB de VRAM para inferencia en fp16.
- GPU recomendadas: NVIDIA A100, H100 o L4 para despliegues de producción con concurrencia; RTX 4090, RTX 3090 o RTX 4080 para desarrollo y pruebas.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 6-8 GB de VRAM (RTX 3060, RTX 4060 Ti, RTX 2070 o superiores), dependiendo de la cuantización y del tamaño de lote.
- Opciones de despliegue: `transformers` (pipeline de ASR), vLLM no aplica de forma nativa a Whisper, pero sí `faster-whisper`, `whisper.cpp`, `Ollama` (con conversión adecuada) y `TGI` si se adapta; el tag `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerán del hardware, la duración del audio y la implementación elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Acceso |
|---|---|---|---|---|---|
| eko-stt-v1 | 1.609.879.040 | No disponible (ventanas de 30 s) | en, pcm, yo, ig | ekogenie-research | Restringido (gated) |
| openai/whisper-large-v3 | 1.550 millones | No disponible (ventanas de 30 s) | Multilingüe (99 idiomas) | MIT | Abierto |
| openai/whisper-large-v3-turbo | 809 millones | No disponible (ventanas de 30 s) | Multilingüe | MIT | Abierto |
| Modelos ASR específicos para África (p. ej., AfroWhisper, si existe) | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparativa se limita a la familia Whisper porque no se dispone de información sobre otros modelos ASR especializados en lenguas nigerianas en la búsqueda realizada. Eko-STT-v1 se diferencia de Whisper large-v3 por su ajuste fino a lenguas nigerianas y por una licencia restrictiva, mientras que el modelo base es abierto y de uso libre bajo MIT.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated y requiere aceptar condiciones en Hugging Face, lo que puede retrasar su adopción y complicar la reproducibilidad.
- Licencia "ekogenie-research": no es una licencia de código abierto estándar; es imprescindible revisar los términos antes de cualquier uso comercial o despliegue en producción.
- Métricas no verificadas: todos los resultados de WER declarados por el autor tienen el campo `verified` en `false`, por lo que no han sido validados de forma independiente.
- Cobertura limitada a cuatro idiomas (en, pcm, yo, ig); no se debe asumir buen rendimiento en otras lenguas africanas ni en inglés estándar no nigeriano.
- Riesgo de alucinación en ASR: como todo modelo Whisper, puede generar texto plausible pero incorrecto en segmentos de audio con ruido, silencios largos o habla solapada.
- Sesgos potenciales derivados de los datos de ajuste fino: la distribución de acentos, géneros y registros del corpus de entrenamiento puede no representar toda la diversidad lingüística de Nigeria.
- Sin información sobre cuantizaciones disponibles ni sobre latencia/throughput, lo que dificulta la planificación de despliegues de producción.
- No es un modelo de lenguaje generativo: no soporta tool calling, agentes ni razonamiento multi-paso; su uso está acotado a transcripción de audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/munasco/eko-stt-v1
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Paper de referencia de Whisper (arXiv): https://arxiv.org/abs/2212.04356
- Referencia arXiv citada en los tags: arxiv:2605.17710 (no verificable en la información proporcionada)
- Documentación de Whisper en OpenAI: https://github.com/openai/whisper
- Librería transformers: https://huggingface.co/docs/transformers
