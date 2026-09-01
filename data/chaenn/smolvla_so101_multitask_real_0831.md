# Chaenn/smolvla_so101_multitask_real_0831

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente, diseñado para control robótico en tiempo real sobre hardware de consumo. Este repositorio concreto, `Chaenn/smolvla_so101_multitask_real_0831`, es un ajuste fino (fine-tuning) del modelo base `lerobot/smolvla_base` realizado por el autor Chaenn, especializado en tareas multitarea de pick-and-place con el robot SO-101. El entrenamiento se ha llevado a cabo con la librería LeRobot de Hugging Face, utilizando el dataset `Chaenn/so101_cube_multitask_hil_0724_merged_fixed`, que combina demostraciones reales y simuladas.

El modelo tiene 450 millones de parámetros y se distribuye en formato safetensors, con un tamaño de repositorio de 0,9 GB. Su relevancia radica en que demuestra cómo un VLA compacto puede ejecutar tareas robóticas complejas (manipulación de cubos, múltiples objetivos) con una huella computacional reducida, lo que lo hace accesible para laboratorios y desarrolladores sin infraestructura de alto rendimiento. La licencia Apache 2.0 permite uso comercial y modificación sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en transformer, con backbone de vision y modelo de lenguaje pequeño (SmolVLA) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (modelo orientado a robotica, no a procesamiento de lenguaje general) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo VLA que combina un codificador de vision (tipo SigLIP) con un modelo de lenguaje pequeño (tipo SmolLM2) para generar acciones de control directamente a partir de observaciones visuales y comandos de lenguaje. El modelo base `lerobot/smolvla_base` fue preentrenado en un corpus amplio de datos de robotica y luego ajustado para tareas especificas. En este caso, el ajuste fino se realizo con el dataset `Chaenn/so101_cube_multitask_hil_0724_merged_fixed`, que incluye demostraciones de manipulacion de cubos en entornos reales y simulados, con multiples tareas y objetivos. El entrenamiento se ejecuto con LeRobot, que utiliza tecnicas de aprendizaje por imitacion (behavior cloning) y posiblemente refuerzo, aunque no se especifican detalles sobre el numero de tokens, composicion exacta del dataset o uso de RLHF/DPO en la informacion disponible.

## Capacidades

- Control robotico de brazo SO-101: genera acciones de posicion y orientacion del efector final a partir de imagenes y texto.
- Tareas multitarea de pick-and-place: capaz de manipular cubos y objetos en configuraciones variadas, con multiples objetivos.
- Integracion con LeRobot: compatible con el ecosistema de entrenamiento, evaluacion y despliegue de Hugging Face.
- Inferencia en tiempo real: disenado para ejecutarse en hardware de consumo, con latencia reducida.
- No soporta tool calling, agentes conversacionales ni capacidades multilingues, al estar especializado en robotica.

## Casos de uso

- Automatizacion de tareas de pick-and-place en laboratorios de robotica: el modelo puede controlar un brazo SO-101 para recoger y colocar objetos en posiciones definidas, reduciendo el tiempo de programacion manual.
- Prototipado rapido de politicas robotica: gracias a su tamano compacto, permite iterar sobre nuevas tareas con datasets pequenos y GPUs de gama media.
- Investigacion en aprendizaje por imitacion: sirve como base para estudiar la transferencia sim-to-real, ya que el dataset combina datos simulados y reales.
- Educacion y formacion en robotica: puede desplegarse en estaciones de trabajo con una sola GPU (por ejemplo, RTX 3060 o superior) para ensenar conceptos de VLA.
- Evaluacion de politicas en entornos controlados: con LeRobot, se puede registrar episodios de evaluacion y comparar el rendimiento frente a otras politicas.
- Integracion en sistemas de fabricacion flexible: para tareas de clasificacion o ensamblaje sencillo donde se requiera adaptacion rapida a nuevos objetos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan metricas como MMLU, HumanEval o GSM8K, ya que el modelo no esta orientado a tareas de lenguaje o codigo, sino a robotica. Tampoco se incluyen metricas de exito en tareas de manipulacion (por ejemplo, tasa de exito en pick-and-place) en la documentacion del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450M de parametros en precision FP32, se requieren aproximadamente 1,8 GB de VRAM; con cuantizacion (no publicada) podria reducirse a menos de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 3060) es suficiente para inferencia. Para entrenamiento, se recomienda al menos 8 GB de VRAM.
- Compatibilidad con hardware de consumo: si, cabe en GPUs de gama media y baja.
- Opciones de despliegue: LeRobot (via `lerobot-record` y `lerobot-train`), tambien puede exportarse a ONNX o TensorRT para optimizacion, aunque no se documenta en el repositorio.
- Latencia y throughput: no disponibles, pero al ser un modelo compacto, se espera una latencia inferior a 50 ms por paso de control en GPUs modernas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolVLA (este) | 450M | no disponible | VLA para robotica | Apache 2.0 | Hugging Face |
| OpenVLA | 7B | 4096 | VLA generalista | MIT | Hugging Face |
| RT-2 (Google) | 55B | 8192 | VLA a gran escala | Propietaria | No publico |

La comparativa se basa en datos publicos de los modelos base. SmolVLA destaca por su tamano reducido (450M frente a 7B o 55B), lo que permite despliegue en hardware modesto, aunque su rendimiento en tareas complejas puede ser inferior al de modelos mas grandes. No se dispone de comparaciones directas de rendimiento en tareas de robotica.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con un dataset especifico de manipulacion de cubos, el modelo puede no generalizar bien a otros objetos o entornos no representados.
- Riesgo de alucinacion: en el contexto de robotica, puede generar acciones incorrectas o inestables si las observaciones visuales son ambiguas o fuera de distribucion.
- Limitaciones de contexto: la longitud de contexto no esta documentada, pero al ser un VLA, la entrada suele ser una imagen y un comando de texto corto; no esta disenado para dialogos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe atribuir al autor y mantener el aviso de licencia.
- Caveat para produccion: el modelo requiere una calibracion cuidadosa del robot y del espacio de trabajo; no se recomienda su uso en entornos no controlados sin validacion previa.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Chaenn/smolvla_so101_multitask_real_0831
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio relacionado (SO-101 multitask): https://github.com/ktkchh/smolvla-so101-multitask-long-horizon
- Otros modelos del autor: https://huggingface.co/Chaenn (varios repos de politicas SmolVLA)
