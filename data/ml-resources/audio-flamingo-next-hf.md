# ml-resources/audio-flamingo-next-hf

## Resumen

Audio Flamingo Next (AF-Next) es un modelo abierto de audio-lenguaje desarrollado por NVIDIA en colaboración con la Universidad de Maryland, sucesor de la serie Audio Flamingo. Resuelve la comprensión unificada de habla, sonido ambiental y música en un único modelo capaz de responder preguntas, transcribir, traducir y describir audio de forma conversacional. Su relevancia radica en que escala el entrenamiento más allá de los benchmarks académicos con datos de fuentes públicas e internet-scale, y añade soporte nativo de audio largo de hasta 30 minutos.

El checkpoint publicado (`ml-resources/audio-flamingo-next-hf`) corresponde a la variante **AF-Next-Instruct**, la versión post-entrenada orientada a asistente: preguntas y respuestas sobre audio, seguimiento de instrucciones, chat multi-turno y prompts con marcas temporales. Cuenta con 8.267 millones de parámetros en formato safetensors (repo de 16,5 GB) y está integrado en Transformers como pipeline `audio-text-to-text`.

Entre las novedades frente a Audio Flamingo 3 destacan el modelado sensible a timestamps mediante Rotary Time Embeddings (RoTE), ASR multilingüe reforzado, comprensión de habla con múltiples hablantes y captioning de formato largo. La licencia es `other` y el propio autor restringe el uso a investigación no comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio-language model (LLM con encoder de audio; detalles internos no disponibles) |
| Parametros totales | 8.267.215.360 (~8,27 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | Audio de hasta 1800 s (30 min); procesado interno en ventanas de 30 s |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés); ASR/AST multilingüe mencionado, pero el tag de idioma oficial es solo `en` |
| Licencia | other (uso exclusivo para investigación no comercial) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

AF-Next es un modelo de audio-lenguaje que combina un encoder de audio con un modelo de lenguaje para producir respuestas textuales a partir de entradas de audio y texto. La model card no detalla la arquitectura interna (tipo de encoder, backbone del LLM, número de capas), por lo que esa información no está disponible. La innovación técnica destacada son las **Rotary Time Embeddings (RoTE)**, que aportan modelado sensible a marcas temporales y permiten grounding temporal en las respuestas. El audio se procesa internamente en ventanas de 30 segundos y el procesador publicado acepta hasta 1800 segundos.

El entrenamiento se apoya en cuatro datasets publicados por NVIDIA: `LongAudio` (audio de formato largo), `AF-Skills` (habilidades específicas de audio), `AF-Chat` (conversación) y `AF-Think` (razonamiento). El autor indica que los datos se escalaron más allá de los benchmarks académicos usando fuentes públicas e internet-scale. No se especifica el número de tokens de entrenamiento ni la composición exacta del dataset, ni si se emplearon RLHF o DPO; esos datos no están disponibles en la información proporcionada.

## Capacidades

- Comprensión general de audio: habla, sonidos ambientales y música en un único modelo.
- Preguntas y respuestas (audio QA) e instrucciones directas sobre audio.
- ASR (reconocimiento automático del habla) y AST (traducción de habla) con soporte multilingüe mencionado.
- Comprensión de habla con múltiples hablantes y etiquetado de hablantes.
- Captioning de audio corto y de formato largo, incluida descripción de música.
- Grounding temporal con timestamps (Rotary Time Embeddings).
- Chat multi-turno sobre audio, con preguntas de seguimiento.
- Soporte de audio largo nativo de hasta 30 minutos.
- Variante separada `Think` para razonamiento multi-paso explícito y evidencias ancladas a timestamps (no incluida en este checkpoint).
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de visión o audio generativo (TTS): no forman parte de este checkpoint.

## Casos de uso

- **Transcripción de reuniones y entrevistas**: con ASR y comprensión de múltiples hablantes, el modelo puede transcribir y etiquetar intervenciones en grabaciones de hasta 30 minutos, útil para actas automatizadas.
- **Traducción de habla en directo (AST)**: prompts del tipo "Translate any speech you hear from <src_lang> into <tgt_lang>" permiten traducir contenido hablado, adecuado para localización de contenido audiovisual.
- **Accesibilidad y subtitulado**: captioning de formato largo con transcripción precisa de todo el contenido hablado sirve para generar subtítulos descriptivos de vídeos y podcasts.
- **Análisis de contenido musical**: descripción y captioning de música para catalogación, recomendación o generación de metadatos en plataformas de streaming.
- **Monitorización de sonido ambiental**: QA sobre grabaciones de sensores acústicos (por ejemplo, identificación de eventos sonoros) en entornos industriales o urbanos.
- **Asistentes conversacionales sobre audio**: chat multi-turno donde el usuario pregunta sobre un archivo de audio y repregunta, aprovechando la ventana de 30 minutos para mantener contexto.
- **Auditoría con evidencias temporales**: uso de prompts con timestamps para localizar momentos concretos (por ejemplo, cuándo se dijo algo) en grabaciones largas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con ~8,27 mil millones de parámetros en safetensors (16,5 GB), la inferencia en precisión completa requiere del orden de 16-20 GB de VRAM solo para pesos; con cuantización a 8 bits o 4 bits bajaría aproximadamente a 8-10 GB y 5-6 GB respectivamente (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, encajan GPU de gama alta tipo A100, H100 o RTX 4090.
- ¿Cabe en GPU consumer? Previsiblemente sí en GPUs con 16-24 GB de VRAM en cuantización, aunque no hay confirmación oficial.
- Opciones de despliegue: Transformers (`pip install --upgrade transformers accelerate`) es la vía soportada oficialmente. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | Licencia | Disponibilidad |
|---|---|---|---|---|
| Audio Flamingo Next (Instruct) | ~8,27 B | 30 min | other (solo investigación no comercial) | Hugging Face (ml-resources), Transformers |
| Audio Flamingo 3 | no disponible | no disponible | no disponible | no disponible en la información proporcionada |
| AF-Next Think | no disponible | 30 min (según variante) | other | Hugging Face (nvidia) |
| AF-Next Captioner | no disponible | 30 min (según variante) | other | Hugging Face (nvidia) |

No se dispone de datos de benchmarks ni de especificaciones de modelos competidores externos en la información proporcionada, por lo que la comparación cuantitativa con alternativas de la misma categoría no está disponible.

## Limitaciones y advertencias

- **Licencia restrictiva**: el modelo es solo para investigación no comercial; no se permite uso comercial sin autorización.
- **Idioma**: el tag oficial de idioma es únicamente `en`; el soporte multilingüe de ASR/AST se menciona pero no está garantizado como idioma principal.
- **Sesgos**: no se documentan sesgos específicos en la información disponible; al entrenarse con datos internet-scale, es probable que herede sesgos de esas fuentes.
- **Alucinación**: no se cuantifica el riesgo de alucinación; en tareas de transcripción y timestamps conviene validar las salidas.
- **Prompting sensible**: el autor advierte que el checkpoint funciona mejor con tareas y formatos de salida explícitos; prompts genéricos degradan la calidad.
- **Formato de audio**: el procesador espera audio mono a 16 kHz; entradas con otras características pueden requerir preprocesado.
- **Componentes ausentes**: TTS en streaming y interacción voz-a-voz se mencionan en el proyecto AF-Next pero no forman parte de este checkpoint.
- **Datos de rendimiento**: no hay benchmarks publicados ni latencias confirmadas, lo que dificulta la planificación de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ml-resources/audio-flamingo-next-hf
- Checkpoint oficial NVIDIA: https://huggingface.co/nvidia/audio-flamingo-next-hf
- Página del proyecto: https://afnext-umd-nvidia.github.io/
- Paper (arXiv): https://arxiv.org/abs/2604.10905
- Repositorio GitHub: https://github.com/NVIDIA/audio-flamingo
- Dataset LongAudio: https://huggingface.co/datasets/nvidia/LongAudio
- Dataset AF-Skills: https://huggingface.co/datasets/nvidia/AF-Skills
- Dataset AF-Chat: https://huggingface.co/datasets/nvidia/AF-Chat
- Dataset AF-Think: https://huggingface.co/datasets/nvidia/AF-Think
- Demo Gradio: https://huggingface.co/spaces/nvidia/audio-flamingo-next
