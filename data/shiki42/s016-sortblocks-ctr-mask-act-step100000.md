# Shiki42/s016-sortblocks-ctr-mask-act-step100000

## Resumen

El modelo `Shiki42/s016-sortblocks-ctr-mask-act-step100000` es un checkpoint de inferencia de una politica robotica ACT (Action Chunking with Transformers) entrenada con la libreria LeRobot. Lo publica el usuario Shiki42 como parte del experimento E769-R001 y corresponde al paso de optimizacion 100.000. Se trata de la variante denominada CTR-with-IdleMask, pensada para la tarea de simulacion Blocks Ranking con entrada RGB-CTR, es decir, una politica de manipulacion que aprende a ordenar bloques a partir de imagenes y estado proprioceptivo, no un modelo de lenguaje.

El checkpoint contiene 51.633.806 parametros y ocupa 0,2 GB en el repositorio, con pesos en formato safetensors. La politica consume RGB de tres camaras (superior, muneca izquierda y muneca derecha) mas un vector de estado de 14 dimensiones, y produce acciones de 14 dimensiones con chunk size 50. Se entreno con los 100 episodios y 68.438 fotogramas del dataset `Shiki42/ctr-sortblocks-100ep-ctr`, capturados a 25 FPS con el preset de camara `centered_fovy90`.

Su relevancia actual es acotada y muy especifica: sirve como referencia reproducible de ablation para estudiar el efecto de la mascara de inactividad (`observation.arm_active_mask`) en ACT, y como punto de partida para fine-tuning o para comparaciones en simulacion. Es importante senalar que la propia model card no reclama ningun resultado de evaluacion held-out, por lo que no existe evidencia publicada de tasa de exito ni de colisiones para este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), implementacion oficial de LeRobot 0.4.4, commit `8fff0fde7c79f23a93d845d1a50e985de01f8b8a` |
| Parametros totales | 51.633.806 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; el entrenamiento usa chunk size de 50 acciones con padding temporal |
| Tipos de cuantizacion | no disponible (no se documentan variantes GGUF, AWQ, GPTQ ni INT8) |
| Idiomas soportados | no aplica: es una politica robotica que no procesa lenguaje natural |
| Licencia | no disponible |
| Formato de pesos | safetensors (checkpoint LeRobot con configuracion y artefactos de preprocesado y postprocesado) |
| Entradas | RGB de tres camaras (top, muneca izquierda, muneca derecha) + estado de 14 dimensiones |
| Salidas | acciones de 14 dimensiones, en chunks de 50 |
| Tamano del repositorio | 0,2 GB |
| Dataset de entrenamiento | `Shiki42/ctr-sortblocks-100ep-ctr`, revision `9ee0f9d8e0700df5fac08454e7e213c4904d3024`, 100 episodios y 68.438 fotogramas a 25 FPS |
| Estado de evaluacion | sin resultado held-out reclamado por el autor |

## Arquitectura y entrenamiento

ACT es una arquitectura de imitation learning basada en transformer con esquema de action chunking: en lugar de predecir una unica accion por paso, el modelo emite una secuencia de 50 acciones, lo que reduce el error de acumulacion y suaviza la politica. Incluye componentes de vision para codificar las tres vistas RGB, fusion de la observacion con el vector de estado de 14 dimensiones y una cabeza de decodificacion que produce acciones de 14 dimensiones. El checkpoint sigue la implementacion oficial de LeRobot (version 0.4.4), con el codigo de entrenamiento CTR en el commit `f9039a01ebb66dde3ed567608410bf170c34d6b1`.

El entrenamiento se ajusto a un presupuesto fijo de 100.000 actualizaciones del optimizador, con tamano de lote efectivo 8, acumulacion de gradiente 1 y semilla 87431. La innovacion concreta de esta variante es el uso de `observation.arm_active_mask` en modo prefix-only: la mascara se alinea con cada ventana de acciones y se combina con padding temporal, de forma que el modelo recibe informacion explicita sobre cuando el brazo esta activo. La normalizacion emplea la media y desviacion tipica oficiales de estado y accion de ACT, mas las estadisticas visuales de ImageNet, verificadas contra las filas validas de la revision de entrenamiento fijada. No se documento uso de RLHF, DPO ni seleccion por metrica intermedia: el checkpoint del paso final se eligio antes de evaluar. La verificacion realizada consistio en una recarga en proceso limpio sobre CPU, con coincidencia exacta de los 234 tensores de estado y salida determinista en una muestra del dataset fijado; no se uso GPU ni se ejecutaron actualizaciones del optimizador. No se documentan tecnicas de decodificacion especulativa, atencion lineal ni mezclas de expertos.

## Capacidades

- Generacion de acciones de manipulacion en bucle cerrado para la tarea de ordenacion o clasificacion de bloques (Blocks Ranking) en simulacion con observacion RGB-CTR.
- Percepcion visual multi-camara: procesa simultaneamente vistas superior, de muneca izquierda y de muneca derecha.
- Fusion de vision y propiocepcion: combina imagenes con un vector de estado de 14 dimensiones.
- Action chunking: emite 50 acciones por inferencia, lo que permite control a mayor frecuencia efectiva que un predictor paso a paso.
- Modelado explicito de inactividad del brazo mediante la mascara `observation.arm_active_mask` (variante CTR-with-IdleMask).
- Inferencia determinista y reproducible: la verificacion reportada confirma salidas identicas en recargas sucesivas sobre la misma muestra.
- Ejecucion en CPU: se valido una recarga completa y la generacion de acciones sin GPU.
- No soporta tool calling, function calling, razonamiento multi-paso simbolico, generacion de texto, codigo, matematicas ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Investigacion en imitation learning: sirve como brazo de ablation CTR-with-IdleMask dentro del experimento E769-R001, para medir el efecto de la mascara de actividad del brazo frente a variantes sin mascara, manteniendo fijos el resto de hiperparametros (semilla 87431, lote efectivo 8, 100.000 pasos).
- Ordenacion de bloques en simulacion: la politica se puede ejecutar directamente en el entorno RGB-CTR para tareas de ranking o clasificacion de piezas, ya que fue entrenada exactamente sobre 100 episodios de esa tarea.
- Punto de partida para fine-tuning: al ser un checkpoint de inferencia con configuracion y artefactos de preprocesado incluidos, es util como inicializacion para nuevas tareas de manipulacion con tres camaras y estado de 14 dimensiones.
- Evaluacion comparativa de arquitecturas de politica: permite contrastar ACT de 51,6 M de parametros frente a otros enfoques (por ejemplo, politicas de difusion) en igualdad de datos y presupuesto de entrenamiento.
- Despliegue en hardware de gama media para robotica: con 51,6 M de parametros, la inferencia cabe en GPUs de consumo e incluso en CPU, lo que facilita montajes de laboratorio con un solo equipo por brazo.
- Reproduccion de experimentos: el repositorio fija revisiones concretas de codigo y dataset, lo que permite replicar el entrenamiento y auditar la seleccion del checkpoint del paso 100.000.
- Generacion de trayectorias sinteticas: las secuencias de 50 acciones pueden usarse como datos de partida o como referencia de comparacion en pipelines de evaluacion en bucle cerrado con LeRobot.
- Analisis de fallos por colision: aunque el autor no reporta resultados de colision, la politica es el artefacto adecuado para instrumentar ese tipo de metrica en la suite de evaluacion held-out cuando este cualificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se reclama ningun resultado de evaluacion held-out para S016 y que la suite compartida de evaluacion no estaba cualificada en el momento de redactarla, por lo que no se reporta tasa de exito ni resultado de colisiones. Tampoco se ofrecen cifras de MMLU, HumanEval, GSM8K ni equivalentes, que por otra parte no aplican a una politica robotica.

| Benchmark | Resultado |
|---|---|
| Tasa de exito held-out (S016) | no disponible |
| Colisiones | no disponible |
| Metricas de lenguaje (MMLU, HumanEval, GSM8K) | no aplica |
| Verificacion de recarga en CPU | superada: 234 tensores coincidentes y salida determinista |

## Requisitos de hardware

- VRAM estimada solo para pesos: en FP32, aproximadamente 207 MB (51.633.806 parametros x 4 bytes); en FP16 o BF16, aproximadamente 103 MB; en INT8, aproximadamente 52 MB. Hay que sumar activaciones, buffers de las tres camaras y el contexto de inferencia, no cuantificados en la informacion disponible.
- GPU recomendadas: no hay recomendaciones publicadas. Por tamano, cualquier GPU con 4 GB o mas de VRAM es suficiente; una RTX 3060, RTX 4060 o RTX 4090 resulta sobradamente capaz. En el extremo profesional, A100 o H100 no aportan ventaja practica para este tamano.
- Cabe en GPU de consumo: si, con margen amplio, dado que los pesos en FP16 rondan los 103 MB.
- Inferencia en CPU: verificada por el autor mediante recarga en proceso limpio, con salidas deterministas; no se reportan latencias.
- Opciones de despliegue: la libreria nativa es LeRobot (`lerobot`), con PyTorch. Los servidores orientados a LLM (vLLM, TGI, Ollama) no son aplicables a este tipo de politica. No se documenta exportacion a ONNX, TensorRT ni formatos GGUF.
- Latencia y throughput: no disponibles. El unico dato temporal es la frecuencia de captura del dataset, 25 FPS, que no equivale a la latencia de inferencia del modelo.

## Comparativa con modelos similares

La informacion proporcionada no incluye resultados ni especificaciones de modelos comparables, por lo que los valores de las alternativas quedan como no disponibles. La comparacion se limita a la posicion de esta variante dentro del propio experimento.

| Modelo | Parametros | Contexto / chunk | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shiki42/s016-sortblocks-ctr-mask-act-step100000 | 51.633.806 | 3 camaras + estado 14D; chunk 50 | sin resultado held-out reclamado | no disponible | publico en HuggingFace |
| Variante ACT sin IdleMask del mismo experimento | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |
| Otras politicas de imitation learning (por ejemplo, politicas de difusion) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no especificada: al no declararse licencia, no puede asumirse permiso de uso comercial. Cualquier despliegue en producto requeriria aclaracion previa con el autor.
- Ausencia total de evaluacion held-out: no hay tasa de exito ni metrica de colisiones, de modo que el rendimiento real de la politica es desconocido.
- Especializacion extrema: se entreno unicamente para la tarea Blocks Ranking en simulacion RGB-CTR, con un preset de camara concreto (`centered_fovy90`), tres vistas y un estado de 14 dimensiones. No es un modelo de proposito general.
- Dependencia de la mascara de inactividad: la variante espera `observation.arm_active_mask` en modo prefix-only; si en inferencia no se proporciona una mascara coherente con la distribucion de entrenamiento, el comportamiento puede degradarse.
- Riesgo de sobreajuste al entorno simulado: con 100 episodios y 68.438 fotogramas de una sola tarea, no hay evidencia de transferencia sim-a-real.
- Sobrecarga de inferencia no medida: no se publican latencias ni throughput, lo que impide garantizar el control en tiempo real a 25 FPS.
- Cobertura de verificacion limitada: la validacion reportada es una recarga en CPU con comprobacion de tensores y determinismo en una muestra; no incluye pruebas en GPU, en bucle cerrado largo ni en condiciones de iluminacion u oclusion distintas.
- Sin capacidades de lenguaje: no admite tool calling, agentes, multilingue ni razonamiento textual; cualquier expectativa de ese tipo es inaplicable.
- Sesgos potenciales: no documentados por el autor; en este tipo de politicas suelen aparecer sesgos derivados de las posiciones iniciales estratificadas y del reparto de episodios, pero no hay analisis disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shiki42/s016-sortblocks-ctr-mask-act-step100000
- Dataset de entrenamiento: https://huggingface.co/datasets/Shiki42/ctr-sortblocks-100ep-ctr (revision `9ee0f9d8e0700df5fac08454e7e213c4904d3024`)
- Libreria LeRobot: no se ha incluido enlace en la informacion proporcionada; el modelo declara `library_name: lerobot` y la version 0.4.4.
- Paper o blog del autor: no disponible.
- Demo o repositorio adicional: no disponible.
- Resultados de la busqueda web: no se han encontrado enlaces relevantes para este modelo. Las unicas entradas devueltas pertenecen al centro de ayuda de Eurostar (help.eurostar.com) y no guardan relacion con el checkpoint.
