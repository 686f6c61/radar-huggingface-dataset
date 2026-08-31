# saipuneethgottam/smolvla_sort_100demos_3view

## Resumen

SmolVLA es un modelo de vision-lenguaje-accion (VLA) compacto desarrollado por Hugging Face, con solo 450 millones de parametros, disenado para desplegarse en hardware de consumo. Este repositorio concreto, `saipuneethgottam/smolvla_sort_100demos_3view`, es un ajuste fino (fine-tune) del modelo base `lerobot/smolvla_base` sobre un dataset de 100 demostraciones de una tarea de clasificacion/ordenamiento con tres vistas de camara, publicado por Sai Puneeth Reddy Gottam.

El modelo combina un VLM (vision-language model) preentrenado compacto con un experto de acciones entrenado mediante flow matching. Dadas multiples imagenes y una instruccion en lenguaje natural, el modelo genera un fragmento (chunk) de acciones de control para el robot. Su relevancia radica en que democratiza la robotica de aprendizaje por imitacion, permitiendo entrenar y ejecutar politicas de control en GPUs de gama de consumo, algo que los VLA mas grandes (con miles de millones de parametros) no permiten.

El ajuste fino se realizo con la libreria LeRobot de Hugging Face, lo que facilita la reproducibilidad y la integracion con pipelines de robotica existentes. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (Vision-Language-Action) basada en SmolVLA: VLM compacto + experto de acciones con flow matching |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, FP32/FP16 presumiblemente) |
| Idiomas soportados | No disponibles (instrucciones en ingles presumiblemente, segun el paper de SmolVLA) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (via LeRobot) |

## Arquitectura y entrenamiento

SmolVLA se compone de dos partes principales: un VLM preentrenado compacto que procesa multiples imagenes y una instruccion textual, y un experto de acciones entrenado con flow matching que genera un chunk de acciones de control. El modelo base fue preentrenado a gran escala y posteriormente ajustado para robotica. Este repositorio concreto es un fine-tune del modelo base `lerobot/smolvla_base` sobre el dataset `saipuneethgottam/sort_100demos_3view`, que contiene 100 demostraciones de una tarea de ordenamiento capturadas con tres vistas de camara.

El entrenamiento se realizo con la libreria LeRobot, que gestiona el dataset, el entrenamiento y la publicacion del modelo. El pipeline de entrenamiento sigue el flujo estandar de LeRobot para politicas de aprendizaje por imitacion, con checkpoints guardados en el directorio de salida. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset o si se aplicaron tecnicas como RLHF o DPO en este ajuste especifico.

## Capacidades

- Control robotico por imitacion: genera chunks de acciones de control a partir de observaciones visuales (multiples vistas) y una instruccion en lenguaje natural.
- Percepcion multimodal: procesa simultaneamente varias imagenes de camara y texto de instruccion.
- Aprendizaje de tareas de manipulacion: el fine-tune especifico esta orientado a una tarea de clasificacion/ordenamiento de objetos.
- Integracion con LeRobot: compatible con el ecosistema de evaluacion y grabacion de episodios de LeRobot (comandos `lerobot-record` y `lerobot-train`).
- Eficiencia computacional: al tener solo 450M de parametros, puede ejecutarse en hardware de consumo, a diferencia de VLA mas grandes.
- Generacion de acciones en chunk: el modelo predice secuencias de acciones completas (action chunking), lo que mejora la suavidad del control.

## Casos de uso

- Clasificacion y ordenamiento de objetos en robotica: el modelo esta especificamente entrenado para una tarea de sort con 100 demostraciones y 3 vistas, por lo que puede desplegarse directamente en un robot SO-100 o similar para separar objetos segun criterios visuales.
- Prototipado rapido de politicas robotica: investigadores pueden usar este fine-tune como punto de partida para tareas similares, reduciendo el tiempo de entrenamiento desde cero.
- Evaluacion de VLA en hardware de consumo: al ser un modelo de 450M de parametros, permite validar tecnicas de aprendizaje por imitacion en una GPU domestica (por ejemplo, RTX 3060 o superior) sin necesidad de infraestructura de centro de datos.
- Investigacion en aprendizaje por imitacion multimodal: el uso de tres vistas de camara permite estudiar como la informacion visual redundante afecta al rendimiento de la politica.
- Benchmarking de VLA compactos: sirve como referencia para comparar el rendimiento de SmolVLA frente a otros VLA en tareas de manipulacion reales.
- Educacion y formacion en robotica: estudiantes pueden cargar el modelo en un robot SO-100 de bajo coste y experimentar con control por lenguaje natural, gracias a la integracion con LeRobot y la documentacion publica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para este fine-tune en la informacion disponible. El paper de SmolVLA (arxiv:2506.01844) reporta resultados comparativos del modelo base frente a otros VLA, pero no se dispone de esos datos en la informacion proporcionada para este repositorio concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con exactitud, pero al tratarse de 450M de parametros, la inferencia en FP16 requiere aproximadamente 1 GB de VRAM solo para los pesos, mas overhead de activaciones y procesamiento de imagenes. En la practica, una GPU con 4-8 GB de VRAM deberia ser suficiente.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA de gama media o alta (RTX 3060, RTX 4070, RTX 4090, A100, H100). El modelo base SmolVLA esta disenado para consumer-grade hardware.
- Compatibilidad con GPU de consumo: si, es uno de los objetivos principales del diseno de SmolVLA.
- Opciones de despliegue: LeRobot (entrenamiento e inferencia), con soporte para dispositivos CUDA. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que es un modelo de robotica, no un LLM generico.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolVLA (este fine-tune) | 450M | No disponible | Apache 2.0 | Hugging Face, LeRobot |
| OpenVLA | 7B | No disponible | MIT | Hugging Face |
| RT-2 (Google) | 55B | No disponible | Propietaria | No publico |

SmolVLA se diferencia de OpenVLA y RT-2 por su tamano drasticamente menor (450M frente a 7B y 55B), lo que permite despliegue en hardware de consumo. A cambio, es previsible que su rendimiento en tareas complejas sea inferior al de modelos mas grandes, aunque el paper reporta resultados competitivos. No se dispone de datos de benchmarks comparativos directos en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se dispone de informacion especifica sobre sesgos en este fine-tune. Como modelo entrenado sobre demostraciones de un unico dataset, puede heredar sesgos del demostrador humano y del entorno de captura.
- Riesgo de alucinacion: al ser un VLA, puede generar acciones incorrectas o incoherentes ante instrucciones o escenas fuera de la distribucion de entrenamiento. No se ha evaluado su robustez ante entradas adversas.
- Limitaciones de contexto: la ventana de contexto no esta documentada en la informacion disponible. El modelo procesa multiples imagenes, pero el numero maximo de vistas o la longitud de la instruccion no se especifican.
- Limitaciones de idioma: los idiomas soportados no estan documentados. El paper de SmolVLA sugiere que las instrucciones se procesan en ingles, por lo que otros idiomas pueden no funcionar correctamente.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial sin restricciones, pero es recomendable revisar los terminos de los datasets y modelos base subyacentes.
- Caveat para produccion: este es un fine-tune experimental con 0 descargas y 0 likes, creado por un unico autor. No hay evidencia de validacion en entornos reales mas alla del dataset de entrenamiento. Antes de usarlo en produccion, es imprescindible evaluarlo en el robot objetivo con episodios de prueba.
- Dependencia del hardware robotico: el modelo genera acciones para un robot especifico (SO-100 segun la documentacion de LeRobot). Su transferencia a otros robots requiere reentrenamiento o adaptacion.

## Enlaces

- Repositorio del modelo: https://huggingface.co/saipuneethgottam/smolvla_sort_100demos_3view
- Perfil del autor: https://huggingface.co/saipuneethgottam
- Modelos del autor: https://huggingface.co/saipuneethgottam/models
- Paper de SmolVLA (arXiv): https://arxiv.org/abs/2506.01844
- Version HTML del paper: https://arxiv.org/html/2506.01844v1
- Sitio web de SmolVLA: https://smolvla.net/index_en
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/saipuneethgottam/sort_100demos_3view
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
