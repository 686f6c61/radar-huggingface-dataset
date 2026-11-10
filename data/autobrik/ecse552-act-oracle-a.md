# Autobrik/ecse552-act-oracle-A

## Resumen

Autobrik/ecse552-act-oracle-A es un checkpoint de política robótica basado en ACT (Action Chunking with Transformers), el método de imitación propuesto por Tony Z. Zhao en el repositorio original `tonyzhaozh/act`. El modelo lo publica el usuario Autobrik como artefacto del proyecto de la asignatura ECSE 552 de la Universidad McGill, titulado *Learning to Manipulate a New Object from Action-Free Videos*. No es un modelo de lenguaje: es un modelo de robótica (pipeline `robotics`) que predice acciones de control a partir de observaciones visuales.

El checkpoint se ha entrenado sobre el dataset `Autobrik/ecse552-ocbench-block`, en la revisión `f7396350f5d70d2d48361fda552028e5a2590774`, y sigue la implementación original de ACT sin modificaciones arquitectónicas. Las diferencias respecto al ACT de referencia son de configuración: solo se usan imágenes (el estado del robot se pone a cero), las 7 dimensiones de acción del proyecto se rellenan con ceros hasta las 14 del upstream, los episodios son de longitud variable y el *chunk* de acción es de 20 pasos a 10 Hz (2 segundos), equivalente al 100 a 50 Hz de ACT. Las acciones son objetivos articulares absolutos.

La relevancia es acotada: se trata de un artefacto académico con 0 descargas y 0 likes, publicado el 10 de noviembre de 2026, útil como referencia reproducible para quien trabaje en imitación visual o quiera comparar variantes del algoritmo ACT sobre el mismo dataset. La variante "oracle-A" indica que se entrenó con las colecciones de datos etiquetadas como oráculo, según el campo `data.collections` de `act_run.json`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), implementación original sin modificar |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: política de imitación por chunk de 20 pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin entrada/salida de texto) |
| Licencia | MIT |
| Formato de pesos | checkpoints PyTorch (`.ckpt`): `policy_best.ckpt`, `policy_last.ckpt`, `selected.ckpt` |

## Arquitectura y entrenamiento

La arquitectura es ACT, un transformer que aprende una política de imitación mapeando observaciones visuales a secuencias de acciones (*action chunks*). El modelo predice 20 acciones futuras por inferencia, a una frecuencia de control de 10 Hz, lo que cubre una ventana de 2 segundos. A diferencia del ACT original, aquí solo se alimenta con imágenes: el vector de estado del robot se anula, y las 7 dimensiones de acción del entorno del proyecto se rellenan con ceros hasta las 14 dimensiones que espera el código upstream. Las acciones son objetivos articulares absolutos, no incrementos relativos.

El entrenamiento se realizó sobre el dataset `Autobrik/ecse552-ocbench-block` en la revisión indicada, con episodios de longitud variable. Cada directorio `n<demos>/seed<k>/` contiene una ejecución independiente con `policy_best.ckpt` (menor pérdida de validación), `policy_last.ckpt`, `selected.ckpt` (el mejor de los dos según rollouts de validación en el dominio fuente, que es el evaluado en test), `dataset_stats.pkl`, `act_run.json` (argumentos, partición y colecciones de datos), `history.json` (pérdidas por época) y `provenance.json`. La configuración concreta está en `configs/act_oracle_A.toml` y el adaptador en `src/action_free/act_original.py` del repositorio del proyecto. No se documentan en la información disponible el número de tokens, la composición detallada del dataset ni si hubo etapas de RLHF o DPO (no aplicables en este dominio).

## Capacidades

- Predicción de acciones robóticas de manipulación a partir de imágenes, en forma de objetivos articulares absolutos de 7 dimensiones.
- Generación de *action chunks* de 20 pasos a 10 Hz (2 segundos de horizonte) por cada inferencia.
- Aprendizaje por imitación (*imitation learning*) a partir de demostraciones, sin recompensa explícita.
- Funcionamiento en modo "oráculo" con colecciones etiquetadas del dataset (`data.collections` en `act_run.json`), y variantes con objetivos pseudo-etiquetados para las condiciones (b)/(c) del proyecto.
- Carga mediante `action_free.act_original.ActPolicy("n300/seed0/selected.ckpt", device)`.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües, visión general, audio ni modo *thinking*: es una política de control específica de tarea.

## Casos de uso

- Reproducción de experimentos académicos: cargar `selected.ckpt` con `ActPolicy` y evaluar la política sobre el conjunto de test del dataset `ecse552-ocbench-block` para replicar los resultados del proyecto ECSE 552.
- Línea base para comparación de variantes de ACT: al ser la implementación original sin modificar, sirve como referencia frente a adaptaciones con estado del robot, acciones relativas u otros horizontes de chunk.
- Estudio de imitación desde vídeos sin acciones: la variante "oracle-A" permite medir el techo de rendimiento cuando se dispone de etiquetas de acción, frente a las variantes pseudo-etiquetadas (b)/(c) del mismo proyecto.
- Análisis de sensibilidad al número de demostraciones: los directorios `n<demos>/seed<k>/` permiten comparar curvas de pérdida (`history.json`) y rendimiento en rollouts según el volumen de demos y la semilla.
- Docencia en robótica e imitación: material listo para ilustrar el flujo completo de entrenamiento, selección de checkpoint por validación y evaluación en test con un entorno de bloques.
- Investigación sobre manipulación de objetos nuevos: integrable en pipelines de evaluación de políticas visuales en entornos tipo benchmark de bloques, siempre que se respete la convención de 7 acciones absolutas y observación exclusivamente visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del tamaño del encoder visual y del transformer de ACT, que no se documenta.
- GPU recomendadas: no disponible. El modelo se carga con `ActPolicy(..., device)`, por lo que puede ejecutarse en CPU o GPU según el dispositivo indicado.
- ¿Cabe en GPU de consumo? No disponible; sin el recuento de parámetros no puede confirmarse.
- Opciones de despliegue: carga directa mediante el adaptador `action_free.act_original.ActPolicy` del repositorio del proyecto; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a una política robótica).
- Latencia y throughput: no disponible. La frecuencia de control objetivo es de 10 Hz (chunk de 20 pasos cada 2 segundos), pero no se publican medidas de latencia real.

## Comparativa con modelos similares

| Modelo | Arquitectura | Acciones | Horizonte de chunk | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Autobrik/ecse552-act-oracle-A | ACT original sin modificar, solo imágenes | 7 dims absolutas, rellenadas a 14 | 20 pasos a 10 Hz | MIT | Hugging Face (0 descargas) |
| ACT original (tonyzhaozh/act) | ACT con estado del robot | 14 dims | 100 pasos a 50 Hz | MIT | GitHub |
| Variantes (b)/(c) del mismo proyecto | ACT con objetivos pseudo-etiquetados | 7 dims absolutas | 20 pasos a 10 Hz | MIT | No disponibles en la información |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Artefacto académico sin tracción: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación externa.
- Específico de tarea y entorno: entrenado únicamente sobre `ecse552-ocbench-block`; no se espera generalización a otros objetos, cámaras o morfologías sin reentrenamiento.
- Solo observación visual: el estado del robot se anula, lo que puede degradar el control en tareas donde la propriocepción sea informativa.
- Convención de acciones no estándar: 7 dimensiones absolutas rellenadas con ceros hasta 14; integrarlo en stacks que esperan el formato upstream requiere adaptación.
- Sin datos de benchmarks, parámetros, cuantizaciones ni latencias: imposible estimar coste de despliegue o comparar rendimiento de forma cuantitativa.
- Riesgo de sobreajuste a las demostraciones y a la distribución de la cámara del dataset; no se documentan análisis de robustez ni de alucinación (concepto no aplicable, pero sí de acciones erróneas fuera de distribución).
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene citar el proyecto y el dataset de origen.
- Fechas de creación y actualización (10 de noviembre de 2026) muy próximas entre sí: el modelo no parece haber recibido mantenimiento posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Autobrik/ecse552-act-oracle-A
- Dataset: https://huggingface.co/datasets/Autobrik/ecse552-ocbench-block
- Repositorio del proyecto: https://github.com/BrikHMP18/ecse-552-project
- ACT original: https://github.com/tonyzhaozh/act
