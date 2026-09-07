# alexkstern/kdyck_dose_50Mpt_hfbody_adamwppt_1B_s2_2026-09-06_22-26-48_611417-pt

## Resumen

Este modelo es un experimento de investigación desarrollado por alexkstern con la librería nanochat. Se trata de un transformador decoder-only entrenado en dos fases: primero con 50 millones de tokens de FineWeb y después con 1.000 millones de tokens de un lenguaje sintético Dyck-128. El objetivo es estudiar cómo los transformadores aprenden estructuras jerárquicas anidadas y el efecto de la tokenización en ese proceso.

La arquitectura es un GPT minimalista con 16 capas, 8 cabezas de atención y una dimensión de embedding de 1024. La longitud de contexto es de 2048 tokens. El modelo final utiliza un vocabulario de 256 tokens, correspondientes a los símbolos del lenguaje Dyck (128 tipos de paréntesis de apertura y cierre). No es un modelo de lenguaje natural, sino una herramienta de investigación para análisis de lenguajes formales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (nanochat GPT) con 16 capas, 8 cabezas de atencion, 8 KV heads, dimension de embedding 1024 |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado en lenguaje sintetico Dyck-128, no en lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state_dict (.pt) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer estándar, sin componentes MoE ni SSM. La configuración define dos modelos en el mismo run: un modelo de pretraining (`model_pt`) con un vocabulario de 65536 tokens, y un modelo de post-entrenamiento (`model_ppt`) con un vocabulario de 256 tokens. La transición entre fases reinitializa las capas de embedding y unembedding, resetea el optimizador y cambia la tasa de aprendizaje a 5e-5 con una programación trapezoidal.

El entrenamiento se divide en dos etapas: primero se procesan 50 millones de tokens de FineWeb (con tokenizador BPE de nanochat), y después 1.000 millones de tokens del dataset sintético `dyck-k128-seq_len_2048-1B`. El checkpoint se guarda en el paso 762 de un plan de 1000 iteraciones. La pérdida de entrenamiento suavizada en ese paso es 4.2185, y el objetivo mínimo registrado es 1.2346. No se menciona RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Modelado de secuencias Dyck-128: predice el siguiente token en secuencias de paréntesis anidados de hasta 128 tipos distintos.
- Longitud de contexto de 2048 tokens, lo que permite procesar secuencias largas de paréntesis.
- No soporta tool calling, function calling ni agentes.
- No soporta lenguaje natural, visión, audio ni otras modalidades.
- No se han publicado evaluaciones de razonamiento general ni de capacidades lingüísticas.

## Casos de uso

- Investigación en teoría de lenguajes: el modelo puede usarse para estudiar si los transformadores aprenden lenguajes libres de contexto como Dyck-128, comparando su comportamiento con el de modelos de tamaño similar.
- Análisis del efecto de la tokenización: permite comparar el rendimiento al pasar de un vocabulario amplio (65536) a uno reducido (256) en tareas de estructura jerárquica, gracias a la reinitialización de embeddings documentada.
- Estudio de curriculum learning: la transición de un corpus de lenguaje natural a un corpus sintético ofrece un caso de estudio para analizar cómo afecta el cambio de dominio al optimizador y a la convergencia.
- Evaluación de generalización: puede utilizarse para probar la extrapolación a secuencias más largas o con más tipos de paréntesis, ajustando la longitud de contexto y el vocabulario.
- Reproducibilidad de experimentos: el checkpoint incluye metadatos y configuración completa, lo que permite replicar el run de nanochat y verificar los resultados de pérdida y FLOPs.
- Comparación de arquitecturas: sirve como referencia para contrastar transformadores de tamaño pequeño en tareas de Dyck, dado que la configuración es pública y el entrenamiento está documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se dispone de datos oficiales de VRAM para inferencia.
- Dado el tamaño de la arquitectura (16 capas, 1024 de embedding, 8 cabezas), se espera que la inferencia sea ligera y quepa en GPUs de consumo, pero no hay cifras confirmadas.
- El entrenamiento se realizó en un dispositivo con un pico de 2250 TFLOPS (especificado en la configuración como `peak_tflops`), lo que sugiere un acelerador de gama alta, aunque no se indica el modelo exacto.
- El checkpoint está en formato `.pt` de PyTorch, por lo que puede cargarse directamente con la librería nanochat o PyTorch. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos. Los únicos modelos encontrados son otros checkpoints del mismo autor con nombres similares (por ejemplo, `kdyck_dose_50Mpt_20M_s2_2026-08-14_22-59-48_639587-pt`), pero no se han publicado sus configuraciones ni resultados. Por tanto, no es posible establecer una comparativa técnica.

## Limitaciones y advertencias

- No es un modelo de lenguaje natural: no puede generar texto en español ni en ningún idioma.
- El vocabulario está limitado a 256 tokens, exclusivamente para símbolos del lenguaje Dyck.
- No se han publicado evaluaciones de seguridad, sesgos ni alucinaciones.
- Es un experimento de investigación con 0 descargas y 0 likes, sin documentación adicional.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no es útil para tareas generales.
- El checkpoint se guardó en el paso 762 de un plan de 1000 iteraciones; no se indica si el entrenamiento se completó.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/kdyck_dose_50Mpt_hfbody_adamwppt_1B_s2_2026-09-06_22-26-48_611417-pt
- W&B run: https://wandb.ai/alexksternteam/token_dose_50Mpt_adamw_seed_replicas_v1/runs/ibsap5vl
- nanochat (GitHub): https://github.com/karpathy/nanochat
