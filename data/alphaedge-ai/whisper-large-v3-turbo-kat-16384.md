# alphaedge-ai/whisper-large-v3-turbo-kat-16384

## Resumen

`alphaedge-ai/whisper-large-v3-turbo-kat-16384` es una variante "trimmed" (podada a nivel de vocabulario) de `openai/whisper-large-v3-turbo`, publicada por el usuario alphaedge-ai y optimizada específicamente para **georgiano** (`ka`). El modelo conserva la arquitectura encoder-decoder transformer de Whisper, pero reduce el vocabulario de 51.865 a 16.384 tokens, lo que se traduce en una reducción del 68,41% en el tamaño del vocabulario y del 5,61% en el número total de parámetros (de 808.878.080 a 763.461.120).

La relevancia de esta ficha es doble. Por un lado, demuestra una técnica de compresión práctica: eliminar los tokens del vocabulario que no aparecen en el idioma objetivo reduce el footprint de memoria sin cambiar la arquitectura ni requerir reentrenamiento completo. Por otro, es un caso de estudio de un modelo altamente especializado: el propio autor advierte que el rendimiento en otros idiomas puede degradarse porque se han eliminado tokens que no son frecuentes en georgiano.

El modelo se distribuye en formato safetensors bajo licencia Apache-2.0, es compatible con la librería `transformers` y con endpoints, y está etiquetado con `region:eu`. Es un modelo de nicho (31 descargas, 0 likes en el momento de la consulta), pensado para pipelines de ASR en georgiano donde el ahorro de memoria y el tamaño del despliegue importan más que la cobertura multilingüe.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer) |
| Parametros totales | 763.461.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s, propia de Whisper; no confirmado en la informacion) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | georgiano (`ka`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `openai/whisper-large-v3-turbo`: un transformer encoder-decoder con atención estándar, entrenado originalmente por OpenAI con supervisión débil a gran escala (paper arXiv:2212.04356). Whisper procesa audio remuestreado a 16 kHz y genera transcripciones token a token. La variante "turbo" del modelo base reduce el número de capas del decoder respecto a `large-v3`, lo que explica su menor coste de inferencia.

La innovación de esta versión concreta no está en el entrenamiento sino en la **poda de vocabulario**. Según la model card, se usaron 200.000 textos del dataset `lbourdois/fineweb-2-trimming` para identificar los tokens efectivamente utilizados en georgiano y eliminar el resto. El vocabulario pasa de 51.865 a 16.384 tokens. No se documenta ningún reentrenamiento, ajuste fino ni etapa de RLHF/DPO adicional: el modelo es una versión "quantized" (en el sentido de `base_model_relation: quantized`) del original, con los pesos de las capas de embedding y de salida recortados. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni detalles de la decodificación.

## Capacidades

- Reconocimiento automático de voz (ASR) en georgiano, con pipeline `automatic-speech-recognition`.
- Transcripción de audio remuestreado a 16 kHz, tal como exige Whisper.
- Soporte de `generate_kwargs` para fijar idioma (`georgian`) y tarea (`transcribe`), lo que permite controlar el comportamiento del decoder.
- Integración con `transformers` (`AutoModelForSpeechSeq2Seq`, `AutoProcessor`, `pipeline`).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documentan capacidades de traducción, diarización, timestamps por palabra, tool calling ni agentes; no disponibles en la información proporcionada.

## Casos de uso

- **Transcripción de reuniones y actas en georgiano**: el modelo puede procesar audio de reuniones y generar texto plano para actas automáticas; su menor footprint frente al original facilita desplegarlo en servidores modestos.
- **Subtitulado de vídeo en georgiano**: integrado en un pipeline que extrae audio, lo remuestrea a 16 kHz y llama al modelo, se pueden generar subtítulos para contenido audiovisual local sin depender de APIs externas.
- **Atención al cliente por voz en georgiano**: transcripción de llamadas para análisis de calidad y búsqueda posterior, usando el modelo como primer paso de un pipeline ASR + NLP.
- **Archivo y digitalización de contenido oral**: transcripción de entrevistas, podcasts o grabaciones históricas en georgiano para hacerlas indexables y buscables.
- **Despliegue en entornos con recursos limitados**: al reducir el vocabulario un 68,41% y los parámetros un 5,61%, el modelo es adecuado para servir ASR en georgiano en GPUs de gama media o incluso en CPU con cuantización adicional (no incluida en el repo).
- **Prototipado rápido de aplicaciones de voz**: gracias a la API estándar de `transformers`, se puede integrar en notebooks y demos con pocas líneas de código, como muestra el ejemplo de la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma explícita. Con 763 M parámetros en fp32, los pesos ocupan aproximadamente 3,05 GB; en fp16, unos 1,53 GB. El repo ocupa 1,5 GB, lo que sugiere pesos en fp16 o bf16.
- **GPU recomendadas**: no disponibles en la información proporcionada. Por tamaño, cabría esperar que funcione en GPUs consumer con al menos 4-6 GB de VRAM libre, pero no se confirma.
- **¿Cabe en GPU consumer?**: previsiblemente sí en tarjetas con 6 GB o más, aunque no se documenta.
- **Opciones de despliegue**: `transformers` (confirmado en la model card), endpoints compatibles (tag). No se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Vocabulario | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| `alphaedge-ai/whisper-large-v3-turbo-kat-16384` | 763.461.120 | 16.384 | georgiano | apache-2.0 | safetensors |
| `openai/whisper-large-v3-turbo` (base) | 808.878.080 | 51.865 | multilingüe | apache-2.0 | safetensors |
| `openai/whisper-large-v3` | no disponible en la informacion | no disponible | multilingüe | apache-2.0 | safetensors |

La comparación directa con `whisper-large-v3` no puede completarse porque la información proporcionada no incluye sus parámetros ni su vocabulario. Frente a su modelo base, la variante podada reduce parámetros un 5,61% y vocabulario un 68,41%, a costa de perder cobertura multilingüe.

## Limitaciones y advertencias

- **Especialización extrema**: el autor advierte explícitamente que el modelo "may not perform well for other languages" porque se han eliminado tokens no frecuentes en georgiano. No debe usarse como ASR multilingüe.
- **Riesgo de alucinación**: inherente a los modelos Whisper, especialmente en audio con ruido, silencios largos o habla no nativa; no se documenta mitigación específica.
- **Sesgos**: no documentados en la información disponible; al derivar de Whisper, hereda los sesgos del corpus de entrenamiento original.
- **Licencia**: Apache-2.0 permite uso comercial, pero conviene verificar las obligaciones de atribución y las condiciones del modelo base.
- **Cuantización**: el repo solo publica safetensors; no hay versiones GGUF ni cuantizadas listas para usar, lo que limita el despliegue en CPU sin trabajo adicional.
- **Madurez**: con 31 descargas y 0 likes, es un modelo de nicho sin validación comunitaria amplia; no se han publicado benchmarks.
- **Contexto de audio**: no se confirma en la información la ventana máxima de audio (Whisper usa 30 s por defecto), lo que afecta a la transcripción de audios largos sin segmentación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/whisper-large-v3-turbo-kat-16384
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Dataset de minería: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Paper de Whisper: https://arxiv.org/abs/2212.04356
