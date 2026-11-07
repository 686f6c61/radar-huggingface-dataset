# kiteml/gr00t-n1.7-g1-sonic-desk-apple

## Resumen

`kiteml/gr00t-n1.7-g1-sonic-desk-apple` es un ajuste fino del modelo vision-lenguaje-accion (VLA) `nvidia/GR00T-N1.7-3B` para una tarea concreta de manipulacion robotica: coger una manzana de una mesa y colocarla en un plato. El modelo esta especializado en el embodiment `UNITREE_G1_SONIC`, es decir, un robot humanoide Unitree G1 con manos Dex3 controlado mediante el controlador de cuerpo completo GEAR-SONIC v1.1 de NVIDIA. Lo publica el usuario `kiteml` (Kite) bajo la licencia abierta de NVIDIA.

El modelo recibe como entrada la imagen de la camara de la cabeza, el estado del robot y una instruccion en lenguaje natural, y produce 40 pasos (0,8 s a 50 Hz) de tokens de movimiento SONIC junto con objetivos para las manos Dex3. Se trata, por tanto, de un modelo de politica (policy) para control de robots, no de un modelo conversacional de proposito general. Su relevancia radica en que demuestra un flujo completo de ajuste fino de un VLA de 3B parametros sobre datos teleoperados y simulados, con evaluacion cuantitativa detallada.

La arquitectura subyacente es la de GR00T N1.7, un transformer VLA de 3.144.016.000 parametros (segun los pesos en safetensors) construido sobre el backbone Cosmos-Reason2. El ajuste fino se realizo con `launch_finetune.py` de Isaac-GR00T sobre 824 episodios (160.415 fotogramas a 50 Hz) en una unica A100 de 40 GB durante unas 3 horas, hasta el checkpoint 20.000.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) basada en GR00T N1.7, backbone Cosmos-Reason2 |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de entrenamiento estan en ingles) |
| Licencia | NVIDIA Open Model License |
| Formato de pesos | safetensors |
| Embodiment | UNITREE_G1_SONIC (Unitree G1 con manos Dex3 y controlador GEAR-SONIC v1.1) |
| Entrada | Imagen de camara de cabeza, estado del robot, instruccion en lenguaje natural |
| Salida | 40 pasos (0,8 s) de tokens de movimiento SONIC y objetivos de manos Dex3 |
| Tamano del repositorio | 12,6 GB |
| Modelo base | nvidia/GR00T-N1.7-3B |
| Checkpoint | checkpoint-20000 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura VLA de GR00T N1.7, un transformer multimodal que combina un backbone de razonamiento vision-lenguaje (Cosmos-Reason2) con una cabeza de generacion de acciones. En este ajuste fino, la cabeza de accion emite tokens de movimiento interpretados por el controlador GEAR-SONIC v1.1, que traduce esos tokens en comandos de cuerpo completo para el Unitree G1, ademas de objetivos directos para las manos Dex3. No se dispone de informacion detallada sobre el numero de capas, dimensiones ocultas ni mecanismos de atencion especificos en la informacion proporcionada.

El entrenamiento se realizo sobre el conjunto `desk_v1`, compuesto por 824 episodios y 160.415 fotogramas a 50 Hz. Los datos proceden de grabaciones del dataset `nvidia/Arena-G1-Static-PickNPlace-Task`, que se reprodujeron de forma centrada en los objetos a traves de SONIC sobre un gemelo simulado de una mesa de laboratorio, con la manzana y el plato colocados dentro de un margen de ±8 cm. Solo se conservaron las trayectorias que cumplian la propia regla de exito de la evaluacion. El ajuste fino consistio en 20.000 pasos con tamano de lote global 16 y aumento de datos por variacion de color (colour jitter), ejecutado en una A100 de 40 GB en aproximadamente 3 horas. No se menciona el uso de RLHF ni DPO, lo cual es coherente con un modelo de politica robotica.

## Capacidades

- Generacion de acciones de manipulacion: produce trayectorias de 40 pasos (0,8 s) para el cuerpo completo del Unitree G1 y objetivos de pinza para las manos Dex3.
- Seguimiento de instrucciones en lenguaje natural: acepta ordenes como "Pick up the apple from the table and place it onto the plate next to it." y las traduce en comportamiento motor.
- Percepcion visual desde camara de cabeza: utiliza la imagen del punto de vista del robot como entrada sensorial principal.
- Condicionamiento por estado del robot: integra la propriocepcion del robot para generar acciones coherentes.
- Tarea especifica de pick-and-place: coger un objeto y depositarlo en una ubicacion cercana, con tolerancia a variaciones de posicion de ±8 cm en entrenamiento.
- Robustez a condiciones visuales: la evaluacion reporta resultados del 92-96 % bajo luz baja, luz lateral, camara girada, desorden, ruido de estado e instrucciones reformuladas.
- Robustez a condiciones dinamicas: 99 % en superficies resbaladizas y manzana ligera (celdas aun pendientes).
- No se documentan capacidades de tool calling, agentes multi-paso, vision general, audio ni modo de razonamiento explicito.

## Casos de uso

- Investigacion en manipulacion humanoide: servir como punto de partida reproducible para estudiar el ajuste fino de VLAs de 3B sobre embodiments concretos, con un pipeline documentado de datos, entrenamiento y evaluacion.
- Benchmark de generalizacion en robotica: utilizar la diferencia entre el 95 % en distribucion y el 69 % fuera de distribucion como caso de estudio sobre sobreajuste al gemelo simulado y sobre la importancia de conjuntos de validacion independientes.
- Desarrollo de politicas de pick-and-place en simulacion: emplear el modelo como politica base para tareas de recogida y deposito de objetos en entornos de escritorio simulados antes de transferir a hardware real.
- Evaluacion de controladores de cuerpo completo: integrar el modelo con GEAR-SONIC v1.1 para probar la cadena completa de tokens de movimiento a comandos de robot en simulacion.
- Pruebas de robustez visual y dinamica: aprovechar los protocolos de evaluacion bajo condiciones de iluminacion, ruido y superficies resbaladizas para validar la resiliencia de politicas VLA.
- Docencia y divulgacion tecnica: usar el repositorio y los resultados publicados como ejemplo didactico de flujo de trabajo VLA, desde la teleoperacion hasta el despliegue en un servidor de politicas.
- Base para ajustes finos adicionales: partir de este checkpoint para entrenar variantes con otros objetos, posiciones o tareas sobre el mismo embodiment `UNITREE_G1_SONIC`.

## Benchmarks y rendimiento

Los resultados proceden de la evaluacion del autor en simulacion con Kite sobre el gemelo de la mesa. Cada episodio dura 12 s, se inyecta latencia a partir de un perfil medido en A100 y el servidor usa semilla fija para reproducibilidad.

| Evaluacion | Episodios | Exito (colocado) | Notas |
|---|---|---|---|
| En distribucion | 200 | 95 % (IC 91-97 %) | Objetos a menos de 3 cm de las posiciones de entrenamiento; sin caidas ni plazos incumplidos |
| Fuera de distribucion (held-out) | 100 | 69 % (IC 59-77 %) | Objetos a 12 cm fuera del rango de entrenamiento, semillas no usadas; 23 de los 31 fallos desplazan la manzana antes del agarre |
| Condiciones visuales | 100 por celda | 92-96 % | Luz baja, luz lateral, camara girada, desorden, ruido de estado e instrucciones reformuladas; linea base del 98 % |
| Condiciones dinamicas | 100 por celda | 99 % hasta ahora | Superficies resbaladizas y manzana ligera; celdas pendientes |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que se trata de un modelo de politica robotica y no de un modelo de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el entrenamiento se realizo en una A100 de 40 GB, lo que da una referencia del orden de magnitud para pesos en precision completa.
- GPU recomendadas: A100 40 GB (usada en entrenamiento y perfil de latencia); no se documentan otras GPU probadas.
- Compatibilidad con GPU de consumo: no disponible; no se indica si cabe en RTX 4090 u otras GPU consumer, ni se ofrecen pesos cuantizados.
- Opciones de despliegue: servidor de politicas de Isaac-GR00T mediante `python gr00t/eval/run_gr00t_server.py --model-path <repo> --embodiment-tag UNITREE_G1_SONIC --port 5550`.
- Latencia y throughput: no se publican cifras concretas; la evaluacion inyecta latencia a partir de un perfil medido en A100.
- Almacenamiento: el repositorio ocupa 12,6 GB en safetensors.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kiteml/gr00t-n1.7-g1-sonic-desk-apple | 3,14 B | no disponible | Pick-and-place manzana-plato en Unitree G1 (SONIC) | NVIDIA Open Model License | Hugging Face |
| nvidia/GR00T-N1.7-3B | 3 B (aprox.) | no disponible | VLA generalista multi-embodiment | NVIDIA Open Model License | Hugging Face |
| nvidia/GEAR-SONIC | no disponible | no disponible | Controlador de cuerpo completo | no disponible en la informacion | Hugging Face |

El modelo comparado mas directo es su base `nvidia/GR00T-N1.7-3B`, que es generalista y multi-embodiment, mientras que este ajuste esta especializado en una unica tarea y un unico embodiment. No se dispone de datos de rendimiento comparables de otros ajustes finos equivalentes en la informacion proporcionada.

## Limitaciones y advertencias

- Solo simulacion: no se ha ejecutado en un robot real ni sobre el despliegue SONIC propio de NVIDIA.
- Sobreajuste al gemelo simulado: los datos de entrenamiento y la evaluacion en distribucion proceden del mismo gemelo; la cifra honesta de generalizacion es el 69 % held-out, no el 95-99 % en distribucion.
- Fallos caracteristicos: 23 de los 31 fallos held-out se deben a que el robot desplaza la manzana antes de agarrarla.
- Velocidad de movimiento: los brazos se mueven a la velocidad de las demos teleoperadas de NVIDIA (aproximadamente 1 m/s en la muneca); un despliegue real cerca de personas deberia limitar la velocidad.
- Limites de par: el par toca su limite durante milisegundos en algunos episodios (hombro izquierdo, pitch 25/25 N·m en 2 de 200), por lo que un despliegue real deberia limitar el par del brazo.
- Idiomas: no se documentan idiomas soportados; las instrucciones de entrenamiento estan en ingles.
- Licencia: NVIDIA Open Model License, con condiciones especificas para uso comercial que deben revisarse antes de produccion.
- Riesgo de alucinacion motora: como modelo de politica, puede generar acciones incorrectas o inseguras fuera de las condiciones entrenadas; no debe usarse sin capas de seguridad en hardware real.
- Sesgos: no se documentan sesgos especificos; la variabilidad se limita a las condiciones simuladas descritas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kiteml/gr00t-n1.7-g1-sonic-desk-apple
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Controlador GEAR-SONIC: https://huggingface.co/nvidia/GEAR-SONIC
- Dataset de origen: https://huggingface.co/datasets/nvidia/Arena-G1-Static-PickNPlace-Task
- Repositorio de resultados y metodo: https://github.com/kite-ml/g1-sonic-desk-datasets
- Isaac-GR00T en GitHub: https://github.com/NVIDIA/Isaac-GR00T
- Dataset relacionado (variante fluorescente): https://huggingface.co/datasets/kiteml/g1-sonic-desk-apple-fluorescent
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Sitio de Kite: https://kiteml.com
