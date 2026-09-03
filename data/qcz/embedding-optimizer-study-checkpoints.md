# qcz/embedding-optimizer-study-checkpoints

## Resumen

Este repositorio no contiene un modelo desplegable, sino una copia de seguridad completa de los checkpoints de entrenamiento del estudio "embedding-optimizer-study" del autor qcz. El estudio compara de forma reproducible los optimizadores AdamW, Muon y NorMuon para el ajuste fino supervisado de los modelos de embeddings DenseOn-unsupervised y LateOn-unsupervised de lightonai. El repositorio preserva el árbol de directorios `outputs/` del proyecto original, con 251 directorios de checkpoints que incluyen pesos del modelo y, cuando se generaron, estados de optimizador, scheduler, RNG, scaler y trainer state necesarios para reanudar el entrenamiento en otra máquina.

La relevancia de este repositorio es metodológica: permite auditar, reanudar y analizar los experimentos del estudio, que construye un conjunto de entrenamiento compartido de 500.000 consultas, ejecuta 24 trabajos de entrenamiento controlados y evalúa cinco checkpoints de cada trabajo en 14 conjuntos de datos BEIR descontaminados. El repositorio distingue entre evidencia formal (directorios `confirmatory/` y `dense/`), análisis de espacio de pesos (`short-branch/`) y ejecuciones legadas o invalidadas (`late/`, `quarantine/`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en lightonai/DenseOn-unsupervised (sentence-transformers); detalles de arquitectura del modelo base no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repositorio de checkpoints de entrenamiento, no de inferencia) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (los pesos derivados estan sujetos a los terminos del repositorio del modelo base; el codigo del proyecto se licencia bajo Apache License 2.0) |
| Formato de pesos | safetensors (formato de checkpoints de Hugging Face/Trainer) |

## Arquitectura y entrenamiento

El repositorio no documenta una arquitectura propia: contiene los checkpoints de un estudio de optimizadores sobre el modelo base DenseOn-unsupervised de lightonai, un modelo de embeddings densos para recuperacion de informacion entrenado con sentence-transformers. El estudio construye un conjunto de entrenamiento compartido de 500.000 consultas y ejecuta 24 trabajos controlados que combinan tres optimizadores (AdamW, Muon y NorMuon), tres semillas frescas y cinco etapas de entrenamiento, con controles de AdamW emparejados por routing en los directorios `hybrid-adamw/`.

La innovacion tecnica del estudio no esta en la arquitectura del modelo, sino en la metodologia de comparacion de optimizadores: evaluacion de cinco checkpoints por trabajo en 14 conjuntos BEIR descontaminados, analisis de espacio de pesos en cinco etapas (directorio `short-branch/`) y separacion estricta entre evidencia formal, ejecuciones diagnosticas y ejecuciones invalidadas (`quarantine/`). El alcance actual del paper se limita a recuperacion densa (Dense); las ejecuciones LateOn se excluyen de la evidencia formal.

## Capacidades

- No es un modelo desplegable: es un repositorio de checkpoints de entrenamiento para investigacion.
- Permite reanudar entrenamiento interrumpido: los checkpoints incluyen estado de optimizador, scheduler, RNG, scaler y trainer state cuando se generaron.
- Permite reproducir el estudio completo: 24 trabajos controlados con tres optimizadores, tres semillas y cinco etapas.
- Permite analisis de espacio de pesos: el directorio `short-branch/` contiene 45 checkpoints de una rama Dense de inicio compartido para analisis local/global y de espacio de pesos.
- Permite auditar experimentos: el directorio `quarantine/` documenta ejecuciones invalidadas para trazabilidad.
- Evaluacion sobre recuperacion de informacion: los checkpoints se evaluan en 14 conjuntos BEIR descontaminados.

## Casos de uso

- Reproduccion de resultados cientificos: un investigador puede descargar los checkpoints `confirmatory/` y re-evaluar los cinco checkpoints de cada trabajo en los 14 conjuntos BEIR para verificar las tablas del paper.
- Reanudacion de entrenamiento: si un trabajo de entrenamiento se interrumpio, los estados de optimizador y scheduler permiten continuar desde el punto exacto sin perder dinamica de entrenamiento.
- Analisis de espacio de pesos: los 45 checkpoints de `short-branch/` permiten estudiar la trayectoria de los pesos a lo largo de cinco etapas y comparar el comportamiento de AdamW, Muon y NorMuon.
- Comparacion de optimizadores para embeddings: un equipo que entrena modelos de recuperacion densa puede usar los checkpoints para decidir que optimizador converge mejor en su tarea.
- Auditoria de experimentos: los directorios `quarantine/` y `late/` documentan ejecuciones invalidadas o excluidas, lo que permite auditar que resultados se descartaron y por que.
- Migracion de maquina: el repositorio esta disenado como copia de seguridad completa del directorio `outputs/` para migrar el proyecto a otro hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El estudio evalua cinco checkpoints de cada uno de los 24 trabajos en 14 conjuntos de datos BEIR descontaminados, pero los numeros concretos no estan incluidos en la model card ni en los resultados de busqueda. Los artefactos de analisis se encuentran en el dataset separado `qcz/embedding-optimizer-study-analysis-artifacts`.

## Requisitos de hardware

- Tamano del repositorio: 380,8 GB en disco; la huella local al inicio de la copia era de aproximadamente 389 GiB.
- Almacenamiento: se necesita al menos 400 GB libres para descargar el repositorio completo; para transferencias parciales se puede usar `--include` con directorios concretos (por ejemplo, `confirmatory/**`).
- GPU: no especificada; los checkpoints incluyen estados de entrenamiento (optimizador, scheduler, scaler) que requieren VRAM adicional si se reanuda el entrenamiento.
- Opciones de despliegue: no aplicable; no es un modelo de inferencia. Para reanudar entrenamiento se usa el codigo del repositorio fuente `qcznlp/embedding-optimizer-study`.
- Herramientas: se requiere `huggingface_hub` reciente para la descarga con `hf download`.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo comparable con alternativas de la misma categoria: es un artefacto de investigacion (backup de checkpoints) para un estudio de optimizadores. La comparativa relevante es interna al estudio: AdamW frente a Muon frente a NorMuon sobre DenseOn-unsupervised, cuyos resultados se publican en el repositorio fuente.

## Limitaciones y advertencias

- No es un modelo desplegable: no se puede usar para inferencia directa; es un backup de checkpoints de entrenamiento.
- Licencia no especificada: la model card no declara licencia; los pesos derivados estan sujetos a los terminos del repositorio del modelo base (lightonai/DenseOn-unsupervised). El codigo del proyecto se licencia bajo Apache License 2.0.
- Riesgo de mezclar checkpoints: el README advierte explicitamente que no se deben mezclar directorios de checkpoints entre ejecuciones; cada checkpoint esta vinculado a su run id, semilla, optimizador, learning rate, corpus y etapa.
- Ejecuciones invalidadas: el directorio `quarantine/` contiene 13 ejecuciones diagnosticas invalidadas que no deben usarse como evidencia formal.
- Alcance limitado: el alcance actual del paper es solo recuperacion densa (Dense); las ejecuciones LateOn (60 directorios en `late/` y 2 en `hybrid-adamw/late/`) estan excluidas de la evidencia formal.
- Sin datos de rendimiento: no se incluyen resultados de benchmarks en la informacion disponible; los numeros estan en el repositorio fuente y en los artefactos de analisis.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/qcz/embedding-optimizer-study-checkpoints
- Artefactos de analisis (dataset): https://huggingface.co/datasets/qcz/embedding-optimizer-study-analysis-artifacts
- Repositorio fuente en GitHub: https://github.com/qcznlp/embedding-optimizer-study
- README del repositorio fuente: https://github.com/qcznlp/embedding-optimizer-study/blob/main/README.md
