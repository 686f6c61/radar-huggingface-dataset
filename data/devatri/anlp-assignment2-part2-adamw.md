# Devatri/anlp-assignment2-part2-adamw

## Resumen

`Devatri/anlp-assignment2-part2-adamw` es un checkpoint de un transformer denso de tipo decoder entrenado desde cero con el optimizador AdamW. No se trata de un modelo publicado para uso general, sino del artefacto de un trabajo academico (Assignment 2 - Part 2 de un curso de ANLP, Advanced Natural Language Processing). El autor lo describe como "dense LM trained with adamw" y lo entrena con una unica pasada sobre el split de entrenamiento de `browndw/human-ai-parallel-corpus`, dividido por familias de documentos.

El repositorio pesa 0,4 GB e incluye un unico fichero `checkpoint.pt` que contiene el `state_dict` del modelo (`model`), la configuracion (`model_configuration`), el estado del optimizador, el `grad_scaler` y contadores de tokens y pasos. El modelo se reconstruye con `DenseTransformer(ModelConfig(**checkpoint['model_configuration']))` a partir del `model.py` del proyecto, lo que confirma que la arquitectura es un transformer denso convencional definido por el propio autor, sin componentes MoE ni SSM.

Su relevancia es limitada y muy especifica: sirve como material reproducible para experimentos de comparacion de optimizadores. El repositorio acompana un `metrics.csv` que lista los checkpoints de cada optimizador evaluado en los rangos 0.1-1.0, de modo que este checkpoint (AdamW) es una de las variantes de una comparativa. No hay pipeline declarado, ni licencia, ni idiomas, ni tarjeta de evaluacion: es un artefacto de curso, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (`DenseTransformer`, definido en `model.py`); hiperparametros concretos no disponibles |
| Parametros totales | no disponible (el tamano del repo, 0,4 GB, incluye pesos, estado del optimizador y `grad_scaler`) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuye el checkpoint en precision de entrenamiento; no hay GGUF, AWQ ni GPTQ publicados) |
| Idiomas soportados | no disponible (el corpus de entrenamiento es `browndw/human-ai-parallel-corpus`, sin declaracion de idiomas en la model card) |
| Licencia | no disponible |
| Formato de pesos | PyTorch, fichero unico `checkpoint.pt` con `state_dict` (no safetensors, no GGUF) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso implementado por el autor en `model.py` bajo la clase `DenseTransformer`, parametrizada mediante un objeto `ModelConfig`. El checkpoint guarda ese `model_configuration`, de modo que la reconstruccion exacta del modelo es posible sin consultar el codigo fuente. No hay indicios de mezcla de expertos, atencion lineal, capas SSM ni decodificacion especulativa: la model card no menciona ninguna innovacion arquitectonica, y el nombre del repositorio enfatiza el optimizador (AdamW) mas que la topologia.

En cuanto al entrenamiento, se realizo una unica pasada (one pass) sobre el split de entrenamiento de `browndw/human-ai-parallel-corpus`, con una particion por familias de documentos para evitar filtraciones entre splits. El checkpoint conserva el estado del optimizador y el `grad_scaler`, lo que apunta a entrenamiento en precision mixta. No se documentan el numero de tokens vistos, la composicion del dataset, ni si hubo una fase posterior de ajuste por preferencias (RLHF, DPO o similar). El unico dato verificable de integridad es el SHA-256 del checkpoint: `5c59e78cfd0d1c4205d68a79ae2128636a6aa4a8bc0b6ba09f58265c4620b557`.

## Capacidades

- Generacion de texto autoregresiva: es un modelo de lenguaje denso entrenado con objetivo de modelado de lenguaje, por lo que la funcion esperada es la continuacion y generacion de texto.
- Razonamiento, matematicas y codigo: no disponible; no hay evaluaciones ni declaraciones que respalden estas capacidades.
- Tool calling / function calling: no disponible; no hay plantilla de chat, tokens especiales ni formateo de herramientas documentados.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; no se declaran idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles; es un modelo exclusivamente de texto segun la informacion disponible.
- Reproducibilidad de experimentos de optimizacion: el checkpoint incluye el estado completo del optimizador y el `grad_scaler`, lo que permite reanudar o replicar el entrenamiento.

## Casos de uso

- Reproduccion de experimentos academicos de optimizacion: el checkpoint incluye `optimizer` y `grad_scaler`, y va acompanado de un `metrics.csv` con los checkpoints de cada optimizador entre 0.1 y 1.0. Permite reconstruir la curva de entrenamiento de AdamW y compararla con las otras variantes del trabajo.
- Base para practicas de ANLP: al ser un transformer denso minimo definido en un unico `model.py`, es util como punto de partida para ejercicios de ajuste fino, analisis de atencion o modificacion de hiperparametros en un entorno controlado.
- Estudio de dinamica de entrenamiento con precision mixta: la presencia del `grad_scaler` en el checkpoint permite inspeccionar la evolucion del escalado de gradientes y su efecto en la estabilidad del entrenamiento.
- Analisis del corpus `human-ai-parallel-corpus`: al haberse entrenado sobre el, el modelo puede emplearse para estudiar que senales aprende un LM pequeno de un corpus paralelo humano-IA, por ejemplo comparando perplejidad por familia de documentos.
- Punto de comparacion en estudios sobre familias de documentos: la particion por familias de documentos en los splits hace que el checkpoint sea util para medir generalizacion entre dominios o estilos dentro del mismo corpus.
- Prototipado educativo en local: dado el reducido tamano del repo (0,4 GB) y que el unico requisito es PyTorch, puede cargarse en una maquina sin GPU para experimentos de generacion a pequena escala y depuracion de pipelines.
- Inicializacion para ajuste fino ligero: al ser un modelo denso y pequeno, puede servir como inicializacion para tareas especificas de generacion sobre dominios cercanos al corpus de origen, siempre que se asuma la ausencia de garantias de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente referencia un `metrics.csv` con checkpoints por optimizador, pero no se proporcionan los valores de perdida ni de ninguna metrica estandar (MMLU, HumanEval, GSM8K u otras) en la informacion facilitada.

## Requisitos de hardware

- VRAM para inferencia: no disponible como dato oficial. Como estimacion derivada del tamano del repositorio (0,4 GB, que incluye pesos mas estado del optimizador AdamW, dos momentos por parametro, mas el `grad_scaler`), el conjunto de pesos en precision completa estaria en el orden de las decenas de millones de parametros, lo que situaria la inferencia en unos pocos cientos de megabytes de VRAM como maximo. Esta cifra es una inferencia, no un dato publicado.
- GPU recomendadas: no disponible. Cualquier GPU con unos pocos GB de memoria, incluidas GTX 1650 o superiores, seria mas que suficiente segun esa misma estimacion.
- GPU de consumo: si cabe, con alta probabilidad, en cualquier GPU de consumo moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU, dado el tamano del artefacto.
- Opciones de despliegue: no hay pesos en safetensors ni GGUF, por lo que vLLM, llama.cpp, Ollama o TGI no pueden cargar el modelo directamente. El unico camino documentado es reconstruir el modelo en PyTorch con `DenseTransformer(ModelConfig(**checkpoint['model_configuration']))` y cargar el `state_dict`; a partir de ahi se podria exportar a safetensors o GGUF manualmente.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. Al tratarse de un checkpoint de trabajo de curso sin licencia, sin parametros publicados, sin contexto declarado y sin evaluaciones, no es posible establecer una comparacion rigurosa con alternativas publicas de la misma categoria u optimizador.

## Limitaciones y advertencias

- Ausencia de licencia: no se declara licencia alguna, por lo que no hay autorizacion explicita de uso comercial ni condiciones de redistribucion. En la practica, el modelo debe tratarse como no apto para produccion.
- Sesgos: no documentados. El modelo se entrena sobre un unico corpus (`browndw/human-ai-parallel-corpus`) en una sola pasada, sin filtrado ni mitigacion de sesgos descritos.
- Riesgo de alucinacion: presumiblemente alto. Un entrenamiento de una sola pasada sobre un corpus limitado, sin ajuste por instrucciones ni por preferencias, produce un modelo con baja fidelidad factual.
- Limitaciones de contexto e idioma: no disponibles. Al no declararse la longitud de contexto ni los idiomas, cualquier uso multilingue o con contexto largo es especulativo.
- Ausencia de alineacion: no hay indicios de RLHF, DPO ni ajuste por instrucciones, por lo que el modelo no respondera de forma fiable a instrucciones y no debe exponerse a usuarios finales.
- Formato de pesos no estandar: el `checkpoint.pt` contiene estado del optimizador y contadores de pasos ademas de los pesos, lo que obliga a extraer el `state_dict` y a disponer del `model.py` para reconstruir la arquitectura; no es cargable con `AutoModelForCausalLM`.
- Integridad del artefacto: la unica garantia tecnica es el SHA-256 declarado por el autor; verifiquelo antes de cargar el fichero.
- Cero adopcion: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado y con el repositorio creado y actualizado el mismo dia (2026-10-02), lo que sugiere un artefacto temporal sin mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Devatri/anlp-assignment2-part2-adamw
- Dataset de entrenamiento citado: https://huggingface.co/datasets/browndw/human-ai-parallel-corpus
- Paper, blog, repositorio de codigo o demo: no disponible en la informacion proporcionada (el fichero `model.py`, `metrics.csv` y `checkpoint.pt` se mencionan en la model card pero no se facilitan enlaces directos aparte del propio repositorio).
