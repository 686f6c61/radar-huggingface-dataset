# HyeonseokE/smolvla_rq2_turn_off_lever_ours_1000_10fps

## Resumen

Este repositorio contiene una política de robótica (vision-language-action, VLA) denominada `smolvla_rq2_turn_off_lever_ours_1000_10fps`, publicada por el usuario HyeonseokE. No es un modelo de lenguaje general: es un fine-tune de la política SmolVLA sobre el modelo base `lerobot/smolvla_base`, entrenado con la librería LeRobot para ejecutar una única tarea de manipulación sobre un robot real de tipo `so101_follower`: "Turn the lever off; the status indicator should turn red." El modelo consume el estado articular del robot (vector de 6 dimensiones) y hasta tres flujos de imagen de 3x256x256, y produce un vector de acción de 6 dimensiones.

SmolVLA, descrito en el artículo arXiv:2506.01844, se presenta como un modelo VLA compacto que busca rendimiento competitivo con coste computacional reducido y desplegable en hardware de consumo. Este checkpoint concreto tiene 450.046.176 parámetros (~450 M), un tamaño de repositorio de 0,9 GB y se distribuye bajo licencia Apache 2.0. Por su naturaleza, hereda las capacidades del modelo base y las especializa en una sola tarea, por lo que su interés es principalmente de investigación en imitación robótica y reproducibilidad de experimentos, no de uso general.

La relevancia de esta ficha es acotada y conviene ser explícito: el modelo acumula 0 descargas y 0 "likes", la model card declara que no se han proporcionado resultados de evaluación y el nombre del repositorio sugiere que forma parte de un barrido experimental (semilla 1000, variante "ours", 100 episodios). Es, por tanto, un artefacto de investigación trazable y reproducible, útil como baseline dentro de LeRobot, pero sin validación pública de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en el modelo base SmolVLA; detalles internos de capas no disponibles en la informacion proporcionada |
| Parametros totales | 450.046.176 (~450 M), dato real de los pesos safetensors |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo de contexto textual; procesa observaciones por paso) |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos en safetensors; no se documentan variantes GGUF, int8 o int4) |
| Idiomas soportados | No disponible (el modelo no genera texto; recibe una instruccion de tarea en ingles en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `lerobot`), repositorio de 0,9 GB |
| Tipo de modelo | Politica de robot (pipeline `robotics`), no modelo generativo de texto |
| Modelo base | lerobot/smolvla_base |
| Entradas | `observation.state` (6,); `observation.images.camera1/2/3` (3, 256, 256) |
| Salidas | `action` (6,); `action.radian_urdf0` (6,) |
| Robot objetivo | `so101_follower` |
| Camaras declaradas | `top`, `left_wrist` (la tabla de entradas lista tres flujos de imagen; discrepancia no resuelta en la informacion) |
| Frecuencia de datos | 10 FPS (dataset de entrenamiento) |
| Version de LeRobot | 0.6.0 |
| Dataset de entrenamiento | HyeonseokE/rq2_turn_off_lever_ours_100_10fps: 100 episodios, 21.774 frames |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-15 |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `lerobot/smolvla_base`, la implementacion de SmolVLA en LeRobot. Segun la descripcion del repositorio y el articulo referenciado (arXiv:2506.01844), SmolVLA es un modelo vision-language-action compacto que combina un codificador visual y linguistico con un modulo de generacion de acciones, y que esta disenado para ejecutarse en hardware de consumo. La model card no detalla el numero de capas, la dimension oculta, el numero de cabezas de atencion ni el mecanismo concreto de generacion de acciones, por lo que esos datos se marcan como no disponibles.

El entrenamiento se realizo con LeRobot 0.6.0 sobre el dataset `HyeonseokE/rq2_turn_off_lever_ours_100_10fps`, compuesto por 100 episodios y 21.774 frames capturados a 10 FPS para una unica tarea: apagar una palanca hasta que el indicador de estado se ponga rojo. La configuracion declarada es de 17.000 pasos de entrenamiento, batch de 64, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000. No se documenta en la informacion proporcionada el uso de RLHF, DPO, destilacion ni ninguna innovacion tecnica adicional; tampoco se indica el numero total de tokens o frames vistos efectivos mas alla del dataset y los pasos indicados.

Un detalle relevante para la reproducibilidad: el identificador del modelo contiene "ours_1000_10fps" mientras que el dataset asociado se llama "ours_100_10fps". El sufijo 1000 coincide con la semilla declarada en la configuracion de entrenamiento y el 100 con el numero de episodios, de modo que la nomenclatura es coherente con un barrido de semillas sobre un dataset de 100 episodios, pero conviene verificarlo antes de reutilizar el checkpoint en una comparacion.

## Capacidades

- Generacion de acciones de robot: produce vectores de accion de 6 dimensiones para el robot `so101_follower` a partir de estado articular y observaciones visuales.
- Ejecucion de una tarea especifica de manipulacion: "Turn the lever off; the status indicator should turn red." (apagar una palanca hasta que el indicador cambie a rojo).
- Percepcion visual multi-camara: procesa hasta tres flujos de imagen de 3x256x256, lo que permite politicas que dependen de la vista cenital y de las muñecas (`top`, `left_wrist`).
- Fusion vision-lenguaje-accion heredada de SmolVLA: condiciona la politica a una instruccion de tarea en lenguaje natural.
- Ejecucion en bucle cerrado: la politica puede desplegarse en tiempo real sobre el robot mediante `lerobot-rollout`, con la estrategia `base` y duracion configurable.
- Reentrenamiento y fine-tuning: al ser un checkpoint LeRobot, puede continuarse el entrenamiento con `lerobot-train` sobre otros datasets.
- No soporta de forma acreditada: tool calling, function calling, razonamiento multi-paso simbolico, generacion de texto, codigo, matematicas, vision generalista, audio ni modo "thinking". La informacion disponible no documenta ninguna de estas capacidades.

## Casos de uso

- Reproduccion de experimentos de imitacion robotica: el repositorio incluye semilla, pasos, batch, optimizador y tasa de aprendizaje, de modo que un grupo de investigacion puede replicar el entrenamiento sobre el mismo dataset (100 episodios, 21.774 frames) y comparar curvas sin ambiguedad.
- Baseline congelado en un barrido de politicas: sirve como referencia fija frente a otras semillas o variantes de SmolVLA dentro de la misma tarea de apagado de palanca, evitando reentrenar la referencia en cada comparacion.
- Validacion de una tarea industrial/academica de accionamiento de palanca: se puede desplegar con `lerobot-rollout` sobre un SO-101 real y medir cuantas veces la politica deja el indicador en rojo antes de agotar el tiempo (`--duration`).
- Fine-tuning sobre hardware identico: al estar entrenado para `so101_follower` con estado de 6 dimensiones y acciones de 6 dimensiones, es un punto de partida razonable para otras tareas sobre el mismo brazo, reduciendo el numero de episodios necesarios.
- Recogida de datos asistida (por ejemplo, esquemas tipo DAgger): ejecutar la politica de forma autonoma, registrar los fallos y corregirlos con teleoperacion para ampliar el dataset de 100 episodios antes de reentrenar.
- Estudio de robustez visual: con tres entradas de imagen de 256x256, el modelo permite experimentar con cambios de iluminacion, posicion del actuador y presencia de distractores, aunque la model card advierte que no hay resultados de evaluacion publicados.
- Docencia y formacion en robótica con LeRobot: es un ejemplo completo y ligero (0,9 GB) del flujo "grabar datos, entrenar politica, desplegar", adecuado para talleres donde no hay acceso a GPUs de gran tamano.
- Pruebas de despliegue en hardware de consumo: con ~450 M de parametros y pesos de 0,9 GB, permite validar toda la cadena de inferencia (camaras, preprocesado, politica, envio de acciones) en un portatil con GPU dedicada antes de escalar a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio incluye explicitamente la linea "_No evaluation results have been provided for this policy yet._", sin tabla de tareas, intentos, exitos ni tasa de exito.

| Benchmark | Resultado |
|---|---|
| Evaluacion en robot real (esta politica) | No disponible; el autor no ha publicado resultados |
| MMLU, HumanEval, GSM8K y similares | No aplica; no es un modelo de lenguaje |
| Resultados del modelo base SmolVLA | No disponibles en la informacion proporcionada (el articulo arXiv:2506.01844 esta referenciado, pero sus cifras no se incluyen en los datos facilitados) |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 0,9 GB en bfloat16/fp16 (el repositorio completo pesa 0,9 GB) y alrededor de 1,8 GB si se cargan en fp32. A eso hay que sumar activaciones del codificador visual con tres imagenes de 256x256 y buffers de LeRobot; una estimacion conservadora de pico durante la inferencia se situa en el rango de 2 a 4 GB, aunque no hay mediciones publicadas para este checkpoint.
- GPU recomendadas: cualquier GPU con 6-8 GB de VRAM o mas es suficiente en teoria; se incluyen RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, L4, A10G, A100 y H100. Las GPU de gama alta no aportan ventaja por memoria, solo por latencia.
- Cabe en GPU de consumo: si. Con ~450 M de parametros, el cuello de botella no es la VRAM sino la latencia de captura de camaras y el bucle de control.
- Opciones de despliegue: la via documentada es LeRobot 0.6.0 (`lerobot-rollout` para ejecucion, `lerobot-train` para entrenamiento, `--policy.device=cuda`). No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama: estas herramientas estan orientadas a modelos de lenguaje y no ejecutan politicas VLA de LeRobot. La exportacion a ONNX u otros formatos no aparece en la informacion disponible.
- Latencia y throughput: no disponibles. El dataset de entrenamiento se capturo a 10 FPS y el ejemplo de despliegue configura las camaras a 30 FPS con 640x480, pero no se publica la frecuencia de control efectiva del modelo ni el tiempo de inferencia por paso en ningun hardware concreto.
- Nota practica: el ejemplo de `lerobot-rollout` exige que los nombres y indices de camara coincidan exactamente con las claves de observacion usadas en el entrenamiento (`camera1`, `camera2`, `camera3` segun la tabla de entradas, o `top` y `left_wrist` segun la seccion de detalles), por lo que hay que unificar ese mapeo antes de ejecutar.

## Comparativa con modelos similares

Los siguientes valores proceden de fuentes publicas generales de cada proyecto y no han sido verificados en la informacion proporcionada; se marcan como aproximados. El dato de SmolVLA es el unico medido directamente sobre este repositorio.

| Modelo | Parametros | Tipo | Licencia | Disponibilidad en HuggingFace |
|---|---|---|---|---|
| SmolVLA (este checkpoint) | 450.046.176 (~450 M), dato real | VLA compacto, fine-tune de tarea unica | Apache 2.0 | Si, repositorio publico con 0 descargas |
| SmolVLA base (lerobot/smolvla_base) | No disponible en la informacion | VLA preentrenado | No disponible en la informacion | Si |
| pi0 / pi0.5 (Physical Intelligence) | ~3 B (aproximado, no verificado) | VLA de proposito general | No disponible en la informacion | Si |
| GR00T N1.x (NVIDIA) | ~2 B (aproximado, no verificado) | VLA de proposito general | No disponible en la informacion | Si |
| ACT (Action Chunking Transformer, implementado en LeRobot) | Decenas de millones (aproximado, no verificado) | Politica de imitacion sin componente linguistico | No disponible en la informacion | Si, dentro de LeRobot |
| Diffusion Policy (implementado en LeRobot) | No disponible en la informacion | Politica de imitacion basada en difusion | No disponible en la informacion | Si, dentro de LeRobot |

Diferencias clave: frente a los VLA de proposito general, este checkpoint es entre 5 y 7 veces mas pequeno, no esta entrenado para multiples tareas ni para generalizacion a robots distintos, y no publica resultados comparativos. Su ventaja es el coste de despliegue y la integracion directa en LeRobot; su desventaja es la ausencia total de evaluacion publica.

## Limitaciones y advertencias

- Especializacion extrema: esta entrenado para una unica tarea ("Turn the lever off; the status indicator should turn red.") sobre un robot `so101_follower`. Fuera de esa tarea, su comportamiento no esta caracterizado.
- Sin evaluacion publicada: la model card indica que no se han proporcionado resultados de evaluacion. No hay tasa de exito, numero de intentos ni condiciones de prueba, por lo que no se puede afirmar nada sobre su fiabilidad.
- Sin validacion de la comunidad: 0 descargas y 0 likes. El modelo no ha sido reproducido ni contrastado por terceros.
- Riesgo de sobreajuste al entorno: con solo 100 episodios y 21.774 frames, es previsible que la politica dependa de la posicion exacta de la palanca, de la iluminacion y de la configuracion de camaras del laboratorio original. La propia plantilla de la model card sugiere anotar cambios de posicion de objetos, iluminacion, distractores o un robot distinto del mismo tipo como factores que afectan a la dificultad.
- Ambiguedad en las entradas: la seccion de detalles declara dos camaras (`top`, `left_wrist`) mientras que la tabla de entradas lista tres flujos (`camera1`, `camera2`, `camera3`). Si el mapeo no coincide con el del entrenamiento, el comportamiento sera impredecible.
- Discrepancia de nomenclatura: el repositorio se llama "ours_1000_10fps" y el dataset asociado "ours_100_10fps". Conviene confirmar a que semilla y a que dataset corresponde exactamente este checkpoint antes de compararlo.
- Alucinacion y errores de politica: en un VLA de imitacion, el fallo tipico no es una alucinacion textual sino una accion fisica incorrecta o insegura. No debe operarse sin supervisión, topes de par ni parada de emergencia.
- Idiomas: no hay informacion sobre el idioma de las instrucciones soportadas. La condicion de tarea del entrenamiento esta en ingles.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, con obligacion de conservar el aviso de licencia y de citar (la model card pide citar el metodo y LeRobot). El modelo base `lerobot/smolvla_base` puede tener condiciones propias que conviene revisar.
- Reproducibilidad: se documentan semilla, pasos, batch, optimizador y tasa de aprendizaje, pero no la version exacta de las dependencias, el hardware de entrenamiento ni la duracion, lo que limita la reproducibilidad bit a bit.
- Los resultados de busqueda web proporcionados no contienen informacion relevante sobre este modelo: consisten en listados de hoteles en Lancashire (Reino Unido) y no se han utilizado como fuente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HyeonseokE/smolvla_rq2_turn_off_lever_ours_1000_10fps
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/rq2_turn_off_lever_ours_100_10fps
- Articulo de SmolVLA (arXiv:2506.01844): https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos (cheat-sheet): https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=HyeonseokE/rq2_turn_off_lever_ours_100_10fps
