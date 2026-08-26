# abr-ai/niagara-38m-batch.en

## Resumen

El modelo `abr-ai/niagara-38m-batch.en` es un sistema de reconocimiento automático del habla (ASR) en inglés desarrollado por Applied Brain Research (ABR), una empresa canadiense especializada en modelos de estado espacial (SSM). Con aproximadamente 38 millones de parámetros, este modelo está diseñado para ofrecer un equilibrio óptimo entre precisión y eficiencia, siendo presentado por sus creadores como el ASR en inglés de código abierto más preciso por debajo de los 100 millones de parámetros, con un WER medio del 8,91%.

La arquitectura se basa en un State Space Model (SSM) combinado con mecanismos de atención, una combinación que permite procesar secuencias de audio de forma eficiente manteniendo un bajo coste computacional. El modelo fue entrenado con aproximadamente 50.000 horas de habla en inglés procedentes de múltiples conjuntos de datos públicos, una cifra notablemente inferior a la empleada por competidores como Whisper (que utiliza alrededor de 200.000 horas). Esta versión concreta es una variante *batch* (no causal), diseñada específicamente para permitir comparaciones directas con otros modelos en el Open ASR Leaderboard, aunque ABR ofrece versiones comerciales con capacidades de streaming en tiempo real con latencias inferiores a 120 ms.

La relevancia actual de este modelo radica en su idoneidad para entornos de edge computing y dispositivos con recursos limitados. Su pequeño tamaño permite ejecutarlo en CPU sin necesidad de GPU, lo que lo convierte en una opción atractiva para aplicaciones de ASR en tiempo real, asistentes de voz embebidos y sistemas de transcripción que requieren bajo consumo energético. La liberación del modelo bajo una licencia open source específica de ABR facilita su evaluación por parte de la comunidad de desarrolladores e investigadores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | State Space Model (SSM) con atención |
| Parametros totales | ~38 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa audio, no texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés |
| Licencia | Applied Brain Research Open License |
| Formato de pesos | Safetensors (vía transformers) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de State Space Model (SSM) con mecanismos de atención, una combinación que permite procesar secuencias de audio de forma eficiente. Los SSM tratan los datos secuenciales como un flujo continuo, manteniendo el estado de forma eficiente a lo largo del tiempo, lo que los hace especialmente adecuados para tareas de procesamiento de audio. Esta variante concreta es no causal (tipo batch), diseñada para ofrecer comparaciones justas con otros modelos del Open ASR Leaderboard; ABR también comercializa versiones causales con capacidades de streaming.

El entrenamiento se realizó con aproximadamente 50.000 horas de habla en inglés procedentes de múltiples conjuntos de datos públicos, entre ellos LibriSpeech (clean), VoxPopuli, GigaSpeech, Common Voice, TED-LIUM, Europarl, Earnings-22, AMI-IHM y SPGISpeech. El preprocesamiento de audio se basa en características MFCC (Mel-frequency cepstral coefficients) y el modelo se entrena con pérdida CTC (Connectionist Temporal Classification). La decodificación se realiza mediante greedy CTC y la tokenización emplea SentencePiece. El modelo genera texto en minúsculas sin puntuación.

## Capacidades

- Reconocimiento automático del habla en inglés: transcribe audio en inglés a texto, con un WER medio del 8,91% en los benchmarks publicados.
- Procesamiento por lotes: la variante batch permite transcribir múltiples archivos de audio de forma eficiente en una sola pasada.
- Eficiencia computacional: con solo 38 millones de parámetros, el modelo puede ejecutarse en CPU sin necesidad de GPU, lo que lo hace adecuado para entornos con recursos limitados.
- Entrada de audio estándar: acepta audio mono de 16 kHz en formato WAV, el formato habitual en la mayoría de los conjuntos de datos de ASR.
- Integración con Hugging Face Transformers: se puede cargar mediante las APIs estándar de Transformers con `AutoModel`, `AutoFeatureExtractor` y `AutoTokenizer`.
- Compatible con endpoints de Hugging Face: el modelo está marcado como `endpoints_compatible`, lo que facilita su despliegue en la infraestructura de Hugging Face.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo puede transcribir grabaciones de reuniones o entrevistas en inglés de forma eficiente, incluso en CPU, lo que lo hace adecuado para aplicaciones de toma de notas automáticas en entornos corporativos.
- Subtitulado de vídeos: gracias a su capacidad de procesamiento por lotes, puede generar subtítulos para vídeos de forma masiva, con un coste computacional reducido en comparación con modelos más grandes.
- Asistentes de voz embebidos: su pequeño tamaño y bajo consumo lo hacen idóneo para integrarse en dispositivos IoT, asistentes de voz locales o sistemas de domótica que requieren reconocimiento de voz sin conexión a la nube.
- Análisis de llamadas de atención al cliente: las empresas pueden transcribir llamadas de soporte en inglés para analizar el sentimiento, extraer información o evaluar la calidad del servicio, sin necesidad de infraestructura GPU.
- Herramientas de accesibilidad: el modelo puede integrarse en aplicaciones de subtitulado en tiempo real para personas con discapacidad auditiva, ofreciendo una alternativa de bajo coste a soluciones basadas en la nube.
- Evaluación comparativa de modelos ASR: al ser una variante batch diseñada para el Open ASR Leaderboard, resulta útil para que investigadores y desarrolladores comparen el rendimiento de diferentes arquitecturas de ASR bajo condiciones estandarizadas.

## Benchmarks y rendimiento

El modelo reporta los siguientes resultados de WER (Word Error Rate) en comparación con su variante más pequeña (niagara-19m):

| Benchmark | niagara-19m | niagara-38m |
|---|---|---|
| AMI | 18,28% | 15,46% |
| Earnings22 | 13,18% | 11,83% |
| GigaSpeech | 14,21% | 11,41% |
| VoxPopuli | 9,82% | 8,67% |
| AMI (Cleaned) | 16,71% | 13,76% |
| Earnings22 (Cleaned, AA-chunked) | 16,33% | 12,94% |
| GigaSpeech (Cleaned) | No disponible | No disponible |

El WER medio reportado es del 8,91%. ABR afirma que el modelo alcanza una precisión comparable a Whisper con 6 veces menos parámetros, aunque no se proporcionan comparativas directas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de solo 38 millones de parámetros, la VRAM necesaria es mínima; puede ejecutarse en CPU sin necesidad de GPU.
- GPU recomendadas: no se requieren GPUs específicas; cualquier CPU moderna con suficiente RAM es suficiente para la inferencia.
- Compatibilidad con GPUs de consumo: el modelo cabe sin problema en cualquier GPU de consumo (por ejemplo, RTX 3060 o superior) si se desea acelerar la inferencia, aunque no es necesario.
- Opciones de despliegue: el modelo se integra con Hugging Face Transformers, por lo que puede desplegarse con vLLM, TGI, o directamente con la API de Transformers. También puede ejecutarse en el espacio de demostración de Hugging Face en una instancia CPU gratuita.
- Latencia y throughput: no se proporcionan datos específicos de latencia o throughput, pero el tamaño reducido del modelo sugiere tiempos de inferencia rápidos incluso en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER medio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| niagara-38m-batch.en | 38M | No aplica | 8,91% | ABR Open License | Hugging Face |
| niagara-19m | 19M | No aplica | ~14% (estimado) | ABR Open License | Hugging Face |
| Whisper (variantes pequeñas) | 39M-244M | No aplica | No comparable directamente | MIT | Hugging Face / OpenAI |

La comparativa directa con Whisper no es posible con los datos disponibles, ya que ABR afirma que su modelo ofrece precisión similar a Whisper con menos parámetros, pero no se proporcionan los resultados de WER de Whisper en los mismos benchmarks. El modelo se posiciona como el más preciso entre los ASR de código abierto con menos de 100 millones de parámetros en el Open ASR Leaderboard.

## Limitaciones y advertencias

- El modelo solo transcribe audio en inglés y genera texto en minúsculas sin puntuación, lo que limita su uso en aplicaciones que requieran formato de texto enriquecido.
- La variante publicada es no causal (batch), por lo que no es adecuada para transcripción en streaming en tiempo real; la versión con streaming está disponible solo bajo licencia comercial.
- No se han evaluado otras capacidades más allá de la transcripción de voz a texto; el modelo no debe utilizarse para inferir características humanas o para transcribir individuos sin su consentimiento explícito.
- La licencia Applied Brain Research Open License puede tener restricciones específicas para uso comercial; se recomienda revisar los términos completos en el enlace proporcionado.
- Aunque el modelo es preciso en los benchmarks publicados, se recomienda realizar evaluaciones exhaustivas para cada caso de uso concreto, especialmente en entornos de alto riesgo donde los errores de transcripción puedan tener consecuencias significativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abr-ai/niagara-38m-batch.en
- Demo en el navegador: https://huggingface.co/spaces/abr-ai/niagara-asr-demo
- Blog de ABR sobre Niagara-38m: https://www.appliedbrainresearch.com/edge-speech-recognition-niagara-38m
- Documentación de Niagara ASR: https://docs.appliedbrainresearch.com/models-asr/
- Licencia: https://www.appliedbrainresearch.com/license
- Blog de Hugging Face sobre SSM: https://huggingface.co/blog/lbourdois/get-on-the-ssm-train
