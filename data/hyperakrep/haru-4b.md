# hyperakrep/Haru-4B

## Resumen

Haru-4B es un modelo fundacional de diálogo hablado continuo, full-duplex y multilingüe, desarrollado por higurashi-ai (publicado en Hugging Face bajo el usuario hyperakrep). Su particularidad es que escucha y habla de forma simultánea, como en una llamada telefónica, en lugar de alternar turnos de forma rígida. Está pensado como modelo base preentrenado para investigación, no como asistente instruido.

Técnicamente, el modelo opera a 7,5 Hz: cada 133 ms procesa un frame de audio del usuario y genera un frame de su propio audio y de texto. El audio del usuario, el audio generado y el texto del modelo se suman en una única posición del modelo de lenguaje, de modo que la escucha y el habla no se bloquean mutuamente. El audio se representa como un latente continuo de 64 dimensiones por frame, generado en un solo paso de muestreo mediante una cabeza MLP con MeanFlow, sin tokens de audio discretos ni transformer de audio separado.

El modelo cuenta con 5.270.000.897 parámetros reales (según safetensors), un repositorio de 10,6 GB y soporte para nueve idiomas: inglés, español, portugués, alemán, francés, chino, japonés, ruso y coreano. Se distribuye con licencia Apache 2.0 y pesos en bfloat16 en formato safetensors.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje Qwen3.5-4B (32 capas, hidden size 2560) con codec de audio VibeVoice causal y cabeza MLP MeanFlow |
| Parámetros totales | 5.270.000.897 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en bfloat16) |
| Idiomas soportados | Inglés, español, portugués, alemán, francés, chino, japonés, ruso, coreano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La arquitectura combina un backbone de lenguaje Qwen3.5-4B de 32 capas y hidden size 2560 con un codec acústico VibeVoice causal a 24 kHz que produce un latente cada 3200 muestras. Cada frame de 133 ms (7,5 Hz) suma en una sola posición del modelo de lenguaje el latente del audio del usuario, el token de texto previo del modelo y el latente de audio previo del modelo; la salida predice el siguiente token de texto y el siguiente latente de audio. La generación de audio se realiza con una cabeza MLP de 4 capas entrenada con MeanFlow, que produce el latente en un único paso de muestreo con guidance scale entre 1 y 2 (valor por defecto 1,5). No hay transformer de audio independiente ni tokens de audio discretos.

El modelo se presenta como base preentrenada para investigación. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación destacable es el diseño full-duplex nativo a 7,5 Hz con generación de audio en un solo paso, que elimina la latencia de un codec autoregresivo separado.

## Capacidades

- Diálogo hablado continuo full-duplex: escucha y habla simultáneamente a 7,5 Hz, con frames de 133 ms.
- Generación de audio y texto entrelazados en cada frame.
- Control de personaje mediante una tarjeta de texto (system prompt con formato fijo).
- Control de voz mediante un clip de referencia de un solo hablante (de 3 segundos a 3 minutos).
- Multilingüe en nueve idiomas: inglés, español, portugués, alemán, francés, chino, japonés, ruso y coreano.
- Entrada y salida de audio a 24 kHz (3200 muestras por frame).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso explícito.

## Casos de uso

- Investigación en diálogo hablado full-duplex: el modelo sirve como base para estudiar interacción simultánea entre escucha y habla, gracias a su tasa de frames de 7,5 Hz y a la suma de modalidades en una única posición del LM.
- Prototipos de agentes de voz conversacionales: permite construir demos de conversación natural con latencia baja (133 ms por frame), adecuadas para validar experiencias de llamada telefónica.
- Clonación y control de voz para experimentación: con un clip de referencia de 3 segundos a 3 minutos se puede fijar la voz del modelo, útil en estudios de síntesis y personalización vocal.
- Evaluación multilingüe de modelos de habla: al cubrir nueve idiomas, facilita comparativas de diálogo hablado entre lenguas con un mismo backbone.
- Investigación en codecs y generación de audio en un paso: la cabeza MeanFlow de 4 capas con un solo paso de muestreo es un objeto de estudio para reducir latencia en TTS.
- Desarrollo de aplicaciones macOS nativas con MLX: el repositorio incluye una implementación MLX con app nativa, útil para prototipos en hardware Apple.
- Servicio de inferencia con vLLM-Omni: el plugin permite desplegar el modelo en infraestructura de serving existente para experimentos a mayor escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 12 GB de memoria en GPU NVIDIA según la model card (pesos en bfloat16).
- GPU recomendadas: NVIDIA con al menos 12 GB de memoria; no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU de consumo con 12 GB o más de VRAM; no se detallan modelos concretos.
- Opciones de despliegue: servidor PyTorch incluido en el repositorio (`python -m haru.server`), implementación MLX con app nativa para macOS y plugin para vLLM-Omni.
- Latencia: 133 ms por frame (7,5 Hz); se recomienda audio por cable, ya que Bluetooth añade 100 ms o más.
- Throughput estimado: no disponible.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de benchmarks ni especificaciones de modelos comparables en la información disponible.

## Limitaciones y advertencias

- Es un modelo base preentrenado para investigación: mantiene conversaciones naturales, pero no es una fuente fiable de hechos y no sigue instrucciones como un asistente.
- Riesgo de alucinación en el contenido textual y de respuestas no veraces.
- Puede imitar la voz de un clip de referencia; solo deben usarse voces sobre las que se tenga derecho de uso.
- Longitud de contexto no documentada, lo que limita planificar conversaciones de larga duración.
- No se documentan sesgos conocidos ni limitaciones específicas por idioma.
- Licencia Apache 2.0: permite uso comercial, pero el modelo se publica como base de investigación y no se garantiza su idoneidad para producción.
- La latencia depende del hardware y de los dispositivos de audio; los dispositivos Bluetooth añaden 100 ms o más.
- El repositorio indica 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validación por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/hyperakrep/Haru-4B
- Repositorio de código: https://github.com/higurashi-ai/Haru
- Blog técnico: https://blog.higurashi.ai/melte/haru4b/
- Blog técnico en japonés: https://blog.higurashi.ai/melte/haru4b-ja/
