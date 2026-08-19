# Dimios45/yam-pick-duster-bspline-ee

## Resumen

`Dimios45/yam-pick-duster-bspline-ee` es un modelo de política de difusión B-spline (B-spline Policy) entrenado para que un brazo robótico YAM de un solo brazo realice la tarea de recoger un plumero (duster) mediante aprendizaje por imitación. Desarrollado por Dimios45, el modelo pertenece a la familia de diffusion policies aplicadas a robótica de manipulación, y se distribuye bajo licencia MIT.

El modelo emite poses cartesianas absolutas del efector final (posición, orientación en rot6d y apertura de pinza) a partir de observaciones de dos cámaras RGB (muñeca y vista superior) y del estado del brazo. Requiere un paso de cinemática inversa en el robot para convertir las acciones en comandos de articulación. Se entrenó sobre un conjunto de datos propio de 50 episodios (11 215 frames a 10 Hz) y está disponible en dos formatos de checkpoint: uno solo con pesos EMA para inferencia (426 MB) y otro completo con optimizador para reentrenamiento (1,5 GB).

La relevancia de este modelo radica en que permite comparar directamente espacios de acción (cartesiano frente a articular) sobre las mismas demostraciones, ya que existe una versión gemela en espacio articular (`Dimios45/yam-pick-duster-bspline-joint`). Además, al usar una parametrización B-spline de las trayectorias, reduce la frecuencia de replanificación frente a políticas de difusión convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet diffusion policy con salida B-spline (grado 3, chunk_size 10) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch checkpoint (`.ckpt`) |

## Arquitectura y entrenamiento

El modelo implementa una diffusion policy basada en UNet, con una salida que predice los puntos de control y el vector de nudos de una curva B-spline de grado 3. La acción bruta es un vector de 7 dimensiones `[pos(3), rotvec(3), gripper(1)]` que el dataset expande a 10 dimensiones `[pos(3), rot6d(6), gripper(1)]` mediante la conversión a rotación 6D. La red predice una secuencia de 16 pasos (columnas), donde la columna 0 corresponde al vector de nudos en unidades de frames a 10 Hz y las columnas 1–10 son los puntos de control.

El entrenamiento se realizó con 50 episodios (11 215 frames a 10 Hz), 601 épocas, batch de 64, optimizador AdamW con learning rate 1e-4, scheduler coseno con 500 pasos de warmup y EMA. El scheduler de difusión es DDIM con 100 timesteps de entrenamiento y 16 pasos de inferencia, con predicción de epsilon. La pérdida final en época fue de 0,00153. Se utilizó una sola GPU RTX 4090 durante aproximadamente 1,6 horas (9,2 s/época). El dataset de entrenamiento es `Dimios45/yam-pick-duster-ee`, cuyas poses se calcularon con MuJoCo y presentan una discrepancia conocida de hasta ~9 mm con el URDF de pyroki usado en despliegue.

## Capacidades

- Generación de trayectorias de movimiento del efector final para manipulación robótica, expresadas como poses cartesianas absolutas.
- Predicción de acciones de 10 dimensiones (posición 3D, orientación rot6d y apertura de pinza) a partir de observaciones visuales y propioceptivas.
- Control en tiempo real a 100 Hz mediante un servidor de brazo que resuelve cinemática inversa por velocidad.
- Procesamiento de dos cámaras RGB (muñeca y vista superior) a resolución 84×84, sin recorte (uncropped).
- Replanificación adaptativa: un chunk de 16 nudos cubre ~1,1 s a 10 Hz, lo que reduce la frecuencia de replanificación frente a políticas sin B-spline.
- Soporte de inferencia tanto en CPU como en GPU, con ajuste del parámetro `--predict-before-end` para evitar paradas entre chunks.

## Casos de uso

- Recogida de objetos en entornos de laboratorio: el modelo puede ejecutar la tarea de recoger un plumero de una superficie, siendo adecuado para experimentos de manipulación con brazos YAM.
- Investigación en aprendizaje por imitación: al comparar este modelo con su contraparte en espacio articular, se pueden estudiar los efectos del espacio de acción en la calidad y robustez de las políticas aprendidas.
- Desarrollo de políticas de difusión con salida B-spline: sirve como punto de partida para implementar y validar arquitecturas de diffusion policy con representación de trayectorias mediante curvas B-spline.
- Automatización de tareas repetitivas de pick-and-place en entornos controlados, donde la precisión posicional es suficiente y se puede tolerar un sesgo sistemático conocido.
- Evaluación de pipelines de despliegue en robótica: el flujo de rollout con `yam_server` y `rollout_local_policy.py` permite probar la integración de políticas aprendidas con control de bajo nivel a 100 Hz.
- Benchmarking de hardware de inferencia: al ser un modelo relativamente ligero (426 MB de pesos), es útil para medir latencias de inferencia en GPU o CPU en sistemas embebidos para robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la curva de pérdida de entrenamiento (de 0,829 en época 0 a 0,00153 en época 600), que no es comparable con otros modelos debido a diferencias en el espacio de acción, unidades y normalizador.

## Requisitos de hardware

- Entrenamiento: 1× RTX 4090 (24 GB VRAM) durante ~1,6 horas.
- Inferencia: el checkpoint de inferencia (`deploy_ema.ckpt`, 426 MB) puede ejecutarse en GPU o CPU. En GPU se recomienda `--predict-before-end 0.06`; en CPU, `0.3`.
- VRAM estimada: no disponible, pero al ser un modelo UNet de difusión con salida B-spline y entradas de 84×84, se espera que quepa en GPUs con 8 GB o más. No se han publicado mediciones exactas.
- GPU recomendadas: RTX 4090 (usada en entrenamiento), cualquier GPU moderna con al menos 8 GB para inferencia.
- Opciones de despliegue: el flujo oficial usa `yam_server.py` (servidor de brazo sobre CAN) y `rollout_local_policy.py` del repositorio `bspline-policy`. No aplican herramientas como vLLM u Ollama, propias de modelos de lenguaje.
- Latencia y throughput: no disponibles. El valor de `--predict-before-end` sugiere que la inferencia en CPU requiere ~0,3 s y en GPU ~0,06 s para mantenerse dentro del ciclo de control.

## Comparativa con modelos similares

| Modelo | Espacio de acción | Frecuencia de datos | Tamaño checkpoint | Requiere IK | Licencia |
|---|---|---|---|---|---|
| `yam-pick-duster-bspline-ee` (este) | Cartesiano (pos + rot6d + gripper) | 10 Hz | 426 MB (inferencia) | Sí | MIT |
| `yam-pick-duster-bspline-joint` | Articular | 25 Hz | no disponible | No | MIT |

La comparativa directa se limita al modelo gemelo en espacio articular, que comparte las mismas demostraciones pero opera en espacio de articulaciones, evitando la necesidad de cinemática inversa y la discrepancia MuJoCo/URDF. No se dispone de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Discrepancia cinemática conocida: las poses del dataset se calcularon con MuJoCo y difieren hasta ~9 mm del modelo URDF de pyroki usado en despliegue, lo que provoca un sesgo posicional sistemático. No es adecuado para manipulación fina sin resolver este desajuste.
- La cámara `top_image` debe cablearse manualmente en `real_env.get_obs`; si falta, se sustituye por un frame negro en silencio, lo que degrada la política sin error explícito.
- El parámetro `--origin-time-scale` debe fijarse en 10 para este modelo (frecuencia de datos 10 Hz). Usar 25 (como en el modelo articular) ejecuta el brazo a 2,5× la velocidad prevista.
- La convención de la pinza es 0 = abierta, 1 = cerrada; debe verificarse en hardware antes de usar.
- Las imágenes se entrenaron sin recorte (RAW 640×480 redimensionado a 84×84); reproducir exactamente este preprocesado en despliegue es obligatorio.
- No mezclar datos grabados con `yam_server` con este dataset sin resolver la discrepancia de frames.
- El modelo no es un LLM: no procesa lenguaje, no tiene capacidades de razonamiento simbólico ni de tool calling.
- La licencia MIT permite uso comercial, pero el usuario es responsable de verificar la seguridad del robot y cumplir las normativas aplicables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dimios45/yam-pick-duster-bspline-ee
- Dataset de entrenamiento: https://huggingface.co/datasets/Dimios45/yam-pick-duster-ee
- Modelo gemelo en espacio articular: https://huggingface.co/Dimios45/yam-pick-duster-bspline-joint
- Sitio del proyecto B-spline Policy: https://b-spline-policy.github.io/
- Paper asociado (referenciado en tags): arXiv:2607.09648 (no verificado)
