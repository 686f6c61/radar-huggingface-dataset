# SoSolaris/xvla-b1123-1444-xv2_frozen_vlm

## Resumen

X-VLA es un marco de Vision-Language-Action (VLA) basado en flow matching y soft prompting, desarrollado en el ecosistema LeRobot de Hugging Face. La idea central es tratar cada configuracion de robot o hardware como una "tarea" codificada mediante un pequeno conjunto de embeddings de Soft Prompt aprendibles, lo que permite que un unico modelo reconcilie morfologias de robot, sensores y espacios de accion diversos. Este repositorio concreto (`SoSolaris/xvla-b1123-1444-xv2_frozen_vlm`) es un fine-tuning del modelo base `lerobot/xvla-base` sobre un dataset propio de una tarea de manipulacion bimanual.

El modelo resuelve el problema de la generalizacion entre plataformas roboticas: en lugar de entrenar una politica independiente por robot, X-VLA condiciona la politica sobre un prompt aprendible especifico de la configuracion. Este checkpoint particular esta especializado en una unica tarea fisica ("agarrar la lata y verter su contenido en la taza, sin agua") sobre un robot bimanual denominado `solaria_bimanual` con tres camaras.

Con 879.687.256 parametros (~880 M) y un repositorio de 1,8 GB en formato safetensors, es un modelo de escala moderada pensado para inferencia en tiempo real a 30 FPS sobre hardware de robot real. Su relevancia radica en ser un ejemplo reproducible del flujo LeRobot para politicas VLA, con licencia Apache 2.0 y trazabilidad completa del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) con flow matching y soft prompting (X-VLA) |
| Parametros totales | 879.687.256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica; no orientado a texto multilingue) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |
| Modelo base | lerobot/xvla-base |
| Tipo de robot | solaria_bimanual |
| Camaras de entrada | up, right, left |
| Entrada visual | observation.images.image (3, 256, 256); observation.images.image2 (3, 256, 256); observation.images.image3 (3, 224, 224) |
| Entrada de estado | observation.state (8,) |
| Salida de accion | action (14,) |
| Frecuencia de datos | 30 FPS |
| Version de LeRobot | 0.6.2 |

## Arquitectura y entrenamiento

X-VLA es un marco VLA que combina un backbone vision-language con un cabezal de accion basado en flow matching. La innovacion principal es el uso de Soft Prompt embeddings aprendibles que codifican la identidad del robot (morfologia, sensores, espacio de accion), de modo que el mismo modelo puede adaptarse a distintos setups sin duplicar pesos. En este checkpoint, la politica consume tres flujos de imagen (dos a 256x256 y uno a 224x224) mas un vector de estado de 8 dimensiones, y produce un vector de accion de 14 dimensiones, coherente con un robot bimanual.

El fine-tuning se realizo sobre el dataset `SoSolaris/can_to_mug_merged_20261117_trimmed`, compuesto por 195 episodios y 200.716 fotogramas a 30 FPS de la tarea "Grab the can and pour its contain in the mug (without water)". La configuracion de entrenamiento reportada incluye 20.000 pasos, batch size 64, optimizador `xvla-adamw`, learning rate 0.0001 y semilla 1000. El sufijo `frozen_vlm` del nombre sugiere que el backbone vision-language se mantuvo congelado durante el ajuste, entrenandose solo las partes especificas de la politica, aunque la model card no lo detalla explicitamente.

## Capacidades

- Control robotico de manipulacion bimanual: genera acciones de 14 dimensiones a partir de observaciones visuales y de estado.
- Fusion multisensorial: integra tres camaras con resoluciones distintas y un vector de estado de 8 dimensiones.
- Aprendizaje por imitacion: politica entrenada por imitation learning sobre demostraciones reales.
- Flow matching para generacion de acciones continuas, adecuado para control motor suave.
- Soft prompting para adaptacion a configuraciones de hardware especificas.
- Ejecucion en tiempo real a 30 FPS sobre el robot `solaria_bimanual`.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje general).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision general, audio): no disponibles; la vision se limita a la percepcion robotica de la tarea.

## Casos de uso

- Automatizacion de tareas de vertido en laboratorio: el modelo ejecuta la secuencia de agarrar una lata y verter su contenido en una taza, util para prototipos de manipulacion bimanual en entornos controlados.
- Base para fine-tuning en nuevas tareas de manipulacion: partiendo de `lerobot/xvla-base` y de este checkpoint, un equipo puede reentrenar con su propio dataset LeRobot para tareas de pick-and-place o ensamblaje.
- Investigacion en aprendizaje por imitacion: sirve como referencia reproducible de un pipeline completo (dataset, entrenamiento, rollout) con hiperparametros documentados.
- Evaluacion de politicas VLA en robots bimanuales: permite medir tasas de exito y robustez frente a cambios de posicion de objetos o iluminacion.
- Demostraciones de robotica en ferias o docencia: con 195 episodios y ~880 M de parametros, es ligero enough para ejecutarse en estaciones de trabajo con GPU consumer.
- Generacion de datos sinteticos de trayectorias: las acciones generadas pueden registrarse y reutilizarse para aumentar datasets de manipulacion.
- Integracion en pipelines LeRobot: se ejecuta mediante `lerobot-rollout` y se entrena con `lerobot-train`, lo que facilita su incorporacion en flujos de CI para politicas roboticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de exito en robot real ni de comparaciones numericas con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con ~880 M de parametros en FP32 se situaria en torno a 3,5 GB solo de pesos, mas overhead de activaciones y buffers de imagen.
- GPU recomendadas: no especificadas por el autor; por tamano, una GPU consumer de gama media-alta (RTX 3060 12 GB o superior) seria suficiente en teoria, aunque no hay confirmacion oficial.
- Cabe en GPU consumer: probablemente si, dado el tamano del modelo, pero no verificado en la informacion disponible.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), y el flujo de entrenamiento `lerobot-train`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de politica.
- Latencia y throughput: la politica esta pensada para operar a 30 FPS (frecuencia del dataset), pero no se publican mediciones de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SoSolaris/xvla-b1123-1444-xv2_frozen_vlm | 879.687.256 | VLA (X-VLA) fine-tuned | no disponible | apache-2.0 | Hugging Face |
| lerobot/xvla-base | no disponible | VLA (X-VLA) base | no disponible | no disponible en la informacion | Hugging Face |
| Otras politicas LeRobot (p. ej. ACT, Diffusion Policy) | no disponible | Politicas de imitacion | no disponible | no disponible | Hugging Face / LeRobot |

No se dispone de datos numericos de rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoria. La comparacion se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- Especializacion extrema: el modelo esta entrenado para una unica tarea ("Grab the can and pour its contain in the mug (without water)") y un unico robot (`solaria_bimanual`); no generaliza a otras tareas sin reentrenamiento.
- Sin evaluacion publicada: no hay tasas de exito ni validacion en robot real, por lo que se desconoce su robustez ante variaciones de posicion, iluminacion o distractores.
- Dependencia de hardware: requiere el robot `solaria_bimanual` y tres camaras con nombres y resoluciones especificos; cualquier desviacion invalida la inferencia.
- Riesgo de sobreajuste: con 195 episodios y 20.000 pasos de entrenamiento, es plausible un sobreajuste al dataset, aunque no se documenta.
- Sesgos: no documentados; al ser un modelo de robotica, los sesgos relevantes serian de distribucion de datos (posiciones, objetos, condiciones de laboratorio).
- Alucinacion: no aplica en el sentido linguistico, pero si existe riesgo de acciones incorrectas o inseguras en el mundo fisico.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; el uso en produccion fisica requiere validacion propia.
- Idiomas: no disponible; el modelo no esta orientado a interaccion en lenguaje natural general.
- Fecha de creacion futura (2026-11-23) en los metadatos, lo que sugiere posible error de marcado temporal o un entorno de prueba; conviene verificar la procedencia antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SoSolaris/xvla-b1123-1444-xv2_frozen_vlm
- Modelo base: https://huggingface.co/lerobot/xvla-base
- Dataset de entrenamiento: https://huggingface.co/datasets/SoSolaris/can_to_mug_merged_20261117_trimmed
- Paper X-VLA: https://huggingface.co/papers/2510.10274
- Guia LeRobot X-VLA: https://huggingface.co/docs/lerobot/main/en/xvla
- Documentacion LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SoSolaris/can_to_mug_merged_20261117_trimmed
- Instalacion LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
