# RainyBot/SeGo-pi-RealMan-RightHandBottle

## Resumen

SeGo-pi RealMan RightHand Bottle es una política robótica de tipo vision-language-action (VLA) desarrollada por RainyBot, obtenida mediante fine-tuning del modelo base PI0 (openpi) a partir de sus pesos oficiales en PyTorch. El modelo está especializado en una única tarea: agarrar una botella de agua y entregarla, sobre un brazo robótico RealMan de doble brazo. Con 3.238.048.528 parámetros (aproximadamente 3,24 mil millones) y un repositorio de 6,5 GB en safetensors, se distribuye como checkpoint final de inferencia junto con estadísticas de normalización, tokenizador y código de carga.

El entrenamiento se realizó durante 60 épocas y 37.140 pasos de optimizador sobre ocho DCU de Hygon, con batch global de 64 y precisión bfloat16, a partir de 100 grabaciones (39.674 fotogramas) divididas en 108 segmentos continuos independientes y sin split de validación. La pérdida media registrada en la última época es de 0,003434, aunque el autor no realizó ninguna evaluación de tasa de éxito en robot real, lo que convierte este dato en una señal de ajuste al dataset, no de rendimiento en tarea.

Su relevancia es acotada pero clara para el ecosistema openpi: sirve como referencia reproducible de cómo adaptar PI0 a un hardware concreto (RealMan) con un conjunto de datos pequeño, y documenta de forma explícita la interfaz de observación (19 dimensiones de estado) y de acción (20 dimensiones, objetivos absolutos de efector final con rotación 6D). No es un modelo de propósito general, sino una política de un solo cometido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de PI0 (openpi); transformer con entrada multimodal imagen + estado |
| Parametros totales | 3.238.048.528 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (horizonte de acción de 32 pasos) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en bfloat16/safetensors) |
| Idiomas soportados | en |
| Licencia | apache-2.0-and-gemma-terms (Other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una política PI0 afinada, es decir, una arquitectura VLA que combina un codificador visual y de lenguaje con un decodificador de acciones, tomando como entrada tres cámaras RGB (`base_0_rgb`, `left_wrist_0_rgb`, `right_wrist_0_rgb`) de resolución 360x480x3 en uint8 HWC, un vector de estado de 19 dimensiones y un prompt de texto opcional (por defecto: "Grasp the water bottle and hand it over."). Las imágenes se redimensionan con padding que preserva el aspecto hasta 224x224, y tanto el estado como las acciones se rellenan hasta 32 dimensiones. La salida es un horizonte de 32 pasos por 20 dimensiones de acción tras la normalización inversa media/std.

El entrenamiento se ejecutó durante 60 épocas y 37.140 pasos de optimizador en ocho DCU de Hygon con batch global de 64 en bfloat16, sobre 100 grabaciones (39.674 fotogramas) organizadas en 108 segmentos continuos independientes, sin conjunto de validación. No se documenta el uso de RLHF ni DPO. La interfaz de acción es relevante técnicamente: 20 dimensiones con el brazo izquierdo primero y el derecho después, cada uno como `[x_m, y_m, z_m, r00, r10, r20, r01, r11, r21, gripper_command]`, donde la rotación 6D codifica las dos primeras columnas de la matriz de rotación. Las acciones son objetivos absolutos de efector final, en un espacio distinto al del estado medido, por lo que deben preservarse los marcos de coordenadas y las unidades del gripper del dataset original.

## Capacidades

- Generación de acciones robóticas de manipulación: produce trayectorias de 32 pasos para dos brazos con control de gripper.
- Percepción visual multimodal: procesa tres vistas RGB simultáneas (cámara base y muñecas izquierda y derecha).
- Condicionamiento por instrucción en lenguaje natural mediante prompt de texto.
- Control de doble brazo con 7 articulaciones por brazo, dos grippers medidos, dos articulaciones de cabeza y una de plataforma (estado de 19 dimensiones).
- Representación de orientación mediante rotación 6D continua.
- No dispone de tool calling, function calling ni capacidades de agente multi-paso.
- Capacidad multilingüe limitada al inglés en el prompt.
- No incluye visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en políticas VLA: sirve como punto de partida reproducible para estudiar el fine-tuning de PI0 sobre un robot concreto, ya que el paquete incluye estadísticas de normalización, tokenizador y procedencia del checkpoint.
- Automatización de una tarea de pick-and-place concreta: entrega de una botella de agua con un brazo RealMan, usando las tres cámaras y el prompt por defecto para generar las 32 acciones del horizonte.
- Benchmark interno de adaptación de dominio: permite medir cuánto se desvía una política PI0 afinada con 100 grabaciones respecto al modelo base en el mismo hardware, siempre que se añada una evaluación de éxito real.
- Base para aprendizaje por imitación con datasets leRobot: el dataset de origen (`pi05-realman-right-hand-bottle-20261122-lerobot`) y el formato de entrada documentado facilitan reentrenar con nuevos datos manteniendo la interfaz.
- Prototipado de pipelines de control en simulación o laboratorio: la salida de 32x20 acciones con normalización inversa puede conectarse a un bucle de control que reinterprete los objetivos absolutos de efector final.
- Docencia y divulgación sobre VLA: el modelo ilustra de forma concreta la separación entre espacio de estado y espacio de acción, y el uso de rotación 6D en políticas robóticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se realizó ninguna evaluación de tasa de éxito en robot real; el único dato de entrenamiento es la pérdida media de la última época (0,003434), que no constituye una métrica de rendimiento en tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 3,24 mil millones de parámetros en bfloat16, el peso de los pesos ronda los 6,5 GB, por lo que se necesita al menos ese margen más el coste de activaciones y del codificador visual.
- GPU recomendadas: no especificadas por el autor; el entrenamiento se realizó en ocho DCU de Hygon, no en GPU NVIDIA.
- Compatibilidad con GPU de consumo: no confirmada; por tamaño de pesos podría caber en tarjetas con 12-16 GB o más en precisión reducida, pero no hay validación publicada.
- Opciones de despliegue: el autor solo documenta la carga mediante `load_policy.py` incluido en el repositorio, que requiere un checkout de OpenPI con la configuración `pi0_realman_right_hand_bottle_20261122` y `RealManInputs`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no son adecuados para este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SeGo-pi RealMan RightHand Bottle | 3,24 B | no disponible (horizonte 32) | Manipulación de una tarea (botella, RealMan) | apache-2.0-and-gemma-terms | Hugging Face, requiere OpenPI modificado |
| PI0 base (openpi) | no disponible en la información | no disponible | Política VLA general | Apache-2.0 (componentes Gemma aparte) | Repositorio openpi |
| Otros fine-tunes de PI0 | no disponible | no disponible | Depende del dataset | Variable | no disponible |

No se dispone de datos de benchmarks ni de otros fine-tunes comparables en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Ausencia total de evaluación de éxito en robot real: la pérdida de entrenamiento no garantiza que la política funcione.
- Entrenado sobre un único dataset de 100 grabaciones y sin split de validación, con riesgo alto de sobreajuste.
- Especializado en una sola tarea y un solo robot (RealMan, mano derecha, botella de agua); no generaliza a otras tareas sin reentrenamiento.
- Requiere un checkout de OpenPI modificado con la configuración `pi0_realman_right_hand_bottle_20261122` y `RealManInputs`; el OpenPI estándar no es suficiente.
- Las marcas de tiempo sintéticas a 30 Hz no garantizan una temporización física uniforme.
- El estado y las acciones viven en espacios distintos; mezclar marcos de coordenadas o unidades del gripper invalida las predicciones.
- Licencia mixta: el código OpenPI es Apache-2.0, pero los componentes derivados de Gemma quedan sujetos a los Gemma Terms of Use, lo que condiciona el uso comercial.
- Idiomas: solo inglés en el prompt.
- Riesgo de alucinación de acciones no caracterizado; no hay datos sobre sesgos.
- Sin descargas ni likes en el momento de la consulta, lo que implica ausencia de validación por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RainyBot/SeGo-pi-RealMan-RightHandBottle
- Licencia Gemma: https://huggingface.co/RainyBot/SeGo-pi-RealMan-RightHandBottle/blob/main/LICENSE_GEMMA.txt
- Dataset de origen: `Yyyyyyffffffff/pi05-realman-right-hand-bottle-20261122-lerobot`, revisión `6b16d38f698ac70b8eb5bf236f4043557db83d4a` (no se proporciona URL directa en la información disponible)
- OpenPI (repositorio base): no se proporciona enlace en la información disponible
