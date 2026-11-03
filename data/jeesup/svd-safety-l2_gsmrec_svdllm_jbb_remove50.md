# Jeesup/svd-safety-l2_gsmrec_svdllm_jbb_remove50

## Resumen

Este repositorio contiene un artefacto de investigación derivado de Llama-2-7b-chat, comprimido mediante la técnica SVD-LLM con una eliminación del 50 % de los parámetros y un posterior ajuste de recuperación con LoRA sobre el conjunto de entrenamiento de GSM8K. Lo publica el usuario Jeesup como parte del proyecto svd_safety, cuyo objetivo es estudiar el efecto de la compresión por descomposición en valores singulares sobre las capacidades de razonamiento matemático y los comportamientos de seguridad de un modelo conversacional de 7 000 millones de parámetros.

El modelo resultante conserva la arquitectura transformer decoder-only de Llama 2, con 6 738 415 616 parámetros efectivos en safetensors, y mantiene la plantilla de chat original. No es un asistente de propósito general: la propia model card advierte que algunas celdas están deliberadamente degradadas en seguridad o sobre-rechazan peticiones, y que debe evaluarse antes de cualquier uso.

Su relevancia es metodológica más que práctica: documenta con métricas concretas (perplejidad en WikiText-2, medias zero-shot, tasas de ataque exitoso en AdvBench y StrongREJECT, sobre-rechazo en XSTest y OR-Bench) cómo interactúan la compresión agresiva y el ajuste de recuperación con GSM8K, lo que resulta útil para quienes investigan compresión de modelos, alineamiento y evaluación de seguridad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), comprimido con SVD-LLM |
| Parámetros totales | 6 738 415 616 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Llama-2-7b-chat: 4 096 tokens) |
| Tipos de cuantización | no disponible (pesos en safetensors sin cuantizar en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La base es Llama-2-7b-chat, un transformer decoder-only con normalización RMSNorm, activación SwiGLU y atención multi-cabeza con RoPE. Sobre esa base se aplica SVD-LLM, un método de compresión que descompone las matrices de pesos y trunca componentes singulares hasta eliminar el 50 % de los parámetros. La calibración para la descomposición se realizó con una mezcla de WikiText-2 y respuestas dañinas de JBB (JailbreakBench) replicadas 13 veces, semilla 42.

Tras la compresión se entrenó un LoRA de recuperación sobre el split de entrenamiento de GSM8K (7 473 problemas en formato Alpaca, corte de 512 tokens, con un split de validación de 500), en lugar del habitual alpaca-cleaned, y se fusionó en los pesos. El pipeline corresponde al script `jobs/gsmrec_slurm.sh` del proyecto svd_safety. No se documentan en la información disponible el número total de tokens de entrenamiento, la composición completa del dataset ni si hubo RLHF o DPO adicionales.

## Capacidades

- Generación de texto conversacional con la plantilla de chat de Llama 2.
- Razonamiento aritmético básico: el ajuste de recuperación con GSM8K busca preservar cierta capacidad matemática tras la compresión.
- Evaluación de seguridad: el modelo está diseñado para medir tasas de ataque exitoso (ASR) frente a prompts dañinos de AdvBench y StrongREJECT.
- Medición de sobre-rechazo: útil para analizar comportamiento de rechazo excesivo en XSTest y OR-Bench-Hard.
- Seguimiento de instrucciones evaluable con IFEval (resultado muy bajo, ver benchmarks).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Investigación en compresión de modelos: comparar el efecto de SVD-LLM al 50 % frente a poda, cuantización o destilación sobre un mismo modelo base, usando las métricas publicadas como línea base reproducible.
- Estudio de alineamiento y seguridad: analizar por qué un modelo comprimido y recuperado con datos matemáticos mantiene ASR de 0,00 en AdvBench y StrongREJECT según el juez HarmBench, y qué implicaciones tiene para la robustez frente a jailbreaks.
- Análisis de sobre-rechazo: emplear los resultados en XSTest (81,94 % de sobre-rechazo seguro, 90,80 % puntuado) y OR-Bench-Hard-1k (97,47 % / 98,79 %) para estudiar cómo la compresión y el ajuste con GSM8K alteran la calibración de los rechazos.
- Evaluación de la degradación de capacidades: usar el modelo como caso de estudio de la caída de rendimiento en tareas zero-shot (media de 39,63 % en 7 tareas) y en IFEval (7,95 % estricto a nivel de prompt) tras la compresión.
- Reproducibilidad de experimentos: servir el modelo con transformers y text-generation-inference para replicar las mediciones de la model card con la misma plantilla de chat.
- Docencia y formación: ilustrar en cursos de machine learning los compromisos entre tamaño, perplejidad (18,66 en WikiText-2) y capacidades downstream en modelos comprimidos.
- Línea base para métodos de recuperación: comparar estrategias de LoRA de recuperación (GSM8K frente a alpaca-cleaned) sobre el mismo checkpoint comprimido.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor:

| Métrica | Valor |
|---|---|
| Perplejidad en WikiText-2 | 18,66 |
| Media zero-shot en 7 tareas | 39,63 % |
| AdvBench ASR (juez HarmBench) | 0,00 % |
| StrongREJECT ASR (juez HarmBench) | 0,00 % |
| XSTest sobre-rechazo seguro (WildGuard) / puntuado | 81,94 % / 90,80 % |
| OR-Bench-Hard-1k sobre-rechazo / puntuado | 97,47 % / 98,79 % |
| GSM8K 5-shot estricto / flexible (plantilla de chat) | 9,78 % / 10,46 % |
| IFEval estricto a nivel de prompt | 7,95 % |

No se han publicado en la información disponible comparaciones directas con otros modelos en estos benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 13,5 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 16 GB.
- En cuantización de 8 bits: aproximadamente 7 GB de pesos; en 4 bits, alrededor de 3,5-4 GB, aunque el repo no distribuye versiones cuantizadas y habría que generarlas.
- GPU recomendadas: A100 40/80 GB o H100 para servir en fp16 con lotes amplios; RTX 4090 (24 GB) para fp16 en lote pequeño; RTX 3090/4080 (16-24 GB) para fp16 ajustado o 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 y RTX 3090 en fp16 con lote pequeño, y en GPUs de 8-12 GB si se cuantiza a 4 bits.
- Opciones de despliegue: transformers, text-generation-inference (etiqueta endpoints_compatible), llama.cpp/Ollama tras conversión a GGUF, y vLLM si se valida la compatibilidad de la arquitectura comprimida.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Jeesup/svd-safety-l2_gsmrec_svdllm_jbb_remove50 | 6 738 415 616 | no disponible | Llama 2 Community | Comprimido al 50 % con SVD-LLM y recuperado con GSM8K; artefacto de investigación |
| meta-llama/Llama-2-7b-chat-hf | 6 738 415 616 | 4 096 | Llama 2 Community | Modelo base sin comprimir; referencia natural para medir la degradación |
| Modelos de 7B comprimidos por poda o cuantización (por ejemplo, variantes GGUF de Llama 2) | ~7 000 millones | 4 096 | Llama 2 Community | Alternativas de compresión con objetivos y métricas distintas; no disponibles resultados comparables en la información |

No se dispone de datos de benchmarks de alternativas en la información proporcionada para establecer una comparación cuantitativa directa.

## Limitaciones y advertencias

- Artefacto de investigación: la model card indica explícitamente que no es un asistente de propósito general y que algunas celdas están degradadas en seguridad o sobre-rechazan de forma deliberada.
- Sobre-rechazo elevado: 81,94 % en XSTest y 97,47 % en OR-Bench-Hard-1k, lo que implica que rechazará muchas peticiones benignas.
- Rendimiento muy bajo en seguimiento de instrucciones (IFEval 7,95 % estricto) y en matemáticas (GSM8K 9,78 % estricto), pese al ajuste de recuperación con GSM8K.
- Riesgo de alucinación: no se documenta una evaluación específica; la compresión agresiva y el bajo rendimiento zero-shot sugieren mayor propensión a errores factuales.
- Idiomas: no se documenta qué idiomas conserva tras la compresión; el base Llama 2 está entrenado mayoritariamente en inglés.
- Licencia Llama 2 Community: restricciones de uso comercial y obligaciones de atribución según LICENSE.txt y USE_POLICY.md incluidos en el repo; no es una licencia permisiva tipo Apache 2.0.
- Contexto: no se confirma en la información disponible que la ventana de 4 096 tokens del base se mantenga intacta tras la compresión.
- Despliegue en producción: no recomendado sin una evaluación propia de seguridad, calidad y latencia, dado el carácter experimental del checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_gsmrec_svdllm_jbb_remove50
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2: https://ai.meta.com/llama/license/
- Política de uso de Llama 2: https://ai.meta.com/llama/use-policy/
- No se han encontrado en la información disponible enlaces al paper de SVD-LLM, al repositorio del proyecto svd_safety ni a demos adicionales.
