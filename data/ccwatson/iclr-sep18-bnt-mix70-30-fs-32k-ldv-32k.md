# ccwatson/iclr-sep18-bnt-mix70-30-fs-32k-ldv-32k

## Resumen

El modelo `ccwatson/iclr-sep18-bnt-mix70-30-fs-32k-ldv-32k` es un checkpoint de investigación publicado en HuggingFace por el usuario ccwatson dentro de la biblioteca `molmobot`. Se trata del checkpoint sin sharding correspondiente al paso 32.000 del entrenamiento `iclr-sep18-bnt-mix70-30-fs-32k-ldv`, obtenido mediante fine-tuning del modelo base `allenai/MolmoBot-DROID`. Su pipeline declarado es `robotics` y su propósito es la manipulación robótica, concretamente tareas del tipo "next-to" (colocar un objeto junto a otro) sobre un brazo Franka.

El modelo se ha entrenado sobre una mezcla 70/30 de dos fuentes: el dataset `ccwatson/PnP-NT-NTO-Moderate45-Concat-Sep18-23732-MolmoBot` (revisión `7c31f64a76ea2bd659cf6ce5f17cfdcc2666aab2`, con trayectorias recortadas en su primer éxito estricto) y la vista de entrenamiento oficial preparada de MolmoSpaces Next-To MolmoBot, esta última con trayectorias completas. Las instrucciones de entrenamiento emplearon el perfil de prompt `basic_next_to`.

Se trata de un artefacto de investigación con relevancia limitada fuera del ámbito de replicación experimental: no tiene descargas ni likes, su licencia e idiomas no están declarados y su primera evaluación intermedia falló, por lo que no existen métricas válidas publicadas para este checkpoint. La model card no especifica arquitectura, número de parámetros ni contexto, más allá de la longitud de secuencia de entrenamiento (928).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de visión-lenguaje-acción derivado de allenai/MolmoBot-DROID; la model card no detalla la arquitectura) |
| Parametros totales | no disponible |
| Parametros activos | no aplica / no disponible |
| Longitud de contexto | no disponible (longitud de secuencia de entrenamiento: 928 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene un checkpoint "unsharded" de 20,0 GB; no se especifica el formato de serialización) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo. Se sabe que parte de `allenai/MolmoBot-DROID` y que se ha fine-tuneado con la librería `molmobot`, con etiquetas que lo identifican como modelo de robótica para manipulación "next-to" sobre un brazo Franka. Los ajustes de entrenamiento declarados son: 32.000 pasos, batch por dispositivo de 16, batch global de 32, preset de acción `franka_joint`, preset de cámara `franka_droid`, longitud de secuencia de 928, 2 pasos de observación con delta de 8, un máximo de 4 imágenes por muestra y LLM entrenable (`trainable LLM: true`). No se indica el número total de tokens vistos, la composición detallada del dataset más allá de la mezcla 70/30, ni si se aplicaron etapas de RLHF, DPO u otros métodos de alineamiento.

La innovación metodológica declarada es la estrategia de mezcla y filtrado de datos: el 70 % de las muestras procede de un dataset propio con trayectorias recortadas en su primer éxito estricto (lo que elimina las fases de recuperación de error posteriores al éxito), mientras que el 30 % restante son trayectorias completas de la vista oficial de MolmoSpaces Next-To. El perfil de prompt utilizado es `basic_next_to`. No se documentan innovaciones de inferencia como decodificación especulativa, atención lineal ni mecanismos similares.

## Capacidades

- Ejecución de políticas de manipulación robótica del tipo "next-to": colocar un objeto junto a otro sobre una mesa, según el dataset y las etiquetas declaradas.
- Control de un brazo Franka mediante el preset de acción `franka_joint`, es decir, comandos en el espacio de articulaciones.
- Procesamiento de entrada visual desde el preset de cámara `franka_droid`, con hasta 4 imágenes por muestra.
- Condicionamiento por instrucciones en lenguaje natural mediante el perfil de prompt `basic_next_to`.
- Uso de contexto temporal multi-paso: 2 pasos de observación con un delta de 8 entre ellos.
- Fine-tuning adicional: al ser un checkpoint de pesos completos y con LLM entrenable, es reutilizable como punto de partida para nuevos ajustes.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, multilingüismo, visión general, audio ni modo de pensamiento ("thinking mode"). Todo lo anterior debe considerarse "no disponible".

## Casos de uso

- Investigación en manipulación robótica "next-to": permite reproducir y auditar el paso 32.000 de un experimento concreto de fine-tuning sobre MolmoBot-DROID, útil para estudiar el efecto de la mezcla 70/30 y del recorte de trayectorias en el primer éxito estricto.
- Punto de partida para nuevos fine-tunings: al ser un checkpoint completo con LLM entrenable, un laboratorio puede continuar el entrenamiento con su propio dataset de tareas de colocación sobre Franka sin partir del modelo base.
- Evaluación comparativa de recetas de datos: sirve como referencia frente a otros checkpoints del mismo run para aislar el impacto del número de pasos y de la composición del dataset.
- Validación de infraestructura de evaluación robótica: dado que su evaluación falló por problemas de conexión WebSocket y duplicación de episodios, es un caso útil para probar pipelines de evaluación en clúster (GRASP, Betty) con directorios de salida limpios.
- Replicación de experimentos en simulación: las trayectorias de MolmoSpaces Next-To permiten probar políticas en entornos simulados antes de transferir a hardware real.
- Docencia y formación en visión-lenguaje-acción: un modelo de 20 GB con fine-tuning conocido es un ejemplo manejable para ilustrar el ciclo completo de entrenamiento y evaluación en robótica.
- Automatización de pick-and-place en línea de laboratorio: como política de colocación relativa, encaja en celdas robotizadas donde la tarea sea dejar piezas adyacentes entre sí, siempre que se valide previamente su rendimiento, hoy no medido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks válidos en la información disponible.

La model card indica explícitamente que la primera evaluación intermedia de este checkpoint en Betty no se completó: el servidor de modelos desconectó el WebSocket durante el intento inicial y la continuación, que reutilizó un directorio de salida parcialmente poblado, abortó los cuatro shards por resultados de episodio duplicados. El resultado cubrió solo 31 de 40 episodios del benchmark y se registró como fallido, por lo que sus métricas parciales no deben considerarse una evaluación completada válida. El registro del fallo está en el run `external-eval-iclr-sep18-bnt-mix70-30-fs-32k-ldv-step32000` de Weights & Biases.

| Benchmark | Resultado | Estado |
|---|---|---|
| Evaluación externa en Betty (40 episodios) | sin métricas válidas (solo 31 de 40 episodios, registro marcado como fallido) | fallida |
| MMLU, HumanEval, GSM8K u otros benchmarks de texto | no disponible | no aplica / no publicado |

## Requisitos de hardware

- El repositorio ocupa 20,0 GB, lo que da un límite inferior aproximado para cargar el checkpoint completo en memoria de GPU (estimación a partir del tamaño del repositorio, no confirmada por el autor).
- VRAM estimada: no disponible de forma oficial. Como referencia, cargar 20 GB de pesos en FP16 o BF16 requiere al menos 20-24 GB de VRAM solo para pesos, más memoria para activaciones, imágenes (hasta 4 por muestra) y buffers de inferencia.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una GPU de 40 GB o más (A100 40 GB, A100 80 GB, H100) es la opción conservadora; una RTX 3090 o RTX 4090 de 24 GB queda en el límite y puede no ser suficiente sin cuantización u offloading.
- Viabilidad en GPU de consumo: no confirmada. No se han publicado instrucciones de cuantización ni versiones GGUF que permitan reducir el uso de VRAM.
- Opciones de despliegue: la única vía documentada es la librería `molmobot` (campo `library_name` del repositorio). No hay soporte declarado para vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia genéricos.
- Latencia y throughput: no disponibles. El entrenamiento usó batch global 32, batch por dispositivo 16 y secuencia de 928, pero no se publican cifras de inferencia.
- Contexto de evaluación: los intentos de evaluación se ejecutaron en la infraestructura Betty y requieren reintento en el clúster GRASP con un directorio de salida nuevo.

## Comparativa con modelos similares

| Modelo | Relación | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ccwatson/iclr-sep18-bnt-mix70-30-fs-32k-ldv-32k | este modelo | no disponible | no disponible | no disponible | 0 descargas, 0 likes |
| allenai/MolmoBot-DROID | modelo base del que deriva | no disponible en la información proporcionada | no disponible | no disponible | no disponible |
| Otros checkpoints del run iclr-sep18-bnt-mix70-30-fs-32k-ldv | misma receta, distintos pasos | no disponible | no disponible | no disponible | no disponible |
| Alternativas de la misma categoría (por ejemplo, otras políticas visión-lenguaje-acción para manipulación) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de este checkpoint, por lo que no es posible establecer una comparación de rendimiento con alternativas.

## Limitaciones y advertencias

- Evaluación no válida: la única evaluación intermedia conocida falló y cubrió 31 de 40 episodios, con métricas marcadas como no fiables. No hay evidencia publicada de que el modelo funcione correctamente.
- Licencia no declarada: al no especificarse licencia, no puede asumirse permiso para uso comercial ni redistribución. Es un riesgo legal relevante para producción.
- Herencia de licencia: al ser un fine-tuning de `allenai/MolmoBot-DROID`, las condiciones del modelo base pueden aplicar de forma adicional, pero no se detallan en la información disponible.
- Idiomas no declarados: se desconoce el soporte multilingüe; el perfil de prompt `basic_next_to` sugiere instrucciones en un formato concreto y probablemente en inglés.
- Sesgos: no disponibles. No hay documentación sobre sesgos demográficos, de objeto ni de entorno.
- Riesgo de alucinación y de fallo físico: en robótica, una política que generaliza mal puede provocar colisiones, agarres fallidos o daños al entorno. Dado que no hay métricas de éxito válidas, cualquier despliegue en hardware real debe ir precedido de validación en simulación y con límites de par y de espacio de trabajo.
- Dominio estrecho: el modelo está especializado en tareas "next-to" con brazo Franka y cámaras configuradas con el preset `franka_droid`. Fuera de esa configuración (otro robot, otra cámara, otra tarea) su comportamiento no está caracterizado.
- Limitación temporal de contexto: la ventana de entrenamiento es de 928 tokens de secuencia y 2 pasos de observación con delta de 8; no se ha validado con historiales más largos.
- Artefacto de investigación: 0 descargas, 0 likes, creado y actualizado el mismo día (21 de septiembre de 2026), sin documentación de uso, sin ejemplos de inferencia y sin formato de pesos especificado.
- Trazabilidad de la evaluación: el fallo de evaluación se produjo por reutilizar un directorio de salida parcialmente poblado, lo que provocó episodios duplicados. Cualquier reintento debe usar un directorio nuevo.
- No se declara soporte de tool calling, agentes ni razonamiento multi-paso, por lo que no debe plantearse como componente de un sistema agéntico de propósito general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ccwatson/iclr-sep18-bnt-mix70-30-fs-32k-ldv-32k
- Modelo base: https://huggingface.co/allenai/MolmoBot-DROID
- Dataset de entrenamiento: https://huggingface.co/datasets/ccwatson/PnP-NT-NTO-Moderate45-Concat-Sep18-23732-MolmoBot
- Run de entrenamiento en Weights & Biases: https://wandb.ai/ccwatson/molmobot_finetune/runs/9kughda0
- Registro de la evaluación fallida: https://wandb.ai/ccwatson/molmobot_finetune/runs/external-eval-iclr-sep18-bnt-mix70-30-fs-32k-ldv-step32000

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los enlaces obtenidos correspondían a sitios de casino en línea sin relación con el contenido de esta ficha, por lo que se han omitido.
