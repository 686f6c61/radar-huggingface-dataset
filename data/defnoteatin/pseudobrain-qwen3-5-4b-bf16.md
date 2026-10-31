# defnoteatin/PseudoBrain-Qwen3.5-4B-BF16

## Resumen

PseudoBrain-Qwen3.5-4B-BF16 es una re-arquitectura del modelo Qwen3.5-4B de Qwen, publicada por el desarrollador independiente defnoteatin (Ian Kurt Galeon), orientada a resolver el problema del coste de memoria del contexto largo en la inferencia. Mientras que un transformer estándar mantiene una caché KV que crece linealmente con la longitud del contexto, este modelo combina atención con ventana deslizante y capas recurrentes Gated DeltaNet (GDN) de estado constante O(1), además de un sistema de memoria exacta por páginas ("Quest Exact Memory") respaldado en NVMe/page-cache. El resultado anunciado por el autor es la capacidad de servir contextos de hasta 1.048.576 tokens dentro de unos 10 GB de VRAM en la edición BF16.

El modelo se distribuye como `PB27ForConditionalGeneration` en safetensors, con licencia Apache 2.0, y requiere un plugin propio para vLLM (`pb27_vllm`) que registra la arquitectura y habilita un servidor compatible con la API de OpenAI. Existen ediciones alternativas en W4A16, FP8 y NVFP4 para GPU con menos memoria. Su relevancia actual radica en la tendencia hacia modelos híbridos transformer/recurrencia lineal para contextos extremos en hardware de consumo y edge, un espacio dominado hasta ahora por modelos mucho mayores.

Con 4.996.983.808 parámetros (dato real de los safetensors), 32 capas de las cuales 24 son Gated DeltaNet y 8 de atención completa, es un modelo compacto pensado para cargas de conversación y generación de texto con documentos muy extensos. El modelo base procede de Qwen/Qwen3.5-4B y sus derivadas cuantizadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: 24 capas Gated DeltaNet + 8 capas de atencion completa (16K SWA + Parallel Gated DeltaNet + Quest Exact Memory), clase `PB27ForConditionalGeneration` |
| Parametros totales | 4.996.983.808 (~5.000 millones) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | BF16 (esta edicion); existen ediciones W4A16, FP8 y NVFP4 en otros repositorios del autor |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repo: 10,0 GB) |

## Arquitectura y entrenamiento

La arquitectura PseudoBrain sustituye la atencion global densa por un esquema hibrido: 24 de las 32 capas son Gated DeltaNet, un mecanismo recurrente lineal cuyo estado tiene tamano fijo O(1) independientemente de la longitud del contexto. Las 8 capas restantes (indices 3, 7, 11, 15, 19, 23, 27 y 31) combinan atencion con ventana deslizante de 16.384 tokens, Parallel Gated DeltaNet y un mecanismo de "Quest Exact Memory" de tres niveles (NVMe/page-cache) en el que las consultas atienden sobre 4 sinks de StreamingLLM, landmarks de super-bloques, las paginas top-k de memoria exacta y la ventana deslizante, fusionadas mediante FlashAttention-2 con LSE-merge. Sobre esto se aplica un RoPE por bloques estrictamente no solapado y proporcional, que segun el autor mantiene la fidelidad de distancia temporal al 99% con 1M de tokens sin degradacion estatica tipo YaRN.

El decodificado es de coste constante O(1) por token, con un presupuesto de recuperacion desacoplado entre prefill y decode, lo que reduce la memoria de la cache KV en contextos de 1M tokens un 99,2% segun las cifras del autor (de 24,0 GB a unos 192 MiB de ventana activa con un pool de ~1,0 GB). No hay informacion publicada sobre datos de entrenamiento, numero de tokens de entrenamiento, ni procesos de RLHF/DPO: el modelo deriva de Qwen/Qwen3.5-4B y sus versiones cuantizadas (AWQ 4-bit, FP8, NVFP4), pero la model card no documenta el procedimiento de conversion o re-entrenamiento.

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`).
- Contexto extremo de hasta 1.048.576 tokens con memoria de cache KV practicamente constante.
- Modo de razonamiento compatible con el parser `qwen3` de vLLM (segun el comando de lanzamiento del autor).
- Tool calling / function calling: el comando de ejemplo del autor activa `--enable-auto-tool-choice` con `--tool-call-parser qwen3_coder`.
- Despliegue como servidor compatible con la API de OpenAI mediante vLLM (V1 y V2, con fallback `ForwardContext` sin hooks).
- Compatibilidad con NVIDIA CUDA y AMD ROCm a traves del plugin `pb27_vllm`.
- No hay informacion sobre capacidades de vision, audio o rendimiento multilingue especifico.

## Casos de uso

- Analisis de repositorios de codigo completos: con 1M de tokens de contexto puede ingerir bases de codigo enteras y responder preguntas o generar cambios sobre multiples ficheros sin fragmentacion, aprovechando la ventana activa de memoria exacta.
- Procesamiento de documentos legales o cientificos de gran volumen: contratos, expedientes o articulos que exceden las ventanas de 128K de modelos convencionales pueden procesarse de una sola pasada en una GPU portatil.
- Chatbots con historial de largo plazo: el estado O(1) del GDN permite mantener conversaciones de cientos de miles de tokens sin que el coste de memoria crezca con cada turno.
- Asistentes RAG de segunda etapa: en lugar de recuperar fragmentos, se puede cargar un corpus completo como contexto y dejar que el mecanismo Quest seleccione las paginas relevantes por consulta.
- Despliegue edge y on-premise: la edicion BF16 cabe en GPUs de 12 GB (RTX 3060 12GB, 4070), y las ediciones W4A16/NVFP4 en portatiles de 6-8 GB, lo que lo hace apto para entornos sin nube con requisitos de privacidad.
- Agentes de multiples pasos: el autor describe barridos de decode sobre cientos de bloques distintos en contextos de 1M ("novelty-rotating sweeps"), util para tareas agenticas que deben revisar gran cantidad de estado acumulado.
- Resumen de transcripciones largas (reuniones, podcasts, logs): el prefill con presupuesto de recuperacion escalado permite indexar el contexto completo y decodificar a coste constante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card referencia "benchmark receipts" en el directorio `reports/` del repositorio de GitHub del autor, pero no incluye cifras concretas en el propio README.

## Requisitos de hardware

- VRAM estimada para esta edicion BF16: ~8,5 GB de pesos y ~10,0 GB totales con contexto de 1.000.000 de tokens, segun la model card.
- GPUs recomendadas por el autor: RTX 3060 12GB, RTX 4070, RTX 3090, RTX 4090 y AMD RX 7700 XT o superior.
- Cabe en GPU de consumo: si, en GPUs de 12 GB o mas (edicion BF16). Las ediciones W4A16 y NVFP4 (~3,8 GB totales) caben en portatiles de 6-8 GB (RTX 3050/3060/4060, RX 6600/7600); la edicion FP8 (~6,0 GB) en GPUs de 8 GB o mas.
- Despliegue: vLLM con el plugin `pb27_vllm` (instalable desde el subdirectorio `serving/pb27_vllm` del repositorio de GitHub o desde el directorio `pb27_vllm_plugin/` incluido en el checkpoint). Se recomienda `--enforce-eager` y `--no-enable-prefix-caching` segun el ejemplo del autor. No se menciona soporte nativo de llama.cpp, Ollama o TGI.
- Variables de configuracion relevantes: `PB27_MEMORY_SUPERBLOCK=64`, `PB27_MEMORY_DECODE_STRIDE=64`, `PB27_MEMORY_DECODE_BLOCKS=64`, `PB27_MEMORY_GLOBAL_AGG="auto"`.
- Latencia y throughput: no disponibles como cifras concretas; el autor afirma decode de velocidad constante O(1) con independencia de la longitud del contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PseudoBrain-Qwen3.5-4B-BF16 | ~5.000 M | 1.048.576 | Hibrida GDN + SWA + Quest Memory | Apache 2.0 | HuggingFace, plugin vLLM propio |
| Qwen3.5-4B (base) | ~4.000 M | no disponible | Transformer (segun base oficial) | no disponible | HuggingFace (Qwen/Qwen3.5-4B) |
| Modelos hibridos GDN comparables de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

Nota: no constan alternativas directas publicas de ~4-5B con 1M de contexto y cache KV constante en la informacion proporcionada, por lo que la comparativa se limita al modelo base del que deriva.

## Limitaciones y advertencias

- Requiere un plugin de vLLM especifico (`pb27_vllm`): no funciona con runtimes estandar (llama.cpp, Ollama, TGI) ni con versiones de vLLM sin el plugin, lo que anade dependencia de un proyecto de un unico desarrollador.
- Las cifras de reduccion de memoria (99,2%), fidelidad RoPE (99%+) y VRAM provienen de la model card del autor y no han sido verificadas de forma independiente.
- No se documentan datos de entrenamiento, ni evaluaciones estandarizadas, ni comparaciones de calidad con el Qwen3.5-4B original: la calidad de generacion tras la re-arquitectura no esta acreditada.
- Idiomas soportados: no disponibles; al derivar de Qwen3.5-4B es razonable asumir herencia multilingue, pero no esta confirmado.
- Riesgo de alucinacion inherente a modelos de lenguaje de ~5B, agravado por la ausencia de benchmarks de fidelidad en contextos de 1M.
- El mecanismo de memoria exacta selecciona paginas de forma dispersa: la recuperacion de detalles muy concretos en contextos extremos puede ser imperfecta y depende de los parametros de configuracion.
- Licencia Apache 2.0: sin restricciones de uso comercial relevantes, aunque conviene verificar la licencia del modelo base Qwen3.5-4B para usos derivados.
- Proyecto reciente (creado en octubre de 2026) con pocas descargas (674) y sin comunidad consolidada: mayor riesgo de bugs y de abandono del mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/defnoteatin/PseudoBrain-Qwen3.5-4B-BF16
- Repositorio GitHub y plugin `pb27_vllm`: https://github.com/defnotean/pseudobrain
- Paper de arquitectura (PDF): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.pdf
- Paper de arquitectura (Markdown): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.md
- Benchmark receipts: https://github.com/defnotean/pseudobrain/tree/main/reports
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Ediciones alternativas: https://huggingface.co/defnoteatin/PseudoBrain-Qwen3.5-4B-FP8 y https://huggingface.co/defnoteatin/PseudoBrain-Qwen3.5-4B-NVFP4
- Perfil de GitHub del autor: https://github.com/defnotean
