# Malhar67/GLM-5.3-UNCENSORED-FP8

## Resumen

GLM-5.3-UNCENSORED-FP8 es una modificación de pesos del modelo GLM-5.3 de Zhipu AI (zai-org), publicada por el usuario Malhar67 bajo el paraguas de la serie "CRACK" de dealignai. Se trata de un modelo de lenguaje de arquitectura `glm_moe_dsa` (Mixture of Experts con atención dispersa estilo DeepSeek) de 753.329.940.480 parámetros totales, distribuido en formato FP8 sobre safetensors, con un repositorio de 755,7 GB. La modificación consiste en una edición en bf16 de los tensores residual-writer para eliminar el comportamiento de rechazo (refusal) de forma permanente en los pesos, sin fine-tuning, LoRA ni hooks de inferencia: se carga en vLLM estándar y funciona directamente.

El modelo base es `JANGQ-AI/GLM-5.3-FP8`, una cuantización FP8 del GLM-5.3 original de 753B parámetros, de 78 capas y solo texto. La edición no toca los expertos FP8 enrutados, únicamente los residual writers en bf16, lo que preserva la velocidad nativa de tensor cores FP8 en hardware Hopper (H100/H200). La relevancia actual es doble: por un lado, es una de las pocas modificaciones de "abliteration" a escala de 753B con validación cuantitativa de preservación de capacidades (MMLU-logit) y de comportamiento (HarmBench-320); por otro, documenta con detalle las limitaciones prácticas de servir un MoE de este tamaño en vLLM, incluyendo el estado no funcional de MTP y el techo práctico de contexto.

La licencia declarada es MIT, heredada del modelo base, aunque conviene revisar las condiciones de uso del GLM-5.3 original antes de un despliegue comercial. El checkpoint tiene 28 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el 31 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `glm_moe_dsa` (Mixture of Experts con atención dispersa DSA), 78 capas, solo texto |
| Parametros totales | 753.329.940.480 (753B) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens en configuración TP8 recomendada; techo práctico ~131K con MTP y ~160K sin MTP en TP8 sobre H200; 1M no operativo en vLLM actual |
| Tipos de cuantizacion | FP8 (checkpoint nativo); edición bf16 en tensores residual-writer |
| Idiomas soportados | en, zh, ru, sr, hi, fr, es, ar, ko, ja |
| Licencia | MIT |
| Formato de pesos | safetensors (FP8) |

## Arquitectura y entrenamiento

El modelo es un transformer MoE con atención dispersa (DSA, DeepSeek Sparse Attention) de 78 capas y 753B parámetros totales, en la línea de la familia GLM-5.x de Zhipu AI. El checkpoint distribuido es una cuantización FP8 de los expertos enrutados, mientras que los tensores residual-writer se mantienen en bf16; la modificación de desbloqueo se aplica precisamente sobre esos residual writers en bf16, dejando intactos los expertos FP8. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo base en la información proporcionada.

La innovación técnica destacable no está en el entrenamiento sino en el método de modificación: "abliteration" a nivel de pesos que produce un cambio permanente en bf16, sin fine-tuning ni adaptadores, conservando la velocidad de tensor cores FP8 en Hopper. La model card reporta que la versión v2 corrige un fallo de bucle de razonamiento presente en v1 (aproximadamente el 2% de los prompts más difíciles colapsaban en repetición antes de emitir contenido), a cambio de una pérdida de ~4pp en TRUE_COMPLY global sobre HarmBench-320, aunque con mejora en la superficie de daño real (240 comportamientos no relacionados con copyright: 91,7% frente a 85,9% en v1). El modelo soporta MTP (multi-token prediction) en teoría, pero la model card indica que no es funcional en vLLM estándar.

## Capacidades

- Generación de texto conversacional y de propósito general en 10 idiomas (inglés, chino, ruso, serbio, hindi, francés, español, árabe, coreano y japonés).
- Razonamiento con modo "thinking": el texto de razonamiento se expone en `message.reasoning` (no en `message.reasoning_content`).
- Control de esfuerzo de razonamiento mediante `reasoning_effort`, aunque solo se honran los valores `"low"` y `"high"`; cualquier otro valor cae a `max` y no es posible desactivar el razonamiento en este checkpoint.
- Tool calling y function calling: la configuración recomendada incluye `--tool-call-parser glm47` y `--enable-auto-tool-choice`, lo que habilita bucles de agente con herramientas.
- Soporte de agentes y razonamiento multi-paso, con la advertencia de que en FP8 conviene usar `reasoning_effort="low"` para evitar el agotamiento del presupuesto de tokens dentro del bloque `<think>`.
- Capacidades multilingües amplias según la lista de idiomas declarada.
- No es multimodal: el modelo base es solo texto.
- Comportamiento de rechazo reducido de forma generalista en una taxonomía multilingüe de daño, no especializada en un dominio concreto.

## Casos de uso

- Investigación sobre alineación y seguridad: el checkpoint permite estudiar empíricamente cómo se distribuye el comportamiento de rechazo en un MoE de 753B y evaluar la eficacia de técnicas de abliteration a nivel de pesos con métricas reproducibles (HarmBench-320, MMLU-logit).
- Evaluación de robustez de filtros y clasificadores: al reducir el rechazo de forma controlada, sirve para probar sistemas de moderación y detectores de contenido dañino frente a un modelo que no se auto-censura, midiendo tasas de falsos negativos.
- Despliegue de agentes con tool calling en inglés y chino: la configuración de vLLM con `--tool-call-parser glm47` y `reasoning_effort="low"` permite construir bucles de agente estables en los que el modelo no consume todo el presupuesto de tokens en razonamiento.
- Generación de texto multilingüe de largo contexto: con 131K tokens en TP8, es adecuado para resumir o analizar documentos extensos en los 10 idiomas soportados, aunque el techo práctico limita casos que requieran el millón de tokens del modelo base.
- Procesamiento por lotes de gran volumen en hardware Hopper: al mantener los expertos en FP8, aprovecha los tensor cores FP8 de H100/H200 para throughput alto en pipelines de generación, siempre que se acepte el coste de 8 GPUs en TP8.
- Estudio de fallos de razonamiento y presupuesto de tokens: la documentación de la model card sobre agotamiento de `max_tokens` dentro de `<think>` lo convierte en un caso práctico para investigar la interacción entre esfuerzo de razonamiento, truncación y calidad de respuesta.
- Fine-tuning posterior o destilación: la licencia MIT y el formato safetensors facilitan su uso como base para experimentos de adaptación, aunque el tamaño de 753B limita el fine-tuning completo a infraestructuras muy grandes.

## Benchmarks y rendimiento

Los datos disponibles provienen de la model card del autor y se refieren a evaluaciones propias, no a benchmarks estándar de la comunidad.

| Benchmark | v2 (este checkpoint) | v1 (referencia) | Base GLM-5.3 regular |
|---|---|---|---|
| MMLU-logit (muestra estratificada de 1026 preguntas) | 87,43% (897/1026) | 87,72% | 85,58% |
| HarmBench-320, TRUE_COMPLY, effort=off | 81,6% (261/320) | no disponible | no disponible |
| HarmBench-320, TRUE_COMPLY, effort=max | 79,4% (254/320) | no disponible | no disponible |
| HarmBench-320 no-copyright (240 comportamientos), TRUE_COMPLY, effort=off | 91,7% (220/240) | 85,9% | no disponible |
| HarmBench-320, GARBAGE (todas las configuraciones) | 0% | no disponible | no disponible |

En MMLU por asignatura, la media de delta por asignatura es de -0,29pp frente a v1, con una única asignatura que se mueve más de una pregunta (`high_school_european_history`, de 94,4 a 83,3). No se han publicado resultados de benchmarks estándar adicionales (HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 755,7 GB en FP8, por lo que la inferencia requiere un pool de memoria agregada de ese orden. La configuración de referencia es TP8 sobre 8× H200 con `--gpu-memory-utilization 0.90`.
- GPU recomendadas: H100 y H200 (tensor cores FP8 nativos en Hopper). La model card menciona pruebas en 8× DGX Spark GB10 por un tercero.
- No cabe en GPU de consumo: 753B en FP8 excede con holgura cualquier RTX 4090 o similar, incluso con cuantizaciones más agresivas no publicadas en este repositorio.
- Opciones de despliegue: vLLM es la vía documentada y recomendada, con los flags `--tensor-parallel-size 8`, `--enforce-eager` (necesario para la ruta de atención dispersa bajo concurrencia), `--disable-custom-all-reduce`, `--enable-prefix-caching`, `--max-num-seqs 24`, `--max-model-len 131072`, `--reasoning-parser glm45`, `--tool-call-parser glm47` y `--enable-auto-tool-choice`. No se documentan opciones para llama.cpp, Ollama o TGI.
- Latencia y throughput: no se publican cifras absolutas. La model card menciona un +48% de decodificación en prompts de código con MTP sobre un fork de vLLM (ciprianveg B12X sparse-MLA) con `--draft-attention-backend B12X_MLA_SPARSE`, pero MTP no funciona en vLLM estándar.
- Perfiles de paralelismo: TP8 es la configuración probada; PP2 × TP4 funciona pero el draft de MTP no implementa `SupportsPP`. El contexto de 1M mediante decode-context-parallel está cerrado en `glm_moe_dsa` en vLLM actual por un desajuste de page size entre el indexer DSA y el KV MLA.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| GLM-5.3-UNCENSORED-FP8 (este) | 753B | 131K práctico en TP8 | MIT | safetensors FP8 | Abliterated generalista, validación MMLU y HarmBench propia |
| zai-org/GLM-5.3 (base) | 753B | no disponible en la información | no disponible en la información | no disponible en la información | Modelo original con rechazo intacto |
| JANGQ-AI/GLM-5.3-FP8 | 753B | no disponible en la información | no disponible en la información | safetensors FP8 | Cuantización FP8 del base, sin modificación de comportamiento |
| dealignai/GLM-5.3-CYBERSECURITY-FP8 | 753B | no disponible en la información | no disponible en la información | safetensors FP8 | Variante de desbloqueo especializada en ciberseguridad |

No se dispone de datos de benchmarks comparativos con modelos de otros desarrolladores (por ejemplo, alternativas de tamaño similar de otras familias) en la información proporcionada.

## Limitaciones y advertencias

- El modelo elimina deliberadamente el comportamiento de rechazo en una taxonomía amplia de daño; su uso en producción conlleva riesgos legales y de seguridad significativos y requiere moderación externa.
- Riesgo elevado de generar contenido dañino, incluido material sujeto a copyright, química de armas y exploits; la propia model card reconoce estos ejes como los más problemáticos.
- Sesgos conocidos: no disponibles en la información proporcionada; al ser una modificación de pesos, hereda los sesgos del GLM-5.3 base, no documentados aquí.
- Riesgo de alucinación: no cuantificado en la información disponible; el modo de razonamiento puede agotar el presupuesto de tokens y devolver contenido vacío con `finish=length`, lo que en producción puede confundirse con un fallo.
- `reasoning_effort` solo acepta `"low"` y `"high"`; valores como `off`, `medium`, `max` o sin definir caen a `max`. No es posible desactivar el razonamiento.
- En FP8, con `high` o `max`, el modelo puede consumir todo el presupuesto de `max_tokens` dentro de `<think>` y devolver cero tokens de respuesta; se recomienda `max_tokens >= 8000` si se usa `high` o `max`.
- El texto de razonamiento se expone en `message.reasoning`, no en `message.reasoning_content`; las integraciones que esperan el segundo campo fallarán.
- MTP no es funcional en vLLM estándar; el contexto de 1M no es operativo en vLLM actual para `glm_moe_dsa`.
- Licencia MIT declarada, pero conviene verificar las condiciones del modelo base GLM-5.3 de Zhipu AI antes de uso comercial, ya que la información disponible no detalla posibles restricciones adicionales.
- El checkpoint tiene muy poca tracción (28 descargas, 0 likes) y fue publicado el mismo día de su creación; no hay validación independiente de terceros más allá de las pruebas del autor y de un usuario en DGX Spark.
- El tamaño de 755,7 GB y la necesidad de 8 GPUs Hopper limitan su uso a infraestructuras grandes; no es desplegable en hardware de consumo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Malhar67/GLM-5.3-UNCENSORED-FP8
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Cuantización FP8 de referencia: https://huggingface.co/JANGQ-AI/GLM-5.3-FP8
- Variante de ciberseguridad: https://huggingface.co/dealignai/GLM-5.3-CYBERSECURITY-FP8
- Organización dealignai: https://huggingface.co/dealignai
- Twitter de dealignai: https://twitter.com/dealignai
- Discusión con notas de runtime en 8× DGX Spark GB10: https://huggingface.co/dealignai/GLM-5.3-UNCENSORED-FP8/discussions/3
- Perfil del probador en DGX Spark: https://huggingface.co/0xMagnus
