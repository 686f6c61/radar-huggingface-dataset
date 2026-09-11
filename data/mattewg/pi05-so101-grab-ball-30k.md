# mattewg/pi05-so101-grab-ball-30k

## Resumen

pi05-so101-grab-ball-30k es una política de manipulación robótica resultado de afinar por imitación el modelo base physical-intelligence/pi05_base (pi0.5) sobre un conjunto de datos de teleoperación de un brazo único SO-101. El modelo consume dos vistas de cámara (una fija de la mesa y otra en la muñeca) más el estado articular actual, y devuelve un bloque de 16 objetivos de articulación absolutos a 15 Hz para una única tarea: "Grab the ball". Lo publica el usuario mattewg bajo licencia Apache 2.0 y se integra en el ecosistema LeRobot/openpi.

Su relevancia es doble. Por un lado, demuestra el flujo completo de fine-tuning de un modelo visión-lenguaje-acción (VLA) de Physical Intelligence sobre hardware de bajo coste tipo SO-101, un brazo de código abierto habitual en laboratorios de robótica. Por otro, la propia model card documenta una limitación de comportamiento muy concreta —la política se bloquea en la pose de fin de episodio— que resulta útil como caso de estudio sobre cómo los sesgos del dataset de demostración condicionan el comportamiento aprendido.

Se trata de un modelo muy especializado y de alcance estrecho: no es un modelo de lenguaje general ni un VLA multitarea, sino un checkpoint entrenado con una única cadena de tarea. El repositorio ocupa 12,4 GB e incluye los pesos y las estadísticas de normalización necesarias para el servidor de inferencia. No se han publicado resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política visión-lenguaje-acción (VLA) basada en pi0.5; configuración `Pi0Config(pi05=True, action_dim=32, action_horizon=16)`. Detalle interno de capas no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible; el prompt de tarea es una cadena fija ("Grab the ball") |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la única cadena de tarea está en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | checkpoint de openpi (directorios `params/` y `assets/`); formato interno no especificado en la información disponible |

Parámetros adicionales de inferencia:

| Parametro | Valor |
|---|---|
| Entradas | `images.fixed` (uint8 HxWx3 RGB), `images.handeye` (uint8 HxWx3 RGB), `state` (float32, 6), `prompt` (string) |
| Salida | `actions` (float32, 16x6) |
| Horizonte de acción | 16 pasos |
| Frecuencia de acción | 15 Hz (un bloque cubre ~1,07 s) |
| Dimension de acción | 32 (config), 6 articulaciones efectivas |
| Orden de articulaciones | `shoulder_pan`, `shoulder_lift`, `elbow_flex`, `wrist_flex`, `wrist_roll` (grados), `gripper` (0-100) |
| Normalizacion | cuantiles q01/q99 -> [-1, 1] |
| Tamano del repo | 12,4 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura pi0.5 de Physical Intelligence, un enfoque VLA que combina percepción visual, una instrucción textual y el estado propioceptivo del robot para producir acciones motoras. En este caso la configuración concreta es `Pi0Config(pi05=True, action_dim=32, action_horizon=16)`. El detalle de la pila de transformadores, la cabeza de acciones y el mecanismo exacto de generación de acciones no se especifica en la información disponible, por lo que no se detalla aquí.

El entrenamiento se realizó mediante aprendizaje por imitación sobre el dataset Ibuprofene/grab_ball_2cam_v1, compuesto por 100 episodios y 68.458 fotogramas. Se ejecutaron 30.000 pasos con batch 32, una tasa de aprendizaje con programación coseno desde un pico de 2,5e-5 hasta 2,5e-6 y 1.000 pasos de warmup. El entrenamiento se llevó a cabo en 4x A100-64GB usando FSDP sobre los 4 dispositivos, con una pérdida final de 0,00261. Las acciones se entrenan como deltas relativos al estado actual en las cinco articulaciones del brazo y de forma absoluta en la pinza; el servidor vuelve a sumar el estado antes de responder, por lo que la salida recibida es absoluta. Los datos originales se grabaron a 30 fps y se submuestrearon por 2 durante el entrenamiento, de ahí que el espaciado efectivo de las acciones sea de 15 Hz y no de 30.

## Capacidades

- Ejecución de una única tarea de manipulación: agarrar una pelota ("Grab the ball") con un brazo SO-101.
- Fusión de dos vistas de cámara (cámara fija de mesa y cámara de muñeca) más el estado articular de 6 grados de libertad.
- Generación de bloques de 16 acciones absolutas de articulación a 15 Hz, lo que permite control a nivel de troceado temporal.
- Control de las cinco articulaciones del brazo en grados y de la pinza en escala 0-100.
- No dispone de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso; es una política reactiva de una sola cadena de tarea.
- No dispone de capacidades multilingües ni de generación de texto libre.
- No dispone de modo de razonamiento (thinking mode), audio ni comprensión visual general más allá de las dos cámaras de control.

## Casos de uso

- Replicación autónoma de la tarea "Grab the ball" en un banco de laboratorio con brazo SO-101: el modelo recibe las dos cámaras y el estado actual y devuelve directamente las consignas articulares, por lo que puede cerrar el bucle de control a 15 Hz sin lógica adicional de planificación.
- Punto de partida para fine-tuning sobre nuevos datasets: al no incluir estado del optimizador, el checkpoint solo se puede arrancar en caliente (warm start), lo que lo hace adecuado como inicialización de nuevas políticas sobre el mismo robot y no como reanudación del entrenamiento original.
- Baseline de investigación en VLA de manipulación: sirve para comparar estrategias de imitación sobre un brazo de bajo coste, dado que la model card documenta configuración, hiperparámetros, hardware y pérdida final.
- Recolección de datos correctivos mediante DAgger: la limitación conocida de bloqueo en fin de episodio exige demostraciones de recuperación que comiencen desde esa pose, por lo que el modelo se usa para generar trayectorias que el operador corrige y reincorpora al dataset.
- Validación del pipeline openpi/LeRobot en un entorno real: útil para verificar que la versión de openpi, los ficheros de configuración de SO-101 y las estadísticas de normalización de `assets/` están correctamente alineados antes de escalar a otros experimentos.
- Docencia y prototipado en robótica: permite mostrar de extremo a extremo el ciclo teleoperación -> dataset -> fine-tuning -> despliegue en un único brazo, con una tarea corta y fácil de visualizar.
- Pruebas de latencia y despliegue de un VLA en hardware concreto: dado el tamaño del checkpoint, sirve para medir tiempos de inferencia y viabilidad de servir la política desde una o varias GPU antes de invertir en modelos más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El único dato cuantitativo de rendimiento en entrenamiento es la pérdida final de 0,00261 tras 30.000 pasos. No hay métricas de éxito de la tarea, ni comparaciones con otras políticas en el mismo dataset.

## Requisitos de hardware

- El entrenamiento se realizó en 4x A100-64GB con FSDP sobre 4 dispositivos; ese requisito es para entrenar o afinar, no necesariamente para inferir.
- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio ocupa 12,4 GB, por lo que se requiere al menos espacio para los pesos y sus buffers asociados; cualquier cifra concreta sería una estimación no confirmada.
- GPU recomendadas: no disponibles. El único dato documentado es el uso de A100-64GB durante el entrenamiento.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: servidor de políticas de openpi mediante `scripts/serve_policy.py`, en concreto `uv run scripts/serve_policy.py policy:checkpoint --policy.config=<config> --policy.dir=<ruta>`. El modelo se integra con la librería LeRobot. No se documentan despliegues en vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de política.
- Dependencias críticas: openpi en el commit `215abfb217dbac7d5f1273282331b9b1866c0479` más los ficheros de política/configuración de SO-101, que no están en el openpi upstream. Commits posteriores pueden haber cambiado el pipeline de transformaciones y producir acciones incorrectas de forma silenciosa.
- Latencia y throughput estimados: no disponibles. Se conoce la frecuencia de acción (15 Hz) pero no el tiempo de inferencia real del servidor.

## Comparativa con modelos similares

| Modelo | Relacion | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| pi05-so101-grab-ball-30k | Este modelo | no disponible | no disponible | "Grab the ball" en SO-101 | apache-2.0 | HuggingFace, repo de 12,4 GB |
| physical-intelligence/pi05_base | Modelo base del fine-tuning | no disponible | no disponible | VLA multitarea de propósito general (pi0.5) | no disponible en la informacion proporcionada | Pesos referenciados en `gs://openpi-assets/checkpoints/pi05_base/params` |
| Otras políticas VLA de manipulación (p. ej. OpenVLA, RDT, pi0) | Alternativas de categoría | no disponible | no disponible | Manipulación robótica | no disponible | no disponible |

La información proporcionada no incluye cifras de rendimiento, parámetros ni contexto de modelos competidores, por lo que no es posible establecer una comparación cuantitativa. La diferencia verificable frente a `pi05_base` es el dominio: el modelo aquí descrito está especializado en una única tarea y robot, mientras que la base es de propósito general.

## Limitaciones y advertencias

- Bloqueo en la pose de fin de episodio: las políticas pueden quedarse atascadas con el brazo arriba y la pinza cerrada, alrededor de `[25, -17, -79, 68, 36]` en el orden de articulaciones indicado. Todas las demostraciones terminan en esa pose y dejan de grabar, por lo que el dataset no contiene ejemplos de qué ocurre después y la política solo puede "mantener". Se necesitan demostraciones de recuperación que comiencen en esa pose; más pasos de entrenamiento no lo solucionan.
- Cámaras no intercambiables: mezclar `images.fixed` y `images.handeye` produce resultados incorrectos con alta confianza.
- Convención de unidades: el estado y las acciones usan grados para las cinco articulaciones y escala 0-100 para la pinza. Si el código de control usa el convenio de porcentaje de servo -100..100, hay que convertir antes.
- Frecuencia: los 16 pasos están espaciados a 15 Hz, no a 30. Reproducir a 30 Hz reduce a la mitad la velocidad prevista; hay que reproducir a 15 Hz o interpolar.
- Dependencia estricta de versión: se requiere openpi en el commit exacto indicado y ficheros de configuración de SO-101 ausentes en upstream. El uso de commits posteriores puede alterar el pipeline de transformaciones sin aviso.
- Estado del optimizador no incluido: el checkpoint admite arranque en caliente, pero no reanudar el entrenamiento.
- Sesgo de dataset: el modelo aprende de 100 episodios con una única cadena de tarea y un único operador, lo que limita la variabilidad y favorece el sobreajuste al entorno de grabación.
- Riesgo de alucinación motora: fuera de la distribución de posiciones, iluminación o colocación de la pelota, la política puede generar acciones plausibles pero incorrectas sin señal de incertidumbre.
- Idiomas: solo se ha entrenado con la cadena "Grab the ball" en inglés; no se ha documentado soporte para otras cadenas ni idiomas.
- Licencia: Apache 2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base pi05_base y del dataset, no detalladas en la información proporcionada.
- Metadatos de publicación: la fecha de creación indicada es 2026-09-10, posterior a la fecha de actualización de muchos entornos; conviene contrastarla con la fuente original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mattewg/pi05-so101-grab-ball-30k
- Dataset de entrenamiento: https://huggingface.co/datasets/Ibuprofene/grab_ball_2cam_v1
- Modelo base: https://huggingface.co/physical-intelligence/pi05_base
- Repositorio openpi: https://github.com/Physical-Intelligence/openpi
- Registro de entrenamiento en W&B: https://wandb.ai/mattewg_dev/SPELL/runs/5cyt5b56
- Los resultados de búsqueda web proporcionados no contienen enlaces relevantes para este modelo (corresponden a un comercio electrónico no relacionado).
