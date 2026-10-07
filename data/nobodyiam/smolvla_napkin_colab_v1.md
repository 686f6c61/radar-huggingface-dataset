# nobodyiam/smolvla_napkin_colab_v1

## Resumen

SmolVLA napkin colab v1 es un modelo de vision-lenguaje-accion (VLA) entrenado por el usuario nobodyiam mediante LeRobot y publicado en HuggingFace Hub. Se trata de un ajuste fino (fine-tune) del modelo base lerobot/smolvla_base, orientado a una unica tarea robotica de manipulacion: coger una servilleta y colocarla sobre un papel blanco. El modelo consume el estado articular del robot y dos flujos de video (camaras "top" y "wrist") y produce un vector de accion de 6 dimensiones.

SmolVLA es una familia de VLA compactos descrita en el paper arXiv:2506.01844, disenada para ofrecer un rendimiento competitivo a un coste computacional reducido y poder desplegarse en hardware de consumo. El checkpoint cuenta con 450.046.176 parametros (aproximadamente 450 millones), lo que lo situa muy por debajo de otros VLA de gran tamano, y se distribuye en formato safetensors bajo licencia Apache 2.0.

Su relevancia es practica mas que general: demuestra el flujo completo de aprendizaje por imitacion con LeRobot (grabacion, entrenamiento y despliegue sobre un robot `so_follower`) a partir de un dataset propio de 50 episodios y 18.670 fotogramas. Es, por tanto, un ejemplo reproducible de politica robotica de tarea unica, no un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en el metodo SmolVLA, construida sobre un backbone de vision-lenguaje SmolVLM y experto de acciones (segun el paper arXiv:2506.01844) |
| Parametros totales | 450.046.176 (aproximadamente 450 millones) |
| Longitud de contexto | no disponible (modelo de control robotico; no se especifica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en precision nativa safetensors) |
| Idiomas soportados | no disponible (las instrucciones de tarea del dataset estan en ingles: "Grab napkin and place in white paper") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de lerobot/smolvla_base, que a su vez implementa el metodo SmolVLA referenciado en el paper arXiv:2506.01844. SmolVLA combina un backbone de vision-lenguaje compacto con un experto de acciones que genera comandos motores, lo que permite ejecutar control robotico en bucle cerrado sobre hardware de consumo en lugar de en grandes clústeres de GPU. La politica consume las observaciones `observation.state` (vector de 6 dimensiones), `observation.images.top` (3x1080x1920) y `observation.images.wrist` (3x720x1280), y emite `action` (vector de 6 dimensiones).

El entrenamiento se realizo con LeRobot 0.6.2 sobre el dataset nobodyiam/lerobot_dataset_20261006_172352, compuesto por 50 episodios, 18.670 fotogramas a 25 FPS y una unica tarea. La configuracion declarada es de 20.000 pasos de entrenamiento, batch size 8, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000. No se documenta el uso de RLHF, DPO ni otras fases de alineacion, algo esperable en aprendizaje por imitacion robotico. El autor no reporta innovaciones tecnicas adicionales ni resultados de evaluacion.

## Capacidades

- Generacion de acciones de control robotico de 6 grados de libertad a partir de observaciones visuales y de estado.
- Percepcion visual multi-camara: procesa simultaneamente una vista cenital (1080x1920) y una vista de muneca (720x1280).
- Aprendizaje por imitacion de tarea unica: ejecuta la instruccion "Grab napkin and place in white paper".
- Integracion con el ecosistema LeRobot para despliegue en robot `so_follower` mediante el comando `lerobot-rollout`.
- Compatibilidad con el pipeline de entrenamiento de LeRobot (`lerobot-train`) para reajuste sobre datasets propios.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje conversacional).
- Soporte de agentes y razonamiento multi-paso: no disponible en el sentido de agentes LLM; el modelo ejecuta una politica de control en bucle cerrado.
- Capacidades multilingues: no disponibles.
- Capacidades especiales: no disponibles (no hay modo "thinking", vision generativa ni audio; la vision se usa como entrada de percepcion, no como salida).

## Casos de uso

- Automatizacion de una celda de recogida y colocacion: el modelo ejecuta la secuencia concreta de coger una servilleta y depositarla sobre un papel blanco, adecuado para demostraciones de laboratorio con el robot `so_follower`.
- Banco de pruebas de aprendizaje por imitacion: sirve como referencia reproducible de un fine-tune de SmolVLA sobre 50 episodios, util para validar pipelines de LeRobot antes de escalar a datasets mayores.
- Prototipado rapido en robotica de bajo coste: al requerir hardware de consumo, permite iterar sobre politicas de manipulacion sin acceso a GPU de centro de datos.
- Formacion y docencia en robotica: ejemplo autocontenido de grabacion de datos, entrenamiento y despliegue con dos camaras y un robot SO-100/SO-101.
- Investigacion en generalizacion de politicas: sirve como punto de partida para estudiar como se degrada el rendimiento al variar posiciones de objetos, iluminacion o presencia de distractores.
- Base para transferencia a tareas relacionadas: puede reajustarse con `lerobot-train` sobre nuevos datasets de tareas de manipulacion similares (por ejemplo, colocar otros objetos en superficies delimitadas).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica, por lo que no existen tasas de exito en robot real ni metricas comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,9 GB en bf16 y 1,8 GB en fp32 solo para los pesos; el coste real es mayor al procesar dos flujos de imagen de alta resolucion (1080x1920 y 720x1280).
- GPU recomendadas: RTX 4090, RTX 3090, RTX 4080 y, en general, cualquier GPU con al menos 8-12 GB de VRAM para trabajar con comodidad a 25 FPS.
- Compatibilidad con GPU de consumo: si, el modelo (450 millones de parametros) esta disenado para hardware de consumo; el paper de SmolVLA indica que puede desplegarse en equipos de gama de consumo.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para reentrenamiento) sobre PyTorch. No aplica a vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles; el diseno de SmolVLA contempla inferencia asincrona para control en tiempo real a 25 FPS, pero no se aportan mediciones para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nobodyiam/smolvla_napkin_colab_v1 | 450.046.176 (aprox. 450 M) | no disponible | no disponible (sin evaluacion publicada) | apache-2.0 | HuggingFace Hub |
| lerobot/smolvla_base | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible en la informacion proporcionada | HuggingFace Hub |
| OpenVLA | aproximadamente 7.000 millones (informacion publica del proyecto) | no disponible | no disponible | licencia abierta segun el proyecto | HuggingFace Hub |
| pi0 (Physical Intelligence) | aproximadamente 3.000 millones (informacion publica del proyecto) | no disponible | no disponible | no disponible en la informacion proporcionada | distribucion del proyecto |

Nota: los datos de los modelos alternativos provienen de informacion publica general de cada proyecto y no de la informacion proporcionada para esta ficha; conviene verificarlos en sus repositorios oficiales.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; el modelo se entrena sobre un unico dataset de 50 episodios, por lo que probablemente hereda los sesgos de posicion, iluminacion y disposicion de objetos de esa grabacion.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero existe riesgo de acciones erraticas cuando la escena difiere de la distribucion de entrenamiento.
- Limitacion de tarea: es una politica de tarea unica ("Grab napkin and place in white paper"); no generaliza a otras instrucciones sin reentrenamiento.
- Limitacion de contexto e idioma: no se especifica ventana de contexto ni soporte multilingue; las instrucciones del dataset estan en ingles.
- Dependencia de hardware especifico: requiere un robot `so_follower` con dos camaras configuradas con los nombres `top` y `wrist` y las resoluciones esperadas.
- Ausencia de evaluacion: no hay tasas de exito publicadas, por lo que el rendimiento real en robot es desconocido y debe validarse antes de cualquier uso en produccion.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el modelo base y los datasets de terceros pueden imponer condiciones adicionales que conviene revisar.
- Madurez: 3 descargas y 0 "likes" en el momento de la consulta, lo que indica un artefacto experimental sin validacion por parte de la comunidad.
- Datos temporales: la fecha de creacion declarada en el Hub es 2026-10-07, dato a verificar por posible inconsistencia en los metadatos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nobodyiam/smolvla_napkin_colab_v1
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/nobodyiam/lerobot_dataset_20261006_172352
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=nobodyiam/lerobot_dataset_20261006_172352
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index

Nota: la busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los resultados obtenidos no guardaban relacion con la ficha.
