# Jeesup/svd-safety-l2_dualk_mix_tok_a0528_r40

## Resumen

`svd-safety-l2_dualk_mix_tok_a0528_r40` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf`, publicado por el usuario Jeesup en Hugging Face. No es un modelo conversacional de propósito general, sino una celda concreta dentro de un grid experimental que estudia cómo la compresión por SVD degrada el comportamiento de seguridad de un LLM y qué regla de selección de componentes lo repara mejor. El checkpoint se ha comprimido hasta el 60,0 % de los parámetros densos originales (40,00 % de parámetros eliminados) y después se ha recuperado parcialmente mediante LoRA de segunda etapa.

La compresión emplea una SVD blanqueada con K-FAC en dos dominios (utilidad y seguridad) con presupuesto de rango de SVD-LLM. El resultado son 6.738.415.616 parámetros totales en formato safetensors, con un repositorio de 13,5 GB. La arquitectura subyacente es la de Llama 2 (transformer decoder-only), por lo que hereda su ventana de contexto y su tokenizador, aunque la model card no documenta explícitamente esos valores.

La relevancia de este artefacto es metodológica: cuantifica el compromiso entre seguridad y utilidad bajo compresión y sirve como sujeto experimental para estudiar reglas de selección de componentes. El propio autor advierte que varias ramas del grid están deliberadamente degradadas en seguridad y que cualquier celda debe evaluarse antes de extraer conclusiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), comprimido por SVD |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama-2-7b-chat, no documentada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Llama-2-7b-chat y aplica una compresión SVD blanqueada con K-FAC en dos dominios. La matriz de curvatura mixta se construye como `F_mix = [(1-a) G_u + a G_s] (x) [(1-a) A_u + a A_s]`, con un peso de seguridad `a = 0,5280`. La normalización de curvatura es `tok`: `A` dividido por posiciones y `G` dividido por tokens de pérdida (entropía cruzada sumada), por dominio. El presupuesto de rango por matriz sigue el criterio de SVD-LLM al mismo ratio de eliminación (40,00 %), resultando en una fracción de parámetros de 0,5998. La semilla es 42.

La calibración de utilidad usa `wikitext-2-raw-v1` train con el muestreador de SVD-LLM (255 ventanas de 2048 tokens, semilla 42, entropía cruzada de siguiente token). La calibración de seguridad usa `results/dual_kfac_wj/wj_safe_l2.jsonl` (512 muestras, pérdida sobre tokens de respuesta). Tras la compresión, se aplica la etapa 2 de recuperación de SVD-LLM: LoRA secuencial sobre U y luego V, con `alpaca-cleaned`, r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256 y bf16.

## Capacidades

- Generación de texto conversacional heredada de Llama-2-7b-chat, sujeta a la degradación introducida por la compresión.
- Razonamiento y respuesta a instrucciones en la medida en que sobreviven al 60 % de parámetros.
- Capacidad multilingüe no documentada en la model card; se desconoce el impacto de la compresión por idioma.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, visión ni audio.
- El checkpoint está diseñado como sujeto experimental para medir seguridad y utilidad bajo compresión, no como asistente desplegable.

## Casos de uso

- Estudio de degradación de seguridad bajo compresión: el checkpoint sirve como una celda del grid para medir cómo varía la tasa de éxito de ataque (ASR) al eliminar el 40 % de parámetros y compararla con otras reglas de selección.
- Comparación de reglas de selección de componentes: permite contrastar la regla de SVD blanqueada dual con alternativas del mismo grid, manteniendo constante el presupuesto de rango.
- Calibración de pesos de seguridad: el valor `a = 0,5280` es un punto concreto del barrido que permite estudiar la sensibilidad del ASR y del over-refusal a la mezcla de curvaturas.
- Investigación en interpretabilidad de compresión: al conservar la estructura de Llama 2, se pueden aplicar técnicas de análisis de activaciones y comparar con el modelo denso original.
- Evaluación de pipelines de recuperación LoRA: la etapa 2 (LoRA secuencial U/V sobre alpaca-cleaned) puede reproducirse y medirse su efecto sobre perplejidad y seguridad.
- Reproducción de experimentos académicos: con semilla, sampler y datasets documentados, el checkpoint permite replicar los resultados de la tabla "Measured" en un entorno controlado.
- Auditoría de seguridad de modelos comprimidos: útil para equipos que evalúan si un checkpoint comprimido puede desplegarse, comparando sus métricas con umbrales internos antes de cualquier uso real.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (HarmBench judge) | 0,0038 |
| StrongREJECT ASR (HarmBench judge) | 0,0128 |
| Macro over-refusal (WildGuard) | 0,5337 |
| WikiText-2 perplexity | 10,5789 |

No se han publicado en la información disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni benchmarks similares.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, 16-24 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: en torno a 7 GB de pesos; en 4 bits, en torno a 3,5-4 GB (no se documentan cuantizaciones oficiales para este checkpoint).
- GPU recomendadas para bf16: A100 40/80 GB, H100, L40S, RTX A6000; para consumer, RTX 4090 (24 GB) es suficiente en bf16 con contexto moderado.
- Cabe en GPU consumer: sí, en RTX 3090/4090 (24 GB) en bf16 con contexto limitado, y en GPUs de 8-12 GB si se cuantiza a 4 bits.
- Opciones de despliegue: transformers (soporte nativo), text-generation-inference (tag `text-generation-inference`), y previsiblemente vLLM y llama.cpp si se generan pesos GGUF (no se proporcionan en el repo).
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l2_dualk_mix_tok_a0528_r40 | 6.738.415.616 (60 % de Llama-2-7b-chat) | no disponible | Llama 2 | Checkpoint experimental comprimido por SVD |
| meta-llama/Llama-2-7b-chat-hf | ~6,74 mil millones (denso) | 4096 tokens (documentado por Meta) | Llama 2 | Modelo base sin comprimir |
| SVD-LLM (checkpoints de referencia del paper) | variable según ratio | heredado de Llama 2 | Llama 2 | Método de compresión SVD con recuperación LoRA |
| Otros checkpoints del grid de Jeesup | variable | no disponible | Llama 2 | Distintas reglas de selección y presupuestos |

No se dispone de datos de benchmarks comparativos entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El autor advierte explícitamente que este checkpoint no es un asistente de propósito general y que debe tratarse como sujeto experimental.
- Varias ramas del grid están deliberadamente degradadas en seguridad; la compresión por sí sola eleva la tasa de éxito de ataque, y este checkpoint concreto debe evaluarse antes de cualquier uso.
- Riesgo de alucinación no cuantificado en la model card; la perplejidad en WikiText-2 (10,5789) sugiere una degradación respecto al modelo denso, aunque no se aporta la cifra de referencia.
- El macro over-refusal (WildGuard) de 0,5337 indica una tasa elevada de rechazos excesivos, lo que puede afectar a la utilidad conversacional.
- Idiomas soportados no documentados; se desconoce el impacto diferencial de la compresión por idioma.
- Licencia Llama 2 Community License: restricciones de uso comercial y obligaciones de atribución; `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio.
- Sin cuantizaciones oficiales publicadas; cualquier GGUF o AWQ sería una conversión de terceros.
- Sin datos de benchmarks estándar (MMLU, HumanEval, GSM8K) que permitan comparar su calidad general con el modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_dualk_mix_tok_a0528_r40
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2: https://ai.meta.com/llama/license/
- SVD-LLM (método de compresión referenciado en la model card): no se proporciona enlace directo en la información disponible
- HarmBench (juez de evaluación): no se proporciona enlace directo en la información disponible
- StrongREJECT: no se proporciona enlace directo en la información disponible
- WildGuard: no se proporciona enlace directo en la información disponible
