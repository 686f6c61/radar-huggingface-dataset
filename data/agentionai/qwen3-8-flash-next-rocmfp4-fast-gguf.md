# agentionai/Qwen3.8-Flash-Next-ROCmFP4-FAST-GGUF

## Resumen

Qwen3.8-Flash-Next-ROCmFP4-FAST-GGUF es una cuantización en formato GGUF del modelo Qwen3.8-Flash-Next, desarrollada por el usuario agentionai para ejecutarse en APU AMD Strix Halo (Ryzen AI MAX+ 395 / Radeon 8060S) con 96 GiB de VRAM. El modelo base, creado por el equipo Qwen, es un MoE ultra-sparse de 125 mil millones de parámetros (incluyendo una tabla n-gram de 51,2 mil millones) que activa 6 mil millones por token, y combina atención Gated DeltaNet (GDN) con Qwen Sparse Attention (QSA) en una arquitectura híbrida que sirve de avance de la futura familia Qwen4.

Esta cuantización mezcla deliberadamente tres tipos de cuantización: Q4_0_ROCMFP4_FAST para los expertos MoE, atención y conexiones residuales; Q3_0_ROCMFPX para la tabla n-gram; y Q6_K para las capas de embedding y salida. El resultado ocupa aproximadamente 84 GiB, dejando unos 12 GiB para buffers de KV y cómputo en el carve-out de 96 GiB. Es una pieza de ingeniería muy específica que no funciona con llama.cpp estándar: requiere un fork con el soporte de la arquitectura `qwen4exp` (PR 27742, aún sin fusionar) y los tipos de cuantización ROCmFPx, un port manual de ciru-ai/ROCmFPX.

La relevancia de este archivo radica en que demuestra la viabilidad de ejecutar un modelo de 125B parámetros en hardware de consumo de gama alta, aunque con restricciones importantes de contexto y dependencia de un ecosistema de software no oficial. Es un trabajo de referencia para quienes quieran experimentar con la arquitectura Qwen4 en entornos locales, no una solución lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE ultra-sparse híbrida GDN + QSA (Gated DeltaNet y Qwen Sparse Attention) |
| Parametros totales | 125 B (incluye tabla n-gram de 51,2 B) |
| Parametros activos | 6 B por token |
| Longitud de contexto | no disponible (el ejemplo de ejecución usa -c 8192, pero el máximo del modelo base no se especifica) |
| Tipos de cuantizacion | Q4_0_ROCMFP4_FAST (expertos, atención, GDN, hyper-connections), Q3_0_ROCMFPX (tabla n-gram), Q6_K (token_embd, output) |
| Idiomas soportados | no disponibles |
| Licencia | qwen-community-1.0 (other) |
| Formato de pesos | GGUF (con tipos ROCmFP4, ROCmFPX y Q6_K) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un MoE ultra-sparse con 125B parámetros totales y 6B activos por token. Su arquitectura combina dos mecanismos de atención: tres de cada cuatro capas usan Gated DeltaNet (GDN), que comprime el historial de forma recurrente, y la cuarta capa emplea Qwen Sparse Attention (QSA) para recuperación precisa de contexto largo. Además incorpora una tabla n-gram de 51,2 mil millones de parámetros que actúa como memoria de patrones léxicos, y conexiones residuales con hyper-connections. Esta arquitectura es un avance de la familia Qwen4, publicada como early preview.

No se dispone de información sobre el entrenamiento del modelo base: número de tokens, composición del dataset, o si se aplicaron técnicas como RLHF o DPO. La cuantización es un trabajo de conversión de pesos, no un reentrenamiento. El proceso de cuantización requirió tres parches adicionales sobre el PR 27742 para manejar la tabla n-gram en FP8 (aplicación de escala escalar, cuantización por shards y procesamiento por bandas de filas en llama-quantize), lo que permitió reducir el scratch de 205 GB a 51 GB y el pico de memoria a un solo shard.

## Capacidades

- Generación de texto y razonamiento: al ser una cuantización del modelo Qwen3.8-Flash-Next, hereda las capacidades de generación de texto, razonamiento y comprensión del modelo base, aunque la cuantización puede degradar ligeramente la calidad.
- Multimodal: el modelo base es multimodal según la documentación de SGLang y vLLM, aunque no se especifican las modalidades exactas (probablemente imagen y texto). Esta cuantización no añade ni elimina capacidades, pero la ejecución en hardware específico puede limitar el procesamiento de entradas multimodales.
- MoE ultra-sparse: activa solo 6B parámetros por token, lo que permite un throughput relativamente alto para su tamaño total.
- Tabla n-gram: la tabla de 51,2B parámetros actúa como memoria de patrones, mejorando la coherencia y reduciendo la perplejidad. La cuantización Q3_0_ROCMFPX mantiene esta tabla con un coste de 3,50 bpw.
- No se ha confirmado soporte de tool calling, function calling, agentes o modo de razonamiento explícito en la información disponible.

## Casos de uso

- Inferencia local en APU de gama alta: el archivo está diseñado para Strix Halo (Ryzen AI MAX+ 395 / Radeon 8060S) con 96 GiB de VRAM. Se puede usar para ejecutar un modelo de 125B en un equipo de escritorio o estación de trabajo sin necesidad de GPUs dedicadas, ideal para entornos con requisitos de privacidad de datos.
- Asistente personal offline: con 6B parámetros activos y una tabla n-gram que mejora la coherencia, puede servir como base para un asistente conversacional que funcione sin conexión, procesando consultas de texto y posiblemente imágenes si el modelo base lo soporta.
- Investigación en arquitecturas MoE híbridas: al ser un early preview de Qwen4, permite a investigadores y desarrolladores estudiar el comportamiento de GDN + QSA y la tabla n-gram en un entorno local, sin depender de APIs en la nube.
- Prototipado de aplicaciones con contexto largo: aunque el contexto está limitado por el tamaño de KV (unos 12 GiB disponibles), se pueden probar aplicaciones con ventanas de hasta 8192 tokens, como análisis de documentos extensos o generación de informes.
- Desarrollo de herramientas de generación de código: el modelo base tiene capacidades de código (no confirmadas explícitamente, pero típicas en la serie Qwen), por lo que esta cuantización puede usarse para autocompletado o generación de código en entornos sin conexión, siempre que se acepte la degradación por cuantización.
- Evaluación de calidad de cuantización: el archivo sirve como referencia para medir el impacto de la cuantización ROCmFP4 en perplejidad y rendimiento, comparando con el modelo sin cuantizar o con otras variantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica reportada es la perplejidad en wikitext-2 raw, con 145 chunks a contexto 2048:

| Build | PPL |
|---|---|
| Referencia sin cuantizar (según PR 27742) | 4.0068 +/- 0.02271 |
| Este archivo (cuantizado) | medicion en progreso |
| Variante sin tabla n-gram, FP4 (no publicada) | 6.2089 +/- 0.03766 |

La diferencia entre la referencia y la variante sin tabla n-gram (55 % de aumento de perplejidad) demuestra que la tabla n-gram es esencial para la calidad del modelo. No se dispone de datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: aproximadamente 84 GiB para los pesos, más unos 12 GiB para KV y buffers de cómputo, totalizando cerca de 96 GiB. Requiere un carve-out de VRAM de 96 GiB.
- GPU recomendada: AMD Strix Halo (Ryzen AI MAX+ 395 / Radeon 8060S) con 96 GiB de memoria unificada. No cabe en GPUs de consumo típicas (RTX 4090 tiene 24 GB, RTX 5090 tiene 32 GB).
- Opciones de despliegue: exclusivamente el fork de llama.cpp de LaurentZuijdwijk (rama `vulkan/qwen4exp-rocmfpx`) con compilación Vulkan. No es compatible con llama.cpp estándar, vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles. El ejemplo de ejecución usa `-ngl 99 -c 8192`, lo que sugiere que la inferencia se realiza completamente en GPU, pero no se reportan cifras.
- El KV cache consume aproximadamente 24 KiB por token (12 capas de atención completa, 2 cabezas KV, dim 256), por lo que contextos largos requieren planificación cuidadosa.

## Comparativa con modelos similares

No se dispone de datos suficientes para comparar con otros modelos de la misma categoría (MoE ultra-sparse de 125B) en formato GGUF. La unica comparacion posible es con el modelo base sin cuantizar y con la version FP8 de la que se deriva:

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base) | 125B total, 6B activos | no disponible | safetensors (BF16/FP8) | qwen-community-1.0 | HuggingFace |
| Qwen3.8-Flash-Next-ROCmFP4-FAST-GGUF (este) | 125B total, 6B activos | no disponible | GGUF (ROCmFP4/ROCmFPX) | qwen-community-1.0 | HuggingFace |
| Qwen3.8-27B (otro modelo de la serie) | 27B | no disponible | no disponible | no disponible | no disponible |

No se han encontrado otras cuantizaciones GGUF de Qwen3.8-Flash-Next en la informacion proporcionada.

## Limitaciones y advertencias

- No funciona con llama.cpp estándar: requiere un fork con el PR 27742 (aún sin fusionar) y los tipos ROCmFPx. Si el PR no se fusiona, el soporte puede quedar obsoleto o sin mantenimiento.
- Tamaño y requisitos de hardware: 84 GiB de pesos y 96 GiB de VRAM limitan su uso a hardware muy específico (Strix Halo). No es portable a GPUs de consumo.
- Contexto limitado: con 12 GiB libres para KV, el contexto máximo práctico es de unos 8192 tokens (según el ejemplo), muy por debajo de lo que podría ofrecer el modelo base.
- Calidad de cuantización: la mezcla de tipos (Q4_0_ROCMFP4_FAST, Q3_0_ROCMFPX, Q6_K) puede introducir degradación en tareas sensibles a la precisión, especialmente en la tabla n-gram cuantizada a 3,50 bpw.
- Licencia qwen-community-1.0: es una licencia de comunidad de Qwen; se debe revisar si permite uso comercial y qué restricciones impone. No se detallan los términos en la informacion disponible.
- Sesgos y alucinaciones: no se han documentado sesgos específicos para este modelo, pero al ser una cuantización de un modelo base, hereda los riesgos típicos de los LLM (alucinaciones, sesgos de género, idioma, etc.).
- Dependencia de software no oficial: el fork de llama.cpp y los parches adicionales no están auditados ni soportados por la comunidad principal, lo que aumenta el riesgo de fallos o vulnerabilidades.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentionai/Qwen3.8-Flash-Next-ROCmFP4-FAST-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- PR de llama.cpp para arquitectura qwen4exp: https://github.com/ggml-org/llama.cpp/pull/27742
- Repositorio ROCmFPX: https://github.com/ciru-ai/ROCmFPX
- Repositorio del fork de llama.cpp: https://github.com/LaurentZuijdwijk/llama.cpp
- Documentación de SGLang sobre Qwen3.8-Flash-Next: https://docs.sglang.io/cookbook/autoregressive/Qwen/Qwen3.8-Flash-Next
- Recetas vLLM para Qwen3.8-Flash-Next: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
