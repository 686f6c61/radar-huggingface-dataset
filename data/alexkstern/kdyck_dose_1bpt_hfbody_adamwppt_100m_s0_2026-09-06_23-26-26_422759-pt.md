# alexkstern/kdyck_dose_1Bpt_hfbody_adamwppt_100M_s0_2026-09-06_23-26-26_422759-pt

## Resumen

Este checkpoint, publicado por alexkstern, es un experimento de investigación enmarcado en la línea de "token dose" con la librería nanochat. El modelo no está pensado para uso en producción, sino para estudiar cómo afecta el pre-entrenamiento en texto natural y el post-entrenamiento con un dataset sintético (gramáticas Dyck) al comportamiento de un transformer pequeño.

La arquitectura es un transformer decoder-only tipo GPT, con 16 capas, 8 cabezas de atención, dimensiones de modelo de 1024 y una ventana de contexto de 2048 tokens. El repositorio ocupa 3.0 GB, pero el número total de parámetros no se ha publicado. El checkpoint guardado corresponde al paso 3814 del entrenamiento, tras consumir 1.000 millones de tokens de FineWeb y 100 millones de tokens del dataset Dyck. La licencia es Apache-2.0.

Su relevancia en el momento actual es limitada: se trata de un artefacto de investigación para la comunidad que estudia dinámicas de entrenamiento, generalización estructural y el papel de los datos sintéticos en el aprendizaje de lenguajes formales. No se han publicado evaluaciones funcionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT) implementado en nanochat (nanochat_gpt) |
| Parametros totales | No disponible |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible; pre-entrenado con FineWeb y post-entrenado con Dyck sintético |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (state_dict .pt) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT clásica de nanochat: un transformer decoder-only con 16 capas, 8 cabezas de atención (n_head y n_kv_head = 8), embeddings de 1024 dimensiones y vocabulario de 65 536 tokens en la fase de pre-entrenamiento. En la fase de post-entrenamiento (ppt) se redefine el vocabulario a 256 tokens, manteniendo la misma profundidad y ancho. La ventana de contexto es de 2048 tokens.

El entrenamiento se compone de dos etapas. Primero se pre-entrena el modelo con un subconjunto de FineWeb (1 000 millones de tokens). Luego se realiza una fase de post-entrenamiento con un dataset sintético de Dyck ("dyck-k128-seq_len_2048-1B"), donde se re-inicializan los embeddings, se reinicia el optimizador y se ajusta la tasa de aprendizaje de manera independiente. El run configurado usa un scheduler trapezoidal con 40% de warmdown para la fase pt y 80% para la fase ppt, sin weight decay. Se utilizó AdamW con learning rates diferenciados: 0.02 para matrices, 0.3 para embeddings y 0.004 para unembeddings. No se ha aplicado RLHF ni DPO.

Según las métricas del checkpoint, se utilizaron 2.08e18 FLOPs en total, con 2.08e9 FLOPs por token. La técnica de "dose" en el nombre sugiere que se varía la cantidad de tokens para analizar su efecto sobre la adquisición de estructuras formales. No hay disponibles detalles adicionales sobre el dataset Dyck.

## Capacidades

- Generacion de texto autoregresiva: el modelo puede generar texto en el vocabulario de 65 536 tokens de la fase pt y en el vocabulario reducido de 256 tokens de la fase ppt, pero no se ha evaluado la calidad de las salidas.
- Razonamiento: no evaluado. No hay benchmarks ni análisis de cero-shot que permitan afirmar ninguna capacidad de razonamiento.
- Tool calling / function calling: no disponible.
- Agentes y razonamiento multi-paso: no disponible.
- Multilingue: no disponible. El pre-entrenamiento se realizó con FineWeb (predominantemente inglés) y el post-entrenamiento con un lenguaje sintético no natural.
- Vision, audio o multimodalidad: no disponible.

## Casos de uso

Este modelo no está pensado para aplicaciones reales; los casos siguientes son exclusivamente de investigación y desarrollo experimental.

- Estudio de la adquisición de gramáticas Dyck: el modelo se puede usar como sujeto experimental para medir cómo un transformer pequeño aprende la estructura jerárquica de un lenguaje de Dyck con k=128. Es adecuado porque fue entrenado específicamente con ese dataset.
- Análisis de representaciones internas: el checkpoint en el paso 3814 permite inspeccionar cómo evolucionan las activaciones y las cabezas de atención durante el post-entrenamiento.
- Comparación del efecto de la dosis de tokens: al existir otros checkpoints con nombres similares, se pueden comparar los efectos de variar escalas y configuraciones dentro del mismo experimento de token dose.
- Reproducibilidad de pipelines nanochat: sirve como referencia para validar cambios en la librería nanochat y en el procedimiento de entrenamiento en dos fases.
- Evaluación de técnicas de re-inicialización de embeddings: la configuración indica que se re-inicializan los embeddings en la transición entre fases; este checkpoint puede usarse para estudiar el impacto de esa decisión técnica.
- Benchmark de coste computacional: las métricas de FLOPs y el tiempo total de entrenamiento (793.6 segundos) pueden compararse con otros runs para entender la eficiencia de la configuración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Métricas de entrenamiento (no comparativas):

| Metrica | Valor |
|---|---|
| Step | 3814 |
| Smooth train loss | 3.1682 |
| Min objective | 0.9442 |
| FLOPs usados | 2.08e18 |
| FLOPs por token | 2.08e9 |
| Tiempo total de entrenamiento | 793.6 s |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumidor: no especificado. El checkpoint está en formato .pt y no incluye tokenizer, por lo que requeriría conversión (por ejemplo a safetensors o GGUF) y preparación del tokenizer para usarse con herramientas estándar.
- Opciones de despliegue: no documentado; no se puede desplegar directamente con vLLM, TGI, llama.cpp u Ollama sin un trabajo previo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No hay información suficiente para comparar con alternativas de la misma categoría. Se identifican dos modelos relacionados del mismo autor, ambos en el proyecto de token dose, pero sus especificaciones no están disponibles:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| kdyck_dose_1Bpt_hfbody_200M_s0_2026-08-14_09-26-44_877448-pt | no disponible | no disponible | no disponible | HuggingFace |
| kdyck_dose_1Bpt_hfbody_1B_s0_2026-08-14_11-12-47_102739-pt | no disponible | no disponible | no disponible | HuggingFace |

## Limitaciones y advertencias

- Sesgos: no se ha realizado ninguna evaluación de sesgos. Al heredar el corpus de FineWeb, es probable que presente sesgos del inglés y de la web, pero no se ha medido.
- Riesgo de alucinación: alto, dado el reducido tamaño del modelo y el limitado corpus de entrenamiento (1B tokens).
- Limitaciones de contexto e idioma: contexto de 2048 tokens; no se ha evaluado soporte multilingüe más allá de los datos de entrenamiento.
- Restricciones de licencia: Apache-2.0, permite uso comercial, pero el modelo no tiene la calidad ni el soporte necesarios para entornos de producción.
- Formato: los pesos están en .pt, sin tokenizer ni pipeline cargable desde HuggingFace, lo que limita su uso con frameworks de inferencia estándar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alexkstern/kdyck_dose_1Bpt_hfbody_adamwppt_100M_s0_2026-09-06_23-26-26_422759-pt
- Weights & Biases: https://wandb.ai/alexksternteam/token_dose_1Bpt_adamw_seed_replicas_v1/runs/kp0axqfx
- Repositorio nanochat: https://github.com/karpathy/nanochat
- Modelos relacionados:
  - https://huggingface.co/alexkstern/kdyck_dose_1Bpt_hfbody_200M_s0_2026-08-14_09-26-44_877448-pt
  - https://huggingface.co/alexkstern/kdyck_dose_1Bpt_hfbody_1B_s0_2026-08-14_11-12-47_102739-pt
