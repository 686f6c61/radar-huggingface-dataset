# RoboCrafty/act_real_4_shift5

## Resumen

`RoboCrafty/act_real_4_shift5` es una política de robótica basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales. El modelo ha sido desarrollado por el usuario RoboCrafty y entrenado con LeRobot, la librería de aprendizaje automático para robótica real de Hugging Face. No se trata de un modelo de lenguaje: su entrada son observaciones sensoriales (estado del robot y dos cámaras) y su salida es un vector de acción de 7 dimensiones.

La política está especializada en una única tarea de manipulación: apilar un cubo amarillo sobre un cubo azul, ejecutada por un robot `my_parol6` con dos cámaras (`cam_1` y `cam_2`). Se entrenó sobre un dataset propio de 100 episodios y 79.957 fotogramas grabados a 30 FPS mediante teleoperación. El modelo tiene 51.670.663 parámetros en formato safetensors y se distribuye bajo licencia Apache 2.0.

Su relevancia reside en que ejemplifica el flujo actual de robótica open source: dataset y política publicados en el Hub, reproducibles con la CLI de LeRobot y ejecutables en hardware de gama media. Es un caso de estudio útil para quien quiera evaluar ACT como línea base de manipulación antes de escalar a métodos más complejos como Diffusion Policy o modelos visión-lenguaje-acción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con cuello de botella latente tipo CVAE |
| Parametros totales | 51.670.663 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; ventana de observacion fija, valor no disponible) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, sin variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible; la instruccion de tarea del dataset esta en ingles ("put the yellow cube on the blue cube") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

Otros datos de la ficha: tipo de robot `my_parol6`; camaras `cam_1` y `cam_2`; entrada `observation.state` con forma `(7,)`; entradas visuales `(3, 720, 1280)` por camara; salida `action` con forma `(7,)`; tamano del repositorio 0,2 GB.

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion que combina un transformer encoder-decoder con un autoencoder variacional condicional (CVAE). El encoder procesa las observaciones (el estado del robot y las imagenes de las camaras) y el decodificador genera un chunk de acciones futuras, lo que aporta consistencia temporal y reduce el error acumulado de la imitacion paso a paso. El modelo incorpora ademas un estilo latente que modela la variabilidad humana en la teleoperacion. Esta descripcion corresponde al metodo citado en la model card (paper arXiv 2304.13705) y no a detalles especificos de esta ejecucion de entrenamiento, que no se documentan.

El entrenamiento se realizo con LeRobot 0.6.1 durante 15.000 pasos, con un tamano de lote de 64, optimizador AdamW, tasa de aprendizaje 2e-05 y semilla 1000. Los datos provienen del dataset `RoboCrafty/parol6_stack_real_4_shift5`: 100 episodios y 79.957 fotogramas a 30 FPS de una unica tarea ("put the yellow cube on the blue cube"). No se especifica el numero de tokens ni la composicion detallada del dataset, ni si se aplico RLHF o DPO (no aplicable en aprendizaje por imitacion). El autor no indica ninguna innovacion tecnica adicional sobre el metodo ACT original.

## Capacidades

- Generacion de acciones motoras: produce chunks de acciones de 7 grados de libertad a partir de observaciones de estado y vision.
- Manipulacion visual guiada: usa dos camaras simultaneas (`cam_1` y `cam_2`) para percibir la escena y decidir la accion.
- Ejecucion de una tarea concreta de apilado: colocar el cubo amarillo sobre el cubo azul.
- Aprendizaje por imitacion a partir de teleoperacion: reproduce el comportamiento demostrado en el dataset de entrenamiento.
- Inferencia en tiempo real: disenada para ejecucion en bucle cerrado sobre robot fisico a 30 FPS.
- No dispone de tool calling ni de function calling.
- No dispone de razonamiento multi-paso generico ni de comportamiento de agente sobre texto.
- No dispone de capacidades de vision generales (deteccion, VQA, OCR) fuera del uso como entrada de control.
- Capacidades multilingues: no disponibles (el condicionamiento de tarea es una cadena de texto en ingles).

## Casos de uso

- Aprendizaje por imitacion como linea base: sirve para medir cuanto mejora un metodo posterior (por ejemplo Diffusion Policy o un VLA) sobre una tarea de apilado concreta antes de invertir en pipelines mas complejos.
- Automatizacion de pick-and-place en laboratorio: el robot puede recoger y apilar objetos con una politica entrenada sobre 100 demostraciones, adecuada para prototipos de investigacion con el robot `my_parol6`.
- Recoleccion de datos para escalado: la politica permite ejecutar rollouts autonomos que pueden grabarse y reutilizarse para ampliar el dataset y reentrenar con mas episodios.
- Evaluacion de robustez ante cambios de posicion u iluminacion: al ser un modelo pequeno, permite iterar rapido sobre variaciones del entorno y comparar tasas de exito.
- Integracion en pipelines de investigacion reproducibles: la CLI `lerobot-rollout` y `lerobot-train` permiten reproducir el entrenamiento y el despliegue con ficheros de configuracion versionados.
- Demostraciones educativas de robótica open source: util para mostrar el ciclo completo dataset-politica-robot en cursos o talleres, gracias a su tamano reducido (0,2 GB) y licencia permisiva.
- Benchmarking de hardware de bajo coste: sirve para comprobar si una GPU de gama media o incluso CPU es suficiente para control en tiempo real de una politica de 51,7 M de parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la seccion de evaluacion con el texto "No evaluation results have been provided for this policy yet", por lo que no existen tasas de exito ni comparaciones numericas publicadas.

## Requisitos de hardware

- VRAM estimada para inferencia: del orden de 2 a 4 GB con los pesos en fp32 (51,7 M de parametros, aproximadamente 207 MB solo en pesos) mas los buffers de las dos imagenes de entrada a resolucion completa. No se dispone de mediciones oficiales.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4-6 GB de VRAM; RTX 3060, RTX 4060, RTX 4090 son suficientes. En el extremo alto, una A100 o H100 no aporta ventaja practica para un modelo de este tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 4 GB o mas; tambien es viable en CPU, aunque el bucle de control a 30 FPS puede no sostenerse en CPU en funcion del hardware.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecucion y `lerobot-train` para reentrenamiento), PyTorch sobre CUDA o CPU. No aplican vLLM, TGI, llama.cpp ni Ollama, al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles. El `lerobot-rollout` del ejemplo usa `--duration=60` y el dataset esta grabado a 30 FPS, lo que fija el objetivo de frecuencia de control, pero no se publican cifras de latencia.

## Comparativa con modelos similares

| Modelo | Categoria | Parametros | Contexto / ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `RoboCrafty/act_real_4_shift5` | ACT (aprendizaje por imitacion) | 51,67 M | no disponible | apache-2.0 | Hugging Face Hub |
| Otras politicas ACT publicadas en LeRobot | ACT | no disponible | no disponible | variable (habitualmente apache-2.0) | Hugging Face Hub |
| Diffusion Policy | aprendizaje por imitacion generativo | no disponible | no disponible | variable | implementaciones open source |
| SmolVLA y familia VLA | vision-lenguaje-accion | no disponible | no disponible | variable | Hugging Face Hub |

No se dispone de datos numericos comparativos publicados en la informacion proporcionada. Cualitativamente, ACT es mas ligero y rapido de entrenar que Diffusion Policy o los modelos VLA, pero suele generalizar peor fuera de la distribucion del dataset de entrenamiento.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles de forma explicita. Al entrenarse sobre teleoperacion de un unico operador y un entorno fijo, la politica hereda los sesgos de esas demostraciones (posiciones, velocidad y estilo de agarre).
- Riesgo de sobreajuste a la tarea: solo se ha entrenado para una tarea ("put the yellow cube on the blue cube"); no cabe esperar generalizacion a otros objetos u objetivos sin reentrenamiento.
- Sin resultados de evaluacion: el autor no ha publicado tasa de exito ni numero de ensayos, por lo que el rendimiento real en robot fisico es desconocido.
- Dependencia del hardware de entrada: la politica espera exactamente dos camaras con los nombres `cam_1` y `cam_2`; si los nombres o la configuracion no coinciden, la inferencia falla.
- Limitaciones de generalizacion ante cambios de iluminacion, posicion de objetos, distractores o un robot distinto, todas ellas no cuantificadas.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe el analogo de acciones plausibles pero incorrectas fuera de la distribucion de entrenamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se cite. No se imponen restricciones adicionales de uso en la informacion disponible.
- Caveats para produccion: al ser una politica de investigacion sin evaluacion publicada, no es recomendable desplegarla en un entorno de produccion sin una validacion exhaustiva previa y medidas de seguridad en el robot.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validada por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RoboCrafty/act_real_4_shift5
- Dataset de entrenamiento: https://huggingface.co/datasets/RoboCrafty/parol6_stack_real_4_shift5
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=RoboCrafty/parol6_stack_real_4_shift5
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705 (arXiv 2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de aprendizaje por imitacion: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de la CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
