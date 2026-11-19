# miceworks/Mark-SLM-V3-150M

## Resumen

Mark-SLM-V3-150M es un modelo de lenguaje experimental de tipo sparse (MoE) desarrollado por miceworks, publicado bajo licencia Apache 2.0. Se presenta explícitamente como un banco de pruebas arquitectónico para Multi-Head Latent Attention (MLA) y Mixture-of-Experts de grano fino en GPUs de 8 GB, y no como un asistente conversacional o multilingüe de propósito general. Su arquitectura `deepseek2` consta de 15 bloques físicos (2 densos y 13 MoE), con 16 expertos enrutados más 1 compartido y top-2 activo por token.

El modelo cuenta con 146.899.248 parámetros únicos (165.349.680 materializados en el contenedor GGUF) y un tamaño activo de 72.452.400 parámetros por token. El contexto declarado es de 8.192 tokens y el vocabulario de 32.032 entradas. Se distribuye principalmente en formato GGUF cuantizado IQ4_NL (90,37 MiB), lo que lo hace desplegable en hardware muy modesto mediante llama.cpp.

Su relevancia actual es fundamentalmente investigadora: permite estudiar el comportamiento de MLA y del enrutamiento aux-loss-free en un presupuesto de memoria mínimo. El entrenamiento se realizó sobre solo 3,47 millones de tokens del currículo `miceworks/Mark-Open-SLM-Curriculum`, por lo que sus métricas reflejan aprendizaje in-distribution y no capacidad general fuera de distribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `deepseek2` (transformer con MLA y MoE de grano fino) |
| Parametros totales | 146.899.248 únicos / 165.349.680 materializados en GGUF |
| Parametros activos | 72.452.400 por token |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | IQ4_NL (4-bit no lineal); pesos también en safetensors sin cuantizar |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`mark_slm_v3_150m_iq4_nl.gguf`) y safetensors |

## Arquitectura y entrenamiento

El modelo emplea Multi-Head Latent Attention (MLA), que proyecta los estados de clave y valor a una representación latente de bajo rango compartida (`kv_lora_rank=128`, `q_lora_rank=256`) y concatena embeddings rotatorios desacoplados (`qk_rope_head_dim=64`). Esto reduce el KV cache a 5.760 bytes por token en FP16, un ahorro de 6x frente a MHA estándar (45 MiB frente a 270 MiB a 8.192 tokens). La dimensión oculta es 576 con 9 cabezas de atención.

La capa MoE usa 16 expertos enrutados más 1 compartido, con top-2 activo por token y dimensión FFN de 256 por experto. El enrutamiento es aux-loss-free: los sesgos del router (`exp_probs_b.bias`, en FP32) se actualizan con la regla `b_i ← b_i + γ·sign(f̄ − f_i)` con γ = 0.001, evitando el colapso de expertos sin penalizar la pérdida principal. Las capas 0 y 1 son bloques densos SwiGLU.

El entrenamiento consistió en 25.000 pasos de preentrenamiento más 4.000 pasos de cooldown de fase 2 sobre 3,47 millones de tokens, con AdamW (β1=0.9, β2=0.95, weight decay 0.1, grad clipping 1.0), consolidado mediante un Model Soup 50/50. El dataset incluye splits de HellaSwag, PIQA, ARC, SciQ y ArithMark, lo que explica que las métricas reportadas sean in-distribution.

## Capacidades

- Generación de texto en inglés con pipeline `text-generation`.
- Razonamiento y respuesta a preguntas de tipo múltiple elección a nivel básico (ARC-Easy, PIQA, HellaSwag).
- Aritmética simple (evaluado en ArithMark-3.0).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Compatibilidad con endpoints y llama.cpp para despliegue local.

## Casos de uso

- Investigación de arquitecturas MLA: permite reproducir y medir el ahorro de KV cache (6x) en un modelo pequeño antes de escalar a variantes mayores, con código de entrenamiento público en el repositorio Mark-AI.
- Estudio de enrutamiento MoE aux-loss-free: sirve para analizar la evolución de los sesgos del router y la distribución de expertos en 13 capas MoE con top-2, sin coste computacional elevado.
- Pruebas de cuantización IQ4_NL: al ser un checkpoint pequeño con GGUF publicado, es útil para validar pipelines de cuantización y comparar fidelidad frente a safetensors.
- Docencia y divulgación: su tamaño (90 MiB en GGUF) permite ejecutarlo en portátiles y GPUs de 8 GB, facilitando demostraciones de MoE y MLA en cursos de sistemas de IA.
- Benchmarking de infraestructura: sirve como carga de trabajo ligera para validar despliegues de llama.cpp, endpoints compatibles y medición de latencia en hardware consumer.
- Evaluación de pipelines de entrenamiento: el currículo y los scripts publicados permiten reproducir el entrenamiento completo (25.000 + 4.000 pasos) en recursos modestos para estudiar dinámicas de model soup.

## Benchmarks y rendimiento

Resultados oficiales del Open SLM Leaderboard (PR #291), con la advertencia del autor de que miden aprendizaje in-distribution:

| Benchmark | Puntuación | Normalizada |
|---|---|---|
| PIQA | 62,50% | 25,00% |
| ARC-Easy | 40,80% | 21,07% |
| HellaSwag | 37,10% | 16,13% |
| ArithMark-3.0 | no disponible (truncado en la model card) | no disponible |
| Intelligence Index | 16,36 | — |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni comparativas con modelos similares en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: el contenedor IQ4_NL ocupa 90,37 MiB; con overhead de llama.cpp y KV cache de 45 MiB a 8.192 tokens, cabe holgadamente en menos de 1 GB.
- GPU recomendadas: cualquier GPU consumer con 8 GB o menos; el autor lo posiciona explícitamente para GPUs de 8 GB (RTX 3060, RTX 4060, etc.).
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU moderna e incluso en CPU.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), endpoints compatibles; safetensors disponible para carga con `custom_code`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparativas directas con modelos comparables en la información proporcionada. Por tamaño y propósito, los candidatos habituales serían SLMs experimentales de la misma horquilla (100M-200M parámetros) en el Open SLM Leaderboard, pero no se han facilitado sus métricas para una comparación rigurosa.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Mark-SLM-V3-150M | 146,9M únicos / 72,5M activos | 8.192 | Apache 2.0 | GGUF + safetensors en HF |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El propio autor advierte que NO es un asistente conversacional ni multilingüe de propósito general; su uso previsto es la investigación arquitectónica.
- Entrenado con solo 3,47 millones de tokens, un volumen muy reducido que limita severamente la calidad y generalidad del texto generado.
- Las métricas reportadas son in-distribution: el currículo incluye splits de los propios benchmarks (HellaSwag, PIQA, ARC, SciQ, ArithMark), por lo que no reflejan capacidad fuera de distribución.
- Riesgo elevado de alucinación y de respuestas incoherentes en dominios no vistos.
- Soporte únicamente de inglés; sin capacidades multilingües.
- Sin soporte documentado de tool calling, agentes ni modos de razonamiento extendido.
- Licencia Apache 2.0 permite uso comercial, pero la calidad del modelo hace inviable su uso en producción como asistente.
- El campo de idiomas en Hugging Face figura como "no disponible", aunque la model card declara inglés.

## Enlaces

- Hugging Face: https://huggingface.co/miceworks/Mark-SLM-V3-150M
- Dataset de currículo: https://huggingface.co/datasets/miceworks/Mark-Open-SLM-Curriculum
- Dataset Cyber Curriculum: https://huggingface.co/datasets/miceworks/Mark-Cyber-Curriculum
- Dataset Ultra Curriculum: https://huggingface.co/datasets/miceworks/Mark-Ultra-Curriculum
- Repositorio de código y scripts: https://github.com/thu12dta3/Mark-AI/tree/main/scripts
- Open SLM Leaderboard (PR #291): https://huggingface.co/spaces/AxiomicLabs/Open_SLM_Leaderboard/discussions/291
