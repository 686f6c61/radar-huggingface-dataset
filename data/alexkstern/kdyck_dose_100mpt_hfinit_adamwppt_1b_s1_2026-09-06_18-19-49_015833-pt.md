# alexkstern/kdyck_dose_100Mpt_hfinit_adamwppt_1B_s1_2026-09-06_18-19-49_015833-pt

## Resumen

El modelo `kdyck_dose_100Mpt_hfinit_adamwppt_1B_s1_2026-09-06_18-19-49_015833-pt` es un checkpoint experimental de investigación desarrollado por Alex Kstern dentro del ecosistema de [nanochat](https://github.com/karpathy/nanochat). Se trata de un transformer denso de 16 capas con 8 cabezas de atención y una dimensión de embedding de 1024, entrenado en dos fases: un preentrenamiento con 100 millones de tokens de `FineWeb` (subset `nanochatbpe-100M`) y un post-preentrenamiento (PPT) con 1.000 millones de tokens de un dataset sintético de lenguaje Dyck (`dyck-k128-seq_len_2048-1B`). El objetivo del experimento es estudiar el efecto de la "dosis de tokens" y del post-preentrenamiento sobre la capacidad de los modelos para capturar dependencias estructurales de largo alcance.

El checkpoint se guarda en el paso 1.525, con una pérdida de entrenamiento suavizada de 3,6058 y un `min_objective` de 1,1373. No se han publicado evaluaciones de capacidades generales ni benchmarks de tareas estándar, por lo que el modelo debe considerarse una pieza de investigación para análisis de representaciones y ablaciones, no un modelo listo para producción. La licencia es Apache-2.0, lo que permite uso comercial, pero el estado del proyecto es claramente experimental.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (GPT-like) |
| Parametros totales | No disponible (la config sugiere una estimacion no oficial de ~338M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (state_dict) |

## Arquitectura y entrenamiento

El modelo es un transformer estándar tipo GPT con 16 capas, 8 cabezas de atención (y 8 cabezas KV), dimensión de embedding de 1024 y un vocabulario de 65.536 tokens. La longitud de contexto es de 2048 tokens. No es un modelo de mezcla de expertos ni utiliza arquitecturas híbridas o de estado de espacio.

El entrenamiento se divide en dos fases diferenciadas. La primera fase es un preentrenamiento convencional sobre 100 millones de tokens de `FineWeb` (subset `nanochatbpe-100M`). La segunda fase es un post-preentrenamiento (PPT) sobre 1.000 millones de tokens de un dataset sintético de lenguaje Dyck con k=128 y longitud de secuencia 2048. En la transición entre fases se reinicializan las embeddings del modelo y se resetea el optimizador. Se utiliza el optimizador AdamW con tasas de aprendizaje diferenciadas para las matrices de pesos (0,02), las embeddings (0,3) y la capa de salida (0,004). No se aplica weight decay. El entrenamiento no incluye RLHF ni DPO, y no se ha realizado ningún ajuste por instrucciones.

## Capacidades

- Generación de texto: el modelo es un modelo de lenguaje pequeño, pero no se han publicado evaluaciones de calidad general ni de fluidez.
- Razonamiento estructural: está entrenado específicamente con datos Dyck (paréntesis balanceados), por lo que potencialmente puede capturar dependencias de largo alcance y estructuras jerárquicas.
- Tool calling / function calling: no disponible; no hay evidencia de soporte.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo no ha sido evaluado en tareas de agente.
- Capacidades multilingües: no disponible; los datos de FineWeb son principalmente en inglés, pero no se especifica.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigación en post-preentrenamiento: el modelo permite estudiar cómo un preentrenamiento en lenguaje natural seguido de un PPT con datos sintéticos Dyck afecta a la representación de estructuras de paréntesis en transformers.
- Evaluación de "token dose": puede usarse para comparar la eficiencia de tokens entre configuraciones con distinto número de tokens de preentrenamiento y post-preentrenamiento (por ejemplo, 100M vs 200M).
- Análisis de gramáticas libres de contexto: el dataset Dyck-k128 con secuencias de 2048 tokens es adecuado para probar los límites de la capacidad de los transformers para aprender dependencias anidadas.
- Ablación de hiperparámetros: la configuración incluye tasas de aprendizaje diferenciadas, reinicialización de embeddings y reset del optimizador, lo que permite aislar el efecto de cada componente.
- Comparación de arquitecturas: el checkpoint puede compararse con otras variantes de la familia `kdyck_dose` para estudiar el impacto de la profundidad y la escala.
- Reproducibilidad de experimentos: el repositorio incluye el estado de RNG, la configuración completa y las métricas de entrenamiento, lo que facilita la replicación del experimento y el análisis de la dinámica de pérdidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Las únicas métricas proporcionadas son de entrenamiento:

| Metrica | Valor |
|---|---|
| Paso | 1.525 |
| Pérdida de entrenamiento suavizada | 3,6058 |
| `min_objective` | 1,1373 |
| FLOPs utilizados | 2,079e17 |
| Tiempo total de entrenamiento | 652,01 segundos |

Estas métricas no son comparables con evaluaciones estándar como MMLU, HumanEval o GSM8K, por lo que no se puede determinar el rendimiento del modelo en tareas generales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. El repositorio tiene un tamaño de 3,0 GB, por lo que la carga completa del checkpoint en memoria puede requerir al menos 3 GB de RAM o VRAM.
- GPU recomendadas: no se ha especificado. Dado el tamaño de la configuración (16 capas, 1024 de embedding), cualquier GPU con más de 4 GB de VRAM debería ser suficiente para la carga, aunque no hay datos de latencia.
- Compatibilidad con GPU de consumo: probablemente sí, pero no hay confirmación oficial.
- Opciones de despliegue: no se ha publicado soporte para vLLM, llama.cpp, Ollama ni TGI. El checkpoint es un `state_dict` de PyTorch, por lo que requiere código personalizado de nanochat para cargarlo y ejecutarlo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Se comparan modelos de escala similar o del mismo ecosistema de investigación. No hay datos de rendimiento disponibles.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo | No disponible (estimacion ~338M) | 2048 | Apache-2.0 | Checkpoint PyTorch `.pt` |
| GPT-2 small | 124M | 1024 | MIT | Ampliamente disponible en HuggingFace |
| `kdyck_dose_100Mpt_200M_s0` (variante) | No disponible | No disponible | Apache-2.0 | Checkpoint PyTorch `.pt` |
| `kdyck_dose_100Mpt_hfinit_1B_s1` (variante) | No disponible | No disponible | Apache-2.0 | Checkpoint PyTorch `.pt` |

La comparación con GPT-2 small es aproximada en cuanto a arquitectura, pero no se puede establecer una comparación de rendimiento porque no hay benchmarks publicados.

## Limitaciones y advertencias

- Modelo experimental de investigación, no diseñado para uso general ni para producción.
- Tamaño pequeño (config de ~338M estimados) y preentrenamiento limitado a 100 millones de tokens, lo que implica una alta probabilidad de alucinación y baja calidad de generación en texto libre.
- Sin alineación (sin RLHF ni DPO), por lo que no sigue instrucciones ni conversa de forma útil.
- El post-preentrenamiento se realizó con datos sintéticos Dyck, lo que limita la transferencia a lenguaje natural.
- Los idiomas soportados no están especificados; el preentrenamiento con FineWeb sugiere un sesgo hacia inglés.
- Contexto limitado a 2048 tokens, lo que restringe tareas que requieren ventanas largas.
- Licencia Apache-2.0 permite uso comercial, pero no hay garantías de calidad ni de seguridad.
- No se han publicado benchmarks, por lo que el rendimiento real en tareas estándar es desconocido.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/kdyck_dose_100Mpt_hfinit_adamwppt_1B_s1_2026-09-06_18-19-49_015833-pt
- W&B run: https://wandb.ai/alexksternteam/token_dose_100Mpt_adamw_seed_replicas_v1/runs/f8trokp6
- Repositorio nanochat: https://github.com/karpathy/nanochat
- Checkpoint relacionado: https://huggingface.co/alexkstern/kdyck_dose_100Mpt_200M_s0_2026-08-14_18-41-11_852802-pt
- Checkpoint relacionado: https://huggingface.co/alexkstern/kdyck_dose_100Mpt_hfinit_1B_s1_2026-08-14_05-56-09_389711-pt
