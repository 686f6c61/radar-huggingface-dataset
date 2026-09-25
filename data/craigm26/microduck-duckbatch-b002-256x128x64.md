# craigm26/microduck-duckbatch-b002-256x128x64

## Resumen

Microduck-Duckbatch b002-256x128x64 es una política de control (policy) para el robot bípedo Microduck de Pollen Robotics, publicada por el usuario craigm26. No es un modelo de lenguaje ni un transformer: es una red neuronal feedforward de tipo perceptrón multicapa (MLP) con topología 61-256-128-64-14, es decir, 61 entradas de observación y 14 salidas de acción, con 57.934 parámetros totales. El modelo se distribuye en formato ONNX y su única tarea es generar la marcha (walking) del robot a partir de su vector de observaciones.

El modelo se ha obtenido por destilación desde el caminante por defecto de Pollen (`velstand.onnx`, 197.774 parámetros), dentro del proyecto duckbatch, un pipeline de RL batcheado y evaluado por jueces automáticos que busca reducir al máximo el tamaño de las políticas de Microduck para que quepan y se ejecuten en hardware muy limitado. La relevancia de esta ficha es doble: por un lado documenta un caso extremo de compresión de políticas de robótica (una reducción de parámetros de 3,4x y de FLOPs por paso de 3,4x respecto al profesor); por otro, sirve de ejemplo de ficha reproducible, con métricas medidas en `mjlab` sobre semillas reservadas y con un registro completo de decisiones de entrenamiento.

Es importante subrayar que se trata de un modelo exclusivamente de simulación: nunca se ha ejecutado en un robot físico. El propio autor lo indica de forma explícita en la model card, y lo enmarca como candidato a una futura prueba en hardware, no como un resultado validado en hardware. El contrato de inferencia es `obs[1,61] -> actions[1,14]`, con el normalizador de observaciones integrado en el propio grafo ONNX, igual que en el resto de políticas de Pollen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal feedforward (MLP) 61-256-128-64-14, exportada a ONNX |
| Parametros totales | 57.934 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica: la politica solo consume la observacion actual `obs[1,61]`; no mantiene contexto temporal explicito en la interfaz |
| Tipos de cuantizacion | no disponible (se distribuye como grafo ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | No aplica (modelo de control motor, no procesa lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX |
| Entrada / salida | `obs[1,61]` -> `actions[1,14]`, normalizador integrado en el grafo |
| FLOPs por paso | 114.944 |
| Tamano del repositorio | 0,0 GB |
| Pipeline declarado | reinforcement-learning |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es una MLP de cuatro capas (entrada de 61 dimensiones, dos capas ocultas de 256 y 128, una capa de 64 y salida de 14 acciones), con 57.934 parámetros en total. Se exporta como grafo ONNX autocontenido: el normalizador de observaciones va incluido en el propio grafo, de modo que el consumidor solo tiene que alimentar el vector de 61 valores crudos y leer las 14 acciones. Esto la hace compatible con el mismo contrato que usan todas las políticas de Pollen (`obs[1,61] -> actions[1,14]`), lo que permite intercambiarla en el slot `walk` sin cambios en el resto del stack.

El entrenamiento se enmarca en duckbatch, un pipeline descrito por su autor como «RL batcheado, juzgado y orientado a eficiencia»: muchos intentos pequeños ejecutados en una única GPU de 4 GB, podados mediante un orden de descarte preregistrado y evaluados con modelos de decisión (`Jev`, `GLiNER2.5-Decide`) actuando como jueces. En concreto, esta política corresponde al lote `b002-student-size-longer`, intento `a01`, y se ha obtenido por destilación desde el caminante por defecto de Pollen (`velstand.onnx`, 197.774 parámetros). No se detallan en la información disponible el número exacto de tokens/pasos de simulación, la composición del dataset ni si hubo una fase explícita de RLHF/DPO; el registro completo (traza de entrenamiento, decisiones de los jueces y respuestas de los modelos de decisión) se publica en el repositorio `duckbatch`, bajo `records/b002-student-size-longer/`.

## Capacidades

- Generación de marcha bípeda: produce las 14 acciones de control del Microduck para caminar en terreno plano, a partir de las 61 observaciones del robot.
- Seguimiento de comandos de velocidad: la tarea evaluada es `Mjlab-VelStand-Flat-MicroDuck`, que exige seguir comandos de velocidad planar y de velocidad de giro (yaw).
- Recuperación desde posición prona: el modelo también se evalúa en la tarea de levantarse, con arranque prona en cada episodio, y consigue levantarse en el 98,2 % ± 0,5 % de los casos en menos de 6 s.
- Robustez ante perturbaciones: evaluado con aleatorización de dominio, empujones de tropiezo y ruido de observación activados.
- Inferencia integrada en navegador: se puede ejecutar en el simulador de Pollen alojado en Hugging Face Spaces, que carga la política directamente desde este repositorio.
- Integración con el stack del robot: cargable mediante `robotctl policy load walk craigm26/microduck-duckbatch-b002-256x128x64` (manifiesto esquema 2, slot de marcha).
- No dispone de tool calling, capacidades de agente, multilingüismo, visión ni audio, ya que no es un modelo de lenguaje ni multimodal.

## Casos de uso

- Investigación en compresión de políticas de robótica: sirve como punto de referencia reproducible para estudiar cuánto se puede reducir una política de locomoción destilada sin degradar de forma severa el seguimiento de velocidad; el par profesor/alumno está documentado con métricas sobre semillas reservadas.
- Control de locomoción en simulación: uso directo dentro de `mjlab` con la tarea `Mjlab-VelStand-Flat-MicroDuck`, útil para experimentos de robustez con aleatorización de dominio y empujones.
- Demostración interactiva en navegador: el simulador de Pollen permite cargar la política por URL y evaluar cualitativamente la marcha sin instalar nada, lo que facilita revisiones rápidas por parte de terceros.
- Base para pruebas en hardware: dado que el autor la describe como candidata a un test físico, puede emplearse como punto de partida para un primer despliegue en el robot Microduck, siempre asumiendo el riesgo de que la transferencia sim-a-real falle.
- Comparación de estrategias de destilación: al existir una variante profesora y trazas de entrenamiento, permite comparar curvas de coste (parámetros, FLOPs, latencia) frente a calidad de marcha.
- Benchmark de latencia en CPU: con 14,5 µs de latencia p50 a un solo hilo en un portátil x86, es adecuada para experimentos de inferencia a muy baja latencia o incluso para estudiar control a frecuencias muy altas sin acelerador.
- Educación y prototipado en robótica: por su tamaño mínimo y su licencia permisiva, es un recurso didáctico para explicar el ciclo completo observación → red → acción en un robot bípedo de 25 cm.

## Benchmarks y rendimiento

Los datos proceden de la propia model card. Evaluación en `mjlab` (`Mjlab-VelStand-Flat-MicroDuck`) con aleatorización de dominio, empujones de tropiezo y ruido de observación activados; los arranques pronos deliberados y los empujones de derribo están desactivados para las cifras de marcha y activados (cada episodio prona) para las de levantarse. Ventanas de 30 s por semilla sobre semillas reservadas 2001, 2002 y 2003; media ± dispersión entre semillas. El profesor se evaluó en la misma configuración.

| Métrica | Esta política | Profesor |
|---|---|---|
| Caídas por minuto | 0,38 ± 0,07 | 0,14 ± 0,02 |
| Tiempo caído | 0,85 % ± 0,07 % | 0,43 % ± 0,10 % |
| Error de velocidad planar (m/s) | 0,178 ± 0,004 | 0,174 ± 0,004 |
| Error de velocidad de giro (rad/s) | 0,388 ± 0,007 | 0,368 ± 0,003 |
| Se levanta desde prona en 6 s | 98,2 % ± 0,5 % | 96,9 % ± 1,5 % |
| Tiempo en levantarse (s) | 0,56 ± 0,01 | 0,56 ± 0,01 |
| Parámetros | 57.934 | 197.774 |
| FLOPs por paso | 114.944 | 393.728 |
| Latencia p50 a 1 hilo (portátil x86) | 14,5 µs | 29,0 µs |

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente nula. Con 57.934 parámetros en precisión simple, los pesos ocupan del orden de 0,23 MB, por lo que el modelo cabe en cualquier GPU, en CPU o incluso en un entorno de navegador.
- GPU recomendadas: no requiere GPU. Cualquier acelerador es sobreespecificado para este modelo; su ejecución natural es en CPU.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo, placas integradas y microcontroladores con memoria suficiente para el grafo ONNX.
- Opciones de despliegue: ONNX Runtime (formato nativo), el simulador web de Pollen en Hugging Face Spaces y el comando `robotctl policy load walk ...` del stack del robot.
- Latencia estimada: 14,5 µs de p50 a un solo hilo en un portátil x86, según la medición del autor. No se publican cifras de throughput ni de latencia en otras plataformas.

## Comparativa con modelos similares

| Modelo | Parámetros | FLOPs por paso | Caídas/min | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-duckbatch-b002-256x128x64 | 57.934 | 114.944 | 0,38 ± 0,07 | apache-2.0 | Hugging Face, formato ONNX |
| velstand.onnx (profesor de Pollen) | 197.774 | 393.728 | 0,14 ± 0,02 | no disponible en la información proporcionada | Política por defecto de Pollen |

No se dispone de datos publicados sobre otras políticas destiladas del mismo pipeline duckbatch ni de alternativas de terceros para Microduck, por lo que la comparativa se limita al par profesor/alumno documentado por el autor.

## Limitaciones y advertencias

- Solo simulación: el propio autor indica que la política nunca se ha ejecutado en un robot real. Superar al profesor en `mjlab` es un criterio de candidatura a una prueba de hardware, no una garantía de funcionamiento físico.
- Mayor tasa de caídas que el profesor: 0,38 caídas/minuto frente a 0,14, y 0,85 % de tiempo caído frente a 0,43 %. La destilación reduce parámetros y latencia a costa de robustez.
- Peor seguimiento de giro: el error de velocidad de giro es de 0,388 rad/s frente a 0,368 del profesor.
- Contexto inexistente en la interfaz: al tratarse de una política puramente reactiva sobre la observación actual, no hay memoria explícita ni ventana temporal; cualquier dependencia temporal debe venir codificada en el vector de observaciones que proporciona el entorno.
- Sin capacidades lingüísticas ni multimodales: no procesa texto, imagen ni audio, a pesar de que el robot Microduck incluye cámara y LiDAR.
- Riesgo de sobreajuste a la distribución de simulación: las métricas se han obtenido con las condiciones de aleatorización declaradas por el autor; cambios en el motor físico, los contactos o los actuadores pueden degradar el comportamiento de forma no caracterizada.
- Licencia apache-2.0: permisiva y apta para uso comercial, pero conviene verificar la licencia del modelo profesor (`velstand.onnx`) si se redistribuyen derivados, ya que no se detalla en la información disponible.
- Metadatos del repositorio: las fechas de creación y actualización publicadas (septiembre de 2026) resultan anómalas; conviene verificarlas directamente en el repositorio antes de citarlas.
- Adopción mínima: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/craigm26/microduck-duckbatch-b002-256x128x64
- Simulador en navegador: https://pollen-robotics-microduck-simulator.hf.space/?move=craigm26/microduck-duckbatch-b002-256x128x64
- Repositorio duckbatch: https://github.com/craigm26/duckbatch
- README de duckbatch: https://github.com/craigm26/duckbatch/blob/main/README.md
- Space de duckbatch: https://huggingface.co/spaces/craigm26/duckbatch
- Repositorio de Microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Página oficial de Microduck: https://pollen-robotics.com/microduck/
- Dataset microduck-stairs-challenge: https://huggingface.co/datasets/craigm26/microduck-stairs-challenge
