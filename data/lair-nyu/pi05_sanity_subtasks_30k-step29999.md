# lair-nyu/pi05_sanity_subtasks_30k-step29999

## Resumen

pi05_sanity_subtasks_30k-step29999 es un checkpoint de ajuste fino completo del modelo de robotica pi05 (familia openpi), desarrollado por el grupo lair-nyu. Se trata de un modelo de politica visomotora entrenado para controlar un robot a partir de observaciones visuales e instrucciones de tarea, orientado a la ejecucion de subtareas de manipulacion (recoger, ir a, colocar). El checkpoint corresponde al paso 29999 de un entrenamiento de 30 000 pasos con decaimiento de learning rate coseno.

El modelo se ha entrenado sobre el conjunto de datos de verificacion (sanity-check) YOR, con un muestreo equilibrado por habilidad de forma que las subtareas pick, go to y place aparecen con la misma frecuencia. Se reservaron 28 episodios como conjunto de validacion (holdout_seed=0), listados en el fichero `subtask_summary.json` incluido en el repositorio.

Es relevante como ejemplo de pipeline reproducible de ajuste fino de politicas roboticas con la libreria openpi: el repositorio incluye unicamente los pesos (`params/`), las estadisticas de normalizacion (`assets/norm_stats.json`) y metadatos del checkpoint, descartando el estado del optimizador. La carga requiere la configuracion de entrenamiento de pi-atlas, que aporta la arquitectura y las transformaciones de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de politica visomotora pi05, familia openpi) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | pesos en `params/` (formato de openpi, no especificado); estadisticas en `assets/norm_stats.json` |
| Tamano del repositorio | 12,4 GB |
| Pasos de entrenamiento | 30 000 (checkpoint en el paso 29999) |
| Libreria | openpi |
| Pipeline | robotics |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (full fine-tune) del modelo pi05 sobre el conjunto de datos YOR de verificacion, restringido a subtareas de manipulacion. El entrenamiento emplea muestreo equilibrado por habilidad, de modo que las subtareas pick, go to y place se muestrean con la misma probabilidad, y un decaimiento de learning rate coseno ajustado a la duracion total de 30 000 pasos. El checkpoint publicado corresponde al paso 29999.

El entrenamiento se realizo con la herramienta pi-atlas (configuracion `configs/pi05_sanity_subtasks_30k.py`, commit `e4b1c2c0d2d2a44a752c245c03c22850cc1020e5`) sobre el commit `c5efff14d4ea36a09a0b365cd0dc60a527027b73` de openpi. El repositorio incluye solo los pesos del modelo, las estadisticas de normalizacion y los metadatos del checkpoint; el estado del optimizador (`train_state/`) se ha eliminado, por lo que no es posible reanudar el entrenamiento desde este artefacto. El fichero `subtask_summary.json` documenta las subtareas de entrenamiento, el numero de chunks, las proporciones de muestreo y los episodios reservados. No se dispone de informacion sobre el numero de tokens, la composicion detallada del dataset ni el uso de RLHF o DPO.

## Capacidades

- Control de robot mediante politica visomotora: genera acciones a partir de observaciones visuales y de la tarea indicada.
- Ejecucion de subtareas de manipulacion: recoger (pick), desplazarse (go to) y colocar (place).
- Aprendizaje por imitacion a partir de datos de demostracion del dataset YOR.
- Integracion con la libreria openpi para carga y ejecucion de la politica.
- Carga condicionada a la configuracion de pi-atlas, que aporta arquitectura y transformaciones de datos.
- No se documentan capacidades de generacion de texto, codigo, matematicas, tool calling, agentes, vision general, audio ni modo de razonamiento explicito.

## Casos de uso

- Manipulacion robotica en laboratorio: el modelo puede ejecutar secuencias de pick, go to y place sobre el entorno del dataset YOR, sirviendo como punto de partida para experimentos de imitacion.
- Verificacion de pipelines de entrenamiento: al ser un checkpoint de "sanity-check", es util para validar que el flujo de pi-atlas y openpi funciona de extremo a extremo antes de lanzar entrenamientos mayores.
- Reproduccion de experimentos: la configuracion y los commits documentados permiten reproducir el ajuste fino y comparar resultados con los 28 episodios reservados.
- Evaluacion de politicas en entornos controlados: los episodios de holdout listados en `subtask_summary.json` permiten medir el rendimiento en tareas no vistas durante el entrenamiento.
- Base para ajuste fino posterior: al incluir solo pesos y estadisticas de normalizacion, puede reutilizarse como inicializacion para nuevas tareas, aunque requerira reconstruir el estado del optimizador si se desea continuar el entrenamiento.
- Docencia e investigacion en robotica: sirve como ejemplo concreto de ajuste fino de un modelo pi05 con muestreo equilibrado por habilidad y decaimiento coseno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 12,4 GB, lo que da una cota inferior orientativa del espacio necesario para cargar los pesos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el tamano de 12,4 GB sugiere que podria requerir GPUs con bastante memoria, pero no se confirma.
- Opciones de despliegue: carga mediante openpi con la configuracion de pi-atlas (`policy_config.create_trained_policy`). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de modelos comparables de la misma categoria (politicas roboticas pi05) ni sus especificaciones.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar el uso comercial ni las restricciones de redistribucion.
- El checkpoint no incluye el estado del optimizador, por lo que no es posible reanudar el entrenamiento tal cual.
- La carga requiere la configuracion de entrenamiento de pi-atlas; sin ella no se puede reconstruir la arquitectura ni las transformaciones de datos.
- Entrenado sobre un conjunto de verificacion (sanity-check) del dataset YOR, por lo que su generalizacion a otros entornos o tareas no esta documentada.
- Solo cubre las subtareas pick, go to y place del dataset; no se documentan otras habilidades.
- Sin informacion sobre sesgos, riesgo de alucinacion (poco aplicable a un modelo de politica, pero si a la ejecucion de acciones erroneas) ni comportamiento fuera de distribucion.
- Sin datos de benchmarks ni de rendimiento en los 28 episodios de holdout en la informacion disponible.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lair-nyu/pi05_sanity_subtasks_30k-step29999
- Repositorio pi-atlas: https://github.com/LucaMacesanu/pi-atlas
- Configuracion de entrenamiento: `configs/pi05_sanity_subtasks_30k.py` (commit `e4b1c2c0d2d2a44a752c245c03c22850cc1020e5`)
- openpi (commit `c5efff14d4ea36a09a0b365cd0dc60a527027b73`): no se proporciona URL directa en la informacion disponible.
