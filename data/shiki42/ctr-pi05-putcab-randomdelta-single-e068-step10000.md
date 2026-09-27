# Shiki42/ctr-pi05-putcab-randomdelta-single-e068-step10000

## Resumen

`Shiki42/ctr-pi05-putcab-randomdelta-single-e068-step10000` es un checkpoint de inferencia publicado por el usuario Shiki42 dentro de la serie de experimentos CTR (acrónimo no desarrollado en la model card). Corresponde al experimento E068, concretamente al paso de optimizador 10000 de un entrenamiento con LoRA sobre un modelo identificado en el propio nombre del experimento como PI0.5, orientado a la tarea robótica PutCab del entorno RoboTwin.

El problema que aborda es de investigación en manipulación bimanual: la pregunta declarada por el autor es si un PI0.5 estándar con un único experto de acción, entrenado 10000 pasos sobre el conjunto "RandomDelta Train50", es capaz de aprender comportamientos temporales de bimanualidad más independientes. No es, por tanto, un modelo de propósito general ni un lanzamiento de producto, sino un artefacto de investigación reproducible.

El repositorio ocupa 6,3 GB e incluye parámetros, assets de normalización y metadatos; el estado del optimizador se excluye explícitamente. Se publicó el 27 de septiembre de 2026 con el objetivo declarado de preservar los checkpoints antes del apagado del host de entrenamiento. La información pública disponible no incluye especificaciones de arquitectura, recuento de parámetros, contexto, benchmarks ni detalles del dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el identificador del experimento referencia PI0.5; no se detalla en la informacion proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica a una politica robotica de accion) |
| Licencia | other (etiqueta `license: other`; no se adjunta texto de licencia en la informacion disponible) |
| Formato de pesos | no disponible (el repo de 6,3 GB contiene parametros, `assets/normalization` y metadatos; no se especifica el formato de serializacion) |

## Arquitectura y entrenamiento

No se dispone de la descripcion arquitectonica en la informacion proporcionada. El nombre del experimento indica que se parte de un modelo PI0.5 y que se aplica un ajuste LoRA (Low-Rank Adaptation) sobre un subconjunto del modelo, con una configuracion de "experto unico" frente a variantes multi-experto. El entrenamiento se realizo durante 10000 pasos de optimizador sobre el dataset denominado "PutCab RandomDelta Train50", correspondiente a la tarea de colocar una taza en RoboTwin. El checkpoint publicado es de inferencia: incluye parametros, assets de normalizacion y metadatos, y excluye el estado del optimizador, por lo que no permite reanudar el entrenamiento tal cual.

Tampoco se documentan en la model card el numero de tokens o trayectorias de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO (poco habituales en politicas visomotoras, donde el paradigma dominante es el imitation learning sobre demostraciones). La unica innovacion tecnica explicitamente mencionada es el uso de LoRA sobre un unico experto de accion para estudiar la independencia temporal de ambos brazos. La integridad del artefacto esta cubierta: cada fichero aparece listado con su SHA-256 en `SHA256SUMS`.

## Capacidades

- Generacion de acciones motoras para manipulacion robotica en el simulador RoboTwin, tarea PutCab (colocar una taza).
- Control bimanual: el experimento evalua explicitamente si se aprenden comportamientos temporales independientes entre ambos brazos.
- Ejecucion de politicas visomotoras a partir de observaciones, con normalizacion incluida en el propio repositorio (`assets/normalization`).
- Ajuste fino mediante LoRA, lo que implica que el checkpoint contiene el adaptador y los parametros asociados al entrenamiento E068.
- No se ha documentado en la informacion disponible soporte de tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingues, vision general, audio ni modo de pensamiento. Al tratarse de un checkpoint de robotica, estas capacidades no aplican en el sentido habitual.

## Casos de uso

- Reproduccion de experimentos de investigacion: cargar el checkpoint en el pipeline de entrenamiento de PI0.5 usado en el host original y replicar la evaluacion de la tarea PutCab, comparando el paso 10000 frente a otros pasos o variantes.
- Estudio de bimanualidad en politicas visomotoras: analizar las trayectorias generadas para determinar si el modelo produce coordinacion sincronizada o secuencias independientes por brazo, que es la pregunta central del experimento E068.
- Punto de partida para LoRA adicionales: al ser un adaptador de bajo rango, puede servir como inicializacion para nuevos ajustes sobre tareas relacionadas en RoboTwin sin reentrenar desde el modelo base.
- Benchmark interno de la serie CTR: comparar este checkpoint con otras variantes de la misma serie (multi-experto, distintos datasets o pasos) bajo una misma politica de evaluacion.
- Analisis de normalizacion y preprocesado: los assets de normalizacion incluidos permiten auditar como se escalan las observaciones y acciones, util para depurar discrepancias entre entrenamiento y despliegue.
- Docencia y formacion en robotica: servir como ejemplo reproducible de un pipeline completo de ajuste LoRA sobre una politica visomotora en un simulador estandar.
- Pruebas de regresion de infraestructura: verificar que un stack de inferencia (por ejemplo, el entorno de RoboTwin) carga correctamente checkpoints de 6,3 GB con metadatos y comprobaciones SHA-256.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el estado de evaluacion y las advertencias del experimento se registran en el registro del experimento CTR E068, pero ese registro no forma parte de la informacion proporcionada. No se incluyen tasas de exito en PutCab, metricas de RoboTwin, ni comparaciones cuantitativas con otras variantes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia derivada unicamente del tamano del repositorio (6,3 GB, con estado del optimizador excluido), si los pesos estuvieran en fp32 corresponderian a aproximadamente 1,5-1,6 mil millones de parametros; si estuvieran en bf16/fp16, a unos 3 mil millones. Es una estimacion no confirmada y depende de los assets y metadatos incluidos.
- GPU recomendadas: no disponible. Para pesos en el rango de 1,5-3 B, una GPU de 24 GB (RTX 3090, RTX 4090) seria suficiente para inferencia sin cuantizar en bf16 o fp32; no hay confirmacion por parte del autor.
- Cabe en GPU de consumo: probablemente si, en tarjetas de 16-24 GB, segun la estimacion anterior. No verificado.
- Opciones de despliegue: no se documentan. Al ser un checkpoint de politica robotica, las pilas de servido de LLM (vLLM, TGI, Ollama, llama.cpp) no son aplicables de forma estandar; el despliegue esperado es a traves del stack de entrenamiento e inferencia de PI0.5 integrado con RoboTwin.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos verificados en la informacion proporcionada para construir una comparativa cuantitativa. Como referencia cualitativa, la comparacion natural de este checkpoint es contra:

| Alternativa | Parametros | Contexto | Licencia | Disponibilidad | Datos verificados |
|---|---|---|---|---|---|
| Este checkpoint (E068, paso 10000) | no disponible | no disponible | other | HuggingFace, repo de 6,3 GB | solo metadatos del experimento |
| Modelo base PI0.5 | no disponible | no disponible | no disponible | citado en el nombre del experimento, no enlazado en la informacion | no disponible |
| Otras variantes CTR de la misma serie (multi-experto, otros pasos) | no disponible | no disponible | no disponible | presumiblemente en el mismo perfil de HuggingFace del autor | no disponible |

No se incluyen comparaciones con otras familias de politicas visomotoras (por ejemplo, OpenVLA o RDT) porque no hay datos de rendimiento de este checkpoint que permitan un contraste con rigor.

## Limitaciones y advertencias

- Ausencia total de evaluacion publicada: no hay tasas de exito, curvas de aprendizaje ni metricas en la model card, por lo que no puede afirmarse que el modelo resuelva la tarea PutCab de forma fiable.
- Artefacto de investigacion: el propio autor lo describe como un checkpoint intermedio (paso 10000) de un experimento, no como un modelo validado para produccion.
- Sin estado del optimizador: no se puede reanudar el entrenamiento desde este repositorio; solo sirve para inferencia o como inicializacion de nuevos ajustes.
- Sesgos: no documentados. Al entrenarse sobre un dataset propio ("RandomDelta Train50") y en simulador, es esperable una dependencia fuerte de la distribucion de ese conjunto, pero no hay analisis publicado en la informacion disponible.
- Riesgo de alucinacion: no aplica en el sentido de texto generado; en cambio existe el riesgo habitual de politicas de imitation learning de generalizar mal fuera de la distribucion de entrenamiento (posiciones, iluminacion, variaciones de objeto no vistas).
- Limitaciones de idioma y contexto: no aplica lenguaje natural; no se especifica ninguna ventana de contexto ni horizonte temporal de la politica.
- Restricciones de licencia: la etiqueta es `other` y no se adjunta el texto de la licencia en la informacion proporcionada, por lo que no puede confirmarse si se permite uso comercial. Debe consultarse el repositorio antes de cualquier uso en produccion.
- Especificidad de la tarea: el entrenamiento esta acotado a la tarea PutCab del simulador RoboTwin; no hay evidencia de transferencia a robot real ni a otras tareas.
- Cero traccion comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusion que permitan contrastar su comportamiento.
- Reproducibilidad: la ruta de origen en el host de entrenamiento se incluye como referencia, pero el entorno exacto (versiones, dependencias, hardware) no se documenta.

## Enlaces

- HuggingFace: https://huggingface.co/Shiki42/ctr-pi05-putcab-randomdelta-single-e068-step10000
- Fichero de integridad `SHA256SUMS` dentro del repositorio (referenciado en la model card)
- Registro del experimento CTR E068: no disponible como enlace en la informacion proporcionada
- Modelo base PI0.5: no disponible como enlace en la informacion proporcionada
- Entorno RoboTwin: no disponible como enlace en la informacion proporcionada
- Paper o blog tecnico: no disponible
