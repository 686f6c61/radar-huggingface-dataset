# ranjith3567/smolvla_pick_place_blue_cube_v4

## Resumen

SmolVLA es una familia de modelos visión-lenguaje-acción (VLA) compactos orientados a robótica, desarrollada por el equipo de LeRobot en Hugging Face. La ficha que nos ocupa, `ranjith3567/smolvla_pick_place_blue_cube_v4`, es un ajuste fino (fine-tune) del modelo base `lerobot/smolvla_base`, entrenado por un usuario particular para una tarea concreta de manipulación: coger un cubo azul y colocarlo en una caja marrón. El modelo consume el estado del robot y tres cámaras, y produce directamente comandos de acción de 6 grados de libertad.

El interés de esta ficha es doble. Por un lado, ilustra el flujo de trabajo típico de LeRobot: partir de un VLA preentrenado y ajustarlo con un dataset de demostraciones propio (50 episodios, 28.835 fotogramas a 30 FPS). Por otro, muestra el nicho de SmolVLA como VLA de ~450 millones de parámetros que aspira a ejecutarse en hardware de consumo (GPU de gama media o incluso CPU), en contraste con alternativas de 3 a 7 mil millones de parámetros como π0 u OpenVLA. El modelo base se describe en el artículo arXiv 2506.01844.

Se trata, en cualquier caso, de una política muy especializada y sin resultados de evaluación publicados: no es un modelo de propósito general, sino un artefacto de investigación reproducible para una celda robótica concreta (brazo seguidor tipo `so_follower`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en el backbone de SmolVLA, con experto de acciones por flow matching (segun el modelo base referenciado en arXiv 2506.01844); fine-tune del modelo base |
| Parametros totales | 450.046.176 (~450 millones) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo distribuido en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (no se declaran idiomas; la tarea esta descrita en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `lerobot`; tamano del repo 0,9 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tune directo de `lerobot/smolvla_base`, un VLA compacto que combina un codificador visual y un modelo de lenguaje pequeño con un experto de acciones que genera trayectorias mediante flow matching; el artículo de referencia (arXiv 2506.01844) describe el modelo como eficiente y desplegable en hardware de consumo. La ficha no aporta detalles adicionales sobre el backbone concreto, el numero de tokens de entrenamiento ni la composicion del dataset de preentrenamiento del modelo base, por lo que esos datos quedan como "no disponible" en esta ficha.

El ajuste fino se realizo con LeRobot 0.6.2 sobre el dataset `ranjith3567/pick_place_Blue_cube_v4_20261013_202650`: 50 episodios de demostracion teleoperada, 28.835 fotogramas capturados a 30 FPS, con la unica instruccion de tarea "pick up the blue box and place it in brown box". La configuracion de entrenamiento documentada es de 30.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-4 y semilla 1000. No se menciona uso de RLHF, DPO ni ninguna otra fase de alineacion adicional; se trata de aprendizaje por imitacion supervisado.

Las entradas declaradas son `observation.state` con forma `(6,)` y tres imagenes de 256x256 píxeles (`observation.images.camera1`, `camera2`, `camera3`), mientras que la seccion de detalles del modelo solo lista dos camaras fisicas (`Top`, `Side`). Esa discrepancia conviene resolverla antes de desplegar la politica. La salida es un vector de accion de 6 dimensiones.

## Capacidades

- Generacion de acciones de robot de 6 grados de libertad a partir de observaciones visuales y de estado, mediante aprendizaje por imitacion.
- Control visomotor para una tarea especifica de pick-and-place: coger un cubo azul y depositarlo en una caja marrón.
- Fusion de tres flujos visuales de 256x256 píxeles junto con el estado articular del robot.
- Ejecucion en bucle cerrado a la frecuencia de control del robot, integrada mediante el comando `lerobot-rollout`.
- Reentrenamiento y ajuste fino adicionales sobre el mismo modelo base con `lerobot-train`.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, razonamiento textual, codigo, matematicas, vision general, audio ni modo de pensamiento. La tarea declarada es exclusivamente robotica.
- Capacidades multilingues: no disponibles; la unica instruccion de tarea registrada esta en ingles.

## Casos de uso

- Automatizacion de pick-and-place en laboratorio: la politica ejecuta de forma autonoma la secuencia de recoger el cubo azul y depositarlo en la caja marrón sobre un brazo `so_follower`, lo que permite liberar al operador de tareas repetitivas de manipulacion.
- Banco de pruebas para investigacion en VLA: sirve como punto de partida reproducible para estudiar el efecto del numero de episodios (50 en este caso), de la configuracion de camaras o de la tasa de aprendizaje en el exito de una politica de imitacion.
- Docencia y formacion en robotica de imitacion: el flujo completo (grabar dataset, entrenar con LeRobot, desplegar con `lerobot-rollout`) se puede reproducir en un aula con hardware de bajo coste.
- Prototipado rapido de celdas robotizadas: al requerir menos de 1 GB de pesos y poder ejecutarse en GPU de consumo, permite validar una celda antes de invertir en modelos mayores.
- Generacion de datos sinteticos o aumentados: la politica puede usarse como generador de trayectorias base que luego se filtran y se incorporan a un dataset mayor para un segundo ciclo de entrenamiento.
- Demostraciones en ferias y eventos: un VLA de 450 millones de parametros se puede ejecutar en local sin depender de servicios en la nube, lo que facilita demostraciones sin conectividad.
- Integracion en pipelines de evaluacion comparativa: sirve como linea base ligera frente a politicas mas grandes (π0, OpenVLA) en estudios de coste frente a rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explicitamente la indicacion "_No evaluation results have been provided for this policy yet_", de modo que no existen tasas de exito en robot real ni metricas de simulacion para este fine-tune concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 0,9 GB en safetensors, lo que situa la inferencia en precision mixta en torno a 1-2 GB de memoria, mas el coste de activaciones y buffers de imagen. Cifra exacta: no disponible.
- GPU recomendadas: cualquier GPU moderna con al menos 4-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) deberia ser suficiente; el modelo base esta disenado, segun el articulo referenciado, para hardware de consumo. No se documentan requisitos oficiales.
- Cabe en GPU de consumo: si, previsiblemente en la mayoria de GPU de gama media y alta, dado el tamano de ~450 millones de parametros. El autor no especifica una configuracion minima verificada.
- Despliegue: el flujo oficial es LeRobot (`lerobot-rollout` para ejecucion, `lerobot-train` para entrenamiento). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un VLA con salida de acciones.
- Latencia y throughput: no disponibles. La frecuencia de control practica dependera del robot, de las tres camaras y del hardware de inferencia.

## Comparativa con modelos similares

Los datos de las alternativas corresponden a sus model cards publicas; los de esta ficha, a la informacion proporcionada. Donde no hay dato verificado se indica "no disponible".

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ranjith3567/smolvla_pick_place_blue_cube_v4` | ~450 M | no disponible | VLA fine-tune, tarea unica pick-and-place | Apache 2.0 | Hugging Face, libreria LeRobot |
| `lerobot/smolvla_base` (modelo base) | ~450 M (familia SmolVLA) | no disponible | VLA preentrenado de proposito general | no disponible en esta ficha | Hugging Face, LeRobot |
| OpenVLA (referencia de la comunidad) | ~7 B | no disponible en esta ficha | VLA preentrenado | no disponible en esta ficha | publico |
| π0 (referencia de la comunidad) | ~3 B | no disponible en esta ficha | VLA con flow matching | no disponible en esta ficha | publico |

La ventaja diferencial de este modelo frente a los VLA de mayor tamano es el coste computacional: ~450 millones de parametros frente a varios miles de millones, lo que habilita despliegue en hardware de consumo. La contrapartida es que este fine-tune concreto solo sabe resolver una tarea y no ofrece generalizacion a instrucciones arbitrarias.

## Limitaciones y advertencias

- Especializacion extrema: la politica se ha entrenado exclusivamente para la instruccion "pick up the blue box and place it in brown box". No se espera transferencia a otras tareas, objetos ni instrucciones.
- Ausencia total de evaluacion: no hay tasas de exito publicadas, ni en robot real ni en simulacion, por lo que se desconoce la fiabilidad practica de la politica.
- Dataset reducido: 50 episodios y 28.835 fotogramas son un volumen pequeno, lo que aumenta el riesgo de sobreajuste a las posiciones, iluminacion y apariencia concretas de las demostraciones.
- Dependencia del setup fisico: el rendimiento dependera del brazo `so_follower` concreto, de la calibracion, del montaje de las camaras y de la correspondencia entre los nombres de camara usados en el entrenamiento y los del despliegue.
- Inconsistencia documental: la model card lista dos camaras (`Top`, `Side`) pero la interfaz declara tres entradas visuales; desplegar con un numero o nombres distintos de camara puede provocar fallos silenciosos.
- Sesgos conocidos: no documentados en la informacion disponible. Cabe esperar sesgos derivados del entorno de captura (fondo, iluminacion, posiciones iniciales), pero no hay analisis publicado.
- Riesgo de alucinacion: no aplica en el sentido textual, pero si existe riesgo de generar acciones incorrectas o inseguras cuando la escena se aleja de la distribucion de entrenamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, con obligacion de conservar los avisos de licencia y de atribucion. Conviene verificar la licencia del modelo base y del dataset utilizado.
- Uso en produccion: requiere supervisión humana, limites de parada de emergencia y validacion exhaustiva antes de operar cerca de personas u objetos fragiles.
- Idiomas y contexto: no se declaran idiomas soportados ni longitud de contexto, por lo que no puede asumirse comportamiento multilingue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ranjith3567/smolvla_pick_place_blue_cube_v4
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/ranjith3567/pick_place_Blue_cube_v4_20261013_202650
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ranjith3567/pick_place_Blue_cube_v4_20261013_202650
- Articulo de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo en la busqueda realizada.
