# defnoteatin/PseudoBrain-Gemma-4-31B-NVFP4

## Resumen

PseudoBrain-Gemma-4-31B-NVFP4 es una variante cuantizada en NVFP4 del modelo Gemma 4 31B instructivo de Google, publicada por el desarrollador independiente Ian Kurt Galeon (defnoteatin). No se trata de un reentrenamiento, sino de una conversión del checkpoint RedHatAI/gemma-4-31B-it-FP8-dynamic a la arquitectura PseudoBrain, que sustituye parte de la atención global por ventanas deslizantes de 16K tokens combinadas con Gated DeltaNet y un mecanismo de memoria exacta denominado Quest. El objetivo declarado es reducir el coste de memoria del KV cache en contextos largos: según la model card, el cache para 1.000.000 de tokens baja de unos 45 GB a unos 3,5 GB, lo que permite servir contexto de un millón de tokens en una única GPU de 24 GB.

El modelo conserva la naturaleza multimodal image-text-to-text de Gemma 4 y sus 32.682.375.020 parámetros reales en safetensors, empaquetados en un repositorio de 24,4 GB. La cuantización NVFP4 (W4A16) reduce los pesos a aproximadamente 17,5 GB y el consumo total estimado a 1M de tokens a unos 21,5 GB. Está pensado para GPUs NVIDIA Blackwell (RTX 5090, DGX Spark GB10, B200), aunque la model card menciona también compatibilidad con ROCm.

Su relevancia actual es doble: por un lado, demuestra una vía práctica para contexto ultralargo con memoria acotada; por otro, es un artefacto con muy poca tracción (26 descargas, 0 likes en el momento de la consulta) y con una arquitectura propietaria que requiere un plugin específico de vLLM, lo que limita su adopción frente a alternativas estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 50 capas con sliding window attention (SWA) de 16K + 10 capas globales convertidas a SWA 16K + Parallel Gated DeltaNet + Quest Exact Memory; clase PB27Gemma4ForConditionalGeneration |
| Parametros totales | 32.682.375.020 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | NVFP4 (W4A16) en este repositorio; existen ediciones FP8, BF16 y AWQ-4bit del mismo proyecto |
| Idiomas soportados | no disponible |
| Licencia | Gemma (términos de licencia de Google Gemma) |
| Formato de pesos | safetensors, con compressed-tensors; requiere vLLM y el plugin pb27_vllm |

## Arquitectura y entrenamiento

La arquitectura parte del transformer de Gemma 4 31B y lo modifica en profundidad. De las 60 capas, 50 mantienen atención de ventana deslizante nativa y las 10 capas globales sin límite (índices 5, 11, 17, ..., 59, con head_dim=512) se convierten en SWA de 16K más Gated DeltaNet paralelo más memoria exacta Quest. El estado recurrente de Gated DeltaNet es de tamaño fijo O(1), independiente de si el contexto es de 4K o de 1M tokens, lo que elimina el crecimiento lineal del KV cache.

Sobre las capas ancla dispersas, las consultas atienden a un conjunto compuesto por 4 sinks tipo StreamingLLM, landmarks de superbloques, las top-k páginas de memoria exacta Quest y la ventana deslizante de 16.384 tokens, combinados mediante FlashAttention-2 con fusión LSE. El sistema usa límites jerárquicos de superbloque en bf16 (PB27_MEMORY_SUPERBLOCK=64) y un RoPE por bloques no solapados (_reposition_rope_blocks) que asigna un pie de 64 tokens por bloque recuperado y escala proporcionalmente los huecos históricos. La agregación global densa (PB27_MEMORY_GLOBAL_AGG="auto") activa landmarks residentes de resumen (un token por cada 4.096 tokens), cobertura estratificada de la línea temporal y barridos de working set con rotación por novedad durante la decodificación.

No hay información sobre el entrenamiento: el modelo es una conversión del checkpoint instructivo de Gemma 4, por lo que hereda los datos y el alineamiento (RLHF/DPO) de Google, pero la model card no detalla tokens de entrenamiento ni composición del dataset. La innovación técnica es de inferencia, no de preentrenamiento.

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno, heredados de Gemma 4 31B instructivo.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con entrada multimodal.
- Contexto ultralargo de hasta 1.048.576 tokens con memoria de KV cache acotada.
- Decodificación de velocidad constante O(1) gracias a la separación entre presupuesto de recuperación en prefill y presupuesto fijo en decode (PB27_MEMORY_DECODE_STRIDE=64, PB27_MEMORY_DECODE_BLOCKS=64).
- Barrido de razonamiento multi-paso sobre cientos de bloques distintos en ventanas de 1M tokens mediante rotación de novedad.
- Compatibilidad con el servidor OpenAI-compatible de vLLM (endpoint /v1/chat/completions).
- Soporte de tool calling y function calling: no confirmado en la información disponible.
- Capacidades multilingües: no disponible.
- Modo thinking explícito: no disponible.

## Casos de uso

- Análisis de repositorios completos: ingerir un codebase de cientos de miles de tokens en una sola pasada y responder preguntas sobre él, aprovechando el contexto de 1M y el KV cache de ~3,5 GB que evita el OOM típico en GPUs de 24 GB.
- Revisión de contratos y documentación legal extensa: procesar expedientes de varios cientos de páginas manteniendo referencias cruzadas entre secciones distantes gracias a los landmarks de superbloque y a la memoria exacta Quest.
- Atención al cliente con historial largo: gestionar conversaciones multi-turno con memoria de interacciones previas de hasta un millón de tokens sin reentrenar ni resumir el historial, en un único servidor vLLM.
- Auditoría de logs y trazas de producción: correlacionar eventos distribuidos a lo largo de ventanas temporales amplias usando la cobertura estratificada de la línea temporal.
- Despliegue on-premise con privacidad de datos: servir el modelo en una RTX 5090 o DGX Spark sin depender de APIs externas, con pesos de ~17,5 GB y consumo total estimado de ~21,5 GB a 1M de tokens.
- Investigación sobre eficiencia de atención: usar el plugin pb27_vllm como banco de pruebas para comparar SWA, Gated DeltaNet y recuperación Quest frente a atención completa en tareas de contexto largo.
- Procesamiento de documentación técnica multimodal: combinar capturas, diagramas y texto extenso en un mismo prompt image-text-to-text para generar informes consolidados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a la carpeta reports/ del repositorio de GitHub del autor como fuente de "benchmark receipts", pero no se incluyen cifras de MMLU, HumanEval, GSM8K ni de tareas de contexto largo en los datos proporcionados. Tampoco se ofrecen métricas de latencia o throughput medidas.

## Requisitos de hardware

- VRAM estimada para inferencia: ~21,5 GB totales a 1M de tokens según la model card (pesos ~17,5 GB + KV cache ~3,5 GB); el KV cache sin la arquitectura PseudoBrain sería de ~45 GB.
- GPU recomendadas: NVIDIA Blackwell (RTX 5090 de 32 GB, DGX Spark GB10, B200) por el soporte nativo de NVFP4; la model card menciona también AMD RX 7900 XTX de 24 GB y compatibilidad ROCm.
- Cabe en GPU de consumo: sí, en RTX 3090 o 4090 de 24 GB y en RTX 5090 de 32 GB, siempre que se use la variante NVFP4 y el plugin de vLLM.
- Opciones de despliegue: exclusivamente vLLM con el plugin pb27_vllm (soporte de runners V1 y V2, con fallback ForwardContext sin hooks). No se menciona soporte para llama.cpp, Ollama ni TGI.
- Lanzamiento de referencia: `VLLM_ALLOW_LONG_MAX_MODEL_LEN=1 vllm serve defnoteatin/PseudoBrain-Gemma-4-31B-NVFP4 --max-model-len 1048576 --enforce-eager --no-enable-prefix-caching --kv-cache-memory-bytes 6G --max-num-seqs 16`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | VRAM a 1M tokens | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| PseudoBrain-Gemma-4-31B-NVFP4 | 32,7B | 1.048.576 | NVFP4 (W4A16) | ~21,5 GB | Gemma | Hugging Face, requiere plugin vLLM |
| PseudoBrain-Gemma-4-31B-FP8 | 32,7B | 1.048.576 | FP8 | ~36,5 GB | Gemma | Hugging Face, requiere plugin vLLM |
| PseudoBrain-Gemma-4-31B-BF16 | 32,7B | 1.048.576 | BF16 | ~66,5 GB | Gemma | Hugging Face, requiere plugin vLLM |
| RedHatAI/gemma-4-31B-it-FP8-dynamic | 32,7B | no disponible | FP8 | no disponible | Gemma | Hugging Face, vLLM estándar |
| cyankiwi/gemma-4-31B-it-AWQ-4bit | 32,7B | no disponible | AWQ 4-bit | no disponible | Gemma | Hugging Face, vLLM estándar |

Las alternativas de la misma categoría con datos públicos en la información disponible son las otras ediciones del propio proyecto PseudoBrain y los checkpoints cuantizados estándar de Gemma 4 31B. No se dispone de datos de rendimiento comparativo entre ellas.

## Limitaciones y advertencias

- Requiere instalar el plugin pb27_vllm desde GitHub; no funciona con un vLLM estándar ni con otros motores de inferencia.
- La model card recomienda `--enforce-eager` y desactivar el prefix caching, lo que penaliza el throughput en producción.
- El soporte de NVFP4 está ligado a GPUs Blackwell; en arquitecturas anteriores habrá que usar las ediciones FP8, BF16 o AWQ del mismo autor.
- El modelo es una conversión de pesos, no un reentrenamiento: los sesgos y el riesgo de alucinación son los de Gemma 4 31B instructivo, no evaluados de forma independiente en esta variante.
- No hay información sobre idiomas soportados ni sobre evaluación multilingüe específica de esta edición.
- El repositorio tiene 26 descargas y 0 likes, sin benchmarks publicados en la información disponible; la madurez y el soporte a largo plazo del plugin son inciertos.
- La licencia Gemma impone restricciones de uso comercial y obligaciones de atribución que deben revisarse antes de un despliegue en producción.
- La arquitectura modifica el mecanismo de atención del modelo base, por lo que la fidelidad de las respuestas en contextos largos frente al Gemma 4 original no está verificada de forma independiente en los datos disponibles.

## Enlaces

- Hugging Face: https://huggingface.co/defnoteatin/PseudoBrain-Gemma-4-31B-NVFP4
- Repositorio GitHub del proyecto: https://github.com/defnotean/pseudobrain
- Paper de arquitectura (PDF): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.pdf
- Paper de arquitectura (Markdown): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.md
- Informes de benchmarks: https://github.com/defnotean/pseudobrain/tree/main/reports
- Perfil del autor en GitHub: https://github.com/defnotean
- Perfil del autor en Hugging Face: https://huggingface.co/defnoteatin
- Edición FP8: https://huggingface.co/defnoteatin/PseudoBrain-Gemma-4-31B-FP8
- Edición BF16: https://huggingface.co/defnoteatin/PseudoBrain-Gemma-4-31B-BF16
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Checkpoint de origen de la cuantización: https://huggingface.co/RedHatAI/gemma-4-31B-it-FP8-dynamic
- Cuantización AWQ de referencia: https://huggingface.co/cyankiwi/gemma-4-31B-it-AWQ-4bit
