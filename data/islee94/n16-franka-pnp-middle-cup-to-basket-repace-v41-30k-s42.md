# islee94/n16-franka-pnp-middle-cup-to-basket-repace-v41-30k-s42

## Resumen

`n16-franka-pnp-middle-cup-to-basket-repace-v41-30k-s42` es un checkpoint de ajuste fino del modelo fundacional de robotica GR00T N1.6, desarrollado por NVIDIA, publicado por el usuario `islee94` en Hugging Face. No se trata de un modelo de lenguaje generalista, sino de una politica visomotora (vision-language-action, VLA) entrenada para una tarea concreta de manipulacion robotica: recoger un vaso de una posicion intermedia y depositarlo en una cesta (`pnp_middle_cup_to_basket`) con un brazo Franka.

El checkpoint corresponde a 30.000 actualizaciones de entrenamiento sobre datos reales de Franka retemporizados mediante el pipeline RePace v41 (identificador `pnpcup_repace_v41_ae09443`). El entrenamiento se ejecuto en 4 GPU A100 con un batch efectivo de 4 x 16 y semilla 42, partiendo del commit `179b98b` de GR00T N1.6. El autor indica explicitamente que la evaluacion en robot real esta pendiente, por lo que no existen resultados de exito en tarea publicados.

La relevancia de esta ficha es acotada: es un artefacto de investigacion reproducible (incluye manifiestos con hashes SHA-256, configuracion de experimento y estadisticas de dataset) mas que un modelo listo para produccion. Su interes radica en documentar el flujo de trabajo de ajuste fino de GR00T N1.6 sobre hardware real y en servir como referencia para quienes replican pipelines VLA con retargeting temporal de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.6 (modelo fundacional vision-language-action de NVIDIA; detalles internos de la arquitectura no disponibles en la informacion proporcionada) |
| Parametros totales | 3.286.608.832 (segun safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (dos shards: `model-00001-of-00002.safetensors`, `model-00002-of-00002.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de GR00T N1.6, la familia de modelos fundacionales de robotica de NVIDIA orientada a control visomotor. La informacion disponible no detalla la arquitectura interna (composicion de modulos de vision, lenguaje y accion, ni si emplea transformers, MoE o esquemas hibridos), por lo que ese dato debe consultarse en la documentacion oficial de GR00T N1.6. El checkpoint contiene unicamente archivos de inferencia, sin estado del optimizador, lo que reduce el tamano del repositorio a 6,6 GB.

El entrenamiento se realizo sobre datos reales de un robot Franka para la tarea `pnp_middle_cup_to_basket`, retemporizados con el pipeline RePace v41 (fichero `raven/repace_v41_max2_ae09443.json`). Se ejecutaron 30.000 actualizaciones con 4 GPU A100, batch de 4 por GPU con 16 pasos de acumulacion, semilla 42, partiendo del commit `179b98b` de GR00T N1.6. El repositorio incluye artefactos de trazabilidad: `raven/raven_context.txt`, `raven/pacedistill_manifest.json` y el manifiesto de RePace, todos con hashes SHA-256 verificables, ademas de `experiment_cfg/` con configuracion de entrenamiento, estadisticas de dataset y configuracion del procesador. No se especifica el numero de tokens, la composicion del dataset ni si se aplico RLHF o DPO (poco probable en un modelo de accion).

## Capacidades

- Control visomotor para manipulacion robotica: genera acciones a partir de observaciones visuales y del estado del robot para ejecutar la tarea de pick-and-place entrenada.
- Ejecucion de una tarea especifica: recoger un vaso en posicion intermedia y colocarlo en una cesta, sobre un brazo Franka.
- Inferencia con procesador asociado: incluye `processor_config.json` y `experiment_cfg/final_processor_config.json` para el preprocesado de observaciones.
- Identificacion de embodiment: fichero `embodiment_id.json` para seleccionar la configuracion de robot correcta.
- No se documentan capacidades de generacion de texto, razonamiento simbolico, codigo, matematicas, tool calling, agentes multi-paso, vision general, audio ni modo thinking. El uso previsto es exclusivamente robotico.

## Casos de uso

- Replicacion de experimentos VLA: sirve como punto de partida reproducible para validar el pipeline de ajuste fino de GR00T N1.6 con retargeting RePace v41, ya que incluye manifiestos con hashes y configuracion completa del experimento.
- Investigacion en retargeting temporal de datos: permite estudiar como afecta el retemporizado RePace v41 al aprendizaje de politicas de pick-and-place en comparacion con datos sin retemporizar.
- Benchmark interno de politicas de manipulacion: utilizable como baseline de 30.000 actualizaciones frente a otros checkpoints de la misma serie (por ejemplo, variantes con distinta semilla o numero de pasos) para medir sensibilidad al seed.
- Desarrollo de infraestructura de evaluacion en robot real: al estar la evaluacion pendiente, el checkpoint es adecuado para montar el banco de pruebas fisico de Franka y definir metricas de exito antes de comparar variantes.
- Docencia y formacion en robotica de aprendizaje: ejemplo completo de artefacto de entrenamiento (configs, estadisticas de dataset, trainer state) para explicar el ciclo de vida de un modelo VLA.
- Auditoria de reproducibilidad: los hashes SHA-256 de los manifiestos permiten verificar que los datos y la configuracion usados en el entrenamiento coinciden con los declarados por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la evaluacion en robot real esta pendiente (`robot evaluation pending`).

## Requisitos de hardware

- VRAM estimada para inferencia en precision original (safetensors, ~6,6 GB de pesos): aproximadamente 7-9 GB solo para pesos, mas memoria para activaciones y buffers del procesador; no se dispone de medicion oficial.
- GPU de entrenamiento utilizadas por el autor: 4 x A100 con batch 4 x 16 durante 30.000 actualizaciones.
- GPU recomendadas para inferencia: no disponible en la informacion proporcionada; por tamano, una GPU con 16 GB o mas (A100, H100, RTX 4090, RTX A6000) deberia ser suficiente, pero no esta verificado.
- Compatibilidad con GPU de consumo: probable en tarjetas con 12-16 GB o mas por el tamano de pesos, si bien no hay confirmacion del autor ni requisitos de latencia publicados.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un modelo de accion, el despliegue esperado es mediante el stack de inferencia de GR00T N1.6.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| n16-franka-pnp-middle-cup-to-basket-repace-v41-30k-s42 | 3.286.608.832 | no disponible | Pick-and-place Franka (vaso a cesta) | no disponible | Hugging Face, publico |
| GR00T N1.6 (base, commit 179b98b) | no disponible | no disponible | Politica VLA generalista | no disponible | Referencia del autor, no verificada en la informacion |
| Otros checkpoints de la serie `n16-franka-*` del mismo autor | no disponible | no disponible | Variantes de tarea/seed | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes ni con alternativas de otros autores (por ejemplo, OpenVLA o pi0), por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- Especializacion extrema: el modelo esta entrenado para una unica tarea (`pnp_middle_cup_to_basket`) y un unico embodiment (Franka); no generaliza a otras tareas sin reentrenamiento.
- Evaluacion pendiente: el autor no ha publicado tasas de exito en robot real, por lo que el rendimiento efectivo es desconocido.
- Sin licencia declarada: la ausencia de licencia explicita impide asumir permisos de uso comercial; debe contactarse con el autor o con NVIDIA para aclarar los terminos de GR00T N1.6.
- Sin idiomas ni contexto documentados: al no ser un modelo de lenguaje, no aplican metricas de contexto o multilingues, pero tampoco se documentan limites de horizonte temporal de la politica.
- Riesgo de sobreajuste al dataset: con 30.000 actualizaciones sobre un unico conjunto de datos retemporizados, es plausible un sobreajuste a las condiciones de iluminacion, posiciones y objetos del dataset original; no hay validacion cruzada publicada.
- Artefacto de investigacion: sin pipeline declarado, sin descargas ni likes, y con estado del optimizador omitido; no es un paquete listo para produccion.
- Dependencia del stack GR00T: requiere el codigo y las dependencias de GR00T N1.6 en el commit indicado para cargar configuracion, procesador y pesos correctamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/islee94/n16-franka-pnp-middle-cup-to-basket-repace-v41-30k-s42
- GR00T N1.6 (repositorio base referenciado por el autor, commit `179b98b`): no disponible como enlace directo en la informacion proporcionada
- Documentacion interna del autor (`internal/docs/servers/raven.md`): no accesible publicamente
- Manifiesto RePace v41 (`raven/repace_v41_max2_ae09443.json`): incluido en el repositorio del modelo
- Contexto de entrenamiento (`raven/raven_context.txt`): incluido en el repositorio del modelo
