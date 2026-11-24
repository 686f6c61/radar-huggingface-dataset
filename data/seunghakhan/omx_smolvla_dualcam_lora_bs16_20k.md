# SeunghakHan/omx_smolvla_dualcam_lora_bs16_20k

## Resumen

`omx_smolvla_dualcam_lora_bs16_20k` es un adaptador de politica vision-lenguaje-accion (VLA) para robotica, desarrollado por SeunghakHan y publicado en Hugging Face. Se trata de un fine-tuning mediante LoRA del modelo base `lerobot/smolvla_base`, que a su vez implementa la arquitectura SmolVLA descrita en el paper arXiv:2506.01844. El modelo resuelve una tarea concreta de manipulacion robotica: recoger bloques de cuatro colores (verde, azul, rojo y amarillo) y depositarlos en una caja, usando un robot de tipo `omx_follower` con dos camaras.

SmolVLA es un modelo compacto y eficiente disenado para reducir costes computacionales y poder desplegarse en hardware de consumo, segun indica la propia model card. Este adaptador concreto se entrena sobre un dataset local de 80 episodios y 20.614 fotogramas a 30 FPS, con 20.000 pasos de entrenamiento y un batch size de 16.

Es relevante ahora porque ejemplifica el flujo actual de la robotica open source con LeRobot: partir de un modelo base preentrenado, adaptarlo con LoRA a un robot y una tarea especificos, y publicarlo con pesos en safetensors y licencia Apache 2.0. No obstante, el repositorio tiene 0 descargas y no incluye resultados de evaluacion, por lo que debe considerarse un artefacto experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action), fine-tuning LoRA sobre `lerobot/smolvla_base` |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre `lerobot/smolvla_base`, la implementacion de referencia de SmolVLA en la libreria LeRobot. SmolVLA se describe en el paper como un modelo vision-language-action compacto y eficiente, orientado a rendimiento competitivo con costes computacionales reducidos y despliegue en hardware de consumo. La model card no detalla la composicion interna del backbone (numero de capas, dimension oculta ni parametros totales).

El entrenamiento se realizo con LeRobot 0.7.1 sobre el dataset `local/omx_fourcolors_merged`, compuesto por 80 episodios y 20.614 fotogramas a 30 FPS. Las tareas cubiertas son cuatro variantes de "recoger el bloque [color] y colocarlo en la caja" (verde, azul, rojo y amarillo). La configuracion reportada es: 20.000 pasos, batch size 16, optimizador AdamW, learning rate 0,0001 y semilla 42. No se indica el numero de tokens de entrenamiento ni si hubo etapas de RLHF o DPO, algo esperable en un modelo de imitacion robotica.

La politica consume `observation.state` de forma `(6,)`, dos imagenes de camara de `(3, 480, 640)` y una tercera de `(3, 256, 256)`, y produce una accion de forma `(6,)`. El nombre del repositorio sugiere una configuracion de doble camara ("dualcam"), aunque la model card lista tres entradas visuales.

## Capacidades

- Generacion de acciones motoras de 6 dimensiones a partir de observaciones visuales y de estado del robot.
- Percepcion visual multi-camara con dos flujos a 480x640 y uno a 256x256.
- Ejecucion de tareas de manipulacion pick-and-place condicionadas por instruccion en lenguaje natural (cuatro tareas de color).
- Control de un robot `omx_follower` mediante el comando `lerobot-rollout` con estrategia `base`.
- Fine-tuning adicional a partir del mismo modelo base mediante `lerobot-train`.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento general ni procesamiento de audio.

## Casos de uso

- Manipulacion pick-and-place en laboratorio: el modelo ejecuta la secuencia de recoger un bloque de color y depositarlo en una caja, adecuado para prototipos de investigacion en imitacion robotica con el robot `omx_follower`.
- Replicacion de experimentos de imitacion: sirve como punto de partida para comparar configuraciones LoRA frente al modelo base `lerobot/smolvla_base` en tareas de cuatro colores.
- Base para fine-tuning con nuevos objetos: al ser un adaptador sobre un modelo base Apache 2.0, se puede reentrenar con `lerobot-train` sobre datasets propios para ampliar la variedad de objetos o posiciones.
- Validacion de pipelines LeRobot: util para comprobar el flujo completo de `lerobot-rollout` con configuracion de doble camara y robot `omx_follower` antes de desplegar politicas mas elaboradas.
- Docencia y demos de VLA: su tamano compacto (segun la descripcion de SmolVLA) y su licencia permisiva lo hacen apropiado para sesiones practicas de robotica open source.
- Pruebas de robustez visual: permite evaluar como responde la politica ante cambios de iluminacion, posicion de objetos o distractores en el entorno de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada.
- GPU recomendadas: no disponible; la model card de SmolVLA menciona despliegue en hardware de consumo sin especificar modelos.
- Compatibilidad con GPU de consumo: segun la descripcion de SmolVLA, el modelo esta pensado para hardware de consumo, pero no se detallan modelos concretos ni requisitos de memoria.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia y `lerobot-train` para entrenamiento). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de politica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `SeunghakHan/omx_smolvla_dualcam_lora_bs16_20k` | no disponible | no disponible | Pick-and-place de 4 colores con `omx_follower` | Apache 2.0 | Hugging Face (0 descargas) |
| `lerobot/smolvla_base` | no disponible | no disponible | Modelo base VLA generalista | no disponible en la informacion | Hugging Face |
| Otros adaptadores SmolVLA en LeRobot | no disponible | no disponible | Segun dataset de entrenamiento | variable | Hugging Face |

No se dispone de datos de rendimiento ni de parametros para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- No se han publicado resultados de evaluacion; se desconoce la tasa de exito real de la politica.
- El entrenamiento se limita a 80 episodios y cuatro tareas de color, lo que reduce la generalizacion a objetos, posiciones o entornos distintos.
- Dependencia estricta del robot `omx_follower` y de la configuracion de camaras con la que se entreno; los nombres de camara deben coincidir con las claves de observacion.
- Riesgo de sobreajuste al dataset local `omx_fourcolors_merged` y a las condiciones de iluminacion y disposicion de la grabacion.
- No se documentan sesgos, capacidades multilingues ni comportamiento fuera de la tarea de manipulacion.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluacion hace desaconsejable su uso en produccion sin validacion previa.
- Repositorio con 0 descargas y creado recientemente: no hay evidencia de uso comunitario ni mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SeunghakHan/omx_smolvla_dualcam_lora_bs16_20k
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/local/omx_fourcolors_merged
- Guia SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador de datasets: https://huggingface.co/spaces/lerobot/visualize_dataset?path=local/omx_fourcolors_merged
