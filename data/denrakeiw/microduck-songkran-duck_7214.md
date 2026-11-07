# DenRakEiw/microduck-songkran-duck_7214

## Resumen

`microduck-songkran-duck_7214` es una politica de control motriz entrenada por refuerzo para el robot bipedo open source Microduck de Pollen Robotics. No es un modelo de lenguaje: es una red neuronal que genera comandos de actuacion a 50 Hz a partir de observaciones del robot, empaquetada en formato ONNX y distribuida mediante el repositorio `pollen-robotics/microduck_rl`. El autor, DenRakEiw, la publica como una "gait" perpetua para el slot `walk` del demonio de control del robot.

La politica parte de un checkpoint previo (`songkran-duck_7199`, descrito como una red de carrera de sprint reentrenada para congelarse ante la presencia del "gigante" y frenar en su turno, checkpoint `hr2b-brake 1575`, envuelta en un wrapper de ritmo fijo) y refina sus pesos en CPU mediante estrategias de evolucion, seleccionando los individuos que completan la tarea bajo ruido de accion minimo. El resultado es un controlador de marcha que se ejecuta de forma continua hasta que se le ordena lo contrario.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigacion en robotica con refuerzo, con cero descargas y cero likes en el momento de la consulta, sin licencia declarada y sin model card con especificaciones tecnicas detalladas. Su interes practico esta ligado al ecosistema Microduck y a la reproducibilidad del pipeline de entrenamiento, no a tareas de NLP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de politica para control motriz (detalles de capas no disponibles); inferencia via ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` conforme al esquema 2 del manifiesto de politicas de microduck |
| Observacion | 61 dimensiones |
| Acciones | 14 |
| Frecuencia de control | 50 Hz |
| Libreria | microduck |
| Pipeline | robotics |
| Tamano del repo | 0.0 GB |

## Arquitectura y entrenamiento

El modelo es una politica de aprendizaje por refuerzo destinada al control de un robot bipedo. Segun la model card, se entrena en el repositorio `pollen-robotics/microduck_rl`, rama `denrakeiw-070`, commit `97e2b1fe2`. La receta descrita combina un punto de partida heredado (una red de sprint `songkran-duck_7199`, derivada del checkpoint `hr2b-brake 1575` y envuelta en un wrapper de ritmo fijo) con un pulido posterior de los pesos en CPU mediante estrategias de evolucion. La seleccion de individuos se hace por criterio de finalizacion de la tarea bajo ruido de accion minimo, lo que apunta a un objetivo de robustez ante perturbaciones pequenas en las acciones.

La politica se declara "perpetua": genera comandos de forma continua hasta recibir una orden de parada, y esta asociada al slot `walk` del sistema de control. El normalizador de observaciones esta integrado en el propio `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo. No se especifican en la informacion disponible el numero de tokens, la composicion del dataset de entrenamiento, ni si hubo fases de RLHF o DPO (no aplicables en este dominio). La model card menciona que el entrenamiento se realizo "con energia solar", un detalle descriptivo sin impacto tecnico verificable.

## Capacidades

- Generacion de comandos de actuacion para marcha bipeda a 50 Hz a partir de un vector de observacion de 61 dimensiones.
- Control continuo e indefinido (politica "perpetua") hasta que el demonio de control emite una orden de parada.
- Comportamiento de congelacion ante la presencia del "gigante" y frenado en el turno, heredado del checkpoint `hr2b-brake 1575`.
- Robustez ante ruido de accion minimo, criterio explicito de seleccion durante el pulido por estrategias de evolucion.
- Integracion directa con el demonio de control del Microduck mediante `robotctl policy load walk`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.
- No se declaran capacidades de vision, audio ni modo "thinking".

## Casos de uso

- Marcha autonoma del Microduck en laboratorio: cargar la politica en el slot `walk` con `robotctl policy load walk DenRakEiw/microduck-songkran-duck_7214` y dejar que el robot camine de forma continua mientras se monitorizan las observaciones de 61 dimensiones.
- Experimentos de robustez ante ruido: al haber sido seleccionada bajo ruido de accion minimo, sirve como linea base para comparar la degradacion de la marcha al inyectar perturbaciones controladas en las 14 acciones.
- Reproduccion de pipelines de RL: el commit `97e2b1fe2` de la rama `denrakeiw-070` en `pollen-robotics/microduck_rl` permite reconstruir el entrenamiento y comparar el pulido por estrategias de evolucion con el checkpoint de partida.
- Evaluacion de estrategias de refinamiento en CPU: el caso documenta un flujo en el que los pesos de una politica entrenada en simulacion se pulen sin GPU mediante evolution strategies, util para equipos con recursos limitados.
- Demostraciones de robotica educativa: el Microduck es un bipedo de 25 cm y 399 USD orientado a ensenanza; esta politica permite mostrar una marcha entrenada en simulacion ejecutandose en hardware real.
- Pruebas de integracion del manifiesto de politicas: el `manifest.json` sigue el esquema 2 del manifiesto de microduck, por lo que el modelo sirve para validar el cargador de politicas del demonio de control en desarrollos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de recompensa, tasas de exito, distancias recorridas ni comparaciones cuantitativas con otras politicas del mismo slot.

## Requisitos de hardware

- La inferencia se ejecuta en el propio robot o en el host que corre el demonio de control; el formato ONNX y el tamano de repositorio de 0.0 GB sugieren un modelo muy ligero, pero no se dispone de cifra de parametros ni de VRAM estimada.
- No se especifican GPU recomendadas (A100, H100, RTX 4090 u otras); el pulido descrito se realizo en CPU.
- No se confirma si cabe en GPU de consumo, aunque por el contexto (politica de 61 entradas y 14 salidas a 50 Hz) es previsible que la inferencia sea viable en CPU.
- Opciones de despliegue: runtime ONNX integrado en el demonio de control del Microduck mediante `robotctl`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; el unico dato temporal es la frecuencia de control de 50 Hz (periodo de 20 ms).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `DenRakEiw/microduck-songkran-duck_7214` | Politica RL para Microduck (slot `walk`) | no disponible | no aplica | no disponible | no disponible | Hugging Face, 0 descargas |
| `DenRakEiw/microduck-senate_duck_1072` | Politica RL para Microduck | no disponible | no aplica | no disponible | no disponible | Hugging Face |
| `songkran-duck_7199` (checkpoint de partida) | Politica RL para Microduck | no disponible | no aplica | no disponible | no disponible | Referenciado en la model card |

No se dispone de datos cuantitativos para establecer una comparacion de rendimiento entre estas politicas.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se puede asumir permiso para uso comercial, redistribucion ni modificacion.
- Model card muy escueta: sin numero de parametros, sin arquitectura detallada, sin metricas de evaluacion y sin descripcion del dataset de entrenamiento.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso o validacion por terceros.
- Especifica al hardware y al firmware del Microduck (61 observaciones, 14 acciones, slot `walk`); no es reutilizable fuera de ese ecosistema sin reentrenamiento.
- El comportamiento descrito (congelarse ante el "gigante", frenar en el turno) esta ligado a un entorno de simulacion concreto cuya definicion no se detalla; puede no transferir a escenarios reales distintos.
- Riesgo de sobreajuste al wrapper de ritmo fijo y a las condiciones de ruido usadas en la seleccion por estrategias de evolucion.
- No aplican sesgos linguisticos ni riesgo de alucinacion en el sentido de los modelos de lenguaje, pero si existe riesgo de fallo silencioso del controlador ante observaciones fuera de distribucion.
- Para produccion: falta versionado semantico, pruebas de regresion documentadas y soporte del autor; conviene fijar el commit `97e2b1fe2` y validar la politica en el hardware objetivo antes de desplegarla.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DenRakEiw/microduck-songkran-duck_7214
- Politica relacionada del mismo autor: https://huggingface.co/DenRakEiw/microduck-senate_duck_1072
- Pagina oficial del robot Microduck: https://pollen-robotics.com/microduck/
- Repositorio del robot Microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `denrakeiw-070`, commit `97e2b1fe2`)
- Documentacion del manifiesto de politicas: `docs/policy-manifest.md` en el repositorio del demonio de control (no se proporciona URL directa)
