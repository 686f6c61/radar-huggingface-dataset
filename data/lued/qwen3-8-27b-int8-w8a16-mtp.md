# lued/Qwen3.8-27B-INT8-W8A16-MTP

## Resumen

Qwen3.8-27B-INT8-W8A16-MTP es una cuantización offline del modelo Qwen3.8-27B de Alibaba, realizada por el usuario lued. El modelo original es un transformer híbrido con atención lineal GDN (gated delta net) intercalada con atención completa, más una cabeza de predicción multi-token (MTP). Esta versión cuantizada utiliza pesos INT8 con activaciones en BF16 (esquema W8A16) mediante la librería llm-compressor y el formato compressed-tensors, optimizada para GPUs Ampere (sm_86) donde no hay soporte nativo de FP8. El resultado es un modelo de ~31 GB (frente a los ~55.6 GB del BF16 original) que mantiene una fidelidad casi sin pérdidas (KLD ≈ 0.0094 nats/token) y permite ejecutar el modelo con contexto de hasta 262 144 tokens en dos GPUs de 24 GB. Incluye además la cabeza MTP en BF16 para decodificación especulativa, con una tasa de aceptación de ~74% y longitud media de aceptación de ~3.2 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 64 capas (48 de atención lineal GDN + 16 de atención completa, full_attention_interval=4), hidden 5120, intermediate 17408, head_dim 256, partial RoPE 0.25, vocab 248320 |
| Parametros totales | 27.781.427.952 (27.78B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens (verificado en vLLM) |
| Tipos de cuantizacion | W8A16 (INT8 pesos, BF16 activaciones), formato compressed-tensors pack-quantized, group INT8 con memoryless_minmax |
| Idiomas soportados | No disponible (no especificado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (archivos model-0000N-of-0000M.safetensors y model_mtp.safetensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B utiliza una arquitectura híbrida denominada `qwen3_5`, que combina atención lineal tipo DeltaNet (gated delta net) con atención completa. Concretamente, de las 64 capas, 48 son de atención lineal GDN y 16 de atención completa, intercaladas con un intervalo de 4 (full_attention_interval: 4). La dimensión oculta es 5120, la intermedia 17408, el vocabulario de 248 320 tokens y head_dim 256 con RoPE parcial al 25%. Además, incorpora una cabeza de predicción multi-token (MTP) con una capa que incluye self-attention y MLP, diseñada para decodificación especulativa.

Esta versión cuantizada se construyó a partir del checkpoint BF16 original mediante llm-compressor 0.12, aplicando un esquema W8A16 con RTN (round-to-nearest) sin calibración. Se cuantizaron 400 GEMMs: las proyecciones MLP (64×3), las proyecciones de atención completa (16×4) y las proyecciones GDN in_proj_qkv, in_proj_z y out_proj (48×3). Se preservaron en BF16 el lm_head, la torre de visión (model.visual.*), la cabeza MTP completa, y las puertas recurrentes GDN in_proj_a e in_proj_b (de dimensión 48), así como normas, conv1d, A_log y dt_bias. Esta selección busca equilibrar fidelidad y uso de memoria: cuantizar toda la pila GDN costaría ~11 GB extra en BF16, mientras que mantener solo las puertas recurrentes en BF16 recupera ~4 GB con una pérdida casi nula (KLD ≈ 0.0094 nats/token).

## Capacidades

- Generación de texto y razonamiento: al ser una cuantización del modelo Qwen3.8-27B, conserva las capacidades de razonamiento, matemáticas y código del modelo original.
- Soporte multimodal: incluye torre de visión (model.visual.*) preservada en BF16, lo que permite entrada de imágenes y texto (pipeline image-text-to-text).
- Tool calling / function calling: compatible con el parser `qwen3_xml` de vLLM y la opción `--enable-auto-tool-choice`.
- Razonamiento multi-step y modo thinking: soporta el parser de razonamiento `qwen3` de vLLM.
- Decodificación especulativa con MTP: la cabeza MTP en BF16 permite acelerar la inferencia con una tasa de aceptación de ~74% y longitud media de aceptación de ~3.2 tokens.
- Contexto largo: ventana de 262 144 tokens, adecuada para tareas que requieren procesar documentos extensos o conversaciones de muchos turnos.
- Multilingüe: no se especifican idiomas concretos, pero el modelo base Qwen3.8-27B es conocido por su soporte multilingüe (aunque no se detalla en esta ficha).

## Casos de uso

- Asistente conversacional multimodal: el modelo puede procesar imágenes y texto simultáneamente, lo que permite crear asistentes que analicen capturas de pantalla, diagramas o fotografías y respondan con texto. Su ventana de 262K tokens permite mantener conversaciones largas con historial completo.
- Generación y revisión de código en entornos de desarrollo: con soporte de tool calling, puede integrarse en pipelines de CI/CD para autocompletar código, generar tests o revisar pull requests. La decodificación especulativa con MTP reduce la latencia en generación de código.
- Análisis de documentos extensos: gracias al contexto de 262K tokens, puede resumir o extraer información de libros, informes anuales o expedientes completos sin necesidad de chunking.
- Razonamiento multi-step para agentes autónomos: el modo reasoning y el soporte de tool calling permiten construir agentes que planifican, ejecutan herramientas y razonan sobre resultados intermedios, útil en automatización de tareas complejas.
- Despliegue en hardware consumer de gama alta: al pesar ~31 GB en W8A16, puede ejecutarse en dos GPUs de 24 GB (p. ej., RTX 3090) con vLLM, lo que lo hace accesible para laboratorios pequeños o desarrolladores independientes.
- Investigación en eficiencia de cuantización: al ser una implementación de referencia de W8A16 sobre arquitectura híbrida GDN, sirve como caso de estudio para medir el impacto de la cuantización en modelos con atención lineal y MTP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye métricas de calidad de cuantización (KLD ≈ 0.0094 nats/token) y de decodificación especulativa (tasa de aceptación ~74%, longitud media ~3.2), pero no resultados de MMLU, HumanEval, GSM8K u otros. Tampoco se comparan con el modelo original en tareas estándar.

## Requisitos de hardware

- VRAM estimada: ~31 GB de pesos en W8A16, más overhead de KV cache y activaciones. Para contexto completo de 262K tokens, se recomiendan 2×24 GB (48 GB totales) con tensor parallelism 2.
- GPUs compatibles: arquitectura Ampere (sm_86) o superior. Verificado en 2×RTX 3090. También debería funcionar en A100, A6000, RTX 4090, etc., aunque el esquema W8A16 está optimizado para Ampere donde no hay FP8.
- En una sola GPU consumer: con 24 GB de VRAM, el modelo cabe en W8A16 (~31 GB no cabe en 24 GB, pero con cuantización W4A16 (~19.5 GB) sí, aunque no es esta versión). Para este checkpoint concreto, se necesitan al menos 2 GPUs de 24 GB para contexto largo.
- Opciones de despliegue: vLLM (recomendado, con soporte nativo de compressed-tensors y MTP), también puede usarse con SGLang u otros frameworks que soporten safetensors y el esquema W8A16, aunque no se ha verificado.
- Latencia y throughput: no se proporcionan cifras exactas. La decodificación especulativa con MTP (num_speculative_tokens=3) logra una tasa de aceptación de ~74%, lo que implica una aceleración efectiva en generación. En prefill, el uso de INT8 puede mejorar el TTFT en comparación con FP8-Marlin en Ampere.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base BF16) | 27.78B | 262K | Ninguna (BF16) | Apache 2.0 | Modelo original, ~55.6 GB en BF16 |
| lued/Qwen3.8-27B-INT8-W8A16-MTP | 27.78B | 262K | W8A16 INT8 | Apache 2.0 | Esta version, ~31 GB, con MTP |
| TheHouseOfTheDude/Qwen3.6-27B-INT8 | 27.78B (aprox.) | 262K (aprox.) | W8A16 INT8 | Apache 2.0 | Version anterior de la misma receta sobre Qwen3.6-27B |

No se dispone de datos de rendimiento comparativos entre estas versiones. La model card menciona que la receta se validó primero en Qwen3.6-27B, pero no ofrece números de benchmarks.

## Limitaciones y advertencias

- Al ser una cuantización sin fine-tuning, puede haber una ligera degradación en tareas de alta sensibilidad numérica o en generación de código complejo, aunque la KLD medida es muy baja (≈0.0094 nats/token).
- El esquema W8A16 está optimizado para GPUs Ampere (sm_86). En GPUs con soporte FP8 (Hopper o Ada), el uso de FP8 nativo podría ofrecer mejor rendimiento, aunque esta versión sigue siendo funcional.
- La cabeza MTP se mantiene en BF16, lo que añade ~849 MB al tamaño total. Si se desactiva la decodificación especulativa, ese peso podría omitirse, pero no se proporciona una versión sin MTP.
- El contexto de 262K tokens requiere una gestión cuidadosa de la memoria KV cache. En 2×24 GB, con `--gpu-memory-utilization 0.93` y `--kv-cache-dtype fp8_e4m3`, es viable, pero en configuraciones con menos VRAM puede ser necesario reducir `max_model_len`.
- No se especifican los idiomas soportados. Aunque el modelo base Qwen3.8-27B es multilingüe, esta ficha no puede confirmar la cobertura exacta.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base Qwen3.8-27B por si hubiera restricciones adicionales (aunque en este caso también es Apache 2.0).
- En sistemas con dos GPUs consumer sin NVLink, es necesario desactivar P2P (`NCCL_P2P_DISABLE=1`) para evitar bloqueos en la inicialización de NCCL.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/lued/Qwen3.8-27B-INT8-W8A16-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog de AMD sobre ejecucion de Qwen3.8-27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Guia de Yottalabs sobre Qwen3.8-27B: https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Guia de SWFTE para ejecutar Qwen3.8-27B localmente: https://www.swfte.com/blog/qwen-3-8-27b-run-locally-self-host-guide-2026
- Articulo de IA4PYMES sobre benchmarks de Qwen 3.8: https://ia4pymes.tech/en/blog/qwen-3-8-official-benchmarks-open-weights-27b-sme-guide
- Repositorio de llm-compressor: https://github.com/vllm-project/llm-compressor
