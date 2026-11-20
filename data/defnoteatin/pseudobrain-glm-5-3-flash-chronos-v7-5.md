# defnoteatin/PseudoBrain-GLM-5.3-Flash-Chronos-v7.5

## Resumen

PseudoBrain-GLM-5.3-Flash-Chronos-v7.5 es una compresión extrema del modelo `zai-org/GLM-5.3-Flash` desarrollada por Ian Kurt Galeon (`defnoteatin`). El objetivo declarado es hacer viable el despliegue de un MoE de 83.772.864.542 parámetros totales en una única estación de trabajo con memoria unificada de 128 GB, en concreto la NVIDIA DGX Spark (GB10 Grace Blackwell Superchip), donde el checkpoint original en FP8 (305,78 GB) no cabe.

La técnica central es "Holographic Superposition" de Chronos v7.5: agrupa expertos en bancos holográficos NVFP4 compartidos, aplica "Coupled Rank-64 FP8 SMW SVD Healers" y cuantiza las colas con retículas isotrópicas Lloyd-Max de 1 y 2 bits. El resultado declarado es un checkpoint de 92,58 GB (72,91 GB en modo compacto, 59,76 GiB de pesos activos NVFP4) que deja espacio para una caché KV SparseMLA de 1.905.046 tokens.

El modelo conserva la arquitectura completa de 46 capas de GLM-5.3-Flash (3 capas densas, 42 capas MoE con 288 expertos enrutados cada una, más una capa 45 `Glm5NextMTP` de decodificación especulativa) y se distribuye con licencia Apache 2.0. Incluye una variante "abliterated/uncensored" según los tags del repositorio, y está empaquetado para vLLM con un motor propio denominado `pb27_vllm`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con SparseMLA; 3 capas densas (0-2) + 42 capas MoE (3-44) + capa 45 `Glm5NextMTP` |
| Parametros totales | 83.772.864.542 |
| Parametros activos | no disponible (top-8 expertos enrutados por token sobre 288 expertos por capa; 12.096 expertos enrutados en total) |
| Longitud de contexto | 1.048.576 tokens (1M); caché KV declarada de hasta 1.905.046 tokens |
| Tipos de cuantizacion | NVFP4 (pesos activos), FP8 (healers SVD rank-64), retículas 1-bit/2-bit para colas; checkpoint original en Block-FP8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (66 shards originales; repo de 92,7 GB), librería vLLM con `custom_code` |
| Vocabulario | 154.880 tokens |
| Capas totales | 46 |
| Expertos enrutados por capa | 288 (top-8 por token) |
| Tamano del checkpoint | 92,58 GB estandar / 72,91 GB compacto / 59,76 GiB NVFP4 activos |
| Hardware objetivo | NVIDIA DGX Spark GB10 (128 GB LPDDR5X unificada); probado tambien en A100-80GB |

## Arquitectura y entrenamiento

El modelo no se entrena desde cero: es una recompresión del checkpoint `zai-org/GLM-5.3-Flash` de Z.ai. La arquitectura subyacente es un transformer MoE de 46 capas con atención SparseMLA, 288 expertos enrutados por capa (top-8 por token) y una capa final `Glm5NextMTP` dedicada a decodificación especulativa multi-token. La innovación del autor no está en el entrenamiento sino en la compresión y el motor de inferencia.

Chronos v7.5 aplica tres transformaciones sobre los pesos: (1) agrupación de 8 expertos en un banco holográfico NVFP4 compartido, evaluado mediante proyección asociativa en espacio vectorial 1D; (2) descomposición SVD con rango 64 en FP8 ("Coupled SMW SVD Healers") para corregir el error introducido por la superposición; y (3) cuantización de las colas de la distribución con retículas isotrópicas Lloyd-Max de 1 y 2 bits. El autor declara una retención del 100,00% en 8 benchmarks oficiales de Z.ai y una similitud de coseno de logits del 99,83% frente al modelo original. No se especifican datos de entrenamiento ni procesos de RLHF/DPO adicionales, ya que se heredan del modelo base.

El motor `pb27_vllm` incorpora un kernel Triton fusionado de enrutamiento top-k con sigmoide (`_chronos_fused_topk_sigmoid_kernel`) que coalesce las lecturas de expertos durante la verificación especulativa de 3 tokens, reduciendo hasta 2,25 veces las lecturas únicas de pesos de expertos en LPDDR5X. También aplica `POSIX_FADV_DONTNEED` por shard para evitar picos de page-cache y permite cargar la capa MTP con `allow_patterns_overrides` limitando el escaneo a un único shard.

## Capacidades

- Generación de texto autoregresiva con contexto de hasta 1M tokens mediante SparseMLA y caché KV de memoria aproximadamente constante.
- Razonamiento multi-paso y decodificación especulativa de 3 pasos con la capa `Glm5NextMTP` (1 token bonus + 2 tokens borrador).
- Generación de código y matemáticas heredada del modelo base GLM-5.3-Flash (no se detallan capacidades específicas adicionales en la información disponible).
- Servicio concurrente multi-stream: el autor reporta 4 streams concurrentes a 49,74 tok/s agregados.
- Variante "abliterated/uncensored" según los tags del repositorio, lo que implica la supresión de mecanismos de rechazo del modelo base.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponible en la información proporcionada.
- Idiomas soportados: no disponible en la información proporcionada.

## Casos de uso

- Despliegue on-premise de contexto largo en una sola estación de trabajo: el modelo permite ejecutar un MoE de 83,8B parámetros con ventana de 1M tokens en una DGX Spark de 128 GB, sin necesidad de clúster multi-GPU ni de agregar GPUs de 80 GB.
- Análisis de repositorios y documentación extensa: con 1.048.576 tokens de contexto, se puede ingerir un árbol de código completo o un corpus documental amplio en una sola pasada, manteniendo la caché KV en aproximadamente 16 GiB según el autor.
- Asistentes de código interactivos de baja latencia: los 42,43 tok/s medios y 54,68 tok/s de pico en decodificación de un solo stream permiten integrar el modelo en un CLI tipo OpenCode con respuesta en tiempo casi interactivo.
- Servicio multi-usuario en hardware compacto: los 49,74 tok/s agregados con 4 streams concurrentes lo hacen adecuado para equipos pequeños que necesitan un endpoint compartido de generación de texto sin infraestructura de datacenter.
- Investigación en compresión de modelos: el checkpoint y los papers de Chronos y PseudoBrain sirven como referencia reproducible para estudiar superposición holográfica, SVD healers y cuantización de colas en MoE de gran tamaño.
- Experimentación con modelos sin filtros: la variante abliterated permite investigar comportamientos del modelo base sin mecanismos de rechazo, útil en estudios de alineación y seguridad, con las advertencias éticas y legales correspondientes.
- Prototipado de agentes con contexto masivo: la ventana de 1M tokens y el soporte de decodificación especulativa permiten mantener historiales de agente largos con coste de memoria acotado, aunque la información disponible no confirma soporte explícito de tool calling.

## Benchmarks y rendimiento

El autor declara una retención del 100,00% en los 8 benchmarks oficiales de Z.ai frente al modelo original, pero no se publican los valores numéricos de MMLU, HumanEval, GSM8K ni de ningún otro benchmark en la información proporcionada. Los únicos datos cuantitativos disponibles son de rendimiento de inferencia:

| Metrica | Baseline (stock) | Chronos v7.5 | Ganancia |
|---|---|---|---|
| Decodificacion 1 stream | 0,18-1,70 tok/s (2D unpack) / 17,29 tok/s (NVFP4 stock) | 42,43 tok/s medio (36,2-54,68 tok/s) | 2,45x-31,6x |
| Decodificacion 4 streams | 46,50 tok/s | 49,74 tok/s | 1,07x |
| Huella en disco | 305,78 GB (FP8) | 92,58 GB / 72,91 GB / 59,76 GiB | 3,30x-4,43x |
| Pico de page-cache al cargar | +59,24 GiB | ~0,00 GiB | -59,24 GiB |
| Carga de capa MTP | 76,3 s | 1,2 s | 63,6x |
| Retencion de capacidades (8 suites) | 100,0% referencia | 100,00% | sin perdida declarada |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) con valores numericos en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM unificada: el checkpoint compacto ocupa 72,91 GB y los pesos activos NVFP4 59,76 GiB; el autor reserva 16,0 GiB para la caché KV de 1M tokens, lo que encaja en los 128 GB unificados de la DGX Spark GB10.
- GPU recomendadas: NVIDIA DGX Spark GB10 (objetivo principal, 128 GB LPDDR5X unificada); A100-80GB (el autor incluye telemetría de esta GPU en sus assets); GPUs con menos de 80 GB dedicados no se mencionan como viables para el checkpoint completo.
- GPU de consumo: no hay información que confirme que quepa en RTX 4090 (24 GB) ni en otras consumer GPU; el tamaño del checkpoint (72,91 GB mínimo) lo impide en una sola unidad.
- Opciones de despliegue: vLLM con el motor `pb27_vllm` y código personalizado (`custom_code`); el autor documenta un servidor vLLM y un CLI OpenCode. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: 42,43 tok/s medios y 54,68 tok/s de pico en un solo stream; 49,74 tok/s agregados con 4 streams, todo medido en DGX Spark GB10 según el autor.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| PseudoBrain-GLM-5.3-Flash-Chronos-v7.5 | 83,77B | 1.048.576 | Apache 2.0 | safetensors (vLLM) | Recompresion NVFP4 de GLM-5.3-Flash; 92,58 GB |
| zai-org/GLM-5.3-Flash (base) | 83,77B (misma arquitectura) | 1.048.576 | Apache 2.0 (heredada) | Block-FP8, safetensors | 305,78 GB; requiere multi-GPU |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | No se proporcionan datos de otros modelos comparables en la informacion disponible |

## Limitaciones y advertencias

- La compresión es agresiva: NVFP4 con retículas de 1 y 2 bits en las colas puede degradar tareas sensibles a precisión numérica; la retención del 100% en benchmarks es una afirmación del autor no verificada de forma independiente.
- El modelo es una variante abliterated/uncensored: carece de los mecanismos de rechazo del modelo base, lo que implica riesgos de generar contenido dañino y responsabilidad legal para quien lo despliegue.
- La licencia Apache 2.0 se hereda del modelo base, pero conviene verificar que la recompresión y la modificación abliterated cumplen los términos de la licencia original de Z.ai.
- Requiere el motor propietario `pb27_vllm` y kernels Triton personalizados; no es compatible con vLLM estándar sin ese código, lo que complica el mantenimiento y la portabilidad.
- La información de benchmarks de calidad es escasa: solo se publica la retención relativa, sin valores absolutos de MMLU, HumanEval, GSM8K ni de evaluación multilingüe.
- No se especifican los idiomas soportados ni el comportamiento fuera del inglés; el modelo base podría tener cobertura multilingüe, pero no está documentada en esta ficha.
- Riesgo de alucinación: no hay datos específicos publicados para esta variante; se asume el comportamiento del modelo base, no evaluado de forma independiente tras la compresión.
- El hardware objetivo es muy específico (DGX Spark GB10); el rendimiento en otras configuraciones, como A100-80GB, se menciona pero no se detalla en la información disponible.
- El autor promociona activamente su candidatura laboral y servicios de despliegue en la model card, lo que conviene tener en cuenta al interpretar las cifras de rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/defnoteatin/PseudoBrain-GLM-5.3-Flash-Chronos-v7.5
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Repositorio Chronos: https://github.com/defnotean/Chronos
- Paper de arquitectura Chronos (PDF): https://github.com/defnotean/Chronos/blob/main/docs/CHRONOS_ARCHITECTURE_PAPER.pdf
- Paper de arquitectura Chronos (Markdown): https://github.com/defnotean/Chronos/blob/main/docs/CHRONOS_ARCHITECTURE_PAPER.md
- Repositorio PseudoBrain: https://github.com/defnotean/pseudobrain
- Paper de arquitectura PseudoBrain (PDF): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.pdf
- Telemetria de hardware y benchmarks: https://github.com/defnotean/Chronos/tree/main/assets
- Perfil del autor en GitHub: https://github.com/defnotean
- Perfil del autor en Hugging Face: https://huggingface.co/defnoteatin
