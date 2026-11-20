# Autobrik/ecse552-act-idm-A

## Resumen

Autobrik/ecse552-act-idm-A es un checkpoint de política robótica basado en ACT (Action Chunking with Transformers), el algoritmo de imitation learning publicado por Tony Zhao y colaboradores. Lo desarrolla el usuario Autobrik en el marco del proyecto de la asignatura ECSE 552 de la Universidad McGill, titulado *Learning to Manipulate a New Object from Action-Free Videos*. El modelo aprende a manipular un objeto nuevo a partir de demostraciones y vídeos sin acciones, y se entrena sobre el dataset Autobrik/ecse552-ocbench-block.

Técnicamente no es un modelo de lenguaje: es una política visomotora que mapea observaciones de imagen a acciones de control de un brazo robótico, expresadas como objetivos articulares absolutos de 7 dimensiones. Emplea la implementación original de ACT sin modificaciones arquitectónicas, aunque con adaptaciones en la interfaz de datos: entrada únicamente de imágenes (el estado del robot se pone a cero), relleno de las 7 dimensiones de acción hasta las 14 de la implementación original y episodios de longitud variable.

Su relevancia es acotada y experimental: se trata de un artefacto de investigación académica con cero descargas y cero likes en el momento de la consulta, orientado a reproducir experimentos de manipulación con aprendizaje por imitación. No está pensado como modelo de propósito general ni como servicio listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), implementación original sin modificar |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | checkpoints PyTorch (`.ckpt`) |

## Arquitectura y entrenamiento

El modelo usa ACT, un transformer que predice secuencias de acciones (chunks) a partir de observaciones visuales. En esta variante, la entrada es exclusivamente de imágenes: el vector de estado del robot se anula, de modo que la política debe inferir la acción a partir de la percepción. Las 7 dimensiones de acción del proyecto se rellenan con ceros hasta las 14 que espera la implementación upstream. El chunking es de 20 acciones a 10 Hz, lo que equivale a 2 segundos de trayectoria planificada, manteniendo la misma duración temporal que el chunk de 100 a 50 Hz del ACT original. Las acciones son objetivos articulares absolutos.

El entrenamiento se realizó sobre el dataset Autobrik/ecse552-ocbench-block en la revisión `f3acca5265bc998fc0b1ef7c5c4bd2675e2a6e8e`, con episodios de longitud variable y varias colecciones de datos (oráculo en el caso (d) y objetivos pseudo-etiquetados para los casos (b) y (c), listados en `act_run.json`). El repositorio contiene múltiples ejecuciones organizadas como `n<demos>/seed<k>/`, cada una con `policy_best.ckpt` (menor pérdida de validación), `policy_last.ckpt`, `selected.ckpt` (el mejor de los dos según rollouts de validación en el dominio fuente, evaluado en test), `dataset_stats.pkl`, `act_run.json`, `history.json` y `provenance.json`. No se documenta en la información disponible el número de tokens, la composición exacta del dataset ni el uso de RLHF o DPO.

## Capacidades

- Control visomotor de un brazo robótico: predice secuencias de 20 acciones articulares absolutas a 10 Hz a partir de imágenes.
- Aprendizaje por imitación a partir de demostraciones, con variantes que usan objetivos pseudo-etiquetados derivados de vídeos sin acciones.
- Generalización a un objeto nuevo mediante el pipeline de *action-free* del proyecto.
- Ejecución de políticas en bucle cerrado sobre el entorno de simulación o banco de pruebas correspondiente al dataset.
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico ni capacidades multilingües.
- No incorpora modo de pensamiento, visión general, audio ni generación de texto.

## Casos de uso

- Reproducción de experimentos académicos: cargar `n300/seed0/selected.ckpt` con `action_free.act_original.ActPolicy` para replicar los resultados del proyecto ECSE 552 y comparar variantes de número de demostraciones y semilla.
- Estudio de aprendizaje por imitación con datos sin acciones: usar los checkpoints entrenados con objetivos pseudo-etiquetados para analizar cuánto rendimiento se conserva frente a la condición oráculo.
- Evaluación de políticas de manipulación en simulación: ejecutar los rollouts de validación y test descritos en `selection.json` para medir la tasa de éxito sobre el objeto objetivo.
- Análisis de sensibilidad al número de demostraciones: comparar los directorios `n<demos>/seed<k>/` para trazar curvas de rendimiento frente al volumen de datos.
- Docencia y formación: servir como ejemplo práctico de ACT, chunking de acciones y tratamiento de estados anulados en un curso de robótica o aprendizaje automático.
- Punto de partida para *fine-tuning*: reentrenar sobre un dataset propio de manipulación con la misma interfaz de 7 dimensiones y chunk de 20 a 10 Hz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; ACT es un transformer pequeño comparado con modelos de lenguaje, pero no se especifica el número de parámetros.
- GPU recomendadas: no disponible. Cualquier GPU con soporte CUDA y memoria suficiente para cargar el checkpoint debería bastar; no se documentan requisitos concretos.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: carga mediante la API del proyecto, `action_free.act_original.ActPolicy("ruta/al/checkpoint.ckpt", device)`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Autobrik/ecse552-act-idm-A | ACT, imitación visomotora | no disponible | no aplica | MIT | Hugging Face |
| ACT original (tonyzhaozh/act) | ACT, imitación visomotora | no disponible | no aplica | MIT (repo de referencia) | GitHub |
| Otros modelos de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación académica: cero descargas y cero likes en el momento de la consulta, sin validación externa conocida.
- Entrenado sobre un único dataset (Autobrik/ecse552-ocbench-block) y para un objeto concreto; la generalización fuera de ese dominio no está demostrada.
- El estado del robot se anula en la entrada, lo que puede degradar el control en tareas donde la propriocepción es informativa.
- Las acciones son objetivos articulares absolutos de 7 dimensiones rellenados a 14; integrarlo con otros controladores requiere respetar esa convención.
- No hay información sobre sesgos, tasas de alucinación ni robustez frente a cambios de iluminación, cámara o entorno.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Los checkpoints son específicos de la implementación del proyecto (`action_free.act_original`); cargarlos fuera de ese código puede requerir adaptaciones.
- No apto para producción sin una evaluación independiente en el entorno real de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Autobrik/ecse552-act-idm-A
- Dataset: https://huggingface.co/datasets/Autobrik/ecse552-ocbench-block
- Repositorio del proyecto: https://github.com/BrikHMP18/ecse-552-project
- ACT original: https://github.com/tonyzhaozh/act
