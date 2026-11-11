# Autobrik/ecse552-act-source-turned

## Resumen

Autobrik/ecse552-act-source-turned es un checkpoint de política robótica basado en ACT (Action Chunking with Transformers), el método de imitation learning publicado por Tony Z. Zhao y colaboradores en 2023. Lo desarrolla el usuario Autobrik en el marco del proyecto de asignatura ECSE 552 de la Universidad McGill, titulado *Learning to Manipulate a New Object from Action-Free Videos*. El modelo no introduce cambios en la arquitectura original de ACT: se trata de un entrenamiento desde cero sobre un conjunto de datos propio de manipulación con bloques, orientado a un experimento académico de aprendizaje a partir de vídeos sin acciones.

El problema que aborda es la política visomotora: dado un flujo de observaciones de cámara a 10 Hz, predecir una secuencia de 20 acciones de articulaciones (2 segundos) que permita a un brazo robótico manipular un objeto. La relevancia es acotada y de investigación: es un artefacto reproducible de un trabajo de curso, con pesos liberados bajo licencia MIT, útil para estudiar ACT, comparar variantes de entrenamiento y reproducir el pipeline experimental, no como modelo de propósito general.

El repositorio contiene múltiples ejecuciones organizadas por número de demostraciones y semilla (`n<demos>/seed<k>/`), cada una con checkpoints de mejor validación, último epoch y el seleccionado para evaluación. No se publican parámetros, contexto lingüístico ni benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer codificador-decodificador con CVAE, sin modificar respecto al upstream `tonyzhaozh/act` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ventana de observación definida por la configuración de ACT) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica; no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | checkpoints PyTorch (`.ckpt`): `policy_best.ckpt`, `policy_last.ckpt`, `selected.ckpt`, más `dataset_stats.pkl`, `selection.json`, `act_run.json`, `history.json` y `provenance.json` por ejecución |

## Arquitectura y entrenamiento

ACT combina un transformer con un autocodificador variacional condicional (CVAE) que modela la multimodalidad de las demostraciones humanas, y predice bloques de acciones (chunks) en lugar de acciones individuales para reducir el error de compounding. En este caso se usa la implementación original sin modificar, con cuatro desviaciones documentadas por el autor: solo se usan imágenes (el estado del robot se pone a cero), las 7 dimensiones de acción del entorno propio se rellenan con ceros hasta las 14 del upstream, los episodios tienen longitud variable y el chunk es de 20 pasos a 10 Hz (2 segundos), equivalente al chunk de 100 a 50 Hz de ACT. Las acciones son objetivos absolutos de articulaciones.

El entrenamiento se realizó sobre el dataset `Autobrik/ecse552-ocbench-block` en la revisión `b7ef4c6975596a9825585e11f33d385f1fa8681f`, con varias colecciones de datos (oráculo (d) y objetivos pseudo-etiquetados para (b)/(c), listadas en `act_run.json`). Se generaron ejecuciones con distintos números de demostraciones (`n<demos>`) y semillas (`seed<k>`), y para cada una se seleccionó el checkpoint con mejor rendimiento en rollouts de validación sobre el dominio fuente entre `policy_best` y `policy_last`. No se especifican en la información disponible el número total de tokens, la composición detallada del dataset ni si hubo etapas de RLHF o DPO (no aplicables a este tipo de modelo).

## Capacidades

- Predicción de secuencias de 20 acciones de articulaciones (chunk de 2 s a 10 Hz) a partir de observaciones de cámara.
- Manipulación visomotora de un objeto tipo bloque en el entorno del dataset `ecse552-ocbench-block`.
- Funcionamiento exclusivamente con imágenes: el vector de estado del robot se ignora (se pone a cero).
- Soporte de episodios de longitud variable durante el entrenamiento.
- Múltiples variantes entrenadas con distinto número de demostraciones y semilla, lo que permite estudiar la sensibilidad a la cantidad de datos.
- No soporta tool calling, function calling, agentes basados en lenguaje, multilingüismo, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Reproducción de experimentos académicos: cargar `n300/seed0/selected.ckpt` con `action_free.act_original.ActPolicy` y replicar los rollouts de evaluación del proyecto ECSE 552 para verificar los resultados publicados.
- Estudio de imitación con pocos datos: comparar las ejecuciones `n<demos>` para medir cómo escala el éxito de la política con el número de demostraciones, usando `history.json` para analizar las curvas de pérdida.
- Evaluación de aprendizaje desde vídeos sin acciones: emplear las colecciones pseudo-etiquetadas (b)/(c) frente al oráculo (d) para cuantificar la brecha entre supervisión real y pseudo-etiquetas.
- Baseline para investigación en ACT: usar la implementación sin modificar como referencia frente a variantes propias (nuevos encoders, chunks distintos, estado del robot activo) en el mismo entorno de bloques.
- Análisis de estabilidad entre semillas: comparar `seed0`, `seed1`, etc. con el mismo número de demostraciones para estimar la varianza del entrenamiento de ACT en esta tarea.
- Docencia y prácticas de robótica: servir como ejemplo completo de pipeline (dataset, configuración TOML, adaptador, checkpoints y metadatos de procedencia) para cursos de aprendizaje por imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de acción ni comparaciones numéricas con otras políticas; solo describe la estructura de las ejecuciones y el criterio de selección del checkpoint (mejor rendimiento en rollouts de validación sobre el dominio fuente).

## Requisitos de hardware

- VRAM estimada: no disponible; ACT es un transformer pequeño en comparación con modelos de lenguaje, pero la información proporcionada no incluye el número de parámetros ni el consumo medido.
- GPU recomendadas: no disponible en la información; por el tipo de modelo (política visomotora con entrada de imagen y chunk corto) es habitual que quepa en GPU de consumo, pero no se confirma con datos del autor.
- GPU de consumo: no confirmado; no se especifica en la model card.
- Opciones de despliegue: carga mediante el adaptador del proyecto, `action_free.act_original.ActPolicy("n300/seed0/selected.ckpt", device)`, sobre PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / chunk | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Autobrik/ecse552-act-source-turned | no disponible | chunk 20 a 10 Hz | ACT original sobre `ecse552-ocbench-block`, solo imágenes | MIT | Hugging Face, checkpoints por ejecución |
| ACT original (tonyzhaozh/act) | no disponible en la información | chunk 100 a 50 Hz | Demostraciones humanas en tareas ALOHA | MIT (repo upstream) | GitHub, pesos publicados por el autor original |
| Otras políticas de imitación (p. ej. Diffusion Policy) | no disponible | no disponible | Imitación con modelos de difusión | no disponible | no disponible |

La comparación cuantitativa con alternativas no está disponible: la model card no aporta métricas que permitan contrastar rendimiento con ACT original u otras políticas.

## Limitaciones y advertencias

- Ámbito muy restringido: la política está entrenada para un único entorno y objeto (bloques del dataset `ecse552-ocbench-block`); no generaliza a otras tareas sin reentrenamiento.
- Ignora el estado del robot (se pone a cero), lo que puede degradar la precisión frente a ACT con estado completo.
- El relleno de 7 a 14 dimensiones de acción con ceros puede introducir artefactos si se reutiliza con herramientas que esperen el formato upstream.
- Riesgo de sobreajuste con pocas demostraciones; la variabilidad entre semillas no se documenta numéricamente.
- No es un modelo de lenguaje: no procesa texto, no tiene capacidades multilingües ni de razonamiento simbólico.
- Sin benchmarks publicados: no hay evidencia cuantitativa de tasa de éxito que respalde su uso fuera del contexto del proyecto.
- Licencia MIT permite uso comercial, pero el dataset y el entorno subyacentes pueden tener sus propias condiciones; conviene verificarlas antes de un despliegue real.
- Artefacto académico con 0 descargas y 0 likes en el momento de la consulta; no hay garantía de mantenimiento ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Autobrik/ecse552-act-source-turned
- Dataset: https://huggingface.co/datasets/Autobrik/ecse552-ocbench-block
- Repositorio del proyecto: https://github.com/BrikHMP18/ecse-552-project
- ACT original: https://github.com/tonyzhaozh/act
