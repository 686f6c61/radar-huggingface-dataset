# Autobrik/ecse552-act-idm-E

## Resumen
Autobrik/ecse552-act-idm-E es un modelo de política robótica basado en ACT (Action Chunking with Transformers) entrenado por el autor Autobrik en el marco del proyecto de la asignatura ECSE 552 de la Universidad McGill, titulado "Learning to Manipulate a New Object from Action-Free Videos". No se trata de un modelo de lenguaje, sino de un checkpoint de imitación para control robótico que predice acciones de articulaciones a partir de imágenes, desarrollado sobre el repositorio original de ACT sin modificaciones en la arquitectura.

El modelo se ha entrenado sobre el dataset Autobrik/ecse552-ocbench-block en una revisión concreta y predice 7 dimensiones de acción (rellenadas con ceros hasta las 14 del ACT original), con episodios de longitud variable y fragmentos de 20 acciones a 10 Hz (2 segundos por chunk). Las acciones son objetivos articulares absolutos, y el modelo funciona únicamente con imágenes: el estado del robot se anula en la entrada.

Es relevante en el contexto de investigación en imitación robótica y aprendizaje a partir de vídeos sin acciones, ya que sirve como artefacto reproducible de un experimento académico. El repositorio incluye múltiples ejecuciones por número de demostraciones y semilla, con checkpoints de mejor validación, último checkpoint y checkpoint seleccionado, además de estadísticas del dataset y metadatos de procedencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador de imágenes y decodificador de acciones |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; ventana de observación de imágenes y chunk de 20 acciones a 10 Hz) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | checkpoints PyTorch (`.ckpt`), junto con `dataset_stats.pkl`, `act_run.json`, `history.json` y `provenance.json` |

## Arquitectura y entrenamiento
El modelo emplea la arquitectura ACT original del repositorio tonyzhaozh/act, sin modificaciones estructurales. ACT combina un codificador visual con un transformer que predice secuencias de acciones (action chunking); en este caso, el chunk es de 20 acciones a 10 Hz, equivalente a 2 segundos, en lugar de las 100 acciones a 50 Hz del ACT original. Las imágenes son la única entrada: el estado del robot se pone a cero. Las 7 dimensiones de acción propias del entorno se rellenan con ceros hasta las 14 dimensiones que espera el modelo original, y las acciones representan objetivos articulares absolutos.

El entrenamiento se realizó sobre el dataset Autobrik/ecse552-ocbench-block en la revisión `f3acca5265bc998fc0b1ef7c5c4bd2675e2a6e8e`, con episodios de longitud variable. El repositorio contiene ejecuciones organizadas como `n<demos>/seed<k>/`, cada una con `policy_best.ckpt` (menor pérdida de validación), `policy_last.ckpt`, `selected.ckpt` (el mejor de los dos según rollouts de validación en el dominio fuente) y `selection.json`. No se dispone de información sobre el número de tokens, composición detallada del dataset ni uso de RLHF o DPO, dado que no aplica a este tipo de modelo.

## Capacidades
- Predicción de acciones robóticas de 7 dimensiones (objetivos articulares absolutos) a partir de observaciones visuales.
- Action chunking: genera secuencias de 20 acciones a 10 Hz (2 segundos) por inferencia.
- Aprendizaje por imitación a partir de demostraciones, incluyendo configuraciones con objetivos pseudo-etiquetados para escenarios sin acciones.
- Funcionamiento exclusivo con imágenes (estado del robot anulado), lo que permite entrenar con datos visuales sin estado proprioceptivo.
- Soporte de múltiples colecciones de datos, listadas en `act_run.json` (`data.collections`).
- No dispone de tool calling, razonamiento multi-paso textual, capacidades multilingües ni modos de pensamiento; no es un modelo de lenguaje.

## Casos de uso
- Reproducción de experimentos académicos: cargar `n300/seed0/selected.ckpt` con `action_free.act_original.ActPolicy` para replicar los resultados del proyecto ECSE 552 y comparar configuraciones por número de demostraciones y semilla.
- Investigación en imitación a partir de vídeos sin acciones: el modelo sirve como línea base para estudiar cómo los objetivos pseudo-etiquetados (configuraciones b/c) afectan al rendimiento frente al oráculo (d).
- Manipulación de un objeto nuevo en entornos de laboratorio: usar el modelo para controlar un brazo robótico que debe manipular el bloque del dataset ocbench-block a partir de imágenes.
- Evaluación de políticas visuales: emplear los checkpoints `policy_best`, `policy_last` y `selected` para analizar la variabilidad entre criterios de selección y la generalización en rollouts de validación.
- Docencia y formación: material de referencia para cursos de robótica y aprendizaje por imitación, con metadatos de procedencia y estadísticas del dataset incluidas.
- Análisis de eficiencia de datos: comparar ejecuciones con distinto número de demostraciones (`n<demos>`) para estudiar curvas de aprendizaje en imitación visual.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible (no se especifican parámetros totales ni tamaño de los checkpoints).
- GPU recomendadas: no disponible; al ser un modelo ACT, es habitual su ejecución en GPU de consumo, pero no se confirma en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: carga mediante `action_free.act_original.ActPolicy("n300/seed0/selected.ckpt", device)` del repositorio del proyecto; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Autobrik/ecse552-act-idm-E | no disponible | chunk de 20 acciones a 10 Hz | no disponible | MIT | Hugging Face |
| ACT original (tonyzhaozh/act) | no disponible | chunk de 100 acciones a 50 Hz | no disponible | MIT (según repositorio original) | GitHub |
| Otros modelos de imitación robótica | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento entre este modelo y alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias
- Modelo de robótica, no de lenguaje: no procesa texto ni mantiene conversaciones; cualquier uso fuera del control robótico visual no es aplicable.
- Entrenado sobre un único dataset (Autobrik/ecse552-ocbench-block) y una tarea concreta (manipulación de un bloque), por lo que la generalización a otros objetos o entornos no está garantizada.
- El estado del robot se anula en la entrada; la política depende únicamente de imágenes, lo que puede limitar la precisión en tareas que requieran propriocepción.
- Las acciones se rellenan con ceros de 7 a 14 dimensiones, un ajuste específico del proyecto que puede requerir adaptación para reutilización externa.
- Riesgo de sobreajuste a las demostraciones y a la configuración de recogida de datos; no se documentan sesgos específicos.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda citar el proyecto y verificar la procedencia de los datos de entrenamiento.
- Sin descargas ni likes en el momento de la consulta (0 descargas, 0 likes), lo que indica escasa validación por parte de la comunidad.
- No se documentan resultados de benchmarks ni métricas de éxito en test, lo que dificulta evaluar su calidad en producción.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Autobrik/ecse552-act-idm-E
- Dataset: https://huggingface.co/datasets/Autobrik/ecse552-ocbench-block
- Repositorio del proyecto: https://github.com/BrikHMP18/ecse-552-project
- Repositorio original de ACT: https://github.com/tonyzhaozh/act
