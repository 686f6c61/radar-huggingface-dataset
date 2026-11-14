# Hhhhqqq123/hf_act_recordpolicy0

## Resumen
Se trata de una politica de robótica entrenada con el metodo Action Chunking with Transformers (ACT), una tecnica de aprendizaje por imitacion que predice trozos de acciones (action chunks) en lugar de pasos individuales. El modelo ha sido entrenado y publicado con LeRobot, la libreria de Hugging Face para aprendizaje automatico aplicado a robots reales, por el usuario Hhhhqqq123. El repositorio es de tipo experimental: cuenta con 0 descargas y 0 likes, y fue creado el 14 de noviembre de 2026.

El modelo esta especializado en una unica tarea de manipulacion: coger un cubo y dejarlo dentro de una caja ("Pick up the cube and place it in the box"), sobre un robot de tipo SO-100 con dos camaras (top y wrist). Consume el estado articular de 6 dimensiones y dos imagenes RGB de 480x640, y produce un vector de accion de 6 dimensiones. Con 51.668.614 parametros y un tamano de repositorio de 0,2 GB, es un modelo compacto pensado para inferencia en tiempo real a 30 FPS.

Su relevancia es acotada: no es un modelo generalista, sino una politica de imitation learning de referencia para validar el pipeline de entrenamiento e inferencia de LeRobot sobre hardware accesible (SO-100). Resulta util como ejemplo reproducible y como punto de partida para quien quiera entrenar sus propias politicas ACT con el mismo flujo de comandos `lerobot-train` y `lerobot-rollout`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (politica de control; ventana de observacion definida por la configuracion de ACT) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | no disponibles (modelo de robótica, no linguistico) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
ACT es un transformer disenado para aprendizaje por imitacion que predice chunks de acciones de forma conjunta, lo que reduce el error de composicion típico de los metodos autoregresivos paso a paso. El modelo recibe como entrada el estado de las articulaciones (`observation.state`, shape `(6,)`) y dos vistas visuales (`observation.images.top` y `observation.images.wrist`, ambas `(3, 480, 640)`), y emite una accion de 6 dimensiones (`action`, shape `(6,)`). La model card no detalla la composicion interna del encoder visual ni el numero de capas del transformer.

El entrenamiento se realizo sobre el dataset `lerobot/svla_so100_pickplace`, que contiene 50 episodios, 19.631 frames a 30 FPS y una unica tarea de pick-and-place. La configuracion registrada es muy corta: 100 pasos de entrenamiento, batch size 8, optimizador AdamW, learning rate 1e-05, semilla 1000 y LeRobot 0.7.1. No se menciona uso de RLHF, DPO ni tecnicas de refuerzo; es imitation learning puro a partir de datos de teleoperacion. El reducido numero de pasos y la ausencia de resultados de evaluacion sugieren que se trata de un artefacto de prueba del pipeline mas que de una politica pulida.

## Capacidades
- Control robotico de manipulacion: predice acciones de 6 grados de libertad para el robot SO-100 a partir de estado articular e imagenes.
- Aprendizaje por imitacion con action chunking: genera secuencias cortas de acciones coherentes, lo que mejora la estabilidad frente a la prediccion paso a paso.
- Fusion multimodal vision-estado: integra dos camaras (top y wrist) con el estado de las articulaciones en una unica politica.
- Ejecucion en tiempo real: disenado para operar a 30 FPS sobre hardware de bajo coste.
- Tarea unica especializada: entrenado exclusivamente para "Pick up the cube and place it in the box".
- Integracion con LeRobot: compatible con los comandos `lerobot-rollout` y `lerobot-train` para inferencia y reentrenamiento.
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades multilingues ni modos de pensamiento; no es un modelo de lenguaje.

## Casos de uso
- Validacion del pipeline de LeRobot: sirve como politica de referencia para comprobar que la instalacion, calibracion del SO-100 y configuracion de camaras funcionan antes de entrenar politicas propias.
- Demostracion de pick-and-place en laboratorio: permite reproducir la tarea "coger el cubo y dejarlo en la caja" con 50 episodios de teleoperacion como base, util para docencia o prototipado rapido.
- Punto de partida para fine-tuning: al ser un checkpoint ACT funcional, se puede reentrenar con `lerobot-train` sobre un dataset propio y comparar curvas de aprendizaje.
- Benchmark interno de imitation learning: sirve como baseline de bajo coste (51,7 M parametros, 0,2 GB) frente a politicas mas grandes en tareas de manipulacion simples.
- Pruebas de inferencia en hardware consumer: su tamano reducido permite ejecutarlo en GPUs modestas o incluso en CPU para validar latencias antes de desplegar en el robot.
- Integracion en flujos de investigacion sobre action chunking: util para estudiar el efecto del tamano del chunk y de la frecuencia de control en tareas de agarre.
- Replicacion de experimentos: dado que la configuracion de entrenamiento esta documentada (100 pasos, batch 8, lr 1e-05, seed 1000), permite reproducir el resultado y detectar si el bajo numero de pasos es suficiente.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet." No existen tasas de exito, latencias medidas ni comparaciones con otras politicas en el repositorio.

## Requisitos de hardware
- VRAM estimada para inferencia: al tratarse de un modelo de 51,7 M parametros (aproximadamente 0,2 GB en safetensors), la inferencia cabe holgadamente en GPUs con 4-8 GB de VRAM; los pesos en FP32 ocuparian en torno a 0,2 GB y menos aun en FP16.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien funciona en GPUs de datacenter (A100, H100) aunque sobredimensionadas para este tamano.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer con al menos 4 GB de VRAM; tambien es viable en CPU para pruebas, aunque la latencia a 30 FPS puede no cumplirse.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=Hhhhqqq123/hf_act_recordpolicy0`), y potencialmente exportacion a otros runtimes si se convierte el checkpoint; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles. La model card no publica mediciones; el entrenamiento se ejecuto con `--policy.device=cuda`, pero no se especifica el hardware usado.

## Comparativa con modelos similares
No se dispone de datos de rendimiento de este modelo ni de politicas comparables dentro de la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia conceptual, ACT comparte categoria con otras politicas de imitation learning para manipulacion robotica (por ejemplo, Diffusion Policy o VQ-BeT), pero no se han encontrado en el repositorio metricas que permitan contrastarlas.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hhhhqqq123/hf_act_recordpolicy0 | 51.668.614 | no disponible | no evaluado | no disponible | Hugging Face (0 descargas) |
| Alternativas ACT de LeRobot | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Diffusion Policy | no disponible | no disponible | no disponible | no disponible | Repositorios de investigacion |
| VQ-BeT | no disponible | no disponible | no disponible | no disponible | Repositorios de investigacion |

## Limitaciones y advertencias
- Especializacion extrema: solo realiza la tarea "Pick up the cube and place it in the box"; no generaliza a otras tareas sin reentrenamiento.
- Entrenamiento muy corto: 100 pasos con batch 8 es una configuracion minima; es probable que la politica no este convergida y que la tasa de exito real sea baja o nula.
- Sin evaluacion: no hay resultados de exito en robot real, por lo que no se puede afirmar que funcione fuera del entorno de entrenamiento.
- Dependencia de hardware y camaras: requiere un SO-100 con camaras configuradas con los nombres `top` y `wrist` y resolucion 480x640; cambios de posicion, iluminacion o robot invalidan la politica.
- Licencia no disponible: la model card marca la licencia como "[More Information Needed]", lo que impide confirmar si el uso comercial esta permitido.
- Riesgo de sobreajuste al dataset: con 50 episodios y una sola tarea, la politica puede memorizar posiciones y objetos concretos en lugar de aprender la habilidad de forma robusta.
- Repositorio sin actividad: 0 descargas y 0 likes, creado y actualizado con 13 segundos de diferencia, lo que apunta a un artefacto de prueba mas que a un modelo mantenido.
- Sin soporte linguistico ni de razonamiento: no debe usarse como modelo de lenguaje, agente conversacional ni herramienta de codigo.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Hhhhqqq123/hf_act_recordpolicy0
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/svla_so100_pickplace
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de rollout/inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=lerobot/svla_so100_pickplace
