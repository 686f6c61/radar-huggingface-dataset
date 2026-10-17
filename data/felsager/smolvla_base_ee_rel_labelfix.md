# felsager/smolvla_base_ee_rel_labelfix

## Resumen

El modelo `felsager/smolvla_base_ee_rel_labelfix` es un ajuste fino (fine-tune) de SmolVLA, un modelo compacto de vision-lenguaje-accion (VLA) orientado al control de robots manipuladores. Lo publica el usuario felsager sobre el modelo base `lerobot/smolvla_base` de Hugging Face, y esta pensado para ejecutar politicas de manipulacion sobre robots SO-100/SO-101 equipados con efector final. Se distribuye como politica de LeRobot, la libreria de robotica open source de Hugging Face, y hereda la licencia Apache 2.0 del modelo original.

SmolVLA es relevante porque propone un VLA de tamano reducido (unos 450 millones de parametros) que busca rendimiento competitivo con un coste computacional bajo, hasta el punto de poder desplegarse en hardware de consumo. Frente a VLA de varios miles de millones de parametros (OpenVLA, pi0), SmolVLA reduce drasticamente los requisitos de memoria e inferencia manteniendo capacidad de generalizacion sobre tareas de manipulacion. En este caso concreto, el fine-tune adapta el modelo base a un dataset comunitario de tareas especificas de pick-and-place, ordenacion y manipulacion con herramienta.

El modelo consume tres flujos de imagen (camaras `top`, `wrist` y `side` a 480x640) mas un vector de estado del robot de 10 dimensiones, y produce un vector de accion de 10 dimensiones. El ajuste se ha realizado sobre un dataset de 36.057 episodios y 18.812.021 frames capturados a 30 FPS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en transformer; backbone de vision-lenguaje (SmolVLM) mas experto de acciones con flow matching |
| Parametros totales | 450.046.176 (aproximadamente 450 millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; los pesos se distribuyen en safetensors (float32/bfloat16 segun fichero) |
| Idiomas soportados | no disponible (las instrucciones del dataset de entrenamiento estan en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

Datos adicionales de la model card: tipo de robot `so100_so101_ee`, camaras `top`, `wrist` y `side`, estado de observacion de dimension `(10,)` y salida de accion de dimension `(10,)`.

## Arquitectura y entrenamiento

SmolVLA combina un modelo de vision-lenguaje compacto (la familia SmolVLM) que procesa las imagenes de las camaras junto con el estado del robot, y un experto de acciones que genera las trayectorias de control mediante flow matching. El resultado es una politica que, dada la observacion multimodal y una instruccion en lenguaje natural, predice directamente un vector de acciones de 10 dimensiones. El modelo completo ronda los 450 millones de parametros segun los pesos publicados, lo que lo situa muy por debajo de los VLA habituales.

Este repositorio concreto es un fine-tune del checkpoint base `lerobot/smolvla_base`. El ajuste se ha realizado con el dataset `felsager/community_dataset_v3_ee_smolvla`, compuesto por 36.057 episodios y 18.812.021 frames a 30 FPS, con tareas que abarcan desde pick-and-place de pilas, volantes y cubos de colores hasta ordenacion de piezas, manipulacion de cuerda o herramienta, vertido de agua y movimientos de ajedrez descritos en lenguaje natural. No se detalla en la informacion disponible si hubo fases de RLHF, DPO u otro ajuste por preferencias, ni el numero total de tokens de entrenamiento del VLM base.

## Capacidades

- Control de robot manipulador: genera acciones de 10 dimensiones para robots SO-100/SO-101 con efector final a partir de observaciones visuales y de estado.
- Percepcion visual multi-camara: procesa de forma simultanea tres flujos de imagen (`top`, `wrist`, `side`) a resolucion 480x640, con mascaras de padding por camara.
- Seguimiento de instrucciones en lenguaje natural: ejecuta tareas descritas textualmente (por ejemplo, "Pick up the red cube and place it on the red block").
- Manipulacion de objetos variados: pilas, volantes, cubos, tuercas, cuerda, herramienta, fichas de ajedrez, residuos biomedicos, piezas de Lego, entre otros, segun las tareas del dataset.
- Tareas de pick-and-place, clasificacion por color, vertido de liquidos y reposicionamiento guiado por herramienta.
- Soporte de multiples camaras con mascaras opcionales para entradas variables.
- Tool calling / function calling: no aplica (es una politica robotica, no un modelo conversacional).
- Capacidades multilingues: no disponibles; el dataset de entrenamiento usa instrucciones en ingles.
- Modo "thinking" o razonamiento explicito: no disponible.

## Casos de uso

- Manipulacion robotica en laboratorio: reproducir las tareas del dataset (coger y colocar objetos, clasificar por color) sobre un robot SO-100/SO-101 en un banco de pruebas, usando el modelo como politica de control en tiempo real.
- Investigacion en VLA: servir como punto de partida para estudiar fine-tuning de politicas de vision-lenguaje-accion de 450M de parametros y comparar con el checkpoint base `lerobot/smolvla_base`.
- Automatizacion de tareas repetitivas de pick-and-place: en lineas de montaje simples, el modelo puede ejecutar la colocacion de piezas segun una instruccion textual fija, con las tres camaras cubriendo la escena.
- Ordenacion y clasificacion de objetos: tareas de agrupar objetos por color o tipo (tuercas por color, cubos sobre bloques del mismo color), utiles en entornos educativos o demostradores.
- Reproduccion de tareas con herramienta: manipular objetos indirectamente usando una herramienta (por ejemplo, reposicionar un objeto o una cuerda), un escenario de interes en investigacion de destreza.
- Vertido y manipulacion de liquidos: la politica incluye tareas de verter agua de una botella en un vaso de papel, relevante para experimentos de manipulacion con recipientes.
- Despliegue en hardware de consumo: gracias al tamano del modelo, puede ejecutarse en una unica GPU de gama media o incluso en CPU, lo que facilita prototipado rapido y demostraciones sin infraestructura de centro de datos.
- Generacion de datos y evaluacion: usar el modelo para producir trayectorias de referencia en entornos simulados o reales y comparar su comportamiento con otras politicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este fine-tune concreto. La model card no incluye tablas de exito por tarea, tasa de exito ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones a partir del tamano del modelo, no confirmadas por el autor):
  - float32: aproximadamente 1,8 GB solo para pesos.
  - bfloat16/float16: aproximadamente 0,9 GB solo para pesos.
  - int8: aproximadamente 0,45 GB solo para pesos.
  - A estas cifras hay que sumar activaciones, buffers de imagen (tres flujos de 480x640) y overhead del runtime.
- GPU recomendadas: cualquier GPU moderna con al menos 4-8 GB de VRAM deberia ser suficiente; una RTX 3060, RTX 4070 o RTX 4090 son opciones mas que holgadas. GPUs de datacenter (A100, H100) no son necesarias para inferencia.
- Cabe en GPU de consumo: si, es uno de los puntos fuertes de SmolVLA; el modelo esta disenado para funcionar en hardware de consumo.
- Opciones de despliegue: LeRobot (framework principal, con la guia de SmolVLA y el script de evaluacion), y potencialmente otros runtimes compatibles con safetensors. No se detallan integraciones oficiales con vLLM, llama.cpp, Ollama o TGI para este caso.
- Latencia y throughput: no disponibles. La libreria LeRobot dispone de utilidades para medir la frecuencia de inferencia de la politica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| felsager/smolvla_base_ee_rel_labelfix (este) | ~450M | no disponible | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base (modelo base) | ~450M | no disponible | Apache 2.0 | Hugging Face |
| OpenVLA | ~7B | no disponible | Open (con condiciones) | Hugging Face |
| pi0 (Physical Intelligence) | orden de miles de millones | no disponible | no disponible | Parcialmente publico |
| RDT-1B | ~1,2B | no disponible | no disponible | Hugging Face |

Nota: los datos de los modelos comparativos provienen de fuentes publicas generales y no se han verificado en la informacion proporcionada para esta ficha; deben tratarse como aproximados. La ventaja principal de SmolVLA frente a alternativas es su tamano reducido (menos de 500M de parametros) y su licencia Apache 2.0 permisiva.

## Limitaciones y advertencias

- Es un modelo especializado: no es un modelo de lenguaje general ni un chatbot; solo produce acciones de robot de 10 dimensiones.
- Altamente dependiente del dominio de entrenamiento: las tareas del dataset (pick-and-place, ordenacion, vertido, manipulacion con herramienta) definen su alcance; fuera de ese dominio su comportamiento no esta garantizado.
- Dependencia del hardware robotico: esta entrenado para la configuracion `so100_so101_ee` con camaras `top`, `wrist` y `side`; otros robots o disposiciones de camara pueden requerir reentrenamiento.
- Instrucciones en ingles: las tareas del dataset estan en ingles, por lo que el rendimiento con instrucciones en castellano no esta verificado.
- Riesgo de fallo en manipulacion: como toda politica robotica aprendida, puede fallar en tareas fuera de distribucion, con objetos nuevos o iluminacion distinta, con riesgo de colisiones o danos.
- Sin datos de evaluacion publicados: no hay tasas de exito, benchmarks ni comparativas numericas para este fine-tune, lo que dificulta juzgar su calidad frente al modelo base.
- Licencia Apache 2.0: permite uso comercial y modificacion, con las obligaciones habituales de atribucion y conservacion de avisos; conviene revisar tambien la licencia del modelo base `lerobot/smolvla_base` y de los datos de entrenamiento.
- Numero de descargas y likes cero en el momento de la consulta: repositorio sin validacion por parte de la comunidad.
- El tamano del repositorio (17,2 GB) es muy superior al de los pesos, probablemente por incluir checkpoints y estados de optimizador; conviene verificar que ficheros se descargan.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/felsager/smolvla_base_ee_rel_labelfix
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/felsager/community_dataset_v3_ee_smolvla
- Paper de SmolVLA (arXiv:2506.01844): https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
