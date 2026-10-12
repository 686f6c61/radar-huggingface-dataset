# DenRakEiw/microduck-sprint-unleashed

## Resumen

sprint-unleashed es una politica de control entrenada mediante aprendizaje por refuerzo para el robot cuadrupedo microduck de Pollen Robotics. No se trata de un modelo de lenguaje, sino de una politica de locomocion ("perpetual") que recibe un vector de observacion de 61 dimensiones y emite 14 acciones de control a una frecuencia de 50 Hz. Se distribuye en formato ONNX, con el normalizador de observaciones ya integrado en el fichero `policy.onnx`, de modo que la politica consume observaciones en crudo directamente.

El modelo ha sido desarrollado por el usuario DenRakEiw como participacion en los retos de microduck (`microduck-challenges`), bajo la tarea `Mjlab-Sprint2m-MicroDuck`. La politica se ejecuta de forma continua hasta que se le indique lo contrario, y esta pensada para cargarse en una "policy slot" del robot mediante el comando `robotctl policy load`.

Es relevante por su caracter abierto y reproducible: la model card documenta el commit exacto (`3613cbee3`), el checkpoint (`1100`), la semilla (`1`) y el comando de entrenamiento completo, permitiendo reentrenar una politica comparable (aunque no identica, dado que el RL sobre GPU no es bit-reproducible). El repositorio es de tamano practicamente nulo (0.0 GB reportados), lo que concuerda con una politica ligera orientada a ejecucion en el propio robot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (politica de control entrenada con reinforcement learning; topologia no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; usa observacion de 61 dimensiones) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX) |
| Idiomas soportados | no aplica (politica de control robotico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del microduck policy manifest) |

## Arquitectura y entrenamiento

La informacion disponible indica que se trata de una politica de control entrenada por aprendizaje por refuerzo para la tarea `Mjlab-Sprint2m-MicroDuck`, con un espacio de observacion de 61 dimensiones y un espacio de accion de 14 dimensiones, ejecutandose a 50 Hz. La topologia concreta de la red (capas, activaciones, tamano) no se detalla en la model card.

El entrenamiento se realizo con el framework `mjlab-microduck 0.1.0` (base en el commit `8d0dbc94c`), sobre el repositorio `microduck-challenges` en la rama `denrakeiw`, commit `3613cbee3`, con semilla `1` y checkpoint final `1100`. La configuracion de entrenamiento uso 4096 entornos paralelos, un maximo de 1500 iteraciones y guardado cada 100 iteraciones, con registro en TensorBoard. La model card advierte explicitamente que reentrenar con el mismo codigo, `uv.lock`, comando y semilla produce una politica "comparable, pero no los mismos pesos", ya que el RL sobre GPU no es reproducible bit a bit entre maquinas. El normalizador de observaciones esta integrado en el ONNX, lo que constituye la unica innovacion tecnica destacable documentada.

## Capacidades

- Locomocion continua ("perpetual"): la politica ejecuta una marcha o gait de sprint sin limite de pasos, activa hasta que se detenga explicitamente.
- Control cuadrupedo: mapea observaciones de 61 dimensiones a 14 acciones de control a 50 Hz.
- Inferencia directa sobre ONNX: consume observaciones en crudo, ya que el normalizador esta integrado en el propio modelo.
- Despliegue en robot real: se carga en una policy slot mediante `robotctl policy load <slot> <repo>`.
- Reproducibilidad documentada: incluye tarea, rama, commit, semilla y comando de entrenamiento para replicar el pipeline.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no aplica (no procesa lenguaje natural).
- Modo "thinking", vision o audio: no disponible.

## Casos de uso

- Locomocion autonoma del microduck: la politica permite que el robot avance de forma continua en tareas de sprint, ideal para pruebas de marcha sostenida sobre terrenos controlados en laboratorio.
- Investigacion en aprendizaje por refuerzo: sirve como politica de referencia y punto de partida reproducible para comparar variantes de entrenamiento (distintas semillas, numero de entornos o iteraciones) sobre la misma tarea `Mjlab-Sprint2m-MicroDuck`.
- Benchmarking de simulacion a realidad: al distribuirse en ONNX con normalizador integrado, facilita la transferencia de una politica entrenada en simulacion al robot fisico sin reimplementar el preprocesamiento.
- Docencia y prototipado robotico: por su ligereza y su formato ONNX, puede integrarse en cursos o talleres sobre control cuadrupedo y RL sin requerir infraestructura de gran escala.
- Base para tareas derivadas: al ser una politica de marcha continua, puede emplearse como modulo base de locomocion sobre el que construir capas de navegacion o planificacion.
- Validacion de pipelines de despliegue: util para probar el flujo `robotctl policy load` y el esquema 2 del manifiesto de politicas del daemon de microduck.
- Reproduccion de experimentos: gracias a los metadatos de entrenamiento (commit, semilla, checkpoint), se puede usar para auditar la reproducibilidad de un pipeline de RL con mjlab.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se especifica el tamano del modelo; el ONNX es presumiblemente ligero).
- GPU recomendadas: no disponible. Para el reentrenamiento, la model card menciona entrenamiento con 4096 entornos paralelos sobre GPU, pero no indica modelo concreto.
- ¿Cabe en consumer GPU?: no disponible para inferencia; el entrenamiento con 4096 entornos es intensivo en recursos, aunque no se detalla el hardware empleado.
- Opciones de despliegue: ONNX Runtime (inferencia a bordo del robot) y el cargador de politicas `robotctl` del daemon de microduck. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables).
- Latencia y throughput estimados: la frecuencia de control documentada es de 50 Hz, pero no se proporcionan cifras de latencia ni de throughput de inferencia.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros modelos comparables de la misma categoria (politicas de locomocion para microduck u otros cuadrupedos).

## Limitaciones y advertencias

- La licencia no esta disponible: no se puede confirmar si se permite el uso comercial.
- No hay informacion sobre sesgos del modelo; al ser una politica de control, el concepto de sesgo aplicable seria el de sesgo de simulacion a realidad (sim-to-real gap), que no se documenta.
- Riesgo de fallo fuera de distribucion: al ser una politica entrenada en simulacion para una tarea concreta (`Sprint2m`), puede comportarse de forma impredecible ante terrenos, cargas o perturbaciones no vistas durante el entrenamiento.
- Entrenamiento no reproducible bit a bit: la propia model card advierte que reentrenar no genera los mismos pesos, lo que limita la replicabilidad exacta.
- Alcance limitado: es una politica de marcha continua, sin capacidades de lenguaje, vision, tool calling ni razonamiento.
- No se documentan condiciones de seguridad, parada de emergencia ni limites de operacion en el robot fisico.
- Repositorio sin descargas ni likes y con 0.0 GB reportados: la disponibilidad efectiva de los ficheros (`policy.onnx`, `manifest.json`) no se puede verificar desde la informacion dada.

## Enlaces

- HuggingFace: https://huggingface.co/DenRakEiw/microduck-sprint-unleashed
- Repositorio microduck (robot): https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Documentacion del manifiesto de politicas (referenciada): `docs/policy-manifest.md` en el repositorio del daemon de microduck (URL directa no disponible)
