# IkerAzurmendi/act-pick-v3-1-2-pieces-12000

## Resumen

`act-pick-v3-1-2-pieces-12000` es una política de imitación robótica basada en ACT (Action Chunking with Transformers) entrenada con la librería LeRobot para el brazo robótico de bajo coste SO-101. La desarrolla el usuario IkerAzurmendi y resuelve una tarea muy concreta: coger una pieza de una caja y sostenerla frente a la cámara. No es un modelo de lenguaje ni un VLA: no procesa texto, sino dos flujos de imagen (cámara frontal y cámara de muñeca) más las seis posiciones articulares del brazo.

El modelo tiene 51.658.374 parámetros (unos 0,2 GB de pesos en safetensors) y emite un *chunk* de 90 objetivos articulares futuros a 30 fps, es decir, 3 segundos de trayectoria por inferencia. Se re-planifica cada 30 pasos de acción, de forma que una única pasada hacia delante cubre un segundo de ejecución del robot.

El checkpoint publicado corresponde al paso 12.000 de un entrenamiento de 30.000 pasos, y el propio autor indica explícitamente que no es el mejor de su ejecución (el mejor es el de 18.000 pasos): se publica por completitud. Su interés es, por tanto, como referencia reproducible de una receta de entrenamiento y como punto de partida para *fine-tuning*, no como modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación visión-lenguaje-acción sin componente lingüístico |
| Parametros totales | 51.658.374 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no aplica; ventana de observación de un frame por cámara (frontal y muñeca) más 6 posiciones articulares, con horizonte de acción de 90 pasos (3 s a 30 fps) |
| Tipos de cuantizacion | no disponible; el repositorio solo contiene pesos en safetensors sin variantes cuantizadas publicadas |
| Idiomas soportados | no aplica (política robótica; no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio de 0,2 GB) |
| Libreria / pipeline | lerobot / robotics |
| Tarea | "pick a piece from the crate and hold it up to the camera" sobre SO-101 |
| Entradas | cámara frontal, cámara de muñeca, 6 posiciones articulares |
| Salidas | chunk de 90 objetivos articulares a 30 fps |
| Frecuencia de control | 30 fps; re-planificación cada 30 pasos de acción |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es una política de imitación que predice bloques de acciones futuras en lugar de acciones individuales, lo que reduce el error de acumulación del comportamiento y suaviza las trayectorias. En este caso el *chunk* es de 90 objetivos articulares, con 30 acciones ejecutadas por cada re-planificación. La model card no detalla la configuración interna de la red (número de capas, dimensión de los *tokens*, uso del latente CVAE propio de la familia ACT), por lo que esos extremos quedan como no disponibles.

Los datos de entrenamiento son 331 episodios a 30 fps, de 5 a 15 segundos, con una o dos piezas en la caja al inicio. El filtrado aplicado es explícito: hueco inicial de como máximo 20 grados, como mucho 3 segundos de inactividad en cualquiera de los extremos, la pinza debe abrirse al menos una vez y se han eliminado las tomas defectuosas conocidas. La receta es la función `train()` de LeRobot con batch 8, chunk 90, 30 pasos de acción por re-planificación, aumento de imagen por defecto y semilla 1000. No se menciona RLHF, DPO ni ningún ajuste por refuerzo: es imitación supervisada pura sobre demostraciones de teleoperación.

## Capacidades

- Manipulación robótica de una sola tarea: coger una pieza de una caja y sostenerla frente a la cámara, sobre un SO-101.
- Control articulado de 6 grados de libertad con predicción de trayectorias de 3 segundos (90 pasos a 30 fps).
- Fusión de dos vistas (cámara frontal y cámara de muñeca) con el estado propioceptivo del brazo.
- Generalización limitada a una o dos piezas presentes en la caja al inicio del episodio.
- Ejecución a 30 fps con re-planificación cada 30 pasos, compatible con el bucle de control de LeRobot.
- No soporta *tool calling*, agentes, razonamiento multi-paso, matemáticas, código, visión general, audio ni modo *thinking*.
- Multilingüismo: no aplica.

## Casos de uso

- Punto de partida para *fine-tuning* en una celda robotizada real: al ser un checkpoint intermedio con receta documentada (chunk 90, batch 8, semilla 1000), sirve para reproducir el *baseline* antes de adaptar la política a piezas o posiciones nuevas.
- Referencia de comparación en experimentos de imitación: permite medir si una receta propia mejora el error absoluto medio de 15,89 sobre los mismos episodios de validación, con un *baseline* "quedarse quieto" de 20,71.
- Docencia y formación en robótica de bajo coste: el par SO-101 + LeRobot + ACT es un montaje económico y este checkpoint ilustra el flujo completo de entrenamiento y evaluación *offline*.
- Generación de datos sintéticos de trayectoria: las predicciones del *chunk* pueden usarse para pre-anotar episodios o para comparar distribuciones de acciones antes de teleoperar.
- Validación de infraestructura de inferencia en *edge*: con 51,66 M de parámetros cabe en una Jetson o en CPU, lo que permite probar el *pipeline* de captura de dos cámaras y publicación de comandos sin depender de GPUs de datacenter.
- Pruebas de regresión en un *harness* de evaluación *offline*: al estar publicado junto a otros checkpoints de la misma familia con el mismo conjunto de validación, sirve como caso de prueba para verificar que el *script* de evaluación reproduce los números reportados.
- No es adecuado para tareas de manipulación distintas de la descrita, ni para entornos con más de dos piezas, ni para objetos fuera de la distribución de entrenamiento.

## Benchmarks y rendimiento

Evaluación *offline* sobre 16 episodios reservados (12 de `so101-pick-cube_20261024_181939`, con una pieza, y 4 de `so101-pick-cube_20261024_144537`, con dos piezas). Métrica: error absoluto medio de las posiciones articulares sobre el *chunk* predicho (menor es mejor).

| Checkpoint del run | Error (MAE) | Mejora sobre baseline "quedarse quieto" (20,71) |
|---|---|---|
| 6.000 pasos | 15,86 | 23 % |
| **12.000 pasos (este modelo)** | **15,89** | **23 %** |
| 18.000 pasos | 15,35 | 26 % |
| 24.000 pasos | 15,73 | 24 % |
| 30.000 pasos | 16,38 | 21 % |

Comparación con el resto de ejecuciones de la misma ronda (mejor checkpoint de cada una):

| Run | Episodios de entrenamiento | Mejor checkpoint | Error | Mejora sobre baseline |
|---|---|---|---|---|
| super (todos los datos que pasan control de calidad) | 398 | 6k | 15,16 | 27 % |
| strict (6-12 s, calidad estricta) | 205 | 2,4k | 15,14 | 27 % |
| v3 sobre episodios de 1-2 piezas | 331 | 18k | 15,35 | 26 % |
| v2 (anterior) | 278 | 6k | 15,36 | 26 % |
| chunk 60 (baseline propio 16,23) | 331 | 4,8k | 11,94 | 26 % |
| solo una pieza | 292 | 9,6k | 15,47 | 25 % |
| solo sesiones recientes | 100 | 12k | 16,87 | 19 % |
| primera ejecución | 165 | 6k | 16,87 | 19 % |

Advertencias sobre estas cifras, tal como las señala el autor: los mejores checkpoints de las ejecuciones principales están dentro del ruido entre sí, todas las ejecuciones empeoran tras aproximadamente una pasada sobre los datos, y el error *offline* no permite predecir qué modelo agarra mejor. Ninguno de los modelos se ha probado en el robot real. El valor de 11,94 del run con chunk 60 no es directamente comparable porque su *baseline* es distinto (16,23 frente a 20,71).

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB. En fp32 los pesos ocupan unos 207 MB (51.658.374 × 4 bytes); en fp16/bf16, unos 103 MB. El resto del consumo lo determinan los dos flujos de cámara y las activaciones, no el modelo.
- GPU recomendadas: prácticamente cualquiera. Una RTX 4090 o A100 están sobredimensionadas para 51,66 M de parámetros; el objetivo realista es una GPU de consumo modesta (GTX 1650, RTX 3050) o una placa integrada.
- Cabe en GPU de consumo: sí, en cualquier GPU con 2 GB o más de VRAM. También es viable en CPU y en plataformas *edge* tipo Jetson Orin Nano o Raspberry Pi 5, aunque no se han publicado medidas de latencia en estos dispositivos.
- Opciones de despliegue: LeRobot (scripts de entrenamiento y de ejecución de políticas) sobre PyTorch. Exportación a ONNX Runtime para *edge* es posible al ser una red densa estándar, pero no está documentada en el repositorio. vLLM, TGI, llama.cpp y Ollama no aplican: no es un modelo generativo de texto.
- Latencia y throughput estimados: no disponibles. El requisito funcional es que una pasada de inferencia quepa en el periodo de re-planificación (30 pasos a 30 fps = 1 segundo por re-planificación), un margen muy holgado para este tamaño de red.

## Comparativa con modelos similares

No se conocen políticas públicas comparables fuera de la propia familia de checkpoints del autor, todos entrenados sobre el mismo conjunto y evaluados sobre los mismos 16 episodios reservados. La comparación relevante es interna:

| Modelo | Parametros | Episodios | Chunk | Error (MAE) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| act-pick-v3-1-2-pieces-12000 (este) | 51,66 M | 331 | 90 | 15,89 | apache-2.0 | público en HF |
| act-pick-v3-1-2-pieces-18000 | no disponible (misma arquitectura) | 331 | 90 | 15,35 | apache-2.0 | público en HF |
| act-pick-v3-6000 ("super") | no disponible | 398 | 90 | 15,16 | apache-2.0 | público en HF |
| act-pick-v3-strict-2400 | no disponible | 205 | 90 | 15,14 | apache-2.0 | público en HF |
| act-pick-v3-chunk60-4800 | no disponible | 331 | 60 | 11,94 (baseline propio 16,23) | apache-2.0 | público en HF |

Frente a enfoques genéricos de imitación como Diffusion Policy, no hay datos de benchmark comunes en la información disponible para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Es un checkpoint intermedio: el propio autor indica que el mejor de su ejecución es el de 18.000 pasos (15,35 de error) y que este se publica solo por completitud.
- No se ha evaluado en el robot real. Todas las métricas son *offline* (error de posición articular), y el autor advierte que ese error no predice la calidad del agarre.
- Tarea única y muy restringida: coger una pieza de una caja y sostenerla ante la cámara. No generaliza a otras tareas, objetos ni disposiciones.
- Distribución de entrenamiento estrecha: una o dos piezas, episodios de 5 a 15 s, hueco inicial máximo de 20 grados. Cualquier desviación (más piezas, orientaciones distintas, iluminación diferente) queda fuera de distribución.
- Sesgos conocidos: no hay análisis de sesgo publicado, pero al ser imitación de teleoperación hereda los sesgos cinemáticos del operador y de la disposición física concreta de la celda.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe el equivalente en políticas de imitación, que es la generación de trayectorias plausibles pero incorrectas cuando la observación se aleja de los datos, sin ninguna señal de confianza asociada.
- Restricciones de licencia: apache-2.0 permite uso comercial y modificación con atribución; no hay cláusulas de uso aceptable específicas publicadas.
- Caveat de producción: sin prueba en hardware, sin métricas de latencia reales y sin validación de seguridad física, no debe desplegarse en una celda con operarios humanos sin una capa de supervisión y parada de emergencia independiente.
- Idiomas y contexto lingüístico: no aplica, el modelo no procesa texto.

## Enlaces

- [IkerAzurmendi/act-pick-v3-1-2-pieces-12000 en HuggingFace](https://huggingface.co/IkerAzurmendi/act-pick-v3-1-2-pieces-12000)
- Checkpoints hermanos citados en la model card (URL construida a partir del namespace del autor, no verificada en la búsqueda): [act-pick-v3-1-2-pieces-18000](https://huggingface.co/IkerAzurmendi/act-pick-v3-1-2-pieces-18000), [act-pick-v3-6000](https://huggingface.co/IkerAzurmendi/act-pick-v3-6000), [act-pick-v3-strict-2400](https://huggingface.co/IkerAzurmendi/act-pick-v3-strict-2400), [act-pick-v3-chunk60-4800](https://huggingface.co/IkerAzurmendi/act-pick-v3-chunk60-4800), [act-pick-v3-1piece-9600](https://huggingface.co/IkerAzurmendi/act-pick-v3-1piece-9600), [act-pick-v3-recent-12000](https://huggingface.co/IkerAzurmendi/act-pick-v3-recent-12000), [act-pick-v2-6000](https://huggingface.co/IkerAzurmendi/act-pick-v2-6000)
- Paper, blog o repositorio adicionales: no disponible. La búsqueda web realizada no devolvió enlaces relevantes al modelo (los resultados correspondían a un marketplace de servicios freelance, sin relación con el proyecto).
