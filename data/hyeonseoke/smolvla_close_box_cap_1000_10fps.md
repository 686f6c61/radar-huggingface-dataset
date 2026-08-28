# HyeonseokE/smolvla_close_box_cap_1000_10fps

## Resumen

Este modelo es un fine-tuning de SmolVLA, un vision-language-action model (VLA) compacto de 450 millones de parámetros desarrollado por Hugging Face, adaptado específicamente para la tarea de cerrar una caja colocando la tapa sobre el cuerpo. El autor, HyeonseokE, ha entrenado esta política robótica mediante aprendizaje por imitación usando el framework LeRobot, partiendo del modelo base `lerobot/smolvla_base` y un dataset propio de 100 episodios grabados a 10 FPS.

La relevancia de este modelo radica en que demuestra el flujo completo de fine-tuning de SmolVLA para una tarea de manipulación concreta, aprovechando la eficiencia del modelo base que permite su despliegue en hardware de consumo. SmolVLA combina un modelo de lenguaje y visión (VLM) preentrenado con un experto de acciones entrenado mediante flow matching, lo que le permite generar secuencias de acciones a partir de observaciones visuales y una instrucción en lenguaje natural. Con solo 450 millones de parámetros, es significativamente más ligero que otros VLA como OpenVLA (7B) o RT-2 (55B), lo que facilita su uso en robots de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (VLM compacto + experto de acciones con flow matching) |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | no disponible (instrucciones en ingles en el dataset) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA se compone de un modelo de lenguaje y vision (VLM) preentrenado a gran escala que actua como base perceptual y de razonamiento, junto con un experto de acciones entrenado con flow matching. El modelo recibe multiples imagenes (en este caso tres camaras a 256x256 píxeles) y una instruccion textual, y genera un chunk de acciones de 6 dimensiones correspondientes a los grados de libertad del robot. Esta arquitectura hibrida permite transferir conocimiento visual y linguistico de los VLM preentrenados sin necesidad de entrenar desde cero.

El fine-tuning se realizo con LeRobot version 0.5.1 sobre el dataset `HyeonseokE/close_box_cap_10fps`, que contiene 100 episodios y 28.349 frames grabados a 10 FPS con un robot tipo `so101_follower` equipado con camaras superior y de muñeca izquierda. La configuracion de entrenamiento incluyo 22.148 pasos, batch size de 64, optimizador AdamW con learning rate de 0.0001 y semilla 1000. La tarea especifica es "Close the box by placing the lid on the box body" (cerrar la caja colocando la tapa sobre el cuerpo).

## Capacidades

- Control robotico de 6 grados de libertad (acciones de 6 dimensiones) para manipulacion fisica.
- Percepcion visual multimodal con tres camaras de entrada (256x256), incluyendo vista superior y muñeca.
- Ejecucion de tareas guiadas por instrucciones en lenguaje natural (en este caso, en ingles).
- Generacion de chunks de acciones mediante flow matching, permitiendo movimientos suaves y coordinados.
- Fine-tuning especifico para la tarea de cerrar cajas, con capacidad de generalizar dentro del dominio de entrenamiento.
- Integracion nativa con el ecosistema LeRobot para entrenamiento, evaluacion y despliegue.

## Casos de uso

- Automatizacion de ensamblaje en entornos de fabricacion: el modelo puede controlar un brazo robotico para colocar tapas o piezas sobre cuerpos, reduciendo la intervencion manual en lineas de produccion de bajo volumen.
- Manipulacion de objetos en laboratorios de investigacion: permite reproducir experimentos de manipulacion con un robot de bajo coste, usando la politica entrenada como punto de partida para nuevas tareas.
- Prototipado rapido de politicas robotica: al ser un fine-tuning de SmolVLA, los desarrolladores pueden clonar este repositorio y reentrenar con sus propios datasets para tareas similares, acelerando el ciclo de desarrollo.
- Educacion en robotica y aprendizaje por imitacion: sirve como ejemplo practico de como entrenar y desplegar un VLA en hardware de consumo, util para cursos y talleres universitarios.
- Evaluacion de VLA en entornos reales: investigadores pueden usar este modelo como referencia para comparar el rendimiento de SmolVLA fine-tuneado frente a otras arquitecturas en tareas de manipulacion.
- Integracion en sistemas de robotica asistencial: en entornos domesticos o de cuidados, el modelo podria adaptarse para tareas de recogida o cierre de contenedores, aunque requeriria reentrenamiento con datos especificos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica ("No evaluation results have been provided for this policy yet"). No se dispone de datos de tasa de exito, metricas de precision ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 450 millones de parametros en precision FP32, el peso ocupa aproximadamente 1,8 GB en memoria. Con cuantizacion a FP16 o int8, la huella se reduce a unos 0,9 GB o 0,45 GB respectivamente, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente para inferencia, como una NVIDIA GTX 1650, RTX 3060 o RTX 4090. Para entrenamiento, se recomienda una GPU con 8-12 GB de VRAM (por ejemplo, RTX 3070 o superior).
- Compatibilidad con hardware de consumo: si, el modelo esta disenado para ejecutarse en GPUs de gama media y baja, siendo este uno de los objetivos principales de SmolVLA.
- Opciones de despliegue: el flujo principal es mediante LeRobot, usando el comando `lerobot-rollout` con el robot `so101_follower`. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo estandar sino una politica robotica.
- Latencia y throughput: no se han publicado datos de latencia especificos para este fine-tuning. Dado el tamano del modelo, se espera una inferencia en tiempo real (mayor de 10 FPS) en GPUs consumer, pero no hay mediciones confirmadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolVLA (base) | 450M | no disponible | VLA generalista | Apache-2.0 | Hugging Face |
| Este fine-tuning | 450M | no disponible | Cerrar caja (tarea especifica) | Apache-2.0 | Hugging Face |
| OpenVLA | 7B | 2048 tokens | VLA generalista | MIT | Hugging Face |
| RT-2 | 55B | no disponible | VLA generalista | no abierta | no disponible |

No se dispone de datos de rendimiento comparativos entre estos modelos en la misma tarea. La comparativa se limita a caracteristicas arquitectonicas y de disponibilidad. SmolVLA destaca por su tamano reducido frente a OpenVLA y RT-2, lo que facilita su despliegue en hardware de consumo, pero no hay metricas publicadas que confirmen una ventaja en precision o tasa de exito.

## Limitaciones y advertencias

- Sin evaluacion publicada: la model card no incluye resultados de pruebas en robot real, por lo que no se puede verificar la tasa de exito ni la robustez de la politica.
- Especializacion limitada: el modelo esta entrenado exclusivamente para la tarea de cerrar cajas con un robot `so101_follower` y una configuracion de camaras especifica. No generalizara a otras tareas ni a otros robots sin reentrenamiento.
- Dependencia del dataset: la calidad del comportamiento depende de la variabilidad y representatividad de los 100 episodios de entrenamiento. Si el dataset tiene sesgos (por ejemplo, posiciones fijas de la caja), el modelo fallara en condiciones diferentes.
- Riesgo de alucinacion en instrucciones: aunque no es un modelo de lenguaje generativo, la interpretacion de instrucciones puede fallar si la tarea se describe de forma diferente a la usada en entrenamiento.
- Idiomas no especificados: no se indica que idiomas soporta el modelo. Las instrucciones del dataset estan en ingles, por lo que su uso con otros idiomas no esta garantizado.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, modificacion y redistribucion, pero requiere atribucion y no ofrece garantias. Es compatible con proyectos propietarios siempre que se mantenga el aviso de licencia.
- Requisitos de hardware robotico: ademas de la GPU, se necesita el robot fisico `so101_follower` y las camaras configuradas, lo que limita su uso a entornos con ese equipamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HyeonseokE/smolvla_close_box_cap_1000_10fps
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/close_box_cap_10fps
- Paper de SmolVLA (arXiv): https://arxiv.org/abs/2506.01844
- Version HTML del paper: https://arxiv.org/html/2506.01844v1
- Web oficial de SmolVLA: https://smolvla.net/index_en
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Perfil del autor: https://huggingface.co/HyeonseokE
