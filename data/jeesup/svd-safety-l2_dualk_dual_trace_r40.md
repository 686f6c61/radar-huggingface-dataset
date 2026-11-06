# Jeesup/svd-safety-l2_dualk_dual_trace_r40

## Resumen

`svd-safety-l2_dualk_dual_trace_r40` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf`, publicado por el usuario Jeesup en Hugging Face. No se trata de un modelo de propósito general, sino de un artefacto de investigación: el modelo base ha sido comprimido mediante una variante de SVD con ponderación de curvatura dual (utilidad y seguridad) hasta conservar el 59,98% de los parámetros densos originales, y posteriormente recuperado con una etapa de LoRA de SVD-LLM.

El interés del checkpoint reside en su metodología: estudia cómo la compresión por SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes (aquí, una solución dual-domain K-FAC con normalización por traza) repara mejor ese daño. Forma parte de una cuadrícula experimental sobre reglas de selección y presupuestos de rango, y el propio autor advierte que varias celdas de esa cuadrícula están deliberadamente degradadas en seguridad.

Por tanto, es relevante para investigadores de compresión de modelos, interpretabilidad y alineación, no para despliegues en producción. El modelo conserva la arquitectura transformer decoder-only de Llama 2, con 6.738.415.616 parámetros efectivos tras la compresión, y mantiene la licencia Llama 2 Community License.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), comprimido por SVD con rank budget de SVD-LLM |
| Parametros totales | 6.738.415.616 (59,98% del denso original) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el base Llama-2-7b-chat soporta 4096 tokens; el cutoff de entrenamiento LoRA fue 256) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint parte de Llama-2-7b-chat y aplica una compresión SVD con presupuesto de rango por matriz heredado de SVD-LLM, eliminando el 40,00% de los parámetros. La innovación central es la regla de selección de componentes: una SVD blanqueada por K-FAC en dos dominios, combinando curvatura de utilidad (calculada sobre wikitext-2-raw-v1, 255 ventanas de 2048 tokens, semilla 42, entropía cruzada de siguiente token) y curvatura de seguridad (calculada sobre `wj_safe_l2.jsonl`, 512 muestras, pérdida sobre tokens de respuesta). El peso de seguridad es a = 0,2639 y la normalización de curvatura es por traza (A dividido por posiciones, G dividido por tokens de pérdida, por dominio, y cada factor dividido por su traza). El solver es `dual`: óptimo de bajo rango de F_dual = (1-a) G_u ⊗ A_u + a G_s ⊗ A_s con ALS sobre base conjunta, iniciado desde la solución mix, hasta 300 barridos, rtol 1e-07 y ridge 1e-06.

Tras la compresión, se aplica la etapa 2 de recuperación de SVD-LLM: LoRA secuencial sobre U y luego V, con r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256 y precisión bf16, entrenado sobre alpaca-cleaned. La semilla global es 42.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Llama-2-7b-chat.
- Razonamiento y respuesta a instrucciones en formato conversacional (pipeline `text-generation`).
- Compatibilidad con Text Generation Inference y endpoints compatibles, según los tags del repositorio.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles (los idiomas no están declarados en la model card).
- Capacidad especial del artefacto: servir como sujeto experimental para medir el equilibrio seguridad/utilidad bajo compresión SVD.

## Casos de uso

- Investigación sobre compresión de modelos: usar el checkpoint como celda de referencia en estudios que comparan reglas de selección de componentes SVD frente a alternativas como `basis_remove40` o `dualk_mix_trace_r40`, midiendo el efecto sobre perplejidad y seguridad.
- Estudio de degradación de seguridad por compresión: el modelo permite cuantificar cuánto sube la tasa de éxito de ataques (ASR) al eliminar el 40% de parámetros y cómo la recuperación LoRA mitiga parte del daño.
- Evaluación de recuperación con LoRA de etapa 2: sirve para analizar si el fine-tuning sobre alpaca-cleaned repara el comportamiento conversacional sin reintroducir rechazos excesivos.
- Análisis de calibración de curvatura: al documentarse el peso de seguridad (0,2639) y la normalización por traza, el checkpoint permite reproducir y auditar la metodología de K-FAC dual.
- Benchmarking de perplejidad tras compresión: con WikiText-2 PPL de 10,1808, es útil como punto de comparación para otras técnicas de pruning o low-rank approximation en Llama 2.
- Docencia y divulgación técnica: ilustrar en un curso o artículo cómo se mide el compromiso entre utilidad y alineación en modelos comprimidos, siempre con la advertencia de que no es un asistente desplegable.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0038 |
| StrongREJECT ASR (juez HarmBench) | 0,0096 |
| Macro over-refusal (WildGuard) | 0,5006 |
| Perplejidad WikiText-2 | 10,1808 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numéricas directas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 6,74 mil millones de parámetros, en bf16 se requieren aproximadamente 13,5 GB de pesos (tamaño del repo), más overhead de activaciones y caché KV.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cabría en GPUs con 24 GB o más (por ejemplo RTX 4090) en bf16, y en GPUs de 16 GB con cuantización de 8 bits, aunque estas estimaciones no están confirmadas por el autor.
- Cabe en GPU consumer: probablemente sí en RTX 4090 (24 GB) en bf16; en GPUs de 16 GB requeriría cuantización, dato no documentado.
- Opciones de despliegue: transformers, Text Generation Inference (tag `text-generation-inference`) y endpoints compatibles. No se documentan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `Jeesup/svd-safety-l2_dualk_dual_trace_r40` | 6,74 B (59,98% del denso) | no disponible | Llama 2 | Regla dual K-FAC con normalización por traza; PPL WikiText-2 10,1808 |
| `Jeesup/svd-safety-l2_dualk_mix_trace_r40` | no disponible en la información | no disponible | Llama 2 | Variante con solución mix en lugar de dual; misma familia experimental |
| `Jeesup/svd-safety-l2_basis_remove40` | no disponible en la información | no disponible | Llama 2 | Variante de referencia con eliminación de base; misma familia experimental |
| `meta-llama/Llama-2-7b-chat-hf` | 6,74 B (denso) | 4096 | Llama 2 | Modelo base sin compresión |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El propio autor declara que el checkpoint no es un modelo de chat de propósito general y que debe tratarse como sujeto experimental.
- Varias celdas de la cuadrícula experimental están deliberadamente degradadas en seguridad; la compresión por sí sola eleva la tasa de éxito de ataques.
- Riesgo de alucinación: no cuantificado en la información disponible, pero esperable en un modelo comprimido y recuperado con LoRA sobre alpaca-cleaned.
- Sesgos conocidos: no documentados; hereda los del modelo base Llama-2-7b-chat.
- Limitaciones de idioma: los idiomas soportados no están declarados.
- Restricciones de licencia: Llama 2 Community License; el uso comercial está sujeto a `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio.
- Advertencia para producción: el autor recomienda evaluar el modelo por cuenta propia antes de extraer conclusiones; no se recomienda su despliegue como asistente sin auditoría previa.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_dualk_dual_trace_r40
- Variante mix: https://huggingface.co/Jeesup/svd-safety-l2_dualk_mix_trace_r40
- Variante basis_remove40: https://huggingface.co/Jeesup/svd-safety-l2_basis_remove40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
