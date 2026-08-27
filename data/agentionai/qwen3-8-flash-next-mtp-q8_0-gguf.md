# agentionai/Qwen3.8-Flash-Next-MTP-Q8_0-GGUF

## Resumen

Qwen3.8-Flash-Next-MTP-Q8_0-GGUF es la cabeza de predicción multi-token (MTP) del modelo Qwen/Qwen3.8-Flash-Next, cuantizada en Q8_0 y empaquetada en formato GGUF. La publica el usuario agentionai en Hugging Face como un componente auxiliar para acelerar la inferencia del modelo principal mediante decodificación especulativa. El modelo base es un MoE ultra-disperso de 125B parámetros con 6B activos por token, desarrollado por el equipo de Qwen, con soporte multimodal y una ventana de contexto de 262K tokens.

La relevancia de esta pieza es práctica: en lugar de usar un modelo draft pequeño y separado, Qwen entrena la cabeza MTP conjuntamente con el modelo principal, lo que produce drafts de mayor calidad y una tasa de aceptación más alta. El repo contiene solo la cabeza MTP cuantizada a Q8_0, con unos 3.878 millones de parámetros y un peso de 4,1 GB. No es un modelo autónomo: requiere el GGUF del modelo base Qwen3.8-Flash-Next y una rama específica de llama.cpp que aún no está integrada en el upstream.

El autor incluye mediciones propias en una Radeon 8060S que muestran mejoras de throughput de hasta un 21% en el target UD-IQ4_XS y un 7,8% en ROCmFP4-FAST, con tasas de aceptación de 0,623 y 0,587 respectivamente. También señala que una versión de 4 bits de la misma cabeza es más rápida en ambos targets y ocupa 1,6 GiB menos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MTP draft head (predicción multi-token) sobre Qwen3.8-Flash-Next |
| Parametros totales | 3.878.549.248 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo base) |
| Tipos de cuantizacion | Q8_0 (este repo); existe variante ROCmFP4-FAST |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El MTP head es una cabeza de predicción multi-token entrenada conjuntamente con el modelo principal Qwen3.8-Flash-Next. En lugar de predecir un solo token por paso, el MTP predice varios tokens futuros en paralelo, de modo que puede usarse como draft en un esquema de decodificación especulativa. La ventaja frente a un draft model separado es que, al entrenarse con el modelo objetivo, sus predicciones tienen una tasa de aceptación mayor, lo que reduce las iteraciones de verificación y mejora el throughput.

El modelo base Qwen3.8-Flash-Next es un MoE ultra-disperso de 125B parámetros (6B activos por token) construido sobre la arquitectura Qwen4, que combina Gated DeltaNet (GDN) en tres de cada cuatro capas y Qwen Sparse Attention (QSA) en la cuarta, además de una tabla de embeddings N-gram de 51B parámetros. La cabeza MTP cuantizada en Q8_0 es un módulo separado que se carga junto al modelo principal en llama.cpp mediante la opción `-md` y el parámetro `--spec-type draft-mtp`.

El soporte de Qwen3.8-Flash-Next en llama.cpp es trabajo de Daniel Han (PR #27742) y el grafo MTP de JJJYmmm (PR #27739), ambos aún en una rama de desarrollo, no en el upstream.

## Capacidades

- No es un modelo de generación autónoma: actúa como draft en decodificación especulativa para acelerar la inferencia del modelo base Qwen3.8-Flash-Next.
- Predicción multi-token: permite especular hasta 3 tokens por paso (`--spec-draft-n-max 3`).
- Compatible con los targets UD-IQ4_XS y ROCmFP4-FAST del modelo base, con tasas de aceptación medidas de 0,623 y 0,587 respectivamente.
- No soporta tool calling, vision, audio ni funciones de razonamiento por sí mismo; hereda las capacidades del modelo base al usarse como draft.
- Requiere una rama específica de llama.cpp con soporte para Qwen4 y MTP (no disponible en el upstream).
- Disponible también en cuantizacion ROCmFP4-FAST (4 bits), que ocupa 1,6 GiB menos y es más rápida en las mediciones publicadas.

## Casos de uso

- Aceleración de inferencia en entornos de producción con GPUs AMD: el autor reporta mejoras de throughput en una Radeon 8060S, lo que permite servir el modelo base con mayor velocidad sin perder calidad en la generación.
- Despliegue local de Qwen3.8-Flash-Next en hardware de consumo: al añadir la cabeza MTP, se puede reducir la latencia por token y mejorar la experiencia en aplicaciones interactivas como asistentes conversacionales o chatbots.
- Entornos con VRAM limitada: para usuarios que ya ejecutan el modelo base en cuantizaciones ligeras (UD-IQ4_XS o ROCmFP4-FAST), la cabeza MTP añade solo ~3,9 GiB adicionales, lo que permite acelerar la inferencia sin necesidad de una GPU más grande.
- Desarrollo de aplicaciones de generación de código o texto largo: la decodificación especulativa reduce el tiempo de generación, lo que es crítico en tareas con respuestas extensas o con ventanas de contexto grandes (hasta 262K tokens).
- Investigación en decodificación especulativa: el MTP head es un caso de estudio de cómo una cabeza entrenada conjuntamente con el modelo principal mejora la tasa de aceptación frente a un modelo draft independiente.
- Optimización de costes de inferencia: al reducir el número de pasos de decodificación, se reduce el coste computacional por petición, lo que puede amortizar la inversión en hardware en servicios de inferencia a gran escala.

## Benchmarks y rendimiento

El autor publica mediciones propias en una Radeon 8060S, con 250 tokens generados a temperatura 0 y después de un warm-up:

| Target (modelo base) | Sin draft | Con MTP head | Tasa de aceptación |
|---|---|---|---|
| UD-IQ4_XS | 24,2 t/s | 29,3 t/s | 0,623 |
| ROCmFP4-FAST | 28,1 t/s | 30,3 t/s | 0,587 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) para este MTP head en la información disponible, ya que no es un modelo de generación completo. Las métricas relevantes son la tasa de aceptación y el throughput.

## Requisitos de hardware

- VRAM adicional: aproximadamente 3,9 GiB en Q8_0 (4,1 GB en disco), que se suman a la VRAM del modelo base. La versión ROCmFP4-FAST ocupa 1,6 GiB menos.
- GPU recomendada: la medición se realizó en una Radeon 8060S con soporte Vulkan y ROCmFP4, pero el modelo es agnóstico de arquitectura y puede funcionar en cualquier GPU que soporte llama.cpp con la rama adecuada.
- Compatible con GPUs consumer: sí, si el modelo base cabe en la VRAM de la GPU. Por ejemplo, con UD-IQ4_XS y el MTP Q8_0, la VRAM total necesaria es aproximadamente el peso del modelo base cuantizado más ~3,9 GB.
- Opciones de despliegue: llama.cpp con la rama de LaurentZuijdwijk (checkout `vulkan/qwen4exp-rocmfpx`), usando `llama-server` con los flags `-md` para el draft y `--spec-type draft-mtp`.
- No soportado en vLLM, Ollama o TGI de momento, ya que el soporte de Qwen4 y MTP está solo en la rama mencionada de llama.cpp.
- Latencia y throughput: en la Radeon 8060S, se observa un aumento de 24,2 a 29,3 t/s en UD-IQ4_XS y de 28,1 a 30,3 t/s en ROCmFP4-FAST. El autor indica que la versión de 4 bits del head es más rápida en ambos targets.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Uso |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-MTP-Q8_0-GGUF (este) | 3,88B (MTP head) | no aplica | GGUF Q8_0 | qwen-community-1.0 | Draft para decodificación especulativa |
| Qwen3.8-Flash-Next-MTP-ROCmFP4-FAST-GGUF | 3,88B (MTP head) | no aplica | GGUF ROCmFP4-FAST | qwen-community-1.0 | Draft, más rápido y menor peso |
| Modelos draft típicos (p.ej. Qwen2.5-0.5B o 1.5B) | 0,5B-1,5B | variable | GGUF | variable | Draft alternativo, pero con menor tasa de aceptación |

La comparación principal es con la versión ROCmFP4-FAST del mismo head: el autor indica que es más rápida en ambos targets y más ligera, por lo que es la opción preferible para hardware ROCm. La alternativa de usar un modelo pequeño separado como draft (p.ej. un Qwen de 0,5B) suele dar tasas de aceptación más bajas porque no está entrenado conjuntamente con el modelo objetivo.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el GGUF del modelo base Qwen3.8-Flash-Next y una rama específica de llama.cpp que aún no está integrada en el upstream. Esto complica el despliegue en entornos de producción estándar.
- La licencia es Qwen Community License 1.0, que no es una licencia open source estándar; hay que revisar las condiciones de uso comercial.
- La tasa de aceptación medida (0,587-0,623) implica que aún se producen rechazos y re-verificaciones; no elimina la necesidad de un modelo de verificación.
- El rendimiento medido es de un solo entorno (Radeon 8060S, 250 tokens); en otros hardware o con cargas distintas los resultados pueden variar.
- No se han publicado datos sobre sesgos, alucinación o calidad de la generación, ya que esto depende del modelo base, no del head.
- El modelo base Qwen3.8-Flash-Next es un MoE de 125B parámetros que requiere hardware de alta capacidad; la cabeza MTP solo es útil si ya se tiene capacidad para el modelo principal.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentionai/Qwen3.8-Flash-Next-MTP-Q8_0-GGUF
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Versión ROCmFP4-FAST del head: https://huggingface.co/agentionai/Qwen3.8-Flash-Next-MTP-ROCmFP4-FAST-GGUF
- Repositorio oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Documentación de unsloth sobre Qwen3.8-Flash-Next: https://unsloth.ai/docs/models/qwen3.8-next
- Página del modelo en QwenCloud: https://www.qwencloud.com/models/qwen3.8-flash
- PR de llama.cpp con soporte Qwen4 (danielhanchen): https://github.com/ggml-org/llama.cpp/pull/27742
- PR de llama.cpp con grafo MTP (JJJYmmm): https://github.com/ggml-org/llama.cpp/pull/27739
- Rama de llama.cpp con soporte MTP: https://github.com/LaurentZuijdwijk/llama.cpp (branch `vulkan/qwen4exp-rocmfpx`)
