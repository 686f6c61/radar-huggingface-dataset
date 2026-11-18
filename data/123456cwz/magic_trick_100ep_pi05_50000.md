# 123456cwz/Magic_Trick_100ep_Pi05_50000

## Resumen

Magic_Trick_100ep_Pi05_50000 es un checkpoint de inferencia derivado del modelo base Pi0.5 (openpi) de Physical Intelligence, ajustado por el usuario 123456cwz para una tarea concreta de robotica bimanual: la ejecucion de un truco de magia ("magic trick") sobre 100 episodios de demostracion. No se trata de un modelo de lenguaje generativo, sino de un modelo de politica visomotora (vision-language-action) que traduce observaciones de camaras e instrucciones de tarea en comandos de articulaciones para un robot de dos brazos.

El checkpoint se inicializa desde los pesos oficiales de Pi0.5 y se entrena durante 50.000 actualizaciones (el directorio final es `49999`, con indexacion desde cero). El repositorio pesa 12,4 GB e incluye los parametros exportados (con EMA si estaba activada) y las estadisticas de normalizacion propias del dataset `PiaoZY/magic-trick-100ep`. No incluye estado del optimizador, por lo que es un artefacto de inferencia, no reanudable para entrenamiento.

Su relevancia es acotada: es un ejemplo de fine-tuning de Pi0.5 para un layout robotico dual de 16 dimensiones, con transformaciones personalizadas (`Dual7DofInputs` / `Dual7DofOutputs`) que se apartan de la conversion estandar Aloha/ARX de 14 dimensiones. Resulta util como referencia para quien quiera replicar el pipeline de OpenPI sobre un robot bimanual propio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en Pi0.5 de openpi; detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene pesos en el formato de exportacion de OpenPI, presumiblemente safetensors; no confirmado) |
| Idiomas soportados | no disponible (las instrucciones de tarea son prompts de texto, pero no se especifican idiomas) |
| Licencia | no disponible |
| Formato de pesos | `params/**` (formato de exportacion de OpenPI) y `assets/magic-trick-100ep/norm_stats.json` |

## Arquitectura y entrenamiento

El modelo parte de los pesos base oficiales de Pi0.5, la politica visomotora de Physical Intelligence distribuida a traves del framework openpi. Sobre esa base se realiza un fine-tuning supervisado con 100 episodios del dataset `PiaoZY/magic-trick-100ep`, durante 50.000 actualizaciones, en un experimento etiquetado como `magic_trick_100ep_pi05_h100` (sugiriendo entrenamiento sobre GPU H100). El checkpoint final corresponde al indice de directorio `49999`; si el EMA estaba habilitado, los parametros exportados bajo `params` son los del promedio exponencial de pesos, no los crudos del ultimo paso.

La configuracion de robot es un layout dual de 16 dimensiones: `[source_left_joint_0..6, source_left_gripper_width, source_right_joint_0..6, source_right_gripper_width]`. Las unidades son radianes para articulaciones y metros para apertura de pinzas. Las dos pinzas (indices 7 y 15) se tratan en valor absoluto, mientras que las otras 14 articulaciones usan deltas relativos al estado inicial de un chunk de 50 pasos. La dimension de accion del modelo se rellena (padding) hasta 32. Las camaras de observacion son `observation.images.base`, `observation.images.left_wrist` y `observation.images.right_wrist`; los prompts de tarea se expresan desde la vista de la camara externa.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset mas alla de los 100 episodios, ni sobre el uso de RLHF/DPO en el pipeline (Pi0.5 base podria incorporarlo, pero no se confirma en esta ficha).

## Capacidades

- Generacion de acciones motoras para robot bimanual de 7 grados de libertad por brazo mas pinza (16 dimensiones en total).
- Percepcion visual multi-camara: camara base/externa y dos camaras de muneca.
- Condicionamiento por instruccion de tarea en lenguaje natural (prompt de texto asociado a la vista externa).
- Prediccion de chunks de accion de 50 pasos con articulaciones en delta y pinzas en absoluto.
- Ejecucion de una tarea especifica aprendida por imitacion: el truco de magia del dataset de entrenamiento.
- No se documentan capacidades de tool calling, agentes multi-paso, vision general, audio ni modo de razonamiento explicito.

## Casos de uso

- Replicacion del experimento: cargar el checkpoint con la configuracion `pi05_magic_trick_100ep` de OpenPI y las transformaciones `Dual7DofInputs`/`Dual7DofOutputs` para reproducir la politica sobre el mismo robot y layout de 16 dimensiones.
- Base para fine-tuning de tareas bimanuales: sirve como punto de partida (inicializado desde Pi0.5 y ya adaptado a un layout dual) para entrenar otras habilidades sobre el mismo hardware.
- Evaluacion de pipelines VLA en robotica de investigacion: comparar el rendimiento de una politica ajustada con 100 episodios frente al Pi0.5 base en la misma tarea.
- Referencia de normalizacion: el archivo `norm_stats.json` incluido permite auditar como se normalizan observaciones y acciones en un layout dual con deltas y pinzas absolutas.
- Docencia y divulgacion: ejemplo didactico de exportacion de checkpoints de OpenPI, gestion de EMA y padding de dimension de accion a 32.
- Pruebas de integracion de inferencia: validar el pipeline de inferencia de OpenPI (carga de `params`, aplicacion de estadisticas de normalizacion, generacion de chunks de 50 pasos) antes de desplegar en robot real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamano del repo (12,4 GB) da una cota inferior orientativa para cargar los pesos, pero no se especifica el numero de parametros ni el consumo real en GPU.
- GPU recomendadas: no disponible. El nombre del experimento (`..._h100`) sugiere que el entrenamiento se realizo en NVIDIA H100, pero no se confirma ni se detallan requisitos de inferencia.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el checkpoint esta pensado para el stack OpenPI (carga de `params` y `norm_stats.json` con las transformaciones personalizadas). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo de politica robotica de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Layout de accion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Magic_Trick_100ep_Pi05_50000 | no disponible | no disponible | Dual 16D (14 joints en delta + 2 pinzas absolutas), padding a 32 | no disponible | Hugging Face (repo de 12,4 GB) |
| Pi0.5 base (openpi) | no disponible | no disponible | Estandar de openpi | no disponible | Pesos oficiales de Physical Intelligence |
| Checkpoints Aloha/ARX de openpi | no disponible | no disponible | 14D estandar | no disponible | openpi |

La comparativa se limita a la familia openpi porque no se dispone de datos de otros modelos VLA comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: entrenado solo con 100 episodios de una unica tarea ("magic trick"); no generaliza a otras habilidades ni objetos.
- No usar la conversion estandar de 14 dimensiones Aloha/ARX: el autor advierte explicitamente que se deben aplicar las transformaciones `Dual7DofInputs`/`Dual7DofOutputs` y las estadisticas de normalizacion de este checkpoint.
- Las articulaciones se predicen en delta respecto al estado inicial del chunk de 50 pasos y las pinzas en absoluto; un uso incorrecto de las unidades (radianes/metros) o del orden de dimensiones invalida las acciones.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Al derivar de Pi0.5, habria que verificar tambien la licencia del modelo base.
- Sin estado del optimizador: no es reanudable para entrenamiento, solo para inferencia.
- Riesgo de sobreajuste al dataset y al hardware concreto; no se documentan evaluaciones de robustez, sesgos ni tasas de exito.
- Idiomas soportados no especificados: los prompts de tarea podrian estar limitados al idioma usado en el dataset.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/123456cwz/Magic_Trick_100ep_Pi05_50000
- Dataset de entrenamiento: https://huggingface.co/datasets/PiaoZY/magic-trick-100ep
- OpenPI (framework de Physical Intelligence): no disponible en la informacion proporcionada
- Modelo base Pi0.5: no disponible en la informacion proporcionada
