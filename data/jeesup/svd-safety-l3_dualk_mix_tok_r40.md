# Jeesup/svd-safety-l3_dualk_mix_tok_r40

## Resumen

`svd-safety-l3_dualk_mix_tok_r40` es un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct`, publicado por el usuario Jeesup en Hugging Face. No es un modelo entrenado desde cero ni un asistente conversacional listo para producción: es una celda concreta de una rejilla experimental que estudia cómo la compresión por SVD degrada el comportamiento de seguridad de un LLM y qué regla de selección de componentes lo repara mejor. El modelo conserva el 59,98 % de los parámetros densos del original (un 40 % eliminado) mediante una SVD blanqueada con K-FAC de doble dominio (curvatura de utilidad y de seguridad) y un presupuesto de rango heredado de SVD-LLM.

La innovación metodológica está en el solver: en lugar de calcular la SVD sobre una única matriz de curvatura, se construye una matriz mixta `F_mix = [(1-a) G_u + a G_s] ⊗ [(1-a) A_u + a A_s]` con un peso de seguridad `a = 0.1238`, y se aplica una SVD en forma cerrada sobre ella. Tras la compresión, el checkpoint se recupera con la etapa 2 de SVD-LLM (LoRA secuencial sobre U y luego sobre V, con `alpaca-cleaned`, r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256, bf16).

Es relevante ahora porque la compresión de modelos es una práctica habitual para reducir costes de despliegue, y este artefacto cuantifica explícitamente el coste en seguridad que ello conlleva: el propio autor advierte que varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto al modelo base. La ficha siguiente trata este checkpoint como sujeto experimental, no como asistente desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), comprimido por SVD con presupuesto de rango SVD-LLM |
| Parametros totales | 8.030.261.248 (8,03 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Llama 3 8B Instruct soporta 8.192 tokens; el cutoff de entrenamiento LoRA fue de 256) |
| Tipos de cuantizacion | no disponible (el checkpoint se publica en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Meta Llama 3 Community License (`llama3`) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Meta-Llama-3-8B-Instruct` y aplica una compresión estructural por descomposición en valores singulares. La selección de componentes no usa la curvatura de utilidad sola, sino una combinación convexa de dos matrices K-FAC (una estimada sobre utilidad y otra sobre seguridad) con peso `a = 0.1238` para el término de seguridad. La normalización de curvatura es `tok`: `A` dividida por posiciones y `G` dividida por tokens de pérdida (entropía cruzada sumada), por dominio. El presupuesto de rango por matriz se toma del esquema de SVD-LLM al mismo ratio de eliminación (40 %), resultando en una fracción de parámetros de 0,5998.

La calibración de utilidad emplea `wikitext-2-raw-v1` (split de entrenamiento) con el muestreador de SVD-LLM: 255 ventanas de 2.048 tokens, semilla 42, pérdida de entropía cruzada de siguiente token. La calibración de seguridad usa `results/dual_kfac_wj/wj_safe_l3.jsonl` (512 muestras, pérdida sobre tokens de respuesta). Tras la compresión, se aplica la recuperación de etapa 2 de SVD-LLM: LoRA secuencial sobre U y luego sobre V, con `alpaca-cleaned`, r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256 y precisión bf16. La semilla global es 42.

## Capacidades

- Generación de texto conversacional heredada del modelo base Llama 3 8B Instruct, sujeta a la degradación introducida por la compresión.
- Razonamiento y matemáticas básicas: capacidades del modelo base, no reevaluadas de forma independiente en este checkpoint.
- Generación de código: capacidades del modelo base, no reevaluadas de forma independiente.
- Soporte de tool calling / function calling: no documentado en la información proporcionada; no se garantiza tras la compresión.
- Soporte de agentes y razonamiento multi-paso: no documentado; el autor indica explícitamente que no es un modelo de chat de propósito general.
- Capacidades multilingües: no disponibles.
- Capacidad especial: ninguna más allá de ser un artefacto de investigación para medir el compromiso seguridad/utilidad bajo compresión SVD.

## Casos de uso

- Estudio del impacto de la compresión en la seguridad: el checkpoint sirve como celda de control para medir cómo varía la tasa de éxito de ataques (ASR) al eliminar el 40 % de parámetros con una regla de selección concreta, comparándola con otras celdas de la rejilla.
- Evaluación de reglas de selección de componentes: permite contrastar la regla `mix` con peso `a = 0.1238` frente a alternativas (solo utilidad, solo seguridad u otras combinaciones) bajo el mismo presupuesto de rango.
- Reproducción experimental: con semilla 42 y calibraciones documentadas (wikitext-2 y `wj_safe_l3.jsonl`), sirve para replicar los resultados publicados y auditar la metodología.
- Investigación en interpretabilidad de la seguridad: al aislar qué componentes (matrices) concentran la curvatura de seguridad, facilita análisis de qué pesos son críticos para el comportamiento seguro.
- Benchmarking de pipelines de compresión: útil como referencia para validar implementaciones propias de SVD blanqueada con K-FAC y de la recuperación LoRA de etapa 2.
- Análisis de sobre-rechazo: la métrica de macro over-refusal (0,3526 con WildGuard) permite estudiar el equilibrio entre rechazar peticiones dañinas y rechazar peticiones legítimas en modelos comprimidos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0115 |
| StrongREJECT ASR (juez HarmBench) | 0,0351 |
| Macro over-refusal (WildGuard) | 0,3526 |
| Perplejidad WikiText-2 | 15,2818 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numéricas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 16 GB solo para pesos (8,03 B × 2 bytes), más overhead de activaciones y caché KV; en la práctica, 20-24 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: aproximadamente 8-9 GB para pesos; en 4 bits, aproximadamente 4-5 GB. No se publican variantes cuantizadas oficiales, por lo que habría que generarlas a partir de los safetensors.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16; RTX 3090 (24 GB) también es viable en bf16 con contextos moderados.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en bf16 con gestión de contexto; en GPUs de 8-12 GB requeriría cuantización.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp u Ollama no están documentados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `Jeesup/svd-safety-l3_dualk_mix_tok_r40` | 8,03 B (59,98 % del denso) | no disponible | Llama 3 Community | Artefacto de investigación; ASR AdvBench 0,0115, perplejidad WikiText-2 15,2818 |
| `meta-llama/Meta-Llama-3-8B-Instruct` | 8,03 B | 8.192 tokens | Llama 3 Community | Modelo base sin comprimir; referencia de utilidad y seguridad |
| Otras celdas de la rejilla del mismo autor | ~8 B comprimido | no disponible | Llama 3 Community | Variantes con distintas reglas de selección y presupuestos; algunas deliberadamente degradadas en seguridad |

No se dispone de datos de benchmarks comparativos con modelos de terceros en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de chat de propósito general: el autor lo describe explícitamente como artefacto de investigación y sujeto experimental.
- Varias celdas de la rejilla están deliberadamente degradadas en seguridad respecto a Llama-3-8B-Instruct; la compresión por sí sola eleva la tasa de éxito de ataques, y este checkpoint debe evaluarse antes de extraer conclusiones.
- Riesgo de alucinación: no cuantificado en la información disponible; la compresión al 60 % de parámetros puede incrementarlo respecto al modelo base.
- Sesgos: no documentados; hereda los del modelo base y los del dataset de recuperación (`alpaca-cleaned`).
- Limitaciones de contexto e idioma: no documentadas; el cutoff de entrenamiento LoRA fue de 256 tokens, lo que puede afectar al comportamiento en contextos largos.
- Restricciones de licencia: Meta Llama 3 Community License; el uso comercial y la redistribución están sujetos a `LICENSE` y `USE_POLICY.md` incluidos en el repositorio.
- Ausencia de cuantizaciones oficiales y de datos de latencia/throughput: requiere validación propia antes de cualquier despliegue.
- Sin descargas ni likes en el momento de la consulta: ecosistema de validación mínimo.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_dualk_mix_tok_r40
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- SVD-LLM (metodología de compresión y recuperación LoRA referenciada): no disponible en la información proporcionada
- HarmBench (juez de evaluación): no disponible en la información proporcionada
- StrongREJECT (benchmark de seguridad): no disponible en la información proporcionada
- WildGuard (evaluación de sobre-rechazo): no disponible en la información proporcionada
