# rustam1221/UzASR-CTC-220M

## Resumen

UzASR-CTC-220M es un modelo de reconocimiento automático del habla (ASR) especializado en uzbeko, desarrollado por el usuario rustam1221 y publicado en Hugging Face con acceso restringido. Se trata de un fine-tuning del modelo ai-sage/GigaAM-Multilingual, una base multilingüe de la familia GigaAM, adaptada mediante CTC (Connectionist Temporal Classification) para transcribir audio en uzbeko, incluyendo puntuación. El modelo tiene 220.750.027 parámetros y se distribuye en formato safetensors para la librería transformers.

El modelo resuelve un problema concreto: la escasez de sistemas ASR de calidad para uzbeko, un idioma de bajos recursos con más de 30 millones de hablantes. Al partir de una base multilingüe ya entrenada y hacer fine-tuning sobre manifiestos específicos de uzbeko (dataset rustam1221/uzbek-asr-train-manifests), el autor busca obtener un rendimiento competitivo en habla espontánea, un escenario más difícil que el habla leída por sus pausas, disfluencias y variabilidad acústica.

Es relevante ahora porque los modelos ASR especializados en lenguas de bajos recursos siguen siendo escasos y porque el modelo declara métricas concretas (WER 9,43% y CER 2,96%) sobre un benchmark propio de habla espontánea en uzbeko. Con solo 2 descargas y 0 likes en el momento de la consulta, se trata de un modelo reciente y de nicho, con licencia personalizada "uzbek-asr-commercial" y acceso condicionado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CTC sobre base GigaAM-Multilingual (transformer encoder para ASR) |
| Parametros totales | 220.750.027 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | uzbeko (uz) |
| Licencia | uzbek-asr-commercial (licencia personalizada, acceso restringido) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue un esquema de fine-tuning sobre ai-sage/GigaAM-Multilingual, una base multilingüe de reconocimiento del habla. La cabeza de salida es CTC, lo que implica un entrenamiento con función de pérdida CTC sobre secuencias de audio y transcripciones alineadas de forma no explícita. Esta elección es habitual en ASR por su simplicidad y eficiencia en decodificación, aunque no se dispone de detalles sobre el encoder concreto (número de capas, dimensión oculta, mecanismo de atención) en la información proporcionada.

El entrenamiento se realizó sobre el dataset rustam1221/uzbek-asr-train-manifests, un conjunto de manifiestos de audio y transcripciones en uzbeko. No se especifica el número de horas de audio, la composición del dataset, ni si hubo etapas de aumento de datos, especificación de puntuación o ajuste fino adicional. La evaluación se realizó sobre rustam1221/uzbek-asr-benchmark-spontaneous, un benchmark de habla espontánea. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Reconocimiento automático del habla (ASR) en uzbeko, con salida de transcripción textual.
- Generación de puntuación en la transcripción (tag "punctuation").
- Procesamiento de habla espontánea, según el benchmark declarado por el autor.
- Integración con la librería transformers y pipeline automatic-speech-recognition.
- Compatibilidad con endpoints (tag endpoints_compatible).
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada más allá del ASR, ni modos de razonamiento extendido.
- Capacidad multilingüe limitada al uzbeko según el campo de idiomas.

## Casos de uso

- Transcripción de reuniones y entrevistas en uzbeko: el modelo puede convertir audio de conversaciones espontáneas en texto con puntuación, gracias a su especialización en habla espontánea y a la salida CTC con puntuación.
- Subtitulado automático de vídeo en uzbeko: integrable en pipelines de postproducción para generar subtítulos con marcas de puntuación, reduciendo la corrección manual.
- Atención al cliente en uzbeko: transcripción de llamadas o mensajes de voz para su análisis, indexación o enrutamiento posterior, usando el pipeline ASR de transformers.
- Archivado y búsqueda de contenido audiovisual: conversión de archivos de audio históricos en uzbeko a texto indexable, aprovechando el tamaño compacto del modelo (220M parámetros).
- Investigación lingüística y corpus de habla: generación de transcripciones para estudios de fonética, sintaxis o análisis de discurso en uzbeko, con la ventaja de un modelo de pesos abiertos y base multilingüe documentada.
- Prototipado de asistentes de voz en uzbeko: el modelo puede servir como componente ASR en un sistema de diálogo, dado su tamaño moderado y su compatibilidad con transformers.
- Evaluación comparativa de ASR para lenguas de bajos recursos: útil como referencia en experimentos académicos sobre fine-tuning de modelos multilingües.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados):

| Benchmark | Métrica | Valor |
|---|---|---|
| Uzbek Spontaneous Speech ASR Benchmark | WER | 9,43 % |
| Uzbek Spontaneous Speech ASR Benchmark | CER | 2,96 % |

No se han publicado otros resultados de benchmarks en la información disponible, ni comparaciones con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 220,75M parámetros en fp32 serían aproximadamente 0,9 GB de pesos, y en fp16 unos 0,45 GB, a lo que habría que sumar memoria para activaciones y buffers de audio.
- GPU recomendadas: no especificadas por el autor; por tamaño, el modelo es apto para GPU consumer de gama media (por ejemplo, RTX 3060, RTX 4060) y para GPU de datacenter (A100, H100) sin problema de capacidad.
- Cabe en GPU consumer: sí, por el reducido número de parámetros, aunque no se detallan requisitos oficiales.
- Opciones de despliegue: transformers (pipeline automatic-speech-recognition); no se documenta soporte explícito para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UzASR-CTC-220M | 220,75M | no disponible | WER 9,43 % / CER 2,96 % (benchmark propio) | uzbek-asr-commercial (restringida) | Hugging Face, acceso gated |
| ai-sage/GigaAM-Multilingual (modelo base) | no disponible en la información | no disponible | no disponible | no disponible | Hugging Face |
| Otros ASR para uzbeko | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar con alternativas específicas de ASR en uzbeko.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated y requiere aceptar condiciones en Hugging Face antes de descargarlo.
- Licencia personalizada "uzbek-asr-commercial": es necesario revisar los términos exactos para uso comercial; no se detallan en la información disponible.
- Sesgos conocidos: no documentados por el autor; al entrenarse sobre un dataset específico de uzbeko, puede reflejar sesgos de dominio, género, acento o registro de ese corpus.
- Riesgo de alucinación: en ASR, el riesgo se manifiesta como sustituciones, omisiones e inserciones de palabras; el WER declarado del 9,43 % implica un margen de error no despreciable en producción.
- Limitaciones de idioma: solo uzbeko; no se garantiza rendimiento en otras lenguas ni en code-switching.
- Limitaciones de contexto: no se especifica la longitud máxima de audio soportada.
- Métricas no verificadas: los resultados del model-index están marcados como verified: false; conviene reproducirlos antes de usarlos como referencia.
- Modelo de nicho con muy poca tracción (2 descargas, 0 likes): no hay evidencia comunitaria de robustez en producción.
- No se documentan cuantizaciones ni formatos alternativos (GGUF) para despliegue en CPU.

## Enlaces

- Hugging Face: https://huggingface.co/rustam1221/UzASR-CTC-220M
- Modelo base: https://huggingface.co/ai-sage/GigaAM-Multilingual
- Dataset de entrenamiento: https://huggingface.co/datasets/rustam1221/uzbek-asr-train-manifests
- Dataset de benchmark: https://huggingface.co/datasets/rustam1221/uzbek-asr-benchmark-spontaneous
