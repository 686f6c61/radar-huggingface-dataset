# rchu233/openpi-pi05-robotwin-rgb-jax-fp32-ema-step2000

## Resumen

Este repositorio contiene un checkpoint intermedio (step 2000 de 30000) del modelo **openpi π₀.₅** (pi05) entrenado para la tarea de manipulación robótica **RoboTwin**, en su variante de entrada RGB. Lo publica el usuario `rchu233` y no es un modelo original, sino un artefacto de entrenamiento derivado del modelo base `pi05_base` del proyecto openpi (Physical Intelligence). El entrenamiento se ha realizado sobre el dataset `rchu233/robotwin2-aloha-rgb-lerobot` con el pipeline `scripts/train.py pi05_robotwin_rgb`.

El modelo es un *vision-language-action* (VLA) orientado a control robótico: recibe observaciones visuales y produce acciones motrices. Este checkpoint concreto se distribuye en formato nativo de JAX/Orbax (no safetensors ni GGUF), con pesos maestros en fp32, estado del optimizador AdamW y pesos EMA 0.99, pensado para reanudar el entrenamiento con `--resume` en el entorno openpi.

Es relevante porque expone un estado intermedio reproducible de un fine-tuning de π₀.₅ sobre RoboTwin, lo que permite a investigadores retomar el entrenamiento exactamente desde el step 2000 sin repetir el cómputo previo (loss ≈ 0.007 en el rango 1000–2000). El repositorio pesa 44,8 GB y no está pensado para inferencia directa de usuario final, sino como artefacto de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en openpi π₀.₅ (pi05); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos maestros en fp32; cómputo en bf16 durante entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Orbax checkpoint (JAX), con `params/` (EMA), `train_state/` (optimizador + params crudos) y `assets/` |

## Arquitectura y entrenamiento

El checkpoint pertenece a la familia openpi π₀.₅, un modelo VLA que combina percepción visual con generación de acciones para control robótico. La información disponible no detalla la arquitectura interna (número de parámetros, mecanismo de atención, integración visión-lenguaje-acción), por lo que no se puede especificar más allá de su naturaleza VLA y su implementación en JAX.

El entrenamiento se ejecutó con pesos en fp32 y AdamW, cómputo en bf16, EMA 0.99, batch de 64 y FSDP sobre 4 GPUs. El schedule de learning rate es warmup de 1000 pasos seguido de decaimiento coseno de 2,5e-5 a 2,5e-6 a lo largo de 30000 pasos. Se inicializó desde `pi05_base` y se entrenó sobre `rchu233/robotwin2-aloha-rgb-lerobot`. Este checkpoint corresponde al step 2000 y presenta una loss aproximada de 0,007 entre los pasos 1000 y 2000. El estado del optimizador y los parámetros crudos se incluyen para permitir reanudar el entrenamiento.

## Capacidades

- Control robótico a partir de observaciones RGB (entrada visual y salida de acciones motrices), orientado a tareas de manipulación tipo RoboTwin.
- Aprendizaje por imitación sobre el dataset Aloha/RoboTwin en formato LeRobot.
- Reanudación de entrenamiento: el checkpoint incluye `train_state/` con optimizador y parámetros crudos, más estadísticas de normalización en `assets/`.
- Seguimiento del entrenamiento mediante W&B (run `c0kl8l9e`, proyecto `openpi`).
- Capacidades de lenguaje, tool calling, agentes o multilingüismo: no disponibles en la información proporcionada.

## Casos de uso

- Reanudación de entrenamiento en openpi: descargar el checkpoint en `checkpoints/` y ejecutar `--resume` para continuar desde el step 2000 sin recalcular los pasos previos, aprovechando el `train_state` incluido.
- Investigación en manipulación robótica: evaluar el estado intermedio del fine-tuning de π₀.₅ sobre RoboTwin para estudiar la evolución de la política a lo largo del entrenamiento.
- Reproducibilidad de experimentos: comparar resultados con el run original de W&B (`c0kl8l9e`) y con otros checkpoints del mismo schedule.
- Fine-tuning posterior: usar los pesos EMA (`params/`) como inicialización para nuevas tareas o datasets dentro del ecosistema openpi.
- Análisis de convergencia: estudiar la curva de loss (≈ 0,007 en 1000–2000) para diagnosticar la dinámica de entrenamiento del modelo base.
- Benchmarking de políticas VLA: servir como referencia intermedia frente al modelo base `pi05_base` o al checkpoint final de 30k pasos en tareas RoboTwin.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento reportado es la loss de entrenamiento aproximada de 0,007 en el rango de pasos 1000–2000.

## Requisitos de hardware

- El repositorio ocupa 44,8 GB (12 GB de pesos EMA + 31 GB de `train_state`), por lo que se requiere espacio en disco suficiente para descarga y reanudación.
- Entrenamiento original: FSDP sobre 4 GPUs (modelo de GPU no especificado).
- Inferencia: no disponible; al ser un checkpoint de entrenamiento en Orbax/JAX, no se distribuye en formatos ligeros para consumer GPU.
- Despliegue: entorno openpi con JAX; no se indica soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Uso | Licencia |
|---|---|---|---|---|
| openpi-pi05-robotwin-rgb-jax-fp32-ema-step2000 (este) | VLA (π₀.₅ fine-tuned) | Orbax/JAX | Checkpoint intermedio para reanudar entrenamiento | no disponible |
| openpi `pi05_base` | VLA base | no disponible | Modelo base del que se inicializa | no disponible |
| Checkpoint final 30k del mismo run | VLA (π₀.₅ fine-tuned) | Orbax/JAX | Política entrenada completa | no disponible |

No se dispone de datos de parámetros, contexto ni rendimiento comparables en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio (step 2000 de 30000), no un modelo final; su rendimiento en tareas reales no está validado en la información disponible.
- No está pensado para inferencia directa de usuario final: el formato Orbax/JAX y la inclusión del estado del optimizador lo orientan a reanudar entrenamiento.
- Licencia no especificada: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Idiomas y sesgos no documentados.
- Riesgo de sobreajuste al dataset específico `robotwin2-aloha-rgb-lerobot`; la generalización a otras plataformas robóticas no está demostrada.
- Dependencia del entorno openpi y de las estadísticas de normalización en `assets/` (md5 `ec66b081…`); un desajuste puede invalidar la reanudación.

## Enlaces

- Hugging Face: https://huggingface.co/rchu233/openpi-pi05-robotwin-rgb-jax-fp32-ema-step2000
- Dataset de entrenamiento: https://huggingface.co/datasets/rchu233/robotwin2-aloha-rgb-lerobot
- Proyecto openpi (Physical Intelligence): no disponible en la información proporcionada
- Run de W&B: id `c0kl8l9e`, proyecto `openpi` (URL no disponible)
