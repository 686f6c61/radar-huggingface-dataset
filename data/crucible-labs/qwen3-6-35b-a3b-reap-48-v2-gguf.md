# crucible-labs/Qwen3.6-35B-A3B-REAP-48-v2-GGUF

## Resumen

Qwen3.6-35B-A3B-REAP-48-v2-GGUF es una versión podada y cuantizada del modelo base Qwen3.6-35B-A3B, desarrollada por crucible-labs. El modelo original es un mixture-of-experts (MoE) de 35.000 millones de parámetros con aproximadamente 3.000 millones activos por token, construido sobre una arquitectura híbrida que alterna capas de atención con capas Gated DeltaNet. Esta versión elimina el 48% de los expertos enrutados mediante la técnica REAP y aplica una cuantización GGUF con asignación de bits por tensor basada en mediciones de sensibilidad. El resultado es un archivo de 8,78 GiB que mantiene un rendimiento elevado en generación de código y tool calling, con una fidelidad notablemente mejor que la versión anterior (v1).

La relevancia de este modelo radica en que ofrece una alternativa eficiente para inferencia local en hardware de consumo, sin renunciar a capacidades avanzadas como la llamada a funciones y la generación de código. Los benchmarks declarados por el autor alcanzan un 90,9% en HumanEval+, un 75,7% en MBPP+ y un 93,2% en BFCL (simple). Al tratarse de una segunda versión, incorpora mejoras en la calibración de la matriz de importancia, la reasignación de bits entre tensores y la asignación por capas, lo que se traduce en una menor divergencia KL respecto al modelo sin cuantizar.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con capas híbridas de atención y Gated DeltaNet (según documentación del modelo base); podado con REAP al 48% de los expertos enrutados |
| Parámetros totales | 19.173.552.768 |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens nativos, extensible a 1.010.000 (heredado del modelo base Qwen3.6-35B-A3B) |
| Tipos de cuantizacion | GGUF mixto con IQ3_S, IQ4_XS, Q4_K, Q5_K, Q6_K, Q8_0 (asignación por tensor medida) |
| Idiomas soportados | Inglés (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura híbrida que combina capas de atención con capas Gated DeltaNet, una variante de state space model (SSM) que reduce el coste de la atención en secuencias largas. Esta versión de crucible-labs no es un entrenamiento desde cero, sino un proceso de pruning y cuantización sobre el modelo base. La poda se realiza con REAP, que elimina el 48% de los expertos enrutados (routed experts), dejando intactos el experto compartido y las capas de atención. Posteriormente, el modelo se cuantiza a GGUF utilizando una matriz de importancia (imatrix) calibrada con el propio chat template del modelo, en lugar de texto plano sin marcadores de rol. Esta decisión mejora la medición de las estadísticas de activación.

La asignación de bits se realiza por tensor y por capa, basándose en la divergencia KL medida entre el modelo cuantizado y el modelo en f16. El autor destaca que la energía cruda de la imatrix no es comparable entre roles de tensor, por lo que utiliza métricas de sensibilidad más fiables. El presupuesto de bits se redistribuye: los expertos enrutados reciben IQ3_S, IQ4_XS o Q4_K según la capa, el experto compartido pasa a Q5_K–Q8_0, y los tensores de atención más sensibles se protegen con Q8_0. No se mencionan procesos de RLHF o DPO en esta versión.

## Capacidades

- Generación de texto y código con alta precisión: alcanza 90,9% pass@1 en HumanEval+ y 75,7% en MBPP+.
- Tool calling / function calling: 93,2% de precisión en BFCL (simple), lo que indica una integración fiable con APIs y herramientas externas.
- Soporte para agentes y razonamiento multi-paso: la combinación de tool calling y generación de código permite construir flujos de trabajo autónomos.
- Conversación multi-turno: el modelo conserva el formato de chat del modelo base, con soporte para turnos largos gracias al contexto amplio.
- Razonamiento técnico: el modelo base está optimizado para tareas de programación y análisis, y esta versión mantiene esas capacidades según los benchmarks.
- Capacidades multilingües: limitadas al inglés, según la model card.

## Casos de uso

- Asistente de programación en IDE: el modelo puede integrarse en extensiones de VS Code o JetBrains para autocompletar código, generar tests unitarios y refactorizar funciones. Su 90,9% en HumanEval+ lo hace adecuado para tareas de síntesis de código.
- Generación de código en pipelines CI/CD: con soporte de tool calling, puede invocar comandos de build, analizar errores de compilación y proponer parches automáticamente. El formato GGUF permite desplegarlo en entornos de integración continua con llama.cpp.
- Agentes autónomos con tool calling: el 93,2% en BFCL (simple) indica que puede orquestar llamadas a APIs, consultar bases de datos o gestionar sistemas externos. Es útil para automatizar tareas administrativas o de monitorización.
- Atención al cliente técnica: gracias a su ventana de contexto de 262K tokens, puede mantener conversaciones extensas con usuarios, recordando detalles de incidencias anteriores y generando respuestas precisas sobre productos o servicios.
- Análisis de logs y depuración: el modelo puede procesar trazas de error, identificar patrones y sugerir soluciones. Su capacidad de razonamiento técnico y generación de código permite automatizar parte del diagnóstico en sistemas de observabilidad.
- Documentación técnica automatizada: a partir de código fuente, puede generar documentación de API, comentarios de funciones y guías de uso. El tool calling permite integrarse con repositorios y extraer metadatos de forma estructurada.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados externamente):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Code Generation | HumanEval+ | pass@1 | 0,909 |
| Code Generation | MBPP+ | pass@1 | 0,757 |
| Tool Calling | BFCL (simple) | accuracy | 0,932 |

Comparación interna con la versión anterior (v1), misma máquina y mismo corpus, respecto al modelo f16:

| Métrica | v1 | v2 | Mejora |
|---|---|---|---|
| Mean KL-divergence | 0,034093 | 0,019609 | −42,5% |
| Median KL-divergence | 0,002489 | 0,001186 | −52,4% |
| 99th-pct KL-divergence | 0,536331 | 0,327945 | −38,9% |
| Excess perplexity sobre f16 | 0,037205 | 0,022679 | −39,0% |
| RMS Δp | 6,294% | 4,919% | −21,8% |
| Top-1 agreement con f16 | 94,678% | 96,199% | +1,52pp |

Rendimiento medido en un Mac Mini M4 con 16 GB unificados, usando llama-bench con `-p 512 -n 128 -ngl 999 -fa 1 -r 3`:

| | v1 | v2 |
|---|---|---|
| Prefill (pp512) | 411,29 t/s | 417,18 t/s |
| Decode (tg128) | 26,71 t/s | 29,24 t/s |

## Requisitos de hardware

- El archivo GGUF pesa 8,78 GiB. Para inferencia en GPU se necesita al menos esa cantidad de VRAM para cargar los pesos, más la memoria de la KV cache.
- En un Mac Mini M4 con 16 GB unificados, el modelo funciona con Metal y alcanza 417 t/s de prefill y 29 t/s de decode, según las mediciones del autor.
- Para contextos cortos, una GPU con 12 GB de VRAM (por ejemplo, RTX 3060 12GB) puede ser suficiente. Para contextos largos, se recomienda una GPU con 24 GB (RTX 3090, RTX 4090) o más.
- El autor indica que los i-quants (IQ3_S, IQ4_XS) son más rápidos en Metal y ROCm, pero no han sido medidos en CUDA, Vulkan ni CPU. En esos backends, el rendimiento puede variar.
- Opciones de despliegue: llama.cpp y herramientas compatibles como LM Studio, koboldcpp, Jan y Unsloth Studio.
- No se han publicado datos de latencia o throughput para otras configuraciones de hardware.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | HumanEval+ | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-REAP-48-v2 | 19,17B | no disponible | 262K | 90,9% (declarado) | Apache 2.0 | GGUF |
| Qwen3.6-35B-A3B-REAP-48-v1 | 19,17B | no disponible | no disponible | no disponible | Apache 2.0 | GGUF |
| Qwen3.6-35B-A3B (base) | 35B | ~3B | 262K | no disponible | no disponible | Safetensors / GGUF |

La comparativa se basa en la información disponible. El modelo base no podado tiene más parámetros y probablemente mayor calidad general, pero no se han presentado benchmarks en la información proporcionada. La v1 es la versión anterior de este mismo modelo, con peor fidelidad según las métricas de KL-divergence.

## Limitaciones y advertencias

- Los benchmarks declarados (HumanEval+, MBPP+, BFCL) no están verificados externamente (verified: false).
- La poda del 48% de los expertos enrutados puede reducir la calidad en tareas no evaluadas, especialmente razonamiento complejo o generación multilingüe.
- El modelo solo está declarado en inglés; no hay evidencia de soporte para otros idiomas en esta versión.
- La cuantización con i-quants puede tener un rendimiento variable en backends no probados (CUDA, Vulkan, CPU). El autor recomienda realizar un benchmark propio antes de adoptar el modelo en producción.
- Es una versión podada y cuantizada, no el modelo base completo. Las capacidades pueden diferir del original, y no se han publicado datos de seguridad, sesgos o alineación.
- Riesgo de alucinación: como en cualquier modelo generativo, existe. No se han proporcionado datos específicos sobre este modelo.
- La licencia Apache 2.0 permite uso comercial, pero es necesario revisar los requisitos de atribución y las condiciones de la licencia del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/crucible-labs/Qwen3.6-35B-A3B-REAP-48-v2-GGUF
- Versión anterior (v1): https://huggingface.co/crucible-labs/Qwen3.6-35B-A3B-REAP-48-Q3K-mixed-GGUF
- Cuantizaciones del modelo base: https://huggingface.co/unsloth/Qwen3.6-35B-A3B-GGUF
- Blog sobre Qwen3.6-35B-A3B: https://www.labellerr.com/blog/qwen3-6-35b-a3b-open-source-ai-model/
- Guía de cuantizaciones y ejecución: https://allthings.how/qwen3-6-35b-a3b-gguf-quants-sizes-and-how-to-run-it/
