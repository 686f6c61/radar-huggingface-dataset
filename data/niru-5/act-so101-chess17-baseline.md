# niru-5/act-so101-chess17-baseline

## Resumen

`niru-5/act-so101-chess17-baseline` es una politica de aprendizaje por imitacion basada en el metodo Action Chunking with Transformers (ACT), publicada por el usuario niru-5 y entrenada con el framework LeRobot de Hugging Face. No es un modelo de lenguaje, sino una politica robotica de vision y estado a accion: recibe el estado articular del robot y dos flujos de imagen (camara de muneca y camara superior) y produce comandos de accion de 6 grados de libertad. Su funcion es controlar un brazo robotico SO-101 para ejecutar la tarea "Play chess" (jugar al ajedrez) a partir de demostraciones teleoperadas.

El modelo tiene 51.668.614 parametros (unos 51,7 millones) almacenados en formato safetensors, con un repositorio de 0,2 GB. Se entrena sobre el dataset `Cornito/so101_chess17`, compuesto por 190 episodios y 137.956 fotogramas a 30 FPS. La relevancia de esta ficha radica en que documenta un caso concreto de politica ACT de bajo coste computacional, reproducible con la herramienta `lerobot-rollout`, util para quienes quieren evaluar flujos de imitation learning en robotica de escritorio.

La nomenclatura "baseline" del nombre sugiere que se trata de una referencia base para futuras iteraciones o comparaciones sobre la misma tarea. No se han publicado resultados de evaluacion ni benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador CVAE y backbone visual |
| Parametros totales | 51.668.614 (aproximadamente 51,7 M) |
| Longitud de contexto | no aplica (politica robotica; no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no aplica (entrada visual y de estado; tarea descrita en ingles como "Play chess") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Tipo de robot | so101 |
| Camaras de entrada | `wrist` y `top` |
| Entradas | `observation.state` (6,), `observation.images.wrist` (3, 480, 640), `observation.images.top` (3, 480, 640) |
| Salidas | `action` (6,) |
| Tamano del repositorio | 0,2 GB |
| Dataset de entrenamiento | Cornito/so101_chess17 (190 episodios, 137.956 fotogramas, 30 FPS) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un metodo de imitation learning que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulacion y mejora la estabilidad del control. La arquitectura combina un backbone visual para procesar las dos camaras (imagenes de 480x640 en color), un codificador de estado, un transformer encoder y un decodificador con una componente CVAE (autoencoder variacional condicional) que permite modelar la multimodalidad de las demostraciones humanas. El modelo fue introducido en el articulo con identificador arXiv 2304.13705.

El entrenamiento se realizo con LeRobot 0.6.1 durante 10.000 pasos, con tamano de lote 32, optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000. Los datos provienen de 190 episodios teleoperados de la tarea "Play chess" sobre un robot SO-101, con dos camaras. No se documenta en la informacion disponible el numero exacto de tokens ni una fase de RLHF o DPO, ya que se trata de aprendizaje por imitacion supervisado y no de ajuste por preferencias.

## Capacidades

- Generacion de acciones de control de 6 grados de libertad para el brazo SO-101 a partir de observaciones multimodales (estado articular e imagenes).
- Percepcion visual mediante dos camaras simultaneas (muneca y superior) a resolucion 480x640.
- Ejecucion de la tarea concreta "Play chess" tal como fue demostrada en el dataset de entrenamiento.
- Prediccion de action chunks, que permite un control mas suave y coherente que la prediccion paso a paso.
- Integracion con el ecosistema LeRobot para despliegue mediante `lerobot-rollout` y reentrenamiento mediante `lerobot-train`.
- No dispone de tool calling, function calling, razonamiento multi-paso simbolico ni capacidades de lenguaje: es una politica robotica de vision-estado a accion.
- No se documentan capacidades multilingues, de audio ni modos de "thinking".

## Casos de uso

- Investigacion en imitation learning: sirve como linea base reproducible para comparar variantes de ACT o de Diffusion Policy sobre la misma tarea de ajedrez y el mismo robot SO-101.
- Manipulacion robotica de escritorio de bajo coste: permite demostrar flujos completos de recogida de datos, entrenamiento y despliegue en un brazo comercial asequible.
- Recogida y validacion de pipelines de datos: al estar vinculado al dataset `Cornito/so101_chess17`, se usa para verificar que un conjunto de demostraciones teleoperadas produce una politica funcional.
- Educacion y prototipado: adecuado para ensenar conceptos de aprendizaje por imitacion y control visomotor en entornos academicos, dado su reducido coste computacional y su integracion directa con LeRobot.
- Punto de partida para reentrenamiento (fine-tuning): al ser una baseline, puede reentrenarse con nuevos datasets o tareas modificando el comando `lerobot-train`.
- Evaluacion de robustez ante variaciones: permite estudiar como se comporta una politica ACT ante cambios de posicion de objetos, iluminacion o distractores en la mesa de ajedrez.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica ("No evaluation results have been provided for this policy yet") y la tabla de evaluacion en robot real aparece vacia.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada. Con 51,7 millones de parametros y dos flujos de imagen a 480x640, se estima un consumo modesto (habitualmente por debajo de unos pocos gigabytes), aunque el dato no esta confirmado en la informacion disponible.
- GPU recomendadas: no especificadas por el autor. Por tamano del modelo, es compatible con GPU de consumo modernas con soporte CUDA (por ejemplo, gama RTX 30/40) y con GPU de datacenter (A100, H100) sin aprovechar su capacidad completa.
- Compatibilidad con GPU de consumo: previsiblemente si, dada la reducida cuenta de parametros; no confirmado en la documentacion.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=niru-5/act-so101-chess17-baseline`), PyTorch sobre CUDA o CPU. No aplican vLLM, llama.cpp, Ollama ni TGI, que son herramientas para modelos de lenguaje.
- Latencia y throughput estimados: no disponible. El dataset de entrenamiento se registro a 30 FPS, pero no se documentan cifras de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Enfoque | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| niru-5/act-so101-chess17-baseline | ACT (imitation learning) | 51,7 M | Estado (6,) + 2 camaras 480x640 | apache-2.0 | Hugging Face (lerobot) |
| Otras politicas ACT en LeRobot | ACT | no disponible | no disponible | variable | Hugging Face |
| Diffusion Policy | Diffusion para control | no disponible | no disponible | no disponible | repositorio academico |

Las alternativas de la misma categoria (otras politicas ACT o Diffusion Policy) existen en el ecosistema LeRobot y en la literatura, pero no se dispone en la informacion proporcionada de sus parametros, contexto o rendimiento para una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Sin resultados de evaluacion publicados: no hay evidencia cuantitativa de tasa de exito en robot real.
- Especifica de una tarea: entrenada exclusivamente para "Play chess" sobre el dataset indicado; no se espera generalizacion a otras tareas sin reentrenamiento.
- Dependencia del hardware: requiere un robot SO-101 y la configuracion exacta de camaras (`wrist` y `top`) con las claves de observacion usadas en el entrenamiento.
- Riesgo de sobreajuste al entorno de demostracion: cambios de iluminacion, posicion de objetos, distractores o un robot distinto del mismo tipo pueden degradar el comportamiento.
- Sin datos de sesgos: no se documenta analisis de sesgos, aunque al ser una politica visomotora el riesgo se refiere a condiciones de percepcion, no a sesgos linguisticos.
- Riesgo de acumulacion de error en tareas largas: pese al uso de action chunks, el despliegue prolongado puede derivar en fallos.
- Licencia apache-2.0: permite uso comercial y modificacion, siempre que se cumplan las condiciones de la licencia y se cite el metodo ACT y LeRobot.
- Sin datos de cuantizacion ni de idioma: no aplican cuantizaciones publicadas ni soporte multilingue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/niru-5/act-so101-chess17-baseline
- Dataset de entrenamiento: https://huggingface.co/datasets/Cornito/so101_chess17
- Paper de ACT (arXiv 2304.13705): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de despliegue (inferencia): https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Cornito/so101_chess17
