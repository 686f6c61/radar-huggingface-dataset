# greecree/microduck-tug-of-war-tug-leader-v2

## Resumen

`greecree/microduck-tug-of-war-tug-leader-v2` no es un modelo de lenguaje, sino una política de control para el robot cuadrúpedo/reloj de cuerda Microduck de Pollen Robotics (filial francesa de Hugging Face, robot comercializado a 399 USD desde agosto de 2026). Se trata de un checkpoint de aprendizaje por refuerzo exportado a ONNX que implementa una política reactiva de tres capas (43→512→256→128→14) combinada con un controlador de residuo de acción indexado por estado, entrenada en MuJoCo mediante el framework `mjlab` para la tarea `Mjlab-TugOfWar-MicroDuck`.

El autor la describe como una política "perpetua": se carga en una ranura del daemon del robot con `robotctl policy load <slot> ...` y se ejecuta de forma continua a 50 Hz hasta que se detiene explícitamente. El normalizador de observaciones está embebido en el propio `policy.onnx`, de modo que el consumidor debe alimentar observaciones crudas. La tarea consiste en un tira y afloja (tug-of-war) con un componente de extracción de foso ("pit-extraction lunge"), refinado mediante CEM sobre snapshots de MuJoCo.

Su relevancia es de nicho: es un artefacto de investigación reproducible (código, `uv.lock`, semilla y commit documentados) para quien trabaje con el ecosistema microduck, no un modelo de propósito general. El repositorio no tiene descargas ni likes, no declara licencia y se publicó y actualizó el mismo día, por lo que debe tratarse como material experimental sin validación externa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP reactiva de 3 capas (43→512→256→128→14) + controlador de residuo de acción indexado por estado; lazo cerrado híbrido; exportada a ONNX |
| Parámetros totales | No publicado en la model card. Por las dimensiones declaradas, del orden de 1,9×10^5 (~0,19 M) incluyendo sesgos (cálculo derivado, no confirmado por el autor) |
| Parámetros activos | No aplica (no es un modelo MoE; se ejecuta la red completa en cada paso) |
| Longitud de contexto | No aplica. La observación es de 61 dimensiones por paso y produce 14 acciones a 50 Hz; no hay ventana de tokens |
| Tipos de cuantización | No disponible. Se distribuye un único `policy.onnx` sin variantes cuantizadas declaradas |
| Idiomas soportados | No aplica (modelo de control motor, no de lenguaje); el campo de idiomas del repo está vacío |
| Licencia | No disponible (sin licencia declarada en el repositorio) |
| Formato de pesos | ONNX (`policy.onnx`, con normalizador embebido) + `manifest.json` conforme al schema 2 del manifiesto de políticas de microduck |
| Entrada / salida | Observación de 61 dimensiones (la capa de entrada del grafo declarada es de 43) / 14 acciones continuas |
| Frecuencia de control | 50 Hz |
| Librería / pipeline | `microduck` / `robotics` |
| Tamaño del repositorio | 0,0 GB según el Hub (por debajo de 0,1 GB) |

## Arquitectura y entrenamiento

La política es una MLP puramente reactiva: no hay memoria recurrente ni mecanismo de atención, de modo que cada decisión depende únicamente de la observación del instante. Sobre esa base, el autor añade un controlador de residuo de acción indexado por estado, que corrige la salida de la MLP en función del estado, y una maniobra de impulso alto hacia atrás para la extracción del foso. El pipeline completo se describe como "RL en lazo cerrado híbrido + refinamiento de trayectoria en el borde del foso (v2)", con un refinamiento posterior mediante CEM (cross-entropy method) sobre snapshots de MuJoCo del episodio final. El entrenamiento se realizó con `mjlab-microduck 0.1.0` (commit `981a279c6`), tarea `Mjlab-TugOfWar-MicroDuck`, commit del repositorio de desafíos `4b675ebf4`, semilla 1 y checkpoint 250.

El comando de reproducción documentado usa 4096 entornos en paralelo y `--agent.max-iterations 1000`, con TensorBoard como logger y `--agent.run-name tug-leader-v1`. Conviene señalar dos inconsistencias de la model card: el nombre de ejecución remite a `v1` mientras el artefacto es `v2`, y el checkpoint publicado es el 250 frente a un máximo de 1000 iteraciones. El propio autor advierte de que el entrenamiento con RL en GPU no es reproducible bit a bit: la misma receta produce una política "comparable", no los mismos pesos. No se documentan número de tokens, composición del dataset (no aplica, es RL sobre simulación), ni uso de RLHF/DPO.

## Capacidades

- Control motor reactivo a 50 Hz sobre el robot Microduck: 61 dimensiones de observación cruda como entrada, 14 acciones continuas como salida.
- Política "perpetua": mantiene la marcha indefinidamente hasta que se le indica lo contrario, pensada para cargarse en una ranura de política del daemon.
- Normalización de observaciones integrada en el ONNX: el integrador no necesita replicar el preprocesado.
- Comportamiento específico de tira y afloja, con una maniobra de impulso hacia atrás para la extracción del foso descrita por el autor.
- Refinamiento de trayectoria en el borde del foso mediante CEM sobre snapshots de simulación.
- Empaquetado estándar del ecosistema (`onnx` + `manifest.json` schema 2), lo que facilita su carga con `robotctl`.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, generación de texto, código, matemáticas, visión ni audio: no es un modelo fundacional y carece de cualquier capacidad lingüística.
- No hay modo "thinking" ni capacidades multimodales declaradas.

## Casos de uso

- Investigación en tira y afloja robótico: cargar la política en un Microduck y enfrentarla a otra política o a un oponente controlado para estudiar estrategias de tracción y extracción de foso en hardware real.
- Docencia y talleres de aprendizaje por refuerzo: el flujo `git clone` + `uv sync` + `uv run train` con semilla y commit fijados sirve como ejemplo completo de entrenamiento de una política de robótica, desde la simulación hasta el despliegue en el robot.
- Reproducción y auditoría de experimentos: el autor documenta commit, `uv.lock`, semilla y checkpoint, lo que permite repetir la receta y comparar la política resultante con la publicada (asumiendo variación por no determinismo en GPU).
- Pruebas de integración del daemon microduck: al ser un artefacto pequeño con manifiesto schema 2, resulta útil para validar el flujo `robotctl policy load <slot>` y el pipeline de ranuras de política en CI o en un banco de pruebas.
- Demostraciones en ferias y eventos: el comportamiento continuo y autónomo de la política encaja en demostraciones de larga duración sin intervención, con parada manual.
- Estudio de control reactivo sin memoria: como línea base de MLP pura (sin recurrencia ni atención) para comparar con políticas con memoria en la misma tarea.
- Evaluación del gap simulación-real: desplegar la política entrenada en MuJoCo sobre el robot físico permite medir la degradación de comportamiento fuera del simulador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recompensa, tasa de éxito en la tarea, robustez ante perturbaciones ni comparación con otras políticas. Tampoco hay datos de latencia o throughput medidos en hardware.

## Requisitos de hardware

- VRAM para inferencia: prácticamente nula. Con ~0,19 M de parámetros y un repositorio por debajo de 0,1 GB, la inferencia puede ejecutarse en CPU sin GPU dedicada.
- GPU recomendadas: no se requiere GPU para servir la política. Para reentrenarla, el comando documentado usa 4096 entornos en paralelo, lo que exige una GPU de datacenter o de gama alta; el modelo concreto no se especifica en la información disponible.
- Cabe en cualquier GPU de consumo e incluso en hardware embebido: el presupuesto temporal es de 20 ms por paso (50 Hz) y una MLP de este tamaño en CPU queda muy por debajo de ese umbral (no hay mediciones publicadas que lo confirmen).
- Opciones de despliegue: el daemon microduck mediante `sudo robotctl policy load <slot> greecree/microduck-tug-of-war-tug-leader-v2`, o cualquier runtime de ONNX (por ejemplo, ONNX Runtime) para ejecutarla en un PC junto a un simulador.
- No aplican servidores de inferencia de LLM (vLLM, TGI, llama.cpp, Ollama): el artefacto es una política de control, no un modelo generativo de texto.
- Latencia y throughput estimados: no disponibles. Como referencia teórica, el presupuesto del lazo de control es de 20 ms por paso a 50 Hz.

## Comparativa con modelos similares

No se han identificado políticas comparables con datos públicos en la información disponible. La comparación se limita a categorías:

| Criterio | Esta política (tug-leader-v2) | Otras políticas de microduck en el Hub | Políticas RL de locomoción de referencia |
|---|---|---|---|
| Parámetros | ~0,19 M (derivado) | No disponible | No disponible |
| Entrada / salida | 61-D obs. / 14 acciones a 50 Hz | No disponible | No disponible |
| Tarea | Tira y afloja con extracción de foso | No disponible | Locomoción genérica |
| Formato | ONNX + manifest schema 2 | No disponible | Habitualmente ONNX o JIT |
| Licencia | No declarada | No disponible | No disponible |
| Métricas publicadas | Ninguna | No disponible | No disponible |
| Disponibilidad | Repositorio público, 0 descargas | No disponible | No disponible |

## Limitaciones y advertencias

- Licencia no declarada: no hay autorización explícita de uso comercial. Cualquier uso en producto requiere contactar con el autor para aclarar los términos.
- Sin validación externa: 0 descargas y 0 likes en el momento de la consulta; el repositorio se creó y actualizó el mismo día (27 de octubre de 2026), con tres segundos de diferencia entre ambos eventos.
- Ausencia total de métricas: no hay evidencia publicada de que la política funcione en hardware real ni de su tasa de éxito en la tarea.
- Discrepancia de dimensiones: la model card describe una observación de 61 dimensiones pero declara una capa de entrada de 43. Hay que verificar el grafo ONNX y el normalizador embebido antes de desplegar.
- Especialización extrema: está entrenada para un embodiment concreto (Microduck) y una tarea concreta (tira y afloja con foso). No es reutilizable en otros robots ni en otras tareas sin reentrenar.
- Gap simulación-real no documentado: el entrenamiento se realizó en MuJoCo (`mjlab`) y no se reporta ninguna evaluación en el robot físico.
- No determinismo: el autor advierte de que reentrenar con la misma semilla produce una política comparable pero no idéntica, lo que dificulta la auditoría exacta de resultados.
- Inconsistencias de trazabilidad: el `run-name` del comando de reproducción es `tug-leader-v1` y el checkpoint publicado es el 250 frente a un máximo de 1000 iteraciones.
- Seguridad física: la política incluye una maniobra de "impulso alto hacia atrás" para la extracción del foso; conviene operar el robot en un espacio despejado y con parada de emergencia accesible.
- Sin soporte lingüístico ni multimodal: no puede emplearse para texto, código, visión ni interacción conversacional.
- Sesgos: no hay información sobre sesgos de comportamiento (por ejemplo, asimetrías de estrategia según el oponente) ni análisis de robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/greecree/microduck-tug-of-war-tug-leader-v2
- Repositorio del desafío y código de entrenamiento: https://github.com/green-creeper/microduck-challenges
- Repositorio del robot microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas (`docs/policy-manifest.md`, en el repositorio del daemon): no disponible como URL directa en la información proporcionada
- TechCrunch, "Hugging Face is selling a cute $399 open source duck robot, Microduck": https://techcrunch.com/2026/08/27/hugging-face-is-selling-a-cute-399-open-source-duck-robot-microduck/
- CNBC, "Hugging Face's new duck robot is selling fast. A Chinese chip powers it": https://www.cnbc.com/2026/09/01/hugging-faces-new-duck-robot-is-selling-fast-a-chinese-chip-powers-it.html
- PCMag, "Meet Microduck, a $399 Open-Source Robot That Can Learn New Tricks": https://www.pcmag.com/news/hugging-face-microduck-399-open-source-robot-that-can-learn-new-tricks
