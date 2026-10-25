# IkerAzurmendi/act-pick-v3-chunk60-2400

## Resumen

`act-pick-v3-chunk60-2400` es una política de imitación del tipo ACT (Action Chunking Transformer) publicada por IkerAzurmendi para el brazo robótico de bajo coste SO-101. El modelo resuelve una tarea muy concreta: coger una pieza de una caja y sostenerla frente a la cámara. Como entradas consume dos flujos de vídeo (cámara frontal y cámara de muñeca) más las seis posiciones articulares del brazo, y como salida emite un chunk de 60 objetivos de articulación futuros a 30 fps, es decir, un plan de 2 segundos que se replanifica cada 30 pasos.

Técnicamente no es un modelo de lenguaje sino una política visomotora de 51.627.654 parámetros (unos 0,2 GB en safetensors), entrenada con la librería LeRobot sobre 331 episodios de demostración a 30 fps, con una o dos piezas por episodio y tras un filtro de calidad. El checkpoint publicado corresponde al paso 2.400 de una tirada de 12.000 pasos y, según el propio autor, no es el mejor de su ejecución (el óptimo es el de 4.800 pasos); se publica por completitud.

Su relevancia es la de todo el ecosistema LeRobot: ofrece un punto de partida reproducible y con licencia Apache-2.0 para experimentar con imitation learning en hardware asequible, y documenta de forma transparente el error offline en episodios reservados (13,13 de error absoluto medio frente a una línea base de 16,23 de "quedarse quieto", un 19% mejor). Conviene subrayar que ninguna variante de esta familia ha sido probada todavía sobre el robot real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), política de imitación transformer con predicción por chunks |
| Parametros totales | 51.627.654 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como contexto de lenguaje. Ventana de observación: 2 cámaras + 6 posiciones articulares. Horizonte de acción: 60 pasos (2 s a 30 fps), replanificación cada 30 pasos |
| Tipos de cuantizacion | No disponible. Solo se publican pesos en safetensors; no se documentan variantes cuantizadas |
| Idiomas soportados | No aplica (política robótica sin interfaz de lenguaje); no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un método de imitación supervisada que combina un encoder de observaciones (las dos imágenes de cámara y el vector de estado articular de 6 dimensiones) con un decoder transformer que predice directamente una secuencia de acciones futuras en lugar de un único paso. La predicción por chunks es la innovación clave del método: reduce el error de acumulación típico de las políticas paso a paso y aporta consistencia temporal, a cambio de cierta latencia de reacción, ya que el plan se mantiene durante 30 pasos antes de replanificar. Este checkpoint usa un chunk de 60 objetivos, deliberadamente más corto que las variantes de 90 pasos de la misma familia (2 s de plan en lugar de 3 s).

El entrenamiento se realizó con la receta `train()` de LeRobot: 331 episodios a 30 fps (la misma selección que `act-pick-v3-1-2-pieces-18000`), batch de 8, chunk 60, 30 pasos de acción por replanificación, augmentación de imagen por defecto y semilla 1000. No se menciona RLHF, DPO ni ninguna fase de ajuste por preferencias, algo esperable en una política de imitación. El autor señala un patrón sistemático en todas sus tiradas: el error offline empeora tras aproximadamente una pasada sobre los datos, de ahí que el mejor checkpoint de esta ejecución sea el de 4.800 pasos y no el final.

## Capacidades

- Generación de trayectorias articulares: produce chunks de 60 objetivos de las 6 articulaciones del SO-101 a 30 fps.
- Fusión visomotora: integra cámara frontal (cámaras del entorno) y cámara de muñeca junto con la propiocepción de las articulaciones.
- Ejecución de una tarea manipulativa concreta: coger una pieza de la caja y levantarla frente a la cámara, con variantes de una o dos piezas en el dataset.
- Control por chunks con replanificación: mantiene coherencia temporal durante 1 segundo (30 pasos) antes de recalcular el plan.
- Compatibilidad con el ecosistema LeRobot: se carga y evalúa con las utilidades estándar de la librería y el formato de dataset `so101-pick-cube`.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, diálogo multilingüe, visión general, audio ni modo "thinking". Es una política cerrada de un solo dominio.

## Casos de uso

- Recogida y presentación de piezas en un SO-101: es la tarea nativa del modelo; se usaría cerrando el bucle de control a 30 fps con las dos cámaras y publicando los 60 objetivos articulares en el driver del brazo.
- Punto de partida para fine-tuning: al estar en formato LeRobot y con licencia Apache-2.0, sirve como inicialización para nuevos datasets de pick-and-place con el mismo hardware, reduciendo el número de episodios necesarios.
- Banco de pruebas de infraestructura de control: útil para validar latencias de inferencia, sincronización de streams de cámara y temporización del replanificado a 30 fps antes de invertir en datasets propios.
- Estudio del efecto del horizonte de predicción: al existir variantes de 60 y 90 pasos de la misma familia, permite comparar estabilidad temporal frente a reactividad en un mismo montaje.
- Docencia y divulgación de imitation learning: un modelo de 51,6 M de parámetros que cabe en cualquier GPU consumer y en CPU es un ejemplo asequible de pipeline completo (datos, entrenamiento, evaluación offline).
- Generación de políticas candidatas para evaluación comparativa: puede emplearse como uno más de los checkpoints a evaluar en un protocolo de éxito de agarre, aunque requeriría validación en hardware.
- Recolección de datos con DAgger: desplegado en modo asistido, permitiría detectar estados donde la política falla y corregirlos con teleoperación para ampliar el dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, por no ser aplicables a una política robótica. El autor sí publica una evaluación offline sobre 16 episodios reservados (12 de `so101-pick-cube_20261024_181939` con una pieza y 4 de `so101-pick-cube_20261024_144537` con dos piezas), midiendo el error absoluto medio de las articulaciones sobre el chunk predicho.

| Checkpoint de esta tirada | Error medio absoluto | Mejora sobre línea base (16,23) |
|---|---|---|
| **2.400 pasos (este modelo)** | **13,13** | 19% |
| 4.800 pasos | 11,94 | 26% |
| 7.200 pasos | 12,16 | 25% |
| 9.600 pasos | 12,43 | 23% |
| 12.000 pasos | 13,04 | 20% |

Comparación con el mejor checkpoint de cada tirada de la misma familia:

| Tirada | Episodios | Mejor checkpoint | Error | Bajo línea base |
|---|---|---|---|---|
| super (todos los datos que pasan calidad) | 398 | 6k | 15,16 | 27% |
| strict (6-12 s, calidad estricta) | 205 | 2,4k | 15,14 | 27% |
| receta v3 sobre episodios de 1-2 piezas | 331 | 18k | 15,35 | 26% |
| v2 (anterior) | 278 | 6k | 15,36 | 26% |
| chunk 60 (línea base propia 16,23) | 331 | 4,8k | 11,94 | 26% |
| solo una pieza | 292 | 9,6k | 15,47 | 25% |
| solo sesiones recientes | 100 | 12k | 16,87 | 19% |
| primera tirada | 165 | 6k | 16,87 | 19% |

Advertencia del propio autor: el error de la variante de chunk 60 no es comparable con el de los modelos de 90 pasos, porque predice un horizonte más corto y su línea base es distinta (16,23 frente a las de las otras tiradas). Además, los mejores checkpoints de las tiradas principales están dentro del ruido entre sí y el error offline no permite predecir qué modelo agarra mejor.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB solo para los pesos (51,6 M de parámetros, ~0,2 GB en fp32). Contando dos streams de cámara, buffers y runtime de LeRobot/PyTorch, un presupuesto realista es de 2 a 4 GB.
- GPU recomendadas: cualquier GPU con 4 GB o más. Para entrenamiento o evaluación por lotes, una RTX 4090 o A100 acelera considerablemente, pero no son necesarias para la inferencia.
- Cabe en GPU consumer: sí, en cualquier tarjeta moderna (GTX 1650, RTX 3060, RTX 4090) e incluso en iGPU con suficiente memoria compartida. La inferencia en CPU es viable dado el tamaño.
- Opciones de despliegue: LeRobot (scripts de evaluación y bucles de control de la propia librería) sobre PyTorch. No se documentan exportaciones a ONNX, TensorRT, vLLM, llama.cpp, Ollama ni TGI; estos últimos no aplican a una política robótica.
- Latencia y throughput: no se han publicado mediciones. El requisito implícito del sistema es de 33 ms por inferencia para sostener el bucle a 30 fps, con replanificación cada 30 pasos (aproximadamente 1 vez por segundo), lo que deja margen para ejecutar el modelo en hardware modesto.

## Comparativa con modelos similares

| Modelo | Parámetros | Chunk | Episodios | Mejor error offline | Licencia | Estado |
|---|---|---|---|---|---|---|
| `act-pick-v3-chunk60-2400` (este) | 51,6 M | 60 | 331 | 13,13 (checkpoint 2,4k) | Apache-2.0 | Publicado, sin probar en robot |
| `act-pick-v3-chunk60-4800` | No disponible en la información | 60 | 331 | 11,94 | Apache-2.0 | Publicado, sin probar en robot |
| `act-pick-v3-1-2-pieces-18000` | No disponible en la información | 90 | 331 | 15,35 | Apache-2.0 | Publicado, sin probar en robot |
| `act-pick-v3-6000` (super) | No disponible en la información | 90 | 398 | 15,16 | Apache-2.0 | Publicado, sin probar en robot |

No se dispone de información sobre políticas ACT comparables de otros autores en la documentación proporcionada, por lo que la comparación se limita a los checkpoints de la misma familia publicados por IkerAzurmendi.

## Limitaciones y advertencias

- No ha sido evaluado en el robot real. El propio autor indica que el error offline no permite saber qué modelo agarra mejor; ninguna variante de la familia se ha probado en hardware.
- Tarea única y embodiment único: solo funciona con el SO-101, con esa disposición concreta de cámaras frontal y de muñeca, y con la tarea de coger una o dos piezas de la caja. No generaliza a otras tareas, objetos u orientaciones de cámara sin reentrenamiento.
- Sobreajuste temprano: en todas las tiradas el error empeora tras aproximadamente una pasada sobre los datos. Este checkpoint (2.400 pasos) es peor que el de 4.800 de la misma ejecución, por lo que no es la mejor opción ni dentro de su propia tirada.
- Métrica limitada: el error absoluto medio de las articulaciones no mide éxito de agarre, estabilidad del objeto ni calidad de la presentación a cámara; es una proxy de ajuste a las demostraciones.
- Dataset no publicado: los 331 episodios y el filtro de calidad aplicado no están documentados en detalle, lo que dificulta la reproducibilidad exacta del entrenamiento.
- Riesgo de fallo silencioso ante cambios de iluminación, fondo, posición inicial del brazo o tipo de pieza; no hay mecanismo de detección de fallo ni de recuperación.
- Sin capacidades de lenguaje, razonamiento simbólico ni tool calling; no debe presentarse como un modelo de propósito general.
- Licencia Apache-2.0: permite uso comercial y modificaciones, pero el autor no ofrece garantías y no se especifican condiciones adicionales sobre los datos de entrenamiento subyacentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IkerAzurmendi/act-pick-v3-chunk60-2400
- Checkpoint óptimo de la misma tirada: https://huggingface.co/IkerAzurmendi/act-pick-v3-chunk60-4800
- Tirada con chunk de 90 pasos sobre los mismos datos: https://huggingface.co/IkerAzurmendi/act-pick-v3-1-2-pieces-18000
- Tirada con todos los datos que pasan el filtro de calidad: https://huggingface.co/IkerAzurmendi/act-pick-v3-6000
- Librería LeRobot (referencia de la metodología): https://github.com/huggingface/lerobot
- Artículo original de ACT, "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (referencia de la arquitectura): https://arxiv.org/abs/2304.13705
