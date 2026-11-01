# defnoteatin/PseudoBrain-Qwen3-32B-W4A16

## Resumen

PseudoBrain-Qwen3-32B-W4A16 es una re-arquitectura del Qwen3-32B de Qwen, publicada por el ingeniero independiente Ian Kurt Galeon (usuario `defnoteatin` en Hugging Face), cuyo objetivo es servir contextos de hasta 1.048.576 tokens (1M) sin que la memoria de la KV cache crezca de forma lineal con la longitud del contexto. El modelo conserva los pesos de razonamiento de Qwen3-32B, pero sustituye las 64 capas de atención global por un híbrido de atención con ventana deslizante de 16K más Gated DeltaNet paralelo (un bloque recurrente de estado fijo O(1)) y un sistema de memoria exacta dispersa de tres niveles respaldado por NVMe y page cache. Según el autor, esto reduce la KV cache a 1M tokens de ~256 GB a ~4,1 GB, un recorte del 98,4 %.

El resultado es un modelo denso de 33,6 mil millones de parámetros cuantizado en W4A16 (AWQ, 4 bits de pesos, 16 bits de activaciones) que cabe, con contexto de 1M tokens, en una única GPU de consumo de 24 GB (~22,8 GB de VRAM total). Se despliega mediante un plugin propio para vLLM (`pb27_vllm`) compatible con los runners V1/V2 y con NVIDIA CUDA y AMD ROCm. Es relevante para cargas de trabajo de contexto extremadamente largo (análisis de repositorios, documentos masivos, agentes con memoria persistente) que tradicionalmente exigen aceleradores de 80 GB o más.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrido: atención con ventana deslizante de 16K + Gated DeltaNet paralelo + Quest Exact Memory (PB27Qwen3ForCausalLM), 64 capas |
| Parametros totales | 33.604.001.280 (dato real de safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | W4A16 (AWQ, 4 bits de pesos / 16 bits de activaciones) |
| Idiomas soportados | no disponible (hereda los de Qwen3-32B, no documentado en la ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (~21,0 GB el repositorio; ~18,5 GB de pesos del modelo) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-32B (así como de sus variantes AWQ, FP8 y NVFP4 como base de cuantización) y no introduce nuevo entrenamiento documentado: es una conversión arquitectónica de inferencia. Las 64 capas de atención completa se transforman en un esquema híbrido donde cada capa combina atención con ventana deslizante de 16.384 tokens, un bloque Gated DeltaNet paralelo cuyo estado recurrente tiene tamaño constante O(1) independientemente del contexto, y memoria exacta tipo Quest. Sobre las capas de anclaje dispersas, las queries atienden sobre un conjunto compuesto por 4 sinks de StreamingLLM, landmarks de super-bloques, las top-k páginas de Quest Exact Memory y la ventana deslizante, fusionadas mediante FlashAttention-2 con LSE-merge y límites jerárquicos de dos niveles en bf16.

Dos innovaciones destacables: un RoPE por bloques estrictamente no solapado y proporcional por tramos (`_reposition_rope_blocks`), que impone una huella obligatoria de 64 tokens por bloque recuperado y mantiene una fidelidad de distancia temporal macro superior al 99 % a 1M tokens sin degradación estática tipo YaRN; y una agregación global densa automática (`PB27_MEMORY_GLOBAL_AGG="auto"`) que detecta queries globales de alta participación y activa landmarks-resumen (1 token por cada 4.096 tokens en HBM) junto a barridos rotativos por novedad durante el decode, de modo que el razonamiento multi-paso recorre cientos de bloques distintos a lo largo del millón de tokens. No hay información sobre tokens de entrenamiento, composición de datasets ni RLHF/DPO para esta variante (el modelo base Qwen3-32B sí fue entrenado por Qwen con sus propios datos, no detallados aquí).

## Capacidades

- Generación de texto conversacional y razonamiento, heredadas de Qwen3-32B (tag `reasoning`), con parser de razonamiento `qwen3` soportado en el servidor vLLM.
- Contexto extremadamente largo: hasta 1.048.576 tokens con memoria de KV cache constante (~4,1 GB a 1M tokens según el autor).
- Tool calling / function calling: soportado de forma explícita en el despliegue (`--enable-auto-tool-choice --tool-call-parser hermes`).
- Decodificación a velocidad O(1) constante durante el decode, desacoplada del presupuesto de recuperación del prefill (`PB27_MEMORY_DECODE_STRIDE=64`, `PB27_MEMORY_DECODE_BLOCKS=64`).
- Memoria de contexto respaldada por NVMe/page cache (tres niveles), lo que permite superar la capacidad de la HBM de la GPU.
- Despliegue como servidor compatible con la API de OpenAI vía vLLM, en NVIDIA CUDA y AMD ROCm.
- No hay evidencia documentada de capacidades de visión, audio u otros modalidades: es un modelo de solo texto.

## Casos de uso

- Analisis de repositorios de codigo completos: con 1M tokens de contexto se puede cargar un monorepo entero (incluyendo historial o dependencias) en una sola pasada y hacer preguntas de arquitectura o refactoring sin RAG, aprovechando el contexto nativo.
- Revision de documentos legales y contratos masivos: un expediente de cientos de miles de tokens cabe íntegro en contexto; la fidelidad de distancia proporcional del RoPE por bloques ayuda a preservar la cronología del documento.
- Agentes con memoria persistente a largo plazo: el estado recurrente O(1) y la memoria Quest respaldada en NVMe permiten mantener sesiones de trabajo de días o semanas sin que la VRAM crezca con el historial.
- Chatbots de atencion al cliente con historial completo: el decode a coste constante y la ventana de 16K permiten gestionar conversaciones multi-turno muy largas manteniendo el contexto completo accesible vía recuperación dispersa.
- Procesamiento por lotes de logs y telemetria: el prefill con presupuesto de recuperación escalado permite ingerir grandes volúmenes de logs y extraer anomalías o resúmenes en hardware de consumo.
- Investigacion sobre arquitecturas de contexto largo: al ser Apache 2.0 e incluir el paper de arquitectura y los recibos de benchmarks en el repositorio, sirve como base reproducible para experimentar con Gated DeltaNet, memoria jerárquica Quest y RoPE por bloques.
- Despliegue on-premise de contexto 1M en empresas sin GPUs de 80 GB: la variante W4A16 está diseñada explícitamente para GPUs de 24 GB (RTX 3090/4090), reduciendo el coste de infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor referencia "benchmark receipts" en el directorio `reports/` del repositorio de GitHub, centrados en métricas de inferencia (reducción de memoria de KV cache del 98,4 %, de 256,0 GB a ~4,1 GB a 1M tokens), pero no incluye tablas comparativas de calidad en tareas estándar. No se dispone de datos que permitan verificar si la re-arquitectura degrada o preserva la calidad de Qwen3-32B original.

## Requisitos de hardware

- VRAM estimada para inferencia: ~18,5 GB de pesos W4A16 y ~22,8 GB de VRAM total con contexto de 1M tokens (incluyendo ~4,1 GB de KV cache/memoria).
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB), AMD RX 7900 XTX (24 GB) vía ROCm, y RTX 5090 (32 GB) con margen adicional.
- Cabe en GPU de consumo: sí, en una única GPU de 24 GB (RTX 3090/4090), algo excepcional para contexto de 1M tokens; en una 5090 de 32 GB queda holgado.
- Opciones de despliegue: vLLM mediante el plugin `pb27_vllm` (instalable con `pip install --no-deps` desde el repositorio de GitHub o desde el directorio `pb27_vllm_plugin/` incluido en el checkpoint); también se ofrece lanzamiento vía Docker con `serve.sh`. No hay soporte documentado de llama.cpp, Ollama o TGI.
- Parámetros de servidor relevantes: `--max-model-len 1048576`, `--enforce-eager`, `--no-enable-prefix-caching`, `--kv-cache-memory-bytes 6G`, `--max-num-seqs 16`.
- Latencia y throughput estimados: no disponible en cifras concretas; el autor afirma decode a coste O(1) constante respecto a la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Memoria a 1M tokens | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PseudoBrain-Qwen3-32B-W4A16 | 33,6B (denso) | 1.048.576 | ~22,8 GB (VRAM total) | Apache 2.0 | Hugging Face + plugin vLLM propio |
| Qwen3-32B (base, W4A16) | 32,8B (denso) | 32.768 (nativo) | no viable a 1M (KV cache ~256 GB según el autor) | Apache 2.0 | Hugging Face, vLLM, llama.cpp, Ollama |
| Qwen3-30B-A3B (MoE) | 30,5B totales / 3,3B activos | 32.768 (nativo, ampliable a 256K con YaRN) | no disponible a 1M | Apache 2.0 | Hugging Face, vLLM, llama.cpp, Ollama |
| Llama 3.1 8B / 70B | 8B / 70B (densos) | 128K | no viable a 1M | Llama 3.1 Community License | Hugging Face, amplio ecosistema |

La diferencia clave es que ninguna alternativa mainstream ofrece contexto nativo de 1M tokens con huella de VRAM constante; los modelos comparables se quedan en 32K-256K y requieren RAG o compresión de contexto más allá de eso. A cambio, PseudoBrain es un proyecto de autor individual sin validación independiente de calidad, mientras que Qwen3 y Llama 3.1 cuentan con benchmarks públicos extensos.

## Limitaciones y advertencias

- Calidad no verificada independientemente: la conversión arquitectónica (SWA + Gated DeltaNet + memoria dispersa) puede degradar el razonamiento respecto al Qwen3-32B original; no hay benchmarks de calidad publicados y las descargas son muy bajas (298), sin auditoría de terceros.
- Dependencia de un plugin propietario de terceros (`pb27_vllm`): el modelo no funciona con vLLM estándar sin instalar el plugin del autor, lo que introduce riesgo de mantenimiento, compatibilidad con futuras versiones de vLLM y confianza en código de un único desarrollador.
- Requiere `--enforce-eager` y desactivar prefix caching, lo que penaliza el throughput en escenarios con muchos prefills repetidos.
- La memoria Quest se respalda en NVMe/page cache: en discos lentos la recuperación de páginas puede introducir latencias significativas durante el prefill y el decode.
- Sesgos y riesgo de alucinación: heredados de Qwen3-32B; no se han caracterizado específicamente para esta variante.
- Idiomas soportados no documentados en la ficha; probablemente hereda el multilingüismo de Qwen3, pero no está confirmado.
- Licencia Apache 2.0: sin restricciones para uso comercial, aunque conviene verificar las licencias de los modelos base de Qwen (también Apache 2.0).
- El autor declara interés comercial en despliegues enterprise on-premise, lo que conviene tener en cuenta al evaluar la neutralidad de las cifras de rendimiento publicadas.

## Enlaces

- Ficha en Hugging Face: https://huggingface.co/defnoteatin/PseudoBrain-Qwen3-32B-W4A16
- Repositorio de GitHub (plugin `pb27_vllm` y motor universal): https://github.com/defnotean/pseudobrain
- Paper de arquitectura (PDF): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.pdf
- Paper de arquitectura (Markdown): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.md
- Recibos de benchmarks: https://github.com/defnotean/pseudobrain/tree/main/reports
- Perfil de GitHub del autor: https://github.com/defnotean
- Modelo base: https://huggingface.co/Qwen/Qwen3-32B
