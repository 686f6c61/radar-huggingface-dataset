# 2chan/beverage-smolvla-26k

## Resumen

Beverage SmolVLA 26k es un ajuste fino (fine-tuning) del modelo base `lerobot/smolvla_base`, un modelo de vision-lenguaje-accion (VLA) orientado a robótica. Lo publica el usuario 2chan en Hugging Face y está especializado en una tarea concreta: la preparación de bebidas con un robot bimanual SO-101. El modelo recibe observaciones de tres cámaras (superior y una por muñeca), el estado del robot y una instrucción en lenguaje natural, y devuelve acciones de control de 12 dimensiones (6 por brazo).

El modelo resuelve el problema de convertir instrucciones de alto nivel ("remover", "verter agua", "verter matcha en polvo", "verter café en polvo") en trayectorias de control concretas para un robot de dos brazos. Es relevante porque demuestra el patrón habitual en robótica open source: partir de un VLA generalista pequeño y ajustarlo con un dataset propio de demostraciones para una tarea específica, manteniendo el despliegue dentro de la librería LeRobot.

Con 450 millones de parámetros y un repositorio de 0,9 GB, es un modelo compacto pensado para inferencia en el bucle de control del robot, no para generación de texto general. La model card no documenta licencia, idiomas ni resultados de rendimiento físico, y advierte explícitamente de que la subida no establece rendimiento real en un robot físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-lenguaje-accion) SmolVLA, implementada en LeRobot (`SmolVLAPolicy`) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible (las instrucciones de tarea del dataset están en inglés: "stir", "pour water", etc.) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `lerobot`) |

Datos adicionales de configuración: estado y acción del robot de 12 dimensiones (brazo izquierdo seguido del brazo derecho), tres cámaras (top, muñeca izquierda, muñeca derecha, mapeadas a camera1, camera2, camera3), tamaño de chunk de acción de 50 y checkpoint en el paso 26.000.

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `lerobot/smolvla_base`, un VLA de la familia SmolVLA integrado en la librería LeRobot. La arquitectura combina un codificador visual y de lenguaje con una cabeza de política que emite chunks de acciones (50 pasos por chunk en esta configuración). El estado y la acción se representan en 12 dimensiones, correspondientes a los dos brazos del robot SO-101 bimanual.

El entrenamiento se realizó sobre un dataset de demostraciones de preparación de bebidas, restringido a las tareas con identificadores 0, 1, 2 y 4: remover (stir), verter agua, verter matcha en polvo y verter café en polvo. La ejecución de entrenamiento es `20261103_024412_232249` (zona horaria Asia/Seoul) y el checkpoint subido corresponde al paso 26.000. El repositorio incluye el modelo preentrenado, la configuración y los procesadores de normalización, pero no incluye el estado del optimizador, del scheduler ni del generador de números aleatorios, por lo que no es posible reanudar el entrenamiento desde este checkpoint. No se documentan el número de tokens, la composición exacta del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Control robótico bimanual: genera acciones de 12 dimensiones para un robot SO-101 de dos brazos a partir de observaciones visuales y del estado del robot.
- Condicionamiento por lenguaje: acepta una cadena de tarea ("stir", "pour water", "pour green tea latte powder", "pour coffee powder") que guía la política.
- Percepción multivista: integra tres cámaras simultáneas (vista superior y una por muñeca).
- Generación de chunks de acción: emite secuencias de 50 acciones por inferencia, lo que reduce la frecuencia de llamadas al modelo en el bucle de control.
- Integración con LeRobot: carga mediante `SmolVLAPolicy.from_pretrained` y usa los pre/postprocesadores de la librería para normalizar observaciones y recuperar acciones en escala original.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Preparación automatizada de bebidas en laboratorio: el modelo ejecuta las cuatro tareas entrenadas (remover, verter agua, verter matcha y verter café) sobre un SO-101 bimanual, lo que permite montar una celda de demostración reproducible con LeRobot.
- Investigación en manipulación bimanual: sirve como punto de partida para estudiar coordinación entre brazos, ya que el vector de acción de 12 dimensiones codifica ambos brazos de forma conjunta.
- Evaluación de ajuste fino de VLAs pequeños: con 450 M de parámetros y 0,9 GB, permite comparar recetas de fine-tuning sobre `smolvla_base` sin grandes recursos de cómputo.
- Base para nuevos ajustes en tareas de cocina: el checkpoint puede reutilizarse como inicialización para tareas relacionadas (servir, mezclar, dosificar) con un dataset propio.
- Docencia y prototipado en robótica: la integración directa con LeRobot y el uso de pre/postprocesadores estándar facilitan montar prácticas de VLA en cursos o talleres.
- Pruebas de pipelines de inferencia en el borde: su tamaño reducido permite experimentar con latencias y frecuencias de control en hardware modesto antes de escalar a modelos mayores.
- Replicación de experimentos: al documentarse la ejecución de entrenamiento y el paso del checkpoint, sirve para reproducir y auditar el proceso de ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la subida no establece rendimiento físico en robot real, por lo que no hay tasas de éxito ni métricas de tarea reportadas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450 M de parámetros en safetensors, los pesos ocupan aproximadamente 0,9 GB en FP32; en FP16/BF16 bajaría a unos 0,9 GB en total considerando overhead, y en cuantizaciones de 8 o 4 bits sería aún menor. No se documentan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM debería bastar para el modelo; una RTX 4090 o A100/H100 aportarían margen para procesar las tres cámaras y mantener frecuencia de control alta.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas tipo RTX 3060/4060 en adelante, aunque la latencia real depende del preprocesado de imágenes y del bucle de control, no solo del modelo.
- Opciones de despliegue: la vía documentada es LeRobot (`SmolVLAPolicy` con `make_pre_post_processors`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para este tipo de política robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 2chan/beverage-smolvla-26k | 450 M | no disponible | VLA bimanual para bebidas (SO-101) | no disponible | Hugging Face |
| lerobot/smolvla_base | no disponible en la informacion | no disponible | VLA generalista base | no disponible en la informacion | Hugging Face |
| Otros VLA de gran tamano (p. ej. familias tipo RT-2/OpenVLA) | no disponible en la informacion | no disponible | VLA generalistas | no disponible en la informacion | no disponible |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada; el único punto de referencia documentado es el modelo base `lerobot/smolvla_base`, del que este checkpoint es un ajuste fino.

## Limitaciones y advertencias

- El modelo solo está entrenado para cuatro tareas concretas (IDs 0, 1, 2 y 4); no generaliza a otras instrucciones ni a otros objetos fuera de la distribución del dataset.
- La model card advierte de que la subida no establece rendimiento físico en robot real: no hay evidencia publicada de tasas de éxito.
- No se incluye estado de optimizador, scheduler ni RNG, por lo que no se puede reanudar el entrenamiento desde este checkpoint.
- La licencia no está indicada, lo que impide confirmar si el uso comercial está permitido; hay que contactar con el autor antes de usarlo en producción.
- No se documentan sesgos, idiomas soportados ni riesgos de alucinación específicos; en un VLA, el fallo se manifiesta como acciones incorrectas o inseguras, no como texto inventado.
- El modelo depende de la configuración exacta del robot (SO-101 bimanual, 12 dimensiones, tres cámaras con un mapeo concreto); cambios en la morfología o en la disposición de cámaras invalidan las normalizaciones guardadas.
- Con 0 descargas y 0 likes en el momento de la consulta, no hay validación comunitaria ni informes independientes de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/2chan/beverage-smolvla-26k
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Librería LeRobot: https://github.com/huggingface/lerobot
