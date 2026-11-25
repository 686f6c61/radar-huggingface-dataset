# mr-andrey-isachenko/Tenet-14B-Qwen3-Unslop-v2

## Resumen

Tenet-14B-Qwen3-Unslop-v2 es un ajuste fino del modelo Qwen/Qwen3-14B, publicado por el usuario independiente mr-andrey-isachenko bajo el paraguas de su proyecto "Tenet Lab". Se presenta como el resultado de aplicar el pipeline propietario "Tenet v2" (fases H15, H16, H14+ y H17) sobre el modelo base de Alibaba, con el objetivo declarado de preservar el razonamiento en cadena (chain-of-thought), el razonamiento formal y las capacidades de uso de herramientas y SQL, al tiempo que se reduce el "slop" (texto de relleno) y se relajan los mecanismos de rechazo. Es, en la práctica, una variante del tipo "abliterated/uncensored" orientada a agentes y generación de código.

El modelo conserva la arquitectura transformer densa de Qwen3-14B, con aproximadamente 14.770 millones de parámetros totales según los pesos en safetensors, y se distribuye tanto en formato BF16/FP8 como en cuantizaciones GGUF de precisión mixta (receta "CKA" a ~5 bpw). La licencia declarada es Apache 2.0, heredada del modelo base.

Su relevancia es limitada pero concreta: para desarrolladores que ya trabajan con Qwen3-14B y necesitan una variante con menos rechazos y con cuantizaciones GGUF optimizadas para preservar capas críticas, este modelo ofrece artefactos listos para llama.cpp y vLLM. No obstante, el propio autor reporta que solo 5 de 10 "release gates" se superan, lo que debe leerse como un modelo experimental más que como un reemplazo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-14B) |
| Parametros totales | 14.768.307.200 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la información proporcionada (el ejemplo de despliegue usa `--max-model-len 8192`) |
| Tipos de cuantizacion | BF16, FP8 E4M3, GGUF (F16, CKA-Q4_K_M, i1-CKA-Q4_K_M, ~5.003 bpw) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-14B, un transformer denso de tipo decoder-only. Sobre esa base, el autor aplica su pipeline "Tenet v2", compuesto por cuatro fases documentadas en la model card: H15 ("Phase-Segmented Tri-Anchor Lancet Surgery"), que separa los tokens de deliberación entre `<think>...</think>` de los tokens de superficie posteriores y protege tres "anclas ortonormales" (autocorrección de CoT, razonamiento formal y tool/SQL) en las capas de mayor SCR `[18, 11, 22, 12, 13, 10]`, restaurando la norma L2 por fila; H16 ("Dual-Window Length-Calibrated Gated GRPO"), que entrena con una ventana gaussiana asimétrica de calibración de longitud y proyección LoRA ortogonal (con `merged_lora_count == 0`); H14+, una receta de cuantización GGUF de precisión mixta a 5.014 bpw que mantiene en Q8_0 las capas `[0, 11, 12, 18, 39]` y en Q6_K las capas `[10, 13, 22]`, cuantizando el resto a Q4_K_M; y H17, una verificación mecánica ("Arena House") sobre 24 prompts y 6 comprobaciones SQL de solo lectura en DuckDB.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni detalles del proceso de alineación más allá de la mención a GRPO con ventana de calibración de longitud. El autor reporta métricas internas de verificación: factor de cresta máximo de fila 3.5974 (objetivo < 25.0), re-fuga FP8 del 2.5898 % (objetivo < 3.0 %) y una tasa de integridad de etiquetas `<think>` del 98.33 % (objetivo ≥ 99.5 %, no alcanzado).

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento con modo "thinking" explícito mediante etiquetas `<think>...</think>`.
- Razonamiento formal y matemático (declarado como ancla protegida por el pipeline).
- Generación de código y soporte de tool calling / function calling (tag `tool-use`, `agentic`).
- Generación y ejecución de consultas SQL de solo lectura (verificado sobre DuckDB en la fase H17).
- Capacidades agénticas y razonamiento multi-paso (tag `agentic`).
- Variante "abliterated/uncensored": menor tasa de rechazos y de "slop" según las métricas del autor.
- Compatibilidad con el parser de razonamiento de Qwen3 en vLLM (`--reasoning-parser qwen3`) y con `--enable-auto-tool-choice`.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agentes de código en pipelines de CI/CD: el modelo soporta tool calling y puede integrarse en flujos que invocan herramientas de compilación, test o revisión, aprovechando el modo thinking para planificar pasos intermedios antes de emitir llamadas a funciones.
- Asistentes de análisis de datos sobre DuckDB/SQL: la fase H17 valida consultas SQL de solo lectura, por lo que encaja en entornos de exploración de datos donde el modelo genera y ejecuta SELECT sobre tablas locales bajo supervisión.
- Automatización de tareas de razonamiento formal: al proteger el autor las "anclas" de razonamiento formal, es adecuado para problemas de lógica y matemáticas donde se requiere una cadena de pasos verificable entre `<think>` y `</think>`.
- Despliegue en hardware de consumo mediante GGUF: la variante `cka_q4_k_m.gguf` (8.61 GiB) permite servir el modelo con llama.cpp en una GPU de 12-16 GB o incluso en CPU con `-ngl 99` y contexto de 4096, útil para prototipos locales sin infraestructura cloud.
- Servicio de inferencia con vLLM en FP8: el autor documenta un comando `vllm serve` con `--quantization fp8`, lo que permite desplegar en una A100/H100 con throughput razonable para cargas de chat y agentes.
- Generación de texto sin rechazos en dominios creativos o de ficción: la naturaleza "uncensored" del ajuste lo hace apto para escritura creativa donde las variantes estándar de Qwen3 tienden a rechazar o suavizar contenido.
- Evaluación comparativa de técnicas de cuantización: la receta CKA de precisión mixta (Q8_0/Q6_K/Q4_K_M selectivo) sirve como caso de estudio para investigadores que analizan la degradación de capas críticas al cuantizar.

## Benchmarks y rendimiento

Los datos publicados por el autor son métricas internas de su propio pipeline, no benchmarks estándar de la comunidad (MMLU, HumanEval, GSM8K). Se reproducen a continuación tal cual, sin interpretación adicional.

| Metrica | F16 | CKA-Q4_K_M | i1-CKA-Q4_K_M |
|---|---:|---:|---:|
| Tamano (GiB) | 27.51 | 8.61 | 8.61 |
| BPW medio | 16.000 | 5.003 | 5.003 |
| PPL (40x512) | 7.4106 | 7.6825 | 7.4722 |
| KLD medio vs F16 | 0.00000 | 0.03281 | 0.01269 |
| Same Top-1 | 100.00 % | 92.16 % | 94.62 % |
| Integridad `<think>` | 98.33 % | 98.33 % | 98.33 % |
| Arena House HP | 93.75 | 91.67 | 95.83 |
| Artefactos House | 22/24 | 21/24 | 23/24 |
| Unslop pass | 100.00 % | 100.00 % | 100.00 % |
| SQL solo lectura | 0/6 | 6/6 | 0/6 |

| Auditoria Foundry (12 semillas) | Base Qwen3-14B | Naive Abliterated | Tenet v2 |
|---|---:|---:|---:|
| Direct Compliance | 1.00 | 1.00 | 1.00 |
| Unslop pass rate | 0.917 | 0.917 | 0.917 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 28-30 GB (14.77 B parámetros × 2 bytes más overhead de activaciones y KV cache).
- VRAM estimada en FP8 E4M3: aproximadamente 15-16 GB, más KV cache.
- GGUF Q4_K_M (~5 bpw): 8.61 GiB de pesos; con contexto 4096 y overhead, cabe en GPUs de 12 GB (RTX 3060 12 GB, RTX 4070) y holgadamente en 16 GB (RTX 4060 Ti 16 GB, RTX 4080).
- GPU recomendadas: A100 40/80 GB o H100 para BF16/FP8 con vLLM y contextos largos; RTX 4090 (24 GB) para FP8 o GGUF con contexto extendido; RTX 3090/4080 para GGUF Q4.
- Despliegue: llama.cpp (`llama-server -hf ... -c 4096 -ngl 99`), vLLM (`--quantization fp8 --dtype bfloat16 --enable-auto-tool-choice --reasoning-parser qwen3 --max-model-len 8192`), Transformers, y compatibilidad declarada con OpenRouter y endpoints.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---:|---|---|---|---|
| Tenet-14B-Qwen3-Unslop-v2 | 14.77 B | no disponible (ejemplo a 8192) | Apache 2.0 | safetensors, GGUF, FP8 | Ajuste "uncensored" con cuantización CKA selectiva |
| Qwen/Qwen3-14B (base) | ~14.8 B | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF | Modelo original de Alibaba, con alineación estándar |
| Variantes "abliterated" de Qwen3-14B | ~14.8 B | depende de la variante | Apache 2.0 (heredada) | safetensors, GGUF | Reducen rechazos; el autor las usa como referencia en su auditoría |

No se dispone de datos de benchmarks estándar para comparar el rendimiento real frente a estas alternativas; la única comparación publicada es la auditoría interna del propio autor, que sitúa a Tenet v2 a la par que el base y que la variante "Naive Abliterated" en Direct Compliance (1.00) y Unslop pass rate (0.917).

## Limitaciones y advertencias

- El autor reporta que solo 5 de 10 release gates se superan; entre los fallos destacan la integridad de etiquetas `<think>` (98.33 % frente al objetivo ≥ 99.5 %), la tasa de colapso de longitud (4.17 % frente a < 1 %) y la tasa de SQL de solo lectura en la variante i1 (0/6).
- La variante `i1-cka-q4_k_m.gguf` obtiene 0/6 en las comprobaciones SQL de solo lectura, mientras que `cka-q4_k_m.gguf` obtiene 6/6: la elección del artefacto GGUF afecta de forma crítica a las capacidades de tool/SQL.
- Modelo de naturaleza "abliterated/uncensored": presenta menor tasa de rechazos, lo que implica riesgo de generar contenido inapropiado, sesgado o dañino sin las salvaguardas del Qwen3 original.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual; al ser un ajuste fino sobre Qwen3-14B, hereda los riesgos del base y añade los del proceso GRPO con ventana de calibración de longitud.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingüe equivalente al del modelo base.
- Longitud de contexto no especificada en la model card; el ejemplo de vLLM usa 8192 tokens, pero no se confirma el máximo real soportado tras el ajuste.
- Licencia Apache 2.0 heredada del modelo base, lo que permite uso comercial; sin embargo, el modelo se distribuye sin garantías y el autor no ofrece soporte ni SLA.
- Proyecto de autor individual con 188 descargas y 0 likes en el momento de la ficha: madurez y mantenimiento inciertos.
- Las métricas "Arena House", "Crest" y "Foundry" son definidas por el propio autor y no equivalen a benchmarks estándar de la comunidad; deben interpretarse con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mr-andrey-isachenko/Tenet-14B-Qwen3-Unslop-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
- Repositorio del proyecto Tenet Lab: https://github.com/mrAndreyIsachenko/tenet-lab
