# Lewfkrad/Qwen3.8-Flash-Next-NVFP4-W4-PLE

## Resumen

Este repositorio contiene un **sidecar PLE** (companion sidecar), no un modelo independiente. Se trata de un componente complementario que reemplaza la tabla de embeddings n-gram FP8 E4M3 del checkpoint `RadixArk/Qwen3.8-Flash-Next-NVFP4` por una representación cuantizada a enteros con signo de 4 bits (signed-W4) con grupo de 16 y escalas FP8 E4M3. El objetivo es reducir el peso de la tabla de embeddings de 51,2 GB a 28,8 GB, manteniendo una paridad bit-exacta en CPU/CUDA para la representación W4 resultante, aunque se trata de una cuantización con pérdida respecto a la fuente FP8.

El modelo base, Qwen3.8-Flash-Next, es un MoE ultra-disperso de 125B parámetros totales con 6B activos por token, arquitectura Qwen4 con 262K de contexto, multimodal, y una tabla de embeddings n-gram adicional de 51B parámetros. Este sidecar es un experimento de la comunidad (autor Lewfkrad) para reducir el footprint de esa tabla en GPUs Blackwell, pensado para un runtime SGLang muy específico con pins de versión y sin soporte de fallback. No es un lanzamiento oficial de Qwen, RadixArk, NVIDIA ni SGLang.

La relevancia actual radica en que permite ejecutar el modelo completo en una sola GPU RTX PRO 6000 Blackwell (SM120) con TP=1 y caché KV BF16, algo que con la tabla FP8 completa sería inviable por memoria. Sin embargo, es un artefacto experimental, no un formato de cuantización liberado, y está sujeto a restricciones estrictas de vinculación al checkpoint base exacto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE ultra-disperso (Qwen4) con tabla de embeddings n-gram; sidecar PLE cuantizado W4 |
| Parámetros totales | 125B (modelo base) + 51B tabla n-gram (base FP8) → 28,8 GB en sidecar W4 |
| Parámetros activos | 6B por token (modelo base) |
| Longitud de contexto | 262K (modelo base) |
| Tipos de cuantización | Signed INT4 (W4) con grupo de 16 y escalas FP8 E4M3 (solo tabla PLE) |
| Idiomas soportados | no disponible (modelo base multimodal multilingüe, no se especifica lista) |
| Licencia | Qwen Community License 1.0 (modelo base); Apache 2.0 (parches SGLang) |
| Formato de pesos | Binarios crudos: `qweight.u8` (uint8), `block_scales.f8` (FP8 E4M3), `manifest.json` |

## Arquitectura y entrenamiento

El sidecar PLE W4 no es un modelo entrenado, sino un artefacto de cuantización de la tabla de embeddings n-gram del modelo base Qwen3.8-Flash-Next. El modelo base es un MoE ultra-disperso de 125B parámetros totales y 6B activos por token, construido sobre la arquitectura Qwen4. Combina dos mecanismos de atención: tres de cada cuatro capas utilizan Gated DeltaNet (GDN) para comprimir el historial de contexto, y la cuarta capa usa Qwen Sparse Attention (QSA) para recuperación precisa de largo alcance. Además incorpora una tabla de embeddings n-gram de 51B parámetros que el sidecar cuantiza.

La cuantización del sidecar convierte grupos de 16 valores FP8 E4M3 en ocho bytes de INT4 con signo empaquetados (nibbles) más una escala FP8 E4M3 por grupo. La escala se calcula como el máximo de los valores positivos y negativos del grupo, con un mínimo de 2⁻⁹, y la cuantización usa redondeo al par más cercano con saturación en el rango [-8, 7]. Las dimensiones pares ocupan el nibble bajo y las impares el alto. La escala BF16 externa del checkpoint se preserva exactamente (0,00019931793212890625).

No hay datos de entrenamiento específicos para este sidecar; es un proceso de cuantización determinista sobre el checkpoint base en la revisión `7b719225242aacd3dbd3f9407468c2ee9a9d2594`. El runtime valida la integridad del artefacto mediante hashes SHA-256 de todos los componentes (manifest, índice del modelo, config, árbol de Hugging Face, PLE FP8 fuente y shards).

## Capacidades

- **Inferencia del modelo base Qwen3.8-Flash-Next**: permite ejecutar el modelo completo con la tabla de embeddings n-gram cuantizada a W4, manteniendo la paridad bit-exacta en la representación W4.
- **Soporte multimodal**: el modelo base procesa texto, imagen y audio (según la arquitectura Qwen4).
- **Razonamiento y generación**: el modelo base incluye modo de razonamiento avanzado y generación de texto.
- **Contexto largo**: soporta 262K tokens de contexto, permitiendo procesar documentos extensos y conversaciones complejas.
- **Tool calling / function calling**: no se especifica en la información disponible, pero el modelo base de Qwen3.8-Flash-Next es multimodal y orientado a agentes.
- **Restricción de despliegue**: solo es válido con el runtime SGLang específico (PR #36497 head `73a255206f916366c8d26d4022f82ddfb0ab558d`), TP=1, caché KV BF16 y sin fallback (`SGLANG_QWEN4_PLE_W4_SIDECAR_FALLBACK=0`).

## Casos de uso

- **Ejecución local de Qwen3.8-Flash-Next en GPU Blackwell**: el sidecar permite reducir el footprint de la tabla de embeddings de 51,2 GB a 28,8 GB, lo que hace viable la inferencia en una RTX PRO 6000 Blackwell con 96 GB de VRAM, cuando el modelo completo FP8 no cabría.
- **Investigación de cuantización de tablas de embeddings**: sirve como referencia de implementación para cuantizar tablas de embeddings n-gram de gran tamaño (320M filas) con W4 y escalas FP8, incluyendo el esquema de empaquetado de nibbles.
- **Evaluación de paridad de cuantización**: permite verificar la pérdida de calidad introducida por la cuantización W4 frente a la fuente FP8, comparando resultados en tareas de razonamiento y multimodalidad.
- **Desarrollo de runtimes experimentales**: el código fuente y parches publicados en GitHub sirven como base para integrar formatos de cuantización personalizados en SGLang.
- **Pruebas de integridad y reproducibilidad**: el manifest con hashes SHA-256 permite auditar la cadena de custodia del artefacto y garantizar que se usa el checkpoint base exacto.
- **Serving multimodal en entornos controlados**: si se cumplen todas las restricciones (versiones, TP=1, BF16 KV), se puede servir el modelo completo con la tabla cuantizada para pruebas de razonamiento multimodal con contexto largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo menciona pruebas de paridad CPU/CUDA bit-exactas para la representación W4, pero no proporciona números de rendimiento (throughput, latencia, precisión en tareas) ni comparaciones con el modelo FP8 original en métricas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- **VRAM estimada**: el sidecar completo ocupa 28,8 GB en disco; para inferencia se necesita el modelo base completo (pesos del MoE de 125B con cuantización NVFP4) más la tabla PLE cuantizada. En una RTX PRO 6000 Blackwell de 96 GB es viable con TP=1 y caché KV BF16.
- **GPU recomendada**: NVIDIA RTX PRO 6000 Blackwell (SM120), única plataforma calificada en la documentación.
- **No cabe en GPUs consumer típicas** (RTX 4090 con 24 GB, RTX 5080/5090) dado el tamaño total del modelo y la tabla de embeddings.
- **Opciones de despliegue**: exclusivamente el runtime SGLang con el código pin `73a255206f916a366c8d26d4022d82dfdab0ab558d` (PR #36497) y la imagen Docker `lmsysorg/sglang@sha256:59f06adce6f91401adf443bd168d45fdb2044d77671fd591c7c57a29d851cbae`.
- **Latencia y throughput**: no disponible. No se han publicado medidas de rendimiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Cuantización | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (original) | 125B + 51B PLE | 6B | 262K | FP8 (PLE) | Qwen Community 1.0 |
| Qwen3.8-Flash-Next-NVFP4 (RadixArk) | 125B + 51B PLE | 6B | 262K | NVFP4 (pesos) + FP8 (PLE) | Qwen Community 1.0 |
| Este sidecar W4 PLE | 125B + 51B PLE (cuantizado a W4) | 6B | 262K | NVFP4 + W4 (PLE) | Qwen Community 1.0 |

No se dispone de datos de benchmarks comparativos entre estas variantes. La comparativa se limita al esquema de cuantización de la tabla PLE, no al rendimiento del modelo.

## Limitaciones y advertencias

- **No es un modelo independiente**: requiere descargar el checkpoint base exacto `RadixArk/Qwen3.8-Flash-Next-NVFP4` en la revisión `7b719225242aacd3dbd3f9407468c2ee9a9d2594`; si se usa una revisión diferente, el runtime rechazará el artefacto.
- **Cuantización con pérdida**: la representación W4 es una aproximación de la fuente FP8; puede degradar la calidad de las predicciones en tareas sensibles a la precisión de la tabla de embeddings.
- **Soporte de runtime muy restringido**: solo funciona con el código y la imagen Docker exactos especificados; no se puede usar con vLLM, llama.cpp, Ollama ni otros runtimes.
- **Sin fallback**: se debe desactivar el fallback (`SGLANG_QWEN4_PLE_W4_SIDECAR_FALLBACK=0`); si el runtime no puede cargar el sidecar, no hay alternativa automática.
- **Experimental**: es código downstream no publicado por el autor del modelo original; no es un formato de cuantización oficial de SGLang ni de Qwen.
- **Restricciones de licencia**: la licencia Qwen Community 1.0 permite uso comercial, pero ciertos usos de Model-as-a-Service y AI Work Assistant requieren una licencia separada de Qwen; los requisitos de visualización para productos grandes también aplican.
- **Sesgos y alucinación**: no se han documentado sesgos específicos para este artefacto, pero el modelo base hereda los riesgos típicos de los LLMs multimodales (alucinación, sesgos de género y cultura).
- **Soporte de idiomas**: no se especifica en la documentación; se asume multilingüe del modelo base, pero sin garantías.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lewfkrad/Qwen3.8-Flash-Next-NVFP4-W4-PLE
- Modelo base (RadixArk): https://huggingface.co/RadixArk/Qwen3.8-Flash-Next-NVFP4
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next (no confirmado en los resultados, se infiere de la documentación)
- Repositorio GitHub con código y parches: https://github.com/lEWFkRAD/qwen38-rtx-pro-6000/tree/Cloud1/flash-next-w4-ple
- Guía de ejecución local (unsloth): https://unsloth.ai/docs/models/qwen3.8-next
- Recetas vLLM del modelo base: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Blog de Explainx sobre el lanzamiento: https://www.explainx.ai/blog/qwen3-8-flash-next-125b-moe-release-august-2026
- QwenCloud del modelo: https://www.qwencloud.com/models/qwen3.8-flash
