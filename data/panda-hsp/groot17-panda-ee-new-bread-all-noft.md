# PANDA-HSP/groot17-panda-ee-new-bread-all-noft

## Resumen

`groot17-panda-ee-new-bread-all-noft` es un ajuste fino (fine-tuning) del modelo fundacional de robótica **NVIDIA GR00T-N1.7-3B**, publicado por el usuario PANDA-HSP en Hugging Face. El modelo resuelve una tarea concreta de manipulación robótica: la transferencia de rebanadas de pan entre una tabla de cortar y un plato, usando un brazo Franka Panda con pinza Robotiq 2F y sin sensor de fuerza Robotiq FT 300. Se distribuye con la librería `lerobot` y pesos en formato `safetensors`, con 3.144.016.000 parámetros y un tamaño de repositorio de 25,2 GB.

La particularidad técnica del ajuste es que todas las poses de `observation.state` y `action` (marco de la brida `panda_link8`, sistema de referencia de la base) fueron desplazadas +0,0375 m a lo largo del eje z de la brida (`p_new = p_old + 0,0375 · R[:,2]`) para compensar la retirada del sensor de fuerza de 37,5 mm que originalmente separaba la brida de la pinza. La representación de rotación es `rotvec` con `ee_rotation_frame = "gripper_down"`, un detalle crítico que debe replicarse en el despliegue.

El checkpoint publicado corresponde al paso 40.000 de un entrenamiento de 100.000 pasos planificados (batch 8, learning rate 1e-4 con decaimiento coseno, VLM congelado, sin transformaciones de imagen, lerobot 0.6.2, colas de episodio entrenadas). Es relevante para equipos que trabajan en imitación robótica de bajo coste y quieren reutilizar la receta sin sensor de fuerza, aunque su naturaleza de ajuste específico de tarea limita su uso fuera del entorno de recogida descrito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo fundacional de robótica GR00T N1.7 (base NVIDIA), ajustado con LeRobot; detalles internos de la arquitectura no disponibles en la informacion proporcionada |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a control robótico, no a texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

El modelo parte de NVIDIA GR00T-N1.7-3B, un modelo fundacional para robótica con un componente de visión-lenguaje (VLM) que, segun la model card, se mantuvo **congelado** durante el ajuste fino. El entrenamiento se realizó con LeRobot 0.6.2 sobre tres conjuntos de demostraciones locales (`PANDA-HSP/new_bread_1`, `new_bread_2` y `new_bread_3`) fusionados en un conjunto multitarea denominado `new_bread_all_noft`, con 230 episodios en total y un texto de tarea propio por episodio. La configuración de entrenamiento fue batch 8, 100.000 pasos, learning rate 1e-4 con decaimiento coseno, sin transformaciones de imagen y con las colas de episodio entrenadas.

La innovación técnica principal es la adaptación de las demostraciones al hardware sin sensor de fuerza: se retiró el FT 300 (37,5 mm) situado entre la brida del Panda y la pinza Robotiq 2F, y se desplazaron todas las poses +0,0375 m a lo largo del eje z de la brida para que las puntas de la pinza alcancen los mismos puntos que en las demostraciones originales. La rotación se representa como `rotvec` con `ee_rotation_frame = "gripper_down"`, que debe respetarse en el despliegue. El conjunto de evaluación reservado (`eval_split = 0.05`, últimos episodios de cada tarea) incluye los índices fusionados [58, 59, 60, 61] para mover el pan de la tabla al plato, [166–171] para coger la segunda rebanada y colocarla sobre la otra, y [227, 228, 229] para devolver la segunda rebanada del sándwich a la tabla. No se especifica en la información disponible si hubo RLHF, DPO ni el número de tokens de entrenamiento (no aplica en el sentido de modelos de lenguaje).

## Capacidades

- Control robótico de manipulación: genera acciones de efector final (posición y rotación `rotvec` en marco `gripper_down`) y comandos de pinza para el brazo Franka Panda con pinza Robotiq 2F.
- Ejecución de tareas de pick-and-place específicas: mover rebanadas de pan entre tabla de cortar, plato y sándwich, segun los textos de tarea de los tres conjuntos de demostraciones.
- Condicionamiento por lenguaje de tarea: cada episodio de entrenamiento tiene su propio texto de tarea, por lo que el modelo acepta instrucciones textuales para seleccionar el comportamiento multitarea.
- Entrada multimodal: procesa observaciones visuales (imágenes) junto con el estado del robot (`observation.state`), aunque el VLM permaneció congelado durante el ajuste.
- No se dispone de información sobre soporte de tool calling, function calling, razonamiento multi-paso, capacidades multilingües, modo thinking, visión general, audio ni otras capacidades fuera del control robótico.

## Casos de uso

- Automatización de líneas de preparación de alimentos: el modelo puede ejecutar la secuencia de coger una rebanada de la tabla y depositarla en un plato, adecuado porque fue entrenado específicamente sobre 230 episodios de esa tarea con el mismo robot y pinza.
- Sustitución de hardware con sensor de fuerza: equipos que retiran el FT 300 de su Panda pueden desplegar este checkpoint directamente, ya que las poses ya están compensadas con el desplazamiento de +0,0375 m.
- Prototipado rápido en investigación de imitación: sirve como punto de partida para comparar recetas con y sin sensor de fuerza (existe la variante `PANDA-HSP/groot17-panda-ee-new-bread-all`), útil para estudiar el impacto del sensor en la política aprendida.
- Evaluación de generalización multitarea: al fusionar tres tareas de pan con textos distintos, permite medir si una única política condicionada por lenguaje mantiene el rendimiento en cada subtarea.
- Docencia y reproducción de experimentos: la receta está documentada (batch 8, 100k pasos, lr 1e-4 coseno, VLM congelado, lerobot 0.6.2) y los checkpoints se publican por ramas `step-XXXXXX`, lo que facilita replicar el pipeline en laboratorios con un Panda.
- Validación de despliegue con `ee_rotation_frame = "gripper_down"`: útil como caso de prueba para verificar que el stack de control del robot respeta la convención de rotación correcta antes de escalar a otras tareas.
- Benchmark interno de políticas robóticas: el conjunto reservado con índices concretos ([58–61], [166–171], [227–229]) permite una evaluación reproducible de éxito por subtarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente describe el conjunto de evaluación reservado (`eval_split = 0.05`) y los índices de episodios retenidos, pero no incluye tasas de éxito, métricas de error de posición ni comparaciones numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo de 3.144 millones de parámetros en FP16 requiere aproximadamente 6,3 GB solo para pesos, a lo que hay que sumar activaciones, buffers de imagen y el estado del entorno; en FP32 serían unos 12,6 GB. Estas cifras son estimaciones de cálculo, no datos publicados por el autor.
- GPU recomendadas: no disponible. No se especifican GPU probadas por el autor.
- Cabe en GPU de consumo: no confirmado por el autor. Por tamaño de pesos, sería plausible en GPUs con 12 GB o más en FP16, pero no hay validación publicada.
- Opciones de despliegue: la librería indicada es `lerobot` (versión de entrenamiento 0.6.2). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `PANDA-HSP/groot17-panda-ee-new-bread-all-noft` (este) | 3.144.016.000 | no disponible | no disponible | Ajuste sin sensor FT 300, poses compensadas +0,0375 m, checkpoint paso 40.000 |
| `PANDA-HSP/groot17-panda-ee-new-bread-all` | no disponible | no disponible | no disponible | Misma receta, pero con demostraciones que incluyen el sensor FT 300 |
| `nvidia/GR00T-N1.7-3B` | ~3B (modelo base) | no disponible | no disponible | Modelo fundacional de robótica de NVIDIA del que deriva este ajuste |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado únicamente para tareas de manipulación de pan con un Panda y una pinza Robotiq 2F; no se espera que generalice a otros objetos, robots o pinzas.
- Dependencia de la convención de rotación: el despliegue debe usar `ee_rotation_frame = "gripper_down"` y rotación en `rotvec`; cualquier otra convención invalida las acciones generadas.
- Compensación geométrica obligatoria: las poses asumen la ausencia del FT 300 y el desplazamiento de +0,0375 m; montar el sensor de fuerza produciría un error sistemático de posición.
- Checkpoint intermedio: el paso 40.000 no es el final del entrenamiento planificado (100.000 pasos); el rendimiento puede mejorar en checkpoints posteriores de las ramas `step-XXXXXX`.
- Datos de entrenamiento no públicos: los conjuntos `new_bread_1/2/3` son locales y no están en el Hub, lo que impide auditar la composición del dataset.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; debe verificarse con el autor y con la licencia del modelo base NVIDIA GR00T-N1.7-3B antes de cualquier despliegue en producción.
- Riesgo de sobreajuste al entorno: sin transformaciones de imagen durante el entrenamiento, la política puede ser sensible a cambios de iluminación, fondo o posición de cámara.
- Sin métricas publicadas: no hay tasas de éxito ni comparaciones con la variante con sensor de fuerza, por lo que el impacto real de la eliminación del FT 300 no está cuantificado.
- Idiomas y sesgos: no se dispone de información sobre sesgos, alucinación en el componente VLM (congelado) ni cobertura lingüística de las instrucciones de tarea.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PANDA-HSP/groot17-panda-ee-new-bread-all-noft
- Variante con sensor de fuerza (referencia de receta): https://huggingface.co/PANDA-HSP/groot17-panda-ee-new-bread-all
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- LeRobot (librería): https://github.com/huggingface/lerobot
- Resultados de búsqueda web: no se han encontrado enlaces técnicos relevantes; los resultados devueltos corresponden a páginas sobre el animal panda y a Panda Security, sin relación con el modelo.
