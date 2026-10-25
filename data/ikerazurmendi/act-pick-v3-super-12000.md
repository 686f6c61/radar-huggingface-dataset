# IkerAzurmendi/act-pick-v3-super-12000

## Resumen

act-pick-v3-super-12000 es una política visomotora ACT (Action Chunking Transformer) entrenada con LeRobot para el robot SO-101 en la tarea "coger una pieza de la caja y sostenerla frente a la cámara". No es un modelo de lenguaje: recibe dos flujos de imagen (cámara frontal y cámara de muñeca) más las seis posiciones articulares del brazo, y devuelve un bloque de 90 objetivos de articulación futuros a 30 fps. Lo publica IkerAzurmendi bajo licencia Apache 2.0 y el checkpoint corresponde al paso 12.000 de la tanda "super", la que incluye todos los registros que pasan el filtro de calidad (398 episodios).

El interés del modelo es doble. Por un lado sirve como política ejecutable sobre un SO-101 real, con un tamaño reducido (51.658.374 parámetros, repo de 0,2 GB) que cabe holgadamente en una GPU de consumo y permite inferencia a 30 Hz. Por otro lado, la model card documenta una comparativa interna poco habitual en políticas robóticas: seis variantes de receta de datos, cada una con su mejor checkpoint y su error absoluto medio offline sobre 16 episodios reservados, con una línea base de "quedarse quieto" de 20,71.

Conviene leer con cuidado el contexto: 12.000 pasos no es el mejor checkpoint de su propia tanda (el de 6.000 pasos obtiene 15,16 frente a 16,08 de este), y el autor lo publica explícitamente "por completitud". Además, ninguno de los modelos de la ronda ha sido probado sobre el robot físico, de modo que el error offline no permite afirmar cuál agarra mejor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), política visomotora con chunking de acciones |
| Parametros totales | 51.658.374 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto; emite un chunk de 90 acciones a 30 fps, equivalentes a 3 s de trayectoria) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; pesos en safetensors) |
| Idiomas soportados | no disponible (no procesa lenguaje; entradas limitadas a imagen y estado articular) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Entradas | cámara frontal, cámara de muñeca, 6 posiciones articulares |
| Salidas | 90 objetivos de articulación futuros a 30 fps |
| Frecuencia de replanificación | 30 pasos de acción por replan (1 s a 30 fps) |
| Tamaño del repositorio | 0,2 GB |
| Pipeline declarado | robotics |

## Arquitectura y entrenamiento

ACT es una arquitectura transformer diseñada para imitación visomotora que predice secuencias de acciones (chunks) en lugar de una acción por paso, lo que reduce el error de acumulación y suaviza la ejecución. En este caso el chunk es de 90 objetivos articulares a 30 fps y el bucle de control replanifica cada 30 pasos de acción, es decir, se ejecuta aproximadamente un segundo de trayectoria antes de volver a consultar la política. La configuración declarada en la model card es la receta estándar de `train()` de LeRobot: batch 8, chunk 90, 30 pasos de acción por replan, aumento de imagen por defecto y semilla 1000. No se detallan en la información disponible el número de capas, dimensión oculta, tipo de encoder visual ni el esquema de RLHF/DPO (no aplicable en un pipeline de imitación supervisada).

Los datos de entrenamiento son 398 episodios de la tanda "super" de la tercera ronda: las 66 sesiones de pick-cube completas, grabadas a 30 fps y a 10 fps remuestreadas a 30 fps, con cualquier número de piezas en la caja. Cada episodio dura entre 5 y 15 s, con un hueco de arranque máximo de 20 grados, como mucho 3 s de inactividad en cualquiera de los extremos, al menos una apertura de pinza y las tomas malas conocidas eliminadas. A partir de esos rangos se puede estimar un orden de magnitud de entre 60.000 y 180.000 fotogramas (unos 70 minutos de grabación a 30 fps), aunque la cifra exacta no está publicada. Con 12.000 pasos de batch 8 se procesan 96.000 muestras, coherente con la observación del autor de que todas las tandas empeoran "después de aproximadamente una pasada sobre los datos".

La evaluación es puramente offline: error absoluto medio de las articulaciones sobre el chunk predicho, frente a la línea base de mantenerse en la posición actual (20,71). Sobre 16 episodios reservados (12 de `so101-pick-cube_20261024_181939`, con una pieza, y 4 de `so101-pick-cube_20261024_144537`, con dos), este checkpoint obtiene 16,08, un 22% por debajo de la línea base.

## Capacidades

- Ejecución de una única tarea de manipulación: coger una pieza de la caja y levantarla frente a la cámara, sobre un brazo SO-101 de seis articulaciones.
- Fusión de dos vistas (frontal y muñeca) con el estado propioceptivo del robot en cada paso de inferencia.
- Predicción de chunks de 90 acciones a 30 fps, con replanificación cada 30 pasos.
- Generalización limitada dentro de la tarea: el entrenamiento incluye cualquier número de piezas en la caja y episodios de 5 a 15 s, pero no otras tareas ni otros objetos.
- No soporta tool calling ni function calling: no hay interfaz de texto ni de herramientas.
- No soporta razonamiento multi-paso simbólico ni planificación de alto nivel; el "razonamiento" es implícito y se limita al chunk de acciones.
- Sin capacidades multilingües, de generación de texto, código, matemáticas, visión general, audio ni modo thinking.
- Sin capacidad de visión general: los encoders visuales están especializados en las dos cámaras del montaje.

## Casos de uso

- Recogida de piezas en celda de laboratorio: es su tarea nativa, con el montaje exacto de dos cámaras y el SO-101 de seis ejes; se desplegaría con el bucle de evaluación de LeRobot a 30 Hz sobre el robot real.
- Punto de partida para fine-tuning de otra tarea pick: con 51,6 M de parámetros y licencia Apache 2.0, sirve para inicializar una política sobre un objeto o una caja distintos y reentrenar con un centenar de episodios propios.
- Referencia de comparación en experimentos de curación de datos: la model card ofrece seis recetas con su mejor checkpoint y su MAE, de modo que este modelo actúa como baseline de la tanda "super" al comparar filtros de calidad, duración o número de piezas.
- Validación de latencia en hardware de borde: al requerir 30 Hz sostenidos con dos flujos de vídeo, es un banco de pruebas realista para medir si un Jetson Orin o una RTX de gama media cumplen el presupuesto de tiempo por paso.
- Docencia y reproducibilidad: la receta completa (semilla, batch, chunk, aumentos) está publicada, lo que permite reproducir el entrenamiento con LeRobot y estudiar el efecto del sobreeentrenamiento en políticas de imitación.
- Estudio de selección de checkpoint: la curva de error (15,16 en 6k, 16,08 en 12k, 16,04 en 18k, 16,36 en 24k, 16,27 en 30k) es material directo para analizar cuánto se degrada una política ACT tras una pasada sobre los datos.
- Demostraciones de manipulación en ferias o vídeos de laboratorio: el modelo es ligero (0,2 GB), arranca rápido y no necesita infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos de evaluación son el error absoluto medio offline sobre articulaciones descrito por el autor, que no es comparable con MMLU, HumanEval, GSM8K ni con métricas de éxito de agarre.

Checkpoints de esta misma tanda (16 episodios reservados, línea base "mantener posición" = 20,71; menor es mejor):

| Checkpoint | Error MAE | Mejora sobre la línea base |
|---|---|---|
| 6.000 pasos (el mejor de la tanda) | 15,16 | 27% |
| 12.000 pasos (este modelo) | 16,08 | 22% |
| 18.000 pasos | 16,04 | 23% |
| 24.000 pasos | 16,36 | 21% |
| 30.000 pasos | 16,27 | 21% |

Comparativa entre tandas (mejor checkpoint de cada una):

| Tanda | Episodios | Mejor checkpoint | Error MAE | Mejora sobre línea base |
|---|---|---|---|---|
| super (todos los datos que pasan el filtro) | 398 | 6k | 15,16 | 27% |
| strict (6-12 s, filtro estricto) | 205 | 2,4k | 15,14 | 27% |
| receta v3 sobre episodios de 1-2 piezas | 331 | 18k | 15,35 | 26% |
| v2 (anterior) | 278 | 6k | 15,36 | 26% |
| chunk 60 (línea base propia de 16,23) | 331 | 4,8k | 11,94 | 26% |
| solo una pieza | 292 | 9,6k | 15,47 | 25% |
| solo sesiones recientes | 100 | 12k | 16,87 | 19% |
| primera tanda | 165 | 6k | 16,87 | 19% |

Advertencia sobre la tabla: la fila de chunk 60 usa una línea base distinta (16,23), por lo que su MAE de 11,94 no es directamente comparable con el resto. El propio autor señala que las mejores checkpoints de las tandas principales están dentro del ruido entre sí.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 los 51,66 M de parámetros ocupan unos 207 MB; en fp16, unos 103 MB. A ello hay que sumar activaciones de los dos encoders visuales y los buffers de imagen, no cuantificados en la información disponible. El repositorio completo pesa 0,2 GB.
- GPU recomendadas: cualquier GPU con soporte CUDA moderno sirve a nivel de memoria; el requisito real es de latencia, no de capacidad. Para sostener 30 Hz con dos cámaras se recomienda RTX 4090, RTX 4080/A5000 o superiores en estación de trabajo, y Jetson Orin (AGX o NX) en robótica embebida.
- Cabe en GPU de consumo: sí, con amplio margen de memoria en RTX 3060 12 GB, RTX 4060 Ti, RTX 4070 y similares. En tarjetas de 8 GB el límite lo pondrá el pipeline de vídeo, no los pesos.
- Opciones de despliegue: LeRobot (scripts de entrenamiento y evaluación e inferencia asíncrona), PyTorch como runtime subyacente. vLLM, llama.cpp, Ollama y TGI no aplican: son servidores de modelos de lenguaje y esta política no expone una interfaz de texto. La exportación a ONNX o TensorRT no está documentada en la información disponible.
- Latencia y throughput: no disponibles. No se publican tiempos de inferencia, FPS medidos ni comparaciones de hardware. Como referencia de diseño, la política debe replanificar cada 30 pasos de acción a 30 fps, es decir, disponer de aproximadamente un segundo de cómputo por chunk para no perder el ritmo de control.

## Comparativa con modelos similares

No se dispone de información sobre políticas ACT de otros autores. La comparación posible es con las otras variantes publicadas por el mismo autor, que comparten arquitectura y montaje y difieren en la curación de datos:

| Modelo | Episodios | Chunk | Mejor checkpoint | MAE offline | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| act-pick-v3-super-12000 (este) | 398 | 90 | 6k (publicado aparte) | 16,08 en 12k; 15,16 en 6k | Apache 2.0 | HuggingFace |
| act-pick-v3-6000 | 398 | 90 | 6k | 15,16 | Apache 2.0 | HuggingFace |
| act-pick-v3-chunk60-4800 | 331 | 60 | 4,8k | 11,94 (línea base 16,23) | Apache 2.0 | HuggingFace |
| act-pick-v3-strict-2400 | 205 | 90 | 2,4k | 15,14 | Apache 2.0 | HuggingFace |

En parámetros y contexto todos son equivalentes (misma arquitectura y mismo montaje); las diferencias relevantes son la composición del dataset, el tamaño del chunk y la selección del checkpoint. Para uso práctico, act-pick-v3-6000 domina a este modelo en la métrica publicada; act-pick-v3-super-12000 tiene valor como evidencia de la curva de entrenamiento.

## Limitaciones y advertencias

- No es el mejor checkpoint de su tanda: el autor indica explícitamente que el de 6.000 pasos rinde mejor (15,16 frente a 16,08) y que este se publica por completitud. Usarlo en producción sin comparar con el de 6k es un error evitable.
- Ningún modelo de la ronda ha sido probado sobre el robot físico. El MAE offline sobre posiciones articulares no mide éxito de agarre; el autor lo advierte de forma literal.
- Tarea única y embodiment único: solo "coger una pieza de la caja y sostenerla frente a la cámara" sobre un SO-101 de seis articulaciones con dos cámaras en posiciones concretas. Cambiar la cámara, la iluminación o el robot invalida la política.
- Dataset pequeño y heterogéneo: 398 episodios de 5 a 15 s, mezclando 30 fps y 10 fps remuestreados, con distinto número de piezas. El remuestreo de 10 a 30 fps introduce interpolación en las etiquetas de acción.
- Riesgo de sobreajuste demostrado: todas las tandas empeoran tras aproximadamente una pasada sobre los datos, con el mínimo entre 2.400 y 18.000 pasos según la receta. La elección de checkpoint es crítica y no se puede extrapolar entre tandas.
- Sin evaluación de seguridad ni de robustez: no se documentan fallos de agarre, colisiones, comportamientos fuera de distribución ni pruebas con piezas no vistas.
- Sin soporte de lenguaje: no admite instrucciones en castellano, inglés ni ningún otro idioma, ni corrección mediante prompts. La adaptación requiere reentrenamiento.
- Sesgos conocidos: no disponibles. La model card no analiza sesgos de dataset (posiciones de pieza, condiciones de iluminación, sesgo de operador en las demostraciones).
- Licencia Apache 2.0: permite uso comercial y modificación con atribución y aviso de cambios; no hay cláusulas de uso aceptable específicas ni restricciones por dominio. Aun así, la responsabilidad sobre el despliegue físico y la seguridad del robot recae en quien integra.
- Se desconoce si los datos de entrenamiento son redistribuibles por separado; el repositorio solo contiene pesos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IkerAzurmendi/act-pick-v3-super-12000

No se han encontrado en la información proporcionada otros enlaces (papers, blogs, repositorios de código o demos) asociados a este modelo.
