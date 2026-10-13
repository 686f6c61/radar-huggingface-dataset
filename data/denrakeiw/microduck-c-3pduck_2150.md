# DenRakEiw/microduck-c-3pduck_2150

## Resumen

`DenRakEiw/microduck-c-3pduck_2150` no es un modelo de lenguaje, sino una politica de control por aprendizaje por refuerzo (RL) destinada al robot microduck, un cuadrupedo de codigo abierto mantenido por Pollen Robotics. El artefacto resuelve una tarea de locomotion concreta (identificada como `Mjlab-HillClimb1m5-MicroDuck`) y se distribuye como un fichero ONNX mas un manifiesto, no como pesos de un transformer.

El modelo consume una observacion de 61 dimensiones y emite 14 acciones a 50 Hz, y se describe como una politica "perpetua": una vez cargada en una ranura de politica del daemon del robot, ejecuta una marcha de forma continua hasta que se le indique lo contrario. Esto lo situa en la categoria de controladores reactivos de bajo nivel, no en la de agentes conversacionales o de razonamiento.

Es relevante ahora porque forma parte del ecosistema emergente de politicas RL entrenadas en simulacion (aqui sobre `mjlab-microduck 0.1.0`) y desplegadas en hardware real mediante un formato portable (ONNX) y una interfaz estandarizada (`robotctl policy load`). Su huella es minima (el repositorio ocupa 0,0 GB) y esta pensado para ejecutarse embebido en el propio robot, no en infraestructura de servidor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (red de politica RL; el algoritmo y la topologia no se detallan en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (control reactivo por paso; ventana de observacion de 61 dimensiones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de control motor, sin interfaz de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`, con normalizador de observaciones embebido) y `manifest.json` (schema 2 del manifiesto de politicas microduck) |

Otros datos operativos: dimension de observacion 61-D, dimension de accion 14, frecuencia de control 50 Hz, tarea `Mjlab-HillClimb1m5-MicroDuck`, checkpoint `2150`, semilla `1`, base `mjlab-microduck 0.1.0 @ 8d0dbc94c`, commit de entrenamiento `6aeaf2e96`, fecha de inicio `2026-10-13T16:29:31Z`.

## Arquitectura y entrenamiento

La model card no especifica la topologia de la red (por ejemplo, si es un perceptron multicapa, una politica de tipo actor-critico u otra). Se trata de una politica de RL para locomotion entrenada sobre `mjlab-microduck`, la base de simulacion asociada al robot microduck. El normalizador de observaciones esta integrado en `policy.onnx`, de modo que la politica acepta observaciones en crudo sin preprocesado externo.

La configuracion de entrenamiento citada emplea 4096 entornos simulados en paralelo, un maximo de 500 iteraciones y guardado cada 50 iteraciones, con registro en TensorBoard y reanudacion desde el checkpoint `model_1899.pt` de una ejecucion previa (`2026-10-13_14-06-56_c3po`, run `heartofgold`). Esa combinacion de entornos masivamente paralelos e iteraciones limitadas es caracteristica del entrenamiento RL en simulacion fisica, aunque la model card no confirma el algoritmo concreto. El autor advierte explicitamente que el entrenamiento no es reproducible bit a bit entre maquinas: repetir la misma orden con la misma semilla produce una politica comparable, no identica.

## Capacidades

- Generacion de marcha de locomotion continua ("perpetua") para el robot microduck: ejecuta un ciclo de control que permanece activo hasta recibir una orden de parada.
- Control motor de bajo nivel: mapea una observacion de 61 dimensiones a 14 acciones a 50 Hz.
- Afrontar la tarea de ascenso de colina definida en `Mjlab-HillClimb1m5-MicroDuck` (la model card no cuantifica el exito ni las condiciones de terreno).
- Carga e integracion como ranura de politica dentro del daemon del robot mediante `robotctl policy load <slot>`.
- Entrada normalizada internamente: acepta observaciones sin normalizar, ya que el normalizador esta embebido en el ONNX.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues. Es un controlador motor, no un modelo de lenguaje o multimodal.

## Casos de uso

- Control de locomotion en robot real: cargar la politica en una ranura del daemon y dejar que el microduck camine de forma autonoma mientras el resto del sistema de comportamiento la mantiene activa.
- Navegacion sobre terreno inclinado: usar la tarea de ascenso de colina como controlador base cuando el robot debe superar pendientes, ya que la politica fue entrenada especificamente para ese escenario.
- Banco de pruebas de RL en robotica: emplear la politica y su configuracion de entrenamiento (4096 entornos, 500 iteraciones) como referencia reproducible para comparar variantes de hiperparametros o de recompensa, asumiendo la no reproducibilidad bit a bit.
- Docencia e investigacion en simulacion a hardware: por su tamano minimo y formato ONNX, sirve para ilustrar el ciclo completo de entrenar en simulacion (mjlab), exportar y desplegar en un robot fisico.
- Componente de una pila de comportamiento por capas: integrarla como habilidad de marcha de bajo nivel mientras un planificador de nivel superior decide destino o momento de parada.
- Demostraciones y exhibiciones: la naturaleza perpetua permite mantener una marcha continua y controlada durante una demo publica hasta que el operador la detenga.
- Evaluacion de transferencia sim-a-real: comparar el comportamiento observado en robot real frente al de simulacion para medir brechas de transferencia, dado que el autor documenta el entorno exacto de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de retorno, tasa de exito en la tarea, velocidad de marcha, consumo energetico ni ninguna comparacion cuantitativa con otras politicas. El numero de descargas y de "likes" del repositorio es 0, por lo que no hay senales de uso comunitario medibles.

## Requisitos de hardware

- Al ser una politica ONNX de control motor con observacion de 61-D y 14 acciones, su inferencia es de muy baja complejidad; el tamano del repositorio (0,0 GB) indica un artefacto muy ligero.
- VRAM estimada: no disponible. No se publican tamanos de tensor ni precision del ONNX (float32 o float16).
- GPU recomendadas: no aplica para inferencia en robot; el caso de uso previsto es ejecucion embebida o en CPU mediante el motor ONNX (por ejemplo, ONNX Runtime). No se especifican requisitos de GPU.
- Cabe en GPU de consumo: no disponible, pero por la dimension del modelo (61 entradas, 14 salidas, fichero de menos de 1 GB) es plausible en cualquier hardware, incluidos controladores embebidos; no hay confirmacion oficial.
- Opciones de despliegue: el flujo documentado es el daemon del robot con `robotctl policy load`; el formato ONNX habilita el uso de ONNX Runtime u otros ejecutores compatibles.
- Latencia y throughput: no disponible. La unica referencia temporal es la frecuencia de control de 50 Hz de la politica.

## Comparativa con modelos similares

No disponible. La model card no ofrece datos cuantitativos ni referencias a politicas comparables. Como contexto cualitativo, el proyecto `pollen-robotics/microduck-challenges` alberga el marco de entrenamiento y otras politicas microduck con el mismo formato (ONNX mas manifiesto) y la misma interfaz `robotctl`, por lo que serian los candidatos naturales de comparacion, pero no se dispone de sus especificaciones ni metricas en la informacion proporcionada.

| Aspecto | microduck-c-3pduck_2150 | Politicas microduck alternativas | Politicas RL de locomotion de proposito general |
|---|---|---|---|
| Parametros | no disponible | no disponible | no disponible |
| Contexto / observacion | 61-D | no disponible | variable |
| Acciones | 14 a 50 Hz | no disponible | variable |
| Tarea | ascenso de colina | variable | locomotion generica |
| Licencia | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: no se especifica si permite uso comercial o modificacion. Antes de usarla en producto hay que contactar con el autor o con Pollen Robotics.
- Metadatos incompletos: sin idiomas, sin licencia y sin parametros publicados; dificil de auditar.
- Sin metricas de rendimiento: no hay datos de tasa de exito, robustez ni estabilidad que respalden su comportamiento en robot real.
- Riesgo de brecha sim-a-real: la politica se entreno sobre `mjlab-microduck 0.1.0` en simulacion; el comportamiento en hardware fisico puede degradarse por diferencias dinamicas, friccion o calibracion.
- Especificidad de tarea: la politica esta entrenada para `Mjlab-HillClimb1m5-MicroDuck`; fuera de ese contexto puede no generalizar a otras superficies o marchas.
- Naturaleza "perpetua": al ejecutarse hasta recibir orden de parada, requiere que el sistema de control tenga una logica de parada fiable para evitar movimientos indeseados.
- Entrenamiento no reproducible bit a bit: los pesos obtenidos al repetir el entrenamiento seran distintos, lo que complica la depuracion o la replicacion exacta.
- Sin senales de adopcion: 0 descargas y 0 "likes"; no hay validacion externa ni incidencias reportadas por terceros.
- No es un modelo de lenguaje: no admite instrucciones en lenguaje natural, tool calling ni razonamiento; cualquier expectativa conversacional es erronea.

## Enlaces

- HuggingFace: https://huggingface.co/DenRakEiw/microduck-c-3pduck_2150
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Commit de entrenamiento referenciado: `6aeaf2e96` (rama `denrakeiw` del repositorio anterior)
- Base de simulacion: `mjlab-microduck 0.1.0 @ 8d0dbc94c`
- Tarea: `Mjlab-HillClimb1m5-MicroDuck`
