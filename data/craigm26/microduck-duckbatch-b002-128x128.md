# craigm26/microduck-duckbatch-b002-128x128

## Resumen

microduck-duckbatch-b002-128x128 es una politica de locomocion (walking policy) para el robot bipedo Microduck de Pollen Robotics, desarrollada por el usuario craigm26. No es un modelo de lenguaje: es una red neuronal pequena que mapea un vector de observaciones de 61 dimensiones a 14 acciones de control motor, pensada para ejecutarse en el bucle de control del robot. Concretamente, cuenta con 26.254 parametros y una topologia de perceptron multicapa (61-128-128-14), y se ha obtenido por destilacion de la politica caminante por defecto de Pollen (`velstand.onnx`, 197.774 parametros).

El problema que resuelve es la reduccion del coste computacional del controlador sin degradar de forma apreciable el comportamiento: la politica estudiante consume 51.968 FLOPs por paso frente a los 393.728 del profesor, y presenta una latencia p50 de 10,8 microsegundos en un solo hilo sobre un portatil x86, frente a 29,0 microsegundos del profesor. Esto la hace candidata a ejecutarse en hardware embebido de bajos recursos o en el propio robot.

Es relevante ahora porque forma parte del proyecto duckbatch, un flujo de trabajo de aprendizaje por refuerzo «batched, judged, efficiency-first» que entrena multiples intentos pequenos en una unica GPU de 4 GB y los poda segun un orden de descarte preregistrado. La politica se distribuye en formato ONNX con licencia Apache 2.0 y se ha evaluado exclusivamente en simulacion (mjlab); el propio autor advierte de que nunca se ha ejecutado en un robot real y que igualar al profesor en simulacion es un candidato a prueba en hardware, no un resultado sobre hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptron multicapa (MLP) con topologia 61-128-128-14 |
| Parametros totales | 26.254 |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje; entrada fija obs[1,61]) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Interfaz | obs[1,61] -> actions[1,14], normalizador integrado |
| FLOPs por paso | 51.968 |
| Latencia p50 (1 hilo, portatil x86) | 10,8 us |
| Espacio de observacion | 61 dimensiones |
| Espacio de accion | 14 dimensiones |
| Tarea | Locomocion bipeda (andar y levantarse desde posicion prona) |

## Arquitectura y entrenamiento

La arquitectura es una red feedforward de tres capas densas con topologia 61-128-128-14, lo que da lugar a 26.254 parametros. La entrada es un vector de observaciones de 61 valores y la salida son 14 acciones de control. Lleva el normalizador de observaciones integrado, de modo que comparte el mismo contrato que el resto de politicas de Pollen. Se distribuye como grafo ONNX, lo que permite inferencia sin dependencias de frameworks de aprendizaje profundo.

El entrenamiento se realizo mediante destilacion a partir del caminante por defecto de Pollen (`velstand.onnx`, 197.774 parametros) dentro del proyecto duckbatch, en la configuracion de lote `b002-student-size-longer`, intento `a02`. duckbatch se describe como un flujo de RL por lotes, con evaluacion mediante modelos de decision (Jev, GLiNER2.5-Decide) empleados como jueces, orientado a la eficiencia y ejecutado en una unica GPU de 4 GB con poda por un orden de descarte preregistrado. No se dispone de informacion sobre el numero de tokens, la composicion del dataset ni el uso de RLHF/DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Control de locomocion bipeda: genera las 14 acciones necesarias para que Microduck camine de forma estable en simulacion.
- Recuperacion desde posicion prona: se levanta en pie dentro de 6 segundos en el 97,1% ± 0,5% de los episodios evaluados.
- Seguimiento de comandos de velocidad: mantiene un error de velocidad planar de 0,182 m/s y un error de tasa de guinada de 0,407 rad/s respecto a la referencia.
- Robustez ante perturbaciones de simulacion: evaluada con aleatorizacion de dominio, empujones por tropiezo y ruido de observacion activados.
- Inferencia ligera: 51.968 FLOPs por paso y 10,8 us de latencia p50 en un solo hilo x86.
- Integracion con el simulador de Pollen: se puede cargar directamente en el navegador a traves del simulador alojado en Hugging Face.
- No dispone de tool calling, function calling, capacidades de agente, soporte multilingue, vision, audio ni modo de razonamiento; es un controlador de bajo nivel.

## Casos de uso

- Controlador de caminata en simulacion: cargar la politica en mjlab (`Mjlab-VelStand-Flat-MicroDuck`) para reproducir el comportamiento de andar con un coste de computo muy inferior al del profesor, util para iterar rapido en experimentos de RL.
- Candidata a prueba sim-to-real: por su tamano (26.254 parametros) y latencia (10,8 us), es apropiada como primera candidata a desplegar en el hardware de Microduck, siempre bajo la advertencia del autor de que aun no se ha validado en robot real.
- Investigacion en destilacion de politicas: sirve como caso de estudio de destilacion de un profesor de 197.774 parametros a un estudiante de 26.254 parametros conservando el rendimiento en la tarea.
- Benchmarking de eficiencia en control: comparar FLOPs, latencia y parametros frente al profesor para estudiar el compromiso entre coste y calidad de politica.
- Docencia y divulgacion en robotica: el simulador en navegador permite demostrar una politica de RL entrenada por destilacion sin necesidad de hardware ni instalacion local.
- Evaluacion comparativa de jueces automaticos: el proyecto duckbatch emplea modelos de decision como jueces, por lo que esta politica forma parte de un conjunto de intentos util para estudiar la seleccion automatica de politicas.
- Ejecucion en hardware de muy bajos recursos: al ser un MLP ONNX de 26.254 parametros, puede integrarse en el bucle de control de un robot con CPU modesta usando un runtime ONNX.

## Benchmarks y rendimiento

Medido en `mjlab` (`Mjlab-VelStand-Flat-MicroDuck`) con aleatorizacion de dominio, empujones por tropiezo y ruido de observacion activados; los spawns pronos deliberados y los empujones de derribo estan desactivados para las cifras de caminata y activados (episodio prona en todos los casos) para las cifras de levantarse. 30 s por semilla sobre semillas reservadas 2001, 2002 y 2003; media ± dispersion entre semillas. El profesor se ejecuto en la misma evaluacion.

| Metrica | Esta politica | Profesor (velstand.onnx) |
|---|---|---|
| Caidas por minuto | 0,46 ± 0,06 | 0,14 ± 0,02 |
| Tiempo caido | 1,12% ± 0,34% | 0,43% ± 0,10% |
| Error de velocidad planar (m/s) | 0,182 ± 0,001 | 0,174 ± 0,004 |
| Error de tasa de guinada (rad/s) | 0,407 ± 0,004 | 0,368 ± 0,003 |
| Se levanta desde prona en menos de 6 s | 97,1% ± 0,5% | 96,9% ± 1,5% |
| Tiempo en levantarse (s) | 0,56 ± 0,02 | 0,56 ± 0,01 |
| Parametros | 26.254 | 197.774 |
| FLOPs por paso | 51.968 | 393.728 |
| Latencia p50, 1 hilo (portatil x86) | 10,8 us | 29,0 us |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- Inferencia en CPU: el modelo es un MLP ONNX de 26.254 parametros; se ejecuta en un unico hilo x86 con una latencia p50 de 10,8 us.
- VRAM: no se especifica VRAM oficial; por tamano (26.254 parametros en ONNX) la huella de memoria es de kilobytes, muy por debajo de cualquier GPU consumer.
- GPU recomendada: no disponible. El entrenamiento del proyecto duckbatch se realizo en una unica GPU de 4 GB, que es suficiente para el flujo de RL por lotes.
- Cabria en cualquier GPU consumer, e incluso en CPU y en hardware embebido de bajos recursos.
- Opciones de despliegue: runtime ONNX (por ejemplo, ONNX Runtime), el simulador de Pollen en navegador, y la herramienta del robot `robotctl policy load walk craigm26/microduck-duckbatch-b002-128x128` (manifest schema 2, ranura walk).
- Latencia estimada: 10,8 us p50 por paso a un hilo en x86; el rendimiento y throughput agregados no se han publicado.

## Comparativa con modelos similares

| Modelo | Parametros | FLOPs por paso | Latencia p50 (1 hilo x86) | Caidas/min | Se levanta desde prona | Licencia |
|---|---|---|---|---|---|---|
| microduck-duckbatch-b002-128x128 | 26.254 | 51.968 | 10,8 us | 0,46 | 97,1% | Apache 2.0 |
| velstand.onnx (profesor de Pollen) | 197.774 | 393.728 | 29,0 us | 0,14 | 96,9% | no disponible |

No se dispone de datos publicados de otros estudiantes del mismo flujo duckbatch ni de politicas comparables de terceros para Microduck en la informacion proporcionada.

## Limitaciones y advertencias

- Solo simulacion: el autor indica explicitamente que la politica nunca se ha ejecutado en un robot real; igualar al profesor en mjlab la convierte en candidata a prueba en hardware, no en un resultado sobre hardware.
- Mayor tasa de caidas que el profesor: 0,46 ± 0,06 caidas/min frente a 0,14 ± 0,02, y 1,12% ± 0,34% de tiempo caido frente a 0,43% ± 0,10%.
- Peor seguimiento de guinada: error de tasa de guinada de 0,407 rad/s frente a 0,368 rad/s del profesor.
- Rendimiento validado unicamente sobre las semillas reservadas 2001, 2002 y 2003; la generalizacion a otras condiciones no esta documentada.
- Cero descargas y cero «likes» en Hugging Face; sin adopcion ni validacion independiente conocida.
- No es un modelo de lenguaje: no soporta idiomas, tool calling, agentes ni razonamiento; no debe evaluarse con benchmarks de lenguaje.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece ninguna garantia de aptitud para produccion en robot fisico.
- El aviso de la propia model card recalca que las cifras corresponden a una tarea con spawns pronos y empujones de derribo desactivados para las medidas de caminata, por lo que no deben extrapolarse a escenarios de derribo no controlado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/craigm26/microduck-duckbatch-b002-128x128
- Simulador en navegador (Pollen): https://pollen-robotics-microduck-simulator.hf.space/?move=craigm26/microduck-duckbatch-b002-128x128
- Repositorio duckbatch: https://github.com/craigm26/duckbatch
- Registro completo del lote: https://github.com/craigm26/duckbatch (ruta `records/b002-student-size-longer/`)
- README de duckbatch: https://github.com/craigm26/duckbatch/blob/main/README.md
- Space de duckbatch: https://huggingface.co/spaces/craigm26/duckbatch
- Entornos de RL de Microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck_rl
- Pagina de Microduck en Pollen Robotics: https://pollen-robotics.com/microduck/
- Articulo en ExtremeTech sobre Microduck: https://www.extremetech.com/electronics/hugging-face-launches-a-399-robot-in-the-shape-of-a-duck
