# atomicvox/microduck-roller-sprint-2m-run-1110-1743

## Resumen

`microduck-roller-sprint-2m-run-1110-1743` es una política de control obtenida mediante aprendizaje por refuerzo para el robot cuadrúpedo microduck de Pollen Robotics. No es un modelo de lenguaje: es un controlador neuronal exportado a ONNX que recibe observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, pensado para ejecutarse sobre ruedas (rollers). El autor es el usuario `atomicvox`, que lo publica como artefacto de una ejecución concreta de entrenamiento (`run-1110-1743`) dentro de su repositorio de retos `microduck-challenges`.

La política es de tipo "perpetuo" (perpetual): una vez cargada en una ranura de política del demonio `robotctl`, el robot mantiene la marcha indefinidamente hasta que se le indique lo contrario. Se entrenó con `mjlab` (entorno de RL basado en MuJoCo) sobre la tarea `Mjlab-RollerSprint2m-MicroDuck`, con 4096 entornos paralelos, 2000 iteraciones máximas y semilla 1, partiendo del checkpoint 500.

Su relevancia es acotada pero clara para quien trabaja con robótica de bajo coste: demuestra un flujo completo de entrenamiento, empaquetado (ONNX + `manifest.json` con esquema 2) y despliegue en robot real mediante `robotctl`. El repositorio pesa 0.0 GB según Hugging Face, lo que sugiere un artefacto muy pequeño, coherente con una política de red neuronal compacta para control reactivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL exportada a ONNX; arquitectura de red no detallada en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (artefacto ONNX; normalizador de observaciones embebido en `policy.onnx`) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La model card no describe la topología de la red (número de capas, anchura, tipo de activación). Lo que sí se especifica es la interfaz: observación de 61 dimensiones de entrada, 14 acciones de salida, frecuencia de control de 50 Hz y ejecución sobre rollers. El normalizador de observaciones está integrado dentro de `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo sin preprocesado adicional.

El entrenamiento se realizó con `mjlab` (versión base `mjlab-microduck 0.1.0 @ 1efd853be`) sobre la tarea `Mjlab-RollerSprint2m-MicroDuck`, con 4096 entornos paralelos, hasta 2000 iteraciones del agente y semilla 1, registrando en TensorBoard bajo el nombre `run-1110-1743`. El checkpoint publicado corresponde al paso 500. El autor advierte explícitamente que el proceso no es bit-reproducible entre máquinas: repetir el comando con el mismo código, `uv.lock` y semilla produce una política comparable, no idéntica.

## Capacidades

- Control locomotor perpetuo del microduck sobre rollers: mantiene la marcha hasta recibir una orden de parada o cambio de política.
- Política reactiva a partir de observaciones proprioceptivas de 61 dimensiones (el desglose exacto de la observación no se detalla en la model card).
- Emisión de 14 acciones de control a 50 Hz, adecuada para el bucle de control de bajo nivel del robot.
- Integración con el demonio `robotctl` mediante carga en una ranura de política (`robotctl policy load <slot> ...`).
- Normalización de observaciones incluida en el propio grafo ONNX, lo que simplifica la integración en el cliente.
- No soporta tool calling, agentes, razonamiento multi-paso, capacidades multilingües, visión, audio ni modos de pensamiento: es un controlador motor, no un modelo generativo.

## Casos de uso

- Demostración de locomoción sobre ruedas en microduck: cargar la política en una ranura y dejar que el robot avance de forma continua en una pista o superficie lisa, útil para validar el hardware y el firmware del robot antes de abordar tareas más complejas.
- Benchmark de referencia para pipelines de RL: al fijar tarea, commit, semilla y comando de reproducción, sirve como línea base contra la que comparar nuevas ejecuciones de `Mjlab-RollerSprint2m-MicroDuck`.
- Pruebas de integración del demonio `robotctl`: verifica el flujo de carga de políticas, la lectura de `manifest.json` con esquema 2 y la inyección de observaciones en crudo en `policy.onnx`.
- Docencia y talleres de robótica con refuerzo: el artefacto es pequeño, desplegable en el robot y reproducible con `uv`, lo que facilita que estudiantes comparen políticas entrenadas con distintas semillas.
- Evaluación de robustez de controladores ONNX en hardware real: permite medir deriva, latencia del bucle a 50 Hz y comportamiento ante perturbaciones externas con una política concreta y versionada.
- Base para ajuste fino o currículo de habilidades: al estar el código de entrenamiento en `microduck-challenges`, se puede partir de este entorno y esta configuración para entrenar variantes (giros, frenadas, terrenos distintos) y contrastar contra esta política de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recompensa, velocidad alcanzada, tasa de caídas ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño del repositorio (0.0 GB) y la naturaleza del artefacto (política ONNX para control a 50 Hz), se espera un consumo muy bajo, pero no hay cifras publicadas.
- GPU recomendadas: no aplica para inferencia en robot; el modelo está pensado para ejecutarse en la computadora del microduck. Para reentrenar, la model card cita 4096 entornos paralelos, lo que en la práctica exige una GPU de datacenter (A100/H100 o similar), aunque no se especifica el hardware usado.
- Compatibilidad con GPU de consumo: no confirmada para entrenamiento con 4096 entornos; para inferencia, el cuello de botella es la CPU del robot, no la GPU.
- Opciones de despliegue: ONNX Runtime a través del demonio `robotctl` del proyecto microduck; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: frecuencia de control fijada en 50 Hz (periodo de 20 ms); no se publican latencias medidas ni margen de cómputo por paso.

## Comparativa con modelos similares

No disponible. La model card no referencia otras políticas microduck ni resultados de comparación. Como referencia estructural, el ecosistema microduck de Pollen Robotics publica políticas con el mismo formato (ONNX + `manifest.json`), pero no se dispone de datos de rendimiento de alternativas concretas en la información proporcionada.

## Limitaciones y advertencias

- Entrenada específicamente para desplazamiento sobre rollers; no hay evidencia de que funcione en otras configuraciones de patas o terrenos.
- Política "perpetua": no incorpora lógica de parada segura por sí misma; la detención depende del demonio `robotctl` y de la supervisión externa.
- No es bit-reproducible: el propio autor advierte que el mismo comando y semilla producen pesos distintos en otra máquina.
- Licencia no disponible: no se puede asumir uso comercial sin consultar al autor.
- Sin datos de sesgos, alucinación o idioma por no ser un modelo lingüístico; los riesgos relevantes son de seguridad física (caídas, colisiones) y de robustez ante cambios de superficie o carga.
- Artefacto de una ejecución concreta (checkpoint 500 de la semilla 1); no hay garantía de que sea el mejor checkpoint de la ejecución ni de que se haya validado en robot real más allá de lo indicado.
- El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/atomicvox/microduck-roller-sprint-2m-run-1110-1743
- Repositorio de entrenamiento: `git@github.com:atomicvox/microduck-challenges.git` (commit `8153f3e4f`, rama `main`)
- Proyecto microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del demonio microduck
