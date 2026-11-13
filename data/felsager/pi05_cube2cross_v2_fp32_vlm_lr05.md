# felsager/pi05_cube2cross_v2_fp32_vlm_lr05

## Resumen

π₀.₅ (Pi05) es un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence, disenado para la generalizacion en entornos abiertos y para controlar robots manipuladores a partir de instrucciones en lenguaje natural e imagenes. Esta ficha concreta, `felsager/pi05_cube2cross_v2_fp32_vlm_lr05`, es un ajuste fino del modelo base `lerobot/pi05_base` realizado por el usuario felsager mediante la libreria LeRobot, orientado a una tarea muy especifica de manipulacion: coger un cubo de color y colocarlo sobre una cruz roja.

El modelo consume el estado del robot y dos flujos de camara (vista superior y vista de muneca) y produce un vector de accion de 10 dimensiones. Se ha entrenado sobre un unico dataset de 1000 episodios y 493.474 fotogramas a 30 FPS, con cuatro tareas de pick-and-place definidas por el color del cubo. El repositorio ocupa 42,6 GB y los pesos en safetensors suman 4.143.404.816 parametros.

Es relevante como ejemplo de flujo completo de imitation learning con LeRobot sobre un VLA de proposito general: el modelo base aporta el conocimiento vision-lenguaje-accion y el ajuste fino lo especializa en un entorno de laboratorio concreto. La licencia es Gemma, heredada del modelo base, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) π₀.₅, transformer multimodal con salida de acciones; implementacion LeRobot adaptada de OpenPI |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos publicados son fp32) |
| Idiomas soportados | no disponible (las tareas del dataset estan en ingles) |
| Licencia | gemma |
| Formato de pesos | safetensors (libreria lerobot) |
| Modelo base | lerobot/pi05_base |
| Tipo de robot | ur5e_hand_e |
| Camaras | top, wrist (3, 480, 640) |
| Entrada de estado | observation.state (10,) |
| Salida de accion | action (10,) |
| Tamano del repositorio | 42,6 GB |

## Arquitectura y entrenamiento

El modelo es un VLA π₀.₅, evolucion del π₀ de Physical Intelligence orientado a la generalizacion en entornos no vistos durante el entrenamiento. La implementacion utilizada es la de LeRobot, adaptada del repositorio OpenPI del propio equipo de Physical Intelligence. La politica recibe observaciones multimodales (estado del robot de 10 dimensiones y dos imagenes RGB de 480x640) y emite directamente un vector de accion de 10 dimensiones, sin etapa intermedia de planificacion explicita.

El ajuste fino se realizo sobre el dataset `felsager/vla_cubes_cross_v2`, compuesto por 1000 episodios y 493.474 fotogramas a 30 FPS. El entrenamiento se ejecuto durante 30.000 pasos con batch size 8, optimizador AdamW, learning rate 5e-05 y semilla 0, usando LeRobot 0.6.2. No se especifica en la informacion disponible si hubo etapas de RLHF, DPO ni detalles sobre la composicion del corpus del modelo base.

## Capacidades

- Control de robot manipulador UR5e con mano equipada (`ur5e_hand_e`) a partir de instrucciones en lenguaje natural.
- Percepcion visual mediante dos camaras (vista superior y vista de muneca) para localizar objetos y estimar su posicion.
- Ejecucion de tareas de pick-and-place: coger un cubo de color (azul, verde, amarillo o rojo) y colocarlo sobre una cruz roja.
- Generacion de acciones continuas de 10 dimensiones a partir de estado y observaciones visuales.
- Generalizacion limitada al dominio de entrenamiento: cubos de cuatro colores y una diana fija (cruz roja).
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni capacidades de audio.
- Capacidades multilingues: no disponibles; las instrucciones del dataset estan en ingles.

## Casos de uso

- Automatizacion de pick-and-place en laboratorio: el modelo ejecuta la tarea de coger un cubo de color y colocarlo sobre una diana, util para validar pipelines de imitation learning antes de escalar a tareas mas complejas.
- Prototipado rapido de politicas con LeRobot: sirve como referencia de un ajuste fino completo (dataset, configuracion, rollout) para equipos que quieran replicar el flujo con sus propios datos.
- Benchmark interno de VLA: al estar especializado en una tarea acotada, permite medir la variabilidad de exito de π₀.₅ en un entorno controlado y comparar con otras politicas.
- Docencia y formacion en robotica: ejemplo reproducible de entrenamiento de un VLA con 1000 episodios y comandos `lerobot-train` / `lerobot-rollout`.
- Base para nuevos ajustes finos: al derivar de `lerobot/pi05_base`, puede servir de punto de partida para tareas de manipulacion similares con cambios de objeto o diana.
- Validacion de hardware UR5e: permite comprobar la integracion de camaras, calibracion y puerto del robot antes de desplegar politicas mas ambiciosas.
- Investigacion en generalizacion: util para estudiar como se comporta un VLA especializado ante variaciones de posicion, iluminacion o distractores (aunque no se han publicado resultados formales).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Con 4.143.404.816 parametros en fp32, el peso de los pesos ronda los 16,5 GB, por lo que se necesita una GPU con al menos 24 GB para cargar el modelo sin cuantizar, mas el margen para activaciones y procesamiento de imagenes.
- GPU recomendadas: no especificadas por el autor. Por tamano, una RTX 4090 (24 GB) es el minimo razonable en consumer; A100 o H100 son opciones habituales para entrenamiento y despliegue.
- Cabe en consumer GPU: previsiblemente en RTX 4090 y GPUs con 24 GB o mas; no confirmado por el autor.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte de CUDA (`--policy.device=cuda`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| felsager/pi05_cube2cross_v2_fp32_vlm_lr05 | 4.143.404.816 | no disponible | Pick-and-place cubo sobre cruz (UR5e) | gemma | Hugging Face (LeRobot) |
| lerobot/pi05_base | no disponible | no disponible | VLA generalista π₀.₅ | gemma | Hugging Face (LeRobot) |
| π₀ (Physical Intelligence) | no disponible | no disponible | VLA generalista | no disponible | OpenPI (codigo abierto) |

La comparacion con alternativas de la misma categoria (otros VLA especializados en manipulacion) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Especializacion extrema: solo se ha entrenado para cuatro tareas de pick-and-place con cubos de color sobre una cruz roja; fuera de ese dominio su comportamiento no esta garantizado.
- Sin resultados de evaluacion publicados: no hay tasas de exito ni pruebas de robustez ante cambios de posicion, iluminacion o distractores.
- Dependencia del hardware: requiere un robot `ur5e_hand_e` y dos camaras con los nombres `top` y `wrist`; cualquier desviacion en la configuracion invalida el uso directo.
- Riesgo de alucinacion y fallos de ejecucion: como politica de control, puede producir acciones incorrectas o inseguras; se recomienda supervision y limites de seguridad en el robot.
- Sesgos: no documentados; el dataset de 1000 episodios de un unico entorno puede introducir sesgos de posicion, iluminacion y color.
- Licencia Gemma: impone restricciones de uso comercial y obligaciones de atribucion; conviene revisar los terminos de la Gemma Terms of Use antes de un despliegue productivo.
- Idiomas: las instrucciones de tarea estan en ingles; no se documenta soporte multilingue.
- Repositorio de gran tamano (42,6 GB) por los pesos en fp32, lo que dificulta su despliegue en entornos con almacenamiento limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/felsager/pi05_cube2cross_v2_fp32_vlm_lr05
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/felsager/vla_cubes_cross_v2
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=felsager/vla_cubes_cross_v2
- Blog de π₀.₅ de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de π₀.₅ en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- OpenPI (repositorio de referencia): no disponible en la informacion proporcionada
