# daemonix/Qwen3.8-Flash-Next-abliterated-Q4-GGUF-antirez-DS4

## Resumen

Qwen3.8-Flash-Next-abliterated-Q4-GGUF-antirez-DS4 es una cuantización en formato GGUF del modelo multimodal Qwen3.8-Flash-Next, publicada por el usuario daemonix. El modelo base es la variante "abliterated" de mrfakename, una edición que elimina o atenúa el comportamiento de rechazo (refusals) del modelo original de Qwen mediante la técnica de abliteration, que interviene sobre las direcciones de activación asociadas a la negativa a responder. Esta conversión concreta está empaquetada específicamente para el runtime DS4 (DwarfStar) de antirez, con soporte para el backend Metal en Macs con Apple Silicon.

El modelo cuenta con aproximadamente 179.550 millones de parámetros totales según los datos de safetensors, lo que lo sitúa en la categoría de modelos de gran escala. La arquitectura combina atención lineal y atención completa (híbrida), e incluye un bloque MTP (Multi-Token Prediction) embebido que permite decodificación especulativa sin necesidad de un modelo draft separado. Además, incorpora una tabla n-gram nativa en BF16 para lecturas de disco, lo que añade 95,37 GiB adicionales en almacenamiento.

La relevancia de esta ficha radica en que documenta una de las pocas conversiones GGUF disponibles de un modelo multimodal de gran tamaño con edición abliterated, orientada a despliegue local en hardware Apple Silicon mediante DS4. El pipeline es image-text-to-text, por lo que el modelo acepta entradas de imagen y texto, y la licencia es qwen-community-1.0, con implicaciones importantes para uso comercial que se detallan más adelante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal y atención completa, bloque MTP embebido, tabla n-gram nativa BF16 |
| Parametros totales | 179.551.050.368 (~179,55 mil millones) |
| Parametros activos | no disponible (no se especifica si es MoE; la referencia a "shared-expert down projections" sugiere componentes tipo MoE, pero no se confirma el número de activos) |
| Longitud de contexto | no disponible en la información proporcionada (el ejemplo de ejecución usa `--ctx 8192`, pero no se indica el máximo soportado) |
| Tipos de cuantizacion | Q4_K mixto (Q4_K en gate/up experts enrutados, MXFP4 en down projections enrutadas, Q8_0 en tensores densos/control y en las 96 salidas residuales editadas); mmproj en Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (archivo principal `Qwen3.8-Flash-Next-abliterated-Q4_K.gguf`, 177,28 GB / 165,11 GiB; `mmproj-Qwen3.8-Flash-Next-Q8_0.gguf`, 616,70 MB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido que combina capas de atención lineal con capas de atención completa. La información proporcionada menciona explícitamente 36 proyecciones de salida de atención lineal (que requieren una permutación de columnas grouped-to-tiled en la cabeza V) y 12 proyecciones de salida de atención completa, lo que confirma la coexistencia de ambos mecanismos. El modelo incorpora un bloque MTP (Multi-Token Prediction) embebido, lo que habilita decodificación especulativa sin modelo draft externo, y una tabla n-gram nativa en BF16 para lecturas de disco. La referencia a "shared-expert down projections" (48 de ellas) sugiere una estructura con expertos compartidos, aunque la información no confirma si se trata de un MoE puro ni el número de parámetros activos.

El modelo original fue desarrollado por Qwen (Alibaba). La edición abliterated corre a cargo de mrfakename, que modifica 96 tensores de salida residual regenerándolos como Q8_0 directamente desde el checkpoint BF16 abliterated. Los pesos restantes del archivo principal y del bloque MTP se copian del release Q4 de antirez (`antirez/qwen3.8-flash-next-gguf`), cuyos pesos el autor reporta como no modificados por la abliteration. Los 128 shards de la tabla n-gram se reconstruyen desde el checkpoint abliterated como valores BF16 originales, con las constantes hash verificadas y la tabla combinada alineada a 64 KiB. El componente de visión sin modificar proviene de `ggml-org/Qwen3.8-Flash-Next-GGUF` y su SHA-256 coincide con el hash publicado en ese repositorio. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original.

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline declarado como image-text-to-text.
- Procesamiento de imágenes: el modelo acepta entradas visuales mediante el proyector multimodal `mmproj` en Q8_0.
- Razonamiento extendido: el modelo base Qwen3.8-Flash-Next soporta modo "thinking" (se mencionan ejecuciones de "thinking runs" en la model card), aunque la edición abliterated puede producir razonamientos sin respuesta final en algunos casos.
- Generación de código: la model card menciona retención de capacidad de codificación como criterio de selección del checkpoint, aunque no se evalúa explícitamente en esta conversión.
- Reducción de rechazos: la abliteration reduce drásticamente las negativas a responder, con tasas de éxito en HarmBench chat del 93,8% y en thinking del 86,7% según los datos de mrfakename (medidos sobre el modelo base, no sobre esta cuantización).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible explícitamente, aunque el modo thinking y el bloque MTP sugieren capacidad de razonamiento multi-paso.
- Capacidades multilingües: no disponible.
- Decodificación especulativa nativa mediante el bloque MTP embebido (requiere flag `--mtp` en DS4).

## Casos de uso

- Despliegue local en Macs con Apple Silicon: el paquete está diseñado específicamente para el backend Metal de DS4, lo que permite ejecutar un modelo de ~179,55 mil millones de parámetros en hardware de consumo de gama alta (Mac Studio con memoria unificada amplia) sin depender de GPUs de datacenter.
- Análisis de imágenes con descripción textual: gracias al pipeline image-text-to-text y al proyector `mmproj` en Q8_0, el modelo puede procesar imágenes y generar descripciones, responder preguntas sobre su contenido o extraer información estructurada, integrándose en flujos de accesibilidad o catalogación.
- Investigación sobre alineación y seguridad: la variante abliterated permite estudiar el comportamiento del modelo sin el sesgo de rechazo, útil para analizar cómo responde ante prompts sensibles en entornos de investigación controlados.
- Generación de código asistida en local: aunque no se evalúa explícitamente, la retención de capacidad de codificación se cita como criterio de selección; puede usarse en entornos de desarrollo con requisitos de privacidad donde no se permite enviar código a APIs externas.
- Prototipado de asistentes conversacionales con contexto de 8k tokens: el ejemplo de ejecución con `--ctx 8192` y `--prefill-chunk 1024` permite desplegar un asistente multi-turno con ventana moderada para pruebas de concepto.
- Experimentación con decodificación especulativa: el bloque MTP embebido permite medir el impacto del MTP en latencia y throughput sin necesidad de gestionar un modelo draft separado, útil para benchmarking de técnicas de aceleración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de esta cuantización concreta en la información disponible. La model card incluye resultados de una comparación relacionada con DeepSeek V4.1 Flash 1017 (no de este modelo Qwen), que se reproducen a continuación solo como contexto del proceso de selección del checkpoint base, no como evaluación de esta conversión:

| Test | Original | Mrfakename | Pqhaz heretic | MoonMath |
|---|---:|---:|---:|---:|
| HarmBench chat | 16,3% | 93,8% | 93,8% | 92,1% |
| HarmBench thinking | 3,8% | 86,7% | 72,9% | 82,5% |
| MITRE substantive assistance | 16,2% | 84,2% | 82,8% | 83,1% |
| Benign-prompt refusals | No reportado | 0/750 | 0/750 | 0/750 |

Estos datos corresponden a checkpoints completos de DeepSeek V4.1 Flash 1017 evaluados mediante SGLang en una H200, a temperatura 0 y con un límite de 16k tokens de salida. No son benchmarks de esta conversión Qwen ni de su cuantización, y no establecen una clasificación universal de métodos ni de capacidad de retención de conocimiento o codificación.

## Requisitos de hardware

- VRAM/memoria estimada: los pesos residentes principales y del MTP ocupan aproximadamente 69,74 GiB, más memoria de runtime y contexto. La tabla n-gram nativa en BF16 ocupa otros 95,37 GiB en disco y debe residir en un SSD local rápido.
- GPU recomendadas: el paquete está optimizado para el backend Metal de DS4 en Apple Silicon (Macs con memoria unificada amplia). No se especifican GPUs NVIDIA o AMD en la información proporcionada.
- ¿Cabe en GPU de consumo? No en GPUs consumer convencionales con 24 GB de VRAM. Requiere hardware con memoria unificada o VRAM muy elevada (el propio autor remite a la guía de DS4 para máquinas más pequeñas y streaming desde SSD).
- Opciones de despliegue: DS4 (DwarfStar) de antirez, con flags `--mtp` para decodificación especulativa y `--vision` para el proyector multimodal. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este paquete concreto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (daemonix Q4 DS4) | ~179,55 mil M | no disponible | qwen-community-1.0 | GGUF Q4_K mixto | Abliterated, MTP embebido, multimodal, optimizado para DS4/Metal |
| antirez/qwen3.8-flash-next-gguf | no disponible | no disponible | no disponible | GGUF Q4 | Release de referencia sin abliteration; pesos base de este paquete |
| mrfakename/Qwen3.8-Flash-Next-abliterated | no disponible | no disponible | no disponible | BF16 (checkpoint) | Checkpoint abliterated de origen; requiere conversión para GGUF |
| ggml-org/Qwen3.8-Flash-Next-GGUF | no disponible | no disponible | no disponible | GGUF | Conversión oficial del modelo sin abliteration; fuente del mmproj |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La abliteration reduce los rechazos pero no elimina el riesgo de contenido dañino; el modelo puede generar respuestas que el modelo original rechazaría. Úsese con cautela en producción y con filtros externos si es necesario.
- Riesgo de razonamiento sin respuesta final: la model card reporta casos de "thinking runs" que agotan el presupuesto de tokens sin producir respuesta final (21 casos en la comparación de DeepSeek con el checkpoint de mrfakename). Este problema no se elimina con la abliteration.
- La licencia qwen-community-1.0 impone restricciones que deben revisarse antes de uso comercial; no es una licencia permisiva tipo Apache 2.0 o MIT.
- Los benchmarks incluidos en la model card corresponden a DeepSeek V4.1 Flash, no a este modelo Qwen; no deben interpretarse como evaluación de esta conversión.
- El tamaño del repositorio (177,9 GB) y la tabla n-gram (95,37 GiB adicionales) exigen almacenamiento local considerable y SSD rápido; el streaming desde disco puede degradar la latencia.
- No se dispone de información sobre sesgos, idiomas soportados ni límites máximos de contexto; la ventana de 8192 tokens del ejemplo es solo una configuración de ejecución, no el máximo garantizado.
- La cuantización Q4_K mixta puede introducir pérdida de precisión respecto al checkpoint BF16 original; no se han publicado evaluaciones de retención de conocimiento o codificación para esta conversión.
- El modelo está empaquetado específicamente para DS4; no se garantiza compatibilidad con otros runtimes GGUF como llama.cpp u Ollama.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/daemonix/Qwen3.8-Flash-Next-abliterated-Q4-GGUF-antirez-DS4
- Modelo base abliterated: https://huggingface.co/mrfakename/Qwen3.8-Flash-Next-abliterated
- Release Q4 de referencia: https://huggingface.co/antirez/qwen3.8-flash-next-gguf
- Conversión GGUF oficial (fuente del mmproj): https://huggingface.co/ggml-org/Qwen3.8-Flash-Next-GGUF
- Runtime DS4 (DwarfStar): https://github.com/antirez/ds4
- Guía de Qwen en DS4: https://github.com/antirez/ds4/blob/main/docs/QWEN38_FLASH_NEXT.md
- Comparación relacionada DeepSeek V4.1 Flash (Reddit): https://www.reddit.com/r/LocalLLaMA/comments/1xyv1oc/
