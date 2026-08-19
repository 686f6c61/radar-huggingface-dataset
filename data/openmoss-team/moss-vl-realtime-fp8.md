# OpenMOSS-Team/MOSS-VL-Realtime-FP8

## Resumen

MOSS-VL-Realtime-FP8 es la versión cuantizada en FP8 del modelo MOSS-VL-Realtime, desarrollado por el equipo OpenMOSS. Se trata de un modelo multimodal de 11 336 millones de parámetros especializado en comprensión de vídeo en tiempo real, con una interfaz de streaming basada en marcos (frames) con marcas de tiempo. El modelo original está pensado para procesar flujos de vídeo continuos, decidir cuándo hablar o permanecer en silencio, responder a eventos repentinos y corregirse a mitad de frase. Esta versión FP8 reduce los requisitos de memoria y acelera la inferencia, manteniendo un rendimiento muy cercano al BF16 original.

La relevancia actual de este modelo radica en que permite desplegar capacidades de vídeo-comprensión en tiempo real en hardware más asequible, sin necesidad de GPUs de gama alta con decenas de gigabytes de VRAM. Su arquitectura unificada de cross-attention, combinada con cuantización de pesos y caché KV, lo convierte en una opción práctica para aplicaciones de streaming, vigilancia, asistentes interactivos y análisis de vídeo en directo. La licencia Apache 2.0 facilita su uso comercial y su integración en productos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con cross-attention unificada (36 capas no-cross + 12 capas cross-attention) |
| Parametros totales | 11 336 371 208 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 E4M3 (pesos con escalas estáticas por canal y activaciones dinámicas por token); KV cache en HQQ INT8 (grupo 64, residual BF16 longitud 128) |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (15.8 GB repo) |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura transformer multimodal con un diseño de cross-attention unificado, donde 36 capas procesan el lenguaje y 12 capas adicionales integran información visual mediante atención cruzada. El encoder de visión y el merger se mantienen en BF16, mientras que las capas de atención y MLP principales se cuantizan a FP8 con escalas dinámicas por token. La caché KV se comprime a INT8 mediante HQQ con grupo de tamaño 64 y un residual BF16 de longitud 128, lo que reduce significativamente el consumo de memoria durante la inferencia de secuencias largas.

No se proporcionan datos específicos sobre el número de tokens de entrenamiento ni la composición exacta del dataset. El modelo base fue entrenado para tareas de comprensión de vídeo en tiempo real, con énfasis en la capacidad de procesar flujos continuos de marcos con marcas de tiempo y generar respuestas incrementales. La versión FP8 se obtiene mediante cuantización post-entrenamiento con compressed-tensors, sin reentrenamiento, y se valida que mantiene un rendimiento casi idéntico al BF16 en los benchmarks de referencia.

## Capacidades

- Comprensión de vídeo en streaming: procesa marcos individuales con marcas de tiempo no decrecientes y genera descripciones o respuestas incrementales en tiempo real.
- Interrupción y respuesta dinámica: el modelo decide cuándo emitir una respuesta, cuándo permanecer en silencio (token `<|silence|>`) y cuándo iniciar o finalizar un turno (tokens `<|round_start|>` y `<|round_end|>`).
- Soporte multilingüe: entrenado y validado en inglés y chino, con capacidad de generar descripciones en ambos idiomas.
- Integración con Transformers: compatible con la API estándar de HuggingFace, incluyendo `AutoModelForCausalLM` y `AutoProcessor`, con backend de atención FlashAttention 2.
- Sesión de tiempo real: una instancia del modelo soporta una única sesión activa de streaming, con cola de marcos configurable para limitar la latencia.
- No se mencionan capacidades de tool calling, razonamiento multi-paso ni visión estática independiente; el foco es exclusivamente vídeo en streaming.

## Casos de uso

- Guía turística en vídeo en directo: el modelo puede describir puntos de interés mientras se transmiten imágenes de una cámara, generando narraciones contextuales en tiempo real con marcas de tiempo.
- Vigilancia y monitorización de seguridad: análisis de flujos de vídeo de cámaras para detectar y describir eventos relevantes (movimientos, intrusiones) y alertar cuando ocurren cambios significativos.
- Subtitulación en vivo de vídeos o videollamadas: generación de descripciones o subtítulos automáticos sincronizados con el contenido visual, útil para accesibilidad o documentación.
- Asistentes interactivos para educación a distancia: el modelo responde a preguntas sobre el contenido de una clase o demostración en vídeo, manteniendo contexto a lo largo de la sesión.
- Moderación de contenido en plataformas de streaming: detección y descripción de contenido inapropiado o cambios relevantes en transmisiones en directo, con capacidad de interrumpir la respuesta si el evento lo requiere.
- Análisis de vídeo deportivo en tiempo real: descripción de jugadas, seguimiento de eventos y generación de comentarios automáticos durante retransmisiones, aprovechando la baja latencia y el streaming por marcos.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados comparativos entre la versión BF16 original y esta versión FP8 cuantizada:

| Benchmark | BF16 | FP8 (este modelo) |
|---|---|---|
| OVOBench Avg | 70.86 | 70.66 |
| StreamingBench Avg | 62.42 | 62.93 |
| OmniMMI PA | 66.00 | 65.50 |

La degradación máxima observada es de 0.5 puntos en OmniMMI PA, mientras que en StreamingBench la versión FP8 incluso supera ligeramente al BF16. No se han publicado resultados adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada: el test validado con 30 marcos de streaming alcanzó un pico de 25 522 MiB de VRAM de proceso y 26 249 MiB de memoria total de GPU (incluyendo 727 MiB de línea base).
- GPU recomendadas: NVIDIA con más de 26 GiB de memoria disponible, por ejemplo RTX 4090 (24 GiB no es suficiente), A100 40 GB, A100 80 GB, H100 80 GB. Alternativamente, se puede usar `device_map="auto"` para fragmentar el modelo en varias GPUs.
- No cabe en GPUs de consumo típicas de 8-16 GiB (RTX 3080, RTX 4060) sin técnicas adicionales de offloading.
- Opciones de despliegue: Transformers con FlashAttention 2, soporte para `device_map` de Accelerate. No se menciona compatibilidad con vLLM, llama.cpp u Ollama en la documentación.
- Latencia y throughput: no se proporcionan cifras concretas; la latencia depende del hardware, la tasa de muestreo de marcos y el transporte. La cola de marcos (frame_queue_size) permite limitar la latencia descartando marcos antiguos pendientes.

## Comparativa con modelos similares

No se dispone de comparaciones directas con otros modelos de streaming de vídeo en la información proporcionada. El modelo MOSS-VL-Realtime-FP8 se posiciona como una alternativa de 11B parámetros con licencia Apache 2.0, mientras que alternativas como Video-LLaVA o LLaVA-Video tienen arquitecturas y tamaños diferentes. Dado que no hay datos de benchmarks comparativos con esos modelos en las fuentes consultadas, se indica que la comparativa no está disponible.

## Limitaciones y advertencias

- Una única instancia del modelo soporta una sola sesión de streaming activa; no se pueden ejecutar múltiples sesiones concurrentes en el mismo proceso.
- La latencia en producción depende del hardware, la tasa de muestreo de marcos, el overhead de transporte y la velocidad de decodificación de vídeo; puede no ser adecuado para escenarios de latencia ultrabaja.
- El modelo puede emitir tokens de control (`<|silence|>`, `<|round_start|>`, `<|round_end|>`) que deben filtrarse o interpretarse según el protocolo de la aplicación.
- Idiomas limitados a inglés y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- La cuantización FP8 introduce una ligera degradación en algunos benchmarks (hasta 0.5 puntos), aunque en otros mejora ligeramente; se recomienda validar en el caso de uso específico.
- El uso de `trust_remote_code=True` es obligatorio para cargar el modelo, lo que implica ejecutar código personalizado del repositorio; se debe revisar la procedencia del código en entornos de producción.
- No se proporcionan garantías sobre el comportamiento en vídeos de larga duración más allá de los 30 marcos validados; la memoria puede escalar con el número de marcos procesados.

## Enlaces

- Modelo FP8 en HuggingFace: https://huggingface.co/OpenMOSS-Team/MOSS-VL-Realtime-FP8
- Modelo base BF16: https://huggingface.co/OpenMOSS-Team/MOSS-VL-Realtime
- Página del proyecto OpenMOSS: https://openmoss.ai/MOSS-VL/
- Documentación adicional del modelo: https://openmoss.ai/MOSS-VL/moss-vl.html
- Repositorio GitHub: https://github.com/OpenMOSS/MOSS-VL
