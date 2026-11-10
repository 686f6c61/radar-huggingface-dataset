# edge-inference/cohab-lekiwi

## Resumen

CoHab LeKiwi es una política visión-lenguaje-acción (VLA) desarrollada por edge-inference, un fine-tune completo del modelo base `lerobot/pi05_base` (pi0.5 de Physical Intelligence). Resuelve una tarea concreta de robótica móvil manipulativa: el ordenado de objetos del suelo con un robot LeKiwi equipado con un brazo SO-101. La política recibe las cámaras frontal y de muñeca del robot, su estado articular, la velocidad de la base y la posición objetivo en el marco del robot, y emite bloques de 10 acciones (6 objetivos articulares del brazo más velocidades x/y/theta de la base) a 15 Hz.

El modelo tiene 4.143.404.816 parámetros almacenados en safetensors y un repositorio de 28,1 GB, coherente con pesos en bf16. Se distribuye bajo licencia BSD 3-Clause y se integra en el ecosistema LeRobot (versión 0.6.1). Su relevancia reside en que demuestra un pipeline completo de aprendizaje por imitación desde datos de profesor en simulador (ManiSkill 3, ReplicaCAD) aplicado a una tarea de horizonte largo con dos robots coordinados por un planificador externo (Cosmos-Reason2-8B).

Es importante subrayar que el modelo solo se ha validado en simulación: no se ha ejecutado todavía en un LeKiwi real. Además, el modelo base pi0.5 es un VLA generalista, mientras que este checkpoint está especializado exclusivamente en la habilidad de ordenar objetos del suelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) derivada de pi0.5 (Pi0Policy/PI05Policy); transformer con codificador visual y decodificador de acciones por chunks |
| Parámetros totales | 4.143.404.816 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible (modelo de robótica; instrucciones de texto en inglés en la evaluación) |
| Licencia | BSD 3-Clause |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/pi05_base`, un VLA de tipo pi0.5 que combina un codificador visual con un modelo de lenguaje y un cabezal de acciones que genera secuencias (chunks) de comandos motores. En este fine-tune se ajustaron todos los pesos en bf16 con LeRobot 0.6.1 sobre datos de profesor generados por script en simulador, con reintentos y ruido pequeño aplicado al brazo y a la base. Se trata del checkpoint final del entrenamiento, elegido de antemano.

La entrada incluye dos cámaras (frontal y de muñeca, renombradas internamente a `base_0_rgb` y `left_wrist_0_rgb`), el estado articular, la velocidad de la base y la posición objetivo en el marco del robot. La salida son 10 acciones por chunk a 15 Hz: 6 objetivos articulares del brazo y velocidades x/y/theta de la base. En la evaluación, un planificador externo (Cosmos-Reason2-8B) decide el siguiente paso de cada robot a partir de la imagen de cámara y un menú textual, y también juzga si el robot ha llegado al objeto o a la papelera. La posición del objetivo se estima con odometría, un mapa previo y la cámara (SLAM simulado, error mediano de unos 6 cm), con ruido añadido de 0,10. No se documentan detalles sobre número de tokens de entrenamiento ni composición exacta del dataset más allá de su origen en simulador.

## Capacidades

- Ordenado de objetos del suelo en cuatro pasos: ir al objeto, recogerlo, llevarlo a su papelera e introducirlo.
- Control de un brazo SO-101 de 6 grados de libertad más base móvil holonómica (velocidades x/y/theta).
- Percepción multimodal a partir de cámara frontal y de muñeca, estado articular y velocidad de la base.
- Generación de acciones en chunks de 10 a 15 Hz.
- Operación multi-robot: dos robots ejecutan la política de forma independiente, coordinados por un planificador de lenguaje externo.
- Seguimiento de instrucciones de texto de alto nivel por paso (proporcionadas por el planificador).
- No se documentan capacidades de tool calling, agentes autónomos, matemáticas, código ni visión generalista; es un modelo especializado de robótica.

## Casos de uso

- Ordenado automatizado en entornos simulados: investigación en manipulación móvil donde se necesita una política entrenada para clasificar objetos del suelo en papeleras, con métricas reproducibles en ManiSkill 3 y ReplicaCAD.
- Base para fine-tuning en robots reales: al ser un checkpoint completo de pi0.5, sirve como punto de partida para adaptar la habilidad a un LeKiwi físico con datos propios.
- Estudio de coordinación multi-robot: dos instancias de la política más un planificador VLM permiten investigar asignación de tareas y evitación de colisiones en espacios compartidos.
- Evaluación de pipelines VLA con planificador externo: útil para medir el impacto de decisiones de alto nivel (Cosmos-Reason2-8B) sobre la ejecución de bajo nivel.
- Benchmark de aprendizaje por imitación desde profesor scriptado: permite comparar estrategias de generación de datos sintéticos con reintentos y ruido.
- Prototipado de tareas de horizonte largo (150-300 s por tarea) con seis objetos y dos papeleras, útil para estudiar degradación de la política a lo largo del tiempo.
- Docencia y demostraciones de robótica VLA en simulación, sin necesidad de hardware físico.

## Benchmarks y rendimiento

Evaluación con dos robots, seis objetos y dos papeleras por tarea, en un apartamento (apartamento 5) no usado en entrenamiento. 192 tareas: 24 semillas (0-7, 40-55) por 8 tareas paralelas, cada una con disposición aleatoria distinta.

| Métrica | 150 s por tarea | 300 s por tarea |
|---|---|---|
| Objetos ordenados por tarea (de 6) | 3,16 [IC 95%: 2,95-3,38] (607 de 1.152, 52,7%) | 3,71 [3,51-3,92] (713 de 1.152, 61,9%) |
| Tareas con 0 / 1 / 2 / 3 / 4 / 5 / 6 ordenados | 4 / 28 / 31 / 48 / 44 / 25 / 12 | 4 / 10 / 28 / 36 / 48 / 49 / 17 |
| Éxito por paso: ir / recoger / llevar / introducir | 69% / 80% / 70% / 92% | 59% / 75% / 70% / 87% |

Intervalos de confianza calculados por bootstrap sobre las 192 tareas. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 4.143 millones de parámetros en bf16 los pesos ocupan aproximadamente 8,3 GB, por lo que se necesita margen adicional para activaciones y codificadores visuales.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cabría esperar GPUs con al menos 16-24 GB de VRAM, pero no se confirma.
- ¿Cabe en GPU de consumo? No confirmado; el tamaño de pesos en bf16 sugiere que podría caber en GPUs de gama alta de consumo, pero no hay datos oficiales.
- Opciones de despliegue: LeRobot 0.6.1 mediante `PI05Policy.from_pretrained`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de acciones).
- Latencia y throughput: no disponibles; la política emite acciones a 15 Hz en simulación, pero no se publican latencias de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CoHab LeKiwi | 4.143 M | no disponible | Ordenado de suelo con LeKiwi/SO-101 en simulación | BSD 3-Clause | Hugging Face |
| lerobot/pi05_base | no disponible | no disponible | VLA generalista base | no disponible | Hugging Face |
| Cosmos-Reason2-8B | ~8.000 M | no disponible | Planificador VLM (usado junto al modelo, no comparable directamente) | no disponible | Uso como planificador externo |

No se dispone de datos de benchmarks comparativos con otros modelos VLA en la información proporcionada.

## Limitaciones y advertencias

- Solo validado en simulación (ManiSkill 3, ReplicaCAD); no se ha ejecutado en un LeKiwi real.
- Especializado exclusivamente en la tarea de ordenado de suelo; no es un VLA generalista.
- Depende de un planificador externo (Cosmos-Reason2-8B) para decidir el siguiente paso y juzgar la llegada a objetos y papeleras.
- Asume que, durante el transporte, el brazo se mantiene en la pose final de la recogida (regla fija); sin ella, la política deja caer más objetos.
- El chasis simulado atraviesa alfombras; este comportamiento no refleja necesariamente la realidad física.
- El rendimiento decae en tareas largas: el éxito por paso baja de 69% a 59% al pasar de 150 s a 300 s en el paso de ir al objeto.
- La localización del objetivo depende de SLAM simulado con error mediano de unos 6 cm y ruido añadido; en un robot real el error podría ser mayor.
- Riesgo de alucinación y sesgos: no documentados; al ser un modelo de acciones, el riesgo relevante es la ejecución incorrecta de movimientos.
- Licencia BSD 3-Clause: permite uso comercial con atribución y sin endoso; conviene revisar las condiciones del modelo base pi0.5, cuya licencia no se detalla en la información disponible.
- Idiomas soportados no disponibles; las instrucciones de texto en la evaluación están en inglés.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/edge-inference/cohab-lekiwi
- Dataset: https://huggingface.co/datasets/edge-inference/cohab-lekiwi
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Repositorio de código e historial: https://github.com/edge-inference/cohab-lekiwi
- Documento de plan: https://github.com/edge-inference/cohab-lekiwi/blob/main/docs/PLAN.md
- Demo en vídeo: https://huggingface.co/edge-inference/cohab-lekiwi/resolve/main/media/v12_demo_first60s_2x.mp4
