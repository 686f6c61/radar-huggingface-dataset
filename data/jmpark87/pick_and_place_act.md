# jmpark87/pick_and_place_act

## Resumen

`jmpark87/pick_and_place_act` es una política de robótica entrenada con ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice fragmentos de acción (*action chunks*) en lugar de pasos individuales. No es un modelo de lenguaje: es un checkpoint de control motor que consume el estado articular y dos cámaras (muñeca y cenital) y emite un vector de acción de 6 dimensiones para un robot `omx_follower`. Lo publica el usuario `jmpark87` mediante LeRobot, la librería de Hugging Face para aprendizaje automático en robótica real.

El modelo resuelve una tarea única y concreta: `pick_and_place` (coger y colocar). Se ha entrenado con un dataset propio de solo 10 episodios y 5740 fotogramas a 30 FPS, capturados por teleoperación, con 10 000 pasos de entrenamiento, batch size 1, optimizador AdamW y tasa de aprendizaje 1e-5. El checkpoint tiene 51 668 614 parámetros y ocupa 0,2 GB en el repositorio.

Su relevancia es la de un artefacto reproducible de investigación: sirve como referencia mínima de ACT en LeRobot, como baseline para comparar con otras políticas (Diffusion Policy, VQ-BeT) sobre el mismo dataset y como ejemplo de despliegue con `lerobot-rollout`. Conviene subrayar que no hay resultados de evaluación publicados, la licencia no está declarada y el entrenamiento se hizo con un volumen de datos muy reducido, por lo que su valor es experimental y no de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con CVAE para aprendizaje por imitación |
| Parámetros totales | 51 668 614 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; no es un modelo de lenguaje. Entrada por paso: estado de 6 dimensiones + 2 imágenes de 3×480×640. Horizonte de acción (*chunk size*): no disponible |
| Tipos de cuantización | no disponible (el repositorio solo publica safetensors; no se han subido variantes GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | no disponible; no aplica (política de control robótico, sin entrada ni salida de texto) |
| Licencia | no disponible (la model card indica «[More Information Needed]») |
| Formato de pesos | safetensors |
| Librería | lerobot |
| Pipeline | robotics |
| Tipo de robot | `omx_follower` |
| Cámaras | `wrist`, `top` |
| Entradas | `observation.state` (6,), `observation.images.wrist` (3, 480, 640), `observation.images.top` (3, 480, 640) |
| Salidas | `action` (6,) |
| Tarea entrenada | `pick_and_place` |
| Versión de LeRobot | 0.6.2 |
| Tamaño del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT combina un codificador de observaciones (imágenes procesadas por una red convolucional tipo ResNet y el estado articular proyectado) con un transformer que, condicionado por una variable latente de un autoencoder variacional condicional (CVAE), decodifica una secuencia de acciones de una sola pasada. La predicción por *chunks* suaviza la política y reduce el error de composición que aparece al encadenar acciones individuales, un problema clásico del aprendizaje por imitación. En esta instancia concreta, el modelo atiende a dos vistas (muñeca y cenital) y a un estado de 6 grados de libertad, y produce acciones de 6 dimensiones; el tamaño del *chunk*, la dimensión latente y los detalles del codificador visual no se especifican en la model card y quedan como no disponibles.

El entrenamiento se hizo con el dataset `jmpark87/pick_and_place_20261027_173832`: 10 episodios, 5740 fotogramas a 30 FPS, una única tarea (`pick_and_place`), capturados por teleoperación. La configuración declarada es de 10 000 pasos, batch size 1, AdamW, learning rate 1e-5 y semilla 1000. No se documenta composición del dataset más allá del número de episodios, ni se menciona RLHF, DPO ni ninguna fase de ajuste posterior al aprendizaje por imitación (no aplicables en este dominio). Tampoco se indican técnicas de aumento de datos, *random crop*, ni regularización, que son habituales en las recetas de ACT.

## Capacidades

- Control visomotor de un brazo robótico `omx_follower` para la tarea `pick_and_place`, con salida de acción continua de 6 dimensiones a partir de dos cámaras y del estado articular.
- Predicción de secuencias de acción (*action chunking*), que aporta suavidad y consistencia temporal frente a políticas paso a paso.
- Aprendizaje por imitación a partir de datos de teleoperación: no requiere un simulador ni un modelo del entorno.
- Fusión de dos vistas (muñeca y cenital) con el estado propioceptivo en una única política.
- Despliegue directo con la CLI de LeRobot (`lerobot-rollout`) sobre hardware real.
- Reentrenamiento sencillo con `lerobot-train --policy.type=act` sobre el mismo esquema de observaciones.
- No soporta *tool calling*, agentes, razonamiento multi-paso, ni generación de texto, código o matemáticas: no es un modelo de propósito general.

## Casos de uso

- **Automatización de recogida y colocación en laboratorio**: la política mueve el brazo `omx_follower` para coger un objeto y depositarlo en otra posición, usando la cámara cenital para localizar la pieza y la de muñeca para el ajuste fino. Es su tarea nativa y el escenario para el que se entrenó.
- **Baseline de referencia en experimentos de aprendizaje por imitación**: al estar entrenada con una receta estándar y una semilla declarada (1000), sirve para comparar contra Diffusion Policy o VQ-BeT sobre el mismo dataset y aislar el efecto del algoritmo.
- **Reproducción de experimentos docentes**: el par dataset + política permite reproducir de principio a fin un flujo de LeRobot (grabar con teleoperación, entrenar, desplegar) con un coste de cómputo bajo, útil en cursos y talleres de robótica.
- **Prototipado rápido de nuevas tareas**: reentrenando con `lerobot-train` sobre un dataset propio con el mismo esquema de entradas (estado 6D + dos imágenes 480×640), se obtiene una política nueva en horas, no semanas.
- **Validación de la cadena de despliegue**: sirve para verificar calibración de cámaras, puertos, frecuencias a 30 FPS y el pipeline `lerobot-rollout` antes de invertir en datos reales, ya que la configuración de inferencia está documentada en la model card.
- **Estudio de robustez frente a cambios de dominio**: con una política entrenada sobre solo 10 episodios, es un caso útil para medir cómo degrada la tasa de éxito ante cambios de iluminación, posición inicial del objeto o robot distinto del mismo modelo, un análisis que la model card sugiere explícitamente y que no se ha realizado.
- **Generación de datos comparativos para investigación**: puede emplearse como política de partida para recoger trayectorias y comparar la distribución de acciones frente a otras políticas entrenadas con los mismos datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La sección de evaluación de la model card está vacía y contiene literalmente la nota «No evaluation results have been provided for this policy yet». No existen tasas de éxito, número de ensayos ni métricas de error de seguimiento para esta política.

| Tarea | Ensayos | Éxitos | Tasa de éxito |
|---|---|---|---|
| `pick_and_place` | no disponible | no disponible | no disponible |

El artículo de referencia (arXiv:2304.13705) reporta resultados de ACT en tareas de tipo ALOHA, pero no se dispone en la información proporcionada de las cifras concretas ni de su aplicabilidad a este checkpoint.

## Requisitos de hardware

- **Memoria para pesos**: 51,7 M de parámetros equivalen a unos 207 MB en fp32 y unos 103 MB en fp16 (cálculo a partir del recuento de parámetros). El repositorio de 0,2 GB incluye, con toda probabilidad, estado del optimizador y otros artefactos de entrenamiento, no solo los pesos de inferencia.
- **VRAM estimada para inferencia**: del orden de 1 a 3 GB en fp32 una vez añadidas las activaciones de dos imágenes de 480×640 procesadas por el codificador visual. Estimación basada en el tamaño del modelo; no verificada por el autor.
- **GPU recomendadas**: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090); también A100 o H100 si se integra en un servidor, aunque están sobredimensionadas para 51,7 M de parámetros. La inferencia en CPU es viable en términos de memoria, pero puede no sostener los 30 FPS de la política.
- **Cabe en GPU consumer**: sí, con margen amplio, en cualquier tarjeta con 4 GB o más de VRAM.
- **Opciones de despliegue**: LeRobot es la vía oficial, con `lerobot-rollout` para ejecución en robot y `lerobot-train` para reentrenamiento. El formato safetensors es cargable directamente con PyTorch. No se documentan exportaciones a vLLM, llama.cpp, Ollama, TGI ni ONNX Runtime, que además no aplican a un transformer de política con salida continua.
- **Latencia y throughput**: no disponible. El dataset está grabado a 30 FPS y la configuración de cámara de ejemplo pide 30 FPS, lo que marca el presupuesto temporal por paso, pero no se publica latencia medida.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Entrada / contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jmpark87/pick_and_place_act` (este) | ACT, imitación | 51 668 614 | estado 6D + 2 imágenes 480×640 | no disponible | Hugging Face, 0 descargas |
| Diffusion Policy (implementación en LeRobot) | difusión para políticas visomotoras | no disponible | observaciones visuales y propioceptivas | según checkpoint / LeRobot Apache 2.0 | implementado en LeRobot |
| VQ-BeT (implementación en LeRobot) | transformer con cuantización vectorial de comportamiento | no disponible | observaciones visuales y propioceptivas | según checkpoint / LeRobot Apache 2.0 | implementado en LeRobot |
| SmolVLA (familia VLA de LeRobot) | visión-lenguaje-acción | no disponible | imágenes + instrucción en lenguaje natural | según checkpoint | disponible en el ecosistema LeRobot |

Los recuentos de parámetros y las condiciones de licencia de las alternativas no figuran en la información proporcionada y se marcan como no disponibles. La comparación relevante en igualdad de condiciones es metodológica: ACT es más ligero y rápido de entrenar que Diffusion Policy, mientras que esta última suele mostrar mayor robustez multimodal a costa de más pasos de inferencia; VQ-BeT ocupa un punto intermedio con acciones discretizadas.

## Limitaciones y advertencias

- **Licencia no declarada**: la model card indica «[More Information Needed]». Sin licencia explícita no hay autorización clara para uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- **Dataset mínimo**: 10 episodios y 5740 fotogramas es un volumen muy reducido, con riesgo alto de sobreajuste a posiciones, iluminación y objetos concretos vistos durante la teleoperación.
- **Un solo embodiment**: la política está entrenada para el robot `omx_follower` y para las cámaras `wrist` y `top` con nombres, resolución y encuadre concretos. Cambiar el robot, la cámara o el montaje invalida la política.
- **Sin evaluación publicada**: no hay tasa de éxito medida, ni número de ensayos, ni análisis de fallos. No se puede afirmar que la política funcione de forma fiable.
- **Ausencia de capacidades lingüísticas**: no procesa texto ni instrucciones; la tarea está fijada en el entrenamiento y se pasa como cadena en la CLI (`--task="pick_and_place"`), sin que exista comprensión del lenguaje.
- **Riesgo de alucinación**: no aplica en el sentido de generación de texto, pero sí existe el equivalente en control: la política puede producir acciones plausibles pero incorrectas ante observaciones fuera de distribución, sin ninguna señal de incertidumbre.
- **Sin cuantizaciones ni formatos alternativos**: solo safetensors; no hay versión optimizada para despliegue embebido ni para CPU de bajas prestaciones.
- **Sesgos**: no documentados. Al provenir de teleoperación humana, hereda los sesgos de trayectoria y de estrategia del operador que grabó los datos, así como posibles desequilibrios de posición inicial.
- **Trazabilidad temporal**: las fechas del repositorio (creación y actualización del 27 de octubre de 2026, y nombre del dataset con la misma fecha) conviene verificarlas antes de citarlo.
- **Autor único sin historial**: 0 descargas y 0 likes; no hay evidencia de uso independiente ni de replicación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jmpark87/pick_and_place_act
- Dataset de entrenamiento: https://huggingface.co/datasets/jmpark87/pick_and_place_20261027_173832
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=jmpark87/pick_and_place_20261027_173832
- Artículo de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
