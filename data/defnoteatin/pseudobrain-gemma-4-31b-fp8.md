# defnoteatin/PseudoBrain-Gemma-4-31B-FP8

## Resumen

PseudoBrain-Gemma-4-31B-FP8 es una modificación arquitectónica del modelo Gemma 4 31B instruct de Google, desarrollada por Ian Kurt Galeon (defnoteatin) y publicada bajo la licencia Gemma. El objetivo declarado es resolver el cuello de botella de memoria y cómputo en inferencia de contexto largo: en un transformer estándar la caché KV crece de forma lineal con la longitud de contexto y el prefill de forma cuadrática, lo que provoca OOM en ventanas de 128K a 1M de tokens incluso cuando los pesos del modelo caben holgadamente en la GPU.

La propuesta combina atención de ventana deslizante (SWA) de 16K en las capas globales del modelo base, una Gated DeltaNet paralela con estado recurrente de tamaño fijo O(1), y un mecanismo de memoria exacta por bloques denominado Quest, con agregación global de landmarks. Según la model card, esto reduce la caché KV a 1M de tokens un 92,2 % (de unos 45,0 GB a unos 3,5 GB) y permite decodificación a velocidad constante independiente de la longitud de contexto.

El modelo es multimodal (image-text-to-text), denso, con 31.825.558.956 parámetros reales según los safetensors, cuantizado en FP8 mediante compressed-tensors y empaquetado para su uso con vLLM a través de un plugin específico (`pb27_vllm`). Está pensado para despliegues on-premise de contexto muy largo en GPUs de 48 GB o superiores.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 50 capas SWA nativas + 10 capas globales convertidas a SWA 16K + Gated DeltaNet paralela + Quest Exact Memory (PseudoBrain) |
| Parámetros totales | 31.825.558.956 |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | hasta 1.048.576 tokens (1M), con `VLLM_ALLOW_LONG_MAX_MODEL_LEN=1` |
| Tipos de cuantización | FP8 (este repo, compressed-tensors); W4A16, NVFP4 y BF16 en repos hermanos |
| Idiomas soportados | no disponible |
| Licencia | Gemma |
| Formato de pesos | safetensors (compressed-tensors), librería vLLM |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-31B-it` y de la cuantización `RedHatAI/gemma-4-31B-it-FP8-dynamic`. La modificación PseudoBrain afecta a las 10 capas de atención global (índices 5, 11, 17, …, 59), con `head_dim=512`, que se convierten en SWA de 16K combinada con una Gated DeltaNet paralela cuyo estado recurrente es de tamaño fijo, independiente de la longitud de contexto. Sobre esas capas de anclaje dispersas se aplica Quest Exact Memory en tres niveles: 4 sinks estilo StreamingLLM, landmarks de super-bloque, top-k de páginas de memoria exacta y una ventana deslizante de 16.384 tokens, fusionados mediante FlashAttention-2 con combinación de LSE. La memoria de super-bloque se almacena en bf16 con `PB27_MEMORY_SUPERBLOCK=64`.

El autor describe además un esquema de RoPE por bloques, proporcional y estrictamente no solapado (`_reposition_rope_blocks`), que asigna un pie de 64 tokens por bloque recuperado y escala los huecos históricos de forma proporcional para preservar la continuidad local y evitar solapamiento de fase entre bloques no adyacentes, manteniendo según la model card más del 99 % de fidelidad de distancia macro en 1M de tokens sin degradación estática tipo YaRN. La agregación global se activa automáticamente (`PB27_MEMORY_GLOBAL_AGG="auto"`) con landmarks de resumen residentes en HBM (un token de resumen por cada 4.096 tokens), cobertura estratificada de la línea temporal y barridos de working-set con rotación por novedad. El presupuesto de recuperación en prefill se desacopla del de decodificación (`PB27_MEMORY_DECODE_STRIDE=64`, `PB27_MEMORY_DECODE_BLOCKS=64`).

No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO adicionales sobre el modelo base. La model card no documenta un proceso de entrenamiento propio más allá de la conversión arquitectónica y la cuantización.

## Capacidades

- Generación de texto conversacional e instructiva, heredada de Gemma 4 31B instruct.
- Procesamiento multimodal image-text-to-text (pipeline declarado en HuggingFace).
- Razonamiento multi-paso sobre contextos de hasta 1M de tokens, con barridos de working-set que rotan entre cientos de bloques distintos.
- Recuperación de información en contexto largo mediante memoria exacta por páginas y landmarks de super-bloque.
- Decodificación a velocidad constante independiente de la longitud de contexto, según el autor.
- Compatibilidad con el servidor OpenAI-compatible de vLLM (endpoint de chat completions).
- Soporte de doble runner vLLM V1/V2 y fallback `ForwardContext` sin hooks.
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni modo thinking; estas capacidades dependerían del modelo base Gemma 4 31B-it, no verificadas aquí.

## Casos de uso

- Análisis de repositorios completos: ingesta de bases de código de cientos de miles de tokens en una sola ventana para responder preguntas transversales sobre arquitectura, dependencias y deuda técnica, aprovechando la ventana de 1M y la memoria KV reducida a unos 3,5 GB.
- Revisión documental legal o regulatoria: carga de expedientes completos (contratos, anexos, correspondencia) y consultas multi-turno con referencias cruzadas, sin truncar el material por límites de contexto.
- Agentes de investigación sobre corpus extensos: barridos iterativos sobre cientos de bloques distintos gracias a la rotación por novedad del working-set, adecuado para tareas de síntesis que requieren cubrir toda la línea temporal del documento.
- Asistencia multimodal sobre documentos escaneados: al ser image-text-to-text, puede procesar páginas de PDF como imágenes junto con texto extraído en una misma ventana de contexto largo.
- Despliegue on-premise con requisitos de soberanía de datos: al ejecutarse con vLLM sobre una L40S de 48 GB o una A100/H100, encaja en infraestructura propia sin depender de APIs externas, con licencia Gemma que permite uso comercial bajo sus términos.
- Monitorización de logs y trazas de sistemas: análisis de secuencias muy largas de eventos con decodificación a velocidad constante, útil para detección de anomalías que requieren comparar eventos distantes en el tiempo.
- Evaluación comparativa de estrategias de atención larga: como implementación de referencia de SWA + Gated DeltaNet + Quest, sirve para experimentar con recuperación dispersa en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona un directorio `reports/` con "benchmark receipts" en el repositorio de GitHub, pero no se incluyen cifras de MMLU, HumanEval, GSM8K ni métricas equivalentes en los datos proporcionados. Las únicas cifras de rendimiento declaradas son de memoria: reducción del 92,2 % de la caché KV a 1M de tokens (de aproximadamente 45,0 GB a 3,5 GB) y estado recurrente GDN de tamaño O(1).

## Requisitos de hardware

- Pesos FP8: aproximadamente 32,5 GB; VRAM total estimada a 1M de tokens: aproximadamente 36,5 GB según el autor.
- GPUs objetivo para esta edición FP8: NVIDIA L40S (48 GB), A100, H100, DGX Spark, AMD MI300X, o 2× RTX 3090/4090.
- No cabe en GPUs de consumo de 24 GB en esta edición FP8; para ello el autor ofrece las variantes W4A16 y NVFP4 con aproximadamente 17,5 GB de pesos y 21,5 GB totales a 1M de tokens, aptas para RTX 3090, 4090, RX 7900 XTX y RTX 5090.
- Despliegue: exclusivamente vLLM con el plugin `pb27_vllm` (instalable vía pip desde el subdirectorio `serving/pb27_vllm` del repositorio de GitHub, o desde el snapshot local incluido en el checkpoint). No se documenta soporte para llama.cpp, Ollama ni TGI.
- Flags de arranque relevantes: `--max-model-len 1048576`, `--enforce-eager`, `--no-enable-prefix-caching`, `--kv-cache-memory-bytes 6G`, `--max-num-seqs 16`, y la variable `VLLM_ALLOW_LONG_MAX_MODEL_LEN=1`.
- Latencia y throughput: el autor afirma decodificación a velocidad constante independiente de la longitud de contexto, pero no se proporcionan valores numéricos de tokens por segundo en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PseudoBrain-Gemma-4-31B-FP8 | 31,8B densos | 1M (con plugin) | FP8, W4A16, NVFP4, BF16 | Gemma | HuggingFace + plugin vLLM |
| google/gemma-4-31B-it (base) | 31B densos | no disponible | BF16 y derivadas de terceros | Gemma | HuggingFace |
| RedHatAI/gemma-4-31B-it-FP8-dynamic | 31B densos | no disponible | FP8 dinámico | Gemma | HuggingFace |
| cyankiwi/gemma-4-31B-it-AWQ-4bit | 31B densos | no disponible | AWQ 4 bits | Gemma | HuggingFace |

La comparación relevante es frente al propio modelo base: PseudoBrain mantiene los pesos de Gemma 4 31B-it pero sustituye el mecanismo de atención en las capas globales para acotar la memoria KV. No se dispone de datos de rendimiento comparativo en benchmarks de calidad, por lo que no es posible cuantificar la posible degradación frente a la versión original de Google.

## Limitaciones y advertencias

- La model card no reporta métricas de calidad (MMLU, HumanEval, GSM8K) que permitan verificar que la conversión arquitectónica preserva el rendimiento del modelo base; la modificación de las 10 capas globales y el esquema RoPE por bloques son cambios sustanciales no validados de forma independiente en la información disponible.
- El repositorio tiene 27 descargas y 0 likes en el momento de la consulta, lo que indica una adopción muy limitada y ausencia de validación por parte de la comunidad.
- El despliegue depende de un plugin de vLLM mantenido por un único autor (`pb27_vllm`), con riesgo de incompatibilidad ante actualizaciones de vLLM; la propia model card menciona soporte dual V1/V2 y un fallback, lo que sugiere fragilidad ante cambios de versión.
- Requiere `--enforce-eager` y desactiva prefix caching, lo que penaliza el throughput en cargas con prompts repetidos.
- La licencia Gemma impone sus términos de uso, incluida la política de uso aceptable de Google; es responsabilidad del desplegador verificar el cumplimiento para uso comercial.
- No se documentan los idiomas soportados; las capacidades multilingües dependerían del modelo base y no están verificadas.
- Riesgo de alucinación inherente a los modelos de lenguaje, potencialmente amplificado en contextos de 1M de tokens donde la recuperación es dispersa y aproximada (top-k de páginas Quest), no exhaustiva.
- Los sesgos del modelo base Gemma 4 no se documentan ni se mitigan específicamente en esta conversión.
- No hay información sobre tool calling, function calling ni modo thinking; no deben asumirse en producción sin verificación empírica.
- El tamaño del repo (34,4 GB) y la necesidad de descargar el plugin desde GitHub añaden complejidad operativa frente a un checkpoint estándar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/defnoteatin/PseudoBrain-Gemma-4-31B-FP8
- Repositorio GitHub del proyecto y plugin vLLM: https://github.com/defnotean/pseudobrain
- Paper de arquitectura (PDF): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.pdf
- Paper de arquitectura (Markdown): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.md
- Informes de benchmarks del autor: https://github.com/defnotean/pseudobrain/tree/main/reports
- Perfil del autor en GitHub: https://github.com/defnotean
- Perfil del autor en HuggingFace: https://huggingface.co/defnoteatin
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Cuantización FP8 de referencia: https://huggingface.co/RedHatAI/gemma-4-31B-it-FP8-dynamic
- Cuantización AWQ 4 bits: https://huggingface.co/cyankiwi/gemma-4-31B-it-AWQ-4bit
- Cuantización NVFP4: https://huggingface.co/RedHatAI/gemma-4-31B-it-NVFP4
