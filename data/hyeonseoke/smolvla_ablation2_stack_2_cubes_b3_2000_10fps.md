# HyeonseokE/smolvla_ablation2_stack_2_cubes_B3_2000_10fps

## Resumen

El modelo `HyeonseokE/smolvla_ablation2_stack_2_cubes_B3_2000_10fps` es una politica robotica de tipo vision-lenguaje-accion (VLA) obtenida por ajuste fino supervisado de `lerobot/smolvla_base` sobre un unico conjunto de datos de demostraciones teleoperadas. Lo publica el usuario HyeonseokE en Hugging Face dentro del ecosistema LeRobot, con licencia apache-2.0 y 450.046.176 parametros (~450 M) en formato safetensors. Su funcion concreta es generar comandos de accion de 6 grados de libertad para un brazo `so101_follower` equipado con camaras, a partir de observaciones visuales y de estado.

El modelo resuelve una tarea muy acotada: apilar un bloque verde sobre uno rojo mediante aprendizaje por imitacion. Se ha entrenado con 100 episodios y 38.979 fotogramas capturados a 10 FPS, con 30.450 pasos de entrenamiento, tamano de lote 64, optimizador AdamW y tasa de aprendizaje 0,0001 sobre LeRobot 0.6.0. La relevancia de esta publicacion es la de servir de punto de referencia reproducible para estudios de ablation en politicas VLA compactas, no la de un modelo de proposito general.

SmolVLA, la familia a la que pertenece, se describe en el articulo arXiv:2506.01844 como un modelo vision-lenguaje-accion compacto, eficiente en coste computacional y desplegable en hardware de consumo. Esta ficha describe exclusivamente la variante concreta publicada por HyeonseokE, que no aporta resultados de evaluacion ni datos de idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) compacta; metodologia descrita en arXiv:2506.01844 |
| Parametros totales | 450.046.176 (~450 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo VLA; consume observaciones de estado e imagen, no texto libre) |
| Tipos de cuantizacion | no disponibles |
| Idiomas soportados | no disponible; la consigna de tarea del conjunto de datos esta en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria de inferencia | lerobot |
| Tipo de robot | so101_follower |
| Camaras declaradas | top, left_wrist |
| Frecuencia de control del dataset | 10 FPS |
| Entradas | `observation.state` (6,), `observation.images.camera1` (3, 256, 256), `observation.images.camera2` (3, 256, 256), `observation.images.camera3` (3, 256, 256) |
| Salidas | `action` (6,), `action.radian_urdf0` (6,) |
| Tamano del repositorio | 0,9 GB |
| Modelo base | lerobot/smolvla_base |
| Conjunto de datos de entrenamiento | HyeonseokE/ablation2_stack_2_cubes_B3_10fps |

## Arquitectura y entrenamiento

La model card identifica el modelo como SmolVLA, una politica vision-lenguaje-accion compacta que combina observaciones visuales y de estado proprioceptivo para emitir un vector de acciones. El modelo consume tres flujos de imagen de 3x256x256 junto con un vector de estado de 6 dimensiones y produce una accion de 6 dimensiones (mas una salida auxiliar `action.radian_urdf0` de 6 dimensiones). El detalle arquitectonico interno no se reproduce en la model card: la referencia tecnica disponible es el articulo arXiv:2506.01844.

El entrenamiento es un ajuste fino de `lerobot/smolvla_base` mediante aprendizaje por imitacion sobre el dataset `HyeonseokE/ablation2_stack_2_cubes_B3_10fps`, compuesto por 100 episodios, 38.979 fotogramas a 10 FPS y una unica consigna: "Stack the green block on the red block." La configuracion declarada es de 30.450 pasos, lote de 64, optimizador AdamW, tasa de aprendizaje 0,0001, semilla 2000 y LeRobot 0.6.0. No se especifica en la informacion disponible si hubo etapas de RLHF, DPO ni ninguna innovacion de decodificacion adicional; el nombre del repositorio sugiere que forma parte de una serie de experimentos de ablation variando el numero de bloques, la semilla y la tasa de fotogramas.

## Capacidades

- Generacion de acciones de manipulacion de 6 grados de libertad para el brazo `so101_follower`.
- Percepcion visual multi-camara: procesa tres flujos de imagen de 256x256, etiquetados como `camera1`, `camera2` y `camera3` en las entradas del modelo (la model card menciona las camaras `top` y `left_wrist`).
- Fusion de estado proprioceptivo y vision: integra `observation.state` (6,) con las imagenes para emitir la accion.
- Ejecucion de una tarea de apilado de dos bloques ("Stack the green block on the red block") en un entorno de laboratorio concreto.
- Control en bucle cerrado a 10 FPS, coherente con la frecuencia de captura del dataset de entrenamiento.
- Soporte de tool calling y function calling: no aplica; no es un modelo de lenguaje.
- Soporte de agentes y razonamiento multi-paso: no disponible; no hay evidencia de planificacion simbolica.
- Capacidades multilingues: no disponibles; la unica consigna documentada esta en ingles.
- Capacidades especiales (modo thinking, vision generativa, audio): no disponibles.

## Casos de uso

- Reproduccion de experimentos de ablation: el modelo forma parte de una serie con variaciones en el numero de bloques y la semilla, de modo que sirve para comparar el efecto de esos hiperparametros sobre la tasa de exito en la misma tarea de apilado.
- Punto de partida para ajuste fino en un SO-101: dado que deriva de `lerobot/smolvla_base`, se puede usar como inicializacion de nuevos entrenamientos con `lerobot-train` sobre datasets propios del mismo robot y misma configuracion de camaras.
- Validacion de canal de datos en robotica: su dataset (100 episodios, 38.979 fotogramas, 10 FPS) permite auditar el flujo completo de grabacion, visualizacion y entrenamiento dentro de LeRobot antes de invertir en campanas de datos mayores.
- Docencia y formacion en aprendizaje por imitacion: al ser una politica de ~450 M y 0,9 GB, se puede ejecutar en un portatil con GPU de gama media para demostrar el ciclo teleoperacion-entrenamiento-despliegue.
- Pruebas de integracion de `lerobot-rollout`: el comando documentado permite lanzar la politica en bucle durante un tiempo determinado, util para verificar cableado, calibracion de camaras y puertos del robot.
- Comparacion de politicas en un banco de pruebas fisico: al compartir tarea y robot con otras variantes de la misma serie, permite medir diferencias de comportamiento en condiciones controladas de iluminacion y posicion inicial.
- Generacion de datos sinteticos o aumentados para entrenamiento: las trayectorias producidas por la politica se pueden registrar y usar como referencia para estudiar deriva o como semilla de evaluacion, siempre que se documente la ausencia de resultados de exito publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explicitamente la nota "_No evaluation results have been provided for this policy yet._", sin tabla de tareas, numero de ensayos ni tasa de exito. Tampoco se documentan cifras de latencia, throughput ni comparaciones cuantitativas con otras politicas.

## Requisitos de hardware

- Parametros: 450.046.176 (~450 M). Peso en precision completa (FP32) en torno a 1,8 GB; en BF16/FP16 en torno a 0,9 GB, coherente con el tamano de repositorio declarado (0,9 GB).
- VRAM estimada para inferencia: aproximadamente 2-3 GB considerando pesos en BF16, tres flujos de imagen de 256x256 y el estado del robot (estimacion a partir del numero de parametros; no confirmada por el autor).
- GPU recomendadas: cualquier GPU NVIDIA reciente con al menos 8 GB de VRAM es suficiente por capacidad de memoria; para garantizar el control a 10 FPS conviene una GPU de gama media o superior (RTX 3060, RTX 4060, RTX 4090). No se requiere A100 ni H100.
- Cabe en GPU de consumo: si, incluidas RTX 3060/4060 de 8-12 GB y modelos equivalentes; el cuello de botella practico es la latencia de inferencia, no la memoria.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=HyeonseokE/smolvla_ablation2_stack_2_cubes_B3_2000_10fps`), y entrenamiento con `lerobot-train` partiendo de `lerobot/smolvla_base`. vLLM, llama.cpp, Ollama o TGI no son aplicables, porque no es un modelo de lenguaje de texto.
- Latencia y throughput: no disponibles. Como referencia de diseno, el dataset se capturo a 10 FPS, lo que implica un objetivo de 100 ms por paso de control para mantener una reproduccion fluida.
- Requisitos adicionales: brazo `so101_follower` calibrado, puerto serie del robot y camaras OpenCV configuradas con los mismos nombres de observacion usados en el entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Licencia | Disponibilidad | Resultados publicados |
|---|---|---|---|---|---|
| smolvla_ablation2_stack_2_cubes_B3_2000_10fps (este) | 450.046.176 | 3 imagenes 256x256 + estado (6,) | apache-2.0 | Hugging Face, libreria lerobot | ninguno (la model card lo indica) |
| lerobot/smolvla_base | no disponible (es el punto de partida del ajuste fino) | no disponible | apache-2.0 | Hugging Face | metodologia en arXiv:2506.01844; cifras concretas no disponibles en la informacion proporcionada |
| Otras politicas de robotica del ecosistema LeRobot | no disponible | no disponible | no disponible | repositorio LeRobot | no disponible |

No se dispone de datos cuantitativos que permitan comparar el rendimiento de esta politica con alternativas de la misma categoria. La comparacion relevante es cualitativa: se trata de un ajuste fino de tarea unica sobre `smolvla_base`, por lo que no generaliza fuera de la tarea y el robot documentados.

## Limitaciones y advertencias

- Especializacion extrema: la politica esta entrenada para una unica tarea ("Stack the green block on the red block") sobre un unico tipo de robot (`so101_follower`). No se debe esperar generalizacion a otras tareas, objetos o brazos.
- Sin evaluacion publicada: no hay tasa de exito, numero de ensayos ni condiciones de prueba documentadas, por lo que no se puede afirmar nada sobre su fiabilidad en produccion.
- Tamano del dataset limitado: 100 episodios y 38.979 fotogramas implican una cobertura estrecha de posiciones iniciales, iluminacion y configuraciones de escena; es probable una degradacion notable ante cambios de distribucion (iluminacion distinta, objetos distractores, posiciones no vistas).
- Dependencia de la configuracion de camaras: el modelo espera tres entradas visuales de 256x256 con nombres de observacion concretos. Un numero distinto de camaras, otros nombres o una calibracion diferente rompen la inferencia.
- Dependencia del hardware: requiere un brazo SO-101 correctamente calibrado y comunicado; errores de calibracion o de puerto serie no son corregibles por el modelo.
- Idioma: la unica consigna documentada esta en ingles y no se declaran idiomas soportados; no hay evidencia de comprension multilingue de instrucciones.
- Ausencia de cuantizaciones publicadas: no se documentan versiones GGUF, AWQ, GPTQ ni INT8, de modo que el despliegue en entornos con memoria muy restringida requeriria conversion propia.
- Sesgos conocidos: no disponibles. No obstante, en aprendizaje por imitacion el comportamiento hereda los sesgos de las demostraciones humanas (trayectorias, velocidades y estrategias repetidas por el operador).
- Alucinacion: el concepto no aplica en el sentido de generacion de texto, pero si existe el riesgo analogo de generar acciones plausibles pero incorrectas ante observaciones fuera de distribucion, sin senal de incertidumbre.
- Licencia: apache-2.0, que permite uso comercial, modificacion y redistribucion. Debe verificarse de forma independiente la licencia del modelo base (`lerobot/smolvla_base`) y del dataset asociado antes de un uso comercial.
- Advertencia practica: el nombre del repositorio sugiere un experimento de ablation; conviene tratarlo como artefacto de investigacion y no como politica lista para produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HyeonseokE/smolvla_ablation2_stack_2_cubes_B3_2000_10fps
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/HyeonseokE/ablation2_stack_2_cubes_B3_10fps
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=HyeonseokE/ablation2_stack_2_cubes_B3_10fps
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Articulo de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
