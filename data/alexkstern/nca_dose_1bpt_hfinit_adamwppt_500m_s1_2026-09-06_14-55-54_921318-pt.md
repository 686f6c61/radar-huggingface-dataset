# alexkstern/nca_dose_1Bpt_hfinit_adamwppt_500M_s1_2026-09-06_14-55-54_921318-pt

## Resumen

Este modelo es un checkpoint experimental de un modelo de lenguaje causal desarrollado por alexkstern dentro del marco de la librería nanochat. Su nombre indica que forma parte de un estudio sobre "dosis de tokens" (token dose), con una fase de pre-entrenamiento (pt) de 1.000 millones de tokens sobre el dataset FineWeb y una fase posterior (ppt) de 500 millones de tokens sobre un dataset llamado "nca-paper-share200-2048". La arquitectura es un transformer denso tipo GPT con 16 capas, 8 cabezas de atención y una dimensión de embedding de 1024, con una longitud de contexto de 2048 tokens. El repositorio contiene el checkpoint en el paso 3.814, con una pérdida de entrenamiento suavizada de 3.167. Se trata de un experimento de investigación sin benchmarks publicados ni documentación de uso, por lo que su relevancia práctica actual es limitada. La licencia Apache 2.0 permite su uso y modificación, pero no hay garantías de calidad ni soporte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (GPT-like), 16 capas, 8 cabezas de atencion, 8 KV heads, embedding de 1024 |
| Parametros totales | no disponible (el nombre del repo sugiere ~500M, pero no se confirma en la informacion) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el pre-entrenamiento usa FineWeb, probablemente predominio de ingles, no confirmado) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch .pt (state_dict) y JSON de configuracion |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso con 16 capas, 8 cabezas de atencion, 8 cabezas KV y 1024 dimensiones de embedding. No utiliza arquitectura MoE ni mecanismos de atencion lineal. El entrenamiento se divide en dos fases: una fase de pre-entrenamiento (pt) con 1.000 millones de tokens del dataset "fineweb-nanochatbpe-20B" y un vocabulario de 65.536 tokens; y una fase posterior (ppt) con 500 millones de tokens del dataset "nca-paper-share200-2048" y un vocabulario reducido a 10.004 tokens. En la transicion entre fases se re-inicializan las embeddings y se reinicia el optimizador. Se utiliza una programacion de learning rate trapezoidal con 40% de warmdown y lr final 0. El optimizador es AdamW, con learning rates diferenciados para matrices (0.02), embeddings (0.3) y unembedding (0.004) en la fase pt; la fase ppt usa un lr de 3e-05. No se menciona uso de RLHF ni DPO. El checkpoint corresponde al paso 3.814, con 2.08e18 FLOPs consumidos y 2.080.374.784 FLOPs por token.

## Capacidades

No se especifican capacidades en la informacion disponible. Basandose en la arquitectura, se trata de un modelo de lenguaje causal que genera texto token a token. No hay evidencia de soporte para tool calling, function calling, agentes, vision, audio, modo de pensamiento ni otras capacidades especiales. El modelo no ha sido evaluado publicamente, por lo que no es posible confirmar su rendimiento en tareas especificas.

## Casos de uso

La informacion proporcionada no documenta casos de uso especificos para este modelo. Se trata de un checkpoint experimental de investigacion sin aplicaciones validadas ni documentacion de despliegue. Por tanto, no es posible listar casos de uso concretos sin especular. No se recomienda su uso en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio tiene un tamano de 3.0 GB, lo que sugiere que los pesos en FP32 ocupan aproximadamente 2 GB, pero no se confirma el numero exacto de parametros ni la VRAM necesaria.
- GPU recomendadas: no disponible.
- Compatibilidad con consumer GPU: no especificada. Por tamano, podria caber en una GPU con 4 GB de VRAM, pero no hay datos oficiales.
- Opciones de despliegue: el checkpoint esta en formato PyTorch .pt, por lo que se puede cargar con PyTorch. No se ha documentado compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Los siguientes modelos son checkpoints del mismo autor dentro del mismo proyecto "nca_dose", pero no se dispone de datos de rendimiento para comparar:

| Modelo | Parametros | Contexto | Licencia | Formato | Benchmarks |
|---|---|---|---|---|---|
| nca_dose_1Bpt_hfinit_adamwppt_500M_s1 | no disponible (~500M segun nombre) | 2048 | Apache 2.0 | PyTorch .pt | no disponible |
| nca_dose_1Bpt_hfinit_500M_s0 | no disponible (~500M segun nombre) | 2048 | Apache 2.0 | PyTorch .pt | no disponible |
| nca_dose_1Bpt_hfinit_20M_s0 | no disponible (~20M segun nombre) | 2048 | Apache 2.0 | PyTorch .pt | no disponible |

No se han publicado resultados de benchmarks ni evaluaciones comparativas para ninguno de estos checkpoints.

## Limitaciones y advertencias

- Sesgos conocidos: no evaluados. No hay estudios de sesgos disponibles.
- Riesgo de alucinacion: no evaluado. No se ha medido la fidelidad del modelo.
- Limitaciones de contexto: la ventana es de 2048 tokens, lo que puede ser insuficiente para tareas que requieren contexto largo.
- Limitaciones de idioma: los idiomas soportados no estan especificados. El pre-entrenamiento usa FineWeb, que es mayoritariamente ingles, por lo que el rendimiento en otros idiomas es probablemente deficiente.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el modelo es experimental y no ofrece garantias de calidad.
- El dataset de post-entrenamiento "nca-paper-share200-2048" parece contener solo 200 muestras, lo que puede limitar la calidad del ajuste posterior.
- El checkpoint no esta integrado con frameworks de inferencia estandar, lo que dificulta su uso en pipelines de produccion.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/nca_dose_1Bpt_hfinit_adamwppt_500M_s1_2026-09-06_14-55-54_921318-pt
- Repositorio nanochat: https://github.com/karpathy/nanochat
- W&B run: https://wandb.ai/alexksternteam/token_dose_1Bpt_adamw_seed_replicas_v1/runs/vl6x98wi
- Otros checkpoints del mismo autor:
  - https://huggingface.co/alexkstern/nca_dose_1Bpt_hfinit_500M_s0_2026-08-14_13-02-03_921837-pt
  - https://huggingface.co/alexkstern/nca_dose_1Bpt_hfinit_20M_s0_2026-08-14_10-45-35_772377-pt
