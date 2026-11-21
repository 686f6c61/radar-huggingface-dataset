# GinDuck/microduck-sock-heist-6m-continue-1-b

## Resumen

microduck-sock-heist-6m-continue-1-b es una política de control entrenada por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. El modelo resuelve una tarea concreta de manipulación y navegación: acercarse a un calcetín, esquivar a unos guardias y recogerlo sin ser detectado, en aproximadamente 10 segundos según las pruebas del autor. Se publica como checkpoint del primer run de continuación de la tarea "sock heist" tras 6 millones de pasos de entrenamiento.

Técnicamente no es un modelo de lenguaje ni un transformer generativo, sino una política de reinforcement learning exportada a ONNX que opera a 50 Hz sobre una observación de 61 dimensiones y produce 14 acciones de control. Es una política de tipo "perpetual": se ejecuta de forma continua hasta que se detiene explícitamente, y se carga en una de las ranuras de política del demonio robotctl del robot.

Su relevancia es acotada pero significativa en el ecosistema de robótica open source: demuestra el flujo completo de entrenamiento con mjlab (entorno de simulación basado en MuJoCo) y despliegue en hardware real mediante un manifiesto de política versionado. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo es de 0,0 GB, lo que sugiere que los pesos pueden no estar incluidos o son de tamaño despreciable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de reinforcement learning (red neuronal de control), exportada a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); observación de 61 dimensiones por paso |
| Tipos de cuantización | no disponible (formato ONNX, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y manifiesto `manifest.json` (schema 2) |

## Arquitectura y entrenamiento

La política se entrena con mjlab, un entorno de simulación de reinforcement learning basado en MuJoCo, sobre la tarea `Mjlab-SockHeist6m-MicroDuck` del repositorio `microduck-challenges` de Pollen Robotics. El entrenamiento se ejecutó con 4096 entornos paralelos, un máximo de 1500 iteraciones y semilla 1, sobre la base `mjlab-microduck 0.1.0 @ 1efd853be`, en la rama `sock-continue` y el commit `395d47056`, partiendo de un checkpoint previo (checkpoint 900). El nombre del modelo indica 6 millones de pasos de entrenamiento ("6m").

La observación de 61 dimensiones se normaliza mediante un normalizador que está embebido dentro del propio `policy.onnx`, de modo que el robot puede alimentar observaciones en bruto. La política genera 14 acciones a 50 Hz y es de naturaleza perpetua: no tiene condición de terminación intrínseca y se ejecuta hasta que el operador la detiene o la sustituye. El autor advierte que el entrenamiento no es bit-reproducible entre máquinas, por lo que repetir el mismo comando con la misma semilla produce una política comparable pero no idéntica.

## Capacidades

- Control locomotor y de manipulación del robot cuadrúpedo microduck para la tarea específica de "sock heist": aproximación al objetivo, evasión de guardias y recogida del calcetín.
- Ejecución continua (política perpetua) a 50 Hz hasta que se detiene explícitamente.
- Consumo de observaciones en bruto gracias al normalizador embebido en el ONNX.
- Despliegue en hardware real mediante el comando `robotctl policy load <slot> GinDuck/microduck-sock-heist-6m-continue-1-b`.
- Integración con el sistema de manifiestos de política del demonio microduck (schema 2).
- No soporta tool calling, agentes multi-paso, capacidades multilingües ni visión; es una política de control motor especializada.

## Casos de uso

- Demostración de referencia del pipeline completo de entrenamiento y despliegue: sirve para validar que la cadena mjlab → ONNX → robotctl funciona de extremo a extremo en el robot microduck antes de entrenar tareas propias.
- Investigación en reinforcement learning para robótica: punto de partida reproducible (con las salvedades de no determinismo) para estudiar políticas de evasión y recogida en entornos con obstáculos dinámicos.
- Benchmark interno de la tarea sock heist: comparar nuevas políticas contra este checkpoint como línea base en el mismo escenario y con la misma semilla.
- Docencia y divulgación en robótica open source: ejemplo tangible de política perpetua cargada en una ranura del robot, útil para explicar observaciones, acciones y frecuencia de control.
- Pruebas de integración del demonio robotctl: verificar la carga de políticas desde Hugging Face, el manejo de slots y el esquema de manifiestos en entornos de desarrollo.
- Base para fine-tuning o continuación de entrenamiento: al ser un checkpoint "continue-1", puede servir como inicialización para variantes de la tarea (distintos mapas, número de guardias o posiciones del calcetín).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo indica cualitativamente que la política "esquiva a los guardias y coge el calcetín sin ser pillada, en unos 10 segundos en mis propias pruebas". No hay métricas formales de tasa de éxito, recompensa media ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser una política de control de pequeña dimensión (61 observaciones, 14 acciones) y formato ONNX, la huella de memoria es previsiblemente mínima, pero no se publican cifras.
- GPU recomendadas: no disponible. La inferencia a 50 Hz de una política de este tipo es viable en CPU; el entrenamiento, en cambio, requiere GPU (4096 entornos paralelos en mjlab).
- ¿Cabe en GPU de consumo? No hay datos publicados, pero por la naturaleza del modelo es altamente probable que sí; no se especifica modelo concreto.
- Opciones de despliegue: ONNX Runtime (formato `policy.onnx`) y el demonio `robotctl` del microduck mediante `robotctl policy load <slot> ...`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: frecuencia de control de 50 Hz (20 ms por paso) según la model card; no se publican latencias medidas ni throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Observación / acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-sock-heist-6m-continue-1-b | Política RL (ONNX) para microduck | 61-D / 14 acciones | 50 Hz | no disponible | Hugging Face (0 descargas) |
| Otras políticas de microduck-challenges | Políticas RL para microduck | no disponible | no disponible | según repo | Repositorio `microduck-challenges` |
| Políticas de locomotion para cuadrúpedos (p. ej. familias de legged_gym / mjlab) | Políticas RL | variable | variable | variable | Repositorios académicos |

No se dispone de datos numéricos de rendimiento para establecer una comparación cuantitativa con alternativas. La comparación con políticas de locomotion genéricas de cuadrúpedos es solo categórica: este modelo está especializado en una tarea concreta (sock heist) y no es un modelo generalista.

## Limitaciones y advertencias

- Especialización extrema: la política solo está entrenada para la tarea `Mjlab-SockHeist6m-MicroDuck`; no es un modelo general ni reutilizable fuera de ese escenario sin reentrenamiento.
- Licencia no disponible: no se puede asumir uso comercial; hay que contactar con el autor o consultar el repositorio de challenges antes de cualquier uso en producción.
- Reproducibilidad limitada: el propio autor advierte que el entrenamiento en GPU no es bit-reproducible entre máquinas; los pesos no se pueden regenerar de forma idéntica.
- Rendimiento cualitativo: la afirmación de "unos 10 segundos" proviene de pruebas informales del autor, sin protocolo ni métricas publicadas; no hay tasas de éxito ni intervalos de confianza.
- Dependencia del hardware y del demonio: requiere el robot microduck y el demonio `robotctl` con soporte de manifiesto schema 2; no se puede ejecutar en un entorno genérico sin ese stack.
- Riesgo de fallo en el mundo real: como toda política entrenada en simulación, puede sufrir la brecha sim-to-real (iluminación, fricción, latencia, ruido de sensores) no cuantificada en la model card.
- Tamaño del repo de 0,0 GB: conviene verificar que los pesos (`policy.onnx`) estén realmente disponibles en el repositorio antes de depender de él.
- Sin datos de sesgos, idioma ni alucinación: no aplican al no ser un modelo lingüístico, pero tampoco se documentan sesgos de comportamiento en la política.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-sock-heist-6m-continue-1-b
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de challenges y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Documentación del manifiesto de política: `docs/policy-manifest.md` en el repositorio del demonio (referenciado en la model card)
- Enlace externo citado por el autor (QuackPack): https://www.imundo.ch/quackpack/
