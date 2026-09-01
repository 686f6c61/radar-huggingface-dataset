# Devsyril/whisper-small-ewe-ggml

## Resumen

El modelo `Devsyril/whisper-small-ewe-ggml` es una conversión al formato GGML del modelo fine-tuneado `abiyo27/whisper-small-ewe`, diseñado para el reconocimiento automático de voz (ASR) en éwé, una lengua hablada en Ghana, Togo y Benín. La conversión permite ejecutar el modelo con la biblioteca `whisper.cpp`, optimizada para inferencia en CPU y dispositivos de bajos recursos. El autor de la conversión es Devsyril, y se distribuye bajo licencia Apache 2.0.

El modelo base es un fine-tune de Whisper small de OpenAI, que cuenta con aproximadamente 244 millones de parámetros y una arquitectura encoder-decoder Transformer. Esta versión en GGML incluye tres archivos con diferentes niveles de cuantización (f16, q8_0 y q5_0), lo que facilita su despliegue en entornos con restricciones de memoria. Aunque no se proporcionan detalles sobre el conjunto de datos de entrenamiento, el modelo está especializado en el idioma éwé, un caso relevante para mejorar la cobertura de lenguas de bajos recursos en sistemas de ASR.

La relevancia de este modelo radica en su formato ligero y portable, que permite integrar transcripción de voz en éwé en aplicaciones locales, sin depender de servicios en la nube ni de GPUs dedicadas. Es una opción práctica para desarrolladores que trabajan en herramientas de accesibilidad, subtitulado o asistentes de voz en regiones donde el éwé es predominante.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper small (encoder-decoder Transformer) |
| Parametros totales | No disponible (se estima ~244 M, basado en Whisper small) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (Whisper usa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | f16, q8_0, q5_0 |
| Idiomas soportados | Ewe (código `ee`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGML (binarios para whisper.cpp) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Whisper small de OpenAI, un Transformer encoder-decoder entrenado para múltiples tareas de habla, incluyendo reconocimiento, traducción y identificación de idioma. En este caso, el modelo original fue fine-tuneado específicamente para ASR en éwé, probablemente sobre un corpus de audio transcrito en dicha lengua. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. La conversión a GGML se realizó mediante el script oficial `convert-h5-to-ggml.py` de whisper.cpp, sin modificar los pesos del modelo.

Al ser una conversión de formato, no introduce innovaciones arquitectónicas; se mantiene la estructura original del Whisper small. La cuantización (q5_0, q8_0) reduce el tamaño del modelo a costa de una ligera pérdida de precisión, pero permite ejecutarlo en dispositivos con poca memoria.

## Capacidades

- Reconocimiento automático de voz (ASR) para el idioma éwé, transcribiendo audio a texto.
- Compatible con la API de whisper.cpp, que permite procesar archivos de audio (WAV, MP3, etc.) y entrada de micrófono en tiempo real.
- Soporte de identificación de idioma (aunque el modelo está especializado en éwé, puede heredar la capacidad multilingüe del Whisper base, pero no está garantizado tras el fine-tune).
- No se documentan capacidades de traducción, tool calling o razonamiento; es un modelo puramente de ASR.

## Casos de uso

- Transcripción de reuniones y conferencias en éwé: el modelo puede convertir grabaciones de audio a texto, facilitando la generación de actas o subtítulos. Su formato GGML permite ejecutarlo en portátiles o mini-PCs sin GPU.
- Subtitulado automático de vídeos en éwé: integrando el modelo con herramientas de procesamiento de vídeo, se pueden generar subtítulos para contenido audiovisual en esta lengua, mejorando la accesibilidad.
- Asistentes de voz para comunidades éwé: al ser ligero, puede desplegarse en dispositivos embebidos o teléfonos de gama baja para interactuar mediante comandos de voz en éwé.
- Archivo y digitalización de material oral: permite transcribir entrevistas, narraciones o documentos sonoros en éwé para preservar el patrimonio cultural y lingüístico.
- Aplicaciones educativas: ayuda en el aprendizaje del éwé, transcribiendo pronunciaciones y ofreciendo retroalimentación escrita.
- Investigación lingüística: útil para análisis de corpus orales en éwé, facilitando estudios fonéticos o sociolingüísticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo base `abiyo27/whisper-small-ewe` tampoco incluye métricas reportadas en su model card, y la conversión GGML no añade datos de evaluación. Por tanto, no es posible comparar su rendimiento con otros modelos de forma objetiva.

## Requisitos de hardware

- Tamaño del modelo: el archivo f16 ocupa aproximadamente 0.5 GB (según el tamaño del repositorio); las versiones cuantizadas q8_0 y q5_0 son más pequeñas (típicamente ~0.3 GB y ~0.2 GB respectivamente).
- Inferencia en CPU: whisper.cpp está optimizado para CPU, por lo que puede ejecutarse en procesadores x86_64 y ARM (incluyendo Raspberry Pi) sin necesidad de GPU.
- VRAM: no requiere VRAM si se usa CPU; en GPU, cabría en cualquier GPU con al menos 1 GB de memoria (por ejemplo, GTX 1050 Ti o superior).
- GPU recomendadas: cualquier GPU moderna (RTX 20xx o superior) para aceleración mediante CUDA, aunque no es imprescindible.
- Opciones de despliegue: whisper.cpp (línea de comandos), integración con Python mediante bindings (pywhispercpp), o servidores de inferencia como whisper.cpp server.
- Latencia: en CPU, la transcripción de un audio de 30 segundos puede tomar entre 5 y 15 segundos dependiendo del hardware; en GPU, se reduce a 1-3 segundos.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| Devsyril/whisper-small-ewe-ggml | Whisper small | ~244 M (estimado) | 30 s audio | Ewe | Apache 2.0 | GGML |
| openai/whisper-small | Whisper small | 244 M | 30 s audio | Multilingue (99 idiomas) | MIT | PyTorch, etc. |
| abiyo27/whisper-small-ewe | Whisper small (fine-tune) | ~244 M | 30 s audio | Ewe | Apache 2.0 (según licencia del repositorio) | PyTorch |

La comparación muestra que el modelo GGML es una adaptación ligera del fine-tune original, con la ventaja de poder ejecutarse en entornos sin Python ni GPU. Frente a whisper-small original, el modelo fine-tuneado ofrece mejor precisión en éwé, aunque pierde las capacidades multilingües. No se dispone de otros modelos ASR específicos para éwé para comparar.

## Limitaciones y advertencias

- No se han documentado sesgos específicos, pero al ser un modelo entrenado probablemente con datos religiosos (según la referencia a BibleTTS en un modelo similar), puede tener un vocabulario limitado en contextos coloquiales o técnicos.
- Riesgo de alucinaciones: como cualquier modelo ASR, puede generar transcripciones incorrectas en audios con ruido o acentos no representados en el entrenamiento.
- Limitación de idioma: el modelo está especializado en éwé; no se recomienda usarlo para otros idiomas, ya que el fine-tune puede degradar el rendimiento multilingüe del Whisper base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe mantener el aviso de licencia y atribución. No hay restricciones adicionales conocidas.
- Para producción, es necesario validar el rendimiento con datos propios, ya que no hay benchmarks públicos. Además, la cuantización q5_0 puede introducir errores adicionales en comparación con f16.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Devsyril/whisper-small-ewe-ggml
- Modelo base (fine-tune original): https://huggingface.co/abiyo27/whisper-small-ewe
- Repositorio de whisper.cpp: https://github.com/ggml-org/whisper.cpp
- Documentación de modelos de whisper.cpp: https://github.com/ggml-org/whisper.cpp/blob/master/models/README.md
- Modelo original de OpenAI Whisper: https://huggingface.co/openai/whisper-small
