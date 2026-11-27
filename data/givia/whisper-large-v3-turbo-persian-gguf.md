# givia/whisper-large-v3-turbo-persian-gguf

## Resumen

Whisper large-v3-turbo-persian-gguf es una versión cuantizada en formato GGUF del modelo de reconocimiento automático del habla (ASR) givia/whisper-large-v3-turbo-persian, un ajuste fino de Whisper large-v3-turbo especializado en persa (farsi). Lo publica el usuario givia y está pensado para su uso con transcribe.cpp, una implementación de inferencia compatible con el ecosistema whisper.cpp. El objetivo es ofrecer transcripción de audio persa con un consumo de recursos reducido, desde 536 MB en Q4_K_M hasta 1,6 GB en F16.

El modelo parte de la arquitectura encoder-decoder de Whisper (transformer con atención, entrenado originalmente por OpenAI) y conserva el ajuste fino sobre datos persas del modelo base. Con 808.904.208 parámetros reales según safetensors, es sustancialmente más pequeño que el Whisper large-v3 completo gracias a la variante turbo, que reduce el número de capas del decoder. La ventana de contexto de audio de Whisper es de 30 segundos por segmento, con procesamiento en ventanas deslizantes para audio más largo.

Su relevancia actual radica en que cubre un nicho concreto: ASR de calidad para persa en entornos con recursos limitados (CPU o GPU modesta), con cuantizaciones que apenas degradan la precisión (dentro de 0,3 puntos de WER medio respecto a F16). Es un modelo de nicho, con cero descargas en el momento de la consulta, orientado a desarrolladores que necesiten transcripción persa local y sin dependencia de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo) |
| Parametros totales | 808.904.208 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio por ventana (ventana deslizante para audio largo) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | Persa (fa); solo se ha probado persa iraní |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (para transcribe.cpp); el modelo base ofrece safetensors para transformers y GGML para whisper.cpp/FFmpeg |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper large-v3-turbo: un encoder de audio y un decoder autoregresivo basados en transformer con atención multi-cabeza. La variante turbo reduce el número de capas del decoder respecto a large-v3, lo que baja el cómputo de inferencia manteniendo el encoder. El modelo procesa audio en ventanas de 30 segundos y genera tokens de texto condicionados por tokens de idioma y tarea.

El ajuste fino persa del modelo base (givia/whisper-large-v3-turbo-persian) se entrenó con material con licencia CC-BY, según la atribución de la model card: FLEURS (Google, CC-BY-4.0), YODAS2 (ESPnet/CMU, CC-BY-3.0) y vídeos y subtítulos de 94 canales de YouTube con licencia Creative Commons (por ejemplo, Shiawaves Persian con 79 vídeos y 5,0 horas, o داستان های واقعی و عاشقانه con 7 vídeos y 5,0 horas). No se detalla en la información disponible el número total de tokens ni si hubo RLHF/DPO; el proceso de conversión a GGUF se realizó con convert-whisper.py y la cuantización con transcribe-quantize, ambos de transcribe.cpp.

## Capacidades

- Transcripción de voz a texto en persa (farsi), con salida de texto plano.
- Detección automática de idioma (aunque se recomienda forzar `-l fa` para evitar errores en clips cortos o ruidosos).
- Procesamiento de audio de cualquier duración mediante segmentación en ventanas de 30 segundos.
- Manejo de audio con ruido moderado, conversación y podcast, con degradación conocida en solapamientos y habla muy rápida.
- Reconocimiento de números (aunque con inconsistencia entre dígitos y palabras).
- No soporta tool calling, agentes, visión ni audio más allá de la transcripción; es un modelo ASR puro.
- Capacidad multilingüe limitada: solo se ha validado persa iraní; el modelo base es un ajuste específico de idioma.

## Casos de uso

- Transcripción de podcasts persas: el modelo está evaluado específicamente en un podcast persa de 70 minutos no visto, con un WER de 12,3 en Q4_K_M, lo que lo hace adecuado para generar transcripciones de programas largos en local.
- Subtitulado de vídeos de YouTube en persa: con Q8_0 (886 MB) se obtiene un WER de 16,9 en el conjunto de YouTube, útil para pipelines de subtitulado automático con revisión humana posterior.
- Actas y notas de reuniones en persa: la ventana deslizante de 30 segundos permite transcribir reuniones completas en CPU, con Q4_K_M procesando aproximadamente 8 veces más rápido que tiempo real en un procesador de escritorio.
- Investigación lingüística sobre persa: los conjuntos de evaluación FLEURS (WER 6,9 en Q4_K_M) y Neyshekar (WER 6,4) permiten usar el modelo como referencia reproducible en estudios de ASR persa.
- Despliegue en dispositivos con recursos limitados: la versión Q4_K_M de 536 MB cabe en entornos embebidos o contenedores pequeños, con inferencia en CPU sin GPU.
- Transcripción de archivos de audio históricos o de archivo: el modelo base se entrenó con material de canales de historia y documentales persas, lo que puede favorecer el reconocimiento de vocabulario de esos dominios.
- Integración en aplicaciones de accesibilidad: conversión de voz a texto en persa para subtitulado en tiempo real o post-procesado, usando transcribe-cli con entrada WAV de 16 kHz mono.

## Benchmarks y rendimiento

Word error rate (%, menor es mejor) sobre subconjuntos fijos de test, ejecutado con transcribe-cli clip a clip. El podcast es un podcast persa no visto de 70 minutos, cortado en pausas.

| Modelo / archivo | Tamano | FLEURS | YouTube | YODAS2 | Neyshekar | Media | Podcast |
|---|---|---|---|---|---|---|---|
| transformers model (referencia) | 1,6 GB | 6,3 | 14,3 | 22,7 | 6,0 | 12,4 | 11,9 |
| whisper-large-v3-turbo-persian-F16.gguf | 1,6 GB | 6,7 | 17,6 | 28,5 | 6,0 | 14,7 | 13,1 |
| whisper-large-v3-turbo-persian-Q8_0.gguf | 886 MB | 6,7 | 16,9 | 28,9 | 5,9 | 14,6 | 12,6 |
| whisper-large-v3-turbo-persian-Q6_K.gguf | 693 MB | 6,9 | 17,1 | 30,0 | 5,9 | 15,0 | 13,2 |
| whisper-large-v3-turbo-persian-Q5_K_M.gguf | 620 MB | 7,0 | 17,2 | 29,7 | 5,9 | 15,0 | 13,8 |
| whisper-large-v3-turbo-persian-Q4_K_M.gguf | 536 MB | 6,9 | 17,7 | 29,1 | 6,4 | 15,0 | 12,3 |

Observaciones de la model card: la cuantización apenas degrada la precisión (todas las versiones cuantizadas quedan dentro de unos 0,3 puntos de WER medio respecto a F16), por lo que Q8_0 o incluso Q4_K_M son buenas opciones por defecto. Los archivos GGUF quedan unos 2 puntos por detrás del modelo en transformers, sobre todo en audio conversacional ruidoso (YODAS2); el archivo F16 presenta la misma brecha, lo que indica que la causa es la decodificación de transcribe.cpp, no la conversión ni la cuantización.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por tamaño de archivo, Q4_K_M (536 MB) y Q8_0 (886 MB) caben holgadamente en GPUs con 2-4 GB, y F16 (1,6 GB) en GPUs con 4 GB o más.
- GPU recomendadas: no especificadas en la información disponible; transcribe.cpp permite compilar con `-DTRANSCRIBE_CUDA=ON` para NVIDIA.
- Cabe en GPU de consumo: sí, cualquier modelo con al menos 2 GB de VRAM para las cuantizaciones bajas; también funciona en CPU.
- Opciones de despliegue: transcribe.cpp (transcribe-cli), con soporte CUDA opcional; el modelo base ofrece además pesos para transformers y GGML para whisper.cpp/FFmpeg.
- Latencia y throughput: en CPU, Q4_K_M transcribe aproximadamente 8 veces más rápido que tiempo real en un procesador de escritorio (dato de la model card). No se proporcionan cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| givia/whisper-large-v3-turbo-persian-gguf | 808.904.208 | 30 s por ventana | fa | CC-BY-4.0 | GGUF |
| givia/whisper-large-v3-turbo-persian (base) | no disponible | 30 s por ventana | fa | CC-BY-4.0 | safetensors, GGML |
| Whisper large-v3-turbo (OpenAI, original) | no disponible en la informacion | 30 s por ventana | multilingue | MIT (original) | safetensors, GGML |

No se dispone de datos de benchmarks de otros modelos ASR persas en la información proporcionada, por lo que la comparación cuantitativa se limita a las variantes del propio modelo. El modelo base en transformers obtiene una media de WER de 12,4 frente a 14,6-15,0 de las versiones GGUF, con la salvedad de que la diferencia se atribuye a la decodificación de transcribe.cpp.

## Limitaciones y advertencias

- El habla ruidosa, con solapamientos o muy rápida es más difícil de transcribir.
- Los nombres poco frecuentes y el vocabulario literario o técnico concentran la mayor parte de los errores.
- Los tramos largos de música pueden producir palabras sueltas erróneas.
- Los números se escriben de forma inconsistente, alternando dígitos y palabras.
- Solo se ha probado persa iraní; no hay validación de otras variantes del persa.
- Los archivos GGUF quedan unos 2 puntos de WER por detrás del modelo en transformers, especialmente en audio conversacional ruidoso; si la precisión es crítica, usar el modelo base en transformers.
- La detección automática de idioma puede fallar en clips cortos o ruidosos; se recomienda forzar `-l fa`.
- La licencia CC-BY-4.0 permite uso comercial con atribución; es necesario citar a los autores y respetar la atribución de los datos de entrenamiento (FLEURS, YODAS2 y canales de YouTube).
- Riesgo de alucinación en segmentos sin habla clara o con música, donde el modelo puede generar texto no presente en el audio.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, lo que implica escasa validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/givia/whisper-large-v3-turbo-persian-gguf
- Modelo base: https://huggingface.co/givia/whisper-large-v3-turbo-persian
- transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- FLEURS (Google, CC-BY-4.0): no disponible enlace directo en la información proporcionada
- YODAS2 (ESPnet/CMU, CC-BY-3.0): no disponible enlace directo en la información proporcionada
