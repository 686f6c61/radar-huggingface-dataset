# mysterium99/smolvla-0pct-neutral

## Resumen

Se trata de un modelo Vision-Language-Action (VLA) compacto y eficiente, desarrollado como un fine-tuning del modelo base lerobot/smolvla_base. Forma parte de la familia SmolVLA, presentada en el paper arxiv:2506.01844, cuyo objetivo es lograr rendimiento competitivo en tareas de manipulacion robotica con un coste computacional reducido y la posibilidad de ejecutarse en hardware de consumo. Este checkpoint concreto, publicado por mysterium99, ha sido entrenado con el dataset default_merged y el framework LeRobot, y contiene 450.046.176 parametros en formato safetensors, con un tamano de repositorio de 0.9 GB.

El modelo esta pensado para robotica: consume observaciones visuales y de estado y produce acciones de 6 dimensiones para un robot Follower. Su relevancia radica en que permite experimentar con politicas de aprendizaje por imitacion sobre un hardware accesible, sin necesidad de infraestructura de servidores, manteniendo la trazabilidad completa en Hugging Face y LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacto, basado en SmolVLA |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (no es un modelo de texto; no se ha publicado ventana de contexto) |
| Tipos de cuantizacion | No disponible (solo pesos safetensors, precision no documentada) |
| Idiomas soportados | No declarado (modelo de robotica; la entrada de lenguaje no esta documentada) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0.9 GB) |

## Arquitectura y entrenamiento

SmolVLA es una familia de modelos VLA disenada para reducir el coste computacional frente a modelos de robotica mas grandes. El checkpoint parte de lerobot/smolvla_base y se ha fine-tuneado con el framework LeRobot version 0.6.1. Los datos de entrenamiento pertenecen al dataset default_merged, compuesto por 150 episodios y 83.987 fotogramas a 30 FPS, con tres tareas documentadas: empujar un bloque hasta una zona marcada con cinta, recoger un cubo y colocarlo en una taza, y poner todos los bloques amarillos en una papelera.

La configuracion de entrenamiento declarada es la siguiente: 20.000 pasos, batch size 8, optimizador AdamW, learning rate 0.0001 y seed 0. En la interfaz de entrada, el modelo consume un vector de estado de 6 dimensiones y hasta tres imagenes de 256x256 píxeles; produce una accion de 6 dimensiones. Las camaras mencionadas en la model card son top camera y side camera, aunque la tabla de entradas acepta tres canales visuales.

## Capacidades

- Generacion de acciones de robotica: produce vectores de accion de 6 dimensiones para controlar un robot Follower.
- Procesamiento visual: acepta imagenes de camara de 256x256 píxeles, incluyendo vistas superior y lateral segun la model card.
- Aprendizaje por imitacion: esta pensado como politica de control entrenada por imitacion, no como modelo generativo de texto.
- Integracion con LeRobot: puede cargarse directamente con `lerobot-rollout` y reentrenarse con `lerobot-train`.
- No incluye tool calling ni function calling: al no ser un modelo de lenguaje, no ofrece esta capacidad.
- No soporta agentes conversacionales ni multi-step reasoning de alto nivel: la actuacion es reactiva sobre el entorno observado.
- No tiene modo thinking, audio ni generacion de texto libre.

## Casos de uso

- Investigacion en aprendizaje por imitacion: sirve como politica de referencia para estudiar como un VLA de 450M de parametros se comporta en tareas de manipulacion, y permite reentrenarlo sobre nuevos datasets sin partir de cero.
- Prototipado de robots manipuladores con presupuesto limitado: al ser compacto, se puede ejecutar en un ordenador con GPU de consumo, por ejemplo una RTX 4060, para validar la tarea de empujar un bloque hasta una zona marcada sin necesidad de servidores.
- Automatizacion de tareas repetitivas en control de calidad: la tarea de poner todos los bloques amarillos en una papelera es un ejemplar de clasificacion y manipulacion; con un fine-tuning adicional podria adaptarse a objetos similares en un entorno controlado.
- Evaluacion y benchmarking de politicas de robotica: se puede cargar con `lerobot-rollout` y medir tasa de exito en un brazo real o simulado, comparando con otras variantes como smolvla-pre-25pct.
- Docencia en laboratorios de robotica: las universidades pueden usar este modelo como base para practicas de control, ya que esta integrado en LeRobot y elimina la necesidad de entrenar una politica desde cero.
- Prototipos de manipulacion de 6 grados de libertad: el modelo genera acciones de 6 dimensiones a partir de imagenes y estado, cubriendo posicion y orientacion en tareas de pick-and-place con una pinza.
- Integracion en flujos de percepcion y control existentes: al consumir imagenes de 256x256 y un vector de estado, puede conectarse a pipelines de vision y control siempre que se adapten los preprocesados y las claves de observacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion para esta politica.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint de 450M de parametros en FP16 ocupa aproximadamente 0.9 GB; con las activaciones de imagen, se recomiendan al menos 4 GB de VRAM. En FP32 la cifra sube a unos 2 GB, por lo que una GPU de 6 GB es una opcion prudente.
- GPU recomendadas: cualquier GPU de consumo moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; no se requieren A100 ni H100.
- Compatibilidad con hardware de consumo: si, el modelo esta disenado para poder ejecutarse en equipos de consumo.
- Opciones de despliegue: LeRobot (con `lerobot-rollout` y `lerobot-train`) y ejecucion local mediante Python. vLLM, TGI, llama.cpp y Ollama no son aplicables por tratarse de un modelo de robotica, no un LLM.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mysterium99/smolvla-0pct-neutral | 450.046.176 | No disponible | No publicado | Apache 2.0 | Hugging Face |
| mysterium99/smolvla-pre-25pct | No disponible | No disponible | No publicado | No disponible | Hugging Face |
| lerobot/smolvla_base | No disponible | No disponible | No disponible | No disponible | Hugging Face |

No hay datos publicados que permitan comparar el rendimiento de estos modelos entre si.

## Limitaciones y advertencias

- No se han publicado resultados de evaluacion, por lo que no se conoce la tasa de exito real sobre las tareas del dataset.
- El modelo ha sido entrenado con un dataset relativamente pequeño (150 episodios) y tres tareas concretas, lo que limita su generalizacion a nuevos objetos, entornos y posiciones.
- Al ser una politica reactiva, puede generar acciones incorrectas o no deseadas en situaciones fuera de la distribucion de entrenamiento.
- No es un modelo de lenguaje: no puede responder preguntas, mantener conversaciones ni razonar sobre instrucciones de texto libre.
- La entrada de lenguaje no esta documentada, por lo que no se puede garantizar el comportamiento si se utilizan prompts de texto.
- La licencia Apache 2.0 permite uso comercial, pero la responsabilidad del despliegue seguro recae sobre el usuario final.
- Para produccion se recomienda evaluar previamente el modelo en el hardware y las tareas reales del robot antes de cualquier despliegue.

## Enlaces

- Modelo: https://huggingface.co/mysterium99/smolvla-0pct-neutral
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/default_merged
- Framework LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion general de LeRobot: https://huggingface.co/docs/lerobot/index
- Variante similar en el mismo autor: https://huggingface.co/mysterium99/smolvla-pre-25pct
