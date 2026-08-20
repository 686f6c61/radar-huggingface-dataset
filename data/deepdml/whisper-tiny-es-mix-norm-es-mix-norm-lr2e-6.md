# deepdml/whisper-tiny-es-mix-norm-es-mix-norm-lr2e-6

## Resumen

El modelo `deepdml/whisper-tiny-es-mix-norm-es-mix-norm-lr2e-6` es un ajuste fino (fine-tune) del modelo Whisper Tiny para reconocimiento automático de voz (ASR) en español. Lo desarrolla David Jimenez (usuario `deepdml` en HuggingFace) y parte del modelo base `deepdml/whisper-tiny-es-mix-norm`, que a su vez es una versión adaptada al español del Whisper Tiny original de OpenAI. El objetivo es ofrecer una solución ligera y eficiente para transcribir audio en castellano, con un coste computacional reducido que permite su despliegue en entornos con recursos limitados.

Con 37,7 millones de parámetros, este modelo pertenece a la familia Whisper Tiny, una arquitectura transformer encoder-decoder diseñada para procesar ventanas de audio de hasta 30 segundos. Su relevancia actual radica en que combina un tamaño muy reducido con un rendimiento aceptable en tareas de transcripción en español, lo que lo hace adecuado para aplicaciones en tiempo real, dispositivos edge o entornos donde no se dispone de GPUs de alta gama. El ajuste se realizó sobre el dataset Common Voice 17.0, con una tasa de error de palabra (WER) del 16,48 % en el conjunto de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 30 segundos de audio (ventana de Whisper) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Whisper Tiny de OpenAI: un transformer encoder-decoder con atención estándar, entrenado originalmente para ASR multilingüe. Este fine-tune se realizó sobre el modelo base `deepdml/whisper-tiny-es-mix-norm`, que ya había sido adaptado al español mediante una mezcla de datasets. El entrenamiento específico se llevó a cabo sobre el dataset Common Voice 17.0 (versión `disco-eth/WorldSpeech`), con un total de 5000 pasos, un learning rate de 2e-6, batch size de 128 y optimizador AdamW con scheduler lineal y warmup de 0,04. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; se trata de un ajuste supervisado estándar para ASR.

Los datasets utilizados en el pre-entrenamiento del modelo base incluyen `multilingual_librispeech`, `voxforge`, `fleurs`, `basque_parliament_1`, `common_voice_26_0` y `voxpopuli`, todos orientados a audio en español. El fine-tune final se centró exclusivamente en Common Voice 17.0, lo que explica la mejora en la métrica WER respecto al modelo base.

## Capacidades

- Transcripción de voz en español: convierte audio en texto con una tasa de error de palabra del 16,48 % en Common Voice 17.0.
- Reconocimiento de voz automático (ASR) para audio de hasta 30 segundos por ventana.
- Soporte para inferencia en tiempo real gracias a su tamaño reducido.
- No incluye capacidades de tool calling, agentes, visión ni generación de texto libre; es exclusivamente un modelo de transcripción.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo puede procesar grabaciones de audio en español y generar transcripciones textuales, útil para actas o búsqueda de contenido. Su tamaño permite ejecutarlo en portátiles o servidores modestos.
- Subtitulado automático de vídeos: al transcribir pistas de audio, se pueden generar subtítulos en español para plataformas de vídeo, con un coste computacional bajo.
- Asistentes de voz en dispositivos edge: al ser un modelo pequeño, puede desplegarse en Raspberry Pi o dispositivos móviles para comandos de voz o dictado sin depender de la nube.
- Análisis de llamadas de atención al cliente: transcripción de conversaciones telefónicas para su posterior análisis de sentimiento o extracción de información, con la ventaja de una latencia reducida.
- Accesibilidad: conversión de contenido hablado en texto para personas con discapacidad auditiva, especialmente en aplicaciones educativas o de comunicación.
- Archivado y búsqueda de audio: indexación de archivos de audio en español mediante transcripción, permitiendo búsquedas por texto en bibliotecas de audio.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el conjunto de evaluación de Common Voice 17.0 (dataset `disco-eth/WorldSpeech`):

| Metrica | Valor |
|---|---|
| WER | 16,4832 |
| CER | 6,3310 |
| Loss | 0,2912 |

Además, se reporta la evolución durante el entrenamiento:

| Training Loss | Epoch | Step | Validation Loss | Wer Raw | Cer Raw | Wer | Cer |
|:-------------:|:-----:|:----:|:---------------:|:-------:|:-------:|:-------:|:------:|
| 0,1258 | 0,2 | 1000 | 0,2926 | 16,0642 | 6,0372 | 16,0642 | 6,0372 |
| 0,1038 | 0,4 | 2000 | 0,2908 | 16,1986 | 6,1629 | 16,1986 | 6,1629 |
| 0,0970 | 0,6 | 3000 | 0,2909 | 16,1384 | 6,1143 | 16,1384 | 6,1143 |
| 0,1130 | 0,8 | 4000 | 0,2902 | 16,2924 | 6,1876 | 16,2924 | 6,1876 |
| 0,2210 | 1,0 | 5000 | 0,2912 | 16,4832 | 6,3310 | 16,4832 | 6,3310 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- Al tratarse de un modelo de 37,7 millones de parámetros, la VRAM necesaria para inferencia es inferior a 1 GB en precisión FP32, y puede reducirse aún más con cuantización (aunque no se especifican formatos oficiales).
- Es ejecutable en CPU sin GPU, con tiempos de inferencia razonables para audio de corta duración.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1050 Ti, RTX 2060 o superiores. También funciona en hardware de gama baja como Jetson Nano.
- Opciones de despliegue: la librería `transformers` permite cargar el modelo directamente; también es compatible con exportación a ONNX para entornos de producción. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que estos están orientados a modelos de lenguaje, no a ASR.
- La latencia y el throughput no están documentados, pero por el tamaño del modelo se espera una transcripción casi en tiempo real en hardware moderno.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de otros modelos ASR en español en la información proporcionada. El modelo es un fine-tune de Whisper Tiny, por lo que su comparación natural sería con el Whisper Tiny original de OpenAI, pero no se han reportado métricas de ese modelo en este contexto. Tampoco hay datos de otros modelos como whisper-base o whisper-small en español. Por tanto, no es posible realizar una comparativa cuantitativa con alternativas en este momento.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para español; no soporta otros idiomas.
- Al ser un modelo Tiny, puede presentar errores en audio con ruido de fondo, acentos regionales poco representados o vocabulario técnico especializado.
- La ventana de contexto de 30 segundos limita la transcripción de audio más largo, que debe segmentarse previamente.
- No se han documentado sesgos específicos, pero al entrenarse sobre Common Voice, puede reflejar los sesgos demográficos y de calidad de audio de ese dataset.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero se recomienda validar el rendimiento en el dominio de aplicación concreto antes de desplegarlo en producción.
- No se proporcionan garantías sobre la precisión en condiciones de audio adversas (música, múltiples hablantes, etc.).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/deepdml/whisper-tiny-es-mix-norm-es-mix-norm-lr2e-6
- Modelo base: https://huggingface.co/deepdml/whisper-tiny-es-mix-norm
