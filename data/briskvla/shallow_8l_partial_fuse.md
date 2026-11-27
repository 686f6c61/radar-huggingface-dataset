# briskVLA/shallow_8L_partial_fuse

## Resumen

briskVLA/shallow_8L_partial_fuse es un checkpoint de un "action expert" de SmolVLA destilado y recortado en profundidad para tareas de manipulacion robotica en el benchmark LIBERO. Lo publica el autor `briskVLA` (usuario vinculado a Carnegie Mellon University segun la URL de W&B) como parte de una linea de experimentos de compresion de politicas vision-language-action (VLA). El modelo parte del profesor `lerobot/smolvla_libero` y conserva unicamente 8 capas del experto original (indices `[0, 1, 2, 3, 8, 11, 12, 15]`), con un layout canonico `partial_fuse` y anchos de FFN de `[2048, 2048, 2048, 2048, 4096, 4096, 4096, 4096]`.

El checkpoint tiene 418.618.336 parametros totales en safetensors (de los cuales 66,82 M corresponden al experto recortado), ocupa 0,8 GB en el repositorio y se distribuye en formato safetensors para la libreria LeRobot. No es un modelo de lenguaje general: es una politica de accion que consume observaciones visuales y estado del robot y produce chunks de acciones, por lo que su relevancia es para investigacion en robotica de bajo coste computacional y despliegue en hardware modesto.

La publicacion es muy reciente (27 de noviembre de 2026) y no cuenta aun con descargas ni likes, lo que sugiere un artefacto de investigacion mas que un modelo listo para produccion. La model card documenta el proceso de destilacion (5000 pasos, batch 8, perdida sobre ground truth con peso 1.0) y ofrece scripts para evaluar en LIBERO, medir latencia y seguir comprimiendo (por ejemplo de 8L a 4L).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (VLA basada en transformer con action expert); variante recortada a 8 capas con layout `partial_fuse` y fusion de FFN |
| Parametros totales | 418.618.336 |
| Parametros activos | no disponible (no es MoE; 66,82 M corresponden al experto recortado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (politica robotica; no es un modelo linguistico general) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria LeRobot) |

## Arquitectura y entrenamiento

El modelo es un `action expert` de SmolVLA reducido en profundidad. SmolVLA combina un backbone vision-language con un experto de accion que genera chunks de acciones; en este checkpoint el experto conserva solo 8 capas seleccionadas del profesor (`[0, 1, 2, 3, 8, 11, 12, 15]`) con un mapa oculto `same_depth`, y los anchos de FFN se ajustan a `[2048, 2048, 2048, 2048, 4096, 4096, 4096, 4096]`. El layout canonico es `partial_fuse`, con fusion de FFN (`ffn-fusion`) y etiqueta `role-shallow`, lo que indica una politica "superficial" obtenida por destilacion del profesor `lerobot/smolvla_libero` (commit `a24f1f380461`).

El entrenamiento se realizo durante 5000 pasos con batch 8, usando una perdida ponderada con `velocity=0.0, hidden=0.0, output=0.0, gt=1.0`, es decir, supervision directa sobre las acciones ground truth en lugar de sobre las salidas intermedias del profesor. El mejor valor de validacion `chunk_mse_teacher` fue 0.1678 en el paso 5000, con `chunk_mse_gt` de 0.2198 en ese mismo punto. No se documentan en la informacion disponible detalles sobre el dataset de entrenamiento (composicion, numero de trayectorias), el uso de RLHF/DPO ni innovaciones como decodificacion especulativa; el enfasis esta en la compresion por destilacion y recorte de capas.

## Capacidades

- Generacion de chunks de acciones para control robotico en tareas de manipulacion del benchmark LIBERO.
- Consumo de observaciones visuales y estado del robot como entrada (politica VLA).
- Evaluacion con horizontes de accion K=10 y K=1 segun los scripts de la model card.
- Medida de latencia de inferencia mediante `project/briskvla/latency.py`.
- Destilacion posterior y compresion adicional (por ejemplo, de 8L a 4L) con los scripts `distill_student.py` y `build_student.py`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no es un modelo linguistico).
- Capacidades especiales (thinking mode, vision, audio): vision como entrada para la politica; no se documentan otras.

## Casos de uso

- Investigacion en compresion de politicas VLA: el checkpoint sirve como punto de partida para estudiar el efecto del recorte de profundidad (8L frente al profesor completo) sobre el error de chunk (`chunk_mse_teacher` 0.1678) y sobre la tasa de exito en LIBERO.
- Destilacion iterativa: usando `distill_student.py` se puede continuar el entrenamiento o destilar a un estudiante de 4L, lo que permite explorar la frontera coste-rendimiento en robotica.
- Evaluacion comparativa en LIBERO: `run_eval.sh` permite medir tasas de exito con K=10 y K=1, util para comparar variantes de layout (`partial_fuse` frente a otras) en igualdad de condiciones.
- Analisis de latencia en hardware modesto: el script `latency.py` genera un JSON de latencias, adecuado para decidir si el modelo cabe en un robot con computo embebido.
- Prototipado de politicas de manipulacion en laboratorio: al ser un checkpoint pequeno (0,8 GB, 418 M parametros), es viable iterar rapido en estaciones de trabajo con una sola GPU.
- Reproducibilidad de experimentos: la model card enlaza la ejecucion de W&B (`24a6ec92`), lo que facilita replicar el entrenamiento y auditar hiperparametros.
- Base para experimentos de fusion de FFN: la etiqueta `ffn-fusion` y el layout `partial_fuse` permiten estudiar tecnicas de fusion de capas en modelos VLA.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Mejor `chunk_mse_teacher` (validacion, paso 5000) | 0.1678 |
| `chunk_mse_gt` en el mejor punto | 0.2198 |
| Pasos de entrenamiento | 5000 |
| Batch | 8 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, tasas de exito en LIBERO) en la informacion disponible. La model card solo reporta las metricas de validacion de la destilacion anteriores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 418,6 M parametros en safetensors (0,8 GB en el repo), la inferencia en precision completa requiere del orden de 1,7 GB solo para pesos, mas memoria para activaciones y el backbone VLA del que depende.
- GPU recomendadas: no disponible; por tamano, una GPU consumer moderna (por ejemplo RTX 3090/4090) deberia ser suficiente, pero no hay confirmacion en la informacion proporcionada.
- Cabe en GPU consumer: probablemente si, dado el tamano, pero no confirmado.
- Opciones de despliegue: LeRobot (libreria declarada); otros motores como vLLM, llama.cpp, Ollama o TGI no estan documentados para este modelo.
- Latencia y throughput: no disponibles; la model card incluye un script para medirlos (`latency.py`) pero no publica resultados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| briskVLA/shallow_8L_partial_fuse | 418,6 M (experto 66,82 M) | no disponible | Politica VLA para LIBERO | no disponible | Hugging Face (LeRobot) |
| lerobot/smolvla_libero (profesor) | no disponible | no disponible | Politica VLA para LIBERO | no disponible | Hugging Face (LeRobot) |
| Otras variantes briskVLA (p. ej. estudiantes 4L) | no disponible | no disponible | Politica VLA para LIBERO | no disponible | Hugging Face (LeRobot) |

No se dispone de datos de rendimiento comparativo (tasas de exito en LIBERO) entre estas variantes en la informacion proporcionada, por lo que la comparativa se limita a parametros y disponibilidad.

## Limitaciones y advertencias

- Es un checkpoint de investigacion con 0 descargas y 0 likes; no hay evidencia de validacion externa.
- No se especifica la licencia, lo que impide confirmar si el uso comercial esta permitido.
- No hay informacion sobre sesgos; al ser una politica robotica entrenada en LIBERO, su comportamiento esta limitado al dominio y distribucion de ese benchmark.
- Riesgo de alucinacion no aplicable en el sentido linguistico, pero si hay riesgo de acciones incorrectas fuera de la distribucion de entrenamiento.
- Limitaciones de contexto e idioma no documentadas; no es un modelo de lenguaje general.
- El rendimiento se reporta solo como error de chunk (`chunk_mse_teacher` 0.1678, `chunk_mse_gt` 0.2198), no como tasa de exito en tareas, lo que dificulta evaluar su utilidad practica.
- Depende del ecosistema LeRobot y del backbone de SmolVLA; la integracion en otros pipelines no esta documentada.
- El recorte a 8 capas puede degradar la generalizacion frente al profesor completo; no se aportan datos que lo cuantifiquen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/briskVLA/shallow_8L_partial_fuse
- Modelo base (profesor): https://huggingface.co/lerobot/smolvla_libero
- Ejecucion de entrenamiento en W&B: https://wandb.ai/djonnala-carnegie-mellon-university/briskVLA/runs/24a6ec92
