# keyvan-ai/Saturn-Duplex-5B-DE

## Resumen

Saturn-Duplex-5B-DE es un modelo de diálogo hablado full-duplex desarrollado por keyvan-ai, orientado principalmente al alemán. Se trata de una evolución del modelo base higurashi-ai/Haru-4B (4B parámetros) que amplía el cómputo hasta los 5.270.000.897 parámetros reales en safetensors. Su rasgo diferencial es que procesa y genera audio de forma simultánea a 7,5 Hz: cada 133 ms consume un frame de voz del usuario y emite un frame de su propia habla, sin cadena intermedia de ASR, texto y TTS.

El modelo resuelve el problema del cambio de turno y la naturalidad conversacional en voz: gestiona interrupciones (barge-in), solapamientos, pausas y retroalimentación ("mhm", "ja") de forma nativa, manteniendo la coherencia del hilo conversacional. Según la model card, mejora al modelo base en métricas clave de diálogo: toma de palabra del 40 % al 100 % de los casos de prueba, tiempo de respuesta de 1,03 s a 0,50 s, y pérdida de lenguaje sobre texto alemán de 4,73 a 2,09.

Es relevante ahora porque propone un enfoque speech-to-speech de extremo a extremo (pipeline `audio-to-audio`) con latencia muy baja —unos 11 ms por tick de 133 ms en GGUF bf16 sobre una RTX PRO 6000, más de 12 veces tiempo real— y con licencia Apache 2.0, lo que facilita su uso comercial en agentes de voz, NPCs y robótica social.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de diálogo hablado full-duplex derivado de higurashi-ai/Haru-4B; pipeline audio-to-audio) |
| Parametros totales | 5.270.000.897 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (GGUF bf16 documentado); safetensors; otras cuantizaciones no disponibles |
| Idiomas soportados | de (principal), en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que es una continuación de higurashi-ai/Haru-4B y de que opera como modelo de audio a audio full-duplex a 7,5 Hz (un frame de entrada y uno de salida cada 133 ms). El modelo mantiene "anclas de voz y de tick" para preservar la cabeza tonal, el clonado de voz y el comportamiento de tick del modelo base. No hay datos publicados sobre número de capas, tipo de atención ni composición exacta del transformer.

El entrenamiento combina varias fuentes: diálogo hablado full-duplex centrado en alemán con canales de hablante separados, flujo de texto alineado a nivel de palabra y enriquecimiento progresivo con ruido de fondo real (televisión, conversaciones laterales, retroalimentación); condicionamiento mediante tarjetas de personaje (persona, situación, relación, frecuencia de retroalimentación); destilación de conocimiento desde un modelo de texto fuerte sobre texto alemán; repetición de texto con datos alemanes de pregunta-respuesta y lógica para conservar la capacidad lingüística; y anclas de voz y de tick. Entre los conjuntos públicos citados figuran Seamless Interaction, Expresso, CALLHOME (alemán, inglés, español), MagicData, OpenAssistant OASST2, GermanQuAD, XQuAD, MLQA, Belebele, MKQA, el dataset Aya y la Wikipedia alemana. No se especifica el número total de tokens de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Diálogo hablado full-duplex de extremo a extremo: escucha y habla en el mismo paso de cómputo, sin ASR ni TTS separados.
- Gestión natural de turnos: barge-in (interrupción), solapamientos, pausas y retroalimentación conversacional.
- Robustez ante ruido de fondo (televisión, conversaciones laterales) y reanudación del diálogo tras perturbaciones.
- Clonado de voz a partir de una referencia de 3 a 30 segundos.
- Condicionamiento por tarjeta de personaje: persona, situación, relación y frecuencia de retroalimentación.
- Conversación en alemán coloquial con prosodia, muletillas y timing naturales; soporte secundario de inglés.
- Generación de habla a 7,5 Hz (tick de 133 ms) con latencia de respuesta en torno a 0,5 s.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso basado en texto en la información disponible.

## Casos de uso

- NPCs e interactivos en videojuegos: personajes con los que el jugador puede hablar, interrumpir y bromear en tiempo real; el full-duplex a 7,5 Hz permite reacciones inmediatas y solapamientos propios de una conversación humana.
- Compañeros conversacionales y small talk: conversación relajada y cercana en alemán, con retroalimentación ("mhm", "ja") que mantiene el hilo sin perder el turno.
- Práctica de alemán: interlocutor paciente que habla alemán cotidiano natural, adecuado para estudiantes que necesitan entrenar comprensión y producción oral con timing realista.
- Historias interactivas y radioteatros: personajes con voz propia (clonada de una referencia de 3-30 s) y personalidad definida por tarjeta de personaje, que reaccionan en directo a quien escucha.
- Avatares, terminales y robots sociales: interacción por voz natural para agentes encarnados, aprovechando la baja latencia (unos 11 ms por tick en GGUF bf16) y la tolerancia al ruido ambiental.
- Investigación en diálogo full-duplex: base en alemán para estudiar cambio de turno, retroalimentación y comportamiento conversacional, con licencia Apache 2.0 que facilita la experimentación y la publicación de resultados.

## Benchmarks y rendimiento

Resultados de la evaluación full-duplex en alemán del autor (cambio de turno, retroalimentación, ruido, múltiples turnos), comparando modelo base y Saturn con los mismos clips y ajustes:

| Métrica | Base | Saturn |
|---|---|---|
| Toma la palabra cuando el usuario calla (↑) | 0,40 | 1,00 |
| Tiempo de respuesta tras el fin de habla del usuario (↓) | 1,03 s | 0,50 s |
| Sigue hablando tras un "mhm" (↑) | 0,20 | 1,00 |
| Retoma la conversación tras perturbación (↑) | 0,00 | 1,00 |
| Se queda en silencio con ruido de fondo (↓) | 1,00 | 0,20 |
| Turnos sin responder en conversaciones (↓) | 7 / 26 | 0 / 26 |
| Pérdida del modelo de lenguaje sobre texto alemán (↓) | 4,73 | 2,09 |

Rendimiento de ejecución (GGUF bf16, una RTX PRO 6000 con GPU compartida): núcleo de lenguaje en torno a 6,5 ms y tick completo en torno a 11 ms por tick de 133 ms, más de 12 veces tiempo real. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 5.270.000.897 parámetros, en bf16 los pesos ocupan aproximadamente 10,5 GB, cifra orientativa calculada a partir del recuento de parámetros, no publicada por el autor.
- GPU recomendadas: la model card cita una RTX PRO 6000 para las mediciones de latencia; no se especifican otras GPU recomendadas.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible; por tamaño de pesos en bf16 sería plausible en GPU de consumo con suficiente VRAM, pero el autor no lo documenta.
- Opciones de despliegue: se documenta un build GGUF; no se detallan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: núcleo de lenguaje en torno a 6,5 ms y tick completo en torno a 11 ms por tick de 133 ms en GGUF bf16 sobre una RTX PRO 6000, más de 12 veces tiempo real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Saturn-Duplex-5B-DE | 5.270.000.897 | no disponible | Diálogo hablado full-duplex alemán (audio-to-audio) | apache-2.0 | Hugging Face (safetensors, GGUF) |
| higurashi-ai/Haru-4B (base) | 4B (aprox.) | no disponible | Diálogo hablado (base de la que deriva) | no disponible en la información proporcionada | Hugging Face |
| Otros modelos full-duplex comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye comparaciones con otros modelos full-duplex de la competencia; la única referencia directa es el modelo base Haru-4B, frente al cual la model card reporta las mejoras recogidas en la tabla de benchmarks.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse con datos conversacionales públicos (CALLHOME, Expresso, OASST2, Wikipedia alemana, etc.) puede heredar sesgos de esas fuentes.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un modelo de diálogo hablado, puede producir contenido plausible pero incorrecto en conversación.
- Limitaciones de idioma: está diseñado "German-first"; el inglés figura como idioma soportado, pero no se detalla su calidad relativa.
- Limitaciones de contexto: la longitud de contexto no está publicada, lo que dificulta planificar conversaciones muy largas o tareas que dependan de memoria extensa.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los datasets de entrenamiento citados (p. ej. CALLHOME, Expresso) antes de un despliegue en producción.
- Caveats de producción: el rendimiento publicado se midió en una única configuración (GGUF bf16, RTX PRO 6000 con GPU compartida); el comportamiento en otros hardwares y cuantizaciones no está documentado.
- El modelo es de audio a audio y no se documenta soporte de tool calling ni de razonamiento multi-paso basado en texto, lo que limita su uso como backend de agentes que requieran esas capacidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/keyvan-ai/Saturn-Duplex-5B-DE
- Demo en vivo: https://hardani.de/saturn/
- Modelo base: https://huggingface.co/higurashi-ai/Haru-4B
- Dataset GermanQuAD: https://huggingface.co/datasets/deepset/germanquad
- Dataset OpenAssistant OASST2: https://huggingface.co/datasets/OpenAssistant/oasst2
- Dataset Wikipedia (Wikimedia): https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset CALLHOME telefónico: https://huggingface.co/datasets/BrunoHays/callhome-telephony
