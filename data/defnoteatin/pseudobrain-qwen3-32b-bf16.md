# defnoteatin/PseudoBrain-Qwen3-32B-BF16

## Resumen

PseudoBrain-Qwen3-32B-BF16 es un modelo de generación de texto con capacidad de razonamiento desarrollado por Ian Kurt Galeon (usuario @defnoteatin en Hugging Face y GitHub), que parte del Qwen3-32B de Alibaba como modelo base. Su aportación principal no es el entrenamiento de un modelo nuevo desde cero, sino una rearquitectura de inferencia: convierte las 64 capas de atención completa del Qwen3-32B original en un esquema híbrido de atención por ventana deslizante (16K) combinado con Gated DeltaNet paralelo y un sistema de memoria dispersa denominado Quest Exact Memory. El resultado es un modelo que soporta contextos de hasta 1.048.576 tokens reduciendo la memoria de la KV cache de unos 256 GB a aproximadamente 4,1 GB, una reducción del 98,4 %.

La relevancia del modelo reside en el problema que ataca: en el servicio estándar de Transformers, la memoria de la KV cache crece linealmente con la longitud del contexto y el cómputo del prefill crece de forma cuadrática, lo que hace inviables cargas de trabajo de contexto ultra-largo en hardware convencional. PseudoBrain consigue un decodificado con coste de memoria constante O(1) respecto a la longitud del contexto, permitiendo servir 1M de tokens en una sola GPU de 80 GB en precisión BF16, o en una RTX 4090 de 24 GB en la variante cuantizada W4A16. El modelo se distribuye bajo licencia Apache 2.0 en formato safetensors, con un tamaño de repositorio de 67,2 GB y 33.604.001.280 parámetros totales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PB27Qwen3ForCausalLM: híbrido de atención por ventana deslizante (16K) + Gated DeltaNet paralelo + Quest Exact Memory, sobre Qwen3-32B |
| Parametros totales | 33.604.001.280 |
| Parametros activos | no disponible (no es MoE; modelo denso) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | BF16 (esta ficha); variantes W4A16, FP8 y NVFP4 publicadas en repositorios separados |
| Idiomas soportados | no disponible (hereda las capacidades multilingues de Qwen3-32B) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (67,2 GB de repositorio) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Qwen/Qwen3-32B (32.800 millones de parámetros aproximados, denso) cuya arquitectura de inferencia ha sido sustituida por la denominada PseudoBrain. Consta de 64 capas en las que la atención completa no acotada se reemplaza por tres mecanismos combinados: una atención por ventana deslizante de 16.384 tokens, un Gated DeltaNet paralelo (una capa recurrente lineal cuyo estado tiene tamaño fijo O(1) independientemente del contexto) y una memoria exacta dispersa de tres niveles (NVMe/page cache) llamada Quest Exact Memory. En las capas ancla dispersas, las queries atienden sobre 4 sinks de StreamingLLM, landmarks de super-bloques, las top-k páginas de memoria Quest y la ventana deslizante de 16.384 tokens, fusionadas mediante FlashAttention-2 con LSE-merge y cotas jerárquicas de dos niveles en bf16.

Entre las innovaciones técnicas destacan: un RoPE por bloques estrictamente no solapado con escalado proporcional de huecos históricos, que mantiene una fidelidad del 99 % en distancias temporales macro a 1M de tokens sin degradación estática tipo YaRN; una agregación global densa automática que detecta queries globales y activa landmarks resumen (un token resumen por cada 4.096 tokens residentes en HBM) y barridos de conjunto de trabajo con rotación por novedad para razonamiento multi-paso; y un decodificado de velocidad constante real que desacopla el presupuesto de recuperación del prefill del presupuesto constante de decode. El despliegue se realiza mediante un plugin para vLLM (pb27_vllm) compatible con los runners V1/V2, con soporte para NVIDIA CUDA y AMD ROCm. No se han publicado detalles sobre el proceso de entrenamiento o fine-tuning (tokens, composición del dataset, RLHF/DPO) en la información disponible.

## Capacidades

- Generacion de texto conversacional heredada de Qwen3-32B, con pipeline text-generation y parser de razonamiento qwen3.
- Razonamiento con soporte del reasoning parser qwen3 en vLLM, orientado a tareas de reasoning sobre contextos extremadamente largos.
- Contexto de 1.048.576 tokens con memoria de KV cache constante (~4,1 GB a 1M tokens), habilitando análisis de corpus completos, bases de código enormes o historiales conversacionales masivos.
- Tool calling / function calling: soportado de forma explícita en el servidor vLLM mediante `--enable-auto-tool-choice` y el parser hermes.
- Agentic workflows: el mecanismo de barridos de memoria con rotación por novedad está diseñado para razonamiento multi-paso sobre cientos de bloques distintos a lo largo de 1M de tokens.
- Capacidades multilingues: no disponibles como dato explícito; al derivar de Qwen3-32B, hereda sus capacidades multilingues conocidas.
- Capacidades especiales: memoria recurrente de estado fijo O(1) (Gated DeltaNet), recuperación de memoria en tres niveles con paginación a NVMe, y fidelidad posicional proporcional a contextos de 1M tokens.
- Vision y audio: no disponibles; el modelo es de texto.

## Casos de uso

- Analisis de documentos masivos: preguntas y resumenes sobre corpus de hasta 1M tokens (bibliotecas legales, expedientes clinicos, documentacion tecnica completa) sin troceado ni RAG, gracias a la ventana de contexto de 1M y la memoria constante.
- Comprension de bases de codigo completas: ingesta de repositorios enteros en una sola pasada para revision de codigo, refactorizaciones globales o deteccion de dependencias, aprovechando que la KV cache no crece con el tamano del repo.
- Atencion al cliente con historial extenso: gestion de conversaciones multi-turno con anos de historial en contexto, sin degradacion posicional gracias al RoPE por bloques con fidelidad del 99 % a 1M tokens.
- Agentes de investigacion de largo recorrido: razonamiento multi-paso sobre cientos de fuentes, con barridos de memoria que rotan por novedad y evitan revisitacion redundante de bloques.
- Despliegue on-premise de contexto largo en hardware moderado: la variante W4A16 (~22,8 GB de VRAM total a 1M tokens) permite servir 1M de contexto en una unica RTX 3090/4090 de 24 GB, util para empresas con restricciones de envio de datos.
- Procesamiento por lotes de logs y telemetria: analisis de series largas de eventos con decodificado de coste constante, adecuado para pipelines de analisis continuo.
- Asistentes personales con memoria persistente: el estado recurrente O(1) del Gated DeltaNet permite mantener contexto conversacional acumulado sin coste de memoria creciente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor referencia "benchmark receipts" en el directorio `reports/` del repositorio de GitHub, centrados en metricas de memoria y latencia de inferencia (reduccion de KV cache del 98,4 %: 256 GB a ~4,1 GB a 1M tokens; fidelidad posicional >99 %), pero no se incluyen cifras comparativas de calidad frente a otros modelos. No hay datos que permitan evaluar la degradacion de calidad respecto al Qwen3-32B original tras la rearquitectura.

## Requisitos de hardware

- VRAM estimada para esta variante BF16: ~66,0 GB de pesos + ~4,1 GB de KV cache a 1M tokens = ~71,0 GB totales a contexto maximo.
- GPUs recomendadas para BF16: NVIDIA A100/H100 de 80 GB, DGX Spark de 128 GB, AMD MI300X.
- Consumer GPUs: no cabe en 24 GB en BF16; para RTX 3090/4090 (24 GB) o RX 7900 XTX se recomienda la variante W4A16 (~22,8 GB totales); para RTX 5090 (32 GB) o hardware Blackwell, la variante NVFP4.
- Despliegue: exclusivamente mediante vLLM con el plugin pb27_vllm (instalable via pip desde GitHub o incluido en el propio checkpoint en `pb27_vllm_plugin/`); tambien disponible lanzamiento Docker de un comando mediante `serve.sh` con deteccion automatica de arquitectura. No hay soporte documentado para llama.cpp, Ollama o TGI.
- Comandos de referencia: `vllm serve` con `--max-model-len 1048576`, `--enforce-eager`, `--no-enable-prefix-caching`, `--kv-cache-memory-bytes 6G`, `--max-num-seqs 16`.
- Latencia y throughput: no disponibles como cifras concretas; la arquitectura promete decodificado de velocidad constante O(1) respecto a la longitud del contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PseudoBrain-Qwen3-32B-BF16 | 33,6 B (denso) | 1.048.576 | Hibrido SWA + Gated DeltaNet + Quest Memory | Apache 2.0 | safetensors, plugin vLLM propio |
| Qwen/Qwen3-32B (base) | 32,8 B (denso) | 32.768 (extendible a 131.072 con YaRN) | Transformer denso con atencion completa | Apache 2.0 | safetensors, GGUF, vLLM, Ollama, llama.cpp |
| Qwen/Qwen3-30B-A3B | 30,5 B totales / 3,3 B activos | 32.768 (extendible a 131.072) | MoE | Apache 2.0 | safetensors, GGUF, vLLM, Ollama |
| MiniMax-M1 (referencia de contexto largo) | 456 B totales / 45,9 B activos | 1.000.000 | Hibrido transformer + attention lightning (lineal) | Apache 2.0 | safetensors, vLLM |

PseudoBrain se diferencia de Qwen3-32B base en que multiplica por 32 el contexto util manteniendo la memoria de cache practicamente constante, a costa de requerir un plugin de vLLM especifico y sin benchmarks publicados de calidad. Frente a MiniMax-M1, ofrece un tamano mucho menor (33,6 B frente a 456 B) y por tanto requisitos de hardware inferiores, aunque con menor capacidad de razonamiento general presumiblemente.

## Limitaciones y advertencias

- No hay benchmarks de calidad publicados (MMLU, HumanEval, GSM8K): no es posible verificar si la rearquitectura degrada las capacidades del Qwen3-32B original; el riesgo de alucionacion heredado del modelo base se suma a la incertidumbre de la conversion arquitectonica.
- El modelo es un proyecto individual (autor independiente, 572 descargas y 0 likes en el momento de la ficha), sin respaldo institucional ni auditoria de terceros; conviene validarlo internamente antes de uso en produccion.
- Dependencia total del plugin pb27_vllm: no funciona con llama.cpp, Ollama, TGI ni con vLLM sin el plugin, lo que ancla el despliegue a una version concreta del ecosistema vLLM (el autor destaca compatibilidad V1/V2 y resiliencia a versiones, pero es un punto de fragilidad).
- Requiere flags no estandar en el arranque (`VLLM_ALLOW_LONG_MAX_MODEL_LEN=1`, `--enforce-eager`, `--no-enable-prefix-caching`), lo que desactiva optimizaciones como prefix caching y puede afectar al throughput en cargas con prefijos repetidos.
- El mecanismo de memoria dispersa pagina a NVMe: en contextos de 1M tokens el rendimiento dependera criticamente de la velocidad del almacenamiento, no solo de la GPU.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones destacables.
- Sesgos conocidos y limitaciones de idioma: no disponibles explicitamente; hereda los del Qwen3-32B base.
- Capacidades de vision y audio: no disponibles; modelo exclusivamente textual.

## Enlaces

- Hugging Face (esta ficha): https://huggingface.co/defnoteatin/PseudoBrain-Qwen3-32B-BF16
- Repositorio GitHub con plugin pb27_vllm: https://github.com/defnotean/pseudobrain
- Paper de arquitectura (PDF): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.pdf
- Paper de arquitectura (Markdown): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.md
- Benchmark receipts: https://github.com/defnotean/pseudobrain/tree/main/reports
- Variante W4A16: https://huggingface.co/defnoteatin/PseudoBrain-Qwen3-32B-W4A16
- Modelo base: https://huggingface.co/Qwen/Qwen3-32B
