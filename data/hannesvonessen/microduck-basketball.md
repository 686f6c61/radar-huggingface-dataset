# HannesVonEssen/microduck-basketball

## Resumen

Microduck-basketball es una politica de aprendizaje por refuerzo (reinforcement learning) desarrollada por HannesVonEssen para el robot Microduck, orientada a mantener el equilibrio sobre un balon de baloncesto de talla 7 que rueda libremente y a seguir comandos de velocidad. La particularidad del modelo es que el actor funciona a ciegas: no recibe ninguna observacion del estado del balon, solo propiocepcion (giroscopio, gravedad proyectada, posiciones y velocidades articulares, acciones previas y comandos de velocidad). Para compensar esa falta de informacion, emplea una capa LSTM de 256 unidades que le permite inferir la dinamica de contacto a partir del historial de propiocepcion.

La arquitectura del actor es una LSTM(256) seguida de un MLP con activacion ELU de dimensiones 512, 256 y 128, que produce 14 acciones. El actor tiene aproximadamente 624.000 parametros, una magnitud muy reducida que lo hace apto para ejecucion en el ordenador de a bordo del robot a 50 Hz. El checkpoint publicado corresponde a la variante b11, iteracion 6.999, y se distribuye como ONNX en float32 junto con el checkpoint completo de entrenamiento en PyTorch.

Se trata de una politica experimental pensada para pruebas de hardware: las comprobaciones de simulacion y exportacion han pasado, pero el tiempo de ejecucion a bordo y el comportamiento en el robot real no estan verificados segun el propio autor. Su relevancia radica en que demuestra que la memoria recurrente puede sustituir a la observacion directa del objeto manipulado, acercando el rendimiento de supervivencia a un modelo de referencia que si recibe el estado del balon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM de 1 capa (256 unidades) + MLP ELU (512, 256, 128); actor de aproximadamente 624.000 parametros; critico privilegiado presente solo en entrenamiento |
| Parametros totales | Aproximadamente 624.000 (actor) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; la memoria es el estado recurrente LSTM de 256 unidades) |
| Tipos de cuantizacion | No disponible (los pesos publicados son float32 en formato ONNX) |
| Idiomas soportados | No disponible (politica de control robotico, sin capacidades linguisticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX float32 (`policy.onnx`) y checkpoint PyTorch (`checkpoint.pt`) |
| Dimension de la observacion | 61 dimensiones normalizadas |
| Dimension de la accion | 14 acciones |
| Frecuencia de control | 50 Hz (presupuesto de 20 ms por ciclo) |
| Version de API | `model_api: 2` |
| Tamano del repositorio | 0,1 GB |
| Checkpoint publicado | b11, iteracion 6.999 |

## Arquitectura y entrenamiento

El actor recibe una observacion normalizada de 61 dimensiones estructurada en bloques: indices 0:3 giroscopio corporal, 3:6 gravedad proyectada, 6:20 posiciones articulares, 20:34 velocidades articulares, 34:48 las 14 acciones previas de la politica, 48:51 los comandos de velocidad frontal, lateral y de guinada, 51:55 relleno de ceros para comandos de cabeza y 55:61 relleno de ceros para comandos de cuerpo. No hay ninguna componente de estado del balon en las entradas del actor. Esa observacion alimenta una LSTM(256) cuyo estado se propaga paso a paso, seguida de un MLP con activacion ELU de dimensiones 512, 256 y 128 que emite las 14 acciones. La normalizacion de la observacion ya viene incorporada en `policy.onnx`.

Durante el entrenamiento se utilizo un critico privilegiado que si puede observar el balon, pero ese critico no forma parte del ONNX exportado. El repositorio incluye `checkpoint.pt` con actor, critico, normalizadores, estado del optimizador Adam y contador de iteracion/curriculum, ademas de los ficheros de configuracion grabados `params/agent.yaml` y `params/env.yaml`. El coeficiente de recompensa por tasa de accion fue de -0,2, lo que penaliza el cambio cuadratico de accion durante el aprendizaje; no se aplico ningun filtro paso bajo a las acciones en entrenamiento. La variante b11 se entreno con comandos de mas/menos 0,15 m/s frontales, mas/menos 0,10 m/s laterales y mas/menos 0,50 rad/s de guinada; los rangos mas amplios usados en evaluacion (mas/menos 0,30 m/s, mas/menos 0,20 m/s y mas/menos 1,0 rad/s) constituyen una prueba de estres. La comparacion PyTorch/ONNX de 40 pasos con reinicio arrojo un error absoluto maximo de accion de 1,43e-6, y una comparacion Rust/Python de 80 pasos con reinicio coincidio de forma exacta en la maquina de desarrollo.

## Capacidades

- Mantener el equilibrio sobre un balon de baloncesto de talla 7 que rueda libremente, partiendo de una posicion apoyada en el apice del balon.
- Seguir comandos de velocidad frontal, lateral y de guinada, con el comando [0, 0, 0] como equilibrio en el sitio.
- Operar exclusivamente con propiocepcion, sin camara ni rastreador de balon.
- Estimar la dinamica de contacto y del balon mediante memoria recurrente LSTM a partir del historial de propiocepcion.
- Emitir 14 acciones de articulacion a 50 Hz de forma continua, manteniendo el estado LSTM entre pasos.
- Sobrevivir 60 segundos en el 97,01 % de los episodios de evaluacion con comandos y perturbaciones.
- Servir como base para continuar entrenamiento gracias al checkpoint completo con optimizador y contador de curriculum.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso simbólico, vision, audio ni capacidades multilingues; no es un modelo de lenguaje.

## Casos de uso

- Pruebas de equilibrio sobre objeto rodante en laboratorio de robotica: la politica permite ensayar el control de un robot sobre una superficie no fija, un escenario poco comun en el que el balon introduce incertidumbre de contacto que la LSTM ayuda a compensar.
- Validacion de politicas recurrentes ciegas frente a politicas con estado del objeto: la comparacion directa con la referencia b2_6250 (MLP con estado del balon) permite cuantificar cuanto rendimiento se pierde al eliminar la observacion del balon.
- Verificacion del presupuesto de control a bordo: antes de desplegar en motores, se recomienda ejecutar el ejemplo `policy-rehearsal` del runtime para comprobar que el ciclo de 20 ms se cumple en el ordenador del robot.
- Investigacion en aprendizaje por refuerzo con observaciones privilegiadas: el critico que si ve el balon durante el entrenamiento es un caso de estudio de asimetria actor-critico en tareas de contacto.
- Continuacion de entrenamiento con curriculo: el checkpoint incluye estado del optimizador y contador de iteracion, lo que permite reanudar el entrenamiento para ampliar el rango de comandos mas alla de los valores de b11.
- Evaluacion de robustez ante perturbaciones: el protocolo de evaluacion aplica reseteos de velocidad horizontal dentro de mas/menos 0,09 m/s cada 0,5 a 1 segundo, util para medir la capacidad de recuperacion sin empujes angulares.
- Reproduccion en simulacion con mjlab: la politica y sus configuraciones permiten reproducir los episodios de 60 segundos y las 3.072 pruebas por politica en entornos simulados.
- Demostraciones y docencia en robotica de equilibrio: el video de 30 segundos con balon libre, comandos de velocidad y perturbaciones sirve como material ilustrativo de control reactivo con memoria.

## Benchmarks y rendimiento

Evaluacion emparejada: 1.024 entornos por semilla (101, 202, 303), 3.072 pruebas por politica, 60 segundos, la primera caida cuenta como fallo. Las perturbaciones resetean la velocidad horizontal de la base dentro de mas/menos 0,09 m/s cada 0,5 a 1 segundo, sin empujes angulares. Los comandos abarcan mas/menos 0,30 m/s frontales, mas/menos 0,20 m/s laterales y mas/menos 1,0 rad/s de guinada.

| Politica | Supervivencia 20 s | Supervivencia 60 s | MAE de seguimiento de guinada (rad/s) | RMS de cambio de accion |
|---|---:|---:|---:|---:|
| b11_6999 LSTM ciega | 98,86 % | 97,01 % | 1,2618 | 0,23384 |
| b2_6250 referencia MLP con estado del balon | 99,67 % | 99,12 % | 0,7574 | 0,13657 |

b11 sobrevive en 2.980 de 3.072 pruebas; la referencia sobrevive en 3.045 de 3.072. La supervivencia se acerca a la referencia, pero la precision de giro y la suavidad de las acciones siguen siendo peores. Las metricas de seguimiento y accion excluyen las muestras en la primera caida y posteriores, por lo que estan condicionadas a la supervivencia. Los resultados no establecen una calidad de movimiento equivalente ni transferencia al robot real. Los resultados por semilla y el justificante de exportacion estan en `eval/` y `validation.json`.

## Requisitos de hardware

- No se publican cifras de VRAM ni de consumo. El actor tiene aproximadamente 624.000 parametros en float32, lo que supone un peso en memoria del orden de unos pocos megabytes, aunque esta estimacion es un calculo a partir del numero de parametros y no un dato medido por el autor.
- Por su tamano, la inferencia es viable en CPU; no se especifica ninguna GPU recomendada en la informacion disponible.
- No se documenta si cabe en GPU de consumo; dado el tamano reducido del actor, no deberia ser unlimitante, pero no hay confirmacion oficial.
- El requisito critico no es de memoria sino de latencia: el ciclo de control es de 20 ms (50 Hz), y el autor no ha medido la latencia en la placa del robot.
- Opciones de despliegue: ONNX Runtime en Python o Rust, con el cargador del runtime de Microduck que incluya el soporte recurrente del PR #231 o un cargador equivalente. No aplican herramientas de servido de modelos de lenguaje como vLLM, llama.cpp o TGI.
- El estado LSTM (`h_in`, `c_in`, `h_out`, `c_out`) debe transportarse entre pasos y reiniciarse a cero en la activacion, los cambios de politica y los limites de recuperacion o reinicio, manteniendose durante cambios ordinarios de comando.
- Antes del despliegue en motores se recomienda ejecutar el ejemplo `policy-rehearsal` del PR del runtime para verificar el presupuesto de 20 ms.
- No se publican cifras de throughput ni de latencia por paso mas alla de la comparacion de exactitud numerica entre PyTorch, ONNX (Rust y Python).

## Comparativa con modelos similares

La unica referencia comparable publicada en la propia model card es la variante b2_6250, un MLP que si recibe el estado del balon. No se han encontrado en la busqueda web otros modelos comparables; los resultados de busqueda devueltos no guardan relacion con este modelo.

| Modelo | Arquitectura | Observacion del balon | Supervivencia 60 s | MAE de guinada (rad/s) | RMS de cambio de accion | Licencia |
|---|---|---|---:|---:|---:|---|
| microduck-basketball b11_6999 | LSTM(256) + MLP ELU | No | 97,01 % | 1,2618 | 0,23384 | Apache 2.0 |
| b2_6250 (referencia) | MLP con estado del balon | Si | 99,12 % | 0,7574 | 0,13657 | no disponible |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Politica experimental para pruebas de hardware: las comprobaciones de simulacion y exportacion han pasado, pero el tiempo de ejecucion a bordo y el comportamiento en el robot real no estan verificados.
- El actor no observa el estado del balon; toda la informacion sobre el contacto y la dinamica del objeto debe inferirse del historial de propiocepcion, lo que limita la precision de giro y la suavidad respecto a la referencia con estado del balon.
- La precision de seguimiento de guinada (MAE de 1,2618 rad/s) y la variabilidad de las acciones (RMS de 0,23384) son claramente peores que las de la referencia (0,7574 y 0,13657), que si ve el balon.
- La politica no se sube al balon ni se recupera del suelo: debe iniciarse con el robot apoyado en posicion vertical sobre el apice del balon, tal como en entrenamiento.
- El entrenamiento no uso filtro paso bajo de acciones; para un despliegue equivalente deben desactivarse los filtros de accion opcionales del runtime. Esto es independiente de la recompensa por tasa de accion.
- Los comandos usados en evaluacion superan el rango de entrenamiento de b11 (mas/menos 0,15 m/s frontales, mas/menos 0,10 m/s laterales, mas/menos 0,50 rad/s de guinada) y constituyen una prueba de estres, no el regimen nominal.
- Requiere `model_api: 2` y un cargador con soporte recurrente (PR #231 o equivalente); el cargador solo feedforward existente no es suficiente.
- Deben forzarse a cero los espacios de comando de cabeza y cuerpo. No se necesita camara ni rastreador de balon.
- No se ha medido la latencia en placa; el presupuesto de control de 20 ms esta pendiente de verificacion en el ordenador del robot.
- No se dispone de resultados de benchmarks mas alla de la evaluacion propia descrita; no hay datos de MMLU, HumanEval, GSM8K ni similares porque no es un modelo de lenguaje.
- No se documentan sesgos ni riesgos de alucinacion en el sentido de los modelos de lenguaje; el riesgo principal es el fallo de equilibrio y la caida del robot en pruebas reales.
- La licencia Apache 2.0 permite uso comercial, pero al tratarse de una politica experimental sin validacion en hardware, su uso en produccion conlleva riesgo operativo no cuantificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HannesVonEssen/microduck-basketball
- Codigo fuente de entrenamiento: https://github.com/Vottivott/microduck-playground
- Soporte de runtime LSTM (PR #231): https://github.com/pollen-robotics/microduck/pull/231
- Video de simulacion de 30 segundos: https://huggingface.co/HannesVonEssen/microduck-basketball/resolve/main/media/preview.mp4
- Imagen de previsualizacion social: https://huggingface.co/HannesVonEssen/microduck-basketball/resolve/main/media/social-preview.png
- Visor de arquitectura: https://hfviewer.com/HannesVonEssen/microduck-basketball
- Resultados de la busqueda web: sin resultados relevantes para este modelo.
