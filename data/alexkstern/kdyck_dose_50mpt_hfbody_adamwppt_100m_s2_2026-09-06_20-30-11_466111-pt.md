# alexkstern/kdyck_dose_50Mpt_hfbody_adamwppt_100M_s2_2026-09-06_20-30-11_466111-pt

## Resumen

Este modelo es un checkpoint experimental de investigación desarrollado por alexkstern utilizando la librería `nanochat` de Karpathy. Se trata de un modelo GPT pequeño, con arquitectura Transformer de 16 capas, 8 cabezas de atención y una dimensión de embedding de 1024, con una longitud de contexto de 2048 tokens. El tamaño total de parámetros no se especifica en la información disponible, pero la configuración sugiere un modelo de escala reducida.

El propósito del experimento es estudiar el efecto de la «dosis de tokens» en el aprendizaje. El modelo se entrena en dos fases: primero se pre-entrena con 50 millones de tokens del dataset FineWeb y después se post-entrena con 100 millones de tokens del dataset sintético Dyck-k128, que contiene secuencias de paréntesis balanceados. Este enfoque permite analizar cómo la cantidad y el tipo de datos de post-entrenamiento influyen en la capacidad del modelo para modelar estructuras jerárquicas.

La relevancia del modelo radica en su contribución a la investigación sobre dinámicas de entrenamiento en dos fases, transferencia de conocimiento y scaling laws. No es un modelo de propósito general, sino una herramienta para estudiar comportamientos específicos de optimización y representación. El checkpoint se publica con licencia Apache 2.0 y los pesos se distribuyen en formato PyTorch (`.pt`).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer GPT (decoder-only) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state_dict (`.pt`) |

| Parametro adicional | Valor |
|---|---|
| Capas | 16 |
| Cabezas de atencion | 8 |
| Cabezas KV | 8 |
| Dimension de embedding | 1024 |
| Vocabulario (fase pre-training) | 65536 |
| Vocabulario (fase post-training) | 256 |
| Tamano del repositorio | 2.9 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura estándar de un Transformer decoder-only GPT, implementado en `nanochat`. La configuración especifica 16 capas, 8 cabezas de atención y 8 cabezas KV, con una dimensión de embedding de 1024. El vocabulario de la fase de pre-entrenamiento es de 65536 tokens, mientras que en la fase de post-entrenamiento se reduce a 256 tokens, lo que indica un cambio de dominio hacia el dataset sintético Dyck-k128.

El entrenamiento se divide en dos etapas. En la primera se utilizan 50 millones de tokens del dataset `fineweb-nanochatbpe-100M`. En la segunda se emplean 100 millones de tokens del dataset `dyck-k128-seq_len_2048-1B`. La optimización se realiza con AdamW, con tasas de aprendizaje diferenciadas: 0.02 para las matrices, 0.3 para los embeddings y 0.004 para los unembeddings. Se usa un schedule trapezoidal sin warmup, con un warmdown del 40% en la fase de pre-entrenamiento y del 10% en la de post-entrenamiento. Durante la transición entre fases se reinicializan los embeddings y el optimizador.

No se aplicaron técnicas de alineamiento como RLHF o DPO. El objetivo del experimento es evaluar cómo el post-entrenamiento en un dominio sintético afecta al aprendizaje de estructuras jerárquicas, sin intervención de preferencias humanas.

## Capacidades

- Generación de secuencias en el dominio sintético Dyck-k128, que incluye paréntesis balanceados de 128 tipos.
- Modelado de estructuras jerárquicas y gramáticas libres de contexto, gracias al dataset de post-entrenamiento.
- No soporta tool calling ni function calling.
- No dispone de capacidades de visión, audio ni razonamiento multi-paso avanzado.
- Las capacidades multilingües no han sido evaluadas.
- El modelo no está diseñado para generar texto natural general ni para seguir instrucciones complejas.

## Casos de uso

- Investigación sobre la dinámica de entrenamiento en dos fases: permite analizar cómo la transición entre pre-entrenamiento y post-entrenamiento afecta a la pérdida y a la capacidad de generalización en secuencias Dyck.
- Estudio de scaling laws y dosis de tokens: este checkpoint forma parte de una familia de experimentos que varían la cantidad de tokens de post-entrenamiento, lo que facilita comparar el efecto de la dosis en el rendimiento.
- Análisis de representaciones internas: el modelo puede utilizarse para estudiar cómo las capas intermedias codifican las estructuras jerárquicas de los paréntesis balanceados.
- Evaluación de la transferencia de dominio: sirve para investigar si un modelo pre-entrenado en lenguaje natural puede adaptarse a un dominio sintético con pocos datos.
- Reproducción de experimentos científicos: los archivos incluyen metadatos de entrenamiento, configuración y estado del RNG, lo que permite replicar el entrenamiento y verificar resultados.
- Benchmark de modelos pequeños en tareas de Dyck: puede emplearse como referencia para comparar arquitecturas o estrategias de optimización en el aprendizaje de gramáticas libres de contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo proporciona métricas de entrenamiento:

| Metrica | Valor |
|---|---|
| Paso | 762 |
| Pérdida de entrenamiento suavizada | 4.1973 |
| Objetivo mínimo | 1.2288 |
| FLOPs utilizados | 1.0389e+17 |
| FLOPs por token | 2080374784 |
| Tiempo total de entrenamiento | 231.39 |

No se incluyen resultados de evaluaciones externas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 2.9 GB, pero no se especifica el consumo de memoria en ejecución.
- GPU recomendadas: no disponible. Según la configuración de entrenamiento, el hardware utilizado alcanzó 2250 TFLOPS de pico, lo que sugiere una GPU de gama alta (posiblemente H100), aunque no se confirma el modelo exacto.
- En GPU de consumo: probablemente sí, dado el tamaño reducido del modelo, pero no se dispone de datos concretos.
- Opciones de despliegue: no disponible. Los pesos están en formato `.pt`, por lo que se requiere conversión para usar con vLLM, llama.cpp, Ollama u otros frameworks.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de modelos comparables en la información proporcionada. Existen otros checkpoints del mismo autor con nombres similares, como `kdyck_dose_50Mpt_hfinit_20M_s2_2026-08-14_15-32-20_705847-pt` y `kdyck_dose_50Mpt_500M_s1_2026-08-14_23-32-11_443383-pt`, que forman parte del mismo estudio sobre dosis de tokens. Sin embargo, no hay datos de rendimiento publicados que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo experimental de investigación, no apto para uso en producción.
- Solo se ha entrenado con 50 millones de tokens de FineWeb y 100 millones de tokens de Dyck-k128, lo que limita su conocimiento del lenguaje natural.
- No ha sido evaluado en términos de sesgos, alucinaciones ni toxicidad.
- Los pesos están en formato `.pt` de PyTorch, no en `safetensors` ni `GGUF`, lo que dificulta su uso con herramientas de inferencia estándar.
- No soporta tool calling, visión, audio ni razonamiento complejo.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no es útil para aplicaciones comerciales reales.
- La longitud de contexto de 2048 tokens es reducida para tareas que requieran ventanas largas.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/kdyck_dose_50Mpt_hfbody_adamwppt_100M_s2_2026-09-06_20-30-11_466111-pt
- Repo nanochat: https://github.com/karpathy/nanochat
- W&B run: https://wandb.ai/alexksternteam/token_dose_50Mpt_adamw_seed_replicas_v1/runs/y4l00s4u
