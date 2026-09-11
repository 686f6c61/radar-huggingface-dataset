# sam-guided-vlas/train_1_2_pile__mask__blur__sim__all_cameras__live__pi05__seed_0__steps_1k

## Resumen

Este repositorio contiene un *checkpoint* de política robótica entrenada con LeRobot: un *fine-tune* del modelo base lerobot/pi05_base, que a su vez implementa π₀.₅ (Pi05), el modelo Vision-Language-Action (VLA) de Physical Intelligence orientado a generalización en entornos abiertos. El modelo consume observaciones multimodales (estado del robot más tres vistas de cámara) y produce directamente un vector de acción de 7 grados de libertad, sin pasar por una representación de texto intermedia. Es, por tanto, un modelo de política (imitation learning) y no un modelo generativo de lenguaje.

El *checkpoint* pertenece a la organización sam-guided-vlas y se ha entrenado sobre un único dataset de demostraciones con robot Panda: 200 episodios, 69.392 fotogramas a 20 FPS y 20 tareas de manipulación de objetos de cocina y despensa. El entrenamiento es deliberadamente corto (1.000 pasos, batch de 16), por lo que debe interpretarse como un punto de control intermedio dentro de un barrido de experimentos (el nombre indica *seed 0*, *steps 1k*, y variantes con máscaras, desenfoque y datos simulados y reales).

Su relevancia es acotada pero clara: sirve como referencia reproducible para estudiar cómo evoluciona una política VLA de 4.143 millones de parámetros con muy pocos pasos de ajuste, y como base para comparar estrategias de aumento de datos (*mask*, *blur*) y de mezcla sim/real en robótica de manipulación. La licencia Apache 2.0 facilita su reutilización comercial, aunque la ausencia total de evaluación publicada limita cualquier conclusión sobre su rendimiento real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA); implementación LeRobot de π₀.₅ (Pi05), derivada del repositorio OpenPI de Physical Intelligence. Detalle interno del backbone no disponible en la model card |
| Parámetros totales | 4.143.404.816 (≈4,14 mil millones), según los pesos en safetensors |
| Parámetros activos | No aplica / no disponible (no se indica que sea una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repositorio publica safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | No disponible. El modelo se condiciona mediante una cadena de tarea; las 20 tareas del dataset están etiquetadas en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería: lerobot) |
| Tamaño del repositorio | 9,4 GB |
| Modelo base | lerobot/pi05_base |
| Robot objetivo | Panda |
| Cámaras | agentview, robot0_eye_in_hand, robot0_eye_in_hand_2 |
| Entrada | observation.state (9,); 3 imágenes (3, 224, 224) |
| Salida | action (7,) |
| Pipeline declarado | robotics |

## Arquitectura y entrenamiento

La model card identifica el modelo como π₀.₅ (Pi05), un VLA de Physical Intelligence diseñado para generalizar a entornos y situaciones no vistos durante el entrenamiento, y señala que la implementación disponible en LeRobot está adaptada del repositorio OpenPI de los mismos autores. La card no detalla la composición interna del backbone (codificador visual, torre de lenguaje, cabezal de acciones), el número de tokens de entrenamiento ni el uso de etapas de alineación tipo RLHF o DPO, por lo que esos puntos quedan como no disponibles. Lo que sí se documenta es la interfaz operativa: el modelo toma un vector de estado de 9 dimensiones y tres imágenes RGB de 224×224 (una vista frontal y dos cámaras en la muñeca) y emite un vector de acción de 7 dimensiones.

El ajuste se realizó con LeRobot 0.6.0 sobre el dataset sam-guided-vlas/train_1_2_pile__mask__blur__sim__all_cameras__live, compuesto por 200 episodios y 69.392 fotogramas capturados a 20 FPS, con 20 tareas de manipulación (basket, boxed food, cake, can, hamburger, lemon, orange, spice, squash, spray, soap dispenser, jam, jar, cereal, knife block, kettle, pear, potato, sweet potato, scone). La configuración de entrenamiento es explícita: 1.000 pasos, batch de 16, optimizador AdamW, learning rate 5e-05 y semilla 0. Se trata, por tanto, de un ajuste de muy baja intensidad sobre el modelo base; el nombre del repositorio sugiere además que forma parte de una familia de experimentos con variantes de enmascarado (*mask*), desenfoque (*blur*), uso de todas las cámaras (*all_cameras*) y combinación de simulación y datos reales (*sim*, *live*).

## Capacidades

- Generación de acciones robóticas: produce un vector de acción continuo de 7 dimensiones a partir del estado del robot y de tres vistas de cámara, apto para control de un brazo Panda con pinza.
- Manipulación guiada por lenguaje: la política se condiciona con una cadena de tarea (por ejemplo, `--task="basket"`), con 20 tareas de agarre y colocación de objetos de cocina y despensa vistas en el dataset.
- Percepción multimodal con tres cámaras simultáneas: una vista externa (agentview) y dos cámaras en la muñeca (robot0_eye_in_hand y robot0_eye_in_hand_2), lo que aporta información de oclusión y de proximidad al objeto.
- Aprendizaje por imitación: se entrena y se ejecuta con el flujo estándar de LeRobot (`lerobot-train`, `lerobot-rollout`), sin necesidad de recompensas ni de simulador para la inferencia.
- Integración con estado propioceptivo: consume 9 dimensiones de estado del robot junto con las imágenes.
- No dispone de *tool calling* ni de *function calling*: es una política de control, no un modelo de lenguaje con interfaz de herramientas.
- No dispone de razonamiento multi-paso explícito ni de modo *thinking*: no se documenta cadena de pensamiento ni planificación simbólica.
- No dispone de capacidades multilingües documentadas ni de generación de texto, visión a texto, audio o código.

## Casos de uso

- Manipulación de mesa en cocina o despensa: el modelo está ajustado exactamente sobre 20 tareas de recogida y colocación de alimentos y utensilios (can, jar, cereal, kettle, knife block, pear, potato, scone, etc.), por lo que su uso directo es reproducir esas tareas con un Panda y la misma disposición de cámaras.
- Recogida y depósito en contenedor: la tarea `basket` aparece como primera del dataset y es representativa del flujo *pick-and-place*, donde la cámara en la muñeca aporta la precisión de agarre y la vista frontal la localización del contenedor.
- Línea base para experimentos de imitación: al ser un *checkpoint* de 1.000 pasos con semilla 0, resulta útil como control frente a *fine-tunes* más largos o con otras semillas, midiendo la ganancia por paso de entrenamiento.
- Estudio de robustez con datos aumentados: el nombre del dataset incluye variantes *mask* y *blur*, de modo que este modelo sirve para comparar políticas entrenadas con enmascarado y desenfoque frente al mismo esquema sin aumento.
- Comparación simulación versus robot real: el dataset combina indicios de datos simulados (*sim*) y reales (*live*), lo que permite evaluar la transferencia de políticas entrenadas con mezcla de dominios sobre el mismo conjunto de tareas.
- Recolección de datos y escalado de políticas: sirve como destino de *fine-tuning* dentro del flujo de LeRobot documentado en la propia model card (`lerobot-train --policy.path=lerobot/pi05_base`), útil para equipos que quieran validar su *pipeline* de teleoperación a política.
- Automatización de demostraciones en laboratorio: con `lerobot-rollout --strategy.type=base` se puede ejecutar la política de forma continua (`--duration=60`) para generar vídeos de comportamiento y auditar visualmente fallos de agarre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La sección de evaluación de la model card está explícitamente vacía (*No evaluation results have been provided for this policy yet*), por lo que no existen tasas de éxito por tarea, número de ensayos ni comparaciones con otras políticas. Tampoco se proporcionan métricas de tipo MMLU, HumanEval o GSM8K, que además no aplicarían a un modelo de acción.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de los 4.143.404.816 parámetros, sin contar activaciones ni memoria del *runtime*): ≈16,6 GB en FP32, ≈8,3 GB en BF16/FP16, ≈4,1 GB en INT8 y ≈2,1 GB en INT4.
- GPU recomendadas para BF16: NVIDIA A100 (40/80 GB), H100, L40S, RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para los pesos; las activaciones de tres imágenes de 224×224 y la memoria de trabajo del *pipeline* de LeRobot añaden un consumo adicional no cuantificado en la documentación.
- GPU de consumo: cabe en RTX 4090/3090 en BF16, en RTX 4080 (16 GB) con margen ajustado y en RTX 3060 (12 GB) o similares si se recurre a cuantización INT8 o INT4. No se publican pesos cuantizados, por lo que habría que generarlos localmente.
- Opciones de despliegue: LeRobot 0.6.0 (comandos `lerobot-rollout` y `lerobot-train`), PyTorch con CUDA (`--policy.device=cuda`) y el ecosistema OpenPI del que deriva la implementación. No aplican vLLM, TGI, llama.cpp u Ollama, ya que no es un modelo de generación de texto.
- Latencia y throughput: no disponibles. Como referencia indirecta, los datos de entrenamiento se capturaron a 20 FPS, lo que sugiere que un despliegue fluido requeriría frecuencias de control del orden de decenas de hercios, pero no se aporta ninguna medición de latencia real.
- Almacenamiento: el repositorio ocupa 9,4 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este *checkpoint* (sam-guided-vlas, pi05, seed 0, 1k pasos) | 4,14 mil millones | No disponible | Apache 2.0 | Hugging Face, librería lerobot | *Fine-tune* de 1.000 pasos sobre pi05_base; sin evaluación publicada |
| lerobot/pi05_base (modelo base) | No disponible en la información proporcionada | No disponible | No disponible en la información proporcionada | Hugging Face, referenciado como `base_model` | Punto de partida del *fine-tune*; la model card recomienda partir de él para entrenar políticas propias |
| π₀.₅ original (Physical Intelligence) | No disponible en la información proporcionada | No disponible | No disponible en la información proporcionada | Blog y repositorio OpenPI citados en la model card | Método del que deriva la implementación LeRobot; no se ofrecen datos comparativos numéricos |

No se dispone en la información proporcionada de cifras de rendimiento, contexto o licencia de alternativas de la misma categoría que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasas de éxito por tarea ni número de ensayos, por lo que no puede afirmarse que la política funcione en el robot real.
- Entrenamiento muy corto: 1.000 pasos con batch de 16 sobre 69.392 fotogramas equivale a un número de actualizaciones muy bajo respecto al tamaño del dataset; es probable que el *checkpoint* esté infraentrenado y que las variantes con más pasos de la misma familia funcionen mejor.
- Sin datos sobre sesgos: no se documenta ningún análisis de sesgo, y en robótica estos aparecen como sesgos de posición, iluminación, tipo de objeto o configuración de cámara del dataset de demostración.
- Riesgo alto de sobreajuste al *setup*: el modelo espera exactamente tres cámaras con nombres concretos (agentview, robot0_eye_in_hand, robot0_eye_in_hand_2) y un vector de estado de 9 dimensiones; cualquier cambio de montaje, resolución o robot invalida la política.
- Vocabulario de tareas cerrado: solo se han visto 20 etiquetas de tarea; el modelo no generaliza a instrucciones nuevas en lenguaje natural más allá de ese conjunto.
- Idiomas no documentados: no hay evidencia de que el condicionamiento por lenguaje funcione en castellano; las etiquetas del dataset están en inglés.
- Limitaciones de contexto: se desconoce la ventana de contexto y la política opera sobre observación actual, sin memoria explícita a largo plazo documentada.
- Sin cuantizaciones oficiales: no se publican pesos GGUF, AWQ ni GPTQ, lo que obliga a generarlos si se quiere desplegar en GPUs pequeñas.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base lerobot/pi05_base, que no se detalla en la información disponible, así como las condiciones de los datos de demostración.
- Caveat de producción: el repositorio no incluye *demo.gif*, ni métricas, ni *issues* de seguimiento; con 0 descargas y 0 *likes*, no hay evidencia de uso en producción por terceros.
- Los resultados de la búsqueda web disponibles tratan sobre SAM 2 (Meta) y no están citados por la model card; su relación con este modelo es, como máximo, indirecta a través del nombre de la organización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sam-guided-vlas/train_1_2_pile__mask__blur__sim__all_cameras__live__pi05__seed_0__steps_1k
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2_pile__mask__blur__sim__all_cameras__live
- Visualizador del dataset en LeRobot: https://huggingface.co/spaces/lerobot/visualize_dataset?path=sam-guided-vlas/train_1_2_pile__mask__blur__sim__all_cameras__live
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Guía de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de inferencia y *rollout*: https://huggingface.co/docs/lerobot/main/en/inference
- Guía de imitación (IL) en robots: https://huggingface.co/docs/lerobot/en/il_robots
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Repositorio OpenPI de Physical Intelligence (citado en la model card como origen de la implementación): https://github.com/Physical-Intelligence/openpi
- Resultados de búsqueda web no citados por la model card, sobre SAM 2 de Meta (posible relación con el nombre de la organización): https://ai.meta.com/research/sam2/ | https://github.com/facebookresearch/sam2 | https://encord.com/blog/segment-anything-model-2-sam-2/ | https://learnopencv.com/sam-2/ | https://www.labellerr.com/blog/learn-sam-2-in-minutes/
