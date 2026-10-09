# kolmann1231/pi0-robosyn-handover-24k

## Resumen

pi0-robosyn-handover-24k es un checkpoint de política robótica π0 (implementación openpi, escrita en JAX) afinado con LoRA desde el checkpoint base `pi0_base`. Lo publica el usuario kolmann1231 en HuggingFace y está pensado exclusivamente para la tarea de entrega de objetos ("items_handover") del simulador del RoboSynChallenge (EmbodiChain, brazo dual CobotMagic). El repositorio ocupa 6,2 GB, se distribuye como modelo de la librería `lerobot`, tiene pipeline declarado `robotics` y licencia marcada como "other" (los términos de Gemma se aplican a los componentes PaliGemma/Gemma heredados de `pi0_base`).

El propio autor etiqueta la model card como borrador no publicado y advierte que el checkpoint fue seleccionado sobre su propio checkpoint de 16k en una piscina de desarrollo de 50 escenas, con una ventaja de solo +4 éxitos (p = 0,344) que no alcanzó el umbral fijado de antemano (al menos 5). Por tanto se usa en la competición como un "riesgo deliberado y documentado", no como un resultado validado. El checkpoint que sí pasó una validación independiente es `pi0-robosyn-handover-16k`, y el modelo no ha sido comparado nunca directamente contra el checkpoint oficial de SmolVLA.

Se trata de un modelo de uso muy restringido: simulación únicamente, entrenado y probado en una sola tarea, con licencias de entrada (datos de entrenamiento) todavía pendientes de resolver según la propia model card, y con restricciones de uso derivadas de los términos de Gemma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | política π0 (openpi, JAX); base `pi0_base` con componentes PaliGemma/Gemma; fine-tune LoRA (`gemma_2b_lora` + `gemma_300m_lora`) |
| Parametros totales | no disponible en la informacion proporcionada |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; la model card menciona diferencias a nivel bf16 en inferencia por GPU |
| Idiomas soportados | no disponible (el prompt es el texto de tarea del dataset) |
| Licencia | other; se aplican los Gemma Terms of Use a los componentes Gemma/PaliGemma |
| Formato de pesos | no disponible con precision; checkpoint de openpi/JAX, manifiesto de parametros de 18 ficheros (sha256 `3e28642c…`); repo de 6,2 GB |
| Desarrollador | kolmann1231 |
| Fecha de creacion | 2026-10-09 |
| Ultima actualizacion | 2026-10-09 |
| Libreria | lerobot |
| Pipeline | robotics |
| Checkpoint | step 24000 (etiqueta de directorio 23999); config openpi `pi0_items_handover_lora_b2` |
| Estadisticas de normalizacion | sha256 `cae91c7b9df3ff7a87f8caa67967e7ec609e70b8952dcff44a561098036c5135` |
| Dataset de entrenamiento | `RoboSynChallenge/cobotmagic_Sim_items_handover` (LeRobot v2.1) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un fine-tune de tipo LoRA sobre el checkpoint `pi0_base` de openpi. Los adaptadores declarados son `gemma_2b_lora` y `gemma_300m_lora`, lo que confirma que la base incorpora los componentes PaliGemma/Gemma propios de π0. La inferencia se ejecuta mediante JAX y se integra en el simulador del RoboSynChallenge a través del adaptador `policy/smolvla_multitask` del repositorio, con `backend: pi0` y servidor de política en el entorno de `policy/pi05`.

La receta de entrenamiento consta de dos fases sobre el mismo dataset. Primero un fine-tune de 16000 pasos con schedule coseno (warmup 1000, pico 2,5e-5, decaimiento sobre 30000 pasos hasta 2,5e-6; AdamW, batch 32, semilla 42, action offset +1, prompt igual al texto de tarea del dataset). Después se continúa de 16000 a 24000 pasos con `--resume`, sobre los mismos datos, el mismo schedule, el mismo sampler y la misma semilla, sin cambios de hiperparámetros, objetivo ni datos. La tasa de aprendizaje era aproximadamente 1,314e-5 en el paso 16000 y aproximadamente 4,79e-6 en el paso 24000. No se documenta en la información disponible ningún cambio arquitectónico adicional (atención lineal, decodificación especulativa u otros) más allá del propio diseño de π0 y del uso de LoRA.

## Capacidades

- Generación de acciones robóticas ("action chunking") para control de un brazo dual CobotMagic en el simulador EmbodiChain.
- Ejecución de la tarea específica de entrega de objetos ("items_handover"), condicionada por el prompt de texto de la tarea.
- Condicionamiento multimodal implícito por imagen y texto, heredado de los componentes PaliGemma/Gemma de la base π0.
- Inferencia como servidor de política dentro del entorno `policy/pi05`, consumible por el adaptador `policy/smolvla_multitask` con `backend: pi0`.
- Soporte de tool calling / function calling: no disponible (no es una capacidad documentada para este modelo).
- Soporte de agentes y razonamiento multi-paso: no disponible (el modelo es una política robótica de tarea única).
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo de pensamiento, visión, audio): no disponibles más allá del condicionamiento visual/textual propio de π0.

## Casos de uso

- Evaluación de políticas robóticas en simulación: el checkpoint se integra en el simulador del RoboSynChallenge (EmbodiChain, CobotMagic) para ejecutar la tarea de entrega de objetos y medir tasas de éxito sobre escenas congeladas.
- Reproducción de experimentos de fine-tune con LoRA: sirve como referencia de un punto de entrenamiento a 24000 pasos obtenido por continuación (`--resume`) de un run previo de 16000 pasos con idéntico schedule.
- Investigación sobre selección de checkpoints y significación estadística: el caso ilustra cómo una ventaja de +4 éxitos sobre 50 escenas (p = 0,344) no supera un umbral preregistrado de 5, útil como ejemplo metodológico.
- Estudio de estabilidad numérica en GPU: dado que el autor documenta diferencias de nivel bf16 no reproducibles bit a bit entre procesos, el checkpoint puede emplearse para caracterizar esta variabilidad en pipelines JAX.
- Punto de partida para comparaciones pareadas 24k frente a 16k: la model card indica que esa prueba pareada directa queda como trabajo separado en el repositorio del proyecto.
- Referencia negativa en competición: se usa explícitamente como "riesgo documentado" en la entrega del RoboSynChallenge, en contraste con el checkpoint de 16k que sí pasó validación independiente.

## Benchmarks y rendimiento

Los datos de evaluación proceden de la model card y son internos, solo en simulador. Es importante no fusionar las tres afirmaciones siguientes, tal y como advierte el autor.

| Comparacion | Sistema A | Sistema B | Resultado | Significacion |
|---|---|---|---|---|
| 16k vs SmolVLA oficial (300 escenas congeladas) | pi0-robosyn-handover-16k | SmolVLA items_handover oficial | 187/300 vs 95/300 (+30,7 puntos) | McNemar exacta p = 3,9e-13 |
| 24k vs 16k (50 escenas de desarrollo) | pi0-robosyn-handover-24k | pi0-robosyn-handover-16k | 39/50 vs 35/50 (+8,0 puntos) | Newcombe 95% CI -4,3 a +20,2; McNemar p = 0,344 |
| 24k vs SmolVLA oficial | pi0-robosyn-handover-24k | SmolVLA items_handover oficial | nunca comparados directamente | no aplica |

Advertencias recogidas en la propia model card: el resultado de +30,7 puntos pertenece al checkpoint de 16k y no a este checkpoint; la comparación 24k vs 16k es evidencia de piscina de desarrollo y no superó el umbral preregistrado; y cualquier creencia de que el 24k también supera al checkpoint oficial sería una inferencia, no una medición. Cada comparación usó α = 0,05 por separado y sin corrección entre tareas, por lo que el conjunto de resultados no debe leerse como una tasa global de falsos positivos del 5%. Todos los sistemas comparados son pipelines completos con ejecución de acciones distinta, así que ninguna diferencia se atribuye al modelo base de forma aislada. No hay benchmarks tipo MMLU, HumanEval o GSM8K: no aplican a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como cifra concreta; el repositorio ocupa 6,2 GB, lo que da una cota inferior de memoria para almacenar los pesos.
- GPU recomendadas: no disponibles de forma explícita. El autor cita una RTX 4080 SUPER como hardware usado para medir latencia de un checkpoint de la misma arquitectura (el del cajón, "drawer"), no de este.
- Cabe en GPU de consumo: el dato de una RTX 4080 SUPER en un checkpoint de la misma arquitectura sugiere que es viable, pero la model card no confirma que este checkpoint concreto se haya ejecutado en GPU de consumo.
- Opciones de despliegue: openpi (JAX) como framework principal; servidor de política en el entorno `policy/pi05` y adaptador `policy/smolvla_multitask` con `backend: pi0`; librería `lerobot`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a esta política robótica.
- Latencia: la model card marca este dato como TODO para el adaptador de entrega. Como referencia de la misma arquitectura (checkpoint del cajón), la primera llamada tarda 74,7 s incluyendo la compilación de JAX en una RTX 4080 SUPER, y las llamadas posteriores alrededor de 0,15 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Resultado documentado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi0-robosyn-handover-24k (este) | no disponible | no disponible | 39/50 en piscina de desarrollo de 50 escenas frente al 16k | other (Gemma Terms) | HuggingFace, 0 descargas |
| pi0-robosyn-handover-16k | no disponible | no disponible | 187/300 frente a SmolVLA (+30,7 puntos, p = 3,9e-13), validado de forma independiente | other (Gemma Terms) | citado en la model card; el autor lo recomienda si se necesita una prueba independiente superada |
| SmolVLA items_handover (oficial) | no disponible | no disponible | 95/300 frente al 16k en el mismo test | no disponible en esta informacion | checkpoint oficial publicado, segun la model card |

Los tres sistemas son pipelines completos con ejecución de acciones distinta, por lo que las diferencias no se atribuyen al modelo base de forma aislada.

## Limitaciones y advertencias

- Solo simulación: entrenado y evaluado en una única tarea (entrega de objetos) dentro del simulador del RoboSynChallenge.
- Evidencia de selección, no validación: el checkpoint se eligió sobre el 16k con una ventaja de +4 éxitos que no cumplió el umbral preregistrado de 5; la model card lo describe como riesgo deliberado.
- Nunca comparado directamente con el checkpoint oficial de SmolVLA; el +30,7 puntos pertenece al 16k.
- Piscinas de desarrollo usadas repetidamente: no soportan afirmaciones de superioridad sobre la línea base oficial.
- Sin corrección por comparaciones múltiples (α = 0,05 por comparación), por lo que el conjunto de resultados no equivale a una tasa global de falsos positivos del 5%.
- Diferencias a nivel bf16: las salidas en GPU no son reproducibles bit a bit entre procesos.
- Licencia "other" con restricciones vinculantes: no se puede usar el modelo ni derivados para los usos prohibidos de la Gemma Prohibited Use Policy; quien redistribuya debe incluir los Gemma Terms of Use, el fichero NOTICE y marcar los ficheros modificados.
- Licencias de las entradas (por ejemplo, los datos de entrenamiento) marcadas como TODO y no resueltas en la model card.
- Model card en estado de borrador no publicado, con campos pendientes (latencia de inferencia, licencias de entrada).
- Idiomas, sesgos y riesgo de alucinación: no disponibles en la información proporcionada; al ser una política robótica de tarea única, estos conceptos no se documentan.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kolmann1231/pi0-robosyn-handover-24k
- Checkpoint de referencia recomendado por el autor: `pi0-robosyn-handover-16k` (referenciado en la model card; no se proporciona URL directa en la información disponible)
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
- Fichero `GEMMA_TERMS_OF_USE.txt` (snapshot de la versión modificada por última vez el 2026-04-01) y fichero `NOTICE`, incluidos en el repositorio
- Dataset de entrenamiento: `RoboSynChallenge/cobotmagic_Sim_items_handover` (LeRobot v2.1) (referenciado en la model card; no se proporciona URL directa en la información disponible)
- Repositorio del proyecto, con los adaptadores `policy/smolvla_multitask` y entorno `policy/pi05`, y donde se registran las pruebas pareadas 24k frente a 16k (referenciado en la model card; no se proporciona URL directa en la información disponible)
