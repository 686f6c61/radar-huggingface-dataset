# OzodbekAImarkaz/pi05_resting-star

## Resumen

pi05_resting-star es una política robótica de tipo Vision-Language-Action (VLA) publicada por el usuario OzodbekAImarkaz en Hugging Face. Se trata de un ajuste fino (fine-tuning) del modelo base lerobot/pi05_base, que a su vez implementa π₀.₅ (Pi05), el modelo de acción viso-lenguaje desarrollado por Physical Intelligence para generalización en entornos abiertos. El modelo resultante está especializado en una única tarea de manipulación: "Pick up the star toy and place it on its resting place".

El modelo tiene 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) almacenados en formato safetensors, con un repositorio de 9,4 GB. Consume observaciones multimodales (hasta cinco entradas visuales de 224x224 píxeles y un vector de estado de 32 dimensiones) y produce un vector de acción de 6 dimensiones, lo que lo hace adecuado para un brazo robótico de tipo `so_follower` (familia SO-100/SO-101) con cámaras OpenCV.

Su relevancia es principalmente práctica y metodológica: demuestra el flujo completo de LeRobot (grabación de datos, entrenamiento de imitación y despliegue en robot real) con un dataset pequeño de 50 episodios y 16.768 fotogramas a 30 FPS, y sirve como plantilla reproducible para quien quiera ajustar π₀.₅ a una tarea propia. No obstante, el autor no ha publicado ningún resultado de evaluación en robot real, por lo que su tasa de éxito real es desconocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ de Physical Intelligence; implementación LeRobot adaptada del repositorio OpenPI. El detalle interno de capas no se especifica en la información disponible |
| Parametros totales | 4.143.404.816 (≈4,14 B) |
| Longitud de contexto | No aplica / no disponible. No es un modelo de lenguaje conversacional; la condición de entrada es una ventana de observaciones (imágenes + estado) y una instrucción de tarea en texto |
| Tipos de cuantizacion | No disponible (no se publican versiones cuantizadas en el repositorio) |
| Idiomas soportados | No disponible. La instrucción de tarea registrada está en inglés ("Pick up the star toy and place it on its resting place") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Modelo base | lerobot/pi05_base |
| Pipeline / tipo de modelo | `robotics` (política de control) |
| Robot objetivo | `so_follower` (brazo seguidor de la familia SO-100/SO-101) |
| Cámaras declaradas | `overhead` (en la sección de detalles del modelo) |
| Entradas visuales | `observation.images.base_0_rgb` (3, 224, 224); `observation.images.left_wrist_0_rgb` (3, 224, 224); `observation.images.right_wrist_0_rgb` (3, 224, 224); `observation.images.empty_camera_0` (3, 224, 224); `observation.images.empty_camera_1` (3, 224, 224) |
| Entrada de estado | `observation.state` (32,) |
| Salida | `action` (6,) |
| Dataset de entrenamiento | OzodbekAImarkaz/resting-star_20260906_134338 (50 episodios, 16.768 fotogramas, 30 FPS) |
| Tamaño del repositorio | 9,4 GB |
| Versión de LeRobot | 0.6.2 |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-09-15 / 2026-09-15 |

## Arquitectura y entrenamiento

La familia π₀ de Physical Intelligence combina un backbone viso-lenguaje (codificador de visión más un modelo de lenguaje) con un experto de acciones que genera secuencias de comandos motores, siguiendo un planteamiento de flow matching y predicción de *chunks* de acción. La model card de este repositorio no detalla esa composición interna: se limita a indicar que π₀.₅ es un modelo Vision-Language-Action diseñado para generalización en entornos nunca vistos y que la implementación de LeRobot proviene de OpenPI. Cualquier afirmación más concreta sobre número de capas, tipo de atención o tamaño del experto de acciones no está respaldada por la información disponible.

El ajuste fino se realizó sobre el dataset `OzodbekAImarkaz/resting-star_20260906_134338`, compuesto por 50 episodios y 16.768 fotogramas grabados a 30 FPS para una única tarea de *pick and place*. La configuración de entrenamiento registrada es: 20.000 pasos, tamaño de lote 16, optimizador AdamW, tasa de aprendizaje 2,5e-05, semilla 1000 y LeRobot 0.6.2, partiendo de `lerobot/pi05_base`. No se documenta el uso de RLHF, DPO ni de ningún método de alineación posterior; tampoco se describe aumentación de datos, composición del dataset más allá de la tarea única, ni innovaciones técnicas adicionales.

## Capacidades

- Control robótico de manipulación: genera comandos de 6 grados de libertad a partir de observaciones visuales y de estado del robot.
- Ejecución de una tarea de *pick and place* concreta: coger un juguete con forma de estrella y colocarlo en su posición de reposo.
- Acondicionamiento por instrucción textual de tarea (el *prompt* `--task` se pasa en tiempo de ejecución a `lerobot-rollout`).
- Fusión de múltiples vistas: hasta cinco entradas visuales de 224x224 (cámara base, muñecas izquierda y derecha, más dos cámaras declaradas como vacías).
- Política de imitación entrenada de extremo a extremo desde demostraciones humanas, sin necesidad de recompensa explícita.
- Reentrenamiento y ajuste fino adicional mediante el comando `lerobot-train` sobre el modelo base.
- No dispone de *tool calling*, ni de razonamiento multi-paso genérico, ni de modo *thinking*.
- No se documentan capacidades multilingües, de visión general, de audio, de generación de texto ni de código: es una política robótica, no un asistente.

## Casos de uso

- Automatización de una celda de manipulación para una tarea concreta de recogida y colocación: el modelo recibe las imágenes de las cámaras y el estado articular y emite las 6 componentes de acción a la frecuencia de control, sustituyendo a un programa de *pick and place* escrito a mano cuando la posición del objeto varía ligeramente.
- Base de partida para ajustar una tarea nueva sobre el mismo robot `so_follower`: al estar entrenado sobre `lerobot/pi05_base`, sirve como punto de partida (inicialización) para un nuevo `lerobot-train` con un dataset propio, reduciendo el número de episodios necesarios frente a entrenar desde cero.
- Línea base (baseline) en investigación de imitación visual: permite comparar una política π₀.₅ ajustada con 20.000 pasos y 50 episodios frente a alternativas como ACT, Diffusion Policy o SmolVLA en un montaje SO-100 reproducido.
- Recolección de datos en bucle cerrado: ejecutar la política con `lerobot-rollout --strategy.type=base`, corregir manualmente los fallos y añadir esos episodios al dataset para reentrenar, aprovechando el mismo formato de datos de LeRobot.
- Estudio de generalización visomotora: al ser un ajuste fino de un modelo entrenado para generalización en entornos abiertos, es un candidato razonable para medir degradación ante cambios de iluminación, posición del objeto, distractores o color del fondo, siempre que se registren las tasas de éxito por condición.
- Docencia y formación en robótica de imitación: el repositorio incluye instrucciones completas de instalación, calibración de hardware y despliegue, por lo que sirve como ejemplo didáctico de un pipeline VLA completo con 50 episodios.
- Prueba de concepto de integración industrial ligera para clasificación y colocación de piezas pequeñas, con la advertencia de que no existe ninguna evaluación publicada de fiabilidad y de que la licencia Apache-2.0 permite el uso comercial sin restricciones de la licencia, pero no exime de validar el comportamiento en producción.
- Pruebas de infraestructura de inferencia en tiempo real: el dataset de entrenamiento está grabado a 30 FPS, lo que fija un objetivo aproximado de 33 ms por paso de control; el modelo sirve para medir latencia real de un VLA de 4,14 B parámetros en una GPU concreta, aunque el autor no publica esas mediciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación con la plantilla vacía y la indicación explícita: "_No evaluation results have been provided for this policy yet._" No hay tasas de éxito en robot real, número de ensayos por tarea ni datos de MMLU, HumanEval, GSM8K u otros, ya que no son benchmarks aplicables a una política de control robótico.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16/FP16, los 4.143.404.816 parámetros ocupan aproximadamente 8,3 GB, más activaciones, búferes de las cinco imágenes de 224x224 y el estado; una estimación razonable de trabajo se sitúa en el rango de 10-12 GB. En FP32 serían unos 16,6 GB de pesos. No hay cuantizaciones publicadas que reduzcan estos valores.
- GPU recomendadas: cualquier GPU con 16 GB o más de memoria resulta adecuada para BF16, por ejemplo RTX 4090 (24 GB), RTX 3090 (24 GB), RTX 4080 (16 GB) o A100/H100 (40/80 GB) en caso de necesitar margen o ejecutar variantes sin cuantizar.
- Cabe en GPU de consumo: sí, en modelos de 16 GB o más con pesos en BF16. En GPU de 12 GB el encaje es ajustado y no hay versiones cuantizadas oficiales que lo garanticen; en 8 GB no se puede asumir su funcionamiento con los datos disponibles.
- Opciones de despliegue: la única vía documentada es LeRobot, mediante `lerobot-rollout` para ejecutar la política sobre el robot y `lerobot-train` para entrenar o ajustar. El repositorio declara la librería `lerobot` (versión 0.6.2) y pesos en safetensors. Servidores de inferencia de texto como vLLM, TGI, llama.cpp u Ollama no aplican a este tipo de política, porque no exponen una API de chat ni un vocabulario de tokens de texto.
- Latencia y throughput: no disponible. El único dato relacionado es que el dataset se grabó a 30 FPS, lo que implica un ciclo de control objetivo de unos 33 ms, pero no se ha medido ni publicado la latencia real del modelo.
- Requisitos adicionales: hardware robótico `so_follower` calibrado y cámaras OpenCV configuradas con nombres e índices que coincidan exactamente con las claves de observación del entrenamiento (`base_0_rgb`, `left_wrist_0_rgb`, `right_wrist_0_rgb`).

## Comparativa con modelos similares

Las cifras de los modelos alternativos provienen de fuentes públicas y no están verificadas en la documentación aportada; se marcan como aproximadas.

| Modelo | Parametros | Tipo | Longitud de contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05_resting-star | 4,14 B | VLA (π₀.₅ ajustado) | No aplica / no disponible | apache-2.0 | Hugging Face, librería `lerobot` |
| lerobot/pi05_base | No disponible (mismo orden de magnitud) | VLA base π₀.₅ | No aplica / no disponible | No disponible en la información aportada | Hugging Face |
| SmolVLA (Hugging Face) | ≈450 M (aproximado) | VLA compacto | No aplica / no disponible | apache-2.0 (aproximado) | Hugging Face, librería `lerobot` |
| OpenVLA | ≈7 B (aproximado) | VLA basado en Llama-2 + codificadores visuales | No aplica / no disponible | Licencia comunitaria tipo Llama 2 (aproximado) | Pesos abiertos en Hugging Face |
| π₀ (Physical Intelligence / OpenPI) | ≈3 B (aproximado) | VLA con experto de acciones | No aplica / no disponible | apache-2.0 (aproximado) | Repositorio OpenPI |

Consideraciones de la comparación: pi05_resting-star es el único de los modelos listados que está especializado en una tarea concreta y con un dataset publicado; SmolVLA es la alternativa más ligera dentro del ecosistema LeRobot y la más viable en GPU de gama media; OpenVLA es el más pesado y con licencia menos permisiva; y π₀ es el antecesor directo del método. No se dispone de comparaciones de rendimiento entre ellos, porque no hay tasas de éxito publicadas para este modelo.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay ensayos en robot real ni tasa de éxito, de modo que la fiabilidad del modelo es desconocida y no puede asumirse que la tarea funcione en producción.
- Sobreajuste a un dominio muy estrecho: 50 episodios y 16.768 fotogramas para una sola tarea. Es esperable un rendimiento pobre ante cambios de posición, iluminación, fondo, color u objetos distintos, aunque no hay datos que lo cuantifiquen.
- Riesgo de alucinación en sentido robótico: al ser una política entrenada por imitación, puede generar trayectorias plausibles pero incorrectas cuando la observación queda fuera de la distribución de entrenamiento; no existe ningún mecanismo declarado de detección de incertidumbre.
- Inconsistencia en la model card: la sección de detalles declara una única cámara `overhead`, mientras que la tabla de entradas lista tres cámaras RGB (base y dos de muñeca) más dos entradas `empty_camera_0` y `empty_camera_1`, presumiblemente marcadores vacíos. Esta discrepancia obliga a verificar los nombres y el número de cámaras antes de desplegar.
- Dependencia estricta del hardware: requiere un robot `so_follower` calibrado y cámaras cuyos nombres coincidan con las claves de observación; cualquier desviación en la configuración invalida la política.
- Idiomas: no se especifica ningún idioma soportado y la instrucción de tarea registrada está en inglés; no hay evidencia de que funcione con instrucciones en castellano ni en otros idiomas.
- Cuantización: no se publican pesos en GGUF, INT8, INT4 ni similares, por lo que no se puede reducir el consumo de memoria sin convertir los pesos por cuenta propia y asumir el riesgo de degradación.
- Licencia: apache-2.0 permite uso comercial y modificación sin restricciones de licencia, pero no transfiere ninguna garantía sobre el comportamiento del modelo; además, al derivar de `lerobot/pi05_base`, conviene revisar los términos del modelo base y del método original.
- Madurez y soporte: 0 descargas y 0 *likes*, autor individual y sin historial de mantenimiento; no hay issues, demos ni documentación adicional más allá de la model card y de la documentación general de LeRobot.
- Fechas anómalas: los metadatos indican creación el 2026-09-15 y un dataset fechado el 2026-09-06, lo que debe tenerse en cuenta al citar o versionar el recurso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OzodbekAImarkaz/pi05_resting-star
- Dataset de entrenamiento: https://huggingface.co/datasets/OzodbekAImarkaz/resting-star_20260906_134338
- Visualizador del dataset (LeRobot Spaces): https://huggingface.co/spaces/lerobot/visualize_dataset?path=OzodbekAImarkaz/resting-star_20260906_134338
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI (Physical Intelligence): no disponible en la información proporcionada
- Guía de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y despliegue: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los enlaces listados proceden de la información de Hugging Face y de la propia model card.
