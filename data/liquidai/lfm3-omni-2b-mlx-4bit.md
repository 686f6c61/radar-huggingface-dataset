# LiquidAI/LFM3-Omni-2B-MLX-4bit

## Resumen

LFM3-Omni-2B-MLX-4bit es la versión cuantizada a 4 bits, optimizada para Apple Silicon mediante el framework MLX, del modelo omnimodal LFM3-Omni-2B desarrollado por Liquid AI. Se trata de un modelo any-to-any que combina capacidades de lenguaje, visión y audio en un único modelo compacto de unos 2.100 millones de parámetros, capaz de realizar reconocimiento de voz (ASR), síntesis de voz (TTS) con salida de audio, y preguntas y respuestas sobre imágenes.

El modelo original pertenece a la familia LFM3 (Liquid Foundation Models) de Liquid AI, basada en arquitecturas propias de la compañía. Esta variante cuantizada reduce el peso de los parámetros del lenguaje a 4 bits (con partes críticas a 6 bits), manteniendo la torre de visión, el codificador de audio y el códec de audio en BF16, lo que permite ejecutar el modelo completo en portátiles y escritorios Mac con Apple Silicon ocupando unos 2,1 GB de memoria.

Su relevancia reside en ofrecer capacidades omnimodales (voz a voz, imagen a texto, texto a voz) en un formato ligero ejecutable localmente en hardware de consumo, algo poco habitual en modelos de este tamaño. La propia Liquid AI recomienda, no obstante, la versión de 8 bits como mejor equilibrio entre calidad y tamaño, ya que esta variante de 4 bits pierde algo de precisión al ser el modelo más pequeño de la familia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 (Liquid Foundation Models), omnimodal any-to-any con torre de visión, codificador de audio y códec de audio; detalles completos no disponibles |
| Parametros totales | 2.166.928.384 (≈2,17 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits afín con grupos de 64 en el backbone de lenguaje; 6 bits en token embedding (capa de salida), proyecciones value y feed-forward down; BF16 en torre de visión, proyectores, codificador de audio, depth decoder y códec de audio |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl, da, el, fi, he, nl, sv, tr (22 idiomas) |
| Licencia | LFM Open License v1.0 (lfm1.0, licencia propia de Liquid AI, "other") |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo deriva de LFM3-Omni-2B, un modelo omnimodal de la familia LFM3 de Liquid AI. La arquitectura integra varios componentes: un backbone de lenguaje, una torre de visión con su proyector, un codificador de audio con proyector, un depth decoder y un códec de audio (en el directorio `audio_tokenizer/`) que permite generar salida de voz. El pipeline etiquetado como any-to-any indica que acepta y genera múltiples modalidades: texto, imagen y audio.

En cuanto a la cuantización, el backbone de lenguaje usa cuantización afín de 4 bits con grupos de 64, excepto el embedding de tokens (que también actúa como capa de salida) y las proyecciones value y feed-forward down en las capas que llama.cpp actualizaría a Q4_K_M, que usan 6 bits. Los componentes de visión, audio y el códec permanecen en BF16 para preservar la calidad de las modalidades no textuales. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Reconocimiento de voz (ASR): transcribe audio a texto, configurable por idioma mediante el system prompt (por ejemplo, "Perform ASR in English").
- Texto a voz (TTS): genera audio de salida en formato WAV a 24 kHz, con selección de voz e idioma vía system prompt (por ejemplo, voz femenina en inglés americano).
- Comprensión de imágenes: responde preguntas sobre imágenes, con instrucciones para basar las respuestas exclusivamente en el contenido visual.
- Generación de texto: capacidades conversacionales y de lenguaje del backbone LFM3.
- Capacidades multilingües: soporte declarado para 22 idiomas, incluido el castellano.
- Pipeline any-to-any: combinación de entradas y salidas multimodales (voz a voz, imagen a texto, texto a voz).
- No se dispone de información sobre soporte de tool calling, agentes, ni capacidades de razonamiento extendido.

## Casos de uso

- Transcripción local de notas de voz: ejecutando el modelo con MLX-VLM en un Mac, se puede transcribir audio a texto sin enviar datos a la nube, útil para flujos con requisitos de privacidad.
- Generación de locuciones y narraciones: el modo TTS produce WAV a 24 kHz con voces configurables, adecuado para prototipado de asistentes de voz o generación de audio para contenidos.
- Asistente visual local: preguntas sobre capturas de pantalla, fotografías o documentos escaneados directamente en el dispositivo, aprovechando la torre de visión en BF16.
- Prototipado de agentes de voz speech-to-speech: combina ASR, generación de texto y TTS en un solo modelo para construir demos de conversación por voz sin orquestar varios servicios.
- Aplicaciones on-device en Apple Silicon: con unos 2,1 GB de pesos, cabe en Macs con 8 GB o más de memoria unificada, ideal para apps nativas con MLX.
- Procesamiento multilingüe: soporte de 22 idiomas permite construir herramientas de transcripción y diálogo para equipos internacionales, incluido el castellano.
- Evaluación y comparación de cuantizaciones: útil como referencia para medir la pérdida de calidad de 4 bits frente a la variante de 8 bits recomendada por el fabricante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Memoria estimada: 1,96 GB de pesos del modelo más 0,15 GB del códec de audio en `audio_tokenizer/`; el repo completo ocupa 2,1 GB. Con overhead de inferencia, conviene disponer de al menos 4 GB de memoria unificada.
- Hardware: diseñado específicamente para Apple Silicon (Mac con chips M1/M2/M3/M4); no es adecuado para GPUs NVIDIA en este formato MLX.
- Consumer hardware: sí, cabe en prácticamente cualquier Mac moderno con Apple Silicon, incluidos portátiles con 8 GB de memoria unificada.
- Despliegue: MLX mediante MLX-VLM (soporte en progreso según la model card, pendiente de una release que lo incluya). Los comandos de ejemplo usan `python -m mlx_vlm.generate` con opciones `--audio`, `--image` y `--output-modality audio`. No aplica llama.cpp, vLLM, TGI u Ollama en este formato.
- Decodificación: las respuestas de texto usan greedy decoding (temperature 0); la salida de voz muestrea con `audio_temperature=0.4` y `audio_repetition_penalty=1.2` por defecto. No hay datos de latencia o throughput publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidades | Cuantizacion | Licencia |
|---|---|---|---|---|
| LFM3-Omni-2B-MLX-4bit | ≈2,17 B | texto, imagen, audio (any-to-any) | 4/6 bits + BF16 | LFM Open License v1.0 |
| LFM3-Omni-2B-MLX-8bit | ≈2,17 B | texto, imagen, audio (any-to-any) | 8 bits + BF16 (recomendada por Liquid AI) | LFM Open License v1.0 |
| LFM3-Omni-2B (original) | ≈2,17 B | texto, imagen, audio (any-to-any) | sin cuantizar | LFM Open License v1.0 |

No se dispone de datos de rendimiento comparados con modelos omnimodales de otros fabricantes de tamaño similar (por ejemplo, variantes pequeñas de Qwen-Omni o Gemma audio) en la informacion proporcionada.

## Limitaciones y advertencias

- Pérdida de precisión: la propia Liquid AI indica que esta variante de 4 bits, al ser la más pequeña y cuantizada, pierde algo de exactitud y recomienda la versión de 8 bits como mejor compromiso.
- Soporte en MLX-VLM aún en progreso: la model card señala que el soporte de LFM3-Omni en MLX-VLM no está incluido todavía en una release estable, lo que puede complicar la instalación.
- Restricción de licencia: usa la LFM Open License v1.0 (licencia propia, etiquetada como "other"), no una licencia estándar permisiva; conviene revisar los términos antes de uso comercial.
- Restricción de plataforma: el formato MLX solo funciona en Apple Silicon; para otras plataformas hay que recurrir al modelo base.
- Idiomas: aunque se declaran 22 idiomas, no hay datos publicados sobre la calidad relativa de cada uno; el castellano está soportado pero sin métricas de referencia.
- Datos no disponibles: longitud de contexto, benchmarks, tasas de alucinación y sesgos conocidos no están documentados en la informacion proporcionada.
- Uso de `custom_code`: el modelo está etiquetado con `custom_code`, lo que implica ejecutar código del repositorio al cargarlo; revisar el código antes de usarlo en entornos sensibles.

## Enlaces

- Modelo cuantizado (esta ficha): https://huggingface.co/LiquidAI/LFM3-Omni-2B-MLX-4bit
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Variante 8 bits recomendada: https://huggingface.co/LiquidAI/LFM3-Omni-2B-MLX-8bit
- MLX-VLM (repositorio): https://github.com/Blaizzy/mlx-vlm
- Documentacion de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Guia de despliegue MLX: https://docs.liquid.ai/deployment/on-device/mlx
- Blog de LFM3: https://www.liquid.ai/blog/lfm3
- Playground de Liquid AI: https://playground.liquid.ai/
- Consola/API de Liquid AI: https://console.liquid.ai/dashboard
