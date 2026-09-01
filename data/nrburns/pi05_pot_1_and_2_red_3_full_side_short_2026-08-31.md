# nrburns/pi05_Pot_1_and_2_Red_3_full_side_short_2026-08-31

## Resumen

Este repositorio contiene una política de robótica basada en el modelo π₀.₅ (Pi05) de Physical Intelligence, fine-tuneada por el usuario nrburns para una tarea específica de manipulación: recoger fresas destacadas y depositarlas en un contenedor verde. El modelo pertenece a la categoría de modelos Visión-Lenguaje-Acción (VLA), que integran percepción visual, razonamiento semántico y generación de acciones motoras en un único sistema entrenado de extremo a extremo.

La relevancia de este modelo radica en que π₀.₅ es la evolución de π₀, diseñado para generalizar a entornos y situaciones no vistas durante el entrenamiento, lo que lo convierte en una opción destacada para robótica de manipulación en entornos abiertos. La implementación utilizada es la adaptación oficial de LeRobot (Hugging Face) sobre el repositorio OpenPI de Physical Intelligence. El modelo cuenta con aproximadamente 4.140 millones de parámetros y está publicado bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en transformer, adaptacion de pi05 de Physical Intelligence |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, formato original) |
| Idiomas soportados | no disponible (modelo orientado a robotica, no a procesamiento de lenguaje general) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura π₀.₅ de Physical Intelligence, un modelo VLA que procesa observaciones multimodales (imagenes de camara y estado del robot) y genera acciones de control directamente. La implementacion en LeRobot adapta el codigo de OpenPI, que incluye modificaciones sobre la libreria transformers para soportar AdaRMS, control de precision de activaciones y uso de cache KV sin actualizacion.

El entrenamiento de este fine-tune se realizo sobre el modelo base `lerobot/pi05_base` utilizando el dataset `nrburns/Pot_1_and_2_Red-3_full_side-short`, que contiene 120 episodios y 76.615 frames a 20 FPS. La tarea registrada es "recoger cada fresa destacada, colocarla en el contenedor verde y volver a la posicion inicial". La configuracion de entrenamiento incluye 16.000 pasos, batch size de 32, optimizador AdamW, learning rate de 2,5e-05 y semilla 1000, con LeRobot version 0.6.2.

## Capacidades

- Control robotico de manipulacion: genera acciones de 8 dimensiones (posicion, orientacion, fuerza y estado del gripper) a partir de observaciones visuales y de estado.
- Percepcion multimodal: procesa tres flujos de imagen simultaneos (camara de escena, camara de muñeca y camara lateral) a resolucion 480x640.
- Integracion de estado del robot: consume 31 variables de estado que incluyen posicion articular, pose TCP, fuerza/torque, corriente del gripper y deteccion de objeto.
- Generalizacion a entornos abiertos: al estar basado en pi05, hereda la capacidad de adaptarse a situaciones no vistas durante el entrenamiento.
- Fine-tuning especifico de tarea: optimizado para la tarea de recogida y colocacion de fresas, con capacidad de ejecucion en bucle continuo.
- Compatibilidad con LeRobot: integrado con el ecosistema de entrenamiento y despliegue de Hugging Face para robotica.

## Casos de uso

- Automatizacion de recogida de frutas en agricultura: el modelo puede controlar un robot rizon4 para identificar y recoger fresas maduras de una maceta y depositarlas en un contenedor, reduciendo la necesidad de intervencion manual en invernaderos o lineas de cultivo.
- Manipulacion pick-and-place en entornos de investigacion: laboratorios de robotica pueden utilizar este modelo como punto de partida para experimentos de aprendizaje por imitacion, evaluando la transferencia de politicas VLA a nuevas configuraciones de objetos.
- Benchmarking de modelos VLA: al estar publicado con dataset y configuracion de entrenamiento completos, sirve como caso de estudio reproducible para comparar el rendimiento de pi05 frente a otras arquitecturas de politicas robotica.
- Desarrollo de sistemas de robotica asistiva: la capacidad de procesar multiples camaras y estados del gripper permite adaptar el modelo a tareas de asistencia en entornos domesticos, como recoger objetos y llevarlos a una ubicacion designada.
- Formacion y evaluacion de politicas de imitacion: investigadores pueden usar este fine-tune para estudiar como el ajuste fino sobre un dataset reducido (120 episodios) afecta al rendimiento en tareas especificas frente al modelo base.
- Integracion en pipelines de robotica con LeRobot: el modelo se puede desplegar directamente con `lerobot-rollout` en robots rizon4, lo que facilita su uso en entornos de produccion que ya utilizan el ecosistema LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion ("No evaluation results have been..."), por lo que no se dispone de datos de tasa de exito en tareas reales ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente, pero con 4.140 millones de parametros en precision FP32 se requieren aproximadamente 16,6 GB solo para los pesos; con cuantizacion a FP16 o BF16 se reduce a unos 8,3 GB. En la practica, la inferencia de modelos VLA con procesamiento de imagenes requiere memoria adicional para las activaciones.
- GPU recomendadas: para inferencia en tiempo real con tres camaras, se recomienda al menos una GPU con 24 GB de VRAM (RTX 3090/4090) o GPUs de centro de datos como A100 (40/80 GB) o H100. Para entrenamiento, se necesitan GPUs de mayor capacidad.
- Compatibilidad con GPU de consumo: es posible ejecutar inferencia en GPUs de consumo con 16-24 GB de VRAM si se aplica cuantizacion, aunque el rendimiento en tiempo real puede verse limitado.
- Opciones de despliegue: el modelo esta integrado en LeRobot, por lo que se puede ejecutar con `lerobot-rollout` en robots rizon4. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo estandar.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05 (este fine-tune) | 4,14 B | VLA | no disponible | Apache 2.0 | Hugging Face |
| lerobot/pi05_base | 4,14 B (estimado) | VLA | no disponible | Apache 2.0 | Hugging Face |
| pi0 (modelo base original) | no disponible | VLA | no disponible | no disponible | Repositorio OpenPI |

No se dispone de datos comparativos de rendimiento entre estos modelos, ya que no se han publicado benchmarks en la informacion disponible. La principal diferencia entre este fine-tune y el modelo base es la especializacion en la tarea de recogida de fresas, mientras que pi05_base es un modelo generalista para manipulacion robotica.

## Limitaciones y advertencias

- Sesgos de tarea: el modelo esta fine-tuneado exclusivamente para la tarea de recoger fresas y colocarlas en un contenedor verde. Su rendimiento en otras tareas de manipulacion no ha sido evaluado y probablemente sea deficiente.
- Riesgo de sobreajuste: con solo 120 episodios de entrenamiento, existe un riesgo significativo de sobreajuste a las condiciones especificas del dataset (posicion de camaras, iluminacion, tipo de robot, disposicion de objetos).
- Dependencia del hardware: el modelo esta entrenado para el robot rizon4 con tres camaras especificas (escena, muñeca, lateral). Su uso con otros robots o configuraciones de camaras requiere reentrenamiento o adaptacion.
- Sin resultados de evaluacion: no se han publicado tasas de exito en pruebas reales, por lo que el rendimiento esperado en entornos de produccion es incierto.
- Limitaciones de generalizacion: aunque pi05 esta disenado para generalizar a entornos nuevos, este fine-tune reduce esa capacidad al especializarse en una tarea muy concreta.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero es recomendable revisar los terminos de la licencia del modelo base y del dataset asociado.

## Enlaces

- Repositorio del modelo: https://huggingface.co/nrburns/pi05_Pot_1_and_2_Red_3_full_side_short_2026-08-31
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/nrburns/Pot_1_and_2_Red-3_full_side-short
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=nrburns/Pot_1_and_2_Red-3_full_side-short
- Blog de pi05 de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- Documentacion de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Documentacion de rollout de LeRobot: https://huggingface.co/docs/lerobot/main/en/inference
