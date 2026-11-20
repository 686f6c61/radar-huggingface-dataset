# lair-nyu/pi05_sanity_subtasks_uniform-step14999

## Resumen

pi05_sanity_subtasks_uniform-step14999 es un checkpoint de un modelo de politica robotica (vision-language-action, VLA) basado en la arquitectura pi05 del proyecto openpi, publicado por el grupo lair-nyu. Se trata del paso final (step 14999) de un entrenamiento de sanity check realizado con la herramienta pi-atlas sobre la configuracion `pi05_sanity_subtasks_uniform`, cuyo objetivo es validar el pipeline de entrenamiento con subtareas uniformes sobre el conjunto `subtasks_uniform_v1`.

El modelo no es un modelo de lenguaje generalista, sino un checkpoint de robótica pensado para ser cargado mediante la libreria openpi y la configuracion de entrenamiento de pi-atlas, que aporta la arquitectura y las transformaciones de datos. El repositorio solo contiene los pesos (`params/`), las estadisticas de normalizacion (`assets/norm_stats.json`) y los metadatos del checkpoint; se ha eliminado el estado del optimizador (`train_state/`), por lo que no sirve para reanudar el entrenamiento.

Su relevancia es acotada: se trata de un artefacto de validacion interna (sanity check) con cero descargas y cero likes en el momento de la consulta, sin model card detallada sobre capacidades, datos de entrenamiento o rendimiento. La informacion publica disponible es muy limitada y la mayor parte de las especificaciones tecnicas no estan documentadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi05 (vision-language-action, openpi); detalles no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | pesos de openpi en `params/` (formato exacto no disponible); incluye `assets/norm_stats.json` |
| Tamano del repositorio | 12.4 GB |
| Libreria | openpi |
| Pipeline | robotics |
| Paso de entrenamiento | 14999 (final) |
| Configuracion de entrenamiento | `configs/pi05_sanity_subtasks_uniform.py` (pi-atlas, commit `cf6349bed0b3c86ee5b000294835e8d770a40ca9`) |
| Commit de openpi | `c5efff14d4ea36a09a0b365cd0dc60a527027b73 (dirty)` |

## Arquitectura y entrenamiento

La model card indica que el checkpoint se entreno con pi-atlas usando la configuracion `pi05_sanity_subtasks_uniform`, sobre la variante `subtasks_uniform_v1`, y que corresponde al paso final 14999. La arquitectura subyacente es pi05, integrada en el ecosistema openpi, pero no se detallan en la informacion disponible ni el numero de parametros, ni la composicion del dataset, ni el numero de tokens o episodios, ni si se aplicaron tecnicas de RLHF, DPO u otras.

El repositorio incluye un fichero `subtask_summary.json` que, segun el autor, lista las subtareas de entrenamiento, los recuentos de chunks, las proporciones de muestras y los episodios reservados (held-out). No se proporcionan esos valores en la informacion disponible. El nombre del experimento ("sanity") sugiere que se trata de una ejecucion de validacion del pipeline mas que de un modelo destinado a produccion.

## Capacidades

- Politica robotica de tipo vision-language-action: el modelo esta disenado para generar acciones a partir de observaciones visuales e instrucciones, segun el paradigma pi05/openpi.
- Entrenamiento con subtareas uniformes: el experimento `subtasks_uniform_v1` sugiere descomposicion de tareas en subtareas con muestreo uniforme, aunque no se detalla el efecto final.
- Carga mediante openpi y pi-atlas: requiere la configuracion de entrenamiento de pi-atlas para instanciar la arquitectura y las transformaciones de datos.
- Capacidades de lenguaje, razonamiento, codigo, matematicas, tool calling, agentes o multilingues: no disponibles en la informacion proporcionada.
- Modo thinking, vision, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Validacion de pipelines de entrenamiento VLA: el checkpoint sirve para comprobar que la configuracion `pi05_sanity_subtasks_uniform` de pi-atlas entrena y guarda correctamente, dado que es un run de sanity check con paso final documentado.
- Reproduccion de experimentos: permite reproducir el estado final del entrenamiento `subtasks_uniform_v1` cargando los pesos con la configuracion de pi-atlas y el commit de openpi indicados.
- Depuracion de transformaciones de datos: al incluir `assets/norm_stats.json`, se puede verificar que las normalizaciones de observaciones y acciones se aplican de forma coherente en inferencia.
- Analisis de subtareas: el fichero `subtask_summary.json` facilita inspeccionar la composicion de subtareas, chunks y episodios held-out del experimento.
- Punto de partida para fine-tuning: los pesos pueden servir como inicializacion para nuevos entrenamientos con pi-atlas, aunque el estado del optimizador no esta incluido.
- Pruebas de integracion con openpi: util para validar el flujo `policy_config.create_trained_policy` con un checkpoint real antes de desplegar modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 12.4 GB, lo que da una cota inferior aproximada del espacio necesario para los pesos en el formato original.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: carga mediante la libreria openpi y la configuracion de pi-atlas (`policy_config.create_trained_policy` con `registry.get_config("pi05_sanity_subtasks_uniform")`); no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros checkpoints pi05 comparables ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Modelo de sanity check: el propio nombre y la model card indican que es una ejecucion de validacion, no un modelo validado para produccion.
- Sin licencia declarada: no se especifica licencia, por lo que el uso comercial queda sin autorizacion explicita y debe consultarse con el autor.
- Sin idiomas declarados: no se documenta soporte linguistico alguno.
- Dependencia estricta de pi-atlas: la carga requiere la configuracion de entrenamiento de pi-atlas en el commit indicado; sin ella no se puede instanciar la arquitectura ni las transformaciones.
- Estado del optimizador eliminado: no es posible reanudar el entrenamiento desde este checkpoint, solo inferencia o inicializacion de nuevos runs.
- Commit de openpi marcado como `dirty`: el entorno de entrenamiento no estaba limpio, lo que puede afectar a la reproducibilidad exacta.
- Sin datos de sesgos, alucinacion o rendimiento: no hay informacion publica sobre estos aspectos.
- Cero descargas y cero likes: no hay evidencia de uso o validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/lair-nyu/pi05_sanity_subtasks_uniform-step14999
- Repositorio pi-atlas: https://github.com/LucaMacesanu/pi-atlas
- Configuracion de entrenamiento: `configs/pi05_sanity_subtasks_uniform.py` en el repositorio pi-atlas (commit `cf6349bed0b3c86ee5b000294835e8d770a40ca9`)
- Proyecto openpi: no se proporciona URL en la informacion disponible; el commit de referencia es `c5efff14d4ea36a09a0b365cd0dc60a527027b73`
