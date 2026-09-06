# alexkstern/nca_dose_1Bpt_hfbody_adamwppt_1B_s1_2026-09-06_10-48-58_728534-pt

## Resumen

Este modelo es un checkpoint de entrenamiento experimental desarrollado por alexkstern utilizando la librería nanochat de Karpathy. Se trata de un transformer generativo de lenguaje entrenado en dos fases: un preentrenamiento (pt) sobre el dataset FineWeb, del cual se utilizaron 1.000 millones de tokens, y un ajuste posterior (ppt) sobre un dataset denominado «nca-paper-share200-2048», con otros 1.000 millones de tokens. El nombre del repositorio, «1Bpt», refleja precisamente esa dosis de 1.000 millones de tokens por fase.

La arquitectura es un transformer estándar con 16 capas, 8 cabezas de atención, 8 cabezas KV, dimensión de embedding de 1024 y una longitud de secuencia de 2048 tokens. El checkpoint se guardó en el paso 3.814, con una pérdida de entrenamiento suavizada de 3,17. Es un modelo de investigación, orientado a estudiar dinámicas de aprendizaje, transferencia de vocabulario y efectos de la dosis de tokens. Está disponible bajo licencia Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer generativo (GPT-like) con 16 capas, 8 cabezas de atención, 8 cabezas KV, dimensión de embedding 1024 y vocabulario de 65.536 tokens (preentrenamiento) o 10.004 tokens (ajuste posterior) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state_dict (.pt) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de un transformer estándar implementado en nanochat. Según la configuración de entrenamiento, tiene 16 capas, 8 cabezas de atención y 8 cabezas KV (sin grouped-query attention, ya que n_kv_head es igual a n_head). La dimensión de embedding es de 1024 y la longitud de secuencia es de 2048 tokens. El vocabulario varía según la fase: 65.536 tokens en el preentrenamiento y 10.004 tokens en el ajuste posterior, con reinicialización de las embeddings en la transición.

El entrenamiento se dividió en dos fases. La fase de preentrenamiento (pt) utilizó el dataset FineWeb con tokenización nanochatbpe y un total de 1.000 millones de tokens. La fase de ajuste posterior (ppt) utilizó el dataset «nca-paper-share200-2048» con otros 1.000 millones de tokens. En la transición entre fases se reinicializaron las embeddings y se reseteó el optimizador. El optimizador fue AdamW con learning rates diferenciados para matrices, embeddings y unembeddings, y una programación de learning rate en forma de trapecio. El checkpoint se guardó en el paso 3.814.

## Capacidades

- Generación de texto autónoma en el dominio del dataset FineWeb (contenido web general).
- No se ha documentado soporte para tool calling, function calling, agentes, visión o audio.
- No se ha documentado un modo de razonamiento explícito ni capacidades multilingües específicas.
- El modelo está diseñado para experimentación con nanochat, no para uso en producción.

## Casos de uso

- Investigación en dinámicas de aprendizaje: el checkpoint permite estudiar cómo cambia el modelo al pasar de un vocabulario de 65.536 a uno de 10.004 tokens, gracias a la reinicialización de embeddings.
- Reproducción de experimentos: al estar entrenado con nanochat y tener la configuración completa disponible, es útil para reproducir estudios sobre dosis de tokens y programación de learning rate.
- Comparación de semillas: existen réplicas con distintas semillas (seed_1, seed_2) para analizar la varianza en el entrenamiento.
- Fine-tuning para tareas específicas: el modelo base puede ajustarse para tareas de generación de texto en dominios concretos, aunque su tamaño es pequeño.
- Evaluación de transferencia de vocabulario: sirve para investigar el impacto de cambiar el vocabulario en el rendimiento de un modelo de lenguaje.
- Docencia y aprendizaje: al ser un modelo pequeño con código abierto (nanochat), es adecuado para enseñar el entrenamiento de transformers desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye métricas de entrenamiento (pérdida suavizada, FLOPs utilizados, tiempo total) y no contiene evaluaciones de tareas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- El repositorio tiene un tamaño de 3,0 GB, que incluye los pesos del modelo y posiblemente el estado del optimizador.
- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible. La configuración de entrenamiento indica un pico de 2.250 TFLOPS, lo que sugiere una GPU de gama alta (posiblemente una H100), pero no se especifica el modelo exacto.
- No se han publicado opciones de despliegue específicas. Al ser un checkpoint de PyTorch, puede convertirse a formatos como GGUF para su uso con llama.cpp, pero no se proporciona dicha conversión.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

En la búsqueda web se han encontrado otros checkpoints del mismo autor con nombres similares, pero no se dispone de información detallada sobre su configuración ni resultados de benchmarks. Por tanto, no es posible realizar una comparativa técnica rigurosa. Los checkpoints encontrados son:

- alexkstern/nca_dose_1Bpt_hfbody_1B_s2_2026-08-14_14-01-42_048775-pt
- alexkstern/nca_dose_1Bpt_hfbody_5M_s1_2026-08-14_05-39-21_493461-pt

## Limitaciones y advertencias

- Es un modelo experimental sin evaluaciones de seguridad ni sesgos documentados.
- El dataset FineWeb puede contener contenido no deseado o sesgos presentes en la web.
- No se han realizado pruebas de alucinación ni de fiabilidad.
- La longitud de contexto de 2.048 tokens es limitada para tareas que requieran contexto largo.
- El modelo no está diseñado para uso en producción; es un checkpoint de investigación.
- La licencia Apache-2.0 permite uso comercial, pero no hay garantías de rendimiento ni soporte.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/nca_dose_1Bpt_hfbody_adamwppt_1B_s1_2026-09-06_10-48-58_728534-pt
- Repositorio nanochat: https://github.com/karpathy/nanochat
- Registro de entrenamiento W&B: https://wandb.ai/alexksternteam/token_dose_1Bpt_adamw_seed_replicas_v1/runs/v4wgwjsm
- Checkpoint con seed 2: https://huggingface.co/alexkstern/nca_dose_1Bpt_hfbody_1B_s2_2026-08-14_14-01-42_048775-pt
- Checkpoint 5M: https://huggingface.co/alexkstern/nca_dose_1Bpt_hfbody_5M_s1_2026-08-14_05-39-21_493461-pt
