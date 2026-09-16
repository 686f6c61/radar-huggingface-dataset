# seriintan/turbovla_frazier_object_variation

## Resumen

turbovla_frazier_object_variation es una política de robótica (vision-language-action) entrenada con LeRobot y publicada en Hugging Face por el usuario seriintan. Se trata de un modelo de imitación que consume el estado articular de un brazo seguidor SO (`so_follower`, vector de 6 dimensiones) junto con dos flujos de imagen RGB de 480x640 píxeles (cámaras `front` y `gripper`), y produce como salida un vector de acción continuo de 6 dimensiones. La tarea concreta para la que fue entrenada es "Pick and place Frazier to blue basket", es decir, recoger un objeto y depositarlo en una cesta azul.

El modelo tiene 216.072.210 parámetros (aproximadamente 216 M) en formato safetensors, con un repositorio de 0,9 GB, lo que lo sitúa en la categoría de políticas compactas capaces de ejecutarse en hardware de consumo. Fue entrenado durante 50.000 pasos con un tamaño de lote de 16, optimizador AdamW y una tasa de aprendizaje de 5e-05 sobre el dataset `seriintan/frazier_dataset_v2_object_variation`, que contiene 171 episodios y 99.043 fotogramas grabados a 30 FPS.

Su relevancia es doble: por un lado, forma parte del ecosistema LeRobot, que estandariza el entrenamiento y despliegue de políticas de imitación en robots reales de bajo coste; por otro, ejemplifica el flujo de trabajo de "variación de objetos", en el que se recopilan demostraciones con distintas posiciones y apariencias del objeto para mejorar la generalización. No se han publicado resultados de evaluación en la información disponible, por lo que se trata de un artefacto de investigación sin validación pública de éxito en tarea.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política VLA implementada como tipo `turbovla` en LeRobot; la model card no detalla el backbone) |
| Parametros totales | 216.072.210 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no aplica en el sentido de contexto textual; la observación se compone de un vector de estado (6,) y dos imágenes (3, 480, 640) |
| Tipos de cuantizacion | no disponible; los pesos se publican en safetensors y el repositorio ocupa 0,9 GB, magnitud coherente con fp32 para 216 M de parámetros |
| Idiomas soportados | no disponible (el modelo se condiciona por una cadena de tarea en inglés, no genera lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio LeRobot, 0,9 GB) |

## Arquitectura y entrenamiento

La model card identifica la política como `turbovla`, entrenada y publicada mediante LeRobot 0.6.2, pero no especifica la arquitectura interna (tipo de codificador visual, si emplea un transformer multimodal, mecanismo de atención o esquema de difusión). Los datos disponibles permiten describir únicamente la interfaz de entrada y salida: entrada de estado `observation.state` con forma `(6,)`, dos entradas visuales `observation.images.front` y `observation.images.gripper` con forma `(3, 480, 640)`, y salida `action` con forma `(6,)`. El robot objetivo es de tipo `so_follower`, el brazo seguidor del ecosistema SO de bajo coste habitual en LeRobot.

El entrenamiento se realizó sobre el dataset `seriintan/frazier_dataset_v2_object_variation`, con 171 episodios, 99.043 fotogramas y una frecuencia de captura de 30 FPS para la tarea única "Pick and place Frazier to blue basket". La configuración de entrenamiento publicada es de 50.000 pasos, lote de 16, optimizador AdamW, tasa de aprendizaje 5e-05 y semilla 1000. No se indica en la información disponible si hubo etapas de RLHF, DPO, reward modeling ni ninguna innovación técnica adicional (decodificación especulativa, atención lineal u otras). Tampoco se detalla la composición exacta del dataset más allá del nombre, que sugiere variación en la posición o apariencia del objeto.

## Capacidades

- Control robótico de manipulación: genera acciones continuas de 6 grados de libertad para un brazo `so_follower` a partir de estado articular e imágenes.
- Ejecución de una tarea de pick-and-place concreta: "Pick and place Frazier to blue basket".
- Percepción visual bimodal: procesa simultáneamente una cámara frontal (`front`) y una cámara en la pinza (`gripper`), ambas a 480x640 y 30 FPS.
- Condicionamiento por instrucción de tarea: la política acepta un parámetro `--task` en la CLI de despliegue, aunque solo se ha entrenado para la tarea indicada.
- Generalización a variación de objetos: el nombre del modelo y del dataset apuntan a un entrenamiento orientado a tolerar cambios en la posición o apariencia del objeto.
- Inferencia local: con 216 M de parámetros, puede ejecutarse en una GPU de consumo sin infraestructura en la nube.
- Fine-tuning posterior: compatible con `lerobot-train --policy.type=turbovla` para reentrenar sobre nuevos datasets propios.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multietapa, capacidades multilingües, modo thinking, audio ni visión general fuera del control motor.

## Casos de uso

- Clasificación y recogida en línea de producción: el modelo puede integrarse en una celda robotizada que recoja piezas y las deposite en un contenedor, replicando la tarea aprendida, siempre que la disposición inicial sea similar a la de las demostraciones.
- Fine-tuning para nuevos objetos: el dataset de entrenamiento está orientado a variación de objetos, por lo que sirve como punto de partida para reentrenar la política con nuevas piezas usando `lerobot-train --policy.type=turbovla` y un dataset propio.
- Prototipado en laboratorio de robótica: con 216 M de parámetros y 0,9 GB de pesos, un grupo de investigación puede desplegarlo en una estación con una GPU de consumo y validar pipelines de imitación sin clúster.
- Automatización de tareas repetitivas de bajo valor en almacén: recogida de artículos individuales y depósito en cajas o cestas, con la ventaja de requerir hardware de bajo coste tipo brazo SO.
- Docencia y formación en aprendizaje por imitación: el repositorio es un ejemplo completo del ciclo grabar dataset, entrenar política y desplegar con `lerobot-rollout`, útil para cursos prácticos.
- Evaluación de robustez a variaciones visuales: al haberse entrenado con variación de objetos, permite estudiar hasta qué punto la política tolera cambios de iluminación, posición o distracciones.
- Reciclaje y separación de residuos: adaptando el fine-tuning a nuevos materiales y contenedores, la misma arquitectura puede recoger objetos de una cinta y depositarlos en el receptáculo correspondiente.
- Pruebas de integración con cámaras RGB de bajo coste: la política consume dos flujos OpenCV a 640x480 y 30 FPS, lo que facilita montajes económicos con webcams o cámaras USB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks ni de evaluación en robot real en la información disponible. La model card incluye explícitamente la frase "No evaluation results have been provided for this policy yet", sin tabla de ensayos, tasas de éxito ni comparaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, alrededor de 0,9 GB solo para los pesos (coherente con el tamaño del repositorio); en bf16/fp16 bajaría a aproximadamente 0,45 GB. A esta cifra hay que sumar las activaciones de dos codificadores de imagen de 3x480x640 y el resto del grafo, no cuantificadas en la información disponible.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM es suficiente en la práctica; se indica `--policy.device=cuda` en los ejemplos del autor. Modelos como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobradamente capaces, aunque no se publican mediciones específicas por modelo.
- GPU de consumo: sí cabe en GPU de consumo; el tamaño de pesos es inferior a 1 GB en fp32.
- Plataformas embebidas: no se documenta compatibilidad con Jetson u otras plataformas embebidas, aunque el tamaño del modelo lo hace plausible; no hay datos confirmados.
- Opciones de despliegue: la vía documentada es LeRobot mediante `lerobot-rollout --strategy.type=base --robot.type=so_follower --policy.path=seriintan/turbovla_frazier_object_variation`. El reentrenamiento se realiza con `lerobot-train --policy.type=turbovla`. No aplican herramientas de servido de LLM como vLLM, TGI, llama.cpp, Ollama o GGUF, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. El único dato relacionado es que el dataset se grabó a 30 FPS, lo que sugiere un bucle de control del orden de 30 Hz, pero no se publica ninguna medición de latencia real de inferencia ni de frecuencia efectiva de control.
- Requisitos adicionales: brazo `so_follower` calibrado y dos cámaras OpenCV configuradas con nombres coincidentes con `front` y `gripper`, a 640x480 y 30 FPS.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de terceros en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable. La categoría natural de comparación son otras políticas de imitación del ecosistema LeRobot (por ejemplo, ACT, Diffusion Policy o SmolVLA), pero sus parámetros, contexto, licencia y rendimiento no se facilitan en la información disponible.

| Modelo | Parametros | Contexto / observacion | Licencia | Datos de rendimiento |
|---|---|---|---|---|
| seriintan/turbovla_frazier_object_variation | 216.072.210 | estado (6,) + 2 imagenes 3x480x640 | apache-2.0 | no disponible |
| Otras politicas LeRobot (ACT, Diffusion Policy, SmolVLA) | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay tasas de éxito publicadas, ni número de ensayos, ni condiciones de prueba. No debe asumirse que la política funciona fuera del entorno de grabación.
- Sesgo de dominio: entrenada con 171 episodios y 99.043 fotogramas de un único entorno, un único robot `so_follower` y una única tarea. Cualquier cambio de robot, altura de cámara, iluminación o fondo puede degradar el comportamiento.
- Especialización estrecha: la tarea aprendida es "Pick and place Frazier to blue basket"; no es un modelo generalista de manipulación ni de razonamiento visual.
- Riesgo de alucinación motora: como toda política de imitación, puede generar acciones plausibles pero incorrectas ante observaciones fuera de distribución, con riesgo de colisión o de dañar el objeto o el entorno.
- Sobrepaso o infraajuste: 50.000 pasos y lote 16 sobre 99.043 fotogramas están en el rango habitual de este tipo de políticas, pero no hay curvas de pérdida ni validación publicadas.
- Idiomas y lenguaje: no hay soporte multilingüe ni generación de texto; el condicionamiento es una cadena de tarea en inglés y no se documenta variación de instrucciones.
- Licencia: Apache 2.0 permite uso comercial y modificación, siempre que se conserve el aviso de licencia y se cumplan las condiciones de la propia licencia; el dataset asociado puede tener condiciones propias que conviene revisar.
- Reputación del artefacto: 0 descargas y 0 "likes" en el momento de la consulta, creado y actualizado el mismo día, sin validación de la comunidad ni autoría institucional identificable.
- Ausencia de datos de arquitectura: al no especificarse el backbone ni el esquema de entrenamiento, es difícil estimar costes de reentrenamiento o requisitos de memoria para fine-tuning.
- Hardware específico: el despliegue requiere un brazo `so_follower` y dos cámaras con nombres coincidentes; no es portable directamente a otros brazos sin reentrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/seriintan/turbovla_frazier_object_variation
- Dataset de entrenamiento: https://huggingface.co/datasets/seriintan/frazier_dataset_v2_object_variation
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=seriintan/frazier_dataset_v2_object_variation
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de la CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Cita de LeRobot (BibTeX en la model card): Cadene et al., "LeRobot: State-of-the-art Machine Learning for Real-World Robotics in Pytorch", 2024
- Búsqueda web: no se han encontrado resultados relevantes sobre este modelo; las consultas devolvieron únicamente páginas no relacionadas, por lo que no se incluye ningún enlace adicional.
