# Gospe1/Franka-5Task-AdaSpeVLA-Expert

## Resumen

Franka-5Task-AdaSpeVLA-Expert es una política de visión-lenguaje-acción (VLA) desarrollada por el usuario Gospe1 para control robótico sobre un brazo Franka. El modelo implementa una variante de AdaSpeVLA que combina el *action expert* de π0.5 (un módulo Gemma-300M con adaRMS cargado desde `pi05_base`) sobre el backbone PaliGemma de π0.5, generando *chunks* de acción representados como splines B cúbicos con nudos aprendidos y una cabeza adaptativa de intervalo temporal. Está entrenado conjuntamente sobre cinco tareas manipulativas distintas: recoger pan, colocar un tubo de ensayo, recoger pelotas de tenis, insertar un tubo y borrar una pizarra.

La relevancia del modelo radica en su enfoque de *co-training* multi-tarea con un único checkpoint: la tarea se selecciona mediante el *prompt* de lenguaje, sin necesidad de cabezas separadas por tarea. Además, la representación de acciones como splines con nudos aprendidos y una cabeza de temporización permite que el modelo decida dinámicamente el intervalo entre puntos de control (0,2–1,5 s), lo que reduce el número de pasos de inferencia necesarios frente a políticas que emiten acciones densas a frecuencia fija.

El repositorio contiene un checkpoint de inferencia Orbax/OpenPI de 5,3 GB con los parámetros EMA del backbone, el *action expert* y las cabezas de nudos y temporización, junto con las estadísticas de normalización conjuntas de las cinco tareas. No se han publicado resultados en robot real; la evaluación disponible es exclusivamente en lazo abierto sobre *frames* retenidos y de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA basada en PaliGemma (π0.5) con *action expert* Gemma-300M + adaRMS y cabezas de nudos y temporización |
| Parámetros totales | no disponible (el *action expert* es Gemma-300M; el backbone no se especifica) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (checkpoint en bfloat16 para backbone/action expert/knot head, float32 para timing head) |
| Idiomas soportados | no disponible (los *prompts* de tarea están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | Orbax (OpenPI/Flax NNX); no se proporcionan safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura π0.5: un backbone PaliGemma que procesa observaciones visuales y el *prompt* de lenguaje, y un *action expert* (Gemma-300M con adaRMS) que genera los puntos de control de la acción. Sobre esta base, AdaSpeVLA representa cada *chunk* de acción como un spline B cúbico con 11 puntos de control y un intervalo de consulta variable entre 0,2 y 1,5 s, decidido por una cabeza de temporización (`freq_head`). Los nudos se inyectan en cada token de punto de control mediante una proyección `cp_knot_proj` inicializada a cero. El *chunk* cubre 16 pasos (1,5 s a 10 Hz).

El entrenamiento se realizó en dos etapas. La etapa de acción duró 40.000 pasos con ajuste fino completo desde `pi05_base`, usando AdamW, LR pico 2,5e-5 con *warmup* de 1.000 pasos y decaimiento coseno a 30.000, EMA 0,99, batch 32 y 4 GPUs con FSDP. La convención de flujo es la de π0.5 (`x_t = t·noise + (1−t)·data`, `t ~ Beta(1.5,1)`) con 10 pasos ODE. La etapa de temporización añadió 10.000 pasos entrenando únicamente la cabeza `freq_head` sobre el checkpoint de 40.000. Las cinco tareas se muestrean uniformemente (las tareas más pequeñas se ciclan más) y cada muestra conserva su propia calibración (escala de movimiento y `e_crit`), lo que equivale a las etiquetas de un modelo mono-tarea. Los datos provienen de cinco *datasets* LeRobot con 89–102 episodios de entrenamiento por tarea y 10 episodios retenidos por tarea.

## Capacidades

- Generación de *chunks* de acción de 16 pasos (1,5 s a 10 Hz) para control de un brazo Franka a partir de observaciones visuales y un *prompt* de lenguaje.
- Selección de tarea mediante *prompt*: un único checkpoint cubre cinco tareas distintas sin cabezas separadas.
- Representación de acciones como splines B cúbicos con 11 puntos de control y nudos aprendidos.
- Predicción adaptativa del intervalo temporal entre puntos de control (0,2–1,5 s) mediante una cabeza dedicada.
- Predicción de la señal de pinza (*gripper*) con precisión de signo del 92,1–95,4 % en episodios retenidos.
- Condicionamiento multimodal visión-lenguaje heredado del backbone PaliGemma de π0.5.
- No soporta *tool calling*, agentes multi-paso ni otras capacidades de texto general: es una política robótica, no un LLM de propósito general.

## Casos de uso

- Manipulación de objetos deformables en cocina robótica: recoger dos rebanadas de pan de una tostadora y colocarlas en un plato, usando el *prompt* correspondiente y el checkpoint conjunto.
- Manipulación de precisión en laboratorio: colocar un tubo de ensayo en su gradilla, aprovechando la representación de splines para trayectorias suaves y el intervalo adaptativo para fases de aproximación lenta.
- Recogida de objetos múltiples: agrupar pelotas de tenis en una cesta verde, donde el modelo debe encadenar varios ciclos de aproximación y agarre dentro de un mismo *chunk*.
- Tareas de inserción: introducir un tubo gris en un soporte negro vacío, un escenario típico de *peg-in-hole* donde la precisión de orientación (R² de rotación 0,31–0,36 en retenido) es el factor limitante.
- Tareas de borrado o limpieza: borrar la escritura de una pizarra blanca, con movimientos de barrido amplio que se benefician del intervalo de consulta variable.
- Investigación en *co-training* multi-tarea: servir como *baseline* reproducible para estudiar el efecto del entrenamiento conjunto frente a modelos mono-tarea (el autor incluye una comparación directa con un modelo solo de pan).
- Evaluación de representaciones de acción con splines: el checkpoint permite comparar splines con nudos aprendidos frente a acciones densas en tareas de contacto.

## Benchmarks y rendimiento

Evaluación en lazo abierto (1.024 *frames* por tarea; R² sobre el *chunk* de 16 pasos, relativo a predecir la media por dimensión). Episodios retenidos:

| Tarea | R² x | R² y | R² z | R² rx | R² ry | R² rz | R² grip | Precisión signo pinza | MAE intervalo / corr. |
|---|---|---|---|---|---|---|---|---|---|
| bread | 0,18 | 0,93 | 0,82 | 0,14 | 0,30 | 0,23 | 0,75 | 94,8 % | 0,315 s / 0,55 |
| test_tube | 0,43 | 0,84 | 0,77 | 0,16 | 0,13 | 0,20 | 0,64 | 92,1 % | 0,343 s / 0,52 |
| tennis | 0,59 | 0,77 | 0,69 | 0,28 | 0,44 | 0,41 | 0,77 | 94,5 % | 0,387 s / 0,52 |
| insert_tube | 0,18 | 0,85 | 0,86 | 0,36 | 0,33 | 0,31 | 0,72 | 95,4 % | 0,345 s / 0,57 |
| wipe_whiteboard | 0,56 | 0,61 | 0,28 | 0,37 | 0,39 | 0,11 | 0,68 | 94,0 % | 0,408 s / 0,32 |

*Frames* de entrenamiento:

| Tarea | R² x | R² y | R² z | R² rx | R² ry | R² rz | R² grip | Precisión signo pinza | MAE intervalo / corr. |
|---|---|---|---|---|---|---|---|---|---|
| bread | 0,90 | 0,99 | 0,97 | 0,89 | 0,86 | 0,85 | 0,97 | 99,2 % | 0,283 s / 0,69 |
| test_tube | 0,91 | 0,97 | 0,95 | 0,84 | 0,86 | 0,87 | 0,94 | 98,6 % | 0,284 s / 0,69 |
| tennis | 0,92 | 0,96 | 0,95 | 0,89 | 0,90 | 0,91 | 0,96 | 98,8 % | 0,372 s / 0,52 |
| insert_tube | 0,88 | 0,97 | 0,98 | 0,93 | 0,93 | 0,91 | 0,96 | 99,4 % | 0,325 s / 0,64 |
| wipe_whiteboard | 0,96 | 0,98 | 0,93 | 0,95 | 0,96 | 0,91 | 0,96 | 99,3 % | 0,348 s / 0,57 |

Comparación con el modelo mono-tarea de pan (`Gospe1/Franka-Bread-AdaSpeVLA-Expert`, 20k pasos) sobre los mismos *frames* retenidos de bread:

| Modelo | R² x | R² y | R² z | R² rx | R² ry | R² rz | R² grip | Precisión signo pinza | MAE intervalo / corr. |
|---|---|---|---|---|---|---|---|---|---|
| 5-task (40k) | 0,18 | 0,93 | 0,82 | 0,14 | 0,30 | 0,23 | 0,75 | 94,8 % | 0,315 s / 0,55 |
| single-task bread (20k) | 0,18 | 0,92 | 0,82 | 0,14 | 0,32 | 0,20 | 0,75 | 95,1 % | 0,300 s / 0,56 |

No se han publicado resultados en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio ocupa 5,3 GB, lo que da una cota inferior del peso de los parámetros en disco; el *action expert* es Gemma-300M en bfloat16 y el backbone PaliGemma añade carga adicional no cuantificada en la model card.
- GPU recomendadas: el entrenamiento se realizó con 4 GPUs y FSDP; no se especifica el modelo de GPU. Para inferencia se requiere una GPU compatible con JAX/Flax y OpenPI; no se detallan modelos concretos.
- ¿Cabe en GPU de consumo? No disponible. No se han publicado requisitos de VRAM ni pruebas en RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: OpenPI (`215abfb`) con el código `code/adaspe_train` del repositorio `cognaclee/Frank-Insert-Wipe` (`037c782`). Requiere JAX, Flax NNX y Orbax. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La decodificación usa 10 pasos ODE por *chunk* de 16 pasos de acción, pero no se publican tiempos de inferencia medidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Franka-5Task-AdaSpeVLA-Expert | no disponible (action expert Gemma-300M) | no disponible | 5 (Franka) | Apache 2.0 | Hugging Face |
| Franka-Bread-AdaSpeVLA-Expert (`Gospe1`) | no disponible (mismo *action expert*) | no disponible | 1 (bread) | no disponible en la información | Hugging Face |
| π0.5 base (`pi05_base`) | no disponible | no disponible | propósito general | no disponible en la información | Referenciado como origen de pesos |

No se dispone de datos de benchmarks de π0.5 base ni de otros modelos VLA comparables en la información proporcionada, por lo que no es posible una comparación cuantitativa más allá del modelo mono-tarea del mismo autor.

## Limitaciones y advertencias

- No se han publicado resultados en robot real: toda la evaluación es en lazo abierto sobre *frames* de *datasets* LeRobot, lo que no garantiza el rendimiento en ejecución cerrada.
- El R² de orientación en episodios retenidos es bajo (0,11–0,44 según eje y tarea), lo que indica poca capacidad de generalización en rotaciones; tareas que exijan orientación precisa pueden fallar.
- El R² de traslación en retenido cae notablemente frente a entrenamiento en varias tareas (por ejemplo, x en bread: 0,18 retenido frente a 0,90 en entrenamiento), señal de sobreajuste a los episodios vistos.
- El modelo solo cubre cinco tareas concretas de un brazo Franka; no es un modelo de propósito general y no soporta instrucciones fuera de los *prompts* documentados.
- Los *prompts* de tarea están en inglés; no se documenta soporte multilingüe.
- Requiere código externo específico (`cognaclee/Frank-Insert-Wipe`) y una versión concreta de OpenPI; la carga de parámetros desde Orbax requiere un mapeo manual de claves (las claves enteras del plugin vuelven como cadenas), y `cfg.load(restore_params(...))` falla con error de estructura de pytree.
- Es imprescindible usar las estadísticas de normalización conjuntas (`assets/cotrain/franka5/norm_stats.json`), no las mono-tarea.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de validación en robot real desaconseja su despliegue en producción sin evaluación propia.
- Riesgo de alucinación en el sentido de generar trayectorias plausibles pero incorrectas fuera de la distribución de entrenamiento; no se han caracterizado los sesgos del backbone PaliGemma en este contexto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Gospe1/Franka-5Task-AdaSpeVLA-Expert
- Modelo mono-tarea de referencia: https://huggingface.co/Gospe1/Franka-Bread-AdaSpeVLA-Expert
- Código de entrenamiento: `cognaclee/Frank-Insert-Wipe` en la revisión `037c782`, carpeta `code/adaspe_train`
- OpenPI (dependencia): revisión `215abfb`
- Datasets de entrenamiento:
  - https://huggingface.co/datasets/dddddsds31341/bread-lerobot
  - https://huggingface.co/datasets/dddddsds31341/test-tube-lerobot
  - https://huggingface.co/datasets/dddddsds31341/tennis-balls-lerobot
  - https://huggingface.co/datasets/dddddsds31341/insert-tube-lerobot
  - https://huggingface.co/datasets/dddddsds31341/wipe-whiteboard-lerobot
