# alexkstern/nca_dose_1Bpt_hfinit_adamwppt_20M_s1_2026-09-06_12-32-59_376218-pt

## Resumen

El modelo `nca_dose_1Bpt_hfinit_adamwppt_20M_s1_2026-09-06_12-32-59_376218-pt` es un checkpoint experimental de un modelo de lenguaje pequeño desarrollado por `alexkstern` utilizando la librería `nanochat` de Karpathy. Se trata de un transformer decoder-only entrenado en dos fases: una fase de preentrenamiento con 1.000 millones de tokens del dataset `fineweb-nanochatbpe-20B` y una fase de post-entrenamiento de 20 millones de tokens con el dataset `nca-paper-share200-2048`. La configuración incluye dos vocabularios distintos (65.536 tokens en el preentrenamiento y 10.004 tokens en el post-entrenamiento), lo que sugiere un experimento sobre el impacto de cambiar el vocabulario y reinicializar las capas de embedding en la transición.

La arquitectura es un transformer estándar con 16 capas, 8 cabezas de atención, 8 cabezas KV, dimensiones de embedding de 1024 y una longitud de contexto de 2048 tokens. A partir de la configuración se estima un tamaño de aproximadamente 335 millones de parámetros, aunque el autor no lo especifica explícitamente. El checkpoint se guardó en el paso 3.814, con una pérdida de entrenamiento suavizada de 3.162 y una métrica `min_objective` de 0.944. El modelo se publica bajo licencia Apache 2.0 y el repositorio en HuggingFace pesa 3.0 GB. No se han publicado benchmarks ni evaluaciones externas; la información disponible se limita a los metadatos del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (nanochat GPT) |
| Parametros totales | No disponible (estimacion ~335M a partir de la configuracion) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `.pt` (state_dict) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura `nanochat GPT` de Karpathy, un transformer decoder-only estándar. Según la configuración, tiene 16 capas, 8 cabezas de atención, 8 cabezas KV (sin GQA, ya que `n_kv_head = n_head`), dimensiones de embedding de 1024 y longitud de secuencia de 2048 tokens. El vocabulario de la fase de preentrenamiento es de 65.536 tokens, mientras que en la fase de post-entrenamiento se reduce a 10.004 tokens, lo que implica una reinicialización de las capas de embedding y un reinicio del optimizador en la transición (`reinit_embed_at_transition: true`, `reset_optimizer_at_transition: true`).

El entrenamiento se realizó con un total de 1.000 millones de tokens de `fineweb-nanochatbpe-20B` y 20 millones de tokens de `nca-paper-share200-2048`. Se utilizó un programador de tasa de aprendizaje trapezoidal con `warmup_ratio: 0.0` y `warmdown_ratio: 0.4`, y tasas de aprendizaje diferenciadas: 0.02 para matrices, 0.3 para embeddings y 0.004 para unembeddings. El checkpoint se guardó en el paso 3.814. El hardware registra un pico de 2250 TFLOPS, lo que sugiere entrenamiento en GPUs de alta gama (posiblemente H100). No se menciona RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Generacion de texto: el modelo es un transformer decoder-only y puede generar texto autoregresivo, aunque no se han publicado evaluaciones de calidad ni ejemplos de uso.
- Razonamiento: no disponible; no hay benchmarks que lo confirmen.
- Codigo: no disponible; no se mencionan datos de entrenamiento de codigo.
- Matematicas: no disponible.
- Vision: no disponible; el modelo es puramente textual.
- Tool calling / function calling: no disponible; no se menciona soporte.
- Agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no disponible; no se especifican idiomas.
- Capacidades especiales: no disponible; no hay indicios de modo thinking, vision, audio, etc.

## Casos de uso

- Investigacion en eficiencia de entrenamiento: el modelo está diseñado para estudiar el impacto de cambiar el vocabulario en la fase de post-entrenamiento. Es adecuado porque su configuración incluye dos vocabularios (65536 y 10004) y una transición con reinicialización de embeddings, lo que permite reproducir experimentos controlados y comparar el efecto sobre la pérdida.

- Prototipado rapido de aplicaciones de NLP: al ser un modelo pequeño con licencia Apache 2.0, puede cargarse en un notebook para probar generación de texto, clasificación o completado de prompts. Es adecuado por su tamaño reducido y su facilidad de manipulación con PyTorch.

- Educacion y formacion en transformers: el modelo se entrena con `nanochat`, un framework educativo de Karpathy. Puede usarse en cursos para ilustrar el pipeline completo de entrenamiento, desde la preparación de datos hasta la generación del checkpoint. Es adecuado por su simplicidad y código abierto.

- Fine-tuning en dominios especificos: su tamaño (~335M) permite ajustarlo en un dataset propio con una sola GPU de consumo. Es adecuado para tareas de nicho donde no se requieren capacidades generales amplias, como clasificación de textos cortos o generación en un dominio concreto.

- Evaluacion de tecnicas de post-entrenamiento: la fase "ppt" con 20M tokens y vocabulario reducido sirve para analizar cómo afecta la reinicialización del embedding y el reinicio del optimizador. Es adecuado porque el checkpoint incluye metadatos y configuración detallada para reproducir el análisis.

- Despliegue en entornos con recursos limitados: si se convierte a GGUF o se cuantiza, el modelo podría ejecutarse en CPU o en GPUs de gama baja para tareas de generación corta o clasificación. Es adecuado por su tamaño y licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Solo se conoce la pérdida de entrenamiento suavizada (3.162) y la métrica `min_objective` (0.944) del propio entrenamiento, así como el número de FLOPs utilizados (2.08e18).

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de ~335M en fp32, los pesos ocupan aproximadamente 1.3 GB; con overhead de inferencia se estima un mínimo de 2 GB de VRAM. En fp16, ~1 GB; en cuantización 8-bit, ~0.4 GB.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM (por ejemplo, RTX 3060, RTX 4060). Para entrenamiento se utilizó hardware con 2250 TFLOPS, probablemente H100, pero no es necesario para inferencia.
- Si cabe en consumer GPU: sí, el modelo cabe en GPUs de consumo como RTX 3060 o superiores.
- Opciones de despliegue: el checkpoint está en formato `.pt` de PyTorch. Para usar con vLLM, TGI o llama.cpp, sería necesario convertirlo a safetensors o GGUF. No se proporcionan dichos formatos en el repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La búsqueda web solo devuelve otros checkpoints del mismo autor con configuraciones casi idénticas, como `nca_dose_1Bpt_hfinit_20M_s1_2026-08-14_10-59-49_660926-pt` y `nca_dose_1Bpt_hfinit_1B_s0_2026-08-14_14-00-02_907438-pt`, pero no se dispone de benchmarks comparativos ni de evaluaciones externas.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; no se ha realizado una evaluación de sesgos.
- Riesgo de alucinacion: alto, como en cualquier modelo pequeño entrenado con pocos tokens; no se ha evaluado.
- Limitaciones de contexto o idioma: la longitud de contexto es de 2048 tokens; los idiomas no están especificados, aunque el dataset de preentrenamiento (FineWeb) sugiere un predominio del inglés.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero no hay garantías de rendimiento ni soporte.
- Caveats para produccion: el checkpoint es un snapshot de un experimento de investigación; no se han publicado evaluaciones externas; el formato de pesos `.pt` no es compatible directamente con frameworks de inferencia estándar sin conversión.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/nca_dose_1Bpt_hfinit_adamwppt_20M_s1_2026-09-06_12-32-59_376218-pt
- Repositorio nanochat: https://github.com/karpathy/nanochat
- W&B run: https://wandb.ai/alexksternteam/token_dose_1Bpt_adamw_seed_replicas_v1/runs/76evgn61
- Checkpoint similar del autor: https://huggingface.co/alexkstern/nca_dose_1Bpt_hfinit_20M_s1_2026-08-14_10-59-49_660926-pt
- Checkpoint similar del autor: https://huggingface.co/alexkstern/nca_dose_1Bpt_hfinit_1B_s0_2026-08-14_14-00-02_907438-pt
