# Jeesup/svd-safety-l2_dualk_dual_trace_r50

## Resumen

El modelo `svd-safety-l2_dualk_dual_trace_r50` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf`, desarrollado por el usuario Jeesup. Se trata de una versión comprimida de Llama-2-7b-chat mediante una técnica de SVD blanqueada con K-FAC de doble dominio (curvatura de utilidad y de seguridad), aplicando el presupuesto de rangos de SVD-LLM. El resultado es un modelo que conserva el 50,00% de los parámetros densos del original (fracción resultante de 0,4999), es decir, aproximadamente 6.738 millones de parámetros según los pesos en safetensors, frente a los 6.738 millones reportados.

El objetivo del modelo no es ser un asistente conversacional de propósito general, sino servir como artefacto experimental para estudiar cómo la compresión SVD degrada el comportamiento de seguridad y qué reglas de selección de componentes logran repararlo. Forma parte de una cuadrícula de experimentos sobre reglas de selección y presupuestos de compresión. Tras la compresión, se aplicó una recuperación mediante LoRA de etapa 2 de SVD-LLM (secuencial U y luego V, con alpaca-cleaned, r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256, bf16).

Es relevante en el contexto de la investigación sobre interpretabilidad y seguridad en modelos comprimidos, ya que cuantifica el compromiso entre utilidad (perplejidad en WikiText-2 de 12,3832) y seguridad (ASR en AdvBench de 0,0077 y en StrongREJECT de 0,0224, con una tasa de sobrerrechazo macro de 0,5103 medida con WildGuard). La licencia es la Llama 2 Community License, lo que restringe el uso comercial según los términos de Meta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-2-7b-chat comprimido mediante SVD) |
| Parametros totales | 6.738.415.616 (segun safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama-2-7b-chat, presumiblemente 4096 tokens, no confirmado en la informacion) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-2-7b-chat, un transformer decoder-only con atención causal estándar. Sobre este modelo base se aplicó una compresión SVD blanqueada con K-FAC de doble dominio, que combina la curvatura de utilidad (utility) y la curvatura de seguridad (safety) mediante una suma ponderada: F_dual = (1-a) G_u (x) A_u + a G_s (x) A_s, con un peso de seguridad a = 0,2639. La normalización de curvatura se realizó por traza (A dividido por posiciones, G dividido por tokens de pérdida, entropía cruzada sumada) por dominio, y luego cada factor se dividió por su traza. El presupuesto de rangos se tomó del método SVD-LLM por matriz al mismo ratio de eliminación.

La calibración de utilidad usó wikitext-2-raw-v1 (split de entrenamiento) con el muestreador de SVD-LLM, 255 ventanas de 2048 tokens, semilla 42 y entropía cruzada de siguiente token. La calibración de seguridad usó un conjunto de 512 muestras (`results/dual_kfac_wj/wj_safe_l2.jsonl`) con pérdida sobre los tokens de respuesta. El solver fue de tipo `dual`: óptimo de bajo rango de F_dual mediante K-FAC por dominio, con ALS de base conjunta iniciado desde la solución de mezcla, hasta 300 barridos, rtol 1e-07 y ridge 1e-06. Tras la compresión se aplicó una recuperación LoRA de etapa 2 de SVD-LLM (secuencial U y luego V) con alpaca-cleaned, r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256 y bf16. La semilla global fue 42.

## Capacidades

- Generación de texto conversacional: hereda las capacidades de Llama-2-7b-chat, aunque degradadas por la compresión y el reentrenamiento LoRA.
- Razonamiento básico y respuesta a instrucciones: el modelo fue afinado sobre alpaca-cleaned, por lo que mantiene cierta capacidad de seguir instrucciones.
- Compresión extrema: el checkpoint demuestra que es posible eliminar el 50% de los parámetros densos manteniendo una perplejidad de 12,3832 en WikiText-2.
- Evaluación de seguridad: incluye métricas de tasa de éxito de ataques (ASR) en AdvBench y StrongREJECT, así como tasa de sobrerrechazo macro medida con WildGuard.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles; se desconoce si el proceso de compresión y recuperación preservó el comportamiento multilingüe del modelo base.

## Casos de uso

- Investigación sobre compresión de modelos: el checkpoint sirve como celda experimental para estudiar cómo la SVD afecta a la seguridad y la utilidad, permitiendo comparar con otras celdas de la cuadrícula (por ejemplo, `svd-safety-l2_base_k0_a1p0_free_remove50`).
- Análisis de trade-offs seguridad-utilidad: gracias a las métricas publicadas (ASR en AdvBench y StrongREJECT, sobrerrechazo en WildGuard y perplejidad en WikiText-2), se puede usar para validar metodologías de evaluación de seguridad en modelos comprimidos.
- Estudio de recuperación con LoRA: el uso de LoRA de etapa 2 de SVD-LLM permite investigar hasta qué punto el reentrenamiento ligero repara el daño causado por la compresión.
- Benchmarking de técnicas de selección de componentes: al formar parte de una cuadrícula sobre reglas de selección y presupuestos, es útil para comparar reglas basadas en curvatura de utilidad frente a curvatura de seguridad.
- Desarrollo de métodos de compresión más seguros: los resultados medidos pueden guiar el diseño de futuras técnicas que preserven mejor el comportamiento de rechazo ante peticiones dañinas.
- Reproducibilidad de experimentos: la semilla 42, los conjuntos de calibración y los hiperparámetros documentados permiten reproducir el experimento y verificar los resultados.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (HarmBench judge) | 0,0077 |
| StrongREJECT ASR (HarmBench judge) | 0,0224 |
| Macro over-refusal (WildGuard) | 0,5103 |
| WikiText-2 perplexity | 12,3832 |

No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de aproximadamente 6.738 millones de parámetros, en precisión completa (fp32) requeriría unos 27 GB; en fp16/bf16 unos 13,5 GB; en cuantización de 8 bits unos 7 GB; en 4 bits unos 4 GB. Estas estimaciones son orientativas y no están confirmadas por el autor.
- GPU recomendadas: para fp16/bf16 se recomienda una GPU con al menos 16 GB de VRAM, como RTX 4090, A100 40GB o H100. Para cuantizaciones de 8 o 4 bits podría caber en GPUs consumer con 8-12 GB, como RTX 3070/3080/4070.
- Si cabe en consumer GPU: sí, en cuantizaciones de 4 u 8 bits podría ejecutarse en GPUs consumer con suficiente VRAM; en fp16 requiere al menos 16 GB.
- Opciones de despliegue: al ser un modelo de transformers con safetensors, se puede desplegar con vLLM, TGI (text-generation-inference), llama.cpp (previa conversión a GGUF), Ollama (previa conversión) o directamente con la librería transformers.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Jeesup/svd-safety-l2_dualk_dual_trace_r50 | 6.738 M | no disponible | llama2 | Hugging Face | Checkpoint comprimido al 50% con SVD dual |
| meta-llama/Llama-2-7b-chat-hf | 6.738 M | 4096 | llama2 | Hugging Face | Modelo base sin comprimir |
| Jeesup/svd-safety-l2_base_k0_a1p0_free_remove50 | no disponible | no disponible | llama2 | Hugging Face | Otra celda de la misma cuadrícula de compresión |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada, salvo las métricas propias del modelo analizado.

## Limitaciones y advertencias

- El propio autor indica que varias celdas de la cuadrícula están deliberadamente degradadas en seguridad en comparación con Llama-2-7b-chat; la compresión por sí sola aumenta la tasa de éxito de ataques.
- Este checkpoint es un artefacto de investigación, no un asistente desplegable; debe ser evaluado por el usuario antes de extraer conclusiones.
- Riesgo de alucinación: no se documenta explícitamente, pero al ser un modelo comprimido y reentrenado con LoRA, la fidelidad factual puede verse afectada.
- Sesgos conocidos: no se documentan sesgos específicos, pero al derivar de Llama-2-7b-chat hereda los sesgos de su modelo base y de los datos de ajuste.
- Limitaciones de contexto o idioma: no se especifican; se desconoce si la ventana de contexto se mantiene en 4096 tokens y qué idiomas conserva.
- Restricciones de licencia: la Llama 2 Community License incluye términos de uso aceptable y restricciones para uso comercial (por ejemplo, si el modelo se usa en productos con más de 700 millones de usuarios mensuales se requiere licencia adicional de Meta). Se incluyen `LICENSE.txt` y `USE_POLICY.md` en el repositorio.
- Caveat para producción: no se recomienda su uso en producción sin una evaluación exhaustiva de seguridad y utilidad, dado que su propósito es experimental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_dualk_dual_trace_r50
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Otra celda de la cuadrícula: https://huggingface.co/Jeesup/svd-safety-l2_base_k0_a1p0_free_remove50
