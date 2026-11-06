# Jeesup/svd-safety-l3_dualk_dual_tok_a0248_r40

## Resumen

`svd-safety-l3_dualk_dual_tok_a0248_r40` es un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct`, publicado por el usuario Jeesup en Hugging Face. No es un modelo conversacional de propósito general, sino un artefacto experimental: una versión del Llama-3-8B-Instruct comprimida al 60,0 % de sus parámetros densos mediante una variante de SVD de bajo rango (dual-domain K-FAC whitened SVD) y posteriormente recuperada con LoRA en dos etapas según la metodología SVD-LLM.

El objetivo del estudio subyacente es cuantificar cómo la compresión SVD degrada el comportamiento de seguridad del modelo base y qué regla de selección de componentes repara mejor esa degradación. Este checkpoint es una celda concreta de una cuadrícula de experimentos que varía la regla de selección y el presupuesto de rango; en este caso, el solver es `dual` (curvatura de utilidad y de seguridad combinadas) con un peso de seguridad `a = 0,248` y una eliminación del 40,00 % de los parámetros.

Su relevancia es metodológica más que práctica: proporciona métricas medidas de tasa de éxito de ataque (ASR) en AdvBench y StrongREJECT, sobrerrechazo en WildGuard y perplejidad en WikiText-2, lo que permite estudiar el equilibrio seguridad/utilidad bajo compresión. El autor advierte explícitamente de que varias celdas de la cuadrícula están deliberadamente degradadas en seguridad y que ninguna debe tratarse como un asistente desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), comprimido mediante SVD de bajo rango con presupuesto de rango por matriz |
| Parametros totales | 8.030.261.248 (8B); fracción resultante tras compresión: 0,5998 del denso original |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Llama 3 8B Instruct soporta 8.192 tokens, dato no confirmado en esta ficha) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Llama 3 Community License (se incluyen `LICENSE` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

El modelo parte de `meta-llama/Meta-Llama-3-8B-Instruct`, un transformer decoder-only de 8B parámetros, y se somete a una compresión SVD de bajo rango guiada por curvatura. El solver `dual` calcula el óptimo de bajo rango de `F_dual = (1-a)·G_u ⊗ A_u + a·G_s ⊗ A_s`, donde cada dominio tiene su propia aproximación K-FAC: utilidad (`u`) y seguridad (`s`). El peso de seguridad es `a = 0,2480` (`--alpha 0.248`) y la normalización de curvatura es `tok`: `A` dividido por posiciones y `G` dividido por tokens de pérdida (entropía cruzada sumada), por dominio. La optimización se resuelve con ALS sobre base conjunta, partiendo de la solución mixta, con hasta 300 barridos, `rtol 1e-07` y `ridge 1e-06`. El presupuesto de rango por matriz corresponde al de SVD-LLM para la misma ratio de eliminación (40,00 %).

La calibración de utilidad usa `wikitext-2-raw-v1` de entrenamiento con el muestreador de SVD-LLM: 255 ventanas de 2.048 tokens, semilla 42, pérdida de entropía cruzada de siguiente token. La calibración de seguridad usa `results/dual_kfac_wj/wj_safe_l3.jsonl` (512 muestras, pérdida sobre tokens de respuesta). Tras la compresión, el modelo se recupera con la etapa 2 de SVD-LLM: LoRA secuencial U y luego V, sobre `alpaca-cleaned`, con r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256 y precisión bf16.

## Capacidades

- Generación de texto conversacional heredada del Llama-3-8B-Instruct base, sujeta a la degradación introducida por la compresión.
- Razonamiento e instrucciones generales, con calidad medida indirectamente mediante perplejidad en WikiText-2 (16,9649).
- Comportamiento de rechazo ante peticiones dañinas, evaluado con AdvBench y StrongREJECT mediante el juez HarmBench.
- Soporte de tool calling y function calling: no documentado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información proporcionada.
- Capacidades multilingües: no documentadas en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre compresión de modelos: sirve como celda de control experimental para medir cómo el solver `dual` con `a = 0,248` afecta a la tasa de éxito de ataque frente al modelo denso original, usando AdvBench y StrongREJECT con el juez HarmBench.
- Estudio del equilibrio seguridad/utilidad: la pareja de métricas ASR (0,0346 en AdvBench, 0,0288 en StrongREJECT) y sobrerrechazo macro en WildGuard (0,2180) permite trazar curvas de compromiso y comparar reglas de selección de componentes dentro de la misma cuadrícula.
- Reproducción de pipelines SVD-LLM: el checkpoint documenta con precisión el presupuesto de rango, la calibración (255 ventanas de 2.048 tokens de WikiText-2, 512 muestras de seguridad) y los hiperparámetros de LoRA, lo que facilita replicar el procedimiento sobre otros modelos.
- Evaluación de robustez de salvaguardas: útil para probar arneses de red-teaming y jueces automáticos (HarmBench, WildGuard) contra modelos comprimidos con distintas ratios de eliminación.
- Análisis de degradación por perplejidad: con WikiText-2 PPL de 16,9649, permite correlacionar pérdida de calidad lingüística con cambios en el comportamiento de rechazo.
- Docencia y divulgación técnica: ejemplo reproducible de cómo la eliminación de un 40,00 % de parámetros mediante SVD afecta a propiedades de alineación, adecuado para materiales sobre interpretabilidad y compresión.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0346 |
| StrongREJECT ASR (juez HarmBench) | 0,0288 |
| Sobrerrechazo macro (WildGuard) | 0,2180 |
| Perplejidad WikiText-2 | 16,9649 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: en torno a 16 GB solo para pesos (8,03B parámetros × 2 bytes), más overhead de activaciones y caché KV; el repositorio ocupa 16,1 GB.
- GPU recomendadas para bf16: A100 40 GB, H100, L40S o RTX 4090 24 GB (esta última con margen ajustado según longitud de contexto y batch).
- GPU de consumo: cabe en RTX 4090 24 GB en bf16 con batch pequeño; en GPUs de 16 GB requeriría cuantización, cuyos formatos no están documentados en la información proporcionada.
- Opciones de despliegue: `transformers` (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`) y vLLM (referenciado en la página del modelo hermano `mix`); llama.cpp y Ollama no están confirmados.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l3_dualk_dual_tok_a0248_r40 | 8,03B (60,0 % del denso) | no disponible | Llama 3 | Checkpoint de investigación comprimido con SVD dual-domain K-FAC |
| meta-llama/Meta-Llama-3-8B-Instruct | 8B | no disponible en esta ficha | Llama 3 | Modelo base sin comprimir; referencia de utilidad y seguridad |
| Jeesup/svd-safety-l3_dualk_mix_tok_a0248_r40 | no disponible | no disponible | Llama 3 | Celda hermana de la misma cuadrícula con solver `mix` en lugar de `dual` |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El autor declara explícitamente que este checkpoint no es un modelo conversacional de propósito general y que debe tratarse como sujeto experimental, no como asistente desplegable.
- Varias celdas de la cuadrícula están deliberadamente degradadas en seguridad; la compresión por sí sola eleva la tasa de éxito de ataque, y este modelo forma parte de ese estudio.
- Riesgo de alucinación y degradación de calidad no cuantificados más allá de la perplejidad en WikiText-2 (16,9649); no hay evaluaciones de fidelidad factual.
- Sesgos conocidos: no documentados en la información proporcionada; hereda los del Llama-3-8B-Instruct base, no evaluados aquí.
- Idiomas soportados y comportamiento multilingüe: no disponibles; no se debe asumir el mismo perfil que el modelo base.
- Longitud de contexto efectiva tras la compresión: no documentada; la compresión por SVD puede alterar el comportamiento en contextos largos.
- Restricciones de licencia: uso sujeto a la Llama 3 Community License; deben respetarse `LICENSE` y `USE_POLICY.md` incluidos en el repositorio, incluidas las cláusulas de atribución ("Built with Meta Llama 3").
- Uso comercial: permitido solo en los términos de la licencia Llama 3; el carácter de artefacto de investigación y las posibles degradaciones de seguridad desaconsejan su uso en producción sin evaluación propia.
- El autor recomienda evaluar el modelo de forma independiente antes de extraer conclusiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_dualk_dual_tok_a0248_r40
- Celda hermana con solver `mix`: https://huggingface.co/Jeesup/svd-safety-l3_dualk_mix_tok_a0248_r40
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
