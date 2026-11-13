# botp/Haru-4B

## Resumen

Haru-4B es un modelo fundacional de diálogo hablado continuo y full-duplex, desarrollado por el equipo de higurashi-ai (publicado en Hugging Face bajo el usuario botp). A diferencia de los pipelines clásicos por turnos (ASR -> LLM -> TTS), Haru escucha y habla simultáneamente, como en una llamada telefónica: cada 133 ms consume un frame de audio del usuario y emite un frame de su propio audio y texto. Resuelve el problema de la latencia y la naturalidad en la conversación por voz, eliminando la espera entre turnos.

Técnicamente combina un backbone de lenguaje Qwen3.5-4B (32 capas, dimensión oculta 2560) con un códec de audio causal VibeVoice a 24 kHz y una cabeza MLP MeanFlow que genera el latente de audio en un único paso de muestreo. El modelo tiene 5.270.000.897 parámetros en bfloat16 (repo de 10,6 GB) y soporta nueve idiomas: inglés, español, portugués, alemán, francés, chino, japonés, ruso y coreano.

Es relevante porque propone un paradigma nativo full-duplex a 7.5 Hz sin tokens de audio discretos ni transformer de audio separado, con control de personaje mediante tarjeta de texto y de voz mediante clip de referencia. Se distribuye como modelo base preentrenado para investigación bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Full-duplex speech-to-speech: backbone de lenguaje Qwen3.5-4B + códec de audio causal VibeVoice + cabeza MLP MeanFlow |
| Parámetros totales | 5.270.000.897 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | en, es, pt, de, fr, zh, ja, ru, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

Haru-4B es un modelo híbrido de lenguaje y audio. El backbone textual es Qwen3.5-4B con 32 capas y dimensión oculta 2560. El audio se representa como un latente continuo de 64 dimensiones por frame, generado por un códec acústico VibeVoice causal a 24 kHz con 3200 muestras por latente. La innovación clave es la fusión en una sola posición del modelo de lenguaje: en cada frame de 133 ms (7.5 Hz), el latente de audio del usuario, el token de texto previo del modelo y el latente de audio previo del modelo se suman en una única posición; la salida predice simultáneamente el siguiente token de texto y el siguiente latente de audio. Esto permite escuchar y hablar sin bloqueos mutuos.

La generación de audio se realiza con una cabeza MLP de 4 capas entrenada con MeanFlow, que produce el latente en un solo paso de muestreo (guidance scale entre 1 y 2, por defecto 1.5), sin transformer de audio independiente ni tokens de audio discretos. El control de personaje se ejerce mediante una tarjeta de texto con formato fijo (system prompt) y el control de voz mediante un clip de referencia de un solo hablante de entre 3 segundos y 3 minutos. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Diálogo hablado continuo full-duplex: escucha y habla a la vez, con frames de 133 ms.
- Generación simultánea de audio y texto en cada frame.
- Síntesis de voz condicionada por clip de referencia (clonación de voz con consentimiento).
- Control de personaje mediante tarjeta de texto con layout fijo.
- Multilingüe en nueve idiomas: inglés, español, portugués, alemán, francés, chino, japonés, ruso y coreano.
- Baja latencia nativa, apta para conversación tipo llamada telefónica.
- No dispone de tool calling, function calling ni capacidades de agente multi-paso documentadas.
- No se documentan capacidades de visión ni modo thinking.

## Casos de uso

- Atención al cliente por voz: el modelo puede mantener una conversación telefónica natural y simultánea, sin pausas artificiales entre turnos, gracias a su procesamiento full-duplex a 7.5 Hz.
- Asistentes conversacionales embebidos: con unos 12 GB de memoria en GPU NVIDIA, puede desplegarse en servidores modestos para asistentes de voz de baja latencia.
- Práctica de idiomas: al soportar nueve idiomas y conversación continua, sirve para simulaciones de conversación con un personaje definido por tarjeta.
- Investigación en diálogo hablado: como modelo base preentrenado, es adecuado para experimentos de full-duplex, representaciones latentes de audio y generación MeanFlow.
- Prototipos de agentes de voz con personalidad: la combinación de tarjeta de personaje y clip de voz permite crear interlocutores con identidad y timbre controlados.
- Aplicaciones de accesibilidad: interfaces de voz manos libres que requieren interacción en tiempo real y respuesta inmediata.
- Demos interactivas en macOS: existe una implementación MLX con app nativa, útil para pruebas locales en Apple Silicon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 12 GB en GPU NVIDIA según la model card (pesos en bfloat16).
- GPU recomendadas: NVIDIA con al menos 12 GB de memoria; no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Compatibilidad con GPU de consumo: probable en tarjetas con 12 GB o más, aunque no se confirma un modelo concreto.
- Opciones de despliegue: servidor PyTorch incluido en el repositorio (`python -m haru.server`), plugin para vLLM-Omni e implementación MLX con app nativa para macOS.
- Latencia: frames de 133 ms; se recomienda audio por cable, ya que Bluetooth añade 100 ms o más.
- Throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparativas publicadas con modelos equivalentes en la información proporcionada. Las alternativas de diálogo hablado full-duplex de código abierto no se detallan en la documentación disponible, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Es un modelo base preentrenado para investigación: no es una fuente fiable de hechos y no sigue instrucciones como un asistente al uso.
- Riesgo de alucinación en el contenido textual y de respuestas incoherentes en conversaciones largas.
- Puede imitar la voz de un clip de referencia; solo deben usarse voces sobre las que se tenga derecho de uso.
- No se documentan sesgos específicos, pero al ser un modelo multilingüe entrenado con datos no especificados, pueden aparecer sesgos sociales y culturales.
- Longitud de contexto no documentada, lo que limita la planificación de conversaciones muy extensas.
- No se documentan capacidades de tool calling ni de agente, por lo que no es adecuado para automatizaciones que requieran invocar funciones.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se publica explícitamente para investigación y su fiabilidad en producción no está validada.
- El rendimiento depende de la calidad del micrófono y de los auriculares; los dispositivos Bluetooth incrementan la latencia.

## Enlaces

- Hugging Face: https://huggingface.co/botp/Haru-4B
- Repositorio de código: https://github.com/higurashi-ai/Haru
- Blog técnico (inglés): https://blog.higurashi.ai/melte/haru4b/
- Blog técnico (japonés): https://blog.higurashi.ai/melte/haru4b-ja/
