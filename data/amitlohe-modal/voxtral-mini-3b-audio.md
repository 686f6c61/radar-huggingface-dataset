# amitlohe-modal/voxtral-mini-3b-audio

## Resumen

Voxtral Mini 3B es un modelo multimodal de audio y texto desarrollado por Mistral AI, construido sobre el backbone lingüístico de Ministral 3B. Incorpora capacidades de entrada de audio de última generación manteniendo el rendimiento de texto de su modelo base, y está orientado a transcripción de voz, traducción y comprensión de audio. El repositorio analizado es un fork de servicio (audio-serving fork) de `mistralai/Voxtral-Mini-3B-2507`, publicado por el usuario `amitlohe-modal`, con pesos y configuración sin cambios respecto al original.

El modelo resuelve el problema de tener que encadenar un sistema ASR (reconocimiento automático del habla) con un LLM separado para tareas de comprensión de audio: Voxtral integra ambas fases en un único modelo que acepta audio directamente, permite hacer preguntas sobre él y generar resúmenes estructurados. Con 32k tokens de contexto, puede procesar audios de hasta 30 minutos en modo transcripción y 40 minutos en modo comprensión.

Es relevante ahora porque combina un tamaño contenido (~4.700 millones de parámetros en safetensors, aproximadamente 9,5 GB en bf16/fp16) con licencia Apache 2.0, soporte nativo en vLLM y capacidades multilingües en ocho idiomas, lo que lo hace desplegable en infraestructura modesta para pipelines de voz en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (backbone Ministral 3B + encoder de audio); detalles internos no disponibles |
| Parametros totales | 4.676.271.104 (~4,7 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32k tokens |
| Tipos de cuantizacion | No disponible (la model card solo menciona bf16/fp16 para servicio) |
| Idiomas soportados | en, fr, de, es, it, pt, nl, hi |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `mistral-common`, formatos `mistral` para carga en vLLM) |

## Arquitectura y entrenamiento

Voxtral Mini se presenta como una mejora de Ministral 3B que añade capacidades de entrada de audio, conservando el rendimiento de texto del modelo base. La model card no detalla la arquitectura interna del encoder de audio ni la composición exacta del dataset de entrenamiento, el número de tokens utilizados ni si hubo fases de RLHF o DPO. La información pública disponible se limita a la descripción funcional: un modelo que acepta audio y texto en el mismo contexto y que puede operar en modo transcripción dedicado o en modo comprensión/chat.

Como innovaciones destacables, la model card menciona un modo de transcripción puro que maximiza la calidad ASR, detección automática del idioma de origen del audio, soporte de múltiples audios por mensaje y múltiples turnos con audio, y function calling directo desde voz. No se documentan técnicas como decodificación especulativa o atención lineal en la información proporcionada. El paper asociado (arXiv:2507.13264) es la referencia técnica para profundizar en el entrenamiento.

## Capacidades

- Transcripción de voz (ASR) en modo dedicado, con detección automática del idioma de origen.
- Traducción de audio a texto entre los ocho idiomas soportados.
- Comprensión de audio: preguntas y respuestas directamente sobre el contenido del audio.
- Resumen estructurado de audio sin necesidad de un ASR y un LLM separados.
- Function calling / tool calling a partir de intenciones habladas, para disparar APIs o flujos de backend.
- Procesamiento de audio de formato largo: hasta 30 minutos en transcripción y 40 minutos en comprensión con 32k tokens de contexto.
- Soporte de múltiples audios por mensaje y múltiples turnos de usuario con audio.
- Capacidades de texto heredadas de Ministral 3B (comprensión y generación de texto).
- Multilingüe nativo en en, fr, de, es, it, pt, nl, hi.
- No se documentan capacidades de visión ni de salida de audio en la información disponible.

## Casos de uso

- Transcripción de reuniones y actas: el modelo puede transcribir audio de hasta 30 minutos en una sola pasada gracias a su contexto de 32k tokens, detectando el idioma automáticamente y evitando el pipeline ASR + LLM separado.
- Generación de resúmenes de llamadas de atención al cliente: se envía el audio de la llamada y se pide un resumen estructurado (motivo, resolución, acciones pendientes) en una sola inferencia, lo que simplifica la arquitectura frente a soluciones de dos etapas.
- Subtitulado y traducción de contenido multimedia: transcripción con detección de idioma y traducción a otro de los ocho idiomas soportados, útil para localización de vídeos y pódcasts.
- Asistentes de voz con acciones: el function calling desde voz permite mapear intenciones habladas a llamadas de API (por ejemplo, agendar una cita o consultar un pedido) sin un componente NLU intermedio.
- Análisis de entrevistas y research cualitativo: preguntas directas sobre el audio ("¿qué objeciones menciona el entrevistado?") y extracción de citas, aprovechando el modo de comprensión de hasta 40 minutos.
- Moderación y compliance de audio: análisis de grabaciones para detectar contenido sensible o verificar guiones, con despliegue en vLLM sobre una sola GPU de ~10 GB en bf16.
- Accesibilidad: transcripción automática de audio a texto para personas con discapacidad auditiva, con soporte multilingüe en una única instancia.

## Benchmarks y rendimiento

La model card incluye gráficas de resultados (WER medio sobre FLEURS, Mozilla Common Voice y Multilingual LibriSpeech para audio, y comparativas de texto), pero los valores numéricos no están disponibles en el texto extraído. No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~9,5 GB de memoria de GPU en bf16 o fp16, según la model card.
- GPU recomendadas: no se especifican modelos concretos; por el tamaño en bf16, encaja en GPUs con al menos 16 GB (RTX 4090, A10, L4) y en A100/H100 para mayor throughput.
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más en bf16; en cuantizaciones menores no se documentan requisitos.
- Opciones de despliegue: vLLM (recomendado, >= 0.10.0 con `vllm[audio]` y `mistral_common >= 1.8.1`) y Transformers. No se mencionan llama.cpp, Ollama ni TGI en la información disponible.
- Parámetros de muestreo recomendados: `temperature=0.2` y `top_p=0.95` para chat/comprensión de audio; `temperature=0.0` para transcripción.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Voxtral Mini 3B (este fork) | ~4,7 B | 32k tokens | Audio + texto | Apache 2.0 | HuggingFace, vLLM, Transformers |
| mistralai/Voxtral-Mini-3B-2507 (original) | ~4,7 B | 32k tokens | Audio + texto | Apache 2.0 | HuggingFace |
| Ministral 3B (backbone) | ~3 B | No disponible | Solo texto | No disponible en la información | HuggingFace |

No se dispone de datos de benchmarks numéricos para comparar el rendimiento frente a alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Los prompts de sistema no están soportados todavía según la model card.
- El repositorio es un fork de servicio: los pesos son idénticos al modelo original de Mistral AI, pero el mantenimiento y las garantías dependen de un tercero (`amitlohe-modal`), con 93 descargas y 0 likes en el momento de la consulta.
- La model card original incluye un aviso de gated content y remite a la política de privacidad de Mistral; conviene revisar las condiciones del modelo original antes de usarlo en producción.
- Riesgo de alucinación inherente a los LLM, especialmente en comprensión de audio con preguntas abiertas; para transcripción se recomienda `temperature=0.0`.
- No se documentan sesgos conocidos ni evaluaciones de robustez en la información disponible.
- El soporte idiomático se limita a los ocho idiomas listados; no se garantiza calidad fuera de ellos.
- Aunque la licencia es Apache 2.0, el uso comercial debe verificar las condiciones del modelo original y del fork.
- No se documentan cuantizaciones oficiales (GGUF, AWQ, GPTQ), lo que limita el despliegue en GPUs con menos de 16 GB.

## Enlaces

- Repositorio del fork: https://huggingface.co/amitlohe-modal/voxtral-mini-3b-audio
- Modelo original: https://huggingface.co/mistralai/Voxtral-Mini-3B-2507
- Blog de Mistral AI sobre Voxtral: https://mistral.ai/news/voxtral
- Paper: https://arxiv.org/abs/2507.13264
- Blog de Ministral: https://mistral.ai/news/ministraux
- vLLM: https://github.com/vllm-project/vllm
- mistral-common: https://github.com/mistralai/mistral-common
- Transformers: https://github.com/huggingface/transformers
- Política de privacidad de Mistral: https://mistral.ai/terms/
