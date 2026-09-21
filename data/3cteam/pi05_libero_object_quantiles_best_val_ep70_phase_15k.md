# 3CTeam/pi05_libero_object_quantiles_best_val_ep70_phase_15k

## Resumen

`3CTeam/pi05_libero_object_quantiles_best_val_ep70_phase_15k` es una política robótica entrenada y publicada con LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica. El repositorio contiene un checkpoint de aproximadamente 4,18 mil millones de parámetros (4.175.503.632 según los pesos en safetensors) con un tamaño de repositorio de 9,4 GB. El modelo se etiqueta como `action_evidence_vla` y `robotics`, y se ha entrenado sobre el dataset `lerobot/libero_object_image`, lo que lo sitúa en el ámbito de la manipulación robótica evaluada en el benchmark LIBERO (tarea `object`).

El identificador del repositorio aporta información sobre el proceso de entrenamiento: `pi05` apunta a una política de la familia pi0/pi0.5, `libero_object` a la tarea de manipulación de objetos de LIBERO, `quantiles` a un esquema de predicción por cuantiles, `best_val_ep70` a la selección del mejor checkpoint de validación en la época 70 y `phase_15k` a una fase de entrenamiento de 15.000 pasos. Ninguno de estos extremos está confirmado en la model card, que es una plantilla autogenerada por LeRobot con el aviso "Model type not recognized — please update this template".

Se trata de un artefacto de investigación con 0 descargas y 0 "likes" en el momento de la consulta, publicado el 21 de septiembre de 2026. Su relevancia es limitada fuera del contexto del experimento concreto para el que se generó, pero es ilustrativo del flujo actual de publicación de políticas VLA (visión-lenguaje-acción) en el Hub y de la reproducibilidad que habilita LeRobot.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. La model card no describe la arquitectura; el tag `action_evidence_vla` y el prefijo `pi05` del nombre sugieren una política visión-lenguaje-acción, sin confirmación oficial |
| Parámetros totales | 4.175.503.632 (aproximadamente 4,18 mil millones), según los pesos en safetensors |
| Parámetros activos | No aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible. No es un modelo de lenguaje: es una política de control robótico y la model card no especifica horizonte de observación ni ventana temporal |
| Tipos de cuantización | No disponible. Solo se publican pesos en safetensors; no se ofrecen variantes cuantizadas |
| Idiomas soportados | No disponible. Si la política acepta instrucciones en lenguaje natural como entrada, la model card no especifica idiomas ni tareas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tamaño del repositorio | 9,4 GB |
| Pipeline declarado | robotics |
| Dataset de entrenamiento | lerobot/libero_object_image |
| Fecha de creación | 2026-09-21 |
| Última actualización | 2026-09-21 |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura interna: se limita a indicar que la política se ha entrenado y subido al Hub con LeRobot y que el tipo de modelo no ha sido reconocido por la plantilla. El tag `action_evidence_vla` y el nombre del repositorio (`pi05`, que remite a una política tipo pi0/pi0.5) apuntan a un modelo visión-lenguaje-acción, es decir, una red que consume observaciones visuales (y presumiblemente una instrucción de tarea) y emite acciones de control de un brazo robótico. No hay información publicada sobre el número de capas, el mecanismo de atención, el encoder visual, la representación de acciones ni si emplea difusión, flujo o regresión directa por cuantiles.

Sobre el entrenamiento, lo único verificable es el dataset (`lerobot/libero_object_image`), la librería (LeRobot) y lo que sugiere el identificador: una selección del mejor checkpoint por validación en la época 70 (`best_val_ep70`) dentro de una fase de 15.000 pasos (`phase_15k`), con un esquema de predicción por cuantiles (`quantiles`). No se especifican el número total de tokens o frames vistos, la composición del dataset, la resolución de imagen, el uso de RLHF/DPO (poco habitual en robótica) ni ninguna innovación técnica destacable distinta de lo anterior. La model card incluye comandos genéricos de LeRobot para entrenar desde cero (`lerobot-train`) y para evaluar la política (`lerobot-record`), pero estos ejemplos usan `--policy.type=act` como plantilla y no describen la política publicada.

## Capacidades

- Control robótico por imitación: la política está entrenada para generar acciones de manipulación a partir de observaciones visuales, en el dominio de la tarea `object` del benchmark LIBERO.
- Manipulación de objetos: el dataset de entrenamiento (`libero_object_image`) corresponde a escenas con varios objetos y tareas de alcance y colocación.
- Predicción de acciones por cuantiles: el nombre del checkpoint sugiere una cabeza de predicción que modela cuantiles de la distribución de acciones, aunque la model card no lo detalla.
- Integración con LeRobot: se puede cargar, evaluar y ejecutar mediante las herramientas del ecosistema LeRobot (`lerobot-record`, `lerobot-eval`, `--policy.path`).
- Compatibilidad con brazos SO-100/SO-101: los ejemplos de la model card emplean `--robot.type=so100_follower` para la evaluación.
- Tool calling / function calling: no disponible; no es una capacidad propia de una política de control.
- Capacidades de agente y razonamiento multi-paso: no disponible. La política ejecuta una tarea de manipulación, sin planificación simbólica documentada.
- Capacidades multilingües: no disponible; no se documenta procesamiento de lenguaje natural.
- Modo "thinking", visión o audio como capacidades de modelo generativo: no disponible. La entrada visual es plausible por el tag VLA, pero no está confirmada en la documentación.

## Casos de uso

- Reproducción de experimentos en LIBERO: el checkpoint se puede cargar con LeRobot para replicar la evaluación de la tarea `libero_object` y comparar frente a otros checkpoints del mismo entrenamiento (por ejemplo, distintas épocas o fases).
- Investigación en políticas VLA: sirve como punto de partida para estudiar la predicción de acciones por cuantiles y su efecto en la precisión de manipulación, dado que el nombre del repositorio documenta explícitamente ese esquema.
- Fine-tuning sobre datos propios: al estar bajo licencia Apache-2.0 y en formato safetensors con LeRobot, se puede reentrenar o adaptar con `lerobot-train` a un dataset propio de manipulaciones, partiendo de estos pesos en lugar de desde cero.
- Evaluación de robustez visual: el dataset de imágenes de LIBERO permite probar la política frente a cambios de iluminación, posición de cámara o distractores, midiendo la tasa de éxito en la tarea de objetos.
- Despliegue en laboratorio con brazo de bajo coste: la model card incluye instrucciones de evaluación con `so100_follower`, por lo que es directamente utilizable con brazos SO-100/SO-101 en montajes de investigación.
- Generación de datos de evaluación: usando `lerobot-record` se pueden grabar episodios de evaluación etiquetados como `eval_<dataset>` y usarlos como conjunto de validación reproducible para comparar políticas.
- Estudio de selección de checkpoints: al tratarse de un checkpoint `best_val` de una fase concreta, es útil para analizar cómo la selección por validación afecta al rendimiento final en tareas de manipulación.
- Referencia para pipelines de entrenamiento LeRobot: el repositorio documenta el flujo completo de entrenamiento y evaluación, por lo que puede emplearse como plantilla en proyectos que adopten esta librería.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito en LIBERO ni en ninguna otra tarea, y no se han encontrado cifras en la búsqueda web. El nombre del repositorio (`best_val_ep70`) indica que existió una métrica de validación usada para seleccionar el checkpoint, pero su valor no se hace público.

| Benchmark | Resultado | Notas |
|---|---|---|
| LIBERO (tarea object) | No disponible | Dataset de entrenamiento citado, sin métricas publicadas |
| Otros benchmarks de manipulación | No disponible | Sin datos |

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 8,4 GB en bf16/fp16 (4.175.503.632 parámetros × 2 bytes) y aproximadamente 16,7 GB en fp32. Son estimaciones calculadas a partir del número de parámetros, no mediciones publicadas.
- VRAM total en inferencia: superior a la de los pesos por el coste de activaciones, buffers de imagen y el estado del bucle de control; no se han publicado mediciones. Como referencia de magnitud, el repositorio completo ocupa 9,4 GB.
- GPU recomendadas: no hay recomendaciones oficiales. Por tamaño, una GPU con 16-24 GB de VRAM (RTX 4080/4090, RTX A5000, L4, A100, H100) debería poder alojar los pesos en precisión reducida.
- GPU de consumo: sí cabe en tarjetas consumer de gama alta. Una RTX 4090 o RTX 3090 (24 GB) ofrece margen holgado en bf16; una RTX 4080 (16 GB) queda ajustada y puede requerir reducir el tamaño de lote o el número de cámaras procesadas simultáneamente.
- Opciones de despliegue: LeRobot (`lerobot-record`, `lerobot-eval`, `--policy.path`), junto con PyTorch. No aplican vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible. En robótica, la política debe ejecutarse dentro del bucle de control del robot, por lo que la latencia por inferencia condiciona la frecuencia de control alcanzable; no se han publicado cifras para este checkpoint.
- Almacenamiento: el repositorio ocupa 9,4 GB, por lo que conviene disponer de al menos ese espacio libre más el margen para checkpoints derivados.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la información proporcionada. Las alternativas naturales en el ecosistema LeRobot son otras políticas de manipulación (ACT, Diffusion Policy, pi0/pi0.5), pero no se han facilitado sus especificaciones ni métricas en esta consulta.

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 3CTeam/pi05_libero_object_quantiles_best_val_ep70_phase_15k | Política VLA (LeRobot) | 4,18 mil millones | No aplica / no disponible | Apache-2.0 | Hugging Face, 0 descargas |
| ACT (referenciado en la model card como `--policy.type=act`) | Política de imitación en LeRobot | No disponible | No disponible | No disponible | No disponible en la información aportada |
| Diffusion Policy | Política de imitación basada en difusión | No disponible | No disponible | No disponible | No disponible en la información aportada |
| pi0 / pi0.5 | Política visión-lenguaje-acción | No disponible | No disponible | No disponible | No disponible en la información aportada |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No hay evaluación de sesgos ni de comportamiento fuera de distribución; en robótica, esto se traduce en fallos previsibles ante objetos, iluminación o posiciones no vistas durante el entrenamiento.
- Riesgo de alucinación: no aplica en el sentido textual, pero sí existe riesgo de acciones incoherentes o inseguras cuando la observación se aleja de la distribución del dataset `libero_object_image`.
- Especialización estrecha: el modelo está entrenado para la tarea `object` de LIBERO. No hay evidencia de que generalice a otras tareas, robots o morfologías distintas de la empleada en el dataset.
- Limitaciones de contexto e idioma: no se documenta ninguna ventana de contexto ni soporte de idiomas. Si la política acepta instrucciones de lenguaje, no se especifica qué lenguajes ni qué formato.
- Documentación insuficiente: la model card es una plantilla autogenerada con el aviso "Model type not recognized". No describe la arquitectura, los datos exactos, la tokenización, el horizonte de acción ni el protocolo de evaluación.
- Validación comunitaria nula: 0 descargas y 0 "likes". El checkpoint no ha sido contrastado por terceros y podría contener errores o corresponder a un estado intermedio de entrenamiento.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero el modelo se apoya en un dataset (`lerobot/libero_object_image`) cuyas condiciones de uso deben verificarse por separado antes de un despliegue comercial.
- Seguridad física: cualquier uso sobre hardware real requiere mecanismos externos de parada de emergencia y límites de par; una política neuronal no garantiza comportamientos seguros.
- Reproducibilidad: aunque el nombre codifica época, fase y criterio de selección, no se publican hiperparámetros ni semillas, lo que dificulta reproducir el resultado exacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/3CTeam/pi05_libero_object_quantiles_best_val_ep70_phase_15k
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/libero_object_image
- LeRobot (repositorio): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo (los resultados obtenidos correspondían a servicios financieros sin relación con el repositorio). No se han encontrado papers, blogs ni demos adicionales asociados.
