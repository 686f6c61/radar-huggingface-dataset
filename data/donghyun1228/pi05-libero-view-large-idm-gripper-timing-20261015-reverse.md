# Donghyun1228/pi05-libero-view-large-idm-gripper-timing-20261015-reverse

## Resumen

Este repositorio contiene un checkpoint de investigacion derivado de pi05 (π₀.₅), el modelo Vision-Language-Action (VLA) de Physical Intelligence, adaptado por el usuario Donghyun1228 al benchmark de manipulacion robotica LIBERO. No se trata de un modelo de lenguaje generalista, sino de un ajuste fino de politica robotica orientado a tareas de manipulacion de sobremesa (tabletop) sobre un brazo Franka simulado en MuJoCo. El objetivo concreto de esta variante es aislar el efecto del etiquetado temporal de la pinza (gripper) en las secuencias de rollout generadas por un modelo inverso (IDM), comparando tres convenciones de etiqueta: repeticion del valor final, secuencia invertida y secuencia cronologica.

El entrenamiento parte del checkpoint aceptado `raw999` con Adam y EMA originales restaurados, y aplica solo 200 actualizaciones adicionales. Segun la model card, no se anaden parametros nuevos: es un ajuste sobre los pesos existentes. La unica diferencia respecto a las variantes hermanas son las etiquetas de gripper de las trayectorias extra de rollout. Los pesos publicados corresponden a los pesos "raw" sin EMA, convertidos de su formato nativo a BF16, junto con componentes congelados (`sourcewrist23`) y la normalizacion sin cambios.

La relevancia de esta ficha es acotada: es un artefacto de ablacion con 0 descargas y 0 likes en el momento de la consulta, sin licencia declarada ni idiomas soportados, pensado para reproducir una comparacion experimental concreta dentro del proyecto `vla_adaptation` del autor. Su valor esta en los resultados de evaluacion emparejados que reporta, no en capacidades de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) derivada de pi05 (π₀.₅), con cabeza de accion por flow matching |
| Parametros totales | no disponible (el repo ocupa 5,9 GB en BF16; el numero exacto no se declara) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (los pesos nativos se convierten a BF16; no se documentan GGUF ni INT8/INT4) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible de forma explicita; la model card indica pesos nativos "raw non-EMA native51" convertidos a BF16 |
| Pipeline declarado | robotics |
| Tags | robotics, libero, pi05, region:us |
| Config de politica asociada | `pi05_libero_source_free_split_vision_idm` |
| Commit de codigo de entrenamiento | `15d5589e` en `github.com/Donghyun1228/vla_adaptation` |
| Fecha de creacion | 2026-10-14 |
| Fecha de actualizacion | 2026-10-14 |

## Arquitectura y entrenamiento

La arquitectura subyacente es pi05 (π₀.₅), un modelo VLA de Physical Intelligence que combina un codificador vision-lenguaje con una cabeza de accion entrenada mediante flow matching. Segun la documentacion de OpenPI y de LeRobot, π₀.₅ se coentrena con demostraciones roboticas y datos multimodales a gran escala para generalizar a tareas de horizonte largo en entornos no vistos. Esta ficha no dispone del desglose de capas, dimensiones ocultas ni numero de tokens de entrenamiento del modelo base.

El proceso de ajuste documentado es muy especifico: se parte de `raw999` con Adam y EMA originales restaurados y se realizan 200 actualizaciones con un learning rate manual. Se emplea una sonda IDM de 40 tareas mas un IDM de rollout objetivo con peso 0,1, manteniendo sin cambios el escalado post-Adam de vision (1) y expert (0,1). Los primeros seis objetivos de comando canonicos y el padding se mantienen intactos. La unica variable manipulada son las etiquetas de gripper de las trayectorias de rollout extra, que en esta variante se etiquetan con la **secuencia cronologica invertida** (reverse) del orden registrado. No se usaron observaciones de camara fuente ni demostraciones de experto, y no hubo filtrado por exito. Las etiquetas de rollout diagnosticas no se usaron para entrenamiento.

El dataset de partida es `Donghyun1228/libero-view-large-self-rollout-idm-24ep-20261015`, revision `34225b034da7291af2b6d7f44e3646ff52ab60f5`, con estados iniciales 0 a 2. Los pesos nativos que alimentan la cache de acciones normalizada son la fuente de las etiquetas cronologicas.

## Capacidades

- Generacion de acciones motoras para manipulacion robotica de sobremesa en el entorno LIBERO (brazo Franka simulado).
- Ejecucion de tareas de horizonte largo dentro de las cuatro suites de LIBERO (Spatial, Object, Goal, Long Horizon), segun la definicion del benchmark.
- Procesamiento de entrada multimodal vision-lenguaje para producir comandos de accion (VLA).
- Inferencia con cabeza de flow matching, que segun LeRobot es el unico componente soportado actualmente para entrenamiento e inferencia de π₀.₅.
- Modelado inverso (IDM) como componente auxiliar de entrenamiento, segun la descripcion del propio checkpoint.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes multi-paso, modo de razonamiento explicito, audio ni vision generalista fuera del contexto robotic.

## Casos de uso

- Reproduccion de la ablacion de etiquetado de gripper: permite a un investigador comparar la secuencia cronologica invertida contra las variantes de gripper final y cronologica bajo el mismo protocolo (8 tareas, 3 estados iniciales por grupo, semilla 17, MuJoCo 3.2.3).
- Investigacion en aprendizaje por imitacion sin demostraciones de experto: el pipeline usa rollouts autogenerados y etiquetas IDM, util para estudiar politicas "source-free".
- Estudio del efecto del timing de la pinza en politicas VLA: el modelo aisla esta variable, lo que permite analizar si un error sistematico en la etiqueta temporal degrada la tasa de exito.
- Base para ajustes posteriores en LIBERO: sirve como punto de partida para continuaciones acotadas (por ejemplo, la variante `coverage-20261015-continue` del mismo autor).
- Evaluacion comparativa de politicas VLA en simulacion: util para montar experimentos emparejados por estado inicial y semilla antes de trasladar conclusiones a hardware real.
- Auditoria de metodologia de entrenamiento: al documentar el commit de codigo, el dataset y la revision exacta, el checkpoint es util para verificar la trazabilidad de un resultado experimental.
- Referencia negativa o de control: dado su rendimiento (10/24 y 13/24 en los dos grupos de estados iniciales), puede actuar como condicion de comparacion frente a variantes con mejor tasa de exito.

## Benchmarks y rendimiento

Los unicos datos cuantitativos disponibles son los resultados emparejados de LIBERO reportados en la model card. El protocolo es: 8 tareas seleccionadas, 3 estados iniciales por grupo, semilla 17, vista large, MuJoCo 3.2.3. Los estados iniciales 3 a 5 y 6 a 8 se evaluan por separado, con 24 episodios por celda.

| Variante | Estados iniciales 3-5 | Estados iniciales 6-8 |
|---|---|---|
| accepted_unchanged | 11/24 | 10/24 |
| old_idm_plus_rollout_final_gripper | 12/24 | 11/24 |
| **old_idm_plus_rollout_reverse_gripper (este checkpoint)** | **10/24** | **13/24** |
| old_idm_plus_rollout_sequence_gripper | 12/24 | 14/24 |

Advertencias explicitas del autor: estos casos reutilizados no constituyen un test intacto ni una estimacion amplia de las 40 tareas; las comparaciones validas son entre secuencia cronologica, aceptada, canonica e invertida, no frente a una perdida auxiliar; y las imagenes de los extremos temporales no identifican necesariamente de forma unica el momento de conmutacion de la pinza. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con un repo de 5,9 GB en BF16, una estimacion por orden de magnitud situa el peso de los parametros en el rango de los 3 mil millones de parametros; cualquier cifra concreta de VRAM es una extrapolacion no confirmada por el autor.
- GPU recomendadas: no disponible. La model card menciona que el optimizador/EMA nativo permanece separado en una NVIDIA B200, lo que corresponde al proceso de entrenamiento, no necesariamente a la inferencia.
- Compatibilidad con GPU de consumo: no confirmada. Si la estimacion de ~3B parametros en BF16 es correcta, cabria en GPUs de 24 GB (RTX 3090, RTX 4090) o incluso en 16 GB con cuantizacion, pero esto no esta verificado en la informacion disponible.
- Opciones de despliegue: el stack natural es OpenPI y LeRobot, con la configuracion de politica `pi05_libero_source_free_split_vision_idm`. La evaluacion del benchmark se realiza sobre MuJoCo 3.2.3. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que en general no estan orientados a cabezas de accion VLA.
- Latencia y throughput: no disponible.
- Almacenamiento: al menos 5,9 GB para el repositorio de pesos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| pi05-libero-view-large-idm-gripper-timing-20261015-reverse | Checkpoint VLA de investigacion (ablacion) | no disponible | no disponible | 10/24 y 13/24 en LIBERO (8 tareas, 3 estados iniciales) | no disponible | HuggingFace, 0 descargas |
| pi05-libero-view-large-idm-coverage-20261015-continue | Checkpoint VLA de investigacion (continuacion, cobertura IDM) | no disponible | no disponible | no disponible en la informacion recogida | no disponible | HuggingFace |
| pi05-libero-idm-lora-readout-dense-contact-20261006-view-large | Checkpoint VLA con LoRA compartida IDM/IL y readout de rango 16 | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| pi05_libero_base (LeRobot) | Modelo VLA base de π₀.₅ | no disponible | no disponible | no disponible | no disponible | ModelScope / LeRobot |

No se dispone de datos de parametros, contexto ni licencia de los modelos comparados, por lo que la comparacion queda limitada al tipo de artefacto, el origen y la disponibilidad publica.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se documenta ningun analisis de sesgo, y el modelo opera exclusivamente en un dominio simulado de manipulacion.
- Riesgo de alucinacion: no aplica en el sentido linguistico habitual, pero existe riesgo de acciones incorrectas o inseguras si se traslada a hardware real sin validacion, dado que el entrenamiento y la evaluacion son en simulacion (MuJoCo 3.2.3).
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan declarados en la informacion disponible.
- Muestra de evaluacion muy reducida: 24 episodios por celda y 8 tareas seleccionadas. El propio autor advierte que no es un test intacto ni una estimacion de las 40 tareas de LIBERO.
- Sin filtrado por exito en los datos: el dataset de partida no aplica filtrado por exito, lo que puede introducir etiquetas de trayectorias fallidas.
- Ambiguedad del etiquetado temporal: el autor senala que las imagenes de los extremos temporales no identifican de forma unica el momento de conmutacion de la pinza, lo que limita la interpretabilidad de la ablacion.
- Restricciones de licencia: la licencia no esta declarada. No hay autorizacion explicita de uso comercial, por lo que no deberia asumirse que sea apto para produccion.
- Estado del repositorio: 0 descargas y 0 likes, sin comunidad que lo valide. Es un artefacto de investigacion personal.
- Pesos sin EMA: los pesos publicados son los "raw" sin media movil exponencial, lo que puede implicar una estabilidad menor que la del checkpoint con EMA.
- Compatibilidad de stack: requiere la configuracion de politica concreta y un entorno de evaluacion especifico; no es plug-and-play con herramientas de inferencia generica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-view-large-idm-gripper-timing-20261015-reverse
- Codigo de entrenamiento: https://github.com/Donghyun1228/vla_adaptation (commit `15d5589e`)
- Dataset de rollouts de partida: https://huggingface.co/Donghyun1228/libero-view-large-self-rollout-idm-24ep-20261015 (revision `34225b034da7291af2b6d7f44e3646ff52ab60f5`)
- Variante de continuacion por cobertura IDM: https://huggingface.co/Donghyun1228/pi05-libero-view-large-idm-coverage-20261015-continue
- Variante con LoRA compartida IDM/IL: https://huggingface.co/Donghyun1228/pi05-libero-idm-lora-readout-dense-contact-20261006-view-large
- OpenPI, biblioteca de modelos VLA: https://www.openpi.net/english.html
- Guia de evaluacion LIBERO en LoongForge: https://loongforge.readthedocs.io/en/latest/embodied_tutorial/eval_docs/benchmarks/libero.html
- Modelo base pi05_libero_base en ModelScope: https://www.modelscope.cn/models/lerobot/pi05_libero_base
