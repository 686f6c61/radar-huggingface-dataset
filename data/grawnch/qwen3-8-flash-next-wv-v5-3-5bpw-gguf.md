# Grawnch/Qwen3.8-Flash-Next-WV-v5-3.5bpw-GGUF

## Resumen

Qwen3.8-Flash-Next-WV-v5-3.5bpw-GGUF es una proyeccion cuantizada en formato GGUF del modelo base Qwen/Qwen3.8-Flash-Next, publicada por el usuario Grawnch. El modelo original es un transformer de tipo mixture-of-experts (MoE) hibrido con 176.943.899.520 parametros totales (aproximadamente 180B), que combina capas de atencion lineal GDN (Gated Delta Network) con capas de atencion completa Sparse-QSA, 512 expertos enrutados mas 1 compartido, hyper-conexiones mHC de 4 flujos y una tabla de embeddings por capa N-Gram (PLE). Esta version GGUF aplica una cuantizacion efectiva de 3.52 bits por peso (bpw) en dos shards, pensada para ejecucion directa en llama.cpp con la arquitectura `qwen4exp`.

El problema que resuelve esta publicacion es el de permitir desplegar un modelo de ~180B parametros en hardware de consumo y estaciones de trabajo con VRAM limitada, sin necesidad de decodificadores personalizados ni parches del runtime. El autor calibra la cuantizacion con tecnicas de compensacion de trayectoria activacion-consciente, shrinkage RMT y descenso por coordenadas validado (CULM) sobre matrices Hessianas de expertos, buscando minimizar la divergencia KL respecto al modelo BF16 original. El resultado es un checkpoint de 84 GB en repo, con 55.20 GB destinados a VRAM de GPU y 28.80 GB mapeados en RAM del host via mmap.

Es relevante ahora porque demuestra un flujo de cuantizacion agresiva (por debajo de 4 bpw) sobre arquitecturas MoE hibridas modernas, manteniendo formatos ggml estandar (Q3_K, Q4_0, Q2_0, Q6_K, Q8_0, BF16, F32) y compatibilidad con endpoints. La licencia Apache-2.0 del modelo base facilita su uso comercial, aunque el modelo card no detalla los idiomas soportados ni la longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido: 48 capas GDN (atencion lineal) + Sparse-QSA (atencion completa), 512 expertos enrutados + 1 compartido, hyper-conexiones mHC de 4 flujos, PLE N-Gram por capa |
| Parametros totales | 176.943.899.520 (~180B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con mezcla de Q3_K, Q4_0, Q2_0, Q6_K, Q8_0, BF16 y F32; 3.52 bpw efectivos |
| Idiomas soportados | no disponible (el model card menciona evaluacion con codigo poliglota en 12 idiomas, pero no lista idiomas soportados) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (2 shards), compatible con llama.cpp mainline y endpoints |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura hibrida de 48 capas que alterna capas GDN (Gated Delta Network, atencion lineal con estado recurrente) y capas Sparse-QSA de atencion completa, combinando eficiencia de contexto largo con capacidad de atencion global. La capa MoE incorpora 512 expertos enrutados mas un experto compartido, y el modelo anade hyper-conexiones mHC de 4 flujos para mejorar la propagacion de informacion entre capas, asi como una tabla de embeddings N-Gram por capa (PLE) que reside en el segundo shard GGUF y se mapea en RAM del host.

La publicacion WV-v5 no documenta los datos de entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF/DPO). Lo que si detalla es el proceso de cuantizacion: unpack en FP32 de la descomposicion SVD rank-2 y rejillas no uniformes del checkpoint maestro WZV4, seguimiento de trayectorias mHC de 4 flujos sobre 34 x 2048 (69.632 tokens) de datos genuinos de math/logic/coding en modo `<think>`, codigo poliglota en 12 idiomas y secuencias WikiText-2, absorcion de drift entre capas mediante covarianza cruzada de Cholesky, shrinkage RMT Marchenko-Pastur/Donoho-Gavish sobre Hessianas de expertos enrutados Top-24, y refinamiento de codigos enteros Q3_K/Q4_0/Q2_0 via descenso por coordenadas validado (CULM). El error residual de los expertos enrutados se absorbe en el experto compartido Q8_0 (`ffn_down_shexp.weight`).

## Capacidades

- Generacion de texto autoregresiva con modo de razonamiento `<think>` documentado en las suites de evaluacion (math, logica, coding).
- Razonamiento matematico y de olimpiada, con datos de evaluacion especificos para "Deep Olympiad" y C++20.
- Generacion de codigo, incluyendo codigo poliglota en 12 idiomas segun la descripcion del dataset de calibracion.
- Capacidad multilingue parcial: el proceso de calibracion usa codigo en 12 idiomas, aunque no se lista el conjunto completo de idiomas soportados.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponible en la informacion proporcionada.
- Compatibilidad con endpoints (`endpoints_compatible` en tags) y ejecucion out-of-the-box en llama.cpp mainline con arquitectura `qwen4exp`.

## Casos de uso

- Razonamiento matematico asistido en entornos de desarrollo: el modelo se evalua especificamente en suites de math y olimpiada en modo `<think>`, por lo que puede integrarse en asistentes que resuelvan problemas paso a paso con trazas de razonamiento explicitas.
- Generacion de codigo C++20 y otros lenguajes en pipelines de CI/CD: la calibracion incluye codigo poliglota en 12 idiomas y suites de C++20, lo que lo hace adecuado para tareas de sintesis y revision de codigo en produccion.
- Despliegue en estaciones de trabajo con una sola GPU de 64-96 GB: la variante GGUF de 3.52 bpw requiere 55.20 GB de VRAM mas 28.80 GB de RAM del host, encajando en GPUs Blackwell de 64 GB o 96 GB con llama.cpp.
- Prototipado e investigacion sobre arquitecturas MoE hibridas: al ser un checkpoint cuantizado de un modelo de ~180B con GDN y Sparse-QSA, sirve para estudiar el comportamiento de estas arquitecturas en condiciones de baja precision sin necesidad de infraestructura multi-GPU.
- Evaluacion comparativa de tecnicas de cuantizacion: el repo incluye un JSON con logs completos de PPL/KLD/JSD/Top-k/CosSim de 6 suites frente a BF16 y Stock GGUF, util para reproducir y comparar metodologias de cuantizacion.
- Servicio de inferencia compatible con endpoints: el tag `endpoints_compatible` y el formato GGUF estandar permiten desplegarlo detras de servidores de inferencia que acepten llama.cpp, con la tabla PLE mapeada en RAM para liberar VRAM.
- Analisis de texto general y perplejidad en dominios externos: la suite "External Held-Out" muestra una PPL de 10.1749 en la version WV-v5, por lo que puede emplearse en tareas de modelado de lenguaje y evaluacion de dominio fuera del entrenamiento.

## Benchmarks y rendimiento

Los datos disponibles son de perplejidad (PPL) y divergencia KL sobre 6 suites, comparando BF16, WV-v5 y Stock GGUF, no de benchmarks estandar como MMLU o HumanEval.

| Suite | PPL BF16 | PPL WV-v5 | PPL Stock GGUF (dPPL vs BF16) | KLD media vs BF16 | Top-1 vs BF16 | Top-5 en BF16 | KLD/CosSim WV-v5 vs Stock |
|---|---|---|---|---|---|---|---|
| Genuine Math/Code `<think>` (4x2048) | 1.9961 | 1.9404 | 1.9315 (-0.0646) | 0.06389 | 91.54% | 99.77% | 0.00266 / 0.99715 |
| Deep Olympiad & C++20 `<think>` (4x2048) | 2.5498 | 2.4861 | 2.4733 (-0.0765) | 0.06804 | 90.82% | 99.82% | 0.00282 / 0.99826 |
| Self-Gen Math/Code (2048) | 5.5732 | 5.6441 | 5.6707 (+0.0976) | 0.16417 | 86.47% | 98.53% | 0.00845 / 0.99467 |
| External Held-Out (2048) | 11.1585 | 10.2190 | 10.1749 (-0.9835) | 0.21475 | 81.97% | 98.29% | 0.01056 / 0.99538 |
| WikiText-2 (4x2048) | 2.3413 | 2.3521 | 2.3756 (+0.0343) | 0.43870 | 83.89% | 96.80% | 0.02635 / 0.98986 |
| WikiText-2 (4x1024) | 2.5724 | 2.5473 | 2.5831 (+0.0107) | 0.48949 | no disponible (truncado) | no disponible (truncado) | no disponible (truncado) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 55.20 GB (51.41 GiB) para el shard principal (embeddings, 48 capas GDN/QSA/MoE, 1.223 tensores y cabeza de salida Q8_0).
- RAM del host: 28.80 GB (26.82 GiB) para la tabla PLE (`per_layer_token_embd.weight`, Q4_0) mapeada via mmap.
- GPU recomendadas: GPUs Blackwell de 64 GB o 96 GB (variantes pre-swizzled `sm_120` con ~60 GB y ~45 GB de VRAM respectivamente); para la variante GGUF de 3.52 bpw se requiere al menos 56 GB de VRAM para el shard principal.
- Cabe en consumer GPU: no en GPUs consumer convencionales de 24 GB (RTX 4090) ni de 32 GB; requiere GPUs profesionales o de centro de datos con >=56 GB de VRAM.
- Opciones de despliegue: llama.cpp mainline (arquitectura `qwen4exp`), sin decodificadores personalizados ni parches; compatible con endpoints.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion / formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-WV-v5-3.5bpw-GGUF (este) | ~180B totales, 512+1 expertos | no disponible | GGUF 3.52 bpw, 2 shards, 55.20 GB VRAM + 28.80 GB RAM | apache-2.0 | Hugging Face (Grawnch) |
| Qwen3.8-Flash-Next-WV-v5-3.5bpw (master) | ~180B totales | no disponible | Contenedor WZV4 3.53 bpw, 2 shards, 55.31 GB VRAM + 28.80 GB RAM | apache-2.0 | Hugging Face (Grawnch) |
| Qwen3.8-Flash-Next-WV-v5-3.1bpw-64GB-SM120-v20 | ~180B totales | no disponible | safetensors sm_120, ~60 GB VRAM + 28.80 GB RAM | apache-2.0 | Hugging Face (Grawnch) |
| Qwen3.8-Flash-Next-WV-v5-Sub2.5bpw-SM120 | ~180B totales | no disponible | safetensors sm_120, ~45 GB VRAM + 28.80 GB RAM | apache-2.0 | Hugging Face (Grawnch) |

No se dispone de datos de benchmarks estandar para comparar rendimiento con modelos de otros autores; la comparativa se limita a variantes del mismo modelo base publicadas por el mismo autor.

## Limitaciones y advertencias

- La cuantizacion a 3.52 bpw introduce perdida de precision respecto a BF16: la KLD media frente a BF16 alcanza 0.48949 en WikiText-2 (4x1024) y 0.43870 en WikiText-2 (4x2048), valores altos en comparacion con las suites de math/code (0.06389-0.06804).
- El Top-1 frente a BF16 baja hasta 81.97% en External Held-Out y 83.89% en WikiText-2, lo que puede afectar tareas de generacion sensible a la eleccion exacta del token.
- El shard 2 (tabla PLE, 28.80 GB) debe residir en RAM del host via mmap; sistemas con menos de 29 GB de RAM libre no podran cargar el modelo completo.
- No se documentan sesgos conocidos, riesgos de alucinacion especificos ni limitaciones de contexto o idioma en la informacion proporcionada.
- El model card no especifica la longitud de contexto maxima ni la lista de idiomas soportados, lo que limita la planificacion de despliegues multilingues o de contexto largo.
- La licencia apache-2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen/Qwen3.8-Flash-Next y las obligaciones de atribucion.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-14, por lo que carece de validacion independiente de la comunidad.
- La evaluacion se basa en perplejidad y divergencia KL, no en benchmarks de tarea (MMLU, HumanEval, GSM8K), por lo que el rendimiento en tareas reales no esta cuantificado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Grawnch/Qwen3.8-Flash-Next-WV-v5-3.5bpw-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Checkpoint maestro WV-v5 3.5bpw: https://huggingface.co/Grawnch/Qwen3.8-Flash-Next-WV-v5-3.5bpw
- Variante 3.1bpw-64GB-SM120-v20: https://huggingface.co/Grawnch/Qwen3.8-Flash-Next-WV-v5-3.1bpw-64GB-SM120-v20
- Variante Sub2.5bpw-SM120: https://huggingface.co/Grawnch/Qwen3.8-Flash-Next-WV-v5-Sub2.5bpw-SM120
- Logs de evaluacion (referencia en el repo): `benchmarks/qfn_wv_v5_stock_35bpw_eval_summary.json`
- Papers, blogs, repos o demos adicionales: no disponible en la informacion proporcionada.
