# Faless/piper_apples_c03_std_polso_smolvla_base_bs96_seme2000

## Resumen

Este repositorio contiene una politica robotica de vision-lenguaje-accion (VLA) basada en SmolVLA, un modelo compacto desarrollado por Hugging Face que combina un modelo de vision-lenguaje con un modulo experto en acciones. La politica ha sido ajustada (finetuned) por el usuario Faless mediante LeRobot para una tarea concreta de manipulacion: recoger manzanas rojas una a una y depositarlas en una cesta verde. El modelo consume dos flujos de imagen de camara a 256x256 pixeles mas un vector de estado de 8 dimensiones, y produce una accion de 7 grados de libertad.

El modelo tiene 450.046.176 parametros (aproximadamente 450 millones) y se distribuye en formato safetensors con un tamano de repositorio de 0,9 GB. Al estar construido sobre la arquitectura SmolVLA, esta disenado para ejecutarse en hardware de consumo, lo que lo hace accesible para laboratorios y desarrolladores con GPUs no profesionales. Deriva del modelo base Faless/smolvla_base_adapted, que a su vez parte del SmolVLA original descrito en el paper arxiv:2506.01844.

La relevancia de esta ficha es acotada: se trata de un ajuste especifico para un robot Piper con dos camaras (ego y front) y una tarea de recogida de manzanas, no de un modelo general de proposito multiple. No dispone de resultados de evaluacion publicados ni de licencia declarada, y el numero de descargas y likes es cero, por lo que debe considerarse un artefacto experimental de investigacion mas que un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) basada en SmolVLA (transformador VLM con experto en acciones) |
| Parametros totales | 450.046.176 (aproximadamente 450 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (entrada multimodal: estado de 8 dimensiones y dos imagenes de 3x256x256) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponible (la instruccion de tarea del ejemplo esta en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tipo de robot | piper_full |
| Camaras | ego, front |
| Entradas | observation.state (8,), observation.images.camera1 (3,256,256), observation.images.camera2 (3,256,256) |
| Salida | action (7,) |
| Biblioteca | lerobot 0.6.2 |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura de vision-lenguaje-accion que parte de un modelo de vision-lenguaje preentrenado de escala reducida y anade un modulo experto en acciones entrenado mediante emparejamiento de flujos (flow matching). El componente de lenguaje permite condicionar la politica con una instruccion textual (en este caso, "Pick the red apples one by one and place them into the green basket"), mientras que las dos camaras aportan la percepcion visual y el vector de estado de 8 dimensiones aporta la propiocepcion del robot. La salida es un vector de 7 grados de libertad correspondiente a la accion del brazo. El paper de referencia (arxiv:2506.01844) describe el metodo SmolVLA como una propuesta compacta y eficiente capaz de desplegarse en hardware de consumo.

El ajuste se realizo con LeRobot 0.6.2 sobre el modelo base Faless/smolvla_base_adapted. El conjunto de datos de entrenamiento es Faless/piper_apples_v7m_deposito_regolare_c03, con 619 episodios, 1.050.896 fotogramas a 30 FPS, lo que equivale a unas 9,7 horas de grabacion. La configuracion de entrenamiento incluye 44.000 pasos, tamano de lote 96, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 2000. No se especifica en la informacion disponible si se emplearon etapas de RLHF, DPO u otras tecnicas de alineacion posteriores al ajuste por imitacion.

## Capacidades

- Generacion de acciones de manipulacion robotica: produce vectores de accion de 7 dimensiones a partir de observaciones visuales y propioceptivas.
- Percepcion visual multi-camara: procesa simultaneamente dos flujos de imagen de 256x256 pixeles (camaras ego y front).
- Condicionamiento por instruccion en lenguaje natural: acepta una cadena de tarea que describe el objetivo.
- Control de un robot Piper completo (piper_full) mediante imitacion aprendida de demostraciones.
- Ejecucion de una tarea especifica de recogida y deposito de objetos (manzanas rojas en una cesta verde).
- Inferencia asincrona potencial: la familia SmolVLA esta disenada para soportar ejecucion desacoplada entre percepcion y accion.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje conversacional).
- Soporte de agentes y razonamiento multi-paso general: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision general, audio): no disponible mas alla del uso como politica VLA.

## Casos de uso

- Automatizacion de recogida de fruta en entornos controlados: la politica puede ejecutar la secuencia de coger manzanas y depositarlas en una cesta, adecuada para demostraciones de laboratorio con el robot Piper.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar el ajuste de SmolVLA y comparar variantes de datos y semillas.
- Reproduccion de experimentos de VLA compactos: permite validar el comportamiento del modelo base SmolVLA en una tarea concreta sin necesidad de GPUs de gama alta.
- Benchmarking de politicas roboticas: puede usarse como referencia para medir tasas de exito en tareas de pick-and-place frente a otros metodos.
- Desarrollo de pipelines de evaluacion con LeRobot: el repositorio incluye comandos de despliegue (lerobot-rollout) que facilitan la integracion en flujos de prueba.
- Formacion y docencia en robotica: util para ilustrar el flujo completo de grabacion de datos, entrenamiento y despliegue con LeRobot.
- Base para ajustes adicionales: dado que hereda de smolvla_base_adapted, puede emplearse como punto de partida para nuevas tareas del mismo robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica. La tabla de evaluacion del autor figura vacia y con la nota "No evaluation results have been provided for this policy yet".

| Tarea | Intentos | Exitos | Tasa de exito |
|---|---|---|---|
| no disponible | no disponible | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada en precision completa (fp32): alrededor de 1,8 GB solo para los pesos (450 M de parametros x 4 bytes), mas activaciones y buffers de inferencia.
- VRAM estimada en bf16/fp16: alrededor de 0,9 GB para los pesos, coherente con el tamano del repositorio.
- Cabe en GPUs de consumo: si, la familia SmolVLA esta disenada para hardware de consumo; una GPU con 4-8 GB de VRAM es suficiente, e incluso es probable su ejecucion en CPU.
- GPUs recomendadas: no se especifican en la informacion disponible; por tamano, cualquier GPU moderna de consumo (por ejemplo, gama RTX xx60 o superior) o GPUs de centro de datos (A100, H100) serian mas que suficientes.
- Opciones de despliegue: LeRobot, mediante el comando lerobot-rollout con --strategy.type=base. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a una politica VLA.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento de esta politica ni de modelos comparables, por lo que la comparacion se limita a caracteristicas estructurales conocidas de la categoria. Los valores de los modelos alternativos son aproximados y orientativos.

| Modelo | Parametros | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolVLA (esta politica, ajuste Faless) | 450 M | VLA compacta, flow matching | no disponible | Hugging Face, formato safetensors |
| SmolVLA base (Hugging Face) | aproximadamente 450 M | VLA compacta | no disponible en esta ficha | Hugging Face |
| OpenVLA | aproximadamente 7 B | VLA basada en VLM de mayor tamano | sujeta a licencia del modelo base | Hugging Face |
| pi0 (Physical Intelligence) | aproximadamente 3 B | VLA con flow matching | Apache 2.0 (aproximado) | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar el rendimiento real de estos modelos en la tarea de recogida de manzanas.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles.
- Riesgo de alucinacion: no aplica en el sentido conversacional, pero la politica puede generar acciones incorrectas o inestables fuera de la distribucion de los datos de entrenamiento.
- Limitaciones de contexto e idioma: la politica esta ajustada a una unica tarea y a un robot concreto (piper_full); no es un modelo generalista y no se documentan idiomas soportados.
- Dependencia del entorno: el rendimiento depende de la posicion de los objetos, la iluminacion, la presencia de distractores y la coincidencia exacta de las camaras y nombres de observacion con los del entrenamiento.
- Sin resultados de evaluacion: no hay tasa de exito medida, lo que impide estimar su fiabilidad en produccion.
- Licencia: no declarada, lo que impide evaluar su uso comercial.
- Datos de entrenamiento limitados: 619 episodios y una sola tarea reducen la generalizacion a otras tareas o robots.
- Artefacto experimental: cero descargas y cero likes, creado y actualizado en octubre de 2026, sin evidencia de validacion externa.
- Requisitos de hardware del robot: necesita el robot Piper y dos camaras configuradas con los mismos nombres e indices que en el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Faless/piper_apples_c03_std_polso_smolvla_base_bs96_seme2000
- Modelo base: https://huggingface.co/Faless/smolvla_base_adapted
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/Faless/piper_apples_v7m_deposito_regolare_c03
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Faless/piper_apples_v7m_deposito_regolare_c03
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia SmolVLA de LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Flujo de imitacion de LeRobot: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI de LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
