# LiquidAI/LFM3-Audio-2B-MLX-bf16

## Resumen

LFM3-Audio-2B-MLX-bf16 es la versión para Apple Silicon (MLX, pesos en BF16) de LFM3-Audio-2B, un modelo audio de cualquier-a-cualquiera (any-to-any) desarrollado por Liquid AI. El modelo base pertenece a la familia LFM3 de Liquid AI y está diseñado para tareas de voz de extremo a extremo: reconocimiento de habla (ASR), síntesis de voz (TTS) y conversación de voz a voz con salida intercalada de texto y audio. Incluye un códec de audio (tokenizador) que ocupa unos 0,15 GB adicionales a los 3,96 GB de pesos.

La relevancia de este checkpoint reside en su enfoque on-device: con menos de 2.000 millones de parámetros y soporte nativo MLX, puede ejecutarse localmente en Mac con Apple Silicon sin depender de la nube, algo especialmente valioso para asistentes de voz privados y aplicaciones con latencia baja. El pipeline etiquetado es any-to-any y soporta 18 idiomas, entre ellos el castellano. El soporte en MLX-VLM está, según la model card, aún en progreso, aunque ya se documentan comandos de uso para ASR, TTS y chat de voz a voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia LFM3 de Liquid AI; modelo any-to-any de audio con códec/tokenizador de audio propio) |
| Parametros totales | 1.977.548.032 (~1,98 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (sin cuantizar; checkpoint original en BF16) |
| Idiomas soportados | en, ar, da, de, el, fi, fr, he, it, ja, ko, nl, pl, pt, es, sv, tr, zh (18 idiomas) |
| Licencia | LFM Open License v1.0 (lfm1.0, licencia "other") |
| Formato de pesos | safetensors (MLX), BF16 |

## Arquitectura y entrenamiento

La model card de este repositorio no detalla la arquitectura interna; remite a la model card del modelo base, LFM3-Audio-2B. Por la información disponible, se trata de un modelo any-to-any de audio que emplea un tokenizador/códec de audio (`audio_tokenizer/`, ~0,15 GB) para convertir audio en tokens discretos y generar audio de salida muestreando con `audio_temperature=1.0`, `audio_top_k=128` y `audio_repetition_penalty=1.1` (valores por defecto en `generation_config.json`). No se ha publicado información sobre el número de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO en los datos proporcionados.

Esta versión MLX es una conversión directa del checkpoint original: los pesos se mantienen en BF16 y el códec de audio es el original, sin cuantización adicional, para su ejecución en Apple Silicon mediante la librería MLX.

## Capacidades

- Reconocimiento de habla (ASR): transcribe audio de entrada mediante prompts de sistema como "Perform ASR in English", con temperatura 0 para máxima determinismo.
- Síntesis de voz (TTS): genera audio a partir de texto, con control de idioma y voz mediante el prompt de sistema (por ejemplo, "Perform TTS in American English using a female voice").
- Conversación de voz a voz: acepta audio de entrada y responde con audio, pudiendo intercalar texto y audio en la salida ("Respond with interleaved text and audio").
- Salida multimodal any-to-any: pipeline etiquetado como any-to-any en HuggingFace.
- Soporte multilingüe: 18 idiomas, incluidos castellano, inglés, chino, japonés, coreano, árabe, alemán, francés e italiano.
- Voces y prompts de sistema adicionales documentados en la model card del modelo base (no incluidos en los datos de este repositorio).
- No hay información disponible sobre tool calling, agentes ni capacidades de razonamiento de texto general.

## Casos de uso

- Transcripción local y privada de audio: ejecutando ASR en un Mac con Apple Silicon, se pueden transcribir grabaciones o notas de voz sin enviar datos a la nube, adecuado para sectores con requisitos de confidencialidad.
- Síntesis de voz para aplicaciones de escritorio: generación de locuciones o respuestas habladas en 18 idiomas directamente en el dispositivo, útil para lectores de pantalla o narración de contenidos.
- Asistentes de voz conversacionales: el modo de chat de voz a voz permite construir agentes que escuchan y responden hablando, con salida intercalada de texto y audio para interfaces multimodales.
- Prototipado on-device de productos de voz: el tamaño reducido (~2 B de parámetros, ~4 GB en disco) permite iterar en portátiles Mac sin infraestructura de GPU.
- Subtitulado y accesibilidad: transcripción automática de reuniones o vídeos con soporte de castellano y otros idiomas, con temperatura 0 para resultados reproducibles.
- Generación de contenido audio multilingüe: producción de pistas de voz en varios idiomas desde un mismo modelo, seleccionando idioma y voz mediante prompts de sistema.
- Integración en apps nativas de Apple Silicon: el formato MLX facilita el despliegue dentro del ecosistema MLX/MLX-VLM para aplicaciones macOS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada: los pesos ocupan 3,96 GB en BF16, más 0,15 GB del tokenizador de audio; en la práctica se recomienda un Mac con al menos 8-16 GB de memoria unificada para dejar margen al códec y a la generación.
- GPU recomendadas: al ser un checkpoint MLX, requiere Apple Silicon (M1/M2/M3/M4). No está pensado para GPUs NVIDIA en este formato; para CUDA habría que usar el checkpoint original LFM3-Audio-2B (requisitos no disponibles).
- Consumer hardware: cabe en portátiles Apple Silicon de gama base con 8 GB de memoria unificada, aunque con margen limitado.
- Despliegue: MLX y MLX-VLM (soporte en progreso según la model card); la model card documenta comandos `python -m mlx_vlm.generate` para ASR, TTS y voz a voz. También están disponibles la API de Liquid AI (console.liquid.ai) y el playground (playground.liquid.ai). No hay información sobre soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible. La generación de voz usa por defecto `audio_temperature=1.0`, `audio_top_k=128` y `audio_repetition_penalty=1.1`.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidades | Formato/plataforma | Licencia |
|---|---|---|---|---|
| LFM3-Audio-2B-MLX-bf16 (este) | ~1,98 B | ASR, TTS, voz a voz (any-to-any) | MLX safetensors BF16 (Apple Silicon) | LFM Open License v1.0 |
| LFM3-Audio-2B (modelo base) | ~1,98 B | ASR, TTS, voz a voz (any-to-any) | Checkpoint original (plataforma no especificada en los datos) | LFM Open License v1.0 |
| Alternativas de audio any-to-any de tamaño similar | no disponible | no disponible | no disponible | no disponible |

No hay información suficiente en los datos proporcionados para comparar con otros modelos de audio de terceros (por ejemplo, Whisper, Kokoro o Qwen-Audio) con datos concretos de parámetros o rendimiento.

## Limitaciones y advertencias

- El soporte en MLX-VLM está en progreso: la model card indica que se actualizará cuando una release lo soporte, por lo que los comandos documentados pueden no funcionar con versiones actuales de la librería.
- No hay datos públicos de benchmarks ni de calidad de ASR/TTS en los materiales disponibles; conviene evaluar el modelo en el dominio concreto antes de producción.
- Los sesgos, la tasa de alucinación y el rendimiento por idioma no están documentados en este repositorio; la model card del modelo base lista voces, idiomas y prompts de sistema que deben consultarse.
- La licencia es "other" (LFM Open License v1.0): hay que revisar el texto de la licencia antes de cualquier uso comercial, ya que puede incluir restricciones.
- La longitud de contexto máxima no está disponible en los datos proporcionados.
- La generación de audio depende de parámetros de muestreo específicos (`audio_top_k=128`, `audio_repetition_penalty=1.1`); desviarse de ellos puede degradar la calidad de la voz.
- Restricción de plataforma: el formato MLX limita el despliegue a hardware Apple Silicon.

## Enlaces

- Modelo MLX: https://huggingface.co/LiquidAI/LFM3-Audio-2B-MLX-bf16
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Audio-2B
- MLX-VLM (repositorio): https://github.com/Blaizzy/mlx-vlm
- Guía de despliegue MLX de Liquid AI: https://docs.liquid.ai/deployment/on-device/mlx
- Documentación LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Blog de LFM3: https://www.liquid.ai/blog/lfm3
- Playground de Liquid AI: https://playground.liquid.ai/
- API de Liquid AI: https://console.liquid.ai/dashboard
