# Shiki42/s016-sortblocks-ctr-nomask-pi05-step20000-training-state

## Resumen

Shiki42/s016-sortblocks-ctr-nomask-pi05-step20000-training-state es un checkpoint de entrenamiento completo de pi0.5 (π₀.₅) publicado en Hugging Face dentro del ecosistema OpenPI. No es un modelo de lenguaje generalista ni un artefacto de inferencia: es el estado de entrenamiento de un experimento de robótica concreto (E765 / E765-R001) centrado en una tarea de ordenación de bloques (sortblocks) con control tipo CTR y sin consumo de pérdida IdleMask.

El autor, Shiki42, lo describe como el checkpoint original de la ejecución ctr_no_mask de la serie S016, correspondiente a 20.000 actualizaciones de optimizador con batch 16 y semilla 87431, entrenado sobre el dataset Shiki42/ctr-sortblocks-100ep-ctr en una revisión concreta. Frente al repositorio de solo inferencia que el mismo autor mantiene por separado, este incluye deliberadamente `train_state/` y `data_loader/`, es decir, el estado del optimizador y del cargador de datos, además de `params/`, `assets/` y `_CHECKPOINT_METADATA`.

Su relevancia es fundamentalmente de reproducibilidad y auditoría: permite reanudar o continuar el entrenamiento y verificar la procedencia del experimento mediante ficheros de proveniencia y sumas SHA-256. El propio autor advierte de que esta publicación no establece por sí sola una tasa de éxito de evaluación y que la auditoría está pendiente, por lo que debe tratarse como material de investigación, no como política lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (checkpoint de pi0.5 / OpenPI; el autor no detalla la topologia en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica / no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles; declarado en los metadatos del repositorio) |
| Licencia | no disponible |
| Formato de pesos | no disponible (checkpoint OpenPI con directorios `params/`, `assets/`, `train_state/`, `data_loader/` y `_CHECKPOINT_METADATA`) |
| Tamano del repositorio | 9,5 GB (375 archivos, 9.542.919.117 bytes) |
| Libreria / pipeline | openpi / robotics |
| Descargas y likes | 0 descargas, 0 likes |
| Fecha de creacion | 2026-09-23 |

## Arquitectura y entrenamiento

La model card identifica el artefacto como un checkpoint de entrenamiento de PI0.5 dentro de OpenPI, pero no describe la arquitectura interna (tipo de backbone, encoder visual, cabecera de acciones, numero de parametros ni mecanismo de atencion). Tampoco se documenta la composicion del dataset de entrenamiento mas alla de su identificador y revision: Shiki42/ctr-sortblocks-100ep-ctr, revision `9ee0f9d8e0700df5fac08454e7e213c4904d3024`, orientado a una tarea de ordenacion de bloques. Todo lo relativo a la topologia debe consultarse en los repositorios de OpenPI y en el material de referencia sobre pi0.5, no en esta ficha.

Los datos de entrenamiento si estan acotados con precision: 20.000 actualizaciones de optimizador, batch de tamano 16, semilla 87431 y commit de CTR `5c0e6d68ebaba70ecf69e20b05d3ff0d48579c68`. Se indica explicitamente que el consumo de perdida IdleMask es `false`, lo que diferencia esta ejecucion de las variantes con mascara. La reproducibilidad se sostiene sobre `resolved_config.json`, `training-provenance.json` y `resume-provenance.json`, que ligan configuracion, dataset, runtime y Run, mas un fichero `SHA256SUMS` que fija cada archivo publicado. Se proporcionan ademas dos hashes de integridad: el manifiesto de runtime (`06e035fb...503332`) y el recibo de cualificacion del checkpoint (`70fa1646...1b4657`). No se documenta en la informacion disponible ningun proceso de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Generacion de acciones de robot para una politica entrenada especificamente en la tarea de ordenacion de bloques (sortblocks) del experimento S016.
- Ejecucion de politica de manipulacion en el marco OpenPI; el pipeline declarado es `robotics`.
- Reanudacion de entrenamiento: al incluir `train_state/`, conserva el estado del optimizador necesario para continuar las actualizaciones.
- Reanudacion de carga de datos: el directorio `data_loader/` preserva el estado del cargador de datos del experimento.
- Trazabilidad y auditoria: los ficheros de proveniencia y las sumas SHA-256 permiten verificar la procedencia y la integridad del checkpoint.
- Capacidades de razonamiento general, codigo, matematicas, vision generativa, tool calling o uso de agentes: no disponibles; no se declaran en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el unico idioma declarado es ingles.
- Modo thinking, audio o vision como capacidades generales: no disponibles.

## Casos de uso

- Reproduccion de experimentos de investigacion: cargar el checkpoint con `train_state/` para replicar el estado exacto del entrenamiento en el paso 20.000 y comparar con otras variantes de la misma serie S016.
- Continuacion del entrenamiento hasta 30.000 pasos: el autor indica que esa continuacion requiere su propio flujo de restauracion registrado y cualificado, por lo que este checkpoint seria el punto de partida de ese procedimiento.
- Auditoria de procedencia en publicaciones cientificas: verificar `SHA256SUMS`, el manifiesto de runtime y el recibo de cualificacion antes de citar resultados derivados del modelo.
- Linea base para comparativas controladas: al estar vinculado a un dataset con revision fija y a una configuracion resuelta, sirve como referencia reproducible frente a variantes con mascara o con otros hiperparametros.
- Estudio del efecto de IdleMask: este run tiene `IdleMask loss consumption: false`, lo que permite contrastarlo con los checkpoints de variante `mask-act` publicados por el mismo autor.
- Desarrollo y depuracion de pipelines de robotica en simulacion: usar el checkpoint para validar integraciones con la libreria openpi antes de desplegar en hardware real.
- Investigacion en manipulacion bimanual: el ecosistema del autor incluye datasets y checkpoints de tareas con dos brazos, de modo que este checkpoint sirve de punto de partida metodologico para ese tipo de politica.
- Formacion y divulgacion tecnica: material para explicar como se publican checkpoints de entrenamiento completos con proveniencia verificable, en contraste con los repositorios de solo inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que esta publicacion, por si sola, no establece una tasa de exito de evaluacion ni la cualificacion de la continuacion a 30.000 pasos, y que la auditoria esta pendiente.

| Benchmark | Resultado |
|---|---|
| Tasa de exito en la tarea sortblocks | no disponible |
| Cualquier metrica MMLU, HumanEval, GSM8K o similar | no aplica (modelo de robotica, no de lenguaje generalista) |

## Requisitos de hardware

- Espacio en disco: 9,5 GB para el repositorio completo (375 archivos, 9.542.919.117 bytes). Al incluir estado de optimizador y de cargador de datos, el subconjunto de parametros necesario para inferencia es menor que esa cifra.
- VRAM estimada para inferencia: no disponible; no se documenta en la informacion proporcionada.
- VRAM estimada para reanudar entrenamiento: no disponible; requiere adicionalmente el estado del optimizador y del cargador de datos, por lo que sera superior a la de inferencia.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no se puede confirmar con los datos disponibles; el tamano del repositorio no permite deducir la huella de memoria en inferencia.
- Opciones de despliegue: la libreria declarada es openpi. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponible. El autor publica un repositorio separado de solo inferencia, lo que sugiere que este no es el artefacto recomendado para servir el modelo.

## Comparativa con modelos similares

La comparacion cuantitativa no es posible porque no se publican parametros, contexto ni metricas de ninguno de los artefactos. La tabla recoge unicamente lo verificable.

| Modelo | Tipo | Paso / actualizaciones | Mascara | Estado incluido | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Shiki42/s016-sortblocks-ctr-nomask-pi05-step20000-training-state | Checkpoint de entrenamiento pi0.5 (sortblocks, ctr_no_mask) | 20.000 | No | `params/`, `assets/`, `train_state/`, `data_loader/` | no disponible | Publico en Hugging Face, 0 descargas |
| Shiki42/s016-sortblocks-ctr-mask-act-step100000 | Checkpoint pi0.5, variante con mascara | 100.000 | Si | no disponible | no disponible | Publico en Hugging Face |
| Shiki42/ctr-pi05-pick-dual-bottles-sequential-no-idlemask-e524-step10000 | Checkpoint pi0.5, tarea pick dual bottles | 10.000 | No | no disponible | no disponible | Publico en Hugging Face |
| Implementaciones OpenPI de referencia (por ejemplo, qrafty-ai/pi-openpi) | Codigo de entrenamiento e inferencia | no aplica | no aplica | no aplica | no disponible | Publico en GitHub |

## Limitaciones y advertencias

- Es un checkpoint de entrenamiento, no un modelo de inferencia optimizado: incluye estado de optimizador y de cargador de datos, por lo que no es el artefacto adecuado para servir el modelo en produccion.
- El propio autor declara que esta publicacion no establece una tasa de exito de evaluacion y que la auditoria esta pendiente. No deben atribuirse a este checkpoint resultados de rendimiento no verificados.
- La continuacion a 30.000 pasos exige su propio flujo de restauracion registrado y cualificado; este repositorio no cubre esa cualificacion.
- Especializacion estrecha: el entrenamiento se limita al dataset ctr-sortblocks-100ep-ctr y a una tarea concreta de ordenacion de bloques. No hay evidencia de generalizacion a otras tareas.
- Licencia no disponible: no se puede determinar si el uso comercial esta permitido. Antes de cualquier uso en produccion debe aclararse con el autor.
- Idioma: solo se declara ingles. No hay soporte multilingue documentado.
- Sesgos: no disponibles. No se documenta ninguna evaluacion de sesgo ni de comportamiento fuera de distribucion.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe riesgo de comportamiento erroneo de la politica fuera de las condiciones de entrenamiento (por ejemplo, cambios de iluminacion, objetos o dinamica no representados).
- Trazabilidad dependiente de la revision del dataset: los resultados solo son reproducibles si se usa la revision `9ee0f9d8e0700df5fac08454e7e213c4904d3024` y el entorno registrado en el manifiesto de runtime.
- Cero descargas y cero likes: el artefacto no cuenta con validacion de la comunidad en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shiki42/s016-sortblocks-ctr-nomask-pi05-step20000-training-state
- Dataset de entrenamiento: https://huggingface.co/datasets/Shiki42/ctr-sortblocks-100ep-ctr
- Checkpoint relacionado (variante con mascara): https://huggingface.co/Shiki42/s016-sortblocks-ctr-mask-act-step100000
- Checkpoint relacionado (pick dual bottles): https://huggingface.co/Shiki42/ctr-pi05-pick-dual-bottles-sequential-no-idlemask-e524-step10000
- Guia de entrenamiento e inferencia con pi0.5: https://huggingface.co/blog/Tonic/training-and-inference-with-pi05
- Implementacion OpenPI de referencia en GitHub: https://github.com/qrafty-ai/pi-openpi
- Ficha de dataset de manipulacion bimanual en simulacion (cohorte relacionada): https://claru.ai/datasets/shiki42-ctr-pick-dual-bottles-original-20260919
