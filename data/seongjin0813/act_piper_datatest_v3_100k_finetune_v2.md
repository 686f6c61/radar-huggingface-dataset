# seongjin0813/act_piper_datatest_v3_100k_finetune_v2

## Resumen

El modelo `seongjin0813/act_piper_datatest_v3_100k_finetune_v2` es una política de imitación robótica basada en ACT (Action Chunking with Transformers), no un modelo de lenguaje. Lo publica el usuario de HuggingFace seongjin0813 y se ha entrenado y exportado con la librería LeRobot de HuggingFace. ACT es un método de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, y aprende a partir de datos de teleoperación para conseguir tasas de éxito elevadas en tareas de manipulación.

La política está diseñada para un robot de tipo `piper_follower` con una única cámara frontal, y consume un vector de estado de 7 dimensiones junto con una imagen RGB de 240x424 píxeles para producir una acción de 7 dimensiones. El modelo tiene 51.670.663 parámetros (según el archivo safetensors) y se distribuye en formato safetensors con licencia Apache 2.0.

Es relevante ahora porque forma parte del ecosistema LeRobot, que estandariza el entrenamiento y despliegue de políticas robóticas en PyTorch, facilitando reutilizar checkpoints entrenados sobre datasets concretos. Su tamaño reducido lo hace apto para inferencia en tiempo real en hardware modesto, aunque su utilidad práctica está limitada al robot y la configuración de cámara específicos para los que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con encoder VAE y decoder de action chunks (ACT, Action Chunking with Transformers) |
| Parametros totales | 51.670.663 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de robótica con ventana de observación fija) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Tipo de robot | piper_follower |
| Camaras | front |
| Entrada de estado | observation.state, shape (7,) |
| Entrada visual | observation.images.front, shape (3, 240, 424) |
| Salida | action, shape (7,) |
| Tamano del repositorio | 0.2 GB |
| Descargas | 34 |
| Likes | 0 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un encoder de variacional autoencoder (VAE) para capturar la variabilidad humana y un transformer encoder-decoder que predice secuencias de acciones (chunks temporales) en lugar de una sola acción por paso. Esta decodificación por fragmentos mitiga el problema del compounding error típico de las políticas que actúan paso a paso. La política consume un vector de estado proprioceptivo de 7 dimensiones y una imagen frontal de 240x424 píxeles, y produce una acción de 7 dimensiones, todo ello gestionado por los componentes de LeRobot.

El entrenamiento se realizó con LeRobot versión 0.6.2 y se configuró con 50000 pasos, tamaño de batch 8, optimizador AdamW, tasa de aprendizaje 5e-06 y semilla 1000. El dataset de entrenamiento es `seongjin0813/my_piper_datatest_v3_100k_finetune_v1`, compuesto por 20 episodios y 16459 fotogramas a 30 FPS, aunque el campo de tarea del dataset aparece vacío en la model card. No se reporta en la información disponible el número de tokens, la composición detallada del dataset ni el uso de RLHF/DPO, ya que no aplica en este contexto de aprendizaje por imitación.

## Capacidades

- Generacion de acciones de control robótico: predice chunks de acciones de 7 dimensiones a partir de observaciones visuales y de estado.
- Manipulación robótica guiada por visión: consume una única imagen frontal de 240x424 para condicionar el comportamiento.
- Aprendizaje por imitación sobre datos de teleoperación: reproduce tareas demostradas en el dataset de entrenamiento.
- Integración con la pila LeRobot: entrenamiento con `lerobot-train` y despliegue en robot con `lerobot-rollout`.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica en el sentido lingüístico; su razonamiento es la planificación de chunks de acción.
- Capacidades multilingües: no aplica.
- Capacidades especiales (thinking mode, visión, audio): visión de una sola cámara frontal; no dispone de modo de razonamiento explícito ni audio.

## Casos de uso

- Manipulación robótica de precisión para el robot `piper_follower`: desplegar la política sobre el robot compatible para ejecutar tareas aprendidas mediante teleoperación (por ejemplo, recogida y colocación de objetos), aprovechando que la observación esperada coincide exactamente con la configuración de entrenamiento.
- Automatización de una celda de pick-and-place: con una sola cámara frontal y un espacio de acción de 7 grados de libertad, la política puede integrarse en una estación que repita gestos de manipulación en un entorno controlado.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el rendimiento de ACT frente a otros métodos como Diffusion Policy sobre el mismo dataset.
- Reentrenamiento y fine-tuning sobre datasets propios: al estar entrenado con LeRobot, es una base para experimentar con datos adicionales de teleoperación del mismo robot.
- Benchmarking interno de políticas robóticas: comparar tasas de éxito de este checkpoint con otras variantes entrenadas sobre el mismo dataset (por ejemplo, la v1 referenciada).
- Docencia y prototipado de robótica con IA: su tamaño reducido permite desplegarlo en hardware accesible para prácticas de robótica y percepción.
- Validación de pipelines de despliegue: comprobar el flujo completo `lerobot-rollout` con `strategy.type=base` en un robot real antes de escalar a tareas más complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que todavía no se han proporcionado resultados de evaluación para esta política ("No evaluation results have been provided for this policy yet"), por lo que no se dispone de tasas de éxito por tarea, repeticiones ni condiciones de prueba.

## Requisitos de hardware

- VRAM estimada para inferencia: al tener 51.670.663 parámetros, en fp32 ocuparía aproximadamente 0,21 GB y en fp16 alrededor de 0,10 GB, lo que supone una huella muy reducida. No se especifican cuantizaciones compatibles en la información disponible.
- GPU recomendadas: cualquier GPU moderna con al menos unos pocos GB de VRAM es suficiente a nivel de modelo; el cuello de botella real es el procesamiento de imagen por cámara y la latencia del lazo de control. GPU como RTX 3060, RTX 4090, A100 o H100 pueden ejecutarla sin problema.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo actual con unos pocos GB de memoria libre, dado el tamaño del modelo.
- Opciones de despliegue: LeRobot (comandos `lerobot-rollout` y `lerobot-train`) sobre PyTorch. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de latencia ni de frecuencia de ejecución efectiva más allá de los 30 FPS del dataset.

## Comparativa con modelos similares

No se dispone de datos cuantitativos de rendimiento para realizar una comparativa rigurosa. A continuación se indican alternativas de la misma categoría (políticas de manipulación robótica por imitación) con la información estructural disponible:

| Modelo | Tipo | Parametros | Entrada | Licencia | Notas |
|---|---|---|---|---|---|
| act_piper_datatest_v3_100k_finetune_v2 | ACT (transformer + VAE) | 51.670.663 | estado (7,) + imagen frontal (3, 240, 424) | apache-2.0 | Entrenado sobre 20 episodios / 16459 frames, robot piper_follower |
| Diffusion Policy (referencia de metodo) | Politica de difusion | no disponible | depende de la configuracion | no disponible | Alternativa habitual a ACT en aprendizaje por imitacion |
| Otras políticas ACT de LeRobot | ACT | depende del checkpoint | depende del robot | habitualmente apache-2.0 | Multiples checkpoints publicados en el Hub de LeRobot |

La comparativa carece de datos de benchmarks comparables, por lo que los valores de rendimiento no pueden contrastarse.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto ni genera respuestas; cualquier uso fuera del control robótico no aplica.
- Sesgos conocidos: no disponible en la información proporcionada; al tratarse de una política de imitación, heredará los sesgos de las demostraciones de teleoperación del dataset.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero existe riesgo de generalización deficiente fuera de las condiciones vistas en entrenamiento (posiciones de objetos, iluminación, distractores).
- Limitación de contexto: la observación es de una única cámara frontal y un estado de 7 dimensiones; no hay memoria de largo plazo explícita más allá de los action chunks.
- Limitación de idioma: no aplica; el modelo no maneja lenguaje.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el dataset de entrenamiento puede tener sus propias condiciones que conviene revisar.
- Caveat para producción: el dataset es muy reducido (20 episodios, 16459 fotogramas) y no se han publicado evaluaciones en robot real, por lo que la fiabilidad en producción no está demostrada.
- La política está vinculada a un robot concreto (`piper_follower`) y a una configuración de cámara específica; usarla con otro hardware o nombres de cámara distintos requeriría adaptaciones.
- La model card advierte que los nombres e índices de cámara deben coincidir con las claves de observación de entrenamiento para que el despliegue funcione.
- No se especifican cuantizaciones soportadas ni herramientas de compresión, lo que limita opciones de optimización documentadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/seongjin0813/act_piper_datatest_v3_100k_finetune_v2
- Dataset de entrenamiento: https://huggingface.co/datasets/seongjin0813/my_piper_datatest_v3_100k_finetune_v1
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de imitacion (record data & train a policy): https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de la CLI de LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Espacio para visualizar el dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=seongjin0813/my_piper_datatest_v3_100k_finetune_v1
