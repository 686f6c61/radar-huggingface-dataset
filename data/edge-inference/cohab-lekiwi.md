# edge-inference/cohab-lekiwi

## Resumen

CoHab LeKiwi es una política visión-lenguaje-acción (VLA) desarrollada por edge-inference, un fine-tune completo del modelo base `lerobot/pi05_base` (la familia pi0.5 de Physical Intelligence). Su cometido es ejecutar las cuatro fases de una tarea de clasificación de objetos del suelo con un robot móvil LeKiwi equipado con un brazo SO-101: ir al objeto, recogerlo, llevarlo a su contenedor y depositarlo. El modelo consume las cámaras frontal y de muñeca del robot, el estado articular, la velocidad de la base y la posición objetivo en el marco del robot, y emite bloques de 10 acciones (6 objetivos articulares del brazo más velocidades x/y/theta de la base) a 15 Hz.

La arquitectura subyacente es la de pi0.5, un transformer VLA que combina un codificador visual, un modelo de lenguaje y un cabezal de acciones, con alrededor de 4.140 millones de parámetros en pesos bf16 (37,4 GB de repositorio). El modelo se entrenó sobre datos de profesor generados en simulador (ManiSkill 3 sobre ReplicaCAD) con dos rondas de recogida de datos sobre los fallos propios de la política, una técnica de aprendizaje iterativo que mejora la cobertura de estados difíciles.

Su relevancia actual es doble: por un lado, demuestra un pipeline completo de VLA multi-robot con un planificador externo (Cosmos-Reason2-8B) que asigna instrucciones de texto a cada robot; por otro, publica una evaluación rigurosa con intervalos de confianza bootstrap sobre 576 tareas en un apartamento no visto durante el entrenamiento. Es un modelo exclusivamente de simulación en el momento de su publicación y todavía no se ha ejecutado en un LeKiwi físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en pi0.5 (transformer con codificador visual, modelo de lenguaje y cabezal de acciones) |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible (modelo orientado a acciones roboticas; instrucciones de texto en ingles segun la model card) |
| Licencia | BSD 3-Clause |
| Formato de pesos | safetensors (libreria LeRobot) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `lerobot/pi05_base`: un VLA que fusiona observaciones visuales (cámaras `base_0_rgb` y `left_wrist_0_rgb`, renombradas desde `front` y `wrist`), estado propioceptivo (juntas del brazo, velocidad de la base) y una meta de posición expresada en el marco del robot, para producir secuencias de acciones. La salida es un chunk de 10 acciones a 15 Hz compuesto por 6 objetivos articulares del brazo SO-101 y 3 componentes de velocidad de la base (x, y, theta).

El fine-tune se realizó sobre LeRobot 0.6.1 en bf16 con todos los pesos actualizados. Los datos de entrenamiento proceden de un profesor scripted en simulador (ManiSkill 3, ReplicaCAD) con reintentos y ruido pequeño en brazo y base, complementados con dos rondas de demostraciones de recogida generadas a partir de los estados en los que la propia política fallaba: la política ejecutaba tareas completas en los apartamentos de entrenamiento, se guardaba el inicio de cada recogida y un profesor de pick resolvía desde ahí, conservando solo las recogidas exitosas. El checkpoint publicado es el final de la ejecución, elegido de antemano. El planificador de alto nivel es Cosmos-Reason2-8B, que decide el siguiente paso de cada robot a partir de su imagen de cámara y un menú de texto.

## Capacidades

- Control visomotor de un robot móvil LeKiwi con brazo SO-101 para tareas de clasificación de objetos del suelo.
- Ejecución de cuatro habilidades encadenadas: desplazarse al objeto, recogerlo, transportarlo al contenedor y depositarlo.
- Percepción multimodal: cámaras frontal y de muñeca, estado articular, velocidad de la base y posición objetivo en el marco del robot.
- Generación de acciones en chunks de 10 pasos a 15 Hz (6 juntas del brazo más velocidades x/y/theta de la base).
- Coordinación multi-robot: dos robots operan simultáneamente bajo instrucciones de un planificador externo (Cosmos-Reason2-8B).
- Integración con el ecosistema LeRobot mediante `PI05Policy.from_pretrained`.
- No dispone de tool calling, function calling, generación de texto libre ni capacidades de audio.

## Casos de uso

- Investigación en manipulación móvil: sirve como referencia reproducible para estudiar políticas VLA que combinan base móvil y brazo, con evaluación pública de 576 tareas y registros por semilla en `eval/head/`.
- Clasificación de objetos en entornos domésticos simulados: el modelo demuestra el ciclo completo de recogida y depósito en ReplicaCAD, útil para prototipar tareas de ordenación antes de trasladarlas a hardware real.
- Aprendizaje iterativo con datos de profesor: el pipeline de dos rondas de recogida sobre estados de fallo propios es replicable para otras habilidades y otros robots del ecosistema LeRobot.
- Evaluación de planificadores de alto nivel: al separar el planificador (Cosmos-Reason2-8B) de la política de bajo nivel, permite medir el impacto de decisiones de planificación sobre la tasa de éxito por paso.
- Benchmark de VLA multi-robot: la configuración de dos robots, seis objetos y dos contenedores por tarea, con 72 semillas y ocho tareas en paralelo, sirve como banco de pruebas para comparar políticas de la misma familia.
- Docencia y divulgación en robótica: el vídeo `replay.mp4` y los registros de evaluación facilitan explicar el funcionamiento de un VLA con datos concretos de éxito por fase (72 % ir, 77 % recoger, 79 % llevar, 95 % depositar).

## Benchmarks y rendimiento

Evaluación sobre 576 tareas (72 semillas, 100-171, por 8 tareas en paralelo), dos robots, seis objetos y dos contenedores por tarea, apartamento 5 no visto en entrenamiento, 150 s por tarea:

| Metrica | Resultado |
|---|---|
| Objetos clasificados por tarea (de 6) | 3,56 [IC 95 %: 3,44-3,68]; 2.053 de 3.456 (59,4 %) |
| Tareas con 0 / 1 / 2 / 3 / 4 / 5 / 6 objetos | 11 / 46 / 88 / 123 / 128 / 130 / 50 |
| Exito por paso: ir al objeto | 72 % |
| Exito por paso: recoger | 77 % |
| Exito por paso: llevar | 79 % |
| Exito por paso: depositar | 95 % |

El intervalo de confianza se calculó por bootstrap sobre las 576 tareas. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 4.143 millones de parámetros, los pesos en bf16 ocupan aproximadamente 8,3 GB, a lo que hay que sumar el codificador visual y las activaciones.
- GPU recomendadas: no especificadas por el autor; por tamaño, una GPU con 16 GB o más (RTX 4090, L40S, A100) debería acomodar el modelo en bf16.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas con 16 GB o más, aunque el autor no lo confirma.
- Opciones de despliegue: LeRobot 0.6.1 con `PI05Policy.from_pretrained`; el repositorio incluye `train_config.json` con los nombres de cámara. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La política emite acciones a 15 Hz en simulación, pero no se publican cifras de latencia de inferencia ni de rendimiento por GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CoHab LeKiwi (este modelo) | 4.143 M | no disponible | VLA para LeKiwi/SO-101 en simulacion | BSD 3-Clause | Hugging Face, LeRobot |
| lerobot/pi05_base | no disponible en la informacion | no disponible | VLA base de proposito general | no disponible en la informacion | Hugging Face, LeRobot |
| Cosmos-Reason2-8B | no disponible en la informacion | no disponible | Planificador vision-lenguaje de alto nivel | no disponible en la informacion | Usado como planificador en este sistema |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada; la comparativa se limita a su papel en el sistema y a su disponibilidad.

## Limitaciones y advertencias

- Solo simulación: el modelo no se ha ejecutado en un LeKiwi físico; el propio autor lo indica. El chasis simulado atraviesa alfombras, lo que no refleja el comportamiento real.
- Dependencia de supuestos del simulador: si un depósito cayó en el contenedor se toma del simulador; durante el transporte el brazo se mantiene en la pose final de la recogida mediante una regla fija; el fin de un desplazamiento se determina por el brazo en reposo.
- Tasa de éxito limitada: 3,56 de 6 objetos por tarea (59,4 %) y éxito por paso entre el 72 % y el 95 %, con 11 tareas sin ningún objeto clasificado.
- Percepción imperfecta: la localización del objetivo depende de odometría, mapa previo y cámara (error mediano de unos 5 cm) más ruido añadido de 0,10; la decisión de llegada la toma un modelo externo.
- Idiomas: no se documentan capacidades multilingües; las instrucciones del planificador se expresan en inglés.
- Sesgos conocidos: no documentados por el autor; al entrenarse en ReplicaCAD, la generalización a otras distribuciones visuales y de objetos no está evaluada.
- Riesgo de alucinación: no aplica a generación de texto, pero sí a decisiones de planificación erróneas del modelo externo Cosmos-Reason2-8B.
- Licencia BSD 3-Clause: permite uso comercial con atribución y sin endoso; conviene revisar las condiciones del modelo base `lerobot/pi05_base` antes de producción.
- Para producción: no hay cifras publicadas de latencia ni de robustez fuera de simulación; se recomienda validación exhaustiva antes de desplegar en hardware.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/edge-inference/cohab-lekiwi
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/edge-inference/cohab-lekiwi
- Repositorio de código: https://github.com/edge-inference/cohab-lekiwi
- Plan del proyecto: https://github.com/edge-inference/cohab-lekiwi/blob/main/docs/PLAN.md
- Librería LeRobot: https://github.com/huggingface/lerobot
- Simulador ManiSkill 3: https://github.com/haosulab/ManiSkill
- Entorno ReplicaCAD: https://aihabitat.org/datasets/replica_cad/
