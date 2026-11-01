# defnoteatin/PseudoBrain-Qwen3.5-9B-FP8

## Resumen

PseudoBrain-Qwen3.5-9B-FP8 es una variante reempaquetada del modelo denso Qwen3.5-9B (9.409.813.744 parámetros) publicada por el desarrollador independiente Ian Kurt Galeon (defnoteatin) bajo licencia Apache 2.0. El autor aplica sobre los pesos del modelo base una arquitectura propia denominada PseudoBrain (clase `PB27ForConditionalGeneration`), orientada a servir contextos de hasta 1.048.576 tokens con un consumo de memoria KV prácticamente constante. El checkpoint se distribuye en formato FP8 con safetensors y está pensado para ejecutarse con vLLM mediante un plugin externo (`pb27_vllm`).

El problema que aborda es el coste cuadrático en memoria y cómputo de la atención estándar en contextos largos: en un transformer convencional la caché KV crece de forma lineal con la longitud y el prefill de forma cuadrática, lo que provoca OOM incluso cuando los pesos caben holgadamente en la GPU. La propuesta combina capas de atención completa con capas Gated DeltaNet de estado recurrente fijo, atención ventaneada y un mecanismo de memoria exacta por páginas con recuperación dispersa, de modo que el estado recurrente no crece con el contexto.

El modelo es relevante por su enfoque de ingeniería de inferencia más que por una mejora de capacidades cognitivas: según la model card, reduce la caché KV a 1M de tokens en torno a un 99,2 % (de 32,0 GB a unos 256 MiB de ventana activa, con un pool de aproximadamente 1,0 GB) y permite servir el contexto completo en GPUs de consumo de 12-16 GB en esta edición FP8. Es un proyecto de autor único, con 32 descargas y 0 likes en el momento de la consulta, por lo que debe evaluarse con cautela en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 32 capas (24 Gated DeltaNet nativas + 8 capas de atención completa en los índices [3, 7, 11, 15, 19, 23, 27, 31] convertidas a SWA de 16K + Gated DeltaNet paralelo + Quest Exact Memory); clase `PB27ForConditionalGeneration` |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | Hasta 1.048.576 tokens (1M), con `--max-model-len 1048576` y `VLLM_ALLOW_LONG_MAX_MODEL_LEN=1` |
| Tipos de cuantizacion | FP8 (esta edición); el autor publica además ediciones W4A16, NVFP4 y BF16 en repositorios separados |
| Idiomas soportados | No disponible (la model card no declara lista de idiomas; hereda los del modelo base Qwen3.5-9B) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (compressed-tensors, FP8), librería vLLM |

## Arquitectura y entrenamiento

La arquitectura PseudoBrain sustituye parte de la atención estándar por capas Gated DeltaNet (GDN) con estado recurrente de tamaño fijo O(1), independiente de si el contexto es de 4K o de 1M tokens. Las 8 capas de atención completa se reconvierten en atención ventaneada de 16.384 tokens combinada con GDN paralelo y un mecanismo de memoria exacta denominado Quest, que atiende sobre cuatro componentes: 4 sinks de StreamingLLM, landmarks de superbloques, las k páginas de memoria exacta más relevantes y la ventana deslizante de 16.384 tokens, todo fusionado mediante FlashAttention-2 con LSE-merge y cotas jerárquicas de superbloques en bf16 (`PB27_MEMORY_SUPERBLOCK=64`).

El sistema incorpora además un esquema de RoPE por bloques proporcional y estrictamente no solapado (`_reposition_rope_blocks`), que asigna un pie de 64 tokens por bloque recuperado y escala los huecos históricos de forma proporcional para preservar la continuidad local (+1) y evitar el solapamiento de fase entre bloques no adyacentes; el autor afirma mantener más del 99 % de fidelidad en la distancia macro de la línea temporal a 1M de tokens sin degradación estática tipo YaRN. La agregación global densa (`PB27_MEMORY_GLOBAL_AGG="auto"`) detecta consultas globales de alta participación y activa landmarks residentes de superbloque (1 token de resumen por cada 4.096 tokens en HBM), cobertura estratificada de la línea temporal y barridos de working-set con rotación por novedad. El decode separa el presupuesto de recuperación del prefill del presupuesto constante de decode (`PB27_MEMORY_DECODE_STRIDE=64`, `PB27_MEMORY_DECODE_BLOCKS=64`).

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en esta variante: la model card describe un trabajo de modificación arquitectónica y de servicio sobre los pesos de Qwen3.5-9B, no un reentrenamiento documentado. La innovación técnica declarada es, por tanto, de inferencia (gestión de memoria, RoPE por bloques, plugin para vLLM V1/V2 con fallback `ForwardContext` sin hooks).

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen3.5-9B.
- Procesamiento de contextos extremadamente largos: hasta 1.048.576 tokens con memoria KV acotada.
- Razonamiento multi-paso sobre documentos extensos, con barridos de working-set que recorren cientos de bloques distintos a lo largo de 1M de tokens.
- Soporte de tool calling y function calling a través de vLLM (`--enable-auto-tool-choice --tool-call-parser qwen3_coder`).
- Parseo de razonamiento con `--reasoning-parser qwen3`, lo que sugiere compatibilidad con el modo de pensamiento de la familia Qwen3.
- Capacidades multilingües: no declaradas explícitamente en la model card; se asumen las del modelo base.
- Visión y audio: no disponibles en la información proporcionada.
- Servicio compatible con la API OpenAI mediante vLLM, con soporte de los runners V1 y V2.

## Casos de uso

- Análisis de repositorios completos: el modelo puede recibir un árbol de código de cientos de miles de tokens en una sola pasada y responder preguntas de arquitectura o dependencias, aprovechando que la ventana de 1M evita trocear el repositorio y perder contexto entre fragmentos.
- Procesamiento de expedientes legales o contractuales: ingesta de contratos, anexos y correspondencia acumulada hasta 1M de tokens para extracción de cláusulas y detección de contradicciones, con la ventaja de que la caché KV no crece de forma lineal y el coste de memoria se mantiene estable.
- Atención al cliente con historial prolongado: conversaciones multi-turno de larga duración donde el estado recurrente GDN de tamaño fijo evita el crecimiento de memoria por sesión, lo que permite mantener más sesiones concurrentes en la misma GPU.
- Resumen y auditoría de logs o trazas: consolidación de trazas de sistemas distribuidas de gran volumen en un único contexto para correlacionar incidentes, usando la agregación global de landmarks para obtener una vista macro de la línea temporal.
- Despliegue on-premise con GPU de consumo: servir un asistente de contexto largo en una RTX 4080/4090 o RTX 5090 (12-16 GB) con esta edición FP8, o en una RTX 3060/4060/4070 con la edición W4A16, sin necesidad de infraestructura de centro de datos.
- Agentes con memoria de trabajo extensa: pipelines de razonamiento multi-paso que acumulan observaciones de herramientas y resultados intermedios, apoyados en el tool calling de vLLM y en el presupuesto de decode constante.
- Investigación sobre inferencia de contexto largo: banco de pruebas para comparar mecanismos de memoria dispersa (Quest, StreamingLLM sinks, RoPE por bloques) frente a atención completa, dado que el autor publica los informes de benchmark en el repositorio de GitHub.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a los informes del directorio `reports/` del repositorio de GitHub, pero no incluye cifras de MMLU, HumanEval, GSM8K ni de tareas de contexto largo en el texto proporcionado. Tampoco se detallan métricas de latencia o throughput medidas.

Los únicos datos cuantitativos disponibles son de memoria: reducción del 99,2 % de la caché KV a 1M de tokens (de 32,0 GB a aproximadamente 256 MiB de ventana activa, con un pool de aproximadamente 1,0 GB), y las estimaciones de VRAM total por edición recogidas en la tabla siguiente.

| Edición | Precisión | Pesos | VRAM total a 1M tokens | GPUs objetivo |
|---|---|---|---|---|
| W4A16 | W4A16 | ~5,5 GB | ~6,5 GB | RTX 3060 / 4060 / 4070 / 3090 / 4090, AMD RX 7600 / 7900 XTX |
| FP8 (este repo) | FP8 | ~9,5 GB | ~11,0 GB | RTX 4070 Ti / 4080 / 4090 / 5090, AMD MI300X |
| NVFP4 | NVFP4 | ~5,5 GB | ~6,5 GB | NVIDIA Blackwell (RTX 5060 / 5070 / 5080 / 5090, DGX Spark GB10) |
| BF16 | BF16 | ~18,0 GB | ~20,0 GB | RTX 3090 / 4090, AMD RX 7900 XTX (24 GB) |

## Requisitos de hardware

- VRAM estimada: aproximadamente 9,5 GB de pesos y unos 11,0 GB totales a 1M de tokens en esta edición FP8, según la model card.
- GPU recomendadas para FP8: RTX 4070 Ti, RTX 4080, RTX 4090, RTX 5090 y AMD MI300X (rango de 12-16 GB en adelante).
- GPU de consumo: sí cabe en tarjetas de 12-16 GB en FP8; para equipos de 8-12 GB el autor ofrece la edición W4A16 (~6,5 GB totales) y la NVFP4 para Blackwell.
- Despliegue: exclusivamente vLLM con el plugin `pb27_vllm` (instalación vía `pip install --no-deps "git+https://github.com/defnotean/pseudobrain.git#subdirectory=serving/pb27_vllm"`), con soporte de CUDA y ROCm. No se mencionan llama.cpp, Ollama ni TGI.
- Configuración de servicio sugerida: `--max-model-len 1048576 --enforce-eager --no-enable-prefix-caching --kv-cache-memory-bytes 6G --max-num-seqs 16`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| PseudoBrain-Qwen3.5-9B-FP8 | 9,41 B (denso) | 1.048.576 | Apache 2.0 | Hugging Face, vLLM + plugin `pb27_vllm` | Requiere plugin externo; 32 descargas |
| Qwen/Qwen3.5-9B (base) | 9 B (denso) | No disponible en la información | No disponible en la información | Hugging Face | Modelo de partida; sin la modificación de memoria |
| RedHatAI/Qwen3.5-9B-FP8-dynamic | 9 B (denso) | No disponible en la información | No disponible en la información | Hugging Face | Cuantización FP8 dinámica del mismo base, sin PseudoBrain |
| cyankiwi/Qwen3.5-9B-AWQ-4bit | 9 B (denso) | No disponible en la información | No disponible en la información | Hugging Face | Cuantización AWQ de 4 bits, orientada a menor VRAM |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada, por lo que la comparación se limita a parámetros, formato y requisitos de despliegue.

## Limitaciones y advertencias

- Proyecto de autor único con adopción muy baja (32 descargas, 0 likes en la fecha de consulta): no hay validación independiente de las afirmaciones de rendimiento ni de la fidelidad a 1M de tokens.
- Dependencia de un plugin externo no estándar (`pb27_vllm`): la compatibilidad con futuras versiones de vLLM depende del mantenimiento del autor; la propia model card menciona soporte V1/V2 y un fallback para cambios de API.
- La configuración recomendada desactiva el prefix caching (`--no-enable-prefix-caching`) y fuerza modo eager (`--enforce-eager`), lo que reduce el rendimiento frente a un despliegue estándar de vLLM.
- La reducción de memoria se logra mediante atención dispersa y recuperación por páginas: existe riesgo de que la recuperación omita información relevante en tareas de recuperación exacta sobre contextos muy largos, aunque el autor declara alta fidelidad en la línea temporal macro.
- No hay información sobre sesgos, tasas de alucinación ni evaluación de seguridad; deben heredarse los del modelo base Qwen3.5-9B, no documentados aquí.
- Idiomas soportados no declarados: no se puede garantizar un comportamiento multilingüe concreto sin evaluarlo.
- Licencia Apache 2.0 permite uso comercial, pero al tratarse de una modificación arquitectónica sobre pesos de terceros conviene verificar los términos del modelo base Qwen3.5-9B antes de desplegar en producción.
- Las cifras de VRAM son estimaciones del autor, no medidas independientes; el consumo real depende de la longitud efectiva de contexto, el número de secuencias concurrentes y la versión de vLLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/defnoteatin/PseudoBrain-Qwen3.5-9B-FP8
- Repositorio GitHub del proyecto y plugin: https://github.com/defnotean/pseudobrain
- Paper de arquitectura (PDF): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.pdf
- Paper de arquitectura (Markdown): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.md
- Informes de benchmark: https://github.com/defnotean/pseudobrain/tree/main/reports
- Perfil del autor en GitHub: https://github.com/defnotean
- Perfil del autor en Hugging Face: https://huggingface.co/defnoteatin
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Variante FP8 dinámica: https://huggingface.co/RedHatAI/Qwen3.5-9B-FP8-dynamic
- Variante AWQ 4 bits: https://huggingface.co/cyankiwi/Qwen3.5-9B-AWQ-4bit
- Variante NVFP4: https://huggingface.co/ig1/Qwen3.5-9B-NVFP4
