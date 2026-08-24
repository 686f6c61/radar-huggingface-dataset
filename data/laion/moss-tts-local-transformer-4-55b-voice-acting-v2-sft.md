# laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft

## Resumen

El modelo `laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft` es un sistema de síntesis de voz expresiva (text-to-speech) desarrollado por LAION y Christoph Schuhmann. Se trata de un fine-tune completo (no un adaptador) del checkpoint base `laion/moss-tts-local-transformer-4.55b-voice-acting-v2`, entrenado sobre 3.147.802 muestras anotadas que combinan perfiles de voz sintéticos y habla real en inglés y alemán. El objetivo es mejorar la capacidad del modelo para interpretar instrucciones de dirección en lenguaje natural, controlando emociones, estilos vocales y efectos como risas, susurros o gritos.

La arquitectura combina un backbone de lenguaje Qwen3-4B con una cabeza local transformer por frame que predice 12 codebooks RVQ a 12,5 Hz, decodificados por el MOSS-Audio-Tokenizer-v2 a 48 kHz nativos. Con 4.129.990.144 parámetros (4,13B), el modelo está disponible bajo licencia CC-BY-4.0 y se distribuye en formato safetensors. Su relevancia radica en ofrecer una alternativa open source de alta calidad para voice acting y clonación de voz con control fino mediante prompts, sin necesidad de tokenizador de audio adicional para el condicionamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-4B backbone + head local transformer por frame (12 codebooks RVQ, 12,5 Hz) |
| Parametros totales | 4.129.990.144 (4,13B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el prompt de texto se procesa como secuencia; la generación de audio se limita por frames máximos) |
| Tipos de cuantizacion | No disponible (el repo publica safetensors en bf16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Inglés, alemán |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (8,3 GB repo) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura MOSS-TTS-Local: un backbone de lenguaje Qwen3-4B procesa el prompt de instrucción y texto, y una cabeza local transformer genera por cada frame de 80 ms (12,5 Hz) las 12 capas de codebooks RVQ que el MOSS-Audio-Tokenizer-v2 decodifica a audio de 48 kHz. El condicionamiento de voz de referencia se inyecta directamente como códigos de audio `[T, 12]` int64 en `audio_codes_list`, sin necesidad de un tokenizador de audio separado en inferencia.

El fine-tune se realizó sobre 3.147.802 utterances anotadas (1.200.531 de perfiles de voz sintéticos y el resto de habla real en inglés y alemán), durante 3 épocas, con un total de 9.443.406 sample-passes. Se usó AdamW (β 0,9/0,95, ε 1e-8, weight decay 0,1), learning rate pico de 7e-6 con warmup en la primera mitad de la época 1 y decaimiento coseno al 10 %, batch global de 4.096 muestras y 2.232 pasos. El entrenamiento se ejecutó en 64 nodos × 4 GH200 (256 GPUs) durante 1 hora y 53 minutos. La pérdida es cross-entropy por canal, con una ponderación 1:32 del canal de stop frente a los 12 codebooks de audio. La pérdida de validación (retenida por hash determinista) descendió monótonamente en las doce evaluaciones, de 4,7076 a 4,6314, sin signos de sobreajuste.

## Capacidades

- Generación de voz expresiva con control fino mediante instrucciones en lenguaje natural (director instructions).
- Soporte de emociones y estilos vocales: 40 emociones documentadas en el manual de condicionamiento MOSS-VA-v2, incluyendo alegría, tristeza, enfado, sorpresa, etc.
- Efectos vocales especiales: risas, jadeos, suspiros, gritos, susurros, llantos y otros bursts vocales mediante claves parentizadas en el texto.
- Clonación de voz: acepta audio de referencia (códigos de codec) o un nombre de hablante (`Speaker: <name>`) para replicar una voz concreta.
- Control de duración: etiqueta de duración hablada (p. ej. `[4.2 seconds duration]`) para ajustar la longitud de la emisión.
- Multilingüe: inglés y alemán, con selección explícita de idioma en el prompt.
- Generación a 48 kHz nativos, con calidad adecuada para producción de audio.
- Integración con Hugging Face Transformers mediante `trust_remote_code=True` y el procesador `AutoProcessor`.

## Casos de uso

- Doblaje de videojuegos: el modelo puede generar líneas de diálogo para personajes fantásticos (orcos, dragones, hadas, goblins) con instrucciones de dirección como "voz grave y ronca, enfadada", reduciendo el coste de contratar actores de voz para prototipos o producciones independientes.
- Audiolibros narrados con múltiples personajes: usando la clonación de voz por referencia o nombres de hablante, se pueden asignar voces distintas a cada personaje y controlar la emoción en cada párrafo, manteniendo coherencia a lo largo de capítulos largos.
- Asistentes de voz con personalidad: integración en aplicaciones de atención al cliente o asistentes personales donde se requiere un tono específico (amable, enérgico, sereno) y la capacidad de responder con matices emocionales según el contexto de la conversación.
- Creación de contenido para redes sociales: generación de voces en off expresivas para vídeos de TikTok, YouTube o podcasts, con control de ritmo y emoción sin necesidad de estudio de grabación.
- Accesibilidad: lectores de pantalla que pueden modular la entonación para transmitir énfasis o estados de ánimo, mejorando la experiencia de usuarios con discapacidad visual.
- Prototipado de productos de voz: los equipos de producto pueden generar muestras de voz realistas para pruebas de usuario antes de grabar con actores profesionales, acelerando el ciclo de diseño de interfaces conversacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (tipo MMLU, HumanEval) para este modelo, al tratarse de un sistema TTS. La métrica reportada es la pérdida de validación durante el entrenamiento, que se muestra a continuación:

| paso | pérdida validación | voice profiles | real speech |
|--:|--:|--:|--:|
| 186 | 4,7076 | 4,4786 | 4,8668 |
| 558 | 4,6621 | 4,4342 | 4,8206 |
| 930 | 4,6472 | 4,4199 | 4,8053 |
| 1302 | 4,6370 | 4,4090 | 4,7956 |
| 1674 | 4,6328 | 4,4047 | 4,7915 |
| 2232 | 4,6314 | 4,4030 | 4,7902 |

La pérdida en perfiles de voz sintéticos es ~0,39 nats inferior a la de habla real, lo que se atribuye a la mayor previsibilidad del material sintético. No se dispone de comparaciones con otros modelos TTS en métricas objetivas como MOS (Mean Opinion Score) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en bf16 ocupa ~8,3 GB de pesos; con overhead de activaciones y KV cache, se recomiendan al menos 12 GB de VRAM para generación de secuencias largas. En cuantización de 8 bits (~4,2 GB) podría caber en GPUs de 8 GB, y en 4 bits (~2,1 GB) en GPUs de 6 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB), A10/A100 (24-80 GB) o GH200 para despliegues de alta concurrencia. En GPUs consumer de 8-12 GB (RTX 3060, 4070) es viable con cuantización ligera.
- Opciones de despliegue: el modelo se usa con Hugging Face Transformers (`AutoModel` con `trust_remote_code=True`). No se mencionan integraciones con vLLM, llama.cpp u Ollama; al ser un modelo TTS con código custom, el despliegue estándar es mediante el pipeline de Transformers.
- Latencia y throughput: no se proporcionan datos medidos. Dado el tamaño de 4,13B y la generación autoregresiva por frames, se espera una latencia del orden de segundos para frases cortas en una GPU moderna, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de datos objetivos de benchmarks comparables con otros modelos TTS open source (p. ej. XTTS-v2, Bark, StyleTTS 2) en la información proporcionada. A continuación se presenta una comparación cualitativa con el modelo base del que deriva:

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| `moss-tts-local-transformer-4.55b-voice-acting-v2-sft` (este) | 4,13B | No disponible | en, de | CC-BY-4.0 | Fine-tune SFT con 3,1M muestras, pérdida validación 4,6314 |
| `moss-tts-local-transformer-4.55b-voice-acting-v2` (base) | 4,13B | No disponible | en, de | CC-BY-4.0 | Checkpoint base sin fine-tune SFT adicional |
| `moss-tts-local-transformer-4.55b-voice-acting` (v1) | 4,13B | No disponible | en, de | CC-BY-4.0 | Versión anterior, arquitectura similar |

No se incluyen otros modelos TTS por falta de datos comparativos fiables en la información disponible.

## Limitaciones y advertencias

- Idiomas limitados: solo inglés y alemán; no soporta otros idiomas de forma nativa, y el uso fuera de estos puede degradar la calidad.
- Dependencia del formato de prompt: el modelo es sensible a la estructura exacta del bloque `<user_inst>`; desviarse de las convenciones de entrenamiento (p. ej. omitir el campo `Language` o usar etiquetas de duración incorrectas) reduce la calidad de salida.
- Riesgo de clonación de voz: la capacidad de clonar voces mediante audio de referencia puede usarse para suplantar a personas sin consentimiento. Se recomienda implementar salvaguardas en aplicaciones de producción.
- Sesgos potenciales: al entrenarse con perfiles de voz sintéticos y habla real en inglés y alemán, el modelo puede reflejar sesgos en acentos, géneros o registros presentes en los datos, aunque no se documentan estudios específicos.
- Alucinación de audio: en prompts ambiguos o con instrucciones contradictorias, el modelo puede generar audio ininteligible o con artefactos; se recomienda validar la salida en cada caso.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero exige citar a LAION y Christoph Schuhmann en productos derivados. No se aplican restricciones de uso militar o de vigilancia, pero el usuario es responsable del cumplimiento legal.
- Sin garantías de producción: no se proporcionan métricas de robustez ante ruido, latencia o throughput; el despliegue en entornos de alta demanda requiere pruebas adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft
- Modelo base: https://huggingface.co/laion/moss-tts-local-transformer-4.55b-voice-acting-v2
- Versión v1: https://huggingface.co/laion/moss-tts-local-transformer-4.55b-voice-acting
- Dataset de perfiles de voz: https://huggingface.co/datasets/laion/laion-voice-profiles-sft
- Dataset de habla real: https://huggingface.co/datasets/laion/tts-realspeech-sft-en-de
- Manual de condicionamiento MOSS-VA-v2: https://github.com/LAION-AI/moss-voiceacting-manual
- Repositorio GitHub del proyecto: https://github.com/LAION-AI/laion-moss-local-1.5-voice-acting-4.55b
- Overview de experimentos: https://projects.laion.ai/laion-moss-local-1.5-voice-acting-4.55b/overview.html
