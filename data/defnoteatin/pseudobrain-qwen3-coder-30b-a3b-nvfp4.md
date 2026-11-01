# defnoteatin/PseudoBrain-Qwen3-Coder-30B-A3B-NVFP4

## Resumen

PseudoBrain-Qwen3-Coder-30B-A3B-NVFP4 es una re-arquitectura del modelo Qwen3-Coder-30B-A3B-Instruct de Alibaba (Qwen), publicada por el desarrollador independiente Ian Kurt Galeon (usuario `defnoteatin` en Hugging Face). El modelo original es un MoE de 30.500 millones de parámetros totales con unos 3.300 millones activos por token, especializado en generación de código y tareas agénticas. La versión PseudoBrain convierte las 48 capas de atención completa en un esquema híbrido de atención ventana deslizante (16K) más Gated DeltaNet paralelo y una memoria dispersa jerárquica ("Quest Exact Memory"), con el objetivo de servir contextos de hasta 1.048.576 tokens reduciendo la memoria de la KV cache en un 98,4 % (de 192 GB a unos 3,1 GB según el autor).

La relevancia de este modelo está en la inferencia de contexto extremadamente largo en hardware de consumo: la edición NVFP4 (W4A16) pesa unos 16,5 GB y, según el autor, funciona con unos 20,5 GB de VRAM totales a 1M tokens, lo que lo hace viable en una única RTX 3090 o 4090 de 24 GB. Se distribuye bajo licencia Apache 2.0, requiere un plugin propio para vLLM (`pb27_vllm`) y su arquitectura se documenta en un paper técnico publicado por el autor en GitHub. Cabe señalar que se trata de un proyecto de un desarrollador individual, no de un lanzamiento corporativo, por lo que las cifras de rendimiento proceden de los propios informes del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PB27Qwen3MoeForCausalLM: MoE híbrido con atención ventana deslizante (16K) + Gated DeltaNet paralelo + Quest Exact Memory dispersa |
| Parametros totales | 15.583.623.168 en safetensors de esta cuantización (modelo base: 30.500 millones, 30.5B-A3.3B) |
| Parametros activos | ~3.300 millones por token (MoE) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | NVFP4 (W4A16); existen ediciones FP8, NVFP4 y BF16 del mismo proyecto |
| Idiomas soportados | no disponible (el modelo base Qwen3-Coder está orientado principalmente a inglés y código) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 18,6 GB), diseñado para vLLM con plugin `pb27_vllm` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-Coder-30B-A3B-Instruct, un transformer MoE de 48 capas, y aplica sobre él la arquitectura PseudoBrain sin reentrenar los pesos (es una modificación de inferencia). Los cambios principales son: (1) las 48 capas de atención completa se convierten en capas de atención ventana deslizante de 16K tokens combinadas con Gated DeltaNet paralelo, un estado recurrente de tamaño fijo O(1) independientemente del contexto; (2) en las capas ancla dispersas, las consultas atienden sobre 4 sinks de StreamingLLM, landmarks de super-bloques, páginas Top-k de Quest Exact Memory y la ventana de 16.384 tokens, fusionadas vía FlashAttention-2 LSE-merge con límites jerárquicos de dos niveles en bf16; (3) un RoPE por bloques estrictamente no solapado mantiene la fidelidad de distancia temporal proporcional a 1M tokens sin degradación estática tipo YaRN; (4) una agregación global densa con landmarks resumidos (1 token por cada 4.096 tokens en HBM) y barridos de decode con rotación por novedad permite razonamiento multi-paso sobre cientos de bloques distintos.

No hay entrenamiento adicional en la información disponible: el proyecto es una reingeniería de la fase de inferencia (plugin de vLLM V1/V2 con soporte dual de runners) sobre los pesos cuantizados del modelo base. La cuantización NVFP4 de esta edición procede de la variante NVFP4/Qwen3-Coder-30B-A3B-Instruct-FP4. El modelo base de Qwen fue entrenado sobre grandes corpus de código y texto con instrucción (el autor no detalla tokens ni datasets; no disponible en la información proporcionada).

## Capacidades

- Generación de código y finalización de repos: hereda las capacidades de Qwen3-Coder-30B-A3B-Instruct, especializado en programación.
- Razonamiento agéntico multi-paso: la memoria Quest con barridos rotatorios permite navegar contextos de cientos de miles de tokens durante el decode.
- Tool calling / function calling: soportado mediante `--enable-auto-tool-choice --tool-call-parser qwen3_coder` en vLLM, exponiendo una API compatible con OpenAI.
- Contexto ultra-largo con memoria constante: hasta 1.048.576 tokens con KV cache de ~3,1 GB (reducción del 98,4 % según el autor).
- Decodificación con coste O(1) constante: el presupuesto de retrieval en decode está desacoplado del prefill (stride de 64, 64 bloques).
- Generación de texto conversacional (pipeline text-generation), con formato de chat instruct del modelo base.
- Despliegue multiplataforma: plugin compatible con NVIDIA CUDA y AMD ROCm según el autor.

## Casos de uso

- Análisis de repositorios completos: con 1M tokens de contexto se puede cargar un monorepo entero (cientos de archivos) en una sola sesión para preguntas de arquitectura, refactors globales o detección de dependencias circulares.
- Revisión de código asistida en CI/CD: integrable vía API OpenAI-compatible en pipelines para revisar pull requests grandes comparando el diff con el contexto completo del proyecto.
- Asistentes de programación agénticos: con tool calling nativo (parser qwen3_coder) puede ejecutar herramientas de búsqueda, edición de archivos y terminal en bucles de agentes tipo SWE-agent.
- Migración de bases de código heredadas: el contexto de 1M tokens permite mantener el código legacy completo más documentación en memoria durante sesiones largas de traducción entre lenguajes.
- Chat sobre documentación extensísima: ingesta de manuales técnicos, especificaciones o logs de auditoría de gran volumen con coste de memoria constante, adecuado para despliegues on-premise en una sola GPU.
- Procesamiento de logs y trazas a gran escala: análisis de millones de tokens de logs de producción para diagnóstico de incidentes, aprovechando la fidelidad de distancia temporal del RoPE por bloques.
- Despliegue enterprise on-premise: el autor lo orienta explícitamente a despliegues de 1M de contexto en local, viable en hardware de 24 GB sin necesidad de clústeres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor publica "benchmark receipts" de memoria y latencia en el directorio `reports/` de su repositorio de GitHub (por ejemplo, la reducción del 98,4 % en KV cache y el coste O(1) del decode), pero no tablas comparativas con modelos de referencia. No disponible: puntuaciones verificadas de terceros.

## Requisitos de hardware

- VRAM estimada (edición NVFP4, W4A16): ~16,5 GB de pesos y ~20,5 GB totales a 1.000.000 de tokens según el autor; con `--kv-cache-memory-bytes 6G` el presupuesto de cache queda limitado a 6 GB.
- GPUs recomendadas por el autor: RTX 3090 / RTX 4090 (24 GB), AMD RX 7900 XTX (24 GB), RTX 5090 (32 GB), DGX Spark GB10 y B200 (la cuantización NVFP4 está orientada a hardware NVIDIA Blackwell).
- Cabe en GPU de consumo: sí, en una única RTX 3090 o 4090 de 24 GB según las cifras del autor; otras ediciones del proyecto requieren 35 GB (FP8) o 65 GB (BF16).
- Despliegue: vLLM (V1 y V2) con el plugin `pb27_vllm` instalable por pip desde GitHub; servidor compatible con la API de OpenAI. No se menciona soporte para llama.cpp, Ollama o TGI (no disponible).
- Latencia y throughput: no disponible en la información proporcionada más allá de la afirmación de decode de velocidad constante O(1); se recomienda `--enforce-eager` y desactivar prefix caching según el quickstart del autor.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| PseudoBrain-Qwen3-Coder-30B-A3B-NVFP4 | 30,5B / ~3,3B | 1.048.576 | MoE híbrido (SWA + Gated DeltaNet + Quest Memory) | Apache 2.0 | Requiere plugin propio de vLLM; cifras de rendimiento del autor |
| Qwen/Qwen3-Coder-30B-A3B-Instruct | 30,5B / ~3,3B | 256K (nativo) | Transformer MoE estándar | Apache 2.0 | Modelo base oficial de Qwen, ecosistema vLLM/SGLang estándar |
| Qwen/Qwen3-Coder-480B-A35B-Instruct | 480B / 35B | 256K | Transformer MoE estándar | Apache 2.0 | Modelo insignia de la familia, requiere multi-GPU |
| Kimi-Linear-48B-A3B (MoonshotAI) | ~48B / ~3B | hasta 1M | MoE híbrido con atención lineal (KDA) | Licencia propia modificada | Alternativa comercial de arquitectura híbrida similar |

## Limitaciones y advertencias

- Proyecto de un desarrollador individual: las cifras de reducción de KV cache (98,4 %) y VRAM (~20,5 GB a 1M tokens) proceden de los informes del autor y no están verificadas por terceros.
- La re-arquitectura de atención (conversión de atención completa a SWA + DeltaNet + memoria dispersa) puede degradar la calidad de generación respecto al modelo base Qwen3-Coder, especialmente en tareas que dependen de recuperación exacta a larga distancia; no hay benchmarks de calidad publicados.
- Requiere un plugin de vLLM específico (`pb27_vllm`) y flags no estándar (`VLLM_ALLOW_LONG_MAX_MODEL_LEN=1`, `--enforce-eager`, `--no-enable-prefix-caching`), lo que añade fragilidad ante actualizaciones de vLLM (el propio autor describe el plugin como "version-resilient", señal de este riesgo).
- La cuantización NVFP4 (W4A16) está orientada a hardware NVIDIA Blackwell; en GPUs anteriores puede no ser compatible o requerir la edición FP8/BF16 del proyecto.
- Sesgos y riesgo de alucinación: heredados del modelo base Qwen3-Coder; no disponibles evaluaciones específicas de sesgo.
- Idiomas soportados: no disponible en la ficha; el modelo base está centrado en inglés y código, por lo que el rendimiento en castellano no está garantizado.
- Licencia Apache 2.0 sin restricciones comerciales relevantes, aunque conviene revisar los términos de los modelos base derivados.
- Uso en producción: al no existir benchmarks independientes, se recomienda validación interna exhaustiva antes de desplegar en entornos críticos.

## Enlaces

- Ficha en Hugging Face: https://huggingface.co/defnoteatin/PseudoBrain-Qwen3-Coder-30B-A3B-NVFP4
- Repositorio GitHub y plugin vLLM: https://github.com/defnotean/pseudobrain
- Paper de arquitectura (PDF): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.pdf
- Paper de arquitectura (Markdown): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.md
- Informes de benchmarks del autor: https://github.com/defnotean/pseudobrain/tree/main/reports
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Perfil de GitHub del autor: https://github.com/defnotean
