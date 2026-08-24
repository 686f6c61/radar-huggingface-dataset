# adrfm/pick_place_b601_act_draccus_bug_test

## Resumen

Este modelo es una politica de robotica basada en ACT (Action Chunking with Transformers), desarrollada por Aaron De Rybel (adrfm) utilizando el framework LeRobot de Hugging Face. Esta entrenada para ejecutar una tarea de pick-and-place —colocar un disco negro en una caja— sobre el brazo robotico Seeed B601, un robot de seis grados de libertad totalmente open source. El modelo aprende por imitacion a partir de 50 episodios teleoperados y predice secuencias de acciones (action chunks) en lugar de pasos individuales, lo que mejora la estabilidad del control en tareas de manipulacion.

La arquitectura ACT combina un transformer con un codificador de vision (ResNet) para procesar imagenes de dos camaras (frontal y de muneca) junto con el estado del robot, y un decodificador autoregresivo que genera los chunks de accion. Con 51,7 millones de parametros y un tamano de 0,2 GB, es un modelo ligero que puede ejecutarse en GPUs de consumo. El nombre del repositorio incluye "bug_test", lo que sugiere que se trata de una prueba o validacion de un fallo corregido en el pipeline de entrenamiento con Draccus, la libreria de configuracion utilizada.

La relevancia de este modelo radica en que demuestra el flujo completo de LeRobot para entrenar y desplegar politicas de manipulacion en hardware real, con licencia Apache 2.0 que permite uso comercial sin restricciones. No se han publicado resultados de evaluacion en robot real, por lo que su rendimiento efectivo no esta verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.721.863 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (politica robotica, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion presentado en el paper arxiv:2304.13705 que predice chunks de acciones (secuencias de 7 dimensiones) en lugar de acciones individuales. La politica consume tres entradas: el estado del robot (7 dimensiones, correspondientes a las articulaciones del brazo B601) y dos imagenes RGB de 480x640 píxeles procedentes de las camaras frontal y de muneca. El modelo combina un backbone de vision (ResNet) con un transformer que procesa las observaciones y genera los chunks de accion de forma autoregresiva.

El entrenamiento se realizo con el framework LeRobot version 0.6.2 sobre el dataset adrfm/pick_place_b601, que contiene 50 episodios teleoperados con un total de 15.905 frames a 30 FPS. La configuracion de entrenamiento incluye 100 pasos, batch size de 8, optimizador AdamW con learning rate de 1e-5 y semilla 1000. La tarea registrada es "Place black disk in box". El nombre del repositorio sugiere que se utilizo la libreria Draccus para la gestion de configuracion, posiblemente para depurar un error en el pipeline.

## Capacidades

- Manipulacion pick-and-place: ejecuta la tarea de recoger un disco negro y colocarlo en una caja, aprendida por imitacion de demostraciones teleoperadas.
- Percepcion visual multimodal: procesa simultaneamente dos flujos de video (camara frontal y camara de muneca) a 30 FPS con resolucion 480x640.
- Control en bucle cerrado: genera acciones de 7 dimensiones (articulaciones del brazo) a partir del estado actual del robot y las observaciones visuales.
- Prediccion por chunks: genera secuencias de acciones (action chunking) en lugar de pasos individuales, lo que reduce la acumulacion de errores durante la ejecucion.
- Compatibilidad con LeRobot: se integra con el ecosistema LeRobot para entrenamiento, evaluacion y despliegue mediante comandos CLI estandarizados.
- Especificidad de hardware: entrenada para el brazo Seeed B601, aunque la arquitectura ACT es transferible a otros robots con adaptacion.

## Casos de uso

- Automatizacion de tareas de pick-and-place en entornos industriales: el modelo puede integrarse en lineas de montaje para clasificar o reubicar piezas pequeñas, aprovechando su capacidad de aprender de demostraciones sin programacion explicita de trayectorias.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar el efecto del action chunking en la tasa de exito de tareas de manipulacion, comparando con politicas que predicen acciones individuales.
- Prototipado rapido de celdas roboticas: con LeRobot, un operario puede teleoperar el robot durante 50 episodios y desplegar la politica entrenada en menos de una hora, ideal para validar conceptos antes de invertir en automatizacion completa.
- Educacion y formacion en robotica: el modelo y su dataset asociado son recursos didacticos para ensenar aprendizaje por refuerzo por imitacion, vision por computador aplicada a robotica y despliegue de politicas en hardware real.
- Benchmarking de algoritmos de manipulacion: al estar publicado con licencia abierta y datos de entrenamiento disponibles, permite reproducir experimentos y comparar ACT con otros metodos (diffusion policies, etc.) en la misma tarea.
- Validacion de pipelines de entrenamiento: el sufijo "bug_test" indica que este modelo puede usarse para verificar que un pipeline de entrenamiento con Draccus funciona correctamente antes de lanzar entrenamientos a mayor escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet". No existen datos de tasa de exito en robot real ni comparaciones con otras politicas en la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo ocupa 0,2 GB en safetensors, por lo que la inferencia en FP32 requiere aproximadamente 207 MB de VRAM, y en FP16 unos 103 MB. Cualquier GPU con 2 GB o mas de VRAM es suficiente.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (GTX 1050 Ti o superior, RTX 3060, RTX 4090, etc.). No se requiere GPU de datacenter.
- Compatibilidad con GPU de consumo: si, el modelo cabe sin problemas en cualquier GPU consumer actual, incluso en las de gama baja.
- Opciones de despliegue: LeRobot proporciona el comando `lerobot-rollout` para ejecutar la politica en el robot. Tambien es posible cargar los pesos safetensors directamente con PyTorch para inferencia offline o simulacion.
- Latencia y throughput: no disponible. Depende de la GPU utilizada y del tamaño de las imagenes de entrada (480x640), que dominan el coste computacional frente al transformer de 51,7 M de parametros.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa con otras politicas de manipulacion en la misma tarea. Como referencia cualitativa:

| Modelo | Parametros | Tarea | Licencia | Evaluacion publicada |
|---|---|---|---|---|
| adrfm/pick_place_b601_act_draccus_bug_test | 51,7 M | Pick-and-place (disco en caja) | Apache 2.0 | No |
| ACT (paper original, arxiv:2304.13705) | no disponible | Diversas tareas de manipulacion | no disponible | Si, en entornos simulados y reales |
| Otras politicas LeRobot (diffusion, vqbet) | no disponible | Diversas | Apache 2.0 | Depende del modelo |

La comparativa con el paper original de ACT no es directa porque los resultados publicados en el articulo corresponden a tareas y robots diferentes. No se han encontrado modelos comparables entrenados especificamente para el Seeed B601 en la misma tarea.

## Limitaciones y advertencias

- Sin evaluacion verificada: la model card no incluye resultados de tasa de exito en robot real, por lo que el rendimiento efectivo del modelo es desconocido.
- Entrenamiento limitado: solo 50 episodios y 100 pasos de entrenamiento, lo que probablemente resulte en una politica con baja generalizacion a variaciones de posicion, iluminacion o distracciones.
- Tarea unica: el modelo solo ejecuta la tarea "Place black disk in box"; no es capaz de generalizar a otras tareas sin reentrenamiento.
- Dependencia del hardware especifico: entrenado para el Seeed B601 con dos camaras concretas; su transferencia a otros robots o configuraciones de camaras requiere recalibracion y posiblemente reentrenamiento.
- Posible modelo de prueba: el sufijo "bug_test" sugiere que este checkpoint puede ser un artefacto de depuracion, no una politica final optimizada.
- Sin soporte de idiomas ni interaccion textual: al ser una politica robotica, no procesa lenguaje natural ni genera respuestas.
- Riesgo de sobreajuste: con solo 15.905 frames de un unico operador, la politica puede memorizar las demostraciones en lugar de aprender una estrategia robusta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adrfm/pick_place_b601_act_draccus_bug_test
- Dataset de entrenamiento: https://huggingface.co/datasets/adrfm/pick_place_b601
- Perfil del autor: https://huggingface.co/adrfm
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Documentacion de rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Libreria Draccus en PyPI: https://pypi.org/project/draccus/
- Blog de Seeed Studio sobre el brazo B601: https://www.seeedstudio.com/blog/2026/04/20/seeed-studio-launches-rebot-arm-b601-a-fully-open-source-robotic-arm-built-for-physical-ai/
