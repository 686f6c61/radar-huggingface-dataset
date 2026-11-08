# nikodembartnik/act_place_cube_3

## Resumen

El modelo `nikodembartnik/act_place_cube_3` es una política de robótica basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales. Ha sido desarrollado por Nikodem Bartnik y entrenado con la librería LeRobot de Hugging Face, lo que lo integra directamente en el ecosistema de entrenamiento y despliegue de políticas robóticas de código abierto.

El modelo resuelve una tarea concreta de manipulación: colocar un ladrillo en el centro de una esterilla negra. Aprende a partir de 40 episodios teleoperados (15.096 fotogramas a 30 FPS) recogidos sobre un robot `rebot_b601_follower` equipado con dos cámaras (frontal y de muñeca). La política consume el estado del robot de 7 dimensiones y dos imágenes RGB de 480x640, y produce un vector de acción de 7 dimensiones.

Su relevancia radica en ser un ejemplo práctico y reproducible de entrenamiento de políticas visomotoras con LeRobot 0.7.1, con un total de 51,67 millones de parámetros y un tamaño de repositorio de 0,2 GB, lo que lo hace manejable en hardware de consumo para inferencia. No obstante, se trata de una política específica de tarea y robot, sin resultados de evaluación publicados ni licencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual |
| Parametros totales | 51.670.663 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ventana de observación definida por el chunk de acciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Tipo de robot | rebot_b601_follower |
| Camaras | front, wrist |
| Entradas | observation.state (7,), observation.images.front (3,480,640), observation.images.wrist (3,480,640) |
| Salidas | action (7,) |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. En lugar de predecir una única acción por paso de tiempo, el modelo predice un chunk o secuencia corta de acciones futuras, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. La arquitectura combina un codificador visual (para procesar las imágenes de las cámaras frontal y de muñeca) con un transformer que modela la secuencia de estados y acciones. El modelo tiene 51.670.663 parámetros.

El entrenamiento se realizó con LeRobot 0.7.1 sobre el dataset `nikodembartnik/place_cube_in_the_center_3`, compuesto por 40 episodios y 15.096 fotogramas a 30 FPS. La tarea única es "Put the brick in the center of the black mat". La configuración de entrenamiento fue: 80.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se especifica en la model card si hubo RLHF, DPO ni ninguna fase de ajuste posterior al aprendizaje por imitación.

## Capacidades

- Generacion de acciones roboticas: predice chunks de acciones de 7 dimensiones para controlar un robot `rebot_b601_follower`.
- Percepcion visual multimodal: procesa simultaneamente dos flujos de imagen RGB (camara frontal y camara de muñeca) a 480x640.
- Aprendizaje por imitacion: reproduce la tarea aprendida a partir de datos teleoperados.
- Ejecucion de tarea especifica: "Put the brick in the center of the black mat".
- Integracion con LeRobot: se ejecuta mediante `lerobot-rollout` y se entrena con `lerobot-train`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni capacidades multilingues.
- No dispone de modo thinking, vision general, audio ni generacion de texto.

## Casos de uso

- Manipulacion robotica de laboratorio: el modelo puede ejecutar la tarea de colocar un ladrillo en el centro de una esterilla negra como demostracion reproducible de aprendizaje por imitacion en entornos de investigacion.
- Educacion en robotica: sirve como ejemplo practico para ensenar el flujo completo de LeRobot, desde la grabacion de datos teleoperados hasta el despliegue de una politica.
- Prototipado rapido de politicas visomotoras: permite a desarrolladores validar su pipeline de hardware y software antes de escalar a tareas mas complejas.
- Benchmarking de infraestructura de inferencia robotica: al tener 51,67 M de parametros y 0,2 GB, es util para medir latencia y throughput en GPUs de consumo con LeRobot.
- Reentrenamiento y transferencia: la configuracion de entrenamiento documentada permite reproducir el entrenamiento y adaptar la politica a variaciones de la tarea o del robot.
- Investigacion en action chunking: sirve como caso de estudio para comparar la prediccion de chunks frente a la prediccion paso a paso en tareas de pick-and-place.
- Demostraciones en ferias o eventos: al ser una tarea visualmente clara y acotada, es adecuada para exhibiciones de robotica con hardware de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de exito, MMLU, HumanEval, GSM8K ni ninguna otra metrica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 51,67 M de parametros en safetensors (aproximadamente 0,2 GB de pesos en FP32), la inferencia cabria en GPUs con 2-4 GB de VRAM, aunque el consumo real depende del backend y del procesamiento de las dos imagenes de 480x640.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 4 GB de VRAM es suficiente en principio; una RTX 3060, RTX 4060 o superior seria adecuada. Para entrenamiento se recomienda una GPU con mas VRAM (RTX 3090, RTX 4090, A100, H100) por el batch size y el procesamiento de imagenes.
- Cabe en GPU de consumo: si, previsiblemente en la mayoria de GPUs de consumo modernas con 4 GB o mas de VRAM.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) es el metodo documentado. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de politica robotica.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Se puede senalar que existen otras politicas entrenadas con LeRobot (por ejemplo, Diffusion Policy o SmolVLA), pero no se aportan datos de parametros, contexto, rendimiento ni licencia para establecer una comparacion rigurosa.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_place_cube_3 | 51.670.663 | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. Al ser una politica entrenada con 40 episodios de un unico operador y entorno, es probable que tenga un sesgo fuerte hacia las condiciones exactas de recogida de datos (posiciones, iluminacion, fondo).
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero existe riesgo de generalizacion pobre fuera de la distribucion de entrenamiento, lo que puede producir acciones erroneas o inseguras.
- Limitaciones de contexto o idioma: no es un modelo de lenguaje; no procesa texto ni tiene capacidades multilingues. Su "contexto" se limita a las observaciones visuales y de estado definidas.
- Restricciones de licencia para uso comercial: la licencia no esta declarada en la model card ni en los metadatos de Hugging Face, por lo que el uso comercial queda en un limbo legal hasta que el autor la especifique.
- Especificidad de hardware: la politica esta entrenada para el robot `rebot_b601_follower` con camaras `front` y `wrist`; no es directamente transferible a otros robots o configuraciones de camaras sin reentrenamiento.
- Tarea unica: solo realiza "Put the brick in the center of the black mat"; no es una politica generalista.
- Sin evaluacion publicada: no hay tasas de exito ni validacion en robot real, lo que impide conocer su fiabilidad en produccion.
- Fecha de creacion inusual: los metadatos indican creacion en 2026-11-07, lo que puede ser un error de la plataforma o un dato a verificar.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso o validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nikodembartnik/act_place_cube_3
- Dataset de entrenamiento: https://huggingface.co/datasets/nikodembartnik/place_cube_in_the_center_3
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Perfil del autor en Hugging Face: https://huggingface.co/nikodembartnik
- Perfil del autor en GitHub: https://github.com/NikodemBartnik
