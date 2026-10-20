# Samisaliveagain/piper-hexbolt-smolvla-bs64-step20000

## Resumen

`Samisaliveagain/piper-hexbolt-smolvla-bs64-step20000` es un checkpoint de política robótica entrenado con SmolVLA (una arquitectura visión-lenguaje-acción de tipo transformer) sobre la librería LeRobot. Lo publica el usuario Samisaliveagain y resuelve una única tarea de manipulación: coger un perno hexagonal y colocarlo en la ranura correspondiente con un robot AgileX Piper follower. No es un modelo de lenguaje: recibe siete valores de articulación y pinza más dos cámaras RGB (cenital y angular) y emite siete consignas absolutas de las articulaciones del follower, en trozos de 50 acciones.

El interés técnico está en que se trata de un export de inferencia con procedencia verificable: el paso de entrenamiento (20.000 actualizaciones de optimizador, batch de 64, un solo proceso) está documentado en `training_step.json`, y los hashes SHA-256 de los siete ficheros de política y procesadores coinciden con la auditoría de descarga local. El entrenamiento se hizo sobre un dataset propio de 100 demostraciones de inserción de perno hexagonal; un segundo dataset de 80 demostraciones con configuración «zero-home» no se usó en esta ejecución.

Con 450 millones de parámetros y un repositorio de 1,2 GB, es un modelo pequeño y desplegable en GPU de consumo. Ahora bien, la publicación es un artefacto de investigación sin validación externa: cero descargas, cero likes, sin licencia asignada y sin métricas de éxito físico declaradas. Es relevante como punto de partida reproducible para fine-tuning en inserción de precisión, no como política lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (visión-lenguaje-acción, policy de imitación de LeRobot); detalles de capas y atención no disponibles |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; emite chunks de 50 acciones) |
| Tipos de cuantizacion | no disponible (el repositorio solo incluye `model.safetensors`; no se documentan variantes GGUF, ONNX ni INT8) |
| Idiomas soportados | no disponible / no aplica (modelo de control robótico, sin interfaz de lenguaje natural) |
| Licencia | no disponible (el autor indica que la subida no asigna licencia nueva) |
| Formato de pesos | `safetensors` (más `config.json`, configuraciones de pre/postprocesador y tensores de normalización) |
| Entradas | 7 valores de articulación/pinza + cámara RGB cenital («overhead») + cámara RGB angular |
| Salidas | 7 objetivos absolutos del follower; articulaciones en grados, pinza en milímetros |
| Horizonte de acción | chunk de 50 acciones |
| Pasos de entrenamiento | 20.000 actualizaciones de optimizador |
| Batch de entrenamiento | 64 (1 proceso) |
| Dataset | `Samisaliveagain/piper-hexagonal-bolt-insertion-100-demos-v1`, revisión `1ec623d82a1f70c70f1d769c38334799d122db77` |
| Robot objetivo | AgileX Piper follower |
| Tamaño del repositorio | 1,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

SmolVLA es una política de imitación que combina un codificador visual, un modelo de lenguaje pequeño y una cabeza de acciones, siguiendo el paradigma visión-lenguaje-acción: la política consume observaciones multimodales (dos flujos RGB) y el estado propioceptivo del robot, y genera directamente chunks de acciones. En este checkpoint concreto no se detallan en la información disponible el número de capas, la dimensión oculta ni el mecanismo de atención; el dato fiable es el recuento total de parámetros, 450.046.176, coherente con la variante base de SmolVLA.

El entrenamiento consistió en 20.000 actualizaciones de optimizador con batch de 64 en un único proceso, inicializado o reanudado desde una ruta previa que termina en `000050/pretrained_model` (paso 50 del run de origen). La configuración `train_config.json` fija `steps: 20000` como objetivo global; el autor aclara explícitamente que ni ese campo ni `pretrained_path` identifican el paso guardado, que es el 20.000. Los datos provienen de 100 demostraciones de teleoperación de la tarea de inserción de perno hexagonal, con la pinza y las articulaciones registradas en grados y milímetros y una articulación 4 bloqueada durante la recogida. No se documenta uso de RLHF, DPO ni refuerzo; es imitación supervisada pura. El export no incluye estado de optimizador, planificador ni RNG, por lo que no es reanudable para continuar el entrenamiento tal cual.

## Capacidades

- Control de manipulación de una sola tarea: recoger un perno hexagonal y colocarlo en la ranura correspondiente con un AgileX Piper follower.
- Política de imitación multi-cámara: fusiona una vista cenital y una vista angular RGB además de la propiocepción de siete articulaciones y pinza.
- Predicción de chunks de acción: emite 50 acciones por inferencia, lo que reduce la frecuencia efectiva de replanificación.
- Salida en espacio absoluto de articulaciones: siete consignas con articulaciones en grados y pinza en milímetros, directamente interpretables por el controlador del robot.
- Incluye pre/postprocesadores y tensores de normalización, necesarios para interpretar correctamente observaciones y acciones.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni diálogo multilingüe: no es un modelo de lenguaje.
- No tiene modo «thinking», visión general, audio ni generación de texto.

## Casos de uso

- Automatización de una celda de ensamblaje de inserción de pernos: el modelo recibe las dos cámaras y el estado del Piper y genera las 50 siguientes consignas articulares; es adecuado porque la tarea está acotada y las unidades de salida coinciden con el controlador del follower.
- Fine-tuning sobre dominios propios: partir de este checkpoint (450 M de parámetros, 1,2 GB) para reentrenar con nuevas geometrías de perno o útiles, aprovechando que el pipeline es LeRobot y el formato es `safetensors` estándar.
- Estudio de curvas de entrenamiento en VLA: el export conserva metadatos de paso (20.000), batch (64) y dataset, lo que permite comparar este punto con otros checkpoints del mismo run para analizar el efecto del número de actualizaciones.
- Reproducibilidad y auditoría de artefactos: los hashes SHA-256 de los ficheros de política y procesadores están registrados, de modo que sirve como caso de estudio de publicación verificable de checkpoints de robótica.
- Evaluación comparativa de políticas de imitación: al ser un modelo pequeño y con procedencia documentada, se puede usar como línea base frente a ACT o Diffusion Policy en el mismo montaje experimental.
- Docencia e investigación en imitación multimodal: el par de cámaras y la salida de 7 dimensiones hacen del modelo un ejemplo didáctico de política VLA con estado propioceptivo, desplegable en una GPU de consumo.
- Pruebas de integración del stack LeRobot: sirve para validar el ciclo `SmolVLAPolicy.from_pretrained` → preprocesado de observaciones → ejecución de acciones antes de invertir en datasets propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye tasas de éxito de inserción, error de posición final, ni comparaciones con otras políticas sobre el mismo dataset. Tampoco se documentan latencia de inferencia ni throughput. Cualquier cifra de rendimiento físico de este checkpoint debe obtenerse mediante evaluación propia en el montaje del AgileX Piper.

## Requisitos de hardware

- VRAM estimada para pesos: alrededor de 1,8 GB en fp32 (4 bytes por parámetro) y alrededor de 0,9 GB en bf16/fp16, calculado a partir de los 450.046.176 parámetros. Estimación aritmética, no medida publicada.
- VRAM total recomendada: 4-8 GB contando buffers de las dos cámaras, tensores de normalización y overhead del runtime de PyTorch. No confirmado por el autor.
- Cabe en GPU de consumo: sí, con margen amplio en RTX 3060/4060/4090 y en placas integradas tipo Jetson Orin. Para el modelo en fp32 bastan 4 GB.
- Despliegue: la vía documentada es LeRobot con `SmolVLAPolicy.from_pretrained`; no se han publicado instrucciones para vLLM, llama.cpp, Ollama ni TGI (no son aplicables a una política de acción, y no hay pesos GGUF en el repositorio).
- Latencia y throughput: no disponibles.
- Almacenamiento: 1,2 GB de repositorio, más el dataset de 100 demostraciones si se quiere reentrenar.

## Comparativa con modelos similares

| Modelo | Categoria | Parametros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Piper Hex-Bolt SmolVLA (este) | SmolVLA fine-tuneado, 1 tarea | 450 M | chunk de 50 acciones | no disponible | público, 0 descargas |
| SmolVLA base (Hugging Face) | VLA generalista preentrenado | ~450 M (variante base) | no verificado en esta ficha | no disponible en la informacion proporcionada | público |
| pi0 / pi0.5 (Physical Intelligence) | VLA generalista de mayor escala | no disponible | no disponible | no disponible | público |
| ACT (LeRobot) | Política de imitación transformer | no disponible | no disponible | no disponible | público |

No se dispone de resultados comparativos de benchmarks ni de datos verificados de parámetros, contexto y licencia de las alternativas en la información proporcionada; la comparación debe hacerse empíricamente sobre el mismo montaje de robot y el mismo dataset.

## Limitaciones y advertencias

- Modelo de una sola tarea: no generaliza a otras piezas, útiles ni posiciones sin reentrenamiento.
- Sin validación física declarada: el autor afirma que la publicación no establece éxito ni robustez de inserción; solo verifica el paso de entrenamiento y la integridad de los ficheros.
- Licencia sin asignar: la subida no otorga licencia nueva, por lo que el uso comercial queda en un limbo legal y requiere contactar con el autor.
- Dependencia estricta del montaje: exige la misma configuración de cámaras (cenital y angular), las mismas unidades (grados y milímetros) y el bloqueo de la articulación 4 usado en la recogida; desviarse invalida las predicciones.
- Dataset pequeño: 100 demostraciones de una única tarea, sin las 80 demostraciones del dataset «zero-home», lo que reduce la diversidad de condiciones iniciales cubiertas.
- Riesgo de alucinación no aplicable en sentido lingüístico, pero sí de acciones erróneas: una política de imitación puede generar consignas plausibles pero físicamente incorrectas, con riesgo de colisión o daño en un robot real.
- Sin estado de optimizador, planificador ni RNG: no se puede reanudar el entrenamiento exactamente desde este export.
- Ambigüedad de procedencia resuelta solo parcialmente: `pretrained_path` apunta a `000050/pretrained_model` y `train_config.json` fija 20.000 pasos; el autor insiste en que el paso guardado es 20.000, pero la trazabilidad depende de ficheros auxiliares (`training_step.json`, `checkpoint_info.json`, `publication_manifest.json`).
- Sin tracción comunitaria: 0 descargas y 0 likes, sin informes independientes de funcionamiento.
- Ausencia de datos de sesgo, idioma y contexto: no aplica a esta categoría de modelo, pero implica que no hay métricas de robustez ante cambios de iluminación o de fondo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Samisaliveagain/piper-hexbolt-smolvla-bs64-step20000
- Dataset de entrenamiento: https://huggingface.co/datasets/Samisaliveagain/piper-hexagonal-bolt-insertion-100-demos-v1

No se han encontrado en la información disponible papers, blogs, repositorios adicionales ni demos asociados a este checkpoint.
