# lealealy/FastWAM-JAX-RoboTwin-Uncond

## Resumen

FastWAM-JAX-RoboTwin-Uncond es un checkpoint de política robótica (visión-lenguaje-acción) entrenado con FastWAM-JAX, una implementación en JAX/Flax NNX del modelo Fast-WAM. El modelo parte del experto de vídeo de Wan2.2-TI2V-5B y añade un experto de acción que se entrena de forma conjunta sobre el dataset RoboTwin 2.0. En inferencia predice objetivos articulares absolutos a partir de una observación RGB, el estado articular actual y una instrucción en lenguaje natural.

Lo desarrolla el usuario lealealy y se publica como pesos en formato Orbax BF16 (9,4 GB), pensados para ejecutarse con el framework FastWAM-JAX. La variante "uncond" corresponde a la versión sin condicionamiento futuro explícito del trabajo original Fast-WAM, que investiga si los modelos de acción-mundo necesitan realmente imaginar el futuro en tiempo de inferencia.

Su relevancia radica en dos aspectos: por un lado, es una reproducción independiente en JAX de un modelo de política robótica de referencia, verificada sobre las 50 tareas de RoboTwin; por otro, demuestra que el entrenamiento es viable en TPU (una slice v6e-64) y también en GPU NVIDIA, lo que amplía las opciones de infraestructura frente a implementaciones exclusivamente PyTorch/CUDA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de acción-mundo (world action model) con experto de vídeo (difusión, inicializado desde Wan2.2-TI2V-5B) y experto de acción entrenados conjuntamente; implementación JAX/Flax NNX |
| Parametros totales | no disponible (modelo base Wan2.2-TI2V-5B; el repo pesa 9,4 GB en BF16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (condicionado por instrucción UMT5 y una observación RGB por paso) |
| Tipos de cuantizacion | BF16 (único formato publicado); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (instrucciones codificadas con UMT5) |
| Licencia | licencia Wan2.2 incluida en el repositorio (LICENSE-Wan2.2); el campo de licencia de HF figura como no disponible |
| Formato de pesos | Orbax (params_bf16_step0029365/), más VAE Orbax separado y estadísticas de normalización JSON |

## Arquitectura y entrenamiento

Fast-WAM es un modelo de acción-mundo que combina un experto de vídeo y un experto de acción. En esta variante "uncond" ambos expertos se entrenan de forma conjunta, y en inferencia la política produce directamente objetivos articulares absolutos a partir de la imagen RGB compuesta, el estado articular (qpos) y un embedding de instrucción UMT5 con padding a cero y máscara booleana. El experto de vídeo se inicializa desde Wan2.2-TI2V-5B; el checkpoint incluye además el experto de acción y el codificador de propriocepción. Para la inferencia se requiere el VAE congelado de Wan2.2 y el fichero dataset_stats.json con las estadísticas de normalización de RoboTwin.

El entrenamiento se realizó durante cinco épocas sobre el dataset Fast-WAM RoboTwin, con una slice de Google Cloud TPU v6e-64 (64 chips en 16 VMs) y batch global de 1.024. Se midieron 1,392 s por actualización en régimen estable a lo largo de 26.938 actualizaciones, con un total de 29.365 actualizaciones y unas 11 h 21 min de entrenamiento. El autor verifica además que la implementación JAX puede entrenar en GPUs NVIDIA. No se detalla en la información disponible la composición exacta del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Predicción de acciones robóticas: genera objetivos articulares absolutos para control de manipuladores a partir de observación RGB y estado articular.
- Condicionamiento por lenguaje: acepta instrucciones en lenguaje natural codificadas con UMT5.
- Fusión visión-lenguaje-acción en un único modelo entrenado de extremo a extremo.
- Entrenamiento conjunto de experto de vídeo y experto de acción (paradigma world action model).
- Ejecución en JAX sobre TPU y GPU NVIDIA; pesos en BF16 Orbax.
- Evaluación validada en las 50 tareas de RoboTwin 2.0, en condiciones clean y randomized.
- No se documentan en la información disponible capacidades de tool calling, agentes multi-paso, audio ni modos de razonamiento explícito.

## Casos de uso

- Manipulación robótica en simulación RoboTwin: el modelo se usa como política para resolver las 50 tareas del benchmark, recibiendo la imagen renderizada y el estado articular en cada paso; es su escenario de evaluación nativo.
- Investigación en world action models: sirve para reproducir y comparar la variante "uncond" de Fast-WAM frente al checkpoint oficial convertido a JAX, con resultados medidos sobre los mismos escenarios.
- Transferencia sim-to-real experimental: al predecir objetivos articulares absolutos desde RGB, puede integrarse en pipelines de aprendizaje por imitación que después se adapten a un robot físico.
- Benchmarking de infraestructura JAX: útil para medir throughput y latencia de políticas robóticas en TPU v6e y en GPUs NVIDIA con el mismo código.
- Control condicionado por instrucciones: en entornos donde un operador describe la tarea en lenguaje natural y el robot debe ejecutarla, el modelo traduce instrucción más observación en acciones.
- Base para fine-tuning en dominios propios: al estar los pesos en Orbax y el código en FastWAM-JAX, se puede partir de este checkpoint para reentrenar sobre nuevos datasets de manipulación.
- Evaluación de robustez: los resultados en modo randomized (con iluminación y escenas alteradas mediante OIDN) permiten estudiar la degradación del modelo ante variaciones visuales.

## Benchmarks y rendimiento

Evaluación sobre las 50 tareas de RoboTwin, con 25 semillas de escena emparejadas por tarea y ajuste (1.250 ensayos por condición). Los ensayos randomized usaron OIDN 2.3.3 con la misma instrucción no vista y escena inicial para cada par.

| Checkpoint | Clean | Randomized |
|---|---:|---:|
| FastWAM-JAX, step 29.365 | 92,24% (1.153/1.250) | 91,04% (1.138/1.250) |
| Checkpoint oficial convertido a JAX | 91,92% (1.149/1.250) | 90,40% (1.130/1.250) |
| Fast-WAM (paper, 100 ensayos por tarea y ajuste) | 91,88% | 91,78% |

Rendimiento de entrenamiento medido: 1,392 s por actualización en régimen estable (TPU v6e-64, batch global 1.024); 29.365 actualizaciones en aproximadamente 11 h 21 min. No se publican datos de latencia de inferencia ni de throughput.

## Requisitos de hardware

- Pesos en BF16 con un repositorio de 9,4 GB, más el VAE de Wan2.2 descargado por separado; la VRAM necesaria para inferencia no se especifica en la información disponible.
- Entrenamiento validado en Google Cloud TPU v6e-64 (64 chips, 16 VMs); el autor confirma que la implementación JAX también entrena en GPUs NVIDIA.
- No se documenta si el modelo cabe en GPUs de consumo (RTX 4090, etc.); dado el tamaño del experto de vídeo (base de 5B) y el VAE adicional, se requiere verificación empírica.
- Despliegue mediante el propio framework FastWAM-JAX (Python 3.12, `uv`, extra `cuda` para GPU), con descarga de assets vía `huggingface-hub`. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política robótica.
- Latencia y throughput de inferencia: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento RoboTwin | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FastWAM-JAX-RoboTwin-Uncond (este) | no disponible (base 5B) | no disponible | 92,24% clean / 91,04% randomized | Wan2.2 | Pesos Orbax en HF, framework JAX |
| Fast-WAM oficial (convertido a JAX en la evaluación) | mismo diseño | no disponible | 91,92% clean / 90,40% randomized | la del proyecto original (no disponible aquí) | Checkpoint oficial del paper |
| Fast-WAM (resultados del paper) | mismo diseño | no disponible | 91,88% clean / 91,78% randomized | no disponible | Publicación arXiv |

No se dispone de información sobre otras políticas robóticas comparables (por ejemplo, variantes de VLA) en los datos proporcionados, por lo que la comparativa se limita a las tres entradas anteriores.

## Limitaciones y advertencias

- El campo de licencia en Hugging Face figura como no disponible; el repositorio incluye únicamente la licencia de Wan2.2, por lo que las condiciones exactas de uso comercial deben verificarse en ese fichero antes de desplegar.
- Modelo entrenado específicamente sobre RoboTwin 2.0; su generalización fuera de ese entorno y de los robots de dicho benchmark no está demostrada.
- Los resultados randomized se obtuvieron con OIDN 2.3.3 y escenas emparejadas; no cubren todas las condiciones de variabilidad posibles en un entorno real.
- La variante "uncond" prescinde del condicionamiento futuro explícito; su comportamiento frente a variantes condicionadas no se compara en la información disponible.
- No se documentan sesgos conocidos, tasas de alucinación ni cobertura idiomática; la instrucción se procesa vía UMT5 sin especificar idiomas soportados.
- Requiere una cadena de dependencias concreta (VAE Orbax congelado, estadísticas de normalización y codificador UMT5 con el extra `convert`); un desajuste en cualquiera de ellas invalida las acciones predichas.
- El checkpoint corresponde a un paso concreto (step 29.365); no se publican otras revisiones ni curvas de entrenamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lealealy/FastWAM-JAX-RoboTwin-Uncond
- Modelo base Wan2.2-TI2V-5B: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- VAE Orbax de Wan2.2: https://huggingface.co/lealealy/Wan2.2-TI2V-5B-Orbax
- Dataset Fast-WAM RoboTwin: https://huggingface.co/datasets/yuanty/robotwin2.0-fastwam
- Estadísticas de normalización: https://huggingface.co/datasets/yuanty/robotwin2.0-fastwam/blob/aac262c35d02cc71b2f6ef670bd65fd9f2bb2547/dataset_stats.json
- Repositorio FastWAM: https://github.com/yuantianyuan01/FastWAM
- Paper Fast-WAM (arXiv 2603.16666): https://arxiv.org/abs/2603.16666
- Tabla 1 del paper: https://arxiv.org/html/2603.16666v1#S4
