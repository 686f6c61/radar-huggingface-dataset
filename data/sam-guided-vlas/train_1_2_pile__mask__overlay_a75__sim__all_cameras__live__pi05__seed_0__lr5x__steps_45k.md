# sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0__lr5x__steps_45k

## Resumen

Este repositorio contiene una politica robotica de tipo Vision-Language-Action (VLA) obtenida por ajuste fino supervisado de `lerobot/pi05_base`, es decir, de la implementacion en LeRobot del modelo pi05 (π0.5) publicado por Physical Intelligence. El resultado es un checkpoint de 4.143.404.816 parametros (~4,14 mil millones) almacenado en safetensors, con licencia apache-2.0 y pipeline `robotics`, pensado para control de manipulacion sobre un robot Franka Panda en simulacion.

La politica consume estado proprioceptivo de 9 dimensiones y tres vistas de camara de 224x224 (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`), y produce acciones de 7 dimensiones (brazo mas pinza). Se entreno durante 45.000 pasos con batch de 16, optimizador AdamW y tasa de aprendizaje 0,00025 sobre un dataset de 200 episodios y 69.392 fotogramas grabados a 20 FPS, con 20 tareas de recogida y colocacion de objetos de supermercado y cocina (latas, frutas, verduras, cajas de comida, utensilios).

Su relevancia es metodologica: forma parte de una familia de experimentos del usuario `sam-guided-vlas` orientados a estudiar el efecto de representaciones guiadas por segmentacion (el identificador del repositorio sugiere enmascarado tipo SAM con superposicion al 75 %, datos de simulacion y uso de todas las camaras, aunque esto es una interpretacion del nombre y no una afirmacion de la model card). No incluye resultados de evaluacion publicados, y no debe confundirse con un modelo de lenguaje: es una politica de imitacion con condicionamiento por instruccion de tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) derivada de pi05 (π0.5) de Physical Intelligence, implementada en LeRobot; el detalle interno de capas no se especifica en la model card |
| Parametros totales | 4.143.404.816 (~4,14 mil millones), recuento real de safetensors |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se documentan variantes GGUF, AWQ, GPTQ ni int8) |
| Idiomas soportados | no disponible; las instrucciones de tarea del dataset estan en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`; tamano de repositorio 9,4 GB) |
| Modelo base | `lerobot/pi05_base` (ajuste fino) |
| Tipo de robot | Panda |
| Entradas | `observation.state` (9,); `observation.images.agentview` (3, 224, 224); `observation.images.robot0_eye_in_hand` (3, 224, 224); `observation.images.robot0_eye_in_hand_2` (3, 224, 224) |
| Salidas | `action` (7,) |
| Dataset de entrenamiento | 200 episodios, 69.392 fotogramas, 20 FPS, 20 tareas |
| Pasos de entrenamiento | 45.000 |
| Tamano de lote | 16 |
| Optimizador | AdamW |
| Tasa de aprendizaje | 0,00025 |
| Semilla | 0 |
| Version de LeRobot | 0.6.0 |
| Fecha de creacion en el Hub | 2026-09-11 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card describe el modelo como un VLA de proposito general en mundo abierto: pi05 evoluciona pi0 para generalizar a entornos y situaciones no vistos durante el entrenamiento. La implementacion utilizada aqui es la adaptacion de LeRobot, derivada del repositorio abierto OpenPI de Physical Intelligence. Este checkpoint concreto no es el modelo base, sino un ajuste fino supervisado sobre `lerobot/pi05_base` mediante el flujo `lerobot-train`, con la cabeza de acciones adaptada al espacio de 7 dimensiones del Panda y a las tres camaras especificadas. La model card no aporta informacion sobre numero de capas, tipo de atencion, tokenizador visual ni el desglose entre codificador de vision, modelo de lenguaje y experto de acciones, por lo que esos datos quedan como no disponibles.

En cuanto al entrenamiento, se realizaron 45.000 pasos con lote de 16, AdamW y tasa de aprendizaje 0,00025 bajo la semilla 0, usando LeRobot 0.6.0. El dataset es de imitacion pura (behavior cloning sobre demostraciones) con 200 episodios y 69.392 fotogramas a 20 FPS; las tareas cubren 20 categorias de objeto: "basket", "boxed food", "cake", "can", "hamburger", "lemon", "orange", "spice", "squash", "spray", "soap dispenser", "jam", "jar", "cereal", "knife block", "kettle", "pear", "potato", "sweet potato" y "scone". No se documenta en la informacion disponible ninguna fase de RLHF, DPO, aprendizaje por refuerzo ni decodificacion especulativa; tampoco se detalla la composicion exacta de las demostraciones ni si hubo aumentos de datos adicionales mas alla del enmascarado que sugiere el nombre del dataset.

## Capacidades

- Manipulacion robotica por imitacion: genera acciones continuas de 7 dimensiones (grados de libertad del brazo mas pinza) condicionadas por imagen y estado.
- Percepcion multi-camara: integra tres vistas simultaneas (una vista global `agentview` y dos vistas de muneca `eye_in_hand`), lo que permite razonar sobre oclusiones parciales y sobre la posicion relativa de la pinza.
- Condicionamiento por instruccion de tarea: acepta una cadena de tarea (`--task="..."`) seleccionada entre las 20 del dataset de entrenamiento.
- Control en bucle cerrado a la frecuencia del dataset (20 FPS), con el estado proprioceptivo de 9 dimensiones realimentado en cada paso.
- Recogida y colocacion de objetos apilados o agrupados ("pile") de formas, tamanos y materiales variados (frutas, verduras, latas, botellas, cajas).
- Interoperabilidad con el ecosistema LeRobot: ejecucion mediante `lerobot-rollout` y reentrenamiento mediante `lerobot-train`.
- No implementa generacion de texto, razonamiento simbolico, matematicas ni codigo: es una politica de control, no un modelo conversacional.
- No hay soporte documentado de tool calling ni function calling.
- No hay soporte documentado de agentes ni de razonamiento multi-paso explicito.
- No hay capacidades multilingues documentadas; las instrucciones son cadenas en ingles correspondientes a tareas concretas.
- No se documenta modo de razonamiento (thinking mode), entrada de audio ni generacion de video.

## Casos de uso

- Evaluacion de imitacion en simulacion: ejecutar la politica con `lerobot-rollout` sobre las 20 tareas del dataset para medir tasas de exito por tarea; es el uso inmediato del checkpoint, aunque el autor no ha publicado resultados.
- Base para ajuste fino en almacen o laboratorio: al derivar de `lerobot/pi05_base` y venir con el pipeline de entrenamiento documentado, sirve como punto de partida para reentrenar con datos propios de un Panda real o de otro simulador.
- Estudio de representaciones guiadas por segmentacion: el nombre del dataset (enmascarado, superposicion al 75 %) apunta a un experimento controlado sobre el efecto del enmascarado visual en el aprendizaje de politicas; este checkpoint seria la condicion experimental correspondiente.
- Ablacion de camaras: comparar esta variante "all_cameras" frente a entrenamientos con subconjuntos de vistas para cuantificar la aportacion de las vistas de muneca en tareas de pinza.
- Estudio de escalado de datos: con 200 episodios y 69.392 fotogramas como punto de referencia, sirve para medir como cambia el rendimiento al aumentar el numero de episodios o reducir el numero de tareas.
- Automatizacion de picking de genero alimentario: recogida de latas, frutas, verduras y envases de formas irregulares en entornos simulados de logistica antes de trasladar la receta a hardware real.
- Linea base para comparaciones de hiperparametros: la nomenclatura del repositorio (lr5x, seed 0, 45k pasos) lo situa como una condicion concreta dentro de una rejilla de experimentos; util para comparar tasa de aprendizaje y semilla frente a otras variantes de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explicitamente la frase "No evaluation results have been provided for this policy yet", de modo que no existe tasa de exito por tarea, numero de ensayos ni comparacion cuantitativa con otras politicas.

## Requisitos de hardware

- VRAM para inferencia (estimacion a partir del recuento real de parametros, no cifra publicada por el autor): en bfloat16 o float16 los pesos ocupan unos 8,3 GB, mas activaciones de tres imagenes de 224x224 y el estado, lo que situa el total en aproximadamente 10-12 GB.
- En float32 los pesos ocuparian unos 16,6 GB, con un total aproximado de 18-20 GB.
- Si se aplicase cuantizacion a int8 (no documentada por el autor) los pesos bajarian a unos 4,1 GB, con un total estimado de 6-8 GB.
- GPU recomendadas para bfloat16 con lote 1: RTX 4090 (24 GB), RTX 3090 (24 GB), L4 (24 GB), A100 40 GB u 80 GB, H100. Con 16 GB (RTX 4080, RTX 4070 Ti Super) es probable que quepa, pero es un limite ajustado y no confirmado por el autor.
- Si cabe en GPU de consumo: si, previsiblemente en RTX 4090, RTX 4080 y RTX 3090 para inferencia en precision reducida; no hay confirmacion oficial.
- Opciones de despliegue: LeRobot con `lerobot-rollout` sobre PyTorch/CUDA y pesos safetensors. vLLM, TGI, llama.cpp y Ollama no son aplicables porque no es un modelo de lenguaje de texto.
- Latencia y throughput: no disponibles. Como referencia de requisito temporal, los datos se grabaron a 20 FPS, por lo que un control fluido exige que la politica genere acciones a una frecuencia de al menos 20 Hz, algo que depende del hardware y del uso de troceado de acciones.
- Restriccion de integracion: los nombres de camara de la configuracion de ejecucion deben coincidir exactamente con las claves de observacion del entrenamiento (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (pi05 fine-tune, `sam-guided-vlas`) | 4.143.404.816 | no disponible | sin resultados de evaluacion | apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| `lerobot/pi05_base` (modelo base) | no disponible en la informacion proporcionada | no disponible | no disponible | apache-2.0 (segun la model card del ajuste) | HuggingFace |
| Otros VLA comparables (pi0 original, OpenVLA, GR00T N1, entre otros) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas de la misma categoria; la unica referencia directa y confirmada es el modelo base del que deriva.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay tasas de exito, numero de ensayos ni condiciones de prueba, por lo que no es posible afirmar que la politica funcione en las tareas para las que fue entrenada.
- Dominio muy restringido: 200 episodios y 69.392 fotogramas sobre 20 tareas concretas de objetos de supermercado y cocina, con un unico tipo de robot (Panda).
- Brecha simulacion-realidad no cuantificada: el identificador del repositorio apunta a datos de simulacion ("sim"); el comportamiento en un robot fisico es desconocido y podria degradarse por iluminacion, calibracion, latencia o dinamica no modelada.
- Riesgo de sobreajuste: 45.000 pasos con lote 16 sobre un dataset pequeno y con semilla unica; no se publican curvas de validacion ni comparaciones entre semillas.
- Fuerte acoplamiento sensorial: exige exactamente las tres camaras y el vector de estado de 9 dimensiones del entrenamiento; cambiar la configuracion de sensores invalida la politica.
- Espacio de accion fijo de 7 dimensiones: no es portable directamente a robots con otra cinematica o numero de grados de libertad.
- Condicionamiento linguistico limitado: las tareas son cadenas en ingles de una lista cerrada de 20 elementos; no hay evidencia de generalizacion a instrucciones nuevas ni de soporte de otros idiomas.
- Modos de fallo tipicos de una politica de imitacion (no "alucinacion" en sentido linguistico): agarres fallidos, colisiones, bloqueos ante objetos no vistos, confusion entre objetos visualmente similares y deriva acumulada en episodios largos.
- Licencia: apache-2.0 permite uso comercial, pero conviene verificar los terminos del modelo base, del dataset y de cualquier componente de terceros heredado de la cadena pi05/OpenPI antes de desplegarlo en produccion.
- Validacion social inexistente: cero descargas y cero likes en el momento de redactar esta ficha, sin issues ni discusiones que permitan contrastar su comportamiento.
- La model card es la plantilla generica de LeRobot y conserva comentarios y marcadores de posicion sin completar, incluida una cita bibliografica truncada; debe tratarse como documentacion incompleta.
- Metadatos a revisar: las fechas de creacion y actualizacion son de septiembre de 2026, posteriores a la redaccion habitual de fichas, lo que conviene comprobar antes de citar el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0__lr5x__steps_45k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live
- Blog de pi05 en Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Busqueda web: no se han encontrado resultados relevantes sobre este modelo; los resultados devueltos corresponden a contenidos ajenos (herramientas de bricolaje y una serie de television).
