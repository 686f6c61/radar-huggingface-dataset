# ImKyungjin/pi0-maniskill_liftpegupright_mixed30-convex-0.6

## Resumen

Este repositorio contiene un checkpoint de política robótica basado en π₀ (Pi0), el modelo Vision-Language-Action (VLA) de Physical Intelligence para control generalista de robots, en su implementación para LeRobot adaptada del repositorio abierto OpenPI. El modelo recibe observaciones visuales e instrucciones en lenguaje natural y produce acciones de control, en lugar de texto: es un modelo de política (policy) orientado a manipulación robótica, no un modelo de lenguaje conversacional.

El checkpoint concreto ha sido publicado por el usuario ImKyungjin y su nombre apunta a un ajuste fino sobre un dataset local de ManiSkill denominado `maniskill_liftpegupright_mixed30`, es decir, un conjunto de tareas de manipulación (levantar, encajar y enderezar objetos) en entorno simulado. Incorpora además un sufijo `convex-0.6` cuyo significado no se documenta en la información disponible.

Su relevancia es acotada y experimental: se trata de un modelo derivado de un pipeline de investigación (LeRobot), con licencia Apache-2.0, 3.501.372.176 parámetros reales reportados en los pesos safetensors y un tamaño de repositorio de 7,0 GB, pero sin descargas ni valoraciones en el momento de la consulta y sin resultados de evaluación publicados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) para control robótico; implementación LeRobot del modelo π₀ (OpenPI). Detalle interno de capas no disponible |
| Parametros totales | 3.501.372.176 (~3,5 mil millones), dato real de los safetensors |
| Parametros activos | No aplica / no disponible (no se reporta arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio se distribuye en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible (el campo de idiomas no está informado; el modelo acepta instrucciones en lenguaje natural, pero no se especifican idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Tamano del repositorio | 7,0 GB |
| Pipeline | robotics |
| Dataset de entrenamiento declarado | local/maniskill_liftpegupright_mixed30 |
| Fecha de creacion | 2026-09-15 (según metadatos del Hub) |

## Arquitectura y entrenamiento

La información disponible describe π₀ como un modelo Vision-Language-Action para control general de robots, desarrollado por Physical Intelligence y adaptado al ecosistema LeRobot a partir de su repositorio OpenPI. La premisa del modelo base es sustituir políticas robóticas especializadas por una política generalista que interpreta entradas visuales, entiende instrucciones en lenguaje natural y controla distintos robots en tareas diversas. La model card no detalla la composición interna de capas, el mecanismo de atención, la existencia de un experto de acción diferenciado ni la estrategia de decodificación.

Respecto al entrenamiento, el único dato concreto es el conjunto de datos empleado en este ajuste: `local/maniskill_liftpegupright_mixed30`, un dataset local (no público, en principio) asociado a tareas de manipulación tipo lift, peg y upright. No se indican el número de tokens o de trayectorias, la composición del dataset, ni si se aplicaron etapas de RLHF, DPO o aprendizaje por imitación explícito. Tampoco se documenta qué aporta la variante `convex-0.6` del nombre del repositorio.

## Capacidades

- Control robótico guiado por lenguaje: genera acciones de robot a partir de observaciones visuales e instrucciones en lenguaje natural.
- Política multi-tarea: el nombre del dataset sugiere entrenamiento sobre varias tareas de manipulación simultáneas (levantar, encajar y enderezar objetos) en el simulador ManiSkill, aunque el detalle no está documentado.
- Compatibilidad con el ecosistema LeRobot: se puede cargar como política (`--policy.path`) y ejecutar con `lerobot-record` sobre robots soportados, como el `so100_follower` que aparece en los ejemplos de la model card.
- Reentrenamiento y ajuste: el repositorio puede servir como punto de partida o referencia para pipelines de entrenamiento con `lerobot-train`.
- Soporte de tool calling / function calling: no aplica ni está documentado para este tipo de modelo.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se especifican idiomas soportados.
- Capacidades especiales (modo thinking, visión, audio): dispone de entrada visual por su naturaleza VLA; no se documenta audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en manipulación robótica simulada: usar el checkpoint como política de referencia para reproducir o comparar tareas de lift, peg y upright en el simulador ManiSkill, aprovechando que el dataset de entrenamiento apunta a ese entorno.
- Ajuste fino sobre dominios propios: partir de estos pesos y reentrenar con `lerobot-train` sobre un dataset propio de demostraciones para adaptar la política a un brazo o pinza distintos.
- Evaluación experimental de transferencia sim-a-real: desplegar el modelo sobre un robot real tipo SO-100 con `lerobot-record` para medir cuánto del comportamiento aprendido en simulación se conserva en hardware físico.
- Generación de datos y ampliación de datasets: emplear la política como generador de trayectorias candidatas en simulación para aumentar la cobertura de un dataset de manipulación antes de reentrenar.
- Docencia y formación en robótica con VLA: servir como ejemplo práctico y reproducible de extremo a extremo (carga de política, ejecución de episodios, registro de datos) en cursos de robótica o aprendizaje por imitación.
- Banco de pruebas para comparativas de políticas en LeRobot: integrarlo en una batería de evaluaciones junto a otras políticas de la librería (por ejemplo, ACT) para medir tasas de éxito por tarea y por número de episodios.
- Prototipado rápido de tareas de pick-and-place en entornos controlados: usar instrucciones en lenguaje natural para definir variantes de una tarea de agarre sin reescribir la política, siempre que el robot y el utillaje estén dentro de la distribución de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas por tarea ni comparaciones numéricas, y el repositorio registra 0 descargas y 0 valoraciones en el momento de la consulta, por lo que tampoco existen evaluaciones de terceros asociadas.

## Requisitos de hardware

- VRAM para inferencia: el repositorio pesa 7,0 GB y contiene 3.501.372.176 parámetros, de modo que los pesos en precisión de 16 bits ocupan aproximadamente 7 GB. Sumando activaciones del codificador visual y del módulo de acción, una estimación razonable se sitúa en el rango de 8 a 14 GB de VRAM, aunque no hay mediciones publicadas (dato estimado, no confirmado).
- GPU recomendadas para inferencia: NVIDIA RTX 3090 o RTX 4090 (24 GB) son suficientes con holgura según esa estimación; también serían viables tarjetas de 16 GB, sin confirmación oficial. Para entrenamiento completo, se requiere hardware de clase centro de datos: A100 (40/80 GB) o H100.
- Compatibilidad con GPU de consumo: sí, previsiblemente en modelos de 16 GB o más, dado el tamaño de pesos; no hay validación publicada en GPUs de gama media o baja.
- Entrenamiento y ajuste fino: el ajuste completo exige, además de los pesos, estados del optimizador y activaciones, por lo que se recomienda un mínimo de 40 a 80 GB de VRAM agregada (estimación).
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`, `lerobot-train` para entrenamiento) sobre PyTorch. No procede vLLM, TGI, Ollama ni llama.cpp, ya que no es un modelo de generación de texto y ese tooling no soporta políticas VLA.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se ha proporcionado información sobre modelos comparables en la documentación disponible, más allá de la referencia al modelo base π₀ de Physical Intelligence. La tabla siguiente recoge únicamente lo verificable.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este checkpoint (ImKyungjin/pi0-maniskill_liftpegupright_mixed30-convex-0.6) | 3,5 B (dato real de safetensors) | No disponible | apache-2.0 | HuggingFace, 0 descargas y 0 likes en la consulta |
| π₀ base (Physical Intelligence / OpenPI) | No disponible en la informacion proporcionada | No disponible | No disponible en la informacion proporcionada | Repositorio OpenPI y blog citados en la model card |
| Otras políticas de LeRobot (por ejemplo, ACT) | No disponible | No disponible | No disponible | Libreria LeRobot |

## Limitaciones y advertencias

- Modelo de robótica, no de lenguaje: no sirve para generación de texto, código ni preguntas y respuestas; su salida son acciones de control.
- Entrenamiento en simulación: el dataset declarado (`maniskill_liftpegupright_mixed30`) apunta a ManiSkill, por lo que es esperable una brecha sim-a-real no cuantificada. El comportamiento en hardware físico puede degradarse.
- Dataset no público: al tratarse de una ruta local, no hay garantía de reproducibilidad ni de trazabilidad de las demostraciones de entrenamiento, lo que dificulta auditar sesgos o cobertura de tareas.
- Sin evaluación publicada: 0 descargas y 0 likes, y ninguna métrica de éxito por tarea; no hay evidencia externa de su rendimiento.
- Nomenclatura sin documentar: el sufijo `convex-0.6` y el criterio de mezcla `mixed30` no se explican en la model card, lo que impide conocer su efecto real sobre la política.
- Idiomas no especificados: se desconoce en qué lenguas acepta instrucciones y con qué fiabilidad.
- Dependencia del robot y del utillaje: los ejemplos de la model card usan `so100_follower`; el rendimiento con otras plataformas o cámaras no está verificado.
- Licencia: Apache-2.0 permite uso comercial, pero conviene verificar la licencia y condiciones del modelo base π₀/OpenPI y del dataset de origen antes de desplegar en producción.
- Fecha de creación anómala en los metadatos (2026-09-15), que puede indicar un artefacto del Hub o un repositorio de prueba; conviene confirmarlo antes de integrarlo en cualquier pipeline.
- Sin cuantizaciones publicadas: no hay versiones GGUF, AWQ o GPTQ, por lo que el despliegue en hardware limitado requiere convertir y validar los pesos por cuenta propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ImKyungjin/pi0-maniskill_liftpegupright_mixed30-convex-0.6
- Blog de π₀ de Physical Intelligence: https://www.physicalintelligence.company/blog/pi0
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot en GitHub: https://github.com/huggingface/lerobot
- Repositorio OpenPI (referenciado en la model card, sin URL explícita en la información disponible): no disponible
