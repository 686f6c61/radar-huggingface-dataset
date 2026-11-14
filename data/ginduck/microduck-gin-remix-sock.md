# GinDuck/microduck-gin-remix-sock

## Resumen

`GinDuck/microduck-gin-remix-sock` es una política de control robótico entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo microduck de Pollen Robotics. No se trata de un modelo de lenguaje, sino de una política de locomoción que mapea observaciones de 61 dimensiones a 14 acciones de control a 50 Hz, empaquetada en formato ONNX para su ejecución directa en el robot. El modelo se distribuye a través de la librería `microduck` y su pipeline declarado es `robotics`.

El autor, GinDuck, lo describe como un "remix": una política perpetua que combina semillas de entrenamiento derivadas de otros trabajos (el WR1N derivado de jrubiosainz y el heist-lookup-v1 de nikghodki) sobre una red base propia denominada sock-heist continue-2. La política está pensada exclusivamente para simulación, según la propia model card, y se carga en una ranura de política del demonio de control del robot mediante el comando `robotctl policy load`.

La relevancia de esta ficha es limitada en términos de ecosistema: el repositorio tiene 0 descargas y 0 likes, un tamaño de 0.0 GB y no declara licencia ni idiomas. Se documenta aquí como artefacto de investigación en robótica con refuerzo, no como modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para control robótico (detalles no disponibles) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de políticas microduck) |

Especificaciones adicionales declaradas en la model card:

| Parámetro | Valor |
|---|---|
| Dimensión de observación | 61 |
| Dimensión de acción | 14 |
| Frecuencia de control | 50 Hz |
| Tipo de política | perpetua (se ejecuta de forma continua hasta recibir orden de parada) |
| Entorno de ejecución | simulación únicamente |
| Librería | microduck |
| Pipeline | robotics |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna de la red (número de capas, tipo de transformer o MLP, función de activación, etc.), por lo que este dato queda como no disponible. Lo que sí se especifica es la interfaz: la política consume observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, un formato típico de políticas de locomoción para cuadrúpedos de pequeño tamaño. El normalizador de observaciones está integrado dentro de `policy.onnx`, de modo que la política acepta observaciones en bruto sin preprocesado externo.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, en la rama `talent-3`, commit `debcfcae0`. La política es un "remix" que combina semillas de entrenamiento: la semilla 1 reproduce el WR1N derivado de jrubiosainz y las semillas 2 a 5 reproducen el heist-lookup-v1 de nikghodki, sobre una red base de GinDuck llamada sock-heist continue-2. No se indica el número de tokens, episodios, pasos de simulación ni la composición del dataset de entrenamiento, ni si se aplicaron técnicas de RLHF, DPO u otras. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal, que no aplican a este tipo de artefacto.

## Capacidades

- Locomoción continua de un robot cuadrúpedo microduck en simulación, mediante una política perpetua que se ejecuta hasta recibir una orden de parada.
- Control a 50 Hz con 14 grados de acción sobre el robot.
- Procesamiento de observaciones de 61 dimensiones con normalización integrada en el propio grafo ONNX.
- Carga en una ranura de política del demonio de control mediante `robotctl policy load <slot> GinDuck/microduck-gin-remix-sock`.
- Compatibilidad con el manifiesto de políticas microduck en su esquema 2.
- No soporta tool calling, function calling, razonamiento multi-paso, capacidades multilingües, visión, audio ni modos de pensamiento; no es un modelo de lenguaje.

## Casos de uso

- Investigación en locomoción con refuerzo: la política sirve como punto de partida o referencia para comparar gaitas en el simulador de microduck, cargándola en una ranura y ejecutándola de forma perpetua.
- Reproducción de experimentos: al documentarse el repositorio, rama y commit de entrenamiento, permite reproducir o auditar el pipeline de `microduck_rl` en la rama `talent-3`.
- Evaluación de remixes de políticas: útil para estudiar cómo la combinación de semillas de distintos autores (WR1N y heist-lookup-v1) afecta al comportamiento resultante de la gaita.
- Pruebas de integración del demonio de control: sirve para validar el flujo `robotctl policy load` y el esquema 2 del manifiesto de políticas en un entorno de simulación.
- Docencia y demostraciones: al ser una política perpetua de bajo nivel, puede usarse para ilustrar el ciclo observación-acción a 50 Hz en un cuadrúpedo simulado.
- Base para ajuste fino: al estar entrenada sobre una red base identificada (sock-heist continue-2), puede servir como inicialización para nuevas políticas en el mismo robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio es de 0.0 GB y no se detalla el tamaño del grafo ONNX.
- GPU recomendadas: no disponibles. Al ser una política de control a 50 Hz con observaciones de 61 dimensiones y 14 acciones, es plausible que se ejecute en CPU, pero no se confirma en la información proporcionada.
- ¿Cabe en GPU de consumo? No disponible.
- Opciones de despliegue: el despliegue previsto es mediante el demonio de control microduck con `robotctl policy load`; también puede ejecutarse como modelo ONNX con un runtime compatible (por ejemplo, ONNX Runtime), aunque no se documenta explícitamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Observación / acción | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GinDuck/microduck-gin-remix-sock | Política RL para microduck | 61 / 14 | 50 Hz | no disponible | Hugging Face (0 descargas) |
| WR1N (derivado de jrubiosainz) | Política RL para microduck (fuente de semilla 1) | no disponible | no disponible | no disponible | no disponible |
| heist-lookup-v1 (nikghodki) | Política RL para microduck (fuente de semillas 2-5) | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento, parámetros ni contexto de los modelos comparables más allá de su mención como fuentes de semillas en la model card.

## Limitaciones y advertencias

- La model card indica explícitamente "Simulation only": la política no está validada para ejecución en un robot físico.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido; se debe contactar con el autor antes de cualquier uso en producción.
- No se declaran idiomas soportados (no aplica a un modelo de control, pero el campo está vacío en los metadatos).
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de validación por parte de la comunidad.
- No se documentan sesgos, tasas de alucinación ni métricas de robustez; al ser una política de control, el riesgo relevante es el fallo de locomoción o comportamiento inesperado en simulación.
- La política es perpetua: se ejecuta hasta recibir una orden de parada, lo que exige mecanismos externos de seguridad si se traslada a hardware real.
- No se especifican los parámetros de la red ni el volumen de entrenamiento, lo que dificulta evaluar su generalización.
- El tamaño del repositorio (0.0 GB) sugiere que los pesos pueden no estar efectivamente subidos o que son de muy pequeño tamaño; conviene verificar la integridad de `policy.onnx` antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-gin-remix-sock
- Repositorio de la librería microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl`, rama `talent-3`, commit `debcfcae0` (no se proporciona URL directa en la información disponible)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del demonio de control (no se proporciona URL directa)
