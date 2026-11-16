# padiredd/dp-cupbasket-abl-physical-dz05

## Resumen

`dp-cupbasket-abl-physical-dz05` es una política de difusión (diffusion policy) para robótica bimanual desarrollada por el usuario `padiredd` y publicada en Hugging Face. Se trata de un modelo de control motor, no de un modelo de lenguaje: recibe imágenes de tres cámaras (cabeza y dos muñecas) más un vector de estado articular de 22 dimensiones, y produce 16 objetivos articulares a 15 Hz para que el robot ROBOTIS FFW SG2 realice una tarea concreta de manipulación.

La tarea consiste en coger un vaso azul con la mano izquierda, pasarlo a la derecha y depositarlo en una cesta. El modelo se entrena exclusivamente con demostraciones en simulación (Isaac Lab), 2.000 episodios exitosos, y forma parte de una familia de ablaciones que estudian el efecto de la aleatorización de dominio física. En esta variante (`dz05`) la altura de la mesa varía solo ±0,5 cm, frente a los ±2 cm de la variante compañera `dp-cupbasket-abl-physical`.

Con 287,5 millones de parámetros y un repositorio de 11,5 GB (incluye checkpoints intermedios cada 10.000 pasos), es relevante para investigadores que estudian transferencia sim-a-real, robustez frente a perturbaciones físicas y el impacto del dominio de entrenamiento en políticas visomotoras bimanuales. El autor indica explícitamente que el modelo aún no ha sido evaluado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (DDPM, 100 pasos) con encoder ResNet18 por cámara |
| Parametros totales | 287.533.680 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (n_obs_steps = 1; horizonte de predicción 64, 32 ejecutados) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo robótico; el autor no declara idiomas) |
| Licencia | other |
| Formato de pesos | safetensors |
| Entradas | 3 cámaras 240x240 (cabeza, muñeca izq., muñeca dcha.) + estado articular 22-dim |
| Salidas | 16 objetivos articulares, 15 Hz |
| Frecuencia de control | 15 Hz |
| Dataset de entrenamiento | `pick-cup-basket-abl-physical-dz05-2k-3cam` (2.000 demos simuladas) |
| Pasos de entrenamiento | 100.000 (checkpoints cada 10k en `step-10000/` … `step-90000/`) |
| Hardware de entrenamiento | 1x RTX 4090 24 GB |
| Tarea | "pick up the blue cup with the left hand, hand it to the right hand, and place it on the basket" |

## Arquitectura y entrenamiento

El modelo es una diffusion policy clásica: un proceso DDPM de 100 pasos que genera secuencias de acciones condicionadas por observaciones visuales y propioceptivas. Cada una de las tres cámaras pasa por un encoder ResNet18 independiente; la representación resultante se concatena con el vector de estado articular de 22 dimensiones. El horizonte de predicción es de 64 pasos, de los cuales se ejecutan 32 antes de volver a planificar, con `n_obs_steps = 1`. El entrenamiento usa Adam con tasa 1e-4, scheduler coseno, batch de 32 y semilla 1000, sobre una única RTX 4090 de 24 GB durante 100.000 pasos.

Los datos provienen de 2.000 demostraciones exitosas en Isaac Lab, recogidas con el programa `cup_handover_v6.py` y el fork `ROBOTIS lerobot-cyclo`. La aleatorización de dominio se limita a la parte física: pose inicial ±2 grados en ambos brazos, jitter de montaje y FOV de cámara, y altura de mesa ciclada en cinco niveles (−0,5 / −0,25 / 0 / +0,25 / +0,5 cm). No hay ruido de estado. El muestreo es uniforme sobre todos los fotogramas (EpisodeAwareSampler de LeRobot). Se aplica aumento de imagen agresivo: hasta cinco transformaciones aleatorias en orden aleatorio entre brillo (0,6–1,4), contraste (0,6–1,4), saturación (0,3–1,7), tono (±0,1), nitidez (0,3–2,0), afín (±10 grados / 10 % / 0,9–1,1), perspectiva (0,2), desenfoque, borrado aleatorio y escala de grises.

La innovación metodológica no está en la arquitectura sino en el diseño experimental: esta variante aísla el efecto de una aleatorización de altura de mesa más estrecha (±0,5 cm) frente a la variante de ±2 cm, manteniendo idénticos el resto de parámetros del programa, los valores de pinza y las semillas por (seed, env). Esto permite atribuir diferencias de rendimiento exclusivamente al rango de variación física.

## Capacidades

- Generación de trayectorias articulares bimanuales para una tarea específica de manipulación (recogida, handover y colocación de un vaso en una cesta).
- Percepción visomotora a partir de tres vistas simultáneas (cabeza y dos muñecas calibradas).
- Control reactivo a 15 Hz con planificación por horizonte (32 acciones ejecutadas de 64 predichas).
- Handover bimanual: coordinación entre brazo izquierdo (recogida) y derecho (recepción y colocación).
- Robustez limitada frente a variaciones de altura de mesa de hasta ±0,5 cm, por diseño del entrenamiento.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico ni capacidades multilingües: es un modelo de política motora, no un LLM.
- No dispone de modo "thinking", visión general, audio ni otras capacidades cognitivas.

## Casos de uso

- **Investigación en transferencia sim-a-real:** servir como punto de partida para evaluar si una política entrenada con aleatorización física estrecha (±0,5 cm) generaliza a mesas reales con tolerancias similares; el modelo está pensado como condición experimental frente a la variante de ±2 cm.
- **Ablaciones controladas de dominio:** al compartir receta, semillas y parámetros con el resto de la familia `dp-cupbasket-abl-*`, permite aislar el efecto del rango de altura de mesa en el éxito de la tarea sin confundir variables.
- **Handover bimanual en laboratorio:** útil como referencia para tareas de paso de objetos entre brazos con pinzas calibradas (ROBOTIS SG2 + CAD), donde la coordinación entre efectores es el cuello de botella.
- **Generación de datos sintéticos complementarios:** el checkpoint de 100k puede emplearse para producir rollouts en Isaac Lab que alimenten estudios de sensibilidad o de aumento de datos.
- **Punto de comparación en benchmarks internos de manipulación:** al tener checkpoints intermedios cada 10.000 pasos, permite analizar curvas de aprendizaje y estabilidad del entrenamiento de diffusion policies.
- **Docencia y reproducción experimental:** la receta completa (batch 32, Adam 1e-4, DDPM 100 pasos, ResNet18 por cámara) es reproducible en una sola RTX 4090, lo que facilita replicar el experimento en entornos académicos con hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el modelo "not evaluated yet", por lo que no hay tasas de éxito en simulación ni en real, ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- **VRAM para inferencia:** no disponible de forma oficial. Con 287,5 M parámetros en precisión completa (fp32) se estiman en torno a 1,2 GB solo para pesos; sumando los tres encoders ResNet18 y los buffers de difusión (100 pasos DDPM), el consumo realista en fp32 ronda 2–4 GB, aunque es una estimación, no un dato del autor.
- **GPU de entrenamiento declarada:** una RTX 4090 de 24 GB (host `lab225`).
- **GPU recomendadas:** RTX 4090 o superior para reproducir el entrenamiento; para inferencia basta con GPUs consumer de gama media-alta (RTX 3060 12 GB en adelante) siempre que se validen latencias.
- **¿Cabe en consumer GPU?** Sí, con alta probabilidad, dado el tamaño del modelo y que el autor entrenó en una sola 4090; no obstante, no hay mediciones publicadas de VRAM en inferencia.
- **Opciones de despliegue:** LeRobot (`DiffusionPolicy.from_pretrained(...)`), con integración en Isaac Lab para simulación; no se documentan soportes para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput:** no disponibles. La frecuencia de control objetivo es 15 Hz (32 acciones por chunk), lo que impone un límite superior de ~66 ms por inferencia, pero no se ha medido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `padiredd/dp-cupbasket-abl-physical-dz05` | 287,5 M | n_obs_steps 1; horizonte 64 / 32 ejecutados | Handover bimanual de vaso a cesta, altura mesa ±0,5 cm | other | Hugging Face, 0 descargas |
| `padiredd/dp-cupbasket-abl-physical` | no disponible en la información | misma receta | Misma tarea, altura mesa ±2 cm | other | Hugging Face |
| Otras variantes `dp-cupbasket-abl-*` y `dp-blockpick-cap2k-*-dr` | no disponible | misma receta congelada | Distintas ablaciones de dominio | other | Hugging Face |

La comparación cuantitativa de rendimiento entre estas variantes no está disponible porque ninguna ha sido evaluada. La comparación relevante es metodológica: misma arquitectura, mismos datos base y misma receta, variando solo el rango de aleatorización física.

## Limitaciones y advertencias

- **Modelo no evaluado:** el autor declara explícitamente que no se ha realizado evaluación; no hay evidencia publicada de éxito en simulación ni en real.
- **Alcance muy restringido:** solo ejecuta una tarea concreta (vaso azul, cesta, robot ROBOTIS FFW SG2 con pinzas CAD); no es un modelo generalista ni reutilizable fuera de esa configuración.
- **Solo simulación:** los datos son 100 % sintéticos (Isaac Lab); el gap sim-a-real no está cuantificado y puede ser significativo, especialmente en percepción visual y dinámica de contacto.
- **Robustez física limitada por diseño:** la aleatorización de altura de mesa es de solo ±0,5 cm; variaciones mayores quedan fuera del dominio de entrenamiento.
- **Sin ruido de estado:** el modelo se entrenó sin ruido en el vector articular, lo que puede reducir la robustez frente a errores de estimación de estado en el robot real.
- **Licencia "other":** no se especifican términos de uso comercial; debe consultarse al autor antes de cualquier despliegue productivo.
- **Riesgo de sobreajuste a la receta:** al compartir semilla y parámetros con otras ablaciones, los resultados pueden no transferirse a configuraciones distintas (otras pinzas, otro robot, otra iluminación).
- **Sin datos de sesgo, alucinación o multilingüismo:** no aplican en el sentido habitual, pero tampoco hay análisis de fallos publicado.
- **Repositorio pesado:** 11,5 GB por incluir checkpoints intermedios; conviene descargar solo el checkpoint raíz o el paso deseado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/padiredd/dp-cupbasket-abl-physical-dz05
- Variante compañera (altura de mesa ±2 cm): https://huggingface.co/padiredd/dp-cupbasket-abl-physical
- Dataset de referencia citado en la model card: `padiredd/Ablation_Cup_physical` (no se dispone de URL directa en la información proporcionada)
- Repositorio LeRobot: no disponible en la información proporcionada
- Fork ROBOTIS `lerobot-cyclo`: no disponible en la información proporcionada
- Isaac Lab: no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
