# arshjeevs/smolvla-pickup-full

## Resumen

`arshjeevs/smolvla-pickup-full` es una politica robotica de tipo vision-language-action (VLA) obtenida por ajuste fino de `lerobot/smolvla_base`, el modelo SmolVLA de Hugging Face descrito en el articulo arXiv:2506.01844. El modelo consume el estado articular de un robot SO-101 follower (vector de 6 dimensiones) y dos flujos de imagen de 480x640 pixeles procedentes de dos camaras, y produce un vector de accion de 6 dimensiones para ejecutar la tarea «pick and place the object». No es un modelo de lenguaje: es una politica de control entrenada por imitacion.

El ajuste se realizo con LeRobot 0.6.2 sobre un unico conjunto de datos propio de 10 episodios y 8860 fotogramas grabados a 30 FPS, con 10 000 pasos de entrenamiento, tamano de lote 2, optimizador AdamW y tasa de aprendizaje 1e-4. El resultado son 450 046 176 parametros (unos 0,9 GB de pesos en safetensors) con licencia Apache 2.0, lo que lo situa en la categoria de VLA compactos desplegables en GPU de consumo.

Su relevancia es doble: por un lado demuestra el flujo de trabajo completo de LeRobot (grabacion de demostraciones teleoperadas, entrenamiento y rollout); por otro, sirve como ejemplo reproducible de especializacion de un modelo fundacional de robotica con muy pocos datos, algo que hace un ano requeria infraestructura de entrenamiento mucho mayor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA): backbone de vision-lenguaje compacto derivado de SmolVLM-2 mas un experto de acciones entrenado con flow matching |
| Parametros totales | 450 046 176 (0,45 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; los pesos publicados estan en safetensors a precision de 16 bits |
| Idiomas soportados | no disponible; la politica no genera lenguaje natural (la instruccion de tarea se pasa como cadena de texto, en la practica en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Tipo de modelo | Politica de imitacion (no generativa de texto) |
| Robot objetivo | `so_follower` (SO-101 follower) |
| Entradas | `observation.state` (6,), `observation.images.camera1` (3, 480, 640), `observation.images.camera2` (3, 480, 640) |
| Salidas | `action` (6,) |
| Tarea entrenada | «pick and place the object» |
| Version de LeRobot | 0.6.2 |
| Tamano del repositorio | 0,9 GB |
| Modelo base | `lerobot/smolvla_base` |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

SmolVLA sigue la formulacion habitual de las politicas VLA modernas: un backbone de vision-lenguaje que codifica las imagenes de las camaras junto con la instruccion textual de la tarea, y un experto de acciones que genera el comando motor a partir de esas representaciones. El experto se entrena con un objetivo de flow matching, lo que permite producir bloques de acciones continuas en lugar de un unico paso discreto. El desglose exacto de parametros entre backbone y experto no se detalla en la informacion disponible; solo consta el total de 450 046 176 parametros.

El modelo base `lerobot/smolvla_base` se preentreno con una agregacion de conjuntos de datos de robotica publicados por la comunidad en el Hub, lo que le proporciona una inicializacion generica antes de la especializacion. Este repositorio concreto es un ajuste fino supervisado (imitation learning, sin RLHF ni DPO) sobre el conjunto `arshjeevs/so101-pick-place_20260926_222531`: 10 episodios, 8860 fotogramas a 30 FPS, una sola tarea y un unico robot. La configuracion de entrenamiento completa es: 10 000 pasos, batch size 2, optimizador AdamW, learning rate 1e-4, semilla 1000.

No se documentan en la informacion disponible innovaciones adicionales aplicadas en este ajuste (decodificacion especulativa, atencion lineal, inferencia asincrona u otras optimizaciones descritas en el articulo original).

## Capacidades

- Manipulacion robotica: ejecuta una tarea de recogida y colocacion («pick and place the object») con un SO-101 follower.
- Control de 6 grados de libertad: la salida es un vector de accion de 6 dimensiones.
- Fusion multimodal de dos camaras: integra dos vistas simultaneas de 480x640 a 30 FPS junto con el estado articular.
- Condicionamiento por instruccion textual: la tarea se especifica mediante una cadena de texto en el momento del rollout.
- Aprendizaje por imitacion: reproduce el comportamiento demostrado en el conjunto de datos de entrenamiento.
- Despliegue en hardware de consumo: la model card del autor indica que SmolVLA esta pensado para ejecutarse en equipos de gama de consumo.
- No soporta generacion de texto, razonamiento simbolico, codigo ni matematicas.
- No soporta tool calling, function calling ni uso como agente.
- No soporta vision generalista (descripcion de imagenes, VQA) como tarea de salida.
- No se documentan capacidades multilingues.

## Casos de uso

- Recogida y colocacion en banco de pruebas de laboratorio: el modelo puede pilotar un SO-101 para mover un objeto de un punto a otro, siempre que la escena y la posicion de la camara coincidan con las del conjunto de entrenamiento. Es su caso de uso directo y practicamente el unico validado.
- Validacion de la cadena de herramientas LeRobot: sirve para probar de principio a fin el flujo `lerobot-train` -> subida al Hub -> `lerobot-rollout`, incluyendo la calibracion del robot y la configuracion de las dos camaras.
- Punto de partida para ajuste fino adicional: al ser un fine-tune ya funcional sobre `lerobot/smolvla_base`, se puede continuar entrenando con mas episodios o con variaciones de posicion, iluminacion y objetos para ampliar su robustez.
- Referencia base en comparativas de politicas: util para medir de forma reproducible cuanto mejora una politica ACT o un VLA mayor frente a un SmolVLA ajustado con 10 episodios en la misma tarea y el mismo robot.
- Docencia y formacion en robotica de imitacion: permite que un estudiante grabe sus propias demostraciones, entrene en una GPU de consumo y vea la politica ejecutandose en hardware real en una sola sesion.
- Prototipado de automatizacion de pick-and-place: en un piloto de linea de montaje con piezas siempre en la misma posicion y orientacion, la politica puede automatizar la operacion sin escribir un planificador geometrico.
- Reproduccion de resultados de investigacion: sirve como artefacto publico con el que replicar experimentos sobre VLA compactos y sobre el efecto del tamano del conjunto de demostraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La propia model card del autor indica explicitamente: «No evaluation results have been provided for this policy yet». No hay tasa de exito medida en robot real, ni numero de ensayos, ni comparacion con otras politicas sobre esta tarea.

## Requisitos de hardware

- Pesos: el repositorio ocupa 0,9 GB, coherente con 450 M de parametros en 16 bits (en fp32 los pesos solos ocuparian aproximadamente 1,8 GB).
- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Estimacion orientativa a partir del tamano del modelo y de las dos entradas de imagen de 480x640: del orden de 2 a 4 GB en 16 bits con las dos camaras activas.
- GPU recomendadas: no se especifica ninguna en la model card. Al tratarse de un modelo de 0,45 B, bastaria una GPU de consumo con al menos 4-6 GB de VRAM (por ejemplo RTX 3060, RTX 4060 o superiores). No requiere A100 ni H100.
- Cabe en GPU de consumo: si, segun la propia descripcion de SmolVLA como modelo desplegable en hardware de gama de consumo. No se documentan pruebas en CPU ni el rendimiento en ese caso.
- Opciones de despliegue: `lerobot-rollout` para ejecutar la politica en el robot y `lerobot-train` para reentrenarla, ambas sobre la libreria LeRobot y PyTorch. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Requisitos de integracion: robot `so_follower` calibrado, dos camaras OpenCV configuradas con los nombres `camera1` y `camera2` a 640x480 y 30 FPS, y los indices o rutas de dispositivo correctos.
- Latencia y throughput: no disponible. El bucle de control del conjunto de datos se grabo a 30 FPS, pero no se publica la frecuencia de inferencia alcanzada ni la latencia por paso.

## Comparativa con modelos similares

| Modelo | Parametros | Entradas | Rendimiento en esta tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `arshjeevs/smolvla-pickup-full` | 450 046 176 | estado 6-D + 2 camaras 480x640 | sin evaluacion publicada | apache-2.0 | Hub de Hugging Face |
| `lerobot/smolvla_base` | no disponible (mismo orden, es el base) | estado + camaras | no aplica: no esta ajustado a esta tarea | apache-2.0 | Hub de Hugging Face |
| `Andresg324/smolvla-cube-randomized-runpod` | no disponible | estado + camaras | no disponible | no disponible | Hub de Hugging Face |
| Politicas ACT de LeRobot (por ejemplo `arshjeevs/act_test_pickup_policy_3`) | no disponible | estado + camaras | no disponible | no disponible | Hub de Hugging Face |

No se dispone de datos publicados que permitan comparar el rendimiento real de estas politicas entre si sobre una misma tarea y un mismo robot.

## Limitaciones y advertencias

- Conjunto de entrenamiento muy reducido: 10 episodios y 8860 fotogramas para una unica tarea. La probabilidad de sobreajuste a las posiciones, iluminacion y objetos concretos de las demostraciones es alta.
- Sin evaluacion: no existe ninguna medida de tasa de exito, ni en simulacion ni en robot real. No hay base para afirmar que la politica funcione fuera del entorno de grabacion.
- Dependencia estricta del hardware: solo funciona con un robot `so_follower` y con dos camaras cuyos nombres coincidan exactamente con `camera1` y `camera2`. Cambiar el numero de camaras, su resolucion o su montaje invalida la politica.
- Riesgo de acciones inseguras: una politica de imitacion puede generar comandos erroneos ante entradas fuera de distribucion. Es imprescindible operar con limites de par, paradas de emergencia y espacio de trabajo despejado.
- Riesgo de alucinacion en el sentido de comportamiento incoherente: el modelo no verifica si el objeto ha sido agarrado; puede repetir movimientos sin exito o colisionar con objetos no vistos durante el entrenamiento.
- Alcance limitado: no es un modelo de lenguaje y no puede usarse para generacion de texto, codigo, razonamiento ni atencion al cliente.
- Idiomas: no se documenta soporte multilingue y la politica no produce lenguaje; la instruccion se usa como condicionamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, con obligacion de conservar el aviso de licencia. Conviene revisar igualmente la licencia del modelo base al redistribuir pesos derivados.
- Metadatos poco cuidados: el repositorio tiene 0 descargas y 0 likes, la model card es la plantilla generica de LeRobot y no incluye demostracion en video ni descripcion de la tarea mas alla de la cadena «pick and place the object».

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arshjeevs/smolvla-pickup-full
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/arshjeevs/so101-pick-place_20260926_222531
- Visualizador del conjunto de datos: https://huggingface.co/spaces/lerobot/visualize_dataset?path=arshjeevs/so101-pick-place_20260926_222531
- Articulo de SmolVLA (Hugging Face Papers): https://huggingface.co/papers/2506.01844
- Articulo de SmolVLA (arXiv): https://arxiv.org/abs/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos de LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Otro ajuste de SmolVLA del mismo autor: https://huggingface.co/arshjeevs/lora-policy
- Politica ACT del mismo autor: https://huggingface.co/arshjeevs/act_test_pickup_policy_3
- Ajuste de SmolVLA sobre cubo aleatorizado: https://huggingface.co/Andresg324/smolvla-cube-randomized-runpod
- Articulo divulgativo sobre ajuste de SmolVLA para pick and place: https://medium.com/@henryhu1607/genai-for-robotics-fine-tuning-smolvla-to-pick-and-place-940b485e6c9b
