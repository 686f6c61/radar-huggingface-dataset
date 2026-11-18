# alphaedge-ai/whisper-base-tgl-16384

## Resumen

whisper-base-tgl-16384 es una variante recortada (trimmed) de openai/whisper-base, publicada por alphaedge-ai y especializada en tagalo. El modelo parte de los pesos originales de Whisper Base (arquitectura encoder-decoder transformer para reconocimiento automático del habla) y aplica la técnica de trimming de vocabulario: se eliminan los tokens del tokenizador que no aparecen en un corpus de minería en tagalo, reduciendo el vocabulario de 51.865 a 16.384 tokens. El resultado es un modelo un 25,02 % más pequeño en parámetros (54.427.648 frente a 72.593.920) y con una huella de memoria notablemente inferior.

La motivación es práctica: Whisper Base original arrastra un vocabulario multilingüe de más de 51.000 tokens que resulta sobredimensionado cuando solo se necesita transcribir un único idioma. Al recortar el vocabulario, se reduce el tamaño de la matriz de embeddings y de la proyección de salida, lo que abarata el despliegue en entornos con recursos limitados sin renunciar, en teoría, a la calidad en el idioma objetivo.

Es relevante ahora porque el ecosistema de modelos ASR especializados por idioma crece como alternativa a los modelos multilingües genéricos, y el tagalo (con millones de hablantes en Filipinas) está poco cubierto por los modelos ASR de referencia. La licencia Apache 2.0 y el formato transformers/safetensors facilitan su integración en pipelines existentes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parámetros totales | 54.427.648 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper) |
| Tipos de cuantización | no disponible (pesos en safetensors; compatible con cuantización estándar de transformers, sin confirmar en la model card) |
| Idiomas soportados | tl (tagalo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 0,1 GB) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper Base: un transformer encoder-decoder con atención estándar, entrenado originalmente por OpenAI con supervisión débil a gran escala (paper arXiv:2212.04356). El modelo recibe audio muestreado a 16 kHz y genera texto token a token con tokens especiales de idioma y tarea. Esta variante no reentrena el modelo: parte de los pesos de openai/whisper-base y aplica trimming de vocabulario, recortando el tokenizador a 16.384 tokens y eliminando las filas correspondientes de las matrices de embeddings y de la proyección de salida. La model card indica explícitamente la relación `base_model_relation: quantized`.

El corpus de minería empleado para decidir qué tokens conservar consta de 110.351 textos del dataset lbourdois/fineweb-2-trimming en tagalo. No se documenta ningún entrenamiento adicional, ajuste fino, RLHF ni DPO tras el recorte; el modelo conserva los pesos del original salvo por la reducción dimensional. La innovación técnica es, por tanto, exclusivamente el trimming: reduce un 68,41 % el vocabulario y un 25,02 % los parámetros, con la contrapartida de que los tokens eliminados ya no pueden generarse.

## Capacidades

- Transcripción de voz a texto en tagalo (pipeline `automatic-speech-recognition`).
- Detección y selección de idioma mediante `generate_kwargs` (`language: tagalog`), heredada de Whisper.
- Tareas de transcripción y traducción heredadas de la interfaz de Whisper (la model card solo documenta `task: transcribe`).
- Procesamiento de audio a 16 kHz con ventana de 30 segundos por segmento, propia de Whisper Base.
- Integración nativa con `transformers` (`AutoModelForSpeechSeq2Seq`, `AutoProcessor`, `pipeline`).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá del ASR.

## Casos de uso

- Transcripción de reuniones y llamadas en tagalo: el modelo convierte audio de 16 kHz en texto con una ventana de 30 s por segmento, adecuado para actas y resúmenes posteriores en empresas filipinas.
- Subtitulado automático de vídeo en tagalo: integrable en pipelines de `transformers` para generar pistas de subtítulos en plataformas de contenido o archivos audiovisuales.
- Atención al cliente en centros de contacto: transcripción de grabaciones de llamadas para análisis de calidad, búsqueda y cumplimiento, con un modelo de 54 M de parámetros que reduce el coste de inferencia frente a Whisper Base completo.
- Investigación lingüística y creación de corpus: generación de transcripciones a escala sobre grabaciones en tagalo para estudios de fonética, sociolingüística o construcción de datasets.
- Despliegue en dispositivos con recursos limitados: al ser un 25 % más pequeño que Whisper Base, encaja mejor en CPUs, GPUs de gama baja o entornos embebidos donde el modelo original resulta ajustado.
- Accesibilidad: generación de transcripciones en vivo o diferidas para personas con discapacidad auditiva en contenido en tagalo.
- Preprocesado para pipelines de NLP: convertir audio en tagalo a texto antes de aplicar análisis de sentimiento, resumen o extracción de entidades con modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (54,4 M de parámetros, ~218 MB de pesos) y en torno a 0,1-0,2 GB en fp16/int8; el repositorio ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU moderna es suficiente; no requiere A100 ni H100. Una RTX 4090 o incluso una GTX 1650 lo ejecutan con holgura.
- Cabe en GPU consumer y en CPU: es un modelo diseñado para entornos de bajos recursos; la inferencia en CPU es viable para volúmenes moderados.
- Opciones de despliegue: `transformers` (pipeline oficial), y por compatibilidad de arquitectura Whisper, herramientas como vLLM (soporte ASR), llama.cpp/Ollama (si convierten los pesos, no documentado en la model card) y TGI (no confirmado).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Vocabulario | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| whisper-base-tgl-16384 | 54,4 M | 16.384 | tl | Apache 2.0 | Variante trimmed de Whisper Base |
| openai/whisper-base | 72,6 M | 51.865 | multilingüe | Apache 2.0 | Modelo original, mayor huella |
| openai/whisper-tiny | ~39 M | 51.865 | multilingüe | Apache 2.0 | Menor precisión general que Base |
| openai/whisper-small | ~244 M | 51.865 | multilingüe | Apache 2.0 | Mayor calidad, mayor coste |

## Limitaciones y advertencias

- El recorte de vocabulario elimina tokens no usados en tagalo; el modelo puede degradarse o fallar en otros idiomas, tal como advierte la model card.
- No se han publicado métricas (WER, CER) que confirmen que el rendimiento en tagalo se mantiene respecto al original; la afirmación de "rendimiento similar" no está cuantificada.
- Riesgo de alucinación inherente a Whisper, especialmente en audio con ruido, acentos no vistos o silencios largos.
- Ventana de audio de 30 s por segmento; audios más largos requieren segmentación y pueden perder coherencia entre fragmentos.
- Sesgos heredados de los datos de entrenamiento originales de Whisper (distribución de hablantes, dominios y acentos).
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la procedencia de los datos de minería (fineweb-2-trimming) si se exige trazabilidad.
- Modelo con solo 55 descargas y 0 likes en el momento de la consulta: ecosistema de validación limitado.
- No hay información sobre cuantizaciones publicadas ni sobre latencia en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/whisper-base-tgl-16384
- Modelo base: https://huggingface.co/openai/whisper-base
- Dataset de minería: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Blog de introducción al trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Paper de Whisper: https://arxiv.org/abs/2212.04356
