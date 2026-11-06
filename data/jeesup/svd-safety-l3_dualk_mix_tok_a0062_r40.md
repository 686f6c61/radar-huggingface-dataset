# Jeesup/svd-safety-l3_dualk_mix_tok_a0062_r40

## Resumen

`svd-safety-l3_dualk_mix_tok_a0062_r40` es un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct`, publicado por el usuario Jeesup en Hugging Face. No es un modelo entrenado desde cero ni un fine-tune convencional: es el resultado de aplicar una compresión SVD (descomposición en valores singulares) con curvatura K-FAC ponderada en dos dominios (utilidad y seguridad) sobre el modelo base, eliminando el 40 % de los parámetros densos y recuperando parte del rendimiento con un LoRA de segunda etapa según la metodología SVD-LLM. El checkpoint conserva 8.030.261.248 parámetros y ocupa 16,1 GB en el repositorio.

El propósito declarado del autor es estudiar cómo la compresión SVD degrada el comportamiento de seguridad de un LLM y qué regla de selección de componentes repara mejor ese daño. Este checkpoint concreto es una celda de una cuadrícula experimental sobre reglas de selección y presupuestos de rango, con un peso de seguridad `a = 0.062` y normalización de curvatura por tokens. El autor advierte explícitamente que no es un modelo de chat de propósito general y que varias celdas de la cuadrícula están deliberadamente degradadas en seguridad respecto al modelo base.

La relevancia es metodológica: ofrece un punto de medida reproducible (ASR en AdvBench y StrongREJECT, sobre-rechazo en WildGuard, perplejidad en WikiText-2) para investigar el equilibrio entre utilidad y alineación bajo compresión de parámetros, un área con pocos artefactos públicos que aíslen esta variable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), comprimido mediante SVD con curvatura K-FAC dual y recuperación LoRA |
| Parametros totales | 8.030.261.248 (fracción 0,5998 respecto al denso original, 40,00 % eliminado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Llama 3 8B Instruct soporta 8.192 tokens) |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Meta Llama 3 Community License (`LICENSE` y `USE_POLICY.md` incluidos en el repositorio) |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Llama 3 de 8B parámetros (transformer decoder-only con atención causal y RoPE). Sobre esa base se aplica una compresión SVD con preblanqueado por curvatura K-FAC en dos dominios: una matriz de curvatura de utilidad `G_u`/`A_u` calculada sobre `wikitext-2-raw-v1` (muestreo tipo SVD-LLM, 255 ventanas de 2.048 tokens, semilla 42, entropía cruzada de siguiente token) y una matriz de curvatura de seguridad `G_s`/`A_s` calculada sobre `results/dual_kfac_wj/wj_safe_l3.jsonl` (512 muestras, pérdida sobre tokens de respuesta). El solver `mix` resuelve una SVD blanqueada en forma cerrada sobre la curvatura mixta `F_mix = [(1-a) G_u + a G_s] ⊗ [(1-a) A_u + a A_s]` con `a = 0.062`. La normalización de curvatura es `tok`: `A` dividida por posiciones y `G` dividida por tokens de pérdida (entropía cruzada sumada), por dominio.

El presupuesto de rango por matriz sigue el de SVD-LLM para la misma ratio de eliminación. Tras la compresión, se aplica la etapa 2 de SVD-LLM: LoRA secuencial sobre `U` y luego sobre `V`, con `r=8`, `alpha=16`, 2 épocas, `lr=1e-4`, batch 64, cutoff 256 y precisión bf16, entrenado sobre `alpaca-cleaned`. No se documentan en la información disponible fases de RLHF o DPO adicionales; la alineación procede del modelo base y de la etapa LoRA de recuperación.

## Capacidades

- Generación de texto conversacional y de instrucciones, heredada del modelo base Llama 3 8B Instruct.
- Razonamiento y respuesta a instrucciones en formato chat, sujeto a la degradación introducida por la compresión.
- Capacidad multilingüe: no disponible en la información proporcionada (el modelo base Llama 3 cubre ocho idiomas, pero el autor no documenta el comportamiento tras compresión).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el autor desaconseja su uso como asistente desplegable.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Valor de investigación: permite medir ASR (AdvBench, StrongREJECT) y sobre-rechazo (WildGuard) bajo una configuración de compresión concreta.

## Casos de uso

- Estudio de robustez de alineación bajo compresión: usar este checkpoint como celda de control en una cuadrícula que compare reglas de selección de componentes (curvatura de utilidad, de seguridad o mixta) y presupuestos de rango, midiendo ASR con HarmBench como juez.
- Análisis del compromiso seguridad-utilidad: combinar la perplejidad en WikiText-2 (15,2881) con el ASR en AdvBench (0,0135) y StrongREJECT (0,0447) para trazar la frontera de Pareto entre calidad de modelado y resistencia a jailbreaks.
- Evaluación de sobre-rechazo: emplear el 0,2870 de sobre-rechazo macro en WildGuard para cuantificar el coste en utilidad conversacional de las intervenciones de seguridad, comparándolo con el modelo base sin comprimir.
- Reproducibilidad metodológica: replicar el pipeline SVD-LLM con curvatura K-FAC dual (`a = 0.062`, normalización `tok`) sobre otros checkpoints de la familia Llama 3 y verificar si la tendencia se mantiene.
- Investigación en interpretabilidad de subespacios: analizar qué direcciones de los pesos comprimidos concentran la curvatura de seguridad y cómo se distribuyen tras la SVD, usando las matrices `U`/`V` recuperadas por LoRA.
- Docencia y divulgación técnica: ilustrar en un curso o artículo cómo una técnica de compresión aparentemente neutra altera propiedades de alineación, con métricas públicas y un artefacto descargable de 16,1 GB.
- Pruebas de pipelines de evaluación de seguridad: validar arneses de evaluación (HarmBench, WildGuard) contra un modelo con comportamiento conocido y documentado, antes de aplicarlos a modelos de producción.

## Benchmarks y rendimiento

| Benchmark | Métrica | Valor |
|---|---|---|
| AdvBench | ASR (juez HarmBench) | 0,0135 |
| StrongREJECT | ASR (juez HarmBench) | 0,0447 |
| WildGuard | Sobre-rechazo macro | 0,2870 |
| WikiText-2 | Perplejidad | 15,2881 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones directas con el modelo base sin comprimir u otras celdas de la cuadrícula.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda un GPU con 24 GB o más.
- Cuantización a 8 bits: entorno a 8-9 GB de pesos; a 4 bits: entorno a 4-5 GB, aunque el autor no publica variantes cuantizadas y habría que generarlas.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16; RTX 3090/4080 (16 GB) quedarían al límite y requerirían cuantización.
- Cabe en GPU de consumo: sí, en RTX 4090 en bf16 con contexto moderado; en RTX 3090/4080 solo con cuantización.
- Opciones de despliegue: `transformers` (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; vLLM y llama.cpp/Ollama no están documentados para este checkpoint y requerirían conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `Jeesup/svd-safety-l3_dualk_mix_tok_a0062_r40` | 8,03 B (0,5998 del denso) | no disponible | Llama 3 Community | Checkpoint de investigación con compresión SVD dual y LoRA de recuperación; ASR AdvBench 0,0135 |
| `meta-llama/Meta-Llama-3-8B-Instruct` | 8,03 B | 8.192 tokens | Llama 3 Community | Modelo base sin comprimir; referencia de utilidad y seguridad para este estudio |
| `meta-llama/Meta-Llama-3-8B` | 8,03 B | 8.192 tokens | Llama 3 Community | Variante pre-entrenada sin ajuste de instrucciones; no comparable en seguridad conversacional |
| Otras celdas de la cuadrícula del autor | variable | no disponible | Llama 3 Community | Reglas de selección y presupuestos de rango distintos; no se detallan en la información disponible |

No se dispone de datos de benchmarks del modelo base ni de otras alternativas en la información proporcionada, por lo que la comparación cuantitativa de rendimiento queda pendiente.

## Limitaciones y advertencias

- El autor declara explícitamente que este checkpoint no es un modelo de chat de propósito general y que debe tratarse como sujeto experimental, no como asistente desplegable.
- Varias celdas de la cuadrícula están deliberadamente degradadas en seguridad; la compresión por sí sola eleva la tasa de éxito de ataques, y este checkpoint incorpora un peso de seguridad bajo (`a = 0.062`).
- Riesgo de alucinación: no cuantificado en la información disponible; la compresión al 60 % de parámetros puede agravar la pérdida de fidelidad factual respecto al modelo base.
- Sesgos conocidos: no documentados específicamente para este checkpoint; hereda los del modelo base Llama 3 8B Instruct sin evaluación adicional publicada.
- Idiomas soportados: no documentados; el comportamiento multilingüe tras la compresión no está evaluado.
- Longitud de contexto: no documentada para el checkpoint comprimido; no se garantiza que mantenga los 8.192 tokens del modelo base.
- Restricciones de licencia: Meta Llama 3 Community License, con `LICENSE` y `USE_POLICY.md` en el repositorio; el uso comercial está sujeto a los términos de Meta, incluidos los umbrales de usuarios activos mensuales de la licencia.
- Ausencia de datos de benchmarks de calidad general (MMLU, HumanEval, GSM8K): no se puede afirmar que la utilidad se conserve más allá de la perplejidad en WikiText-2.
- El sobre-rechazo macro de 0,2870 en WildGuard indica una tasa apreciable de rechazos indebidos que afectaría a cualquier uso conversacional real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_dualk_mix_tok_a0062_r40
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia Meta Llama 3: https://llama.meta.com/llama3/license/
- Política de uso de Meta Llama 3: https://llama.meta.com/llama3/use-policy/
- Metodología SVD-LLM (referencia citada por el autor): no disponible en la información proporcionada
- HarmBench (juez de evaluación): no disponible en la información proporcionada
- WildGuard (evaluación de sobre-rechazo): no disponible en la información proporcionada
- StrongREJECT (benchmark de jailbreak): no disponible en la información proporcionada
- AdvBench (benchmark de ataques adversariales): no disponible en la información proporcionada
