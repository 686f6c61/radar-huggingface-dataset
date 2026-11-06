# hetoo24/my-qwen-model

## Resumen

`hetoo24/my-qwen-model` es, a pesar de su nombre, una cuantización en formato GGUF del modelo `TrevorJS/gemma-4-31B-it-uncensored`, una versión "abliterada" (sin mecanismos de rechazo) de `google/gemma-4-31B-it`. El autor del repositorio, hetoo24, publica dos ficheros GGUF (Q4_K_M y Q8_0) listos para su uso con llama.cpp y llama-server. El modelo cuenta con 30.697.345.596 parámetros según los pesos en safetensors del modelo base, lo que lo sitúa en la categoría de modelos densos de aproximadamente 31 mil millones de parámetros.

La relevancia de esta ficha es doble: por un lado, documenta una cuantización práctica de un modelo grande para despliegue local; por otro, ilustra el ecosistema de variantes "uncensored" derivadas de modelos abiertos mediante técnicas de abliteration. El modelo está orientado a generación de texto conversacional en inglés y se distribuye bajo licencia Apache 2.0 según los metadatos del repositorio, aunque el modelo base original (Gemma) tiene su propia licencia que conviene verificar.

La información disponible es limitada: el repositorio no incluye datos de benchmarks, no detalla la composición del dataset de entrenamiento y no especifica la longitud de contexto nativa del modelo base. Esta ficha refleja únicamente los datos verificables en la información proporcionada y marca explícitamente como "no disponible" todo aquello que no se puede confirmar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de google/gemma-4-31B-it); detalles de atención y capas no disponibles |
| Parametros totales | 30.697.345.596 (según safetensors del modelo base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (los ejemplos de uso emplean `-c 8192`, pero no se confirma el máximo nativo) |
| Tipos de cuantizacion | Q4_K_M (18,7 GB) y Q8_0 (32,6 GB) en GGUF; el modelo base está en bf16 |
| Idiomas soportados | Inglés (`en`) según los metadatos del repositorio |
| Licencia | Apache 2.0 (según metadatos del repo; verificar la licencia del modelo Gemma subyacente) |
| Formato de pesos | GGUF (cuantizaciones publicadas); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo es una cuantización GGUF de `TrevorJS/gemma-4-31B-it-uncensored`, que a su vez es una versión modificada de `google/gemma-4-31B-it`. La modificación principal consiste en una "abliteration" mediante *norm-preserving biprojected abliteration*, una técnica que elimina el comportamiento de rechazo (refusal) proyectando fuera del espacio de activaciones las direcciones asociadas a respuestas negativas, preservando la norma de los pesos para minimizar el daño al rendimiento general. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base.

La cuantización a GGUF la realiza el autor del repositorio (hetoo24) a partir del modelo bf16, generando dos variantes: Q4_K_M, que reduce el peso a 18,7 GB con una pérdida de precisión moderada, y Q8_0, de 32,6 GB, prácticamente indistinguible del original en calidad. No se documentan innovaciones adicionales como decodificación especulativa, atención lineal o arquitecturas híbridas en la información disponible.

## Capacidades

- Generación de texto conversacional en inglés, con soporte de diálogo multi-turno.
- Comportamiento "uncensored": se ha eliminado el rechazo a peticiones que el modelo original rechazaría, según la model card del modelo base.
- Razonamiento y generación de código: capacidades heredadas del modelo Gemma subyacente, aunque no se documentan resultados específicos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente.
- Capacidades multilingües: limitadas al inglés según los metadatos (`language: en`).
- Capacidades especiales (visión, audio, thinking mode): no disponibles en la información proporcionada.

## Casos de uso

- Despliegue local de un modelo de ~31B en hardware de consumo: la variante Q4_K_M (18,7 GB) permite ejecutar el modelo en GPUs con 24 GB de VRAM, como una RTX 4090, mediante llama.cpp o llama-server, con contexto de 8K según los ejemplos de la model card.
- Experimentación con modelos sin filtros de rechazo: útil para investigación sobre alineación, seguridad y comportamiento de modelos abliterados, comparando respuestas antes y después de la modificación.
- Generación de texto creativo sin restricciones: escritura de ficción, guiones o contenido narrativo donde el modelo original podría rechazar temáticas sensibles.
- Prototipado de asistentes conversacionales en inglés: el formato GGUF y la compatibilidad con llama-server permiten levantar una API local con interfaz de chat en pocos minutos.
- Evaluación de técnicas de cuantización: comparar Q4_K_M frente a Q8_0 para medir el impacto de la cuantización en tareas concretas de generación.
- Servicio de inferencia en entornos con recursos limitados: la variante Q4_K_M reduce el requisito de memoria en un 43 % respecto a Q8_0, facilitando el despliegue en servidores con una sola GPU.
- Fine-tuning posterior sobre el modelo base: el repositorio del modelo base en bf16 permite partir de los pesos completos para adaptaciones específicas antes de cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para Q4_K_M: ~19-21 GB (18,7 GB de pesos más overhead de contexto y KV cache).
- VRAM estimada para Q8_0: ~33-35 GB (32,6 GB de pesos más overhead).
- GPU recomendadas para Q4_K_M: RTX 4090 (24 GB), RTX 3090 (24 GB), A6000 (48 GB), L40S (48 GB).
- GPU recomendadas para Q8_0: A100 40 GB, A100 80 GB, H100 80 GB; en consumer, solo configuraciones multi-GPU o GPUs con 48 GB.
- ¿Cabe en consumer GPU? Q4_K_M sí, en GPUs de 24 GB; Q8_0 no en una sola GPU consumer.
- Opciones de despliegue: llama.cpp / llama-server (documentado en la model card), y por compatibilidad de formato GGUF, también Ollama y otros runners basados en llama.cpp. vLLM y TGI no soportan GGUF de forma nativa para este caso sin conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| hetoo24/my-qwen-model (esta ficha) | ~30,7B | No disponible | Apache 2.0 (metadatos) | GGUF (Q4_K_M, Q8_0) | Cuantización de gemma-4-31B-it-uncensored |
| TrevorJS/gemma-4-31B-it-uncensored | ~30,7B | No disponible | No disponible | bf16 (safetensors) | Modelo base abliterado, sin cuantizar |
| google/gemma-4-31B-it | ~30,7B | No disponible | Licencia Gemma (no verificada) | safetensors | Modelo original con alineación estándar |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El modelo ha sido abliterado: se ha eliminado el comportamiento de rechazo, lo que implica que puede generar contenido dañino, ofensivo o ilegal sin filtros. No es apto para despliegues públicos sin moderación adicional.
- Riesgo elevado de alucinación inherente a los modelos de ~31B, no cuantificado en la información disponible.
- Idiomas: solo inglés según los metadatos; el rendimiento en castellano no está garantizado ni documentado.
- Longitud de contexto nativa no confirmada; los ejemplos usan 8192 tokens, pero el máximo real puede diferir.
- Licencia: los metadatos indican Apache 2.0, pero el modelo deriva de Gemma, cuya licencia original impone restricciones de uso comercial que deben verificarse antes de producción.
- El nombre del repositorio (`my-qwen-model`) es engañoso: no es un modelo Qwen, sino Gemma. Esto puede provocar confusión en pipelines automatizados.
- Sin benchmarks publicados: no hay evidencia cuantitativa de la calidad tras la abliteration ni de la pérdida por cuantización.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni reportes de uso en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hetoo24/my-qwen-model
- Modelo base (bf16): https://huggingface.co/TrevorJS/gemma-4-31B-it-uncensored
- Modelo original de Google: https://huggingface.co/google/gemma-4-31B-it
- Código de la abliteration: https://github.com/TrevorS/gemma-4-abliteration
