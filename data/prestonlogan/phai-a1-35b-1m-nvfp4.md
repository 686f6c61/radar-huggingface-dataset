# prestonlogan/Phai-A1-35B-1M-NVFP4

## Resumen

Phai-A1-35B-1M-NVFP4 es una cuantización NVFP4 del modelo PhaiModelLab/Phai-A1-35B-1M, un post-entrenamiento orientado a código y agentes sobre Qwen3.6-35B-A3B. El modelo base es un MoE multimodal de 35B parámetros totales con aproximadamente 3B activos, arquitectura híbrida Gated DeltaNet + Gated Attention y ventana de contexto de 1M tokens mediante YaRN. Esta versión cuantizada la publica el usuario prestonlogan y reduce el peso de 71,9 GB en BF16 a 23,6 GB.

La cuantización se realizó con NVIDIA ModelOpt 0.48.0 en modo PTQ con la configuración NVFP4_DEFAULT_CFG, aplicando W4A4 con group_size 16 a las capas Linear y manteniendo en BF16 el lm_head, embed_tokens, las proyecciones específicas de DeltaNet, las puertas del router y todos los tensores MTP. El checkpoint incluye una reparación manual del config.json para restaurar el layout multimodal que la exportación de ModelOpt había aplanado a text-only.

Su relevancia práctica es doble: por un lado demuestra que un MoE multimodal de 35B puede servirse en hardware de gama workstation (validado en DGX Spark GB10, SM121) con vLLM; por otro, documenta con mediciones concretas el coste de la cuantización en eficiencia de tokens (1,84× peor que BF16 en tareas idénticas) y el comportamiento de un cabezal MTP injertado para decodificación especulativa con un 73,6% de aceptación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido (Gated DeltaNet + Gated Attention), multimodal image-text-to-text |
| Parametros totales | 17.851.937.408 (según safetensors; el autor declara 35B totales / ~3B activos) |
| Parametros activos | ~3B (MoE) |
| Longitud de contexto | 1M tokens (vía YaRN) |
| Tipos de cuantizacion | NVFP4 (W4A4, group_size 16) en capas Linear; BF16 en lm_head, embed_tokens, conv1d/in_proj_a/in_proj_b de DeltaNet, router gates, shared_expert_gate y tensores mtp.* |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 23,6 GB; original BF16 71,9 GB) |

## Arquitectura y entrenamiento

El modelo base es un post-entrenamiento de Qwen3.6-35B-A3B orientado a código y agentes. La arquitectura combina capas Gated DeltaNet (atención lineal con estado recurrente) con capas de Gated Attention clásica, dentro de un esquema Mixture-of-Experts con unos 3B parámetros activos por token sobre 35B totales. Es multimodal (pipeline image-text-to-text) y extiende el contexto hasta 1M tokens mediante YaRN. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el post-entrenamiento de Phai.

La innovación técnica de esta ficha es la cuantización y el injerto del cabezal MTP. El checkpoint Phai declara `mtp_num_hidden_layers: 1` pero no incluye los pesos `mtp.*`; los 19 tensores MTP se copiaron del checkpoint base Qwen/Qwen3.6-35B-A3B y se mantuvieron en BF16. Se trata de un injerto, no de un reentrenamiento conjunto con el post-entrenamiento de Phai. La calibración de ModelOpt usó 48 muestras de 1024 tokens con mezcla de código y prosa. Además, la exportación de ModelOpt había aplanado el config a `qwen3_5_moe_text` sin `vision_config` conservando los pesos de visión; el config.json publicado restaura el layout multimodal original, sin lo cual vLLM lanza `TypeError: Invalid type of HuggingFace config`.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de razonamiento (el autor reporta mayor aceptación especulativa en salidas reasoning-heavy).
- Generación y edición de código, incluyendo tareas de agente con bucle de ficheros y comandos verificado por tests.
- Comprensión de imágenes (pipeline image-text-to-text, pesos de visión conservados y config restaurado).
- Contexto largo de hasta 1M tokens vía YaRN, adecuado para repositorios completos o documentación extensa.
- Decodificación especulativa con cabezal MTP injertado (3 tokens especulativos, 73,6% de aceptación en single-stream).
- Capacidades multilingües: no disponible (no se documentan idiomas).
- Soporte de tool calling / function calling: no disponible explícitamente en la información proporcionada, aunque el bucle de agente con ficheros y comandos sugiere uso agéntico.

## Casos de uso

- Agente de codificación autónomo: el modelo se ha validado en un bucle de agente con ficheros y comandos verificado por tests (16/18 resueltos en la batería corregida), por lo que encaja en pipelines tipo SWE-bench o resolución de issues con verificación automática.
- Asistente de refactorización sobre repositorios grandes: con 1M tokens de contexto puede ingerir múltiples ficheros y mantener coherencia entre módulos sin trocear el código.
- Servicio de inferencia en hardware de gama workstation: los 23,6 GB en NVFP4 permiten desplegarlo en una DGX Spark GB10 con vLLM 0.26.1rc1 y decodificación especulativa, alcanzando 72,6 tok/s en single-stream y 293-304 tok/s con 16-17 peticiones concurrentes.
- Análisis de documentación técnica con imágenes: al conservar los pesos de visión y el config multimodal, puede responder preguntas sobre diagramas, capturas o esquemas junto al texto.
- Generación de código en producción con tool calling: integrable en pipelines de CI/CD para generar parches o tests, aunque la verbosidad medida (3.521-3.666 tokens por tarea resuelta) obliga a presupuestar coste de salida.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir el impacto de NVFP4 frente a BF16 en un MoE multimodal, con KL media de 0,147 nats y 92,5% de acuerdo top-1.

## Benchmarks y rendimiento

Calidad de cuantización (KL vs BF16, corpus de 1.945 tokens, temperatura 0, top-20):

| Metrica | Valor |
|---|---|
| Posiciones comparadas | 1.944 |
| KL media (BF16 ‖ NVFP4) | 0,147 nats |
| KL mediana | 0,002 |
| KL p95 | 0,784 |
| Acuerdo top-1 siguiente token | 92,5% |

Decodificación especulativa MTP (DGX Spark GB10, SM121, vLLM 0.26.1rc1):

| Metrica | Valor |
|---|---|
| Tasa de aceptación del draft | 73,6% single-stream; 74,8% bajo carga batch |
| Aceptación por posición (0/1/2) | 88% / 72% / 61% |
| Decode con MTP | 72,6 tok/s |
| Agregado batch (16-17 concurrentes) | 293-304 tok/s |

Batería de codificación, experimento A (3 modelos, 10 tareas originales, 1 semilla):

| Modelo | Resueltas | Tokens de salida | Tiempo | Tokens/resuelta |
|---|---|---|---|---|
| Phai-A1-35B-1M (BF16) | 9/10 | 17.209 | 645 s | 1.912 |
| Phai-A1-35B-1M (NVFP4) | 9/10 | 31.688 | 538 s | 3.521 |
| Qwen3.6-35B-A3B (fp4) | 9/10 | 59.694 | 815 s | 6.633 |

Batería de codificación, experimento B (solo NVFP4, 10 tareas corregidas, 4 semillas, 18 ejecuciones):

| Metrica | Valor |
|---|---|
| Resueltas | 16/18 (88,9%) |
| Tokens de salida totales | 58.657 |
| Tokens por tarea resuelta | 3.666 |
| Tokens por ejecución (mediana) | 1.844 |

Nota del autor: las cifras de eficiencia de tokens de los experimentos A y B no son intercambiables; A es el único con modelos comparables y B el único con tareas válidas. Dos tareas de A (`fix_lru_evict` e `implement_task_queue`) resultaron defectuosas y afectaron por igual a los tres modelos.

## Requisitos de hardware

- VRAM estimada: ~24 GB para los pesos NVFP4 (23,6 GB de repo) más KV cache y overhead de vLLM; el contexto de 1M tokens exige planificación cuidadosa de memoria.
- GPU recomendadas: validado en NVIDIA DGX Spark GB10 (SM121); el formato NVFP4 requiere soporte de cuantización FP4 en hardware (Blackwell o posterior). No se documenta funcionamiento en A100, H100 ni RTX 4090.
- GPU consumer: no disponible; NVFP4 no es un formato estándar para GPUs consumer tipo RTX 4090, y no hay validación publicada.
- Despliegue: vLLM 0.26.1rc1 con `--speculative-config '{"method":"mtp","num_speculative_tokens":3}'`; vLLM detecta la ruta `qwen3_5_mtp` desde `model_type: qwen3_5_moe`. No se documentan opciones llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: 72,6 tok/s en decode single-stream con MTP; 293-304 tok/s agregados con 16-17 peticiones concurrentes. El autor advierte que la comparación de 72,6 frente a 55 tok/s sin MTP no es limpia porque usó otra versión de vLLM, otro backend MoE y otro dtype de KV cache.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Phai-A1-35B-1M-NVFP4 | 35B totales / ~3B activos | 1M (YaRN) | Apache 2.0 | safetensors NVFP4 | Cuantizado, multimodal, MTP injertado |
| Phai-A1-35B-1M (BF16) | 35B totales / ~3B activos | 1M (YaRN) | Apache 2.0 | safetensors BF16 | Original sin cuantizar, 71,9 GB; 9/10 en experimento A |
| Qwen3.6-35B-A3B | 35B totales / ~3B activos | no disponible | no disponible | fp4 en la comparativa | Base del post-entrenamiento; 9/10 en experimento A, 76 tok/s |

## Limitaciones y advertencias

- Regresión de eficiencia de tokens frente a BF16: 1,84× medida en tareas idénticas (1.912 → 3.521 tokens/resuelta), corroborada por la cola pesada de la KL (p95 0,784). Esperar salidas más verbosas que el original.
- El 7,5% de las posiciones cambian el token top-1 predicho; hay deriva a nivel de token aunque la resolución de tareas se preserve.
- Patología de bucle: en una tarea y semilla el modelo generó durante más de 20 minutos sin terminar. El comportamiento repetitivo es una característica real bajo prompting agéntico.
- El cabezal MTP es un injerto desde Qwen3.6-35B-A3B, no reentrenado con el post-entrenamiento de Phai; su aceptación (73,6%) es buena pero no está garantizada en todos los dominios (baja a ~48% en salida repetitiva de escritura de ficheros).
- La comparación de velocidad 72,6 vs 55 tok/s no aísla el efecto de MTP por diferencias de versión de vLLM, backend MoE y dtype de KV cache.
- Dos tareas de la batería A eran defectuosas e inflan las puntuaciones de los tres modelos por igual; no sesgan el ranking pero sí los valores absolutos.
- El config.json requirió reparación manual; versiones de vLLM sin el layout multimodal restaurado fallarán al cargar.
- Idiomas soportados no documentados; no hay evaluación multilingüe publicada.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan sesgos ni evaluación de alucinación.

## Enlaces

- Hugging Face: https://huggingface.co/prestonlogan/Phai-A1-35B-1M-NVFP4
- Modelo base: https://huggingface.co/PhaiModelLab/Phai-A1-35B-1M
- Checkpoint Qwen de referencia para el injerto MTP: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Paper, blog, repositorio o demo adicionales: no disponible
