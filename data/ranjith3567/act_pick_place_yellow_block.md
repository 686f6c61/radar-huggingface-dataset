# ranjith3567/act_pick_place_yellow_block

## Resumen

`ranjith3567/act_pick_place_yellow_block` es una política robótica de imitación entrenada con el método ACT (Action Chunking with Transformers, arXiv:2304.13705) y publicada en Hugging Face Hub mediante la librería LeRobot. No es un modelo de lenguaje: es un controlador visomotor que recibe el estado articular de un brazo `so_follower` (vector de 6 dimensiones) junto con tres cámaras RGB (Top, Wrist y Side, a 480×640) y emite un vector de acción de 6 dimensiones. El modelo tiene 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en la categoría de políticas ligeras ejecutables en hardware de consumo.

El problema que resuelve es acotado y concreto: ejecutar la tarea "pick the yellow block and place it in brown box" (coger el bloque amarillo y depositarlo en la caja marrón). Se entrenó exclusivamente con 52 episodios de teleoperación (32.227 fotogramas a 30 FPS) recogidos por el propio autor, con 100.000 pasos de entrenamiento, batch de 8, optimizador AdamW y learning rate de 1e-5.

Su relevancia es fundamentalmente práctica y de nicho: sirve como ejemplo reproducible de un pipeline completo de imitation learning con LeRobot (grabación de datos, entrenamiento, rollout) y como punto de partida para fine-tuning en tareas de pick-and-place. Conviene subrayar que el autor no ha publicado licencia, idiomas soportados ni resultados de evaluación en robot real, y que el repositorio acumula 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), segun arXiv:2304.13705; implementacion de LeRobot 0.6.2 |
| Parametros totales | 51.668.614 (~51,7 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible / no aplica: no es un modelo de lenguaje; consume una observacion por paso y predice un chunk de acciones |
| Tipos de cuantizacion | no se distribuyen variantes cuantizadas; pesos en safetensors con precision no especificada en la model card |
| Idiomas soportados | no disponible (la tarea se especifica como cadena de texto, "pick the yellow block and place it in brown box") |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors (repositorio de 0,2 GB), libreria `lerobot` |
| Tipo de modelo | politica de imitacion para robotica (pipeline `robotics`) |
| Robot objetivo | `so_follower` |
| Camaras de entrada | `Top`, `Wrist`, `Side`, cada una `(3, 480, 640)` |
| Entrada de estado | `observation.state`, forma `(6,)` |
| Salida | `action`, forma `(6,)` |
| Dataset de entrenamiento | `ranjith3567/pick_place_yellow_block_20261022_200540`: 52 episodios, 32.227 fotogramas, 30 FPS |
| Pasos de entrenamiento | 100.000 (batch 8, AdamW, lr 1e-5, seed 1000) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-28 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que, en lugar de predecir una única acción por paso, predice un *chunk* de acciones futuras de golpe. Esta formulación reduce el error de compounding y suaviza la ejecución en robots reales, y es la razon por la que el metodo reporta tasas de exito altas en tareas de manipulacion con datos de teleoperacion. La implementacion de LeRobot combina un extractor visual por camara con un transformer encoder-decoder que fusiona las caracteristicas visuales con el estado articular; en este checkpoint hay tres flujos visuales (Top, Wrist y Side) que se agregan antes de la cabeza de acciones de 6 dimensiones.

El entrenamiento se realizo sobre un unico dataset propio de 52 episodios y 32.227 fotogramas a 30 FPS, con una sola tarea anotada. La configuracion reportada es de 100.000 pasos, batch de 8, optimizador AdamW, learning rate 1e-5 y semilla 1000, sobre LeRobot 0.6.2. No se documenta composicion del dataset mas alla de la tarea, ni aumentos de datos, ni procesos de RLHF/DPO (no aplicables a una politica de imitacion supervisada). Tampoco se indica si se aplicaron tecnicas de decodificacion especulativa, atencion lineal u otras optimizaciones: la model card no entra en ese nivel de detalle.

## Capacidades

- Control visomotor de un brazo `so_follower` para una tarea fija de pick-and-place ("coger el bloque amarillo y colocarlo en la caja marrón").
- Fusión de tres vistas de camara simultaneas (Top, Wrist, Side) a 480×640 y 30 FPS, lo que aporta informacion complementaria de perspectiva cenital, de muneca y lateral.
- Prediccion de chunks de acciones (herencia del metodo ACT), lo que reduce la frecuencia efectiva de inferencia necesaria y suaviza la trayectoria.
- Consumo de estado proprioceptivo de 6 dimensiones y emision de comandos de 6 dimensiones, compatible con el stack de `lerobot-rollout`.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible; la politica ejecuta una secuencia motora, no un plan simbolico.
- Capacidades multilingues: no disponibles; la instruccion de tarea se pasa como texto plano en el comando de rollout.
- Modo "thinking", vision-language, audio o generacion de texto: no disponibles; el modelo solo produce acciones.

## Casos de uso

- Automatizacion de pick-and-place en laboratorio o celula educativa: el modelo ejecuta la secuencia completa de coger el bloque amarillo y dejarlo en la caja marrón sobre un `so_follower` calibrado, usando el comando `lerobot-rollout` con `--policy.path=ranjith3567/act_pick_place_yellow_block`.
- Punto de partida para fine-tuning con objetos o destinos nuevos: al ser una politica de 51,7 M de parametros entrenada con 100.000 pasos, sirve como inicializacion para reentrenar con un dataset propio de pocas decenas de episodios y un nuevo par objeto-contenedor.
- Docencia y formacion en imitation learning: el repositorio incluye el flujo completo (instalacion, grabacion de datos, entrenamiento con `lerobot-train`, rollout), lo que permite reproducir el ciclo entero en un curso o taller con hardware de bajo coste.
- Comparativa metodologica ACT frente a VLA: el mismo autor publica `ranjith3567/smolvla_pick_place_yellow_block` para la misma tarea, de modo que se pueden contrastar ambas aproximaciones con el mismo dataset y el mismo robot.
- Validacion de pipelines de datos de robotica: el dataset asociado (52 episodios, 32.227 fotogramas, tres camaras) permite probar herramientas de visualizacion, curado y versionado de datasets antes de escalar a recolecciones mayores.
- Pruebas de robustez y regresion: util para medir como degrada la politica ante cambios de iluminacion, posicion inicial del bloque o presencia de distractores, comparando contra la distribucion original del dataset.
- Integracion en demostraciones de extremo a extremo: el checkpoint se puede servir junto con el resto del stack LeRobot para mostrar un lazo percepcion-accion completo a 30 FPS, sin dependencia de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks ni evaluacion en robot real en la informacion disponible. La model card incluye la seccion de evaluacion con el texto literal "No evaluation results have been provided for this policy yet", por lo que no existen tasas de exito, numeros de ensayos ni condiciones de prueba reportadas para este checkpoint.

| Metrica | Resultado |
|---|---|
| Tasa de exito en robot real | no disponible |
| Numero de ensayos | no disponible |
| MMLU / HumanEval / GSM8K | no aplica (no es un modelo de lenguaje) |
| Latencia por chunk | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa aproximadamente 207 MB en fp32 y unos 103 MB en fp16, a lo que se suman las activaciones de tres flujos visuales a 480×640. Una estimacion razonable es de 1-2 GB de VRAM en fp32 con batch 1, y por debajo de 1 GB en fp16. Son estimaciones de ingenieria, no cifras publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; el modelo es Holgado en RTX 3060, RTX 4060, RTX 4090, A100 y H100. No se requiere hardware de datacenter.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada moderna e incluso en iGPU con memoria compartida suficiente; tambien es viable en CPU, aunque el lazo de control a 30 FPS puede resentirse.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) es el camino documentado; el resto del stack LeRobot cubre el entrenamiento con `lerobot-train`. No se documenta soporte especifico para vLLM, TGI, llama.cpp u Ollama, que no aplican a este tipo de politica.
- Latencia y throughput: no se han publicado mediciones. El bucle de control opera a 30 FPS (33 ms por paso) y la prediccion por chunks reduce el numero de inferencias necesarias por segundo, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ranjith3567/act_pick_place_yellow_block` (este) | 51,7 M | 3 camaras 480×640 + estado (6,) | Pick-and-place de bloque amarillo en caja marrón | no disponible | Hugging Face Hub, 0 descargas |
| `ranjith3567/smolvla_pick_place_yellow_block` | no disponible en la informacion | no disponible | Misma tarea, enfoque VLA (SmolVLA) | no disponible | Hugging Face Hub |
| Diffusion Policy (referencia metodologica en LeRobot) | no disponible en la informacion | no disponible | Politicas de imitacion por difusion | no disponible | Implementacion en LeRobot |
| ACT original (arXiv:2304.13705) | no disponible en la informacion | no disponible | Politicas de imitacion con chunks de acciones | no disponible | Paper y codigo de referencia |

La comparacion mas directa es con la variante SmolVLA del mismo autor sobre el mismo dataset y robot, que permite aislar el efecto del metodo (ACT frente a un modelo vision-lenguaje-accion) manteniendo constantes los datos y el hardware. No se dispone de cifras de rendimiento de ninguno de los dos, por lo que la comparacion solo puede hacerse a nivel de enfoque.

## Limitaciones y advertencias

- Especializacion extrema: el modelo ha sido entrenado para una unica tarea y un unico montaje fisico (robot `so_follower`, tres camaras en posiciones concretas). No generaliza a otros objetos, contenedores ni configuraciones de camaras sin reentrenamiento.
- Dataset muy pequeno: 52 episodios y 32.227 fotogramas son insuficientes para garantizar robustez; es esperable sobreajuste a las posiciones, iluminacion y apariencia del bloque amarillo presentes en la recoleccion.
- Ausencia total de evaluacion: no hay tasa de exito reportada, ni numero de ensayos, ni condiciones de prueba. Cualquier uso en produccion exige una evaluacion propia previa.
- Licencia indeterminada: la model card marca la licencia como "More Information Needed". Sin licencia explicita no se puede asumir permiso de uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- Dependencia de nombres de camaras exactos: las claves de observacion (`observation.images.Top`, `Wrist`, `Side`) deben coincidir con las del entrenamiento; un mapeo incorrecto invalida la politica sin producir error evidente.
- Requiere calibracion del robot: el estado y las acciones de 6 dimensiones dependen de la calibracion del `so_follower`; diferencias de calibracion degradan la ejecucion.
- Sin informacion sobre sesgos: no se documentan analisis de sesgo, y en robotica esto se traduce en sesgos fisicos (posiciones privilegiadas, objetos concretos) mas que en sesgos linguisticos.
- Riesgo de fallo silencioso: al no haber modulo de verificacion, la politica puede ejecutar la secuencia sin alcanzar el objetivo; se recomienda supervision y parada de emergencia.
- Idiomas y instrucciones: no se especifica si el modelo responde a instrucciones en castellano; la unica tarea documentada esta en ingles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ranjith3567/act_pick_place_yellow_block
- Dataset de entrenamiento: https://huggingface.co/datasets/ranjith3567/pick_place_yellow_block_20261022_200540
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ranjith3567/pick_place_yellow_block_20261022_200540
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Variante SmolVLA del mismo autor: https://huggingface.co/ranjith3567/smolvla_pick_place_yellow_block
