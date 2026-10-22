# Screener2/act_FullGrid_20261007_sim

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que predice fragmentos ("chunks") de acciones futuras en lugar de un único paso de control, lo que reduce el error de acumulación típico de las políticas paso a paso y permite ejecutar tareas de manipulación fina con datos de teleoperación. La ficha corresponde a un checkpoint concreto entrenado con LeRobot por el usuario Screener2 sobre el dataset `Screener2/FullGrid_20261007_sim`, no al método original de los autores del paper.

El modelo es una política visual-motora para un robot tipo `so_follower` (SO-100/SO-101 de LeRobot) equipado con una única cámara cenital (`overhead`) a 480×640 y 30 FPS. Consume un vector de estado de 6 dimensiones y una imagen, y produce un vector de acción de 6 dimensiones. Con 51.668.614 parámetros y un repo de 0,2 GB, es un modelo pequeño que se ejecuta en tiempo real en GPU de consumo e incluso en CPU.

Su relevancia es la de un ejemplo reproducible de entrenamiento de políticas con LeRobot 0.5.2 sobre un dataset muy reducido: 15 episodios y 5737 fotogramas (unos 191 segundos de demostraciones). Es útil como referencia de pipeline (formato de observaciones, CLI de rollout, configuración de entrenamiento) más que como política lista para producción, ya que el autor no ha publicado ninguna evaluación en robot real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformers sobre observaciones visuales y de estado, con predicción de chunks de acciones; implementado en LeRobot |
| Parámetros totales | 51.668.614 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible / no aplica: no es un modelo de lenguaje. Entrada por paso de control: `observation.state` `(6,)` + `observation.images.overhead` `(3, 480, 640)`; longitud del chunk de acciones no documentada en la model card |
| Tipos de cuantización | No disponible: el autor solo publica pesos en safetensors (fp32) vía LeRobot; no se documentan variantes cuantizadas ni GGUF |
| Idiomas soportados | No disponible / no aplica: la tarea está etiquetada como `"0"`, sin instrucciones en lenguaje natural |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repositorio LeRobot, `library_name: lerobot`); repo de 0,2 GB |
| Tipo de robot | `so_follower` |
| Cámaras | `overhead` (una sola vista) |
| Dimensión de estado / acción | 6 / 6 |
| Frecuencia de control | 30 FPS (frecuencia del dataset de entrenamiento) |
| Pipeline en HuggingFace | `robotics` |

## Arquitectura y entrenamiento

ACT combina un codificador visual con un transformer encoder-decoder que modela una distribución condicional sobre secuencias de acciones, siguiendo el paper *Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware* (arXiv:2304.13705). La formulación habitual es un autoencoder variacional condicional (CVAE) en el que una variable latente captura la variabilidad del estilo humano en las demostraciones; en inferencia se predice un chunk de acciones que se ejecuta en bucle abierto durante varios pasos, lo que aporta suavidad y reduce el coste de replanificación. Esta implementación concreta está construida con LeRobot 0.5.2, que aporta el envoltorio de política, el procesado de imágenes y las utilidades de rollout. La model card no detalla el tamaño del chunk, el backbone visual ni el número de capas del transformer, por lo que esos hiperparámetros deben consultarse en el `config.json` del repositorio.

El entrenamiento se realizó sobre el dataset `Screener2/FullGrid_20261007_sim`: 15 episodios, 5737 fotogramas a 30 FPS (aproximadamente 191 segundos de demostraciones) y una única tarea etiquetada como `"0"`. La configuración declarada es de 100.000 pasos con batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. Con ese volumen de datos, 100.000 pasos implican del orden de 800.000 muestras procesadas frente a 5737 fotogramas disponibles, es decir, cientos de épocas sobre el mismo conjunto: es una configuraciónpropensa al sobreajuste y sin validación publicada. No se documenta uso de RLHF, DPO ni ninguna fase de refinamiento posterior; es aprendizaje por imitación supervisado puro. El sufijo `_sim` del dataset sugiere datos generados en simulación, aunque la model card no lo confirma explícitamente.

## Capacidades

- Control visomotor de manipulación: mapea una imagen cenital de 480×640 y el estado de las articulaciones (6 dimensiones) a comandos de acción de 6 dimensiones para un `so_follower`.
- Predicción de chunks de acciones, orientada a movimientos suaves y consistentes en tareas de precisión (el paper original aborda manipulación bimanual fina).
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin recompensa explícita ni entorno simulable durante el entrenamiento.
- Ejecución en bucle cerrado a 30 FPS mediante `lerobot-rollout`, con la estrategia `base`.
- Reproducibilidad del pipeline: la configuración de entrenamiento y el dataset están publicados, lo que permite reentrenar o hacer fine-tuning con `lerobot-train --policy.type=act`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión general, audio ni generación de texto: no es un modelo de lenguaje.
- Capacidades multilingües: no aplica; la única "instrucción" es la etiqueta de tarea `"0"` y el modelo no procesa lenguaje natural.

## Casos de uso

- Replicación de experimentos de imitation learning: sirve como referencia verificable de un entrenamiento ACT completo con LeRobot 0.5.2 (100.000 pasos, batch 8, AdamW, lr 1e-5), útil para comparar curvas de pérdida y configuraciones propias.
- Base para fine-tuning en un robot SO-100/SO-101 real: al estar en formato LeRobot y con licencia Apache 2.0, se puede partir de estos pesos y reentrenar con un dataset propio de más episodios para una tarea concreta.
- Validación del pipeline de datos: el dataset de 15 episodios y 5737 fotogramas permite comprobar la cadena de grabación, calibración de cámara cenital y visualización con el Space `lerobot/visualize_dataset` antes de escalar a un dataset mayor.
- Pruebas de integración de `lerobot-rollout`: el comando publicado (con `--robot.type=so_follower`, `--duration=60`) sirve para verificar puertos, índices de cámara y nombres de features (`observation.images.overhead`) en una instalación nueva.
- Demostraciones docentes de políticas visomotoras pequeñas: con 51,7 M de parámetros se puede ejecutar en un portátil con GPU modesta o en CPU y explicar el ciclo observación-acción en clase o taller.
- Referencia negativa controlada para estudiar sobreajuste: un modelo entrenado 100.000 pasos sobre 15 episodios es un caso práctico para medir generalización frente a cambios de posición de objetos, iluminación o distracciones, tal y como sugiere la propia plantilla de evaluación del autor.
- Benchmark interno de latencia: al tener una entrada fija (3×480×640 + 6 valores) y salida fija (6 valores), es adecuado para medir el coste por inferencia de un transformer pequeño antes de pasar a políticas tipo VLA más grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye la sección de evaluación con la nota literal *"No evaluation results have been provided for this policy yet"*, por lo que no existen tasas de éxito en robot real, número de ensayos ni comparaciones con otras políticas. Tampoco se han publicado métricas de pérdida de entrenamiento ni curvas de validación.

## Requisitos de hardware

- VRAM estimada: los 51.668.614 parámetros ocupan unos 207 MB en fp32 y unos 103 MB en fp16; con activaciones de una imagen 3×480×640 y batch 1, el consumo total es inferior a 1 GB en fp32.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente (RTX 3060, RTX 4060, RTX 4090, A100, H100). La RTX 4090 o una A100 no aportan ventaja por memoria, solo por latencia y por permitir varios entornos en paralelo.
- Cabe holgadamente en GPU de consumo e incluso en CPU: para cumplir el presupuesto de 33 ms por paso (30 FPS) es preferible GPU, pero en CPU es viable a frecuencias de control menores.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) con `--policy.path=Screener2/act_FullGrid_20261007_sim` y `--policy.device=cuda`; entrenamiento con `lerobot-train --policy.type=act`. No aplican vLLM, TGI, llama.cpp ni Ollama, al no ser un modelo de lenguaje.
- Latencia y throughput: no documentados por el autor. Como referencia de diseño, el bucle de control del dataset es de 30 FPS, lo que fija un presupuesto de 33 ms por inferencia incluyendo la captura de cámara y el envío de comandos al robot.
- Almacenamiento: 0,2 GB de repositorio, sin necesidad de disco rápido ni de swapping de pesos.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| Screener2/act_FullGrid_20261007_sim (este) | 51.668.614 | Estado 6D + 1 cámara 480×640 | Apache 2.0 | HuggingFace, vía LeRobot |
| ACT original (paper arXiv:2304.13705) | No disponible en la información proporcionada | Estado + cámaras (configuración bimanual del paper) | No disponible en la información proporcionada | Paper y código de referencia |
| Diffusion Policy (política de difusión de LeRobot) | No disponible en la información proporcionada | Estado + imágenes | No disponible en la información proporcionada | Disponible como `--policy.type=diffusion` en LeRobot |
| Políticas VLA de la familia LeRobot (SmolVLA, pi0) | No disponible en la información proporcionada; son modelos de mayor tamaño que ACT y procesan instrucciones en lenguaje natural | Estado + imágenes + instrucción textual | No disponible en la información proporcionada | Disponibles en LeRobot y HuggingFace |

Este checkpoint se distingue de las alternativas por su tamaño reducido, su dependencia de una sola cámara y la ausencia total de interfaz en lenguaje natural: la tarea está fijada por la etiqueta `"0"`. Frente a las políticas de difusión, ACT es más ligero y con inferencia en un solo paso de red (sin bucle de denoising), a costa de menor expresividad en distribuciones multimodales. Frente a las VLA, carece de generalización a instrucciones nuevas. No se dispone de datos de rendimiento comparativos para este checkpoint.

## Limitaciones y advertencias

- Dataset de entrenamiento mínimo: 15 episodios y 5737 fotogramas (~191 s). Con 100.000 pasos y batch 8 se realizan cientos de épocas sobre los mismos datos, lo que hace muy probable el sobreajuste a las trayectorias demostradas.
- Sin evaluación publicada: no hay tasas de éxito en robot real ni en simulación; no se puede afirmar que la política funcione fuera de las condiciones exactas de grabación.
- Posible origen simulado: el nombre del dataset (`_sim`) apunta a datos de simulación. Si es así, la transferencia a un robot físico no está documentada (posible brecha sim-to-real en iluminación, texturas y dinámica).
- Dependencia fuerte del montaje: una única cámara cenital, robot `so_follower` y nombres de feature exactos (`observation.images.overhead`). Cambiar la cámara, su posición o el robot invalida la política.
- Tarea única y opaca: la etiqueta de tarea es `"0"`, sin descripción en lenguaje natural; no hay forma de solicitar una tarea distinta al modelo.
- Sin capacidades de lenguaje: no procesa instrucciones, no hace tool calling ni razonamiento; no debe presentarse como un modelo de propósito general.
- Riesgo de seguridad física: es una política de control motórico. En producción requiere límites de par, paradas de emergencia, espacio de trabajo acotado y supervisión; el modelo no incorpora ninguna garantía de seguridad.
- Sesgos: al derivar de teleoperación humana, hereda los sesgos cinemáticos del operador (velocidad, puntos de agarre, aproximaciones) y fallará ante objetos o posiciones no representados.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución y aviso de cambios; no hay restricciones adicionales declaradas, pero el usuario debe verificar la licencia del dataset asociado antes de reutilizarlo.
- Repositorio sin señales de comunidad: 0 descargas y 0 likes en el momento de la consulta, sin demo ni vídeo de ejecución; trátese como un artefacto experimental.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Screener2/act_FullGrid_20261007_sim
- Dataset de entrenamiento: https://huggingface.co/datasets/Screener2/FullGrid_20261007_sim
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Screener2/FullGrid_20261007_sim

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los enlaces anteriores proceden de la model card y del repositorio de HuggingFace.
