# cheriftenga/whisper-small-ewe-v0.1

## Resumen

`cheriftenga/whisper-small-ewe-v0.1` es un modelo de reconocimiento automático del habla (ASR) publicado en Hugging Face por el usuario cheriftenga. Por el identificador y los tags del repositorio (`whisper`, `automatic-speech-recognition`), se trata de un ajuste fino de la arquitectura Whisper de OpenAI, concretamente de la variante "small", orientado presumiblemente al ewe, una lengua gbe hablada en Ghana y Togo. El modelo se distribuye en formato safetensors compatible con la librería transformers.

El repositorio contiene 241.734.912 parámetros (aproximadamente 242 millones), coherente con el tamaño de Whisper small, y ocupa 1,0 GB en el Hub. La model card es la plantilla autogenerada por Hugging Face y no aporta información sobre datos de entrenamiento, licencia, idiomas o evaluación; todos esos campos aparecen como "[More Information Needed]".

Su relevancia radica en la escasez de sistemas ASR para lenguas de bajos recursos como el ewe, pero conviene tratarlo con cautela: no hay métricas publicadas, no consta licencia y el modelo no registra descargas ni interacciones, por lo que su calidad real no está validada de forma pública.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper small, según tags del repo) |
| Parámetros totales | 241.734.912 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper small procesa ventanas de audio de 30 s) |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantización GGUF/ONNX no publicada) |
| Idiomas soportados | no disponible (el nombre sugiere ewe; no confirmado en la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a Whisper, un transformer encoder-decoder con atención completa entrenado originalmente por OpenAI para transcripción y traducción de voz (paper arXiv:1910.09700, citado en los tags del repositorio). La variante "small" emplea 12 capas de encoder y 12 de decoder con un ancho de modelo de 768 y 12 cabezas de atención, lo que da lugar a los ~242 millones de parámetros que confirma el recuento de safetensors. El frontend de audio convierte la señal en espectrogramas log-Mel de 80 canales sobre ventanas de 30 segundos, y el decoder genera tokens de texto con marcas especiales de idioma y tarea.

No hay información publicada sobre el proceso de ajuste fino: se desconoce el corpus de audio en ewe utilizado, el número de horas, la composición del dataset, si hubo aumentación de datos o si se aplicaron técnicas de regularización. Tampoco consta si el ajuste se hizo sobre el checkpoint `openai/whisper-small` original o sobre otra variante, ni los hiperparámetros empleados. La model card no documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, destilación, etc.).

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) mediante el pipeline `automatic-speech-recognition` de transformers.
- Procesamiento de audio en ventanas de hasta 30 segundos por segmento, con la lógica de chunking propia de Whisper para audios más largos.
- Presunta especialización en ewe; el resto de idiomas multilingües de Whisper small podría conservarse o haberse degradado tras el ajuste fino, sin datos que lo confirmen.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso; son capacidades ajenas al propósito de un modelo ASR.
- No se documenta modo "thinking", visión, audio generativo ni otras capacidades especiales.
- No hay información sobre marcas de tiempo (timestamps) ni sobre la tarea de traducción voz-a-texto en este checkpoint concreto.

## Casos de uso

- Transcripción de entrevistas y grabaciones de campo en ewe: el modelo puede convertir audio de hasta 30 segundos por segmento en texto, útil para investigadores lingüistas que digitalizan corpus orales, siempre que se valide la calidad con muestras propias.
- Subtitulado de contenido audiovisual en ewe: integrado en un pipeline con segmentación previa del audio, permitiría generar subtítulos para vídeos divulgativos o educativos dirigidos a hablantes de esta lengua.
- Documentación de patrimonio oral: digitalización de cuentos, canciones y testimonios para archivos etnográficos, con revisión humana posterior dado que no hay métricas de error publicadas.
- Asistentes de voz para servicios públicos en Ghana y Togo: como componente ASR en un sistema de atención ciudadana, aunque requeriría evaluación previa de robustez ante acentos y ruido ambiental.
- Investigación en ASR de bajos recursos: punto de partida para comparativas o para nuevo ajuste fino con datasets propios, dado su tamaño moderado y su compatibilidad con transformers.
- Prototipado académico en entornos con GPU modesta: sus 242 millones de parámetros permiten iterar rápidamente en una sola GPU consumer para experimentos de lingüística computacional.
- Preetiquetado de corpus de habla: generación automática de transcripciones iniciales que luego se corrigen manualmente, acelerando la creación de datasets etiquetados en ewe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 1 GB solo para pesos (242 M × 4 bytes), más activaciones y buffers de audio; en la práctica, 2-3 GB son suficientes.
- En fp16/bf16: aproximadamente 0,5 GB de pesos, con un consumo total típico por debajo de 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; funciona en RTX 3060, RTX 4060, RTX 4090, A100 y H100 sin problema. También es viable en CPU para inferencia por lotes pequeños.
- Cabe holgadamente en GPU consumer, incluidas integradas recientes con memoria unificada; es uno de los tamaños más ligeros de la familia Whisper.
- Opciones de despliegue: transformers (`pipeline("automatic-speech-recognition")`), servidores compatibles con la API de inferencia (el repo está marcado como `endpoints_compatible`), y previsiblemente conversión a ONNX o CTranslate2 (faster-whisper) aunque no se publican artefactos de esos formatos. llama.cpp y Ollama no aplican a modelos de audio de este tipo.
- Latencia y throughput: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cheriftenga/whisper-small-ewe-v0.1 | 241,7 M | 30 s por ventana (Whisper) | no disponible (presuntamente ewe) | no disponible | Hugging Face, safetensors |
| openai/whisper-small | 244 M | 30 s por ventana | Multilingüe (~99 idiomas) | MIT (según el release original de OpenAI) | Hugging Face, múltiples formatos |
| openai/whisper-base | 74 M | 30 s por ventana | Multilingüe | MIT | Hugging Face |
| openai/whisper-medium | 769 M | 30 s por ventana | Multilingüe | MIT | Hugging Face |

La comparación con `openai/whisper-small` es la más directa: mismo tamaño y arquitectura, pero el modelo de OpenAI cuenta con licencia conocida, documentación completa y evaluación publicada. Frente a `whisper-base`, este ajuste ofrece más capacidad a costa de mayor cómputo; frente a `whisper-medium`, es más ligero pero con menor precisión potencial. No se dispone de datos para comparar rendimiento ASR en ewe con alternativas específicas, si existen.

## Limitaciones y advertencias

- La model card está vacía de contenido sustantivo: no hay información sobre datos, evaluación, sesgos ni uso previsto, lo que impide auditar el modelo.
- Ausencia de licencia declarada: no se puede asumir uso comercial permitido; en la práctica, la licencia del checkpoint base (MIT en el caso de Whisper de OpenAI) no garantiza automáticamente los términos del ajuste fino.
- Riesgo de alucinación y de transcripciones inventadas, un comportamiento conocido en modelos Whisper cuando el audio es ruidoso, silencioso o está fuera de dominio.
- Posible degradación del multilingüismo original de Whisper small tras el ajuste fino en una sola lengua; no hay datos que lo confirmen ni lo descarten.
- Sin métricas de WER/CER publicadas: no se puede estimar la calidad real en ewe ni compararla con alternativas.
- Cero descargas y cero likes en el momento de la consulta: sin validación comunitaria ni señales de uso en producción.
- El modelo solo procesa ventanas de 30 segundos; audios largos requieren segmentación externa y pueden acumular errores en las fronteras.
- No apto para aplicaciones críticas (médicas, legales, accesibilidad) sin una evaluación exhaustiva previa con datos representativos del dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cheriftenga/whisper-small-ewe-v0.1
- Paper de Whisper (citado en los tags): https://arxiv.org/abs/1910.09700
- Repositorio oficial de Whisper de OpenAI: https://github.com/openai/whisper
- Modelo base de referencia: https://huggingface.co/openai/whisper-small
- Documentación de transformers para ASR: https://huggingface.co/docs/transformers/tasks/asr
