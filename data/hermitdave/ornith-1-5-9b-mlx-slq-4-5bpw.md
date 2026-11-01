# hermitdave/Ornith-1.5-9B-MLX-SLQ-4.5bpw

## Resumen

Ornith-1.5-9B-MLX-SLQ-4.5bpw es una cuantizacion del modelo base ornith-ai/Ornith-1.5-9B realizada por el usuario hermitdave mediante su herramienta slq-mlx. Se trata de un checkpoint empaquetado en formato MLX para Apple Silicon que aplica SLQ (Statistically-Lossless Quantization), una asignacion no uniforme de bits por capa con group_size=64, con un objetivo de 4,50 bits por peso que en la practica se mide en 5,00 bpw. El resultado ocupa aproximadamente 9,2 GiB frente a los ~23,0 GiB del base en BF16, una reduccion de unas 2,5 veces.

El modelo base emplea una arquitectura Qwen3_5 hibrida que combina capas de atencion lineal con capas de atencion completa, e incorpora una cabeza MTP (Multi-Token Prediction). Esta cuantizacion conserva dicha cabeza en BF16, extraida del modelo original e injertada como shard independiente (model-graft.safetensors, ~487 MB), para preservar la fidelidad de prediccion. El checkpoint incluye 9.896.394.992 parametros segun los safetensors publicados.

Su relevancia es doble: por un lado permite ejecutar un modelo de ~9B con ventana de contexto propia de la familia Qwen3_5 en equipos Apple Silicon con memoria unificada modesta; por otro, documenta de forma transparente las metricas de fidelidad de la cuantizacion (ratio de perplejidad, KLD simetrica y recuperacion zero-shot por tarea), algo poco habitual en checkpoints cuantizados. La licencia es MIT, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5 hibrida (linear_attention + full_attention) con cabeza MTP |
| Parametros totales | 9.896.394.992 (~9,0B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | SLQ 4-bit no uniforme por capa (8/6/4 bits), group_size=64; objetivo 4,50 bpw, medido 5,00 bpw |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors empaquetado MLX (mlx-packed-affine), requiere trust_remote_code=True |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-9B sigue la arquitectura Qwen3_5, un transformer hibrido que intercala capas de atencion lineal con capas de atencion completa, lo que reduce el coste computacional y de memoria del contexto largo frente a un transformer denso clasico. Ademas incorpora una cabeza de Multi-Token Prediction (MTP) que predice varios tokens por paso y que puede emplearse para decodificacion especulativa o entrenamiento auxiliar. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO en el modelo base.

La cuantizacion se realizo con slq-mlx mediante un asignador greedy por capa con un objetivo EAR (error-aware ratio) de 0,99, calibrado sobre FineWeb-Edu (128 muestras de 2048 tokens, 131.072 tokens en total). La distribucion de bits resultante es de 25 tensores en 8 bits, 43 en 6 bits y 180 en 4 bits. La innovacion principal es el injerto de la cabeza MTP en BF16 sobre el backbone cuantizado, que anade ~487 MB pero evita degradar la fidelidad de prediccion del siguiente token. El checkpoint requiere MLX >= 0.27 y un archivo de arquitectura personalizado (slq_model.py) que envuelve mlx_lm.models.qwen3_5 con capas QuantizedLinear.

## Capacidades

- Generacion de texto conversacional y continuacion de texto, segun el pipeline text-generation declarado.
- Razonamiento de proposito general y respuesta a instrucciones, heredado del modelo base (no verificado de forma independiente en esta ficha).
- Decodificacion multi-token mediante la cabeza MTP conservada en BF16, util para decodificacion especulativa.
- Capacidad de contexto largo potencial gracias a las capas de atencion lineal del backbone Qwen3_5 (longitud exacta no disponible).
- Soporte multilingue: no disponible en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente o vision: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el checkpoint de ~9,2 GiB permite ejecutar un modelo de ~9B en equipos Apple Silicon (por ejemplo, Mac con 16-24 GB de memoria unificada) usando mlx-lm, algo inviable con el base en BF16 (~23 GiB).
- Prototipado rapido de aplicaciones conversacionales: el comando de mlx_lm.generate permite validar prompts y flujos multi-turno en local antes de desplegar en infraestructura mayor.
- Evaluacion de tecnicas de cuantizacion: las metricas de fidelidad publicadas (PPL ratio 1,055, KLD 0,405, recuperacion zero-shot 0,9685) sirven como referencia para comparar SLQ frente a otras tecnicas como GPTQ o AWQ en el mismo backbone.
- Generacion asistida en portatiles sin GPU dedicada: al ejecutarse sobre Metal via MLX, no requiere CUDA ni VRAM dedicada, lo que facilita entornos de desarrollo en macOS.
- Investigacion sobre decodificacion especulativa: la cabeza MTP en BF16 permite experimentar con prediccion multi-token sin reentrenar el modelo.
- Despliegue de bajo consumo en edge Apple: el tamano reducido y la licencia MIT permiten incorporar el modelo en herramientas internas o productos comerciales sin restricciones de licencia.

## Benchmarks y rendimiento

Metricas de fidelidad de la cuantizacion publicadas por el autor (calibracion FineWeb-Edu, 131.072 tokens):

| Metrica | Valor |
|---|---|
| Ratio de perplejidad (FineWeb-Edu, 512 seq) | 1,055 |
| KLD simetrica (FineWeb-Edu, 512 seq) | 0,405 |
| Recuperacion media zero-shot (4 tareas, n=400) | 0,9685 |
| Veredicto task-lossless | No |

Recuperacion por tarea (cap de 400 ejemplos por tarea):

| Tarea | BF16 | SLQ 4.5bpw | Recuperacion | IC 95% |
|---|---|---|---|---|
| arc_challenge | 0,5200 | 0,4950 | 0,9519 | [-0,0568, +0,0068] |
| arc_easy | 0,7775 | 0,7825 | 1,0064 | [-0,0190, +0,0290] |
| hellaswag | 0,5000 | 0,4925 | 0,9850 | [-0,0252, +0,0102] |
| winogrande | 0,5400 | 0,5025 | 0,9306 | [-0,0770, +0,0020] |

Rendimiento medido (TPS, tokens por segundo):

| Modelo | TPS |
|---|---|
| BF16 | 21,3 |
| SLQ 4.5bpw | 20,6 |

No se han publicado resultados de benchmarks del modelo base (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria: ~9,2 GiB para los pesos cuantizados; con overhead de MLX y KV cache se recomienda al menos 12-16 GB de memoria unificada.
- Plataforma: exclusivamente Apple Silicon (MLX >= 0.27); no funciona en GPU NVIDIA ni en CPU x86 con este formato.
- GPU recomendadas: chips Apple M-series (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No aplica A100, H100 ni RTX 4090, ya que el formato es MLX.
- Cabe en consumer hardware: si, en Mac con memoria unificada suficiente (16 GB o mas recomendable).
- Despliegue: mlx-lm (python -m mlx_lm.generate); no compatible directamente con vLLM, llama.cpp, Ollama ni TGI sin conversion de formato.
- Latencia y throughput: ~20,6 TPS medidos en la maquina del autor, practicamente identico al BF16 (21,3 TPS); el hardware exacto de la medicion no se especifica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| Ornith-1.5-9B-MLX-SLQ-4.5bpw | ~9,0B | no disponible | SLQ 4-bit (5,00 bpw medido) | MIT | Apple Silicon (MLX) |
| ornith-ai/Ornith-1.5-9B (BF16) | ~9,0B | no disponible | ninguna (BF16) | MIT | Multiples |
| Qwen3-8B (referencia de familia) | ~8,2B | no disponible en esta ficha | GPTQ/AWQ/GGUF habituales | Apache 2.0 | Multiples |

La comparacion con alternativas cuantizadas de la misma categoria no esta disponible en la informacion proporcionada; no se dispone de datos de rendimiento de otros checkpoints SLQ del mismo backbone.

## Limitaciones y advertencias

- El propio autor declara el veredicto "task-lossless: No": la cuantizacion no es sin perdida en tareas, con caidas notables en winogrande (recuperacion 0,9306) y arc_challenge (0,9519).
- Las metricas zero-shot se calcularon con un cap de 400 ejemplos por tarea frente a los ~15.500 completos, por lo que los intervalos de confianza son amplios y los resultados deben tomarse como orientativos.
- Exclusivo de Apple Silicon: no es desplegable en infraestructura NVIDIA/AMD ni en servidores x86 convencionales.
- Requiere trust_remote_code=True y un archivo de arquitectura personalizado (slq_model.py), lo que implica ejecutar codigo del repositorio y revisar su procedencia antes de usarlo en produccion.
- Sesgos conocidos del modelo base: no disponibles en la informacion proporcionada; al heredar el comportamiento del base, se aplican los sesgos de este.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; la degradacion por cuantizacion puede amplificarlo en tareas de razonamiento fino.
- Idiomas soportados no documentados; no se garantiza cobertura multilingue mas alla de la del modelo base.
- Licencia MIT permite uso comercial sin restricciones adicionales, pero la responsabilidad sobre el codigo personalizado y la fidelidad del checkpoint recae en el usuario.
- El repositorio tiene muy poca traccion (31 descargas, 0 likes) y fue creado en octubre de 2026; no hay validacion comunitaria independiente.

## Enlaces

- Checkpoint cuantizado: https://huggingface.co/hermitdave/Ornith-1.5-9B-MLX-SLQ-4.5bpw
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Licencia del base: https://huggingface.co/ornith-ai/Ornith-1.5-9B/blob/main/LICENSE
- Herramienta de cuantizacion slq-mlx: https://github.com/hermitdave/slq-mlx
- Dataset de calibracion FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
