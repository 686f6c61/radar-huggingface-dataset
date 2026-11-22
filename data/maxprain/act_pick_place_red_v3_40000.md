# MaxPrain/act_pick_place_red_v3_40000

## Resumen

`act_pick_place_red_v3_40000` es una política de robótica basada en Action Chunking Transformer (ACT) entrenada con la librería LeRobot 0.7.0 para un brazo robótico SO-101. Su tarea es concreta y acotada: coger el cubo rojo de una pila situada en una posición fija de la mesa y depositarlo en una caja. El modelo tiene 51.668.614 parámetros y se distribuye en formato safetensors con licencia Apache 2.0.

La política consume dos cámaras (una cenital y otra en la muñeca, ambas a 640×480 y 30 fps) junto con el estado de las seis articulaciones del brazo, y produce objetivos de posición para esas mismas seis articulaciones en bloques de 100 acciones. Fue entrenada durante 40.000 pasos sobre 33 episodios de teleoperación con el esquema leader/follower del SO-101, ejecutados con Hugging Face Jobs en una instancia `a10g-small`.

Es relevante como ejemplo de política de imitación de bajo coste para manipulación robótica de escritorio, pero conviene subrayar que no es un modelo de propósito general: no entiende colores ni generaliza a nuevas posiciones, y el propio autor advierte que la tasa de éxito no se ha medido con rigor. En el proyecto de referencia, un detector HSV sobre la cámara cenital decide qué política lanzar en cada caso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking Transformer (ACT), LeRobot 0.7.0 |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de imitación; ventana de observación de 2 cámaras + estado de 6 articulaciones) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,2 GB) |

## Arquitectura y entrenamiento

ACT (Action Chunking Transformer) es una arquitectura de imitación que predice bloques de acciones futuras en lugar de una única acción por paso, lo que reduce el error de acumulación y suaviza la ejecución. En este caso la política recibe dos flujos de imagen (cámara `top` y cámara `wrist`, 640×480 a 30 fps) y el vector de estado de las seis articulaciones, y emite bloques de 100 objetivos articulares. El entrenamiento se realizó con `lerobot-train --policy.type=act` durante 40.000 pasos sobre la instancia `a10g-small` de Hugging Face Jobs.

Los datos provienen del dataset `MaxPrain/pick_place_red_v3`: 33 episodios de teleoperación con un SO-101 leader/follower a 30 fps. La versión v3 incorpora, además de las demos base, episodios en los que la caja ya contiene cubos, de modo que la política está pensada para operar cuando la caja no está vacía. No se documenta el uso de RLHF, DPO ni de aumentación de datos más allá de la composición del dataset.

## Capacidades

- Manipulación robótica pick-and-place: agarra el cubo rojo de una posición fija de la mesa y lo deposita en una caja.
- Control de brazo de 6 articulaciones mediante predicción de bloques de 100 acciones.
- Fusión de dos vistas de cámara (cenital y de muñeca) con el estado propioceptivo de las articulaciones.
- Ejecución a 30 fps sobre el robot SO-101 follower.
- Operación con la caja parcialmente llena de cubos (característica diferencial de la v3).
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso ni procesamiento de lenguaje natural.
- No tiene capacidades multilingües ni modos de pensamiento: no es un modelo generativo de texto.
- No entiende colores: la selección del cubo correcto se delega a un detector HSV externo sobre la cámara `top`.

## Casos de uso

- Clasificación automatizada de cubos por color en un puesto de trabajo: combinando esta política con un detector HSV que seleccione la política adecuada según el color visible, se puede construir un clasificador de tres colores con tres políticas ACT independientes.
- Demostración docente de imitación robótica: el modelo sirve como ejemplo mínimo y reproducible de entrenamiento ACT con LeRobot sobre un brazo de bajo coste, con 33 episodios y 40.000 pasos como receta de referencia.
- Prototipado de pipelines de manipulación en escritorio: útil para validar la integración de cámaras, teleoperación leader/follower y despliegue con `lerobot-rollout` antes de invertir en datasets mayores.
- Automatización de una celda de pick-and-place con posiciones fijas: en entornos donde la pila de cubos y la caja están siempre en la misma ubicación, la política ejecuta la tarea sin necesidad de percepción semántica.
- Base para fine-tuning con datos propios: al estar en formato safetensors y licencia Apache 2.0, se puede reentrenar con un dataset propio de más episodios o de una mesa distinta.
- Investigación sobre corrección de altura en pilas apiladas: el autor documenta un offset manual sobre `shoulder_lift` durante el agarre, lo que convierte al modelo en un caso de estudio sobre cómo parchear limitaciones geométricas en políticas de imitación.
- Integración en un servicio de robot con agente de voz: el repositorio del proyecto incluye un servicio de robot y un agente de voz que orquestan la política, útil como referencia de arquitectura completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que la tasa de éxito no se ha medido con rigor, por lo que no existen cifras de éxito, latencia ni throughput verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en safetensors, el peso de los pesos ronda los 0,2 GB y la carga completa con activaciones es del orden de pocos GB, aunque no se documenta una cifra medida.
- GPU recomendadas: el entrenamiento se realizó en una `a10g-small` (24 GB); para inferencia no se especifica GPU concreta.
- Cabe en GPU de consumo: sí, por tamaño de parámetros, aunque no hay validación publicada en tarjetas concretas.
- El comando de ejemplo del autor usa `--device=mps`, lo que indica que la inferencia se ha probado en Apple Silicon (Metal Performance Shaders).
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` y `--policy.path=MaxPrain/act_pick_place_red_v3_40000`; el ecosistema LeRobot es la vía documentada. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de política).
- Latencia y throughput: no disponibles; la ejecución se fija a 30 fps y `--duration=12` segundos en el ejemplo, con `max_relative_target=10` como límite de movimiento relativo por paso.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto / entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `MaxPrain/act_pick_place_red_v3_40000` | 51,7 M | Pick-and-place de cubo rojo en SO-101 | 2 cámaras 640×480 + estado de 6 articulaciones | Apache 2.0 | Hugging Face, 2 descargas |
| Otras políticas ACT de LeRobot | no disponible | Manipulación genérica por imitación | no disponible | habitualmente Apache 2.0 | no disponible |
| Políticas tipo Diffusion Policy | no disponible | Manipulación por imitación | no disponible | no disponible | no disponible |
| Políticas tipo VLA (vision-language-action) | no disponible | Manipulación guiada por lenguaje | no disponible | no disponible | no disponible |

No se dispone de datos verificables de modelos comparables en la información proporcionada; la comparación cuantitativa de rendimiento no es posible.

## Limitaciones y advertencias

- La política no entiende colores: repite una trayectoria aprendida para una única posición de la mesa. Si se mueve la pila, acudirá igualmente al lugar de entrenamiento.
- Entrenada con pocas decenas de demos (33 episodios) en una sola mesa y una sola iluminación; la generalización a otros entornos es muy limitada.
- La tasa de éxito no se ha medido con rigor, por lo que no hay garantías cuantitativas de fiabilidad en producción.
- La presencia de manos o cuerpos en la imagen de la cámara `top` altera la trayectoria.
- Las pilas de varios cubos requieren un offset manual sobre `shoulder_lift` durante el agarre; sin esa corrección la altura de agarre es incorrecta.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí existe riesgo de ejecutar movimientos erróneos o inseguros ante entradas fuera de distribución.
- Sesgos conocidos: sobreajuste a la posición, iluminación y configuración de cámara del dataset de entrenamiento.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor advierte que no es un producto sanitario y que los «medicamentos» del proyecto son cubos de colores.
- No es un modelo de lenguaje: no admite instrucciones en lenguaje natural, tool calling ni razonamiento multi-paso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MaxPrain/act_pick_place_red_v3_40000
- Dataset de entrenamiento: https://huggingface.co/datasets/MaxPrain/pick_place_red_v3
- Repositorio del proyecto (código, servicio del robot, agente de voz y documentación): https://github.com/maxprain12/lucia-so101-dispensador
- LeRobot (librería): https://github.com/huggingface/lerobot
