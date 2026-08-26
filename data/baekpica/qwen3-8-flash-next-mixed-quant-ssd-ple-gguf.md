# Baekpica/Qwen3.8-Flash-Next-Mixed-Quant-SSD-PLE-GGUF

## Resumen

Este repositorio publica una conversión de pesos en formato GGUF con cuantización mixta del modelo multimodal Qwen3.8-Flash-Next, realizada por el usuario Baekpica. La propuesta principal es una conversión consciente de la jerarquía de memoria que extrae la tabla de 51,2 mil millones de parámetros de *predictive latent embedding* (PLE) del conjunto de pesos residentes en el acelerador y la almacena como *sidecars* BF16 respaldados por SSD. De este modo, casi todo el presupuesto de residencia en memoria se reasigna al backbone de cómputo de 128,8 mil millones de parámetros.

El modelo base, desarrollado por Qwen, es un MoE ultra-disperso multimodal con 125 mil millones de parámetros principales más 51 mil millones de parámetros de embeddings N-gram, activando solo 6 mil millones de parámetros por token. Su arquitectura híbrida combina Gated DeltaNet (GDN) y Qwen Sparse Attention (QSA), con una ventana de contexto de 262.144 tokens. Esta conversión concreta no es compatible con runtimes GGUF estándar como llama.cpp, vLLM o SGLang; requiere un cargador dedicado denominado `ds4 SSD-PLE`, y está pensada para hardware como NVIDIA DGX Spark con 128 GB de memoria unificada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE ultra-disperso híbrido (GDN + QSA) multimodal (imagen-texto) |
| Parametros totales | 128.799.735.699 (backbone principal) + 51.200.245.760 (tabla PLE) = ~180B combinados |
| Parametros activos | 6B por token |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | Q5_K, Q6_K, Q5_0, Q8_0, BF16, F32, I64 (mixta por región del modelo) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (other) |
| Formato de pesos | 4 shards GGUF principales + 4 sidecars BF16 personalizados (.bin) para la tabla PLE |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es una vista previa de la arquitectura Qwen4. Emplea un diseño MoE ultra-disperso donde tres de cada cuatro capas usan Gated DeltaNet (GDN) para comprimir el historial recurrente, y la cuarta capa usa Qwen Sparse Attention (QSA) para recuperación precisa de contexto largo. A esto se añade una tabla de embeddings N-gram de 51,2 mil millones de parámetros que permite búsquedas locales rápidas de tokens. Según los datos publicados, el entrenamiento consume aproximadamente 1/9 del coste de Qwen3.7-Plus, manteniendo o mejorando capacidades en tareas de código y ofimática.

Esta conversión concreta aplica una receta de cuantización mixta por regiones: los expertos enrutados de las capas interiores (2-45) usan Q5_K, los de las capas extremas (0, 1, 46, 47) usan Q6_K, las proyecciones *down* usan Q6_K (columnas principales) y Q5_0 (cola de 128 columnas), mientras que los expertos MTP y la mayoría de matrices siempre activas usan Q8_0. Los tensores de visión y convolución no cuantizables, junto con la tabla PLE completa, se mantienen en BF16. La tabla PLE se almacena en SSD como memoria dispersa de búsqueda, con una caché de páginas mapeadas limitada a 512 MiB / 1 GiB / 2 GiB. No se especifican detalles sobre RLHF, DPO u otros métodos de alineación en la información disponible.

## Capacidades

- Generación de texto y razonamiento multimodal (entrada de imagen y texto, salida de texto).
- Razonamiento agéntico y codificación agéntica: el modelo base supera a Claude-4.6-Opus (Max) en tareas de coding agéntico, visión y chat, según la documentación de unsloth.
- Ventana de contexto de 262K tokens, adecuada para tareas que requieren recuperación de información en documentos extensos.
- Soporte de *tool calling* y *function calling*: no especificado explícitamente en la model card de esta conversión, aunque el modelo base está diseñado para agentes.
- Capacidades multilingües: no detalladas en la información proporcionada.
- La conversión SSD-PLE permite ejecutar el modelo en hardware con memoria unificada limitada (128 GB) sin necesidad de VRAM dedicada, siempre que se use el cargador `ds4` específico.

## Casos de uso

- Despliegue local en estaciones de trabajo con memoria unificada: gracias al diseño SSD-PLE, el modelo puede ejecutarse en dispositivos como NVIDIA DGX Spark (GB10) con 128 GB de memoria unificada, sin requerir GPU con VRAM dedicada, siempre que se utilice el cargador `ds4` desarrollado para este artefacto.
- Asistentes de codificación agénticos: el modelo base destaca en tareas de coding agéntico, por lo que puede integrarse en entornos de desarrollo para generar, revisar y refactorizar código en múltiples pasos, manteniendo el estado de la conversación en su ventana de 262K tokens.
- Razonamiento multimodal en producción: al aceptar entradas de imagen y texto, puede emplearse en sistemas de análisis de documentos técnicos, capturas de pantalla o diagramas, combinando comprensión visual con razonamiento textual.
- Automatización de tareas de ofimática: el modelo base muestra mejoras frente a Qwen3.7-Plus en tareas de oficina, por lo que puede usarse para redactar informes, resumir correos o generar presentaciones a partir de instrucciones complejas.
- Investigación en arquitecturas híbridas: al ser una vista previa de Qwen4, este modelo permite a investigadores estudiar el comportamiento de GDN + QSA en tareas de contexto largo y compararlo con transformers densos o MoE tradicionales.
- Desarrollo de runtimes personalizados: el artefacto sirve como banco de pruebas para implementar cargadores GGUF con offload de tablas de embeddings a SSD, un campo emergente para ejecutar modelos de cientos de miles de millones de parámetros en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentación de unsloth afirma cualitativamente que el modelo base supera a Claude-4.6-Opus (Max) en tareas de codificación agéntica, visión y chat, pero no se proporcionan cifras concretas (MMLU, HumanEval, GSM8K, etc.) en los materiales analizados. La model card de esta conversión indica que las verificaciones estructurales y de cuantización han pasado, pero las mediciones de rendimiento en DGX Spark y las pruebas de calidad extremo a extremo están pendientes.

## Requisitos de hardware

- Memoria unificada objetivo: 128 GB (DGX Spark / GB10 o similar).
- Payload residente en acelerador (backbone): 97.660.877.400 bytes / 90,9538 GiB.
- Payload PLE en SSD: 102.400.491.520 bytes / 95,3679 GiB (nunca debe residir completamente en memoria).
- Caché de páginas para PLE: limitada a 512 MiB / 1 GiB / 2 GiB (configurable).
- GPU recomendada: NVIDIA DGX Spark (GB10) con 128 GB de memoria unificada. No se recomienda para GPUs con VRAM convencional (por ejemplo, RTX 4090 con 24 GB) sin modificaciones significativas, ya que el backbone residente ya supera los 90 GiB.
- Opciones de despliegue: requiere un cargador dedicado `ds4 SSD-PLE`. No es compatible con llama.cpp, vLLM, SGLang ni otros runtimes GGUF estándar.
- Latencia y throughput: no disponibles; las mediciones en DGX Spark están pendientes de publicación.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base) | ~176B (125B + 51B PLE) | 6B | 262K | qwen-community-1.0 | Vista previa de Qwen4, GDN + QSA |
| Qwen3.8-Flash-Next (esta conversión) | ~180B (128.8B + 51.2B PLE) | 6B | 262K | qwen-community-1.0 | Cuantización mixta, PLE en SSD, requiere loader `ds4` |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | no disponible | Modelo comparado en el anuncio oficial; el entrenamiento de Qwen3.8-Flash-Next cuesta ~1/9 |

No se dispone de especificaciones exactas de Qwen3.7-Plus en la información proporcionada, por lo que la comparación se limita a la afirmación cualitativa del coste de entrenamiento y la superioridad en tareas de código y ofimática.

## Limitaciones y advertencias

- No es un release listo para servir: la model card indica explícitamente que "el trabajo de runtime permanece" y que el repositorio no debe tratarse como una versión de servido directa.
- Incompatibilidad con runtimes estándar: no funciona con llama.cpp, vLLM ni SGLang sin el cargador dedicado `ds4 SSD-PLE`, que aún no está publicado.
- Riesgo de fallo de residencia: si la tabla PLE completa se carga en memoria (por ejemplo, mediante `mmap` sin límites o caché de páginas sin política de expulsión), se incumple el objetivo de diseño y puede provocar agotamiento de memoria en sistemas de 128 GB.
- Estado de verificación parcial: han pasado las comprobaciones estructurales, de cuantización y de integridad de archivos, pero las pruebas de calidad extremo a extremo y las mediciones en DGX Spark están pendientes.
- Riesgo de alucinación: como cualquier LLM, puede generar contenido plausible pero incorrecto, especialmente en tareas de razonamiento complejo o con entradas ambiguas.
- Restricciones de licencia: la licencia `qwen-community-1.0` debe revisarse para uso comercial; no se detallan aquí sus cláusulas específicas.
- Limitaciones de idioma: no se especifican los idiomas soportados en la información proporcionada, aunque el modelo base de Qwen suele ser multilingüe.

## Enlaces

- Repositorio HuggingFace de la conversión: https://huggingface.co/Baekpica/Qwen3.8-Flash-Next-Mixed-Quant-SSD-PLE-GGUF
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio oficial en GitHub: https://github.com/QwenLM/Qwen3.8-Flash-Next
- Recetas de despliegue con vLLM: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Documentación de SGLang: https://docs.sglang.io/cookbook/autoregressive/Qwen/Qwen3.8-Flash-Next
- Guía de ejecución local en unsloth: https://unsloth.ai/docs/models/qwen3.8-next
- Hilo en foros de NVIDIA sobre DGX Spark: https://forums.developer.nvidia.com/t/qwen3-8-flash-next/381228
