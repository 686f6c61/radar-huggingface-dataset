# sam-guided-vlas/train_1_2_hard_items__mask__blur__sim__all_cameras__live__pi05__seed_0__steps_3k

## Resumen

Este repositorio contiene un ajuste fino (fine-tune) del modelo π₀.₅ (Pi05), un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence y orientado a la generalizacion en entornos abiertos. La implementacion utilizada procede del repositorio OpenPI y se ha adaptado al ecosistema LeRobot de Hugging Face. El modelo parte de `lerobot/pi05_base` y ha sido entrenado por el usuario `sam-guided-vlas`, dando como resultado una politica robotica de aproximadamente 4,14 mil millones de parametros almacenada en formato safetensors.

El ajuste se ha realizado sobre el dataset `sam-guided-vlas/train_1_2_hard_items__mask__blur__sim__all_cameras__live`, compuesto por 199 episodios y 31.073 fotogramas a 20 FPS. El nombre del checkpoint indica varias condiciones experimentales: objetos considerados "hard items", uso de mascaras y desenfoque (mask, blur), datos de simulacion (sim), empleo de todas las camaras disponibles y una variante "live". El entrenamiento corresponde al paso 3000 (steps_3k) con semilla 0.

La relevancia de esta ficha es doble. Por un lado, ilustra el flujo de trabajo de ajuste de modelos VLA con LeRobot sobre un robot Panda. Por otro, conviene senalar que se trata de un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, sin resultados de benchmarks publicados y con informacion tecnica limitada en la model card, por lo que debe evaluarse con cautela antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en pi05 (π₀.₅); detalle de capas no disponible |
| Parametros totales | 4.143.404.816 (~4,14 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las descripciones de tarea del dataset estan en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/pi05_base |
| Tarea (pipeline) | robotics |
| Libreria | lerobot |
| Robot objetivo | Panda |
| Camaras | agentview, robot0_eye_in_hand, robot0_eye_in_hand_2 |
| Entradas | observation.state (9,); observation.images.agentview (3,224,224); observation.images.robot0_eye_in_hand (3,224,224); observation.images.robot0_eye_in_hand_2 (3,224,224) |
| Salidas | action (7,) |
| Dataset de entrenamiento | sam-guided-vlas/train_1_2_hard_items__mask__blur__sim__all_cameras__live |
| Episodios / fotogramas | 199 / 31.073 a 20 FPS |
| Paso de entrenamiento | 3.000 (steps_3k, seed 0) |
| Tamano del repositorio | 9,4 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-11 |

## Arquitectura y entrenamiento

La model card identifica el modelo como π₀.₅ (Pi05), un modelo Vision-Language-Action de Physical Intelligence disenado para generalizar a entornos y situaciones no vistos durante el entrenamiento, y descrito como una evolucion de π₀. La implementacion empleada es la de LeRobot, adaptada del repositorio open source OpenPI. No se detallan en la informacion proporcionada el numero de capas, el mecanismo de atencion, el esquema de decodificacion de acciones ni el numero total de tokens de preentrenamiento, por lo que esos apartados quedan como no disponibles.

El proceso de ajuste parte de `lerobot/pi05_base` y se ejecuta sobre un dataset de robotica con 199 episodios y 31.073 fotogramas capturados a 20 FPS. Las tareas anotadas describen la manipulacion de formas tridimensionales complejas (bolas, copas, anillos, objetos con lobulos, costillas o perforaciones), lo que sugiere un escenario de agarre y manipulacion de objetos dificiles. El nombre del checkpoint indica variantes de aumento o condicionamiento de datos: mascaras, desenfoque, uso de simulacion, todas las camaras y modo "live". No se especifica si hubo RLHF, DPO o alguna fase de ajuste por preferencias.

## Capacidades

- Generacion de acciones motoras: produce un vector de accion de 7 dimensiones por paso, adecuado para el control de un robot Panda.
- Percepcion multimodal: consume estado propioceptivo de 9 dimensiones y tres flujos de imagen RGB de 224x224 (una vista general y dos camaras en la muneca).
- Manipulacion de objetos complejos: el dataset de ajuste se centra en formas tridimensionales dificiles (objetos lobulados, perforados, con costillas o collarines), lo que sugiere capacidad de agarre de geometrias irregulares.
- Generalizacion declarada: segun la model card, π₀.₅ esta disenado para generalizar a entornos no vistos, aunque no se aportan metricas que lo confirmen para este checkpoint concreto.
- Robustez frente a condiciones degradadas: el nombre del experimento incluye mascaras y desenfoque, lo que indica entrenamiento con perturbaciones visuales.
- Soporte de tool calling: no disponible (no es una capacidad propia de un modelo VLA de control).
- Soporte de agentes y razonamiento multi-paso en lenguaje: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision adicional, audio, etc.): no disponible.

## Casos de uso

- Manipulacion robotica de objetos irregulares: la politica puede ejecutar agarres de piezas con geometrias complejas (lobulos, perforaciones, costillas) usando las tres camaras y el estado del robot como entrada, tal y como se define en las tareas del dataset.
- Control con camara en la muneca: al soportar dos vistas eye-in-hand ademas de la vista general, es adecuado para tareas de precision en las que la perspectiva cercana al efector final es determinante.
- Investigacion en generalizacion VLA: sirve como punto de partida para estudiar como se comporta π₀.₅ ante objetos y configuraciones no presentes en el conjunto de ajuste de 199 episodios.
- Base para nuevos ajustes con LeRobot: al estar empaquetado en formato LeRobot y safetensors, puede reutilizarse como inicializacion para otros datasets roboticos mediante el mismo pipeline de entrenamiento.
- Evaluacion de robustez visual: el entrenamiento con mascaras y desenfoque permite analizar la degradacion del rendimiento cuando la percepcion se ve alterada, un escenario habitual en entornos industriales reales.
- Transferencia simulacion a realidad: al incluir datos de simulacion, resulta util para estudiar la brecha sim-to-real antes de desplegar politicas en hardware fisico.
- Experimentos academicos reproducibles: el checkpoint fija semilla 0 y 3.000 pasos, lo que facilita repetir condiciones y comparar variantes del mismo autor.
- Prototipado en laboratorio con robot Panda: permite validar rapidamente politicas de agarre en un montaje estandar sin necesidad de reentrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exito en tareas, tasas de agarre, comparaciones con π₀ o con otros modelos VLA, ni curvas de entrenamiento. Tampoco se han recuperado datos de rendimiento en la busqueda web realizada. Cualquier cifra de rendimiento tendria que obtenerse mediante evaluacion directa sobre el robot o el simulador correspondiente.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del numero de parametros, ya que no se publican cuantizaciones): aproximadamente 8,3 GB en bf16/fp16, 16,6 GB en fp32, 4,1 GB en int8 y 2,1 GB en int4. Estas cifras no incluyen memoria para activaciones, buffers de imagen ni estado del entorno.
- GPU de centro de datos: A100 (40 o 80 GB), H100, L40S o equivalentes, con margen amplio para bf16 y para procesar lotes mayores.
- GPU de consumo: cabe en bf16 en una RTX 4090 (24 GB), RTX 3090 (24 GB) y, con mas ajuste, en tarjetas de 16 GB como la RTX 4080 o 4070 Ti Super. En tarjetas de 8 GB seria necesario recurrir a cuantizacion, no confirmada por el autor.
- Opciones de despliegue: al ser una politica robotica empaquetada con LeRobot, el despliegue natural es la libreria LeRobot y el stack OpenPI. vLLM, llama.cpp, Ollama o TGI no son aplicables directamente a este tipo de modelo de control.
- Latencia y throughput: no disponibles. Al tratarse de control robotico a 20 FPS en la captura de datos, la frecuencia de inferencia objetivo seria del orden de decenas de hercios, pero no se aporta ninguna medicion real.
- Formato del repositorio: safetensors mas ficheros de configuracion de LeRobot, con un total de 9,4 GB, lo que implica espacio en disco para pesos y posiblemente estados de entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| Este modelo (pi05 fine-tune, sam-guided-vlas) | 4.143.404.816 | no disponible | apache-2.0 | Hugging Face, 0 descargas, 0 likes | no disponible |
| lerobot/pi05_base | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | Hugging Face | no disponible |
| π₀.₅ original (Physical Intelligence) | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | Blog y repositorio OpenPI | no disponible |
| π₀ (predecesor citado en la model card) | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible |

No se dispone de datos comparativos verificables en la informacion proporcionada. Para una comparacion rigurosa habria que consultar las model cards de `lerobot/pi05_base` y la documentacion oficial de π₀.₅, asi como otros modelos VLA de la misma categoria (por ejemplo, variantes de OpenVLA o RDT), que no aparecen en los resultados de busqueda recuperados.

## Limitaciones y advertencias

- Artefacto de investigacion sin validacion externa: cero descargas y cero likes en el momento de la consulta, sin evaluaciones independientes conocidas.
- Ausencia de benchmarks: no hay metricas de exito, robustez o generalizacion publicadas para este checkpoint.
- Ajuste altamente especifico: el modelo esta entrenado para un robot Panda concreto, tres camaras concretas y un conjunto reducido de 199 episodios, por lo que su uso fuera de esa configuracion es arriesgado.
- Riesgo de sobreajuste al conjunto de datos: 31.073 fotogramas orientados a objetos "dificiles" pueden no representar la variedad de un entorno real de produccion.
- Riesgo de alucinacion en el sentido tradicional: no aplica como en un modelo de lenguaje, pero si existe riesgo de acciones fisicas incorrectas o inseguras cuando la percepcion se degrada o aparece un objeto fuera de distribucion.
- Brecha simulacion-realidad: parte del entrenamiento usa datos de simulacion, lo que puede provocar una caida de rendimiento al transferir al robot fisico.
- Limitaciones de idioma: no hay informacion sobre capacidades linguisticas; las unicas descripciones de tarea disponibles estan en ingles y son muy especificas.
- Contexto: no se documenta la longitud de contexto ni la ventana temporal de observaciones que maneja la politica.
- Cuantizaciones no publicadas: no se confirma la existencia de versiones GGUF, int8 o int4, por lo que las estimaciones de VRAM son calculos teoricos.
- Licencia: el modelo se distribuye bajo apache-2.0, lo que en principio permite uso comercial, pero conviene revisar los terminos del modelo base `lerobot/pi05_base` y del π₀.₅ original, ya que la informacion proporcionada no detalla esas condiciones.
- Fecha de creacion registrada como 2026-09-11, posterior a la fecha habitual de consulta; conviene verificar la vigencia y procedencia del repositorio.
- Seguridad fisica: cualquier despliegue sobre hardware real debe acompanarse de limites de par, paradas de emergencia y validacion en banco de pruebas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sam-guided-vlas/train_1_2_hard_items__mask__blur__sim__all_cameras__live__pi05__seed_0__steps_3k
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2_hard_items__mask__blur__sim__all_cameras__live
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog oficial de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio OpenPI (citado en la model card como origen de la implementacion; URL no proporcionada en la informacion disponible)
- Nota sobre la busqueda web: los resultados recuperados corresponden a una serie de television francesa y a un fabricante de utillaje, sin relacion con el modelo, por lo que no se han incorporado como fuentes.
