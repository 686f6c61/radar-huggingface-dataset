# JustinMJW/pi05_omx

## Resumen

JustinMJW/pi05_omx es un "policy" de robotica (Vision-Language-Action) entrenado con LeRobot, la libreria de Hugging Face para aprendizaje por imitacion en robots reales. Se trata de un ajuste fino del modelo base lerobot/pi05_base, que a su vez es una implementacion en LeRobot de π₀.₅ (Pi05) de Physical Intelligence, un modelo VLA disenado para generalizacion en entornos abiertos.

El modelo resuelve el problema de control motor guiado por instrucciones en lenguaje natural: consume el estado del robot (vector de 6 dimensiones) y una imagen RGB de una camara y produce un vector de accion de 6 dimensiones. En este repositorio concreto ha sido especializado en una unica tarea, "pick eraser and put in the cup" (coger la goma de borrar y ponerla en el vaso), sobre un robot de tipo omx_f.

Es relevante como ejemplo de como un modelo VLA generalista se puede adaptar a un hardware y una tarea concretos con un dataset muy pequeno (72 episodios, 10.696 frames a 15 FPS), lo que ilustra el flujo de trabajo de ajuste fino eficiente en robotica. El modelo cuenta con aproximadamente 4.143 millones de parametros, licencia Apache 2.0 y se distribuye en formato safetensors a traves del Hub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA); detalles de la arquitectura interna no disponibles en la informacion proporcionada |
| Parametros totales | 4.143.404.816 (aproximadamente 4,14 mil millones) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible / no aplicable (policy de robotica, no modelo conversacional) |
| Tipos de cuantizacion | no disponibles; el repositorio distribuye pesos en safetensors sin cuantizaciones publicadas |
| Idiomas soportados | no disponibles (acepta instrucciones en lenguaje natural, la tarea del dataset esta en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria LeRobot) |

## Arquitectura y entrenamiento

Se trata de un modelo de tipo Vision-Language-Action (VLA) construido sobre π₀.₅ (Pi05), presentado por Physical Intelligence como una evolucion de π₀ orientada a generalizar a entornos y situaciones completamente nuevas no vistas durante el entrenamiento. La implementacion utilizada es la de LeRobot, adaptada a su vez del repositorio OpenPI de Physical Intelligence. La model card no detalla la arquitectura interna (si usa transformer, mezcla de expertos o tecnicas de flow matching), por lo que esos datos no estan disponibles en la informacion proporcionada.

El ajuste fino se realizo sobre el dataset JustinMJW/omx2, compuesto por 72 episodios y 10.696 frames grabados a 15 FPS para una unica tarea ("pick eraser and put in the cup"). La configuracion de entrenamiento reporta 20.000 pasos, batch size de 32, optimizador AdamW, learning rate de 2,5e-05 y semilla 1000, usando LeRobot 0.6.2. La entrada del modelo combina el estado del robot (shape (6,)) y una imagen de la camara camera1 (shape (3, 480, 640)), y la salida es un vector de accion de shape (6,). No se especifica el numero de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Control motor guiado por instrucciones: genera acciones de 6 grados de libertad a partir de una instruccion en lenguaje natural.
- Percepcion visual: procesa imagenes RGB de 480x640 píxeles procedentes de una camara.
- Fusion de estado proprioceptivo y vision: combina un vector de estado de 6 dimensiones con la observacion visual para decidir la accion.
- Ejecucion de una tarea de manipulacion concreta: "pick eraser and put in the cup".
- Integracion con el ecosistema LeRobot: se ejecuta mediante el comando lerobot-rollout y admite estrategias de rollout.
- Soporte de tool calling / function calling: no disponible (no es una capacidad de este tipo de modelo).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (thinking mode, audio, etc.): no disponibles.

## Casos de uso

- Manipulacion robotica de recogida y colocacion: el modelo ejecuta la tarea de coger un objeto y depositarlo en un contenedor, adecuado para tareas de pick-and-place en entornos controlados con un robot omx_f.
- Investigacion en aprendizaje por imitacion: sirve como caso de estudio para reproducir el flujo de ajuste fino de un modelo VLA a partir de un dataset pequeno (72 episodios) usando LeRobot.
- Base para transferencia a nuevas tareas: al partir de lerobot/pi05_base, se puede reutilizar como punto de partida para ajustar a otras tareas de manipulacion con hardware similar.
- Prototipado rapido en robotica de laboratorio: permite poner en marcha una policy funcional mediante lerobot-rollout con un unico comando, lo que agiliza las pruebas de concepto.
- Evaluacion de generalizacion de politicas VLA: util para estudiar como un modelo ajustado se comporta ante variaciones de posicion, iluminacion o distracciones (la model card no reporta resultados de esta evaluacion).
- Docencia y formacion en robotica con IA: ejemplo practico de captura de datos, entrenamiento y despliegue de una policy en un robot real dentro del ecosistema LeRobot.
- Benchmark interno de infraestructura de inferencia robotica: permite medir latencia y throughput de un modelo de 4,14 mil millones de parametros en el hardware del robot o de una estacion de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que todavia no se han proporcionado resultados de evaluacion para esta policy ("No evaluation results have been provided for this policy yet"), por lo que no se dispone de tasas de exito ni de comparativas numericas.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir de los 4.143 millones de parametros; no confirmada por el autor): aproximadamente 8,3 GB en FP16/BF16, unos 4,2 GB en cuantizacion de 8 bits y unos 2,1 GB en 4 bits, mas el overhead de activaciones y del procesamiento de imagen.
- GPU recomendadas: no especificadas por el autor. En funcion del tamano, una GPU con 16-24 GB (por ejemplo RTX 4090, A100, H100) seria suficiente para inferencia en precision completa.
- Compatibilidad con GPU de consumo: probable en tarjetas con al menos 16 GB de VRAM (por ejemplo RTX 4090 o RTX 3090); en GPUs con menos memoria seria necesario recurrir a cuantizacion, aunque no se publican pesos cuantizados.
- Opciones de despliegue: LeRobot mediante el comando `lerobot-rollout` (estrategia base). No se indica soporte para vLLM, llama.cpp, Ollama ni TGI, que no son formatos habituales para policies de robotica.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| JustinMJW/pi05_omx | 4,14 mil millones | VLA (policy de robotica) | Apache 2.0 | Hugging Face (LeRobot) | Ajuste fino especializado en una tarea sobre robot omx_f |
| lerobot/pi05_base | no disponible | VLA (policy de robotica) | no disponible en la informacion proporcionada | Hugging Face (LeRobot) | Modelo base del que deriva pi05_omx |
| Otras policies de LeRobot (por ejemplo ACT, Diffusion Policy, SmolVLA) | no disponible | Policy de aprendizaje por imitacion | no disponible | Hugging Face (LeRobot) | Alternativas de la misma categoria, sin datos de parametros ni rendimiento en la informacion proporcionada |

No se dispone de datos de rendimiento ni de parametros de los modelos alternativos en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- El modelo esta especializado en una unica tarea ("pick eraser and put in the cup") y un unico hardware (robot omx_f con una camara camera1); su uso fuera de ese contexto no esta garantizado.
- No se han publicado resultados de evaluacion, por lo que se desconoce su tasa de exito real en la tarea.
- El dataset de ajuste es muy pequeno (72 episodios, 10.696 frames), lo que puede limitar la robustez ante variaciones de posicion, iluminacion o presencia de distractores.
- Riesgo de alucinacion o de acciones incorrectas inherente a los modelos generativos de acciones; no se documentan medidas de seguridad especificas.
- Las entradas estan fijadas a un estado de 6 dimensiones y a una imagen RGB de 480x640; desviarse de ese formato de observacion puede provocar fallos.
- Las camaras deben coincidir con las claves de observacion con las que se entreno la policy (`observation.images.rgb.camera1`), segun indica la model card.
- No se especifican sesgos conocidos ni limitaciones de idioma mas alla de la tarea en ingles del dataset.
- Restricciones de licencia: se distribuye bajo Apache 2.0, que en principio permite uso comercial, pero debe verificarse el cumplimiento de las licencias del modelo base y de los datos utilizados.
- Aunque el repositorio declara la licencia Apache 2.0, no se detallan las condiciones de los datos de entrenamiento, lo que conviene revisar antes de un uso en produccion.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/JustinMJW/pi05_omx
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/JustinMJW/omx2
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=JustinMJW/omx2
- Blog de π₀.₅ (Pi05) de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi (referenciado de forma indirecta; enlace no incluido explicitamente en la model card)
- LeRobot en GitHub: https://github.com/huggingface/lerobot
- Guia de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
