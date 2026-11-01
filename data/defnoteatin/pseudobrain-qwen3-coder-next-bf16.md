# defnoteatin/PseudoBrain-Qwen3-Coder-Next-BF16

## Resumen

PseudoBrain-Qwen3-Coder-Next-BF16 es un ajuste (finetune) de comunidad sobre Qwen/Qwen3-Coder-Next, publicado por el desarrollador independiente defnoteatin (Ian Kurt Galeon). El modelo base es un MoE de 80.079 millones de parámetros totales (aproximadamente 3B activos según la arquitectura Qwen3-Next 80B-A3B) orientado a tareas de código agénticas, y esta variante añade la denominada "arquitectura PseudoBrain": un esquema de atención híbrida con Gated DeltaNet y memoria dispersa que permite servir contextos de hasta 1.048.576 tokens con consumo de memoria de KV cache casi constante.

Su relevancia radica en el problema que ataca: en el serving estándar de Transformers, la memoria del KV cache crece linealmente con la longitud de contexto y el coste de prefill crece de forma cuadrática, lo que hace inviables cargas de trabajo de 128K a 1M tokens en GPUs convencionales. PseudoBrain combina 36 capas recurrentes Gated DeltaNet (estado O(1) independiente del contexto) con 12 capas de atención completa modificadas (ventana deslizante de 16K, memoria Quest exacta en niveles NVMe/page-cache y RoPE por bloques proporcional), reduciendo según el autor la memoria de KV cache a 1M tokens en un 93,5 % (de ~48 GB a ~3,1 GB).

Esta ficha corresponde a la edición BF16 (~160 GB de pesos, ~165 GB de VRAM total a 1M tokens), pensada para MI300X, H200, B200 o despliegues multi-GPU. Existen ediciones alternativas en FP8, NVFP4 y W4A16 para hardware más modesto. El modelo se distribuye bajo licencia Apache 2.0 y requiere el plugin `pb27_vllm` para vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PB27Qwen3NextForCausalLM (MoE híbrido: 36 capas Gated DeltaNet + 12 capas de atención completa con SWA 16K + Quest Exact Memory) |
| Parametros totales | 80.079.012.864 (~80B, dato real de safetensors) |
| Parametros activos | ~3B (arquitectura 80B-A3B de Qwen3-Coder-Next; no disponible un dato exacto en la ficha) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | BF16 (esta edición); existen ediciones FP8, NVFP4 y W4A16 del mismo modelo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (160,2 GB de repo), diseñado para vLLM |

## Arquitectura y entrenamiento

La arquitectura PseudoBrain se apoya en cinco componentes sobre la base Qwen3-Coder-Next. Primero, un híbrido de 48 capas: 36 capas nativas de Gated DeltaNet, cuya estado recurrente tiene tamaño fijo O(1) independientemente de que el contexto sea de 4K o 1M tokens, y 12 capas de atención completa (índices 3, 7, 11... 47) convertidas en atención de ventana deslizante de 16K + Parallel Gated DeltaNet + Quest Exact Memory. Segundo, una memoria exacta Quest de tres niveles (NVMe/page-cache) en las capas ancla, donde las queries atienden sobre 4 sinks de StreamingLLM, landmarks de super-bloque, top-k páginas de memoria y la ventana deslizante de 16.384 tokens, fusionados mediante FlashAttention-2 con LSE-merge y cotas jerárquicas de dos niveles en bf16.

Tercero, un RoPE por bloques estrictamente no solapado que impone una huella obligatoria de 64 tokens por bloque recuperado y escala proporcionalmente los huecos históricos, manteniendo según el autor una fidelidad de distancia temporal superior al 99 % a 1M tokens sin degradación de YaRN estático. Cuarto, una agregación global densa automática que detecta queries globales y activa landmarks-resumen (1 token por cada 4.096 tokens en HBM), cobertura temporal estratificada y barridos de working-set con rotación por novedad para razonamiento multi-paso. Quinto, decodificación a velocidad O(1) constante con presupuestos de prefill y decode desacoplados (stride 64, 64 bloques), con soporte dual de runners V1/V2 de vLLM mediante un plugin registrado vía `vllm.general_plugins`.

Sobre el entrenamiento del finetune concreto (datos, número de tokens, RLHF/DPO), la model card no proporciona información: no disponible. El modelo base Qwen3-Coder-Next fue entrenado por el equipo Qwen de Alibaba, aunque los detalles de su pipeline tampoco constan en la información proporcionada.

## Capacidades

- Generación de texto conversacional (pipeline text-generation) con foco en programación, herencia del linaje Qwen3-Coder.
- Contexto extremo de 1.048.576 tokens con memoria de KV cache casi constante, apto para bases de código completas y corpora muy largos.
- Diseño agéntico: el comando de ejemplo habilita `--enable-auto-tool-choice` con el parser `qwen3_coder`, es decir, soporte de tool calling / function calling en formato Qwen3 Coder.
- Razonamiento multi-paso sobre contextos largos: el mecanismo de barridos de working-set permite que el decode recorra cientos de bloques distintos a lo largo de 1M tokens.
- Servible como API compatible con OpenAI mediante vLLM.
- Despliegue multiplataforma: NVIDIA CUDA y AMD ROCm.
- Capacidades de visión, audio o modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.

## Casos de uso

- Analisis de repositorios completos: con 1M tokens de contexto se puede cargar un monorepo entero (cientos de miles de líneas) en una sola sesión para preguntas de arquitectura, refactoring transversal o detección de deuda técnica, sin fragmentación por RAG.
- Atencion al cliente y asistentes sobre documentación masiva: la memoria Quest de tres niveles permite indexar manuales técnicos muy extensos y responder con recuperación exacta en las capas ancla, manteniendo coste de memoria estable.
- Agentes de código en producción: el soporte de tool calling nativo (parser `qwen3_coder`) y el serving OpenAI-compatible permiten integrarlo en pipelines de CI/CD para revisión automática de pull requests, generación de tests y corrección de bugs con contexto de todo el histórico del proyecto.
- Razonamiento multi-paso agéntico de larga duración: los barridos por novedad sobre bloques de memoria están diseñados para sesiones de agente con cientos de pasos que necesitan consultar información distribuida a lo largo de 1M tokens.
- Procesamiento de logs y trazas a gran escala: análisis forense de incidentes sobre millones de tokens de logs, aprovechando la fidelidad proporcional del RoPE por bloques para preservar la cronología.
- Despliegue on-premise empresarial: el propio autor ofrece soporte para despliegues de 1M contexto en premises; la variante W4A16 (~45,5 GB totales) cabe en 2x RTX 3090/4090 para equipos con presupuesto limitado.
- Resumen y analisis de corpora documentales largos (contratos, expedientes, literatura científica) donde la ventana de 128K estándar resulta insuficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card remite a "benchmark receipts" en el directorio `reports/` del repositorio de GitHub del proyecto, pero no incluye cifras concretas en el texto. Los únicos datos cuantitativos publicados son de ingeniería de serving: reducción del 93,5 % en memoria de KV cache a 1M tokens (~48 GB a ~3,1 GB) y fidelidad de distancia temporal proporcional superior al 99 %.

## Requisitos de hardware

- Edición BF16 (esta ficha): ~160 GB de pesos y ~165 GB de VRAM total a 1M tokens. Requiere AMD Instinct MI300X (192 GB), 2x H200, B200 o multi-GPU CUDA/ROCm.
- Ediciones alternativas del mismo modelo: W4A16 (~41,5 GB pesos, ~45,5 GB totales a 1M; 2x RTX 3090/4090, RTX 6000 Ada, 2x RTX 5090, DGX Spark, MI300X), FP8 (~80,5 GB pesos, ~85 GB totales; H200, DGX Spark, MI300X, 2x A100/H100) y NVFP4 (~41,5 GB pesos; Blackwell: DGX Spark GB10, 2x RTX 5090, RTX PRO 6000 96 GB, B200).
- En una única GPU de consumo (RTX 4090, 24 GB): no cabe ninguna edición; la opción más asequible es la W4A16 en 2x 3090/4090.
- Despliegue: vLLM (V1 y V2) mediante el plugin `pb27_vllm` (instalable con `pip install --no-deps "git+https://github.com/defnotean/pseudobrain.git#subdirectory=serving/pb27_vllm"`), con soporte CUDA y ROCm. No hay soporte documentado para llama.cpp, Ollama o TGI.
- Configuración de referencia del autor: `--max-model-len 1048576`, `--enforce-eager`, `--no-enable-prefix-caching`, `--kv-cache-memory-bytes 6G`, `--max-num-seqs 16`.
- Latencia y throughput: no disponible; el autor afirma decode a coste O(1) constante respecto a la longitud de contexto, sin publicar medias de tokens/segundo.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| PseudoBrain-Qwen3-Coder-Next-BF16 | ~80B | ~3B | 1.048.576 | Apache 2.0 | Finetune comunitario; requiere plugin pb27_vllm; memoria de KV casi constante |
| Qwen/Qwen3-Coder-Next (base) | ~80B | ~3B | no disponible (según ficha base) | Apache 2.0 | Modelo oficial de Qwen; sin la arquitectura PseudoBrain de contexto 1M |
| DeepSeek-V3 | ~671B | ~37B | 128K | Licencia propia (DeepSeek) | MoE mucho mayor; contexto estándar, sin memoria constante |
| Qwen3-Coder-480B-A35B | ~480B | ~35B | 256K | Apache 2.0 | MoE de mayor escala para código; requisitos de hardware muy superiores |

## Limitaciones y advertencias

- Proyecto de un desarrollador individual: la model card no incluye benchmarks estandarizados de calidad (MMLU, HumanEval, etc.), por lo que la calidad del finetune respecto al modelo base Qwen3-Coder-Next no está verificada de forma independiente.
- Dependencia dura del plugin `pb27_vllm`: sin él, el modelo no funciona con las ventajas de contexto 1M; esto acopla el despliegue a un proyecto de terceros y a versiones concretas de vLLM (el autor destaca la "resiliencia de versiones", pero conviene validar en producción).
- Requiere flags de serving no convencionales (`--enforce-eager`, `--no-enable-prefix-caching`), lo que puede penalizar el throughput frente a un serving estándar y desactiva la caché de prefijos.
- Al ser un finetune comunitario sin documentación de datos de entrenamiento, hereda los sesgos y el riesgo de alucinación del modelo base Qwen3-Coder-Next, sin que se conozcan mitigaciones adicionales.
- Idiomas soportados: no disponible en la ficha; el linaje Qwen3 es predominantemente bilingüe (chino/inglés), por lo que el rendimiento en castellano debe validarse.
- La edición BF16 exige ~165 GB de VRAM a 1M tokens, fuera del alcance de la mayoría de equipos; para hardware modesto hay que usar las ediciones W4A16, FP8 o NVFP4.
- Licencia Apache 2.0: sin restricciones para uso comercial, aunque conviene revisar los términos de los modelos base derivados.
- Las afirmaciones de rendimiento (93,5 % de reducción de KV, fidelidad >99 %) proceden del propio autor y no están auditadas por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/defnoteatin/PseudoBrain-Qwen3-Coder-Next-BF16
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-Next
- Repositorio GitHub (plugin pb27_vllm): https://github.com/defnotean/pseudobrain
- Paper de arquitectura (PDF): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.pdf
- Paper de arquitectura (Markdown): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.md
- Informes de benchmarks del autor: https://github.com/defnotean/pseudobrain/tree/main/reports
- Ediciones alternativas: https://huggingface.co/defnoteatin/PseudoBrain-Qwen3-Coder-Next-FP8, https://huggingface.co/defnoteatin/PseudoBrain-Qwen3-Coder-Next-NVFP4
