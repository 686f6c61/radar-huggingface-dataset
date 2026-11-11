# learner1119/ffw_sh5_n17_260820_left_eef_h50_abs_vis

## Resumen

`ffw_sh5_n17_260820_left_eef_h50_abs_vis` es una política robótica de imitación publicada por el usuario `learner1119` en Hugging Face, obtenida mediante fine-tuning de GR00T N1.7 (cuyo backbone es Cosmos-Reason2-2B) sobre el dataset propio `learner1119/260820_eef` (tag v2.1). El modelo resuelve una tarea concreta de pick and place con el brazo izquierdo de un robot FFW-SH5, emitiendo poses absolutas del efector final (representación `left_eef_9d` con rot6d) más un escalar de apertura de pinza, en lugar de ángulos articulares.

La relevancia de esta ficha es doble: por un lado documenta un caso real de adaptación de un modelo fundacional de robótica (familia GR00T) a un embodiment nuevo mediante la etiqueta `NEW_EMBODIMENT`; por otro, expone el contrato de entrada/salida (frames, convenciones de rotación, normalización) que suele ser la principal fuente de errores al desplegar políticas de imitación. El checkpoint subido (`checkpoint-1000`) es explícitamente temprano y el autor advierte que no debe usarse para juzgar el rendimiento de la tarea.

El repositorio ocupa 6,9 GB, usa la librería LeRobot y licencia Apache 2.0. No se han publicado resultados de benchmarks ni métricas de éxito en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (fine-tuned); backbone Cosmos-Reason2-2B con cabeza de acción de difusión |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (entrada: 1 frame de vídeo 480×640 + estado de 10 dimensiones + instrucción de lenguaje) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, sin variantes cuantizadas documentadas) |
| Idiomas soportados | no disponible (instrucción de ejemplo: `pick and place`, en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot; carpetas `checkpoint-N/` autocontenidas con pesos, processor y estadísticas) |

## Arquitectura y entrenamiento

El modelo parte de GR00T N1.7, una política fundacional para robótica cuyo backbone es Cosmos-Reason2-2B, y añade una cabeza de acción de difusión que predice un chunk de 50 pasos de acción. En este fine-tuning se ajustan el codificador visual, el proyector, la cabeza de acción de difusión y las capas de normalización VL-LN (`tune_visual=True`), mientras que el LLM permanece congelado. La representación de acción es `left_eef_9d` en modo ABSOLUTE / EEF / XYZ_ROT6D y `left_gripper` en ABSOLUTE / NON_EEF, con horizonte de acción 50 (2,5 s a 20 fps).

El entrenamiento usa el dataset `learner1119/260820_eef` v2.1, con 95 episodios de entrenamiento (41.857 frames) y 5 episodios de hold-out (índices de origen 5, 6, 16, 65 y 68, elegidos para cubrir las posiciones iniciales de los objetos). Se emplea la etiqueta de embodiment `NEW_EMBODIMENT`, batch global de 64 (4 × A100 80GB, 16 por GPU), 50.000 pasos con guardado cada 1.000 (conservando múltiplos de 5.000), LR 1e-4 con schedule coseno, warmup 0,05, weight decay 1e-5 y state dropout 0,2.

La convención geométrica es parte crítica del modelo: la pose se expresa en el frame `arm_base_link` (ejes del mundo, origen en (0,0055, 0, 1,4316 + lift), metros), el punto EEF es el site MuJoCo `lpalm` (centro de la palma, 8 cm a lo largo de −z de `arm_l_link7`, ejes de link7) y la rotación se codifica como rot6d tomando las dos primeras filas de la matriz de rotación. La acción es el objetivo comandado (FK del objetivo articular comandado), absoluta, no un delta; el estado debe ser la FK de las articulaciones medidas del brazo izquierdo en el mismo frame y layout.

## Capacidades

- Generación de acciones robóticas de manipulación: predice chunks de 50 × 10 (pose EEF de 9 dimensiones + pinza) a partir de una imagen y el estado actual.
- Condicionamiento por lenguaje: acepta instrucciones textuales (el ejemplo documentado es `pick and place`).
- Control en espacio de tarea (pose del efector final) en lugar de espacio articular, lo que facilita el uso de IK externa.
- Salida absoluta y desnormalizada en unidades físicas (metros, rot6d, escalar 0–1 para la pinza).
- Entrada visual única: un frame de `observation.images.agentview` a 480×640.
- Soporte de un embodiment nuevo mediante la etiqueta `NEW_EMBODIMENT` de GR00T.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Pick and place con brazo izquierdo en robot FFW-SH5: es el caso para el que se entrenó; se usaría alimentando el frame de `agentview` y el estado FK del brazo, y ejecutando el chunk de 50 acciones resultante a 20 fps.
- Desarrollo de código de inferencia contra un contrato de E/S estable: el checkpoint temprano se subió precisamente para que terceros escriban el pipeline de inferencia con el formato final de entrada/salida.
- Reconstrucción de la matriz de rotación e IK en cadena: el modelo entrega rot6d no ortonormal, por lo que encaja en un pipeline que reortogonalice (`r1`, `r2`, `r3 = r1 × r2`) y resuelva IK contra el controlador del robot.
- Investigación en adaptación de modelos fundacionales a nuevos embodiments: sirve como referencia de configuración (modality config, action horizon, congelación del LLM) para replicar el proceso con otros brazos o tareas.
- Evaluación comparada espacio de tarea frente a espacio articular: el autor publica un contrapunto en espacio articular (`ffw_sh5_n17_260820_left_h50_abs_vis`) con los mismos datos e hiperparámetros, lo que permite aislar el efecto de la representación de acción.
- Prototipado de políticas de imitación en laboratorio con presupuesto de 4 × A100 80GB: la configuración de entrenamiento documentada (batch 64, 50.000 pasos) sirve de plantilla de coste para fine-tunings similares.
- Docencia y reproducción de experimentos: el repositorio incluye `modality.json` y el fichero de configuración de modalidad necesario para relanzar la inferencia o el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que `checkpoint-1000` es un checkpoint temprano subido para desarrollar el código de inferencia y que no debe usarse para juzgar el rendimiento de la tarea. Tampoco se proporcionan tasas de éxito en el hold-out (5 episodios).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 6,9 GB, lo que da una cota inferior del tamaño de los pesos en safetensors, pero no se documenta el consumo en ejecución.
- GPU recomendadas: no disponible para inferencia. Para entrenamiento, el autor documenta 4 × A100 80GB con 16 muestras por GPU.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: LeRobot (librería declarada del modelo); el resto de stacks (vLLM, llama.cpp, Ollama, TGI) no están documentados para este modelo.
- Latencia y throughput: no disponibles. Como referencia de diseño, el chunk de 50 acciones equivale a 2,5 s de ejecución a 20 fps.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Representación de acción | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `learner1119/ffw_sh5_n17_260820_left_eef_h50_abs_vis` | no disponible | chunk 50 (2,5 s a 20 fps) | EEF absoluta, rot6d | Apache 2.0 | Hugging Face, LeRobot |
| `learner1119/ffw_sh5_n17_260820_left_h50_abs_vis` | no disponible | chunk 50 | Articulaciones del brazo izquierdo | no disponible en la información | Hugging Face |
| GR00T N1.7 (base, Cosmos-Reason2-2B) | no disponible | no disponible | según configuración de embodiment | no disponible en la información | modelo base del que deriva este fine-tuning |

La comparación con alternativas de otros autores no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El checkpoint publicado (`checkpoint-1000`) es temprano: no representa el rendimiento final de la política y el autor desaconseja evaluarlo por su desempeño en la tarea.
- Entrenamiento en curso en el momento de la publicación; el contenido del repositorio puede cambiar.
- Sesgos conocidos: no documentados. El dataset es pequeño (95 episodios, 41.857 frames) y de un único entorno, por lo que se espera un ajuste estrecho a las posiciones iniciales de objeto cubiertas en el hold-out.
- Riesgo de alucinación: no aplica en el sentido de texto, pero sí existe riesgo de predicciones de acción fuera de distribución ante cambios de iluminación, cámara, posición de objetos o del robot.
- La salida de rotación no es exactamente ortonormal; es obligatorio reortogonalizar antes de la IK, y un tratamiento incorrecto produce poses inválidas.
- Dependencia estricta de convenciones: frame `arm_base_link`, origen con término `lift`, site `lpalm` y layout de estado deben coincidir exactamente con los del entrenamiento.
- Solo brazo izquierdo y una única instrucción de lenguaje documentada (`pick and place`); no se documenta soporte multilingüe ni generalización a otras tareas.
- Requiere un paso de IK externo, ya que la política no emite ángulos articulares.
- Licencia Apache 2.0: permite uso comercial, pero no se documentan garantías de seguridad para operación en robots reales; falta evaluación de riesgos físicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/learner1119/ffw_sh5_n17_260820_left_eef_h50_abs_vis
- Dataset de entrenamiento: https://huggingface.co/datasets/learner1119/260820_eef
- Contraparte en espacio articular: https://huggingface.co/learner1119/ffw_sh5_n17_260820_left_h50_abs_vis
- LeRobot (librería): https://github.com/huggingface/lerobot
- Proyecto GR00T (NVIDIA): https://github.com/NVIDIA/Isaac-GR00T
