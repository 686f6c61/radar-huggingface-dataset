# axteam/GLM-4.7-Flash-FP8-dynamic

## Resumen

GLM-4.7-Flash-FP8-dynamic es una cuantización de 8 bits del modelo `zai-org/GLM-4.7-Flash`, publicada por el usuario axteam en Hugging Face. Se trata de un transformer de mezcla de expertos (MoE) de 31.221.488.576 parámetros totales, etiquetado como `glm4_moe_lite` / `Glm4MoeLite`, con una longitud de contexto declarada de 202K tokens y orientado exclusivamente a generación de texto. El modelo base lo desarrolla zai-org (Zhipu AI) y esta versión cuantizada mantiene la licencia MIT del original.

El interés de esta ficha no está en el modelo base, sino en el formato de cuantización: se aplica FP8 dinámico en esquema W8A8 (pesos FP8 E4M3 por canal, activaciones FP8 dinámicas por token) mediante `compressed-tensors` con esquema `FP8_DYNAMIC`. El objetivo es servir el modelo en vLLM reduciendo el peso en disco y en VRAM hasta aproximadamente 32,2 GB, manteniendo en BF16 las partes sensibles a la precisión (embeddings, LM head, RMSNorms y el router MoE).

La relevancia práctica es doble: por un lado, permite desplegar un MoE de 31B con contexto muy largo en hardware más modesto que su versión BF16; por otro, la cuantización es data-free (sin calibración), lo que simplifica la reproducibilidad pero traslada a la práctica cualquier degradación de precisión que no se ha documentado en la model card. No hay datos publicados de benchmarks ni de idiomas soportados en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`glm4_moe_lite` / `Glm4MoeLite`), texto únicamente |
| Parametros totales | 31.221.488.576 (31,2B) |
| Parametros activos | no disponible |
| Longitud de contexto | 202K tokens (según model card); ejemplo de despliegue con `--max-model-len 32768` |
| Tipos de cuantizacion | FP8 dinámico W8A8: pesos FP8 E4M3 por canal, activaciones FP8 dinámicas por token; esquema `compressed-tensors` `FP8_DYNAMIC`; embeddings, LM head, RMSNorms y router MoE (`mlp.gate`, `e_score_correction_bias`) en BF16 |
| Idiomas soportados | no disponible (la model card no lista idiomas; el ejemplo de uso está en coreano) |
| Licencia | MIT |
| Formato de pesos | safetensors con `compressed-tensors` (`float-quantized`); tamaño del repo ≈ 32,2 GB |
| Modelo base | `zai-org/GLM-4.7-Flash` (relación: quantized) |
| Runtime recomendado | vLLM ≥ 0.15.0 (probado con vLLM 0.32.0); transformers ≥ 5.15.0 sin vLLM |
| Requiere `trust_remote_code` | No |

## Arquitectura y entrenamiento

La arquitectura es un transformer de mezcla de expertos (`Glm4MoeLite`) de 31,2B parámetros totales, texto únicamente. La model card no detalla el número de expertos, el número de parámetros activos por token, la composición del dataset de entrenamiento ni si hubo fases de RLHF o DPO en el modelo base; esos datos corresponden a `zai-org/GLM-4.7-Flash` y no se reproducen en esta ficha. Sí se indica que el modelo incluye una capa MTP (multi-token prediction) en `model.layers.47` (`eh_proj`, `shared_head.head`), que en esta cuantización se trata igual que el resto de capas.

La innovación técnica de esta publicación es la cuantización post-entrenamiento (PTQ) sin reentrenamiento ni datos de calibración. Los pesos se escalan por canal de salida en FP8 E4M3; las activaciones se cuantizan dinámicamente por token en tiempo de ejecución. Se preservan en BF16 los embeddings de tokens, el LM head, todas las RMSNorms y el router MoE, incluyendo el sesgo de corrección de puntuaciones (`e_score_correction_bias`), lo que evita degradar el enrutamiento entre expertos. El tokenizador y el `chat_template` son idénticos a los del modelo original. La model card indica que el modo "thinking" está activado por defecto en el chat template y puede desactivarse con `chat_template_kwargs={"enable_thinking": false}`.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat compatible con la API de OpenAI en vLLM.
- Razonamiento con modo "thinking" activado por defecto, desactivable por petición.
- Contexto largo de hasta 202K tokens declarados, lo que habilita tareas de documento completo, resumen de corpus extensos y conversaciones con historial muy largo.
- Predicción multi-token (capa MTP) heredada del modelo base.
- Inferencia en FP8 con decodificación compatible con vLLM (servidor OpenAI-compatible y API Python `LLM.chat`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (la model card no lista idiomas; el ejemplo de la API está en coreano).
- Visión y audio: no soportados (modelo texto únicamente).

## Casos de uso

- Servicio de chat conversacional en producción con vLLM: el modelo se expone como endpoint OpenAI-compatible con `vllm serve ... --max-model-len 32768`, lo que permite integrarlo en aplicaciones existentes sin cambiar el cliente. Es adecuado porque el checkpoint está empaquetado para ese runtime y conserva el chat template original.
- Procesamiento de documentos largos: con 202K tokens de contexto declarados se pueden pasar contratos, informes o expedientes completos en una sola petición para extracción de datos y resumen. Requiere ajustar `--max-model-len` y dimensionar la KV cache en consecuencia.
- Asistentes con historial extenso: conversaciones de atención al cliente o soporte técnico que acumulan muchos turnos caben en la ventana sin truncar, manteniendo coherencia sobre el hilo completo.
- Despliegue en una sola GPU de 80 GB (A100/H100) o en varias con tensor parallelism: los 32,2 GB de pesos dejan espacio para KV cache y grafos CUDA; con `--tensor-parallel-size N` se reparte entre GPUs cuando no cabe en una.
- Generación de código y texto técnico en pipelines internos: el modelo base es de propósito general; esta versión FP8 reduce el coste por token frente a BF16, lo que la hace apta para tareas de alto volumen donde la precisión exacta no es crítica.
- Reducción de huella de memoria en contexto largo: activando `--kv-cache-dtype fp8` se aproximadamente reduce a la mitad la memoria de KV cache, lo que permite servir más peticiones concurrentes o contextos más largos en el mismo hardware.
- Evaluación comparativa de cuantizaciones: al ser data-free y con esquema `FP8_DYNAMIC`, sirve como referencia para medir la degradación de un MoE de 31B bajo FP8 frente al BF16 original en tareas propias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparaciones de perplejidad frente al modelo base en BF16, por lo que no es posible cuantificar la degradación introducida por la cuantización FP8.

## Requisitos de hardware

- VRAM para pesos: 32,2 GB en FP8. Añadir KV cache (proporcional a longitud de contexto × peticiones concurrentes) y varios GB para activaciones y grafos CUDA.
- GPU soportadas: NVIDIA Turing (sm75, p. ej. T4) o superior. V100 (sm70) no está soportada. El cálculo FP8 nativo requiere Ada, Hopper o Blackwell (sm89+); en Turing y Ampere vLLM cambia automáticamente a FP8 solo de pesos.
- Verificación real: la model card indica que solo se ejecutó en B200; el resto de GPUs se deduce del código de selección de kernels de vLLM 0.32.
- Cabe en GPU de consumo: no disponible de forma confirmada. Por tamaño de pesos (32,2 GB) no cabe en GPUs de 24 GB sin tensor parallelism o sin una cuantización adicional de menor precisión; en una RTX 4090 (24 GB) no entra en FP8 tal cual.
- Despliegue recomendado: vLLM 0.32.0 (Python 3.11–3.14, torch 2.13 con build CUDA 13.0, transformers ≥5.16.1,<5.20, compressed-tensors 0.17.0 fijado por vLLM). Sin vLLM, transformers ≥5.15.0.
- Tensor parallelism: usar `--tensor-parallel-size N` cuando los pesos no quepan en una GPU.
- KV cache: BF16 por defecto; `--kv-cache-dtype fp8` reduce aproximadamente a la mitad su memoria.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Runtime |
|---|---|---|---|---|---|
| axteam/GLM-4.7-Flash-FP8-dynamic | 31,2B (MoE) | 202K | FP8 W8A8 dinámico | MIT | vLLM ≥0.15.0 |
| zai-org/GLM-4.7-Flash (base) | 31,2B (MoE) | 202K | BF16 | MIT | transformers / vLLM |
| GLM-4.7-Flash Unsloth Dynamic Quants (FP8) | 31,2B (MoE) | 202K | FP8 dinámico | no disponible | vLLM |

La comparación con otras alternativas de la misma categoría (otros MoE de ~30B con contexto largo) no está disponible en la información proporcionada. Los datos de rendimiento comparado entre esta cuantización y el modelo base en BF16 tampoco se han publicado.

## Limitaciones y advertencias

- No hay benchmarks publicados: se desconoce la degradación de precisión frente al modelo base en BF16. La cuantización es data-free, sin calibración con datos representativos, lo que puede afectar de forma desigual a distintas tareas.
- El router MoE se mantiene en BF16, pero las proyecciones de atención y MLP sí están cuantizadas; en cargas de razonamiento largo conviene validar la calidad con evaluaciones propias antes de producción.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento multilingüe homogéneo; el único ejemplo de la model card está en coreano.
- Riesgo de alucinación: inherente a los modelos generativos; no hay documentación específica del modelo base en esta ficha.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Restricciones de licencia: MIT, permite uso comercial y modificación, pero se debe conservar el aviso de copyright y la atribución al modelo base `zai-org/GLM-4.7-Flash`.
- Dependencias frágiles: vLLM 0.32.0 fija transformers y compressed-tensors; actualizar compressed-tensors por separado puede romper la carga del checkpoint (guardado con 0.19.0, leído con 0.17.0).
- Soporte de GPU limitado en la práctica: solo verificado en B200; en Turing y Ampere se degrada a FP8 solo de pesos, con menor ganancia de rendimiento.
- Contexto de 202K declarado pero los ejemplos de despliegue usan `--max-model-len 32768`; servir la ventana completa exige mucha más memoria de KV cache.
- El modo "thinking" está activado por defecto y aumenta el consumo de tokens; debe desactivarse explícitamente cuando no se necesite.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/axteam/GLM-4.7-Flash-FP8-dynamic
- Modelo base: https://huggingface.co/zai-org/GLM-4.7-Flash
- Hilo de Unsloth sobre cuantizaciones FP8 de GLM-4.7-Flash: https://www.reddit.com/r/unsloth/comments/1qndg98/new_fp8_glm47flash_unsloth_dynamic_quants_for/
- Guía de Unsloth para usar cuantizaciones FP8 en vLLM: https://unsloth.ai/docs/models/glm-4.7-flash#glm-4.7-flash-in-vllm
