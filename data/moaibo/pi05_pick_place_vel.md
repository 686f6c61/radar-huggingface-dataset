# MoAIBo/pi05_pick_place_vel

## Resumen

MoAIBo/pi05_pick_place_vel es una política de robótica (modelo visión-lenguaje-acción, VLA) publicada por el usuario MoAIBo en HuggingFace. Se ha obtenido por ajuste fino (fine-tuning) de lerobot/pi05_base, la implementación en LeRobot de π₀.₅, el modelo VLA de Physical Intelligence diseñado para generalizar a entornos y situaciones no vistos durante el entrenamiento. El modelo resuelve una tarea de manipulación muy concreta: desacoplar el robot de su base de carga, coger un objeto (azul o amarillo) de una caja marrón, colocarlo en un plato blanco y volver al dock.

Cuenta con 4.143.404.816 parámetros (unos 4,14 mil millones) y el repositorio ocupa 9,4 GB en formato safetensors. Consume el estado del robot (vector de 8 dimensiones) y cinco flujos visuales de 3×360×640 píxeles (cámara izquierda, derecha, de muñeca, D455 y profundidad), y produce un vector de acción de 8 dimensiones. Se entrenó durante 25.000 pasos con batch de 16 sobre 96 episodios y 128.543 fotogramas a 30 FPS del dataset MoAIBo/merged_so101_tb4_pick_place_depth_vel, en un robot so101_tb4.

Su relevancia es doble: por un lado, demuestra el flujo completo de ajuste fino de un VLA abierto con LeRobot 0.6.0 sobre hardware económico tipo SO-101; por otro, publica una política con entrada de profundidad y licencia Apache 2.0, lo que permite reutilizarla comercialmente. Como contrapartida, no tiene descargas ni "likes", y el autor no ha publicado ningún resultado de evaluación en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) π₀.₅, implementación LeRobot derivada del repositorio OpenPI de Physical Intelligence; detalles internos de capas no disponibles |
| Parametros totales | 4.143.404.816 (~4,14 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (es una política de control; consume observaciones por paso, no una ventana de texto declarada) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; no se listan variantes cuantizadas) |
| Idiomas soportados | no disponible; las instrucciones de tarea documentadas están en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot; repositorio de 9,4 GB) |
| Pipeline | robotics |
| Tipo de robot | so101_tb4 |
| Camaras de entrada | camera_left, camera_right, camera_wrist, camera_d455, depth (cada una 3×360×640) |
| Entrada de estado | observation.state, forma (8,) |
| Salida | action, forma (8,) |
| Fecha de creacion | 2026-09-19 (según metadatos del Hub) |
| Ultima actualizacion | 2026-09-29 (según metadatos del Hub) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia π₀.₅ de Physical Intelligence, presentada por el autor como una evolución de π₀ orientada a la generalización en mundo abierto: generalizar a entornos y situaciones completamente nuevos que no aparecían en el entrenamiento. La implementación concreta que se ajusta aquí es la de LeRobot, adaptada del repositorio OpenPI de código abierto. No se detallan en la información disponible el número de capas, el codificador visual empleado ni el mecanismo de generación de acciones (por ejemplo, flow matching o difusión), por lo que esos aspectos quedan como no disponibles.

El ajuste fino se realizó sobre el dataset MoAIBo/merged_so101_tb4_pick_place_depth_vel, compuesto por 96 episodios y 128.543 fotogramas capturados a 30 FPS, con dos tareas: "Undock, pick up the blue object from the brown box, place it on the white plate, and return to the dock" y la variante con objeto amarillo. La configuración de entrenamiento declarada es de 25.000 pasos, batch size 16, optimizador AdamW, learning rate 2,5e-05 y semilla 1000, con LeRobot 0.6.0. No se menciona uso de RLHF, DPO ni ningún otro ajuste por preferencias, algo esperable en imitación robótica. Tampoco se documenta ninguna innovación técnica adicional más allá de las propias de π₀.₅.

## Capacidades

- Generación de acciones de manipulación en espacio de 8 dimensiones a partir de observaciones visuales y proprioceptivas, en bucle cerrado (control continuo, no generación de texto).
- Percepción multimodal con cinco cámaras simultáneas: tres vistas RGB (izquierda, derecha, muñeca), una vista D455 y un canal de profundidad, todas a 360×640.
- Ejecución de una secuencia compuesta de varias etapas: desacoplar de la base, aproximación y agarre del objeto, transporte, colocación y retorno al dock.
- Generalización declarada a entornos y situaciones nuevos, heredada del modelo base π₀.₅ (no validada en la información disponible para este ajuste concreto).
- Discriminación de objeto por color dentro de la tarea entrenada (objeto azul u objeto amarillo).
- Seguimiento de instrucciones de tarea en lenguaje natural, puesto que la tarea se pasa como cadena de texto en el comando de rollout.
- No se documenta soporte de tool calling, function calling, agentes multi-paso basados en texto, ni capacidades de audio o de razonamiento simbólico. No se documentan capacidades multilingües.

## Casos de uso

- Pick and place de laboratorio con SO-101: la política está entrenada exactamente para coger un objeto de una caja y dejarlo en un plato con un robot so101_tb4, por lo que se puede desplegar directamente con `lerobot-rollout` para demostraciones reproducibles de manipulación.
- Automatización de bin picking con percepción de profundidad: el uso del canal `depth` junto a las vistas RGB permite abordar agarres donde la estimación de distancia es crítica, algo habitual en cajas con objetos apilados.
- Investigación en aprendizaje por imitación: sirve como referencia reproducible de un ajuste fino de π₀.₅ con 25.000 pasos, batch 16 y AdamW, útil para estudiar sensibilidad a hiperparámetros o al número de episodios.
- Generación de datos sintéticos y DAgger: al ser una política entrenada, se puede usar como profesor para etiquetar automáticamente nuevas trayectorias o para inicializar políticas en variantes de la tarea (otro color de objeto, otra posición de caja).
- Punto de partida para fine-tuning en tareas nuevas: al derivar de lerobot/pi05_base y publicarse con licencia Apache 2.0, es un candidato razonable para reajustar a otras tareas de pick and place sin partir de cero.
- Evaluación de robustez de VLA: la tarea incluye condiciones potencialmente variables (iluminación, posición de objetos, distractores), por lo que el modelo se puede usar como sujeto de pruebas para medir degradación fuera de distribución.
- Formación y docencia en robótica: al ejecutarse con comandos de LeRobot y un robot SO-101 de bajo coste, es adecuado para prácticas de robótica con hardware accesible.
- Despliegue en estación de trabajo con GPU de consumo: el tamaño de 4,14 mil millones de parámetros permite ejecutar la inferencia en una GPU de 24 GB sin infraestructura de centro de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación con la anotación explícita "No evaluation results have been provided for this policy yet.", es decir, no hay tasa de éxito ni número de ensayos por tarea en robot real. Tampoco se proporcionan métricas de error de acción, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación propia a partir de los 4.143.404.816 parámetros, no publicada por el autor): en bf16/fp16 los pesos ocupan aproximadamente 8,3 GB, y con el codificador visual procesando cinco imágenes de 360×640 más el estado y las activaciones, el consumo realista se sitúa en el rango de 12 a 16 GB.
- En fp32 los pesos solos ocuparían unos 16,6 GB, por lo que no es una configuración recomendable.
- GPU de consumo: cabe en RTX 4090, RTX 3090 y RTX 4080 (24 GB y 16 GB respectivamente); en GPUs de 8 GB o menos no se puede cargar en bf16 sin cuantización, y no se ofrecen pesos cuantizados.
- GPU de centro de datos: A100 (40 GB u 80 GB), H100 y L40S son opciones válidas y sobradas en memoria.
- Opciones de despliegue: la ruta documentada es LeRobot, con el comando `lerobot-rollout --strategy.type=base --robot.type=so101_tb4 --policy.path=MoAIBo/pi05_pick_place_vel`. Se requiere PyTorch con CUDA. No aplican vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo de lenguaje de texto ni se publican pesos GGUF.
- Latencia y throughput: no disponibles. El dataset de entrenamiento está capturado a 30 FPS, lo que indica la cadencia de control de referencia, pero no hay ninguna medición publicada de latencia de inferencia ni de frecuencia de control alcanzable.
- Requisitos de integración: hay que disponer de un robot so101_tb4 con cinco cámaras y nombres de cámara que coincidan exactamente con las claves de observación del modelo, además de puerto, calibración e índices de cámara correctos.

## Comparativa con modelos similares

No se dispone de datos de otros modelos comparables en la información proporcionada, salvo la referencia al modelo base del que deriva este ajuste.

| Modelo | Parametros | Contexto / entradas | Licencia | Disponibilidad |
|---|---|---|---|---|
| MoAIBo/pi05_pick_place_vel | 4.143.404.816 | 5 imágenes 360×640 (incluye profundidad) + estado (8,) | Apache 2.0 | Publicado en HuggingFace; 0 descargas, 0 likes |
| lerobot/pi05_base | no disponible (no confirmado; misma familia π₀.₅) | no disponible | no disponible | Público en HuggingFace como modelo base |
| Otros VLA de la misma categoría | no disponible | no disponible | no disponible | no disponible |

La única comparación cualitativa posible con los datos aportados es que este modelo es un ajuste especializado del base: hereda sus capacidades generales y añade dos tareas concretas de pick and place sobre robot so101_tb4, a costa de perder generalidad frente al modelo base.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasa de éxito publicada en robot real, por lo que se desconoce la fiabilidad efectiva de la política.
- Sesgo y alcance del dataset: solo 96 episodios y dos tareas (objeto azul y objeto amarillo) en un entorno concreto; es probable que falle ante objetos de otros colores, formas, posiciones fuera del rango demostrado, iluminación distinta o presencia de distractores.
- Dependencia estricta del hardware: el modelo espera un robot so101_tb4 y exactamente cinco cámaras con los nombres `camera_left`, `camera_right`, `camera_wrist`, `camera_d455` y `depth`; cualquier discrepancia en nombres, resolución o calibración degradará o invalidará la inferencia.
- Formato de observación rígido: la entrada de profundidad se declara como VISUAL de 3×360×640, de modo que el canal de profundidad debe servirse con esa estructura y resolución.
- Riesgo de alucinación de acciones: como toda política generativa, puede producir trayectorias plausibles pero incorrectas (agarres al aire, colisiones) al salir de la distribución de entrenamiento; requiere parada de emergencia y supervisión humana.
- Idiomas: las tareas documentadas están en inglés; no se declara soporte multilingüe para las instrucciones.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero conviene revisar las condiciones del modelo base lerobot/pi05_base y del modelo original π₀.₅ de Physical Intelligence, así como las de los datos de entrenamiento publicados.
- Trazabilidad limitada: el repositorio no incluye demostración en vídeo, informe técnico ni tarjeta de evaluación cumplimentada; con 0 descargas y 0 likes tampoco existe validación independiente por parte de la comunidad.
- Fechas de metadatos anómalas (creación y actualización en septiembre de 2026 según el Hub), que conviene verificar antes de citarlas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MoAIBo/pi05_pick_place_vel
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/MoAIBo/merged_so101_tb4_pick_place_depth_vel
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=MoAIBo/merged_so101_tb4_pick_place_depth_vel
- Blog de π₀.₅ de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI de Physical Intelligence (mencionado en la model card; URL no incluida en la información disponible)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de π05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; únicamente aparecieron páginas genéricas del portal MSN, sin relación con π₀.₅ ni con LeRobot.
