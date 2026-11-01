# defnoteatin/PseudoBrain-Gemma-4-31B-W4A16

## Resumen

PseudoBrain-Gemma-4-31B-W4A16 es una variante cuantizada a W4A16 del modelo multimodal Gemma-4-31B-it de Google, reempaquetada por Ian Kurt Galeon (defnoteatin) con una arquitectura de servicio propia denominada PseudoBrain. El objetivo declarado no es mejorar la calidad del modelo base, sino resolver el coste de memoria de la caché KV en inferencia de contexto largo: sustituye las capas de atención global por ventanas deslizantes de 16K tokens combinadas con Gated DeltaNet paralelo y una memoria exacta Quest de tres niveles, de modo que el estado recurrente sea de tamano fijo independientemente de la longitud de contexto. El resultado que reivindica el autor es una reducción del 92,2% de la memoria KV a 1M tokens (de unos 45,0 GB a unos 3,5 GB), lo que permite servir contexto de un millón de tokens en una única GPU de 24 GB.

El checkpoint tiene 31.825.558.956 parámetros totales y un repositorio de 22,0 GB, con pesos en safetensors y cuantización W4A16 gestionada por compressed-tensors. Se distribuye como plugin para vLLM (motor pb27_vllm), con soporte declarado para vLLM V1 y V2 y para CUDA y ROCm. La licencia es la Gemma License, heredada del modelo base, y el pipeline es image-text-to-text, por lo que conserva la capacidad multimodal del Gemma-4 original.

La relevancia actual del proyecto es fundamentalmente de ingeniería de sistemas de inferencia más que de modelado: propone una vía para desplegar ventanas de contexto de siete cifras en hardware de consumo, un escenario que con atención Transformer estándar queda limitado por el crecimiento lineal de la caché KV y el coste cuadrático del prefill. Conviene tratar las cifras de rendimiento del autor como afirmaciones no verificadas de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Transformer con 60 capas, 50 capas de atención de ventana deslizante nativa (SWA) y 10 capas de atención global completa convertidas a SWA de 16K + Gated DeltaNet paralelo + memoria exacta Quest; `head_dim=512` |
| Parametros totales | 31.825.558.956 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 1.048.576 tokens (1M) con el plugin pb27_vllm; el modelo base Gemma-4-31B-it parte de una ventana menor (no especificada en la información disponible) |
| Tipos de cuantizacion | W4A16 (este repositorio); el proyecto publica además ediciones FP8, NVFP4 y BF16 |
| Idiomas soportados | No disponible |
| Licencia | Gemma (Gemma License) |
| Formato de pesos | safetensors con compressed-tensors; plugin vLLM incluido en el repositorio (`pb27_vllm_plugin/`) |

## Arquitectura y entrenamiento

El modelo base es Gemma-4-31B-it, un transformer denso multimodal de Google con 31.825 millones de parámetros. Sobre esa pila, el autor aplica una reconfiguración de inferencia: las 10 capas de atención global completa (índices 5, 11, 17, ..., 59) se convierten en capas de ventana deslizante de 16.384 tokens combinadas con un Gated DeltaNet paralelo, cuyo estado recurrente es de tamano O(1) con independencia de si el contexto es de 4K o de 1M tokens. Las capas de atención dispersa usan una memoria Quest de tres niveles sobre NVMe y page cache que combina 4 sinks estilo StreamingLLM, landmarks de superbloques, las páginas top-k de memoria exacta y la ventana deslizante de 16.384 tokens, fusionadas mediante LSE-merge de FlashAttention-2, con cotas jerárquicas en bf16 y superbloques de 64.

El componente de posiciones es un RoPE por bloques, proporcional y estrictamente no solapado (`_reposition_rope_blocks`), que impone una huella obligatoria de 64 tokens por bloque recuperado y escala los huecos históricos de forma proporcional, preservando continuidad local +1 entre bloques contiguos y evitando solapamiento de fase entre bloques no adyacentes; el autor afirma mantener más del 99% de fidelidad de distancia macro-temporal a 1M tokens sin degradación estática tipo YaRN. La agregación global densa se activa automáticamente para consultas de alta participación, con landmarks de resumen de superbloque (un token de resumen por cada 4.096 tokens en HBM) y barridos de conjunto de trabajo con rotación por novedad. No hay información sobre el entrenamiento de esta variante: no se especifican tokens de entrenamiento, composición del dataset ni etapas de RLHF o DPO, y por la naturaleza del repositorio (reempaquetado y cuantización de un checkpoint instruct ya existente) cabe inferir que no hubo entrenamiento adicional, aunque esto no está confirmado en la información disponible.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas de Gemma-4-31B-it en su variante instruct.
- Procesamiento multimodal image-text-to-text: entrada conjunta de imágenes y texto (pipeline declarado en HuggingFace).
- Razonamiento de largo alcance sobre contextos de hasta 1.048.576 tokens con memoria KV acotada.
- Recuperación dispersa sobre memoria exacta Quest con ventana deslizante de 16.384 tokens y landmarks de superbloque.
- Decodificación de velocidad constante (O(1)) respecto a la longitud de contexto, con presupuesto de decodificación desacoplado del presupuesto de recuperación en prefill (`PB27_MEMORY_DECODE_STRIDE=64`, `PB27_MEMORY_DECODE_BLOCKS=64`).
- Servicio compatible con la API OpenAI a través de vLLM, con nombres de modelo personalizables.
- Soporte declarado de tool calling y function calling: no disponible en la información proporcionada (no se menciona explícitamente).
- Capacidades multilingües: no disponible (los idiomas no están listados en la ficha de HuggingFace).
- Modo thinking explícito, audio o vídeo: no disponible en la información proporcionada.

## Casos de uso

- Análisis de repositorios completos: con 1M tokens de contexto y una caché KV de unos 3,5 GB, el modelo puede ingerir árboles de código extensos y responder preguntas transversales entre ficheros; el coste de memoria no crece con el tamano del repositorio, lo que evita el OOM típico de la atención densa.
- Auditoría de contratos y documentación legal: ventanas de cientos de miles de tokens permiten comparar cláusulas dispersas a lo largo de un corpus contractual completo, apoyándose en los landmarks de superbloque para localizar pasajes relevantes sin re-procesar todo el documento.
- Transcripción y razonamiento sobre corpus de investigación: el modelo puede resumir y cruzar referencias en conjuntos de papers o actas de reuniones de larga duración, con la ventana deslizante de 16K garantizando coherencia local y la memoria Quest cubriendo el histórico lejano.
- Despliegue on-premise en GPU de consumo: con pesos de unos 17,5 GB y unos 21,5 GB de VRAM total a 1M tokens, cabe en una RTX 3090, RTX 4090, RX 7900 XTX o RTX 5090, lo que habilita escenarios de contexto largo sin clústeres de A100/H100.
- Procesamiento de imágenes con contexto textual extenso: al ser image-text-to-text, sirve para tareas de document understanding donde la imagen (por ejemplo, un plano o una captura de pantalla) se acompaña de un histórico conversacional o documental muy largo.
- Servicio de API compatible con OpenAI para equipos de desarrollo: el arranque con `vllm serve` y `--served-model-name pb27` permite integrar el modelo en clientes existentes sin adaptar el código de aplicación, con `--max-num-seqs 16` como límite de concurrencia sugerido.
- Evaluación de ingeniería de inferencia: el repositorio sirve como banco de pruebas para medir el efecto de SWA, Gated DeltaNet y memoria Quest sobre latencia, throughput y calidad en contextos de hasta 1M tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card referencia un directorio `reports/` con "benchmark receipts" en el repositorio de GitHub, pero no se incluyen cifras de MMLU, HumanEval, GSM8K ni de calidad de recuperación en contexto largo en el material proporcionado. Las únicas métricas citadas son de memoria: reducción del 92,2% de la caché KV a 1M tokens (aproximadamente 45,0 GB a 3,5 GB) y un estado Gated DeltaNet de tamano fijo O(1).

## Requisitos de hardware

- VRAM estimada a 1.000.000 tokens: aproximadamente 21,5 GB totales (unos 17,5 GB de pesos más unos 3,5 GB de caché KV) para esta edición W4A16.
- GPU recomendadas para W4A16: RTX 3090 o 4090 (24 GB), AMD RX 7900 XTX (24 GB), RTX 5090 (32 GB). Para las otras ediciones: L40S (48 GB), A100 y H100 (80 GB) con FP8; Blackwell (RTX 5090, DGX Spark GB10, B200) con NVFP4; A100/H100 80 GB, DGX Spark 128 GB o MI300X con BF16 (unos 66,5 GB totales a 1M tokens).
- Cabe en GPU de consumo: sí, en las de 24 GB y superiores con la cuantización W4A16.
- Opciones de despliegue: vLLM con el plugin pb27_vllm, instalable con `pip install --no-deps "git+https://github.com/defnotean/pseudobrain.git#subdirectory=serving/pb27_vllm"` o desde el snapshot local `pb27_vllm_plugin/`. Soporte declarado de vLLM V1/V2 y CUDA/ROCm. No se mencionan llama.cpp, Ollama ni TGI.
- Parámetros de arranque sugeridos por el autor: `VLLM_ALLOW_LONG_MAX_MODEL_LEN=1`, `--max-model-len 1048576`, `--enforce-eager`, `--no-enable-prefix-caching`, `--kv-cache-memory-bytes 6G`, `--max-num-seqs 16`.
- Latencia y throughput: no disponible. El autor afirma decodificación de velocidad constante respecto a la longitud de contexto, pero no se publican tokens por segundo ni latencias de prefill medibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización de este repo | VRAM a 1M tokens | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| PseudoBrain-Gemma-4-31B-W4A16 | 31,8B (denso) | 1.048.576 | W4A16 | ~21,5 GB | Gemma | HuggingFace, plugin vLLM propio |
| PseudoBrain-Gemma-4-31B-FP8 | 31,8B (denso) | 1.048.576 | FP8 | ~36,5 GB | Gemma | HuggingFace |
| PseudoBrain-Gemma-4-31B-NVFP4 | 31,8B (denso) | 1.048.576 | NVFP4 | ~21,5 GB | Gemma | HuggingFace |
| PseudoBrain-Gemma-4-31B-BF16 | 31,8B (denso) | 1.048.576 | BF16 | ~66,5 GB | Gemma | HuggingFace |
| Gemma-4-31B-it (base) | 31,8B (denso) | No disponible en la información proporcionada | No aplica (referencia) | No disponible | Gemma | HuggingFace (google) |

La comparación con alternativas de otros proveedores (por ejemplo, modelos de contexto largo de Meta, Mistral o Qwen) no está disponible en la información proporcionada, ya que no se aportan datos de rendimiento ni de contexto de esos modelos en este material.

## Limitaciones y advertencias

- Las cifras de reducción de memoria y de fidelidad de RoPE son afirmaciones del autor; no se han verificado de forma independiente ni se acompanan de resultados de calidad en benchmarks públicos.
- El modelo modifica el mecanismo de atención del Gemma-4 original (convierte capas globales en SWA más Gated DeltaNet y Quest), por lo que su comportamiento puede diferir del modelo base, especialmente en tareas que dependían de atención global densa; no hay evaluación comparativa publicada que cuantifique esa posible degradación.
- Requiere el plugin pb27_vllm y parámetros de arranque específicos (`--enforce-eager`, sin prefix caching, límites de caché KV); no es un checkpoint que funcione sin más en un servidor vLLM estándar.
- La licencia es la Gemma License, que impone restricciones de uso comercial y obligaciones de redistribución; conviene revisar los términos antes de un despliegue en producción.
- Idiomas soportados no declarados en la ficha de HuggingFace; no hay garantía documentada de cobertura multilingüe más allá de la del modelo base.
- Riesgo de alucinación inherente a un modelo instruct de 31B; la recuperación dispersa por páginas top-k puede omitir información relevante si los landmarks y las cotas de superbloque no capturan bien la consulta, lo que agrava el riesgo en contextos muy largos.
- Sesgos conocidos: no disponible en la información proporcionada; se heredan los del modelo base Gemma-4-31B-it, no documentados en este repositorio.
- El repositorio tiene muy poca tracción (27 descargas, 0 likes) y una sola revisión (actualizado el mismo día de su creación), por lo que el soporte de la comunidad y la madurez del plugin son limitados.
- No se especifican requisitos de versiones de vLLM, CUDA, ROCm ni de FlashAttention-2, lo que puede provocar incompatibilidades en entornos no alineados con los del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/defnoteatin/PseudoBrain-Gemma-4-31B-W4A16
- Repositorio GitHub del proyecto y plugin: https://github.com/defnotean/pseudobrain
- Paper de arquitectura (PDF): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.pdf
- Paper de arquitectura (Markdown): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.md
- Benchmark receipts: https://github.com/defnotean/pseudobrain/tree/main/reports
- Perfil del autor en GitHub: https://github.com/defnotean
- Perfil del autor en HuggingFace: https://huggingface.co/defnoteatin
- Edición FP8: https://huggingface.co/defnoteatin/PseudoBrain-Gemma-4-31B-FP8
- Edición NVFP4: https://huggingface.co/defnoteatin/PseudoBrain-Gemma-4-31B-NVFP4
- Edición BF16: https://huggingface.co/defnoteatin/PseudoBrain-Gemma-4-31B-BF16
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Base cuantizada AWQ: https://huggingface.co/cyankiwi/gemma-4-31B-it-AWQ-4bit
- Base FP8 dinámica: https://huggingface.co/RedHatAI/gemma-4-31B-it-FP8-dynamic
- Base NVFP4: https://huggingface.co/RedHatAI/gemma-4-31B-it-NVFP4
