# alefiury/parakeet-tdt-v3-ptBR-30s-onnx

## Resumen

`parakeet-tdt-v3-ptBR-30s-onnx` es la exportación a formato ONNX del modelo de reconocimiento automático del habla (ASR) `alexandreacff/parakeet-tdt-v3-ptBR-30s`, publicada por el usuario alefiury. El modelo original es un ajuste fino de la familia Parakeet (NVIDIA NeMo) para portugués de Brasil, con arquitectura NeMo Conformer-TDT (Token-and-Duration Transducer), y esta versión está empaquetada específicamente para su uso con la librería `onnx-asr`, lo que permite ejecutar la inferencia sin depender del stack completo de NeMo/PyTorch.

El interés de esta ficha es doble: por un lado, documenta un modelo ASR en portugués de Brasil listo para producción en entornos ligeros (CPU o GPU sin PyTorch); por otro, ilustra el patrón habitual de "exportación comunitaria" de modelos NeMo a ONNX. El tamaño del repositorio es de 2,5 GB, lo que sugiere pesos en precisión completa o FP16 más los ficheros auxiliares del tokenizer y la configuración.

No se dispone de información detallada sobre el entrenamiento, los datos utilizados ni los resultados de evaluación en la documentación proporcionada; la model card remite explícitamente a la ficha del modelo base para esos detalles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | NeMo Conformer-TDT (Token-and-Duration Transducer) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s según el nombre del modelo) |
| Tipos de cuantización | no disponible (el repo contiene pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | portugués (pt), con foco en portugués de Brasil (ptBR) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (compatible con `onnx-asr`) |
| Tarea | automatic-speech-recognition |
| Modelo base | alexandreacff/parakeet-tdt-v3-ptBR-30s |
| Tamaño del repositorio | 2,5 GB |

## Arquitectura y entrenamiento

La arquitectura es un Conformer-TDT, es decir, un encoder Conformer (convolución + self-attention) combinado con un decoder de tipo Transducer que predice conjuntamente tokens y duraciones (Token-and-Duration Transducer). Este diseño es el estándar de la familia Parakeet de NVIDIA NeMo para ASR y permite decodificación no autorregresiva por tramos, lo que reduce la latencia frente a transductores clásicos.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO (poco habitual en ASR) ni innovaciones técnicas adicionales más allá de las propias del TDT. La model card de esta exportación no incluye detalles de entrenamiento y remite a la ficha del modelo base `alexandreacff/parakeet-tdt-v3-ptBR-30s`. El sufijo "30s" en el nombre indica que el modelo está pensado para procesar segmentos de audio de hasta 30 segundos.

## Capacidades

- Reconocimiento automático del habla en portugués de Brasil, con salida de transcripción textual.
- Procesamiento de segmentos de audio de hasta 30 segundos por inferencia (según la denominación del modelo).
- Decodificación TDT (token + duración), que permite alinear temporalmente la salida con el audio de forma más eficiente que un CTC puro.
- Ejecución mediante `onnx-asr`, lo que habilita despliegue en entornos sin PyTorch ni NeMo.
- No se documentan capacidades de diarización, traducción, puntuación automática, timestamps a nivel de palabra ni tool calling; no disponible.
- Capacidad multilingüe limitada al portugués; no se declaran otros idiomas.

## Casos de uso

- Transcripción de reuniones y actas en portugués de Brasil: el modelo puede procesar segmentos de hasta 30 s y encadenarse para audio largo, generando transcripciones que luego se posprocesan con puntuación y hablantes.
- Subtitulado automático de vídeo en portugués: al ejecutarse en ONNX, puede integrarse en pipelines de edición o plataformas de vídeo sin dependencia de CUDA/PyTorch, reduciendo el coste de despliegue.
- Atención al cliente y centros de contacto: transcripción de llamadas grabadas para análisis de calidad, búsqueda de palabras clave y generación de resúmenes posteriores.
- Dictado y accesibilidad: integración en aplicaciones de escritorio o móviles que convierten voz en texto en portugués, aprovechando la portabilidad de ONNX a CPU.
- Indexación y búsqueda de archivos de audio: transcripción masiva de podcasts o archivos de audio para hacerlos buscables por texto.
- Investigación en ASR para portugués: punto de partida para fine-tuning o para comparativas con otros modelos ASR en ptBR, dado que la licencia CC-BY-4.0 permite uso y adaptación con atribución.
- Despliegue en entornos edge o sin GPU: al no requerir el stack NeMo, puede ejecutarse en servidores modestos o dispositivos con CPU, siempre que el rendimiento sea aceptable para el caso de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de esta exportación no incluye métricas (WER, CER, latencia) y remite al modelo base, cuyos resultados no se han proporcionado en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 2,5 GB, por lo que se puede estimar un consumo de memoria en el orden de 2-4 GB en función de la precisión de los pesos ONNX y del tamaño del lote.
- GPU recomendadas: no se especifican; al ser un modelo ASR de tamaño moderado, cabría esperar buen rendimiento en GPUs de consumo como RTX 3060/4060 o superiores, aunque no hay datos publicados que lo confirmen.
- Ejecución en CPU: viable gracias al backend ONNX y a la librería `onnx-asr` (que ofrece extras `[cpu]`), aunque el throughput no está documentado.
- Opciones de despliegue: `onnx-asr` (con extras `cpu` y `hub`), ONNX Runtime; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a ASR).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto de audio | Licencia | Formato |
|---|---|---|---|---|---|
| parakeet-tdt-v3-ptBR-30s-onnx (este) | NeMo Conformer-TDT | pt (ptBR) | 30 s | CC-BY-4.0 | ONNX |
| alexandreacff/parakeet-tdt-v3-ptBR-30s | NeMo Conformer-TDT | pt (ptBR) | 30 s | no disponible en esta ficha | NeMo/PyTorch |
| Whisper (OpenAI) | Transformer encoder-decoder | multilingüe | 30 s | MIT | múltiples (incl. ONNX comunitario) |
| Wav2Vec2 / XLS-R (Meta) | Transformer convolucional | multilingüe | variable | MIT / CC-BY-NC según variante | PyTorch, ONNX comunitario |

No se dispone de datos de rendimiento (WER) para establecer una comparación cuantitativa fiable con estos modelos; la comparativa se limita a arquitectura, idioma, licencia y formato.

## Limitaciones y advertencias

- Modelo especializado en portugués de Brasil; el rendimiento en otras variantes del portugués (pt-PT) o en otros idiomas no está documentado y probablemente sea deficiente.
- Ventana de audio de 30 s: para audio más largo es necesario segmentar y gestionar manualmente los cortes, con riesgo de errores en las fronteras.
- No se documentan sesgos concretos, pero al ser un ajuste fino sobre Parakeet, hereda los sesgos del corpus de entrenamiento original (no disponible en esta ficha).
- Riesgo de alucinación y errores en audio con ruido, acentos marcados, solapamiento de hablantes o vocabulario técnico; no hay métricas publicadas que permitan acotar el WER esperado.
- Licencia CC-BY-4.0: permite uso comercial y modificaciones siempre que se atribuya la autoría; conviene revisar también la licencia del modelo base y de los datos de entrenamiento originales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado recientemente; no hay evidencia de uso en producción ni validación comunitaria.
- Al ser una exportación comunitaria, no está respaldada oficialmente por NVIDIA ni por el autor del modelo base; posibles discrepancias entre el comportamiento ONNX y el original no están documentadas.
- No se especifican requisitos de versión de ONNX Runtime ni de `onnx-asr`; conviene fijar versiones en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alefiury/parakeet-tdt-v3-ptBR-30s-onnx
- Modelo base: https://huggingface.co/alexandreacff/parakeet-tdt-v3-ptBR-30s
- Librería onnx-asr: https://github.com/istupakov/onnx-asr
