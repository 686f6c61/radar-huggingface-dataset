# Anu120/Thesis_part_pullout

## Resumen

Anu120/Thesis_part_pullout es un ajuste fino del modelo SmolVLA (vision-language-action) publicado por el usuario Anu120 a partir del checkpoint base lerobot/smolvla_base. Se trata de una politica robotica de tipo VLA: recibe imagenes de camara, el estado del robot y una instruccion en lenguaje natural, y devuelve una secuencia de acciones motoras (action chunk) que el controlador del robot ejecuta de forma secuencial. El repositorio declara 450.046.176 parametros (unos 450 M) y ocupa 0,9 GB en formato safetensors, lo que lo situa en la franja de modelos desplegables en GPU de consumo.

El modelo se ha entrenado con el conjunto de datos Anu120/part_pull_out y esta orientado a una tarea concreta de manipulacion (extraccion de una pieza, part pull-out), no a proposito general. SmolVLA, la arquitectura base, es un VLA compacto desarrollado por Hugging Face que combina un VLM pequeno de la familia SmolVLM con un modulo experto en acciones entrenado mediante flow matching; el articulo de referencia es arXiv:2506.01844.

Su interes practico esta en el flujo de trabajo: se entrena y se evalua dentro del ecosistema LeRobot (lerobot-train y lerobot-record) y esta pensado para ejecutarse en hardware asequible, incluida una unica GPU de consumo. El repositorio, con 0 descargas y 0 likes, no incluye tarjeta de evaluacion propia: la model card es la plantilla generica de SmolVLA mas los metadatos del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA): VLM pequeno de la familia SmolVLM mas un modulo experto en acciones entrenado con flow matching |
| Parametros totales | 450.046.176 (~450 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente en bfloat16; no se documenta ninguna cuantizacion oficial) |
| Idiomas soportados | Instrucciones en lenguaje natural; el backbone SmolVLM esta entrenado mayoritariamente en ingles. Lista oficial de idiomas: no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 0,9 GB) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseno de SmolVLA: un modelo de vision-lenguaje preentrenado (familia SmolVLM, en el orden de los 500 M de parametros en su variante original) al que se anade un experto en acciones que genera chunks de acciones mediante flow matching, con atencion cruzada intercalada entre el VLM y el experto para compartir representaciones. El modelo consume observaciones visuales, el estado de las articulaciones y una instruccion textual, y produce un horizonte de acciones que se ejecutan sin necesidad de inferencia a cada paso de control. La informacion proporcionada no detalla el numero de capas, la resolucion de imagen ni la longitud exacta del horizonte de acciones.

Sobre el entrenamiento de esta copia concreta solo se sabe que usa el dataset Anu120/part_pull_out y que parte del checkpoint lerobot/smolvla_base. El modelo base, segun su articulo (arXiv:2506.01844), se preentrena con datos de robot de la comunidad LeRobot y despues se ajusta por tarea; no se dispone en la informacion facilitada del numero de tokens, la composicion del dataset, ni de si se aplicaron tecnicas de RLHF o DPO (en robótica de imitacion lo habitual es aprendizaje supervisado sobre demostraciones mas flow matching, y SmolVLA describe inferencia asincrona para solapar el calculo del siguiente chunk con la ejecucion del actual).

## Capacidades

- Generacion de acciones motoras a partir de observaciones visuales y del estado del robot (control de manipuladores tipo SO-100/SO-101 u otros compatibles con LeRobot).
- Seguimiento de instrucciones en lenguaje natural para condicionar la politica (goal-conditioned control).
- Prediccion de chunks de acciones, lo que reduce la frecuencia de inferencia necesaria frente a politicas paso a paso.
- Inferencia asincrona: el paper de SmolVLA describe la ejecucion de un chunk mientras se calcula el siguiente, util para control en tiempo real.
- Ejecucion en hardware de consumo, incluida una unica GPU e incluso CPU (con latencia mayor).
- Capacidades multilingues: no documentadas; el backbone SmolVLM esta entrenado predominantemente en ingles.
- Tool calling, function calling y razonamiento multi-paso: no aplica, no es un modelo de lenguaje conversacional.

## Casos de uso

- Automatizacion de una celda de pick-and-place concreta: la politica se ejecuta sobre el manipulador para extraer una pieza (part pull-out) de forma repetitiva, sin reentrenar, siempre que la camara y la iluminacion coincidan con las del dataset de entrenamiento.
- Banco de pruebas de investigacion en tesis: el nombre del repositorio sugiere un uso academico; sirve como baseline reproducible dentro de LeRobot para comparar variantes de datos, aumentos o hiperparametros.
- Prototipado rapido de politicas VLA en laboratorio: al caber en una GPU de consumo, permite iterar sobre un puesto de trabajo con una RTX 3060/4090 en lugar de depender de un cluster.
- Validacion de pipelines de datos de robot: el par modelo-dataset (Anu120/part_pull_out) permite comprobar de extremo a extremo el flujo de grabacion, curado y entrenamiento de LeRobot.
- Demostraciones en docencia: ilustra de forma tangible como un VLM pequeno se convierte en controlador motor mediante un experto de acciones.
- Integracion como componente de un sistema mayor: la politica puede invocarse desde un orquestador que decida cuando lanzar la tarea de extraccion y cuando detenerla, aunque la gestion de alto nivel no la realiza este modelo.
- Evaluacion comparativa de VLA pequenos: sirve como referencia de un ajuste fino monoTarea frente al checkpoint generalista smolvla_base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio es la plantilla estandar de LeRobot/SmolVLA y no incluye tasas de exito, numero de episodios de evaluacion ni comparaciones con otras politicas. El articulo de SmolVLA (arXiv:2506.01844) contiene las evaluaciones del modelo base, pero esos numeros no se han facilitado aqui y no deben extrapolarse a este ajuste fino.

## Requisitos de hardware

- VRAM estimada para los pesos: ~0,9 GB en bfloat16 (coincide con el tamano del repositorio), ~1,8 GB en float32 y ~0,45 GB en int8 (estimacion teorica, la cuantizacion no esta documentada).
- VRAM total en inferencia: el pico real depende de las imagenes de entrada y del buffer de acciones; con una o varias camaras es razonable esperar un consumo de pocos GB, por lo que cabe holgadamente en GPUs de 4-8 GB.
- GPU compatibles: RTX 3060/4060, RTX 4090, A100, H100 y aceleradores tipo NVIDIA Jetson Orin. El paper de SmolVLA esta orientado explicitamente a hardware de consumo.
- Ejecucion en CPU: tecnicamente posible (el paper lo contempla), con latencia muy superior y probablemente incompatible con control en tiempo real.
- Despliegue: LeRobot (lerobot-record con --policy.path apuntando al checkpoint, o descarga desde el Hub); PyTorch como runtime. vLLM, TGI, llama.cpp u Ollama no son aplicables, ya que no es un modelo generativo de texto ni publica pesos GGUF.
- Latencia y throughput: no disponibles. La frecuencia de control alcanzable depende del robot, el numero de camaras y la GPU, y no se documenta en el repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Anu120/Thesis_part_pullout | ~450 M | VLA (SmolVLA ajustado) | Monotarea (part pull-out) | Apache 2.0 | Hugging Face, 0 descargas |
| lerobot/smolvla_base | ~450 M | VLA (SmolVLA) | Politica generalista preentrenada | Apache 2.0 | Hugging Face |
| Physical Intelligence pi0 / openpi | ~3 B (orden de magnitud) | VLA con flow matching | Manipulacion generalista | no disponible en la informacion facilitada | Pesos y codigo publicos |
| ACT (LeRobot) | Decenas de millones (orden de magnitud) | Transformer de imitacion (sin VLM) | Monotarea | Apache 2.0 (repositorio LeRobot) | Incluido en LeRobot |

Las cifras de los modelos alternativos proceden de su documentacion publica y pueden variar segun la version; se marcan como no disponibles aquellos campos que no se han podido verificar en la informacion facilitada. La diferencia relevante es de escala y proposito: pi0 apunta a generalizacion con mayor coste computacional, mientras que ACT es mas ligero pero carece de condicionamiento por lenguaje natural.

## Limitaciones y advertencias

- Modelo monotarea: el dataset Anu120/part_pull_out define una unica tarea; no hay evidencia de generalizacion a objetos, posiciones o instrucciones distintas.
- Riesgo alto de fallo fuera de distribucion: cambios de camara, iluminacion, fondo, posicion inicial de la pieza o del robot degradan la politica de forma tipica en los VLA de imitacion.
- Alucinacion en el sentido de acciones plausibles pero incorrectas: el modelo puede ejecutar trayectorias coherentes con el entrenamiento aunque la escena no corresponda, sin mecanismo de deteccion de error propio.
- Ausencia de evaluacion publicada: sin tasas de exito, sin numero de episodios y sin comparacion con el checkpoint base, no es posible estimar la calidad real del ajuste fino.
- Idiomas: el condicionamiento linguistico esta limitado en la practica al ingles; no se documenta soporte multilingue.
- Contexto: la longitud de contexto y el horizonte de acciones no estan documentados en el repositorio.
- Reproducibilidad: la model card es la plantilla generica de SmolVLA y conserva el ejemplo de entrenamiento con --policy.type=act, lo que no refleja necesariamente la configuracion usada; conviene revisar los ficheros de configuracion del repositorio antes de reutilizarlo.
- Licencia: Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base (lerobot/smolvla_base, tambien Apache 2.0).
- Advertencia de seguridad: cualquier politica robotica debe desplegarse con limites de par, paradas de emergencia y validacion en banco antes de operar cerca de personas.
- Traccion nula: 0 descargas y 0 likes indican que el modelo no ha sido validado por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Anu120/Thesis_part_pullout
- Dataset de entrenamiento: https://huggingface.co/datasets/Anu120/part_pull_out
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Articulo de SmolVLA: https://arxiv.org/abs/2506.01844
- Pagina del articulo en Hugging Face: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
