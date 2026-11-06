# adipotnis/pi05-droid-cofactvla

## Resumen

pi05-droid-cofactvla es un checkpoint de investigación publicado por el usuario adipotnis en Hugging Face, consistente en un ajuste fino del modelo base lerobot/pi05_base sobre el conjunto de datos robótico DROID (lerobot/droid_1.0.1). El modelo aplica la implementación pública de CoFACT-VLA (una variante de entrenamiento contrastivo para políticas visión-lenguaje-acción) al pipeline de DROID, sin que exista una receta oficial publicada para esta combinación. Se trata, por tanto, de una adaptación experimental y no de una reproducción de resultados de referencia.

El modelo pertenece a la familia pi0.5 de Physical Intelligence, una arquitectura de política robótica que combina un codificador visual, un modelo de lenguaje y un "action expert" para generar trayectorias de articulaciones a partir de instrucciones en lenguaje natural e imágenes de cámaras. Con 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) y un repositorio de 24,5 GB, está pensado para control de brazos robóticos de 7 grados de libertad más pinza.

Su relevancia es acotada: se publica como un artefacto reproducible de un experimento concreto (job 3491050 en NCSA DeltaAI, 6.000 pasos de entrenamiento) y el propio autor advierte que no se ha realizado ninguna evaluación mediante rollout en robot real. Es útil para investigadores que quieran inspeccionar, reproducir o continuar el ajuste, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política visión-lenguaje-acción pi0.5 (transformer con codificador visual, backbone de lenguaje y action expert), modificada con CoFACT-VLA |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (horizonte de acción de 50 pasos) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 durante entrenamiento) |
| Idiomas soportados | no disponible (instrucciones en lenguaje natural, presumiblemente inglés por el dataset DROID; no confirmado) |
| Licencia | gemma |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

El modelo parte de lerobot/pi05_base (revisión 22c30e5b34f9e7ab738b1b34fc2fc5ecfe2d28f0) y se ajusta de forma completa, sin congelar el codificador visual ni el action expert. La arquitectura subyacente es la política pi0.5 de LeRobot: recibe tres cámaras RGB (exterior_1_left, exterior_2_left, wrist_left) a 180×320 píxeles, un estado de 7 posiciones articulares en radianes más la pinza, y una instrucción en lenguaje natural; produce 7 posiciones articulares objetivo absolutas más la acción de pinza, sin transformación delta. Sobre esta base, CoFACT introduce una rama contrafactual que enmascara la instrucción y el estado tokenizado conservando las imágenes, con el objetivo de mejorar la robustez de la representación.

El entrenamiento se realizó sobre el conjunto completo de episodios exitosos con instrucción de DROID: 74.682 episodios y 19.806.641 fotogramas (de un total público de 95.658 episodios y 27.630.375 fotogramas). Se usaron 4 GPU GH200 con batch global de 128, AdamW (betas 0.9/0.95, weight decay 0.01, grad clip 1.0), learning rate de 2,5e-5 a 2,5e-6 con warmup de 1.000 pasos y decaimiento hasta 6.000 pasos, precisión bfloat16, gradient checkpointing y torch.compile activados. Se aplicó OPG con escala 2.0 en entrenamiento e inferencia, y CCR solo en inferencia (beta 0.15, capas 15/16, top-k 4, epsilon 1e-5). La normalización usa estadísticos q01/q99 de la fuente completa DROID, escalando a [-1,1] sin recorte. En total se muestrearon 768.000 anclas sobre 6.000 actualizaciones, menos de una pasada completa por el pool elegible. No se aplicó pérdida TAG, borrado de imagen ni subconjunto de enmascaramiento del 10%.

## Capacidades

- Generación de acciones robóticas: produce trayectorias de 7 articulaciones más pinza a partir de observaciones visuales multi-cámara y una instrucción textual.
- Control visuomotor con horizonte de acción de 50 pasos.
- Fusión multimodal de tres vistas de cámara (dos exteriores y una en la muñeca) con estado propioceptivo.
- Seguimiento de instrucciones en lenguaje natural para especificar la tarea.
- Entrenamiento contrafactual (CoFACT) orientado a mejorar la generalización ante variaciones de instrucción o estado.
- No se documentan capacidades de tool calling, agentes, matemáticas, código ni procesamiento de audio.
- Capacidades multilingües: no disponibles; el dataset de origen es DROID, con instrucciones mayoritariamente en inglés.

## Casos de uso

- Investigación en políticas VLA: servir como punto de partida reproducible para estudiar el efecto de CoFACT sobre DROID, comparando con el checkpoint base pi05_base bajo idénticas condiciones de evaluación.
- Ajuste fino posterior: el repositorio incluye training_state/ (optimizador, scheduler, RNG y paso) y los ficheros de procedencia, lo que permite reanudar el entrenamiento con el adaptador DROID local y ajustar hiperparámetros.
- Manipulación robótica de laboratorio: uso en un brazo de 7 DoF con pinza para tareas de pick-and-place o manipulación de objetos, siempre con validación previa en entorno simulado o de banco.
- Análisis de robustez contrafactual: la rama CoFACT permite estudiar cómo responde la política cuando se altera la instrucción manteniendo la observación visual, útil en estudios de sesgo instrucción-acción.
- Reproducción de experimentos: verificar hashes (SHA256SUMS.json) y configuración (train_config.json, training_provenance.json) para auditoría de resultados en publicaciones.
- Docencia y formación: ejemplo práctico de pipeline LeRobot completo, desde la descarga del dataset DROID hasta el despliegue de una política pi0.5 con procesadores de normalización.
- Base para comparativas de normalización: el uso de estadísticos q01/q99 de la fuente completa frente a alternativas (TAG delta-action, LIBERO) permite estudiar el impacto de la normalización en el rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se realizó ninguna evaluación mediante rollout en robot y que se trata de una adaptación, no de una reproducción de resultados de referencia de DROID.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,14 mil millones de parámetros en bfloat16, los pesos ocupan aproximadamente 8,3 GB; sumando activaciones, buffers de imagen y el action expert, se recomienda al menos 16-24 GB de VRAM para inferencia cómoda.
- GPU recomendadas: el entrenamiento se realizó en 4× NVIDIA GH200; para inferencia, una A100 (40/80 GB), H100 o L40S son opciones holgadas. Una RTX 4090 (24 GB) debería ser suficiente para inferencia en bfloat16.
- GPU de consumo: cabe en RTX 4090 y potencialmente en RTX 3090 (24 GB); en GPUs de 16 GB requeriría cuantización, no documentada por el autor.
- Opciones de despliegue: la vía oficial es la librería LeRobot (PI05Policy.from_pretrained junto con make_pre_post_processors). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje generativo estándar.
- Latencia y throughput: no disponibles. El horizonte de acción de 50 pasos implica que cada inferencia produce un bloque de 50 acciones, lo que reduce la frecuencia de llamadas al modelo en control real, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-droid-cofactvla (este) | 4,14 B | horizonte de acción 50 | DROID + CoFACT, 6.000 pasos | gemma | Hugging Face, 0 descargas |
| lerobot/pi05_base | no disponible en la información | no disponible | base pi0.5 | no disponible en la información | Hugging Face (modelo base) |
| Otras políticas VLA para DROID (p. ej. π0, OpenVLA) | no disponible en la información | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparación se limita a procedencia y configuración de entrenamiento.

## Limitaciones y advertencias

- No validado para despliegue en robot: el autor indica explícitamente que el checkpoint no ha sido validado para deployment y que no se realizó ninguna evaluación mediante rollout.
- Adaptación sin receta oficial: no existe una receta publicada específica para DROID con CoFACT; los resultados no deben interpretarse como reproducción de benchmarks DROID.
- Entrenamiento incompleto en términos de épocas: 768.000 anclas sobre 6.000 actualizaciones representan menos de una pasada completa por el pool elegible, lo que puede limitar la convergencia.
- Datos de origen comprimidos: el vídeo fuente es AV1 de Hugging Face y el export carece de identificadores de grabación, por lo que no se puede reproducir el filtrado oficial de RLDS no-idle.
- Normalización dependiente del checkpoint: los procesadores guardados contienen la normalización DROID usada en entrenamiento; cargarlos siempre junto al modelo, ya que omitirlos produce acciones incorrectas.
- Licencia gemma: hereda las restricciones de la licencia Gemma, que incluye cláusulas de uso aceptable y obligaciones de atribución; revisar antes de cualquier uso comercial.
- Idiomas: no se documenta soporte multilingüe; las instrucciones del dataset DROID están mayoritariamente en inglés.
- Sesgos: no documentados por el autor; al entrenarse sobre un único dataset robótico, puede heredar sesgos de distribución de escenas, objetos y entornos de DROID.
- Riesgo de alucinación de acciones: como política generativa, puede producir trayectorias plausibles pero incorrectas fuera de la distribución de entrenamiento; requiere supervisión y límites de seguridad en el robot.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adipotnis/pi05-droid-cofactvla
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset DROID: https://huggingface.co/datasets/lerobot/droid_1.0.1
- Implementación CoFACT-VLA: https://github.com/zhangy0822/CofactVLA/tree/7cbae824f2c55a154340cbf4b52b9125452e124d
- Librería LeRobot: https://github.com/huggingface/lerobot
