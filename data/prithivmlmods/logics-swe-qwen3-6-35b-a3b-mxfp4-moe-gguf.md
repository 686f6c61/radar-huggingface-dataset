# prithivMLmods/Logics-SWE-Qwen3.6-35B-A3B-MXFP4-MoE-GGUF

## Resumen

Logics-SWE-Qwen3.6-35B-A3B-MXFP4-MoE-GGUF es una cuantización GGUF del modelo Logics-SWE-Qwen3.6-35B-A3B, un modelo de ingeniería de software desarrollado por Logics-MLLM y cuantizado por prithivMLmods. El modelo base se construye sobre Qwen3.6-35B-A3B, una arquitectura MoE de 35 mil millones de parámetros totales (34.660.610.688 según safetensors) con aproximadamente 3 mil millones de parámetros activos por token (A3B), lo que permite inferencia rápida sin sacrificar capacidad.

Su propósito es servir como agente de código a nivel de repositorio: exploración de código, depuración, edición y pruebas. Se entrena mediante destilación multi-profesor on-policy consciente de categorías (MOPD), con un pipeline de tres etapas que clasifica tareas de repositorio, entrena tres expertos especializados Qwen3.6-27B con la estrategia Refresh–Repair–Expand (RRE) y destila su conocimiento en el estudiante de 35B-A3B. Fue entrenado con 2.553 instancias del dataset Logics-SWE-Env-2.5K.

Esta variante MXFP4 es especialmente relevante para hardware NVIDIA Blackwell (RTX Pro 6000, RTX 50-series, B200, B300), ya que aprovecha los Tensor Cores FP4 nativos. En pruebas oficiales sobre una RTX PRO 6000 Blackwell con 96 GB de VRAM alcanza 210,22 tokens/s de generación ocupando solo 19,06 GiB de VRAM, con licencia Apache 2.0 que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Qwen3.6-35B-A3B, qwen3_5_moe) |
| Parametros totales | 34.660.610.688 (34,66 B) |
| Parametros activos | ~3 B (A3B) |
| Longitud de contexto | 16.384 tokens en la prueba documentada (limite nativo no disponible) |
| Tipos de cuantizacion | BF16, MXFP4_MOE, Q3_K_L, Q5_K_M, Q6_K, Q8_0 (más mmproj BF16 y Q8_0) |
| Idiomas soportados | Inglés (según model card; benchmarks multilingües de código incluidos) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp; el modelo base admite vLLM vía API compatible con OpenAI) |

## Arquitectura y entrenamiento

El modelo base es un transformer mixture-of-experts de la familia Qwen3.6 con 35 B de parámetros totales y 3 B activos por token, lo que reduce drásticamente el coste computacional por inferencia manteniendo la capacidad representacional del modelo completo. La variante aquí descrita añade cuantización MXFP4 sobre los expertos, optimizada para los Tensor Cores FP4 de la arquitectura Blackwell (SM120, GB202) de NVIDIA.

El entrenamiento del modelo base sigue un pipeline de tres etapas denominado MOPD (multi-teacher on-policy distillation, destilación on-policy multi-profesor consciente de categorías): primero, un sistema llamado SWE Labeler clasifica las tareas de repositorio del dataset Logics-SWE-Env-2.5K (2.553 instancias); después, se entrenan tres expertos especializados Qwen3.6-27B mediante la estrategia Refresh–Repair–Expand (RRE) con aprendizaje por refuerzo y post-entrenamiento agéntico; finalmente, la guía de los tres expertos se destila en un único estudiante de 35B-A3B. La model card indica que la decodificación especulativa (MTP) no está activada en las pruebas realizadas. El repo incluye ficheros mmproj (proyección multimodal) en BF16 y Q8_0, lo que sugiere capacidades de visión, aunque la model card no las documenta en detalle.

## Capacidades

- Generación de código a nivel de repositorio: exploración de codebases, depuración, edición de código y ejecución de pruebas.
- Resolución de tareas de ingeniería de software tipo SWE-bench, con mejoras documentadas frente al modelo base en todas las variantes del benchmark.
- Razonamiento sobre código y matemáticas (los tests de rendimiento incluyen problemas de listas enlazadas en C y problemas de razonamiento cuantitativo).
- Soporte agéntico: etiquetado como agente, diseñado para flujos multi-paso de exploración, edición y testing en repositorios reales.
- Despliegue vía vLLM con API compatible con OpenAI (modelo base) y vía llama-cli/llama.cpp (esta cuantización).
- Ficheros mmproj incluidos, indicando soporte potencial de entrada multimodal/visión (no documentado explícitamente en la model card).

## Casos de uso

- Agentes de código a nivel de repositorio: integración en frameworks agénticos (tipo SWE-agent) para resolver issues reales, navegar la estructura del proyecto, localizar el código afectado y proponer parches, gracias a su entrenamiento específico con instancias de repositorios.
- Depuración automatizada: análisis de trazas de error y stacks, identificación de la causa raíz y generación de correcciones verificables con tests, aprovechando su entrenamiento con la estrategia Refresh–Repair–Expand.
- Refactorización de código heredado: el modelo puede editar ficheros existentes manteniendo la coherencia con el estilo y las dependencias del repositorio.
- Generación de tests unitarios: creación de casos de prueba a partir del código fuente y de la especificación de la tarea, útil en pipelines de CI/CD.
- Asistencia de código en local con hardware Blackwell: la cuantización MXFP4 permite ejecutar el modelo en una RTX Pro 6000 (96 GB) con solo ~19 GiB de VRAM y ~210 tokens/s, adecuado para entornos de desarrollo sin dependencia de la nube.
- Resolución de problemas algorítmicos y de razonamiento cuantitativo: los tests documentados incluyen problemas clásicos de estructuras de datos y matemáticas aplicadas.
- Servicios de inferencia autoalojados: despliegue con vLLM exponiendo una API compatible con OpenAI para integrarlo en herramientas de desarrollo existentes.

## Benchmarks y rendimiento

Resultados publicados en la model card, comparando el modelo destilado con su modelo base:

| Benchmark | Logics-SWE-35B-A3B | Base Qwen3.6-35B-A3B |
|---|---|---|
| SWE-bench Pro V2 | 77,00 | 73,31 |
| SWE-bench Pro V2 Hard | 33,99 | 28,10 |
| SWE-bench Pro V2 Multilingual | 66,44 | 63,44 |
| SWE-bench Pro | 51,12 | 48,75 |
| LiveCodeBench v6 | 78,10 | 76,95 |

Rendimiento de inferencia de la cuantización MXFP4_MOE (RTX PRO 6000 Blackwell, 96 GB, llama-cli, 5 ejecuciones):

| Metrica | Valor |
|---|---|
| Velocidad media de procesamiento del prompt | 237,67 tokens/s |
| Velocidad media de generación | 210,22 tokens/s |
| Pico de VRAM en GPU | 19,06 GiB |
| Utilizacion media de GPU | 87% |
| Decodificacion especulativa | No |

## Requisitos de hardware

- VRAM estimada segun cuantizacion (tamano de fichero + KV cache):
  - MXFP4_MOE: 19,8 GB (pico medido de 19,06 GiB con contexto de 16.384 tokens y KV cache q8_0).
  - Q3_K_L: 18,1 GB; Q5_K_M: 24,7 GB; Q6_K: 28,5 GB; Q8_0: 36,9 GB; BF16: 69,4 GB.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB) para MXFP4 con aceleracion FP4 nativa; tambien optimizado para RTX 50-series, B200 y B300. Para cuantizaciones Q5/Q6/Q8, GPUs con 24-48 GB (RTX 4090/5090 para Q3-Q5 con offload parcial, A100 40/80 GB para Q6-Q8 y BF16).
- Consumer GPUs: la cuantizacion MXFP4_MOE (19,8 GB) cabe en una RTX 4090/5090 de 24 GB con margen limitado para contexto; Q3_K_L (18,1 GB) es la opcion mas segura en 24 GB. Q5_K_M y superiores requieren 32 GB o mas, o offload parcial a CPU.
- Opciones de despliegue: llama.cpp / llama-cli (documentado), Ollama (al ser GGUF), y vLLM con API compatible con OpenAI para el modelo base en safetensors.
- Throughput medido: 210,22 tokens/s de generacion y 237,67 tokens/s de procesamiento de prompt en RTX PRO 6000 Blackwell con offload completo (-ngl 99).

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Logics-SWE-Qwen3.6-35B-A3B | 34,66 B | ~3 B | Apache 2.0 | GGUF, safetensors | Ingenieria de software agéntica |
| Qwen3.6-35B-A3B (base) | 34,66 B | ~3 B | Apache 2.0 | safetensors | Uso general |
| Qwen3.6-27B (expertos MOPD) | 27 B | no disponible | no disponible | safetensors | Expertos especializados en SWE |

No se dispone de datos comparativos directos con otros modelos de ingenieria de software de terceros (p. ej. Devstral o similares) en la informacion proporcionada, por lo que no se pueden incluir cifras de terceros sin riesgo de inventar datos.

## Limitaciones y advertencias

- Idioma: la model card declara unicamente ingles como idioma soportado; el uso en castellano no esta documentado y puede degradar la calidad, aunque el benchmark Multilingual de SWE-bench sugiere cierta capacidad multilingue en codigo.
- Contexto: la prueba documentada usa 16.384 tokens; la longitud de contexto maxima nativa del modelo no esta especificada en la model card, lo que puede limitar el trabajo con repositorios muy grandes en una sola pasada.
- Alucinaciones: como todo modelo de codigo, puede generar parches plausibles pero incorrectos; es imprescindible validar con tests automatizados antes de integrar cambios en produccion.
- Vision: los ficheros mmproj sugieren capacidad multimodal, pero no esta documentada ni evaluada; tratarla como experimental.
- Decodificacion especulativa no activada (MTP: No), por lo que el throughput depende unicamente del hardware y la cuantizacion.
- Los resultados de rendimiento estan medidos en hardware Blackwell concreto; en GPUs anteriores (Ampere/Hopper/Ada) la cuantizacion MXFP4 no tiene aceleracion nativa y el rendimiento sera inferior.
- Dataset de entrenamiento reducido (2.553 instancias), centrado en tareas de repositorio; el rendimiento en tareas fuera del dominio de ingenieria de software no esta evaluado.
- Licencia Apache 2.0: sin restricciones para uso comercial, pero requiere atribucion y conservacion del aviso de licencia.

## Enlaces

- Modelo cuantizado (GGUF): https://huggingface.co/prithivMLmods/Logics-SWE-Qwen3.6-35B-A3B-MXFP4-MoE-GGUF
- Modelo base: https://huggingface.co/Logics-MLLM/Logics-SWE-Qwen3.6-35B-A3B
- Dataset de entrenamiento: https://huggingface.co/datasets/Logics-MLLM/Logics-SWE-Env-2.5K
- llama.cpp: https://github.com/ggml-org/llama.cpp
