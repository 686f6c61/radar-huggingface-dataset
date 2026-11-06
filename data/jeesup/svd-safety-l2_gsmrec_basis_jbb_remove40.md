# Jeesup/svd-safety-l2_gsmrec_basis_jbb_remove40

## Resumen

Jeesup/svd-safety-l2_gsmrec_basis_jbb_remove40 es un artefacto de investigación derivado de meta-llama/Llama-2-7b-chat-hf, comprimido mediante la técnica de Basis Sharing con un 40 % de los parámetros eliminados. El modelo parte de la arquitectura transformer decoder-only original de Llama 2 (6.738.415.616 parámetros reales según los pesos safetensors, frente a los 6.738.415.616 del modelo base sin comprimir, lo que indica que la compresión se aplica sobre componentes internos y no sobre el recuento total de pesos). Lo publica el usuario Jeesup como parte del proyecto svd_safety, y su propósito no es el de un asistente generalista, sino el de servir como material de estudio sobre cómo la compresión SVD y la calibración afectan al comportamiento de seguridad y a capacidades específicas como GSM8K.

La particularidad del artefacto está en su pipeline de construcción: calibración con WikiText-2 más respuestas dañinas de JBB multiplicadas por 13 (W+JBB), y posteriormente una LoRA de recuperación entrenada sobre GSM8K train (7.473 problemas en formato Alpaca, cutoff 512, split de validación de 500) en lugar de alpaca-cleaned, fusionada en los pesos. El resultado es un modelo con perplejidad baja en WikiText-2 (13,42) pero con un rendimiento muy degradado en GSM8K (9,17 % estricto) y en IFEval (11,46 % a nivel de prompt), lo que refleja el coste de la compresión agresiva y de un entrenamiento de recuperación limitado a una única tarea.

Es relevante ahora porque ejemplifica una línea de trabajo activa en la comunidad open source: la compresión de modelos Llama 2 mediante descomposición en valores singulares y compartición de bases, con el objetivo de reducir huella de memoria y estudiar efectos colaterales en seguridad y alineación. Su valor es fundamentalmente metodológico y de auditoría, no de despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), comprimido mediante Basis Sharing con 40 % de parámetros eliminados |
| Parametros totales | 6.738.415.616 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens (heredada de Llama 2; no se especifica en la model card) |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | No disponible (la model card no declara idiomas; el modelo base Llama 2 está entrenado mayoritariamente en inglés) |
| Licencia | Llama 2 Community License (incluye LICENSE.txt y USE_POLICY.md) |
| Formato de pesos | safetensors (repo de 13,5 GB) |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Llama 2 7B chat: un transformer decoder-only con atención multi-cabeza, normalización RMSNorm, activación SwiGLU y RoPE para codificación posicional. Sobre esa base, el autor aplica una compresión por Basis Sharing que elimina el 40 % de los parámetros, lo que reduce la huella del modelo a costa de degradar representaciones internas. La calibración para la compresión se realiza con una mezcla de WikiText-2 y respuestas dañinas de JBB repetidas 13 veces (W+JBB), una elección deliberada que busca influir en el comportamiento de seguridad del modelo comprimido.

Tras la compresión, se entrena una LoRA de recuperación sobre el split de entrenamiento de GSM8K (7.473 problemas, formato Alpaca, cutoff de 512 tokens, split de validación de 500) y se fusiona en los pesos. No se documenta uso de RLHF ni DPO adicionales; la alineación procede del modelo base Llama 2 chat. La innovación técnica destacable es el uso de compartición de bases SVD para comprimir y de una calibración adversaria (JBB) para estudiar el efecto de la compresión sobre la tasa de éxito de ataques de jailbreak, medida con el juez HarmBench.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Llama 2 chat.
- Razonamiento aritmético básico: el modelo fue entrenado para recuperar capacidad en GSM8K, aunque el rendimiento medido es bajo (9,17 % estricto en 5-shot).
- Seguimiento de instrucciones limitado: IFEval prompt-level strict de 11,46 %.
- Resistencia a ataques de jailbreak medida: ASR de 0,00 % en AdvBench y StrongREJECT según el juez HarmBench.
- Comportamiento de sobrerrechazo elevado: 67,48 % de sobrerrechazo en XSTest-safe y 96,50 % en OR-Bench-Hard-1k.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües no documentadas; el modelo base está orientado al inglés.

## Casos de uso

- Auditoría de seguridad en compresión de modelos: el artefacto permite estudiar cómo la eliminación del 40 % de parámetros y la calibración con JBB afectan a la tasa de éxito de jailbreaks, usando AdvBench y StrongREJECT como referencia.
- Investigación sobre sobrerrechazo: los valores de XSTest-safe (67,48 %) y OR-Bench-Hard-1k (96,50 %) lo convierten en un caso de estudio para analizar cómo la compresión y la calibración adversaria desajustan la política de rechazo.
- Estudio de recuperación de capacidades con LoRA: sirve para evaluar si una LoRA de recuperación entrenada solo en GSM8K puede recuperar razonamiento aritmético tras compresión agresiva, con la métrica de 9,17 % estricto como línea base.
- Reproducibilidad de experimentos SVD: el pipeline documentado (jobs/gsmrec_slurm.sh, seed 42, calibración W+JBB) permite replicar y comparar variantes de compresión en entornos de investigación con GPUs de gama media.
- Docencia y formación en alineación: útil como ejemplo práctico de cómo métricas de seguridad y de capacidad pueden divergir tras un proceso de compresión y ajuste fino selectivo.
- Evaluación de perplejidad como proxy de calidad: con WikiText-2 PPL de 13,42, sirve para contrastar si una perplejidad baja se correlaciona con capacidades reales en tareas de razonamiento e instrucciones.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| WikiText-2 PPL | 13,42 |
| Media zero-shot en 7 tareas | 45,13 % |
| AdvBench ASR (juez HarmBench) | 0,00 % |
| StrongREJECT ASR (juez HarmBench) | 0,00 % |
| XSTest-safe sobrerrechazo (WildGuard) | 67,48 % (98,40 % puntuado) |
| OR-Bench-Hard-1k sobrerrechazo | 96,50 % (99,62 % puntuado) |
| GSM8K 5-shot estricto / flexible (chat template) | 9,17 % / 9,93 % |
| IFEval prompt-level strict | 11,46 % |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en estos benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 16-24 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 7-8 GB de pesos, con overhead adicional; no se publican pesos cuantizados oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para fp16; RTX 3090/4080 (16-24 GB) para cuantización de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en fp16 y en GPUs de 16 GB con cuantización, aunque no hay GGUF oficial publicado.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag endpoints_compatible), vLLM y llama.cpp si se generan pesos compatibles; no se documentan recetas oficiales para Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | IFEval strict | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Jeesup/svd-safety-l2_gsmrec_basis_jbb_remove40 | 6.738.415.616 | 4.096 (heredado) | 9,17 % (5-shot estricto) | 11,46 % | Llama 2 Community | Hugging Face, 0 descargas |
| meta-llama/Llama-2-7b-chat-hf | 6.738.415.616 | 4.096 | No disponible en esta ficha | No disponible en esta ficha | Llama 2 Community | Hugging Face, ampliamente adoptado |
| Variantes de compresión SVD de Llama 2 de la comunidad | Variable (típicamente 40-60 % de parámetros) | 4.096 | No disponible | No disponible | Llama 2 Community | Hugging Face, adopción variable |

La comparación directa con el modelo base no puede cuantificarse con los datos disponibles, ya que la model card no incluye las métricas del Llama-2-7b-chat original. La diferencia más relevante es que este artefacto declara explícitamente un rendimiento degradado en GSM8K e IFEval y un sobrerrechazo muy elevado, lo que lo aleja de un uso como asistente generalista.

## Limitaciones y advertencias

- El autor declara explícitamente que no es un asistente de propósito general y que algunas celdas están deliberadamente degradadas en seguridad o sobrerrechazan; debe evaluarse antes de cualquier uso.
- Riesgo de alucinación elevado en tareas de razonamiento e instrucciones: GSM8K estricto de 9,17 % e IFEval de 11,46 % indican una fiabilidad muy baja en esos dominios.
- Sobrerrechazo severo: 67,48 % en XSTest-safe y 96,50 % en OR-Bench-Hard-1k, lo que puede bloquear peticiones legítimas en un despliegue real.
- La calibración con respuestas dañinas de JBB puede haber introducido sesgos o comportamientos no deseados no caracterizados en la model card.
- Idiomas soportados no documentados; el modelo base está orientado al inglés y no se garantiza un rendimiento aceptable en castellano.
- Licencia Llama 2 Community: restricciones de uso comercial y obligación de cumplir USE_POLICY.md; no es una licencia permisiva tipo Apache 2.0.
- Contexto de 4.096 tokens heredado del modelo base, insuficiente para tareas de contexto largo.
- Sin datos de benchmarks comparativos con el modelo base ni con otras variantes de compresión, lo que limita la evaluación objetiva del coste real de la compresión.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_gsmrec_basis_jbb_remove40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2: https://ai.meta.com/llama/license/
- Política de uso de Llama 2: https://ai.meta.com/llama/use-policy/
- Paper de Llama 2: https://arxiv.org/abs/2307.09288
- Repositorio del proyecto svd_safety: no disponible en la información proporcionada
- Demo o space asociado: no disponible en la información proporcionada
