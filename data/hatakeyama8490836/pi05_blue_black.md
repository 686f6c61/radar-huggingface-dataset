# hatakeyama8490836/pi05_blue_black

## Resumen

π₀.₅ (Pi05) es un modelo de vision-lenguaje-accion (VLA) desarrollado por Physical Intelligence, disenado para la generalizacion en entornos abiertos: evoluciona π₀ para responder ante situaciones y entornos que no se vieron durante el entrenamiento. Este repositorio concreto, `hatakeyama8490836/pi05_blue_black`, es un ajuste fino del modelo publicado por un tercero (usuario hatakeyama8490836) sobre una tarea robotica especifica, empaquetado con la libreria LeRobot de Hugging Face y la implementacion adaptada del repositorio OpenPI de Physical Intelligence.

El modelo consume observaciones multimodales (estado articular de 6 dimensiones y tres camaras: lateral, de muneca y cenital) y produce acciones de 6 dimensiones para un robot tipo `so_follower` (brazo SO-100/SO-101 de bajo coste). El checkpoint contiene 4.143.404.816 parametros en formato safetensors, con un tamano de repositorio de 9,4 GB.

Es relevante como ejemplo de despliegue de un VLA de gran tamano sobre hardware de robotica accesible: el ajuste se realizo con solo 60 episodios y 34.669 fotogramas a 30 FPS, lo que ilustra la viabilidad del fine-tuning de politicas VLA con datasets pequenos. No obstante, se trata de un artefacto experimental sin evaluacion publicada ni licencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA), implementacion LeRobot de π₀.₅ (OpenPI) |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria lerobot) |
| Tipo de robot | `so_follower` |
| Entradas | `observation.state` (6,), `observation.images.side` (3, 360, 640), `observation.images.wrist` (3, 720, 1280), `observation.images.top` (3, 360, 640) |
| Salidas | `action` (6,) |
| Tamano del repositorio | 9,4 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura π₀.₅ de Physical Intelligence, un modelo VLA que combina un backbone de vision-lenguaje con un cabezal de acciones, adaptado a LeRobot desde el repositorio OpenPI. La model card no detalla la composicion interna (tipo de transformer, atencion, etc.), por lo que los detalles arquitectonicos concretos no estan disponibles en la informacion proporcionada. El checkpoint se distribuye en safetensors con 4.143.404.816 parametros.

El ajuste fino se realizo sobre el dataset `hatakeyama8490836/blue-and-black_merged`, compuesto por 60 episodios y 34.669 fotogramas a 30 FPS, con una unica tarea: "Move the blue-and-black connector into the black square area." La configuracion de entrenamiento fue de 1000 pasos, batch size 1, optimizador AdamW, learning rate 2,5e-05 y semilla 1000, usando LeRobot 0.6.2. No se especifica el numero de tokens de entrenamiento ni si hubo etapas de RLHF/DPO (no aplicables en este contexto de imitacion).

## Capacidades

- Control robotico de imitacion: genera acciones de 6 dimensiones para un brazo `so_follower` a partir de estado articular y tres vistas de camara.
- Fusion multimodal: integra tres flujos visuales (lateral, muneca, cenital) con el estado del robot.
- Generalizacion a entornos no vistos: hereda el objetivo de π₀.₅ de generalizar a situaciones novedosas, aunque el ajuste fino esta acotado a una tarea concreta.
- Ejecucion de tareas de manipulacion de precision: la tarea entrenada implica colocar un conector en una zona objetivo.
- Integracion con LeRobot: compatible con `lerobot-rollout` y `lerobot-train` para despliegue y reentrenamiento.
- Soporte de tool calling / function calling: no aplicable (modelo de robotica, no de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (thinking mode, vision, audio): vision si (tres camaras); audio y thinking mode no disponibles.

## Casos de uso

- Manipulacion robotica de insercion: el modelo ejecuta la tarea de introducir un conector azul y negro en una zona cuadrada negra, adecuado para tareas de ensamblaje de precision con un brazo SO-100/SO-101.
- Prototipado rapido de politicas VLA: con 60 episodios y 1000 pasos de entrenamiento, sirve como plantilla para validar el flujo completo de LeRobot (grabacion, entrenamiento y rollout) en un laboratorio.
- Investigacion en imitacion con pocos datos: util para estudiar como se comporta un VLA de 4,1 mil millones de parametros con datasets pequenos y que grado de generalizacion se obtiene.
- Despliegue en hardware de bajo coste: al estar pensado para `so_follower`, permite probar politicas VLA en robots asequibles sin GPUs de datacenter.
- Benchmark interno de pipelines de robotica: sirve como referencia para comparar configuraciones de camaras, tasas de fotogramas y ajustes de entrenamiento en tareas de pick-and-place.
- Educacion y formacion: ejemplo didactico de entrenamiento y ejecucion de un modelo VLA con la CLI de LeRobot, replicable en cursos de robotica e IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 4.143.404.816 parametros en safetensors, los pesos en precision completa (fp32) ocuparian aproximadamente 16,6 GB, en fp16/bf16 unos 8,3 GB y en int8 unos 4,1 GB (estimacion a partir del recuento de parametros, no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor; por tamano, una GPU con 16-24 GB de VRAM (RTX 4090, A100 40 GB) seria suficiente para inferencia en fp16, aunque no hay confirmacion.
- Cabe en consumer GPU: previsiblemente si en tarjetas de 16 GB o mas en fp16, y en 8 GB con cuantizacion, pero no esta verificado.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) y `lerobot-train` con `--policy.type=pi05` y `--policy.device=cuda`; soporte de vLLM, llama.cpp, Ollama o TGI no disponible para este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π₀.₅ (Pi05, original) | no disponible | no disponible | VLA generalista | no disponible | OpenPI (Physical Intelligence) |
| π₀ (Pi0) | no disponible | no disponible | VLA generalista | no disponible | OpenPI |
| pi05_blue_black (este) | 4.143.404.816 | no disponible | Insercion de conector (SO follower) | no disponible | Hugging Face (LeRobot) |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada; la comparativa se limita a disponibilidad y proposito.

## Limitaciones y advertencias

- Sin evaluacion publicada: no hay tasas de exito ni pruebas en robot real, por lo que el rendimiento real es desconocido.
- Dataset muy pequeno: 60 episodios y 1000 pasos de entrenamiento limitan la robustez y la generalizacion fuera de la tarea entrenada.
- Licencia no declarada: no se especifican condiciones de uso comercial; debe contactarse con el autor antes de cualquier uso productivo.
- Acoplado a hardware concreto: entradas y salidas estan fijadas a `so_follower` con tres camaras en resoluciones especificas (360x640, 720x1280, 360x640); no es portable a otros robots sin reentrenamiento.
- Tarea unica: solo se entreno para "Move the blue-and-black connector into the black square area"; no se documenta generalizacion a otras tareas.
- Idiomas no disponibles: no se declaran capacidades linguisticas.
- Riesgo de sobreajuste y alucinacion de acciones: con tan pocos datos, la politica puede fallar ante cambios de iluminacion, posiciones u objetos distractores.
- Sin cuantizaciones publicadas: no hay pesos GGUF ni versiones optimizadas para despliegue ligero.
- Repositorio con 0 descargas y 0 likes: sin validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hatakeyama8490836/pi05_blue_black
- Dataset de entrenamiento: https://huggingface.co/datasets/hatakeyama8490836/blue-and-black_merged
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=hatakeyama8490836/blue-and-black_merged
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Guia de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
