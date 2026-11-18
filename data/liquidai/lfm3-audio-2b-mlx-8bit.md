# LiquidAI/LFM3-Audio-2B-MLX-8bit

## Resumen

LFM3-Audio-2B-MLX-8bit es una versión cuantizada a 8 bits del modelo multimodal de audio LFM3-Audio-2B de Liquid AI, empaquetada específicamente para su ejecución en Apple Silicon mediante la librería MLX. El modelo original es un sistema "any-to-any" de aproximadamente 1.977 millones de parámetros (1,98 B) que procesa y genera tanto texto como audio, lo que le permite realizar tareas de reconocimiento automático del habla (ASR), síntesis de voz (TTS) y conversación voz a voz.

La relevancia de esta variante radica en su formato: los pesos ocupan 2,33 GB (más 0,15 GB del códec de audio), lo que la hace desplegable en equipos Mac con memoria unificada, sin necesidad de GPU dedicada. El backbone lingüístico emplea cuantización afín de 8 bits con grupos de 64, mientras que el codificador de audio, el proyector, el decodificador de profundidad y los embeddings del codebook permanecen en BF16 para preservar la calidad.

El modelo soporta 18 idiomas (incluido el español) y se distribuye bajo la licencia LFM1.0 de Liquid AI. Está pensado para desarrolladores que quieran prototipar o desplegar pipelines de voz en local sobre macOS, con un equilibrio razonable entre tamaño y precisión según el propio autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo multimodal any-to-any (backbone de lenguaje + codificador de audio + proyector + decodificador de profundidad + códec de audio); detalles arquitectónicos completos no disponibles en la información proporcionada |
| Parámetros totales | 1.977.548.032 (≈1,98 B) |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 8 bits afín con grupos de 64 en el backbone; BF16 en codificador, proyector, decodificador de profundidad y embeddings del codebook; códec de audio original |
| Idiomas soportados | en, ar, da, de, el, fi, fr, he, it, ja, ko, nl, pl, pt, es, sv, tr, zh (18 idiomas) |
| Licencia | LFM1.0 (lfm1.0, "other") |
| Formato de pesos | safetensors (MLX); tamaño del repo 2,5 GB; pesos 2,33 GB + 0,15 GB del códec |

## Arquitectura y entrenamiento

La información disponible describe un modelo any-to-any compuesto por varios módulos: un backbone de lenguaje cuantizado a 8 bits, un codificador de audio, un proyector, un decodificador de profundidad y un códec de audio independiente alojado en `audio_tokenizer/`. El pipeline declarado es `any-to-any`, lo que implica entrada y salida tanto en texto como en audio. No se detallan en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica más destacable de esta variante es la estrategia de cuantización selectiva: solo el backbone lingüístico se cuantiza a 8 bits, mientras que los componentes sensibles a la precisión (codificador de audio, proyector, decodificador de profundidad y codebook) se mantienen en BF16. El autor indica que 8 bits es el compromiso recomendado entre tamaño y precisión. Los detalles de arquitectura y entrenamiento remiten a la model card del modelo original LFM3-Audio-2B.

## Capacidades

- Reconocimiento automático del habla (ASR) en los 18 idiomas soportados, mediante system prompts del tipo "Perform ASR in English".
- Síntesis de voz (TTS) con selección de idioma y voz mediante system prompts (por ejemplo, "Perform TTS in American English using a female voice").
- Conversación voz a voz con salida intercalada de texto y audio ("Respond with interleaved text and audio").
- Generación de audio condicionada por parámetros de muestreo específicos: `audio_temperature`, `audio_top_k` y `audio_repetition_penalty`.
- Procesamiento multimodal de audio de entrada y salida de audio en un único pipeline (any-to-any).
- Soporte multilingüe amplio: inglés, español, francés, alemán, italiano, portugués, neerlandés, danés, sueco, finés, griego, polaco, turco, árabe, hebreo, japonés, coreano y chino.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Modo "thinking", visión o audio bidireccional completo: no disponible en la información proporcionada.

## Casos de uso

- Transcripción de reuniones en local sobre Mac: el modelo realiza ASR con un system prompt específico de idioma, procesando el audio de entrada y devolviendo texto, sin enviar datos a la nube gracias a su ejecución on-device con MLX.
- Generación de locuciones para vídeos o podcasts: mediante TTS con selección de voz e idioma, se pueden producir archivos WAV directamente desde la línea de comandos con `mlx_vlm.generate`.
- Asistentes de voz conversacionales en macOS: el modo speech-to-speech con salida intercalada de texto y audio permite construir interfaces de voz que responden hablando, adecuadas para prototipos de asistentes personales.
- Accesibilidad: conversión de texto a voz y de voz a texto para personas con discapacidad visual o auditiva, ejecutándose íntegramente en el dispositivo y preservando la privacidad.
- Localización de contenido audiovisual: al soportar 18 idiomas, se puede usar para transcribir audio en un idioma y generar voz en otro dentro de flujos de subtitulado o doblaje.
- Evaluación e investigación en modelos de audio: investigadores pueden experimentar con un modelo any-to-any de menos de 2 B de parámetros en hardware de consumo, comparando calidad de ASR/TTS entre idiomas y configuraciones de muestreo.
- Prototipado de agentes de voz en pipelines de CI: la instalación vía `mlx-vlm` y la ejecución por CLI permiten integrar pruebas automatizadas de ASR/TTS en flujos de desarrollo sobre runners macOS con Apple Silicon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: los pesos ocupan 2,33 GB más 0,15 GB del códec de audio; el consumo total en memoria unificada será algo superior por estados de ejecución y buffers de decodificación (cifra exacta no disponible).
- Hardware objetivo: Apple Silicon (MLX). No está pensado para GPU NVIDIA ni CUDA.
- Cabe en equipos Mac con memoria unificada de 8 GB o superior; se recomienda 16 GB para margen con contextos largos y decodificación de audio.
- GPU dedicadas (A100, H100, RTX 4090): no aplicables, ya que el formato MLX está orientado a Apple Silicon.
- Opciones de despliegue: MLX-VLM 0.7.11 o superior (`pip install -U "mlx-vlm>=0.7.11"`), ejecución por CLI con `python -m mlx_vlm.generate`. Otras opciones como vLLM, llama.cpp, Ollama o TGI no están indicadas para este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato / plataforma |
|---|---|---|---|---|---|
| LFM3-Audio-2B-MLX-8bit | ≈1,98 B | No disponible | 18 | LFM1.0 | MLX 8 bits (Apple Silicon) |
| LFM3-Audio-2B (original) | ≈1,98 B | No disponible | 18 | LFM1.0 | BF16 (pesos completos) |
| Otros modelos any-to-any de audio de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

La única comparación directa documentada es con el modelo base sin cuantizar, del que esta variante es una versión cuantizada a 8 bits. No se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 8 bits introduce una pérdida de precisión respecto al modelo original en BF16; el autor la considera el mejor compromiso, pero no cuantifica la degradación.
- Solo se ejecuta en Apple Silicon mediante MLX; no es portable a CUDA ni a otros backends sin conversión adicional.
- Requiere MLX-VLM 0.7.11 o superior; versiones anteriores no son compatibles.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en transcripciones de audio con ruido o acentos no representados en el entrenamiento.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Limitaciones de contexto: la longitud de contexto no se especifica, lo que impide planificar despliegues con audios largos sin pruebas previas.
- Licencia LFM1.0 ("other"): es necesario revisar los términos del archivo LICENSE del repositorio antes de un uso comercial; no se detallan las restricciones en la información proporcionada.
- El rendimiento de TTS depende de parámetros de muestreo concretos (`audio_temperature=1.0`, `audio_top_k=128`, `audio_repetition_penalty=1.1`); desviarse de los valores por defecto puede degradar la calidad.
- No se documentan capacidades de tool calling ni de razonamiento multi-paso, por lo que no debe asumirse su disponibilidad en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LiquidAI/LFM3-Audio-2B-MLX-8bit
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Audio-2B
- Repositorio MLX-VLM: https://github.com/Blaizzy/mlx-vlm
- Guía de despliegue MLX: https://docs.liquid.ai/deployment/on-device/mlx
- Documentación de LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Blog de LFM3: https://www.liquid.ai/blog/lfm3
- Playground: https://playground.liquid.ai/
- Consola/API: https://console.liquid.ai/dashboard
