# Bohany/pi05-isaac-packing-research

## Resumen

pi05-isaac-packing-research es una colección de checkpoints de investigación derivados de π0.5 (OpenPI), un modelo de visión-lenguaje-acción (VLA) orientado a robótica manipulativa. El autor, Bohany, lo publica como material experimental del proyecto "Deferred Consolidation", entrenado sobre una mesa de empaquetado simulada en Isaac Sim. El repositorio contiene múltiples ramas de entrenamiento (unified, declutter, pick, scan, soup) con distintos pasos y especializaciones, más que un único modelo final.

La relevancia es acotada: no es un modelo listo para producción, sino un artefacto de investigación que documenta el proceso de entrenamiento de políticas robóticas multi-tarea (pick, scan, place) con anotaciones en lenguaje natural y puntos sobre imagen. El modelo base π0.5 es un VLA que combina un backbone de visión-lenguaje con un "action expert" que genera secuencias de acciones motoras.

El repositorio ocupa 405,9 GB y contiene checkpoints en formato orbax (JAX), servibles mediante el fork de OpenPI del proyecto. La model card indica explícitamente que los modelos de habilidad única publicados están en otro repositorio (`Bohany/pi05-isaac-packing`).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA basada en π0.5 (OpenPI): backbone visión-lenguaje + action expert |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (checkpoints en orbax, sin variantes GGUF/cuantizadas publicadas) |
| Idiomas soportados | no disponible (instrucciones en inglés en los demos, según la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | orbax (checkpoints JAX); `assets/` contiene las norm stats |

## Arquitectura y entrenamiento

El modelo se apoya en π0.5, la variante de OpenPI que combina un modelo de visión-lenguaje con un módulo de acción ("action expert") para producir trayectorias motoras condicionadas por instrucciones en lenguaje e imágenes. El repositorio incluye ablaciones que entrenan únicamente el action expert (`scan/pi05_isaac_scan_ae_droid`, `scan/pi05_isaac_scan2_ae_droid`), lo que confirma la separación entre backbone y experto de acción.

El entrenamiento parte de π0.5-DROID y se especializa sobre demos recogidas en una mesa de empaquetado simulada en Isaac Sim. Las ramas documentadas incluyen: un modelo unificado pick/scan/place a 24k pasos (con snapshots a 8k y 16k), una rama de localización de agarre (grip location: extremo izquierdo, centro, extremo derecho, en palabras o puntos de imagen) a 5k pasos, una rama de branching a mitad de movimiento con etiquetas de puntos dibujados (8k pasos), una rama "dot_any" donde un punto selecciona cualquier ítem (8k pasos), una rama de steering sobre caja de azúcar (3k pasos), un especialista en "push/separate the X" (2k pasos), un especialista de pick (16k pasos) y una sonda de rutas de latas de sopa (500 pasos sobre 10 demos). No se detalla el número total de tokens ni la composición completa del dataset.

Una advertencia técnica relevante: todas las demos se recogieron con ruido de acción por paso estilo DART durante el movimiento en espacio libre, por lo que los modelos reproducen un "wobble" (oscilación) de paso a paso al inicio de cada movimiento.

## Capacidades

- Manipulación robótica multi-tarea: pick, scan y place de objetos sobre una mesa simulada (modelo unificado).
- Condicionamiento por instrucciones en lenguaje natural (por ejemplo, nombrar la ubicación de agarre en palabras).
- Condicionamiento por puntos sobre imagen ("drawn-dot labels") para seleccionar ítems o ubicaciones.
- Branching a mitad de movimiento: la rama `grip_branch` permite desviar la trayectoria durante la ejecución.
- Especialización en tareas concretas: separar objetos ("separate the X"), pick, y rutas de navegación hacia latas de sopa.
- Selección de cualquier ítem mediante un punto (`dot_any`), usado como modelo de referencia para el benchmark de eventos diferidos.
- No se documentan capacidades de generación de texto libre, código, matemáticas, tool calling ni agentes conversacionales; es un modelo de política motora, no un LLM de propósito general.

## Casos de uso

- Investigación en políticas VLA: servir los checkpoints con `python scripts/serve_policy.py policy:checkpoint --policy.config=<config> --policy.dir=<step dir>` para reproducir experimentos de manipulación en Isaac Sim.
- Estudio de consolidación diferida: comparar las ramas unificadas (24k pasos) con las especializadas (pick, declutter, scan) para analizar cómo se comporta el aprendizaje multi-tarea frente al de habilidad única.
- Benchmark de eventos diferidos: emplear `dot_any/7999` como modelo de referencia en evaluaciones de selección de ítems mediante puntos.
- Análisis de localización de agarre: usar `grip_pilot/4999` para estudiar cómo el modelo interpreta descripciones verbales o puntos de imagen sobre dónde agarrar un objeto.
- Estudio de branching en mitad de movimiento: `grip_branch/7999` permite investigar la replanificación de trayectorias durante la ejecución.
- Ablación del action expert: las ramas `scan_ae` permiten medir la contribución del experto de acción frente al backbone completo.
- Prototipado de tareas de empaquetado en simulación: la rama unificada pick/scan/place sirve como base para experimentos de empaquetado antes de transferir a un robot real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de éxito, tasas de acierto ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 405,9 GB, pero ese tamaño corresponde a múltiples checkpoints de entrenamiento, no a un único modelo de inferencia.
- GPU recomendadas: no disponibles en la información proporcionada. El stack OpenPI/π0.5 se sirve habitualmente en GPUs de datacenter, pero el autor no especifica modelos concretos.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: servidor de políticas de OpenPI (`scripts/serve_policy.py`) con el fork del proyecto; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-isaac-packing-research | no disponible | no disponible | no disponible | apache-2.0 | Hugging Face (repo de 405,9 GB) |
| π0.5 (OpenPI, base) | no disponible | no disponible | no disponible | no disponible en la información | OpenPI |
| π0.5-DROID | no disponible | no disponible | no disponible | no disponible en la información | OpenPI |

No se dispone de datos cuantitativos para establecer una comparación de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Repositorio marcado como "private" y "Unreleased" en la model card: es material de investigación, no un modelo publicado para uso general.
- Ruido de acción DART en todas las demos: los modelos reproducen una oscilación de paso a paso al inicio de cada movimiento, lo que degrada la suavidad de las trayectorias.
- Entrenado exclusivamente en simulación (Isaac Sim): no hay evidencia de transferencia a robots reales.
- Alcance limitado a tareas de empaquetado sobre una mesa concreta; no es un modelo de propósito general.
- Sin datos de sesgos, alucinación o evaluación de seguridad; al ser un modelo de política motora, el riesgo principal es de ejecución física incorrecta en caso de desplegarse en hardware real.
- La licencia apache-2.0 permite uso comercial, pero el estado "unreleased" y la falta de validación desaconsejan su uso en producción.
- El tamaño del repo (405,9 GB) y el formato orbax dificultan su despliegue fuera de entornos JAX/OpenPI.
- Idiomas soportados no documentados; las instrucciones de los demos parecen estar en inglés.

## Enlaces

- Hugging Face: https://huggingface.co/Bohany/pi05-isaac-packing-research
- Repositorio de modelos de habilidad única: https://huggingface.co/Bohany/pi05-isaac-packing
- OpenPI (proyecto base): no disponible en la información proporcionada
- Paper de π0.5: no disponible en la información proporcionada
- Isaac Sim: no disponible en la información proporcionada
