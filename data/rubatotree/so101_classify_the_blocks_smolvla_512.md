# rubatotree/so101_classify_the_blocks_smolvla_512

## Resumen

`rubatotree/so101_classify_the_blocks_smolvla_512` es una politica robotica de tipo vision-language-action (VLA) obtenida por ajuste fino de `lerobot/smolvla_base`, el modelo base de SmolVLA publicado por Hugging Face. El modelo resuelve una tarea de manipulacion concreta: clasificar bloques de plastico sueltos comparandolos con los ejemplos de un organizador y colocarlos en el compartimento correspondiente. Esta entrenado para el robot `so_follower` (familia SO-101) con una unica camara frontal y un vector de estado de 6 dimensiones, y produce como salida un vector de accion de 6 dimensiones.

Tecnicamente no es un modelo de lenguaje: es una politica de imitacion que consume observaciones visuales y propioceptivas y emite acciones motoras. Cuenta con 450.046.176 parametros (aproximadamente 450 millones) almacenados en safetensors, con un repositorio de 1,2 GB, y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Su relevancia practica radica en que demuestra el flujo completo de LeRobot: grabar un dataset propio, ajustar SmolVLA y desplegar la politica en hardware de consumo.

El modelo se publico con 0 descargas y 0 "likes" en el momento de la consulta y no incluye resultados de evaluacion en su model card. La tarea esta declarada en ingles ("Match each loose plastic block to the examples in the organizer and put it in the matching compartment") y el entrenamiento se realizo con LeRobot 0.6.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta; ajuste fino de SmolVLA (`lerobot/smolvla_base`) |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: consume una imagen por paso (`observation.images.front`, 3x480x640) y un estado de 6 dimensiones |
| Tipos de cuantizacion | No disponible (no se publican versiones cuantizadas; pesos en safetensors) |
| Idiomas soportados | No disponible. No es un modelo de lenguaje; la instruccion de tarea usada en el entrenamiento esta en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria `lerobot`) |
| Tipo de robot | `so_follower` (SO-101) |
| Camaras | 1 (`front`) |
| Entradas | `observation.state` (6,), `observation.images.front` (3, 480, 640) |
| Salidas | `action` (6,) |
| Tamano del repositorio | 1,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

SmolVLA se describe en la model card como un modelo vision-language-action compacto y eficiente, capaz de alcanzar rendimiento competitivo con un coste computacional reducido y de desplegarse en hardware de consumo. La politica hereda la arquitectura del modelo base `lerobot/smolvla_base` y anade una cabeza de accion que transforma la representacion multimodal en comandos motores de 6 grados de libertad. En cada paso de control el modelo recibe una imagen RGB de 480x640 procedente de la camara frontal y el estado articular del robot (6 valores), y devuelve el vector de accion de 6 dimensiones. Los detalles concretos de la arquitectura interna (composicion del codificador visual, mecanismo de atencion o estrategia de decodificacion de acciones) no se detallan en la informacion proporcionada; la referencia tecnica es el articulo arXiv:2506.01844.

El ajuste fino se realizo sobre el dataset `rubatotree/classify-blocks-512-local`, compuesto por 512 episodios y 201.004 fotogramas grabados a 15 FPS, todos ellos de la misma tarea de clasificacion de bloques. La configuracion de entrenamiento incluye 50.000 pasos, tamano de lote 64, optimizador AdamW, tasa de aprendizaje 1e-4 y semilla 1000, ejecutada con LeRobot 0.6.1. No se documenta en la informacion disponible si hubo etapas de RLHF, DPO u optimizacion por preferencias, ni el numero de tokens o muestras visto por el modelo; en el caso de politicas de imitacion entrenadas con LeRobot, el procedimiento habitual es aprendizaje por imitacion supervisado sobre pares observacion-accion.

## Capacidades

- Generacion de acciones motoras de 6 grados de libertad para el brazo `so_follower`, a partir de una imagen frontal y del estado articular.
- Ejecucion de una tarea de clasificacion y colocacion de objetos: emparejar cada bloque de plastico con el ejemplo del organizador y depositarlo en el compartimento correspondiente.
- Percepcion visual de una unica camara RGB a 480x640, suficiente para la tarea de organizacion sobre superficie de trabajo.
- Condicionamiento por instruccion de tarea en lenguaje natural: la cadena de la tarea se pasa en tiempo de ejecucion mediante el parametro `--task` de `lerobot-rollout`.
- Integracion con el ecosistema LeRobot para rollout en robot real (`lerobot-rollout`) y para reentrenamiento (`lerobot-train`).
- No dispone de generacion de texto, razonamiento simbolico, matematicas, codigo, tool calling, function calling, capacidades de agente multi-paso, vision general de proposito abierto ni procesamiento de audio.
- No se documentan capacidades multilingues: no es un modelo de lenguaje y la unica instruccion registrada esta en ingles.

## Casos de uso

- Clasificacion y organizacion de piezas en linea de montaje: la politica coloca cada bloque en el compartimento correcto comparandolo visualmente con los ejemplos del organizador, lo que permite sustituir la inspeccion manual en tareas de separacion repetitiva.
- Clasificacion de componentes por referencia en almacen: reentrenando con un dataset propio de piezas, el mismo flujo (imagen frontal mas estado articular) sirve para separar referencias similares en cajas normalizadas.
- Recogida y colocacion (pick and place) de objetos pequenos: el vector de accion de 6 dimensiones es directamente aplicable a tareas de agarre y deposito sobre superficies planas.
- Automatizacion de celulas de montaje con brazo SO-101 de bajo coste: al ajustarse sobre `so_follower`, el modelo encaja en montajes con hardware economico y camara unica, sin necesidad de GPU de datacenter.
- Banco de pruebas para investigacion en aprendizaje por imitacion: sirve como ejemplo reproducible de ajuste fino de SmolVLA con 512 episodios y 50.000 pasos, util para medir el efecto del tamano de dataset y de la configuracion de entrenamiento.
- Clasificacion de residuos o materiales por categoria visual: con un dataset adaptado, el mismo esquema observacion-accion puede separar objetos en contenedores segun su apariencia.
- Tareas educativas y de demostracion: el modelo se puede ejecutar con `lerobot-rollout` sobre un robot de escritorio para ilustrar el ciclo completo de captura de datos, entrenamiento y despliegue.
- Evaluacion de robustez frente a variaciones de posicion e iluminacion: al no haber resultados publicados, el modelo es un candidato razonable para protocolos internos de repeticion de ensayos y conteo de exitos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica ("No evaluation results have been provided for this policy yet"), por lo que no existen tasas de exito, numero de ensayos ni comparaciones cuantitativas con otras politicas en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1-2 GB para los pesos de 450 millones de parametros en precision reducida (bf16/fp16), mas el margen del runtime de vision y del bucle de control; no se publican cifras oficiales, por lo que debe considerarse una estimacion a partir del recuento de parametros.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM es suficiente en la practica; se espera funcionamiento correcto en RTX 3060, RTX 4060, RTX 4090, A100 y H100, sin que el modelo aproveche el exceso de computo de estas ultimas.
- Cabe en GPU de consumo: si, incluidas gamas de entrada con 6-8 GB de VRAM. El modelo esta disenado explicitamente para despliegue en hardware de consumo.
- Alternativas sin GPU: al tratarse de una red de 450 millones de parametros, es viable probar inferencia en CPU o en plataformas embebidas tipo Jetson, aunque no se documentan latencias medidas.
- Opciones de despliegue: `lerobot-rollout` (estrategia base) y `lerobot-train` para reentrenamiento, ambos sobre el paquete `lerobot` con PyTorch. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama, que no aplican a politicas de robot.
- Latencia y throughput: no disponibles. Como referencia de contexto, el dataset de entrenamiento se grabo a 15 FPS y el ejemplo de despliegue de la model card configura las camaras a 30 FPS.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entradas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rubatotree/so101_classify_the_blocks_smolvla_512` | 450.046.176 | Imagen 3x480x640 + estado (6,); salida accion (6,) | Clasificacion de bloques con SO-101 | Apache 2.0 | Hugging Face, via LeRobot |
| `lerobot/smolvla_base` | No disponible en la informacion proporcionada (misma familia arquitectonica) | No disponible | Politica VLA base, no especializada en una tarea | No disponible en la informacion proporcionada | Hugging Face |
| Otras politicas de imitacion de LeRobot (ACT, Diffusion Policy) | No disponible | Depende de la politica y del dataset | Manipulacion general | Depende de cada repositorio | Hugging Face / LeRobot |
| VLAs de mayor tamano (familia OpenVLA y similares) | No disponible en la informacion proporcionada | No disponible | Manipulacion generalista | No disponible | No disponible |

Los resultados de busqueda web realizados no devolvieron informacion relevante sobre este modelo ni sobre alternativas comparables, por lo que no se pueden aportar cifras de rendimiento cruzadas entre modelos.

## Limitaciones y advertencias

- Modelo de tarea unica: esta ajustado exclusivamente para la tarea de clasificacion de bloques descrita; fuera de ese dominio su comportamiento no esta validado.
- Sin resultados de evaluacion: no hay tasas de exito, numero de ensayos ni condiciones de prueba publicadas, por lo que no se puede estimar su fiabilidad real en produccion.
- Dependencia fuerte del montaje: el modelo asume un robot `so_follower`, una unica camara `front` y unas posiciones de camara y robot concretas. Cambiar la camara, la iluminacion o la disposicion de la mesa puede degradar el rendimiento sin reentrenamiento.
- Dataset local: el dataset de entrenamiento se denomina `classify-blocks-512-local`, lo que sugiere captura en un entorno especifico; es probable un sesgo hacia ese fondo, esas condiciones de luz y esa posicion de los objetos.
- Riesgo de sobreajuste con 512 episodios y 50.000 pasos sobre una unica tarea: la politica puede memorizar trayectorias y fallar ante objetos o colocaciones nuevas.
- Sin capacidades de lenguaje: no genera texto, no soporta tool calling ni razonamiento multi-paso, y no puede dar explicaciones de sus decisiones. No existe soporte multilingue.
- Sin memoria conversacional ni contexto largo: cada paso de control es independiente; no hay ventana de contexto en el sentido de los modelos de lenguaje.
- Riesgo de alucinacion en el sentido de acciones fisicas incorrectas: una prediccion erronea se traduce directamente en movimiento del brazo, con el consiguiente riesgo de colision o dano en el entorno. Se recomienda limitar velocidades y usar parada de emergencia.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte; se debe citar el metodo (arXiv:2506.01844) y LeRobot conforme a lo indicado en la model card.
- Adopcion nula hasta la fecha: 0 descargas y 0 "likes", sin mantenimiento posterior documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rubatotree/so101_classify_the_blocks_smolvla_512
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/rubatotree/classify-blocks-512-local
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=rubatotree/classify-blocks-512-local
- Articulo de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Los resultados de busqueda web proporcionados no contienen enlaces relevantes para este modelo.
