# IkerAzurmendi/act-pick-v3-recent-7200

## Resumen

`act-pick-v3-recent-7200` es una política de imitación basada en ACT (Action Chunking with Transformers) publicada por el usuario IkerAzurmendi para el robot de bajo coste SO-101. El modelo resuelve una tarea muy concreta: coger una pieza de una caja y mantenerla elevada frente a la cámara. Consume dos flujos de vídeo (cámara frontal y cámara de muñeca) más las seis posiciones articulares del brazo, y produce un bloque de 90 objetivos articulares futuros a 30 fps.

Se trata de la variante "v3 recent", entrenada únicamente con las sesiones recientes del conjunto de datos (100 episodios), con un presupuesto de 12.000 pasos de entrenamiento. El checkpoint publicado corresponde al paso 7.200, que no es el mejor de su ejecución (el mejor es el de 12.000 pasos, con error 16,87 frente a 17,00). El autor lo publica explícitamente "por completitud", lo que lo convierte en material de referencia para comparar recetas de entrenamiento más que en un modelo listo para producción.

La relevancia es acotada pero clara para quien trabaja en manipulación con hardware barato: el modelo ilustra el efecto del tamaño y la composición del dataset en ACT, con una comparación interna de ocho ejecuciones distintas y una métrica offline reproducible (error absoluto medio de las articulaciones sobre episodios reservados). No hay resultados de éxito en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): encoder visual + transformer con chunking de acciones para imitación |
| Parametros totales | 51.658.374 (~51,7 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; ventana de observación de 2 imágenes + 6 posiciones articulares, horizonte de acción de 90 pasos |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de robótica, sin entrada ni salida de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 0,2 GB) |
| Libreria / framework | LeRobot (`lerobot`) |
| Pipeline | robotics |
| Tarea | SO-101: coger una pieza de la caja y sostenerla frente a la cámara |
| Entradas | cámara frontal, cámara de muñeca, 6 posiciones articulares |
| Salidas | chunk de 90 objetivos articulares futuros |
| Frecuencia de control | 30 fps |
| Pasos de replanificacion | 30 |
| Checkpoint publicado | paso 7.200 de una ejecución de 12.000 |

## Arquitectura y entrenamiento

ACT es una política de imitación supervisada que combina un encoder de percepción (procesa las imágenes de las dos cámaras) con un transformer que predice secuencias de acciones en bloque en lugar de acciones individuales. El "action chunking" es la innovación central de esta familia: en vez de predecir un único vector de articulaciones por paso, el modelo emite los 90 objetivos siguientes de golpe, lo que reduce el error acumulado y suaviza la trayectoria. En esta implementación concreta el modelo tiene 51.658.374 parámetros y las etiquetas de entrenamiento son las seis posiciones articulares del SO-101 registradas a 30 fps.

Los datos de entrenamiento son 100 episodios grabados a 30 fps, con una o dos piezas por escena, restringidos a las sesiones del 24 de octubre desde las 16:58 en adelante (piezas colocadas en esquinas y a lo largo de los bordes) más las dos sesiones de la tarde. Se aplica el mismo filtro de calidad que en la ronda v3. La receta es la función `train()` de LeRobot con batch 8, chunk de 90, 30 pasos de acción por replanificación, aumento de imagen por defecto y semilla 1000. No se documenta en la información disponible el número total de tokens ni el uso de RLHF/DPO, algo que no aplica a una política de imitación de este tipo.

El autor reporta un hallazgo relevante para quien entrene modelos similares: todas las ejecuciones de esta ronda empeoraron tras aproximadamente una pasada sobre los datos, y los mejores checkpoints de las ejecuciones principales están dentro del ruido estadístico entre sí (errores entre 15,14 y 15,47).

## Capacidades

- Manipulación robótica de una sola tarea: coger una pieza de una caja y sostenerla frente a la cámara.
- Política visomotora multimodal: fusiona dos cámaras (frontal y de muñeca) con el estado propioceptivo de las 6 articulaciones.
- Predicción de secuencias de acción (chunking) de 90 pasos a 30 fps, con replanificación cada 30 pasos.
- Generalización limitada a variaciones de posición de la pieza dentro de la distribución de entrenamiento (esquinas y bordes de la caja).
- Funciona con una o dos piezas presentes en la escena.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: no es un modelo de lenguaje.
- No dispone de capacidades multilingües, de visión general, audio ni modo "thinking".

## Casos de uso

- **Celda de pick-and-place con SO-101**: desplegar el modelo como política de control en un brazo SO-101 equipado con cámara frontal y de muñeca, enviando los chunks de 90 articulaciones a 30 fps y replanificando cada segundo. Es adecuado porque la tarea y la morfología coinciden exactamente con los datos de entrenamiento.
- **Línea base para evaluar recetas de entrenamiento**: usar el error offline (17,00 sobre 16 episodios reservados) como referencia contra la que medir nuevas ejecuciones con distintos tamaños de dataset, chunks o filtros de calidad, tal como hace el propio autor con sus ocho variantes.
- **Docencia e investigación en imitation learning de bajo coste**: reproducir el pipeline completo de LeRobot con un robot de menos de 500 EUR, sirviendo el checkpoint como ejemplo funcional de ACT con action chunking y dos cámaras.
- **Servidor de políticas en bucle cerrado**: levantar el modelo como servidor de inferencia y conectarlo a un cliente que publique observaciones (imágenes + articulaciones) y reciba acciones; útil para medir latencia real de extremo a extremo en el robot antes de invertir en un modelo mayor.
- **Punto de partida para fine-tuning en tareas afines**: al tener solo 51,7 M de parámetros y 0,2 GB de pesos, se puede reentrenar o ajustar en una GPU de consumo con un dataset propio de recogida de objetos similares.
- **Pruebas de robustez ante posiciones de pieza**: al estar entrenado solo con piezas en esquinas y bordes, sirve para medir empíricamente la caída de rendimiento cuando la pieza aparece en el centro u orientaciones no vistas.
- **Validación de despliegue en hardware embebido**: por tamaño y requisitos de VRAM, es un candidato realista para ejecutar en Jetson Orin o similar en el propio robot, sin estación de trabajo externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (LIBERO, éxito de agarre en robot real, etc.) en la información disponible. El autor solo proporciona una comprobación offline sobre episodios reservados: error absoluto medio de las articulaciones sobre el chunk predicho (menor es mejor), con una línea base de "mantenerse en las posiciones articulares actuales" de 20,71. Los episodios reservados son 16: 12 de `so101-pick-cube_20261024_181939` (una pieza) y 4 de `so101-pick-cube_20261024_144537` (dos piezas).

| Checkpoint de esta ejecución | Error | Mejora sobre línea base |
|---|---|---|
| 2.400 pasos | 17,19 | 17 % |
| 4.800 pasos | 17,10 | 17 % |
| **7.200 pasos (este) | **17,00** | 18 % |
| 9.600 pasos | 17,10 | 17 % |
| 12.000 pasos | 16,87 | 19 % |

Comparación con los mejores checkpoints del resto de ejecuciones de la ronda v3:

| Ejecución | Episodios | Mejor checkpoint | Error | Bajo línea base | Repositorio |
|---|---|---|---|---|---|
| super (todos los datos que pasan calidad) | 398 | 6k | 15,16 | 27 % | act-pick-v3-6000 |
| strict (6-12 s, calidad estricta) | 205 | 2.4k | 15,14 | 27 % | act-pick-v3-strict-2400 |
| receta v3 sobre episodios de 1-2 piezas | 331 | 18k | 15,35 | 26 % | act-pick-v3-1-2-pieces-18000 |
| v2 (anterior) | 278 | 6k | 15,36 | 26 % | act-pick-v2-6000 |
| chunk 60 (línea base propia 16,23) | 331 | 4.8k | 11,94 | 26 % | act-pick-v3-chunk60-4800 |
| solo una pieza | 292 | 9.6k | 15,47 | 25 % | act-pick-v3-1piece-9600 |
| solo sesiones recientes | 100 | 12k | 16,87 | 19 % | act-pick-v3-recent-12000 |
| primera ejecución | 165 | 6k | 16,87 | 19 % | act-pick-* |

Advertencia del propio autor: el error offline no indica qué modelo agarra mejor y ninguno de ellos se ha probado en el robot.

## Requisitos de hardware

- **VRAM estimada**: los 51,66 M de parámetros ocupan aproximadamente 207 MB en fp32 y 103 MB en fp16; con activaciones de dos cámaras y el decodificador de 90 pasos, el consumo real esperado se sitúa por debajo de 1-2 GB de VRAM (estimación, no publicada por el autor).
- **GPU recomendadas**: cualquier GPU con más de 4 GB es suficiente; RTX 3060, RTX 4090, A100 o H100 no aportan ventaja por tamaño, solo por latencia.
- **GPU de consumo**: sí, cabe holgadamente en cualquier GPU de consumo e incluso en iGPU; también es viable en CPU para inferencia puntual, aunque el bucle a 30 fps exige comprobar latencias.
- **Hardware embebido**: candidato razonable para Jetson Orin Nano o similar montado en el propio robot; no hay mediciones publicadas.
- **Opciones de despliegue**: LeRobot (`lerobot`) como librería nativa; exportación a ONNX o TorchScript factible por tratarse de un transformer pequeño; no se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama, que no aplican a un modelo de robótica.
- **Latencia y throughput**: no disponibles. Como referencia de diseño, el modelo debe producir un chunk de 90 acciones (3 segundos de trayectoria a 30 fps) y se replanifica cada 30 pasos (1 segundo), lo que fija el presupuesto de inferencia en menos de 1 segundo por chunk para operar en tiempo real.
- **Almacenamiento**: 0,2 GB de repositorio; irrelevante frente a cualquier requisito actual.

## Comparativa con modelos similares

La única comparación con datos disponibles es interna, contra los demás checkpoints de la misma ronda del autor. Todos comparten arquitectura ACT y licencia Apache 2.0.

| Modelo | Parámetros | Episodios de entrenamiento | Error offline | Repositorio |
|---|---|---|---|---|
| act-pick-v3-recent-7200 (este) | 51,66 M | 100 | 17,00 | 0,2 GB |
| act-pick-v3-recent-12000 | 51,66 M (misma arquitectura) | 100 | 16,87 | no disponible |
| act-pick-v3-6000 (super) | 51,66 M (misma arquitectura) | 398 | 15,16 | no disponible |
| act-pick-v3-strict-2400 | 51,66 M (misma arquitectura) | 205 | 15,14 | no disponible |
| act-pick-v3-chunk60-4800 | 51,66 M (misma arquitectura, chunk 60) | 331 | 11,94 (línea base propia 16,23) | no disponible |

No se dispone de comparación con políticas de otras familias (p. ej. Diffusion Policy, VQ-BeT u OpenVLA) en la información proporcionada; los resultados no serían comparables sin una evaluación común en robot real.

## Limitaciones y advertencias

- **No evaluado en robot real**: el propio autor indica que ninguno de los checkpoints se ha probado en el SO-101; el error offline no correlaciona necesariamente con el éxito de agarre.
- **Checkpoint no óptimo**: es el paso 7.200 de una ejecución cuyo mejor checkpoint es el 12.000 (error 16,87). Se publica por completitud, no como versión recomendada.
- **Dataset muy pequeño y estrecho**: 100 episodios de una sola sesión de grabación, con piezas situadas en esquinas y bordes. La generalización a posiciones centrales, otras cajas, otras piezas u otras condiciones de iluminación es una incógnita.
- **Sobreajuste temprano**: todas las ejecuciones de la ronda empeoraron tras aproximadamente una pasada sobre los datos; el entrenamiento más allá de ese punto no aporta mejoras medibles.
- **Una única tarea y una única morfología**: la política está acoplada al SO-101, a su configuración de dos cámaras y a la tarea "coger y sostener". No es reutilizable fuera de ese montaje sin reentrenar.
- **Requisito de percepción**: necesita cámara frontal y de muñeca funcionando con la misma resolución, encuadre y frecuencia que en la grabación; cualquier cambio en el montaje invalida las predicciones.
- **Métrica limitada**: el error absoluto medio de articulaciones se mide contra una línea base trivial ("quedarse quieto") y no distingue entre trayectorias plausibles y trayectorias seguras.
- **Riesgo de alucinación equivalente**: en robótica se traduce en acciones fuera de distribución que pueden provocar colisiones o movimientos bruscos; requiere límites de par, parada de emergencia y espacio de trabajo despejado.
- **Licencia**: Apache 2.0 permite uso comercial y modificación, pero el modelo se distribuye sin garantías y el usuario asume todo el riesgo de despliegue físico.
- **Sesgos**: no evaluados. Al proceder de un único operador y una única sesión de recogida de datos, es esperable que reproduzca los sesgos cinemáticos y de estilo de ese operador.
- **Sin soporte multilingüe ni de texto**: no puede usarse como asistente conversacional ni para tareas de lenguaje.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IkerAzurmendi/act-pick-v3-recent-7200
- Repositorios hermanos citados en la model card (bajo el mismo autor): `act-pick-v3-recent-12000`, `act-pick-v3-6000`, `act-pick-v3-strict-2400`, `act-pick-v3-1-2-pieces-18000`, `act-pick-v3-chunk60-4800`, `act-pick-v3-1piece-9600`, `act-pick-v2-6000`, `act-pick-*` (prefijo `https://huggingface.co/IkerAzurmendi/`).
- LeRobot (librería y receta `train()`): https://github.com/huggingface/lerobot
- No se han encontrado en la búsqueda web enlaces relevantes al modelo, al paper de ACT ni a demos; los resultados devueltos no guardan relación con el contenido de esta ficha.
