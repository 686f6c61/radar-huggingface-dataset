# Kaz55/act-bluev2-gs320-ac60

## Resumen

Kaz55/act-bluev2-gs320-ac60 es una política de imitación robótica entrenada con el algoritmo ACT (Action Chunking Transformer) sobre la tarea denominada bluev2, ejecutada en un montaje compuesto por un brazo UR5e y una mano DG-5F. No es un modelo de lenguaje: es un modelo de control visuotáctil que mapea observaciones multimodales (estado de las articulaciones, dos cámaras RealSense y dos sensores táctiles GelSight) a secuencias de acciones de 60 pasos. Lo publica el usuario Kaz55 como un punto más de un barrido sistemático de resolución del sensor GelSight, con 51.668.634 parámetros en formato safetensors y un repositorio de 0,2 GB.

Su relevancia es metodológica antes que de rendimiento: el modelo forma parte de una ablación controlada en la que solo varía la resolución del GelSight (aquí 320x240), manteniendo constantes el resto de factores (misma tarea, mismo dataset de 90 episodios y 101.406 fotogramas, misma semilla 1000, mismo número de pasos). Eso lo convierte en una pieza útil para estudiar cuánto aporta realmente la información táctil de alta resolución en políticas de manipulación por *behavior cloning*.

El propio autor advierte en la model card de que, en barridos anteriores (combined, blue_180ep y newblue), la pérdida de entrenamiento se mantuvo esencialmente igual en todas las resoluciones de GelSight, incluida la ausencia total de sensor táctil. Por tanto, este checkpoint debe tratarse como una comprobación de cordura del pipeline, no como evidencia de que la resolución táctil mejore el comportamiento: eso exige evaluación sobre el robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), implementación LeRobot; transformer con *action chunking* |
| Parametros totales | 51.668.634 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en el sentido de contexto de lenguaje. Ventana de predicción: chunk_size = 60 acciones, n_action_steps = 60 |
| Tipos de cuantizacion | No disponible. Los pesos publicados están en precisión completa (safetensors, ~207 MB para 51,67 M de parámetros, compatible con fp32) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | safetensors (librería lerobot) |
| Pipeline | robotics |
| Entradas | observation.state (26) + 2x RealSense 640x480 + 2x GelSight 320x240 |
| Entradas excluidas | observation.velocity y observation.effort (excluidas deliberadamente para no introducir una segunda variable en el barrido) |
| Dataset de entrenamiento | Kaz55/dg5f_ur5e_bluev2_gs320 — 90 episodios / 101.406 fotogramas |
| Pasos de entrenamiento | 100.000 pasos (~7,9 épocas), batch 8, semilla 1000 |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT, descrito originalmente en el trabajo de ALOHA (Zhao et al., 2023), es un transformer encoder-decoder con un componente de autoencoder variacional condicional (CVAE) que aprende a predecir bloques de acciones futuras en lugar de una sola acción por paso. Esta formulación de *action chunking* reduce el problema de la varianza temporal y de la acumulación de errores típica del *behavior cloning* paso a paso. En esta ficha, el modelo sigue la implementación de ACT incluida en la librería LeRobot, con un total de 51.668.634 parámetros, un chunk_size de 60 y n_action_steps de 60 (es decir, se ejecutan las 60 acciones predichas antes de volver a inferir).

El entrenamiento es de imitación supervisada sobre el dataset dg5f_ur5e_bluev2_gs320 (90 episodios, 101.406 fotogramas), durante 100.000 pasos con batch de 8 y semilla 1000, lo que equivale aproximadamente a 7,9 épocas sobre el conjunto. La model card no documenta uso de RLHF, DPO ni ningún método de optimización por preferencias, algo esperable en robótica de imitación. La innovación relevante aquí no está en la arquitectura, sino en el diseño experimental: las entradas táctiles y visuales se fijan (RealSense a 640x480 idéntico en todo el barrido, GelSight a 320x240 en este punto) y se excluyen explícitamente observation.velocity y observation.effort, que existen en el dataset, para evitar que la derivación automática de características altere la política y añada una segunda diferencia entre ejecuciones.

## Capacidades

- Generación de secuencias de acción de 60 pasos para control de un brazo UR5e equipado con mano DG-5F, a partir de observaciones visuotáctiles.
- Fusión multimodal de cuatro flujos visuales: dos cámaras RealSense (640x480) y dos sensores táctiles GelSight (320x240).
- Integración del estado propioceptivo de 26 dimensiones (observation.state) como entrada conjunta con las imágenes.
- Percepción táctil de contacto mediante GelSight, potencialmente útil para detectar deslizamiento, fuerza de agarre y geometría de la superficie en contacto.
- Aprendizaje por imitación puro (*behavior cloning*) con *action chunking*: no requiere un modelo de recompensa ni entorno simulador durante el entrenamiento.
- Compatibilidad nativa con el ecosistema LeRobot para carga, entrenamiento y evaluación.
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües, modo *thinking*, audio ni procesamiento de lenguaje natural. Son categorías no aplicables a este tipo de modelo.

## Casos de uso

- Estudio de ablación de resolución táctil: este checkpoint es el punto de 320x240 de un barrido en el que solo cambia la resolución del GelSight. Se usa para comparar la pérdida de entrenamiento y, sobre todo, la tasa de éxito en robot frente a los demás puntos del barrido, manteniendo constantes semilla, pasos y dataset.
- Punto de partida para *fine-tuning* en una tarea nueva: al ser una política ACT de 51,7 M de parámetros en formato safetensors LeRobot, se puede reentrenar sobre un dataset propio de UR5e + DG-5F partiendo de estos pesos en lugar de inicializar desde cero.
- Manipulación con realimentación táctil en laboratorio: el modelo consume dos GelSight a 320x240, de modo que puede emplearse en tareas donde el contacto importa (insertar, encajar, deslizar, agarrar objetos deformables) y comparar su comportamiento contra la variante sin sensor táctil.
- Reproducción de experimentos: al publicarse semilla, número de pasos, tamaño de batch, composición del dataset y resolución de cada cámara, el checkpoint sirve como referencia reproducible para validar un pipeline LeRobot en un montaje UR5e + DG-5F.
- Comparación ACT frente a otras políticas de imitación (por ejemplo Diffusion Policy) sobre exactamente el mismo dataset de 90 episodios y 101.406 fotogramas, usando este modelo como una de las ramas del *benchmark*.
- Validación de infraestructura de inferencia en robótica: por su tamaño reducido, es adecuado para medir latencia de política, frecuencia de control alcanzable y coste de preprocesado de cuatro flujos de imagen en una GPU de laboratorio antes de invertir en un modelo mayor.
- Docencia y práctica en robótica de imitación: su tamaño (0,2 GB de repositorio) permite distribuirlo y entrenarlo en un único nodo, lo que facilita montar prácticas sobre *action chunking* y fusión visuotáctil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta la pérdida de entrenamiento, y el propio autor advierte explícitamente de que esa pérdida se mantuvo prácticamente invariante en todos los barridos anteriores (combined, blue_180ep, newblue) con independencia de la resolución del GelSight, incluida la variante sin sensor táctil. No hay tasas de éxito, número de ensayos sobre robot, ni comparaciones numéricas con otras políticas. No se inventan cifras.

## Requisitos de hardware

- VRAM para inferencia: los pesos ocupan aproximadamente 207 MB en fp32 (51,67 M de parámetros, coherente con el repositorio de 0,2 GB). El grueso del consumo de memoria proviene de los *backbones* visuales y de procesar cuatro flujos de imagen (2 x RealSense 640x480 y 2 x GelSight 320x240) más la ventana de 60 acciones, no del transformer en sí.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM es suficiente en la práctica; una RTX 3060 de 12 GB, una RTX 4070/4080/4090 o una A100/H100 funcionan sin problema. Para este tamaño de modelo, las GPU de centro de datos no aportan ventaja significativa frente a una consumer.
- Cabe en GPU de consumo: sí, con holgura, incluso en tarjetas de gama media. No se documenta una variante cuantizada, pero dada la escala del modelo sería viable ejecutarlo en CPU para pruebas no críticas.
- Opciones de despliegue: LeRobot (PyTorch) es el marco nativo declarado por el autor. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni TensorRT; estos motores están orientados a modelos de lenguaje y no aplican directamente a una política ACT.
- Latencia y throughput: no disponibles. El único dato relacionado es el diseño de *chunking* (chunk_size = 60, n_action_steps = 60), que implica que cada inferencia produce 60 acciones antes de volver a ejecutar el modelo, lo que amortigua el coste de inferencia, pero no hay medidas publicadas de frecuencia de control ni de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / chunk | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| act-bluev2-gs320-ac60 (este) | 51.668.634 | chunk_size 60, n_action_steps 60 | No disponible | HuggingFace, 0 descargas | Punto de un barrido de resolución GelSight sobre UR5e + DG-5F |
| ACT original (ALOHA, Zhao et al. 2023) | No disponible en la información proporcionada | No disponible | No disponible | Paper y código públicos | Referencia algorítmica; la implementación LeRobot deriva de ella |
| Diffusion Policy (Chi et al. 2023) | No disponible | No disponible | No disponible | Paper y código públicos | Política de imitación alternativa basada en difusión; requiere entrenamiento propio sobre el mismo dataset para una comparación válida |
| Otros puntos del mismo barrido Kaz55 (otras resoluciones de GelSight) | No disponible | No disponible | No disponible | No verificados en la información proporcionada | Serían la comparación más directa, al compartir dataset, semilla y pasos |

No se dispone de datos verificados de parámetros, contexto ni rendimiento de los modelos comparados en la información proporcionada, por lo que la comparación cuantitativa queda como no disponible.

## Limitaciones y advertencias

- Naturaleza del modelo: no es un modelo de lenguaje ni un asistente; no genera texto, no razona simbólicamente y no admite instrucciones en lenguaje natural.
- Especialización extrema: la política está entrenada exclusivamente para la tarea bluev2 en un montaje concreto (UR5e + DG-5F, dos RealSense, dos GelSight). Fuera de esa configuración y esa distribución de escenas, su comportamiento no está garantizado.
- Evidencia empírica limitada: el autor señala que la pérdida de entrenamiento fue esencialmente idéntica en todas las resoluciones de GelSight, incluida la ausencia de sensor táctil. Esto sugiere que la pérdida no es un indicador fiable de la utilidad de la información táctil y que la evaluación válida requiere ensayos sobre el robot.
- Riesgo de sobreajuste al dataset: 90 episodios y ~7,9 épocas sobre 101.406 fotogramas implican una diversidad de demostraciones limitada; la política puede degradarse ante objetos, iluminación o posiciones no vistas.
- Fallos típicos del *behavior cloning*: acumulación de error fuera de la distribución de estados demostrados, rigidez ante perturbaciones y dificultad para recuperarse de un contacto fallido.
- Licencia: no disponible. Al no declararse términos de licencia, no puede asumirse permiso para uso comercial ni para redistribución; conviene contactar con el autor antes de cualquier uso en producción.
- Idiomas: no aplica; no obstante, tampoco hay información sobre sesgos de generalización cultural o geográfica, ya que el modelo opera sobre percepción visual y táctil en un entorno de laboratorio.
- Sesgos conocidos: no documentados explícitamente. Cualquier sesgo relevante sería el derivado de la distribución de demostraciones del dataset (iluminación, materiales, posiciones del montaje).
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin validación externa ni resultados de terceros que confirmen el rendimiento.
- Producción: no se recomienda su uso directo en un sistema comercial sin una evaluación propia sobre el robot objetivo, control de seguridad en el espacio de trabajo y verificación de la licencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kaz55/act-bluev2-gs320-ac60
- Dataset de entrenamiento: https://huggingface.co/datasets/Kaz55/dg5f_ur5e_bluev2_gs320
- Librería LeRobot: no se ha proporcionado una URL directa en la información disponible; el modelo declara library_name: lerobot
- Paper de ACT / ALOHA (referencia algorítmica): no se ha proporcionado una URL en la información disponible
- Los resultados de la búsqueda web recibidos (enlaces a páginas de soporte de YouTube) no guardan relación con este modelo y se han descartado por no ser relevantes.
