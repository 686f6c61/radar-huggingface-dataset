# alexkstern/kdyck_dose_50Mpt_hfinit_adamwppt_100M_s2_2026-09-06_23-17-33_402072-pt

## Resumen

Este checkpoint es un experimento de investigación desarrollado con la librería `nanochat` de Karpathy. El modelo se entrena en dos fases: un pre-entrenamiento de 50 millones de tokens con `fineweb-nanochatbpe-100M` y un post-entrenamiento de 100 millones de tokens con un lenguaje formal sintético, `dyck-k128-seq_len_2048-1B`. Se trata de un transformer decoder-only con 16 capas, 8 cabezas de atención, dimensión de embeddings de 1024 y una ventana de contexto de 2048 tokens. El checkpoint corresponde al paso 762 de entrenamiento.

El propósito del modelo es estudiar el efecto del cambio de vocabulario y de distribución de datos durante el post-entrenamiento. La configuración indica que en la transición entre fases se reinicializan los embeddings y se resetea el optimizador, lo que sugiere un diseño experimental orientado a analizar la transferencia de conocimiento entre dominios. Al ser un modelo de investigación, no está pensado para uso general en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-like) |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | .pt (PyTorch state_dict) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura clásica de transformer causal de nanochat. Según la configuración del run, tiene `n_layer=16`, `n_head=8`, `n_kv_head=8`, `n_embd=1024`, `vocab_size=65536` para la fase de pre-entrenamiento y `vocab_size=256` para la fase de post-entrenamiento. El dataset `dyck-k128` es un lenguaje de paréntesis balanceados con 128 tipos de paréntesis, lo que explica el vocabulario reducido de 256 tokens.

El proceso de entrenamiento se divide en dos etapas diferenciadas: primero 50 millones de tokens con `fineweb-nanochatbpe-100M`, y después 100 millones de tokens con `dyck-k128-seq_len_2048-1B`. En la transición, se reinicializan los embeddings (`reinit_embed_at_transition=true`) y se resetea el optimizador (`reset_optimizer_at_transition=true`). Se utiliza AdamW con tasas de aprendizaje separadas para matrices, embeddings y unembedding. El scheduler es trapezoidal, con un calentamiento nulo y un enfriamiento del 40% en la fase de pre-entrenamiento y del 80% en la fase de post-entrenamiento. No se emplea mezcla de vocabulario entre ambas fases.

## Capacidades

- Generación de texto en un lenguaje formal sintético: el modelo está entrenado para predecir el siguiente token en secuencias de paréntesis balanceados (Dyck-k con 128 tipos).
- Modelado de dependencias de largo alcance y estructuras jerárquicas: el lenguaje Dyck requiere seguimiento de profundidad y correspondencia de símbolos, lo que permite evaluar la capacidad del modelo para capturar patrones recursivos.
- No se han documentado capacidades de tool calling, function calling ni soporte para agentes.
- Las capacidades multilingües no están especificadas; el dataset de pre-entrenamiento es `fineweb`, pero no se indica la composición idiomática.
- No se ha documentado soporte de visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en lenguajes formales: permite estudiar cómo los transformers aprenden gramáticas libres de contexto como Dyck-k y comparar la precisión según la profundidad y el número de tipos de paréntesis.
- Análisis de transferencia de dominio: sirve como referencia para evaluar el impacto de cambiar el vocabulario y la distribución de datos en el post-entrenamiento de modelos pequeños.
- Reproducción de experimentos con nanochat: el checkpoint y los metadatos asociados permiten replicar el run y comparar configuraciones de optimizador, scheduler y estrategias de reinicialización.
- Estudio de la dinámica de optimización: gracias al registro de Weights & Biases, se puede analizar el comportamiento de AdamW con tasas de aprendizaje separadas por componentes (matrices, embeddings y unembedding).
- Pruebas de interpretabilidad: el modelo puede utilizarse para examinar representaciones internas de estructuras jerárquicas y dependencias de largo alcance.
- Benchmark de modelos pequeños: el checkpoint puede servir como base para comparar el rendimiento de arquitecturas con profundidad 16 y dimensión de embeddings 1024 en tareas sintéticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos reportados corresponden a métricas de entrenamiento: `smooth_train_loss` de 4.17, `min_objective` de 1.22 y un coste total de `1.04e17` FLOPs. No hay evaluaciones estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Capacidad para ejecutarse en GPU de consumo: no se puede determinar con la información proporcionada, aunque el repositorio ocupa 2.9 GB.
- Opciones de despliegue: no disponible. El checkpoint está en formato `.pt` de PyTorch, por lo que requiere el código de `nanochat` o un entorno compatible con la librería. No se proporcionan versiones cuantizadas ni formatos como GGUF o safetensors.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de modelos comparables en la información consultada. El modelo pertenece a una serie de experimentos del mismo autor con variaciones de tamaño y configuración, pero no hay métricas de rendimiento para establecer una comparación directa.

## Limitaciones y advertencias

- Modelo experimental de investigación, no entrenado para uso general en lenguaje natural.
- El dominio principal es un lenguaje sintético de paréntesis balanceados, por lo que su rendimiento en texto libre no ha sido evaluado.
- El vocabulario cambió entre la fase de pre-entrenamiento y la de post-entrenamiento, lo que puede complicar la interpretación de los resultados y su reutilización.
- No se han publicado evaluaciones de sesgos, alucinaciones ni riesgos de seguridad.
- El formato de pesos `.pt` limita la portabilidad a frameworks estándar de inferencia como vLLM, llama.cpp u Ollama.
- No hay garantías de soporte, documentación de uso ni mantenimiento continuado por parte del autor.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/alexkstern/kdyck_dose_50Mpt_hfinit_adamwppt_100M_s2_2026-09-06_23-17-33_402072-pt
- Proyecto nanochat: https://github.com/karpathy/nanochat
- Registro del run en Weights & Biases: https://wandb.ai/alexksternteam/token_dose_50Mpt_adamw_seed_replicas_v1/runs/51nwc7hh
