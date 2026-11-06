# defnoteatin/PseudoBrain-Qwen3-Coder-Next-W4A16

## Resumen

PseudoBrain-Qwen3-Coder-Next-W4A16 es una versión cuantizada (W4A16) del modelo Qwen3-Coder-Next de Qwen, modificada con la arquitectura PseudoBrain creada por Ian Kurt Galeon (usuario defnoteatin). Se trata de un modelo MoE de código para tareas agénticas que combina atención por ventana deslizante con capas recurrentes Gated DeltaNet (GDN), lo que permite servir contextos de hasta 1.048.576 tokens con un consumo de memoria casi constante. El objetivo del proyecto es resolver el problema clásico del serving de contexto largo: la caché KV crece linealmente y el prefill cuadráticamente, provocando OOM en workloads de cientos de miles o millones de tokens.

La variante W4A16 ocupa unos 41,5 GB de pesos y funciona con aproximadamente 45,5 GB de VRAM totales a 1M tokens de contexto, lo que la hace desplegable en configuraciones de doble GPU de consumo (2x RTX 3090/4090) o en una RTX 6000 Ada de 48 GB. El modelo se distribuye como plugin de vLLM (pb27_vllm) compatible con las versiones V1/V2 de vLLM y con servidores compatibles con la API de OpenAI. Es relevante para desarrolladores que necesitan razonamiento agéntico sobre repositorios de código completos o corpus muy extensos sin hardware de centro de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PB27Qwen3NextForCausalLM (MoE híbrido: Gated DeltaNet + atención por ventanas, arquitectura PseudoBrain) |
| Parametros totales | ~80B (80B-A3B según la model card) |
| Parametros activos | ~3B (MoE) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | W4A16 (pesos en 4 bits, activaciones en 16 bits) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), plugin de serving para vLLM |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3-Coder-Next, un MoE de 80B parámetros totales con unos 3B activos por token. La arquitectura híbrida consta de 48 capas: 36 capas nativas de Gated DeltaNet (una capa recurrente lineal con estado de tamaño O(1) independiente de la longitud del contexto) y 12 capas de atención completa (índices 3, 7, 11, ..., 47) convertidas en atención por ventana deslizante de 16K combinada con GDN paralelo y Quest Exact Memory. Sobre las capas dispersas ancla, las queries atienden sobre 4 sinks de StreamingLLM, landmarks de super-bloques, las top-k páginas de Quest Exact Memory y la ventana deslizante de 16.384 tokens, fusionadas mediante FlashAttention-2 con LSE-merge.

Las innovaciones destacables incluyen: un RoPE por bloques estrictamente no solapado que mantiene la fidelidad de distancia temporal proporcional al 99% a 1M tokens sin degradación estática de YaRN; una agregación global densa con landmarks de resumen (1 token de resumen por cada 4.096 tokens residentes en HBM) y barridos de working-set con rotación por novedad para razonamiento multi-paso; y un decodificado de velocidad constante O(1) que reduce la memoria de caché KV a 1M tokens en un 93,5% (de ~48,0 GB a ~3,1 GB). El prefill separa el presupuesto de recuperación del presupuesto constante de decode. Los datos de entrenamiento del modelo base no están detallados en la información disponible; la cuantización W4A16 se basa en los checkpoints AWQ/FP8/NVFP4 previos del propio autor y de RedHatAI.

## Capacidades

- Generacion de texto y completado conversacional (pipeline text-generation).
- Generacion y edicion de codigo: hereda las capacidades agénticas de codigo de la familia Qwen3-Coder.
- Soporte de tool calling / function calling: el servidor de ejemplo se lanza con `--enable-auto-tool-choice --tool-call-parser qwen3_coder`.
- Razonamiento agéntico multi-paso sobre contextos de 1M tokens, con barridos de memoria que recorren cientos de bloques distintos (diseñado para tareas tipo SWE-bench sobre repositorios completos).
- Contexto ultra-largo con memoria de caché KV casi constante (estado GDN O(1) + Quest Exact Memory en NVMe/page-cache).
- Razonamiento matematico y general no cuantificado en la informacion disponible.
- Capacidades multilingues: no disponible.

## Casos de uso

- Analisis de repositorios completos de codigo: con 1M tokens de contexto se puede cargar un monorepo entero y realizar tareas de refactorizacion o localizacion de bugs agénticas sin trocear el contexto.
- Agentes de ingenieria de software (tipo SWE-agent): el soporte de tool calling con parser qwen3_coder permite integrarlo en bucles agénticos que editan, ejecutan y verifican codigo.
- Revision de documentacion y contratos legales extensos: la ventana de 1M tokens permite procesar corpus de miles de paginas con fidelidad de distancia temporal proporcional.
- Chatbots con memoria de sesion muy larga: el estado GDN de tamaño O(1) permite mantener conversaciones de millones de tokens sin que la VRAM crezca linealmente.
- Despliegue on-premise en hardware de gama alta de consumo: con ~45,5 GB de VRAM totales a 1M tokens cabe en 2x RTX 3090/4090, evitando el coste de A100/H100.
- Auditoria de logs y telemetria a gran escala: el prefill con presupuesto de recuperacion desacoplado permite ingestar volúmenes enormes de texto y consultarlos de forma dispersa.
- Investigacion en arquitecturas de contexto largo: el proyecto publica paper de arquitectura y receipts de benchmarks, útil como referencia para sistemas de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card menciona "benchmark receipts" en el repositorio de GitHub (carpeta `reports/`), pero sin cifras concretas en el material proporcionado. Los datos de rendimiento publicados son de memoria: reduccion del 93,5% en la caché KV a 1M tokens (~48,0 GB a ~3,1 GB) y ~45,5 GB de VRAM total a 1M tokens para esta variante W4A16.

## Requisitos de hardware

- VRAM estimada para inferencia: ~41,5 GB de pesos + ~3,1 GB de caché KV a 1M tokens = ~45,5 GB totales a contexto maximo.
- GPUs recomendadas segun la model card: 2x RTX 3090 / 4090 (48 GB combinados), RTX 6000 Ada (48 GB), 2x RTX 5090, NVIDIA DGX Spark, AMD Instinct MI300X.
- Cabe en hardware de consumo: sí, en configuraciones de doble GPU de 24 GB (2x RTX 3090 o 2x RTX 4090) o en una sola GPU de 48 GB.
- Despliegue: exclusivamente mediante vLLM con el plugin pb27_vllm (instalable con `pip install --no-deps git+...#subdirectory=serving/pb27_vllm`); se recomienda `--enforce-eager --no-enable-prefix-caching --kv-cache-memory-bytes 6G --max-model-len 1048576`. No hay soporte documentado de llama.cpp, Ollama o TGG en la informacion disponible.
- Latencia y throughput: decode de velocidad constante O(1) segun la arquitectura; no hay mediciones concretas de tokens/s en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Precision | Pesos | VRAM a 1M tokens | GPUs objetivo | Licencia |
|---|---|---|---|---|---|
| PseudoBrain-Qwen3-Coder-Next-W4A16 (esta ficha) | W4A16 | ~41,5 GB | ~45,5 GB | 2x RTX 3090/4090, RTX 6000 Ada, 2x 5090 | Apache 2.0 |
| PseudoBrain-Qwen3-Coder-Next-FP8 | FP8 | ~80,5 GB | ~85,0 GB | H200, DGX Spark, MI300X, 2x A100/H100 | Apache 2.0 |
| PseudoBrain-Qwen3-Coder-Next-NVFP4 | NVFP4 | ~41,5 GB | ~45,5 GB | Blackwell (DGX Spark GB10, 2x 5090, RTX PRO 6000, B200) | Apache 2.0 |
| PseudoBrain-Qwen3-Coder-Next-BF16 | BF16 | ~160,0 GB | ~165,0 GB | MI300X, 2x H200/B200 | Apache 2.0 |

Frente al modelo base Qwen/Qwen3-Coder-Next sin PseudoBrain, esta variante ofrece la misma longitud de contexto nominal pero con consumo de caché KV reducido un 93,5% a 1M tokens, a costa de requerir el plugin propietario de serving pb27_vllm y de introducir una arquitectura modificada no oficial de Qwen.

## Limitaciones y advertencias

- Es un modelo comunitario no oficial: la arquitectura PseudoBrain modifica el modelo base de Qwen y requiere un plugin de vLLM específico, lo que puede implicar menor madurez y soporte que los checkpoints oficiales.
- Solo funciona con vLLM (versiones V1/V2) mediante el plugin pb27_vllm; no hay rutas de inferencia con transformers, llama.cpp u Ollama documentadas.
- La cuantizacion W4A16 puede degradar la calidad respecto a las variantes FP8 o BF16; no se publican evaluaciones comparativas de calidad en la informacion disponible.
- El lanzamiento recomendado desactiva el prefix caching (`--no-enable-prefix-caching`), lo que penaliza workloads con prefijos compartidos.
- Riesgo de alucinacion y sesgos: heredados del modelo base Qwen3-Coder-Next; no se documentan evaluaciones especificas de sesgo.
- Idiomas soportados: no disponible en la metadata; el modelo base es de la familia Qwen, orientada principalmente a chino e ingles.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial, aunque conviene verificar las condiciones del modelo base Qwen3-Coder-Next.
- El proyecto es de un autor individual en busca de colaboracion y empleo; la sostenibilidad del mantenimiento a largo plazo no esta garantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/defnoteatin/PseudoBrain-Qwen3-Coder-Next-W4A16
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-Next
- Repositorio GitHub (plugin pb27_vllm): https://github.com/defnotean/pseudobrain
- Paper de arquitectura (PDF): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.pdf
- Paper de arquitectura (Markdown): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.md
- Receipts de benchmarks: https://github.com/defnotean/pseudobrain/tree/main/reports
- Variante FP8: https://huggingface.co/defnoteatin/PseudoBrain-Qwen3-Coder-Next-FP8
- Variante NVFP4: https://huggingface.co/defnoteatin/PseudoBrain-Qwen3-Coder-Next-NVFP4
- Variante BF16: https://huggingface.co/defnoteatin/PseudoBrain-Qwen3-Coder-Next-BF16
