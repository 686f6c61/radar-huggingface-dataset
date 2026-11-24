# Autobrik/ecse552-act-dann-E

## Resumen

Autobrik/ecse552-act-dann-E es un checkpoint de política robótica basado en ACT (Action Chunking with Transformers), el algoritmo de imitación de tonyzhaozh publicado originalmente en 2023. Lo desarrolla el usuario Autobrik en el marco del proyecto de la asignatura ECSE 552 de la Universidad McGill, titulado "Learning to Manipulate a New Object from Action-Free Videos". El modelo resuelve una tarea de manipulación concreta (bloques del entorno ocbench) aprendiendo de demostraciones, y su particularidad es que se alimenta únicamente de imágenes: el estado del robot se anula (se pone a cero) y las acciones se predicen como objetivos articulares absolutos.

No se trata de un modelo de lenguaje ni de un modelo fundacional multimodal, sino de un policy checkpoint para robótica, empaquetado como repositorio de Hugging Face con pipeline `robotics`. Su relevancia es acotada: sirve como artefacto reproducible de un experimento académico de aprendizaje por imitación sin acciones (action-free), con variantes de entrenamiento (oráculo y pseudo-etiquetado) organizadas por número de demostraciones y semilla. La licencia es MIT y el repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder de imágenes y decoder de acciones; implementación original de tonyzhaozh sin modificar |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; chunk de 20 acciones a 10 Hz (2 s de horizonte), equivalente al chunk de 100 a 50 Hz de ACT |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin entrada/salida de texto) |
| Licencia | MIT |
| Formato de pesos | checkpoints PyTorch (`.ckpt`): `policy_best.ckpt`, `policy_last.ckpt`, `selected.ckpt`; estadísticas en `dataset_stats.pkl` y metadatos en JSON |

## Arquitectura y entrenamiento

El modelo es ACT sin modificaciones respecto al repositorio original de tonyzhaozh. Se trata de un transformer que combina un encoder visual con un decoder que predice secuencias de acciones en forma de chunks, lo que reduce el error de acumulación típico de las políticas paso a paso. En esta variante concreta, la entrada es solo imagen: el vector de estado del robot se rellena con ceros, de modo que la política debe inferir la acción a partir de la observación visual. Las 7 dimensiones de acción del proyecto se rellenan con padding hasta las 14 del ACT original, y las acciones son objetivos articulares absolutos.

El entrenamiento se realizó sobre el dataset Autobrik/ecse552-ocbench-block en la revisión `e3d9dc6c4a97d3fe51d86837b86c5ae4ea54a7de`, con episodios de longitud variable y un chunk de 20 acciones a 10 Hz. El repositorio organiza los resultados por número de demostraciones y semilla (`n<demos>/seed<k>/`), e incluye un fichero `act_run.json` que documenta las colecciones de datos usadas en cada caso: el conjunto oráculo (d) y conjuntos objetivo pseudo-etiquetados para las variantes (b) y (c). Para cada ejecución se guardan el checkpoint con menor pérdida de validación, el último checkpoint, el seleccionado mediante rollouts de validación en el dominio fuente y el historial de pérdidas por época. No se documentan en la información disponible el número de tokens, la composición exacta del dataset ni el uso de RLHF o DPO.

## Capacidades

- Predicción de acciones robóticas de manipulación como objetivos articulares absolutos, en chunks de 20 pasos a 10 Hz.
- Política puramente visual: opera sin estado proprioceptivo del robot (estado anulado), lo que la hace adecuada para escenarios action-free.
- Entrenamiento por imitación supervisada sobre demostraciones, con variantes de oráculo y pseudo-etiquetado.
- Evaluación reproducible mediante checkpoints seleccionados por rollouts de validación en el dominio fuente.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Reproducción de experimentos académicos: cargar `n300/seed0/selected.ckpt` con `action_free.act_original.ActPolicy` permite replicar los resultados del proyecto ECSE 552 y comparar variantes por número de demostraciones y semilla.
- Investigación en aprendizaje action-free: el modelo sirve como línea base para estudiar cuánto rendimiento se pierde al anular el estado del robot y depender solo de imágenes.
- Estudio de pseudo-etiquetado: las variantes (b) y (c) permiten analizar el efecto de entrenar con objetivos pseudo-etiquetados frente al conjunto oráculo (d).
- Manipulación de bloques en laboratorio: uso directo sobre el entorno ocbench-block para tareas de apilado o colocación, siempre dentro del dominio de entrenamiento.
- Análisis de selección de checkpoints: los ficheros `selection.json` e `history.json` permiten estudiar la correlación entre pérdida de validación y éxito en rollouts.
- Docencia en robótica e imitación: material práctico para asignaturas que cubran ACT, chunking de acciones y evaluación de políticas visuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del tamaño del encoder visual y del decoder, no documentado en la model card.
- GPU recomendadas: no disponible; por la naturaleza de ACT (encoder visual + transformer pequeño), es habitual que quepa en GPUs de consumo, pero no hay confirmación en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: carga mediante la API del propio repositorio (`action_free.act_original.ActPolicy`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Autobrik/ecse552-act-dann-E | no disponible | chunk de 20 acciones a 10 Hz | no disponible | MIT | Hugging Face |
| ACT original (tonyzhaozh/act) | no disponible | chunk de 100 acciones a 50 Hz | publicado en el paper original de ACT | MIT (repositorio original) | GitHub |
| Otras políticas de imitación visual (p. ej. Diffusion Policy) | no disponible | no disponible | no disponible en esta ficha | no disponible | no disponible |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada. La diferencia funcional documentada frente al ACT original es la entrada solo visual (estado a cero), el padding de 7 a 14 dimensiones de acción y el chunk reducido a 20 pasos a 10 Hz.

## Limitaciones y advertencias

- Dominio muy restringido: entrenado exclusivamente sobre el dataset ocbench-block; no se espera generalización a otros objetos, entornos o morfologías.
- Sin estado proprioceptivo: al anular el estado del robot, la política puede ser más frágil ante oclusiones o cambios de cámara.
- Riesgo de sobreajuste a las condiciones de captura del dataset; no hay evaluación fuera de distribución documentada.
- Sin datos de benchmarks ni métricas de éxito publicadas en la información disponible.
- Sin información sobre sesgos; al ser un modelo de robótica, los sesgos relevantes serían de distribución de datos (posiciones, iluminación, tipos de bloque), no lingüísticos.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar la licencia del dataset asociado.
- Repositorio sin descargas ni validación comunitaria; tratar los checkpoints como artefactos de investigación, no como componentes listos para producción.
- La carga requiere el código del proyecto (`action_free.act_original`), no incluido en el repositorio de pesos; sin ese código los checkpoints no son directamente utilizables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Autobrik/ecse552-act-dann-E
- Dataset: https://huggingface.co/datasets/Autobrik/ecse552-ocbench-block
- Repositorio del proyecto: https://github.com/BrikHMP18/ecse-552-project
- ACT original: https://github.com/tonyzhaozh/act
