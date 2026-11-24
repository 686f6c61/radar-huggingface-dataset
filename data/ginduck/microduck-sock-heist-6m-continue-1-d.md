# GinDuck/microduck-sock-heist-6m-continue-1-d

## Resumen
microduck-sock-heist-6m-continue-1-d es una politica de refuerzo (reinforcement learning) entrenada para el robot cuadrupedo de bajo coste microduck de Pollen Robotics. No es un modelo de lenguaje: se trata de un checkpoint de control motor que observa 61 dimensiones del estado del robot y emite 14 acciones a 50 Hz, empaquetado como `policy.onnx` con el normalizador de observaciones integrado. El autor es el usuario GinDuck y el checkpoint corresponde a la iteracion 600 de un entrenamiento de 1500 iteraciones maximas sobre la tarea `Mjlab-SockHeist6m-MicroDuck`.

La politica es de tipo perpetuo: una vez cargada en una ranura de politica del demonio `robotctl`, se ejecuta de forma continua hasta que se detiene explicitamente. Segun la model card, la politica es capaz de esquivar guardias y coger un calcetin en unos 10 segundos en las pruebas del propio autor. El interes tecnico esta en que documenta un flujo completo de entrenamiento con mjlab (4096 entornos paralelos, semilla 1, base `mjlab-microduck 0.1.0`) y despliegue en hardware real mediante ONNX, un patron cada vez mas comun en robotica open source.

El repositorio tiene un tamano de 0.0 GB, cero descargas y cero likes, lo que sugiere un artefacto personal de investigacion mas que un modelo de proposito general. La licencia y los idiomas no estan declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de reinforcement learning para control motor (red neuronal exportada a ONNX; topologia interna no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada fija de 61-D de observacion |
| Tipos de cuantizacion | no disponible (se distribuye como `policy.onnx`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` con esquema 2 del manifiesto de politicas microduck |

## Arquitectura y entrenamiento
La politica se entreno con mjlab, el entorno de simulacion y entrenamiento de reinforcement learning del ecosistema MuJoCo, sobre la tarea `Mjlab-SockHeist6m-MicroDuck` del repositorio `pollen-robotics/microduck-challenges` (rama `sock-continue`, commit `395d47056`). El entrenamiento uso 4096 entornos paralelos, un maximo de 1500 iteraciones del agente, semilla 1 y logger de TensorBoard con nombre de ejecucion `continue-1`. La base fue `mjlab-microduck 0.1.0` en el commit `1efd853be`, y el entrenamiento comenzo el 2026-10-31. El checkpoint publicado corresponde a la iteracion 600.

El modelo de observacion es de 61 dimensiones y el de accion de 14, con una frecuencia de control de 50 Hz. La model card indica que el normalizador de observaciones esta integrado en el propio `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo. El autor advierte que el entrenamiento no es reproducible bit a bit entre maquinas: misma semilla y mismo codigo producen una politica comparable, no los mismos pesos. No se detalla la composicion del dataset de entrenamiento, la funcion de recompensa ni si se aplicaron tecnicas de domain randomization.

## Capacidades
- Control locomotor de un cuadrupedo microduck mediante politica perpetua cargada en una ranura del demonio `robotctl`.
- Tarea especifica de "sock heist": aproximarse a un calcetin, esquivar guardias y recogerlo sin ser detectado, en aproximadamente 10 segundos segun pruebas del autor.
- Entrada de 61 dimensiones de observacion en crudo (normalizacion integrada en el ONNX).
- Salida de 14 acciones a 50 Hz, adecuada para control en tiempo real.
- Despliegue via ONNX, compatible con el runtime del demonio microduck.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues.

## Casos de uso
- Demostracion de aprendizaje por refuerzo en robotica de bajo coste: usar la politica como ejemplo reproducible de un pipeline mjlab completo (entrenamiento con 4096 entornos, exportacion a ONNX y despliegue con `robotctl`) para cursos o talleres.
- Investigacion en sim-to-real: comparar el comportamiento de esta politica en simulacion y en el microduck fisico para estudiar la brecha de transferencia y el efecto del normalizador integrado.
- Baseline para tareas de manipulacion simple: servir como punto de partida para entrenar variantes de la tarea `SockHeist6m` cambiando recompensas o condiciones de escena.
- Pruebas de integracion del demonio `robotctl`: validar el esquema 2 del manifiesto de politicas y el flujo `policy load <slot> <repo>` en un entorno controlado.
- Benchmarking de politicas perpetuas: medir latencia de inferencia ONNX a 50 Hz en el hardware del robot y comparar con otras politicas cargadas en ranuras distintas.
- Educacion y divulgacion: ilustrar como una politica de RL se empaqueta como artefacto versionado en Hugging Face con metadatos de entrenamiento (commit, semilla, checkpoint) para trazabilidad.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada por el autor es cualitativa: la politica completa la tarea en aproximadamente 10 segundos en sus propias pruebas.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible; el tamano del repositorio es de 0.0 GB y la red es de control motor, por lo que se espera un consumo muy bajo, pero no hay cifras publicadas.
- GPU recomendadas: no disponible. Al ejecutarse en el propio robot microduck, la inferencia ONNX se realiza en la CPU del robot o en el hardware del demonio, no en GPU de servidor.
- Compatibilidad con GPU de consumo: no disponible; no es el caso de uso previsto.
- Opciones de despliegue: demonio `robotctl` del ecosistema microduck (`sudo robotctl policy load <slot> GinDuck/microduck-sock-heist-6m-continue-1-d`); runtime ONNX estandar para pruebas fuera del robot.
- Latencia y throughput: frecuencia de control de 50 Hz (periodo de 20 ms) segun la model card; no se publican cifras de latencia por inferencia.

## Comparativa con modelos similares
No disponible. La informacion proporcionada no incluye otras politicas microduck comparables ni datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias
- Tarea muy especifica (sock heist): la politica no es generalista y no se espera que funcione fuera del escenario entrenado.
- Reproducibilidad limitada: el autor advierte que el entrenamiento con RL en GPU no es reproducible bit a bit; misma semilla produce pesos distintos.
- Licencia no declarada: no hay garantia de uso comercial ni condiciones claras de redistribucion; conviene contactar con el autor antes de cualquier uso en produccion.
- Idiomas no aplicables: no es un modelo de lenguaje, por lo que las filas de idiomas y contexto no tienen sentido en este artefacto.
- Cero descargas y cero likes: no hay evidencia de validacion por terceros ni de robustez en entornos distintos a los del autor.
- Sin datos de sesgos, alucinacion o seguridad: al ser una politica de control, los riesgos son fisicos (caidas, colisiones) y no cognitivos; no se documentan protocolos de seguridad.
- Dependencia del demonio `robotctl` y del esquema 2 del manifiesto: cambios de version en el daemon pueden romper la carga de la politica.
- El enlace externo de la model card (QuackPack) es ajeno al modelo y no aporta informacion tecnica verificable.

## Enlaces
- Hugging Face: https://huggingface.co/GinDuck/microduck-sock-heist-6m-continue-1-d
- Repositorio microduck: https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Enlace externo citado en la model card (QuackPack): https://www.imundo.ch/quackpack/
