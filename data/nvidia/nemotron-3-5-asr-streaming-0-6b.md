# nvidia/nemotron-3.5-asr-streaming-0.6b

## Resumen

Nemotron 3.5 ASR Streaming 0.6B es un modelo de reconocimiento automático del habla (ASR) multilingüe y en streaming desarrollado por NVIDIA. Forma parte de la familia Nemotron 3.5 y constituye la extensión multilingüe del modelo `nvidia/nemotron-speech-streaming-en-0.6b`, añadiendo un condicionamiento por identificador de idioma (language-ID prompt) que permite transcribir audio en 40 language-locales con un único modelo. Su arquitectura combina un encoder FastConformer con un decodificador RNNT (Recurrent Neural Network Transducer) y una novedosa atención cache-aware que reduce la latencia en flujos de audio continuos, lo que lo hace especialmente adecuado para aplicaciones de transcripción en tiempo real.

Con aproximadamente 600 millones de parámetros, el modelo ofrece un equilibrio entre precisión y eficiencia computacional. Está entrenado sobre una combinación de conjuntos de datos públicos y propietarios, incluyendo Granary, Multilingual LibriSpeech, FLEURS, Common Voice 8.0, VoxPopuli y Europarl. Su relevancia actual radica en la creciente demanda de sistemas de voz multilingües de baja latencia para asistentes virtuales, subtitulación en directo y servicios de transcripción, donde los modelos tradicionales suelen requerir múltiples instancias especializadas por idioma.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-CacheAware-RNNT |
| Parametros totales | 600 millones (0.6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | no disponible (se ofrecen pesos en safetensors y GGUF) |
| Idiomas soportados | 40 language-locales: en, es, de, fr, it, ar, ja, ko, pt, ru, hi, zh, vi, he, nl, cs, da, pl, no, sv, th, tr, bg, el, et, fi, hr, hu, lt, lv, ro, sk, uk, mt, sl |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura FastConformer-CacheAware-RNNT. FastConformer es una variante eficiente del encoder Conformer que reduce el coste computacional mediante técnicas de submuestreo y atención optimizada, mientras que el decodificador RNNT (Transductor Neuronal Recurrente) permite la decodificación en streaming con baja latencia. La innovación principal es el mecanismo cache-aware, que reutiliza estados de atención previamente calculados para evitar recomputaciones en cada paso, mejorando el rendimiento en flujos de audio continuos. El entrenamiento se realizó sobre una mezcla de datasets multilingües: Granary (propietario de NVIDIA), Multilingual LibriSpeech, FLEURS, Common Voice 8.0, VoxPopuli y Europarl. No se menciona el uso de RLHF o DPO, al tratarse de un modelo de transcripción y no de generación de lenguaje. El condicionamiento por identificador de idioma permite al modelo adaptar su salida al idioma detectado, produciendo texto con puntuación y una etiqueta automática de idioma.

## Capacidades

- Transcripción de voz multilingüe en 40 language-locales con un único modelo.
- Streaming de baja latencia: el modelo procesa audio en tramas de 1,12 segundos, lo que permite transcripción en tiempo real.
- Salida con puntuación automática y etiqueta de idioma (según la descripción del modelo).
- Condicionamiento por identificador de idioma (language-ID prompt) que mejora la precisión en entornos multilingües.
- Soporte para audio de alta tasa de muestreo (típico en modelos FastConformer).
- No incluye capacidades de tool calling, agentes ni razonamiento multi-paso, al ser un modelo puramente ASR.

## Casos de uso

- Subtitulación en directo para eventos, webinars y retransmisiones: el modo streaming con tramas de 1,12 s permite generar subtítulos casi en tiempo real en múltiples idiomas, reduciendo la necesidad de sistemas separados por lengua.
- Asistentes de voz multilingües: integrable en asistentes virtuales para transcribir comandos de voz en 40 idiomas, facilitando la interacción en entornos internacionales.
- Transcripción de reuniones y videoconferencias: puede procesar audio en streaming para generar actas o notas automáticas, con soporte para varios idiomas en una misma sesión.
- Servicios de accesibilidad: conversión de voz a texto para personas con discapacidad auditiva, con cobertura multilingüe y baja latencia.
- Análisis de llamadas en centros de contacto: transcripción en tiempo real de conversaciones para análisis de sentimiento, cumplimiento normativo o control de calidad, con capacidad de manejar múltiples idiomas.
- Traducción automática de voz (pipeline): al transcribir con etiqueta de idioma, puede alimentar sistemas de traducción automática para crear subtítulos o doblaje en otros idiomas.

## Benchmarks y rendimiento

El modelo reporta resultados de WER (Word Error Rate) en el conjunto de test de FLEURS para varios idiomas, utilizando un tamaño de trama de 1,12 segundos y detección de idioma (LangID). Los valores publicados son:

| Idioma | WER (%) |
|---|---|
| Inglés (en_us) | 7,91 |
| Español (es_419) | 4,11 |
| Francés (fr_fr) | 9,03 |
| Italiano (it_it) | 4,25 |
| Portugués (pt_br) | 5,48 |
| Alemán (de_de) | 8,31 |
| Hindi (hi_in) | 6,81 |
| Coreano (ko_kr) | 7,12 |

No se han publicado resultados comparativos con otros modelos en la información disponible. La imagen del modelo sugiere una comparación de throughput con Parakeet RNNT, pero no se proporcionan cifras concretas.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 0,6B parámetros, la inferencia puede ejecutarse en GPUs con al menos 4-6 GB de VRAM en precisión FP16, y menos con cuantización GGUF (por ejemplo, 4 bits).
- GPU recomendadas: NVIDIA H100 (para despliegue de alta concurrencia, como se muestra en la gráfica de throughput), A100, RTX 4090 o GPUs consumer con suficiente VRAM.
- Compatibilidad con GPUs consumer: sí, modelos de 0,6B son viables en RTX 3060/3070/4060 con cuantización.
- Opciones de despliegue: NeMo (biblioteca nativa de NVIDIA), Transformers (con integración de audio), llama.cpp/Ollama para formatos GGUF, y servidores de inferencia como vLLM (aunque su soporte para ASR puede ser limitado).
- Latencia y throughput: no se especifican valores exactos, pero el diseño cache-aware y el streaming por tramas de 1,12 s indican una latencia de procesamiento inferior a la de modelos no optimizados.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Arquitectura | Licencia | Streaming |
|---|---|---|---|---|---|
| Nemotron 3.5 ASR Streaming 0.6B | 600M | 40 | FastConformer-RNNT | OpenMDW-1.1 | Sí |
| Parakeet RNNT (NVIDIA) | ~1B | Multilingüe (varios) | Conformer-RNNT | CC-BY-4.0 (algunas versiones) | Sí |
| Whisper (OpenAI) | 39M-1.5B | 99 | Transformer encoder-decoder | MIT | No (procesa audio completo) |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada. Nemotron 3.5 ASR se posiciona como una alternativa más ligera y optimizada para streaming que Whisper, y como una evolución de Parakeet con soporte multilingüe ampliado y cache-aware.

## Limitaciones y advertencias

- Licencia OpenMDW-1.1: es una licencia de código abierto con condiciones específicas; se recomienda revisar los términos para uso comercial, especialmente en lo relativo a redistribución y atribución.
- Sesgos potenciales: los idiomas con menos datos de entrenamiento (p. ej., maltés, esloveno) pueden presentar tasas de error más altas que los idiomas principales.
- Riesgo de alucinación: como todo modelo ASR, puede generar texto incorrecto en presencia de ruido, acentos no representados o solapamiento de hablantes.
- Limitación de streaming: el tamaño de trama fijo (1,12 s) puede no ser óptimo para todos los casos de uso; aplicaciones que requieran latencias menores necesitarían ajustes adicionales.
- Dependencia de la detección de idioma: el condicionamiento por language-ID puede fallar en mezclas de idiomas dentro de un mismo audio, degradando la precisión.
- No es un modelo generativo: no admite tareas de texto libre, solo transcripción de audio.

## Enlaces

- HuggingFace: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Paper relacionado (FastConformer): https://arxiv.org/abs/2305.05084
- Paper relacionado (RNNT): https://arxiv.org/abs/2312.17279
- Página de Nemotron: https://developer.nvidia.com/nemotron
- Repositorio NeMo: https://github.com/NVIDIA/NeMo
