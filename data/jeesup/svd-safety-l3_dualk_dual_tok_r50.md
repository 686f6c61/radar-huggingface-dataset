# Jeesup/svd-safety-l3_dualk_dual_tok_r50

## Resumen

`svd-safety-l3_dualk_dual_tok_r50` es un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct`, comprimido al 50,0 % de sus parámetros densos mediante una variante de SVD con blanqueado K-FAC en dos dominios (utilidad y seguridad) y presupuesto de rango heredado de SVD-LLM. Lo publica el usuario de Hugging Face `Jeesup` como una celda concreta de una rejilla experimental sobre reglas de selección de componentes y presupuestos de compresión. No es un modelo conversacional de propósito general: es un artefacto para medir cómo la compresión degrada el comportamiento de seguridad y qué regla de recuperación lo repara mejor.

El modelo mantiene la arquitectura transformer decoder-only de Llama 3 8B (8.030.261.248 parámetros reales según safetensors, es decir, una fracción de 0,4997 respecto al denso original), con contexto nativo de 8.192 tokens heredado de la familia Llama 3. Tras la compresión se aplicó una recuperación de etapa 2 tipo SVD-LLM con LoRA secuencial sobre U y luego V, entrenada con alpaca-cleaned (r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256, bf16).

Su relevancia es metodológica: cuantifica el coste en seguridad de la compresión SVD y propone una selección de bases guiada por curvatura dual (utilidad + seguridad) con un peso de seguridad de 0,1238. Los resultados publicados (ASR de 0,0481 en AdvBench y 0,1150 en StrongREJECT con juez HarmBench, sobre-rechazo macro de 0,1853 en WildGuard y perplejidad de 21,7638 en WikiText-2) permiten comparar directamente esta celda con el resto de la rejilla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), comprimido por SVD con blanqueado K-FAC dual |
| Parametros totales | 8.030.261.248 (fracción 0,4997 del denso original) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Llama 3 8B Instruct soporta 8.192 tokens) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en bf16 según el proceso de recuperación) |
| Idiomas soportados | no disponible |
| Licencia | Meta Llama 3 Community License (`llama3`) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de Llama 3 con 8B parámetros. La compresión elimina el 50,00 % de los parámetros mediante SVD con blanqueado K-FAC en dos dominios: se construyen dos pares de matrices de curvatura (G, A) por dominio, uno de utilidad y otro de seguridad, y se resuelve el óptimo de bajo rango de `F_dual = (1-a) G_u ⊗ A_u + a G_s ⊗ A_s` con ALS sobre base conjunta, partiendo de la solución mezcla. El peso de seguridad es `a = 0,1238` (flag `--alpha tok`). La normalización de curvatura es `tok`: A dividida por posiciones y G dividida por tokens de pérdida (CE sumada), por dominio. El presupuesto de rango por matriz se toma de SVD-LLM al mismo ratio de eliminación. La calibración de utilidad usa wikitext-2-raw-v1 train con el muestreador de SVD-LLM (255 ventanas de 2.048 tokens, semilla 42, CE de siguiente token); la de seguridad usa `results/dual_kfac_wj/wj_safe_l3.jsonl` (512 muestras, pérdida sobre tokens de respuesta). El solver ALS ejecuta hasta 300 barridos con rtol 1e-07 y ridge 1e-06.

Tras la compresión se aplica la recuperación de etapa 2 de SVD-LLM con LoRA secuencial (primero U, luego V) sobre alpaca-cleaned: r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256, bf16. No se documenta entrenamiento adicional con RLHF o DPO más allá del que ya incorpora el modelo base Instruct. La innovación técnica destacable es la selección de componentes guiada por curvatura dual, que busca preservar simultáneamente la perplejidad y el comportamiento de rechazo, en lugar de optimizar solo la reconstrucción de activaciones.

## Capacidades

- Generación de texto conversacional heredada del modelo base Llama 3 8B Instruct, sujeta a la degradación introducida por la compresión.
- Razonamiento y código: capacidad residual del base, no evaluada de forma específica en la información disponible.
- Tool calling / function calling: no disponible de forma explícita en la model card; el base lo soporta, pero no se garantiza tras la compresión.
- Agentes y razonamiento multi-paso: no evaluado.
- Capacidades multilingües: no documentadas; los idiomas figuran como no disponibles.
- Modo thinking, visión o audio: no disponibles.
- Comportamiento de rechazo medido: ASR de 0,0481 en AdvBench y 0,1150 en StrongREJECT con juez HarmBench, y sobre-rechazo macro de 0,1853 en WildGuard.

## Casos de uso

- Investigación sobre compresión de modelos: sirve como celda de control en estudios que comparan reglas de selección de componentes (SVD estándar frente a K-FAC dual) a un presupuesto fijo del 50 % de parámetros.
- Evaluación de seguridad post-compresión: permite medir el incremento de ASR atribuible a la compresión y contrastarlo con el modelo denso original usando AdvBench, StrongREJECT y WildGuard.
- Análisis del compromiso seguridad-utilidad: la perplejidad de 21,7638 en WikiText-2 y el sobre-rechazo de 0,1853 permiten trazar curvas de Pareto entre utilidad y alineación para distintas semillas y pesos `a`.
- Reproducción de pipelines SVD-LLM: el checkpoint documenta el solver, la calibración y los hiperparámetros de la etapa LoRA, de modo que se puede reejecutar la recuperación con otros datasets o rangos.
- Estudio de interpretabilidad de subespacios: la separación explícita entre curvatura de utilidad y de seguridad facilita analizar qué direcciones del espacio de pesos codifican el comportamiento de rechazo.
- Referencia para auditorías de modelos derivados: útil para equipos que necesitan un ejemplo documentado de artefacto experimental con licencia Llama 3 y métricas de seguridad publicadas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0481 |
| StrongREJECT ASR (juez HarmBench) | 0,1150 |
| Sobre-rechazo macro (WildGuard) | 0,1853 |
| Perplejidad WikiText-2 | 21,7638 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numéricas con el modelo denso original o con otras celdas de la rejilla.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16 GB solo para pesos, más KV cache y overhead; en la práctica, 20-24 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: unos 8-9 GB de pesos; en 4 bits, unos 4-5 GB, aunque no se publican GGUF oficiales y habría que generarlos.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16; RTX 3090/4080 para cuantización de 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en bf16 con contexto limitado, y en GPUs de 12-16 GB si se cuantiza.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp u Ollama requerirían conversión a los formatos correspondientes, no publicados.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l3_dualk_dual_tok_r50 | 8,03 B (50 % del denso) | no disponible (base: 8.192) | Llama 3 Community | ASR AdvBench 0,0481; PPL WikiText-2 21,7638 |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03 B | 8.192 | Llama 3 Community | Modelo base sin comprimir; referencia de utilidad y seguridad |
| Otras celdas de la rejilla del mismo autor | ~8,03 B | no disponible | Llama 3 Community | Distintas reglas de selección y presupuestos; no se detallan métricas en la información disponible |
| SVD-LLM Llama-3-8B comprimido al 50 % (referencia metodológica) | ~4 B efectivos | 8.192 | Llama 3 Community | Presupuesto de rango del que se hereda; sin métricas publicadas aquí |

## Limitaciones y advertencias

- Artefacto de investigación: el propio autor indica que no es un modelo conversacional de propósito general y que debe tratarse como sujeto experimental.
- Varias celdas de la rejilla están deliberadamente degradadas en seguridad; la compresión por sí sola eleva la tasa de éxito de ataques, y esta celda debe evaluarse antes de extraer conclusiones.
- Riesgo de alucinación no cuantificado; la compresión al 50 % y la recuperación con LoRA sobre alpaca-cleaned pueden introducir degradaciones adicionales no medidas.
- Idiomas soportados no documentados; no se garantiza el comportamiento multilingüe del base.
- Restricciones de licencia: Meta Llama 3 Community License, con `LICENSE` y `USE_POLICY.md` incluidos en el repositorio; el uso comercial está sujeto a los términos de Meta, incluida la cláusula de nomenclatura para derivados.
- Sin descargas ni likes en el momento de la consulta, lo que limita la validación comunitaria.
- No se publican pesos GGUF ni cuantizaciones listas para usar; el despliegue en llama.cpp u Ollama requiere conversión propia.
- El contexto máximo efectivo tras la compresión no está verificado experimentalmente en la información disponible.
