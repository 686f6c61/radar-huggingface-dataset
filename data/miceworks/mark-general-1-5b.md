# miceworks/Mark-General-1.5B

## Resumen

Mark-General-1.5B es un checkpoint experimental de tipo "narrow" publicado por miceworks en Hugging Face, orientado a la investigación de arquitecturas eficientes más que al uso conversacional general. Emplea la arquitectura `deepseek2` (transformer con Multi-Head Latent Attention y mezcla de expertos de grano fino) con 1.496.185.824 parámetros físicos totales y 364.215.264 parámetros activos por token, distribuidos en 16 capas. Su vocabulario es deliberadamente reducido (4.377 filas de tensor) y su ventana de contexto se limita a 4.096 tokens.

El modelo se distribuye exclusivamente como GGUF cuantizado en IQ4_NL, con un contenedor de 802,97 MiB (841.978.976 bytes), lo que lo hace ejecutable en GPUs de 8 GB de VRAM como la NVIDIA GeForce RTX 2060 Super. Su propósito declarado es servir de banco de pruebas para MLA y MoE con enrutamiento sin pérdida auxiliar (aux-loss-free) en hardware de consumo, no como asistente de propósito general.

Es relevante ahora porque combina varias técnicas de atención y enrutamiento reservadas habitualmente a modelos mucho mayores (MLA con rangos latentes, expertos compartidos más 16 enrutados con top-2, partición de expertos por dominios) dentro de un presupuesto de memoria muy ajustado. La licencia Apache 2.0 y la publicación de los currículos de entrenamiento facilitan su reproducción y experimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `deepseek2` (transformer con Multi-Head Latent Attention y MoE) |
| Parametros totales | 1.496.185.824 (281 tensores) |
| Parametros activos | 364.215.264 por token |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | IQ4_NL (4 bits no lineal); el repositorio solo publica ese formato |
| Idiomas soportados | `en` declarado en la model card; el resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (librería `gguf`, compatible con llama.cpp) |

Datos adicionales relevantes: tamaño de vocabulario de 4.377 filas de tensor (4.311 tokens BPE activos más 27.721 ranuras de relleno reservadas), 3.981 merges BPE, dimensión oculta de 1.280, 16 cabezas de atención, rangos MLA `q_lora_rank=640`, `kv_lora_rank=320`, `qk_rope_head_dim=32`, 16 expertos enrutados más 1 compartido (2 activos por token), dimensión FFN de experto de 1.504 y SHA-256 `4712cc4497c0adb618276968a4163a508083857d244b875fbb29cbe52dab183b`.

## Arquitectura y entrenamiento

La arquitectura es un transformer de 16 capas con Multi-Head Latent Attention: las proyecciones de clave y valor se comprimen en una representación latente de baja dimensión (`c_KV` de 320 dimensiones) y las consultas en otra de 640 dimensiones, con embeddings rotatorios desacoplados de 32 dimensiones concatenados aparte. Este diseño reduce el coste de la caché KV a 11.264 bytes por token en FP16, es decir, 44 MiB para 4.096 tokens frente a los 384 MiB de una atención MHA estándar, una reducción de 8,7 veces según los cálculos de la model card.

La capa MoE combina un experto compartido siempre activo con 16 expertos enrutados mediante top-2 y enrutamiento sin pérdida auxiliar: los sesgos del router (`blk.{l}.exp_probs_b.bias`, almacenados en FP32) se actualizan con la regla basada en signo `b_i ← b_i + γ·sign(f̄ − f_i)` con γ = 0,001, evitando el colapso de expertos sin penalizar la pérdida principal. Los 16 expertos se agrupan en cuatro "clanes" de dominio: sistemas y concurrencia (0-3), matemáticas y lógica formal (4-7), seguridad y protocolos (8-11) y datos estructurados, tool calling y lógica simbólica (12-15).

El entrenamiento se realizó durante 600 pasos sobre el currículo `miceworks/Mark-Ultra-Curriculum`, con datos curados de STEM, pruebas formales y lógica algorítmica, usando AdamW (β1 = 0,9, β2 = 0,95, weight decay 0,1, gradient clipping 1,0). El autor lo etiqueta explícitamente como `EXPERIMENTAL_NARROW_CHECKPOINT`; no se documentan fases de RLHF o DPO.

## Capacidades

- Generación de texto en inglés con foco en prosa técnica, código de sistemas (C, Rust) y lógica algorítmica.
- Razonamiento matemático y lógica formal, apoyado por el clan de expertos 4-7.
- Generación y análisis de código de sistemas, kernels y patrones de concurrencia (clan 0-3).
- Tool calling mediante los delimitadores `<tool_call>` y `</tool_call>` integrados en el tokenizador.
- Modo de razonamiento explícito con etiquetas `<think>` y `</think>`.
- Flujo epistémico de Self-RAG con etiquetas `[RETRIEVE]`, `[/RETRIEVE]`, `[EVALUATE]`, `[ACCEPT]` y `[REJECT]`.
- Manejo de datos estructurados y lógica simbólica (clan 12-15).
- Capacidades multilingües: limitadas; solo se declara inglés, aunque la model card mide fertilidad en portugués técnico.
- No se declaran capacidades de visión, audio ni agentes autónomos de múltiples pasos más allá del tool calling.

## Casos de uso

- Investigación de arquitecturas MLA: el modelo permite medir empíricamente el ahorro de caché KV (8,7x frente a MHA) en una GPU de 8 GB, validando fórmulas de escalado de memoria antes de trasladarlas a modelos mayores.
- Estudio de enrutamiento MoE sin pérdida auxiliar: con 16 expertos enrutados y sesgos FP32 accesibles, sirve para analizar la distribución de frecuencias por experto y el efecto de γ en la estabilidad del router.
- Experimentos de partición por dominios: los cuatro clanes permiten comprobar si el enrutamiento aprende a separar código de sistemas, matemáticas, seguridad y datos estructurados, midiendo afinidades token-experto.
- Pruebas de pipelines de tool calling: las etiquetas `<tool_call>` integradas en el vocabulario permiten prototipar agentes ligeros y validar parsers de llamadas a herramientas en local.
- Evaluación de tokenizadores de vocabulario reducido: con 4.311 tokens BPE activos y fertilidad de 2,53 caracteres/token en prosa técnica inglesa, es un banco de pruebas para estudiar el equilibrio entre tamaño de vocabulario y compresión.
- Desarrollo y depuración de inferencia en llama.cpp: al ser un GGUF IQ4_NL de 803 MiB, permite probar kernels de cuantización no lineal y decodificación en hardware modesto antes de desplegar variantes mayores.
- Docencia y demostraciones de MoE: su tamaño reducido y su licencia Apache 2.0 lo hacen apto para explicar atención latente y enrutamiento por expertos en cursos prácticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica únicamente que el modelo fue "validado en representaciones estrechas de lógica matemática y razonamiento algorítmico", sin cifras de MMLU, HumanEval, GSM8K ni comparaciones numéricas.

## Requisitos de hardware

- VRAM para inferencia: el contenedor IQ4_NL ocupa 802,97 MiB; con overhead de contexto y caché KV (44 MiB a 4.096 tokens en FP16) el uso realista se sitúa en torno a 1-1,5 GB.
- GPU objetivo declarada: NVIDIA GeForce RTX 2060 Super (8 GB GDDR6, bus de 256 bits, 448 GB/s), citada explícitamente por el autor.
- Cabe holgadamente en cualquier GPU de consumo con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, RTX 4090) y en GPUs de datacenter (A100, H100) con un uso de memoria mínimo.
- Despliegue: llama.cpp es el runtime de referencia (librería `gguf`, etiqueta `endpoints_compatible`); al no publicarse pesos safetensors, vLLM y TGI no son opciones directas sin conversión.
- Latencia y throughput: no disponibles; no se han publicado mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Cuantización publicada | Licencia | Enfoque |
|---|---|---|---|---|---|---|
| Mark-General-1.5B | 1.496 M | 364 M | 4.096 | IQ4_NL (GGUF) | Apache 2.0 | MLA + MoE experimental |
| TinyLlama-1.1B | 1.100 M | denso | 2.048 | múltiples (GGUF, safetensors) | Apache 2.0 | Transformer denso generalista |
| Qwen2.5-1.5B | 1.540 M | denso | 32.768 | múltiples (GGUF, safetensors) | Apache 2.0 | Transformer denso multilingüe |
| DeepSeek-V2-Lite | 15.700 M | 2.400 M | 32.768 | safetensors, GGUF comunitario | licencia propia | MLA + MoE a mayor escala |

La comparación con modelos densos de tamaño similar es desfavorable en contexto (4.096 frente a 32.768 de Qwen2.5-1.5B) y en disponibilidad de formatos, pero Mark-General-1.5B ofrece una huella de memoria activa mucho menor (364 M parámetros activos) y una caché KV muy reducida. No se dispone de datos de rendimiento comparativo para respaldar afirmaciones de calidad.

## Limitaciones y advertencias

- Checkpoint experimental: el autor lo etiqueta como `EXPERIMENTAL_NARROW_CHECKPOINT` y lo describe como banco de pruebas arquitectónico, no como modelo conversacional o multilingüe de propósito general.
- Contexto muy corto: 4.096 tokens limita conversaciones multi-turno largas, análisis de documentos extensos y agentes con historial amplio.
- Vocabulario mínimo: 4.311 tokens BPE activos producen una fertilidad de solo 2,02 caracteres/token en código de sistemas y 2,53 en prosa técnica, lo que encarece la generación frente a tokenizadores de 32K o 100K tokens.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está documentado y previsiblemente será deficiente.
- Riesgo de alucinación: con solo 600 pasos de entrenamiento sobre un currículo estrecho, la cobertura factual es muy limitada y no se documentan evaluaciones de veracidad.
- Fidelidad de espacios en blanco: la model card advierte que el decodificador ByteLevel puede eliminar los cuatro espacios iniciales de indentación cuando el token 28 es una secuencia de espacio en bruto, lo que afecta a la generación de código Python.
- Sin datos de sesgos: no se publica ninguna evaluación de sesgos, toxicidad o robustez.
- Licencia: Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de garantías hace desaconsejable su despliegue en producción sin evaluación previa propia.
- Formatos: solo se distribuye GGUF IQ4_NL; no hay safetensors ni otras cuantizaciones oficiales, lo que limita el ajuste fino y el despliegue en servidores de alto rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/miceworks/Mark-General-1.5B
- Scripts de entrenamiento y arquitectura (Mark-AI): https://github.com/thu12dta3/Mark-AI/tree/main/scripts
- Dataset Mark-Ultra-Curriculum: https://huggingface.co/datasets/miceworks/Mark-Ultra-Curriculum
- Dataset Mark-Open-SLM-Curriculum: https://huggingface.co/datasets/miceworks/Mark-Open-SLM-Curriculum
- Dataset Mark-Cyber-Curriculum: https://huggingface.co/datasets/miceworks/Mark-Cyber-Curriculum
