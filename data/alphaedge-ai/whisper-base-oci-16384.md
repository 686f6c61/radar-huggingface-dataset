# alphaedge-ai/whisper-base-oci-16384

## Resumen

whisper-base-oci-16384 es una variante podada del modelo de reconocimiento automático del habla openai/whisper-base, publicada por alphaedge-ai. El modelo conserva la arquitectura encoder-decoder transformer original de Whisper, pero reduce el vocabulario del tokenizer de 51.865 a 16.384 tokens mediante la técnica de trimming, lo que rebaja el número de parámetros de 72,6 millones a 54,4 millones (un 25,02% menos) y disminuye el tamaño del repositorio hasta 0,1 GB. Está especializado en occitano (código de idioma `oc`).

La poda se realizó minando 70.426 textos del dataset lbourdois/fineweb-2-trimming para identificar los tokens realmente utilizados en occitano y eliminar el resto del vocabulario. El resultado es un modelo mucho más ligero en memoria que el original, pensado para despliegues con recursos limitados o para servir transcripción en una única lengua minoritaria sin cargar el vocabulario multilingüe completo de Whisper.

Es relevante porque demuestra una vía práctica de especialización de modelos ASR multilingües hacia lenguas de bajos recursos: en lugar de reentrenar, se recorta el vocabulario y se mantiene el comportamiento del modelo base en el idioma objetivo. La contrapartida es que el modelo deja de ser útil para otras lenguas, ya que los tokens correspondientes han sido eliminados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), con vocabulario podado |
| Parametros totales | 54.427.648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 s; el dato no se detalla en la información proporcionada) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en precisión original) |
| Idiomas soportados | occitano (`oc`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper de openai/whisper-base: un transformer encoder-decoder entrenado originalmente por OpenAI con supervisión débil a gran escala sobre pares audio-texto (paper arXiv:2212.04356). alphaedge-ai no reentrena el modelo; aplica trimming sobre el vocabulario, una técnica documentada por Hugging Face que consiste en identificar los tokens efectivamente usados en un corpus del idioma objetivo y recortar el embedding y la capa de salida al subconjunto resultante, reindexando los identificadores.

El corpus de minería son 70.426 textos del dataset lbourdois/fineweb-2-trimming, a partir de los cuales se seleccionaron los 16.384 tokens finales (reducción del 68,41% respecto al vocabulario original de 51.865). No se especifica en la información disponible si hubo ajuste fino posterior, RLHF/DPO ni qué proporción del corpus era realmente occitano. La innovación técnica es, por tanto, exclusivamente la compresión del vocabulario y la consiguiente reducción de parámetros y huella de memoria.

## Capacidades

- Transcripción de voz a texto (ASR) en occitano, con la pipeline `automatic-speech-recognition` de transformers.
- Entrada de audio remuestreada a 16 kHz, tal como exige Whisper.
- Generación de transcripciones con parámetros de idioma (`language="occitan"`) y tarea (`task="transcribe"`).
- Compatible con endpoints de Hugging Face (tag `endpoints_compatible`).
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- Capacidad multilingüe limitada al occitano: los tokens de otras lenguas fueron eliminados.
- No se documentan capacidades de visión, audio distinto de ASR ni modo de razonamiento explícito.

## Casos de uso

- Transcripción de archivos audiovisuales en occitano: el modelo convierte audio remuestreado a 16 kHz en texto mediante la pipeline de transformers, adecuado para digitalizar entrevistas, radios locales o archivos orales en esta lengua.
- Subtitulado automático de vídeo en occitano: al ser un modelo de 54 millones de parámetros y 0,1 GB, puede ejecutarse en un servidor modesto o incluso en local para generar subtítulos de contenido en esta lengua.
- Archivística y patrimonio oral: instituciones que conservan grabaciones en occitano pueden transcribir lotes de audio con un modelo ligero, sin necesidad de infraestructura GPU de gama alta.
- Aplicaciones de accesibilidad para hablantes de occitano: dictado o lectura de voz a texto en dispositivos con recursos limitados, gracias a la reducción del 25% en parámetros frente a whisper-base.
- Investigación en lenguas de bajos recursos: sirve como referencia para experimentos de trimming y especialización de modelos ASR multilingües hacia una única lengua.
- Despliegue en el borde o en contenedores pequeños: el tamaño del repo (0,1 GB) y la licencia Apache 2.0 facilitan empaquetar el modelo en servicios con restricciones de memoria.
- Evaluación comparativa de trimming: permite medir la pérdida de calidad frente a openai/whisper-base en occitano con un coste de inferencia menor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 54,4 millones de parámetros en fp32 el modelo ocupa aproximadamente 0,22 GB de pesos, y en fp16 alrededor de 0,11 GB, a lo que hay que sumar activaciones y buffers de audio.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) es sobradamente suficiente, e incluso CPU puede ser viable para lotes pequeños.
- Cabe en GPU consumer: sí, con margen amplio, dado el reducido número de parámetros.
- Opciones de despliegue: transformers (pipeline `automatic-speech-recognition`), endpoints de Hugging Face (tag `endpoints_compatible`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no son el entorno habitual para Whisper.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Vocabulario | Idiomas | Licencia | Contexto audio |
|---|---|---|---|---|---|
| alphaedge-ai/whisper-base-oci-16384 | 54.427.648 | 16.384 | occitano | Apache 2.0 | no disponible |
| openai/whisper-base | 72.593.920 | 51.865 | multilingüe | Apache 2.0 | ventanas de 30 s |
| openai/whisper-small | no disponible en la información | no disponible | multilingüe | Apache 2.0 | ventanas de 30 s |

La comparación directa con whisper-base muestra una reducción del 25,02% en parámetros y del 68,41% en vocabulario, a cambio de perder cobertura multilingüe. Frente a whisper-small, este último es de mayor tamaño y más preciso en general, pero no está especializado en occitano ni ha sido podado. No se dispone de datos de rendimiento comparado en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo está pensado para occitano; el propio autor advierte que puede no funcionar bien en otras lenguas porque los tokens correspondientes fueron eliminados del vocabulario.
- No se han publicado métricas de calidad (WER, CER) en la información disponible, por lo que el rendimiento real en occitano no está cuantificado.
- Riesgo de alucinación inherente a los modelos Whisper, especialmente con audio ruidoso o con acentos no representados en los datos de minería.
- La minería se hizo sobre 70.426 textos de fineweb-2-trimming; no se detalla la composición exacta ni la calidad del corpus occitano, lo que puede introducir sesgos de dominio.
- Licencia Apache 2.0: permite uso comercial, pero conviene conservar los avisos de atribución del modelo base y de la técnica de trimming.
- El repositorio es pequeño (0,1 GB) y tiene pocas descargas (55) y ningún like, lo que sugiere escasa validación por parte de la comunidad.
- No se documentan cuantizaciones publicadas, por lo que el despliegue en formatos GGUF u otros requeriría conversión propia.
- La fecha de creación indicada (2026-05-29) y la de actualización (2026-11-18) deben tomarse como metadatos del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/whisper-base-oci-16384
- Modelo base: https://huggingface.co/openai/whisper-base
- Dataset de minería: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Blog de introducción al trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Paper de Whisper: https://arxiv.org/abs/2212.04356
