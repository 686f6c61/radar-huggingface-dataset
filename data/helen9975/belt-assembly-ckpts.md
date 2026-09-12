# helen9975/belt-assembly-ckpts

## Resumen

`helen9975/belt-assembly-ckpts` es un conjunto de checkpoints de politica de difusion (diffusion policy) para manipulacion robotica real, no un modelo de lenguaje. Corresponde a la tarea `belt_assembly` del dataset DROID y se ha entrenado con el pipeline "CCIL-in-visual-observation-spaces", que encadena tres brazos: una linea base de behavior cloning (BC), un CCIL secuencial con aumento backward-Euler y un CCIL de extremo a extremo. El repositorio, de 1,2 GB, contiene los directorios `baseline/`, `seq_be/` y `e2e/`, cada uno con su `*_best.pt`, el registro de seleccion `val_top_k.json` y, cuando existe, el `overrides.yaml` de Hydra.

El modelo resuelve una tarea concreta de ensamblaje con cinta en un robot real: a partir de dos camaras (vista del agente y vista de muneca a 140x140) y del estado del efector (posicion, cuaternion y apertura del gripper, 9 dimensiones), predice acciones absolutas de 10 dimensiones. La arquitectura combina un codificador visual DINOv2-small con una cabeza de difusion, con horizontes de observacion, prediccion y accion de 1, 16 y 8 pasos respectivamente, y una dimensionalidad de latente de 6921.

Su relevancia actual es doble. Por un lado, es un ejemplo de entrenamiento de politicas de manipulacion sobre datos DROID reales sin simulador, seleccionando el mejor checkpoint por error de accion (MSE) sobre un split de validacion en lugar de por tasa de exito de rollout. Por otro, la propia model card documenta con detalle fallos de entrenamiento (divergencia por gradientes no finitos) y checkpoints intermedios, lo que lo convierte en material util para estudiar reproducibilidad en pipelines de imitation learning. El autor es `helen9975` (Yi Ru Wang, estudiante de doctorado en la Universidad de Washington), y el repositorio registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de difusion (diffusion policy) con codificador visual DINOv2-small; no es un transformer de lenguaje |
| Parametros totales | no disponible (no se declara el recuento; el codificador es DINOv2-small y el latente tiene 6921 dimensiones) |
| Parametros activos | no aplica (no es una arquitectura MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje). Horizontes de la politica: obs_horizon=1, pred_horizon=16, action_horizon=8 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de politica robotica; no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`*_best.pt`) |
| Dimension del latente | 6921 (= 2 x 3 x 3 x 384 + 9) |
| Entradas | `agentview_image` y `robot0_eye_in_hand_image` a 140x140 uint8; estado de 9 dimensiones (`robot0_eef_pos` 3, `robot0_eef_quat` 4, `robot0_gripper_qpos` 2) |
| Salidas | Acciones absolutas de 10 dimensiones (posicion 3, rotacion 6D derivada de axis-angle 3, gripper 1) |
| Tamano del repositorio | 1,2 GB (los tres brazos) |

## Arquitectura y entrenamiento

La politica se construye sobre un codificador DINOv2-small que procesa dos vistas de camara con `patch_hw=[3,3]` y un recorte de 128 sobre imagenes de 140. La representacion latente resultante es de 6921 dimensiones: 2 camaras x 3 x 3 parches x 384 dimensiones del encoder, mas las 9 dimensiones del estado del robot. Sobre esa representacion opera la cabeza de difusion, que genera acciones con `pred_horizon=16` y ejecuta `action_horizon=8`, con `obs_horizon=1`. Las acciones originales de 7 dimensiones (posicion 3, axis-angle 3, gripper 1) se reconvierten a una representacion de rotacion 6D, dando el vector final de 10 dimensiones.

Los datos proceden de una captura DROID real (`belt_assembly/success/2026-09-10`): 50 episodios grabados de los que se usan 49 (se excluye `demo_3` por las etiquetas de calidad, ya que termina a 10,5 cm de la pose inicial frente a una mediana de cohorte de 0,1 mm) y 12.804 transiciones. No hay entorno de robosuite ni `env_args`, por lo que no existe tasa de exito de rollout: los tres brazos usan `eval_every=0` y seleccionan `best.pt` por MSE de accion sobre chunks ejecutados en un split de validacion de solo 5 episodios (`select_best_by_val_loss=true`). El pipeline sigue la secuencia behavior cloning -> CCIL secuencial con aumento backward-Euler -> CCIL de extremo a extremo, con ajustes compartidos de batch 64, semilla 42 y `val_ratio=0.1`.

El aspecto tecnico mas destacable documentado es el fallo de estabilidad del entrenamiento de dinamicas del brazo `seq_be`: el entrenador `correct_il` carecia de proteccion frente a gradientes no finitos y divergio en la epoca 426 (la 425 era sana, con perdida 0,0151), guardando un modelo con 72 tensores de parametros completamente NaN. La divergencia depende de la GPU y no de la semilla: dos ejecuciones en A100 empezaron a dar valores no finitos en la epoca 426, mientras que una en H100 con semilla, datos y configuracion identicos lo hizo en la epoca 388. La solucion adoptada no fue limitar `dynamics.train_epochs`, sino anadir una guarda de gradientes no finitos; la repeticion en H100 termino 400 epocas con 0 parametros no finitos y 59 de unos 4000 pasos omitidos (1,5%, todos en las epocas 388-399).

## Capacidades

- Prediccion de acciones de manipulacion de 10 dimensiones (posicion, rotacion 6D y gripper) a partir de observaciones visuales y de estado.
- Control visuomotor en bucle cerrado con dos camaras simultaneas (vista del agente y vista de muneca).
- Imitation learning sobre datos de robot real (DROID), sin necesidad de simulador para la seleccion de checkpoint.
- Ejecucion de politicas de chunking de acciones: predice 16 pasos y ejecuta 8 antes de reobservar.
- Tres variantes funcionales en el mismo repositorio: linea base BC, CCIL secuencial y CCIL de extremo a extremo.
- No soporta tool calling, function calling, agentes, multi-step reasoning ni capacidades multilingues: no es un modelo de lenguaje ni un modelo fundacional de proposito general.
- No dispone de modo "thinking", vision generativa, audio ni generacion de texto.

## Casos de uso

- Investigacion en imitation learning para robotica: comparar en un mismo repositorio una linea base de BC frente a variantes CCIL secuencial y de extremo a extremo, con los mismos datos y ajustes, para aislar el efecto del metodo.
- Reproduccion de resultados y analisis de fallos: el repositorio incluye `val_top_k.json` y `overrides.yaml`, lo que permite reconstruir la seleccion de checkpoints y estudiar por que la variante `seq_be` puntua peor que su linea base.
- Ensamblaje real de cinta (tarea objetivo): la politica `baseline/` esta completa y validada tras 300 epocas y es la unica de los tres brazos apta para ejecucion directa.
- Punto de partida para ajuste fino en tareas de manipulacion similares que compartan el formato de observacion DROID (dos camaras a 140x140 y estado de 9 dimensiones).
- Estudio de estabilidad numerica en entrenamiento distribuido: el caso documentado de divergencia dependiente de GPU (A100 frente a H100) sirve como caso practico para disenar guardas de gradientes no finitos.
- Docencia y divulgacion sobre politicas de difusion aplicadas a robotica, usando el repositorio como ejemplo de pipeline completo (preprocesado, etiquetado de calidad, seleccion de modelo y evaluacion).
- Prototipado de sistemas de control robotico que requieran prediccion de acciones con horizonte corto y reobservacion frecuente (chunks de 8 acciones sobre 16 predichas).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) porque no aplican a un modelo de politica robotica. El autor proporciona unicamente la metrica interna de seleccion (MSE de accion sobre chunks ejecutados en el split de validacion):

| Brazo | Ruta | Mejor epoca | Val action MSE | Estado |
|---|---|---|---|---|
| Linea base BC | `baseline/` | 60 | 0,003426 | Completo y valido (300 epocas) |
| CCIL secuencial (backward-Euler) | `seq_be/` | 10 | 0,003440 | Construido sobre un modelo de dinamicas defectuoso |
| CCIL de extremo a extremo | `e2e/` | 10 | 0,003215 | Snapshot a ~260 de 300 epocas |

Advertencias sobre estas cifras, segun la propia model card: el split de validacion tiene solo 5 episodios y la dispersion entre el primer y el quinto puesto del top-k en el brazo `e2e` es de aproximadamente el 7%, por lo que diferencias pequenas no son significativas. El `best.pt` de `e2e` proviene de la epoca 10, dentro del calentamiento (`e2e_phase1_epochs=50`), con la rama de aumento aun inactiva, de modo que el 0,003215 no debe interpretarse como superioridad del metodo e2e; sus checkpoints 2 a 5 quedan en 0,00341-0,00345, en niveles de la linea base. No hay tasa de exito de rollout porque no existe entorno simulador.

## Requisitos de hardware

- VRAM de inferencia: no disponible de forma explicita. El repositorio completo ocupa 1,2 GB para tres brazos, lo que situa cada checkpoint en el orden de cientos de MB (aproximadamente 0,4 GB por brazo como calculo derivado del tamano del repo, no como dato publicado).
- GPU de entrenamiento documentadas: A100 y H100 (las dos arquitecturas se usaron para reproducir el fallo de divergencia del brazo `seq_be`).
- GPU recomendadas para inferencia: no especificadas. Por el tamano del encoder (DINOv2-small) y del checkpoint, es razonable esperar que quepa en GPU de consumo, pero no hay confirmacion en la informacion disponible.
- Opciones de despliegue: los pesos son ficheros PyTorch `.pt` y el pipeline de referencia vive en la rama `caiyi_real_robot` del repositorio `personalrobotics/image_ccil`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. No se publican mediciones de frecuencia de inferencia ni de tiempo por chunk de 8 acciones.

## Comparativa con modelos similares

Comparativa interna de los tres brazos incluidos en el propio repositorio:

| Brazo | Mejor epoca | Val action MSE | Completitud | Validez |
|---|---|---|---|---|
| `baseline/` (BC) | 60 | 0,003426 | 300 epocas, finalizado | Valido |
| `seq_be/` (CCIL secuencial) | 10 | 0,003440 | Ajustado desde un modelo con NaN | No valido como resultado CCIL |
| `e2e/` (CCIL extremo a extremo) | 10 | 0,003215 | Snapshot a ~260/300 | Parcial, cifra dentro del calentamiento |

Comparativa con modelos externos de la misma categoria (politicas de difusion para manipulacion robotica): no disponible. La informacion proporcionada no incluye especificaciones ni resultados de terceros que permitan una comparacion con parametros, contexto, rendimiento o licencia verificables.

## Limitaciones y advertencias

- El brazo `seq_be/` no es un resultado valido: se ajusto desde un modelo de dinamicas cuyos 72 tensores de parametros quedaron completamente en NaN tras divergir en la epoca 426, y puntua ligeramente peor que la linea base de la que partio. El autor indica que una repeticion con dinamicas limitadas a 400 epocas lo reemplazara.
- El brazo `e2e/` es un snapshot intermedio (aproximadamente epoca 260 de 300) y su `best.pt` corresponde a la epoca 10, dentro del calentamiento, por lo que su MSE no refleja el metodo completo.
- La seleccion de checkpoint se hace sobre un split de validacion de solo 5 episodios, con una dispersion de alrededor del 7% entre los cinco primeros puestos del brazo `e2e`; las diferencias pequenas entre brazos no son fiables.
- No existe tasa de exito de rollout ni evaluacion en simulador: al ser datos de robot real no hay entorno robosuite ni `env_args`, por lo que el rendimiento en la tarea solo esta caracterizado por MSE de accion.
- La divergencia del entrenador de dinamicas depende de la GPU (A100 en la epoca 426, H100 en la 388) y no de la semilla; limitar el numero de epocas no es una proteccion fiable.
- Un episodio (`demo_3`) esta excluido por etiquetas de calidad: termina a 10,5 cm de la pose inicial frente a una mediana de 0,1 mm, y es una grabacion truncada (aunque contiene exactamente un cierre de gripper).
- Licencia no disponible: no se puede confirmar si se permite el uso comercial. Debe tratarse como restringido hasta verificar la licencia.
- Modelo especifico de una unica tarea (`belt_assembly`) y de un montaje robotico concreto; no es generalizable sin ajuste fino.
- No tiene capacidades de lenguaje, tool calling, agentes ni razonamiento multi-paso.
- Riesgo de sobreajuste al hardware y a las condiciones de captura DROID concretas (dos camaras a 140x140, estado de 9 dimensiones); cambios en la configuracion sensorial invalidan el modelo.
- No se documentan sesgos del modelo; al no procesar texto ni imagenes naturales generales, el riesgo de sesgo social tipico de los LLM no aplica, pero si el sesgo de distribucion de las 49 trayectorias de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/helen9975/belt-assembly-ckpts
- Pagina del autor (Yi Ru Wang): https://helen9975.github.io/
- Repositorio del pipeline, rama `caiyi_real_robot` (referenciado en la model card): https://github.com/personalrobotics/image_ccil
- Dataset DROID (origen de los datos de captura): https://droid-dataset.github.io/
