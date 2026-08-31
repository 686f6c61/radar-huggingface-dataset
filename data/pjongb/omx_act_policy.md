# pjongb/omx_act_policy

## Resumen

El modelo `pjongb/omx_act_policy` es una política de imitación para control robótico basada en Action Chunking with Transformers (ACT), una arquitectura propuesta en el paper arXiv:2304.13705. Ha sido entrenado y publicado mediante el framework LeRobot de Hugging Face, utilizando el dataset de teleoperación `pjongb/pick_and_place2_2`, orientado a tareas de pick and place con un brazo robótico tipo SO-100. Con 51,7 millones de parámetros, es un modelo compacto diseñado para ejecutarse en hardware modesto y para ser integrado en pipelines de robótica de código abierto.

La relevancia de este modelo radica en su naturaleza open source (licencia Apache 2.0) y en su integración directa con el ecosistema LeRobot, lo que permite reproducir el entrenamiento, evaluarlo en simuladores o robots reales y adaptarlo a nuevas tareas con relativamente pocos datos. Al tratarse de una política ACT, predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación frente a métodos de predicción paso a paso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers, transformer con CVAE) |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors) |
| Idiomas soportados | No aplica (modelo de vision-accion, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion que combina un transformer con un autoencoder variacional condicional (CVAE). La red codifica observaciones (imagenes y estados) y genera una secuencia de acciones futuras (action chunk) de longitud fija. Durante el entrenamiento se utiliza un dataset de teleoperacion, y en este caso concreto el dataset `pjongb/pick_and_place2_2` contiene episodios de una tarea de pick and place. El modelo se entrena con el framework LeRobot, que gestiona el dataset, el bucle de entrenamiento y la evaluacion. No se han facilitado detalles sobre el numero de tokens de entrenamiento, composicion exacta del dataset ni el uso de tecnicas de refinamiento como RLHF o DPO, ya que al ser un modelo de politica robotica no aplican esos paradigmas.

Entre las innovaciones tecnicas destacables de ACT se encuentra la prediccion por chunks, que reduce la acumulacion de errores en la ejecucion de la politica, y el uso de una variable latente para modelar la variabilidad de las demostraciones. No se dispone de informacion adicional sobre tecnicas especificas empleadas en este entrenamiento concreto (por ejemplo, aumento de datos, normalizacion, etc.).

## Capacidades

- Control robotico por imitacion: predice secuencias de acciones (action chunks) para un brazo robotico a partir de observaciones visuales y de estado.
- Tarea de pick and place: el modelo esta entrenado para recoger y colocar objetos, segun el dataset utilizado.
- Integracion con LeRobot: permite cargar, evaluar y desplegar la politica mediante las herramientas estandar de LeRobot.
- Procesamiento de imagenes: las observaciones incluyen datos visuales, por lo que el modelo tiene capacidad de percepcion visual para la tarea.
- No genera texto ni tiene capacidades de lenguaje, tool calling, agentes o razonamiento simbolico.

## Casos de uso

- Automatizacion de tareas de pick and place en entornos de laboratorio: el modelo puede integrarse en un brazo SO-100 para trasladar objetos entre posiciones fijas, sustituyendo la programacion manual por aprendizaje por demostracion.
- Prototipado rapido de politicas robotica: con LeRobot, un investigador puede entrenar y evaluar esta politica en pocas horas sobre un dataset propio, gracias al tamano reducido del modelo (51 M de parametros) que acelera el ciclo de iteracion.
- Investigacion en aprendizaje por imitacion: sirve como base para comparar variantes de ACT, modificar la arquitectura o estudiar el efecto del tamaño del dataset en la tasa de exito.
- Despliegue en robots de bajo coste: al ser un modelo pequeño, puede ejecutarse en una GPU modesta o incluso en CPU (aunque con menor velocidad), habilitando experimentos en entornos con recursos limitados.
- Generacion de datos para entrenamiento: la politica puede usarse para ejecutar episodios de forma autonoma y recopilar datos adicionales, que luego se filtran o se utilizan para entrenar politicas mas robustas.
- Educacion en robotica: por su simplicidad y documentacion, es un ejemplo didactico para ensenar conceptos de imitacion learning, action chunking y evaluacion de politicas con LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de tasas de exito, metricas de error ni comparaciones con otras politicas para este modelo especifico.

## Requisitos de hardware

- Tamano del modelo: 51,7 millones de parametros (~0,6 GB en safetensors), lo que implica un consumo de VRAM estimado inferior a 2 GB en precision FP32 para inferencia, y considerablemente menor en cuantizaciones (aunque no se proporcionan pesos cuantizados).
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060, etc.) es suficiente para inferencia. Para entrenamiento, se recomienda al menos 4-6 GB de VRAM.
- Compatibilidad con consumer GPU: si, el modelo cabe en practicamente cualquier GPU moderna de consumo.
- Opciones de despliegue: LeRobot ofrece scripts de evaluacion e inferencia (por ejemplo, `lerobot-record`). No se ha confirmado compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Al ser un modelo pequeño, se espera una latencia de pocos milisegundos por paso de inferencia en GPU, pero depende del hardware y de la implementacion.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables especificos dentro del ecosistema LeRobot para esta tarea. No obstante, se puede mencionar que otras politicas de imitacion como Diffusion Policy o ACT con diferentes tamaños existen en la literatura, pero no hay datos de rendimiento disponibles para establecer una comparacion cuantitativa con este modelo.

## Limitaciones y advertencias

- Especificidad de la tarea: el modelo esta entrenado exclusivamente para la tarea de pick and place con el dataset `pjongb/pick_and_place2_2`. No generaliza a otras tareas sin reentrenamiento.
- Dependencia del entorno: su rendimiento depende de la configuracion del robot (calibracion, posicion de la camara, iluminacion, etc.) que coincida con las condiciones de recogida de datos.
- Riesgo de sobreajuste: dado que el dataset es probablemente pequeno (no se especifica el numero de episodios), puede haber sobreajuste a las demostraciones concretas.
- Sin capacidades linguisticas: no es un modelo multimodal de lenguaje, por lo que no puede interpretar instrucciones textuales ni razonar.
- Alucinacion: no aplica, pero la politica puede ejecutar acciones incorrectas si las observaciones estan fuera de distribucion.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, pero se debe mantener el aviso de copyright.
- Mantenimiento: el modelo tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad; se recomienda probarlo en entornos controlados antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pjongb/omx_act_policy
- Paper ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Dataset usado: https://huggingface.co/datasets/pjongb/pick_and_place2_2
