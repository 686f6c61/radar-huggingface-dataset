# klee100/Qwen3.8-Flash-Next-AutoRound-A100-3bpw-MTP

## Resumen

Este repositorio contiene una cuantización mixta de precisión *weight-only* del modelo multimodal `Qwen/Qwen3.8-Flash-Next`, realizada por el autor `klee100` con la herramienta AutoRound. El objetivo es ejecutar el modelo completo —incluyendo la torre de visión, los pesos nativos MTP y la tabla n-gram de 51B parámetros— en una única GPU A100 de 64 GiB (SM80), algo inviable con los pesos originales en BF16.

El modelo base es un MoE ultra-sparse de 125B parámetros totales (6B activos por token) con una ventana de contexto de 262K tokens, desarrollado por Alibaba como *preview* de la arquitectura Qwen4. Combina Gated DeltaNet (GDN) en tres de cada cuatro capas y Qwen Sparse Attention (QSA) en la cuarta, además de una tabla n-gram de 51B parámetros. Esta cuantización mantiene la tabla n-gram en BF16 original y la descarga a RAM del host o a NVMe, reduciendo drásticamente el consumo de HBM.

La relevancia de esta ficha radica en que es una de las primeras cuantizaciones publicadas de un modelo con arquitectura híbrida GDN+QSA y MTP, y demuestra un flujo de trabajo reproducible para desplegar modelos de 125B en hardware de gama alta pero no masivo. El checkpoint usa el formato empaquetado `auto_round:auto_gptq` y requiere una compilación específica de vLLM con soporte para MoE cuantizado en SM80.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE ultra-sparse híbrido (Gated DeltaNet + Qwen Sparse Attention) con MTP y tabla n-gram |
| Parametros totales | 125B (incluyendo 51B de la tabla n-gram) |
| Parametros activos | 6B por token |
| Longitud de contexto | 262K tokens |
| Tipos de cuantizacion | W2A16G64, W3A16G128, W4A16G128 (AutoRound AutoScheme) en expertos enrutados; W8A16G128 en QSA/indexer y GDN GEMMs; BF16 en routers, shared experts, embeddings, LM head, visión, PLE y HyperConnection; W4A16G128 RTN en MTP; tabla n-gram en BF16 original |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (licencia de investigación de Qwen, no comercial) |
| Formato de pesos | `auto_round:auto_gptq` (empaquetado AutoRound/compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-Flash-Next` es un MoE multimodal ultra-sparse de 125B parámetros con 6B activos por token. Su arquitectura combina cuatro ideas principales: (1) Gated DeltaNet (GDN) en tres de cada cuatro capas para comprimir el historial, (2) Qwen Sparse Attention (QSA) en la cuarta capa para recuperación precisa de largo alcance, (3) una tabla n-gram de 51B parámetros que complementa la predicción de tokens, y (4) un módulo MTP (Multi-Token Prediction) nativo que predice varios tokens a la vez. El modelo es multimodal (imagen-texto a texto) y soporta una ventana de contexto de 262K tokens.

La cuantización aplicada por `klee100` es una mezcla de precisión *weight-only* dirigida a A100 SM80. Los expertos enrutados del backbone se cuantizan con AutoRound AutoScheme probando W2A16G64, W3A16G128 y W4A16G128, apuntando a 3.0 bpw efectivos incluyendo escalas y ceros. Los componentes críticos como routers, shared experts, gates, rutas recurrentes, embeddings, LM head, visión, proyecciones PLE y HyperConnection se mantienen en BF16. El MTP, al no estar instanciado en el grafo de Transformers, se exporta con una receta explícita W4/W8 RTN. La tabla n-gram se conserva byte a byte en BF16 y debe permanecer fuera de HBM. El proceso usó 200 iteraciones de AutoRound con 128 muestras de calibración de 512 tokens.

## Capacidades

- Generación de texto multimodal: procesa entradas de imagen y texto para producir texto, con razonamiento avanzado.
- Razonamiento multi-step y agentic coding: el modelo base supera a Claude-4.6-Opus en tareas de codificación agéntica, visión y chat según pruebas de unsloth.
- Ventana de contexto de 262K tokens: permite procesar documentos extensos, repositorios de código completos y conversaciones largas en una sola pasada.
- MTP (Multi-Token Prediction) nativo: predice múltiples tokens por paso, mejorando la velocidad de decodificación.
- Tabla n-gram de 51B parámetros: complementa la predicción con información estadística de n-gramas, preservada íntegramente en BF16.
- Soporte de tool calling y function calling: no se especifica explícitamente en la información disponible, pero el modelo base está diseñado para agentes; se recomienda verificar en la documentación oficial de Qwen.
- Capacidades multilingües: no se detallan en la información proporcionada.

## Casos de uso

- Inferencia multimodal en una sola GPU A100 64GB: el caso principal de esta cuantización. Permite ejecutar un modelo de 125B con visión y MTP en un solo acelerador, algo que con pesos BF16 requeriría múltiples GPUs o cuantización más agresiva.
- Procesamiento de documentos largos: con 262K tokens de contexto, puede analizar contratos, informes financieros o libros completos en una sola consulta, manteniendo la coherencia gracias a GDN y QSA.
- Agente de codificación en repositorios grandes: el modelo puede cargar un código base completo en contexto y realizar tareas de refactorización, generación de tests o corrección de bugs con razonamiento multi-step.
- Investigación sobre cuantización MoE: el repositorio incluye los scripts exactos de cuantización, restauración de n-gram y validación, lo que lo convierte en una referencia para estudiar el impacto de AutoRound en arquitecturas híbridas con MTP.
- Despliegue en vLLM con soporte AutoRound: el checkpoint está empaquetado en formato `auto_round:auto_gptq` y puede servirse con una compilación de vLLM que soporte MoE cuantizado en SM80, ideal para entornos de producción con una sola GPU.
- Análisis de imágenes y texto combinados: al ser multimodal, puede responder preguntas sobre diagramas, capturas de pantalla o documentos escaneados junto con texto, útil en sistemas de soporte técnico o revisión de diseño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización en la información disponible. El modelo base `Qwen3.8-Flash-Next` ha sido reportado por unsloth como superior a Claude-4.6-Opus (Max) en tareas de codificación agéntica, visión y chat, pero no se proporcionan cifras concretas. Se recomienda evaluar este build cuantizado en cargas de trabajo específicas antes de usarlo en producción, como advierte el propio autor en la model card.

## Requisitos de hardware

- VRAM estimada: 64 GiB en una sola A100 (SM80) para el backbone cuantizado; la tabla n-gram de 51B parámetros debe residir en RAM del host o en NVMe mapeado, no en HBM.
- GPU recomendada: NVIDIA A100 40GB o 80GB (SM80). No se menciona compatibilidad con GPUs consumer (RTX 4090, etc.) en la información disponible.
- Opciones de despliegue: vLLM con compilación que soporte AutoRound/compressed-tensors MoE (Humming) para SM80. No se mencionan alternativas como llama.cpp u Ollama.
- Latencia y throughput: no disponibles. El uso de MTP y la tabla n-gram fuera de HBM pueden afectar el rendimiento; se requiere evaluación empírica.
- Para contexto largo, se recomienda KV cache en BF16 si cabe; FP8 E4M3 puede usarse cerca de 262K tokens como optimización de almacenamiento, no de cómputo.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base) | 125B + 51B n-gram | 6B | 262K | qwen-research | BF16 original |
| klee100/Qwen3.8-Flash-Next-AutoRound-A100-3bpw-MTP | 125B + 51B n-gram | 6B | 262K | qwen-research | auto_round:auto_gptq (cuantizado) |
| Qwen3-235B-A22B (MoE similar, no multimodal) | 235B | 22B | 131K | Apache 2.0 | BF16 / cuantizaciones |

La comparativa directa con otros modelos de la misma categoría (MoE multimodal de ~125B) no está disponible en la información proporcionada. La principal diferencia con el modelo base es el tamaño en disco y VRAM: la cuantización reduce el footprint del backbone a ~3 bpw efectivos, permitiendo una sola A100 64GB, mientras que el base requeriría múltiples GPUs o cuantización más agresiva.

## Limitaciones y advertencias

- Licencia qwen-research: restringe el uso a fines de investigación; no permite uso comercial sin autorización expresa de Alibaba.
- La cuantización puede reducir la precisión del modelo. El autor advierte explícitamente que se debe evaluar en tareas específicas antes de producción.
- La tabla n-gram debe permanecer fuera de HBM; cargarla en memoria de GPU rompe el objetivo de una sola A100 64GB y puede causar OOM.
- Requiere una compilación específica de vLLM con soporte para AutoRound/compressed-tensors MoE en SM80; no es compatible con builds estándar.
- No se han publicado benchmarks de rendimiento para esta cuantización, por lo que no hay garantía de calidad en tareas downstream.
- Los idiomas soportados no están documentados en la información disponible; se asume herencia del modelo base, pero no se confirma.
- El modelo base es una *preview* de la arquitectura Qwen4, por lo que puede haber cambios en versiones futuras que afecten la compatibilidad.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/klee100/Qwen3.8-Flash-Next-AutoRound-A100-3bpw-MTP
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Página de vLLM Recipes para Qwen3.8-Flash-Next: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Documentación de unsloth para ejecutar Qwen3.8-Flash-Next localmente: https://unsloth.ai/docs/models/qwen3.8-next
- Repositorio oficial de Qwen3.8 en GitHub: https://github.com/QwenLM/Qwen3.8
- Blog de NVIDIA sobre Qwen3.8-Flash-Next en GB300 NVL72: https://developer.nvidia.com/blog/experiment-with-qwen3-8-flash-next-on-nvidia-gb300-nvl72-for-agentic-coding/
