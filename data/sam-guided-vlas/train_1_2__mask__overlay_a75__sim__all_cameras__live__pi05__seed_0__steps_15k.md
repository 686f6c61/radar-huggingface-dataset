# sam-guided-vlas/train_1_2__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0__steps_15k

# pi05: política VLA afinada con LeRobot para manipulación robótica

## Resumen

Este repositorio contiene una política de visión-lenguaje-acción (VLA) derivada de π₀.₅ (pi05) de Physical Intelligence, afinada con LeRobot sobre el modelo base `lerobot/pi05_base`. El autor es el usuario `sam-guided-vlas` y el entrenamiento es un fine-tune concreto: 15 000 pasos, batch de 16, optimizador AdamW, learning rate 5e-05, semilla 0 y LeRobot 0.6.0. El identificador del repositorio refleja una ablación de una serie de experimentos (`train_1_2__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0__steps_15k`).

El modelo resuelve un problema de imitación robótica: consume el estado propioceptivo del robot (vector de 9 dimensiones) y tres imágenes de 224×224 píxeles (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`), y produce una acción de 7 dimensiones para un brazo Franka Panda. pi05 está diseñado por Physical Intelligence para generalizar a entornos y situaciones no vistos durante el entrenamiento, y la implementación de LeRobot adapta el repositorio OpenPI de los autores.

Es relevante ahora porque publica pesos completos (4 143 404 816 parámetros, unos 4,14 millardos) bajo licencia Apache 2.0 en formato safetensors, lo que permite reproducir y comparar una ablación concreta de pi05 sobre un dataset público de 200 episodios y 30 830 fotogramas a 20 FPS, orientado a manipulación de objetos de cocina y comestibles. El repositorio no incluye resultados de evaluación y no ha recibido descargas ni valoraciones positivas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (Vision-Language-Action) basada en pi05; el detalle interno de capas, atención o mecanismo de decodificación no está disponible en la información proporcionada |
| Parámetros totales | 4 143 404 816 (≈ 4,14 millardos, dato de safetensors) |
| Parámetros activos | No aplica: la información disponible no describe una arquitectura de mezcla de expertos (MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; el repositorio distribuye pesos sin cuantizar en safetensors |
| Idiomas soportados | No disponible; las tareas del dataset están definidas en inglés (`soap dispenser`, `jam`, `jar`, `cereal`, `knife block`, `kettle`, etc.) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (tamaño del repositorio: 9,4 GB) |
| Librería | LeRobot 0.6.0 |
| Modelo base | `lerobot/pi05_base` (fine-tune) |
| Tipo de robot | Franka Panda |
| Cámaras | `agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2` |
| Entrada | `observation.state` (9,), `observation.images.*` (3, 224, 224) × 3 |
| Salida | `action` (7,) |
| Licencia del dataset | No especificada en la información disponible |

## Arquitectura y entrenamiento

pi05 es un modelo de visión-lenguaje-acción de Physical Intelligence concebido para generalización en mundo abierto: evoluciona π₀ para generalizar a entornos y situaciones completamente nuevos. La implementación utilizada aquí procede de LeRobot, que adapta el repositorio OpenPI de los autores. La información disponible no detalla el número de capas, la dimensión oculta, el mecanismo de atención ni la longitud de contexto del modelo base, por lo que no es posible describir la arquitectura interna con mayor precisión.

El fine-tune se realizó sobre el dataset `sam-guided-vlas/train_1_2__mask__overlay_a75__sim__all_cameras__live`, con 200 episodios, 30 830 fotogramas a 20 FPS (aproximadamente 25,7 minutos de datos) y 20 categorías de tarea: `soap dispenser`, `jam`, `jar`, `cereal`, `knife block`, `kettle`, `pear`, `potato`, `sweet potato`, `scone`, `basket`, `boxed food`, `cake`, `can`, `hamburger`, `lemon`, `orange`, `spice`, `squash` y `spray`. La configuración de entrenamiento es de aprendizaje por imitación supervisada (no se menciona RLHF ni DPO): 15 000 pasos, batch de 16, AdamW, learning rate 5e-05, semilla 0. El identificador del repositorio sugiere el uso de máscaras y superposiciones (`mask__overlay_a75`) y de datos con el token `sim`, probablemente simulación, así como una estrategia guiada por SAM; sin embargo, la model card no confirma ninguno de estos extremos, por lo que deben tratarse como indicios del nombre del artefacto, no como hechos documentados.

## Capacidades

- Generación de acciones motoras: mapea observaciones multimodales a una acción continua de 7 dimensiones para un brazo Franka Panda.
- Percepción visual multi-cámara: procesa simultáneamente tres vistas de 224×224 (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`).
- Condicionamiento por instrucción de tarea en lenguaje natural: la tarea se pasa como cadena de texto (por ejemplo, `--task="soap dispenser"`).
- Uso del estado propioceptivo del robot: entrada `observation.state` de 9 dimensiones.
- Control en bucle cerrado sobre robot real mediante `lerobot-rollout`, con estrategia `base` y ejecución acotada por `--duration`.
- Manipulación de objetos de cocina y comestibles: el dataset cubre 20 categorías de objetos, incluidas frutas, envases, utensilios y alimentos blandos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; las tareas del dataset están en inglés.
- Capacidades especiales (modo de razonamiento, visión general, audio): no disponibles en la información proporcionada.

## Casos de uso

- Recogida y colocación de comestibles: la política puede ejecutar tareas de picking sobre frutas y envases (`pear`, `potato`, `orange`, `lemon`, `can`, `boxed food`) empleando las tres cámaras para localizar el objeto y el estado de 9 dimensiones para controlar la pinza. Es adecuada porque esas categorías están explícitamente presentes en los 200 episodios de entrenamiento.
- Manipulación de utensilios de cocina: tareas como `kettle`, `knife block` y `jar` implican agarres con restricciones geométricas; el modelo puede emplearse para evaluar la robustez del agarre con la vista `robot0_eye_in_hand`, que aporta la perspectiva cercana a la pinza.
- Dispensado y pulverizado: las tareas `soap dispenser` y `spray` requieren accionar un mecanismo tras un posicionamiento preciso; la política aprende la secuencia completa de aproximación y accionamiento desde demostraciones.
- Investigación en aprendizaje por imitación: sirve como punto de partida reproducible (semilla 0, 15 000 pasos, hiperparámetros documentados) para comparar variantes con y sin máscaras o superposiciones en la entrada visual.
- Estudio de sim-to-real: dado que el identificador del dataset incluye el token `sim`, el modelo puede utilizarse como política inicial para un fine-tune posterior con datos reales del mismo robot, reutilizando exactamente las mismas claves de observación.
- Automatización de líneas de clasificación y empaquetado: con las tareas `basket` y `boxed food`, el modelo puede integrarse en una celda de manipulación que recoja y deposite artículos en contenedores, siempre que la disposición de cámaras coincida con la del entrenamiento.
- Manipulación de alimentos deformables o frágiles: `jam`, `scone`, `cake` y `sweet potato` cubren objetos con geometría no rígida, un caso donde el control visual de la pinza (`robot0_eye_in_hand_2`) aporta información redundante útil.
- Evaluación comparativa de políticas VLA en robótica: al publicar pesos safetensors y configuración de entrenamiento, permite medir tasas de éxito de pi05 frente a otras políticas en la misma celda robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye un apartado de evaluación vacío con la indicación explícita de que todavía no se han proporcionado resultados para esta política: no hay tasas de éxito por tarea, ni comparaciones con otros modelos, ni métricas de simulación.

## Requisitos de hardware

- VRAM estimada para los pesos (cálculo aritmético a partir de 4 143 404 816 parámetros; no es un dato publicado por el autor):

| Precisión | Memoria de pesos (estimada) |
|---|---|
| FP32 | ≈ 16,6 GB |
| BF16 / FP16 | ≈ 8,3 GB |
| INT8 | ≈ 4,1 GB |
| INT4 | ≈ 2,1 GB |

- A esas cifras hay que sumar la memoria de activaciones y del bucle de inferencia, que procesa tres imágenes de 224×224 por paso; no se ha publicado una cifra oficial de VRAM total.
- El tamaño del repositorio (9,4 GB) es coherente con pesos en BF16 (≈ 8,3 GB) más ficheros auxiliares; este dato se ofrece como inferencia, no como confirmación del autor.
- GPU recomendadas: no disponible. No hay requisitos oficiales publicados. Por tamaño de pesos, una GPU de 16 GB o más debería alojar el modelo en BF16, y una GPU de 8 GB requeriría cuantización, que no está documentada en el repositorio.
- Cabe en GPU de consumo: probablemente en tarjetas de 16-24 GB (por ejemplo, RTX 4090) en BF16 según la estimación de pesos, aunque no hay confirmación del autor ni cuantizaciones soportadas oficialmente.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` para ejecución en robot y `lerobot-train` para reentrenamiento o fine-tune. No se documentan integraciones con vLLM, TGI, llama.cpp u Ollama, ni formatos GGUF.
- Latencia y throughput: no disponibles. Como referencia del régimen de control, el dataset de entrenamiento se grabó a 20 FPS, y el comando de ejemplo configura las cámaras de despliegue a 30 FPS, pero no se publican tiempos de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`sam-guided-vlas/...pi05__seed_0__steps_15k`) | 4 143 404 816 | No disponible | Sin resultados publicados | Apache 2.0 | Pesos en safetensors en HuggingFace |
| `lerobot/pi05_base` (modelo base) | No disponible en la información proporcionada | No disponible | No disponible | No confirmada en la información proporcionada | Público en HuggingFace |
| Otros VLA abiertos (por ejemplo, OpenVLA, pi0) | No disponible | No disponible | No disponible | No disponible | No disponible |

La búsqueda web realizada no devolvió información técnica sobre modelos comparables: los resultados se referían a una serie de televisión, a un portal de contratación pública y a una escuela de utillaje, ninguno relacionado con este modelo.

## Limitaciones y advertencias

- No hay resultados de evaluación: se desconoce la tasa de éxito real de la política en cualquiera de las 20 tareas.
- Especialización estrecha: el modelo está entrenado para un único tipo de robot (Franka Panda), con tres cámaras con nombres y posiciones concretos, entrada de estado de 9 dimensiones, imágenes de 224×224 y salida de acción de 7 dimensiones. Cualquier cambio de robot, de número de cámaras o de resolución invalida la política sin reentrenamiento.
- Volumen de datos limitado: 200 episodios y 30 830 fotogramas (≈ 25,7 minutos a 20 FPS) para 20 tareas, lo que implica pocas demostraciones por tarea y probable escasa cobertura de posiciones, iluminación y oclusión.
- Sin validación por la comunidad: el repositorio acumula 0 descargas y 0 valoraciones positivas, por lo que no hay evidencia externa de reproducibilidad.
- Procedencia de los datos no confirmada: el identificador del dataset contiene el token `sim`, lo que sugiere datos de simulación, pero la model card no lo confirma; la transferencia a robot real no está verificada.
- Riesgo físico en producción: en robótica, un fallo del modelo no se manifiesta como una alucinación textual, sino como una acción incorrecta sobre hardware real. Es imprescindible operar con límites de par, paradas de emergencia y espacio de trabajo despejado.
- Idiomas: solo se documentan instrucciones de tarea en inglés; no hay soporte multilingüe declarado.
- Licencia: el repositorio se publica bajo Apache 2.0, lo que permite uso comercial, pero conviene verificar de forma independiente las condiciones de los pesos del modelo base `lerobot/pi05_base` y de las implementaciones de OpenPI de las que deriva.
- Metadatos: las fechas de creación y actualización del repositorio (septiembre de 2026) son posteriores a la fecha habitual de consulta, lo que conviene tener en cuenta al citar el artefacto.
- Aumento de datos no documentado: la presencia de `mask__overlay_a75` en el nombre sugiere un preprocesado visual específico (máscaras y superposiciones) que no se describe en la model card; reproducir el pipeline exacto puede no ser posible con la información publicada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sam-guided-vlas/train_1_2__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0__steps_15k
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2__mask__overlay_a75__sim__all_cameras__live
- Visualizador del dataset (LeRobot): https://huggingface.co/spaces/lerobot/visualize_dataset?path=sam-guided-vlas/train_1_2__mask__overlay_a75__sim__all_cameras__live
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de π₀.₅ (pi05) de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento (imitación): https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio OpenPI (implementación de referencia de Physical Intelligence): no se proporciona URL en la información disponible; se menciona en la model card como origen de la adaptación.

Nota: la búsqueda web realizada no aportó enlaces técnicos relevantes sobre este modelo; los resultados obtenidos correspondían a contenidos sin relación (una serie de televisión, el portal SAM.gov, una página de utillaje y un máster universitario).
