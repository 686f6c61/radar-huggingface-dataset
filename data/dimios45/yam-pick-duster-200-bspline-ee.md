# Dimios45/yam-pick-duster-200-bspline-ee

## Resumen

El modelo `Dimios45/yam-pick-duster-200-bspline-ee` es una política de difusión basada en B-splines (B-spline Policy) entrenada sobre 200 demostraciones teleoperadas de un brazo robótico I2RT YAM que recoge un plumero azul y lo coloca en una caja roja. Desarrollado por Dimios45, este modelo pertenece a la categoría de *diffusion policies* para aprendizaje por imitación en robótica de manipulación. Su particularidad es que emite poses cartesianas absolutas del efector final, lo que requiere resolución de cinemática inversa (IK) en el robot para su ejecución.

La relevancia de este modelo radica en que forma parte de un par diseñado para comparar espacios de acción (cartesiano vs. articular) sobre las mismas demostraciones. El autor advierte explícitamente que el modelo en espacio articular (`yam-pick-duster-200-bspline-joint`) es el recomendado para despliegue, ya que las poses cartesianas presentan una discrepancia de calibración de hasta ~9 mm entre el FK de MuJoCo y el URDF de pyroki. Arquitectónicamente es una UNet de difusión con salida B-spline, entrenada con 401 épocas en una RTX 4090, con un checkpoint de inferencia de 426 MB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de difusión (Diffusion Policy) con B-spline, entrenada con DDIM |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control con ventana de observación fija: 2 imágenes 84x84 + estado del brazo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | .ckpt (PyTorch) |

## Arquitectura y entrenamiento

El modelo es una *diffusion policy* con backbone UNet que genera trayectorias B-spline. La entrada de observación consiste en dos imágenes RGB de 84x84 píxeles (cámara de muñeca y cámara superior, sin recortar, redimensionadas desde 640x480) junto con el estado del efector: posición TCP (3,), cuaternión xyzw (4,) y apertura de pinza (1,). La acción bruta es un vector de 7 componentes (posición 3D, rotación en rotvec 3D, pinza 1) que el dataset expande a 10 (posición 3D, rotación 6D, pinza 1). La salida de la red es un tensor de forma (16, 11): la columna 0 contiene el vector de nudos en unidades de frames a 10 Hz, y las columnas 1-10 los puntos de control.

El entrenamiento se realizó sobre 200 episodios (30.462 frames a 10 Hz, que generan 30.262 chunks B-spline) con 401 épocas, batch de 64, optimizador AdamW (lr 1e-4, coseno, 500 pasos de warmup) y EMA. Se usó DDIM con 100 timesteps de entrenamiento y 16 de inferencia, predicción de epsilon. El B-spline es de grado 3, con `chunk_size` 10, `max_error` 0.002 y nudos absolutos. La pérdida descendió de 0.408 (época 0) a 0.00157 (época 400). El hardware de entrenamiento fue una RTX 4090, con ~2.6 horas y 23 segundos por época.

## Capacidades

- Ejecución de tareas de *pick-and-place*: recoger un objeto (plumero) y colocarlo en un contenedor (caja roja) mediante control del efector final.
- Generación de trayectorias suaves y continuas gracias a la parametrización B-spline, con control explícito de la velocidad y aceleración.
- Control en tiempo real: a 10 Hz de frecuencia de datos, con latencia de inferencia de 45.8 ms en GPU (16 pasos DDIM) y 168.1 ms en CPU, lo que permite operar con margen sobre el ciclo de control.
- Aprendizaje por imitación: el modelo reproduce el comportamiento demostrado sin necesidad de ingeniería de recompensas ni planificación explícita.
- Comparación de espacios de acción: al emitir poses cartesianas absolutas, permite estudiar el efecto del espacio de acción en el rendimiento frente a su contraparte articular.
- No incluye capacidades de lenguaje, tool calling, agentes ni visión general; está especializado en la tarea concreta de manipulación con dos cámaras fijas.

## Casos de uso

- Automatización de líneas de montaje: el modelo puede integrarse en celdas robóticas para tareas repetitivas de recogida y colocación de piezas, siempre que se resuelva la discrepancia de calibración o se use el modelo articular.
- Investigación en aprendizaje por imitación: sirve como banco de pruebas para comparar espacios de acción (cartesiano vs. articular) sobre el mismo conjunto de demostraciones, con métricas de pérdida y latencia documentadas.
- Prototipado rápido de tareas robóticas: al estar entrenado con solo 200 demostraciones, permite validar flujos de captura de datos y entrenamiento en horas con una GPU de consumo.
- Benchmark de políticas de difusión: puede utilizarse como referencia para evaluar variantes de B-spline policy, hiperparámetros de DDIM o estrategias de aumento de datos en manipulación.
- Despliegue en entornos simulados: el modelo puede ejecutarse en MuJoCo u otros simuladores para validar trayectorias antes de pasar a hardware, siempre que se tenga en cuenta el error de FK.
- Formación y educación en robótica: al ser de código abierto (MIT) y con un pipeline reproducible, es útil para enseñar conceptos de *diffusion policies* y control basado en aprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (tipo MMLU, HumanEval, etc.) porque se trata de un modelo de control robótico, no de un modelo de lenguaje. La model card proporciona métricas de entrenamiento y latencia, que se resumen a continuación.

Pérdida de entrenamiento (MSE, menor es mejor):

| Época | Pérdida |
|---|---|
| 0 | 0.408 |
| 50 | 0.015 |
| 100 | 0.011 |
| 150 | 0.008 |
| 200 | 0.006 |
| 250 | 0.005 |
| 300-350 | 0.003 |
| 400 | 0.002 |
| final (en época) | 0.00157 |

Latencia de inferencia (batch 1, dos cámaras 84x84):

| Pasos DDIM | RTX 4090 | CPU (i9-13900K, 8 hilos) |
|---|---|---|
| 4 | 13.4 ms | 57.6 ms |
| 8 | 24.2 ms | 91.0 ms |
| 16 | 45.8 ms | 168.1 ms |

El autor indica que un chunk abarca ~1.1 s de tiempo real a 10 Hz, por lo que incluso 16 pasos en CPU dejan margen. No se proporcionan tasas de éxito en tareas físicas.

## Requisitos de hardware

- Inferencia en GPU: probada en RTX 4090, con latencia de 45.8 ms a 16 pasos DDIM. Se requiere al menos una GPU con ~2 GB de VRAM para el checkpoint EMA de 426 MB (estimación conservadora, no especificada por el autor).
- Inferencia en CPU: probada en i9-13900K con 8 hilos, 168.1 ms a 16 pasos. En un NUC-class se espera 2-3 veces ese valor, aún dentro del ciclo de 1.1 s.
- Entrenamiento: se usó una sola RTX 4090 (24 GB VRAM) durante ~2.6 horas. El checkpoint completo de 1.5 GB incluye optimizador y EMA, por lo que para reanudar entrenamiento se necesita VRAM suficiente para el modelo y el optimizador.
- Despliegue: compatible con el framework `bspline-policy` (PyTorch). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- El modelo requiere un brazo robótico YAM con servidor CAN (`yam_server.py`) y cámaras configuradas según el espacio de observación.

## Comparativa con modelos similares

| Modelo | Espacio de acción | Frecuencia de datos | Tamaño checkpoint | Requiere IK | Uso recomendado |
|---|---|---|---|---|---|
| `yam-pick-duster-200-bspline-ee` (este) | Cartesiano absoluto (pos + rot6d + pinza) | 10 Hz | 426 MB (EMA) | Sí | Comparación de espacios de acción; no desplegar sin resolver calibración |
| `yam-pick-duster-200-bspline-joint` | Articular (joint positions) | 25 Hz | no disponible | No | Despliegue en hardware (recomendado por el autor) |
| `yam-pick-duster-bspline-ee` (50 episodios) | Cartesiano absoluto | no especificado | no disponible | Sí | Versión anterior con menos datos, superada por el modelo de 200 |

No se dispone de comparación con otras *diffusion policies* (p. ej., Diffusion Policy original) en términos de rendimiento en tareas, ya que no hay datos públicos de benchmarks con los mismos criterios.

## Limitaciones y advertencias

- Discrepancia de calibración: las poses cartesianas del dataset provienen del FK de MuJoCo y difieren del URDF de pyroki hasta ~9 mm. El autor desaconseja desplegar este modelo a través de su trayectoria cartesiana sin resolver la discrepancia; recomienda usar el modelo articular o aplicar mitigaciones como `EEFollower` con bajo `mu`, `target_frame="tcp"` y *reach clamping*.
- Requiere cinemática inversa: al emitir poses absolutas del efector, el robot necesita un resolvedor de IK en tiempo real, lo que añade latencia y posibles errores.
- Dependencia de cámaras: si la cámara superior no está conectada o muerta, el código sustituye un frame negro sin lanzar error, resultando en una política "medio ciega" que puede fallar silenciosamente.
- Convención de pinza: gripper 0 = abierto, 1 = cerrado. El autor insta a verificar esta convención en el hardware antes de usar.
- Frecuencia de datos crítica: los nudos del B-spline están en unidades de frames a 10 Hz. Usar `--origin-time-scale` distinto de 10 (o copiar el valor de 25 del modelo articular) ejecuta el brazo a velocidad incorrecta.
- Sesgos y alucinación: al ser un modelo de control, no aplican sesgos lingüísticos, pero sí puede generar trayectorias no válidas si la observación difiere del dominio de entrenamiento (por ejemplo, cambios de iluminación o posición de la cámara).
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento en entornos de producción.
- Sin benchmarks de éxito en tareas físicas: no se publican tasas de éxito en el mundo real, solo pérdida de entrenamiento y latencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dimios45/yam-pick-duster-200-bspline-ee
- Dataset de entrenamiento: https://huggingface.co/datasets/Dimios45/yam-pick-duster-200-ee
- Modelo contraparte en espacio articular: https://huggingface.co/Dimios45/yam-pick-duster-200-bspline-joint
- Modelo previo de 50 episodios (cartesiano): https://huggingface.co/Dimios45/yam-pick-duster-bspline-ee
- Sitio del proyecto B-spline Policy: https://b-spline-policy.github.io/
- Paper asociado (referenciado en los tags): arxiv:2607.09648
