# Pipe1213/act_obj_t3_n05

## Resumen

`Pipe1213/act_obj_t3_n05` es una política de imitación basada en ACT (Action Chunking with Transformers, Zhao et al., 2023) entrenada desde cero para una única tarea de manipulación robótica en simulación: "coger el pudin de chocolate y colocarlo en la cesta", correspondiente a la tarea con id 8 del benchmark LIBERO-Object. No es un modelo de lenguaje ni un VLA de propósito general: es un checkpoint experimental de 51,7 millones de parámetros publicado para hacer reproducible un estudio comparativo entre políticas entrenadas desde cero y modelos visión-lenguaje-acción preentrenados.

El modelo forma parte de la comparativa [vla-vs-scratch](https://github.com/Pipe1213/vla-vs-scratch), que enfrenta ACT entrenado con pocas demostraciones (5 episodios) contra SmolVLA ajustado con las mismas demostraciones. Su relevancia es metodológica: documenta con precisión cómo una política pequeña entrenada desde cero con datos escasos rinde muy por debajo de un VLA preentrenado en la misma tarea (14 % frente a 78 % de éxito agregado en el estudio), y sirve como referencia reproducible para quien quiera replicar o extender ese análisis.

El checkpoint publicado en la raíz del repositorio corresponde al paso 10.000 de entrenamiento (12 % de éxito sobre 50 escenas fijas). La model card advierte explícitamente de que no debe usarse como política de propósito general ni en un robot real: solo se ha evaluado en simulación MuJoCo sobre una tarea concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con encoder de imagen ResNet-18 y decodificador de acciones por chunks |
| Parametros totales | 51.671.687 (51,7 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: política de control robótico, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no procesa lenguaje; la tarea está fijada en el entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es una arquitectura de imitación diseñada para predecir secuencias de acciones (chunks) en lugar de acciones individuales, lo que reduce el error de acumulación en tareas de manipulación. En este caso se usa la implementación por defecto de LeRobot 0.6.2: encoder de imagen ResNet-18 inicializado con pesos de ImageNet, chunks de 100 acciones y el resto de la red entrenada desde cero. La única modificación respecto a los valores por defecto es en evaluación: la política replanifica cada 10 acciones en lugar de ejecutar el chunk completo.

El entrenamiento se realizó sobre 5 episodios del dataset `lerobot/libero` (episodios 841, 910, 975, 1149 y 1210, revisión `a1aaacb7f6cd6ee5fb43120f673cebb0cfea7dd4`), con batch size 8, 10.000 pasos, checkpoint cada 2.000 pasos y semilla 1000. No hay RLHF, DPO ni ajuste fino posterior: es imitación supervisada pura sobre demostraciones. El coste computacional fue de 0,41 horas en una RTX 4050 de portátil (6 GB de VRAM). Los estados y acciones se normalizan con estadísticas del dataset completo `lerobot/libero`, no solo de los episodios seleccionados, siguiendo el comportamiento por defecto de LeRobot.

## Capacidades

- Control robótico de manipulación en simulación: predice chunks de 100 acciones a partir de observaciones de imagen (256×256) y estado del robot.
- Ejecución de una única tarea: "coger el pudin de chocolate y colocarlo en la cesta" (LIBERO-Object, task id 8).
- Replanificación cada 10 acciones durante la evaluación, lo que permite corregir desviaciones dentro del chunk.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües ni procesamiento de lenguaje: la instrucción está implícita en los pesos.
- No dispone de modo "thinking", visión general, audio ni generación de texto.

## Casos de uso

- Reproducción de experimentos de imitación robótica: sirve como checkpoint de referencia para replicar los resultados de ACT con 5 demostraciones en LIBERO-Object, usando los comandos de entrenamiento y evaluación documentados en la model card.
- Estudio comparativo ACT frente a VLA preentrenados: permite medir la brecha de rendimiento entre una política desde cero y SmolVLA con los mismos datos, en las mismas 50 escenas iniciales fijas.
- Análisis de variabilidad entre checkpoints: al publicar tres checkpoints (6.000, 8.000 y 10.000 pasos) con tasas de éxito de 6 %, 24 % y 12 %, es útil para estudiar la inestabilidad del entrenamiento de ACT y la necesidad de evaluar cada checkpoint antes de usarlo.
- Docencia y formación en aprendizaje por imitación: un modelo de 51,7 M de parámetros que se entrena en 0,41 h en una GPU de consumo resulta adecuado para prácticas sobre LeRobot, Action Chunking y evaluación en MuJoCo.
- Baseline para nuevas políticas: cualquier método nuevo sobre LIBERO-Object puede compararse contra este resultado (14 % medio en tres checkpoints, intervalo de Wilson del 95 % entre 9 % y 20 %).
- Validación de pipelines de evaluación en LeRobot: el comando `lerobot-eval` documentado permite comprobar la integración de entornos LIBERO, renderizado MuJoCo y políticas ACT en un flujo reproducible.
- Investigación sobre datos escasos: cuantifica el rendimiento alcanzable con solo 5 demostraciones por tarea, información relevante para decidir cuándo merece la pena recurrir a un VLA preentrenado.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre las 50 escenas iniciales fijas de LIBERO (estados iniciales 0 a 49), 50 episodios por checkpoint, imágenes de 256×256, replanificación cada 10 acciones y semilla de evaluación 1000:

| Checkpoint (paso) | Éxitos | Tasa de éxito |
|---|---:|---:|
| 6.000 | 3 de 50 | 6 % |
| 8.000 | 12 de 50 | 24 % |
| 10.000 (checkpoint publicado) | 6 de 50 | 12 % |
| Media de los 3 checkpoints | 21 de 150 | 14 % (intervalo de Wilson del 95 %: 9-20 %) |

Contexto agregado del estudio (3 tareas y todas las semillas de entrenamiento): ACT con 5 demostraciones por tarea obtuvo 17,9 %, mientras que SmolVLA con las mismas demostraciones obtuvo 78 %. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el modelo tiene 51,7 M de parámetros (unos 0,2 GB en fp32), por lo que cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; el entrenamiento documentado se completó en una RTX 4050 de portátil con 6 GB.
- Cabe en GPU de consumo: sí, en cualquier modelo moderno (RTX 3050 o superior, e incluso en iGPU con suficiente memoria).
- Opciones de despliegue: LeRobot (`lerobot-eval`) con entorno LIBERO y renderizado MuJoCo; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas.
- Latencia y throughput: no disponibles. La evaluación se realizó con `--eval.batch_size=1` y renderizado MuJoCo en CPU (WSL2), pero no se publican cifras de latencia ni de acciones por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT (este modelo) | 51,7 M | Imagen 256×256 + estado; sin lenguaje | 14 % medio (3 checkpoints, 5 demos) | Apache 2.0 | Hugging Face (LeRobot) |
| SmolVLA (referencia del estudio) | no disponible en la información | Visión + lenguaje + estado | 78 % con las mismas 5 demos (agregado del estudio) | no disponible en la información | no disponible en la información |
| ACT con más demostraciones (estudio) | 51,7 M | Igual que este modelo | 17,9 % agregado con 5 demos en 3 tareas | Apache 2.0 | Repositorio del estudio |

La comparación directa con SmolVLA no es limpia, tal como advierte el propio autor: difieren en preentrenamiento, tamaño, arquitectura y entrada de lenguaje, por lo que la brecha no puede atribuirse únicamente al preentrenamiento. No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo simulación: no se ha probado en un robot real y no debe desplegarse en hardware físico sin validación adicional.
- Una única tarea de un único benchmark (LIBERO-Object, task id 8); no generaliza a otras instrucciones ni objetos.
- Las 3 tareas del estudio se eligieron entre las que un checkpoint publicado de SmolVLA ya resolvía, por lo que los resultados describen esas tareas concretas.
- Los estados y acciones se normalizan con estadísticas del dataset completo `lerobot/libero`, no solo de las 5 demostraciones seleccionadas.
- ACT se usó con los valores por defecto de LeRobot, sin ajuste específico para esta tarea.
- Alta variabilidad entre checkpoints del mismo entrenamiento: en 30 de 36 ejecuciones de ACT del estudio los checkpoints rinden de forma muy distinta; es imprescindible evaluar cada checkpoint antes de usarlo.
- El intervalo de Wilson del 14 % cubre solo el muestreo de evaluación; las diferencias entre semillas de entrenamiento son mayores.
- Riesgo de alucinación no aplica en el sentido de los LLM, pero sí existe riesgo de acciones erráticas fuera de la distribución de las demostraciones.
- Sesgos conocidos: no documentados en la información disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo no está pensado para producción y su rendimiento (12 % en el checkpoint publicado) lo desaconseja.
- El checkpoint de la raíz del repositorio es el de 10.000 pasos (12 %), no el mejor (8.000 pasos, 24 %); para usar el mejor resultado hay que descargar `checkpoints/008000/pretrained_model`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pipe1213/act_obj_t3_n05
- Repositorio del estudio vla-vs-scratch: https://github.com/Pipe1213/vla-vs-scratch
- Resultados completos del estudio: https://github.com/Pipe1213/vla-vs-scratch#results
- Análisis del estudio: https://github.com/Pipe1213/vla-vs-scratch/blob/main/results/analysis.md
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/libero
- Paper de ACT (Zhao et al., 2023): no disponible en la información proporcionada
- Documentación de LeRobot: no disponible en la información proporcionada
