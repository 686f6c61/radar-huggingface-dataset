# LiquidAI/LFM3-Omni-2B-MLX-8bit

## Resumen

LFM3-Omni-2B-MLX-8bit es la versión cuantizada a 8 bits (formato MLX) del modelo omni-modal LFM3-Omni-2B de Liquid AI, optimizada para ejecutarse de forma nativa en chips Apple Silicon (M1/M2/M3/M4). Se trata de un modelo "any-to-any" compacto, de unos 2.167 millones de parámetros, capaz de procesar y generar texto, comprender imágenes, realizar reconocimiento de voz (ASR) y sintetizar voz (TTS), incluyendo modos de voz a voz (speech-to-speech). Su relevancia radica en que lleva capacidades omni-modales —normalmente reservadas a modelos de decenas de miles de millones de parámetros— a dispositivos de consumo, sin depender de la nube.

La cuantización a 8 bits aplica únicamente al backbone de lenguaje (afín, con grupos de 64), mientras que la torre de visión, el codificador de audio, los proyectores, el decodificador de profundidad y el códec de audio permanecen en BF16 para preservar la calidad de los componentes multimodales. Liquid AI describe 8 bits como el equilibrio recomendado entre tamaño y precisión. El repositorio ocupa 2,9 GB en total (2,71 GB de pesos más 0,15 GB del tokenizador de audio).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LFM3-Omni (any-to-any: texto, imagen, audio; backbone LFM3) |
| Parametros totales | 2.166.928.384 (dato de safetensors) |
| Parametros activos | no disponible (no consta arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits afín (grupos de 64) en el backbone de lenguaje; visión, audio, proyectores, decodificador de profundidad y códec de audio en BF16 |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl, da, el, fi, he, nl, sv, tr (22 idiomas) |
| Licencia | LFM Open License v1.0 (lfm1.0, licencia "other" personalizada) |
| Formato de pesos | safetensors (MLX), 8 bits; repo de 2,9 GB |

## Arquitectura y entrenamiento

El modelo es una versión cuantizada de LFM3-Omni-2B, la familia omni-modal de Liquid AI basada en la arquitectura LFM3 (Liquid Foundation Models), que según el fabricante incorpora diseños híbridos inspirados en dinámicas de sistemas líquidos para secuencias largas. La variante MLX-8bit cuantiza el backbone de lenguaje con cuantización afín de 8 bits en grupos de 64, manteniendo en BF16 los módulos sensibles a la precisión: la torre de visión y su proyector, el codificador de audio y su proyector, el decodificador de profundidad y el códec de audio incluido en `audio_tokenizer/` (0,15 GB adicionales).

No se ha publicado en la información disponible detalle alguno sobre los datos de entrenamiento, número de tokens, ni procesos de alineación (RLHF/DPO) de este repositorio; deben consultarse la model card del modelo base LFM3-Omni-2B y el blog de Liquid AI. Este repositorio es una conversión de despliegue, no un reentrenamiento.

## Capacidades

- Comprensión y generación de texto en 22 idiomas, incluido el castellano.
- Respuesta a preguntas sobre imágenes (VQA): lectura de señales, descripción de contenido visual, razonamiento sobre lo que se ve.
- Reconocimiento de voz (ASR) a partir de ficheros de audio (por ejemplo, WAV).
- Síntesis de voz (TTS) con salida WAV a 24 kHz, con selección de voz e idioma mediante system prompts (por ejemplo, "voz femenina en inglés americano").
- Modo speech-to-speech / any-to-any: pipeline que acepta y produce distintas modalidades (texto, imagen, audio).
- Decodificación greedy para texto (temperature 0 recomendado) y muestreo específico para audio (audio_temperature=0.4, audio_repetition_penalty=1.2 por defecto).
- Ejecución local en Apple Silicon mediante MLX, sin necesidad de GPU de servidor.

## Casos de uso

- Asistentes de voz locales en macOS e iOS: al integrar ASR, razonamiento y TTS en un único modelo de 2,9 GB, se puede construir un asistente conversacional por voz que funciona íntegramente en un Mac o dispositivo Apple, sin enviar audio a la nube.
- Transcripción automática de reuniones y notas de voz: con system prompts de ASR, el modelo transcribe ficheros de audio directamente en el dispositivo, útil para flujos de trabajo con requisitos de privacidad (salud, legal, consultoría).
- Lectura de documentos e imágenes: dada su capacidad de VQA, puede extraer texto de señales, capturas de pantalla o fotografías y responder preguntas sobre ellas, integrable en apps de accesibilidad.
- Generación de locuciones y narración: el modo TTS con salida WAV a 24 kHz permite producir audio para vídeos, prototipos de IVR o audiolibros con control de voz e idioma vía system prompt.
- Prototipado de agentes multimodales en el escritorio: combinando entrada de imagen, audio y texto, sirve como base para agentes que describen entornos, procesan comandos hablados y responden, todo on-device.
- Aplicaciones multilingües en el borde: con soporte de 22 idiomas, es adecuado para herramientas de traducción hablada, soporte al cliente offline o apps educativas que combinan voz e imagen en varios idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los resultados del modelo base (LFM3-Omni-2B) pueden consultarse en su model card y en el blog de Liquid AI, pero no están incluidos en la información proporcionada para esta ficha.

## Requisitos de hardware

- VRAM/memoria unificada estimada: unos 2,9 GB solo de pesos (2,71 GB del modelo + 0,15 GB del tokenizador de audio); en la práctica se recomienda disponer de al menos 8 GB de memoria unificada para dejar margen al KV cache y a los buffers de audio.
- Hardware objetivo: cualquier Mac con Apple Silicon (M1, M2, M3, M4); al usar MLX, la inferencia aprovecha la GPU integrada y la memoria unificada, sin necesidad de GPU dedicada.
- Consumer GPU: no aplica directamente; MLX está diseñado para Apple Silicon. Para GPU NVIDIA habría que recurrir al modelo base sin cuantizar o a conversiones GGUF si existen.
- Despliegue: mediante MLX-VLM (`pip install mlx-vlm`), con comandos `python -m mlx_vlm.generate` para ASR, TTS y preguntas sobre imágenes. El soporte de LFM3-Omni en MLX-VLM estaba en progreso en el momento de publicación de la model card. No consta soporte en vLLM, llama.cpp, Ollama o TGI para esta variante MLX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidades | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| LFM3-Omni-2B-MLX-8bit | ~2,17 B | texto, imagen, audio (any-to-any) | 8 bits (backbone), BF16 (multimodal) | LFM Open License v1.0 | Apple Silicon (MLX) |
| LFM3-Omni-2B (base) | ~2,17 B | texto, imagen, audio (any-to-any) | BF16 (sin cuantizar) | LFM Open License v1.0 | Multiplataforma |
| Qwen2.5-Omni-3B (referencia de categoria) | ~3 B | texto, imagen, audio, vídeo | múltiples (incluida 8 bits) | Apache 2.0 / variante comercial | Multiplataforma |

Nota: los datos de Qwen2.5-Omni-3B son de referencia general; para esta ficha no se ha proporcionado información detallada de modelos comparables, por lo que la comparativa debe tomarse como orientativa.

## Limitaciones y advertencias

- Licencia LFM Open License v1.0 (lfm1.0): es una licencia personalizada ("other"), no una licencia estándar tipo Apache o MIT; debe revisarse el texto LICENSE antes de cualquier uso comercial.
- La cuantización a 8 bits del backbone de lenguaje puede introducir una ligera degradación de precisión frente al modelo base en BF16, aunque el autor la presenta como el equilibrio recomendado.
- Los componentes multimodales (visión, audio) permanecen en BF16, pero el soporte en MLX-VLM estaba aún en progreso al publicarse la model card, por lo que la experiencia puede ser inestable hasta la próxima release compatible.
- El modelo base es de 2B de parámetros: su capacidad de razonamiento complejo y generación de código es limitada frente a modelos grandes; es adecuado para tareas on-device ligeras, no para razonamiento profundo.
- No se dispone de benchmarks publicados en la información proporcionada, por lo que el rendimiento real (WER del ASR, naturalidad del TTS, precisión en VQA) debe validarse caso por caso.
- Restricciones de idioma: aunque se listan 22 idiomas, la calidad por idioma (incluido el castellano) no está documentada en la información disponible.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar respuestas incorrectas; la model card recomienda system prompts que restrinjan las respuestas visuales a lo observable.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/LiquidAI/LFM3-Omni-2B-MLX-8bit
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- MLX-VLM (soporte en progreso): https://github.com/Blaizzy/mlx-vlm
- Guía de despliegue MLX de Liquid AI: https://docs.liquid.ai/deployment/on-device/mlx
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Blog de LFM3: https://www.liquid.ai/blog/lfm3
- Playground de Liquid AI: https://playground.liquid.ai/
- Consola API de Liquid AI: https://console.liquid.ai/dashboard
