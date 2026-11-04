# SccHy/microduck-roller-a1rb4ck-r2

## Resumen

`microduck-roller-a1rb4ck-r2` es una política de control robótico entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. El modelo no es un modelo de lenguaje: es un controlador neuronal que recibe observaciones de 61 dimensiones (estado de sensores y articulaciones) y emite 14 acciones de control a 50 Hz, destinado a generar una marcha continua sobre ruedas (rollers) que se ejecuta de forma indefinida hasta que se le indique lo contrario.

El autor del repositorio es el usuario SccHy, que publica esta política como una "gait" cargable en una ranura de política del demonio de control del robot. El modelo se distribuye en formato ONNX con el normalizador de observaciones embebido en el propio grafo, de modo que el consumidor puede alimentar observaciones en bruto sin preprocesado adicional. La librería asociada es `microduck` y el pipeline declarado es `robotics`.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de investigación reproducible (la model card referencia el repositorio de entrenamiento `pollen-robotics/microduck_rl`, rama `challenge-recipe-publishing`, commit `1efd853be`) orientado a experimentación con políticas RL en robótica de bajo coste. No hay información pública sobre arquitectura interna, número de parámetros ni datos de entrenamiento más allá de las referencias al repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política neuronal RL; se desconoce la topología interna) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (control reactivo a 50 Hz, sin ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |

Especificaciones adicionales del entorno de control:

| Parametro | Valor |
|---|---|
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Tipo de política | perpetua (se ejecuta hasta recibir orden de parada) |
| Normalizador de observaciones | embebido en `policy.onnx` |
| Tarea | locomocion sobre rollers |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna de la política (número de capas, tipo de red, función de activación ni tamaño). Lo único verificable es que se distribuye como grafo ONNX autocontenido que incluye el normalizador de observaciones, lo que sugiere un pipeline de inferencia simple: observación bruta de 61 dimensiones entra al grafo y salen 14 acciones de control a 50 Hz.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, en la rama `challenge-recipe-publishing`, commit `1efd853be`. No se especifican en la model card el número de pasos de entrenamiento, la composición del dataset (en RL se trataría de rollouts de simulación), el algoritmo concreto (PPO, SAC u otro) ni si hubo currículo de entrenamiento o domain randomization. Tampoco se documentan innovaciones técnicas destacables más allá de la naturaleza perpetua de la política y la integración del normalizador en el grafo.

## Capacidades

- Control de locomoción continua sobre rollers para el robot microduck, con ejecución indefinida hasta recibir una orden de parada.
- Consumo de observaciones de 61 dimensiones y emisión de 14 acciones de control a 50 Hz.
- Normalización de observaciones integrada en el modelo: acepta observaciones en bruto sin preprocesado externo.
- Carga como "gait" en una ranura de política del demonio de control mediante `robotctl policy load <slot> SccHy/microduck-roller-a1rb4ck-r2`.
- Compatibilidad con el manifiesto de políticas microduck en su schema 2.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües, visión, audio ni modo de pensamiento. Es exclusivamente un controlador motor.

## Casos de uso

- Locomoción base del microduck sobre rollers: la política genera una marcha perpetua que mantiene al robot desplazándose de forma continua, adecuada para pruebas de estabilidad y consumo energético en superficies con ruedas.
- Evaluación de recetas de RL: al estar vinculada a una rama y commit concretos de `microduck_rl`, sirve como artefacto de referencia para comparar variantes de entrenamiento dentro del mismo repositorio.
- Demostraciones educativas de robótica de bajo coste: la simplicidad de despliegue (un comando `robotctl policy load`) permite usar el modelo en talleres y cursos sin infraestructura de inferencia compleja.
- Integración en pipelines de control del demonio microduck: el modelo se carga en una ranura de política y convive con otras políticas, lo que facilita pruebas A/B de marchas en el mismo robot.
- Pruebas de robustez en banco: la política perpetua permite dejar el robot en funcionamiento durante periodos prolongados para medir deriva, calentamiento de actuadores y degradación de la marcha.
- Base para fine-tuning o destilación: al ser un artefacto ONNX de pequeño tamaño (repo de 0.0 GB según HuggingFace), puede servir como punto de partida para experimentos de adaptación a otras superficies o configuraciones del robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB, lo que sugiere un modelo muy pequeño que probablemente cabe en cualquier GPU consumer e incluso podría ejecutarse en CPU.
- GPU recomendadas: no disponibles. Dado el tamaño aparente del artefacto y la frecuencia de control (50 Hz), cualquier GPU moderna o incluso CPU debería ser suficiente, pero no hay datos publicados que lo confirmen.
- Cabe en GPU consumer: probablemente sí, dado el tamaño del repositorio, aunque no se especifica.
- Opciones de despliegue: el despliegue previsto es mediante el demonio microduck con el comando `robotctl policy load <slot> SccHy/microduck-roller-a1rb4ck-r2`. El formato ONNX permite en teoría usar ONNX Runtime, pero no se documentan otras vías de despliegue.
- Latencia y throughput estimados: no disponibles. El control opera a 50 Hz, pero no se publican mediciones de latencia de inferencia.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otras políticas RL públicas para el microduck con las que comparar parámetros, contexto, rendimiento o licencia. La comparativa con políticas de otros robots cuadrúpedos de bajo coste (por ejemplo, controladores para Unitree Go1 o similares) no es posible sin datos de arquitectura ni benchmarks de este modelo.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos, pero al ser una política entrenada en simulación es esperable una brecha sim-a-real (sim-to-real gap) no cuantificada.
- Riesgo de fallo fuera de distribución: la política está entrenada para locomoción sobre rollers y podría comportarse de forma impredecible en otras superficies o configuraciones del robot.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier despliegue productivo.
- Idiomas no aplicables, pero tampoco se documenta la compatibilidad con distintas versiones de hardware del microduck.
- La model card no documenta el algoritmo de entrenamiento, el número de pasos ni la composición del dataset, lo que dificulta la reproducibilidad completa.
- El artefacto está vinculado a un commit concreto (`1efd853be`) de una rama de publicación de recetas; cambios posteriores en el demonio o en el manifiesto (schema 2) podrían romper la compatibilidad.
- No hay métricas publicadas de robustez, consumo energético ni tasa de éxito de la marcha, por lo que no se puede evaluar su calidad objetiva frente a otras políticas.
- Al ser una política perpetua, requiere un mecanismo externo de parada; un fallo en el demonio de control podría dejar el robot en movimiento continuo.

## Enlaces

- HuggingFace: https://huggingface.co/SccHy/microduck-roller-a1rb4ck-r2
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `challenge-recipe-publishing`, commit `1efd853be`); no se proporciona URL directa en la información disponible.
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del demonio (no se proporciona URL directa).
