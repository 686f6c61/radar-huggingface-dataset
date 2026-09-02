# abhishekgautamm/whisper-tiny-hinglish

## Resumen

Whisper-tiny Hinglish es un ajuste fino del modelo `openai/whisper-tiny` desarrollado por Abhishek Gautam para transcribir habla india en hindi, inglés e hinglish (código alternado) directamente a escritura romana natural, tal y como se escribe en mensajería informal (`kya scene hai`, no `क्या सीन है`). El modelo resuelve el problema de la transliteración posterior al reconocimiento, ya que emite texto romano de forma end-to-end sin necesidad de un paso adicional de conversión desde devanagari.

Con 37,7 millones de parámetros (39 M según la model card), arquitectura encoder-decoder de 4 capas por bloque y entrada de 80 filtros mel a 16 kHz, está diseñado para ejecutarse en CPU y dispositivos de borde. Su relevancia actual radica en cubrir un caso de uso muy común en la India: el dictado y la transcripción de conversaciones con alternancia de idiomas, donde los modelos estándar suelen fallar o requieren post-procesado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper-tiny (encoder-decoder transformer, 4 capas encoder + 4 capas decoder, 80-mel, 16 kHz) |
| Parametros totales | 37.760.640 (según safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 30 segundos (nativo de Whisper-tiny; se recomienda `chunk_length_s=30` para clips más largos) |
| Tipos de cuantizacion | No disponible (la model card indica que "cuantiza bien", pero no especifica formatos) |
| Idiomas soportados | Hindi, inglés, hinglish (código alternado) |
| Licencia | Apache-2.0 (según la model card) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Whisper-tiny: un transformer encoder-decoder con 4 capas en cada bloque, atención de 8 cabezas y 384 dimensiones ocultas, entrenado originalmente por OpenAI sobre 680.000 horas de audio multilingüe. Este ajuste fino se realizó sobre tres corpus de habla india: HiACC (adultos y niños, con acento indio), MUCS (hindi-inglés con código alternado, segmentado con Kaldi) y Common Voice (hindi e indic). Los fragmentos se filtraron a duraciones de 0,5 a 20 segundos.

La innovación clave está en el preprocesado de los objetivos: las transcripciones originales en devanagari se romanizaron con LIPI, un modelo CTC compacto que produce grafías de hinglish tipeado (`क्या` → `kya`, `है` → `hai`), mientras que los tramos en inglés se dejaron intactos. Así, el modelo aprende la correspondencia audio → romano directamente, sin necesidad de LIPI en inferencia. No se menciona el uso de RLHF ni DPO; se trata de un fine-tuning supervisado estándar.

## Capacidades

- Transcripción de habla hindi, inglés e hinglish a texto romano natural, sin paso de transliteración posterior.
- Manejo de código alternado dentro de una misma frase (p. ej., "with my daughter aur jo meri daughter hai usko bahut pasand hai diwali").
- Salida siempre en romano, incluso para habla puramente hindi.
- Funciona en CPU y dispositivos de borde gracias a su tamaño reducido (~150 MB en fp32).
- Robusto ante acentos indios en audio corto, claro y de tipo conversacional o dictado.
- No requiere token de idioma forzado; el modelo emite romano para cualquier entrada.

## Casos de uso

- Dictado en aplicaciones móviles para usuarios indios: el modelo transcribe notas de voz o dictados en hinglish directamente a texto romano, listo para enviar por mensajería o guardar en notas, sin necesidad de teclados devanagari.
- Transcripción de reuniones y conversaciones con código alternado: en entornos empresariales o educativos donde se mezcla hindi e inglés, el modelo genera actas en romano que pueden integrarse en herramientas de documentación.
- Subtitulado automático de vídeos cortos en hinglish: para creadores de contenido en plataformas como YouTube o Instagram, el modelo produce subtítulos en romano que reflejan la forma real de hablar, mejorando la accesibilidad.
- Asistentes de voz en aplicaciones de mensajería: integrado en un pipeline de ASR, permite enviar mensajes de voz transcritos a texto romano en apps como WhatsApp o Telegram, donde el usuario prefiere escribir en hinglish.
- Transcripción de notas de voz en aplicaciones de chat: el modelo puede procesar clips de audio de hasta 20 segundos (o más con chunking) y devolver el texto en romano, facilitando la búsqueda y el archivado.
- Accesibilidad para personas con dificultades de lectura en devanagari: usuarios que prefieren la escritura romana pueden beneficiarse de transcripciones automáticas de contenido hablado en hindi, sin necesidad de aprender a leer devanagari.
- Procesamiento de llamadas de atención al cliente (con limitaciones): aunque el modelo no está entrenado para audio telefónico ni ruido de fondo intenso, puede transcribir consultas cortas y claras en hinglish para su análisis posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como WER, CER ni comparaciones con otros modelos. Se desconoce el rendimiento cuantitativo frente a alternativas como Whisper-base o modelos específicos para hinglish.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en fp32; con cuantización a 8 bits o 4 bits, puede ejecutarse en GPU con menos de 500 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM (p. ej., NVIDIA GTX 1050 Ti, RTX 2060) o incluso CPU moderna; el modelo es de propósito para borde.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo actual (RTX 3060, RTX 4090, etc.) y también en CPU con tiempo real.
- Opciones de despliegue: transformers pipeline (como se muestra en la model card), también compatible con Hugging Face Inference Endpoints, o mediante exportación a ONNX para inferencia en CPU.
- Latencia y throughput: tiempo real en CPU (según la model card), sub-segundo en GPU modesta. No se proporcionan cifras exactas de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-tiny-hinglish (este) | 37,7 M | 30 s | Romano natural | Apache-2.0 | Hugging Face |
| openai/whisper-tiny | 39 M | 30 s | Devanagari (para hindi) | MIT | Hugging Face |
| openai/whisper-base | 74 M | 30 s | Devanagari (para hindi) | MIT | Hugging Face |

La comparación directa con otros modelos de ASR hinglish no está disponible en la información proporcionada. Frente a Whisper-tiny original, la diferencia principal es la salida en romano y el ajuste específico a acentos indios, aunque el modelo base tiene un rendimiento superior en inglés general. No se dispone de datos de WER para comparar cuantitativamente.

## Limitaciones y advertencias

- Precisión limitada en audio ruidoso, habla rápida, acentos muy marcados, solapamiento de hablantes o jerga de dominio específico; es un modelo pequeño, no state-of-the-art.
- Deriva ortográfica en inglés: palabras poco comunes pueden transcribirse fonéticamente (p. ej., `crackers` → `crakers`), debido al sesgo del entrenamiento hacia acento indio y peso del hindi.
- Romanización fonética no canónica: las grafías varían (`hai`/`hain`, `ki`/`kii`); no existe una ortografía romana única para el hindi.
- Limitado a fragmentos cortos (entrenado con ≤ 20 s); para audio más largo se requiere chunking con `chunk_length_s=30`, pero la calidad en grabaciones muy largas no está probada.
- Sin puntuación ni mayúsculas fiables; la salida está ligeramente puntuada como mucho.
- Solo cubre hindi, inglés e hinglish; otros idiomas indios quedan fuera del alcance.
- Dominio restringido a habla leída o guionizada; audio de campo lejano, telefonía y ruido de fondo intenso están subrepresentados en el entrenamiento.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Whisper-tiny tiene licencia MIT; no hay restricciones adicionales conocidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abhishekgautamm/whisper-tiny-hinglish
- Modelo base (openai/whisper-tiny): https://huggingface.co/openai/whisper-tiny
- Repositorio de LIPI (herramienta de romanización): https://github.com/ABHISHEKgauti25/lipi
- Página oficial de Whisper (OpenAI): https://openai.com/index/whisper/
- Repositorio de Whisper en GitHub: https://github.com/openai/whisper
