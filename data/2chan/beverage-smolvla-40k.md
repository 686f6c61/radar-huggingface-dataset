# 2chan/beverage-smolvla-40k

## Resumen

Beverage SmolVLA 40k es un ajuste fino (fine-tuning) del modelo base `lerobot/smolvla_base`, un modelo de visión-lenguaje-acción (VLA) orientado a robótica y desarrollado dentro del ecosistema LeRobot de Hugging Face. El autor del ajuste es el usuario `2chan`, que lo ha entrenado para una tarea concreta: la preparación de bebidas con un robot bimanual (dos brazos) sobre una plataforma SO-101. El modelo recibe observaciones de tres cámaras (superior, muñeca izquierda y muñeca derecha), el estado del robot y una instrucción en lenguaje natural, y devuelve acciones motoras de 12 dimensiones (6 por brazo).

Con 450.046.176 parámetros (unos 450 millones) y un tamaño de repositorio de 0,9 GB en formato safetensors, es un modelo compacto pensado para inferencia en robótica de laboratorio o de escritorio, no para despliegue en servidores de gran escala. La relevancia actual radica en que los modelos VLA pequeños como SmolVLA acercan la robótica manipulativa basada en lenguaje a hardware asequible, y este checkpoint concreto demuestra el flujo de trabajo típico: partir de un modelo base preentrenado y especializarlo con un dataset de demostraciones para una tarea acotada.

La ficha se basa únicamente en la información disponible en Hugging Face; el autor no ha publicado resultados de benchmarks ni métricas de éxito físico, y la propia model card advierte de que la subida no establece rendimiento real en robot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, basada en el ecosistema LeRobot); detalles internos de capas no disponibles |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea se pasan como texto; idioma de entrenamiento no especificado) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `lerobot/smolvla_base`, un VLA del ecosistema LeRobot que combina un codificador visual, un codificador de lenguaje y un decodificador de acciones. La model card no detalla la arquitectura interna (número de capas, dimensión oculta, mecanismo de atención), por lo que esos datos no están disponibles. La entrada incluye tres cámaras (top, muñeca izquierda, muñeca derecha, mapeadas a camera1, camera2 y camera3), el estado del robot de 12 dimensiones (brazo izquierdo seguido del derecho) y una cadena de tarea. La salida son acciones de 12 dimensiones con un *action chunk size* de 50, es decir, el modelo predice secuencias de 50 acciones por paso de inferencia.

El entrenamiento se realizó en una ejecución identificada como `20261103_024412_232249` (zona horaria Asia/Seoul) y el checkpoint subido corresponde al paso 40.000. Se seleccionaron las tareas con IDs 0, 1, 2 y 4: remover (stir), verter agua, verter polvo para latte de té verde y verter polvo de café. No se especifican el número de episodios, el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; en robótica VLA el entrenamiento suele ser de imitación supervisada sobre demostraciones, pero este dato no se confirma en la información disponible. El repositorio contiene el modelo preentrenado, la configuración y los procesadores de normalización, pero no el estado del optimizador, del scheduler ni del RNG.

## Capacidades

- Control robótico bimanual: genera acciones de 12 dimensiones para dos brazos SO-101 a partir de observaciones visuales y de estado.
- Percepción visual multimodal: procesa simultáneamente tres cámaras (superior y dos muñecas).
- Condicionamiento por lenguaje natural: acepta una cadena de tarea para seleccionar el comportamiento (remover, verter agua, verter polvo de latte de té verde, verter polvo de café).
- Predicción de secuencias de acción (*action chunking*) con tamaño de chunk 50, lo que reduce la frecuencia de inferencia necesaria.
- Especialización en tareas de preparación de bebidas dentro de un entorno de laboratorio.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento general, código, matemáticas, audio ni modo "thinking"; es un modelo específico de robótica, no un LLM de propósito general.

## Casos de uso

- Automatización de preparación de bebidas en laboratorio: el modelo ejecuta secuencias de vertido y mezcla condicionadas por instrucción, adecuado para prototipos de cocina robotizada o demostraciones de investigación.
- Investigación en imitación bimanual: sirve como checkpoint de referencia para comparar políticas bimanuales sobre SO-101 y para estudiar el efecto del número de pasos de entrenamiento (40k) en la estabilidad del vertido.
- Recolección de datos y evaluación de políticas: al incluir los procesadores de normalización, se puede integrar en pipelines de LeRobot para evaluar la política sobre datasets grabados antes de probarla en hardware.
- Base para nuevos ajustes finos: al ser un fine-tune de SmolVLA, puede servir como punto de partida para otras tareas de manipulación con el mismo robot y configuración de cámaras.
- Docencia y demostraciones de VLA: su tamaño compacto (450 M parámetros, 0,9 GB) permite desplegarlo en estaciones de trabajo con una GPU de gama media para clases o talleres.
- Pruebas de integración de LeRobot: útil para validar el flujo `SmolVLAPolicy.from_pretrained` y `make_pre_post_processors` en entornos de desarrollo antes de pasar a producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de acción ni comparaciones con otros checkpoints, y advierte explícitamente de que la subida no establece rendimiento físico en robot.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450 M parámetros en precisión completa (fp32) se requieren aproximadamente 1,8 GB solo para pesos; en fp16/bf16 unos 0,9 GB; en cuantización de 8 bits unos 0,45 GB. Estas cifras son estimaciones a partir del número de parámetros, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM debería bastar para fp16; para fp32 se recomienda 6 GB o más. No se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas como RTX 3060, RTX 4060 o superiores, dado el tamaño del modelo; no confirmado por el autor.
- Opciones de despliegue: la vía documentada es la librería `lerobot` mediante `SmolVLAPolicy` y `make_pre_post_processors`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no son adecuados para un modelo de política robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 2chan/beverage-smolvla-40k | 450 M | no disponible | VLA bimanual para bebidas | no disponible | Hugging Face (lerobot) |
| lerobot/smolvla_base | no disponible en la informacion | no disponible | VLA base generalista | no disponible | Hugging Face (lerobot) |
| Otros VLA de robotica (p. ej. RT-2, OpenVLA) | no disponible en la informacion | no disponible | VLA generalistas | no disponible | no disponible |

La comparación cuantitativa con alternativas no es posible con los datos proporcionados; solo se confirma que este modelo es un fine-tune de `lerobot/smolvla_base` y que comparte su arquitectura y ecosistema.

## Limitaciones y advertencias

- Especialización estrecha: solo se entrenó con las tareas 0, 1, 2 y 4 (remover, verter agua, verter polvo de latte de té verde y verter polvo de café); fuera de ese dominio se espera un rendimiento degradado.
- Dependencia de hardware concreto: asume un robot bimanual SO-101 con tres cámaras en posiciones específicas (top, muñeca izquierda, muñeca derecha); cambiar la configuración invalida las observaciones.
- Sin métricas de rendimiento: no hay tasas de éxito ni validación física publicada; la model card advierte de que la subida no establece rendimiento real.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Riesgo de alucinación y errores de acción: como todo modelo de imitación, puede generalizar mal ante cambios de iluminación, posición de objetos o variaciones no vistas en el dataset.
- Idiomas no especificados: se desconoce en qué idioma se entrenaron las instrucciones de tarea; usar otro idioma puede degradar la selección de comportamiento.
- Sin estado de optimizador: el repositorio no permite reanudar el entrenamiento desde el paso 40.000, solo inferencia o nuevo ajuste fino.
- Sesgos: no documentados; al ser un modelo de robótica de laboratorio, los sesgos relevantes serían de distribución de escenas y objetos del dataset de entrenamiento, no de lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/2chan/beverage-smolvla-40k
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Ecosistema LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot
