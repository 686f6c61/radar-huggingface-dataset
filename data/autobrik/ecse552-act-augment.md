# Autobrik/ecse552-act-augment

## Resumen

Autobrik/ecse552-act-augment es un checkpoint de politica de imitacion basado en ACT (Action Chunking Transformer), entrenado sin modificaciones arquitectonicas respecto al codigo original de tonyzhaozh/act. Lo desarrolla el autor Autobrik en el contexto del proyecto de la asignatura ECSE 552 de la Universidad McGill, titulado "Learning to Manipulate a New Object from Action-Free Videos". El modelo resuelve una tarea concreta de manipulacion robotica con un solo brazo sobre un objeto nuevo, aprendiendo a partir de demostraciones y de objetivos pseudo-etiquetados derivados de videos sin acciones.

El checkpoint no es un modelo de lenguaje: es una politica visomotora para control robotico que recibe imagenes y emite objetivos absolutos de juntas. La variante presentada usa exclusivamente imagenes (el estado del robot se pone a cero) y predice 7 dimensiones de accion rellenadas con ceros hasta las 14 del ACT original. La decodificacion es por trozos de 20 acciones a 10 Hz (2 segundos por chunk), en lugar de los 100 a 50 Hz del ACT original.

Es relevante como referencia reproducible de ACT aplicado a un escenario de aumento de datos con videos sin acciones, con checkpoints seleccionados por validacion sobre rollouts de origen y trazabilidad de ejecucion (provenance.json, act_run.json, history.json). Su alcance es limitado: un unico dataset, un unico objeto y ausencia total de descargas y likes en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), sin modificaciones respecto a tonyzhaozh/act |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (politica de imitacion, no modelo de contexto textual) |
| Tipos de cuantizacion | no disponible (checkpoints PyTorch, sin variantes GGUF cuantizadas) |
| Idiomas soportados | no disponible (modelo de robotica, sin capacidades linguisticas) |
| Licencia | MIT |
| Formato de pesos | checkpoints PyTorch (`.ckpt`): `policy_best.ckpt`, `policy_last.ckpt`, `selected.ckpt` |

Otros datos tecnicos: dataset de entrenamiento Autobrik/ecse552-ocbench-block en revision `f7396350f5d70d2d48361fda552028e5a2590774`; chunk size 20 a 10 Hz; acciones como objetivos absolutos de juntas (7 dimensiones, rellenadas a 14); episodios de longitud variable; estado del robot a cero.

## Arquitectura y entrenamiento

ACT es un transformer con codificador visual y decodificador de acciones que predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que reduce el error de composicion y suaviza el control. En esta variante se mantiene el codigo upstream sin cambios; las diferencias son de configuracion y de datos: solo imagenes como entrada, estado del robot anulado, 7 dimensiones de accion con padding a 14, y trozos de 20 acciones a 10 Hz.

El entrenamiento se realiza sobre el dataset ecse552-ocbench-block, con varias colecciones de datos: una coleccion "oracle" (d) y objetivos pseudo-etiquetados para las colecciones (b) y (c), derivados de videos sin acciones. Las colecciones usadas se listan en `act_run.json` (`data.collections`). Cada directorio `n<demos>/seed<k>/` contiene el resultado de una ejecucion: checkpoint de menor perdida de validacion, checkpoint final, checkpoint seleccionado y un `selection.json` que registra cual de los dos fue mejor en rollouts de validacion sobre el dominio de origen y cual se evaluo en test. Se incluyen tambien `dataset_stats.pkl`, `history.json` con perdidas por epoca y `provenance.json`. No se especifican en la informacion disponible el numero de tokens, el volumen de demostraciones ni si se aplico RLHF o DPO (no procede en imitacion supervisada).

## Capacidades

- Prediccion de acciones de manipulacion robotica a partir de imagenes, con salida de objetivos absolutos de juntas en 7 dimensiones.
- Decodificacion por chunks de 20 acciones a 10 Hz, permitiendo control a 2 segundos por prediccion.
- Aprendizaje de una tarea sobre un objeto nuevo a partir de demostraciones y de videos sin acciones (aumento de datos pseudo-etiquetado).
- Ejecucion multi-episodio con episodios de longitud variable.
- Seleccion de politica mediante validacion en rollouts, con checkpoints alternativos (mejor perdida, ultimo, seleccionado).
- No dispone de generacion de texto, razonamiento linguistico, codigo, matematicas, vision general, tool calling, function calling, agentes basados en lenguaje, capacidades multilingues ni modos de pensamiento.

## Casos de uso

- Manipulacion de un objeto nuevo en laboratorio: el modelo se carga con `action_free.act_original.ActPolicy("n300/seed0/selected.ckpt", device)` y se usa para generar objetivos de juntas a 10 Hz sobre el objeto del dataset ocbench-block; es adecuado porque fue entrenado exactamente en esa tarea y dominio visual.
- Reproduccion de experimentos de imitacion: permite repetir las ejecuciones `n<demos>/seed<k>` con distintos numeros de demostraciones y semillas, comparando `policy_best.ckpt` frente a `policy_last.ckpt` mediante `selection.json`.
- Estudio de aumento de datos con videos sin acciones: sirve como linea base ACT pura frente a variantes con pseudo-etiquetas, usando las colecciones (b)/(c) del proyecto.
- Evaluacion de robustez ante variacion de demostraciones: los distintos directorios `n<demos>` permiten medir el efecto del numero de demostraciones sobre la perdida de validacion y el exito en test.
- Docencia e investigacion en robotica: al ser MIT y basado en codigo upstream sin modificar, puede integrarse en cursos y proyectos de imitacion learning con bajo coste de adaptacion.
- Trazabilidad de experimentos: `provenance.json`, `act_run.json` e `history.json` permiten auditar hiperparametros, particiones de datos y curvas de perdida en un pipeline de publicacion o replicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo referencia perdidas de validacion por epoca (`history.json`) y seleccion por rollouts de validacion, sin cifras de exito ni comparaciones numericas.

## Requisitos de hardware

- VRAM estimada: no disponible; depende del tamano del ACT original, que no se especifica. Los checkpoints son ficheros `.ckpt` de PyTorch.
- GPU recomendadas: no disponible en la informacion proporcionada. Al ser una politica de robotica de tamano moderado tipico de ACT, es plausible su ejecucion en GPU consumer, pero no se confirma con datos del autor.
- Compatibilidad con GPU consumer: no confirmada; no hay datos de VRAM ni de latencia.
- Opciones de despliegue: carga mediante `action_free.act_original.ActPolicy` del repositorio https://github.com/BrikHMP18/ecse-552-project (config `configs/act_augment.toml`, adaptador `src/action_free/act_original.py`). No se indican vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; la politica opera a 10 Hz con chunks de 20 acciones, pero no se publican tiempos de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Autobrik/ecse552-act-augment | no disponible | no aplica | no disponible | MIT | Hugging Face, pesos `.ckpt` |
| ACT original (tonyzhaozh/act) | no disponible | no aplica | no disponible | consultar repositorio upstream | GitHub |
| Alternativas de imitacion comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de parametros para establecer una comparacion cuantitativa con otras politicas de imitacion.

## Limitaciones y advertencias

- Alcance muy restringido: un unico dataset (ecse552-ocbench-block), un unico objeto y tarea; no generaliza a otros entornos sin reentrenamiento.
- Entrada solo de imagenes: el estado del robot se pone a cero, lo que puede degradar el control en tareas que requieran propriocepcion.
- Acciones como objetivos absolutos de juntas: no hay control de velocidad ni de par; requiere un controlador de bajo nivel adecuado.
- Formato de acciones 7 dimensiones con padding a 14: incompatible directamente con pipelines que esperen 14 dimensiones reales.
- Frecuencia de 10 Hz y chunk de 20: latencia de 2 segundos por prediccion, lo que limita reactividad ante perturbaciones.
- Sin datos de benchmarks, exito en test ni latencia: no apto para produccion sin evaluacion propia.
- Riesgo de sobreajuste a las condiciones visuales del dataset; no se documentan sesgos, pero la variabilidad de iluminacion y camara no esta cubierta.
- Cero descargas y cero likes: no hay evidencia de uso externo ni de validacion comunitaria.
- Licencia MIT permite uso comercial, pero el modelo deriva del codigo ACT upstream; conviene revisar las condiciones del repositorio original y del dataset.
- No es un modelo de lenguaje: no debe usarse para generacion de texto, codigo ni tareas linguisticas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Autobrik/ecse552-act-augment
- Dataset: https://huggingface.co/datasets/Autobrik/ecse552-ocbench-block
- Codigo del proyecto: https://github.com/BrikHMP18/ecse-552-project
- ACT original: https://github.com/tonyzhaozh/act
