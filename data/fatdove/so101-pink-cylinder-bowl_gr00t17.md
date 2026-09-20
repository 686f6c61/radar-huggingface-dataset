# fatdove/so101-pink-cylinder-bowl_GR00T17

## Resumen

so101-pink-cylinder-bowl_GR00T17 es una política robótica de imitación publicada en HuggingFace por el usuario fatdove, obtenida al afinar el modelo fundacional GR00T N1.7 de NVIDIA sobre un único conjunto de datos propio. No se trata, por tanto, de un modelo de lenguaje de propósito general, sino de un checkpoint de control motor entrenado para una tarea concreta: coger un cilindro rosa y dejarlo dentro de un cuenco rosa con un brazo SO-101 (tipo `so_follower`).

El modelo se distribuye en formato safetensors con 3.144.016.000 parámetros (aproximadamente 3,14 mil millones) y un repositorio de 12,6 GB. Utiliza la librería LeRobot y la licencia Apache 2.0. La arquitectura subyacente combina un backbone visión-lenguaje Cosmos-Reason2/Qwen3-VL con un transformer de acciones basado en flow matching, que predice acciones condicionadas por visión, lenguaje y propiocepción.

Su relevancia es práctica más que algorítmica: sirve como ejemplo reproducible de extremo a extremo de cómo se afina un modelo fundacional de robótica humanoide con LeRobot sobre un dataset pequeño (50 episodios, 29.950 fotogramas) y se despliega en hardware de bajo coste. Es un caso de estudio útil para quien quiera replicar el flujo de trabajo, no un modelo de uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone visión-lenguaje Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parametros totales | 3.144.016.000 (3,14 mil millones) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; no se documentan versiones GGUF, int8 ni int4) |
| Idiomas soportados | no disponible (la model card no declara idiomas; las instrucciones de tarea se pasan como texto en inglés en el ejemplo de uso) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 12,6 GB) |
| Biblioteca | LeRobot 0.6.1 |
| Tipo de robot | `so_follower` (SO-101) |
| Cámaras de entrada | `front`, `wrist` (640x480, 30 FPS) |
| Entradas | `observation.state` (6,), `observation.images.front` (3, 480, 640), `observation.images.wrist` (3, 480, 640) |
| Salidas | `action` (6,) |
| Dataset de entrenamiento | fatdove/so101-pink-cylinder-bowl |
| Pipeline declarado | robotics |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

GR00T N1.7 es un modelo fundacional abierto y «cross-embodiment» de NVIDIA orientado a razonamiento y habilidades en robots humanoides. La arquitectura separa dos componentes: un backbone visión-lenguaje (Cosmos-Reason2/Qwen3-VL) que procesa el contexto visual y las instrucciones en lenguaje natural, y un transformer de acciones entrenado con flow matching que genera las trayectorias motoras. La predicción de acciones se condiciona conjuntamente por visión (dos cámaras RGB de 640x480), lenguaje (la descripción de la tarea) y propiocepción (vector de estado de 6 dimensiones). El vector de acción resultante también tiene 6 dimensiones, correspondiente a los grados de libertad del SO-101.

El checkpoint aquí descrito es un ajuste fino de esa base, realizado con LeRobot sobre el dataset fatdove/so101-pink-cylinder-bowl, que contiene 50 episodios y 29.950 fotogramas capturados a 30 FPS para una única tarea: «Pick up the pink cylinder and place it in the pink bowl». La configuración de entrenamiento documentada es de 20.000 pasos, tamaño de lote 64, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 42. La model card no indica el número total de tokens de entrenamiento de la base, la composición del dataset original de GR00T N1.7 ni si hubo fases de RLHF o DPO; tampoco describe innovaciones adicionales de decodificación o atención más allá del esquema flow matching ya citado.

## Capacidades

- Generación de acciones motoras: produce comandos de 6 grados de libertad para un brazo SO-101 a partir de observaciones visuales y propioceptivas.
- Ejecución de una tarea de manipulación concreta: recoger un cilindro rosa y depositarlo en un cuenco rosa.
- Fusión multimodal: integra dos vistas de cámara (frontal y de muñeca) con el estado articular y una instrucción en lenguaje natural.
- Condicionamiento por lenguaje: la tarea se pasa como texto en el comando de despliegue, lo que permite teóricamente variar la instrucción, aunque el ajuste se ha hecho sobre una sola tarea.
- Integración con LeRobot: compatible con los comandos `lerobot-rollout` y `lerobot-train`, y con `--strategy.type=base` para ejecución sin grabación de episodios.
- Soporte para reentrenamiento: el repositorio documenta el comando de entrenamiento con `--policy.type=groot` y seguimiento opcional en Weights & Biases.
- No dispone de soporte documentado de tool calling, function calling, agentes multi-paso, modo de razonamiento explícito, audio ni visión de propósito general.

## Casos de uso

- Reproducción de un pipeline completo de imitación: servir como referencia para grabar un dataset con LeRobot, afinar GR00T N1.7 y desplegar la política resultante en un SO-101, verificando cada etapa del flujo documentado.
- Banco de pruebas de manipulación pick-and-place: evaluar la robustez de la política ante cambios de posición del cilindro y del cuenco, iluminación distinta o presencia de distractores en la escena.
- Docencia y divulgación en robótica: demostrar en un laboratorio con hardware de bajo coste cómo un modelo fundacional se especializa en una tarea mediante ajuste fino supervisado con 50 episodios.
- Base para comparativas de ajuste fino: usar este checkpoint como punto de partida para medir cuánto mejora o empeora la tasa de éxito al variar número de episodios, tasa de aprendizaje o pasos de entrenamiento.
- Investigación en generalización cross-embodiment: probar la transferencia del peso ajustado a otro robot de la misma familia o a una variante de la tarea, documentando la degradación observada.
- Automatización de una celda de clasificación sencilla: integrar la política en una línea donde la tarea sea mover objetos cilíndricos a un contenedor, siempre que la escena permanezca controlada y las cámaras coincidan con las del entrenamiento.
- Generación de nuevos datos sintéticos o de demostraciones: emplear las trayectorias generadas como punto de partida para recabar más episodios y ampliar el dataset original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card incluye una sección de evaluación con la nota explícita «No evaluation results have been provided for this policy yet», sin tabla de ensayos, éxitos ni tasa de acierto. Tampoco se aportan métricas de latencia, frecuencia de control efectiva ni throughput de inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: partiendo de 3,144 mil millones de parámetros, los pesos en precisión completa ocupan aproximadamente 12,6 GB, coherente con el tamaño del repositorio. En bf16/fp16 bajarían a unos 6,3 GB, en int8 a unos 3,2 GB y en int4 a unos 1,6 GB. Son estimaciones derivadas del recuento de parámetros, no cifras publicadas por el autor.
- GPU recomendadas: no disponibles en la documentación. Para ejecución en bf16, una GPU con 8-12 GB de VRAM sería suficiente en principio; para entrenamiento con lote 64 y el backbone visión-lenguaje completo es razonable esperar requisitos muy superiores (24 GB o más), aunque el autor no publica esta información.
- Cabe en GPU de consumo: probablemente sí para inferencia en cuantización de 8 o 4 bits en tarjetas tipo RTX 3060 12 GB, RTX 4070 o superiores; el ajuste fino completo no está documentado para hardware de consumo.
- Opciones de despliegue: LeRobot mediante los comandos `lerobot-rollout` y `lerobot-train`. No hay evidencia de soporte para vLLM, TGI, llama.cpp u Ollama, que además no encajan con un transformer de acciones con flow matching.
- Latencia y throughput: no disponibles. El despliegue de referencia se lanza con `--duration=60` sobre cámaras a 30 FPS, pero no se especifica la frecuencia de inferencia real ni el tiempo por paso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| so101-pink-cylinder-bowl_GR00T17 (este) | 3,14 mil millones | no disponible | sin evaluación publicada | Apache 2.0 | HuggingFace, 0 descargas |
| GR00T N1.7 base (NVIDIA) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible en la informacion proporcionada | GitHub de Isaac-GR00T |
| Otras políticas LeRobot del mismo tipo (`groot`, `act`, `smolvla` según la guía de LeRobot) | no disponible | no disponible | no disponible | no disponible | HuggingFace Hub |

No se dispone de datos verificables de parámetros, contexto, rendimiento ni licencia de las alternativas en la información proporcionada, por lo que no es posible establecer una comparación numérica rigurosa. La comparación cualitativa relevante es que este checkpoint es un ajuste especializado de una sola tarea, mientras que GR00T N1.7 base es un modelo fundacional generalista; cualquier política afinada sobre el mismo dataset sería su competidor directo.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al entrenarse sobre 50 episodios de una única tarea y una única configuración de escena, la política heredará los sesgos de posición, iluminación y apariencia de ese dataset.
- Riesgo de alucinación: en el sentido habitual del término no aplica, pero sí existe riesgo de acciones erráticas o inseguras cuando la observación se aleja de la distribución de entrenamiento, algo especialmente relevante en un sistema físico que mueve un brazo.
- Limitaciones de contexto e idioma: no se declara ninguna longitud de contexto ni conjunto de idiomas soportados. El ejemplo de uso emplea una instrucción en inglés, y el ajuste se ha hecho sobre una sola tarea descrita en inglés.
- Ausencia de evaluación: no hay ninguna tasa de éxito medida, ni número de ensayos, ni condiciones de prueba. Cualquier uso en producción parte de una incertidumbre total sobre su fiabilidad.
- Especificidad extrema: el modelo está entrenado para coger un cilindro rosa y ponerlo en un cuenco rosa. No debe esperarse que generalice a otros objetos, otras posiciones de cámara u otros robots sin un nuevo ajuste.
- Dependencia del hardware: requiere el robot `so_follower` y dos cámaras con los nombres de observación `front` y `wrist`; si los nombres o las resoluciones no coinciden, la política no funcionará tal cual.
- Licencia: Apache 2.0 permite uso comercial, pero debe verificarse también la licencia del modelo base GR00T N1.7 de NVIDIA y de sus componentes (Cosmos-Reason2/Qwen3-VL), ya que las condiciones del modelo derivado pueden estar sujetas a las del original.
- Madurez: 0 descargas y 0 likes, publicada y actualizada el mismo día. No hay señales de validación por parte de terceros.
- Riesgo físico: cualquier despliegue debe hacerse con límites de par, paradas de emergencia y supervisión humana, dado que no existe información sobre comportamiento ante fallos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fatdove/so101-pink-cylinder-bowl_GR00T17
- Dataset de entrenamiento: https://huggingface.co/datasets/fatdove/so101-pink-cylinder-bowl
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=fatdove/so101-pink-cylinder-bowl
- Repositorio GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Guía de LeRobot para groot: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots

Nota: la búsqueda web realizada no devolvió ningún resultado relacionado con el modelo; los enlaces obtenidos correspondían a un sitio de un club de fútbol y se han descartado por no ser relevantes.
