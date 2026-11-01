# defnoteatin/PseudoBrain-Qwen3-Coder-30B-A3B-BF16

## Resumen

PseudoBrain-Qwen3-Coder-30B-A3B-BF16 es una re-arquitectura del modelo Qwen3-Coder-30B-A3B-Instruct de Qwen, publicada por el desarrollador independiente Ian Kurt Galeon (usuario `defnoteatin` en Hugging Face). El modelo, identificado internamente como `PB27Qwen3MoeForCausalLM`, conserva la base MoE de 30.5B parámetros (con ~3.3B activos por token) orientada a generación de código, pero sustituye la atención global estándar por un diseño híbrido de atención ventana deslizante más Gated DeltaNet paralelo, con el objetivo de servir contextos de hasta 1.048.576 tokens (1M) con memoria de KV cache prácticamente constante.

Su relevancia reside en el problema que ataca: en servidores Transformer convencionales, la KV cache crece linealmente con la longitud de contexto y el prefill crece cuadráticamente, lo que hace inviables cargas de trabajo de contexto ultra-largo (128K–1M tokens) incluso en GPUs con memoria de sobra para los pesos. Según el autor, la arquitectura PseudoBrain reduce la memoria de KV cache en contextos de 1M tokens un 98,4 % (de 192 GB a ~3,1 GB), manteniendo decodificación a coste O(1). El modelo se distribuye bajo licencia Apache 2.0 en formato safetensors y requiere un plugin propio para vLLM (`pb27_vllm`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: ventana deslizante (SWA 16K) + Gated DeltaNet paralelo + Quest Exact Memory (clase `PB27Qwen3MoeForCausalLM`, base qwen3_moe) |
| Parametros totales | 30.784.864.128 (~30,5B, dato real de safetensors) |
| Parametros activos | ~3,3B por token (heredado de Qwen3-Coder-30B-A3B, MoE) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | BF16 (este repositorio); existen ediciones FP8 y NVFP4 del mismo modelo por el autor |
| Idiomas soportados | no disponible (el modelo base Qwen3-Coder está orientado principalmente a código e instrucciones en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (~61,6 GB el repositorio), servible con vLLM mediante el plugin `pb27_vllm` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-Coder-30B-A3B-Instruct (MoE con ~3,3B parámetros activos) y convierte sus 48 capas de atención global en un esquema híbrido: atención con ventana deslizante de 16K tokens combinada con un bloque Gated DeltaNet paralelo (una capa recurrente lineal cuyo estado es de tamaño fijo O(1) independientemente del contexto) y un mecanismo de "Quest Exact Memory" de tres niveles (sinks de StreamingLLM, landmarks de super-bloques, páginas top-k de memoria exacta y la ventana deslizante), fusionados mediante FlashAttention-2 con LSE-merge. Sobre esta base se añaden dos innovaciones destacadas: un RoPE por bloques estrictamente no solapado y proporcional al hueco histórico (que sustituye a YaRN estático y preserva la fidelidad de distancias temporales a 1M tokens), y una agregación global densa que detecta consultas de alta participación y activa resúmenes residentes en HBM (un token resumen por cada 4.096 tokens) con barridos rotativos por novedad durante la decodificación.

No se ha publicado información sobre un entrenamiento adicional del modelo (tokens, composición del dataset, RLHF/DPO); la model card lo presenta como una conversión arquitectónica del checkpoint original más que como un fine-tune tradicional, aunque los metadatos de Hugging Face lo listan como finetune de `NVFP4/Qwen3-Coder-30B-A3B-Instruct-FP4`. La decodificación se ejecuta a coste constante O(1) mediante un presupuesto de recuperación fijo en decode (`PB27_MEMORY_DECODE_STRIDE=64`, `PB27_MEMORY_DECODE_BLOCKS=64`), desacoplado del presupuesto de prefill.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`), heredando las capacidades de instrucción de Qwen3-Coder-30B-A3B-Instruct.
- Generación y comprensión de código, la especialidad del modelo base Qwen3-Coder.
- Contexto ultra-largo nativo de 1M tokens, con recuperación de memoria jerárquica sobre cientos de bloques distintos durante razonamiento multi-paso.
- Soporte de tool calling nativo en vLLM (`--enable-auto-tool-choice --tool-call-parser qwen3_coder`), orientado a flujos agénticos.
- Razonamiento multi-paso sobre repositorios o documentos extensos gracias a la agregación global densa y los landmarks de super-bloques.
- Memoria de KV cache de tamaño constante O(1), lo que permite sesiones larguísimas sin OOM por crecimiento de la cache.
- Compatibilidad con servidores compatibles con la API de OpenAI vía vLLM, en NVIDIA CUDA y AMD ROCm.

## Casos de uso

- Analisis de repositorios completos: el modelo puede ingerir una base de código entera (cientos de miles de tokens) en una sola sesión y responder preguntas de arquitectura o depuración cruzando ficheros lejanos, algo inviable con ventanas de 128K convencionales por el coste de KV cache.
- Asistentes de codigo agenticos: con el parser de tool calls de Qwen3-Coder, puede integrarse en agentes que editan, ejecutan y verifican código en bucles multi-paso, manteniendo el historial completo de herramientas y salidas en contexto.
- Revision de documentos legales o tecnicos de gran volumen: contratos, especificaciones o documentación de cientos de páginas pueden procesarse de una vez, con la fidelidad proporcional de RoPE preservando el orden temporal del documento.
- Atencion al cliente con historial extenso: gestiona conversaciones multi-turno acumulando meses de historial sin degradar la memoria del servidor, gracias a la KV cache constante de ~3,1 GB a 1M tokens.
- Migracion y refactorizacion de legado: análisis de sistemas heredados donde hay que rastrear dependencias y llamadas a lo largo de miles de ficheros, aprovechando el barrido de bloques por novedad del mecanismo de memoria.
- Resumen jerarquico de logs o telemetria: ingesta de logs de producción de gran tamaño para diagnóstico de incidentes, con los landmarks de super-bloque (1 resumen por 4.096 tokens) proporcionando cobertura temporal estratificada.
- Despliegue on-premise empresarial de contexto largo: el autor lo orienta explícitamente a despliegues enterprise de 1M de contexto en instalaciones propias, con GPUs de 80 GB en precisión BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card enlaza a "benchmark receipts" en el repositorio de GitHub del proyecto (`reports/`), centrados presumiblemente en métricas de inferencia y memoria; el único dato cuantitativo declarado es la reducción del 98,4 % en memoria de KV cache a 1M tokens (192 GB → ~3,1 GB). No existen comparativas independientes verificadas de calidad de generación frente al modelo base.

## Requisitos de hardware

- Pesos BF16: ~61 GB; VRAM total estimada a 1M tokens de contexto: ~65 GB.
- GPUs recomendadas según la model card: A100/H100 de 80 GB, DGX Spark (128 GB), 3x RTX 3090/4090 en paralelo, o AMD MI300X.
- No cabe en una única GPU de consumo de 24 GB en BF16; para hardware de consumo, el autor publica ediciones FP8 (~35 GB a 1M tokens, RTX 5090/L40S) y NVFP4 (~20,5 GB, Blackwell: RTX 5090, DGX Spark GB10, B200) que sí caben en una sola GPU de 24-32 GB.
- Despliegue exclusivamente mediante vLLM con el plugin `pb27_vllm` (instalable con `pip install --no-deps git+...#subdirectory=serving/pb27_vllm`), compatible con runners V1/V2 de vLLM, CUDA y ROCm. No hay soporte documentado para llama.cpp, Ollama o TGI.
- Parámetros de servidor recomendados por el autor: `--max-model-len 1048576`, `--enforce-eager`, `--no-enable-prefix-caching`, `--kv-cache-memory-bytes 6G`, `--max-num-seqs 16`.
- Latencia y throughput: no disponible; el autor afirma decodificación a velocidad O(1) constante respecto a la longitud de contexto, pero no publica cifras de tokens/segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PseudoBrain-Qwen3-Coder-30B-A3B-BF16 | 30,5B (3,3B activos) | 1M | Híbrida SWA + Gated DeltaNet (MoE) | Apache 2.0 | Hugging Face, requiere plugin vLLM propio |
| Qwen3-Coder-30B-A3B-Instruct (base) | 30,5B (3,3B activos) | 256K (nativo) | Transformer MoE estándar | Apache 2.0 | Hugging Face, vLLM/SGLang estándar |
| Qwen3-30B-A3B-Instruct-2507 | 30,5B (3,3B activos) | 256K | Transformer MoE estándar | Apache 2.0 | Hugging Face, ecosistema estándar |
| Llama 4 Scout (referencia de contexto largo) | 109B (17B activos) | 10M | Híbrida MoE + iRoPE | Licencia comunitaria Llama | Hugging Face, soporte vLLM nativo |

PseudoBrain ofrece el mayor contexto servible con menor huella de memoria del grupo, a cambio de requerir un plugin de motor no estándar y carecer de validación independiente de calidad.

## Limitaciones y advertencias

- No hay benchmarks públicos independientes de calidad (código, razonamiento, idioma); la conversión arquitectónica podría degradar la calidad respecto al modelo base Qwen3-Coder, y esto no está cuantificado.
- Requiere un plugin de vLLM de terceros (`pb27_vllm`) no mantenido por el equipo oficial de vLLM ni por Qwen; la compatibilidad con futuras versiones de vLLM no está garantizada (el propio autor lo describe como "version-resilient", lo que sugiere fragilidad previa).
- Proyecto de un desarrollador individual con muy poca tracción comunitaria (604 descargas, 0 likes en el momento de la ficha), sin auditoría externa; conviene validar en entorno de pruebas antes de cualquier uso en producción.
- El mecanismo de memoria dispersa (landmarks, páginas top-k) implica que no todo el contexto se atiende de forma exacta en cada paso; tareas que exigen recuperación exacta de detalles muy localizados a 1M tokens deben testearse caso por caso.
- Idiomas soportados no declarados; el modelo base está orientado a código e inglés, por lo que el rendimiento en castellano no está documentado.
- En BF16 el requisito de ~65 GB limita el despliegue a hardware de centro de datos o multi-GPU de consumo; las variantes cuantizadas (FP8/NVFP4) sacrifican precisión.
- Riesgo de alucinación estándar de LLM: no hay datos que sugieran mejoras o empeoramientos específicos, pero el contexto ultra-largo puede amplificar errores de recuperación atribuidos erróneamente al documento fuente.
- Licencia Apache 2.0: sin restricciones para uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/defnoteatin/PseudoBrain-Qwen3-Coder-30B-A3B-BF16
- Repositorio GitHub del proyecto PseudoBrain (plugin `pb27_vllm`): https://github.com/defnotean/pseudobrain
- Paper de arquitectura (PDF): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.pdf
- Paper de arquitectura (Markdown): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.md
- Informes de benchmarks del autor: https://github.com/defnotean/pseudobrain/tree/main/reports
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Variantes del autor: https://huggingface.co/defnoteatin/PseudoBrain-Qwen3-Coder-30B-A3B-FP8 y https://huggingface.co/defnoteatin/PseudoBrain-Qwen3-Coder-30B-A3B-NVFP4
- Perfil del autor en GitHub: https://github.com/defnotean
