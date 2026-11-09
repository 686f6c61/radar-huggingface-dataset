# Autobrik/ecse552-act-original

## Resumen

`Autobrik/ecse552-act-original` es un checkpoint de robótica basado en ACT (Action Chunking with Transformers), el algoritmo de imitación propuesto por Tony Z. Zhao y colaboradores en el repositorio `tonyzhaozh/act`. Lo publica el usuario Autobrik como artefacto del proyecto de la asignatura ECSE 552 de la Universidad McGill, titulado *Learning to Manipulate a New Object from Action-Free Videos*. No es un modelo de lenguaje: es una política de control visuomotor entrenada por imitación para manipular un objeto concreto en un entorno de banco de pruebas (block manipulation).

El checkpoint se entrena sobre el dataset `Autobrik/ecse552-ocbench-block` en una revisión fija (`aa4e3ee`) y mantiene el código de ACT sin modificar, con adaptaciones mínimas: entrada únicamente de imágenes (el estado del robot se pone a cero), acciones de 7 dimensiones rellenadas con ceros hasta las 14 del original, episodios de longitud variable y chunks de 20 acciones a 10 Hz (2 segundos de horizonte, frente a los 100 pasos a 50 Hz de ACT original). Las acciones son objetivos articulares absolutos.

Su relevancia es acotada y de carácter académico: sirve como referencia reproducible de ACT en un dataset pequeño y como línea base para comparar métodos que aprenden de vídeos sin acciones. No hay métricas publicadas en la información disponible, ni pesos en formato estándar de inferencia general, ni soporte multilingüe (no aplica).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer condicionado por observaciones visuales que predice chunks de acciones |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; horizonte de chunk de 20 acciones a 10 Hz (2 s) |
| Tipos de cuantizacion | no disponible (checkpoints PyTorch `.ckpt`) |
| Idiomas soportados | no disponible (no aplica; modelo de robótica) |
| Licencia | MIT |
| Formato de pesos | checkpoints PyTorch (`.ckpt`): `policy_best.ckpt`, `policy_last.ckpt`, `selected.ckpt`; estadísticas en `dataset_stats.pkl` |

## Arquitectura y entrenamiento

ACT es una política de imitación basada en transformer que, dada una observación visual, predice un chunk de acciones futuras en lugar de una acción por paso. Esta predicción por chunks reduce el error de composición y suaviza el comportamiento en tareas de manipulación fina. En esta variante se conserva el código original de `tonyzhaozh/act` sin modificar, con las siguientes desviaciones documentadas: solo se usan imágenes (el vector de estado del robot se anula), las 7 dimensiones de acción del proyecto se rellenan con ceros hasta las 14 de ACT, los episodios tienen longitud variable y el chunk es de 20 acciones a 10 Hz (equivalente temporal a los 100 pasos a 50 Hz del original). Las acciones son objetivos articulares absolutos.

El entrenamiento se realiza sobre el dataset `Autobrik/ecse552-ocbench-block` (revisión `aa4e3eecc9b7266f561923be09f848c63cbe3088`), con configuraciones por número de demostraciones y semilla (`n<demos>/seed<k>/`). No se especifican en la información disponible el número de tokens, la composición del dataset, ni si se aplicó RLHF/DPO (no procede en imitación supervisada). Cada ejecución incluye `policy_best.ckpt` (menor pérdida de validación), `policy_last.ckpt`, `selected.ckpt` (el mejor de los dos según rollouts de validación en el dominio fuente), `selection.json`, `dataset_stats.pkl`, `act_run.json`, `history.json` y `provenance.json`. La carga se hace con `action_free.act_original.ActPolicy("n300/seed0/selected.ckpt", device)`.

## Capacidades

- Control visuomotor por imitación: predice chunks de 20 acciones absolutas de articulaciones a 10 Hz a partir de imágenes.
- Manipulación de un objeto concreto (block manipulation) en el entorno de banco de pruebas del proyecto ECSE 552.
- Aprendizaje a partir de demostraciones, con variantes por número de demos y semilla para estudiar la sensibilidad a los datos.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso en el sentido de LLM; el "multi-step" se limita a la ejecución secuencial de chunks.
- Sin capacidades multilingües (no aplica).
- Sin modo thinking, visión general, audio ni otras capacidades fuera del pipeline de robótica.

## Casos de uso

- Línea base reproducible para ACT: cargar `selected.ckpt` con `ActPolicy` y ejecutar rollouts en el entorno `ocbench-block` para comparar métodos que aprenden de vídeos sin acciones, que es el objetivo del proyecto.
- Estudio de escalado con demostraciones: los directorios `n<demos>/seed<k>/` permiten analizar cómo varía la pérdida de validación y el éxito en test al aumentar el número de demos, con varias semillas para estimar varianza.
- Análisis de ablaciones de observación: al anular el estado del robot y usar solo imágenes, sirve para medir cuánto aporta la propriocepción frente a la visión pura en esta tarea.
- Evaluación de selección de checkpoints: `selection.json` y los rollouts de validación permiten estudiar la correlación entre pérdida de validación y éxito real en el dominio fuente.
- Reproducción académica: docentes e investigadores pueden replicar el pipeline completo (dataset, config `configs/act_original.toml`, adaptador `src/action_free/act_original.py`) para verificar resultados.
- Punto de partida para fine-tuning en un objeto nuevo: el checkpoint entrenado puede servir como inicialización en tareas de manipulación similares dentro del mismo banco de pruebas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; ACT es un transformer relativamente pequeño y suele caber en GPU de consumo, pero no se confirma el tamaño en este checkpoint.
- GPU recomendadas: no disponible; por la naturaleza del modelo, una GPU NVIDIA con CUDA es el requisito práctico para cargar los `.ckpt` con PyTorch.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible.
- Opciones de despliegue: carga mediante `action_free.act_original.ActPolicy` del repositorio del proyecto; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de política).
- Latencia y throughput: no disponible; el control opera a 10 Hz por diseño del chunk.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Autobrik/ecse552-act-original | ACT (imitación visuomotora) | no disponible | chunk de 20 acciones a 10 Hz | MIT | Hugging Face, 0 descargas |
| tonyzhaozh/act (original) | ACT (imitación visuomotora) | no disponible | chunk de 100 acciones a 50 Hz | MIT (repositorio) | GitHub |
| Alternativas tipo Diffusion Policy | Política de imitación por difusión | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

No se dispone de datos de rendimiento comparables en la información proporcionada.

## Limitaciones y advertencias

- Ámbito muy restringido: entrenado para un único objeto y entorno (`ocbench-block`); no generaliza a otras tareas sin reentrenamiento o fine-tuning.
- Sin métricas publicadas: no hay resultados de éxito en test ni comparaciones verificables en la información disponible.
- Estado del robot anulado: al usar solo imágenes, puede rendir peor que ACT con propriocepción en tareas que la requieran.
- Acciones absolutas de articulaciones: dependen de la calibración y cinemática del robot concreto; no son portables directamente a otro hardware.
- Riesgo de sobreajuste con datasets pequeños: las variantes por número de demos y semilla sugieren sensibilidad a los datos; conviene revisar `history.json` y `selection.json`.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías ni soporte; el checkpoint es un artefacto académico.
- Sin soporte de idiomas, tool calling ni agentes: no debe evaluarse con criterios de LLM.
- Fecha de creación futura en los metadatos (2026-11-09): conviene verificar la integridad y procedencia antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Autobrik/ecse552-act-original
- Dataset: https://huggingface.co/datasets/Autobrik/ecse552-ocbench-block
- Repositorio de ACT original: https://github.com/tonyzhaozh/act
- Código del proyecto: https://github.com/BrikHMP18/ecse-552-project
