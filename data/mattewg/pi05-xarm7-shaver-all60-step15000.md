# mattewg/pi05-xarm7-shaver-all60-step15000

## Resumen

El modelo `mattewg/pi05-xarm7-shaver-all60-step15000` es un checkpoint de politica robotica pi0.5, dentro del framework openpi, pensado para una unica etapa de una tarea de manipulacion bimanual con un robot xArm7 (la denominada "shaver-box"). No es un modelo de lenguaje: es una politica visio-lenguaje-accion que genera trayectorias de accion a partir de observaciones, y se publica como ajuste especifico de tarea, no como modelo de proposito general. Corresponde al paso 15000 del experimento `all60_v1`, con un tamano de repositorio de 12,4 GB.

La relevancia de esta ficha es acotada pero util para quien trabaja con openpi: sirve como ejemplo reproducible de como se estructura y se sirve un checkpoint pi0.5 (pesos EMA en formato Orbax, estadisticas de normalizacion y metadatos de libro mayor), y de los requisitos de configuracion que impone la herramienta `serve_policy.py` (el `repo_id` de la config debe coincidir con el directorio dentro de `assets/`). Al tratarse de un repositorio con 0 descargas y 0 likes en el momento de la consulta, carece de validacion por parte de la comunidad.

La tarea modelada es de tipo industrial/practico: la politica opera un xArm7 bimanual (dos brazos de 7 grados de libertad mas dos pinzas) sobre un espacio de estado y accion de 16 dimensiones, con datos de entrenamiento a 60 fps y un horizonte de accion de 16 pasos. El autor no publica arquitectura detallada, numero de parametros, licencia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica pi0.5 (visio-lenguaje-accion) sobre el framework openpi |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; horizonte de accion (`action_horizon`) = 16 pasos |
| Tipos de cuantizacion | no disponible (checkpoint con pesos EMA en precision de entrenamiento) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | Orbax (JAX) en `params/`, pesos EMA, con `_CHECKPOINT_METADATA` |

Otros datos del repositorio: tamano de 12,4 GB; no incluye `train_state/` (que supondria 31 GB de los 42 GB totales y solo serviria para reanudar el entrenamiento); incluye `assets/<repo_id>/norm_stats.json` con las estadisticas de normalizacion. Creado y actualizado el 2026-09-13.

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. El checkpoint se identifica como una politica pi0.5 del framework openpi, orientada a control robotico mediante generacion de acciones, y contiene pesos EMA (media movil exponencial) mas las estadisticas de normalizacion asociadas. No se especifican el numero de parametros, el tipo de backbone ni el numero de tokens de entrenamiento.

Los unicos datos de entrenamiento inferibles de la model card son operativos: el experimento se denomina `all60_v1`, los datos estan capturados a 60 fps, y el esquema de accion es delta para los 14 joints y absoluto para las 2 pinzas (`make_bool_mask(7, -1, 7, -1)`), con `action_horizon=16`. Se desconoce la composicion del dataset, el numero de episodios y si hubo etapas de ajuste tipo RLHF o DPO (no aplicables de forma estandar en este tipo de politicas). Tampoco se documenta ninguna innovacion tecnica adicional mas alla del propio pipeline openpi.

## Capacidades

- Generacion de acciones de control para un robot xArm7 bimanual: estado y accion de 16 dimensiones, `[R j1..j7, R gripper, L j1..j7, L gripper]`, con relleno hasta 32.
- Acciones delta para los 14 joints y absolutas para las dos pinzas, que son estrictamente 0.0 o 1.0.
- Ejecucion de una unica etapa de la tarea "shaver-box" (ajuste especifico de tarea, no generalista).
- Inferencia con horizonte de accion de 16 pasos sobre observaciones a 60 fps.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingues ni de generacion de texto.
- No incorpora vision generativa ni audio; la vision, en su caso, es un canal de entrada propio de la politica, no documentado en detalle.

## Casos de uso

- Reproduccion de la tarea bimanual shaver-box: el checkpoint se carga con `serve_policy.py policy:checkpoint --policy.config=pi05_xarm7_all60 --policy.dir=<directorio>` para ejecutar la etapa concreta entrenada sobre el xArm7.
- Punto de partida para ajuste fino de una tarea relacionada: dado que incluye estadisticas de normalizacion coherentes con el esquema de 16 dimensiones, puede emplearse como inicializacion de politicas pi0.5 para tareas de manipulacion similares (no para reanudar este entrenamiento, ya que falta `train_state/`).
- Evaluacion de infraestructura de servicio openpi: sirve para comprobar la resolucion de estadisticas de normalizacion desde `assets/<asset_id>` y validar que la config se publica con el `repo_id` correcto.
- Pruebas de integracion en banco de robotica: permite validar el pipeline de observacion a 60 fps y el troceado de acciones (`action_horizon=16`) en un montaje bimanual real o simulado.
- Estudio de checkpoints intermedios: al estar etiquetado por paso (15000) y por experimento (`all60_v1`), facilita analisis comparativos de evolucion del entrenamiento entre distintos checkpoints de la misma serie.
- Referencia de empaquetado de pesos: util como ejemplo de repositorio Orbax con pesos EMA y sin estado de optimizador, para quien disena sus propios checkpoints ligeros de openpi.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el checkout pesa 12,4 GB; solo cargar los pesos en memoria exige del orden de 12-13 GB, por lo que con activaciones y buffers de inferencia conviene disponer de 24 GB o mas. Estimacion basada en el tamano del checkpoint, no confirmada por el autor.
- GPU recomendadas: A100 40/80 GB y H100 80 GB como opciones holgadas; L40S o RTX 4090 (24 GB) como opciones ajustadas.
- Compatibilidad con GPU de consumo: probablemente cabe en RTX 4090, RTX 3090 y otras GPU de 24 GB, con margen limitado; GPU de 16 GB o menos quedan por debajo del tamano del checkpoint.
- Opciones de despliegue: servicio nativo de openpi mediante `serve_policy.py` con backend JAX/Orbax. vLLM, llama.cpp, Ollama y TGI no aplican, al no tratarse de un modelo de lenguaje de texto.
- Latencia y throughput: no disponibles. Consideracion operativa: con datos a 60 fps y `action_horizon=16`, cada trozo de acciones cubre aproximadamente 0,27 s, de modo que la inferencia deberia completarse dentro de esa ventana para operar en tiempo real.

## Comparativa con modelos similares

No se dispone de datos cuantitativos que permitan una comparacion rigurosa. A continuacion se ofrece una comparacion cualitativa con referencias del mismo ambito (politicas visio-lenguaje-accion), marcando como "no disponible" todo dato no confirmado.

| Modelo | Tipo | Parametros | Horizonte de accion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-xarm7-shaver-all60-step15000 | Politica pi0.5 ajustada a tarea | no disponible | 16 | no disponible | publica (HuggingFace) |
| pi05_xarm7_real | Config de politica pi0.5 referenciada en la model card | no disponible | no disponible | no disponible | no disponible |
| pi0 (openpi) | Politica visio-lenguaje-accion base del framework | no disponible | no disponible | no disponible | framework openpi |
| OpenVLA | Politica visio-lenguaje-accion generalista | 7B (referencia externa) | no disponible | licencia abierta (referencia externa) | publica |

La comparacion directa con OpenVLA u otras politicas generalistas no es homogenea: este checkpoint es un ajuste de tarea sobre un montaje concreto (xArm7 bimanual), mientras que las alternativas generalistas cubren multiples robots y tareas. No se han localizado resultados de benchmark comparables.

## Limitaciones y advertencias

- Modelo de tarea unica: solo cubre una etapa de la tarea shaver-box con xArm7 bimanual; no es reutilizable como politica general.
- Dependencia estricta de configuracion: el checkpoint no lleva config y `create_trained_policy` resuelve las estadisticas desde `checkpoint_dir/assets/<asset_id>`; el `asset_id` cae al `repo_id` de la config, por lo que debe servirse con una config cuyo `repo_id` coincida y no bajo `pi05_xarm7_real`.
- No incluye `train_state/`: no es posible reanudar el entrenamiento desde este repositorio, solo inferencia o ajuste desde los pesos EMA.
- Licencia no especificada: la ausencia de licencia genera incertidumbre legal para cualquier uso comercial o redistribucion.
- Sin validacion comunitaria: 0 descargas y 0 likes, sin evaluaciones independientes ni resultados de benchmark publicados.
- Sesgos y alucinacion: no aplica el concepto de alucinacion textual; el riesgo equivalente es la ejecucion de acciones incorrectas fuera de la distribucion de entrenamiento, agravado por la falta de documentacion del dataset.
- Requisitos fisicos: el despliegue exige un montaje xArm7 bimanual con el esquema de 16 dimensiones y el modo de control descrito; cualquier variacion de hardware o empaquetado puede invalidar el modelo.
- Compatibilidad temporal y de entorno: los pesos estan en formato Orbax (JAX) con metadatos de libro mayor que pueden depender de versiones concretas de las librerias; conviene fijar versiones para evitar incompatibilidades en produccion.
- Idiomas: no aplica, al no ser un modelo de lenguaje.

## Enlaces

- HuggingFace: https://huggingface.co/mattewg/pi05-xarm7-shaver-all60-step15000
- Model card del autor: incluida en el repositorio anterior.
- Framework openpi (referenciado por las etiquetas del modelo): https://github.com/Physical-Intelligence/openpi
- La busqueda web realizada no devolvio resultados relevantes para este modelo (los resultados obtenidos correspondian a entidades bancarias sin relacion con el modelo).
