# padiredd/dp-blockpick-10k-statenoise

## Resumen

dp-blockpick-10k-statenoise es una política de difusión (diffusion policy) para robótica desarrollada por el usuario padiredd, entrenada sobre el fork lerobot-cyclo de LeRobot. Resuelve una tarea concreta de manipulación: el pick vertical (top-down) de un bloque cúbico de 5x5x4 cm con el brazo izquierdo del robot ROBOTIS FFW SG2, equipado con pinza ROBOTIS CAD y cámaras de muñeca calibradas, sobre una mesa de 29,25 pulgadas. No es un modelo de lenguaje: es un modelo de control motor que mapea observaciones visuales y propioceptivas a acciones articulares.

El modelo tiene 287.533.680 parámetros (aproximadamente 288 M) y se distribuye en formato safetensors dentro de un repositorio de 11,6 GB que incluye el checkpoint final (100k pasos) en la raíz y diez checkpoints intermedios cada 10.000 pasos. La entrada combina tres cámaras de 240x240 (cabeza, muñeca izquierda y muñeca derecha) con un vector de estado articular de 22 dimensiones; la salida son 16 objetivos articulares a 15 Hz.

Su relevancia es acotada pero clara: documenta de forma inusualmente transparente el efecto de una decisión de entrenamiento concreta, la inyección de ruido gaussiano de 1 grado sobre las posiciones articulares del brazo izquierdo en la entrada de estado. Según la propia model card, esa decisión degrada el rendimiento frente a la variante sin ruido de estado, lo que convierte al modelo en un caso de estudio útil sobre robustez percibida frente a éxito real en simulación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (DDPM) con encoder ResNet18 por cámara; fork lerobot-cyclo de LeRobot |
| Parametros totales | 287.533.680 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; horizonte de predicción 64 pasos, 32 ejecutados, n_obs_steps 1 |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (modelo de robótica; la tarea se especifica con la cadena "pick up the lime green block with the left arm") |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es una política de difusión condicionada por observaciones. Cada una de las tres cámaras (cabeza, muñeca izquierda, muñeca derecha) pasa por un encoder ResNet18 independiente; la representación visual resultante se combina con un vector de estado de 22 dimensiones que incluye las posiciones articulares. El decodificador genera trayectorias de acción mediante DDPM con 100 pasos de difusión, con un horizonte de predicción de 64 pasos del que se ejecutan 32, y n_obs_steps de 1. Las acciones son 16 objetivos articulares publicados a 15 Hz.

El entrenamiento se realizó durante 100.000 pasos con batch de 32, optimizador Adam con tasa de aprendizaje 1e-4 y scheduler coseno, semilla 1000, sobre una única NVIDIA RTX A5000 de 24 GB a 4-5,7 pasos por segundo. Los datos proceden del dataset padiredd/pick-cube-topdown-region10k-full-dr2-3cam: 11.710 demostraciones en simulación (Isaac Lab) con 1.984.945 fotogramas, muestreados de forma uniforme sobre todos los fotogramas con el EpisodeAwareSampler por defecto de LeRobot. La cobertura abarca toda la región alcanzable del brazo izquierdo (1.154 cm²) con aleatorización dr2: pose inicial ±2 grados, apertura y cierre de pinza por episodio, empujones lentos con etiquetas limpias, focos de luz, desplazamientos de cámara, variación de tiempos de demostración y altura de mesa entre -2 y +2 cm. Se aplica aumentación de imagen intensa y en orden aleatorio con hasta cinco transformaciones simultáneas (brillo, contraste, saturación, tono, nitidez, afinidad, perspectiva, desenfoque, borrado aleatorio y escala de grises).

La innovación declarada es la inyección de ruido gaussiano de 1 grado sobre las siete posiciones articulares del brazo izquierdo en la entrada de estado durante el entrenamiento, controlada por el campo state_noise_std de config.json, que pertenece a un parche propio del fork lerobot-cyclo y debe eliminarse para cargar el modelo con el lerobot-cyclo estándar. Es un campo exclusivo de entrenamiento.

## Capacidades

- Control motor para pick top-down de un bloque cúbico de 5x5x4 cm con el brazo izquierdo del ROBOTIS FFW SG2, en cualquier punto de la región alcanzable de la mesa.
- Fusión de tres vistas de cámara (cabeza y ambas muñecas) con estado propioceptivo de 22 dimensiones.
- Generación de trayectorias de acción multimodales mediante difusión, con dos modos de muestreo: DDPM de 100 pasos y DDIM de 10 pasos con eta 0.
- Ejecución a 15 Hz con horizonte de 64 pasos y 32 ejecutados por inferencia.
- Generalización limitada a variaciones de apariencia no vistas en entrenamiento: la evaluación con randomización de fondo, color y textura de mesa, color de bloque, luces y montajes de cámara muestra una caída significativa de éxito.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües ni modos de pensamiento: es un modelo puramente motor.
- No dispone de capacidades de audio ni de visión general; las cámaras se usan exclusivamente como entrada de política.

## Casos de uso

- Investigación sobre robustez a ruido propioceptivo: el modelo sirve para reproducir y analizar el impacto de inyectar 1 grado de ruido gaussiano en el estado articular, comparando su curva de éxito (26% con DDIM-10 en limpio a 100k) con la variante sin ruido (66%) y con la variante cotrain-real075-statenoise (87%).
- Estudio de recetas de aumentación de imagen en políticas de difusión: la model card documenta con detalle la composición y el orden aleatorio de hasta cinco transformaciones, lo que permite aislar su efecto sobre la generalización a cambios de apariencia.
- Banco de pruebas de muestreo acelerado: la comparación DDPM-100 frente a DDIM-10 (48% frente a 26% en limpio; 31% frente a 16% con randomización) cuantifica la pérdida de éxito al reducir pasos de difusión, útil para decidir compromisos latencia-precisión en despliegue.
- Referencia para pipelines de LeRobot: al cargarse con DiffusionPolicy.from_pretrained("padiredd/dp-blockpick-10k-statenoise") y requerir el fork lerobot-cyclo, sirve como ejemplo funcional de integración de checkpoints intermedios y configuraciones personalizadas en ese ecosistema.
- Evaluación comparativa de checkpoints: los directorios step-10000 a step-90000 permiten trazar curvas de aprendizaje; en este modelo el éxito con DDIM-10 en limpio pasa de 0% a 20k, 5% a 40k, 22% a 60k, 24% a 80k y 26% a 100k, mostrando que el entrenamiento aún no ha convergido.
- Docencia y divulgación sobre manipulación simulada: el conjunto de vídeos en eval/videos/ (dos episodios exitosos y dos fallidos por condición) y los JSON por episodio en eval/<run>.json facilitan explicar modos de fallo concretos, siendo el dominante el cierre de pinza al aire (48 de 100 episodios en DDPM limpio).
- Base para experimentos de sim-to-real acotados: aunque no se reportan resultados en hardware real, la calibración de cámaras de muñeca y la definición de la región alcanzable permiten reutilizar la configuración como punto de partida, con la cautela de que el éxito en simulación es bajo.

## Benchmarks y rendimiento

Evaluación en Isaac Sim 5.1 con 100 poses de bloque uniformes sobre la región alcanzable del brazo izquierdo, idénticas entre modelos y condiciones (pares). Éxito definido como bloque sostenido al menos 5 cm sobre la mesa durante 1 s dentro de 400 ticks (26,7 s a 15 Hz). Paso 100k:

| Modelo | DDPM limpio | DDIM-10 limpio | DDPM dr | DDIM-10 dr |
|---|---|---|---|---|
| fullregion-dr2 | 74% | 66% | 60% | 54% |
| fullregion-dr2-statenoise (este modelo) | 48% | 26% | 31% | 16% |
| cotrain-real075-statenoise | 78% | 87% | 59% | 63% |

Barrido de checkpoints con DDIM-10 en condición limpia:

| Modelo | 20k | 40k | 60k | 80k | 100k |
|---|---|---|---|---|---|
| fullregion-dr2 | 0% | 1% | 26% | 49% | 66% |
| fullregion-dr2-statenoise (este modelo) | 0% | 5% | 22% | 24% | 26% |
| cotrain-real075-statenoise | 33% | 46% | 76% | 87% | 87% |

Desglose de este modelo por banda de posición y tipo de fallo (aciertos/episodios):

| Ejecución | x 0,28-0,33 | x 0,33-0,39 | x 0,39-0,44 | x 0,44-0,50 | y -0,08-+0,15 | y +0,15-+0,35 | y +0,35-+0,65 | fallo pinza al aire | bloque en pinza al agotar tiempo | otros |
|---|---|---|---|---|---|---|---|---|---|---|
| DDPM limpio | 14/35 | 15/23 | 16/28 | 3/14 | 9/26 | 13/36 | 26/38 | 48 | 2 | 2 |
| DDPM dr | 7/35 | 9/23 | 12/28 | 3/14 | 11/26 | 12/36 | 8/38 | 52 | 1 | 16 |
| DDIM-10 limpio | 12/35 | 8/23 | 6/28 | 0/14 | 1/26 | 7/36 | 18/38 | 68 | 0 | 6 |
| DDIM-10 dr | 7/35 | 1/23 | 6/28 | 2/14 | 2/26 | 4/36 | 10/38 | 71 | 5 | 8 |

No se han publicado resultados de benchmarks estándar de lenguaje o razonamiento (MMLU, HumanEval, GSM8K) en la información disponible, ni son aplicables a este tipo de modelo.

## Requisitos de hardware

- Entrenamiento documentado: una NVIDIA RTX A5000 de 24 GB, a 4-5,7 pasos por segundo con batch 32, compartida con la recolección de datos en simulación durante la fase final.
- VRAM de inferencia: no disponible de forma explícita. Con 287,5 M parámetros en fp32 (aproximadamente 1,15 GB de pesos) más tres codificadores ResNet18 y el estado de difusión, la huella es moderada, pero el autor no publica cifras medidas.
- GPU recomendadas: no disponibles. Por tamaño, cualquier GPU con al menos 8-12 GB de VRAM debería acomodar el modelo en fp32 o fp16, pero es una estimación, no un dato del autor.
- Cabe en GPU de consumo: probablemente sí en tarjetas de gama media-alta reciente, aunque no se confirma en la información disponible y el despliegue real requiere además el simulador Isaac Sim o el robot físico.
- Opciones de despliegue: carga mediante DiffusionPolicy.from_pretrained con el fork lerobot-cyclo de LeRobot; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles para inferencia. El coste dominante es el muestreo de difusión (100 pasos DDPM o 10 pasos DDIM); la comparación de éxito entre ambos modos sugiere que DDIM-10 es varias veces más rápido pero pierde aproximadamente la mitad del rendimiento en limpio (26% frente a 48%).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Éxito DDIM-10 limpio (100k) | Éxito DDPM limpio (100k) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| dp-blockpick-10k-statenoise (este) | 287,5 M | horizonte 64, 32 ejecutados | 26% | 48% | other | HuggingFace, repo 11,6 GB |
| fullregion-dr2 | no disponible | misma receta sin ruido de estado | 66% | 74% | no disponible | referenciado en la model card |
| cotrain-real075-statenoise | no disponible | misma receta con cotrain real 0,75 | 87% | 78% | no disponible | referenciado en la model card |

Los tres modelos comparten escena, dataset base y protocolo de evaluación pareado, por lo que la comparación es directa. No se dispone de datos de arquitecturas alternativas (por ejemplo, ACT o VLA de otros autores) evaluadas con este mismo protocolo, por lo que no se incluyen.

## Limitaciones y advertencias

- Rendimiento bajo en simulación: 48% de éxito con DDPM en limpio y 26% con DDIM-10, frente al 74% y 66% de la variante sin ruido de estado. El propio autor atribuye la caída a la inyección de ruido en el estado.
- El entrenamiento no ha convergido: la curva de éxito con DDIM-10 sigue subiendo a 100k (26% tras 24% en 80k), por lo que el checkpoint final no representa el techo de la receta.
- Fuerte caída con cambios de apariencia: con randomización de fondo, mesa, bloque, luces y montajes de cámara, el éxito baja a 31% (DDPM) y 16% (DDIM-10). El autor indica explícitamente que el modelo no vio ninguna de esas variaciones en entrenamiento.
- Fallo dominante específico: el cierre de pinza al aire concentra 48 de 100 episodios en DDPM limpio y 71 de 100 en DDIM-10 dr, lo que indica problemas de localización fina del bloque más que de planificación.
- Sesgo espacial marcado: el éxito cae con la distancia en x (3/14 en la banda 0,44-0,50 m frente a 15/23 en 0,33-0,39 m) y es especialmente bajo en la banda y de -0,08 a +0,15 con DDIM-10 (1/26).
- Dependencia de un fork: el campo state_noise_std de config.json pertenece a un parche propio de lerobot-cyclo; con el lerobot-cyclo estándar hay que eliminarlo para cargar el modelo.
- Ámbito muy restringido: una única tarea, un único objeto (bloque lima de 5x5x4 cm), un único brazo y una única mesa de 29,25 pulgadas. No es un modelo generalista ni transferible sin reentrenamiento.
- Sin validación en hardware real: todos los resultados son en Isaac Sim 5.1; no se reportan experimentos sim-to-real.
- Licencia "other": no se especifican términos de uso comercial. Debe consultarse el repositorio antes de cualquier despliegue productivo.
- Riesgo de alucinación en el sentido habitual no aplica; el riesgo equivalente es la generación de trayectorias plausibles que no culminan el agarre, como muestra la tasa de fallo por pinza al aire.
- Idiomas no disponibles: la interfaz de tarea es una cadena en inglés y no hay soporte multilingüe declarado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/padiredd/dp-blockpick-10k-statenoise
- Dataset de entrenamiento: https://huggingface.co/datasets/padiredd/pick-cube-topdown-region10k-full-dr2-3cam
- Repositorio del entorno y evaluación (cyclo_lab-real2sim), rutas data_collection/rollout_policy.py y data_collection/region10k/eval/: no disponible como URL directa en la información proporcionada
- LeRobot (framework base): https://github.com/huggingface/lerobot
- Isaac Lab: https://github.com/isaac-sim/IsaacLab
- Isaac Sim: https://developer.nvidia.com/isaac/sim
- ROBOTIS FFW SG2: no disponible como URL en la información proporcionada
