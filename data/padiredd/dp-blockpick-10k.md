# padiredd/dp-blockpick-10k

## Resumen

dp-blockpick-10k es una política de difusión (diffusion policy) para robótica entrenada con LeRobot, publicada por el usuario padiredd. Resuelve una tarea concreta de manipulación: el agarre cenital (top-down pick) de un bloque de 5x5x4 cm con el brazo izquierdo del robot humanoide ROBOTIS FFW SG2, equipado con pinza ROBOTIS CAD y cámaras de muñeca calibradas sobre una mesa de 29,25 pulgadas. No es un modelo de lenguaje: es un modelo de control motor que mapea observaciones visuales y de estado articular a comandos de actuadores.

El modelo tiene 287.533.680 parámetros (unos 288 M) y se distribuye en formato safetensors con un repositorio de 11,6 GB que incluye el checkpoint final (paso 100k) y nueve checkpoints intermedios cada 10.000 pasos. La arquitectura es una diffusion policy con backbone ResNet18 por cámara, entrenada con DDPM de 100 pasos y un horizonte de predicción de 64 pasos (32 ejecutados), a 15 Hz.

Su relevancia es doble: por un lado, demuestra un flujo completo de entrenamiento en simulación (Isaac Lab) con dominio aleatorizado y evaluación sistemática sobre 100 poses de bloque; por otro, publica resultados de éxito que permiten comparar configuraciones de entrenamiento (con y sin ruido de estado, con y sin cotrain real) y muestrear con DDPM frente a DDIM. La licencia es "other", lo que exige revisar los términos antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (DDPM) con encoder ResNet18 por camara y cabeza de accion; framework LeRobot (fork ROBOTIS lerobot-cyclo) |
| Parametros totales | 287.533.680 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; horizonte de prediccion de 64 pasos, 32 ejecutados, n_obs_steps = 1 |
| Tipos de cuantizacion | no disponible (pesos safetensors en precision de entrenamiento) |
| Idiomas soportados | no disponible (modelo de robotica, sin capacidades linguisticas) |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata de una diffusion policy clásica: un proceso DDPM de 100 pasos que genera secuencias de acciones (16 objetivos articulares a 15 Hz) condicionadas por observaciones. Las observaciones son tres imágenes de 240x240 (cámara de cabeza, muñeca izquierda y muñeca derecha) más un vector de estado articular de 22 dimensiones. Cada cámara pasa por su propio ResNet18, y la receta de entrenamiento usa Adam con tasa 1e-4, scheduler coseno, batch de 32 y semilla 1000, durante 100.000 pasos en una única NVIDIA RTX A5000 de 24 GB (4-5,7 pasos/s).

Los datos de entrenamiento provienen del dataset `padiredd/pick-cube-topdown-region10k-full-dr2-3cam`: 11.710 demostraciones en simulación, 1.984.945 fotogramas, recogidos en Isaac Lab con el FFW SG2. La tarea cubre toda la región alcanzable del brazo izquierdo (1.154 cm²), con aleatorización dr2: pose inicial ±2 grados, apertura/cierre de pinza por episodio, empujes lentos con etiquetas limpias, focos de luz, desplazamientos de cámara, variación temporal de las demostraciones y altura de mesa entre -2 y +2 cm. El muestreo es uniforme sobre todos los fotogramas (EpisodeAwareSampler de LeRobot). Se aplica aumentación de imagen agresiva en orden aleatorio (hasta 5 transformaciones entre brillo, contraste, saturación, tono, nitidez, afin, perspectiva, desenfoque, borrado aleatorio y escala de grises) y no se añade ruido de estado.

## Capacidades

- Control motor de agarre cenital: genera trayectorias de 16 articulaciones para levantar un bloque de 5x5x4 cm con el brazo izquierdo del FFW SG2.
- Percepción multimodal: integra tres cámaras (cabeza, muñeca izquierda y derecha) a 240x240 más estado articular de 22 dimensiones.
- Generalización espacial: entrenado para cubrir toda la región alcanzable del brazo (1.154 cm²), no una única posición de bloque.
- Robustez a cambios de apariencia: el entrenamiento con dr2 incluye variaciones de iluminación, altura de mesa y pose inicial, aunque la evaluación con dominio aleatorizado (dr) muestra una caída de rendimiento.
- Muestreo flexible: soporta DDPM de 100 pasos y DDIM de 10 pasos (eta 0), lo que permite intercambiar calidad por velocidad de inferencia.
- No dispone de tool calling, razonamiento multi-paso, capacidades multilingües ni modos de pensamiento: es un modelo puramente reactivo de política visomotora.

## Casos de uso

- Pick-and-place en línea de montaje simulada: el modelo se usaría como política de control del brazo izquierdo para recoger piezas de una zona de la mesa y colocarlas en una ubicación fija, aprovechando su cobertura de toda la región alcanzable y su entrenamiento con altura de mesa variable.
- Generación de datos sintéticos para entrenamiento de políticas: al estar entrenado en Isaac Lab, puede desplegarse en el mismo simulador para generar rollouts etiquetados y aumentar datasets de manipulación.
- Evaluación comparativa de recetas de entrenamiento: los checkpoints intermedios (cada 10k pasos) permiten estudiar curvas de aprendizaje y comparar configuraciones (con/sin ruido de estado, con/sin cotrain real) en un protocolo de 100 poses fijas.
- Benchmark de robustez visual en robótica: el conjunto de evaluación incluye condiciones "clean" y "dr" (fondos, colores de mesa y bloque, luces y montajes de cámara no vistos en entrenamiento), útil para medir la brecha sim-to-real de apariencia.
- Prototipado de agarre con pinza de dos dedos: sirve como política de referencia para tareas de pick cenital con pinza ROBOTIS CAD y cámaras de muñeca calibradas, antes de transferir a hardware real.
- Investigación en diffusion policies: al ser un checkpoint LeRobot reproducible (`DiffusionPolicy.from_pretrained`), se puede usar como línea base para experimentar con número de pasos de difusión, aumentación o muestreo DDIM.

## Benchmarks y rendimiento

Evaluación en simulación (Isaac Sim 5.1) sobre 100 poses de bloque uniformes en la región alcanzable del brazo izquierdo, mismas poses para todos los modelos y condiciones. Éxito = bloque sostenido ≥ 5 cm sobre la mesa durante 1 s en 400 ticks (26,7 s a 15 Hz). Paso 100k:

| Modelo | DDPM clean | DDIM-10 clean | DDPM dr | DDIM-10 dr |
|---|---|---|---|---|
| fullregion-dr2 (este modelo) | 74% | 66% | 60% | 54% |
| fullregion-dr2-statenoise | 48% | 26% | 31% | 16% |
| cotrain-real075-statenoise | 78% | 87% | 59% | 63% |

Barrido de checkpoints con DDIM-10 en condición clean:

| Modelo | 20k | 40k | 60k | 80k | 100k |
|---|---|---|---|---|---|
| fullregion-dr2 (este modelo) | 0% | 1% | 26% | 49% | 66% |
| fullregion-dr2-statenoise | 0% | 5% | 22% | 24% | 26% |
| cotrain-real075-statenoise | 33% | 46% | 76% | 87% | 87% |

Desglose por banda de posición del bloque (aciertos/episodios) para este modelo:

| Ejecución | x 0,28-0,33 | x 0,33-0,39 | x 0,39-0,44 | x 0,44-0,50 | y -0,08-+0,15 | y +0,15-+0,35 | y +0,35-+0,65 | fallo: cierre en vacío | fallo: bloque en pinza al timeout | otros |
|---|---|---|---|---|---|---|---|---|---|---|
| dr2_100k_ddpm_clean | 30/35 | 19/23 | 20/28 | 5/14 | 18/26 | 25/36 | 31/38 | 18 | 2 | 6 |
| dr2_100k_ddpm_dr | 21/35 | 15/23 | 18/28 | 6/14 | 14/26 | 20/36 | 26/38 | 23 | 2 | 15 |
| dr2_100k_ddim10_clean | 24/35 | 17/23 | 18/28 | 7/14 | 12/26 | 26/36 | 28/38 | 28 | 0 | 6 |
| dr2_100k_ddim10_dr | 19/35 | 14/23 | 16/28 | 5/14 | 11/26 | 18/36 | 25/38 | 42 | 1 | 3 |

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada de forma explícita; el entrenamiento se realizó en una RTX A5000 de 24 GB con batch 32. Con 288 M parámetros, la inferencia en precisión de entrenamiento requiere varios GB, pero no se dispone de una cifra oficial.
- GPU recomendadas: el autor entrenó en una NVIDIA RTX A5000 de 24 GB; por tamaño, cabría en GPUs consumer de gama alta (RTX 3090/4090, 24 GB) y en A100/H100 para despliegues con mayor paralelismo.
- Cabe en GPU consumer: previsiblemente sí en modelos con 24 GB o más, aunque no hay medición publicada.
- Opciones de despliegue: LeRobot con `DiffusionPolicy.from_pretrained("padiredd/dp-blockpick-10k")`; los checkpoints intermedios están en carpetas `step-10000/` a `step-90000/`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de robótica).
- Latencia y throughput: entrenamiento a 4-5,7 pasos/s en RTX A5000; no se publica latencia de inferencia. El muestreo DDIM de 10 pasos reduce coste frente a DDPM de 100 pasos, con una caída de éxito de 74% a 66% en clean.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Rendimiento (DDIM-10 clean) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dp-blockpick-10k (este modelo) | 288 M | 64 pasos, 32 ejecutados | 66% | other | Hugging Face, checkpoints cada 10k |
| fullregion-dr2-statenoise | no disponible | no disponible | 26% | no disponible | mismo autor (referencia en la model card) |
| cotrain-real075-statenoise | no disponible | no disponible | 87% | no disponible | mismo autor (referencia en la model card) |

No se dispone de datos de otros modelos de diffusion policy comparables fuera de las variantes del mismo autor recogidas en la model card.

## Limitaciones y advertencias

- Tarea muy específica: solo agarre cenital de un bloque de 5x5x4 cm con el brazo izquierdo del FFW SG2; no generaliza a otras tareas, objetos o brazos.
- Brecha de dominio de apariencia: el éxito cae de 74% a 60% (DDPM) y de 66% a 54% (DDIM-10) en la condición dr con fondos, colores y luces no vistos en entrenamiento.
- Fallo dominante: el cierre de la pinza en vacío ("miss") es el error principal, con 18-42 casos según condición; además hay 1-15 casos "otros" y algún timeout con el bloque en la pinza.
- Rendimiento desigual por posición: el éxito baja en la banda x 0,44-0,50 (5-7 de 14) y en y -0,08-+0,15 (11-18 de 26), lo que indica menor fiabilidad en los extremos de la región.
- Entrenamiento aún en curso: la curva de checkpoints sigue subiendo a 100k (0% → 66% en clean con DDIM-10), por lo que el modelo puede estar infraentrenado.
- Sin datos de sim-to-real: todas las métricas son de simulación (Isaac Sim 5.1); no se publican resultados en hardware físico.
- Licencia "other": es necesario revisar los términos del autor antes de uso comercial o redistribución.
- Sin información sobre sesgos, alucinación o idiomas: no aplica en el sentido habitual, pero tampoco hay evaluación de seguridad ni de comportamiento fuera de distribución más allá de la condición dr.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/padiredd/dp-blockpick-10k
- Dataset de entrenamiento: `padiredd/pick-cube-topdown-region10k-full-dr2-3cam` (referenciado en la model card)
- Repositorio de evaluación y protocolo: `data_collection/region10k/eval/` del repo cyclo_lab-real2sim (referenciado en la model card)
- Script de rollout: `data_collection/rollout_policy.py` (referenciado en la model card)
- Puntos de evaluación: `eval/points_region100.json` (referenciado en la model card)
- Resultados por episodio y vídeos: `eval/<run>.json` y `eval/videos/` (referenciados en la model card)
