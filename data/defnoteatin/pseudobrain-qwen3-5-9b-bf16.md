# defnoteatin/PseudoBrain-Qwen3.5-9B-BF16

## Resumen

PseudoBrain-Qwen3.5-9B-BF16 es un modelo de generación de texto de 9B parámetros (10,19 GB en safetensors) creado por el desarrollador independiente defnoteatin (Ian Kurt Galeon) a partir del modelo base Qwen/Qwen3.5-9B. Su propuesta de valor no está tanto en las capacidades del modelo base como en la arquitectura de inferencia: sustituye la caché KV estándar de un transformer denso por un sistema híbrido de atención ventanada más Gated DeltaNet (GDN) con memoria recurrente de tamaño constante O(1), lo que permite servir contextos de hasta 1.048.576 tokens (1M) con una huella de memoria de caché drásticamente reducida (según el autor, de 32 GB a unos 256 MiB de ventana activa, una reducción del 99,2%).

El problema que resuelve es bien conocido en serving de LLM: en un transformer estándar los pesos se pagan una sola vez, pero la caché KV crece linealmente con la longitud de contexto y el cómputo de prefill crece cuadráticamente, lo que provoca OOM en cargas de contexto largo. PseudoBrain aborda esto con 32 capas (24 Gated DeltaNet nativas y 8 de atención completa convertidas en SWA de 16K + GDN paralelo + "Quest Exact Memory" en NVMe/page-cache), RoPE por bloques no solapado y agregación global densa automática.

Es relevante ahora porque lleva el contexto de 1M tokens a GPUs de consumo: la edición BF16 de este repositorio requiere unos 20 GB de VRAM en total (una RTX 3090 o 4090 de 24 GB), mientras que las variantes W4A16 y NVFP4 del mismo autor bajan a unos 6,5 GB, accesibles desde una RTX 3060. Se despliega mediante un plugin propio para vLLM (`pb27_vllm`) compatible con NVIDIA CUDA y AMD ROCm. Conviene señalar que se trata de un proyecto de un autor individual, con 676 descargas y sin likes en el momento de redactar la ficha, por lo que la validación comunitaria es todavía limitada y las cifras de rendimiento proceden principalmente del propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 24 capas Gated DeltaNet + 8 capas de atención completa con SWA de 16K, GDN paralelo y Quest Exact Memory (clase `PB27ForConditionalGeneration`) |
| Parametros totales | 10.192.336.112 (≈10,19 B, según safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | BF16 (este repositorio); variantes del mismo autor en W4A16, FP8 y NVFP4 |
| Idiomas | No disponibles (el modelo base Qwen3.5-9B es multilingue, pero no se detalla en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (≈18 GB de pesos BF16; repo de 20,4 GB, incluye el plugin `pb27_vllm_plugin/`) |

## Arquitectura y entrenamiento

La arquitectura es un híbrido de 32 capas que combina modelos de estado recurrentes con atención dispersa. Veinticuatro capas son Gated DeltaNet (GDN) nativas, cuyo estado recurrente tiene tamaño fijo O(1) independientemente de que el contexto sea de 4K o 1M tokens. Las ocho capas restantes (índices 3, 7, 11, 15, 19, 23, 27 y 31) son de atención completa, convertidas en una ventana deslizante de 16.384 tokens más GDN paralelo más un sistema de "Quest Exact Memory" de tres niveles (NVMe/page-cache): las queries atienden sobre 4 sinks de StreamingLLM, super-bloques landmark, las top-k paginas exactas de memoria y la ventana deslizante, fusionadas via FlashAttention-2 con LSE-merge y cotas jerárquicas de super-bloque bf16.

Sobre esta base se añaden dos innovaciones destacadas: un RoPE por bloques estrictamente no solapado, con huella obligatoria de 64 tokens por bloque recuperado y escalado proporcional de huecos historicos (que, según el autor, mantiene una fidelidad del 99%+ en distancias temporales a 1M tokens sin degradación estática tipo YaRN), y una detección automática de queries globales de alta participación que activa landmarks-resumen residentes en HBM (un token resumen por cada 4.096 tokens) y barridos rotativos por novedad durante el decode, para que el razonamiento multi-paso recorra cientos de bloques distintos. El decode es de velocidad y memoria constantes O(1). El modelo es un finetune de Qwen/Qwen3.5-9B; no se publica información sobre el dataset de entrenamiento, el numero de tokens de entrenamiento ni el uso de RLHF/DPO.

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`), heredada del modelo base Qwen3.5-9B.
- Procesamiento de contextos extremadamente largos: hasta 1.048.576 tokens con memoria de caché casi constante, el rasgo diferencial del modelo.
- Razonamiento multi-paso sobre contextos de 1M tokens gracias a los barridos rotativos por novedad sobre bloques de memoria.
- Tool calling / function calling: el comando de serving recomendado activa `--enable-auto-tool-choice` con parser `qwen3_coder`, heredando el soporte de herramientas del modelo base.
- Modo de razonamiento compatible con el parser `qwen3` de vLLM (`--reasoning-parser qwen3`).
- Servido como API compatible con OpenAI mediante vLLM.
- Despliegue multiplataforma: plugin universal para vLLM V1/V2 en NVIDIA CUDA y AMD ROCm.
- Capacidades multilingues: no disponibles explicitamente en la model card.

## Casos de uso

- Analisis de repositorios de codigo completos: con 1M tokens de contexto se puede cargar un codebase entero (cientos de miles de lineas) en una sola conversacion y hacer preguntas de arquitectura, refactoring o deteccion de bugs sin fragmentar el codigo, aprovechando el parser `qwen3_coder` para tool calling.
- Revisión de documentos legales o contratos extensos: la ventana de 1M tokens permite ingerir expedientes completos y el RoPE proporcional por bloques preserva, según el autor, la fidelidad de las distancias temporales, util para rastrear clausulas y fechas a lo largo del documento.
- Chatbots de atencion al cliente con historial masivo: el decode O(1) mantiene la latencia constante aunque la conversacion crezca, y la memoria recurrente de tamaño fijo evita el crecimiento de la caché KV por sesion.
- Asistentes de investigacion sobre corpora cientificos: la agregacion global densa con landmarks-resumen permite consultas que cruzan cientos de bloques de un corpus de 1M tokens, adecuado para sintesis multi-documento.
- Despliegue on-premise de contexto largo en hardware modesto: las variantes W4A16/NVFP4 del mismo autor caben en GPUs de 8-12 GB, y esta edicion BF16 en una sola RTX 3090/4090, sin necesidad de nodos multi-GPU ni H100.
- Procesamiento de logs y telemetria a gran escala: ingesta de sesiones de logs de dias o semanas para deteccion de anomalias, beneficiandose del coste de prefill desacoplado del presupuesto constante de decode.
- Agentes con memoria de largo plazo: la "Quest Exact Memory" persistente y los barridos por novedad permiten agentes multi-paso que retoman y revisan contextos muy extensos entre pasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor referencia "benchmark receipts" en el directorio `reports/` de su repositorio de GitHub y cifras propias de memoria (reduccion del 99,2% en caché KV a 1M tokens; fidelidad del 99%+ en distancias macro-temporales), pero no se incluyen tablas comparativas verificables de calidad frente a otros modelos. No se dispone de datos independientes.

## Requisitos de hardware

- VRAM estimada para esta edicion BF16: ~18 GB de pesos + ~2 GB de contexto = ~20 GB totales a 1M tokens (segun el autor).
- GPU recomendadas: una sola RTX 3090 o RTX 4090 de 24 GB, o AMD RX 7900 XTX de 24 GB.
- Esta edicion BF16 no cabe en GPUs de consumo de 8-12 GB; para eso el autor publica variantes W4A16 (~6,5 GB totales, RTX 3060/4060/4070/3090/4090, RX 7600/7900 XTX) y NVFP4 (~6,5 GB, GPUs Blackwell como RTX 5060-5090), ademas de una version FP8 (~11 GB, RTX 4070 Ti/4080/4090/5090, MI300X).
- Despliegue: exclusivamente mediante vLLM con el plugin `pb27_vllm` (instalable con `pip install --no-deps git+...#subdirectory=serving/pb27_vllm` o desde el directorio `pb27_vllm_plugin/` incluido en el propio repo). No hay soporte indicado para llama.cpp, Ollama ni TGI.
- Comando de referencia: `vllm serve` con `--max-model-len 1048576`, `--enforce-eager`, `--no-enable-prefix-caching`, `--kv-cache-memory-bytes 6G` y `--max-num-seqs 16`.
- Latencia y throughput: el autor afirma decode de velocidad constante O(1) y prefill con presupuesto de recuperacion escalado; no se publican cifras concretas de tokens/segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Memoria a contexto largo | Licencia |
|---|---|---|---|---|---|
| PseudoBrain-Qwen3.5-9B-BF16 | 10,19 B | 1M tokens | Hibrida GDN + SWA + memoria dispersa | ~20 GB a 1M tokens (BF16) | Apache 2.0 |
| Qwen/Qwen3.5-9B (base) | ~9 B | No disponible en la informacion proporcionada | Transformer denso | Caché KV crece linealmente; OOM probable a contextos extremos | No disponible |
| Qwen3-4B-Instruct-2507 (referencia de categoria) | 4 B | 256K tokens | Transformer denso | Caché KV estandar, requiere VRAM proporcional al contexto | Apache 2.0 |
| IBM Granite 4.0 (referencia de categoria) | Hasta 32B (hybrid) | Hasta 128K tokens | Hibrida Mamba-2/transformer | Caché reducida por capas SSM | Apache 2.0 |

Nota: la comparacion con el modelo base Qwen3.5-9B se limita a lo publicado en la model card; no hay datos de rendimiento comparativos publicados por terceros para PseudoBrain.

## Limitaciones y advertencias

- Validacion limitada: es un proyecto de un autor individual, con 676 descargas y sin comunidad establecida; las cifras de memoria y fidelidad (99,2%, 99%+) proceden del propio autor y no estan verificadas de forma independiente.
- Sin benchmarks estandarizados publicados: no es posible evaluar si el finetune y la nueva arquitectura degradan la calidad del modelo base Qwen3.5-9B en tareas generales, codigo o razonamiento.
- Dependencia de un plugin propietario de vLLM: el modelo no funciona con stack estandar (llama.cpp, Ollama, TGI, transformers); requiere `pb27_vllm`, lo que ancla el despliegue a una sola herramienta y a su mantenimiento.
- Restricciones de configuracion: el serving recomendado exige `--enforce-eager` y `--no-enable-prefix-caching`, lo que penaliza el throughput frente a despliegues vLLM convencionales con CUDA graphs y prefix caching.
- Riesgo de alucinacion: inherente a los LLM; agravado potencialmente por la recuperacion dispersa de memoria a 1M tokens, donde la atencion sobre paginas seleccionadas puede omitir informacion relevante del contexto.
- Sesgos: heredados del modelo base Qwen3.5-9B y de su corpus de entrenamiento; no se documenta ningun proceso de mitigacion especifico.
- Idiomas: no declarados en la model card; la cobertura multilingue depende del modelo base y no esta verificada para este finetune.
- Licencia: Apache 2.0, sin restricciones para uso comercial, aunque conviene revisar los terminos del modelo base Qwen3.5-9B.
- La calidad del RoPE por bloques y de la memoria exacta a 1M tokens es una afirmacion del autor; se recomienda validar con casos de prueba propios antes de uso en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/defnoteatin/PseudoBrain-Qwen3.5-9B-BF16
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio GitHub y plugin `pb27_vllm`: https://github.com/defnotean/pseudobrain
- Paper de arquitectura (PDF): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.pdf
- Paper de arquitectura (Markdown): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.md
- Benchmark receipts: https://github.com/defnotean/pseudobrain/tree/main/reports
- Variantes del autor: https://huggingface.co/defnoteatin/PseudoBrain-Qwen3.5-9B-FP8 y https://huggingface.co/defnoteatin/PseudoBrain-Qwen3.5-9B-NVFP4
- GitHub del autor: https://github.com/defnotean
