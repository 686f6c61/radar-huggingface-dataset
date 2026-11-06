# RSanchez996/microduck-sock-heist-6m-run-1101-2350

## Resumen

`microduck-sock-heist-6m-run-1101-2350` es una política de control motriz (locomoción) entrenada mediante aprendizaje por refuerzo (PPO) para el robot cuadrúpedo microduck de Pollen Robotics. No es un modelo de lenguaje: es un controlador neuronal que recibe observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, empaquetado en formato ONNX para su ejecución directa sobre el robot. Lo publica el usuario RSanchez996 como entrega del reto "Sock Heist" de 6 metros.

El modelo parte de la política caminante preentrenada de Pollen Robotics y se afina con PPO para optimizar velocidad de esprint, aceleración, frenada y estabilidad. El resultado declarado por el autor es un tiempo de 6,13 segundos en el recorrido de 6 metros, una mejora del 26,5 % respecto a su resultado anterior de 8,34 s. Es una política perpetua: se ejecuta de forma continua hasta que se le indique lo contrario, y se carga en una ranura de política del daemon `robotctl`.

Su relevancia es acotada pero concreta: sirve como referencia reproducible (semilla, commit y comando de entrenamiento documentados) de un pipeline completo de RL para robótica con simulación (mjlab), exportación a ONNX y despliegue en hardware real a través de la infraestructura de microduck.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para control motriz (arquitectura interna no especificada), exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política reactiva; ventana de observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |

Parámetros operativos adicionales:

| Parametro | Valor |
|---|---|
| Frecuencia de control | 50 Hz |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Normalizador de observaciones | Integrado en `policy.onnx` (se alimenta con observaciones crudas) |
| Algoritmo de entrenamiento | PPO |
| Entornos paralelos | 4096 |
| Iteraciones maximas | 15000 |
| Checkpoint | 10800 |
| Semilla | 22 |

## Arquitectura y entrenamiento

La información disponible no detalla la topología interna de la red (número de capas, anchura, funciones de activación). Lo que sí se documenta es el pipeline: se parte de la política caminante preentrenada `mjlab-microduck 0.1.0` (commit `1efd853be`) y se afina con PPO sobre la tarea `Mjlab-SockHeist6m-MicroDuck`, definida en el repositorio `RSanchez996/microduck-challenges` (rama `main`, commit `b95c90e82`). El entrenamiento se lanzó el 2026-11-01 con 4096 entornos simulados en paralelo, hasta 15000 iteraciones, con registro en TensorBoard y nombre de ejecución `run-1101-2350`. El checkpoint final corresponde a la iteración 10800.

La innovación práctica no está en la arquitectura sino en el objetivo de recompensa: el autor declara optimizar explícitamente velocidad de esprint, aceleración, frenada y estabilidad "durante los semáforos en rojo", es decir, un perfil de marcha agresivo con control de paradas. El modelo se exporta a ONNX con el normalizador de observaciones embebido, de modo que el consumidor no necesita replicar la normalización. El autor advierte que el entrenamiento no es bit-reproducible entre máquinas: misma semilla y mismo código producen una política comparable, no idéntica.

## Capacidades

- Locomoción cuadrúpeda continua sobre el robot microduck: genera comandos motores a 50 Hz a partir de 61 observaciones.
- Marcha perpetua: la política se ejecuta de forma indefinida hasta que el sistema la descarga o la sustituye.
- Perfil de movimiento optimizado para velocidad y frenada en un recorrido recto de 6 metros.
- Despliegue directo en hardware mediante `robotctl policy load`, sin pasos intermedios de conversión.
- Inferencia en formato ONNX, ejecutable con runtimes estándar de ONNX sin dependencias de frameworks de entrenamiento.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües; es un controlador específico de tarea.

## Casos de uso

- Benchmark de locomoción en microduck: cargar la política en una ranura y medir el tiempo sobre el circuito de 6 metros para comparar contra otras políticas publicadas, como la referencia de 8,34 s del propio autor.
- Base para afinar nuevas políticas: al estar documentados el commit, la semilla, el `uv.lock` y el comando exacto, sirve como punto de partida reproducible para experimentar con variaciones de recompensa (más velocidad, más estabilidad, frenadas más cortas).
- Validación de pipelines sim-to-real: permite comprobar de extremo a extremo el flujo mjlab (simulación) → PPO → exportación ONNX → `robotctl` → hardware, útil para equipos que construyen su propia cadena de RL robótico.
- Pruebas de integración del daemon microduck: el `manifest.json` conforme al schema 2 y el normalizador embebido hacen de esta política un caso de prueba realista para validar el cargador de ranuras del daemon.
- Demostraciones educativas de RL aplicado a robótica: el par (tarea, comando de entrenamiento) es un ejemplo completo y citable de PPO con 4096 entornos paralelos para un robot de bajo coste.
- Investigación en control de paradas: el énfasis declarado en frenada y estabilidad permite estudiar el compromiso velocidad-estabilidad en políticas entrenadas con recompensas multiobjetivo.

## Benchmarks y rendimiento

El único dato de rendimiento publicado es el tiempo de la tarea:

| Metrica | Resultado |
|---|---|
| Tiempo en el reto Sock Heist 6 m | 6,13 s |
| Resultado previo del mismo autor | 8,34 s |
| Mejora relativa | 26,5 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible; no aplican a este tipo de modelo. Tampoco se documentan latencia, throughput ni métricas de seguimiento de trayectoria más allá del tiempo de recorrido.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB, lo que sugiere un artefacto ONNX muy pequeño (política de control, no un modelo generativo). Cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas para entrenamiento: no especificadas. El entrenamiento usó 4096 entornos paralelos, lo que en la práctica requiere una GPU de datacenter (A100, H100 o similar) para completar 15000 iteraciones en un tiempo razonable; el autor no publica la GPU empleada.
- GPU consumer: la inferencia es viable en cualquier GPU consumer moderna e incluso en CPU; el entrenamiento completo probablemente no es práctico en una RTX 4090 con 4096 entornos, aunque no hay dato confirmado.
- Opciones de despliegue: `robotctl policy load <slot> <repo>` sobre el daemon de microduck; inferencia ONNX con cualquier runtime compatible (ONNX Runtime, etc.).
- Latencia y throughput: no disponibles. La política opera a 50 Hz por diseño, lo que fija un presupuesto de 20 ms por paso de control, pero no se publican medidas reales.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Resultado declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-sock-heist-6m-run-1101-2350 (este) | Política RL (PPO) en ONNX | Sock Heist 6 m en microduck | 6,13 s | no disponible | Hugging Face |
| Política previa del mismo autor | Política RL en ONNX | Sock Heist 6 m en microduck | 8,34 s | no disponible | no disponible (referenciada en la model card) |
| `mjlab-microduck 0.1.0` (base) | Política caminante preentrenada | Locomoción base microduck | no disponible | no disponible | Repositorio mjlab (commit `1efd853be`) |

No se dispone de información sobre otras políticas comparables de terceros para el mismo robot o la misma tarea en la documentación proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política solo resuelve el recorrido Sock Heist de 6 metros en el robot microduck; no es reutilizable para otras tareas, morfologías o robots.
- Sin licencia declarada: la ausencia de licencia impide asumir permisos de uso comercial, modificación o redistribución; hay que contactar con el autor antes de cualquier uso en producción.
- No reproducible bit a bit: el propio autor advierte que reentrenar con la misma semilla produce una política comparable pero no idéntica, lo que complica la auditoría y la certificación.
- Sin documentación de arquitectura interna ni de parámetros: no se puede evaluar la complejidad del controlador ni estimar con precisión sus requisitos.
- Riesgo de sobreajuste al escenario simulado: el rendimiento de 6,13 s se declara en el reto, pero no se documenta la tasa de éxito en hardware real, la variabilidad entre ejecuciones ni el comportamiento ante perturbaciones externas.
- Sin datos de seguridad: no se publican límites de par, comportamientos de parada de emergencia ni análisis de fallos, algo crítico en un robot físico que se mueve a velocidad.
- Cero tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin issues ni validación independiente conocida.
- Idiomas y sesgos: no aplican en el sentido habitual (no genera texto), pero sí existe el riesgo de sesgo de simulación (dinámica del simulador mjlab distinta de la realidad).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RSanchez996/microduck-sock-heist-6m-run-1101-2350
- Repositorio de retos y entrenamiento: https://github.com/RSanchez996/microduck-challenges
- Repositorio del robot y daemon microduck: https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas (referenciada en la model card): `docs/policy-manifest.md` dentro del repositorio del daemon
- Base de entrenamiento: `mjlab-microduck 0.1.0`, commit `1efd853be` (sin URL directa en la información disponible)
