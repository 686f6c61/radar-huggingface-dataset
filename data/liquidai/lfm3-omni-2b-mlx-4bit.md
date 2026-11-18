# LiquidAI/LFM3-Omni-2B-MLX-4bit

## Resumen

LFM3-Omni-2B-MLX-4bit es la variante cuantizada a 4 bits en formato MLX del modelo multimodal LFM3-Omni-2B de Liquid AI, pensada para ejecución en Apple Silicon. Se trata de un modelo "any-to-any" que procesa y genera texto, audio e imágenes, incluyendo reconocimiento de voz (ASR), síntesis de voz (TTS) y respuesta a preguntas sobre imágenes, todo dentro de un único modelo de aproximadamente 2.166 millones de parámetros.

El modelo base pertenece a la familia LFM3 de Liquid AI, una generación de modelos diseñada por la empresa para despliegue eficiente en dispositivos. Esta versión concreta aplica cuantización de 4 bits al backbone lingüístico mientras mantiene en BF16 la torre de visión, los proyectores, el codificador de audio, el decodificador de profundidad y el códec de audio, lo que permite un consumo de pesos de 1,96 GB más 0,15 GB para el códec.

Su relevancia actual radica en que ofrece capacidades omnicanal (audio, visión y texto) en un tamaño que cabe en memoria unificada de equipos Apple, con licencia LFM 1.0 y soporte para 23 idiomas. La model card del autor advierte que esta variante de 4 bits pierde algo de precisión y recomienda la versión de 8 bits como compromiso óptimo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo omnicanal con backbone lingüístico, torre de visión, codificador de audio y decodificador de profundidad; detalles en la model card del modelo base) |
| Parametros totales | 2.166.928.384 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (afín, grupos de 64) en el backbone lingüístico; 6 bits en embeddings de tokens, proyecciones de valor y down de feed-forward; BF16 en visión, audio y códec |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl, da, el, fi, he, nl, sv, tr |
| Licencia | lfm1.0 (other) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de que se trata de un modelo omnicanal que integra un backbone lingüístico, una torre de visión con su proyector, un codificador de audio con su proyector, un decodificador de profundidad y un códec de audio separado en el directorio `audio_tokenizer/`. Esta variante MLX cuantiza el backbone a 4 bits con cuantización afín y grupos de 64, elevando a 6 bits el embedding de tokens (que también actúa como capa de salida), las proyecciones de valor y las proyecciones down de feed-forward en las capas que llama.cpp Q4_K_M mejora. El resto de componentes (visión, audio, decodificador de profundidad y códec) permanecen en BF16.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. Tampoco se detallan innovaciones técnicas específicas más allá de la propia naturaleza omnicanal del modelo y la estrategia de cuantización mixta descrita.

## Capacidades

- Generación de texto y razonamiento general.
- Reconocimiento automático de voz (ASR) en múltiples idiomas.
- Síntesis de voz (TTS) con salida en WAV a 24 kHz, con selección de voz y acento mediante prompts de sistema.
- Respuesta a preguntas sobre imágenes (VQA) basada en el contenido visual.
- Conversión voz a voz (speech-to-speech) al combinar ASR y TTS en un mismo modelo.
- Procesamiento any-to-any: entrada y salida en combinaciones de texto, audio e imagen.
- Soporte multilingüe en 23 idiomas, incluido el español.
- Capacidad de controlar la modalidad de salida mediante parámetros (`--output-modality audio`).
- Decodificación greedy para respuestas de texto y muestreo con `audio_temperature=0.4` y `audio_repetition_penalty=1.2` para audio.

## Casos de uso

- Transcripción de reuniones y notas de voz: el modelo puede realizar ASR directamente sobre archivos WAV con el prompt de sistema adecuado, lo que permite transcribir audio en cualquiera de los 23 idiomas soportados sin depender de servicios externos.
- Asistentes de voz locales en macOS: combinando ASR y TTS, se puede construir un asistente que escuche, razone y responda por voz en el propio dispositivo Apple, sin enviar audio a la nube.
- Accesibilidad para personas con discapacidad visual: dado que responde preguntas sobre imágenes, puede describir el contenido de una fotografía o leer señales y texto visible en una escena.
- Lectura de documentos y carteles: con la entrada de imagen, el modelo puede extraer y responder preguntas sobre texto presente en capturas o fotografías, útil en aplicaciones de digitalización.
- Generación de audiolibros y locuciones: la salida TTS a 24 kHz permite convertir texto en audio con distintas voces, adecuado para prototipos de narración o contenido accesible.
- Traducción multimodal: al soportar 23 idiomas y múltiples modalidades, puede transcribir audio en un idioma y generar respuesta hablada o escrita en otro, útil en atención al cliente multilingüe.
- Prototipado de agentes conversacionales en Apple Silicon: al ejecutarse con MLX-VLM en equipos Apple, sirve para validar flujos de voz e imagen antes de desplegar en infraestructura mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Pesos del modelo: 1,96 GB en 4 bits, más 0,15 GB del códec de audio en `audio_tokenizer/`, lo que suma aproximadamente 2,1 GB de almacenamiento.
- VRAM/memoria unificada estimada: al tratarse de un formato MLX, requiere memoria unificada de Apple Silicon; con 2,1 GB de pesos, cabe holgadamente en equipos con 8 GB o más de memoria unificada, aunque el consumo real durante la inferencia será superior por activaciones y buffers.
- GPU recomendadas: Apple Silicon (series M1, M2, M3, M4 y superiores) con memoria unificada suficiente.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon; no está pensado para GPU NVIDIA en este formato (para ello habría que usar otras variantes del modelo base).
- Opciones de despliegue: MLX-VLM 0.7.11 o superior mediante `python -m mlx_vlm.generate`; el modelo base puede desplegarse con otras herramientas según su model card original.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| LFM3-Omni-2B-MLX-4bit | 2.166 M | no disponible | texto, audio, imagen | lfm1.0 | MLX safetensors 4 bits |
| LFM3-Omni-2B-MLX-8bit | no disponible | no disponible | texto, audio, imagen | lfm1.0 | MLX safetensors 8 bits |
| LFM3-Omni-2B (base) | no disponible | no disponible | texto, audio, imagen | lfm1.0 | safetensors |

La información disponible solo permite comparar con las variantes del mismo modelo de Liquid AI. No se dispone de datos de benchmarks ni de especificaciones de modelos competidores de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La model card advierte explícitamente que esta variante de 4 bits pierde precisión respecto al modelo base y que la versión de 8 bits es el compromiso recomendado.
- El formato MLX está orientado a Apple Silicon; no es directamente utilizable en GPU NVIDIA u otras plataformas sin conversión.
- No se dispone de información sobre sesgos conocidos, tasas de alucinación ni evaluación de seguridad en la información proporcionada.
- La longitud de contexto no está documentada en la información disponible, lo que limita la planificación de aplicaciones con ventanas largas.
- La licencia LFM 1.0 es de tipo "other"; es necesario revisar el archivo LICENSE para conocer las restricciones de uso comercial antes de desplegar en producción.
- El rendimiento en idiomas distintos del inglés puede variar; la model card no ofrece métricas por idioma.
- Para TTS y ASR se depende de prompts de sistema específicos; un uso incorrecto puede degradar la calidad de la salida.
- Requiere MLX-VLM 0.7.11 o superior; versiones anteriores no son compatibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LiquidAI/LFM3-Omni-2B-MLX-4bit
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Variante 8 bits: https://huggingface.co/LiquidAI/LFM3-Omni-2B-MLX-8bit
- Repositorio MLX-VLM: https://github.com/Blaizzy/mlx-vlm
- Blog de LFM3: https://www.liquid.ai/blog/lfm3
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Guía de despliegue MLX: https://docs.liquid.ai/deployment/on-device/mlx
- Consola de Liquid AI: https://console.liquid.ai/dashboard
- Playground: https://playground.liquid.ai/
