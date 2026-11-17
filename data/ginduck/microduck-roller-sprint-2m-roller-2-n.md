# GinDuck/microduck-roller-sprint-2m-roller-2-n

## Resumen

`microduck-roller-sprint-2m-roller-2-n` es una politica de control por aprendizaje por refuerzo (reinforcement learning) desarrollada por el usuario GinDuck para el robot cuadrupedo de bajo coste microduck de Pollen Robotics. No es un modelo de lenguaje: es una politica neuronal que mapea observaciones de 61 dimensiones a 14 acciones de control a 50 Hz, pensada para ejecutar una marcha de tipo *sprint* sobre ruedas (rollers). El checkpoint pertenece a la segunda tanda de entrenamiento del autor ("roller run") y abandona el patron de patinaje previo para priorizar velocidad pura.

El modelo se distribuye como un fichero ONNX (`policy.onnx`) con el normalizador de observaciones integrado, mas un `manifest.json` que sigue el esquema 2 de manifiestos de politicas del daemon de microduck. Se carga directamente en una ranura de politica del robot mediante `robotctl policy load`. En las pruebas del propio autor, la politica completa el recorrido en aproximadamente 1,5 a 1,6 segundos.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigacion reproducible (entrenado con mjlab sobre el repositorio `microduck-challenges`, rama `race-2`, commit `b44f7ffc9`, checkpoint 2750, semilla 1) y no de un modelo de proposito general. No hay informacion publica sobre licencia, idiomas ni benchmarks estandar, y el repositorio ocupa 0,0 GB segun Hugging Face, lo que sugiere que los pesos pueden no estar efectivamente alojados o son de tamano despreciable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica neuronal para control robótico (aprendizaje por refuerzo); topologia interna no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (politica reactiva; observacion de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2) |

## Arquitectura y entrenamiento

La politica se entrena con mjlab (entorno de RL basado en MuJoCo/MJX, segun la nomenclatura `mjlab-microduck 0.1.0 @ 1efd853be`) sobre la tarea `Mjlab-RollerSprint2m-MicroDuck`, en la rama `race-2` del repositorio `microduck-challenges` de Pollen Robotics. El entrenamiento usa 2048 entornos paralelos, un maximo de 6000 iteraciones del agente y semilla 1, con logging a TensorBoard bajo el nombre de ejecucion `roller-2`. El checkpoint publicado corresponde a la iteracion 2750. La receta de entrenamiento es compartida por el usuario TheSauceman, segun indica el autor.

La interfaz de la politica es fija: 61 dimensiones de observacion de entrada y 14 dimensiones de accion de salida, ejecutandose a 50 Hz sobre el robot con rollers montados. El normalizador de observaciones esta embebido dentro de `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo (sin normalizar). La politica es de tipo *perpetuo*: no tiene condicion de terminacion interna y se ejecuta hasta que el operador la detiene o la sustituye. El autor advierte que el entrenamiento no es bit-reproducible entre maquinas: repetir el comando con la misma semilla produce una politica comparable, no identica.

## Capacidades

- Locomocion sobre ruedas (*rollers*) para el robot microduck, con una marcha de sprint orientada a velocidad.
- Politica reactiva de bucle cerrado a 50 Hz: consume 61 observaciones y emite 14 acciones por paso.
- Ejecucion perpetua sin condicion de parada interna; el control de duracion recae en el operador o en el daemon.
- Carga directa en una ranura de politica del daemon de microduck mediante `robotctl`.
- Normalizacion de observaciones integrada en el grafo ONNX, lo que simplifica la integracion en el pipeline de control.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues: no es un modelo de lenguaje ni multimodal.

## Casos de uso

- Carreras de velocidad con microduck sobre pista con rollers: la politica esta entrenada especificamente para la tarea `RollerSprint2m` y el autor reporta tiempos de 1,5 a 1,6 segundos en el recorrido de referencia, por lo que es adecuada como baseline competitivo en la liga `race-2`.
- Benchmarking de recetas de RL: al estar publicados task_id, commit, semilla, numero de entornos e iteraciones, sirve para comparar variantes de hiperparametros o recompensas manteniendo el resto del pipeline fijo.
- Validacion de la cadena de despliegue `robotctl` + manifiesto esquema 2: util para probar la carga de politicas en ranuras, la integracion del normalizador embebido y el ciclo de vida de una politica perpetua en el daemon.
- Docencia y divulgacion en robotica de bajo coste: un cuadrupedo economico con una politica ONNX autocontenida permite demostrar el ciclo completo simulacion-entrenamiento-despliegue en hardware asequible.
- Pruebas de robustez en hardware: al ser una politica de sprint sobre ruedas, expone rapidamente problemas de calibracion, latencia del bus de control o deriva de sensores a 50 Hz.
- Punto de partida para *fine-tuning* o destilacion: el checkpoint y el comando de reproduccion permiten continuar el entrenamiento hacia tareas derivadas (giros, frenada, terrenos distintos) partiendo de una politica ya competente en velocidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar en la informacion disponible. El unico dato de rendimiento aportado por el autor es cualitativo-cuantitativo: la politica completa el recorrido en aproximadamente 1,5 a 1,6 segundos en sus propias pruebas, sin especificar la longitud exacta de la pista ni las condiciones de medida.

| Metrica | Valor | Fuente |
|---|---|---|
| Tiempo de recorrido (pruebas del autor) | ~1,5-1,6 s | Model card |
| Frecuencia de control | 50 Hz | Model card |
| Dimension de observacion | 61 | Model card |
| Dimension de accion | 14 | Model card |
| Checkpoint | 2750 | Model card |
| Entornos paralelos de entrenamiento | 2048 | Model card |

## Requisitos de hardware

- Inferencia en el propio robot microduck: la politica se ejecuta en el daemon de control a 50 Hz; el modelo se distribuye en ONNX, formato adecuado para inferencia en CPU embebida.
- VRAM estimada: no disponible. El tamano del repositorio figura como 0,0 GB y no se publican recuentos de parametros, por lo que no es posible estimar memoria de forma fiable.
- GPU recomendadas: no disponibles para inferencia; para reentrenamiento, el comando de reproduccion asume 2048 entornos paralelos, lo que en la practica requiere aceleracion GPU (modelo concreto no especificado en la informacion disponible).
- Compatibilidad con GPU de consumo: no confirmada. Dado el caracter de politica reactiva de baja dimensionalidad, es plausible que quepa en GPU de consumo, pero no hay datos publicados que lo verifiquen.
- Opciones de despliegue: `robotctl policy load <slot> GinDuck/microduck-roller-sprint-2m-roller-2-n` sobre el daemon de microduck; el artefacto es un `policy.onnx` consumible por cualquier runtime ONNX estandar.
- Latencia y throughput: no disponibles mas alla de la frecuencia de control de 50 Hz fijada por el entorno.

## Comparativa con modelos similares

No se dispone de datos publicados de otros checkpoints de la misma tanda (`roller-2`) ni de resultados de la liga `race-2` en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa con alternativas.

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| microduck-roller-sprint-2m-roller-2-n | Politica RL (ONNX) | no disponible | no aplica | ~1,5-1,6 s (pruebas del autor) | no disponible | Hugging Face (0 descargas) |
| Otros checkpoints de `roller-2` | Politica RL | no disponible | no aplica | no disponible | no disponible | no disponible en la informacion proporcionada |
| Politicas de referencia de `microduck-challenges` (rama `race-2`) | Politica RL | no disponible | no aplica | no disponible | no disponible | Repositorio publico de Pollen Robotics |

## Limitaciones y advertencias

- Ambito muy restringido: solo valida para el robot microduck con rollers y para la tarea de sprint de 2 m; no es transferible a otros morfologias ni a tareas generales.
- Sin licencia declarada: la ausencia de licencia impide asumir permisos de uso comercial, redistribucion o modificacion; hay que contactar con el autor antes de cualquier uso fuera de investigacion personal.
- Reproducibilidad limitada: el propio autor advierte que el entrenamiento no es bit-reproducible entre maquinas; la misma semilla produce pesos distintos.
- Rendimiento reportado solo por el autor: el dato de 1,5-1,6 s no esta acompanado de metodologia, numero de ensayos ni condiciones de pista, por lo que debe tratarse como indicativo.
- Politica perpetua sin parada interna: en produccion o en pruebas hay que implementar un mecanismo externo de corte (timeout, watchdog o comando explicito) para evitar ejecuciones indefinidas.
- Dependencia del normalizador embebido: alimentar observaciones ya normalizadas rompe la politica; el consumidor debe enviar observaciones en crudo.
- Sin informacion sobre sesgos, alucinacion o comportamiento fuera de distribucion: al no ser un modelo de lenguaje, estas categorias no aplican, pero tampoco se documentan analisis de robustez ante perturbaciones, cambios de superficie o desgaste de las ruedas.
- Cero adopcion registrada (0 descargas, 0 likes) y repositorio de 0,0 GB: conviene verificar que los artefactos (`policy.onnx`, `manifest.json`) estan realmente accesibles antes de integrarlo en cualquier pipeline.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-roller-sprint-2m-roller-2-n
- Repositorio del robot microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento microduck-challenges: https://github.com/pollen-robotics/microduck-challenges
- Documentacion del manifiesto de politicas (referenciada en la model card): `docs/policy-manifest.md` dentro del repositorio del daemon de microduck (URL directa no disponible)
- Paper, blog o demo adicionales: no disponible
