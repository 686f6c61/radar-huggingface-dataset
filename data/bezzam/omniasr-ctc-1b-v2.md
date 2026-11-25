# bezzam/omniasr-ctc-1b-v2

## Resumen

omniasr-ctc-1b-v2 es un modelo de reconocimiento automático del habla (ASR) publicado en Hugging Face por el usuario bezzam, derivado del proyecto Omnilingual ASR de Meta (referencia al paper arXiv:2511.09690 y al corpus facebook/omnilingual-asr-corpus). Se trata de un modelo de ~976 millones de parámetros con arquitectura CTC (Connectionist Temporal Classification), orientado a transcripción multilingüe a gran escala. Su rasgo más distintivo es la cobertura declarada de más de 1.500 códigos ISO 639-3, lo que lo sitúa en la categoría de modelos ASR masivamente multilingües, incluyendo lenguas de bajos recursos.

El modelo resuelve el problema de la transcripción de voz en un número muy elevado de idiomas con un único conjunto de pesos, evitando la necesidad de desplegar un modelo específico por lengua. Frente a sistemas ASR monolingües o con cobertura de decenas de idiomas, propone una alternativa con licencia Apache 2.0 y pesos en safetensors compatibles con la librería transformers, lo que facilita su integración en pipelines existentes.

Es relevante ahora porque la combinación de licencia permisiva, tamaño contenido (~1B parámetros) y cobertura lingüística extrema lo convierte en un candidato práctico para aplicaciones de transcripción en contextos multilingües y para investigación en lenguas de bajos recursos, un área donde la mayoría de los modelos comerciales no ofrecen soporte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CTC (Connectionist Temporal Classification) sobre encoder tipo transformer; arquitectura `omniasr_ctc` |
| Parametros totales | 975.674.928 (~976 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/INT8 en la información disponible) |
| Idiomas soportados | más de 1.500 códigos ISO 639-3 declarados en la model card (aae, aal, abb, abi, abk, ... zza), incluyendo español (spa), inglés (eng), francés (fra), alemán (deu), portugués (por), catalán (cat), euskera (eus), gallego (glg), etc. |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una cabeza CTC sobre un encoder acústico, identificado en la model card con la arquitectura `omniasr_ctc`. La CTC permite alinear secuencias de audio y texto sin necesidad de alineamientos forzados a nivel de frame, lo que simplifica el entrenamiento multilingüe y reduce los requisitos de datos anotados finamente. El tamaño de ~976 M parámetros lo sitúa en un rango manejable para inferencia en GPU de gama alta y media.

El entrenamiento se asocia al corpus `facebook/omnilingual-asr-corpus` y al paper arXiv:2511.09690, que documenta el proyecto Omnilingual ASR. No se detallan en la información disponible el número exacto de horas de audio, la composición por idioma del dataset ni si se aplicaron etapas de ajuste fino supervisado o preferencias (RLHF/DPO); al ser un modelo CTC de ASR, es esperable un entrenamiento puramente supervisado sobre pares audio-transcripción, pero este extremo no se confirma en la documentación accesible. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) en más de 1.500 lenguas declaradas.
- Cobertura de lenguas de altos recursos (inglés, español, francés, alemán, portugués, chino, árabe, hindi, ruso, japonés) y de bajos recursos (numerosas lenguas africanas, indígenas americanas, oceánicas y asiáticas).
- Salida CTC con alineamiento temporal implícito, apta para transcripción continua sin segmentación previa.
- Compatibilidad con la librería `transformers` (pipeline `automatic-speech-recognition`).
- Soporte de decodificación greedy y, potencialmente, decodificación con modelo de lenguaje externo (no documentado explícitamente en la información disponible).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio-vision, por tratarse de un modelo especializado en ASR.

## Casos de uso

- Transcripción multilingüe de reuniones y conferencias: el modelo permite procesar audio en varios idiomas dentro de una misma sesión sin cambiar de modelo, gracias a su cobertura de más de 1.500 códigos ISO 639-3.
- Subtitulado automático de vídeo en plataformas de contenido: la salida CTC con alineamiento temporal implícito facilita la generación de subtítulos sincronizados a nivel de segmento.
- Digitalización de archivos orales en lenguas minoritarias: investigadores en lingüística pueden transcribir grabaciones de campo en lenguas de bajos recursos que carecen de sistemas ASR comerciales.
- Atención al cliente por voz en mercados multilingües: un único despliegue cubre múltiples idiomas de una organización, simplificando la infraestructura frente a soluciones por idioma.
- Generación de corpus textuales a partir de audio para entrenamiento de modelos de lenguaje: la transcripción a gran escala de audio en muchos idiomas permite construir datasets paralelos.
- Accesibilidad: transcripción en tiempo real o diferido de contenido audiovisual para personas con discapacidad auditiva en comunidades lingüísticas desatendidas.
- Análisis de llamadas y compliance: transcripción de grabaciones telefónicas multilingües para auditoría y extracción de información.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 2 GB solo para pesos (~976 M parámetros × 2 bytes), más memoria para activaciones y buffers de audio; en la práctica, entre 3 y 6 GB según la longitud del audio y el tamaño de batch.
- VRAM estimada en FP32: aproximadamente 4 GB solo para pesos, con picos superiores según batch.
- GPU recomendadas: NVIDIA A100, H100 o L40S para procesamiento por lotes de alto throughput; RTX 4090, RTX 3090 o RTX A6000 para despliegues de una sola GPU con buena latencia.
- GPU de consumo: cabe en GPUs consumer con 8 GB o más de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090). En GPUs con 6 GB puede requerir cuantización o batches pequeños.
- Opciones de despliegue: `transformers` (pipeline `automatic-speech-recognition`), servidores de inferencia compatibles con transformers como TGI o vLLM (siempre que soporten la arquitectura `omniasr_ctc`), y exportación a ONNX para producción. No se documenta soporte GGUF/llama.cpp en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| bezzam/omniasr-ctc-1b-v2 | ~976 M | >1.500 códigos ISO 639-3 | no disponible | Apache 2.0 | safetensors |
| Whisper large-v3 (OpenAI) | ~1.550 M | ~99 idiomas | 30 s de audio por ventana | MIT | safetensors, GGML |
| MMS (Meta) | ~1.000 M (por idioma) | >1.100 idiomas (modelos por lengua) | no disponible | CC-BY-NC 4.0 | safetensors |
| SeamlessM4T v2 (Meta) | ~2.300 M | ~100 idiomas de entrada | no disponible | CC-BY-NC 4.0 | safetensors |

La comparación con Whisper large-v3 es la más directa en términos de tamaño y uso práctico: Whisper ofrece mejor documentación y ecosistema, pero cobertura de ~99 idiomas frente a los más de 1.500 declarados por omniasr. Frente a MMS, omniasr propone un único modelo multilingüe en lugar de un modelo por idioma, con licencia Apache 2.0 más permisiva que la CC-BY-NC de MMS y SeamlessM4T. No se dispone de datos de benchmarks que permitan comparar la precisión relativa entre estos modelos.

## Limitaciones y advertencias

- No se han publicado métricas de WER por idioma en la información disponible, por lo que el rendimiento real en lenguas de bajos recursos es incierto.
- La cobertura declarada de más de 1.500 idiomas no implica calidad uniforme; es esperable un rendimiento muy variable entre lenguas con muchos y pocos datos de entrenamiento.
- Riesgo de alucinación en pasajes de audio con ruido, silencios largos o solapamiento de hablantes, comportamiento común en modelos CTC.
- No se documenta el manejo de cambio de idioma dentro de un mismo audio (code-switching), lo que puede degradar la transcripción en contextos bilingües.
- El modelo no realiza diarización de hablantes ni puntuación automática de forma documentada; puede requerir post-procesado.
- Aunque la licencia es Apache 2.0 y permite uso comercial, conviene verificar las condiciones del corpus de entrenamiento subyacente (`facebook/omnilingual-asr-corpus`) para usos sensibles.
- El repositorio tiene pocas descargas (296) y ningún "like", lo que sugiere validación comunitaria limitada; se recomienda evaluar en el dominio objetivo antes de producción.
- No se documentan versiones cuantizadas ni soporte para despliegue en CPU de bajo consumo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bezzam/omniasr-ctc-1b-v2
- Paper Omnilingual ASR: https://arxiv.org/abs/2511.09690
- Corpus de entrenamiento: https://huggingface.co/datasets/facebook/omnilingual-asr-corpus
- Documentación de transformers (pipeline ASR): https://huggingface.co/docs/transformers/main/en/main_classes/pipelines#transformers.AutomaticSpeechRecognitionPipeline
