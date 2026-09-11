# fm-dev/pi05-shuffle-baseline-full-gbs32-pgb4-gpu8-r4-epoch100-step2500

## Resumen

Este repositorio contiene un checkpoint de ajuste fino completo (full fine-tuning) de un modelo de politica visomotora pi0.5, entrenado con la libreria openpi y orientado a manipulacion robotica sobre un brazo Franka. El identificador del modelo, pi05-shuffle-baseline-full-gbs32-pgb4-gpu8-r4-epoch100-step2500, codifica la receta de entrenamiento: variante shuffle/baseline, ajuste completo de parametros, batch global 32, batch por GPU 4, 8 GPU, ronda 4 y 100 epocas adicionales de muestreo hasta el step de optimizador 2500. Lo publica el usuario fm-dev y no acumula descargas ni likes en el momento de redactar esta ficha.

El modelo parte de los pesos EMA de inferencia del step 11000 de un entrenamiento previo y reinicia por completo el optimizador AdamW, el EMA (decay 0,99) y el sampler. Se entrenaron todos los componentes: backbone, vision de imagen actual, action expert, adaptadores LoRA retenidos y modulos de historia. El entrenamiento se hizo con JAX FSDP sobre 8 GPU NVIDIA A100-SXM4-40GB y el schedule de learning rate original de 200 epocas se mantiene sin cambios en este hito.

La relevancia de esta publicacion es de caracter experimental y metodologico: sirve como punto de referencia (baseline) reproducible para comparar estrategias de ajuste completo frente a alternativas con LoRA congelado en el mismo pipeline de datos. Se distribuye como bundle de inferencia que incluye pesos EMA, activos de normalizacion, el codigo fuente exacto del modelo y del runtime, versiones de dependencias y resultados de evaluacion offline. No se especifican licencia, idiomas ni recuento de parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de politica visomotora pi0.5 (openpi) con backbone, vision de imagen actual, action expert y modulos de historia; detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo de accion; la ventana de historia se define en `training_config.json`) |
| Tipos de cuantizacion | no disponible (no se documentan variantes GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje conversacional; las instrucciones de tarea se derivan del dataset de robot) |
| Licencia | no disponible |
| Formato de pesos | Parametros EMA de inferencia en formato nativo de JAX/openpi; no se especifica safetensors ni GGUF |
| Tamano del repositorio | 11,6 GB |
| Libreria | openpi |
| Pipeline | robotics |
| Entidad de salida | `(20, 8)` acciones: 20 pasos de horizonte, 8 dimensiones (XYZ absoluto, cuaternio XYZW, `gripper_open`) |
| Estado de entrada | XYZ absoluto, cuaternio XYZW y `gripper_open` (0 cerrado, 1 abierto) |
| Epocas adicionales | 100 epocas de sampler sobre el step 11000 |
| Step de optimizador | 2500 |
| Batch | global 32, por GPU 4 |
| Hardware de entrenamiento | 8 x NVIDIA A100-SXM4-40GB |

## Arquitectura y entrenamiento

La informacion disponible describe un ajuste fino de parametros completos sobre una politica pi0.5 dentro del ecosistema openpi. Los modulos declarados como entrenables son el backbone, la vision de imagen actual, el action expert, los adaptadores LoRA retenidos y los modulos de historia. El entrenamiento se ejecuto con paralelismo JAX FSDP sobre 8 A100-SXM4-40GB, con batch global 32 y batch por GPU 4, EMA con decay 0,99 y un schedule de learning rate de 200 epocas que permanece inalterado. Este checkpoint corresponde al step de optimizador 2500, alcanzado tras 100 epocas adicionales de sampler sobre los pesos EMA de inferencia del step 11000 del entrenamiento previo. El optimizador AdamW, el EMA y el sampler se reinicializaron por completo, de modo que el estado de optimizador y sampler no se incluye en el repositorio (queda en almacenamiento AMLT). No se detalla la composicion del dataset, el numero de tokens ni si hubo etapas de RLHF o DPO, que no aplican de forma estandar a este tipo de politica.

En cuanto a los datos, las epocas se definen sobre el split de entrenamiento procesado completo, no sobre cada fotograma original grabado. Los recuentos de ventanas de accion son 804 de entrenamiento, 150 de validacion y 98 de prueba; las filas de validacion y prueba nunca entrenan al modelo. Los objetivos de accion usan ventanas de ejecucion del robot que pasan comprobaciones de sincronizacion y de horizonte continuo, mientras que los fotogramas de demostracion previos se conservan como historia visual. Algunos episodios originales no contienen ninguna ventana de accion valida, y el desglose por episodio esta en `dataset_manifest.json`. La variante Status-D anade filas de Status repetidas a las filas de comportamiento, por lo que la longitud de su epoca de sampler difiere de las de Baseline y Uniform32. El ajuste completo de parametros no implica que todos los fotogramas en bruto esten supervisados.

## Capacidades

- Generacion de acciones de manipulacion robotica: produce trayectorias de 20 pasos con 8 dimensiones por paso (XYZ absoluto, cuaternio XYZW y estado del gripper).
- Control de gripper: la salida `gripper_open` distingue entre cerrado (0) y abierto (1), con las limitaciones especificas de la tarea registradas en `training_config.json` y `assets/policy_metadata.json`.
- Percepcion visual de la camara base: cada fotograma observado se incorpora mediante `observe(policy, rgb, state)` para construir la historia visual de la politica.
- Memoria de historia: los modelos con memoria incluyen un codificador de historia fijo que se instala automaticamente al llamar a `load()` y debe conservarse completo en el directorio `history_encoder/`.
- Ejecucion de tareas compuestas: el caso Pick3 requiere las tres colocaciones y, despues, la pulsacion del boton azul fisico.
- Modo Status-D: requiere el subobjetivo/keyframe causal del Writer y el contexto de Status empleado por su runtime de despliegue.
- Inferencia verificada en CPU: el paquete descargado se cargo de forma independiente en CPU mediante `load_model.py`, incluido su codificador de historia fijo.
- Soporte de tool calling, function calling, agentes, razonamiento multi-paso, matematicas, codigo, vision generalista, audio y capacidades multilingues: no disponible, no aplica a este tipo de modelo.

## Casos de uso

- Manipulacion robotica con Franka en laboratorio: el modelo recibe el estado del robot y la imagen de la camara base, y devuelve una secuencia de 20 acciones en coordenadas absolutas con cuaternio, lista para enviarse al controlador del brazo.
- Evaluacion offline de politicas antes de un despliegue fisico: permite medir el error de posicion L2 y de angulo de cuaternio sobre los splits de validacion y prueba sin arriesgar hardware.
- Linea base para experimentos de ajuste fino: al ser una variante "baseline" con ajuste completo de parametros, sirve como referencia contra la que comparar LoRA retenido, congelacion parcial de modulos u otras rondas de entrenamiento.
- Continuacion de entrenamiento e inicializacion de nuevas rondas: el checkpoint de step 2500 sobre el step 11000 es un punto de partida natural para rondas posteriores, aunque el estado de optimizador y sampler debe recuperarse del almacenamiento AMLT.
- Tareas de pick-and-place con secuencias multi-etapa: el caso Pick3 ilustra el uso en tareas que exigen completar varias colocaciones y una accion fisica adicional (pulsar el boton azul).
- Investigacion en memoria visual para politicas: el codificador de historia fijo permite estudiar hasta que punto el contexto visual acumulado mejora la consistencia de las acciones en episodios largos.
- Reproducibilidad de pipelines openpi: el bundle incluye codigo fuente, versiones de dependencias y activos de normalizacion, de modo que un tercero puede replicar la inferencia exacta y auditar la configuracion de entrenamiento.
- Desarrollo y depuracion en CPU: al haberse validado la carga en CPU, es viable inspeccionar la politica y sus entradas/salidas sin disponer de GPU, antes de mover el modelo a un nodo de inferencia.

## Benchmarks y rendimiento

Los unicos datos cuantitativos publicados son errores offline de accion sobre conjuntos retenidos. Se miden sobre un horizonte de 20 pasos y no constituyen tasas de exito en robot real.

| Split | Error L2 medio de posicion (m), H20 | Angulo medio de cuaternio (rad) |
|---|---:|---:|
| validation | 0,03255 | 0,10836 |
| test | 0,05667 | 0,12684 |

No se han publicado resultados de benchmarks en la informacion disponible: no hay MMLU, HumanEval, GSM8K ni equivalentes, ya que no se trata de un modelo de lenguaje, y tampoco se ofrecen tasas de exito de tareas fisicas. La model card indica explicitamente que la publicacion no establece exito fisico en tareas ni resuelve la latencia de despliegue. La evaluacion offline de Status-D emplea proyecciones causales del Writer sobre el historial del experto.

## Requisitos de hardware

- Entrenamiento documentado: 8 x NVIDIA A100-SXM4-40GB, JAX FSDP, batch por GPU 4 y batch global 32.
- Inferencia: no se especifica la VRAM minima ni recomendada. El repositorio completo ocupa 11,6 GB e incluye pesos EMA, activos de normalizacion, codigo fuente, dependencias y resultados de evaluacion, por lo que la huella de los pesos es inferior a esa cifra.
- Carga en CPU: verificada por el autor mediante `load_model.py`, incluido el codificador de historia fijo. No se documentan tiempos de carga ni de inferencia en CPU.
- GPU consumer: no disponible. No hay datos que permitan afirmar que el modelo quepa en una RTX 4090, RTX 3090 o similar, ni tampoco lo contrario.
- Opciones de despliegue: runtime nativo de openpi mediante `load_model.py` y la funcion `load()`. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF.
- Latencia y throughput: no disponible. Son dependientes del hardware, del robot y del runtime de despliegue.
- Requisito de integridad de ficheros: es obligatorio conservar el directorio `history_encoder/` completo, porque `load()` instala automaticamente el codificador de historia fijo que debe coincidir con las caracteristicas de entrenamiento cacheadas.
- Estado de reanudacion: el repositorio es un bundle de inferencia; el estado de optimizador y sampler no esta incluido y reside en almacenamiento AMLT.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la informacion proporcionada. No hay cifras verificables de parametros, contexto, rendimiento ni licencia de este checkpoint frente a alternativas de la misma categoria, de modo que cualquier tabla numerica seria especulativa.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-shuffle-baseline (este modelo) | no disponible | no disponible | L2 validacion 0,03255 m; test 0,05667 m | no disponible | HuggingFace, 0 descargas |
| Alternativas de la familia pi0.5 (Baseline, Uniform32, Status-D) | no disponible | no disponible | no disponible | no disponible | referenciadas en la model card, sin datos publicos en esta informacion |
| Otros modelos de politica visomotora (por ejemplo, pi0 y familia OpenVLA) | no disponible | no disponible | no disponible | no disponible | no disponible en los resultados de busqueda |

## Limitaciones y advertencias

- Licencia no especificada: el repositorio no declara licencia, por lo que el uso comercial y la redistribucion quedan en un limbo legal hasta que el autor lo aclare.
- Sin validacion en robot real: las unicas metricas son errores offline de accion (L2 y angulo de cuaternio) sobre splits retenidos. La model card advierte que no se establece exito fisico en tareas ni se resuelve la latencia de despliegue.
- Cobertura de datos limitada: solo 804 ventanas de accion de entrenamiento, 150 de validacion y 98 de prueba. Ademas, algunos episodios originales no aportan ninguna ventana de accion valida, lo que reduce la diversidad efectiva.
- Componentes no supervisados: los componentes marcados como no supervisados en `training_config.json` y `assets/policy_metadata.json` no deben interpretarse como control de gripper entrenado.
- Dependencia estricta del codificador de historia: omitir o modificar `history_encoder/` rompe la coherencia con las caracteristicas cacheadas durante el entrenamiento.
- Contexto especifico de Status-D: requiere el subobjetivo/keyframe causal del Writer y el contexto de Status de su runtime. No es una politica autonomа en ese modo.
- Tarea Pick3 acoplada al entorno: la finalizacion exige pulsar el boton azul fisico, lo que limita la portabilidad a otras celdas robot.
- Reanudacion imposible desde el repositorio: sin estado de optimizador ni sampler, no se puede continuar el entrenamiento solo con este bundle.
- Encarnacion especifica: el modelo esta ajustado para un brazo Franka y un formato de estado/accion concreto (XYZ absoluto, cuaternio XYZW, `gripper_open`). Transferirlo a otra morfologia exige reentrenamiento.
- Idiomas no declarados: no hay informacion sobre instrucciones en lenguaje natural ni sobre multilingueismo.
- Riesgo de sobreajuste y de deriva: al ser un ajuste completo de parametros sobre 804 ventanas, la generalizacion fuera de la distribucion de entrenamiento no esta caracterizada.
- Ausencia de validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay terceros que hayan reproducido los resultados.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe el riesgo analogo de generar trayectorias de accion plausibles pero fisicamente invalidas, no detectables por las metricas offline reportadas.
- Resultados de busqueda no pertinentes: las consultas web devolvieron exclusivamente directorios de emisoras de radio, sin informacion tecnica utilizable sobre el modelo.

## Enlaces

- HuggingFace: https://huggingface.co/fm-dev/pi05-shuffle-baseline-full-gbs32-pgb4-gpu8-r4-epoch100-step2500
- Repositorio openpi (referenciado en las etiquetas del modelo): no disponible en la informacion proporcionada
- Paper o informe tecnico de pi0.5: no disponible
- Blog o anuncio del autor: no disponible
- Demo o espacio interactivo: no disponible
- Resultados de la busqueda web: no se encontro ningun enlace relevante; las consultas devolvieron unicamente sitios de radio en linea sin relacion con el modelo
