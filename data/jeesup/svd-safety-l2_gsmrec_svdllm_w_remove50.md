# Jeesup/svd-safety-l2_gsmrec_svdllm_w_remove50

## Resumen

`Jeesup/svd-safety-l2_gsmrec_svdllm_w_remove50` es un artefacto de investigación derivado de `meta-llama/Llama-2-7b-chat-hf` al que se le ha aplicado una compresión SVD-LLM eliminando el 50 % de los parámetros, seguida de un ajuste fino de recuperación mediante LoRA sobre el conjunto de entrenamiento de GSM8K. Lo publica el usuario Jeesup dentro del proyecto `svd_safety`, cuyo objetivo declarado es estudiar cómo interactúan la compresión agresiva de modelos y las propiedades de seguridad alineadas del modelo original. No es un asistente de propósito general: la propia model card advierte de que algunas celdas están deliberadamente degradadas en seguridad o sobre-rechazan peticiones.

El modelo conserva la arquitectura transformer decoder-only de Llama 2, con 6.738.415.616 parámetros reales según los pesos en safetensors (frente a los ~6.740 millones del Llama-2-7b-chat original, lo que sugiere que la "eliminación del 50 %" se refiere a rangos SVD truncados en las matrices de proyección y no a una reducción del recuento total de parámetros del checkpoint). El contexto máximo no se especifica en la información disponible, aunque al derivar de Llama 2 cabe esperar 4.096 tokens; no obstante, este dato no está confirmado en la ficha del autor.

Su relevancia es fundamentalmente metodológica: proporciona un punto de medida reproducible (semilla 42, calibración únicamente con WikiText-2) para evaluar el compromiso entre perplejidad, rendimiento en tareas zero-shot, tasa de éxito de ataques adversarios (ASR) y sobre-rechazo en modelos comprimidos. Los resultados publicados muestran una degradación severa en GSM8K (8,49 %) e IFEval (9,24 % estricto a nivel de prompt), lo que lo sitúa lejos de un uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), con matrices comprimidas mediante SVD-LLM |
| Parametros totales | 6.738.415.616 (según safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (modelo base Llama 2: 4.096 tokens) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible (el modelo base Llama 2 está entrenado mayoritariamente en inglés) |
| Licencia | Llama 2 Community License (incluye LICENSE.txt y USE_POLICY.md) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Llama-2-7b-chat y aplica SVD-LLM, una técnica de compresión post-entrenamiento que descompone las matrices de pesos en valores singulares y trunca una fracción de los rangos; en este caso se elimina el 50 % según la model card. La calibración para el truncamiento SVD se realizó exclusivamente con WikiText-2 (indicado por la "W" en el nombre del checkpoint), con semilla 42. Posteriormente se entrenó un LoRA de recuperación sobre el split de entrenamiento de GSM8K (7.473 problemas en formato Alpaca, longitud de corte 512, con un split de validación de 500 ejemplos), en lugar del habitual `alpaca-cleaned`, y se fusionó en los pesos finales. El trabajo se enmarca en el proyecto `svd_safety` (script `jobs/gsmrec_slurm.sh`).

No se documentan en la información disponible el número total de tokens de entrenamiento original de Llama 2, la composición del dataset de alineación (RLHF/DPO) heredado del modelo base, ni detalles sobre innovaciones de decodificación (decodificación especulativa, atención lineal, etc.). Tampoco se especifica qué capas o módulos concretos fueron objeto del truncamiento SVD más allá de la mención genérica a la compresión SVD-LLM.

## Capacidades

- Generación de texto conversacional en formato chat, heredada de Llama-2-7b-chat (plantilla de chat de Llama 2).
- Razonamiento aritmético básico: el LoRA de recuperación se entrenó sobre GSM8K, aunque el rendimiento medido es muy bajo (8,49 % en 5-shot).
- Seguimiento de instrucciones: capacidad presente pero fuertemente degradada (IFEval prompt-level strict del 9,24 %).
- Capacidades multilingües: no documentadas; el modelo base está orientado principalmente al inglés.
- Tool calling / function calling: no disponible ni documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado; el rendimiento en tareas compuestas es bajo según las métricas publicadas.
- Modo "thinking" o razonamiento extendido: no disponible.
- Visión o audio: no disponible (modelo exclusivamente de texto).
- Comportamiento de seguridad variable: la model card indica que algunas celdas están deliberadamente degradadas en seguridad o sobre-rechazan, lo que constituye en sí mismo un objeto de estudio del artefacto.

## Casos de uso

- Investigación sobre compresión de modelos: sirve como punto de comparación reproducible (semilla 42, calibración WikiText-2) para medir el impacto de SVD-LLM al 50 % sobre perplejidad y tareas zero-shot frente al Llama-2-7b-chat original.
- Estudio de alineación y seguridad bajo compresión: los valores de ASR en AdvBench (8,27 %) y StrongREJECT (13,42 %) con juez HarmBench permiten analizar si la compresión erosiona o no las defensas del modelo alineado.
- Análisis de sobre-rechazo: las métricas de XSTest-safe (33,33 % de sobre-rechazo, 51,60 % scored) y OR-Bench-Hard-1k (19,27 % / 41,70 %) lo hacen útil para estudiar el equilibrio entre utilidad y rechazo en modelos comprimidos.
- Evaluación de recetas de recuperación con LoRA: al haberse recuperado con GSM8K en lugar de alpaca-cleaned, permite comparar estrategias de recuperación de capacidad aritmética tras compresión agresiva.
- Reproducción de experimentos académicos: el artefacto está pensado para replicar los resultados del proyecto `svd_safety` y validar pipelines de evaluación (HarmBench, WildGuard, lm-evaluation-harness).
- Docencia y formación: como ejemplo práctico de un checkpoint derivado con licencia Llama 2, sirve para ilustrar flujos de compresión, fusión de LoRA y evaluación de seguridad en un entorno controlado.
- No se recomienda su uso como asistente de atención al cliente, generación de código en producción ni despliegue orientado a usuarios finales, dado su rendimiento medido y las advertencias explícitas del autor.

## Benchmarks y rendimiento

Resultados publicados en la model card (porcentajes salvo PPL):

| Métrica | Valor |
|---|---|
| WikiText-2 PPL | 18,60 |
| Media zero-shot en 7 tareas | 39,39 |
| AdvBench ASR (juez HarmBench) | 8,27 |
| StrongREJECT ASR (juez HarmBench) | 13,42 |
| XSTest-safe sobre-rechazo (WildGuard) / scored % | 33,33 / 51,60 |
| OR-Bench-Hard-1k sobre-rechazo / scored % | 19,27 / 41,70 |
| GSM8K 5-shot estricto / flexible (chat template) | 8,49 / 8,49 |
| IFEval prompt-level strict | 9,24 |

No se proporcionan en la información disponible resultados comparativos directos con otros modelos comprimidos ni con el Llama-2-7b-chat sin comprimir.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomienda al menos 16 GB para contexto corto.
- VRAM estimada en cuantización de 8 bits: en torno a 7-8 GB de pesos; en 4 bits, en torno a 4 GB, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para fp16 con contexto moderado; RTX 3090/4080 (16-24 GB) para fp16 con contexto corto o cuantización.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en fp16 con contexto limitado, y en GPUs de 8-12 GB si se cuantiza a 8 o 4 bits (requiere generar los pesos cuantizados, no incluidos en el repo).
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` en Hugging Face) y endpoints compatibles; llama.cpp/Ollama requerirían conversión a GGUF, no documentada por el autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Jeesup/svd-safety-l2_gsmrec_svdllm_w_remove50 | 6.738.415.616 | No disponible (base: 4.096) | Llama 2 Community | Compresión SVD-LLM al 50 %, recuperación LoRA con GSM8K; ASR AdvBench 8,27 %, GSM8K 8,49 % |
| meta-llama/Llama-2-7b-chat-hf | ~6.740 millones | 4.096 | Llama 2 Community | Modelo base sin comprimir; referencia para medir la degradación |
| Otros checkpoints del proyecto svd_safety (Jeesup) | No disponible | No disponible | Llama 2 Community | Variantes con distintas calibraciones y recetas de recuperación; no se detallan en la información disponible |
| Modelos comprimidos SVD-LLM genéricos | No disponible | No disponible | Variable | No se dispone de datos comparativos concretos en la información proporcionada |

## Limitaciones y advertencias

- Artefacto de investigación: el autor indica explícitamente que no es un asistente de propósito general y que debe evaluarse antes de cualquier uso.
- Degradación severa en tareas de razonamiento e instrucciones: GSM8K 5-shot del 8,49 % e IFEval strict del 9,24 %, muy por debajo de lo esperable en un modelo de 7B alineado.
- Comportamiento de seguridad inconsistente: algunas celdas están deliberadamente degradadas en seguridad y otras sobre-rechazan; los ASR de AdvBench (8,27 %) y StrongREJECT (13,42 %) no deben interpretarse como una garantía de robustez.
- Sobre-rechazo elevado: 33,33 % en XSTest-safe y 19,27 % en OR-Bench-Hard-1k, lo que puede provocar rechazos innecesarios en uso conversacional.
- Riesgo de alucinación: no cuantificado en la información disponible; la compresión agresiva y la recuperación limitada a GSM8K pueden incrementar la generación de contenido incorrecto.
- Idiomas: no se documenta soporte multilingüe; se asume un sesgo hacia el inglés heredado de Llama 2.
- Licencia: Llama 2 Community License, con restricciones de uso comercial (cláusula de 700 millones de usuarios mensuales) y obligación de incluir LICENSE.txt y USE_POLICY.md; revisar antes de cualquier despliegue.
- Contexto: la longitud máxima no está confirmada en la ficha del autor; no asumir 4.096 tokens sin verificar la configuración del tokenizador y del modelo.
- Sin datos de benchmarks comparativos frente al modelo base ni frente a otras variantes del proyecto, lo que limita la interpretación aislada de las métricas.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_gsmrec_svdllm_w_remove50
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2: https://ai.meta.com/llama/license/
- Proyecto svd_safety: no disponible como enlace público en la información proporcionada
- Paper de SVD-LLM: no disponible en la información proporcionada
- Repositorio o demo adicionales: no disponibles en la información proporcionada
