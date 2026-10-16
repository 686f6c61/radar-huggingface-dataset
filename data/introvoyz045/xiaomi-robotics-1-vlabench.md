# introvoyz045/Xiaomi-Robotics-1-VLABench

## Resumen

Xiaomi-Robotics-1 es un modelo fundacional de robotica desarrollado por el equipo Xiaomi Robotics, presentado como un modelo Vision-Language-Action (VLA) entrenado con mas de 100.000 horas de trayectorias de manipulacion del mundo real. El repositorio `introvoyz045/Xiaomi-Robotics-1-VLABench` contiene el checkpoint especifico utilizado para la evaluacion en el benchmark VLABench, e incluye los pesos del modelo, codigo custom de Transformers para modelo y procesador, ficheros de tokenizer y las estadisticas de normalizacion de acciones de VLABench.

El modelo resuelve el problema de la manipulacion movil robotica en entornos no vistos, con capacidad de adaptacion eficiente a nuevas tareas. Se distribuye como un checkpoint de aproximadamente 5.053 millones de parametros (5,05 B) en formato safetensors, con un tamano de repositorio de 10,1 GB. El modelo esta disenado para generar acciones de control robotico a partir de entradas multimodales (vision y lenguaje) y dispone de una interfaz de acciones con chunk size de 10 y un intervalo de replanificacion de 5 pasos.

Su relevancia actual reside en que representa un ejemplo de modelo VLA abierto (licencia Apache 2.0) con resultados de evaluacion publicados en VLABench, uno de los benchmarks de referencia para manipulacion robotica. La evaluacion reportada alcanza una tasa de exito (SR) global del 59,1%, con puntuaciones de intencion (IS) de 69,9% y progreso (PS) de 70,3% sobre 2.500 episodios repartidos en 5 tracks y 10 tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA); detalles internos del transformer no disponibles |
| Parametros totales | 5.053.149.696 (5,05 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors; se usa bfloat16 en la carga de referencia) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Xiaomi-Robotics-1 es un modelo Vision-Language-Action (VLA) orientado a manipulacion movil. Segun la informacion disponible, ha sido entrenado con mas de 100.000 horas de trayectorias de manipulacion del mundo real procedentes de robots. No se detallan en la informacion proporcionada el numero exacto de tokens, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. Tampoco se especifica la arquitectura interna (tipo de transformer, atencion, etc.), mas alla de que se trata de un modelo multimodal que consume observaciones visuales y lenguaje y produce acciones de control.

El checkpoint incluido en este repositorio incorpora codigo custom tanto de modelo como de procesador, que debe cargarse con `trust_remote_code=True`, junto con los ficheros de tokenizer y las estadisticas de normalizacion de acciones especificas de VLABench. El entorno de referencia utiliza Python 3.11, PyTorch 2.8.0, Transformers 4.57.1 y FlashAttention 2. La interfaz de acciones tiene una forma cruda de `[10, 60]`, de la cual las 7 primeras dimensiones son ejecutables (3 para delta de posicion, 3 para delta de rotacion en Euler y 1 para el gripper), con un chunk de 10 acciones y replanificacion cada 5 pasos.

## Capacidades

- Generacion de acciones de manipulacion robotica a partir de entradas de vision y lenguaje (modelo VLA).
- Control de robot del tipo `vlabench_choice`, con dimension de estado 60 y dimension de accion 7.
- Ejecucion de politicas con chunking de acciones (tamano 10) y replanificacion cada 5 pasos.
- Adaptacion a entornos no vistos, incluyendo texturas no vistas y categorias cruzadas, segun los tracks evaluados.
- Seguimiento de instrucciones semanticas para seleccion de objetos (libros, frutas, tubos de quimica, mahjong, cartas, juguetes, cuadros).
- Tareas de manipulacion cotidiana como anadir condimento o insertar una flor.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: el modo chain-of-thought (CoT) durante la evaluacion esta deshabilitado, pero no se detalla su comportamiento fuera de ese contexto.
- Capacidades multilingues: no disponible.
- Modo thinking, vision o audio adicionales: no disponible mas alla de la entrada visual implicita en el paradigma VLA.

## Casos de uso

- Manipulacion robotica en almacenes: el modelo puede generar secuencias de acciones de picking y colocacion a partir de instrucciones en lenguaje natural y observaciones visuales, con replanificacion cada 5 pasos para adaptarse a cambios en el entorno.
- Seleccion de objetos por categoria: tareas como `select_fruit`, `select_book` o `select_toy` muestran que el modelo puede elegir objetos concretos segun una instruccion semantica, util en lineas de clasificacion automatizada.
- Manipulacion en entornos no vistos: gracias a su evaluacion en tracks de textura no vista (`track_6_unseen_texture`, SR 62,6%) y categoria cruzada (`track_2_cross_category`, SR 53,0%), es adecuado para robots que deben operar en espacios nuevos sin reentrenamiento.
- Investigacion en modelos VLA: sirve como referencia abierta (Apache 2.0) para reproducir resultados en VLABench y comparar nuevas tecnicas de manipulacion.
- Tareas de laboratorio automatizado: la tarea `select_chemistry_tube` alcanza un 80,4% de exito, lo que sugiere aplicabilidad en entornos de laboratorio donde se manipulan tubos y muestras.
- Robots domesticos o de servicio: tareas como `add_condiment` o `insert_flower` apuntan a escenarios de asistencia en cocina o decoracion, aunque con tasas de exito mas bajas (40,4% en ambas).
- Prototipado de politicas de manipulacion movil: su diseno "out-of-the-box" y su adaptacion eficiente a nuevas tareas lo hacen util para equipos que quieran desplegar un robot sin entrenar desde cero.
- Evaluacion comparativa de politicas roboticas: el checkpoint y las estadisticas de normalizacion facilitan la reproduccion de la evaluacion sobre los 50 pares tarea-track y 2.500 episodios definidos.

## Benchmarks y rendimiento

Resultados de referencia publicados por el autor en VLABench (metricas: tasa de exito SR, puntuacion de intencion IS, puntuacion de progreso PS).

Resultado global:

| Metrica | Valor |
| --- | ---: |
| Success Rate (SR) | 59,1% |
| Intention Score (IS) | 69,9% |
| Progress Score (PS) | 70,3% |

Resultados por track:

| Track | SR | IS | PS |
| --- | ---: | ---: | ---: |
| `track_1_in_distribution` | 75,6% | 79,8% | 85,0% |
| `track_2_cross_category` | 53,0% | 66,4% | 66,6% |
| `track_3_common_sense` | 48,4% | 58,2% | 58,3% |
| `track_4_semantic_instruction` | 55,8% | 70,2% | 66,8% |
| `track_6_unseen_texture` | 62,6% | 74,8% | 74,9% |
| Overall | 59,1% | 69,9% | 70,3% |

Resultados medios por tarea a lo largo de todos los tracks:

| Tarea | SR | IS | PS |
| --- | ---: | ---: | ---: |
| `add_condiment` | 40,4% | 84,0% | 60,1% |
| `insert_flower` | 40,4% | 98,8% | 69,2% |
| `select_book` | 56,4% | 75,6% | 66,0% |
| `select_chemistry_tube` | 80,4% | 0,4% | 85,6% |
| `select_drink` | 49,2% | 90,4% | 65,2% |
| `select_fruit` | 60,8% | 94,0% | 75,8% |
| `select_mahjong` | 70,4% | 87,6% | 73,6% |
| `select_painting` | 63,2% | 82,8% | 63,2% |
| `select_poker` | 66,8% | 75,2% | 67,1% |
| `select_toy` | 62,8% | 10,0% | 77,4% |

Configuracion de evaluacion: 5 tracks, 10 tareas por track, 50 episodios por tarea, 50 entradas tarea-track, 2.500 episodios totales, robot `vlabench_choice`, dimension de estado 60, dimension de accion 7, chunk de accion 10, 5 pasos de replanificacion, CoT deshabilitado durante la evaluacion. Los valores por track son medias macro sobre las diez tareas del track; el resultado global es la media macro sobre las 50 entradas tarea-track y no esta ponderado por episodios. No se proporcionan comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con 5,05 B de parametros, en bfloat16 los pesos ocupan aproximadamente 10 GB, por lo que se requiere una GPU con al menos unos 12-16 GB de VRAM para el modelo mas overhead de activaciones y procesador visual.
- GPU recomendadas: no se especifican en la informacion proporcionada. Por tamano, cabria esperar GPUs tipo RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB), pero esto es una estimacion basada en el numero de parametros, no un dato publicado.
- Compatibilidad con GPU de consumo: probable con GPUs de 24 GB (por ejemplo RTX 3090/4090) segun el tamano de parametros; no confirmado por el autor.
- Opciones de despliegue: la referencia usa Transformers 4.57.1 con codigo custom (`trust_remote_code=True`) y FlashAttention 2, ademas de un esquema cliente-servidor para la evaluacion (el servidor carga el modelo y sirve acciones por socket). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se han proporcionado comparaciones con otros modelos en la informacion disponible, ni datos de modelos VLA alternativos (por ejemplo, otros modelos de manipulacion robotica). Por tanto, la comparativa se indica como no disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xiaomi-Robotics-1-VLABench | 5,05 B | no disponible | SR 59,1% en VLABench | Apache 2.0 | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se detallan sesgos conocidos en la informacion proporcionada.
- Riesgo de alucinacion: no evaluado ni documentado para este modelo en la informacion disponible; en modelos VLA el equivalente seria la ejecucion de acciones incorrectas ante instrucciones ambiguas.
- Limitaciones de contexto o idioma: la longitud de contexto y los idiomas soportados no estan disponibles.
- Restricciones de licencia: el modelo se distribuye bajo Apache 2.0, lo que en principio permite uso comercial, pero se debe consultar el fichero LICENSE y verificar las condiciones de los datos de entrenamiento.
- El codigo custom requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; conviene auditar dicho codigo antes de usarlo en produccion.
- El checkpoint esta especificamente preparado para VLABench e incluye estadisticas de normalizacion de acciones de ese benchmark; su uso fuera de ese entorno puede requerir recalibrar dichas estadisticas.
- La evaluacion se ha realizado con CoT deshabilitado, por lo que el rendimiento con razonamiento explicito activado no esta documentado.
- Las tasas de exito por tarea son desiguales: `add_condiment` e `insert_flower` se quedan en 40,4% de SR, mientras que `select_chemistry_tube` alcanza 80,4%, lo que indica dependencia fuerte de la tarea.
- El rendimiento reportado es una media macro no ponderada por episodios, lo que puede no reflejar el comportamiento esperado en distribuciones reales de uso.
- El repositorio indicado (`introvoyz045/...`) tiene 0 descargas y 0 likes en la fecha de la informacion, y el identificador de arXiv (2607.15330) y las fechas de creacion apuntan a 2026; conviene verificar la vigencia y autoria real de los artefactos.

## Enlaces

- Checkpoint en HuggingFace (autor introvoyz045): https://huggingface.co/introvoyz045/Xiaomi-Robotics-1-VLABench
- Checkpoint en HuggingFace (organizacion XiaomiRobotics): https://huggingface.co/XiaomiRobotics/Xiaomi-Robotics-1-VLABench
- Repositorio en GitHub: https://github.com/XiaomiRobotics/Xiaomi-Robotics-1
- Guia de evaluacion VLABench en GitHub: https://github.com/XiaomiRobotics/Xiaomi-Robotics-1/tree/main/eval_vlabench
- Modelo en ModelScope: https://www.modelscope.cn/models/XiaomiRobotics/Xiaomi-Robotics-1-VLABench
- Paper (arXiv): arXiv:2607.15330, "Xiaomi-Robotics-1: Scaling Vision-Language-Action Models with over 100K Hours of Real-World Trajectories"
