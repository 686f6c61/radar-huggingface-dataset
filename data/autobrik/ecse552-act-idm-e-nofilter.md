# Autobrik/ecse552-act-idm-E-nofilter

## Resumen

`Autobrik/ecse552-act-idm-E-nofilter` es un conjunto de políticas de imitación basadas en ACT (Action Chunking with Transformers) entrenadas para el proyecto de la asignatura ECSE 552 de la Universidad McGill, titulado *Learning to Manipulate a New Object from Action-Free Videos*. El autor del repositorio es Autobrik y el modelo se publica bajo licencia MIT.

No se trata de un modelo de lenguaje: es un repositorio de checkpoints de robótica que implementa ACT sin modificar respecto al código original de Tony Z. Zhao. El entrenamiento se ha realizado sobre el dataset `Autobrik/ecse552-ocbench-block`, en la revisión `f3acca5265bc998fc0b1ef7c5c4bd2675e2a6e8e`, y las políticas predicen acciones de manipulación a partir exclusivamente de imágenes (el estado del robot se anula a ceros).

La relevancia es acotada y académica: el repositorio documenta la variante "IDM E sin filtro" del proyecto, con episodios de longitud variable y chunks de 20 pasos a 10 Hz (2 segundos), frente a los 100 pasos a 50 Hz de ACT original. Cada run se organiza en carpetas `n<demos>/seed<k>/` con checkpoints, estadísticas de normalización y metadatos de procedencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), implementación original sin modificar |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (chunk de 20 pasos a 10 Hz; 2 s de horizonte de acción) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | checkpoints PyTorch (`.ckpt`): `policy_best.ckpt`, `policy_last.ckpt`, `selected.ckpt` |

## Arquitectura y entrenamiento

ACT es un transformer encoder-decoder con un cuello de botella de variacional (CVAE) que predice secuencias de acciones (*action chunks*) a partir de observaciones visuales. En esta variante se mantiene el código original de `tonyzhaozh/act`; las modificaciones son de configuración e integración: solo se usan imágenes (el vector de estado del robot se rellena con ceros), las 7 dimensiones de acción propias se rellenan con padding hasta las 14 de upstream, y los episodios son de longitud variable. Las acciones son objetivos articulares absolutos y el chunk es de 20 pasos a 10 Hz (2 s), frente a los 100 pasos a 50 Hz de ACT original.

El entrenamiento se realiza sobre el dataset `Autobrik/ecse552-ocbench-block` y cubre varias colecciones: la colección oracle (d) y colecciones con objetivos pseudo-etiquetados para los escenarios (b) y (c), listadas en `act_run.json` (`data.collections`). Cada directorio `n<demos>/seed<k>/` contiene una ejecución independiente con `policy_best.ckpt` (menor pérdida de validación), `policy_last.ckpt`, `selected.ckpt` (el mejor de los dos según rollouts de validación en el dominio fuente, y el evaluado en test), `dataset_stats.pkl`, `act_run.json` (argumentos, split y datos), `history.json` (pérdidas por época) y `provenance.json`. La configuración concreta es `configs/act_idm_E_nofilter.toml` y el adaptador `src/action_free/act_original.py` del repositorio del proyecto.

## Capacidades

- Predicción de acciones de manipulación robótica a partir de observaciones visuales, en forma de chunks de 20 pasos a 10 Hz.
- Control por imitación (*behavior cloning*) con acciones absolutas en el espacio articular (7 dimensiones).
- Funcionamiento exclusivamente con imágenes: no requiere el estado proprioceptivo del robot en inferencia (se anula a ceros).
- Soporte de episodios de longitud variable durante el entrenamiento.
- Evaluación mediante rollouts de validación en el dominio fuente para seleccionar el checkpoint final.
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas, tool calling, capacidades de agente ni multilingüismo.

## Casos de uso

- Reproducción de experimentos académicos: cargar `n300/seed0/selected.ckpt` con `action_free.act_original.ActPolicy(..., device)` para replicar los resultados del proyecto ECSE 552 sobre el dataset `ocbench-block`.
- Investigación en aprendizaje por imitación sin acciones: comparar la variante "IDM E sin filtro" con otras variantes del proyecto (con filtrado, con pseudo-etiquetado) usando los mismos splits y métricas de validación.
- Manipulación de un objeto nuevo a partir de vídeos sin acción: emplear las políticas entrenadas con colecciones pseudo-etiquetadas (b)/(c) para evaluar la transferencia desde demostraciones sin etiquetas de acción.
- Análisis de sensibilidad al número de demostraciones: las carpetas `n<demos>/seed<k>/` permiten estudiar cómo varía la pérdida de validación y el rendimiento en test con el volumen de datos y la semilla.
- Estudio de la frecuencia de control: comparar el chunk de 20 pasos a 10 Hz con el de ACT original (100 a 50 Hz) en tareas de manipulación con requisitos de latencia distintos.
- Punto de partida para *fine-tuning* en un nuevo entorno robótico: reutilizar `dataset_stats.pkl` y la configuración TOML como base para reentrenar sobre un dataset propio con el mismo formato.
- Docencia y formación: material de referencia para prácticas de robótica de aprendizaje que ilustren el pipeline completo de ACT (datos, entrenamiento, selección de checkpoint y evaluación en rollouts).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (depende del tamaño del encoder visual y del número de parámetros, no documentados en la información proporcionada).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; al ser un transformer con encoder visual, es plausible que quepa en GPU de consumo, pero no hay datos que lo verifiquen.
- Opciones de despliegue: carga mediante el adaptador `action_free.act_original.ActPolicy` del repositorio `BrikHMP18/ecse-552-project`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no son aplicables a un modelo de robótica).
- Latencia y throughput: no disponible; el control opera a 10 Hz (periodo de 100 ms) por el chunk de 20 pasos.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Autobrik/ecse552-act-idm-E-nofilter | ACT (transformer + CVAE) | no disponible | chunk de 20 pasos a 10 Hz | MIT | Hugging Face |
| ACT original (`tonyzhaozh/act`) | ACT (transformer + CVAE) | no disponible | chunk de 100 pasos a 50 Hz | MIT | GitHub |
| Otras variantes del proyecto ECSE 552 (p. ej. con filtrado) | ACT | no disponible | chunk de 20 pasos a 10 Hz | MIT | Repositorio del proyecto |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo de robótica, no de lenguaje: no procesa texto ni responde a instrucciones en lenguaje natural.
- Entrenado sobre un único dataset (`Autobrik/ecse552-ocbench-block`) y un objeto concreto; la generalización a otros objetos o entornos no está documentada.
- Depende exclusivamente de imágenes: la ausencia de estado proprioceptivo puede degradar el control en tareas que requieran información cinemática precisa.
- Las acciones son objetivos articulares absolutos, por lo que la política está ligada a la cinemática del robot empleado en la recolección de datos.
- Sin resultados de benchmarks publicados: no es posible evaluar su rendimiento frente a alternativas sin ejecutar los rollouts.
- Riesgo de sobreajuste al dominio fuente; la selección de checkpoint se basa en validación en el dominio fuente, no en test.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin mantenimiento ni comunidad documentada.

## Enlaces

- Hugging Face: https://huggingface.co/Autobrik/ecse552-act-idm-E-nofilter
- Dataset: https://huggingface.co/datasets/Autobrik/ecse552-ocbench-block
- ACT original: https://github.com/tonyzhaozh/act
- Código del proyecto: https://github.com/BrikHMP18/ecse-552-project
