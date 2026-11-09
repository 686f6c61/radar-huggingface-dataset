# mradermacher/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-i1-GGUF

## Resumen

NVIDIA-Nemotron-3.5-Transcribe-30B-A4B es un modelo de lenguaje de gran escala especializado en transcripción de voz (speech LLM) desarrollado por NVIDIA, publicado originalmente en el repositorio `nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B`. El modelo aborda la transcripción inteligente: no solo convierte audio en texto, sino que admite instrucciones en lenguaje natural para seleccionar entre transcripción literal o en formato escrito, añadir contexto, atribuir hablantes y generar marcas de tiempo por palabra. Según NVIDIA, es el mejor modelo de pesos abiertos en los leaderboards Open ASR en inglés y multilingüe.

La ficha que nos ocupa, `mradermacher/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-i1-GGUF`, es una cuantización GGUF de terceros (autor mradermacher) del modelo original, generada con el pipeline de cuantización de imatrix/weighted quants. El nombre indica una arquitectura de tipo Mixture of Experts con aproximadamente 30B parámetros totales y unos 4B activos por token (sufijo A4B). El repositorio tiene un tamaño de 0,1 GB, lo que sugiere que en el momento de la consulta solo contiene metadatos o ficheros parciales, y registra 0 descargas y 0 likes.

La relevancia de esta ficha es doble: por un lado, documenta un modelo de transcripción de NVIDIA con capacidades poco habituales (instrucciones en lenguaje natural para controlar el formato de salida); por otro, advierte de que la variante GGUF aquí listada es una conversión de la comunidad con información muy incompleta y sin datos de licencia ni idiomas declarados en el repo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) segun el nombre del modelo (30B-A4B); detalles internos no disponibles |
| Parametros totales | ~30B segun el nombre del modelo; el campo safetensors del repo GGUF indica 27.639.351 (dato inconsistente, probablemente del repo de cuantizacion y no del modelo base) |
| Parametros activos | ~4B por token (segun sufijo A4B del nombre) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | 40 idiomas de transcripcion segun NVIDIA; lista concreta no disponible |
| Licencia | no disponible en el repo GGUF; consultar la licencia del modelo base de NVIDIA |
| Formato de pesos | GGUF (cuantizaciones de llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un speech LLM de NVIDIA orientado a transcripción inteligente. El nombre `30B-A4B` indica una arquitectura Mixture of Experts con aproximadamente 30B parámetros totales y unos 4B activos por token, lo que reduce el coste computacional por token frente a un modelo denso del mismo tamaño. La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens, ni si se emplearon técnicas de RLHF o DPO; tampoco se especifica el encoder de audio ni el mecanismo de fusión audio-texto.

La innovación principal documentada por NVIDIA es el control de la transcripción mediante instrucciones en lenguaje natural: un mismo modelo puede producir transcripción literal, transcripción en formato escrito, salida con contexto, atribución de hablantes y marcas de tiempo por palabra, seleccionando el modo mediante el prompt. La variante aquí listada es una cuantización GGUF de la comunidad generada con cuantización ponderada por imatrix (según los metadatos del README), lo que preserva mejor la calidad en cuantizaciones agresivas (Q2, IQ2, IQ3) a costa de un proceso de conversión más costoso.

## Capacidades

- Transcripción de audio a texto en 40 idiomas, en modo literal o en formato escrito (puntuación, mayúsculas y normalización).
- Control del formato de salida mediante instrucciones en lenguaje natural (contexto, formato, estilo).
- Atribución de hablantes (speaker attribution) en la transcripción.
- Marcas de tiempo a nivel de palabra (word timestamps).
- Procesamiento de audio como entrada multimodal (speech LLM), además de generación de texto.
- Capacidades multilingües: 40 idiomas de transcripción según NVIDIA.
- No hay información disponible sobre tool calling, function calling, modo thinking, visión o audio generativo más allá de la transcripción.

## Casos de uso

- Subtitulado automático de vídeo y audio: el modelo puede generar transcripciones con marcas de tiempo por palabra, adecuadas para subtítulos sincronizados en plataformas de vídeo.
- Actas de reuniones: con atribución de hablantes y contexto, permite generar resúmenes estructurados de reuniones multihablante indicando quién dijo qué.
- Transcripción de entrevistas y periodismo: el modo literal conserva muletillas y titubeos, útil para análisis lingüístico o citas exactas; el modo escrito sirve para publicación directa.
- Atención al cliente y análisis de llamadas: transcripción multilingüe de grabaciones para auditoría de calidad, búsqueda y cumplimiento normativo.
- Accesibilidad: generación de subtítulos en directo o diferido para personas con discapacidad auditiva en entornos educativos y corporativos.
- Documentación clínica o legal dictada: el control por instrucciones permite adaptar el formato de salida (escrito, con puntuación) a informes que requieren estilo formal.
- Investigación en lingüística computacional: análisis de corpus orales multilingües con marcas de tiempo y separación de hablantes.

## Benchmarks y rendimiento

NVIDIA afirma que Nemotron 3.5 Transcribe es el mejor modelo de pesos abiertos en los leaderboards Open ASR en inglés y multilingüe, pero en la información disponible no se incluyen las cifras concretas (WER por idioma, comparativas numéricas). No se han publicado resultados de benchmarks detallados en la información disponible.

## Requisitos de hardware

- Con ~30B parámetros totales y ~4B activos, la inferencia en GGUF es viable en hardware de consumo, aunque el tamaño en disco y en memoria depende de la cuantización elegida.
- Estimación orientativa de memoria para pesos: Q4_K_M en torno a 18-20 GB; Q5_K_M en torno a 22-24 GB; Q6_K en torno a 26-28 GB; Q8 no listada. Las cuantizaciones Q2/IQ2 reducen a ~10-12 GB. Estas cifras son estimaciones a partir del número de parámetros y no datos publicados para este modelo concreto.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M/Q5_K_M; RTX 3090 (24 GB) similar; A100 40/80 GB o H100 para cuantizaciones altas y mayor throughput; configuraciones multi-GPU para Q6_K y superiores.
- Despliegue: llama.cpp y Ollama para GGUF; vLLM y TGI no soportan GGUF de forma nativa para este tipo de modelo multimodal, por lo que se requeriría el modelo base en safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Transcribe-30B-A4B (este, GGUF) | ~30B totales / ~4B activos | no disponible | 40 | no disponible | GGUF |
| Whisper large-v3 (OpenAI) | ~1,55B | 30 s por ventana | ~99 | MIT | safetensors, GGUF, etc. |
| Whisper large-v3-turbo | ~809M | 30 s por ventana | ~99 | MIT | safetensors, GGUF, etc. |
| NVIDIA Canary-1B | ~1B | no disponible | 4 (en, de, fr, es) | CC-BY-NC-4.0 | NeMo |

La comparativa es cualitativa: Nemotron 3.5 Transcribe destaca por el control mediante instrucciones en lenguaje natural, atribución de hablantes y marcas de tiempo por palabra, capacidades que Whisper no ofrece de forma nativa. A cambio, su tamaño (~30B totales) es mucho mayor que el de Whisper large-v3, lo que encarece el despliegue. No se dispone de cifras de WER comparativas en la información proporcionada.

## Limitaciones y advertencias

- La información del repositorio GGUF es muy incompleta: no declara licencia, idiomas ni pipeline; la licencia real debe consultarse en el modelo base de NVIDIA antes de cualquier uso comercial.
- El campo de parámetros del repo (27.639.351) es inconsistente con el nombre del modelo (~30B) y probablemente refleja metadatos del proceso de cuantización, no el tamaño real.
- El repositorio tiene 0,1 GB de tamaño y 0 descargas, lo que sugiere que puede estar incompleto o recién creado; verificar la integridad de los ficheros GGUF antes de usarlo.
- Las cuantizaciones Q2/IQ2 pueden degradar notablemente la calidad de transcripción, especialmente en idiomas con menor representación; se recomienda Q4_K_M o superior para producción.
- Riesgo de alucinación en audio con ruido, solapamiento de hablantes o acentos no representados en el entrenamiento; no hay datos publicados sobre robustez en estas condiciones.
- La atribución de hablantes y las marcas de tiempo pueden ser imprecisas en conversaciones con cambios rápidos de turno.
- Al ser un modelo de NVIDIA con posible licencia restrictiva para uso comercial, es imprescindible revisar los términos del modelo base antes de integrarlo en productos.
- No hay información sobre sesgos lingüísticos o demográficos del modelo base.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-i1-GGUF
- Modelo base en Hugging Face: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- Página de investigación de NVIDIA: https://research.nvidia.com/labs/nemotron/NVIDIA-Nemotron-3.5-Transcribe/
- Cuantización GGUF alternativa (prithivMLmods): https://huggingface.co/prithivMLmods/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-GGUF
