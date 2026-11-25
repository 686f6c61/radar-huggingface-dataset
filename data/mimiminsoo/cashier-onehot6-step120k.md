# mimiminsoo/cashier-onehot6-step120k

## Resumen

`cashier-onehot6-step120k` es una política de difusión (diffusion policy) para control robótico de manipulación bimanual, publicada por el usuario mimiminsoo en Hugging Face bajo la librería LeRobot. El modelo está entrenado para ejecutar de forma unificada la tarea completa de caja de supermercado: recogida de producto, escaneo de código de barras y empaquetado, sobre un montaje físico con dos brazos PiPER y un cuello de dos grados de libertad.

La innovación principal es el uso de una codificación one-hot de 6 vías en el vector de estado que indica la etapa actual de la tarea (pick, scan, place, pack_fetch, pack_put, pack_move), lo que permite que una única política cubra toda la cadena de subtareas en lugar de encadenar modelos separados. El vector de estado tiene 22 dimensiones (16 de robot más 6 de etapa) y el vector de acción 16 dimensiones (6 por brazo más pinza, y pitch/yaw del cuello).

Se trata de un checkpoint intermedio del paso 120 000 de un entrenamiento de 200 000 pasos, subido explícitamente por el autor para probar la cadena de política única antes del modelo final. No es un modelo de lenguaje: no procesa texto ni genera lenguaje natural, sino que mapea observaciones multimodales (tres cámaras) y estado propioceptivo a comandos motores a 10 Hz.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion policy (LeRobot) con codificación one-hot de etapa en el estado |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; horizonte de observación 2, predicción 16, acción 8 |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo de robótica) |
| Licencia | Apache 2.0 |
| Formato de pesos | `training_state.pt` (checkpoint PyTorch con pesos EMA incluidos) |
| Dimensión de estado | 22 (robot 16 + etapa 6) |
| Dimensión de acción | 16 (brazo izq. 6 + pinza, brazo der. 6 + pinza, cuello pitch/yaw) |
| Entradas visuales | `observation.images.left_main`, `left_wrist`, `right_wrist` a [240, 320] |
| Frecuencia de control | 10 Hz |
| Tamaño del repo | 4,4 GB |
| Pasos de entrenamiento | 200 000 totales; este checkpoint es el paso 120 000 |
| Batch | 64 (32 por GPU × 2 GPUs, DDP) |
| Dataset | `onehot6_1123`: 808 episodios, 298 045 fotogramas |

## Arquitectura y entrenamiento

El modelo sigue el paradigma de diffusion policy implementado en LeRobot: una red que aprende a generar secuencias de acciones mediante un proceso de difusión condicionado por observaciones visuales y estado propioceptivo. La particularidad de esta variante es que el vector de estado incorpora una codificación one-hot de 6 dimensiones que identifica la etapa de la tarea, de modo que una sola red puede comportarse de forma distinta según la fase (recogida, escaneo, colocación o las tres subfases de empaquetado) sin necesidad de conmutar entre modelos.

El entrenamiento se realizó sobre el dataset `onehot6_1123`, compuesto por 808 episodios y 298 045 fotogramas, con normalización `normalize_range_eps` de 0,0001 y 200 000 pasos totales en dos GPUs con DDP. Las etiquetas de etapa se derivaron de las transiciones observadas en los datos (por ejemplo, el paso de pick a scan se marca en la primera liberación de la pinza izquierda antes del escaneo con J1 < 15 grados; el de scan a place en el primer código de barras registrado). 292 episodios son solo de recogida (`scan_stage0`) y se truncaron en la primera transición. Este checkpoint corresponde al paso 120 000 e incluye pesos EMA dentro del `training_state.pt`.

## Capacidades

- Control bimanual coordinado de dos brazos PiPER con pinzas de un grado de libertad cada una.
- Control del cuello de dos grados de libertad (pitch y yaw) para orientar la percepción.
- Ejecución unificada de una cadena de seis etapas mediante la señal one-hot de estado.
- Fusión de tres vistas de cámara (principal izquierda, muñeca izquierda, muñeca derecha) a resolución 240×320.
- Predicción de secuencias de acción con horizonte de 8 pasos a 10 Hz y horizonte de predicción de 16.
- Cambio de comportamiento condicionado por etapa sin reentrenar ni conmutar de modelo.
- No soporta tool calling, generación de texto, razonamiento simbólico ni capacidades multilingües.

## Casos de uso

- Automatización de caja de supermercado: el modelo cubre la secuencia completa de recogida de producto, escaneo del código de barras y empaquetado en una sola política, lo que simplifica la orquestación frente a pipelines con varios modelos encadenados.
- Investigación en políticas unificadas multi-etapa: sirve como referencia para estudiar si una codificación one-hot de etapa en el estado es suficiente para que una diffusion policy generalice a lo largo de una tarea larga.
- Prototipado de manipulación bimanual: el par de brazos PiPER con cuello permite experimentar con coordinación entre manipuladores en tareas de pick-and-place con percepción activa.
- Evaluación de checkpoints intermedios: al ser el paso 120 000 de 200 000, es útil para comparar curvas de aprendizaje y validar la infraestructura de evaluación (`eval/run_chain.sh`) antes del modelo final.
- Reproducción de experimentos con LeRobot: el pipeline de descarga (`pipeline/download_model.py`) y la estructura de dataset permiten replicar el entrenamiento en configuraciones DDP de dos GPUs.
- Docencia y demostraciones de robótica: la tarea de caja es intuitiva y el modelo es ejecutable en un montaje de laboratorio con hardware asequible comparado con brazos industriales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, métricas de precisión de manipulación ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint de entrenamiento ocupa 4,4 GB e incluye estado del optimizador y pesos EMA, por lo que el peso de inferencia puro será inferior.
- GPU recomendadas: no especificadas; el entrenamiento se realizó con 2 GPUs en DDP con batch 32 por GPU.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: LeRobot (librería nativa), con descarga vía `pipeline/download_model.py` y evaluación vía `eval/run_chain.sh`.
- Latencia y throughput: frecuencia de control de 10 Hz (100 ms por paso de control); no se publican latencias de inferencia por paso.

## Comparativa con modelos similares

| Modelo | Tipo | Estado | Acción | Cámaras | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| cashier-onehot6-step120k | Diffusion policy con one-hot de etapa | 22 | 16 | 3 | Apache 2.0 | Hugging Face (checkpoint intermedio) |
| cashier-barcode-onehot3 (referencia del autor) | Diffusion policy con one-hot de 3 etapas | 19 | no disponible | no disponible | no disponible | Hugging Face |
| Políticas LeRobot estándar (p. ej. ACT, diffusion policy base) | Imitación por etapa única | variable | variable | variable | variable | Hugging Face / repositorio LeRobot |

La comparación cuantitativa con alternativas no está disponible; la model card solo menciona el modelo previo `cashier-barcode-onehot3`, del que se reutilizan los datos de pose inicial (`start_pose/`, 50 episodios).

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 120 000 de 200 000): el autor lo publica para probar la cadena de política única, no como modelo final.
- La cadena de evaluación de política única no está disponible en la rama `release` de `Cashier_policy`; `eval/run_chain.sh` se detiene en su comprobación inicial con este modelo de estado 22.
- El modelo está acoplado a un montaje físico concreto (dos brazos PiPER, cuello de 2 GDL, tres cámaras a 240×320) y no es transferible sin recalibración.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erróneas fuera de distribución en estados no vistos.
- Las etiquetas de etapa se derivaron de reglas heurísticas sobre los datos, lo que puede introducir ruido en las transiciones.
- No hay información sobre sesgos, robustez ante cambios de iluminación o generalización a objetos no presentes en el dataset.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de métricas de éxito publicadas desaconseja su despliegue en producción sin evaluación propia.
- El repositorio no incluye idiomas ni documentación multilingüe; toda la información está en inglés.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mimiminsoo/cashier-onehot6-step120k
- Modelo de referencia del autor: https://huggingface.co/mimiminsoo/cashier-barcode-onehot3
- LeRobot (librería): https://github.com/huggingface/lerobot
