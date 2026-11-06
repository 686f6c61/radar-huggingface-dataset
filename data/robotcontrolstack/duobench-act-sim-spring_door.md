# RobotControlStack/duobench-act-sim-spring_door

## Resumen

DuoBench ACT (sim) es una política de imitación basada en el algoritmo ACT (Action Chunking with Transformers) entrenada por el grupo RobotControlStack para la tarea bimanual `spring_door` del benchmark DuoBench, sobre el setup de dos brazos FR3 Duo. El modelo se ha entrenado exclusivamente con datos de simulación (50 demostraciones por tarea) y está pensado como referencia reproducible para evaluar manipulación bimanual en entornos simulados, no para su despliegue en un robot real.

La relevancia de esta ficha es doble: por un lado, documenta una política de robótica de pequeña escala (51,7 millones de parámetros, 0,2 GB de pesos en safetensors) que cabe holgadamente en cualquier GPU de consumo; por otro, forma parte de un esfuerzo más amplio por estandarizar la evaluación de manipulación bimanual, un área donde la falta de benchmarks reproducibles ha dificultado la comparación entre métodos. El modelo se distribuye con licencia Apache 2.0 y se carga mediante la librería LeRobot en un commit concreto.

Arquitectónicamente es un transformer con acción fragmentada (action chunking) que consume tres cámaras (cabeza y dos muñecas, a 224x224) y un estado de 16 dimensiones (2 x 7 articulaciones más 2 pinzas), y produce acciones conjuntas de 16 dimensiones. Su tasa de éxito publicada en simulación es del 22,3 % (IC 95 %: 18,0-27,4) sobre 300 rollouts, un dato que conviene interpretar como línea base de referencia y no como un rendimiento de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con decodificación de chunks de acción |
| Parametros totales | 51.689.104 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (política de robótica; no usa contexto textual) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión original; no se documentan variantes GGUF o cuantizadas) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,2 GB) |

## Arquitectura y entrenamiento

El modelo implementa ACT, una política de imitación que predice un chunk de 100 acciones futuras a partir de observaciones visuales y propioceptivas, lo que reduce el error de compounding y permite un control más suave que las políticas paso a paso. Las entradas son tres flujos de cámara (`head`, `left_wrist`, `right_wrist`) a resolución 224x224 más un vector de estado de 16 dimensiones (2 x 7 articulaciones y 2 pinzas); la salida es un vector de acción de 16 dimensiones (articulaciones y pinzas). El entrenamiento se realizó desde cero con LeRobot en el commit `c8ce413d738da15a2eed2d0832315779ea28cbf9`, con 150.000 pasos, batch de 64, tasa de aprendizaje 1e-5, chunk de acción de 100 y semilla 1000, y la configuración completa está disponible en `train_config.json`.

Los datos de entrenamiento son 50 demostraciones por tarea extraídas de las carpetas `<task>/sim` del dataset `RobotControlStack/duobench`, es decir, exclusivamente simulación. No se documenta en la información disponible el uso de RLHF, DPO ni ninguna fase de ajuste posterior al entrenamiento supervisado. Tampoco se detalla la composición exacta del dataset más allá del número de demostraciones y las modalidades de entrada.

## Capacidades

- Generación de acciones de control bimanual: produce comandos de 16 dimensiones (articulaciones y pinzas) para el setup FR3 Duo.
- Percepción visual multi-cámara: procesa tres vistas simultáneas (cabeza y ambas muñecas) a 224x224.
- Ejecución de una tarea única: política especializada en `spring_door`, sin generalización declarada a otras tareas.
- Action chunking: predice secuencias de 100 acciones, lo que facilita movimientos coherentes y reduce la frecuencia de replanificación.
- Integración con LeRobot: carga directa mediante `ACTPolicy.from_pretrained` en la versión compatible.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni capacidades multilingües, de visión general o de audio.

## Casos de uso

- Evaluación de referencia en simulación: sirve como línea base reproducible para comparar nuevos métodos de imitación bimanual en la tarea `spring_door`, gracias a su protocolo de 300 rollouts con intervalos de confianza Wilson.
- Reproducción de experimentos: al publicarse el commit exacto de LeRobot, la configuración de entrenamiento y el dataset, permite replicar el pipeline completo y verificar resultados.
- Estudio de action chunking: útil para analizar cómo el tamaño de chunk (100) afecta a la estabilidad y la tasa de éxito en tareas de contacto como abrir una puerta con muelle.
- Desarrollo de infraestructura de simulación: sirve para validar entornos, controladores y pipelines de evaluación del benchmark DuoBench antes de escalar a políticas más grandes.
- Investigación en manipulación bimanual: permite estudiar la coordinación de dos brazos con percepción de muñeca en una tarea con restricciones físicas.
- Docencia y prototipado: su tamaño reducido (51,7 M de parámetros, 0,2 GB) permite ejecutarlo en hardware modesto para experimentos educativos o pruebas de integración con LeRobot.
- No es adecuado para despliegue en robot real, atención al cliente, generación de código ni ninguna tarea de lenguaje.

## Benchmarks y rendimiento

Resultados publicados en la model card para simulación DuoBench, sobre 300 rollouts por tarea (semillas 0-299) con intervalo de confianza Wilson del 95 %:

| Tarea | Tasa de éxito (%) | IC 95 % |
|---|---|---|
| spring_door | 22,3 | [18,0, 27,4] |

No se han publicado en la información disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni benchmarks de lenguaje, dado que no es un modelo lingüístico.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión original (51,7 M de parámetros en safetensors, repo de 0,2 GB), más el coste de los tres flujos de cámara a 224x224.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; una RTX 3060, RTX 4060 o superior es más que suficiente. Para evaluación a gran escala (300 rollouts) se recomienda una RTX 4090 o A100 por throughput, aunque no es imprescindible.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna, e incluso en iGPU con suficiente memoria compartida para inferencia puntual.
- Opciones de despliegue: LeRobot en el commit `c8ce413d` (requisito explícito); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas de robótica.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento de políticas comparables (por ejemplo, Diffusion Policy, π0 u otras políticas ACT del mismo benchmark) para establecer una comparación cuantitativa fiable. La comparación cualitativa posible es la siguiente:

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DuoBench ACT (sim) | 51,7 M | no aplica | spring_door (sim) | Apache 2.0 | Hugging Face, LeRobot |
| Otras políticas ACT de LeRobot | no disponible | no aplica | varía | varía | Hugging Face |
| Políticas de difusión para manipulación | no disponible | no aplica | varía | varía | varía |

## Limitaciones y advertencias

- Entrenado exclusivamente con datos de simulación: el propio autor indica que no está pensado para el robot real.
- Tasa de éxito baja (22,3 %) incluso en el entorno para el que fue entrenado; no debe interpretarse como un sistema listo para producción.
- Política de tarea única: no generaliza a otras tareas de DuoBench ni a variaciones del entorno no vistas en entrenamiento.
- Dependencia estricta de la versión de LeRobot: la carga requiere un commit concreto (`c8ce413d`), lo que puede romper la compatibilidad con versiones posteriores.
- Sin capacidades lingüísticas, de razonamiento o de agente; no aplica el riesgo de alucinación textual, pero sí el riesgo de fallo silencioso en la ejecución de la política.
- Sesgos conocidos: no documentados en la información disponible; cabe esperar sesgo hacia las condiciones de las 50 demostraciones de simulación.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no es funcional fuera del entorno simulado del benchmark.
- Solo 7 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RobotControlStack/duobench-act-sim-spring_door
- Dataset DuoBench: https://huggingface.co/datasets/RobotControlStack/duobench
- Paper DuoBench (arXiv): https://arxiv.org/abs/2606.11901
- Página del proyecto: https://duobench.github.io/
- Código DuoBench: https://github.com/RobotControlStack/duobench
- LeRobot (commit de entrenamiento): https://github.com/huggingface/lerobot/tree/c8ce413d738da15a2eed2d0832315779ea28cbf9
- Repositorio LeRobot: https://github.com/huggingface/lerobot
