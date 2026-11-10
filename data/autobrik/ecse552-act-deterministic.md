# Autobrik/ecse552-act-deterministic

## Resumen

Autobrik/ecse552-act-deterministic es un checkpoint de política robótica basado en ACT (Action Chunking with Transformers), el método de imitación propuesto por Tony Zhao y colaboradores. El modelo no introduce modificaciones en la arquitectura original de ACT: se trata de un entrenamiento concreto sobre el conjunto de datos Autobrik/ecse552-ocbench-block, generado en el marco del proyecto de la asignatura ECSE 552 de la Universidad McGill, titulado "Learning to Manipulate a New Object from Action-Free Videos". El autor publica el resultado como pesos reutilizables para reproducir y evaluar el experimento.

La política aprende a predecir acciones de manipulación a partir únicamente de imágenes, ya que el estado del robot se anula en la entrada. Las acciones son objetivos articulares absolutos de siete dimensiones, rellenados con ceros hasta las catorce dimensiones que espera el código original de ACT. El modelo opera con episodios de longitud variable y genera chunks de 20 acciones a 10 Hz, lo que equivale a 2 segundos de horizonte de predicción.

Es relevante como referencia práctica de imitación visual para robótica de manipulación, y como ejemplo de adaptación de ACT a un dominio con acciones de distinta dimensionalidad y frecuencia. El repositorio incluye múltiples ejecuciones organizadas por número de demostraciones y semilla, lo que permite analizar la variabilidad del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (chunk de 20 acciones a 10 Hz; no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | checkpoints PyTorch (`.ckpt`): `policy_best.ckpt`, `policy_last.ckpt`, `selected.ckpt` |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura ACT sin modificaciones respecto al repositorio original `tonyzhaozh/act`. ACT combina un backbone visual con un transformer que predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que reduce el error de acumulación típico de las políticas de imitación. En esta configuración concreta, la entrada es exclusivamente visual (el vector de estado del robot se pone a cero) y la salida son objetivos articulares absolutos de siete dimensiones, que se rellenan con ceros hasta las catorce dimensiones esperadas por el código upstream.

El entrenamiento se realizó sobre el dataset Autobrik/ecse552-ocbench-block en la revisión `6b5e02b6ec6b7a1083479ca57411b3c5295a6021`, con episodios de longitud variable y un chunk de 20 acciones a 10 Hz (frente a las 100 acciones a 50 Hz del ACT original). El repositorio contiene varias ejecuciones organizadas como `n<demos>/seed<k>/`, cada una con pesos de mejor y última época, un checkpoint seleccionado según validación en rollouts de origen y metadatos de ejecución (`act_run.json`, `history.json`, `provenance.json`). No se dispone de información sobre el número de tokens, composición detallada del dataset ni uso de RLHF o DPO, que no aplican a este tipo de política.

## Capacidades

- Predicción de acciones de manipulación robótica a partir de imágenes RGB.
- Generación de chunks de 20 acciones a 10 Hz (2 segundos de horizonte).
- Salida de objetivos articulares absolutos de 7 dimensiones.
- Funcionamiento con episodios de longitud variable.
- Ejecución sobre varias colecciones de datos (oráculo y objetivos pseudo-etiquetados para los escenarios b y c), listadas en `act_run.json`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo de pensamiento, visión general, audio ni otras capacidades multimodales fuera del uso de imágenes como entrada.

## Casos de uso

- Reproducción de experimentos académicos: cargar `selected.ckpt` con `action_free.act_original.ActPolicy` para replicar los resultados del proyecto ECSE 552 sobre el dataset ocbench-block.
- Evaluación de imitación visual pura: comparar el rendimiento de una política que ignora el estado del robot frente a variantes que lo utilizan, usando los checkpoints por número de demostraciones.
- Estudio de la variabilidad de entrenamiento: analizar las distintas semillas (`seed0`, `seed1`, etc.) y su impacto en la pérdida de validación y en los rollouts de test.
- Aprendizaje de manipulación de objetos nuevos: emplear los pesos como línea base en pipelines de aprendizaje a partir de vídeos sin acciones, tal como plantea el proyecto original.
- Docencia y formación: usar el repositorio como ejemplo práctico de entrenamiento de ACT con datasets personalizados y acciones de dimensionalidad adaptada.
- Integración en entornos de simulación o laboratorio: desplegar la política en un brazo robótico de 7 grados de libertad que acepte objetivos articulares absolutos a 10 Hz.
- Análisis de selección de checkpoints: comparar `policy_best.ckpt`, `policy_last.ckpt` y `selected.ckpt` para estudiar la relación entre pérdida de validación y éxito en rollouts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 1,3 GB, lo que da una referencia del orden de magnitud de los pesos, aunque no se especifica el número de parámetros.
- GPU recomendadas: no disponible; al tratarse de una política ACT, es habitual el uso de GPU consumer para inferencia, pero no se confirma en la información proporcionada.
- Compatibilidad con GPU consumer: no disponible.
- Opciones de despliegue: carga mediante `action_free.act_original.ActPolicy` del repositorio `BrikHMP18/ecse-552-project`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Autobrik/ecse552-act-deterministic | no disponible | chunk de 20 acciones a 10 Hz | no disponible | MIT | Hugging Face |
| ACT original (tonyzhaozh/act) | no disponible | chunk de 100 acciones a 50 Hz | no disponible en esta ficha | MIT (repo original) | GitHub |
| Otras políticas de imitación visual (p. ej. Diffusion Policy) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint de investigación académica, no un modelo listo para producción.
- Entrenado sobre un único dataset (Autobrik/ecse552-ocbench-block); la generalización a otros objetos, entornos o robots no está demostrada.
- La entrada ignora el estado del robot (se anula), lo que puede limitar la precisión en tareas que requieran propriocepción.
- Las acciones son objetivos articulares absolutos de 7 dimensiones con relleno de ceros hasta 14; no es directamente compatible con configuraciones de robot distintas sin adaptación.
- Frecuencia de control de 10 Hz y chunk de 20 acciones, inferior al ACT original (50 Hz y 100 acciones), lo que puede afectar a tareas que requieran control más fino.
- Riesgo de sobreajuste a las condiciones del dataset; no se documentan evaluaciones fuera de distribución.
- No se han publicado métricas de éxito en rollouts ni benchmarks estandarizados.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Sin información sobre sesgos, alucinación o limitaciones idiomáticas, que no aplican en el sentido habitual a un modelo de robótica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Autobrik/ecse552-act-deterministic
- Dataset: https://huggingface.co/datasets/Autobrik/ecse552-ocbench-block
- Repositorio del proyecto: https://github.com/BrikHMP18/ecse-552-project
- ACT original: https://github.com/tonyzhaozh/act
