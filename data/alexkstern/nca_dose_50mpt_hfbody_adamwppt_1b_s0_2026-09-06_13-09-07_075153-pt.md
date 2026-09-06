# alexkstern/nca_dose_50Mpt_hfbody_adamwppt_1B_s0_2026-09-06_13-09-07_075153-pt

## Resumen

Este modelo es un checkpoint experimental de lenguaje natural entrenado con la librería `nanochat` de Karpathy, publicado por el usuario `alexkstern`. Forma parte de una serie de experimentos denominada `token_dose_50Mpt_adamw_seed_replicas_v1`, cuyo objetivo parece ser estudiar el efecto de la cantidad de tokens de pretraining y post-entrenamiento en un modelo pequeño. El checkpoint se corresponde con el paso 762 de un total de 1000 iteraciones, y la configuración indica una fase inicial de 50 millones de tokens (`pt_tokens`) y una fase posterior de 1.000 millones de tokens (`ppt_tokens`).

La arquitectura es un Transformer GPT con 16 capas, 8 cabezas de atención, 8 cabezas KV y una dimensión de embedding de 1024. La longitud de contexto es de 2048 tokens y el vocabulario principal está fijado en 65536 entradas, aunque en la fase posterior se utiliza un vocabulario reducido de 10004 entradas. El peso del repositorio es de 2,9 GB, correspondiente a un checkpoint en formato PyTorch. No se ha publicado documentación sobre capacidades, benchmarks o casos de uso, por lo que debe considerarse un artefacto de investigación, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer GPT (nanochat) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2048 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

El modelo es un Transformer GPT estándar, entrenado con la librería `nanochat`. Según la configuración proporcionada, tiene 16 capas, 8 cabezas de atención, 8 cabezas KV, dimensión de embedding 1024 y longitud de secuencia 2048. El vocabulario de la fase principal (`pt`) es de 65536 tokens, mientras que la fase posterior (`ppt`) emplea un vocabulario de 10004 tokens, con reinicialización de embeddings y reinicio del optimizador en la transición.

El proceso de entrenamiento se divide en dos fases. La primera utiliza 50 millones de tokens del dataset `fineweb-nanochatbpe-100M`, y la segunda emplea 1.000 millones de tokens del dataset `nca-paper-share200-2048`. Se utilizó el optimizador AdamW con tasas de aprendizaje independientes para matrices, embeddings y unembedding, y un programa de aprendizaje en forma de trapezoide (`lr_trapezoid`). La configuración indica que se aplicó compilación del modelo (`compile_model: true`) y que el checkpoint se guardó al final del entrenamiento. No se mencionan técnicas como RLHF o DPO. El único dato de rendimiento reportado es una pérdida suavizada de entrenamiento de 4,230953 en el paso 762.

## Capacidades

La información disponible no documenta capacidades específicas del modelo. No se han publicado descripciones de funcionalidades, tareas de evaluación o pruebas de comportamiento. A continuación se enumeran las categorías evaluadas, con el estado "no disponible":

- Generación de texto: no disponible
- Razonamiento: no disponible
- Generación de código: no disponible
- Matemáticas: no disponible
- Visión: no disponible
- Tool calling / function calling: no disponible
- Soporte de agentes o razonamiento multi-paso: no disponible
- Capacidades multilingües: no disponible
- Modo de pensamiento (thinking mode), audio u otras capacidades especiales: no disponible

## Casos de uso

No se han publicado casos de uso específicos para este checkpoint en la información disponible. Al tratarse de un modelo experimental sin validación externa, no se recomienda su uso en producción. Cualquier aplicación práctica requeriría una evaluación previa de calidad, seguridad y adecuación a la tarea, que no está disponible en este momento. Por lo tanto, los casos de uso concretos se consideran "no disponibles".

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato numérico reportado es la pérdida de entrenamiento suavizada (`smooth_train_loss`) de 4,230953 en el paso 762, así como el valor de `min_objective` de 1,2391207363597656. No se proporcionan resultados de evaluaciones como MMLU, HumanEval, GSM8K u otros conjuntos de referencia. La configuración incluye un conjunto de evaluación adicional (`c4-nanochatbpe-10B`), pero no se han publicado sus resultados.

## Requisitos de hardware

- El checkpoint ocupa 2,9 GB en disco, en formato PyTorch.
- La configuración de entrenamiento utilizó `device_batch_size: 16`, `grad_accum_steps: 1` y un `peak_tflops` de 2250, pero estos datos corresponden al entorno de entrenamiento, no a requisitos de inferencia.
- No se han publicado requisitos de VRAM ni recomendaciones de GPU para inferencia.
- No se dispone de información sobre latencia o throughput estimados.
- Al ser un modelo experimental sin soporte documentado para motores de inferencia, las opciones de despliegue se consideran "no disponibles".

## Comparativa con modelos similares

Existen otros checkpoints de la misma serie publicados por el mismo autor en HuggingFace, aunque no se dispone de sus especificaciones ni benchmarks. A continuación se muestra una comparación limitada basada en los nombres de los repositorios:

| Modelo | Fecha de publicación | Notas |
|---|---|---|
| `alexkstern/nca_dose_50Mpt_hfbody_5M_s0_2026-08-14_17-26-27_448317-pt` | 2026-08-14 | Pertenece a la misma familia de experimentos de token dose, con 5M de tokens de pretraining. Especificaciones no disponibles. |
| `alexkstern/nca_dose_50Mpt_hfbody_500M_s0_2026-08-14_18-10-45_510563-pt` | 2026-08-14 | Pertenece a la misma serie, con 500M de tokens de pretraining. Especificaciones no disponibles. |
| `alexkstern/nca_dose_50Mpt_hfbody_adamwppt_1B_s0_2026-09-06_13-09-07_075153-pt` | 2026-09-06 | Modelo objeto de esta ficha, con 50M tokens de pretraining y 1B tokens de fase posterior. |

No se ha identificado ninguna comparativa con modelos similares de otras fuentes que esté respaldada por datos en la información disponible.

## Limitaciones y advertencias

- Se trata de un checkpoint intermedio de un experimento de investigación, con un número muy reducido de tokens de pretraining (50M), lo que limita su calidad y generalización.
- No se ha realizado ninguna evaluación externa de sesgos, robustez o alucinaciones.
- La longitud de contexto es de 2048 tokens, lo que limita el manejo de documentos largos.
- Los idiomas soportados no están especificados; el dataset principal (`fineweb-nanochatbpe-100M`) suele estar compuesto principalmente por texto en inglés, pero esto no se confirma en la información proporcionada.
- No se ha sometido a procesos de alineación (RLHF, DPO, etc.), por lo que el comportamiento puede ser impredecible en tareas de seguimiento de instrucciones.
- El formato de pesos es PyTorch y no se ofrecen versiones cuantizadas ni integraciones con motores de inferencia estándar como vLLM, llama.cpp u Ollama.
- La licencia Apache 2.0 permite el uso comercial, pero no existe ninguna garantía de rendimiento o idoneidad para un fin concreto.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/nca_dose_50Mpt_hfbody_adamwppt_1B_s0_2026-09-06_13-09-07_075153-pt
- Weights & Biases: https://wandb.ai/alexksternteam/token_dose_50Mpt_adamw_seed_replicas_v1/runs/1ic3y079
- Repositorio nanochat: https://github.com/karpathy/nanochat
- Otros modelos de la serie en HuggingFace:
  - https://huggingface.co/alexkstern/nca_dose_50Mpt_hfbody_5M_s0_2026-08-14_17-26-27_448317-pt
  - https://huggingface.co/alexkstern/nca_dose_50Mpt_hfbody_500M_s0_2026-08-14_18-10-45_510563-pt
