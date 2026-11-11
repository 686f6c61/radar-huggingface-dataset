# padiredd/dp-cupbasket-abl-none

## Resumen

`dp-cupbasket-abl-none` es una política de difusión (diffusion policy) para robótica desarrollada por el usuario padiredd, entrenada sobre el stack LeRobot (fork `lerobot-cyclo` de ROBOTIS) para una tarea bimanual concreta: coger un vaso azul con la mano izquierda, pasarlo a la mano derecha y depositarlo en una cesta. El modelo opera sobre el robot bimanual ROBOTIS FFW SG2 equipado con pinzas CAD y cámaras de muñeca calibradas, y se distribuye como checkpoint de 100 000 pasos con 287,5 millones de parámetros en formato safetensors.

Se trata de un modelo de investigación, no de un modelo de lenguaje: no procesa ni genera texto, sino que mapea observaciones visuales (tres cámaras de 240x240) y estado articular (22 dimensiones) a 16 consignas articulares a 15 Hz. Su interés radica en que forma parte de un estudio de ablación sistemático sobre aleatorización visual y física de dominio, con receta de entrenamiento congelada e idéntica a la de las políticas de referencia del mismo autor (`dp-blockpick-cap2k-*-dr`), lo que permite comparar el efecto de cada variante de aleatorización de forma controlada.

Este checkpoint concreto corresponde a la condición "abl-none": el conjunto de datos de entrenamiento (`padiredd/Ablation_Cup_none`, 2 000 demostraciones simuladas exitosas) no incluye aleatorización visual ni física. Es, por tanto, la línea base del estudio y resulta útil para medir la brecha de rendimiento frente a las variantes con aleatorización (sim-to-real, robustez a cambios de iluminación, textura o dinámica).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion policy (DDPM, 100 pasos de difusión) con codificador ResNet18 por cámara |
| Parámetros totales | 287.533.680 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; horizonte de predicción de 64 pasos, 32 ejecutados, `n_obs_steps` = 1 |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | other |
| Formato de pesos | safetensors (repo de 11,5 GB con checkpoints intermedios cada 10 000 pasos) |

## Arquitectura y entrenamiento

La política sigue el esquema de diffusion policy: un proceso DDPM de 100 pasos que genera secuencias de acciones (16 consignas articulares) condicionadas por las observaciones. Cada una de las tres cámaras (cabeza, muñeca izquierda, muñeca derecha) a 240x240 píxeles se procesa con un ResNet18 independiente; a la representación visual se le concatena un vector de estado articular de 22 dimensiones. El horizonte de predicción es de 64 pasos, de los cuales se ejecutan 32, con un único paso de observación (`n_obs_steps` = 1) y control a 15 Hz.

El entrenamiento emplea 2 000 demostraciones simuladas exitosas generadas en Isaac Lab con el programa `cup_handover_v6.py` (cierre derecho registrado 0,70 / ejecutado 0,50), semillas desde 60001 y partición `--split_rng` que mantiene idénticos layouts, parámetros de programa y valores de pinza entre los cuatro conjuntos del par de ablación. La receta está congelada: 100 000 pasos, batch de 32, Adam con tasa 1e-4 y decaimiento coseno, semilla 1000, muestreo uniforme sobre todos los fotogramas (EpisodeAwareSampler por defecto de LeRobot). La aumentación de imagen es intensa y de orden aleatorio (hasta 5 transformaciones entre brillo 0,6-1,4, contraste 0,6-1,4, saturación 0,3-1,7, tono ±0,1, nitidez 0,3-2,0, afín ±10 grados / 10 % / 0,9-1,1, perspectiva 0,2, desenfoque, borrado aleatorio y escala de grises). No se aplica ruido de estado. Todo el entrenamiento se ejecutó en una única RTX 4090 de 24 GB.

## Capacidades

- Generación de trayectorias de acción bimanuales para la tarea de transferencia de un vaso a una cesta con el robot FFW SG2.
- Control a partir de tres vistas simultáneas (cabeza y ambas muñecas) más estado articular de 22 dimensiones.
- Predicción de secuencias de 16 consignas articulares con horizonte de 64 pasos y ejecución de 32.
- Operación en el simulador Isaac Lab con el entorno de recogida y entrega definido por el autor.
- Robustez limitada a variaciones de apariencia gracias a la aumentación de imagen en entrenamiento (aunque sin aleatorización de dominio en los datos).
- No soporta tool calling, agentes, razonamiento multi-paso simbólico, ni capacidades multilingües, de visión general o de audio.

## Casos de uso

- Línea base de ablación: comparar el rendimiento de esta política sin aleatorización con las variantes con aleatorización visual y/o física del mismo estudio, manteniendo receta y datos idénticos salvo la condición ablacionada.
- Reproducción de experimentos: cargar el checkpoint con `DiffusionPolicy.from_pretrained("padiredd/dp-cupbasket-abl-none")` y evaluar los checkpoints intermedios (`step-10000/` a `step-90000/`) para estudiar curvas de aprendizaje.
- Investigación en sim-to-real: medir la degradación al transferir una política entrenada solo con datos limpios a condiciones reales o con perturbaciones, como referencia del coste de no aleatorizar.
- Desarrollo de pipelines de manipulación bimanual: usar la política como componente de percepción-acción en un entorno Isaac Lab para prototipar coordinación entre manos en tareas de handover.
- Docencia y formación: ejemplo completo y reproducible de entrenamiento de diffusion policies con LeRobot, presupuesto de una sola GPU consumer y datos sintéticos.
- Estudio de aumentación de imagen: analizar hasta qué punto la aumentación intensa compensa la ausencia de aleatorización de dominio en los datos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los resultados de evaluación se añadirán cuando se ejecuten.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño (287,5 M de parámetros, tres ResNet18 y un DDPM de 100 pasos) es esperable que quepa holgadamente en GPUs consumer de 8-12 GB, aunque no se ha confirmado en la documentación.
- GPU de entrenamiento documentada: una RTX 4090 de 24 GB (máquina "lab225"), compartida con como máximo otra ejecución de ablación.
- GPU recomendadas para entrenamiento: RTX 4090 o superior; para inferencia, cualquier GPU con suficiente VRAM para el modelo y las tres cámaras.
- Cabe en GPU consumer: sí, según el hardware de entrenamiento documentado; no se especifican modelos concretos para inferencia.
- Opciones de despliegue: LeRobot (fork `lerobot-cyclo` de ROBOTIS) mediante `DiffusionPolicy.from_pretrained`; no se documentan otras opciones (vLLM, llama.cpp, Ollama o TGI no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles. El control opera a 15 Hz según la receta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dp-cupbasket-abl-none | 287,5 M | 64 pasos (32 ejecutados) | Handover bimanual de vaso a cesta, FFW SG2 | other | Hugging Face |
| dp-blockpick-cap2k-*-dr (mismo autor) | no disponible | no disponible | Pick de bloques con aleatorización de dominio | no disponible | Hugging Face |
| Otras variantes de ablación del estudio cup (visual/física) | no disponible | no disponible | Misma tarea con aleatorización | no disponible | no disponible en la información proporcionada |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo específico de una única tarea y un único robot (ROBOTIS FFW SG2 con pinzas CAD); no generaliza a otras tareas, morfologías o entornos sin reentrenamiento.
- Entrenado exclusivamente con datos simulados (Isaac Lab) y sin aleatorización de dominio en esta condición, por lo que la transferencia a entornos reales es incierta y previsiblemente frágil.
- No es un modelo de lenguaje: no procesa texto, no responde a prompts y no tiene capacidades de razonamiento simbólico.
- Licencia "other": no se especifican los términos exactos de uso comercial; es necesario consultar al autor antes de cualquier despliegue productivo.
- No se han publicado evaluaciones de rendimiento; no hay evidencia cuantitativa de éxito en la tarea ni de robustez.
- El repositorio incluye checkpoints intermedios (11,5 GB en total), lo que aumenta el coste de almacenamiento y descarga.
- Riesgo de sobreajuste a los layouts y parámetros de programa de las semillas 60001+ del conjunto de datos.
- No se documentan sesgos sociales, pero al ser un modelo de control robótico los fallos se manifiestan como colisiones o agarres fallidos, con riesgo físico en un robot real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/padiredd/dp-cupbasket-abl-none
- Conjunto de datos de entrenamiento: `padiredd/Ablation_Cup_none` (referenciado en la model card; no se proporciona URL directa)
- Políticas de referencia del mismo autor: `padiredd/dp-blockpick-cap2k-*-dr` (referenciadas en la model card; no se proporciona URL directa)
- LeRobot: no se proporciona enlace en la información disponible
- ROBOTIS FFW SG2: no se proporciona enlace en la información disponible
- Isaac Lab: no se proporciona enlace en la información disponible
