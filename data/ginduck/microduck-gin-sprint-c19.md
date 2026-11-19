# GinDuck/microduck-gin-sprint-c19

## Resumen

`microduck-gin-sprint-c19` es una política de control robótico orientada a la locomoción de tipo sprint sobre la plataforma microduck de Pollen Robotics. No se trata de un modelo de lenguaje, sino de una política de refuerzo (reinforcement learning) empaquetada en formato ONNX que se ejecuta en el bucle de control del robot a 50 Hz. El autor, GinDuck, la publica como una "lookup-table remix": la red subyacente proviene de su propio entrenamiento `sprint-2`, mientras que la tabla de consulta recombina políticas de terceros (HlibPlakhtii y nikghodki) para las semillas 1-4 y la semilla 5 respectivamente.

La política es de naturaleza perpetua: una vez cargada en una ranura de política del daemon `robotctl`, el robot ejecuta la marcha de forma continua hasta que se le indique lo contrario. El modelo consume observaciones de 61 dimensiones y emite 14 acciones, con el normalizador de observaciones embebido directamente en `policy.onnx`, de modo que la entrada debe ser la observación en bruto.

El repositorio tiene un tamaño de 0.0 GB (esencialmente un artefacto ONNX y un manifiesto), sin descargas ni likes en el momento de la consulta, y sin licencia ni idiomas declarados. Es relevante para quienes experimentan con control de bajo nivel en cuadrúpedos pequeños y quieren reutilizar o comparar marchas de sprint ya entrenadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de reinforcement learning exportada a ONNX (red subyacente del run `sprint-2` del autor) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; ventana de observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La política se ejecuta a 50 Hz sobre la plataforma microduck, con un espacio de observación de 61 dimensiones y un espacio de acción de 14 dimensiones. El artefacto distribuido es un grafo ONNX que incluye el normalizador de observaciones embebido, por lo que el consumidor debe alimentar observaciones en bruto sin preprocesar. El manifiesto `manifest.json` sigue el esquema 2 documentado en `docs/policy-manifest.md` del repositorio del daemon.

El entrenamiento se realizó en el repositorio `pollen-robotics/microduck_rl`, rama `talent-3`, commit `debcfcae0`. La model card describe la política como un "lookup-table remix": las semillas 1-4 reproducen la política `quicksilver-sprint-v5` de HlibPlakhtii y la semilla 5 reproduce `sprint-lookup-v1` de nikghodki, mientras que la red que sustenta la tabla es el propio run `sprint-2` de GinDuck. No se detallan en la información disponible el número de pasos de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF/DPO (no aplicables en este dominio) u otras innovaciones.

## Capacidades

- Generación de una marcha de sprint perpetua para el microduck, ejecutada de forma continua hasta que se descargue o sustituya la política.
- Control de locomoción a 50 Hz con observaciones de 61 dimensiones y 14 acciones.
- Normalización de observaciones integrada en el grafo ONNX, lo que simplifica la integración en el daemon.
- Carga directa en una ranura de política mediante `robotctl policy load <slot> GinDuck/microduck-gin-sprint-c19`.
- Reutilización de marchas de terceros mediante la tabla de consulta (semillas 1-4 y semilla 5).
- No dispone de capacidades de lenguaje, visión, audio, tool calling ni razonamiento multi-paso; su ámbito es exclusivamente el control motor.

## Casos de uso

- Locomoción de sprint en el microduck: cargar la política en una ranura y dejar que el robot avance de forma continua a 50 Hz, aprovechando que es una política perpetua sin condición de parada interna.
- Comparación de marchas: al reutilizar las políticas de HlibPlakhtii y nikghodki en las semillas 1-4 y 5, sirve como banco de pruebas para comparar el comportamiento de distintas marchas sobre la misma red base.
- Integración en el daemon `robotctl`: el manifiesto schema 2 y el normalizador embebido permiten desplegarla en el flujo estándar del daemon sin preprocesado adicional.
- Investigación en RL aplicado a robótica: útil como referencia de exportación ONNX de políticas de control y de empaquetado de manifiestos para reproducibilidad.
- Demostraciones de locomoción: al ser una marcha perpetua, encaja en demos donde el robot debe desplazarse de forma sostenida sin intervención.
- Punto de partida para fine-tuning o destilación: la red `sprint-2` y el esquema de manifiesto permiten reentrenar o adaptar la política en el repositorio `microduck_rl`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB y el artefacto es un ONNX de política de control, por lo que la huella es mínima.
- GPU recomendadas: no disponible; la inferencia a 50 Hz de una política de este tamaño es viable en CPU y en GPUs de gama baja, pero no se especifican modelos concretos.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del artefacto, aunque no se confirma en la información disponible.
- Opciones de despliegue: ONNX Runtime a través del daemon `robotctl` (carga en ranura de política); no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles; el bucle de control opera a 50 Hz según la model card.

## Comparativa con modelos similares

| Modelo | Tipo | Observaciones / acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-gin-sprint-c19 | Política RL en ONNX (lookup-table remix) | 61 / 14 | 50 Hz | no disponible | Hugging Face (0 descargas) |
| quicksilver-sprint-v5 (HlibPlakhtii) | Política RL de sprint | no disponible | no disponible | no disponible | Reutilizada en semillas 1-4 |
| sprint-lookup-v1 (nikghodki) | Política RL de sprint | no disponible | no disponible | no disponible | Reutilizada en semilla 5 |

No se dispone de datos de rendimiento comparativo entre estas políticas en la información proporcionada.

## Limitaciones y advertencias

- La licencia no está declarada, por lo que no se puede confirmar el uso comercial ni la redistribución.
- No se declaran idiomas soportados ni sesgos; al no ser un modelo de lenguaje, las categorías habituales de sesgo y alucinación no aplican, pero sí existe riesgo de comportamiento motor no deseado fuera de las condiciones de entrenamiento.
- Es una política perpetua: no incorpora una condición de parada interna, de modo que el robot sigue ejecutando la marcha hasta que se le indique lo contrario.
- La tabla de consulta recombina políticas de terceros (HlibPlakhtii y nikghodki); conviene verificar los términos de esas políticas antes de un uso en producción.
- Depende del ecosistema microduck y del daemon `robotctl` con manifiesto schema 2; no es portable a otras plataformas sin adaptación.
- El repositorio no tiene descargas ni likes, y la información técnica publicada es escasa (sin parámetros, dataset ni benchmarks), lo que limita la evaluación previa a producción.
- No se documentan condiciones de seguridad, límites de par o protocolos de parada de emergencia; deben gestionarse a nivel de plataforma.

## Enlaces

- Hugging Face: https://huggingface.co/GinDuck/microduck-gin-sprint-c19
- Repositorio microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl` (rama `talent-3`, commit `debcfcae0`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon
