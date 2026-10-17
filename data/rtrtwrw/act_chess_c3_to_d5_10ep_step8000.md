# rtrtwrw/act_chess_c3_to_d5_10ep_step8000

## Resumen

`rtrtwrw/act_chess_c3_to_d5_10ep_step8000` es una política de imitación robótica entrenada con el algoritmo ACT (Action Chunking Transformer) sobre un brazo seguidor SO-101, dentro del ecosistema LeRobot 0.5.1. El modelo aprende una única tarea de manipulación: mover una pieza de ajedrez desde la casilla c3 (situada a 6 cm) hasta la casilla d5 (a 10 cm). No es un modelo de lenguaje ni un modelo multimodal de propósito general, sino un controlador visuomotor que consume tres cámaras a 480x640 y el estado de 6 articulaciones, y produce acciones articulares.

El checkpoint es intermedio: paso 8.000 de un total de 16.000, con batch de 24, entrenado desde cero sobre los 10 episodios más cortos del dataset `niru-5/chess_dataset_c3_6cm_to_d5_10cm_20261017_145741` (3.422 fotogramas en total). El modelo tiene 51.668.614 parámetros y el repositorio ocupa 0,2 GB, lo que lo sitúa en el rango de políticas ligeras que caben holgadamente en cualquier GPU de consumo.

Su relevancia es acotada pero clara: sirve como referencia reproducible de ACT en LeRobot, como línea base para estudiar el efecto del número de episodios en el rendimiento de políticas de imitación y como punto de partida para fine-tuning en tareas de pick-and-place con el SO-101. No se han publicado métricas de éxito ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), politica de imitacion visuomotora con encoder visual y decoder de chunks de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: no es un modelo de lenguaje. Consume 3 camaras a 480x640 mas estado de 6 articulaciones; el tamano del chunk de acciones no se indica en la informacion disponible |
| Tipos de cuantizacion | No disponible (el repositorio contiene pesos safetensors; no se documentan variantes GGUF, INT8 ni INT4) |
| Idiomas soportados | No aplica / no disponible (no procesa texto) |
| Licencia | No disponible |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

ACT es un transformer de imitacion supervisada que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de compounding en tareas de manipulacion de horizonte medio. En este caso el modelo parte de tres flujos de imagen a 480x640 y de un vector de estado de 6 articulaciones, y emite acciones de 6 articulaciones para el brazo seguidor SO-101. El entrenamiento se realizo desde cero con LeRobot 0.5.1, presumiblemente mediante aprendizaje por imitacion a partir de demostraciones de teleoperacion; la model card no detalla si se empleo variante con CVAE, ni la composicion exacta de las capas o del encoder visual.

El dataset de entrenamiento son los 10 episodios mas cortos del conjunto de ajedrez citado, con identificadores 19, 12, 14, 10, 18, 15, 20, 9, 16 y 28, que suman 3.422 fotogramas. El checkpoint corresponde al paso 8.000 de 16.000 con batch de 24. No se documenta ningun tipo de RLHF, DPO ni ajuste por preferencias, algo que no aplica a una politica de control. Tampoco se describen innovaciones adicionales como decodificacion especulativa o atencion lineal; se trata de una implementacion estandar de ACT sobre LeRobot.

## Capacidades

- Manipulacion visuomotora de una unica tarea: desplazar una pieza de ajedrez de c3 (6 cm) a d5 (10 cm) con un brazo SO-101.
- Fusion de tres camaras simultaneas a resolucion 480x640 como entrada perceptiva.
- Control de posicion de 6 articulaciones a partir del estado conjunto y emision de acciones de 6 dimensiones.
- Prediccion por chunks de acciones, orientada a ejecucion fluida en lazo cerrado.
- Inferencia compatible con el pipeline de LeRobot (`--policy.path=rtrtwrw/act_chess_c3_to_d5_10ep_step8000`).
- No soporta tool calling ni function calling.
- No soporta agentes, planificacion multi-paso ni razonamiento simbolico.
- No tiene capacidades multilingues, deVision-Language general, audio ni modo thinking.
- No dispone de capacidad de generalizacion declarada a otras tareas, objetos o morfologias de robot.

## Casos de uso

- Linea base reproducible para ACT: cargar el checkpoint con LeRobot y medir tasa de exito en la tarea c3-d5 para comparar contra futuros entrenamientos con mas episodios o mas pasos.
- Estudio de escalado de datos: al estar entrenado solo con los 10 episodios mas cortos, permite contrastar el efecto del numero de demostraciones frente a variantes con el dataset completo.
- Validacion de pipelines de teleoperacion: sirve para verificar que la cadena de captura con tres camaras a 480x640, el estado de 6 articulaciones y el bucle de control del SO-101 funcionan de extremo a extremo antes de entrenar tareas nuevas.
- Fine-tuning como inicializacion: util como punto de partida para tareas de pick-and-place con el mismo brazo y montaje de camaras, reduciendo el tiempo de entrenamiento frente a partir de cero.
- Docencia y divulgacion en robotica de imitacion: ejemplo completo y ligero (0,2 GB, 51,7 M de parametros) para explicar como se entrena y despliega una politica ACT en hardware de bajo coste.
- Pruebas de robustez ante cambios de iluminacion, fondo o posicion inicial de la pieza, midiendo la degradacion de una politica entrenada con muy pocos episodios.
- Verificacion de integracion con el ecosistema LeRobot en entornos de investigacion que necesitan checkpoints pequenos para iterar rapidamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica el estado de entrenamiento (paso 8.000 de 16.000, batch 24, 3.422 fotogramas) y no reporta tasa de exito, error de posicion ni ninguna otra metrica de evaluacion.

## Requisitos de hardware

- VRAM estimada: los 51.668.614 parametros ocupan aproximadamente 207 MB en fp32 y unos 103 MB en fp16, sin contar el encoder visual ni los buffers de las tres camaras a 480x640 (estimacion calculada a partir del numero de parametros; no verificada en la informacion disponible).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente para la politica; no se documentan requisitos oficiales.
- Cabe en GPU de consumo: si, con margen amplio en tarjetas tipo RTX 3060, RTX 4060, RTX 4090 o superiores; tambien es viable en CPU para pruebas no criticas en tiempo real.
- El cuello de botella realista no es el modelo sino el procesamiento de tres camaras a 480x640 y la frecuencia del bucle de control del brazo.
- Opciones de despliegue: LeRobot 0.5.1 (scripts `lerobot-record` y utilidades de evaluacion asociadas) sobre PyTorch. vLLM, TGI, llama.cpp u Ollama no aplican a esta categoria de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_chess_c3_to_d5_10ep_step8000 (este modelo) | 51.668.614 | 3 camaras 480x640 + estado de 6 articulaciones | Movimiento de pieza c3 a d5 con SO-101 | No disponible | HuggingFace, libreria lerobot |
| ACT original (ALOHA, Zhao et al.) | No disponible en la informacion | No disponible | Manipulacion bimanual | No disponible | Repositorio de investigacion |
| Diffusion Policy | No disponible en la informacion | No disponible | Manipulacion via difusion de acciones | No disponible | Repositorio de investigacion |
| SmolVLA (LeRobot) | No disponible en la informacion | Vision-lenguaje-accion | Politica generalista VLA | No disponible | HuggingFace, libreria lerobot |

La comparacion cuantitativa no es posible con los datos proporcionados: no se dispone de parametros, contexto ni metricas de los modelos alternativos, y este checkpoint no publica evaluacion. La diferencia cualitativa principal es la especializacion: frente a propuestas generalistas como SmolVLA, este modelo esta entrenado para una unica tarea y un unico montaje robotico.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con 10 episodios de un unico operador, hereda los sesgos de estilo de teleoperacion, trayectorias y posiciones iniciales presentes en esas demostraciones.
- Riesgo de sobreajuste alto: 3.422 fotogramas para 51,7 M de parametros y solo 10 episodios es un regimen de datos muy reducido; es probable que el modelo no generalice fuera de las condiciones exactas del dataset.
- Checkpoint intermedio: corresponde al 50 % del entrenamiento previsto, por lo que no representa el mejor resultado del autor.
- Especificidad extrema: solo ejecuta la tarea c3-d5; no hay evidencia de generalizacion a otras casillas, piezas u objetos.
- Dependencia del montaje: requiere la misma configuracion de tres camaras, la misma iluminacion y el mismo brazo SO-101; cambios de calibracion o de encuadre invalidan la politica.
- Sin metricas de evaluacion: no se puede afirmar ninguna tasa de exito ni comparar objetivamente con alternativas.
- Licencia no especificada: la ausencia de licencia explicita impide asumir permisos de uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Sin capacidades de lenguaje, razonamiento ni tool calling: no es apto para tareas cognitivas, conversacionales o de planificacion.
- Sin garantias de seguridad fisica: como toda politica de control, puede generar acciones erroneas; requiere limites de par, paradas de emergencia y supervision humana en pruebas con hardware real.
- Idiomas no aplicables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rtrtwrw/act_chess_c3_to_d5_10ep_step8000
- Dataset de entrenamiento: https://huggingface.co/datasets/niru-5/chess_dataset_c3_6cm_to_d5_10cm_20261017_145741
- LeRobot (libreria y framework de entrenamiento/despliegue): https://github.com/huggingface/lerobot
- Paper de ACT (Action Chunking with Transformers, Zhao et al.): no disponible en la informacion proporcionada
- Blog o demo del autor: no disponible
- Nota: la busqueda web realizada no devolvio resultados tecnicos relevantes sobre este modelo; los unicos enlaces verificables son los anteriores.
