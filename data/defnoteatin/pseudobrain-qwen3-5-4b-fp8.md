# defnoteatin/PseudoBrain-Qwen3.5-4B-FP8

## Resumen

PseudoBrain-Qwen3.5-4B-FP8 es una variante cuantizada en FP8 del modelo Qwen3.5-4B de Alibaba Qwen, adaptada por Ian Kurt Galeon (defnoteatin) mediante la arquitectura PseudoBrain. El objetivo declarado es resolver el cuello de botella de memoria KV cache en contextos largos: en lugar de crecer linealmente con la longitud de la secuencia (O(L)), la arquitectura híbrida combina capas de atención ventaneada con Gated DeltaNet recurrente de estado fijo, de modo que el coste de memoria del estado recurrente es O(1) independientemente de si el contexto es de 4K o de 1M de tokens.

El modelo tiene 4.539.265.536 parámetros totales (aproximadamente 4,5B) y se distribuye en formato safetensors con pesos en FP8, con un tamaño de repositorio de 6,2 GB. La model card declara soporte de hasta 1.048.576 tokens de contexto (1M) con un consumo estimado de unos 6,0 GB de VRAM total en GPUs de 8 GB o más, incluyendo RTX 4060, 4070, 4090 y AMD MI300X.

Es relevante ahora porque propone una vía para ejecutar ventanas de contexto de un millón de tokens en hardware de consumo, un escenario que en transformers estándar provoca OOM por el crecimiento del KV cache aunque los pesos del modelo quepan holgadamente en la GPU. La licencia es Apache 2.0 y el modelo está pensado para servirse con vLLM mediante un plugin específico (`pb27_vllm`).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: 32 capas, 24 Gated DeltaNet nativas + 8 capas de atención completa con SWA de 16K, Parallel Gated DeltaNet y Quest Exact Memory |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | 1.048.576 tokens (1M) declarados |
| Tipos de cuantización | FP8 (este repo); la familia incluye W4A16, NVFP4 y BF16 en repos separados |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería vLLM) |

## Arquitectura y entrenamiento

La arquitectura PseudoBrain (`PB27ForConditionalGeneration`) se construye sobre Qwen3.5-4B con 32 capas: 24 capas usan Gated DeltaNet nativo y 8 capas (índices 3, 7, 11, 15, 19, 23, 27 y 31) se convierten en atención completa con sliding window attention de 16.384 tokens, Parallel Gated DeltaNet y Quest Exact Memory. El estado recurrente de GDN tiene tamaño fijo O(1), lo que elimina el crecimiento lineal del KV cache con la longitud de contexto.

Sobre las capas dispersas se aplica una memoria de tres niveles en NVMe/page-cache denominada `piece_attention`: las consultas atienden sobre 4 sinks de StreamingLLM, landmarks de super-bloques, las top-k páginas de Quest Exact Memory y una ventana deslizante de 16.384 tokens, combinadas mediante FlashAttention-2 con fusión LSE. Se emplea un esquema de RoPE por bloques (`_reposition_rope_blocks`) con huella obligatoria de 64 tokens por bloque recuperado y escalado proporcional de huecos históricos, que según el autor preserva más del 99% de fidelidad de distancia macro-temporal a 1M de tokens sin degradación estática tipo YaRN. Además, la agregación global densa (`PB27_MEMORY_GLOBAL_AGG="auto"`) activa landmarks de resumen residentes en HBM (1 token de resumen por cada 4.096 tokens), cobertura estratificada de la línea temporal y barridos de working-set rotativos por novedad durante la decodificación.

La decodificación desacopla el presupuesto de recuperación del prefill del presupuesto constante de decode (`PB27_MEMORY_DECODE_STRIDE=64`, `PB27_MEMORY_DECODE_BLOCKS=64`), lo que según la model card reduce el KV cache a 1M de tokens en un 99,2% (de 24,0 GB a unos 192 MiB de ventana activa, con un pool de aproximadamente 1,0 GB). No se proporciona información sobre el dataset de entrenamiento, número de tokens, composición ni si hubo RLHF o DPO; el modelo es una adaptación de inferencia sobre Qwen3.5-4B, no un reentrenamiento desde cero.

## Capacidades

- Generación de texto y conversación multi-turno con ventanas de hasta 1M de tokens.
- Razonamiento de múltiples pasos sobre contextos muy largos gracias a los barridos de working-set rotativos.
- Soporte de tool calling y function calling mediante `--enable-auto-tool-choice` y el parser `qwen3_coder` en vLLM.
- Compatibilidad con el parser de razonamiento `qwen3` (`--reasoning-parser qwen3`).
- Capacidades heredadas de Qwen3.5-4B (código, matemáticas, multilingüismo): no se detallan en la información disponible.
- Memoria de estado recurrente constante: el consumo no crece con la longitud de contexto.
- Soporte de decodificación con presupuesto fijo por paso (stride 64, 64 bloques) para latencia estable.
- No se declaran capacidades de visión ni audio en la información proporcionada.

## Casos de uso

- Análisis de repositorios completos: el modelo puede ingerir hasta 1M de tokens, suficiente para codebases medianas, y responder preguntas sobre arquitectura o dependencias sin trocear el contexto, gracias al estado GDN de tamaño fijo.
- Atención al cliente con historial largo: conversaciones multi-turno con transcripciones extensas o documentación de producto adjunta caben en la ventana sin degradar el consumo de VRAM en GPUs de 8 GB.
- Procesamiento de contratos y documentación legal: revisión de expedientes de cientos de miles de tokens con recuperación selectiva por Quest Exact Memory para localizar cláusulas concretas.
- Resumen y QA sobre corpus de investigación: ingestión de múltiples papers o informes anuales en una sola pasada, con landmarks de super-bloque que permiten barridos globales durante la decodificación.
- Despliegue en edge y portátiles: con pesos FP8 de ~4,8 GB y ~6,0 GB totales a 1M de tokens, cabe en RTX 4060/4070 y en GPUs AMD MI300X, lo que habilita asistentes locales con contexto masivo.
- Agentes autónomos con memoria de trabajo extensa: el soporte de tool calling y el estado recurrente constante permiten cadenas de razonamiento largas sin que el coste de memoria escale con el número de pasos.
- Procesamiento por lotes de logs o trazas: análisis de trazas de sistema de gran volumen con ventana deslizante de 16K y recuperación por páginas para detectar patrones en series largas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card referencia un directorio `reports/` en el repositorio de GitHub del autor con "benchmark receipts", pero no se incluyen cifras concretas (MMLU, HumanEval, GSM8K ni métricas de latencia/throughput) en los datos proporcionados.

## Requisitos de hardware

- VRAM a 1M de tokens: ~6,0 GB en la edición FP8 (pesos ~4,8 GB más estado y pool de memoria).
- VRAM a 1M de tokens en otras ediciones de la familia: ~3,8 GB en W4A16 y NVFP4, ~10,0 GB en BF16.
- GPUs recomendadas para FP8: RTX 4060, 4070, 4090 y AMD MI300X (8 GB o más).
- GPUs para W4A16: RTX 3050, 3060, 4060, AMD RX 6600 y 7600 (6-8 GB).
- GPUs para NVFP4: Blackwell, RTX 5050, 5060 o superior, DGX Spark GB10.
- GPUs para BF16: RTX 3060 12GB, 4070, 3090, 4090, AMD RX 7700 XT o superior (12 GB o más).
- Despliegue: vLLM con el plugin `pb27_vllm` (soporte de runners V1 y V2, fallback `ForwardContext` sin hooks). Requiere `VLLM_ALLOW_LONG_MAX_MODEL_LEN=1`, `--enforce-eager`, `--no-enable-prefix-caching` y `--kv-cache-memory-bytes 6G` en el ejemplo de arranque.
- Latencia y throughput: no disponibles. La arquitectura declara decodificación de velocidad constante O(1) con presupuesto fijo por paso, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | VRAM a contexto máximo | Licencia |
|---|---|---|---|---|---|
| PseudoBrain-Qwen3.5-4B-FP8 | 4,54B | 1.048.576 | FP8 | ~6,0 GB | Apache 2.0 |
| PseudoBrain-Qwen3.5-4B-NVFP4 | no disponible | 1.048.576 (declarado en la familia) | NVFP4 | ~3,8 GB | Apache 2.0 |
| PseudoBrain-Qwen3.5-4B-BF16 | no disponible | 1.048.576 (declarado en la familia) | BF16 | ~10,0 GB | Apache 2.0 |
| Qwen3.5-4B (base) | ~4B | no disponible | BF16 y otras | no disponible | no disponible |

No se dispone de datos de rendimiento comparado con alternativas de la misma categoría (por ejemplo, modelos de 4B con contexto largo) en la información proporcionada.

## Limitaciones y advertencias

- La arquitectura es una adaptación de inferencia sobre Qwen3.5-4B; no se documenta el proceso de entrenamiento ni posibles degradaciones introducidas por la reconfiguración de capas.
- El rendimiento real a 1M de tokens depende del plugin `pb27_vllm` y de parámetros de entorno específicos; no es un modelo que funcione con transformers estándar sin el plugin.
- La decodificación exige `--enforce-eager` y desactivar prefix caching en el ejemplo de arranque, lo que puede reducir el throughput frente a configuraciones estándar.
- La memoria de tres niveles usa NVMe y page-cache; el rendimiento puede degradarse si el almacenamiento es lento.
- Riesgo de alucinación inherente a los modelos de 4B, especialmente en tareas de razonamiento complejo y contextos muy largos con recuperación dispersa.
- Sesgos conocidos: no documentados en la información disponible; se heredan los del modelo base Qwen3.5-4B.
- Idiomas soportados: no disponibles; no se garantiza cobertura multilingüe más allá de la del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento en producción ni sobre la estabilidad del plugin entre versiones de vLLM.
- El modelo se publicó con 72 descargas y 0 likes en el momento de la consulta; el ecosistema de validación externa es muy limitado.
- Las cifras de VRAM y reducción de KV cache (99,2%) son declaraciones del autor en la model card, no verificaciones independientes.

## Enlaces

- HuggingFace: https://huggingface.co/defnoteatin/PseudoBrain-Qwen3.5-4B-FP8
- Repositorio GitHub del motor y plugin: https://github.com/defnotean/pseudobrain
- Paper de arquitectura (PDF): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.pdf
- Paper de arquitectura (Markdown): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.md
- Benchmark receipts: https://github.com/defnotean/pseudobrain/tree/main/reports
- Perfil GitHub del autor: https://github.com/defnotean
- Perfil HuggingFace del autor: https://huggingface.co/defnoteatin
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Variante FP8 de referencia: https://huggingface.co/surogate/Qwen3.5-4B-FP8
- Variante AWQ 4-bit: https://huggingface.co/cyankiwi/Qwen3.5-4B-AWQ-4bit
- Variante NVFP4: https://huggingface.co/AxionML/Qwen3.5-4B-NVFP4
