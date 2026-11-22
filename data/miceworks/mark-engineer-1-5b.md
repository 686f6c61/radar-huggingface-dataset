# miceworks/Mark-Engineer-1.5B

## Resumen

Mark-Engineer-1.5B es un modelo de lenguaje de tipo transformer disperso (Mixture-of-Experts) desarrollado por miceworks y publicado en Hugging Face bajo licencia Apache 2.0. Se distribuye exclusivamente como archivo GGUF cuantizado en IQ4_NL para su uso con llama.cpp, lo que lo convierte en una pieza orientada a la experimentación en inferencia local con recursos limitados. El checkpoint se etiqueta explícitamente como `EXPERIMENTAL_NARROW_CHECKPOINT`, es decir, un modelo de investigación con un alcance de entrenamiento muy restringido.

La arquitectura combina Multi-Head Latent Attention (MLA) con una topología MoE de 16 expertos enrutados y 1 compartido, manteniendo 364 millones de parámetros activos por token sobre un total de 1.496 millones (24,34 % de activación). El contexto máximo es de 4.096 tokens y el vocabulario es extremadamente reducido: 4.311 tokens BPE activos, con una fertilidad medida de aproximadamente 2,02 caracteres por token en código C/Rust y 2,53 en prosa técnica en inglés.

Su relevancia es acotada y de carácter arquitectónico: sirve como banco de pruebas reproducible para estudiar MLA, enrutamiento MoE sin pérdida auxiliar y el formato nativo `deepseek2` en llama.cpp, más que como modelo de producción generalista. El entrenamiento se limitó a 400 pasos sobre el currículo `Mark-Ultra-Curriculum`, centrado en código de sistemas, manuales de bajo nivel, RFCs y primitivas de concurrencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `deepseek2` (transformer MoE con Multi-Head Latent Attention) |
| Parametros totales | 1.496.016.864 (281 tensores) |
| Parametros activos | 364.046.304 (24,34 % activos por token) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | IQ4_NL (4 bits no lineal) |
| Idiomas soportados | `en` (según model card); fertilidad medida también en portugués técnico |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (formato nativo `deepseek2` para llama.cpp) |

| Parametro adicional | Valor |
|---|---|
| Estado de entrenamiento | `EXPERIMENTAL_NARROW_CHECKPOINT` |
| Tamano del binario | 802,88 MiB (841,88 MB / 841.881.696 bytes) |
| Tamano del repositorio | 6,2 GB |
| Vocabulario | 4.311 tokens BPE activos (27.721 slots reservados de padding) |
| Merges BPE | 3.981 |
| Capas | 16 |
| Dimension oculta | 1.280 |
| Cabezas de atencion | 16 |
| Rangos MLA | `q_lora_rank=640`, `kv_lora_rank=320`, `qk_rope_head_dim=32` |
| Expertos MoE | 16 enrutados + 1 compartido (2 activos por token) |
| Dimension FFN por experto | 1.504 |
| SHA-256 | `983683d2e7885c9ce6589f7e2009ca4e9ebb891ff448c509a024732953780aba` |

## Arquitectura y entrenamiento

El modelo emplea Multi-Head Latent Attention, que proyecta los estados de clave y valor a una representación latente compartida de bajo rango (`c_KV` de dimensión 320 y `c_Q` de 640) para desacoplar el consumo de memoria del contexto. Los embeddings rotatorios desacoplados se concatenan en una dimensión separada de 32 (`qk_rope_head_dim`). El resultado es un KV cache de 11.264 bytes por token en FP16, lo que supone un ahorro de 8,7x frente a una atención multi-cabeza estándar: 44 MiB frente a 384 MiB con 4.096 tokens.

La capa MoE combina un experto compartido siempre activo con 16 expertos enrutados mediante top-2, usando enrutamiento sin pérdida auxiliar. Los sesgos del router (`exp_probs_b.bias`, almacenados en FP32) se actualizan por paso con la regla `b_i ← b_i + γ·sign(f̄ − f_i)` con γ = 0,001, evitando el colapso de expertos sin penalizar la pérdida principal. Los 16 expertos se particionan en 4 clanes funcionales de 4 expertos: Clan 0 (código de sistemas, semántica de kernels, concurrencia), Clan 1 (matemáticas, lógica formal, razonamiento STEM), Clan 2 (seguridad, protocolos, validación) y Clan 3 (datos estructurados, tool calling, lógica simbólica).

El entrenamiento se realizó durante 400 pasos sobre `miceworks/Mark-Ultra-Curriculum` con AdamW (β1 = 0,9, β2 = 0,95, weight decay 0,1, gradient clipping 1,0). No se especifican en la información disponible el número total de tokens procesados, la composición exacta del dataset ni si hubo fases de RLHF o DPO. El tokenizador incluye tokens de control epistémico: `<think>`, `</think>`, `<tool_call>`, `</tool_call>`, `[RETRIEVE]`, `[/RETRIEVE]`, `[EVALUATE]`, `[ACCEPT]` y `[REJECT]`.

## Capacidades

- Generación de texto en inglés con soporte de etiquetas de razonamiento (`<think>`) y reflexión epistémica auto-RAG.
- Generación y análisis de código de sistemas: C, Rust, POSIX threads, primitivas de sincronización y barreras de memoria.
- Tool calling mediante delimitadores `<tool_call>` y `</tool_call>`, con un clan de expertos dedicado a datos estructurados y lógica simbólica.
- Razonamiento multi-paso acotado mediante tokens de control `[RETRIEVE]`, `[EVALUATE]`, `[ACCEPT]` y `[REJECT]`.
- Capacidad matemática y de lógica formal limitada al currículo de entrenamiento (Clan 1).
- Capacidad multilingüe muy limitada: la model card solo declara inglés, aunque se midió fertilidad en portugués técnico (2,57 caracteres/token).
- No se declaran capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Investigación de arquitecturas MLA: el modelo permite medir empíricamente el ahorro de KV cache (8,7x) y validar implementaciones de atención latente en llama.cpp sobre hardware modesto.
- Estudio de enrutamiento MoE sin pérdida auxiliar: con 16 expertos y sesgos FP32 accesibles, sirve para analizar dinámicas de frecuencia de expertos y colapso en currículos cortos.
- Pruebas de integración del formato GGUF `deepseek2`: útil como caso de test para validar cargadores, tokenizadores y kernels de cuantización IQ4_NL en llama.cpp.
- Generación asistida de código de sistemas en entornos de experimentación: puede producir fragmentos de C o Rust sobre concurrencia y sincronización, siempre con revisión humana dado el alcance estrecho del entrenamiento.
- Docencia y demostraciones de inferencia local: con 802,88 MiB de binario cabe holgadamente en una GPU de 8 GB, lo que permite desplegarlo en equipos de laboratorio o portátiles con RTX 2060 Super.
- Evaluación de tokenizadores de vocabulario reducido: sus 4.311 tokens y la fertilidad medida (2,02–2,57 caracteres/token) lo hacen útil para estudiar el equilibrio entre compresión y cobertura en dominios técnicos.
- Prototipado de pipelines con etiquetas epistémicas: los tokens `<think>`, `[RETRIEVE]` y `[EVALUATE]` permiten experimentar con flujos de auto-RAG y verificación antes de adoptarlos en modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo indica que el modelo "demuestra completitud del currículo estrecho para POSIX threads, primitivas de sincronización y barreras de memoria", sin cifras numéricas ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,8 GB para los pesos en IQ4_NL, más el KV cache (44 MiB con 4.096 tokens en FP16) y overhead del runtime.
- GPU recomendadas: cualquier GPU con 8 GB o más. La model card cita explícitamente la NVIDIA GeForce RTX 2060 Super (8 GB GDDR6, 256 bits, 448 GB/s) como referencia, dejando más de 7 GB de VRAM libres.
- Cabe en GPU de consumo: sí, en RTX 2060 Super, RTX 3060, RTX 4060 y superiores; también en iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp (formato nativo `deepseek2`), y por extensión los runners compatibles con GGUF como Ollama o servidores basados en llama.cpp. No se dispone de información sobre soporte en vLLM o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Mark-Engineer-1.5B | 1.496 M | 364 M | 4.096 | Apache 2.0 | GGUF IQ4_NL | MoE + MLA, checkpoint experimental estrecho |
| DeepSeek-V2-Lite | no disponible en la informacion | no disponible | no disponible | no disponible | no disponible | Referencia arquitectonica del formato `deepseek2`; sin datos verificados aqui |
| Qwen2.5-1.5B | no disponible en la informacion | denso | no disponible | no disponible | no disponible | Alternativa densa de tamano comparable; sin datos verificados aqui |
| SmolLM2-1.7B | no disponible en la informacion | denso | no disponible | no disponible | no disponible | Alternativa densa de tamano comparable; sin datos verificados aqui |

No se dispone de datos verificados de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Checkpoint experimental: la etiqueta `EXPERIMENTAL_NARROW_CHECKPOINT` y los 400 pasos de entrenamiento implican una capacidad general muy limitada; no es apto para producción generalista.
- Contexto corto: 4.096 tokens restringen tareas de contexto largo, razonamiento sobre documentos extensos y conversaciones multi-turno prolongadas.
- Vocabulario mínimo: 4.311 tokens BPE con fertilidad de 2,02–2,57 caracteres/token degradan la eficiencia y pueden aumentar errores en texto fuera del dominio técnico.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está documentado y previsiblemente será deficiente.
- Tokenizador con pérdida potencial de espacios: la model card advierte que el decodificador ByteLevel puede eliminar los cuatro espacios iniciales de indentación cuando el token 28 es una secuencia de espacio en bruto, lo que afecta a la fidelidad del código generado.
- Riesgo de alucinación: no se documentan evaluaciones de factualidad; el entrenamiento estrecho en dominios técnicos aumenta la probabilidad de generalizaciones incorrectas fuera de ellos.
- Sesgos: no se documentan análisis de sesgo; el corpus de entrenamiento (RFCs, manuales, código de sistemas) está sesgado hacia terminología y patrones técnicos en inglés.
- Licencia Apache 2.0: permite uso comercial, pero la ausencia de garantías y el estado experimental desaconsejan su despliegue en producción sin evaluación previa.
- Sin benchmarks públicos: no hay métricas verificables de MMLU, HumanEval, GSM8K ni similares, lo que impide comparar su rendimiento de forma objetiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/miceworks/Mark-Engineer-1.5B
- Repositorio de código y scripts de entrenamiento: https://github.com/thu12dta3/Mark-AI/tree/main/scripts
- Dataset principal de entrenamiento: https://huggingface.co/datasets/miceworks/Mark-Ultra-Curriculum
- Dataset de currículo abierto: https://huggingface.co/datasets/miceworks/Mark-Open-SLM-Curriculum
- Dataset de ciberseguridad: https://huggingface.co/datasets/miceworks/Mark-Cyber-Curriculum
