# padiredd/dp-blockpick-cap2k-both-dr

## Resumen

`dp-blockpick-cap2k-both-dr` es una política de difusión (diffusion policy) para robótica entrenada con LeRobot, desarrollada por el usuario `padiredd`. Resuelve una tarea concreta de manipulación: recoger un bloque verde lima con el brazo izquierdo del robot humanoide bimanual ROBOTIS FFW SG2, equipado con pinza CAD ROBOTIS y cámaras de muñeca calibradas, sobre una mesa de 29,25 pulgadas. El modelo tiene 287.533.680 parámetros (~288 M) en formato safetensors y un repositorio de 11,5 GB que incluye el checkpoint final (paso 100k) y diez checkpoints intermedios cada 10.000 pasos.

El interés de esta ficha es acotado y técnico: no es un modelo de lenguaje, sino un componente de control visuomotor que mapea observaciones multimodales (tres cámaras de 240x240 más un vector de estado articular de 22 dimensiones) a 16 objetivos articulares a 15 Hz. Forma parte de una ablación sistemática sobre aleatorización visual frente a física en datos de simulación, lo que lo hace relevante para quien investigue robustez de políticas visuomotoras y transferencia sim-to-real.

La model card indica explícitamente que los resultados de evaluación se añadirán cuando se ejecuten, por lo que en el momento de redactar esta ficha no hay métricas de éxito publicadas. El modelo se distribuye con licencia "other" sin texto de licencia detallado en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (DDPM, 100 pasos de difusión) sobre encoder ResNet18 por cámara; fork ROBOTIS `lerobot-cyclo` de LeRobot |
| Parametros totales | 287.533.680 (~288 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; `n_obs_steps` = 1, horizonte de predicción 64 pasos, 32 ejecutados |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantización declarada) |
| Idiomas soportados | no disponible (modelo robótico; no procesa lenguaje natural, solo la cadena de tarea fija "pick up the lime green block with the left arm") |
| Licencia | other (texto de licencia no detallado en la información disponible) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata de una política de difusión condicionada por observaciones, con un backbone de visión basado en ResNet18 independiente por cada una de las tres cámaras (cabeza, muñeca izquierda y muñeca derecha), cada una a resolución 240x240. La entrada se completa con un vector de estado articular de 22 dimensiones; la salida es una acción de 16 objetivos articulares a 15 Hz. El proceso de difusión usa DDPM con 100 pasos, horizonte de predicción de 64 pasos de los cuales se ejecutan 32, y un único paso de observación (`n_obs_steps` = 1). El entrenamiento se realizó durante 100.000 pasos con batch de 32, optimizador Adam a tasa 1e-4 con decaimiento coseno, semilla 1000 y una única NVIDIA A100 de 80 GB.

Los datos provienen del conjunto `padiredd/Ablation_Block_both`, con 2.000 demostraciones exitosas en simulación generadas mediante el programa CaP `block_pick_v1_nocomp.py` (sin empujones, yaw entre 0 y 45 grados, región completa, semillas 40001-40040, aleatorización de apertura y cierre de pinza). La particularidad del conjunto es que aplica simultáneamente aleatorización visual y física, compartiendo por episodio las poses del bloque, el yaw, los parámetros de movimiento y los valores de pinza con los conjuntos de las otras ramas de la ablación (separación mediante `--split_rng`). El muestreo es uniforme sobre todos los fotogramas (EpisodeAwareSampler de LeRobot). Se aplica aumento de imagen agresivo en orden aleatorio, hasta cinco de las siguientes transformaciones: brillo 0,6-1,4, contraste 0,6-1,4, saturación 0,3-1,7, tono ±0,1, nitidez 0,3-2,0, afín ±10 grados / 10 % / 0,9-1,1, perspectiva 0,2, desenfoque, borrado aleatorio y escala de grises. No se añadió ruido al estado. La decodificación de vídeo se hizo con pyav, con fotogramas idénticos bit a bit a los de torchcodec.

## Capacidades

- Control visuomotor para una tarea fija de pick-and-place: recoger un bloque verde lima con el brazo izquierdo.
- Fusión de tres vistas de cámara (cabeza y ambas muñecas) con estado propioceptivo de 22 dimensiones.
- Generación de trayectorias articulares multimodales mediante muestreo de difusión (DDPM, 100 pasos).
- Ejecución de acciones en bucle cerrado a 15 Hz con horizonte de acción de 32 pasos.
- Robustez ante variaciones visuales (iluminación, color, perspectiva, oclusiones parciales) gracias al aumento de imagen durante el entrenamiento.
- Robustez ante variaciones físicas (poses, yaw y valores de pinza aleatorizados) por la rama de aleatorización física del conjunto de datos.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, diálogo multilingüe ni modalidad de audio. No es un modelo de lenguaje.

## Casos de uso

- Investigación en ablaciones de aleatorización sim-to-real: sirve como rama "visual + física" de un experimento controlado que compara el efecto de cada tipo de aleatorización sobre la tasa de éxito en el mismo conjunto de poses y parámetros de movimiento, gracias a la separación por `--split_rng`.
- Punto de partida para fine-tuning en un robot FFW SG2 real: los checkpoints intermedios cada 10.000 pasos permiten estudiar la evolución del comportamiento y elegir el punto de partida más adecuado para coentrenamiento con datos reales.
- Evaluación de políticas de difusión en entornos simulados Isaac Lab: el modelo se entrenó con datos de simulación etiquetados como `isaac-lab`, por lo que se puede desplegar directamente en el mismo pipeline de evaluación.
- Estudio de robustez ante condiciones de cámara: el aumento agresivo de imagen (brillo, contraste, saturación, desenfoque, borrado) permite analizar la degradación de la política bajo perturbaciones visuales controladas.
- Referencia para arquitecturas de política con múltiples cámaras: la combinación de tres ResNet18 independientes más estado de 22 dimensiones sirve como línea base reproducible para comparar variantes de backbone o de fusión multimodal.
- Docencia y reproducción de experimentos: la receta completa (pasos, batch, optimizador, semilla, hardware) y los checkpoints intermedios hacen viable reproducir el entrenamiento en una sola A100 de 80 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los resultados de evaluación se añadirán una vez ejecutados.

## Requisitos de hardware

- Entrenamiento original: una NVIDIA A100 de 80 GB, 100.000 pasos con batch 32. El repositorio ocupa 11,5 GB por los once checkpoints almacenados.
- VRAM de inferencia: no disponible de forma oficial. Con ~288 M parámetros en fp32, los pesos ocupan aproximadamente 1,15 GB; sumando activaciones de tres ResNet18 a 240x240 y el bucle DDPM de 100 pasos, es razonable esperar un consumo de pocos GB, aunque no hay medición publicada.
- GPU consumer: por tamaño de pesos, el modelo debería caber en GPUs consumer con 8 GB o más (RTX 3060 Ti, 4060, 4070, 4080, 4090), si bien no se ha verificado ni publicado latencia ni throughput.
- Despliegue: el ecosistema previsto es LeRobot (`DiffusionPolicy.from_pretrained("padiredd/dp-blockpick-cap2k-both-dr")`) con el fork `lerobot-cyclo` de ROBOTIS. No hay indicios de soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La frecuencia de control declarada es de 15 Hz, pero no se especifica si se alcanza en la GPU de entrenamiento ni en hardware consumer.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `padiredd/dp-blockpick-cap2k-both-dr` (este) | ~288 M | Pick de bloque, brazo izquierdo FFW SG2 | 1 obs, horizonte 64 / 32 ejecutados | other | Hugging Face, 0 descargas |
| `padiredd/dp-blockpick-cap2k-yaw45` | ~0,3 B (según HF) | Pick de bloque con yaw 45 | no disponible | no disponible | Hugging Face |
| `padiredd/dp-blockpick-cap2k-yaw45-cotrain-real075` | ~288 M | Pick de bloque con coentrenamiento real | no disponible | no disponible | Hugging Face |

Las tres variantes comparten arquitectura, robot y receta base; difieren en el conjunto de datos y en la rama de aleatorización. No se dispone de métricas de rendimiento comparadas para ninguna de ellas.

## Limitaciones y advertencias

- Tarea única y estrecha: solo recoge un bloque verde lima con el brazo izquierdo; no generaliza a otras tareas, objetos ni al brazo derecho sin reentrenamiento.
- Sin evaluación publicada: la model card afirma que los resultados se añadirán cuando se ejecuten, por lo que no hay evidencia cuantitativa de tasa de éxito ni en simulación ni en real.
- Entrenado exclusivamente con datos de simulación (Isaac Lab); el salto a un robot físico no está validado en la información disponible.
- Licencia "other" sin texto detallado: no se puede confirmar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier despliegue productivo.
- Dependencia del fork `lerobot-cyclo` de ROBOTIS: la carga del modelo puede no funcionar con versiones estándar de LeRobot.
- Sin soporte de lenguaje natural ni de instrucciones variables: la cadena de tarea es fija y no hay capacidades multilingües.
- Riesgo de sobreajuste a la distribución de simulación pese a la aleatorización visual y física; el propio diseño del experimento sugiere que la transferencia es una cuestión abierta.
- Repositorio de 11,5 GB por los checkpoints intermedios; conviene descargar solo los ficheros necesarios.
- Sin descargas ni likes en el momento de la consulta: no hay señal de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/padiredd/dp-blockpick-cap2k-both-dr
- Variante yaw45: https://huggingface.co/padiredd/dp-blockpick-cap2k-yaw45
- Variante coentrenada con datos reales: https://huggingface.co/padiredd/dp-blockpick-cap2k-yaw45-cotrain-real075
- Conjunto de datos de entrenamiento (referenciado en la model card): `padiredd/Ablation_Block_both` (no se ha encontrado URL directa en la búsqueda)
- Fork de LeRobot usado: `ROBOTIS lerobot-cyclo` (no se ha encontrado URL directa en la búsqueda)
