# helenlu94/pi05-libero-goal-matched-discrete-lora

## Resumen

`pi05-libero-goal-matched-discrete-lora` es un checkpoint de ajuste fino (fine-tuning) del modelo base pi0.5 de Physical Intelligence, un modelo de vision-lenguaje-accion (VLA) orientado al control de robots manipuladores. Lo publica el usuario helenlu94 en Hugging Face como parte de una familia de experimentos sobre el benchmark LIBERO Goal, y en concreto este checkpoint corresponde a la variante con adaptadores LoRA y discretizacion de acciones (`pi05_matched_lora_discrete`) del framework openpi.

El modelo parte de los pesos `pi05_base` (no del checkpoint ya ajustado para LIBERO) y se entrena sobre un dataset propio de 150 escenas y 11 tareas con imagenes PNG embebidas sin perdida en formato LeRobot v2.1. El checkpoint publicado es el mejor por validacion (step 76000, validation loss 0.00122) y alcanza un 0.945 de tasa de exito en simulacion sobre escenas retenidas, lo que lo convierte en el mejor resultado de la familia de experimentos `matched` del autor.

Su relevancia es doble: por un lado demuestra que un ajuste fino con LoRA sobre pi0.5 puede igualar o superar a un fine-tuning completo en esta tarea concreta; por otro, sirve como referencia reproducible para quien quiera evaluar politicas VLA en LIBERO Goal con el stack openpi.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-lenguaje-accion) pi0.5 con adaptadores LoRA; no se detalla la arquitectura interna en la informacion disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos de inferencia en `params/`, sin detallar precision) |
| Idiomas soportados | no disponible (modelo orientado a instrucciones de tarea, no a dialogo general) |
| Licencia | no disponible |
| Formato de pesos | pesos de inferencia openpi en `params/` y estadisticas de normalizacion en `assets/` (no se especifica safetensors/GGUF) |

## Arquitectura y entrenamiento

El modelo se basa en pi0.5, un VLA de Physical Intelligence que combina un backbone de vision-lenguaje con un cabezal de generacion de acciones. En esta variante concreta se aplican adaptadores LoRA sobre los pesos base `pi05_base` y se usa una configuracion de acciones discretizadas (`pi05_matched_lora_discrete`), a diferencia de la variante continua `pi05_matched_lora`.

El entrenamiento se realizo sobre el dataset `helenlu94/libero_goal_matched_150_multi_pick_place_targets_lerobot_v21_lossless`, con 150 escenas y 11 tareas de LIBERO Goal, en formato LeRobot v2.1 con imagenes PNG embebidas sin perdida y el mismo layout que `physical-intelligence/libero`. El autor aplica early stopping sobre escenas retenidas y selecciona el checkpoint por tasa de exito en simulador (15 escenas x 11 tareas, headless), no solo por perdida de validacion. El entrenamiento se ejecuto con el commit `7190119d04a3acd534f3e53caa6b567d353c5fdf` de openpi y se registro en el proyecto de W&B `VLA Embeddings Analysis` (run `6q145bdn`). No se especifican el numero de tokens, la composicion exacta del dataset ni si hubo RLHF o DPO.

## Capacidades

- Control de robot manipulador a partir de instrucciones en lenguaje natural e imagenes de camara, dentro del paradigma VLA.
- Ejecucion de tareas de LIBERO Goal: 11 tareas de pick-and-place con objetivos especificados.
- Generalizacion a escenas retenidas del mismo dominio (escenas "matched" no vistas durante el entrenamiento).
- Acciones discretizadas, lo que puede facilitar el modelado de la distribucion de acciones frente a la variante continua.
- Integracion con el stack openpi mediante `serve_policy.py` para servir la politica como endpoint.
- No se documentan capacidades de tool calling, agentes multi-paso, vision general, audio ni modo thinking; es un modelo especializado en robotica, no un LLM de proposito general.
- Capacidades multilingues: no documentadas; las instrucciones de tarea dependen del dataset de entrenamiento.

## Casos de uso

- Evaluacion reproducible en LIBERO Goal: servir el checkpoint con `serve_policy.py policy:checkpoint --policy.config pi05_matched_lora_discrete --policy.dir <dir>` y medir tasa de exito en las 15 escenas x 11 tareas retenidas, replicando el 0.945 reportado.
- Baseline para investigacion en VLA: comparar LoRA con discretizacion frente a las variantes `matched_lora` (continua) y `matched_full` del mismo autor para aislar el efecto de cada decision de diseno.
- Estudio de eficiencia de adaptacion: al ser un ajuste LoRA sobre `pi05_base`, permite analizar cuanto rendimiento se obtiene con un subconjunto de parametros entrenables frente a un fine-tuning completo.
- Prototipado de politicas de pick-and-place: usar el modelo como politica inicial en entornos simulados con objetos y objetivos similares a LIBERO Goal antes de transferir a un setup real.
- Analisis de embeddings y representaciones: el run de W&B asociado (`VLA Embeddings Analysis`) sugiere su uso para estudiar como evolucionan las representaciones internas durante el entrenamiento.
- Docencia y demos de robotica con VLA: el checkpoint es ligero en comparacion con un fine-tuning completo y se puede servir con openpi para demostrar el pipeline completo de una politica VLA.
- Seleccion de checkpoints por metrica de tarea: sirve como ejemplo metodologico de early stopping guiado por tasa de exito en simulador en lugar de solo por perdida de validacion.

## Benchmarks y rendimiento

Los unicos datos publicados son la tasa de exito en simulador y la perdida de validacion a lo largo del entrenamiento. Se reproducen los hitos mas relevantes de la tabla del autor:

| Step | Tasa de exito | Val loss |
|---|---|---|
| 2000 | 0.412 | 0.00914 |
| 10000 | 0.733 | 0.00306 |
| 30000 | 0.897 | 0.00154 |
| 50000 | 0.903 | 0.00133 |
| 62000 | 0.933 | 0.00120 |
| 68000 | 0.921 | 0.00124 |
| 72000 | 0.915 | 0.00109 |
| 76000 (seleccionado) | 0.945 | 0.00122 |
| 78000 | 0.873 | 0.00113 |
| 79999 | 0.867 | 0.00110 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible; no aplican a un modelo de este tipo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El repositorio ocupa 6.3 GB, lo que da una cota inferior del espacio en disco necesario para los pesos y assets.
- GPU recomendadas: no disponible. Al tratarse de un VLA con backbone de vision-lenguaje, se requiere una GPU con memoria suficiente para el modelo base pi0.5 mas los adaptadores LoRA; no se especifica cual.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: el autor indica servirlo con el script `serve_policy.py` de openpi usando la configuracion `pi05_matched_lora_discrete`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

El autor publica una familia de checkpoints comparables sobre el mismo dataset y protocolo de evaluacion:

| Modelo | Configuracion | Step seleccionado | Tasa de exito | Val loss |
|---|---|---|---|---|
| pi05-libero-goal-matched-discrete-lora (este) | pi0.5 + LoRA, acciones discretas | 76000 | 0.945 | 0.00122 |
| pi05-libero-goal-matched-lora | pi0.5 + LoRA, acciones continuas | 18000 | 0.897 | 0.00196 |
| pi05-libero-goal-matched-full | pi0.5 fine-tuning completo, EMA 0.999 | 44000 | 0.927 | 0.00117 |

En la informacion disponible no se comparan con otros modelos VLA externos (por ejemplo, OpenVLA u otros), por lo que no se incluyen datos de terceros.

## Limitaciones y advertencias

- Dominio muy restringido: entrenado exclusivamente en LIBERO Goal (11 tareas de pick-and-place); no se espera generalizacion fuera de ese entorno sin nuevo ajuste.
- El 0.945 de tasa de exito se mide en simulador sobre escenas retenidas del mismo dominio; no hay evidencia de transferencia a robot real.
- La seleccion del checkpoint se hizo sobre las mismas escenas retenidas usadas para reportar el resultado, lo que puede introducir un sesgo optimista en la metrica.
- Licencia no especificada: no se puede confirmar el uso comercial. Ademas, los pesos derivan de pi0.5, cuyos terminos de uso deben verificarse por separado.
- No hay informacion sobre sesgos, alucinacion (en el sentido de generar acciones no validas) ni limitaciones de contexto o idioma.
- El repositorio no documenta la precision de los pesos ni el formato exacto, lo que complica estimar requisitos de memoria.
- Sin descargas ni likes en el momento de la consulta: no hay validacion independiente por parte de la comunidad.
- El checkpoint esta ligado a un commit concreto de openpi; cambios en el framework pueden romper la compatibilidad de `serve_policy.py`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/helenlu94/pi05-libero-goal-matched-discrete-lora
- Variante LoRA continua: https://huggingface.co/helenlu94/pi05-libero-goal-matched-lora
- Variante fine-tuning completo: https://huggingface.co/helenlu94/pi05-libero-goal-matched-full
- Dataset de entrenamiento: `helenlu94/libero_goal_matched_150_multi_pick_place_targets_lerobot_v21_lossless` (referenciado en la model card; no se proporciona URL directa)
- Repositorio openpi: no disponible en la informacion proporcionada (commit de referencia `7190119d04a3acd534f3e53caa6b567d353c5fdf`)
- W&B: proyecto `VLA Embeddings Analysis`, run `6q145bdn` (sin URL directa en la informacion proporcionada)
