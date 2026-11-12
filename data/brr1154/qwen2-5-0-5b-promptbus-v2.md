# BRR1154/Qwen2.5-0.5B-PromptBus-v2

## Resumen

Qwen2.5-0.5B-PromptBus-v2 es un ajuste fino (fine-tune) del modelo Qwen2.5-0.5B-Instruct, desarrollado por Bhavanam Rajendra Reddy (usuario BRR1154, proyecto Runtime-Slayers) y publicado en Hugging Face. El modelo se presenta como un "enrutador de prompt bus y arbitraje para sistemas multiagente basados en DAG": es decir, está especializado en tareas de orquestación de agentes, enrutamiento de subtareas dentro de un grafo acíclico dirigido (DAG) y calibración de abstención. No es un modelo de propósito general, sino un componente especializado dentro de una arquitectura de agentes.

Arquitectónicamente hereda la estructura transformer decoder-only de Qwen2.5, con 494.032.768 parámetros totales (dato real de los pesos safetensors) y un contexto de 32.768 tokens propio de la familia Qwen2.5-0.5B. La innovación declarada por el autor es una técnica de consolidación en "null-space" mediante SVD sobre la covarianza de activaciones, aplicada tras el entrenamiento LoRA (rank=16) sobre las capas 10-23, con el objetivo de preservar el conocimiento general del modelo base mientras se inyecta la capacidad de arbitraje.

Su relevancia radica en la tendencia hacia modelos pequeños especializados (SLM) que actúan como orquestadores dentro de pipelines multiagente, donde un modelo de 0,5B puede enrutar y validar tareas a un coste computacional mínimo. No obstante, los resultados publicados son modestos y los benchmarks son internos del autor, no verificados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), con atención causal estándar |
| Parametros totales | 494.032.768 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredado de Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | No disponible en la información proporcionada (pesos en BF16; compatible con cuantización estándar de transformers/GGUF no confirmada) |
| Idiomas soportados | Inglés (`en`) según la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,0 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct (494M parámetros, BF16) y de un checkpoint intermedio, PromptBus-v1. Sobre esa base se aplicó un ajuste fino con LoRALinear real (rank=16) durante 40 pasos de gradiente, con una consolidación posterior en el subespacio nulo empírico (k=24) calculado mediante SVD sobre la covarianza de activaciones. La cirugía de pesos se aplicó a las proyecciones `q_proj`, `v_proj`, `o_proj` y `down_proj` de las capas 10-23, con 56/56 módulos mutados verificados por sha256. El desplazamiento máximo de la norma de Frobenius fue del 1,624% y el error de ortogonalidad en el subespacio nulo de 2,699e-09.

El entrenamiento combinó backpropagation LoRA con una calibración de abstención basada en "wake-error" (el modelo aprende a emitir `ABSTAIN` cuando no puede resolver una tarea). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO. La innovación técnica destacable es la consolidación en null-space, diseñada para minimizar la degradación del conocimiento general del modelo base al inyectar la nueva habilidad de enrutamiento.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredados de Qwen2.5-0.5B-Instruct.
- Enrutamiento de prompts y arbitraje de tareas dentro de un DAG multiagente (capacidad principal del fine-tune).
- Emisión de decisiones de abstención (`ABSTAIN`) calibradas ante tareas fuera de su dominio.
- Ejecución de tareas de dominio especializadas con verificación empírica: consultas SQLite, resolución con Z3, parsing HTML con lxml/HTMLParser y ejecución de subprocesos Python.
- Soporte de chat template de Qwen2.5 (`apply_chat_template`) y generación determinista (`do_sample=False`).
- Capacidades multilingües limitadas: la model card declara únicamente inglés.
- No se documenta soporte explícito de tool calling/function calling nativo, visión, audio ni modo thinking.

## Casos de uso

- Orquestación de agentes en pipelines DAG: el modelo puede actuar como router que decide qué subagente o herramienta ejecuta cada nodo del grafo, aprovechando su entrenamiento específico en arbitraje DAG.
- Validación y abstención en producción: gracias a la calibración de `ABSTAIN`, puede usarse como guardián que rechace tareas fuera de dominio antes de derivarlas a un modelo mayor, reduciendo costes.
- Enrutamiento de bajo coste en sistemas multiagente: con 494M parámetros puede desplegarse en CPU o GPU modesta para clasificar y dirigir peticiones hacia modelos especializados más grandes.
- Automatización de tareas de datos estructurados: generación de consultas SQLite y su verificación mediante ejecución real, útil en pipelines de ETL o agentes de análisis.
- Parsing y extracción de HTML: tareas de scraping estructurado donde el modelo genera selectores o código de extracción verificable con lxml.
- Resolución simbólica asistida: generación de restricciones o problemas para Z3 en flujos de verificación formal o scheduling.
- Ejecución de código Python en sandbox: generación de scripts cortos para subprocess en entornos controlados de automatización.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados externamente):

| Benchmark | v1 (base) | v2 (este modelo) | Delta |
|---|---|---|---|
| DAG-Arbitration-16 (Domain Execution / Solver Accuracy) | 12,50% | 25,00% | +12,50 pts |
| ARC-Easy-25 Retention (Raw) | 68,0% | 80,0% | +12,0 pts |
| ARC-Easy-25 Retention (PMI-Calibrated) | 76,0% | 76,0% | 0,0 pts |
| AA-Omniscience-12 Calibration Index | -33,33 | -8,33 | +25,00 pts |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1 GB para los pesos, más overhead de activaciones y KV cache; viable en GPUs de 4-8 GB.
- En cuantización de 8 bits: alrededor de 0,5 GB de pesos; en 4 bits: aproximadamente 0,3 GB (estimaciones según tamaño, no confirmadas en la model card).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) e incluso iGPU o CPU para despliegues de baja latencia no crítica.
- Cabe holgadamente en GPUs consumer, incluidas las de gama baja, y en entornos CPU.
- Opciones de despliegue: transformers (soporte oficial), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; llama.cpp/Ollama/vLLM no están confirmados explícitamente en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen2.5-0.5B-PromptBus-v2 | 494M | 32.768 | Apache 2.0 | Enrutamiento DAG multiagente |
| Qwen2.5-0.5B-Instruct | 494M | 32.768 | Apache 2.0 | Instrucciones generales |
| SmolLM2-360M-Instruct | 360M | 8.192 | Apache 2.0 | Instrucciones generales |
| Llama-3.2-1B-Instruct | 1.230M | 131.072 | Llama 3.2 Community | Instrucciones generales |

La comparación con alternativas de propósito general es limitada porque PromptBus-v2 está especializado en orquestación; los benchmarks internos no son directamente comparables con MMLU o HumanEval de los modelos citados. No se dispone de datos de rendimiento cruzado en la información proporcionada.

## Limitaciones y advertencias

- Los benchmarks son internos del autor, marcados como `verified: false`; no han sido replicados por terceros.
- La precisión en la tarea principal (DAG-Arbitration-16) es del 25%, lo que implica que falla en tres de cada cuatro tareas de dominio; no es apto como solver autónomo.
- El modelo solo declara soporte de inglés; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- Riesgo de alucinación inherente a un modelo de 0,5B, agravado por su uso como enrutador donde una decisión errónea propaga fallos al resto del pipeline.
- La model card no documenta sesgos conocidos ni evaluaciones de seguridad.
- Aunque la licencia es Apache 2.0 (permite uso comercial), el modelo base Qwen2.5 también es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- El repositorio tiene 0 descargas y 0 likes; es un experimento de investigación sin validación comunitaria.
- No se documentan tasas de error en tool calling ni comportamiento en conversaciones multi-turno largas.
- La técnica de null-space consolidation está descrita por el autor pero no ha sido revisada por pares.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BRR1154/Qwen2.5-0.5B-PromptBus-v2
- Checkpoint base v1: https://huggingface.co/BRR1154/Qwen2.5-0.5B-PromptBus-v1
- Modelo base original: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- ORCID del autor: https://orcid.org/0009-0005-3349-1162
