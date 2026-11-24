# Autobrik/ecse552-act-dann-A

## Resumen

Autobrik/ecse552-act-dann-A es un checkpoint de robótica basado en ACT (Action Chunking with Transformers), el algoritmo de imitación desarrollado por Tony Zhao y colaboradores en Stanford. Lo publica el usuario Autobrik en el contexto del proyecto de la asignatura ECSE 552 de la Universidad McGill, titulado *Learning to Manipulate a New Object from Action-Free Videos*, y se entrena sobre el dataset Autobrik/ecse552-ocbench-block en la revisión `e3d9dc6c4a97d3fe51d86837b86c5ae4ea54a7de`.

No se trata de un modelo de lenguaje, sino de una política de manipulación robótica que aprende a partir de demostraciones y vídeos sin acciones. La implementación es ACT sin modificar (repositorio `tonyzhaozh/act`), con adaptaciones concretas: solo se usan imágenes (el estado del robot se pone a cero), las 7 dimensiones de acción propias se rellenan con ceros hasta las 14 de la versión original, los episodios son de longitud variable y se emplea un chunk de 20 a 10 Hz (2 segundos), equivalente al chunk de 100 a 50 Hz de ACT. Las acciones son objetivos articulares absolutos.

El interés del checkpoint es acotado pero claro: sirve como referencia reproducible de un pipeline de imitación con adaptación de dominio (DANN, según la nomenclatura del autor) sobre un benchmark de bloques, y como ejemplo de cómo reutilizar ACT con datos sin etiquetas de acción. El repositorio contiene múltiples ejecuciones organizadas por número de demostraciones y semilla, con checkpoints, estadísticas de normalización y trazas de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), implementación original de `tonyzhaozh/act` sin modificar |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de imitación; ventana de observación definida por la configuración del entrenamiento) |
| Tipos de cuantizacion | no disponible (checkpoints PyTorch `.ckpt`, no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades de lenguaje) |
| Licencia | MIT |
| Formato de pesos | checkpoints PyTorch (`.ckpt`): `policy_best.ckpt`, `policy_last.ckpt`, `selected.ckpt` |

## Arquitectura y entrenamiento

ACT es una política de imitación basada en transformer que predice secuencias de acciones (chunks) a partir de observaciones visuales y, opcionalmente, del estado del robot. En esta variante se elimina la entrada de estado (se pone a cero) y se emplean únicamente imágenes; las 7 dimensiones de acción del entorno se rellenan con ceros hasta las 14 dimensiones que espera la implementación original. El chunk es de 20 pasos a 10 Hz, lo que cubre 2 segundos de trayectoria, manteniendo la equivalencia temporal con el chunk de 100 pasos a 50 Hz de ACT.

El entrenamiento se realiza sobre el dataset `Autobrik/ecse552-ocbench-block`, con episodios de longitud variable y varias colecciones de datos (el conjunto oráculo (d) y objetivos pseudo-etiquetados para (b)/(c), según se indica en `act_run.json`). Cada ejecución se organiza en directorios `n<demos>/seed<k>/` y contiene `policy_best.ckpt` (menor pérdida de validación), `policy_last.ckpt`, `selected.ckpt` (el mejor de los dos según rollouts de validación en el dominio fuente, que es el evaluado en test), `dataset_stats.pkl`, `act_run.json` (argumentos, partición y datos), `history.json` (pérdidas por época) y `provenance.json`. La carga se realiza con `action_free.act_original.ActPolicy("n300/seed0/selected.ckpt", device)`. No se documentan en la información disponible el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables en este contexto).

## Capacidades

- Política de manipulación robótica por imitación: predice chunks de 20 acciones articulares absolutas a 10 Hz a partir de observaciones visuales.
- Aprendizaje a partir de vídeos sin acciones (action-free), mediante pseudo-etiquetado y adaptación de dominio (DANN) en el pipeline del proyecto.
- Ejecución multi-tarea sobre varias colecciones de datos, cuyas rutas se listan en `act_run.json` (`data.collections`).
- Evaluación reproducible con checkpoints seleccionados por validación (`selected.ckpt`) y métricas por época (`history.json`).
- No soporta tool calling, function calling, agentes basados en lenguaje, razonamiento multi-paso simbólico ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Reproducción de experimentos de imitación: cargar `selected.ckpt` con `action_free.act_original.ActPolicy` para replicar los resultados del proyecto ECSE 552 sobre el benchmark de bloques, comparando `n<demos>` y `seed<k>`.
- Estudio de adaptación de dominio en robótica: analizar cómo el pseudo-etiquetado de trayectorias sin acción afecta al rendimiento en el dominio objetivo, usando las colecciones declaradas en `act_run.json`.
- Línea base para ablaciones con ACT: al ser ACT sin modificar, sirve como referencia frente a variantes con estado del robot, otras longitudes de chunk u otras tasas de control.
- Docencia y formación: ejemplo completo de pipeline de imitación con checkpoints, estadísticas de normalización (`dataset_stats.pkl`) e historial de pérdidas (`history.json`) para prácticas de aprendizaje por imitación.
- Desarrollo de políticas para manipulación de bloques: punto de partida para experimentos con un brazo robótico en tareas de apilado o colocación, ajustando el chunk y la frecuencia de control.
- Evaluación comparativa de selección de checkpoints: comparar `policy_best.ckpt` frente a `selected.ckpt` para estudiar la correlación entre pérdida de validación y éxito en rollouts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; ACT es una política transformer de tamaño moderado y suele ejecutarse en GPU de gama media, pero el repositorio no publica el número de parámetros ni el consumo medido.
- GPU recomendadas: no disponibles en la información proporcionada. Por el tipo de carga (inferencia de política visual a 10 Hz), es habitual el uso de GPU consumer, pero no se documenta ningún modelo concreto.
- Cabe en GPU consumer: no confirmado por el autor; no se especifica.
- Opciones de despliegue: carga mediante `action_free.act_original.ActPolicy` del repositorio `BrikHMP18/ecse-552-project`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Autobrik/ecse552-act-dann-A | no disponible | no disponible | no disponible | MIT | Hugging Face |
| ACT original (`tonyzhaozh/act`) | no disponible | no disponible | resultados publicados en el paper de ACT (no reproducidos aquí) | MIT | GitHub |
| Otras políticas de imitación (p. ej. Diffusion Policy) | no disponible | no disponible | no disponible en esta ficha | según implementación | repositorios públicos |

No se dispone de datos comparativos de rendimiento en la información proporcionada; la comparación se limita a la disponibilidad y la licencia.

## Limitaciones y advertencias

- Modelo de robótica, no de lenguaje: no genera texto, no razona simbólicamente y no admite instrucciones en lenguaje natural.
- Entrenado sobre un único dataset (`Autobrik/ecse552-ocbench-block`) y un entorno concreto; la generalización a otros objetos, cámaras o brazos no está demostrada.
- El estado del robot se ignora (se pone a cero): la política depende solo de la imagen, lo que puede degradar el rendimiento en configuraciones donde la propriocepción es informativa.
- Las 7 dimensiones de acción se rellenan con ceros hasta 14; cualquier consumidor debe respetar ese convenio al interpretar las salidas.
- Riesgo de sobreajuste a las colecciones y particiones concretas del proyecto; los resultados deben interpretarse dentro del contexto académico de ECSE 552.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso externo ni validación por la comunidad.
- Licencia MIT: permite uso comercial y modificación, pero no se ofrece garantía alguna sobre el comportamiento del modelo en producción.
- No se documentan sesgos, tasas de alucinación ni límites de contexto en el sentido habitual de los modelos de lenguaje; esos conceptos no aplican directamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Autobrik/ecse552-act-dann-A
- Dataset: https://huggingface.co/datasets/Autobrik/ecse552-ocbench-block
- Repositorio del proyecto: https://github.com/BrikHMP18/ecse-552-project
- ACT original: https://github.com/tonyzhaozh/act
