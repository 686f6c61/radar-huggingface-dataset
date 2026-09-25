# ethan-svlh/hf_act_demo_merged

## Resumen

`ethan-svlh/hf_act_demo_merged` es una politica de manipulacion robotica entrenada con ACT (Action Chunking with Transformers), un metodo de aprendizaje por imitacion que predice fragmentos cortos de acciones (action chunks) en lugar de un unico paso. El modelo lo publica el usuario ethan-svlh y se distribuye a traves del Hub de HuggingFace con la libreria LeRobot, la pila de HuggingFace para aprendizaje en robotica del mundo real.

El checkpoint contiene 51.668.614 parametros (~51,7 M) almacenados en safetensors y ocupa 0,2 GB en el repositorio. Consume dos imagenes de camara (wrist y top) de 3x480x640 y un vector de estado de 6 dimensiones, y produce un vector de accion de 6 dimensiones. Se ha entrenado sobre el dataset `ethan-svlh/demo_merged` (68 episodios, 23.954 frames a 30 FPS) para una unica tarea: "pick and place the block".

Su relevancia es la de un ejemplo reproducible de politica visuomotora de bajo coste: se puede ejecutar sobre un brazo de tipo `so_follower` de la familia SO de LeRobot, se entrena en una sola GPU y sirve como punto de partida para fine-tuning con pocas demostraciones. No es un modelo de lenguaje: no procesa texto ni mantiene conversaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con encoder de observaciones (imagenes + estado) y decodificador de acciones; no es MoE |
| Parametros totales | 51.668.614 (~51,7 M) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible (no especificada en la model card) |
| Tipos de cuantizacion | no disponible (no se documentan versiones GGUF, int8 ni int4) |
| Idiomas soportados | no aplicable (politica robotica; no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot (version de entrenamiento 0.6.2) |
| Tipo de robot | `so_follower` |
| Camaras de entrada | `wrist`, `top` (3x480x640 cada una) |
| Dimension del estado observado | 6 |
| Dimension de la accion | 6 |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (segun el Hub) | 2026-09-24 |

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion propuesto en el paper referenciado (arXiv:2304.13705) que predice un chunk de acciones futuras en lugar de una sola accion por paso. El modelo combina un encoder que procesa las observaciones (dos flujos visuales de 480x640 y el estado proprioceptivo de 6 dimensiones) con un decodificador transformer que emite la secuencia de acciones. La model card no detalla la configuracion interna exacta de capas, cabezas de atencion, tamano de chunk ni el mecanismo de ensamblado temporal; esos valores deben consultarse en el paper y en la implementacion de LeRobot.

El entrenamiento se realizo con LeRobot 0.6.2 durante 20.000 pasos, con batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. Los datos provienen de teleoperacion sobre el dataset `ethan-svlh/demo_merged`: 68 episodios, 23.954 frames a 30 FPS y una unica tarea ("pick and place the block"). No se documenta en la informacion disponible el uso de RLHF, DPO ni ningun esquema de refuerzo; ACT es un metodo puramente supervisado sobre demostraciones humanas. Tampoco se documentan tecnicas adicionales como decodificacion especulativa o ensamblado temporal, aunque esta ultima es habitual en las implementaciones de ACT.

## Capacidades

- Generacion de acciones de manipulacion: produce un vector de accion de 6 dimensiones a partir de dos imagenes (wrist y top) y el estado del robot.
- Control visuomotor de una tarea concreta de pick and place ("pick and place the block").
- Aprendizaje por imitacion: reproduce la politica aprendida de 68 episodios de teleoperacion.
- Entrada multimodal limitada a vision y propiocepcion: no acepta texto, audio ni otras modalidades.
- Ejecucion en bucle cerrado sobre hardware real mediante `lerobot-rollout`.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes, razonamiento multi-paso simbolico ni planificacion linguistica.
- No tiene capacidades multilingues: no procesa idioma alguno.
- No incluye modo "thinking", salida de cadena de pensamiento ni explicaciones textuales.
- No tiene capacidad de vision general (captioning, VQA); las camaras se usan solo como entrada de control.

## Casos de uso

- Reproduccion de la tarea entrenada en laboratorio: ejecutar la politica sobre un brazo `so_follower` con dos camaras para completar el pick and place del bloque tal y como se demuestra en el dataset, usando `lerobot-rollout` con `--policy.path=ethan-svlh/hf_act_demo_merged` y `--task="pick and place the block"`.
- Punto de partida para fine-tuning: reentrenar con `lerobot-train` sobre un dataset propio con la misma estructura de observaciones (estado de 6 dimensiones y camaras `wrist`/`top` a 480x640) para adaptar la politica a nuevas posiciones, objetos o variaciones de la celda.
- Docencia y formacion en robotica: servir como ejemplo completo de pipeline de aprendizaje por imitacion (grabacion con teleoperador, entrenamiento, despliegue) en cursos y talleres que usen LeRobot.
- Investigacion en aprendizaje por imitacion: usado como baseline de ACT en experimentos comparativos frente a otros metodos (por ejemplo, politicas basadas en difusion) sobre la misma tarea y el mismo hardware.
- Pruebas de integracion de software robotico: validar cadenas de captura de camara, calibracion, cinematica del brazo y temporizacion a 30 FPS antes de escalar a tareas mas complejas.
- Automatizacion de manipulacion repetitiva de bajo riesgo: alimentacion de piezas o colocacion de objetos ligeros en una posicion fija dentro de un banco de pruebas, siempre con supervisión humana y parada de emergencia.
- Prototipado rapido de celdas pick-and-place: montar una demostracion funcional con hardware de bajo coste (brazo SO mas dos camaras USB) sin necesidad de infraestructura de entrenamiento a gran escala.
- Recoleccion de datos comparables: usar la politica como referencia mientras se graban nuevos episodios con la misma tarea para ampliar el dataset y medir el efecto del aumento de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica: no hay tabla de tareas, numero de ensayos ni tasa de exito. Tampoco se aportan metricas de error de accion, latencia medida ni comparaciones con otros checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 207 MB en fp32 (51,67 M x 4 bytes) y unos 103 MB en bf16/fp16. Sumando activaciones de dos imagenes de 480x640 y las capas del transformer, la inferencia deberia caber holgadamente por debajo de 2 GB, aunque este calculo es una estimacion derivada del numero de parametros, no un dato publicado.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM es suficiente para inferencia; para entrenamiento con batch size 8 y dos flujos de imagen a 480x640 es razonable una GPU de 8-16 GB (por ejemplo, RTX 3060/4070/4090 o equivalentes). No hay datos publicados de consumo medido.
- GPU de gama alta (A100, H100): no son necesarias para este tamano de modelo; solo tendrian sentido para entrenar variantes mas grandes o para paralelizar barridos de hiperparametros.
- Cabe en GPU de consumo: si, dado el tamano de 51,7 M de parametros. Tambien es plausible la inferencia en CPU, aunque no esta documentada.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) y PyTorch como runtime. No aplican vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo de lenguaje y no se distribuye en GGUF.
- Latencia y throughput: no disponibles. Como referencia operativa, el sistema de captura esta a 30 FPS, por lo que la politica debe producir acciones dentro de ese presupuesto temporal para un control fluido; el mecanismo de action chunking de ACT reduce la frecuencia efectiva de inferencia necesaria.
- Requisitos adicionales: brazo `so_follower`, dos camaras configuradas con los nombres `wrist` y `top`, y calibracion del robot y de las camaras.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Entradas | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ethan-svlh/hf_act_demo_merged | ACT, politica de imitacion | 51,7 M | 2 imagenes 480x640 + estado 6D | sin evaluacion publicada | apache-2.0 | Hub de HuggingFace (0 descargas, 0 likes) |
| ACT original (Zhao et al., 2023, arXiv:2304.13705) | Metodo de referencia | depende de la configuracion | depende de la configuracion | resultados publicados en el paper, no aplicables a este checkpoint | no disponible | paper y codigo de referencia |
| Diffusion Policy (Chi et al., 2023) | Metodo alternativo de imitacion basado en difusion | no disponible | no disponible | no disponible | no disponible | no disponible |
| Otros checkpoints ACT publicados en el Hub de LeRobot | Politicas de imitacion | no disponible | no disponible | no disponible | habitualmente apache-2.0 | Hub de LeRobot |

Los datos de parametros y rendimiento de los metodos alternativos no se han proporcionado en la informacion disponible, por lo que no se incluyen cifras que no puedan verificarse.

## Limitaciones y advertencias

- Sin evaluacion: no hay tasa de exito, numero de ensayos ni condiciones de prueba publicadas. No se puede afirmar que la politica funcione de forma fiable en un entorno distinto del de entrenamiento.
- Dataset muy pequeno: 68 episodios y 23.954 frames para una unica tarea. Es un riesgo alto de sobreajuste a posiciones concretas de objetos, iluminacion, fondo y configuracion de camaras.
- Una sola tarea: la politica esta entrenada para "pick and place the block" y no esta condicionada por lenguaje; no se puede redirigir con instrucciones de texto.
- Dependencia estricta de la interfaz: la politica espera los nombres exactos de features `observation.images.wrist`, `observation.images.top` y `observation.state` con las formas declaradas. Cualquier cambio en el numero de camaras, resolucion o dimension del estado rompe la compatibilidad.
- Sensibilidad a la calibracion y al hardware: el tipo de robot declarado es `so_follower`; cambios de brazo, de utillaje, de montaje de camaras o de calibracion alteran el comportamiento.
- Riesgo de alucinacion en sentido amplio: como politica de imitacion, puede generar acciones fuera de distribucion cuando la escena difiere de las demostraciones, sin ninguna senal de incertidumbre ni mecanismo de rechazo.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay informes externos de uso en produccion.
- Idioma y texto: no soporta ningun idioma, tool calling ni agentes; no debe documentarse ni desplegarse como si fuera un LLM.
- Licencia: apache-2.0 permite uso comercial y modificacion, pero la responsabilidad sobre la seguridad fisica del sistema robotico recae integramente en quien lo despliega.
- Seguridad operativa: cualquier uso sobre hardware real debe incluir limites de par y velocidad, parada de emergencia y supervision.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ethan-svlh/hf_act_demo_merged
- Dataset de entrenamiento: https://huggingface.co/datasets/ethan-svlh/demo_merged
- Paper de ACT (pagina de papers de HuggingFace): https://huggingface.co/papers/2304.13705
- Paper de ACT en arXiv: https://arxiv.org/abs/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ethan-svlh/demo_merged
- Nota sobre la busqueda web: los resultados obtenidos no guardan relacion con el modelo (se refieren al nombre propio "Ethan"); no se han encontrado enlaces adicionales relevantes.
