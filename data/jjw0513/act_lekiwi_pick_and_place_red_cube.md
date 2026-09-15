# JJW0513/act_lekiwi_pick_and_place_red_cube

## Resumen

`JJW0513/act_lekiwi_pick_and_place_red_cube` es una política de robótica basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales. El modelo lo publica el usuario JJW0513 en Hugging Face y se ha entrenado y subido con LeRobot, la librería de aprendizaje automático para robótica del mundo real de Hugging Face. No es un modelo de lenguaje: es un controlador visomotor que consume el estado del robot y dos cámaras, y devuelve un vector de acciones de 9 dimensiones.

La política está especializada en una única tarea: recoger cubos y colocarlos en las categorías correctas, sobre un robot de tipo `lekiwi_client` (plataforma móvil manipuladora del ecosistema LeRobot). El entrenamiento se ha realizado con un conjunto de datos propio de 42 episodios y 10.745 fotogramas grabados a 30 FPS mediante teleoperación, durante 100.000 pasos de optimización.

Su relevancia es práctica más que algorítmica: sirve como ejemplo reproducible de un pipeline completo de imitación (grabación de datos, entrenamiento y despliegue) con el stack LeRobot 0.6.0, y como base para hacer *fine-tuning* en tareas de pick-and-place similares. El repositorio es pequeño (0,2 GB) y el checkpoint tiene 51.674.761 parámetros, lo que lo sitúa en la gama ligera de las políticas robóticas actuales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con módulo CVAE para modelar la variabilidad de las demostraciones |
| Parametros totales | 51.674.761 (aproximadamente 51,7 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica / no disponible (no es un modelo de lenguaje; procesa una ventana de observaciones y emite un chunk de acciones) |
| Tipos de cuantizacion | No disponible. El repositorio solo contiene el checkpoint en precisión nativa de PyTorch; no se documentan variantes int8, int4 ni GGUF |
| Idiomas soportados | No aplica / no disponible (modelo de control robótico, sin entrada ni salida de texto libre) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tipo de politica | Aprendizaje por imitacion (behavior cloning) con prediccion de chunks de acciones |
| Robot objetivo | `lekiwi_client` |
| Camaras | `front`, `wrist` (3 x 480 x 640 cada una) |
| Entrada de estado | `observation.state`, forma `(9,)` |
| Salida | `action`, forma `(9,)` |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT es un transformer encoder-decoder con un encoder visual (típicamente ResNet) que procesa las imágenes de las cámaras `front` y `wrist`, más un encoder de estado que recibe el vector de 9 dimensiones del robot. La innovación central del método es la predicción por *chunks*: en lugar de emitir una sola acción por inferencia, el decodificador produce una secuencia corta de acciones futuras, lo que reduce el error de composición (*compounding error*) y suaviza el control. El módulo CVAE aprende una variable latente de estilo que permite representar la variabilidad inherente a las demostraciones humanas. En LeRobot, ACT se ejecuta con el flag `--policy.type=act`.

Los datos de entrenamiento provienen del dataset `JJW0513/lekiwi_pick_and_place_red_cube`: 42 episodios, 10.745 fotogramas a 30 FPS, con la tarea descrita literalmente como «Picck the cubes and place them in the right categories» (sic). La configuración declarada es de 100.000 pasos, tamaño de lote 8, optimizador AdamW, tasa de aprendizaje 1e-05, semilla 1000 y LeRobot 0.6.0. No se menciona en la información disponible ningún uso de RLHF, DPO ni fases de *reinforcement learning*; se trata exclusivamente de aprendizaje por imitación a partir de teleoperación. Tampoco se documentan técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de acciones de control continuo: produce un vector de acción de 9 dimensiones a partir de estado y visión.
- Percepción visomotora con dos cámaras simultáneas (`front` y `wrist`) a resolución 480 x 640 y 30 FPS.
- Ejecución de tareas de pick-and-place sobre cubos, con clasificación y colocación por categorías en el destino.
- Control de una plataforma móvil manipuladora (`lekiwi_client`), combinando base móvil y brazo en un único vector de acción de 9 grados de libertad efectivos.
- Aprendizaje por imitación de demostraciones teleoperadas, replicando la distribución de movimientos observada en los 42 episodios de entrenamiento.
- Despliegue en bucle cerrado en tiempo real mediante `lerobot-rollout`, con estrategia `base` (sin grabación de episodios) o con grabación para recolectar nuevos datos.
- Reentrenamiento y *fine-tuning* sencillos: la misma tubería `lerobot-train --policy.type=act` permite adaptarlo a un dataset propio.
- No dispone de *tool calling*, razonamiento multi-paso simbólico, capacidades multilingües, ni entrada de texto libre. La tarea se fija mediante el parámetro `--task` en el momento del despliegue.

## Casos de uso

- Clasificación y organización de objetos en almacén: la política puede recoger cubos o piezas de una zona de entrada y depositarlos en contenedores separados por categoría, aprovechando que fue entrenada exactamente para esa tarea con dos vistas de cámara.
- Automatización de una célula de pick-and-place de laboratorio: sobre un LeKiwi con cámara frontal y de muñeca, el modelo ejecuta ciclos de recogida y colocación a 30 FPS sin necesidad de planificación simbólica ni de modelos de lenguaje.
- Recolección de datos para imitación: ejecutando `lerobot-rollout` sin `--strategy.type=base` se graban episodios nuevos que pueden ampliar el dataset original de 42 episodios y mejorar la robustez de la política.
- Base para *fine-tuning* en tareas similares: al ser un checkpoint ACT de 51,7 M de parámetros con licencia Apache-2.0, es un punto de partida barato para reentrenar con un dataset propio de otro objeto o de otra posición de cámara.
- Evaluación comparativa de algoritmos de imitación: sirve como referencia ACT frente a otras políticas del ecosistema LeRobot (Diffusion Policy, SmolVLA) en la misma plataforma robótica y el mismo hardware.
- Docencia y divulgación en robótica: el repositorio incluye el dataset, la configuración de entrenamiento y los comandos de despliegue, lo que permite reproducir el ciclo completo grabación-entrenamiento-inferencia en un curso o taller.
- Demostración de robots móviles manipuladores de bajo coste: al requerir un checkpoint de 0,2 GB y un consumo de memoria reducido, se puede ejecutar en un equipo con GPU de gama media o incluso integrado junto al robot en una estación de trabajo convencional.
- Investigación en robustez visual: permite medir la degradación de la política al cambiar iluminación, posición de los cubos o presencia de distractores, ya que el autor no ha publicado ninguna evaluación de este tipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card incluye una sección de evaluación explícitamente vacía, con la nota «No evaluation results have been provided for this policy yet», por lo que no existen tasas de éxito en robot real, número de ensayos ni condiciones de evaluación. Tampoco se han publicado métricas de pérdida de entrenamiento ni comparaciones con otras políticas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint tiene 51.674.761 parámetros. En fp32 ocupa aproximadamente 207 MB de pesos; en fp16/bf16, unos 103 MB. A ello hay que sumar las activaciones de los dos encoders visuales a 3 x 480 x 640, por lo que el consumo real es superior al del solo peso, aunque sigue siendo modesto.
- GPU recomendadas: cualquier GPU con soporte CUDA reciente es suficiente para la inferencia; se recomienda una NVIDIA RTX 3060 o superior para trabajar con margen a 30 FPS, y GPU de clase A100 o H100 no aportan ventaja significativa en esta carga más allá de la densidad de ejecuciones simultáneas.
- Cabe en GPU de consumo: sí. El repositorio completo ocupa 0,2 GB, de modo que entra en cualquier GPU consumer con 6 GB o más, e incluso el entrenamiento completo con lote 8 es viable en tarjetas de gama media.
- CPU: la inferencia en CPU es posible por tamaño, pero compromete el requisito de tiempo real a 30 FPS (menos de 33 ms por paso), por lo que no se recomienda para control del robot.
- Opciones de despliegue: `lerobot-rollout` (comando oficial de LeRobot) con `--policy.path=JJW0513/act_lekiwi_pick_and_place_red_cube`; también es posible cargar el checkpoint mediante la API de Python de LeRobot. No aplica el despliegue con vLLM, llama.cpp, Ollama o TGI, que son servidores para modelos de lenguaje.
- Latencia y throughput: no disponibles. El único requisito conocido es que la política se entrenó y se despliega a 30 FPS (33,3 ms por paso) con hardware específico del robot (`--robot.port` y cámaras concretas).

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto / observaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `JJW0513/act_lekiwi_pick_and_place_red_cube` | ACT (transformer + CVAE, chunks de acciones) | 51,7 M | 2 camaras 480x640, estado (9,) | Apache-2.0 | Hugging Face, libreria LeRobot |
| ACT (implementacion de referencia de LeRobot) | ACT | No disponible | Configurable por el usuario | Apache-2.0 (LeRobot) | Repositorio de LeRobot y guia oficial de ACT |
| Diffusion Policy | Politica generativa por difusion sobre acciones | No disponible | Depende del backbone visual elegido | No disponible en la informacion proporcionada | Ecosistema LeRobot y repositorio propio |
| SmolVLA | Vision-lenguaje-accion (VLA) de pequeno tamano | No disponible | Condicionado por instruccion en lenguaje natural | No disponible en la informacion proporcionada | Hugging Face / LeRobot |

La ventaja diferencial de este checkpoint frente a alternativas es su tamano reducido y su licencia permisiva, a cambio de estar especializado en una sola tarea y un solo robot. Frente a políticas VLA condicionadas por lenguaje, carece de generalización a instrucciones nuevas; frente a Diffusion Policy, no hay datos publicados que permitan comparar tasas de éxito. Los datos de parametros, contexto y rendimiento de las alternativas no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: entrenado para una única tarea y un único robot (`lekiwi_client`); no generaliza a otras tareas ni a otras morfologías sin reentrenamiento.
- Dataset muy pequeño: 42 episodios y 10.745 fotogramas. Es un volumen bajo para aprendizaje por imitación, con riesgo elevado de sobreajuste a las posiciones, iluminación y objetos vistos durante la teleoperación.
- Ausencia total de evaluación: no hay tasa de éxito publicada, ni número de ensayos, ni condiciones de prueba, por lo que el rendimiento real en el robot es desconocido.
- Dependencia del montaje físico: las cámaras deben llamarse `front` y `wrist` y estar colocadas de forma coherente con las del entrenamiento; cualquier cambio de encuadre, resolución o frecuencia degrada el control.
- Sensibilidad a distractores: al no haberse evaluado con posiciones nuevas de objetos, cambios de iluminación o elementos añadidos en la escena, se desconoce su robustez en entornos no controlados.
- Riesgo de alucinación en el sentido generativo: no aplica como tal, pero sí existe riesgo de acciones erráticas o inseguras cuando la observación se sale de la distribución de entrenamiento, algo típico en behavior cloning.
- Errores en los metadatos: la descripción de la tarea contiene una errata («Picck the cubes...»), lo que puede provocar desajustes si se copia literalmente en el parámetro `--task` durante el despliegue.
- Idiomas: no procede; el modelo no procesa ni genera lenguaje natural.
- Licencia: Apache-2.0 permite uso comercial y modificación, siempre que se conserven los avisos de copyright y se cite correctamente. No impone restricciones de uso adicionales, pero el autor no ofrece ninguna garantía sobre el comportamiento del modelo.
- Seguridad física: es una política de control de un robot real; debe desplegarse con límites de par, paradas de emergencia y supervisión humana, especialmente en las primeras ejecuciones.
- Madurez: el repositorio tiene 0 descargas y 0 likes y no hay versiones posteriores ni mantenimiento documentado, por lo que la reproducibilidad depende de la versión 0.6.0 de LeRobot indicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JJW0513/act_lekiwi_pick_and_place_red_cube
- Dataset de entrenamiento: https://huggingface.co/datasets/JJW0513/lekiwi_pick_and_place_red_cube
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=JJW0513/lekiwi_pick_and_place_red_cube
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
