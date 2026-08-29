# laion/moss-va-sft3-quality-lora-adapters

## Resumen

Este repositorio contiene tres adaptadores LoRA de rango 16 para el modelo de síntesis de voz expresiva `laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3`, desarrollados por LAION. Cada adaptador está entrenado para optimizar un eje de calidad perceptual distinto: autenticidad (genuineness), integración de vocalizaciones no verbales (vocal-burst blend) y estética (según el eje ESTH de VoiceNet). El objetivo es permitir ajustar finamente la calidad percibida de la voz sintetizada sin necesidad de reentrenar el modelo base.

La relevancia de estos adaptadores radica en que abordan un problema específico en TTS expresivo: la calidad subjetiva de la actuación vocal. En lugar de un único modelo genérico, se ofrecen tres ejes de control independientes, cada uno entrenado sobre el 1 % superior de un corpus de 3.144.739 emisiones anotadas, equilibrado por edad y género. Esto permite a los desarrolladores seleccionar el adaptador según la característica que deseen potenciar en sus aplicaciones de voz.

El modelo base es un transformer de 4.550 millones de parámetros con arquitectura de audio_lm_heads, y los adaptadores se cargan mediante PEFT sin necesidad de fusionarlos en los pesos del modelo base. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre transformer MOSS TTS 4.55B |
| Parametros totales | No disponible (adaptadores LoRA rango 16, alpha 32) |
| Parametros activos | No aplica (adaptadores LoRA, no MoE) |
| Longitud de contexto | 1024 tokens (longitud de empaquetado en entrenamiento) |
| Tipos de cuantizacion | No aplica (adaptadores PEFT en safetensors) |
| Idiomas soportados | en, de |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT LoRA) |

## Arquitectura y entrenamiento

Los adaptadores se entrenaron sobre el modelo base `laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3`, congelado en bf16. La arquitectura LoRA utiliza rango 16, alpha 32, dropout 0.05 y sin bias. Los módulos objetivo incluyen las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`), las capas de feed-forward (`gate_proj`, `up_proj`, `down_proj`), las capas de atención cruzada (`c_attn`, `c_proj`), las capas de entrada/salida (`fc_in`, `fc_out`) y las cabezas de audio (`audio_lm_heads.0…11`).

El entrenamiento se realizó con AdamW (lr 1e-4, betas 0.9/0.95, sin weight decay, grad-clip 1.0), con programación de tasa de aprendizaje coseno y 10 % de warmup. Se usaron 5 épocas, batch de 4, longitud de empaquetado de 1024 tokens, y pérdida de entropía cruzada de siguiente token solo en el segmento de asistente, con canales de audio ponderados como `32 / n_vq`. Cada adaptador se entrenó durante 15.000 pasos sobre 12.000 filas seleccionadas del corpus.

Una observación notable del entrenamiento: el adaptador `esthetics_high` alcanzó una pérdida significativamente menor (3.80 frente a 5.04) que los otros dos, lo que sugiere que la cola estética es una distribución más fácil de modelar.

## Capacidades

- Control de calidad perceptual en TTS expresivo: tres ejes independientes (autenticidad, integración de vocalizaciones y estética).
- Ajuste fino selectivo: cada adaptador se puede cargar por separado o combinarse con otros adaptadores de la serie MOSS VA SFT3.
- Escalado del efecto: permite ajustar la intensidad del adaptador multiplicando el factor `scaling` de PEFT (alpha/r = 2.0), donde `w = 0` es el modelo base y `w = 1` es el adaptador completo.
- Compatibilidad con el sistema de prompts v3 del modelo base, incluyendo instrucciones con etiquetas `GENERAL:` y `SCRIPT:` para control de duración, pausas y vocalizaciones.
- Soporte multilingüe limitado a inglés y alemán.
- Integración con el ecosistema PEFT/Hugging Face Transformers mediante `PeftModel`.

## Casos de uso

- Producción de audiolibros: el adaptador `genuineness_high` puede aplicarse para que las narraciones suenen más auténticas y menos actuadas, mejorando la experiencia de escucha en audiolibros de larga duración.
- Doblaje de videojuegos: `blend_high` es adecuado para personajes que necesitan vocalizaciones naturales (suspiros, risas, gemidos) integradas de forma fluida en el diálogo, mejorando la inmersión.
- Publicidad y locución comercial: `esthetics_high` puede utilizarse para producir voces con mayor atractivo estético percibido, útil en anuncios y contenido de marca.
- Asistentes de voz con personalidad: combinando adaptadores de emoción y voz de la serie MOSS VA SFT3, se pueden crear asistentes con características vocales específicas y calidad perceptual optimizada.
- Contenido educativo y e-learning: la capacidad de ajustar la autenticidad y la estética de la voz puede hacer que las lecciones grabadas sean más atractivas y naturales.
- Localización de contenido multimedia: al soportar inglés y alemán, permite generar voces de calidad para doblaje o narración en estos idiomas, con control fino sobre la calidad percibida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card indica explícitamente que los adaptadores no han sido evaluados: "No listening test, no automatic scoring, no A/B against the bare base has been run." Por tanto, no se dispone de métricas objetivas de calidad de voz (MOS, WER, etc.) ni comparativas con otros sistemas.

## Requisitos de hardware

- El modelo base tiene 4.550 millones de parámetros, por lo que en bf16 requiere aproximadamente 9,1 GB de VRAM solo para los pesos.
- Los adaptadores LoRA añaden un overhead mínimo (el repositorio ocupa 0,4 GB en total para los tres adaptadores).
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) o superiores para inferencia con el modelo base completo.
- En GPUs de consumo con 16 GB (RTX 4080, RTX 3090) es posible ejecutar el modelo con cuantización del modelo base, aunque los adaptadores PEFT requieren que el modelo base se cargue en precisión completa o bf16.
- Opciones de despliegue: Hugging Face Transformers con PEFT, vLLM (si se fusionan los adaptadores, aunque el modelo card advierte explícitamente que no se deben fusionar), o mediante la API de Hugging Face Inference Endpoints.
- La latencia dependerá del hardware; para un modelo de 4.55B en una A100, se espera una latencia de decodificación de audio en tiempo real o mejor, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| `laion/moss-va-sft3-quality-lora-adapters` (este) | LoRA r16 sobre 4.55B | 1024 | Apache 2.0 | Calidad perceptual (3 ejes) |
| `laion/moss-va-sft3-emotion-loras` | LoRA r16 sobre 4.55B | 1024 | Apache 2.0 | 40 emociones |
| `laion/moss-va-sft3-voice-loras` | LoRA r16 sobre 4.55B | 1024 | Apache 2.0 | 500 perfiles de voz |
| `laion/moss-va-sft3-vocal-burst-lora-adapters` | LoRA r16 sobre 4.55B | 1024 | Apache 2.0 | 71 tipos de vocalización |
| `laion/moss-va-sft3-voicenet-lora-adapters` | LoRA r16 sobre 4.55B | 1024 | Apache 2.0 | 17 dimensiones VoiceNet |

Estos adaptadores son complementarios y pueden combinarse entre sí, ya que todos se cargan como adaptadores PEFT sobre el mismo modelo base. No se dispone de comparativas con sistemas TTS comerciales como ElevenLabs o OpenAI TTS en términos de calidad percibida.

## Limitaciones y advertencias

- **No fusionar los adaptadores**: el modelo card advierte explícitamente que no se deben fusionar los pesos LoRA con el modelo base, porque `audio_lm_heads.N.weight` está atado a `audio_embeddings.N.weight`. Una fusión escribiría el delta en la tabla de embeddings de audio, corrompiendo el modelo.
- **Sin evaluación**: los adaptadores no han sido sometidos a pruebas de escucha, puntuación automática ni comparativas A/B contra el modelo base. Su eficacia no está verificada empíricamente.
- **Idiomas limitados**: solo inglés y alemán. No se ha evaluado su comportamiento en otros idiomas.
- **Sesgos potenciales**: el corpus de entrenamiento se equilibró por edad y género, pero no se menciona equilibrio por otros factores (acento, dialecto, contexto cultural), lo que podría introducir sesgos en la calidad percibida.
- **Riesgo de sobreajuste**: al entrenar sobre el 1 % superior del corpus, los adaptadores podrían especializarse en características muy específicas que no generalicen bien a voces o estilos fuera de esa distribución.
- **Dependencia del modelo base**: estos adaptadores solo funcionan con el modelo base específico `laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3`; no son portables a otros modelos TTS.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/laion/moss-va-sft3-quality-lora-adapters
- Modelo base: https://huggingface.co/laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3
- Adaptadores de emoción: https://huggingface.co/laion/moss-va-sft3-emotion-loras
- Adaptadores de voz: https://huggingface.co/laion/moss-va-sft3-voice-loras
- Adaptadores de vocalización: https://huggingface.co/laion/moss-va-sft3-vocal-burst-lora-adapters
- Adaptadores VoiceNet: https://huggingface.co/laion/moss-va-sft3-voicenet-lora-adapters
- Adaptador DPO: https://huggingface.co/laion/moss-va-sft3-dpo-lora-p2
- Manual y estudios: https://projects.laion.ai/moss-voiceacting-manual/site/index.html
- Repositorio GitHub del manual: https://github.com/LAION-AI/moss-voiceacting-manual
- LAION: https://laion.ai/
