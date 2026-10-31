# LiquidAI/LFM3-Audio-2B-MLX-8bit

## Resumen

LFM3-Audio-2B-MLX-8bit es la versión cuantizada a 8 bits en formato MLX del modelo de audio LFM3-Audio-2B de Liquid AI, optimizada para ejecutarse de forma nativa en ordenadores Apple Silicon (chips M1 a M4). El modelo base pertenece a la familia LFM3 (Liquid Foundation Models), una arquitectura propia de Liquid AI que combina capas convolucionales gating lineales con mecanismos de atención, y este modelo concreto es multimodal any-to-any: acepta texto y audio como entrada y genera texto y audio de salida, cubriendo tareas como reconocimiento de voz (ASR), síntesis de voz (TTS) y conversación voz-a-voz.

El problema que resuelve es doble. Por un lado, unifica en un solo modelo compacto (menos de 2.000 millones de parámetros) tareas que tradicionalmente requieren pipelines separados de ASR, TTS y diálogo hablado. Por otro, la versión MLX-8bit lo hace accesible en hardware de consumo Apple sin servidor dedicado, con pesos que ocupan 2,33 GB más 0,15 GB para el códec de audio. Según la propia model card, la cuantización a 8 bits es el punto de equilibrio recomendado entre tamaño y precisión.

Es relevante ahora porque los modelos de voz de extremo a extremo (speech-to-speech) están en plena expansión, y Liquid AI ofrece una opción abierta, multilingüe (19 idiomas, incluido el castellano) y ejecutable en local, algo poco habitual en esta categoría dominada por APIs propietarias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 (Liquid Foundation Models), multimodal any-to-any con encoder de audio, proyector, backbone de lenguaje y decodificador de audio (depth decoder) |
| Parametros totales | 1.977.548.032 (≈2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits afín (grupos de 64) en el backbone de lenguaje; encoder de audio, proyector, depth decoder y codebook embedding en BF16 |
| Idiomas soportados | en, ar, da, de, el, fi, fr, he, it, ja, ko, nl, pl, pt, es, sv, tr, zh (19 idiomas) |
| Licencia | LFM1.0 (other, licencia propia de Liquid AI) |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

La ficha de este repositorio cuantizado no detalla la arquitectura interna completa, pero por la model card se desprende la composición del modelo: un backbone de lenguaje LFM3 cuantizado a 8 bits con cuantización afín en grupos de 64, un encoder de audio, un proyector audio-lenguaje, un depth decoder para la generación de tokens de audio y un codebook embedding, todos estos últimos mantenidos en BF16 para preservar la fidelidad del audio. Además incluye un códec de audio (audio tokenizer) independiente, con 0,15 GB de pesos, que se mantiene en su versión original sin cuantizar.

La familia LFM3 de Liquid AI se caracteriza por arquitecturas híbridas que combinan operadores convolucionales gating lineales con atención, orientadas a eficiencia en inferencia. Los detalles del preentrenamiento (número de tokens, composición del corpus, uso de RLHF o DPO) no están disponibles en la información proporcionada; remiten a la model card del modelo base LFM3-Audio-2B.

## Capacidades

- Reconocimiento de voz (ASR): transcribe audio de entrada a texto, configurable por idioma mediante el system prompt.
- Síntesis de voz (TTS): genera audio hablado a partir de texto, con control de idioma, acento (por ejemplo, inglés americano) y voz (masculina o femenina) vía system prompt.
- Conversación voz-a-voz (speech-to-speech): acepta audio de entrada y responde con audio, habilitando chat hablado directo.
- Salida intercalada de texto y audio: puede responder combinando ambas modalidades en una misma generación ("Respond with interleaved text and audio").
- Soporte multilingüe en 19 idiomas, incluido castellano, para las tareas de voz.
- Pipeline any-to-any según la taxonomía de HuggingFace.
- No hay información disponible sobre tool calling, capacidades de agente, visión ni razonamiento estructurado.

## Casos de uso

- Transcripción de notas de voz en aplicaciones iOS y macOS: al ser un modelo MLX nativo de Apple Silicon, puede integrarse en apps locales para transcribir audios de WhatsApp, reuniones o dictados sin enviar datos a la nube, ejecutándose con unos 2,5 GB de memoria.
- Voice bots y asistentes hablados en local: gracias a la capacidad speech-to-speech, puede alimentar un asistente de voz completo (escucha, comprende y responde hablando) en un Mac, útil para prototipos de agentes de voz sin coste de API.
- Doblaje y locución automática de contenidos: el modo TTS con selección de voz e idioma permite generar narraciones para vídeos, podcasts o e-learning en castellano y otros 18 idiomas.
- Accesibilidad: lectores de pantalla mejorados o herramientas de descripción hablada para usuarios con dificultades visuales, generando voz natural en local con baja latencia.
- Análisis multilingüe de llamadas: transcripción automática de grabaciones de atención al cliente en varios idiomas europeos y asiáticos (francés, alemán, japonés, chino) sin infraestructura de servidor.
- Prototipado de interfaces conversacionales multimodales: el pipeline any-to-any con salida intercalada de texto y audio permite experimentar con agentes que muestran la transcripción mientras hablan, útil en investigación de interacción humano-máquina.
- Desarrollo on-device con privacidad garantizada: cualquier caso donde el audio (datos potencialmente sensibles) no deba salir del dispositivo, como consultas médicas o notas legales dictadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica únicamente que la cuantización a 8 bits es "el punto de equilibrio recomendado entre tamaño y precisión", sin aportar métricas comparativas frente al modelo en BF16 o frente a otros modelos de voz.

## Requisitos de hardware

- Memoria unificada necesaria: aproximadamente 2,5 GB en total (2,33 GB de pesos del modelo cuantizado + 0,15 GB del códec de audio), más la memoria de contexto de KV en ejecución.
- Hardware objetivo: Apple Silicon (chips M1, M2, M3 o M4). Con ~2,5 GB de pesos, debería funcionar en cualquier Mac con 8 GB de RAM o más, incluidos MacBook Air y Mac mini base.
- No requiere GPU NVIDIA: al ser formato MLX, no es directamente desplegable en entornos CUDA (para eso existe el modelo base LFM3-Audio-2B).
- Despliegue: mediante MLX-VLM (`mlx-vlm`), con soporte en desarrollo según la model card; los ejemplos usan `python -m mlx_vlm.generate`. También hay documentación oficial de despliegue on-device con MLX en docs.liquid.ai.
- Parámetros de generación de audio recomendados (por defecto en `generation_config.json`): `audio_temperature=1.0`, `audio_top_k=128`, `audio_repetition_penalty=1.1`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidades | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| LFM3-Audio-2B-MLX-8bit (este) | ≈2B | texto/audio → texto/audio | 8-bit MLX | LFM1.0 (other) | Apple Silicon (MLX) |
| LFM3-Audio-2B (base) | ≈2B | texto/audio → texto/audio | BF16 | LFM1.0 (other) | Multiplataforma |
| Whisper (OpenAI) | 0,07B–1,5B | audio → texto | variada | MIT | Multiplataforma |
| Moshi (Kyutai) | ≈7B | audio/texto → audio/texto | variada | CC-BY / MIT (parcial) | Multiplataforma |

Comparación cualitativa: frente a Whisper, LFM3-Audio añade TTS y diálogo hablado bidireccional, no solo transcripción. Frente a Moshi, es notablemente más pequeño (2B frente a ~7B) y ofrece una variante MLX oficial para Mac, aunque la información de benchmarks comparativos no está disponible. Los detalles completos de las alternativas pueden variar según la versión.

## Limitaciones y advertencias

- Soporte en MLX-VLM aún en desarrollo: la model card indica que el soporte estará disponible en una futura release, por lo que la integración puede requerir instalar desde la rama de desarrollo o esperar actualizaciones.
- Exclusividad de plataforma: el formato MLX solo funciona en Apple Silicon; para Linux, Windows o GPU NVIDIA hay que usar el modelo base en BF16.
- Cuantización a 8 bits: aunque es la configuración recomendada, puede introducir una ligera degradación de precisión frente al modelo BF16, especialmente en la generación de audio; no se publican métricas de esa degradación.
- Restricciones de licencia: la licencia LFM1.0 es una licencia propia ("other"), no una licencia estándar abierta como Apache 2.0 o MIT; conviene revisar las condiciones de uso comercial en el archivo LICENSE antes de desplegar en producción.
- Datos de contexto, benchmarks y composición del entrenamiento no disponibles en esta ficha, lo que dificulta evaluar a priori el rendimiento en tareas concretas.
- Riesgo de alucinación en transcripción (ASR) y posible prosodia artificial en TTS: no documentados específicamente, pero habituales en modelos de voz generativos de este tamaño.
- Sesgos: no documentados en la información disponible; como todo modelo de voz, puede mostrar rendimiento desigual entre acentos, registros y hablantes de los 19 idiomas soportados.

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/LiquidAI/LFM3-Audio-2B-MLX-8bit
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Audio-2B
- MLX-VLM (repositorio GitHub): https://github.com/Blaizzy/mlx-vlm
- Guía de despliegue MLX de Liquid AI: https://docs.liquid.ai/deployment/on-device/mlx
- Documentación general LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Blog de lanzamiento LFM3: https://www.liquid.ai/blog/lfm3
- Playground de Liquid AI: https://playground.liquid.ai/
- Consola API de Liquid AI: https://console.liquid.ai/dashboard
