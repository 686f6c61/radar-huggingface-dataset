# padiredd/dp-blockpick-cap2k-no-dr

## Resumen

dp-blockpick-cap2k-no-dr es una política de difusión (diffusion policy) para robótica manipulativa, desarrollada por el usuario padiredd y publicada en Hugging Face. Se trata de un modelo de control visomotor entrenado para ejecutar una tarea concreta: recoger un bloque verde lima con el brazo izquierdo del robot humanoide ROBOTIS FFW SG2, equipado con pinza ROBOTIS CAD y cámaras de muñeca calibradas sobre una mesa de 29,25 pulgadas. El modelo sigue el paradigma LeRobot, en concreto un fork propio del autor denominado lerobot-cyclo.

El modelo tiene 287.533.680 parámetros (aproximadamente 288 M) y se distribuye en formato safetensors, con un repositorio de 11,5 GB que incluye el checkpoint final (paso 100k) en la raíz y checkpoints intermedios cada 10.000 pasos hasta el paso 90.000. No es un modelo de lenguaje: no procesa ni genera texto, sino que mapea observaciones multimodales (tres cámaras de 240x240 más un estado articular de 22 dimensiones) a acciones de 16 articulaciones a 15 Hz.

Su relevancia radica en que forma parte de un experimento de ablación controlado sobre aleatorización visual y física en entrenamiento por imitación. Esta variante concreta ("no-dr", sin aleatorización) se entrena con 2.000 demostraciones en simulación sin ninguna aleatorización visual ni física, lo que la convierte en la línea base contra la que se comparan las variantes con aleatorización. Es un artefacto de investigación, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (DDPM) con encoder ResNet18 por cámara, sobre LeRobot (fork lerobot-cyclo) |
| Parametros totales | 287.533.680 (aprox. 288 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; horizonte de predicción de 64 pasos, 32 ejecutados, n_obs_steps = 1 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una diffusion policy en el sentido de LeRobot: un proceso DDPM de 100 pasos de difusión que genera secuencias de acciones condicionadas por observaciones. Cada una de las tres cámaras (cabeza, muñeca izquierda, muñeca derecha) se procesa con un encoder ResNet18 independiente, y la representación resultante se combina con un vector de estado articular de 22 dimensiones. La salida es un vector de 16 objetivos articulares a 15 Hz, con un horizonte de predicción de 64 pasos de los cuales se ejecutan 32, y un único paso de observación (n_obs_steps = 1).

El entrenamiento se realizó durante 100.000 pasos con batch de 32, optimizador Adam con tasa de aprendizaje 1e-4 y scheduler coseno, semilla 1000, sobre una única NVIDIA A100 de 80 GB. Los datos provienen del conjunto `padiredd/Ablation_Block_none`: 2.000 demostraciones exitosas en simulación generadas con el programa CaP `block_pick_v1_nocomp.py`, sin empujones, con orientación |yaw| entre 0 y 45 grados, región completa, semillas 40001-40040 y aleatorización de apertura/cierre de pinza. Esta variante concreta no aplica ninguna aleatorización visual ni física; las variantes hermanas comparten poses de bloque, yaw, parámetros de movimiento y valores de pinza por (parte, batch, entorno) gracias a `--split_rng`, lo que permite comparaciones controladas. El muestreo de frames es uniforme sobre todos los frames (EpisodeAwareSampler por defecto de LeRobot). Como innovación destacable, se aplica augmentation de imagen agresiva en orden aleatorio (hasta 5 de: brillo 0,6-1,4, contraste 0,6-1,4, saturación 0,3-1,7, tono ±0,1, nitidez 0,3-2,0, afín ±10 grados / 10 % / 0,9-1,1, perspectiva 0,2, desenfoque, borrado aleatorio, escala de grises), sin ruido de estado.

## Capacidades

- Control visomotor para una tarea de pick-and-place: recoger un bloque verde lima con el brazo izquierdo del ROBOTIS FFW SG2.
- Fusión de tres vistas de cámara (cabeza y ambas muñecas) de 240x240 píxeles con estado articular de 22 dimensiones.
- Predicción de secuencias de acción de 16 articulaciones a 15 Hz mediante difusión (DDPM, 100 pasos).
- Generalización limitada a la distribución de entrenamiento: poses de bloque, yaw 0-45 grados y región de la mesa cubiertas por las 2.000 demostraciones.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del control robótico.

## Casos de uso

- Línea base de ablación en investigación: sirve como referencia sin aleatorización para medir el impacto de la aleatorización visual y física frente a las variantes hermanas (yaw45, cotrain-real075, etc.) en experimentos de imitación.
- Recogida de bloques en simulación: ejecutar la política en el simulador Isaac Lab con el robot FFW SG2 para validar el pipeline de control antes de transferir a hardware.
- Evaluación de robustez visual: comparar el rendimiento de este checkpoint sin aleatorización contra los entrenados con augmentation para cuantificar la brecha de sim-to-real.
- Estudio de recetas de entrenamiento: analizar la evolución de la política en los checkpoints intermedios (pasos 10k a 90k) para trazar curvas de aprendizaje y decidir cuándo convergen las políticas de difusión en tareas de manipulación.
- Reproducción de experimentos: el repositorio incluye la configuración exacta (semilla, hiperparámetros, hardware) para replicar el entrenamiento en un A100 y verificar resultados.
- Docencia y prototipado en robótica: ejemplo completo de diffusion policy con LeRobot para cursos o talleres sobre aprendizaje por imitación, con un caso de tarea acotado y bien documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los resultados de evaluación se añadirán una vez se ejecuten.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 288 M parámetros y tres encoders ResNet18, la inferencia es ligera, pero no se especifica una cifra.
- GPU de entrenamiento documentada: una NVIDIA A100 de 80 GB (ASU Sol, grp_hbenamor).
- GPU recomendadas: no disponibles; por tamaño, una GPU consumer de gama alta (RTX 3090/4090) debería ser suficiente para inferencia, aunque no se confirma en la información.
- ¿Cabe en consumer GPU? Probablemente sí para inferencia, pero no hay datos oficiales que lo confirmen.
- Opciones de despliegue: LeRobot (fork lerobot-cyclo) mediante `DiffusionPolicy.from_pretrained("padiredd/dp-blockpick-cap2k-no-dr")`; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dp-blockpick-cap2k-no-dr | 288 M | Pick de bloque con brazo izquierdo FFW SG2, sin aleatorización | Horizonte 64, 32 ejecutados, 15 Hz | other | Hugging Face |
| dp-blockpick-cap2k-yaw45 | aprox. 0,3 B | Pick de bloque con yaw hasta 45 grados | no disponible | no disponible | Hugging Face |
| dp-blockpick-cap2k-yaw45-cotrain-real075 | 288 M | Pick de bloque con co-entrenamiento real/sim | no disponible | no disponible | Hugging Face |

Las tres variantes comparten arquitectura, tamaño y receta base, y difieren en el régimen de aleatorización y en los datos de entrenamiento, lo que las hace directamente comparables dentro del mismo experimento de ablación.

## Limitaciones y advertencias

- Modelo de investigación sin resultados de evaluación publicados: no hay evidencia cuantitativa de éxito en simulación ni en hardware real.
- Entrenado exclusivamente en simulación y sin aleatorización visual ni física: se espera una brecha de sim-to-real significativa y escasa robustez ante cambios de iluminación, textura o dinámica.
- Especializado en una única tarea (recoger un bloque verde lima con el brazo izquierdo) y en una distribución acotada de poses, yaw (0-45 grados) y región de la mesa.
- No es un modelo de lenguaje: no procesa texto, no responde a prompts en lenguaje natural más allá de la cadena de tarea fija y no tiene capacidades de razonamiento o conversación.
- Licencia "other": no se especifican los términos exactos; es necesario consultar al autor antes de cualquier uso comercial.
- Riesgo de sobreajuste a las condiciones de la simulación y a la configuración concreta del robot (pinza CAD, cámaras calibradas, mesa de 29,25 pulgadas).
- El repositorio incluye diez checkpoints, lo que infla el tamaño a 11,5 GB; conviene descargar solo el checkpoint necesario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/padiredd/dp-blockpick-cap2k-no-dr
- Variante yaw45: https://huggingface.co/padiredd/dp-blockpick-cap2k-yaw45
- Variante yaw45 con co-entrenamiento real: https://huggingface.co/padiredd/dp-blockpick-cap2k-yaw45-cotrain-real075
