# L1ght/Qwen3.5-4B-TLive

## Resumen

Qwen3.5-4B-TLive es un conjunto de tres modelos derivados de Qwen/Qwen3.5-4B-Base mediante fine-tuning supervisado (SFT) especializado en el dominio de la transmisión en vivo (livestreaming). Desarrollado por el usuario L1ght, el modelo está diseñado para tareas como generar respuestas de un streamer a partir de su perfil y los mensajes del chat (danmaku), resumir transcripciones de directos y reconocer respuestas apropiadas en contexto. Se publica bajo licencia Apache-2.0 y se distribuye en un único repositorio con tres subcarpetas que corresponden a distintas cantidades de datos de entrenamiento: 10 000, 30 000 y 80 000 muestras.

La relevancia de este modelo radica en que ofrece una especialización práctica sobre una base multimodal de 4 000 millones de parámetros, con un coste de inferencia moderado y una ventana de contexto nativa de 262 144 tokens en el modelo base, aunque el fine-tuning se realizó con secuencias de 2 048 tokens. Al estar basado en Qwen3.5-4B, hereda capacidades de procesamiento de texto, imagen y vídeo, así como un modo de razonamiento híbrido (thinking/no-thinking), aunque el SFT se aplicó únicamente sobre texto. Esto lo convierte en una opción interesante para desarrolladores que necesitan un asistente conversacional especializado en el ecosistema de streaming sin renunciar a la flexibilidad de un modelo abierto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.5-4B-Base) |
| Parametros totales | 4 000 millones (4B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (base); 2 048 tokens en el fine-tuning |
| Tipos de cuantizacion | No disponible (pesos publicados en bfloat16) |
| Idiomas soportados | No disponible (la base soporta múltiples idiomas, el fine-tuning no especifica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base, un transformer denso de 4 000 millones de parámetros con capacidades multimodales nativas (texto, imagen y vídeo) y una ventana de contexto de 262 144 tokens. El fine-tuning se realizó mediante SFT sobre un conjunto de datos llamado `LiveTrain-SFT-mix-v0.2.0-80k`, compuesto por un 50 % de tareas de generación libre (dado un perfil de streamer y mensajes del chat, generar la respuesta del streamer; o dado un prefijo de transcripción, continuar el texto) y un 50 % de tareas de selección (reconocer la respuesta correcta entre varias opciones o elegir la continuación adecuada, respondiendo con una letra). El entrenamiento se ejecutó durante una sola época, con una longitud máxima de secuencia de 2 048 tokens, una tasa de aprendizaje de 1e-5 con programación coseno y warmup del 6 %, un tamaño de lote efectivo de 16 y precisión bfloat16. No se menciona el uso de RLHF ni DPO; el ajuste es exclusivamente supervisado. Las capacidades multimodales del modelo base no fueron entrenadas durante el SFT, por lo que se conservan tal cual.

## Capacidades

- Generación de texto especializada en el dominio de livestreaming: respuestas de streamer, resúmenes de conversaciones y continuación de transcripciones.
- Tareas de selección y reconocimiento de respuestas apropiadas en contexto de chat en vivo.
- Capacidades multimodales heredadas del modelo base (procesamiento de imagen y vídeo) sin ajuste adicional.
- Modo de razonamiento híbrido (thinking/no-thinking) disponible en la base, aunque no se documenta su comportamiento tras el fine-tuning.
- Soporte de chat multi-turno mediante la plantilla de chat de Qwen (aplicable con `apply_chat_template`).
- Compatible con la librería `transformers` y con `vLLM` para inferencia en producción.

## Casos de uso

- Atención al cliente automatizada en plataformas de streaming: el modelo puede gestionar conversaciones con espectadores, responder preguntas frecuentes sobre horarios, contenido o suscripciones, y derivar consultas complejas a un humano. Su entrenamiento en respuestas de streamer lo hace adecuado para mantener un tono cercano y contextual.
- Generación de respuestas automáticas para streamers: integrado en herramientas de chat en vivo, puede sugerir respuestas a los mensajes del público basándose en el perfil del creador y el historial de la conversación, reduciendo la carga de moderación manual.
- Resumen de transcripciones de directos: dado un registro de chat o una transcripción de audio, el modelo puede generar un resumen ejecutivo de los temas tratados, útil para creadores que quieran documentar sus sesiones o para plataformas que necesiten metadatos.
- Moderación de contenido en salas de chat: mediante las tareas de selección, puede clasificar respuestas como apropiadas o inapropiadas, ayudando a filtrar mensajes ofensivos o spam en tiempo real.
- Asistente de creación de contenido: a partir de un perfil de streamer y una audiencia objetivo, el modelo puede sugerir temas de conversación, preguntas para la audiencia o formatos de interacción, apoyando la planificación de directos.
- Análisis de interacción con la audiencia: procesando grandes volúmenes de mensajes del chat, el modelo puede identificar patrones de participación, temas recurrentes y sentimiento general, proporcionando métricas cualitativas a los equipos de marketing.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para el fine-tuning Qwen3.5-4B-TLive en la información disponible. Los datos de rendimiento que se citan a continuación corresponden al modelo base Qwen3.5-4B, no a esta variante ajustada:

| Benchmark | Resultado (base Qwen3.5-4B) |
|---|---|
| MMMU-Pro (razonamiento multimodal) | ~65 % |
| MMLU-Pro | Se acerca al nivel de Qwen3-30B (generación anterior) |
| Comparativa con GPT-5-Nano | Supera en benchmarks de visión |

Estos valores deben interpretarse como referencia de la capacidad subyacente, no como garantía del comportamiento del fine-tuning en tareas de livestreaming.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8 GB en bfloat16 (según datos del modelo base); en cuantización de 4 bits, alrededor de 3 GB.
- GPU recomendadas: tarjetas consumer como RTX 3090, RTX 4090 o superiores; también compatible con GPUs de datacenter como A100 o H100 para despliegues concurrentes.
- El modelo cabe en GPUs consumer de gama alta; para las tres variantes completas (10k, 30k, 80k) se necesitaría almacenamiento adicional (el repositorio ocupa 27.3 GB en total).
- Opciones de despliegue: `transformers` con `device_map="auto"`, `vLLM` (descargando primero la subcarpeta deseada), y potencialmente `llama.cpp`/`Ollama` si se convierten los pesos a GGUF (no incluido en el repositorio).
- Latencia y throughput: no disponibles; dependerán del hardware y de la longitud de secuencia (el fine-tuning usa 2 048 tokens, lo que permite respuestas rápidas en GPUs modernas).

## Comparativa con modelos similares

No se dispone de información sobre otros fine-tunes específicos para livestreaming basados en Qwen3.5-4B. Como referencia, se compara con el modelo base y con alternativas de tamaño similar:

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| Qwen3.5-4B-TLive (este) | 4B | 262K (base) / 2K (fine-tune) | Apache-2.0 | Livestreaming (SFT) |
| Qwen3.5-4B-Base | 4B | 262K | Apache-2.0 | General, multimodal |
| Llama-3.2-3B | 3B | 128K | Llama 3.2 | General, texto |
| Qwen3-4B (generación anterior) | 4B | 32K (ampliable) | Apache-2.0 | General, texto |

La ventaja de TLive frente a la base es su adaptación al dominio de streaming, mientras que frente a modelos generales de tamaño similar ofrece una especialización que reduce la necesidad de prompt engineering en tareas concretas de chat en vivo.

## Limitaciones y advertencias

- El fine-tuning se realizó únicamente sobre texto; las capacidades multimodales (imagen, vídeo) no han sido ajustadas y pueden comportarse de forma impredecible en contextos de streaming con entradas visuales.
- La ventana de contexto efectiva durante el entrenamiento fue de 2 048 tokens, muy inferior a los 262 144 tokens de la base; para conversaciones largas puede ser necesario truncar o resumir el historial.
- Los datos de entrenamiento provienen de un conjunto llamado `LiveTrain-SFT-mix-v0.2.0-80k`, del que no se detalla la composición lingüística ni cultural; es probable que esté sesgado hacia el ecosistema de streaming chino, lo que puede afectar a la adecuación en otros mercados.
- Al ser un SFT de una sola época, el modelo puede presentar alucinaciones en tareas generales fuera del dominio de streaming.
- No se documentan pruebas de robustez frente a entradas adversariales (por ejemplo, mensajes malintencionados en el chat).
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo en producción; se recomienda validar con datos propios antes de desplegar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/L1ght/Qwen3.5-4B-TLive
- Modelo base Qwen3.5-4B-Base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Colección oficial Qwen3.5: https://huggingface.co/collections/Qwen/qwen35
- Repositorio GitHub de Qwen3.5: https://github.com/tokwalabs/Qwen3.5
- Página del modelo en LM Studio: https://lmstudio.ai/models/qwen/qwen3.5-4b
- Ficha en Awesome Agents: https://awesomeagents.ai/models/qwen-3-5-4b/
- Ficha en LLM Releases: https://www.llm-releases.com/models/qwen3-5-4b
