# igunosalabs/Unose-Huen-Base

## Resumen

Unose-Huen-Base es un modelo de reconocimiento automático del habla (ASR) desarrollado por Igunosalabs, un fine-tune del Whisper Base de OpenAI orientado específicamente al inglés nigeriano y al pidgin nigeriano. Con 72,6 millones de parámetros, se posiciona como una alternativa compacta para entornos con recursos limitados, donde el Whisper original presenta un rendimiento degradado al enfrentarse a variedades dialectales del inglés africano.

El modelo resuelve un problema concreto de cobertura lingüística: los sistemas ASR generalistas, entrenados mayoritariamente con inglés estadounidense y británico, cometen errores sistemáticos con acentos, vocabulario y fonética del inglés de Nigeria y del pidgin. Unose-Huen-Base reutiliza la arquitectura encoder-decoder de Whisper Base y la especializa mediante fine-tuning supervisado sobre audio de estas variedades.

Es relevante para desarrolladores que necesiten transcripción de bajo coste en CPU, GPU modesta o dispositivos edge en contextos de África Occidental, así como para investigadores que trabajen en adaptación de ASR a dialectos de bajos recursos. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Whisper Base (encoder-decoder transformer) |
| Parámetros totales | 72.593.920 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | Inglés nigeriano (en), pidgin nigeriano (pcm) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper Base: un transformer encoder-decoder con atención completa, preprocesamiento log-Mel de 80 canales y ventana de audio de 30 segundos, que predice tokens de texto condicionados por tokens de tarea e idioma. El modelo original de OpenAI se entrenó con 680.000 horas de audio supervisado multilingüe; el fine-tune de Igunosalabs parte de esos pesos y los adapta a las dos variedades nigerianas.

No se han publicado en la información disponible detalles sobre el volumen de datos de fine-tuning, la composición del corpus (horas de audio, dominio, hablantes), ni sobre el uso de técnicas como RLHF, DPO o especificación de decodificación. La model card únicamente indica que el modelo está pensado para inferencia en CPU, GPU y edge, y remite a una demo alojada en robotics.dexx.systems. Tampoco se documentan innovaciones técnicas adicionales más allá del propio fine-tuning supervisado sobre el checkpoint base.

## Capacidades

- Transcripción de audio a texto en inglés nigeriano y pidgin nigeriano.
- Reconocimiento de habla en ventanas de hasta 30 segundos por pasada, con posibilidad de segmentación externa para audios más largos.
- Inferencia en CPU sin GPU dedicada, gracias a su tamaño reducido (74M parámetros).
- Despliegue en dispositivos edge y entornos con memoria limitada.
- Integración directa con la librería `transformers` mediante el pipeline `automatic-speech-recognition`.
- No se documentan capacidades de traducción, diarización de hablantes, timestamps a nivel de palabra ni tool calling (no aplica a un modelo ASR).

## Casos de uso

- Transcripción de reuniones y entrevistas en inglés nigeriano: el modelo puede procesar audio segmentado en fragmentos de 30 segundos y generar texto plano para actas o resúmenes posteriores, con un coste computacional muy inferior al de modelos ASR grandes.
- Subtitulado de contenido audiovisual local: útil para productoras nigerianas (Nollywood, podcasts, radio) que necesiten subtítulos automáticos en inglés nigeriano o pidgin sin depender de servicios en la nube.
- Atención al cliente en centros de contacto: transcripción en tiempo casi real de llamadas en pidgin nigeriano para alimentar sistemas de análisis de calidad o búsqueda sobre conversaciones.
- Investigación lingüística y sociolingüística: generación de corpus transcritos de habla nigeriana para estudios de variación dialectal, con la ventaja de que el modelo es abierto y reproducible.
- Asistentes de voz embebidos: al caber en CPU, puede integrarse en dispositivos de bajo consumo (Raspberry Pi, móviles de gama baja) para comandos o dictado en contextos con conectividad limitada.
- Accesibilidad: transcripción de audio a texto para personas con discapacidad auditiva en comunidades donde el inglés nigeriano y el pidgin son las lenguas vehiculares predominantes.
- Preprocesamiento de pipelines de datos: conversión masiva de archivos de audio a texto antes de tareas de NLP (clasificación, extracción de entidades) en dominios como salud comunitaria o agricultura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 72,6M de parámetros; en la práctica, el cuello de botella es el buffer de audio y el runtime, no los pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria (GTX 1050, RTX 3050, T4) es suficiente; el modelo también funciona en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU y en CPU.
- Opciones de despliegue: `transformers` (pipeline oficial), `faster-whisper` (si se convierte el checkpoint), `whisper.cpp` (requiere conversión a GGML), ONNX Runtime y TorchScript. No se documenta soporte nativo para vLLM ni TGI, orientados a LLM generativos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto de audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Unose-Huen-Base | 72,6M | en nigeriano, pcm | 30 s | Apache 2.0 | Hugging Face |
| openai/whisper-base | 74M | multilingüe (99 idiomas) | 30 s | MIT | Hugging Face |
| openai/whisper-small | 244M | multilingüe (99 idiomas) | 30 s | MIT | Hugging Face |
| openai/whisper-tiny | 39M | multilingüe (99 idiomas) | 30 s | MIT | Hugging Face |

La comparación directa más relevante es con `openai/whisper-base`, del que deriva: Unose-Huen-Base sacrifica cobertura multilingüe a cambio de especialización en dos variedades nigerianas, presumiblemente con mejor precisión en ellas, aunque no se han publicado métricas que lo cuantifiquen. Frente a `whisper-small` o `whisper-tiny`, la elección depende del equilibrio entre precisión y recursos: el primero ofrece más capacidad a costa de triplicar parámetros; el segundo es más ligero pero con menor calidad general.

## Limitaciones y advertencias

- No se han publicado métricas de error (WER) ni evaluaciones independientes; el rendimiento real en inglés nigeriano y pidgin es desconocido más allá de la afirmación del autor.
- El fine-tune puede haber degradado el rendimiento en otros idiomas o variedades del inglés respecto al Whisper Base original; no debe usarse como ASR multilingüe general.
- Riesgo de alucinación textual: como todo modelo Whisper, puede generar frases plausibles en silencios o audio ruidoso.
- Sesgos potenciales derivados del corpus de fine-tuning no documentado: posible infrarepresentación de acentos regionales, hablantes femeninos o dominios específicos.
- Ventana de audio limitada a 30 segundos por pasada; requiere segmentación externa para audios largos.
- No se documentan limitaciones específicas de contexto, pero al ser un modelo ASR no aplica el concepto de ventana de contexto textual.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, con obligación de conservar el aviso de licencia y de atribución.
- El repositorio ocupa 9,3 GB, muy por encima de lo esperable para 72,6M de parámetros en safetensors; conviene verificar qué artefactos adicionales contiene antes de descargarlo en producción.
- El modelo tiene 0 likes y 192 descargas, lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/igunosalabs/Unose-Huen-Base
- Demo: https://robotics.dexx.systems/unose-demo
- Página del proyecto Unose: https://robotics.dexx.systems/projects/unose
- Modelo base: https://huggingface.co/openai/whisper-base
