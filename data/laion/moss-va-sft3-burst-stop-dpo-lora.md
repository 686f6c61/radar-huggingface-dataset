# laion/moss-va-sft3-burst-stop-dpo-lora

## Resumen

El modelo `laion/moss-va-sft3-burst-stop-dpo-lora` es un adaptador LoRA de rango 16 desarrollado por LAION para el sistema de text-to-speech expresivo `laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3`. Entrenado mediante optimización directa de preferencias (DPO) sobre 14.932 pares de preferencia, corrige dos deficiencias concretas del modelo base: la realización fiel de *vocal bursts* (gritos, risas, suspiros) según la clase solicitada en la entrada, y la detención precisa al final de la línea, evitando que el modelo siga improvisando más allá del guion.

El adaptador es relevante porque aborda problemas comunes en la actuación de voz generada por IA, donde los modelos tienden a ignorar las marcas de expresión no verbal o a prolongar la locución. Los resultados reportados muestran una mejora sustancial en la precisión agrupada sobre 317 pares de evaluación retenidos, pasando de 0,707 a 0,943. El adaptador está diseñado para cargarse mediante PEFT sin fusionar, ya que la fusión destruiría irreversiblemente el modelo base debido al *weight tying* entre las cabezas de salida y las capas de embedding.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) de rango 16 sobre transformer local de 4,55B parámetros |
| Parametros totales | no disponible (repo de 0,6 GB en safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, depende del prompt textual) |
| Tipos de cuantizacion | no disponible (el adaptador se usa en precisión nativa del base) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El modelo base es un transformer local de 4,55B parámetros especializado en actuación de voz. Sobre él se entrena un adaptador LoRA de rango 16 que modifica las capas `audio_lm_heads.0` a `audio_lm_heads.11` y `text_lm_head`. Una particularidad crítica es que estas cabezas de salida están atadas a las matrices de embedding (`tie_weights()`), de modo que fusionar el adaptador en el checkpoint base corrompería el modelo de forma irreversible. Por eso, la carga recomendada es mediante PEFT sin fusión, lo que es acústicamente equivalente a una fusión pero permite ajustar la fuerza del adaptador y apagarlo cuando sea necesario.

El entrenamiento con DPO utiliza cuatro brazos de preferencia: vocal bursts (30 %), detención (25 %), calidad (25 %) y velocidad (20 %). En el brazo de vocal bursts, el 39,5 % de los negativos son *swaps* (cambiar la clase de burst por otra del mismo hablante), lo que obliga al modelo a identificar la clase correcta y no solo la presencia de un burst. El brazo de detención emplea tres estrategias: truncamiento del prompt, fundido a silencio tras la primera frase, y ruido añadido al final. Los controles de calidad y velocidad se mantienen para verificar que no se degradan las capacidades ya existentes.

## Capacidades

- Realización fiel de vocal bursts: el modelo aprende a producir el tipo de burst solicitado (grito, risa, suspiro, etc.) en lugar de otro o silencio.
- Detención precisa al final de la línea: evita que el modelo continúe hablando o improvisando después de completar el guion.
- Mantenimiento de la calidad de voz y la velocidad del habla (verificado mediante controles en el entrenamiento).
- Compatibilidad con PEFT: permite cargar el adaptador sin fusión, con ajuste de intensidad y apagado dinámico.
- Integración con el modelo base MOSS TTS de 4,55B para actuación de voz expresiva.

## Casos de uso

- Actuación de voz para videojuegos: el modelo puede generar líneas con gritos, risas o suspiros según las acotaciones del guion, mejorando la inmersión.
- Audiolibros dramatizados: permite que el narrador realice sonidos no verbales coherentes con la narración y se detenga al final de cada frase sin alargamientos.
- Doblaje automático: al corregir la detención, se evitan solapamientos o tiempos muertos en la sincronización labial.
- Asistentes de voz con personalidad: el adaptador permite que el asistente exprese emociones mediante bursts vocales y termine sus respuestas de forma natural.
- Generación de contenido para redes sociales: producción de clips de voz con expresividad controlada para memes, doblajes de aficionados o anuncios.
- Investigación en TTS expresivo: el adaptador sirve como referencia para estudiar el efecto del DPO en la realización de eventos no verbales y el control de la duración.

## Benchmarks y rendimiento

La model card reporta resultados de precisión por familia de tareas sobre 317 pares de preferencia retenidos, evaluados con el adaptador cargado en cada checkpoint:

| Familia de tarea | n | init | step112 | step336 | step616 | step896 |
|---|---|---|---|---|---|---|
| stop: dos frases | 31 | 0,258 | 0,871 | 0,968 | 0,968 | 1,000 |
| stop: truncado | 31 | 0,613 | 0,935 | 1,000 | 1,000 | 1,000 |
| stop: ruido añadido | 22 | 0,636 | 0,955 | 1,000 | 1,000 | 1,000 |
| burst: clase errónea (swap) | 32 | 0,625 | 0,688 | 0,719 | 0,781 | 0,844 |
| burst: reemplazado por silencio | 27 | 0,407 | 0,481 | 0,667 | 0,815 | 0,815 |
| burst: eliminado | 24 | 0,458 | 0,583 | 0,625 | 0,542 | 0,667 |
| calidad (control) | 95 | 0,979 | 0,979 | 1,000 | 0,979 | 1,000 |
| velocidad (control) | 55 | 0,873 | 0,945 | 0,964 | 1,000 | 1,000 |
| **agrupado** | **317** | **0,707** | 0,855 | 0,905 | 0,918 | **0,943** |

El hallazgo más relevante es que la detención en el caso de dos frases pasó de 0,258 (el modelo prefería activamente seguir hablando) a 1,000 al final del entrenamiento, un cambio que habría quedado oculto en la métrica agrupada. Además, los brazos de detención convergen alrededor del paso 280, mientras que los de bursts alcanzan su máximo más tarde (paso 784), lo que indica que un checkpoint elegido solo por el brazo de detención sería subóptimo.

## Requisitos de hardware

- El adaptador LoRA en sí es ligero (0,6 GB), pero requiere el modelo base de 4,55B parámetros para funcionar.
- Para inferencia en precisión fp16, el modelo base necesita aproximadamente 9 GB de VRAM solo para los pesos, más overhead de activaciones y KV cache; se recomienda una GPU con al menos 16 GB (por ejemplo, RTX 4080, RTX 4090, A10G, A100 40 GB).
- Si se usa cuantización del modelo base (por ejemplo, 4 bits), podría caber en GPUs de 8 GB, pero no hay datos oficiales de compatibilidad del adaptador con cuantización.
- Opciones de despliegue: se puede servir mediante PEFT en frameworks como Transformers + PEFT, o bien integrarse en pipelines de TTS como el demo server de LAION (véase enlaces). También es posible usar vLLM o TGI si se adapta el modelo base, pero no hay documentación específica para este adaptador.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Existen otros adaptadores de la misma serie para el mismo modelo base, aunque no se dispone de datos comparativos de rendimiento entre ellos:

| Adaptador | Enfoque | Diferencia clave |
|---|---|---|
| `laion/moss-va-sft3-burst-stop-dpo-lora` (este) | Vocal bursts + detención | Entrenado con DPO sobre 14.932 pares, con negativos de swap, silencio y excisión para bursts, y tres estrategias de detención |
| `laion/moss-va-sft3-vocal-burst-lora-adapters` | Vocal bursts | Se centra únicamente en la realización de bursts, sin abordar la detención |
| `laion/moss-va-sft3-voicenet-lora-adapters` | Dimensiones de VoiceNet | Ajusta características de la voz (tono, timbre, etc.) según dimensiones de VoiceNet |
| `laion/moss-va-sft3-dpo-lora-p2` | DPO adicional | Entrenado contra el mismo base SFT3, puede cargarse como segundo adaptador, aunque su combinación con este no ha sido evaluada |

No hay benchmarks públicos que comparen estos adaptadores entre sí.

## Limitaciones y advertencias

- **No fusionar el adaptador** en los pesos base bajo ninguna circunstancia: `merge_and_unload()`, `merge_adapter()` o cualquier script de fusión offline destruirá el modelo de forma irreversible debido al *weight tying* entre las cabezas de salida y las embeddings.
- Solo soporta inglés (idioma `en`).
- El adaptador está diseñado exclusivamente para el modelo base `laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3`; usarlo con otros modelos no es compatible.
- No se han evaluado los sesgos o riesgos de alucinación en el habla generada; al ser un adaptador de TTS, podría producir contenido no deseado si el prompt es ambiguo o malicioso.
- La precisión en la familia `burst: excised` es la más baja (0,667), lo que indica que el modelo aún tiene dificultades cuando el burst se elimina por completo del audio de referencia.
- No hay información sobre la robustez del adaptador ante acentos, ruido de fondo o variaciones de habla fuera del dominio de entrenamiento.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/laion/moss-va-sft3-burst-stop-dpo-lora)
- [Adaptadores de vocal bursts (serie)](https://huggingface.co/laion/moss-va-sft3-vocal-burst-lora-adapters)
- [Adaptadores de VoiceNet (serie)](https://huggingface.co/laion/moss-va-sft3-voicenet-lora-adapters)
- [Manual y estudios de MOSS Voice-Acting](https://projects.laion.ai/moss-voiceacting-manual/site/index.html)
- [Servidor de demo de voz (GitHub)](https://github.com/LAION-AI/Humaneness-Voice-Demo-Server/blob/main/README.md)
- [README del manual en GitHub](https://github.com/LAION-AI/moss-voiceacting-manual/blob/main/README.md)
