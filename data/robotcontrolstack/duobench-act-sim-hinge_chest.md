# RobotControlStack/duobench-act-sim-hinge_chest

## Resumen

DuoBench ACT (sim) es una política de control robótico basada en la arquitectura ACT (Action Chunking Transformer) desarrollada por RobotControlStack para el benchmark DuoBench de manipulación bimanual. El modelo resuelve una tarea concreta de manipulación en simulación, `hinge_chest`, sobre una configuración de dos brazos Franka Research 3 (FR3 Duo), y se distribuye como un checkpoint de LeRobot entrenado desde cero con 50 demostraciones por tarea.

Con 51.689.104 parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto orientado a inferencia de políticas visomotoras, no a generación de lenguaje. Su relevancia radica en que forma parte de un benchmark reproducible que busca estandarizar la evaluación de manipulación bimanual tanto en simulación como en el mundo real, y en que todo el pipeline (datos, código, configuración de entrenamiento y pesos) es abierto bajo licencia Apache 2.0.

La ficha describe un modelo de robótica, por lo que varias de las categorías habituales (idiomas, contexto, cuantización, benchmarks de NLP) no aplican y se indican como no disponibles. La información procede exclusivamente de la model card y de los metadatos de HuggingFace.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), política visomotora |
| Parámetros totales | 51.689.104 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; usa observaciones de cámara y estado) |
| Tipos de cuantización | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint LeRobot) |

## Arquitectura y entrenamiento

El modelo implementa una política ACT, un transformer que mapea observaciones visomotoras a secuencias de acciones (action chunks) de longitud 100. Las entradas son tres cámaras a 224x224 (`head`, `left_wrist`, `right_wrist`) y un vector de estado de 16 dimensiones (2 x 7 articulaciones más 2 pinzas); la salida es un vector de acción de 16 dimensiones (articulaciones y pinzas). El entrenamiento se realizó desde cero con LeRobot en el commit `c8ce413d738da15a2eed2d0832315779ea28cbf9`, con 150.000 pasos, batch size 64, learning rate 1e-5 y semilla 1000. La configuración completa está en `train_config.json` del repositorio.

Los datos de entrenamiento son 50 demostraciones por tarea extraídas de las carpetas `<task>/sim` del dataset `RobotControlStack/duobench`, es decir, exclusivamente simulación. No se documenta en la información disponible el uso de RLHF, DPO ni de técnicas de refinamiento posteriores; se trata de aprendizaje por imitación supervisado sobre demostraciones.

## Capacidades

- Control visomotor bimanual: genera acciones de 16 dimensiones (dos brazos FR3 de 7 articulaciones más dos pinzas) a partir de tres vistas de cámara y del estado de las articulaciones.
- Ejecución de una única tarea: política de tarea única especializada en `hinge_chest` en el entorno de simulación de DuoBench.
- Predicción por chunks de acción: emite secuencias de 100 acciones por inferencia, lo que reduce la frecuencia de replanificación.
- Integración con LeRobot: carga mediante `ACTPolicy.from_pretrained` y es compatible con el ecosistema de entrenamiento y evaluación de LeRobot.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento lingüístico, matemáticas ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Evaluación reproducible de manipulación bimanual: sirve como baseline de referencia para la tarea `hinge_chest` en DuoBench, permitiendo comparar nuevas políticas con una tasa de éxito publicada del 26,7 % sobre 300 rollouts.
- Investigación en aprendizaje por imitación: punto de partida para estudiar el efecto del número de demostraciones, del action chunking o de la configuración de cámaras en políticas ACT.
- Desarrollo de pipelines de simulación: el checkpoint se puede ejecutar en los entornos de simulación del repositorio DuoBench para validar infraestructura de evaluación antes de pasar a robots reales.
- Ablaciones de arquitectura: al estar entrenado desde cero con configuración documentada (150.000 pasos, batch 64, lr 1e-5), es adecuado para reproducir y modificar hiperparámetros de forma controlada.
- Docencia y formación en robótica: modelo pequeño (0,2 GB) y de código abierto que permite ilustrar el ciclo completo datos-dataset-entrenamiento-evaluación con LeRobot.
- Generación de datos sintéticos de referencia: las trayectorias producidas en simulación pueden usarse para analizar distribuciones de acciones y fallos antes de diseñar políticas para el robot real.

## Benchmarks y rendimiento

Resultados publicados en la model card para la simulación de DuoBench, sobre 300 rollouts por tarea (semillas 0-299) con intervalo de confianza de Wilson al 95 %:

| Tarea | Tasa de éxito (%) | IC 95 % |
|---|---|---|
| hinge_chest | 26,7 | [22,0, 31,9] |

No se han publicado en la información disponible resultados comparativos con otras políticas en la misma tabla, ni métricas adicionales (latencia, throughput, precisión de agarre).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros y pesos en safetensors (repositorio de 0,2 GB), la huella en memoria es del orden de cientos de MB, muy por debajo de una GPU consumer.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cualquier GPU con suficiente memoria para el runtime de LeRobot y las tres cámaras a 224x224 debería ser suficiente.
- Cabe en GPU consumer: sí, por el reducido número de parámetros; no se especifican modelos concretos.
- Opciones de despliegue: LeRobot (commit `c8ce413d`), con carga vía `ACTPolicy.from_pretrained`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros checkpoints de DuoBench ni políticas comparables con las que establecer una tabla de comparación de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos de simulación; el autor indica explícitamente que no está pensado para el robot real.
- Política de tarea única: no generaliza a otras tareas de DuoBench ni a variaciones del entorno no vistas en entrenamiento.
- Tasa de éxito moderada (26,7 % en `hinge_chest`), con intervalo de confianza amplio; no es adecuada como solución de producción sin mejoras.
- Requiere una versión de LeRobot compatible con el commit `c8ce413d`; versiones distintas pueden fallar al cargar el checkpoint.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas, al no ser un modelo de lenguaje; tampoco se detallan restricciones adicionales de la licencia Apache 2.0 más allá de las estándar.
- Solo 8 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy reducido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RobotControlStack/duobench-act-sim-hinge_chest
- Dataset DuoBench: https://huggingface.co/datasets/RobotControlStack/duobench
- Paper DuoBench (arXiv): https://arxiv.org/abs/2606.11901
- Página del proyecto: https://duobench.github.io/
- Código DuoBench: https://github.com/RobotControlStack/duobench
- LeRobot (commit de referencia): https://github.com/huggingface/lerobot/tree/c8ce413d738da15a2eed2d0832315779ea28cbf9
