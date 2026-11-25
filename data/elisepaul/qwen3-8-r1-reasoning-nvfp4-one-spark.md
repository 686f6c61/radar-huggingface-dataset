# elisepaul/Qwen3.8-R1-Reasoning-NVFP4-One-Spark

## Resumen

Qwen3.8-R1-Reasoning-NVFP4-One-Spark es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) heterogeneo publicado por el usuario elisepaul en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un ensamblaje ("frankenmoe") construido a partir de dos linajes distintos: por un lado, la topologia base de Qwen3.8-Flash-Next-NVFP4-Coder-Lean (448 expertos enrutados orientados a codigo); por otro, 64 expertos de razonamiento algoritmico extraidos de DeepSeek-V4.1-Flash-1017. El resultado es un modelo de 131.711.817.584 parametros totales (unos 131,7 mil millones) distribuidos en 40 capas MoE y 8 capas densas, con 512 slots de expertos enrutados por capa.

El objetivo declarado es combinar la precision en generacion de codigo, comprension de APIs y ejecucion en terminal del linaje Qwen con el razonamiento en cadena de pensamiento (chain-of-thought) del linaje DeepSeek, todo ello empaquetado en cuantizacion NVFP4 (FP4 E2M1 con escalas de bloque FP8 de 16 elementos) para caber en un unico nodo NVIDIA DGX Spark (GB10 Blackwell, 128 GiB de memoria unificada LPDDR5x). El repositorio ocupa 83,4 GB, con un footprint en disco declarado de 77,65 GiB repartidos en 11 shards de safetensors y 300.982 tensores indexados.

La relevancia actual del modelo es fundamentalmente practica: demuestra una tecnica de transplante de expertos entre arquitecturas de distinta dimension (d_model 2560 frente a 5120) mediante alineamiento de representaciones con Procrustes ortogonal y escalado de atenuacion geometrica, y valida el despliegue en hardware de consumo profesional con memoria unificada. Es un modelo de nicho, con solo 330 descargas y 1 like en el momento de la consulta, y su licencia es la NVIDIA Open Model License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) heterogeneo, 40 capas MoE + 8 capas densas, con Multi-Token Prediction (MTP) para decodificacion especulativa |
| Parametros totales | 131.711.817.584 (131,7 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (E2M1 FP4 con escalas de bloque FP8 de 16 elementos); el repositorio incluye tambien referencias a MXFP8 y FP8 en los tags, pero el peso publicado es NVFP4 |
| Idiomas soportados | en, zh, code |
| Licencia | NVIDIA Open Model License (nvidia-open-model-license) |
| Formato de pesos | safetensors (11 shards activos, 300.982 tensores); libreria vLLM |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE con topologia heredada de Qwen3.8-Flash-Next-NVFP4-Coder-Lean: 448 expertos enrutados de grano fino (d_model = 2560, d_int = 640), 8 capas densas superiores, 1 experto compartido de backbone y 4 flujos de residuales con compuertas (HyperConnections). Sobre esa base se injertan 64 expertos por capa procedentes de DeepSeek-V4.1-Flash-1017 (d_model = 5120, d_int = 2304), seleccionados mediante Router-weighted Expert Activation Pruning (REAP) sobre 403 tareas de codigo, terminal y verificacion algoritmica. El total resultante es de 512 slots de expertos enrutados por capa.

El punto tecnico central es la integracion de subespacios de distinta dimensionalidad. El autor declara que el transplante directo ("zero-shot") falla por divergencia de base coordenada, y lo resuelve con alineamiento de representaciones mediante Procrustes ortogonal y escalado de atenuacion geometrica para evitar el desbordamiento de ganancia residual. La model card incluye una formulacion matematica y una prueba de equivalencia en algebra lineal. Ademas, el modelo incorpora una cabeza MTP de 4 tokens como drafter especulativo. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; el proceso descrito es de merging/ensamblaje, no de entrenamiento desde cero.

## Capacidades

- Generacion de texto conversacional y razonamiento en cadena de pensamiento (chain-of-thought, "deep-thinking").
- Generacion de codigo, comprension de APIs y ejecucion en terminal, heredadas del linaje Coder-Lean.
- Razonamiento algoritmico y verificacion, aportado por los expertos de DeepSeek-V4.1-Flash.
- Decodificacion especulativa mediante cabeza MTP de 4 tokens, orientada a reducir latencia.
- Capacidades multilingues limitadas a ingles, chino y codigo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita, aunque los tags incluyen "agent" y "swe-bench".
- Vision y audio: no disponibles.

## Casos de uso

- Generacion de codigo en produccion: el modelo hereda 448 expertos especializados en codigo y puede integrarse en pipelines de CI/CD para autocompletado, refactorizacion y generacion de tests, con la ventaja de ejecutarse en un unico nodo DGX Spark.
- Resolucion de issues de software (SWE-bench): el tag y el dataset princeton-nlp/SWE-bench_Lite sugieren uso en tareas de reparacion automatica de bugs sobre repositorios, combinando comprension de codigo y razonamiento multi-paso.
- Razonamiento matematico y algoritmico: con un 96,6% de accuracy declarado en MATH-500, es adecuado para tutoria matematica, verificacion de demostraciones y resolucion de problemas paso a paso.
- Asistente de terminal y automatizacion de operaciones: la combinacion de expertos de codigo y de ejecucion en terminal permite generar y validar comandos de shell, scripts de automatizacion y diagnosticos de sistemas.
- Despliegue en hardware de borde o laboratorio: al caber en 128 GiB de memoria unificada de un DGX Spark con 0 swap, sirve para prototipado local de agentes de codigo sin depender de la nube.
- Investigacion en arquitecturas MoE: el modelo es un caso de estudio reproducible de merging entre linajes con Procrustes ortogonal, util para experimentos academicos sobre transplante de expertos.
- Generacion bilingue ingles-chino para documentacion tecnica: el soporte de en y zh permite redactar y traducir documentacion de APIs y manuales tecnicos.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Metrica | Valor |
|---|---|---|
| MATH-500 | Accuracy | 96,6 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni SWE-bench, pese a que los tags y datasets los mencionan.

## Requisitos de hardware

- VRAM/memoria estimada: 76,12 GiB residentes en el motor, mas 22,64 GiB de cache KV y 22,64 GiB de margen, sobre 121,63 GiB direccionables. Footprint en disco de 77,65 GiB.
- Hardware objetivo: NVIDIA DGX Spark (GB10 Blackwell, 128 GiB de memoria unificada LPDDR5x, 0 swap).
- GPU recomendadas: DGX Spark (GB10). No se documenta compatibilidad con A100, H100 ni RTX 4090; el formato NVFP4 y la memoria unificada son especificos de Blackwell.
- Cabe en GPU de consumo: no consta; el modelo esta disenado para memoria unificada de 128 GiB, no para VRAM discreta de 24 GB.
- Opciones de despliegue: vLLM con FlashInfer y NVIDIA ModelOpt (segun tags y libreria declarada). No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma numerica; la model card menciona rendimiento de decodificacion especulativa con MTP de 4 tokens, pero sin cifras concretas en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-R1-Reasoning-NVFP4-One-Spark | 131,7 B (MoE) | no disponible | NVIDIA Open Model License | Hugging Face, 330 descargas |
| Qwen3.8-Flash-Next-NVFP4-Coder-Lean | no disponible | no disponible | no disponible | Hugging Face (modelo base) |
| DeepSeek-V4.1-Flash-1017 (nvidia) | no disponible | no disponible | no disponible | Hugging Face (donante) |
| DeepSeek-V4.1-Flash | no disponible | no disponible | no disponible | Hugging Face (modelo base) |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo de ensamblaje (merging) sin entrenamiento conjunto documentado; el alineamiento entre subespacios es matematicamente justificado por el autor, pero no verificado de forma independiente.
- El unico benchmark declarado (MATH-500, 96,6%) esta marcado como no verificado ("verified": false) y no se acompana de resultados en codigo o agentes.
- Sesgos conocidos: no documentados en la informacion disponible; al heredar de Qwen y DeepSeek, es previsible que arrastre sesgos de sus corpus originales, pero no hay evidencia concreta.
- Riesgo de alucinacion: no cuantificado; en tareas de codigo y matematicas el riesgo existe y no hay evaluacion publicada.
- Idiomas limitados a ingles, chino y codigo; no se declara soporte de castellano.
- Longitud de contexto no especificada, lo que impide planificar cargas de trabajo con ventanas largas.
- Restricciones de licencia: NVIDIA Open Model License, con condiciones de uso comercial que deben revisarse antes de produccion; no es una licencia permisiva tipo Apache 2.0.
- Dependencia de hardware: el formato NVFP4 y la memoria unificada restringen el despliegue a plataformas Blackwell como DGX Spark; no hay soporte documentado para GPUs discretas convencionales.
- Madurez baja: 330 descargas, 1 like y creado en noviembre de 2026; no hay comunidad ni soporte consolidado.

## Enlaces

- Hugging Face: https://huggingface.co/elisepaul/Qwen3.8-R1-Reasoning-NVFP4-One-Spark
- Modelo base (topologia): https://huggingface.co/elisepaul/Qwen3.8-Flash-Next-NVFP4-Coder-Lean
- Donante de expertos: https://huggingface.co/nvidia/DeepSeek-V4.1-Flash-1017-NVFP4
- Modelo base DeepSeek: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Dataset SWE-bench Lite: https://huggingface.co/datasets/princeton-nlp/SWE-bench_Lite
- Dataset MATH-500: https://huggingface.co/datasets/HuggingFaceH4/MATH-500
- Paper referenciado (arXiv 2412.19437): https://arxiv.org/abs/2412.19437
- Paper referenciado (arXiv 2409.19606): https://arxiv.org/abs/2409.19606
- Paper referenciado (arXiv 2404.19737): https://arxiv.org/abs/2404.19737
- Paper referenciado (arXiv 2412.15115): https://arxiv.org/abs/2412.15115
- Paper referenciado (arXiv 2307.08691): https://arxiv.org/abs/2307.08691
- Paper referenciado (arXiv 2312.06635): https://arxiv.org/abs/2312.06635
- Paper referenciado (arXiv 2403.13257): https://arxiv.org/abs/2403.13257
