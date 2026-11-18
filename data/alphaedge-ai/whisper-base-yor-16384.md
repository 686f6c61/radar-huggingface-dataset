# alphaedge-ai/whisper-base-yor-16384

## Resumen

whisper-base-yor-16384 es una variante reducida de openai/whisper-base, el modelo de reconocimiento automático del habla (ASR) de OpenAI publicado originalmente en 2022. Lo desarrolla el usuario alphaedge-ai aplicando la técnica de *trimming* de vocabulario descrita por Loïck Bourdois y colaboradores en Hugging Face, que consiste en recortar el vocabulario del tokenizador a los tokens realmente relevantes para un idioma concreto. En este caso, el vocabulario se reduce de 51.865 a 16.384 tokens (un 68,41 % menos) para optimizar el modelo en yoruba (`yo`), lo que se traduce en una reducción del 25,02 % en el número de parámetros: de 72.593.920 a 54.427.648.

El modelo conserva la arquitectura transformer encoder-decoder característica de Whisper, con una ventana de audio de 30 segundos y espectrogramas log-Mel de 80 canales a 16 kHz, pero con una capa de embedding y una proyección de salida mucho más pequeñas. El resultado es un checkpoint de apenas 0,1 GB, lo que facilita su despliegue en entornos con recursos limitados y su uso en pipelines de transcripción para yoruba.

Su relevancia radica en el ahorro de memoria y almacenamiento sin renunciar (en teoría) a la calidad en el idioma objetivo, algo especialmente útil para lenguas de bajos recursos como el yoruba, donde los modelos multilingües grandes suelen estar sobredimensionados. La licencia Apache 2.0 y el formato safetensors lo hacen apto para uso comercial y para integración directa con la librería `transformers`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parámetros totales | 54.427.648 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio (ventana fija de Whisper); contexto de texto no aplicable |
| Tipos de cuantización | no disponible en la información proporcionada (compatible con cuantización estándar de `transformers`, p. ej. int8) |
| Idiomas soportados | yoruba (`yo`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un *trimming* del checkpoint openai/whisper-base: no se ha reentrenado desde cero, sino que se ha reducido el vocabulario del tokenizador a 16.384 tokens seleccionados a partir de 67.447 textos del dataset `lbourdois/fineweb-2-trimming` en yoruba. Las matrices de embedding de entrada y la proyección de salida del decoder se recortan en consecuencia, manteniendo intactos el resto de pesos del transformer (encoder convolucional + transformer, decoder autorregresivo). La arquitectura subyacente es la de Whisper: encoder de audio con dos capas convolucionales y bloques transformer, decoder con atención cruzada sobre la representación del encoder, predicción token a token y tokens especiales de idioma y tarea.

No se documenta en la información disponible ningún proceso adicional de entrenamiento, fine-tuning supervisado, RLHF ni DPO sobre el modelo recortado. La innovación técnica es exclusivamente el *trimming* de vocabulario, una técnica que reduce el tamaño del modelo y el consumo de memoria a costa de perder cobertura léxica para idiomas distintos del yoruba. El modelo se distribuye como artefacto derivado del original, por lo que hereda sus sesgos y limitaciones de entrenamiento (datos débiles y ruidosos a gran escala, según el paper de Whisper).

## Capacidades

- Reconocimiento automático del habla (ASR) en yoruba a partir de audio de 16 kHz.
- Transcripción de audio de hasta 30 segundos por ventana; para audios más largos es necesario segmentar o usar el modo *long-form* del pipeline de `transformers`.
- Detección y uso de tokens especiales de idioma (`yoruba`) y tarea (`transcribe`), tal como se muestra en el ejemplo de uso.
- No soporta traducción a otros idiomas de forma fiable, al haberse recortado el vocabulario para yoruba.
- No incluye *tool calling*, *function calling* ni capacidades de agente: es un modelo puramente ASR.
- No dispone de modo *thinking*, visión ni audio más allá de la transcripción.
- Capacidad multilingüe muy limitada: el propio autor advierte que «puede no funcionar bien para otros idiomas» al haberse eliminado tokens no usados en yoruba.

## Casos de uso

- Transcripción de entrevistas y grabaciones de campo en yoruba: el modelo puede procesar audios de hasta 30 segundos por segmento con un consumo de memoria muy bajo, adecuado para equipos de investigación lingüística o proyectos de documentación de lenguas de bajos recursos.
- Subtitulado automático de contenido audiovisual en yoruba: integrado en un pipeline que segmente el audio en ventanas de 30 s, permite generar subtítulos con un coste computacional reducido en comparación con whisper-base completo.
- Asistentes de voz para atención al ciudadano en yoruba: al ser un checkpoint de 0,1 GB, puede desplegarse en servidores modestos o incluso en dispositivos *edge* con cuantización, ofreciendo transcripción en tiempo casi real para servicios públicos o sanitarios.
- Archivado y búsqueda de audio histórico: transcripción masiva de archivos de radio o grabaciones comunitarias en yoruba para indexación y búsqueda por texto, aprovechando el reducido tamaño del modelo para procesar grandes volúmenes.
- Investigación en ASR para lenguas de bajos recursos: sirve como *baseline* ligero para comparar técnicas de compresión (trimming, cuantización, destilación) frente a whisper-base original en yoruba.
- Aplicaciones móviles de dictado en yoruba: el modelo puede exportarse a formatos ligeros y ejecutarse en dispositivos con recursos limitados, ya que su tamaño de 0,1 GB y sus 54 M de parámetros lo hacen viable en *smartphones* de gama media.
- Preprocesado para *pipelines* de NLP en yoruba: transcripción de audio a texto que alimente modelos de análisis de sentimiento, resumen o traducción específicos para este idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de WER (word error rate) ni comparaciones cuantitativas con whisper-base en yoruba, más allá de la afirmación cualitativa de que «debería rendir de forma similar al modelo original» para el idioma objetivo.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 54,4 M de parámetros en fp32, los pesos ocupan aproximadamente 218 MB; en fp16, unos 109 MB. Con overhead de activaciones y buffers de audio, el consumo real se sitúa en torno a 0,5-1 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; funciona sin problemas en GTX 1650, RTX 3050, RTX 4090, A100 o H100. También puede ejecutarse en CPU con latencia aceptable para audios cortos.
- Cabe en cualquier GPU de consumo actual e incluso en iGPU y dispositivos móviles con cuantización.
- Opciones de despliegue: `transformers` (pipeline `automatic-speech-recognition`), `optimum` para ONNX, y potencialmente `whisper.cpp` si se convierte el checkpoint (no documentado en la información disponible). No se mencionan integraciones con vLLM, TGI o Ollama, que no están orientadas a ASR.
- Latencia y throughput: no disponibles en la información proporcionada. Dado el tamaño reducido, se espera una latencia inferior a la de whisper-base, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Vocabulario | Idiomas | Licencia | Tamaño repo |
|---|---|---|---|---|---|
| alphaedge-ai/whisper-base-yor-16384 | 54.427.648 | 16.384 | yoruba | apache-2.0 | 0,1 GB |
| openai/whisper-base | 72.593.920 | 51.865 | multilingüe (99 idiomas) | apache-2.0 | ~0,3 GB |
| openai/whisper-small | 244 M (aprox.) | 51.865 | multilingüe | apache-2.0 | ~1 GB |

La comparación directa más relevante es con openai/whisper-base: el modelo recortado es un 25,02 % más pequeño en parámetros y un 68,41 % más pequeño en vocabulario, a costa de perder capacidad multilingüe. Frente a whisper-small, el recortado es aproximadamente 4,5 veces más pequeño en parámetros, aunque no hay datos de WER que permitan comparar calidad en yoruba. No se dispone de información sobre otros modelos específicos para yoruba en la documentación proporcionada.

## Limitaciones y advertencias

- El vocabulario recortado elimina tokens no usados en yoruba, por lo que el modelo no es fiable para otros idiomas, incluidos los que whisper-base sí soporta.
- Al derivar de whisper-base, hereda los sesgos y errores del entrenamiento original de Whisper con datos débiles y ruidosos: posibles alucinaciones en pasajes de audio ambiguos o con ruido, y errores en nombres propios o términos poco frecuentes.
- No hay métricas publicadas de WER en yoruba para este checkpoint, por lo que la afirmación de rendimiento similar al original no está verificada empíricamente.
- La ventana de audio está limitada a 30 segundos; audios más largos requieren segmentación manual o el modo *long-form*, que puede introducir errores en las fronteras.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda conservar la atribución a OpenAI (Whisper) y a los autores de la técnica de trimming.
- El modelo se ha publicado en 2026 y cuenta con muy pocas descargas (53) y ningún *like*, por lo que no hay validación comunitaria extensa.
- No se documentan procesos de evaluación de robustez frente a acentos, ruido de fondo o habla espontánea en yoruba.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/whisper-base-yor-16384
- Modelo base: https://huggingface.co/openai/whisper-base
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Dataset de minería: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
