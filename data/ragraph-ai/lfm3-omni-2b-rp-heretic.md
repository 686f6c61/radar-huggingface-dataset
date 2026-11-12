# ragraph-ai/LFM3-Omni-2B-RP-heretic

## Resumen

LFM3-Omni-2B-RP-heretic es un ajuste fino (finetune) del modelo multimodal LiquidAI/LFM3-Omni-2B, desarrollado por el usuario ragraph-ai y orientado a roleplay conversacional en inglés con personajes (character cards). Se trata de una variante "abliterada" mediante la herramienta Heretic, que elimina parcialmente los mecanismos de rechazo del modelo base para producir respuestas sin censura, incluyendo ficción explícita, violenta u ofensiva bajo petición. Mantiene intacta toda la pila "omni" del modelo original: visión, audio de entrada y salida de voz, con los codificadores y el decodificador de habla bit a bit idénticos al base.

El modelo tiene 2.166.928.384 parámetros (aproximadamente 2,17 mil millones) y se distribuye tanto en formato BF16 para Transformers como en cuantizaciones GGUF para llama.cpp, con un tamaño de repositorio de 13,8 GB. Está pensado para despliegue en el borde (edge), incluyendo teléfonos y máquinas con poca RAM, gracias a cuantizaciones que van desde 1,10 GB (Q4_K_M) hasta 3,47 GB (BF16 GGUF).

Su relevancia radica en que combina un modelo omni pequeño con una personalización agresiva para roleplay sin restricciones, algo poco habitual en modelos de este tamaño con capacidades de audio y visión. La licencia es lfm1.0 (etiquetada como "other" en Hugging Face), lo que impone restricciones adicionales al uso comercial que deben revisarse antes de cualquier despliegue productivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3-Omni de Liquid AI; familia LFM3, transformer multimodal any-to-any) |
| Parametros totales | 2.166.928.384 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | Entrenado hasta 8K tokens de conversación; el modelo base soporta 32K; 16K recomendado como valor por defecto |
| Tipos de cuantizacion | BF16 (Transformers), Q4_K_M, Q6_K, Q8_0, BF16 (GGUF); mmproj en Q8_0 y BF16 |
| Idiomas soportados | Inglés (en) |
| Licencia | lfm1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (BF16), GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-Omni-2B, un modelo de la familia LFM3 de Liquid AI con pipeline any-to-any, es decir, capaz de procesar y generar múltiples modalidades (texto, imagen, vídeo, audio y habla). El ajuste fino de ragraph-ai se realizó sobre el checkpoint completo, pero los codificadores de visión y audio, el decodificador de habla y el códec se mantienen bit a bit idénticos al modelo base, según indica la model card. Esto implica que las capacidades multimodales provienen íntegramente del modelo original y el finetune solo altera el comportamiento conversacional del modelo de lenguaje.

El entrenamiento consistió en un ajuste para chat de roleplay con tarjetas de personaje (character cards) en inglés, con system prompts que incluyen persona, escenario y diálogo de ejemplo. Sobre esa base se aplicó una ablación de rechazo mediante Heretic, en concreto el "trial 105" (fuerte), más agresivo que el "trial 97" (ligero) usado en la variante LFM3-Omni-2B-RP. Tras la ablación se rehizo la "reparación de habla" (speech repair) sobre el resultado. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO. El modelo es no razonador (non-reasoning): cada respuesta comienza con un bloque `<think></think>` vacío que debe ignorarse.

## Capacidades

- Generación de texto conversacional para roleplay en inglés, con soporte de tarjetas de personaje (persona, escenario, diálogo de ejemplo).
- Comprensión de imágenes y vídeo (visión), heredada del modelo base.
- Reconocimiento automático de habla (ASR) en inglés, mediante el proyector multimodal `mmproj`.
- Síntesis de voz (TTS) a 24 kHz en formato WAV, con opción de voz masculina (`--tts-voice male`).
- Entrada y salida multimodal any-to-any: texto, imagen, audio y habla.
- Escritura creativa sin censura: ficción explícita, violenta u ofensiva bajo petición.
- Integración con API compatible con OpenAI a través de `llama-server`.
- Soporte de plantilla de chat ChatML embebida en los GGUF.
- No dispone de modo de razonamiento (non-reasoning); el bloque `<think>` siempre va vacío.
- No se documenta soporte explícito de tool calling o function calling en la información disponible.

## Casos de uso

- Roleplay conversacional con personajes en SillyTavern: el modelo está entrenado específicamente con tarjetas de personaje y plantilla ChatML, y la model card documenta la configuración exacta (prefijo `<|im_start|>assistant\n<think></think>`, stop string `<|im_end|>`, temperatura 0.8, top-p 0.95) para obtener respuestas coherentes y en personaje durante conversaciones multi-turno.
- Ficción interactiva y escritura creativa sin restricciones: adecuado para generar narrativa explícita, violenta u ofensiva bajo petición, con la advertencia de que es solo para adultos y de que el contenido sexual con menores fue filtrado del dataset.
- Descripción de imágenes en local: mediante `llama-mtmd-cli --image foto.jpg` el modelo describe el contenido de una imagen, útil para prototipos de accesibilidad o etiquetado automático en dispositivos con poca VRAM.
- Transcripción de audio (ASR) en inglés: con `llama-mtmd-cli --audio speech.wav` y el system prompt "Perform ASR in English", sirve para dictado o subtitulado ligero en el borde.
- Síntesis de voz para narrativa: con `llama-tts` genera audio WAV a 24 kHz a partir de texto, aprovechable para lectores de ficción o asistentes de voz con personaje.
- Despliegue en teléfonos y máquinas de baja RAM: la cuantización Q4_K_M (1,10 GB) permite ejecutar el modelo en dispositivos móviles o equipos sin GPU dedicada mediante llama.cpp.
- Servicio de chat con API compatible con OpenAI: `llama-server` expone un endpoint `/v1/chat/completions` que facilita integrar el modelo en aplicaciones existentes sin cambiar el cliente.

## Benchmarks y rendimiento

La model card proporciona métricas comparativas entre las dos variantes del autor frente al modelo base, no benchmarks estándar (MMLU, HumanEval, GSM8K, etc.):

| Métrica | Base (LFM3-Omni-2B) | LFM3-Omni-2B-RP | LFM3-Omni-2B-RP-heretic |
|---|---|---|---|
| Rechazos en 100 peticiones dañinas (keyword) | 99 | 11 | 5 |
| Rechazos en 100 peticiones dañinas (classifier) | 98 | 17 | 7 |
| Win rate de juez de roleplay vs base | — | 61,5% | 49,0% |
| Rechazos fuera de personaje en 300 respuestas de roleplay | — | 0 | 0 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,10 GB con Q4_K_M, 1,43 GB con Q6_K, 1,85 GB con Q8_0 y 3,47 GB con BF16 GGUF; el checkpoint BF16 para Transformers ocupa 4,3 GB.
- El proyector multimodal añade 0,51 GB (Q8_0) o 0,95 GB (BF16) adicionales cuando se usan visión, audio o habla.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; por tamaño, cabe en cualquier GPU consumer con al menos 4-6 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060) usando cuantizaciones Q4-Q8.
- Cabe en GPU consumer y en dispositivos móviles con la cuantización Q4_K_M (1,10 GB), según indica la model card.
- Opciones de despliegue: llama.cpp (versión b11960 o superior, primera con soporte de LFM3-Omni), `llama-server`, `llama-mtmd-cli`, `llama-tts`, y Transformers con el checkpoint BF16. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Refusals (keyword/classifier) | Win rate roleplay vs base | Licencia | Formatos |
|---|---|---|---|---|---|---|
| LFM3-Omni-2B-RP-heretic | 2,17B | 8K entrenado / 32K base | 5 / 7 | 49,0% | lfm1.0 | safetensors, GGUF |
| LFM3-Omni-2B-RP | 2,17B | 8K entrenado / 32K base | 11 / 17 | 61,5% | lfm1.0 | safetensors, GGUF |
| LiquidAI/LFM3-Omni-2B (base) | 2,17B | 32K | 99 / 98 | — | lfm1.0 | safetensors |

La comparativa se limita a las variantes del mismo modelo base documentadas en la información disponible; no se han proporcionado datos de otros modelos omni de tamaño similar para comparar.

## Limitaciones y advertencias

- Contenido solo para adultos: el modelo es sin censura y genera ficción explícita, violenta u ofensiva bajo petición; el usuario es responsable de lo que genere.
- El contenido sexual con menores fue filtrado del dataset de entrenamiento y no debe intentarse producir.
- Es un conversador más débil que la variante LFM3-Omni-2B-RP: el win rate de juez de roleplay cae al 49,0% frente al 61,5% de la variante ligera.
- Modelo no razonador: requiere `--reasoning off` en llama.cpp y cada respuesta empieza con `<think></think>` vacío, que debe ignorarse.
- Entrenado en conversaciones de hasta 8K tokens; aunque el base soporta 32K, el rendimiento más allá del contexto de entrenamiento no está garantizado.
- Solo soporta inglés; no se documentan capacidades multilingües.
- Licencia lfm1.0: impone restricciones que deben revisarse antes de uso comercial; la model card no detalla los términos completos.
- Riesgo de alucinación y de desviación de personaje no cuantificado en la información disponible; se recomienda bajar la temperatura a 0,6 si las respuestas derivan.
- Los GGUF contienen solo el modelo de lenguaje; visión, audio y habla requieren el archivo `mmproj` correspondiente.
- Requiere llama.cpp b11960 o superior; versiones anteriores no soportan LFM3-Omni.

## Enlaces

- [Hugging Face: ragraph-ai/LFM3-Omni-2B-RP-heretic](https://huggingface.co/ragraph-ai/LFM3-Omni-2B-RP-heretic)
- [Modelo base: LiquidAI/LFM3-Omni-2B](https://huggingface.co/LiquidAI/LFM3-Omni-2B)
- [Variante ligera: ragraph-ai/LFM3-Omni-2B-RP](https://huggingface.co/ragraph-ai/LFM3-Omni-2B-RP)
- [Heretic (herramienta de ablación de rechazo)](https://github.com/p-e-w/heretic)
- [llama.cpp](https://github.com/ggml-org/llama.cpp)
