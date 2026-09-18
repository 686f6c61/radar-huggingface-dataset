# roboseasylabs/29times

## Resumen

`roboseasylabs/29times` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el artículo arXiv:2304.13705 y disponible dentro del ecosistema LeRobot de Hugging Face. No es un modelo de lenguaje: es una política de aprendizaje por imitación que consume el estado articular de un brazo robótico y una imagen de cámara de muñeca, y produce directamente comandos de acción de 6 grados de libertad. El repositorio pertenece al usuario `roboseasylabs` y fue creado el 18 de septiembre de 2026.

El checkpoint tiene 51.668.614 parámetros (aproximadamente 51,7 millones) almacenados en formato safetensors, con un tamaño de repositorio de 0,2 GB, y se distribuye bajo licencia Apache-2.0. Está entrenado específicamente sobre el dataset `roboseasylabs/cube_4_Jang`, compuesto por 30 episodios y 10.023 fotogramas grabados a 30 FPS para una única tarea: coger un cubo y colocarlo sobre un plato.

Su relevancia es doble. Por un lado, sirve como ejemplo reproducible de un pipeline completo de imitation learning en LeRobot 0.6.0 (grabación de datos con teleoperación, entrenamiento y despliegue sobre un robot `so_follower`). Por otro, al ser un checkpoint de muy bajo número de parámetros, es útil como línea base para comparar políticas de manipulación y para experimentar con fine-tuning sobre hardware de consumo. El modelo acumula 0 descargas y 0 likes en el momento de la consulta y no publica resultados de evaluación en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer para aprendizaje por imitacion con prediccion de secuencias de acciones |
| Parametros totales | 51.668.614 (aproximadamente 51,7 M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; el horizonte de prediccion de acciones no se especifica en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye pesos safetensors en el formato de LeRobot) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la tarea se pasa como cadena de texto fija) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato de politica LeRobot) |
| Libreria | lerobot |
| Pipeline | robotics |
| Tipo de robot | `so_follower` |
| Camaras | `cam_wrist` |
| Entradas | `observation.state` (6,), `observation.images.cam_wrist` (3, 480, 640) |
| Salidas | `action` (6,) |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-18 |

## Arquitectura y entrenamiento

La model card identifica el modelo con el metodo ACT, descrito en el articulo "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705). ACT es un metodo de aprendizaje por imitacion que, en lugar de predecir una unica accion por paso de tiempo, predice fragmentos cortos de acciones (action chunks), lo que reduce el error de compounding y suele alcanzar tasas de exito altas en tareas de manipulacion. La implementacion utilizada es la de LeRobot, que entrena la politica sobre datos de teleoperacion.

Los datos de entrenamiento provienen del dataset `roboseasylabs/cube_4_Jang`: 30 episodios, 10.023 fotogramas a 30 FPS, una unica tarea ("Pick up the cube and place it on the plate") y una unica camara de muñeca. La configuracion de entrenamiento declarada es de 100.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5, semilla 1000 y LeRobot 0.6.0. No se documenta en la informacion disponible el numero de tokens, la composicion del dataset ni el uso de RLHF, DPO u otras fases de ajuste posteriores al entrenamiento supervisado.

## Capacidades

- Generacion de acciones de manipulacion: produce vectores de accion de 6 dimensiones a partir del estado articular de 6 dimensiones y de una imagen RGB de 480x640.
- Aprendizaje por imitacion de una tarea concreta: "Pick up the cube and place it on the plate", aprendida de 30 episodios teleoperados.
- Control de brazo robotico tipo `so_follower` con una camara de muñeca (`cam_wrist`) en bucle cerrado.
- Prediccion por chunks de acciones, segun el metodo ACT de referencia, en lugar de un unico paso de control.
- Compatibilidad con el flujo de LeRobot: entrenamiento con `lerobot-train`, evaluacion y despliegue con `lerobot-rollout`.
- Posibilidad de reentrenamiento o fine-tuning sobre nuevos datasets con `--policy.type=act`.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso simbolico, vision general, audio ni generacion de texto.

## Casos de uso

- Automatizacion de pick-and-place en laboratorio: la politica ejecuta la secuencia de coger un cubo y depositarlo sobre un plato en un brazo `so_follower`, con la camara de muñeca como unica entrada visual; es adecuada porque fue entrenada exactamente para esa tarea con 10.023 fotogramas.
- Linea base para investigacion en imitation learning: al tener 51,7 M de parametros y no requerir hardware de gama alta, sirve como referencia reproducible frente a metodos como Diffusion Policy dentro de LeRobot.
- Fine-tuning sobre nuevos objetos o posiciones: el checkpoint puede reentrenarse con `lerobot-train` y un dataset propio para adaptar la politica a variaciones de la tarea, aprovechando el aprendizaje previo.
- Validacion de infraestructura de robotica: util para verificar la cadena completa de LeRobot (calibracion, grabacion con camara, rollout con `--strategy.type=base` y control a 30 FPS) antes de invertir en datasets mayores.
- Recogida de datos en bucle con teleoperacion: la politica puede usarse en modo de ejecucion sobre el robot mientras se comparan episodios grabados, con `--duration` para limitar la ejecucion.
- Docencia y formacion en robotica: permite demostrar de extremo a extremo un pipeline de imitation learning con un coste de computo bajo y un dataset pequeno (0,2 GB de repositorio).
- Pruebas de robustez ante cambios de iluminacion o posicion: como el modelo no publica evaluacion, es un candidato razonable para medir sensibilidad al dominio antes de desplegarlo en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la seccion de evaluacion con la indicacion explicita de que no se han proporcionado resultados para esta politica ("No evaluation results have been provided for this policy yet").

Unicamente se dispone de la configuracion de entrenamiento declarada:

| Ajuste | Valor |
|---|---|
| Pasos de entrenamiento | 100.000 |
| Batch size | 8 |
| Optimizador | adamw |
| Learning rate | 1e-5 |
| Semilla | 1000 |
| Version de LeRobot | 0.6.0 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, 51,7 M de parametros ocupan aproximadamente 207 MB en fp32 y 103 MB en fp16, por lo que el modelo y el codificador visual caben holgadamente en cualquier GPU con 2-4 GB de VRAM (estimacion propia, no confirmada por el autor).
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 4 GB de VRAM. En la practica, tarjetas de consumo como RTX 3060, RTX 4060, RTX 3090 o RTX 4090 son suficientes para ejecutar la politica a la frecuencia de control de 30 FPS.
- Ejecucion en CPU: factible por tamano, aunque la latencia de inferencia por paso no esta documentada y puede comprometer el control a 30 FPS.
- Opciones de despliegue: `lerobot-rollout` con `--policy.path=roboseasylabs/29times` y `--strategy.type=base`; la libreria LeRobot (PyTorch) para integracion en Python. No aplica vLLM, llama.cpp, Ollama ni TGI, al no tratarse de un modelo de lenguaje.
- Latencia y throughput: no disponible. El unico dato temporal conocido es la frecuencia de captura del dataset de entrenamiento (30 FPS).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| roboseasylabs/29times (ACT) | 51,7 M | no aplica | sin resultados publicados | apache-2.0 | Hugging Face, libreria lerobot |
| Otras politicas ACT de LeRobot | no disponible | no aplica | no disponible | no disponible | ecosistema LeRobot |
| Diffusion Policy | no disponible | no aplica | no disponible | no disponible | implementacion disponible en LeRobot |
| SmolVLA y otras politicas VLA | no disponible | no disponible | no disponible | no disponible | ecosistema LeRobot |

No se dispone de datos comparativos numericos (parametros, contexto, tasas de exito o licencias) para los modelos alternativos en la informacion proporcionada; la comparacion se limita a la categoria de uso (politicas de manipulacion entrenadas con LeRobot).

## Limitaciones y advertencias

- No se han publicado resultados de evaluacion en robot real, por lo que se desconoce la tasa de exito de la tarea y no debe asumirse que funcione de forma fiable.
- Dataset de entrenamiento muy reducido: 30 episodios y 10.023 fotogramas para una unica tarea, lo que implica un riesgo alto de sobreajuste y de degradacion ante cambios de posicion, iluminacion, fondo o presencia de distractores.
- Entrenado para un tipo de robot concreto (`so_follower`) y una unica camara (`cam_wrist`); no es transferible directamente a otras morfologias, a otros numeros de articulaciones ni a otras disposiciones de camara.
- Las observaciones esperadas son fijas (`observation.state` de 6 dimensiones y `observation.images.cam_wrist` de 3x480x640); cualquier cambio en los nombres o formas de las claves rompe la inferencia.
- No procesa lenguaje ni mantiene conversaciones; no tiene capacidades de tool calling, agentes ni razonamiento multi-paso. La cadena de tarea se pasa como texto fijo.
- No aplica el concepto de alucinacion en el sentido de los modelos de lenguaje, pero si el de generalizacion erronea: la politica puede producir acciones incorrectas o inseguras fuera de la distribucion de entrenamiento.
- Riesgos fisicos: al controlar un brazo robotico real, una politica no validada puede provocar colisiones o danos; se recomienda ejecutarla con limites de espacio, parada de emergencia y velocidad reducida.
- La licencia Apache-2.0 permite uso comercial, pero no se documentan avisos sobre sesgos ni sobre el origen de los datos de teleoperacion.
- El repositorio tiene 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad ni mantenimiento posterior a la fecha de creacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/roboseasylabs/29times
- Dataset de entrenamiento: https://huggingface.co/datasets/roboseasylabs/cube_4_Jang
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=roboseasylabs/cube_4_Jang
- Articulo de ACT: https://huggingface.co/papers/2304.13705
- Articulo de ACT en arXiv: https://arxiv.org/abs/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Flujo de imitation learning: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

Nota: los resultados de la busqueda web proporcionada no contienen enlaces relacionados con el modelo ni con robótica, por lo que no se han incluido.
