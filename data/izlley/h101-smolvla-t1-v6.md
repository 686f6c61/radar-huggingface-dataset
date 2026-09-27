# izlley/h101-smolvla-t1-v6

## Resumen

`izlley/h101-smolvla-t1-v6` es un ajuste fino del modelo SmolVLA (Vision-Language-Action) orientado al control de un brazo robotico bimanual SO-101 (plataforma Humanoid-101). Parte del checkpoint base `lerobot/smolvla_base` y se ha entrenado sobre el dataset `izlley/h101_t1_pickplace_v6` para resolver la tarea T1 de coger y colocar objetos. Se distribuye bajo licencia Apache-2.0 y en formato safetensors dentro del ecosistema LeRobot.

El modelo tiene aproximadamente 450 millones de parametros y utiliza generacion de acciones por chunks de 50 pasos con un objetivo de flow matching. Es un modelo pequeno para los estandares de la robotica basada en VLA, lo que le permite ejecutarse en hardware de consumo (Apple Silicon via MPS) sin necesidad de GPU de datacenter, con una latencia reportada de 0,45 segundos por chunk.

Su relevancia actual radica en que demuestra un flujo de trabajo completo y reproducible de fine-tuning de un VLA open source sobre un brazo de bajo coste, con receta, parches y comandos de rollout publicados en un repositorio de GitHub. Es la antesala de un sucesor multi-tarea (`izlley/h101-smolvla-multi-v1`) y sirve como punto de partida para quien quiera adaptar SmolVLA a tareas concretas de manipulacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) derivada de SmolVLA; transformer con flow matching para generacion de acciones |
| Parametros totales | ~450 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo VLA; emite chunks de 50 acciones) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/smolvla_base |
| Dataset de ajuste | izlley/h101_t1_pickplace_v6 |
| Tamano del repositorio | 1,2 GB |
| Tarea objetivo | T1 (pick and place) sobre SO-101 bimanual |
| Libreria | lerobot |

## Arquitectura y entrenamiento

Se trata de un modelo de la familia SmolVLA, que combina un backbone vision-lenguaje con un modulo de generacion de acciones entrenado mediante flow matching. La salida no es texto sino una secuencia de acciones motoras, agrupadas en chunks de 50 pasos, lo que reduce la frecuencia de inferencia necesaria para controlar el robot. El checkpoint se ha obtenido por fine-tuning del modelo base `lerobot/smolvla_base`, no por entrenamiento desde cero.

El ajuste fino se realizo sobre el dataset `izlley/h101_t1_pickplace_v6`, compuesto por 34 episodios y 19.337 fotogramas, con recorte del inicio inactivo de cada episodio. La configuracion de entrenamiento fue de batch 64 durante 20.000 pasos, con una perdida final de 0,012. No se documentan en la informacion disponible fases de RLHF o DPO, ni detalles sobre la composicion exacta del corpus de preentrenamiento del modelo base.

Entre los aspectos tecnicos destacables del despliegue figuran el uso de RTC (Real-Time Chunking) con un `execution_horizon` de 20 y un parche de suavizado de chunks basado en filtro Savitzky-Golay. La inferencia se ha validado en un equipo Mac con backend MPS a 0,45 segundos por chunk. La carpeta `020000/` del repositorio corresponde al `pretrained_model` esperado por LeRobot.

## Capacidades

- Generacion de acciones de manipulacion robotica: produce comandos motores para un brazo SO-101 bimanual.
- Percepcion visual: consume imagenes de camara como entrada, ademas del estado del robot.
- Condicionamiento por tarea en lenguaje natural, heredado del backbone VLA de SmolVLA.
- Ejecucion de la tarea T1 de pick and place con agarre verificado cualitativamente ("grasps succeed").
- Manipulacion bimanual (dos brazos coordinados).
- Generacion de acciones en chunks de 50 pasos con flow matching.
- Compatible con el bucle de control en tiempo real de LeRobot (RTC) y suavizado de trayectorias.
- No realiza generacion de texto, codigo ni matematicas: su salida es accion motora, no contenido linguistico.
- No soporta tool calling ni function calling en el sentido de los LLM.
- Capacidades multilingues: no disponible.

## Casos de uso

- Pick and place bimanual con SO-101: el modelo ejecuta la tarea T1 de coger y colocar objetos usando los dos brazos, con chunks de 50 acciones y RTC para mantener el control en tiempo real.
- Fine-tuning de nuevas tareas: sirve como punto de partida (o como referencia de receta) para ajustar SmolVLA a otras tareas de manipulacion con datasets propios de pocas decenas de episodios.
- Investigacion en robot learning: permite estudiar el efecto del numero de episodios, el recorte de tramos inactivos y el suavizado de chunks sobre la tasa de exito, con un coste computacional bajo.
- Despliegue en laboratorio con hardware de consumo: al ejecutarse en Apple Silicon a 0,45 s/chunk, es viable en un Mac para montajes docentes o de prototipado sin GPU dedicada.
- Generacion de politicas para recoleccion de datos: puede usarse como politica inicial para teleoperacion asistida o para preetiquetar episodios antes de una revision humana.
- Pruebas sim-to-real y validacion de pipelines LeRobot: sirve para verificar el flujo completo de entrenamiento, exportacion de checkpoint y rollout sobre el robot real.
- Docencia en robotica y VLA: al ser un modelo de 450 M con licencia Apache-2.0 y receta publica, es adecuado para cursos practicos de manipulacion.
- Base para el sucesor multi-tarea: el autor indica que existe `izlley/h101-smolvla-multi-v1`, por lo que este checkpoint es util como linea base de comparacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan cifras de MMLU, HumanEval, GSM8K ni metricas estandar de robotica (tasas de exito cuantificadas, por ejemplo). Los unicos datos de rendimiento disponibles son la perdida final de entrenamiento y una observacion cualitativa de exito en los agarres de la tarea T1:

| Metrica | Valor | Contexto |
|---|---|---|
| Perdida final de entrenamiento | 0,012 | 20.000 pasos, batch 64 |
| Episodios de entrenamiento | 34 | dataset h101_t1_pickplace_v6 |
| Fotogramas de entrenamiento | 19.337 | inicio inactivo recortado |
| Latencia de inferencia | 0,45 s/chunk | Mac MPS, con RTC |
| Exito en tarea T1 | "grasps succeed" (cualitativo) | sin tasa de exito numerica |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,8 GB en fp32 y 0,9 GB en bf16/fp16 para 450 M de parametros; el repositorio ocupa 1,2 GB.
- Cabe holgadamente en GPU de consumo: cualquier tarjeta con 4 GB o mas de VRAM (RTX 3050, RTX 3060, RTX 4060, RTX 4090, etc.).
- Tambien se ejecuta en Apple Silicon via MPS; el autor reporta 0,45 s/chunk en un Mac.
- No requiere GPU de datacenter (A100/H100) para inferencia; estas solo tendrian sentido para reentrenamiento o fine-tuning a mayor escala.
- Opciones de despliegue: libreria LeRobot (nativa, con la carpeta `020000/` como `pretrained_model`), usando RTC con `execution_horizon` 20 y suavizado Savitzky-Golay.
- No es compatible con runtimes de LLM como vLLM, llama.cpp, Ollama o TGI, ya que su salida son acciones motoras y no tokens de texto.
- Throughput/latencia: 0,45 s/chunk en Mac MPS como unico dato publicado; no hay cifras para GPU discreta.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|
| izlley/h101-smolvla-t1-v6 | ~450 M | VLA ajustado para SO-101, tarea T1 | apache-2.0 | HuggingFace, repo 1,2 GB |
| lerobot/smolvla_base | ~450 M | VLA base (checkpoint del que deriva) | no disponible en la informacion | HuggingFace (lerobot) |
| OpenVLA | ~7 B | VLA generalista de manipulacion | no disponible en la informacion | publico |
| pi0 / pi-zero | ~3 B | VLA de proposito general para robotica | no disponible en la informacion | publico |

Los datos de rendimiento de las alternativas no se han verificado en la informacion proporcionada, por lo que no se incluyen tasas de exito ni benchmarks comparativos. La diferencia principal frente a OpenVLA o pi0 es el tamano: este modelo, con 450 M de parametros, apunta a despliegue en hardware de consumo, mientras que las alternativas citadas son entre seis y quince veces mayores.

## Limitaciones y advertencias

- Especificidad de tarea: el ajuste esta pensado para la tarea T1 (pick and place) sobre SO-101; su comportamiento fuera de ese contexto no esta garantizado.
- Riesgo de sobreajuste al entorno: con solo 34 episodios y 19.337 fotogramas, la robustez ante cambios de iluminacion, posicion de objetos o fondo es limitada.
- Sin datos de idioma: no se especifican los idiomas soportados por el componente linguistico, lo que impide garantizar el condicionamiento en castellano.
- Sin benchmarks cuantitativos: no hay tasas de exito publicadas, solo una observacion cualitativa de que los agarres funcionan; no se debe asumir un rendimiento minimo.
- Sin informacion sobre cuantizacion: no se documentan variantes cuantizadas (GGUF, AWQ, etc.); el uso esta ligado al formato safetensors y a LeRobot.
- Dependencia del ecosistema LeRobot: la integracion con RTC y el suavizado Savitzky-Golay forma parte de un flujo con parches propios publicados en GitHub, lo que puede complicar la reproducibilidad fuera de ese stack.
- Hardware objetivo concreto: las pruebas de rollout se han hecho sobre SO-101 bimanual; transferir la politica a otra morfologia requeriria reentrenamiento.
- Licencia Apache-2.0: permite uso comercial, pero no cubre posibles patentes ni los terminos del modelo base ni del dataset, que no se detallan en la informacion disponible.
- Riesgo de alucinacion en el sentido linguistico: no aplica, al no generar texto; el riesgo equivalente es la generacion de acciones erroneas o inseguras en el robot.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/izlley/h101-smolvla-t1-v6
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de ajuste: https://huggingface.co/datasets/izlley/h101_t1_pickplace_v6
- Sucesor multi-tarea: https://huggingface.co/izlley/h101-smolvla-multi-v1
- Repositorio con receta, parches y comandos de rollout: https://github.com/izlley/Robotics (sub-proyecto humanoid-101, docs 06/07, code-deltas/lerobot)
- No se han encontrado otros enlaces relevantes en la busqueda web realizada.
