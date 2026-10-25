# IkerAzurmendi/act-pick-v3-1-2-pieces-30000

## Resumen

`act-pick-v3-1-2-pieces-30000` es una política de imitación robótica entrenada con el método ACT (Action Chunking with Transformers) sobre el brazo SO-101, publicada por el usuario IkerAzurmendi en Hugging Face bajo licencia Apache 2.0. Resuelve una tarea muy concreta: coger una pieza de una caja y sostenerla frente a la cámara. La entrada son dos cámaras (frontal y de muñeca) más las seis posiciones articulares del brazo; la salida es un trozo de 90 objetivos articulares futuros a 30 fps, es decir, 3 segundos de trayectoria por inferencia.

El modelo tiene 51.658.374 parámetros y un repositorio de 0,2 GB en safetensors, con la librería LeRobot como formato de carga. Se entrenó con 331 episodios a 30 fps, con una o dos piezas en la caja al inicio, secuencias de 5 a 15 segundos y un filtrado explícito de tomas defectuosas. La receta es la función `train()` de LeRobot con batch 8, chunk 90, 30 pasos de acción por replanificación, aumento de imagen por defecto y semilla 1000.

Su relevancia es metodológica más que de rendimiento: es el checkpoint de 30.000 pasos de una comparativa de recetas de entrenamiento (v2, v3, super, strict, chunk 60, una sola pieza), y el propio autor advierte de que no es el mejor checkpoint de su ejecución (el mejor es el de 18.000 pasos). Se publica por completitud, no como modelo recomendado para despliegue.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): política de imitación visomotora con salida en trozos de acciones |
| Parámetros totales | 51.658.374 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como contexto de texto. Ventana de observación: cámara frontal + cámara de muñeca + 6 posiciones articulares; horizonte de predicción de 90 acciones a 30 fps (3 s) |
| Tipos de cuantización | No disponible; solo se publican pesos en safetensors sin variantes cuantizadas |
| Idiomas soportados | No aplica (modelo de robótica sin interfaz de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`, pipeline `robotics`) |
| Tamaño del repositorio | 0,2 GB |
| Frecuencia de control | 30 fps; replanificación cada 30 pasos de acción (1 s) |
| Entradas | Imagen de cámara frontal, imagen de cámara de muñeca, 6 posiciones articulares |
| Salida | Chunk de 90 objetivos articulares |

## Arquitectura y entrenamiento

ACT es un método de clonación de comportamiento basado en transformer que predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que reduce el error de acumulación típico del control paso a paso. En este caso la política consume dos flujos de imagen y el estado propioceptivo del brazo, y emite 90 consignas articulares que se ejecutan a 30 fps, con replanificación cada 30 pasos. La model card no detalla el número de capas, dimensión oculta, número de cabezas ni si se emplea el componente CVAE habitual de ACT, por lo que esos datos deben considerarse no disponibles.

El entrenamiento usó 331 episodios a 30 fps, de 5 a 15 segundos, con una o dos piezas en la caja al inicio (todas las sesiones del 24 de octubre más 12 episodios del 23 de octubre). El filtrado exige un hueco de arranque de como máximo 20 grados, como mucho 3 segundos de inactividad en cada extremo y al menos una apertura de pinza; las tomas malas conocidas se eliminaron. La receta es `train()` de LeRobot con batch 8, chunk 90, 30 pasos de acción por replanificación, aumento de imagen por defecto y semilla 1000. No se documenta uso de RLHF, DPO ni ninguna etapa de refuerzo: es clonación de comportamiento supervisada sobre demostraciones.

## Capacidades

- Generación de acciones motoras: produce un chunk de 90 objetivos articulares a 30 fps para el brazo SO-101 (horizonte de 3 segundos).
- Percepción visual multimodal: procesa simultáneamente imagen de cámara frontal e imagen de cámara de muñeca, con aumento de imagen durante el entrenamiento.
- Condicionamiento propioceptivo: integra las 6 posiciones articulares actuales como parte de la observación.
- Ejecución de una tarea única y específica: coger una pieza de la caja y sostenerla frente a la cámara, con una o dos piezas presentes al inicio del episodio.
- Control con replanificación periódica: 30 pasos ejecutados por cada inferencia, lo que da 1 segundo de autonomía entre replanificaciones.
- No soporta tool calling ni function calling: no es un modelo de lenguaje y no expone interfaz de herramientas.
- No soporta comportamiento de agente, razonamiento multi-paso simbólico ni planificación de tareas de alto nivel.
- No tiene capacidades multilingües, de texto, de código, matemáticas, audio ni modo de razonamiento explícito.

## Casos de uso

- Automatización de picking en una celda SO-101: el modelo recibe las dos cámaras y el estado articular y devuelve la trayectoria de agarre y elevación de la pieza; encaja porque la tarea, el efector y la frecuencia de 30 fps coinciden exactamente con los del entrenamiento.
- Baseline de comparación de recetas de entrenamiento: sirve como referencia de 30.000 pasos frente a los checkpoints de 6.000, 12.000, 18.000 y 24.000 de la misma ejecución, con la misma métrica offline de error articular absoluto medio.
- Punto de partida para fine-tuning con nuevos objetos o posiciones de caja: al estar en formato LeRobot y licencia Apache 2.0, se puede reentrenar con un dataset propio manteniendo el chunk de 90 y la frecuencia de 30 fps.
- Validación de infraestructura de inferencia: útil para medir latencia real de un pipeline LeRobot con dos cámaras USB y un brazo SO-101 antes de invertir en un dataset mayor.
- Docencia e investigación en imitación: ejemplo reproducible de clonación de comportamiento con partición train/held-out documentada y métrica de referencia trivial ("quedarse quieto", error 20,71).
- Ablaciones de hiperparámetros: al existir variantes con chunk 60, subconjuntos "strict" y "super", permite estudiar el efecto del tamaño de chunk y del filtrado de datos sobre el error offline.
- Generación de trayectorias de referencia sin hardware: el bloque de 90 acciones puede usarse para analizar distribuciones de movimiento o como dato sintético en pruebas de simuladores, aunque no se ha validado su transferencia.

## Benchmarks y rendimiento

Evaluación offline sobre 16 episodios retenidos (12 de `so101-pick-cube_20261024_181939` con una pieza y 4 de `so101-pick-cube_20261024_144537` con dos piezas). Métrica: error articular absoluto medio sobre el chunk predicho, menor es mejor. Baseline de "quedarse en las posiciones articulares actuales": 20,71.

| Checkpoint de esta ejecución | Error | Mejora sobre el baseline |
|---|---|---|
| 6.000 pasos | 15,86 | 23% |
| 12.000 pasos | 15,89 | 23% |
| 18.000 pasos | 15,35 | 26% |
| 24.000 pasos | 15,73 | 24% |
| 30.000 pasos (este modelo) | 16,38 | 21% |

Comparación con los mejores checkpoints del resto de ejecuciones de la misma ronda:

| Ejecución | Episodios de entrenamiento | Mejor checkpoint | Error | Mejora sobre baseline | Repositorio |
|---|---|---|---|---|---|
| super (todos los datos que pasan calidad) | 398 | 6k | 15,16 | 27% | act-pick-v3-6000 |
| strict (6-12 s, calidad estricta) | 205 | 2,4k | 15,14 | 27% | act-pick-v3-strict-2400 |
| receta v3 con episodios de 1-2 piezas | 331 | 18k | 15,35 | 26% | act-pick-v3-1-2-pieces-18000 |
| v2 (anterior) | 278 | 6k | 15,36 | 26% | act-pick-v2-6000 |
| chunk 60 (baseline propio 16,23) | 331 | 4,8k | 11,94 | 26% | act-pick-v3-chunk60-4800 |
| solo una pieza | 292 | 9,6k | 15,47 | 25% | act-pick-v3-1piece-9600 |
| solo sesiones recientes | 100 | 12k | 16,87 | 19% | act-pick-v3-recent-12000 |
| primera ejecución | 165 | 6k | 16,87 | 19% | act-pick-* |

No hay resultados en robot, ni de tasa de éxito de agarre, ni de benchmarks estándar de robótica (por ejemplo, simuladores tipo LIBERO o Meta-World). El propio autor indica que el error offline no permite predecir qué modelo agarra mejor y que ninguno de ellos se ha probado sobre el robot físico.

## Requisitos de hardware

- VRAM estimada para los pesos: unos 197 MiB en fp32 (51,66 M de parámetros) y unos 98 MiB en fp16; el repositorio de 0,2 GB es coherente con pesos en fp32. El consumo real lo dominan el preprocesado de dos flujos de vídeo y el runtime de PyTorch, no el modelo.
- GPU recomendadas: no hay requisitos publicados. Por tamaño, cualquier GPU con 2 GB o más de VRAM es suficiente para alojar los pesos; una RTX 4090, RTX 3090 o A100 están sobradamente dimensionadas, y una RTX 3060 o una Jetson Orin son opciones razonables para montar la inferencia junto al brazo.
- Cabe en GPU de consumo: sí, con cualquier tarjeta moderna de más de 2 GB; la viabilidad a 30 fps depende del coste de codificar dos imágenes por paso y no está documentada.
- Opciones de despliegue: LeRobot con PyTorch es la vía soportada (la model card usa `train()` de LeRobot). No se documentan exportaciones a ONNX, TorchScript ni TensorRT. vLLM, llama.cpp, TGI y Ollama no aplican a este tipo de política.
- Latencia y throughput: no disponibles. No se publican tiempos de inferencia por chunk, FPS efectivos en ninguna GPU ni comparativas de latencia con otras recetas.

## Comparativa con modelos similares

| Modelo | Parámetros | Chunk / horizonte | Error offline | Episodios | Licencia | Estado |
|---|---|---|---|---|---|---|
| act-pick-v3-1-2-pieces-30000 (este) | 51.658.374 | 90 (3 s a 30 fps) | 16,38 | 331 | Apache 2.0 | Publicado, sin probar en robot |
| act-pick-v3-strict-2400 | No disponible | 90 | 15,14 | 205 | No disponible | Mejor de su ejecución |
| act-pick-v3-6000 (super) | No disponible | 90 | 15,16 | 398 | No disponible | Mejor de su ejecución |
| act-pick-v3-1-2-pieces-18000 | No disponible | 90 | 15,35 | 331 | No disponible | Mejor de la misma ejecución |
| act-pick-v3-chunk60-4800 | No disponible | 60 (2 s a 30 fps) | 11,94 (baseline 16,23) | 331 | No disponible | No comparable directamente por cambio de baseline |

Las alternativas son del mismo autor y la misma tarea, por lo que la comparación es interna a la campaña de experimentos. No se han identificado en la información disponible políticas ACT públicas comparables sobre SO-101 para esta tarea concreta.

## Limitaciones y advertencias

- No es el mejor checkpoint de su ejecución: el de 18.000 pasos obtiene 15,35 frente a 16,38 de este, un 6,7% menos de error. Se publica por completitud.
- El modelo nunca se ha evaluado sobre el robot físico. No existen datos de tasa de éxito, precisión de agarre ni robustez real; la única métrica es el error articular offline.
- El error offline no correlaciona necesariamente con la calidad del agarre, tal y como advierte el autor. Un mejor número no implica mejor comportamiento en la celda.
- Sobreajuste tras una pasada sobre los datos: todas las ejecuciones empeoran después de aproximadamente una época, lo que sugiere que el tamaño del dataset (331 episodios) es el factor limitante.
- Tarea única y fuertemente condicionada: una o dos piezas en la caja, cámara frontal y de muñeca en posiciones fijas, brazo SO-101. Cambios de iluminación, fondo, posición de cámara u objeto quedan fuera de la distribución de entrenamiento.
- Sesgo de operador y de montaje: los episodios provienen de sesiones concretas (23 y 24 de octubre de 2026) y de un único montaje, por lo que las trayectorias heredan los sesgos del demostrador.
- Sin capacidades de lenguaje ni de razonamiento: no se puede usar como agente, ni para tool calling, ni para interpretar instrucciones en lenguaje natural.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero se distribuye sin garantías; conviene verificar la procedencia de los datos de demostración antes de un despliegue en producción.
- Ausencia de validación en simulación o en conjuntos externos: no hay evidencia de generalización más allá de los 16 episodios retenidos.

## Enlaces

- Hugging Face: https://huggingface.co/IkerAzurmendi/act-pick-v3-1-2-pieces-30000
- Checkpoint mejor de la misma ejecución: https://huggingface.co/IkerAzurmendi/act-pick-v3-1-2-pieces-18000 (referenciado en la model card como `act-pick-v3-1-2-pieces-18000`)
- Receta "super": `act-pick-v3-6000` (referenciado en la model card; no se ha verificado la URL completa)
- Receta "strict": `act-pick-v3-strict-2400` (referenciado en la model card; no se ha verificado la URL completa)
- Variante chunk 60: `act-pick-v3-chunk60-4800` (referenciado en la model card; no se ha verificado la URL completa)
- La búsqueda web realizada no devolvió resultados relacionados con el modelo: únicamente aparecieron páginas de IMDb, sin relación con robótica ni con LeRobot. No se dispone de paper, blog, repositorio ni demo adicionales verificados.
