# Jeesup/svd-safety-l3_dualk_mix_trace_r50

## Resumen

`svd-safety-l3_dualk_mix_trace_r50` es un checkpoint de investigación derivado de `meta-llama/Meta-Llama-3-8B-Instruct`, publicado por el usuario Jeesup en Hugging Face. No es un modelo entrenado desde cero ni un ajuste fino convencional: es el resultado de aplicar una compresión SVD (descomposición en valores singulares) con criterio de curvatura dual —utilidad y seguridad— sobre los pesos de Llama-3-8B-Instruct, eliminando exactamente el 50,00% de los parámetros densos y recuperando parte de la capacidad con un LoRA de segunda etapa según la metodología SVD-LLM.

El interés del artefacto es metodológico. El autor lo presenta explícitamente como una celda de una malla experimental sobre reglas de selección de componentes y presupuestos de rango, cuyo objetivo es medir cómo la compresión SVD degrada el comportamiento de seguridad y qué regla de selección repara mejor ese daño. El checkpoint conserva la arquitectura transformer decoder-only de Llama-3-8B (8.030.261.248 parámetros reales según safetensors, prácticamente idénticos al original porque la compresión SVD reduce rango pero no elimina tensores) y el tokenizador original, con una ventana de contexto de 8.192 tokens heredada del modelo base.

Es relevante ahora porque conecta dos líneas de trabajo activas: la compresión de modelos para reducir coste de despliegue y el análisis de robustez de seguridad bajo transformaciones de pesos. Los datos medidos que reporta el autor (ASR de 0,0135 en AdvBench y 0,0415 en StrongREJECT con juez HarmBench, sobre-rechazo macro de 0,3928 con WildGuard y perplejidad de 20,0526 en WikiText-2) permiten cuantificar ese compromiso, aunque el propio autor advierte que varias ramas de la malla están deliberadamente degradadas en seguridad y que esta celda no debe tratarse como un asistente desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), pesos comprimidos mediante SVD con presupuesto de rango SVD-LLM y recuperación LoRA de etapa 2 |
| Parametros totales | 8.030.261.248 (fracción de parámetros resultante 0,4997 según el autor) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens (heredada de Llama-3-8B-Instruct; no se especifica en la model card) |
| Tipos de cuantizacion | No disponible (el autor solo menciona entrenamiento en bf16; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible en la model card; se hereda el multilingüismo del modelo base Llama-3 |
| Licencia | Meta Llama 3 Community License (se incluyen `LICENSE` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (librería transformers); tamaño del repositorio 16,1 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-3-8B-Instruct: un transformer decoder-only con atención por cabezas agrupadas (GQA), RoPE y normalización RMSNorm, entrenado originalmente por Meta con alineamiento por instrucciones. Sobre ese checkpoint, el autor aplica una compresión SVD en dos dominios de curvatura: una matriz de Fisher aproximada por K-FAC para utilidad (`G_u`, `A_u`) calibrada con wikitext-2-raw-v1 train (muestreo SVD-LLM, 255 ventanas de 2.048 tokens, semilla 42, entropía cruzada de siguiente token) y otra para seguridad (`G_s`, `A_s`) calibrada con 512 muestras de `results/dual_kfac_wj/wj_safe_l3.jsonl` (pérdida sobre tokens de respuesta). El solver es `mix`: SVD blanqueada en forma cerrada sobre la Fisher mixta `F_mix = [(1-a) G_u + a G_s] ⊗ [(1-a) A_u + a A_s]` con peso de seguridad `a = 0,1238` (`--alpha tok`).

La normalización de curvatura es `trace`: cada factor se divide por su traza y por el número de posiciones (atención) o de tokens de pérdida (gradiente), por dominio. El presupuesto de rango por matriz es el que SVD-LLM asigna a la misma ratio de eliminación (50,00% de parámetros eliminados). Tras la compresión, se aplica la recuperación de etapa 2 de SVD-LLM con LoRA secuencial sobre U y luego V (r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256, bf16) usando alpaca-cleaned. No se documenta RLHF ni DPO adicional; la alineación de seguridad procede del modelo base y de la calibración de curvatura, no de un entrenamiento de preferencias nuevo.

## Capacidades

- Generación de texto conversacional en formato instruct, heredada de Llama-3-8B-Instruct (plantilla de chat de Llama 3).
- Razonamiento y respuesta a instrucciones de propósito general, con calidad degradada respecto al modelo denso original por la compresión al 50% y la recuperación parcial vía LoRA.
- Generación de código y matemáticas básicas, sin garantías de rendimiento: no se publican evaluaciones específicas de HumanEval, GSM8K ni similares.
- Capacidades multilingües heredadas del modelo base, sin lista de idiomas confirmada en la model card.
- Soporte de tool calling y function calling: no documentado explícitamente para este checkpoint; el modelo base lo soporta, pero la compresión puede afectar al formato.
- Uso como sujeto experimental para estudiar robustez de seguridad bajo compresión: es su función principal declarada.
- No se documentan modos de pensamiento extendido, visión ni audio.

## Casos de uso

- Investigación sobre compresión y seguridad: usar el checkpoint como una celda de la malla para medir la tasa de éxito de ataques (ASR) frente al modelo denso y frente a otras reglas de selección de componentes, replicando la evaluación con HarmBench.
- Estudio de sobre-rechazo: evaluar con WildGuard el sobre-rechazo macro (0,3928 reportado) y compararlo con variantes de la malla para aislar el efecto de la regla de selección SVD sobre la utilidad conversacional.
- Análisis de perplejidad como proxy de calidad: medir WikiText-2 (20,0526 reportado) para cuantificar la pérdida de modelado del lenguaje tras eliminar el 50% de parámetros y aplicar la recuperación LoRA.
- Reproducibilidad metodológica: reutilizar la receta (calibración dual K-FAC, normalización por traza, presupuesto de rango SVD-LLM, LoRA secuencial U/V) sobre otros checkpoints para validar el pipeline en distintos modelos base.
- Docencia y divulgación: ilustrar en un curso de interpretabilidad o eficiencia cómo la curvatura de Fisher ponderada por dominio sesga la selección de direcciones singulares y cómo eso afecta a comportamientos concretos.
- Evaluación de pipelines de seguridad en producción: servir el modelo con transformers o TGI en un entorno aislado para probar clasificadores y filtros de salida frente a un modelo comprimido con ASR conocido, sin exponerlo a usuarios finales.

## Benchmarks y rendimiento

| Metrica | Valor reportado |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0135 |
| StrongREJECT ASR (juez HarmBench) | 0,0415 |
| Sobre-rechazo macro (WildGuard) | 0,3928 |
| Perplejidad WikiText-2 | 20,0526 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ni comparaciones numéricas con el modelo denso original o con otras celdas de la malla.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 16 GB solo para pesos, más activaciones y caché KV; en la práctica se necesitan 18-20 GB para inferencia con contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB de pesos; en 4 bits, alrededor de 4,5-5 GB, aunque no se publican variantes cuantizadas oficiales y habría que generarlas.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para servicio en bf16; RTX 4090 (24 GB) y RTX 3090 (24 GB) caben en bf16 con contexto limitado; GPUs de 16 GB (RTX 4080, A4000) requieren cuantización.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en bf16 y en GPUs de 12-16 GB con cuantización de 8 o 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y previsiblemente vLLM y llama.cpp/Ollama tras convertir los pesos, aunque no se documenta soporte explícito.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `Jeesup/svd-safety-l3_dualk_mix_trace_r50` | 8.030.261.248 (50% de rango eliminado) | 8.192 | Llama 3 Community | Artefacto de investigación con ASR medido; no desplegable como asistente |
| `meta-llama/Meta-Llama-3-8B-Instruct` | 8.030.261.248 | 8.192 | Llama 3 Community | Modelo denso original, sin compresión; referencia de utilidad y seguridad |
| Variantes SVD-LLM de Llama-3-8B | Aprox. 4.000 millones efectivos según ratio | 8.192 | Llama 3 Community | Compresión SVD sin curvatura de seguridad; referencia metodológica |
| `meta-llama/Meta-Llama-3-8B` (base) | 8.030.261.248 | 8.192 | Llama 3 Community | Sin alineamiento instruct; no comparable en seguridad conversacional |

No se dispone de datos de benchmarks comparativos entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El autor declara explícitamente que varias ramas de la malla están deliberadamente degradadas en seguridad y que este checkpoint no es un modelo de chat de propósito general.
- La compresión por sí sola eleva la tasa de éxito de ataques; el ASR reportado (0,0135 en AdvBench) es una medición puntual con juez HarmBench y no garantiza robustez frente a otros ataques o plantillas.
- El sobre-rechazo macro de 0,3928 indica una tasa apreciable de rechazos indebidos, con impacto directo en utilidad conversacional.
- La perplejidad de WikiText-2 (20,0526) es notablemente superior a la de un Llama-3-8B denso típico, lo que refleja pérdida de calidad en modelado del lenguaje.
- Riesgo de alucinación heredado del modelo base y potencialmente amplificado por la compresión y la recuperación LoRA parcial.
- Idiomas soportados no confirmados en la model card; el comportamiento multilingüe puede diferir del modelo base.
- Licencia Meta Llama 3 Community: uso comercial permitido con condiciones (política de uso aceptable, atribución "Built with Meta Llama 3", umbral de 700 millones de usuarios mensuales para licencia separada); revisar `LICENSE` y `USE_POLICY.md` antes de cualquier despliegue.
- No apto para producción sin evaluación propia: el autor recomienda evaluar el checkpoint antes de extraer conclusiones.
- Sin datos de cuantización oficial ni de latencia/throughput; cualquier despliegue eficiente requiere trabajo adicional de conversión y validación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l3_dualk_mix_trace_r50
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia Meta Llama 3: https://llama.meta.com/llama3/license
- Política de uso aceptable de Llama 3: https://llama.meta.com/llama3/use-policy
- Repositorio SVD-LLM (metodología de compresión y recuperación LoRA): no disponible en la información proporcionada
- Paper de SVD-LLM: no disponible en la información proporcionada
- HarmBench (juez de evaluación de seguridad): no disponible en la información proporcionada
- WildGuard (evaluación de sobre-rechazo): no disponible en la información proporcionada
- StrongREJECT (benchmark de jailbreak): no disponible en la información proporcionada
