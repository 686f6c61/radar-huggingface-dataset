# defnoteatin/PseudoBrain-Nex-35B-A3B-NVFP4

## Resumen

PseudoBrain-Nex-35B-A3B-NVFP4 es un modelo de generación de texto conversacional y agéntico creado por el usuario defnoteatin, basado en la familia Nex-N2.5-mini (nex-agi/Nex-N2.5-mini), con vínculos a la variante abliterada de Qwen3.5-35B-A3B de Huihui AI. Su propuesta de valor principal no es el modelo base en sí, sino la arquitectura PseudoBrain (PB27MoEForConditionalGeneration), un sistema híbrido de MoE con atención ventanada y Gated DeltaNet paralelo que permite servir contextos de hasta 1.048.576 tokens (1M) con memoria de estado constante O(1), eliminando el crecimiento lineal de la caché KV típico de los Transformers estándar.

El modelo es un MoE de 35.444 millones de parámetros totales con aproximadamente 3B de parámetros activos por token (según la nomenclatura 35B-A3B heredada de Qwen3.5-MoE), publicado en formato safetensors con cuantización NVFP4 (compressed-tensors, 8-bit según los tags del repo) y pensado para ejecutarse sobre vLLM mediante un plugin propio (`pb27_vllm`). El autor afirma resultados de recall exacto de 40/40 en el rango 8K–1M tokens sobre una única GPU de 24 GB, aunque estos datos proceden de la model card y no de una evaluación independiente.

Su relevancia actual radica en la creciente demanda de contextos ultralargos para agentes y RAG sobre corpus masivos: al reducir la memoria de caché KV en 1M tokens un 97,6 % (~20 GB a ~486 MiB de ventana activa, con un pool de 4,7 GB), hace viables cargas de trabajo de contexto extremo en hardware de consumo y estaciones de trabajo, algo que con Transformers convencionales requeriría clústeres de GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PB27MoEForConditionalGeneration (híbrido: ventana de atención + Gated DeltaNet paralelo + Quest Exact Memory, MoE) |
| Parametros totales | 35.444.366.576 (~35,4B) |
| Parametros activos | ~3B (indicado por la nomenclatura 35B-A3B; valor exacto no disponible) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | NVFP4 (compressed-tensors, 8-bit); existen ediciones hermanas W4A16, FP8 y BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), con plugin `pb27_vllm` incluido en el repositorio |

## Arquitectura y entrenamiento

La arquitectura PseudoBrain combina 40 capas en total: 30 capas nativas de Gated DeltaNet (GDN), un modelo de espacio de estados/recurrente cuyo estado es de tamaño fijo O(1) independientemente de la longitud del contexto, y 10 capas de atención completa (en las posiciones 3, 7, 11, ..., 39) convertidas en atención ventana deslizante de 16K + Gated DeltaNet paralelo + Quest Exact Memory. Sobre estas capas ancla dispersas, las consultas atienden sobre un conjunto compuesto por 4 sinks de StreamingLLM, landmarks de super-bloques, páginas top-k de Quest Exact Memory y la ventana deslizante de 16.384 tokens, fusionadas mediante FlashAttention-2 con LSE-merge y cotas jerárquicas bf16 de dos niveles (super-bloques de 64).

Otros componentes destacables son el RoPE por bloques estrictamente no solapados (piecewise-proportional block RoPE), que mantiene la continuidad local y una fidelidad del 99 %+ en distancias temporales proporcionales a 1M tokens sin degradación estática tipo YaRN; la agregación global densa automática para consultas de alta participación, con landmarks-resumen (1 token por cada 4.096 tokens en HBM) y barridos rotativos de bloques para razonamiento multi-paso; y un decodificado de velocidad constante O(1) que reduce la memoria de caché KV a 1M tokens un 97,6 %. El modelo base procede de nex-agi/Nex-N2.5-mini (con derivadas de Qwen3.5-35B-A3B abliterada y cuantizaciones intermedias INT4-W4A16 y FP8 calibrada). No hay información disponible sobre tokens de entrenamiento, composición del dataset ni etapas de RLHF/DPO; el propio repo es una re-publicación cuantizada (NVFP4) del modelo base y no incluye entrenamiento adicional documentado.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation), servible vía API compatible con OpenAI en vLLM.
- Razonamiento con parser de razonamiento estilo Qwen3 (`--reasoning-parser qwen3`), lo que sugiere soporte de thinking mode heredado del linaje Qwen3.5.
- Tool calling / function calling: el comando de despliegue recomendado activa `--enable-auto-tool-choice` con parser `qwen3_coder`.
- Contexto ultralargo (hasta 1M tokens) con recall exacto afirmado de 40/40 en el rango 8K–1M sobre una GPU de 24 GB.
- Memoria de estado constante O(1) durante el decodificado, adecuada para agentes multi-paso que barren cientos de bloques de contexto.
- Compatibilidad con vLLM V1/V2 en NVIDIA CUDA y AMD ROCm (plugin universal `pb27_vllm`).
- Variante de linaje abliterado (sin filtros de alineación, herencia de huihui-ai/Huihui-Qwen3.5-35B-A3B-abliterated), lo que implica ausencia de rechazos de seguridad.
- Capacidades multilingües: no disponibles (no especificadas en la model card).

## Casos de uso

- Analisis de repositorios de codigo completos: con 1M tokens de contexto cabe un codebase mediano entero en una sola peticion; el parser de tool calling `qwen3_coder` permite integrarlo en pipelines de revision automatica y CI/CD.
- Agentes de investigacion sobre corpus documentales: el barrido multi-bloque (novelty-rotating sweeps) permite razonamiento multi-paso sobre cientos de bloques de un corpus de 1M tokens, util para due diligence juridica o revision sistematica de literatura.
- RAG sin chunking: al mantener recall exacto hasta 1M tokens, se puede indexar la base de conocimiento completa en el contexto en lugar de fragmentarla, reduciendo errores de recuperacion.
- Chatbots de atencion al cliente con historial completo: la ventana de 1M tokens y el decodificado a coste constante permiten conservar todo el historial de interaccion del cliente sin degradar latencia.
- Procesamiento de transcripciones largas: resumen y analisis de horas de reuniones, podcasts o audiencias judiciales cargadas como texto en una sola sesion.
- Despliegue on-premise en empresa: el autor oferta explicitamente despliegues empresariales de 1M de contexto on-premise; con la edicion W4A16 (~22,5 GB totales) cabe en una RTX 3090/4090 de 24 GB.
- Estacion de trabajo de investigacion individual: la edicion NVFP4 (~27,5 GB a 1M tokens) esta orientada a GPUs Blackwell de consumo como la RTX 5090 de 32 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de rendimiento cuantitativo afirmado por el autor es un recall exacto de 40/40 en tareas de recuperacion en el rango 8K–1M tokens sobre una GPU de 24 GB, junto con la reduccion del 97,6 % en memoria de caché KV a 1M tokens (~20,0 GB → ~486 MiB de ventana activa con pool de 4,7 GB). Estos datos proceden de la model card y de los "benchmark receipts" del repositorio de GitHub del autor; no existe verificacion independiente.

## Requisitos de hardware

- VRAM estimada (edicion NVFP4, este repo): pesos ~22,5 GB; total ~27,5 GB con contexto de 1.000.000 de tokens.
- GPUs objetivo segun el autor: NVIDIA Blackwell (RTX 5090 de 32 GB, DGX Spark GB10, B200). La edicion NVFP4 no cabe en una GPU de 24 GB estandar; para consumer de 24 GB existe la edicion W4A16 (~22,5 GB totales, RTX 3090/4090, RX 7900 XTX).
- La edicion BF16 (~75 GB totales) requiere A100/H100 de 80 GB, DGX Spark de 128 GB o AMD MI300X; la edicion FP8 (~40 GB) encaja en L40S, A100, H100 o 2x RTX 3090/4090.
- Despliegue: vLLM (libreria declarada) con el plugin `pb27_vllm` (instalable via pip desde GitHub o incluido en el propio checkpoint). No se menciona soporte de llama.cpp, Ollama o TGI.
- Comando de referencia: `vllm serve` con `--max-model-len 1048576`, `--enforce-eager`, `--no-enable-prefix-caching`, `--kv-cache-memory-bytes 6G`, `--max-num-seqs 16`.
- Latencia y throughput: no disponibles como cifras concretas; se afirma decodificado a velocidad constante O(1) y presupuesto de prefill desacoplado del de decodificado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| PseudoBrain-Nex-35B-A3B-NVFP4 | 35,4B (~3B activos) | 1M | MoE hibrido GDN + SWA + Quest Memory | Apache 2.0 | Caché KV O(1); requiere plugin vLLM propio |
| Qwen3.5-35B-A3B (base del linaje) | 35,4B (~3B activos) | no disponible | MoE Transformer | no disponible | Modelo base original; contexto y specs no disponibles en la informacion proporcionada |
| Nex-N2.5-mini (nex-agi) | no disponible | no disponible | no disponible | no disponible | Modelo base declarado; sin model card publica en la informacion disponible |

No hay datos de rendimiento comparativos publicados frente a alternativas de la misma categoria, por lo que la comparacion se limita a specs declaradas.

## Limitaciones y advertencias

- Variante abliterada: al derivar de huihui-ai/Huihui-Qwen3.5-35B-A3B-abliterated, el modelo carece de salvaguardas de seguridad/alignacion; su uso en produccion orientado a usuarios finales conlleva riesgos legales y de reputacion significativos.
- Los datos de rendimiento (40/40 recall, 97,6 % de ahorro de memoria) proceden exclusivamente del autor y de su repositorio de GitHub; no hay verificacion independiente ni benchmarks estandarizados (MMLU, HumanEval, GSM8K).
- Dependencia de un plugin de terceros (`pb27_vllm`): el despliegue a 1M tokens requiere software no mantenido por vLLM oficial, con riesgo de incompatibilidad ante actualizaciones de vLLM (el propio autor destaca la resiliencia a versiones como punto de diseño).
- La cuantizacion NVFP4 requiere GPUs NVIDIA Blackwell; en hardware anterior habra que recurrir a las ediciones W4A16, FP8 o BF16.
- Idiomas soportados, capacidades multilingües y datos de entrenamiento (tokens, dataset, RLHF/DPO): no disponibles, lo que dificulta evaluar adecuacion a castellano.
- Requiere flags no estandar en vLLM (`VLLM_ALLOW_LONG_MAX_MODEL_LEN=1`, `--no-enable-prefix-caching`, `--enforce-eager`), lo que desactiva optimizaciones habituales como prefix caching.
- Riesgo de alucinacion inherente a LLMs: no mitigado documentadamente; no hay informacion sobre sesgos conocidos.
- Licencia Apache 2.0 sin restricciones comerciales, pero la procedencia abliterada del linaje puede contradecir las politicas de uso del modelo base original de Qwen/Alibaba; conviene revisar los terminos de los modelos ascendentes antes de uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/defnoteatin/PseudoBrain-Nex-35B-A3B-NVFP4
- GitHub y plugin universal `pb27_vllm`: https://github.com/defnotean/pseudobrain
- Paper de arquitectura (PDF): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.pdf
- Paper de arquitectura (Markdown): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.md
- Resultados de benchmark ("receipts"): https://github.com/defnotean/pseudobrain/tree/main/reports
- Edicion W4A16: https://huggingface.co/defnoteatin/PseudoBrain-Nex-35B-A3B-W4A16
- Edicion FP8: https://huggingface.co/defnoteatin/PseudoBrain-Nex-35B-A3B-FP8
- Edicion BF16: https://huggingface.co/defnoteatin/PseudoBrain-Nex-35B-A3B-BF16
- Modelos base: https://huggingface.co/nex-agi/Nex-N2.5-mini · https://huggingface.co/huihui-ai/Huihui-Qwen3.5-35B-A3B-abliterated · https://huggingface.co/Arahide/Nex-N2.5-mini-INT4-W4A16 · https://huggingface.co/cbert33/Nex-N2.5-mini-FP8-Calibrated
