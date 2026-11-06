# chunwmak9/benny-lightweight-cantonese-to-text-model

## Resumen

benny-lightweight-cantonese-to-text-model es un modelo de reconocimiento automático del habla (ASR) especializado en cantonés, desarrollado por el usuario chunwmak9 y publicado en Hugging Face. Se trata de un fine-tuning de openai/whisper-base, el modelo base de OpenAI de 72,6 millones de parámetros, adaptado mediante LoRA y posteriormente fusionado con el modelo original. El objetivo declarado por el autor es mejorar la transcripción de vocabulario y expresiones propias del cantonés coloquial, que el Whisper base tiende a normalizar hacia mandarín estándar.

El modelo aborda un problema concreto: Whisper base, entrenado mayoritariamente con datos multilingües, transcribe audio en cantonés produciendo a menudo texto en chino escrito estándar (mandarín) en lugar de reflejar el léxico cantonés real. Según la model card, el fine-tuning consigue que expresiones como "嘢" o "啊" aparezcan en la transcripción, frente a la salida más genérica del modelo original.

Es un modelo muy ligero (aproximadamente 0,1 GB de repositorio, 72,6 millones de parámetros) pensado para despliegues con recursos limitados. El autor indica que el ajuste se realizó con el 10 % del corpus cantonés MDCC. La información pública disponible es escasa: no hay licencia declarada, no hay benchmarks publicados y el modelo no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper base de OpenAI) |
| Parámetros totales | 72.593.920 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de Whisper base: 30 segundos por segmento) |
| Tipos de cuantización | no disponible (pesos en safetensors; compatible con cuantizaciones estándar de Whisper, no documentadas por el autor) |
| Idiomas soportados | yue (cantonés), zh (chino) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de openai/whisper-base, un transformer encoder-decoder con 72,6 millones de parámetros diseñado para ASR multilingüe. Sobre esta base, el autor aplicó un fine-tuning con LoRA (Low-Rank Adaptation) y fusionó después los adaptadores con los pesos originales, de modo que el resultado es un checkpoint estándar de Whisper sin capas adicionales en tiempo de inferencia.

El entrenamiento utilizó el 10 % del corpus cantonés MDCC (Multi-Domain Cantonese Corpus), según la model card. No se especifican el número de tokens, la composición exacta del subconjunto, la duración total de audio, la configuración de hiperparámetros ni si hubo etapas de alineación o preferencias. Tampoco se documentan innovaciones técnicas adicionales más allá del propio proceso de fine-tuning con LoRA.

## Capacidades

- Reconocimiento automático del habla en cantonés (yue) con salida en caracteres chinos.
- Transcripción de audio en chino (zh) heredada del modelo base Whisper.
- Mejora declarada en la captura de léxico cantonés coloquial (por ejemplo, "嘢", "啊") frente al Whisper base.
- Procesamiento de segmentos de audio de hasta 30 segundos por ventana, según las limitaciones estándar de Whisper.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta modo thinking, visión ni audio más allá de la transcripción.
- Capacidades multilingües limitadas a los idiomas declarados (yue, zh); no se garantiza el resto de idiomas de Whisper base tras el fine-tuning.

## Casos de uso

- Transcripción de conversaciones coloquiales en cantonés: el ajuste con léxico cantonés permite capturar partículas y expresiones que el Whisper base normaliza hacia mandarín, útil para subtitulado de contenido informal.
- Subtitulado automático de vídeo y pódcast en cantonés: el tamaño reducido (72,6 M de parámetros) permite procesar lotes de audio en CPU o GPU modesta sin grandes requisitos de infraestructura.
- Archivado y búsqueda de grabaciones en cantonés: transcripción de entrevistas o reuniones para generar índices de texto consultables, aceptando la precisión limitada de un modelo base.
- Prototipado rápido de asistentes de voz en cantonés: al ser un checkpoint estándar de Whisper, se integra directamente con la pipeline de transformers y sirve como base para experimentos antes de escalar a modelos mayores.
- Investigación lingüística sobre cantonés: extracción de transcripciones para análisis de vocabulario coloquial, con la advertencia de que la calidad no está validada con métricas publicadas.
- Despliegue en dispositivos con recursos limitados: el tamaño del repositorio (0,1 GB) y el formato safetensors facilitan su ejecución en entornos edge o en contenedores pequeños.
- Evaluación comparativa de fine-tuning con LoRA: sirve como ejemplo reproducible de adaptación de Whisper a una variante dialectal con un subconjunto pequeño de corpus.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye un ejemplo cualitativo con un clip de audio: antes del fine-tuning el modelo producía "帮我买东西吗?" y después "幫我買嘢啊". No hay cifras de WER, CER ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (72,6 M de parámetros, aproximadamente 0,3 GB en fp32 y menos en fp16); el repositorio completo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; también funciona en CPU. No requiere A100 ni H100.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, GTX 1650, etc.) e incluso en dispositivos de gama baja.
- Opciones de despliegue: pipeline de transformers (como indica la model card), y por ser un checkpoint Whisper estándar, es compatible con implementaciones habituales de Whisper (por ejemplo, faster-whisper o whisper.cpp), aunque el autor no las documenta explícitamente.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| benny-lightweight-cantonese-to-text-model | 72,6 M | 30 s por segmento (Whisper base) | yue, zh | no disponible | Hugging Face, 0 descargas |
| openai/whisper-base | 74 M | 30 s por segmento | multilingüe (99 idiomas) | MIT (según el modelo original) | Hugging Face, ampliamente usado |
| openai/whisper-small | 244 M | 30 s por segmento | multilingüe | MIT (según el modelo original) | Hugging Face, ampliamente usado |

La comparación con otros fine-tunings específicos de cantonés no está disponible en la información proporcionada. Frente a whisper-base, este modelo sacrifica cobertura multilingüe a cambio de una mejor adaptación al léxico cantonés, según el ejemplo cualitativo del autor.

## Limitaciones y advertencias

- No se declara licencia, lo que impide determinar si el uso comercial está permitido; es un riesgo relevante para producción.
- El fine-tuning se realizó solo con el 10 % del corpus MDCC, lo que puede limitar la cobertura de vocabulario, acentos y dominios.
- No hay métricas de calidad publicadas (WER/CER); la única evidencia es un ejemplo cualitativo con un clip.
- El modelo no registra descargas ni validación por parte de la comunidad, por lo que su robustez no está contrastada.
- Riesgo de alucinación y de normalización hacia mandarín en audio con ruido, acentos no vistos o vocabulario fuera del subconjunto de entrenamiento.
- El fine-tuning puede degradar el rendimiento en otros idiomas que Whisper base sí soportaba.
- Limitación de contexto de audio: Whisper procesa ventanas de 30 segundos; audios más largos requieren segmentación externa.
- No se documentan sesgos específicos, pero al derivar de Whisper base hereda los sesgos del corpus original de OpenAI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chunwmak9/benny-lightweight-cantonese-to-text-model
- Modelo base: https://huggingface.co/openai/whisper-base
- Corpus MDCC (referenciado en la model card, sin enlace directo proporcionado): no disponible
