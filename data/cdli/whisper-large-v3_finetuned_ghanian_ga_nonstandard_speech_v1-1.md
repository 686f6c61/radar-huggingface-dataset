# cdli/whisper-large-v3_finetuned_ghanian_ga_nonstandard_speech_v1.1

## Resumen

El modelo `cdli/whisper-large-v3_finetuned_ghanian_ga_nonstandard_speech_v1.1` es un ajuste fino de Whisper large-v3 desarrollado por CDLI para el reconocimiento automático de habla (ASR) en ga (gaa), una lengua kwa hablada en Ghana, aplicado específicamente a habla no estándar: personas con alteraciones del habla de distinta severidad y etiología. El modelo parte de `cdli/whisper-large-v3_finetuned_ghanian_ga_standard_speech_v2.0`, un ajuste previo sobre habla estándar en ga, y se especializa en el subconjunto de habla con deterioro.

La motivación es clara: los sistemas ASR comerciales y los modelos multilingües de propósito general rinden muy por debajo en lenguas de bajos recursos y, dentro de ellas, en hablantes con habla atípica. CDLI aborda este doble sesgo con un pipeline en dos etapas (habla estándar y luego habla no estándar) sobre la arquitectura encoder-decoder de Whisper large-v3, con 1.543.490.560 parámetros.

El resultado es una mejora del 23 % de WER relativo a nivel de corpus (0,46 frente a 0,59 del modelo base) y del 22 % en WER promediado por enunciado. El modelo es relevante como referencia metodológica para adaptación de ASR a habla con discapacidad en lenguas africanas, aunque su generalización está limitada por el reducido número de hablantes del conjunto de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3) |
| Parametros totales | 1.543.490.560 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio de 30 segundos por segmento (Whisper) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | ga (gaa); decodificado con el ajuste de idioma `yo` (yoruba) por ser el más próximo a ga entre los soportados por Whisper |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata de un Whisper large-v3 completo: encoder-decoder transformer con atención estándar, entrenado originalmente por OpenAI sobre audio débilmente supervisado y ajustado aquí por CDLI. El ajuste se realizó sobre el split *train* del dataset `cdli/ghanian_ga_nonstandard_speech_v1.0` y la selección del checkpoint se hizo con el split *dev*. Se entrenaron todas las capas, con SpecAugment (configuración por defecto) y aumentación de forma de onda (ruido añadido, cambios de volumen y de velocidad).

Un detalle técnico relevante es que el modelo se decodifica con `language=yo` (yoruba), no con un token específico para ga, porque Whisper no incluye ga entre sus lenguas de entrenamiento y el yoruba es la más cercana. Esto implica que el token de idioma del tokenizer no coincide con la lengua objetivo y que el modelo depende del ajuste fino para mapear acústica de ga a texto ga. No se documentan fases de RLHF o DPO; el entrenamiento es supervisado con pares audio-transcripción.

## Capacidades

- Reconocimiento automático de habla (transcripción) en ga, con especialización en habla no estándar (alteraciones leves y moderadas).
- Transcripción de enunciados de hasta 30 segundos por segmento, conforme a la ventana nativa de Whisper.
- Robustez frente a variabilidad de hablante derivada de patologías del habla (desarrollo, fisura palatina, parálisis cerebral en el conjunto de evaluación).
- Aumentación de datos durante el entrenamiento orientada a ruido, volumen y velocidad, lo que aporta cierta tolerancia a condiciones acústicas variables.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio de entrada más allá de ASR, ni modo de razonamiento explícito.
- Capacidad multilingüe: limitada a ga en la práctica; el token de idioma activo es `yo`, por lo que no debe esperarse un comportamiento multilingüe fiable.

## Casos de uso

- Transcripción de entrevistas clínicas o lingüísticas con hablantes de ga con alteraciones del habla: el modelo está entrenado específicamente sobre este dominio y supera al modelo base en habla leve y moderada, lo que lo hace adecuado para investigación sociolingüística y logopédica.
- Subtitulado y documentación de corpus orales en ga: permite generar transcripciones preliminares de grabaciones de campo que después se revisan manualmente, reduciendo el coste de anotación frente a transcribir desde cero.
- Investigación en accesibilidad de ASR: sirve como punto de partida y referencia para estudiar el efecto de la adaptación a habla no estándar en lenguas de bajos recursos, con métricas desglosadas por severidad y hablante.
- Personalización por hablante: la propia model card señala que el dataset se presta más a personalización por hablante que a un modelo general; el modelo puede usarse como base para ajustes ligeros por usuario con pocos minutos de audio.
- Evaluación comparativa de sistemas ASR: al publicar WER estándar y WER promediado por enunciado, el modelo facilita comparaciones metodológicamente controladas frente a otros sistemas en habla atípica.
- Prototipos de asistencia a la comunicación para hablantes de ga con habla motora o estructural: con la advertencia de que el WER en severidad moderada sigue siendo alto (0,62 promediado), por lo que requiere revisión humana y no debe usarse como único canal en contextos críticos.

## Benchmarks y rendimiento

Evaluación sobre el split *test* de `cdli/ghanian_ga_nonstandard_speech_v1.0`, excluyendo enunciados de más de 30 segundos: 859 ejemplos, 4 hablantes. Decodificación con `language=yo`, `task=transcribe`, búsqueda greedy (`num_beams=1`, `do_sample=False`). Texto normalizado con `BasicTextNormalizer` de Whisper.

| Modelo | WER estándar (corpus) | WER promediado por enunciado |
|---|---|---|
| Adaptado (este modelo) | 0,46 | 0,47 |
| No adaptado (`..._standard_speech_v2.0`) | 0,59 | 0,60 |
| Mejora relativa | 23 % | 22 % |

Resultados por severidad (WER promediado por enunciado, agregado por hablante y luego por grupo):

| Severidad | Hablantes | Enunciados | WER no adaptado | WER adaptado | Mejora relativa |
|---|---|---|---|---|---|
| Leve | 2 | 443 | 0,44 | 0,33 | 24 % |
| Moderada | 2 | 416 | 0,76 | 0,62 | 19 % |

Resultados por hablante:

| Speaker ID | Severidad | Etiología | Enunciados | WER no adaptado | WER adaptado | Mejora relativa |
|---|---|---|---|---|---|---|
| 123 | Leve | Desarrollo | 191 | 0,38 | 0,34 | 10 % |
| 800 | Leve | Fisura palatina | 252 | 0,50 | 0,32 | 36 % |
| 124 | Moderada | Parálisis cerebral | 184 | 0,86 | 0,67 | 21 % |
| 786 | Moderada | Fisura palatina | 232 | 0,67 | 0,56 | 16 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, algo esperable en un modelo exclusivamente ASR.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,1 GB solo para pesos (1,54 mil millones de parámetros), más memoria de activaciones y buffers de audio; en la práctica, entre 4 y 6 GB para lotes pequeños.
- En fp32 la huella de pesos sube a unos 6,2 GB, coincidiendo con el tamaño del repositorio.
- GPU recomendadas: A100, H100 o L40S para despliegues con concurrencia; RTX 4090, RTX 3090 o RTX A5000 para inferencia individual con holgura.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 3070 y superiores) en fp16; en 6 GB puede requerir cuantización o lotes de tamaño 1.
- Opciones de despliegue: transformers (librería nativa del modelo), vLLM con soporte de Whisper, TGI, y llama.cpp/Ollama solo si se generan pesos GGUF, algo que no está documentado en el repositorio.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia estructural, Whisper large-v3 procesa ventanas de 30 segundos; el rendimiento real depende de la GPU y del tamaño de lote.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (CDLI, ga habla no estándar) | 1.543.490.560 | 30 s por segmento | ga (token `yo`) | no disponible | Hugging Face, safetensors |
| `cdli/whisper-large-v3_finetuned_ghanian_ga_standard_speech_v2.0` | 1.543.490.560 | 30 s por segmento | ga (token `yo`) | no disponible | Hugging Face; modelo base de este ajuste, WER 0,59 en el test no estándar |
| `openai/whisper-large-v3` | 1.550 millones | 30 s por segmento | multilingüe (sin ga) | MIT (según el modelo original de OpenAI; verificar) | Hugging Face, ampliamente soportado |
| `openai/whisper-large-v3-turbo` | 809 millones | 30 s por segmento | multilingüe (sin ga) | MIT (según el modelo original de OpenAI; verificar) | Hugging Face; menor coste computacional, sin ajuste a ga |

No se dispone de comparaciones publicadas con otros sistemas ASR específicos para habla no estándar en ga en la información proporcionada.

## Limitaciones y advertencias

- Generalización limitada: solo 4 hablantes en el test y un número reducido de hablantes en el dataset; la model card advierte explícitamente que el conjunto se presta mejor a personalización por hablante que a un modelo general.
- WER elevado en severidad moderada: 0,62 promediado por enunciado y hasta 0,67 en el hablante con parálisis cerebral, lo que hace inviable el uso autónomo en producción sin revisión humana.
- El WER promediado por enunciado no es una tasa de error comparable directamente con otras publicaciones; para comparaciones externas debe usarse el WER estándar de corpus (0,46).
- Token de idioma incorrecto: se decodifica con `yo` en lugar de un token para ga; cualquier cambio en el prompt o en el token de idioma puede degradar el rendimiento de forma no documentada.
- Sesgos de dominio: el modelo está entrenado sobre un conjunto específico de hablantes ghaneses con alteraciones del habla; no hay garantía de comportamiento en otras variedades de ga, otros dialectos o hablantes sin alteraciones.
- Riesgo de alucinación en ASR: Whisper puede generar texto plausible en segmentos con audio ruidoso o ininteligible, especialmente en lenguas de bajos recursos; se recomienda validación con puntuaciones de confianza y revisión humana.
- Licencia no disponible: no se puede confirmar el uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Fecha de creación futura en los metadatos (2026-10-25): conviene verificar la vigencia y el estado del repositorio antes de depender de él.
- Sin datos de cuantización ni de formatos alternativos: el despliegue en entornos con restricciones de memoria requiere convertir los pesos, con el riesgo de degradación no evaluada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cdli/whisper-large-v3_finetuned_ghanian_ga_nonstandard_speech_v1.1
- Modelo base (habla estándar en ga): https://huggingface.co/cdli/whisper-large-v3_finetuned_ghanian_ga_standard_speech_v2.0
- Dataset de habla no estándar en ga: https://huggingface.co/datasets/cdli/ghanian_ga_nonstandard_speech_v1.0
- Página de CDLI en Hugging Face: https://huggingface.co/cdli
- Whisper large-v3 (modelo original de OpenAI): https://huggingface.co/openai/whisper-large-v3
