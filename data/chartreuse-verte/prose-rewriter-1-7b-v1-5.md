# chartreuse-verte/prose-rewriter-1.7b-v1.5

## Resumen

`prose-rewriter-1.7b-v1.5` es un modelo de reescritura de prosa a nivel de párrafo desarrollado por el usuario `chartreuse-verte`. Su función principal es tomar texto generado por un modelo de lenguaje grande y re-renderizarlo para que suene más humano, preservando la semántica original. Está construido sobre la base `Qwen/Qwen3-1.7B-Base` con un LoRA de rango 32 fusionado a una fuerza de 1.20, lo que da un total de 2.031.739.904 parámetros. Es la sucesión de la versión 1.4, con mejoras en la frecuencia de edición y reducción de pasadas sin cambios.

El modelo está pensado para combatir el "slop" (texto genérico y detectable como generado por IA) en contenidos escritos. Su relevancia actual radica en la creciente necesidad de humanizar salidas de LLM en aplicaciones de producción, blogs, foros y comunicación digital. No es un modelo de chat, sino un reescritor especializado con un formato de prompt propio que incluye un bloque `edit` obligatorio para indicar el tipo de transformación deseada. Está disponible en formatos `safetensors` (bf16) y `GGUF` cuantizado, con licencia AGPL-3.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3) con LoRA fusionada |
| Parametros totales | 2.031.739.904 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del base, no especificada) |
| Tipos de cuantizacion | bf16, GGUF Q8_0, GGUF Q4_K_M |
| Idiomas soportados | inglés |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3-1.7B-Base`, un transformer causal de 1.700 millones de parámetros, y le aplica un LoRA de rango 32 que se fusiona con los pesos base a una fuerza de 1.20. El resultado es un modelo de 2.031.739.904 parámetros totales. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens o el uso de técnicas como RLHF o DPO. La innovación principal es el diseño del prompt: un bloque `edit` obligatorio que clasifica la entrada en tres modos (`match`, `inflate`, `compress`) y que condiciona el comportamiento del modelo. El head de salida adaptado se mantiene separado de las embeddings de tokens en las versiones cuantizadas, lo que permite conservar la calidad de la reescritura.

## Capacidades

- Reescritura de prosa a nivel de párrafo, preservando la semántica y haciendo el texto más natural.
- Tres modos de edición controlados por el bloque `edit`: `match` (reescribir sin cambiar longitud), `inflate` (expandir texto comprimido) y `compress` (condensar texto inflado).
- Transferencia de estilo: reduce marcadores típicos de texto generado por IA (repeticiones, construcciones rígidas, negaciones forzadas).
- Manejo de entradas de entre 15 y 70 palabras aproximadamente, con buen comportamiento en párrafos completos.
- Integración con el ecosistema `transformers` y `llama.cpp` mediante GGUF.
- No es un modelo de chat: el template rechaza valores de `edit` no válidos y trata cualquier otro rol como párrafo fuente.

## Casos de uso

- Humanización de contenido generado por LLM en blogs y artículos: se pasa el borrador generado por un modelo grande al reescritor con modo `match` para obtener una versión más natural y menos detectable como IA.
- Post-procesamiento de respuestas de chatbots en producción: el modelo puede reescribir las salidas de un asistente conversacional para que suenen menos robóticas, mejorando la experiencia del usuario.
- Edición de prosa creativa (cuentos, novelas, guiones): los escritores pueden usar el modo `match` para pulir párrafos sin alterar la extensión, o `inflate`/`compress` para ajustar la densidad narrativa.
- Reducción de redundancia en documentos largos: el modo `compress` condensa párrafos inflados, útil para resumir informes o correos extensos manteniendo el contenido clave.
- Preparación de datasets de entrenamiento: se puede usar para limpiar y reescribir texto generado por IA en corpus, eliminando patrones repetitivos antes de usarlo para fine-tuning.
- Adaptación de contenido para foros y redes sociales: el modelo reescribe respuestas o publicaciones para que encajen con un registro más coloquial y humano, reduciendo el riesgo de que sean marcadas como spam.

## Benchmarks y rendimiento

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). El autor proporciona una evaluación propia comparando v1.5 con v1.4 sobre 365 párrafos de prosa generada por LLM, con tres muestras por párrafo a `temperature=0.9, top_p=0.9`. Los resultados, medidos sobre 356 entradas de 51 palabras o más, son:

| Metrica | v1.4 | v1.5 | Cambio |
|---|---|---|---|
| Palabras cambiadas | 31.6% | 37.7% | +8.94 (t pareada) |
| Pasadas sin cambios | 12.6% | 4.8% | -6.67 |
| Por debajo del umbral de edición | 62.6% | 49.7% | -7.08 |
| Salidas casi literales | 6.4% | 2.0% | -4.67 |
| Movimiento de límites de frase | 69.8% | 77.2% | +4.09 |
| Variedad de longitud de frase vs entrada | +0.112 | +0.128 | +2.33 |
| Palabras conservadas de la entrada | 0.727 | 0.674 | -10.69 |
| Preservación de longitud | 0.899 | 0.880 | -3.84 |
| Truncado por debajo de 0.75x | 13.6% | 15.8% | +1.59 |
| Trigramas repetidos | 0.005 | 0.006 | +1.01 |

Estos datos indican que v1.5 edita más activamente que v1.4, con menos pasadas sin cambios y mayor reestructuración de frases, aunque conserva ligeramente menos palabras del original.

## Requisitos de hardware

- VRAM estimada: para el formato bf16 (safetensors), se necesitan aproximadamente 4 GB de VRAM para los pesos (2.03B parámetros × 2 bytes), más overhead de activaciones y KV cache, por lo que se recomienda al menos 6 GB. Para GGUF Q8_0 (2.17 GB) bastan unos 3-4 GB, y para Q4_K_M (1.28 GB) unos 2-3 GB.
- GPU recomendadas: cualquier GPU con 6 GB o más (RTX 3060, RTX 4060, RTX 2070, etc.) puede ejecutar la versión bf16. Las versiones cuantizadas funcionan en GPUs de 4 GB o incluso menos, como GTX 1650 o RTX 3050.
- Despliegue: compatible con `transformers` (carga directa), `llama.cpp`/`llama-cpp-python` para GGUF, y `text-generation-inference` (TGI) según los tags del repositorio. También es compatible con endpoints de Hugging Face.
- Latencia y throughput: no disponibles en la información proporcionada, pero al ser un modelo de 2B parámetros, la generación es rápida en hardware consumer (típicamente decenas de tokens por segundo en una RTX 3060).

## Comparativa con modelos similares

No existen muchos modelos open source especializados en reescritura de prosa con este enfoque. La comparación más directa es con las versiones anteriores del mismo autor:

| Modelo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| prose-rewriter-1.7b-v1.5 | 2.03B | no disponible | Reescritura con bloque `edit` | AGPL-3.0 |
| prose-rewriter-1.7b-v1.4 | 2.03B | no disponible | Reescritura, menos edición activa | AGPL-3.0 |
| prose-rewriter-1.7b-v1.2 | 2.03B | no disponible | Reescritura, versión anterior | AGPL-3.0 |

Otras alternativas genéricas como Llama 3.1 8B o Mistral 7B pueden realizar tareas de reescritura mediante prompts, pero no están especializadas y requieren más recursos. No hay datos de rendimiento comparativo con estos modelos.

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidad multilingüe.
- El bloque `edit` es obligatorio: omitirlo degrada el modelo a su modo más agresivo de borrado, produciendo resultados no deseados.
- Entradas por debajo de 15 palabras provocan padding y fabricación de contenido no soportado por el original; se recomienda pasar el texto sin cambios en ese caso.
- No es un modelo de chat: el template rechaza valores de `edit` no válidos y no debe usarse para conversación general.
- Licencia AGPL-3.0: implica copyleft, por lo que cualquier uso comercial o distribución debe cumplir con los términos de la licencia, incluyendo la publicación del código fuente si se ofrece como servicio.
- Riesgo de alucinación en entradas cortas o ambiguas, como se indica en la documentación.
- No se han documentado sesgos específicos, pero al estar entrenado sobre prosa en inglés, puede reflejar sesgos del corpus subyacente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chartreuse-verte/prose-rewriter-1.7b-v1.5
- Versión 1.4: https://huggingface.co/chartreuse-verte/prose-rewriter-1.7b-v1.4
- Versión 1.2: https://huggingface.co/chartreuse-verte/prose-rewriter-1.7b-v1.2
- Despliegue en FriendliAI: https://friendli.ai/models/chartreuse-verte/prose-rewriter-1.7b-v1.4
- Proyecto Chartreuse (relacionado): https://github.com/OrbFrontend/Chartreuse/blob/main/README.md
