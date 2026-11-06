# jiajinda/so101-03-pi05-red-block-to-target-v234

## Resumen

El modelo `so101-03-pi05-red-block-to-target-v234`, publicado por el usuario jiajinda en Hugging Face, es un ajuste fino (fine-tune) de la politica robotica π0.5 (pi0.5) desarrollada por Physical Intelligence. Se trata de un modelo de vision-lenguaje-accion (VLA) orientado a control robotico, entrenado especificamente para una tarea de manipulacion con un brazo SO-101: recoger un bloque rojo y colocarlo sobre una diana marcada con una X. El modelo parte del checkpoint base `pi05_base` y se ha adaptado mediante clonacion de comportamiento (behavior cloning) sobre episodios grabados con LeRobot.

La arquitectura subyacente es `Pi0Config(pi05=True, action_horizon=50)`, que combina un backbone PaliGemma (Gemma 2B) con un experto de acciones de 300M de parametros, sumando un total de 3.353.433.872 parametros entrenables. El modelo opera con un horizonte de accion de 50 pasos, dimension de accion 32 (de la que se usan 6), longitud maxima de token de 200 y computo en bfloat16 con parametros en float32.

Es relevante ahora porque ilustra el flujo tipico de adaptacion de modelos VLA de proposito general a tareas concretas de robotica de bajo coste (brazo SO-101 de LeRobot), con toda la trazabilidad del entrenamiento documentada. No obstante, el propio autor advierte que el entrenamiento esta en curso, que no se ha evaluado en hardware ni con evaluacion offline sobre conjuntos reservados, y que la perdida de entrenamiento por si sola no demuestra exito en la tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-lenguaje-accion) basada en PaliGemma (Gemma 2B) + experto de acciones; `Pi0Config(pi05=True, action_horizon=50)` |
| Parametros totales | 3.353.433.872 (fine-tune completo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | max_token_len 200 |
| Tipos de cuantizacion | no disponible (pesos en float32, computo en bfloat16) |
| Idiomas soportados | no disponible (prompt de tarea en ingles) |
| Licencia | gemma |
| Formato de pesos | Orbax (JAX), parametros en float32 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura π0.5 de Physical Intelligence: un backbone de vision-lenguaje PaliGemma basado en Gemma 2B combinado con un experto de acciones de 300M de parametros que genera secuencias de acciones con un horizonte de 50 pasos. La dimension de accion es 32 (se usan 6), la longitud maxima de token es 200, el computo se realiza en bfloat16 y los parametros se almacenan en float32. El framework es OpenPI (JAX 0.5.3, commit `215abfb217dbac7d5f1273282331b9b1866c0479`) sin modificaciones, con el driver `code/scripts/train_so101.py`.

El entrenamiento es una clonacion de comportamiento en dos fases. La primera (SO101-01) fue un fine-tune completo sobre el dataset `red-block-to-target-v2` (8 episodios de entrenamiento, batch 16, 5.000 actualizaciones de un calendario coseno de 10.000), con el prompt "red-block-to-target-v2". La segunda (SO101-03, la que corresponde a estos checkpoints) continua desde los pesos EMA del paso 5.000 de SO101-01 y hace un fine-tune completo sobre la union de v2+v3+v4 (40 episodios de entrenamiento, 20.919 muestras), con batch 16, optimizador AdamW nuevo (b1 0.9, b2 0.95, eps 1e-8, weight decay 1e-10, clipping de norma global 1.0), calentamiento lineal de 100 actualizaciones hasta 1e-5 y decaimiento coseno hasta 1e-6 en la actualizacion 10.000. Cada muestra de entrenamiento es un unico frame: imagenes y estado en el frame t, objetivo = acciones t…t+49 del mismo episodio (los indices mas alla del final repiten la ultima accion, 4,7 % de los pasos, sin enmascarar en la perdida). Las acciones de las articulaciones 0–4 se expresan como deltas respecto al estado actual (todo el chunk) y el gripper en absoluto; la politica emite objetivos absolutos. La normalizacion se recalculo por cuantiles sobre los 40 episodios tras la transformacion de acciones delta (las estadisticas solo de v2 dejarian ~19 % de los estados de shoulder-pan de v3/v4 fuera de [−1, 1]). Se aplico aumento de datos integrado en OpenPI (solo en entrenamiento): recorte aleatorio al 95 % + redimensionado + rotacion ±5° en la imagen cenital y jitter de color en todas las imagenes. El entrenamiento se ejecuto en 1× H100 80GB, con 0,907 s/actualizacion y 71,7 GB de pico.

## Capacidades

- Generacion de acciones roboticas: produce trayectorias de 50 pasos (horizonte de accion) para un brazo SO-101 a partir de observaciones visuales y de estado.
- Percepcion visual multimodal: procesa dos camaras (`front` cenital y `gripper` de muneca) a 480×640 y 30 fps.
- Condicionamiento por instruccion en lenguaje natural: la tarea se especifica mediante el prompt "Pick up the red block and place it on the X-marked target."
- Control de brazo de 6 grados de libertad: articulaciones 0–4 como deltas, gripper en absoluto.
- Clonacion de comportamiento: imita demostraciones grabadas con LeRobot v3.0.
- No dispone de tool calling ni function calling: es un modelo de politica robotica, no un LLM conversacional.
- No dispone de soporte de agentes ni razonamiento multi-paso en el sentido de LLM.
- Capacidades multilingues: no disponible; el prompt de entrenamiento esta en ingles.
- No dispone de modo thinking, vision general, audio ni otras capacidades especiales mas alla de la politica VLA.

## Casos de uso

- Manipulacion pick-and-place de laboratorio: el modelo ejecuta la tarea concreta de recoger un bloque rojo y depositarlo en una diana marcada, adecuado para prototipos de robotica de bajo coste con brazo SO-101.
- Investigacion en clonacion de comportamiento: sirve como referencia reproducible de un pipeline completo de fine-tune de π0.5 sobre datos LeRobot, con configuracion resuelta, comandos y metricas de entrenamiento documentados.
- Base para nuevos fine-tunes: al partir de `pi05_base` y estar documentada la cadena de linaje, puede usarse como punto de partida (parent) para adaptar la politica a otras tareas de manipulacion.
- Docencia y formacion en robotica VLA: permite estudiar el efecto del numero de episodios, el recalculo de estadisticas de normalizacion y el uso de prompts unificados en el rendimiento de una politica.
- Evaluacion comparativa de estrategias de aumento de datos: el registro de configuracion permite reproducir y comparar el impacto de recorte, rotacion y jitter de color en tareas de agarre.
- Pruebas de integracion con OpenPI y JAX: util para validar infraestructura de inferencia Orbax/JAX en entornos de investigacion antes de desplegar en hardware.
- No recomendado para produccion: al no haberse evaluado en hardware ni sobre conjuntos reservados, no es adecuado para aplicaciones comerciales o de seguridad critica sin validacion adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el modelo no se ha evaluado en hardware ni con evaluacion offline sobre conjuntos reservados, y que la perdida de entrenamiento por si sola no demuestra exito en la tarea. Los unicos datos de rendimiento documentados son de entrenamiento: 0,907 s/actualizacion y 71,7 GB de pico de memoria en 1× H100 80GB, con batch 16.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el entrenamiento con batch 16 alcanzo 71,7 GB de pico en una H100 de 80 GB. La inferencia con batch menor requerira menos memoria, pero no se documenta una cifra concreta.
- GPU recomendadas: H100 80GB (validada para entrenamiento); para inferencia se desconoce el minimo, aunque por el tamano (3.353 M de parametros en float32) es plausible que quepa en GPUs de mayor VRAM, sin dato confirmado.
- Cabe en GPU de consumo: no disponible; no se ha verificado.
- Opciones de despliegue: OpenPI (JAX/Orbax) es el framework nativo; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para este tipo de politica VLA.
- Latencia y throughput: no disponibles para inferencia; en entrenamiento, 0,907 s/actualizacion con batch 16 en H100.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| so101-03-pi05-red-block-to-target-v234 | 3.353 M | max_token_len 200 | gemma | Hugging Face (jiajinda) | Fine-tune de π0.5 para tarea concreta SO-101 |
| π0.5 base (Physical Intelligence) | no disponible en la informacion | no disponible | no disponible | checkpoint `pi05_base` (gs://openpi-assets) | Modelo base del que deriva este fine-tune |
| SO101-01 step 5000 (parent) | 3.353 M | max_token_len 200 | gemma | Hugging Face (jiajinda) | Fine-tune previo sobre v2, incluido como parent |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenamiento en curso: solo se han publicado los checkpoints hasta la actualizacion 2.000 de las 10.000 planificadas.
- Sin evaluacion en hardware ni offline sobre conjuntos reservados: la perdida de entrenamiento no demuestra exito en la tarea.
- Sesgos conocidos: no disponibles; al entrenarse sobre 40 episodios de un unico entorno y tarea, es probable un sobreajuste al escenario especifico (no confirmado).
- Riesgo de alucinacion: no aplica en el sentido de LLM, pero la politica puede generar acciones no validas fuera de la distribucion de entrenamiento.
- Limitaciones de contexto e idioma: max_token_len 200 y prompt de entrenamiento unicamente en ingles.
- Restricciones de licencia: licencia `gemma`; el uso comercial esta sujeto a los terminos de la licencia Gemma, que deben revisarse antes de cualquier despliegue productivo.
- Caveat para produccion: no apto para produccion sin validacion adicional en hardware, evaluacion sobre conjuntos reservados y analisis de seguridad.
- Dependencia de OpenPI/JAX/Orbax: el formato de pesos no es directamente compatible con stacks de inferencia LLM convencionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jiajinda/so101-03-pi05-red-block-to-target-v234
- Dataset v2: https://huggingface.co/datasets/jiajinda/red-block-to-target-v2
- Dataset v3: https://huggingface.co/datasets/jiajinda/red-block-to-target-v3
- Dataset v4: https://huggingface.co/datasets/jiajinda/red-block-to-target-v4
- OpenPI (framework): no disponible en la informacion proporcionada
- Physical Intelligence π0.5: no disponible en la informacion proporcionada
