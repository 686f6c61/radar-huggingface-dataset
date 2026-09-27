# HSM1/pusht-franka-diffusion-policy

## Resumen

`HSM1/pusht-franka-diffusion-policy` es una política de robótica entrenada por imitación para la tarea Push-T: un brazo Franka Panda sostiene un palo y debe empujar un bloque en forma de T hasta una posición objetivo fija, todo ello dentro del simulador MuJoCo. El modelo no es un modelo de lenguaje ni un modelo generativo de propósito general, sino una política visomotora que consume dos imágenes de cámara (vista cenital y vista de muñeca, ambas de 96×96 píxeles) junto con el estado del robot, y produce como salida la posición `[x, y]` de la punta del palo sobre la mesa, expresada en metros y a una frecuencia de control de 10 Hz.

Técnicamente se trata de una Diffusion Policy implementada con la librería LeRobot de HuggingFace, concretamente la configuración `dp_image` y el checkpoint `050000`. La política emplea un proceso de difusión DDPM para modelar la distribución de acciones condicionada a las observaciones, un enfoque habitual en el aprendizaje por imitación moderno porque captura multimodalidad en las demostraciones (varias trayectorias válidas para una misma observación). El modelo tiene 89.102.566 parámetros (unos 89,1 millones), un tamaño muy reducido en comparación con modelos fundacionales, y el repositorio ocupa 0,4 GB.

Su relevancia es acotada pero clara: sirve como referencia reproducible de un *baseline* de difusión para Push-T en simulación, con datos de entrenamiento y condiciones físicas documentadas (`pusht_meta.json` guarda fps, definiciones de cámara, resolución de imagen y el XML de física). Con 0 descargas y 0 likes en el momento de la consulta, y sin licencia declarada, se trata de un artefacto de investigación más que de un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (DDPM) implementada en LeRobot, configuración `dp_image`, con codificación de dos vistas de imagen y del estado del robot |
| Parametros totales | 89.102.566 (~89,1 M) |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no disponible / no aplica: no es un modelo de lenguaje; la política consume un horizonte de observaciones (dos imágenes de 96×96 y el estado) para predecir acciones |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en safetensors y no se documentan variantes cuantizadas |
| Idiomas soportados | no disponible / no aplica (modelo de robótica, sin entrada ni salida de texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tarea | Push-T: empujar un bloque en forma de T hasta un objetivo fijo en forma de T con un palo |
| Entradas | `observation.images.overhead` (96×96), `observation.images.wrist` (96×96), `observation.state` |
| Salidas | posición de la punta del palo `[x, y]` sobre la mesa, en metros, a 10 Hz |
| Checkpoint | `050000` (configuración de entrenamiento `dp_image`) |
| Sampler por defecto | DDPM |
| Datos de entrenamiento | demostraciones teleoperadas con ratón en simulación |
| Tamano del repositorio | 0,4 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-27 |
| Ultima actualizacion | 2026-09-27 |

## Arquitectura y entrenamiento

La política sigue el paradigma de Diffusion Policy: en lugar de regresar directamente una acción, aprende a denoizar una muestra de ruido condicionada a las observaciones, de modo que la acción se genera mediante un proceso iterativo de difusión con DDPM como sampler por defecto. Las observaciones son de tipo visomotor —una imagen cenital y una imagen de muñeca de 96×96 píxeles cada una, más el vector de estado—, y la salida es de baja dimensionalidad: únicamente la posición `[x, y]` de la punta del palo en el plano de la mesa, comandada a 10 Hz. La configuración empleada en LeRobot es `dp_image`, orientada a políticas de difusión con entrada de imagen.

Los datos de entrenamiento son demostraciones humanas teleoperadas con ratón dentro del propio simulador, no datos reales ni trayectorias generadas por un planificador. La model card no especifica el número de demostraciones empleadas, el número de pasos de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de refinamiento posteriores (RLHF, DPO u otras), por lo que esos datos quedan como no disponibles. El repositorio incluye `pusht_meta.json`, que almacena los fps, las definiciones de cámara, la resolución de imagen y el XML de física de los datos de entrenamiento, lo que permite reproducir exactamente las condiciones del simulador. El artefacto se corresponde con el checkpoint `050000`, cuyo significado exacto (número de pasos de optimización) no se detalla en la información disponible.

## Capacidades

- Generación de comandos de control visomotor: a partir de dos imágenes y del estado del robot, predice la posición de la punta del palo sobre la mesa a 10 Hz.
- Aprendizaje por imitación: reproduce el comportamiento de demostraciones humanas teleoperadas, sin necesidad de un modelo del entorno ni de recompensas.
- Modelado multimodal de acciones: al ser una política de difusión, puede representar múltiples trayectorias válidas para una misma observación, algo que los regresores deterministas no capturan bien.
- Ejecución de una tarea de contacto y manipulación no prensil: empujar un objeto hasta una región objetivo, tarea que exige control de contacto y corrección continua.
- Reproducibilidad en simulación: gracias a `pusht_meta.json`, la política puede evaluarse en condiciones idénticas a las del entrenamiento (cámaras, resolución, física).
- No dispone de tool calling ni de function calling: no es un agente conversacional ni un modelo de lenguaje.
- No dispone de capacidades multilingües ni de procesamiento de texto.
- No dispone de modo de razonamiento explícito, visión general, audio ni otras capacidades multimodales más allá de las dos cámaras de la tarea.

## Casos de uso

- Comparativa de referencia para Push-T: la política puede utilizarse como *baseline* reproducible frente a nuevos métodos de aprendizaje por imitación, ya que la tarea, las cámaras, la resolución y la física están documentadas y la simulación es determinista en su configuración.
- Investigación en políticas de difusión: permite estudiar el efecto del número de pasos de difusión, del sampler (DDPM frente a otras alternativas) y del horizonte de predicción sobre la tasa de éxito, manteniendo fijo el resto del pipeline.
- Ablación de entradas sensoriales: al exponer por separado las vistas cenital y de muñeca y el vector de estado, sirve para medir la contribución de cada modalidad al rendimiento, por ejemplo evaluando qué ocurre al eliminar la cámara de muñeca.
- Generación de datos sintéticos y aumento de dataset: las trayectorias generadas por la política pueden usarse como datos adicionales para entrenar variantes, o para estudiar el fenómeno de *compounding error* en horizontes largos.
- Punto de partida para *sim-to-real*: es un candidato razonable para hacer *fine-tuning* sobre demostraciones reales con un Franka Panda, dado su tamaño reducido (89,1 M de parámetros) y su frecuencia de control de 10 Hz, adecuada para lazos de control de bajo coste computacional.
- Validación de infraestructura de despliegue robótico: por su tamaño, permite probar pipelines de inferencia (carga de safetensors, bucle de control a 10 Hz, preprocesado de imágenes) en hardware embebido o en una GPU de gama media antes de escalar a modelos mayores.
- Docencia y divulgación en robótica: es un ejemplo completo y ligero de aprendizaje por imitación con entrada de imagen, útil para cursos prácticos con MuJoCo y LeRobot.
- Evaluación de robustez ante perturbaciones: la escena puede modificarse (posición inicial del bloque, ruido en las cámaras) para medir la degradación de la política fuera de la distribución de entrenamiento.

## Benchmarks y rendimiento

| Sampler | Episodios evaluados | Criterio de éxito | Tasa de éxito |
|---|---|---|---|
| DDPM (por defecto en entrenamiento) | 50 | cobertura ≥ 90 % del objetivo durante 0,5 s | 82 % |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones numéricas con otras políticas. El único dato de rendimiento documentado es la tasa de éxito del 82 % sobre 50 episodios, medida con el criterio de cobertura del objetivo del 90 % durante 0,5 segundos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 89,1 M de parámetros, los pesos en fp32 ocupan aproximadamente 356 MB y en bf16/fp16 unos 178 MB. Sumando activaciones y los *buffers* de las dos imágenes de 96×96, el consumo real es de unos pocos cientos de megabytes. Son estimaciones derivadas del recuento de parámetros, no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; por ejemplo GTX 1650, RTX 3060, RTX 4090, A100 o H100. No se requiere hardware de centro de datos.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo de los últimos años, e incluso en CPU para inferencia a 10 Hz, aunque la latencia dependerá del hardware.
- Opciones de despliegue: la librería nativa es LeRobot sobre PyTorch. La model card no documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje y no aplicables a esta política). Tampoco se documenta exportación a ONNX o TensorRT en la información disponible.
- Latencia y throughput: la política está entrenada para operar a 10 Hz, es decir, un ciclo de control de 100 ms de presupuesto. No se especifica el número de pasos de difusión ni el tiempo de inferencia medido, por lo que la latencia real por paso no está disponible.
- Almacenamiento: el repositorio completo ocupa 0,4 GB, incluidos pesos y metadatos de la simulación.

## Comparativa con modelos similares

La información proporcionada no incluye ninguna comparación con otras políticas. La tabla siguiente recoge lo que sí está documentado y marca explícitamente los huecos:

| Modelo | Parametros | Tarea | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `HSM1/pusht-franka-diffusion-policy` (este) | 89,1 M | Push-T con Franka Panda y palo, en MuJoCo | 82 % de éxito en 50 episodios (sampler DDPM) | no disponible | HuggingFace, 0 descargas |
| Otras políticas de difusión para Push-T | no disponible | Push-T | no disponible | no disponible | no disponible |
| Políticas de imitación alternativas (por ejemplo, basadas en transformer o en predicción de acciones discretas) | no disponible | manipulación | no disponible | no disponible | no disponible |

El repositorio no aporta cifras comparativas con otras arquitecturas, y no se han encontrado en la información disponible resultados replicados de alternativas sobre el mismo protocolo de evaluación (50 episodios, cobertura ≥ 90 % durante 0,5 s).

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial ni para redistribución. Cualquier uso en producción exige contactar con el autor y aclarar los términos.
- Ámbito extremadamente estrecho: la política resuelve una única tarea (Push-T), con un único robot (Franka Panda), un único útil (un palo), objetos concretos y un simulador específico (MuJoCo). No es reutilizable fuera de ese contexto sin reentrenamiento.
- Entrenada solo en simulación: no hay evidencia en la información disponible de que funcione en hardware real; la brecha *sim-to-real* (iluminación, dinámica de contacto, calibración de cámaras) es un riesgo abierto.
- Tasa de error no despreciable: un 18 % de fallos sobre 50 episodios implica que la política falla aproximadamente una de cada cinco ejecuciones, con la incertidumbre estadística asociada a una muestra de ese tamaño.
- Datos de entrenamiento limitados: al provenir de teleoperación humana con ratón en simulación, el dataset probablemente cubre un rango restringido de estados. No se documenta el número de trayectorias ni la diversidad de condiciones iniciales, por lo que se desconoce su robustez fuera de la distribución.
- Sin información sobre sesgos: no se han publicado análisis de sesgo, y en robótica esto se traduce en comportamientos sistemáticamente erróneos ante configuraciones no vistas.
- Ausencia de datos de calibración y seguridad: no se documentan límites de fuerza, parada de emergencia ni verificación de colisiones. En un robot real, la salida de la política debería filtrarse con un controlador de bajo nivel que garantice límites de seguridad.
- Idiomas no aplicables: el modelo no procesa ni genera texto, por lo que no procede evaluar capacidades multilingües.
- Repositorio sin validación de la comunidad: 0 descargas y 0 likes en la fecha de consulta, sin issues ni discusiones públicas que permitan contrastar su funcionamiento.
- Fechas del repositorio: la creación y la última actualización figuran como 2026-09-27, posteriores a la fecha habitual de consulta; conviene verificar la coherencia de esos metadatos antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HSM1/pusht-franka-diffusion-policy
- Metadatos de la simulación de entrenamiento: archivo `pusht_meta.json`, incluido en el repositorio del modelo (fps, definiciones de cámara, resolución de imagen y XML de física)
- Scripts de descarga y demostración mencionados en la model card: `scripts/09_download_model.py` y `demo/sim_demo.py`, en el repositorio GitHub del proyecto del autor; la URL exacta no está incluida en la información disponible
- Librería utilizada: LeRobot (HuggingFace), referenciada como `library_name: lerobot`; no se proporciona enlace en la model card
- Referencia externa de la arquitectura (no incluida en la model card): artículo de Diffusion Policy, Chi et al., arXiv:2303.04137
