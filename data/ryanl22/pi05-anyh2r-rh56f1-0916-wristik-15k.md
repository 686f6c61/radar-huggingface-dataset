# RyanL22/pi05-anyh2r-rh56f1-0916-wristik-15k

## Resumen

`RyanL22/pi05-anyh2r-rh56f1-0916-wristik-15k` es un checkpoint de política robótica de tipo visión-lenguaje-acción (VLA) publicado por el usuario RyanL22 sobre el pipeline `pi05` de LeRobot (v0.6.1). Se trata de un fine-tune del modelo base `lerobot/pi05_base` sobre el dataset `RyanL22/anyh2r-pi05-0916-merged`, una mezcla fechada el 2026-09-16 compuesta por 12 células de datos sintéticos generados a partir de vídeo humano (466 episodios con etiquetas IDM corregidas mediante cinemática inversa de muñeca) y 4 células de teleoperación real (pelota, caja, muñeca y botella). El objetivo es controlar un robot OpenArm con manos RH56F1.

El modelo tiene 4.143.404.816 parámetros (unos 4,14 mil millones) en formato safetensors, con un repositorio de 9,4 GB, y ejecuta el codificador visual SigLIP de 412,4 millones de parámetros sin congelar. El checkpoint corresponde al paso 15.000 de un entrenamiento de 30.000 pasos, por lo que es un estado intermedio y no el modelo final de la ejecución. El entrenamiento se realizó en 4 GPU A100 de 80 GB (entorno Kakao), con lote total de 64, precisión bfloat16 y checkpointing de gradientes.

Su relevancia es acotada pero específica: documenta una receta reproducible de co-entrenamiento sintético + real para VLA con LeRobot nativo, con decisiones de diseño explícitas (reparto de células proporcional a la raíz cuadrada de fotogramas, aumento de espejo desactivado, aumento aplicado de forma coherente sobre el par estéreo). La licencia Apache 2.0 permite uso comercial sin restricciones declaradas, si bien el modelo tiene 11 descargas y 0 «likes» en el momento de redactar esta ficha, es decir, no cuenta con validación de la comunidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política VLA del pipeline `pi05` de LeRobot v0.6.1, con codificador visual SigLIP (412,4 M de parámetros) ajustado durante el fine-tune |
| Parametros totales | 4.143.404.816 (~4,14 mil millones) |
| Parametros activos | No aplica: la información disponible no indica que sea una arquitectura MoE |
| Longitud de contexto | No disponible (no es un modelo de lenguaje de texto; el horizonte de acción declarado es de 50 acciones a 20 fps, equivalentes a 2,5 s, con `n_obs_steps=1`) |
| Tipos de cuantizacion | No disponible: solo se publican pesos en safetensors, sin variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible: la model card no declara idiomas ni instrucciones en lenguaje natural |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`); repositorio de 9,4 GB |
| Modelo base | `lerobot/pi05_base` (fine-tune) |
| Paso de entrenamiento | 15.000 de 30.000 |
| Entradas | `observation.images.base_0_rgb` (vista izquierda ZED, 288x512), `observation.images.left_wrist_0_rgb` (vista derecha ZED, 288x512), `observation.state` (28 dimensiones) |
| Salidas | `action`, 28 dimensiones de objetivos articulares absolutos |
| Distribución estado/acción | cuello (2) \| brazo izquierdo (7) \| brazo derecho (7) \| mano izquierda (6) \| mano derecha (6) |
| Normalización | imágenes identidad; estado y acción por cuantiles (estadísticas en `policy_preprocessor_*`) |
| Fecha de publicación | 2026-09-17 (última actualización 2026-09-17) |
| Descargas / likes | 11 / 0 |

## Arquitectura y entrenamiento

La model card describe un fine-tune LeRobot-nativo de `pi05` sobre datos regenerados el 2026-09-16. No se detalla la topología interna de la red (número de capas, mecanismo de atención, tipo de cabeza de acción) más allá del codificador visual SigLIP de 412,4 millones de parámetros, que se entrena y no permanece congelado. La interfaz del modelo es puramente robótica: consume dos vistas estéreo de 288x512 píxeles más un vector de estado de 28 dimensiones y emite 28 objetivos articulares absolutos, con chunking de 50 acciones a 20 fps.

En cuanto a los datos, la mezcla combina 16 células: 12 sintéticas generadas desde vídeo humano (466 episodios, con etiquetas IDM corregidas por cinemática inversa de muñeca) y 4 reales de teleoperación (pelota, caja, muñeca y botella). El reparto de muestras entre células es proporcional a la raíz cuadrada del número de fotogramas, una decisión que amortigua el peso de las células más largas. Se aplican aumentos fotométricos y afines, con una única tirada de aumento replicada sobre el par estéreo para preservar la coherencia entre vistas, y se desactiva explícitamente el aumento de espejo izquierda/derecha. El optimizador es AdamW con lr máxima 2,5e-5 y decaimiento coseno hasta 2,5e-6, con 1.000 pasos de calentamiento. No se menciona en la información disponible el uso de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Generación de acciones motoras: produce 28 objetivos articulares absolutos (cuello, dos brazos de 7 grados de libertad y dos manos RH56F1 de 6 grados de libertad) a partir de observaciones visuales y propioceptivas.
- Planificación de horizonte corto: emite bloques de 50 acciones a 20 fps (2,5 s de trayectoria) con una sola observación de entrada (`n_obs_steps=1`).
- Percepción estéreo: procesa dos vistas ZED simultáneas de 288x512 píxeles con un codificador SigLIP ajustado, con aumentos aplicados de forma coherente entre ambas vistas.
- Manipulación bimanual: el espacio de acción incluye ambos brazos y ambas manos de forma simétrica en la misma representación de 28 dimensiones.
- Aprendizaje de habilidades a partir de vídeo humano: el entrenamiento incorpora etiquetas IDM corregidas por cinemática inversa de muñeca, lo que permite explotar datos sin teleoperación.
- No se ha documentado soporte de tool calling, function calling, uso como agente, razonamiento multi-paso en lenguaje natural, capacidades multilingües, generación de texto, modo «thinking», visión generalista ni audio.

## Casos de uso

- Manipulación bimanual de laboratorio sobre OpenArm: el modelo está entrenado específicamente para la morfología OpenArm + manos RH56F1 (28 grados de libertad), de modo que puede desplegarse directamente sobre ese montaje sin adaptación de la capa de acción.
- Investigación en co-entrenamiento sintético y real: sirve como referencia reproducible de la receta que mezcla 12 células sintéticas derivadas de vídeo humano con 4 células de teleoperación real, útil para estudiar la transferencia de datos generados a entornos físicos.
- Recogida y colocación de objetos con manos diestras: las tareas reales del dataset (pelota, caja, muñeca y botella) se corresponden con agarres y traslados de objetos, un escenario habitual en logística de laboratorio y en experimentos de manipulación.
- Generación de trayectorias para aumentación de datos: sus bloques de 50 acciones a 20 fps pueden emplearse como profesor para etiquetar nuevos episodios o para comparar la calidad de etiquetas IDM frente a teleoperación real.
- Estudio de ablaciones de entrenamiento: las decisiones documentadas (espejo desactivado, reparto por raíz cuadrada de fotogramas, augmentación replicada en el par estéreo) permiten reproducir y medir el efecto de cada una sobre el éxito de la tarea.
- Evaluación de checkpoints intermedios: al ser el paso 15.000 de 30.000, es un punto de comparación para analizar la curva de aprendizaje frente al checkpoint final y decidir si merece la pena continuar el entrenamiento.
- Prototipado de políticas con LeRobot: la carga mediante `PI05Policy.from_pretrained` facilita integrarlo en pipelines de investigación existentes basados en esa librería, sin conversión de formato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye tasas de éxito por tarea, error de acción (MSE), comparaciones con `lerobot/pi05_base` ni evaluaciones en simulación o en robot real. Tampoco se aportan métricas de latencia medidas.

## Requisitos de hardware

- VRAM estimada para los pesos, calculada a partir de los 4.143.404.816 parámetros: unos 8,3 GB en bfloat16, unos 16,6 GB en float32, unos 4,1 GB en int8 y unos 2,1 GB en int4 (estimaciones aritméticas; no hay cifras publicadas por el autor).
- A la VRAM de pesos hay que sumar activaciones, memoria del codificador SigLIP y buffers de inferencia, por lo que en bfloat16 un presupuesto práctico de 10 a 14 GB es razonable (estimación).
- GPU utilizadas en entrenamiento: 4 x A100 80 GB, lote de 16 por GPU (64 total), bfloat16 con checkpointing de gradientes. Para entrenamiento con esa configuración se necesitan del orden de 320 GB de VRAM agregada; no se documenta el consumo real por GPU.
- Cabe en GPU de consumo: una RTX 4090 (24 GB) debería alojar los pesos en bfloat16 con margen; una GPU de 16 GB (RTX 4080, 4070 Ti Super) queda justa y puede requerir cuantización manual u offload (estimación, no verificado).
- Opciones de despliegue documentadas: carga nativa mediante LeRobot con `PI05Policy.from_pretrained("RyanL22/pi05-anyh2r-rh56f1-0916-wristik-15k")`. No hay soporte documentado en vLLM, TGI, llama.cpp, Ollama ni otros servidores de inferencia de texto, ya que la salida es motora y no lingüística.
- Latencia y throughput: no disponibles. Como referencia de diseño, el control a 20 fps con bloques de 50 acciones implica que cada inferencia debe completarse en menos de 2,5 s para mantener el control en tiempo real sin agotar el bloque.

## Comparativa con modelos similares

| Modelo | Parámetros | Horizonte de acción | Licencia | Disponibilidad |
|---|---|---|---|---|
| `RyanL22/pi05-anyh2r-rh56f1-0916-wristik-15k` | 4.143.404.816 (~4,14 M M) | 50 acciones a 20 fps (2,5 s), `n_obs_steps=1` | Apache 2.0 | Público en HuggingFace, 11 descargas, 0 likes |
| `lerobot/pi05_base` (modelo base) | No disponible en la información proporcionada | No disponible | No disponible en la información proporcionada | Público en HuggingFace como modelo base del fine-tune |
| `RyanL22/anyh2r-pi05-0916-merged` | No es un modelo, es el dataset de entrenamiento (16 células: 12 sintéticas + 4 reales) | No aplica | No disponible en la información proporcionada | Público en HuggingFace |

La búsqueda web realizada no devolvió resultados relacionados con el modelo: los enlaces obtenidos corresponden a un proveedor checo de equipos de televisión por satélite, sin ninguna relación con esta ficha. No se dispone, por tanto, de comparativas verificadas con otras políticas VLA del mismo tamaño o de la misma tarea.

## Limitaciones y advertencias

- Especialización de morfología: la capa de acción está atada a un embodiment concreto de 28 grados de libertad (cuello 2, brazos 7+7, manos RH56F1 6+6). No es trasladable a otros robots sin reentrenar la cabeza de acción.
- Checkpoint intermedio: corresponde al paso 15.000 de 30.000; no es el estado final de la ejecución y puede estar por debajo del rendimiento alcanzable.
- Sesgo de composición del dataset: 12 de las 16 células son sintéticas, generadas desde vídeo humano con etiquetas IDM corregidas por cinemática inversa de muñeca; el modelo hereda ese sesgo y el dominio limitado de las 4 tareas reales (pelota, caja, muñeca, botella).
- Aumento de espejo desactivado: el modelo no ha visto pares izquierda/derecha invertidos, lo que puede reducir la generalización entre manos o ante simetrías no presentes en los datos.
- Nomenclatura confusa de las entradas: la clave `base_0_rgb` recibe la vista izquierda de la ZED y `left_wrist_0_rgb` recibe la vista derecha, según la propia model card. Es un punto de error probable al integrar el modelo.
- Riesgo de fallo silencioso: al no generar texto, el modo de error análogo a la alucinación es la ejecución de una acción plausible pero incorrecta o fuera de rango; no hay mecanismo de verificación declarado.
- Ausencia de evaluaciones: no hay tasas de éxito, métricas de error de acción, ni pruebas de seguridad publicadas, ni en simulación ni en robot real.
- Validación comunitaria nula: 11 descargas y 0 «likes»; el modelo no ha sido contrastado por terceros.
- Licencia: Apache 2.0 permite uso comercial sin restricciones declaradas, pero conviene revisar las licencias del modelo base `lerobot/pi05_base` y del codificador SigLIP antes de un despliegue comercial.
- Idiomas y lenguaje natural: no se declara ningún idioma ni el uso de instrucciones textuales, por lo que no debe asumirse seguimiento de comandos en castellano ni en inglés.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RyanL22/pi05-anyh2r-rh56f1-0916-wristik-15k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento citado en la model card: https://huggingface.co/datasets/RyanL22/anyh2r-pi05-0916-merged
- Nota sobre la búsqueda web: la búsqueda no devolvió ningún enlace relacionado con el modelo (los resultados obtenidos pertenecían a un proveedor de equipos de televisión por satélite). No se han encontrado papers, blogs, repositorios ni demos asociados en la información disponible.
