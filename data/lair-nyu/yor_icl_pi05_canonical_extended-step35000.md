# lair-nyu/yor_icl_pi05_canonical_extended-step35000

## Resumen

`lair-nyu/yor_icl_pi05_canonical_extended-step35000` es un checkpoint de politica robotica de manipulacion entrenado con la receta pi0.5 de openpi, publicado por el grupo lair-nyu. Corresponde al brazo 2 (canonical, sin condicionamiento por recuperacion) de una comparativa interna: es la linea base "plain pi0.5" frente a los brazos 3-6, que si usan condicionamiento VICTR-retrieval sobre exactamente los mismos episodios y la misma codificacion de estado y accion. Su interes es, por tanto, metodologico: sirve para aislar el efecto de la recuperacion en un pipeline de imitacion con aprendizaje en contexto.

El modelo opera sobre un espacio canonico de dos brazos: observa un estado de 18 dimensiones (9 por brazo: posicion absoluta del efector final en 3 dimensiones mas orientacion rot6d en 6 dimensiones) y emite acciones de 20 dimensiones (10 por brazo: delta de posicion del efector final, orientacion rot6d absoluta y apertura de pinza). No incluye informacion de elevacion ni de base, y el estado no incluye la pinza. El horizonte de accion configurado es de 30 pasos.

El checkpoint se publica en el paso 35000 de un objetivo de 50000 pasos de entrenamiento, sobre un subconjunto de 20 tareas y 1186 episodios derivado del conjunto ampliado de 31 tareas y 1784 episodios. El repositorio ocupa 12,4 GB y solo contiene pesos (`params/`), estadisticas de normalizacion (`assets/`) y metadatos del checkpoint; no incluye el estado del optimizador ni la arquitectura o las transformaciones de datos, por lo que cargarlo exige disponer del repositorio de entrenamiento con la configuracion `yor_icl_pi05_canonical_extended`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | politica pi0.5 de openpi, configurada como `pi0_config.Pi0Config(pi05=True, action_horizon=30)`; detalles internos del backbone no disponibles |
| Parametros totales | no disponible (el repositorio de pesos ocupa 12,4 GB; no se indica el recuento) |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible (el horizonte de accion es de 30 pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (modelo de politica robotica, no de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | checkpoint en directorio `params/` con `assets/norm_stats.json` y `_CHECKPOINT_METADATA`; formato concreto de serializacion no especificado (no se mencionan safetensors ni GGUF) |

Dimension del estado de observacion: 18 (9 por brazo: posicion 3 + rot6d 6).
Dimension de la accion: 20 (10 por brazo: delta_pos 3 + rot6d 6 + pinza 1).

## Arquitectura y entrenamiento

El checkpoint es una politica de manipulacion de la familia pi0.5 instanciada mediante `pi0_config.Pi0Config` con `pi05=True` y `action_horizon=30`. La politica consume un estado de 18 dimensiones construido a partir de `observation.left_ee` y `observation.right_ee` del conjunto `icl-dataset-fixed-obs`: posicion y cuaternion (xyz + quat) obtenidos por cinematica directa desde los encoders reales de las articulaciones, convertidos a rot6d mediante `quat_wxyz_to_rot6d` de `openpi.policies.yor_rotation`. La representacion rot6d es invariante de hemisferio por construccion (evita la ambiguedad de signo del cuaternion). El mapeo de entradas se implementa en la clase `YorInputsCanonical` (`openpi/src/openpi/policies/yor_policy.py`).

La salida es una accion de 20 dimensiones: por brazo, delta de posicion del efector final relativo al primer fotograma de la propia ventana de consulta, orientacion rot6d absoluta y apertura de pinza. No se modelan ni la elevacion ni la base. El entrenamiento usa el subconjunto canonical-extended de `icl-dataset` (20 tareas, 1186 episodios, listado en `assets/yor_icl_canonical_extended_episodes.json`), recortado del conjunto expanded original (31 tareas, 1784 episodios, documentado en `notes/ICRA_plan.md`, seccion 1b). Este brazo no emplea condicionamiento por recuperacion; su proposito es servir de control frente a los brazos con VICTR-retrieval entrenados con los mismos episodios y la misma codificacion de estado y accion. No se detalla el numero de tokens, la composicion exacta del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generacion de acciones motoras para manipulacion robotica bimanual: produce secuencias de 30 pasos de acciones de 20 dimensiones.
- Control del efector final en espacio cartesiano: deltas de posicion y orientacion rot6d absoluta por brazo.
- Control de pinza: una dimension de apertura por brazo, incluida en el vector de accion (aunque ausente del estado de observacion).
- Aprendizaje en contexto sobre episodios de demostracion (la nomenclatura `yor_icl` y la comparacion con brazos de recuperacion sugieren evaluacion de ICL, si bien la model card no describe el mecanismo explicitamente).
- Capacidad de actuar como linea base ablativa en experimentos controlados de recuperacion de contexto.
- No se documentan capacidades de generacion de lenguaje, tool calling, function calling, razonamiento multi-paso, vision general, audio ni modo "thinking".
- Idiomas soportados: no disponibles.

## Casos de uso

- Linea base en estudios de ablation sobre recuperacion: comparar este checkpoint (sin retrieval) con los brazos VICTR-retrieval 3-6 entrenados sobre los mismos episodios permite medir el efecto aislado del condicionamiento por recuperacion en el exito de la tarea.
- Punto de partida para reentrenamiento o ajuste fino: con la configuracion `yor_icl_pi05_canonical_extended` del repositorio de entrenamiento, el checkpoint se puede cargar con `policy_config.create_trained_policy` y continuar o adaptar el entrenamiento a otro subconjunto de tareas.
- Manipulacion bimanual con control cartesiano del efector final: util en montajes donde se controla la pose del efector final en lugar de las articulaciones, gracias a la accion de delta de posicion mas rot6d absoluta por brazo.
- Tareas de recogida y colocacion con pinza: la dimension de pinza por brazo permite ejecutar agarres simples, como en el checkpoint hermano de sanity check orientado a "easy pick and place".
- Investigacion en representaciones de rotacion: al usar rot6d invariante de hemisferio derivado de cuaterniones via cinematica directa, sirve para estudiar la estabilidad de politicas ante discontinuidades de representacion.
- Evaluacion de generalizacion con pocos datos por tarea: el subconjunto canonical-extended tiene 1186 episodios repartidos en 20 tareas, por lo que es util para medir generalizacion entre tareas con presupuesto de datos limitado.
- Reproducibilidad de resultados academicos: al fijar el paso 35000 y publicar solo pesos y estadisticas de normalizacion, facilita replicar experimentos con un punto de control concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo (los resultados obtenidos correspondian al software OBS Studio) y la model card no incluye tablas de exito de tarea, tasas de exito en simulacion ni comparaciones numericas con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. A modo orientativo, el repositorio de pesos ocupa 12,4 GB; si los pesos estan en fp32 corresponderian a unos 3.100 millones de parametros y si estan en bf16 a unos 6.200 millones, pero el formato y la precision no se especifican, por lo que estas cifras no deben tomarse como confirmadas.
- GPU recomendadas: no disponibles. La model card no indica hardware de entrenamiento ni de inferencia.
- Encaje en GPU de consumo: no confirmado. No se documenta si la politica cabe en tarjetas consumer.
- Opciones de despliegue: el unico camino documentado es el ecosistema openpi, cargando la politica con `policy_config.create_trained_policy` y un snapshot local del repositorio. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yor_icl_pi05_canonical_extended-step35000 (este) | no disponible | no disponible | no disponible | no disponible | publico en HuggingFace, 0 descargas, 0 likes |
| lair-nyu/yor_icl_pi05_easy_pnp_v2_absolute_joint_sanity15k | no disponible | no disponible | no disponible | no disponible | publico en HuggingFace (citado en la model card) |
| lair-nyu/yor_icl_pi05_canonical_sanity15k-step5000 | no disponible | no disponible | no disponible | no disponible | publico en HuggingFace (citado en la model card) |
| Brazos VICTR-retrieval 3-6 (sin nombre de repositorio) | no disponible | no disponible | no disponible | no disponible | no disponibles; solo se describen como brazos del mismo estudio |

Los dos checkpoints hermanos comparten convencion de publicacion (solo `params/`, `assets/` y `_CHECKPOINT_METADATA`, sin `train_state/`), pero se desconoce el numero de pasos de entrenamiento del primero y el segundo corresponde al paso 5000 de un entrenamiento de sanity check. No se dispone de datos de rendimiento que permitan comparar la calidad de ninguno de ellos. No se identifican alternativas externas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: no se puede asumir uso comercial ni redistribucion; hay que contactar con el autor antes de cualquier despliegue productivo.
- El checkpoint esta incompleto respecto a su objetivo de entrenamiento: paso 35000 de 50000. El propio autor advierte que el entrenamiento podria seguir en curso y que los pasos posteriores se subirian por separado.
- No es autocontenido: cargarlo requiere el repositorio de entrenamiento `lim2045/icl_ws` (rama viktr) con la configuracion `yor_icl_pi05_canonical_extended` en `openpi/src/openpi/training/config.py`. El repositorio de HuggingFace solo contiene pesos y estadisticas de normalizacion, no la arquitectura ni las transformaciones de datos.
- Riesgo de alucinacion no evaluado y, en general, no aplicable de la misma forma que en modelos de lenguaje; el riesgo equivalente es la generacion de acciones fisicamente invalidas o inseguras, sin datos publicados al respecto.
- Distribucion de entrenamiento limitada: 20 tareas y 1186 episodios, recortados de un conjunto de 31 tareas y 1784 episodios. La generalizacion fuera de ese dominio no esta caracterizada.
- El estado no incluye la pinza, ni la elevacion, ni la base: la politica no observa el estado de agarre, lo que puede degradar tareas que requieran realimentacion del contacto.
- Las acciones se expresan como delta de posicion relativo al primer fotograma de la ventana de consulta, lo que ata el comportamiento a la definicion exacta de ventana usada en entrenamiento.
- No se documentan sesgos, limitaciones idiomaticas ni evaluaciones de seguridad.
- Ausencia total de senales de adopcion (0 descargas, 0 likes) y de resultados de benchmarks: no hay evidencia publica de rendimiento que respalde su uso.
- Las fechas de creacion y actualizacion del repositorio (2026-09-12) son posteriores a la fecha de consulta habitual, un detalle a verificar antes de citarlo.
- El repositorio declara el tag `region:us` y no declara pipeline, idiomas ni licencia.

## Enlaces

- HuggingFace: https://huggingface.co/lair-nyu/yor_icl_pi05_canonical_extended-step35000
- Checkpoint hermano: https://huggingface.co/lair-nyu/yor_icl_pi05_easy_pnp_v2_absolute_joint_sanity15k
- Checkpoint hermano: https://huggingface.co/lair-nyu/yor_icl_pi05_canonical_sanity15k-step5000
- Repositorio de entrenamiento citado: `lim2045/icl_ws` (rama viktr); la model card no incluye URL completa
- Paquete openpi: referenciado como `openpi/src/openpi/training/config.py` y `openpi/policies/yor_policy.py`; no se proporciona URL en la informacion disponible
- Ficheros internos citados: `assets/yor_icl_canonical_extended_episodes.json`, `notes/ICRA_plan.md` (seccion 1b); no enlazados en la model card
- No se han encontrado papers, blogs, demos ni repositorios adicionales en la busqueda web realizada.
