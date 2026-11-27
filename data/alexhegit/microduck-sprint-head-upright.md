# alexhegit/microduck-sprint-head-upright

## Resumen

Microduck-sprint-head-upright es una política de control para el robot caminante Microduck, desarrollada por el usuario alexhegit y publicada en Hugging Face bajo licencia Apache 2.0. No es un modelo de lenguaje: es un controlador de locomocion entrenado con PPO (Proximal Policy Optimization) sobre el simulador MuJoCo, exportado en formato ONNX, que genera consignas de posicion articular a partir de observaciones del estado del robot. Su proposito es ejecutar un sprint de marcha alternante rapida con la cabeza mantenida erguida, a una velocidad de aproximadamente 1,3 m/s.

El modelo se presenta como participante en el evento `sprint-2m` de la Microduck Arena, un espacio de evaluacion de politicas de locomocion para el robot cuadrupedo de bajo coste de Pollen Robotics. La politica consume 61 observaciones y emite 14 objetivos de posicion articular a 50 Hz, lo que la situa en el regimen tipico de control reactivo de robots caminantes de pequeno tamano. El entrenamiento se realizo en una GPU AMD con el stack ROCm, empleando el entorno `microduck_rl_unilab`.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, con un repositorio de 0,0 GB (probablemente solo el grafico ONNX y metadatos). No dispone de model card extendida, benchmarks publicados ni documentacion de entrenamiento mas alla de la descripcion de una linea. Toda la informacion tecnica disponible procede del README y de las etiquetas del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de politica para control robotico (estructura interna no disponible); entrenada con PPO sobre MuJoCo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (politica reactiva; ventana de observacion de 61 valores) |
| Tipos de cuantizacion | no disponible (formato ONNX; cuantizacion no documentada) |
| Idiomas soportados | no aplica (modelo de control robotico, sin capacidades linguisticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La informacion disponible indica unicamente que se trata de una politica entrenada con PPO sobre el simulador MuJoCo, mediante el entorno `microduck_rl_unilab` del repositorio rocPAI-Forge. El entrenamiento se ejecuto en una GPU AMD con ROCm. El checkpoint citado en la model card es `sprint_head_upright/model_14500`, lo que sugiere al menos 14.500 iteraciones o actualizaciones de politica, aunque no se especifica la metrica exacta ni el criterio de parada.

La interfaz del controlador esta bien definida: 61 observaciones de entrada y 14 objetivos de posicion articular de salida, ejecutados a 50 Hz. No se detalla la topologia de la red (numero de capas, unidades ocultas, si emplea MLP, CNN o memoria recurrente), ni el volumen de datos de entrenamiento, ni si hubo tecnicas adicionales como reward shaping, domain randomization o curriculum learning. Tampoco se documenta el proceso de exportacion a ONNX ni las operaciones incluidas.

## Capacidades

- Locomocion cuadrupeda: genera una marcha alternante de sprint con la cabeza mantenida erguida a aproximadamente 1,3 m/s.
- Control reactivo a 50 Hz: produce 14 objetivos de posicion articular a partir de 61 observaciones del estado del robot.
- Ejecucion en el simulador y en el evento `sprint-2m` de la Microduck Arena.
- Exportacion a ONNX para inferencia portable.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio ni capacidades multilingues.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No se documenta soporte de agentes ni planificacion de alto nivel.

## Casos de uso

- Participacion en la Microduck Arena: la politica esta disenada especificamente para el evento `sprint-2m`, donde se evalua la velocidad y estabilidad de la marcha en un recorrido de 2 metros; su velocidad declarada de 1,3 m/s la hace competitiva en esa prueba.
- Investigacion en aprendizaje por refuerzo para robotica: sirve como referencia reproducible de un pipeline PPO con MuJoCo y ROCm, util para comparar hiperparametros y recompensas en tareas de locomocion.
- Control de locomocion en simulacion: puede integrarse en entornos MuJoCo para estudiar la estabilidad del sprint con cabeza erguida y analizar el consumo energetico o el desgaste articular simulado.
- Despliegue embebido mediante ONNX: al exportarse a ONNX, puede ejecutarse con runtimes ligeros (ONNX Runtime, TensorRT) en hardware de borde, lo que facilita prototipos de control en el robot fisico Microduck.
- Benchmarking de politicas de locomocion: permite comparar variantes de gait (trote, sprint, marcha estatica) dentro del mismo entorno y con la misma interfaz de 61 observaciones y 14 acciones.
- Docencia en robotica y RL: como ejemplo compacto de politica reactiva con espacio de observacion y accion bien definido, es adecuado para practicas de simulacion y evaluacion de controladores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato de rendimiento declarado es la velocidad de sprint de aproximadamente 1,3 m/s con la cabeza erguida, sin curvas de aprendizaje, tasas de exito ni comparaciones con otras politicas.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 0,0 GB y el modelo es presumiblemente de muy pocos parametros, por lo que la inferencia cabria en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no disponibles; el entrenamiento se realizo en una GPU AMD con ROCm, pero no se especifica el modelo concreto.
- GPU consumer: altamente probable que quepa en cualquier GPU consumer moderna (RTX 3060 o superior) e incluso en CPU, dado el tamano minimo del artefacto.
- Opciones de despliegue: ONNX Runtime, TensorRT, ejecucion directa en MuJoCo o en el stack de control del robot Microduck.
- Latencia y throughput: no disponibles; el control opera a 50 Hz, lo que impone un presupuesto de 20 ms por ciclo de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-sprint-head-upright (alexhegit) | Politica RL para locomocion | no disponible | no aplica (61 observaciones) | Apache 2.0 | Hugging Face, 0 descargas |
| Otras politicas de la Microduck Arena | Politicas RL para locomocion | no disponible | no aplica | variable | Hugging Face Spaces |
| Modelos de lenguaje de proposito general | LLM | miles de millones | miles de tokens | variable | amplia |

No se dispone de datos de rendimiento comparables entre politicas de la Microduck Arena en la informacion proporcionada; la comparacion con modelos de lenguaje no es pertinente por diferencia de categoria.

## Limitaciones y advertencias

- Artefacto de investigacion con cero descargas y cero likes: no hay evidencia de validacion por terceros ni de uso en produccion.
- Model card minima: no se documentan arquitectura interna, hiperparametros, datos de entrenamiento ni proceso de evaluacion.
- Especifico de un robot y un simulador: la politica esta ajustada a la morfologia del Microduck y a MuJoCo; no es transferible a otros robots sin reentrenamiento.
- Riesgo de sim-to-real gap: no se documenta validacion en el robot fisico, por lo que el rendimiento en hardware real es incierto.
- Sin datos de robustez: no se indica comportamiento ante perturbaciones, terrenos irregulares o fallos de sensores.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, pero el autor no ofrece garantias ni soporte.
- Sin capacidades linguisticas ni de razonamiento: no debe evaluarse con criterios de modelos de lenguaje.
- Fecha de creacion en 2026 y repositorio de 0,0 GB: conviene verificar la integridad y el contenido real del repositorio antes de descargarlo.

## Enlaces

- Hugging Face: https://huggingface.co/alexhegit/microduck-sprint-head-upright
- Microduck Arena: https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Repositorio de entrenamiento microduck_rl_unilab: https://github.com/rocPAI-Forge/microduck_rl_unilab
