# alexkstern/kdyck_dose_100Mpt_hfbody_adamwppt_100M_s0_2026-09-06_15-30-03_385582-pt

# Ficha del modelo: kdyck_dose_100Mpt_hfbody_adamwppt_100M_s0

## Resumen

Este modelo es un checkpoint experimental de un transformer GPT entrenado con la librería nanochat de Karpathy. Lo desarrolla el usuario alexkstern y se publica como parte de una serie de experimentos de investigación sobre el efecto de la "dosis de tokens" sintéticos en el preentrenamiento y post-entrenamiento de modelos pequeños. El objetivo es estudiar cómo la exposición a un dataset artificial de estructuras Dyck (paréntesis balanceados) tras el preentrenamiento en texto natural afecta a las capacidades del modelo.

El modelo se entrena en dos fases: primero con 100 millones de tokens de FineWeb (dataset de texto web en inglés, tokenizado con nanochat BPE) y después con 100 millones de tokens de un dataset sintético Dyck-K128 con secuencias de longitud 2048. La arquitectura es un decoder-only transformer de 16 capas, 8 cabezas de atención, 8 cabezas KV y dimensión de embedding 1024, con una ventana de contexto de 2048 tokens. Se trata de un checkpoint intermedio (paso 762 de 1000), no de un modelo final orientado a producción, sino de un artefacto para investigación en razonamiento estructural y transferencia de dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT) |
| Parametros totales | No disponible (config: 16 capas, 8 cabezas, 8 KV heads, 1024 embedding, vocab 65536) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el dataset de preentrenamiento es FineWeb, principalmente ingles, pero no se declara oficialmente) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state_dict (.pt) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT implementada en nanochat, sin modificaciones estructurales destacables: capas de atención con 8 cabezas y 8 cabezas KV (no se usa GQA con menos KV heads), MLP estándar y embeddings de tamaño 65536. El entrenamiento se divide en dos fases con una transición en la que se reinicializan los embeddings y se resetea el optimizador. La primera fase usa 100 millones de tokens de FineWeb-nanochatbpe-100M, con una tasa de aprendizaje trapezoidal (warmup 0%, warmdown 40%) y una LR de matriz de 0.02, embedding 0.3 y unembedding 0.004. La segunda fase usa 100 millones de tokens del dataset dyck-k128-seq_len_2048-1B, con vocab 256, LR de 0.0003 y warmdown del 100%. No se ha aplicado RLHF ni DPO. El entrenamiento se registró en W&B y el checkpoint se guardó en el paso 762, con una loss de entrenamiento suavizada de 3.75 y un objetivo mínimo de 1.14. El total de FLOPs usados es de 2.08e17.

## Capacidades

- Generacion de texto autoreg resiva basica, limitada al vocabulario de 65536 tokens del BPE de nanochat.
- Procesamiento de secuencias de hasta 2048 tokens, tanto en la fase de preentrenamiento como en la de post-entrenamiento.
- Capacidad de modelar estructuras Dyck (parentesis balanceados) tras la fase de post-entrenamiento, segun el diseno del experimento.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- No se han publicado evaluaciones de capacidades multilingues; el unico dataset declarado es FineWeb (ingles).
- El checkpoint es un artefacto de investigacion, no un modelo de proposito general con capacidades verificadas de razonamiento complejo.

## Casos de uso

- Investigacion en razonamiento estructural: el modelo se puede usar para estudiar como un transformer aprende lenguajes libres de contexto como Dyck-K128, comparando la loss y la precision en secuencias de parentesis balanceados.
- Estudios de transferencia de conocimiento: permite analizar el efecto del post-entrenamiento en un dominio sintetico sobre las representaciones aprendidas en texto natural, usando las herramientas de nanochat.
- Reproduccion de experimentos de "token dose": el checkpoint sirve como punto de referencia para replicar la serie de experimentos del autor sobre dosis de tokens sinteticos.
- Analisis de dinamicas de optimizacion: la configuracion documentada (LR separados, reinit de embeddings, reset de optimizador) permite estudiar el comportamiento del optimizador en transiciones de fase.
- Evaluacion de alucinaciones en tareas de parentesis: se puede probar si el modelo genera secuencias Dyck invalidas y medir la tasa de error, dado que el dataset de post-entrenamiento es altamente estructurado.
- Comparacion de estrategias de reinicializacion: el modelo se puede comparar con otros checkpoints de la misma serie (por ejemplo, con diferente seed o diferente dosis) para evaluar el impacto del reinit de embeddings en la convergencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la loss de entrenamiento del paso 762:

| Metrica | Valor |
|---|---|
| smooth_train_loss | 3.7526 |
| min_objective | 1.1419 |
| flops_used | 2.08e17 |
| total_training_time (s) | 124.64 |

No hay datos de MMLU, HumanEval, GSM8K ni ninguna evaluacion de capacidades generales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente; para un transformer de ~16 capas y 1024 de embedding, la inferencia en FP32 requiere aproximadamente 1-2 GB de VRAM, pero el numero exacto de parametros no se ha publicado.
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, RTX 3050, RTX 4060) es suficiente para cargar el checkpoint en PyTorch.
- Si cabe en consumer GPU: si, es un modelo pequeno que cabe en GPUs de consumo.
- Opciones de despliegue: no se proporcionan integraciones con vLLM, llama.cpp, Ollama ni TGI. El checkpoint esta en formato .pt, por lo que solo se puede cargar con PyTorch directamente.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se han encontrado modelos comparables en la informacion proporcionada. La serie de checkpoints de alexkstern (por ejemplo, kdyck_dose_100Mpt_5M_s0 y kdyck_dose_100Mpt_200M_s0) parece compartir la misma configuracion y objetivo experimental, pero no se dispone de datos de rendimiento ni de parametros completos para establecer una comparacion rigurosa.

## Limitaciones y advertencias

- Modelo experimental: es un checkpoint intermedio (paso 762 de 1000) y no se ha validado para uso en produccion.
- Sin evaluacion de calidad general: no hay benchmarks publicados, por lo que no se conocen las capacidades reales en tareas de lenguaje natural.
- Entrenamiento con dataset sintetico: la fase de post-entrenamiento con Dyck-K128 puede degradar las capacidades de lenguaje natural del modelo, ya que el dataset es artificial y muy especifico.
- Datos de entrenamiento limitados: solo 200 millones de tokens en total (100M de FineWeb y 100M de Dyck), una cantidad muy inferior a la de modelos de lenguaje modernos.
- Sesgos y seguridad: no se ha realizado ninguna evaluacion de sesgos, toxicidad ni comportamientos de seguridad.
- Formato de pesos: el checkpoint se distribuye como .pt (state_dict de PyTorch), no como safetensors ni GGUF, lo que limita su uso con herramientas estandar de inferencia.
- Licencia Apache-2.0 permite uso comercial, pero el modelo no es un producto viable por sus limitaciones de entrenamiento y ausencia de evaluaciones.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/kdyck_dose_100Mpt_hfbody_adamwppt_100M_s0_2026-09-06_15-30-03_385582-pt
- Registro de Weights & Biases: https://wandb.ai/alexksternteam/token_dose_100Mpt_adamw_seed_replicas_v1/runs/f8hxwgem
- Repositorio de nanochat: https://github.com/karpathy/nanochat
