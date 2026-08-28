# laion/moss-va-sft3-voicenet-lora-adapters

## Resumen

El repositorio `laion/moss-va-sft3-voicenet-lora-adapters` contiene un conjunto de 16 adaptadores LoRA de rango 16, diseñados como pilotos para el control expresivo de la voz en el modelo de texto a voz (TTS) `laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3`. Cada adaptador se entrena sobre el 1 % extremo (superior o inferior) de un corpus anotado de 3,1 millones de utterances, a lo largo de un eje específico de las 57 dimensiones de VoiceNet, un espacio de control de la interpretación vocal. El objetivo es permitir ajustes finos y direccionales en la entrega expresiva, como intensidad de enfado, susurro o tensión, sin modificar el modelo base completo.

Desarrollado por LAION, este paquete forma parte de una línea de investigación sobre condicionamiento fino en TTS expresivo. Es importante señalar que estos adaptadores no han sido evaluados formalmente (sin pruebas de escucha ni métricas automáticas) y que no deben fusionarse con el modelo base debido a que las cabezas de audio están atadas a los embeddings (weight-tied). Se presentan como material de investigación, no como componentes listos para producción.

El repositorio tiene un tamaño de 2,2 GB, está licenciado bajo Apache 2.0 y soporta los idiomas inglés y alemán. La carga se realiza mediante la librería PEFT, cargando cada adaptador por separado sin merge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (rank 16) sobre transformer local TTS de 4,55B parámetros (modelo base) |
| Parametros totales | No disponible (el repo contiene 16 adaptadores LoRA; el modelo base tiene 4,55B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo TTS, no generativo de texto) |
| Tipos de cuantizacion | No disponible (los adaptadores se distribuyen en safetensors, el modelo base puede cargarse en bfloat16) |
| Idiomas soportados | en, de |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT LoRA) |

## Arquitectura y entrenamiento

Los adaptadores se entrenan sobre el checkpoint `laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3`, la tercera ronda supervisada de la línea de voice-acting de LAION. Cada LoRA de rango 16 se entrena sobre el 1 % superior (o inferior, en los ejes bidireccionales) de un corpus de 3,1 millones de utterances anotadas, tras un filtro de calidad. El conjunto cubre 16 de las 20 colas extremas posibles sobre 16 ejes candidatos de las 57 dimensiones de VoiceNet. El entrenamiento se realizó con la librería PEFT y los pesos se guardan en formato safetensors.

Una característica crítica de esta arquitectura es que los adaptadores apuntan a `audio_lm_heads.0…11`, y en este modelo dichos tensores están atados a `audio_embeddings.N.weight` (weight-tied). Por ello, fusionar los adaptadores (merge) corrompe la tabla de embeddings de audio y degrada el modelo. La recomendación explícita es cargarlos como adaptadores PEFT sin fusionar. El factor de escala por defecto es `alpha / r = 32/16 = 2.0`, y se puede modular multiplicando el scaling para controlar la intensidad del efecto (w=0 reproduce el modelo base, w=1 el adaptador tal como se entrenó, w>1 extrapola).

## Capacidades

- Control fino de la expresividad vocal a lo largo de ejes específicos de VoiceNet (p. ej., intensidad de enfado, susurro, tensión, variabilidad).
- Ajuste direccional de la entrega: cada adaptador empuja una dimensión concreta hacia su extremo alto o bajo.
- Compatibilidad con el formato de prompt v3 del proyecto MOSS (instrucciones generales y guion con tiempos, pausas y dirección de entrega).
- Posibilidad de apilar con el adaptador de preferencia general `laion/moss-va-sft3-dpo-lora-p2` (aunque esta combinación no ha sido evaluada).
- Soporte multilingüe limitado a inglés y alemán.
- Control de escala del efecto mediante el factor de scaling de PEFT, sin necesidad de reentrenar.

## Casos de uso

- **Doblaje y locución de personajes**: un estudio puede cargar el adaptador `S_RANT_high` para forzar una entrega de enfado intenso en diálogos de videojuegos o animación, manteniendo el resto de parámetros del modelo base.
- **Producción de audiolibros con matices emocionales**: el adaptador permite modular la tensión o la suavidad de la narración según el capítulo, usando el control de scaling para graduar la intensidad sin regenerar el audio completo.
- **Investigación en síntesis de voz expresiva**: los adaptadores sirven como herramienta para estudiar cómo cada dimensión de VoiceNet afecta a la percepción emocional, permitiendo A/B tests controlados entre el modelo base y el adaptado.
- **Generación de contenido para asistentes de voz con personalidad**: se puede elegir un adaptador que empuje hacia una voz más enérgica o más susurrada, adaptando la respuesta del asistente al contexto de uso.
- **Creación de bancos de voces sintéticas para doblaje automático**: combinando varios adaptadores (sin fusionar, activándolos secuencialmente) se pueden generar variantes de una misma voz con diferentes matices expresivos.
- **Evaluación de calidad en TTS**: al no haber sido evaluados formalmente, estos adaptadores pueden usarse en pipelines de evaluación comparativa para medir el impacto de cada dimensión en métricas objetivas y subjetivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los adaptadores no han sido evaluados (sin pruebas de escucha, sin scoring automático, sin A/B contra el modelo base). Por tanto, no se dispone de datos de rendimiento objetivos.

## Requisitos de hardware

- El modelo base tiene 4,55B parámetros; en bfloat16 ocupa aproximadamente 9,1 GB de VRAM solo en pesos, más overhead de activaciones y memoria del optimizador si se entrena.
- Para inferencia con el modelo base y un adaptador LoRA, se recomienda una GPU con al menos 12-16 GB de VRAM (p. ej., RTX 3090/4090, A10, A100). En cuantización de 8 bits podría caber en GPUs de 8 GB, pero no hay datos oficiales.
- Los adaptadores en sí son ligeros (16 LoRAs de rango 16, 2,2 GB en total para los 16), pero deben cargarse junto al modelo base.
- Opciones de despliegue: la carga se realiza con `transformers` + `peft` (ejemplo en la model card). No se menciona soporte para vLLM, llama.cpp u Ollama; al ser un modelo TTS con código remoto, el despliegue estándar es mediante Python con `trust_remote_code=True`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| `laion/moss-va-sft3-voicenet-lora-adapters` (este) | 16 LoRAs rank 16 para TTS expresivo | No disponible (adaptadores) | No aplica | Apache 2.0 | Pilot, no evaluado, no fusionar |
| `laion/moss-va-sft3-voice-loras` | 500 LoRAs rank 16, uno por perfil de voz sintética | No disponible | No aplica | Apache 2.0 | Entrenado sobre ~2.150 clips por voz, todas las emociones y dimensiones |
| `laion/moss-voicenet-dimension-loras` | 100 LoRAs rank 32, uno por dimensión VoiceNet (alto/bajo) | No disponible | No aplica | Apache 2.0 | Para el base v2 (no SFT3), cubre las 57 dimensiones |

La comparativa se limita a otros adaptadores de LAION para la misma familia de modelos base. No se dispone de comparación con modelos TTS completos de otros proveedores.

## Limitaciones y advertencias

- **No fusionar los adaptadores**: el merge escribe el delta LoRA en la tabla de embeddings de audio (weight-tied) y degrada el modelo. Medido: tras un merge, ambos tensores cambiaron exactamente en `6.103515625e-05`.
- **No evaluados**: no hay pruebas de escucha, ni métricas automáticas, ni comparación A/B contra el modelo base. Todo lo descrito en la model card se refiere a los datos de entrenamiento, no al comportamiento real.
- **Compatibilidad restringida**: los adaptadores solo funcionan con el checkpoint base `laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3`. No son compatibles con v2 ni v1 (el formato de prompt cambió entre rondas).
- **Idiomas limitados**: solo inglés y alemán.
- **Riesgo de alucinación o artefactos**: al no estar evaluados, podrían producir audio con degradaciones no detectadas, especialmente al extrapolar con w > 1.
- **Uso en producción desaconsejado**: la model card los califica explícitamente como material de investigación.
- **Apilamiento no evaluado**: combinar con el adaptador DPO (`moss-va-sft3-dpo-lora-p2`) no ha sido probado y podría dar resultados inesperados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/laion/moss-va-sft3-voicenet-lora-adapters
- Modelo base: https://huggingface.co/laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3
- Adaptador de preferencia general: https://huggingface.co/laion/moss-va-sft3-dpo-lora-p2
- Adaptadores de vocal bursts: https://huggingface.co/laion/vocal-burst-lora-adapters
- Informe técnico del proyecto MOSS: https://projects.laion.ai/laion-moss-local-1.5-voice-acting-4.55b/technical-report.html
- Manual de condicionamiento VoiceNet (GitHub): https://github.com/LAION-AI/moss-voicenet-manual
- Página del manual (site): https://github.com/LAION-AI/moss-voicenet-manual/tree/main/site
- Proyecto de evolución de LoRAs VoiceNet: https://projects.laion.ai/moss-voicenet-lora-evolution/
- Repositorio de 500 voice adapters: https://huggingface.co/laion/moss-va-sft3-voice-loras
- Repositorio de 100 dimension LoRAs: https://huggingface.co/laion/moss-voicenet-dimension-loras
