# Ekko55/vla-block-sort-policy

## Resumen

Ekko55/vla-block-sort-policy es un modelo de robótica de tipo Vision-Language-Action (VLA) desarrollado por Ekko55 (Ekam Kooner) mediante fine-tuning del modelo base [lerobot/smolvla_base](https://huggingface.co/lerobot/smolvla_base) utilizando la librería LeRobot. El modelo está especializado en una tarea de clasificación y agarre de bloques (bloques negros y blancos) con un robot tipo `so_follower`, y se distribuye bajo licencia Apache 2.0.

SmolVLA es una arquitectura compacta de VLA diseñada para ejecutarse en hardware de consumo, y este fine-tuning concreto demuestra su aplicabilidad a tareas de manipulación específicas con un coste computacional reducido. El modelo tiene aproximadamente 450 millones de parámetros (450.046.176), un tamaño notablemente inferior al de otros VLA como OpenVLA (7B), lo que lo hace adecuado para despliegue en GPUs de gama media.

El modelo fue entrenado sobre un dataset propio de 100 episodios (60.876 frames a 30 FPS) con dos tareas: "Grab the black block" y "Grab the white block". No se han publicado resultados de evaluación en robot real, por lo que su rendimiento en producción no está verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible (modelo de accion robotica, no de lenguaje general) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura VLA compacta propuesta en el paper [arXiv:2506.01844](https://huggingface.co/papers/2506.01844), diseñada para lograr rendimiento competitivo en tareas de control robotico con un coste computacional reducido. El modelo base `lerobot/smolvla_base` fue fine-tuneado para esta tarea especifica de clasificacion de bloques. La arquitectura interna exacta (tipo de transformer, atencion, etc.) no se detalla en la informacion disponible, pero se sabe que es un modelo de 450M de parametros que procesa entradas visuales de multiples camaras y un vector de estado del robot para producir acciones de 6 dimensiones.

El entrenamiento se realizo con el dataset `Ekko55/vla-block-sort_20260818_191427`, que contiene 100 episodios (60.876 frames a 30 FPS) de un robot `so_follower` realizando las tareas de agarrar bloques negros y blancos. La configuracion de entrenamiento incluye 20.000 pasos, batch size de 64, optimizador AdamW con learning rate 0.0001 y semilla 1000. No se menciona el uso de RLHF, DPO ni otros metodos de alineacion adicionales.

## Capacidades

- Control robotico de manipulacion: genera acciones de 6 dimensiones (posicion y orientacion del efector final) a partir de observaciones visuales y de estado.
- Percepcion visual multicamara: procesa 3 camaras de resolucion 256x256 y 2 camaras de 480x640, lo que permite capturar multiples perspectivas de la escena.
- Tareas especificas entrenadas: agarre de bloques negros y agarre de bloques blancos, con distincion visual entre ambos.
- Integracion con LeRobot: compatible con el ecosistema de entrenamiento y despliegue de LeRobot (v0.6.2), incluyendo scripts de rollout y entrenamiento.
- No es un modelo de lenguaje general: no soporta tool calling, agentes conversacionales ni generacion de texto libre.

## Casos de uso

- Automatizacion de clasificacion de piezas en lineas de montaje: el modelo puede distinguir y agarrar bloques de dos colores, una tarea tipica en entornos industriales de bajo volumen. Se desplegaria con el comando `lerobot-rollout` sobre un robot `so_follower`.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar tecnicas de fine-tuning de VLA compactos en tareas de manipulacion, gracias a su tamano reducido y licencia permisiva.
- Prototipado rapido de politicas roboticas: al tener solo 450M de parametros, puede entrenarse y evaluarse en GPUs de consumo, acelerando el ciclo de iteracion en laboratorios academicos.
- Educacion en robotica: permite a estudiantes experimentar con VLA sin necesidad de infraestructura de alto coste, usando el robot `so_follower` y camaras web estandar.
- Benchmarking de VLA compactos: puede utilizarse como referencia para comparar el rendimiento de arquitecturas VLA de tamano reducido frente a modelos mas grandes como OpenVLA.
- Prueba de concepto de despliegue en brazos roboticos de bajo coste: el modelo puede ejecutarse en hardware modesto, lo que lo hace candidato para proyectos de robotica DIY o startups con presupuesto limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion en robot real ("No evaluation results have been provided for this policy yet"). No se proporcionan metricas como tasa de exito, MMLU, HumanEval ni otras comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Con 450M de parametros en FP32 (~1,8 GB), se estima que cabria en GPUs consumer con 6 GB o mas de VRAM, pero no hay datos verificados.
- GPU recomendadas: no se especifican. Dado el tamano del modelo, una RTX 3060 (12 GB) o superior seria suficiente para inferencia. Para entrenamiento, se necesitaria al menos 12-16 GB de VRAM segun el batch size.
- Compatibilidad con consumer GPU: probablemente si, dada la naturaleza compacta de SmolVLA, pero no hay confirmacion oficial.
- Opciones de despliegue: LeRobot (via `lerobot-rollout`), compatible con el ecosistema Hugging Face. No se mencionan vLLM, Ollama ni TGI, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Licencia | Tarea | Disponibilidad |
|---|---|---|---|---|
| Ekko55/vla-block-sort-policy | 450M | Apache 2.0 | Agarres de bloques (2 tareas) | Hugging Face |
| OpenVLA (openvla-7b) | 7B | MIT | Manipulacion general | GitHub/Hugging Face |
| lerobot/smolvla_base | 450M (estimado) | Apache 2.0 | Base para fine-tuning | Hugging Face |

SmolVLA es significativamente mas compacto que OpenVLA (7B), lo que reduce los requisitos de hardware y el coste de inferencia. Sin embargo, este fine-tuning concreto esta limitado a dos tareas muy especificas, mientras que OpenVLA es un modelo de proposito mas general. No hay datos de rendimiento comparativo disponibles para este checkpoint.

## Limitaciones y advertencias

- Solo entrenado para dos tareas concretas (agarrar bloque negro y agarrar bloque blanco); no generaliza a otros objetos o comandos sin reentrenamiento.
- No se han reportado resultados de evaluacion en robot real; el rendimiento en produccion es desconocido.
- Depende de la configuracion especifica del robot `so_follower` y de las camaras utilizadas durante la recogida de datos; cambios en la iluminacion, posicion de camaras o tipo de robot pueden degradar el rendimiento.
- El dataset de entrenamiento es pequeno (100 episodios), lo que puede limitar la robustez frente a variaciones del entorno.
- No es un modelo multimodal general: no procesa texto ni audio, solo imagenes y estado del robot.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo no incluye garantias de rendimiento ni soporte.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Ekko55/vla-block-sort-policy)
- [Dataset de entrenamiento](https://huggingface.co/datasets/Ekko55/vla-block-sort_20260818_191427)
- [Paper de SmolVLA (arXiv:2506.01844)](https://huggingface.co/papers/2506.01844)
- [Modelo base lerobot/smolvla_base](https://huggingface.co/lerobot/smolvla_base)
- [Documentacion de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guia de SmolVLA en LeRobot](https://huggingface.co/docs/lerobot/main/en/smolvla)
