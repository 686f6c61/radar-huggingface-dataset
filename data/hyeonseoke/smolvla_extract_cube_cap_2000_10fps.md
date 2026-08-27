# HyeonseokE/smolvla_extract_cube_cap_2000_10fps

## Resumen

SmolVLA es un modelo de vision-language-action (VLA) compacto y eficiente desarrollado por Hugging Face, disenado para controlar robots mediante instrucciones en lenguaje natural. Este repositorio concreto contiene un fine-tuning del modelo base `lerobot/smolvla_base` realizado por HyeonseokE para una tarea especifica de manipulacion robotica: extraer un cubo de un bolsillo y colocarlo sobre un marcador objetivo. El modelo se ha entrenado con el framework LeRobot y el dataset `HyeonseokE/extract_cube_cap_10fps`, que contiene 100 episodios y 31.575 fotogramas capturados a 10 FPS.

La relevancia de este modelo radica en que SmolVLA consigue un rendimiento competitivo en tareas de robotica con un coste computacional reducido, lo que permite su despliegue en hardware de consumo. Con 450 millones de parametros, es significativamente mas pequeno que otros VLA como OpenVLA (7B parametros), lo que lo hace accesible para investigacion y prototipado en entornos con recursos limitados. El modelo esta entrenado para operar con el robot SO-101 (Follower) y utiliza dos camaras: una superior y otra en la muneca izquierda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (VLM compacto + experto de acciones con flow matching) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (instrucciones en ingles en el dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA combina un modelo de lenguaje y vision (VLM) compacto preentrenado con un "experto de acciones" entrenado mediante flow matching. Dado un conjunto de imagenes y una instruccion en lenguaje natural, el modelo genera un fragmento (chunk) de acciones para el robot. Esta arquitectura hibrida permite separar la comprension visual-linguistica del control motor, facilitando el fine-tuning para tareas especificas sin necesidad de reentrenar el VLM completo.

El fine-tuning de este modelo se realizo con el framework LeRobot (version 0.5.1) sobre el dataset `extract_cube_cap_10fps`, que contiene 100 episodios de la tarea "Extract the cube from the pocket and place it on the target marker". La configuracion de entrenamiento incluyo 24.668 pasos, batch size de 64, optimizador AdamW y una tasa de aprendizaje de 0.0001. El robot utilizado fue el SO-101 Follower con dos camaras (superior y muneca izquierda), y las observaciones incluyen el estado del robot (6 dimensiones) y tres imagenes de 256x256 píxeles.

## Capacidades

- Control robotico por imitacion: genera acciones de 6 grados de libertad (posicion y orientacion) a partir de observaciones visuales y del estado del robot.
- Comprension de instrucciones en lenguaje natural: interpreta tareas descritas en texto, como "Extract the cube from the pocket and place it on the target marker".
- Procesamiento multi-camara: integra informacion visual de dos camaras (superior y muneca izquierda) para percibir el entorno.
- Generacion de chunks de acciones: produce secuencias de acciones (action chunks) que permiten un control suave y coherente del robot.
- Fine-tuning eficiente: al partir de un modelo base preentrenado, se puede adaptar a nuevas tareas con relativamente pocos datos (100 episodios en este caso).
- Despliegue en hardware de consumo: disenado para ejecutarse en GPUs de gama media, a diferencia de VLA mas grandes.

## Casos de uso

- Manipulacion robotica en laboratorio: el modelo puede controlar un brazo robotico SO-101 para tareas de pick-and-place, como extraer objetos de contenedores y colocarlos en posiciones objetivo, util en entornos de investigacion en robotica.
- Automatizacion de procesos repetitivos: en entornos industriales o de pruebas, el modelo puede ejecutar tareas de manipulacion repetitivas con alta precision, reduciendo la necesidad de programacion explicita.
- Prototipado rapido de politicas robotica: investigadores pueden usar este fine-tuning como punto de partida para nuevas tareas, aprovechando el entrenamiento por imitacion de LeRobot para adaptar el modelo con nuevos datasets.
- Educacion y formacion en robotica: el modelo sirve como ejemplo practico de entrenamiento de VLA con LeRobot, permitiendo a estudiantes e investigadores experimentar con politicas de aprendizaje por imitacion.
- Evaluacion de VLA en hardware asequible: al ser un modelo pequeno, permite evaluar las capacidades de los VLA en GPUs de consumo (como RTX 3060 o 4090) sin necesidad de infraestructura de alto coste.
- Investigacion en generalizacion de tareas: el modelo puede usarse para estudiar como los VLA generalizan a variaciones de la tarea (cambios de posicion del cubo, iluminacion, etc.) gracias a su naturaleza multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion para esta politica: "No evaluation results have been provided for this policy yet". El paper de SmolVLA (arXiv:2506.01844) reporta resultados comparativos, pero no se dispone de ellos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente, pero con 450M parametros en FP32 ocuparia ~1.8 GB; en FP16 ~0.9 GB. Se estima que cabe en GPUs con 4-6 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con al menos 6 GB de VRAM (RTX 3060, RTX 4060, RTX 4090, A100, etc.). El modelo esta disenado para consumer-grade hardware.
- Compatibilidad con consumer GPUs: si, es uno de los objetivos principales de SmolVLA.
- Opciones de despliegue: LeRobot (framework principal), con soporte para inferencia en tiempo real mediante `lerobot-rollout`. Tambien puede usarse con otros frameworks compatibles con safetensors.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolVLA (este fine-tuning) | 450M | no disponible | Apache 2.0 | HuggingFace |
| lerobot/smolvla_base | 450M | no disponible | Apache 2.0 | HuggingFace |
| OpenVLA | 7B | no disponible | MIT | HuggingFace |
| RT-2 (Google) | 55B | no disponible | Propietaria | No publico |

SmolVLA se distingue de alternativas como OpenVLA por su tamano reducido (450M vs 7B parametros), lo que permite su ejecucion en hardware de consumo. El modelo base `lerobot/smolvla_base` es el punto de partida para este fine-tuning, y la comparativa directa con otros fine-tunings de SmolVLA para tareas similares (como los de CoRL2026-CSI) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Sin resultados de evaluacion: la model card no incluye metricas de exito en el mundo real, por lo que el rendimiento real en el robot no esta verificado.
- Tarea especifica: el modelo esta entrenado para una tarea concreta (extraer cubo de bolsillo y colocarlo en marcador) y puede no generalizar bien a otras tareas sin fine-tuning adicional.
- Dependencia del hardware: requiere el robot SO-101 Follower y las camaras especificas (superior y muneca izquierda) con las que fue entrenado; cambios en la configuracion pueden degradar el rendimiento.
- Dataset limitado: 100 episodios es un dataset relativamente pequeno, lo que puede limitar la robustez frente a variaciones del entorno (iluminacion, posiciones, distracciones).
- Idioma: las instrucciones estan en ingles; no se ha verificado el rendimiento con instrucciones en otros idiomas.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base y el dataset pueden tener restricciones adicionales que deben verificarse.
- Riesgo de alucinacion: como todo VLA, puede generar acciones incorrectas si la instruccion es ambigua o el entorno difiere del de entrenamiento.

## Enlaces

- Repositorio del modelo: https://huggingface.co/HyeonseokE/smolvla_extract_cube_cap_2000_10fps
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/extract_cube_cap_10fps
- Paper de SmolVLA: https://arxiv.org/abs/2506.01844
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Fork con acciones delta: https://github.com/HyeonseokE/kaia_lerobot
- Modelo similar de CoRL2026-CSI: https://huggingface.co/CoRL2026-CSI/smolvla_IsaacLab-SO101_extract_cube_baseCaP_100epi_50ep-appendix
