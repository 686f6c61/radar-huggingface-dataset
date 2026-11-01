# SamruddhiThorat07/act_green_pilot

## Resumen

`SamruddhiThorat07/act_green_pilot` es una política de control robótico basada en la arquitectura ACT (Action Chunking with Transformers, paper arXiv:2304.13705) entrenada con la librería LeRobot de Hugging Face para un brazo robótico real SO-101. No es un modelo de lenguaje: es un modelo de imitación que traduce observaciones visuales (cámara cenital y cámara de muñeca) más el estado articular de 6 grados de libertad en comandos de posición articular. La tarea concreta es "poner el cubo verde en la cesta".

El modelo resuelve un problema muy acotado de manipulación robótica de un solo layout: el cubo parte de una posición fija y la cesta está en un lugar fijo. Se entrenó con solo 10 demostraciones teleoperadas (5.322 fotogramas a 30 fps) durante 3.000 pasos y 15 minutos 45 segundos en una RTX 3060, y reporta 10 de 10 rollouts exitosos en la disposición de entrenamiento. Es relevante como ejemplo reproducible y de bajo coste de un pipeline completo de imitación con LeRobot sobre hardware asequible (SO-101), más que como componente de propósito general.

Con 51,6 millones de parámetros y un repositorio de 0,2 GB, es un artefacto ligero, publicado bajo licencia Apache 2.0 y etiquetado con el pipeline `robotics`. Su valor práctico está en servir de plantilla para pilotos de imitación y en documentar con honestidad sus límites: es un piloto de un único layout, no probado con nuevas posiciones del cubo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), backbone ResNet-18 |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; observa fotogramas y estado articular) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de robótica); la tarea se especifica como "Put the green cube in the basket" |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un transformer que predice acciones en trozos (action chunks): en este caso genera bloques de 100 posiciones articulares a partir de las observaciones. La entrada combina una cámara cenital a 640×360, una cámara de muñeca a 640×480 y el estado articular de 6 dimensiones; la salida es una acción de posición articular de 6 dimensiones. El extractor visual es un ResNet-18.

El entrenamiento se realizó con LeRobot sobre el dataset `SamruddhiThorat07/green_pilot`, compuesto por 10 demostraciones teleoperadas (5.322 fotogramas a 30 fps) de la tarea "Put the green cube in the basket". Se ejecutaron 3.000 pasos con batch size 8 y learning rate 1e-5, completándose en 15 minutos 45 segundos en una RTX 3060. No se documentan en la información disponible fases de RLHF, DPO ni aumentos de datos; el paradigma es imitación supervisada pura sobre un layout fijo.

## Capacidades

- Control de manipulación robótica de una tarea concreta: colocar un cubo verde en una cesta con un brazo SO-101.
- Predicción de acciones en chunks de 100 posiciones articulares de 6 dimensiones.
- Fusión de dos vistas de cámara (cenital y muñeca) con estado articular proprioceptivo.
- Ejecución de rollouts episódicos mediante `lerobot-rollout` con la estrategia `episodic`.
- Integración nativa con el ecosistema LeRobot (carga de política, robot `so101_follower` y cámaras declaradas por nombre).
- No soporta tool calling, function calling, razonamiento multi-paso textual, generación de lenguaje, visión general, audio ni modo thinking: sus capacidades están limitadas a la política de imitación entrenada.

## Casos de uso

- Reproducción de un pipeline completo de imitación: sirve como referencia para entrenar una política ACT con LeRobot desde la captura de demos teleoperadas hasta el despliegue, con un coste de entrenamiento de minutos en una GPU de consumo.
- Validación de hardware SO-101: permite comprobar el funcionamiento de un brazo SO-101, sus cámaras y el bus de actuadores antes de invertir en datasets mayores, ya que la tarea y las resoluciones de cámara están fijadas.
- Docencia y formación en robótica: ejemplo mínimo y verificable (10 demos, 5.322 fotogramas) para explicar action chunking, políticas visomotoras y evaluación de rollouts.
- Benchmark interno de infraestructura: con 51,6 M de parámetros y 0,2 GB de pesos, es útil para medir latencia de inferencia, carga de safetensors y throughput de `lerobot-rollout` en distintos equipos.
- Punto de partida para fine-tuning: al estar bajo Apache 2.0 y con un dataset propio publicado, puede reentrenarse con más demostraciones o nuevas posiciones del cubo para ampliar la generalización.
- Demostración de tareas pick-and-place en ferias o vídeos técnicos: en la disposición exacta de entrenamiento reporta 10/10 de éxito, lo que lo hace adecuado para una demo controlada de "cubo verde a la cesta".

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no es un modelo de lenguaje. El único dato de rendimiento reportado por el autor es la tasa de éxito en la tarea:

| Metrica | Resultado | Condiciones |
|---|---|---|
| Tasa de exito en rollouts | 10/10 | Layout de entrenamiento (posicion fija del cubo y de la cesta) |
| Tiempo de entrenamiento | 15 min 45 s | 3.000 pasos, batch 8, lr 1e-5, RTX 3060 |
| Generalizacion a nuevas posiciones | no evaluada | El autor indica que no se ha probado |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,6 M de parámetros y pesos en safetensors de 0,2 GB, la huella de pesos es inferior a 1 GB en precisión nativa, a la que hay que sumar el coste de las dos cámaras y del backbone ResNet-18.
- GPU recomendadas: el autor entrenó en una RTX 3060; para inferencia es suficiente una GPU de consumo moderna con CUDA. No se documentan requisitos para A100 o H100.
- Cabe en GPU de consumo: sí, el entrenamiento se completó en una RTX 3060; el despliegue con `--device=cuda` está soportado.
- Opciones de despliegue: `lerobot-rollout` con `--policy.path=SamruddhiThorat07/act_green_pilot`, robot `so101_follower` y cámaras declaradas por nombre (`overhead`, `wrist`). No se documentan opciones para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de otros modelos comparables en la información proporcionada (ni métricas de éxito, ni parámetros, ni contexto) para establecer una comparación rigurosa. Se indica "no disponible".

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_green_pilot | 51,6 M | no aplica | 10/10 en layout de entrenamiento | Apache 2.0 | Hugging Face |
| Alternativas ACT/LeRobot comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Generalización nula fuera del layout de entrenamiento: el cubo parte de una posición fija y la cesta está en un lugar fijo; el autor confirma que no se ha probado con nuevas posiciones del cubo.
- Dataset muy pequeño: solo 10 demostraciones y 5.322 fotogramas, lo que limita la robustez frente a variaciones de iluminación, fondo u oclusiones.
- Dependencia estricta de la configuración de cámaras: los nombres (`overhead`, `wrist`) y las resoluciones (640×360 y 640×480) deben coincidir con los del entrenamiento; cualquier cambio invalida la política.
- Tarea única y en inglés en la interfaz de ejecución (`--dataset.single_task="Put the green cube in the basket"`); no hay capacidades multilingües ni de lenguaje.
- Riesgo de sobreajuste a la dinámica del robot concreto: cambios en el brazo, en la calibración o en el bus de actuadores pueden degradar el comportamiento.
- No es un modelo generativo de texto: no debe evaluarse con métricas de LLM ni usarse para tareas de lenguaje, código o razonamiento.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación fuera del layout de entrenamiento hace desaconsejable su uso en producción sin reentrenamiento y validación adicionales.
- No se documentan sesgos sociales ni riesgos de alucinación en el sentido de los LLM; el riesgo principal es de fallo físico en la manipulación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SamruddhiThorat07/act_green_pilot
- Dataset de entrenamiento: https://huggingface.co/datasets/SamruddhiThorat07/green_pilot
- Demo y código: https://github.com/SamruddhiThorat07/so101-act-green-cube
- Paper de ACT: https://arxiv.org/abs/2304.13705
- LeRobot (librería): https://github.com/huggingface/lerobot
