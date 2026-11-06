# SccHy/microduck-roller-a1rb4ck-r0

## Resumen

roller-a1rb4ck-r0 es una política de control motriz (policy) entrenada mediante aprendizaje por refuerzo para el robot microduck, un robot cuadrúpedo de bajo coste desarrollado por Pollen Robotics. El modelo no es un modelo de lenguaje ni un modelo generativo de propósito general: es una red neuronal que mapea observaciones del robot (61 dimensiones) a acciones de control (14 dimensiones) a una frecuencia de 50 Hz, pensada para ejecutar una marcha sobre ruedas (rollers) de forma perpetua hasta recibir una orden de parada.

El autor del repositorio es el usuario SccHy, y el modelo se distribuye en formato ONNX bajo la librería microduck, con el pipeline declarado como robotics. El repositorio tiene un tamaño de 0.0 GB según Hugging Face, lo que sugiere que los pesos son muy ligeros, coherente con una política de control de tiempo real para hardware embebido.

La relevancia de esta ficha es limitada fuera del ecosistema microduck: se trata de un artefacto de investigación en robótica con refuerzo, no de un modelo fundacional. Aun así, su estructura (observación de 61 dimensiones, 14 acciones, normalizador embebido en el ONNX) es un ejemplo representativo de cómo se empaquetan políticas de RL para despliegue directo en robot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para control robótico (detalles internos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | ONNX (policy.onnx) + manifest.json |
| Dimension de observacion | 61 |
| Dimension de acciones | 14 |
| Frecuencia de control | 50 Hz |
| Libreria / runtime | microduck |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red (número de capas, anchura, tipo de activaciones ni si emplea recurrencia). Lo que sí se conoce es su interfaz: recibe observaciones de 61 dimensiones y emite 14 acciones a 50 Hz. El normalizador de observaciones está embebido dentro del propio fichero `policy.onnx`, de modo que el robot puede alimentar observaciones crudas directamente sin un preprocesado externo.

El entrenamiento se realizó mediante aprendizaje por refuerzo, según los tags del repositorio y la model card. La receta de entrenamiento proviene del repositorio `pollen-robotics/microduck_rl`, rama `challenge-recipe-publishing`, commit `1efd853be`. No se especifican el número de pasos de entrenamiento, la función de recompensa, el algoritmo de RL (PPO, SAC, etc.) ni la composición del entorno de simulación. La política se describe como "perpetua": se ejecuta de forma continua hasta que se le indica lo contrario, lo que implica un diseño orientado a marchas cíclicas sin condición de terminación interna.

## Capacidades

- Control motriz de marcha sobre ruedas (rollers) para el robot microduck, con ejecución continua a 50 Hz.
- Mapeo directo de observaciones crudas a acciones gracias al normalizador embebido en el ONNX.
- Carga como slot de política mediante el comando `robotctl policy load <slot> SccHy/microduck-roller-a1rb4ck-r0`.
- Compatibilidad con el esquema 2 del manifiesto de políticas de microduck (`manifest.json`).
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, visión, audio ni capacidades multilingües, al no ser un modelo de lenguaje.
- No dispone de modo thinking ni de ninguna capacidad cognitiva declarada.

## Casos de uso

- Despliegue directo en robot microduck para locomoción sobre ruedas: la política se carga en un slot y el robot ejecuta la marcha de forma continua, adecuada para demostraciones de robótica educativa.
- Investigación en aprendizaje por refuerzo aplicado a robótica de bajo coste: sirve como política de referencia y como base para comparar recetas de entrenamiento del repositorio `microduck_rl`.
- Pruebas de integración del daemon `robotctl`: permite validar el flujo de carga de políticas, el esquema 2 del manifiesto y la inferencia ONNX en el robot.
- Benchmarking de latencia y throughput en hardware embebido: al ejecutarse a 50 Hz con un ONNX ligero, es útil para medir el rendimiento del runtime de inferencia del robot.
- Reproducción de experimentos: la model card referencia un commit concreto de la rama `challenge-recipe-publishing`, lo que facilita replicar el pipeline de entrenamiento.
- Docencia y talleres de robótica: el modelo y su comando de carga ofrecen un ejemplo mínimo y reproducible de política RL desplegada en hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recompensa, tasas de éxito, estabilidad de la marcha ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB, lo que indica pesos de muy pequeño tamaño.
- GPU recomendadas: no aplica; el destino es el hardware embebido del robot microduck, que ejecuta inferencia ONNX a 50 Hz.
- Compatibilidad con GPU de consumo: probable por el tamaño reducido de los pesos, aunque no se especifica.
- Opciones de despliegue: runtime microduck mediante `robotctl policy load`, con inferencia sobre `policy.onnx`.
- Latencia y throughput: no disponibles; el único dato es la frecuencia de control objetivo de 50 Hz (periodo de 20 ms por ciclo de control).

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otras políticas comparables del ecosistema microduck ni alternativas de la misma categoría con datos de parámetros, contexto o rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La información pública es mínima: no se detallan arquitectura, parámetros, licencia ni composición del entrenamiento.
- La licencia no está especificada, por lo que no puede confirmarse el uso comercial; debe consultarse con el autor antes de cualquier despliegue productivo.
- El modelo está especializado exclusivamente en la marcha sobre ruedas del microduck; no es transferible a otros robots ni a otras tareas sin reentrenamiento.
- La política es "perpetua" y no incorpora condiciones de parada internas; la seguridad depende del sistema de control externo del robot.
- No se han publicado evaluaciones de robustez, estabilidad ni comportamiento ante perturbaciones o terrenos distintos de los rollers.
- Al ser un artefacto de investigación con 0 descargas y 0 likes, carece de validación comunitaria.
- No aplican sesgos lingüísticos ni riesgo de alucinación en el sentido de modelos de lenguaje, pero sí existe riesgo de comportamiento no validado en condiciones fuera de distribución.

## Enlaces

- Hugging Face: https://huggingface.co/SccHy/microduck-roller-a1rb4ck-r0
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl`, rama `challenge-recipe-publishing`, commit `1efd853be` (referenciado en la model card; sin URL directa en la información disponible)
