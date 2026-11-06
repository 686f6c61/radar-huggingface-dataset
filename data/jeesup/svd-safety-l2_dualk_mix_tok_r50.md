# Jeesup/svd-safety-l2_dualk_mix_tok_r50

## Resumen

`svd-safety-l2_dualk_mix_tok_r50` es un checkpoint derivado de `meta-llama/Llama-2-7b-chat-hf` comprimido mediante SVD con blanqueado K-FAC dual (curvatura de utilidad y de seguridad) y presupuesto de rango de SVD-LLM, hasta conservar el 50,0 % de los parámetros densos del modelo original. Lo publica el usuario de Hugging Face Jeesup como artefacto de investigación, no como modelo de propósito general. Tras la compresión se aplicó una recuperación con LoRA en dos etapas (U y luego V) sobre `alpaca-cleaned`.

El interés del modelo es metodológico: forma parte de una rejilla experimental que mide cómo la compresión SVD degrada el comportamiento de seguridad de Llama-2-7b-chat y qué regla de selección de componentes repara mejor ese daño. En esta celda concreta se mezclan las curvaturas de utilidad y de seguridad con un peso de seguridad de 0,2639, y se calibran por posición y por tokens de pérdida en cada dominio.

Con 6.738.415.616 parámetros reales en safetensors y un repositorio de 13,5 GB, es relevante para quienes investigan compresión de modelos, interpretabilidad de salvaguardas y análisis de sobre-rechazo, no para despliegues conversacionales en producción. La model card advierte explícitamente de que otras celdas de la misma rejilla están deliberadamente degradadas en seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-2-7b-chat) con capas comprimidas por SVD |
| Parametros totales | 6.738.415.616 (fracción resultante 0,4999 respecto al denso) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama-2-7b-chat: 4.096 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El punto de partida es Llama-2-7b-chat, un transformer decoder-only. La compresión se realiza con SVD blanqueado K-FAC en dos dominios: se construye una matriz de curvatura mixta F_mix = [(1-a) G_u + a G_s] ⊗ [(1-a) A_u + a A_s], donde G_u y A_u provienen de la curvatura de utilidad y G_s y A_s de la de seguridad, con a = 0,2639. La normalización de curvatura es `tok`: A dividida por posiciones y G dividida por tokens de pérdida (entropía cruzada sumada), por separado en cada dominio. El presupuesto de rango por matriz sigue la regla de SVD-LLM al mismo ratio de eliminación (50,00 %).

La calibración de utilidad usa `wikitext-2-raw-v1` de entrenamiento con el muestreador de SVD-LLM: 255 ventanas de 2.048 tokens con semilla 42 y pérdida de entropía cruzada de siguiente token. La calibración de seguridad usa el fichero `results/dual_kfac_wj/wj_safe_l2.jsonl` (512 muestras, pérdida sobre tokens de respuesta). Tras la compresión se aplica la recuperación de etapa 2 de SVD-LLM con LoRA secuencial (U y luego V), sobre `alpaca-cleaned`, con r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256 y bf16. La semilla global es 42.

## Capacidades

- Generación de texto conversacional heredada de Llama-2-7b-chat, sujeta a la degradación introducida por la compresión.
- Respuestas a instrucciones y diálogo multi-turno, con calidad no garantizada tras el 50 % de eliminación de parámetros.
- Comportamiento de rechazo medible: la model card reporta tasas de ataque exitoso y de sobre-rechazo, lo que permite estudiar la calibración de salvaguardas.
- Capacidad de servir como sujeto experimental para comparar reglas de selección de componentes en compresión SVD.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en compresión de modelos: servir como celda de referencia en la rejilla del autor para comparar reglas de selección (mix, trace, dual) a un presupuesto fijo del 50 %, midiendo perplejidad y seguridad de forma conjunta.
- Estudio del trade-off seguridad/utilidad: con métricas publicadas de ASR en AdvBench (0,0077) y StrongREJECT (0,0224), permite cuantificar cuánto daño de seguridad introduce la compresión frente al modelo denso original.
- Análisis de sobre-rechazo: el valor de 0,5150 de macro over-refusal (WildGuard) sirve para caracterizar falsos positivos de rechazo en asistentes comprimidos y diseñar mitigaciones.
- Evaluación de recuperación con LoRA: el pipeline de etapa 2 (U y V secuenciales, r=8) puede replicarse o compararse con otras estrategias de recuperación para medir la recuperación de capacidades tras la compresión.
- Benchmarking de pipelines de inferencia: al ser un checkpoint transformers compatible con text-generation-inference y vLLM, permite medir throughput y latencia de modelos comprimidos frente a los densos en el mismo hardware.
- Docencia y reproducibilidad: con semilla 42, calibración documentada y scripts referenciados en la model card, es un ejemplo reproducible de compresión con curvatura dual para cursos o talleres de eficiencia de modelos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0077 |
| StrongREJECT ASR (juez HarmBench) | 0,0224 |
| Macro over-refusal (WildGuard) | 0,5150 |
| Perplejidad WikiText-2 | 12,2319 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numéricas directas con otras celdas de la rejilla.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 13,5 GB solo para pesos, más overhead de activaciones y caché KV.
- En cuantización de 8 bits: aproximadamente 7 GB de pesos; en 4 bits: aproximadamente 3,5-4 GB de pesos, más overhead (estimaciones a partir del recuento real de parámetros, no publicadas por el autor).
- GPU recomendadas: A100 (40/80 GB) o H100 para servicio concurrente en precisión completa; RTX 4090 (24 GB) para una sola instancia en bf16.
- Cabe en GPU de consumo de 16 GB o más en cuantización de 8 bits y en GPU de 8 GB en 4 bits, siempre con margen para el contexto.
- Opciones de despliegue: transformers, text-generation-inference y vLLM (etiquetas del repositorio); llama.cpp u Ollama requerirían conversión a GGUF, no publicada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l2_dualk_mix_tok_r50 | 6,74 B (50 % del denso) | no disponible | Llama 2 Community | Celda experimental con curvatura dual mixta |
| Jeesup/svd-safety-l2_dualk_mix_trace_r50 | ~7 B (según ficha de Hugging Face) | no disponible | Llama 2 Community | Variante de la misma rejilla con normalización `trace` |
| Jeesup/svd-safety-l2_dualk_dual_trace_r50 | no disponible | no disponible | Llama 2 Community | Variante con curvatura dual y normalización `trace` |
| meta-llama/Llama-2-7b-chat-hf | 6,74 B densos | 4.096 | Llama 2 Community | Modelo base sin comprimir; referencia de utilidad y seguridad |

Los tres checkpoints de la rejilla comparten base, licencia y procedimiento de recuperación; difieren en la regla de selección y en la normalización de la curvatura.

## Limitaciones y advertencias

- Artefacto de investigación: la model card indica explícitamente que no es un modelo conversacional de propósito general y que debe evaluarse antes de extraer conclusiones.
- Varias celdas de la misma rejilla están deliberadamente degradadas en seguridad; la compresión por sí sola eleva la tasa de éxito de ataques.
- Riesgo de alucinación: no cuantificado en la información disponible, pero esperable al haberse eliminado el 50 % de los parámetros.
- Sesgos: no documentados; se heredan los de Llama-2-7b-chat y los del dataset `alpaca-cleaned` usado en la recuperación LoRA.
- Idiomas soportados no especificados; el comportamiento multilingüe no está garantizado.
- Licencia Llama 2 Community: el uso comercial está sujeto a `LICENSE.txt` y `USE_POLICY.md`, incluidos en el repositorio; es obligatorio cumplir la política de uso aceptable de Meta.
- Sin datos de benchmarks de capacidad general (MMLU, HumanEval, GSM8K), por lo que la utilidad práctica más allá de la perplejidad en WikiText-2 no está caracterizada.
- Contexto máximo no confirmado en la model card; asumir el de Llama-2-7b-chat sin verificación puede provocar fallos en prompts largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_dualk_mix_tok_r50
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Variante mix_trace_r50: https://huggingface.co/Jeesup/svd-safety-l2_dualk_mix_trace_r50
- Variante dual_trace_r50: https://huggingface.co/Jeesup/svd-safety-l2_dualk_dual_trace_r50
- Paper de SVD-LLM (referenciado en la model card): no disponible como enlace en la información proporcionada
- Repositorio de código del estudio: no disponible en la información proporcionada
