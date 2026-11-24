# Autobrik/ecse552-act-dann-D

## Resumen

Autobrik/ecse552-act-dann-D es un checkpoint de política robótica basado en ACT (Action Chunking with Transformers), el método de imitación propuesto por Tony Z. Zhao y colaboradores. Lo publica el usuario Autobrik en el marco del proyecto de la asignatura ECSE 552 de la Universidad McGill, titulado *Learning to Manipulate a New Object from Action-Free Videos*. No se trata de un modelo de lenguaje, sino de un modelo de control visuomotor entrenado para manipulación robótica a partir de demostraciones.

El modelo parte del código original de ACT sin modificaciones arquitectónicas y se entrena sobre el dataset Autobrik/ecse552-ocbench-block, en la revisión `e3d9dc6c4a97d3fe51d86837b86c5ae4ea54a7de`. Las diferencias respecto al ACT de referencia son de configuración: solo se usan imágenes (el estado del robot se pone a cero), las 7 dimensiones de acción propias se rellenan con ceros hasta las 14 del original, los episodios son de longitud variable y se emplea un chunk de 20 pasos a 10 Hz (2 segundos), equivalente al chunk de 100 a 50 Hz de ACT. Las acciones son objetivos articulares absolutos.

Es relevante ahora por su encuadre experimental: el proyecto estudia cómo aprender a manipular un objeto nuevo a partir de vídeos sin acciones, y este checkpoint corresponde a la variante DANN (adaptación de dominio). El repositorio incluye múltiples ejecuciones organizadas por número de demostraciones y semilla, con checkpoints seleccionados por validación, estadísticas del dataset e historial de entrenamiento, lo que facilita la reproducibilidad del experimento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones; código original sin modificar |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; chunk de 20 pasos de acción a 10 Hz (2 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades de lenguaje) |
| Licencia | MIT |
| Formato de pesos | checkpoints PyTorch (`.ckpt`), más `dataset_stats.pkl` y ficheros JSON de metadatos |

## Arquitectura y entrenamiento

ACT es un transformer que combina un codificador de imágenes con un decodificador que predice secuencias de acciones en bloque (*action chunking*). En esta variante se mantiene el código original de `tonyzhaozh/act`; el adaptador del proyecto está en `src/action_free/act_original.py` y la configuración en `configs/act_dann_D.toml`. La entrada es únicamente visual: el vector de estado del robot se anula y el modelo debe inferir la acción a partir de las imágenes. La salida son 7 dimensiones de acción (objetivos articulares absolutos) rellenadas con ceros hasta las 14 dimensiones que espera el ACT original.

El entrenamiento usa el dataset Autobrik/ecse552-ocbench-block con episodios de longitud variable y un chunk de 20 acciones a 10 Hz. Cada ejecución se organiza en una carpeta `n<demos>/seed<k>/` que contiene `policy_best.ckpt` (menor pérdida de validación), `policy_last.ckpt`, `selected.ckpt` (el mejor de los dos según rollouts de validación en el dominio fuente, y el evaluado en test), `dataset_stats.pkl`, `act_run.json` (argumentos, partición y colecciones de datos), `history.json` (pérdidas por época) y `provenance.json`. Según la model card, el modelo puede ejecutarse sobre varias colecciones (la colección oracle (d) y objetivos pseudo-etiquetados para (b)/(c)), que se listan en `act_run.json` bajo `data.collections`. No se especifican en la información disponible el número de tokens, el volumen de demostraciones ni si hubo etapas de RLHF o DPO, algo esperable al tratarse de aprendizaje por imitación supervisado.

## Capacidades

- Control visuomotor de manipulación robótica: predice secuencias de 20 acciones articulares absolutas (7 dimensiones) a 10 Hz a partir de observaciones de imagen.
- Aprendizaje por imitación a partir de demostraciones del dataset ecse552-ocbench-block.
- Funcionamiento sin estado proprioceptivo del robot: el estado se anula y la política depende solo de la visión.
- Adaptación de dominio: la variante DANN incorpora el enfoque de adaptación de dominio del proyecto para aprovechar datos sin acciones.
- Soporte de múltiples colecciones de datos: oracle y objetivos pseudo-etiquetados, configurables en `act_run.json`.
- No dispone de generación de texto, razonamiento simbólico, código, matemáticas, tool calling, capacidades de agente ni multilingüismo.

## Casos de uso

- Manipulación de un objeto nuevo en laboratorio: el checkpoint se carga con `action_free.act_original.ActPolicy("n300/seed0/selected.ckpt", device)` y se ejecuta sobre el robot para reproducir la tarea de bloques del benchmark ocbench, aprovechando que las acciones son objetivos articulares absolutos directamente aplicables.
- Reproducción de experimentos académicos: las carpetas por número de demostraciones y semilla permiten repetir curvas de aprendizaje y comparar variantes (oracle frente a pseudo-etiquetado) usando `history.json` y `selection.json`.
- Estudio de aprendizaje desde vídeos sin acciones: la variante DANN con objetivos pseudo-etiquetados sirve como línea base para medir cuánto rendimiento se recupera respecto a la colección oracle.
- Evaluación de robustez ante ausencia de estado del robot: al anular el vector de estado, el modelo es adecuado para analizar políticas puramente visuales en entornos donde la propriocepción no está disponible o es ruidosa.
- Prototipado de pipelines de imitación: el formato de checkpoints y metadatos (`dataset_stats.pkl`, `act_run.json`, `provenance.json`) facilita integrar el modelo en herramientas de evaluación de políticas robóticas y en flujos de experimentación con múltiples semillas.
- Docencia y formación en robótica: el modelo y su configuración asociada constituyen un ejemplo completo y reproducible de entrenamiento ACT para prácticas de aprendizaje por imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del tamaño del codificador visual y del número de parámetros, que no se detallan.
- GPU recomendadas: no disponible; el entrenamiento y la evaluación de ACT suelen requerir GPU con soporte CUDA, pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada; el código original de ACT está pensado para ejecutarse en GPU, pero no hay datos de consumo de memoria para este checkpoint.
- Opciones de despliegue: carga mediante el adaptador del proyecto `action_free.act_original.ActPolicy(ruta, device)`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo de robótica.
- Latencia y throughput: no disponibles; el control opera a 10 Hz con chunks de 20 acciones, pero no se publican tiempos de inferencia medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Autobrik/ecse552-act-dann-D | no disponible | chunk de 20 acciones a 10 Hz | Manipulación robótica por imitación (ACT, variante DANN) | MIT | Hugging Face |
| ACT original (tonyzhaozh/act) | no disponible | chunk de 100 acciones a 50 Hz | Manipulación robótica por imitación | MIT (según repositorio de referencia) | GitHub |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento de este checkpoint ni de otros modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Modelo específico de una tarea y un entorno: entrenado sobre el dataset ecse552-ocbench-block, no es un modelo general y no se espera que generalice fuera de la distribución de dicho dataset.
- Sin estado proprioceptivo: al anular el vector de estado del robot, la política depende solo de la imagen, lo que puede degradar el control en situaciones donde la propriocepción sería informativa.
- Relleno de dimensiones de acción: las 7 dimensiones propias se rellenan con ceros hasta 14, lo que exige respetar el formato de entrada y salida al integrar el modelo.
- Riesgo de sobreajuste y varianza entre semillas: el repositorio incluye múltiples semillas y checkpoints seleccionados por validación, lo que sugiere variabilidad en los resultados; debe usarse el checkpoint `selected.ckpt` para evaluación.
- Sin benchmarks publicados: no hay métricas de éxito en tarea ni comparaciones con líneas base en la información disponible, por lo que no puede afirmarse su rendimiento en producción.
- Idiomas y licencia: no aplica el soporte multilingüe; la licencia MIT permite uso comercial, pero el modelo depende del código y los datos de terceros, cuyas condiciones deben verificarse por separado.
- Sin datos de sesgos ni de alucinación: al no ser un modelo de lenguaje, estas categorías no aplican; el riesgo relevante es el fallo de la política en entornos no vistos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Autobrik/ecse552-act-dann-D
- Dataset: https://huggingface.co/datasets/Autobrik/ecse552-ocbench-block
- Código del proyecto: https://github.com/BrikHMP18/ecse-552-project
- Repositorio original de ACT: https://github.com/tonyzhaozh/act
