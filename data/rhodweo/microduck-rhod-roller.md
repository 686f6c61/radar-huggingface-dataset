# RhodWeo/microduck-rhod-roller

## Resumen

Rhod es una politica de control obtenida por aprendizaje por refuerzo para el robot microduck de Pollen Robotics, distribuida como un unico fichero `policy.onnx` acompanado de un `manifest.json`. El autor es el usuario RhodWeo, que publica el resultado bajo el identificador `microduck-rhod-roller`, correspondiente a la tarea `Mjlab-RollerSprint2m-MicroDuck`: una politica de marcha (gait) perpetua para el robot desplazandose sobre ruedas o rodillos, que se ejecuta de forma continua hasta que se le ordena lo contrario. El modelo consume 61 dimensiones de observacion y produce 14 acciones a 50 Hz, un perfil tipico de politica de control de cuerpo completo en robotica de patas o de base movil.

Tecnicamente no es un modelo de lenguaje ni un modelo multimodal: es una red neuronal entrenada con refuerzo en simulacion mediante la libreria mjlab, exportada a ONNX para su ejecucion en el robot. El repositorio pesa 0,0 GB y no registra descargas ni likes, por lo que se trata de un artefacto recien publicado y sin validacion externa en el momento de la consulta. La licencia y los idiomas no estan declarados en la informacion disponible.

Su relevancia es acotada pero concreta: encaja en el ecosistema de politicas cargables por slot del demonio de control de microduck (`robotctl policy load`), y sirve como referencia reproducible de un entrenamiento con semilla y commit fijados, aunque el propio autor advierte que el resultado no es bit-reproducible entre maquinas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de politica entrenada con aprendizaje por refuerzo y exportada a ONNX; topologia interna no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (politica de control; ventana de observacion de 61 dimensiones) |
| Tipos de cuantizacion | no disponible (se distribuye un unico `policy.onnx`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) con normalizador de observaciones embebido, mas `manifest.json` con esquema 2 del manifiesto de politicas de microduck |

## Arquitectura y entrenamiento

La informacion disponible no describe la topologia de la red (numero de capas, tipo de capa recurrente o feedforward, funcion de activacion). Lo que si se documenta es el pipeline: politica entrenada con aprendizaje por refuerzo en mjlab sobre la base `mjlab-microduck 0.1.0 @ 8d0dbc94c`, con la tarea `Mjlab-RollerSprint2m-MicroDuck` del repositorio `microduck-challenges` (rama `main`, commit `f5a4318c5`). El entrenamiento partio del checkpoint 1500, con semilla 1, y se lanzo el 2026-10-13T11:51:39Z. El comando de reproduccion usa 3072 entornos paralelos y un maximo de 4000 iteraciones del agente, con registro en TensorBoard y nombre de ejecucion `envs3072`.

Un detalle de implementacion relevante para el despliegue es que el normalizador de observaciones esta embebido dentro de `policy.onnx`: el consumidor debe alimentar observaciones crudas, sin preprocesar. La politica es de tipo perpetuo, es decir, no termina por si sola sino que se ejecuta como bucle de control continuo hasta recibir una orden de parada o de cambio de slot. El autor advierte explicitamente que reentrenar con el mismo codigo, `uv.lock`, comando y semilla produce una politica comparable pero no pesos identicos, porque el entrenamiento por refuerzo con GPU no es bit-reproducible entre maquinas.

## Capacidades

- Control de locomocion sobre rodillos o ruedas para el robot microduck, con una interfaz de 61 observaciones de entrada y 14 acciones de salida.
- Ejecucion de una marcha perpetua: mantiene el comportamiento de desplazamiento de forma continua sin necesidad de re-disparo, segun la descripcion del autor.
- Frecuencia de control de 50 Hz, adecuada para bucles de control de bajo nivel en robotica movil.
- Integracion directa con el sistema de slots de politicas de microduck mediante `robotctl policy load <slot> RhodWeo/microduck-rhod-roller`.
- Normalizacion de observaciones integrada en el grafo ONNX, lo que simplifica la integracion al no requerir preprocesado externo.
- No soporta tool calling, function calling, razonamiento multi-paso, generacion de texto, codigo, matematicas ni vision. No hay capacidades multilingues ni modo de pensamiento: es exclusivamente una politica de control motor.

## Casos de uso

- Control de marcha de un microduck sobre rodillos: cargar la politica en un slot del demonio con `robotctl policy load` y dejar que el robot se desplace de forma continua durante sesiones de demostracion o exhibicion, aprovechando que la politica es perpetua.
- Base para experimentos de aprendizaje por refuerzo comparativos: al fijar commit `f5a4318c5`, semilla 1, `uv.lock` y comando de entrenamiento, sirve como referencia para medir el efecto de cambios en la tarea, el numero de entornos o la recompensa dentro del repositorio `microduck-challenges`.
- Banco de pruebas de integracion del pipeline ONNX en robot: permite validar el camino completo de carga de politica, normalizacion embebida y ejecucion a 50 Hz antes de invertir en entrenamientos mas largos.
- Docencia y talleres de robotica con refuerzo: el flujo es acotado (clonar repo, `uv sync`, `uv run train`) y utilizable en sesiones practicas con hardware microduck.
- Despliegue en flotas pequenas de robots de bajo coste: la licencia no esta declarada, por lo que cualquier uso comercial requiere aclaracion previa con el autor; en entornos de investigacion o internos puede emplearse como politica de partida.
- Sustitucion o comparacion de politicas en un mismo robot: al ocupar un slot, se puede alternar entre esta politica y otras para evaluar cual se comporta mejor en la misma tarea de desplazamiento.
- Reproduccion de resultados de simulacion en hardware: util para verificar la transferencia simulacion-a-realidad de una politica entrenada en mjlab.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de retorno de episodio, tasa de exito, velocidad alcanzada ni comparaciones cuantitativas con otras politicas. Tampoco se proporcionan curvas de entrenamiento ni valores de TensorBoard.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamano del repositorio es de 0,0 GB, lo que sugiere un artefacto ONNX muy pequeno, pero no se declara el numero de parametros ni el peso exacto del fichero.
- GPU recomendadas: no disponibles para inferencia. Para entrenamiento, el comando documentado asume aceleracion GPU (3072 entornos paralelos), pero no se especifica el modelo de GPU empleado.
- Compatibilidad con GPU de consumo: no disponible. Dado el perfil de politica de control a 50 Hz, es plausible que la inferencia no requiera GPU dedicada, pero no hay datos que lo confirmen.
- Opciones de despliegue: carga mediante el demonio de microduck con `robotctl policy load <slot> RhodWeo/microduck-rhod-roller`; ejecucion del grafo ONNX con un runtime compatible con ONNX. Las pilas de servido de modelos de lenguaje (vLLM, TGI, Ollama, llama.cpp) no son aplicables a este artefacto.
- Latencia y throughput: el unico dato objetivo es la frecuencia de control de 50 Hz, que implica un presupuesto de 20 ms por ciclo de inferencia mas actuacion. No se publican mediciones de latencia ni de tiempo de inferencia del grafo ONNX.
- Entrenamiento: se documenta 3072 entornos y 4000 iteraciones maximas del agente, sin detalle de horas de GPU ni de hardware utilizado.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otras politicas comparables del mismo ecosistema, ni resultados que permitan situar a Rhod frente a alternativas. Como referencia estructural, el propio repositorio `microduck-challenges` es el lugar donde podrian existir politicas equivalentes para otras tareas, pero no se aportan datos de ninguna de ellas en esta busqueda.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir permiso de uso comercial, modificacion o redistribucion. Es un riesgo legal directo para cualquier despliegue en produccion.
- Ausencia total de benchmarks: no hay evidencia publicada de rendimiento, robustez ni tasa de exito, ni en simulacion ni en hardware.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta; el artefacto es reciente y no ha sido auditado por terceros.
- No reproducibilidad bit a bit: el propio autor indica que reentrenar con la misma semilla produce pesos distintos, lo que complica la verificacion independiente de resultados.
- Sesgos: no aplica el concepto de sesgo linguistico o social habitual en modelos de lenguaje, pero si existe el riesgo de sobreajuste al escenario de entrenamiento (terreno, friccion, dinamica del simulador) y de degradacion al transferir a condiciones reales distintas.
- Riesgo de alucinacion: no aplica; el modelo no genera texto. El riesgo equivalente es una respuesta de control incorrecta o inestable ante observaciones fuera de distribucion.
- Limitaciones de idioma y contexto: no aplica, al no procesar lenguaje ni mantener contexto conversacional. La unica "ventana" es el vector de 61 observaciones.
- Despliegue fisico: al tratarse de una politica que mueve un robot real, cualquier carga en hardware debe hacerse en un entorno controlado, con limites de par y velocidades, y con un procedimiento de parada de emergencia disponible.
- Datos de entrenamiento no documentados: no se especifica la composicion del dataset, el dominio aleatorizado, el numero de muestras ni el esquema de recompensa.
- Fechas del repositorio: los metadatos indican creacion y actualizacion en octubre de 2026, posteriores a la fecha habitual de consulta; conviene verificar la vigencia y autoria del artefacto antes de integrarlo.

## Enlaces

- Ficha del modelo en HuggingFace: https://huggingface.co/RhodWeo/microduck-rhod-roller
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de retos y tareas de entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Documentacion del manifiesto de politicas: `docs/policy-manifest.md` dentro del repositorio del demonio de control de microduck (no se proporciona URL directa)
- Tarea asociada: `Mjlab-RollerSprint2m-MicroDuck`, rama `main`, commit `f5a4318c5`
- Base de entrenamiento: `mjlab-microduck 0.1.0 @ 8d0dbc94c`
