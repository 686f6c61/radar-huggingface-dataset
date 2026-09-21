# radheradhe159/berkeley-cable-smolvla

## Resumen

radheradhe159/berkeley-cable-smolvla es un ajuste fino (fine-tune) del modelo base lerobot/smolvla_base, un modelo de visión-lenguaje-acción (VLA) compacto entrenado para control robótico mediante aprendizaje por imitación. En concreto, esta política está especializada en una única tarea de manipulación: «route cable» (guiar un cable) sobre el robot identificado como berkeley_cable_routing_source, con cuatro cámaras de entrada y un vector de estado de 7 dimensiones.

El modelo tiene 450.046.176 parámetros (aproximadamente 450 millones), un tamaño que lo sitúa en la categoría de VLA ligero diseñado para desplegarse en hardware de consumo, según la descripción del método SmolVLA (arXiv:2506.01844) referenciada en la model card. No es un modelo de lenguaje conversacional: su salida es un vector de acción de 6 dimensiones, por lo que su utilidad es exclusivamente robótica.

El interés de esta ficha es doble. Por un lado, documenta el procedimiento de ajuste de SmolVLA con LeRobot 0.6.1 sobre un conjunto de datos muy pequeño (10 episodios, 278 fotogramas a 5 FPS) y con un entrenamiento de solo 2000 pasos y batch size 1, lo que sirve como referencia de cómo de lejos se puede llevar un VLA con recursos mínimos. Por otro, conviene señalar que el repositorio no incluye ninguna evaluación en robot real, por lo que su calidad de ejecución no está verificada públicamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de visión-lenguaje-acción (VLA) basado en el método SmolVLA (arXiv:2506.01844); detalles internos de capas y dimensiones ocultas no disponibles en la información proporcionada |
| Parámetros totales | 450.046.176 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repositorio solo publica pesos en safetensors; no se documentan variantes GGUF, AWQ, GPTQ ni cuantizaciones INT8/INT4) |
| Idiomas soportados | No disponible (modelo robótico; recibe una instrucción de tarea en texto, en este caso la cadena «route cable») |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repo de 0,9 GB) |

Datos adicionales de entrada/salida:

| Elemento | Detalle |
|---|---|
| Tipo de robot | berkeley_cable_routing_source |
| Entrada observation.state | STATE, shape (7,) |
| Entrada observation.images.image | VISUAL, shape (3, 128, 128) |
| Entrada observation.images.top_image | VISUAL, shape (3, 128, 128) |
| Entrada observation.images.wrist225_image | VISUAL, shape (3, 128, 128) |
| Entrada observation.images.wrist45_image | VISUAL, shape (3, 128, 128) |
| Salida action | ACTION, shape (6,) |
| Librería | lerobot (versión de entrenamiento 0.6.1) |
| Modelo base | lerobot/smolvla_base |

## Arquitectura y entrenamiento

La model card identifica este repositorio como una política derivada de SmolVLA, un modelo VLA compacto cuyo objetivo declarado es alcanzar un rendimiento competitivo con un coste computacional reducido y poder desplegarse en hardware de consumo. La información proporcionada no detalla el número de capas, la dimensión oculta, el mecanismo de atención ni el diseño exacto de la cabeza de acción, por lo que esos datos se marcan como no disponibles. Lo que sí se especifica es la interfaz completa del modelo: consume estado propioceptivo de 7 dimensiones y cuatro imágenes RGB de 128×128 píxeles, y produce un vector de acción de 6 dimensiones, típico de un brazo robótico de 6 grados de libertad.

El entrenamiento se realizó con LeRobot 0.6.1 mediante ajuste fino desde lerobot/smolvla_base sobre el dataset radheradhe159/berkeley-cable-10, compuesto por 10 episodios y 278 fotogramas capturados a 5 FPS, con la única tarea «route cable». La configuración reportada es de 2000 pasos de entrenamiento, batch size 1, optimizador AdamW, tasa de aprendizaje 0.0001 y semilla 1000. No se indica en la model card si hubo fases de RLHF, DPO, reward modeling ni ningún otro ajuste posterior al aprendizaje por imitación; tampoco se documentan innovaciones técnicas específicas introducidas en este fine-tune más allá de las propias del método SmolVLA.

## Capacidades

- Generación de acciones robóticas de 6 grados de libertad a partir de observaciones visuales y de estado, en el marco de una política de imitación.
- Percepción visual multivista: procesa de forma simultánea cuatro cámaras (image, top_image, wrist225_image, wrist45_image) a resolución de 128×128.
- Fusión de estado propioceptivo (7 dimensiones) con información visual para producir la acción.
- Ejecución de una tarea concreta de manipulación: «route cable» sobre el robot berkeley_cable_routing_source.
- Integración con el ecosistema LeRobot: entrenamiento, rollout e inferencia mediante las herramientas oficiales lerobot-train y lerobot-rollout.
- Capacidad de ejecución en bucle durante un tiempo configurable (parámetro --duration en el rollout).
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso en lenguaje, modo thinking, audio, ni competencias multilingües; estas no aplican al pipeline declarado (robotics).

## Casos de uso

- Automatización de cableado en entornos de laboratorio: la política puede ejecutar de forma autónoma la tarea de rutado de cable sobre el robot berkeley_cable_routing_source, sustituyendo la teleoperación manual durante sesiones repetitivas de recogida de datos o pruebas de banco.
- Punto de partida para nuevos ajustes finos: al estar construido sobre lerobot/smolvla_base y ser compatible con el flujo de LeRobot, sirve como inicialización para reentrenar con un dataset propio mediante lerobot-train, reduciendo el tiempo hasta una política funcional.
- Evaluación de pipelines de aprendizaje por imitación con datos escasos: con solo 10 episodios y 278 fotogramas, este repositorio es un caso de estudio útil para medir hasta dónde llega un VLA de 450 M de parámetros con un dataset mínimo.
- Investigación en manipulación de deformables: el rutado de cables es una tarea clásica de objetos deformables, y esta política permite reproducir experimentos de control sobre ese dominio sin partir de cero.
- Despliegue en laboratorios con hardware de consumo: al tratarse de un modelo de 450 M de parámetros y 0,9 GB de pesos, puede ejecutarse en una estación de trabajo con una GPU de gama media, lo que facilita pruebas rápidas en entornos con presupuesto limitado.
- Generación de datos sintéticos o de demostraciones para aumentar el dataset berkeley-cable-10: la política puede utilizarse para rodar trayectorias adicionales que después se filtren y se incorporen al conjunto de entrenamiento.
- Pruebas de integración de LeRobot en un robot físico: el comando de rollout documentado permite verificar de extremo a extremo la cadena cámara–política–actuadores antes de invertir en entrenamientos más largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye explícitamente la línea «_No evaluation results have been provided for this policy yet._», es decir, no hay tabla de ensayos, éxitos ni tasa de éxito en robot real. Tampoco se proporcionan métricas de pérdida de validación, error de acción ni comparaciones con otras políticas sobre el mismo dataset.

| Benchmark | Resultado |
|---|---|
| Evaluación en robot real (tasa de éxito) | No disponible |
| MMLU, HumanEval, GSM8K u otros benchmarks de lenguaje | No aplica (modelo de robótica) |
| Métricas de error de acción o pérdida de validación | No disponible |

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del recuento real de parámetros (450.046.176) y del tamaño del repositorio (0,9 GB); no proceden de una medición publicada por el autor.

- Peso de los parámetros en memoria: aproximadamente 1,8 GB en FP32, 0,9 GB en BF16/FP16 y 0,45 GB en INT8. A ello hay que sumar activaciones, buffers de las cuatro cámaras de 128×128 y el estado de inferencia.
- VRAM estimada para inferencia: del orden de 2 a 4 GB en BF16/FP16, dependiendo de la implementación y del tamaño de lote. No se dispone de una cifra oficial medida.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM resulta suficiente en la práctica; una RTX 3060 de 12 GB, una RTX 4070 o una RTX 4090 ofrecen margen de sobra. No se requiere A100 ni H100 para inferencia, dado el tamaño del modelo.
- Compatibilidad con GPU de consumo: sí, es uno de los supuestos del método SmolVLA según la descripción del propio repositorio («can be deployed on consumer-grade hardware»). No se detalla el comportamiento en CPU ni en Apple Silicon para este fine-tune concreto.
- Opciones de despliegue: LeRobot, mediante lerobot-rollout con --strategy.type=base y --policy.path=radheradhe159/berkeley-cable-smolvla. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que son servidores orientados a modelos de lenguaje y no aplican a una política VLA con salida de acciones.
- Latencia y throughput: no disponibles. El dataset de entrenamiento se capturó a 5 FPS, pero no se publica la frecuencia de inferencia alcanzable ni el tiempo por paso de control.

## Comparativa con modelos similares

La información proporcionada no incluye comparaciones con otras políticas. A continuación se ofrece una comparación cualitativa con alternativas conocidas de la misma categoría (modelos VLA para control robótico); los valores marcados como no disponibles no aparecen en la documentación consultada.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| berkeley-cable-smolvla (este modelo) | 450.046.176 | No disponible | Apache 2.0 | HuggingFace, vía LeRobot |
| lerobot/smolvla_base (modelo base) | Familia SmolVLA, ~450 M en la variante base | No disponible | Apache 2.0 | HuggingFace, vía LeRobot |
| OpenVLA | Del orden de 7 000 M (no confirmado en la información disponible) | No disponible | No disponible | Público |
| Políticas tipo ACT / Diffusion Policy en LeRobot | Depende de la configuración | No aplica | Apache 2.0 en los repositorios de LeRobot | HuggingFace, vía LeRobot |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este fine-tune con el de las alternativas citadas. La comparación relevante aquí es de coste: un VLA de 450 M de parámetros es aproximadamente un orden de magnitud más pequeño que los VLA de miles de millones de parámetros, lo que se traduce en requisitos de hardware mucho menores a costa de una capacidad de generalización presumiblemente inferior, extremo que no puede confirmarse sin evaluaciones publicadas.

## Limitaciones y advertencias

- Ausencia total de evaluación: la model card indica explícitamente que no se han proporcionado resultados de evaluación. No hay evidencia publicada de que la política funcione de forma fiable en el robot real.
- Dataset extremadamente reducido: 10 episodios y 278 fotogramas a 5 FPS es un volumen muy bajo para aprendizaje por imitación, lo que favorece el sobreajuste y una generalización pobre ante cambios de posición de objetos, iluminación o fondo.
- Tarea única: la política está entrenada exclusivamente para «route cable». No debe esperarse que ejecute otras tareas ni que responda a instrucciones distintas de la cadena para la que fue ajustada.
- Dependencia estricta del hardware: la política espera exactamente cuatro cámaras con los nombres image, top_image, wrist225_image y wrist45_image, un estado de 7 dimensiones y un robot de tipo berkeley_cable_routing_source. Cualquier desviación en la configuración de sensores o en el montaje invalida las predicciones.
- Sin datos sobre sesgos ni comportamiento fuera de distribución: no se documenta ningún análisis de robustez, de sesgos visuales ni de comportamiento ante entradas anómalas.
- Riesgo de alucinación en el sentido robótico: al ser una política de imitación sin verificación, puede producir acciones plausibles pero incorrectas, con riesgo de colisión o daño al cable o al efector final si se ejecuta sin supervisión.
- Idiomas: no se documenta ningún soporte multilingüe; la instrucción de tarea utilizada en los ejemplos es la cadena literal «route cable».
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserven los avisos de copyright y se cumplan las condiciones de la licencia. Conviene verificar las condiciones del modelo base lerobot/smolvla_base y del dataset asociado antes de un despliegue comercial.
- Repositorio sin tracción: cero descargas y cero «likes» en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- Imprecisión en el nombre: los resultados de la búsqueda web realizada no contienen información técnica sobre este modelo (devuelven páginas sobre el grupo musical ABBA), por lo que toda la ficha se basa en los datos de HuggingFace y en la model card del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/radheradhe159/berkeley-cable-smolvla
- Dataset de entrenamiento: https://huggingface.co/datasets/radheradhe159/berkeley-cable-10
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=radheradhe159/berkeley-cable-10
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper del método SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI de LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
