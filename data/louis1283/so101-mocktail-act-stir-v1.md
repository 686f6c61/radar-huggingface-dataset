# Louis1283/so101-mocktail-act-stir-v1

## Resumen

SO101 mocktail ACT v1 es una política de control robótico entrenada con el algoritmo ACT (Action Chunking with Transformers) sobre un brazo robótico físico SO101. La desarrolla el usuario Louis1283 y se publica en Hugging Face bajo la librería LeRobot. El modelo resuelve una tarea concreta de manipulación: preparar un cóctel sin alcohol vertiendo zumo de arándano y de naranja, remover la bebida, devolver el removedor y colocar una guarnición de naranja.

El interés de esta ficha es acotado: no es un modelo de lenguaje ni un modelo fundacional de robótica, sino un checkpoint de imitación supervisada de 51,7 millones de parámetros entrenado durante 100.000 pasos sobre 54 demostraciones completas de la receta. Sirve como referencia práctica de cómo se estructura un pipeline ACT en LeRobot (pesos más procesadores de observación y acción) y como caso de estudio de las limitaciones reales de la imitación con pocos datos.

La relevancia actual es metodológica y de reproducibilidad: muestra un caso documentado en el que la política aprende de forma fiable algunas subtareas (vertido y devolución del vaso) pero falla de forma consistente en otras (removido débil o repetitivo, devolución del removedor y guarnición inconsistentes), y donde un intento posterior de fine-tuning del paso de mezcla no mejoró el resultado y degradó el agarre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; horizonte de predicción de 100 pasos de acción (action chunk) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin entrada/salida de texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repositorio LeRobot, 0,2 GB) |

## Arquitectura y entrenamiento

La arquitectura es ACT, un transformer que mapea observaciones a trozos de acciones (action chunks). La entrada son seis lecturas de articulaciones y dos imágenes RGB de 640 × 480 procedentes de una cámara de muñeca y una cámara frontal; la salida son chunks de 100 pasos de acción para las cinco articulaciones del brazo y la pinza. El repositorio incluye los pesos originales junto con los procesadores de observación y acción empleados en el entrenamiento, lo que permite reproducir el preprocesado exacto.

El entrenamiento se realizó durante 100.000 pasos sobre 54 demostraciones completas de la receta con un robot SO101 físico. No se documentan en la información disponible el número de tokens, la composición del dataset más allá de las 54 demostraciones, ni si hubo etapas de RLHF o DPO (no aplicables en este paradigma). Tampoco se detalla la configuración del optimizador, el tamaño de lote ni la estrategia de aumento de datos. El autor documenta además un intento posterior de fine-tuning específico del paso de mezcla que no produjo un removido fiable y empeoró la fiabilidad del agarre; el checkpoint publicado es el original.

## Capacidades

- Control de un brazo robótico SO101 de cinco articulaciones más pinza a partir de observaciones proprioceptivas y visuales.
- Predicción de chunks de 100 acciones, lo que reduce la frecuencia efectiva de inferencia y suaviza la ejecución.
- Vertido de líquidos desde recipientes (zumo de arándano y de naranja) con devolución del vaso en ejecuciones supervisadas.
- Removido de la bebida: capacidad presente pero limitada, con movimientos a menudo débiles o repetitivos.
- Devolución del removedor y colocación de guarnición de naranja: ejecución inconsistente.
- Entrada multimodal limitada a dos cámaras RGB de 640 × 480 y lectura de articulaciones; sin visión de profundidad ni audio.
- Sin soporte de tool calling, function calling, agentes multi-paso, razonamiento simbólico ni capacidades multilingües.

## Casos de uso

- Reproducción de experimentos de imitación con LeRobot: cargar los pesos y los procesadores incluidos para replicar el pipeline ACT sobre un SO101 y comparar curvas de éxito con variantes propias.
- Línea base para comparación de algoritmos: usar este checkpoint como referencia de ACT con 54 demostraciones frente a alternativas como Diffusion Policy o VQ-BeT en la misma tarea de mocktail.
- Estudio de fallos en imitación con pocos datos: analizar por qué el removido se vuelve repetitivo y por qué el fine-tuning de una subtarea degrada el agarre, útil para diseñar estrategias de data curation.
- Docencia en robótica de manipulación: ejemplo completo y ligero (0,2 GB) para ilustrar action chunking, procesadores de observación y evaluación supervisada en un brazo de bajo coste.
- Generación de datos sintéticos de evaluación: ejecutar la política en simulación o en hardware para recolectar trayectorias etiquetadas como éxito o fallo en cada subtarea.
- Prototipado de tareas de vertido en laboratorio: reutilizar la porción de la política que funciona de forma fiable (vertido y devolución del vaso) como componente dentro de una secuencia con control basado en reglas para el removido y la guarnición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta observaciones cualitativas en ejecuciones supervisadas: vertido y devolución de vasos exitosos, removido débil o repetitivo, y devolución del removedor y guarnición inconsistentes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 millones de parámetros en fp32 el peso ronda los 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: no disponibles; por tamaño, una RTX 3060 o superior es suficiente para el modelo, aunque el coste real lo domina el procesado de dos imágenes de 640 × 480 y el control del robot.
- Cabe en GPU consumer: sí, por el tamaño del checkpoint; no se documentan requisitos oficiales.
- Opciones de despliegue: LeRobot (librería declarada en la model card); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SO101 mocktail ACT v1 | 51,7 M | ACT, imitación supervisada | chunks de 100 acciones | no disponible | Hugging Face (LeRobot) |
| Alternativas ACT para SO101 | no disponible | ACT | no disponible | no disponible | no disponible |
| Diffusion Policy | no disponible | difusión para acciones | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables concretos en la documentación proporcionada; la comparativa queda limitada a la categoría metodológica.

## Limitaciones y advertencias

- Especialización extrema: la política solo se ha entrenado para la receta de mocktail descrita; no generaliza a otras tareas, objetos ni posiciones sin reentrenamiento.
- Removido poco fiable: el propio autor reporta movimientos débiles o repetitivos, lo que impide usar el modelo en producción para esa subtarea.
- Devolución del removedor y guarnición inconsistentes: la secuencia completa no se completa de forma fiable.
- El fine-tuning del paso de mezcla no solo no corrigió el removido, sino que degradó la fiabilidad del agarre; conviene tratarlo como evidencia de la fragilidad del ajuste con pocos datos.
- Entrenado con 54 demostraciones, un volumen bajo que limita la robustez ante variaciones de iluminación, posición de recipientes o dinámica de líquidos.
- Licencia no disponible: no puede asumirse uso comercial; es necesario contactar con el autor antes de cualquier despliegue productivo.
- Sin información sobre sesgos, alucinación (no aplica en sentido lingüístico) ni evaluación cuantitativa de éxito; las afirmaciones de rendimiento son cualitativas.
- Riesgo físico: cualquier ejecución sobre hardware real requiere supervisión, límites de par y paradas de emergencia, especialmente en tareas con líquidos y utensilios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Louis1283/so101-mocktail-act-stir-v1
- LeRobot (librería de despliegue): https://github.com/huggingface/lerobot
