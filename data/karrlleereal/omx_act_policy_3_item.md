# karrlleereal/omx_act_policy_3_item

## Resumen

`karrlleereal/omx_act_policy_3_item` es una politica de robotica entrenada con el metodo ACT (Action Chunking with Transformers) y publicada en Hugging Face mediante la libreria LeRobot. No es un modelo de lenguaje: se trata de una politica de aprendizaje por imitacion que mapea observaciones visuales y de estado del robot a secuencias cortas de acciones de manipulacion (chunks), en lugar de predecir un unico paso de control. El autor es el usuario `karrlleereal` y el entrenamiento se ha realizado sobre el dataset `karrlleereal/three_item2`, lo que sugiere una tarea de manipulacion centrada en tres objetos.

El modelo tiene 51.668.614 parametros (51,67 M) segun los pesos reales en safetensors, con un repositorio de 0,2 GB, lo que lo situa en la categoria de politicas ligeras capaces de ejecutarse en hardware de gama media e incluso en plataformas embebidas. La licencia es Apache 2.0, sin restricciones conocidas para uso comercial, y se distribuye bajo el pipeline `robotics` de Hugging Face con la etiqueta `lerobot`.

Su relevancia actual radica en la popularizacion de flujos end-to-end de Physical AI con hardware de bajo coste: ACT (paper arXiv:2304.13705) demostro que es posible obtener tasas de exito altas en manipulacion fina y bimanual con brazos economicos, y LeRobot ofrece un ecosistema estandarizado para entrenar, evaluar y desplegar estas politicas. Este checkpoint concreto, sin embargo, es un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, sin model card detallada ni resultados de evaluacion publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): politica transformer con componente CVAE para aprendizaje por imitacion |
| Parametros totales | 51.668.614 (51,67 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (ACT opera sobre una ventana de observaciones; el numero de pasos de historial no se especifica en la informacion) |
| Tipos de cuantizacion | no disponible; pesos publicados en safetensors (tamano de repo de 0,2 GB, compatible con fp32) |
| Idiomas soportados | no disponibles (no aplica: la politica no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Biblioteca | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | karrlleereal/three_item2 |
| Autor | karrlleereal |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-01 |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un metodo de aprendizaje por imitacion propuesto en el paper "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705). Su innovacion principal es predecir chunks de acciones, es decir, secuencias de varios pasos de control de una sola vez, en lugar de una accion por inferencia. Esto reduce el problema de horizonte efectivo del aprendizaje por imitacion, mitiga el error de compounding y permite tasas de exito mas altas en tareas de manipulacion fina con datos teleoperados. La arquitectura combina un transformer encoder que procesa las observaciones (tipicamente imagenes de camara y estado de las articulaciones) con un transformer decoder que genera la secuencia de acciones, apoyandose en un componente de autoencoder variacional condicional (CVAE) durante el entrenamiento para modelar la variabilidad de las demostraciones.

El entrenamiento se ha realizado con LeRobot sobre el dataset `karrlleereal/three_item2`, mediante el flujo `lerobot-train` con `--policy.type=act`. No se dispone de informacion sobre el numero de episodios, el numero de tokens o transiciones procesadas, la composicion exacta del dataset ni la configuracion de hiperparametros. Dado que se trata de aprendizaje por imitacion supervisado a partir de demostraciones teleoperadas, no aplican tecnicas de alineacion como RLHF o DPO. El repositorio incluye codigo de ejemplo para evaluacion con `lerobot-record` apuntando a un robot `so100_follower`, aunque el nombre del modelo (`omx`) sugiere una posible relacion con la plataforma ROBOTIS OMX, un manipulador de 5 grados de libertad orientado a la recoleccion de datos y a flujos IL/RL; esta correspondencia no queda confirmada en la informacion disponible.

## Capacidades

- Generacion de chunks de acciones de manipulacion robotica a partir de observaciones visuales y de estado.
- Control en bucle cerrado: la politica consume retroalimentacion del entorno (imagenes de camara) y emite acciones de forma iterativa.
- Manipulacion fina y potencialmente bimanual, segun la formulacion original de ACT.
- Aprendizaje por imitacion a partir de demostraciones teleoperadas, sin necesidad de recompensas ni simulacion.
- Integracion nativa con el ecosistema LeRobot para entrenamiento, evaluacion y registro de episodios.
- Orientada a tareas especificas del dataset de entrenamiento (`three_item2`), presumiblemente manipulacion de tres objetos.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes, razonamiento multi-paso simbolico ni capacidades multilingues.
- No dispone de modo thinking, vision-language general ni procesamiento de audio.

## Casos de uso

- Automatizacion de picking y colocacion de tres objetos: la politica puede reproducir la secuencia de manipulacion aprendida sobre el dataset `three_item2` en una celda de trabajo, emitiendo chunks de acciones que reducen la latencia de control efectiva.
- Recoleccion de datos y reentrenamiento iterativo: sirve como punto de partida para nuevos ciclos de teleoperacion y ajuste fino con LeRobot, ampliando el conjunto de objetos o variando las condiciones de iluminacion.
- Manipulacion bimanual de precision en laboratorio: el metodo ACT fue disenado para tareas finas con hardware de bajo coste, por lo que encaja en montajes de investigacion con brazos economicos tipo SO-100.
- Docencia y formacion en robotica: al ser un modelo pequeno (51,67 M de parametros) y con licencia Apache 2.0, es adecuado para practicas de aprendizaje por imitacion sin requerir infraestructura costosa.
- Despliegue en el borde (edge): su tamano permite ejecutar inferencia en GPUs integradas o plataformas embebidas junto al controlador del robot, evitando dependencias de red.
- Evaluacion comparativa de metodos de IL: puede usarse como referencia ACT dentro de pipelines de benchmarking de LeRobot frente a otras politicas como Diffusion Policy, VQ-BeT o TD-MPC.
- Prototipado rapido de tareas de ensamblaje: partiendo de demostraciones teleoperadas, se puede adaptar la politica a secuencias de encaje o apilado de piezas mediante ajuste fino.
- Integracion en lineas de produccion piloto: con licencia permisiva, puede incorporarse en proyectos comerciales de automatizacion siempre que se validen los requisitos de seguridad funcional del entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, numero de episodios de evaluacion, ni comparaciones cuantitativas con otras politicas para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada: a partir de los 51,67 M de parametros, el checkpoint en fp32 ocupa aproximadamente 207 MB, coherente con el tamano de repositorio de 0,2 GB. En fp16 la cifra se reduce a unos 103 MB. La memoria adicional necesaria para activaciones depende del tamano de lote y de la resolucion de las imagenes de entrada, datos no disponibles.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM es suficiente para inferencia; una NVIDIA RTX 3060, RTX 4090 o equivalentes cubren el caso con holgura. Para entrenamiento, se recomienda una GPU con 8 GB o mas.
- Compatibilidad con GPU de consumo: si, el modelo cabe sin problemas en GPUs de consumo e integradas. Tambien es viable la inferencia en CPU para tasas de control moderadas, aunque la latencia no esta documentada.
- Opciones de despliegue: LeRobot (`lerobot-train`, `lerobot-record`), PyTorch. Herramientas orientadas a modelos de lenguaje como vLLM, llama.cpp, Ollama o TGI no aplican a esta politica. Para edge, podria desplegarse via ONNX o TensorRT, aunque no se documenta soporte oficial.
- Latencia y throughput: no disponibles. En control robotico de tiempo real se suelen requerir frecuencias de 10 a 50 Hz, pero no hay mediciones publicadas para este checkpoint.
- Hardware robotico asociado: el ejemplo de evaluacion de la model card usa `--robot.type=so100_follower`; el nombre del modelo sugiere compatibilidad con ROBOTIS OMX (manipulador de 5 grados de libertad), pero no se especifica oficialmente.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| karrlleereal/omx_act_policy_3_item (ACT) | Politica IL transformer con CVAE | 51,67 M | no disponible | apache-2.0 | Hugging Face (0 descargas) |
| ACT generico de LeRobot | Politica IL transformer con CVAE | no disponible | no disponible | no disponible en la informacion | Documentado en la documentacion oficial de LeRobot |
| Diffusion Policy | Politica IL basada en difusion | no disponible | no disponible | no disponible en la informacion | Incluida en LeRobot |
| VQ-BeT | Politica IL con codebook vectorial | no disponible | no disponible | no disponible en la informacion | Incluida en LeRobot |
| TD-MPC | Planificacion basada en modelo (RL) | no disponible | no disponible | no disponible en la informacion | Incluida en LeRobot |

No se dispone de datos cuantitativos de rendimiento para ninguna de las alternativas en la informacion proporcionada; la comparacion es, por tanto, unicamente cualitativa y basada en la categoria de metodo.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay tasas de exito ni evaluacion formal, por lo que el rendimiento real es desconocido.
- Artefacto practicamente sin uso: cero descargas y cero likes en Hugging Face en el momento de la consulta, lo que limita la validacion por parte de la comunidad.
- Especializacion estrecha: al entrenarse sobre `three_item2`, es probable que la politica este fuertemente ajustada a los tres objetos, posiciones y condiciones de camara de ese dataset, con escasa generalizacion fuera de ellos.
- Ambiguedad sobre la plataforma robotica objetivo: el nombre apunta a ROBOTIS OMX (5 DOF), pero el ejemplo de evaluacion usa `so100_follower`; es necesario verificar la configuracion correcta antes de desplegar.
- Riesgo de deriva y fallo silencioso: como toda politica de imitacion, puede degradarse ante cambios de iluminacion, fondo, posicion inicial o estado de los objetos, sin senalar el error de forma explicita.
- Ausencia de garantias de seguridad: no hay mecanismos de parada, limites articulares ni verificacion de colisiones integrados en el modelo; cualquier despliegue fisico requiere capas de seguridad externas.
- Capacidades de lenguaje, tool calling, agentes y multilingueismo no aplicables.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero no exime de cumplir la normativa de seguridad aplicable al entorno robotico.
- No se documentan sesgos especificos; en el ambito de la robotica, el sesgo relevante es la sobreajuste a las condiciones de recoleccion de datos del dataset de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/karrlleereal/omx_act_policy_3_item
- Modelo relacionado del mismo autor: https://huggingface.co/karrlleereal/omx_act_policy
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentacion de ACT en LeRobot: https://huggingface.co/docs/lerobot/act
- Guia de entrenamiento de politicas en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion general de LeRobot: https://huggingface.co/docs/lerobot/index
- Analisis de politicas de aprendizaje por imitacion en LeRobot (DeepWiki): https://deepwiki.com/huggingface/lerobot/4.2-imitation-learning-policies
- Documentacion de ROBOTIS OMX: https://docs.robotis.com/docs/systems/omx/introduction/
- Dataset de entrenamiento: https://huggingface.co/datasets/karrlleereal/three_item2
