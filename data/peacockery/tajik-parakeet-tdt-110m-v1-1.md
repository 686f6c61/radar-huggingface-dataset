# Peacockery/tajik-parakeet-tdt-110m-v1.1

## Resumen

tajik-parakeet-tdt-110m-v1.1 es un modelo de reconocimiento automático del habla (ASR) especializado en tayiko (idioma `tg`, escritura cirílica), desarrollado por el usuario Peacockery como un ajuste fino del checkpoint NVIDIA Parakeet TDT-CTC 110M. Emplea una arquitectura FastConformer con cabezas de decodificación TDT (Token-and-Duration Transducer) y CTC, junto con un tokenizador SentencePiece BPE específico para tayiko de 1.024 tokens. El modelo resuelve el problema de la escasez de sistemas ASR de calidad para lenguas de bajos recursos como el tayiko, partiendo de un modelo base multilingüe y adaptándolo con casi 1.000 horas de audio.

La versión v1.1 corrige una fuga de datos presente en la v1 original: el conjunto de entrenamiento anterior incluía fragmentos de vídeos reservados para evaluación. Esta revisión excluye las identidades de origen conocidas de dichos vídeos y reentrena sobre un corpus filtrado de 173.240 clips (987,54 horas). El resultado es una mejora de 1,55 puntos porcentuales absolutos en WER sobre FLEURS tayiko (de 19,03 a 17,48), lo que supone una reducción relativa del 8,1%.

El modelo es relevante para investigadores y desarrolladores que necesitan transcripción de audio en tayiko con un modelo compacto (110M de parámetros, repo de 0,5 GB) que puede ejecutarse en hardware modesto. Su licencia CC BY 4.0 permite uso comercial con atribución, y su integración en el ecosistema NVIDIA NeMo facilita el despliegue en pipelines existentes de ASR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con cabezas TDT (Token-and-Duration Transducer) y CTC |
| Parametros totales | 110M (heredados del modelo base nvidia/parakeet-tdt_ctc-110m) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; los clips de entrenamiento fueron de 0,5 a 30 segundos y se recomienda segmentación para grabaciones largas |
| Tipos de cuantizacion | no disponible (evaluado en fp32; el entrenamiento usó BF16) |
| Idiomas soportados | tayiko (`tg`), escritura cirílica |
| Licencia | CC BY 4.0 |
| Formato de pesos | `.nemo` (checkpoint NeMo con tokenizador embebido); tokenizador también en carpeta `tokenizer/` |
| Entrada | Audio mono a 16 kHz |
| Salida | Texto en minúsculas, generalmente sin puntuación |
| Framework | NVIDIA NeMo (probado con NeMo 3.0.0 y PyTorch 2.9.1) |
| Tokenizador | SentencePiece BPE tayiko, 1.024 tokens |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura FastConformer, una variante eficiente del encoder Conformer que reduce el coste computacional mediante downsampling de la secuencia de entrada. Sobre el encoder se sitúan dos cabezas de decodificación: TDT, que predice conjuntamente tokens y duraciones para alinear audio y texto, y CTC, que proporciona una decodificación alternativa y más sencilla. El tokenizador es un SentencePiece BPE entrenado específicamente para tayiko con 1.024 tokens, reemplazando el tokenizador original del modelo NVIDIA.

El entrenamiento partió del checkpoint original de NVIDIA con el nuevo tokenizador y se ejecutó durante 100.000 pasos de optimizador sobre el corpus Tajik v3 filtrado: 173.240 clips que suman 987,54 horas. De ellos, 2.250 clips tienen etiquetas de referencia FLEURS y 170.990 usan hipótesis generadas por Scribe y etiquetas fusionadas con LLM (pseudo-etiquetado). En el paso 14.000 se restauró el estado completo (modelo, optimizador, scheduler y paso global) y se cambió a pérdida TDT no fusionada, con mezcla de shards de manifiestos y un 12% de muestreo de clips FLEURS frente al 88% de clips pseudo-etiquetados. Se usó precisión mixta BF16, AdamW, learning rate pico de 3e-4, 2.000 pasos de warmup, decaimiento coseno hasta 1e-5 y un presupuesto de 120 segundos de audio por batch. El checkpoint final se seleccionó por WER de desarrollo en fp32 antes de la evaluación en test.

## Capacidades

- Transcripción de voz a texto en tayiko (escritura cirílica) a partir de audio mono de 16 kHz.
- Decodificación dual mediante cabezas TDT y CTC, lo que permite elegir entre precisión y simplicidad de decodificación.
- Salida en minúsculas y generalmente sin puntuación, adecuada para post-procesado posterior.
- Manejo de clips de 0,5 a 30 segundos; para grabaciones más largas se requiere segmentación previa.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente ASR.
- No dispone de capacidades de visión, audio generativo ni modo "thinking".
- Multilingüismo limitado al tayiko; no se declaran otros idiomas.
- Tokenizador propio que cubre el alfabeto cirílico tayiko con 1.024 tokens.

## Casos de uso

- Transcripción de archivos de audio en tayiko para medios de comunicación: el modelo convierte entrevistas y reportajes en texto, con la advertencia de segmentar grabaciones largas en clips de hasta 30 segundos y aplicar puntuación posterior.
- Subtitulado automático de vídeo en tayiko: integrado en un pipeline de segmentación por VAD y el modelo ASR, genera transcripciones sincronizadas para plataformas de vídeo, aprovechando su bajo coste computacional (110M de parámetros).
- Archivado y búsqueda de contenido oral: digitalización de archivos de audio históricos o administrativos en tayiko, generando índices de texto que permiten búsqueda por palabras clave sobre la colección.
- Asistentes de voz para atención al ciudadano: en servicios públicos de Tayikistán, el modelo puede transcribir consultas telefónicas para su enrutamiento o registro, siempre con revisión humana dada la tasa de error en dominio conversacional (WER 34,72 en el test conversacional).
- Investigación lingüística y corpus: generación de transcripciones a gran escala para estudios de fonética, morfología o sociolingüística del tayiko, con la ventaja de un modelo abierto y reproducible (manifiestos y fingerprints publicados).
- Prototipado de aplicaciones de accesibilidad: conversión de voz a texto para personas con discapacidad auditiva en entornos tayikoparlantes, desplegable en una sola GPU consumer gracias al tamaño reducido del checkpoint.
- Evaluación comparativa de ASR de bajos recursos: el modelo sirve como baseline reproducible para investigaciones sobre adaptación de modelos multilingües a lenguas de bajos recursos, con métricas detalladas en `evaluation.json`.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente), con inferencia en fp32 y normalización de texto tayiko aplicada a referencias y predicciones. WER y CER son porcentajes a nivel de corpus; menor es mejor.

| Dataset | Grabaciones | WER | CER |
|---|---:|---:|---:|
| FLEURS tayiko test | 600 | 17,48 | 6,08 |
| Desarrollo | 239 | 17,99 | 5,73 |
| Test conversacional | 1.625 | 34,72 | 15,63 |

Comparación con la versión anterior del mismo autor:

| Modelo | Datos de entrenamiento | WER FLEURS | WER conversacional |
|---|---|---:|---:|
| Original v1 | Exportación original de 1.197 horas | 19,03 | 33,85 |
| v1.1 | Corpus v3 filtrado, 987,54 horas | 17,48 | 34,72 |

La mejora en FLEURS es de 1,55 puntos absolutos (8,1% relativo). La comparación conversacional presenta limitaciones de solapamiento de fuentes y calidad de referencias, tal como advierte el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 110M de parámetros, el checkpoint en fp32 ocupa aproximadamente 0,44 GB; en BF16/fp16, unos 0,22 GB. La VRAM total necesaria para inferencia con NeMo es de aproximadamente 1-2 GB, incluyendo activaciones y buffers.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM es suficiente. Funciona en A100, H100, RTX 4090, RTX 3090, RTX 3060 e incluso en GPUs de gama de entrada.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650 o superior).
- Opciones de despliegue: NVIDIA NeMo (framework nativo, probado con NeMo 3.0.0 y PyTorch 2.9.1). No se declaran soportes para vLLM, llama.cpp, Ollama o TGI, ya que son frameworks orientados a modelos de lenguaje, no a ASR con arquitectura FastConformer/TDT.
- Latencia y throughput: no disponibles en la información proporcionada. El tamaño reducido y el diseño FastConformer sugieren un throughput alto, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / duración | WER FLEURS tayiko | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| tajik-parakeet-tdt-110m-v1.1 | 110M | clips de 0,5-30 s | 17,48 | CC BY 4.0 | Hugging Face (NeMo) |
| tajik-parakeet-tdt-110m-v1 (original del mismo autor) | 110M | clips de 0,5-30 s | 19,03 | CC BY 4.0 | Hugging Face (NeMo) |
| nvidia/parakeet-tdt_ctc-110m (modelo base) | 110M | no disponible | no disponible para tayiko (modelo base en inglés) | CC BY 4.0 | Hugging Face (NeMo) |

No se dispone de información sobre otros modelos ASR específicos para tayiko en la documentación proporcionada, por lo que no es posible una comparación con alternativas de otros autores.

## Limitaciones y advertencias

- El WER en dominio conversacional es alto (34,72), medido contra referencias generadas por máquina, lo que limita su fiabilidad en transcripción de conversaciones espontáneas.
- Las referencias del test conversacional son generadas automáticamente, no revisadas por hablantes nativos; el autor reconoce que una evaluación con referencias humanas sería más sólida.
- La salida es en minúsculas y generalmente sin puntuación, lo que requiere post-procesado para muchos usos finales.
- Los clips de entrenamiento tenían entre 0,5 y 30 segundos; para audio más largo es obligatorio segmentar, y una segmentación deficiente degrada la calidad.
- Riesgo de alucinación inherente a los sistemas ASR: el modelo puede generar texto plausible en segmentos de silencio, ruido o audio ininteligible.
- Sesgos no documentados: no se aporta información sobre sesgos por género, edad, dialecto o acento dentro del tayiko.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero exige citar al autor y la licencia; no se declaran restricciones adicionales.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false` en el model-index).
- El modelo solo cubre tayiko en escritura cirílica; no se declara soporte para otros idiomas ni para tayiko en otras escrituras.
- Dependencia del ecosistema NVIDIA NeMo, lo que puede limitar su integración en stacks que no usen PyTorch/NVIDIA.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Peacockery/tajik-parakeet-tdt-110m-v1.1
- Modelo base NVIDIA: https://huggingface.co/nvidia/parakeet-tdt_ctc-110m
- Versión anterior v1: https://huggingface.co/Peacockery/tajik-parakeet-tdt-110m-v1
- Dataset Tajik ASR Corpus v3: https://huggingface.co/datasets/Peacockery/tajik-asr-corpus-v3/tree/3b05a4bb89104c21643081250729595347d1188e
- Código de entrenamiento (Peacock ASR): https://github.com/chikingsley/peacock-asr (commit `55af600a`)
- Dataset FLEURS (evaluación): https://huggingface.co/datasets/google/fleurs
