# leapshared/SciEdu_291epi_trim_pi05

## Resumen

SciEdu_291epi_trim_pi05 es una política robótica de tipo Vision-Language-Action (VLA) publicada por el usuario leapshared en HuggingFace. Se trata de un ajuste fino (fine-tuning) de lerobot/pi05_base, que es la implementación en LeRobot de π0.5 (pi05) de Physical Intelligence, un modelo VLA concebido para generalizar a entornos y situaciones no vistos durante el entrenamiento. El resultado es un modelo especializado en la ejecución autónoma de tres experimentos científicos de laboratorio educativo: clasificación de hojas, reacción redox y electroscopio.

El modelo tiene 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) y consume observaciones multimodales: un vector de estado de 16 dimensiones y tres cámaras RGB a 480x640 píxeles (una frontal y dos en las muñecas). Produce como salida un vector de acción de 16 dimensiones que controla un robot bimanual del tipo bi_openarm_follower. Se entrenó sobre el dataset leapshared/SciEdu_291epi, compuesto por 291 episodios y 597.322 fotogramas grabados a 30 FPS, con instrucciones de tarea en inglés.

Su relevancia radica en que ejemplifica el flujo actual de trabajo en robótica con modelos fundacionales: partir de un VLA preentrenado de propósito general y adaptarlo con imitation learning a un dominio concreto de manipulación. Es, por tanto, un caso útil tanto para investigadores que quieran reproducir el pipeline de LeRobot como para equipos que evalúen el coste real de especializar un VLA en tareas de laboratorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) derivada de π0.5 (pi05); implementación LeRobot adaptada del repositorio OpenPI de Physical Intelligence; backbone transformer multimodal con entrada de imágenes y estado, y salida de acciones |
| Parámetros totales | 4.143.404.816 (aproximadamente 4,14 mil millones) |
| Parámetros activos | no aplica (no hay evidencia de que sea un modelo MoE en la información disponible) |
| Longitud de contexto | no disponible (modelo de acción: consume 3 imágenes de 3x480x640 y un vector de estado de 16 dimensiones por paso de inferencia) |
| Tipos de cuantización | no disponible (solo se publican pesos en safetensors; no se documentan variantes GGUF, int8 ni int4) |
| Idiomas soportados | no disponible (las instrucciones de tarea del dataset están en inglés; no se documenta soporte multilingüe) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

La arquitectura corresponde a un modelo Vision-Language-Action heredado de π0.5, que a su vez evoluciona π0 para mejorar la generalización a entornos nuevos. El modelo recibe tres flujos visuales (cámara frontal follower_d455f y dos cámaras de muñeca, izquierda y derecha, todas a 3x480x640) junto con un vector de estado propioceptivo de 16 dimensiones, y emite un vector de acción continuo de 16 dimensiones. El tipo de robot declarado es bi_openarm_follower, de modo que el espacio de acciones está ligado a esa morfología bimanual concreta. La implementación utilizada es la de LeRobot, adaptada del repositorio OpenPI de Physical Intelligence.

El ajuste fino se realizó por aprendizaje por imitación sobre el dataset leapshared/SciEdu_291epi: 291 episodios, 597.322 fotogramas a 30 FPS. Las tareas incluidas cubren tres experimentos, con instrucciones textuales del tipo "Do the leaf sorting experiment. put the leaf on the right side", "Do the redox reaction experiment. lift the metal plate out of the left beaker" y "Do the electroscope experiment. rub the plate on the fur", entre otras, incluyendo pasos intermedios y retorno a la postura inicial. La configuración de entrenamiento reportada es de 50.000 pasos, batch size 32, optimizador AdamW con learning rate 2.5e-05, semilla 42 y LeRobot 0.6.1. No se documenta en la información disponible si hubo etapas de RLHF, DPO o refinamiento por preferencias; el pipeline descrito es coherente con behavior cloning clásico. Tampoco se detalla la composición exacta del dataset más allá del número de episodios, fotogramas y tasa de captura.

## Capacidades

- Generación de acciones motoras continuas de 16 dimensiones a partir de observaciones visuales y propioceptivas, en bucle cerrado a la frecuencia de control del robot.
- Control bimanual sobre la plataforma bi_openarm_follower, con coordinación de dos brazos y uso de cámaras de muñeca para el guiado fino.
- Seguimiento de instrucciones en lenguaje natural para seleccionar y ejecutar la tarea solicitada entre las aprendidas.
- Ejecución de secuencias de manipulación de múltiples pasos (por ejemplo, coger la placa, frotarla con la piel, acercarla al electroscopio, señalarla y devolverla a su sitio).
- Percepción multimodal con tres cámaras simultáneas, lo que permite razonar sobre la posición relativa de objetos y efectores.
- Manipulación fina de objetos pequeños y frágiles (hojas, placas metálicas, vasos de precipitados).
- No se documenta soporte de tool calling, function calling, generación de texto libre, visión generalista fuera del dominio robótico, audio ni modos de razonamiento explícito tipo thinking.
- No se documentan capacidades multilingües; las únicas instrucciones verificadas están en inglés.

## Casos de uso

- Automatización de prácticas de laboratorio educativo: el modelo puede reproducir los tres experimentos del dataset (clasificación de hojas, redox y electroscopio) de forma autónoma sobre un banco de laboratorio instrumentado, liberando al alumnado de la ejecución repetitiva y permitiendo centrarse en la interpretación de resultados.
- Clasificación y separación de muestras biológicas: la tarea "put the leaf on the right side" / "left side" es directamente reutilizable para separar especímenes u hojas por criterios de posición, un patrón común en protocolos de herbario y laboratorios de botánica.
- Demostración de reacciones químicas con manipulación precisa: las subtareas de redox (extraer la placa del vaso izquierdo, desplazarla sobre la disolución azul, sumergirla y mantenerla inmóvil) encajan en ensayos que requieren tiempos de inmersión controlados y movimientos repetibles.
- Enseñanza de física con electroscopio: la secuencia de frotar la placa con la piel y acercarla y alejarla del electroscopio es un caso de manipulación rítmica y medida de distancia que el modelo ya ha aprendido, útil para demostraciones de electrostática reproducibles.
- Investigación en VLA e imitation learning como referencia: al ser un fine-tuning público con receta de entrenamiento explícita (50.000 pasos, batch 32, AdamW, lr 2.5e-05), sirve como baseline reproducible para comparar estrategias de adaptación de π0.5 a dominios concretos.
- Prototipado de estaciones de laboratorio autónomas: combinado con un planificador externo que envíe las instrucciones de tarea, el modelo puede encadenar los distintos pasos de un protocolo y actuar como capa de control de bajo nivel.
- Generación de datos de imitación: al ejecutar el modelo en bucle sobre el robot se pueden grabar episodios con la misma estructura que el dataset original, útiles para aumentar la cobertura de estados antes de reentrenar.
- Pruebas de integración hardware-software: sirve para validar la cadena completa de LeRobot (calibración, cámaras, puertos, temporización) antes de invertir en un modelo propio, gracias a un comando de despliegue documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito por tarea, métricas de error de posición, comparaciones con π0.5 base ni evaluaciones en simulador. No se deben asumir cifras de rendimiento a partir del número de descargas o likes, que en el momento de la consulta eran cero.

## Requisitos de hardware

- VRAM estimada para los pesos de inferencia, calculada a partir del recuento de parámetros (4,14 mil millones). Son estimaciones, no cifras oficiales: aproximadamente 16,6 GB en fp32, 8,3 GB en bf16/fp16, 4,1 GB en int8 y 2,1 GB en int4.
- A esas cifras hay que sumar la memoria de activaciones y del codificador visual, que procesa tres imágenes de 480x640 por paso. En la práctica conviene reservar entre 2 y 4 GB adicionales en precisión mixta.
- GPU recomendadas: A100, H100 o L40S si se busca el menor coste por inferencia y mayor margen; RTX 4090 (24 GB) es suficiente para ejecutar en bf16 sin cuantizar; RTX 3090 o RTX 4080 (16-24 GB) también son viables en bf16; RTX 3060 (12 GB) requeriría cuantización.
- Sí cabe en GPU de consumo: RTX 4090 y RTX 3090 en bf16, y modelos de 12 GB en int8.
- Opciones de despliegue: LeRobot mediante el comando lerobot-rollout con --strategy.type=base, apoyado en PyTorch. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de generación de texto sino una política de acción.
- El repositorio ocupa 165,7 GB, muy por encima del tamaño de los pesos, por lo que hay que prever espacio en disco para checkpoints y estados de optimizador.
- Latencia y throughput: no disponibles. El bucle de control del dataset original está capturado a 30 FPS, por lo que la inferencia debe sostener esa frecuencia para reproducir fielmente las trayectorias aprendidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entradas | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SciEdu_291epi_trim_pi05 | 4,14 mil millones | 3 imágenes 480x640 + estado de 16 dimensiones | no disponible (sin benchmarks) | apache-2.0 | Público en HuggingFace, 0 descargas |
| lerobot/pi05_base | no disponible (arquitectura idéntica, ajuste generalista) | mismas entradas multimodales del pipeline π0.5 | no disponible | no disponible en la información consultada | Público en HuggingFace como modelo base |
| π0.5 (Physical Intelligence) | no disponible | VLA de propósito general para entornos abiertos | no disponible | no disponible en la información consultada | Referenciado en el blog de Physical Intelligence; implementación abierta vía OpenPI |
| OpenVLA (modelo VLA abierto ampliamente usado como referencia) | aproximadamente 7 mil millones (variante OpenVLA-7B) | imágenes + instrucción de lenguaje | no disponible en esta consulta | no disponible en esta consulta | Público, fuera del ecosistema LeRobot |

Las cifras de contexto, rendimiento y licencia de los modelos comparados deben verificarse en sus respectivas fichas; no se han confirmado en la información proporcionada para esta ficha.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo ha visto tres experimentos concretos con sus variantes de instrucción. Fuera de esas tareas no hay garantía de comportamiento coherente.
- Dependencia del hardware exacto: está entrenado para el robot bi_openarm_follower con tres cámaras concretas (follower_d455f, left_wrist, right_wrist). Cambiar la configuración de cámaras, su montaje o la calibración invalida las observaciones esperadas.
- Dataset pequeño: 291 episodios y 597.322 fotogramas son un volumen reducido, con riesgo de sobreajuste a la iluminación, la disposición de los objetos y la postura inicial de la demostración.
- Riesgo de acumulación de error: en tareas de horizonte largo (por ejemplo, la secuencia completa de redox con ocho subtareas) los pequeños errores de posición pueden desviar la ejecución sin mecanismo de recuperación documentado.
- Riesgo de alucinación motora: como política de imitación, puede generar acciones plausibles pero incorrectas (agarrar en vacío, colisionar con el material de laboratorio) cuando el estado observado se aleja de la distribución de entrenamiento. Esto es especialmente crítico con material de laboratorio frágil o sustancias químicas.
- Idiomas: las instrucciones verificadas están en inglés. No hay evidencia de que el modelo interprete instrucciones en castellano.
- Licencia: el modelo se publica bajo apache-2.0, lo que en principio permite uso comercial. Sin embargo, conviene revisar las condiciones del modelo base lerobot/pi05_base y de π0.5, ya que podrían imponer restricciones adicionales sobre los pesos derivados.
- Ausencia de validación externa: cero descargas y cero likes en el momento de la consulta, sin informes de terceros que confirmen su funcionamiento fuera del entorno del autor.
- Coste de almacenamiento: 165,7 GB de repositorio, muy superior al tamaño teórico de los pesos, lo que complica su distribución y su uso en entornos con disco limitado.
- Sin benchmarks publicados: no hay números de tasa de éxito ni comparaciones objetivas que permitan juzgar su calidad frente a alternativas.

## Enlaces

- [Ficha del modelo en HuggingFace](https://huggingface.co/leapshared/SciEdu_291epi_trim_pi05)
- [Modelo base lerobot/pi05_base](https://huggingface.co/lerobot/pi05_base)
- [Dataset de entrenamiento leapshared/SciEdu_291epi](https://huggingface.co/datasets/leapshared/SciEdu_291epi)
- [Visualizador del dataset en LeRobot Spaces](https://huggingface.co/spaces/lerobot/visualize_dataset?path=leapshared/SciEdu_291epi)
- [Blog oficial de π0.5 en Physical Intelligence](https://www.physicalintelligence.company/blog/pi05)
- [Repositorio LeRobot en GitHub](https://github.com/huggingface/lerobot)
- [Guía de π0.5 en la documentación de LeRobot](https://huggingface.co/docs/lerobot/main/en/pi05)
- [Documentación de inferencia y rollout en LeRobot](https://huggingface.co/docs/lerobot/main/en/inference)
- [Guía de instalación de LeRobot](https://huggingface.co/docs/lerobot/main/en/installation)
- [Guía de hardware de LeRobot](https://huggingface.co/docs/lerobot/main/en/hardware_guide)
- [Guía de grabación de datos y entrenamiento de políticas](https://huggingface.co/docs/lerobot/en/il_robots)
- [Referencia rápida de comandos de LeRobot](https://huggingface.co/docs/lerobot/main/en/cheat-sheet)
- [Documentación general de LeRobot](https://huggingface.co/docs/lerobot/index)
