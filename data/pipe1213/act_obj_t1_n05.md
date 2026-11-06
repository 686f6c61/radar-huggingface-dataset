# Pipe1213/act_obj_t1_n05

## Resumen

Pipe1213/act_obj_t1_n05 es una política de robótica basada en ACT (Action Chunking Transformer, Zhao et al., 2023) entrenada desde cero para una única tarea de manipulación en simulación: "coger la salsa BBQ y colocarla en la cesta". Forma parte del estudio reproducible vla-vs-scratch, que compara un modelo visión-lenguaje-acción preentrenado y ajustado (SmolVLA) con una política entrenada desde cero (ACT) sobre exactamente las mismas pocas demostraciones. El modelo se publica para hacer reproducible el estudio, no como política de propósito general.

La arquitectura es un transformer con 51,67 millones de parámetros y un codificador de imágenes ResNet-18 inicializado con pesos de ImageNet; el resto de pesos se entrena desde cero sobre cinco episodios del dataset lerobot/libero. Predice trozos (chunks) de 100 acciones y, en evaluación, replanifica cada 10 acciones. El entrenamiento completo requirió 0,58 horas en una GPU de portátil RTX 4050 con 6 GB de VRAM.

Su relevancia es metodológica: cuantifica cuánto rinde una política desde cero frente a un VLA preentrenado en el régimen de pocas demostraciones. En este punto de control concreto (paso 10.000, semilla 1000), ACT alcanza un 28% de éxito en 50 escenas fijas, frente al 78% agregado de SmolVLA en el estudio. Es un artefacto de investigación acotado, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) con codificador ResNet-18 |
| Parametros totales | 51.671.687 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; usa observaciones de imagen 256x256 y estado del robot) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no procesa lenguaje de forma nativa; la tarea está fijada) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un transformer que predice secuencias de acciones (chunks) a partir de observaciones visuales y del estado del robot, con un codificador de imágenes ResNet-18 inicializado desde pesos de ImageNet. La cabeza de acciones genera chunks de 100 acciones; en evaluación la política replanifica cada 10 acciones en lugar de ejecutar el chunk completo. El modelo tiene 51,67 millones de parámetros y todo el cuerpo, salvo el codificador visual, se entrena desde cero.

El entrenamiento usa LeRobot 0.6.2 (commit b9cb121) con los ajustes por defecto de ACT, batch de 8, 10.000 pasos, checkpoint cada 2.000 pasos y semilla 1000. Los datos son cinco episodios del dataset lerobot/libero (revisión a1aaacb7f6cd6ee5fb43120f673cebb0cfea7dd4): 889, 893, 932, 1067 y 1077. La tarea es LIBERO-Object, id 3: "pick up the bbq sauce and place it in the basket". Los estados y acciones se normalizan con estadísticas de todo el dataset lerobot/libero, no solo de las demostraciones seleccionadas. No hay RLHF ni DPO: es aprendizaje por imitación supervisado.

## Capacidades

- Manipulación robótica de una única tarea en simulación: coger la salsa BBQ y depositarla en la cesta (LIBERO-Object, tarea 3).
- Predicción de acciones en chunks de 100 pasos con replanificación cada 10 acciones.
- Procesamiento de observaciones visuales a 256x256 píxeles y del estado del robot.
- Aprendizaje por imitación con muy pocas demostraciones (5 episodios).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni planificación de agentes.
- No tiene capacidades multilingües ni entrada de lenguaje.
- No dispone de modo de razonamiento, visión general, audio ni otras capacidades especiales.

## Casos de uso

- Reproducción de experimentos de investigación: sirve para replicar el resultado de ACT con 5 demostraciones en LIBERO-Object tarea 3 y compararlo con SmolVLA bajo las mismas condiciones.
- Estudio de políticas desde cero frente a VLA preentrenados: permite analizar la brecha de rendimiento (14,7% de media en ACT frente a 78% de SmolVLA en el estudio) en el régimen de pocas demostraciones.
- Línea base en experimentos de aprendizaje por imitación: se puede usar como referencia de un ACT con ajustes por defecto y sin afinado para la tarea.
- Análisis de variabilidad entre checkpoints: el repositorio incluye checkpoints en los pasos 6.000, 8.000 y 10.000, lo que permite estudiar cómo fluctúa el éxito (6%, 10% y 28%) dentro de una misma ejecución.
- Docencia y formación en robótica: ejemplo mínimo y reproducible (entrenamiento en 0,58 h en una RTX 4050) para ilustrar el pipeline de LeRobot con ACT y MuJoCo.
- Validación de infraestructura de evaluación: el comando lerobot-eval con libero_object y estados iniciales fijos sirve para verificar cadencias de evaluación en simulación.
- No es adecuado para despliegue en robot real ni para tareas distintas de la entrenada.

## Benchmarks y rendimiento

Evaluación sobre las 50 escenas iniciales fijas de la tarea (estados iniciales 0 a 49 de LIBERO), idénticas para todos los modelos del estudio.

| Checkpoint (paso) | Éxitos | Tasa de éxito |
|---|---:|---:|
| 6.000 | 3 de 50 | 6% |
| 8.000 | 5 de 50 | 10% |
| 10.000 (raíz del repo) | 14 de 50 | 28% |
| Media de los 3 checkpoints | 22 de 150 | 14,7% (intervalo de Wilson 95%: 10-21%) |

Contexto del estudio: agregando las 3 tareas y todas las semillas, ACT con 5 demostraciones por tarea obtiene 17,9% y SmolVLA con las mismas demostraciones, 78%.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida por el tamaño (51,67 M de parámetros); el entrenamiento completo cupo en una RTX 4050 de 6 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 4050 o superior) es suficiente; no requiere A100 ni H100.
- Cabe en GPU consumer: sí, el entrenamiento se realizó en una RTX 4050 de 6 GB.
- Opciones de despliegue: LeRobot (lerobot-eval) con entorno MuJoCo para simulación; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles; la evaluación usó renderizado MuJoCo en CPU (WSL2), batch de 1 y 50 episodios por checkpoint. El entrenamiento tardó 0,58 h para 10.000 pasos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento (estudio) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT (este modelo) | 51,67 M | Imagen 256x256 + estado; sin lenguaje | 14,7% de media (28% en el paso 10.000) | apache-2.0 | Hugging Face (Pipe1213/act_obj_t1_n05) |
| SmolVLA (referencia del estudio) | no disponible en la información | VLA con entrada de lenguaje | 78% con las mismas demostraciones | no disponible en la información | no disponible en la información |
| ACT con 5 demostraciones (agregado del estudio) | 51,67 M (configuración LeRobot) | Imagen + estado | 17,9% en 3 tareas y todas las semillas | apache-2.0 (este repo) | Hugging Face y GitHub del estudio |

La comparación directa con otros modelos de la misma categoría (otras políticas ACT o VLA para LIBERO) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Solo simulación y una única tarea de un único benchmark; no se ha probado en un robot real.
- El estudio compara dos métodos tal como se usan en la práctica; SmolVLA y ACT difieren en preentrenamiento, tamaño, arquitectura y entrada de lenguaje, por lo que la brecha no puede atribuirse solo al preentrenamiento.
- Las 3 tareas se eligieron entre tareas de LIBERO-Object que un checkpoint publicado de SmolVLA ya resolvía, así que los resultados describen esas tareas.
- Los estados y acciones se normalizan con estadísticas de todo el dataset lerobot/libero, no solo de las demostraciones seleccionadas.
- ACT usó los valores por defecto de LeRobot y no se ajustó para esta tarea.
- Los checkpoints de una misma ejecución rinden de forma muy distinta (en 30 de 36 ejecuciones de ACT del estudio); hay que evaluar un checkpoint antes de usarlo.
- Riesgo de alucinación no aplica en el sentido de lenguaje, pero sí de generalización: la política puede fallar o comportarse de forma errática fuera de las condiciones de entrenamiento.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia apache-2.0, que permite uso comercial, pero el modelo no está pensado ni validado para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pipe1213/act_obj_t1_n05
- Repositorio del estudio: https://github.com/Pipe1213/vla-vs-scratch
- Resultados completos: https://github.com/Pipe1213/vla-vs-scratch#results
- Análisis: https://github.com/Pipe1213/vla-vs-scratch/blob/main/results/analysis.md
- Dataset: https://huggingface.co/datasets/lerobot/libero
- Paper de ACT (Zhao et al., 2023): no disponible en la información proporcionada
