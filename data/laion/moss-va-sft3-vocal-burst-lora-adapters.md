# laion/moss-va-sft3-vocal-burst-lora-adapters

## Resumen

El repositorio `laion/moss-va-sft3-vocal-burst-lora-adapters` contiene 71 adaptadores LoRA (70 clases específicas de vocal bursts más un adaptador general) diseñados para el modelo base `laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3`, un sistema de text-to-speech expresivo de 4.55 mil millones de parámetros desarrollado por LAION. Estos adaptadores permiten controlar de forma fina la producción de sonidos no verbales como risas, suspiros, jadeos, gemidos, hipidos, bostezos, silbidos o sollozos dentro de la síntesis de voz, algo que los TTS convencionales suelen tratar de forma pobre o inexacta.

El problema que resuelve es la falta de control granular sobre las interjecciones y vocalizaciones no lingüísticas en la generación de voz, un aspecto crítico para doblaje, audiolibros, asistentes conversacionales y producción de contenido multimedia. La relevancia actual radica en que estos adaptadores se integran en el ecosistema MOSS de LAION, que ya incluye adaptadores para emociones, voces sintéticas y calidad, permitiendo combinar múltiples LoRAs sobre un mismo modelo base. La arquitectura es un transformer local con cabezas de audio atadas a las embeddings (weight-tied), y los adaptadores tienen rango 16 con un factor de escala de 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer local (modelo base MOSS TTS 4.55B) con adaptadores LoRA sobre `audio_lm_heads.0…11` |
| Parametros totales | 71 adaptadores LoRA, cada uno de rango 16 (parámetros adicionales no especificados) |
| Parametros activos | No aplica (no es MoE; los adaptadores se cargan sobre el modelo base) |
| Longitud de contexto | No disponible (depende del modelo base; el tokenizador funciona a 12.5 fps, un frame = 80 ms) |
| Tipos de cuantizacion | No especificado (el modelo base soporta bfloat16 y atención SDPA) |
| Idiomas soportados | Inglés (en), Alemán (de) |
| Licencia | Apache 2.0 |
| Formato de pesos | PEFT/LoRA en safetensors (repositorio de 9.8 GB) |

## Arquitectura y entrenamiento

Los adaptadores se entrenaron sobre el modelo base `laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3`, que a su vez deriva de `laion/moss-tts-local-transformer-4.55b-voice-acting-v2`. La arquitectura del modelo base es un transformer local con cabezas de audio que están atadas a las embeddings de audio (weight-tied), es decir, `audio_lm_heads.N.weight` es el mismo tensor que `audio_embeddings.N.weight`. Esta característica es crítica: los adaptadores no deben fusionarse (merge) porque la delta del LoRA se escribiría tanto en la cabeza de salida como en la tabla de embeddings, corrompiendo la representación.

El entrenamiento de los 71 adaptadores se realizó sobre clips etiquetados por clase de vocal burst, con un total de 84.525 pasos de optimizador sin ningún valor no finito de pérdida o gradiente. Cada adaptador tiene rango 16 y un factor de escala `alpha/r = 32/16 = 2.0`. El prompt de entrenamiento sigue el formato v3 del proyecto (hash `073aeb09dc923376`), que incluye campos como `Reference`, `Instruction` (con partes `GENERAL` y `SCRIPT`), `Tokens`, `Quality`, `Sound Event`, `Ambient Sound`, `Language` y `Text`. Los bursts se representan en el script como `(label, D seconds)` y los silencios como `[G seconds pause]`. No se ha realizado evaluación auditiva ni comparación contra el modelo base sin adaptar; la descripción se limita a lo que se entrenó, no a lo que se consigue.

## Capacidades

- Generación de vocal bursts específicos: 70 clases (risa, suspiro, jadeo, gemido, hipido, bostezo, silbido, sollozo, etc.) más un adaptador general para cualquier burst.
- Control fino de la entrega expresiva: permite especificar en el prompt la duración exacta de cada burst (en segundos) y su posición dentro del discurso.
- Integración con el ecosistema MOSS: se puede combinar con adaptadores de emoción, voz y calidad de la misma familia SFT3.
- Ajuste de intensidad mediante el factor de escala del LoRA: multiplicando el `scaling` por un peso `w` (0 = base sin adaptar, 1 = adaptador entrenado, >1 = extrapolación).
- Soporte multilingüe limitado a inglés y alemán, según la configuración del modelo base.
- No soporta tool calling ni funciones de agente; es un modelo puramente generativo de voz.

## Casos de uso

- Doblaje y actuación de voz: un estudio puede cargar el adaptador `chuckle` o `nervous_giggle` para generar risas naturales en diálogos, controlando la duración y la posición exacta dentro de la frase.
- Audiolibros y narración: añadir suspiros, pausas con respiración o bostezos a personajes para aumentar la naturalidad, usando el adaptador general o clases específicas.
- Asistentes conversacionales: integrar el adaptador `sigh` o `gasp` para que un asistente de voz reaccione con expresiones no verbales en contextos de sorpresa o frustración.
- Producción de contenido para redes sociales: generar clips de voz con vocal bursts aislados (por ejemplo, un silbido o un sollozo) para memes o efectos sonoros.
- Investigación en síntesis de voz expresiva: utilizar los adaptadores como base para estudiar el efecto de los bursts en la percepción de naturalidad, combinándolos con otros LoRAs de emoción.
- Localización de videojuegos: adaptar líneas de diálogo con gemidos o jadeos específicos para escenas de acción o combate, manteniendo la coherencia con el estilo del personaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se ha realizado ninguna evaluación auditiva, puntuación automática ni comparación A/B contra el modelo base sin adaptar. Por tanto, no hay datos numéricos de rendimiento (MOS, WER, etc.) que reportar.

## Requisitos de hardware

- No se especifican requisitos de VRAM para los adaptadores en la documentación. El modelo base tiene 4.55 mil millones de parámetros, por lo que se estima que la inferencia requiere al menos 10-12 GB de VRAM en bfloat16 (dependiendo de la longitud de contexto y el batch).
- Los adaptadores LoRA son ligeros (rango 16) y añaden una sobrecarga mínima de memoria, pero deben cargarse junto con el modelo base completo.
- GPU recomendadas: tarjetas con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB, H100) para una inferencia cómoda. No se indica si cabe en GPUs de consumo más modestas.
- Opciones de despliegue: el código de ejemplo usa `transformers` con `AutoModel` y `PeftModel` de la librería `peft`, con atención SDPA. No se mencionan vLLM, llama.cpp u otros motores de inferencia optimizados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Nº adaptadores | Rango | Licencia | Notas |
|---|---|---|---|---|---|
| `laion/moss-va-sft3-vocal-burst-lora-adapters` (este) | MOSS TTS 4.55B SFT3 | 71 (70 clases + 1 general) | 16 | Apache 2.0 | Para SFT3, no fusionar |
| `laion/vocal-burst-lora-adapters` | MOSS TTS 4.55B v2 (no SFT3) | 64 | No especificado | Apache 2.0 | Para v2, seleccionados por evaluación auditiva |
| `laion/moss-va-sft3-emotion-loras` | MOSS TTS 4.55B SFT3 | 40 | No especificado | Apache 2.0 | Adaptadores de emoción, misma familia |

La comparativa se limita a otros adaptadores de la misma familia porque no hay modelos TTS comparables con control de vocal bursts en el mercado abierto. La diferencia clave es la versión del modelo base (SFT3 vs v2) y el método de selección (este conjunto no ha sido evaluado auditivamente, mientras que el de v2 sí).

## Limitaciones y advertencias

- No fusionar los adaptadores: debido al weight-tie entre `audio_lm_heads` y `audio_embeddings`, un merge corrompe la tabla de embeddings. Deben cargarse como adaptadores PEFT sin fusionar.
- Sin evaluación: el autor declara que no se han realizado pruebas auditivas ni automáticas; el comportamiento real de los adaptadores no está verificado.
- Dependencia del formato de prompt: los adaptadores solo funcionan con el formato v3 (hash `073aeb09dc923376`); usarlos con otras versiones del modelo base producirá resultados incorrectos.
- Idiomas limitados: solo inglés y alemán; no se garantiza el funcionamiento en otros idiomas.
- Riesgo de alucinación acústica: al ser un modelo generativo, puede producir bursts no deseados o de baja calidad si el prompt no es explícito.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y los adaptadores dependen de la infraestructura de LAION; se recomienda revisar los términos del modelo base.
- Tamaño del repositorio (9.8 GB) implica una descarga considerable, aunque los adaptadores individuales son pequeños.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/laion/moss-va-sft3-vocal-burst-lora-adapters
- Modelo base: https://huggingface.co/laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3
- Adaptadores de emoción: https://huggingface.co/laion/moss-va-sft3-emotion-loras
- Adaptadores de voz: https://huggingface.co/laion/moss-va-sft3-voice-loras
- Adaptadores de calidad: https://huggingface.co/laion/moss-va-sft3-quality-lora-adapters
- Adaptadores VoiceNet: https://huggingface.co/laion/moss-va-sft3-voicenet-lora-adapters
- Adaptadores de vocal bursts para v2: https://huggingface.co/laion/vocal-burst-lora-adapters
- Manual y estudios: https://projects.laion.ai/moss-voiceacting-manual/site/index.html
- Repositorio GitHub del manual: https://github.com/LAION-AI/moss-voiceacting-manual
- Log de investigación: https://github.com/LAION-AI/Voice-Acting-Pipeline-WIP
- Informe técnico: https://projects.laion.ai/laion-moss-local-1.5-voice-acting-4.55b/technical-report.html
