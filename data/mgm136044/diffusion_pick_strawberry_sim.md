# mgm136044/diffusion_pick_strawberry_sim

## Resumen

`diffusion_pick_strawberry_sim` es una política de robótica basada en modelos de difusión, publicada por el usuario mgm136044 en Hugging Face y entrenada con la librería LeRobot. Resuelve una tarea de manipulación concreta: coger una fresa y colocarla en un plato (instrucción `Pick the strawberry and put it on the plate.`), sobre un brazo robótico SO-101 simulado en Isaac Sim. El modelo forma parte de una comparativa interna de políticas (ACT, Diffusion y SmolVLA) entrenadas sobre el mismo conjunto de datos, lo que lo convierte en una pieza de referencia para evaluar el comportamiento de una política de difusión frente a alternativas.

El checkpoint contiene 277.840.246 parámetros en formato safetensors y el repositorio ocupa aproximadamente 1,1 GB. Se entrenó durante 100.000 pasos con batch de 8 y semilla 1000, a partir de 50 demostraciones generadas por script en simulación (no teleoperadas por humanos). No hay información pública sobre licencia, idiomas ni benchmarks, y el modelo tiene cero descargas y cero likes en el momento de redactar esta ficha.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de un pipeline LeRobot de extremo a extremo (dataset en Isaac Sim, entrenamiento de política de difusión y publicación del checkpoint) y como baseline para comparaciones entre familias de políticas de imitación en entornos simulados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de difusión (LeRobot `diffusion`), no disponible el detalle interno de la red |
| Parametros totales | 277.840.246 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (política de robótica, no modelo de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Entrada | Observaciones del robot (imágenes y estado) en entorno SO-101 / Isaac Sim |
| Salida | Acciones de control del brazo robótico |
| Dataset de entrenamiento | `mgm136044/pick-strawberry-sim_20261128_125322` (50 demos scriptadas) |
| Pasos de entrenamiento | 100.000 |
| Batch | 8 |
| Semilla | 1000 |
| Tamano del repo | 1,1 GB |

## Arquitectura y entrenamiento

El modelo es una política de imitación de tipo diffusion policy implementada en LeRobot. En lugar de predecir directamente una acción, este tipo de política aprende a generar trayectorias de acción mediante un proceso de difusión condicionado por las observaciones (típicamente imágenes de cámara y estado de las articulaciones). La información disponible no detalla la arquitectura interna de la red (backbone visual, número de pasos de difusión, horizonte de predicción ni dimensión de las acciones), por lo que esos datos deben considerarse no disponibles.

El entrenamiento se realizó sobre 50 demostraciones generadas por script en Isaac Sim para la tarea de recoger una fresa y depositarla en un plato, con 100.000 pasos, batch de 8 y semilla 1000. No se menciona uso de RLHF, DPO ni técnicas de refinamiento posteriores; se trata de aprendizaje por imitación supervisado sobre datos simulados. El autor enmarca el checkpoint dentro de una comparativa con ACT y SmolVLA sobre el mismo dataset, lo que sugiere que el interés principal es metodológico (comparación de familias de políticas) más que el rendimiento absoluto en producción.

## Capacidades

- Control de manipulación robótica: genera secuencias de acciones para un brazo SO-101 en simulación orientadas a la tarea de recoger una fresa y colocarla en un plato.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de 50 demostraciones scriptadas en Isaac Sim.
- Política de difusión: modela distribuciones multimodales de acciones, lo que en teoría permite manejar ambigüedades en la trayectoria mejor que regresores deterministas.
- Integración con LeRobot: cargable mediante la librería `lerobot` y compatible con el ecosistema de evaluación y despliegue de dicha librería.
- Entorno simulado: diseñado y validado (según la model card) en Isaac Sim, no consta validación en robot físico.
- No dispone de capacidades de lenguaje, visión general, tool calling, agentes ni razonamiento multi-step; es una política de control específica de tarea.

## Casos de uso

- Baseline en comparativas de políticas: sirve para contrastar diffusion policy frente a ACT y SmolVLA sobre el mismo dataset y tarea, tal y como plantea el autor; útil en artículos o informes internos de evaluación.
- Reproducción de pipelines LeRobot: permite reproducir de extremo a extremo un flujo de entrenamiento de política de difusión con datos simulados, desde el dataset hasta el checkpoint publicado.
- Docencia y formación en robotica de imitacion: ejemplo didáctico de cómo se entrena y publica una política de difusión con LeRobot, con hiperparámetros documentados (pasos, batch, semilla).
- Pruebas de infraestructura de simulación: validar cadenas de generación de datos en Isaac Sim y su consumo posterior por parte de un entrenador de políticas.
- Investigación en sim-to-real (fase preliminar): punto de partida para estudiar la transferencia de una política entrenada solo en simulación a un SO-101 físico, aunque el modelo no documenta dicha validación.
- Benchmarking de tareas de picking: tarea acotada y repetible (fresa a plato) que facilita medir tasas de éxito entre políticas y configuraciones de entrenamiento.
- Prototipado de agentes roboticos en entornos controlados: usar el checkpoint como política de referencia en un entorno simulado antes de invertir en datos reales de teleoperación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de trayectoria ni comparaciones numéricas con ACT o SmolVLA, pese a mencionar que forma parte de una comparativa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 277,8 M de parámetros en safetensors, los pesos en FP32 ocuparían aproximadamente 1,1 GB, por lo que la inferencia cabría en GPUs consumer con holgura, aunque no se documenta el consumo real ni el de los pasos de difusión.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería poder alojar los pesos, pero no hay datos de latencia ni de throughput.
- Cabe en GPU consumer: probablemente sí (RTX 3060, RTX 4090 y similares) por el tamaño del checkpoint, sin confirmación oficial.
- Opciones de despliegue: librería `lerobot` (formato nativo del checkpoint); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Familia | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `diffusion_pick_strawberry_sim` | Diffusion policy (LeRobot) | 277.840.246 | No aplica | No disponible | Hugging Face, 0 descargas |
| ACT (referencia en la comparativa del autor) | Action Chunking Transformer | No disponible | No aplica | No disponible | No disponible el checkpoint concreto |
| SmolVLA (referencia en la comparativa del autor) | VLA (vision-language-action) | No disponible en esta ficha | No disponible | No disponible en esta ficha | No disponible el checkpoint concreto |

No se dispone de datos de rendimiento comparativo entre estas políticas en la información proporcionada; la comparativa del autor se menciona pero no se publican resultados numéricos.

## Limitaciones y advertencias

- Entrenado exclusivamente con 50 demostraciones scriptadas en simulación; no hay evidencia de generalización a condiciones reales ni a variaciones de la tarea.
- No consta validación en robot físico (SO-101 real); el uso en producción requeriría evaluación sim-to-real previa.
- Sin licencia declarada: no se puede asumir permiso de uso comercial; es necesario contactar con el autor antes de cualquier despliegue.
- Sin información sobre sesgos, pero al ser una política específica de tarea, su comportamiento fuera de la distribución de entrenamiento (posiciones, iluminación, objetos distintos) es impredecible.
- Riesgo de sobreajuste a la tarea y al entorno de Isaac Sim concreto; la política puede fallar ante ligeros cambios en la escena.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validación externa.
- No es un modelo de lenguaje: no soporta texto, tool calling ni razonamiento; cualquier expectativa en ese sentido es incorrecta.
- Los hiperparámetros publicados (100.000 pasos, batch 8, semilla 1000) son escasos para reproducir fielmente el resultado sin el código de entrenamiento, que no se enlaza en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mgm136044/diffusion_pick_strawberry_sim
- Dataset de entrenamiento: https://huggingface.co/datasets/mgm136044/pick-strawberry-sim_20261128_125322
- LeRobot (librería): https://github.com/huggingface/lerobot
- Isaac Sim (NVIDIA): https://developer.nvidia.com/isaac/sim
