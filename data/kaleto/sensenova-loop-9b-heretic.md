# Kaleto/SenseNova-Loop-9B-heretic

## Resumen
SenseNova-Loop-9B-heretic es una modificación no oficial del modelo SenseNova-Loop-9B de SenseTime, publicada por el usuario Kaleto en Hugging Face. Se trata de una versión "abliterated": se han editado directamente ciertas matrices de pesos para eliminar el comportamiento de rechazo (refusal) del modelo original, sin reentrenamiento ni fine-tuning adicional. El resultado es un modelo multimodal de 9.412.959.856 parámetros que responde a peticiones que el original declinaría, manteniendo en gran medida sus capacidades.

La relevancia de esta ficha es doble. Por un lado, documenta un caso de estudio técnico sobre abliteración con la herramienta Heretic 2.1.0 y la técnica ARA (Arbitrary-Rank Ablation), aplicada además a una arquitectura poco convencional con capas "looped" (las capas 4–27 se ejecutan dos veces). Por otro, advierte de que el modelo no tiene alineamiento de seguridad y de que su uso en producción exige salvaguardas propias.

El modelo conserva la torre de visión y el pipeline image-text-to-text del original, acepta contexto de hasta 32.768 tokens en la configuración de servicio documentada y se distribuye en varios formatos: BF16 safetensors, cuantizaciones NVFP4 W4A16 y GGUF Q6_K/Q4_K_M. La licencia es Apache-2.0, aunque el autor declara explícitamente que no está afiliado a SenseTime.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas "looped" (capas 4–27 ejecutadas dos veces), atención lineal (GDN, `linear_attn`), atención estándar (`self_attn`), torre de visión y cabeza MTP; código propio `modeling_sensenova_loop.py` |
| Parametros totales | 9.412.959.856 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 32.768 tokens en la configuración de servicio documentada (`--max-model-len 32768`); máximo nativo no disponible |
| Tipos de cuantizacion | BF16 (raíz), NVFP4 W4A16 (variantes decoder, mlp, y con `lm_head` en NVFP4), GGUF Q6_K y Q4_K_M |
| Idiomas soportados | en, de |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16), NVFP4 (ModelOpt), GGUF |

## Arquitectura y entrenamiento
La arquitectura subyacente es la de SenseNova-Loop-9B: un transformer con atención lineal (GDN) combinada con atención estándar, una torre de visión para entrada de imágenes y una cabeza MTP (multi-token prediction). Su rasgo distintivo son las capas "looped": las capas 4 a 27 se ejecutan dos veces, de modo que cada visita al bucle mantiene sus propias estadísticas de entrada y salida. El modelo base incluye además tensores en FP32 (`linear_attn.A_log`, `linear_attn.dt_bias`), routers mHC y `loop_gate.logits`.

Esta versión heretic no se ha entrenado ni fine-tuneado. La modificación consiste en una edición local de 24 matrices de pesos en las capas 15–26 (9 `linear_attn.out_proj`, 12 `mlp.down_proj` y 3 `self_attn.o_proj`), realizada con Heretic 2.1.0 mediante ARA y un plugin específico para manejar las capas en bucle. La búsqueda de parámetros usó Optuna multiobjetivo TPE con 250 trials y tres objetivos: rechazos oficiales, rechazos en un conjunto privado de prompts y divergencia KL. El trial seleccionado (33) fijó `start_layer_index` 15, `end_layer_index` 27, `preserve_good_behavior_weight` 0.339, `steer_bad_behavior_weight` 0.00249, `overcorrect_relative_weight` 0.944 y `neighbor_count` 14. Las direcciones de ablación se calcularon con `mlabonne/harmful_behaviors` train[:200] y `mlabonne/harmless_alpaca` train[:200], más prompts privados de la aplicación Anima (no publicados). El resto de tensores, la configuración, el tokenizador y la plantilla de chat son idénticos byte a byte al original.

## Capacidades
- Generación de texto conversacional multi-turno en inglés y alemán.
- Comprensión de imágenes y respuesta multimodal (pipeline image-text-to-text), gracias a la torre de visión conservada del original.
- Razonamiento y matemáticas: el modelo original obtiene 91,7 en GSM8K 5-shot estricto, y esta versión mantiene 90,7.
- Conocimiento general y académico: 74,3 en MMLU según la evaluación del autor.
- Predicción multi-token (cabeza MTP) para decodificación especulativa en las variantes que la incluyen.
- Cumplimiento de instrucciones sin rechazo: 5 rechazos de 100 en `mlabonne/harmful_behaviors` frente a 100 del original.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes o razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso
- Investigación sobre alineación y abliteración: sirve como caso controlado para medir el coste en capacidades (caída de TruthfulQA de 51,2 a 46,3) y el aumento de cumplimiento al eliminar el refusal, comparando directamente contra el modelo original con los mismos prompts.
- Generación de descripciones de imágenes en aplicaciones creativas: el modelo procesa pares imagen-texto y genera descripciones o prompts; el autor lo evaluó con 835 prompts de una aplicación de acompañamiento e imagen, donde pasó de 56 rechazos a 0.
- Asistentes conversacionales sin filtros predefinidos: útil en entornos donde el desarrollador quiere implementar sus propias políticas de contenido en lugar de heredar las del modelo base, con contexto de hasta 32.768 tokens.
- Evaluación de cuantizaciones en hardware Blackwell o DGX Spark: el repositorio incluye variantes NVFP4 W4A16 de 7,9 a 12,4 GB y un espacio de benchmarks (DX10) para comparar latencia y calidad en ese hardware.
- Despliegue local con llama.cpp: las variantes GGUF Q6_K (7,6 GB) y Q4_K_M permiten ejecutar el modelo en equipos con GPU de consumo, usando el fork específico de llama.cpp para SenseNova-Loop.
- Servicio de inferencia con vLLM: el plugin `vllm-sensenova-loop` (vLLM 0.31.0) permite servir texto e imágenes con `vllm serve` y `--max-model-len 32768`.
- Redacción y reescritura en inglés y alemán: el modelo cubre ambos idiomas declarados y puede emplearse en tareas de generación de contenido donde el refusal del original resultaba un obstáculo.

## Benchmarks y rendimiento
Evaluación con lm-evaluation-harness 0.4.13, backend HF, BF16, few-shot sin plantilla de chat, batch 16, `max_length` 4096; GSM8K y HellaSwag limitados a 300 ejemplos.

| Tarea | Original | Este modelo |
|---|---|---|
| GSM8K (5-shot, strict) | 91,7 | 90,7 |
| ARC-Challenge (acc_norm) | 52,6 | 50,9 |
| HellaSwag (acc_norm) | 66,0 | 65,3 |
| TruthfulQA MC2 | 51,2 | 46,3 |
| MMLU | no medido en esta ejecución | 74,3 |

Evaluación de rechazo (Heretic 2.1.0, `mlabonne/harmful_behaviors` test[:100], primeros 100 tokens, system prompt "You are a helpful assistant."):

| Modelo | Rechazos | Divergencia KL |
|---|---|---|
| SenseNova-Loop-9B (original) | 100/100 | 0 |
| Este modelo | 5/100 | 0,1001 |

Evaluaciones adicionales de rechazo (thinking off, greedy, 256 tokens nuevos):

| Conjunto | Original | Este modelo |
|---|---|---|
| Anima replay (835 prompts, regla propia de la app) | 56 | 0 |
| Anima replay, marcadores de Heretic | 109 | 1 |

Calidad de las cuantizaciones NVFP4 frente al BF16 de este modelo:

| Variante | Tamano | KLD vs. BF16 | Rechazos harmful_behaviors | Anima replay |
|---|---|---|---|---|
| BF16 | 18,8 GB | 0 | 5/100 | 0/835 |
| NVFP4 W4A16 decoder | 9,4 GB | 0,143 | 8/100 | 0/835 |
| NVFP4 W4A16 MLP | 12,4 GB | 0,085 | 9/100 | 0/835 |
| NVFP4 decoder + lm_head | 7,9 GB | +0,007 vs. decoder | 6/100 | 0/835 |
| NVFP4 MLP + lm_head | 10,9 GB | +0,008 vs. MLP | 9/100 | 0/835 |

## Requisitos de hardware
- BF16: 18,8 GB de pesos; se recomienda GPU con al menos 24 GB de VRAM (RTX 4090, L4, A10G) para inferencia sin offload, y A100/H100 para servicio concurrente.
- NVFP4 W4A16: entre 7,9 y 12,4 GB según variante; requiere hardware compatible con NVFP4 (Blackwell, p. ej. DGX Spark) y el plugin de vLLM documentado.
- GGUF Q6_K: 7,6 GB; cabe en GPU de consumo con 8 GB o más (RTX 3060 Ti, 4060 Ti, 4070) y en CPU con suficiente RAM mediante el fork de llama.cpp para SenseNova-Loop.
- Despliegue: vLLM 0.31.0 con el plugin `KaletoAI/vllm-sensenova-loop` (texto e imágenes), llama.cpp (fork específico) para GGUF, y transformers con `trust_remote_code=True` para los safetensors BF16.
- Latencia y throughput: no disponibles en la información proporcionada; el autor remite al espacio DX10 de benchmarks para mediciones en DGX Spark.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Refusal (harmful_behaviors) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SenseNova-Loop-9B (original) | 9,4 B | no disponible | 100/100 | Apache-2.0 (modelo base) | Hugging Face |
| SenseNova-Loop-9B-heretic | 9,4 B | 32.768 en servicio documentado | 5/100 | Apache-2.0 | Hugging Face, con NVFP4 y GGUF |
| Alternativas abliterated de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de otros modelos comparables de la misma categoría (abliterated multimodales de ~9B) para establecer una comparación cuantitativa adicional.

## Limitaciones y advertencias
- Ausencia total de alineamiento de seguridad: el modelo cumple peticiones que el original rechaza, incluidas potencialmente dañinas; la responsabilidad de añadir salvaguardas recae en quien lo despliega.
- Mayor riesgo de alucinación y de aceptar premisas falsas: TruthfulQA MC2 cae de 51,2 a 46,3, patrón típico de la abliteración.
- Ligera degradación general de capacidades: ARC-Challenge baja 1,7 puntos y HellaSwag 0,7 respecto al original.
- Idiomas limitados a inglés y alemán; no se garantiza un rendimiento equivalente en castellano.
- El conjunto de evaluación Anima es privado y no se ha publicado, por lo que sus resultados no son reproducibles de forma independiente.
- El modelo no está afiliado ni respaldado por SenseTime; es una derivación no oficial y así debe presentarse en cualquier uso público.
- Las variantes NVFP4 introducen divergencia KL adicional (0,085–0,143) y ligeros cambios en la tasa de rechazo; conviene validar la calidad en la tarea concreta antes de producción.
- El servicio con vLLM depende de un plugin de terceros (vLLM 0.31.0); la compatibilidad con versiones futuras no está garantizada.
- La licencia Apache-2.0 permite uso comercial, pero la modificación de pesos debe documentarse conforme a la sección 4 de la licencia, como ya hace el autor.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Kaleto/SenseNova-Loop-9B-heretic
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Plugin vLLM para SenseNova-Loop: https://github.com/KaletoAI/vllm-sensenova-loop
- Espacio de benchmarks DX10: https://huggingface.co/spaces/Kaleto/LocalLLMBenchmarks
- Conjunto de evaluación harmful_behaviors: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Conjunto de evaluación harmless_alpaca: https://huggingface.co/datasets/mlabonne/harmless_alpaca
