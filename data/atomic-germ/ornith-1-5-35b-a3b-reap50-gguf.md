# Atomic-Germ/Ornith-1.5-35B-A3B-REAP50-GGUF

## Resumen

Ornith-1.5-35B-A3B-REAP50-GGUF es una versión cuantizada en formato GGUF del modelo Ornith-1.5-35B-A3B (desarrollado por ornith-ai) tras aplicarle un pruning de expertos del 50 % mediante la técnica REAP. El modelo original es un híbrido Gated-DeltaNet + Mixture-of-Experts con arquitectura `qwen3_5_moe`, 35 000 millones de parámetros totales y aproximadamente 3 000 millones activos por token. Tras el pruning, la capa MoE pasa de 256 a 128 expertos, se elimina la cabeza MTP (multi-token prediction) y se retira la torre de visión (333 tensores), quedando un modelo de unos 19 000 millones de parámetros totales. La conversión a GGUF la firma Ttimms, aunque el repositorio consultado está publicado por Atomic-Germ.

La relevancia de esta ficha está en que, según la model card, es probablemente el primer GGUF publicado de un modelo podado al 50 % con REAP. Eso permite ejecutar un modelo de clase 35B-A3B en hardware de consumo: la cuantización Q4_K_M ocupa 11,4 GB y cabe en una GPU de 16 GB dejando margen para contexto, con la ventaja de que al ser MoE con ~3B activos la inferencia en CPU y Apple Silicon es rápida para su tamaño. La licencia MIT y el formato GGUF lo hacen directamente desplegable en llama.cpp, LM Studio, koboldcpp, Jan y text-generation-webui.

Se trata, por tanto, de una pieza orientada a código y agentes: la model card reporta HumanEval+ 84,2 %, MBPP+ 89,2 % y SWE-bench Verified 44,0 % medidos sobre la versión NVFP4A16 previa a la cuantización GGUF, no sobre los ficheros GGUF en sí. El modelo solo declara soporte para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Gated-DeltaNet + MoE (identificador `qwen3_5_moe` / `qwen35moe` en llama.cpp) |
| Parametros totales | ~19B tras pruning REAP-50 (base: 35B-A3B, 256 expertos). El metadato de safetensors del repo indica 526.251.520, dato no coherente con la model card |
| Parametros activos | ~3B (MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q4_K_M, Q5_K_M, Q6_K, Q8_0. Repositorio hermano: NVFP4A16 (GPTQ, para vLLM) y bf16 podado |
| Idiomas soportados | en |
| Licencia | MIT (heredada de ornith-ai/Ornith-1.5-35B-A3B) |
| Formato de pesos | GGUF (los safetensors bf16 están en el repo fuente) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es un transformer híbrido que combina capas Gated-DeltaNet (una familia de atención lineal con estado recurrente) con capas de mezcla de expertos, empaquetado bajo la arquitectura `qwen3_5_moe`. La capa MoE original cuenta con 256 expertos y un presupuesto de cómputo de unos 3 000 millones de parámetros activos por token, además de una cabeza MTP (multi-token prediction) orientada a decodificación especulativa. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

Sobre esa base se aplica un pruning de expertos REAP del 50 %, reduciendo de 256 a 128 expertos, con un arreglo de renornalización del router (router-renormalization fix) respecto a la implementación original de CerebrasResearch. A continuación se elimina la cabeza MTP (verificada como recargable, 1 → 0) y se retira la torre de visión (333 tensores), lo que explica que el modelo resultante sea exclusivamente de texto y no pueda usarse para decodificación especulativa con MTP. El pipeline completo se ejecutó en una RTX 5070 Ti (SM120), con una cuantización GPTQ-NVFP4A16 de aproximadamente 5,5 horas que produjo 12,47 GiB. Los ficheros GGUF se obtienen convirtiendo la fuente bf16 podada mediante `convert_hf_to_gguf.py --no-mtp`.

## Capacidades

- Generación de texto y conversación multi-turno en inglés.
- Generación de código: la model card reporta HumanEval+ 84,2 % y MBPP+ 89,2 % sobre la variante NVFP4A16.
- Resolución de tareas de ingeniería de software sobre repositorios reales: SWE-bench Verified 44,0 %.
- Modo de pensamiento (thinking) activado por defecto en la plantilla de chat; se puede desactivar con `"chat_template_kwargs": {"enable_thinking": false}` para obtener respuestas más ancladas al contexto.
- Inferencia local en CPU y Apple Silicon con rendimiento alto para su tamaño, gracias a los ~3B parámetros activos.
- No soporta visión: la torre de visión fue eliminada durante el pipeline de pruning.
- No soporta decodificación especulativa basada en MTP: la cabeza MTP fue eliminada.
- No se documenta soporte de tool calling, function calling ni capacidades de agente multi-paso en la información disponible.
- Soporte multilingüe limitado al inglés declarado.

## Casos de uso

- Asistente de programación en local: con HumanEval+ 84,2 % y 11,4 GB en Q4_K_M, puede desplegarse en una estación de trabajo con una GPU de 16 GB y usarse como autocompletado y generación de funciones sin enviar código a servicios externos.
- Reparación de bugs sobre repositorios reales: el 44,0 % en SWE-bench Verified lo sitúa como candidato para agentes que leen un repositorio, localizan el fallo y proponen un parche, siempre con revisión humana por el margen de error restante.
- Revisión de código en pipelines de CI/CD: integrado vía `llama-server` con una API compatible con OpenAI, puede ejecutarse como paso de análisis estático semántico sobre los diffs de un pull request.
- Generación de tests unitarios: dado un módulo, el modelo produce casos de prueba en lenguajes como Python, aprovechando el entrenamiento en código y su ventana de razonamiento en modo thinking.
- Inferencia en portátil o Apple Silicon: al tener ~3B activos y ofrecer builds GGUF de llama.cpp, permite ejecutar un modelo de clase 19B podado con offload parcial a CPU cuando la VRAM es insuficiente para Q8_0.
- Despliegue en hardware de gama media para equipos pequeños: Q6_K (15,3 GB) ofrece calidad casi sin pérdida en GPUs de 16 GB ajustando el presupuesto de KV, útil para entornos donde no hay clúster.
- Experimentación en investigación sobre pruning: sirve como punto de comparación reproducible entre 256 y 128 expertos, y entre las variantes bf16, NVFP4A16 y GGUF del mismo modelo podado.
- Procesamiento por lotes de documentación técnica en inglés: la estructura MoE permite throughput alto por token generado en comparación con un denso equivalente de 19B.

## Benchmarks y rendimiento

Los resultados publicados corresponden a la variante NVFP4A16 y se midieron antes de la conversión a GGUF, con una única pasada greedy; la propia model card advierte de que existe dispersión entre ejecuciones y remite a la tarjeta NVFP4A16 para más detalle.

| Benchmark | Resultado | Condiciones |
|---|---|---|
| HumanEval+ | 84,2 % | NVFP4A16, greedy único, previo a cuantización GGUF |
| MBPP+ | 89,2 % | NVFP4A16, greedy único, previo a cuantización GGUF |
| SWE-bench Verified | 44,0 % | NVFP4A16, greedy único, previo a cuantización GGUF |

No se han publicado resultados de benchmarks sobre los ficheros GGUF concretos de este repositorio, ni comparaciones numéricas con otros modelos en la información disponible.

## Requisitos de hardware

- Q4_K_M (11,4 GB): opción recomendada; cabe en GPUs de 16 GB con margen para contexto.
- Q5_K_M (13,3 GB): mayor calidad, presupuesto de KV más ajustado en 16 GB.
- Q6_K (15,3 GB): prácticamente sin pérdida; muy poco margen en 16 GB.
- Q8_0 (19,7 GB): requiere más de 16 GB de VRAM u offload a CPU.
- NVFP4A16 (12,47 GiB): formato para vLLM, no GGUF.
- GPU de referencia del pipeline: RTX 5070 Ti (SM120).
- Cabe en GPU de consumo con 16 GB (RTX 4080/4090/5070 Ti y equivalentes) usando Q4_K_M o Q5_K_M; en GPUs de 24 GB se puede usar Q6_K o Q8_0 con contexto amplio.
- Al tener ~3B activos, la inferencia en CPU y Apple Silicon es rápida para un modelo de este tamaño total.
- Opciones de despliegue: llama.cpp (`llama-server -m <fichero>.gguf -ngl 99`), LM Studio, koboldcpp, Jan, text-generation-webui. Ollama queda pendiente de que su llama.cpp embebido incorpore esta arquitectura.
- Requiere una versión reciente de llama.cpp que soporte la arquitectura híbrida `qwen35moe`; verificado con compilación desde fuente.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Expertos | Formato | Licencia | Uso |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (base) | 35B totales, ~3B activos | 256 | safetensors bf16 (~65 GB) | MIT | Entrenamiento, re-cuantización, referencia de calidad |
| Ornith-1.5-35B-A3B-REAP-50-bf16 | ~19B totales, ~3B activos | 128 | safetensors bf16 | MIT | Re-cuantización y merging |
| Ornith-1.5-35B-A3B-REAP-50-NVFP4A16 | ~19B totales | 128 | NVFP4A16 (12,47 GiB) | MIT | vLLM, máxima calidad publicada |
| Ornith-1.5-35B-A3B-REAP50-GGUF (este) | ~19B totales, ~3B activos | 128 | GGUF (11,4-19,7 GB) | MIT | Inferencia local en llama.cpp y derivados |

No se dispone en la información proporcionada de datos comparativos con modelos de otras familias de tamaño similar (por ejemplo, MoE de ~30B con ~3B activos), por lo que no se incluyen cifras de terceros.

## Limitaciones y advertencias

- Solo declara soporte de inglés; no hay evidencia de capacidades multilingües.
- No hay datos publicados sobre la longitud de contexto soportada; conviene verificarla empíricamente antes de diseñar flujos con contexto largo.
- Los benchmarks proceden de la variante NVFP4A16, no de los GGUF; las cuantizaciones Q4_K_M y Q5_K_M pueden degradar el rendimiento respecto a esas cifras.
- Las métricas se obtuvieron con una única pasada greedy, sin intervalos de confianza; la model card advierte de dispersión entre ejecuciones.
- SWE-bench Verified 44,0 % implica que más de la mitad de las tareas no se resuelven; no es apto para parcheo autónomo sin revisión.
- El pruning REAP del 50 % puede degradar capacidades específicas de dominios cubiertos por los expertos eliminados; no se han publicado evaluaciones por área.
- No hay visión (torre eliminada), ni decodificación especulativa MTP (cabeza eliminada), ni tool calling documentado.
- La plantilla de chat activa el modo thinking por defecto; en tareas que requieren respuestas ancladas conviene desactivarlo, con el coste de razonamiento que ello implica.
- Requiere una versión reciente de llama.cpp con soporte de `qwen35moe`; Ollama aún no lo soporta con su llama.cpp embebido.
- Existe una incoherencia entre el metadato de safetensors del repositorio (526.251.520 parámetros) y el tamaño declarado en la model card (~19B); conviene tratarlo como un artefacto de medición y no como el tamaño real del modelo.
- El repositorio consultado figura a nombre de Atomic-Germ, mientras que la model card y los enlaces apuntan a Ttimms como autor de la cuantización; verificar la procedencia antes de usarlo en producción.
- Licencia MIT: permite uso comercial, pero se hereda del modelo base y conviene revisar el fichero LICENSE enlazado en la model card.

## Enlaces

- Repositorio HuggingFace (este modelo): https://huggingface.co/Atomic-Germ/Ornith-1.5-35B-A3B-REAP50-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Licencia del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B/blob/main/LICENSE
- Variante NVFP4A16 (vLLM): https://huggingface.co/Ttimms/Ornith-1.5-35B-A3B-REAP-50-NVFP4A16
- Fuente bf16 podada: https://huggingface.co/Ttimms/Ornith-1.5-35B-A3B-REAP-50-bf16
- Pipeline y benchmarks: https://github.com/t-timms/ornith-nvfp4
- Implementación de REAP: https://github.com/CerebrasResearch/reap
- llama.cpp: https://github.com/ggml-org/llama.cpp
- LM Studio: https://lmstudio.ai/
- koboldcpp: https://github.com/LostRuins/koboldcpp
- Jan: https://jan.ai/
- text-generation-webui: https://github.com/oobabooga/text-generation-webui
