# nikghodki/microduck-roller-s1-299

## Resumen

`microduck-roller-s1-299` es una política de aprendizaje por refuerzo (RL) para el Microduck, el robot bípedo de 25 cm y 399 dólares desarrollado por Pollen Robotics y Hugging Face. Concretamente, es una política de locomoción sobre patines (rollers) entrenada para la tarea `Mjlab-RollerSprint2m-MicroDuck`: esprintar 2 metros con el robot montado sobre sus ruedas opcionales. El autor, `nikghodki`, es un miembro de la comunidad que ha empleado el stack oficial de entrenamiento abierto de Microduck, no el equipo de Pollen Robotics.

Técnicamente, la política procesa observaciones de 61 dimensiones y emite 14 acciones a 50 Hz. Es una política «perpetual»: se ejecuta de forma continua hasta que se le ordena detenerse. El normalizador de observaciones va integrado en el propio `policy.onnx`, de modo que puede alimentarse con observaciones crudas sin preprocesamiento externo, y se distribuye junto a un `manifest.json` que sigue el esquema 2 del manifiesto de políticas de microduck.

Su interés radica en que ejemplifica el flujo de trabajo completo de Microduck: entrenamiento en simulación con mjlab/MuJoCo en GPU, exportación a ONNX y despliegue en hardware real de bajo coste. Es un caso de estudio práctico de sim-to-real con reproducibilidad documentada (mismo código, mismo `uv.lock`, misma seed), aunque explícitamente no bit a bit.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de RL para control robótico (arquitectura de red exacta no disponible) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entrada fija de 61 dimensiones; no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (política de control robótico, no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de microduck) |
| Frecuencia de control | 50 Hz |
| Dimensión de observación | 61 |
| Dimensión de acciones | 14 |
| Tarea de entrenamiento | `Mjlab-RollerSprint2m-MicroDuck` (esprint de 2 m sobre rollers) |
| Checkpoint | 299 (seed 1) |
| Tamaño del repositorio | 0,0 GB (modelo muy ligero) |

## Arquitectura y entrenamiento

No se ha publicado la arquitectura concreta de la red (número de capas, unidades ocultas o presencia de recurrencia), algo habitual en políticas de locomoción que suelen ser MLP compactas; el tamaño del repositorio (0,0 GB) es coherente con un modelo muy pequeño apto para ejecutarse en el compute embarcado del robot a 50 Hz. Lo que sí está documentado es el pipeline de entrenamiento: se empleó `mjlab-microduck 0.1.0` (commit `1efd853be`), la variante GPU de la simulación MuJoCo, con 4096 entornos paralelos, 300 iteraciones máximas, seed 1 y logging mediante TensorBoard. El checkpoint exportado es el 299.

Al tratarse de aprendizaje por refuerzo con funciones de recompensa sobre simulación física, no aplican técnicas como RLHF, DPO ni decodificación especulativa propias de los modelos de lenguaje. Dos advertencias relevantes del propio autor: la exportación se realizó desde un checkout con cambios sin confirmar (lo que compromete la reproducibilidad exacta incluso fijando el commit `fe4036eb2` de la rama `md-planter`), y reentrenar con el mismo comando y seed produce una política comparable, no idéntica, porque la RL en GPU no es bit-reproducible entre máquinas.

## Capacidades

- Locomoción sobre rollers: política entrenada específicamente para la tarea de esprint de 2 metros con el Microduck montado en sus ruedas opcionales.
- Control perpetuo a 50 Hz: mantiene la marcha de forma continua hasta recibir una orden de parada desde el daemon.
- Entrada de observaciones crudas: el normalizador está integrado en `policy.onnx`, sin necesidad de preprocesamiento externo.
- Despliegue directo en hardware: cargable en un slot de políticas del robot mediante `robotctl policy load <slot>`.
- Compatibilidad con el sistema de slots de microduck, lo que permite intercambiar comportamientos en tiempo de ejecución.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni function calling, y no incluye capacidades de visión o audio (la composición exacta de las 61 dimensiones de observación no está detallada en la model card).

## Casos de uso

- Investigación en locomoción híbrida ruedas-piernas: sirve como baseline público para la tarea de esprint sobre rollers; el repositorio de entrenamiento permite reproducir el experimento y variar hiperparámetros (semillas, iteraciones, número de entornos) de forma controlada.
- Educación en robótica y RL: con un Microduck (399 dólares) y este checkpoint se puede estudiar el pipeline completo simulación → ONNX → hardware real, algo poco habitual a este precio.
- Benchmarking de algoritmos de RL: al publicarse comando, seed y commit exactos, es un punto de comparación útil para evaluar variantes de entrenamiento sobre la misma tarea.
- Composición de comportamientos en el robot: como política perpetua cargable en un slot, puede combinarse con los demás comportamientos del robot (caminar, levantarse, patear) gestionados por el daemon para secuencias de mayor nivel.
- Estudios de brecha sim-to-real: al empaquetar pesos y normalizador en un único fichero ONNX, ofrece un caso limpio para medir la diferencia entre rendimiento simulado y real en patinaje robótico.
- Punto de partida para transferencia: se puede reutilizar el stack de mjlab y este checkpoint como referencia para entrenar políticas de roller más complejas (curvas, frenadas, esquiva de obstáculos).
- Demostraciones y divulgación: el esprint de un pato robot sobre patines es un escenario atractivo para talleres, eventos y contenido educativo sobre robótica abierta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única referencia cuantitativa implícita es la propia tarea de entrenamiento (esprint de 2 metros sobre rollers, 300 iteraciones, 4096 entornos), sin tiempos, distancias ni curvas de recompensa publicadas.

## Requisitos de hardware

- Inferencia: se ejecuta en el propio Microduck a 50 Hz mediante su daemon; no requiere GPU externa ni VRAM dedicada. El tamaño del repositorio (0,0 GB) indica un modelo muy ligero.
- Entrenamiento (reproducción): requiere simulación MuJoCo acelerada por GPU con 4096 entornos paralelos; una GPU moderna de gama alta (tipo RTX 4090 o A100) es razonable, aunque la VRAM exacta no está publicada (no disponible).
- Consumer GPU: para inferencia no se necesita ninguna GPU; para reentrenar, una GPU de consumo de gama alta debería bastar, pero no hay cifras publicadas que lo confirmen.
- Despliegue: daemon de microduck (`robotctl policy load`) y runtime ONNX. No aplican vLLM, llama.cpp, Ollama ni TGI, al no tratarse de un modelo de lenguaje.
- Latencia y throughput: el diseño impone un ciclo de control de 50 Hz; no hay mediciones de latencia publicadas (no disponible).

## Comparativa con modelos similares

No hay fichas técnicas publicadas para otras políticas de Microduck con las que comparar specs numéricas. Según la prensa, el robot se envía con siete comportamientos entrenados de fábrica. Comparativa cualitativa con lo disponible:

| Modelo | Tarea | Obs./acciones | Formato | Licencia |
|---|---|---|---|---|
| microduck-roller-s1-299 | Esprint 2 m sobre rollers | 61-D / 14 acciones a 50 Hz | ONNX + manifest | no disponible |
| Políticas de fábrica de Microduck (caminar, sentarse, patear balón, levantarse, etc.) | Variadas | no disponible | no disponible | no disponible |
| Otras políticas de la comunidad en el Hub (tag `microduck`) | no disponible | no disponible | ONNX (por convención del tag) | no disponible |

## Limitaciones y advertencias

- Licencia no especificada: existe incertidumbre legal sobre reutilización, redistribución y uso comercial; conviene consultar al autor antes de cualquier despliegue serio.
- Extrema especificidad de tarea: la política solo cubre el esprint sobre rollers; no generaliza a otras locomociones ni superficies.
- Exportada desde un checkout con cambios sin confirmar: incluso fijando commit y seed, la reproducción exacta de los pesos no está garantizada.
- La RL en GPU no es bit-reproducible entre máquinas: reentrenar produce políticas comparables, no idénticas.
- Sin validación de terceros: 0 descargas y 0 likes en el momento de redactar la ficha; no hay evidencia de que nadie haya probado la política en hardware real.
- Brecha sim-to-real: entrenada íntegramente en simulación (MuJoCo/mjlab); el comportamiento real puede diferir y el robot podría caerse durante el esprint.
- Opacidad técnica: no se publican arquitectura de la red, hiperparámetros completos ni curvas de entrenamiento.
- Política perpetua: debe gestionarse explícitamente su parada desde el daemon para evitar que el robot siga moviéndose indefinidamente.
- Requiere hardware Microduck y un daemon compatible con el esquema 2 del manifiesto de políticas (`docs/policy-manifest.md` del repositorio del daemon).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nikghodki/microduck-roller-s1-299
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento (microduck-challenges): https://github.com/pollen-robotics/microduck-challenges
- TechCrunch, presentación del Microduck: https://techcrunch.com/2026/08/27/hugging-face-is-selling-a-cute-399-open-source-duck-robot-microduck/
- MarkTechPost, análisis del lanzamiento: https://www.marktechpost.com/2026/08/28/pollen-robotics-hugging-face-microduck-399-open-source-rl-biped-robot/
- AI/TLDR, ficha de Microduck: https://ai-tldr.dev/releases/huggingface-microduck/
- AI Weekly, preventa del Microduck: https://aiweekly.co/alerts/hugging-face-opens-pre-orders-for-399-microduck-rl-biped
- Yahoo Tech, artículo sobre el lanzamiento: https://tech.yahoo.com/ai/meta-ai/articles/hugging-face-launches-microduck-399-171113553.html
