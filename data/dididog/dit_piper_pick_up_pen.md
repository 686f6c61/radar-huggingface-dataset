# dididog/dit_piper_pick_up_pen

## Resumen

El modelo `dididog/dit_piper_pick_up_pen` es una política de robótica (no un modelo de lenguaje) entrenada con LeRobot y publicada por el usuario de HuggingFace dididog (Yi-Shiang Huang). Implementa la arquitectura Multi-Task Diffusion Transformer (DiT), descrita en el artículo arXiv 2507.05331, que extiende el Diffusion Policy clásico sustituyendo la red denoiser por un Diffusion Transformer de gran tamaño y añadiendo condicionamiento conjunto de texto e imágenes para aprendizaje robótico multitarea. El checkpoint publicado contiene 248.893.191 parámetros según los pesos en safetensors, aunque la model card del método menciona aproximadamente 450M de parámetros para la variante de referencia.

El problema que resuelve es el de la manipulación robótica por imitación: a partir de demostraciones teleoperadas, la política aprende a mapear observaciones (estado articular de 7 dimensiones y dos cámaras RGB de 720x1280) a comandos de acción de 7 dimensiones. En este caso concreto está especializada en una única tarea: "Pick up the marker and put it into the pen holder", entrenada sobre el dataset `dididog/piper_pick_up_pen` con solo 11 episodios y 6196 fotogramas a 15 FPS. Su relevancia es doble: por un lado demuestra que un DiT puede alcanzar destreza con presupuestos de parámetros moderados y pocos datos; por otro, es un ejemplo reproducible del flujo completo de LeRobot (grabación, entrenamiento, rollout) sobre un brazo Piper.

Es importante encuadrarlo correctamente: no es un modelo conversacional ni un LLM, no tiene ventana de contexto textual y no se distribuye para inferencia de texto. Se ejecuta con `lerobot-rollout` sobre hardware robótico real y requiere que los nombres de cámara y la configuración coincidan con los usados en el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multi-Task Diffusion Transformer (DiT) con condicionamiento de texto y vision; soporta objetivos de diffusion y flow-matching |
| Parametros totales | 248.893.191 (segun los pesos safetensors del repositorio); la model card del metodo cita "~450M" para la variante de referencia |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo de contexto textual). Entradas fijas: `observation.state` (7,), dos imagenes (3, 720, 1280) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible. El condicionamiento textual de la tarea se ejemplifica en ingles ("Pick up the marker and put it into the pen holder") |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`; tamano del repositorio 1.0 GB) |
| Pipeline | robotics |
| Camaras | `camera_hand`, `camera_top` |
| Salida | `action` (7,) |
| Version de LeRobot | 0.6.1 |

## Arquitectura y entrenamiento

La política sigue el paradigma de Diffusion Policy: en lugar de predecir directamente una acción, aprende a denoisar una distribución de secuencias de acción condicionada por las observaciones. La innovación de este trabajo es reemplazar el denoiser convolucional clásico por un Diffusion Transformer (DiT) de escala relativamente grande (248,9M de parámetros en este checkpoint) y alimentarlo con dos modalidades de condicionamiento: texto de la tarea e imágenes de cámara, lo que habilita el aprendizaje multitarea dentro de un mismo modelo. La model card indica además que la implementación admite tanto el objetivo de difusión como el de flow-matching, una elección de entrenamiento habitual para acelerar la convergencia y mejorar la calidad de las muestras.

El entrenamiento se realizó con LeRobot 0.6.1 durante 30000 pasos, con tamaño de lote 32, optimizador Adam, tasa de aprendizaje 2e-05 y semilla 1000. El dataset es `dididog/piper_pick_up_pen`: 11 episodios, 6196 fotogramas capturados a 15 FPS, con una única tarea anotada. No se especifica en la información disponible el número total de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO (procedimientos que, por otra parte, no son habituales en aprendizaje por imitación robótico). Tampoco se detalla la composición exacta de la torre de visión o del codificador de texto empleado para el condicionamiento.

## Capacidades

- Generación de acciones robóticas de 7 grados de libertad (probablemente 6 DoF de brazo más pinza) a partir de observaciones multimodales.
- Condicionamiento por lenguaje: la tarea objetivo se especifica como cadena de texto, lo que permite en principio reutilizar el mismo modelo para varias tareas anotadas.
- Percepción visual dual: consume simultáneamente una vista cenital (`camera_top`) y una vista de la mano o pinza (`camera_hand`), lo que facilita el agarre fino y el envío al soporte.
- Fusión de estado propioceptivo (7 dimensiones) con visión, típica de las políticas de imitación.
- Aprendizaje por imitación de una tarea de pick-and-place: coger un rotulador y colocarlo en el soporte.
- Ejecución autónoma mediante `lerobot-rollout` sobre un robot Piper, sin necesidad de teleoperación en tiempo de inferencia.
- Tool calling / function calling: no aplica, no es un modelo de lenguaje.
- Agentes y razonamiento multi-paso: no disponible; se trata de una política reactiva de horizonte de acción, sin planificación simbólica.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión para descripción, audio): no disponibles. La visión se usa exclusivamente como entrada de control.

## Casos de uso

- Automatización de pick-and-place en laboratorio: colocar el rotulador en el soporte de forma repetida es exactamente la tarea entrenada, por lo que es el escenario con mayor probabilidad de éxito y el punto de partida natural para validar el checkpoint.
- Punto de partida para fine-tuning con nuevos objetos: el condicionamiento textual permite reentrenar sobre datasets propios (por ejemplo `dididog/piper_cube`) y obtener políticas que compartan arquitectura y flujo de trabajo.
- Investigación en aprendizaje por imitación con pocos datos: 11 episodios y 6196 fotogramas constituyen un caso de estudio útil para medir cuánta señal se puede extraer de datasets minúsculos con un DiT de ~249M de parámetros.
- Comparación de objetivos de entrenamiento: al soportar difusión y flow-matching, sirve como banco de pruebas para medir diferencias de estabilidad y calidad entre ambos objetivos en robótica real.
- Recolección de datos asistida: ejecutar la política con `--strategy.type=base` permite generar trayectorias sin grabarlas, útil para evaluar la cobertura del espacio de estados antes de recopilar nuevas demostraciones.
- Docencia y divulgación técnica: al ser un ejemplo completo de LeRobot (dataset, política, comandos de entrenamiento y de rollout), resulta adecuado para talleres de robótica de manipulación.
- Base para despliegues en brazos Piper dentro de líneas de montaje sencillas: la política ocupa menos de 1 GB en disco, lo que simplifica su distribución y versionado junto al resto del software del robot.
- Integración en pipelines de evaluación continua: al ser determinista salvo por el muestreo de difusión, se puede repetir la misma tarea N veces y medir tasa de éxito, tal y como sugiere la plantilla de evaluación de la propia model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación con la plantilla vacía y la nota explícita "No evaluation results have been provided for this policy yet", por lo que no existen tasas de éxito medidas en robot real ni comparaciones numéricas con otras políticas.

| Benchmark | Resultado |
|---|---|
| MMLU, HumanEval, GSM8K | No aplica (no es un modelo de lenguaje) |
| Tasa de exito en robot real | No disponible |
| Numero de ensayos por tarea | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, 248,9M de parámetros ocupan aproximadamente 1,0 GB en FP32 y 0,5 GB en BF16/FP16, a lo que hay que sumar activaciones, el codificador de visión que procesa dos imágenes de 720x1280 y el coste de la decodificación iterativa propia de un modelo de difusión.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cualquier GPU con al menos 8-12 GB de VRAM (RTX 3060 12 GB, RTX 4070, RTX 4090) debería ser suficiente para inferencia en FP16 o BF16; no hay datos publicados que lo confirmen.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del checkpoint (<1 GB en disco), pero no está verificado en la model card. La limitación práctica puede venir del bucle de control en tiempo real (15 FPS) y no de la memoria.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=dididog/dit_piper_pick_up_pen`), PyTorch con CUDA (`--policy.device=cuda`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a una política robótica.
- Latencia y throughput estimados: no disponibles. La frecuencia de grabación del dataset es de 15 FPS (66 ms por fotograma), lo que da una referencia del orden de magnitud temporal en el que debe operar el bucle de control, pero no hay medidas de latencia de inferencia publicadas.
- Requisitos adicionales: robot Piper (u otro compatible con LeRobot) calibrado, dos cámaras OpenCV accesibles con los nombres `camera_hand` y `camera_top`, y conexión al puerto serie del robot.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto/entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dididog/dit_piper_pick_up_pen` | Diffusion Transformer multi-tarea | 248.893.191 | Estado (7,) + 2 imagenes 3x720x1280 | Apache-2.0 | HuggingFace, libreria `lerobot` |
| Diffusion Policy (original) | Politica de difusion con denoiser convolucional (UNet) | No disponible | Estado + imagenes | No disponible | Implementado en LeRobot |
| ACT (Action Chunking Transformer) | Transformer con chunking de acciones | No disponible | Estado + imagenes | No disponible | Implementado en LeRobot |
| SmolVLA | Vision-language-action de pequeno tamano | No disponible | Estado + imagenes + texto | No disponible | No disponible |

No se dispone de cifras verificadas de parámetros ni de benchmarks para las alternativas en la información proporcionada, por lo que la comparación cuantitativa no puede completarse. La diferencia conceptual principal frente a Diffusion Policy y ACT es el uso de un transformer de difusión de mayor escala con condicionamiento de texto y visión explícito, orientado a multitarea, frente a arquitecturas específicas por tarea.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea y un único montaje, con solo 11 episodios. La generalización a posiciones, iluminación, objetos o brazos distintos de los vistos en el dataset es muy improbable sin reentrenamiento.
- Sin evaluación publicada: no hay tasa de éxito medida, así que la fiabilidad real en producción es desconocida y debe validarse empíricamente antes de cualquier despliegue.
- Inconsistencia de resolución: el comando de ejemplo de la model card configura las cámaras a 640x480, mientras que las observaciones con las que se entrenó la política son de 720x1280. Conviene usar la resolución de entrenamiento para evitar degradación.
- Dependencia de los nombres de cámara: la política espera exactamente las claves `camera_hand` y `camera_top`. Cambiar los nombres o el número de cámaras rompe la inferencia.
- Riesgo de fallo físico: es un sistema que controla un manipulador real. Los fallos de la política pueden provocar colisiones, caídas de objetos o daños materiales; se recomienda operar con límites de par, paradas de emergencia y espacio de trabajo despejado.
- Alta varianza por muestreo: al ser un modelo de difusión, cada ejecución puede diferir aunque las observaciones sean idénticas; la repetibilidad no está garantizada.
- Sesgos: no se documentan análisis de sesgo. Existen sesgos implícitos derivados del montaje de grabación (posición del robot, iluminación, fondo, color del objeto).
- Idiomas: no se especifica qué idiomas admite el condicionamiento textual; el único ejemplo documentado está en inglés.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero el usuario asume toda la responsabilidad sobre el comportamiento del robot y sobre las dependencias de LeRobot y del artículo asociado.
- Estado del repositorio: 0 descargas y 0 "likes" en el momento de los datos consultados, sin demos ni vídeos publicados, lo que dificulta validar su funcionamiento sin reproducirlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dididog/dit_piper_pick_up_pen
- Dataset de entrenamiento: https://huggingface.co/datasets/dididog/piper_pick_up_pen
- Articulo (paper) del metodo: https://huggingface.co/papers/2507.05331 (arXiv 2507.05331)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de multi_task_dit en LeRobot: https://huggingface.co/docs/lerobot/main/en/multi_task_dit
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=dididog/piper_pick_up_pen
- Perfil del autor: https://huggingface.co/dididog
- Otro dataset del mismo autor: https://huggingface.co/datasets/dididog/piper_cube
