# alexkstern/kdyck_dose_100Mpt_hfbody_adamwppt_5M_s2_2026-09-06_15-17-00_507508-pt

## Resumen

El modelo `kdyck_dose_100Mpt_hfbody_adamwppt_5M_s2_2026-09-06_15-17-00_507508-pt` es un experimento de investigación desarrollado por `alexkstern` utilizando la librería `nanochat`. Se trata de un transformer decoder-only con 16 capas, 8 cabezas de atención, 8 cabezas KV y una dimensión de embedding de 1024, con una longitud de contexto de 2048 tokens. El proceso de entrenamiento consta de dos fases: un preentrenamiento sobre 100 millones de tokens de `FineWeb-nanochatbpe-100M` (con un vocabulario de 65536 tokens) y un post-entrenamiento sobre 5 millones de tokens de un dataset sintético de Dyck con 128 tipos de paréntesis (`dyck-k128-seq_len_2048-1B`), que utiliza un vocabulario reducido de 256 tokens. El checkpoint guardado corresponde al paso 762 de un total de 1000 iteraciones.

El interés del modelo radica en el estudio del efecto de la "token dose" (cantidad de tokens) y de la transición entre dominios con reinicialización de embeddings. La configuración incluye `reinit_embed_at_transition: true`, lo que significa que la capa de embedding se reinicializa al pasar del vocabulario de lenguaje natural al vocabulario sintético de Dyck. No es un modelo de propósito general ni está pensado para producción, sino para investigar dinámicas de aprendizaje y estrategias de optimización en entornos controlados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (nanochat_gpt) |
| Parametros totales | no disponible (no especificado en la model card) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo final usa un vocabulario sintetico de 256 tokens para Dyck) |
| Licencia | Apache-2.0 |
| Formato de pesos | .pt (PyTorch state_dict) |
| Vocabulario preentrenamiento | 65536 tokens (BPE de nanochat) |
| Vocabulario post-entrenamiento | 256 tokens (Dyck k=128) |
| Numero de capas | 16 |
| Numero de cabezas | 8 |
| Cabezas KV | 8 |
| Dimension de embedding | 1024 |
| Tokens de preentrenamiento | 100.000.000 |
| Tokens de post-entrenamiento | 5.000.000 |
| Paso del checkpoint | 762 |
| Optimizador | AdamW |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estándar, implementado en `nanochat`. La configuración de preentrenamiento (`model_pt`) define 16 capas, 8 cabezas, 8 cabezas KV y una dimensión de embedding de 1024, con un vocabulario de 65536 tokens. La configuración de post-entrenamiento (`model_ppt`) mantiene la misma arquitectura de capas pero cambia el vocabulario a 256 tokens, específico del lenguaje Dyck. El preentrenamiento se realiza sobre `FineWeb-nanochatbpe-100M` con 100 millones de tokens, mientras que el post-entrenamiento utiliza `dyck-k128-seq_len_2048-1B` con 5 millones de tokens.

La transición entre fases incluye la reinicialización del embedding (`reinit_embed_at_transition: true`) y el reinicio del optimizador (`reset_optimizer_at_transition: true`). El programa de aprendizaje es de tipo trapezoidal (`lr_trapezoid`), con un warmup del 0% y un warmdown del 40% del total de iteraciones, tanto para la fase de preentrenamiento como para la de post-entrenamiento. Las tasas de aprendizaje configuradas son: `matrix_lr` 0.02, `embedding_lr` 0.3 y `unembedding_lr` 0.004. No se aplica weight decay. El entrenamiento registra un total de `flops_used` de 2.08e+17 y un `flops_per_token` de 2.08e+09. No se menciona el uso de RLHF ni DPO.

## Capacidades

- Generación de secuencias en el lenguaje formal Dyck, es decir, secuencias balanceadas de paréntesis con 128 tipos de paréntesis.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en lenguaje natural.
- No tiene capacidades multilingües.
- No tiene capacidades de visión ni audio.
- No dispone de modo de pensamiento (thinking mode).

## Casos de uso

- Investigación en interpretabilidad de modelos: se puede analizar cómo el modelo representa las estructuras de paréntesis en sus activaciones internas, ya que el dominio sintético Dyck permite un control total sobre la estructura de las secuencias.
- Evaluación de estrategias de optimización: el modelo sirve como banco de pruebas para comparar AdamW con otras variantes de optimizadores en un entorno controlado, gracias a la configuración explícita de tasas de aprendizaje diferenciadas.
- Estudio del efecto de la token dose: al variar el número de tokens de preentrenamiento y post-entrenamiento, se puede medir cómo afecta la cantidad de datos al aprendizaje de un lenguaje formal.
- Análisis de la reinicialización de embeddings: la transición entre vocabularios permite estudiar el impacto de reinicializar la capa de embedding en la transferencia de conocimiento entre dominios.
- Pruebas de generalización en lenguajes formales: se puede evaluar la capacidad del modelo para generalizar a secuencias de Dyck de mayor longitud o con más tipos de paréntesis que las vistas durante el entrenamiento.
- Educación y divulgación: sirve como ejemplo práctico de entrenamiento de un transformer pequeño con `nanochat`, mostrando el pipeline completo de preentrenamiento, post-entrenamiento y evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las únicas métricas disponibles son las de entrenamiento del checkpoint: `smooth_train_loss` 3.7601253986358643, `min_objective` 1.1445689201226077, `flops_used` 2.0778130937059738e+17 y `total_training_time` 85.36997103691101. Estas métricas no constituyen benchmarks comparativos con otros modelos.

## Requisitos de hardware

- VRAM estimada: el modelo tiene un número de parámetros no especificado, pero a partir de la configuración (16 capas, embedding 1024, vocabulario 256) se estima en torno a 200 millones de parámetros. En precisión fp32 ocuparía aproximadamente 800 MB, y en fp16 unos 400 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp32, por ejemplo una RTX 3060 o superior. También es posible ejecutarlo en CPU, aunque con menor rendimiento.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o RTX 4090.
- Opciones de despliegue: el modelo se distribuye como archivo `.pt` (PyTorch state_dict), por lo que se puede cargar directamente con PyTorch. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no se proporcionan pesos en formatos como safetensors o GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa detallada. Los modelos `kdyck_dose_100Mpt_200M_s2_2026-08-14_18-57-50_991681-pt` y `kdyck_dose_100Mpt_hfbody_200M_s2_2026-08-14_21-55-05_779086-pt`, del mismo autor, parecen ser variantes de la misma línea de experimentos, pero no se han publicado especificaciones comparables en la información disponible.

## Limitaciones y advertencias

- No apto para producción: es un checkpoint de investigación con un vocabulario sintético de 256 tokens, incapaz de generar lenguaje natural.
- Sesgos: no se ha realizado ninguna evaluación de sesgos, por lo que se desconocen los posibles sesgos presentes en el modelo.
- Riesgo de alucinación: en el dominio Dyck, el modelo puede generar secuencias desbalanceadas o inválidas si no ha generalizado correctamente las reglas del lenguaje formal.
- Limitaciones de idioma: el modelo final no soporta ningún idioma natural; solo genera tokens del vocabulario Dyck.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero el modelo no tiene utilidad práctica para aplicaciones comerciales.
- Caveat: el checkpoint se guardó en el paso 762 de un total de 1000 iteraciones, por lo que no corresponde al modelo final del entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/kdyck_dose_100Mpt_hfbody_adamwppt_5M_s2_2026-09-06_15-17-00_507508-pt
- Weights & Biases run: https://wandb.ai/alexksternteam/token_dose_100Mpt_adamw_seed_replicas_v1/runs/42d26yfk
- Repositorio nanochat: https://github.com/karpathy/nanochat
