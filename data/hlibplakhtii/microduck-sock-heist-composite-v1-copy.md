# HlibPlakhtii/microduck-sock-heist-composite-v1-copy

## Resumen

`microduck-sock-heist-composite-v1-copy` es una copia sin modificaciones del modelo `rumezhak/microduck-sock-heist-composite-v1`, publicada por el usuario HlibPlakhtii en Hugging Face. No se trata de un modelo de lenguaje, sino de una política de control robótico entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. El modelo se distribuye en formato ONNX y se integra en el daemon del robot a través de un manifiesto de política con esquema 2.

La política opera a 50 Hz, consume observaciones de 61 dimensiones y produce 14 acciones de control. Está diseñada como una política "perpetua", es decir, ejecuta una marcha continua hasta que se le indique lo contrario, y ocupa el slot `walk` del sistema de políticas del microduck. Según la model card, el normalizador de observaciones está embebido dentro del propio fichero `policy.onnx`, por lo que el robot debe alimentar observaciones en bruto.

La relevancia de esta ficha es limitada en el contexto de modelos de IA generativa: se trata de un artefacto de robótica de nicho, sin benchmarks publicados, sin licencia declarada y sin idiomas soportados. Su interés radica en el ecosistema microduck de Pollen Robotics y en el repositorio de entrenamiento `pollen-robotics/microduck_rl`, que permite reproducir el pipeline de RL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control entrenada con aprendizaje por refuerzo (detalles de red no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (distribución en ONNX) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2) |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Slot de politica | `walk` |
| Modelo base | `rumezhak/microduck-sock-heist-composite-v1` (revision `b29090eb3242a9c1201b650495d515bb622a394f`) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna de la red neuronal de la política. Se sabe que el entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, en la rama `main`, commit `5cee942d8`, mediante aprendizaje por refuerzo. El resultado es una política que mapea observaciones de 61 dimensiones a 14 acciones a 50 Hz, empaquetada en ONNX con el normalizador de observaciones integrado en el grafo.

No se especifican el número de tokens, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO, ya que no se trata de un modelo de lenguaje. La innovación técnica destacable es la inclusión del normalizador dentro del propio ONNX, lo que simplifica el despliegue en el robot: el operador solo necesita enviar observaciones en bruto. El manifiesto sigue el esquema 2 documentado en `docs/policy-manifest.md` del repositorio del daemon.

## Capacidades

- Control locomotor del robot microduck: ejecuta una marcha continua en el slot `walk`.
- Política perpetua: mantiene la marcha indefinidamente hasta recibir una orden de parada o cambio de política.
- Consumo de observaciones en bruto de 61 dimensiones gracias al normalizador embebido.
- Producción de 14 acciones de control a 50 Hz.
- Integración con el daemon del robot mediante `robotctl policy load`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión, audio ni generación de texto.

## Casos de uso

- Locomoción autónoma del microduck: cargar la política en el slot `walk` con `sudo robotctl policy load walk rumezhak/microduck-sock-heist-composite-v1` para que el robot camine de forma continua en entornos de laboratorio.
- Investigación en robótica de bajo coste: usar la política como baseline reproducible para comparar nuevos entrenamientos de RL sobre el mismo robot y la misma parametrización (61-D observación, 14 acciones, 50 Hz).
- Docencia y prototipado: desplegar una marcha funcional sin necesidad de reentrenar, gracias a que el normalizador va embebido en el ONNX y no requiere preprocesado adicional.
- Demostraciones de aprendizaje por refuerzo: mostrar el ciclo completo entrenamiento (repo `microduck_rl`) y despliegue (`robotctl`) en talleres o charlas técnicas.
- Pruebas de integración del daemon: validar el esquema 2 del manifiesto de políticas y el flujo de carga de políticas en el robot.
- Reproducibilidad de artefactos: al ser una copia byte a byte del original, sirve para verificar la integridad del modelo base y como espejo de referencia en pipelines de CI que comprueben hashes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El modelo se ejecuta en el propio robot microduck, no en un servidor de inferencia convencional; los requisitos de VRAM no aplican.
- No se dispone de información sobre GPU, CPU o acelerador embebido utilizado por el microduck.
- No se dispone de estimaciones de latencia o throughput más allá de la frecuencia de control declarada de 50 Hz.
- El despliegue se realiza a través del daemon del robot con `robotctl`, no mediante vLLM, llama.cpp, Ollama o TGI.
- El formato ONNX permite, en principio, ejecución con runtime ONNX en otros entornos, aunque no se documenta soporte fuera del robot.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otros modelos comparables de la misma categoría (políticas de control para microduck) más allá del modelo base `rumezhak/microduck-sock-heist-composite-v1`, del cual esta publicación es una copia idéntica.

## Limitaciones y advertencias

- Es una copia sin modificaciones del modelo base; no aporta mejoras ni cambios respecto a `rumezhak/microduck-sock-heist-composite-v1`.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido; conviene contactar con el autor original antes de cualquier uso en producción.
- No se documentan sesgos, pero al ser una política de RL entrenada en simulador o en condiciones limitadas, su generalización a entornos reales no está garantizada.
- El modelo está especializado en una única tarea (marcha en el slot `walk`) y no cubre otras habilidades del robot.
- No hay información sobre robustez ante perturbaciones, terrenos irregulares o fallos de sensores.
- El repositorio tiene 0 descargas y 0 likes, y un tamaño de 0.0 GB, lo que sugiere que los ficheros podrían no estar completamente subidos o que el artefacto es de tamaño despreciable; verificar la integridad antes de desplegar.
- Depende de la versión del daemon del microduck y del esquema 2 del manifiesto; cambios de esquema pueden romper la carga.
- No apto para tareas de lenguaje, visión, razonamiento o generación de contenido.

## Enlaces

- Hugging Face (copia): https://huggingface.co/HlibPlakhtii/microduck-sock-heist-composite-v1-copy
- Modelo base: https://huggingface.co/rumezhak/microduck-sock-heist-composite-v1
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `main`, commit `5cee942d8`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (no se proporciona URL directa)
