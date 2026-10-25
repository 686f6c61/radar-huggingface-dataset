# IkerAzurmendi/act-pick-v3-1piece-12000

## Resumen

`act-pick-v3-1piece-12000` es una política de imitación (policy) para robótica, no un modelo de lenguaje. La publica el usuario IkerAzurmendi en HuggingFace dentro de la librería LeRobot, y resuelve una tarea muy concreta sobre el brazo robótico de bajo coste SO-101: coger una pieza de una caja y sostenerla frente a la cámara. El modelo recibe dos cámaras (frontal y de muñeca) más las seis posiciones articulares del brazo, y devuelve un *chunk* de 90 objetivos de posición articular futura a 30 fps.

Se trata de una política ACT (Action Chunking with Transformers), una arquitectura de aprendizaje por imitación supervisado que mapea observaciones directamente a secuencias de acciones, sin planificación explícita ni razonamiento simbólico. Con 51.658.374 parámetros y un repositorio de 0,2 GB, es un modelo pequeño pensado para inferencia en el bucle de control de un robot real.

Su relevancia es acotada pero útil: forma parte de una comparativa pública de ocho variantes de entrenamiento del mismo autor, con resultados de error articular offline sobre episodios reservados. El propio autor advierte que este checkpoint de 12.000 pasos **no** es el mejor de su ejecución (el mejor es el de 9.600 pasos) y que se publica por completitud. Ninguna de las variantes se ha probado todavía sobre el robot físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación visomotora |
| Parametros totales | 51.658.374 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; el modelo emite un chunk de 90 objetivos articulares futuros a 30 fps y replanifica cada 30 pasos de acción |
| Tipos de cuantizacion | No disponible (repo en safetensors; tamano de 0,2 GB coherente con pesos en FP32) |
| Idiomas soportados | No aplica (no procesa lenguaje natural; no se declaran idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Entradas | Cámara frontal, cámara de muñeca y 6 posiciones articulares |
| Salidas | Chunk de 90 objetivos de posición articular |
| Frecuencia de control | 30 fps |
| Pasos de entrenamiento | 12.000 (checkpoint publicado; el mejor de la ejecución es el de 9.600) |
| Episodios de entrenamiento | 292 |
| Tarea | SO-101: coger una pieza de la caja y sostenerla frente a la cámara |

## Arquitectura y entrenamiento

ACT es una familia de políticas de imitación basadas en transformer que aprenden una distribución sobre secuencias de acciones (chunks) condicionada a las observaciones visuales y proprioceptivas. En este caso la observación combina dos flujos de imagen —cámara frontal y cámara de muñeca— con las seis posiciones articulares del SO-101, y la salida es un bloque de 90 objetivos de posición futura, lo que permite ejecutar 3 segundos de trayectoria antes de volver a inferir. El bucle de control del autor replanifica cada 30 pasos de acción, es decir, aproximadamente una vez por segundo.

El entrenamiento se hizo con la función `train()` de LeRobot, batch de 8, chunk de 90, 30 pasos de acción por replanificación, aumento de imagen por defecto y semilla 1000. El conjunto de datos son 292 episodios a 30 fps, todos comenzando con exactamente una pieza en la escena, con una duración de 3 a 20 segundos (el dataset construido retiene 5 a 20 s), hueco inicial de cómo máximo 30 grados, como máximo 5 segundos de inactividad en cada extremo, error medio acción-estado de hasta 8 grados, al menos una apertura de pinza y tomas defectuosas conocidas eliminadas. Se aplicaron filtros de calidad laxos en comparación con la variante "strict" del mismo autor. No se documenta uso de RLHF, DPO ni aprendizaje por refuerzo: es imitación supervisada pura sobre demostraciones.

## Capacidades

- Generación de trayectorias articulares: produce chunks de 90 objetivos de posición para las seis articulaciones del SO-101.
- Percepción visomotora: fusiona dos cámaras (frontal y muñeca) con el estado proprioceptivo de las articulaciones.
- Ejecución autónoma de la tarea de pick: coger una pieza de la caja y sostenerla frente a la cámara.
- Control de pinza: el dataset de entrenamiento exige al menos una apertura de pinza por episodio, por lo que el modelo aprende a accionarla.
- Replanificación periódica: nueva inferencia cada 30 pasos de acción para corregir desviaciones.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes, razonamiento multi-paso simbólico ni pensamiento explícito (thinking mode).
- No soporta capacidades multilingües, visión general, audio ni generación de texto.
- Específico de un robot: no es transferible sin reentrenamiento a otra morfología o a otro setup de cámaras.

## Casos de uso

- **Recogida automatizada de piezas en un puesto de trabajo:** el modelo ejecuta el ciclo completo de coger una pieza de una caja y presentarla a la cámara, adecuado para tareas de alimentación de piezas en celdas de montaje con un SO-101.
- **Base de referencia para experimentos de imitación:** sirve como línea base reproducible (semilla 1000, receta documentada) contra la que comparar nuevas variantes de dataset, resolución de cámara o hiperparámetros de ACT.
- **Validación de pipelines de datos en LeRobot:** al estar entrenado con filtros de calidad laxos sobre 292 episodios, es útil para medir cuánto degrada la calidad del dato frente a la variante "strict" del mismo autor.
- **Prototipado rápido en robótica de bajo coste:** con 51,6 M de parámetros y 0,2 GB de pesos, se puede desplegar en una estación de trabajo con GPU de consumo o en un Jetson para pruebas de laboratorio.
- **Investigación sobre chunking de acciones:** permite estudiar el efecto del tamaño de chunk (90 frente a la variante chunk 60 del autor) en la suavidad y estabilidad del control.
- **Docencia y demostraciones de aprendizaje por imitación:** un caso pequeño y bien documentado de policy visomotora para explicar el flujo completo de recogida de datos, entrenamiento y evaluación offline.
- **Estudio de sobreajuste en políticas de imitación:** la comparativa de checkpoints del autor (2.400 a 12.000 pasos) es un ejemplo directamente citable de degradación tras aproximadamente una pasada sobre los datos.

## Benchmarks y rendimiento

Evaluación offline sobre 16 episodios reservados (12 de `so101-pick-cube_20261024_181939`, con una pieza, y 4 de `so101-pick-cube_20261024_144537`, con dos piezas). Métrica: error articular absoluto medio sobre el chunk predicho (menor es mejor), frente a una línea base de "mantenerse en las posiciones articulares actuales" de 20,71.

| Checkpoint de esta ejecución | Error | Mejora sobre la línea base |
|---|---|---|
| 2.400 pasos | 16,00 | 23% |
| 4.800 pasos | 15,82 | 24% |
| 7.200 pasos | 15,70 | 24% |
| 9.600 pasos | 15,47 | 25% |
| 12.000 pasos (este) | 15,86 | 23% |

Comparativa con el mejor checkpoint de cada ejecución del mismo autor:

| Ejecución | Episodios | Mejor checkpoint | Error | Mejora sobre "quieto" |
|---|---|---|---|---|
| super (todos los datos que pasan calidad) | 398 | 6k | 15,16 | 27% |
| strict (6-12 s, calidad estricta) | 205 | 2,4k | 15,14 | 27% |
| receta v3 sobre episodios de 1-2 piezas | 331 | 18k | 15,35 | 26% |
| v2 (anterior) | 278 | 6k | 15,36 | 26% |
| chunk 60 (línea base propia 16,23) | 331 | 4,8k | 11,94 | 26% |
| solo una pieza | 292 | 9,6k | 15,47 | 25% |
| solo sesiones recientes | 100 | 12k | 16,87 | 19% |
| primera ejecución | 165 | 6k | 16,87 | 19% |

El autor señala que los mejores checkpoints de las ejecuciones principales están dentro del ruido entre sí y que todas las ejecuciones empeoraron tras aproximadamente una pasada sobre los datos. No hay métricas de éxito de agarre ni resultados en robot real: no se han publicado datos de benchmarks de tarea real en la información disponible.

## Requisitos de hardware

- **VRAM estimada:** muy baja. Con 51,66 M de parámetros, los pesos ocupan aproximadamente 207 MB en FP32 y unos 103 MB en FP16; el consumo real lo dominan los dos flujos de cámara y las activaciones, por lo que una estimación razonable es de 1 a 2 GB de VRAM (estimación propia, no publicada por el autor).
- **GPU recomendadas:** cualquier GPU con al menos 4 GB de VRAM sirve para pruebas; para el bucle de control a 30 fps se recomienda una RTX 3060/4060 o superior, y una RTX 4090 o A100/H100 quedan muy sobredimensionadas para este modelo.
- **Consumer GPU:** sí, cabe holgadamente en cualquier GPU de consumo de los últimos años, e incluso en un Jetson Orin para despliegue embebido sobre el robot.
- **Despliegue:** LeRobot es la vía natural (carga directa del checkpoint desde el Hub). No se documentan integraciones con vLLM, TGI o llama.cpp, que además no aplican a una política robótica; llama.cpp no soporta este formato de modelo.
- **Latencia y throughput:** no publicados. La restricción operativa conocida es que el chunk cubre 3 segundos de trayectoria a 30 fps y se replanifica cada 30 pasos, es decir, una inferencia por segundo aproximadamente, lo que deja margen amplio incluso en hardware modesto.

## Comparativa con modelos similares

Comparación con las otras variantes del mismo autor y tarea (SO-101, pick, ACT), usando el mejor checkpoint de cada una:

| Modelo | Parámetros | Episodios | Error offline (mejor ckpt) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act-pick-v3-1piece-12000 (este) | 51,66 M | 292 | 15,86 (en 12k; 15,47 en 9,6k) | Apache 2.0 | Público en HF |
| act-pick-v3-1piece-9600 | no disponible (misma arquitectura) | 292 | 15,47 | Apache 2.0 | Público en HF |
| act-pick-v3-6000 ("super") | no disponible | 398 | 15,16 | Apache 2.0 | Público en HF |
| act-pick-v3-strict-2400 | no disponible | 205 | 15,14 | Apache 2.0 | Público en HF |
| act-pick-v3-chunk60-4800 | no disponible | 331 | 11,94 (línea base propia 16,23) | Apache 2.0 | Público en HF |

Advertencia del propio autor: el error offline no permite determinar qué modelo agarra mejor, y ninguno se ha probado sobre el robot. Para una comparación con políticas de otras familias (Diffusion Policy, π0, OpenVLA) no hay datos en la información proporcionada.

## Limitaciones y advertencias

- **No validado en robot real:** ninguna variante de esta familia se ha ejecutado sobre el SO-101 físico; todo el rendimiento reportado es offline.
- **La métrica offline no predice el éxito de agarre:** el error articular absoluto medio no distingue si la pinza sujeta bien la pieza.
- **Este checkpoint no es el mejor de su ejecución:** el de 9.600 pasos obtiene 15,47 frente a 15,86. Se publica únicamente por completitud.
- **Restringido a episodios de una sola pieza:** el entrenamiento filtra escenas que empiezan con exactamente una pieza; el rendimiento con dos piezas no está caracterizado (solo 4 episodios de dos piezas en el conjunto reservado, sin desglose de resultados).
- **Sobreajuste temprano:** el autor reporta que todas las ejecuciones empeoran tras aproximadamente una pasada sobre los datos, lo que limita el escalado ingenuo del entrenamiento.
- **Sesgos de dataset:** 292 episodios recogidos en sesiones y condiciones concretas, con hueco inicial de hasta 30 grados y hasta 5 s de inactividad tolerada en los extremos; el modelo hereda esas condiciones de arranque.
- **Filtros de calidad laxos:** a diferencia de la variante "strict", admite datos de menor calidad, lo que se traduce en mayor error que las mejores variantes.
- **Sin capacidades de lenguaje ni razonamiento:** no hay tool calling, ni agentes, ni comprensión de instrucciones en lenguaje natural; la tarea está fijada en los pesos.
- **No transferible sin reentrenamiento:** está acoplado a la morfología del SO-101, a las seis articulaciones y a la disposición concreta de las dos cámaras.
- **Licencia:** Apache 2.0 permite uso comercial y modificación, pero el modelo no incluye garantías ni datos de entrenamiento publicados en la información disponible.

## Enlaces

- HuggingFace: https://huggingface.co/IkerAzurmendi/act-pick-v3-1piece-12000
- Repositorio relacionado citado por el autor: `act-pick-v3-1piece-9600`
- Repositorio relacionado citado por el autor: `act-pick-v3-6000`
- Repositorio relacionado citado por el autor: `act-pick-v3-strict-2400`
- Repositorio relacionado citado por el autor: `act-pick-v3-chunk60-4800`
- Repositorio relacionado citado por el autor: `act-pick-v3-1-2-pieces-18000`
- Repositorio relacionado citado por el autor: `act-pick-v3-recent-12000`
- Repositorio relacionado citado por el autor: `act-pick-v2-6000`
- Paper, blog o demo: no disponible en la información proporcionada. La búsqueda web realizada no devolvió resultados relevantes sobre este modelo.
