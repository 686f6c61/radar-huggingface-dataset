# laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3

## Resumen

El modelo `laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3` es un sistema de síntesis de voz expresiva desarrollado por LAION, especializado en actuación vocal (voice acting). Se trata de un ajuste fino supervisado (SFT) de la versión v2 del modelo base `moss-tts-local-transformer-4.55b-voice-acting`, que añade control explícito sobre la duración de cada frase, pausas, vocalizaciones (risas, suspiros, etc.) y direcciones de interpretación en lenguaje natural. El modelo resuelve el problema de generar audio de voz con timing preciso y estilos emocionales variados, algo crítico para doblaje, audiolibros y asistentes de voz.

La arquitectura combina un transformer semántico de aproximadamente 4.000 millones de parámetros (36 capas), un transformer local "talker" de unos 550 millones y 12 cabezas LM sobre un tokenizador de audio de 12 codebooks a 12,5 frames por segundo (80 ms por frame). El modelo total tiene 4.129.990.144 parámetros (4,13B), está licenciado bajo CC-BY-4.0 y soporta inglés y alemán. La versión sft3 se entrena sobre 398.282 ejemplos seleccionados de 40 emociones y dimensiones VoiceNet, con 2 épocas y 712 pasos en 32 nodos.

Aunque el control temporal está resuelto (el 100 % de los clips generados quedan dentro de 0,5 s de la duración solicitada), la intensidad emocional sigue siendo limitada: al solicitar percentiles 0,90–0,98 de una emoción, el modelo solo alcanza alrededor de 0,35. Esto se documenta honestamente en el informe técnico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer semántico (36 capas) + transformer local "talker" (~550 M) + 12 cabezas LM sobre tokenizador de audio de 12 codebooks |
| Parámetros totales | 4.129.990.144 |
| Parámetros activos | 4,13 B (no es MoE) |
| Longitud de contexto | No disponible (el tokenizador de audio funciona a 12,5 frames/s; el ejemplo de generación usa 340 frames ≈ 27,2 s) |
| Tipos de cuantización | No disponible (se usa bfloat16 en el ejemplo de inferencia) |
| Idiomas soportados | Inglés, alemán |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo combina un transformer semántico de 36 capas (~4 B) que procesa la entrada textual y las instrucciones de actuación, con un transformer local "talker" (~550 M) que genera los tokens de audio. La salida pasa por 12 cabezas LM que predicen los 12 codebooks del tokenizador de audio a 12,5 frames por segundo (cada frame 80 ms). El diseño permite controlar la duración exacta de cada frase mediante el campo `Tokens` (objetivo en frames) y las direcciones de producción en lenguaje natural.

El entrenamiento de la ronda 3 (SFT) utilizó 398.282 filas seleccionadas como los ejemplos más fuertes de 40 emociones y dimensiones VoiceNet, con 2 épocas y 712 pasos en 32 nodos. La evaluación se realizó generando 320 clips y midiendo métricas de error de palabra (WER), error de duración, porcentaje de clips dentro de 0,5 s de la duración solicitada y tasa de acierto de explosiones vocales. Se probaron técnicas de alineación como GRPO, DPO con pares contrastivos y DPO con pares simétricos condicionados, pero ninguna mejoró la intensidad emocional; solo los adaptadores LoRA específicos por emoción han mostrado algún efecto.

## Capacidades

- Generación de voz expresiva con control de emociones (40 emociones) y dimensiones VoiceNet.
- Control de tiempo fino: duración por frase, pausas y explosiones vocales (risas, suspiros, jadeos, etc.) con sus longitudes.
- Direcciones de actuación en lenguaje natural (p. ej., "habla en susurros", "con enfado") mediante el campo `Instruction` con `GENERAL:` y `SCRIPT:`.
- Soporte de voz de referencia: se puede adjuntar una grabación de la voz objetivo o usar un nombre de voz conocido (`Speaker: <name>`).
- Multilingüe: inglés y alemán a 48 kHz de tasa de muestreo nativa.
- No soporta tool calling ni razonamiento multi-paso; es un modelo puramente generativo de audio.

## Casos de uso

- **Doblaje y locución**: el control fino de duración y emociones permite ajustar la interpretación a las limitaciones de sincronía labial, con una tasa de error de duración mediana de 0,080 s y el 100 % de los clips dentro de 0,5 s de lo pedido.
- **Audiolibros narrados con estilo**: se pueden generar capítulos con un tono consistente mediante el uso de adaptadores de voz y emociones, manteniendo la misma voz de referencia.
- **Asistentes de voz con personalidad**: la capacidad de aplicar direcciones de actuación en línea permite crear respuestas con matices emocionales (empatía, urgencia, sorpresa) en aplicaciones de atención al cliente o asistentes personales.
- **Videojuegos y personajes ficticios**: el modelo está diseñado para personajes de fantasía (orcos, dragones, hadas, goblins) y admite gritos, susurros y explosiones vocales, ideal para líneas de diálogo en juegos.
- **Generación de contenido para podcasts**: permite producir narraciones con inflexiones emocionales variadas a partir de un guion, sin necesidad de un actor de voz.
- **Prototipado de experiencias de voz**: los desarrolladores pueden generar rápidamente muestras de voz con distintas emociones y duraciones para pruebas de usuario o demos, sin grabar audio real.

## Benchmarks y rendimiento

La evaluación se realizó generando 320 clips y comparando la ronda 3 con la ronda 2. Los resultados se presentan en la siguiente tabla (datos de la model card):

| Métrica | Ronda 2 | Ronda 3 |
|---|---|---|
| Tasa de error de palabra (WER) en prompts con direcciones | 0,447 | 0,099 |
| Error de duración (mediana) | 0,100 s | 0,080 s |
| Clips dentro de 0,5 s de la duración solicitada | 92,8 % | 100 % |
| Tasa de acierto de explosiones vocales | 0,516 | 0,666 |

No se han publicado resultados comparativos con otros modelos TTS en la información disponible. La intensidad emocional, sin embargo, es limitada: al solicitar percentiles 0,90–0,98 de una emoción, el modelo alcanza aproximadamente 0,35.

## Requisitos de hardware

- **VRAM estimada**: con 4,13 B de parámetros en bfloat16, el modelo requiere aproximadamente 8,3 GB de VRAM solo para los pesos, más overhead de activaciones y atención. Se recomienda una GPU con al menos 16 GB para inferencia cómoda, aunque puede caber en una RTX 4090 (24 GB) o A100 (40 GB).
- **GPU recomendadas:** NVIDIA A100, H100, RTX 4090, RTX 3090, o cualquier GPU con suficiente VRAM y soporte de bfloat16.
- **Despliegue:** se usa con la librería `transformers` con `trust_remote_code=True`. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que es un modelo TTS con código personalizado.
- **Latencia y throughput:** no se proporcionan datos específicos. La generación de audio se realiza frame a frame (340 frames en el ejemplo), lo que sugiere una latencia proporcional al número de frames generados.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo es parte de una línea propia de LAION (MOSS-TTS) y no se ofrecen comparaciones con alternativas como XTTS, Bark, o Tortoise-TTS en las fuentes consultadas. Se indica "no disponible".

## Limitaciones y advertencias

- **Intensidad emocional limitada:** el modelo no alcanza los percentiles altos de intensidad emocional solicitados (llega a ~0,35 cuando se pide 0,90–0,98). Los adaptadores LoRA por emoción son la única vía que ha mostrado mejora, pero no son selectivos para mezclas sin supervisión.
- **Dependencia del formato de entrada:** el prompt debe seguir un esquema fijo con campos obligatorios (`Reference(s)`, `Instruction`, `Tokens`, etc.). Cualquier desviación puede degradar la calidad.
- **Riesgo de alucinación en el texto:** aunque el WER es bajo (0,099), aún existe margen de error en la pronunciación de palabras, especialmente en prompts complejos.
- **Idiomas limitados:** solo inglés y alemán; no soporta otros idiomas.
- **Licencia CC-BY-4.0:** permite uso comercial con atribución, pero requiere citar al autor (LAION). Es necesario revisar las condiciones específicas para uso en productos comerciales.
- **Problemas de implementación:** el proceso de decodificación de los códecs de audio es delicado; si no se usa el decoder del processor correctamente, se puede obtener audio a media velocidad con dos canales, como se advierte en la documentación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3
- Modelo base (v2): https://huggingface.co/laion/moss-tts-local-transformer-4.55b-voice-acting-v2
- Variante SFT+DPO: https://huggingface.co/laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft-dpo
- Repositorio GitHub de la versión anterior: https://github.com/LAION-AI/laion-moss-local-1.5-voice-acting-4.55b
- Manual de condicionamiento (v2): https://github.com/LAION-AI/moss-voiceacting-manual
