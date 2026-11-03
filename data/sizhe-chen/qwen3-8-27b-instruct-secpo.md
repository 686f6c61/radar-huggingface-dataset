# Sizhe-Chen/Qwen3.8-27B-Instruct-SecPO

## Resumen

Qwen3.8-27B-Instruct-SecPO es un ajuste fino del modelo multimodal Qwen/Qwen3.8-27B, publicado por el autor independiente Sizhe-Chen. El objetivo del modelo es endurecer la resistencia frente a *prompt injection* indirecta, es decir, instrucciones maliciosas incrustadas en documentos, resultados de herramientas o imágenes que el modelo procesa como datos no confiables. Para ello se aplica Secure Preference Optimization (SecPO), una variante de DPO descrita en el paper arXiv:2610.41998.

El checkpoint liberado es un merge completo en BF16 de los pesos LoRA (rango 64) sobre el modelo base fijado en la revisión `1d4bf0f2`, entrenado durante 300 pasos de optimizador sobre 18.951 pares de preferencia. Conserva la arquitectura multimodal `Qwen3_5ForConditionalGeneration` (27B parámetros, encoder visual incluido) y la ventana de contexto nativa de 262.144 tokens.

Su relevancia práctica radica en que aborda una de las superficies de ataque más problemáticas en despliegues agénticos: el contenido no confiable que entra en el contexto del modelo. No obstante, el modelo solo ha sido publicado con datos en inglés y no cuenta con benchmarks públicos en la información disponible, por lo que su adopción en producción debe validarse empíricamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (transformer causal multimodal con encoder visual) |
| Parametros totales | 27.781.427.952 (según safetensors); 27.214.765.568 según la model card |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 262.144 tokens (configuración nativa del modelo base) |
| Tipos de cuantizacion | no disponible (solo se publican pesos BF16) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (18 shards, 55.563.006.776 bytes, BF16) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.8-27B`, un transformer causal de 27B parámetros con encoder visual integrado que permite entrada image-text-to-text. El ajuste se realiza mediante LoRA (rango 64, alpha 8, dropout 0.1) sobre las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, lo que supone 318.767.104 parámetros entrenables (1,17 % del total). El entrenamiento usó BF16, DeepSpeed ZeRO-3, 16 workers de datos en dos nodos, batch efectivo de 64, AdamW con LR pico 1,2e-4, decaimiento lineal y 3 % de warmup.

La innovación central es el objetivo SecPO: en lugar de comparar respuestas preferidas y rechazadas bajo el mismo prompt, la política entrenable puntúa el par sobre el prompt *atacado*, mientras que la política de referencia congelada (LoRA desactivado) puntúa el mismo par sobre un prompt *limpio* reconstruido eliminando el span de inyección. Esto pondera más los ejemplos en los que el modelo base se ve más influido por la inyección. Se usa `beta=0.1` y no se incluye ningún dato de benchmarks de evaluación en el conjunto de entrenamiento. Los datos provienen de un subconjunto determinista de 18.951 registros (de 19.157 originales) filtrado por longitud: prompts atacados de hasta 512 tokens y secuencias prompt+respuesta de hasta 6.144 tokens. El modo de generación de preferencias es *thinking-off*.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Procesamiento de entradas multimodal image-text-to-text (encoder visual conservado).
- Resistencia reforzada frente a *prompt injection* indirecta cuando el contenido no confiable se coloca en el rol `input`.
- Separación explícita de frontera de confianza: instrucciones del usuario en `user`, datos no confiables en `input`.
- Razonamiento multi-paso y uso en pipelines agénticos (heredado del modelo base).
- Manejo de contexto largo (hasta 262.144 tokens en configuración nativa).
- Plantilla de chat compatible con Qwen3.8 que filtra delimitadores de control reservados del contenido no confiable.
- No se documenta soporte explícito de tool calling ni function calling en la información disponible.

## Casos de uso

- **Defensa de agentes con recuperación de documentos (RAG)**: colocar los fragmentos recuperados en el rol `input` permite que el modelo trate su contenido como datos y no como instrucciones, reduciendo el riesgo de que un documento envenenado redirija al agente.
- **Procesamiento de resultados de herramientas externas**: en pipelines donde el agente consume salidas de APIs de terceros, el modelo está entrenado para no obedecer instrucciones incrustadas en esas salidas, un escenario típico de inyección indirecta.
- **Análisis de correos y adjuntos no confiables**: clasificación y resumen de mensajes con contenido potencialmente malicioso, manteniendo la tarea original del usuario como instrucción autorizada.
- **Extracción de información de imágenes y documentos escaneados**: el encoder visual conservado permite procesar capturas o PDFs renderizados, con el contenido de la imagen tratado como no confiable.
- **Asistentes de atención al cliente con contexto largo**: la ventana de 262.144 tokens permite gestionar conversaciones e historiales extensos, aunque el soporte lingüístico está limitado al inglés.
- **Evaluación de robustez en investigación de seguridad**: servir como referencia endurecida frente al modelo base para medir la eficacia de SecPO en experimentos de *red teaming*.
- **Pipelines de moderación de contenido**: uso del modelo para inspeccionar texto de usuario y detectar intentos de manipulación dirigidos a otros sistemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de resistencia a inyección (por ejemplo, tasas de éxito de ataque) para este checkpoint.

## Requisitos de hardware

- **VRAM en BF16**: aproximadamente 55,6 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 80 GB para inferencia cómoda.
- **GPU recomendadas**: A100 80 GB, H100 80 GB, o configuraciones multi-GPU con tensor parallelism.
- **Consumer GPU**: no cabe en tarjetas de 24 GB (RTX 4090) en BF16 sin cuantización; no se publican pesos cuantizados en el repositorio.
- **Opciones de despliegue**: Transformers (probado con la versión 5.5.4), vLLM o TGI para serving de alto rendimiento; llama.cpp/Ollama requerirían conversión a GGUF no publicada.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Enfoque de seguridad |
|---|---|---|---|---|---|
| Qwen3.8-27B-Instruct-SecPO | 27,8B | 262.144 | Sí | Apache 2.0 | SecPO (DPO con referencia limpia) |
| Qwen/Qwen3.8-27B (base) | 27B | 262.144 | Sí | Apache 2.0 (según base) | Sin endurecimiento específico |
| Alternativas comparables de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación cuantitativa con otros modelos endurecidos frente a *prompt injection* no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está validado.
- No se han publicado benchmarks de seguridad ni de capacidad, por lo que la eficacia real de SecPO frente a ataques no verificados es desconocida.
- El modelo depende de una plantilla de chat específica: si no se coloca el contenido no confiable en `input` y no se usa `enable_thinking=False`, la protección puede degradarse.
- Riesgo de alucinación inherente al modelo base, no mitigado por el ajuste de preferencias.
- El entrenamiento se realizó sobre 300 pasos y 18.951 registros; el sobreajuste a los patrones de ataque del conjunto de entrenamiento es posible.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre robustez en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- El checkpoint mergeado en BF16 ocupa 55,6 GB, lo que limita su despliegue a infraestructura con GPU de gran memoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sizhe-Chen/Qwen3.8-27B-Instruct-SecPO
- Dataset de entrenamiento: https://huggingface.co/datasets/Sizhe-Chen/Qwen3.8-27B-Instruct-SecPO-trainset
- Paper SecPO: https://arxiv.org/abs/2610.41998
- Código oficial: https://github.com/Sizhe-Chen/SecPO
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
