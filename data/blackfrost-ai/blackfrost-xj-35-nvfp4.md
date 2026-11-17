# Blackfrost-AI/BlackFrost-XJ-35-NVFP4

## Resumen

BlackFrost-XJ-35-NVFP4 es una cuantización de solo pesos en formato NVFP4 del checkpoint Blackfrost-AI/BlackFrost-XJ-35, que a su vez deriva del modelo moonshotai/Kimi-Linear-48B-A3B-Instruct de Moonshot AI. Se trata de un modelo de lenguaje de arquitectura híbrida Kimi Linear (KDA + MLA) con mezcla de expertos, 48 000 millones de parámetros totales y aproximadamente 3000 millones activos por token, con una ventana de contexto nativa de 1 048 576 tokens. El artefacto publicado pesa 30,54 GB distribuidos en tres shards safetensors, frente a los aproximadamente 96 GB que ocuparía el checkpoint BF16 original de 20 shards.

La relevancia de esta ficha está en el compromiso que ofrece: reduce el peso en disco y en memoria aproximadamente a un tercio manteniendo, según la verificación del autor, una paridad de capacidad estadísticamente indistinguible del modelo base en FP8 sobre una muestra determinista de MMLU-Pro. La cuantización se aplica únicamente a las matrices de los expertos enrutados (19 968 matrices w1/w2/w3), mientras que las proyecciones de atención KDA y MLA, los expertos compartidos, los routers, el MLP de la capa densa 0, los embeddings, el lm_head y las normas permanecen en BF16.

El modelo está pensado para despliegue en producción con vLLM 0.33.0 o superior, con soporte verificado de contexto de 1M tokens, modo de razonamiento (thinking) y tool calling nativo con parser kimi_k2. La licencia es MIT, heredada del modelo upstream, lo que facilita su uso comercial sin restricciones adicionales más allá de las del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | KimiLinearForCausalLM: híbrida KDA (atención lineal) + MLA (atención latente multi-cabeza), MoE con 256 expertos enrutados top-8 más 1 experto compartido |
| Parametros totales | 49 122 681 728 (dato real de safetensors) |
| Parametros activos | Aproximadamente 3 000 millones por token (A3B) |
| Longitud de contexto | 1 048 576 tokens (1M nativo) |
| Tipos de cuantizacion | W4A16_NVFP4 (modelopt_fp4, group size 16, weight-only, MSE) sobre expertos enrutados; resto en BF16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (3 shards, 30 541 017 421 bytes) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Kimi Linear de Moonshot AI: 27 capas en total, de las cuales 20 usan KDA (Kimi Delta Attention, una forma de atención lineal con estado recurrente) y 7 usan MLA (Multi-head Latent Attention). La capa 0 es densa y las capas 1 a 26 incorporan mezcla de expertos con 256 expertos enrutados, selección top-8 y un experto compartido adicional. Esta combinación busca reducir el coste computacional y de memoria de la atención en contextos muy largos (hasta 1M tokens) manteniendo la calidad de un transformer clásico en las capas donde la atención completa es más crítica.

La cuantización la realiza NVIDIA ModelOpt 0.48.0 en modo W4A16_NVFP4 con group size 16 y calibración MSE, aplicada exclusivamente a las matrices de los expertos enrutados (`block_sparse_moe.experts.{0..255}.{w1,w2,w3}.weight`). El resto de pesos se conserva en BF16, lo que preserva la precisión de las proyecciones de atención y del router, elementos especialmente sensibles en arquitecturas MoE. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo upstream dentro de la información proporcionada.

## Capacidades

- Generación de texto y conversación multi-turno con contexto de hasta 1M tokens.
- Modo de razonamiento (thinking) activado por defecto mediante prefill `<think>\n`, desactivable con `chat_template_kwargs: {"thinking": false}`.
- Tool calling / function calling nativo con el formato Kimi K2 (tokens 163595–163599) y parser dedicado en vLLM.
- Flujos de agente con múltiples pasos y rondas de retorno de herramientas verificadas de extremo a extremo.
- Separación de streaming entre razonamiento y respuesta final mediante el parser `kimi_k2`.
- Capacidades multilingües: no disponible en la información proporcionada.
- No se documentan capacidades de visión ni audio en esta ficha.

## Casos de uso

- Atención al cliente automatizada con historial largo: la ventana de 1M tokens permite mantener conversaciones multi-turno con documentación de producto, tickets previos y políticas internas en el mismo contexto sin truncar.
- Análisis de repositorios completos: con 1M tokens de contexto se puede cargar un proyecto de tamaño medio y pedir revisiones, refactorizaciones o explicaciones atravesando varios ficheros.
- Agentes de automatización con herramientas: el soporte nativo de tool calling y el parser kimi_k2 permiten construir agentes que consultan APIs, bases de datos o sistemas de ticketing en bucles multi-paso.
- Procesamiento de documentos legales o contractuales: contratos extensos, expedientes y normativa caben en una sola ventana, reduciendo la pérdida de información por chunking.
- Razonamiento asistido con trazas auditables: el modo thinking separado del output final facilita registrar la cadena de razonamiento para auditoría o depuración en pipelines internos.
- Despliegue en infraestructura con VRAM limitada: al ocupar 30,54 GB en disco y requerir menos memoria que el BF16, permite servir un modelo de 48B/A3B en una sola GPU de 80 GB o en configuraciones multi-GPU más modestas que el checkpoint original.
- Generación de código en pipelines de CI/CD: integrable vía API compatible con OpenAI en vLLM, con tool calling para consultar el estado del repositorio o lanzar tests.

## Benchmarks y rendimiento

| Benchmark | Modelo | Resultado |
|---|---|---|
| MMLU-Pro (500 prompts deterministas, temp=0, seed=1234, max_tokens=16384) | Kimi-Linear-48B-A3B-Instruct (FP8, stock) | 360/500 (72,00 %) |
| MMLU-Pro (misma configuración) | BlackFrost-XJ-35-NVFP4 (thinking ON) | 351/500 (70,20 %) |

El autor reporta un test exacto de McNemar bilateral con p = 0,3682, sin diferencia estadísticamente significativa entre ambos. No se han publicado otros resultados de benchmarks (HumanEval, GSM8K, MMLU estándar, etc.) en la información disponible.

## Requisitos de hardware

- Peso en disco del checkpoint: 30,54 GB (28,44 GiB) en tres shards.
- VRAM estimada para inferencia: los pesos en BF16 de las partes no cuantizadas más los expertos en NVFP4 requieren del orden de 30–35 GB solo para pesos; con caché KV para 1M tokens y `--max-num-seqs 16` hay que reservar margen adicional. El autor advierte que con 256 secuencias simultáneas vLLM V2 puede asignar unos 25 GiB solo a buffers de entrada persistentes.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para servir con contexto completo de 1M; configuraciones multi-GPU para mayor concurrencia.
- GPU de consumo: no se documenta un despliegue verificado en GPUs consumer; por tamaño de pesos, una RTX 4090 (24 GB) no cabría sin cuantización adicional del resto de capas, que aquí permanecen en BF16.
- Opciones de despliegue verificadas: vLLM v0.33.0 o superior con `--trust-remote-code`, `--enable-auto-tool-choice`, `--tool-call-parser kimi_k2`, `--reasoning-parser kimi_k2` y `--max-model-len 1048576`. No se documenta soporte verificado en llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Cuantización | Disponibilidad |
|---|---|---|---|---|---|---|
| BlackFrost-XJ-35-NVFP4 | 49,1B | ~3B | 1M | MIT | NVFP4 solo expertos, resto BF16 | Hugging Face (2 descargas) |
| moonshotai/Kimi-Linear-48B-A3B-Instruct | ~48B | ~3B | 1M | MIT | BF16 / FP8 | Hugging Face (upstream) |
| Blackfrost-AI/BlackFrost-XJ-35 | ~48B | ~3B | 1M | MIT (heredada) | BF16, 20 shards | Hugging Face (checkpoint padre) |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Solo se ha verificado la paridad de capacidad en una muestra de 500 prompts de MMLU-Pro; no hay evaluación publicada en otros benchmarks ni en tareas de código, matemáticas o tool calling más allá de la verificación funcional.
- La cuantización NVFP4 se aplica solo a los expertos enrutados; el resto de pesos en BF16 implica que el ahorro de memoria es parcial respecto a una cuantización integral.
- El modelo base es una versión Instruct con modo thinking por defecto; en producción conviene desactivarlo explícitamente para tareas de baja latencia.
- Riesgo de alucinación inherente a modelos de lenguaje de esta escala; no se documentan evaluaciones de factualidad ni de sesgos.
- Idiomas soportados no documentados; el rendimiento fuera del inglés y del chino no está verificado.
- La licencia MIT se hereda del modelo upstream, pero conviene revisar las condiciones del checkpoint base de Moonshot AI antes de un uso comercial a gran escala.
- El despliegue verificado requiere vLLM 0.33.0 o superior con `--trust-remote-code`, lo que implica ejecutar código Python del repositorio; auditar `modeling_kimi.py` y `configuration_kimi.py` antes de usarlo en entornos sensibles.
- El repositorio tiene 2 descargas y 0 likes en el momento de la ficha; es un artefacto reciente y poco validado por la comunidad.
- El flag `private: true` aparece en la model card pese a que el repositorio es público; conviene verificar la visibilidad real antes de depender de él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Blackfrost-AI/BlackFrost-XJ-35-NVFP4
- Modelo base upstream: https://huggingface.co/moonshotai/Kimi-Linear-48B-A3B-Instruct
- Checkpoint padre BF16: https://huggingface.co/Blackfrost-AI/BlackFrost-XJ-35
- Repositorio de vLLM: https://github.com/vllm-project/vllm
- NVIDIA ModelOpt: https://github.com/NVIDIA/TensorRT-Model-Optimizer
