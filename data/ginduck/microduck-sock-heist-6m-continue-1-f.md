# GinDuck/microduck-sock-heist-6m-continue-1-f

## Resumen

`sock-heist-6m-continue-1-f` es un checkpoint de politica de aprendizaje por refuerzo (RL) entrenado para el robot cuadrupedo de bajo coste **microduck** de Pollen Robotics. No es un modelo de lenguaje: es una politica de control motor que recibe observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, empaquetada en formato ONNX para su despliegue directo en el robot mediante el daemon `robotctl`. El autor, GinDuck, la publica como continuación de una ejecución previa de entrenamiento ("continue-1") dentro del reto *SockHeist6m*.

La tarea entrenada consiste en que el robot se aproxime sigilosamente a un objetivo (un calcetín), esquive guardias y lo agarre sin ser detectado, en aproximadamente 10 segundos según las pruebas del propio autor. La politica es de tipo *perpetual*: se ejecuta de forma continua como una marcha cargada en una ranura de politica del robot, sin condición de terminación interna. El entrenamiento se realizó con el framework `mjlab` (basado en MuJoCo) sobre 4096 entornos paralelos durante 1500 iteraciones máximas, con semilla 1 y el checkpoint 1200.

El interés de esta ficha es limitado para el público general de modelos de IA, pero es relevante como ejemplo de pipeline completo de RL para robótica: definición de tarea en un repositorio de retos, entrenamiento masivo en GPU, exportación a ONNX con normalizador de observaciones embebido y despliegue en hardware real mediante un manifiesto versionado. El repositorio es de 0.0 GB (artefacto muy pequeño) y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de control por aprendizaje por refuerzo (entrenada con mjlab sobre MuJoCo); topologia de red no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (politica de control, no modelo de lenguaje); observacion de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible (exportacion a ONNX; el autor no documenta cuantizacion) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de politicas microduck) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna de la red (capas, activaciones, tamano del MLP o si incorpora memoria recurrente). Lo que si se documenta es el pipeline de entrenamiento: la tarea `Mjlab-SockHeist6m-MicroDuck` se entrena con el framework `mjlab` (version base `mjlab-microduck 0.1.0 @ 1efd853be`), sobre el repositorio `pollen-robotics/microduck-challenges`, rama `sock-continue`, commit `395d47056`. La ejecucion usa 4096 entornos paralelos, un maximo de 1500 iteraciones del agente, semilla 1, logging a TensorBoard y nombre de ejecucion `continue-1`; el checkpoint publicado corresponde a la iteracion 1200.

El autor advierte explicitamente de que el entrenamiento no es reproducible bit a bit entre maquinas: repetir el comando con el mismo `uv.lock`, mismo commit y misma semilla produce una politica "comparable", no los mismos pesos. El artefacto desplegable es un `policy.onnx` con el normalizador de observaciones embebido, de modo que el robot alimenta observaciones crudas, y un `manifest.json` conforme al schema 2 del manifiesto de politicas del daemon. La politica es *perpetual*: no tiene condicion de terminacion propia y se ejecuta hasta que se le indique lo contrario.

## Capacidades

- Control motor de un cuadrupedo microduck con observacion de 61 dimensiones y 14 acciones a 50 Hz.
- Ejecucion de una marcha perpetua cargada en una ranura de politica (`robotctl policy load <slot> ...`).
- Comportamiento entrenado especifico: aproximacion sigilosa, evasion de guardias y agarre de un calcetin en la tarea SockHeist6m.
- Normalizacion de observaciones integrada en el ONNX: acepta observaciones crudas del robot sin preprocesado externo.
- Despliegue en hardware real mediante el daemon microduck y su sistema de manifiestos versionados.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues: es una politica de control, no un modelo generativo.

## Casos de uso

- **Investigacion en RL para robotica de bajo coste**: usar el checkpoint como linea base reproducible (con las salvedades de no determinismo) para comparar variantes de recompensa, observaciones o hiperparametros en la tarea SockHeist6m.
- **Demostracion de sigilo y evasion en cuadrupedos**: el comportamiento entrenado (pasar junto a guardias y agarrar el objetivo sin ser detectado en unos 10 segundos) sirve para estudiar politicas de navegacion cautelosa en entornos con obstaculos dinamicos.
- **Validacion de pipelines de despliegue ONNX en robot**: probar el flujo completo `manifest.json` + `policy.onnx` con normalizador embebido y carga via `robotctl` en una ranura de politica, util para equipos que integran modelos en el daemon.
- **Punto de partida para fine-tuning o continuacion de entrenamiento**: al ser un checkpoint intermedio (iteracion 1200 de 1500) de una ejecucion "continue", es adecuado para reanudar entrenamiento con nuevas condiciones de escena.
- **Benchmark interno de simulacion a hardware**: comparar el rendimiento en simulacion (mjlab/MuJoCo con 4096 entornos) frente al comportamiento observado en el robot fisico, para calibrar la brecha sim-a-real.
- **Docencia y talleres de RL aplicado**: ejemplo compacto (repositorio de 0.0 GB) de tarea definida en un repo de retos, comando de entrenamiento completo y artefacto desplegable, apropiado para practicas guiadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento aportado por el autor es cualitativo: en sus propias pruebas, la politica completa la tarea de agarrar el calcetin sin ser detectada en aproximadamente 10 segundos. No hay tasas de exito, curvas de recompensa ni comparaciones con otras politicas.

## Requisitos de hardware

- **Inferencia en robot**: el artefacto es un `policy.onnx` de un repositorio de 0.0 GB; se ejecuta en el propio microduck a 50 Hz. VRAM y GPU no aplican al despliegue: la inferencia es en CPU del robot.
- **Entrenamiento**: se realizo con 4096 entornos paralelos en GPU (el autor no especifica el modelo de GPU). El comando documentado usa `uv run train` con `--env.scene.num-envs 4096` y `--agent.max-iterations 1500`; no se indica VRAM necesaria.
- **GPU recomendadas**: no disponible.
- **Compatibilidad con GPU de consumo**: no disponible para entrenamiento; para inferencia no se requiere GPU.
- **Opciones de despliegue**: daemon microduck con `robotctl policy load <slot> GinDuck/microduck-sock-heist-6m-continue-1-f`; el runtime ONNX concreto no se detalla en la informacion disponible. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican).
- **Latencia y throughput**: la politica opera a 50 Hz (periodo de 20 ms por paso de control); no se publican latencias medidas ni throughput de entrenamiento.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otras politicas microduck comparables ni datos de rendimiento de alternativas. Como referencia estructural, el propio repositorio `pollen-robotics/microduck-challenges` alberga otras tareas y politicas, pero no se aportan sus especificaciones ni resultados en esta consulta.

## Limitaciones y advertencias

- **Licencia no disponible**: no se especifica licencia, por lo que no puede asumirse permiso de uso comercial, redistribucion ni modificacion. Es un bloqueo para produccion.
- **Especificidad de tarea**: la politica esta entrenada para SockHeist6m (sigilo, evasion de guardias, agarre de calcetin); no es una politica general de locomotion ni de manipulacion.
- **No determinismo del entrenamiento**: el autor advierte que repetir el entrenamiento no reproduce los mismos pesos, solo una politica comparable; cualquier resultado debe validarse empiricamente.
- **Rendimiento reportado solo por el autor**: el dato de "unos 10 segundos" procede de pruebas propias, sin protocolo publico, numero de ensayos ni tasa de exito.
- **Documentacion tecnica incompleta**: no se detalla la arquitectura de red, el numero de parametros, el dataset de entrenamiento (mas alla de la simulacion), ni el runtime ONNX exacto.
- **Riesgo de brecha sim-a-real**: entrenada en mjlab/MuJoCo con 4096 entornos; el comportamiento en el robot fisico puede degradarse respecto a simulacion.
- **Sin datos de sesgos ni alucinacion**: no aplica en el sentido de modelos de lenguaje, pero si implica ausencia de garantias formales de seguridad en el control motor.
- **Sin senal de adopcion**: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-sock-heist-6m-continue-1-f
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Enlace externo citado por el autor (QuackPack): https://www.imundo.ch/quackpack/
- Manifiesto de politicas (referencia `docs/policy-manifest.md` en el repositorio del daemon): no disponible como URL directa en la informacion proporcionada.
