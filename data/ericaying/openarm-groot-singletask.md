# ericaying/openarm-groot-singletask

## Resumen

OpenArm GR00T singletask es una colección de diez modelos de política robótica obtenidos mediante fine-tuning del modelo fundacional NVIDIA GR00T-N1.7-3B sobre el dataset OpenArm. Lo publica el usuario ericaying en Hugging Face y está orientado a manipulación robótica de un solo brazo en cinco tareas concretas (colocar una esponja, apilar bloques, colocar un vaso, clasificar bloques por color y colocar una zanahoria). Cada tarea se entrena en dos variantes: A0, sin destilación de conocimiento, y A1, con destilación de scene flow en la capa 8 del LLM.

El modelo hereda la arquitectura de GR00T N1.7, un modelo visión-lenguaje-acción (VLA) de aproximadamente 3.000 millones de parámetros que combina un codificador visual, un LLM y una cabeza de acción que predice trayectorias de articulaciones. En este fine-tuning se congela el codificador visual, se permite entrenar el LLM y se ajusta la cabeza de acción, con 5.000 pasos de entrenamiento y batch 64 sobre datos remuestreados de 30 Hz a 10 Hz.

Su relevancia es doble: por un lado, demuestra el flujo de trabajo de adaptación de un modelo fundacional de robótica a un brazo concreto (OpenArm) con datos propios; por otro, introduce una técnica de destilación de características de scene flow (ZeroMSF) como señal auxiliar de entrenamiento. El autor advierte que los modelos aún no se han evaluado en hardware real, por lo que su utilidad práctica es experimental.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (visión-lenguaje-acción) basada en GR00T N1.7; codificador visual + LLM + cabeza de acción |
| Parámetros totales | ~3.000 millones (heredados de GR00T-N1.7-3B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License |
| Formato de pesos | safetensors |
| Tamaño del repo | 69,5 GB (10 modelos, ~6,95 GB cada uno) |
| Frecuencia de control | 10 Hz (16 pasos por inferencia, 1,6 s) |
| Entradas | `video.chest` (1,1,480,640,3) uint8; `state.left_arm` (1,1,7) float32; `state.left_gripper` (1,1,1) float32; instrucción en lenguaje natural |
| Salidas | `left_arm` (1,16,7) y `left_gripper` (1,16,1), objetivos absolutos de articulación |

## Arquitectura y entrenamiento

El modelo parte de GR00T N1.7, un VLA que procesa imágenes de cámara, estados de articulaciones y una instrucción textual para producir una secuencia de acciones. En este fine-tuning se congela el codificador visual, se mantiene entrenable el LLM y se ajusta la cabeza de acción que genera los objetivos de articulación. El estado de entrada se compone de siete articulaciones del brazo más la articulación del dedo del gripper, reordenadas respecto al dataset original, y los datos se remuestrean de 30 Hz a 10 Hz.

El entrenamiento se realizó durante 5.000 pasos con batch 64, learning rate de 1e-4 para la cabeza de acción y 1e-6 para el LLM, schedule cosine con warmup del 5 % y weight decay 1e-5. Se aplicó state dropout de 0,2. La variante A1 añade destilación de conocimiento en la capa 8 del LLM mediante pérdida InfoNCE con peso 0,1, usando como profesor características de scene flow de ZeroMSF con un intervalo de 0,4 s entre fotogramas. Los pesos iniciales de A0 y A1 provienen de sendos modelos GR00T N1.7 entrenados 10 épocas sobre el dataset Bridge. Se usaron todos los episodios de los datasets `openarm_t1`, `t2`, `t3`, `t5` y `t6` de `cpsu04`.

## Capacidades

- Control robótico de manipulación de un solo brazo: genera trayectorias absolutas de siete articulaciones más el gripper, en bloques de 16 pasos a 10 Hz.
- Ejecución de instrucciones en lenguaje natural, limitadas a las cinco frases exactas de entrenamiento (T1, T2, T3, T5, T6).
- Percepción visual a partir de una única cámara de pecho (`video.chest`, 480x640 RGB).
- Condicionamiento por estado propioceptivo: requiere los ángulos reales de las articulaciones en el instante de la imagen.
- Dos variantes por tarea: A0 (sin destilación) y A1 (con destilación de scene flow), para comparar el efecto de la señal auxiliar.
- No soporta tool calling, function calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito; es un modelo de política, no un asistente conversacional.
- Capacidades multilingües: no disponible; las instrucciones de entrenamiento están en inglés.

## Casos de uso

- Investigación en adaptación de modelos fundacionales de robótica: sirve como referencia reproducible de fine-tuning de GR00T N1.7 sobre un brazo concreto, con configuración de hiperparámetros y datasets documentados.
- Comparación experimental de destilación de conocimiento: las parejas A0/A1 por tarea permiten medir el impacto de la destilación de scene flow en la capa 8 del LLM con el mismo presupuesto de entrenamiento.
- Prototipado de tareas pick-and-place en laboratorio: las tareas T1 (esponja en plato), T3 (vaso en tabla) y T6 (zanahoria en plato) son escenarios sencillos de manipulación que se pueden replicar con el brazo OpenArm.
- Apilado y clasificación de bloques: T2 (apilar bloque verde sobre amarillo) y T5 (bloques azul/verde/amarillo en el cuenco) permiten evaluar precisión de posicionamiento y selección por color.
- Integración en un servidor de inferencia robótica: el script `run_gr00t_server.py` expone el modelo por red, lo que facilita conectarlo a un bucle de control externo o a un simulador.
- Base para nuevos fine-tunings: al ser un checkpoint intermedio sobre Bridge, puede servir de punto de partida para otras tareas o morfologías con la etiqueta `NEW_EMBODIMENT`.
- Docencia y divulgación: el repositorio incluye manifiestos con tamaños y sha256, lo que simplifica la verificación de descargas en entornos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que los modelos aún no se han evaluado en hardware real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia de orden de magnitud, un modelo de ~3.000 millones de parámetros en precisión de 16 bits requiere del orden de 6-7 GB solo para pesos, más memoria para activaciones y el búfer de vídeo; el tamaño de cada checkpoint es de ~6,95 GB.
- GPU recomendadas: no disponibles; el autor no especifica requisitos. Por tamaño, cabría esperar que funcione en GPUs de 16 GB o más, pero no se confirma.
- ¿Cabe en GPU de consumo? No confirmado. El tamaño de pesos es compatible con tarjetas de 16 GB en adelante, pero la carga del codificador visual y las activaciones pueden elevarlo.
- Opciones de despliegue: servidor de inferencia propio del proyecto (`gr00t/eval/run_gr00t_server.py`) sobre Isaac-GR00T en el commit `51d4c89` más un patch del autor. No se mencionan vLLM, llama.cpp, Ollama ni TGI; al ser un modelo VLA con cabeza de acción, estos motores de texto no son aplicables directamente.
- Latencia y throughput: no disponibles. La frecuencia de control es de 10 Hz con bloques de 16 pasos (1,6 s por inferencia), pero no se aportan tiempos de cómputo medidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenArm GR00T singletask (este) | ~3.000 M | no disponible | VLA fine-tune | NVIDIA Open Model License | Hugging Face, 10 checkpoints |
| nvidia/GR00T-N1.7-3B | ~3.000 M | no disponible | VLA fundacional | NVIDIA Open Model License | Hugging Face |
| Modelos de política específicos por tarea (p. ej. ACT, Diffusion Policy) | no disponible | no disponible | política imitación | variable | variable |

La comparación con alternativas concretas no está disponible en la información proporcionada. El referente directo es el modelo base NVIDIA GR00T-N1.7-3B, del que este repositorio es un fine-tune; las diferencias documentadas son el dataset (OpenArm frente a Bridge), la congelación del codificador visual, el remuestreo a 10 Hz y la destilación opcional en la variante A1.

## Limitaciones y advertencias

- Modelos no evaluados en hardware real: el autor lo indica de forma explícita; el rendimiento en el robot físico es desconocido.
- Instrucciones rígidas: cada checkpoint solo responde a la frase exacta de su tarea; variaciones de redacción no están garantizadas.
- Sin capacidades generales: no es un modelo de lenguaje conversacional ni soporta tool calling, agentes o razonamiento multi-paso.
- Dependencia de un fork del código: la configuración incluye campos de destilación que requieren el patch del autor sobre Isaac-GR00T (`51d4c89`); el código oficial no cargará estos checkpoints tal cual.
- Requisito de estado propioceptivo sincronizado: los ángulos de articulación deben corresponder al instante exacto de la imagen; un desfase degrada la predicción.
- Un solo brazo y una sola cámara: la morfología está fijada a `NEW_EMBODIMENT` con cámara de pecho y brazo izquierdo; no cubre brazos derechos, dual-arm ni otras cámaras.
- Idiomas: no disponible; las instrucciones de entrenamiento están en inglés.
- Sesgos: no documentados; al entrenar sobre un dataset propio y reducido, el modelo puede sobreajustar a las condiciones de iluminación, objetos y posiciones del dataset OpenArm.
- Riesgo de alucinación: no aplica en el sentido textual, pero sí existe riesgo de generar trayectorias inválidas o inseguras fuera de la distribución de entrenamiento.
- Licencia: NVIDIA Open Model License; conviene revisar sus términos antes de uso comercial, ya que no es una licencia de código abierto permisiva estándar.
- Tamaño del repositorio: 69,5 GB para los diez checkpoints; la descarga selectiva por directorio es recomendable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ericaying/openarm-groot-singletask
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Dataset OpenArm (referenciado en la model card): `cpsu04/openarm_t1`, `cpsu04/openarm_t2`, `cpsu04/openarm_t3`, `cpsu04/openarm_t5`, `cpsu04/openarm_t6` en Hugging Face
- Repositorio Isaac-GR00T (commit base `51d4c89`): no disponible como enlace directo en la información proporcionada
- Paper o blog de ZeroMSF (profesor de destilación): no disponible en la información proporcionada
