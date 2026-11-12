# BRR1154/SLM-LiteratureSurvey-v2

## Resumen

SLM-LiteratureSurvey-v2 es un modelo de lenguaje especializado en la verificación de citas científicas y el rechazo de identificadores DOI falsos. Lo desarrolla Bhavanam Rajendra Reddy (Runtime-Slayers) y parte de Qwen/Qwen2.5-0.5B-Instruct, un transformer decoder-only de 494 millones de parámetros (494.032.768 exactos según los pesos safetensors). El modelo se distribuye con licencia Apache 2.0 y está pensado exclusivamente para inglés.

El problema que aborda es concreto: los asistentes de revisión bibliográfica tienden a inventar referencias, DOIs y metadatos plausibles pero inexistentes. SLM-LiteratureSurvey-v2 se entrena para ejecutar tareas de dominio (búsqueda en arXiv/PubMed, comprobación de DOI, extracción estructurada) y, sobre todo, para abstenerse cuando no puede verificar un dato, mediante una calibración explícita de la señal `ABSTAIN`. La versión v2 se presenta como una consolidación de pesos sobre v1 usando LoRA con proyección en el subespacio nulo de las activaciones base.

La relevancia es doble: por un lado, demuestra una técnica de edición de pesos (null-space LoRA consolidation) aplicada a un modelo pequeño; por otro, ofrece un caso de estudio de especialización estrecha con métricas declaradas por el autor que muestran una mejora de 45,46 puntos en la suite de dominio respecto a v1, manteniendo la retención en ARC-Easy. No hay datos publicados sobre longitud de contexto nativa más allá de la heredada de Qwen2.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2, base Qwen2.5-0.5B-Instruct) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-0.5B-Instruct; no declarada en la model card) |
| Tipos de cuantizacion | no disponible (pesos en BF16; no se documentan GGUF ni otras) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Tamano del repo | 1.0 GB |
| Modelo base | Qwen/Qwen2.5-0.5B-Instruct, BRR1154/SLM-LiteratureSurvey-v1 |
| Metodo de entrenamiento | LoRA (rank=16) + calibracion ABSTAIN + consolidacion SVD en subespacio nulo |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2, heredado de Qwen2.5-0.5B-Instruct (494M parámetros, BF16). Sobre ese checkpoint se aplicó primero un ajuste fino con LoRA real (`LoRALinear` con retropropagación en PyTorch, rank=16) que dio lugar a la v1, y después una consolidación de pesos en v2 mediante cirugía en el subespacio nulo: se calcula la covarianza de activaciones del modelo base, se obtiene su SVD empírica (subespacio k=24) y se proyecta el delta de pesos fuera de ese subespacio con la fórmula ΔW_proj = ΔW − (ΔW V_base) V_base^T. La banda de capas intervenida es 10-23 sobre `q_proj`, `v_proj`, `o_proj` y `down_proj`, con 40 pasos de gradiente y 56/56 módulos verificados por sha256 antes y después del merge.

El entrenamiento incluye una fase de calibración de la señal `ABSTAIN` basada en el error de wake (wake-error), orientada a que el modelo rechace responder cuando no puede verificar una cita o un DOI. La model card no detalla el volumen de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO; solo describe las suites de evaluación (Scholar-DOI-14, FakeTrap-8, ARC-Easy-25, AA-Omniscience-12) y los verificadores de ejecución utilizados (sqlite3, z3, lxml.html, HTMLParser, subprocess Python, comprobador de DAG de Kahn). Las cifras de auditoría reportadas son: desplazamiento máximo de Frobenius del 1,607 % y error máximo de ortogonalidad al subespacio nulo de 2,678e-09.

## Capacidades

- Generación de texto conversacional en inglés con plantilla de chat (`apply_chat_template`).
- Verificación de citas científicas: comprobación de metadatos de artículos en arXiv y PubMed.
- Detección y rechazo de DOI falsos o inventados (suite FakeTrap-8).
- Abstención calibrada (`ABSTAIN`) cuando la verificación no es posible, en lugar de generar una referencia plausible.
- Ejecución de tareas de dominio con verificadores deterministas: consultas SQLite, validación con z3, parseo HTML con lxml/HTMLParser, ejecución de Python en subproceso y comprobación de DAG con el algoritmo de Kahn.
- Generación determinista y concisa con `do_sample=False` y `max_new_tokens` cortos (el quickstart usa 160).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking explícito.

## Casos de uso

- Verificación de bibliografía en pipelines de revisión sistemática: el modelo recibe una referencia y devuelve metadatos contrastados o una abstención, lo que permite filtrar citas inventadas antes de publicar un manuscrito. Es adecuado por su entrenamiento específico en Scholar-DOI-14 y FakeTrap-8.
- Detección de DOI falsos en gestores bibliográficos: integrado como validador previo a la importación en Zotero o Mendeley, rechaza identificadores que no resuelven a un registro real y evita contaminar la base de datos del investigador.
- Asistente de búsqueda en arXiv y PubMed: dado un tema, el modelo formula consultas y extrae resultados estructurados, apoyándose en su familiaridad con los esquemas de metadatos de ambos repositorios.
- Auditoría de referencias en informes técnicos o tesis: se ejecuta por lotes sobre la sección de bibliografía y marca entradas no verificables para revisión humana, reduciendo el coste de la revisión manual.
- Generación de resúmenes estructurados con trazabilidad: al estar calibrado para abstenerse, produce resúmenes que citan solo fuentes confirmadas, lo que lo hace apto para flujos donde la alucinación es inaceptable.
- Filtro de calidad en datasets científicos: puede clasificar pares (cita, metadatos) como válidos o inválidos durante la curación de corpus, usando su capacidad de ejecución de verificadores deterministas.
- Componente de bajo coste en un sistema mayor: con 494M parámetros y BF16, se puede desplegar en una sola GPU consumer para prefiltrar antes de llamar a un modelo mayor, reduciendo coste por consulta.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index y en la model card; no verificados de forma independiente (`verified: false`).

| Benchmark | v1 (baseline) | v2 | Delta |
|---|---|---|---|
| Scholar-DOI-14 + FakeTrap-8 (Domain Execution / Solver Accuracy) | 45,45 % | 90,91 % | +45,46 pts |
| ARC-Easy-25 Raw | 64,0 % | 64,0 % | 0,0 pts |
| ARC-Easy-25 PMI-Calibrated | 72,0 % | 72,0 % | 0,0 pts |
| AA-Omniscience-12 Calibration Index | -25,00 | -50,00 | -25,00 pts |

La mejora en la suite de dominio es sustancial, pero el índice de calibración AA-Omniscience empeora 25 puntos, lo que sugiere un posible exceso de abstención o una peor calibración de la confianza en dominios generales. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1 GB para pesos (494M parámetros × 2 bytes ≈ 0,99 GB) más overhead de activaciones y KV cache; en la práctica, entre 1,5 y 2,5 GB según longitud de secuencia y batch.
- VRAM estimada en FP32: en torno a 2 GB solo de pesos, más overhead.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas. En H100/A100 el modelo queda infrautilizado, pero permite batch grande.
- Cabe en GPU consumer: sí, en RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090 24 GB y en iGPU con memoria unificada suficiente.
- Opciones de despliegue: `transformers` (documentado en el quickstart con `dtype=torch.bfloat16` y `device_map="auto"`), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`). No se documentan pesos GGUF, por lo que llama.cpp y Ollama requerirían conversión previa no oficial.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| SLM-LiteratureSurvey-v2 | 494M | no disponible | Apache 2.0 | Verificación de citas y rechazo de DOI falsos | Hugging Face |
| Qwen2.5-0.5B-Instruct | 494M | 32.768 tokens (según ficha oficial de Qwen) | Apache 2.0 | Asistente generalista | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1.540M | 32.768 tokens (según ficha oficial de Qwen) | Apache 2.0 | Asistente generalista de mayor tamaño | Hugging Face |
| SmolLM2-360M-Instruct | 360M | 8.192 tokens (según ficha oficial de HuggingFace) | Apache 2.0 | Asistente generalista pequeño | Hugging Face |

La comparación directa con alternativas especializadas en verificación de citas no está disponible en la información proporcionada. Frente a los generalistas de su tamaño, SLM-LiteratureSurvey-v2 sacrifica cobertura general (de ahí la caída en AA-Omniscience) a cambio de precisión en su dominio.

## Limitaciones y advertencias

- Especialización muy estrecha: el modelo está entrenado para tareas de verificación de citas y ejecución de tareas de dominio; su rendimiento en conversación general es limitado y el índice AA-Omniscience empeora respecto a v1.
- Solo inglés: no se declara soporte multilingüe, por lo que su uso en castellano u otros idiomas no está validado.
- Riesgo de alucinación residual: aunque la calibración `ABSTAIN` reduce el riesgo, los benchmarks son declarados por el autor y no verificados de forma independiente; en producción conviene mantener un verificador externo de DOIs.
- Posible sobreabstención: la caída de 25 puntos en AA-Omniscience-12 sugiere que el modelo puede rechazar responder en casos donde sí podría hacerlo.
- Longitud de contexto no documentada: no se especifica en la model card; se hereda presumiblemente de Qwen2.5-0.5B-Instruct, pero no está confirmado.
- Ausencia de pesos GGUF: el despliegue en llama.cpp u Ollama requiere conversión propia, con el riesgo de degradar la calibración.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen2.5-0.5B-Instruct también es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: no hay evidencia de uso en producción ni validación por terceros.
- El autor declara métricas con `verified: false`; la reproducibilidad depende de scripts de evaluación (`eval_swarm14.py`) no publicados como parte del repo.

## Enlaces

- Hugging Face: https://huggingface.co/BRR1154/SLM-LiteratureSurvey-v2
- Checkpoint v1: https://huggingface.co/BRR1154/SLM-LiteratureSurvey-v1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- ORCID del autor: https://orcid.org/0009-0005-3349-1162
