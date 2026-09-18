# jaehyunkang/pi05-real-workbench-taco-3view-8b7104f0-object-identification-60k

## Resumen

Este repositorio contiene un checkpoint final de una política robótica de tipo VLA (vision-language-action) obtenida tras 60.000 pasos de optimización sobre el modelo base `lerobot/pi05_base`, es decir, la familia Pi0.5 de LeRobot. El autor, `jaehyunkang`, ha especializado el modelo para una única tarea denominada `object_identification` dentro de un banco de trabajo real (real workbench), usando el dataset `Myungkyu/real_workbench-taco-keyframe-gemini`. No se trata de un modelo de lenguaje conversacional, sino de un artefacto de inferencia que mapea observaciones visuales y un vector de estado a comandos de movimiento de un brazo robótico.

El modelo tiene 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) almacenados en formato safetensors, con un repositorio de 9,4 GB. La entrada visual combina tres vistas (cámara exterior, cámara de muñeca y una imagen de keyframe definida por el dataset), almacenadas a 224×126 y rellenadas a 224×224 por la política. La salida es una acción de 7 dimensiones en formato delta EEF (6 componentes de velocidad cartesiana más gripper), ejecutada por bloques de 50 acciones con 10 pasos de denoising en inferencia. El estado de entrada tiene 8 dimensiones.

Su relevancia es acotada pero concreta: es un ejemplo reproducible de ajuste fino de Pi0.5 sobre un entorno físico concreto, útil para equipos de robótica que quieran replicar el pipeline de entrenamiento o evaluar la transferibilidad de una política entrenada con instrucciones de subtarea por frame. En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 "likes", no declara licencia y no aporta métricas de evaluación en robot real, por lo que debe considerarse un artefacto de investigación sin validación externa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) de la familia Pi0.5; modelo base `lerobot/pi05_base`. El detalle interno del backbone no se especifica en la información disponible |
| Parametros totales | 4.143.404.816 (≈4,14 B), dato real de safetensors |
| Parametros activos | No aplica: no se declara una arquitectura MoE |
| Longitud de contexto | No disponible (política VLA; la instrucción de tarea se codifica con el tokenizer de `google/paligemma-3b-pt-224`) |
| Tipos de cuantizacion | No disponible. Solo se publican pesos en safetensors; no se ofrecen variantes GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | No disponible. El modelo consume texto de instrucción (subtarea por frame), pero no se declara cobertura idiomática ni multilingüe |
| Licencia | No disponible |
| Formato de pesos | safetensors (repositorio de 9,4 GB; hashes SHA-256 en `artifact_manifest.json`) |
| Vistas de imagen | 3 (exterior, muñeca y `observation.image.keyframe`) |
| Resolucion de imagen | 224×126 almacenada; la política rellena a 224×224 |
| Dimension de estado | 8 |
| Dimension de accion | 7 (delta EEF: 6 de velocidad cartesiana + gripper) |
| Horizonte de accion (chunk) | 50 |
| Pasos de denoising en inferencia | 10 |
| Pasos de entrenamiento | 60.000 pasos de optimización |
| Dataset de ajuste | `Myungkyu/real_workbench-taco-keyframe-gemini` |
| Implementacion de entrenamiento | `RLWRLD/hiwrld-ll-policy` (LeRobot Pi0.5 vendorizado) |
| Tokenizer de referencia | `google/paligemma-3b-pt-224`, revision `35e4f46485b4d07967e7e9935bc3786aad50687c` |

## Arquitectura y entrenamiento

La información publicada identifica el modelo como una política Pi0.5 procedente de `lerobot/pi05_base` y ajustada con la implementación `RLWRLD/hiwrld-ll-policy`, que incorpora una copia vendorizada de LeRobot Pi0.5. El tokenizer de referencia es el de PaliGemma 3B (`google/paligemma-3b-pt-224`), lo que sitúa la parte de lenguaje e imagen en el linaje PaliGemma, aunque la ficha no detalla la composición exacta del backbone ni del cabezal de acción. El campo de 10 pasos de denoising en inferencia indica que la generación de acciones es iterativa (muestreo por denoising/flow), no una regresión directa de un solo paso. No se declaran detalles sobre atención lineal, decodificación especulativa ni mecanismos híbridos SSM.

El ajuste fino se realizó durante 60.000 pasos de optimización con batch global de 32, 2 GPU de entrenamiento y semilla 42. La tarea es `object_identification`, con instrucciones tomadas de subtareas por frame almacenadas en parquet, y el modelo requiere explícitamente que se le proporcione el texto de subtarea correspondiente como campo `task` y, en los modelos de 3 vistas, la imagen de keyframe definida por el dataset. La entrada de estado tiene 8 dimensiones y la salida es un delta EEF de 7 dimensiones, con un horizonte de acción de 50 pasos. No se documenta ningún proceso de RLHF, DPO ni aprendizaje por preferencias; tampoco se aportan métricas de evaluación en robot real, y el propio autor aclara que se trata de un checkpoint entrenado y no de un resultado de evaluación.

## Capacidades

- Generación de acciones robóticas: produce comandos delta EEF de 7 dimensiones (6 de velocidad cartesiana más gripper) a partir de observaciones visuales y un vector de estado de 8 dimensiones.
- Percepción multi-vista: consume simultáneamente tres entradas de imagen (exterior, muñeca y keyframe), lo que le permite razonar sobre la escena desde varios puntos de vista.
- Identificación de objetos: el alcance declarado de la tarea es `object_identification` en un banco de trabajo real.
- Seguimiento de instrucciones por subtarea: acepta texto de subtarea por frame como campo `task`, lo que permite descomponer una tarea mayor en pasos.
- Generación de acciones por bloques: emite chunks de 50 acciones con 10 pasos de denoising, lo que favorece la consistencia temporal en la ejecución.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta comportamiento de agente ni razonamiento multi-paso en el sentido de un LLM; el razonamiento está acoplado a la política de control.
- No se documenta capacidad multilingüe, modo de pensamiento (thinking), visión generalista de propósito abierto, audio ni generación de texto libre.
- No se documentan capacidades de generación de código, matemáticas o conversación general.

## Casos de uso

- Identificación y localización de objetos en un banco de trabajo: el modelo está ajustado específicamente para la tarea `object_identification` con tres vistas, de modo que puede reconocer piezas sobre una superficie de trabajo y condicionar la acción posterior del brazo.
- Recogida y colocación (pick-and-place) en un montaje real: con la salida delta EEF de 7 dimensiones y el horizonte de 50 acciones, puede ejecutar aproximaciones, cierres de gripper y retiradas dentro de la misma secuencia de control.
- Replicación de experimentos de investigación en VLA: al publicarse el checkpoint, la configuración y los estados de normalización, otro laboratorio puede reproducir el ajuste fino sobre el mismo dataset y comparar curvas de entrenamiento.
- Punto de partida para ajuste fino en un entorno propio: el modelo base Pi0.5 ajustado a una tarea concreta sirve como inicialización para nuevas tareas de manipulación, siempre que se mantenga la interfaz de 3 vistas, estado de 8 dimensiones y acción delta EEF de 7 dimensiones.
- Etiquetado asistido y aumentación de datos: la política puede usarse para predecir subtareas o acciones sobre nuevas grabaciones del mismo montaje y generar datos candidatos que después se revisan manualmente.
- Demostraciones de control robótico en laboratorio o feria tecnológica: permite mostrar un pipeline VLA completo en hardware de gama alta con un único punto de control, sin necesidad de un sistema propietario.
- Evaluación de infraestructura de inferencia robótica: sirve para medir latencia de 10 pasos de denoising con 3 cámaras y comprobar si la frecuencia de control resultante es suficiente para la tarea antes de invertir en un despliegue mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reclaman métricas de evaluación en robot real ("No real-robot evaluation metrics are claimed here") y que el artefacto es un checkpoint de entrenamiento, no un resultado de evaluación.

## Requisitos de hardware

- Peso de los pesos: 4,14 B de parámetros en bf16 equivalen a unos 8,3 GB; en fp32, unos 16,6 GB. El repositorio ocupa 9,4 GB, coherente con pesos en bf16 y ficheros auxiliares.
- VRAM estimada para inferencia: entre 12 y 16 GB en bf16 sumando pesos, activaciones, buffers de imagen (3 vistas a 224×224) y estados de normalización. En fp32, entre 20 y 28 GB.
- GPU recomendadas: A100 (40 o 80 GB), H100, L40S o RTX 6000 Ada para despliegue estable; una RTX 4090 o RTX 3090 de 24 GB es suficiente para inferencia en bf16.
- Cabe en GPU de consumo: sí en RTX 4090, RTX 3090 y RTX 4080/Ti de 16 GB, aunque en las de 16 GB el margen es ajustado y depende de la librería de inferencia y del tamaño de las imágenes de entrada.
- Opciones de despliegue: la librería declarada es `lerobot` sobre PyTorch. No hay indicios de compatibilidad con vLLM, TGI, llama.cpp, Ollama ni GGUF, formatos orientados a LLM y no a políticas VLA. Los campos de entrada personalizados pueden exigir la implementación concreta `RLWRLD/hiwrld-ll-policy` en lugar de LeRobot estándar.
- Latencia y throughput: no disponibles. Se conocen 10 pasos de denoising por chunk de 50 acciones, pero no se publica el tiempo por paso ni la frecuencia de control alcanzable.
- Entrenamiento: el autor indica 2 GPU para el ajuste fino con batch global de 32; no se especifica el modelo de GPU ni las horas totales.

## Comparativa con modelos similares

Las cifras de modelos de terceros que aparecen a continuación provienen de conocimiento general y no se han podido verificar contra su documentación oficial en el momento de redactar esta ficha; deben confirmarse antes de tomar decisiones.

| Modelo | Parametros | Vistas / modalidad | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (pi05 real-workbench taco) | 4,14 B | 3 vistas (exterior, muñeca, keyframe) | No disponible | No disponible | HuggingFace, 0 descargas |
| `lerobot/pi05_base` | No disponible en esta ficha | Política VLA generalista Pi0.5 | No disponible | No disponible | HuggingFace (modelo base declarado) |
| OpenVLA-7B | ≈7 B (aproximado) | 1 vista | No disponible | No verificada en esta ficha | HuggingFace |
| Pi0 / `lerobot/pi0` | ≈3 B (aproximado) | Multi-vista según configuración | No disponible | No verificada en esta ficha | HuggingFace |

La diferencia principal frente a alternativas generalistas es de alcance: este checkpoint está especializado en una tarea y un montaje concretos, con una interfaz de entrada fija (3 vistas, estado de 8 dimensiones, instrucción de subtarea por frame), mientras que los modelos base de la misma familia apuntan a un rango más amplio de tareas. A cambio, el ajuste específico debería mejorar el desempeño en su dominio, algo que no puede confirmarse porque no se publican métricas.

## Limitaciones y advertencias

- Ausencia total de evaluación: el autor declara que no se reclaman métricas en robot real, por lo que el rendimiento real de la política es desconocido.
- Licencia no disponible: sin licencia declarada no puede asumirse permiso para uso comercial, redistribución o modificación; es un riesgo legal directo para cualquier despliegue en producción.
- Especialización estrecha: el alcance declarado es `object_identification` sobre un banco de trabajo concreto, con 8 dimensiones de estado y acción delta EEF de 7 dimensiones. No es portable sin reentrenamiento a otras morfologías, otros espacios de acción o tareas distintas.
- Dependencia de la interfaz de entrada: requiere las tres vistas exactas, incluida la imagen de keyframe definida por el dataset, y el texto de subtarea por frame. Si falta cualquiera de estos campos, la inferencia no es correcta.
- Dependencia de implementación: los campos de entrada personalizados pueden requerir la implementación `RLWRLD/hiwrld-ll-policy`; con LeRobot estándar puede no funcionar tal cual.
- Riesgo de sobreajuste al montaje: 60.000 pasos sobre un único dataset y una única tarea pueden producir un ajuste excesivo a la iluminación, la disposición de cámaras y los objetos vistos en entrenamiento.
- Sin validación de la comunidad: 0 descargas y 0 "likes" en el momento de la consulta; no hay informes independientes de funcionamiento.
- Idiomas no declarados: no puede asumirse que las instrucciones de subtarea funcionen en castellano ni en idiomas distintos del usado en el dataset.
- Riesgo de alucinación en el sentido de acciones plausibles pero incorrectas: como toda política generativa, puede producir trayectorias que parezcan válidas y no serlo; requiere supervisión y límites de seguridad físicos.
- Sesgos potenciales heredados del modelo base Pi0.5 y del dataset `real_workbench-taco-keyframe-gemini`; no se documenta ningún análisis de sesgo ni mitigación.
- Sin cuantizaciones publicadas: no hay GGUF, AWQ ni GPTQ, lo que limita el despliegue en hardware de bajos recursos y descarta stacks como llama.cpp u Ollama.
- Artefacto solo de inferencia: excluye estado de optimizador y de reanudación del entrenamiento, y las rutas específicas de la máquina se eliminaron del JSON, por lo que reanudar el entrenamiento exige reconstruir rutas locales.
- Fecha de creación y actualización en 2026 sin historial de versiones adicional; no se declara mantenimiento posterior.

## Enlaces

- Ficha del modelo en HuggingFace: https://huggingface.co/jaehyunkang/pi05-real-workbench-taco-3view-8b7104f0-object-identification-60k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de ajuste: https://huggingface.co/datasets/Myungkyu/real_workbench-taco-keyframe-gemini
- Tokenizer de referencia: https://huggingface.co/google/paligemma-3b-pt-224
- Implementación de entrenamiento mencionada en la model card: `RLWRLD/hiwrld-ll-policy` (referenciada por nombre; no se proporcionó URL en la información disponible)
- Búsqueda web: los resultados recuperados no guardan relación con el modelo (contenido en chino sobre jugadores de DOTA y un tutorial de Windows). No se han encontrado artículos, papers ni repositorios adicionales relevantes para esta ficha.
