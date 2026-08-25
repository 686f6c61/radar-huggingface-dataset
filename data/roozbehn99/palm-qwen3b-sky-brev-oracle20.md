# roozbehn99/palm-qwen3b-sky-brev-oracle20

## Resumen

El repositorio `roozbehn99/palm-qwen3b-sky-brev-oracle20` contiene un conjunto de 20 modelos de lenguaje, cada uno un fine-tuning completo de `Qwen/Qwen2.5-3B-Instruct` mediante GRPO (Group Relative Policy Optimization). Los modelos se entrenan con una función de recompensa escalarizada que combina dos objetivos: utilidad (medida por un reward model Skywork-Reward-Llama-3.1-8B) y brevedad (una recompensa verificable que penaliza respuestas largas). Los pesos de cada objetivo se muestrean de forma i.i.d. de una distribución Dirichlet(1,1) sobre el símplex de 2 dimensiones, generando así 20 políticas distintas que cubren densamente el espacio de pesos.

Este repositorio actúa como un "oráculo independiente" para la evaluación del método PALM (Portfolio Alignment of Language Models). El oráculo calcula, para cada vector de pesos, el mejor valor de la función objetivo entre los 20 modelos. Los repositorios hermanos (`palm-qwen3b-sky-brev-seed1` a `seed5`) contienen los portafolios producidos por el algoritmo PALM y se evalúan contra este oráculo. Es un artefacto de investigación puro, no pensado para despliegue en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-3B-Instruct) |
| Parámetros totales | 3B por modelo (20 modelos en total) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-3B-Instruct soporta 32K, no confirmado en la ficha) |
| Tipos de cuantización | No disponible (los pesos se almacenan en bf16) |
| Idiomas soportados | No disponibles (el modelo base es multilingüe, pero no se especifica) |
| Licencia | Apache-2.0 |
| Formato de pesos | Transformers (bf16), un subfolder por modelo (`idx0` a `idx19`) |

## Arquitectura y entrenamiento

Cada uno de los 20 modelos es un fine-tuning completo del Qwen2.5-3B-Instruct, entrenado con GRPO. La recompensa total es `r = w1*R1 + w2*R2 - β*KL`, donde `R1` es la recompensa de helpfulness (normalizada min-max a [0,1]) del modelo Skywork-Reward-Llama-3.1-8B, `R2` es la recompensa de brevedad (también normalizada), y `β=0.01` es el coeficiente de divergencia KL respecto a la política de referencia. Los pesos `w1` y `w2` se muestrean i.i.d. de Dirichlet(1,1) con semilla 42. El entrenamiento se realizó sobre los datasets `allenai/RLVR-GSM` y `allenai/RLVR-MATH` (entrenamiento) y `allenai/RLVR-GSM` test para evaluación. Se usaron 40,000 episodios (208 pasos de optimización), una tasa de aprendizaje de 5e-7, batch de 4 con gradiente acumulado 4 y 4 muestras por prompt, con una longitud máxima de respuesta de 256 tokens. El hardware fue 4× NVIDIA A100-80GB o 4× H100, con precisión bf16. Cada modelo se almacena en una subcarpeta independiente.

## Capacidades

- Generación de texto y razonamiento matemático: entrenado sobre RLVR-GSM y RLVR-MATH, resuelve problemas de matemáticas y razonamiento simbólico.
- Control de dos objetivos alineables: cada modelo tiene una configuración específica de pesos `w_help` y `w_brev`, lo que permite ajustar la balanza entre utilidad (respuestas detalladas y correctas) y brevedad (respuestas concisas).
- Uso como oráculo en experimentos de alineación multi-objetivo: permite calcular el mejor valor de la función objetivo para un peso dado.
- Compatible con el ecosistema Hugging Face Transformers: carga directa con `AutoModelForCausalLM` y `AutoTokenizer`.
- Sin capacidades de tool calling, visión, audio ni agentes: es un modelo de lenguaje puro.

## Casos de uso

- **Investigación en alineación multi-objetivo**: usar los 20 modelos como referencia para comparar el rendimiento de portafolios generados con algoritmos como PALM, evaluando la aproximación al óptimo.
- **Estudio de curvas de Pareto**: analizar cómo varía la calidad de las respuestas (medida por R1) frente a la brevedad (R2) en función de los pesos, permitiendo trazar la frontera Pareto.
- **Calibración de reward models**: verificar si la recompensa de helpfulness está bien calibrada en el dominio RLVR-GSM y RLVR-MATH.
- **Evaluación de generalización**: medir si los modelos mantienen su rendimiento en el conjunto de test de RLVR-GSM (1,319 prompts) con muestreo a temperatura 0.7.
- **Estudio de divergencia KL**: comparar cuánto se aleja cada modelo de la política base en función del peso de brevedad, útil para entender el trade-off entre alineación y distancia de referencia.
- **Experimentos de selección de pesos**: dado un escenario que requiere un equilibrio específico entre utilidad y brevedad, usar estos modelos para identificar el peso óptimo.

## Benchmarks y rendimiento

La model card no proporciona resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). En su lugar, publica evaluaciones de recompensa normalizada y divergencia KL para cada modelo sobre el conjunto de test RLVR-GSM (1,319 prompts, muestreo T=0.7, 256 tokens máximos). Los datos son los siguientes:

| subfolder | w_help | w_brev | R1 (help) | R2 (brev) | KL |
|---|---|---|---|---|---|
| idx0 | 0.507 | 0.493 | 0.813 | 0.366 | 2.98 |
| idx1 | 0.895 | 0.105 | 0.821 | 0.202 | 0.71 |
| idx2 | 0.056 | 0.944 | 0.712 | 0.426 | 5.26 |
| idx3 | 0.311 | 0.689 | 0.772 | 0.397 | 3.82 |
| idx4 | 0.070 | 0.930 | 0.708 | 0.435 | 5.58 |
| idx5 | 0.061 | 0.939 | 0.712 | 0.439 | 5.90 |
| idx6 | 0.817 | 0.183 | 0.825 | 0.216 | 0.84 |
| idx7 | 0.889 | 0.111 | 0.807 | 0.203 | 0.69 |
| idx8 | 0.225 | 0.775 | 0.742 | 0.410 | 4.23 |
| idx9 | 0.686 | 0.314 | 0.814 | 0.295 | 1.42 |
| idx10 | 0.848 | 0.152 | 0.840 | 0.211 | 0.84 |
| idx11 | 0.600 | 0.400 | 0.802 | 0.342 | 2.28 |
| idx12 | 0.611 | 0.389 | 0.843 | 0.340 | 2.14 |
| idx13 | 0.855 | 0.145 | 0.836 | 0.212 | 0.83 |
| idx14 | 0.208 | 0.792 | 0.735 | 0.417 | 4.50 |
| idx15 | 0.235 | 0.765 | 0.729 | 0.412 | 4.71 |
| idx16 | 0.749 | 0.251 | 0.833 | 0.241 | 0.91 |
| idx17 | 0.418 | 0.582 | 0.787 | 0.376 | 2.98 |
| idx18 | 0.516 | 0.484 | 0.817 | 0.364 | 2.72 |
| idx19 | 0.747 | 0.253 | 0.831 | 0.242 | 0.96 |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- Cada modelo individual (3B parámetros en bf16) ocupa aproximadamente 6-7 GB de memoria (123.5 GB / 20 ≈ 6.2 GB). El repositorio completo ocupa 123.5 GB.
- Para inferencia de un solo modelo se puede usar una GPU consumer con al menos 8 GB de VRAM (ej. RTX 3060, RTX 4060) o 12 GB (RTX 4070, RTX 4080).
- Para ejecutar los 20 modelos de forma simultánea se necesitaría una GPU con más de 120 GB (no típico) o un clúster multi-GPU.
- Se recomienda usar `transformers` para cargar cada modelo por separado, o `vLLM` para servir con mayor throughput, aunque no se proporcionan configuraciones específicas.
- En el entrenamiento se usaron 4× A100-80GB o 4× H100, pero para inferencia basta con una GPU de gama media.
- No se ofrecen datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos de la misma categoría en la información proporcionada. Sin embargo, se puede comparar conceptualmente con el modelo base `Qwen/Qwen2.5-3B-Instruct` y con otros LLMs de 3B como `Llama-3.2-3B` o `Phi-3-mini`. Este repositorio no está diseñado para tareas generales, sino como un conjunto de políticas de alineación multi-objetivo, por lo que una comparativa de rendimiento en benchmarks estándar no sería relevante.

## Limitaciones y advertencias

- Artefacto de investigación: no está pensado para despliegue en producción ni para uso general; no se realizó un ajuste de seguridad adicional más allá del modelo base.
- Riesgo de sesgos heredados: al derivar de Qwen2.5-3B-Instruct, puede heredar sesgos de género, raza o idioma del modelo base.
- Alucinación: el entrenamiento en RLVR-GSM y RLVR-MATH puede inducir respuestas incorrectas en dominios fuera de esos conjuntos.
- Dependencia de la recompensa de brevedad: los modelos con pesos altos en `w_brev` tienden a generar respuestas muy cortas que pueden ser incompletas o insuficientes para tareas complejas.
- Restricción de contexto: la longitud de respuesta se limitó a 256 tokens durante el entrenamiento, lo que puede afectar a tareas que requieran respuestas más largas.
- No se proporcionan cuantizaciones ni formatos GGUF; los pesos están en bf16, lo que limita su uso en entornos con poca memoria.
- El repositorio es de solo investigación: no hay garantías de soporte ni mantenimiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/roozbehn99/palm-qwen3b-sky-brev-oracle20
- Repositorio hermano (seed1): https://huggingface.co/roozbehn99/palm-qwen3b-sky-brev-seed1
- Repositorio hermano (seed2): https://huggingface.co/roozbehn99/palm-qwen3b-sky-brev-seed2
- Blog de Qwen (contexto del modelo base): https://qwen.ai/blog?id=qwen3
- Guía de Qwen3 (referencia general): https://insiderllm.com/guides/qwen3-complete-guide/
