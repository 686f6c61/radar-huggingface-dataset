# hggforget/lingbotvla-robotwin-clean-sft

## Resumen

LingbotVLA — RoboTwin Clean SFT Checkpoints (`hggforget/lingbotvla-robotwin-clean-sft`) es un repositorio de puntos de control de ajuste supervisado (SFT) del modelo `LingbotVLA v2`, una política de vision-language-action (VLA) desarrollada por el autor hggforget sobre el backbone visual-lenguaje Qwen3-VL-4B-Instruct. El modelo resuelve el problema de generar acciones motoras de robot a partir de observaciones visuales e instrucciones en lenguaje natural, siguiendo el paradigma de imitation learning: se entrena sobre demostraciones y produce secuencias de acciones de bajo nivel.

La arquitectura `LingbotVlaV2Policy` combina un backbone VLM Qwen3-VL-4B con una capa MoE a nivel de token (32 expertos, top-4) y una cabeza de acción dedicada (dim 128, 32 cabezas de atención) con atención flex/block-causal. El espacio de acción es de dimensión 55, con `chunk_size = 50` y `n_obs_steps = 1`, y la pérdida empleada es `L1_fm`. El entrenamiento usa el dataset RoboTwin 2.0 en formato LeRobot, configuración `demo_clean` y subconjunto clean-only, con aproximadamente 549 000 frames.

Su relevancia actual radica en que RoboTwin 2.0 se ha consolidado como banco de pruebas de manipulación robótica bimanual, y este repositorio publica no solo 12 checkpoints independientes (cada 1000 pasos, de 1000 a 12 000) sino también los artefactos completos de entrenamiento y evaluación, incluyendo estadísticas de normalización, curvas de TensorBoard y registros de evaluación. El checkpoint `global_step_10000` reporta una tasa de éxito global del 74,0 % (370/500) en el protocolo de evaluación de RoboTwin 2.0 con instrucciones vistas. La licencia Apache 2.0 facilita su reutilización, aunque el repositorio pesa 264,4 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `LingbotVlaV2Policy` (model_type `lingbotvla`): backbone VLM Qwen3-VL-4B con MoE a nivel de token (32 expertos, top-4) y cabeza de accion dedicada (dim 128, 32 cabezas de atencion); atencion flex/block-causal |
| Parametros totales | no disponible (el backbone VLM es Qwen3-VL-4B-Instruct, ~4B; el total incluyendo los 32 expertos MoE y la cabeza de accion no se especifica en la informacion proporcionada) |
| Parametros activos | no disponible (MoE con top-4 sobre 32 expertos; no se indica el recuento de parametros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la evaluacion se realizo en fp32; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors fragmentados (`model-*.safetensors` + `model.safetensors.index.json`), formato HF |
| Espacio de accion | `action_dim = 55`, `chunk_size = 50`, `n_obs_steps = 1`, perdida `L1_fm` |
| Dataset de entrenamiento | RoboTwin 2.0 LeRobot, configuracion `demo_clean`, subconjunto clean-only, ~549 000 frames |
| Checkpoints incluidos | 12 (`global_step_1000` a `global_step_12000`, cada 1000 pasos) |
| Tamano del repositorio | 264,4 GB |
| Libreria | transformers (requiere `transformers >= 4.57`) |
| Pipeline declarado | robotics |
| Idioma de la model card | no disponible (la ficha esta en ingles) |
| Fecha de creacion / actualizacion | 2026-10-16 / 2026-10-16 |

## Arquitectura y entrenamiento

El modelo se construye sobre `LingbotVlaV2Policy`, un tipo de modelo personalizado (`model_type: lingbotvla`) que no forma parte del catalogo estandar de transformers. Sobre el backbone Qwen3-VL-4B-Instruct se anade una capa MoE a nivel de token con 32 expertos y enrutamiento top-4, junto con una cabeza de accion dedicada de dimension 128 y 32 cabezas de atencion. La atencion del modelo es de tipo flex/block-causal, lo que permite enmascaramiento en bloque adecuado para secuencias de observacion-accion. La inferencia del vision tower requiere flash-attention-2. El modelo consume una unica observacion por paso (`n_obs_steps = 1`) y emite chunks de 50 acciones de dimension 55, entrenado con una perdida L1 de flow matching (`L1_fm`).

El entrenamiento es de tipo imitation learning supervisado (SFT) sobre el dataset RoboTwin 2.0 en formato LeRobot, configuracion `demo_clean` y subconjunto exclusivamente limpio (clean-only) de aproximadamente 549 000 frames. Se publican 12 checkpoints separados por 1000 pasos de entrenamiento, lo que permite estudiar la evolucion de la politica. El repositorio incluye las estadisticas de normalizacion (`robotwin_clean_norm.json`, con su `.sha256`), los ficheros de configuracion de lanzamiento (`lingbotvla_cli.yaml`, `launch/`), los activos de tokenizer y preprocesador (`model_assets/`), las curvas de TensorBoard (`runs/`), capturas de visualizacion de entrenamiento (`images/`) y los registros de evaluacion (`eval/`). No se incluyen los estados del optimizador ni los pesos en formato de entrenamiento sin convertir. La informacion disponible no detalla si hubo fases de RLHF, DPO u otros ajustes posteriores al SFT, ni la composicion exacta del dataset mas alla de su origen en RoboTwin 2.0.

## Capacidades

- Generacion de acciones roboticas a partir de observaciones visuales y consignas en lenguaje natural, en el marco de una politica VLA de imitacion.
- Manipulacion bimanual en el entorno simulado RoboTwin 2.0, con espacio de accion continuo de dimension 55.
- Prediccion de secuencias de accion en chunks de 50 pasos (`chunk_size = 50`), lo que permite planificacion de horizonte corto por inferencia.
- Condicionamiento por instrucciones: la evaluacion se realizo con instrucciones "vistas" (`seen`) del conjunto de tareas de RoboTwin 2.0.
- Comprension visual-lenguaje heredada del backbone Qwen3-VL-4B-Instruct, reutilizando su tokenizer y su preprocesador de video.
- Capacidad de enrutamiento condicional mediante MoE a nivel de token (32 expertos, top-4), lo que reparte la capacidad parametrica entre subconjuntos de expertos.
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado; el modelo es una politica de accion, no un agente conversacional).
- Capacidades multilingues: no disponible (no se documenta el soporte de idiomas de las instrucciones).
- Modo de razonamiento explicito (thinking), vision o audio mas alla del backbone: no disponible.

## Casos de uso

- Investigacion en imitation learning: usar los 12 checkpoints publicados para analizar la curva de aprendizaje de una politica VLA a lo largo del entrenamiento (de 1000 a 12 000 pasos) y estudiar cuando se satura la tasa de exito.
- Evaluacion comparativa en RoboTwin 2.0: emplear el checkpoint `global_step_10000` como linea base reproducible (74,0 % de exito, 50 tareas x 10 episodios, config `demo_clean`, instrucciones vistas) frente a otras politicas sobre el mismo banco de pruebas.
- Manipulacion bimanual simulada: entrenar o afinar politicas para tareas de dos brazos en el simulador, aprovechando que el modelo ya predice acciones de dimension 55 y chunks de 50 pasos.
- Generacion de datos sinteticos y refuerzo del dataset: ejecutar la politica sobre RoboTwin 2.0 para ampliar el conjunto de demostraciones o para identificar tareas donde falla y dirigir la recoleccion de nuevos datos.
- Estudio de sim-to-real: partir de esta politica preentrenada en simulacion como inicializacion para un ajuste posterior con datos de un robot real, dado que el repositorio es de licencia Apache 2.0 y el formato es compatible con transformers.
- Reutilizacion del backbone VLM: aprovechar los pesos y artefactos del backbone Qwen3-VL-4B-Instruct integrados en este repositorio para otras tareas visual-lenguaje, sujeto a la licencia del modelo base.
- Analisis de componentes arquitectonicos: evaluar el efecto del enrutamiento MoE (32 expertos, top-4) y de la atencion flex/block-causal en el rendimiento final, ya que se publican las curvas de entrenamiento y los logs.
- Despliegue en pipelines de robotica con la libreria transformers (`transformers >= 4.57`), apuntando el punto de entrada de politica/evaluacion a un subdirectorio de checkpoint concreto y pasando el fichero de estadisticas de normalizacion.

## Benchmarks y rendimiento

Los unicos resultados cuantitativos publicados en la informacion disponible corresponden a la evaluacion en RoboTwin 2.0 del checkpoint `global_step_10000`. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

| Benchmark | Protocolo | Checkpoint | Resultado |
|---|---|---|---|
| RoboTwin 2.0 | 50 tareas x 10 episodios, config `demo_clean`, instrucciones `seen`, fp32 + compile, 7 slots de inferencia GPU | `global_step_10000` | 370 / 500 = 74,0 % de exito (evaluado el 2026-10-16) |

No se proporcionan resultados por tarea ni desgloses por dificultad, ni la tasa de exito de los restantes 11 checkpoints.

## Requisitos de hardware

Los requisitos exactos no estan documentados en la informacion proporcionada; las cifras siguientes son estimaciones derivadas y deben tratarse como orientativas.

- Tamano por checkpoint: el repositorio total es de 264,4 GB para 12 checkpoints mas artefactos; asumiendo un reparto aproximadamente uniforme, cada checkpoint rondaria los 22 GB, aunque esta cifra no esta confirmada por el autor.
- VRAM estimada para inferencia: no disponible de forma oficial. Para un checkpoint de ese orden de magnitud en fp32 o bf16, se necesitarian previsiblemente entre 24 GB y 80 GB de VRAM, dependiendo de la precision y del soporte de cuantizacion, que no esta documentado.
- GPU recomendadas: no disponibles oficialmente. Por tamano y por el requisito de flash-attention-2 y atencion flex, son razonables GPU de centro de datos tipo A100 de 80 GB o H100; no hay confirmacion del autor.
- GPU de consumo: no confirmado. Una RTX 4090 de 24 GB podria ser insuficiente sin cuantizacion, y el modelo no documenta variantes cuantizadas.
- Precision de evaluacion: fp32 con `compile`, lo que eleva notablemente los requisitos de memoria frente a una ejecucion en bf16.
- Opciones de despliegue: la ruta documentada es la base de codigo `lingbot-vla-v2` (tipo de modelo personalizado `lingbotvla`) sobre `transformers >= 4.57`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Numero de slots de inferencia en la evaluacion publicada: 7 procesos de inferencia en GPU en paralelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han identificado en la informacion proporcionada modelos comparables con datos verificables (parametros, contexto, rendimiento o licencia) que permitan una comparacion rigurosa. Como referencia interna, el propio modelo declara como base `Qwen/Qwen3-VL-4B-Instruct`, del que hereda el backbone visual-lenguaje, el tokenizer y el preprocesador de video, pero se trata del modelo base y no de una politica VLA comparable en tarea.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lingbotvla-robotwin-clean-sft | no disponible (backbone ~4B + MoE 32 expertos) | no disponible | 74,0 % de exito en RoboTwin 2.0 (50 tareas x 10 episodios, checkpoint 10000) | apache-2.0 | HuggingFace, 0 descargas, 1 like |
| Qwen/Qwen3-VL-4B-Instruct (modelo base) | ~4B | no disponible | no disponible | no disponible en la informacion proporcionada | HuggingFace |
| Otros modelos VLA de manipulacion | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de investigacion con muy baja adopcion: 0 descargas y 1 like en el momento de la consulta, lo que implica ausencia de validacion externa de la comunidad.
- Requiere codigo personalizado: el tipo de modelo `lingbotvla` no es nativo de transformers, por lo que la carga depende de la base de codigo `lingbot-vla-v2`; no es un modelo plug-and-play.
- Dependencias estrictas: `transformers >= 4.57`, flash-attention-2 para el vision tower y soporte de atencion flex, lo que restringe el hardware y las versiones de bibliotecas compatibles.
- Dominio muy acotado: entrenado exclusivamente con el subconjunto clean-only de RoboTwin 2.0 (`demo_clean`, ~549 000 frames) en simulacion; no hay evidencia publicada de transferencia a robots reales.
- Evaluacion limitada a instrucciones "vistas" (`seen`): no se publican resultados con instrucciones no vistas, lo que impide estimar la generalizacion a ordenes novedosas.
- Rendimiento del 74,0 % de exito: implica que aproximadamente una de cada cuatro ejecuciones falla en el protocolo evaluado, cifra relevante para cualquier uso en produccion.
- Riesgo de alucinacion: no aplica en el sentido conversacional, pero la politica puede generar secuencias de accion plausibles pero fisicamente invalidas o no alineadas con la instruccion.
- Sesgos: no documentados por el autor; al entrenarse sobre un unico simulador y un unico conjunto de tareas, cabe esperar un sesgo hacia las distribuciones de esa simulacion y hacia sus objetos, escenas y morfologias.
- Idiomas soportados: no disponibles; no se especifica en que idioma deben formularse las instrucciones, aunque el backbone base sugiere cobertura multilingue sin garantia.
- Longitud de contexto: no documentada, lo que dificulta planificar tareas que requieran historial largo de observaciones (`n_obs_steps = 1`).
- Cuantizacion: no se documentan formatos cuantizados (GGUF, AWQ, GPTQ), lo que complica el despliegue en hardware limitado.
- Licencia: Apache 2.0 permite uso comercial del repositorio, pero conviene verificar las condiciones del modelo base Qwen3-VL-4B-Instruct y de la base de codigo `lingbot-vla-v2` por separado.
- Artefactos incompletos para reentrenamiento: no se incluyen los estados del optimizador ni los pesos en formato de entrenamiento sin convertir, por lo que no es posible reanudar el entrenamiento tal cual desde estos checkpoints.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hggforget/lingbotvla-robotwin-clean-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Base de codigo `lingbot-vla-v2` (referenciada en la model card): https://github.com/lingbot-ai/lingbot-vla-v2
- Paper, blog o demo adicionales: no disponibles; los resultados de la busqueda web realizada no contienen enlaces relevantes para este modelo.
