# nvidia/nemotron-speech-streaming-en-0.6b

## Resumen

Nemotron-ASR-Streaming es un modelo de reconocimiento automático del habla (ASR) en inglés, desarrollado por NVIDIA, diseñado para transcripción de alta calidad tanto en streaming de baja latencia como en procesamiento por lotes de alto rendimiento. Con 600 millones de parámetros, transcribe audio a texto con soporte nativo de puntuación y capitalización, y ofrece flexibilidad en el tamaño de fragmento configurable (80, 160, 560 y 1120 ms). Su arquitectura Cache-Aware FastConformer-RNNT elimina los cálculos superpuestos redundantes típicos de los sistemas de streaming con búfer, procesando solo los fragmentos nuevos de audio mientras reutiliza el contexto del codificador cacheado, lo que mejora la eficiencia computacional y reduce la latencia sin sacrificar precisión.

Entrenado sobre ASRSet, un conjunto de datos masivo de aproximadamente 250.000 horas de habla en inglés estadounidense (en-US), el modelo está optimizado para condiciones acústicas diversas y desafiantes. Se distribuye bajo la licencia NVIDIA Open Model License y está disponible en formato safetensors y GGUF. Su relevancia actual radica en ofrecer una alternativa de código abierto con arquitectura de streaming nativa, ideal para aplicaciones en tiempo real como subtitulado en directo, asistentes de voz y transcripción de reuniones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-CacheAware-RNNT |
| Parametros totales | 618.084.865 (aprox. 600M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo ASR, procesa audio en fragmentos) |
| Tipos de cuantizacion | safetensors (fp32/fp16) y GGUF (cuantizaciones disponibles en el repositorio) |
| Idiomas soportados | Ingles (en-US) |
| Licencia | NVIDIA Open Model License (nvidia-open-model-license) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Cache-Aware FastConformer-RNNT, una variante del codificador FastConformer con mecanismo de atención consciente de caché. Esta innovación permite procesar secuencias de audio continuas sin recalcular representaciones de fragmentos anteriores, reduciendo la latencia de extremo a extremo y el coste computacional en escenarios de streaming. El decodificador RNNT (Recurrent Neural Network Transducer) genera texto de forma incremental, compatible con la salida en tiempo real.

El entrenamiento se realizó sobre ASRSet, un dataset propietario de NVIDIA que combina múltiples corpus públicos y privados (nvidia/Granary, YTC, Yodas2, LibriLight, LibriSpeech, Fisher, Switchboard, WSJ, VCTK, VoxPopuli, Europarl, Common Voice, People's Speech, entre otros), sumando aproximadamente 250.000 horas de habla en inglés estadounidense. No se menciona el uso de RLHF ni DPO; el entrenamiento se centra en la tarea de ASR supervisada. El modelo soporta fragmentos de audio configurables (80 ms, 160 ms, 560 ms, 1120 ms) para ajustar el equilibrio entre latencia y precisión.

## Capacidades

- Transcripción de voz a texto en inglés con puntuación y capitalización automáticas.
- Streaming de baja latencia con tamaños de fragmento configurables (80, 160, 560 y 1120 ms).
- Procesamiento por lotes de alto rendimiento para transcripción de audio largo.
- Arquitectura cache-aware que reduce la redundancia computacional en flujos continuos.
- Compatible con el ecosistema NeMo de NVIDIA y con Hugging Face Transformers.
- Soporte para decodificación con RNNT, optimizado para salida incremental.
- Disponible en formatos safetensors y GGUF para despliegue en diferentes entornos.

## Casos de uso

- Subtitulado en directo para eventos, webinars y retransmisiones: el modelo procesa audio en fragmentos de 80-160 ms, generando subtítulos con baja latencia y puntuación automática.
- Transcripción de reuniones y videollamadas: su capacidad de streaming permite transcribir conversaciones en tiempo real, integrándose en herramientas de colaboración.
- Asistentes de voz y comandos por voz: la baja latencia y la salida incremental lo hacen adecuado para interfaces conversacionales en dispositivos embebidos.
- Generación de subtítulos para vídeo bajo demanda: el modo batch procesa archivos de audio largos con alto throughput, ideal para plataformas de contenido.
- Análisis de llamadas en centros de contacto: la transcripción precisa con puntuación facilita el análisis de sentimiento y la extracción de información.
- Accesibilidad: transcripción en tiempo real para personas con discapacidad auditiva en entornos educativos o públicos.
- Investigación en ASR: sirve como modelo base para fine-tuning en dominios específicos (médico, legal, etc.) gracias a su arquitectura eficiente y licencia abierta.

## Benchmarks y rendimiento

Los siguientes resultados de WER (Word Error Rate) fueron publicados por el autor del modelo en la model card, utilizando un tamaño de fragmento de 1,12 s:

| Dataset | WER (%) |
|---|---|
| LibriSpeech test-clean | 2,32 |
| LibriSpeech test-other | 4,84 |
| SPGI Speech | 2,97 |
| TEDLIUM | 3,50 |
| Gigaspeech | 9,66 |
| VoxPopuli (en) | 7,97 |
| Earnings22 | 12,52 |
| AMI (ihm) | 11,73 |

Estos valores corresponden a la versión actualizada del checkpoint (marzo de 2026). No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~600M parámetros, la inferencia en FP16 requiere aproximadamente 1,2 GB de VRAM para los pesos, aunque el uso real depende del tamaño de lote y la longitud de los fragmentos. Con cuantización GGUF (por ejemplo, Q4_K_M), el requisito baja a ~400-500 MB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia en streaming (por ejemplo, RTX 3050, RTX 4060). Para lotes grandes o alta concurrencia, se recomiendan GPUs de centro de datos como A100 o H100.
- Es viable en GPUs de consumo: sí, el modelo cabe en GPUs como RTX 3060, RTX 4070, etc., especialmente con cuantización.
- Opciones de despliegue: NeMo (librería nativa), Hugging Face Transformers, llama.cpp (para GGUF), y potencialmente vLLM si se adapta a la arquitectura (no confirmado).
- Latencia y throughput: no se proporcionan datos oficiales. La arquitectura cache-aware está diseñada para reducir la latencia en streaming, pero las cifras exactas dependen del hardware y la configuración de fragmentos.

## Comparativa con modelos similares

No se dispone de datos comparativos oficiales en la información proporcionada. Sin embargo, se pueden considerar como alternativas:

- **NVIDIA Parakeet** (por ejemplo, parakeet-tdt-0.6b-v2): otro modelo ASR de NVIDIA con arquitectura similar, pero sin enfoque de streaming cache-aware. No hay datos de rendimiento comparables en esta ficha.
- **OpenAI Whisper** (por ejemplo, whisper-small): modelo de ASR generalista multilingüe, pero con mayor latencia y sin soporte nativo de streaming. No hay datos de WER comparables en la información disponible.
- **NVIDIA Nemotron 3.5 ASR Streaming 0.6B**: versión multilingüe posterior (40 idiomas) del mismo modelo base, mencionada en la model card como extensión, pero no se dispone de benchmarks detallados aquí.

Para una comparativa rigurosa, se recomienda consultar el HF ASR Leaderboard y evaluar los modelos en los mismos conjuntos de datos.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en inglés estadounidense (en-US); no soporta otros idiomas ni variantes dialectales.
- La puntuación y capitalización generadas pueden no ser perfectas en habla espontánea, ruido intenso o acentos no representados en el entrenamiento.
- Riesgo de alucinación en segmentos de audio ambiguos o de baja calidad, aunque la arquitectura RNNT tiende a ser más robusta que los modelos seq2seq en este aspecto.
- La licencia NVIDIA Open Model License permite uso comercial, pero es necesario revisar sus términos específicos (puede incluir restricciones de redistribución o atribución).
- El rendimiento en condiciones acústicas muy diferentes a las del dataset de entrenamiento (por ejemplo, música de fondo, habla solapada) puede degradarse.
- No se han publicado detalles sobre sesgos demográficos o de acento; se recomienda evaluar el modelo en la población objetivo antes de desplegarlo en producción.
- El modelo está pensado para ASR, no para tareas de comprensión del lenguaje; no debe usarse como sustituto de un LLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/nemotron-speech-streaming-en-0.6b
- Licencia NVIDIA Open Model: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Paper de FastConformer (referencia en tags): arXiv:2305.05084
- Paper de RNNT (referencia en tags): arXiv:2312.17279
- Rama con checkpoint anterior (enero 2026): https://huggingface.co/nvidia/nemotron-speech-streaming-en-0.6b/tree/nemotron-speech-streaming-jan2026
