# kelleno96/vector_smolvla_pipeline_test

## Resumen

SmolVLA es un modelo compacto de vision-lenguaje-accion (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, disenado para controlar robots manipuladores a partir de observaciones visuales y de estado, generando acciones motoras directamente. La ficha que nos ocupa, `kelleno96/vector_smolvla_pipeline_test`, es un fine-tuning derivado de `lerobot/smolvla_base` (aproximadamente 450 millones de parametros) publicado por el usuario kelleno96 sobre un tipo de robot denominado `vector`.

El checkpoint es, en la practica, una prueba de humo de la cadena de entrenamiento de LeRobot: se ha entrenado durante unicamente 3 pasos, con batch size 2, sobre un dataset de 1 episodio y 20 fotogramas a 5 FPS para la tarea "Pipeline test". No debe confundirse con un modelo entrenado para una tarea real de robotica, ya que su proposito aparente es verificar que el pipeline de datos, entrenamiento y publicacion en el Hub funciona de extremo a extremo.

Es relevante en tanto que ilustra el flujo de trabajo de SmolVLA y de LeRobot: clonar la politica base, aportar un dataset propio y obtener una politica lista para `lerobot-rollout`. Sin embargo, sus resultados de comportamiento son, por construccion, no fiables fuera del entorno de prueba, y el propio autor no ha publicado ninguna evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en SmolVLA; backbone de vision y lenguaje con cabeza/experto de acciones |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (politica robotica, no modelo de texto) |
| Tipos de cuantizacion | No disponible (entrenado/exportado en safetensors; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | No disponible (no es un modelo linguistico de proposito general; el prompt de tarea es texto libre, normalmente en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria `lerobot`) |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | vector |
| Camaras | front (la model card declara una, pero las entradas listan tres) |
| Tamano del repositorio | 0,9 GB |
| Fecha de creacion | 2026-10-04 |

## Arquitectura y entrenamiento

SmolVLA es una politica de aprendizaje por imitacion de tipo vision-language-action: consume observaciones (estado del robot e imagenes de camara) y produce un vector de acciones. En este checkpoint concreto, las entradas declaradas son `observation.state` con forma `(6,)` y tres imagenes visuales `observation.images.camera1/2/3` de `(3, 256, 256)`, mientras que la salida es `action` con forma `(4,)`. La model card declara el tipo de robot `vector` y la camara `front`, en aparente contradiccion con las tres camaras de la tabla de entradas, lo que conviene verificar antes de reutilizarlo.

El entrenamiento se realizo con LeRobot 0.6.2 y el optimizador AdamW, con learning rate 0,0001, semilla 1000, batch size 2 y tan solo 3 pasos de entrenamiento. El dataset asociado, `kelleno96/pipeline-test_20261004_145613`, contiene 1 episodio, 20 fotogramas y una unica tarea ("Pipeline test") grabada a 5 FPS. No se documenta composicion del dataset, numero de tokens, ni uso de RLHF/DPO o cualquier otra fase de alineamiento; en este tipo de politicas el ajuste es puramente de imitacion supervisada sobre demostraciones.

No se detallan en la informacion disponible innovaciones tecnicas concretas de este checkpoint (por ejemplo, decodificacion especulativa o atencion lineal). El paper de referencia de SmolVLA (arXiv:2506.01844) es el lugar indicado para consultar los detalles arquitectonicos del metodo base.

## Capacidades

- Generacion de acciones de control para un robot manipulador a partir de entrada visual y de estado (no es un modelo de generacion de texto).
- Percepcion visual multi-camara: hasta tres flujos de imagen de 256x256 declarados como entrada.
- Condicionamiento por instruccion de tarea en lenguaje natural (por ejemplo, `--task="Pipeline test"`).
- Integracion nativa con el ecosistema LeRobot para rollout, entrenamiento y publicacion en el Hub.
- Ejecucion en hardware de consumo segun la descripcion del metodo SmolVLA.
- Soporte de tool calling: no aplica / no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplica / no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision generativa, audio, etc.): no disponibles; la "vision" aqui es de entrada, no generativa.

## Casos de uso

- Validacion del pipeline de LeRobot: este checkpoint sirve como prueba de extremo a extremo de grabacion de dataset, entrenamiento (`lerobot-train`) y roll-out (`lerobot-rollout`) para confirmar que el entorno, las rutas y la publicacion en el Hub funcionan antes de lanzar un entrenamiento real.
- Plantilla para fine-tuning de SmolVLA: puede usarse como referencia de estructura de repositorio, nombres de claves de observacion y configuracion de entrenamiento al preparar politicas propias sobre `lerobot/smolvla_base`.
- Formacion y docencia: al ser un ejemplo minimo (1 episodio, 20 fotogramas), resulta util para explicar como se define un dataset de imitacion y que entradas/salidas espera una politica VLA.
- Depuracion de configuracion de camaras: permite comprobar el mapeo entre los indices de camara del sistema y las claves de observacion esperadas por la politica antes de invertir tiempo en datos reales.
- Pruebas de integracion continua sobre robotica: al ser pequeno (0,9 GB) y licencia Apache 2.0, encaja en entornos de CI que verifiquen que un cambio en el codigo de inferencia no rompe la carga del modelo.
- Referencia para comparar derivados de SmolVLA: sirve como punto base para medir en que medida un entrenamiento serio sobre datos reales mejora el comportamiento frente a un ajuste trivial de 3 pasos.
- Despliegue en produccion: no recomendado con este checkpoint concreto, al carecer de datos y evaluacion suficientes; para ello habria que reentrenar sobre un dataset representativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este checkpoint indica explicitamente "No evaluation results have been provided for this policy yet", es decir, no hay tabla de tareas, numero de ensayos ni tasas de exito. No se dispone tampoco de metricas comparativas frente a `lerobot/smolvla_base` u otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450 millones de parametros, los pesos ocupan aproximadamente 1,8 GB en fp32 y 0,9 GB en fp16/bf16 (coherente con el tamano de repositorio de 0,9 GB); sumando activaciones y buffer de vision, el consumo realista se situa en el rango de 2 a 4 GB segun precision y tamano de lote.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM (RTX 3050/3060, RTX 4060, RTX 4090, A100, H100). Para entrenamiento conviene una GPU con mas memoria, aunque el modelo es pequeno.
- Cabe en GPU de consumo: si, es uno de los objetivos declarados de SmolVLA; tambien podria ejecutarse en CPU para pruebas, con latencia mayor.
- Opciones de despliegue: el flujo nativo es LeRobot (`lerobot-rollout` con `--policy.path`), sobre `cuda` o CPU. No se documentan en la informacion disponible integraciones con vLLM, llama.cpp, Ollama o TGI, que estan orientadas a modelos de lenguaje y no a politicas VLA.
- Latencia y throughput: no disponibles; dependen del hardware y del bucle de control del robot. La frecuencia de datos de entrenamiento era de 5 FPS, lo que da una referencia de la cadencia de control, no de la latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kelleno96/vector_smolvla_pipeline_test | 450.046.176 | No aplica | Sin evaluacion publicada | Apache 2.0 | Hugging Face (0 descargas) |
| lerobot/smolvla_base | No disponible | No aplica | No disponible en esta informacion | Apache 2.0 (segun ecosistema LeRobot) | Hugging Face |
| Otras politicas VLA (OpenVLA, pi0, etc.) | No disponible | No aplica | No disponible | No disponible | No disponible |

La unica comparacion sustentada por la informacion proporcionada es con `lerobot/smolvla_base`, del cual este checkpoint es un fine-tuning. No se dispone de datos de parametros, contexto, rendimiento ni licencia de otras alternativas VLA a partir de la busqueda realizada, por lo que se marcan como no disponibles.

## Limitaciones y advertencias

- Modelo de prueba: entrenado con 3 pasos, 1 episodio y 20 fotogramas; no ha aprendido ninguna tarea real de robotica.
- Sin evaluacion: no existe ningun resultado de exito en tareas, ni en robot real ni en simulacion.
- Riesgo de sobreajuste extremo: con tan pocos datos, el comportamiento sera esencialmente arbitrario y no generalizara.
- Datos insuficientes para inferir sesgos: al no haber corpus textual ni un dataset amplio, no se pueden caracterizar sesgos conocidos.
- Riesgo de alucinacion (en el sentido de acciones incoherentes): alto, dado que la politica no ha sido entrenada para una tarea util.
- Inconsistencia en la model card: declara una camara (`front`) pero lista tres entradas visuales; hay que verificar las claves de observacion antes de cualquier uso.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el estado del checkpoint hace inviable un uso en produccion sin reentrenamiento.
- Multiples incognitas: no se documentan cuantizaciones, idiomas, composicion del dataset ni detalles de entrenamiento (salvo los parametros resumidos).
- Produccion: no apto. Se recomienda reentrenar sobre un dataset representativo con suficientes episodios y evaluar con ensayos repetidos antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kelleno96/vector_smolvla_pipeline_test
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/kelleno96/pipeline-test_20261004_145613
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=kelleno96/pipeline-test_20261004_145613
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
