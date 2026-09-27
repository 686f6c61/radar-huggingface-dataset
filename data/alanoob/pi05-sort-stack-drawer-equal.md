# alanoob/pi05-sort-stack-drawer-equal

## Resumen

Pi0.5 Sort, Stack and Drawer (equal) es un ajuste fino completo del modelo base pi05_base, publicado por el usuario alanoob en Hugging Face bajo la librería openpi. No es un modelo de lenguaje: se trata de un modelo visión-lenguaje-acción (VLA) orientado al control robótico, especializado en tres tareas de manipulación con un brazo Franka: ordenar cubos, apilar vasos y manipular un cajón.

El autor lo distribuye como tres checkpoints correspondientes a los pasos 30000, 40000 y 45000, cada uno con parámetros de inferencia, activos de normalización y estado de entrenamiento. El muestreo de tareas es equilibrado (1:1:1), el tamaño de lote de entrenamiento es 16, el horizonte de acción es de 20 pasos y el muestreo temporal es de 30 Hz. El guardado del paso 50000 falló por cuota de disco local y no está incluido.

Su interés práctico es doble: por un lado, documenta un flujo reproducible de ajuste fino multitarea sobre la pila openpi, con todos los artefactos de entrenamiento publicados; por otro, es un ejemplo de pesos abiertos para robótica con estado de optimizador incluido, algo poco habitual. La model card no declara licencia, idiomas ni número de parámetros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo visión-lenguaje-acción (VLA) de la familia pi0.5; la model card no detalla el backbone ni el mecanismo de generación de acciones |
| Parámetros totales | No disponible |
| Parámetros activos | No disponible; no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible; el horizonte de acción es de 20 pasos y el muestreo temporal de 30 Hz |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible (no declarada en la model card ni en los metadatos de Hugging Face) |
| Formato de pesos | Checkpoints de openpi con parámetros de inferencia, activos de normalización y estado de entrenamiento |
| Tareas | Ordenar cubos, apilar vasos y manipular un cajón (tres tareas) |
| Robot objetivo | Franka, brazo único |
| Checkpoints incluidos | Pasos 30000, 40000 y 45000 (el paso 50000 no se incluye) |
| Tamaño de lote de entrenamiento | 16 |
| Muestreo de tareas | Ponderación equilibrada 1:1:1 |
| Frecuencia de control | 30 Hz de muestreo temporal |
| Tamaño del repositorio | 134,1 GB |

## Arquitectura y entrenamiento

El modelo parte de pi05_base y se ha ajustado de forma completa (full fine-tuning), no mediante adaptadores de bajo rango. El entrenamiento cubre tres tareas simultáneas de manipulación con un brazo Franka con pesos de muestreo idénticos (1:1:1), lo que implica una única política multitarea condicionada por la observación, en lugar de tres políticas independientes. La configuración declarada incluye lote de 16, horizonte de acción de 20 pasos y muestreo temporal a 30 Hz.

La model card no especifica el número de demostraciones, el volumen de tokens o frames de entrenamiento, la composición del dataset ni si se aplicaron etapas de post-entrenamiento (por ejemplo, optimización por preferencias). Cada checkpoint incluye el estado de entrenamiento, lo que permite reanudar el ajuste o inspeccionar el optimizador; precisamente ese estado explica en buena medida los 134,1 GB del repositorio, repartidos en unos 44,7 GB por checkpoint. El guardado del paso 50000 no llegó a completarse por falta de espacio en disco.

## Capacidades

- Ejecución de políticas de manipulación robótica en tres tareas concretas: ordenar cubos, apilar vasos y manipular un cajón.
- Control multitarea con un único conjunto de pesos, con muestreo equilibrado entre las tres tareas durante el entrenamiento.
- Generación de secuencias de acciones con horizonte de 20 pasos por inferencia.
- Control a 30 Hz, adecuado para bucles de control de brazo robótico en tiempo casi real.
- Inferencia lista para despliegue: los checkpoints incluyen parámetros de inferencia y activos de normalización, sin necesidad de reconstruirlos a partir del estado de entrenamiento.
- Reanudación del entrenamiento o ajuste adicional: se publica el estado completo de entrenamiento de cada checkpoint.
- Comparación entre etapas de entrenamiento: los tres checkpoints permiten analizar la evolución de la política entre los pasos 30000 y 45000.
- Soporte de tool calling o function calling: no aplica, es un modelo de control robótico, no un modelo de lenguaje conversacional.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta ninguna capacidad de este tipo.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo de razonamiento, visión, audio): no disponibles en la model card, más allá de la naturaleza visión-lenguaje-acción del modelo base.

## Casos de uso

- Investigación en políticas multitarea: sirve como punto de partida para estudiar cómo una única política VLA absorbe tres tareas heterogéneas (clasificación y colocación de objetos, apilado y manipulación de un cajón) sin degradarse entre ellas.
- Evaluación del efecto del número de pasos de entrenamiento: con los checkpoints 30000, 40000 y 45000 es posible medir la curva de mejora y detectar saturación o sobreajuste antes de lanzar entrenamientos más largos.
- Reanudación de entrenamiento en un clúster propio: al incluir el estado de entrenamiento, permite continuar el ajuste desde el paso 45000 sin repetir el cómputo previo.
- Banco de pruebas para despliegue en Franka: la política está entrenada específicamente para un brazo Franka de un solo brazo, por lo que se puede integrar directamente en una celda de laboratorio con ese hardware.
- Estudio de interferencia y olvido catastrófico: comparar los tres checkpoints con distintas ponderaciones de tarea permite analizar cómo interactúan las tres tareas al compartir pesos.
- Validación de pipelines openpi de extremo a extremo: el repositorio contiene parámetros de inferencia y normalización, lo que facilita reproducir el flujo completo de carga, normalización y ejecución de acciones a 30 Hz.
- Generación de datos sintéticos de manipulación: ejecutando la política en simulación o en hardware se pueden recoger trayectorias etiquetadas para entrenar políticas posteriores.
- Referencia docente: ejemplo realista de tamaño y estructura de un checkpoint robótico con estado de optimizador, útil para dimensionar almacenamiento y cómputo en proyectos de robótica con aprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente enumera los pasos de entrenamiento guardados (30000, 40000 y 45000), el tamaño de lote (16), el horizonte de acción (20) y la frecuencia de muestreo temporal (30 Hz), sin tasas de éxito por tarea ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- Almacenamiento: 134,1 GB para los tres checkpoints completos; unos 44,7 GB por checkpoint si se descarga solo uno.
- VRAM de inferencia: no disponible. La model card no indica el número de parámetros del modelo base, por lo que no se puede calcular la memoria necesaria con rigor. Como referencia, el checkpoint de inferencia es una fracción del tamaño total, ya que el grueso corresponde al estado de entrenamiento.
- VRAM de entrenamiento: no disponible. Un ajuste fino completo de un VLA con lote 16, horizonte 20 y estado de optimizador de ~40 GB por checkpoint requiere GPUs de centro de datos; no se especifica el hardware utilizado.
- Presupuesto de latencia: el control a 30 Hz implica un máximo de aproximadamente 33 ms por paso de inferencia para mantener el bucle de control en tiempo real.
- GPU recomendadas: no disponibles. Para inferencia de políticas robóticas de esta familia suelen emplearse GPUs con al menos 16-24 GB de VRAM (RTX 4090, L40S, A100), pero este dato no está confirmado en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: la librería de referencia es openpi. Herramientas de servido de modelos de lenguaje como vLLM, llama.cpp, Ollama o TGI no son aplicables, ya que no se trata de un modelo generativo de texto.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alanoob/pi05-sort-stack-drawer-equal | VLA ajustado para tres tareas Franka | No disponible | Horizonte de acción 20; 30 Hz | No disponible | Pesos abiertos en Hugging Face |
| pi05_base | VLA base de la familia pi0.5 | No disponible en la información proporcionada | No disponible | No disponible | Pesos abiertos |
| Otras políticas VLA de manipulación (por ejemplo, OpenVLA o GR00T N1) | VLA para control robótico | No verificado en la información proporcionada | No disponible | No disponible | Pesos abiertos |

La información disponible no permite una comparación cuantitativa fiable: no se han publicado tasas de éxito ni métricas de referencia, y la model card del modelo base no forma parte de los datos proporcionados. Cualquier cifra sobre alternativas debería verificarse en sus respectivas fichas antes de publicarse.

## Limitaciones y advertencias

- Especialización estrecha: la política está entrenada únicamente para tres tareas sobre un brazo Franka de un solo brazo. No debe esperarse generalización a otros robots, otras morfologías ni tareas no vistas.
- Alcance limitado a manipulación: no es un modelo de lenguaje ni un asistente conversacional; no admite instrucciones en lenguaje natural genéricas ni tool calling.
- Licencia no declarada: al no especificarse licencia, no hay autorización explícita de uso comercial. Conviene contactar con el autor antes de cualquier despliegue productivo.
- Idiomas y contexto: no disponibles, lo que impide evaluar su comportamiento ante instrucciones o entradas fuera del dominio de entrenamiento.
- Sesgos: no documentados, pero al derivar de un modelo base entrenado con datos de robótica, hereda los sesgos de distribución de ese dataset (iluminación, texturas, posiciones de cámara y objetos concretos).
- Riesgo de alucinación en el sentido de acciones erráticas: como toda política aprendida por imitación, puede producir trayectorias no válidas ante cambios de iluminación, oclusiones, objetos fuera de distribución o fallos de calibración del robot.
- Reproducibilidad parcial: el paso 50000 no está incluido por un fallo de cuota de disco, por lo que la serie de checkpoints está incompleta.
- Coste de almacenamiento: 134,1 GB de repositorio, con estado de optimizador incluido, poco práctico si solo se necesita inferencia.
- Estado del arte cambiante: la ficha no incluye métricas ni comparaciones, de modo que no hay evidencia publicada de que supere a alternativas de la misma categoría.
- Despliegue en hardware real: requiere un Franka y el entorno de control correspondiente; la validación en simulación no garantiza el comportamiento en el robot físico.

## Enlaces

- Hugging Face: https://huggingface.co/alanoob/pi05-sort-stack-drawer-equal
- Repositorio openpi (referencia externa, no incluida en la información proporcionada): https://github.com/Physical-Intelligence/openpi
- Modelo base pi05_base (referencia externa, no incluida en la información proporcionada): https://huggingface.co/lerobot/pi05_base
