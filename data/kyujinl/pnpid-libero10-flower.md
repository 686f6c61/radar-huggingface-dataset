# KyujinL/pnpid-libero10-flower

## Resumen

PnPID FLOWER LIBERO-10 checkpoints es un conjunto de pesos para modelos de tipo VLA (vision-language-action) orientados a robótica, publicados por el usuario KyujinL en Hugging Face. El repositorio contiene checkpoints FLOWER afinados sobre el benchmark LIBERO-10, partiendo de los pesos preentrenados `mbreuss/flower_vla_pret` (concretamente el fichero `360000_model_weights.pt`). Se distribuyen dos variantes: `vanilla`, que corresponde al modelo FLOWER original con `model.use_aux_loss=false`, y `ours`, que incorpora una pérdida auxiliar de dinámica inversa con `model.use_aux_loss=true`.

El problema que aborda es el control de políticas visomotoras en tareas de manipulación de horizonte largo, evaluadas en el benchmark LIBERO-10 con 50 ensayos por tarea. La relevancia actual es acotada: se trata de un artefacto de investigación reproducible (checkpoints más configuración Hydra) más que de un modelo listo para producción. El único resultado publicado en la model card corresponde a `vanilla/seed42/step30k/` con una tasa de éxito de 0,880 durante el entrenamiento.

El tamaño del repositorio es de 7,8 GB, lo que es coherente con un transformer VLA de escala media que incluye pesos del modelo y pesos EMA. No se especifican en la información disponible el número de parámetros, la longitud de contexto ni los idiomas soportados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en FLOWER; detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en `model.ckpt`, formato Lightning) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoint de PyTorch Lightning (`model.ckpt`) con pesos EMA en `callbacks.EMA.ema_weights`; configuración Hydra en `.hydra/` |

## Arquitectura y entrenamiento

La arquitectura concreta no se detalla en la información disponible más allá de que se trata de un modelo VLA denominado FLOWER, con un flag `model.use_aux_loss` que activa o desactiva una pérdida auxiliar de dinámica inversa. La variante `ours` emplea esa pérdida auxiliar, mientras que `vanilla` no la usa. El punto de partida es el checkpoint preentrenado `mbreuss/flower_vla_pret` (`360000_model_weights.pt`), sobre el que se realiza un ajuste fino específico para LIBERO-10.

El entrenamiento se ejecutó con 4 GPUs, batch de 4 por GPU y acumulación de gradiente de 2, resultando en un batch global de 32, durante 30 000 pasos de optimizador (30 épocas × 1000 pasos). Se aplicó EMA con decay 0,999 y el cargador de evaluación utiliza los pesos EMA. Los checkpoints publicados eliminan `optimizer_states` pero conservan los pesos del modelo y los pesos EMA idénticos al checkpoint original. Cada carpeta incluye la configuración Hydra completa de la ejecución (`config.yaml`, `hydra.yaml`, `overrides.yaml`), lo que permite reproducir la evaluación.

## Capacidades

- Control visomotor para manipulación robótica: genera acciones a partir de observaciones visuales e instrucciones, evaluado en tareas de LIBERO-10.
- Ejecución de políticas de horizonte largo: el benchmark LIBERO-10 agrupa tareas de manipulación de varios pasos.
- Ajuste fino reproducible: los checkpoints incluyen la configuración Hydra de la ejecución de entrenamiento.
- Variante con pérdida auxiliar de dinámica inversa (`ours`) frente a la variante base (`vanilla`).
- Soporte de tool calling: no disponible.
- Soporte de agentes multi-paso en el sentido de LLM: no disponible.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión general o audio: no disponibles.

## Casos de uso

- Investigación en políticas VLA: reproducir los resultados de LIBERO-10 con el checkpoint `vanilla/seed42/step30k/` usando el script `flower/evaluation/flower_eval_libero.py` y la configuración Hydra incluida, lo que permite comparar de forma controlada frente a otras políticas.
- Estudio de pérdidas auxiliares en robótica: comparar la variante `ours` (con pérdida de dinámica inversa) frente a `vanilla` para medir el impacto de la señal auxiliar en la tasa de éxito.
- Evaluación estandarizada de manipulación: ejecutar el benchmark LIBERO-10 con 50 ensayos por tarea para obtener métricas comparables entre checkpoints.
- Reproducibilidad de experimentos: el repositorio conserva la configuración exacta de entrenamiento (batch global 32, 30 000 pasos, EMA 0,999), lo que facilita replicar el pipeline en 4 GPUs.
- Base para ajuste fino adicional: partir de estos checkpoints afinados en LIBERO-10 para adaptarlos a nuevos conjuntos de tareas de manipulación.
- Docencia y formación en VLA: usar el par de checkpoints y la configuración Hydra como material didáctico para ilustrar el flujo completo de entrenamiento y evaluación de una política visomotora.

## Benchmarks y rendimiento

| Checkpoint | Benchmark | Ensayos por tarea | Tasa de éxito |
|---|---|---|---|
| `vanilla/seed42/step30k/` | LIBERO-10 | 50 | 0,880 |

No se han publicado en la información disponible resultados para la variante `ours` ni para otras semillas o pasos. Tampoco se aportan métricas de MMLU, HumanEval, GSM8K ni de otros benchmarks de lenguaje, que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio (7,8 GB) incluye pesos del modelo y pesos EMA, por lo que la huella en memoria podría situarse en ese orden, pero no se confirma.
- GPU recomendadas: no disponibles de forma explícita; el entrenamiento se realizó con 4 GPUs y la evaluación del ejemplo se lanza con `CUDA_VISIBLE_DEVICES=0`, lo que sugiere que la inferencia cabe en una sola GPU.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: evaluación mediante el repositorio PnPID_flower con `flower/evaluation/flower_eval_libero.py`, que requiere MuJoCo (`MUJOCO_GL=egl`) y `OMP_NUM_THREADS`/`MKL_NUM_THREADS` ajustados. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrenamiento | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PnPID FLOWER LIBERO-10 (`vanilla`) | VLA para robótica | Ajuste fino sobre `mbreuss/flower_vla_pret`, 30 000 pasos, 4 GPUs | no disponible | no disponible | Hugging Face, 7,8 GB |
| FLOWER (`mbreuss/flower_vla_pret`) | VLA preentrenado | Preentrenamiento base | no disponible | no disponible | Pesos referenciados como punto de partida |
| Flower Model 0.1.0 | Herramientas y modelos para IA colaborativa | no disponible | no disponible | no disponible | Documentación en flower.ai |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo se publica un resultado de evaluación (`vanilla/seed42/step30k/`, tasa de éxito 0,880) y únicamente durante el entrenamiento; no hay resultados independientes para la variante `ours`.
- No se especifica la licencia, lo que impide determinar si el uso comercial está permitido.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas; al tratarse de un modelo de robótica, estos conceptos no aplican directamente, pero tampoco se aporta información sobre sesgos en los datos de entrenamiento.
- La evaluación depende de un repositorio externo (PnPID_flower) y de variables de entorno concretas (`MUJOCO_GL=egl`, hilos de OpenMP/MKL), lo que añade fricción a la reproducibilidad.
- La carpeta `.hydra/` es oculta y el cargador de evaluación la necesita; si no se descarga correctamente, la evaluación falla.
- El checkpoint elimina `optimizer_states`, por lo que no sirve para reanudar el entrenamiento tal cual.
- No hay garantías de generalización fuera de LIBERO-10 ni de transferencia al mundo real.

## Enlaces

- Hugging Face: https://huggingface.co/KyujinL/pnpid-libero10-flower
- Checkpoint de partida: `mbreuss/flower_vla_pret` (referenciado en la model card; no se incluye URL directa en la información disponible)
- Documentación de Flower Model: https://flower.ai/docs/model/
- Repositorio PnPID_flower: referenciado en la model card como raíz desde la que se lanza la evaluación; no se incluye URL directa en la información disponible.
