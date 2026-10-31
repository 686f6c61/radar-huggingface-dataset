# LiquidAI/LFM3-Omni-2B-MLX-bf16

## Resumen

LFM3-Omni-2B-MLX-bf16 es la versión optimizada para Apple Silicon (framework MLX, pesos en BF16) del modelo omni-modal LFM3-Omni-2B de Liquid AI. Se trata de un modelo any-to-any de unos 2.170 millones de parámetros capaz de procesar y generar texto, audio y vision: puede realizar reconocimiento de voz (ASR), síntesis de voz (TTS) y responder preguntas sobre imágenes, todo en un único modelo compacto ejecutable en dispositivo.

La relevancia de esta ficha de modelo radica en su enfoque on-device: al estar cuantizado/convertido a MLX en BF16, ocupa unos 4,33 GB de pesos más 0,15 GB del tokenizador de audio, lo que lo hace viable en Mac con Apple Silicon sin necesidad de GPU dedicada. Liquid AI, conocida por su familia LFM (Liquid Foundation Models) basada en arquitecturas propias, dirige este modelo a desarrolladores que necesitan capacidades multimodales de voz y visión con latencia baja y privacidad local.

El soporte en MLX-VLM está en progreso según la model card, por lo que conviene verificar la versión de la librería antes de desplegar en producción. El modelo base es LiquidAI/LFM3-Omni-2B, disponible también en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3-Omni (omni-modal any-to-any, arquitectura propia de Liquid AI; detalles no disponibles en la ficha) |
| Parametros totales | 2.166.928.384 (~2,17 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (sin cuantizar adicional) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl, da, el, fi, he, nl, sv, tr (22 idiomas) |
| Licencia | LFM 1.0 (licencia propia, "other" en Hugging Face) |
| Formato de pesos | safetensors (MLX, BF16) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia LFM3 de Liquid AI, etiquetada como any-to-any con capacidades de audio, vision y speech-to-speech. Incluye un tokenizador de audio (codec) en el directorio `audio_tokenizer/` que ocupa 0,15 GB adicionales, encargado de codificar y decodificar audio para las tareas de ASR y TTS. Los detalles concretos de la arquitectura (tipo de attention, capas, dimensiones) no están disponibles en la model card de esta variante MLX; remiten a la ficha del modelo base LFM3-Omni-2B.

No se ha publicado en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas de alineamiento (RLHF/DPO). Los pesos se mantienen en BF16, igual que el checkpoint original, sin cuantizacion posterior.

## Capacidades

- Reconocimiento de voz (ASR): transcribe ficheros de audio a texto, con instruccion de idioma mediante system prompt (p. ej. "Perform ASR in English").
- Texto a voz (TTS): genera audio en formato WAV a 24 kHz, con seleccion de voz e idioma via system prompt (p. ej. voz femenina en ingles americano).
- Comprension de imagenes: responde preguntas visuales sobre imagenes (VQA), con instrucciones para limitar las respuestas a lo visible.
- Speech-to-speech y pipeline any-to-any: etiquetado como modelo omni capaz de combinar modalidades de entrada y salida.
- Multilingüe: soporte declarado para 22 idiomas, incluido el castellano.
- Generacion de texto conversacional sobre las modalidades anteriores.

No se indica en la informacion disponible soporte de tool calling, agentes ni thinking mode.

## Casos de uso

- Transcripcion de audio en local: un desarrollador puede integrar el modelo en una app de escritorio para macOS que transcriba notas de voz o reuniones sin enviar audio a la nube, aprovechando el ASR multilingüe.
- Sintesis de voz para aplicaciones accesibles: generar locuciones WAV a 24 kHz (lectores de pantalla, narracion de contenidos, prototipos de asistentes de voz) seleccionando voz e idioma mediante system prompts.
- Asistentes de voz on-device: combinando entrada de audio y salida de audio (speech-to-speech), es adecuado para prototipos de asistentes conversacionales que priorizan privacidad y latencia local.
- Preguntas sobre imagenes en apps de productividad: extraer texto de senales, capturas o documentos mediante VQA (por ejemplo, "¿Que pone el cartel?") directamente en un Mac.
- Prototipado multimodal en Apple Silicon: al ser un modelo de ~4,5 GB en BF16, permite experimentar con pipelines any-to-any en portatiles Mac sin infraestructura de servidor.
- Automatizacion de flujos con voz e imagen: scripts con MLX-VLM que encadenan transcripcion, analisis visual y respuesta hablada para automatizaciones locales (por ejemplo, procesar audios de soporte y generar respuestas habladas).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: unos 4,33 GB para los pesos en BF16 mas 0,15 GB del tokenizador de audio; en la practica conviene disponer de 8 GB de memoria unificada o mas para inferencia comoda.
- Compatible con Apple Silicon (Mac M1/M2/M3/M4); al usar MLX, no requiere GPU NVIDIA. No se indican requisitos para GPU dedicadas.
- Cabe sin problemas en portatiles Apple Silicon de gama base con 8 GB de memoria unificada, aunque el rendimiento sera mejor en equipos con 16 GB o mas.
- Despliegue: via MLX-VLM (`python -m mlx_vlm.generate`), con soporte para LFM3-Omni en progreso segun la model card. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI para esta variante MLX.
- Parametros de decodificacion: texto con greedy decoding (`temperature 0`); audio con `audio_temperature=0.4` y `audio_repetition_penalty=1.2` por defecto. No hay datos de latencia o throughput publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidades | Formato | Licencia |
|---|---|---|---|---|
| LFM3-Omni-2B-MLX-bf16 | ~2,17 B | texto, audio (ASR/TTS), vision | safetensors MLX BF16 | LFM 1.0 |
| LFM3-Omni-2B (base) | ~2,17 B | texto, audio, vision | safetensors (original) | LFM 1.0 |
| Qwen2.5-Omni-3B/7B | 3B/7B | texto, audio, vision, video | safetensors, GGUF | Apache 2.0 / licencia Qwen |

Comparado con la familia Qwen-Omni, LFM3-Omni-2B es mas ligero y esta optimizado especificamente para Apple Silicon via MLX, aunque Qwen2.5-Omni ofrece una licencia mas permisiva y mayor variedad de cuantizaciones comunitarias. Los datos de rendimiento comparativo no estan disponibles.

## Limitaciones y advertencias

- El soporte en MLX-VLM esta "en progreso" segun la model card: puede requerir una version concreta o de desarrollo de la libreria, lo que supone riesgo de inestabilidad en produccion.
- La licencia LFM 1.0 es una licencia propia de Liquid AI ("other" en Hugging Face): hay que revisar sus terminos antes de cualquier uso comercial, ya que pueden existir restricciones.
- No se ha publicado longitud de contexto, lo que impide evaluar su idoneidad para documentos largos o conversaciones extensas.
- No se han publicado benchmarks, por lo que la calidad de ASR/TTS/VQA debe validarse empiricamente en el caso de uso concreto.
- El TTS genera audio a 24 kHz con voces predefinidas; la calidad y cobertura de idiomas en sintesis de voz (frente a ASR) no se detalla en la informacion disponible.
- Al tratarse de un modelo de 2B, es esperable un riesgo de alucinaciones mayor que en modelos de mayor tamano, especialmente en VQA y razonamiento complejo; la propia model card sugiere system prompts que restrinjan las respuestas a lo visible en la imagen.
- Solo la variante MLX esta documentada aqui: para despliegue en servidores con GPU NVIDIA hay que acudir al modelo base LiquidAI/LFM3-Omni-2B.

## Enlaces

- Modelo MLX: https://huggingface.co/LiquidAI/LFM3-Omni-2B-MLX-bf16
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- MLX-VLM (GitHub): https://github.com/Blaizzy/mlx-vlm
- Documentacion Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Guia de despliegue MLX: https://docs.liquid.ai/deployment/on-device/mlx
- Blog LFM3: https://www.liquid.ai/blog/lfm3
- Playground: https://playground.liquid.ai/
- API (consola): https://console.liquid.ai/dashboard
