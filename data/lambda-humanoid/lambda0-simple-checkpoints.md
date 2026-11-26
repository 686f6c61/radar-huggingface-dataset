# lambda-humanoid/lambda0-simple-checkpoints

## Resumen

Lambda0 SIMPLE Checkpoints es una coleccion de seis checkpoints de inferencia especificos por tarea para el modelo Lambda0, un modelo de vision-lenguaje-accion (VLA) orientado a robotica humanoide. Lo desarrolla el proyecto LambdaHumanoid y se distribuye bajo licencia Apache 2.0. Cada checkpoint esta especializado en una tarea concreta de manipulacion dentro del simulador SIMPLE del framework OpenLambda, en lugar de ofrecer un unico modelo generalista.

El modelo resuelve el problema de generar acciones motoras a partir de observaciones visuales e instrucciones de tarea en entornos simulados de robotica humanoide. Los checkpoints cubren tareas como recoger y doblar objetos, entregar objetos entre manos, agarre en mesa, desplazamiento con recogida y pick-and-place movil. Cada tarea se sirve a traves de un backend SIMPLE especifico (`amo` o `decoupled_wbc`), lo que refleja una separacion entre la politica de accion y el controlador de cuerpo completo.

El repositorio ocupa 28,7 GB e incluye pesos en `safetensors` junto con configuraciones de modelo, procesador y tokenizador, un `manifest.json` de bundle de datos y estadisticas de normalizacion por tarea. Es relevante para investigadores en robotica que necesiten reproducir o evaluar tareas SIMPLE con un runtime de inferencia ya empaquetado, aunque no se publican detalles de arquitectura, parametros ni benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | vision-lenguaje-accion (VLA); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el ejemplo de servicio usa `bfloat16` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con configs de modelo, procesador y tokenizador por tarea) |

## Arquitectura y entrenamiento

La informacion disponible indica que se trata de un modelo VLA (vision-lenguaje-accion) para robotica humanoide, pero no se detallan la arquitectura interna (transformer, MoE, hibrida, etc.), el numero de parametros, la composicion del dataset de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO.

Lo que si se documenta es la organizacion por tareas y la integracion con backends SIMPLE. Cada checkpoint incluye estadisticas de normalizacion propias (`psi_simple_task_XX.json`) y se asocia a un backend concreto: `amo` para `bend_pick` y `tabletop_grasp`, y `decoupled_wbc` para `handover`, `xmove_bend_pick`, `xmove_pick` y `mobile_pick_place`. El runtime de servicio expone parametros de `embodiment-id` y `action-space-id` por defecto (7 y 3 respectivamente en el ejemplo), ademas de pasos de inferencia y semilla, lo que sugiere un proceso de generacion de acciones por difusion o iterativo de 10 pasos.

## Capacidades

- Generacion de acciones motoras para robotica humanoide en tareas de manipulacion simuladas.
- Percepcion visual y comprension de instrucciones de tarea (naturaleza VLA).
- Seis politicas especializadas: `bend_pick`, `handover`, `xmove_bend_pick`, `tabletop_grasp`, `xmove_pick` y `mobile_pick_place`.
- Integracion con backends de control SIMPLE (`amo` y `decoupled_wbc`).
- Inferencia configurable mediante pasos (`inference-steps`) y semilla (`inference-seed`).
- Soporte de normalizacion por tarea mediante estadisticas empaquetadas.
- Soporte de tool calling, agentes, razonamiento multi-paso, vision general o audio: no disponible.

## Casos de uso

- Evaluacion de tareas SIMPLE en simulacion: cargar cada checkpoint con su estadistica de normalizacion y el backend correspondiente para reproducir los resultados de las seis tareas publicadas.
- Investigacion en manipulacion humanoide: usar `bend_pick` o `tabletop_grasp` como linea base para comparar nuevas politicas de agarre y doblado en el simulador.
- Estudio de coordinacion bimanual: el checkpoint `handover` permite analizar transferencia de objetos entre manos con el backend `decoupled_wbc`.
- Navegacion y manipulacion combinadas: `xmove_pick`, `xmove_bend_pick` y `mobile_pick_place` sirven para experimentar con tareas que requieren desplazamiento previo a la accion.
- Integracion en pipelines de evaluacion automatizada: el runtime de servicio (`serve.py`) con host, puerto, dispositivo CUDA y dtype permite desplegar el modelo como servicio HTTP para baterias de pruebas.
- Reproducibilidad con contenedor de evaluacion: el imagen `lambda0-simple-eval-docker` emparejada facilita ejecutar las tareas en un entorno controlado.
- Desarrollo de controladores: servir un checkpoint concreto y sustituir el backend SIMPLE para probar variantes de control de cuerpo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio completo ocupa 28,7 GB, por lo que cada checkpoint individual sera una fraccion de ese tamano.
- GPU recomendadas: no disponible; el ejemplo de servicio usa `--device cuda --dtype bfloat16`, lo que requiere una GPU con soporte de bfloat16.
- Compatibilidad con GPU de consumo: no confirmada; depende del tamano real por checkpoint, que no se detalla.
- Opciones de despliegue: script `openlambda/scripts/serve.py` del repositorio OpenLambda, con backend SIMPLE (`amo` o `decoupled_wbc`); soporte de vLLM, llama.cpp, Ollama o TGI no disponible.
- Latencia y throughput: no disponibles; el ejemplo fija `inference-steps 10` e `inference-seed 0`, pero no se publican tiempos.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (VLA para robotica humanoide) ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Checkpoints de inferencia exclusivamente (`inference-only`): no estan pensados para reentrenamiento ni ajuste fino segun la model card.
- Especializacion estricta por tarea: cada checkpoint solo cubre su tarea SIMPLE asociada; no hay un modelo generalista unico.
- Dependencia del backend SIMPLE correcto: usar un checkpoint con el backend equivocado (`amo` frente a `decoupled_wbc`) puede invalidar los resultados.
- Dependencia de las estadisticas de normalizacion: servir el modelo sin el JSON de estadisticas correspondiente a la tarea rompe la coherencia de las acciones.
- Ambito limitado a simulacion: no se documenta validacion en robot fisico.
- Idiomas soportados no disponibles: no se puede confirmar el alcance linguistico de las instrucciones.
- Sesgos y riesgo de alucinacion: no documentados en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las dependencias del runtime OpenLambda y del simulador.
- Repositorio sin descargas ni likes en el momento de la consulta: ecosistema de validacion limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lambda-humanoid/lambda0-simple-checkpoints
- Repositorio OpenLambda: https://github.com/LambdaHumanoid/openlambda
- Imagen de evaluacion: https://huggingface.co/datasets/lambda-humanoid/lambda0-simple-eval-docker
