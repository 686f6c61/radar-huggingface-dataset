# Donghyun1228/pi05-libero-view-large-idm-gripper-timing-20261015-sequence

## Resumen

El modelo `Donghyun1228/pi05-libero-view-large-idm-gripper-timing-20261015-sequence` es una política de manipulacion robotica (vision-language-action, VLA) derivada de la familia pi0.5 (etiqueta `pi05`) y publicada por el usuario Donghyun1228 en HuggingFace. No es un modelo de lenguaje generalista: es un checkpoint de politica entrenado para el benchmark LIBERO, con imagenes de camara y consignas de tarea como entrada y acciones continuas como salida. El repositorio ocupa 5,9 GB y fue creado el 14 de octubre de 2026 segun los metadatos de HuggingFace.

El checkpoint forma parte de un estudio experimental de adaptacion *source-free* mediante un modelo de dinamica inversa (IDM) sobre rollouts del propio dominio objetivo. La variante concreta que documenta esta ficha compara tres formas de etiquetar el *timing* del gripper en los rollouts extra (final repetido, secuencia cronologica grabada y secuencia inversa) manteniendo congelados el resto de componentes. Segun la model card, se parte de un entrenamiento aceptado de 200 actualizaciones con Adam/EMA restaurados y solo cambian las etiquetas extra de gripper.

Su relevancia es acotada y experimental: aporta evidencia de que el etiquetado cronologico del gripper mejora ligeramente la tasa de exito frente a la politica aceptada en los estados iniciales evaluados (14/24 frente a 10/24 en los estados 6-8), pero el propio autor advierte que no se trata de un conjunto de test intacto ni de una estimacion sobre las 40 tareas completas. No hay licencia, idiomas ni pipeline de inferencia documentados publicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en pi0.5 (etiqueta `pi05`), con IDM para adaptacion; detalles internos no disponibles |
| Parametros totales | no disponible (el autor menciona un checkpoint "raw non-EMA native51" convertido a BF16, sin cifra) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica como ventana de texto al uso; la politica consume observaciones e instrucciones de tarea) |
| Tipos de cuantizacion | BF16 (mencionado explicitamente); no se documentan GGUF, INT8, INT4 ni otras |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (se cita una conversion a BF16 y pesos "native51" mas "sourcewrist23"; no se confirma safetensors) |

## Arquitectura y entrenamiento

La model card describe una adaptacion de politica VLA sobre el benchmark LIBERO. El procedimiento es *source-free*: el conjunto de datos de rollouts objetivo no incluye observaciones de la camara del dominio fuente ni demostraciones de experto. El entrenamiento parte de un estado aceptado ("accepted manual-LR raw999") y aplica 200 actualizaciones adicionales con el optimizador Adam original y EMA restaurados. El autor indica que no se anaden parametros nuevos y que el codigo de entrenamiento corresponde al commit `15d5589e` del repositorio `Donghyun1228/vla_adaptation`.

La innovacion concreta de este checkpoint es el tratamiento de las etiquetas de gripper en los rollouts extra. Se comparan tres variantes: repetir el valor final, invertir la secuencia grabada o conservar la secuencia cronologica. La variante cronologica se obtiene de una cache de acciones normalizadas nativa. El resto de elementos permanece fijo: los seis primeros objetivos de comando canonicos, el relleno (*padding*), la vision (`vision1`) y el escalado post-Adam del experto (`expert0.1`). El conjunto de datos de partida es `Donghyun1228/libero-view-large-self-rollout-idm-24ep-20261015` (revision `34225b034da7291af2b6d7f44e3646ff52ab60f5`), restringido a los estados iniciales 0-2 y sin filtrado por exito. No se usaron etiquetas de rollouts de diagnostico para el entrenamiento.

La evaluacion se realizo en MuJoCo 3.2.3, con vista de objetivo en resolucion grande, 8 tareas seleccionadas, 3 estados iniciales por grupo y semilla 17. El autor indica que el optimizador nativo y el EMA se mantienen por separado en una B200, y que el checkpoint publicado contiene los pesos no-EMA convertidos a BF16 junto con un componente congelado (`sourcewrist23`) y la normalizacion sin cambios. La configuracion de politica recomendada es `pi05_libero_source_free_split_vision_idm`.

## Capacidades

- Generacion de acciones continuas para manipulacion robotica en el entorno LIBERO a partir de observaciones visuales e instrucciones de tarea.
- Adaptacion *source-free*: la politica se ajusta con rollouts del propio entorno objetivo, sin acceso a observaciones de camara del dominio fuente ni a demostraciones de experto.
- Aprendizaje de etiquetas de *timing* de gripper a partir de rollouts extra, con tres variantes de etiquetado comparadas (final, inversa, cronologica).
- Evaluacion emparejada de politicas bajo condiciones controladas (misma semilla, mismos estados iniciales, mismo conjunto de 8 tareas).
- Capacidad de operar con un componente de vision congelado (`sourcewrist23`) y una cache de acciones normalizadas nativa.
- No se documenta soporte de *tool calling*, *function calling*, razonamiento multi-paso, vision generalista, audio ni modo de pensamiento. No es un modelo de proposito general.

## Casos de uso

- Investigacion en adaptacion *source-free* de politicas VLA: el checkpoint sirve como material de reproduccion para estudiar como afecta el etiquetado temporal de acciones cuando no se dispone del dominio fuente.
- Estudio del *timing* de apertura y cierre del gripper: las tres variantes publicadas permiten aislar el efecto de la etiqueta cronologica frente a la repeticion del valor final o la secuencia inversa, con resultados por grupo de estados iniciales.
- Baseline interno para comparativas de etiquetado: cualquier nuevo esquema de etiquetado puede compararse contra `accepted_unchanged`, `final_gripper`, `reverse_gripper` y `sequence_gripper` bajo el mismo protocolo que describe la model card.
- Reproduccion experimental en simulacion: al estar evaluado en MuJoCo 3.2.3 con 8 tareas y semilla fija, permite repetir el montaje sin depender de hardware robotico real.
- Ablacion de componentes de vision y experto: dado que el autor mantiene fijos `vision1` y `expert0.1`, el checkpoint es util para estudiar cambios que afecten solo a la cabeza de accion o al etiquetado.
- Transferencia a robot real: uso potencial como punto de partida para politicas de manipulacion, aunque la model card solo reporta evaluacion en simulacion y no valida ningun despliegue fisico.
- Docencia y formacion en VLA: sirve como ejemplo reproducible de un pipeline de adaptacion con IDM, con codigo publico en un repositorio de GitHub.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni similares, ya que no es un modelo de lenguaje). El unico dato de rendimiento son las tasas de exito emparejadas reportadas por el autor en LIBERO (MuJoCo 3.2.3, vista de objetivo grande, 8 tareas seleccionadas, 3 estados iniciales por grupo, semilla 17, 24 episodios por variante):

| Variante | Estados iniciales 3-5 | Estados iniciales 6-8 |
|---|---|---|
| accepted_unchanged | 11/24 | 10/24 |
| old_idm_plus_rollout_final_gripper | 12/24 | 11/24 |
| old_idm_plus_rollout_reverse_gripper | 10/24 | 13/24 |
| old_idm_plus_rollout_sequence_gripper | 12/24 | 14/24 |

El autor advierte explicitamente que estos casos reutilizados no constituyen un test intacto ni una estimacion amplia sobre las 40 tareas, y que la comparacion debe hacerse entre variantes (cronologica frente a aceptada, canonica e inversa), no mediante perdidas auxiliares. Tambien senala que las imagenes de los extremos temporales no identifican por si solas el instante del cambio de gripper.

## Requisitos de hardware

- El autor indica que el optimizador nativo y el EMA se mantienen por separado en una NVIDIA B200 durante el entrenamiento; no se documentan requisitos de entrenamiento completos.
- Inferencia: no disponible de forma oficial. Como referencia orientativa, si el repositorio de 5,9 GB contiene principalmente pesos en BF16 (2 bytes por parametro), el orden de magnitud seria de unos 3.000 millones de parametros, lo que situaria la inferencia en BF16 en torno a 6-8 GB de VRAM mas el coste del codificador visual y los buffers de normalizacion. Esta estimacion no esta confirmada por el autor.
- GPU consumer: con esa estimacion, una RTX 4090 (24 GB) o una RTX 3090 (24 GB) serian suficientes para inferencia en BF16; no hay confirmacion publicada.
- Despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. Al ser una politica VLA, el uso previsto es mediante PyTorch siguiendo el codigo del repositorio `Donghyun1228/vla_adaptation` y la configuracion `pi05_libero_source_free_split_vision_idm`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No hay datos publicados en la informacion disponible sobre otros modelos comparables de la misma categoria (pi0, pi0.5 base, OpenVLA u otras politicas VLA) que permitan una comparacion con cifras verificables. La unica comparacion con datos reales es interna a esta familia de experimentos:

| Variante | Parametros | Contexto | Exito (estados 3-5) | Exito (estados 6-8) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| accepted_unchanged | no disponible | no disponible | 11/24 | 10/24 | no disponible | referencia interna del estudio |
| final_gripper | no disponible | no disponible | 12/24 | 11/24 | no disponible | HuggingFace |
| reverse_gripper | no disponible | no disponible | 10/24 | 13/24 | no disponible | HuggingFace |
| sequence_gripper (este modelo) | no disponible | no disponible | 12/24 | 14/24 | no disponible | HuggingFace |

Para comparaciones con modelos externos: no disponible.

## Limitaciones y advertencias

- Licencia no especificada: sin licencia explicita no hay autorizacion clara para uso comercial ni para redistribucion; conviene contactar con el autor antes de cualquier uso en produccion.
- Evaluacion muy limitada: 8 tareas seleccionadas, 3 estados iniciales por grupo y una sola semilla (17), con 24 episodios por variante. El propio autor indica que los casos reutilizados no son un test intacto ni una estimacion sobre las 40 tareas.
- Diferencias pequenas y potencialmente ruidosas: las variantes oscilan entre 10/24 y 14/24 sobre 24 episodios, un tamano muestral que no permite extraer conclusiones fuertes.
- Ambiguedad del etiquetado temporal: el autor advierte que las imagenes de los extremos temporales no identifican de forma unica el instante de conmutacion del gripper.
- Sin filtrado por exito en el conjunto de datos de partida (`libero-view-large-self-rollout-idm-24ep-20261015`, estados iniciales 0-2), lo que puede introducir trayectorias fallidas en el entrenamiento.
- Adaptacion *source-free*: al no usar observaciones de la camara fuente ni demostraciones de experto, el rendimiento depende por completo de la calidad de los rollouts objetivo.
- Ambito restringido a simulacion LIBERO con MuJoCo 3.2.3; no hay evidencia publicada de funcionamiento en robots reales.
- No hay informacion sobre sesgos, alucinacion o comportamiento fuera de distribucion en tareas no evaluadas.
- Idiomas e instrucciones soportadas: no disponible; no se puede garantizar el comportamiento con consignas en castellano.
- Las busquedas web realizadas no han devuelto resultados relacionados con este modelo (los resultados obtenidos corresponden a herramientas de video Insta360 y no son pertinentes).
- Los metadatos de HuggingFace indican fecha de creacion y actualizacion el 14 de octubre de 2026, con 0 descargas y 0 likes; el modelo no tiene validacion independiente de terceros.

## Enlaces

- HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-view-large-idm-gripper-timing-20261015-sequence
- Codigo de entrenamiento (commit `15d5589e`): https://github.com/Donghyun1228/vla_adaptation
- Conjunto de datos de rollouts objetivo: https://huggingface.co/Donghyun1228/libero-view-large-self-rollout-idm-24ep-20261015 (revision `34225b034da7291af2b6d7f44e3646ff52ab60f5`)
- Paper, blog o demo adicionales: no disponible
