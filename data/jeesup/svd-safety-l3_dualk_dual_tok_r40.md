# Jeesup/svd-safety-l3_dualk_dual_tok_r40

## Resumen

`svd-safety-l3_dualk_dual_tok_r40` es un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct`, publicado por el usuario Jeesup en Hugging Face. No es un modelo entrenado desde cero ni un fine-tune convencional: es el resultado de aplicar una compresión SVD con curvatura dual (utilidad y seguridad) sobre el modelo base, reduciendo sus parámetros densos al 60,0 % y recuperando parte de la calidad con una etapa de LoRA. El objetivo declarado es estudiar cómo la compresión SVD degrada el comportamiento de seguridad y qué regla de selección de componentes lo repara mejor.

El modelo forma parte de una rejilla experimental sobre reglas de selección y presupuestos de compresión; esta celda concreta corresponde al solver `dual` con peso de seguridad `a = 0.1238`, normalización de curvatura `tok` y un presupuesto de rango heredado de SVD-LLM. Conserva la arquitectura transformer decoder-only de Llama 3 8B, con 8.030.261.248 parámetros reales según los safetensors y una ventana de contexto de 8.192 tokens (la del modelo base).

Su relevancia es metodológica más que práctica: proporciona métricas medidas de tasa de éxito de ataque (ASR) en AdvBench y StrongREJECT, sobre-rechazo macro en WildGuard y perplejidad en WikiText-2, lo que permite cuantificar el coste de seguridad de la compresión. El propio autor advierte explícitamente de que no debe tratarse como un asistente desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), comprimido mediante SVD con curvatura dual K-FAC |
| Parametros totales | 8.030.261.248 (fracción densa 0,5998 respecto al base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (heredada de Llama-3-8B-Instruct) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en bf16; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible (la model card no declara idiomas; el base soporta principalmente inglés y multilingüe limitado) |
| Licencia | Meta Llama 3 Community License (`llama3`) |
| Formato de pesos | safetensors (16,1 GB de repo) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3 8B Instruct: un transformer decoder-only con atención por grupos (GQA), RoPE y SwiGLU. Sobre ese modelo se aplica una compresión SVD-LLM con presupuesto de rango por matriz al mismo ratio de eliminación (40,00 % de parámetros eliminados). La innovación del checkpoint es el criterio de selección de componentes: en lugar de usar solo la curvatura de utilidad, se combina una matriz de curvatura de utilidad (calibrada con wikitext-2-raw-v1, 255 ventanas de 2.048 tokens, entropía cruzada de siguiente token) con una de seguridad (calibrada sobre `results/dual_kfac_wj/wj_safe_l3.jsonl`, 512 muestras, pérdida sobre tokens de respuesta), ponderadas por `a = 0.1238`. El solver `dual` resuelve el óptimo de bajo rango de `F_dual = (1-a) G_u ⊗ A_u + a G_s ⊗ A_s` mediante ALS sobre base conjunta, partiendo de la solución mixta, con hasta 300 barridos, `rtol 1e-07` y `ridge 1e-06`.

Tras la compresión se aplica la etapa 2 de SVD-LLM: LoRA secuencial sobre U y luego sobre V, con `r=8`, `alpha=16`, 2 épocas, `lr 1e-4`, batch 64, cutoff 256 y bf16, entrenado sobre `alpaca-cleaned`. La semilla es 42. No se documenta RLHF ni DPO adicionales; el alineamiento de seguridad procede del modelo base y de la calibración de curvatura usada en la compresión.

## Capacidades

- Generación de texto conversacional: hereda el formato de chat de Llama-3-8B-Instruct, con tokens especiales de cabecera y turnos.
- Razonamiento y conocimiento general: conserva la mayor parte de las capacidades del base al retener el 60 % de los parámetros, aunque con degradación medible (perplejidad WikiText-2 de 16,2368).
- Generación de código y matemáticas: no se documentan evaluaciones específicas en la model card; se espera un comportamiento inferior al base por la compresión.
- Tool calling / function calling: no se documenta soporte explícito en la model card; el base no incluye un formato nativo de herramientas más allá del prompting.
- Agentes y razonamiento multi-paso: no evaluado ni documentado.
- Capacidades multilingües: no declaradas; el calibrado y el fine-tune LoRA se hicieron sobre datos en inglés (wikitext-2 y alpaca-cleaned).
- Capacidad especial: el checkpoint está diseñado como sujeto experimental para medir el efecto de la compresión sobre la seguridad (ASR, sobre-rechazo) y sobre la perplejidad.

## Casos de uso

- Investigación sobre compresión de modelos: sirve como celda de referencia en estudios que comparan reglas de selección de componentes (utilidad sola frente a curvatura dual) bajo un mismo presupuesto de rango.
- Análisis del trade-off seguridad-utilidad: permite medir ASR en AdvBench y StrongREJECT y sobre-rechazo en WildGuard sobre un checkpoint comprimido concreto y contrastarlo con el base sin comprimir.
- Calibración de metodologías de evaluación de seguridad: útil para validar pipelines de jueces automáticos (HarmBench judge, WildGuard) frente a variaciones controladas del modelo.
- Reproducibilidad de experimentos SVD-LLM: al documentarse semilla, solver, calibración y hiperparámetros de LoRA, se puede replicar la celda y extender la rejilla a otros presupuestos.
- Estudio de la etapa de recuperación LoRA: permite aislar cuánto repara el LoRA secuencial U→V sobre alpaca-cleaned tras una compresión agresiva.
- Docencia y divulgación técnica: ejemplo concreto de cómo se mide la degradación de seguridad inducida por compresión, con métricas publicadas y trazabilidad de procedencia.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (HarmBench judge) | 0,0423 |
| StrongREJECT ASR (HarmBench judge) | 0,0479 |
| Macro over-refusal (WildGuard) | 0,1948 |
| WikiText-2 perplexity | 16,2368 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numéricas directas con el modelo base u otros checkpoints de la rejilla.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 18-24 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB de pesos; en 4 bits, en torno a 4,5-5 GB (no se publican GGUF oficiales, habría que generarlos).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16; RTX 3090/4080 para cuantización 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en bf16 con contexto limitado; en RTX 3090/4080/4070 Ti Super con cuantización.
- Opciones de despliegue: `transformers` (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp u Ollama requerirían conversión previa, no documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `Jeesup/svd-safety-l3_dualk_dual_tok_r40` | 8,03 B (60 % denso) | 8.192 | Llama 3 Community | Checkpoint comprimido de investigación; ASR AdvBench 0,0423, PPL WikiText-2 16,2368 |
| `meta-llama/Meta-Llama-3-8B-Instruct` | 8,03 B | 8.192 | Llama 3 Community | Modelo base sin comprimir; referencia de utilidad y seguridad |
| Otras celdas de la rejilla del mismo autor | ~8 B comprimidos | 8.192 | Llama 3 Community | Variantes con distintas reglas de selección y presupuestos; no se dispone de métricas comparativas en la información proporcionada |
| Alternativas de 7-8 B comprimidas (p. ej. destilaciones SVD-LLM públicas) | variable | variable | variable | No disponible comparación numérica en la información proporcionada |

## Limitaciones y advertencias

- No es un modelo de propósito general: el autor lo describe explícitamente como artefacto de investigación y advierte de que varias celdas de la rejilla están deliberadamente degradadas en seguridad.
- La compresión por sí sola eleva la tasa de éxito de ataque; aunque este checkpoint reporta ASR bajo (0,0423 en AdvBench), debe evaluarse de forma independiente antes de cualquier uso.
- Riesgo de alucinación: no evaluado en la model card; la compresión al 60 % y la recuperación LoRA limitada pueden incrementar errores factuales respecto al base.
- Sobre-rechazo macro de 0,1948 en WildGuard, lo que indica una tasa no trivial de rechazos innecesarios en consultas benignas.
- Idiomas: no declarados; el calibrado y el LoRA se hicieron en inglés, por lo que el rendimiento en castellano no está garantizado.
- Restricciones de licencia: Meta Llama 3 Community License, con `LICENSE` y `USE_POLICY.md` incluidos en el repo; el uso comercial está sujeto a los términos de Meta y a la política de uso aceptable.
- Formato: solo safetensors en bf16; no hay GGUF, AWQ, GPTQ ni cuantizaciones publicadas, lo que limita el despliegue en entornos de bajo consumo sin trabajo adicional de conversión.
- Contexto: 8.192 tokens, inferior a los 128K de Llama 3.1 y a otras alternativas recientes; no apto para tareas de contexto largo.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_dualk_dual_tok_r40
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia Llama 3: https://llama.meta.com/llama3/license/
- Política de uso de Llama 3: https://llama.meta.com/llama3/use-policy/
- SVD-LLM (método de compresión referenciado): no disponible enlace directo en la información proporcionada
- HarmBench (juez de evaluación): no disponible enlace directo en la información proporcionada
- WildGuard (evaluación de sobre-rechazo): no disponible enlace directo en la información proporcionada
