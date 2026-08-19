# gjtgjt/Qwen3.8-27B-heretic-r1n-GGUF

## Resumen

Qwen3.8-27B-heretic-r1n-GGUF es una cuantización GGUF del modelo `gjtgjt/Qwen3.8-27B-heretic-r1n`, una versión ablacionada (abliterated) del modelo oficial `Qwen/Qwen3.8-27B` mediante la herramienta Heretic 1.4.0. La abliteración es una técnica de ingeniería de representaciones que elimina las negativas (refusals) del modelo sin necesidad de reentrenamiento, modificando los pesos directamente. Esta versión concreta usa un enfoque iterativo de rango 1 verdadero (PRE, row-normalization) que reduce drásticamente la tasa de rechazo del modelo base (de 98 a 18 sobre 100 keywords de prueba) manteniendo una divergencia KL acumulada de 0.0931 respecto al original, por debajo del umbral de 0.1.

El modelo base es un transformer denso de 27.000 millones de parámetros con 64 capas de lenguaje, arquitectura multimodal (acepta imágenes) y una ventana de contexto nativa de 262.144 tokens. La cuantización GGUF aquí presentada incluye dos niveles de precisión (Q8_0 y Q5_K_M) más el proyector de visión (mmproj) en BF16, lo que permite ejecutar el modelo en hardware de consumo con llama.cpp y herramientas compatibles. Al estar basado en Qwen3.8, hereda capacidades de razonamiento, generación de código, matemáticas y tool calling, aunque con el matiz de que la abliteración reduce las restricciones de contenido, lo que lo hace adecuado para escenarios donde se requiere menor censura.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.8) con encoder de visión multimodal, 64 capas de lenguaje |
| Parametros totales | 27B (modelo base Qwen3.8-27B); el archivo safetensors de 460.730.096 corresponde al proyector de visión (mmproj) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (nativa) |
| Tipos de cuantizacion | Q8_0, Q5_K_M (GGUF); mmproj en BF16 |
| Idiomas soportados | Inglés, chino (según la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (cuantizados), safetensors para el modelo completo |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer denso de 27B parámetros con 64 capas de lenguaje y un encoder de visión que permite entrada de imágenes. Fue entrenado por el equipo de Qwen con un enfoque estándar de preentrenamiento y ajuste fino supervisado, más una fase de optimización con preferencias (RLHF/DPO) según la documentación oficial del modelo base. La ventana de contexto nativa es de 262.144 tokens, soportada mediante técnicas de extensión de contexto como YaRN.

La versión heretic-r1n aplica sobre este modelo la técnica de abliteración con Heretic 1.4.0, un método de edición de pesos que elimina las representaciones asociadas a las negativas. Concretamente, se usa la modalidad `--row-normalization PRE` (true rank-1) de forma iterativa: se realizan varias rondas de edición, evaluando tras cada una la tasa de rechazo (Keyword count) y la divergencia KL respecto al modelo original. La ronda 2 (trial 109) fue aceptada con Keyword 18/100 y KL 0.0931, mientras que la ronda 3 se rechazó por superar el umbral de KL 0.1. La torre de visión y el módulo MTP (Multi-Token Prediction) no fueron modificados. La conversión a GGUF se realizó con llama.cpp `b94041a` usando `--no-nextn`, por lo que el head MTP no está incluido en los archivos cuantizados.

## Capacidades

- Generación de texto y razonamiento multi-step con modo thinking activado por defecto (temperatura 1.0, top-p 0.95, top-k 20) y modo instruct sin razonamiento (temperatura 0.7, top-p 0.8, presencia 1.5).
- Comprensión de imágenes: el modelo acepta entrada visual mediante el proyector `mmproj` incluido, permitiendo descripción de imágenes y respuesta a preguntas visuales.
- Generación de código y soporte de matemáticas, heredados del modelo base Qwen3.8-27B.
- Tool calling y function calling, tal como se documenta en el modelo base (aunque no se detalla en esta model card).
- Capacidades multilingües limitadas a inglés y chino según la model card, aunque el modelo base puede tener un espectro más amplio.
- Reducción de negativas: la abliteración reduce significativamente las respuestas de rechazo (de 98 a 18 sobre 100 keywords), permitiendo respuestas más directas en temas que el modelo base podría bloquear.
- Soporte de agentes y razonamiento multi-paso gracias a la ventana de contexto de 262K tokens.

## Casos de uso

- Asistentes de código sin restricciones: el modelo puede generar código, explicar algoritmos y depurar sin rechazar peticiones legítimas que el modelo base podría bloquear por políticas de seguridad. Su modo thinking permite razonar sobre problemas complejos de programación.
- Análisis de documentos técnicos largos: con 262K tokens de contexto, puede procesar libros completos, repositorios de código o informes extensos en una sola pasada, resumiendo o extrayendo información relevante.
- Generación creativa de contenido: la abliteración reduce la autocensura, haciéndolo útil para escritura creativa, guiones o narrativa con temáticas que otros modelos rechazarían.
- Chatbots de atención al cliente con tolerancia a temas delicados: puede gestionar conversaciones multi-turno sobre quejas, reclamaciones o temas conflictivos sin negarse a responder, manteniendo un tono útil.
- Análisis de imágenes y generación de descripciones: gracias al proyector de visión, puede procesar capturas de pantalla, diagramas o fotografías y producir descripciones detalladas o responder preguntas sobre su contenido.
- Investigación en alineación y seguridad de IA: al ser un modelo ablacionado, sirve como caso de estudio para comparar el comportamiento de modelos con y sin edición de pesos, permitiendo analizar el impacto de la abliteración en tareas de razonamiento y generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) específicos para esta versión ablacionada. La model card solo proporciona métricas de abliteración:

| Metrica | Valor |
|---|---|
| Keyword count (modelo base) | 98/100 |
| Keyword count (ronda 2, este release) | 18/100 |
| KL acumulada vs original | 0.0931 |
| Ronda 3 (rechazada) | Keyword 8, KL 0.1983 |

El modelo base Qwen3.8-27B, según el blog de lovableapp.org, obtiene DeepSWE 42.2, Terminal Bench 73.0 y OSWorld 84.3, pero estos resultados no son directamente aplicables a la versión ablacionada, ya que la edición de pesos puede alterar el rendimiento en tareas específicas. No se han medido perplejidad ni velocidad para los archivos GGUF, como indica la propia model card.

## Requisitos de hardware

- VRAM estimada: el archivo Q8_0 ocupa 26.63 GiB (28.60 GB), por lo que requiere al menos 28-32 GB de VRAM para inferencia con contexto corto. El Q5_K_M ocupa 17.91 GiB (19.23 GB), necesitando unos 20-24 GB.
- Para contexto largo (262K tokens), la caché KV domina el consumo de VRAM; se recomienda ajustar `-c` a la longitud real necesaria.
- GPUs recomendadas: RTX 4090 (24 GB) puede ejecutar Q5_K_M con contexto moderado; A100 40/80 GB o H100 son adecuadas para Q8_0 con contexto largo. GPUs de 16 GB (como RTX 4080) solo podrían usar Q5_K_M con contexto muy reducido.
- Opciones de despliegue: llama.cpp (llama-cli, llama-mtmd-cli), LM Studio, jan, KoboldCpp, Ollama (si se convierte). Para el modelo completo en safetensors se puede usar Transformers, vLLM o SGLang, pero el repo GGUF está pensado para llama.cpp.
- Latencia y throughput: no disponibles; la model card indica que no se midieron. La ausencia del head MTP (debido a `--no-nextn`) puede reducir la velocidad de decodificación especulativa en comparación con el modelo completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | Apache-2.0 | Modelo original sin abliterar, con negativas activas |
| gjtgjt/Qwen3.8-27B-heretic (FULL) | 27B | 262K | Apache-2.0 | Abliteración single-shot, Keyword 27, KL 0.0446 |
| gjtgjt/Qwen3.8-27B-heretic-r1n (este) | 27B | 262K | Apache-2.0 | Abliteración iterativa rank-1, Keyword 18, KL 0.0931 |

La línea r1n rechaza menos que la línea FULL (18 vs 27 keywords) pero con mayor divergencia KL, lo que implica una mayor alteración de los pesos. En comparación con el modelo base, la diferencia principal es la reducción de negativas, mientras que las capacidades de visión, tool calling y razonamiento se mantienen en teoría, aunque no hay benchmarks que lo confirmen.

## Limitaciones y advertencias

- La abliteración reduce las negativas, pero también puede disminuir la seguridad del modelo: puede generar contenido dañino, sesgado o inapropiado que el modelo base rechazaría. No debe usarse en producción sin salvaguardas adicionales.
- Riesgo de alucinación: al modificar los pesos, la fidelidad factual puede verse afectada; no se han realizado evaluaciones de precisión en esta versión.
- Solo se garantizan los idiomas inglés y chino; el rendimiento en otros idiomas no está documentado.
- Los archivos GGUF no incluyen el head MTP (`--no-nextn`), lo que puede reducir la velocidad de generación en comparación con el modelo completo.
- No se han medido perplejidad, velocidad ni benchmarks de tareas; el rendimiento real es desconocido.
- La licencia Apache-2.0 permite uso comercial, pero la abliteración puede implicar responsabilidades legales si el modelo genera contenido infractor.
- El modelo base tiene una ventana de contexto de 262K tokens, pero el uso de contexto largo requiere una caché KV muy grande, que puede no caber en GPUs de consumo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/gjtgjt/Qwen3.8-27B-heretic-r1n-GGUF
- Modelo completo (safetensors): https://huggingface.co/gjtgjt/Qwen3.8-27B-heretic-r1n
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Línea FULL (single-shot): https://huggingface.co/gjtgjt/Qwen3.8-27B-heretic
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Blog AMD sobre Qwen3.8-27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Página de FriendliAI para inferencia: https://friendli.ai/models/gjtgjt/Qwen3.8-27B-heretic-r1n
- Guía de Qwen3.8-27B (lovableapp): https://lovableapp.org/blog/qwen3-8-27b
- Guía de ejecución local (yottalabs): https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
