# ShoopyShoops/Parable-Qwen3-8B-Claude-Fable-5-Heretic-GGUF

## Resumen

Parable-Qwen3-8B-Claude-Fable-5-Heretic-GGUF es una cuantizacion GGUF del modelo AnkitAI/Parable-Qwen3-8B-Claude-Fable-5, un fine-tuning de Qwen3-8B orientado a razonamiento, codigo y uso agéntico. El autor, ShoopyShoops, aplica sobre el modelo base una ablacion de la direccion de rechazo de seguridad (abliteration) mediante Arbitrary-Rank Ablation (ARA) con la herramienta Heretic, seguida de un merge del adaptador LoRA resultante y una cuantizacion en 26 variantes GGUF calibradas con importance matrix.

El modelo conserva la arquitectura transformer de Qwen3 con 8.190.735.360 parametros totales y anade un conjunto de capacidades orientadas a agentes (tool calling, planificacion multi-paso, modo thinking) heredadas del fine-tuning original. El objetivo declarado es eliminar el comportamiento de rechazo del modelo (reducido del 100% al 2% segun el autor) manteniendo intactas las capacidades de razonamiento y codigo, con una divergencia KL final de solo 0.000557 nats respecto al modelo sin abliterar.

Su relevancia practica radica en que ofrece un modelo de 8B sin censura, con pesos GGUF listos para llama.cpp/Ollama, cuantizaciones desde IQ1 hasta Q8_0 y F16, y una licencia Apache 2.0 que permite uso comercial. La ficha se centra en la version cuantizada publicada; los datos de arquitectura y entrenamiento del modelo base no estan documentados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_NL, IQ4_XS, Q4_1, Q4_0, Q3_K_L, Q3_K_M, IQ3_M, IQ3_S, IQ3_XS, Q3_K_S, IQ3_XXS, Q2_K, IQ2_M, Q2_K_S, IQ2_S, IQ2_XS, IQ2_XXS, IQ1_S (26 variantes en total) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (libreria gguf, compatible con llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un fine-tuning de Qwen3-8B, un transformer denso de aproximadamente 8.2 mil millones de parametros. Sobre ese modelo, el autor aplica Arbitrary-Rank Ablation (ARA) con la herramienta Heretic (p-e-w/heretic) para eliminar la direccion de rechazo de seguridad. La intervencion se concentra en las capas 17 a 24 del transformer, usando 400 pares de prompts contrastivos (mlabonne/harmful_behaviors frente a mlabonne/harmless_alpaca). Se selecciono el Trial 57 de un frente de Pareto, con rango 50 y `preserve_row_magnitudes = true`, que reduce la tasa de rechazo del 100% al 2.0% con una divergencia KL de evaluacion de 0.0089 nats.

Posteriormente, el adaptador LoRA abliterado se fusiona de vuelta en los pesos BF16 originales, shard a shard, para producir un modelo base independiente. La cuantizacion se realiza con llama.cpp: se genera una importance matrix (`imatrix.dat`) sobre 100 fragmentos de WikiText-2 con `llama-imatrix` y se producen 26 variantes GGUF con `llama-quantize`, desde F16 hasta IQ1_S. El autor reporta que las capas 0-16 mantienen divergencia KL de 0.000000 y que la capa final 35 converge a 0.000557 nats, lo que indica que la intervencion queda contenida en el subespacio de rechazo.

No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo base, la composicion del dataset original ni si hubo RLHF o DPO en el fine-tuning de AnkitAI.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento y modo thinking (etiqueta `thinking` en el modelo).
- Generacion y asistencia de codigo (etiqueta `coding`).
- Uso agéntico: planificacion multi-paso y comportamiento orientado a agentes (etiqueta `agentic`).
- Tool calling / function calling, heredado del modelo base (no verificado de forma independiente en la informacion disponible).
- Comportamiento sin censura: tasa de rechazo reducida al 2.0% segun el autor.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- Multilingue: solo se declara ingles; no hay evidencia de soporte de otros idiomas.

## Casos de uso

- Asistente de codigo en local: el modelo puede integrarse en editores o CLI mediante llama.cpp u Ollama con la variante Q4_K_M (4.68 GB), adecuada para equipos con 8 GB de VRAM.
- Agente autonomo en pipelines de automatizacion: sus capacidades de planificacion multi-paso y tool calling permiten orquestar tareas encadenadas (consulta de APIs, ejecucion de comandos, resumen de resultados) en entornos controlados.
- Procesamiento de texto sin restricciones de contenido: util para investigacion sobre seguridad, red teaming y evaluacion de sesgos, donde el comportamiento de rechazo del modelo base interferiria con la recogida de datos.
- Generacion de codigo en produccion: con la variante Q5_K_M (5.45 GB, recomendada por el autor para uso general) se obtiene un equilibrio entre calidad y huella de memoria para tareas de autocompletado y refactorizacion.
- Despliegue en hardware de consumo: las variantes IQ3 e IQ2 (2.3-3.6 GB) permiten ejecutar el modelo en GPUs de 4-6 GB o en CPU con llama.cpp, a costa de un aumento de perplejidad de entre 0.3 y 5.4 puntos.
- Archivado y evaluacion de referencia: la variante Q8_0 (8.11 GB, delta de perplejidad de +0.0040) sirve como referencia casi sin perdida para comparar resultados entre cuantizaciones.
- Chat multi-turno en ingles: el modelo esta etiquetado como conversacional y soporta dialogos encadenados, aunque la longitud de contexto no esta documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros). El autor solo reporta metricas de perplejidad y divergencia KL sobre WikiText-2 para las cuantizaciones:

| Cuantizacion | Tamano (GB) | Perplejidad | Delta PPL vs F16 | KL media | Recomendacion del autor |
|---|---:|---:|---:|---:|---|
| F16 | 15.26 | 9.7504 | 0.0000 | 0.000000 | Referencia |
| Q8_0 | 8.11 | 9.7544 | +0.0040 | 0.001992 | Archivo casi sin perdida |
| Q6_K | 6.26 | 9.7828 | +0.0324 | 0.004796 | Alta precision |
| Q5_K_M | 5.45 | 9.7868 | +0.0364 | 0.008073 | Uso general recomendado |
| Q4_K_M | 4.68 | 9.8927 | +0.1423 | 0.022082 | Equilibrado (8 GB VRAM) |
| IQ4_XS | 4.25 | 9.8710 | +0.1206 | 0.027945 | 4-bit compacto |
| Q3_K_M | 3.84 | 10.3273 | +0.5769 | 0.071714 | 3-bit medio |
| Q2_K | 3.06 | 11.2010 | +1.4506 | 0.218517 | 2-bit estandar |
| IQ2_XXS | 2.32 | 15.1532 | +5.4028 | 0.644333 | 2-bit extremo |

## Requisitos de hardware

- VRAM estimada (solo pesos, sin overhead de contexto): 15.26 GB para F16, 8.11 GB para Q8_0, 5.45 GB para Q5_K_M, 4.68 GB para Q4_K_M, 2.32 GB para IQ2_XXS.
- GPU recomendadas: A100 o H100 para F16 con contexto largo; RTX 4090 (24 GB) para Q8_0 y superiores; RTX 3090/4080 (16 GB) para Q6_K y Q5_K_M.
- GPU de consumo: Q4_K_M (4.68 GB) cabe en GPUs de 8 GB como RTX 3060 Ti, RTX 4060 o RTX 3070; las variantes IQ3 e IQ2 caben en GPUs de 4-6 GB.
- Despliegue: llama.cpp (formato nativo), Ollama, y servidores compatibles con GGUF como llama-cpp-python o text-generation-webui. vLLM y TGI no soportan GGUF de forma nativa en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Parable-Qwen3-8B-Claude-Fable-5-Heretic-GGUF | 8.19B | no disponible | Apache 2.0 | GGUF | Sin censura, 26 cuantizaciones |
| Qwen3-8B (original) | 8.2B | no disponible | Apache 2.0 | safetensors, GGUF | Modelo base de referencia, con rechazo de seguridad |
| AnkitAI/Parable-Qwen3-8B-Claude-Fable-5 | 8.19B | no disponible | Apache 2.0 | safetensors | Modelo base sin abliterar |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. Otras alternativas de 8B sin censura (por ejemplo, variantes Dolphin o abliterated de Llama 3.1 8B) no estan documentadas en la informacion disponible.

## Limitaciones y advertencias

- Modelo abliterado: la eliminacion de la direccion de rechazo reduce las salvaguardas de seguridad; puede generar contenido danino, ilegal o no apto para produccion sin moderacion adicional.
- Solo ingles declarado: no hay evidencia de soporte multilingue; el rendimiento en castellano u otros idiomas no esta verificado.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento en conversaciones largas ni en tareas de retrieval con contexto extenso.
- Riesgo de alucinacion: inherente a los modelos de 8B; no hay evaluaciones de factualidad publicadas.
- Sesgos: no se han publicado analisis de sesgos del modelo base ni de la version abliterada.
- La ablacion se aplico en las capas 17-24; aunque el autor reporta divergencia KL baja, no hay evaluacion independiente de que las capacidades de razonamiento y codigo se conserven intactas.
- El repositorio ocupa 121.5 GB por incluir las 26 variantes; la descarga completa no es necesaria, basta con el archivo GGUF de la cuantizacion elegida.
- Licencia Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad legal del contenido generado por un modelo sin censura.
- Los datos de la model card son autoinformados por el autor y no han sido verificados de forma independiente.

## Enlaces

- Hugging Face: https://huggingface.co/ShoopyShoops/Parable-Qwen3-8B-Claude-Fable-5-Heretic-GGUF
- Modelo base: https://huggingface.co/AnkitAI/Parable-Qwen3-8B-Claude-Fable-5
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Dataset de calibracion de rechazo: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Dataset de calibracion de no rechazo: https://huggingface.co/datasets/mlabonne/harmless_alpaca
- llama.cpp: https://github.com/ggml-org/llama.cpp
