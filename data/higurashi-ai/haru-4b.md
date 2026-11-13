# higurashi-ai/Haru-4B

## Resumen

Haru-4B es un modelo fundacional de diálogo hablado continuo y full-duplex desarrollado por higurashi-ai. A diferencia de los pipelines de voz convencionales que encadenan ASR, LLM y TTS de forma secuencial, Haru-4B escucha y habla simultáneamente: cada 133 ms (7,5 Hz) consume un frame de audio del usuario y emite un frame de audio propio junto con el token de texto correspondiente. Esto elimina la latencia estructural de los sistemas por turnos y permite interrupciones y solapamiento natural, como en una llamada telefónica.

El modelo se construye sobre un backbone de texto Qwen3.5-4B (32 capas, dimensión oculta 2560) con 5.270.000.897 parámetros totales en bfloat16. La parte de audio no utiliza tokens discretos: un codec acústico causal (VibeVoice, 24 kHz, 3200 muestras por latente) produce latentes de 64 dimensiones por frame, y una cabeza MLP de 4 capas con muestreo MeanFlow genera el audio en un solo paso a partir del estado oculto del modelo de lenguaje. Audio del usuario, audio del modelo y texto del modelo se suman en una única posición del transformer.

Es relevante ahora porque aborda el cuello de botella de latencia y la falta de naturalidad conversacional de los asistentes de voz, y lo hace con licencia Apache 2.0 y pesos abiertos. No obstante, se distribuye como modelo base preentrenado para investigación: mantiene conversaciones fluidas, pero no es una fuente fiable de hechos ni sigue instrucciones como un asistente al uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de texto (Qwen3.5-4B) + proyecciones de audio + cabeza MLP MeanFlow + codec acústico VibeVoice |
| Parametros totales | 5.270.000.897 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | en, es, pt, de, fr, zh, ja, ru, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo combina un backbone de lenguaje Qwen3.5-4B de 32 capas y dimensión oculta 2560 con dos proyecciones de entrada de audio (`model_audio_proj.*` y `user_audio_proj.*`) y una cabeza de salida de audio de 4 capas MLP con muestreo MeanFlow en un único paso de muestreo (guidance scale 1 a 2, por defecto 1,5). El audio se representa mediante el tokenizador acústico VibeVoice, causal, a 24 kHz, con 3200 muestras por latente y 64 dimensiones por frame. No hay transformer de audio separado ni tokens de audio discretos.

La innovación central es la fusión full-duplex a 7,5 Hz: en cada frame de 133 ms, el latente de habla del usuario, el token de texto previo del modelo y el latente de habla previo del modelo se suman en una sola posición del modelo de lenguaje, cuya salida predice simultáneamente el siguiente token de texto y el siguiente latente de habla. Esto permite que escucha y habla avancen en paralelo sin esperas mutuas. El control de personaje se realiza mediante una tarjeta de texto con formato fijo (system prompt) y el control de voz mediante un clip de referencia de un solo hablante de entre 3 segundos y 3 minutos. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Diálogo hablado continuo full-duplex: escucha y habla al mismo tiempo con frames de 133 ms.
- Generación conjunta de audio y texto por frame, con salida de audio de 3200 muestras a 24 kHz por paso.
- Síntesis de voz guiada por clip de referencia (voice cloning a partir de 3 s a 3 min de audio limpio).
- Control de personaje mediante tarjeta de texto en el system prompt.
- Multilingüismo en nueve idiomas: inglés, español, portugués, alemán, francés, chino, japonés, ruso y coreano.
- Conversación multi-turno con solapamiento e interrupciones naturales.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- No se documentan capacidades de visión ni modo thinking.

## Casos de uso

- Atención al cliente telefónica: el modelo puede mantener una llamada con solapamiento e interrupciones gracias a su funcionamiento full-duplex a 7,5 Hz, lo que evita la sensación de turnos rígidos de los pipelines ASR-LLM-TTS.
- Prótesis conversacionales y agentes de voz embebidos: su latencia de frame de 133 ms y su requisito de aproximadamente 12 GB de VRAM permiten desplegarlo en una GPU de gama media para interfaces de voz en tiempo real.
- Investigación en interacción humano-máquina: sirve como base para estudiar turn-taking, barge-in y sincronización audio-texto en diálogo hablado.
- Doctores y entrenadores de idiomas simulados: con una tarjeta de personaje y un clip de voz, se puede configurar un interlocutor con personalidad y timbre concretos para prácticas de conversación en los nueve idiomas soportados.
- Generación de voz con estilo y timbre personalizados: la combinación de tarjeta de personaje y referencia de voz permite producir diálogo hablado con una identidad vocal concreta para demos, prototipos o contenido interactivo.
- Evaluación de sistemas de diálogo full-duplex: al ser un modelo base abierto, se puede usar como referencia o contraparte en benchmarks de latencia, naturalidad y solapamiento conversacional.
- Integración en aplicaciones macOS nativas: la implementación MLX con app nativa permite prototipar asistentes de voz locales en hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 12 GB en bfloat16, según la model card.
- GPU recomendadas: NVIDIA con unos 12 GB de memoria; no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- Cabe en GPU de consumo: sí, en tarjetas con al menos 12 GB de VRAM (por ejemplo, gamas RTX xx70/xx80 con 12 GB o más), aunque el dato no se confirma explícitamente.
- Opciones de despliegue: servidor PyTorch incluido en el repositorio (`python -m haru.server`), implementación MLX con app nativa para macOS y plugin para servir con vLLM-Omni.
- Latencia: frame de 133 ms (7,5 Hz); se recomienda audio por cable, ya que Bluetooth añade 100 ms o más.
- Throughput estimado: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparativas publicadas en la información proporcionada. A continuación se comparan únicamente características estructurales verificables frente a alternativas de la misma categoría (diálogo hablado full-duplex de código abierto):

| Modelo | Parametros | Full-duplex | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Haru-4B | 5.270.000.897 | Sí, 7,5 Hz | no disponible | Apache 2.0 | safetensors |
| Moshi (Kyutai) | no disponible en la informacion | Sí | no disponible | no disponible en la informacion | no disponible en la informacion |
| Qwen2.5-Omni | no disponible en la informacion | No (por turnos) | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion |

Los datos de los modelos alternativos no forman parte de la información proporcionada y no se han verificado aquí; se incluyen solo como referencia de categoría.

## Limitaciones y advertencias

- Es un modelo base preentrenado para investigación: no es una fuente fiable de hechos y no sigue instrucciones como un asistente.
- Riesgo de alucinación en el contenido textual y de incoherencias en el audio generado.
- El clonado de voz puede imitar el timbre de un clip de referencia; solo deben usarse voces sobre las que se tenga derecho de uso.
- No se documentan sesgos conocidos, pero al ser un modelo multilingüe entrenado con datos no descritos, es esperable un sesgo no caracterizado.
- Longitud de contexto no documentada, lo que limita la planificación de conversaciones largas.
- Requiere hardware con unos 12 GB de VRAM y audio por cable para baja latencia; Bluetooth introduce 100 ms o más.
- La licencia Apache 2.0 permite uso comercial de los pesos, pero el modelo no está ajustado para producción como asistente y su fiabilidad factual no está garantizada.
- No se documentan cuantizaciones alternativas ni formatos GGUF, lo que restringe el despliegue en hardware de menor capacidad.

## Enlaces

- Hugging Face: https://huggingface.co/higurashi-ai/Haru-4B
- Repositorio de código (PyTorch, MLX, plugin vLLM-Omni): https://github.com/higurashi-ai/Haru
- Demo web local: http://localhost:8998 (tras ejecutar el servidor del repositorio)
