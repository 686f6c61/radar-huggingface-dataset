# litert-community/InternVL3-1B

## Resumen

InternVL3-1B es el modelo de visión-lenguaje más pequeño de la familia InternVL3 desarrollada por OpenGVLab (Shanghai AI Laboratory). Combina un codificador visual InternViT-300M con un decodificador de lenguaje Qwen2.5-0.5B mediante un proyector MLP con pixel-shuffle, lo que le permite responder preguntas sobre imágenes con texto de forma totalmente offline. Esta ficha cubre la conversión a formato LiteRT-LM publicada por litert-community, pensada para inferencia en dispositivo (edge) con el runtime LiteRT-LM de Google.

La versión LiteRT-LM empaqueta el modelo en un único fichero `.litertlm` de aproximadamente 738 MB, con el codificador visual cuantizado a int8 y el decodificador a int4 (pesos simétricos, blockwise-32 + OCTAV), más embeddings de entrada en int8 externalizados. El contexto de caché KV está limitado a 2048 tokens y la entrada de imagen se redimensiona a 448×448, produciendo 256 tokens visuales por imagen. Es relevante ahora porque demuestra que un VLM funcional cabe en un móvil de gama alta y genera a velocidades de decodificación superiores a 80 tok/s en hardware Android reciente.

El modelo está pensado para aplicaciones de visión por computador en el dispositivo donde la latencia, la privacidad y la ausencia de conectividad son críticas: descripción de imágenes, VQA simple, accesibilidad y asistentes locales. Su licencia Apache 2.0 facilita la integración comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM: codificador InternViT-300M + pixel-shuffle + proyector MLP + decodificador Qwen2.5-0.5B |
| Parametros totales | no disponible (codificador ~300M + decodificador ~0.5B; el bundle pesa ~738 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (caché KV) |
| Tipos de cuantizacion | Visión int8; decodificador int4 (simétrico, blockwise-32 + OCTAV); embeddings de entrada int8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); modelo base en safetensors en OpenGVLab/InternVL3-1B |

## Arquitectura y entrenamiento

La arquitectura sigue el patrón estándar de InternVL3: un codificador visual InternViT-300M con atención "4D-clean" (optimizada para GPU), seguido de una operación de pixel-shuffle y un proyector MLP que transforma la representación visual en tokens para el decodificador. El decodificador es Qwen2.5-0.5B, un transformer de 24 capas con dimensión 896. Cada imagen de entrada se redimensiona a 448×448 con normalización ImageNet incorporada en el codificador y se convierte en 256 tokens visuales.

La conversión a LiteRT-LM aplica cuantización agresiva: int8 para el codificador visual y los embeddings, e int4 con bloques de 32 y técnica OCTAV para los pesos del decodificador, con cómputo entero. Según la model card, la torre visual convierte de forma bit-fiel respecto a la referencia, con correlación float-CPU de aproximadamente 1.0. No se detallan en la información disponible los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO); esa información correspondería a la model card original de OpenGVLab/InternVL3-1B.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text): descripción de imágenes, respuesta a preguntas visuales (VQA) y captioning.
- Razonamiento visual básico de una sola imagen por conversación (limitación conocida: una imagen por conv).
- Procesamiento multimodal con una imagen de 448×448 convertida en 256 tokens.
- Inferencia totalmente offline en dispositivo (móvil, escritorio), sin dependencia de red.
- Ejecución sobre backend CPU y GPU (Android GPU con delegación completa; en escritorio macOS el backend GPU no es funcional en litert-lm 0.15.0).
- Interfaz de chat interactiva y API local compatible con OpenAI mediante `litert-lm serve`.
- Soporte de adjuntar varias imágenes en la CLI (aunque la limitación de una imagen por conversación aplica al modelo).

## Casos de uso

- Descripción de imágenes offline en aplicaciones móviles: el modelo procesa una foto y genera una frase descriptiva en menos de un segundo de TTFT en GPU de Galaxy S26 (150 ms), adecuado para apps de accesibilidad que narran el contenido visual sin conexión.
- Asistencia a personas con discapacidad visual: integrado en un asistente de voz local, responde preguntas sobre el entorno capturado por la cámara, con privacidad total al no enviar imágenes a la nube.
- Etiquetado y moderación de contenido en el dispositivo: clasificación y descripción automática de imágenes en galerías locales antes de subirlas, reduciendo coste de backend y cumpliendo requisitos de privacidad.
- VQA en aplicaciones de campo sin conectividad: técnicos que fotografían equipos o documentos y obtienen respuestas sobre ellos en entornos sin red (zonas rurales, industria, minería).
- Prototipado rápido de funcionalidades multimodales: gracias al formato `.litertlm` y a la CLI de una sola línea, sirve para validar ideas de producto VLM en macOS, Linux y Windows antes de invertir en infraestructura mayor.
- Asistentes embebidos en wearables o dispositivos IoT con GPU integrada: el tamaño de 738 MB y el consumo de memoria pico de 443 MB en Galaxy S26 permiten desplegarlo en hardware con recursos limitados.
- Educación interactiva: aplicación que muestra una imagen (diagrama, mapa, ilustración) y responde preguntas del estudiante de forma local, sin coste por token ni latencia de red.

## Benchmarks y rendimiento

Datos de rendimiento publicados en la model card (no son benchmarks de calidad tipo MMLU/HumanEval, sino medidas de inferencia):

| Dispositivo | Backend | Prefill | Decode | TTFT |
|---|---|---|---|---|
| Galaxy S26 (SM-S942Q, Android 16) | GPU | 1456 tok/s | 85.4 tok/s | 150 ms |
| Galaxy S26 (SM-S942Q, Android 16) | CPU | 359 tok/s | 81.7 tok/s | 680 ms |
| Apple M4 Max (macOS) | CPU | 454 tok/s | 94.0 tok/s | 0.62 s |

Notas: en Galaxy S26 con GPU se delegaron 1063 operaciones (medición 2026-08-24, LiteRT-LM 0.16.0); con CPU, 81.7 tok/s de decode y 680 ms de TTFT (2026-09-05). En M4 Max se usó `litert-lm benchmark -p 256 -d 256 --runs 3`, max-num-tokens 4096, warm-up descartado; las cifras cubren la ruta de texto, no el codificador visual. En Galaxy S26 con GPU se delegaron 3098/3098 ops en 3 subgrafos sobre LiteRT GPU, con pico de memoria de 443 MB. El backend GPU de macOS en litert-lm 0.15.0 no es usable para este bundle (produce caracteres `!` en lugar de texto); úsese CPU en escritorio.

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- Tamaño del bundle: ~738 MB en disco; pico de memoria medido en Galaxy S26: 443 MB.
- VRAM/RAM estimada para inferencia: no disponible de forma explícita; el pico de 443 MB en Android da una referencia práctica para memoria del proceso.
- GPU recomendadas: GPU integrada de móvil de gama alta (Snapdragon 8 Elite / SM8850 en Galaxy S26); en escritorio, Apple M4 Max funciona por CPU. No hay datos publicados para A100, H100 o RTX 4090.
- Cabe en GPU de consumo: sí, en el sentido de que cabe en móviles de gama alta y en cualquier equipo de escritorio moderno; no se dispone de cifras para GPUs de escritorio dedicadas.
- Opciones de despliegue: runtime LiteRT-LM (`pip install litert-lm`), CLI `litert-lm run`, servidor `litert-lm serve` (API compatible con OpenAI), `litert_lm_advanced_main` en Android. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: ver tabla de benchmarks; TTFT de 150 ms en GPU de Galaxy S26 y decode de 85.4 tok/s; en M4 Max CPU, 94.0 tok/s de decode y TTFT de 0.62 s.
- Multiplataforma: el mismo fichero funciona en macOS, Linux y Windows.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| InternVL3-1B (LiteRT-LM) | ~0.8B (300M visión + 0.5B texto) | 2048 | `.litertlm` / LiteRT-LM | Apache 2.0 | Hugging Face (litert-community) |
| InternVL3-2B (LiteRT-LM) | no disponible | no disponible | `.litertlm` / LiteRT-LM | Apache 2.0 | Hugging Face (litert-community) |
| OpenGVLab/InternVL3-1B (original) | ~0.8B | no disponible | safetensors / transformers | Apache 2.0 | Hugging Face (OpenGVLab) |

La comparativa se limita a la familia InternVL3 porque la información disponible no incluye datos de otros VLM pequeños comparables (por ejemplo, variantes de PaliGemma, SmolVLM o Qwen2-VL en formato edge). No disponible para esos casos.

## Limitaciones y advertencias

- Una sola imagen por conversación: limitación conocida y explícita en la model card.
- Contexto limitado a 2048 tokens de caché KV, lo que restringe conversaciones multi-turno largas y prompts extensos.
- Decodificador de solo 0.5B parámetros: capacidad de razonamiento y conocimiento factual limitada; riesgo elevado de alucinación en preguntas abiertas o imágenes ambiguas.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe uniforme.
- Backend GPU de macOS no funcional en litert-lm 0.15.0 (genera `!` en lugar de texto); usar CPU en escritorio.
- Posible corrupción de descarga: la CLI puede conservar ficheros incompletos en caché y reutilizarlos; si `run` falla con bus error (exit 138) o `too large for file size`, borrar el fichero de `~/.litert-lm/cache/huggingface/litert-community/InternVL3-1B/` y reintentar.
- La ruta de visión en GPU de Android no está medida en la model card; solo se valida creación de motor y ruta de texto.
- Sesgos conocidos: no documentados en la información disponible; heredables del dataset de entrenamiento del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar la model card original de OpenGVLab/InternVL3-1B para condiciones adicionales del modelo base.

## Enlaces

- Hugging Face (esta conversión): https://huggingface.co/litert-community/InternVL3-1B
- Modelo base: https://huggingface.co/OpenGVLab/InternVL3-1B
- Hermano mayor en LiteRT: https://huggingface.co/litert-community/InternVL3-2B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Ficha edge-compat con mediciones: https://github.com/john-rocky/edge-compat/blob/main/cards/internvl3-1b/CARD.md
- Guía de GPU en Android: https://github.com/john-rocky/hf-to-litertlm/blob/main/docs/android-gpu.md
- Imagen de ejemplo COCO: https://huggingface.co/huggingface/documentation-images/blob/main/coco_sample.png
