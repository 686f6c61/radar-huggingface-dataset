# avestasaba/whisper-3

## Resumen

El modelo `avestasaba/whisper-3` es un ajuste fino (fine-tuning) de `openai/whisper-large-v3`, el sistema de reconocimiento automático del habla (ASR) de OpenAI, realizado por el usuario `avestasaba`. Se trata de un modelo transformer encoder-decoder con 1.543.490.560 parámetros, entrenado con la librería `transformers` de Hugging Face y publicado bajo licencia Apache 2.0. El ajuste se realizó sobre un dataset no especificado (aparece como "None" en la model card), con una única época y una tasa de aprendizaje de 1e-05.

La relevancia de este modelo radica en que parte de una base ya muy capaz como Whisper large-v3, que soporta múltiples idiomas, traducción del habla e identificación de idioma, y lo adapta a un dominio concreto mediante entrenamiento adicional. Aunque la información pública es escasa (no se detalla el dataset de entrenamiento ni los idiomas soportados), los resultados reportados en evaluación muestran una pérdida de 0.0722 y un WER de 4.3823, lo que sugiere un rendimiento razonable en la tarea de transcripción. El repositorio tiene 0 descargas y 0 likes, lo que indica que es un modelo reciente y poco difundido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 1.543.490.560 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (Whisper usa ventanas de audio de 30 segundos, pero no se especifica para este ajuste) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles (el modelo base soporta 99 idiomas, pero no se confirma para este ajuste) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repo: 6.2 GB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Whisper large-v3: un transformer encoder-decoder con atención multi-cabeza, diseñado para procesar espectrogramas de audio de 30 segundos y generar texto transcrito o traducido. El encoder procesa la representación log-mel del audio, mientras que el decoder autoregresivo genera los tokens de texto. Esta arquitectura permite realizar múltiples tareas (transcripción, traducción, identificación de idioma) mediante tokens de instrucción especiales.

El entrenamiento se realizó con el `Trainer` de Hugging Face, usando los siguientes hiperparámetros: learning rate de 1e-05, batch size de entrenamiento de 10, batch size de evaluación de 32, optimizador AdamW (fused), scheduler lineal con 500 pasos de warmup, y una única época. Se utilizó precisión mixta nativa (AMP). El dataset de entrenamiento no está especificado en la model card, lo que limita la reproducibilidad. Los resultados de entrenamiento muestran una disminución progresiva de la pérdida de validación desde 0.1165 hasta 0.0722, y del WER desde 14.7725 hasta 4.3823, lo que indica una convergencia estable.

## Capacidades

- Reconocimiento automático del habla (ASR) multilingüe, heredado del modelo base Whisper large-v3, aunque no se confirma qué idiomas mantiene este ajuste.
- Transcripción de audio a texto en múltiples idiomas (dependiendo del dataset de entrenamiento, no especificado).
- Traducción del habla de un idioma a otro (capacidad del modelo base, no verificada en este ajuste).
- Identificación de idioma (capacidad del modelo base).
- Manejo de audio con ruido y acentos diversos, gracias al entrenamiento robusto de Whisper.
- Generación de subtítulos y transcripciones con marcas de tiempo (si se usa el decodificador adecuado).

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo puede convertir grabaciones de audio en texto, útil para actas o análisis posterior. Su WER de 4.38 en evaluación sugiere una precisión aceptable, aunque depende del dominio del dataset de entrenamiento.
- Subtitulado automático de vídeos: al ser un modelo de ASR, puede generar subtítulos para contenido multimedia, reduciendo el trabajo manual. La ventana de 30 segundos de Whisper facilita el procesamiento por segmentos.
- Asistentes de voz y comandos por voz: integrado en aplicaciones, puede transcribir comandos de usuario para sistemas de control por voz, aunque requiere un pipeline adicional para la detección de intención.
- Análisis de llamadas de atención al cliente: transcripción de llamadas para extraer información, evaluar calidad o entrenar modelos de análisis de sentimiento. El contexto largo de audio (hasta 30 segundos por segmento) permite procesar conversaciones completas.
- Accesibilidad para personas con discapacidad auditiva: conversión de audio en tiempo real a texto para subtítulos en directo o transcripciones de eventos.
- Investigación lingüística: transcripción de corpus de audio para estudios fonéticos o de variación dialectal, aprovechando el soporte multilingüe del modelo base.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados en el conjunto de evaluación (dataset no especificado):

| Metrica | Valor |
|---|---|
| Loss | 0.0722 |
| WER | 4.3823 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible. El modelo-index de Hugging Face está vacío, por lo que no hay métricas estandarizadas (MMLU, HumanEval, etc.) aplicables a un modelo de ASR. El WER reportado es el único dato de rendimiento, y debe interpretarse con cautela al desconocer el corpus de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.543.490.560 parámetros en FP16, los pesos ocupan aproximadamente 3.1 GB. Con overhead de activaciones y buffers, se recomienda al menos 6-8 GB de VRAM para inferencia en lote pequeño.
- GPU recomendadas: una NVIDIA RTX 3060 (12 GB) o superior puede ejecutar el modelo en FP16. Para mayor velocidad, una RTX 4090 o A100 (40 GB) permiten procesar lotes más grandes.
- En consumer GPU: sí, cabe en GPUs de 8 GB o más, como la RTX 3070, 3080, 4060 Ti, etc., usando FP16 o cuantización.
- Opciones de despliegue: al ser un modelo de `transformers`, se puede servir con vLLM (aunque está más orientado a LLM, soporta ASR), Hugging Face Inference Endpoints, o mediante la API de `transformers` con `pipeline("automatic-speech-recognition")`. También es compatible con `whisper.cpp` si se convierte a GGUF, aunque no se proporcionan pesos en ese formato.
- Latencia y throughput: no disponibles. Dependen del hardware y del tamaño del lote. En una GPU moderna, un segmento de 30 segundos de audio se procesa en menos de 1 segundo en FP16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| avestasaba/whisper-3 | 1.54B | No disponible | Apache 2.0 | Fine-tuning de Whisper large-v3, WER 4.38 en eval |
| openai/whisper-large-v3 | 1.55B | 30 s de audio | MIT (original) | Modelo base, sin ajuste específico |
| openai/whisper-large-v2 | 1.55B | 30 s de audio | MIT | Versión anterior, similar en capacidad |

La comparativa se limita al modelo base, ya que no hay otros fine-tunings públicos comparables en la información disponible. El ajuste de `avestasaba` podría ofrecer mejor rendimiento en un dominio específico, pero no se conocen los datos de entrenamiento ni las métricas comparativas.

## Limitaciones y advertencias

- El dataset de entrenamiento no está especificado, lo que impide conocer el dominio de aplicación óptimo y los posibles sesgos introducidos.
- No se confirman los idiomas soportados tras el ajuste fino; el modelo base soporta 99, pero el fine-tuning podría haber reducido o alterado esa cobertura.
- El WER reportado (4.38) es alto en comparación con modelos ASR comerciales (que suelen estar por debajo de 2 en inglés limpio), lo que sugiere que el ajuste puede no ser óptimo o que el dataset de evaluación es difícil.
- Riesgo de alucinación en audio con mucho ruido o habla no nítida, común en modelos Whisper.
- La licencia Apache 2.0 permite uso comercial, pero al ser un fine-tuning de un modelo con licencia MIT, se deben respetar los términos de la base.
- No hay información sobre cuantizaciones disponibles, por lo que el despliegue en entornos con poca VRAM requeriría conversión manual.
- El repositorio tiene 0 descargas y 0 likes, lo que indica falta de validación por parte de la comunidad.

## Enlaces

- [Hugging Face: avestasaba/whisper-3](https://huggingface.co/avestasaba/whisper-3)
- [Modelo base: openai/whisper-large-v3](https://huggingface.co/openai/whisper-large-v3)
- [Repositorio oficial de Whisper en GitHub](https://github.com/openai/whisper)
- [Página de Whisper 3 en AI Stats](https://ai-stats.phaseo.app/models/openai/whisper-3)
- [Pricing y specs de Whisper 3 en CloudPrice](https://cloudprice.net/models/openai-whisper-3)
