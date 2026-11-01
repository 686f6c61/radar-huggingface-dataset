# defnoteatin/PseudoBrain-Qwen3.5-9B-W4A16

## Resumen

PseudoBrain-Qwen3.5-9B-W4A16 es una re-arquitectura cuantizada del modelo Qwen3.5-9B de Qwen, publicada por el desarrollador independiente Ian Kurt Galeon (usuario `defnoteatin` en Hugging Face). El proyecto, denominado PseudoBrain (clase `PB27ForConditionalGeneration`), transforma el modelo base en una arquitectura híbrida que combina ventanas de atención deslizante con capas recurrentes Gated DeltaNet (GDN), con el objetivo de servir contextos de hasta 1.048.576 tokens (1M) en GPUs de consumo con menos de 6,5 GB de VRAM en total.

El problema que resuelve es el cuello de botella clásico del serving de Transformers: la caché KV crece linealmente con la longitud de contexto y el cómputo de prefill crece cuadráticamente, lo que hace inviables cargas de trabajo de contexto muy largo en hardware modesto. PseudoBrain reduce la memoria de la caché KV en contextos de 1M tokens un 99,2% (de 32 GB a aproximadamente 1 GB de pool activo) manteniendo un estado recurrente de tamaño constante O(1).

Su relevancia actual radica en la demanda creciente de contextos ultralargos (análisis de repositorios completos, documentos extensos, agentes multi-paso) sin recurrir a GPUs de datacenter. La versión W4A16 pesa unos 5,5 GB en pesos y funciona en GPUs de 8-12 GB como la RTX 3060 o 4060, desplegada mediante un plugin propio para vLLM (`pb27_vllm`) compatible con NVIDIA CUDA y AMD ROCm. El modelo se distribuye bajo licencia Apache 2.0 en formato safetensors con cuantización compressed-tensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: 24 capas Gated DeltaNet (GDN) + 8 capas de atencion completa con ventana deslizante de 16K + Quest Exact Memory (clase PB27ForConditionalGeneration) |
| Parametros totales | 10.192.336.112 (dato real de safetensors, ~10,19 B) |
| Parametros activos | no disponible (arquitectura densa recurrente; no es MoE) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | W4A16 (pesos a 4 bits, activaciones a 16 bits), formato compressed-tensors |
| Idiomas soportados | no disponible (hereda del modelo base Qwen3.5-9B, que no se detalla en la ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), tamano de repo 10,2 GB; pesos del modelo ~5,5 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B y lo convierte en una arquitectura hibrida de 32 capas: 24 capas nativas Gated DeltaNet, un mecanismo recurrente lineal cuyo estado tiene tamano fijo O(1) independientemente de la longitud del contexto, y 8 capas de atencion completa (indices 3, 7, 11, 15, 19, 23, 27 y 31) convertidas en atencion con ventana deslizante de 16K tokens mas Parallel Gated DeltaNet y Quest Exact Memory. Sobre las capas de anclaje dispersas, las queries atienden sobre un conjunto compuesto por 4 sinks de StreamingLLM, super-bloques landmark, paginas top-k de Quest Exact Memory y la ventana deslizante de 16.384 tokens, fusionadas mediante FlashAttention-2 con LSE-merge y cotas jerarquicas de dos niveles en bf16 (superbloques de 64 tokens).

Entre las innovaciones destacan: un RoPE por bloques estrictamente no solapado y proporcional por tramos que preserva la continuidad local y mantiene la fidelidad de distancias temporales macro (99%+ segun el autor) a 1M de tokens sin degradacion estatica tipo YaRN; una agregacion global densa con deteccion automatica de queries globales que activa landmarks resumenes residentes (1 token resumen por cada 4.096 tokens en HBM) y barridos rotativos por novedad para razonamiento multi-paso; y decodificacion a velocidad constante O(1) con presupuesto de recuperacion separado del de decode (stride y bloque de 64). No hay informacion sobre datos de entrenamiento, numero de tokens ni procesos de RLHF/DPO: el modelo es una conversion arquitectonica y de cuantizacion del base model, no un reentrenamiento documentado. No se han publicado resultados de benchmarks independientes en la informacion disponible (el autor remite a "benchmark receipts" en su repositorio de GitHub).

## Capacidades

- Generacion de texto conversacional (pipeline text-generation), heredando las capacidades del modelo base Qwen3.5-9B.
- Contexto ultralargo de hasta 1.048.576 tokens con memoria de cache KV practicamente constante (~256 MiB de ventana activa, ~1 GB de pool).
- Modo de razonamiento compatible con el parser `qwen3` en vLLM (salida de razonamiento estructurada).
- Tool calling / function calling: el comando de servidor de referencia activa `--enable-auto-tool-choice` con el parser `qwen3_coder`.
- Razonamiento multi-paso sobre contextos de 1M tokens mediante barridos de working-set por novedad y landmarks jerarquicos.
- Servidor compatible con la API de OpenAI a traves de vLLM (V1 y V2), con soporte NVIDIA CUDA y AMD ROCm.
- Cuantizacion W4A16 (compressed-tensors) optimizada para GPUs de consumo.

## Casos de uso

- Analisis de repositorios de codigo completos: con 1M de tokens de contexto, el modelo puede ingerir una codebase entera y responder preguntas sobre dependencias cruzadas entre ficheros, algo inviable con ventanas de 128K en una GPU de 8 GB.
- Revision de documentacion y contratos extensos: ingesta de manuales tecnicos, expedientes o contratos de cientos de paginas en una sola pasada, gracias al RoPE proporcional que preserva la distancia temporal entre secciones.
- Chatbot de atencion al cliente con historial completo: el estado recurrente O(1) permite mantener conversaciones con meses de historial sin que la memoria crezca con cada turno.
- Agentes multi-paso con memoria de largo plazo: los barridos rotativos de super-bloques permiten que un agente razonando en muchos pasos recupere informacion de cientos de bloques distintos repartidos por el contexto completo.
- Procesamiento por lotes de documentos en estaciones de trabajo locales: el bajo footprint (~6,5 GB de VRAM a 1M tokens) permite despliegues on-premise en hardware de consumo, util para sectores con requisitos de privacidad (legal, sanitario).
- Asistentes de investigacion sobre corpus academicos: resumen y consulta de decenas de papers simultaneamente en una sola sesion.
- Despliegue en GPUs AMD (RX 7600/7900 XTX) gracias al soporte ROCm del plugin pb27_vllm, util en entornos sin hardware NVIDIA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor remite a "benchmark receipts" en el directorio `reports/` de su repositorio de GitHub, pero no se incluyen cifras comparativas verificadas (MMLU, HumanEval, GSM8K, etc.) en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: ~6,5 GB totales a 1M tokens (pesos ~5,5 GB + cache ~1 GB); a contextos cortos el footprint es menor.
- GPUs recomendadas segun el autor: RTX 3060, 4060, 4070, 3090 y 4090 (NVIDIA), y RX 7600 y 7900 XTX (AMD ROCm).
- Cabe en GPUs de consumo de 8-12 GB: es precisamente el objetivo declarado de esta edicion W4A16.
- Despliegue: vLLM mediante el plugin `pb27_vllm` (instalable con pip desde el repositorio de GitHub, tambien incluido dentro del checkpoint en `pb27_vllm_plugin/`). No se menciona soporte para llama.cpp, Ollama o TGI.
- Comando de referencia: `vllm serve` con `--max-model-len 1048576`, `--enforce-eager`, `--no-enable-prefix-caching`, `--kv-cache-memory-bytes 6G` y `--max-num-seqs 16`.
- Latencia y throughput: el autor afirma decodificacion a velocidad constante O(1) independiente de la longitud de contexto; no se publican cifras concretas de tokens/segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | VRAM a 1M tokens | Licencia |
|---|---|---|---|---|---|
| PseudoBrain-Qwen3.5-9B-W4A16 | 10,19 B | 1M | W4A16 | ~6,5 GB | Apache 2.0 |
| PseudoBrain-Qwen3.5-9B-FP8 (mismo autor) | 10,19 B | 1M | FP8 | ~11,0 GB | Apache 2.0 |
| PseudoBrain-Qwen3.5-9B-BF16 (mismo autor) | 10,19 B | 1M | BF16 | ~20,0 GB | Apache 2.0 |
| Qwen/Qwen3.5-9B (base) | ~9 B | no disponible | BF16 | no disponible (la cache KV crece linealmente) | no disponible en la ficha |

Frente a Transformers densos de tamano similar con contexto largo estandar (128K), la ventaja diferencial de PseudoBrain es la memoria de cache constante y el coste de prefill reducido; el precio es que las 24 de 32 capas son recurrentes (GDN), lo que puede afectar a la calidad de recuperacion exacta frente a atencion completa, aspecto no verificado con benchmarks independientes.

## Limitaciones y advertencias

- Modelo de un desarrollador independiente, no verificado por terceros: no hay benchmarks independientes publicados y las cifras de rendimiento (99,2% de reduccion de cache, fidelidad 99%+) proceden del propio autor.
- Requiere obligatoriamente el plugin `pb27_vllm` y flags concretos de vLLM (`VLLM_ALLOW_LONG_MAX_MODEL_LEN=1`, `--enforce-eager`, desactivar prefix caching); no funcionara con stacks de inferencia estandar sin el plugin.
- La recuperacion sobre contextos de 1M tokens es aproximada (ventana + landmarks + paginas top-k), por lo que la exactitud de recuperacion de detalles puntuales ("needle in a haystack") puede ser inferior a la de atencion completa; no hay datos publicados que lo cuantifiquen.
- Sesgos: hereda los del modelo base Qwen3.5-9B; no se documentan evaluaciones de sesgo especificas.
- Riesgo de alucinacion: tipico de LLM de ~10B parametros, agravado en contextos ultralargos donde la recuperacion es aproximada.
- Idiomas soportados no especificados en la ficha.
- La licencia Apache 2.0 permite uso comercial sin restricciones relevantes, pero conviene verificar la licencia del modelo base Qwen3.5-9B para derivados.
- Proyecto en estado temprano (creado en octubre de 2026, 354 descargas, 0 likes en el momento de la ficha): esperar cambios de API y posibles bugs en el plugin.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/defnoteatin/PseudoBrain-Qwen3.5-9B-W4A16
- Repositorio GitHub y plugin pb27_vllm: https://github.com/defnotean/pseudobrain
- Paper de arquitectura (PDF): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.pdf
- Paper de arquitectura (Markdown): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.md
- Informes de benchmarks del autor: https://github.com/defnotean/pseudobrain/tree/main/reports
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Otras ediciones del autor: https://huggingface.co/defnoteatin/PseudoBrain-Qwen3.5-9B-FP8, https://huggingface.co/defnoteatin/PseudoBrain-Qwen3.5-9B-NVFP4, https://huggingface.co/defnoteatin/PseudoBrain-Qwen3.5-9B-BF16
