# inhastupid/act_quick

## Resumen

`inhastupid/act_quick` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), un enfoque de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales. El modelo lo publica el usuario `inhastupid` en Hugging Face usando la librería LeRobot de Hugging Face, y está diseñado para controlar un robot seguidor del tipo `so_follower` (brazo tipo SO-100/SO-101) equipado con una cámara cenital.

La política resuelve una tarea concreta de manipulación: recoger un objeto y colocarlo sobre un objetivo ("Pick the object and place it on the target"). Se entrenó a partir de un dataset propio de 32 episodios teleoperados (19.200 fotogramas a 30 FPS) y cuenta con 51.668.614 parámetros, un tamaño típico para políticas ACT de este tipo. No es un modelo de lenguaje: es un modelo de control visuomotor que consume el estado del robot y una imagen y emite comandos de acción de 6 dimensiones.

Su relevancia es acotada y práctica: sirve como ejemplo reproducible de entrenamiento y despliegue de una política ACT con LeRobot 0.7.1, y como punto de partida para quien quiera replicar el flujo de trabajo (grabar datos, entrenar, hacer rollout) en un robot real. No es un modelo de propósito general ni un modelo fundacional de robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control por pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; no procesa lenguaje) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` |
| Camaras | `top` (una camara cenital) |
| Entrada de estado | `observation.state` con forma `(6,)` |
| Entrada visual | `observation.images.top` con forma `(3, 480, 640)` |
| Salida de accion | `action` con forma `(6,)` |
| Dataset de entrenamiento | `inhastupid/pick_place_20261116_163948` |
| Episodios / fotogramas | 32 episodios / 19.200 fotogramas |
| Frecuencia de datos | 30 FPS |
| Pasos de entrenamiento | 3.000 |
| Tamano de lote | 8 |
| Optimizador | AdamW |
| Tasa de aprendizaje | 1e-05 |
| Semilla | 1000 |
| Version de LeRobot | 0.7.1 |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación presentado en el paper arXiv 2304.13705. La arquitectura combina un codificador visual (que procesa la imagen de la cámara cenital de 480x640) con un transformer que fusiona la representación visual y el estado del robot (6 dimensiones) para producir un fragmento de acciones (action chunk) en lugar de una única acción. Esta predicción por bloques reduce el error de acumulación y mejora la estabilidad del control en tareas de manipulación. El modelo también incorpora un decodificador de estilo CVAE (variable latente) para modelar la multimodalidad de las demostraciones humanas, un componente habitual en ACT.

El entrenamiento se realizó con LeRobot 0.7.1 sobre el dataset `inhastupid/pick_place_20261116_163948`, compuesto por 32 episodios teleoperados que suman 19.200 fotogramas a 30 FPS, con una única tarea: "Pick the object and place it on the target". La configuración fue de 3.000 pasos, lote de 8, optimizador AdamW, tasa de aprendizaje 1e-05 y semilla 1000. No se documenta en la model card el uso de RLHF, DPO ni ningún otro ajuste posterior al entrenamiento supervisado por imitación. Tampoco se detalla la composición exacta del dataset más allá de la tarea y las cifras de episodios y fotogramas.

## Capacidades

- Control visuomotor de un brazo robótico `so_follower` con una cámara cenital como única entrada visual.
- Ejecución de la tarea concreta de recoger un objeto y colocarlo sobre un objetivo, entrenada sobre 32 episodios teleoperados.
- Predicción de fragmentos de acción (action chunking) en lugar de pasos individuales, lo que aporta estabilidad al control.
- Consumo de estado proprioceptivo de 6 dimensiones y emisión de comandos de acción de 6 dimensiones.
- Despliegue e inferencia mediante `lerobot-rollout` con la estrategia base.
- Reentrenamiento y ajuste mediante `lerobot-train` sobre datasets propios en formato LeRobot.
- No soporta tool calling, function calling, razonamiento multi-paso, capacidades multilingües, visión general, audio ni modos de pensamiento: es una política de control específica de tarea.

## Casos de uso

- Recogida y colocación de objetos en un banco de trabajo: la política ejecuta la tarea "Pick the object and place it on the target" sobre un robot `so_follower` con cámara cenital, adecuada para demostraciones de pick-and-place en entornos controlados.
- Prototipado de flujos de aprendizaje por imitación con LeRobot: sirve como referencia reproducible para validar el pipeline completo (grabación de datos, entrenamiento con `lerobot-train` y rollout con `lerobot-rollout`) antes de escalar a tareas propias.
- Base para fine-tuning con datos propios: al ser una política ACT pequeña (51,7 M de parámetros), se puede reentrenar con un dataset nuevo y un número de pasos similar (3.000) en hardware de consumo.
- Docencia y formación en robótica: permite ilustrar de forma práctica el funcionamiento de ACT, el formateo de observaciones y acciones y la integración con el ecosistema LeRobot.
- Pruebas de calibración de cámara y robot: el rollout con `--duration=60` y la cámara `top` sirven para verificar la correspondencia entre las claves de observación del entrenamiento y la configuración física real.
- Evaluación comparativa de métodos de imitación: al ser una política ACT estándar, puede usarse como línea base frente a otros métodos (por ejemplo, Diffusion Policy) en la misma tarea y robot.
- Automatización de tareas repetitivas de laboratorio: en entornos donde la posición de los objetos y la iluminación son estables, la política puede ejecutar ciclos de pick-and-place de forma autónoma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito en robot real, número de ensayos ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 51,7 M de parámetros en precisión FP32, los pesos ocupan aproximadamente 207 MB; en FP16, unos 103 MB, a lo que hay que sumar el codificador visual y las activaciones. En la práctica, la inferencia cabe holgadamente en cualquier GPU de consumo moderna.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 3060, RTX 4060 o superior es suficiente para inferencia; para entrenamiento con lote 8 y 3.000 pasos, una RTX 4090 o una A100 aceleran considerablemente el proceso, aunque no se documentan tiempos.
- Cabe en GPU de consumo: sí, con alta probabilidad, dado el reducido número de parámetros. No se dispone de una confirmación explícita del autor.
- Opciones de despliegue: `lerobot-rollout` (estrategia base) para ejecución en robot real y `lerobot-train` para reentrenamiento, ambos de la librería LeRobot 0.7.1. No se documentan opciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La política está pensada para operar a 30 FPS (frecuencia de los datos de entrenamiento), pero no se publican mediciones de latencia real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `inhastupid/act_quick` | 51.668.614 | no aplica | Pick-and-place con `so_follower` y camara `top` | no disponible | Hugging Face (LeRobot) |
| ACT (implementacion de referencia LeRobot) | no disponible | no aplica | Politicas de imitacion genericas | Apache 2.0 (LeRobot) | GitHub / Hugging Face |
| Diffusion Policy (implementacion LeRobot) | no disponible | no aplica | Politicas de imitacion con diffusion | Apache 2.0 (LeRobot) | GitHub / Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada. La comparacion se limita a categoria, tarea y disponibilidad; los datos de parametros y contexto de las alternativas no estan publicados en la informacion disponible.

## Limitaciones y advertencias

- Licencia no especificada: la model card indica "[More Information Needed]" y no se declara licencia en los metadatos, por lo que el uso comercial queda sin autorizacion explicita.
- Sin resultados de evaluacion: no hay tasas de exito ni ensayos en robot real, de modo que se desconoce su fiabilidad practica.
- Entrenada con solo 32 episodios y 3.000 pasos: la cobertura de posiciones, iluminacion y variaciones de objetos es muy limitada, y es probable que falle ante cambios en el entorno.
- Especifica de una sola tarea ("Pick the object and place it on the target") y de un unico robot (`so_follower`) con una unica camara (`top`); no generaliza a otras tareas, robots ni configuraciones de camara.
- Dependencia de la calibracion: las claves de observacion (`observation.state`, `observation.images.top`) deben coincidir exactamente con la configuracion fisica; un desajuste invalida el rollout.
- Riesgo de sobreajuste al dataset: con 32 episodios y una tasa de aprendizaje baja durante 3.000 pasos, la politica puede memorizar trayectorias y no responder bien a perturbaciones.
- Sin capacidades de lenguaje, razonamiento ni tool calling: no debe evaluarse como un modelo de lenguaje ni usarse fuera del contexto de control robótico.
- No se documentan sesgos, pero al derivarse de demostraciones humanas puede heredar sesgos de las trayectorias teleoperadas (por ejemplo, posiciones preferidas del operador).
- Fecha de creacion futura (2026-11-16) en los metadatos: conviene verificar la integridad y procedencia del repositorio antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inhastupid/act_quick
- Dataset de entrenamiento: https://huggingface.co/datasets/inhastupid/pick_place_20261116_163948
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=inhastupid/pick_place_20261116_163948
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv 2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
