# mattewg/pi05-xarm7-shaver-stage3_clean

## Resumen

Este checkpoint es una politica de control robotico desarrollada por el autor mattewg, dentro del ecosistema openpi. El modelo, llamado `pi05-xarm7-shaver-stage3_clean`, es una politica pi0.5 enfocada en una etapa concreta de una tarea bimanual con un robot xArm7, denominada "shaver-box". El checkpoint corresponde al paso 29999 del experimento `stage3_clean_v1` e incluye los pesos (EMA) de la politica, las estadisticas de normalizacion y metadatos de Orbax. No se incluye el estado completo de entrenamiento, por lo que el modelo esta pensado para inferencia o evaluacion, no para reanudar el entrenamiento.

El modelo opera sobre un espacio de estado y accion de 16 dimensiones (14 articulaciones y 2 pinzas) que se rellena a 32 dimensiones. Las acciones son incrementales para las articulaciones y absolutas para las pinzas, con datos procesados a 60 fps y un horizonte de accion de 16. Al ser una politica de robotica de la familia pi0.5, su relevancia se centra en la manipulacion bimanual de bajo nivel, aunque el checkpoint esta limitado a una configuracion y una tarea muy especificas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica pi0.5 del ecosistema openpi; arquitectura detallada no documentada en la informacion disponible |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene `params/` con pesos EMA en formato de checkpoint Orbax) |

## Arquitectura y entrenamiento

La informacion disponible no documenta la arquitectura interna del modelo, el numero de parametros, la composicion del dataset ni el proceso de entrenamiento. Se sabe que es una politica pi0.5 del ecosistema openpi. El checkpoint fue entrenado hasta el paso 29999 en el experimento `stage3_clean_v1`. El repositorio contiene pesos EMA, estadisticas de normalizacion en `assets/<repo_id>/norm_stats.json` y metadatos de Orbax. No se aportan detalles sobre innovaciones tecnicas ni sobre la configuracion exacta del entrenamiento. El checkpoint no incluye `train_state`, por lo que no puede utilizarse para reanudar el entrenamiento.

## Capacidades

- Control de un robot bimanual xArm7 para ejecutar una etapa de la tarea "shaver-box".
- Espacio de estado y accion de 16 dimensiones: 7 articulaciones por brazo (derecho e izquierdo) mas pinza por brazo, con relleno a 32 dimensiones.
- Emision de acciones delta para las 14 articulaciones y acciones absolutas para las 2 pinzas, con valores binarios estrictos (0.0 o 1.0) en las dimensiones de pinza.
- Procesamiento de datos a 60 fps con un horizonte de accion de 16.
- Capacidad de integrarse en el framework OpenPI mediante `serve_policy.py`, siempre que se use una configuracion cuyo `repo_id` coincida con el directorio dentro de `assets/`.

## Casos de uso

- Manipulacion bimanual en ensamblaje: el modelo coordina los dos brazos xArm7 para ejecutar movimientos sincronizados en una etapa de la tarea "shaver-box". Su espacio de 14 articulaciones mas pinzas permite alinear ambas extremidades durante la operacion.
- Automatizacion de una fase concreta de un proceso industrial: al estar entrenado especificamente para la etapa "stage3_clean", puede integrarse en un pipeline robotico donde se necesita una politica dedicada para una fase del proceso, en lugar de un controlador general.
- Investigacion en politicas de robotica: sirve como checkpoint de referencia para estudiar el comportamiento de pi0.5 en manipulacion bimanual, incluyendo el analisis de transferencia entre etapas o la normalizacion de estados.
- Desarrollo de politicas de bajo nivel: puede usarse como punto de partida para fine-tuning o para evaluar el rendimiento de politicas en hardware real frente a simulacion, gracias a las estadisticas de normalizacion incluidas.
- Control de pinzas y articulaciones en configuracion bimanual: el modelo emite comandos diferenciados (delta para joints, absoluto para grippers), lo que resulta util en tareas donde la pinza debe agarrar con precision mientras los brazos se mueven.
- Evaluacion de checkpoints de OpenPI: la disponibilidad de un checkpoint intermedio (paso 29999) permite analizar la evolucion del entrenamiento y la convergencia de la politica en una tarea de robotica real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- No se dispone de informacion sobre si el checkpoint cabe en GPU de consumo.
- Opciones de despliegue: el checkpoint debe servirse mediante `serve_policy.py` del framework OpenPI, usando una configuracion cuyo `repo_id` coincida con el directorio dentro de `assets/`. No se documentan alternativas como vLLM, llama.cpp o TGI.
- El tamano del repositorio es de 12.4 GB, lo que puede servir como referencia de espacio en disco, pero la VRAM necesaria no esta especificada.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar este checkpoint con otros modelos de la misma categoria. En la informacion proporcionada no se incluyen datos de modelos comparables, como pi0 base, pi0.5 original u otras politicas de manipulacion bimanual, ni sus especificaciones o resultados. Por tanto, la comparacion no esta disponible.

## Limitaciones y advertencias

- El checkpoint esta disenado exclusivamente para una etapa concreta ("stage3_clean") de la tarea "shaver-box" con un robot xArm7 bimanual. No es una politica generalista.
- No incluye la configuracion del modelo; debe servirse con una configuracion cuyo `repo_id` coincida con el nombre del directorio dentro de `assets/`. Usar la configuracion por defecto `pi05_xarm7_real` provocara un fallo al resolver las estadisticas de normalizacion.
- No incluye `train_state`, por lo que no puede usarse para reanudar el entrenamiento; solo para inferencia o evaluacion.
- La licencia no esta disponible, lo que genera incertidumbre sobre el uso comercial y la redistribucion.
- Al tratarse de un modelo de robotica, no hay riesgo de alucinacion textual, pero si pueden producirse acciones incorrectas o inseguras en el robot si el entorno no coincide con el esperado por la politica.
- El rendimiento depende de las estadisticas de normalizacion incluidas; si no se cargan correctamente, la salida de la politica puede degradarse.
- No se ha documentado el idioma del modelo; al no ser un modelo de lenguaje, la nocion de idiomas soportados no aplica.

## Enlaces

- HuggingFace: https://huggingface.co/mattewg/pi05-xarm7-shaver-stage3_clean

No hay otros enlaces relevantes entre los resultados de busqueda web proporcionados.
