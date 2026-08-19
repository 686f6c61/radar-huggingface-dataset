# Kiyan122/whisper-small-fa-ManaTTS

## Resumen

`whisper-small-fa-ManaTTS` es un modelo de reconocimiento automático del habla (ASR) desarrollado por Kiyan122, resultado de un fine-tuning del modelo base `openai/whisper-small` sobre un conjunto de datos no especificado, aunque el nombre sugiere que podría estar relacionado con el dataset de voz persa ManaTTS. Está orientado a la transcripción de audio en persa (farsi), aprovechando la arquitectura robusta de Whisper para entornos con ruido y acentos variados.

Con 241,7 millones de parámetros, este modelo hereda la arquitectura encoder-decoder de Whisper Small, que procesa ventanas de audio de hasta 30 segundos. Su licencia Apache 2.0 permite uso comercial sin restricciones, y su tamaño lo hace viable para despliegue en GPUs de consumo. La relevancia actual radica en la escasez de modelos ASR persas de calidad publicados con pesos abiertos; este fine-tuning busca cubrir ese hueco, aunque la falta de documentación y de benchmarks publicados limita su evaluación objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper Small (transformer encoder-decoder con atención) |
| Parametros totales | 241.734.912 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 448 tokens de audio (30 segundos de audio por ventana) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | Persa (farsi) como idioma principal; el modelo base soporta 96 idiomas, pero el fine-tuning no garantiza el rendimiento en otros |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `openai/whisper-small`, un transformer encoder-decoder con atención estándar, entrenado originalmente por OpenAI sobre 680.000 horas de audio etiquetado de forma débil. El fine-tuning realizado por Kiyan122 ajusta los pesos del modelo base sobre un dataset no documentado (posiblemente relacionado con ManaTTS). Los hiperparámetros de entrenamiento indican un proceso con learning rate de 1e-05, batch total de 256, 400 pasos de entrenamiento, y optimización con AdamW y scheduler cosine_with_min_lr. Se usaron 2 GPUs con precisión mixta nativa. No se menciona el uso de RLHF, DPO ni técnicas de alineación adicionales; el entrenamiento se limita a un ajuste supervisado estándar para la tarea de ASR.

## Capacidades

- Transcripción de voz a texto en persa (farsi) a partir de audio de hasta 30 segundos por ventana.
- Manejo de audio con ruido de fondo y acentos variados, gracias a la robustez heredada de Whisper Small.
- Detección de idioma y transcripción multilingüe en menor medida (el modelo base lo soporta, pero el fine-tuning puede degradar el rendimiento en otros idiomas).
- No soporta tool calling, function calling ni razonamiento multi-paso; es un modelo puramente de reconocimiento de voz.
- No incluye capacidades de visión ni de generación de texto libre más allá de la transcripción.

## Casos de uso

- Transcripción de reuniones y entrevistas en persa: el modelo puede procesar grabaciones de audio de larga duración segmentándolas en ventanas de 30 segundos, ideal para generar actas o resúmenes posteriores.
- Subtitulado automático de vídeos en persa: integrable en pipelines de generación de subtítulos para plataformas de vídeo, con una precisión suficiente para contenidos hablados claros.
- Asistentes de voz para aplicaciones en persa: al ser ligero (241M parámetros), puede desplegarse en servidores modestos o incluso en edge computing para convertir comandos de voz en texto.
- Análisis de llamadas de atención al cliente: transcripción de grabaciones de centros de contacto para su posterior análisis de sentimiento o extracción de información.
- Accesibilidad para personas con discapacidad auditiva: conversión en tiempo real de discurso persa a texto en aplicaciones de comunicación.
- Investigación académica en procesamiento del habla persa: sirve como modelo base para experimentos de fine-tuning adicional o como punto de partida para sistemas de diálogo por voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index de la ficha del modelo declara una lista de resultados vacía (`results: []`), por lo que no es posible comparar su rendimiento cuantitativo con otros modelos de forma objetiva.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB en FP32 y alrededor de 0,8 GB en cuantización de 8 bits (valores orientativos para Whisper Small).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1650, RTX 3060, o superiores. También funciona en CPU con mayor latencia.
- Cabe en GPUs de consumo como RTX 3060, RTX 4060, etc., sin problemas.
- Opciones de despliegue: compatible con `transformers` (pipeline `automatic-speech-recognition`), `vLLM` (con adaptaciones), `llama.cpp` (si se convierte a GGUF), y `Ollama` (mediante integración de modelos de voz).
- Latencia estimada: en una RTX 3060, la transcripción de un audio de 30 segundos suele completarse en menos de 2 segundos; en CPU puede tardar entre 5 y 10 segundos por ventana.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| Kiyan122/whisper-small-fa-ManaTTS | 241,7M | 30 s | Persa (fine-tune) | Apache 2.0 | Dataset y benchmarks no publicados |
| openai/whisper-small | 241,7M | 30 s | Multilingüe (96 idiomas) | MIT | Modelo base, buen rendimiento general |
| benchmarkcentral/whisper-small-fa | 241,7M | 30 s | Persa (fine-tune) | Apache 2.0 | Entrenado en Common Voice 11.0, con resultados publicados en su ficha |

La comparativa directa con `benchmarkcentral/whisper-small-fa` es relevante porque ambos son fine-tunes de Whisper Small para persa. Sin embargo, la falta de datos de evaluación en `Kiyan122/whisper-small-fa-ManaTTS` impide establecer cuál ofrece mejor rendimiento. El modelo original `openai/whisper-small` sirve como referencia de rendimiento multilingüe, aunque su precisión en persa es inferior a la de un fine-tune específico.

## Limitaciones y advertencias

- El conjunto de datos de entrenamiento no está documentado; se desconoce su composición, tamaño y calidad, lo que dificulta evaluar la generalización del modelo.
- No se han publicado resultados de evaluación en ningún benchmark; cualquier afirmación sobre su precisión es especulativa.
- El fine-tuning puede haber degradado el rendimiento en idiomas distintos del persa, por lo que no se recomienda su uso fuera de este ámbito.
- Al ser un modelo ASR, puede presentar alucinaciones (transcripciones inventadas) en audios muy ruidosos o con habla superpuesta, un problema conocido de Whisper.
- No se han realizado pruebas de sesgo; es posible que el modelo refleje sesgos presentes en los datos de entrenamiento (por ejemplo, acentos o dialectos específicos del persa).
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento ni soporte técnico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kiyan122/whisper-small-fa-ManaTTS
- Modelo base (openai/whisper-small): https://huggingface.co/openai/whisper-small
- Repositorio oficial de Whisper (OpenAI): https://github.com/openai/whisper
- Modelo comparable (benchmarkcentral/whisper-small-fa): https://huggingface.co/benchmarkcentral/whisper-small-fa
- Repositorio relacionado (mjavadf/whisper-small-fa): https://github.com/mjavadf/whisper-small-fa
