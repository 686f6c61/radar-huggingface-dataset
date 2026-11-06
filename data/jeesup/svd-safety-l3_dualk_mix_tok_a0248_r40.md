# Jeesup/svd-safety-l3_dualk_mix_tok_a0248_r40

## Resumen

`svd-safety-l3_dualk_mix_tok_a0248_r40` es un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct`, publicado por el usuario Jeesup en Hugging Face. No se trata de un modelo conversacional de propósito general, sino de una celda concreta dentro de un grid experimental que estudia cómo la compresión por SVD degrada el comportamiento de seguridad de un LLM y qué regla de selección de componentes lo repara mejor.

El modelo aplica una compresión SVD blanqueada con K-FAC de doble dominio (curvatura de utilidad y de seguridad combinadas mediante un peso `a = 0.248`) siguiendo el presupuesto de rango de SVD-LLM, eliminando el 40 % de los parámetros y quedándose en un 59,98 % del total denso. Posteriormente se recupera con la etapa 2 de SVD-LLM basada en LoRA secuencial (U y luego V, sobre alpaca-cleaned, r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256, bf16).

Es relevante ahora porque cuantifica empíricamente el trade-off seguridad/utilidad bajo compresión: el autor advierte explícitamente que varias ramas del grid están deliberadamente degradadas en seguridad y que este checkpoint debe tratarse como sujeto experimental, no como asistente desplegable. Su valor está en la interpretabilidad y en la metodología de compresión, no en el rendimiento conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), comprimido mediante SVD con K-FAC de doble dominio |
| Parametros totales | 8.030.261.248 (59,98 % del denso original; 40 % eliminados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (heredada de Llama-3-8B-Instruct: 8.192 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible (heredados del modelo base, no documentados) |
| Licencia | Llama 3 Community License |
| Formato de pesos | safetensors (repo de 16,1 GB) |

## Arquitectura y entrenamiento

La arquitectura de partida es un transformer decoder-only de Llama 3 con 8.030 millones de parámetros. Sobre ella se aplica una compresión SVD blanqueada con K-FAC de doble dominio: se construye una matriz de curvatura mixta `F_mix = [(1-a) G_u + a G_s] (x) [(1-a) A_u + a A_s]` con `a = 0.248`, combinando la curvatura de utilidad (`G_u`, `A_u`) y la de seguridad (`G_s`, `A_s`). La normalización de curvatura es `tok`: A dividido por posiciones y G dividido por tokens de pérdida (entropía cruzada sumada), por dominio. El presupuesto de rango por matriz sigue la regla de SVD-LLM al mismo ratio de eliminación.

La calibración de utilidad usa wikitext-2-raw-v1 train con el sampler de SVD-LLM (255 ventanas de 2.048 tokens, semilla 42, entropía cruzada de next-token). La calibración de seguridad usa `results/dual_kfac_wj/wj_safe_l3.jsonl` (512 muestras, pérdida sobre tokens de respuesta). Tras la compresión, la recuperación se realiza con la etapa 2 de SVD-LLM: LoRA secuencial sobre U y luego sobre V, con alpaca-cleaned, r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256 y bf16. La semilla global es 42.

## Capacidades

- Generación de texto conversacional heredada de Llama-3-8B-Instruct, sujeta a la degradación introducida por la compresión.
- Razonamiento y respuesta a instrucciones en el rango esperado para un 8B, aunque no verificado en esta celda.
- Capacidad multilingüe heredada del modelo base, no documentada ni evaluada en esta ficha.
- No se documenta soporte explícito de tool calling ni function calling en la model card.
- No se documenta soporte de agentes ni multi-step reasoning específico.
- No se documentan modos especiales (thinking, visión, audio).
- El interés principal es de interpretabilidad y análisis de seguridad bajo compresión, no de uso como asistente.

## Casos de uso

- Investigación sobre compresión de LLM: sirve como celda de referencia para medir cómo la SVD con K-FAC de doble dominio afecta a la perplejidad y a la tasa de éxito de ataques, comparándola con otras celdas del mismo grid.
- Estudio del trade-off seguridad/utilidad: permite reproducir y analizar el efecto del peso `a = 0.248` sobre AdvBench ASR, StrongREJECT ASR y sobre-rechazo macro, con métricas ya reportadas por el autor.
- Auditoría de mecanismos de seguridad en modelos comprimidos: útil para investigadores que quieran aislar qué componentes (matrices U/V, capas) concentran la degradación de seguridad tras eliminar el 40 % de parámetros.
- Baseline para técnicas de recuperación post-compresión: la etapa 2 con LoRA secuencial (r=8, alpha=16, alpaca-cleaned) sirve como punto de comparación frente a otros esquemas de recuperación.
- Reproducibilidad metodológica: el detalle de calibración (wikitext-2, 255 ventanas de 2.048 tokens, semilla 42) y de seguridad (512 muestras) permite replicar el experimento en otros modelos base.
- Docencia y divulgación técnica: ejemplo concreto y medido de cómo la compresión SVD interactúa con el alineamiento de seguridad, útil en cursos de interpretabilidad y eficiencia de modelos.
- Análisis de robustez frente a jailbreaks: los valores de ASR reportados permiten estudiar la frontera entre rechazo correcto y sobre-rechazo en un modelo comprimido.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0096 |
| StrongREJECT ASR (juez HarmBench) | 0,0288 |
| Sobre-rechazo macro (WildGuard) | 0,3570 |
| Perplejidad WikiText-2 | 15,5202 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otras tareas de capacidad general para esta celda.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, 18-24 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB; en 4 bits, en torno a 4-5 GB (no documentado por el autor, estimación a partir del tamaño de pesos).
- GPU recomendadas para bf16: A100 40/80 GB, H100, L40S; en consumer, RTX 4090 (24 GB) o RTX 3090 (24 GB) para contextos cortos.
- Cabe en GPU consumer de 24 GB en bf16 con margen ajustado; en 16 GB (RTX 4080, 4070 Ti Super) requiere cuantización o contextos reducidos.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); vLLM y llama.cpp no están documentados por el autor para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l3_dualk_mix_tok_a0248_r40 | 8,03 B (59,98 % del denso) | no disponible (base: 8.192) | Llama 3 | Checkpoint experimental de compresión SVD con K-FAC dual; ASR AdvBench 0,0096; PPL WikiText-2 15,52 |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03 B | 8.192 | Llama 3 | Modelo base sin comprimir; referencia de utilidad y seguridad |
| Otras celdas del grid de Jeesup | ~8 B comprimidas | no disponible | Llama 3 | Variantes con distintas reglas de selección y presupuestos; no publicadas en detalle en la información disponible |

No se dispone de datos de benchmarks comparables de terceros (por ejemplo, Llama-3-8B-Instruct sin comprimir) en la información proporcionada, por lo que no se ofrece una comparación numérica directa.

## Limitaciones y advertencias

- El propio autor advierte que varias ramas del grid están deliberadamente degradadas en seguridad; este checkpoint debe tratarse como sujeto experimental, no como asistente desplegable.
- La compresión por sí sola eleva la tasa de éxito de ataques; el objetivo del estudio es cuantificarlo y probar la recuperación, no garantizar seguridad.
- Riesgo de alucinación no evaluado específicamente en esta celda; se espera al menos el del modelo base, potencialmente agravado por la compresión.
- Idiomas soportados no documentados; no se ha verificado el comportamiento multilingüe tras la compresión.
- Longitud de contexto no documentada en la model card; se asume la del base (8.192 tokens) pero no está confirmada para este checkpoint.
- Sin datos publicados de MMLU, HumanEval, GSM8K ni otras tareas de capacidad, por lo que la utilidad general no está cuantificada.
- La licencia Llama 3 Community License impone restricciones de uso comercial y obligaciones de atribución ("Built with Meta Llama 3"); `LICENSE` y `USE_POLICY.md` están incluidos en el repositorio.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente.
- La recuperación con LoRA secuencial sobre alpaca-cleaned puede introducir sesgos de estilo y de dominio no analizados.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_dualk_mix_tok_a0248_r40
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia Llama 3: incluida en el repositorio (`LICENSE` y `USE_POLICY.md`)
- SVD-LLM (metodología de compresión y presupuesto de rango): no disponible en la información proporcionada
- K-FAC (curvatura para compresión): no disponible en la información proporcionada
- AdvBench, StrongREJECT, HarmBench, WildGuard: no disponibles como enlaces en la información proporcionada
