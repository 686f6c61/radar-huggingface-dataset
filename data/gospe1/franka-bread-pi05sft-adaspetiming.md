# Gospe1/Franka-Bread-pi05SFT-AdaSpeTiming

## Resumen

Franka-Bread-pi05SFT-AdaSpeTiming es un modelo de visión-lenguaje-acción (VLA) para robótica de manipulación, publicado por el usuario Gospe1 en Hugging Face. Se trata de una ablación del denominado AdaSpeVLA en su etapa de acciones B-spline: la política base es el checkpoint SFT de π0.5 `dddddsds31341/Franka-Bread-pi05-step-20000`, congelado sin modificaciones, al que se le añade y entrena únicamente una cabeza de temporización (query-interval head). El modelo no genera acciones nuevas: decide cuántos comandos de cada chunk de 10 pasos ejecutar antes de volver a consultar la política.

La tarea concreta es recoger dos rebanadas de pan de una tostadora y colocarlas en un plato, sobre un brazo Franka. El repositorio (5,3 GB) contiene los pesos completos en formato OpenPI/Orbax, las estadísticas de normalización del baseline y el código del modelo (`code/pi05_timing.py`). Es relevante como pieza de investigación sobre control temporal adaptativo en políticas VLA, no como modelo de propósito general.

La información disponible es exclusivamente la model card del autor. No hay datos de benchmarks estándar, idiomas soportados, ni resultados en robot real; la única validación publicada es un chequeo open-loop sobre 512 frames del propio dataset de entrenamiento, que el autor advierte explícitamente que no constituye una afirmación de generalización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA basada en π0.5 (transformer visión-lenguaje-acción) con cabeza de temporización AdaSpeVLA (LayerNorm + MLP de 128 unidades ocultas) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos almacenados en bfloat16; cabeza de timing en float32) |
| Idiomas soportados | no disponible (prompt de tarea en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenPI/Orbax (`params/`); código Python/JAX (Flax NNX) |
| Horizonte de acción | 16 (chunk de 10 comandos de 0,1 s) |
| Rango de intervalo de consulta | 0,2–1,0 s (1,0 s = longitud del chunk π0.5) |
| Dataset de entrenamiento | `dddddsds31341/bread-lerobot` @ `a45b8ba` (100 episodios, 28.380 frames) |
| Tamaño del repositorio | 5,3 GB |

## Arquitectura y entrenamiento

El modelo reutiliza íntegramente la política π0.5 SFT del baseline, almacenada en bfloat16 y bit-idéntica tras el redondeo a bfloat16. Sobre ella se añade una cabeza de temporización que recibe como entrada los estados ocultos del prefijo de π0.5 (vista base, vista de muñeca y prompt), el horizonte de la etiqueta en escala logarítmica y el chunk de 10 acciones muestreado, y predice el intervalo hasta la siguiente consulta. La cabeza es un LayerNorm seguido de un MLP con 128 unidades ocultas.

El entrenamiento congela todo excepto la cabeza de timing: 10.000 pasos, batch 32, AdamW con LR coseno y pico 2,5e-5, EMA 0,99, semilla 0, con los valores por defecto de OpenPI. Las etiquetas siguen la receta de la etapa de timing de AdaSpeVLA (2026-11-10): tiempo hasta el primer evento de movimiento o de pinza dentro de una ventana de 16 frames (1,5 s), con eventos de movimiento derivados de offsets de pose medidos (calibración de pan: e_crit 10,01) y eventos de pinza del estado comandado abierto/cerrado. La pérdida es el error cuadrático sobre el logaritmo del intervalo, con etiquetas superiores a 1,0 s recortadas.

La innovación es puramente de control temporal: en lugar de ejecutar siempre el chunk completo, el sistema decide cuántos comandos ejecutar (`ceil(intervalo / 0,1)`, extendido si se predice un cambio de pinza en el chunk, con tope de 10) antes de volver a consultar la política.

## Capacidades

- Generación de acciones de manipulación robótica (7 dimensiones utilizadas de las 32 del chunk normalizado de π0.5) para un brazo Franka en la tarea de transporte de pan.
- Predicción de intervalo de consulta (`query_interval`, en segundos) y número de comandos a ejecutar antes de reconsultar (`execute_steps`).
- Percepción multimodal: vista base y vista de muñeca, más prompt de tarea en lenguaje natural.
- Control temporal adaptativo de la ejecución de chunks de acción.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso en el sentido de agentes de texto.
- Capacidades multilingües: no disponibles; el prompt de tarea está en inglés.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del dominio robótico.

## Casos de uso

- Investigación en control temporal de políticas VLA: usar la cabeza de timing como ablación para medir cuánto aporta la etapa B-spline de AdaSpeVLA frente a la ejecución fija de chunks, comparando ambas variantes sobre el mismo baseline congelado.
- Replicación de experimentos: cargar los pesos con el código proporcionado e integrarlos en el paquete `adaspe/` del repositorio `Jack414b/adaspevla_train` para reproducir el chequeo open-loop publicado.
- Evaluación de estrategias de reconsultación: comparar ejecución de 1 a 10 comandos por consulta y medir el efecto en latencia de control y suavidad de trayectoria, dado que la cabeza predice el intervalo en lugar de fijarlo.
- Base para fine-tuning de la cabeza en nuevas tareas: al estar congelada la política π0.5, se puede reentrenar solo la cabeza de timing sobre un dataset LeRobot propio con etiquetas de eventos de movimiento y pinza.
- Estudio de sesgos en cabezas auxiliares: el comportamiento observado (concentración en el centro del rango, 22 % de predicciones en el tope de 1,0 s frente al 67 % de las etiquetas) sirve como caso de análisis de regresión sobre etiquetas desbalanceadas.
- Docencia y divulgación: ejemplo compacto de arquitectura VLA con módulo de decisión temporal, útil para explicar el pipeline OpenPI/Orbax y el formato de pesos.

## Benchmarks y rendimiento

Chequeo open-loop publicado por el autor sobre 512 frames fijos del dataset (vistos en entrenamiento; sin afirmación de generalización):

| Métrica | Valor |
|---|---|
| MAE frente a etiqueta | 0,132 s |
| Correlación con etiqueta | 0,80 |
| Media predicha / etiqueta | 0,76 s / 0,81 s |
| Proporción ≤ 0,3 s, predicha / etiqueta | 6,6 % / 14,5 % |
| Proporción en el tope de 1,0 s, predicha / etiqueta | 22 % / 67 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) ni resultados en robot real en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 5,3 GB en bfloat16, por lo que se requiere al menos ese orden de magnitud de memoria más el overhead de JAX/Flax.
- GPU recomendadas: no disponible en la información proporcionada. El stack es JAX/Flax NNX, por lo que se necesitan GPUs compatibles con JAX (NVIDIA con CUDA o aceleradores TPU).
- GPU de consumo: no confirmado; el tamaño de pesos sugiere que podría caber en GPUs con 8–16 GB, pero no hay dato publicado.
- Opciones de despliegue: carga mediante JAX + Flax NNX y `openpi.models.model.restore_params`; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Franka-Bread-pi05SFT-AdaSpeTiming | VLA π0.5 + cabeza de timing | no disponible | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| `dddddsds31341/Franka-Bread-pi05-step-20000` | VLA π0.5 SFT baseline | no disponible | no disponible | no disponible | Hugging Face |
| AdaSpeVLA (etapa B-spline completa) | VLA con acciones B-spline | no disponible | no disponible | no disponible | Repositorio `Jack414b/adaspevla_train` |

No se dispone de datos de rendimiento comparables entre estas variantes en la información proporcionada; la única diferencia documentada es que este modelo sustituye la etapa de acciones B-spline por una cabeza de temporización sobre acciones congeladas del baseline.

## Limitaciones y advertencias

- El autor advierte que el chequeo open-loop usa frames vistos en entrenamiento y no constituye una afirmación de generalización.
- No se incluyen resultados en robot real.
- La cabeza de timing está sesgada hacia el centro del rango: predice el 22 % en el tope de 1,0 s frente al 67 % de las etiquetas, y solo el 6,6 % por debajo de 0,3 s frente al 14,5 % de las etiquetas.
- Modelo específico de una única tarea (recoger pan de la tostadora y colocarlo en el plato) y de un único entorno; no es un modelo generalista.
- Riesgo de alucinación en el sentido de predicciones de acción no válidas fuera de la distribución de entrenamiento; el autor recomienda validar orden de observaciones, unidades, normalización y límites del espacio de trabajo antes de ejecutar en hardware.
- No hay información sobre sesgos demográficos, lingüísticos o de otro tipo; el dominio es robótico y el dataset es de 100 episodios.
- La licencia Apache 2.0 permite uso comercial, pero la aplicabilidad práctica fuera de investigación es muy limitada por la especialización del modelo.
- Dependencia de código externo (`adaspevla_train`, `adaspe.bspline`, `adaspe.model`) no incluido en el repositorio, lo que complica la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Gospe1/Franka-Bread-pi05SFT-AdaSpeTiming
- Baseline π0.5 SFT: https://huggingface.co/dddddsds31341/Franka-Bread-pi05-step-20000
- Dataset de entrenamiento: https://huggingface.co/datasets/dddddsds31341/bread-lerobot
- Repositorio de código AdaSpeVLA: https://github.com/Jack414b/adaspevla_train
