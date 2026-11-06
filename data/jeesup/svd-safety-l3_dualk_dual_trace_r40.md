# Jeesup/svd-safety-l3_dualk_dual_trace_r40

## Resumen

svd-safety-l3_dualk_dual_trace_r40 es un checkpoint derivado de meta-llama/Meta-Llama-3-8B-Instruct comprimido mediante SVD blanqueado con K-FAC de doble dominio (curvatura de utilidad y de seguridad), desarrollado por el usuario Jeesup. El modelo conserva el 59,98 % de los parámetros densos del original (40 % eliminados) y se recupera después con la etapa 2 de LoRA de SVD-LLM, entrenada sobre alpaca-cleaned. No es un modelo de chat de propósito general, sino un artefacto de investigación sobre cómo la compresión SVD degrada el comportamiento de seguridad y qué regla de selección de componentes lo repara mejor.

El checkpoint forma parte de una cuadrícula experimental sobre reglas de selección y presupuestos de compresión. Su interés técnico reside en la metodología: combina información de curvatura de dos dominios (utilidad medida en wikitext-2 y seguridad medida sobre un conjunto de calibración propio) con un presupuesto de rango por matriz heredado de SVD-LLM, y resuelve el óptimo de bajo rango con ALS sobre una base conjunta.

Con 8.030.261.248 parámetros reales en safetensors y un repositorio de 16,1 GB, el modelo mantiene la arquitectura Llama 3 de 8B y la licencia Llama 3 Community. Su relevancia es metodológica: cuantifica el compromiso entre tasa de éxito de ataques y tasa de sobrerrechazo bajo compresión, un aspecto poco explorado en la literatura de compresión de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), comprimido mediante SVD de bajo rango |
| Parametros totales | 8.030.261.248 (59,98 % del denso original; 40 % eliminados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (modelo base Llama 3 8B Instruct: 8.192 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; sin GGUF en el repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Llama 3 Community License (incluye LICENSE y USE_POLICY.md en el repositorio) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura de partida es un transformer decoder-only Llama 3 de 8B parámetros. La compresión aplica SVD blanqueado con K-FAC de doble dominio: se estiman matrices de curvatura para utilidad (G_u, A_u) y para seguridad (G_s, A_s), se combinan con un peso de seguridad a = 0,1238 y se resuelve el óptimo de bajo rango de F_dual = (1-a)·G_u ⊗ A_u + a·G_s ⊗ A_s mediante ALS sobre base conjunta, partiendo de la solución mixta. La normalización de curvatura es por traza: A dividida por posiciones y G por tokens de pérdida, por dominio, y después cada factor se divide por su traza. El presupuesto de rango por matriz replica el de SVD-LLM para el mismo ratio de eliminación. La calibración de utilidad usa wikitext-2-raw-v1 con el muestreador de SVD-LLM (255 ventanas de 2.048 tokens, semilla 42, entropía cruzada de siguiente token); la de seguridad usa 512 muestras de `results/dual_kfac_wj/wj_safe_l3.jsonl` con pérdida sobre tokens de respuesta. El ALS se ejecuta hasta 300 barridos con rtol 1e-07 y ridge 1e-06.

Tras la compresión se aplica la recuperación de etapa 2 de SVD-LLM: LoRA secuencial sobre U y luego sobre V, con r=8, alpha=16, 2 épocas, learning rate 1e-4, batch 64, cutoff 256 y precisión bf16, entrenado sobre alpaca-cleaned. La semilla global es 42.

## Capacidades

- Generación de texto conversacional heredada del modelo base Llama-3-8B-Instruct, sujeta a la degradación introducida por la compresión.
- Razonamiento y respuesta a instrucciones en formato chat de Llama 3 (no verificado de forma independiente en la información disponible).
- Capacidad de rechazo de peticiones dañinas, medida con AdvBench y StrongREJECT mediante el juez HarmBench.
- Soporte de tool calling y function calling: no disponible en la información proporcionada para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible (el modelo base no los incluye).

## Casos de uso

- Investigación sobre compresión y seguridad: usar el checkpoint como celda de una cuadrícula para medir cómo varía la tasa de éxito de ataques (ASR) al cambiar la regla de selección de componentes o el presupuesto de rango. Es su uso previsto declarado.
- Evaluación de reglas de selección SVD: comparar esta variante (doble dominio con normalización por traza, a = 0,1238) frente a otras celdas del mismo estudio para determinar qué criterio preserva mejor la seguridad.
- Estudio del sobrerrechazo: emplear la métrica Macro over-refusal sobre WildGuard (0,3437) para analizar el coste en utilidad conversacional que impone la recuperación orientada a seguridad.
- Análisis de compromiso utilidad-seguridad: relacionar la perplejidad en WikiText-2 (16,9729) con las tasas de ataque para trazar la frontera de Pareto de la compresión.
- Reproducción de pipelines de compresión: servir como referencia para validar implementaciones de SVD-LLM con K-FAC de doble dominio y ALS sobre base conjunta.
- Base para experimentos de recuperación: punto de partida para probar otras configuraciones de LoRA de etapa 2 (distinto rango, dataset o número de épocas) y medir su efecto sobre seguridad y perplejidad.
- Evaluación de robustez adversarial en entornos controlados: ejecutar suites tipo HarmBench sobre el checkpoint para estudiar la transferibilidad de ataques a modelos comprimidos.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0096 |
| StrongREJECT ASR (juez HarmBench) | 0,0256 |
| Macro over-refusal (WildGuard) | 0,3437 |
| Perplejidad WikiText-2 | 16,9729 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numéricas directas con el modelo base sin comprimir.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 18-20 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB de pesos; en 4 bits, alrededor de 4-5 GB (requiere cuantización propia, ya que el repositorio solo publica safetensors).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para bf16 sin cuantizar; RTX 4090 (24 GB) suficiente para bf16 con contexto limitado.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en bf16; en GPUs de 8-12 GB requiere cuantización a 8 o 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp u Ollama requerirían conversión a GGUF no incluida en el repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l3_dualk_dual_trace_r40 | 8,03 B (59,98 % del denso) | no disponible | Llama 3 Community | Checkpoint de investigación comprimido; ASR AdvBench 0,0096, perplejidad WikiText-2 16,9729 |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03 B | 8.192 tokens | Llama 3 Community | Modelo base sin comprimir; referencia de utilidad y seguridad |
| SVD-LLM (checkpoints de referencia) | variable segun ratio | no disponible | segun modelo base | Método de compresión SVD con recuperación LoRA; base metodológica de este checkpoint |
| Otras celdas de la cuadrícula del autor | ~8 B | no disponible | Llama 3 Community | Variantes con distintas reglas de selección y presupuestos; algunas deliberadamente degradadas en seguridad |

No se dispone de datos numéricos de benchmarks de los modelos comparables en la información proporcionada, salvo las métricas del propio checkpoint.

## Limitaciones y advertencias

- Artefacto de investigación: el autor indica explícitamente que no es un modelo de chat de propósito general y que debe tratarse como sujeto experimental, no como asistente desplegable.
- Seguridad degradada por diseño en varias celdas de la cuadrícula: la compresión por sí sola eleva la tasa de éxito de ataques; este checkpoint concreto reporta ASR bajo, pero su comportamiento debe validarse de forma independiente.
- Sobrerrechazo elevado: Macro over-refusal de 0,3437 sobre WildGuard, lo que implica rechazos indebidos en conversaciones legítimas.
- Perplejidad superior al modelo denso: 16,9729 en WikiText-2, indicativo de pérdida de calidad respecto al base sin comprimir.
- Riesgo de alucinación: no cuantificado en la información disponible; previsiblemente superior al del modelo base por la compresión.
- Idiomas soportados no documentados; no se garantiza cobertura multilingüe.
- Restricciones de licencia: Llama 3 Community License con USE_POLICY.md; el uso comercial está sujeto a los términos de Meta, incluidos requisitos de atribución y límites de usuarios mensuales.
- Sin cuantizaciones publicadas (GGUF, AWQ, GPTQ): el despliegue eficiente requiere generarlas.
- Procedencia de los datos de calibración de seguridad: el conjunto `wj_safe_l3.jsonl` es interno del autor y no se detalla su composición, lo que limita la reproducibilidad exacta.
- Fecha de creación declarada en el repositorio (2026-11-06) y ausencia de descargas o likes: sin validación comunitaria ni reportes independientes.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_dualk_dual_trace_r40
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia Llama 3: https://llama.meta.com/llama3/license/
- Política de uso de Llama 3: https://llama.meta.com/llama3/use-policy/
- SVD-LLM (método de compresión y recuperación LoRA): no se proporciona enlace en la información disponible
- Paper de SVD-LLM: no disponible en la información proporcionada
- Repositorio de código del autor: no disponible en la información proporcionada
- Demo o espacio asociado: no disponible en la información proporcionada
