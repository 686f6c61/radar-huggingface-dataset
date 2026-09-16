# ethan-svlh/hf_act_oneBattery_merged

## Resumen

`ethan-svlh/hf_act_oneBattery_merged` es una política de robótica entrenada con Action Chunking with Transformers (ACT), un método de aprendizaje por imitación presentado en el artículo arXiv:2304.13705 que predice bloques cortos de acciones en lugar de pasos individuales. No es un modelo de lenguaje: es un controlador visomotor que consume el estado articular de un brazo robótico y dos cámaras (muñeca y cenital) y produce comandos de acción de 6 grados de libertad.

El modelo lo publica el usuario `ethan-svlh` mediante la librería LeRobot de Hugging Face, sobre el robot `so_follower` (brazo SO-100/SO-101). Se ha entrenado con el dataset `ethan-svlh/oneBattery_merged`, compuesto por 101 episodios y 29.700 fotogramas a 30 FPS para una única tarea: «pick and place the block» (coger y colocar el bloque).

Su relevancia es práctica más que arquitectónica: es un ejemplo reproducible y ligero (51,67 millones de parámetros, 0,2 GB de repositorio) de cómo entrenar, publicar y desplegar una política de imitación con LeRobot en hardware de bajo coste. El repositorio no incluye resultados de evaluación en robot real ni métricas de éxito, por lo que su utilidad como referencia es metodológica, no comparativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con codificador visual y cuello VAE; no disponible el detalle exacto de capas en la informacion proporcionada |
| Parametros totales | 51.668.614 (aprox. 51,7 millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible; no es un modelo de lenguaje. Emplea action chunking, cuyo tamano de bloque no se especifica en la informacion disponible |
| Tipos de cuantizacion | no disponible (no se documenta ninguna cuantizacion; los pesos se distribuyen en safetensors) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la tarea se especifica mediante una cadena de texto, «pick and place the block») |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio de 0,2 GB, gestionado con LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que aprende de datos de teleoperación y predice un bloque de acciones futuras en lugar de una sola accion, lo que reduce el problema de horizonte largo y el error de compounding típico de las políticas reactivas. La política consume tres entradas: `observation.state` con forma `(6,)`, y dos flujos visuales `observation.images.wrist` y `observation.images.top`, ambos de `(3, 480, 640)`. La salida es `action` con forma `(6,)`, correspondiente a las 6 articulaciones del robot `so_follower`. La implementación emplea el codificador de ACT con un cuello de tipo VAE sobre las acciones, habitual para modelar la multimodaldad de las demostraciones humanas.

El entrenamiento se realizó con LeRobot 0.6.2 durante 20.000 pasos, con tamano de lote 8, optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000. El conjunto de datos contiene 101 episodios y 29.700 fotogramas capturados a 30 FPS, todos ellos correspondientes a una única tarea. No se documenta el número de tokens, la composición detallada del dataset, ni si hubo etapas de RLHF o DPO, algo que no aplica a este tipo de política. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal, ni resultados de evaluación en robot real.

## Capacidades

- Generación de bloques de acciones de 6 grados de libertad para control visomotor de un brazo `so_follower`.
- Percepción visual dual: procesa simultáneamente una cámara en la muñeca y una cámara cenital a resolución 480x640.
- Fusión de estado propioceptivo (`observation.state`, 6 valores) con entrada visual.
- Aprendizaje por imitación a partir de demostraciones teleoperadas; no requiere definición explícita de recompensas.
- Ejecución de una tarea concreta de manipulación: «pick and place the block».
- No soporta generación de texto ni razonamiento en lenguaje natural.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM; el razonamiento se limita al horizonte de acción predicho.
- No tiene capacidades multilingües ni modo «thinking», visión generativa, audio u otras modalidades más allá de la entrada visual de control.

## Casos de uso

- Manipulación pick-and-place en laboratorio: la política recibe el estado del brazo y las dos cámaras y emite comandos articulares para coger un bloque y colocarlo, que es exactamente la tarea con la que fue entrenada. Es adecuada porque el modelo está especializado en esa distribución de datos y en ese robot.
- Base de referencia para investigación en aprendizaje por imitación: sirve como punto de partida reproducible (20.000 pasos, lote 8, AdamW, lr 1e-5) para comparar variantes de ACT, cambios de backbone visual o estrategias de aumento de datos.
- Reentrenamiento con datos propios: la configuración de entrenamiento documentada permite replicar el pipeline con `lerobot-train` sobre un dataset propio y el mismo tipo de política, variando únicamente `--dataset.repo_id` y el repositorio de salida.
- Docencia y formación en robótica de bajo coste: al ejecutarse sobre un brazo tipo SO-100/SO-101 y ocupar solo 0,2 GB, es viable montar prácticas de teleoperación, grabación de datos y despliegue en un aula con hardware asequible.
- Automatización de tareas repetitivas de baja variabilidad: en un puesto fijo con iluminación controlada y posiciones de objeto consistentes, la política puede ejecutar el ciclo de recogida y colocación de forma continua mediante `lerobot-rollout` con `--strategy.type=base`.
- Recolección de datos para escalado: el propio comando de rollout documentado permite ejecutar la política durante un periodo y observar su comportamiento, útil para identificar modos de fallo y planificar nuevas rondas de teleoperación.
- Integración en cadenas de evaluación de políticas robóticas: el modelo se puede insertar en un banco de pruebas interno para medir tasas de éxito por tarea, siempre que se documenten los resultados, algo que este repositorio no hace.
- Prototipado rápido de demos: gracias a su tamano reducido, se puede desplegar en un portátil con GPU de gama media para demostraciones en vivo sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion con la frase explicita «No evaluation results have been provided for this policy yet», sin tabla de tareas, ensayos ni tasas de exito en robot real.

| Metrica | Resultado |
|---|---|
| Tasa de exito en robot real | no disponible |
| MMLU, HumanEval, GSM8K u otros benchmarks de lenguaje | no aplica / no disponible |
| Numero de ensayos de evaluacion | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: a partir de los 51,67 millones de parametros, los pesos ocupan aproximadamente 207 MB en fp32 y unos 103 MB en fp16. Sumando activaciones de los dos flujos de imagen a 480x640 y el estado interno del transformer, el consumo total previsible se mantiene por debajo de 1-2 GB. Es una estimacion derivada del recuento de parametros, no un dato publicado.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente en la practica. El propio flujo de LeRobot se documenta con `--policy.device=cuda`, por lo que se espera el uso de GPU NVIDIA. No se especifican modelos concretos en la informacion proporcionada.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en GPU de consumo como las series RTX 3060, RTX 4060 o RTX 4090, e incluso es plausible su ejecucion en CPU para pruebas puntuales, aunque no se documenta.
- Opciones de despliegue: `lerobot-rollout` es el mecanismo documentado por el autor para ejecutar la politica sobre el robot. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a una politica de robot de este tipo.
- Latencia y throughput: no disponible. No se publican mediciones de frecuencia de inferencia ni de tiempo por bloque de accion.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de modelos alternativos, por lo que la comparacion es cualitativa. Se incluyen como referencia de categoria la propia ACT original y otros enfoques habituales de politica visomotora.

| Modelo | Parametros | Contexto / horizonte | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ethan-svlh/hf_act_oneBattery_merged` | 51,67 M | action chunking, tamano no disponible | no disponible | apache-2.0 | Hugging Face, via LeRobot |
| ACT original (arXiv:2304.13705) | no disponible | action chunking | no disponible en esta ficha | no disponible | paper y repositorio del metodo |
| Diffusion Policy | no disponible | prediccion de trayectorias por difusion | no disponible en esta ficha | no disponible | no disponible |
| SmolVLA | no disponible | politica visomotora con componente de lenguaje | no disponible en esta ficha | no disponible | no disponible |

No se dispone de datos verificados de parametros, contexto o rendimiento de las alternativas dentro de la informacion consultada, por lo que no se puede establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Entrenada para una unica tarea («pick and place the block») sobre un unico tipo de robot (`so_follower`); no se espera generalizacion a otras tareas, objetos o morfologias sin reentrenamiento.
- No hay ninguna evaluacion publicada: se desconoce la tasa de exito real, la robustez ante cambios de iluminacion, posicion del objeto o presencia de distractores.
- No se documenta el sesgo del dataset mas alla del nombre del repositorio y sus recuentos; con 101 episodios de una sola tarea, la diversidad de escenas y posiciones es presumiblemente muy limitada.
- Riesgo de sobreajuste al entorno de grabacion: la politica depende de las dos camaras concretas (`wrist` y `top`) y de sus nombres de observacion, que deben coincidir exactamente con los del entrenamiento al ejecutar `lerobot-rollout`.
- No es un modelo de lenguaje: no genera texto, no razona en lenguaje natural, no soporta tool calling ni agentes, y no dispone de capacidades multilingues.
- No se documentan cuantizaciones ni pesos en formato GGUF, por lo que no se puede reducir aun mas el footprint sin reconvertir los pesos.
- La licencia apache-2.0 permite uso comercial y modificacion, con los requisitos habituales de atribucion y conservacion del aviso de licencia. Es responsabilidad de quien lo despliegue verificar la trazabilidad de los datos de entrenamiento del dataset asociado.
- Los metadatos temporales del repositorio (creacion y actualizacion en septiembre de 2026) son posteriores a la fecha de consulta habitual; conviene verificar la vigencia y autenticidad de las fechas antes de citarlas.
- El repositorio no incluye demo, video ni instrucciones de seguridad para operar el brazo; en despliegues reales deben aplicarse limites de par, paradas de emergencia y validacion del espacio de trabajo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ethan-svlh/hf_act_oneBattery_merged
- Dataset de entrenamiento: https://huggingface.co/datasets/ethan-svlh/oneBattery_merged
- Visualizador del dataset en Spaces: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ethan-svlh/oneBattery_merged
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion general de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Flujo de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

Nota: la busqueda web realizada no devolvio ningun resultado tecnico relacionado con el modelo, su autor o el dataset; los enlaces encontrados correspondian a paginas sobre el nombre propio «Ethan» y a una entrada enciclopedica sobre una persona no relacionada, por lo que se han descartado.
