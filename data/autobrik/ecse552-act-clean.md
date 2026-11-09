# Autobrik/ecse552-act-clean

## Resumen

Autobrik/ecse552-act-clean es un checkpoint de política robótica basado en ACT (Action Chunking with Transformers), el algoritmo de imitación original de tonyzhaozh/act sin modificaciones en su arquitectura. Lo publica el usuario Autobrik como artefacto de un proyecto académico de la asignatura ECSE 552 de la Universidad McGill, titulado *Learning to Manipulate a New Object from Action-Free Videos*. El modelo aprende a manipular un objeto nuevo a partir de demostraciones, y se entrena sobre el dataset Autobrik/ecse552-ocbench-block en una revisión concreta.

No es un modelo de lenguaje: es un policy de robótica que mapea observaciones visuales a acciones de control de un brazo manipulador. La variante "clean" se distingue de ACT por usar únicamente imágenes (el estado del robot se pone a cero), por emplear 7 dimensiones de acción rellenadas con ceros hasta las 14 del ACT original, por manejar episodios de longitud variable y por usar chunks de 20 acciones a 10 Hz (2 segundos) frente a los 100 a 50 Hz del ACT original. Las acciones son objetivos articulares absolutos.

El interés del artefacto es doble: por un lado, demuestra cómo adaptar ACT a un pipeline propio de datos y control; por otro, expone los checkpoints de varias ejecuciones (distintos números de demostraciones y semillas) junto con estadísticas del dataset y trazas de entrenamiento, lo que facilita reproducir y auditar el experimento. La licencia MIT permite reutilización y modificación sin restricciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones; sin modificar respecto al original |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; opera sobre observaciones visuales y chunks de acciones) |
| Tipos de cuantizacion | no disponible (checkpoints PyTorch `.ckpt`, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch checkpoint (`.ckpt`), con `dataset_stats.pkl` asociado |

## Arquitectura y entrenamiento

La arquitectura es ACT original: un transformer que combina un encoder de imágenes (ResNet preentrenado en el ACT upstream) con un decoder autorregresivo que predice secuencias de acciones (chunks). En esta variante "clean" se elimina la entrada de estado del robot (se pasa a ceros) y se mantiene solo la observación visual. Las 7 dimensiones de acción propias del entorno se rellenan con ceros hasta las 14 que espera el código upstream. Los episodios son de longitud variable y el chunk es de 20 acciones a 10 Hz, lo que equivale a 2 segundos de horizonte de predicción, frente a los 100 pasos a 50 Hz del ACT original. Las acciones son objetivos articulares absolutos, no incrementos relativos.

El entrenamiento se realizó sobre el dataset Autobrik/ecse552-ocbench-block en la revisión `3d0229e65911bc561020a3597ddc7dfaed01fa7c`, con el código del proyecto disponible en github.com/BrikHMP18/ecse-552-project (config `configs/act_clean.toml`, adaptador `src/action_free/act_original.py`). Se publican varias ejecuciones organizadas por `n<demos>/seed<k>/`, cada una con `policy_best.ckpt` (menor pérdida de validación), `policy_last.ckpt`, `selected.ckpt` (el mejor de los dos en rollouts de validación de origen, que es el evaluado en test), `dataset_stats.pkl`, `act_run.json` (argumentos, split y datos), `history.json` (pérdidas por época) y `provenance.json`. No se documentan en la información disponible el número de tokens, la composición exacta del dataset ni si se usó RLHF o DPO (no aplica en imitation learning; se entrena con behavioral cloning sobre demostraciones).

## Capacidades

- Imitación de manipulación robótica: predice secuencias de acciones articulares absolutas a partir de observaciones visuales.
- Predicción por chunks: genera 20 acciones por inferencia a 10 Hz (2 s de horizonte), lo que reduce el error de compounding respecto a políticas paso a paso.
- Aprendizaje a partir de demostraciones: entrenado con behavioral cloning sobre el dataset ecse552-ocbench-block.
- Adaptación a objeto nuevo: el proyecto marco estudia la manipulación de un objeto nuevo a partir de vídeos sin acciones, aunque el checkpoint "clean" se entrena con el dataset etiquetado.
- Uso de solo imágenes: no requiere estado del robot como entrada (se zeroa), lo que simplifica el despliegue en setups con cámara pero sin telemetría articular fiable.
- No soporta tool calling, function calling, agentes, razonamiento multi-step, capacidades multilingües, visión general, audio ni modo thinking: es un policy de robótica, no un modelo de lenguaje.

## Casos de uso

- Manipulación de un objeto nuevo en laboratorio: cargar `selected.ckpt` con `action_free.act_original.ActPolicy("n300/seed0/selected.ckpt", device)` y ejecutar el policy sobre las observaciones de cámara del banco de pruebas para recoger o colocar el objeto del dataset ecse552-ocbench-block.
- Reproducción de experimentos académicos: comparar las ejecuciones `n<demos>/seed<k>/` para estudiar el efecto del número de demostraciones y la semilla en la pérdida de validación y en el éxito en test, usando `history.json` y `selection.json`.
- Baseline para investigación en imitation learning: servir de referencia ACT "clean" (solo imágenes, 7 acciones, chunk 20 a 10 Hz) frente a variantes con estado del robot o con chunks más largos.
- Prototipado de pipelines de control a 10 Hz: integrar el policy en un bucle de control que consulte el modelo cada 100 ms y ejecute el chunk de 20 acciones, adecuado para brazos manipuladores de laboratorio.
- Docencia y formación: usar el checkpoint y su `provenance.json` como ejemplo reproducible de entrenamiento ACT con dataset propio y selección de checkpoint por validación.
- Auditoría de artefactos de investigación: revisar `act_run.json`, `dataset_stats.pkl` y `provenance.json` para verificar splits, normalización y trazabilidad del entrenamiento antes de reutilizar el modelo.
- Transferencia a un nuevo objeto con datos limitados: partir de este checkpoint y afinar con pocas demostraciones del objeto objetivo, aprovechando que la entrada es solo visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; al ser un ACT de tamaño no especificado, la VRAM depende del backbone visual y del número de parámetros, que no se documentan.
- GPU recomendadas: no disponible. Por el tamaño típico de ACT, una GPU consumer (RTX 3060/4070/4090) suele ser suficiente para inferencia, pero no hay datos publicados que lo confirmen para este checkpoint.
- ¿Cabe en consumer GPU?: probablemente sí para inferencia, pero no confirmado en la información disponible.
- Opciones de despliegue: carga mediante `action_free.act_original.ActPolicy` del repositorio github.com/BrikHMP18/ecse-552-project; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un policy de robótica).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|
| Autobrik/ecse552-act-clean | no disponible | chunk 20 a 10 Hz (2 s) | MIT | Hugging Face (checkpoints `.ckpt`) |
| ACT original (tonyzhaozh/act) | no disponible | chunk 100 a 50 Hz (2 s) | MIT (repo upstream) | GitHub |
| Otras variantes ACT del proyecto ECSE 552 | no disponible | no disponible | MIT | no disponible en la información proporcionada |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Es un policy de robótica específico del dataset ecse552-ocbench-block: no generaliza a otros objetos, entornos o morfologías sin reentrenamiento o ajuste fino.
- Entrada solo visual: al poner a cero el estado del robot se pierde información propioceptiva que podría ser relevante para el control preciso.
- Relleno de acciones con ceros hasta 14 dimensiones: cualquier integración debe respetar el mapeo de las 7 dimensiones reales para no interpretar mal las salidas.
- Chunk de 20 acciones a 10 Hz: menor horizonte que el ACT original (100 a 50 Hz en tiempo equivalente), lo que puede aumentar la frecuencia de replanificación.
- Riesgo de sobreajuste a las condiciones de cámara, iluminación y posiciones del dataset de entrenamiento; no se documentan evaluaciones fuera de distribución.
- Sin datos publicados de benchmarks, tasas de éxito ni métricas de robustez: no se puede garantizar un rendimiento mínimo en producción.
- No es un modelo de lenguaje: no admite prompts textuales, tool calling ni razonamiento; no debe evaluarse con benchmarks de NLP.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene conservar los avisos de copyright.
- Fechas de creación y actualización del repositorio (2026-11-09) posteriores a la fecha actual de referencia: verificar la vigencia del artefacto antes de depender de él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Autobrik/ecse552-act-clean
- Dataset: https://huggingface.co/datasets/Autobrik/ecse552-ocbench-block
- Repositorio del proyecto: https://github.com/BrikHMP18/ecse-552-project
- ACT original: https://github.com/tonyzhaozh/act
