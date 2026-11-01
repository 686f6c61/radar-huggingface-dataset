# defnoteatin/PseudoBrain-Qwen3-32B-NVFP4

## Resumen

PseudoBrain-Qwen3-32B-NVFP4 es una reinterpretación cuantizada del Qwen3-32B de Alibaba, publicada por el desarrollador independiente Ian Kurt Galeon (usuario `defnoteatin` en Hugging Face). El modelo no es un reentrenamiento completo, sino una rearquitectura de inferencia: las 64 capas de atención global del transformer original se sustituyen por un esquema híbrido que combina atención con ventana deslizante de 16K tokens, el bloque recurrente Gated DeltaNet (GDN) de estado constante y un mecanismo de memoria dispersa denominado Quest Exact Memory. El objetivo declarado es hacer viable un contexto de hasta 1.048.576 tokens en hardware de consumo.

El problema que resuelve es el crecimiento lineal de la caché KV y el coste cuadrático del prefill en servidores de transformer estándar. Según el autor, el sistema reduce la memoria de la caché KV a 1M tokens de unos 256 GB a aproximadamente 4,1 GB (una reducción del 98,4%), manteniendo un decodificado de coste constante O(1) con respecto a la longitud del contexto. Esto permite servir ventanas de un millón de tokens en una única GPU de 24 GB como la RTX 3090 o 4090.

El modelo se distribuye en precisión NVFP4 (formato de 4 bits de NVIDIA, pensado para hardware Blackwell, aunque el autor lo etiqueta también como W4A16) con pesos en safetensors de unos 22,4 GB en el repositorio y una licencia Apache 2.0 heredada del modelo base. Requiere el plugin `pb27_vllm` para vLLM, incluido en el propio repositorio, y no es compatible con runtimes de inferencia convencionales sin dicho plugin. Su relevancia actual radica en la tendencia hacia arquitecturas híbridas attention + SSM/linear attention para contextos ultra largos, aunque conviene tratar las cifras de rendimiento publicadas como afirmaciones del autor aún sin verificación independiente amplia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: ventana deslizante de 16K + Parallel Gated DeltaNet + Quest Exact Memory (PB27Qwen3ForCausalLM), derivada de Qwen3-32B |
| Parametros totales | 33.604.001.280 (dato real de safetensors) |
| Parametros activos | No aplica (no es MoE; modelo denso) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | NVFP4 (etiquetado tambien como W4A16 / 8-bit compressed-tensors en los metadatos) |
| Idiomas soportados | No disponibles (hereda el multilingue de Qwen3-32B, no especificado en la ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (compressed-tensors), con plugin vLLM incluido (`pb27_vllm_plugin/`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-32B (transformer denso de 32B con razonamiento) y aplica la arquitectura PseudoBrain, descrita por el autor en un documento tecnico en su repositorio de GitHub. Los componentes principales son: (1) conversion de las 64 capas de atencion global en 16 capas efectivas de atencion con ventana de 16K tokens combinadas en paralelo con Gated DeltaNet, cuyo estado recurrente tiene tamano fijo O(1) independientemente del contexto; (2) un sistema de memoria exacta dispersa en tres niveles (NVMe/page cache) donde las consultas atienden sobre 4 tokens "sink" de StreamingLLM, hitos de super-bloques, paginas top-k de Quest Exact Memory y la ventana deslizante de 16.384 tokens, fusionados via FlashAttention-2 con cotas jerarquicas de dos niveles en bf16; (3) un RoPE por bloques proporcional y sin solapamiento que preserva la fidelidad temporal a 1M tokens sin degradacion estatica tipo YaRN; y (4) una agregacion global densa que detecta consultas globales y activa hitos-resumen (un token por cada 4.096 tokens en HBM) para razonamiento multi-paso sobre cientos de bloques distintos.

No hay indicios de entrenamiento adicional del modelo: se trata de una cuantizacion y reorganizacion arquitectonica para inferencia, no de un post-training con nuevos datos. Los datos de entrenamiento originales, el numero de tokens y los procedimientos de RLHF/DPO corresponden a Qwen3-32B y no se detallan en la model card de este repositorio. La innovacion tecnica destacable es la desacoplamiento del presupuesto de recuperacion del prefill y del decodificado (constante en decode), lo que permite memoria y latencia de decode independientes de la longitud del contexto, implementado como plugin de vLLM con soporte de runners V1/V2.

## Capacidades

- Generacion de texto conversacional heredada de Qwen3-32B, con parser de razonamiento `qwen3` integrado en el servidor vLLM (modo thinking).
- Contexto ultra largo de hasta 1.048.576 tokens con memoria de KV cache aproximadamente constante (~4,1 GB a 1M tokens segun el autor).
- Razonamiento multi-paso sobre contextos de 1M tokens mediante barridos de memoria con rotacion por novedad (`visit_counts`).
- Tool calling / function calling soportado via el parser `hermes` de vLLM (`--enable-auto-tool-choice`).
- Despliegue como servidor compatible con la API de OpenAI.
- Compatibilidad con NVIDIA CUDA y AMD ROCm a traves del plugin universal `pb27_vllm`.
- Capacidades de vision, audio u otras modalidades: no disponibles (modelo de solo texto).

## Casos de uso

- Analisis de repositorios de codigo completos: la ventana de 1M tokens permite cargar codebases enteras (cientos de miles de lineas) en una sola peticion, con el mecanismo Quest Exact Memory recuperando las secciones relevantes durante el razonamiento.
- Revisión de documentos legales o contratos extensos: contratos multi-centenares de paginas pueden procesarse de una vez; el RoPE por bloques mantiene la coherencia posicional a lo largo de todo el documento.
- Asistentes de investigacion sobre corpus cientificos: indexacion en contexto de decenas de papers completos para preguntas transversales, aprovechando los hitos-resumen por cada 4.096 tokens.
- Atencion al cliente con historial completo: el estado O(1) del Gated DeltaNet permite mantener conversaciones e historiales de sesion muy largos sin que el coste de memoria crezca con cada turno.
- Agentes de razonamiento multi-paso sobre trazas largas: la agregacion global densa y los barridos de memoria estan disenados para que el modelo consulte cientos de bloques distintos durante el decodificado, util en debugging de logs extensos o analisis forense de sistemas.
- Chat privado on-premise en hardware de consumo: con ~22,8 GB de VRAM total a 1M tokens, cabe en una RTX 3090/4090 de 24 GB, lo que habilita despliegues locales de contexto largo sin datacenter.
- Procesamiento por lotes de transcripciones largas (reuniones, podcasts): prefill con presupuesto de recuperacion escalado y decode constante permiten resumir horas de contenido en una sola pasada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible de la model card. El autor referencia "benchmark receipts" en el directorio `reports/` de su repositorio de GitHub, centrados en metricas de memoria y latencia de inferencia (por ejemplo, la reduccion del 98,4% en KV cache a 1M tokens), pero no se incluyen cifras de calidad en tareas academicas ni comparaciones verificadas con el Qwen3-32B original en esta ficha. Dado que la arquitectura de atencion se modifica sustancialmente respecto al modelo base, la calidad en tareas de razonamiento y recuperacion a contextos largos deberia validarse de forma independiente antes de uso en produccion.

## Requisitos de hardware

- VRAM estimada para inferencia: ~18,5 GB de pesos + ~4,1 GB de KV cache a 1M tokens, total ~22,8 GB segun el autor (edicion NVFP4/W4A16).
- GPU recomendadas por el autor: NVIDIA Blackwell (RTX 5090 de 32 GB, DGX Spark GB10, B200) para NVFP4 nativo; la tabla del autor tambien lista RTX 3090/4090 de 24 GB y AMD RX 7900 XTX de 24 GB como objetivos para esta edicion.
- Cabe en GPU de consumo: si, en una unica RTX 3090 o RTX 4090 de 24 GB (segundo objetivo declarado del repositorio), y con holgura en una RTX 5090 de 32 GB.
- Otras ediciones del mismo modelo para otro hardware: FP8 (~39 GB total; L40S, A100, H100, 2x RTX 3090/4090), BF16 (~71 GB; A100/H100 de 80 GB, DGX Spark de 128 GB, MI300X).
- Despliegue: exclusivamente via vLLM con el plugin `pb27_vllm` (pip desde GitHub o incluido en el propio checkpoint); comandos de ejemplo con `vllm serve --max-model-len 1048576 --enforce-eager --kv-cache-memory-bytes 6G`. No compatible con llama.cpp, Ollama o TGI segun la informacion disponible.
- Requisitos adicionales: `VLLM_ALLOW_LONG_MAX_MODEL_LEN=1`, desactivacion de prefix caching, y memoria NVMe/page cache para el tier de memoria exacta en contextos muy largos.
- Latencia y throughput estimados: no disponibles en cifras concretas; el autor afirma decode de coste constante O(1) respecto a la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| PseudoBrain-Qwen3-32B-NVFP4 | 33,6B (denso) | 1.048.576 | Hibrida SWA + GDN + memoria dispersa | Apache 2.0 | Requiere plugin vLLM propio; ~22,8 GB VRAM a 1M tokens |
| Qwen/Qwen3-32B (base) | 32,8B (denso) | 32.768 (ampliable con YaRN) | Transformer denso | Apache 2.0 | Caché KV crece linealmente; 1M tokens inviable en una GPU de 24 GB |
| Qwen/Qwen3-30B-A3B | 30,5B totales / 3,3B activos | 32.768 | MoE hibrido (con capas Gated DeltaNet en Qwen3-Next) | Apache 2.0 | Inferencia mas barata por token activo, pero contexto estandar mucho menor |

La alternativa mas directa para contexto ultra largo con memoria constante serian arquitecturas hibridas tipo Qwen3-Next o modelos SSM puros (Mamba), aunque en la informacion proporcionada no hay datos suficientes para una comparativa detallada de rendimiento.

## Limitaciones y advertencias

- Verificacion limitada: las cifras de reduccion de memoria (98,4%) y de VRAM son afirmaciones del autor; no hay benchmarks independientes ni resultados academicos revisados por pares en la informacion disponible.
- Riesgo de alucinacion: inherente a Qwen3-32B; ademas, la recuperacion dispersa de memoria (top-k de paginas) puede omitir informacion relevante en contextos de 1M tokens, degradando la fidelidad de citacion exacta.
- Dependencia de software: el modelo no funciona en runtimes estandar (llama.cpp, Ollama, TGI); requiere vLLM con el plugin `pb27_vllm`, un proyecto de un unico autor, lo que supone riesgo de mantenimiento y compatibilidad con futuras versiones de vLLM.
- Cuantizacion agresiva: NVFP4/W4A16 a 4 bits puede degradar la calidad respecto a BF16; el propio autor publica ediciones en FP8 y BF16 para cargas criticas.
- Idiomas: no especificados en la ficha; hereda el perfil multilingue de Qwen3-32B pero sin confirmacion para esta variante.
- Sesgos conocidos: no disponibles; se heredan los del modelo base Qwen3-32B, no documentados en esta model card.
- Licencia: Apache 2.0, sin restricciones para uso comercial, pero el modelo derivado depende de Qwen3-32B, cuya licencia es igualmente permisiva.
- Operacion: requiere `--enforce-eager` y desactivar prefix caching, lo que puede penalizar el throughput en servidores multi-usuario; el tier NVMe de memoria introduce posibles latencias de E/S en contextos extremos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/defnoteatin/PseudoBrain-Qwen3-32B-NVFP4
- Repositorio GitHub y plugin vLLM: https://github.com/defnotean/pseudobrain
- Paper de arquitectura (PDF): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.pdf
- Paper de arquitectura (Markdown): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.md
- Informes de benchmarks del autor: https://github.com/defnotean/pseudobrain/tree/main/reports
- Modelo base: https://huggingface.co/Qwen/Qwen3-32B
- Perfil de GitHub del autor: https://github.com/defnotean
