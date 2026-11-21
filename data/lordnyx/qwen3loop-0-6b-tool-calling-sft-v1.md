# Lordnyx/qwen3loop-0.6b-tool-calling-sft-v1

## Resumen
Qwen3Loop-0.6B-Tool-Calling-SFT es un modelo de lenguaje de 1.192.098.816 parámetros (etiquetado comercialmente como 0.6B) desarrollado por el usuario Lordnyx, especializado en tool calling y function calling en entornos agénticos. Parte de la arquitectura Qwen3 y se distribuye como un checkpoint "desenrollado" (`unrolled`) de 56 capas lógicas a partir de un origen recurrente de 28 bloques físicos, con el objetivo de ser compatible con `transformers`, `llama.cpp`, vLLM, Ollama y LM Studio sin necesidad de `trust_remote_code`.

El modelo aborda un problema concreto: la fiabilidad en la llamada a herramientas en modelos pequeños. Para ello combina un ajuste supervisado (SFT) con refuerzo L2 en el paso 61, una reparación quirúrgica de atención en la capa 49 (`E001`) que elimina un colapso de "late-pass" del checkpoint RL en bruto, y una optimización de pesos en el `lm_head` mediante bundles Pareto-KKT ortogonales (`E002`–`E013`) que tocan solo 6.144 de los 1.192.098.816 parámetros (0,000515%).

Es relevante ahora porque demuestra que intervenciones de peso extremadamente pequeñas y dirigidas pueden elevar sustancialmente el rendimiento agéntico de un modelo sub-1B, con licencia Apache 2.0 y artefactos GGUF listos para desplegar. Su orientación es claramente inglesa y su punto dulce de precisión está en F32/BF16, no en cuantizaciones de 4 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only `Qwen3ForCausalLM` (checkpoint desenrollado de 56 capas lógicas desde 28 bloques físicos recurrentes) |
| Parametros totales | 1.192.098.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 40.960 tokens (`max_position_embeddings`) |
| Tipos de cuantizacion | F32, BF16, F16, Q8_0, Q4_K_M (GGUF); safetensors en precisión completa |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento
El modelo es un `Qwen3ForCausalLM` estándar con `model_type: qwen3`, `hidden_size: 1024`, `intermediate_size: 3072`, 16 cabezas de atención y 8 cabezas KV. Su particularidad es el origen recurrente: 28 bloques físicos desenrollados en la pila media (7 de prefijo + 14 × 3 pasadas de bucle + 7 de sufijo) hasta 56 capas lógicas. La pila triple del medio (capas 7..20, 21..34 y 35..48) permanece idéntica en pesos (`max_diff = 0.0`), mientras que la capa 49 (física 21, fuera del bucle) fue reparada por `E001`. El `lm_head` está destado (`tie_word_embeddings: false`) porque los bundles `E002`–`E013` optimizan 43 filas de `lm_head.weight` de forma independiente de `model.embed_tokens.weight`.

El entrenamiento combina SFT y RL L2 (paso 61) sobre llamadas a herramientas multi-paso, abstención y recuperación a mitad de trayectoria. Sobre esa base se aplican los bundles Pareto-KKT ortogonales en espacio de pesos del `lm_head`, que editan seis filas de salida (19, 1703, 12509, 17453, 23657, 46254) con normas L2 de entre 0,0168 y 0,2710 por fila. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades
- Generación de texto conversacional y razonamiento orientado a tareas.
- Tool calling y function calling multi-paso, con validación específica en escenarios agénticos.
- Abstención explícita cuando la herramienta o los argumentos no son adecuados.
- Recuperación a mitad de trayectoria (mid-trajectory recovery) tras errores de llamada.
- Soporte de agentes con planificación multi-turno, aunque con profundidad limitada por el tamaño.
- Compatibilidad nativa con `llama.cpp`, vLLM, Ollama y LM Studio sin parches de runtime.
- Capacidad multilingüe limitada: entrenamiento y validación mayoritariamente en inglés.

## Casos de uso
- Automatización de agentes de soporte: el modelo puede encadenar llamadas a APIs de consulta de pedidos, estado de cuenta y devoluciones dentro de una ventana de 40.960 tokens, con abstención cuando falta un dato obligatorio.
- Orquestación de herramientas en asistentes de desarrollo: invocación de funciones de búsqueda de código, ejecución de tests y consulta de documentación en pipelines locales, gracias a su soporte nativo de function calling.
- Enrutamiento de intenciones en backends de bajo coste: clasificación de peticiones y selección de la herramienta adecuada en un servicio con presupuesto de VRAM reducido (BF16 en 2,39 GB).
- Prototipado de agentes en estaciones de trabajo con GPU de consumo: ejecutable en una RTX 3060 con `llama-server --jinja -ngl 999 -c 16384 --flash-attn on`, según la evaluación del autor.
- Validación de esquemas de herramientas en CI: uso del modelo para comprobar que descripciones y parámetros de funciones producen llamadas correctas antes de desplegar un agente mayor.
- Recuperación de trayectorias fallidas: integrado como "recovery step" en un agente mayor, el modelo puede reformular una llamada rechazada o corregir argumentos mal extraídos.
- Asistente conversacional local con herramientas ligeras (calendario, clima, conversión de unidades) en entornos sin conectividad, usando GGUF Q8_0 (1,73 GB).

## Benchmarks y rendimiento
Evaluación del autor con `tool-eval-bench` (seed 42, 69 escenarios, contexto de 16k) en una RTX 3060 vía `llama-server`:

| Artefacto / precisión | Tamano | Puntuacion | Puntos | Pass / Partial / Fail | Avisos de seguridad |
|---|---|---|---|---|---|
| Step 61 baseline (`E000`, F32) | — | 24% | 33/136 | — | 3 |
| `E013` F32 | 4,77 GB | 66% | 90/136 | 35 / 20 / 14 | 0 |
| `E013` BF16 | 2,39 GB | 65% | 88/136 | 34 / 20 / 15 | 0 |
| `E013` F16 | 2,39 GB | 64% | 87/136 | 34 / 19 / 16 | 0 |
| `E013` Q8_0 (con `output.weight` en F32) | 1,73 GB | 59% | 80/136 | 32 / 16 / 21 | 0 |
| `E013` Q4_K_M | 0,75 GB | 48% | 66/138 | 23 / 20 / 26 | 2 |

Desglose del F32 canónico: `deployability` 73, `responsiveness` 89, sin regresiones frente a `E011` (80/136) ni `E012` (82/136). Puntos por categoría: A=6/6, B=4/6, C=3/8, D=6/6, E=2/6, F=4/6, G=4/6, H=7/8, I=10/20, J=5/6, K=17/26, L=6/8, M=3/6, N=4/6, O=9/12. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware
- VRAM estimada: unos 4,8 GB en F32, 2,4 GB en BF16/F16, 1,73 GB en Q8_0 y 0,75 GB en Q4_K_M, más el overhead de contexto KV (8 cabezas KV, contexto de hasta 40.960 tokens).
- GPU recomendadas: RTX 3060 (validada por el autor), RTX 4090, A100 o H100 para despliegues concurrentes; cualquier GPU con 2,5 GB libres puede ejecutar BF16.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti, RTX 4070 y superiores; en GPUs de 4 GB conviene Q8_0.
- Opciones de despliegue: `llama.cpp` (`llama-server` con `--jinja`, `-ngl 999`, `--flash-attn on`), Ollama, LM Studio, vLLM y `transformers`.
- Latencia y throughput: no disponibles de forma numérica en la información proporcionada; la evaluación se realizó con contexto de 16k en una RTX 3060.
- Advertencia de despliegue: al usar `llama.cpp -hf` sin tag explícito suele seleccionarse `:Q4_K_M`; pasar siempre `:BF16`, `:F32` o `:Q8_0`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3Loop-0.6B-Tool-Calling-SFT | 1.192.098.816 | 40.960 | Tool calling agéntico especializado | Apache 2.0 | HF (safetensors + GGUF) |
| Qwen3 base (0.6B) | no disponible en la informacion | no disponible en la informacion | Modelo generalista | Apache 2.0 | HF |
| Alternativas sub-1B de tool calling | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks comparativos con otras alternativas de la misma categoría.

## Limitaciones y advertencias
- Sensibilidad a la cuantización: los bundles `E002`–`E013` dependen de ediciones finas en float32 del `lm_head`; Q4_K_M desplaza la geometría de estados ocultos y dispara avisos de seguridad (`TC-48`, `TC-49`). Usar F32 o BF16 siempre que la memoria lo permita.
- Modos de fallo residuales en 0.6B: en F32 con seed 42, 14 de 69 escenarios fallan y 20 reciben crédito parcial, principalmente por extracción compleja de argumentos, profundidad de planificación multi-turno y esquemas de herramientas desconocidos.
- Idioma: entrenamiento y validación abrumadoramente en inglés; las instrucciones en otros idiomas degradan la fiabilidad del tool calling.
- Riesgo de alucinación y de llamadas prematuras: se recomienda gating externo a nivel de aplicación antes de acciones irreversibles (escrituras destructivas, pagos, correos salientes).
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento en producción.
- Tamaño del repositorio: 29,2 GB, lo que incluye múltiples precisiones y artefactos; conviene descargar solo el fichero necesario.

## Enlaces
- Hugging Face: https://huggingface.co/Lordnyx/qwen3loop-0.6b-tool-calling-sft-v1
- GGUF BF16: https://huggingface.co/Lordnyx/qwen3loop-0.6b-tool-calling-sft-v1/blob/main/qwen3loop-0.6b-tool-calling-sft-v1-BF16.gguf
- GGUF F32: https://huggingface.co/Lordnyx/qwen3loop-0.6b-tool-calling-sft-v1/blob/main/qwen3loop-0.6b-tool-calling-sft-v1-F32.gguf
- GGUF F16: https://huggingface.co/Lordnyx/qwen3loop-0.6b-tool-calling-sft-v1/blob/main/qwen3loop-0.6b-tool-calling-sft-v1-F16.gguf
- GGUF Q8_0: https://huggingface.co/Lordnyx/qwen3loop-0.6b-tool-calling-sft-v1/blob/main/qwen3loop-0.6b-tool-calling-sft-v1-Q8_0.gguf
- GGUF Q4_K_M: https://huggingface.co/Lordnyx/qwen3loop-0.6b-tool-calling-sft-v1/blob/main/qwen3loop-0.6b-tool-calling-sft-v1-Q4_K_M.gguf
- Convención de nombres GGUF: https://github.com/ggml-org/ggml/blob/master/docs/gguf.md#gguf-naming-convention
