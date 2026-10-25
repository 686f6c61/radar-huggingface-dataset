# IkerAzurmendi/act-pick-v3-1piece-9600

## Resumen

`act-pick-v3-1piece-9600` es una política de imitación basada en ACT (Action Chunking Transformer) entrenada con LeRobot para el brazo robótico de bajo coste SO-101. Resuelve una tarea muy concreta: coger una pieza de una caja y sostenerla frente a la cámara. La política consume dos flujos de vídeo (cámara frontal y cámara de muñeca) más las seis posiciones articulares, y emite un chunk de 90 consignas articulares futuras a 30 fps, con replanificación cada 30 pasos.

El modelo cuenta con 51.658.374 parámetros y un repositorio de 0,2 GB en safetensors, lo que lo sitúa en la categoría de políticas ligeras que caben holgadamente en GPU de consumo. Se entrenó sobre 292 episodios (78.092 fotogramas a 30 fps, resolución 640x480) restringidos a secuencias que empiezan con exactamente una pieza en la caja, con filtros de calidad laxos. El checkpoint publicado corresponde al paso 9.600 de una ejecución de 12.000.

Su relevancia es doble: por un lado documenta una ablation sobre restricción de datos (un único objeto frente a varios), y por otro publica una evaluación offline honesta sobre episodios reservados, incluyendo una sesión con dos piezas que el modelo nunca vio. El autor advierte de que la política no se ha probado sobre el robot real y de que, para uso general, recomienda `act-pick-v3-6000`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer): política de imitación con encoder visual multi-cámara y decoder transformer que predice un chunk de acciones; el detalle de capas y dimensiones internas no se publica en la model card |
| Parametros totales | 51.658.374 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica en tokens; observación = 2 imágenes 640x480 (frontal y muñeca) + 6 posiciones articulares; horizonte de predicción = chunk de 90 acciones a 30 fps, con replanificación cada 30 pasos |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors, sin variantes cuantizadas |
| Idiomas soportados | no aplica: la política no procesa lenguaje natural y no declara idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un transformer de imitación supervisada que mapea observaciones (imágenes de dos cámaras y el estado articular) a un chunk de acciones futuras, en lugar de a una acción por paso. Esa predicción en bloque es lo que reduce el error acumulado y suaviza la ejecución: el modelo emite 90 consignas articulares de golpe y el bucle de control solo vuelve a inferir cada 30 pasos, de modo que un fallo puntual de inferencia no rompe la trayectoria. La entrada de estado son las seis posiciones articulares del SO-101 y la salida, seis consignas articulares por paso a 30 fps.

El entrenamiento se hizo con la función `train()` de LeRobot, batch 8, chunk 90, 30 pasos de acción por replanificación, learning rate 1e-5, augmentación de imagen por defecto y semilla 1000, hasta 12.000 pasos. El conjunto de datos son 292 episodios (78.092 fotogramas, 30 fps, 640x480): sesiones del 24 de octubre con una sola pieza más 5 episodios del 23 de octubre en los que quedaba una pieza. Los filtros aplicados son laxos: duración entre 3 y 20 s (el dataset construido conserva 5 a 20 s), desfase inicial entre líder y seguidor de como máximo 30 grados, como máximo 5 s de inactividad en cada extremo, error medio acción-estado de como máximo 8 grados, apertura del gripper al menos una vez y eliminación de tomas malas conocidas. Las sesiones con dos piezas y con muchas piezas quedaron fuera del entrenamiento. No se documenta RLHF, DPO ni ninguna fase de ajuste por preferencias.

## Capacidades

- Manipulación robótica de una sola tarea: coger una pieza de la caja y sostenerla frente a la cámara.
- Control visomotor con dos cámaras (frontal y de muñeca) más realimentación de las seis posiciones articulares.
- Generación de chunks de 90 acciones a 30 fps, lo que permite replanificar una vez por segundo en lugar de en cada paso de control.
- Generalización limitada al dominio entrenado: funciona con episodios que empiezan con una pieza y degrada cuando hay dos (ver benchmarks).
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, ni entrada o salida de texto.
- No tiene capacidades multilingües, de visión general, audio ni modo de razonamiento explícito.
- No se ha validado en el robot real, solo de forma offline sobre episodios reservados.

## Casos de uso

- **Manipulación de una pieza en laboratorio con SO-101**: la política cubre el ciclo completo de aproximación, cierre de gripper y elevación de la pieza hasta la cámara. Es adecuada porque se entrenó exactamente sobre esa secuencia con el mismo montaje de cámaras y el mismo brazo.
- **Base para fine-tuning con más variedad de objetos**: al estar entrenada solo con una pieza, sirve como punto de partida barato (51,6 M de parámetros) para adaptar la política a otras geometrías con un dataset pequeño, reduciendo el coste frente a entrenar desde cero.
- **Ablation de investigación sobre restricción de datos**: el autor ya la usa para medir si limitar el entrenamiento a un único objeto aporta ventaja; es un punto de comparación reproducible para estudiar sensibilidad a la composición del dataset.
- **Referencia de evaluación offline en robótica de imitación**: publica MAE sobre episodios reservados con baseline explícita (20,71 de "quedarse quieto"), lo que permite usarla como línea base metodológica en experimentos de evaluación sin robot.
- **Pruebas de despliegue del stack LeRobot en hardware de bajo coste**: al ocupar 0,2 GB y requerir dos cámaras USB, es útil para validar pipelines de captura, sincronización y bucle de control a 30 fps antes de invertir en modelos mayores.
- **Docencia y prácticas de aprendizaje por imitación**: el tamaño reducido y la receta completa (batch, chunk, lr, semilla, filtros) hacen viable reproducir el entrenamiento en una sola GPU en horas, no días.
- **Generación de datos sintéticos de trayectoria para inspección**: la secuencia de presentación de la pieza ante la cámara puede reutilizarse como paso previo a un pipeline de captura de imágenes etiquetadas.

## Benchmarks y rendimiento

Evaluación offline del autor sobre 16 episodios reservados: 12 de la sesión `so101-pick-cube_20261024_181939` (una pieza) y 4 de `so101-pick-cube_20261024_144537` (dos piezas). Métrica: error absoluto medio articular sobre el chunk predicho (menor es mejor), frente a la baseline de mantenerse en las posiciones articulares actuales (20,71).

| Checkpoint | Error MAE | Mejora sobre baseline |
|---|---|---|
| 2.400 pasos | 16,00 | 23 % |
| 4.800 pasos | 15,82 | 24 % |
| 7.200 pasos | 15,70 | 24 % |
| **9.600 pasos (este modelo)** | **15,47** | **25 %** |
| 12.000 pasos | 15,86 | 23 % |

Desglose por sesión en el paso 9.600:

| Sesión | Error MAE | Baseline | Observación |
|---|---|---|---|
| Una pieza (`..._181939`) | 15,36 | 20,29 | Empata con los mejores modelos de las otras ejecuciones (15,2 a 15,8) |
| Dos piezas (`..._144537`) | 16,06 | 22,09 | Peor que los modelos entrenados con ambas configuraciones; sesión no vista en entrenamiento |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K y similares) en la información disponible, ni evaluación sobre el robot real.

## Requisitos de hardware

- VRAM estimada: por debajo de 1 GB para los pesos en precisión completa (51,66 M de parámetros, repositorio de 0,2 GB); el consumo real lo dominan el runtime de PyTorch, la decodificación de dos cámaras 640x480 y el resto del pipeline de LeRobot, no la red.
- GPU recomendadas: cualquier GPU consumer reciente sirve (RTX 3060, 4060, 4090); tarjetas de datacenter como A100 o H100 son sobredimensionadas para este tamaño y solo se justifican si se comparten con otros procesos.
- Cabe en GPU de consumo y previsiblemente en CPU, aunque no hay mediciones publicadas de latencia en CPU.
- Opciones de despliegue: LeRobot (scripts de rollout e inferencia de la propia librería) sobre PyTorch. vLLM, TGI y Ollama no aplican porque no es un modelo de lenguaje; no se documenta exportación a ONNX ni a TensorRT.
- Presupuesto temporal: el bucle de control corre a 30 fps (33,3 ms por paso) y la red solo infiere una vez cada 30 pasos, es decir, aproximadamente un forward por segundo; aun así, el forward debe completarse dentro de esa ventana de 1 s para no bloquear el chunk en curso.
- Latencia y throughput medidos: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Horizonte de acción | Error MAE (offline) | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `act-pick-v3-1piece-9600` (este) | 51.658.374 | chunk 90, replan cada 30 | 15,47 global; 15,36 una pieza; 16,06 dos piezas | 292 episodios, solo inicio con una pieza | apache-2.0 | HuggingFace |
| `act-pick-v3-6000` | no disponible | no disponible | no disponible | no disponible | no disponible | Recomendado por el autor para uso general |
| Checkpoint 12.000 pasos de la misma ejecución | no disponible (misma receta) | chunk 90, replan cada 30 | 15,86 (23 % sobre baseline) | 292 episodios, solo una pieza | no disponible | No publicado como repo independiente en la información disponible |
| Modelos entrenados con una y dos piezas | no disponible | no disponible | 15,2 a 15,8 en una pieza; mejor que 16,06 en dos piezas | Mezcla de configuraciones | no disponible | No identificados por nombre en la model card |
| Baseline "mantener posiciones actuales" | 0 | ninguno | 20,71 | no aplica | no aplica | Referencia interna del autor |

## Limitaciones y advertencias

- **No validada en el robot real**: todas las cifras proceden de evaluación offline sobre episodios grabados; el comportamiento en ejecución (errores de percepción, latencia, fricción del hardware) no está medido.
- **Sesgo de composición del dataset**: solo se entrenó con episodios que empiezan con exactamente una pieza; con dos piezas el error sube a 16,06 frente a los modelos entrenados con ambas configuraciones.
- **La restricción a una pieza no aportó mejora medible**: el propio autor lo indica; no debe interpretarse este checkpoint como una mejora por ablación.
- **Sobreajuste al montaje**: la política asume la posición exacta de las cámaras frontal y de muñeca, la iluminación y la caja de las sesiones de octubre; cualquier cambio de calibración o de escena puede degradar la ejecución sin aviso.
- **Riesgo de alucinación en sentido robótico**: al predecir chunks de 90 acciones, un error de modo puede producir trayectorias plausibles pero incorrectas durante hasta 3 segundos antes de la siguiente replanificación; requiere límites de par, parada de emergencia y supervisión humana.
- **Dataset pequeño y filtros laxos**: 292 episodios y tolerancias de hasta 30 grados de desfase inicial y 8 grados de error medio acción-estado dejan ruido en las demostraciones.
- **Sin capacidades de lenguaje ni de propósito general**: no admite instrucciones en texto, tool calling ni generalización a tareas distintas de la entrenada.
- **Licencia**: apache-2.0 permite uso comercial y modificación, pero la licencia no cubre responsabilidades derivadas de un despliegue físico; en robótica real conviene evaluar el riesgo antes de operar sin supervisión.
- **Ausencia de cuantizaciones y de artefactos de despliegue**: solo hay safetensors; no hay versiones optimizadas ni exportaciones verificadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IkerAzurmendi/act-pick-v3-1piece-9600
- Modelo recomendado por el autor para uso general (`act-pick-v3-6000`): no se proporciona URL en la información disponible
- Paper de ACT, blogs, repositorios de código y demos: no disponibles en la información proporcionada
