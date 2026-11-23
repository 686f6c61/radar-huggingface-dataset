# SamerAyyad/VLA_Samer_15.11.2026_300eps_Last_policy_Pi05

## Resumen

Este repositorio contiene una política Vision-Language-Action (VLA) denominada pi05, afinada por el usuario SamerAyyad sobre el modelo base lerobot/pi05_base. pi05 es un modelo de Physical Intelligence disenado para generalizacion en entornos abiertos, y esta version concreta se ha especializado mediante aprendizaje por imitacion en una unica tarea robotica: recoger una CPU con una ventosa y depositarla en una caja. El modelo se distribuye a traves de la libreria LeRobot de Hugging Face y esta pensado para ejecutarse sobre un robot UR5 con una camara.

La relevancia de esta ficha es doble. Por un lado, ilustra el flujo tipico de LeRobot para adaptar un VLA preentrenado a una tarea fisica concreta con solo 300 episodios de demostracion. Por otro, permite evaluar el coste y las limitaciones de un afinamiento de este tipo: 4.143 millones de parametros, pesos en safetensors, licencia Apache 2.0 y un repositorio de 9,4 GB.

Se trata de una politica altamente especializada, no de un modelo de proposito general. Su utilidad fuera del entorno y la tarea de entrenamiento es limitada, y no se han publicado resultados de evaluacion en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) pi05, implementacion LeRobot adaptada de OpenPI |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot (version 0.6.2 en el entrenamiento) |
| Modelo base | lerobot/pi05_base |
| Tipo de robot | ur5 |
| Camaras | 1 camara (`camera`) |
| Entrada visual | `observation.images.camera`, tensor `(3, 480, 640)` |
| Entrada de estado | `observation.state`, vector `(7,)` |
| Salida de accion | `action`, vector `(7,)` |
| Tamano del repositorio | 9,4 GB |
| Pipeline | robotics |

## Arquitectura y entrenamiento

pi05 es un modelo Vision-Language-Action de Physical Intelligence que evoluciona pi0 para generalizar a entornos y situaciones no vistos durante el entrenamiento. La implementacion incluida en este repositorio procede del codigo abierto de OpenPI y se ha integrado en LeRobot. El modelo consume una imagen RGB de 480x640 y un vector de estado de 7 dimensiones, y produce un vector de accion tambien de 7 dimensiones, lo que encaja con la cinematica de un brazo UR5 con herramienta de succion.

El afinamiento se realizo por aprendizaje por imitacion sobre el dataset SamerAyyad/VLA_Samer_15.11.2026_300eps_Last, compuesto por 300 episodios, 191.275 fotogramas a 30 FPS y una unica tarea: "Pick up the CPU with the suction gripper and place it in the box". La configuracion de entrenamiento fue de 20.000 pasos, batch de 32, optimizador AdamW, tasa de aprendizaje 2,5e-05 y semilla 1000, con LeRobot 0.6.2. No se especifica en la informacion disponible si hubo etapas de RLHF, DPO ni innovaciones tecnicas adicionales mas alla de las propias del modelo base pi05.

## Capacidades

- Generacion de acciones motoras de 7 dimensiones a partir de observaciones visuales y de estado, orientada al control de un brazo UR5.
- Percepcion visual mediante una unica camara RGB a 480x640 y 30 FPS.
- Ejecucion de una tarea de manipulacion concreta: recoger una CPU con ventosa y colocarla en una caja.
- Aprendizaje por imitacion a partir de demostraciones humanas (300 episodios).
- Integracion con el ecosistema LeRobot para entrenamiento, evaluacion y despliegue (`lerobot-train`, `lerobot-rollout`).
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, multilingue, thinking mode, vision general, audio ni otras funciones de proposito general en la informacion disponible.

## Casos de uso

- Automatizacion de una celda de ensamblaje UR5: la politica ejecuta de forma autonoma el ciclo de recogida y deposito de CPUs con ventosa, adecuada para tareas repetitivas en linea de produccion.
- Prototipado rapido de tareas de pick-and-place: sirve como punto de partida para validar la viabilidad de una tarea antes de invertir en un sistema industrial, gracias al bajo coste de afinamiento desde pi05_base.
- Investigacion en aprendizaje por imitacion: util como referencia reproducible de un pipeline LeRobot completo (dataset, entrenamiento, rollout) para comparar hiperparametros o tecnicas de aumento de datos.
- Formacion de operarios y pruebas de celda: permite simular o demostrar el flujo de recogida de componentes electronicos antes de desplegar la automatizacion definitiva.
- Benchmark interno de VLA en robotica de laboratorio: el modelo sirve como linea base para medir la mejora de nuevas politicas sobre el mismo dataset y robot.
- Generacion de datos sinteticos o aumentados: las trayectorias producidas pueden emplearse para analizar el comportamiento del brazo y refinar el propio dataset de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 4.143 millones de parametros, en precision completa (fp32) serian necesarios aproximadamente 16,6 GB solo para los pesos; en bf16, unos 8,3 GB; en cuantizacion de 8 bits, unos 4,1 GB. Estas cifras son estimaciones tecnicas y no estan confirmadas por el autor.
- GPU recomendadas: no especificadas en la informacion disponible. Por tamano, una GPU con 16 GB o mas (RTX 4090, A100, H100) es un punto de partida razonable.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) en bf16; en tarjetas de 8-12 GB requeriria cuantizacion, cuya disponibilidad no esta documentada.
- Opciones de despliegue: LeRobot (`lerobot-rollout`, `lerobot-train`) es el metodo documentado. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles. El control se realiza a 30 FPS segun la frecuencia del dataset, pero no se confirma que la politica opere en tiempo real a esa tasa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SamerAyyad/VLA_Samer_15.11.2026_300eps_Last_policy_Pi05 | 4.143 M | no disponible | Pick-and-place UR5 especializado | Apache 2.0 | Hugging Face |
| lerobot/pi05_base | no disponible | no disponible | VLA generalista base | no disponible | Hugging Face |
| pi0 (Physical Intelligence) | no disponible | no disponible | VLA generalista predecesor | no disponible | OpenPI |
| Otras politicas LeRobot afinadas | variable | no disponible | Tareas especificas | variable | Hugging Face |

La comparacion cuantitativa con alternativas no esta disponible en la informacion proporcionada. La diferencia principal frente a pi05_base es el afinamiento especifico para la tarea y el robot UR5, a costa de perder generalidad.

## Limitaciones y advertencias

- Politica altamente especializada: solo se ha entrenado para una tarea y un robot concretos (UR5 con ventosa), por lo que su comportamiento fuera de ese contexto no esta garantizado.
- Sin resultados de evaluacion publicados: no hay tasas de exito ni pruebas de robustez, lo que impide valorar su fiabilidad en produccion.
- Dependencia de la configuracion de camara: los nombres e indices de camara deben coincidir exactamente con las claves de observacion del entrenamiento (`observation.images.camera`).
- Riesgo de sobreajuste al entorno de grabacion: cambios de iluminacion, posicion de objetos o distracciones pueden degradar el rendimiento, ya que no se documentan pruebas de generalizacion.
- Sesgos: no documentados. Al ser un modelo fisico, los sesgos relevantes serian los del dataset de demostracion, no descritos.
- Riesgo de alucinacion: en el sentido de acciones incorrectas o inseguras no documentadas; no se han publicado analisis de fallos.
- Idiomas: no aplica ni se documenta; el modelo no procesa lenguaje natural como interfaz principal.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Sin cuantizaciones publicadas: el despliegue en hardware limitado requeriria conversion propia no documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SamerAyyad/VLA_Samer_15.11.2026_300eps_Last_policy_Pi05
- Dataset de entrenamiento: https://huggingface.co/datasets/SamerAyyad/VLA_Samer_15.11.2026_300eps_Last
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SamerAyyad/VLA_Samer_15.11.2026_300eps_Last
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de pi05 (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia LeRobot pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion LeRobot: https://huggingface.co/docs/lerobot/index
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
