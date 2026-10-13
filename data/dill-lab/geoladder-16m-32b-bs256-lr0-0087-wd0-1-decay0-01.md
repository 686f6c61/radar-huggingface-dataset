# dill-lab/GeoLadder-16M-32B-bs256-lr0.0087-wd0.1-decay0.01

## Resumen

GeoLadder-16M-32B-bs256-lr0.0087-wd0.1-decay0.01 es un modelo de lenguaje de 16 millones de parámetros entrenado sobre 32.000 millones de tokens del corpus the_pile_deduplicated. Lo desarrolla el grupo dill-lab (Atharva Kulkarni, Jacob Mitchell Springer, Arjun Subramonian y Swabha Swayamdipta) en el marco del artículo "Disentangling Geometry, Performance, and Training in Language Models", publicado en ICML 2026 (PMLR 306).

El modelo es una de las 108 piezas de la suite GeoLadder, un conjunto de modelos estilo OLMo de entre 4M y 75M de parámetros entrenados con variaciones controladas de tamaño de batch, weight decay, learning rate, presupuesto de tokens y LR final. El objetivo del trabajo es comprobar si la geometría de la matriz de unembedding (en particular su rango efectivo) permite estimar el rendimiento downstream; la conclusión del artículo es que la relación no es consistente y que ningún indicador geométrico predice de forma fiable el rendimiento.

Se trata, por tanto, de un modelo base de investigación, no de un asistente de propósito general: no hay ajuste por instrucciones, ni RLHF, ni DPO, y su ventana de entrenamiento es de 2048 tokens. Su interés actual es la reproducibilidad experimental (38 checkpoints publicados como ramas del repositorio) y su uso como escala mínima en estudios de interpretabilidad, dinámica de entrenamiento y escalado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo OLMo (clase `OLMoForCausalLM`, paquete `hf_olmo`) |
| Parámetros totales | 16M |
| Parámetros activos | no aplica (no es una arquitectura MoE) |
| Longitud de contexto | 2048 tokens (tamaño de secuencia empleado en el entrenamiento; la model card no declara otra ventana máxima) |
| Tipos de cuantización | no disponible; solo se publican pesos en `pytorch_model.bin`, sin variantes GGUF, GPTQ o AWQ |
| Idiomas soportados | no disponible (el corpus de entrenamiento, the_pile_deduplicated, es mayoritariamente en inglés) |
| Licencia | no disponible |
| Formato de pesos | PyTorch binario (`pytorch_model.bin`), cargable con `hf_olmo` + `transformers` |

Datos adicionales del repositorio: 4,5 GB de tamaño (incluye las 38 ramas de checkpoints), 38 revisiones correspondientes a los pasos `step0` … `step61046`, configuración HF (`config.json`) y configuración original de OLMo (`config.yaml`) en cada rama, y los índices del orden de datos de entrenamiento en `data-indices/` y `train_data/global_indices.npy`.

## Arquitectura y entrenamiento

La arquitectura es la de OLMo en su implementación legacy (`hf_olmo`), es decir, un transformer decoder-only con atención causal, y se carga mediante `AutoModelForCausalLM.from_pretrained(..., revision="step26000")` tras importar `hf_olmo`. El repositorio no detalla en la información disponible la configuración concreta de capas, cabezas, dimensión oculta, tipo de normalización ni función de activación, por lo que esos valores quedan como no disponibles.

El entrenamiento es puramente de preentrenamiento autosupervisado sobre EleutherAI/the_pile_deduplicated, sin etapas posteriores de alineación (no se documenta RLHF, DPO ni ajuste por instrucciones). Los hiperparámetros declarados son: batch de 256 secuencias de 2048 tokens, learning rate máximo de 0,0087 con schedule coseno, weight decay de 0,1 y `alpha_f` de 0,01 (el LR final es el 1 % del máximo). Con 61.046 pasos de `step61046`, el cómputo total equivale aproximadamente a 61.046 × 256 × 2048 ≈ 3,2 × 10¹⁰ tokens, es decir, un único epoch sobre los 32B tokens del corpus. La innovación metodológica del trabajo no está en la arquitectura, sino en el diseño experimental: 108 modelos con variaciones controladas de hiperparámetros para estudiar la relación entre geometría del unembedding, decisiones de entrenamiento y rendimiento final.

## Capacidades

- Generación de texto por continuación de secuencia en inglés, como modelo base sin ajuste por instrucciones.
- Modelado de lenguaje a pequeña escala: útil para experimentos controlados y comparaciones de dinámica de entrenamiento.
- Reproducibilidad de checkpoints intermedios: 38 revisiones (`step0` a `step61046`) que permiten analizar la evolución del modelo paso a paso.
- Trazabilidad del orden de datos: los ficheros `data-indices/` y `train_data/global_indices.npy` registran el orden exacto de las muestras de entrenamiento.
- Compatibilidad con el ecosistema `transformers` mediante el paquete `ai2-olmo`.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado; el tamaño del modelo y la ausencia de ajuste por instrucciones lo hacen inviable en la práctica.
- Capacidades multilingües: no documentadas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre geometría interna del modelo: calcular el rango efectivo de la matriz de unembedding en cada una de las 38 revisiones y contrastarlo con métricas downstream, replicando el análisis del artículo de ICML 2026.
- Estudios de orden de datos y reproducibilidad: usar `global_indices.npy` para reconstruir exactamente qué secuencias vio el modelo en cada paso y medir el efecto del orden sobre la pérdida y sobre las métricas geométricas.
- Baseline en estudios de escalado: emplear la escala de 16M como punto intermedio dentro de la suite GeoLadder (4M–75M) para aislar el efecto del tamaño frente al de batch size, weight decay o presupuesto de tokens.
- Análisis de degradación tardía del entrenamiento: el paper señala que el rango bajo coocurre con degradación al final del entrenamiento, por lo que los checkpoints de las últimas fases sirven para estudiar ese fenómeno con control experimental.
- Pruebas de infraestructura y CI: un modelo de 16M en fp32 ocupa unos 64 MB, así que puede cargarse en CPU dentro de un test unitario o de un pipeline de CI para validar tokenizadores, harnesses de evaluación o scripts de conversión sin coste apreciable.
- Docencia y divulgación: ilustrar de principio a fin el ciclo de vida de un LLM (preentrenamiento, checkpoints intermedios, evaluación y análisis) con un modelo que cabe en memoria de cualquier portátil.
- Validación de arneses de evaluación: ejecutar tareas tipo lm-evaluation-harness como prueba de humo (smoke test) antes de lanzar evaluaciones sobre modelos mayores, comprobando que el pipeline carga pesos OLMo correctamente.
- Estudios de memorización y privacidad a escala reducida: la ventana de 2048 tokens y el corpus deduplicado conocido permiten medir solapamiento entre texto generado y datos de entrenamiento con un coste computacional mínimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente documenta hiperparámetros de entrenamiento (16M de parámetros, 32B de tokens, batch size 256, LR máximo 0,0087, weight decay 0,1, `alpha_f` 0,01) y la pertenencia a la suite de 108 modelos del artículo; no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra tarea estandarizada.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 64 MB solo para los pesos (16M × 4 bytes), más el estado de activaciones y caché KV para 2048 tokens, que es despreciable a esta escala.
- VRAM estimada en fp16/bf16: aproximadamente 32 MB para los pesos.
- GPU recomendadas: ninguna en particular; cualquier GPU con soporte CUDA (por ejemplo RTX 3060, RTX 4090) ejecuta el modelo con holgura. A100 o H100 solo tienen sentido para entrenar o para lanzar barridos masivos sobre las 38 revisiones.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con al menos 1 GB de VRAM; también se ejecuta íntegramente en CPU.
- Espacio en disco: el repositorio completo ocupa 4,5 GB porque incluye 38 checkpoints; conviene descargar solo la revisión necesaria para reducir el consumo a unas decenas de megabytes.
- Opciones de despliegue: `transformers` junto con `ai2-olmo` (obligatorio, porque usa la arquitectura legacy `hf_olmo`). No se documenta soporte en vLLM, TGI, llama.cpp ni Ollama; su uso en esos motores requeriría una conversión manual del checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Tokens de entrenamiento | Contexto | Corpus | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GeoLadder-16M-32B-bs256-lr0.0087-wd0.1-decay0.01 | 16M | 32B | 2048 | the_pile_deduplicated | no disponible | HuggingFace (repositorio con 38 checkpoints) |
| Familia GeoLadder (resto de la suite) | 4M–75M | no disponible por modelo | no disponible | the_pile_deduplicated | no disponible | HuggingFace (colección GeoLadder, 108 modelos) |
| Pythia-14M (EleutherAI) | 14M | 300B (Pile) | 2048 | Pile | Apache 2.0 | HuggingFace, con 154 checkpoints |
| Pythia-70M (EleutherAI) | 70M | 300B (Pile) | 2048 | Pile | Apache 2.0 | HuggingFace, con 154 checkpoints |

Nota: los datos de la familia Pythia proceden de fuentes públicas externas a la información proporcionada, y se incluyen únicamente como referencia de categoría (modelos base pequeños con checkpoints intermedios). No hay comparación de rendimiento disponible entre GeoLadder-16M y estos modelos, porque la información proporcionada no incluye resultados de benchmarks.

## Limitaciones y advertencias

- Licencia no declarada: no es posible confirmar si se permite el uso comercial ni bajo qué condiciones; en producción habría que asumir el peor escenario.
- Modelo base sin alineación: no sigue instrucciones, no tiene modo conversacional y no debe usarse como asistente tal cual.
- Riesgo de alucinación elevado: con 16M de parámetros y 32B de tokens, la coherencia a medio plazo es limitada y las afirmaciones factuales no son fiables.
- Idiomas: la model card no declara idiomas soportados; el corpus the_pile_deduplicated es mayoritariamente en inglés, por lo que el rendimiento en castellano será previsiblemente bajo y no está medido.
- Sesgos heredados del corpus: el Pile contiene texto crudo de internet, con los sesgos sociales, la toxicidad y las desinformaciones presentes en esas fuentes, sin filtrado posterior documentado.
- Pesos en formato pickle (`pytorch_model.bin`): no se publican en safetensors, lo que implica un riesgo de seguridad al cargar ficheros serializados con `torch.load`.
- Dependencia de una arquitectura legacy: requiere instalar `ai2-olmo` y registrar `OLMoForCausalLM`; la carga falla con `transformers` sin ese paquete, y la compatibilidad futura con versiones recientes de la librería no está garantizada.
- Sin validación por parte de la comunidad: 0 descargas y 0 likes en el momento de la consulta; no hay informes independientes de comportamiento en producción.
- Fechas del repositorio: creado y actualizado el 12 de octubre de 2026, en el contexto de publicación del artículo de ICML 2026.
- Huella en disco: el repositorio completo son 4,5 GB por los 38 checkpoints; descargarlo entero para un solo uso es innecesario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dill-lab/GeoLadder-16M-32B-bs256-lr0.0087-wd0.1-decay0.01
- Colección GeoLadder (108 modelos de la suite): https://huggingface.co/collections/dill-lab/geoladder-6acd192e30ec71aff2998e2e
- Artículo en PMLR: https://proceedings.mlr.press/v306/kulkarni26c.html
- Preprint en arXiv (arXiv:2602.20433): https://arxiv.org/abs/2602.20433
- Ficha en OpenReview: https://openreview.net/forum?id=kNb6NNhKgE
- Dataset de entrenamiento: https://huggingface.co/datasets/EleutherAI/the_pile_deduplicated

Los resultados de búsqueda web obtenidos no aportan enlaces relevantes: todas las entradas devueltas corresponden a la planta dill (Anethum graveolens) y a servicios de traducción, sin relación con el modelo.
