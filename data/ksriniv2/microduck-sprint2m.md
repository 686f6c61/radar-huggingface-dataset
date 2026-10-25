# ksriniv2/microduck-sprint2m

## Resumen

`ksriniv2/microduck-sprint2m` no es un modelo de lenguaje: es una **política de control** (policy) entrenada con refuerzo y exportada a ONNX para el robot [microduck](https://github.com/pollen-robotics/microduck) de Pollen Robotics. Recibe una observación de 61 dimensiones, emite 14 acciones y se ejecuta a 50 Hz. El autor la describe como una política "perpetua": genera una marcha (gait) que se mantiene indefinidamente hasta que se le ordena lo contrario, y se carga en una ranura (slot) del daemon del robot mediante `robotctl policy load`.

El modelo se publica como artefacto de despliegue, no como checkpoint de investigación: el repositorio contiene `policy.onnx` (con el normalizador de observaciones embebido, de modo que se alimenta con observaciones en crudo) y un `manifest.json` que sigue el esquema 2 del manifiesto de políticas de microduck. El entrenamiento se realizó con el stack `mjlab-microduck 0.1.0` sobre el repositorio `microduck-challenges`, con 4096 entornos paralelos, 5000 iteraciones máximas y checkpoint final en la iteración 2860.

Su relevancia es acotada y muy específica: sirve como ejemplo reproducible de un pipeline completo de RL —entrenamiento en simulación, exportación a ONNX y despliegue en hardware— para quien trabaje con el robot microduck o con el framework mjlab. Con 0 descargas y 0 likes en el momento de la consulta, es un artefacto recién publicado (24 de octubre de 2026) y sin validación externa por parte de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red de política para control robótico, exportada a ONNX; topología interna no documentada en la model card |
| Parámetros totales | no disponible (el repositorio ocupa 0,0 GB, lo que indica un modelo de tamaño muy reducido) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: la entrada es un vector de observación de 61 dimensiones por paso de control, sin ventana de contexto textual |
| Tipos de cuantización | no disponible; se distribuye únicamente el ONNX en su precisión original, sin variantes cuantizadas documentadas |
| Idiomas soportados | no aplica (modelo de control motor, sin entrada ni salida de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de políticas de microduck) |

Parámetros de interfaz relevantes:

| Parámetro | Valor |
|---|---|
| Dimensión de observación | 61 |
| Dimensión de acción | 14 |
| Frecuencia de control | 50 Hz |
| Normalización | integrada en `policy.onnx` (se alimenta con observaciones sin normalizar) |
| Duración | perpetua (se ejecuta hasta recibir orden de parada) |
| Despliegue | `robotctl policy load <slot> ksriniv2/microduck-sprint2m` |

## Arquitectura y entrenamiento

La model card no describe la topología de la red. Lo que sí se documenta es el contrato de interfaz: 61 observaciones de entrada, 14 acciones de salida y un bucle de control a 50 Hz, con el normalizador de observaciones embebido en el grafo ONNX. La política se carga en una ranura del daemon del robot y sustituye a la política activa, lo que implica que el artefacto es autónomo: no requiere código adicional en el lado del robot más allá del runtime del daemon.

El entrenamiento es de aprendizaje por refuerzo en simulación, ejecutado con `mjlab-microduck 0.1.0` (commit base `8d0dbc94c`) sobre la tarea `Mjlab-Sprint2m-MicroDuck` del repositorio `microduck-challenges` (commit `6ff40704a`). Los hiperparámetros publicados son compatibles con PPO: 4096 entornos en paralelo, tasa de aprendizaje 3e-5 con schedule fijo, `clip-param` 0,1, 2 épocas de aprendizaje por iteración, coeficiente de entropía 0,0, 5000 iteraciones máximas y guardado cada 20 iteraciones. El checkpoint exportado corresponde a la iteración 2860, con semilla 1, reanudando desde `model_2800.pt`.

Dos caveats técnicos explícitos del autor: el modelo se exportó desde un checkout con cambios sin confirmar (por lo que el commit indicado no reproduce exactamente el estado del código usado), y el entrenamiento con RL sobre GPU no es bit-reproducible entre máquinas, de modo que repetir el comando produce una política comparable pero no idéntica.

## Capacidades

- Generación de una marcha continua ("perpetua") para el robot microduck: la política mantiene la locomoción indefinidamente sin horizonte de episodio.
- Control motor de 14 acciones a partir de un vector de observación de 61 dimensiones, a 50 Hz.
- Normalización de observaciones integrada: acepta observaciones en crudo, sin preprocesado en el lado del robot.
- Despliegue directo mediante el daemon del robot (`robotctl policy load`), sin script de inferencia propio.
- Intercambiable por ranuras: convive con otras políticas del mismo formato en el manifiesto de microduck.
- Reproducibilidad documentada del pipeline de entrenamiento (comando, semilla, hiperparámetros y lockfile).
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es un controlador motor, no un modelo generativo.

## Casos de uso

- **Locomoción base del microduck en laboratorio**: cargar la política en una ranura con `robotctl policy load` y dejar que el robot camine de forma continua para experimentar con percepción, planificación o interacción de alto nivel mientras la capa de control se mantiene estable.
- **Punto de partida para fine-tuning de tareas**: reutilizar el comando de entrenamiento publicado (reanudando desde un checkpoint) para especializar la marcha en terrenos, velocidades o cargas distintas dentro de `microduck-challenges`.
- **Estudio de sim-to-real**: comparar el comportamiento de la política entrenada en `mjlab-microduck` con el observado en el robot físico a 50 Hz, midiendo degradación por dinámicas no modeladas.
- **Validación de un pipeline de despliegue**: usar el artefacto como caso de prueba de la cadena completa ONNX + `manifest.json` (esquema 2) + daemon, incluyendo la sustitución en caliente de políticas por ranura.
- **Docencia en aprendizaje por refuerzo**: ejemplo compacto y ejecutable de entrenamiento con 4096 entornos paralelos, exportación a ONNX y ejecución en hardware real, sin necesidad de infraestructura de GPU a gran escala para la fase de inferencia.
- **Benchmark interno de control**: servir de línea base de gait "sprint" contra la que comparar políticas propias del mismo robot, con la misma dimensionalidad de observación y acción.
- **Pruebas de robustez y parada**: dado que la política es perpetua, validar los mecanismos externos de parada y recuperación del daemon antes de dejarla correr sin supervisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, tasas de éxito, velocidad de locomoción, ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- **VRAM estimada**: no disponible. Por el tamaño del repositorio (0,0 GB) y la naturaleza del artefacto (una política ONNX de dimensión 61→14), el modelo es de pocos megabytes y la inferencia cabe holgadamente en cualquier GPU consumer, e incluso en CPU.
- **GPU recomendadas**: no disponible en la documentación. Para el entrenamiento, el comando publicado asume 4096 entornos paralelos, lo que exige una GPU de datacenter (A100/H100) o, como mínimo, una GPU con suficiente memoria para simulación masiva; el autor no especifica el hardware empleado.
- **Consumer GPU**: la inferencia sí es viable en cualquier GPU consumer e incluso en CPU; el entrenamiento a 4096 entornos no está pensado para hardware de consumo.
- **Opciones de despliegue**: el runtime previsto es el daemon de microduck (`robotctl`), que carga el ONNX desde HuggingFace en una ranura. Al ser ONNX estándar, es portable a ONNX Runtime en otras plataformas, aunque no está documentado.
- **Latencia y throughput**: el bucle de control impone un presupuesto de 20 ms por paso (50 Hz). No se publican latencias medidas ni throughput.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de parámetros de modelos comparables en la información proporcionada. La comparación más directa posible es con otras políticas del mismo repositorio `microduck-challenges`, de las que no se incluyen especificaciones.

| Modelo | Tipo | Observación / acción | Frecuencia | Licencia | Formato |
|---|---|---|---|---|---|
| microduck-sprint2m (este) | Política RL para microduck | 61 / 14 | 50 Hz | no disponible | ONNX + manifest |
| Otras políticas de `microduck-challenges` | Política RL para microduck | no disponible | no disponible | no disponible | no disponible |
| Políticas de locomotion de propósito general (p. ej., stacks de MuJoCo Playground) | Política RL | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Licencia no declarada**: sin licencia explícita no hay autorización clara para uso comercial ni para redistribución; hay que contactar con el autor antes de integrarla en un producto.
- **Sin validación externa**: 0 descargas y 0 likes; no hay evidencia de terceros sobre su robustez en hardware real.
- **Ausencia total de métricas**: no se publican recompensas, tasas de éxito ni comparaciones, por lo que no es posible evaluar su calidad frente a alternativas.
- **Brecha sim-to-real**: el entrenamiento es en simulación con `mjlab-microduck`; el comportamiento en el robot físico puede degradarse por dinámicas, fricción o latencias no modeladas.
- **Exportación desde un checkout con cambios sin confirmar**: el commit documentado no reproduce exactamente el código usado, lo que debilita la trazabilidad.
- **No reproducibilidad bit a bit**: repetir el entrenamiento con la misma semilla produce pesos distintos; no es posible regenerar este artefacto exacto.
- **Política perpetua**: se ejecuta hasta recibir orden contraria; requiere mecanismos externos de parada y supervisión, especialmente en las primeras pruebas.
- **Dependencia de la interfaz**: cualquier cambio en el esquema 2 del manifiesto o en la dimensionalidad de observación/acción del daemon rompe la compatibilidad.
- **Sesgos**: no disponibles; en RL de locomoción los sesgos relevantes serían los del simulador y la distribución de terrenos de entrenamiento, que no se documenta.
- **Idioma y contexto**: no aplica, pero conviene subrayar que este artefacto no puede usarse para tareas de texto, código o razonamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ksriniv2/microduck-sprint2m
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Commit de entrenamiento: https://github.com/pollen-robotics/microduck-challenges/commit/6ff40704a
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon de microduck (referenciado en la model card)
