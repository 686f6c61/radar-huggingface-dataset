# juice500/hubert-21-phonemodel

## Resumen

hubert-21-phonemodel es un adaptador ligero sobre el codificador auto-supervisado HuBERT-large (facebook/hubert-large-ll60k) que realiza segmentación y reconocimiento de fonos a partir de sus características congeladas. El modelo aplica la técnica SPAM (S3M-based Phonological Activation Mapping), que proyecta cada frame del codificador en un vector de 43 activaciones fonológicas interpretables (sonoridad, nasalidad, estridentia, etc.), sustituyendo la representación opaca del transformer por un espacio de rasgos lingüísticamente motivados. Lo desarrolla juice500 (Shikhar Bharadwaj y colaboradores) y se publica junto al artículo presentado en SLT 2026.

El modelo corresponde a un único punto de la rejilla codificador × capa (Figura 2 del paper): concretamente la capa 21 de HuBERT-large a 16 kHz. No es un modelo generativo ni un LLM: es una herramienta especializada de análisis fonético que convierte audio en una secuencia de segmentos con etiquetas de fonos y tiempos en segundos. Su relevancia radica en que ofrece segmentación y reconocimiento de fonos con un vocabulario configurable por inventario PHOIBLE, algo útil para investigación fonológica, anotación de corpus y evaluación de sistemas TTS/ASR.

El repositorio tiene un tamaño de 0,0 GB, cero descargas y cero likes en el momento de la consulta, lo que indica un modelo de investigación reciente y poco difundido. La licencia es MIT y el único idioma declarado es inglés, aunque el vocabulario de reconocimiento puede restringirse a inventarios de otras lenguas mediante PHOIBLE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador SPAM sobre codificador HuBERT-large (transformer auto-supervisado con CNN feature extractor) |
| Parametros totales | no disponible (el adaptador es ligero; el codificador base HuBERT-large tiene ~300 M, dato no confirmado en la información proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio a 16 kHz por frames; no se especifica ventana máxima) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (reconocimiento restringible a inventarios de otras lenguas vía PHOIBLE) |
| Licencia | MIT (el vocabulario PHOIBLE 2.0 descargado en runtime es CC BY-SA 3.0) |
| Formato de pesos | no disponible (adaptador cargado vía librería phonespam) |

## Arquitectura y entrenamiento

El sistema parte de las representaciones congeladas de HuBERT-large (facebook/hubert-large-ll60k), un modelo auto-supervisado de reconocimiento de voz entrenado sobre audio de 16 kHz. Sobre la capa 21 del codificador se aplica SPAM, que mapea cada frame a un vector de 43 activaciones fonológicas en el rango [0, 1] con nombres como "silence+", "syl+", "son+" (rasgos de silencio, silabicidad, sonoridad, etc.). A partir de esa representación interpretable, dos cabezas leen la información: una para segmentación de fonos y otra para reconocimiento, produciendo segmentos contiguos con tiempos de inicio y fin en segundos.

El adaptador se entrena sobre el dataset timit-asr/timit_asr, el corpus TIMIT para reconocimiento fonético del inglés. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se empleó RLHF/DPO (no procede, al no ser un modelo generativo). La innovación técnica destacable es precisamente SPAM: convertir una representación latente opaca en un espacio de rasgos fonológicos interpretables, lo que permite inspeccionar qué información fonética codifica cada capa del S3M. El modelo documenta explícitamente que forma parte de una rejilla de experimentos y que el mejor modelo de la familia es juice500/wavlm-24-phonemodel.

## Capacidades

- Segmentación de fonos: devuelve segmentos contiguos con tiempos de inicio y fin en segundos sobre audio de 16 kHz.
- Reconocimiento de fonos: etiqueta cada segmento con un símbolo fonético, con vocabulario configurable por inventario PHOIBLE.
- Activación fonológica interpretable: expone un vector de 43 rasgos (voicing, nasality, stridency, etc.) por frame mediante `model.spam()`.
- Restricción de vocabulario por lengua: `vocab_for_language("deu")` limita el reconocimiento al inventario fonológico de una lengua concreta.
- Inspección de representaciones: permite analizar qué información fonética codifica la capa 21 de HuBERT-large.
- No soporta tool calling, function calling, agentes ni multi-step reasoning (no es un modelo de lenguaje).
- No soporta visión, audio generativo ni thinking mode.
- Capacidades multilingües limitadas: el modelo está entrenado en inglés; el reconocimiento en otras lenguas depende del inventario PHOIBLE, no de entrenamiento específico.

## Casos de uso

- Anotación fonética de corpus: el modelo transcribe audio en segmentos con etiquetas de fonos y tiempos, acelerando el etiquetado manual de corpus de habla para investigación fonética y fonológica.
- Evaluación de sistemas TTS y ASR: comparar la salida fonética de un sintetizador o reconocedor con la segmentación del modelo permite medir errores de pronunciación a nivel de fono.
- Investigación sobre modelos auto-supervisados: inspeccionar las 43 activaciones fonológicas por frame permite estudiar qué rasgos codifica la capa 21 de HuBERT-large y comparar capas o codificadores.
- Análisis de inventarios fonológicos: restringiendo el vocabulario a un inventario PHOIBLE concreto, el modelo puede usarse para estudiar realizaciones fonéticas en lenguas con inventarios específicos.
- Docencia de fonética: generar alineaciones fono a fono con tiempos para material didáctico y ejercicios de transcripción.
- Preprocesamiento para pipelines de voz: producir segmentaciones fonéticas como entrada para sistemas posteriores de análisis prosódico o de verificación de pronunciación.
- Detección de spam telefónico: la etiqueta "phonespam" del repositorio sugiere uso en el análisis de llamadas no deseadas, aunque la información disponible no detalla esta aplicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; al tratarse de un adaptador sobre HuBERT-large congelado, la carga principal es el codificador base, pero no se especifican cifras.
- GPU recomendadas: no disponible; la documentación menciona `device="cuda"` para GPU sin detallar modelos concretos.
- Compatibilidad con GPU de consumo: no disponible; no se confirma si cabe en RTX 4090 u otras GPU consumer.
- Opciones de despliegue: librería `phonespam` (pip install phonespam) con `PhoneModel.from_pretrained`; demo en Streamlit (phonespam.streamlit.app). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Codificador | Capa | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hubert-21-phonemodel | HuBERT-large (ll60k) | 21 | Segmentación y reconocimiento de fonos vía SPAM | MIT | Hugging Face (juice500) |
| wavlm-24-phonemodel | WavLM | 24 | Segmentación y reconocimiento de fonos vía SPAM (mejor modelo de la familia según el autor) | no disponible | Hugging Face (juice500) |
| HuBERT-large-ll60k | HuBERT-large | — | Codificador auto-supervisado base (sin cabezas fonéticas) | no disponible | Hugging Face (facebook) |

La información disponible no permite comparar métricas de rendimiento entre estos modelos; la comparativa se limita a codificador, capa y tarea. No se dispone de datos sobre alternativas de terceros (por ejemplo, modelos de reconocimiento fonético de Kaldi o wav2vec2) en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en producción.
- Entrenado solo en inglés (TIMIT); el reconocimiento en otras lenguas depende de inventarios PHOIBLE y no de entrenamiento específico, por lo que la precisión fuera del inglés no está garantizada.
- Es un punto concreto de la rejilla codificador × capa; el propio autor indica que el mejor modelo de la familia es wavlm-24-phonemodel, por lo que este adaptador no es la opción óptima.
- No es un modelo generativo: no produce texto libre, no razona, no hace tool calling ni agentes; usarlo para esas tareas es inadecuado.
- Riesgo de errores de segmentación y etiquetado en audio ruidoso, con acento no estándar o con solapamiento de hablantes; no se documentan métricas de robustez.
- Sesgos: no se documentan sesgos demográficos o dialectales, pero el entrenamiento sobre TIMIT (hablantes de inglés americano) puede limitar la generalización.
- Licencia MIT para el modelo y el código, pero `vocab_for_language` descarga PHOIBLE 2.0 en runtime, que es CC BY-SA 3.0 y se licencia por separado; esto puede afectar el uso comercial si se redistribuye el vocabulario.
- No se especifican requisitos de memoria, latencia ni formatos de pesos, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/juice500/hubert-21-phonemodel
- Modelo base HuBERT-large: https://huggingface.co/facebook/hubert-large-ll60k
- Mejor modelo de la familia (WavLM): https://huggingface.co/juice500/wavlm-24-phonemodel
- Paper (arXiv 2607.09020, SLT 2026): https://arxiv.org/abs/2607.09020
- Código: https://github.com/juice500ml/phonespam
- Demo: https://phonespam.streamlit.app/
- Dataset TIMIT ASR: https://huggingface.co/datasets/timit-asr/timit_asr
- PHOIBLE: https://phoible.org
