# nextgenaimx/Rebekah-AI-1.8B

## Resumen

Rebekah AI 1.8B es un modelo de lenguaje de pesos abiertos desarrollado por Next GenAi Mexico (perfil de HuggingFace `nextgenaimx`) y presentado como un "modelo fundacional soberano" orientado al despliegue en el borde (edge). Se construye sobre un transformer causal decoder-only compatible con LLaMA-3, con atencion de consultas agrupadas (GQA) y una ventana de contexto de 8.192 tokens, pensado para ejecutarse en una sola GPU y en entornos on-premise sin dependencia de APIs en la nube.

El modelo esta especializado en cargas de trabajo agenticas de baja latencia: ejecucion determinista de herramientas, diagnostico de infraestructura Linux y administracion de sistemas en el borde. Su corpus de entrenamiento (61.952.000 tokens declarados, 50.000 pasos de optimizacion) esta sesgado hacia documentacion de sistemas e infraestructura (35%), codigo y automatizacion (30%), razonamiento matematico (20%) y documentos tecnicos curados (15%), con una proporcion bilingue declarada de 65% ingles / 35% espanol.

Con licencia Apache 2.0 y pesos en safetensors, el modelo se posiciona en el segmento de 1B-2,5B parametros frente a Qwen 2.5 1.5B, Llama 3.2 1B, SmolLM2 1.7B y Gemma 2 2B. El autor publica benchmarks internos que lo situan por delante en HumanEval, GSM8K y, sobre todo, en "Systems & Tool Execution" (76,4%), aunque el modelo cuenta con muy poca traccion en el momento de la ficha (0 descargas, 1 like). Es relevante por su propuesta de modelo bilingue de borde con enfoque en agentes y tool use, un nicho con menos oferta que el de los modelos pequenos de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (compatible con LLaMA-3), con GQA, RoPE y RMSNorm |
| Parametros totales | 2.008.139.776 (~2,01B) segun safetensors; la model card declara 1.873.922.048 (1,874B) (discrepancia) |
| Parametros activos | No aplica: modelo denso (1,874B activos por token declarados) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; el repositorio distribuye pesos en safetensors (tamano de repo: 4,0 GB) |
| Idiomas soportados | Ingles (en) y espanol (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Dimension oculta (d_model) | 2.048 |
| Dimension intermedia (SwiGLU) | 8.064 |
| Numero de capas | 28 bloques |
| Atencion | Grouped-Query Attention, 16 cabezas de consulta y 8 cabezas KV |
| Codificacion posicional | RoPE (theta = 10.000,0) |
| Normalizacion | RMSNorm (epsilon = 1e-6) |
| Vocabulario | 65.536 tokens (BPE a nivel de byte, con tokens de agente nativos) |
| Weight tie | Embeddings de entrada y cabeza LM de salida compartidos (tied) |
| Pipeline | text-generation |
| Fecha de creacion (repositorio) | 2026-09-20 |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal decoder-only de 28 bloques, con dimension oculta de 2.048 y dimension intermedia de 8.064 con activaciones SwiGLU. Emplea Grouped-Query Attention con 16 cabezas de consulta y 8 cabezas KV, RoPE con theta de 10.000,0 y normalizacion RMSNorm. El vocabulario es de 65.536 tokens mediante BPE a nivel de byte e incorpora tokens de agente nativos. Los embeddings de entrada y la cabeza LM estan atados (weight tying). El modelo se presenta como denso (no MoE), con 1,874B parametros activos por token declarados (frente a los ~2,01B que reflejan los safetensors publicados).

El entrenamiento sigue un curriculum en dos fases, aunque la tabla de configuracion de entrenamiento de la model card esta incompleta y no detalla el hardware, el batch efectivo por fase ni la composicion exacta de cada etapa. Los datos declarados suman 61.952.000 tokens procesados en 50.000 pasos de optimizacion, con un reparto por dominio de 35% sistemas e infraestructura, 30% codigo y automatizacion, 20% razonamiento matematico y 15% documentos tecnicos curados, y una mezcla bilingue global de 65% ingles / 35% espanol. El pipeline de datos incluye deduplicacion MinHash LSH (shingles de 5 gramos, umbral de Jaccard 0,80), un filtro de descontaminacion por solapamiento exacto de 13 gramos sobre HumanEval, GSM8K, ARC-Challenge y MMLU, eliminacion de cadenas canary y de variantes chain-of-thought, y anonimizacion de PII con Microsoft Presidio mas heuristicas regex. No se documenta en la informacion disponible si hubo RLHF, DPO u otra fase de alineacion, ni innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto en ingles y espanol, con densidad bilingue declarada de 65% EN / 35% ES en dominios tecnicos.
- Generacion y comprension de codigo, con enfasis en Python 3, Bash/POSIX shell, Go, C y Rust, segun el corpus declarado.
- Razonamiento matematico (aritmetica, logica formal y razonamiento algoritmico) entrenado sobre OpenWebMath, ProofNet y datos sinteticos paso a paso.
- Ejecucion de herramientas (tool calling / function calling) como capacidad central del modelo; el autor lo describe como orientado a "ejecucion determinista de herramientas".
- Soporte de flujos agenticos y razonamiento multi-paso, con tokens de agente nativos en el vocabulario.
- Diagnostico de infraestructura y administracion de sistemas Linux (documentacion del kernel, RFC de Ceph, especificaciones de OPNsense/eBPF, manuales POSIX).
- Capacidades multilingues limitadas a ingles y espanol; no se declaran otros idiomas.
- Capacidades especiales: no se mencionan vision, audio ni un "thinking mode" explicito en la informacion disponible.
- Ventana de contexto de 8.192 tokens para conversaciones multi-turno y contexto tecnico moderadamente largo.

## Casos de uso

- Atencion al cliente automatizada en ingles y espanol: el modelo puede mantener conversaciones multi-turno dentro de su ventana de 8.192 tokens, aunque su especializacion tecnica lo hace mas adecuado para soporte de producto tecnico que para dialogo generalista.
- Ejecucion de herramientas en pipelines de automatizacion: su foco declarado en tool calling determinista permite integrarlo como agente que invoca funciones (shell, APIs, consultas) dentro de flujos de CI/CD o tareas de operaciones.
- Diagnostico de infraestructura Linux: generacion de comandos, lectura de logs, interpretacion de salidas de herramientas de red y almacenamiento (sockets, eBPF, Ceph, POSIX), apoyandose en el 35% del corpus dedicado a sistemas.
- Asistente de administracion de sistemas en el borde: despliegue en una sola GPU o en un nodo on-premise para tareas de configuracion y monitorizacion sin enviar datos a la nube (propuesta de "soberania" de datos).
- Autocompletado y generacion de codigo en entornos locales: dado su rendimiento declarado en HumanEval (58,4% pass@1), puede integrarse en editores o scripts de generacion para Python, Bash, Go, C y Rust.
- Resolucion de problemas matematicos y logicos en pipelines educativos o de validacion: con 62,8% en GSM8K (5-shot) segun el autor, sirve como componente de verificacion o tutoria en dominios cuantitativos.
- Agente RAG sobre documentacion tecnica: combinado con un recuperador, puede responder sobre manuales y RFC con contexto de hasta 8.192 tokens, aprovechando su sesgo hacia textos tecnicos bilingues.
- Prototipado de agentes en hardware de consumo: al ser un modelo de ~2B parametros, permite experimentar con flujos agenticos en GPUs de gama media o incluso en CPU mediante cuantizacion.

## Benchmarks y rendimiento

Los siguientes resultados son los publicados por el autor en la model card (evaluacion cero-shot y few-shot). No hay verificacion independiente disponible.

| Benchmark / Metrica | Rebekah-AI-1.8B | Qwen 2.5 1.5B | Llama 3.2 1B | SmolLM2 1.7B | Gemma 2 2B |
|---|---|---|---|---|---|
| HumanEval (Python Pass@1) | 58,4% | 52,4% | 37,2% | 45,1% | 41,5% |
| GSM8K (5-shot) | 62,8% | 60,5% | 44,3% | 51,2% | 56,8% |
| MMLU (5-shot) | 51,2% | 55,8% | 49,3% | 50,1% | 52,2% |
| ARC Challenge (25-shot) | 55,6% | 54,1% | 48,2% | 53,0% | 53,2% |
| Systems & Tool Execution | 76,4% | 48,2% | 41,0% | 44,6% | 47,3% |
| Throughput de inferencia (NVIDIA L4) | 1.240 tok/s | 1.150 tok/s | 1.350 tok/s | 1.180 tok/s | 940 tok/s |

Datos adicionales declarados por el autor: perplejidad en holdout de 9,91 sobre matematicas de GSM8K y de 13,21 sobre diagnostico de sistemas / codigo. El autor atribuye a la especializacion de dominio un margen de +28,2% en "Systems & Tool Execution" frente a modelos pequenos de proposito general.

## Requisitos de hardware

- VRAM estimada (calculada a partir del numero de parametros y del tamano del repositorio; no confirmada por el autor):
  - bf16/fp16: ~4,0 GB de pesos; ~5-6 GB de VRAM con cache KV para contexto completo de 8.192 tokens.
  - int8: ~2,0 GB de pesos.
  - int4: ~1,1-1,5 GB de pesos.
- Cache KV estimada: aproximadamente 0,94 GB en fp16 para la ventana completa de 8.192 tokens (28 capas, 8 cabezas KV, dimension de cabeza 128). Cifra calculada, no publicada por el autor.
- GPU de referencia en los benchmarks: NVIDIA L4 (24 GB), con 1.240 tok/s declarados.
- Cabe en GPU de consumo: si, con holgura. Una GPU de 8 GB (por ejemplo, RTX 4060/3070) puede ejecutarlo en bf16 con contexto moderado, y una de 12-24 GB (RTX 3060 12GB, RTX 4090) lo hace sin problemas a contexto completo. En cuantizacion int4 es viable incluso en GPUs de 6 GB.
- Opciones de despliegue: al ser compatible con LLaMA, es desplegable con runtimes estandar como vLLM, TGI, llama.cpp y Ollama; no se confirma en la informacion disponible la publicacion de pesos en formato GGUF ni cuantizaciones listas para usar.
- Latencia y throughput: 1.240 tok/s en NVIDIA L4 segun el autor (benchmark comparativo). No se dispone de medidas de latencia (time-to-first-token) ni de throughput en otras GPU.

## Comparativa con modelos similares

Comparativa centrada en el segmento de 1B-2,5B parametros. Los datos de rendimiento proceden de la tabla comparativa publicada por el autor de Rebekah-AI-1.8B; los datos de parametros, contexto y licencia de los competidores son caracteristicas publicas conocidas de dichos modelos.

| Modelo | Parametros | Contexto | Licencia | HumanEval | GSM8K | MMLU | Systems & Tool Exec. |
|---|---|---|---|---|---|---|---|
| Rebekah-AI-1.8B (Next GenAi) | ~2,01B (safetensors) | 8.192 | Apache 2.0 | 58,4% | 62,8% | 51,2% | 76,4% |
| Qwen 2.5 1.5B (Alibaba) | 1,5B | 32.768 | Apache 2.0 | 52,4% | 60,5% | 55,8% | 48,2% |
| Llama 3.2 1B (Meta) | 1,23B | 128.000 | Licencia comunitaria Llama 3.2 | 37,2% | 44,3% | 49,3% | 41,0% |
| SmolLM2 1.7B (HuggingFace) | 1,7B | 8.192 | Apache 2.0 | 45,1% | 51,2% | 50,1% | 44,6% |
| Gemma 2 2B (Google) | 2,6B | 8.192 | Terminos de uso de Gemma | 41,5% | 56,8% | 52,2% | 47,3% |

Notas: Rebekah-AI-1.8B lidera en la comparativa en HumanEval, GSM8K y Systems & Tool Execution segun los datos del autor, pero queda por detras de Qwen 2.5 1.5B, Gemma 2 2B y SmolLM2 1.7B en MMLU (conocimiento general), y su contexto de 8.192 tokens es inferior al de Qwen 2.5 1.5B y muy inferior al de Llama 3.2 1B. La disponibilidad y el ecosistema de herramientas (cuantizaciones GGUF, integraciones) del modelo no estan documentados en la informacion disponible.

## Limitaciones y advertencias

- Discrepancia en el numero de parametros: los safetensors suman 2.008.139.776 (~2,01B) mientras que la model card declara 1.873.922.048 (1,874B). Conviene verificar antes de planificar recursos de memoria.
- Los benchmarks son autocertificados por el autor y no cuentan con verificacion independiente; deben tomarse con cautela.
- Muy poca traccion y validacion de la comunidad en el momento de la ficha: 0 descargas y 1 like. No hay evidencia de uso en produccion por terceros.
- Ventana de contexto de 8.192 tokens, inferior a la de alternativas como Qwen 2.5 1.5B (32K) o Llama 3.2 1B (128K), lo que limita tareas con documentos largos.
- Cobertura de idiomas limitada a ingles y espanol; no se declaran otros idiomas y el rendimiento fuera de estos puede degradarse.
- Especializacion de dominio: el sesgo hacia sistemas e infraestructura puede reducir su rendimiento en conocimiento general (MMLU 51,2%, por debajo de varios competidores del mismo tamano).
- Riesgo de alucinacion propio de un modelo de ~2B parametros, especialmente en tareas de conocimiento general, hechos y razonamiento complejo de multiples pasos; no se documentan tasas de alucinacion.
- Sesgos no evaluados: la model card no incluye evaluaciones de sesgo, toxicidad o equidad, pese a describir un pipeline de anonimizacion de PII.
- Licencia Apache 2.0, permisiva para uso comercial, pero el usuario debe validar la procedencia del corpus (el autor afirma provenance "cleanroom" con fuentes permisivas, sin auditoria externa).
- Fechas de repositorio atipicas (creacion 2026-09-20) que dificultan situar la version publicada en una linea temporal estandar.
- No se confirma la disponibilidad de pesos cuantizados (GGUF/GPTQ/AWQ) ni de artefactos listos para despliegue en llama.cpp u Ollama.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nextgenaimx/Rebekah-AI-1.8B
- Perfil del autor en HuggingFace: https://huggingface.co/nextgenaimx
- No se han encontrado enlaces relevantes adicionales (paper, blog, repositorio o demo) en la busqueda web realizada; los resultados obtenidos correspondian a contenidos sin relacion con el modelo.
