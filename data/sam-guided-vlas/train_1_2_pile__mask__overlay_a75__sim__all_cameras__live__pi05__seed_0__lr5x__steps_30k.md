# sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0__lr5x__steps_30k

## Resumen

Este repositorio contiene una política robótica completa (no un modelo de lenguaje generalista) entrenada con LeRobot: se trata de un fine-tuning de π₀.₅ (Pi05), el modelo Vision-Language-Action desarrollado por Physical Intelligence, sobre el checkpoint base `lerobot/pi05_base`. El autor del fine-tuning es la organización `sam-guided-vlas` y el resultado es un policy especializado en manipulación de objetos apilados sobre una mesa, con 4.143.404.816 parámetros (≈4,14 mil millones) almacenados en safetensors, con un tamaño de repositorio de 9,4 GB y licencia Apache 2.0.

El modelo resuelve un problema concreto: controlar un robot Panda a partir de observaciones visuales y de estado articular, produciendo comandos de acción de 7 dimensiones. Consume tres cámaras (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`) a 224×224 píxeles más un vector de estado de 9 dimensiones, y genera acciones de forma continua. Fue ajustado mediante aprendizaje por imitación sobre un dataset de 200 episodios y 69.392 fotogramas grabados a 20 FPS, con 20 etiquetas de tarea distintas (tipos de objeto: `basket`, `can`, `hamburger`, `kettle`, `soap dispenser`, etc.).

La relevancia de esta ficha es acotada pero clara: se trata de un artefacto de investigación reproducible dentro del ecosistema LeRobot, útil como punto de partida para experimentos de imitación en robótica, no como modelo de propósito general. No tiene descargas ni valoraciones en el momento de la consulta, no incluye resultados de evaluación y los resultados de la búsqueda web realizada no aportan información técnica: corresponden a una serie de televisión francesa y a un fabricante de herramientas, sin relación alguna con el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA); implementación LeRobot de π₀.₅ (Pi05), fine-tuning de `lerobot/pi05_base` |
| Parametros totales | 4.143.404.816 (≈4,14 mil millones) |
| Parametros activos | No aplica; no se documenta una arquitectura de mezcla de expertos (MoE) en la información disponible |
| Longitud de contexto | No disponible (modelo de control; no se documenta ventana de contexto textual) |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors, sin GGUF, int8 ni int4 |
| Idiomas soportados | No disponible; las instrucciones de tarea del dataset están etiquetadas en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 9,4 GB; biblioteca `lerobot`) |
| Tipo de robot | Panda |
| Camaras de entrada | `agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2` |
| Entradas | `observation.state` (STATE, shape `(9,)`); tres imágenes VISUAL (shape `(3, 224, 224)`) |
| Salidas | `action` (ACTION, shape `(7,)`) |
| Modelo base | `lerobot/pi05_base` |
| Version de LeRobot | 0.6.0 |
| Dataset de entrenamiento | `sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live` |

## Arquitectura y entrenamiento

Según la model card, π₀.₅ es un modelo Vision-Language-Action de Physical Intelligence diseñado para generalización en entornos abiertos: evoluciona π₀ para generalizar a entornos y situaciones no vistos durante el entrenamiento. La implementación publicada aquí procede de LeRobot y está adaptada del repositorio OpenPI del autor original. Los detalles internos del backbone (encoder visual, modelo de lenguaje subyacente, número de capas, mecanismo exacto de generación de acciones, uso de flow matching u otro esquema) no se detallan en la información proporcionada, por lo que no se afirman aquí.

El entrenamiento es un fine-tuning por imitación (aprendizaje supervisado de pares observación-acción) ejecutado con LeRobot 0.6.0: 30.000 pasos, batch de 16, optimizador AdamW, tasa de aprendizaje 0,00025 y semilla 0. El nombre del repositorio indica "lr5x", lo que sugiere que esa tasa corresponde a 5 veces el valor de referencia del recetario de entrenamiento, si bien esta interpretación no está confirmada en la model card. El dataset contiene 200 episodios y 69.392 fotogramas a 20 FPS, con 20 etiquetas de tarea que nombran objetos domésticos y de cocina. Los componentes del nombre del repositorio (`mask`, `overlay_a75`, `sim`, `all_cameras`, `live`) apuntan a una variante de dataset con enmascarado y superposición guiados por SAM y datos de simulación, pero la model card no describe ese pipeline, por lo que se trata de una inferencia a partir de la nomenclatura y no de un dato documentado. No se documenta RLHF, DPO ni ninguna fase de alineación por preferencias.

## Capacidades

- Generación de acciones de control robótico continuo de 7 dimensiones a partir de observación multimodal (tres cámaras RGB y estado articular de 9 dimensiones).
- Manipulación de objetos apilados o agrupados sobre una superficie, con 20 tareas etiquetadas en el dataset: `basket`, `boxed food`, `cake`, `can`, `hamburger`, `lemon`, `orange`, `spice`, `squash`, `spray`, `soap dispenser`, `jam`, `jar`, `cereal`, `knife block`, `kettle`, `pear`, `potato`, `sweet potato`, `scone`.
- Condicionamiento por instrucción de tarea en lenguaje natural: el comando de rollout incluye un campo `--task` con la etiqueta textual de la tarea.
- Percepción con múltiples cámaras simultáneas, incluida una vista de muñeca (`eye_in_hand`) y una segunda vista de muñeca (`eye_in_hand_2`), lo que permite razonar sobre la relación entre efector final y objeto.
- Ejecución en bucle cerrado sobre hardware real: inferencia en línea durante el movimiento del robot.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión general de imágenes fuera del contexto de control, audio, ni modo de razonamiento explícito (thinking mode).
- No se documentan capacidades multilingües; el condicionamiento textual observado está en inglés.

## Casos de uso

- Recogida de objetos apilados en entornos de laboratorio: la política está entrenada específicamente sobre pilas de objetos domésticos, por lo que se puede desplegar directamente para tareas de *pick-and-place* sobre una mesa con un Panda y tres cámaras configuradas igual que en el dataset.
- Automatización de cocina y manipulación de menaje: las etiquetas del dataset incluyen cuchillos, hervidores, jarras, dispensadores de jabón y alimentos, lo que la hace adecuada para prototipos de asistencia en cocina donde el robot debe distinguir y agarrar recipientes heterogéneos.
- Repositorio de referencia para reproducir experimentos de imitación con LeRobot: el repositorio incluye los hiperparámetros exactos (30.000 pasos, batch 16, AdamW, lr 0,00025, semilla 0) y el comando de entrenamiento, lo que permite replicar el ajuste y medir variabilidad entre semillas en investigación académica.
- Base para fine-tuning adicional sobre un robot propio: al derivar de `lerobot/pi05_base` y mantener la interfaz de entradas/salidas descrita, se puede reentrenar con nuevos datasets LeRobot para dominios distintos sin cambiar la arquitectura.
- Evaluación de generalización con cambio de cámara o de iluminación: la vista `agentview` más dos vistas de muñeca permite estudiar la degradación de la política cuando se altera la posición de las cámaras o se introducen distractores, siguiendo la metodología sugerida en la plantilla de evaluación de la model card.
- Investigación sobre enmascarado visual guiado por segmentación: dada la nomenclatura del dataset (`mask`, `overlay_a75`), el repositorio sirve como artefacto para comparar políticas entrenadas con y sin superposición de máscaras, siempre que se disponga del dataset completo.
- Generación de datos sintéticos y simulación: el sufijo `sim` del dataset sugiere mezcla con datos simulados; el modelo puede usarse para estudiar transferencia sim-a-real en un banco de pruebas controlado.
- Demostración de despliegue en hardware de gama de consumo: con ≈4,14 mil millones de parámetros, el modelo cabe en GPUs de 24 GB, lo que permite montar una estación de investigación en robótica sin clúster dedicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política ("No evaluation results have been provided for this policy yet") e incluye la plantilla de tabla de éxito por tarea sin rellenar. No se dispone de tasas de éxito, ni de comparaciones con otras políticas, ni de métricas de MMLU, HumanEval, GSM8K u otras, ya que no son aplicables a un modelo de control robótico.

## Requisitos de hardware

- VRAM estimada para inferencia, según el recuento real de 4.143.404.816 parámetros: ≈16,6 GB en fp32, ≈8,3 GB en bf16/fp16, ≈4,1 GB en int8 y ≈2,1 GB en int4. Hay que sumar la memoria de activaciones del codificador visual (tres imágenes de 224×224) y de los búferes de inferencia; el repositorio publicado ocupa 9,4 GB, coherente con pesos en bf16 o fp32 con ficheros auxiliares.
- GPU recomendadas para uso sin cuantizar: cualquier GPU con 16-24 GB de memoria, como RTX 4090, RTX 3090, A5000, L4 (24 GB) o superiores; A100 y H100 aportan margen sobrado y mejor latencia.
- Cabe en GPU de consumo: sí, en RTX 4090 o RTX 3090 (24 GB) en bf16; en tarjetas de 16 GB (RTX 4080, RTX 4070 Ti Super) queda ajustado y conviene reducir el batch de inferencia; en tarjetas de 8-12 GB sería necesario cuantizar, y no se publican pesos cuantizados.
- Nota importante: al ser una política de control en bucle cerrado, la latencia importa más que el throughput de tokens. No se documentan cifras de latencia ni de frecuencia de inferencia alcanzable.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` para ejecución sobre robot, y `lerobot-train` para reentrenamiento, ambos dentro del ecosistema LeRobot en PyTorch. No se publican pesos GGUF ni recetas para vLLM, llama.cpp, Ollama o TGI, que además están orientados a modelos de lenguaje y no a políticas de acción continua.
- Requisitos adicionales de hardware: robot Panda, puerto de comunicación serie y tres cámaras configuradas con los nombres de observación del entrenamiento; si los nombres no coinciden, la política no puede consumir las observaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (`...pi05__seed_0__lr5x__steps_30k`) | 4.143.404.816 | No disponible | Apache 2.0 | HuggingFace, 0 descargas, 0 likes | Fine-tuning especializado en una pila de objetos; sin evaluación publicada |
| `lerobot/pi05_base` | No disponible en la información proporcionada | No disponible | No disponible en la información proporcionada | HuggingFace | Checkpoint base de π₀.₅ del que deriva este modelo; sin fine-tuning de tarea |
| `lerobot/pi0` | No disponible en la información proporcionada | No disponible | No disponible en la información proporcionada | HuggingFace | Generación anterior de la familia π₀ dentro del mismo ecosistema LeRobot y OpenPI |
| `lerobot/SmolVLA` | No disponible en la información proporcionada | No disponible | No disponible en la información proporcionada | HuggingFace | Alternativa de menor tamaño orientada a VLA en LeRobot, adecuada cuando la VRAM es limitada |

No se dispone de datos de rendimiento comparativo entre estas opciones dentro de la información proporcionada; la comparación se limita a la relación de parentesco en el ecosistema LeRobot/OpenPI y al recuento de parámetros verificado únicamente para el modelo de esta ficha.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasas de éxito ni número de ensayos, por lo que se desconoce la fiabilidad real de la política, incluso en las tareas para las que fue entrenada.
- Sesgo de dominio muy marcado: el entrenamiento se limita a 200 episodios y 69.392 fotogramas, con 20 etiquetas de objeto concretas. Es previsible un mal rendimiento ante objetos, texturas, iluminaciones o disposiciones no presentes en el dataset.
- Dependencia estricta de la configuración de sensores: la política espera exactamente tres cámaras con los nombres `agentview`, `robot0_eye_in_hand` y `robot0_eye_in_hand_2` a 224×224, y un vector de estado de 9 dimensiones. Cualquier cambio de montaje o de nombre de clave rompe la inferencia.
- Riesgo de alucinación trasladado al dominio físico: en un VLA, los errores de percepción se traducen en acciones erróneas sobre hardware real, con riesgo de colisión o daño a objetos y al robot. Se requiere supervisión y parada de emergencia.
- Idiomas no documentados; el condicionamiento por tarea observado está en inglés y limitado a etiquetas cortas, sin evidencia de comprensión de instrucciones libres.
- Licencia Apache 2.0: permite uso comercial y modificación con obligación de conservar avisos de copyright y licencia, pero la licencia del modelo base `lerobot/pi05_base` y de los pesos de π₀.₅ debe verificarse por separado antes de un despliegue comercial; la model card solo declara apache-2.0 para este fine-tuning.
- Sin cuantizaciones publicadas: no hay GGUF, int8 ni int4, lo que limita el despliegue en GPUs pequeñas o en CPU.
- Metadatos incompletos: se desconoce la longitud de contexto y el soporte de idiomas, y la model card no describe la composición exacta del dataset ni el pipeline de enmascarado sugerido por la nomenclatura.
- Fechas de creación y actualización del repositorio (2026-09-11) posteriores a la fecha habitual de consulta; conviene verificar su vigencia.
- Descargas y valoraciones a cero: no hay evidencia de uso por terceros ni de validación independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0__lr5x__steps_30k
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de π₀.₅ en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI (implementación original): https://github.com/Physical-Intelligence/openpi
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador de datasets de LeRobot: https://huggingface.co/spaces/lerobot/visualize_dataset?path=sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live
- Nota sobre la búsqueda web: los resultados obtenidos no guardan relación con el modelo (una serie de televisión francesa y un fabricante de herramientas), por lo que no se incluyen como fuentes técnicas.
