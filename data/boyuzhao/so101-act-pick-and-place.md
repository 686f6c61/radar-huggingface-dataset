# BoyuZhao/so101-act-pick-and-place

## Resumen

BoyuZhao/so101-act-pick-and-place es una política de manipulación robótica entrenada con imitation learning para el brazo SO-101, publicada como bundle de inferencia completo para la librería LeRobot. Se trata del checkpoint `checkpoints/last/pretrained_model` del experimento de pick-and-place del autor, subido al Hub con todos los ficheros necesarios para ejecutarlo: pesos, configuración, procesadores y ficheros de normalización. No es un modelo de lenguaje: su entrada son imágenes RGB de dos cámaras (muñeca y frontal, 640 x 480) más el estado articular de seis dimensiones, y su salida es una acción articular de seis dimensiones.

Técnicamente implementa ACT (Action Chunking Transformer) con un backbone visual ResNet-18 inicializado con pesos ImageNet de torchvision y un horizonte de acción (action chunk size) de 100 pasos. El modelo tiene 51.668.614 parámetros en safetensors (~51,7 M) y ocupa 0,2 GB en el repositorio, por lo que es un checkpoint ligero y desplegable en hardware de consumo. El entrenamiento se realizó sobre 40 episodios teleoperados que suman 18.828 fotogramas a 30 FPS, durante 120.000 pasos con batch size 8, AMP activado y CUDA.

Su relevancia es doble: por un lado, sirve como referencia reproducible de un pipeline completo de ACT sobre el SO-101, un brazo de bajo coste muy extendido en laboratorios y proyectos educativos; por otro, la model card es inusualmente explícita sobre los límites del artefacto (falta de garantías de generalización, dependencia de la geometría de escena y del calibrado, y ausencia de una tasa de éxito estadística). Es, por tanto, un punto de partida para fine-tuning e ingeniería inversa de pipelines, no un sistema listo para producción sin validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) con backbone visual ResNet-18 (pesos ImageNet de torchvision) |
| Parametros totales | 51.668.614 (~51,7 M) segun safetensors |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; horizonte de accion (action chunk size) de 100 pasos |
| Tipos de cuantizacion | no disponible; solo se publican pesos en safetensors sin versiones cuantizadas (no hay GGUF ni variantes int8/int4) |
| Idiomas soportados | no aplica; la politica consume imagenes RGB y estado articular, no procesa lenguaje natural |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`), acompanado de `config.json`, dos ficheros JSON de procesador, ficheros de estado de normalizador/desnormalizador y `train_config.json` |
| Entradas | Dos camaras RGB 640 x 480 denominadas obligatoriamente `wrist` y `front`; estado articular de 6 dimensiones |
| Salidas | Accion articular de 6 dimensiones (follower SO-101) |
| Libreria | lerobot (bundle de inferencia) |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes en el Hub | 0 / 0 |
| Fecha de publicacion en el Hub | 29 de septiembre de 2026 segun metadatos del Hub |

## Arquitectura y entrenamiento

El modelo es una política de imitación basada en ACT, la implementación de Action Chunking Transformer disponible en el ecosistema LeRobot (trabajo de terceros, con sus propias licencias). Sobre cada observación, el modelo combina un backbone visual ResNet-18 —cargado con pesos ImageNet de torchvision, tal y como se registra en `config.json`— con el estado articular del robot, y predice un chunk de 100 acciones consecutivas en lugar de una única acción por paso. Esta predicción por bloques es lo que da estabilidad temporal a la política y reduce el coste de inferencia por acción efectiva.

Los datos de entrenamiento son 40 episodios teleoperados de pick-and-place, con 18.828 fotogramas capturados a 30 FPS, usando un SO-101 follower y un leader. El identificador del dataset en el experimento es `BoyuZhao/so101_test`; el dataset no se incluye en el repositorio y su disponibilidad pública no está verificada por el autor. El entrenamiento se ejecutó durante 120.000 pasos con batch size 8, guardado cada 10.000 pasos, en CUDA con AMP habilitado, y con el push a W&B y a checkpoints del Hub desactivado. El rendimiento observado durante el entrenamiento fue de aproximadamente 2,83 pasos por segundo en una GPU RTX 4070 Laptop.

No consta en la información disponible ningún proceso de RLHF, DPO o refinamiento por preferencias humanas, algo esperable en este tipo de políticas de imitación. El entorno de referencia con el que se preparó la release es el fork `JoyandAI/lerobot` en el commit `eacddcb9cff5e033c7811daa15d30f5debcc9a7b` (paquete 0.5.2), con Python 3.12.13, torch 2.10.0+cu126 y torchvision 0.25.0+cu126. El autor advierte explícitamente que esa inspección no establece la revisión histórica exacta usada al grabar el vídeo, y que versiones arbitrarias de upstream o de PyPI pueden tener un CLI o un comportamiento de procesadores incompatibles.

## Capacidades

- Generacion de acciones de manipulacion: produce chunks de 100 acciones articulares de 6 grados de libertad para tareas de pick-and-place con el SO-101.
- Percepcion visual dual: consume simultaneamente dos flujos de imagen RGB de 640 x 480 (`wrist` y `front`), lo que le permite condicionar la accion tanto en la vista cenital o frontal como en la vista cercana a la pinza.
- Politica de imitacion entrenada de extremo a extremo: no requiere planificacion simbolica ni modelado explicito del objeto; aprende la correspondencia observacion-accion de las demostraciones.
- Ejecucion repetida de ciclos: el video publicado por el autor muestra 8 ciclos autonomos consecutivos de pick-and-place exitosos hasta fallar en el intento 9, con reseteo manual de los objetos.
- Integracion con LeRobot: el bundle esta pensado para cargarse con la libreria lerobot y el repositorio companion, no como fichero de pesos aislado.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de un LLM/agente.
- No tiene capacidades multilingues, de vision general, audio ni modo de razonamiento explicito.

## Casos de uso

- Reproduccion de experimentos de imitation learning: permite replicar el pipeline completo de ACT sobre SO-101 partiendo de un checkpoint ya entrenado, con los procesadores y normalizadores incluidos, para comparar configuraciones o depurar el flujo de datos sin partir de cero.
- Fine-tuning sobre dominios propios: al ser un checkpoint ligero (51,7 M de parametros, 0,2 GB) puede servir como inicializacion para reentrenar la politica con las demostraciones de otro laboratorio, ajustando escena, objetos y convenciones de articulaciones.
- Docencia en robotica: es un ejemplo didactico y ejecutable de política visomotora de bajo coste que cabe en una GPU de portatil, util para asignaturas de aprendizaje por imitacion o de manipulacion robotica.
- Evaluacion de infraestructura de inferencia robotica: sirve para medir latencia y throughput de un pipeline LeRobot real (carga de dos camaras, preprocesado, forward y postprocesado) en distintas GPUs, con la referencia publicada de 2,83 pasos/s en entrenamiento sobre RTX 4070 Laptop.
- Base para experimentos de robustez y generalizacion: como el propio autor advierte que no hay garantia cross-hardware/cross-scene, es un punto de partida natural para medir degradacion al variar iluminacion, posicion de camaras o posicion inicial de los objetos.
- Prototipado de tareas pick-and-place en entornos controlados de laboratorio: montaje de una celda con geometria fija, iluminacion estable y reseteo manual de piezas, donde la politica puede ejecutar ciclos repetidos de recogida y deposito.
- Integracion en el ecosistema LeRobot como referencia comparativa: sirve para contrastar variantes de ACT, cambios de horizonte de chunk o distintos backbones visuales frente a un baseline ya publicado.
- Automatizacion de pruebas de regresion del software de control: al ser un bundle con manifest y verificacion de SHA-256 en el repositorio companion, permite comprobar que un entorno de despliegue concreto reproduce el mismo comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados en la informacion disponible. El unico dato de rendimiento reportado es cualitativo y procede del video continuo publicado por el autor: 8 ciclos autonomos consecutivos de pick-and-place exitosos seguidos de un fallo en el intento 9, con reseteo manual de los objetos entre ciclos. El propio autor aclara que se trata de una unica demostracion y no de una estimacion estadistica de tasa de exito, y que el video no incluye un hash del checkpoint que permita saber que fichero exacto se cargo durante la grabacion.

| Metrica | Resultado | Fuente |
|---|---|---|
| Exito en pick-and-place autonomo | 8 ciclos consecutivos correctos, fallo en el intento 9, con reseteos manuales | Video del autor citado en la model card (una sola demostracion, no estadistico) |
| Throughput de entrenamiento | ~2,83 pasos/s en RTX 4070 Laptop GPU | Model card |
| Pasos de entrenamiento | 120.000 (batch size 8, AMP) | Model card |
| MMLU / HumanEval / GSM8K | no aplica (no es un modelo de lenguaje) | - |

## Requisitos de hardware

- Peso de los parametros: ~51,7 M de parametros, aproximadamente 207 MB en fp32 y ~103 MB en fp16/bf16. El repositorio completo ocupa 0,2 GB, asi que los pesos no son el cuello de botella.
- VRAM de inferencia: dominada por las activaciones del backbone visual a 640 x 480 con dos camaras, no por los pesos. No se publica una cifra exacta de VRAM de inferencia; el dato medido disponible es de entrenamiento: ~2,83 pasos/s en una RTX 4070 Laptop GPU con AMP.
- GPU recomendadas: cualquier GPU con soporte CUDA razonablemente moderna. El autor reporta el entrenamiento en una RTX 4070 Laptop; el entorno de referencia usa torch 2.10.0+cu126.
- GPU de consumo: si, cabe con holgura en GPU de consumo (por ejemplo RTX 3060/4070 y superiores). Al ser una politica pequena, la limitacion real es la latencia del preprocesado de imagen, no la memoria.
- CPU: la inferencia en CPU es tecnicamente posible por el tamano del modelo, pero no se publica ninguna cifra de latencia en CPU; no disponible.
- Opciones de despliegue: la via soportada es la libreria `lerobot` junto con el repositorio companion `zbylink/SO101-ACT-Pick-and-Place`, que ofrece `python main.py download-model` y `python main.py verify-model` y un manifest con el commit del Hub y el SHA-256 de cada fichero. No se debe pasar un unico fichero de pesos como ruta de politica: hay que usar el directorio completo.
- No aplican vLLM, llama.cpp, Ollama ni TGI: son servidores para modelos de lenguaje y esta es una politica visomotora con procesadores y normalizadores propios.
- Advertencia de entorno: el autor avisa de que el fork fijado en el repositorio de codigo es la referencia, y que versiones arbitrarias de upstream o de PyPI pueden presentar un CLI o un comportamiento de procesadores incompatibles.

## Comparativa con modelos similares

| Modelo | Parametros | Horizonte / contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BoyuZhao/so101-act-pick-and-place | 51,67 M | action chunk de 100 | 8 ciclos consecutivos correctos, fallo en el 9 (demostracion unica) | MIT | HuggingFace Hub, 0 descargas, 0 likes |
| shenlirobot/act_so101_pick_place | no disponible | no disponible | no disponible | no disponible | HuggingFace Hub |
| ShiangYu/act_so101_pick_place_v3 | no disponible | no disponible | no disponible | no disponible | HuggingFace Hub |
| mikami235/so101-act-pick-place | no disponible | no disponible | no disponible | no disponible | GitHub (repositorio de codigo) |
| Proyecto academico CS6341 (pick and place con SO-101) | no disponible | no disponible | 90 demostraciones recogidas (30 por color de cubo); sin tasa de exito publicada en el extracto | no disponible | PDF publico |

No se dispone de especificaciones tecnicas ni de resultados comparables de las alternativas listadas en la busqueda web, por lo que la comparacion queda limitada a la disponibilidad y a la existencia del artefacto.

## Limitaciones y advertencias

- Ausencia de garantia de generalizacion: el autor declara explicitamente que no se ofrece ninguna garantia cross-hardware, cross-scene ni de generalizacion. El modelo asume la misma geometria de escena, colocacion de camaras, convenciones de articulaciones y condiciones de tarea.
- Dependencia de nombres de camara fijos: las camaras deben llamarse `wrist` y `front`. Cambiar esos nombres rompe el pipeline.
- Ambiguedad en las unidades articulares: la configuracion `use_degrees` no se ha podido establecer a partir de la configuracion de entrenamiento guardada. El autor recomienda confirmarla desde los ajustes originales de grabacion antes de mover un robot con estos pesos, y aclara que el gestor en Python no la adivina.
- Dataset de entrenamiento no incluido ni verificado: el experiment ID es `BoyuZhao/so101_test`, pero el dataset no forma parte de la release y su disponibilidad publica no ha sido comprobada.
- Evidencia de rendimiento no estadistica: los 8 ciclos correctos seguidos de un fallo son una unica demostracion con reseteo manual de objetos. No hay tasa de exito, ni intervalos de confianza, ni condiciones controladas documentadas.
- Trazabilidad del video incompleta: el video no incluye un hash del checkpoint que demuestre que fichero exacto se cargo durante la grabacion, y el proceso de subida no constituye una nueva evaluacion fisica.
- Riesgo de sobreajuste a la tarea y al entorno: 40 episodios y 18.828 fotogramas a 30 FPS es un volumen reducido; es razonable esperar sensibilidad a cambios de iluminacion, posicion inicial u objetos distintos de los vistos, aunque no se cuantifica en la informacion disponible.
- Riesgo de fallo silencioso: al ser una politica de imitacion sin mecanismo de deteccion de incertidumbre, puede ejecutar acciones incorrectas sin aviso; requiere supervision o limites de seguridad en el robot.
- Restricciones de licencia: los pesos se publican bajo MIT, pero el framework LeRobot y la implementacion de ACT son trabajo de terceros y mantienen sus propias licencias. El backbone visual se inicializo con pesos ImageNet de torchvision, cuyos terminos aplican.
- Advertencia de entorno de ejecucion: usar versiones de `lerobot` distintas del fork fijado puede provocar incompatibilidades de CLI o de procesadores; hay que respetar el manifest con los SHA-256 del repositorio companion.
- No es un modelo de lenguaje: no admite prompts en lenguaje natural, ni tool calling, ni razonamiento multi-paso, ni capacidades multilingues.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BoyuZhao/so101-act-pick-and-place
- Repositorio de codigo, setup y evaluacion continua (companion): https://github.com/zbylink/SO101-ACT-Pick-and-Place
- Alternativa en el Hub: https://huggingface.co/shenlirobot/act_so101_pick_place
- Alternativa en el Hub: https://huggingface.co/ShiangYu/act_so101_pick_place_v3
- Repositorio GitHub relacionado: https://github.com/mikami235/so101-act-pick-place
- Proyecto academico sobre pick and place con SO-101 (CS6341): https://yuxng.github.io/Courses/CS6341Fall2025/project_group_10.pdf
