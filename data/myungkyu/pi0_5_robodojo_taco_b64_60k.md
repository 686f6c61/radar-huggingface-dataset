# Myungkyu/pi0_5_robodojo_taco_b64_60k

## Resumen

pi0_5_robodojo_taco_b64_60k es una política robótica de bajo nivel (low-level policy) publicada por el usuario Myungkyu en HuggingFace. Se trata de un ajuste fino (fine-tuning) del modelo base `lerobot/pi05_base` sobre el dataset `Myungkyu/RoboDojo-taco-gemini`, compuesto por demostraciones de 8 tareas bimanuales de mesa con robot real, con 100 demostraciones por tarea y etiquetas densas de subtarea procedentes de anotación offline. El resultado es un modelo de tipo vision-language-action (VLA) especializado en control motor, no un modelo de lenguaje de propósito general.

El problema que resuelve es el control de un manipulador bimanual a partir de tres vistas de cámara en vivo (cabeza y muñecas izquierda y derecha), propriocepción y el texto de la subtarea actual. La arquitectura declarada es "Pi0.5 vanilla", sin ranura de keyframe ni atestación de memoria, lo que la sitúa como una política reactiva que depende de un planificador externo que le proporcione la subtarea en curso.

Con 4.143.404.816 parámetros y un repositorio de 9,4 GB en formato safetensors, es un modelo de investigación orientado a entornos de laboratorio con hardware robótico real. Su relevancia actual es limitada y acotada: se publica como checkpoint final de un entrenamiento de 60.000 pasos con batch 64, sin métricas de evaluación publicadas y sin validación por parte de la comunidad (0 descargas y 0 likes en el momento de la consulta).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pi0.5 vanilla (visión-lenguaje-acción, VLA); tres vistas de cámara en vivo, sin ranura de keyframe ni atestación de memoria |
| Parámetros totales | 4.143.404.816 (aproximadamente 4,14 mil millones) |
| Parámetros activos | No aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | No disponible; la entrada es multimodal (tres imágenes, propriocepción y texto de subtarea) |
| Tipos de cuantización | No disponible; el repositorio distribuye pesos en safetensors |
| Idiomas soportados | No disponible |
| Licencia | No disponible en la información proporcionada |
| Formato de pesos | safetensors (librería `lerobot`) |
| Modelo base | `lerobot/pi05_base` |
| Dataset de ajuste | `Myungkyu/RoboDojo-taco-gemini` |
| Tamaño del repositorio | 9,4 GB |
| Entrenamiento | Batch 64, 60.000 pasos, checkpoint final |
| Entradas | Imagen de cabeza + imágenes de muñeca izquierda y derecha, propriocepción, texto de subtarea actual |
| Pipeline declarado | robotics |
| Fecha de creación (según ficha) | 2026-09-11 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del backbone VLA `lerobot/pi05_base` sobre demostraciones reales de manipulación bimanual. La model card describe la arquitectura como "Pi0.5 vanilla" con tres vistas de cámara en vivo, sin ranura de keyframe y sin atestación de memoria. Las entradas son las imágenes de cabeza y de ambas muñecas, la propriocepción del robot y el texto de la subtarea actual; no hay entrada de keyframe. La salida esperada es una política de bajo nivel, es decir, acciones motoras, no texto.

El entrenamiento se realizó sobre `Myungkyu/RoboDojo-taco-gemini`, un dataset de 8 tareas long-horizon de mesa bimanual con 100 demostraciones por tarea, que según la ficha incorporan etiquetas densas de subtarea derivadas del contexto específico de la tarea (anotación offline). No se especifica el número total de tokens, la composición detallada del dataset ni si se emplearon técnicas de alineación como RLHF, DPO o RL posterior. Tampoco se documentan innovaciones técnicas adicionales más allá de las propias del backbone Pi0.5.

Un detalle operativo relevante: las configuraciones del modelo referencian el backbone y el tokenizer por identificador del Hub o por la ruta local del sitio de entrenamiento, de modo que es necesario apuntarlas a copias locales antes de cargar el modelo.

## Capacidades

- Generación de acciones motoras para control de un robot manipulador bimanual de mesa; no genera texto libre.
- Condicionamiento por instrucción de subtarea en lenguaje natural, suministrada externamente en cada paso.
- Fusión de tres flujos visuales simultáneos (cámara de cabeza y cámaras de muñeca izquierda y derecha).
- Integración de propriocepción del robot junto con las entradas visuales y textuales.
- Ejecución de tareas long-horizon descompuestas en subtareas, siempre que un planificador externo proporcione la subtarea en curso.
- Especialización en las 8 tareas de mesa bimanual presentes en el dataset de entrenamiento.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta comportamiento agéntico autónomo ni razonamiento multi-paso propio; al no tener ranura de keyframe ni memoria atestiguada, la planificación jerárquica queda fuera del modelo.
- Capacidades multilingües: no disponibles.
- No se documentan capacidades de visión generalista (descripción de imágenes, VQA) ni de audio, pese a que el modelo consume imágenes como entrada.

## Casos de uso

- Manipulación bimanual de mesa en laboratorio: el modelo recibe las tres vistas de cámara, la propriocepción y la subtarea actual, y emite acciones de bajo nivel para tareas como apilado, ordenación o ensamblaje sobre superficie de trabajo.
- Investigación en aprendizaje por imitación: sirve como punto de partida para experimentos de fine-tuning sobre nuevos datasets bimanuales, aprovechando que el pipeline de entrenamiento está documentado (batch 64, 60.000 pasos).
- Evaluación de políticas long-horizon: al estar entrenado con etiquetas densas de subtarea sobre 8 tareas de 100 demostraciones cada una, permite medir la degradación de una política reactiva al descomponer una tarea larga en pasos.
- Generación de datos y DAgger: al desplegarse sobre el robot real, sus ejecuciones pueden corregirse y reincorporarse para iterar la política, aunque no hay documentación de este flujo en la ficha.
- Ablación de componentes arquitectónicos: la ausencia explícita de keyframe y de memoria atestiguada lo convierte en una referencia útil para comparar contra variantes de Pi0.5 que sí incorporan esos mecanismos.
- Prototipado con LeRobot: los pesos están en safetensors y la librería declarada es `lerobot`, lo que facilita cargarlo dentro de un entorno de inferencia robótica ya existente, siempre que se redirijan las rutas del backbone y el tokenizer.
- Banchmarking interno de hardware: al tener un tamaño conocido (4,14 mil millones de parámetros), permite medir latencia de control y consumo de VRAM en distintas GPU dentro de un mismo montaje experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito por tarea, curvas de entrenamiento ni comparaciones cuantitativas con otras políticas. Tampoco se proporcionan métricas de latencia, frecuencia de control ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8,3 GB solo para los pesos en bf16/fp16 (4,14 mil millones de parámetros × 2 bytes); hay que sumar memoria para los codificadores de imagen, las cachés y las activaciones, por lo que una estimación razonable es de 12 a 16 GB en precisión mixta. En int8, unos 4,2 GB de pesos; en int4, unos 2,1 GB. Estas cifras son estimaciones a partir del número de parámetros, no datos publicados por el autor.
- GPU recomendadas: para trabajar con holgura en bf16, una GPU de 24 GB o más (RTX 3090, RTX 4090, L4, A10G, A100, H100). En GPU de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) el modelo podría caber en bf16 con margen ajustado.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB o más con precisión mixta, y potencialmente en 8-12 GB si se aplica cuantización, aunque no hay cuantizaciones documentadas para este checkpoint.
- Opciones de despliegue: la librería declarada es `lerobot` (inferencia en PyTorch). No aplican servidores de texto como vLLM, TGI, llama.cpp u Ollama, ya que no es un modelo generativo de lenguaje; el despliegue requiere el runtime robótico, captura de cámaras y lectura de propriocepción.
- Latencia y throughput: no disponibles. No se publican cifras de frecuencia de control ni de tiempo de inferencia para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Entradas | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| pi0_5_robodojo_taco_b64_60k | 4.143.404.816 | 3 cámaras + propriocepción + texto de subtarea | No disponible | HuggingFace, 0 descargas | Fine-tuning específico del dataset RoboDojo, sin evaluación publicada |
| lerobot/pi05_base | No disponible en la información proporcionada | No disponible en la información proporcionada | No disponible en la información proporcionada | HuggingFace | Modelo base del que deriva este ajuste |
| lerobot/pi0 | No disponible en la información proporcionada | No disponible en la información proporcionada | No disponible en la información proporcionada | HuggingFace | Generación anterior de la familia Pi0 dentro de LeRobot; comparación no verificada en la información disponible |
| Otras políticas VLA de la librería LeRobot (por ejemplo SmolVLA) | No disponible en la información proporcionada | No disponible en la información proporcionada | No disponible en la información proporcionada | HuggingFace | Alternativas de la misma categoría; los datos no se han verificado en la información proporcionada |

La búsqueda web realizada no devolvió información técnica sobre este modelo ni sobre alternativas comparables, por lo que las celdas no documentadas se marcan explícitamente como no disponibles.

## Limitaciones y advertencias

- Sesgo de dominio severo: el ajuste se limita a 8 tareas de mesa bimanual con 100 demostraciones cada una, sobre un montaje concreto de robot, iluminación, cámaras y disposición de objetos. La transferencia a otras configuraciones no está evaluada.
- Riesgo de comportamiento errático fuera de distribución: al ser una política motora, los fallos no se manifiestan como alucinación textual, sino como acciones incorrectas o inseguras ante objetos, posiciones o texturas no vistas durante el entrenamiento.
- Dependencia de un planificador externo: el modelo consume el texto de la subtarea actual, pero no la infiere. Sin un sistema externo que descomponga la tarea y emita subtareas, el modelo no puede operar en tareas long-horizon por sí solo.
- Ausencia de memoria y de keyframe: la propia ficha indica que no hay ranura de keyframe ni atestación de memoria, lo que limita la coherencia temporal en tareas largas y dificulta la recuperación tras errores.
- Licencia no disponible: al no figurar la licencia, no puede asumirse uso comercial. Además, el modelo deriva de `lerobot/pi05_base`, cuya licencia debería verificarse de forma independiente antes de cualquier uso en producción.
- Configuración no portable directamente: las configuraciones apuntan al backbone y al tokenizer por identificador del Hub o por rutas locales del sitio de entrenamiento; es imprescindible redirigirlas a copias locales antes de cargar el modelo.
- Sin validación externa: 0 descargas y 0 likes en el momento de la consulta, sin benchmarks ni tasas de éxito publicadas. No debería emplearse en producción sin una evaluación propia.
- Idiomas soportados no documentados: se desconoce en qué idioma deben formularse las subtareas y si el modelo responde a variaciones lingüísticas.
- Tamaño de repositorio elevado (9,4 GB), lo que condiciona el almacenamiento y la transferencia en entornos con ancho de banda limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Myungkyu/pi0_5_robodojo_taco_b64_60k
- Dataset de ajuste: https://huggingface.co/datasets/Myungkyu/RoboDojo-taco-gemini
- Modelo base: https://huggingface.co/lerobot/pi05_base
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos correspondían a un comercio de moda y no guardan relación con la ficha.
