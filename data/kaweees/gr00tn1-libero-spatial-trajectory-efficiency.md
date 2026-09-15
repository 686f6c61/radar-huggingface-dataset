# kaweees/gr00tn1-libero-spatial-trajectory-efficiency

## Resumen

Este repositorio no contiene un modelo único, sino una campaña de fine-tuning del modelo base `nvidia/GR00T-N1-2B`, publicada por el usuario kaweees bajo el identificador `kaweees/gr00tn1-libero-spatial-trajectory-efficiency`. El objetivo declarado es medir la eficiencia en el uso de datos: se entrena el mismo modelo base desde cero con subconjuntos anidados de 5, 10, 15, 25 y 50 trayectorias de demostración del benchmark LIBERO Spatial, con semilla fija 42, y se publican los checkpoints de cada epoch (`n1/trajectories-NNN/epoch-EEE/`). Cada checkpoint es cargable de forma independiente e incluye pesos, configuración, procesadores, estadísticas de normalización de Spatial, mapeos de embodiment, código de ejecución y manifiestos de entrenamiento y evaluación, pero no estado del optimizador.

El modelo subyacente, GR00T N1 en su variante de 2B parámetros, es un modelo visión-lenguaje-acción (VLA) de NVIDIA orientado a control robótico, según la información pública del modelo base referenciada en la ficha. Este derivado hereda por tanto ese perfil: no es un modelo de chat ni un LLM de propósito general, sino una política que produce acciones motoras a partir de observaciones visuales e instrucciones en lenguaje natural, evaluada aquí exclusivamente en simulación.

Su relevancia actual es metodológica más que de producto: cuantifica cuántas demostraciones hacen falta para que un VLA de 2B parámetros alcance un rendimiento mínimo en una tarea de manipulación espacial, y publica la curva completa de checkpoints para su reproducción. Los resultados publicados son muy modestos (0/20 aciertos con 5 trayectorias, 1/20 con 10, 11/20 con 25 y 9/20 con 50) y la ejecución de 15 trayectorias sigue pendiente, por lo que debe considerarse material de investigación, no un artefacto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la ficha del derivado; deriva de `nvidia/GR00T-N1-2B` (modelo visión-lenguaje-acción) |
| Parametros totales | Aproximadamente 2 000 millones, según el identificador del modelo base (`GR00T-N1-2B`); no se explicita en la ficha del derivado |
| Parametros activos | No aplica: no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no se documentan variantes GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | No disponible |
| Licencia | No disponible en la ficha del derivado; consultar la licencia del modelo base `nvidia/GR00T-N1-2B` antes de cualquier uso |
| Formato de pesos | Safetensors (etiqueta `safetensors` del repositorio) |
| Modelo base | `nvidia/GR00T-N1-2B` (fine-tune, no fusión ni adaptador) |
| Tamano del repositorio | 128,0 GB |
| Checkpoints publicados | 20 epochs guardados en 4 ejecuciones (3 + 5 + 6 + 6); ejecucion de 15 trayectorias pendiente |
| Contenido por checkpoint | Pesos, configuracion, procesadores, estadisticas de normalizacion de Spatial, mapeos de embodiment, codigo de runtime, manifiestos de entrenamiento/evaluacion y recibo de verificacion de subida; sin estado del optimizador |
| Fecha de creacion | 2026-09-15 |
| Ultima actualizacion | 2026-09-15 |

## Arquitectura y entrenamiento

La ficha del derivado no describe la arquitectura interna. La documentación pública del modelo base `nvidia/GR00T-N1-2B` describe un esquema de dos sistemas para modelos visión-lenguaje-acción: un componente tipo VLM que interpreta las observaciones visuales y la instrucción en lenguaje natural, y un módulo de generación de acciones que produce las trayectorias motoras. Esta descripción corresponde al modelo base y no está verificada en la información proporcionada sobre este derivado, por lo que debe tratarse como contexto orientativo. El repositorio se etiqueta con `gr00t` y `libero-spatial`, y los checkpoints incluyen procesadores, estadísticas de normalización de Spatial y mapeos de embodiment, lo que confirma que se trata de una política visomotora condicionada por observaciones de ese entorno y no de un modelo generativo de texto.

En cuanto al entrenamiento, la ficha es explícita en el protocolo: cada ejecución parte del modelo base oficial de NVIDIA fijado (pinned), usa semilla 42 y subconjuntos anidados y compartidos de trayectorias entre versiones de GR00T. Los tamaños de subconjunto son 5, 10, 15, 25 y 50 trayectorias totales. Cada epoch se evalúa con 20 rollouts sobre la tarea 0 de LIBERO Spatial y el entrenamiento se detiene tras dos epochs consecutivos sin mejora estricta del mejor recuento de éxitos (los empates no cuentan como mejora), sin límite fijo de epochs. No se publica el número de tokens, la composición del dataset más allá del subconjunto de LIBERO Spatial, ni si hubo RLHF, DPO u otra fase de alineamiento; no se incluye estado del optimizador, lo que impide reanudar el entrenamiento exactamente desde los checkpoints publicados. La ficha menciona que se eliminaron fragmentos de pesos planos de 15 trayectorias de una publicación anterior incompleta.

## Capacidades

- Generación de acciones motoras: produce trayectorias de control a partir de entradas visuales e instrucciones, en línea con el modelo base VLA del que deriva.
- Manipulación robótica en simulación: los checkpoints están entrenados y evaluados sobre el benchmark LIBERO Spatial, con estadísticas de normalización específicas de ese entorno.
- Adaptación a distintos embodiments: los checkpoints incluyen mapeos de embodiment, lo que sugiere soporte para configuraciones de robot definidas en el pipeline de GR00T.
- Carga independiente de políticas: cada subdirectorio `epoch-EEE` es autocontenido (pesos, configuración, procesadores, runtime), lo que permite cargar y comparar variantes sin dependencias entre ejecuciones.
- Reproducibilidad de campaña: subconjuntos anidados con semilla fija 42 y manifiestos de entrenamiento y evaluación por epoch.
- Capacidades de razonamiento lingüístico, tool calling, function calling, agentes multi-paso, visión general, audio o modo de pensamiento: no disponibles. No se documenta ninguna de ellas y el modelo no está orientado a esos usos.
- Capacidades multilingües: no disponibles (no se declara ningún idioma).

## Casos de uso

- Estudio de eficiencia de datos en VLA: reproducir la curva de éxito frente al número de trayectorias (5, 10, 25, 50) para estimar cuántas demostraciones necesita un modelo de 2B parámetros antes de superar el azar en LIBERO Spatial.
- Baseline de referencia en LIBERO Spatial: usar los checkpoints publicados como punto de comparación frente a políticas propias, aprovechando que el protocolo de evaluación (20 rollouts sobre la tarea 0) está fijado en el manifiesto.
- Selección de checkpoint para fine-tuning posterior: dado que cada epoch se guarda por separado y con recuento de éxitos asociado, es posible partir del epoch con mejor rendimiento (por ejemplo, `trajectories-025/epoch-004`, 11/20) en lugar de reentrenar desde el modelo base.
- Análisis de sensibilidad al tamaño de dataset: comparar ejecuciones con subconjuntos anidados permite estudiar si el rendimiento es monótono respecto a los datos; los resultados publicados (11/20 con 25 trayectorias frente a 9/20 con 50) apuntan a varianza alta y justifican este análisis.
- Adaptación a un nuevo robot o tarea: reutilizar el pipeline de runtime, procesadores y mapeos de embodiment incluidos en los checkpoints para arrancar una adaptación a otro embodiment, sustituyendo los mapeos y las estadísticas de normalización.
- Auditoría de pipelines de entrenamiento y evaluación en robótica: los manifiestos y los recibos de verificación de subida permiten revisar cómo se registraron los resultados y detectar problemas de protocolo (por ejemplo, el uso de una única semilla y de 20 rollouts de una sola tarea).
- Docencia y divulgación sobre imitación robótica: el repositorio es un ejemplo completo de campaña con subconjuntos anidados, criterio de parada y checkpoints por epoch, útil para ilustrar curvas de aprendizaje con pocos datos.

## Benchmarks y rendimiento

Los únicos resultados publicados son los de la propia campaña, medidos como éxitos en la tarea 0 de LIBERO Spatial sobre 20 rollouts por epoch:

| Trayectorias | Epochs guardados | Mejor epoch | Mejores exitos en tarea 0 (de 20) |
|---:|---:|---:|---:|
| 5 | 3 | 1 | 0/20 |
| 10 | 5 | 3 | 1/20 |
| 15 | Pendiente | Pendiente | Pendiente |
| 25 | 6 | 4 | 11/20 |
| 50 | 6 | 4 | 9/20 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de lenguaje en la información disponible, y no son aplicables a una política visomotora. Tampoco se ofrece comparación con el modelo base sin fine-tuning ni con otros VLA sobre el mismo protocolo de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada. Como estimación derivada, un modelo de unos 2 000 millones de parámetros en bf16 ocupa aproximadamente 4-5 GB solo en pesos; con activaciones, buffers de imagen y el bucle de generación de acciones, un rango razonable de trabajo es de 8 a 12 GB, cifra no verificada en la información disponible.
- Tamano por checkpoint: el repositorio ocupa 128 GB y contiene 20 epochs guardados, lo que arroja una media aproximada de 6 GB por checkpoint (estimación derivada, no declarada por el autor).
- GPU recomendadas para fine-tuning: no especificadas. Un ajuste fino completo de 2 000 millones de parámetros con AdamW en precisión mixta requiere del orden de 35-50 GB de VRAM (estimación), lo que sitúa el rango práctico en A100 40/80 GB, H100 o GPUs con 48 GB o más.
- GPU de consumo: la inferencia en bf16 debería caber en GPUs de 12-16 GB, y el ajuste fino con LoRA en una RTX 4090 de 24 GB, siempre como estimación no confirmada por el autor.
- Opciones de despliegue: cada subdirectorio de epoch incluye su propio código de runtime, procesadores, estadísticas de normalización y mapeos de embodiment, lo que indica un despliegue mediante el stack de GR00T y no mediante servidores de texto. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF o equivalente.
- Latencia y throughput: no disponibles. La generación de acciones en modelos de este tipo suele implicar un bucle iterativo de la cabeza de acción; no hay cifras publicadas para este derivado.
- Almacenamiento: 128 GB de repositorio completo; conviene descargar únicamente el subdirectorio del epoch de interés.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `kaweees/gr00tn1-libero-spatial-trajectory-efficiency` (este) | ~2B (heredado del base) | No disponible | 0/20 a 11/20 en la tarea 0 de LIBERO Spatial segun subconjunto | No disponible | Publico en HuggingFace, 0 descargas, 0 likes |
| `nvidia/GR00T-N1-2B` (modelo base) | ~2B | No disponible | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada; consultar la ficha del base | Publico en HuggingFace |
| Otros VLA abiertos de escala similar (por ejemplo, familias tipo OpenVLA o pi0) | No disponible | No disponible | No disponible | No disponible | No verificados en la informacion proporcionada |

No se dispone de datos verificados en la información proporcionada para comparar con alternativas de la misma categoría. La comparación rigurosa exigiría ejecutar el modelo base sin fine-tuning y otros VLA bajo exactamente el mismo protocolo (20 rollouts sobre la tarea 0 de LIBERO Spatial), algo que la ficha no ofrece.

## Limitaciones y advertencias

- Rendimiento muy bajo: 0/20 y 1/20 aciertos con 5 y 10 trayectorias, respectivamente. Incluso el mejor resultado (11/20, un 55 %) procede de una única tarea y no es apto para uso productivo.
- Curva no monótona: 50 trayectorias (9/20) rinde peor que 25 (11/20), lo que sugiere alta varianza o sobreajuste y desaconseja extrapolar que más datos impliquen mejor política.
- Evaluación estadísticamente débil: una sola semilla (42), 20 rollouts por epoch y únicamente la tarea 0 del suite LIBERO Spatial. No hay intervalos de confianza ni evaluación en otras tareas.
- Ejecución de 15 trayectorias pendiente: la tabla de resultados está incompleta y los artefactos anteriores de esa configuración fueron retirados.
- Sin estado del optimizador: no es posible reanudar el entrenamiento de forma exacta desde los checkpoints publicados.
- Licencia no declarada en la ficha del derivado: antes de cualquier uso comercial es imprescindible verificar la licencia del modelo base `nvidia/GR00T-N1-2B` y los términos aplicables a modelos derivados.
- Idiomas, sesgos y alucinación: no disponibles. El modelo no genera texto dirigido al usuario en este contexto, por lo que el riesgo relevante es la ejecución de acciones incorrectas, no la alucinación lingüística.
- Dominio cerrado: entrenado y evaluado sobre LIBERO Spatial en simulación. No hay evidencia de transferencia a robots reales; cualquier despliegue físico conlleva riesgo de daños materiales o personales.
- Trazabilidad de la campaña: el autor no es NVIDIA y el repositorio no ha sido validado por terceros; el recibo de verificación de subida es un artefacto del propio proceso de publicación.
- Coste de almacenamiento: 128 GB de repositorio, con epochs redundantes entre ejecuciones.

## Enlaces

- Ficha del modelo en HuggingFace: https://huggingface.co/kaweees/gr00tn1-libero-spatial-trajectory-efficiency
- Modelo base: https://huggingface.co/nvidia/GR00T-N1-2B
- Ejecución de 5 trayectorias: https://huggingface.co/kaweees/gr00tn1-libero-spatial-trajectory-efficiency/tree/main/n1/trajectories-005
- Mejor epoch de 5 trayectorias (epoch 1): https://huggingface.co/kaweees/gr00tn1-libero-spatial-trajectory-efficiency/tree/main/n1/trajectories-005/epoch-001
- Ejecución de 10 trayectorias: https://huggingface.co/kaweees/gr00tn1-libero-spatial-trajectory-efficiency/tree/main/n1/trajectories-010
- Mejor epoch de 10 trayectorias (epoch 3): https://huggingface.co/kaweees/gr00tn1-libero-spatial-trajectory-efficiency/tree/main/n1/trajectories-010/epoch-003
- Ejecución de 25 trayectorias: https://huggingface.co/kaweees/gr00tn1-libero-spatial-trajectory-efficiency/tree/main/n1/trajectories-025
- Mejor epoch de 25 trayectorias (epoch 4): https://huggingface.co/kaweees/gr00tn1-libero-spatial-trajectory-efficiency/tree/main/n1/trajectories-025/epoch-004
- Ejecución de 50 trayectorias: https://huggingface.co/kaweees/gr00tn1-libero-spatial-trajectory-efficiency/tree/main/n1/trajectories-050
- Mejor epoch de 50 trayectorias (epoch 4): https://huggingface.co/kaweees/gr00tn1-libero-spatial-trajectory-efficiency/tree/main/n1/trajectories-050/epoch-004
