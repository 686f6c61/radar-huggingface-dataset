# aryankakad/act_encoder_leader_so101_cube_box

## Resumen

`aryankakad/act_encoder_leader_so101_cube_box` es una politica de robotica basada en ACT (Action Chunking with Transformers), un metodo de aprendizaje por imitacion que predice trozos de acciones (action chunks) en lugar de pasos individuales. Lo publica el usuario aryankakad en HuggingFace y se ha entrenado y subido con LeRobot, la libreria de HuggingFace para aprendizaje automatico en robotica real. El modelo resuelve una unica tarea manipulativa: coger un cubo y colocarlo en una caja, sobre un brazo SO-101 en configuracion follower.

Tecnicamente es un transformer encoder-decoder con CVAE de 51.668.614 parametros (unos 51,7 M), que consume el estado de las articulaciones (vector de 6 dimensiones) y dos flujos de imagen de 480x640 (camara superior y camara del gripper), y produce un vector de accion de 6 dimensiones. No es un modelo de lenguaje ni un modelo fundacional: es una politica visomotora de proposito especifico, entrenada con 30 episodios de teleoperacion (23.239 fotogramas a 30 FPS).

Su relevancia es practica: sirve como ejemplo reproducible de un pipeline completo de imitation learning de bajo coste con LeRobot 0.6.2, util como linea base para investigacion, docencia y para hacer fine-tuning con datos propios. La licencia Apache 2.0 y el reducido tamano del repositorio (0,2 GB) facilitan su descarga y su ejecucion en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con cuello CVAE |
| Parametros totales | 51.668.614 (unos 51,7 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; consume una observacion por paso de control) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors, en la precision de entrenamiento) |
| Idiomas soportados | no aplica (modelo de robotica, no procesa texto ni lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, empaquetado de repositorio LeRobot (0,2 GB) |
| Entradas | `observation.state` (6,), `observation.images.top` (3, 480, 640), `observation.images.gripper` (3, 480, 640) |
| Salidas | `action` (6,) |
| Robot de destino | `so_follower` (SO-101) |
| Fecha de creacion | 2026-10-01 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion presentado en el paper 2304.13705. La arquitectura combina un codificador visual (procesa las dos camaras a 480x640), un codificador de estado que recibe la posicion de las 6 articulaciones y un transformer encoder-decoder que predice un chunk de acciones futuras en lugar de una sola accion. La componente CVAE modela la variabilidad de las demostraciones humanas, y el uso de chunks reduce el problema de horizonte de prediccion y de acumulacion de errores propio de las politicas paso a paso.

El entrenamiento se ha hecho con LeRobot 0.6.2 sobre el dataset `aryankakad/encoder_leader_teleop_so101_cube_box_30eps`: 30 episodios, 23.239 fotogramas, 30 FPS y una unica tarea descrita como "Pick up the cube and place it in the box". La configuracion registrada en la model card es de 100.000 pasos de entrenamiento, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta uso de RLHF, DPO ni de decodificacion especulativa, ni datos adicionales fuera de ese dataset de teleoperacion con leader encoder.

## Capacidades

- Generacion de acciones de manipulacion: predice chunks de acciones de 6 grados de libertad para el brazo SO-101 follower.
- Percepcion visomotora: combina una camara cenital (`top`) y una camara en el gripper (`gripper`) a 480x640 para guiar el movimiento.
- Condicionamiento por estado: integra la lectura de las 6 articulaciones como observacion de estado.
- Ejecucion de una tarea concreta: recoger un cubo y depositarlo en una caja.
- Ejecucion autonoma en bucle mediante `lerobot-rollout` con `--strategy.type=base`, con duracion configurable en segundos.
- Reentrenamiento y fine-tuning: al estar integrado en LeRobot, se puede reentrenar con `lerobot-train` sobre datasets propios.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso simbolico, generacion de texto, codigo, matematicas ni capacidades multilingues: no es un modelo de lenguaje.
- No dispone de vision generalista ni de audio; la vision esta limitada a dos camaras concretas de un montaje fisico.

## Casos de uso

- Manipulacion pick-and-place en laboratorio: ejecutar la tarea "coger el cubo y meterlo en la caja" sobre un SO-101 con dos camaras a 30 FPS, usando el comando `lerobot-rollout` de la model card como punto de partida.
- Linea base de investigacion en imitation learning: comparar variantes de ACT (numero de chunks, backbone visual, cuello CVAE) contra esta politica entrenada con 30 episodios y 100.000 pasos.
- Docencia y formacion en robotica: usar la politica como ejemplo completo del flujo de LeRobot (grabacion de datos, calibracion, entrenamiento y despliegue) en cursos practicos.
- Fine-tuning con datos propios: partir de estos pesos y reentrenar con `--policy.type=act` sobre un dataset nuevo de la misma tarea con otro objeto o posiciones distintas.
- Automatizacion de celdas de montaje simples: clasificacion y transporte de piezas pequenas en entornos controlados de iluminacion y fondo estables, donde la variabilidad visual es baja.
- Pruebas de integracion hardware-software: validar cadenas de camaras OpenCV, puertos del robot, latencias y tasas de control antes de escalar a politicas mayores.
- Recogida de datos asistida: emplear la politica en modo rollout para generar trayectorias adicionales y ampliar el dataset de demostraciones.
- Validacion de infraestructura de despliegue: servir la politica en local con LeRobot y medir tiempos de inferencia en GPU de consumo antes de invertir en modelos mayores como SmolVLA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La seccion de evaluacion de la model card indica explicitamente: "No evaluation results have been provided for this policy yet". No existe, por tanto, tasa de exito medida en robot real, numero de ensayos ni comparacion cuantitativa con otras politicas.

## Requisitos de hardware

- Los pesos suman 51.668.614 parametros. En fp32 ocupan aproximadamente 207 MB (coincide con el tamano de repositorio de 0,2 GB); en fp16 serian unos 103 MB de pesos. No se documentan versiones cuantizadas.
- VRAM estimada para inferencia: del orden de 1 a 2 GB, incluyendo el encoder visual y las dos imagenes de 480x640. Es una estimacion a partir del tamano del modelo, no un dato publicado por el autor.
- Cabe sin problemas en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y similares. Tambien es viable en CPU para inferencia, aunque con mayor latencia.
- Aunque las GPU de datacenter (A100, H100) son compatibles, resultan sobredimensionadas para un modelo de este tamano; su uso solo se justifica si se comparten con otros procesos o si se reentrena a gran escala.
- Despliegue: la via soportada es LeRobot (`lerobot-rollout` para ejecucion y `lerobot-train` para entrenamiento) con `--policy.device=cuda`. No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama, que ademas no aplican a este tipo de politica.
- Latencia y throughput: no disponibles. El sistema opera a 30 FPS en el dataset de entrenamiento, pero la model card no publica tiempos de inferencia ni frecuencia de control alcanzada en robot real.
- Para el entrenamiento, la configuracion documentada es batch size 8 durante 100.000 pasos; el consumo de VRAM de entrenamiento no esta especificado (depende del backbone visual y de la resolucion de las imagenes).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `aryankakad/act_encoder_leader_so101_cube_box` | ACT (imitation learning) | 51,7 M | Estado (6,) + 2 imagenes 480x640 | Apache 2.0 | HuggingFace, via LeRobot |
| ACT generico (LeRobot) | ACT (imitation learning) | ~51 M segun configuracion | Configurable por dataset | Apache 2.0 (LeRobot) | Repositorio y documentacion de LeRobot |
| Diffusion Policy (Chi et al.) | Politica por difusion | no disponible | Imagenes + estado del robot | no disponible en esta busqueda | Paper y repositorio publicos |
| SmolVLA (HuggingFace) | VLA (vision-language-action) | no disponible en esta busqueda | Imagenes + instruccion en lenguaje | no disponible en esta busqueda | Ecosistema LeRobot |

No se dispone de datos de rendimiento comparativos publicados para este modelo concreto, por lo que la comparacion se limita a tipo, licencia y disponibilidad. Cualquier comparacion de tasa de exito quedaria pendiente de una evaluacion en el mismo montaje fisico.

## Limitaciones y advertencias

- Especializacion extrema: entrenado con 30 episodios de una sola tarea; no generaliza a otros objetos, otras tareas ni otras posiciones no vistas.
- Sin evaluacion publicada: no existe tasa de exito medida, ni numero de ensayos, ni analisis de modos de fallo. No se puede afirmar ningun nivel de fiabilidad.
- Dependencia del montaje: requiere el mismo robot (`so_follower`), el mismo numero y tipo de camaras y las mismas claves de observacion (`observation.images.top`, `observation.images.gripper`). Un cambio de camara, encuadre o calibracion invalida la politica.
- Sensibilidad a condiciones visuales: cambios de iluminacion, fondo, color del cubo o posicion inicial de la caja pueden degradar el comportamiento de forma no documentada.
- Sesgos de datos: las demostraciones provienen de una unica persona, un unico entorno y un unico montaje; la politica hereda esos sesgos de posicion, velocidad y estilo de teleoperacion.
- Acumulacion de errores: aunque ACT predice chunks de acciones, sigue siendo un sistema de control en bucle abierto por chunk, por lo que un error de agarre puede propagarse durante el resto de la secuencia.
- Riesgo fisico: al controlar un brazo robotico real, una salida incorrecta puede causar colisiones, danos al material o al entorno. Se recomienda espacio de trabajo despejado, limites de par y supervision en las primeras ejecuciones.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero se entrega sin garantias y la responsabilidad del despliegue fisico recae en quien lo integra.
- Sin senales de validacion externa: 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido probado de forma independiente por la comunidad.
- Fuera de alcance: no es un modelo de lenguaje, no procesa texto, no soporta tool calling ni agentes y no tiene capacidades multilingues.
- Fechas: el repositorio figura como creado el 2026-10-01 y actualizado el 2026-10-01, sin historial adicional de versiones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aryankakad/act_encoder_leader_so101_cube_box
- Dataset de entrenamiento: https://huggingface.co/datasets/aryankakad/encoder_leader_teleop_so101_cube_box_30eps
- Visualizacion del dataset en LeRobot Spaces: https://huggingface.co/spaces/lerobot/visualize_dataset?path=aryankakad/encoder_leader_teleop_so101_cube_box_30eps
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
