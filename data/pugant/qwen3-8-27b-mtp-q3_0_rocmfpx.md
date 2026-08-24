# pugant/Qwen3.8-27B-MTP-Q3_0_ROCMFPX

## Resumen

El modelo `pugant/Qwen3.8-27B-MTP-Q3_0_ROCMFPX` es una cuantización en formato GGUF del modelo denso Qwen3.8-27B de Alibaba, realizada por el usuario pugant con el fork ROCmFPX de llama.cpp. Se distribuye en dos variantes: `base` (Q3_0_ROCMFPX, 4.44 bpw efectivos) y `agent` (Q3_0_ROCMFPX_AGENT, 5.72 bpw efectivos), ambas con la capa de predicción multi-token (MTP) incluida, lo que permite decodificación especulativa en servidores compatibles.

El modelo base Qwen3.8-27B es un transformer denso de 27.320 millones de parámetros con arquitectura híbrida: 48 capas gated-deltanet y 16 capas full-attention, con un intervalo de atención completa de 4 y una ventana de contexto nativa de 262.144 tokens. La cuantización está orientada exclusivamente a hardware AMD RDNA 3.5 (gfx1151, Strix Halo) y utiliza tipos de tensor GGML 4 (`q3_0_rocmfpx`) que no son compatibles con el llama.cpp estándar.

La relevancia de esta publicación radica en que documenta de forma reproducible los resultados de una cuantización FP3 (3 bits) aplicada a una arquitectura híbrida, demostrando que en este modelo el tipo de bloque de 3 bits no alcanza a los tensores de atención, por lo que la densidad efectiva es mayor de lo esperado. El autor la publica como datos de investigación y como archivos GGUF para usuarios del fork ROCmFPX, aunque reconoce que la variante `base` es superada en todos los ejes por la preset FP4 `STRIX_LEAN` del mismo autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido (48 capas gated-deltanet + 16 capas full-attention, `full_attention_interval=4`) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | No aplica (modelo denso, sin mezcla de expertos) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | Q3_0_ROCMFPX (base, 4.44 bpw) y Q3_0_ROCMFPX_AGENT (agent, 5.72 bpw) |
| Idiomas soportados | Inglés, multilingüe |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (solo compatible con fork ROCmFPX de llama.cpp, tipo GGML 104) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso que combina dos mecanismos de atención: 48 capas con atención gated-deltanet (una variante eficiente de atención lineal con compuertas) y 16 capas con atención completa tradicional, intercaladas con un intervalo de 4. Esta arquitectura híbrida está diseñada para ofrecer un buen equilibrio entre calidad y eficiencia en hardware local, y es la base sobre la que se aplicó la cuantización.

La cuantización fue realizada por pugant con el fork ROCmFPX de llama.cpp, usando presets de precisión FP3. El proceso incluye una matriz de importancia (importance matrix) calibrada sobre un corpus intercalado de trazas de código agéntico, prosa italiana y código real, publicada en un repositorio separado. La capa MTP (multi-token prediction) se incluye en ambos archivos GGUF, con los tensores `nextn.*` y `nextn_predict_layers=1`, lo que permite decodificación especulativa con el flag `--spec-type draft-mtp`. No se dispone de información sobre el proceso de entrenamiento del modelo base (datos, tokens, RLHF) en la documentación de esta cuantización.

## Capacidades

- Generación de texto: el modelo base es un LLM denso de 27B con capacidad de generación de texto en inglés y otros idiomas.
- Razonamiento y matemáticas: el modelo base de Qwen destaca en tareas de razonamiento lógico y matemático, aunque no se aportan benchmarks específicos en esta cuantización.
- Generación de código: el modelo base es especialmente valorado para tareas de programación y agentes de codificación.
- Agentes y multi-step reasoning: la variante `agent` está optimizada para escenarios de agente, con mayor densidad efectiva (5.72 bpw) para preservar más calidad en los tensores de atención.
- Decodificación especulativa con MTP: la capa de predicción multi-token permite acelerar la generación con el flag `--spec-type draft-mtp` en el fork ROCmFPX.
- Multilingüe: el modelo base soporta múltiples idiomas, aunque la documentación específica solo inglés y multilingüe.

## Casos de uso

- Asistente local de código en hardware AMD: con una GPU Radeon 8060S (Strix Halo) y 128 GB de memoria unificada, se puede ejecutar la variante `base` para autocompletar código y generar scripts en entornos de desarrollo locales sin conexión a la nube.
- Agente conversacional con contexto largo: la variante `agent` (18.2 GiB) es adecuada para chatbots que deben mantener conversaciones de muchos turnos, gracias a la ventana de 262K tokens y la mejor calidad de atención.
- Investigación sobre cuantización de arquitecturas híbridas: los archivos GGUF y los datos de benchmarks se pueden usar para comparar presets de cuantización (FP3 vs FP4) en arquitecturas gated-deltanet, sirviendo como referencia reproducible.
- Desarrollo de aplicaciones con decodificación especulativa: la capa MTP integrada permite probar y optimizar el rendimiento de generación con el flag `draft-mtp` en el fork ROCmFPX, útil para reducir la latencia en aplicaciones interactivas.
- Despliegue en entornos AMD sin NVIDIA: a diferencia de otras cuantizaciones, esta está específicamente diseñada para RDNA 3.5, por lo que se puede usar en equipos con APU Ryzen AI Max+ que no tienen GPU NVIDIA.
- Prototipado de agentes autónomos: la variante `agent` está pensada para ejecutar agentes que realizan razonamiento multi-paso y llamadas a herramientas, aunque la documentación no detalla el soporte de tool calling específico.

## Benchmarks y rendimiento

El autor publicó una tabla de benchmarks obtenida en hardware AMD Ryzen AI Max+ 395 con Radeon 8060S (gfx1151, 128 GB unificado), usando Vulkan RADV, el 2026-08-23. La perplexidad se midió con `llama-perplexity -c 512 -b 512 -fa on -ngl 999` sobre wikitext-2-en (150k tokens) y un corpus técnico italiano (51.5k tokens). La referencia BF16 del modelo base es 6.6409 (en) y 11.7156 (it). Los valores de tg128 y pp512 se midieron con `llama-bench -p 512 -n 128 -fa 1 -ngl 999 -r 5`.

| Arm | Preset | eff. bpw | Size | PPL en (Δ vs BF16) | PPL it (Δ) | tg128 | pp512 |
|---|---:|---:|---:|---:|---:|---:|
| STRIX_LEAN (baseline) | Q4_0_ROCMFP4_STRIX_LEAN | 4.38 | 13.82 GiB | 6.8226 (+2.74%) | 12.1168 (+3.42%) | 13.06 ± 1.34 | 340.96 ± 6.09 |
| base (este) | Q3_0_ROCMFPX | 4.44 | 14.125 GiB | 6.9943 (+5.32%) | 12.3121 (+5.09%) | 11.02 ± 1.47 (−15.6%) | 264.89 ± 5.16 (−22.3%) |
| agent (este) | Q3_0_ROCMFPX_AGENT | 5.72 | 18.198 GiB | 6.7665 (+1.89%) | 11.9541 (+2.04%) | 8.92 ± 1.01 (−31.7%) | 298.74 ± 10.63 (−12.4%) |

Interpretación del autor: la variante `base` es estrictamente dominada por la preset `STRIX_LEAN` (peor perplexity, menor velocidad de generación y mayor tamaño). La variante `agent` recupera calidad (más cercana a BF16) pero paga con mayor tamaño (5.72 bpw) y una caída del 31.7% en velocidad de generación. El autor concluye que el preset FP4 `STRIX_LEAN` es la opción Pareto en gfx1151.

## Requisitos de hardware

- VRAM estimada: la variante `base` ocupa 14.125 GiB y la `agent` 18.198 GiB. Se necesitan al menos esas cantidades de memoria disponible para cargar el modelo.
- GPU recomendada: AMD Radeon 8060S (gfx1151, RDNA 3.5) en un sistema Strix Halo con 128 GB de memoria unificada LPDDR5X. El modelo ha sido probado exclusivamente en esa plataforma.
- No es compatible con GPU NVIDIA ni con llama.cpp estándar; se requiere el fork ROCmFPX con soporte para GGML tipo 104.
- No cabe en GPU de consumo típicas de 8-12 GB de VRAM; es necesario un sistema con memoria unificada o GPU con al menos 16-20 GB.
- Opciones de despliegue: `llama-server` del fork ROCmFPX (build Vulkan o HIP). Se puede usar con flags como `-ngl 999`, `--jinja`, `--spec-type draft-mtp` para decodificación especulativa.
- Rendimiento: en la plataforma de prueba, la variante `base` alcanza 11.02 tokens/s de generación y 264.89 tokens/s de preprocesamiento (pp512); la `agent` baja a 8.92 tokens/s de generación y 298.74 tokens/s de preprocesamiento. Son valores dependientes del hardware.

## Comparativa con modelos similares

La comparativa se hace con la propia familia Qwen3.8-27B en diferentes cuantizaciones, ya que no se dispone de datos de otros modelos de 27B en esta documentación.

| Modelo | Arquitectura | bpw efectivo | Tamaño | PPL en (Δ vs BF16) | tg128 (tokens/s) | Licencia |
|---|---|---|---|---|---|---|
| Qwen3.8-27B BF16 | Denso híbrido | 16 | ~55 GiB | 6.6409 (ref) | no medido | Apache-2.0 |
| Qwen3.8-27B Q4_0_ROCMFP4_STRIX_LEAN | Denso híbrido | 4.38 | 13.82 GiB | 6.8226 (+2.74%) | 13.06 | Apache-2.0 |
| Qwen3.8-27B Q3_0_ROCMFPX (este) | Denso híbrido | 4.44 | 14.125 GiB | 6.9943 (+5.32%) | 11.02 | Apache-2.0 |
| Qwen3.8-27B Q3_0_ROCMFPX_AGENT (este) | Denso híbrido | 5.72 | 18.198 GiB | 6.7665 (+1.89%) | 8.92 | Apache-2.0 |

La preset `STRIX_LEAN` (FP4) supera a la variante `base` en calidad y velocidad, y a la `agent` en velocidad, con un tamaño menor. La variante `agent` es la más cercana a BF16 en perplexidad, pero a costa de más tamaño y menor velocidad.

## Limitaciones y advertencias

- Compatibilidad: los archivos GGUF usan el tipo GGML 104 (`q3_0_rocmfpx`), que solo es compatible con el fork ROCmFPX de llama.cpp. No se cargarán en llama.cpp estándar (error `invalid ggml type`).
- Hardware específico: el modelo ha sido probado únicamente en AMD Radeon 8060S (gfx1151, Strix Halo). No se garantiza su funcionamiento en otras GPU AMD o NVIDIA.
- No es un 3-bit real: la cuantización FP3 no alcanza a los tensores de atención, que se protegen con K-quants, resultando en una densidad efectiva de 4.44-5.72 bpw, superior al objetivo inicial.
- La variante `base` es superada por la preset `STRIX_LEAN` en todos los ejes (calidad, velocidad, tamaño), por lo que no se recomienda para uso práctico. La variante `agent` ofrece mejor calidad pero a costa de un tamaño mayor y una velocidad de generación menor.
- Riesgo de alucinación y sesgos: no se dispone de evaluación específica de sesgos o alucinaciones para esta cuantización. El modelo base puede heredar sesgos de los datos de entrenamiento de Qwen.
- Sin garantías de producción: el autor la publica como datos de investigación reproducible, no como un modelo listo para producción. No hay evaluaciones de seguridad ni de robustez.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/pugant/Qwen3.8-27B-MTP-Q3_0_ROCMFPX
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Fork ROCmFPX de llama.cpp: https://github.com/charlie12345/ROCmFPX
- Matriz de importancia: https://huggingface.co/pugant/Qwen3.8-27B-imatrix
- Preset de comparación STRIX_LEAN: https://huggingface.co/pugant/Qwen3.8-27B-MTP-Q4_0_ROCMFP4_STRIX_LEAN
- Dataset de calibración (grug-think-v3-10k): https://huggingface.co/datasets/ProCreations/grug-think-v3-10k
- Blog de AMD sobre Qwen3.8-27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Repositorio oficial de Qwen3.8-27B en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Análisis de MTP en Qwen3.8-27B: https://github.com/sudoingX/qwen38-mtp
