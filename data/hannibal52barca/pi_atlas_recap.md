# Hannibal52Barca/Pi_atlas_RECAP

## Resumen

Pi_atlas_RECAP es una familia de funciones de valor (value functions) para el robot bimanual YOR, desarrollada por el usuario Hannibal52Barca y publicada en Hugging Face bajo el ecosistema openpi. No se trata de un modelo de lenguaje generativo al uso, sino de un conjunto de cabezas de valor entrenadas sobre el backbone PaliGemma de `pi05_base` (el modelo base de openpi, del linaje pi0.5), orientadas a estimar el progreso de una tarea robótica a partir de un unico frame de observacion.

El modelo resuelve el problema de evaluar el exito o el avance de una politica de control en robótica manipulativa: dada una tarea y una subtarea descritas en el prompt, junto con el estado de 21 dimensiones del robot, predice un valor escalar que refleja el progreso hacia la meta. Se publican seis variantes con objetivos distintos (terminal de episodio, progreso denso, terminal por subtarea, horizonte de 30 frames, consistencia de Bellman y critico Q), todas entrenadas sobre el dataset `adityx23/Pi-Atlas-Full`.

Su relevancia radica en que implementa el enfoque RECAP (value functions para aprendizaje por refuerzo en robótica) sobre la pila openpi, con resultados de holdout documentados y checkpoints listos para cargar mediante la libreria openpi. El repositorio ocupa 65,1 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PaliGemma (backbone de `pi05_base`) + token de valor aprendido + cabeza de valor de 201 bins |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada de un unico frame, sin historial) |
| Tipos de cuantizacion | no disponible (checkpoints Orbax en precision de entrenamiento) |
| Idiomas soportados | no disponible (prompts en lenguaje natural, idioma no especificado) |
| Licencia | Gemma Terms of Use (heredada de `pi05_base`) |
| Formato de pesos | checkpoint openpi/Orbax (`params/`, `assets/`, `_CHECKPOINT_METADATA`) |

## Arquitectura y entrenamiento

Cada modelo es un backbone PaliGemma inicializado desde `pi05_base` de openpi, al que se anade un token de valor aprendido y una cabeza de valor de 201 bins. El entrenamiento usa entropia cruzada sobre el objetivo discretizado en bins, y la prediccion final es la esperanza sobre los bins. La entrada incluye un unico frame (sin historial) y el estado de 21 dimensiones; el prompt sigue el formato `<task>. Subtask: <subtask>`. Durante el entrenamiento, el 5% de las muestras reciben una subtarea incorrecta de la misma trayectoria con objetivo −1, lo que ensena al modelo a detectar desalineaciones entre instruccion y estado.

Todos los modelos se entrenaron con 10.000 pasos, batch de 64, semilla 0 y 2 GPUs con FSDP. Se publican seis configuraciones: `recap_full_terminal` (objetivo terminal de episodio, −1 en fallo), `recap_full_dense` (progreso denso sobre la vuelta del ciclo, detenido pronto en el paso 4000), `recap_term_st` (terminal por subtarea), `recap_term_st_h30` (anade una segunda cabeza para el valor 30 frames adelante), `recap_term_st_h30_bellman` (anade consistencia de Bellman con λ = 1 entre la cabeza +30 en t y la cabeza actual con stop-gradient en t+30) y `recap_term_st_critic` (Q(s, a) con el chunk de accion ejecutado de 30 pasos anadido al prompt como tokens FAST). El codigo vive en el fork `pi_atlas` de openpi (`src/openpi/models/pi_value.py`).

## Capacidades

- Estimacion de funciones de valor para control robótico: predice un escalar de progreso o retorno a partir de un frame y el estado del robot.
- Evaluacion de subtareas: variantes `term_st` puntuan el avance dentro de cada subtarea del ciclo.
- Prediccion con horizonte: la cabeza adicional de `h30` estima el valor 30 frames adelante.
- Critico Q(s, a): la variante `critic` incorpora el chunk de accion de 30 pasos como tokens FAST para estimar el valor de una accion concreta.
- Deteccion de desalineacion instruccion-estado: entrenado con subtareas erroneas etiquetadas con −1.
- Consistencia temporal: la variante `bellman` impone consistencia de Bellman entre cabezas temporales.
- Soporte de multiples tareas del dataset Pi-Atlas-Full (red chili, eggplant y otras) mediante prompt de tarea y subtarea.
- No es un modelo de generacion de texto, codigo, vision general ni tool calling; su salida es un valor escalar.

## Casos de uso

- Evaluacion offline de politicas de manipulacion: dado un dataset de episodios grabados, la funcion de valor puntua cada frame y permite estimar la calidad de una politica sin ejecutarla en el robot, usando `recap_full_terminal` o `recap_term_st`.
- Filtrado y curado de datos de demostracion: las puntuaciones de valor permiten descartar episodios o subtareas de baja calidad antes de reentrenar una politica, aprovechando la capacidad de deteccion de fallos (−1) del objetivo terminal.
- Recompensa para aprendizaje por refuerzo: las variantes densa y por subtarea proporcionan senales de recompensa intermedias que pueden usarse en RL offline o en lineas de RECAP sobre el robot YOR.
- Deteccion temprana de fallos en ejecucion: la cabeza terminal por subtarea permite abortar o reintentar una subtarea cuando el valor cae hacia −1, reduciendo ejecuciones fallidas en el robot bimanual.
- Planificacion con horizonte: la cabeza `h30` permite comparar el valor actual con el esperado 30 frames adelante para decidir si continuar o cambiar de estrategia.
- Seleccion de acciones con critico: la variante `critic` evalua chunks de accion candidatos y puede usarse para reordenar o filtrar acciones propuestas por la politica base antes de enviarlas al robot.
- Investigacion en funciones de valor para robótica: las seis variantes con objetivos distintos y sus resultados de holdout sirven como referencia reproducible para comparar formulaciones de valor (terminal, densa, Bellman, critico).

## Benchmarks y rendimiento

Resultados de holdout publicados en la model card. El conjunto "Old" tiene 28 episodios (10 de red chili, 18 vueltas de eggplant) y el "New" 126 episodios de todas las tareas. Cada modelo se evalua contra su propio objetivo, por lo que las cifras solo son comparables entre modelos con el mismo objetivo.

| Modelo | Old MAE | Old Pearson | Old Spearman | New MAE | New Pearson | New Spearman |
| --- | --- | --- | --- | --- | --- | --- |
| recap_full_terminal | 0,070 | 0,734 | 0,773 | 0,138 | 0,607 | 0,744 |
| recap_full_dense | 0,065 | 0,782 | 0,783 | 0,047 | 0,923 | 0,914 |
| recap_term_st | 0,067 | 0,818 | 0,818 | 0,115 | 0,787 | 0,779 |
| recap_term_st_h30 | 0,073 | 0,771 | 0,773 | 0,121 | 0,766 | 0,751 |
| recap_term_st_h30_bellman | 0,065 | 0,806 | 0,806 | 0,115 | 0,785 | 0,778 |
| recap_term_st_critic | 0,076 | 0,790 | 0,789 | 0,133 | 0,731 | 0,721 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no es un modelo de lenguaje generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El backbone PaliGemma de pi0.5 suele requerir una GPU con al menos 16-24 GB en precision de entrenamiento, pero no se confirma en la informacion proporcionada.
- GPU recomendadas: el entrenamiento se realizo con 2 GPUs y FSDP, lo que sugiere GPUs de clase A100 o H100; no se especifica el modelo exacto.
- Cabe en GPU de consumo: no disponible; depende del tamano del backbone PaliGemma y del formato de checkpoint Orbax, no cuantizado.
- Opciones de despliegue: libreria openpi (carga via `openpi.training.config.get_config` y `openpi.models.model.restore_params`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio ocupa 65,1 GB, con seis checkpoints Orbax (sin estado del optimizador).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo | Licencia | Disponibilidad |
| --- | --- | --- | --- | --- | --- |
| Pi_atlas_RECAP | no disponible | un frame, sin historial | Funciones de valor RECAP para YOR | Gemma Terms of Use | Hugging Face, openpi |
| openpi `pi05_base` | no disponible | no disponible | Politica base pi0.5 | openpi / Gemma | openpi |
| Otras funciones de valor para robotica | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de funciones de valor para el mismo robot o tarea en la informacion proporcionada.

## Limitaciones y advertencias

- Entrada de un unico frame sin historial: no puede razonar sobre la dinamica temporal mas alla de lo codificado en el estado de 21 dimensiones y la cabeza de horizonte de 30 frames.
- Las cifras de holdout no son comparables entre variantes con objetivos distintos; solo entre modelos que comparten objetivo.
- `recap_full_dense` se detuvo pronto en el paso 4000, por lo que su entrenamiento es mas corto que el del resto.
- El modelo esta especializado en el robot bimanual YOR y el dataset Pi-Atlas-Full; no se documenta generalizacion a otros robots o entornos.
- Riesgo de sobreajuste a las tareas del dataset (red chili, eggplant y otras); el holdout "New" es mas amplio pero limitado a las mismas tareas.
- El 5% de muestras con subtarea erronea introduce etiquetas −1 que pueden sesgar la prediccion hacia valores negativos en estados ambiguos.
- Licencia Gemma Terms of Use: el uso comercial esta sujeto a las condiciones de Google para Gemma y a la licencia de openpi; es necesario revisarlas antes de un despliegue en produccion.
- No se documentan sesgos etnicos, de genero o de idioma porque no es un modelo de lenguaje generativo; los sesgos relevantes serian los del dataset de demostraciones roboticas.
- Riesgo de alucinacion en el sentido de valores de progreso incorrectos en estados fuera de distribucion; no hay evaluacion de calibracion publicada.
- El repositorio no registra descargas ni likes, por lo que no hay validacion externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hannibal52Barca/Pi_atlas_RECAP
- Dataset de entrenamiento: https://huggingface.co/datasets/adityx23/Pi-Atlas-Full
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- openpi (repositorio base): no disponible en la informacion proporcionada
- Fork `pi_atlas` de openpi: no disponible en la informacion proporcionada (referenciado en la model card como `src/openpi/models/pi_value.py`)
