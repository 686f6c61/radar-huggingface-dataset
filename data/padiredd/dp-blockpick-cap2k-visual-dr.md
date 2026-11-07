# padiredd/dp-blockpick-cap2k-visual-dr

## Resumen

`dp-blockpick-cap2k-visual-dr` es una política de difusión (diffusion policy) para robótica entrenada con el framework LeRobot, concretamente sobre un fork de ROBOTIS (`lerobot-cyclo`). El modelo resuelve una tarea de manipulación concreta: recoger un bloque verde lima con el brazo izquierdo del robot bimanual ROBOTIS FFW SG2, equipado con pinza ROBOTIS CAD y cámaras de muñeca calibradas. Cuenta con 287.533.680 parámetros (aproximadamente 288 M) y un tamaño de repositorio de 11,5 GB, lo que refleja la presencia de múltiples checkpoints intermedios.

El modelo se ha entrenado exclusivamente en simulación (Isaac Lab) a partir de 2.000 demostraciones exitosas generadas con el programa CaP `block_pick_v1_nocomp.py`. Estas demos provienen de un ablation de aleatorización visual frente a física, y este checkpoint concreto corresponde únicamente al conjunto con aleatorización visual: variaciones de textura de mesa, fondos, jitter de color del bloque, luces de sala y focos, manteniendo sin embargo la pose inicial, la altura de mesa (29,25 pulgadas) y las cámaras en valores nominales.

Es relevante porque ejemplifica el flujo actual de entrenamiento de políticas visuomotoras en simulación con LeRobot, publicando checkpoints intermedios cada 10.000 pasos para facilitar el análisis de la curva de aprendizaje. No se han publicado resultados de evaluación ni benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (DDPM, 100 pasos) con encoder ResNet18 por cámara |
| Parametros totales | 287.533.680 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; horizonte de predicción 64, 32 ejecutados, n_obs_steps 1) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | other |
| Formato de pesos | safetensors (LeRobot) |

## Arquitectura y entrenamiento

Se trata de una diffusion policy implementada en LeRobot (fork `lerobot-cyclo` de ROBOTIS). La arquitectura emplea un encoder ResNet18 independiente por cada una de las tres cámaras de entrada (cabeza, muñeca izquierda y muñeca derecha), cada una a resolución 240x240, más un vector de estado articular de 22 dimensiones. La salida es un vector de 16 objetivos articulares a 15 Hz. El proceso de difusión usa DDPM con 100 pasos, horizonte de predicción 64 con 32 pasos ejecutados y `n_obs_steps` igual a 1.

El entrenamiento se realizó durante 100.000 pasos con batch de 32, optimizador Adam con learning rate 1e-4 y scheduler coseno, semilla 1000. Los datos provienen de 2.000 demostraciones exitosas en simulación del dataset `pick-cube-cap2k-visual-dr-yaw45-3cam` (no publicado en Hugging Face), generadas con el programa CaP `block_pick_v1_nocomp.py` sin empujones, con yaw entre 0 y 45 grados, región completa, semillas 40001-40040 y aleatorización de apertura/cierre de pinza. El muestreo es uniforme sobre todos los fotogramas (EpisodeAwareSampler por defecto de LeRobot). Se aplicó una augmentación de imagen intensa en orden aleatorio (hasta 5 transformaciones simultáneas: brillo, contraste, saturación, tono, nitidez, afín, perspectiva, desenfoque, borrado aleatorio y escala de grises). No se añadió ruido al estado. El entrenamiento se ejecutó en una única RTX 4090 de 24 GB compartida entre dos ejecuciones del ablation, a aproximadamente 4,9 pasos por segundo cada una.

## Capacidades

- Generación de acciones motoras para control visuomotor de un brazo robótico (16 objetivos articulares a 15 Hz).
- Percepción visual multi-cámara: procesa simultáneamente las vistas de cabeza, muñeca izquierda y muñeca derecha a 240x240.
- Condicionamiento por estado articular: recibe un vector de 22 dimensiones del estado del robot.
- Ejecución de una tarea específica de pick-and-place: "pick up the lime green block with the left arm".
- Robustez parcial a variaciones visuales del entorno (texturas de mesa, fondos, iluminación, color del bloque) gracias a la aleatorización visual del entrenamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso simbólico ni capacidades multilingües; es un modelo puramente de control motor.
- No tiene modo de pensamiento, visión general ni audio: la visión está limitada a las tres cámaras del robot.

## Casos de uso

- Recogida de bloques en simulación: uso principal del modelo, recoger un bloque verde lima con el brazo izquierdo del FFW SG2 en el entorno Isaac Lab, sirviendo como línea base para comparar con la variante de aleatorización física.
- Estudio de ablación visual vs física: al compartir poses, yaw, parámetros de movimiento y valores de pinza con el conjunto físico (split con `--split_rng`), permite aislar el efecto de la aleatorización visual en el rendimiento de la política.
- Análisis de curvas de aprendizaje: los checkpoints intermedios cada 10.000 pasos (de 10k a 90k) permiten estudiar la convergencia y la estabilidad del entrenamiento de diffusion policies.
- Transferencia sim-to-real como referencia: sirve como punto de partida para experimentos de transferencia al robot físico ROBOTIS FFW SG2, aunque no se han publicado resultados de dicha transferencia.
- Benchmark interno de recetas LeRobot: útil para comparar la receta `dp-blockpick-2k-withoutpush` frente a variantes con otras aleatorizaciones o hiperparámetros.
- Reproducción de experimentos: dado que se documentan semillas, batch, optimizador y hardware, permite reproducir el entrenamiento en una única GPU de consumo (RTX 4090).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que "Evaluation results are added once they are run", por lo que no hay métricas de éxito, tasas de agarre ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 288 M parámetros en safetensors y entradas de tres imágenes 240x240, se estima un consumo moderado (del orden de pocos GB), pero no se confirma en la documentación.
- GPU de entrenamiento documentada: una RTX 4090 de 24 GB compartida entre dos ejecuciones del ablation, a ~4,9 pasos/s por ejecución.
- Cabe en GPU de consumo: sí, el entrenamiento se realizó en una RTX 4090, lo que indica que la inferencia es viable en GPUs consumer de gama alta.
- Opciones de despliegue: LeRobot (`DiffusionPolicy.from_pretrained("padiredd/dp-blockpick-cap2k-visual-dr")`); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Aleatorizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dp-blockpick-cap2k-visual-dr | 287,5 M | Pick bloque brazo izquierdo FFW SG2 | Solo visual | other | Hugging Face |
| padiredd/dp-blockpick-cap2k-yaw45 | ~0,3 B | Pick bloque, yaw 45 | no disponible | no disponible | Hugging Face |
| padiredd/dp-blockpick-cap2k-yaw45-cotrain-real075 | ~0,3 B | Pick bloque, co-entrenamiento con real 0,75 | no disponible | no disponible | Hugging Face |

Los dos modelos comparables pertenecen al mismo autor y familia de recetas; la información pública disponible sobre ellos es limitada (solo se indica el número de parámetros y la tarea). No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Entrenado exclusivamente en simulación: no hay evidencia publicada de transferencia al robot físico ni resultados de evaluación.
- Tarea muy restringida: solo recoge un bloque verde lima con el brazo izquierdo; no generaliza a otras tareas, objetos ni al brazo derecho.
- Sesgo de dominio: aunque incluye aleatorización visual (texturas, fondos, luces, color), mantiene pose inicial, altura de mesa y cámaras nominales, lo que limita la robustez ante cambios físicos o de calibración.
- Sin ruido de estado en el entrenamiento: puede ser sensible a imprecisiones en la estimación del estado articular en el robot real.
- Licencia "other": no se especifican los términos exactos, por lo que se debe consultar al autor antes de cualquier uso comercial.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero la política puede generar acciones no válidas o inseguras fuera de la distribución de entrenamiento.
- Idiomas: no disponible; el modelo no procesa lenguaje.
- Contexto: no aplica; el horizonte de predicción es de 64 pasos con 32 ejecutados y una sola observación (`n_obs_steps` = 1), lo que limita la memoria temporal de la política.
- Dataset de entrenamiento no publicado en Hugging Face, lo que dificulta la reproducción exacta de los datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/padiredd/dp-blockpick-cap2k-visual-dr
- Modelo relacionado: https://huggingface.co/padiredd/dp-blockpick-cap2k-yaw45
- Modelo relacionado: https://huggingface.co/padiredd/dp-blockpick-cap2k-yaw45-cotrain-real075
