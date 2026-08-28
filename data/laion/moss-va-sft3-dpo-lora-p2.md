# laion/moss-va-sft3-dpo-lora-p2

## Resumen

`laion/moss-va-sft3-dpo-lora-p2` es un adaptador LoRA de preferencia (DPO) entrenado por LAION sobre el modelo base `laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3`, un transformer de 4.55B parámetros especializado en text-to-speech expresivo y voice-acting. El adaptador, de rango 64 y alpha 128, se publica bajo licencia CC-BY-4.0 y está pensado para mejorar la expresividad emocional y la inteligibilidad de la voz sintetizada, superando al modelo supervisado original en las métricas medidas por el proyecto.

Este checkpoint es el mejor resultado medido hasta la fecha dentro de la línea de investigación de LAION sobre TTS expresivo. Su entrenamiento combinó un corpus de pares de preferencia basado en CFG (86,3 %) con dos familias nuevas de pares (13,7 %) diseñadas para aislar el efecto de la emoción y de la duración en la calidad percibida. El adaptador se integra mediante PEFT sobre el modelo base y se distribuye en formato safetensors, con soporte para los idiomas inglés y alemán.

La relevancia de este modelo radica en que demuestra que el ajuste por preferencias puede mejorar simultáneamente la expresividad emocional y la inteligibilidad (WER) en un sistema TTS, algo que los intentos anteriores de DPO en esta línea no lograban. Es un componente útil para desarrolladores que necesiten voces sintéticas con control fino de emociones, pausas y duraciones, y que busquen un punto de partida validado empíricamente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA rank-64 (alpha 128) sobre transformer de 4.55B parámetros (modelo base `moss-tts-local-transformer-4.55b-voice-acting-v2-sft3`) |
| Parametros totales | 4.55B (modelo base) + adaptador LoRA (repo de 0.5 GB en safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada; el tokenizador de audio opera a 12.5 frames/s y el ejemplo de generación usa hasta 340 frames (≈ 27 s) |
| Tipos de cuantizacion | bfloat16 (en el ejemplo oficial); otras cuantizaciones no documentadas |
| Idiomas soportados | en, de |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors (PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 (alpha 128) entrenado con DPO (Direct Preference Optimization) sobre el modelo base `moss-tts-local-transformer-4.55b-voice-acting-v2-sft3`, que a su vez es un fine-tuning supervisado (SFT-3) de `moss-tts-local-transformer-4.55b-voice-acting-v2`. El modelo base es un transformer local de 4.55B parámetros diseñado para generar tokens de audio a partir de instrucciones textuales detalladas.

El entrenamiento del adaptador utilizó 2.696.421 pares de preferencia. El 86,3 % proviene del corpus CFG que ya había producido el mejor checkpoint anterior (`moss-va-sft3-dpo-lora`), y el 13,7 % restante corresponde a dos familias nuevas:

- `p2_emox` (309.128 pares): varía únicamente la emoción entre la opción elegida y la rechazada, manteniendo el mismo hablante y duraciones similares (dentro del 10 %). Ambas opciones son intensas, pero solo una coincide con la emoción indicada en la instrucción. Cada par se emite dos veces con los roles invertidos.
- `p2_len` (cortado y extendido, ~59.000 pares en total): varía solo la duración, emparejando el mismo clip con una versión truncada al 50–75 % o alargada al 125–150 % de sus frames.

La emoción de cada clip se determina mediante un modelo de 40 cabezas que puntúa la forma de onda real, no la instrucción que la generó. En la familia `p2_emox` el texto se sustituye por `...` para que la preferencia no sea decidible a partir del texto; en `p2_len` el texto completo con marcas de tiempo se mantiene, ya que las marcas son precisamente lo que la opción rechazada viola.

## Capacidades

- Text-to-speech expresivo con control fino de emociones, duración de segmentos, pausas, bursts vocales (risas, suspiros) y direcciones de entrega (por ejemplo, "intensely amused", "warm and open").
- Generación de voz con acentos y estilos definidos por instrucciones en lenguaje natural.
- Soporte para etiquetas de tiempo y duración en el prompt: `[3.9 seconds duration]`, `[0.8 seconds pause]`, `(contented sigh, 0.2 seconds)` y `(clearly amused, warm and open)`.
- Integración con PEFT: el adaptador se carga sobre el modelo base con `PeftModel.from_pretrained`.
- Idiomas: inglés y alemán.
- No incluye capacidades de tool calling, agentes ni razonamiento multimodal; es un modelo puramente generativo de audio.

## Casos de uso

- Doblaje de personajes para animación o videojuegos: el control sobre emociones y duraciones permite interpretar líneas con matices específicos, como risas contenidas o sorpresa intensa, sin necesidad de edición posterior.
- Audiolibros narrados con expresividad: el modelo puede aplicar diferentes emociones a distintos pasajes, mejorando la inmersión frente a voces planas.
- Asistentes de voz con personalidad: se pueden generar respuestas con tono cálido, divertido o serio según el contexto de la conversación.
- Generación de contenido para redes sociales: voces expresivas para vídeos cortos, podcasts o anuncios, con control de la duración para ajustarse a formatos temporales.
- Accesibilidad: lectura de textos con emoción para personas con discapacidad visual, donde la prosodia ayuda a transmitir el significado.
- Investigación en TTS expresivo: sirve como punto de partida para estudiar el efecto del ajuste por preferencias en la calidad percibida y la inteligibilidad, dado que el proyecto publica métricas detalladas.

## Benchmarks y rendimiento

La model card del adaptador incluye una evaluación generativa sobre 80 prompts, comparando el modelo base SFT-3 sin adaptador, dos versiones previas de DPO y el checkpoint actual (paso 5022) junto con un paso intermedio (3906). Las métricas son: reward (puntuación de preferencia), WER (word error rate), emotion pct (percentil de emoción medida), quality (calidad percibida), burst (frecuencia de bursts vocales) y burst hit rate (tasa de acierto de bursts).

| Modelo | reward | WER | emotion pct | quality | burst | burst hit rate |
|---|---|---|---|---|---|---|
| SFT-3, sin adaptador | 0.4584 | 0.0987 | 0.3494 | 0.9127 | 0.3564 | 0.666 |
| + DPO, corpus v1 | 0.4668 | 0.1117 | 0.3518 | 0.9108 | 0.3973 | 0.694 |
| + DPO, corpus v2 (step 3216) | 0.4687 | 0.1094 | 0.3401 | 0.9211 | 0.3929 | 0.709 |
| + DPO, CFG corpus (step 4912) | 0.4708 | 0.0950 | 0.3373 | 0.9235 | 0.4271 | 0.772 |
| **Este adaptador (step 5022)** | **0.4757** | 0.0977 | **0.3541** | 0.9208 | **0.4180** | 0.762 |
| Este adaptador, step 3906 | 0.4744 | **0.0916** | 0.3478 | 0.9231 | 0.4106 | 0.762 |

El checkpoint 5022 logra el reward más alto (0.4757) y el mayor percentil de emoción (0.3541), con un WER (0.0977) ligeramente mejor que el del modelo base supervisado (0.0987), algo que ningún DPO anterior había conseguido. El paso 3906 presenta el mejor WER de todos (0.0916) y la mejor calidad (0.9231), aunque con menor reward.

## Requisitos de hardware

- El modelo base tiene 4.55B parámetros. En bfloat16, su peso ocupa aproximadamente 9.1 GB, más el adaptador LoRA (0.5 GB) y las activaciones durante la generación.
- Se recomienda una GPU con al menos 16 GB de VRAM para inferencia en bfloat16 con margen. Una RTX 4090 (24 GB) o una A100 (40 GB) son opciones adecuadas.
- En GPUs de 12 GB podría caber con cuantización de 8 bits, pero no hay documentación oficial al respecto.
- El ejemplo de uso carga el modelo con `dtype="bfloat16"` y `attn_implementation="sdpa"`, lo que sugiere compatibilidad con attention de escalado dot-product.
- Opciones de despliegue: el ejemplo usa `transformers` con PEFT. No se documentan integraciones con vLLM, llama.cpp u Ollama; al ser un modelo TTS, es probable que el despliegue se realice mediante scripts propios o servicios de inferencia personalizados.
- La generación de 340 frames (≈ 27 s de audio) con `do_sample=True` y `audio_temperature=1.0` implica un proceso autoregresivo sobre tokens de audio; la latencia dependerá de la GPU y de la longitud de la secuencia, pero no se han publicado mediciones oficiales.

## Comparativa con modelos similares

No se dispone de comparativas con otros sistemas TTS expresivos (por ejemplo, StyleTTS2, VITS o XTTS) en la información proporcionada. La única comparación disponible es interna al proyecto, entre el modelo base SFT-3 y los diferentes adaptadores DPO. En esa comparación, este adaptador (step 5022) supera al modelo base en reward (0.4757 vs 0.4584) y en percentil de emoción (0.3541 vs 0.3494), manteniendo un WER similar (0.0977 vs 0.0987). Frente al adaptador CFG anterior (step 4912), mejora el reward y la emoción, aunque con un burst hit rate ligeramente inferior (0.762 vs 0.772).

## Limitaciones y advertencias

- La model card se interrumpe en la sección de limitaciones ("Emotional in..."), por lo que no se dispone del texto completo. Se recomienda consultar el repositorio original para obtener la información completa.
- El modelo solo soporta inglés y alemán; no hay evidencia de funcionamiento en otros idiomas.
- Aunque el WER es bajo (≈ 0.098), no es nulo: pueden producirse errores de inteligibilidad en algunos casos, especialmente con emociones intensas o duraciones extremas.
- El control de emociones se basa en la medición de un modelo externo de 40 cabezas; la correlación entre la emoción percibida y la instrucción no es perfecta, como muestra el percentil de emoción de 0.3541 (lejos de 1.0).
- La licencia CC-BY-4.0 permite uso comercial, pero exige atribución. No se especifican restricciones adicionales sobre el uso de las voces generadas.
- El adaptador está pensado para usarse junto con el modelo base específico `moss-tts-local-transformer-4.55b-voice-acting-v2-sft3`; no es compatible con otros modelos sin reentrenamiento.
- La generación de audio puede producir bursts vocales no deseados o duraciones imprecisas si las etiquetas del prompt no suman correctamente el presupuesto de tokens (segundos × 12.5).

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/laion/moss-va-sft3-dpo-lora-p2
- Modelo base SFT-3: https://huggingface.co/laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3
- Modelo base v2 (sin SFT): https://huggingface.co/laion/moss-tts-local-transformer-4.55b-voice-acting-v2
- Adaptador DPO anterior (CFG corpus): https://huggingface.co/laion/moss-va-sft3-dpo-lora
- Colección de LoRAs de voz: https://huggingface.co/laion/moss-va-sft3-voice-loras
- Colección de LoRAs de emoción: https://huggingface.co/laion/moss-va-sft3-emotion-loras
- Manual de condicionamiento MOSS-VA-v2 (GitHub): https://github.com/LAION-AI/moss-voiceacting-manual
- Manual y estudios (sitio web): https://projects.laion.ai/moss-voiceacting-manual/site/index.html
