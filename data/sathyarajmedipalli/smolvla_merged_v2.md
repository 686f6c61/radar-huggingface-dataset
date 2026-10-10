# SathyarajMedipalli/smolvla_merged_v2

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto orientado a robótica, desarrollado originalmente por Hugging Face y publicado con el paper arXiv:2506.01844. La ficha que se analiza aquí, `SathyarajMedipalli/smolvla_merged_v2`, no es el modelo base sino un ajuste fino del checkpoint `lerobot/smolvla_base`, entrenado por el usuario SathyarajMedipalli mediante la librería LeRobot para una tarea concreta de manipulación: coger un llavero y depositarlo en una caja negra. El modelo tiene 450.046.176 parámetros (aproximadamente 450 millones) y un repositorio de 0,9 GB en formato safetensors.

El problema que resuelve es el control de un brazo robótico de bajo coste (tipo `so_follower`, familia SO-100/SO-101) a partir de observaciones multimodales: el estado articular de 6 grados de libertad y hasta cuatro cámaras, incluyendo tres vistas a 256x256 y una cuarta a 480x640. La salida es un vector de acción de 6 dimensiones, es decir, la política genera directamente comandos de articulación, no texto.

Su relevancia actual es doble. Por un lado, demuestra que una política VLA de 450 millones de parámetros puede entrenarse y ejecutarse en hardware de consumo, sin necesidad de clústeres de GPUs. Por otro lado, sirve como ejemplo reproducible del flujo completo de LeRobot (grabación de datos, entrenamiento supervisado, publicación en el Hub y despliegue con `lerobot-rollout`). Como contrapartida, es un ajuste fino de una única tarea, con 212 episodios de entrenamiento, 0 descargas, 0 "likes" y sin resultados de evaluación publicados, por lo que su utilidad práctica fuera de ese escenario concreto está por verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en un VLM compacto con experto de accion; ajuste fino de `lerobot/smolvla_base` |
| Parametros totales | 450.046.176 (aprox. 450 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (politica de robot, no modelo de lenguaje conversacional) |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors (0,9 GB, compatible con bf16/fp16) |
| Idiomas soportados | No disponible; la politica se ha entrenado con instrucciones en ingles ("grab keychain and place in the black box", "test_grab_object") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Entradas | `observation.state` (6,); `observation.images.camera1/2/3` (3, 256, 256); `observation.images.empty_camera_0` (3, 480, 640) |
| Salidas | `action` (6,) |
| Tipo de robot | `so_follower` |
| Camaras declaradas | `arm`, `overview` |
| Fecha de creacion | 2026-10-10 |
| Ultima actualizacion | 2026-10-10 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

Segun el paper referenciado (arXiv:2506.01844), SmolVLA es un modelo de vision-lenguaje-accion compacto que combina un modelo de vision-lenguaje preentrenado de pequeno tamano con un modulo generador de acciones, y que se entrena sobre datos de demostracion de robots. El modelo base `lerobot/smolvla_base` se distribuye con 450 millones de parametros y esta disenado para ejecutarse en hardware de consumo. En esta ficha no se dispone de la descomposicion exacta del backbone, del numero de capas ni del mecanismo concreto de generacion de acciones del checkpoint ajustado, por lo que esos detalles quedan como "no disponible".

El ajuste fino se realizo con LeRobot 0.6.0 sobre el dataset `SathyarajMedipalli/keychain_merged_v2`: 212 episodios y 89.842 fotogramas grabados a 30 FPS (aproximadamente 50 minutos de datos), correspondientes a las tareas "grab keychain and place in the black box" y "test_grab_object". La configuracion de entrenamiento reportada es de 38.000 pasos, tamano de lote 32, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000. Se trata, por tanto, de aprendizaje por imitacion supervisado (behavior cloning) sobre demonstraciones teleoperadas; no hay indicios de RLHF, DPO ni aprendizaje por refuerzo en la informacion disponible. El sufijo `_merged_v2` sugiere alguna operacion de mezcla de pesos, pero no se documenta ni el metodo ni los checkpoints de origen.

## Capacidades

- Generacion de acciones de robot: produce un vector de accion de 6 dimensiones a partir del estado articular y de imagenes, adecuado para un brazo `so_follower`.
- Percepcion visual multi-camara: consume tres vistas a 256x256 y una cuarta a 480x640, lo que permite condicionar la politica con informacion de distintas perspectivas de la escena.
- Condicionamiento por instruccion en lenguaje natural: acepta una cadena de tarea (por ejemplo, "grab keychain and place in the black box") como parte de la entrada.
- Aprendizaje por imitacion: reproduce comportamientos demostrados en el dataset de entrenamiento, sin necesidad de definir recompensas.
- Despliegue en hardware de consumo: segun la model card, es un modelo compacto y eficiente pensado para ejecutarse en equipos de gama de consumo.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; es una politica reactiva de control, no un agente de planificacion.
- Capacidades multilingues: no disponibles; las instrucciones del dataset estan en ingles.
- Capacidades especiales (vision, audio, thinking mode): vision si, audio no disponible, thinking mode no disponible.

## Casos de uso

- Manipulacion pick-and-place de objetos pequenos: es el caso para el que fue entrenado explicitamente, coger un llavero y dejarlo en una caja negra sobre un brazo `so_follower` con dos o mas camaras. Se usaria tal cual con `lerobot-rollout` y la tarea indicada.
- Banco de pruebas para investigacion en VLA de bajo coste: al tener 450 M de parametros y licencia Apache 2.0, permite estudiar tecnicas de ajuste fino por imitacion en un brazo SO-100/SO-101 sin recurrir a GPUs de datacenter.
- Punto de partida para fine-tuning en tareas de recogida y deposito: el propio flujo de LeRobot permite reentrenar desde `lerobot/smolvla_base` o desde este checkpoint con un dataset propio que comparta configuracion de camaras y espacio de acciones.
- Validacion de pipelines de datos en LeRobot: el dataset asociado (212 episodios, 89.842 fotogramas, 30 FPS) y el modelo sirven para verificar de extremo a extremo la grabacion, el formateo y el entrenamiento antes de escalar a datasets mayores.
- Docencia y practicas de robotica: al ser un modelo pequeno con licencia permisiva, es adecuado para laboratorios donde se ensene aprendizaje por imitacion con hardware asequible.
- Comparativa interna de politicas: puede usarse como linea base frente a otras politicas de LeRobot (ACT, Diffusion Policy) en la misma celda robotica, siempre que se registren metricas de exito propias, ya que el autor no publica ninguna.
- Tareas de clasificacion o alimentacion de piezas pequenas en entornos controlados: viable solo tras un ajuste fino con datos del nuevo objeto y con iluminacion y posiciones similares a las de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente: "No evaluation results have been provided for this policy yet". No hay tasas de exito en robot real, ni numero de ensayos, ni comparaciones con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,9 GB solo para los pesos en bf16/fp16 y unos 1,8 GB en fp32. Sumando activaciones, buffers de imagenes (cuatro camaras, una de ellas a 480x640) y el bucle de control, un presupuesto practico de 2 a 4 GB de VRAM es razonable; no hay mediciones oficiales publicadas.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM. La model card afirma que el modelo esta pensado para hardware de consumo, por lo que una RTX 3060, RTX 4060, RTX 4090 o similares son suficientes. GPU de datacenter como A100 o H100 no son necesarias y estarian sobredimensionadas.
- Compatibilidad con GPU de consumo: si, es uno de los puntos fuertes declarados del modelo. Tambien deberia poder ejecutarse en CPU o en Apple Silicon, aunque no hay datos de latencia publicados para este checkpoint.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) para ejecucion en robot, y `lerobot-train` para reentrenamiento, ambos sobre PyTorch/CUDA. No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama, que ademas no aplican a un modelo de acciones con formato safetensors de LeRobot.
- Latencia y throughput: no disponibles. El bucle de control del dataset esta grabado a 30 FPS, lo que marca el orden de magnitud temporal de las demostraciones, pero no se especifica la frecuencia de inferencia alcanzada en robot real.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Disponibilidad | Resultados publicados |
|---|---|---|---|---|---|
| `SathyarajMedipalli/smolvla_merged_v2` | 450 M | VLA (ajuste fino de SmolVLA) | apache-2.0 | Hugging Face, libreria LeRobot | No (0 resultados reportados) |
| `lerobot/smolvla_base` | 450 M | VLA (modelo base) | no disponible en la informacion proporcionada | Hugging Face | No disponible en esta ficha |
| OpenVLA y variantes | aprox. 7.000 M | VLA | no disponible en la informacion proporcionada | Hugging Face | No disponible en esta ficha |
| Politicas de imitacion de LeRobot (ACT, Diffusion Policy) | no disponible | Politicas de control por imitacion | no disponible en la informacion proporcionada | Implementadas en LeRobot | No disponible en esta ficha |

No se dispone de datos verificados en la informacion proporcionada para comparar rendimiento, contexto o tasas de exito con alternativas. Los valores de parametros de modelos de terceros deben tratarse como aproximados y referidos a sus versiones base.

## Limitaciones y advertencias

- Especializacion extrema: el modelo esta ajustado para una unica tarea ("grab keychain and place in the black box") y un unico tipo de robot (`so_follower`). Fuera de ese escenario los resultados son impredecibles.
- Dataset muy reducido: 212 episodios y 89.842 fotogramas (unos 50 minutos a 30 FPS) son insuficientes para esperar robustez ante variaciones de iluminacion, posicion de objetos, distractores o fondos distintos.
- Sin evaluacion: el autor no publica ninguna tasa de exito ni numero de ensayos, por lo que no se puede afirmar que la politica funcione de forma fiable ni siquiera en la tarea objetivo.
- Sensibilidad a la configuracion de entrada: la politica espera claves de observacion concretas, incluyendo `observation.images.empty_camera_0` a 480x640 junto a tres camaras a 256x256. Si los nombres de camara o las resoluciones no coinciden exactamente, la inferencia fallara o producira acciones invalidas.
- Ambiguedad del sufijo `merged_v2`: no se documenta que tecnica de mezcla de pesos se aplico ni con que checkpoints, lo que dificulta reproducir el resultado.
- Riesgo de sobreajuste y de fallo silencioso: en politicas de imitacion, un cambio de distribucion (nueva posicion del objeto, distinta mesa) suele producir movimientos erroneos sin aviso explicito. No hay deteccion de incertidumbre ni mecanismo de rechazo.
- Idiomas: aunque el backbone de vision-lenguaje pueda ser multilingue, las instrucciones del dataset estan en ingles; no hay evidencia de que acepte instrucciones en castellano.
- Sin validacion comunitaria: 0 descargas y 0 "likes" en el momento de la consulta; el modelo no ha sido reproducido por terceros.
- Licencia: apache-2.0 permite uso comercial y modificacion, pero el autor no ofrece garantias. Conviene revisar la licencia y las condiciones del modelo base `lerobot/smolvla_base` antes de un despliegue comercial.
- Seguridad fisica: cualquier despliegue sobre un brazo real debe incluir limites de par, paradas de emergencia y espacio de trabajo acotado; un modelo de imitacion puede generar acciones fuera de rango.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SathyarajMedipalli/smolvla_merged_v2
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/SathyarajMedipalli/keychain_merged_v2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SathyarajMedipalli/keychain_merged_v2
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Imagen de arquitectura citada en la model card: https://cdn-uploads.huggingface.co/production/uploads/640e21ef3c82bd463ee5a76d/aooU0a3DMtYmy_1IWMaIM.png

Nota: la busqueda web realizada no ha devuelto ningun enlace relevante sobre el modelo; los resultados obtenidos eran sitios de contenido para adultos sin relacion con el objeto de esta ficha, por lo que se han descartado.
